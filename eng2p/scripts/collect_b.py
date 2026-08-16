#!/usr/bin/env python3
"""B등급 항목을 모아 검증 대기열을 갱신한다.

사용법: python3 scripts/collect_b.py
결과: state/verify_queue.md

T420 에 두 가지를 고쳤다.

**첫째. 등급은 파일에 붙는데 재료는 줄에 있다.**
전에는 `신뢰도: B` 인 파일만 걷었다. 그래서 A등급 파일이 B등급 목록을 담고 있으면
그 목록은 어디에도 안 잡혔다. 비상판 넷이 그 자리고 근거 없는 표현을 제일 많이 쓴다.
이제 **파일이 스스로 적은 `검증대상:`** 을 문으로 쓴다. 등급이 A라도 적혀 있으면 걷는다.

문을 근거 없음에 걸지 않은 까닭이 있다. `state/verify_list.md` 가 스스로
"이 목록은 결함 목록이 아니다" 라고 적었다. 대본에 없다는 것과 B등급이라는 것은 다른 말이다.
**대본에 있는 청크 목록도 고른 사람이 있으면 B다.** 그 판정을 기계가 대신하면 안 된다.
어긋난 자리를 잡는 것은 `scripts/check_grade.py` 가 한다.

**둘째. 보류가 한 칸에 다 들어 있었다.**
106건을 읽으면 셋으로 갈린다. 대화 세션이 웹 검색으로 볼 것, 제작자가 정할 것,
8주 실행이 잴 것이다. 셋을 한 칸에 넣어 둔 것이 106이라는 숫자를 만들었다.
`docs/verify_plan.md` 7장이 그것을 짚었다. 여기서 갈래를 갈라 따로 센다.

**갈래를 로그가 스스로 적은 말로 가른다.** 없는 신호를 지어내지 않는다.
그리고 **목록을 담은 파일은 무슨 말이 적혀 있든 검증 갈래에 남긴다.**
셋을 골라 늘어놓았으면 고른 근거를 대야 하고 그것은 대화 세션만 답한다.
"""
import re
import pathlib
import datetime

import check_grade

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
QUEUE = ROOT / "state" / "verify_queue.md"

# 검증로그 형식: 날짜 / 근거 / 판정 / 조치
# 이 형식을 갖춘 것만 완료로 센다.
# "미검증. 나중에 확인한다" 같은 예고문은 로그가 채워져 있어도 대기다.
LOGGED = re.compile(r"^\d{4}-\d{2}-\d{2}\s*/")
VERDICT = re.compile(r"/\s*(통과|보류|기각)\s*/")
GRADE_B = re.compile(r"^신뢰도:\s*B", re.M)
TARGET = re.compile(r"^검증대상:[ \t]*(.+)$", re.M)
LOG = re.compile(r"^검증로그:[ \t]*(.*)$", re.M)

# **로그가 스스로 적은 말이 갈래다.** 아래 낱말은 다 로그에서 그대로 옮겼다.
#
# 8주 실행이 잴 것. "8주 실행에서 이 값이 갈리는지 본다" 가 그 꼴이다.
RUN = ("8주 실행", "실행에서", "실행 뒤", "실행이 답")
# 제작자가 정할 것. "이 과정의 운용 규칙이다" 가 그 꼴이다.
FIX = ("운용 판단", "운용 규칙", "이 과정이 정한", "이 과정이 잡은",
       "이 과정의 설계", "이 과정의 정리", "이 과정의 판단", "이 과정의 운용",
       "이 과정이 고른", "표준 분류는 아니")


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


def lane_of(log, listed):
    """보류 한 건이 누구를 기다리나. 검증 / 확정 / 실행.

    **목록을 담고 있으면 무조건 검증이다.** 로그가 운용 규칙이라고 적었어도 그렇다.
    한 로그가 두 가지를 같이 담는 일이 있다. 60강 로그는 구분을 운용 규칙이라 적고
    같은 줄에서 목록 선정을 미뤄 놓았다. 그 자리를 확정으로 내리면 목록이 사라진다.

    신호가 없으면 검증에 남긴다. **안 내리는 쪽이 잘못 내리는 쪽보다 낫다.**
    """
    if listed:
        return "검증"
    act = log.split("/", 3)[3] if log.count("/") >= 3 else log
    if any(k in act for k in RUN):
        return "실행"
    if any(k in act for k in FIX):
        return "확정"
    return "검증"


def main():
    rows = []
    for f in sorted(OUT.rglob("*.md")):
        if "/ground/" in f.as_posix() or "/data/" in f.as_posix():
            continue
        text = f.read_text(encoding="utf-8")
        items = [x.strip() for x in TARGET.findall(text) if x.strip()]
        # **문이 둘이다.** 등급이 B이거나, 등급과 무관하게 검증대상을 적었거나.
        if not GRADE_B.search(text) and not items:
            continue
        if not items:
            items = ["(검증대상 미기재)"]
        logs = LOG.findall(text)
        log = logs[0] if logs else ""
        st, note = state_of(log)
        lane = lane_of(log, bool(check_grade.places(text))) if st == "보류" else ""
        for it in items:
            rows.append((f.relative_to(ROOT).as_posix(), it, st, note, lane))

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
        "**무엇을 볼지는 `state/verify_list.md` 에 있다.**",
        "이 표는 파일 단위라 \"어느 파일에 볼 것이 있다\" 까지만 말한다.",
        "그 파일을 열어 무엇을 볼지 다시 정하는 일이 남는다.",
        "verify_list.md 는 표현 단위다. 52과 대본에 아직 없는 표현을",
        "여러 자리에서 쓰는 것부터 줄 세워 둔다. **거기 있는 것부터 본다.**",
        "",
        "## 무엇이 여기 들어오나",
        "",
        "문이 둘이다. **`신뢰도: B` 인 파일**과 **`검증대상:` 을 적은 파일**이다.",
        "등급은 파일 머리에 한 번 붙고 재료는 줄에 있다. 그래서 A등급 파일도",
        "B등급 목록을 담을 수 있고 그때는 그 파일이 `검증대상:` 을 적어야 한다.",
        "적혀 있으면 등급과 무관하게 여기 들어온다. **적는 것이 문을 여는 일이다.**",
        "",
        "적어야 할 자리를 안 적은 파일은 `python3 scripts/check_grade.py` 가 잡는다.",
        "",
        "## 완료로 세는 조건",
        "",
        "하나다. 검증로그가 아래 형식을 갖추는 것이다.",
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
        "## 보류는 누구를 기다리나",
        "",
        "보류를 한 칸에 다 넣어 두면 대화 세션이 답할 수 없는 것까지 같은 줄에 선다.",
        "**로그가 스스로 적은 말로 갈래를 가른다.**",
        "",
        "| 갈래 | 누가 닫나 | 로그에 나오는 말 |",
        "|---|---|---|",
        "| 검증 | 대화 세션이 웹 검색으로 | 목록, 빈도, 확인 못 했다 |",
        "| 확정 | 제작자가 정하면 끝난다 | 이 과정의 운용 규칙이다, 표준 분류는 아니다 |",
        "| 실행 | 8주 실행이 값을 낸다 | 8주 실행에서 본다 |",
        "",
        "**목록을 담은 파일은 무슨 말이 적혀 있든 검증에 남는다.**",
        "셋을 골라 늘어놓았으면 고른 근거를 대야 하고 그것은 웹 검색이 답한다.",
        "",
        "닫는 법은 갈래가 달라도 같다. 검증로그를 `날짜 / 근거 / 통과 / 조치` 로 고친다.",
        "확정 갈래는 근거 자리에 무엇을 보고 정했는지 적는다.",
        "**판정 낱말을 새로 만들지 않는다.** 통과와 보류와 기각 셋뿐이다.",
        "",
        "| 파일 | 검증 대상 | 상태 | 판정 | 갈래 |",
        "|---|---|---|---|---|",
    ]
    for r in rows:
        lines.append("| %s | %s | %s | %s | %s |" % r)
    if not rows:
        lines.append("| (없음) | | | | |")

    pending = sum(1 for r in rows if r[2] == "대기")
    held = sum(1 for r in rows if r[2] == "보류")
    ask = sum(1 for r in rows if r[4] == "검증")
    fix = sum(1 for r in rows if r[4] == "확정")
    run = sum(1 for r in rows if r[4] == "실행")
    lines += ["",
              "대기 %d건 / 보류 %d건 / 전체 %d건" % (pending, held, len(rows)),
              "",
              "보류 %d건의 갈래: **검증 %d건** / 확정 %d건 / 실행 %d건"
              % (held, ask, fix, run),
              "",
              "**대화 세션이 볼 것은 검증 %d건이다.** 나머지 %d건은 여기서 안 끝난다."
              % (ask, fix + run)]

    QUEUE.parent.mkdir(parents=True, exist_ok=True)
    QUEUE.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("검증 대기열 갱신: 대기 %d건 / 보류 %d건 / 전체 %d건"
          % (pending, held, len(rows)))
    print("  보류 갈래: 검증 %d건 / 확정 %d건 / 실행 %d건" % (ask, fix, run))


if __name__ == "__main__":
    main()
