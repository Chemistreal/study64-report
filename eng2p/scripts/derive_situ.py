#!/usr/bin/env python3
"""한 사람만 본다 판이 쓸 **상황 카드**를 역할형 카드에서 뽑는다. T288

규칙서 7.1 이 쓰는 것을 "역할형 카드 105장. **있다.** 5요소가 그대로 있다"
라고 적었다. 세어 보니 맞다. **105장 다 다섯 요소가 채워져 있다.**

## 그런데 B면이 상황을 그대로 들고 있다

이 판의 시작 조건이 "상황 카드 한 장이 **A 화면에만** 떴다" 다.
B는 물어서 알아내야 한다.

카드를 열어 보면 B면에도 같은 다섯 요소가 있다. **105장 전부 그렇다.**
카드가 원래 역할극용이라 둘 다 상황을 아는 것이 맞았다.
이 판은 그것을 정보 격차로 뒤집는다.

그리고 B면 지시가 요소를 흘린다.

    "중립 거리로 요청한다"          -> 레지스터를 흘린다
    "시간을 한 번 말하고 고친다"    -> 목적을 흘린다

**그래서 B면을 안 싣는다.** 화면에서 가리는 것이 아니라 자료에 안 담는다.
안 실으면 안 샌다. 가리는 것은 잊을 수 있고 안 담은 것은 잊을 것이 없다.

## 스무 강까지 이 판이 안 열린다

역할형 카드는 Q1 에 열 장인데 그 열 장이 **20강부터** 나온다.
19강까지는 한 장도 없다. 열 주다.

3초 벽(T282)은 다섯 강이었고 이쪽은 열아홉 강이다.
**자료가 적은 것과 늦게 오는 것이 다르다.** 이 판은 늦게 온다.

## 숫자를 여기에 안 적는다

둘은 규칙서 7.1 의 도는 차례 칸에 있고 셋은 `play_data.md` 6.1 의 D1 에 있다.
다섯 요소의 이름은 `CLAUDE.md` 카드 5유형에 있다. 셋 다 읽는다.
못 찾으면 **실패로 낸다.**

쓰는 법:
    python3 scripts/derive_situ.py

결과: out/data/situ.json 과 situ.js
규격: docs/play_rules.md 7.1, docs/play_data.md 6.1
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "out", "data")
RULES = os.path.join(ROOT, "docs", "play_rules.md")
DATADOC = os.path.join(ROOT, "docs", "play_data.md")
GUIDE = os.path.join(ROOT, "CLAUDE.md")

# 몇을 알아내나. 규칙서가 "둘" 이라고 적었고 앱은 2가 필요하다.
KO = {"한": 1, "둘": 2, "셋": 3, "넷": 4, "다섯": 5}
# 몇 번까지 쓰나. D1 이 "셋째 판까지" 라고 적었다.
ORD = {"첫": 1, "둘": 2, "셋": 3, "넷": 4, "다섯": 5}

# 요소 이름과 카드 자료의 칸을 잇는다. **이름은 문서에서 오고 칸은 여기 있다.**
# 문서가 이름을 바꾸면 여기서 못 찾고 실패로 난다. 조용히 넘어가지 않는다.
FIELD = {
    "상황": "situation",
    "관계": "relation",
    "목적": "purpose",
    "레지스터": "register",
    "종료 조건": "endCondition",
}

QORDER = ["Q1", "Q2", "Q3", "Q4"]


def plain(s):
    """화면으로 가는 글에서 마크다운 표시를 뺀다.

    **T265 에서 겪은 자리다.** 자료는 문서가 아니라 화면으로 간다.
    화면은 `**` 를 굵게 그리지 않고 별 둘을 그대로 그린다.
    그때는 한 파생기만 고쳤고 그 뒤에 만든 파생기가 같은 것을 또 흘렸다.
    """
    return (s or "").replace("**", "")


def spec():
    bad = []
    need = most = None
    parts = []

    if os.path.exists(RULES):
        seg = io.open(RULES, encoding="utf-8").read()
        i = seg.find("### 7.1 한 사람만 본다")
        j = seg.find("### 7.2", i + 1) if i >= 0 else -1
        m = re.search(r"다섯 요소 중 \*?\*?(%s)\*?\*?을 알아내면"
                      % "|".join(KO), seg[i:j] if i >= 0 else "")
        if m:
            need = KO[m.group(1)]
    if not need:
        bad.append("규칙서 7.1 의 도는 차례에서 몇을 알아내는지 못 찾았다")

    if os.path.exists(DATADOC):
        m = re.search(r"(%s)째 판까지 돌면" % "|".join(ORD),
                      io.open(DATADOC, encoding="utf-8").read())
        if m:
            most = ORD[m.group(1)]
    if not most:
        bad.append("play_data.md 의 D1 에서 몇 번까지 쓰는지 못 찾았다")

    if os.path.exists(GUIDE):
        m = re.search(r"역할형은 (.+?) 5요소 필수",
                      io.open(GUIDE, encoding="utf-8").read())
        if m:
            for name in [x.strip() for x in m.group(1).split(",")]:
                if name not in FIELD:
                    bad.append("요소 이름 '%s' 를 카드 칸에 못 잇는다" % name)
                else:
                    parts.append({"key": FIELD[name], "name": name})
    if len(parts) != 5:
        bad.append("CLAUDE.md 에서 다섯 요소를 못 찾았다: %d개" % len(parts))

    return need, most, parts, bad


def main():
    need, most, parts, bad = spec()
    for path in ("cards.json", "index.json"):
        if not os.path.exists(os.path.join(OUT, path)):
            bad.append("out/data/%s 가 없다. derive_data.py 를 먼저 돌린다" % path)
    if bad:
        for b in bad:
            print("[실패] " + b)
        return 1

    cards = json.load(io.open(os.path.join(OUT, "cards.json"),
                              encoding="utf-8"))["items"]
    weeks = json.load(io.open(os.path.join(OUT, "index.json"),
                              encoding="utf-8"))["weeks"]

    pool, holes = [], []
    for c in cards:
        if c.get("type") != "역할":
            continue
        a = c.get("a") or {}
        vals = {}
        for p in parts:
            v = plain((a.get(p["key"]) or "").strip())
            if not v:
                holes.append(c["id"] + ":" + p["name"])
            vals[p["key"]] = v
        # **B면을 안 담는다.** 담고 나서 가리면 가리는 것을 잊을 수 있다.
        pool.append({
            "id": c["id"], "no": c["no"], "q": c["quarter"],
            "parts": vals,
            "ins": plain(a.get("instruction", "")),
            "pass": plain(a.get("pass", "")),
        })
    pool.sort(key=lambda c: (QORDER.index(c["q"]), c["no"]))

    if holes:
        print("[실패] 요소가 빈 자리 %d곳: %s" % (len(holes), " ".join(holes[:8])))
        return 1
    if len(pool) < need:
        print("[실패] 역할형 카드가 %d장이다. %d을 알아내는 판이 안 돈다"
              % (len(pool), need))
        return 1

    # 그날 강까지 한 장도 없는 강. **적은 것이 아니라 아직 안 나온 것이다.**
    short = []
    for w in weeks:
        for L in w.get("lectures", []):
            cd = L.get("cards")
            if not cd:
                continue
            n = 0
            for c in pool:
                qi, li = QORDER.index(c["q"]), QORDER.index(w["quarter"])
                if qi < li or (qi == li and c["no"] <= cd["to"]):
                    n += 1
            if n < 1:
                short.append({"lecture": L["no"], "week": w["week"], "have": n})

    obj = {
        "note": "한 사람만 본다가 쓸 상황 카드. 역할형 카드의 A면에서 뽑는다. "
                "B면은 안 담는다. scripts/derive_situ.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "카드 파일 열둘이 다 신뢰도 B 다. 다섯 요소를 요구하는 것은 "
                    "기준서 8.1 이지만 그 칸을 채운 한국어와 상황은 카드가 진 "
                    "등급을 그대로 진다.",
        "generator": "scripts/derive_situ.py",
        "source": "out/cards/ (역할형), docs/play_rules.md 7.1, "
                  "docs/play_data.md 6.1",
        "need": need, "most": most,
        "parts": parts,
        "short": short,
        "cards": pool,
    }
    io.open(os.path.join(OUT, "situ.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "situ.js"), "w", encoding="utf-8").write(
        "window.ENG2P_SITU=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    per = {}
    for c in pool:
        per[c["q"]] = per.get(c["q"], 0) + 1
    print("out/data/situ.json / 상황 %d장 (%s) / 다섯 요소 중 %d개를 알아내고 "
          "한 장을 %d번까지 쓴다 / **B면을 안 담았다** / 한 장도 없는 강 %d개"
          % (len(pool), " ".join("%s %d" % (q, per.get(q, 0)) for q in QORDER),
             need, most, len(short)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
