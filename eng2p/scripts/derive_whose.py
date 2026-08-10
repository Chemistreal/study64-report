#!/usr/bin/env python3
"""누구 말이야 판이 쓸 **쓸 자리**를 역할형 카드에서 뽑는다. T294

규칙서 7.3 이 쓰는 것을 "역할형 카드의 register 세 값. **있다**" 라고 적었다.
있다. 105장에 다 붙어 있다.

## 그런데 이 판은 그 값을 화면에 못 준다

판정 칸이 "**판정하는 사람.** 앱은 정답을 안 준다" 다.
못 했을 때 칸이 "둘의 생각이 갈리면 갈렸다고 적고 넘어간다" 다.

**격식은 답이 하나가 아니다.** 카드에 적힌 register 는 내가 고른 값이고
그것을 정답으로 내면 이 판이 재는 것이 "내 생각을 맞히기" 가 된다.
둘이 갈리는 것이 이 판의 산출물인데 정답이 있으면 갈릴 자리가 없어진다.

## 그래서 register 를 안 담는다

T288 에 상황 카드의 B면을 안 담은 것과 같다. **안 실으면 안 샌다.**
`situ.js` 는 register 를 담고 있으니 이 판이 그것을 읽으면 안 된다.
파일을 따로 뽑는 이유가 그것이다.

담고 나서 화면이 안 그리는 것과 아예 안 담는 것이 다르다.
화면은 앞으로 여러 번 고쳐지고 고치다 한 번 빠뜨리면 그날 샌다.

파생기가 마지막에 **세 값의 이름이 나간 글자 어디에도 없는지**를 본다.
있으면 실패로 낸다.

쓰는 법:
    python3 scripts/derive_whose.py

결과: out/data/whose.json 과 whose.js
규격: docs/play_rules.md 7.3
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

QORDER = ["Q1", "Q2", "Q3", "Q4"]


def plain(s):
    """화면으로 가는 글에서 마크다운 표시를 뺀다 (T265, T292)."""
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
    bad = []
    if not os.path.exists(RULES):
        return None, ["%s 가 없다" % RULES]
    doc = io.open(RULES, encoding="utf-8").read()
    seg = chapter(doc, "### 7.3 누구 말이야", "## 8")
    out = {}
    for c in cells(seg):
        if len(c) < 2:
            continue
        if c[0] == "끝 조건":
            m = re.search(r"(%s)\s*벌을 돌면" % KOPAT, c[1])
            if m:
                out["rounds"] = KO[m.group(1)]
    if "rounds" not in out:
        bad.append("규칙서 7.3 의 끝 조건에서 몇 벌을 도는지 못 찾았다")

    # 세 값의 이름. **7.2 가 적어 둔 그 이름이다.** 두 판이 같은 셋을 쓴다
    m = re.search(r"register 는 (\S+) (\S+) (\S+) 세 값이다",
                  chapter(doc, "### 7.2 파장", "### 7.3"))
    out["regs"] = list(m.groups()) if m else []
    if len(out["regs"]) != 3:
        bad.append("규칙서 7.2 에서 register 세 값의 이름을 못 찾았다")

    # 7.3 이 적어 둔 장수
    # **괄호 첫째를 집지 않는다.** 칸에 "(T294)" 같은 것이 먼저 온다.
    # 이름과 수가 세 쌍 나오는 자리를 찾는다. 못 찾으면 실패로 낸다.
    said = {}
    for line in seg.split("\n"):
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
    pool, seen = [], {}
    for c in cards:
        if c.get("type") != "역할":
            continue
        a = c.get("a") or {}
        v = (a.get("register") or "").strip()
        if v:
            seen[v] = seen.get(v, 0) + 1
        where = plain((a.get("situation") or "").strip())
        who = plain((a.get("relation") or "").strip())
        if not where or not who:
            print("[실패] %s 에 상황이나 관계가 비었다" % c["id"])
            return 1
        # **register 를 안 담는다.** 이 판의 정답이 될 값이다
        pool.append({"id": c["id"], "no": c["no"], "q": c["quarter"],
                     "where": where, "who": who})
    pool.sort(key=lambda c: (QORDER.index(c["q"]), c["no"]))

    for name, n in sp["said"].items():
        if seen.get(name) != n:
            print("[실패] 규칙서 7.3 은 %s 를 %d장이라 적었는데 카드에는 %s장이다"
                  % (name, n, seen.get(name, "0")))
            return 1
    if len(pool) < sp["rounds"]:
        print("[실패] 쓸 자리가 %d개다. %d벌을 못 돈다" % (len(pool), sp["rounds"]))
        return 1

    obj = {
        "note": "누구 말이야가 쓸 자리. 역할형 카드의 상황과 관계에서 뽑는다. "
                "register 는 안 담는다. 이 판에는 정답이 없다. "
                "손으로 안 고친다. scripts/derive_whose.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "카드 파일 열둘이 다 신뢰도 B 다. 그 자리에 어느 격식이 맞는가는 "
                    "이 자료가 말하지 않는다. 두 사람이 정하고 갈리면 갈렸다고 적는다.",
        "generator": "scripts/derive_whose.py",
        "source": "out/cards/ (역할형 상황과 관계), docs/play_rules.md 7.3",
        "rounds": sp["rounds"],
        "regs": [plain(x) for x in sp["regs"]],
        "sets": pool,
    }

    # **세 값이 나간 글자 어디에도 없어야 한다.** 담고 안 그리는 것과 다르다
    blob = json.dumps(obj["sets"], ensure_ascii=False)
    for name in obj["regs"]:
        if name in blob:
            print("[실패] 쓸 자리 글에 '%s' 가 들어 있다. 이 판에는 정답이 없다" % name)
            return 1

    io.open(os.path.join(OUT, "whose.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "whose.js"), "w", encoding="utf-8").write(
        "window.ENG2P_WHOSE=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    per = {}
    for c in pool:
        per[c["q"]] = per.get(c["q"], 0) + 1
    print("out/data/whose.json / 쓸 자리 %d개 (%s) / 한 판에 %d벌 / "
          "고를 것 %s / **정답을 안 담았다**"
          % (len(pool), " ".join("%s %d" % (q, per.get(q, 0)) for q in QORDER),
             sp["rounds"], " ".join(obj["regs"])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
