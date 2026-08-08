"""조준표 네 편을 앱이 읽는 꼴로 파생한다.

**블록 1이 40분인데 화면이 조준표를 안 띄운다.** T208 진단에서 나왔다.
화면은 "조준표 과제대로 듣는다" 고만 말하고 어느 과제인지는 안 말한다.
그러면 두 사람이 종이를 편다. 종이를 펴면 화면과 종이가 둘 다 켜진 상태가 된다.

강의도 세트도 카드도 파생되는데 조준표만 아니었다.
**자료가 없으면 화면을 못 만든다.** 그래서 화면보다 이것이 먼저다.

뽑는 것은 넷이다.

    주차 과제     4장. 그 주에 무엇을 찾으며 듣는가
    채집 지시     5장. 그 주에 무엇을 적어 오는가
    상호 확인     6장. 회차마다 어떻게 대조하는가
    안 하는 것    8장. 그 분기에 하지 않는 것

**4장의 표 꼴이 분기마다 다르다.** Q1 은 한 표에 회차 칸이 있고
Q2 부터는 회차마다 표가 갈린다. 둘 다 읽는다. 꼴을 하나로 맞추는 것은
조준표를 고치는 일이고 조준표는 이미 검사를 통과한 제작물이다.
**읽는 쪽이 맞춘다.**

사용법:
    python3 scripts/derive_input.py

규격: docs/spec.md 10장, docs/blocks.md 9장
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, "out", "input")
OUT = os.path.join(ROOT, "out", "data")

QUARTERS = ["q1", "q2", "q3", "q4"]


def cells(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def tables(body):
    """본문에서 표를 다 뽑는다. 머리줄과 몸줄을 갈라 돌려준다."""
    out, head, rows = [], None, []
    for line in body.split("\n"):
        if line.startswith("| ") and "---" not in line:
            c = cells(line)
            if head is None:
                head = c
            else:
                rows.append(c)
        elif "---" in line and line.startswith("|"):
            continue
        else:
            if head is not None:
                out.append((head, rows))
            head, rows = None, []
    if head is not None:
        out.append((head, rows))
    return out


def section(txt, n):
    """## n. 부터 다음 ## 까지."""
    m = re.search(r"^## %d\. [^\n]*\n(.*?)(?=^## |\Z)" % n, txt, re.M | re.S)
    return m.group(1) if m else ""


def weeks_of(txt, quarter):
    """4장. 주차마다 강의와 회차와 과제."""
    out = []
    for head, rows in tables(section(txt, 4)):
        if not head or "주차" not in head[0]:
            continue
        # Q2 부터는 머리줄에 회차와 초점이 있다. Q1 은 몸줄에 회차 칸이 있다
        rnd, focus = None, None
        m = re.search(r"(\d)회차 과제 \(초점 ([^)]+)\)", " ".join(head))
        if m:
            rnd, focus = int(m.group(1)), m.group(2).strip()
        has_round_col = "회차" in head
        for c in rows:
            wm = re.match(r"(\d+)주", c[0])
            if not wm:
                continue
            lec = [int(x) for x in re.findall(r"\d+", c[1])]
            if has_round_col:
                r = int(re.match(r"(\d)", c[2]).group(1))
                task = c[3]
                f = {1: "소리", 2: "청크", 3: "의미"}[r]
            else:
                r, f, task = rnd, focus, c[2]
            # **과제가 둘일 때가 있다.** 강의 둘이 서로 다른 과를 쓰는 주다.
            # 한 대본에서 둘을 찾는 것이 아니라 강마다 자기 과에서 하나씩 한다.
            parts = [x.strip() for x in task.split(" / ")] if " / " in task else [task]
            out.append({"week": int(wm.group(1)), "lectures": lec, "round": r,
                        "focus": f, "tasks": parts, "quarter": quarter.upper()})
    out.sort(key=lambda x: x["week"])
    return out


def collect_of(txt):
    """5장. 주마다 적어 올 것."""
    out = []
    for head, rows in tables(section(txt, 5)):
        if not head or "주차" not in head[0]:
            continue
        for c in rows:
            wm = re.match(r"(\d+)주", c[0])
            if not wm:
                continue
            row = {"week": int(wm.group(1)), "text": c[1]}
            if len(c) > 2 and c[2]:
                row["where"] = c[2]
            # 굵게 표시한 것이 2층 채집이다. 표시를 값으로 옮긴다
            row["layer2"] = "**" in c[1]
            row["text"] = re.sub(r"\*+", "", row["text"]).strip()
            out.append(row)
    out.sort(key=lambda x: x["week"])
    return out


def cross_of(txt):
    """6장. 회차마다 대조하는 법."""
    out = []
    for head, rows in tables(section(txt, 6)):
        if not head or "회차" not in head[0]:
            continue
        for c in rows:
            m = re.match(r"(\d)회", c[0])
            if m:
                out.append({"round": int(m.group(1)), "how": c[1]})
    return out


def avoid_of(txt):
    """8장. 안 하는 것. **Q1 은 목록이고 Q2 부터는 표다.** 둘 다 읽는다."""
    body = section(txt, 8)
    out = [{"what": re.sub(r"^- ", "", x).strip(), "why": ""}
           for x in body.split("\n") if x.startswith("- ")]
    if out:
        return out
    for head, rows in tables(body):
        if not head or "항목" not in head[0]:
            continue
        for c in rows:
            out.append({"what": c[0], "why": c[1] if len(c) > 1 else ""})
    return out


def main():
    items, bad = [], []
    for q in QUARTERS:
        p = os.path.join(SRC, "eng2p_input_%s.md" % q)
        if not os.path.exists(p):
            bad.append("조준표가 없다: %s" % p)
            continue
        txt = io.open(p, encoding="utf-8").read()
        w = weeks_of(txt, q)
        rec = {"quarter": q.upper(), "source": "out/input/eng2p_input_%s.md" % q,
               "weeks": w, "collect": collect_of(txt),
               "crosscheck": cross_of(txt), "avoid": avoid_of(txt)}
        for k in ["weeks", "collect", "crosscheck", "avoid"]:
            if not rec[k]:
                bad.append("%s 의 %s 가 비었다" % (q.upper(), k))
        items.append(rec)

    # **주차가 1부터 48까지 빠짐없이 한 번씩 나와야 한다.**
    # 조준표 넷이 12주씩 맡는다. 빠지면 그 주에 블록 1이 빈 화면이 된다.
    seen = {}
    for it in items:
        for w in it["weeks"]:
            seen.setdefault(w["week"], []).append(it["quarter"])
    for n in range(1, 49):
        if n not in seen:
            bad.append("%d주 과제가 없다" % n)
        elif len(seen[n]) > 1:
            bad.append("%d주가 두 분기에 있다: %s" % (n, seen[n]))

    if bad:
        for b in bad:
            print("[실패] " + b)
        print("")
        print("조준표 파생 실패 %d" % len(bad))
        return 1

    data = {"note": "조준표 파생. 손으로 고치지 않는다. scripts/derive_input.py 가 만든다",
            "generator": "scripts/derive_input.py", "count": len(items), "items": items}
    js = json.dumps(data, ensure_ascii=False, indent=1)
    io.open(os.path.join(OUT, "input.json"), "w", encoding="utf-8").write(js + "\n")
    io.open(os.path.join(OUT, "input.js"), "w", encoding="utf-8").write(
        "window.ENG2P_INPUT=" + js + ";\n")

    nw = sum(len(x["weeks"]) for x in items)
    nc = sum(len(x["collect"]) for x in items)
    l2 = sum(1 for x in items for c in x["collect"] if c.get("layer2"))
    two = sum(1 for x in items for w in x["weeks"] if len(w["tasks"]) > 1)
    print("  조준표 %d편 / 주차 과제 %d개 (과제 둘인 주 %d) / 채집 %d개 (2층 %d) / 실패 0"
          % (len(items), nw, two, nc, l2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
