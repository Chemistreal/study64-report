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

# 검증로그 형식: 날짜 / 근거 / 판정 / 조치
# 이 형식을 갖춘 것만 완료로 센다.
# "미검증. 나중에 확인한다" 같은 예고문은 로그가 채워져 있어도 대기다.
LOGGED = re.compile(r"^\d{4}-\d{2}-\d{2}\s*/")
VERDICT = re.compile(r"/\s*(통과|보류|기각)\s*/")


def state_of(log):
    """검증로그 한 줄에서 상태를 판정한다. 선언이 아니라 형식으로 가른다."""
    log = log.strip()
    if not log:
        return "대기", "로그 없음"
    if not LOGGED.match(log):
        return "대기", "날짜 없음"
    m = VERDICT.search(log)
    if not m:
        return "대기", "판정 없음"
    v = m.group(1)
    # 보류는 확인은 했는데 결론이 안 난 것이다. 완료로 세면 남은 일이 안 보인다.
    return ("보류" if v == "보류" else "완료"), v


def main():
    rows = []
    for f in sorted(OUT.rglob("*.md")):
        text = f.read_text(encoding="utf-8")
        if not re.search(r"^신뢰도:\s*B", text, re.M):
            continue
        items = re.findall(r"^검증대상:\s*(.+)$", text, re.M)
        if not items:
            items = ["(검증대상 미기재)"]
        logs = re.findall(r"^검증로그:\s*(.*)$", text, re.M)
        st, note = state_of(logs[0] if logs else "")
        for it in items:
            rows.append((f.relative_to(ROOT).as_posix(), it.strip(), st, note))

    today = datetime.date.today().isoformat()
    lines = [
        "신뢰도: A 생성 (제작 관리)",
        "",
        "# B등급 검증 대기열",
        "",
        "갱신일: %s" % today,
        "",
        "이 목록은 자동 생성된다. 직접 수정하지 않는다.",
        "검증은 Claude Code가 아니라 대화 세션에서 웹 검색으로 한다.",
        "",
        "완료로 세는 조건은 하나다. 검증로그가 아래 형식을 갖추는 것이다.",
        "",
        "```",
        "검증로그: 2026-08-07 / 근거 / 통과 / 조치",
        "           날짜        출처   판정   결과",
        "```",
        "",
        "판정은 통과, 보류, 기각 셋 중 하나다.",
        "보류는 확인은 했는데 결론이 안 난 것이다. 완료와 따로 센다.",
        "'나중에 확인한다' 는 로그가 아니라 예고문이다. 대기로 센다.",
        "이 규칙이 없으면 예고문을 적는 것만으로 대기열이 0이 된다.",
        "",
        "| 파일 | 검증 대상 | 상태 | 판정 |",
        "|---|---|---|---|",
    ]
    for r in rows:
        lines.append("| %s | %s | %s | %s |" % r)
    if not rows:
        lines.append("| (없음) | | | |")

    pending = sum(1 for r in rows if r[2] == "대기")
    held = sum(1 for r in rows if r[2] == "보류")
    lines += ["", "대기 %d건 / 보류 %d건 / 전체 %d건" % (pending, held, len(rows))]

    QUEUE.parent.mkdir(parents=True, exist_ok=True)
    QUEUE.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("검증 대기열 갱신: 대기 %d건 / 보류 %d건 / 전체 %d건"
          % (pending, held, len(rows)))


if __name__ == "__main__":
    main()
