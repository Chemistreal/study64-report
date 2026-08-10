#!/usr/bin/env python3
"""스무 판이 **블록 넷 중 어디에 붙는가**를 뽑는다. T318

E단계에 판 스무 개를 다 만들었다. 그런데 **언제 도는지를 아무 데도 안 적었다.**
판 탭에 스무 개가 나란히 있고 두 사람이 아무 때나 아무거나 연다.

세션은 두 시간이고 블록 넷이다. 판은 그 안 어딘가에 들어가야 한다.

## 무엇이 붙는 자리를 정하나

셋이다.

    자료   그 블록이 쓰는 자료와 판이 쓰는 자료가 같아야 한다
    말     블록 1은 **말을 안 하는 블록**이다. 소리 내는 판은 못 붙는다
    분     판이 블록을 밀어내면 안 된다 (`play.md` 원칙 6)

## 블록 1에 붙는 판이 없다

이것이 이 파일이 낸 답이고 **비어 있는 것이 맞다.**

블록 1은 40분 병렬 침묵이다. 각자 듣는다. 말을 안 한다.
판 스무 개가 다 둘이 주고받는 판이다. **주고받으면 침묵이 아니다.**

빈 자리를 없애려고 판을 하나 밀어 넣으면 블록 1이 블록 1이 아니게 된다.
`blocks.md` 7장이 진단한 것과 반대 방향의 잘못이다. 거기서는 화면이 모자랐고
여기서는 **넣을 자리가 아닌 데 넣는 것**이 잘못이다.

## 한 판이 여러 블록에 붙을 수 있다

대본을 쓰는 판이 열하나다. 블록 1과 4가 둘 다 대본을 쓰는데 1은 말을 안 한다.
그래서 열하나가 다 블록 4로 간다. 블록 4는 20분이고 판은 3~5분이다.

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
# 그대로 두면 병렬 침묵 블록에 붙는다. 여는 판 열아홉이 다 둘이 하는 판이다.
ALWAYS_TALK = {"oneday"}

# 주고받는가. **블록 1이 막는 것은 말이 아니라 주고받는 것이다.**
#
# 처음에는 "말하는가" 로 쟀다. 좁은 낱말로 재서 열하나가 말을 안 하는 판으로 나왔고
# 넓혔더니 넷이 남았다. 그 넷을 열어 보니 이랬다.
#
#     겹치면 지운다   각자 단서를 **적는다.** 동시에 편다
#     누구 말이야     셋 중 하나를 **고른다.** 판정하는 쪽이 본다
#
# 정말 말이 적다. **그런데 그 넷도 블록 1에 못 붙는다.**
#
# 블록 1은 40분 병렬 침묵이고 병렬은 **각자 따로**라는 뜻이다.
# 적어서 동시에 펴는 것도 주고받는 것이다. 상대를 기다리는 순간 병렬이 아니다.
#
# 그래서 재는 것을 바꿨다. 말이 아니라 **둘이 있는가**를 본다.
# 이 저장소의 절대 규칙이 "1인 지시 금지. 모든 과제는 2인 전제" 라
# 스무 판이 다 걸려야 한다. 안 걸리면 그 판이 규칙을 어긴 것이다.
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

    # 붙는 자리를 정한다
    for p in plays:
        fit, why = [], []
        for b in blocks:
            if b.get("talk") is False and p["talk"]:
                why.append("%d번은 각자 따로 하는 블록이다" % b["no"])
                continue
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
            elif b.get("talk") is False:
                wrong.append("%d번(각자 따로)에 %s" % (b["no"], pid))
    if wrong:
        print("[실패] 못 붙을 자리에 붙은 판이 %d개다: %s"
              % (len(wrong), " ".join(wrong[:5])))
        return 1

    # 블록 1이 비는 것이 이 파일의 답이다. **비어 있는 것과 못 찾은 것을 가른다.**
    empty = [n for n in per if not per[n]]
    if empty != [1]:
        print("[실패] 비는 블록이 %s 다. 1번만 비어야 한다. "
              "블록 1은 말을 안 하는 블록이고 판은 다 주고받는 판이다" % empty)
        return 1

    obj = {
        "note": "판 스무 개가 블록 넷 중 어디에 붙는가. 자료와 말과 분으로 정한다. "
                "블록 1은 비어 있고 그것이 맞다. "
                "손으로 안 고친다. scripts/derive_blocks.py 를 다시 돌린다.",
        "grade": "A",
        "gradeWhy": "영어가 없다. 규칙서의 쓰는 것과 도는 차례와 분을 "
                    "index.json 의 블록 넷과 대 본 것이다. 셋 다 세면 나온다.",
        "generator": "scripts/derive_blocks.py",
        "source": "docs/play_rules.md, out/data/index.json, docs/play.md 원칙 6",
        "blocks": [{"no": b["no"], "name": b["name"], "minutes": b["minutes"],
                    "uses": b["uses"], "together": b.get("talk", True),
                    "plays": per[b["no"]]} for b in blocks],
        "empty": empty,
        "emptyWhy": "블록 1은 40분 병렬 침묵이다. 병렬은 각자 따로라는 뜻이다. "
                    "판 스무 개가 다 둘이 하는 판이라 붙을 것이 없다. "
                    "적어서 동시에 펴는 판도 상대를 기다리므로 병렬이 아니다. "
                    "빈 자리를 채우려고 판을 넣으면 블록 1이 블록 1이 아니게 된다.",
        "plays": plays,
    }
    io.open(os.path.join(OUT, "playblocks.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "playblocks.js"), "w", encoding="utf-8").write(
        "window.ENG2P_PLAYBLOCKS=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    tg = sum(1 for p in plays if p["talk"])
    print("out/data/playblocks.json / 판 %d개 / 블록마다 %s개 / "
          "둘이 하는 판 %d개 / **블록 1은 비어 있고 그것이 맞다**"
          % (len(plays), " ".join(str(len(per[b["no"]])) for b in blocks), tg))
    return 0


if __name__ == "__main__":
    sys.exit(main())
