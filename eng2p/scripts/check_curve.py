#!/usr/bin/env python3
"""하루 소요와 난이도 곡선의 문서 숫자를 다시 세어 견준다 (2026-10-12, 개정문 31).

`docs/day_length.md` 와 `docs/curve.md` 는 표를 `scripts/report_curve.py` 가 낸 글 그대로 싣는다.
손으로 옮긴 숫자는 자료가 바뀌는 날 거짓이 된다. 그래서 **문서의 생성 블록이 지금 자료에서 다시 센 것과 글자까지 같은가** 를 본다.

    1 블록         day_length.md 의 day 블록, curve.md 의 curve, whatif, need 블록이 다시 센 글과 같다
    2 글 속 숫자   문서 본문과 개정문 31 이 든 숫자(하루 평균, 가장 긴 날, 합 시간, 역방향 폭 ...)가 다시 센 값과 같다
    3 오르는 지표  블록 3 예상 소요, 처음 나온 카드의 평균 분, 역할형 비중이 A1 -> A2 -> B1 -> B2 로 오른다 (내려가면 실패)
    4 역방향 폭    새 낱말 종류의 역방향 폭(A1 값 빼기 A2 B1 B2 의 가장 낮은 값)이 문서에 적힌 값과 같다.
                   **알려진 어긋남이다.** 더 나빠지면 실패이고, 좋아져도 문서의 폭을 고쳐야 통과한다 (숨기지 않는 자리)
    5 시계 없음    블록 3 에 시계가 자르는 칸이 sessions.json 에 없다 (check_game.py 열두째 판이 본다. 여기서는 문서 글만)

`--break` 를 주면 규칙마다 실패를 하나 이상 심어 그 규칙이 잡는지 본다.

사용법:
    python3 scripts/check_curve.py
    python3 scripts/check_curve.py --break
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import report_curve as RC  # noqa: E402

ROOT = RC.ROOT
DAY = os.path.join(ROOT, "docs", "day_length.md")
CURVE = os.path.join(ROOT, "docs", "curve.md")
AMEND = os.path.join(ROOT, "docs", "spec_amendments.md")


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def block(text, name):
    m = re.search(r"<!-- gen:%s -->\n(.*?)\n<!-- /gen:%s -->" % (name, name), text, re.S)
    return m.group(1) if m else None


def width(rows):
    r = {x["band"]: x["new"] for x in rows}
    return round(r["A1"] - min(r["A2"], r["B1"], r["B2"]), 1)


def facts(Y):
    """검사가 쥐는 값 전부. --break 가 이 값이나 글을 비틀어 규칙이 잡는지 본다."""
    rows = RC.curve_rows(Y)
    return {"day": RC.md_day(Y), "curve": RC.md_curve(Y), "whatif": RC.md_whatif(Y), "need": RC.md_need(Y),
            "k": RC.day_facts(Y), "rows": rows, "needs": RC.need_rows(Y),
            "wi": RC.whatif(Y, RC.WHATIF[-1])[0]}


def rules(F, docs):
    """각 규칙의 실패 목록을 {규칙 이름: [글]} 로. docs = {'day','curve','amend'} 글."""
    out = {"블록": [], "글 속 숫자": [], "오르는 지표": [], "역방향 폭": [], "시계 없음": []}
    for doc, names in (("day", ["day"]), ("curve", ["curve", "whatif", "need"])):
        for n in names:
            got = block(docs[doc], n)
            if got is None:
                out["블록"].append("%s 문서에 gen:%s 블록이 없다" % (doc, n))
            elif got != F[n]:
                out["블록"].append("%s 문서의 gen:%s 블록이 지금 자료에서 다시 센 것과 다르다. python3 scripts/report_curve.py --md %s 로 다시 붙인다" % (doc, n, n))
    k = F["k"]
    am = docs["amend"]
    i = am.find("## 31. ")
    am31 = am[i:] if i >= 0 else ""
    need = ["평균 %d분(블록 3 이 %d분)" % (k["mean"], k["b3mean"]),
            "가장 긴 날 %d분(세션 %d)" % (k["max"], k["maxS"]),
            "3시간 이상인 날 %d일" % k["ge3"], "4시간 이상인 날 %d일" % k["ge4"],
            "합은 %d시간이라 계획 눈금 %d시간의 %d%%" % (k["hours"], k["planHours"], k["pct"]),
            "100시간에 닿는 세션이 %d, 200시간이 %d, 400시간이 %d, 600시간이 %d" % (
                k["marks"][100], k["marks"][200], k["marks"][400], k["marks"][600])]
    for s in need:
        if s not in am31:
            out["글 속 숫자"].append("개정문 31번에 '%s' 가 없다 (자료에서 다시 센 값)" % s)
    rows = {r["band"]: r for r in F["rows"]}
    w = width(F["rows"])
    cv = docs["curve"]
    for s in ["A1 16.3 에서 B1 2.9 까지", "역방향의 폭은 **%s** 다" % w, "이 문서의 %s 를 넘으면" % w]:
        if s not in cv:
            out["글 속 숫자"].append("curve.md 에 '%s' 가 없다" % s)
    n_b1 = F["needs"][1][2]["B1"]
    n_b2 = F["needs"][1][2]["B2"]
    if "B1 에 %d종, B2 에 %d종이 모자란다" % (n_b1, n_b2) not in cv:
        out["글 속 숫자"].append("curve.md 에 'B1 에 %d종, B2 에 %d종이 모자란다' 가 없다" % (n_b1, n_b2))
    wi = F["wi"]
    if "(%s, %s, %s)" % (RC.fmt(wi[1]), RC.fmt(wi[2]), RC.fmt(wi[3])) not in cv or ("A1 은 %s 에서" % RC.fmt(wi[0])) not in cv:
        out["글 속 숫자"].append("curve.md 가 가정 계산의 마지막 줄(%s)과 다르다" % wi)
    # 오르는 지표
    for key, label in (("b3", "블록 3 예상 소요"), ("fcmin", "처음 나온 카드 평균 분"), ("role", "처음 나온 카드 중 역할형")):
        v = [rows[b][key] for b in ("A1", "A2", "B1", "B2")]
        if not all(a < b for a, b in zip(v, v[1:])):
            out["오르는 지표"].append("%s 이 A1 -> B2 로 오르지 않는다: %s" % (label, [round(x, 2) for x in v]))
    # 역방향 폭: 문서 값과 같아야 한다
    m = re.search(r"역방향의 폭은 \*\*([0-9.]+)\*\* 다", cv)
    if not m or abs(float(m.group(1)) - w) > 1e-9:
        out["역방향 폭"].append("새 낱말 종류의 역방향 폭이 %s 인데 문서는 %s 이다" % (w, m.group(1) if m else "없음"))
    # 시계 없음: 문서 글에서 옛 말이 안 남았나
    spec = docs["spec"]
    for old in ("| 3 페어 드릴 | 30분 |", "블록 3 은 30분", "블록 3 에 쓸 수 있는 분은 30분"):
        if old in spec:
            out["시계 없음"].append("기준서에 옛 문장이 남았다: %s" % old)
    return out


def load_docs():
    return {"day": read(DAY), "curve": read(CURVE), "amend": read(AMEND), "spec": read(os.path.join(ROOT, "docs", "spec.md"))}


def main():
    Y = RC.Year()
    F = facts(Y)
    docs = load_docs()
    R = rules(F, docs)
    bad = [m for v in R.values() for m in v]
    for m in bad:
        print("[실패] " + m)
    n = sum(1 for _ in R)
    print("곡선과 하루 소요 %d판 (블록, 글 속 숫자, 오르는 지표, 역방향 폭, 시계 없음) / 하루 평균 %d분 최대 %d분 합 %d시간 / "
          "새 낱말 역방향 폭 %s (알려진 어긋남) / 실패 %d" % (n, F["k"]["mean"], F["k"]["max"], F["k"]["hours"], width(F["rows"]), len(bad)))
    if "--break" in sys.argv:
        return 1 if bad or brk(F, docs) else 0
    return 1 if bad else 0


def brk(F, docs):
    """깸 시험. 규칙마다 비틀어 잡히는지 본다."""
    import copy
    cases = []

    def case(name, rule, mutate):
        cases.append((name, rule, mutate))

    case("day 블록의 숫자 하나를 바꾼다", "블록", lambda F, D: D.__setitem__("day", D["day"].replace("하루 평균 161분", "하루 평균 160분")))
    case("curve 블록을 지운다", "블록", lambda F, D: D.__setitem__("curve", re.sub(r"<!-- gen:curve -->.*?<!-- /gen:curve -->", "", D["curve"], flags=re.S)))
    case("개정문 31번의 하루 평균을 바꾼다", "글 속 숫자", lambda F, D: D.__setitem__("amend", D["amend"].replace("평균 161분(블록 3 이 71분)", "평균 150분(블록 3 이 60분)")))
    case("역할형 비중이 B1 에서 내려간다", "오르는 지표", lambda F, D: F["rows"][2].__setitem__("role", 0.0))
    case("처음 나온 카드 분이 B2 에서 내려간다", "오르는 지표", lambda F, D: F["rows"][3].__setitem__("fcmin", 1.0))
    case("새 낱말이 B1 에서 더 내려간다 (폭이 커진다)", "역방향 폭", lambda F, D: F["rows"][2].__setitem__("new", 0.5))
    case("새 낱말이 B1 에서 올라 폭이 줄었는데 문서는 그대로다", "역방향 폭", lambda F, D: F["rows"][2].__setitem__("new", 9.0))
    case("기준서에 옛 문장이 돌아온다", "시계 없음", lambda F, D: D.__setitem__("spec", D["spec"] + "\n| 3 페어 드릴 | 30분 | x | 필수 |\n"))
    missed = 0
    for name, rule, mutate in cases:
        F2, D2 = copy.deepcopy(F), dict(docs)
        mutate(F2, D2)
        got = rules(F2, D2)
        if not got[rule]:
            print("[실패] 깸 시험을 규칙 '%s' 가 못 잡았다: %s" % (rule, name))
            missed += 1
    print("깸 시험 %d개 중 잡힌 것 %d" % (len(cases), len(cases) - missed))
    return missed


if __name__ == "__main__":
    sys.exit(main())
