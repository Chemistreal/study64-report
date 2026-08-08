#!/usr/bin/env python3
"""강의록이 A4 한 장 앞뒤에 들어가는지 잰다.

줄 수를 세는 검사다. 종이는 늘어나지 않는데 마크다운은 늘어난다.
넘치면 세션 중에 뒤로 넘겨 가며 봐야 하고 그러면 책상 위의 한 장이 아니게 된다.

한 면 57줄은 잰 값이다. 선언한 값이 아니다.
A4 세로 297mm 에서 위아래 여백 20mm 씩을 뺀 257mm 가 글이 놓이는 높이다.
10포인트 한글의 줄 높이가 4.5mm 다. 257 / 4.5 = 57 이다.
가로도 같이 잰다. 210mm 에서 좌우 20mm 씩을 뺀 170mm 이고
10포인트 한글 한 자가 3.75mm 이므로 45자다. 반각으로 90칸이다.
90칸을 넘는 줄은 접혀서 두 줄을 먹으므로 그렇게 세어 더한다.

사용법:
    python3 scripts/check_page.py

종료 코드 0이면 96편이 다 앞뒤 두 면에 들어간 것이다.
규격: docs/roadmap.md 11.5
"""
import pathlib
import re
import sys
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "out" / "handouts"

COLS = 90   # 반각 기준 한 줄 칸 수
LINES = 57  # 한 면 줄 수
BREAK = "**여기서 뒤로 넘긴다.**"


def width(s):
    return sum(2 if unicodedata.east_asian_width(c) in "WF" else 1 for c in s)


def printed_lines(text):
    """접히는 것까지 세서 종이 위의 줄 수를 낸다."""
    n = 0
    for line in text.split("\n"):
        w = width(line)
        n += 1 if w == 0 else -(-w // COLS)
    return n


def main():
    fails = []
    front_max = back_max = 0
    # 색인은 세션 중에 펴는 한 장이 아니라 찾아보는 표다. 앞뒤로 안 가른다.
    files = sorted(OUT.glob("eng2p_handout_l*.md"))
    for f in files:
        text = f.read_text(encoding="utf-8")
        # 머리 여섯 줄은 인쇄 대상이 아니다. 첫 빈 줄 뒤부터 센다.
        body = text.split("\n\n", 1)[1] if "\n\n" in text else text
        if BREAK not in body:
            fails.append((f.name, "접는 자리 표시가 없다"))
            continue
        i = body.find(BREAK)
        front, back = printed_lines(body[:i]), printed_lines(body[i:])
        front_max, back_max = max(front_max, front), max(back_max, back)
        if front > LINES:
            fails.append((f.name, "앞면이 %d줄이다. %d줄까지다" % (front, LINES)))
        if back > LINES:
            fails.append((f.name, "뒷면이 %d줄이다. %d줄까지다" % (back, LINES)))

    for name, why in fails:
        print("[실패] %s: %s" % (name, why))
    print()
    print("강의록 %d편 / 앞면 최대 %d줄 / 뒷면 최대 %d줄 / 한 면 %d줄"
          % (len(files), front_max, back_max, LINES))
    print("실패 %d" % len(fails))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
