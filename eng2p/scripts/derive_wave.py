#!/usr/bin/env python3
"""파장 판의 **격식 눈금**을 만든다. T291

규칙서 7.2 가 쓰는 것을 "역할형 카드의 register 세 값 + **사이를 채운 다섯 칸.
늘려야 한다**" 라고 적었다. 앞은 있고 뒤는 없다.

## 늘리는 것이지 짓는 것이 아니다

register 는 친근 중립 격식 셋이고 카드에 그대로 붙어 있다.
셋으로는 "한 칸 안이면 닿은 것" 이라는 판정이 뜻이 없다.
셋 사이에 중간을 넣어 다섯으로 만든다. 1과 3과 5가 그 세 값이다.

**2와 4에 새 이름을 안 짓는다.** 이웃 둘의 이름을 붙여 "친근과 중립 사이" 라고 적는다.
지어낸 이름을 붙이면 두 사람이 그 이름이 무엇인지를 물어야 하고
나는 그 답을 모른다. **모르는 것을 이름으로 만들지 않는다.**

## 세 값의 장수를 규칙서와 대 본다

규칙서 7.3 이 "(격식 48 친근 35 중립 22)" 라고 적어 뒀다.
카드에서 다시 세어 그 셋과 견준다. 어긋나면 **실패로 낸다.**
카드가 늘거나 줄면 그 줄도 같이 고쳐야 한다는 것을 여기서 알린다.

## 등급은 B다

카드가 B등급이고 (신뢰도 B) **사이 칸이 내 판단이다.**
격식이 다섯 단으로 고르게 벌어져 있다는 근거가 없다.
있는 것은 세 값이고 나머지는 이 판이 돌게 하려고 넣은 자리다.

쓰는 법:
    python3 scripts/derive_wave.py

결과: out/data/wave.json 과 wave.js
규격: docs/play_rules.md 7.2, 7.3
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

KO = {"한": 1, "두": 2, "세": 3, "네": 4, "다섯": 5,
      "여섯": 6, "일곱": 7, "여덟": 8, "아홉": 9, "열": 10}
KOPAT = "|".join(sorted(KO, key=len, reverse=True))


def plain(s):
    """화면으로 가는 글에서 마크다운 표시를 뺀다.

    **T265 에서 겪은 자리다.** 자료는 문서가 아니라 화면으로 간다.
    화면은 `**` 를 굵게 그리지 않고 별 둘을 그대로 그린다.
    그때는 한 파생기만 고쳤고 그 뒤에 만든 파생기가 같은 것을 또 흘렸다.
    """
    return (s or "").replace("**", "")


def chapter(text, head, tail):
    i = text.find(head)
    if i < 0:
        return ""
    j = text.find(tail, i + len(head))
    return text[i:j if j > 0 else len(text)]


def cells(seg):
    out = []
    for line in seg.split("\n"):
        line = line.strip()
        if not line.startswith("|") or "---" in line:
            continue
        out.append([c.strip() for c in line.strip("|").split("|")])
    return out


def spec():
    """규칙서 7.2 에서 눈금과 판정 폭을 읽는다."""
    bad = []
    if not os.path.exists(RULES):
        return None, ["%s 가 없다" % RULES]
    doc = io.open(RULES, encoding="utf-8").read()
    seg = chapter(doc, "### 7.2 파장", "### 7.3")
    out = {}

    # 몇 점을 도나. 끝 조건 칸에 있다
    for c in cells(seg):
        if len(c) < 2:
            continue
        if c[0] == "끝 조건":
            m = re.search(r"(%s)\s*점을 돌면" % KOPAT, c[1])
            if m:
                out["points"] = KO[m.group(1)]
        if c[0] == "판정":
            m = re.search(r"(%s)\s*칸 안이면" % KOPAT, c[1].replace("**", ""))
            if m:
                out["near"] = KO[m.group(1)]
        if c[0] == "못 했을 때":
            m = re.search(r"(%s)\s*칸 넘게 벌어지면" % KOPAT, c[1].replace("**", ""))
            if m:
                out["far"] = KO[m.group(1)]
    for k, why in (("points", "끝 조건에서 몇 점을 도는지"),
                   ("near", "판정에서 몇 칸 안이 닿은 것인지"),
                   ("far", "못 했을 때에서 몇 칸 넘게가 다시 하는 것인지")):
        if k not in out:
            bad.append("규칙서 7.2 의 %s 를 못 찾았다" % why)

    # 세 값의 이름과 그 이름이 앉는 자리
    m = re.search(r"register 는 (\S+) (\S+) (\S+) 세 값이다", seg)
    names = list(m.groups()) if m else []
    m = re.search(r"(\d+)과 (\d+)과 (\d+)가 그 세 값이다", seg)
    at = [int(x) for x in m.groups()] if m else []
    m = re.search(r"중간을 넣어 (%s)\s*칸으로 만든다" % KOPAT, seg.replace("**", ""))
    size = KO[m.group(1)] if m else None

    if len(names) != 3:
        bad.append("규칙서 7.2 에서 register 세 값의 이름을 못 찾았다")
    if len(at) != 3:
        bad.append("규칙서 7.2 에서 세 값이 앉는 자리를 못 찾았다")
    if not size:
        bad.append("규칙서 7.2 에서 눈금이 몇 칸인지 못 찾았다")
    if names and at and size:
        if sorted(at) != at:
            bad.append("세 값의 자리가 오름차순이 아니다: %s" % at)
        if at[0] != 1 or at[-1] != size:
            bad.append("세 값이 눈금의 양끝에 안 앉았다: %s / %d칸" % (at, size))
    out["names"], out["at"], out["size"] = names, at, size

    # 규칙서 7.3 이 적어 둔 장수. **여기가 카드와 어긋나는 자리다**
    # **괄호 첫째를 집지 않는다.** 칸에 "(T294)" 같은 것이 먼저 온다.
    # 이름과 수가 세 쌍 나오는 자리를 찾는다. 못 찾으면 실패로 낸다.
    said = {}
    for line in chapter(doc, "### 7.3", "## 8").split("\n"):
        got = re.findall(r"([가-힣]+)\s+(\d+)", line.replace("**", ""))
        if len(got) == 3:
            said = {a: int(b) for a, b in got}
            break
    if len(said) != 3:
        bad.append("규칙서 7.3 에서 세 값의 장수를 못 찾았다")
    out["said"] = said
    return out, bad


def main():
    sp, bad = spec()
    if not os.path.exists(os.path.join(OUT, "cards.json")):
        bad.append("out/data/cards.json 이 없다. derive_data.py 를 먼저 돌린다")
    if bad:
        for b in bad:
            print("[실패] " + b)
        return 1

    cards = json.load(io.open(os.path.join(OUT, "cards.json"),
                              encoding="utf-8"))["items"]
    seen = {}
    for c in cards:
        if c.get("type") != "역할":
            continue
        v = ((c.get("a") or {}).get("register") or "").strip()
        if v:
            seen[v] = seen.get(v, 0) + 1

    # 규칙서가 적어 둔 장수와 카드에서 센 장수를 견준다
    for name, n in sp["said"].items():
        if seen.get(name) != n:
            print("[실패] 규칙서 7.3 은 %s 를 %d장이라 적었는데 카드에는 %s장이다"
                  % (name, n, seen.get(name, "0")))
            return 1
    for name in sp["names"]:
        if name not in seen:
            print("[실패] register 값 '%s' 가 카드에 하나도 없다" % name)
            return 1
    if len(seen) != len(sp["names"]):
        print("[실패] 카드의 register 값이 %d가지다. 규칙서는 %d가지라고 적었다: %s"
              % (len(seen), len(sp["names"]), " ".join(sorted(seen))))
        return 1

    # 눈금. 1과 3과 5가 세 값이고 2와 4는 **이웃 둘의 이름을 붙인다**
    anchor = dict(zip(sp["at"], sp["names"]))
    steps = []
    for n in range(1, sp["size"] + 1):
        if n in anchor:
            steps.append({"n": n, "name": plain(anchor[n]), "anchor": True,
                          "cards": seen[anchor[n]]})
        else:
            lo = max([x for x in anchor if x < n] or [None])
            hi = min([x for x in anchor if x > n] or [None])
            if lo is None or hi is None:
                print("[실패] %d칸의 이웃을 못 찾았다" % n)
                return 1
            # **새 이름을 안 짓는다.** 이웃 둘을 그대로 붙인다
            steps.append({"n": n,
                          "name": plain("%s과 %s 사이" % (anchor[lo], anchor[hi])),
                          "anchor": False, "cards": 0})

    obj = {
        "note": "파장이 쓸 격식 눈금. 세 값은 카드에서, 자리와 폭은 "
                "docs/play_rules.md 7.2 에서 온다. 사이 칸은 이웃 둘을 붙인 것이다. "
                "손으로 안 고친다. scripts/derive_wave.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "카드가 신뢰도 B 이고 사이 칸이 내 판단이다. 격식이 다섯 단으로 "
                    "고르게 벌어져 있다는 근거가 없다. 있는 것은 세 값이고 나머지는 "
                    "한 칸 안 판정이 뜻을 갖게 하려고 넣은 자리다.",
        "generator": "scripts/derive_wave.py",
        "source": "out/cards/ (역할형 register), docs/play_rules.md 7.2 와 7.3",
        "size": sp["size"], "points": sp["points"],
        "near": sp["near"], "far": sp["far"],
        "steps": steps,
    }
    io.open(os.path.join(OUT, "wave.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "wave.js"), "w", encoding="utf-8").write(
        "window.ENG2P_WAVE=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    print("out/data/wave.json / 눈금 %d칸 (%s) / 세 값은 카드에서 세었다 (%s) / "
          "%d점을 돌고 %d칸 안이면 닿은 것 %d칸 넘으면 다시"
          % (sp["size"],
             " ".join(("[%d]" % s["n"]) if s["anchor"] else str(s["n"])
                      for s in steps),
             " ".join("%s %d" % (k, seen[k]) for k in sp["names"]),
             sp["points"], sp["near"], sp["far"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
