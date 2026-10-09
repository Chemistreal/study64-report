#!/usr/bin/env python3
"""게임의 선택 자료 여덟 검사 (`docs/game_data.md` 10장). sets emergency playblocks tally hold transcripts cues audiolen.

게임 로더는 이 여덟을 있으면 읽고 **모양이 안 맞으면 말없이 비운다.** 항목 하나가 구조체로 안 바뀌면 그 항목만 빠지고,
대본 지도는 과 번호가 맨 위에 없으면 통째로 빈다. 알림이 없다. 그래서 파생기와 다른 코드로 **로더가 읽는 대로 다시 읽는다.**

    1 shape     여덟이 10.2 표대로 읽힌다. 항목 수와 칸 형이 맞고 맨 위에 수 칸이 없고 껍질이 아닌 지도다
    2 cover     세션 288개의 세트 비상판 과 판이 다 있다. 판 id 가 playblocks tally hold 에서 같다
    3 media     줄 시각이 대본 줄과 짝이고 안 줄고 과의 길이보다 작다. 앱 파일과 내용이 같다
    4 fit       붙는 블록이 10.3 표와 같고 1 이 없고 옛 칸이 없다
    5 hold      10.4 표와 같다. 근거 문구가 game.md 1.3 에 있고 쥐는 쪽이 문구에서 나온다. 자리가 앱 seats 안이다
    6 pick      거울 배정이 288세션이고 덱과 길이가 같고 0 과 1 이 같은 수이며 해시 규칙으로 다시 센 값과 같다
    7 secret    판정 열쇠(카드 답)가 여덟 어디에도 없다
    8 chars     금지 문자와 슬랭 표가 없다 (세트, 비상판. 대본은 실제 녹음 글이라 안 건다)
    9 manifest  여덟이 derive_game_manifest.py 의 목록에 있다
    + fresh     여덟이 원본을 다시 읽어 낸 것과 같다

`--break` 를 주면 규칙마다 실패를 하나 이상 심어 그 규칙이 잡는지 본다. 안 잡는 규칙이 있으면 실패다 (CLAUDE.md 병렬 개발).

**기계가 안 보는 것: 10.4 표가 판의 뜻을 바르게 옮겼는가.** 근거 문구는 사람이 읽는다.

사용법:
    python3 scripts/check_gameopt.py           # 검사
    python3 scripts/check_gameopt.py --break   # 검사 + 깸 시험
"""
import copy
import hashlib
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import derive_game_manifest as DGM   # noqa: E402
import derive_game_optional as DGO   # noqa: E402
import derive_judge as DJ            # noqa: E402
import derive_replies as DR          # noqa: E402

ROOT = DGO.ROOT
GAME = DGO.GAME
DATA = DGO.DATA
NAMES = DGO.NAMES
EXPECT = {"sets": 288, "emergency": 80, "playblocks": 20, "tally": 20, "hold": 20,
          "transcripts": 52, "cues": 52, "audiolen": 52}
# 화자 이름표: 세 낱말 이하(번호와 별표와 점 가능)이고 뒤에 괄호 설명이 하나 붙을 수 있다. 문장이나 지시문은 이름표가 아니다
LABEL = re.compile(r"^[A-Z][A-Za-z0-9.'*-]*(?: [A-Za-z0-9.'*-]+){0,2}(?: \([^)]*\))?$")
# 10.6 6번. 이름표가 아닌 앞토막을 로더(TranscriptLine)가 이름표로 자르는 대본 줄 (과, 0부터 센 줄 번호)
COLON_LINES = {("lle1-26", 1), ("lle1-50", 36), ("lle1-51", 24)}
OLD_KEYS_TOP = {"blocks", "empty", "emptyWhy"}
OLD_KEYS_PLAY = {"together", "talk", "why", "sec"}


def jload(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


# 로더 흉내 (HnlDataSubsystem.cpp 를 읽고 옮겼다) ------------------------------------

def is_num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def conforms(v, spec):
    """spec: 'int' 'str' ['list', spec] ['map', spec] {칸: spec}. 칸이 없는 것은 괜찮고 있는 칸은 형이 맞아야 한다."""
    if spec == "int":
        return is_num(v)
    if spec == "str":
        return isinstance(v, str)
    if isinstance(spec, list) and spec[0] == "list":
        return isinstance(v, list) and all(conforms(x, spec[1]) for x in v)
    if isinstance(spec, list) and spec[0] == "map":
        return isinstance(v, dict) and all(conforms(x, spec[1]) for x in v.values())
    if isinstance(spec, dict):
        return isinstance(v, dict) and all(conforms(x, s) for k, s in spec.items() for x in ([v[k]] if k in v and v[k] is not None else []))
    return False


SPECS = {
    "sets": ("items sets".split(), {"no": "int", "id": "str", "week": "int", "quarter": "str", "lecture": "int",
             "steps": ["list", {"step": "int", "name": "str", "minutes": "int", "fields": ["map", "str"],
                                "items": ["list", "str"]}]}, True),
    "emergency": ("items errands".split(), {"no": "int", "title": "str", "quarter": "str", "lecture": "int",
                  "minutes": ["map", "int"], "pull": "str", "chunks": ["list", "str"]}, False),
    "playblocks": ("plays items".split(), {"id": "str", "name": "str", "min": "int", "src": "str",
                   "fit": ["list", "int"]}, True),
    "tally": ("plays items".split(), {"id": "str", "how": "str", "hold": "str", "turns": "str",
              "seats": ["list", "str"]}, True),
    "hold": ("plays items".split(), {"id": "str", "how": "str", "hold": "str", "turns": "str",
             "seats": ["list", "str"]}, True),
}


def first_array(obj, keys):
    for k in keys:
        if isinstance(obj.get(k), list):
            return obj[k]
    return None


def unwrap(obj):
    g = 0
    while isinstance(obj, dict) and len(obj) == 1 and g < 3:
        only = next(iter(obj.values()))
        if not isinstance(only, dict):
            break
        obj = only
        g += 1
    return obj


def load_items(name, obj):
    """로더가 살려 두는 항목 목록. 구조체로 안 바뀌거나 id 가 빈 항목은 빠진다."""
    keys, spec, need_id = SPECS[name]
    arr = first_array(obj, keys)
    if arr is None:
        return None
    out = []
    for it in arr:
        if not isinstance(it, dict) or not conforms(it, spec):
            continue
        if need_id and not (isinstance(it.get("id"), str) and it["id"]):
            continue
        out.append(it)
    return out


def load_map(name, obj):
    """과 번호 -> 값. transcripts 는 배열, cues 는 배열, audiolen 은 수만 든다."""
    o = unwrap(obj)
    out = {}
    for k, v in o.items():
        if name == "audiolen":
            if is_num(v):
                out[k] = v
        elif isinstance(v, list):
            out[k] = v
    return out


# 자료 읽기 -------------------------------------------------------------------

def load():
    d = {"files": {n: jload(os.path.join(GAME, n + ".json")) for n in NAMES},
         "app": {n: jload(os.path.join(DATA, n + ".json")) for n in NAMES},
         "sessions": jload(os.path.join(GAME, "sessions.json"))["sessions"],
         "cards": jload(os.path.join(DATA, "cards.json"))["items"],
         "later": list(DGM.LATER),
         "fit_rows": DJ.doc_rows("### 10.3 ", 2) or [],
         "hold_rows": DJ.doc_rows("### 10.4 ", 5) or [],
         "rule13": [], "lists": DR.block_lists()}
    src = open(os.path.join(ROOT, "docs", "game.md"), encoding="utf-8").read()
    i = src.find("### 1.3 ")
    m = re.search(r"\n#{2,3} ", src[i + 8:])
    sec = src[i:i + 8 + (m.start() if m else len(src))]
    for line in sec.splitlines():
        cells = [c.strip() for c in line.strip().strip("|").split("|")] if line.startswith("| ") else []
        if len(cells) == 3 and not line.startswith("|---"):
            d["rule13"].append(cells)
    d["rule13"] = d["rule13"][1:]
    return d


# 규칙 ------------------------------------------------------------------------

def rule_shape(d):
    f = []
    F = d["files"]
    for n, want in EXPECT.items():
        obj = F[n]
        if n in SPECS:
            items = load_items(n, obj)
            if items is None:
                f.append("%s.json 에서 로더가 찾는 배열 %s 이 없다" % (n, "/".join(SPECS[n][0])))
                continue
            if len(items) != want:
                f.append("%s.json 에서 로더가 살리는 항목이 %d 개다. %d 개여야 한다 (형이 안 맞는 항목은 말없이 빠진다)"
                         % (n, len(items), want))
            if obj.get("count") != len(first_array(obj, SPECS[n][0])):
                f.append("%s.json 의 count 가 배열 길이와 다르다" % n)
        else:
            if len(obj) == 1:
                f.append("%s.json 맨 위 칸이 하나뿐이다. 로더가 그 안으로 들어간다" % n)
            m = load_map(n, obj)
            ids = set(d["app"]["transcripts"]["items"])
            if set(m) != ids:
                extra, miss = sorted(set(m) - ids), sorted(ids - set(m))
                f.append("%s.json 에서 로더가 읽는 과가 52과와 다르다 (더 읽힌 것 %s / 못 읽힌 것 %s)"
                         % (n, extra[:3], miss[:3]))
            for k, v in m.items():
                if n == "audiolen":
                    if not v > 0:
                        f.append("audiolen.json %s 가 0 이하다" % k)
                    continue
                ok = all(is_num(x) for x in v) if n == "cues" else all(isinstance(x, str) and x for x in v)
                if not ok:
                    f.append("%s.json %s 의 값 형이 이상하다" % (n, k))
                    break
    return f


def rule_cover(d):
    f = []
    F = d["files"]
    sets = {x["id"] for x in F["sets"].get("items", [])}
    emg = {x["no"] for x in F["emergency"].get("items", [])}
    plays = {x["id"] for x in F["playblocks"].get("plays", [])}
    tally = {x["id"] for x in F["tally"].get("plays", [])}
    hold = {x["id"] for x in F["hold"].get("plays", [])}
    media = {n: set(load_map(n, F[n])) for n in ("transcripts", "cues", "audiolen")}
    for q in d["sessions"]:
        if q["set"] not in sets:
            f.append("세션 %s 의 세트 %s 가 sets.json 에 없다" % (q["s"], q["set"]))
        if q.get("emergency") is not None and q["emergency"] not in emg:
            f.append("세션 %s 의 비상판 %s 가 emergency.json 에 없다" % (q["s"], q["emergency"]))
        for n, ids in media.items():
            if q["media"] not in ids:
                f.append("세션 %s 의 과 %s 가 %s.json 에 없다" % (q["s"], q["media"], n))
        if q["pick"] not in plays:
            f.append("세션 %s 의 판 %s 가 playblocks.json 에 없다" % (q["s"], q["pick"]))
    if not (plays == tally == hold):
        f.append("판 id 가 playblocks %d / tally %d / hold %d 에서 서로 다르다" % (len(plays), len(tally), len(hold)))
    if len(sets) != 288:
        f.append("세트가 288개가 아니다: %d" % len(sets))
    return f[:12]


def rule_media(d):
    f = []
    F = d["files"]
    t, c, a = (load_map(n, F[n]) for n in ("transcripts", "cues", "audiolen"))
    for n, key in (("transcripts", "items"), ("cues", "items"), ("audiolen", "items")):
        if load_map(n, F[n]) != d["app"][n][key]:
            f.append("%s.json 의 내용이 앱 파일(out/data/%s.json)과 다르다" % (n, n))
    for m in sorted(set(t) & set(c) & set(a)):
        if len(c[m]) != len(t[m]):
            f.append("%s 의 줄 시각이 %d 개, 대본이 %d 줄이다" % (m, len(c[m]), len(t[m])))
            continue
        if c[m] and c[m][0] != 0:
            f.append("%s 의 첫 줄 시각이 0초가 아니다" % m)
        if any(y < x for x, y in zip(c[m], c[m][1:])):
            f.append("%s 의 줄 시각이 줄어드는 자리가 있다" % m)
        if c[m] and c[m][-1] >= a[m]:
            f.append("%s 의 마지막 줄 시각 %s 이 과의 길이 %s 보다 작지 않다" % (m, c[m][-1], a[m]))
    colon = {(m, i) for m, lines in t.items() for i, ln in enumerate(lines)
             if ": " in ln and not LABEL.match(ln.split(": ", 1)[0])}
    if colon != COLON_LINES:
        f.append("이름표가 아닌 앞토막을 자르는 줄이 10.6 6번의 셋과 다르다: %s" % sorted(colon ^ COLON_LINES))
    if F["cues"].get("estimate") is not True:
        f.append("cues.json 이 어림이라고 적고 있지 않다 (estimate)")
    return f


def rule_fit(d):
    f = []
    P = d["files"]["playblocks"]
    table = {r[0]: [int(x) for x in r[1].split(",")] for r in d["fit_rows"]}
    if OLD_KEYS_TOP & set(P):
        f.append("playblocks.json 맨 위에 옛 칸이 있다: %s" % sorted(OLD_KEYS_TOP & set(P)))
    for p in P.get("plays", []):
        if p["id"] not in table:
            f.append("10.3 표에 없는 판: " + p["id"])
        elif p["fit"] != table[p["id"]]:
            f.append("%s 의 fit %s 이 10.3 표 %s 와 다르다" % (p["id"], p["fit"], table[p["id"]]))
        if 1 in p["fit"]:
            f.append("%s 가 블록 1 에 붙는다. 10.3 은 블록 1 에 판을 안 붙인다" % p["id"])
        if not p["fit"] or any(b not in (2, 3, 4) for b in p["fit"]):
            f.append("%s 의 fit 이 이상하다: %s" % (p["id"], p["fit"]))
        if OLD_KEYS_PLAY & set(p):
            f.append("%s 에 옛 칸이 있다: %s" % (p["id"], sorted(OLD_KEYS_PLAY & set(p))))
    if set(table) != {p["id"] for p in P.get("plays", [])}:
        f.append("10.3 표의 판과 playblocks.json 의 판이 다르다")
    return f


def expected_by(phrase):
    if phrase in ("", "-"):
        return "none"
    return "npc" if "NPC" in phrase else ("game" if "게임이" in phrase else "none")


def rule_hold(d):
    f = []
    H = d["files"]["hold"]
    rows = {r[0]: r for r in d["hold_rows"]}
    app = {p["id"]: p for p in d["app"]["hold"]["plays"]}
    rule13 = {c[0]: c[2] for c in d["rule13"]}
    named = set()
    for p in H.get("plays", []):
        r = rows.get(p["id"])
        if r is None:
            f.append("10.4 표에 없는 판: " + p["id"])
            continue
        _, by, seat, holds, phrase = r
        seat = "" if seat == "-" else seat
        if p["by"] not in ("npc", "game", "none"):
            f.append("%s 의 쥐는 쪽 '%s' 를 모른다" % (p["id"], p["by"]))
        if p["by"] != by:
            f.append("%s 의 쥐는 쪽이 10.4 표(%s)와 다르다: %s" % (p["id"], by, p["by"]))
        if p["by"] != expected_by(phrase):
            f.append("%s 의 쥐는 쪽 %s 이 근거 문구에서 나오는 %s 와 다르다" % (p["id"], p["by"], expected_by(phrase)))
        if p["hold"] != (seat if p["by"] == "npc" else ""):
            f.append("%s 의 hold '%s' 가 표의 자리와 다르다" % (p["id"], p["hold"]))
        if p["hold"] and p["hold"] not in p["seats"]:
            f.append("%s 의 hold '%s' 가 seats %s 에 없다" % (p["id"], p["hold"], p["seats"]))
        if p["seats"] != app.get(p["id"], {}).get("seats"):
            f.append("%s 의 seats 가 앱 자료와 다르다" % p["id"])
        if phrase not in ("", "-"):
            name = app.get(p["id"], {}).get("name")
            row = rule13.get(name)
            named.add(name)
            if row is None:
                f.append("%s(%s)가 game.md 1.3 표에 없다" % (p["id"], name))
            elif phrase not in row:
                f.append("%s 의 근거 문구 '%s' 가 game.md 1.3 의 이제 칸에 없다" % (p["id"], phrase))
    if set(rule13) != named and not f:
        f.append("game.md 1.3 의 판 %s 이 10.4 표에 없다" % sorted(set(rule13) - named))
    if len(H.get("plays", [])) and sum(1 for p in H["plays"] if p["by"] == "npc") < 1:
        f.append("NPC 가 쥐는 판이 하나도 없다")
    return f


def plan_again(s, n):
    """해시 규칙을 파생기와 다르게 짠다. 값마다 해시를 만들어 정렬 위치(순위)를 센다."""
    keys = [hashlib.sha1(("mirror:%d:%d" % (s, i)).encode()).hexdigest() for i in range(n)]
    rank = [sum(1 for y in keys if y < x) for x in keys]
    extra = (int(hashlib.sha1(("mirror:%d:n" % s).encode()).hexdigest(), 16) & 1) if n % 2 else 0
    k = n // 2 + extra
    return "".join("1" if r < k else "0" for r in rank)


def rule_pick(d):
    f = []
    mirror = [p for p in d["files"]["hold"].get("plays", []) if p["id"] == "mirror"]
    if len(mirror) != 1 or "pick" not in mirror[0]:
        return ["hold.json 에 거울 배정이 없다"]
    plan = mirror[0]["pick"].get("plan", {})
    decks = {}
    for q in d["sessions"]:
        dk = q["decks"]
        dk = json.loads(dk) if isinstance(dk, str) else dk
        if dk.get("mirror"):
            decks[str(q["s"])] = len(dk["mirror"])
    if set(plan) != set(decks):
        f.append("거울 배정 세션이 거울 덱이 있는 세션과 다르다 (배정 %d / 덱 %d)" % (len(plan), len(decks)))
    for s, text in plan.items():
        n = decks.get(s)
        if n is None:
            continue
        if not isinstance(text, str) or len(text) != n or set(text) - {"0", "1"}:
            f.append("세션 %s 의 거울 배정이 이상하다: %r (덱 %d 회)" % (s, text, n))
            continue
        if abs(text.count("1") - text.count("0")) > n % 2:
            f.append("세션 %s 의 거울 배정이 안 고르다: %s" % (s, text))
        if text != plan_again(int(s), n):
            f.append("세션 %s 의 거울 배정이 해시 규칙으로 다시 센 값과 다르다" % s)
    return f[:12]


def rule_secret(d):
    f = []
    blobs = {n: json.dumps(d["files"][n], ensure_ascii=False) for n in NAMES}
    for c in d["cards"]:
        if c["type"] != "판정":
            continue
        ans = (c["a"].get("answer") or "").strip()
        if len(ans) < 9:
            continue
        for n, blob in blobs.items():
            if ans in blob:
                f.append("%s 의 답이 %s.json 에 실렸다" % (c["id"], n))
    for n, blob in blobs.items():
        if '"game-only"' in blob or '"visibility"' in blob:
            f.append("%s.json 에 판정 열쇠 파일의 표시(visibility)가 있다" % n)
    return f


def strings(v):
    if isinstance(v, str):
        yield v
    elif isinstance(v, list):
        for x in v:
            yield from strings(x)
    elif isinstance(v, dict):
        for x in v.values():
            yield from strings(x)


def rule_chars(d):
    f = []
    for n in NAMES:
        txt = json.dumps(d["files"][n], ensure_ascii=False)
        if "—" in txt:
            f.append("%s.json 에 em-dash 가 있다" % n)
        if "�" in txt:
            f.append("%s.json 에 U+FFFD 가 있다" % n)
    words = [w for w, kind in d["lists"][2] if kind in ("슬랭", "상표")]
    for n in ("sets", "emergency"):
        hit = None
        for s in strings(d["files"][n]):
            if not re.search(r"[A-Za-z]", s):
                continue
            for w in words:
                if re.search(r"(?<![A-Za-z])" + re.escape(w) + r"(?![A-Za-z])", s, re.I):
                    hit = (w, s)
            for b in DR.DS.BRANDS:
                if re.search(r"\b" + re.escape(b) + r"\b", s):
                    hit = (b, s)
            if hit:
                f.append("%s.json 에 막는 말(슬랭, 상표) %s: %s" % (n, hit[0], hit[1][:40]))
                break
    return f


def rule_manifest(d):
    missing = [n + ".json" for n in NAMES if n + ".json" not in d["later"]]
    return ["derive_game_manifest.py 의 목록에 없다: " + " ".join(missing)] if missing else []


RULES = [("shape", rule_shape), ("cover", rule_cover), ("media", rule_media), ("fit", rule_fit), ("hold", rule_hold),
         ("pick", rule_pick), ("secret", rule_secret), ("chars", rule_chars), ("manifest", rule_manifest)]


def rule_fresh(d):
    fresh, fail = DGO.build()
    if fresh is None or fail:
        return ["다시 못 뽑았다: " + "; ".join(fail[:2])]
    return ["%s.json 이 원본을 다시 읽은 것과 다르다. python3 scripts/derive_game_optional.py 를 다시 돌린다" % n
            for n in NAMES if json.loads(json.dumps(fresh[n], ensure_ascii=False)) != d["files"][n]]


# 깸 시험 ---------------------------------------------------------------------

def breaks():
    B = []

    def add(name, rule):
        def deco(fn):
            B.append((name, rule, fn))
            return fn
        return deco

    F = "files"

    @add("세트 배열 이름을 로더가 모르는 이름으로 바꾼다", "shape")
    def _(d):
        d[F]["sets"]["rows"] = d[F]["sets"].pop("items")

    @add("세트 칸 값을 글자가 아닌 수로 바꾼다", "shape")
    def _(d):
        d[F]["sets"]["items"][3]["steps"][0]["fields"]["본문"] = 7

    @add("비상판 분을 글자로 바꾼다", "shape")
    def _(d):
        d[F]["emergency"]["items"][0]["minutes"]["pull"] = "10"

    @add("소리 길이 맨 위에 수 칸을 둔다", "shape")
    def _(d):
        d[F]["audiolen"]["count"] = 52

    @add("대본을 앱 껍질({note,generator,count,items})로 되돌린다", "shape")
    def _(d):
        t = d[F]["transcripts"]
        d[F]["transcripts"] = {"note": "x", "generator": "x", "count": 52,
                               "items": {k: v for k, v in t.items() if isinstance(v, list)}}

    @add("판 하나의 id 를 지운다", "shape")
    def _(d):
        d[F]["playblocks"]["plays"][2]["id"] = ""

    @add("쥐는 판의 seats 를 글자 하나로 바꾼다", "shape")
    def _(d):
        d[F]["hold"]["plays"][0]["seats"] = "읽는 쪽"

    @add("세트 하나를 지운다", "cover")
    def _(d):
        d[F]["sets"]["items"].pop(10)

    @add("어림 시각에서 과 하나를 지운다", "cover")
    def _(d):
        d[F]["cues"].pop("lle1-05")

    @add("판 하나를 tally 에서 지운다", "cover")
    def _(d):
        d[F]["tally"]["plays"].pop(0)

    @add("과 하나의 줄 시각을 한 개 줄인다", "media")
    def _(d):
        d[F]["cues"]["lle1-02"].pop()

    @add("마지막 줄 시각을 과 길이 밖으로 보낸다", "media")
    def _(d):
        d[F]["cues"]["lle1-01"][-1] = d[F]["audiolen"]["lle1-01"] + 1

    @add("줄 시각이 줄어드는 자리를 만든다", "media")
    def _(d):
        d[F]["cues"]["lle1-03"][5], d[F]["cues"]["lle1-03"][6] = d[F]["cues"]["lle1-03"][6], d[F]["cues"]["lle1-03"][5]

    @add("대본 한 줄을 앱 파일과 다르게 고친다", "media")
    def _(d):
        d[F]["transcripts"]["lle1-01"][0] = "Pete: Hello!"

    @add("판을 블록 1 에 붙인다", "fit")
    def _(d):
        d[F]["playblocks"]["plays"][0]["fit"] = [1, 4]

    @add("판이 붙는 블록을 표와 다르게 바꾼다", "fit")
    def _(d):
        d[F]["playblocks"]["plays"][8]["fit"] = [4]

    @add("옛 칸 together 를 되살린다", "fit")
    def _(d):
        d[F]["playblocks"]["plays"][1]["together"] = False

    @add("맨 위에 옛 칸 empty 를 되살린다", "fit")
    def _(d):
        d[F]["playblocks"]["empty"] = [1]

    @add("쥐는 쪽을 모르는 값으로 바꾼다", "hold")
    def _(d):
        d[F]["hold"]["plays"][0]["by"] = "maybe"

    @add("NPC 가 앉는 자리를 seats 밖으로 보낸다", "hold")
    def _(d):
        d[F]["hold"]["plays"][0]["hold"] = "없는 쪽"

    @add("거울을 게임이 쥐는 판으로 바꾼다", "hold")
    def _(d):
        p = d[F]["hold"]["plays"][0]
        p["by"], p["hold"] = "game", ""

    @add("표의 근거 문구가 game.md 1.3 에 없다", "hold")
    def _(d):
        d["hold_rows"][0][4] = "NPC 가 아무 말이나 한다"

    @add("거울 배정 길이를 줄인다", "pick")
    def _(d):
        k = next(iter(d[F]["hold"]["plays"][0]["pick"]["plan"]))
        d[F]["hold"]["plays"][0]["pick"]["plan"][k] = "0101"

    @add("거울 배정을 한쪽으로 몰아 쓴다", "pick")
    def _(d):
        k = next(iter(d[F]["hold"]["plays"][0]["pick"]["plan"]))
        d[F]["hold"]["plays"][0]["pick"]["plan"][k] = "11111111"

    @add("거울 배정에 2 를 넣는다", "pick")
    def _(d):
        k = next(iter(d[F]["hold"]["plays"][0]["pick"]["plan"]))
        d[F]["hold"]["plays"][0]["pick"]["plan"][k] = "01012010"

    @add("같은 수지만 해시 규칙과 다른 배정을 쓴다", "pick")
    def _(d):
        k = next(iter(d[F]["hold"]["plays"][0]["pick"]["plan"]))
        cur = d[F]["hold"]["plays"][0]["pick"]["plan"][k]
        d[F]["hold"]["plays"][0]["pick"]["plan"][k] = cur[::-1] if cur[::-1] != cur else ("0" + cur[1:])

    @add("거울 배정에서 세션 하나를 뺀다", "pick")
    def _(d):
        d[F]["hold"]["plays"][0]["pick"]["plan"].pop("100")

    @add("카드 답을 hold 의 설명에 싣는다", "secret")
    def _(d):
        c = next(c for c in d["cards"] if c["type"] == "판정" and len(c["a"].get("answer", "")) > 12)
        d[F]["hold"]["plays"][3]["holds"] = c["a"]["answer"]

    @add("판정 열쇠 파일의 표시를 여덟에 싣는다", "secret")
    def _(d):
        d[F]["tally"]["visibility"] = "game-only"

    @add("em-dash 를 노트에 넣는다", "chars")
    def _(d):
        d[F]["hold"]["note"] += " " + chr(0x2014)

    @add("슬랭을 비상판 청크에 넣는다", "chars")
    def _(d):
        word = next(w for w, kind in d["lists"][2] if kind == "슬랭" and re.fullmatch(r"[A-Za-z]+", w))
        d[F]["emergency"]["items"][0]["chunks"][0] = word

    @add("여덟 이름 하나를 지문 목록에서 뺀다", "manifest")
    def _(d):
        d["later"].remove("hold.json")

    @add("파생물을 손으로 고친다", "fresh")
    def _(d):
        d[F]["tally"]["plays"][0]["how"] = "max"

    return B


def run_rules(d, fresh=False):
    out = [(name, m) for name, fn in RULES for m in fn(d)]
    if fresh:
        out += [("fresh", m) for m in rule_fresh(d)]
    return out


def main():
    d = load()
    fails = run_rules(d, fresh=True)
    for name, m in fails:
        print("[실패] (%s) %s" % (name, m))
    F = d["files"]
    held = sum(1 for p in F["hold"]["plays"] if p["by"] == "npc")
    plan = next(p for p in F["hold"]["plays"] if p["id"] == "mirror")["pick"]["plan"]
    print("선택 자료 %d / 세트 %d 비상판 %d 판 %d / NPC 가 쥐는 판 %d / 거울 배정 %d세션 / 대본 %d과 줄 %d"
          % (len(NAMES), len(F["sets"]["items"]), len(F["emergency"]["items"]), len(F["playblocks"]["plays"]), held,
             len(plan), len(load_map("transcripts", F["transcripts"])),
             sum(len(v) for v in load_map("transcripts", F["transcripts"]).values())))
    bad = 0
    if "--break" in sys.argv:
        proofs = breaks()
        caught = 0
        rules = dict(RULES)
        rules["fresh"] = rule_fresh
        for name, rule, fn in proofs:
            e = {k: (v if k in ("sessions", "cards", "app", "lists") else copy.deepcopy(v)) for k, v in d.items()}
            try:
                fn(e)
            except (KeyError, IndexError, StopIteration) as ex:
                bad += 1
                print("[실패] 깸 시험을 못 심었다: %s (%s)" % (name, ex))
                continue
            if rules[rule](e):
                caught += 1
            else:
                bad += 1
                print("[실패] 깸 시험이 안 잡혔다: %s (규칙 %s)" % (name, rule))
        print("깸 시험 %d개 중 잡힌 것 %d" % (len(proofs), caught))
        covered = {r for _, r, _ in proofs}
        for r in [n for n, _ in RULES] + ["fresh"]:
            if r not in covered:
                bad += 1
                print("[실패] 깸 시험이 없는 규칙: " + r)
    n = len(fails) + bad
    print("검사 규칙 %d+1 / 실패 %d" % (len(RULES), n))
    return 1 if n else 0


if __name__ == "__main__":
    sys.exit(main())
