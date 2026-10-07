#!/usr/bin/env python3
"""게임의 장면 288세션 (`docs/scenes.md`). `out/game/scenes.json` 을 낸다.

세션 JSON 이 그날 무엇을 하는지 정했다. 여기서는 **어디서, 누구와, 무슨 말로** 를 붙인다.
뼈대는 셈으로 나온다 (world.md 5장 화, game.md 4장 장소, town.md 5장 사람).
대사는 scenes.md 3장 표에 적은 것뿐이다.

내기 전에 본다. 하나라도 어긋나면 실패로 내고 JSON 을 안 쓴다.

    대사가 근거 대본 한 사람의 말 안에서 이어진 문장 그대로인가 (이름 자리만 바꿀 수 있다)
    그 대본을 그 세션까지 이미 들었나
    말하는 NPC 가 그 블록 장소에 있는 사람인가
    48주가 다 화를 받았나. 세션마다 블록 넷이 장소와 사람을 가졌나
    판정형 카드의 답이 장면에 안 실렸나

**기계가 안 보는 것: 그 장면에서 두 사람이 웃는가.**

사용법:
    python3 scripts/derive_scenes.py
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = os.path.join(ROOT, "docs")
GAME = os.path.join(ROOT, "out", "game", "sessions.json")
CARDS = os.path.join(ROOT, "out", "data", "cards.json")
TRANS = os.path.join(ROOT, "..", "media", "english", "transcripts")
OUT = os.path.join(ROOT, "out", "game", "scenes.json")

FAIL = []

# 카드 유형이 장면 갈래가 된다 (game.md 5장)
GENRE = {"판정": "확인", "압박": "시간", "확장": "다른 날 다른 주문",
         "역할": "퀘스트", "repair": "되묻기"}
DAYPART = {1: "열기", 6: "풀기"}

# 이름 자리. 대본의 사람 이름(대문자로 시작하는 낱말)과 바꿀 수 있다
NAME = r"[A-Z][a-z]+"
SPELL = r"[A-Z](?:-[A-Z])+"
SLOTS = {"{A}": NAME, "{B}": NAME, "{A철자}": SPELL, "{B철자}": SPELL,
         "{A틀린철자}": SPELL, "{B틀린철자}": SPELL}


def doc(name):
    return open(os.path.join(DOCS, name), encoding="utf-8").read()


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
    return out[1:]


def sentences(text):
    """문장으로 끊는다. 끝 부호를 붙여 둔다. 큰따옴표와 말줄임은 버린다."""
    text = text.replace("’", "'").replace("...", " ").replace('"', " ")
    return [s.strip() for s in re.findall(r"[^.!?]+[.!?]+", text) if s.strip()]


def transcript(name):
    """대본의 말 한 마디씩. (사람, 문장들)"""
    p = os.path.join(TRANS, name + ".md")
    if not os.path.exists(p):
        return None
    body = open(p, encoding="utf-8").read().split("## 대본", 1)[-1]
    # 이름 줄 다음 문단에 말이 오는 대본이 있다 ("Marsha:" 다음 줄에 "Anna? Where are you?").
    # 이름 없는 문단은 앞 사람의 다음 마디로 본다
    out = []
    who = None
    for para in re.split(r"\n\s*\n", body):
        if not para.strip():
            continue
        m = re.match(r"\s*([A-Z][A-Za-z ]*?):\s*(.*)", para, re.S)
        text = m.group(2) if m else para
        if m:
            who = m.group(1)
        if who and text.strip():
            out.append(sentences(" ".join(text.split())))
    return out


def grounded(line, utts):
    """줄이 어느 한 마디 안에서 이어진 문장들 그대로인가. 이름 자리만 바꿀 수 있다."""
    pat = re.escape(" ".join(sentences(line)) or line.strip())
    for k, v in SLOTS.items():
        pat = pat.replace(re.escape(k), v)
    rx = re.compile(r"^" + pat + r"$")
    for u in utts:
        for i in range(len(u)):
            for j in range(i + 1, len(u) + 1):
                if rx.match(" ".join(u[i:j])):
                    return True
    return False


def main():
    S = json.load(open(GAME, encoding="utf-8"))["sessions"]
    cards = {c["id"]: c for c in json.load(open(CARDS, encoding="utf-8"))["items"]}

    # 화. world.md 5장
    ep = {}
    for blk in re.finditer(r"^### 5\.\d (Q\d) .*?(?=^### |^## )", doc("world.md"), re.M | re.S):
        for c in rows(blk.group(0), 5):
            if c[0].isdigit():
                ep[int(c[0])] = {"title": c[1], "crux": c[2], "lectures": c[3],
                                 "layers": [int(x) for x in c[4].split() if x.isdigit()]}
    miss = [w for w in range(1, 49) if w not in ep]
    if miss:
        FAIL.append("world.md 5장에 화가 없는 주: " + " ".join(map(str, miss[:8])))

    # 장소. game.md 4장
    stage = {}
    for m in re.finditer(r"^\| (Q\d) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|\s*$",
                         doc("game.md"), re.M):
        stage[m.group(1)] = [m.group(i).strip() for i in range(3, 7)]

    # 사람. town.md 5장
    who = {c[0]: [p.strip() for p in c[3].split(",") if p.strip()]
           for c in rows(section(doc("town.md"), "## 5. 장소"), 6)}

    # 대사. scenes.md 3장
    lines = {}
    heard = {}
    seen = set()
    for x in S:
        seen.add(x["media"])
        heard[x["s"]] = set(seen)
    cache = {}
    for c in rows(section(doc("scenes.md"), "## 3. 대사"), 5):
        try:
            s, b = int(c[0]), int(c[1])
        except ValueError:
            FAIL.append("대사 표의 세션이나 블록이 수가 아니다: " + " | ".join(c))
            continue
        spk, text, src = c[2], c[3], c[4]
        if not 1 <= s <= len(S):
            FAIL.append("대사 표에 없는 세션이다: %d" % s)
            continue
        if src not in cache:
            cache[src] = transcript(src)
        if cache[src] is None:
            FAIL.append("세션 %d 대사의 근거 대본이 없다: %s" % (s, src))
            continue
        if src not in heard[s]:
            FAIL.append("세션 %d 대사가 아직 안 들은 %s 에서 왔다: %s" % (s, src, text))
        if not grounded(text, cache[src]):
            FAIL.append("세션 %d 대사가 %s 한 마디 안의 이어진 문장이 아니다: %s" % (s, src, text))
        place = stage.get(S[s - 1]["quarter"], [None] * 4)[b - 1] if 1 <= b <= 4 else None
        if place is None:
            FAIL.append("세션 %d 대사의 블록이 1~4 가 아니다" % s)
            continue
        if spk != "두 사람" and spk not in who.get(place, []):
            FAIL.append("세션 %d 블록 %d 의 %s 에 %s 가 없다 (town.md 5장)" % (s, b, place, spk))
        lines.setdefault((s, b), []).append({"who": spk, "say": text, "from": src,
                                            "wait": spk == "두 사람"})

    out = []
    for x in S:
        e = ep.get(x["week"], {})
        blocks = []
        for b in range(1, 5):
            place = stage.get(x["quarter"], [None] * 4)[b - 1]
            ppl = who.get(place)
            if not place or ppl is None:
                FAIL.append("세션 %d 블록 %d 의 장소나 사람이 없다: %s" % (x["s"], b, place))
                ppl = []
            blk = {"no": b, "place": place, "people": ppl, "lines": lines.get((x["s"], b), [])}
            if b == 3:
                host = next((p for p in ppl if p != "라디오"), None)
                blk["cards"] = [{"id": cid, "host": host,
                                 "genre": GENRE.get(cards.get(cid, {}).get("type"), "확인")}
                                for cid in x["cards"]]
            blocks.append(blk)
        out.append({"s": x["s"], "week": x["week"], "day": x["day"], "quarter": x["quarter"],
                    "part": DAYPART.get(x["day"], "다시 오기"),
                    "episode": {"no": x["week"], "title": e.get("title"), "crux": e.get("crux"),
                                "layers": e.get("layers", [])},
                    "blocks": blocks})

    # 판정형 답이 실리지 않았나. 카드 자료의 답 글이 장면 어디에도 없어야 한다
    blob = json.dumps(out, ensure_ascii=False)
    for c in cards.values():
        ans = (c.get("a") or {}).get("answer")
        if ans and len(ans) > 12 and ans in blob:
            FAIL.append("카드 %s 의 답이 장면에 실렸다" % c["id"])

    for f in FAIL:
        print("[실패] " + f)
    if FAIL:
        print("장면을 안 냈다. 실패 %d" % len(FAIL))
        return 1

    n = sum(len(v) for v in lines.values())
    obj = {
        "note": "게임의 장면 288세션. docs/scenes.md 와 world.md, game.md, town.md 에서 뽑는다. "
                "손으로 안 고친다. scripts/derive_scenes.py 를 다시 돌린다.",
        "grade": "A",
        "gradeWhy": "대사는 VOA 실제 녹음 대본의 줄 그대로다. 이름 자리만 바꾼다. 뼈대는 다른 문서에서 셈으로 나온다.",
        "generator": "scripts/derive_scenes.py",
        "source": "docs/scenes.md, docs/world.md 5장, docs/game.md 4장, docs/town.md 5장, out/game/sessions.json",
        "slots": sorted(SLOTS),
        "count": len(out),
        "lines": n,
        "sessions": out,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write("\n")
    have = sorted({s for s, _ in lines})
    print("out/game/scenes.json / 세션 %d / 대사 %d줄 (세션 %d개) / 실패 0" % (len(out), n, len(have)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
