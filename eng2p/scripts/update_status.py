#!/usr/bin/env python3
"""제작 진행 상태를 집계해 state/status.md 를 갱신한다."""
import pathlib
import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
STATUS = ROOT / "state" / "status.md"

TARGETS = [
    ("lectures", "강의", 96),
    ("cards", "카드 묶음", 12),
    ("sets", "대조교차 세트", 288),
    ("input", "입력 조준표", 4),
    ("manual", "매뉴얼류", 3),
]


def main():
    lines = [
        "# eng2p 진행 상태",
        "",
        "갱신일: %s" % datetime.date.today().isoformat(),
        "",
        "자동 생성 파일이다. 직접 수정하지 않는다.",
        "",
        "| 산출물 | 완료 | 목표 | 비율 |",
        "|---|---|---|---|",
    ]
    for d, label, goal in TARGETS:
        p = OUT / d
        n = len(list(p.glob("*.md"))) if p.exists() else 0
        lines.append("| %s | %d | %d | %d%% |" % (label, n, goal, n * 100 // goal))

    lec = OUT / "lectures"
    last = sorted(lec.glob("*.md"))[-1].name if lec.exists() and any(lec.glob("*.md")) else "(없음)"
    lines += [
        "",
        "마지막 강의: %s" % last,
        "",
        "## 다음 할 일",
        "",
        "제작 순서는 CLAUDE.md 참조.",
        "Q1 완료 후 8주 실행 피드백까지 Q2를 만들지 않는다.",
    ]

    STATUS.parent.mkdir(parents=True, exist_ok=True)
    STATUS.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("진행 상태 갱신 완료")


if __name__ == "__main__":
    main()
