#!/usr/bin/env python3
"""트랙 여섯의 진도표를 차림표에서 뽑는다. T343

**세는 것이 아니라 읽는 것이다.** 96강에 트랙이 하나씩 붙어 있고
`out/data/index.json` 에 적혀 있다. 여기서 새로 적는 값이 없다.

## 대 보는 것 셋

    Q1 문법이 0인가   CLAUDE.md 6트랙. "Q1 문법은 0%다. 예외 없다"
    합이 96인가       48주 x 2강
    여섯이 다 있는가   소리 청크 자동화 문법 화용 repair

**문서에 적힌 표와도 대 본다.** `docs/track.md` 2장 표가 그것이고
적어 놓은 것과 도는 것이 다르면 여기서 실패한다 (T312, T320, T330, T338).

쓰는 법:
    python3 scripts/derive_track.py

결과: out/data/track.json 과 track.js
규격: docs/track.md
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "out", "data")
DOC = os.path.join(ROOT, "docs", "track.md")

# 6트랙. CLAUDE.md 가 정한 차례 그대로다. **새 이름을 안 짓는다.**
TRACKS = ["소리", "청크", "자동화", "문법", "화용", "repair"]
QS = ["Q1", "Q2", "Q3", "Q4"]

# Q1 문법은 0이다. 예외 없다 (CLAUDE.md 6트랙)
ZERO = [("Q1", "문법")]
TOTAL = 96


def doc_table():
    """`docs/track.md` 2장 표. **적어 놓은 것과 도는 것을 대 본다.**"""
    s = io.open(DOC, encoding="utf-8").read()
    i = s.find("## 2. 무엇으로 세나")
    j = s.find("## 3.", i)
    out = {}
    for line in s[i:j].split("\n"):
        line = line.strip()
        if not line.startswith("|") or "---" in line:
            continue
        c = [x.strip() for x in line.strip("|").split("|")]
        if len(c) != 6 or c[0] == "트랙":
            continue
        if not re.match(r"^\d+$", c[1]):
            continue
        out[c[0]] = {"all": int(c[1]),
                     "q": {QS[i]: int(c[2 + i]) for i in range(4)}}
    return out


def main():
    f = os.path.join(OUT, "index.json")
    if not os.path.exists(f):
        print("[실패] out/data/index.json 이 없다")
        return 1
    if not os.path.exists(DOC):
        print("[실패] docs/track.md 가 없다")
        return 1
    d = json.load(io.open(f, encoding="utf-8"))

    # 트랙마다 강 번호를 모은다. **차례를 지킨다.** 강 번호가 곧 지나는 차례다
    lec = {t: [] for t in TRACKS}
    seen, bad = {}, []
    for w in d.get("weeks", []):
        q = w.get("quarter")
        for x in w.get("lectures", []):
            t = x.get("track")
            if t not in lec:
                bad.append("%d강의 트랙이 여섯에 없다: %s" % (x.get("no", 0), t))
                continue
            lec[t].append({"no": x.get("no"), "week": w.get("week"), "q": q})
            seen[(q, t)] = seen.get((q, t), 0) + 1
    if bad:
        for b in bad:
            print("[실패] " + b)
        return 1

    tot = sum(len(v) for v in lec.values())
    if tot != TOTAL:
        print("[실패] 강의가 %d개다. %d 여야 한다" % (tot, TOTAL))
        return 1
    empty = [t for t in TRACKS if not lec[t]]
    if empty:
        print("[실패] 강의가 하나도 없는 트랙이 있다: " + " ".join(empty))
        return 1
    for q, t in ZERO:
        if seen.get((q, t), 0):
            print("[실패] %s %s 이 %d강이다. 0 이어야 한다 (CLAUDE.md 6트랙)"
                  % (q, t, seen[(q, t)]))
            return 1

    # **문서 표와 대 본다.** 손으로 적은 표가 낡으면 여기서 걸린다
    doc = doc_table()
    if len(doc) != len(TRACKS):
        print("[실패] docs/track.md 2장 표가 %d줄이다. 여섯이어야 한다" % len(doc))
        return 1
    for t in TRACKS:
        row = doc.get(t)
        if not row:
            print("[실패] docs/track.md 2장 표에 %s 가 없다" % t)
            return 1
        if row["all"] != len(lec[t]):
            print("[실패] %s 가 문서에는 %d강인데 센 것은 %d강이다"
                  % (t, row["all"], len(lec[t])))
            return 1
        for q in QS:
            if row["q"][q] != seen.get((q, t), 0):
                print("[실패] %s %s 가 문서에는 %d강인데 센 것은 %d강이다"
                      % (q, t, row["q"][q], seen.get((q, t), 0)))
                return 1

    items = []
    for t in TRACKS:
        ls = sorted(lec[t], key=lambda x: x["no"])
        items.append({
            "track": t,
            "all": len(ls),
            "q": {q: seen.get((q, t), 0) for q in QS},
            "nos": [x["no"] for x in ls],
            "weeks": [x["week"] for x in ls],
            "first": ls[0]["week"],
            "last": ls[-1]["week"],
        })

    obj = {
        "note": "트랙 여섯의 진도표. 차림표에서 읽은 것이라 손으로 안 고친다. "
                "scripts/derive_track.py 를 다시 돌린다.",
        "grade": "A",
        "gradeWhy": "영어가 없다. 96강의 트랙을 센 것이라 세면 나온다.",
        "generator": "scripts/derive_track.py",
        "source": "out/data/index.json, docs/track.md 2장",
        "count": TOTAL,
        "tracks": items,
        # **사람별로 안 가른다** (문서 6장)
        "perPerson": False,
        "perPersonWhy": "강의를 같이 읽고 세션을 같이 돈다. 사람마다 다르게 가는 것은 "
                        "실력이지 진도가 아니다. 여기서 섞으면 진도표가 곧 순위표가 된다.",
        # **남은 것을 안 적는다** (원칙 4)
        "showsLeft": False,
        "showsLeftWhy": "남은 것을 적으면 그것이 빚이 되고 빚은 벌이다. "
                        "지금 얼마인지와 다음 하나가 언제인지만 적는다.",
    }
    io.open(os.path.join(OUT, "track.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "track.js"), "w", encoding="utf-8").write(
        "window.ENG2P_TRACK=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    print("out/data/track.json / 트랙 %d개 %d강 (%s) / Q1 문법 0 / "
          "**차림표에서 읽었다. 손으로 안 적는다**"
          % (len(items), tot,
             " ".join("%s%d" % (x["track"], x["all"]) for x in items)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
