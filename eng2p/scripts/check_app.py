#!/usr/bin/env python3
"""앱의 한국어를 규격 검사에 건다. **앱은 검사 밖에 있었다.**

`english.html` 은 글자 21만이다. 두 사람이 제일 오래 보는 화면이다.
그런데 규격 검사는 마크다운만 봤다. 그 화면의 글은 한 번도 안 걸렸다.

`check_ui.js` 가 있지만 그것은 **동작**을 본다. 눌리는지 나오는지를 본다.
글자 규칙은 안 본다. em-dash 도 문자 범위도 음차도 안 본다.
그래서 T152 에 대 보니 em-dash 하나와 문자 범위 밖 여섯이 나왔다.
셋은 고쳤고 셋은 화면에 그리는 기호라 아래 표에 이유를 적고 남겼다.

앱에는 마크다운에 없는 것이 둘 있다.

1. **규격 검사기 자신이 앱 안에 이식돼 있다.** 음차 목록과 상투 목록이 소스에 있다.
   그것은 위반이 아니라 규칙 선언이다. 표시를 두고 그 구간을 건너뛴다.
2. **화면에 그리는 기호가 있다.** 별표와 체크표 같은 것이다.
   마크다운 문자 범위를 그대로 대면 다 걸린다. 그래서 여기 따로 적어 둔다.
   **적어 둔 것만 통과다.** 새 기호가 들어오면 여기서 걸린다.

쓰는 법:
    python3 scripts/check_app.py

규격: docs/roadmap.md 11.11
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = ROOT.parent / "english.html"

# 규칙을 선언하는 구간. 이 사이는 안 본다. 표시가 소스에 있어야 한다.
SKIP_OPEN = "/* 규격 목록 시작. check_app.py 가 이 사이를 안 본다 */"
SKIP_CLOSE = "/* 규격 목록 끝 */"

# **화면에 그리는 기호.** 하나마다 왜 쓰는지와 왜 안전한지를 적는다.
# 여기 없는 기호가 들어오면 실패다. 늘리려면 이유를 같이 적는다.
GLYPH = {
    "★": "찬 별. 즐겨찾기 켜짐. 기본 글꼴에 두루 있다",
    "☆": "빈 별. 즐겨찾기 꺼짐. 위와 짝이다",
    "✓": "체크표. 통과한 회차. 기본 글꼴에 두루 있다",
}

BANNED = {
    "—": "em-dash (U+2014)",
    "–": "en-dash (U+2013)",
    "�": "U+FFFD",
}

ALLOWED = re.compile(
    "[ -~"
    "가-힣ㄱ-ㆎ"
    "\n\r\t"
    "‘’“”…·→°]"
)

TRANSLIT = ["디스", "왓", "하우", "웨어", "쓰리", "파이브",
            "굿모닝", "땡큐", "쏘리", "플리즈", "아이엠"]
TRANSLIT_RE = re.compile(r"(?<![가-힣])(%s)(?![가-힣])" % "|".join(TRANSLIT))
CLICHE = ["결론적으로", "중요한 것은", "핵심은 바로", "요약하자면"]
VAGUE = ["자연스러워지면", "익숙해지면", "감이 오면", "편해지면", "어느 정도"]

FAIL, WARN = [], []


def where(text, i):
    return text.count("\n", 0, i) + 1


def main():
    if not APP.exists():
        print("[실패] %s 가 없다" % APP)
        return 1
    raw = APP.read_text(encoding="utf-8")

    # 규칙 선언 구간을 지운다. 줄 수는 지키려고 줄바꿈만 남긴다.
    body, skipped = raw, 0
    while True:
        a = body.find(SKIP_OPEN)
        if a < 0:
            break
        b = body.find(SKIP_CLOSE, a)
        if b < 0:
            FAIL.append("규격 목록 시작 표시는 있는데 끝 표시가 없다 (%d째 줄)" % where(body, a))
            break
        cut = body[a:b + len(SKIP_CLOSE)]
        body = body[:a] + "\n" * cut.count("\n") + body[b + len(SKIP_CLOSE):]
        skipped += 1

    for ch, name in BANNED.items():
        for m in re.finditer(re.escape(ch), body):
            FAIL.append("%s (%d째 줄)" % (name, where(body, m.start())))

    seen = {}
    for i, c in enumerate(body):
        if ALLOWED.match(c) or c in GLYPH:
            continue
        seen.setdefault(c, where(body, i))
    for c, ln in sorted(seen.items()):
        FAIL.append("쓰는 문자 범위 밖: %s(U+%04X) (%d째 줄). "
                    "화면에 그리는 기호면 check_app.py 의 GLYPH 에 이유를 적어 넣는다"
                    % (c, ord(c), ln))

    for m in TRANSLIT_RE.finditer(body):
        FAIL.append("한글 음차: %s (%d째 줄)" % (m.group(1), where(body, m.start())))
    for w in CLICHE + VAGUE:
        for m in re.finditer(re.escape(w), body):
            WARN.append("%s (%d째 줄)" % (w, where(body, m.start())))

    # 1인 지시. 비상판 화면만 예외다. 기준서 11.2 다.
    for m in re.finditer("혼자", body):
        s = body.rfind("\n", 0, m.start()) + 1
        e = body.find("\n", m.end())
        line = body[s:e if e > 0 else len(body)]
        if "비상판" in line or re.search(r"(없다|않는다|아니다|각자)", line):
            continue
        WARN.append("1인 수행 지시 의심 (%d째 줄): %s" % (where(body, m.start()), line.strip()[:60]))

    for w in WARN:
        print("[경고] %s" % w)
    for f in FAIL:
        print("[실패] %s" % f)
    print()
    print("english.html 글자 %d개 / 건너뛴 규격 목록 %d곳 / 그리는 기호 %d개 / 실패 %d / 경고 %d"
          % (len(raw), skipped, len(GLYPH), len(FAIL), len(WARN)))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
