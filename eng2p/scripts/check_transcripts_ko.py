#!/usr/bin/env python3
"""대본 한국어 풀이 검사 (`docs/game_data.md` 12장). `out/game/transcripts_ko.json`.

게임은 `<과 번호>#<줄 번호>` 로 한국어 글을 찾는다. 열쇠가 대본에 없는 줄이면 그 번역은 영영 안 보이고,
한국어 줄이 비면 게임이 줄을 안 그린다. 둘 다 말없이 일어난다. 그래서 **파생기와 다른 코드로** 다시 센다.

    1 shape     맨 위가 글자 값의 지도이고 열쇠가 `<과>#<정수>` 꼴이다 (note 같은 칸이 없다. 있으면 한국어 줄로 읽힌다)
    2 keys      모든 열쇠가 transcripts.json 의 실제 줄(1~줄 수)을 가리킨다
    3 empty     한국어 줄이 비거나 공백뿐이거나 앞뒤 공백이 있는 것이 없다
    4 hangul    한국어 줄에 한글이 있다. 영어 낱말 둘 이하의 짧은 조각 줄만 예외 (이름만 부르는 줄)
    5 cover     세션 1~N(acts.json)이 쓰는 과의 모든 줄에 한국어가 있고 다른 과의 줄은 없다
    6 acts      acts.json 의 koreanTranslationThroughSession 이 11.3 표와 같다
    7 chars     금지 문자(em-dash, U+FFFD, 제어문자)가 없고 줄바꿈이 LF 뿐이고 끝에 줄바꿈이 하나다
    8 manifest  manifest.json 이 이 파일을 적고 크기와 해시가 지금 파일과 같다
    + fresh     파생기를 다시 돌린 것과 같은 바이트다

`--break` 를 주면 규칙마다 실패를 하나 이상 심어 그 규칙이 잡는지 본다. 안 잡는 규칙이 있으면 실패다.

**기계가 안 보는 것: 번역이 정확하고 자연스러운가.** 대본의 영어와 한국어가 같은 뜻인지는 사람이 본다 (B등급, 4주 리허설).

사용법:
    python3 scripts/check_transcripts_ko.py
    python3 scripts/check_transcripts_ko.py --break
"""
import copy
import hashlib
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import derive_transcripts_ko as DTK  # noqa: E402  fresh 에서 다시 뽑을 때만 쓴다
import derive_game_manifest as DGM   # noqa: E402  dataHash 기준 구현

ROOT = DTK.ROOT
GAME = os.path.join(ROOT, "out", "game")
KO = os.path.join(GAME, "transcripts_ko.json")
MANIFEST = os.path.join(GAME, "manifest.json")
DOC = os.path.join(ROOT, "docs", "game_data.md")
KEY = re.compile(r"^([A-Za-z0-9._-]+)#([1-9][0-9]*)$")
HANGUL = re.compile("[가-힣]")


def jload(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def doc_through():
    """11.3 표의 koreanTranslationThroughSession (파생기의 읽는 함수를 쓰지 않고 따로 읽는다)."""
    with open(DOC, encoding="utf-8") as f:
        m = re.search(r"^\|\s*koreanTranslationThroughSession\s*\|\s*(\d+)\s*\|", f.read(), re.M)
    return int(m.group(1)) if m else None


def load():
    with open(KO, "rb") as f:
        raw = f.read()
    sess = jload(os.path.join(GAME, "sessions.json"))["sessions"]
    return {
        "ko": json.loads(raw.decode("utf-8")),
        "raw": raw,
        "eng": jload(os.path.join(GAME, "transcripts.json")),
        "acts": jload(os.path.join(GAME, "acts.json")),
        "media": [x["media"] for x in sess],  # 세션 번호 s 의 과는 media[s-1]
        "docThrough": doc_through(),
        "manifest": jload(MANIFEST),
        "dataHash": DGM.data_hash(DGM.collect()[0]),
    }


def eng_lines(d, media):
    v = d["eng"].get(media)
    return v if isinstance(v, list) else None


# 규칙 ---------------------------------------------------------------------------

def rule_shape(d):
    ko, out = d["ko"], []
    if not isinstance(ko, dict) or not ko:
        return ["맨 위가 빈 지도가 아니어야 한다"]
    for k, v in ko.items():
        if not isinstance(v, str):
            out.append("%s 의 값이 글자가 아니다: %r" % (k, v))
        if not KEY.match(k):
            out.append("열쇠 %r 가 <과>#<정수> 꼴이 아니다 (note 나 generator 같은 칸은 한국어 줄로 읽힌다)" % k)
    return out


def rule_keys(d):
    out = []
    for k in d["ko"]:
        m = KEY.match(k)
        if not m:
            continue
        lines = eng_lines(d, m.group(1))
        if lines is None:
            out.append("%s: transcripts.json 에 %s 과가 없다" % (k, m.group(1)))
        elif not 1 <= int(m.group(2)) <= len(lines):
            out.append("%s: 줄 번호가 1~%d 밖이다" % (k, len(lines)))
    return out


def rule_empty(d):
    out = []
    for k, v in d["ko"].items():
        if isinstance(v, str) and (not v.strip() or v != v.strip()):
            out.append("%s: 한국어 줄이 비었거나 앞뒤에 공백이 있다: %r" % (k, v))
    return out


def rule_hangul(d):
    out = []
    for k, v in d["ko"].items():
        m = KEY.match(k)
        if not m or not isinstance(v, str) or HANGUL.search(v):
            continue
        lines = eng_lines(d, m.group(1))
        en = lines[int(m.group(2)) - 1] if lines and 1 <= int(m.group(2)) <= len(lines) else ""
        words = re.findall(r"[A-Za-z]+", re.sub(r"^[A-Z][A-Za-z]*:", "", en.strip()))
        if len(words) > 2:
            out.append("%s: 한국어 줄에 한글이 없다: %r (영어 %r)" % (k, v, en))
    return out


def rule_acts(d):
    a = d["acts"].get("captions", {}).get("koreanTranslationThroughSession")
    if not isinstance(a, int) or isinstance(a, bool):
        return ["acts.json 에 koreanTranslationThroughSession 이 없다"]
    if a != d["docThrough"]:
        return ["acts.json 의 한계 %r 가 11.3 표 %r 와 다르다" % (a, d["docThrough"])]
    return []


def rule_cover(d):
    n = d["acts"].get("captions", {}).get("koreanTranslationThroughSession")
    if not isinstance(n, int):
        return ["한계를 모르면 범위를 못 센다"]
    need = set()
    for media in d["media"][:n]:
        lines = eng_lines(d, media)
        if lines is None:
            return ["transcripts.json 에 %s 과가 없다" % media]
        need |= {"%s#%d" % (media, i) for i in range(1, len(lines) + 1)}
    have = set(d["ko"])
    out = []
    if need - have:
        miss = sorted(need - have)
        out.append("세션 1~%d 의 대본 줄 %d개에 한국어가 없다: %s" % (n, len(miss), miss[:5]))
    if have - need:
        extra = sorted(have - need)
        out.append("세션 1~%d 이 안 쓰는 과의 한국어 %d개가 있다: %s (한계를 넓히지 않았다면 뺀다)" % (n, len(extra), extra[:5]))
    return out


def rule_chars(d):
    text = d["raw"].decode("utf-8")
    out = []
    if chr(0x2014) in text:
        out.append("em-dash 가 있다")
    if chr(0xFFFD) in text:
        out.append("U+FFFD 가 있다")
    if "\r" in text:
        out.append("CR 이 있다 (두 노트북이 바이트가 같아야 한다)")
    if not text.endswith("\n") or text.endswith("\n\n"):
        out.append("끝 줄바꿈이 하나가 아니다")
    for k, v in d["ko"].items():
        if isinstance(v, str) and re.search(r"[\x00-\x1f\x7f]", v):
            out.append("%s: 제어문자가 있다" % k)
    return out


def rule_manifest(d):
    m, out = d["manifest"], []
    row = next((r for r in m.get("files", []) if r.get("file") == "transcripts_ko.json"), None)
    if row is None:
        return ["manifest.json 이 transcripts_ko.json 을 안 적었다. python3 scripts/derive_game_manifest.py 를 돌린다"]
    raw = d["raw"]
    if row.get("bytes") != len(raw):
        out.append("manifest 의 transcripts_ko.json 크기 %r 가 지금 %d 와 다르다" % (row.get("bytes"), len(raw)))
    if row.get("sha256") != hashlib.sha256(raw).hexdigest():
        out.append("manifest 의 transcripts_ko.json 해시가 지금 파일과 다르다 (해시 어긋남)")
    if m.get("dataHash") != d["dataHash"]:
        out.append("manifest 의 dataHash 가 지금 파일들로 센 값과 다르다")
    return out


def rule_fresh(d):
    errs = []
    body = DTK.build(errs)
    if errs or body is None:
        return ["파생기가 지금 못 돈다: %s" % "; ".join(errs[:2])]
    want = (json.dumps(body, ensure_ascii=False, indent=1) + "\n").encode("utf-8")
    return [] if want == d["raw"] else ["파생기를 다시 돌린 것과 바이트가 다르다. 손으로 고친 것이 있다 (원본은 docs/transcripts_ko.md)"]


RULES = [("shape", rule_shape), ("keys", rule_keys), ("empty", rule_empty), ("hangul", rule_hangul),
         ("cover", rule_cover), ("acts", rule_acts), ("chars", rule_chars), ("manifest", rule_manifest)]


# 깸 시험 ------------------------------------------------------------------------

def breaks():
    B = []

    def add(name, rule):
        def deco(fn):
            B.append((name, rule, fn))
            return fn
        return deco

    def reraw(d):
        d["raw"] = (json.dumps(d["ko"], ensure_ascii=False, indent=1) + "\n").encode("utf-8")

    @add("note 칸을 더한다", "shape")
    def _(d):
        d["ko"]["note"] = "손으로 안 고친다"

    @add("값을 글자가 아닌 수로 바꾼다", "shape")
    def _(d):
        d["ko"]["lle1-01#1"] = 3

    @add("열쇠를 줄 번호 0 으로 적는다", "shape")
    def _(d):
        d["ko"]["lle1-01#0"] = "영"

    @add("없는 과의 열쇠를 더한다", "keys")
    def _(d):
        d["ko"]["lle9-99#1"] = "없는 과"

    @add("줄 수를 넘는 줄 번호를 더한다", "keys")
    def _(d):
        d["ko"]["lle1-01#10"] = "열 번째 줄은 없다"

    @add("한국어 줄을 빈 글자로 둔다", "empty")
    def _(d):
        d["ko"]["lle1-01#2"] = ""

    @add("한국어 줄을 공백으로 둔다", "empty")
    def _(d):
        d["ko"]["lle1-01#2"] = "   "

    @add("앞에 공백을 붙인다", "empty")
    def _(d):
        d["ko"]["lle1-01#4"] = " " + d["ko"]["lle1-01#4"]

    @add("긴 줄을 영어 그대로 둔다", "hangul")
    def _(d):
        d["ko"]["lle1-01#5"] = d["eng"]["lle1-01"][4]

    @add("한 줄을 뺀다", "cover")
    def _(d):
        del d["ko"]["lle1-06#10"]

    @add("한계 밖 세션의 과를 더한다", "cover")
    def _(d):
        n = d["acts"]["captions"]["koreanTranslationThroughSession"]
        later = next(m for m in d["media"][n:] if m not in set(d["media"][:n]))
        d["ko"]["%s#1" % later] = "한계 밖이다"

    @add("한계를 표와 다른 값으로 적는다", "acts")
    def _(d):
        d["acts"]["captions"]["koreanTranslationThroughSession"] = 49

    @add("한계를 지운다", "acts")
    def _(d):
        del d["acts"]["captions"]["koreanTranslationThroughSession"]

    @add("em-dash 를 넣는다", "chars")
    def _(d):
        d["ko"]["lle1-01#1"] += chr(0x2014)
        reraw(d)

    @add("끝 줄바꿈을 둘로 한다", "chars")
    def _(d):
        d["raw"] = d["raw"] + b"\n"

    @add("제어문자(탭)를 넣는다", "chars")
    def _(d):
        d["ko"]["lle1-01#1"] += "\t"
        reraw(d)

    @add("매니페스트의 해시를 바꾼다 (해시 어긋남)", "manifest")
    def _(d):
        for r in d["manifest"]["files"]:
            if r["file"] == "transcripts_ko.json":
                r["sha256"] = "0" * 64

    @add("매니페스트에서 파일을 뺀다", "manifest")
    def _(d):
        d["manifest"]["files"] = [r for r in d["manifest"]["files"] if r["file"] != "transcripts_ko.json"]

    @add("매니페스트의 dataHash 를 바꾼다", "manifest")
    def _(d):
        d["manifest"]["dataHash"] = "f" * 64

    @add("파생물을 손으로 고친다 (한 글자)", "fresh")
    def _(d):
        d["raw"] = d["raw"].replace("만나서 반가워요.".encode("utf-8"), "만나서 반갑습니다.".encode("utf-8"), 1)

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
    if not fails:
        n = d["acts"]["captions"]["koreanTranslationThroughSession"]
        media = sorted({k.split("#")[0] for k in d["ko"]})
        print("한국어 풀이 %d줄 / 과 %d개 / 세션 1~%d / 열쇠가 다 대본의 실제 줄이고 빈 줄이 없다" % (len(d["ko"]), len(media), n))
    bad = 0
    if "--break" in sys.argv:
        proofs = breaks()
        caught = 0
        rules = dict(RULES)
        rules["fresh"] = rule_fresh
        for name, rule, fn in proofs:
            e = copy.deepcopy(d)
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
