#!/usr/bin/env python3
"""게임의 동네 (`docs/town.md`). 문서의 표를 읽어 `out/game/town.json` 을 낸다.

**문서가 원본이다.** 언리얼은 이 JSON 을 읽어 동네를 짓는다. 좌표를 C++ 에 박으면
문서와 게임이 두 벌이 되고 언젠가 어긋난다 (derive_game.js 와 같은 까닭).

내기 전에 본다. 하나라도 어긋나면 실패로 내고 JSON 을 안 쓴다.

    장소 열넷이 game.md 4장 무대 표와 같은가
    장소의 사람이 world.md 4장 인물 표에 있는가
    장소의 건물이 4장 건물 표에 있는가
    건물이 판 안에 있고 서로 안 겹치는가
    실제 상표 이름이 없는가

**기계가 안 보는 것: 걷고 싶은 동네인가.**

사용법:
    python3 scripts/derive_town.py
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC = os.path.join(ROOT, "docs", "town.md")
GAME = os.path.join(ROOT, "docs", "game.md")
WORLD = os.path.join(ROOT, "docs", "world.md")
OUT = os.path.join(ROOT, "out", "game", "town.json")

# 동네에 나오면 안 되는 실제 상표. 하와이에 흔한 것과 편의점 카페 체인 위주다.
# **목록이 다 막지는 못한다.** 새 이름을 지을 때 사람이 한 번 더 본다.
BRANDS = ["7-Eleven", "Seven Eleven", "ABC Stores", "Starbucks", "McDonald", "Zippy",
          "L&L", "Foodland", "Safeway", "Longs", "CVS", "Walmart", "Target", "Costco",
          "Hilton", "Marriott", "Sheraton", "Hyatt", "Royal Hawaiian", "Outrigger",
          "Ala Moana Center", "TheBus", "Matson", "Hawaiian Airlines", "Kona Brewing",
          "Leonard", "Coca-Cola", "Pepsi", "Spam"]

FAIL = []


def section(src, head):
    i = src.find(head)
    if i < 0:
        return ""
    j = src.find("\n## ", i + len(head))
    return src[i:j if j > 0 else len(src)]


def rows(sec, cols):
    out = []
    for line in sec.splitlines():
        if not line.startswith("| ") or line.startswith("|---"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) == cols:
            out.append(cells)
    return out[1:]  # 머리줄을 뺀다


def main():
    src = open(DOC, encoding="utf-8").read()

    # 건물
    bld = {}
    for c in rows(section(src, "## 4. 건물"), 7):
        try:
            x, y, w, d, fl = (int(v) for v in c[1:6])
        except ValueError:
            FAIL.append("건물 표의 수가 수가 아니다: " + c[0])
            continue
        bld[c[0]] = {"name": c[0], "x": x, "y": y, "w": w, "d": d, "floors": fl, "look": c[6]}
    if len(bld) < 8:
        FAIL.append("4장 건물 표에서 %d개만 읽었다" % len(bld))

    # 판 안에 있고 안 겹치는가. 건물은 (x, y) 가 가운데인 네모다
    for b in bld.values():
        if not (0 <= b["x"] - b["w"] / 2 and b["x"] + b["w"] / 2 <= 1200 and
                0 < b["y"] - b["d"] / 2 and b["y"] + b["d"] / 2 <= 900):
            FAIL.append("건물이 판 밖이나 바다에 있다: " + b["name"])
    L = list(bld.values())
    for i in range(len(L)):
        for j in range(i + 1, len(L)):
            a, b = L[i], L[j]
            if abs(a["x"] - b["x"]) * 2 < a["w"] + b["w"] and abs(a["y"] - b["y"]) * 2 < a["d"] + b["d"]:
                FAIL.append("건물이 겹친다: %s 와 %s" % (a["name"], b["name"]))

    # 장소
    places = {}
    for c in rows(section(src, "## 5. 장소"), 6):
        people = [p.strip() for p in re.split(r",\s*", c[3]) if p.strip()]
        places[c[0]] = {"name": c[0], "building": c[1], "floor": int(c[2]) if c[2].isdigit() else None,
                        "people": people, "light": c[4], "sound": c[5]}

    # game.md 4장 무대 표의 장소와 같은가
    g = open(GAME, encoding="utf-8").read()
    want = set()
    for m in re.finditer(r"^\| (Q\d) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|\s*$", g, re.M):
        want |= {m.group(i).strip() for i in range(3, 7)}
    if len(want) < 10:
        FAIL.append("game.md 4장 무대 표에서 장소를 %d개만 읽었다" % len(want))
    for p in sorted(want - set(places)):
        FAIL.append("game.md 무대 표의 장소가 town.md 5장에 없다: " + p)
    for p in sorted(set(places) - want):
        FAIL.append("town.md 5장에 무대 표에 없는 장소가 있다: " + p)

    # 사람이 world.md 4장 인물 표에 있는가
    w = section(open(WORLD, encoding="utf-8").read(), "## 4. 인물")
    cast = {c[0] for c in rows(w, 5)}
    if len(cast) < 10:
        FAIL.append("world.md 4장 인물 표에서 %d명만 읽었다" % len(cast))
    for p in places.values():
        for who in p["people"]:
            if who not in cast:
                FAIL.append("%s 의 사람 %s 가 world.md 인물 표에 없다" % (p["name"], who))
        if p["building"] != "바깥" and p["building"] not in bld:
            FAIL.append("%s 의 건물 %s 가 4장 건물 표에 없다" % (p["name"], p["building"]))
        elif p["building"] in bld and p["floor"] and p["floor"] > bld[p["building"]]["floors"]:
            FAIL.append("%s 가 %s 의 %d층에 있는데 건물은 %d층이다"
                        % (p["name"], p["building"], p["floor"], bld[p["building"]]["floors"]))

    # 인물 표의 사람이 동네 어디에도 없으면 그 사람은 만날 곳이 없다
    met = {who for p in places.values() for who in p["people"]}
    for who in sorted(cast - met):
        if who not in ("Dr. Patel",):  # 진료소는 장면 밖 장소다. 화가 부를 때만 간다
            FAIL.append("인물 %s 를 만날 장소가 5장에 없다" % who)

    low = src.lower()
    for b in BRANDS:
        if b.lower() in low:
            FAIL.append("실제 상표가 있다: " + b)

    for f in FAIL:
        print("[실패] " + f)
    if FAIL:
        print("동네를 안 냈다. 실패 %d" % len(FAIL))
        return 1

    seasons = [{"weeks": c[0], "season": c[1], "decor": c[2]} for c in rows(section(src, "## 6. 철과 꾸밈"), 3)]
    life = [{"what": c[0], "when": c[1]} for c in rows(section(src, "## 7. 사는 것처럼"), 2)]
    backdrop = [{"name": c[0], "where": c[1], "look": c[2]} for c in rows(section(src, "## 2. 배경"), 3)]
    obj = {
        "note": "게임의 동네. docs/town.md 의 표에서 뽑는다. 손으로 안 고친다. scripts/derive_town.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "동네는 지은 것이다. 배경 지형만 실제 자료에서 깎는다 (docs/sources.md).",
        "generator": "scripts/derive_town.py",
        "source": "docs/town.md",
        "units": "m. x 동쪽, y 북쪽, 해안선 y=0",
        "size": [1200, 900],
        "backdrop": backdrop,
        "buildings": sorted(bld.values(), key=lambda b: b["name"]),
        "places": sorted(places.values(), key=lambda p: p["name"]),
        "seasons": seasons,
        "life": life,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print("out/game/town.json / 건물 %d / 장소 %d / 철 %d / 사는 것 %d / 실패 0"
          % (len(bld), len(places), len(seasons), len(life)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
