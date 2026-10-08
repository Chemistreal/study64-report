#!/usr/bin/env python3
"""역할형 카드 105장의 NPC 응답 줄 (`docs/game_data.md` 4장). `out/game/replies.json` 을 낸다.

역할형 카드는 NPC 가 A 면을 맡는다 (game.md 5.1). 카드에는 상황 관계 목적 격식 끝 조건이 있고
**NPC 가 무슨 영어를 말하는지는 어디에도 없었다.** 지어 말하면 1번 규칙을 깬다.

그래서 이 파일은 줄을 **이미 들은 VOA 대본에서만** 고른다.

    줄이 한 사람의 한 마디 안에서 이어진 문장 그대로인가 (장면 파생기의 grounded 를 쓴다)
    그 줄의 과를 카드가 처음 나오는 세션까지 블록 1 에서 이미 들었나 (sessions.json)
    scenes.md 2.2 2.3 2.4 의 막는 말이 아닌가
    이름 자리가 없는가. NPC 는 누구든 말할 수 있어야 한다 (speaker-neutral)

고르는 길은 표다. 카드의 목적이 함수를 정하고 (4.2) 함수가 후보 줄을 차례로 준다 (4.1).
격식에 따라 후보 순서가 다르다. 처음 들은 것으로 닿는 줄이 하나도 없으면 줄 없이 **몸짓만**이다.
끝 조건이 횟수나 시간으로 닫히는 카드는 한 줄로 못 닫으니 몸짓과 시계가 맡는다 (4.3).

    completes  그 줄 하나로 끝 조건이 채워지나. 아니오면 줄은 첫 반응이고 나머지는 몸짓이다
    reply null NPC 는 몸짓만 한다. reason 에 까닭이 있다

**기계가 안 보는 것: 그 줄이 그 순간에 자연스러운가.** 갈래를 목적으로 고르는 것은 B등급이다.

사용법:
    python3 scripts/derive_replies.py
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import derive_scenes as DS      # noqa: E402  읽기만 한다. 대본 읽기와 grounded 를 같이 쓴다
from derive_judge import doc_rows  # noqa: E402

ROOT = DS.ROOT
CARDS = DS.CARDS
SESS = DS.GAME
OUT = os.path.join(ROOT, "out", "game", "replies.json")

REGISTERS = ["격식", "중립", "친근"]
RELATIONS = ["친한 친구", "동료", "상사와 권위", "서비스 상황", "배우자와 가족", "처음 만난 사람"]
PURPOSES = ["제안", "불평", "사과", "칭찬", "거절", "불동의", "요청", "설명", "협상", "잡담"]
# 인물표의 몸짓 가운데 쓸 수 있는 것. 전투와 쓰러짐 아홉은 아무도 안 쓴다 (cast 1장)
GESTURES = {"idle", "emote-yes", "emote-no", "interact-right", "interact-left", "pick-up", "static"}
RETRY = "Let's try that again."


def tables():
    fn = doc_rows("### 4.1 ", 6)
    pur = doc_rows("### 4.2 ", 4)
    end = doc_rows("### 4.3 ", 4)
    rep = doc_rows("### 4.4 ", 4)
    if None in (fn, pur, end, rep):
        return None
    return fn, pur, end, rep


def block_lists():
    """scenes.md 2.2 2.3 2.4. 장면과 같은 목록을 쓴다."""
    sc = DS.doc("scenes.md")
    reserved = {DS.norm(c[0]) for c in DS.rows(DS.sub(sc, "### 2.2 48주에만 쓰는 줄"), 2)}
    light = {DS.norm(c[0]) for c in DS.rows(DS.sub(sc, "### 2.3 8층 줄기에서 안 쓰는 맞장구"), 2)}
    words = [(c[0], c[1]) for c in DS.rows(DS.sub(sc, "### 2.4 막는 말"), 3)]
    return reserved, light, words


def blocked(text, lists, words_only=False):
    """막는 말이 있으면 까닭을, 없으면 None. words_only 는 2.4 만 본다 (슬랭, 실명, 상표).

    2.2 와 2.3 은 장면의 세션마다 걸리는 규칙이라 장면 줄에는 장면 파생기가 건다.
    응답 줄은 어느 세션에서 나올지 몰라 셋을 다 건다.
    """
    reserved, light, words = lists
    sens = [DS.norm(t) for t in DS.sentences(text)]
    if not words_only:
        if any(t in reserved for t in sens):
            return "48주에만 쓰는 줄 (scenes.md 2.2)"
        if any(t in light for t in sens):
            return "8층 줄기에서 안 쓰는 맞장구 (scenes.md 2.3)"
    for word, kind in words:
        if word[-1] in ".!?":
            hit = DS.norm(word) in sens
        else:
            hit = re.search(r"(?<![A-Za-z])" + re.escape(word) + r"(?![A-Za-z])", text,
                            0 if kind != "슬랭" else re.I)
        if hit:
            return "막는 말 %s (scenes.md 2.4 %s)" % (word, kind)
    for brand in DS.BRANDS:
        if re.search(r"\b" + re.escape(brand) + r"\b", text):
            return "실제 상표 %s" % brand
    return None


class Lessons:
    """대본을 한 번만 읽는다. 세션까지 들은 과를 준다."""

    def __init__(self, sessions):
        self.first = {}
        self.heard = {}
        seen = []
        for x in sessions:
            if x["media"] not in self.first:
                self.first[x["media"]] = x["s"]
                seen.append(x["media"])
            self.heard[x["s"]] = list(seen)
        self.cache = {}

    # 장면 파생기의 transcript 는 "Ms. Weaver:" 같은 호칭 붙은 화자 칸을 못 읽는다 (온점에서 문장이 끊긴다).
    # 거기서는 못 읽은 줄이 안 맞는 쪽으로만 틀려서 장면은 안전하다. 여기서는 읽는다
    LABEL = re.compile(r"\s*((?:(?:Ms|Mr|Mrs|Dr)\. )?[A-Z][A-Za-z ]*?):\s*(.*)", re.S)

    def utts(self, m):
        """(한 마디마다 문장들, 이름 자리가 대신할 수 있는 화자 이름들)."""
        if m not in self.cache:
            body = DS.body(m)
            out, who = [], None
            for para in re.split(r"\n\s*\n", body or ""):
                if not para.strip():
                    continue
                mm = self.LABEL.match(para)
                text = mm.group(2) if mm else para
                if mm:
                    who = mm.group(1)
                if who and text.strip():
                    out.append(DS.sentences(" ".join(text.split())))
            self.cache[m] = (out or None, DS.names(m))
        return self.cache[m]

    def source(self, text, s):
        """세션 s 까지 들은 과 가운데 이 줄이 그대로 있는 첫 과. (과, 처음 들은 세션) 또는 None."""
        for m in self.heard[s]:
            utts, nm = self.utts(m)
            if utts and DS.grounded(text, utts, nm):
                return m, self.first[m]
        return None


def first_sessions(sessions):
    first = {}
    for x in sessions:
        for cid in x["cards"]:
            first.setdefault(cid, x["s"])
    return first


def classify_end(end_text, end_rows):
    """4.3 표를 위에서부터. 낱말 하나라도 끝 조건 글에 있으면 그 갈래다."""
    for name, words, closes, _ in end_rows:
        if any(w.strip() and w.strip() in end_text for w in words.split(",")):
            return name, closes
    return None, None


def build():
    fail = []
    tb = tables()
    if tb is None:
        return None, ["docs/game_data.md 에 4.1 ~ 4.4 표가 없다"]
    fn_rows, pur_rows, end_rows, rep_rows = tb
    G = json.load(open(SESS, encoding="utf-8"))["sessions"]
    cards = json.load(open(CARDS, encoding="utf-8"))["items"]
    first = first_sessions(G)
    L = Lessons(G)
    lists = block_lists()

    fns = {}
    for name, a, b, c, gest, meaning in fn_rows:
        try:
            cand = {"격식": json.loads(a), "중립": json.loads(b), "친근": json.loads(c)}
        except ValueError:
            fail.append("4.1 표의 후보가 JSON 이 아니다: " + name)
            continue
        if gest not in GESTURES:
            fail.append("4.1 표의 몸짓이 인물표에 없다: %s %s" % (name, gest))
        for reg, lines in cand.items():
            for t in lines:
                if re.search(r"\{[^}]*\}", t):
                    fail.append("4.1 표 %s 의 후보에 이름 자리가 있다: %s" % (name, t))
                why = blocked(t, lists)
                if why:
                    fail.append("4.1 표 %s 의 후보 '%s' 가 막힌다: %s" % (name, t, why))
        fns[name] = {"cand": cand, "gesture": gest, "meaning": meaning}
    by_purpose = {p: (f, g) for p, f, g, _ in pur_rows}
    for p in PURPOSES:
        if p not in by_purpose:
            fail.append("4.2 표에 목적이 없다: " + p)
        else:
            for f in by_purpose[p]:
                if f not in fns:
                    fail.append("4.2 표의 함수가 4.1 에 없다: %s -> %s" % (p, f))

    retry_src = L.source(RETRY, 1)
    if not retry_src:
        fail.append("되묻는 줄이 1세션에 닿지 않는다: " + RETRY)

    out, counts = [], {"full": 0, "partial": 0, "gesture": 0}
    for c in cards:
        if c["type"] != "역할":
            continue
        cid = c["id"]
        a, b = c["a"], c["b"]
        # 다섯 요소가 A 면과 B 면에 다 있고 같은가
        el = {"situation": a.get("situation"), "relation": a.get("relation"), "purpose": a.get("purpose"),
              "register": a.get("register"), "endCondition": a.get("endCondition")}
        bad = [k for k, v in el.items() if not v]
        if bad:
            fail.append("%s 에 역할 요소가 비었다: %s" % (cid, " ".join(bad)))
        for k, v in el.items():
            if b.get(k) != v:
                fail.append("%s 의 %s 가 A 면과 B 면이 다르다" % (cid, k))
        if el["relation"] not in RELATIONS:
            fail.append("%s 의 관계가 여섯 밖이다: %s" % (cid, el["relation"]))
        if el["purpose"] not in PURPOSES:
            fail.append("%s 의 목적이 열 밖이다: %s" % (cid, el["purpose"]))
        if el["register"] not in REGISTERS:
            fail.append("%s 의 격식이 셋 밖이다: %s" % (cid, el["register"]))
        s0 = first.get(cid)
        if s0 is None:
            fail.append("%s 가 어느 세션에도 안 나온다" % cid)
            continue
        etype, closes = classify_end(el["endCondition"] or "", end_rows)
        first_fn, close_fn = by_purpose.get(el["purpose"], (None, None))
        # 끝 조건을 줄 하나로 닫을 수 있으면 닫는 함수, 아니면 첫 반응 함수
        fn = close_fn if closes == "예" else first_fn
        rec = {"id": cid, "quarter": c["quarter"], "firstSession": s0,
               "elements": {"situation": bool(el["situation"]), "relation": el["relation"],
                            "purpose": el["purpose"], "register": el["register"],
                            "endCondition": bool(el["endCondition"])},
               "fn": fn, "endType": etype}
        if etype is None:
            fail.append("%s 의 끝 조건을 4.3 표가 못 읽는다: %s" % (cid, el["endCondition"]))
            continue
        gest = fns[fn]["gesture"] if fn in fns else "idle"
        if closes == "횟수":
            rec.update({"reply": None, "gesture": "idle",
                        "reason": "끝 조건이 횟수나 시간으로 닫힌다. 한 줄이 아니라 몸짓과 시계가 맡는다"})
            counts["gesture"] += 1
            out.append(rec)
            continue
        got = None
        for t in fns.get(fn, {"cand": {}})["cand"].get(el["register"], []):
            src = L.source(t, s0)
            if src:
                got = (t, src)
                break
        if not got:
            rec.update({"reply": None, "gesture": gest,
                        "reason": "%d세션까지 들은 대본에 '%s' 갈래 줄이 없다" % (s0, fn)})
            counts["gesture"] += 1
        else:
            t, (m, heard_at) = got
            done = closes == "예"
            rec["reply"] = {"say": t, "from": m, "heardAt": heard_at, "completes": done}
            rec["gesture"] = gest
            rec["reason"] = None if done else "줄은 첫 반응이다. 끝 조건은 NPC 가 새 말을 해야 닫히고 그것은 대본 줄로 못 채운다. 나머지는 몸짓이다"
            counts["full" if done else "partial"] += 1
        out.append(rec)

    # repair 카드. A 면이 NPC 에게 대화 반응을 시킨 것만 (4.4)
    rep_out = []
    byid = {c["id"]: c for c in cards}
    for cid, fn, evid, _ in rep_rows:
        c = byid.get(cid)
        if not c or c["type"] != "repair":
            fail.append("4.4 표의 카드가 repair 형이 아니다: " + cid)
            continue
        if evid not in c["a"].get("instruction", ""):
            fail.append("4.4 표의 근거 문구가 %s 의 A 면 지시에 없다: %s" % (cid, evid))
            continue
        s0 = first.get(cid)
        reg = "중립"
        got = None
        for t in fns[fn]["cand"][reg]:
            src = L.source(t, s0)
            if src:
                got = (t, src)
                break
        if got:
            t, (m, h) = got
            rep_out.append({"id": cid, "quarter": c["quarter"], "firstSession": s0, "fn": fn,
                            "reply": {"say": t, "from": m, "heardAt": h, "completes": True},
                            "gesture": fns[fn]["gesture"], "reason": None})
        else:
            rep_out.append({"id": cid, "quarter": c["quarter"], "firstSession": s0, "fn": fn, "reply": None,
                            "gesture": fns[fn]["gesture"], "reason": "들은 대본에 그 갈래 줄이 없다"})
    nrep = sum(1 for c in cards if c["type"] == "repair")

    obj = {
        "note": "역할형 카드 105장의 NPC 응답 줄이다. 줄은 이미 들은 VOA 대본의 한 마디 안에서 이어진 문장 그대로다. "
                "손으로 안 고친다. scripts/derive_replies.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "줄은 대본 그대로라 A 다. 카드의 목적을 어느 반응 갈래로 보는지와 후보 순서는 사람이 정한 표(game_data.md 4장)라 B 다.",
        "generator": "scripts/derive_replies.py",
        "source": "out/data/cards.json (역할형 105, repair 형 95), out/game/sessions.json, media/english/transcripts, docs/game_data.md 4장",
        "retry": {"say": RETRY, "from": retry_src[0] if retry_src else None, "heardAt": retry_src[1] if retry_src else None,
                  "why": "NPC 가 못 알아들었을 때 하는 줄이다 (game.md 6장). 모든 카드에 쓴다"},
        "functions": {k: {"gesture": v["gesture"], "meaning": v["meaning"]} for k, v in fns.items()},
        "counts": {"role": len(out), "grounded": counts["full"] + counts["partial"], "full": counts["full"],
                   "partial": counts["partial"], "gestureOnly": counts["gesture"],
                   "repair": nrep, "repairWithReply": sum(1 for r in rep_out if r["reply"]),
                   "repairSkipped": nrep - len(rep_out)},
        "repairNote": "repair 형 95장 가운데 A 면 지시가 NPC 에게 대화 반응 한 줄을 시키는 카드만 줄을 준다 (4.4). "
                      "나머지는 읽기 연습이거나 말없이 보는 카드라 NPC 대사가 아니다.",
        "cards": out,
        "repair": rep_out,
    }
    return obj, fail


def main():
    obj, fail = build()
    for f in fail:
        print("[실패] " + f)
    if fail or obj is None:
        print("응답 줄을 안 냈다. 실패 %d" % len(fail))
        return 1
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write("\n")
    c = obj["counts"]
    print("out/game/replies.json / 역할형 %d / 줄 있음 %d (끝까지 %d, 첫 반응만 %d) / 몸짓만 %d / repair 줄 %d / 실패 0"
          % (c["role"], c["grounded"], c["full"], c["partial"], c["gestureOnly"], c["repairWithReply"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
