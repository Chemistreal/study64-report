#!/usr/bin/env python3
"""B등급 항목을 모아 검증 대기열을 갱신한다.

사용법: python3 scripts/collect_b.py
결과: state/verify_queue.md
"""
import re
import pathlib
import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
QUEUE = ROOT / "state" / "verify_queue.md"


def main():
    rows = []
    for f in sorted(OUT.rglob("*.md")):
        text = f.read_text(encoding="utf-8")
        if not re.search(r"^신뢰도:\s*B", text, re.M):
            continue
        items = re.findall(r"^검증대상:\s*(.+)$", text, re.M)
        if not items:
            items = ["(검증대상 미기재)"]
        done = "검증로그:" in text and re.search(r"검증로그:\s*\S+", text)
        for it in items:
            rows.append((f.relative_to(ROOT).as_posix(), it.strip(),
                         "완료" if done else "대기"))

    today = datetime.date.today().isoformat()
    lines = [
        "# B등급 검증 대기열",
        "",
        "갱신일: %s" % today,
        "",
        "이 목록은 자동 생성된다. 직접 수정하지 않는다.",
        "검증은 Claude Code가 아니라 대화 세션에서 웹 검색으로 한다.",
        "검증 후 해당 파일의 '검증로그:' 줄에 결과를 적으면 완료로 바뀐다.",
        "",
        "| 파일 | 검증 대상 | 상태 |",
        "|---|---|---|",
    ]
    for r in rows:
        lines.append("| %s | %s | %s |" % r)
    if not rows:
        lines.append("| (없음) | | |")

    pending = sum(1 for r in rows if r[2] == "대기")
    lines += ["", "대기 %d건 / 전체 %d건" % (pending, len(rows))]

    QUEUE.parent.mkdir(parents=True, exist_ok=True)
    QUEUE.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("검증 대기열 갱신: 대기 %d건 / 전체 %d건" % (pending, len(rows)))


if __name__ == "__main__":
    main()
