#!/usr/bin/env python3
"""확장 라디오 (`docs/expansion.md` 3장). `out/data/ext_radio.json` 을 낸다.

세 갈래다.

    LLE2       Let's Learn English 2단계 30과. 25~48주. 저장소의 media/english/archive/voa-lle2-full.json
    AS         American Stories. 거름 규칙(3.3)을 통과한 것만. 쪽은 저장소 밖 game_store/voa_ext 에 받아 둔다
    NP         America's National Parks. Q2 (13~24주). 같은 곳

**글은 원문 그대로다 (C-real 녹음의 대본).** 음성 파일은 어디에도 안 들어간다. 음성 주소만 적는다.
뺀 것도 적는다: 사진과 캡션, Words in This Story (단어장), 퀴즈, 교사용 안내, 무대 지시, 낱말 목록.

거름 (AS, NP)
    본문이나 끝 줄에 통신사(AP, Reuters, AFP)가 나오면 글 전체를 뺀다
    원작자가 1963년 뒤에 죽었거나 모르면 뺀다 (한국 보호 기간. sources.md 3장)
    공포, 전쟁, 죽임, 악마, 유령 제목 목록과 본문 낱말 셈 (VIOLENT) 으로 뺀다
    실존 정치인 제목, 노래 가사, 영화 장면 글을 뺀다

사용법:
    python3 scripts/derive_ext_radio.py --fetch   # VOA 쪽을 game_store/voa_ext 에 받는다 (한 번)
    python3 scripts/derive_ext_radio.py           # 파생. 받아 둔 쪽이 없으면 AS NP 는 지금 JSON 의 것을 그대로 잇는다
"""
import datetime
import hashlib
import html
import json
import os
import re
import sys
import time
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import derive_ext_common as C  # noqa: E402

ARCHIVE = os.path.join(C.ROOT, "..", "media", "english", "archive", "voa-lle2-full.json")
CACHE = os.path.join(C.STORE, "voa_ext")
BASE = "https://learningenglish.voanews.com"
UA = {"User-Agent": "study64-game-fetch/1.0 (public-domain VOA Learning English text mirror)"}
CREDIT = "VOA Learning English, learningenglish.voanews.com"
RIGHTS = "https://learningenglish.voanews.com/p/6861.html"

SERIES = {
    "AS": {"name": "American Stories", "list": BASE + "/z/1581", "paged": True},
    "NP": {"name": "America's National Parks", "list": BASE + "/p/5849.html", "paged": False},
}

# LLE2 주 배치. 계획(audit_material 1.2) 표 그대로. 30과가 한 번씩 다 나온다
LLE2_WEEK = {
    1: 25, 2: 25, 3: 26, 12: 27, 13: 27, 4: 28, 5: 29, 10: 30, 20: 31, 14: 32, 6: 33, 7: 33,
    11: 34, 26: 35, 17: 36, 18: 36, 24: 37, 9: 38, 15: 39, 21: 40, 22: 40, 23: 41, 29: 42,
    25: 43, 30: 44, 27: 45, 16: 46, 28: 47, 8: 48, 19: 48,
}

# 계획 6장 달력이 고른 자리. 제목의 앞 토막으로 찾는다. 여기 없는 통과분은 '열림' 후보로 둔다
AS_WEEK = [
    ("two thanksgiving day gentlemen", 17), ("the gift of the magi", 23),
    ("romance of a busy broker", 26), ("the lady, or the tiger", 28), ("mammon and the archer", 30),
    ("pigs is pigs", 32), ("caliph, cupid and the clock", 34), ("count and the wedding guest", 36),
    ("celebrated jumping frog", 37), ("a white heron", 38), ("a pair of silk stockings", 39),
    ("paul bunyan", 40), ("transients in arcadia", 41), ("pecos bill", 42),
    ("ransom of red chief", 43), ("athenaise", 44), ("chicken little", 45),
]
NP_WEEK = [
    ("hawaii volcanoes", 13), ("national park week", 14), ("everglades", 15),
    ("great smoky", 16), ("yellowstone", 18), ("grand canyon", 19), ("hot springs", 20),
    ("crater lake", 21), ("mesa verde", 22), ("virgin islands", 23), ("acadia", 24), ("olympic", 24),
]

# 원작자 사망 연도. **여기 없는 원작자는 모름이라 뺀다.** 1963 전 사망이면 한국에서도 끝났다 (sources.md 3장)
AUTHOR_DIED = {
    "mark twain": 1910, "o. henry": 1910, "o henry": 1910, "edgar allan poe": 1849,
    "nathaniel hawthorne": 1864, "stephen crane": 1900, "jack london": 1916,
    "washington irving": 1859, "bret harte": 1902, "kate chopin": 1904,
    "sarah orne jewett": 1909, "frank r. stockton": 1902, "frank stockton": 1902,
    "ellis parker butler": 1937, "willa cather": 1947, "edith wharton": 1937,
    "ambrose bierce": 1914, "herman melville": 1891, "louisa may alcott": 1888,
    "henry james": 1916, "f. scott fitzgerald": 1940, "sherwood anderson": 1941,
    "ring lardner": 1933, "charlotte perkins gilman": 1935, "mary e. wilkins freeman": 1930,
    "hamlin garland": 1940, "frank norris": 1902, "harriet beecher stowe": 1896,
    "edward everett hale": 1909, "joel chandler harris": 1908, "l. frank baum": 1919,
    "fitz james o'brien": 1862, "richard harding davis": 1916, "zona gale": 1938,
    "dorothy canfield fisher": 1958, "edgar lee masters": 1950, "theodore dreiser": 1945,
    "carl sandburg": 1967, "james thurber": 1961, "langston hughes": 1967,
    "rudyard kipling": 1936, "charles dickens": 1870, "guy de maupassant": 1893,
    "anton chekhov": 1904, "leo tolstoy": 1910, "frank richard stockton": 1902,
    "henry wadsworth longfellow": 1882, "walt whitman": 1892, "emily dickinson": 1886,
    "robert frost": 1963, "ernest hemingway": 1961, "william faulkner": 1962,
    "john steinbeck": 1968, "paul laurence dunbar": 1906, "charles w. chesnutt": 1932,
    "charles chesnutt": 1932, "o.henry": 1910, "george washington cable": 1925,
    "thomas bailey aldrich": 1907, "william dean howells": 1920, "frank baum": 1919,
}
# 이야기꾼이 지은 것이 아닌 옛 민담 (원작자 없음). 제목으로 받는다
FOLK = ["paul bunyan", "pecos bill", "chicken little", "john henry", "johnny appleseed",
        "mike fink", "davy crockett", "stormalong", "jack frost", "rip van winkle"]

# 제목으로 빼는 것. 공포, 전쟁, 죽임, 악마, 노예 반란, 정치인 (계획 2.3 실측 목록)
DENY_TITLE = ["usher", "cask", "tell-tale", "rue morgue", "benito cereno", "blue hotel",
              "boarded window", "devil", "birthmark", "to build a fire", "gettysburg", "ghost",
              "murder", "dead", "death", "war", "killer", "black cat", "masque", "pit and the pendulum",
              "the raven", "sleepy hollow", "headless", "owl creek", "rappaccini", "golden bug",
              "gold-bug", "gold bug", "premature", "monkey's paw", "yellow wallpaper", "witch",
              "feathertop", "black", "obama", "stonewall", "president", "slave", "battle",
              "soldier", "occurrence", "open boat", "minister's black veil", "young goodman",
              "dr. heidegger", "heidegger", "lady in black", "bride comes to yellow sky",
              "municipal report", "californian's tale", "mystery", "hanging", "chickamauga",
              "imp of the perverse", "ligeia", "berenice", "morella", "the oval portrait",
              "silence", "an occurrence", "the damned thing", "middle toe", "moxon",
              "eyes", "hollow", "law of life", "love of life", "the outcasts", "tennessee's partner",
              "the luck", "maggie", "the monster", "horror", "terror", "fear", "skeleton",
              # 기계 거름을 지나갔지만 읽어 보니 뺄 것 (2026-10-07 통과분을 제목으로 훑었다)
              "william wilson",           # 분신과 죽임 (Poe)
              "paul's case",              # 끝이 자살이다
              "cop and the anthem",       # 술과 체포를 바라는 이야기
              "from the cabby",           # 술 취한 마부
              "line of least resistance"] # 혼외 관계
# 사람이 읽고 통과시킨 것 (계획 2.3 '남는 것'). 폭력 낱말 셈과 영화 언급만 건너뛴다. 통신사, 원작자 규칙은 그대로
REVIEWED = ["two thanksgiving day gentlemen", "chicken little", "ransom of red chief", "a white heron",
            "the white heron", "lady, or the tiger", "count and the wedding guest"]
# 본문에서 세는 낱말. 원작 맥락이라 하나둘은 있을 수 있다. 셋 넘으면 뺀다
VIOLENT = ["kill", "killed", "kills", "killing", "murder", "murdered", "blood", "bloody", "gun", "guns",
           "shot", "shoot", "knife", "dead", "corpse", "ghost", "devil", "grave", "war", "soldier",
           "soldiers", "hanged", "die", "died", "death", "body", "poison", "scream", "screamed"]
VIOLENT_MAX = 3
# 이야기 글이 아닌 것과 가사, 영화
DENY_BODY = ["lyrics", "song by", "movie", "film clip"]


# ---------------------------------------------------------------- 받기

def get(url):
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read()
        except Exception:
            if i == 3:
                raise
            time.sleep(2 ** (i + 1))


def links(page_html):
    out = []
    for m in re.finditer(r'href="(/a/[^"#?]+\.html)"', page_html):
        if m.group(1) not in out:
            out.append(m.group(1))
    return out


def fetch():
    os.makedirs(CACHE, exist_ok=True)
    idx_p = os.path.join(CACHE, "index.json")
    idx = json.load(open(idx_p, encoding="utf-8")) if os.path.exists(idx_p) else {"items": []}
    have = {x["url"] for x in idx["items"]}
    today = datetime.date.today().isoformat()
    for key, s in SERIES.items():
        hrefs = []
        if s["paged"]:
            p = 0
            while True:
                url = s["list"] + ("" if p == 0 else "?p=%d" % p)
                got = links(get(url).decode("utf-8", "replace"))
                new = [h for h in got if h not in hrefs]
                if not new:
                    break
                hrefs += new
                p += 1
                time.sleep(0.3)
        else:
            hrefs = links(get(s["list"]).decode("utf-8", "replace"))
        print("== %s 목록 %d편" % (key, len(hrefs)))
        d = os.path.join(CACHE, key)
        os.makedirs(d, exist_ok=True)
        for h in hrefs:
            url = BASE + h
            if url in have:
                continue
            aid = re.search(r"(\d+)\.html$", h).group(1)
            b = get(url)
            fn = os.path.join(d, aid + ".html")
            open(fn, "wb").write(b)
            idx["items"].append({"series": key, "id": aid, "url": url, "file": "%s/%s.html" % (key, aid),
                                 "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest(), "fetched": today})
            have.add(url)
            time.sleep(0.3)
        idx["items"].sort(key=lambda x: (x["series"], x["id"]))
        json.dump(idx, open(idx_p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("받아 둔 쪽 %d개 / %s" % (len(idx["items"]), CACHE))


# ---------------------------------------------------------------- VOA 쪽 읽기

def strip_tags(s):
    s = re.sub(r"<(script|style|figure|figcaption|noscript)\b.*?</\1>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<br\s*/?>", " ", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


STOP = re.compile(r"^(_{3,}|Words in This Story|Quiz\b|For Teachers|Now it'?s your turn|"
                  r"Practice\b|What do you think|Your Turn|Lesson Plan|Start the Quiz)", re.I)


# 쪽의 틀 (재생기 문구, 댓글과 SNS 안내, 활동지 내려받기). 본문이 아니다
CHROME = re.compile(r"(No media source currently available|Facebook|Twitter|Instagram|YouTube|"
                    r"Leave a comment|Join the conversation|comments? section|Download activities|"
                    r"Download (the|a) |Share your|We want to hear from you|Send us an email|"
                    r"learningenglish@|^Share$|^Embed$)", re.I)


def parse_article(raw):
    t = raw.decode("utf-8", "replace")
    title = strip_tags((re.search(r'<h1[^>]*>(.*?)</h1>', t, re.S) or [None, ""])[1])
    pub = (re.search(r'pub_datetime:"([0-9-]+)', t) or [None, ""])[1]
    audio = ""
    m = re.search(r'<audio[^>]+src="(https://[^"]+\.mp3)"', t)
    if m:
        audio = m.group(1)
    i = t.find('class="wsw"')
    body = t[i:] if i >= 0 else ""
    # 본문 블록이 끝나는 자리. 공유 단추나 쪽 끝 스크립트 앞
    for end in ('class="c-author', 'id="comments"', 'class="share--box', "</article>"):
        j = body.find(end)
        if j > 0:
            body = body[:j]
            break
    paras = []
    dropped = {"photos": 0, "glossaryDropped": False, "quiz_or_teacher": False}
    dropped["photos"] = len(re.findall(r"<figure\b|<img\b", body))
    stopped = False
    for m in re.finditer(r"<(p|h2|h3|h4)\b[^>]*>(.*?)</\1>", body, re.S | re.I):
        line = strip_tags(m.group(2))
        if not line:
            continue
        if STOP.match(line):
            if line.lower().startswith("words in this story"):
                dropped["glossaryDropped"] = True
            else:
                dropped["quiz_or_teacher"] = True
            stopped = True
            break
        if CHROME.search(line):
            dropped["site"] = dropped.get("site", 0) + 1
            continue
        paras.append(line)
    if not stopped and "Words in This Story" in body:
        dropped["glossaryDropped"] = True
    return {"title": title, "pub": pub, "audio": audio, "paras": paras, "dropped": dropped, "all": strip_tags(body)}


def author_of(title, paras):
    low = (title + " " + " ".join(paras[-6:]) + " " + " ".join(paras[:4])).lower()
    for f in FOLK:
        if f in title.lower():
            return "folk", None
    best = None
    for a, y in AUTHOR_DIED.items():
        if re.search(r"\b" + re.escape(a) + r"\b", low):
            if best is None or len(a) > len(best[0]):
                best = (a, y)
    return (best[0], best[1]) if best else (None, None)


def judge(series, art):
    """거름. (통과 여부, 까닭 목록, 원작자, 사망 연도)."""
    why = []
    title_l = art["title"].lower()
    text = " ".join(art["paras"])
    if not art["paras"]:
        why.append("본문 없음")
    if C.AGENCY_CREDIT.search(text) or C.AGENCY.search(text):
        why.append("통신사")
    for d in DENY_TITLE:
        if re.search(r"(?<![a-z])" + re.escape(d) + r"(?![a-z])", title_l):
            why.append("제목: " + d)
            break
    reviewed = any(r in title_l.replace("\u2019", "'").replace("\u2018", "'") for r in REVIEWED)
    n_v = sum(C.tokens(text).count(w) for w in VIOLENT)
    if n_v > VIOLENT_MAX and not reviewed:
        why.append("폭력 낱말 %d" % n_v)
    for d in DENY_BODY:
        if d in text.lower() and not reviewed:
            why.append("가사/영화: " + d)
            break
    for p in C.PEOPLE:
        if re.search(r"\b" + re.escape(p) + r"\b", art["title"]):
            why.append("실존 정치인 제목: " + p)
    a, died = (None, None)
    if series == "AS":
        a, died = author_of(art["title"], art["paras"])
        if a is None:
            why.append("원작자 모름")
        elif died is not None and died >= 1963:
            why.append("원작자 %d 사망 (한국 보호)" % died)
    return (not why), why, a, died


def place(table, title):
    t = title.lower().replace("’", "'")
    for key, wk in table:
        if key in t:
            return wk
    return None


def ext_items():
    """받아 둔 VOA 쪽에서 AS, NP 항목을 만든다. 받아 둔 것이 없으면 None."""
    idx_p = os.path.join(CACHE, "index.json")
    if not os.path.exists(idx_p):
        return None, None
    idx = json.load(open(idx_p, encoding="utf-8"))
    items, report = [], []
    seen_np = set()
    for x in idx["items"]:
        raw = open(os.path.join(CACHE, x["file"]), "rb").read()
        if hashlib.sha256(raw).hexdigest() != x["sha256"]:
            report.append((x["series"], x["id"], "", False, ["해시가 다르다"]))
            continue
        art = parse_article(raw)
        ok, why, author, died = judge(x["series"], art)
        report.append((x["series"], x["id"], art["title"], ok, why))
        if not ok:
            continue
        table = AS_WEEK if x["series"] == "AS" else NP_WEEK
        wk = place(table, art["title"])
        if x["series"] == "NP":
            # 같은 공원이 둘이면 앞 것 하나만 (Shenandoah 처럼 두 번 실린 글)
            if wk is not None and wk in seen_np and wk != 24:
                wk = None
            if wk is not None:
                seen_np.add(wk)
        slot = "달력" if wk is not None else "열림"
        if wk is None:
            # 달력에 없는 통과분. AS 는 Q2 부터 들을 수 있다 (문법서가 아니다). NP 는 Q2 다
            wk = 13
        lines = [{"sp": None, "text": p, "bot": False, "grade": "C-real"} for p in art["paras"]]
        items.append({
            "id": "%s-%s" % (x["series"].lower(), x["id"]),
            "series": SERIES[x["series"]]["name"], "code": x["series"],
            "title": art["title"], "week": wk, "slot": slot, "quarter": C.quarter(wk),
            "url": x["url"], "audio": art["audio"] or None,
            "audioNote": "주소만 적는다. 음성 파일은 저장소에 없다" if art["audio"] else "VOA 쪽에 음성이 없다. 글만",
            "author": author, "authorDied": died, "published": art["pub"],
            "sha256": x["sha256"], "fetched": x["fetched"],
            "license": "VOA-PD", "credit": CREDIT, "grade": "C-real",
            "dropped": art["dropped"], "wordCount": len(C.tokens(" ".join(art["paras"]))),
            "lines": lines,
        })
    # 같은 글이 여러 번 다시 실렸다 (Short Story:, Children's Story: 같은 머리를 달고). 하나만 둔다.
    # 음성이 있는 것, 낱말이 많은 것, 늦게 실린 것 순서로 고른다. 고르지 않은 것은 dupOf 를 거름 보고에 남긴다
    best = {}
    for r in items:
        k = (r["code"], norm_title(r["title"]))
        cur = best.get(k)
        if cur is None or (bool(r["audio"]), r["wordCount"], r["published"] or "") > \
                (bool(cur["audio"]), cur["wordCount"], cur["published"] or ""):
            best[k] = r
    for r in items:
        b = best[(r["code"], norm_title(r["title"]))]
        if b is not r:
            report.append((r["code"], r["id"], r["title"], False, ["겹침: " + b["id"]]))
    items = list(best.values())
    # 여러 편짜리 글은 첫 편이 없으면 다 뺀다 (Part Two 만 남는 일)
    PARTS = r",?\s*part (one|two|three|four|five)\b.*$"
    heads = {norm_title(re.sub(PARTS, "", r["title"], flags=re.I)) for r in items
             if re.search(r"part one", r["title"], re.I)}
    keep = []
    for r in items:
        if re.search(r"part (two|three|four|five)", r["title"], re.I) and \
                norm_title(re.sub(PARTS, "", r["title"], flags=re.I)) not in heads:
            report.append((r["code"], r["id"], r["title"], False, ["첫 편 없음"]))
            continue
        keep.append(r)
    items = keep
    # 달력 자리가 같은 것 (NP 의 두 Shenandoah 처럼) 은 이미 위에서 걸렀다
    items.sort(key=lambda r: (r["week"], r["slot"] != "달력", r["code"], r["title"]))
    return items, report


def norm_title(t):
    t = t.lower().replace("\u2019", "'").replace("\u2018", "'")
    t = re.sub(r"^(short story|children's story|a special christmas story|a special story for christmas|"
               r"american stories)\s*:\s*", "", t)
    t = re.sub(r"\bby [a-z. ]+?(?=,|$| part)", "", t)
    t = re.sub(r",?\s*an american folk tale", "", t)
    t = re.sub(r"[^a-z ]", " ", t)
    t = re.sub(r"\b(the|a)\b", " ", t)
    return " ".join(t.split())


# ---------------------------------------------------------------- LLE2

BOT_NAMES = {"professor bot", "prof bot", "prof. bot", "professor. bot", "pofessor bot", "prof. bot vo"}
# 해설 문장이 화자 칸에 잘못 들어간 것 (계획 1.1)
BOT_MISLABEL = {"kaveh uses this when he says", "reflexive pronouns are easy to find",
                "we can ask a question directly", "anna tells penelope",
                "anna uses examples of both in one sentence", "i heard"}
CAST = ["Anna", "Jonathan", "Amelia", "Kaveh", "Penelope", "Ms. Weaver", "Professor Bot", "Prof. Bot",
        "Prof Bot", "Pete", "Evilana", "Mimi", "Sue", "Kelly", "Ashley", "Bruna", "Peter", "Dan", "Trudy",
        "ANNA", "KELLY", "PENELOPE", "ANNOUNCER", "Chef 1", "Chef 2", "Person 1", "Person 2", "Person 3",
        "Person 4", "Person 5"]
SPLIT = re.compile(r"(?:(?<=^)|(?<=\s))(%s):\s" % "|".join(re.escape(n) for n in sorted(CAST, key=len, reverse=True)))
INLINE_SP = re.compile(r"^((?:Chef|Person) \d|[A-Z][a-z]+(?: [A-Z][a-z]+)?):\s+(.*)$")


def norm_speaker(sp):
    s = sp.strip()
    if s.lower() in BOT_NAMES:
        return "Professor Bot"
    if s.isupper():
        s = s.title()
    return {"Ff H": "Firefighter Hatcher", "Ff J": "Firefighter Jones", "Prof. Bot Vo": "Professor Bot",
            "Peter": "Pete"}.get(s, s)


def wordlist_like(text):
    """과 끝의 낱말 목록 (Words in This Story 꼴). 문장 부호가 없고 낱말이 여럿."""
    return not re.search(r"[.!?]", text) and len(text.split()) >= 6


def lle2_items():
    data = json.load(open(ARCHIVE, encoding="utf-8"))
    out = []
    for it in data["items"]:
        n = it["lesson"]
        segs = []
        for s in it["transcript"]:
            sp, text = s["speaker"], (s["text"] or "").strip()
            # 한 덩어리에 화자 이름이 박혀 있는 과 (01, 02, 04, 26). 이름 앞에서 다시 자른다
            pieces = SPLIT.split(text)
            if len(pieces) > 1:
                if pieces[0].strip():
                    segs.append((sp, pieces[0].strip()))
                for k in range(1, len(pieces), 2):
                    segs.append((pieces[k], pieces[k + 1].strip()))
            else:
                segs.append((sp, text))
        lines, dropped = [], {"stage": 0, "wordListDropped": 0, "footnote": 0}
        role = None
        for sp, text in segs:
            if not text:
                continue
            if sp is None:
                m = INLINE_SP.match(text)
                if m and m.group(1) not in ("Here", "Now", "Note"):
                    sp, text = m.group(1), m.group(2)
            if text.startswith("*"):
                dropped["footnote"] += 1
                continue
            if CHROME.search(text):
                dropped["site"] = dropped.get("site", 0) + 1
                continue
            if re.fullmatch(r"\([^)]*\)\.?", text):
                dropped["stage"] += 1
                continue
            if sp is None and wordlist_like(text):
                dropped["wordListDropped"] += 1
                continue
            # 무대 지시는 줄에서 뺀다
            # 괄호 안은 말한 것이 아니다 (무대 지시, 숫자 풀이). 다 뺀다
            text2 = re.sub(r"\s*\([^)]*\)", "", text).strip()
            if text2 != text:
                dropped["stage"] += 1
                text = text2
            if not text:
                continue
            if sp is not None and sp.strip().upper() == "MUSIC":
                dropped["stage"] += 1
                continue
            if sp is not None:
                if sp.strip().lower() in BOT_MISLABEL:
                    text = sp.strip() + ": " + text
                    sp = "Professor Bot"
                sp = norm_speaker(sp)
                role = "bot" if sp == "Professor Bot" else "cast"
            else:
                sp = "Professor Bot" if role == "bot" else None
            lines.append({"sp": sp, "text": text, "bot": sp == "Professor Bot", "grade": "C-real"})
        audio = (it.get("conversationAudio") or {}).get("url")
        anote = "대화 MP3 주소만 적는다"
        if not audio:
            v = (it.get("mainVideo") or {}).get("variants") or []
            audio = v[0]["url"] if v else None
            anote = "대화 MP3 가 없다. 영상 음성으로 대신한다 (주소만)"
        wk = LLE2_WEEK[n]
        out.append({
            "id": it["id"], "series": "Let's Learn English Level 2", "code": "LLE2",
            "title": it["title"], "week": wk, "slot": "달력", "quarter": C.quarter(wk),
            "url": it["page"], "audio": audio, "audioNote": anote,
            "author": None, "authorDied": None, "published": None,
            "sha256": None, "fetched": None,
            "license": "VOA-PD", "credit": CREDIT, "grade": "C-real",
            "dropped": dropped, "wordCount": len(C.tokens(" ".join(l["text"] for l in lines))),
            "botLines": sum(1 for l in lines if l["bot"]),
            "lines": lines,
        })
    return out


def main():
    if "--fetch" in sys.argv:
        fetch()
        return 0
    lle2 = lle2_items()
    if len(lle2) != 30 or sorted(LLE2_WEEK) != list(range(1, 31)):
        print("[실패] LLE2 가 30과가 아니다 (%d)" % len(lle2))
        return 1
    ext, report = ext_items()
    carried = False
    if ext is None:
        old = C.read_ext("ext_radio")
        ext = [x for x in (old or {}).get("items", []) if x["code"] in ("AS", "NP")]
        carried = True
        print("[건너뜀] %s 가 없다. AS NP %d편은 지금 JSON 의 것을 그대로 잇는다" % (CACHE, len(ext)))
    items = sorted(lle2 + ext, key=lambda r: (r["week"], r["slot"] != "달력", r["code"], r["id"]))
    # 문법 해설은 Q3 부터 (spec 13.1). 25주 앞에 bot 줄이 있으면 안 낸다
    early = [r["id"] for r in items if r["week"] < 25 and any(l["bot"] for l in r["lines"])]
    if early:
        print("[실패] 25주 앞에 Professor Bot 해설: %s" % " ".join(early))
        return 1
    head = {
        "note": "확장 라디오. docs/expansion.md 3장. 손으로 안 고친다. scripts/derive_ext_radio.py 를 다시 돌린다.",
        "grade": "C-real",
        "gradeWhy": "VOA 가 실제로 녹음한 것의 대본이다. 글은 원문 그대로. 음성 파일은 없고 주소만 있다.",
        "generator": "scripts/derive_ext_radio.py",
        "source": "media/english/archive/voa-lle2-full.json, game_store/voa_ext (VOA American Stories z/1581, America's National Parks p/5849)",
        "license": "VOA-PD",
        "rights": RIGHTS,
        "credit": CREDIT,
        "audioInRepo": False,
        "carried": carried,
        "lines": sum(len(r["lines"]) for r in items),
        "wordCount": sum(r["wordCount"] for r in items),
        "byCode": {k: sum(1 for r in items if r["code"] == k) for k in ("LLE2", "AS", "NP")},
    }
    C.write_ext("ext_radio", head, items)
    if report is not None:
        rej = [r for r in report if not r[3]]
        rp = os.path.join(CACHE, "judge_report.tsv")
        with open(rp, "w", encoding="utf-8") as f:
            for s, i, t, ok, why in report:
                f.write("%s\t%s\t%s\t%s\t%s\n" % (s, i, "통과" if ok else "뺌", t, "; ".join(why)))
        print("거름: %d편 중 %d편 통과, %d편 뺌 (까닭 %s)" % (len(report), len(report) - len(rej), len(rej), rp))
    print("ext_radio: %d편 (LLE2 %d, AS %d, NP %d) / 줄 %d / 낱말 %d" % (
        len(items), head["byCode"]["LLE2"], head["byCode"]["AS"], head["byCode"]["NP"], head["lines"], head["wordCount"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
