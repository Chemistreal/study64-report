#!/usr/bin/env python3
"""학생에게 건네는 영어 학습지에 **선생님용 정답**이 실려 있는지 본다.

왜 이 자가 있나
---------------
2026-08-10 에 exam 저장소에서 같은 일이 났다 — 문제지 PDF 서른아홉 개 가운데
스물여섯 개에 답이 실려 있었다. 그때 배운 것은 자가 여태 **화면과 글**만 재고
있었다는 것이다. 저장소가 학생에게 **건네는 파일 안**은 아무도 안 봤다.

여기도 건네는 파일이 있다. `english.html` 이 레슨마다 '수업 PDF' 를 걸고,
그 PDF 는 VOA 가 내는 **선생님용 수업 안내서**다.

    Tell students, "Now let's find out what Anna's new friend says."
    Ask students to form groups of four.

안내서인 것 자체는 문제가 아니다. VOA 가 공개해 둔 자료이고, 대본도 학습지에
있어야 할 것이다(화면에 대본 가리개가 따로 있다). 잡는 것은 **답**이다.

재어 보니 쉰두 개 가운데 넷이었다.

    lle1-03   5쪽   Answers: 1. She's 2. She's 3. You're …
    lle1-15   5쪽   For teacher reference, here are the answers: …
    lle1-17   6쪽   For teacher reference, here are the answers: …
    lle1-22   7쪽   For teacher reference, here are the answers: …

⚠ **자를 한 번 좁혔다.** 처음에는 `Script`·`Teacher` 같은 낱말도 셌다. 그랬더니
  쉰두 개가 다 걸렸다 — 대본과 안내문은 거기 있어야 할 것이라 그건 갈림이
  아니다. 넓게 잡는 자는 사람이 경고를 무시하게 만든다.
  `lle1-05`(“here are some possible questions and answers” — 예시 문답)와
  `lle1-12`(“an answer key … is included in the Resources section” — 딴 데를
  가리키는 말)도 답을 싣지 않으므로 뺐다.

무엇을 하고 무엇을 안 하나
--------------------------
**고치지 않는다.** PDF 에서 쪽을 잘라 내는 것은 학생이 받는 자료를 바꾸는
일이고, 이 넷은 답이 문제 옆이 아니라 **선생님더러 읽으라고 적힌 줄** 안에
섞여 있어 그 쪽만 떼면 수업 안내가 끊긴다. 어떻게 할지는 선생님이 정할 칸이다
(`docs/선생님이-정할-칸.md` A6).

그래서 이 자는 **잰 값을 박아 둔다.** 지금 넷을 알고 있고, **다섯째가 생기면**
빨간불이다. 새 레슨을 들여올 때 답이 실린 것을 모르고 거는 일을 막는다.

    python3 tools/worksheet_leak.py           # 어느 학습지 몇 쪽인가
    python3 tools/worksheet_leak.py --check   # 알고 있는 것 말고 더 있으면 빨간불
"""
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEETS = os.path.join(ROOT, 'media', 'english', 'worksheets')

# 답을 **실제로 적어 놓은** 줄만 잡는다. '정답표가 뒤에 있다' 는 말은 안 잡는다.
PRINTS = re.compile(
    r'(?:here are the answers|Answer Key\s*[:\-]|ANSWER KEY\s*[:\-]|Answers\s*:)'
    r'[^\n]{0,40}\n?[^\n]{0,20}\b1[\.\)]', re.I)

# 이미 알고 있는 자리. **여기 없는 것이 나오면 빨간불이다.**
# 고쳐서 지운 것이 아니라 **선생님이 정할 때까지 세어 둔 값**이다.
KNOWN = {
    'lle1-03.pdf': [5],
    'lle1-15.pdf': [5],
    'lle1-17.pdf': [6],
    'lle1-22.pdf': [7],
}


def scan():
    try:
        import pymupdf
    except ImportError:
        return None
    out = {}
    for p in sorted(glob.glob(os.path.join(SHEETS, '*.pdf'))):
        doc = pymupdf.open(p)
        pages = [i + 1 for i, pg in enumerate(doc) if PRINTS.search(pg.get_text())]
        doc.close()
        if pages:
            out[os.path.basename(p)] = pages
    return out


def main():
    check = '--check' in sys.argv
    if not os.path.isdir(SHEETS):
        print('영어 학습지 자리가 없다 — 잴 것이 없다.')
        if check:
            print('PASS')
        return 0

    found = scan()
    if found is None:
        # 못 도는 것을 초록으로 세지 않는다. ci_deps 가 이 줄을 보고 설치를 건다.
        print('건너뜀: pymupdf 를 찾지 못했다')
        if check and os.environ.get('REQUIRE_PDF'):
            print('FAIL')
            return 1
        return 0

    total = len(glob.glob(os.path.join(SHEETS, '*.pdf')))
    print('학습지 %d개 · 선생님용 답이 실린 것 %d개' % (total, len(found)))
    for f in sorted(found):
        mark = '알고 있다' if found[f] == KNOWN.get(f) else '**새로 생겼다**'
        print('  %-14s %-10s %s쪽' % (f, mark, ' · '.join(map(str, found[f]))))

    new = {f: p for f, p in found.items() if p != KNOWN.get(f)}
    gone = {f: p for f, p in KNOWN.items() if f not in found}

    if gone:
        print('\n알고 있던 자리가 없어졌다 — 고쳤으면 KNOWN 에서도 지운다:')
        for f in sorted(gone):
            print('  %s %s쪽' % (f, ' · '.join(map(str, gone[f]))))

    if new:
        print('\n⚠ 알고 있는 것 말고 **답이 실린 학습지**가 %d개 더 있다' % len(new))
        for f in sorted(new):
            print('  %s %s쪽' % (f, ' · '.join(map(str, new[f]))))
        print('\n학생이 받는 파일이다. 새 레슨을 들일 때는 답이 실렸는지 먼저 본다.')
        if check:
            print('\nFAIL')
            return 1
        return 0

    print('\n알고 있는 넷 말고는 없다(어떻게 할지는 선생님이 정할 칸 A6).')
    if check:
        print('PASS')
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except BrokenPipeError:
        os._exit(0)
