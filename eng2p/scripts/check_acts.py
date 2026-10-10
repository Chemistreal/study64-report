#!/usr/bin/env python3
"""세션 단위 구간표 검사 (`docs/game_data.md` 11장). `out/game/acts.json`.

게임은 이 파일로 "이 세션은 어느 등급이고 열려 있는가" 를 안다. 구간에 틈이 있으면 어떤 세션은 등급이 없고,
공개 한계가 288 을 넘으면 잠글 세션이 없는데 잠갔다고 믿는다. 그래서 **파생기와 다른 코드로** 세션 288개를 하나씩 다시 센다.

    1 keys      맨 위 칸 열셋이 다 있고 형이 맞다 (자막 칸은 문자열 둘과 참거짓 하나)
    2 plan      세션 수가 sessions.json 과 같고 세션당 시간이 블록 분에서 나오고 총시간이 앱 PASS 의 마지막 통과선이다
    3 ranges    구간이 1 에서 288 까지 틈과 겹침 없이 이어지고 등급이 A1 A2 B1 B2 차례로 오르며 이웃이 같지 않고 시간이 맞다
    4 derive    세션 288개를 하나씩 세어 구간의 등급과 같다. 기준선이 11.1 표와 같다
    5 release   throughSession 이 0~288 정수다
    6 captions  한국어 번역이 거짓이다. 듣는 동안이 꺼져 있다. 기준서 13.1 의 한국어 자막 줄이 그대로 있다.
                한국어 풀이 한계(koreanTranslationThroughSession)가 0~288 정수이고 11.3 표와 기준서 13.1 예외 문단의 숫자와 같다
    7 extension 289 와 C1 과 later 다
    8 chars     금지 문자와 한국어 밖의 비 ASCII 가 없다
    9 manifest  manifest.json 이 acts.json 을 적고 크기와 해시가 지금 파일과 같고 dataHash 가 맞다
    + fresh     파생기를 다시 돌린 것과 같은 바이트다

`--break` 를 주면 규칙마다 실패를 하나 이상 심어 그 규칙이 잡는지 본다. 안 잡는 규칙이 있으면 실패다 (CLAUDE.md 병렬 개발).

**기계가 안 보는 것: 기준선이 이 두 사람에게 맞는가.** 근사 안내라서 4주 리허설과 분기 점검에서 사람이 본다.

사용법:
    python3 scripts/check_acts.py           # 검사
    python3 scripts/check_acts.py --break   # 검사 + 깸 시험
"""
import copy
import hashlib
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import derive_acts as DA            # noqa: E402  fresh 에서 다시 뽑을 때만 쓴다
import derive_game_manifest as DGM  # noqa: E402  dataHash 기준 구현

ROOT = DA.ROOT
GAME = os.path.join(ROOT, "out", "game")
ACTS = os.path.join(GAME, "acts.json")
MANIFEST = os.path.join(GAME, "manifest.json")
CONST = os.path.join(ROOT, "app", "js", "01_const.js")
DOC = DA.DOC
SPEC = DA.SPEC

KEYS = {"schemaVersion": int, "note": str, "grade": str, "gradeWhy": str, "generator": str, "source": str,
        "basis": str, "plan": dict, "thresholds": list, "levels": list, "release": dict, "captions": dict,
        "extension": dict}
SUB = {"plan": {"sessions": int, "hoursPerSession": int, "totalHours": int, "passHours": list},
       "release": {"throughSession": int, "rule": str},
       "captions": {"duringListening": str, "afterListening": str, "koreanTranslation": bool,
                    "koreanTranslationThroughSession": int, "why": str},
       "extension": {"fromSession": int, "target": str, "status": str, "why": str}}
LEVEL_KEYS = {"cefr": str, "fromSession": int, "toSession": int, "fromHours": int, "toHours": int}
ORDER = ["A1", "A2", "B1", "B2"]
HANGUL = re.compile("[가-힣]")


def is_int(v):
    return isinstance(v, int) and not isinstance(v, bool)


def typed(v, t):
    return is_int(v) if t is int else isinstance(v, t) and (t is bool or not isinstance(v, bool))


def jload(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


# 사실을 따로 읽는다 (파생기의 읽는 함수를 쓰지 않는다) -------------------------

def doc_thresholds():
    """11.1 절의 표에서 (등급, 한도) 줄을 읽는다."""
    with open(DOC, encoding="utf-8") as f:
        src = f.read()
    i = src.find("### 11.1 ")
    if i < 0:
        return None
    j = src.find("\n###", i + 5)
    sec = src[i:j if j > 0 else len(src)]
    return [(m.group(1), int(m.group(2))) for m in re.finditer(r"^\|\s*(A1|A2|B1|B2)\s*\|\s*(\d+)\s*\|", sec, re.M)]


def pass_last_hours():
    """앱 PASS 의 누적 시간 통과선들 (app/js/01_const.js)."""
    with open(CONST, encoding="utf-8") as f:
        src = f.read()
    return [int(x) for x in re.findall(r'\{k:"hrs"[^}]*?need:(\d+)', src)]


def doc_gloss_through():
    """11.3 표의 koreanTranslationThroughSession 값 (파생기의 읽는 함수를 쓰지 않고 따로 읽는다)."""
    with open(DOC, encoding="utf-8") as f:
        m = re.search(r"^\|\s*koreanTranslationThroughSession\s*\|\s*(\d+)\s*\|", f.read(), re.M)
    return int(m.group(1)) if m else None


def spec_gloss_through():
    """기준서 13.1 예외 문단의 '한국어 풀이는 세션 1~N 에서만 보인다.' 의 N."""
    with open(SPEC, encoding="utf-8") as f:
        m = re.search(r"한국어 풀이는 세션 1~(\d+) 에서만 보인다\.", f.read())
    return int(m.group(1)) if m else None


def spec_line_ok():
    with open(SPEC, encoding="utf-8") as f:
        for line in f:
            if line.startswith("| 한국어 자막 |") and "전 구간" in line:
                return True
    return False


def load():
    s = jload(os.path.join(GAME, "sessions.json"))
    with open(ACTS, "rb") as f:
        raw = f.read()
    return {
        "acts": json.loads(raw.decode("utf-8")),
        "raw": raw,
        "manifest": jload(MANIFEST),
        "sessions": len(s["sessions"]),
        "minutes": sum(b["minutes"] for b in s["blocks"]),
        "pass": pass_last_hours(),
        "th": doc_thresholds(),
        "spec": spec_line_ok(),
        "docThrough": doc_gloss_through(),
        "specThrough": spec_gloss_through(),
        "dataHash": DGM.data_hash(DGM.collect()[0]),
    }


# 규칙 ---------------------------------------------------------------------------

def rule_keys(d):
    a, out = d["acts"], []
    if set(a) != set(KEYS):
        out.append("맨 위 칸이 다르다. 빠진 것 %s 남는 것 %s" % (sorted(set(KEYS) - set(a)), sorted(set(a) - set(KEYS))))
    for k, t in KEYS.items():
        if k in a and not typed(a[k], t):
            out.append("%s 의 형이 %s 가 아니다: %r" % (k, t.__name__, a[k]))
    if a.get("schemaVersion") != 1:
        out.append("schemaVersion 이 1 이 아니다")
    for k, sub in SUB.items():
        o = a.get(k)
        if not isinstance(o, dict):
            continue
        if set(o) != set(sub):
            out.append("%s 의 칸이 다르다. 빠진 것 %s 남는 것 %s" % (k, sorted(set(sub) - set(o)), sorted(set(o) - set(sub))))
        for c, t in sub.items():
            if c in o and not typed(o[c], t):
                out.append("%s.%s 의 형이 %s 가 아니다: %r" % (k, c, t.__name__, o[c]))
    for i, r in enumerate(a.get("levels", []) if isinstance(a.get("levels"), list) else []):
        if not isinstance(r, dict) or set(r) != set(LEVEL_KEYS):
            out.append("levels[%d] 의 칸이 다르다" % i)
            continue
        for c, t in LEVEL_KEYS.items():
            if not typed(r[c], t):
                out.append("levels[%d].%s 의 형이 %s 가 아니다" % (i, c, t.__name__))
    return out


def rule_plan(d):
    p, out = d["acts"].get("plan"), []
    if not isinstance(p, dict):
        return ["plan 이 없다"]
    if p.get("sessions") != d["sessions"]:
        out.append("plan.sessions %r 가 sessions.json 의 %d 와 다르다" % (p.get("sessions"), d["sessions"]))
    if d["minutes"] % 60 or p.get("hoursPerSession") != d["minutes"] // 60:
        out.append("plan.hoursPerSession %r 가 블록 분 합계 %d 에서 안 나온다" % (p.get("hoursPerSession"), d["minutes"]))
    if len(d["pass"]) != 4:
        out.append("앱 PASS 에서 누적 시간 통과선 넷을 못 읽었다: %s" % d["pass"])
    elif p.get("totalHours") != d["pass"][-1]:
        out.append("plan.totalHours %r 가 PASS 마지막 통과선 %d 와 다르다" % (p.get("totalHours"), d["pass"][-1]))
    if p.get("passHours") != d["pass"]:
        out.append("plan.passHours %r 가 PASS 의 %s 와 다르다" % (p.get("passHours"), d["pass"]))
    try:
        if p["sessions"] * p["hoursPerSession"] != p["totalHours"]:
            out.append("세션 수 곱하기 세션당 시간이 총시간과 다르다")
    except (KeyError, TypeError):
        out.append("plan 계산을 못 한다")
    return out


def rule_ranges(d):
    a, out = d["acts"], []
    lv, p = a.get("levels"), a.get("plan", {})
    if not isinstance(lv, list) or not lv:
        return ["levels 가 비었다"]
    n, hps = p.get("sessions"), p.get("hoursPerSession")
    prev = None
    for i, r in enumerate(lv):
        if not isinstance(r, dict) or not all(k in r for k in LEVEL_KEYS):
            out.append("levels[%d] 칸이 모자란다" % i)
            return out
        want = 1 if prev is None else prev["toSession"] + 1
        if r["fromSession"] != want:
            out.append("levels[%d] 가 %d 에서 시작한다 (%d 여야 한다). %s" % (
                i, r["fromSession"], want, "틈" if r["fromSession"] > want else "겹침"))
        if r["toSession"] < r["fromSession"]:
            out.append("levels[%d] 의 끝이 시작보다 앞이다" % i)
        if r["cefr"] not in ORDER:
            out.append("levels[%d] 의 등급 %r 이 %s 가 아니다" % (i, r["cefr"], ORDER))
        if prev is not None:
            if prev["cefr"] == r["cefr"]:
                out.append("levels[%d] 가 앞 구간과 같은 등급 %s 다 (접어야 한다)" % (i, r["cefr"]))
            elif prev["cefr"] in ORDER and r["cefr"] in ORDER and ORDER.index(r["cefr"]) < ORDER.index(prev["cefr"]):
                out.append("levels[%d] 의 등급 %s 가 앞 %s 보다 낮다 (순서가 거꾸로)" % (i, r["cefr"], prev["cefr"]))
        if is_int(hps):
            if r["fromHours"] != hps * (r["fromSession"] - 1) or r["toHours"] != hps * r["toSession"]:
                out.append("levels[%d] 의 시간 %s~%s 가 세션 %s~%s 와 안 맞는다" % (
                    i, r["fromHours"], r["toHours"], r["fromSession"], r["toSession"]))
        prev = r
    if lv[-1]["toSession"] != n:
        out.append("마지막 구간이 %r 에서 끝난다 (%r 이어야 한다)" % (lv[-1]["toSession"], n))
    return out


def rule_derive(d):
    """세션마다 처음부터 다시 센다. 구간 표에서 찾은 등급과 같아야 한다."""
    a, out = d["acts"], []
    th = d["th"]
    if not th or [t for t, _ in th] != ORDER:
        return ["docs/game_data.md 11.1 표를 못 읽었다: %s" % th]
    got = [(t["cefr"], t["maxHours"]) for t in a.get("thresholds", []) if isinstance(t, dict) and "cefr" in t and "maxHours" in t]
    if got != th:
        out.append("thresholds %s 가 11.1 표 %s 와 다르다" % (got, th))
    p = a.get("plan", {})
    hps, n = p.get("hoursPerSession"), p.get("sessions")
    if not (is_int(hps) and is_int(n)):
        return out + ["plan 숫자가 없어 세션을 못 센다"]
    lv = a.get("levels", [])
    for s in range(1, n + 1):
        end = hps * s
        want = next((c for c, mx in th if end <= mx), None)
        have = next((r.get("cefr") for r in lv if isinstance(r, dict) and r.get("fromSession", 0) <= s <= r.get("toSession", -1)), None)
        if want != have:
            out.append("세션 %d (끝 %d시간) 는 %s 여야 하는데 구간표는 %s 다" % (s, end, want, have))
            if len(out) > 6:
                out.append("... 더 있다")
                break
    return out


def rule_release(d):
    r = d["acts"].get("release")
    if not isinstance(r, dict) or not is_int(r.get("throughSession")):
        return ["release.throughSession 이 정수가 아니다"]
    n = d["sessions"]
    if not 0 <= r["throughSession"] <= n:
        return ["release.throughSession %d 가 0~%d 밖이다 (잠글 세션이 없는데 잠갔다고 믿게 된다)" % (r["throughSession"], n)]
    return []


def rule_captions(d):
    c, out = d["acts"].get("captions"), []
    if not isinstance(c, dict):
        return ["captions 가 없다"]
    if c.get("koreanTranslation") is not False:
        out.append("captions.koreanTranslation 이 거짓이 아니다: %r (기준서 13.1)" % (c.get("koreanTranslation"),))
    if c.get("duringListening") != "off":
        out.append("captions.duringListening 이 off 가 아니다: %r (듣는 동안 글은 지금도 없다)" % (c.get("duringListening"),))
    if c.get("afterListening") not in ("off", "en"):
        out.append("captions.afterListening 이 off 나 en 이 아니다: %r" % (c.get("afterListening"),))
    if not d["spec"]:
        out.append("기준서 13.1 의 '한국어 자막 / 전 구간' 줄이 없다. 풀렸으면 11.3 표와 이 검사를 같이 고친다")
    n = c.get("koreanTranslationThroughSession")
    plan = d["acts"].get("plan") if isinstance(d["acts"].get("plan"), dict) else {}
    if not is_int(n) or not 0 <= n <= plan.get("sessions", 288):
        out.append("captions.koreanTranslationThroughSession 이 0~%d 정수가 아니다: %r" % (plan.get("sessions", 288), n))
    elif n != d["docThrough"] or n != d["specThrough"]:
        out.append("captions.koreanTranslationThroughSession %r 이 11.3 표 %r 또는 기준서 13.1 예외 문단 %r 와 다르다"
                   % (n, d["docThrough"], d["specThrough"]))
    return out


def rule_extension(d):
    e, out = d["acts"].get("extension"), []
    if not isinstance(e, dict):
        return ["extension 이 없다"]
    if e.get("fromSession") != d["sessions"] + 1:
        out.append("extension.fromSession %r 가 %d 이 아니다" % (e.get("fromSession"), d["sessions"] + 1))
    if e.get("target") != "C1":
        out.append("extension.target 이 C1 이 아니다: %r" % (e.get("target"),))
    if e.get("status") != "later":
        out.append("extension.status 가 later 가 아니다: %r" % (e.get("status"),))
    return out


def rule_chars(d):
    text = d["raw"].decode("utf-8") if isinstance(d["raw"], bytes) else d["raw"]
    out = []
    if chr(0x2014) in text:
        out.append("em-dash 가 있다")
    if chr(0xFFFD) in text:
        out.append("U+FFFD 가 있다")
    odd = sorted({ch for ch in text if ord(ch) > 127 and not HANGUL.match(ch)})
    if odd:
        out.append("한국어 밖의 비 ASCII 가 있다: %s" % " ".join("U+%04X" % ord(c) for c in odd[:8]))
    if "\r" in text:
        out.append("CR 이 있다 (두 노트북이 바이트가 같아야 한다)")
    if not text.endswith("\n") or text.endswith("\n\n"):
        out.append("끝 줄바꿈이 하나가 아니다")
    return out


def rule_manifest(d):
    m, out = d["manifest"], []
    row = next((r for r in m.get("files", []) if r.get("file") == "acts.json"), None)
    if row is None:
        return ["manifest.json 이 acts.json 을 안 적었다. python3 scripts/derive_game_manifest.py 를 돌린다"]
    raw = d["raw"] if isinstance(d["raw"], bytes) else d["raw"].encode("utf-8")
    if row.get("bytes") != len(raw):
        out.append("manifest 의 acts.json 크기 %r 가 지금 %d 와 다르다" % (row.get("bytes"), len(raw)))
    if row.get("sha256") != hashlib.sha256(raw).hexdigest():
        out.append("manifest 의 acts.json 해시가 지금 파일과 다르다 (해시 어긋남)")
    if "acts.json" in m.get("pending", []):
        out.append("manifest 가 acts.json 을 아직 안 내려온 파일로 적었다")
    if m.get("dataHash") != d["dataHash"]:
        out.append("manifest 의 dataHash 가 지금 파일들로 센 값과 다르다")
    return out


def rule_fresh(d):
    errs = []
    body = DA.build(errs)
    if body is None:
        return ["다시 뽑지 못했다: %s" % "; ".join(errs)]
    want = json.dumps(body, ensure_ascii=False, indent=1) + "\n"
    raw = d["raw"].decode("utf-8") if isinstance(d["raw"], bytes) else d["raw"]
    return [] if raw == want else ["acts.json 이 다시 뽑은 것과 다르다 (손으로 고쳤거나 원본이 바뀌었다)"]


RULES = [("keys", rule_keys), ("plan", rule_plan), ("ranges", rule_ranges), ("derive", rule_derive),
         ("release", rule_release), ("captions", rule_captions), ("extension", rule_extension),
         ("chars", rule_chars), ("manifest", rule_manifest)]


# 깸 시험 --------------------------------------------------------------------------

def breaks():
    B = []

    def add(name, rule):
        def deco(fn):
            B.append((name, rule, fn))
            return fn
        return deco

    def reraw(d):
        """acts 를 고쳤으면 바이트도 그에 맞춘다. 매니페스트 시험이 아닌 곳에서 해시 규칙이 같이 울리지 않게."""
        d["raw"] = (json.dumps(d["acts"], ensure_ascii=False, indent=1) + "\n").encode("utf-8")

    @add("구간에 틈을 만든다 (둘째 구간이 하루 늦게 시작)", "ranges")
    def _(d):
        d["acts"]["levels"][1]["fromSession"] += 1

    @add("구간을 겹친다 (둘째 구간이 하루 일찍 시작)", "ranges")
    def _(d):
        d["acts"]["levels"][1]["fromSession"] -= 1

    @add("등급 순서를 거꾸로 한다 (A2 와 B1 을 바꾼다)", "ranges")
    def _(d):
        lv = d["acts"]["levels"]
        lv[1]["cefr"], lv[2]["cefr"] = lv[2]["cefr"], lv[1]["cefr"]

    @add("이웃 구간을 같은 등급으로 둔다 (접지 않는다)", "ranges")
    def _(d):
        d["acts"]["levels"][1]["cefr"] = "A1"

    @add("마지막 구간을 287 에서 끝낸다", "ranges")
    def _(d):
        d["acts"]["levels"][-1]["toSession"] = 287

    @add("구간 시간을 세션과 어긋나게 한다", "ranges")
    def _(d):
        d["acts"]["levels"][2]["toHours"] += 2

    @add("경계를 손으로 한 세션 옮긴다 (50 을 49 로)", "derive")
    def _(d):
        lv = d["acts"]["levels"]
        lv[0]["toSession"] = 49
        lv[1]["fromSession"] = 50
        lv[0]["toHours"] = 98
        lv[1]["fromHours"] = 98

    @add("기준선 시간을 바꾼다 (A1 을 120 으로)", "derive")
    def _(d):
        d["acts"]["thresholds"][0]["maxHours"] = 120

    @add("공개 한계를 288 보다 크게 한다", "release")
    def _(d):
        d["acts"]["release"]["throughSession"] = 289

    @add("공개 한계를 음수로 한다", "release")
    def _(d):
        d["acts"]["release"]["throughSession"] = -1

    @add("공개 한계를 참거짓으로 한다", "release")
    def _(d):
        d["acts"]["release"]["throughSession"] = True

    @add("맨 위 칸 하나를 지운다 (captions)", "keys")
    def _(d):
        del d["acts"]["captions"]

    @add("맨 위에 모르는 칸을 더한다", "keys")
    def _(d):
        d["acts"]["acts"] = []

    @add("자막 칸의 형을 문자열로 바꾼다", "keys")
    def _(d):
        d["acts"]["captions"]["koreanTranslation"] = "false"

    @add("세션 수를 287 로 적는다", "plan")
    def _(d):
        d["acts"]["plan"]["sessions"] = 287

    @add("총시간을 575 로 적는다", "plan")
    def _(d):
        d["acts"]["plan"]["totalHours"] = 575

    @add("세션당 시간을 3 으로 적는다", "plan")
    def _(d):
        d["acts"]["plan"]["hoursPerSession"] = 3

    @add("한국어 번역을 참으로 한다", "captions")
    def _(d):
        d["acts"]["captions"]["koreanTranslation"] = True

    @add("듣는 동안 영어 글을 켠다", "captions")
    def _(d):
        d["acts"]["captions"]["duringListening"] = "en"

    @add("한국어 풀이 한계를 289 로 적는다", "captions")
    def _(d):
        d["acts"]["captions"]["koreanTranslationThroughSession"] = 289

    @add("한국어 풀이 한계를 표와 다른 49 로 적는다", "captions")
    def _(d):
        d["acts"]["captions"]["koreanTranslationThroughSession"] = 49

    @add("기준서 13.1 예외 문단의 숫자가 표와 다르다", "captions")
    def _(d):
        d["specThrough"] = 48

    @add("한국어 풀이 한계 칸을 문자열로 바꾼다", "keys")
    def _(d):
        d["acts"]["captions"]["koreanTranslationThroughSession"] = "50"

    @add("기준서 13.1 의 한국어 자막 줄이 풀렸다", "captions")
    def _(d):
        d["spec"] = False

    @add("늘리기 시작 번호를 290 으로 한다", "extension")
    def _(d):
        d["acts"]["extension"]["fromSession"] = 290

    @add("늘리기 목표를 B2 로 한다", "extension")
    def _(d):
        d["acts"]["extension"]["target"] = "B2"

    @add("em-dash 를 노트에 넣는다", "chars")
    def _(d):
        d["acts"]["note"] += " " + chr(0x2014)
        reraw(d)

    @add("영어 아닌 문자(그리스 문자)를 넣는다", "chars")
    def _(d):
        d["acts"]["note"] += " α"
        reraw(d)

    @add("매니페스트의 해시를 바꾼다 (해시 어긋남)", "manifest")
    def _(d):
        for r in d["manifest"]["files"]:
            if r["file"] == "acts.json":
                r["sha256"] = "0" * 64

    @add("매니페스트에서 acts.json 을 뺀다", "manifest")
    def _(d):
        d["manifest"]["files"] = [r for r in d["manifest"]["files"] if r["file"] != "acts.json"]

    @add("매니페스트의 dataHash 를 바꾼다", "manifest")
    def _(d):
        d["manifest"]["dataHash"] = "f" * 64

    @add("파생물을 손으로 고친다 (노트 끝에 글자 하나)", "fresh")
    def _(d):
        d["raw"] = d["raw"].replace("다시 돌린다.".encode("utf-8"), "다시 돌린다!".encode("utf-8"), 1)

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
    a = d["acts"]
    if not fails:
        print("구간표 %d세션 %d시간 / 구간 %s / 공개 %d번까지 / 자막 듣기 뒤 %s / 늘리기 %d번부터 %s %s"
              % (a["plan"]["sessions"], a["plan"]["totalHours"],
                 " ".join("%s %d-%d" % (r["cefr"], r["fromSession"], r["toSession"]) for r in a["levels"]),
                 a["release"]["throughSession"], a["captions"]["afterListening"],
                 a["extension"]["fromSession"], a["extension"]["target"], a["extension"]["status"]))
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
