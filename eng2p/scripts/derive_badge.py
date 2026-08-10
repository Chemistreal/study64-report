#!/usr/bin/env python3
"""공동 배지를 뽑는다. **새 이름을 안 짓는다.** T329

로드맵 12.15 가 "공동 배지. 분기와 통과 조건에 붙인다" 로 적었다.

## 붙인다는 말이 이 턴의 전부다

배지를 새로 만드는 것이 아니라 **이미 있는 것에 이름표를 다는 것**이다.

통과 조건은 `app/js/01_const.js` 의 `PASS` 에 있다. 분기마다 넷이고
기준서에서 온 것과 운용으로 정한 것이 표시돼 있다.

배지가 딴 목표를 세우면 두 사람이 **두 가지를 좇게 된다.**
퀘스트에서 겪은 자리다 (`quest.md` 5.0). 그래서 배지의 이름과 숫자를
여기서 안 짓고 `PASS` 에서 그대로 옮긴다.

## 분기마다 다섯이다

조건 넷에 하나씩, 그리고 넷을 다 지나면 분기 하나. 넷에 스물이다.

## 공동이다

`S.q["Q1"].pass` 는 사람별이 아니다. 둘이 서로에게 재고 한 숫자를 적는다.
**그러니 배지도 하나다.** 누가 지났는지를 안 적는다.

## 잠그지 않는다

배지가 없어도 다음 분기로 간다. 분기 이동은 통과 조건이 정하지 배지가 안 정한다.
배지는 **지난 것을 적어 두는 자리**지 여는 열쇠가 아니다.

쓰는 법:
    python3 scripts/derive_badge.py

결과: out/data/badge.json 과 badge.js
규격: docs/roadmap.md 12.15, app/js/01_const.js 의 PASS
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "out", "data")
CONST = os.path.join(ROOT, "app", "js", "01_const.js")

ROW = re.compile(r'\{k:"([a-z]+)",l:"([^"]+)",u:"([^"]*)",need:(\d+),src:"([^"]+)"\}')


def main():
    if not os.path.exists(CONST):
        print("[실패] %s 가 없다" % CONST)
        return 1
    s = io.open(CONST, encoding="utf-8").read()
    i = s.find("var PASS={")
    if i < 0:
        print("[실패] 01_const.js 에 PASS 가 없다")
        return 1
    j = s.find("\n};", i)
    seg = s[i:j]

    quarters, bad = {}, []
    for m in re.finditer(r"^\s*(\d):\[", seg, re.M):
        q = int(m.group(1))
        k = seg.find("\n", m.end())
        nxt = re.search(r"^\s*\d:\[", seg[m.end():], re.M)
        body = seg[m.start():m.end() + (nxt.start() if nxt else len(seg))]
        rows = ROW.findall(body)
        if len(rows) != 4:
            bad.append("Q%d 의 통과 조건이 %d개다. 넷이어야 한다" % (q, len(rows)))
        quarters[q] = rows

    if sorted(quarters) != [1, 2, 3, 4]:
        bad.append("분기가 %s 다. 넷이어야 한다" % sorted(quarters))
    if bad:
        for b in bad:
            print("[실패] " + b)
        return 1

    badges = []
    for q in sorted(quarters):
        for k, label, unit, need, src in quarters[q]:
            badges.append({
                "id": "Q%d-%s" % (q, k), "quarter": q, "kind": "one", "key": k,
                # **이름을 안 짓는다.** 통과 조건 이름을 그대로 쓴다
                "name": label,
                "need": int(need), "unit": unit, "src": src,
            })
        badges.append({
            "id": "Q%d" % q, "quarter": q, "kind": "all", "key": None,
            "name": "Q%d 통과 조건 넷을 다 지났다" % q,
            "need": 4, "unit": "조건 중", "src": "위 넷",
        })

    obj = {
        "note": "공동 배지. app/js/01_const.js 의 PASS 에서 이름과 숫자를 그대로 옮긴다. "
                "새 이름을 안 짓는다. 손으로 안 고친다. "
                "scripts/derive_badge.py 를 다시 돌린다.",
        "grade": "A",
        "gradeWhy": "영어가 없다. 통과 조건 이름과 숫자를 옮긴 것이라 세면 나온다.",
        "generator": "scripts/derive_badge.py",
        "source": "app/js/01_const.js 의 PASS",
        "locks": False,
        "locksWhy": "배지가 없어도 다음 분기로 간다. 분기 이동은 통과 조건이 정한다. "
                    "배지는 지난 것을 적어 두는 자리지 여는 열쇠가 아니다.",
        "perPerson": False,
        "perPersonWhy": "S.q 의 pass 는 사람별이 아니다. 둘이 서로에게 재고 한 숫자를 "
                        "적는다. 그러니 배지도 하나고 누가 지났는지를 안 적는다.",
        "count": len(badges),
        "badges": badges,
    }
    io.open(os.path.join(OUT, "badge.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "badge.js"), "w", encoding="utf-8").write(
        "window.ENG2P_BADGE=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    print("out/data/badge.json / 배지 %d개 (분기마다 조건 4 + 분기 1) / "
          "**새 이름을 안 지었다**" % len(badges))
    return 0


if __name__ == "__main__":
    sys.exit(main())
