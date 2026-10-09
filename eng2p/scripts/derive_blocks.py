#!/usr/bin/env python3
"""스무 판이 **블록 넷 중 어디에 붙는가**를 뽑는다. T318

E단계에 판 스무 개를 다 만들었다. 그런데 **언제 도는지를 아무 데도 안 적었다.**
판 탭에 스무 개가 나란히 있고 두 사람이 아무 때나 아무거나 연다.

세션은 두 시간이고 블록 넷이다. 판은 그 안 어딘가에 들어가야 한다.

## 무엇이 붙는 자리를 정하나

둘이다.

    자료   그 블록이 쓰는 자료와 판이 쓰는 자료가 같아야 한다
    분     판이 블록을 밀어내면 안 된다 (`play.md` 원칙 6)

**셋이었다.** 셋째가 말이었다. 블록 1 이 말을 안 하는 블록이라 소리 내는 판이 못 붙었다.
개정문 20 번이 블록 1 을 같이 듣고 같이 말하는 블록으로 바꿨다. 그 까닭이 없어졌다.
기준서 2.3 은 네 블록 다 대화가 허용이거나 필수다. **그래서 말은 자리를 정하는 값이 아니다.**
대신 **네 블록이 다 말하는 블록인지를 여기서 확인한다.** 하나라도 말 못 하는 블록이 생기면
그 블록에는 판이 못 붙으니 이 표를 다시 짜야 한다. 그때는 이 줄이 실패로 알린다.

## 블록 1 에도 판이 붙는다 (개정문 20, 2026-10-07)

전에는 블록 1 이 비어 있었고 그것이 맞았다. 블록 1 은 40분 병렬 침묵이었고 병렬은 각자 따로였다.
판 스무 개가 다 둘이 주고받는 판이라 붙을 것이 없었다.

지금 블록 1 은 함께 듣기다. 블록 4 와 같은 자료(대본이 있는 52과)를 쓴다.
**자료와 분만 보면 media 를 쓰는 열세 판이 블록 1 과 블록 4 에 다 붙는다.**

옮긴 판은 0이다. 블록 4 에서 뺀 판이 없고 블록 1 에 더 붙은 자리만 있다.
이 표는 **붙을 수 있는 자리**를 말하고 하루에 몇 판을 어디에 넣을지는 안 정한다.
하루에 도는 판은 두 판까지다 (기준서 2.3). 그것은 앱이 판 탭에서 두 사람이 열 때 지킬 일이다.

## 한 판이 여러 블록에 붙을 수 있다

자료 갈래가 media 인 판이 열셋이다. 이제 블록 1 과 4 가 다 받는다.
**한 블록에 여러 판이 붙는 것과 한 판이 여러 블록에 붙는 것이 다르다.**
앞엣것은 고를 것이 있다는 뜻이고 뒤엣것은 같은 판을 두 번 돌 수 있다는 뜻이다.

쓰는 법:
    python3 scripts/derive_blocks.py

결과: out/data/playblocks.json 과 playblocks.js
규격: docs/play_rules.md, docs/blocks.md, docs/play.md 원칙 6
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

# 자료 파일 이름에서 갈래로. **판이 무엇을 읽는지가 규칙서의 쓰는 것 칸에 있다.**
# 블록이 쓰는 것과 대 보려고 갈래로 옮긴다.
SRC = {
    "pairs": "media", "swaps": "media", "listen": "media", "relay": "media",
    "chunks": "media", "halves": "media", "ladder": "media", "cutin": "media",
    "clash": "media", "reask": "media", "wave": "media",
    "wall": "cards", "situ": "cards", "whose": "cards", "flip": "cards",
    "apart": "lecture",
}
# 자료 파일이 없는 판. **규칙서가 자료 이름을 안 적은 것들이다.**
NOFILE = {"recall": "cards", "oneday": "any"}

# 강의를 쓰는 판이 하나 있는데 **강의를 쓰는 블록이 없다.** T318 에 걸렸다.
#
# 블록 넷이 쓰는 것은 media 와 set 과 cards 다. 따로 쓰고 같이 펴기는
# 강의 블록 2의 함정 문장을 쓴다 (T309). 어느 블록에도 안 붙어서 실패가 났다.
#
# 세트가 강의에서 나온다. `derive_index.py` 가 48주 96강 색인을
# **세트의 대응강의 줄에서** 파생한다. 둘이 같은 강에 매여 있다.
# 그리고 세션 블록 2가 대조 교차이고 강의 블록 2가 한국어 화자 함정이다.
# **같은 것을 종이와 화면에서 부르는 이름이 다를 뿐이다.**
#
# 그래서 강의를 세트와 같은 자리로 본다. **없는 블록을 새로 만들지 않는다.**
ALIAS = {"lecture": "set"}

# 자리 판. **제 아홉 줄에 두 쪽이 없어도 여는 판이 다 둘이 한다.**
# `oneday` 는 "그 판을 따른다" 가 넷이라 두 쪽을 가리키는 말이 적다.
# 그대로 두면 혼자 도는 판으로 나온다. 여는 판 열아홉이 다 둘이 하는 판이다.
ALWAYS_TALK = {"oneday"}

# 둘이 하는가. **이 값은 이제 자리를 정하지 않는다.** 1인 지시 금지를 재는 데만 쓴다.
#
# 전에는 블록 1 이 막는 것이 말이 아니라 주고받는 것이어서 이 값이 자리를 갈랐다.
# 처음에는 "말하는가" 로 쟀다. 좁은 낱말로 재서 열하나가 말을 안 하는 판으로 나왔고
# 넓혔더니 넷이 남았다. 그 넷을 열어 보니 이랬다.
#
#     겹치면 지운다   각자 단서를 **적는다.** 동시에 편다
#     누구 말이야     셋 중 하나를 **고른다.** 판정하는 쪽이 본다
#
# 정말 말이 적다. 병렬 침묵은 적어서 동시에 펴는 것도 못 붙였다. 상대를 기다리면 병렬이 아니어서다.
# 개정문 20 이 병렬 침묵을 없앴다. 이제 그 넷도 붙는다. 이 저장소의 절대 규칙이
# "1인 지시 금지. 모든 과제는 2인 전제" 라 스무 판이 다 걸려야 하고 실제로 다 걸린다.
# 안 걸리면 그 판이 규칙을 어긴 것이다.
PAIR = re.compile(r"쪽|각자|둘이|둘 다|상대|서로|번갈아|주고받|사람1|사람2|"
                  r"A가|B가|A는|B는|한 사람|다른 사람")

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


def books():
    """규칙서 스무 판을 읽는다. 판마다 아홉 줄이다."""
    if not os.path.exists(RULES):
        return None, ["%s 가 없다" % RULES]
    s = io.open(RULES, encoding="utf-8").read()
    out = []
    for m in re.finditer(r"^### (\d+\.\d+) (.+)$", s, re.M):
        seg = s[m.end():]
        e = re.search(r"^### ", seg, re.M)
        seg = seg[:e.start()] if e else seg
        rows = dict((c[0], c[1]) for c in cells(seg))
        if "쓰는 것" not in rows:
            continue
        out.append({"sec": m.group(1), "name": m.group(2).strip(), "rows": rows})
    if len(out) != 20:
        return None, ["규칙서에서 판을 %d개 읽었다. 스무 개여야 한다" % len(out)]
    return out, []


def ids():
    """앱이 아는 판 이름과 차례. **규칙서 차례와 같아야 한다.**"""
    if not os.path.exists(APPJS):
        return None, ["%s 가 없다" % APPJS]
    s = io.open(APPJS, encoding="utf-8").read()
    got = re.findall(r'\{id:"([a-z0-9]+)", name:"([^"]+)"', s)
    if len(got) != 20:
        return None, ["앱이 아는 판이 %d개다. 스무 개여야 한다" % len(got)]
    return got, []


def main():
    bs, bad = books()
    app, abad = ids()
    bad = (bad or []) + (abad or [])
    ix = os.path.join(OUT, "index.json")
    if not os.path.exists(ix):
        bad.append("out/data/index.json 이 없다")
    if bad:
        for b in bad:
            print("[실패] " + b)
        return 1

    blocks = json.load(io.open(ix, encoding="utf-8"))["blocks"]
    byname = dict((b["name"], b) for b in bs)

    plays = []
    for pid, name in app:
        b = byname.get(name)
        if not b:
            print("[실패] 앱의 판 %s(%s) 가 규칙서에 없다" % (pid, name))
            return 1
        use = b["rows"]["쓰는 것"]
        # 자료 갈래. 파일 이름이 있으면 그것으로, 없으면 적어 둔 표로
        got = [SRC[k] for k in SRC if ("out/data/%s.js" % k) in use]
        src = got[0] if got else NOFILE.get(pid)
        if not src:
            print("[실패] %s 가 무슨 자료를 쓰는지 못 정했다: %s" % (pid, use[:40]))
            return 1
        m = re.search(r"(\d+)\s*분", b["rows"]["트랙 구조 분"])
        if not m:
            print("[실패] %s 의 분을 못 찾았다" % pid)
            return 1
        mins = int(m.group(1))
        turn = " ".join(b["rows"].values())
        talk = bool(PAIR.search(turn)) or pid in ALWAYS_TALK
        src = ALIAS.get(src, src)
        plays.append({"id": pid, "name": name, "sec": b["sec"], "min": mins,
                      "src": src, "together": talk, "talk": talk})

    # **네 블록이 다 말하는 블록인가** (기준서 2.3, 개정문 20). 자리를 정하는 값이 아니라 전제다.
    # 전에는 이 자리에서 말 못 하는 블록에 판이 못 붙게 막았다. 이제는 그런 블록이 없다는 것을 확인한다.
    silent = [str(b["no"]) for b in blocks if b.get("talk") is not True]
    if silent:
        print("[실패] 말하는 블록이 아닌 블록이 있다: %s. 기준서 2.3 은 네 블록 다 "
              "대화 허용 이상이다. index.json 의 talk 를 본다" % " ".join(silent))
        return 1

    # 붙는 자리를 정한다
    for p in plays:
        fit, why = [], []
        for b in blocks:
            if p["src"] != "any" and b["uses"] != p["src"]:
                why.append("%d번은 %s 를 쓴다" % (b["no"], b["uses"]))
                continue
            if p["min"] > b["minutes"]:
                why.append("%d번이 %d분인데 판이 %d분이다"
                           % (b["no"], b["minutes"], p["min"]))
                continue
            fit.append(b["no"])
        p["fit"] = fit
        p["why"] = why

    # **스무 판이 다 둘이 하는 판이다.** 안 걸린 판이 있으면 그 판이 규칙을 어긴 것이다
    solo = [p["id"] for p in plays if not p["talk"]]
    if solo:
        print("[실패] 혼자 도는 판으로 나온 것이 있다: %s. "
              "1인 지시 금지가 절대 규칙이다. 규칙서를 열어 본다" % " ".join(solo))
        return 1

    lost = [p["id"] for p in plays if not p["fit"]]
    if lost:
        print("[실패] 어느 블록에도 못 붙는 판이 있다: %s" % " ".join(lost))
        return 1

    per = {}
    for b in blocks:
        per[b["no"]] = [p["id"] for p in plays if b["no"] in p["fit"]]

    # **붙인 것을 다시 잰다.** 붙이는 줄과 재는 줄을 가른다 (T315 와 같은 꼴).
    #
    # 깸 시험에서 자료를 안 보게 해 봤더니 블록마다 스무 개가 붙었는데
    # **아무도 안 잡았다.** 붙이는 줄이 곧 답이었기 때문이다.
    # 줄 하나가 틀리면 표 전체가 틀리는데 그것을 볼 자리가 없었다.
    byid = dict((p["id"], p) for p in plays)
    wrong = []
    for b in blocks:
        for pid in per[b["no"]]:
            q = byid[pid]
            if q["src"] != "any" and q["src"] != b["uses"]:
                wrong.append("%d번(%s)에 %s(%s)" % (b["no"], b["uses"], pid, q["src"]))
            elif q["min"] > b["minutes"]:
                wrong.append("%d번(%d분)에 %s(%d분)" % (b["no"], b["minutes"],
                                                     pid, q["min"]))
            elif b.get("talk") is not True:
                wrong.append("%d번(말 못 하는 블록)에 %s" % (b["no"], pid))
    if wrong:
        print("[실패] 못 붙을 자리에 붙은 판이 %d개다: %s"
              % (len(wrong), " ".join(wrong[:5])))
        return 1

    # **네 블록 다 판이 붙어야 한다.** 전에는 블록 1 이 비는 것이 이 파일의 답이었다.
    # 개정문 20 이 그 까닭(말을 안 하는 블록)을 없앴다. 지금 비는 블록이 있으면 재는 자가 틀린 것이다.
    # **비어 있는 것과 못 찾은 것을 가른다.** 앞으로 비는 블록이 생기면 까닭을 적고 여기를 고친다.
    empty = [n for n in per if not per[n]]
    if empty:
        print("[실패] 비는 블록이 %s 다. 네 블록이 다 같이 하고 말하는 블록이라 "
              "자료와 분이 맞으면 붙어야 한다. 재는 법을 본다" % empty)
        return 1
    # 블록 1 이 판을 받는 것은 블록 4 와 같은 자료(media)를 쓰기 때문이다. 그것도 못 박는다.
    b1 = [x for x in blocks if x["no"] == 1][0]
    media_plays = [p["id"] for p in plays if p["src"] == "media"]
    if b1["uses"] != "media" or any(pid not in per[1] for pid in media_plays):
        print("[실패] 블록 1 이 대본을 쓰는 판 %d개를 다 안 받는다. 블록 1 은 블록 4 와 "
              "같은 자료를 쓰는 함께 듣기다" % len(media_plays))
        return 1

    obj = {
        "note": "판 스무 개가 블록 넷 중 어디에 붙을 수 있는가. 자료와 분으로 정한다. "
                "네 블록이 다 같이 하고 말하는 블록이라 말은 자리를 안 정한다 (개정문 20). "
                "손으로 안 고친다. scripts/derive_blocks.py 를 다시 돌린다.",
        "grade": "A",
        "gradeWhy": "영어가 없다. 규칙서의 쓰는 것과 분을 "
                    "index.json 의 블록 넷과 대 본 것이다. 둘 다 세면 나온다.",
        "generator": "scripts/derive_blocks.py",
        "source": "docs/play_rules.md, out/data/index.json, docs/play.md 원칙 6",
        "blocks": [{"no": b["no"], "name": b["name"], "minutes": b["minutes"],
                    "uses": b["uses"], "together": b.get("talk", True),
                    "plays": per[b["no"]]} for b in blocks],
        "empty": empty,
        "placementWhy": "블록 1 은 함께 듣기이고 블록 4 와 같은 자료(대본이 있는 52과)를 쓴다. "
                        "그래서 대본을 쓰는 판이 두 블록에 다 붙을 수 있다. 옮긴 판은 없다. "
                        "이 표는 붙을 수 있는 자리다. 하루에 도는 판은 두 판까지다 (기준서 2.3).",
        "plays": plays,
    }
    io.open(os.path.join(OUT, "playblocks.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "playblocks.js"), "w", encoding="utf-8").write(
        "window.ENG2P_PLAYBLOCKS=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    tg = sum(1 for p in plays if p["talk"])
    print("out/data/playblocks.json / 판 %d개 / 블록마다 %s개 / "
          "둘이 하는 판 %d개 / **네 블록이 다 같이 하고 말한다. 블록 1 에도 판이 붙는다**"
          % (len(plays), " ".join(str(len(per[b["no"]])) for b in blocks), tg))
    return 0


if __name__ == "__main__":
    sys.exit(main())
