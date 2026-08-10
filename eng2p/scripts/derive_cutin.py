#!/usr/bin/env python3
"""끼어들기 판의 **신호 시각 표**를 뽑는다. T300

규칙서 10.2 가 "앱이 **아무 때나** 신호를 낸다" 라고 적었다.
그런데 `round.md` 6장이 이렇게 막았다.

    시계에서 아무것도 안 낸다. `Date.now()` 도 무작위도 안 쓴다.
    두 기기에서 다르게 나오는 것을 판의 재료로 삼지 않는다.

## 아무 때나와 두 기기가 같은 것을 같이 얻는다

무작위를 그 자리에서 뽑으면 두 기기가 다른 순간에 울린다.
한쪽만 울리면 그 사람만 끼어들 준비를 하고 **그러면 압박이 없어진다.**

그래서 시각을 **미리 뽑아 표로 만든다.** 그날 씨앗이 그중 하나를 고르고
두 기기가 같은 씨앗을 가지니 같은 표를 고른다.
사람은 이 표를 안 보므로 **사람에게는 아무 때나다.**

기계가 아는 것과 사람이 아는 것을 가르면 둘 다 얻는다.

## 뽑는 것도 무작위가 아니다

이 파일이 돌 때마다 다른 표가 나오면 `check_derived.py` 가 어긋났다고 낸다.
파생물은 언제 다시 뽑아도 같아야 한다.

그래서 여기서도 무작위를 안 쓴다. 자리 번호에서 값을 만든다.
**같은 자리는 늘 같은 표다.**

쓰는 법:
    python3 scripts/derive_cutin.py

결과: out/data/cutin.json 과 cutin.js
규격: docs/play_rules.md 10.2, docs/round.md 6장
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

# 표를 몇 벌 뽑나. 이 수는 규격이 아니라 **고를 것의 수**다.
# 적으면 며칠 만에 같은 표가 다시 온다. 두 사람이 그것을 알아채면 아무 때나가 아니다.
# 48주 288일이라 그보다 넉넉히 둔다.
DECKS = 64


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
    """규칙서 10.2 에서 분과 두 사이를 읽는다."""
    if not os.path.exists(RULES):
        return None, ["%s 가 없다" % RULES]
    seg = chapter(io.open(RULES, encoding="utf-8").read(),
                  "### 10.2 끼어들기", "### 10.3")
    out, bad = {}, []
    for c in cells(seg):
        if len(c) < 2:
            continue
        if c[0] == "트랙 구조 분":
            m = re.search(r"(\d+)\s*분\s*$", c[1].replace("**", "").strip())
            if m:
                out["min"] = int(m.group(1))
        if c[0] == "제일 짧은 사이":
            m = re.search(r"(\d+)\s*초", c[1].replace("**", ""))
            if m:
                out["gap"] = int(m.group(1))
        if c[0] == "제일 긴 사이":
            m = re.search(r"(\d+)\s*초", c[1].replace("**", ""))
            if m:
                out["far"] = int(m.group(1))
    for k, why in (("min", "트랙 구조 분에서 몇 분인지"),
                   ("gap", "제일 짧은 사이"),
                   ("far", "제일 긴 사이")):
        if k not in out:
            bad.append("규칙서 10.2 에서 %s 를 못 찾았다" % why)
    if not bad and not (out["gap"] < out["far"]):
        bad.append("짧은 사이 %d 가 긴 사이 %d 보다 안 짧다"
                   % (out["gap"], out["far"]))
    return out, bad


def deck(k, sec, gap, far):
    """한 벌. **무작위가 아니다.** 자리 번호에서 값을 만든다.

    같은 `k` 는 늘 같은 표를 낸다. 그래야 다시 뽑아도 파생물이 같다.
    """
    out, at, x = [], 0, (k * 2654435761 + 40503) & 0xFFFFFFFF
    while True:
        x = (x * 1103515245 + 12345) & 0x7FFFFFFF
        at += gap + x % (far - gap + 1)
        if at >= sec:
            break
        out.append(at)
    return out


def main():
    sp, bad = spec()
    if bad:
        for b in bad:
            print("[실패] " + b)
        return 1
    sec = sp["min"] * 60

    decks, thin = [], []
    for k in range(DECKS):
        d = deck(k, sec, sp["gap"], sp["far"])
        # 사이가 규격을 어기는 벌이 있으면 안 뽑은 것만 못하다
        for a, b in zip(d, d[1:]):
            if not (sp["gap"] <= b - a <= sp["far"]):
                print("[실패] %d번 벌의 사이가 규격 밖이다: %d초" % (k, b - a))
                return 1
        if len(d) < 2:
            thin.append(k)
        decks.append(d)

    if thin:
        print("[실패] 신호가 둘도 안 되는 벌이 있다: %s" % thin[:5])
        return 1

    ns = [len(d) for d in decks]
    obj = {
        "note": "끼어들기 신호 시각. 자리 번호에서 만든다. 무작위가 아니다. "
                "그날 씨앗이 한 벌을 고르고 두 기기가 같은 벌을 본다. "
                "손으로 안 고친다. scripts/derive_cutin.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "몇 분인지는 규칙서가 정했지만 제일 짧은 사이와 긴 사이는 "
                    "규칙서 안에 근거가 없다. 10.2 에 그 둘을 적고 왜 그렇게 "
                    "잡았는지도 적었다. 두 사람이 돌려 보고 고칠 자리다.",
        "generator": "scripts/derive_cutin.py",
        "source": "docs/play_rules.md 10.2",
        "min": sp["min"], "sec": sec, "gap": sp["gap"], "far": sp["far"],
        "decks": decks,
    }
    io.open(os.path.join(OUT, "cutin.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "cutin.js"), "w", encoding="utf-8").write(
        "window.ENG2P_CUTIN=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    print("out/data/cutin.json / %d분(%d초)에 신호 %d~%d번 / 벌 %d개 / "
          "사이 %d~%d초 / **무작위를 안 썼다**"
          % (sp["min"], sec, min(ns), max(ns), len(decks), sp["gap"], sp["far"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
