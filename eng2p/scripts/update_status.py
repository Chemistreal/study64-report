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
    ("tasks", "산출 과제집", 48, None),
    # 비상판 항목은 "## 041 무엇무엇 인출" 형식이다. 산문 소제목이 섞이므로 끝을 묶는다.
    ("emergency", "비상판", 80, r"^##\s*\d{3}\s.*인출\s*$"),
    # 매뉴얼류는 운영 매뉴얼과 진행 대장 둘이다. 회전 대장은 state/ 에 있는 상태 파일이다.
    # 분기 점검 보고서는 매뉴얼이 아니라 인계 문서라 따로 센다. 개정 대기 3번 결정.
    ("manual", "매뉴얼류", 2, r"^#\s+(?!Q\d).*과정"),
    ("manual", "분기 점검 보고서", 4, r"^#\s+Q\d.*점검 보고서"),
    # 3층 대조판은 Q2부터다. 기준서 6.4. 분기당 6장이라 Q2~Q4 로 18장이 목표다.
    # 운용 문서(manual)는 산출물이 아니므로 [1층] 머리를 가진 것만 센다.
    ("dialog", "3층 대조판", 18, r"^##\s*\[1층\]"),
    # 강의록은 파생물이라 강의와 같은 수여야 한다. 어긋나면 다시 뽑는다.
    ("handouts", "강의록", 96, r"^#\s+\d+강 강의록"),
]


def main():
    lines = [
        "신뢰도: A 생성 (제작 관리)",
        "",
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
        "제작 순서는 CLAUDE.md 참조. 턴 단위 계획은 docs/roadmap.md 다.",
        "Q1은 끝났고 필수 정지 지점에서 사용자가 진행을 명시적으로 지시했다.",
        # 어느 분기를 만들고 있는지는 파일명에서 파생시킨다. 손으로 적으면 안 고치고 지나간다.
        "8주 실행 데이터는 아직 없다. 그 상태로 %s를 만들고 있다."
        % (last[6:8].upper() if last.startswith("eng2p_q") else "다음 분기"),
    ]

    STATUS.parent.mkdir(parents=True, exist_ok=True)
    STATUS.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("진행 상태 갱신 완료")


if __name__ == "__main__":
    main()
