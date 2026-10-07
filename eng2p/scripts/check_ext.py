#!/usr/bin/env python3
"""확장층 검사 (`docs/expansion.md` 10장). out/data/ext_*.json 다섯을 본다.

판 열일곱. **판마다 깸 시험이 있다.** `--break` 를 주면 판마다 실패를 하나 심어 그 판이 잡는지 본다.
안 잡는 판이 하나라도 있으면 실패다. 안 잡히는 검사기는 통과한 것처럼 보인다 (CLAUDE.md 병렬 개발).

    1 license     줄마다 권리 칸이 다섯 중 하나
    2 grade       파일 머리, 편, 줄마다 등급
    3 audio       저장소에 새 음성 파일이 없다. 라디오의 audio 칸은 주소뿐
    4 transcript  라디오 편마다 글 줄이 하나 이상 (대본 없는 음성 금지)
    5 korean      영어 칸에 한글 없음. 번역 짝 칸 (ko, translation ...) 없음
    6 wordlist    words, vocab, wordlist, glossary 칸 없음 (단어장 암기 금지)
    7 grammar     24주까지 Professor Bot 줄 없음 (문법서 Q1~Q2 금지)
    8 tatoeba     잡담 줄마다 id, owner, src, license 가 맞음
    9 gate        잡담은 들은 낱말만. 안내문과 책은 들은 낱말 + wordlist + expansion.md 9장. 책은 비율 상한
   10 author      잡담 한 주에 저자 하나 40% 이하
   11 agency      라디오 글에 AP, Reuters, AFP 없음
   12 brand       derive_town.py BRANDS 가 잡담, 안내문, 책에 없음
   13 slang       슬랭 목록이 잡담, 안내문, 책에 없음
   14 sacred      신성한 것 목록이 안내문과 책에 없음
   15 verify      B 파일 머리와 B 편마다 검증로그 꼴
   16 calendar    48주 다섯 칸이 차거나 이유가 있음. 달력이 다른 넷과 맞음
   17 sources     안내문 사실 줄마다 근거 주소와 인용, 책과 라디오 편마다 원본 주소

사용법:
    python3 scripts/check_ext.py           # 검사
    python3 scripts/check_ext.py --break   # 검사 + 깸 시험 열일곱
"""
import copy
import os
import re
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import derive_ext_common as C  # noqa: E402
from derive_ext_readers import LIMITS  # noqa: E402

FILES = {"radio": "ext_radio", "smalltalk": "ext_smalltalk", "notices": "ext_notices",
         "readers": "ext_readers", "calendar": "ext_calendar"}
AUDIO_EXT = re.compile(r"\.(mp3|mp4|wav|m4a|ogg|oga|flac|aac|webm|opus|aiff?|wma)$", re.I)
# 저장소에 이미 있는 LLE1 녹음 52개 (확장층 앞의 것). 이 밖의 음성 파일이 생기면 실패다
AUDIO_BASELINE = re.compile(r"^media/english/audio/lle1-\d{2}\.mp3$")
BAD_KEYS = {"words", "vocab", "vocabulary", "wordlist", "word_list", "glossary", "ko", "kor", "korean",
            "translation", "translations", "ko_text", "meaning", "meanings", "gloss"}
HANGUL = re.compile(r"[가-힣ㄱ-ㆎ]")
VLOG = re.compile(r"^검증로그: \d{4}-\d{2}-\d{2} / .+ / (통과|보류|기각) / .+")
TATOEBA_LIC = {"CC-BY-2.0-FR", "CC0-1.0"}
COLS = [("radio", "라디오"), ("npc", "NPC"), ("smalltalk", "잡담"), ("notices", "안내문"), ("readers", "책")]


def load():
    d = {}
    for k, f in FILES.items():
        d[k] = C.read_ext(f)
    return d


# ---------------------------------------------------------------- 판

def english_texts(d):
    """(어디, 영어 글) 을 다 낸다. 라디오, 잡담, 안내문, 책."""
    for r in d["radio"]["items"]:
        yield "radio " + r["id"], r["title"]
        for l in r["lines"]:
            yield "radio " + r["id"], l["text"]
    for x in d["smalltalk"]["items"]:
        yield "smalltalk %s" % x["id"], x["text"]
    for k in ("notices", "readers"):
        for r in d[k]["items"]:
            yield "%s %s" % (k, r["id"]), r.get("title") or ""
            for l in r["lines"]:
                yield "%s %s" % (k, r["id"]), l["text"]


def new_texts(d, kinds=("smalltalk", "notices", "readers")):
    """확장층이 고르거나 새로 쓴 영어 (라디오 원문은 뺀다)."""
    for loc, t in english_texts(d):
        if loc.split()[0] in kinds:
            yield loc, t


def c_license(d, ctx):
    f = []
    for k in ("radio", "smalltalk", "notices", "readers"):
        for x in d[k]["items"]:
            if x.get("license") not in C.LICENSES:
                f.append("%s %s: 권리 칸이 %r" % (k, x.get("id"), x.get("license")))
    for x in d["smalltalk"]["items"]:
        if x.get("license") not in TATOEBA_LIC:
            f.append("smalltalk %s: Tatoeba 권리가 아니다 (%r)" % (x.get("id"), x.get("license")))
    return f


def c_grade(d, ctx):
    f = []
    want = {"radio": "C-real", "smalltalk": "B", "notices": "B", "readers": "B", "calendar": "B"}
    for k, g in want.items():
        if d[k].get("grade") != g:
            f.append("%s: 파일 등급이 %r (%s 이어야 한다)" % (k, d[k].get("grade"), g))
    for k in ("radio", "smalltalk", "notices", "readers"):
        for x in d[k]["items"]:
            if x.get("grade") not in C.GRADES:
                f.append("%s %s: 편 등급이 없다" % (k, x.get("id")))
            for l in x.get("lines", []):
                if l.get("grade") not in C.GRADES:
                    f.append("%s %s: 등급 없는 줄: %s" % (k, x.get("id"), l.get("text", "")[:40]))
                    break
    return f


def c_audio(d, ctx):
    f = []
    for p in ctx["repo_files"]():
        if AUDIO_EXT.search(p) and not AUDIO_BASELINE.match(p):
            f.append("음성 파일이 저장소에 있다: " + p)
    for r in d["radio"]["items"]:
        a = r.get("audio")
        if a is not None and not re.match(r"^https://", a):
            f.append("radio %s: audio 칸이 주소가 아니다 (%s)" % (r["id"], a))
    if d["radio"].get("audioInRepo") is not False:
        f.append("radio: audioInRepo 가 false 가 아니다")
    return f


def c_transcript(d, ctx):
    return ["radio %s: 글 줄이 없다 (대본 없는 음성)" % r["id"]
            for r in d["radio"]["items"] if not [l for l in r.get("lines", []) if l.get("text", "").strip()]]


def c_korean(d, ctx):
    f = ["%s: 영어 칸에 한글: %s" % (loc, t[:40]) for loc, t in english_texts(d) if HANGUL.search(t)]
    f += ["%s: 번역 짝 칸 %r" % (where, k) for where, k in ctx["keys"](d)
          if k.lower() in {"ko", "kor", "korean", "translation", "translations", "ko_text", "meaning", "meanings", "gloss"}]
    return f


def c_wordlist(d, ctx):
    return ["%s: 단어장 칸 %r" % (where, k) for where, k in ctx["keys"](d)
            if k.lower() in {"words", "vocab", "vocabulary", "wordlist", "word_list", "glossary"}]


def c_grammar(d, ctx):
    return ["radio %s: %d주에 Professor Bot 해설 줄" % (r["id"], r["week"])
            for r in d["radio"]["items"] if r["week"] < 25 and any(l.get("bot") for l in r["lines"])]


def c_tatoeba(d, ctx):
    f = []
    for x in d["smalltalk"]["items"]:
        sid = x.get("id")
        if not isinstance(sid, int) or not x.get("owner") or \
                x.get("src") != "https://tatoeba.org/en/sentences/show/%s" % sid:
            f.append("smalltalk %r: id, owner, src 가 안 맞는다" % sid)
    h = d["smalltalk"]
    if "tatoeba.org" not in h.get("credit", "") or "CC BY 2.0 FR" not in h.get("credit", ""):
        f.append("smalltalk: 크레딧 줄이 없다")
    owners = {x.get("owner") for x in h["items"]}
    if not owners <= set(h.get("owners", [])):
        f.append("smalltalk: 저자 목록(owners)에 빠진 저자가 있다")
    return f


def c_gate(d, ctx):
    f = []
    heard = C.heard_by_week()
    for x in d["smalltalk"]["items"]:
        miss = [t for t in C.tokens(x["text"]) if t not in heard[x["week"]]]
        if miss:
            f.append("smalltalk %s (%d주): 안 들은 낱말 %s" % (x["id"], x["week"], " ".join(miss)))
    lists = ctx["lists"]
    for k in ("notices", "readers"):
        for r in d[k]["items"]:
            base, ext, nm = C.gate_words(r["week"], lists)
            toks = [t for l in r["lines"] for t in C.tokens(l["text"])]
            miss = sorted({t for t in toks if t not in base and t not in ext and t not in nm})
            if miss:
                f.append("%s %s (%d주): 문 밖 낱말 %s" % (k, r["id"], r["week"], " ".join(miss)))
            if k == "readers":
                n_ext = sum(1 for t in toks if t not in base and t not in nm and t in ext)
                n_nm = sum(1 for t in toks if t not in base and t in nm)
                ratio = 100.0 * n_ext / max(1, len(toks) - n_nm)
                cap = LIMITS[C.quarter(r["week"])][3]
                if ratio > cap:
                    f.append("readers %s: 확장 낱말 %.1f%% > 상한 %.1f%%" % (r["id"], ratio, cap))
    return f


def c_author(d, ctx):
    f = []
    by = {}
    for x in d["smalltalk"]["items"]:
        by.setdefault(x["week"], []).append(x["owner"])
    for w, owners in sorted(by.items()):
        cap = max(1, int(len(owners) * 0.40))
        top = max(set(owners), key=owners.count)
        if owners.count(top) > cap:
            f.append("smalltalk %d주: 저자 %s 가 %d/%d (상한 %d)" % (w, top, owners.count(top), len(owners), cap))
    return f


def c_agency(d, ctx):
    f = []
    for r in d["radio"]["items"]:
        for l in r["lines"]:
            if C.AGENCY.search(l["text"]) or C.AGENCY_CREDIT.search(l["text"]):
                f.append("radio %s: 통신사 글: %s" % (r["id"], l["text"][:60]))
                break
    return f


def c_brand(d, ctx):
    f = []
    pats = [(b, re.compile(r"(?<![A-Za-z])%s(?![a-z])" % re.escape(b))) for b in C.BRANDS]
    for loc, t in new_texts(d):
        for b, p in pats:
            if p.search(t):
                f.append("%s: 상표 %s" % (loc, b))
    for loc, t in new_texts(d):
        for p in C.PEOPLE:
            if re.search(r"(?<![A-Za-z])%s(?![a-z])" % re.escape(p), t):
                f.append("%s: 실존 인물 %s" % (loc, p))
    return f


def c_slang(d, ctx):
    s = set(C.SLANG)
    return ["%s: 슬랭 %s" % (loc, " ".join(sorted(set(C.tokens(t)) & s)))
            for loc, t in new_texts(d) if set(C.tokens(t)) & s]


def c_sacred(d, ctx):
    f = []
    for loc, t in new_texts(d, ("notices", "readers")):
        for w in C.SACRED:
            if re.search(r"(?<![A-Za-z])%s(?![A-Za-z])" % re.escape(w), t, re.I):
                f.append("%s: 신성한 것 / 금지 낱말 %s" % (loc, w))
    return f


def c_verify(d, ctx):
    f = []
    for k in ("smalltalk", "notices", "readers"):
        if not VLOG.match(d[k].get("verifyLog", "")):
            f.append("%s: 파일 머리 검증로그 꼴이 아니다" % k)
    for k in ("notices", "readers"):
        for r in d[k]["items"]:
            if not VLOG.match(r.get("verifyLog", "")):
                f.append("%s %s: 검증로그 꼴이 아니다 (%s)" % (k, r["id"], r.get("verifyLog", "")[:40]))
    return f


def c_calendar(d, ctx):
    f = []
    cal = d["calendar"]["items"]
    if [r.get("week") for r in cal] != list(range(1, 49)):
        f.append("calendar: 주가 1~48 이 아니다")
    for r in cal:
        for key, label in COLS:
            cell = r.get(key) or {}
            n = cell.get("count", len(cell.get("items", [])))
            if n == 0 and not cell.get("empty"):
                f.append("calendar %s주 %s: 비었는데 이유가 없다" % (r.get("week"), label))
    # 달력이 다른 넷과 맞나 (낡은 달력)
    for key in ("radio", "notices", "readers"):
        src = sorted((x["week"], x["id"]) for x in d[key]["items"])
        got = sorted((r["week"], i["id"]) for r in cal for i in (r.get(key) or {}).get("items", []))
        if src != got:
            f.append("calendar %s: 원본 파일과 다르다 (다시 뽑는다)" % key)
    src = {}
    for x in d["smalltalk"]["items"]:
        src[x["week"]] = src.get(x["week"], 0) + 1
    got = {r["week"]: (r.get("smalltalk") or {}).get("count", 0) for r in cal if (r.get("smalltalk") or {}).get("count")}
    if src != got:
        f.append("calendar smalltalk: 원본 파일과 수가 다르다")
    return f


def c_sources(d, ctx):
    f = []
    for r in d["notices"]["items"]:
        if not r.get("facts"):
            f.append("notices %s: 근거 칸이 없다" % r["id"])
        for l in r["lines"]:
            if l.get("fact") and not (str(l.get("src") or "").startswith("https://") and l.get("quote")):
                f.append("notices %s: 사실 줄에 근거 주소나 인용이 없다: %s" % (r["id"], l["text"][:40]))
    for r in d["readers"]["items"]:
        if not str(r.get("src") or "").startswith("https://www.gutenberg.org/ebooks/") or not r.get("frame"):
            f.append("readers %s: 원본 주소나 틀이 없다" % r["id"])
    for r in d["radio"]["items"]:
        if not str(r.get("url") or "").startswith("https://learningenglish.voanews.com/"):
            f.append("radio %s: VOA 원 주소가 없다" % r["id"])
    return f


CHECKS = [("license", c_license), ("grade", c_grade), ("audio", c_audio), ("transcript", c_transcript),
          ("korean", c_korean), ("wordlist", c_wordlist), ("grammar", c_grammar), ("tatoeba", c_tatoeba),
          ("gate", c_gate), ("author", c_author), ("agency", c_agency), ("brand", c_brand),
          ("slang", c_slang), ("sacred", c_sacred), ("verify", c_verify), ("calendar", c_calendar),
          ("sources", c_sources)]


# ---------------------------------------------------------------- 둘레

def repo_files():
    top = os.path.dirname(C.ROOT)
    out = set()
    try:
        r = subprocess.run(["git", "-C", top, "ls-files", "-co", "--exclude-standard"],
                           capture_output=True, text=True, check=True)
        out.update(x for x in r.stdout.splitlines() if x)
    except Exception:
        for dp, dn, fn in os.walk(top):
            dn[:] = [x for x in dn if x not in (".git", "node_modules")]
            for n in fn:
                out.add(os.path.relpath(os.path.join(dp, n), top).replace(os.sep, "/"))
    return sorted(out)


def all_keys(d):
    def walk(o, where):
        if isinstance(o, dict):
            for k, v in o.items():
                yield where, k
                yield from walk(v, where)
        elif isinstance(o, list):
            for v in o:
                yield from walk(v, where)
    for k, v in d.items():
        yield from walk(v, k)


def ctx_for(d):
    return {"repo_files": repo_files, "keys": all_keys, "lists": C.ext_lists()}


def run(d, ctx, only=None):
    out = {}
    for name, fn in CHECKS:
        if only and name != only:
            continue
        out[name] = fn(d, ctx)
    return out


# ---------------------------------------------------------------- 깸 시험

def first(items, pred):
    return next(x for x in items if pred(x))


def plant(name, d, ctx):
    """판 이름마다 실패 하나를 심는다. 돌려준 정리 함수를 꼭 부른다."""
    nothing = (lambda: None)
    if name == "license":
        d["smalltalk"]["items"][0]["license"] = "CC-BY-SA-3.0"
    elif name == "grade":
        d["notices"]["items"][0]["lines"][0].pop("grade")
    elif name == "audio":
        p = os.path.join(C.OUT, "_check_ext_break.mp3")
        open(p, "wb").close()
        return lambda: os.remove(p)
    elif name == "transcript":
        first(d["radio"]["items"], lambda r: r["code"] == "AS")["lines"] = []
    elif name == "korean":
        d["smalltalk"]["items"][0]["ko"] = "안녕하세요"
    elif name == "wordlist":
        d["radio"]["items"][0]["vocab"] = ["budget", "gossip", "rumor"]
    elif name == "grammar":
        first(d["radio"]["items"], lambda r: r["code"] == "LLE2" and r["botLines"])["week"] = 20
    elif name == "tatoeba":
        d["smalltalk"]["items"][5].pop("owner")
    elif name == "gate":
        x = first(d["smalltalk"]["items"], lambda r: r["week"] == 3)
        x["text"] = "The hurricane is coming."
    elif name == "author":
        for x in d["smalltalk"]["items"]:
            if x["week"] == 13:
                x["owner"] = "CK"
    elif name == "agency":
        first(d["radio"]["items"], lambda r: r["code"] == "AS")["lines"].append(
            {"sp": None, "text": "Jane Doe reported on this story for the Associated Press.", "bot": False, "grade": "C-real"})
    elif name == "brand":
        d["smalltalk"]["items"][0]["text"] = "I like Starbucks coffee."
    elif name == "slang":
        d["readers"]["items"][0]["lines"][0]["text"] = "That is awesome."
    elif name == "sacred":
        d["readers"]["items"][0]["lines"][0]["text"] = "They walked up to the heiau."
    elif name == "verify":
        d["notices"]["items"][0]["verifyLog"] = "나중에 확인한다"
    elif name == "calendar":
        cell = d["calendar"]["items"][29]["radio"]
        cell["items"] = []
        cell.pop("empty", None)
    elif name == "sources":
        first(d["notices"]["items"][0]["lines"], lambda l: l.get("fact"))["src"] = None
    return nothing


def breaks(base):
    bad = []
    before = {k: len(v) for k, v in run(copy.deepcopy(base), ctx_for(base)).items()}
    for name, _ in CHECKS:
        d = copy.deepcopy(base)
        ctx = ctx_for(d)
        clean = plant(name, d, ctx)
        try:
            got = run(d, ctx, only=name)[name]
        finally:
            clean()
        caught = len(got) > before[name]
        mark = "잡았다" if caught else "못 잡았다"
        print("  깸 %-10s %s%s" % (name, mark, (": " + got[0][:90]) if got else ""))
        if not caught:
            bad.append(name)
    return bad


def main():
    d = load()
    missing = [k for k, v in d.items() if v is None]
    if missing:
        print("[실패] ext 파일이 없다: " + " ".join(FILES[k] for k in missing))
        return 1
    res = run(d, ctx_for(d))
    n_fail = 0
    for name, fails in res.items():
        for x in fails[:20]:
            print("[실패] %s: %s" % (name, x))
        if len(fails) > 20:
            print("[실패] %s: ... %d개 더" % (name, len(fails) - 20))
        n_fail += len(fails)
    print("판 %d / 실패 %d / 편 radio %d, smalltalk %d, notices %d, readers %d, calendar %d" % (
        len(CHECKS), n_fail, *(len(d[k]["items"]) for k in ("radio", "smalltalk", "notices", "readers", "calendar"))))
    if "--break" in sys.argv:
        print("깸 시험:")
        bad = breaks(d)
        print("깸 시험 %d판 중 %d판이 잡았다" % (len(CHECKS), len(CHECKS) - len(bad)))
        if bad:
            print("[실패] 깸을 못 잡은 판: " + " ".join(bad))
            n_fail += len(bad)
    return 1 if n_fail else 0


if __name__ == "__main__":
    sys.exit(main())
