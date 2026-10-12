#!/usr/bin/env python3
"""하루 소요와 난이도 곡선을 등급 구간별로 센다. 읽기만 한다 (2026-10-12, 개정문 31).

블록 3 에 시간 상한이 없어서(기준서 2.3) 하루의 길이는 세션마다 다르다. 그 길이와, 사용자가 같이 정한
"난이도 등급에는 맞춰줘" (새 낱말 곡선이 A1 에서 B2 로 갈수록 올라가는가)를 **같은 계산으로** 세어 문서에 싣는다.
학습 설계 감사 H1 (docs/parts/H1_learning_design_audit.md 1.2, 4장)의 계산과 같은 정의다.

    하루 소요     90분(블록 1 2 4) + 블록 3 예상 소요. 예상 소요는 카드마다 적힌 분(cards.json, 종이 기준 추정)의 합이다.
                  sessions.json 의 block3 칸이 아니라 cards.json 에서 **다시** 센다 (check_game.py 열두째 판이 둘을 견준다)
    새 낱말 종류  세션 s 에서 처음 나오는 영어 낱말(소문자 낱말꼴) 수. 녹음 대본(그 세션 블록 1 의 과가 처음 쓰인 날),
                  카드 재료(처음 나온 날), 나들이 미션 줄(미션이 열리는 날)의 합집합이다. 어간 처리는 안 한다 (H1 5장)

사용법:
    python3 scripts/report_curve.py              # 표 전부
    python3 scripts/report_curve.py --md day     # docs/day_length.md 의 생성 블록
    python3 scripts/report_curve.py --md curve   # docs/curve.md 의 생성 블록
    python3 scripts/report_curve.py --md whatif  # docs/curve.md 의 가정 계산 블록

**이 파일은 아무것도 안 고친다.** 게임 자료를 바꾸는 일은 derive_game.js 와 앞 파생기들이 한다.
"""
import collections
import json
import os
import re
import statistics as st
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME = os.path.join(ROOT, "out", "game")
DATA = os.path.join(ROOT, "out", "data")

BANDS = [("A1", 1, 50), ("A2", 51, 100), ("B1", 101, 200), ("B2", 201, 288)]
EXTRA = [("1~48", 1, 48), ("전체", 1, 288)]
CLOCKED = 90  # 시계가 있는 블록 1 2 4 (40 + 30 + 20)
WORD = re.compile(r"[A-Za-z]+(?:'[A-Za-z]+)?")


def jl(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


class Year(object):
    """288세션을 읽어 하루 소요와 새 낱말을 센다. 경로는 저장소 eng2p 한 곳이다."""

    def __init__(self, root=ROOT):
        g, d = os.path.join(root, "out", "game"), os.path.join(root, "out", "data")
        self.S = jl(os.path.join(g, "sessions.json"))["sessions"]
        self.C = {c["id"]: c for c in jl(os.path.join(d, "cards.json"))["items"]}
        T = jl(os.path.join(g, "transcripts.json"))
        self.T = {k: v for k, v in T.items() if k.startswith("lle")}
        self.AU = jl(os.path.join(g, "authored.json"))
        self.O = jl(os.path.join(g, "outings.json"))
        self._first()

    # ---- 하루 소요
    def block3(self, s):
        t = sum(self.C[c]["minutes"] for c in s["cards"])
        r = sum(self.C[c]["minutes"] for c in s["review"])
        return t, r

    def rows(self):
        out = []
        for s in self.S:
            t, r = self.block3(s)
            out.append({"s": s["s"], "today": t, "review": r, "b3": t + r, "day": CLOCKED + t + r,
                        "cards": len(s["cards"]) + len(s["review"])})
        return out

    # ---- 새 낱말
    @staticmethod
    def toks(lines):
        out = []
        for l in lines:
            txt = l.split(":", 1)[1] if ":" in l else l
            out += WORD.findall(txt.lower())
        return out

    def card_words(self, c):
        out = []
        for x in (self.C[c]["a"].get("material") or []):
            if isinstance(x, str):
                out += WORD.findall(x)
            elif isinstance(x, dict):
                for v in x.values():
                    if isinstance(v, str):
                        out += WORD.findall(v)
        return [w.lower() for w in out]

    def _first(self):
        um = {m["id"]: m["unlock"]["session"] for m in self.O["missions"]}
        self.firstmedia, self.firstcard = {}, {}
        for s in self.S:
            self.firstmedia.setdefault(s["media"], s["s"])
            for c in s["cards"]:
                self.firstcard.setdefault(c, s["s"])
        self.card_first = {}
        for c, f in self.firstcard.items():
            for w in set(self.card_words(c)):
                self.card_first[w] = min(self.card_first.get(w, 10 ** 6), f)
        self.miss_first = {}
        for l in self.AU["lines"]:
            for w in WORD.findall(l["say"].lower()):
                self.miss_first[w] = min(self.miss_first.get(w, 10 ** 6), um[l["outing"]])
        self.lesson_words = {m: set(self.toks(self.T[m])) for m in self.T}
        self.media_first = {}
        for m, f in self.firstmedia.items():
            for w in self.lesson_words[m]:
                self.media_first[w] = min(self.media_first.get(w, 10 ** 6), f)
        self.first = {}
        for src in (self.media_first, self.card_first, self.miss_first):
            for w, f in src.items():
                self.first[w] = min(self.first.get(w, 10 ** 6), f)

    def band_new(self, lo, hi, first=None, src=None):
        first = first if first is not None else self.first
        n = hi - lo + 1
        if src is None:
            return sum(1 for f in first.values() if lo <= f <= hi) / n
        # 어느 출처가 처음 보인 낱말인가 (같은 날이면 녹음, 카드, 미션 차례)
        k = 0
        for w, f in first.items():
            if not lo <= f <= hi:
                continue
            for name, d in (("media", self.media_first), ("card", self.card_first), ("mission", self.miss_first)):
                if d.get(w) == f:
                    k += 1 if name == src else 0
                    break
        return k / n


def fmt(x, d=1):
    return ("%." + str(d) + "f") % x


def day_table(Y):
    """하루 소요 표 (md 줄들)."""
    R = Y.rows()
    head = ["| 구간 | 세션 | 오늘 카드 분 | 복습 분 | 블록 3 평균 | 블록 3 중앙 | 블록 3 최대 (세션) | 하루 평균 | 하루 최대 | 3시간 이상 | 4시간 이상 | 구간 합 시간 |",
            "|---|---|---|---|---|---|---|---|---|---|---|---|"]
    for name, lo, hi in BANDS + EXTRA:
        rs = [r for r in R if lo <= r["s"] <= hi]
        top = max(rs, key=lambda r: (r["b3"], -r["s"]))
        days = [r["day"] for r in rs]
        head.append("| %s | %d | %s | %s | %s | %d | %d (%d) | %s | %d | %d | %d | %d |" % (
            name, len(rs), fmt(st.mean(r["today"] for r in rs)), fmt(st.mean(r["review"] for r in rs)),
            fmt(st.mean(r["b3"] for r in rs)), int(st.median(r["b3"] for r in rs)), top["b3"], top["s"],
            fmt(st.mean(days), 0), max(days), sum(1 for d in days if d >= 180), sum(1 for d in days if d >= 240),
            round(sum(days) / 60.0)))
    return head


def day_facts(Y):
    R = Y.rows()
    tot = sum(r["day"] for r in R)
    plan = len(R) * 120
    mean = tot / float(len(R))
    top = sorted(R, key=lambda r: (-r["day"], r["s"]))[:10]
    cum, marks = 0, {}
    for r in R:
        cum += r["day"]
        for h in (100, 200, 400, 600):
            if cum >= h * 60 and h not in marks:
                marks[h] = r["s"]
    return {"mean": round(mean), "max": top[0]["day"], "maxS": top[0]["s"], "hours": round(tot / 60.0),
            "planHours": plan // 60, "pct": round(100.0 * tot / plan),
            "ge3": sum(1 for r in R if r["day"] >= 180), "ge4": sum(1 for r in R if r["day"] >= 240),
            "b3mean": round(st.mean(r["b3"] for r in R)), "top": top, "marks": marks,
            "b3total": sum(r["b3"] for r in R), "n": len(R)}


def f_table(Y):
    R = Y.rows()
    out = ["| 카드 분 배율 | 블록 3 평균 | 하루 평균 | 가장 긴 날 | 합 시간 | 계획 눈금 대비 |", "|---|---|---|---|---|---|"]
    for f in (1.0, 0.7, 0.5):
        b3 = [r["b3"] * f for r in R]
        days = [CLOCKED + x for x in b3]
        tot = sum(days)
        out.append("| %s | %s | %s | %s | %d | %d%% |" % (fmt(f), fmt(st.mean(b3), 0), fmt(st.mean(days), 0), fmt(max(days), 0),
                                                           round(tot / 60.0), round(100.0 * tot / (len(R) * 120))))
    return out


def md_day(Y):
    k = day_facts(Y)
    L = ["**288세션 합계.** 하루 평균 %d분, 가장 긴 날 %d분 (세션 %d), 3시간 이상인 날 %d일, 4시간 이상인 날 %d일. "
         "합은 %d시간이고 계획 눈금 %d시간의 %d%% 다." % (k["mean"], k["max"], k["maxS"], k["ge3"], k["ge4"], k["hours"], k["planHours"], k["pct"]),
         "", "| 번호 | 세션 | 하루 분 | 블록 3 분 | 카드 장수 |", "|---|---|---|---|---|"]
    for i, r in enumerate(k["top"], 1):
        L.append("| %d | %d | %d | %d | %d |" % (i, r["s"], r["day"], r["b3"], r["cards"]))
    L += [""] + day_table(Y) + [""]
    L += ["**등급 구간을 실제 누적 시간으로 다시 그으면.** 100시간에 닿는 세션 %d, 200시간 %d, 400시간 %d, 600시간 %s." % (
        k["marks"].get(100), k["marks"].get(200), k["marks"].get(400), k["marks"].get(600, "닿지 않음")), ""]
    L += f_table(Y)
    return "\n".join(L)


# ---------------------------------------------------------------------------------------------
# 난이도 곡선

def curve_rows(Y):
    R = {r["s"]: r for r in Y.rows()}
    rows = []
    for name, lo, hi in BANDS + EXTRA:
        n = hi - lo + 1
        fc = [c for c, f in Y.firstcard.items() if lo <= f <= hi]
        role = sum(1 for c in fc if Y.C[c]["type"] == "역할")
        ss = [s for s in Y.S if lo <= s["s"] <= hi]
        rows.append({
            "band": name, "n": n,
            "new": Y.band_new(lo, hi), "media": Y.band_new(lo, hi, src="media"),
            "card": Y.band_new(lo, hi, src="card"), "mission": Y.band_new(lo, hi, src="mission"),
            "lessons": sum(1 for s in Y.firstmedia.values() if lo <= s <= hi),
            "b3": st.mean(R[s]["b3"] for s in range(lo, hi + 1)),
            "fc": len(fc), "fcmin": st.mean(Y.C[c]["minutes"] for c in fc) if fc else 0.0,
            "role": 100.0 * role / len(fc) if fc else 0.0,
            "retell": st.mean(s["retell"]["total"] for s in ss),
        })
    return rows


def md_curve(Y):
    rows = curve_rows(Y)
    L = ["| 지표 | " + " | ".join(r["band"] for r in rows) + " |", "|---|" + "---|" * len(rows)]

    def line(label, key, d=1, suffix=""):
        L.append("| %s | %s |" % (label, " | ".join(fmt(r[key], d) + suffix for r in rows)))
    L.append("| 세션 수 | " + " | ".join(str(r["n"]) for r in rows) + " |")
    line("새 낱말 종류 / 세션 (녹음+카드+미션)", "new")
    line("  그중 녹음이 처음 낸 것", "media")
    line("  그중 카드 재료가 처음 낸 것", "card")
    line("  그중 나들이 미션이 처음 낸 것", "mission")
    L.append("| 새로 나오는 녹음 과 | " + " | ".join(str(r["lessons"]) for r in rows) + " |")
    line("블록 3 예상 소요 평균 (분)", "b3")
    L.append("| 처음 나온 카드 장수 | " + " | ".join(str(r["fc"]) for r in rows) + " |")
    line("처음 나온 카드 평균 분", "fcmin", 2)
    line("처음 나온 카드 중 역할형 (%)", "role", 0)
    line("블록 4 다시 말하기 합 (초)", "retell", 0)
    return "\n".join(L)


def need_rows(Y):
    """새 낱말 곡선을 내려가지 않게 하려면 구간마다 새 낱말 종류가 몇 개 더 필요한가 (가정 계산).

    목표 둘. (가) A1 수준에서 평평: 모든 구간이 A1 의 세션당 값 이상. (나) A2 수준에서 평평: A2 부터 B2 가 A2 의 값 이상.
    구간의 종류 수 = 세션당 값 곱하기 세션 수. 모자라는 만큼이 더 필요한 수다."""
    cur = {r["band"]: r for r in curve_rows(Y)}
    out = []
    for label, base in (("가) A1 수준으로 평평", "A1"), ("나) A2 수준으로 평평 (A2 부터)", "A2")):
        tgt = cur[base]["new"]
        k = {}
        order = [b[0] for b in BANDS]
        for name, lo, hi in BANDS:
            if order.index(name) <= order.index(base):
                k[name] = 0
                continue
            k[name] = max(0, int(round(tgt * (hi - lo + 1) - cur[name]["new"] * (hi - lo + 1) + 0.4999)))
        out.append((label, tgt, k))
    return out


def lle2_per_lesson(Y):
    """확장층 LLE2 30과가 핵심 어휘 밖에서 가져오는 새 낱말 종류 (이미 있는 실제 대본이다. 새로 지은 것이 아니다)."""
    p = os.path.join(DATA, "ext_radio.json")
    if not os.path.exists(p):
        return None
    r = jl(p)
    seen = set(Y.first)
    tot = n = 0
    for it in sorted([i for i in r["items"] if i.get("code") == "LLE2"], key=lambda i: (i["week"], i["id"])):
        ws = set()
        for l in it["lines"]:
            if l.get("sp") == "bot":
                continue
            ws |= set(WORD.findall((l.get("text") or "").lower()))
        tot += len(ws - seen)
        seen |= ws
        n += 1
    return tot, n


def mission_intro(Y):
    """나들이 미션 한 개가 처음 내는 낱말 종류 평균 (첫 공개 18개)."""
    per = collections.Counter()
    um = {m["id"]: m["unlock"]["session"] for m in Y.O["missions"]}
    for w, f in Y.miss_first.items():
        if Y.first.get(w) == f and Y.media_first.get(w, 10 ** 6) > f and Y.card_first.get(w, 10 ** 6) > f:
            per[f] += 1
    k = sum(per.values())
    return k, len(um)


def md_need(Y):
    cur = curve_rows(Y)
    L = ["| 목표 | 세션당 목표 | A2 에서 더 필요한 종류 | B1 | B2 | 합 |", "|---|---|---|---|---|---|"]
    ll = lle2_per_lesson(Y)
    for label, tgt, k in need_rows(Y):
        tot = sum(k.values())
        L.append("| %s | %s | %d | %d | %d | %d |" % (label, fmt(tgt), k["A2"], k["B1"], k["B2"], tot))
    L.append("")
    if ll:
        per = ll[0] / float(ll[1])
        L.append("**종류를 콘텐츠 개수로 바꾸면.** 확장층 LLE2 %d과는 핵심 어휘 밖의 새 낱말을 %d종 가져온다 (과당 %s종, 이미 있는 실제 대본)." % (ll[1], ll[0], fmt(per)))
        L.append("합 %d종은 그런 과로 약 %d과 어치다. 나들이 미션으로 채운다면 미션 하나가 처음 내는 낱말이 평균 %s종이라 약 %d개다 (지금 18개)." % (
            sum(need_rows(Y)[0][2].values()), round(sum(need_rows(Y)[0][2].values()) / per),
            fmt(mission_intro(Y)[0] / float(mission_intro(Y)[1])), round(sum(need_rows(Y)[0][2].values()) / (mission_intro(Y)[0] / float(mission_intro(Y)[1])))))
    return "\n".join(L)


# ---------------------------------------------------------------------------------------------
# 가정 계산: 녹음 과를 강에 다르게 붙이면 (적용하지 않았다)

def unit_of(s):
    return s["lecture"] if s["lecture"] is not None else s["revisit"][0]


def whatif(Y, intro_counts):
    """강(unit)마다 붙는 녹음 과를 다시 정하면 구간별 새 낱말이 어떻게 되나. **자료는 안 바꾼다.**

    과는 '앞 카드와 미션이 이미 낸 낱말을 빼고 새 낱말이 적은 것부터' 순서로 새로 들어온다.
    구간마다 새로 들어오는 과 수가 intro_counts 이고, 그 구간의 강 중 고르게 떨어진 자리에 들어온다.
    들어오지 않는 강은 이미 들어온 과를 차례로 되풀이한다. 강과 카드와 세션은 그대로다."""
    S = Y.S
    ufirst = {}
    for s in S:
        ufirst.setdefault(unit_of(s), s["s"])
    units = sorted(ufirst, key=lambda u: ufirst[u])

    def band(sn):
        for n, lo, hi in BANDS:
            if lo <= sn <= hi:
                return n
    seen = set(w for w, f in Y.card_first.items() if f <= 50) | set(Y.miss_first)
    rest, order = set(Y.T), []
    s2 = set(seen)
    while rest:
        m = min(rest, key=lambda m: (len(Y.lesson_words[m] - s2), m))
        order.append(m)
        s2 |= Y.lesson_words[m]
        rest.discard(m)
    byb = collections.OrderedDict((b[0], []) for b in BANDS)
    for u in units:
        byb[band(ufirst[u])].append(u)
    F, k, intro = {}, 0, []
    for (b, lo, hi), nb in zip(BANDS, intro_counts):
        us = byb[b]
        pos = set(int(round(i * len(us) / float(nb))) for i in range(nb))
        j = 0
        for i, u in enumerate(us):
            if i in pos and k < len(order):
                F[u] = order[k]
                intro.append(order[k])
                k += 1
            else:
                F[u] = intro[j % len(intro)]
                j += 1
    mf = {}
    for s in S:
        mf.setdefault(F[unit_of(s)], s["s"])
    fw = dict(Y.card_first)
    for w, f in Y.miss_first.items():
        fw[w] = min(fw.get(w, 10 ** 6), f)
    for m, f in mf.items():
        for w in Y.lesson_words[m]:
            fw[w] = min(fw.get(w, 10 ** 6), f)
    return [Y.band_new(lo, hi, first=fw) for _, lo, hi in BANDS], len(mf)


WHATIF = [(12, 11, 13, 16), (6, 10, 16, 20), (4, 6, 16, 26)]


def md_whatif(Y):
    L = ["| 구간마다 새로 들어오는 과 (A1 A2 B1 B2) | A1 | A2 | B1 | B2 | 쓰인 과 |", "|---|---|---|---|---|---|"]
    cur = [r["new"] for r in curve_rows(Y)[:4]]
    L.append("| 지금 (12 11 13 16) | " + " | ".join(fmt(x) for x in cur) + " | 52 |")
    for n in WHATIF[1:]:
        v, used = whatif(Y, n)
        L.append("| %s | %s | %d |" % (" ".join(map(str, n)), " | ".join(fmt(x) for x in v), used))
    return "\n".join(L)


def main():
    Y = Year()
    a = sys.argv[1:]
    if a[:1] == ["--md"] and len(a) > 1:
        print({"day": md_day, "curve": md_curve, "need": md_need, "whatif": md_whatif}[a[1]](Y))
        return 0
    print(md_day(Y))
    print()
    print(md_curve(Y))
    print()
    print(md_need(Y))
    print()
    print(md_whatif(Y))
    return 0


if __name__ == "__main__":
    sys.exit(main())
