#!/usr/bin/env python3
"""판 덱 글에 든 라디오 인물 이름의 처리 (`docs/game_data.md` 6장). `out/game/deck_names.json` 을 낸다.

덱의 글은 52과 대본 줄에서 왔다. 그래서 라디오 인물 이름(Anna, Pete, Marsha ...)이 그대로 있다.
**NPC 가 그 줄을 읽으면 "I'm Anna." 가 NPC 의 말이 된다.** 라디오 인물과 동네 사람을 섞지 않는다 (world.md 4장).
라디오 소리(실제 녹음 구간)로 낼 때는 이름이 있어도 된다. 그 목소리는 Anna 가 맞기 때문이다.

덱 항목마다 이름이 있는지 보고 처리를 하나 적는다.

    swap  이름이 **그냥 부르는 말**이고 이름 자리({A} {B})로 바꾸어도 글이 대본 그대로인 항목.
          바꾼 글이 그날 대본에서 이어진 문장 그대로여야 한다 (장면과 같은 grounded). 이름만 다르다
    skip  그 밖의 모든 항목. NPC 가 읽지 않는다. 이름이 자기소개이거나 남을 가리키거나 글자 이야기이거나
          대본에서 화자 이름이 아니어서 이름 자리가 대신 못 하는 것이다 (scenes.md 2.1)

그냥 부르는 말은 넷이다. 이름으로 시작해 쉼표나 느낌표로 이어지는 것, 인사 뒤의 이름, 문장 끝의 ", 이름",
"Are you 이름?" 이다. "I'm Anna." 나 "Anna with two n's" 나 "Anna's" 는 아니다.

누가 읽나는 6.2 표다. NPC 가 읽는 판(reask cutin clash twohalf overlap swapline chain rebound mirror hearme)과
카드 번호로 부르는 판(wall onesee whose flip)은 항목마다 처리가 있어야 한다.
라디오 구간으로 내는 판(relay ladder wave)은 줄 번호와 초뿐이라 글이 없다. 이름이 있어도 실제 녹음이라 된다.

**기계가 안 보는 것: 바꾼 글이 그 자리에서 자연스러운가.** 부르는 말 넷은 문법이 아니라 꼴로 본다.

사용법:
    python3 scripts/derive_deck_names.py
"""
import hashlib
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import derive_scenes as DS      # noqa: E402  읽기만 한다
from derive_judge import doc_rows  # noqa: E402
from derive_transcripts import body_of  # noqa: E402
from derive_replies import Lessons as _Lessons, block_lists, blocked  # noqa: E402

ROOT = DS.ROOT
SESS = DS.GAME
CARDS = DS.CARDS
TRANS = DS.TRANS
OUT = os.path.join(ROOT, "out", "game", "deck_names.json")

TITLES = {"Ms", "Mr", "Mrs", "Dr"}
# 화자 칸에 오지만 이름이 아닌 것. Phone 은 라디오 이야기 속 인물 이름이라 뺀다 (남긴다)
NOT_NAMES = (set(DS.ROLE_LABELS) - {"Phone"}) | {"Note", "Master", "Worker", "Truck", "BOTH", "Both", "Director"}
SPEAKER = re.compile(r"^[A-Z][A-Za-z .'-]{0,20}:\s*")
SLOTS = ["{A}", "{B}"]


def radio_names():
    """대본 52편의 화자 칸에서 사람 이름을 모은다. 이름 -> 나온 과들."""
    got = {}
    for i in range(1, 53):
        m = "lle1-%02d" % i
        body = DS.body(m) or ""
        for lab in re.finditer(r"^\s*([A-Z][A-Za-z .]*?):", body, re.M):
            label = lab.group(1).strip()
            if len(label) > 14 or len(label.split()) > 3:
                continue
            for t in re.findall(r"[A-Za-z]+", label):
                if t in TITLES or t in NOT_NAMES or len(t) < 3 or not t[0].isupper():
                    continue
                got.setdefault(t, set()).add(m)
    return {k: sorted(v) for k, v in got.items()}


def name_rx(names):
    # 긴 이름이 먼저 맞아야 한다 (Anne 과 Anna 는 다르다)
    alt = "|".join(sorted(map(re.escape, names), key=lambda n: (-len(n), n)))
    return re.compile(r"(?<![A-Za-z])(%s)(?![A-Za-z])" % alt)


GREET = r"(?:oh,\s*)?(?:hi|hello|hey|bye|goodbye|good-bye|thanks|thank you|sorry|excuse me|see you|good morning)"


def addressee(text, a, b):
    """text[a:b] 의 이름이 그냥 부르는 말인가."""
    before, after = text[:a], text[b:]
    start = re.search(r"(?:^|[.!?]\s+|[\"“]\s*)$", before) is not None
    if start and re.match(r"[,!?]", after):
        return True                                               # Anna, ... / Anna! / Anna?
    if re.search(r"(?:^|[.!?]\s+|,\s+)" + GREET + r"\s*,?\s*$", before, re.I) and re.match(r"\s*[.!?,]", after):
        return True                                               # Hi, Pete.
    if re.search(r",\s+$", before) and re.match(r"\s*[.!?](?:\s|$)", after):
        return True                                               # Thanks, Pete! / No, Anna!
    if re.search(r"\bAre you\s+$", before) and re.match(r"\s*[?,]", after):
        return True                                               # Are you Anna?
    return False


def handle(text, rx, medias, lessons, slot):
    """(처리, 바꾼 글, 까닭, 이름들, 근거 과). 이름이 없으면 None.

    medias 는 바꾼 글이 그대로 있는지 볼 과들이다. 덱 항목은 그날 과 하나, 카드 재료는 들은 과 전부다.
    """
    hits = [(m.group(1), m.start(1), m.end(1)) for m in rx.finditer(text)]
    if not hits:
        return None
    names = sorted({h[0] for h in hits})
    if len(names) > 1:
        return "skip", None, "이름이 둘 이상이다. 누가 {A} 이고 {B} 인지 못 정한다", names, None
    if not all(addressee(text, a, b) for _, a, b in hits):
        return "skip", None, "이름이 부르는 말이 아니다 (자기소개, 남을 가리킴, 글자 이야기, 소유)", names, None
    if re.search(r"[()\[\]]", text):
        return "skip", None, "무대 지시나 괄호가 든 글이다. 소리 내어 읽을 글이 아니다", names, None
    if not re.search(r"[.!?][\"”’']?\s*$", text.strip()):
        return "skip", None, "문장이 끝나기 전에 잘린 글이다. NPC 가 읽으면 말이 끊긴다", names, None
    swapped = text
    for _, a, b in sorted(hits, key=lambda h: -h[1]):
        swapped = swapped[:a] + slot + swapped[b:]
    spoke = [m for m in medias if names[0] in set(DS.names(m))]
    if not spoke:
        return "skip", None, "대본 화자 이름이 아니라 이름 자리가 대신 못 한다 (scenes.md 2.1)", names, None
    for m in spoke:
        utts, nm = lessons.utts(m)
        if utts and DS.grounded(swapped, utts, nm):
            why = blocked(swapped, lessons.lists)
            if why:
                return "skip", None, "NPC 가 읽으면 안 되는 말이 있다: " + why, names, None
            return "swap", swapped, "부르는 말이고 바꾼 글이 %s 대본 그대로다" % m, names, m
    return "skip", None, "바꾼 글이 들은 대본의 한 마디 안에서 이어진 문장 그대로가 아니다", names, None


class Lessons(_Lessons):
    """대본 읽기는 응답 파생기의 것을 쓴다. 호칭 붙은 화자 칸도 읽는다."""

    def __init__(self):
        self.cache = {}

    def lines(self, m):
        p = os.path.join(TRANS, m + ".md")
        return body_of(open(p, encoding="utf-8").read())


def eid(deck, field, text):
    return "d" + hashlib.sha1(("%s\n%s\n%s" % (deck, field, text)).encode("utf-8")).hexdigest()[:10]


# 판 -> 목소리. 6.2 표가 원본이다
def deck_voices():
    rows = doc_rows("### 6.2 ", 4)
    return None if rows is None else {r[0]: {"voice": r[1], "text": r[2], "why": r[3]} for r in rows}


def units(deck, item, media, lessons):
    """덱 항목 하나가 내는 글들. (칸 이름, 글, 덧붙임)"""
    out = []
    if deck in ("reask", "cutin", "overlap"):
        out.append(("line", item, {}))
    elif deck == "clash":
        out.append(("a.line", item["a"]["line"], {"who": item["a"]["who"]}))
        out.append(("b.line", item["b"]["line"], {"who": item["b"]["who"]}))
    elif deck == "twohalf":
        out.append(("a+b", item["a"] + " " + item["b"], {"li": item["li"]}))
    elif deck == "swapline":
        lines = lessons.lines(media)
        line = SPEAKER.sub("", lines[item["li"]]) if item["li"] < len(lines) else ""
        out.append(("line", line, {"li": item["li"], "from": item["from"], "to": item["to"]}))
        out.append(("from", item["from"], {}))
    elif deck == "hearme":
        if item.get("word"):
            out.append(("word", item["word"], {}))
    elif deck in ("chain", "rebound"):
        out.append(("chunk", item["c"], {}))
    elif deck == "mirror":
        out.append(("a", item["a"], {}))
        out.append(("b", item["b"], {}))
    return out


def build():
    fail = []
    G = json.load(open(SESS, encoding="utf-8"))["sessions"]
    cards = {c["id"]: c for c in json.load(open(CARDS, encoding="utf-8"))["items"]}
    voices = deck_voices()
    if voices is None:
        return None, ["docs/game_data.md 에 6.2 표가 없다"]
    names = radio_names()
    rx = name_rx(names)
    L = Lessons()
    L.lists = block_lists()

    entries = {}      # id -> 항목
    radio_audio = {}
    seen_decks = set()
    for x in G:
        for deck, items in x["decks"].items():
            seen_decks.add(deck)
            if deck not in voices:
                fail.append("6.2 표에 없는 판이다: " + deck)
                continue
            v = voices[deck]["voice"]
            if v == "radio":
                radio_audio[deck] = radio_audio.get(deck, 0) + len(items)
                for it in items:
                    if isinstance(it, (str, dict)) and (isinstance(it, str) or "li" not in it):
                        fail.append("라디오 구간 판 %s 에 줄 번호 없는 항목이 있다" % deck)
                continue
            if v == "none":
                continue
            for it in items:
                if deck in ("wall", "onesee", "whose", "flip"):
                    c = cards.get(it)
                    if not c:
                        fail.append("판 %s 의 카드가 없다: %s" % (deck, it))
                        continue
                    for i, m in enumerate(c["a"].get("material") or []):
                        if not isinstance(m, str):
                            continue
                        if rx.search(m) is None:
                            continue
                        key = "card:%s#%d" % (it, i)
                        e = entries.setdefault(key, {"id": key, "deck": deck, "field": "material[%d]" % i,
                                                     "card": it, "text": m, "media": None,
                                                     "sessions": set()})
                        e["sessions"].add(x["s"])
                    continue
                for field, text, extra in units(deck, it, x["media"], L):
                    if not text:
                        continue
                    if rx.search(text) is None:
                        continue
                    key = eid(deck, field, text)
                    e = entries.setdefault(key, {"id": key, "deck": deck, "field": field, "text": text,
                                                 "media": x["media"], "sessions": set(), "extra": extra})
                    e["sessions"].add(x["s"])
    missing = sorted(set(voices) - seen_decks - {"recall", "oneday"})
    if missing:
        fail.append("6.2 표의 판이 세션 덱에 없다: " + " ".join(missing))

    # 처리. 이름 자리는 항목을 id 순으로 {A} {B} 번갈아 준다. 무작위가 아니다
    out, turn = [], 0
    for key in sorted(entries):
        e = entries[key]
        slot = SLOTS[turn % 2]
        if e["media"] is None:
            # 카드 재료는 한 과의 대본 줄이 아닐 수 있다. 그 카드를 처음 쓰는 세션까지 들은 과 어디에든 그대로 있으면 된다
            first = min(e["sessions"])
            medias = [G[i]["media"] for i in range(first)]
            medias = list(dict.fromkeys(medias))
        else:
            medias = [e["media"]]
        r = handle(e["text"], rx, medias, L, slot)
        if r is None:
            fail.append("이름이 있다고 모았는데 처리 때 없다: " + e["text"])
            continue
        how, swapped, why, nm, media = r
        rec = {"id": e["id"], "deck": e["deck"], "field": e["field"], "text": e["text"], "names": nm,
               "handling": how, "why": why, "media": media or e["media"], "sessions": sorted(e["sessions"])}
        if "card" in e:
            rec["card"] = e["card"]
        if e.get("extra"):
            rec["extra"] = e["extra"]
        if how == "swap":
            rec["swapped"] = swapped
            rec["slot"] = slot
            turn += 1
        out.append(rec)
    out.sort(key=lambda r: (r["deck"], r["sessions"][0], r["id"]))

    by_deck = {}
    for r in out:
        d = by_deck.setdefault(r["deck"], {"swap": 0, "skip": 0})
        d[r["handling"]] += 1
    slot_n = {s: sum(1 for r in out if r.get("slot") == s) for s in SLOTS}
    obj = {
        "note": "판 덱 글에 든 라디오 인물 이름의 처리다. out/game/sessions.json 의 덱을 대본과 견주어 낸다. "
                "손으로 안 고친다. scripts/derive_deck_names.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "바꾼 글이 대본 그대로인지는 기계가 본다 (A). 부르는 말인지의 판별은 꼴 넷으로 본 것이라 B 다.",
        "generator": "scripts/derive_deck_names.py",
        "source": "out/game/sessions.json 덱, out/data/cards.json, media/english/transcripts, docs/game_data.md 6장",
        "radioNames": names,
        "voices": voices,
        "radioAudio": radio_audio,
        "count": len(out),
        "swap": sum(1 for r in out if r["handling"] == "swap"),
        "skip": sum(1 for r in out if r["handling"] == "skip"),
        "slots": slot_n,
        "byDeck": by_deck,
        "items": out,
    }
    return obj, fail


def main():
    obj, fail = build()
    for f in fail:
        print("[실패] " + f)
    if fail or obj is None:
        print("덱 이름 처리를 안 냈다. 실패 %d" % len(fail))
        return 1
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print("out/game/deck_names.json / 이름 든 항목 %d (swap %d, skip %d) / 라디오 인물 이름 %d / 실패 0"
          % (obj["count"], obj["swap"], obj["skip"], len(obj["radioNames"])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
