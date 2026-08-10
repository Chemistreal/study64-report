#!/usr/bin/env python3
"""배속 사다리 판의 **규격**을 `docs/bench_music.md` 6장에서 뽑는다. T279

규칙서 6.1 이 쓰는 것을 "오늘 과의 대본 한 토막 + 배속 사다리 규격.
**둘 다 있다**" 라고 적었다.

**T267 과 T270 에서 만난 그 자리를 또 만났다.** 규격은 있다. 줄글로 있다.
사람이 읽는 자리에 있고 앱이 그것을 못 읽는다.

## 손으로 옮겨 적지 않는다

숫자를 앱에 손으로 박으면 문서와 앱이 두 자리가 된다.
그러면 언젠가 갈라지고 그때 어느 쪽이 맞는지 알 수 없게 된다.
`docs/friction.md` 8장의 기준선을 문서에서 읽는 것과 같은 이유다.

**문서가 원본이고 이 파일은 옮기는 일만 한다.**
문서에서 못 찾으면 **실패로 낸다.** 조용히 기본값을 쓰면 그 순간
문서를 고쳐도 앱이 안 따라오고, 아무도 그것을 모른다.

## 대본 토막은 새로 안 뽑는다

`out/data/relay.js` 가 이미 낱말 6~14 짜리 토막을 소리 자리와 함께 들고 있다
(T267). 이 판도 같은 조건이다. **자료를 두 번 만들지 않는다.**

쓰는 법:
    python3 scripts/derive_ladder.py

결과: out/data/ladder.json 과 ladder.js
규격: docs/bench_music.md 6장, docs/play_rules.md 6.1
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "out", "data")
SRC = os.path.join(ROOT, "docs", "bench_music.md")

# 한국어 수사. 문서가 "세 번" 이라고 적었고 앱은 3이 필요하다.
KO = {"한": 1, "두": 2, "세": 3, "네": 4, "다섯": 5}


def chapter(text, head, tail):
    """장 하나를 떼어 낸다. **장 밖의 표를 안 읽는다.**"""
    i = text.find(head)
    if i < 0:
        return ""
    j = text.find(tail, i + len(head))
    return text[i:j if j > 0 else len(text)]


def rows(seg):
    """표 줄만. 머리와 금은 뺀다."""
    out = []
    for line in seg.split("\n"):
        line = line.strip()
        if not line.startswith("|") or "---" in line:
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        out.append(cells)
    return out


def main():
    if not os.path.exists(SRC):
        print("[실패] %s 가 없다" % SRC)
        return 1
    doc = io.open(SRC, encoding="utf-8").read()
    bad = []

    # 6.1 세 칸. 칸 이름과 배속과 무엇을 보는가
    steps = []
    for c in rows(chapter(doc, "### 6.1 세 칸", "### 6.2")):
        if len(c) < 3 or c[0] == "칸":
            continue
        m = re.search(r"(\d+(?:\.\d+)?)", c[1])
        if not m:
            continue
        steps.append({"name": c[0], "rate": float(m.group(1)),
                      "see": c[2].replace("**", "")})
    if len(steps) != 3:
        bad.append("6.1 에서 칸 셋을 못 찾았다: %d개" % len(steps))

    # 6.2 올라가는 수와 6.3 내려가는 수. **문서의 말에서 뽑는다**
    up = down = None
    m = re.search(r"([한두세네]|다섯) 번 연달아 되면", chapter(doc, "### 6.2", "### 6.3"))
    if m:
        up = KO.get(m.group(1))
    m = re.search(r"([한두세네]|다섯) 번 연달아 안 되면", chapter(doc, "### 6.3", "### 6.4"))
    if m:
        down = KO.get(m.group(1))
    if not up:
        bad.append("6.2 에서 올라가는 수를 못 찾았다")
    if not down:
        bad.append("6.3 에서 내려가는 수를 못 찾았다")

    # 6.4 배속마다 판정 기준. **같은 것을 세 번 재는 것이 아니다** (규칙서 6.1)
    judge = {}
    for c in rows(chapter(doc, "### 6.4", "### 6.5")):
        if len(c) < 2 or c[0] == "배속":
            continue
        m = re.search(r"(\d+(?:\.\d+)?)", c[0])
        if m:
            # **글자로 견주지 않는다.** 문서는 "1.0" 이라고 적고
            # 파이썬의 %g 는 "1" 을 낸다. 글자로 맞추면 1.0 칸만 조용히 빠진다.
            judge[float(m.group(1))] = c[1].replace("**", "")
    if len(judge) != 3:
        bad.append("6.4 에서 판정 기준 셋을 못 찾았다: %d개" % len(judge))

    # 내리는 말투. **사람이 아니라 다음에 할 일을 말한다** (T175)
    say = None
    for c in rows(chapter(doc, "### 6.3", "### 6.4")):
        if len(c) == 2 and c[0] != "안 되는 말":
            say = c[1].replace("**", "")
    if not say:
        bad.append("6.3 에서 내릴 때 할 말을 못 찾았다")

    if bad:
        for b in bad:
            print("[실패] " + b)
        print("문서가 원본이다. docs/bench_music.md 6장을 고쳤으면 이 파생기도 본다.")
        return 1

    for s in steps:
        s["judge"] = judge.get(s["rate"], "")
        if not s["judge"]:
            print("[실패] %g 배속의 판정 기준이 6.4 에 없다" % s["rate"])
            return 1

    obj = {
        "note": "배속 사다리 규격. docs/bench_music.md 6장에서 뽑는다. "
                "손으로 안 고친다. 문서를 고치고 scripts/derive_ladder.py 를 다시 돌린다.",
        "grade": "A",
        "gradeWhy": "지어낸 것이 없다. 숫자와 글이 다 docs/bench_music.md 6장에 있고 "
                    "이 파일은 옮기기만 한다. 못 찾으면 실패로 낸다.",
        "generator": "scripts/derive_ladder.py",
        "source": "docs/bench_music.md 6장",
        "up": up, "down": down, "downSay": say,
        "steps": steps,
    }
    text = json.dumps(obj, ensure_ascii=False, indent=2) + "\n"
    io.open(os.path.join(OUT, "ladder.json"), "w", encoding="utf-8").write(text)
    io.open(os.path.join(OUT, "ladder.js"), "w", encoding="utf-8").write(
        "window.ENG2P_LADDER=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")
    print("out/data/ladder.json / 칸 %d개 (%s) / 오르는 수 %d 내리는 수 %d / "
          "칸마다 볼 것이 다르다"
          % (len(steps), " ".join("%g" % s["rate"] for s in steps), up, down))
    return 0


if __name__ == "__main__":
    sys.exit(main())
