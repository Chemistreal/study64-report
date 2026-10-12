#!/usr/bin/env python3
"""지은 영어(authored)의 관문을 건다. **말뭉치 줄의 관문은 안 바꾸고 지은 줄에만 새 관문을 건다.** (docs/authored.md)

판 (각 판마다 깸 시험이 있다. `--break`)
    gates      원본(docs/authored_lines.md)이 낱말 등급, 길이, 새 낱말, 문화, 중복, 베끼기, 풀이 구간, 점검 값을 통과한다
    fresh      out/game/authored.json, outings.json, state/authored_b.md 가 원본을 다시 읽은 것과 같다 (손으로 안 고쳤다)
    blist      점검 B 줄이 state/authored_b.md 에 다 있다 (B 는 숨기지 않고 모은다)
    corpus     말뭉치 줄은 그대로다. scenes.json 의 줄이 다 lle 근거고 authored 줄이 scenes.json 에 안 섞였다 (지금은 장면에 지은 줄이 없다)
    scene      scenes.md 의 근거 칸 `authored:<줄 id>` 를 받는 길(authored_lib.scene_line_ok)이 글자 다른 줄, 세션 앞선 줄을 막는다
    first      첫 공개(세션 1~48, A1) 미션은 집필이 끝났으면 모든 줄과 연습 말에 한국어 풀이가 있다
    outings    미션 표(outing.md)가 세션 계획에 맞는다 (derive_outings.py 와 같은 관문)
    culture    authored.json 에 check_culture.py 의 금지어 표가 걸린다
    plan       미션이 세션 계획을 안 건드린다 (sessions.json 288, acts.json plan 그대로, 미션 id 가 sessions.json 에 없다)
    structure  미션 55장(첫 공개 18 + 보관본 G2 G3 G5)의 구조: 줄 25~40, 점수 차례 8~14 (예외는 authored_lib.LIMIT_EXCEPTIONS 에 이유와 함께),
               고정 자리(A, B)마다 점수 차례의 35% 이상 (`둘 중 누구든` 차례는 어느 자리에도 안 센다), 재개와 건너뜀 메타가 차례와 맞고,
               고정 자리 차례의 고르는 줄 인물이 그 자리다 (docs/authored.md 3.1장)

사용법:
    python3 scripts/check_authored.py
    python3 scripts/check_authored.py --break
"""
import copy
import json
import os
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import authored_lib as L  # noqa: E402
import derive_authored as DA  # noqa: E402
import derive_outings as DO  # noqa: E402

ROOT = L.ROOT
GAME = os.path.join(ROOT, "out", "game")


def gates(outs, table, S):
    fail = []
    for o in outs:
        f, _, _ = L.line_problems(o, table, S)
        fail += f
    return fail


def check_gates():
    S = json.load(open(L.SESS, encoding="utf-8"))["sessions"]
    table, dup = L.load_words()
    outs, f = L.parse_lines()
    return f + dup + gates(outs, table, S)


def check_fresh():
    fail = []
    outs, lines, practice, notes, f = DA.build()
    if f:
        return ["원본에 실패가 있어 다시 못 읽는다: %s" % f[0]]
    got = json.load(open(DA.OUT, encoding="utf-8"))
    if got["lines"] != json.loads(json.dumps(lines, ensure_ascii=False)) or got["practice"] != practice:
        fail.append("out/game/authored.json 이 원본과 다르다. derive_authored.py 를 다시 돌린다")
    ms, _, f2 = DO.load()
    if f2:
        fail.append("미션 표에 실패가 있다: %s" % f2[0])
    else:
        have = json.load(open(DO.OUT, encoding="utf-8"))["missions"]
        if have != json.loads(json.dumps([m for m in ms if m["release"] == "first"], ensure_ascii=False)):
            fail.append("out/game/outings.json 이 원본과 다르다. derive_outings.py 를 다시 돌린다")
    if open(L.BLIST, encoding="utf-8").read() != L.build_b_list(outs):
        fail.append("state/authored_b.md 가 원본과 다르다")
    return fail


def first_gloss_problems(outs, ms):
    """첫 공개(세션 1~48, A1) 미션은 집필이 끝났으면 모든 줄과 연습 말에 한국어 풀이가 있다 (풀이는 세션 50 이하에서만 쓰인다)."""
    fail = []
    done = {m["id"] for m in ms if m["release"] == "first" and m["authoring"] != "대기"}
    for o in outs:
        if o["id"] in done:
            for ln in o["lines"]:
                if ln["ko"].strip() in ("", "-"):
                    fail.append("첫 공개 미션 %s 줄 %s 에 한국어 풀이가 없다" % (o["id"], ln["id"]))
            for p in o["practice"]:
                if p["ko"].strip() in ("", "-"):
                    fail.append("첫 공개 미션 %s 연습 말 %s 에 한국어 풀이가 없다" % (o["id"], p["id"]))
    return fail


def check_first():
    outs, _ = L.parse_lines()
    ms, _, f = DO.load()
    return f + first_gloss_problems(outs, ms)


def check_blist():
    outs, _ = L.parse_lines()
    txt = open(L.BLIST, encoding="utf-8").read()
    fail = []
    for o in outs:
        for ln in o["lines"]:
            if ln["check"] == "B" and ("| %s |" % ln["id"]) not in txt:
                fail.append("점검 B 줄 %s 가 state/authored_b.md 에 없다" % ln["id"])
    return fail


def check_corpus():
    fail = []
    sc = json.load(open(os.path.join(GAME, "scenes.json"), encoding="utf-8"))
    ids = set(L.authored_index())
    for x in sc["sessions"]:
        for b in x["blocks"]:
            for ln in b["lines"]:
                if not str(ln.get("from", "")).startswith("lle"):
                    fail.append("scenes.json 세션 %d 에 말뭉치 근거 아닌 줄: %s" % (x["s"], ln.get("say")))
                if ln.get("from") in ids or ln.get("provenance") == "authored":
                    fail.append("scenes.json 세션 %d 에 지은 줄이 섞였다" % x["s"])
    return fail[:10]


def check_scene():
    """scene_line_ok 의 통과와 막기"""
    idx = L.authored_index()
    fail = []
    ln = idx["enb-01"][0]
    ok, why = L.scene_line_ok(ln["say"], "Server", "authored:enb-01", 47)
    if not ok:
        fail.append("맞는 장면 줄이 막혔다: " + why)
    for args, label in (((ln["say"] + " Now.", "Server", "authored:enb-01", 47), "글자 다른 줄"),
                        ((ln["say"], "Server", "authored:enb-01", 46), "세션 앞선 줄"),
                        ((ln["say"], "두 사람", "authored:enb-01", 47), "npc 줄을 두 사람 줄로"),
                        ((ln["say"], "Server", "authored:zzz-99", 47), "없는 줄")):
        if L.scene_line_ok(*args)[0]:
            fail.append("막혀야 할 장면 줄이 통과했다: " + label)
    return fail


def check_culture():
    r = subprocess.run([sys.executable, os.path.join(HERE, "check_culture.py"), DA.OUT],
                       capture_output=True, text=True, cwd=ROOT)
    return [x for x in r.stdout.splitlines() if x.startswith("[실패]")] + ([] if r.returncode == 0 else ["check_culture 종료 코드 %d" % r.returncode])


STRUCT_PARTS = ["docs/parts/G2_authored_lines.md", "docs/parts/G3_authored_lines.md", "docs/parts/G5_authored_lines.md"]


def all_missions():
    """[(미션, 파일)]. 첫 공개 18장(본문)과 보관본 37장. 보관본은 파생에 안 들어가므로 구조 관문만 건다."""
    out = [(o, "docs/authored_lines.md") for o in L.parse_lines()[0]]
    for rel in STRUCT_PARTS:
        out += [(o, rel) for o in L.parse_lines(os.path.join(ROOT, rel))[0]]
    return out


def structure_all(missions):
    """(실패, 알림)"""
    fail, warn = [], []
    seen = set()
    for o, _ in missions:
        if o["id"] in seen:
            fail.append("%s: 미션 장이 두 파일에 있다" % o["id"])
        seen.add(o["id"])
        fail += L.flow_problems(o)
        f, w = L.structure_problems(o)
        fail += f
        warn += w
    for k in L.LIMIT_EXCEPTIONS:
        if k not in seen:
            fail.append("예외표의 미션 %s 가 없다" % k)
        for key, (n, why) in L.LIMIT_EXCEPTIONS[k].items():
            if len(why) < 20:
                fail.append("예외표 %s.%s 에 이유가 없다" % (k, key))
    return fail, warn


STRUCT_WARN = []


def check_structure():
    fail, warn = structure_all(all_missions())
    STRUCT_WARN[:] = warn
    return fail


def check_plan():
    fail = []
    S = json.load(open(L.SESS, encoding="utf-8"))
    A = json.load(open(L.ACTS, encoding="utf-8"))
    if S["count"] != 288 or len(S["sessions"]) != 288:
        fail.append("세션이 288이 아니다")
    if A["plan"]["sessions"] != 288 or A["plan"]["passHours"] != [144, 288, 432, 576]:
        fail.append("acts.json 계획이 144/288/432/576 이 아니다")
    txt = json.dumps(S, ensure_ascii=False)
    for m in json.load(open(DO.OUT, encoding="utf-8"))["missions"]:
        if m["id"] in txt:
            fail.append("미션 id %s 가 sessions.json 에 들어갔다" % m["id"])
    return fail


# ------------------------------------------------------------------ 깸 시험

def broken_outing(mut):
    S = json.load(open(L.SESS, encoding="utf-8"))["sessions"]
    table, _ = L.load_words()
    outs, _ = L.parse_lines()
    o = copy.deepcopy(outs[0])
    mut(o)
    f, _, _ = L.line_problems(o, table, S)
    return f


def set_line(i, **kw):
    def m(o):
        ln = next(x for x in o["lines"] if x["id"] == i)
        ln.update(kw)
    return m


def breaks():
    missed = []

    def want(name, got):
        ok = bool(got)
        print("  [%s] %s" % ("잡음" if ok else "놓침", name))
        if not ok:
            missed.append(name)

    want("vocab: 등급표에 없는 낱말", broken_outing(set_line("enb-02", say="Zebra, please.")))
    want("vocab: 두 단계 높은 낱말", broken_outing(set_line("enb-02", say="Refund, please.")))
    want("vocab: 한 단계 높은 낱말 둘", broken_outing(set_line("enb-10", say="Are you ready to order dessert, waiter?")))
    want("length: 낱말 수", broken_outing(set_line("enb-02", say="Two, please. Two, please. Two, please. Two, please.", cefr="A1")))
    want("length: 이음말", broken_outing(set_line("enb-02", say="Two, please, if you can.")))
    want("level: 장면보다 두 단계 높은 줄", broken_outing(set_line("enb-02", cefr="B1")))
    want("culture: 슬랭", broken_outing(set_line("enb-22", say="Awesome!")))
    want("culture: 지어낸 철자", broken_outing(set_line("enb-22", say="Gimme coffee!")))
    want("culture: 상표", broken_outing(set_line("enb-06", say="Coffee, Starbucks, please.")))
    want("culture: 연속성(집 구하기 전 apartment)", broken_outing(set_line("enb-06", say="Coffee, apartment, please.")))
    want("dup: 같은 인물 같은 말", broken_outing(set_line("enb-03", say="Good morning! How many?", who="Host")))
    want("dup: 같은 차례의 후보 둘이 같은 말", broken_outing(set_line("enb-26", say="Yes, it is very good.")))
    want("copy: 말뭉치 8낱말", broken_outing(set_line("enb-02", say=" ".join(sorted(L.corpus_ngrams(L.COPY_FAIL))[0]), cefr="B2")))
    want("gloss: 풀이 구간 밖", broken_outing(lambda o: o["meta"].update({"세션": "60"})))
    want("blist: B 인데 이유 없음", broken_outing(set_line("enb-31", why="-")))
    want("schema: 점검 값", broken_outing(set_line("enb-01", check="C")))
    want("schema: 메타 빠짐", broken_outing(lambda o: o["meta"].pop("작성자")) or [])
    outs0, _ = L.parse_lines()
    ms0, _, _ = DO.load()
    cp = copy.deepcopy(outs0)
    cp[0]["lines"][3]["ko"] = "-"
    want("first: 첫 공개 미션 줄에 풀이 없음", first_gloss_problems(cp, ms0))
    cp = copy.deepcopy(outs0)
    cp[0]["practice"][0]["ko"] = ""
    want("first: 첫 공개 미션 연습 말에 풀이 없음", first_gloss_problems(cp, ms0))
    want("schema: 연습 말과 줄 불일치", broken_outing(lambda o: o["practice"][0].update({"say": "Three, please."})))

    # B 목록이 낡았다
    outs, _ = L.parse_lines()
    stale = copy.deepcopy(outs)
    stale[0]["lines"][0]["check"] = "B"
    stale[0]["lines"][0]["why"] = "일부러 심은 B 줄이다 확신 없음"
    want("fresh: B 목록이 낡았다", [1] if open(L.BLIST, encoding="utf-8").read() != L.build_b_list(stale) else [])

    # 미션 표
    import re
    src = open(DO.OUT_MD, encoding="utf-8").read()

    def outing_fail(new_src):
        old = DO.OUT_MD
        with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as f:
            f.write(new_src)
        try:
            DO.OUT_MD = f.name
            return DO.load()[2]
        finally:
            DO.OUT_MD = old
            os.unlink(f.name)

    def row_sub(text, mission, pat, repl):
        """Changes one cell pattern inside the table row of one mission (whatever its writing status is)."""
        out = []
        for line in text.split("\n"):
            if line.startswith("| `%s` |" % mission):
                line = re.sub(pat, repl, line, count=1)
            out.append(line)
        return "\n".join(out)

    want("outings: 요구 미션 하나 지움", outing_fail(re.sub(r"^\| `cookie_snack` .*\n", "", src, flags=re.M)))
    want("outings: 등급이 세션과 다름", outing_fail(src.replace("| 2.? |", "").replace("| 4.5 | 대기 |", "| 4.5 | 대기 |").replace(
        "| A1 | 쿠키를 골라", "| B2 | 쿠키를 골라")))
    want("outings: 다지기 주에 열림", outing_fail(row_sub(src, "musubi_day", r"\| 5\.4 \|", "| 6.2 |")))
    want("outings: 없는 랜드마크", outing_fail(src.replace("| `honolulu_cookie_company` | 1 |", "| `zzz_cookie` | 1 |", 1)))
    want("outings: 단계가 표와 다름", outing_fail(src.replace("| `waiola_shave_ice` | 1 | A1 |", "| `waiola_shave_ice` | 3 | A1 |")))
    want("outings: 첫 공개에 A2 미션", outing_fail(src.replace("| `cookie_snack` | life | `honolulu_cookie_company` | 1 | A1 |", "| `cookie_snack` | life | `honolulu_cookie_company` | 1 | A2 |")))
    want("outings: 첫 공개가 공개 한계 뒤", outing_fail(row_sub(src, "cookie_snack", r"\| 4\.5 \|", "| 9.5 |")))
    want("outings: 첫 공개 생활 수가 14가 아님", outing_fail(row_sub(src, "cookie_snack", r"\| 첫 공개 \|", "| 이후 |")))
    want("outings: 집필 상태 거짓", outing_fail(row_sub(src, "dukes_dinner", r"\| 대기 \|", "| 집필 완료 |")))

    # 장면 길과 계획
    want("scene: 글자 다른 장면 줄", [1] if not L.scene_line_ok("Good morning! How many people?", "Host", "authored:enb-01", 47)[0] else [])
    sc_bad = copy.deepcopy(json.load(open(os.path.join(GAME, "scenes.json"), encoding="utf-8")))
    # corpus 판이 지은 줄 섞임을 잡는지: 같은 함수 본문을 재현
    sc_bad["sessions"][0]["blocks"][0]["lines"].append({"who": "Host", "say": "Hi", "from": "authored:enb-01"})
    bad = any(not str(ln.get("from", "")).startswith("lle") for x in sc_bad["sessions"] for b in x["blocks"] for ln in b["lines"])
    want("corpus: 말뭉치 근거 아닌 장면 줄", [1] if bad else [])

    # culture: 금지어를 넣은 임시 파일
    t = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8")
    t.write(json.dumps({"lines": [{"say": "Wear a grass skirt, please."}]}))
    t.close()
    r = subprocess.run([sys.executable, os.path.join(HERE, "check_culture.py"), t.name], capture_output=True, text=True, cwd=ROOT)
    os.unlink(t.name)
    want("culture: 금지어(grass skirt) 파일", [1] if r.returncode != 0 else [])

    # 구조 관문 (줄과 차례의 상한, 자리 몫, 재개와 건너뜀)
    by_id = {o["id"]: o for o, _ in all_missions()}

    def struct(mut, mid="cookie_snack"):
        o = copy.deepcopy(by_id[mid])
        mut(o)
        return L.flow_problems(o) + L.structure_problems(o)[0]

    def more_lines(o):
        for k in range(15):
            ln = dict(o["lines"][0])
            ln["id"] = "zz-%02d" % k
            o["lines"].append(ln)

    def more_turns(o):
        o["turns"] += [dict(o["turns"][1], id="tz%d" % k) for k in range(3)]

    def all_a(o):
        for t in o["turns"]:
            if t["pick"] != "-":
                t["seat"] = "A"

    def either_all(o):
        for t in o["turns"]:
            if t["pick"] != "-":
                t["seat"] = "둘 중 누구든"

    want("structure: 줄이 40줄 넘음(예외 없음)", struct(more_lines))
    want("structure: 점수 차례가 14 넘음(예외 없음)", struct(more_turns))
    want("structure: 점수 차례가 8 밑", struct(lambda o: o.update(turns=o["turns"][:6])))
    want("structure: 한 자리가 35% 밑", struct(all_a))
    want("structure: 누구든만 있으면 고정 몫 0", struct(either_all))
    want("structure: 고정 자리 차례에 다른 자리 줄", struct(lambda o: o["turns"][1].update(seat="B")))
    want("structure: 재개의 고른 후보가 차례 후보가 아님", struct(lambda o: o["meta"].update({"재개": "t10:cs-01 > cs-23"})))
    want("structure: 재개에 갈래 NPC 줄이 없음", struct(lambda o: o["meta"].update({"재개": "t10:cs-25 > cs-23/cs-24", "갈래": "-"})))
    want("structure: 재개의 답이 NPC 줄", struct(lambda o: o["meta"].update({"재개": "t10:cs-25 > cs-22", "갈래": "cs-25 > cs-22"})))
    want("structure: 재개 꼴이 틀림", struct(lambda o: o["meta"].update({"재개": "t10 cs-25"})))
    want("structure: 건너뜀 조건이 뒤 차례", struct(lambda o: o["meta"].update({"건너뜀": "t2 if t5:cs-10"})))
    want("structure: 건너뜀 범위 거꾸로", struct(lambda o: o["meta"].update({"건너뜀": "t5..t3 if t1:cs-02"})))
    # 예외표
    old = dict(L.LIMIT_EXCEPTIONS)
    try:
        L.LIMIT_EXCEPTIONS["cookie_snack"] = {"lines": (50, "상한 안인데 있는 예외라서 지워야 한다 지워야 한다")}
        want("structure: 필요 없는 예외", struct(lambda o: None))
        L.LIMIT_EXCEPTIONS.pop("cookie_snack")
        L.LIMIT_EXCEPTIONS["hotel_front_desk"] = {"lines": (41, "예외 상한보다 줄이 많아졌다 예외 상한보다 줄이 많다")}
        want("structure: 예외 상한을 넘음", struct(lambda o: None, "hotel_front_desk"))
    finally:
        L.LIMIT_EXCEPTIONS.clear()
        L.LIMIT_EXCEPTIONS.update(old)
    sf, _ = structure_all(all_missions())
    print("  [%s] 현재 55장은 구조 실패 0 이어야 한다 (%d)" % ("통과" if not sf else "놓침", len(sf)))
    if sf:
        missed.append("structure clean")

    # 깨끗한 원본은 통과해야 한다
    clean = check_gates()
    print("  [%s] 현재 원본은 실패 0 이어야 한다 (%d)" % ("통과" if not clean else "놓침", len(clean)))
    if clean:
        missed.append("clean")
    return missed


def main():
    panels = [("gates", check_gates), ("fresh", check_fresh), ("blist", check_blist), ("corpus", check_corpus),
              ("first", check_first), ("scene", check_scene), ("culture", check_culture), ("plan", check_plan),
              ("structure", check_structure)]
    n = 0
    for name, fn in panels:
        for x in fn():
            print("[실패] %s: %s" % (name, x))
            n += 1
    for w in STRUCT_WARN:
        print("[알림] structure: " + w)
    outs, _ = L.parse_lines()
    lines = [ln for o in outs for ln in o["lines"]]
    b = sum(1 for ln in lines if ln["check"] == "B")
    ms = json.load(open(DO.OUT, encoding="utf-8"))
    print("지은 영어 판 %d / 나들이 %d장 / 줄 %d (점검 A %d, B %d) / 미션 %d / 실패 %d"
          % (len(panels), len(outs), len(lines), len(lines) - b, b, ms["counts"]["missions"], n))
    if "--break" in sys.argv:
        print("깸 시험:")
        missed = breaks()
        if missed:
            print("[실패] 깸을 못 잡은 것: " + " | ".join(missed))
            n += len(missed)
        else:
            print("깸 시험 전부 잡았다")
    return 1 if n else 0


if __name__ == "__main__":
    sys.exit(main())
