#!/usr/bin/env python3
"""못 넘은 항목을 어디서 더 도나. T353

T352 에 통과 조건이 강의를 안 막는다는 것을 적었다. 그러면 못 넘은 것은 어떻게 넘나.

    강의를 멈추고 기다리지 않는다. **그 자리를 더 돈다.**

매뉴얼이 "96강이 끝났다. 카드는 계속 돈다" 고 적은 그 결이다.
그런데 **무엇을 더 도는지가 어디에도 없었다.** 통과 조건 열여섯에 붙은 자리가 없다.

## 손으로 잇고 검사한다

조건 이름과 판 이름을 잇는 것은 기계가 못 한다. 손으로 잇고 **트랙으로 대 본다.**

    이은 판이 앱의 판 스물에 있는가
    그 판의 트랙이 그 조건의 트랙과 같은가

트랙이 다르면 잘못 이은 것이다. 되묻기를 소리 판에 잇는 것 같은 일이다.

쓰는 법:
    python3 scripts/derive_more.py

결과: out/data/more.json 과 more.js
규격: docs/spec.md 2.2, docs/play_rules.md
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
PLAYJS = os.path.join(ROOT, "app", "js", "25_play.js")

# 통과 조건마다 어느 트랙이고 어느 판에서 더 도나.
#   키    `PASS` 의 항목 키
#   값    (트랙, [판 id...], 판이 없을 때 무엇을 하나)
#
# **트랙은 6트랙 이름 그대로다.** 판의 트랙과 대 봐서 다르면 파생이 실패한다.
MORE = {
    "red": ("소리", ["mirror", "swapline"], ""),
    "str": ("소리", ["hearme", "relay"], ""),
    "ask": ("repair", ["reask"], ""),
    "chk": ("청크", ["chain", "twohalf"], ""),
    "non": ("청크", ["overlap"], ""),
    "rep": ("repair", ["cutin"], ""),
    "rct": ("자동화", ["wall", "rebound"], ""),
    "lre": ("청크", ["chain"], ""),
    "ovl": ("repair", ["clash"], ""),
    "spk": ("자동화", ["ladder"], ""),
    "reg": ("화용", ["wave", "onesee"], ""),
    "trn": ("화용", ["whose"], ""),
    # 판이 없는 것 하나. **세션을 더 도는 것 말고 길이 없다.**
    "hrs": ("", [], "세션을 더 돈다. 이것만 판으로 못 채운다"),
}


def pass_rows():
    """`PASS` 를 읽는다. 분기마다 넷이다."""
    s = io.open(CONST, encoding="utf-8").read()
    i = s.find("var PASS={")
    j = s.find("\n};", i)
    out = []
    for m in re.finditer(r'\{k:"([a-z]+)",l:"([^"]+)"[^}]*need:(\d+)', s[i:j]):
        out.append({"k": m.group(1), "l": m.group(2), "need": int(m.group(3))})
    return out


def plays():
    s = io.open(PLAYJS, encoding="utf-8").read()
    return dict((m.group(1), {"name": m.group(2), "track": m.group(3)})
                for m in re.finditer(
                    r'\{id:"([a-z0-9]+)", name:"([^"]+)", track:"([^"]+)"', s))


def main():
    rows = pass_rows()
    ps = plays()
    if len(ps) != 20:
        print("[실패] 앱이 아는 판이 %d개다. 스물이어야 한다" % len(ps))
        return 1
    keys = sorted(set(r["k"] for r in rows))
    if sorted(MORE.keys()) != keys:
        print("[실패] 통과 조건 키와 이 파일의 표가 다르다: %s / %s"
              % (" ".join(keys), " ".join(sorted(MORE.keys()))))
        return 1

    items, noPlay = [], 0
    for r in rows:
        track, ids, alt = MORE[r["k"]]
        for pid in ids:
            p = ps.get(pid)
            if not p:
                print("[실패] %s 가 이은 판 %s 가 앱에 없다" % (r["k"], pid))
                return 1
            # **트랙이 같아야 한다.** 다르면 잘못 이은 것이다
            if p["track"] != track:
                print("[실패] %s 는 %s 트랙인데 이은 판 %s 는 %s 트랙이다"
                      % (r["k"], track, pid, p["track"]))
                return 1
        if not ids and not alt:
            print("[실패] %s 에 더 돌 자리도 없고 대신 무엇을 하는지도 없다" % r["k"])
            return 1
        if not ids:
            noPlay += 1
        items.append({"k": r["k"], "l": r["l"], "need": r["need"],
                      "track": track, "alt": alt,
                      "plays": [{"id": i, "name": ps[i]["name"]} for i in ids]})

    obj = {
        "note": "통과 조건마다 더 돌 자리. 판 트랙과 대 본 것이라 손으로 안 고친다. "
                "scripts/derive_more.py 를 다시 돌린다.",
        "grade": "A",
        "gradeWhy": "영어가 없다. 조건 이름과 판 이름을 잇고 트랙으로 대 본 것이다.",
        "generator": "scripts/derive_more.py",
        "source": "app/js/01_const.js 의 PASS, app/js/25_play.js",
        "count": len(items),
        "noPlay": noPlay,
        "items": items,
        # **되돌리지 않는다** (기준서 2.2, 매뉴얼 2.5)
        "rewinds": False,
        "rewindsWhy": "못 넘었다고 지난 강으로 안 돌아간다. 강의는 차례로 가고 "
                      "못 넘은 자리를 판과 카드로 더 돈다. 되돌리면 다른 트랙까지 멈춘다.",
    }
    io.open(os.path.join(OUT, "more.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "more.js"), "w", encoding="utf-8").write(
        "window.ENG2P_MORE=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    print("out/data/more.json / 조건 %d개 / 판으로 못 채우는 것 %d개 / "
          "**되돌리지 않고 그 자리를 더 돈다**" % (len(items), noPlay))
    return 0


if __name__ == "__main__":
    sys.exit(main())
