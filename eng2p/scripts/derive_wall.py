#!/usr/bin/env python3
"""3초 벽 판이 띄울 **단서**를 압박형 카드에서 뽑는다. T282

규칙서 6.2 가 쓰는 것을 "압박형 카드 중 **10초 이하 124장. 있다**" 라고 적었다.
`play_data.md` 4장이 그 124를 셌다. **세어 본 것은 맞다.**

## 그런데 124장 중 서른 장은 띄울 것이 없다

카드를 열어 보면 재료 칸이 비어 있는 것이 서른 장이다. 그 서른 장은
"002 와 003 을 섞어 열 개를 이어서 낸다" 처럼 **다른 카드를 가리킨다.**
사람은 그 두 장을 꺼내 오면 되지만 화면은 띄울 것이 없다.

**T267, T270, T273, T279 에 이어 다섯 번째다.** 있다는 말이 두 가지를 뜻한다.
재료가 있다는 뜻과 그 판이 쓸 꼴로 있다는 뜻이 다르다.
띄울 단서가 있는 것은 **아흔넷**이다.

## 열 장이 안 모이는 날이 있다

규칙서가 끝 조건을 "열 장을 돌면 끝난다" 라고 적었다.
그날 강까지 나온 카드에서만 뽑아야 하는데(안 배운 카드를 드릴에 넣지 않는다)
첫 다섯 강은 그렇게 모으면 2 4 6 8 9 장이다. **열이 안 된다.**

모자란 날에 같은 장을 두 번 내는 것은 이 판에서 안 된다.
받는 쪽이 이미 본 단서는 압박이 아니다. **그래서 그 다섯 강은 판을 안 연다.**
이 파일이 그 다섯을 세어서 적어 둔다. 앱과 검사가 같은 수를 본다.

## 숫자를 여기에 안 적는다

열과 다섯은 규칙서 6.2 의 칸에 있다. T279 에서 정한 대로 문서가 원본이고
이 파일은 옮기기만 한다. 못 찾으면 **실패로 낸다.**

쓰는 법:
    python3 scripts/derive_wall.py

결과: out/data/wall.json 과 wall.js
규격: docs/play_rules.md 6.2, docs/play_data.md 4장
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

# 한국어 수사. 규칙서가 "열 장" 이라고 적었고 앱은 10이 필요하다.
KO = {"한": 1, "두": 2, "세": 3, "네": 4, "다섯": 5,
      "여섯": 6, "일곱": 7, "여덟": 8, "아홉": 9, "열": 10}
KOPAT = "|".join(sorted(KO, key=len, reverse=True))

QORDER = ["Q1", "Q2", "Q3", "Q4"]


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


def cap():
    """넘으면 안 쓰는 초. **발화 길이지 압박이 아니다** (play_data.md 4장)."""
    if not os.path.exists(DATADOC):
        return None, ["%s 가 없다" % DATADOC]
    m = re.search(r"3초 벽 판은 (\d+)초 이하 카드만 쓴다",
                  io.open(DATADOC, encoding="utf-8").read())
    if not m:
        return None, ["play_data.md 에서 쓰는 초의 윗선을 못 찾았다"]
    return int(m.group(1)), []


def spec():
    """규칙서 6.2 에서 끝 조건과 역할이 바뀌는 자리를 읽는다."""
    if not os.path.exists(RULES):
        return None, None, ["%s 가 없다" % RULES]
    seg = chapter(io.open(RULES, encoding="utf-8").read(),
                  "### 6.2 3초 벽", "### 6.3")
    end = swap = None
    for c in cells(seg):
        if len(c) < 2:
            continue
        if c[0] == "끝 조건":
            m = re.search(r"(%s)\s*장을 돌면" % KOPAT, c[1])
            if m:
                end = KO[m.group(1)]
        if c[0] == "역할":
            m = re.search(r"(%s)\s*장마다 바뀐다" % KOPAT, c[1].replace("**", ""))
            if m:
                swap = KO[m.group(1)]
    bad = []
    if not end:
        bad.append("규칙서 6.2 의 끝 조건에서 도는 장수를 못 찾았다")
    if not swap:
        bad.append("규칙서 6.2 의 역할 칸에서 바뀌는 장수를 못 찾았다")
    return end, swap, bad


def main():
    end, swap, bad = spec()
    CAP, capbad = cap()
    bad += capbad
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

    tight = [c for c in cards
             if c.get("type") == "압박" and c.get("seconds")
             and c["seconds"] <= CAP]
    # **비어 있는 재료를 통과시키지 않는다.** 화면이 띄울 것이 없는 장이다.
    pool, blank = [], []
    for c in tight:
        mat = [m for m in (c.get("a") or {}).get("material") or [] if m.strip()]
        if not mat:
            blank.append(c["id"])
            continue
        a, b = c.get("a") or {}, c.get("b") or {}
        pool.append({
            "id": c["id"], "no": c["no"], "q": c["quarter"],
            "sec": c["seconds"],
            # **화면으로 가는 글은 다 `plain` 을 지난다.** 카드 마크다운에 `**` 가
            # 섞여 있고 (Q1-054) 화면은 그것을 굵게 안 그리고 별 둘을 그린다. T292
            "ins": plain(a.get("instruction", "")),
            "mat": [plain(m) for m in mat],
            # 정답은 띄우는 쪽에만 간다. 받는 쪽 화면에 넣지 않는다
            "ans": plain(a.get("answer") or ""),
            "note": plain(a.get("note") or ""),
            "pass": plain(a.get("pass", "")),
            "bIns": plain(b.get("instruction", "")),
            "bPass": plain(b.get("pass", "")),
            # **받는 쪽이 재료를 눈으로 봐야 하는 장인가.** 단서는 띄우는 쪽
            # 화면에 있는 것이 원칙인데(역할 이름이 그렇다) 받는 쪽이 그 낱말을
            # 그대로 읽어야 하는 장이 있다. 그 장은 화면을 돌려 줘야 한다.
            # `읽는다` 로 잡는다. `읽은` 은 띄운 쪽이 읽은 것을 가리키는 말이라
            # 안 잡힌다 (Q2-053 "빠르게 읽은 문장에서 강세 낱말만 말한다").
            "show": bool(re.search(r"읽는다", b.get("instruction", ""))),
        })
    pool.sort(key=lambda c: (QORDER.index(c["q"]), c["no"]))

    if not pool:
        print("[실패] 띄울 단서가 있는 압박형 카드가 하나도 없다")
        return 1

    # 그날 강까지 쌓아 몇 장이 되는가. 열이 안 되는 강은 판을 안 연다
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
            if n < end:
                short.append({"lecture": L["no"], "week": w["week"], "have": n})

    obj = {
        "note": "3초 벽이 띄울 단서. out/data/cards.json 에서 뽑는다. "
                "손으로 안 고친다. scripts/derive_wall.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "카드 파일 열둘이 다 신뢰도 B 다. 제한시간과 판 구조는 "
                    "기준서 8.1 에서 왔지만 화면에 뜨는 영어 문장은 카드가 진 "
                    "등급을 그대로 진다.",
        "generator": "scripts/derive_wall.py",
        "source": "out/cards/ (압박형 %d초 이하), docs/play_rules.md 6.2" % CAP,
        "cap": CAP,
        "end": end, "swap": swap,
        "blank": blank,
        "short": short,
        "cards": pool,
    }
    io.open(os.path.join(OUT, "wall.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "wall.js"), "w", encoding="utf-8").write(
        "window.ENG2P_WALL=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    secs = sorted(set(c["sec"] for c in pool))
    print("out/data/wall.json / 단서 %d장 (압박형 %d초 이하 %d장 중 "
          "재료가 빈 %d장을 뺐다) / 초 %s / %d장을 돌고 %d장마다 바뀐다 / "
          "받는 쪽이 눈으로 봐야 하는 장 %d개 / 정답이 붙은 장 %d개 / "
          "열 장이 안 모이는 강 %d개"
          % (len(pool), CAP, len(tight), len(blank),
             " ".join(str(s) for s in secs), end, swap,
             len([c for c in pool if c["show"]]),
             len([c for c in pool if c["ans"]]), len(short)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
