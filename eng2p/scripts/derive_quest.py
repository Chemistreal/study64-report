#!/usr/bin/env python3
"""공동 퀘스트 표를 뽑는다. T325

`docs/quest.md` 5장의 표가 원본이다 (T279 의 규칙). 이 파일은 옮기기만 한다.

## 갈래를 여기서 정하지 않는다

`quest.md` 2장이 셀 수 있는 값을 여섯으로 셌다. 그 여섯 밖의 갈래가 표에 있으면
**실패로 낸다.** 화면이 못 세는 것을 목표로 걸면 두 사람이 영영 못 채운다.

## 목표가 그 주에 닿을 수 있는가

세션 주는 엿새다. 그러니 `session` 갈래의 목표가 여섯을 넘으면 못 채운다.
그런 목표는 벌이다. 갈래마다 넘으면 안 되는 선을 여기서 본다.

쓰는 법:
    python3 scripts/derive_quest.py

결과: out/data/quest.json 과 quest.js
규격: docs/quest.md 2장과 5장
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "out", "data")
DOC = os.path.join(ROOT, "docs", "quest.md")

# 셀 수 있는 갈래와 **한 주에 닿을 수 있는 윗선.**
# 엿새가 한 주다. 넘으면 못 채우고 못 채울 목표는 벌이다.
#
# `session` 과 `one` 만 다섯이다. 엿새가 아니다. T325 에 걸린 자리다.
#
# `plan()` 은 **끝낸 세션 수**로 주를 센다. 여섯째를 마치는 순간 주가 넘어간다.
# 그래서 그 주의 세션 목표가 여섯이면 **채운 것을 그 주 화면에서 못 본다.**
# 채우자마자 다음 주 퀘스트가 뜨고 두 사람은 채웠다는 말을 한 번도 못 본다.
#
# 채운 것을 못 보여 주는 목표는 목표가 아니다. 그래서 다섯으로 막는다.
# 오늘의 한 판도 세션이 있어야 열리므로 같은 자리다.
# `speak` 과 `cards` 와 `lre` 의 윗선을 T326 에 근거 있는 값으로 내렸다.
# 처음에는 600 과 900 이었는데 그것은 아무 데서도 안 온 수였다.
#
#     speak   하루 60분이 윗선이다. 두 시간 세션의 절반이다. 주 엿새라 360
#     cards   하루 60장이 윗선이다. 블록 3이 30분이다. 주 엿새라 360
#     lre     Q3 통과 조건이 "세션당 8회 이상" 이다 (매뉴얼). 주 엿새라 48
#     coll    조준표 채집이다. 주 열둘을 넘겨 본 적이 없다
#
# **윗선은 못 채울 목표를 막는 자리지 목표를 정하는 자리가 아니다.**
KIND = {"session": 5, "speak": 360, "cards": 360, "lre": 48, "coll": 12, "one": 5}


def cells(seg):
    out = []
    for line in seg.split("\n"):
        line = line.strip()
        if not line.startswith("|") or "---" in line:
            continue
        c = [x.strip() for x in line.strip("|").split("|")]
        if len(c) >= 4:
            out.append(c)
    return out


def main():
    if not os.path.exists(DOC):
        print("[실패] %s 가 없다" % DOC)
        return 1
    s = io.open(DOC, encoding="utf-8").read()
    i = s.find("### 5.1 표")
    if i < 0:
        print("[실패] quest.md 5.1 에 표가 없다")
        return 1
    j = s.find("### 5.1.1", i)
    seg = s[i:j if j > 0 else len(s)]

    weeks, seen, bad = [], set(), []
    for c in cells(seg):
        if not re.match(r"^\d+$", c[0]):
            continue
        w, kind, goal, name = int(c[0]), c[1], c[2], c[3]
        if kind not in KIND:
            bad.append("%d주의 갈래 %s 를 셀 수 없다. 셀 수 있는 것: %s"
                       % (w, kind, " ".join(sorted(KIND))))
            continue
        if not re.match(r"^\d+$", goal):
            bad.append("%d주의 목표가 숫자가 아니다: %s" % (w, goal))
            continue
        g = int(goal)
        if g < 1:
            bad.append("%d주의 목표가 %d 다" % (w, g))
        if g > KIND[kind]:
            bad.append("%d주의 목표 %d 가 %s 의 한 주 윗선 %d 를 넘는다. "
                       "못 채울 목표는 벌이다" % (w, g, kind, KIND[kind]))
        if w in seen:
            bad.append("%d주가 두 번 있다" % w)
        seen.add(w)
        weeks.append({"week": w, "kind": kind, "goal": g, "name": name})

    if not weeks:
        bad.append("표에서 한 주도 못 읽었다")
    else:
        want = list(range(1, len(weeks) + 1))
        if sorted(seen) != want:
            bad.append("주 번호가 1부터 잇달아 안 간다: %s" % sorted(seen))

    if bad:
        for b in bad:
            print("[실패] " + b)
        return 1

    weeks.sort(key=lambda x: x["week"])

    # ---- 마흔여덟 주를 통째로 잰다 (T328) --------------------------------
    #
    # 주 하나씩 보면 다 맞는데 마흔여덟을 죽 늘어놓으면 틀린 것이 있다.
    # **한 줄씩 재는 것과 표를 재는 것이 다르다.**
    if len(weeks) == 48:
        for a, b, q, want in ((1, 12, "Q1", ("session", "one")),
                              (13, 24, "Q2", ("speak",)),
                              (25, 36, "Q3", ("lre",)),
                              (37, 48, "Q4", None)):
            seg = [w for w in weeks if a <= w["week"] <= b]
            cnt = {}
            for w in seg:
                cnt[w["kind"]] = cnt.get(w["kind"], 0) + 1
            top = sorted(cnt, key=lambda k: (-cnt[k], k))[0]
            if want and top not in want:
                bad.append("%s 가 미는 것이 %s 다. %s 여야 한다 (quest.md 5.0)"
                           % (q, top, " 나 ".join(want)))
            # **한 분기가 한 갈래로 덮이면 퀘스트가 배경이 된다** (5.0.1)
            if cnt[top] > len(seg) // 2:
                bad.append("%s 의 %d주 중 %d주가 %s 다. 절반을 넘는다"
                           % (q, len(seg), cnt[top], top))
            # Q4 는 돌려 쓴다. 갈래가 다섯은 돼야 한다
            if q == "Q4" and len(cnt) < 5:
                bad.append("Q4 의 갈래가 %d가지다. 앞의 셋을 돌려 쓰는 분기다" % len(cnt))
        # 갈래 여섯이 다 한 번은 나오는가. **안 나오는 갈래는 없는 것과 같다**
        allk = set(w["kind"] for w in weeks)
        miss = sorted(set(KIND) - allk)
        if miss:
            bad.append("마흔여덟 주에 한 번도 안 나오는 갈래가 있다: %s"
                       % " ".join(miss))
        # 같은 갈래 안에서 뒤로 갈수록 목표가 안 내려가는가.
        # **내려가면 그 주가 쉬어 가는 주가 되고 그것을 안 적었다.**
        last = {}
        for w in weeks:
            k = w["kind"]
            if k in last and w["goal"] < last[k]:
                bad.append("%d주의 %s 목표 %d 가 앞의 %d 보다 낮다. "
                           "쉬어 가는 주를 두려면 quest.md 에 적는다"
                           % (w["week"], k, w["goal"], last[k]))
            last[k] = w["goal"]

    if bad:
        for b in bad:
            print("[실패] " + b)
        return 1


    # **같은 갈래를 이틀 잇달아 안 준다** (`quest.md` 5.0.1).
    # 한 갈래만 죽 이어지면 퀘스트가 배경이 되고 두 사람이 그것을 안 본다.
    run = [weeks[i]["week"] for i in range(1, len(weeks))
           if weeks[i]["kind"] == weeks[i - 1]["kind"]]
    if run:
        print("[실패] 같은 갈래가 잇달아 오는 자리가 %d곳이다: %s주"
              % (len(run), " ".join(str(x) for x in run[:5])))
        return 1
    obj = {
        "note": "주마다의 공동 퀘스트. docs/quest.md 5장 표가 원본이다. "
                "손으로 안 고친다. scripts/derive_quest.py 를 다시 돌린다.",
        "grade": "A",
        "gradeWhy": "영어가 없다. 갈래와 숫자와 한국어 이름뿐이다.",
        "generator": "scripts/derive_quest.py",
        "source": "docs/quest.md 5장",
        "kinds": KIND,
        "count": len(weeks),
        "weeks": weeks,
    }
    io.open(os.path.join(OUT, "quest.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "quest.js"), "w", encoding="utf-8").write(
        "window.ENG2P_QUEST=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    ks = {}
    for w in weeks:
        ks[w["kind"]] = ks.get(w["kind"], 0) + 1
    print("out/data/quest.json / %d주 / %s / **마흔여덟 주가 다 찼다**"
          % (len(weeks), " ".join("%s %d" % (k, ks[k]) for k in sorted(ks))))
    return 0


if __name__ == "__main__":
    sys.exit(main())
