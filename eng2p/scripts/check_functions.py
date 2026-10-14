#!/usr/bin/env python3
"""기능 라벨 자료(out/game/functions.json)를 건다. 설계는 docs/functions.md, 파생기는 derive_functions.py.

판 (각 판마다 깸 시험이 있다. `--break`)
    fresh     파일이 원본(카드, 강의, 등록부, 기준서, 지은 줄, 미션)을 다시 읽은 것과 같다 (손으로 안 고쳤다)
    vocab     라벨이 어휘 셋(기준서 4.4 10기능, 2.1 repair 낱말, 지은 줄과 미션의 기능) 밖의 낱말이 아니다. 새 분류가 없다
    cards     카드 600장이 한 번씩 다 있다. 라벨이 있으면 근거(by)가 있고 없으면 까닭(why)이 있다. 역할형은 105장 다 purpose 로 붙었고 카드의 purpose 와 같다
    force     억지로 안 붙였다. 소리, 자동화, 문법 강의는 강의 단위 라벨이 없다. 화용 13편은 조합 등록부로 다 붙었다. 등록부와 카드의 purpose 가 어긋나지 않는다
    turns     점수 차례 213개의 후보 줄이 미션 표와 같고 줄의 기능이 authored.json 과 같다. same 이 맞다. 후보 id 는 pick 정규식을 지킨다
    index     색인 셋이 미션, 차례, 카드에서 다시 센 것과 같고 순서(열리는 세션)가 맞다
    privacy   점수, 사람 이름, 말한 글, 느낌표가 없다. 모양 파일의 금지 칸 이름이 키에 없다
    schema    results_schema.json 의 outing_turn.pick 이 선택 칸이고 정규식이 같다. 고정 줄 outing_pick.jsonl 의 pick 이 turns 의 후보다
    doc       docs/functions.md 의 숫자가 파일의 counts 와 같다

사용법:
    python3 scripts/check_functions.py
    python3 scripts/check_functions.py --break
"""
import copy
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import derive_functions as DF  # noqa: E402

ROOT = DF.ROOT
DOC = os.path.join(ROOT, "docs", "functions.md")
RSCHEMA = os.path.join(ROOT, "out", "game", "results_schema.json")
PICK_FIXTURE = os.path.join(ROOT, "tools", "game", "results_fixture", "outing_pick.jsonl")
PICK_RE = re.compile(r"^[a-z]{2,4}-[0-9]{1,3}$")
# 결과 모양 파일의 금지 칸 이름 + 사람별 값을 말하는 낱말. 이 파일의 어떤 키에도 없어야 한다
FORBIDDEN_KEYS = ["name", "nameA", "nameB", "who", "speaker", "player", "user", "mic", "text", "say", "transcript", "heard",
                  "audio", "path", "file", "rec", "score", "confidence", "wer", "points", "level", "rank"]
PERSON_WORDS = ["남편", "아내", "사람1", "사람 1", "사람2", "사람 2", "당신", "너는"]
TOP = ["version", "note", "grade", "gradeWhy", "generator", "source", "vocabulary", "rules", "whyTexts", "counts",
       "unlabeledByLecture", "cards", "missions", "turns", "byMissionFunction", "byLineFunction", "byCardFunction"]


def load(p):
    return json.load(open(p, encoding="utf-8"))


def vocab_of(F):
    v = F["vocabulary"]
    A, O = load(DF.AUTHORED), load(DF.OUTINGS)
    lf, mf = DF.authored_terms(A, O)
    return set(v["standard10"]["terms"]) | set(v["repair"]["terms"]) | lf | mf


def walk(o, path=""):
    """(경로, 키 또는 None, 값) 을 모든 자리에서 낸다."""
    if isinstance(o, dict):
        for k, v in o.items():
            yield path + "/" + k, k, None
            yield from walk(v, path + "/" + k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            yield from walk(v, path + "/%d" % i)
    else:
        yield path, None, o


def check_fresh(F):
    obj, fail = DF.build()
    if fail:
        return ["원본에서 다시 못 읽는다: " + fail[0]]
    if json.loads(json.dumps(obj, ensure_ascii=False)) != F:
        return ["out/game/functions.json 이 원본과 다르다. python3 scripts/derive_functions.py 를 돌린다"]
    return []


def check_vocab(F):
    fail = []
    spec_fail = []
    ten, repair = DF.spec_terms(spec_fail)
    fail += spec_fail
    v = F["vocabulary"]
    if v["standard10"]["terms"] != ten:
        fail.append("standard10 이 기준서 4.4 의 10기능과 다르다")
    if v["repair"]["terms"] != repair:
        fail.append("repair 낱말이 파생기의 REPAIR_TERMS(기준서 2.1) 와 다르다")
    voc = vocab_of(F)
    for cid, r in F["cards"].items():
        for f in r["fn"]:
            if f not in voc:
                fail.append("카드 %s 의 라벨 '%s' 이 어휘 셋 밖이다 (새 분류를 지었다)" % (cid, f))
    for name in ("byMissionFunction", "byLineFunction", "byCardFunction"):
        for f in F[name]:
            if f not in voc:
                fail.append("%s 의 '%s' 가 어휘 셋 밖이다" % (name, f))
    return fail


def check_cards(F):
    fail = []
    cards = load(DF.CARDS)["items"]
    ids = [c["id"] for c in cards]
    if len(ids) != 600 or sorted(F["cards"]) != sorted(ids):
        fail.append("카드 id 가 cards.json 의 600장과 다르다 (%d개)" % len(F["cards"]))
    by_id = {c["id"]: c for c in cards}
    why = F["whyTexts"]
    lecs = {l["no"]: l for l in load(DF.LECTURES)["items"]}
    n = {k: 0 for k in DF.BASES}
    none = 0
    for cid, r in F["cards"].items():
        c = by_id.get(cid)
        if c is None:
            continue
        if r["type"] != c["type"]:
            fail.append("카드 %s 의 type 이 cards.json 과 다르다" % cid)
        # 화면 이름 (docs/game_wording_g14.json 의 track). why 표의 키는 내부 값이다
        shown = DF.TRACK_NAME.get(lecs.get(r["lecture"], {}).get("track"), lecs.get(r["lecture"], {}).get("track"))
        inner = {v: k for k, v in DF.TRACK_NAME.items()}.get(r.get("why"), r.get("why"))
        if shown != r["track"]:
            fail.append("카드 %s 의 lecture/track 이 lectures.json 과 다르다" % cid)
        if r["fn"]:
            if r["by"] not in DF.BASES:
                fail.append("카드 %s 에 라벨이 있는데 근거(by)가 %r 이다" % (cid, r["by"]))
            else:
                n[r["by"]] += 1
            if "why" in r:
                fail.append("카드 %s 에 라벨과 why 가 같이 있다" % cid)
            if len(set(r["fn"])) != len(r["fn"]):
                fail.append("카드 %s 의 라벨이 겹친다" % cid)
        else:
            none += 1
            if r["by"] is not None or inner not in why or r.get("why") != r["track"]:
                fail.append("카드 %s 에 라벨이 없는데 까닭(why)이 트랙 %s 의 것이 아니다" % (cid, r["track"]))
        if c["type"] == "역할" and not (r["by"] == "purpose" and r["fn"] == [c["a"].get("purpose")]):
            fail.append("역할형 카드 %s 가 purpose 로 안 붙었다" % cid)
        if r["by"] == "purpose" and c["type"] != "역할":
            fail.append("카드 %s 가 역할형이 아닌데 purpose 로 붙었다" % cid)
        if r["by"] == "pass" and (c["type"] != "repair" or not all(f in c["a"].get("pass", "") for f in r["fn"])):
            fail.append("카드 %s 의 pass 근거가 a.pass 에 없다" % cid)
    c = F["counts"]
    if (c["labeled"], c["unlabeled"], c["cards"]) != (600 - none, none, 600) or c["by"] != n:
        fail.append("counts 가 카드에서 센 것과 다르다: %s / 센 값 labeled %d none %d %s" % (c, 600 - none, none, n))
    flat = sorted(x for v in F["unlabeledByLecture"].values() for x in v)
    if flat != sorted(k for k, r in F["cards"].items() if not r["fn"]):
        fail.append("unlabeledByLecture 가 fn 이 빈 카드와 다르다")
    return fail


def check_force(F):
    fail = []
    ten, _ = DF.spec_terms([])
    lec_reg, card_reg = DF.rotation([], ten)
    lectures = load(DF.LECTURES)["items"]
    track = {l["no"]: l["track"] for l in lectures}
    for cid, r in F["cards"].items():
        if r["by"] in ("rotation", "title") and {v: k for k, v in DF.TRACK_NAME.items()}.get(r["track"], r["track"]) not in DF.LECTURE_TRACKS:
            fail.append("카드 %s: %s 트랙 강의에 강의 단위 라벨(%s)이 붙었다 (억지로 붙이지 않는다)" % (cid, r["track"], r["by"]))
        if r["by"] == "rotation" and r["fn"] != [lec_reg.get(r["lecture"])]:
            fail.append("카드 %s 의 등록부 라벨이 state/rotation.md 3.1 과 다르다" % cid)
    for no, t in track.items():
        if t == "화용":
            rows = [r for r in F["cards"].values() if r["lecture"] == no and r["by"] != "purpose"]
            if no not in lec_reg:
                fail.append("화용 강의 %d 가 조합 등록부에 없다" % no)
            if any(r["by"] != "rotation" for r in rows):
                fail.append("화용 강의 %d 의 카드가 등록부로 안 붙었다" % no)
    cards = {c["id"]: c for c in load(DF.CARDS)["items"]}
    for (q, no), term in card_reg.items():
        cid = "%s-%03d" % (q, no)
        if cid in cards and cards[cid]["a"].get("purpose") != term:
            fail.append("등록부의 카드 %d(%s) 기능 %s 가 카드의 purpose %s 와 다르다" % (no, q, term, cards[cid]["a"].get("purpose")))
    return fail


def check_turns(F):
    fail = []
    O, A = load(DF.OUTINGS), load(DF.AUTHORED)
    lines = {l["id"]: l for l in A["lines"]}
    if sorted(F["missions"]) != sorted(m["id"] for m in O["missions"]) or sorted(F["turns"]) != sorted(F["missions"]):
        fail.append("missions/turns 의 미션이 outings.json 과 다르다")
    scored = 0
    for m in O["missions"]:
        fm, ft = F["missions"].get(m["id"]), F["turns"].get(m["id"], {})
        if fm is None:
            continue
        if fm["unlock"] != m["unlock"]["session"] or fm["functions"] != m["functions"]:
            fail.append("미션 %s 의 unlock/functions 가 outings.json 과 다르다" % m["id"])
        want = {str(i): t for i, t in enumerate(m["game"]["turns"], 1) if t["scored"]}
        if sorted(ft, key=int) != sorted(want, key=int):
            fail.append("미션 %s 의 점수 차례 번호가 game.turns 와 다르다" % m["id"])
        for k, t in want.items():
            g = ft.get(k)
            if g is None:
                continue
            scored += 1
            if g["id"] != t["id"] or list(g["pick"]) != t["pick"]:
                fail.append("미션 %s 차례 %s 의 후보 줄이 미션 표와 다르다" % (m["id"], k))
            for pid, fn in g["pick"].items():
                if not PICK_RE.match(pid):
                    fail.append("후보 줄 id %s 가 pick 정규식을 못 지킨다" % pid)
                ln = lines.get(pid)
                if ln is None or ln["function"] != fn or ln["outing"] != m["id"]:
                    fail.append("후보 %s 의 기능 '%s' 이 authored.json 과 다르다" % (pid, fn))
            fns = sorted(set(g["pick"].values()))
            if g["same"] != (fns[0] if len(fns) == 1 else None):
                fail.append("미션 %s 차례 %s 의 same 이 틀렸다" % (m["id"], k))
        seen = []
        for k in sorted(ft, key=int):
            for fn in ft[k]["pick"].values():
                if fn not in seen:
                    seen.append(fn)
        if fm["lineFunctions"] != seen:
            fail.append("미션 %s 의 lineFunctions 가 차례에서 센 것과 다르다" % m["id"])
    c = F["counts"]
    split = sum(1 for v in F["turns"].values() for t in v.values() if t["same"] is None)
    if c["scoredTurns"] != scored or c["splitFunctionTurns"] != split or c["sameFunctionTurns"] != scored - split:
        fail.append("counts 의 차례 수가 turns 에서 센 것과 다르다")
    return fail


def check_index(F):
    fail = []
    order = lambda ids: sorted(ids, key=lambda i: (F["missions"][i]["unlock"], i))  # noqa: E731
    by_m, by_l, by_c = {}, {}, {}
    for mid, m in F["missions"].items():
        for f in m["functions"]:
            by_m.setdefault(f, []).append(mid)
        for f in m["lineFunctions"]:
            by_l.setdefault(f, []).append(mid)
    for cid, r in F["cards"].items():
        for f in r["fn"]:
            by_c.setdefault(f, []).append(cid)
    for name, got, want in (("byMissionFunction", F["byMissionFunction"], {k: order(v) for k, v in by_m.items()}),
                            ("byLineFunction", F["byLineFunction"], {k: order(v) for k, v in by_l.items()}),
                            ("byCardFunction", F["byCardFunction"], {k: sorted(v) for k, v in by_c.items()})):
        if got != want:
            diff = sorted(set(got) ^ set(want)) or [k for k in want if got.get(k) != want[k]]
            fail.append("%s 가 다시 센 것과 다르다 (%s)" % (name, " ".join(diff[:4])))
        if list(got) != sorted(got):
            fail.append("%s 의 키가 정렬되지 않았다" % name)
    return fail


def check_privacy(F):
    fail = []
    for path, key, val in walk(F):
        if key in FORBIDDEN_KEYS:
            fail.append("금지 칸 이름 %s (%s)" % (key, path))
        if isinstance(val, str):
            if "!" in val or "！" in val:
                fail.append("느낌표가 있다 (%s)" % path)
            for w in PERSON_WORDS:
                if w in val:
                    fail.append("사람을 가리키는 낱말 '%s' (%s)" % (w, path))
    if list(F)[:len(TOP)] != TOP:
        fail.append("맨 위 칸 차례가 %s 가 아니다" % TOP)
    return fail


def check_schema(F):
    fail = []
    RS = load(RSCHEMA)
    d = RS["$defs"]["outing_turn"]
    pk = d["properties"].get("pick")
    if pk is None or "pick" in d["required"] or pk.get("pattern") != PICK_RE.pattern or pk.get("type") != "string":
        fail.append("results_schema.json 의 outing_turn.pick 이 선택 칸 + 정규식 %s 가 아니다" % PICK_RE.pattern)
    if any(k in RS.get("x-forbiddenKeys", []) for k in ("pick",)):
        fail.append("pick 이 금지 칸 목록에 있다")
    if RS.get("revision", 1) < 3:
        fail.append("results_schema.json 의 revision 이 3 보다 작다")
    if os.path.exists(PICK_FIXTURE):
        for i, ln in enumerate(open(PICK_FIXTURE, encoding="utf-8").read().split("\n"), 1):
            if not ln.strip():
                continue
            o = json.loads(ln)
            if o.get("pick") is None:
                continue
            g = F["turns"].get(o["mission"], {}).get(str(o["turn"]))
            if g is None or o["pick"] not in g["pick"]:
                fail.append("고정 줄 outing_pick.jsonl:%d 의 pick %s 가 turns 의 후보가 아니다" % (i, o["pick"]))
    else:
        fail.append("고정 줄 outing_pick.jsonl 이 없다")
    return fail


def check_doc(F):
    if not os.path.exists(DOC):
        return ["docs/functions.md 가 없다"]
    return doc_problems(F, open(DOC, encoding="utf-8").read())


def doc_problems(F, t):
    c = F["counts"]
    fail = []
    m = re.search(r"카드 (\d+)장 중 기능 라벨 있음 \*\*(\d+)\*\*장, 없음 \*\*(\d+)\*\*장", t)
    if not m or tuple(map(int, m.groups())) != (c["cards"], c["labeled"], c["unlabeled"]):
        fail.append("docs/functions.md 의 '카드 N장 중 기능 라벨 있음 **a**장, 없음 **b**장' 이 counts 와 다르다 (%s)" % (m.group(0) if m else "줄 없음"))
    m = re.search(r"근거별 역할 \*\*(\d+)\*\*, repair 낱말 \*\*(\d+)\*\*, 등록부 \*\*(\d+)\*\*, 제목 \*\*(\d+)\*\*", t)
    b = c["by"]
    if not m or tuple(map(int, m.groups())) != (b["purpose"], b["pass"], b["rotation"], b["title"]):
        fail.append("docs/functions.md 의 근거별 숫자가 counts 와 다르다")
    m = re.search(r"점수 차례 \*\*(\d+)\*\*개 중 기능이 갈리는 차례 \*\*(\d+)\*\*개", t)
    if not m or tuple(map(int, m.groups())) != (c["scoredTurns"], c["splitFunctionTurns"]):
        fail.append("docs/functions.md 의 차례 숫자가 counts 와 다르다")
    return fail


PANELS = [("fresh", check_fresh), ("vocab", check_vocab), ("cards", check_cards), ("force", check_force), ("turns", check_turns),
          ("index", check_index), ("privacy", check_privacy), ("schema", check_schema), ("doc", check_doc)]


def run(F, only=None):
    out = []
    for name, fn in PANELS:
        if only and name not in only:
            continue
        for x in fn(F):
            out.append((name, x))
    return out


def breaks(F):
    """깸 시험. 일부러 깬 자료를 판이 잡는가. 못 잡은 이름들을 돌려준다."""
    missed = []

    def want(label, panel, mut):
        G = copy.deepcopy(F)
        mut(G)
        got = run(G, [panel])
        ok = bool(got)
        print("  [%s] %s -> %s" % ("잡음" if ok else "놓침", label, panel))
        if not ok:
            missed.append(label)

    first_none = next(k for k, r in F["cards"].items() if not r["fn"])
    first_lab = next(k for k, r in F["cards"].items() if r["by"] == "title")
    sound_none = next(k for k, r in F["cards"].items() if r["track"] == "소리" and not r["fn"])
    role = next(k for k, r in F["cards"].items() if r["by"] == "purpose")
    pas = next(k for k, r in F["cards"].items() if r["by"] == "pass")
    mid = next(iter(F["missions"]))
    tk = next(iter(F["turns"][mid]))

    want("새 분류(어휘 밖 낱말)를 카드에 붙임", "vocab", lambda G: G["cards"][first_none].update(fn=["영어 잘하기"], by="title"))
    want("카드 한 장 빠짐", "cards", lambda G: G["cards"].pop(first_none))
    want("라벨이 있는데 근거 없음", "cards", lambda G: G["cards"][first_lab].update(by=None))
    want("라벨이 없는데 까닭 없음", "cards", lambda G: G["cards"][first_none].pop("why"))
    want("역할형 카드의 라벨을 다른 기능으로", "cards", lambda G: G["cards"][role].update(fn=["설명" if F["cards"][role]["fn"] != ["설명"] else "요청"]))
    want("pass 근거인데 a.pass 에 낱말이 없음", "cards", lambda G: G["cards"][pas].update(fn=["시간 벌기"]))
    want("counts 가 거짓", "cards", lambda G: G["counts"].update(labeled=G["counts"]["labeled"] + 1))
    want("소리 트랙 카드에 강의 단위 라벨을 억지로", "force",
         lambda G: G["cards"][sound_none].update(fn=["요청"], by="title"))
    want("화용 강의 카드의 라벨을 지움", "force", lambda G: G["cards"].update({k: dict(v, fn=[], by=None, why="화용") for k, v in G["cards"].items() if v["track"] == "화용" and v["by"] == "rotation"}))
    want("차례 후보 하나를 뺌", "turns", lambda G: G["turns"][mid][tk]["pick"].pop(next(iter(G["turns"][mid][tk]["pick"]))))
    want("후보 줄의 기능이 authored 와 다름", "turns",
         lambda G: G["turns"][mid][tk]["pick"].update({next(iter(G["turns"][mid][tk]["pick"])): "없는 기능"}))
    want("same 이 틀림", "turns", lambda G: G["turns"][mid][tk].update(same="없는 기능" if G["turns"][mid][tk]["same"] is None else None))
    want("후보 id 가 pick 정규식 밖", "turns", lambda G: G["turns"][mid][tk]["pick"].update({"ENB-1": "x"}))
    want("점수 차례 하나 빠짐", "turns", lambda G: G["turns"][mid].pop(tk))
    want("색인에서 미션 하나 빠짐", "index", lambda G: G["byLineFunction"][next(iter(G["byLineFunction"]))].pop())
    want("색인의 순서가 열리는 세션 순이 아님", "index",
         lambda G: G["byLineFunction"].update({k: list(reversed(v)) for k, v in G["byLineFunction"].items() if len(v) > 1}))
    want("카드 색인에 없는 카드", "index", lambda G: G["byCardFunction"][next(iter(G["byCardFunction"]))].append("Q9-999"))
    want("점수 칸이 생김", "privacy", lambda G: G["missions"][mid].update(score=3))
    want("사람 이름 칸 who", "privacy", lambda G: G["missions"][mid].update(who="a"))
    want("느낌표", "privacy", lambda G: G["cards"][first_none].update(why="소리!"))
    want("사람을 가리키는 낱말", "privacy", lambda G: G["rules"].update(done="남편이 해낸 차례"))
    want("손으로 고친 파일(note 한 글자)", "fresh", lambda G: G.update(note=G["note"] + "."))
    want("강의 단위 라벨이 등록부와 다름", "force", lambda G: G["cards"].update({k: dict(v, fn=["잡담"]) for k, v in G["cards"].items() if v["by"] == "rotation" and v["fn"] != ["잡담"]}))
    if os.path.exists(DOC):
        saved = open(DOC, encoding="utf-8").read()
        got = doc_problems(F, saved.replace("기능 라벨 있음 **", "기능 라벨 있음 **9", 1))
        print("  [%s] 문서 숫자가 파일과 다름 -> doc" % ("잡음" if got else "놓침"))
        if not got:
            missed.append("doc")
    clean = run(F)
    print("  [%s] 깨지 않은 파일은 실패 0 이어야 한다 (%d)" % ("통과" if not clean else "놓침", len(clean)))
    if clean:
        missed.append("clean")
    return missed


def main():
    if not os.path.exists(DF.OUT):
        print("[실패] out/game/functions.json 이 없다. python3 scripts/derive_functions.py 를 돌린다")
        return 1
    F = load(DF.OUT)
    fails = run(F)
    for name, x in fails:
        print("[실패] %s: %s" % (name, x))
    c = F["counts"]
    print("기능 라벨 판 %d / 카드 %d장 중 라벨 %d (없음 %d) / 점수 차례 %d (갈림 %d) / 실패 %d"
          % (len(PANELS), c["cards"], c["labeled"], c["unlabeled"], c["scoredTurns"], c["splitFunctionTurns"], len(fails)))
    n = len(fails)
    if "--break" in sys.argv:
        print("깸 시험:")
        missed = breaks(F)
        if missed:
            print("[실패] 깸을 못 잡은 것: " + " | ".join(missed))
            n += len(missed)
        else:
            print("깸 시험 전부 잡았다")
    return 1 if n else 0


if __name__ == "__main__":
    sys.exit(main())
