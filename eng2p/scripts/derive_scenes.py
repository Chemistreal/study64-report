#!/usr/bin/env python3
"""게임의 장면 288세션 (`docs/scenes.md`). `out/game/scenes.json` 을 낸다.

세션 JSON 이 그날 무엇을 하는지 정했다. 여기서는 **어디서, 누구와, 무슨 말로** 를 붙인다.
뼈대는 셈으로 나온다 (world.md 5장 화, game.md 4장 장소, town.md 5장 사람과 5.2 손님).
대사는 scenes.md 3장 표에 적은 것뿐이다.

내기 전에 본다. 하나라도 어긋나면 실패로 내고 JSON 을 안 쓴다.

    대사가 근거 대본 한 사람의 말 안에서 이어진 문장 그대로인가
      이름 자리 {A} {B} 는 그 대본의 화자 이름만 대신한다. 대문자로 시작하는 아무 낱말이 아니다
    그 대본을 그 세션까지 이미 들었나
      (근거 칸이 `authored:<줄 id>` 인 줄은 지은 영어다. 근거 대본, 들은 과, 이어진 문장 관문 대신 authored_lib.scene_line_ok.
       docs/authored.md. 지금 scenes.md 에는 지은 줄이 없다)
    말하는 NPC 가 그 블록 장소에 있는 사람이거나 그 주 손님인가 (town.md 5장, 5.1, 5.2)
    인물 칸에 한 사람인가 ("Mr. and Mrs. Lee" 는 안 된다)
    48주가 다 화를 받았나. 세션마다 블록 넷이 장소와 사람을 가졌나
    판정형 카드의 답이 장면에 안 실렸나
    판정형 카드의 재료 문장이 같은 세션 블록 1~3 대사에 미리 안 나왔나
    48주에만 쓰는 줄(scenes.md 2.2)이 다른 주에 안 나왔나
    같은 줄이 한 주에 둘, 한 분기에 여섯을 안 넘나 (두 낱말 이하는 뺀다)
    NPC 가 {A} 와 {B} 를 부르는 수의 차이가 주마다 2 이하이고 1년 합으로 한쪽이 45% 밑이 아닌가
    연속성 (world.md 6.2). 첫 출근 전 일 이야기, 새 집 전 집세 이야기가 없나
    8층 줄기 세션(world.md 3.2)에 가벼운 맞장구(scenes.md 2.3)가 없나
    막는 말 (scenes.md 2.4). 슬랭과 실명과 상표
    달력 (world.md 6.1). 표의 주와 요일이 셈과 같나, 명절 말이 그 주 앞뒤 한 주 안에만 있나
    카드 내는 사람 (town.md 5.3). 한 사람이 그 장소 카드의 절반을 넘게 내지 않나

**기계가 안 보는 것: 그 장면에서 두 사람이 웃는가.**

사용법:
    python3 scripts/derive_scenes.py
"""
import datetime
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

# 실제 상표. derive_town.py 의 목록을 같이 쓰고 대본에 나오는 놀이 상표를 더한다.
# VOA 대본에도 상표가 섞여 있다 (lle1-17 의 보드게임 이름). 대본 줄 그대로여도 안 된다
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from derive_town import BRANDS  # noqa: E402
BRANDS = BRANDS + ["Scrabble", "Monopoly", "Lego", "Frisbee", "Kleenex", "Uber", "Google", "Facebook"]

# 카드 유형이 장면 갈래가 된다 (game.md 5장)
GENRE = {"판정": "확인", "압박": "시간", "확장": "다른 날 다른 주문",
         "역할": "퀘스트", "repair": "되묻기"}
DAYPART = {1: "열기", 6: "풀기"}

# 두 사람이 하는 줄. A자리 B자리는 그날 그 자리에 앉은 사람이 한다 (scenes.md 2장)
PLAYERS = {"두 사람": None, "A자리": "A", "B자리": "B"}

# 한 칸에 한 사람. TTS 목소리가 사람마다 하나다
TWO_IN_ONE = re.compile(r"\band\b|&|/")

# 이름 자리. {A} {B} 는 그 대본의 화자 이름만 대신한다 (names 가 채운다)
SPELL = r"[A-Z](?:-[A-Z])+"
SPELLS = {"{A철자}": SPELL, "{B철자}": SPELL, "{A틀린철자}": SPELL, "{B틀린철자}": SPELL}
SLOTS = ["{A}", "{B}"] + sorted(SPELLS)
# 화자 칸에 오지만 사람 이름이 아닌 것. 이름 자리가 이것을 대신하지 않는다
ROLE_LABELS = {"Phone", "Announcer", "Coworkers", "Woman", "Man", "Fan", "Director", "Narrator",
               "Professor", "Teacher", "Students", "Children", "Nurse", "Doctor", "Server",
               "Waiter", "Waitress", "Both", "All", "Everyone", "Voice", "Bot"}

# 반복 상한 (scenes.md 2.5). 두 낱말 이하는 기능 줄이라 안 센다
WEEK_CAP, QUARTER_CAP, SHORT = 2, 6, 2
# 호명 균형. 주마다 NPC 의 {A} 와 {B} 차이
BALANCE = 2
# 1년 합으로도 한쪽이 45% 밑으로 안 내려간다
YEAR_SHARE = 45
START = datetime.date(2026, 8, 10)
DOW = "월화수목금토일"


def doc(name):
    return open(os.path.join(DOCS, name), encoding="utf-8").read()


def section(src, head):
    i = src.find(head)
    if i < 0:
        return ""
    j = src.find("\n## ", i + len(head))
    return src[i:j if j > 0 else len(src)]


def sub(src, head):
    """### 하나 밑. 다음 같은 높이 이상의 머리까지."""
    i = src.find(head)
    if i < 0:
        return ""
    m = re.compile(r"\n#{2,%d} " % head.split(" ")[0].count("#")).search(src, i + len(head))
    return src[i:m.start() if m else len(src)]


def rows(sec, cols):
    out = []
    for line in sec.splitlines():
        if not line.startswith("| ") or line.startswith("|---"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) == cols:
            out.append(cells)
    return out[1:]


def nums(cell):
    """"1~6", "4, 6", "3" 을 수 집합으로. 못 읽으면 None."""
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


def sentences(text):
    """문장으로 끊는다. 끝 부호를 붙여 둔다. 큰따옴표와 말줄임은 버린다."""
    text = text.replace("’", "'").replace("...", " ").replace('"', " ")
    return [s.strip() for s in re.findall(r"[^.!?]+[.!?]+", text) if s.strip()]


def norm(s):
    """견주기 꼴. 소문자, 낱말만."""
    return " ".join(re.findall(r"[a-z0-9{}'가-힣]+", s.lower().replace("’", "'")))


def words(s):
    return len(re.findall(r"[A-Za-z0-9{}']+[A-Za-z0-9{}'가-힣]*", s))


def body(name):
    p = os.path.join(TRANS, name + ".md")
    if not os.path.exists(p):
        return None
    return open(p, encoding="utf-8").read().split("## 대본", 1)[-1]


def transcript(name):
    """대본의 말 한 마디씩. 마디마다 문장들."""
    b = body(name)
    if b is None:
        return None
    # 이름 줄 다음 문단에 말이 오는 대본이 있다 ("Marsha:" 다음 줄에 "Anna? Where are you?").
    # 이름 없는 문단은 앞 사람의 다음 마디로 본다
    out = []
    who = None
    for para in re.split(r"\n\s*\n", b):
        if not para.strip():
            continue
        m = re.match(r"\s*([A-Z][A-Za-z ]*?):\s*(.*)", para, re.S)
        text = m.group(2) if m else para
        if m:
            who = m.group(1)
        if who and text.strip():
            out.append(sentences(" ".join(text.split())))
    return out


def names(name):
    """그 대본에서 이름 자리가 대신할 수 있는 낱말. 화자 칸의 사람 이름뿐이다."""
    b = body(name) or ""
    got = set()
    for m in re.finditer(r"^\s*([A-Z][A-Za-z .]*?):", b, re.M):
        lab = m.group(1).strip()
        if re.fullmatch(r"[A-Z][a-z]+", lab) and lab not in ROLE_LABELS:
            got.add(lab)
    return sorted(got)


def pattern(line, who_names):
    pat = re.escape(" ".join(sentences(line)) or line.strip())
    nm = "(?:" + "|".join(map(re.escape, who_names)) + ")" if who_names else r"(?!x)x"
    for k in ("{A}", "{B}"):
        pat = pat.replace(re.escape(k), nm)
    for k, v in SPELLS.items():
        pat = pat.replace(re.escape(k), v)
    return re.compile(r"^" + pat + r"$")


def grounded(line, utts, who_names):
    """줄이 어느 한 마디 안에서 이어진 문장들 그대로인가. 이름 자리는 화자 이름만 바꿀 수 있다."""
    rx = pattern(line, who_names)
    for u in utts:
        for i in range(len(u)):
            for j in range(i + 1, len(u) + 1):
                if rx.match(" ".join(u[i:j])):
                    return True
    return False


def material(text):
    """카드 재료를 문장으로. 화자 머리("Anna:")와 괄호 지시("(2초 쉼)", "(뒤 줄임)")와 줄 가름 / 를 뗀다."""
    text = re.sub(r"\([^)]*\)", " ", text)
    text = re.sub(r"(?:^|(?<=[/.!?]))\s*[A-Z][A-Za-z]*:\s*", " ", text)
    return sentences(text.replace("/", " "))


def week_of(date):
    d = (date - START).days
    return d // 7 + 1, d % 7 + 1


def main():
    S = json.load(open(GAME, encoding="utf-8"))["sessions"]
    cards = {c["id"]: c for c in json.load(open(CARDS, encoding="utf-8"))["items"]}
    world, town, scenes = doc("world.md"), doc("town.md"), doc("scenes.md")

    # 화. world.md 5장
    ep = {}
    for blk in re.finditer(r"^### 5\.\d (Q\d) .*?(?=^### |^## )", world, re.M | re.S):
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

    # 사람. town.md 5장(무대)과 5.1(나들이)
    def people_of(cell):
        return [p.strip() for p in re.split(r",\s*", cell) if p.strip()]
    who = {c[0]: people_of(c[3]) for c in rows(section(town, "## 5. 장소"), 6)}
    trips = {c[0]: people_of(c[3]) for c in rows(section(town, "## 5.1 나들이 장소"), 6)}
    places = dict(who, **trips)

    # 그 주 손님. town.md 5.2. (세션, 블록) 마다 장소와 더해지는 사람
    by_week = {}
    for x in S:
        by_week.setdefault(x["week"], {})[x["day"]] = x["s"]
    guest = {}
    for c in rows(section(town, "## 5.2 주별 손님"), 6):
        wk, days, blks = nums(c[0]), nums(c[1]), nums(c[2])
        if not wk or not days or not blks or c[3] not in places:
            FAIL.append("town.md 5.2 손님 줄을 못 읽었다: " + " | ".join(c[:5]))
            continue
        for w in wk:
            for d in days:
                s = by_week.get(w, {}).get(d)
                if s is None:
                    FAIL.append("town.md 5.2 손님 줄의 %d주 %d일 세션이 없다" % (w, d))
                    continue
                for b in blks:
                    g = guest.setdefault((s, b), {"place": c[3], "people": []})
                    if g["place"] != c[3]:
                        FAIL.append("세션 %d 블록 %d 에 손님 장소가 둘이다: %s, %s" % (s, b, g["place"], c[3]))
                    g["people"] += [p for p in people_of(c[4]) if p not in g["people"]]

    def block_of(x, b):
        """세션 x 의 블록 b 의 장소와 사람. 손님 표가 장소를 옮기거나 사람을 더한다."""
        place = stage.get(x["quarter"], [None] * 4)[b - 1] if 1 <= b <= 4 else None
        g = guest.get((x["s"], b))
        if g:
            place = g["place"]
        ppl = list(places.get(place, [])) if place in places else None
        if g and ppl is not None:
            ppl += [p for p in g["people"] if p not in ppl]
        return place, ppl

    # 카드 내는 사람. town.md 5.3
    host_rule = {}
    for c in rows(section(town, "## 5.3 카드 내는 사람"), 3):
        for genre in people_of(c[1]):
            host_rule[(c[0], genre)] = people_of(c[2])

    # 달력. world.md 6.1
    cal = []
    for c in rows(sub(world, "### 6.1 달력"), 6):
        try:
            d = datetime.date.fromisoformat(c[1])
        except ValueError:
            FAIL.append("world.md 6.1 달력의 날짜를 못 읽었다: " + c[1])
            continue
        wk, dw = week_of(d)
        if not c[2].isdigit() or int(c[2]) != wk:
            FAIL.append("world.md 6.1 달력의 %s 는 셈으로 %d주인데 표는 %s주다" % (c[0], wk, c[2]))
        if c[3] != DOW[dw - 1]:
            FAIL.append("world.md 6.1 달력의 %s 는 셈으로 %s요일인데 표는 %s다" % (c[0], DOW[dw - 1], c[3]))
        said = [t.strip() for t in c[4].split(",") if t.strip() and t.strip() != "-"]
        cal.append({"name": c[0], "week": wk, "words": said})
    if len(cal) < 8:
        FAIL.append("world.md 6.1 달력에서 날을 %d개만 읽었다" % len(cal))
    for w, e in ep.items():
        for day in cal:
            if day["name"] in e["title"] + " " + e["crux"] and w != day["week"]:
                FAIL.append("world.md 5장 %d주 화에 %s 가 있는데 달력 셈으로는 %d주다" % (w, day["name"], day["week"]))

    # 연속성. world.md 6.2
    cont = []
    for c in rows(sub(world, "### 6.2 연속성"), 4):
        if not c[1].isdigit():
            FAIL.append("world.md 6.2 연속성의 언제부터가 주가 아니다: " + c[1])
            continue
        for p in c[2].split(" / "):
            cont.append((c[0], int(c[1]), re.compile(p.strip().strip("`"), re.I)))
    if len(cont) < 6:
        FAIL.append("world.md 6.2 연속성에서 막는 말을 %d개만 읽었다" % len(cont))

    # 8층 줄기. world.md 3.2 의 주와 날. 그 세션에 scenes.md 2.3 맞장구 금지
    thread = set()
    for c in rows(sub(world, "### 3.2 8층의 줄기"), 4):
        wk, days = nums(c[0]), nums(c[1])
        if not wk or not days:
            continue
        for w in wk:
            for d in days:
                if by_week.get(w, {}).get(d):
                    thread.add(by_week[w][d])
    if len(thread) < 10:
        FAIL.append("world.md 3.2 8층 줄기에서 세션을 %d개만 읽었다" % len(thread))
    light = {norm(c[0]) for c in rows(sub(scenes, "### 2.3 8층 줄기에서 안 쓰는 맞장구"), 2)}
    if len(light) < 5:
        FAIL.append("scenes.md 2.3 맞장구 목록에서 %d개만 읽었다" % len(light))

    # 48주에만 쓰는 줄. scenes.md 2.2
    reserved = {}
    for c in rows(sub(scenes, "### 2.2 48주에만 쓰는 줄"), 2):
        reserved[norm(c[0])] = c[0]
    if len(reserved) < 5:
        FAIL.append("scenes.md 2.2 48주 줄 목록에서 %d개만 읽었다" % len(reserved))

    # 막는 말. scenes.md 2.4. 끝이 부호면 문장 하나와 같을 때, 아니면 낱말 경계로 찾는다
    block = []
    for c in rows(sub(scenes, "### 2.4 막는 말"), 3):
        if c[1] not in ("슬랭", "실명", "상표"):
            FAIL.append("scenes.md 2.4 막는 말의 갈래가 슬랭 실명 상표가 아니다: " + c[1])
            continue
        block.append((c[0], c[1]))
    if len(block) < 10:
        FAIL.append("scenes.md 2.4 막는 말에서 %d개만 읽었다" % len(block))

    # 대사. scenes.md 3장
    lines = {}
    heard = {}
    seen = set()
    for x in S:
        seen.add(x["media"])
        heard[x["s"]] = set(seen)
    cache, nmcache = {}, {}
    for c in rows(section(scenes, "## 3. 대사"), 5):
        try:
            s, b = int(c[0]), int(c[1])
        except ValueError:
            FAIL.append("대사 표의 세션이나 블록이 수가 아니다: " + " | ".join(c))
            continue
        spk, text, src = c[2], c[3], c[4]
        if not 1 <= s <= len(S):
            FAIL.append("대사 표에 없는 세션이다: %d" % s)
            continue
        x = S[s - 1]
        # 정책 2026-10-10 (docs/authored.md): 근거 칸이 `authored:<줄 id>` 면 지은 줄이다. 말뭉치 관문(근거 대본, 들은 과, grounded)은
        # 말뭉치 줄에만 걸리고 그대로다. 지은 줄은 authored_lib 의 관문(낱말 등급, 길이 등)을 통과한 줄이어야 하고 글자가 그대로여야 한다.
        # 막는 말, 상표, 연속성, 달력, 반복 상한, 판정형 재료 미리 말하기는 지은 줄에도 똑같이 건다
        authored = src.startswith("authored:")
        if authored:
            import authored_lib as AL
            ok, why = AL.scene_line_ok(text, spk, src, s)
            if not ok:
                FAIL.append("세션 %d 지은 줄 근거가 안 맞다: %s" % (s, why))
        else:
            if src not in cache:
                cache[src] = transcript(src)
                nmcache[src] = names(src)
            if cache[src] is None:
                FAIL.append("세션 %d 대사의 근거 대본이 없다: %s" % (s, src))
                continue
            if src not in heard[s]:
                FAIL.append("세션 %d 대사가 아직 안 들은 %s 에서 왔다: %s" % (s, src, text))
        for brand in BRANDS:
            # 대소문자를 가린다. "target", "spam" 같은 보통 낱말을 상표로 잡지 않으려고
            if re.search(r"\b" + re.escape(brand) + r"\b", text):
                FAIL.append("세션 %d 대사에 실제 상표가 있다 (%s): %s" % (s, brand, text))
        sens = [norm(t) for t in sentences(text)]
        for word, kind in block:
            if word[-1] in ".!?":
                hit = norm(word) in sens
            else:
                hit = re.search(r"(?<![A-Za-z])" + re.escape(word) + r"(?![A-Za-z])", text,
                                0 if kind != "슬랭" else re.I)
            if hit:
                FAIL.append("세션 %d 대사에 막는 말이 있다 (%s %s): %s" % (s, kind, word, text))
        if not authored and not grounded(text, cache[src], nmcache[src]):
            FAIL.append("세션 %d 대사가 %s 한 마디 안의 이어진 문장이 아니다 (이름 자리는 화자 %s 만): %s"
                        % (s, src, "/".join(nmcache[src]) or "없음", text))
        if TWO_IN_ONE.search(spk):
            FAIL.append("세션 %d 인물 칸에 사람이 둘이다: %s. 한 칸에 한 사람만 쓴다" % (s, spk))
        place, ppl = block_of(x, b) if 1 <= b <= 4 else (None, None)
        if place is None:
            FAIL.append("세션 %d 대사의 블록이 1~4 가 아니다" % s)
            continue
        if spk not in PLAYERS and spk not in (ppl or []):
            FAIL.append("세션 %d 블록 %d 의 %s 에 %s 가 없다 (town.md 5장, 5.2 손님)" % (s, b, place, spk))
        if x["week"] != 48 and any(t in reserved for t in sens):
            FAIL.append("세션 %d (%d주) 에 48주에만 쓰는 줄이 있다: %s" % (s, x["week"], text))
        for what, since, rx in cont:
            if x["week"] < since and rx.search(text):
                FAIL.append("세션 %d (%d주) 대사가 %s (%d주부터) 보다 앞선다: %s" % (s, x["week"], what, since, text))
        if s in thread and (norm(text) in light or any(t in light for t in sens)):
            FAIL.append("세션 %d 는 8층 줄기인데 가벼운 맞장구가 있다: %s" % (s, text))
        for day in cal:
            for word in day["words"]:
                if re.search(r"\b" + re.escape(word) + r"\b", text, re.I) and abs(x["week"] - day["week"]) > 1:
                    FAIL.append("세션 %d (%d주) 대사에 %s 말이 있는데 달력으로는 %d주다: %s"
                                % (s, x["week"], day["name"], day["week"], text))
        lines.setdefault((s, b), []).append({"who": spk, "say": text, "from": src,
                                            "wait": spk in PLAYERS, "seat": PLAYERS.get(spk)})

    # 반복 상한. 같은 줄이 한 주 둘, 한 분기 여섯을 넘지 않는다
    per_w, per_q = {}, {}
    for (s, b), ls in lines.items():
        x = S[s - 1]
        for ln in ls:
            if words(ln["say"]) <= SHORT:
                continue
            k = norm(ln["say"])
            per_w.setdefault((x["week"], k), []).append(s)
            per_q.setdefault((x["quarter"], k), []).append(s)
    for (w, k), ss in sorted(per_w.items()):
        if len(ss) > WEEK_CAP:
            FAIL.append("%d주에 같은 줄이 %d번이다 (상한 %d): %s / 세션 %s"
                        % (w, len(ss), WEEK_CAP, k, " ".join(map(str, sorted(ss)))))
    for (q, k), ss in sorted(per_q.items()):
        if len(ss) > QUARTER_CAP:
            FAIL.append("%s 에 같은 줄이 %d번이다 (상한 %d): %s" % (q, len(ss), QUARTER_CAP, k))

    # 호명 균형. NPC 가 부르는 {A} 와 {B}
    calls = {}
    for (s, b), ls in lines.items():
        w = S[s - 1]["week"]
        for ln in ls:
            if ln["wait"]:
                continue
            c = calls.setdefault(w, [0, 0])
            c[0] += "{A" in ln["say"]
            c[1] += "{B" in ln["say"]
    for w, (a, bb) in sorted(calls.items()):
        if abs(a - bb) > BALANCE:
            FAIL.append("%d주 NPC 가 {A} 를 %d번, {B} 를 %d번 부른다 (차이 %d 이하)" % (w, a, bb, BALANCE))
    ya = sum(v[0] for v in calls.values())
    yb = sum(v[1] for v in calls.values())
    if ya + yb and min(ya, yb) * 100 < YEAR_SHARE * (ya + yb):
        FAIL.append("1년 NPC 호명이 {A} %d, {B} %d 다. 한쪽이 %d%% 밑이다" % (ya, yb, YEAR_SHARE))

    out = []
    host_turn = {}
    host_count = {}
    for x in S:
        e = ep.get(x["week"], {})
        blocks = []
        for b in range(1, 5):
            place, ppl = block_of(x, b)
            if not place or ppl is None:
                FAIL.append("세션 %d 블록 %d 의 장소나 사람이 없다: %s" % (x["s"], b, place))
                ppl = []
            blk = {"no": b, "place": place, "people": ppl, "lines": lines.get((x["s"], b), [])}
            if (x["s"], b) in guest:
                blk["guests"] = guest[(x["s"], b)]["people"]
            if b == 3:
                base = [p for p in places.get(place, []) if p != "라디오"]
                blk["cards"] = []
                for cid in x["cards"]:
                    genre = GENRE.get(cards.get(cid, {}).get("type"), "확인")
                    elig = host_rule.get((place, genre)) or base[:1] or [None]
                    k = (place, genre)
                    host = elig[host_turn.get(k, 0) % len(elig)]
                    host_turn[k] = host_turn.get(k, 0) + 1
                    if host is not None and host not in ppl:
                        FAIL.append("세션 %d 카드 %s 를 낼 %s 가 %s 에 없다" % (x["s"], cid, host, place))
                    if place in {p for p, _ in host_rule}:
                        host_count.setdefault(place, {}).setdefault(host, 0)
                        host_count[place][host] += 1
                    blk["cards"].append({"id": cid, "host": host, "genre": genre})
            blocks.append(blk)
        out.append({"s": x["s"], "week": x["week"], "day": x["day"], "quarter": x["quarter"],
                    "part": DAYPART.get(x["day"], "다시 오기"),
                    "episode": {"no": x["week"], "title": e.get("title"), "crux": e.get("crux"),
                                "layers": e.get("layers", [])},
                    "blocks": blocks})
    for place, cnt in host_count.items():
        tot = sum(cnt.values())
        for h, n in cnt.items():
            if n * 2 > tot:
                FAIL.append("%s 카드 %d장 가운데 %s 가 %d장을 낸다. 절반을 넘는다 (town.md 5.3)" % (place, tot, h, n))

    # 주마다 장면이 있는 세션이 넷 이상인가 (scenes.md 2장). 대사 없는 주는 이야기 없이 공부만 하는 주다
    per = {}
    for o in out:
        if any(b["lines"] for b in o["blocks"]):
            per[o["week"]] = per.get(o["week"], 0) + 1
    thin = [w for w in range(1, 49) if per.get(w, 0) < 4]
    if thin:
        FAIL.append("장면 세션이 넷보다 적은 주: " + " ".join(map(str, thin[:12])))

    # 판정형 답이 실리지 않았나. 카드 자료의 답 글이 장면 어디에도 없어야 한다
    blob = json.dumps(out, ensure_ascii=False)
    for c in cards.values():
        ans = (c.get("a") or {}).get("answer")
        if ans and len(ans) > 12 and ans in blob:
            FAIL.append("카드 %s 의 답이 장면에 실렸다" % c["id"])

    # 판정형 재료가 미리 나오지 않았나. 그날 판정형 카드의 재료 문장(세 낱말 이상)이
    # 같은 세션 블록 1~3 대사와 같으면 카드를 처음 듣는 것이 아니게 된다
    for o in out:
        said = {norm(t) for b in o["blocks"] if b["no"] <= 3 for ln in b["lines"]
                for t in sentences(ln["say"])}
        if not said:
            continue
        for cid in S[o["s"] - 1]["cards"]:
            c = cards.get(cid, {})
            if c.get("type") != "판정":
                continue
            for mat in (c.get("a") or {}).get("material") or []:
                for t in material(mat if isinstance(mat, str) else ""):
                    if words(t) >= 3 and norm(t) in said:
                        FAIL.append("세션 %d 장면이 판정형 카드 %s 의 재료를 미리 말한다: %s" % (o["s"], cid, t))

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
        "source": "docs/scenes.md, docs/world.md 3.2 5장 6.1 6.2, docs/game.md 4장, docs/town.md 5장 5.1 5.2 5.3, "
                  "out/game/sessions.json",
        "slots": SLOTS,
        "seats": {"A자리": "그날 A 자리 사람", "B자리": "그날 B 자리 사람", "두 사람": "둘 중 누구든"},
        "calendarStart": START.isoformat(),
        "count": len(out),
        "lines": n,
        "sessions": out,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write("\n")
    have = sorted({s for s, _ in lines})
    a = sum(v[0] for v in calls.values())
    bb = sum(v[1] for v in calls.values())
    print("out/game/scenes.json / 세션 %d / 대사 %d줄 (세션 %d개) / 호명 {A} %d {B} %d / 실패 0"
          % (len(out), n, len(have), a, bb))
    return 0


if __name__ == "__main__":
    sys.exit(main())
