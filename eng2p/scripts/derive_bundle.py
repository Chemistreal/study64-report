#!/usr/bin/env python3
"""강의록 96편을 분기마다 한 파일로 묶는다. 인쇄용이다.

96편이 96개 파일이면 인쇄를 96번 건다. 열두 주에 한 번 걸게 묶는다.
한 분기가 24편이고 강의록 한 편이 종이 한 장 앞뒤이므로 분기당 24장이다.

**묶음은 파생물의 파생물이다.** 강의록을 다시 안 만들고 이어 붙이기만 한다.
강의를 고치면 강의록이 바뀌고 묶음도 같이 바뀐다.
순서는 색인의 주차 순서를 쓴다. 파일 이름 순서와 같지만 근거는 주차다.

사용법:
    python3 scripts/derive_bundle.py

종료 코드 0이면 네 묶음이 다 나온 것이다.
규격: docs/roadmap.md 11.5
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
HAND = ROOT / "out" / "handouts"
SETS = ROOT / "out" / "sets"
OUT = ROOT / "out" / "bundles"

QUARTERS = ["Q1", "Q2", "Q3", "Q4"]


def week_order():
    """주차 순서로 강 번호를 낸다. 색인과 같은 원본을 쓴다."""
    order = []
    for f in sorted(SETS.glob("eng2p_set_w*.md")):
        m = re.search(r"^대응강의:\s*(.+)$", f.read_text(encoding="utf-8"), re.M)
        if m:
            order += [int(x.strip()[-3:]) for x in m.group(1).split(",")]
    return order


def main():
    order = week_order()
    if sorted(order) != list(range(1, 97)):
        print("[실패] 주차 배정이 96강을 다 안 덮는다")
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    made = 0
    for q in QUARTERS:
        parts, weeks = [], []
        for n in order:
            f = HAND / ("eng2p_handout_l%03d.md" % n)
            text = f.read_text(encoding="utf-8")
            if not re.search(r"^분기: %s" % q, text, re.M):
                continue
            weeks.append(n)
            # 머리 여섯 줄은 파일마다 같은 말이라 묶음에서는 한 번만 쓴다.
            parts.append(text.split("\n\n", 1)[1].strip())
        if not parts:
            print("[실패] %s 강의록이 없다" % q)
            return 1
        head = [
            "신뢰도: A 생성 (파생의 파생)",
            "분기: %s" % q,
            "트랙: 전체",
            "원본: out/handouts/eng2p_handout_l%03d.md ~ l%03d.md"
            % (weeks[0], weeks[-1]),
            "검증대상:",
            "검증로그: 2026-08-08 / 강의록 %d편을 주차 순서로 이어 붙였다 / 통과 / "
            "손으로 적은 줄이 없다. 강의록이 바뀌면 다시 묶는다" % len(parts),
            "",
            "# %s 강의록 묶음. %d강 ~ %d강" % (q, weeks[0], weeks[-1]),
            "",
            "**인쇄용이다.** 한 장 앞뒤로 %d장이 나온다." % len(parts),
            "강의록 한 편이 A4 한 장 앞뒤다. 접는 자리 표시에서 뒤로 넘어간다.",
            "",
            "낱장이 필요하면 out/handouts/ 에서 그 편만 뽑는다.",
            "이 묶음은 손으로 고치지 않는다. 강의를 고치고 다시 뽑는다.",
            "",
        ]
        body = "\n\n---\n\n".join(parts)
        (OUT / ("eng2p_handout_bundle_%s.md" % q.lower())).write_text(
            "\n".join(head) + "\n" + body + "\n", encoding="utf-8")
        made += 1
        print("%s 묶음 %d편 (%d강 ~ %d강)" % (q, len(parts), weeks[0], weeks[-1]))

    print("\n묶음 %d개를 뽑았다" % made)
    return 0 if made == 4 else 1


if __name__ == "__main__":
    sys.exit(main())
