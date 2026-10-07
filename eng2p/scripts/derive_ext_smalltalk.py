#!/usr/bin/env python3
"""NPC 잡담 (`docs/expansion.md` 4장). `out/data/ext_smalltalk.json` 을 낸다.

Tatoeba 영어 문장 (CC BY 2.0 FR, 일부 CC0). **영어 쪽만 받는다.** links 파일은 안 받는다.
한국어 짝을 만들 길을 처음부터 막는다 (spec 13.1 번역 경유).

거르는 순서 (계획 3.2)
    1 저자 없음          출처를 못 적는다
    2 영어 모어(5) 아님   user_languages
    3 꼬리표              @ 로 시작, Tanaka Corpus, 인용, 관용구, 구어, 슬랭, 영국식, 성, 약, 술, 폭력, 죽음 ...
    4 3~8 낱말 밖
    5 숫자, 따옴표, 괄호, 쌍점, 빗금, 쌍반점
    6 첫머리 밖 대문자 낱말 (I 빼고). 사람 이름과 지명과 상호가 여기서 빠진다
    7 주제 금지어, 슬랭 목록, 상표 (derive_town BRANDS), 실존 인물
    8 같은 문장 겹침
    9 **주마다 낱말 문**: 낱말이 다 그 주까지 들은 LLE1 대본 안에 (두 번 이상)

배치 (계획 3.3): 1~2주 0, 3~6주 30, 7~12주 50, 13~48주 60. 한 문장은 1년에 한 번만.
한 주 안에서 저자 하나가 40% 를 못 넘는다. CC0 문장을 먼저 고른다. 장소 갈래를 돌려 가며 고른다.
물음과 대답을 짝짓지 않는다 (Tatoeba 문장은 서로 대화가 아니다).

**등급 B.** 모어 화자가 쓴 문장이어도 그 장면에서 자연스러운지, 지금 쓰는 말인지는 모른다.

사용법:
    python3 scripts/derive_ext_smalltalk.py [Tatoeba 파일 폴더]
    폴더 기본값: $TATOEBA_DIR, 없으면 game_store/tatoeba. 원본이 없으면 지금 JSON 을 그대로 둔다
"""
import bz2
import hashlib
import io
import os
import re
import sys
import tarfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import derive_ext_common as C  # noqa: E402

PER_WEEK = {w: (0 if w <= 2 else 30 if w <= 6 else 50 if w <= 12 else 60) for w in range(1, 49)}
AUTHOR_CAP = 0.40

BAD_TAG = re.compile(r"(^@|tanaka|\bquote|\bidiom|colloquial|\bslang|informal|vulgar|offensive|insult|"
                     r"archaic|old-fashioned|proverb|translat|british|\bsex|drug|alcohol|violen|\bdeath|"
                     r"\bwar\b|crime|politic|relig|\bmeme|romance|^by |voanews|\bjoke|swear|profan|"
                     r"\bdate\b|dialect|regional|poetry|\bpoem|lyric)", re.I)
TOPIC = ["kill", "killed", "gun", "guns", "drunk", "drink", "beer", "wine", "god", "police", "drug", "drugs",
         "money", "married", "marry", "girlfriend", "boyfriend", "wife", "husband", "die", "died", "dead",
         "death", "war", "fight", "hate", "hit", "sex", "kiss", "love", "steal", "stole", "prison", "jail",
         "blood", "hurt", "sick", "cancer", "church", "pray", "bomb", "army", "enemy", "smoke", "cigarette",
         "fat", "ugly", "rich", "poor", "gamble", "bet", "naked", "body", "lie", "lied", "liar", "cheat",
         "divorce", "pregnant", "baby", "afraid", "scared", "cry", "cried", "angry", "mad", "shoot",
         "knife", "dangerous", "suicide", "crazy", "stupid", "hell", "damn"]
# 관용구와 구어 꼴. 꼬리표가 안 붙은 것이 많다
IDIOM = re.compile(r"(\ba thing\b|talk shop|\bway too\b|\b(how|what|where|who|why)'d\b|'em\b|\by'|"
                   r"\bget it\b|\bget lost\b|\bhang out\b|\bpiece of cake\b|\bno way\b|\bwhat's up\b|"
                   r"\bmy bad\b|\bkind of\b|\bsort of\b|\bstuff\b|\bgoing on\b)", re.I)
PUNCT = re.compile(r"[0-9\"“”‘’()\[\]:;/\\&%$#@*_=+<>|~{}]")
# 장소 갈래. 낱말로 단다 (계획 3.3). 하나도 안 걸리면 거리
PLACES = [
    ("카페", ["coffee", "tea", "eat", "order", "food", "lunch", "breakfast", "dinner", "hungry", "cup",
             "milk", "cake", "sandwich", "menu", "cook", "delicious"]),
    ("버스", ["bus", "ride", "train", "car", "drive", "station", "ticket", "late", "taxi", "walk"]),
    ("날씨", ["rain", "raining", "hot", "cold", "wind", "windy", "sun", "sunny", "weather", "warm", "snow",
             "cloudy", "beach", "sky"]),
    ("일터", ["work", "job", "office", "meeting", "boss", "busy", "computer", "email", "paper", "desk", "class",
             "teacher", "school", "study", "homework"]),
    ("집", ["home", "room", "kitchen", "house", "apartment", "bed", "door", "window", "family", "sleep",
           "tired", "garden", "dog", "cat"]),
    ("가게", ["buy", "store", "shop", "price", "market", "sell", "pay", "cheap", "shoes", "shirt", "bag"]),
]


def src_dir():
    if len(sys.argv) > 1 and not sys.argv[1].startswith("-"):
        return sys.argv[1]
    return os.environ.get("TATOEBA_DIR", os.path.join(C.STORE, "tatoeba"))


def read_bz2_tsv(p):
    with bz2.open(p, "rt", encoding="utf-8") as f:
        for line in f:
            yield line.rstrip("\n").split("\t")


def native_speakers(d):
    rows = None
    p_csv = os.path.join(d, "user_languages.csv")
    p_tar = os.path.join(d, "user_languages.tar.bz2")
    if os.path.exists(p_tar):
        with tarfile.open(p_tar, "r:bz2") as t:
            m = t.getmember("user_languages.csv")
            rows = io.TextIOWrapper(t.extractfile(m), encoding="utf-8").read().splitlines()
    elif os.path.exists(p_csv):
        rows = open(p_csv, encoding="utf-8").read().splitlines()
    if rows is None:
        return None
    out = set()
    for r in rows:
        c = r.split("\t")
        if len(c) >= 3 and c[0] == "eng" and c[1] == "5":
            out.add(c[2])
    return out


def place_of(toks):
    for name, keys in PLACES:
        if any(t in keys for t in toks):
            return name
    return "거리"


def main():
    d = src_dir()
    det = os.path.join(d, "eng_sentences_detailed.tsv.bz2")
    tags_p = os.path.join(d, "eng_tags.tsv.bz2")
    cc0_p = os.path.join(d, "eng_sentences_CC0.tsv.bz2")
    if not os.path.exists(det):
        old = C.read_ext("ext_smalltalk")
        print("[건너뜀] %s 가 없다. 지금 ext_smalltalk.json (%s줄) 을 그대로 둔다" % (det, old and old["count"]))
        return 0
    natives = native_speakers(d)
    if natives is None or not os.path.exists(tags_p):
        print("[실패] user_languages 나 eng_tags 가 없다 (%s). fetch_assets.py tatoeba 로 받는다" % d)
        return 1
    bad_ids = set()
    for c in read_bz2_tsv(tags_p):
        if len(c) >= 2 and BAD_TAG.search(c[1]):
            bad_ids.add(c[0])
    cc0 = set()
    if os.path.exists(cc0_p):
        for c in read_bz2_tsv(cc0_p):
            cc0.add(c[0])

    heard = C.heard_by_week()
    # 낱말이 처음 다 들린 주. 48주에도 안 들리면 못 쓴다
    first_ok = {}
    slang = set(C.SLANG)
    topic = set(TOPIC)
    brands = [b.lower() for b in C.BRANDS]
    stats = {k: 0 for k in ("all", "owner", "native", "tag", "length", "punct", "proper", "topic", "dup", "gate")}
    seen = set()
    cand = []
    for c in read_bz2_tsv(det):
        if len(c) < 4:
            continue
        sid, lang, text, owner = c[0], c[1], c[2].strip(), c[3]
        stats["all"] += 1
        if owner in ("\\N", ""):
            stats["owner"] += 1
            continue
        if owner not in natives:
            stats["native"] += 1
            continue
        if sid in bad_ids:
            stats["tag"] += 1
            continue
        words = text.split()
        if not 3 <= len(words) <= 8:
            stats["length"] += 1
            continue
        if PUNCT.search(text) or "--" in text or not re.fullmatch(r"[A-Za-z',.?! -]+", text):
            stats["punct"] += 1
            continue
        if not text[0].isupper() or text[-1] not in ".?!":
            stats["punct"] += 1
            continue
        if any(w[0].isupper() and not re.fullmatch(r"I('[a-z]+)?", w.strip(",.?!")) for w in words[1:]):
            stats["proper"] += 1
            continue
        toks = C.tokens(text)
        low = text.lower()
        if IDIOM.search(text) or (set(toks) & (topic | slang)) or any(b in low for b in brands) or \
                any(re.search(r"\b%s\b" % re.escape(p.lower()), low) for p in C.PEOPLE):
            stats["topic"] += 1
            continue
        key = low.rstrip(".?! ")
        if key in seen:
            stats["dup"] += 1
            continue
        seen.add(key)
        fw = next((w for w in range(1, 49) if set(toks) <= heard[w]), None)
        if fw is None:
            stats["gate"] += 1
            continue
        cand.append({"id": int(sid), "text": text, "owner": owner, "cc0": sid in cc0,
                     "fw": fw, "place": place_of(toks),
                     "h": hashlib.sha1(sid.encode()).hexdigest()})
        first_ok[sid] = fw
    stats["pass"] = len(cand)

    # 배치. 주마다 그 주까지 열린 것 중에서, 안 쓴 것만. 순서는 CC0 먼저, 그다음 해시 (무작위 없음)
    cand.sort(key=lambda r: (not r["cc0"], r["h"]))
    used = set()
    items = []
    short = []
    for w in range(1, 49):
        n = PER_WEEK[w]
        if not n:
            continue
        pool = [r for r in cand if r["fw"] <= w and r["id"] not in used]
        # 이번 주에 새로 열린 것을 앞에 둔다. 들은 것이 바로 나오게
        pool.sort(key=lambda r: (r["fw"] != w and r["fw"] != w - 1, not r["cc0"], r["h"]))
        cap = max(1, int(n * AUTHOR_CAP))
        by_owner, by_place, pick = {}, {}, []
        buckets = {}
        for r in pool:
            buckets.setdefault(r["place"], []).append(r)
        order = sorted(buckets, key=lambda k: (k == "거리", k))
        while len(pick) < n and any(buckets.values()):
            moved = False
            for pl in order:
                b = buckets[pl]
                while b:
                    r = b.pop(0)
                    if by_owner.get(r["owner"], 0) >= cap:
                        continue
                    pick.append(r)
                    by_owner[r["owner"]] = by_owner.get(r["owner"], 0) + 1
                    moved = True
                    break
                if len(pick) >= n:
                    break
            if not moved:
                break
        if len(pick) < n:
            short.append((w, len(pick), n))
        for r in pick:
            used.add(r["id"])
            items.append({
                "id": r["id"], "text": r["text"], "owner": r["owner"],
                "license": "CC0-1.0" if r["cc0"] else "CC-BY-2.0-FR",
                "src": "https://tatoeba.org/en/sentences/show/%d" % r["id"],
                "week": w, "quarter": C.quarter(w), "opens": r["fw"], "place": r["place"],
                "grade": "B", "layer": "1층 (학습용 인공물 표기. NPC 가 지나가며 한 줄)",
            })
    owners = sorted({x["owner"] for x in items})
    files = {}
    for p in (det, tags_p, cc0_p, os.path.join(d, "user_languages.tar.bz2")):
        if os.path.exists(p):
            files[os.path.basename(p)] = C.sha256_file(p)
    head = {
        "note": "NPC 잡담. docs/expansion.md 4장. 손으로 안 고친다. scripts/derive_ext_smalltalk.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "모어 화자가 쓴 Tatoeba 문장이다. 그 장면에서 자연스러운지, 지금 쓰는 말인지는 검증 전이다.",
        "generator": "scripts/derive_ext_smalltalk.py",
        "source": "Tatoeba 영어 내보내기 (eng_sentences_detailed, eng_tags, user_languages, eng_sentences_CC0). links 파일은 안 쓴다",
        "sourceSha256": files,
        "license": "CC-BY-2.0-FR",
        "licenseUrl": "https://creativecommons.org/licenses/by/2.0/fr/",
        "credit": "Sentences from Tatoeba (tatoeba.org), CC BY 2.0 FR. 문장마다 id 와 저자를 적는다",
        "verifyLog": "검증로그: 2026-10-07 / 거름 열 단계와 저자 표기와 낱말 문을 전수 검사 (check_ext.py) / 보류 / spec 5.2 대로 주마다 10줄 표본을 원어민이 본다. 기각이 30% 넘으면 그 주 묶음을 뺀다",
        "gate": "그 주까지 블록 1 에서 들은 LLE1 대본 낱말 (두 번 이상). scripts/derive_ext_common.py heard_by_week",
        "authorCap": AUTHOR_CAP,
        "filter": stats,
        "short": [{"week": w, "got": g, "want": n} for w, g, n in short],
        "owners": owners,
    }
    C.write_ext("ext_smalltalk", head, items)
    print("ext_smalltalk: %d줄 / 후보 %d / 저자 %d명 / 모자란 주 %d" % (len(items), len(cand), len(owners), len(short)))
    print("거름: " + " ".join("%s %d" % kv for kv in stats.items()))
    for w, g, n in short:
        print("  %d주: %d/%d" % (w, g, n))
    return 0


if __name__ == "__main__":
    sys.exit(main())
