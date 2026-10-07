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
    5.1 나들이 장소와 5.2 주별 손님이 범위 안이고 사람이 인물이나 단역(world.md 4.1)인가
    한 칸에 한 사람인가 ("Mr. and Mrs. Lee" 처럼 둘을 한 칸에 안 쓴다. TTS 목소리가 하나다)
    5.3 카드 내는 사람이 그 장소 명단에 있는가
    6장 꾸밈 표에서 world.md 6.1 달력의 날 이름이 나오는 줄이 셈한 주를 품는가
    하와이어 지명의 ʻokina 와 장음이 바른가 (U+02BB. 따옴표로 대신하지 않는다)

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

# 하와이어 지명. 바른 꼴 하나만 쓴다. ʻokina 는 U+02BB 이고 따옴표로 대신하지 않는다.
# 꼴을 느슨하게 찾아서 바른 꼴과 다르면 실패다. 목록에 없는 낱말은 못 본다.
HAWAIIAN = ["Waikīkī", "Oʻahu", "Hawaiʻi", "Kapiʻolani", "Koʻolau", "Lēʻahi", "Mōʻiliʻili",
            "Kalākaua", "Kūhiō", "Kūʻokoʻa", "Mānoa", "Kānaka Maoli", "lānai", "ʻEwa", "ʻilima",
            "Liliʻuokalani", "Ponoʻī", "ʻOe"]
OKINA_LIKE = "[\u02bb\u2018\u2019'`]"
MACRON = {"ā": "[aā]", "ē": "[eē]", "ī": "[iī]", "ō": "[oō]", "ū": "[uū]"}

# 한 칸에 한 사람. 둘을 한 칸에 적으면 TTS 목소리를 못 고른다
TWO_IN_ONE = re.compile(r"\band\b|&|/")

FAIL = []


def loose(word):
    """바른 꼴을 느슨한 정규식으로. ʻokina 자리는 따옴표 꼴이든 빠졌든 잡는다."""
    out = ""
    for ch in word:
        if ch == "\u02bb":
            out += OKINA_LIKE + "?"
        elif ch.lower() in MACRON:
            out += MACRON[ch.lower()] if ch.islower() else MACRON[ch.lower()].upper()
        else:
            out += re.escape(ch)
    return re.compile(r"(?<![A-Za-z\u02bb\u0101\u0113\u012b\u014d\u016b])" + out
                      + r"(?![A-Za-z\u0101\u0113\u012b\u014d\u016b])", re.I)


def check_hawaiian(name, text):
    for w in HAWAIIAN:
        for m in loose(w).finditer(text):
            got = m.group(0)
            # 첫 글자의 대소문자만 다를 수 있다 (문장 첫머리). 나머지는 한 글자도 달라선 안 된다
            if got != w and not (got[1:] == w[1:] and got[0].lower() == w[0].lower()):
                FAIL.append("%s 의 하와이어 표기가 틀렸다: %s (바른 꼴 %s)" % (name, got, w))


def weeks_of(cell):
    """"1~12", "16", "4, 6" 을 수 집합으로."""
    out = set()
    for part in re.split(r",\s*", cell.strip()):
        m = re.fullmatch(r"(\d+)\s*~\s*(\d+)", part.strip())
        if m:
            out |= set(range(int(m.group(1)), int(m.group(2)) + 1))
        elif part.strip().isdigit():
            out.add(int(part.strip()))
        else:
            return None
    return out


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


def sub(src, head):
    """### 이나 ## 하나 밑. 다음 같은 높이 이상의 머리까지."""
    i = src.find(head)
    if i < 0:
        return ""
    m = re.compile(r"\n#{2,%d} " % head.count("#")).search(src, i + len(head))
    return src[i:m.start() if m else len(src)]


def calendar(world):
    """world.md 6.1 달력. 날 이름과 셈한 주."""
    import datetime
    start = datetime.date(2026, 8, 10)
    out = []
    for c in rows(sub(world, "### 6.1 달력"), 6):
        try:
            d = datetime.date.fromisoformat(c[1])
        except ValueError:
            FAIL.append("world.md 6.1 달력의 날짜가 날짜가 아니다: " + c[1])
            continue
        out.append({"name": c[0], "date": c[1], "week": (d - start).days // 7 + 1,
                    "dow": (d - start).days % 7 + 1, "said_week": c[2]})
    return out


def people_of(cell):
    return [p.strip() for p in re.split(r",\s*", cell) if p.strip()]


def main():
    src = open(DOC, encoding="utf-8").read()
    world = open(WORLD, encoding="utf-8").read()

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

    def place_rows(sec):
        out = {}
        for c in rows(sec, 6):
            out[c[0]] = {"name": c[0], "building": c[1], "floor": int(c[2]) if c[2].isdigit() else None,
                         "people": people_of(c[3]), "light": c[4], "sound": c[5]}
        return out

    # 장소. 5장은 무대, 5.1 은 나들이
    places = place_rows(section(src, "## 5. 장소"))
    trips = place_rows(section(src, "## 5.1 나들이 장소"))
    for t in trips:
        if t in places:
            FAIL.append("나들이 장소 %s 가 5장 무대 장소와 겹친다" % t)

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

    # 사람이 world.md 4장 인물 표에 있는가. 단역은 4.1 표에 있고 나들이와 손님 자리에만 선다
    w = section(world, "## 4. 인물")
    cast = {c[0] for c in rows(w, 5)}
    walkons = {c[0] for c in rows(sub(world, "### 4.1 단역"), 4)}
    if len(cast) < 10:
        FAIL.append("world.md 4장 인물 표에서 %d명만 읽었다" % len(cast))
    for who in sorted(cast | walkons):
        if TWO_IN_ONE.search(who):
            FAIL.append("world.md 4장 한 칸에 사람이 둘이다: %s. 사람마다 한 칸으로 나눈다" % who)
    for kind, table, ok in (("장소", places, cast), ("나들이 장소", trips, cast | walkons)):
        for p in table.values():
            for who in p["people"]:
                if TWO_IN_ONE.search(who):
                    FAIL.append("%s %s 의 사람 칸에 둘이 한 칸이다: %s" % (kind, p["name"], who))
                if who not in ok:
                    FAIL.append("%s %s 의 사람 %s 가 world.md 인물 표에 없다" % (kind, p["name"], who))
            if p["building"] != "바깥" and p["building"] not in bld:
                FAIL.append("%s 의 건물 %s 가 4장 건물 표에 없다" % (p["name"], p["building"]))
            elif p["building"] in bld and p["floor"] and p["floor"] > bld[p["building"]]["floors"]:
                FAIL.append("%s 가 %s 의 %d층에 있는데 건물은 %d층이다"
                            % (p["name"], p["building"], p["floor"], bld[p["building"]]["floors"]))

    # 5.2 주별 손님. 주 1~48, 날 1~6, 블록 1~4, 장소는 5장이나 5.1, 사람은 인물이나 단역
    guests = []
    for c in rows(section(src, "## 5.2 주별 손님"), 6):
        wk, days, blks = weeks_of(c[0]), weeks_of(c[1]), weeks_of(c[2])
        tag = " | ".join(c[:5])
        if not wk or len(wk) != 1 or not wk <= set(range(1, 49)):
            FAIL.append("5.2 손님 표의 주가 1~48 하나가 아니다: " + tag)
            continue
        if not days or not days <= set(range(1, 7)):
            FAIL.append("5.2 손님 표의 날이 1~6 이 아니다: " + tag)
            continue
        if not blks or not blks <= set(range(1, 5)):
            FAIL.append("5.2 손님 표의 블록이 1~4 가 아니다: " + tag)
            continue
        if c[3] not in places and c[3] not in trips:
            FAIL.append("5.2 손님 표의 장소 %s 가 5장에도 5.1 에도 없다" % c[3])
        ppl = people_of(c[4])
        for who in ppl:
            if TWO_IN_ONE.search(who):
                FAIL.append("5.2 손님 표의 사람 칸에 둘이 한 칸이다: " + who)
            elif who not in cast | walkons:
                FAIL.append("5.2 손님 %s 가 world.md 4장 인물도 4.1 단역도 아니다" % who)
        if not c[5]:
            FAIL.append("5.2 손님 표에 까닭이 없다: " + tag)
        guests.append({"week": min(wk), "days": sorted(days), "blocks": sorted(blks),
                       "place": c[3], "people": ppl, "why": c[5]})
    if not guests:
        FAIL.append("town.md 5.2 주별 손님 표를 못 읽었다")

    # 인물 표의 사람이 동네 어디에도 없으면 그 사람은 만날 곳이 없다
    met = {who for p in list(places.values()) + list(trips.values()) for who in p["people"]}
    met |= {who for gg in guests for who in gg["people"]}
    for who in sorted((cast | walkons) - met):
        FAIL.append("인물 %s 를 만날 장소가 5장, 5.1, 5.2 어디에도 없다" % who)

    # 5.3 카드 내는 사람. 그 장소 명단에 있어야 낸다
    hosts = []
    for c in rows(section(src, "## 5.3 카드 내는 사람"), 3):
        if c[0] not in places:
            FAIL.append("5.3 카드 내는 장소 %s 가 5장에 없다" % c[0])
            continue
        for who in people_of(c[2]):
            if who not in places[c[0]]["people"]:
                FAIL.append("5.3 %s 의 카드를 %s 가 내는데 5장 명단에 없다" % (c[0], who))
        hosts.append({"place": c[0], "genres": people_of(c[1]), "hosts": people_of(c[2])})

    # 6장 꾸밈과 world.md 6.1 달력. 날 이름이 든 줄의 주가 셈한 주를 품어야 한다
    seasons_rows = rows(section(src, "## 6. 철과 꾸밈"), 3)
    cal = calendar(world)
    if len(cal) < 8:
        FAIL.append("world.md 6.1 달력에서 날을 %d개만 읽었다" % len(cal))
    for day in cal:
        hit = [c for c in seasons_rows if day["name"] in c[1] or day["name"] in c[2]]
        if not hit:
            FAIL.append("달력의 %s 가 town.md 6장 꾸밈 표에 없다" % day["name"])
        for c in hit:
            wk = weeks_of(c[0])
            if wk is None or day["week"] not in wk:
                FAIL.append("town.md 6장 %s 줄의 주(%s)가 달력 셈 %d주를 안 품는다"
                            % (day["name"], c[0], day["week"]))

    # 하와이어 표기. 이 셈이 읽는 세 문서를 다 본다
    check_hawaiian("town.md", src)
    check_hawaiian("world.md", world)

    low = src.lower()
    for b in BRANDS:
        if b.lower() in low:
            FAIL.append("실제 상표가 있다: " + b)

    for f in FAIL:
        print("[실패] " + f)
    if FAIL:
        print("동네를 안 냈다. 실패 %d" % len(FAIL))
        return 1

    seasons = [{"weeks": c[0], "season": c[1], "decor": c[2]} for c in seasons_rows]
    life = [{"what": c[0], "when": c[1]} for c in rows(section(src, "## 7. 사는 것처럼"), 2)]
    backdrop = [{"name": c[0], "where": c[1], "look": c[2]} for c in rows(section(src, "## 2. 배경"), 3)]
    obj = {
        "note": "게임의 동네. docs/town.md 의 표에서 뽑는다. 손으로 안 고친다. scripts/derive_town.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "동네는 지은 것이다. 배경 지형만 실제 자료에서 깎는다 (docs/sources.md).",
        "generator": "scripts/derive_town.py",
        "source": "docs/town.md, docs/world.md 4장 6.1",
        "units": "m. x 동쪽, y 북쪽, 해안선 y=0",
        "size": [1200, 900],
        "backdrop": backdrop,
        "buildings": sorted(bld.values(), key=lambda b: b["name"]),
        "places": sorted(places.values(), key=lambda p: p["name"]),
        "trips": sorted(trips.values(), key=lambda p: p["name"]),
        "guests": guests,
        "cardHosts": hosts,
        "calendar": [{"name": d["name"], "date": d["date"], "week": d["week"], "day": d["dow"]} for d in cal],
        "seasons": seasons,
        "life": life,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print("out/game/town.json / 건물 %d / 장소 %d / 나들이 %d / 손님 %d / 철 %d / 사는 것 %d / 실패 0"
          % (len(bld), len(places), len(trips), len(guests), len(seasons), len(life)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
