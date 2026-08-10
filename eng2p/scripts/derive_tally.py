#!/usr/bin/env python3
"""판마다 **셈을 합치는 법**을 뽑는다. T320

기록할 값 칸이 스무 개 다 찼다. 그런데 **그 값이 한 기기에 다 있는 것이 아니다.**
판정하는 자리가 판 안에서 바뀌면 한 기기에는 절반만 남는다.

한 규칙으로 못 합친다. 넷이다.

    더한다        판정 자리가 판 안에서 바뀐다. 각자 절반을 든다
    같은 수다      둘이 같이 판정한다. 두 기기에 같은 수가 남는다
    큰 것을 든다    값이 "제일 ~" 다. 더하면 뜻이 달라진다
    한 기기가 센다  시계가 한 기기에만 있다. 다른 쪽에는 절반이 아예 없다

## 세 자리에서 같은 것을 재고 서로 대 본다

    규칙서 14장 표      사람이 적은 것. **원본이다** (T279)
    규칙서 아홉 줄       판정과 역할과 기록할 값에서 셈으로 뽑는다
    판 화면             `playHalf` 를 쓰는가, "같은 수" 를 적는가

셋이 어긋나면 실패로 낸다. **셋 다 맞아야 그 판의 셈을 아는 것이다.**

아홉 줄로는 열아홉만 정해진다. 끼어들기 하나가 안 나온다.
판정이 한 사람이고 역할이 바뀌므로 셈으로는 더한다가 나오는데
그 판은 시계가 한 기기에만 있다 (T301). **아홉 줄 어디에도 그 말이 없다.**
그래서 14장 표가 있고 이 파일이 그 하나를 예외로 적어 둔다.

## 합친 값을 저장소에 안 남긴다

더하는 것은 사람이 소리 내어 한다. 기기끼리 말할 길이 없다 (`round.md` 2장).
합친 값을 어느 기기에 적으면 그때 **개인 칸이 생긴다.**

원칙 1이 "점수는 공동으로만 쌓인다" 다. **안 합치는 것이 그것을 지키는 길이다.**
`rhit` 는 짝 코드로 안 건너간다. 이 파일이 그것도 확인한다.

쓰는 법:
    python3 scripts/derive_tally.py

결과: out/data/tally.json 과 tally.js
규격: docs/play_rules.md 14장, docs/play.md 원칙 1, docs/round.md 2장
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "out", "data")
RULES = os.path.join(ROOT, "docs", "play_rules.md")
APPJS = os.path.join(ROOT, "app", "js", "25_play.js")
PLAYDIR = os.path.join(ROOT, "app", "play")
MERGE = os.path.join(ROOT, "app", "js", "23_merge.js")

WAYS = {"더한다": "add", "같은 수다": "same", "큰 것을 든다": "max",
        "한 기기가 센다": "one", "그 판을 따른다": "follow"}

# 아홉 줄로 안 나오는 판. **왜 안 나오는지를 같이 적는다.**
EXCEPT = {
    "cutin": ("one", "시계가 한 기기에만 있다 (T301). 아홉 줄 어디에도 그 말이 없다"),
    "whose": ("same", "판정하는 사람이 있어도 적는 값이 둘 다 아는 사실이다"),
    "oneday": ("follow", "자리다. 아홉 줄 중 넷이 그 판을 따른다다"),
}

# 화면이 그 셈을 어떻게 말하는가. **글자로 찾는다.**
# 절반이라는 말은 `playHalf` 만 하는 것이 아니다. 한 사람만 본다는 그 부품을 안 쓰고
# "이 기기가 쥐었던 장만이다" 라고 적는다. **틀이 아니라 말을 찾는다.**
MARK = {"add": re.compile(r"playHalf\(|그 절반이다|이 기기가 쥐|"
                          r"나머지는 상대 기기|소리 내어 이어"),
        "same": re.compile(r"두 기기에 (<b>)?같은 수"),
        "one": re.compile(r"든 기기가 센다")}


def cells(seg):
    out = []
    for line in seg.split("\n"):
        line = line.strip()
        if not line.startswith("|") or "---" in line:
            continue
        c = [x.strip() for x in line.strip("|").split("|")]
        if len(c) >= 2:
            out.append(c)
    return out


def chapter(text, head, tail):
    i = text.find(head)
    if i < 0:
        return ""
    j = text.find(tail, i + len(head))
    return text[i:j if j > 0 else len(text)]


def table(s):
    """규칙서 14장의 표. **사람이 적은 것이고 원본이다.**"""
    seg = chapter(s, "## 14. 셈을 합치는 법", "### 14.1")
    out = {}
    for c in cells(seg):
        if len(c) >= 3 and c[1] in WAYS:
            out[c[0]] = WAYS[c[1]]
    return out


def books(s):
    out = []
    for m in re.finditer(r"^### (\d+\.\d+) (.+)$", s, re.M):
        seg = s[m.end():]
        e = re.search(r"^### ", seg, re.M)
        seg = seg[:e.start()] if e else seg
        rows = dict((c[0], c[1]) for c in cells(seg))
        if "기록할 값" in rows:
            out.append({"name": m.group(2).strip(), "rows": rows})
    return out


def guess(rows):
    """아홉 줄에서 셈으로 뽑는다. **못 뽑으면 None 이다.**"""
    val = rows["기록할 값"].replace("**", "")
    judge = rows["판정"].replace("**", "")
    role = rows["역할"].replace("**", "")
    if "그 판의" in judge:
        return None
    # **차례가 있다.** 판정을 먼저 본다. 값이 "제일 ~" 라도 둘이 같이 판정하면
    # 두 기기에 같은 수가 남는다. 큰 것을 드는 것은 **각자 다른 값을 들 때**다.
    # 이어달리기가 그 자리였다. 값이 "제일 길게 간 마디 수" 인데 둘이 같이 판정한다.
    if judge.startswith("둘이 같이") or "앱이" in judge:
        return "same"
    if re.search(r"제일 ", val):
        return "max"
    if "바뀐다" in role:
        return "add"
    return "one"


def main():
    for p in (RULES, APPJS, MERGE):
        if not os.path.exists(p):
            print("[실패] %s 가 없다" % p)
            return 1
    s = io.open(RULES, encoding="utf-8").read()
    tbl = table(s)
    bs = books(s)
    app = re.findall(r'\{id:"([a-z0-9]+)", name:"([^"]+)"',
                     io.open(APPJS, encoding="utf-8").read())
    if len(app) != 20 or len(bs) != 20:
        print("[실패] 앱 %d개 규칙서 %d개다. 스무 개여야 한다" % (len(app), len(bs)))
        return 1
    if len(tbl) != 20:
        print("[실패] 규칙서 14장 표가 %d줄이다. 스무 줄이어야 한다" % len(tbl))
        return 1

    byname = dict((b["name"], b) for b in bs)
    out, bad = [], []
    for pid, name in app:
        if name not in tbl:
            bad.append("%s(%s) 가 14장 표에 없다" % (pid, name))
            continue
        want = tbl[name]
        got = guess(byname[name]["rows"])
        # 아홉 줄이 못 뽑는 판은 예외로 적혀 있어야 한다
        if pid in EXCEPT:
            ex, why = EXCEPT[pid]
            if ex != want:
                bad.append("%s: 예외에 %s 라고 적었는데 표는 %s 다" % (pid, ex, want))
            got = want
        elif got is None:
            bad.append("%s: 아홉 줄로 못 뽑는데 예외에 없다" % pid)
            continue
        elif got != want:
            bad.append("%s: 표는 %s 인데 아홉 줄로 뽑으면 %s 다" % (pid, want, got))

        # 화면이 같은 말을 하는가
        f = os.path.join(PLAYDIR, pid + ".js")
        seen = None
        if os.path.exists(f):
            # **주석을 뺀다.** 판 머리글이 셈 넷을 다 적어 놓은 자리가 있다
            # (되받아치기가 그렇다). 그것은 두 사람이 읽는 글이 아니다.
            # `derive_app.py` 가 `english.html` 을 만들 때 떼는 것과 같은 자리다.
            t = re.sub(r"^[ \t]*/\*(?:(?!\*/).)*?\*/[ \t]*\n", "",
                       io.open(f, encoding="utf-8").read(), flags=re.S | re.M)
            for k in MARK:
                if MARK[k].search(t):
                    seen = k if seen is None else "여럿"
        out.append({"id": pid, "name": name, "how": want,
                    "why": EXCEPT[pid][1] if pid in EXCEPT else "아홉 줄에서 뽑았다",
                    "screen": seen})
        if want in MARK and seen != want:
            bad.append("%s: 셈이 %s 인데 화면이 %s 라고 말한다"
                       % (pid, want, seen or "아무 말도 안"))
        if want not in MARK and seen is not None:
            bad.append("%s: 셈이 %s 인데 화면에 %s 표시가 있다" % (pid, want, seen))

    # **`rhit` 가 안 건너가는가.** 합치면 개인 칸이 생긴다
    mg = io.open(MERGE, encoding="utf-8").read()
    seg = chapter(mg, "var MG_LOCAL=[", "];")
    if '"rhit"' not in seg:
        bad.append("판의 그날 셈이 짝 코드로 건너간다. 합치면 개인 칸이 생긴다")

    if bad:
        for b in bad:
            print("[실패] " + b)
        return 1

    cnt = {}
    for p in out:
        cnt[p["how"]] = cnt.get(p["how"], 0) + 1
    obj = {
        "note": "판마다 셈을 합치는 법. 규칙서 14장 표가 원본이고 "
                "아홉 줄과 판 화면이 같은 말을 하는지 대 본다. "
                "손으로 안 고친다. scripts/derive_tally.py 를 다시 돌린다.",
        "grade": "A",
        "gradeWhy": "영어가 없다. 규칙서와 화면을 대 본 것이라 세면 나온다.",
        "generator": "scripts/derive_tally.py",
        "source": "docs/play_rules.md 14장, app/play/, app/js/23_merge.js",
        "ways": {v: k for k, v in WAYS.items()},
        "merged": False,
        "mergedWhy": "합친 값을 어느 기기에 적으면 그때 개인 칸이 생긴다. "
                     "더하는 것은 사람이 소리 내어 한다. 기기끼리 말할 길이 없다. "
                     "원칙 1이 점수는 공동으로만 쌓인다이고 안 합치는 것이 그 길이다.",
        "count": cnt,
        "plays": out,
    }
    io.open(os.path.join(OUT, "tally.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "tally.js"), "w", encoding="utf-8").write(
        "window.ENG2P_TALLY=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    print("out/data/tally.json / 판 %d개 / %s / 예외 %d개 / "
          "**합친 값을 저장소에 안 남긴다**"
          % (len(out), " ".join("%s %d" % (k, cnt[k]) for k in sorted(cnt)),
             len(EXCEPT)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
