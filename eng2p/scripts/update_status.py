#!/usr/bin/env python3
"""제작 진행 상태를 집계해 state/status.md 를 갱신한다."""
import pathlib
import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
STATUS = ROOT / "state" / "status.md"

import re

# 파일 개수를 세는 것과 안의 항목 수를 세는 것이 다르다.
# 카드와 세트는 한 파일에 여럿이 들어가므로 안을 세야 실제 진척이 나온다.
# count 가 None 이면 파일 개수, 정규식이면 그 패턴의 등장 횟수를 센다.
TARGETS = [
    ("lectures", "강의", 96, None),
    ("cards", "카드", 600, r"^\[\d{3}\]\s+\S+형"),
    ("sets", "대조교차 세트", 288, r"^##\s*세트\s*\d{3}"),
    ("input", "입력 조준표", 4, None),
    ("manual", "매뉴얼류", 3, None),
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
    for d, label, goal, pat in TARGETS:
        p = OUT / d
        # 배정표는 산출물이 아니라 계획 문서다. 개수에서 뺀다.
        files = [f for f in p.glob("*.md") if "plan" not in f.name] if p.exists() else []
        if pat is None:
            n = len(files)
        else:
            rx = re.compile(pat, re.M)
            n = sum(len(rx.findall(f.read_text(encoding="utf-8"))) for f in files)
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
