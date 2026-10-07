#!/usr/bin/env python3
"""게임 1년치에 지금까지 만든 자료가 다 들어갔는가 (`docs/game.md`).

게임이 모든 공부를 대체한다 (2026-10-07 결정). 그러면 **게임 세션에 안 들어간
자료는 두 사람이 1년 동안 한 번도 못 보는 자료**다. 앱이 있을 때는 탭을 열어
볼 수 있었는데 게임에는 그 문이 없다.

그래서 세는 것이 아니라 **하나라도 빠지면 실패**로 건다.

    강 96 / 세트 288 / 카드 600 / 실제 녹음 52과 / 비상판 80 / 48주

그리고 하루의 꼴을 본다. 블록 넷이 120분인가, 두 사람이 늘 같은 곳에 있는가,
무대가 문서 표와 같은가.

**덱이 담은 영어는 여기서 안 본다.** 판 자료에서 왔고 그 자료는
`check_play_ground.py` 가 이미 근거 게이트를 건다. 두 곳에서 보면 한쪽만 고치는 날이 온다.

**기계가 안 보는 것: 그 하루가 두 사람에게 사는 것처럼 느껴지는가.**

사용법:
    python3 scripts/check_game.py
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME = os.path.join(ROOT, "out", "game", "sessions.json")
DATA = os.path.join(ROOT, "out", "data")
DOC = os.path.join(ROOT, "docs", "game.md")
TRANS = os.path.join(ROOT, "..", "media", "english", "transcripts")

FAIL = []
n = 0


def data(name):
    return json.load(open(os.path.join(DATA, name + ".json"), encoding="utf-8"))


def gap(what, have, want):
    """빠진 것을 실패로 낸다. **하나라도 빠지면 그 자료는 1년 동안 안 뜬다.**"""
    global n
    n += 1
    miss = sorted(set(want) - set(have), key=str)
    if miss:
        FAIL.append("%s %d개가 게임 1년에 안 들어갔다: %s" %
                    (what, len(miss), " ".join(str(x) for x in miss[:8])))
    return len(set(want) & set(have)), len(set(want))


def main():
    global n
    if not os.path.exists(GAME):
        print("[실패] out/game/sessions.json 이 없다. node scripts/derive_game.js 를 돌린다")
        return 1
    G = json.load(open(GAME, encoding="utf-8"))
    S = G.get("sessions") or []

    # 1. 288세션. 하루도 안 빠진다
    n += 1
    if len(S) != 288 or [x["s"] for x in S] != list(range(1, 289)):
        FAIL.append("세션이 1부터 288까지 한 번씩이 아니다 (%d개)" % len(S))

    # 2. 자료가 다 들어갔는가
    rows = []
    rows.append(("강", gap("강", [x["lecture"] for x in S],
                           [l["no"] for l in data("lectures")["items"]])))
    sets = [x["set"] for x in S]
    rows.append(("세트", gap("세트", sets, [s["id"] for s in data("sets")["items"]])))
    n += 1
    if len(sets) != len(set(sets)):
        FAIL.append("세트가 두 번 나오는 날이 있다. 세트는 하루 하나다")
    rows.append(("카드", gap("카드", [c for x in S for c in x["cards"]],
                             [c["id"] for c in data("cards")["items"]])))
    media = [os.path.basename(f)[:-3] for f in glob.glob(os.path.join(TRANS, "lle1-*.md"))]
    n += 1
    if len(media) < 52:
        FAIL.append("대본을 %d과만 찾았다. 52과여야 한다" % len(media))
    rows.append(("실제 녹음", gap("실제 녹음", [x["media"] for x in S], media)))
    rows.append(("비상판", gap("비상판", [x["emergency"] for x in S if x["emergency"]],
                               [e["no"] for e in data("emergency")["items"]])))
    rows.append(("주", gap("주", [x["week"] for x in S], range(1, 49))))
    rows.append(("과제집", gap("과제집 주", [x["week"] for x in S],
                               [t["week"] for t in data("tasks")["items"]])))
    rows.append(("강의록", gap("강의록", [x["lecture"] for x in S],
                               [h["lecture"] for h in data("handouts")["items"]])))

    # 3. 하루의 꼴. 블록 넷이 120분이다
    n += 1
    blocks = G.get("blocks") or []
    if [b.get("no") for b in blocks] != [1, 2, 3, 4] or sum(b.get("minutes", 0) for b in blocks) != 120:
        FAIL.append("블록 넷이 120분이 아니다: %s" %
                    " ".join("%s:%s" % (b.get("no"), b.get("minutes")) for b in blocks))

    src = open(DOC, encoding="utf-8").read()

    # 3b. **블록 넷 다 같이 하고 같이 말한다** (개정문 20번). 대화 금지 블록이 남으면 실패다
    n += 1
    quiet = [str(b.get("no")) for b in blocks if not (b.get("talk") and b.get("together"))]
    if quiet:
        FAIL.append("같이 말하지 않는 블록이 있다: %s. 하루 내내 붙어서 같이 한다" % " ".join(quiet))

    # 4. 무대가 문서 표와 같은가. **문서가 원본이다**
    table = {}
    for m in re.finditer(r"^\| (Q\d) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \| "
                         r"([^|]+?) \|\s*$", src, re.M):
        table[m.group(1)] = [m.group(i).strip() for i in range(2, 7)]
    n += 1
    if sorted(table) != ["Q1", "Q2", "Q3", "Q4"]:
        FAIL.append("docs/game.md 4장 무대 표에서 분기 넷을 못 읽었다")
    bad = []
    for x in S:
        t = table.get(x["quarter"])
        p = x.get("places") or {}
        got = [x.get("stage"), p.get("1"), p.get("2"), p.get("3"), p.get("4")]
        if t != got:
            bad.append(x["s"])
    n += 1
    if bad:
        FAIL.append("무대가 문서 표와 다른 세션이 %d개다 (%s). derive_game.js 를 다시 돌린다"
                    % (len(bad), " ".join(map(str, bad[:5]))))

    # 5. **두 사람이 늘 같이 있는가** (2026-10-07 결정).
    #    처음에는 블록 1 에서 둘을 다른 곳에 두고 그것을 이 판이 지켰다.
    #    기준서 2.3 이 블록 1 을 "같은 공간, 각자 헤드폰" 으로 적어 둔 것을 안 읽은 것이었다.
    #    지금은 블록마다 장소가 하나여야 한다. 사람별 장소 칸이 생기면 실패다.
    n += 1
    split = [x["s"] for x in S if set((x.get("places") or {}).keys()) != {"1", "2", "3", "4"}]
    if split:
        FAIL.append("블록마다 장소가 하나가 아닌 세션이 %d개다 (%s). 두 사람은 늘 같이 있다"
                    % (len(split), " ".join(map(str, split[:5]))))

    # 5b. **가리기에 기대던 판이 다 새 꼴을 받았나** (1.3, 2026-10-07).
    #     두 사람 사이에 가린 것이 없어지면 가리기로 돌던 판은 그대로 못 돈다.
    #     `solo_plays.md` 3장이 "그대로" 라고 안 적은 판이 그 판들이다.
    #     하나라도 새 꼴 없이 남으면 게임에서 그 판은 돌 길이 없다.
    solo = open(os.path.join(ROOT, "docs", "solo_plays.md"), encoding="utf-8").read()
    hid = []
    # **3장 표만 읽는다.** 같은 꼴 표가 7장에도 있다 (종이로 도는가). 둘을 섞으면 안 된다
    head = re.search(r"^\| # \| 판 \| 갈래 \| 어떻게 \|", solo, re.M)
    t3 = solo[head.start():] if head else ""
    t3 = t3[:t3.find("\n\n")] if "\n\n" in t3 else t3
    for m in re.finditer(r"^\| (\d+) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|\s*$", t3, re.M):
        no, name, how = int(m.group(1)), m.group(2).strip(), m.group(3).strip()
        if no <= 19 and "그대로" not in how:
            hid.append(name)
    sec = src[src.find("### 1.3"):src.find("## 2.")] if "### 1.3" in src else ""
    done = [m.group(1).strip() for m in re.finditer(r"^\| ([^|]+?) \| [^|]+? \| [^|]+? \|\s*$", sec, re.M)]
    n += 2
    if len(hid) < 10:
        FAIL.append("solo_plays.md 3장에서 가리기 판을 %d개만 읽었다" % len(hid))
    left = [h for h in hid if h not in done]
    if left:
        FAIL.append("가리기에 기대던 판 %d개가 새 꼴을 못 받았다: %s. docs/game.md 1.3 에 적는다"
                    % (len(left), " ".join(left)))

    # 5c. **이야기가 48주를 빠짐없이 덮는가** (`docs/world.md` 5장).
    #     한 주가 한 화다. 빠진 주는 이야기 없이 공부만 하는 주가 된다.
    #     화가 놓인 분기가 그 주 과제집의 분기와 다르면 이야기가 강과 어긋난다.
    world = open(os.path.join(ROOT, "docs", "world.md"), encoding="utf-8").read()
    wq = {}
    for blk in re.finditer(r"^### 5\.\d (Q\d) .*?(?=^### |^## )", world, re.M | re.S):
        for m in re.finditer(r"^\| (\d+) \| [^|]+? \| [^|]+? \| [^|]+? \| [^|]+? \|\s*$",
                             blk.group(0), re.M):
            wq.setdefault(int(m.group(1)), []).append(blk.group(1))
    tq = {t["week"]: t["quarter"] for t in data("tasks")["items"]}
    n += 2
    left = [w for w in range(1, 49) if len(wq.get(w, [])) != 1]
    if left:
        FAIL.append("docs/world.md 5장에 화가 한 번씩이 아닌 주가 %d개다: %s"
                    % (len(left), " ".join(map(str, left[:8]))))
    off = [w for w in wq if tq.get(w) not in wq[w]]
    if off:
        FAIL.append("docs/world.md 5장 화의 분기가 과제집과 다른 주가 있다: %s"
                    % " ".join(map(str, sorted(off)[:8])))

    # 6. 판. 그날 고른 판이 있고 덱이 비지 않는다
    n += 2
    nopick = [x["s"] for x in S if not x.get("pick")]
    if nopick:
        FAIL.append("오늘의 한 판이 없는 세션이 %d개다" % len(nopick))
    empty = [x["s"] for x in S if not x.get("decks")]
    if empty:
        FAIL.append("판 덱이 하나도 없는 세션이 %d개다" % len(empty))

    for f in FAIL:
        print("[실패] " + f)
    print("")
    for name, (got, want) in rows:
        print("  %-8s %4d / %d" % (name, got, want))
    print("")
    print("**기계가 안 보는 것: 그 하루가 두 사람에게 사는 것처럼 느껴지는가**")
    print("게임 1년 %d판 (세션 %d개, 자료 %d갈래) / 실패 %d" % (n, len(S), len(rows), len(FAIL)))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
