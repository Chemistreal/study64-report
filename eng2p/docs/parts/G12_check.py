#!/usr/bin/env python3
"""Read-only G12 check. Python standard library plus unchanged repository modules.

--study-root is a scratch study copy with restored current transcripts.
--game-root is the unchanged input game copy; --outputs-dir holds G12 files.
Counts stored locations, not unique spoken strings. No gate or input is written.
"""
import argparse
import copy
import csv
import json
import hashlib
import re
import sys
from collections import Counter
from pathlib import Path


def table_rows(path, columns):
    result = []
    for line in path.read_text(encoding='utf-8').splitlines():
        if not line.startswith('|'): continue
        c = [x.strip() for x in line.strip().strip('|').split('|')]
        if c[0] in ['id', 'file'] or all(re.fullmatch('[- :]+', x) for x in c): continue
        if len(c) != columns: raise ValueError(path.name + ': invalid column count')
        result.append(c)
    return result


def capture_a1(deep, game):
    captured = {}; original = deep.Audit.text
    def record(self, file, ident, text, session):
        if isinstance(text, str) and isinstance(session, int) and 1 <= session <= 48:
            for n, part in enumerate(text.splitlines() or [''], 1):
                suffix = '' if len(text.splitlines()) <= 1 else '/line:%d' % n
                captured[(file, str(ident) + suffix)] = (part, session, len(deep.word_tokens(part)))
        return original(self, file, ident, text, session)
    deep.Audit.text = record
    try:
        result = deep.audit_repo(game)
    finally:
        deep.Audit.text = original
    violations = [v for v in result['violations'] if v['code'].startswith('A1_')]
    return violations, captured


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--study-root', type=Path, default=Path(__file__).resolve().parents[3])
    p.add_argument('--game-root', type=Path)
    p.add_argument('--outputs-dir', type=Path, default=Path(__file__).resolve().parent)
    args = p.parse_args(); failures = []; count = 0
    def fail(message): failures.append(message)
    try:
        game = (args.game_root or args.study_root.parent / 'game').resolve()
        sys.dont_write_bytecode = True
        sys.path.insert(0, str(args.study_root.resolve() / 'eng2p/scripts'))
        sys.path.insert(0, str(game / 'Tools/gpt1'))
        import authored_lib as lib
        import check_data_deep as deep
        if len(list((args.study_root / 'media/english/transcripts').glob('lle1-*.md'))) != 52:
            raise ValueError('restore all 52 current transcripts in a scratch copy before checking')
        source, errors = lib.parse_lines()
        for error in errors: fail('source: ' + error)
        word_table, errors = lib.load_words()
        for error in errors: fail('word table: ' + error)
        sessions = json.loads(Path(lib.SESS).read_text(encoding='utf-8'))['sessions']
        violations, captured = capture_a1(deep, game)
        data = json.loads((game/'Data/authored.json').read_text(encoding='utf-8'))
        data_index = {x['id']: x for key in ['lines','practice'] for x in data[key]}
        originals = {x['id']: (o, x, key) for o in source for key in ['lines','practice'] for x in o[key]}
        listed = table_rows(args.outputs_dir/'G12_violations.md', 9)
        lm = {}
        for r in listed:
            key = tuple(r[:2])
            if key in lm: fail('duplicate violation: ' + str(key))
            lm[key] = r
        expected_keys = {(v['file'],v['id']) for v in violations}
        if set(lm) != expected_keys: fail('violation list does not match fresh A1 audit')
        for v in violations:
            key = (v['file'],v['id']); r = lm.get(key)
            if not r: continue
            en, session, words = captured[key]
            mission = data_index[v['id']]['outing'] if v['file']=='authored.json' else '-'
            if (r[2], int(r[3]), r[4], int(r[6])) != (mission,session,en,words):
                fail(v['id'] + ': violation source/count mismatch')
            expected_kind = 'too many words' if v['code']=='A1_WORD_LIMIT' else 'too many new words'
            if r[5] != expected_kind: fail(v['id'] + ': incorrect violation kind')
        fixes = table_rows(args.outputs_dir/'G12_fixes.md', 7); count = len(fixes)
        fixes_by_id = {}
        for r in fixes:
            i = r[0]
            if i in fixes_by_id: fail('duplicate fix: ' + i)
            fixes_by_id[i] = r
            if i not in originals: fail('unknown fix ID: ' + i)
        authored_bad = {v['id'] for v in violations if v['file']=='authored.json'}
        if set(fixes_by_id) != authored_bad:
            fail('every authored violation must have exactly one fix in this completed dataset')
        updated = copy.deepcopy(source)
        updated_derived = {}
        for o in updated:
            session = int(o['meta']['세션'])
            heard_before = lib.heard_vocab(session-1)
            allowed = {w.lower() for n in re.split('[,;]',o['meta']['허용 이름']) for w in re.findall("[A-Za-z']+",n)}
            for x in o['lines']:
                if x['id'] not in fixes_by_id: continue
                r = fixes_by_id[x['id']]; before = copy.deepcopy(x)
                x['say'],x['ko'],x['check'],x['why'] = r[1],r[2],r[5],r[6]
                if not x['ko'].strip() or x['ko']=='-': fail(x['id'] + ': missing Korean')
                if x['check'] not in ['A','B'] or (x['check']=='A' and x['why']!='-') or (x['check']=='B' and (x['why']=='-' or len(x['why'])<8)):
                    fail(x['id'] + ': bad self-check/reason')
                for word in deep.word_tokens(re.sub(r'\{[^}]*\}', '', x['ko'])):
                    if re.search('[a-z]',word) and word not in allowed:
                        fail(x['id'] + ': unapproved Latin Korean')
                if re.search('스몰|미디엄|라지|치킨|플레이트', x['ko']): fail(x['id'] + ': sound spelling')
                for k in ['say','ko']:
                    if sorted(re.findall(r'\{[^}]*\}',x[k])) != sorted(re.findall(r'\{[^}]*\}',before[k])):
                        fail(x['id'] + ': changed slots')
                words = len(deep.word_tokens(x['say']))
                if words>8 or words!=int(r[3]): fail(x['id'] + ': literal word limit/count')
                for word in lib.tokens(x['say']):
                    stem = lib.stem(word)
                    if word not in allowed and stem not in heard_before and word_table.get(stem)!='A1':
                        fail(x['id'] + ': not A1 or taught earlier: ' + word)
                for k in ['id','fn','scene','kind','who','cefr']:
                    if x[k]!=before[k]: fail(x['id'] + ': changed immutable ' + k)
            line_index = {x['id']:x for x in o['lines']}
            for x in o['practice']:
                if x['line'] in fixes_by_id:
                    x['say'],x['ko'] = line_index[x['line']]['say'],line_index[x['line']]['ko']
                if x['say'] != line_index[x['line']]['say'] or x['ko'] != line_index[x['line']]['ko']:
                    fail(x['id'] + ': inconsistent practice')
            errors, _, derived = lib.line_problems(o, word_table, sessions)
            updated_derived.update(derived)
            for error in errors: fail('repository line gate: ' + error)
            for x in o['lines']:
                if x['id'] in fixes_by_id:
                    r = fixes_by_id[x['id']]
                    new = len(set(derived[x['id']]['introduces']+derived[x['id']]['stretch']))
                    if new>4 or new!=int(r[4]): fail(x['id'] + ': new-word limit/count')
        # Apply all replacements to a complete in-memory Data copy and recount the original audit.
        raw = {f.name:f.read_bytes() for f in sorted((game/'Data').glob('*.json'))}
        docs = {name:json.loads(b.decode('utf-8-sig')) for name,b in raw.items()}
        updated_lines = {x['id']:x for o in updated for x in o['lines']}
        updated_practice = {x['id']:x for o in updated for x in o['practice']}
        for x in docs['authored.json']['lines']:
            if x['id'] not in fixes_by_id: continue
            line=updated_lines[x['id']]; d=updated_derived[x['id']]
            x.update(say=line['say'],ko=line['ko'],selfCheck=line['check'],
                     selfCheckWhy=None if line['check']=='A' else line['why'],
                     introduces=d['introduces'],stretchWords=d['stretch'])
        for x in docs['authored.json']['practice']:
            if x['line'] in fixes_by_id:
                line=updated_practice[x['id']]; x.update(say=line['say'],ko=line['ko'])
        # JSON encoding mirrors derive_authored.py; hash bookkeeping is only in memory.
        raw['authored.json']=(json.dumps(docs['authored.json'],ensure_ascii=False,indent=1)+'\n').encode('utf-8')
        for entry in docs['manifest.json']['files']:
            if entry['file']=='authored.json':
                entry['bytes']=len(raw['authored.json']);entry['sha256']=hashlib.sha256(raw['authored.json']).hexdigest()
        actual=sorted(n for n in raw if n!='manifest.json' and not n.endswith('.local.json'))
        joined=''.join('%s:%s\n'%(n,hashlib.sha256(raw[n]).hexdigest()) for n in actual)
        docs['manifest.json']['dataHash']=hashlib.sha256(joined.encode()).hexdigest()
        landmarks=json.loads((game/'Honolulu/Config/HnlLandmarks.json').read_text(encoding='utf-8-sig'))
        after=deep.check_documents(docs,raw,{x['id']:x for x in landmarks['landmarks']})
        after_a1=[v for v in after['violations'] if v['code'].startswith('A1_')]
        if any(v['file']=='authored.json' for v in after_a1): fail('authored A1 violations remain after in-memory fixes')
        if len(after_a1)!=len(violations)-len(authored_bad): fail('unexpected A1 before/after difference')
        print('G12_in_memory: before=%d after=%d authored-after=%d' %
              (len(violations),len(after_a1),sum(v['file']=='authored.json' for v in after_a1)))
        mission_counts = Counter(data_index[v['id']]['outing'] for v in violations if v['file']=='authored.json')
        other_counts = Counter(v['file'] for v in violations if v['file']!='authored.json')
        text = (args.study_root/'eng2p/docs/outings.md').read_text(encoding='utf-8')
        section = text.split('## 6.',1)[1].split('## 7.',1)[0]
        order = [m.group(1) for line in section.splitlines() if '첫 공개' in line and (m:=re.search(r'`([^`]+)`',line)) and m.group(1) in {o['id'] for o in source}]
        expected_coverage = [[i,mission_counts[i],mission_counts[i],mission_counts[i],mission_counts[i]] for i in order]
        expected_coverage += [[i,n,n,n,0] for i,n in sorted(other_counts.items())]
        with (args.outputs_dir/'G12_coverage.csv').open(encoding='utf-8',newline='') as f:
            reader=csv.reader(f); header=next(reader); coverage=list(reader)
        if header!=['unit','count','checked','problems','proposed']: fail('coverage header')
        if [[r[0]]+[int(x) for x in r[1:]] for r in coverage] != expected_coverage: fail('coverage counts/order')
        g9_ids = {r[0] for r in table_rows(args.study_root/'eng2p/docs/parts/G9_fixes.md',5)}
        print('G12_fresh: %d violations; word=%d new=%d; authored=%d; retained-other=%d' %
              (len(violations),sum(v['code']=='A1_WORD_LIMIT' for v in violations),sum(v['code']=='A1_NEW_WORD_LIMIT' for v in violations),len(authored_bad),len(violations)-len(authored_bad)))
        print('G12_G9_overlap: %d rows' % len(set(fixes_by_id)&g9_ids))
    except (OSError,ValueError,KeyError,IndexError,ImportError) as error:
        fail('cannot complete check: '+str(error))
    for failure in failures: print('[FAIL] '+failure)
    print('G12_check: %d rows, %d failures' % (count,len(failures)))
    return 1 if failures else 0


if __name__=='__main__':
    sys.exit(main())
