#!/usr/bin/env python3
"""거꾸로 판정 판이 쓸 카드를 뽑는다. **정답을 안 담는다.** T306

규칙서 8.1 이 이렇게 적었다.

    B가 답한다. **A 화면에는 정답이 아니라 기준만 있다.** A가 기준으로 본다

그리고 쓰는 것 칸에 "`pass` 가 있는 카드. 600장 전부에 있다" 라고 적었다.
`play_data.md` 2.3 이 그 600을 셌고 셈은 맞다.

## 그런데 600장은 이 판이 쓸 수 있는 카드의 수가 아니다

`pass` 는 어느 카드에나 있다. **감출 것은 `pass` 가 아니라 `answer` 다.**
정답이 없는 카드에서 정답을 빼면 아무것도 안 빠진다. A 화면은 그대로고
판은 여느 드릴과 구별이 안 된다. **거꾸로 갈 것이 없다.**

D2 가 "판정형은 Q2 이후 65장뿐이라 판정형에만 매지 않는다" 라고 늘렸다.
늘린 것은 맞는데 늘린 자리가 틀렸다. `pass` 로 늘리면 228장이 되고
그중 160장은 감출 것이 없다. `answer` 로 늘리면 예순여덟이다.

**예순다섯에서 예순여덟이 됐다.** D2 가 늘린 것은 셋이다.

## 정답이 `answer` 에만 있는 것이 아니다

`note` 를 열어 보면 정답을 그대로 적은 장이 있다.

    Q2-026  answer: 1) 맞음 2) 안 맞음 3) 안 맞음 4) 맞음 5) 맞음
            note  : 2번과 3번은 방향이 어긋난 것이다

`answer` 만 빼고 `note` 를 두면 감춘 척만 하는 것이다. **둘 다 안 담는다.**

## 안 담았는지를 이 파일이 다시 센다

`derive_whose.py` 가 T294 에 한 것과 같다. 안 담기로 한 값이 나간 글자
어디에도 없는지를 마지막에 본다. 있으면 실패로 낸다.
**안 실으면 안 샌다.** 화면이 실수해도 샐 것이 없다.

쓰는 법:
    python3 scripts/derive_flip.py

결과: out/data/flip.json 과 flip.js
규격: docs/play_rules.md 8.1, docs/play_data.md 23장
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

KO = {"한": 1, "두": 2, "세": 3, "서": 3, "네": 4, "넉": 4, "다섯": 5,
      "여섯": 6, "일곱": 7, "여덟": 8, "아홉": 9, "열": 10}
KOPAT = "|".join(sorted(KO, key=len, reverse=True))

QORDER = ["Q1", "Q2", "Q3", "Q4"]

# **안 담는 칸.** 이 이름이 곧 이 파일의 일이다
HIDE = ("answer", "note")

# 기준이 **가르는 말인가 셈인가.** T307 에 화면을 짜다가 알았다.
#
#     B가 5개 중 4개 이상 맞히면 성공.        <- 셈이다. 무엇이 맞음인지 안 적혀 있다
#     B가 5개 중 4개 이상에서 앞의 것을 고르면 성공.   <- 가른다
#
# 앞엣것을 든 A는 기준으로 못 가른다. **아는 것으로 가르거나 못 가른다고 적는다.**
# 규칙서 8.1 의 못 했을 때 칸이 그 자리를 이미 열어 뒀다.
# 화면이 둘을 갈라 보여 준다. 안 가르면 A가 기준을 읽고 아무것도 못 얻는다.
BARE = re.compile(r"^(B가\s*)?\d+개 중 \d+개(\s*이상)?(을|를)?\s*"
                  r"(다\s*)?(맞히면|맞으면)?\s*성공\.?$")


def plain(s):
    """화면으로 가는 글에서 마크다운 표시를 뺀다 (T292)."""
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


def firstq():
    """몇 분기부터 도는가. **Q1 문법은 0퍼센트다.** 규칙서 13.3 이 원본이다."""
    if not os.path.exists(RULES):
        return None, ["%s 가 없다" % RULES]
    m = re.search(r"거꾸로 판정은 문법 트랙이다.*?이 판은 (Q\d) 부터 돈다",
                  io.open(RULES, encoding="utf-8").read(), re.S)
    if not m:
        return None, ["규칙서 13.3 에서 몇 분기부터 도는지 못 찾았다"]
    return m.group(1), []


def pooldoc():
    """무엇을 쓰는가. **문서가 원본이다** (T279). 못 찾으면 실패로 낸다."""
    if not os.path.exists(DATADOC):
        return None, ["%s 가 없다" % DATADOC]
    m = re.search(r"거꾸로 판정 판은 (\S+) 가 있는 카드만 쓴다",
                  io.open(DATADOC, encoding="utf-8").read())
    if not m:
        return None, ["play_data.md 에서 이 판이 쓰는 카드의 조건을 못 찾았다"]
    return m.group(1).strip("`"), []


def spec():
    """규칙서 8.1 에서 끝 조건과 역할이 바뀌는 자리를 읽는다."""
    if not os.path.exists(RULES):
        return None, None, ["%s 가 없다" % RULES]
    seg = chapter(io.open(RULES, encoding="utf-8").read(),
                  "### 8.1 거꾸로 판정", "## 9.")
    end = swap = None
    for c in cells(seg):
        if len(c) < 2:
            continue
        if c[0] == "끝 조건":
            m = re.search(r"(%s)\s*장을 돌면" % KOPAT, c[1].replace("**", ""))
            if m:
                end = KO[m.group(1)]
        if c[0] == "역할":
            m = re.search(r"(%s)\s*장마다 바뀐다" % KOPAT, c[1].replace("**", ""))
            if m:
                swap = KO[m.group(1)]
    bad = []
    if not end:
        bad.append("규칙서 8.1 의 끝 조건에서 도는 장수를 못 찾았다")
    if not swap:
        bad.append("규칙서 8.1 의 역할 칸에서 바뀌는 장수를 못 찾았다")
    return end, swap, bad


def main():
    end, swap, bad = spec()
    q0, qbad = firstq()
    key, kbad = pooldoc()
    bad += qbad + kbad
    for path in ("cards.json", "index.json"):
        if not os.path.exists(os.path.join(OUT, path)):
            bad.append("out/data/%s 가 없다. derive_data.py 를 먼저 돌린다" % path)
    if bad:
        for b in bad:
            print("[실패] " + b)
        return 1
    if key not in HIDE:
        print("[실패] play_data.md 가 쓰는 조건을 %s 라고 적었는데 "
              "이 파일이 안 담는 칸은 %s 다" % (key, " ".join(HIDE)))
        return 1

    cards = json.load(io.open(os.path.join(OUT, "cards.json"),
                              encoding="utf-8"))["items"]
    weeks = json.load(io.open(os.path.join(OUT, "index.json"),
                              encoding="utf-8"))["weeks"]

    qi0 = QORDER.index(q0)
    pool, blank, noans = [], [], 0
    for c in cards:
        if QORDER.index(c["quarter"]) < qi0:
            continue
        a, b = c.get("a") or {}, c.get("b") or {}
        if not a.get("pass") or not a.get(key):
            continue
        mat = [m for m in (a.get("material") or []) if m.strip()]
        if not mat or not b.get("instruction"):
            # 재료가 비었거나 받는 쪽 지시가 없으면 화면이 낼 것이 없다 (T282)
            blank.append(c["id"])
            continue
        if re.search(r"정해진 답은 없다|정답이 없다", a[key]):
            noans += 1
        pool.append({
            "id": c["id"], "no": c["no"], "q": c["quarter"], "type": c["type"],
            "ins": plain(a.get("instruction", "")),
            "mat": [plain(m) for m in mat],
            # **`pass` 만 간다.** 이것이 기준이고 이 판의 전부다
            "pass": plain(a.get("pass", "")),
            # 그 기준이 **가르는 말인가 셈인가.** 화면이 둘을 다르게 적는다
            "splits": not bool(BARE.match(plain(a.get("pass", "")).strip())),
            "bIns": plain(b.get("instruction", "")),
            "bPass": plain(b.get("pass", "")),
        })
    pool.sort(key=lambda c: (QORDER.index(c["q"]), c["no"]))

    if len(pool) < end:
        print("[실패] 쓸 카드가 %d장이다. 한 판이 %d장이다" % (len(pool), end))
        return 1

    # 그날 강까지 쌓아 몇 장이 되는가. 다섯이 안 되는 강은 판을 안 연다 (T282 와 같다)
    short = []
    for w in weeks:
        if QORDER.index(w["quarter"]) < qi0:
            continue
        for L in w.get("lectures", []):
            cd = L.get("cards")
            if not cd:
                continue
            n = 0
            for c in pool:
                qa, qb = QORDER.index(c["q"]), QORDER.index(w["quarter"])
                if qa < qb or (qa == qb and c["no"] <= cd["to"]):
                    n += 1
            if n < end:
                short.append({"lecture": L["no"], "week": w["week"], "have": n})

    obj = {
        "note": "거꾸로 판정이 쓸 카드. out/data/cards.json 에서 뽑는다. "
                "정답과 해설을 안 담는다. 담으면 이 판이 안 선다. "
                "손으로 안 고친다. scripts/derive_flip.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "카드 파일 열둘이 다 신뢰도 B 다. 판 구조는 기준서 8.1 에서 "
                    "왔지만 화면에 뜨는 영어 문장은 카드가 진 등급을 그대로 진다.",
        "generator": "scripts/derive_flip.py",
        "source": "out/cards/ (%s 이후 %s 가 있는 카드), docs/play_rules.md 8.1"
                  % (q0, key),
        "from": q0, "end": end, "swap": swap,
        "hidden": list(HIDE),
        "count": len(pool), "blank": len(blank), "noAnswer": noans,
        "splits": sum(1 for c in pool if c["splits"]),
        "short": short,
        "cards": pool,
    }

    # **안 담았는지를 여기서 다시 센다** (T294 와 같다). 나간 글자를 통째로 본다
    txt = json.dumps(obj, ensure_ascii=False)
    leak = []
    for c in cards:
        a = c.get("a") or {}
        for k in HIDE:
            v = plain(a.get(k) or "").strip()
            if len(v) >= 12 and v in txt:
                leak.append("%s.%s" % (c["id"], k))
    if leak:
        print("[실패] 안 담기로 한 값이 나갔다: %s" % " ".join(leak[:5]))
        return 1

    io.open(os.path.join(OUT, "flip.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "flip.js"), "w", encoding="utf-8").write(
        "window.ENG2P_FLIP=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    kinds = {}
    for c in pool:
        kinds[c["type"]] = kinds.get(c["type"], 0) + 1
    sp = sum(1 for c in pool if c["splits"])
    print("out/data/flip.json / %s 이후 카드 %d장 (%s) / 한 판 %d장 / "
          "안 여는 강 %d / **기준이 가르는 장 %d 셈뿐인 장 %d** / 정답과 해설을 안 담았다"
          % (q0, len(pool),
             " ".join("%s %d" % kv for kv in sorted(kinds.items())),
             end, len(short), sp, len(pool) - sp))
    return 0


if __name__ == "__main__":
    sys.exit(main())
