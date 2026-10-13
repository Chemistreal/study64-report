#!/usr/bin/env python3
"""Read-only G20 coverage, replacement and source gate check. Standard library only.

Run from study: python3 eng2p/docs/parts/G20_check.py
Or: --study-root <study> --outputs-dir <parts>. Missing transcripts fail explicitly.
This validates structural text, not the truth of editorial or native-speaker judgments.
"""
import argparse
import copy
import csv
import hashlib
import json
import re
import sys
from pathlib import Path


def rows(path, width):
    result = []
    for n, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
        if not line.startswith('|'):
            continue
        cells = [x.strip() for x in line.strip().strip('|').split('|')]
        if cells[0] == 'id' or all(re.fullmatch(r'[- :]+', x) for x in cells):
            continue
        if len(cells) != width:
            raise ValueError('%s:%d: expected %d columns, got %d' % (path.name, n, width, len(cells)))
        result.append(cells)
    return result


def allowed_chars(text):
    return all(ord(c) < 128 or '\uac00' <= c <= '\ud7a3' or '\u1100' <= c <= '\u11ff'
               or '\u3130' <= c <= '\u318f' or c in '‘’“”…·→°' for c in text)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--study-root', type=Path, default=Path(__file__).resolve().parents[3])
    parser.add_argument('--outputs-dir', type=Path, default=Path(__file__).resolve().parent)
    args = parser.parse_args()
    failures = []
    def fail(message):
        failures.append(message)
    review_count = 0
    try:
        scripts = args.study_root.resolve() / 'eng2p/scripts'
        sys.path.insert(0, str(scripts))
        sys.dont_write_bytecode = True
        import authored_lib as lib
        source, source_errors = lib.parse_lines()
        for e in source_errors:
            fail('source: ' + e)
        if len(source) != 18:
            fail('source: expected 18 missions')
        transcripts = args.study_root / 'media/english/transcripts'
        if not transcripts.is_dir() or len(list(transcripts.glob('lle1-*.md'))) != 52:
            raise ValueError('missing 52 source transcripts; restore from current transcripts.json in a scratch copy')
        outdir = args.outputs_dir
        review_path = outdir / 'G20_review.md'
        proposal_path = outdir / 'G20_proposals.md'
        coverage_path = outdir / 'G20_coverage.csv'
        for p in [review_path, proposal_path, coverage_path]:
            raw = p.read_bytes()
            if len(raw) >= 800000 or b'\r' in raw or not raw.endswith(b'\n'):
                fail(p.name + ': size/LF/final newline')
            if not allowed_chars(raw.decode('utf-8')):
                fail(p.name + ': forbidden character')
        review = rows(review_path, 9)
        proposals = rows(proposal_path, 5)
        review_count = len(review)
        index = {}; owners = {}; primaries = {}; order = []
        for o in source:
            line_index = {x['id']: x for x in o['lines']}
            for key in ['lines', 'practice']:
                for x in o[key]:
                    i = x['id']
                    if i in index:
                        fail('source duplicate: ' + i)
                    index[i] = x; owners[i] = o
                    primaries[i] = x if key == 'lines' else line_index.get(x['line'])
        # Obtain the authoritative mission order from outings chapter 6.
        text = (args.study_root / 'eng2p/docs/outings.md').read_text(encoding='utf-8')
        section = text.split('## 6.', 1)[1].split('## 7.', 1)[0]
        for line in section.splitlines():
            match = re.search(r'`([^`]+)`', line)
            if '첫 공개' in line and match and match.group(1) in {o['id'] for o in source}:
                order.append(match.group(1))
        expected_order = [x['id'] for oid in order for o in source if o['id'] == oid
                          for key in ['lines', 'practice'] for x in o[key]]
        if [r[0] for r in review] != expected_order:
            fail('review: missing/duplicate/out-of-order source IDs')
        if len(review) != len(index):
            fail('review: expected %d rows, got %d' % (len(index), len(review)))
        rm = {}; pm = {}
        for r in review:
            i, en, ko, verdict, kind, new_en, new_ko, grade, reason = r
            if i in rm:
                fail('review duplicate: ' + i)
            rm[i] = r
            if i not in index:
                fail('review unknown ID: ' + i); continue
            original = index[i]
            if (en, ko) != (original['say'], original['ko']):
                fail(i + ': source English/Korean was not copied exactly')
            if verdict not in ['ok', 'change', 'unsure'] or grade not in ['A', 'B']:
                fail(i + ': invalid verdict/check')
            if not reason or reason == '-':
                fail(i + ': missing editorial reason')
            if verdict == 'unsure' and grade != 'B':
                fail(i + ': uncertainty must be B')
            if primaries[i]['check'] == 'B' and verdict != 'change' and grade != 'B':
                fail(i + ': original B hidden')
            if verdict == 'change':
                if new_en == '-' or new_ko == '-' or (new_en, new_ko) == (en, ko):
                    fail(i + ': change must contain both effective replacements')
            elif new_en != '-' or new_ko != '-':
                fail(i + ': non-change has replacement')
        for p in proposals:
            i, en, ko, grade, reason = p
            if i in pm:
                fail('proposal duplicate: ' + i)
            pm[i] = p
            if i not in index:
                fail('proposal unknown ID: ' + i); continue
            if i not in rm or rm[i][3] != 'change':
                fail(i + ': proposal is not a change review row'); continue
            original = index[i]; primary = primaries[i]
            effective = (original['say'] if en == '-' else en, original['ko'] if ko == '-' else ko)
            if effective != tuple(rm[i][5:7]) or grade != rm[i][7]:
                fail(i + ': proposal/review mismatch')
            if grade not in ['A', 'B'] or (grade == 'A' and reason != '-') or (grade == 'B' and (reason == '-' or len(reason) < 8)):
                fail(i + ': invalid English self-check reason')
            if en == '-' and (grade, reason) != (primary['check'], primary['why']):
                fail(i + ': Korean-only change altered source English check/reason')
            for old, new, name in [(original['say'], effective[0], 'English'), (original['ko'], effective[1], 'Korean')]:
                if sorted(re.findall(r'\{[^}]*\}', old)) != sorted(re.findall(r'\{[^}]*\}', new)):
                    fail(i + ': changed ' + name + ' slots')
        if set(pm) != {i for i, r in rm.items() if r[3] == 'change'}:
            fail('proposal/change ID sets differ')
        with coverage_path.open(encoding='utf-8', newline='') as f:
            reader = csv.DictReader(f)
            if reader.fieldnames != ['unit', 'count', 'checked', 'problems', 'proposed']:
                fail('coverage header differs')
            coverage = list(reader)
        if [c['unit'] for c in coverage] != order:
            fail('coverage: missing/duplicate/out-of-order missions')
        for c in coverage:
            selected = [r for r in review if r[0] in owners and owners[r[0]]['id'] == c['unit']]
            expected = [len(selected), len(selected), sum(r[3] != 'ok' for r in selected), sum(r[3] == 'change' for r in selected)]
            if [int(c[k]) for k in ['count', 'checked', 'problems', 'proposed']] != expected:
                fail(c['unit'] + ': coverage count mismatch')
        updated = copy.deepcopy(source)
        for o in updated:
            allowed = {w.lower() for n in re.split(r'[,;]', o['meta'].get('허용 이름', '-')) for w in re.findall(r"[A-Za-z']+", n)}
            for key in ['lines', 'practice']:
                for x in o[key]:
                    if x['id'] in pm:
                        p = pm[x['id']]
                        if p[1] != '-': x['say'] = p[1]
                        if p[2] != '-': x['ko'] = p[2]
                        if key == 'lines': x['check'], x['why'] = p[3:5]
                    ko_without_slots = re.sub(r'\{[^}]*\}', '', x['ko'])
                    for word in re.findall(r'[A-Za-z]+', ko_without_slots):
                        if word.lower() not in allowed:
                            fail(x['id'] + ': Korean has unapproved Latin text: ' + word)
                    if re.search('스몰|미디엄|라지|치킨|플레이트', x['ko']):
                        fail(x['id'] + ': Korean sound spelling')
            changed_lines = {x['id']: x for x in o['lines']}
            for p in o['practice']:
                l = changed_lines.get(p['line'])
                if l is None or (p['say'], p['ko']) != (l['say'], l['ko']):
                    fail(p['id'] + ': practice English/Korean mismatch')
            # Function/role/level/scene and complete turn/meta structure remain immutable.
            old = next(x for x in source if x['id'] == o['id'])
            for key in ['meta', 'turns']:
                if old[key] != o[key]: fail(o['id'] + ': changed ' + key)
            for key in ['lines', 'practice']:
                for before, after in zip(old[key], o[key]):
                    fixed = ['id', 'fn'] + (['scene', 'kind', 'who', 'cefr'] if key == 'lines' else ['line'])
                    if any(before[k] != after[k] for k in fixed):
                        fail(after['id'] + ': changed immutable field/function')
            picks = {p for t in o['turns'] for p in t['pick'].split('/') if p != '-'}
            for l in o['lines']:
                if l['id'] in picks and len(l['ko']) > 28:
                    fail(l['id'] + ': button Korean exceeds 28 characters')
        table, duplicates = lib.load_words()
        sessions = json.loads(Path(lib.SESS).read_text(encoding='utf-8'))['sessions']
        for e in duplicates: fail('word table: ' + e)
        for o in updated:
            errs, _, _ = lib.line_problems(o, table, sessions)
            for e in errs: fail('source gate: ' + e)
        # Print useful secondary facts without claiming naturalness was mechanically proven.
        print('G20_source: %d missions, %d lines, %d practice, %d replacements' %
              (len(source), sum(len(o['lines']) for o in source), sum(len(o['practice']) for o in source), len(pm)))
    except (OSError, ValueError, KeyError, IndexError, ImportError) as e:
        fail('cannot complete check: ' + str(e))
    for e in failures:
        print('[FAIL] ' + e)
    print('G20_check: %d rows, %d failures' % (review_count, len(failures)))
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
