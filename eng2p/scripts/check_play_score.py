#!/usr/bin/env python3
"""개인 칸이 코드와 화면과 자료에 없는가. T341

`docs/play.md` 원칙 1이 이것이다.

    점수는 공동으로만 쌓인다.
    화면에 개인 칸이 생기면 **그것이 곧 순위다.**

원칙은 T206 에 검사로 만들었다. 그런데 그 검사는 **규칙서를 읽는다.**
규칙서에 안 적고 코드에 개인 칸을 만들면 안 걸린다.

    적어 놓은 것과 도는 것이 다르다 (T312, T320, T330).

이 파일은 **코드와 자료를 글자로 읽는다.** T329 에 배지가 열쇠가 아닌지를
그렇게 쟀고 T332 에 분기 탭이 제 셈을 따로 하는지를 그렇게 쟀다. 세 번째다.

## 재는 자리 넷

    판 조각의 셈 그릇   `playRec` 이 여는 빈 꼴에 사람별 칸이 없는가
    판 조각의 이름 쓰기 두 사람 이름을 덮개 밖에서 쓰는가
    판 자료             `out/data` 스물에 사람별 칸이나 순위 칸이 없는가
    합치는 법           스무 판이 법 다섯 중 하나를 들고 합친 값을 안 남기는가

사용법:
    python3 scripts/check_play_score.py

규격: docs/play.md 원칙 1과 2, docs/play_rules.md 14장
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PLAY = os.path.join(ROOT, "app", "play")
DATA = os.path.join(ROOT, "out", "data")

# 판이 읽는 자료. `check_data.py` 의 PLAYDATA 와 같아야 한다
PLAYDATA = ["pairs", "swaps", "listen", "relay", "chunks", "halves",
            "ladder", "wall", "situ", "wave", "whose", "reask", "cutin",
            "clash", "flip", "onepick", "apart", "playblocks",
            "tally", "quest", "badge", "voice", "ahead", "track", "hold"]

# 사람을 가리키는 칸 이름. **이 이름이 셈 그릇에 있으면 그것이 개인 칸이다.**
PERSON = re.compile(r"^(a|b|A|B|me|you|mine|theirs|p1|p2|left|right)$")

# 순위로 읽히는 칸 이름. 값이 하나여도 이름이 이러면 개인 칸이 된다.
#
# **처음에 `point` 와 `top` 을 넣었다.** 그러자 `stop` 과 `stops` 와
# 파장의 눈금 `points` 가 걸렸다. 멈춤은 순위가 아니고 눈금도 순위가 아니다.
# 넓게 잡으면 안 걸려야 할 것이 걸리고 그러면 검사를 끄게 된다.
RANK = re.compile(r"score|rank|winner|loser|medal|순위|점수|등수", re.I)

# 이름을 써도 되는 자리. **혼자 하는 날 덮개 하나다.**
# 그 덮개는 "누가 먼저 보나" 를 적는 자리고 셈이 아니다 (docs/solo_plays.md).
NAME_OK = re.compile(r"soloCover\(")

# 화면에 나오면 안 되는 말. 진 쪽이 생기면 진 쪽이 말을 줄인다 (원칙 2)
#
# **`졌다` 를 그냥 넣었더니 `말이 이어졌다` 와 `벌어졌다` 가 걸렸다.**
# `진 쪽` 은 `던진 쪽` 에 걸렸다. 한국어는 앞 글자가 붙어서 뜻이 바뀐다.
# 앞에 한글이 안 오는 자리만 잡는다.
BAN_WORD = re.compile(r"(?<![가-힣])(이겼다|졌다|이긴 쪽|진 쪽|승자|패자|"
                      r"몇 점|점수판|순위|등수)")


def rank_keys(obj, path=""):
    """자료에서 순위로 읽히는 칸을 찾는다. **이름을 본다.**

    자료에서 `a` 와 `b` 는 **사람이 아니다.** 최소대립쌍의 두 낱말이고
    둘이 한 문장의 앞뒤 토막이고 말 겹치기의 두 줄이다.
    처음에 그것을 사람으로 읽어서 넷이 걸렸다. **자료의 a/b 는 조각이다.**

    사람별인지는 자료가 스스로 적는다 (`perPerson`). 그것을 따로 본다."""
    out = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(k, str) and RANK.search(k):
                out.append((path + "/" + k).lstrip("/"))
            out += rank_keys(v, path + "/" + str(k))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            out += rank_keys(v, path + "/" + str(i))
    return out


def rec_blanks():
    """판 조각마다 `playRec` 이 여는 빈 꼴을 글자로 읽는다.

    **코드를 돌려서 안 본다.** 판 스물을 다 돌리려면 브라우저가 있어야 하고
    그러면 이 검사가 브라우저 없는 자리에서 안 돈다. 여는 꼴은 글자로 있다."""
    out, bad = {}, []
    for f in sorted(os.listdir(PLAY)):
        if not f.endswith(".js"):
            continue
        s = io.open(os.path.join(PLAY, f), encoding="utf-8").read()
        m = re.search(r'playRec\(\s*"([a-z]+)"\s*,\s*(\{.*?\})\s*\)', s, re.S)
        if not m:
            bad.append(f + " 에 playRec 여는 꼴이 없다")
            continue
        keys = re.findall(r"([A-Za-z_][A-Za-z0-9_]*)\s*:", m.group(2))
        out[m.group(1)] = {"file": f, "keys": keys}
    return out, bad


def main():
    fails = []

    # ---- 1. 판 조각의 셈 그릇 -------------------------------------------
    recs, bad = rec_blanks()
    fails += bad
    if len(recs) != 20:
        fails.append("판 조각이 %d개다. 스물이어야 한다" % len(recs))
    for pid, r in sorted(recs.items()):
        hit = [k for k in r["keys"] if PERSON.match(k)]
        if hit:
            fails.append("%s 의 셈 그릇에 사람별 칸이 있다: %s"
                         % (r["file"], " ".join(hit)))
        hit = [k for k in r["keys"] if RANK.search(k)]
        if hit:
            fails.append("%s 의 셈 그릇에 순위로 읽히는 칸이 있다: %s"
                         % (r["file"], " ".join(hit)))

    # ---- 2. 판 조각이 두 사람 이름을 어디서 쓰나 -------------------------
    for f in sorted(os.listdir(PLAY)):
        if not f.endswith(".js"):
            continue
        for i, line in enumerate(
                io.open(os.path.join(PLAY, f), encoding="utf-8").read().split("\n")):
            if "S.names" not in line:
                continue
            if NAME_OK.search(line):
                continue
            fails.append("%s %d째 줄이 덮개 밖에서 두 사람 이름을 쓴다: %s"
                         % (f, i + 1, line.strip()[:60]))
        s = io.open(os.path.join(PLAY, f), encoding="utf-8").read()
        # 주석은 뺀다. 무엇을 안 하는지를 주석이 적을 수 있다
        body = re.sub(r"/\*.*?\*/", "", s, flags=re.S)
        body = re.sub(r"(?m)^\s*//.*$", "", body)
        for m in BAN_WORD.finditer(body):
            fails.append("%s 화면 글에 순위 말이 있다: %s"
                         % (f, body[max(0, m.start() - 20):m.end() + 20].strip()))

    # ---- 3. 판 자료 -------------------------------------------------------
    for name in PLAYDATA:
        p = os.path.join(DATA, name + ".json")
        if not os.path.exists(p):
            fails.append("out/data/%s.json 이 없다" % name)
            continue
        d = json.load(io.open(p, encoding="utf-8"))
        # **사람별이라고 적혀 있으면 그것이 곧 개인 칸이다**
        if d.get("perPerson") is True:
            fails.append("%s.json 이 사람별이라고 적혀 있다" % name)
        # 자료가 스스로 왜 안 그런지를 적은 줄은 그 말이지 칸이 아니다
        for k in list(d.keys()):
            if k.endswith("Why") or k in ("note", "source", "generator"):
                d.pop(k, None)
        hit = rank_keys(d)
        if hit:
            fails.append("%s.json 에 순위로 읽히는 칸이 있다: %s"
                         % (name, " ".join(hit[:3])))

    # ---- 4. 합치는 법. **합친 값을 안 남긴다** ---------------------------
    p = os.path.join(DATA, "tally.json")
    if os.path.exists(p):
        t = json.load(io.open(p, encoding="utf-8"))
        if t.get("merged") is not False:
            fails.append("tally.json 이 합친 값을 남긴다고 적혀 있다. "
                         "어느 기기에 적으면 그때 개인 칸이 생긴다")
        ways = set(t.get("ways", {}).keys())
        plays = t.get("plays", [])
        if len(plays) != 20:
            fails.append("합치는 법 표가 %d줄이다. 스물이어야 한다" % len(plays))
        for x in plays:
            if x.get("how") not in ways:
                fails.append("%s 의 합치는 법이 법 다섯에 없다: %s"
                             % (x.get("id"), x.get("how")))
            if x.get("id") not in recs:
                fails.append("합치는 법 표의 %s 에 맞는 판 조각이 없다" % x.get("id"))
        for pid in recs:
            if not [x for x in plays if x.get("id") == pid]:
                fails.append("판 조각 %s 가 합치는 법 표에 없다" % pid)
    else:
        fails.append("out/data/tally.json 이 없다")

    for m in fails:
        print("[실패] " + m)
    print("")
    print("**기계가 안 보는 것: 두 사람이 머릿속으로 순위를 매기는가**")
    print("개인 칸 %d판 (셈 그릇 %d, 이름 20, 자료 %d, 합치는 법 3) / 실패 %d"
          % (len(recs) * 2 + 20 + len(PLAYDATA) + 3, len(recs) * 2,
             len(PLAYDATA), len(fails)))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
