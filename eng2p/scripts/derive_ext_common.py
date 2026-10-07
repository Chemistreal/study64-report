#!/usr/bin/env python3
"""확장층 파생기 다섯이 같이 쓰는 것 (`docs/expansion.md`).

이 파일은 아무것도 안 낸다. 다른 derive_ext_*.py 와 check_ext.py 가 불러 쓴다.
**자를 한 곳에 둔다.** 파생기와 검사기가 낱말을 다르게 세면 검사가 검사가 아니다.

    tokens()        낱말 세는 법. check_ground.py 와 같다 ([a-z]+, 소문자)
    heard_by_week() 그 주까지 블록 1 에서 들은 LLE1 과의 낱말 (out/data/transcripts.js + sessions.json)
    gate_words()    heard + docs/wordlist.md + docs/expansion.md 의 확장 낱말과 이름
    write_ext()     out/data/ext_*.json 과 짝 .js 를 낸다 (check_data.py 의 짝 검사를 지킨다)
    SLANG BRANDS PEOPLE SACRED AGENCY  막는 목록. 파생기는 걸러 내고 검사기는 다시 본다
"""
import hashlib
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DOCS = os.path.join(ROOT, "docs")
OUT = os.path.join(ROOT, "out", "data")
STORE = os.environ.get("GAME_STORE", "/home/user/game_store")
EXPANSION = os.path.join(DOCS, "expansion.md")

sys.path.insert(0, HERE)
from derive_town import BRANDS as TOWN_BRANDS  # noqa: E402

# derive_scenes.py 가 더한 놀이 상표까지 같이 건다
BRANDS = TOWN_BRANDS + ["Scrabble", "Monopoly", "Lego", "Frisbee", "Kleenex", "Uber", "Google", "Facebook"]

# 슬랭과 군말. 전면 금지 (CLAUDE.md). 계획 1.4 의 목록에 Tatoeba 에서 자주 보이는 것을 더했다.
# gonna wanna gotta 셋은 대본에 있어 허용이다 (CLAUDE.md 구어 축약 철자). 그래도 확장층 새 글에는 안 쓴다
SLANG = ["awesome", "bummer", "flop", "bust", "busted", "guys", "cool", "yeah", "yep", "nope", "wow",
         "um", "uh", "dude", "kinda", "sorta", "gonna", "wanna", "gotta", "ain", "y'all", "ya",
         "lol", "omg", "hey", "freaking", "freak", "sucks", "suck", "crap", "damn", "hell", "stupid",
         "buddy", "pal", "bro", "chill", "lit", "nah", "cops", "booze", "loser", "jerk", "dumb",
         "screw", "pissed", "idiot", "weird", "crazy", "okay", "ok"]

# 실존 인물. 라디오 원문(VOA 그대로)에는 남을 수 있다. 확장층이 **새로 쓴 글**과 잡담에는 안 된다
PEOPLE = ["Emma G", "Obama", "Trump", "Biden", "Clinton", "Bush", "Lincoln", "Washington",
          "Roosevelt", "Kennedy", "Reagan", "Nixon", "Jefferson", "Harris", "Vance"]

# 신성한 것과 퀘스트로 만들면 안 되는 것 (docs/sources.md 3.5, audit_culture)
SACRED = ["Pele", "heiau", "Kumulipo", "night marchers", "night marcher", "Kalaupapa", "leprosy",
          "Hansen", "1893", "overthrow", "iwi", "burial cave", "oli", "mele", "hula kahiko",
          "Hiiaka", "Hiʻiaka", "Kane", "Kanaloa", "Lono", "Ku-ka", "kupua", "sacrifice"]

# 통신사 글. 본문에 이 꼴이 있으면 글 전체를 뺀다 (VOA 권리 쪽 p/6861)
AGENCY = re.compile(r"(Associated Press|\bAP\b(?! Photo)|Reuters|\bAFP\b|Agence France)", re.I)
AGENCY_CREDIT = re.compile(r"(reported|wrote|reporting)[^.]{0,80}\b(for|from)\s+(the\s+)?"
                           r"(Associated Press|AP|Reuters|AFP|Agence France)", re.I)

LICENSES = {"VOA-PD", "PD-USGov", "PD(US,KR)", "CC0-1.0", "CC-BY-2.0-FR"}
GRADES = {"A", "B", "C-real", "C-gen"}


# 하와이어 표기 (ʻokina 와 장음 다섯). 낱말을 셀 때만 접는다. 글에는 그대로 둔다 (sources.md 3.5)
FOLD = str.maketrans({"\u02bb": "", "\u0101": "a", "\u0113": "e", "\u012b": "i", "\u014d": "o", "\u016b": "u",
                      "\u0100": "A", "\u0112": "E", "\u012a": "I", "\u014c": "O", "\u016a": "U"})


def tokens(text):
    """check_ground.py 와 같은 자. 소문자 [a-z]+. don't 는 don, t 둘이다. 하와이어 표기는 접는다."""
    return re.findall(r"[a-z]+", text.translate(FOLD).lower())


SPEAKER = re.compile(r"^[A-Z][A-Za-z .'-]{0,20}:\s*")


def transcripts():
    p = os.path.join(OUT, "transcripts.js")
    t = open(p, encoding="utf-8").read()
    return json.loads(t[t.find("=") + 1:].rstrip().rstrip(";"))["items"]


def first_week():
    """LLE1 과마다 블록 1 에서 처음 듣는 주. out/game/sessions.json 의 media 칸."""
    S = json.load(open(os.path.join(ROOT, "out", "game", "sessions.json"), encoding="utf-8"))["sessions"]
    first = {}
    for s in S:
        m = s.get("media")
        if m and m not in first:
            first[m] = s["week"]
    return first


_HEARD = {}


def heard_by_week(min_count=2):
    """{주: 그 주까지 들은 낱말 집합}. 1~48 다. 낱말은 들은 과 대본에서 min_count 번 이상."""
    if min_count in _HEARD:
        return _HEARD[min_count]
    T = transcripts()
    first = first_week()
    out = {}
    from collections import Counter
    c = Counter()
    for w in range(1, 49):
        for m, fw in first.items():
            if fw == w:
                for line in T[m]:
                    c.update(tokens(SPEAKER.sub("", line)))
        out[w] = {k for k, v in c.items() if v >= min_count}
    _HEARD[min_count] = out
    return out


def code_blocks(src):
    return re.findall(r"```\n(.*?)```", src, re.S)


def wordlist_md():
    """docs/wordlist.md 의 낱말. 코드 블록 안의 것만."""
    src = open(os.path.join(DOCS, "wordlist.md"), encoding="utf-8").read()
    out = set()
    for b in code_blocks(src):
        out.update(tokens(b))
    return out


def section(src, head):
    i = src.find(head)
    if i < 0:
        return ""
    j = src.find("\n## ", i + len(head))
    return src[i:j if j > 0 else len(src)]


def ext_lists():
    """docs/expansion.md 9장의 확장 낱말과 이름. {'words': {낱말: 주}, 'names': {낱말: 주}}.

    표 한 줄이 `| 주부터 | 갈래 | 낱말들 | 왜 |` 다. 그 주부터 그 낱말을 쓸 수 있다.
    """
    src = open(EXPANSION, encoding="utf-8").read()
    sec = section(src, "## 9.")
    words, names = {}, {}
    for line in sec.splitlines():
        if not line.startswith("| ") or line.startswith("|---"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) != 4 or not cells[0].isdigit():
            continue
        wk, kind, ws = int(cells[0]), cells[1], cells[2]
        tgt = names if kind == "이름" else words
        for w in tokens(ws):
            tgt[w] = min(wk, tgt.get(w, 99))
    return {"words": words, "names": names}


def gate_words(week, lists=None):
    """그 주에 확장층 새 글이 쓸 수 있는 낱말. (들은 낱말 + wordlist, 확장 낱말, 이름) 셋으로 돌려준다."""
    lists = lists or ext_lists()
    base = heard_by_week()[week] | wordlist_md()
    ext = {w for w, k in lists["words"].items() if k <= week}
    nm = {w for w, k in lists["names"].items() if k <= week}
    return base, ext, nm


def quarter(week):
    return "Q%d" % ((week - 1) // 12 + 1)


def sha256_file(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def write_ext(name, head, items):
    """out/data/<name>.json 과 .js 를 낸다. 머리는 scenes.json 과 같은 꼴이다.

    줄마다 grade 와 license 를 다시 단다 (check_grade.py: 등급은 파일에 붙는데 재료는 줄에 있다).
    """
    os.makedirs(OUT, exist_ok=True)
    body = dict(head)
    body["count"] = len(items)
    body["items"] = items
    text = json.dumps(body, ensure_ascii=False, indent=1) + "\n"
    p = os.path.join(OUT, name + ".json")
    open(p, "w", encoding="utf-8").write(text)
    g = "ENG2P_" + name.upper()
    tight = json.dumps(body, ensure_ascii=False, separators=(",", ":"))
    open(os.path.join(OUT, name + ".js"), "w", encoding="utf-8").write("window.%s=%s;\n" % (g, tight))
    return p


def read_ext(name):
    p = os.path.join(OUT, name + ".json")
    if not os.path.exists(p):
        return None
    return json.load(open(p, encoding="utf-8"))
