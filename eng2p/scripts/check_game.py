#!/usr/bin/env python3
"""게임 1년치에 지금까지 만든 자료가 다 들어갔는가 (`docs/game.md`).

게임이 모든 공부를 대체한다 (2026-10-07 결정). 그러면 **게임 세션에 안 들어간
자료는 두 사람이 1년 동안 한 번도 못 보는 자료**다. 앱이 있을 때는 탭을 열어
볼 수 있었는데 게임에는 그 문이 없다.

그래서 세는 것이 아니라 **하나라도 빠지면 실패**로 건다.

    강 96 / 세트 288 / 카드 600 / 실제 녹음 52과 / 비상판 80 / 48주

그리고 하루의 꼴을 본다. 블록 넷이 120분인가, 블록 1에서 둘이 다른 곳에 있는가,
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

    # 4. 무대가 문서 표와 같은가. **문서가 원본이다**
    src = open(DOC, encoding="utf-8").read()
    table = {}
    for m in re.finditer(r"^\| (Q\d) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \| "
                         r"([^|]+?) \| ([^|]+?) \|\s*$", src, re.M):
        table[m.group(1)] = [m.group(i).strip() for i in range(2, 8)]
    n += 1
    if sorted(table) != ["Q1", "Q2", "Q3", "Q4"]:
        FAIL.append("docs/game.md 4장 무대 표에서 분기 넷을 못 읽었다")
    bad = []
    for x in S:
        t = table.get(x["quarter"])
        p = x.get("places") or {}
        got = [x.get("stage"), p.get("1a"), p.get("1b"), p.get("2"), p.get("3"), p.get("4")]
        if t != got:
            bad.append(x["s"])
    n += 1
    if bad:
        FAIL.append("무대가 문서 표와 다른 세션이 %d개다 (%s). derive_game.js 를 다시 돌린다"
                    % (len(bad), " ".join(map(str, bad[:5]))))

    # 5. **블록 1에서 둘이 다른 곳에 있는가.** 각자 듣기라 서로 안 보는 것이 규칙이다
    n += 1
    same = [q for q, t in table.items() if t[1] == t[2]]
    if same:
        FAIL.append("블록 1에서 A 와 B 가 같은 곳에 있다: %s. 각자 듣기가 안 선다" % " ".join(same))

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
