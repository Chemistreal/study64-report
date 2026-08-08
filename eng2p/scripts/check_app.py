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


# **조각 하나가 500줄을 안 넘는다.** 넘으면 한 화면에 안 들어오고
# 한 화면에 안 들어오면 고칠 때 위아래를 오간다. 그러다 딴 데를 건드린다.
# T161 에 4759줄 한 파일을 쪼갠 이유가 그것이다. 다시 뭉치면 도로 그 상태다.
MAX_LINES = 500

# 넘겨도 되는 조각. **문턱을 올리는 대신 이유를 적는다.** 지금은 비어 있다.
BIG_OK = {}


def pieces():
    """조각을 본다. `english.html` 은 파생물이라 그것만 보면 늦다.

    합쳐 놓고 보면 500줄 넘는 조각이 있어도 안 보인다. 조각을 봐야 보인다.
    """
    app = ROOT / "app"
    bad = []
    if not app.exists():
        return ["app/ 이 없다"]
    order = app / "order.txt"
    if not order.exists():
        return ["app/order.txt 가 없다"]
    for line in order.read_text(encoding="utf-8").split("\n"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split(None, 1)
        name = parts[0]
        f = app / name
        if not f.exists():
            bad.append("차례에 적힌 조각이 없다: " + name)
            continue
        n = f.read_text(encoding="utf-8").count("\n")
        if n > MAX_LINES and name not in BIG_OK:
            bad.append("%s 가 %d줄이다. %d줄을 넘는다" % (name, n, MAX_LINES))
    return bad


# **되돌릴 수 있어야 하는 자리.** 지우거나 덮어쓰는 코드다.
# 지운 것은 없어진 줄 알지만 **덮은 것은 맞는 줄 안다.** 그래서 덮는 쪽이 더 위험하다.
UNDOABLE = re.compile(r"\.splice\([^)]*,\s*1\)|delete\s+\w+\[")

# 줄 하나짜리 면제는 **그 줄 옆에 이유를 적는다.** 표에 모으면 코드에서 멀어지고
# 코드를 옮길 때 표가 안 따라온다. 이 표시 뒤에 이유가 없으면 실패다.
UNDO_MARK = "되돌리기 없어도 된다:"

# 파일 통째로 면제되는 자리. 그 파일에서 지우는 코드가 다 같은 성격일 때만 쓴다.
UNDO_OK = {
    "02_store.js": "저장소 자체다. 전체 지우기는 물음을 두 번 하고 JSON 을 먼저 받으라고 말한다",
    "05_session.js": "clearSession 은 어제 세션을 접는 것이다. 오늘 값을 안 건드린다",
    "06_cards.js": "카드 자리 표시다. 다음 장으로 넘기면 다시 잡힌다",
    "19_library.js": "미디어 회차 표시는 누르면 다시 켜진다. 켜고 끄는 자리다",
}


# **사람을 판정하는 말.** 화면에서 학습자의 수행을 가리키는 자리에 쓰면 안 된다.
# 판정하는 사람이 상대이기 때문이다. "틀림" 이라고 적힌 단추를 누르는 것은
# 상대에게 틀렸다고 말하는 일이 된다. 기준서 2.4 가 막으려는 것이 그것이다.
# 그 항목이 언제 다시 오는가로 말한다. 넘어감과 한 번 더다. T175
VERDICT_WORDS = ["틀림", "오답", "실패함"]
# 이 조각은 이 말을 써도 된다. 학습자 수행이 아니라 검사 결과를 말하는 자리다.
VERDICT_OK = {"14_check.js"}


def verdict_words():
    """학습자를 판정하는 말이 화면 글에 있는가. **주석은 안 본다.**"""
    app = ROOT / "app" / "js"
    bad = []
    for f in sorted(app.glob("*.js")):
        if f.name in VERDICT_OK:
            continue
        # **주석 안은 안 본다.** 없앤 말을 설명하려면 그 말을 적어야 한다.
        # 줄 첫 글자만 보면 안 된다. 여러 줄 주석의 가운데 줄은 아무 글자로나 시작한다.
        # T149 에 일지에서 같은 일을 겪었다. 그때는 문장을 고쳐 피했고 여기서는 제대로 가른다.
        inblock = False
        for i, line in enumerate(f.read_text(encoding="utf-8").split("\n")):
            s = line.lstrip()
            was = inblock
            if not inblock and "/*" in line and "*/" not in line.split("/*")[1]:
                inblock = True
            elif inblock and "*/" in line:
                inblock = False
                was = True
            if was or s.startswith("//"):
                continue
            for w in VERDICT_WORDS:
                if '"' + w in line or "'" + w in line or w + '"' in line or w + "'" in line:
                    bad.append("%s %d째 줄에 사람을 판정하는 말: %s"
                               % (f.name, i + 1, s[:56]))
    return bad


def undo_gaps():
    """지우는 코드 옆에 되돌리기가 있는가. **소스를 읽는다.**

    화면으로는 이것을 못 본다. 지우는 자리가 여럿이고 그중 하나만 빠져 있으면
    그 하나를 누를 때까지 아무도 모른다. T173 에 넷을 찾았고 T174 에 둘을 더 찾았다.
    """
    app = ROOT / "app" / "js"
    bad = []
    for f in sorted(app.glob("*.js")):
        if f.name in UNDO_OK:
            continue
        body = f.read_text(encoding="utf-8")
        lines = body.split("\n")
        for i, line in enumerate(lines):
            if line.lstrip().startswith("/*") or line.lstrip().startswith("*"):
                continue
            if not UNDOABLE.search(line):
                continue
            # 그 둘레 열두 줄 안에 되돌리기가 있으면 된 것으로 본다
            near = "\n".join(lines[max(0, i - 3):i + 12])
            if "offerUndo" in near:
                continue
            # 줄 옆에 이유를 적어 뒀는가. 이유 없이 표시만 있으면 안 된다
            around = "\n".join(lines[max(0, i - 3):i + 2])
            if UNDO_MARK in around:
                why = around.split(UNDO_MARK)[1].strip()
                why = why.split("*/")[0].strip()
                if len(why) < 8:
                    bad.append("%s %d째 줄: 면제 표시는 있는데 이유가 없다" % (f.name, i + 1))
                continue
            bad.append("%s %d째 줄에 되돌리기가 없다: %s"
                       % (f.name, i + 1, line.strip()[:60]))
    return bad


def main():
    for m in verdict_words():
        FAIL.append(m)
    for m in undo_gaps():
        FAIL.append(m)
    for m in pieces():
        FAIL.append(m)
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
    npiece = sum(1 for l in (ROOT / "app" / "order.txt").read_text(encoding="utf-8").split("\n")
                 if l.strip() and not l.strip().startswith("#"))
    print("english.html 글자 %d개 / 조각 %d개 (한 조각 %d줄까지) / 되돌리기 면제 %d곳 / "
          "판정하는 말 %d개 / 건너뛴 규격 목록 %d곳 / 그리는 기호 %d개 / 실패 %d / 경고 %d"
          % (len(raw), npiece, MAX_LINES, len(UNDO_OK), len(VERDICT_WORDS), skipped,
             len(GLYPH), len(FAIL), len(WARN)))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
