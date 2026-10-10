#!/usr/bin/env python3
"""지은 영어(authored)의 읽기와 관문. derive_authored.py, check_authored.py, derive_scenes.py 가 같이 쓴다.

정책은 docs/authored.md 다. 원본 줄은 docs/authored_lines.md, 낱말 등급은 docs/authored_words.md.
**말뭉치(corpus) 줄은 여기서 안 다룬다.** 말뭉치 줄은 scenes.md 의 lle1-NN 근거 그대로고 그 관문(grounded)은 안 바뀐다.

관문 (이름 = check_authored.py 의 판 이름)
    schema     필수 칸, 값 범위 (점검 A/B, 등급 A1~B2, 종류 npc/wait/option, 인물), 줄 id 유일
    vocab      낱말 등급. 이미 들은 낱말이거나 docs/authored_words.md 에 올라 있어야 한다.
               줄 등급보다 두 단계 높은 낱말은 실패, 한 단계 높은 낱말은 줄마다 하나까지, 올라 있지 않은 낱말은 실패
    length     길이와 복잡도. 낱말 수, 문장 수, 쉼표 수, 이음말(because 등) 수가 등급 상한 안
    load       새 낱말(아직 안 들은 낱말)이 줄마다 상한 안
    culture    슬랭, 지어낸 철자, 실제 상표(허용 이름 밖), 연속성(world.md 6.2), check_culture.py
    dup        같은 인물이 같은 말을 되풀이하지 않는다. 말뭉치 줄과 같은 줄은 알림
    copy       말뭉치 대본과 낱말 8개 이어서 같으면 실패 (긴 구절 베끼기 금지). 6개 이상은 알림
    gloss      한국어 풀이는 세션이 koreanTranslationThroughSession 이하일 때만
    blist      점검 B 인 줄이 state/authored_b.md 에 다 올라 있고 이유가 있다
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
REPO = os.path.dirname(ROOT)
DOCS = os.path.join(ROOT, "docs")
sys.path.insert(0, HERE)
import derive_scenes as DS  # noqa: E402  읽기만 한다 (대본 읽기, 막는 말, 연속성)
from derive_town import BRANDS  # noqa: E402

LINES_MD = os.path.join(DOCS, "authored_lines.md")
WORDS_MD = os.path.join(DOCS, "authored_words.md")
SESS = os.path.join(ROOT, "out", "game", "sessions.json")
ACTS = os.path.join(ROOT, "out", "game", "acts.json")
BLIST = os.path.join(ROOT, "state", "authored_b.md")

LEVELS = ["A1", "A2", "B1", "B2"]
LV = {n: i for i, n in enumerate(LEVELS)}
KINDS = ("npc", "wait", "option")
WHO = ("Host", "Server", "Cashier", "Clerk", "Guide", "Driver", "Doctor", "Nurse", "Neighbor", "두 사람", "A자리", "B자리")
CHECKS = ("A", "B")

# 길이와 복잡도 상한 (등급별). 낱말 수, 문장 수, 쉼표 수, 이음말 수
CAP = {"A1": dict(words=8, sents=2, commas=1, conj=0),
       "A2": dict(words=12, sents=3, commas=2, conj=1),
       "B1": dict(words=18, sents=3, commas=3, conj=2),
       "B2": dict(words=26, sents=4, commas=4, conj=3)}
# "that" 과 "so" 는 지시어와 부사로도 쓰여 세지 않는다 (한계: docs/authored.md 4장)
CONJ = {"because", "although", "though", "which", "if", "when", "while", "unless", "whether", "since"}
# 새 낱말(아직 안 들은 낱말) 줄당 상한
NEW_PER_LINE = {"A1": 4, "A2": 4, "B1": 5, "B2": 6}
# 한 장면에서 세션 등급을 넘는 줄의 비율 상한 (percent)
STRETCH_LINES_PCT = 40
# 말뭉치 베끼기. 이어서 같은 낱말 수
COPY_FAIL, COPY_NOTE = 8, 6
# 지어낸 철자 (docs/wordlist.md 1장이 걷어낸 여섯)와 구어 축약
INVENTED = {"hafta", "hasta", "oughta", "dunno", "gimme", "lemme", "kinda", "sorta", "ain't", "y'all", "gonna", "wanna", "gotta"}

FAIL_PREFIX = "[실패] "


# ------------------------------------------------------------------ 낱말

def tokens(text):
    """영어 낱말만. 이름 자리 {A} {B} 는 뺀다."""
    t = re.sub(r"\{[^}]*\}", " ", text.replace("’", "'"))
    return [w.lower() for w in re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)*", t)]


def base(w):
    """축약과 소유격을 뗀다. don't -> do, can't -> can, it's -> it."""
    if w in ("can't", "cannot"):
        return "can"
    if w == "won't":
        return "will"
    w = re.sub(r"n't$", "", w)
    w = re.sub(r"'(s|d|ll|re|ve|m)$", "", w)
    return w


def stem(w):
    """거친 어간. 같은 함수를 말뭉치 낱말과 등급표 낱말 양쪽에 건다. 한계는 docs/authored.md 4장."""
    w = base(w)
    for suf, rep in (("ies", "y"), ("sses", "ss"), ("ches", "ch"), ("shes", "sh"), ("xes", "x")):
        if w.endswith(suf) and len(w) > len(suf) + 1:
            return w[:-len(suf)] + rep
    if w.endswith("ing") and len(w) > 5:
        w = w[:-3]
        if len(w) > 2 and w[-1] == w[-2] and w[-1] not in "ls":
            w = w[:-1]
        return w
    if w.endswith("ed") and len(w) > 4:
        w = w[:-2]
        if len(w) > 2 and w[-1] == w[-2] and w[-1] not in "ls":
            w = w[:-1]
        return w
    if w.endswith("s") and not w.endswith("ss") and len(w) > 3:
        return w[:-1]
    return w


def load_words():
    """docs/authored_words.md 의 ```A1 ... ``` 블록 -> {어간: 등급}. 같은 어간이 두 등급이면 실패 목록에 둔다."""
    src = open(WORDS_MD, encoding="utf-8").read()
    table, dup = {}, []
    for m in re.finditer(r"```(A1|A2|B1|B2)\n(.*?)```", src, re.S):
        lv = m.group(1)
        for w in re.findall(r"[A-Za-z']+", m.group(2)):
            k = stem(w.lower())
            if k in table and table[k] != lv:
                dup.append("%s: %s 와 %s" % (w, table[k], lv))
            table.setdefault(k, lv)
    return table, dup


_VOCAB = {}


def heard_vocab(s):
    """세션 s 까지 블록 1 에서 이미 들은 과의 어간 집합. 과는 sessions.json 의 media 가 처음 나온 세션으로 센다."""
    if not _VOCAB:
        S = json.load(open(SESS, encoding="utf-8"))["sessions"]
        first = {}
        for x in S:
            first.setdefault(x["media"], x["s"])
        per = {}
        for m, at in first.items():
            b = DS.body(m)
            if b:
                per[m] = (at, {stem(w) for w in tokens(b)})
        _VOCAB["per"] = per
    out = set()
    for m, (at, st) in _VOCAB["per"].items():
        if at <= s:
            out |= st
    return out


_CORPUS = {}


def corpus_ngrams(n):
    """VOA 대본(과 Tatoeba 잡담 파일이 있으면 그것도)의 n-낱말 이어진 조각 집합."""
    if n not in _CORPUS:
        grams = set()
        texts = []
        for m in sorted(os.listdir(DS.TRANS)):
            if m.endswith(".md"):
                b = DS.body(m[:-3])
                if b:
                    texts.append(b)
        p = os.path.join(ROOT, "out", "data", "ext_smalltalk.json")
        if os.path.exists(p):
            texts.append(json.dumps(json.load(open(p, encoding="utf-8")), ensure_ascii=False))
        for t in texts:
            # 대본은 줄(문단)마다 끊어 이어붙임을 막는다
            for para in re.split(r"\n\s*\n|\\n|\"", t):
                w = tokens(para)
                for i in range(len(w) - n + 1):
                    grams.add(tuple(w[i:i + n]))
        _CORPUS[n] = grams
    return _CORPUS[n]


def longest_shared(text, floor=3):
    """줄이 말뭉치와 이어서 같은 가장 긴 낱말 수 (floor 보다 짧으면 floor-1)."""
    w = tokens(text)
    best = floor - 1
    for n in range(floor, len(w) + 1):
        g = corpus_ngrams(n)
        if any(tuple(w[i:i + n]) in g for i in range(len(w) - n + 1)):
            best = n
        else:
            break
    return best


# ------------------------------------------------------------------ 원본 읽기

def session_info(s, S=None):
    S = S or json.load(open(SESS, encoding="utf-8"))["sessions"]
    return S[s - 1]


def session_level(s):
    A = json.load(open(ACTS, encoding="utf-8"))
    for lv in A["levels"]:
        if lv["fromSession"] <= s <= lv["toSession"]:
            return lv["cefr"]
    return LEVELS[-1]


def gloss_limit():
    return json.load(open(ACTS, encoding="utf-8"))["captions"]["koreanTranslationThroughSession"]


def parse_lines():
    """docs/authored_lines.md -> (outings, fail). outings = [{id, meta, lines, practice}]"""
    fail = []
    src = open(LINES_MD, encoding="utf-8").read()
    outs = []
    for part in re.split(r"^(?=## 나들이: )", src, flags=re.M):
        m = re.match(r"## 나들이: (\S+)\n", part)
        if not m:
            continue
        o = {"id": m.group(1), "meta": {}, "lines": [], "practice": []}
        head = part.split("\n|", 1)[0]
        for k, v in re.findall(r"^(작성자|장소|세션|목표 등급|할 일|허용 이름|갈래): (.*)$", head, re.M):
            o["meta"][k] = v.strip()
        for k in ("작성자", "장소", "세션", "목표 등급", "할 일", "허용 이름"):
            if k not in o["meta"]:
                fail.append("%s: 메타 '%s' 가 없다" % (o["id"], k))
        sec_lines, sec_prac = part, ""
        if "### 연습할 말" in part:
            sec_lines, sec_prac = part.split("### 연습할 말", 1)
        for c in DS.rows(sec_lines, 10):
            o["lines"].append(dict(zip(("id", "scene", "kind", "who", "say", "cefr", "fn", "check", "why", "ko"), c)))
        sec_turns = ""
        if "### 미니게임 차례" in sec_prac:
            sec_prac, sec_turns = sec_prac.split("### 미니게임 차례", 1)
        o["turns"] = [dict(zip(("id", "scene", "npc", "pick", "seat"), c)) for c in DS.rows(sec_turns, 5)]
        for c in DS.rows(sec_prac, 5):
            o["practice"].append(dict(zip(("id", "say", "fn", "line", "ko"), c)))
        outs.append(o)
    if not outs:
        fail.append("authored_lines.md 에 '## 나들이:' 장이 없다")
    return outs, fail


def outing_session(o):
    try:
        return int(o["meta"].get("세션", ""))
    except ValueError:
        return None


def slang_rows():
    return [(c[0], c[1]) for c in DS.rows(DS.sub(DS.doc("scenes.md"), "### 2.4 막는 말"), 3)]


def continuity_rules():
    world = DS.doc("world.md")
    out = []
    for c in DS.rows(DS.sub(world, "### 6.2 연속성"), 4):
        if c[1].isdigit():
            for p in c[2].split(" / "):
                out.append((c[0], int(c[1]), re.compile(p.strip().strip("`"), re.I)))
    return out


# ------------------------------------------------------------------ 관문

def line_problems(o, table, S):
    """나들이 하나의 관문 실패와 알림. (fail, note, derived) derived = 줄마다 계산 값."""
    fail, note, derived = [], [], {}
    oid = o["id"]
    s = outing_session(o)
    if s is None or not 1 <= s <= len(S):
        return ["%s: 세션이 1~%d 수가 아니다: %s" % (oid, len(S), o["meta"].get("세션")),], note, derived
    for k in ("작성자", "장소", "세션", "목표 등급", "할 일", "허용 이름"):
        if not o["meta"].get(k, "").strip():
            fail.append("%s: 메타 '%s' 가 없다" % (oid, k))
    cd = [x.strip() for x in o["meta"].get("할 일", "").split("/")]
    if len(cd) != 3 or not all(cd) or not cd[0].startswith("cd-"):
        fail.append("%s: 할 일은 'cd-id / 영어 / 한국어' 세 칸이다" % oid)
    tgt = o["meta"].get("목표 등급", "")
    if tgt not in LV:
        fail.append("%s: 목표 등급이 A1~B2 가 아니다: %s" % (oid, tgt))
        return fail, note, derived
    heard = heard_vocab(s)
    allowed = {w.lower() for n in re.split(r"[,;]", o["meta"].get("허용 이름", "-")) for w in re.findall(r"[A-Za-z']+", n)}
    slang = slang_rows()
    cont = continuity_rules()
    week = S[s - 1]["week"]
    seen_ids, seen_say = set(), {}
    over = 0
    for ln in o["lines"]:
        i = ln["id"]
        # schema
        if i in seen_ids or not re.fullmatch(r"[a-z0-9-]+", i):
            fail.append("%s: 줄 id 가 겹치거나 꼴이 아니다: %s" % (oid, i))
        seen_ids.add(i)
        if ln["cefr"] not in LV:
            fail.append("%s: 등급이 A1~B2 가 아니다: %s" % (i, ln["cefr"]))
            continue
        if ln["kind"] not in KINDS:
            fail.append("%s: 종류가 npc/wait/option 이 아니다: %s" % (i, ln["kind"]))
        if ln["who"] not in WHO:
            fail.append("%s: 인물이 목록 밖이다: %s" % (i, ln["who"]))
        if (ln["kind"] == "npc") != (ln["who"] not in ("두 사람", "A자리", "B자리")):
            fail.append("%s: 종류 %s 와 인물 %s 가 안 맞는다 (npc 만 NPC 인물)" % (i, ln["kind"], ln["who"]))
        if ln["check"] not in CHECKS:
            fail.append("%s: 점검이 A 나 B 가 아니다: %s" % (i, ln["check"]))
        if not ln["fn"].strip() or not ln["scene"].strip() or not ln["say"].strip():
            fail.append("%s: 기능, 장면, 영어 칸이 비었다" % i)
        if ln["check"] == "B" and (ln["why"].strip() in ("", "-") or len(ln["why"]) < 8):
            fail.append("%s: 점검 B 인데 이유가 없다" % i)
        if ln["check"] == "A" and ln["why"].strip() != "-":
            fail.append("%s: 점검 A 인데 이유 칸이 '-' 가 아니다" % i)
        text, L = ln["say"], LV[ln["cefr"]]
        tl = LV[tgt]
        if L > tl + 1:
            fail.append("%s: 줄 등급 %s 가 장면 목표 %s 보다 두 단계 이상 높다" % (i, ln["cefr"], tgt))
        if L > tl:
            over += 1
        # vocab + load
        toks = tokens(text)
        stretch, new, bad = [], [], []
        for w in toks:
            k = stem(w)
            if w in allowed:
                continue
            lvl = table.get(k)
            if k not in heard:
                new.append(w)
            if k in heard:
                continue
            if lvl is None:
                bad.append(w)
            elif LV[lvl] > L + 1:
                fail.append("%s: 낱말 '%s' (%s) 가 줄 등급 %s 보다 두 단계 이상 높다" % (i, w, lvl, ln["cefr"]))
            elif LV[lvl] == L + 1:
                stretch.append(w)
        if bad:
            fail.append("%s: 등급표에 없는 낱말 (docs/authored_words.md 에 올린다): %s" % (i, " ".join(sorted(set(bad)))))
        if len(stretch) > 1:
            fail.append("%s: 한 단계 높은 낱말이 둘 이상이다: %s" % (i, " ".join(stretch)))
        newu = list(dict.fromkeys(new))
        if len(newu) > NEW_PER_LINE[ln["cefr"]]:
            fail.append("%s: 새 낱말이 %d개다 (%s 상한 %d): %s" % (i, len(newu), ln["cefr"], NEW_PER_LINE[ln["cefr"]], " ".join(newu)))
        # length
        cap = CAP[ln["cefr"]]
        nsent = len([x for x in re.split(r"(?<=[.!?])\s+", text.strip()) if x])
        if len(toks) > cap["words"]:
            fail.append("%s: 낱말 %d개 (%s 상한 %d)" % (i, len(toks), ln["cefr"], cap["words"]))
        if nsent > cap["sents"]:
            fail.append("%s: 문장 %d개 (%s 상한 %d)" % (i, nsent, ln["cefr"], cap["sents"]))
        if text.count(",") > cap["commas"]:
            fail.append("%s: 쉼표 %d개 (%s 상한 %d)" % (i, text.count(","), ln["cefr"], cap["commas"]))
        nconj = sum(1 for w in toks if w in CONJ)
        if nconj > cap["conj"]:
            fail.append("%s: 이음말 %d개 (%s 상한 %d)" % (i, nconj, ln["cefr"], cap["conj"]))
        # culture
        sens = [DS.norm(t) for t in DS.sentences(text)]
        for word, kind in slang:
            if kind != "슬랭":
                continue
            hit = DS.norm(word) in sens if word[-1] in ".!?" else re.search(
                r"(?<![A-Za-z])" + re.escape(word) + r"(?![A-Za-z])", text, re.I)
            if hit:
                fail.append("%s: 막는 말(슬랭) '%s': %s" % (i, word, text))
        for w in toks:
            if w in INVENTED:
                fail.append("%s: 지어낸 철자나 구어 축약 '%s'" % (i, w))
        for brand in BRANDS:
            if re.search(r"\b" + re.escape(brand) + r"\b", text) and brand.lower() not in allowed:
                fail.append("%s: 허용 이름 밖의 실제 상표 %s" % (i, brand))
        for what, since, rx in cont:
            if week < since and rx.search(text):
                fail.append("%s: %d주 줄이 %s (%d주부터) 보다 앞선다" % (i, week, what, since))
        if "—" in text or "�" in text:
            fail.append("%s: 금지 문자(em-dash 등)" % i)
        # dup
        key = (ln["who"], DS.norm(text))
        if key in seen_say:
            fail.append("%s: %s 와 같은 인물의 같은 말이다" % (i, seen_say[key]))
        seen_say[key] = i
        # copy
        n = longest_shared(text)
        if n >= COPY_FAIL:
            fail.append("%s: 말뭉치와 %d낱말 이어서 같다 (상한 %d 미만): %s" % (i, n, COPY_FAIL, text))
        elif n >= COPY_NOTE:
            note.append("%s: 말뭉치와 %d낱말 이어서 같다" % (i, n))
        if n == len(toks) and len(toks) >= 3:
            note.append("%s: 줄 전체가 말뭉치에 있다. 말뭉치 근거로 쓰면 corpus 다" % i)
        # gloss
        ko = ln["ko"].strip()
        if ko not in ("", "-") and s > gloss_limit():
            fail.append("%s: 한국어 풀이는 세션 %d 이하에서만 (이 장면은 세션 %d)" % (i, gloss_limit(), s))
        if s <= gloss_limit() and ko in ("", "-"):
            note.append("%s: 풀이를 쓸 수 있는 세션인데 한국어 풀이가 없다" % i)
        derived[i] = {"introduces": sorted(set(newu)), "stretch": stretch, "words": len(toks)}
    if o["lines"] and over * 100 > STRETCH_LINES_PCT * len(o["lines"]):
        fail.append("%s: 목표 등급보다 높은 줄이 %d/%d (상한 %d%%)" % (oid, over, len(o["lines"]), STRETCH_LINES_PCT))
    # 선택 묶음이 두 줄 이상이어야 선택이다
    by_scene = {}
    for ln in o["lines"]:
        if ln["kind"] == "option":
            by_scene.setdefault(ln["scene"], []).append(ln)
    for sc, ls in by_scene.items():
        if len(ls) < 2:
            fail.append("%s: 장면 %s 의 option 이 한 줄뿐이다" % (oid, sc))
    # 연습 말은 본문 줄을 가리키고 영어가 같아야 한다
    ids = {ln["id"]: ln for ln in o["lines"]}
    for p in o["practice"]:
        t = ids.get(p["line"])
        if not t:
            fail.append("%s: 연습 말이 없는 줄을 가리킨다: %s" % (p["id"], p["line"]))
        elif DS.norm(t["say"]) != DS.norm(p["say"]):
            fail.append("%s: 연습 말과 줄 %s 의 영어가 다르다" % (p["id"], p["line"]))
    return fail, note, derived


def build_b_list(outs):
    """state/authored_b.md 의 본문. 점검 B 줄 전부."""
    rows = []
    for o in outs:
        for ln in o["lines"]:
            if ln["check"] == "B":
                rows.append((ln["id"], o["id"], ln["say"], ln["why"]))
    head = ("# 지은 영어 B 등급 목록 (자동)\n\n신뢰도: B 생성 (자동 집계. 손으로 안 고친다)\n"
            "검증로그: 2026-10-10 / 점검 B 줄을 자동으로 모았다. 사용자가 대화에서 본다 / 보류 / 사용자 검증 전이다\n"
            "원본: docs/authored_lines.md 의 점검 B 줄. `scripts/derive_authored.py` 가 쓴다. 사용자가 대화에서 본다 (CLAUDE.md 1순위 규칙).\n\n"
            "검증대상: 아래 줄이 자연스러운 미국 영어인지 (%d줄)\n\n" % len(rows))
    if not rows:
        return head + "B 줄이 없다.\n"
    t = "| 줄 | 나들이 | 영어 | 확신이 없는 이유 |\n|---|---|---|---|\n"
    return head + t + "".join("| %s | %s | %s | %s |\n" % r for r in rows)


# ------------------------------------------------------------------ 장면과 역할 줄에서 쓰는 길

_AUTH = {}


def authored_index():
    """{줄 id: (줄, 나들이)}. 장면 파생기와 역할 줄이 쓴다."""
    if not _AUTH:
        outs, _ = parse_lines()
        for o in outs:
            for ln in o["lines"]:
                _AUTH[ln["id"]] = (ln, o)
    return _AUTH


def scene_line_ok(text, who, ref, session):
    """scenes.md 3장 표의 근거 칸이 `authored:<줄 id>` 일 때. (ok, 사유).

    장면 줄은 지은 줄과 이름 자리 말고는 글자 그대로여야 하고, 인물이 같고, NPC 줄이고 (두 사람 줄은 wait 나 option),
    그 줄의 나들이 세션 이후여야 한다. 말뭉치 줄의 'grounded' 와 같은 엄격함이다 (바꿔 쓰지 않는다)."""
    ln_o = authored_index().get(ref.split(":", 1)[-1])
    if not ln_o:
        return False, "지은 줄 %s 가 없다" % ref
    ln, o = ln_o
    if DS.norm(ln["say"]) != DS.norm(text):
        return False, "장면 줄이 지은 줄 %s 와 글자가 다르다" % ln["id"]
    if (who in ("A자리", "B자리", "두 사람")) != (ln["kind"] != "npc"):
        return False, "장면 줄의 인물이 지은 줄 %s 의 종류와 안 맞는다" % ln["id"]
    at = outing_session(o)
    if at is None or session < at:
        return False, "지은 줄 %s 는 세션 %s 부터다 (장면은 세션 %d)" % (ln["id"], at, session)
    return True, ""


def role_candidates(function_words=()):
    """역할 카드의 NPC 대답 후보로 쓸 수 있는 지은 줄: 종류 npc 이고 점검 A 인 줄. derive_replies 의 grounded 는 이 줄을 아직 안 부른다 (docs/authored.md 6장)."""
    return [ln for ln, _ in authored_index().values() if ln["kind"] == "npc" and ln["check"] == "A"]


if __name__ == "__main__":
    t, d = load_words()
    print("낱말 등급표 %d어간, 겹침 %d" % (len(t), len(d)))
