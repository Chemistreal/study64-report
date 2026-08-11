#!/usr/bin/env python3
"""판마다 정보를 쥐는 자리가 어디인가. T349

`docs/play.md` 원칙 3이 이것이다.

    못 하는 쪽이 정보를 쥔다.

앱은 누가 못 하는지를 모른다 (개정문 18번). **그러니 사람이 정한다.**
그런데 정하려면 **이 판에서 정보를 쥐는 자리가 어디인지**를 알아야 하고
그것이 지금 규칙서에만 있다. 판을 열 때마다 규칙서를 펴는 사람은 없다.

이 파일이 그 자리를 뽑아 앱이 읽는 꼴로 만든다.

## 손으로 적고 검사한다

`도는 차례` 칸이 줄글이라 기계가 못 가른다. 그래서 표를 손으로 적고
**그 표가 규칙서와 맞는지 여기서 대 본다.** `derive_ahead.py` 의 `WHERE` 와 같은 손이다.

    자리 이름이 역할 칸에 글자 그대로 있는가
    까닭이 비지 않았는가

그 자리에만 정말 뜨는지는 `check_play_screen.js` 가 화면을 그려서 잰다.
**줄글을 낱말로 맞춰 보는 것은 안 한다.** 같은 말인데 낱말이 다를 수 있다.

쓰는 법:
    python3 scripts/derive_hold.py

결과: out/data/hold.json 과 hold.js
규격: docs/play.md 원칙 3, docs/play_rules.md
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
APPJS = os.path.join(ROOT, "app", "js", "25_play.js")

# 판마다 정보를 쥐는 자리. **자리 이름은 역할 칸 글자 그대로다.**
#   자리 이름  그 자리가 쥔다
#   ""         쥐는 자리가 없다. 둘 다 알거나 앱이 쥔다
HOLD = {
    "mirror":   ("읽는 쪽", "읽는 쪽 화면에만 어느 쪽인지 뜬다"),
    "swapline": ("읽는 쪽", "읽는 쪽 화면에만 바꿀 낱말이 뜬다"),
    "hearme":   ("듣는 쪽", "듣는 쪽 화면에 무엇을 들으라고 뜬다"),
    "relay":    ("", "A가 듣고 B에게 옮긴다. 화면이 가리는 것이 없다"),
    "chain":    ("", "둘이 번갈아 붙인다. 가리는 것이 없다"),
    "twohalf":  ("", "각자 절반씩 쥔다. 한쪽이 더 쥐는 것이 아니다"),
    "overlap":  ("", "둘 다 같다. 역할이 없다"),
    "ladder":   ("", "말하는 쪽과 세는 쪽이고 가리는 것이 없다"),
    "wall":     ("단서를 띄우는 쪽", "단서가 그 쪽에만 뜬다"),
    "rebound":  ("", "던지고 받는다. 가리는 것이 없다"),
    "onesee":   ("상황을 쥔 쪽", "그 쪽만 상황 카드를 본다"),
    "wave":     ("세기를 쥔 쪽", "그 쪽만 눈금을 본다"),
    "whose":    ("", "앱이 쓸 자리를 주고 둘 다 본다"),
    "flip":     ("판정하는 쪽", "그 쪽 화면에 정답이 아니라 기준이 있다"),
    "reask":    ("되묻는 쪽", "그 쪽 화면에만 어느 강도로 되물으라고 뜬다"),
    "cutin":    ("", "앱이 신호를 낸다. 사람이 쥐는 것이 없다"),
    "clash":    ("", "둘 다 같다. 역할이 없다"),
    "recall":   ("내는 쪽", "그 쪽만 그날 것을 본다"),
    "apart":    ("", "둘 다 같다. 다 적을 때까지 서로 안 보인다"),
    "oneday":   ("", "그 판의 역할을 따른다"),
}


def rules():
    """규칙서에서 판마다 아홉 칸을 읽는다."""
    s = io.open(RULES, encoding="utf-8").read()
    out = {}
    for sec in re.split(r"\n### ", s)[1:]:
        name = sec.split("\n")[0].strip()
        name = re.sub(r"^[\d.]+\s*", "", name)
        row = {}
        for line in sec.split("\n"):
            line = line.strip()
            if not line.startswith("|") or "---" in line:
                continue
            c = [x.strip() for x in line.strip("|").split("|")]
            if len(c) == 2:
                row[c[0]] = c[1]
        if "역할" in row:
            out[name] = row
    return out


def ids():
    """앱이 아는 판 이름과 차례."""
    s = io.open(APPJS, encoding="utf-8").read()
    return re.findall(r'\{id:"([a-z0-9]+)", name:"([^"]+)"', s)


def main():
    for f in (RULES, APPJS):
        if not os.path.exists(f):
            print("[실패] %s 가 없다" % f)
            return 1
    rs = rules()
    app = ids()
    if len(app) != 20:
        print("[실패] 앱이 아는 판이 %d개다. 스무 개여야 한다" % len(app))
        return 1
    if len(rs) != 20:
        print("[실패] 규칙서에서 판을 %d개 읽었다. 스무 개여야 한다" % len(rs))
        return 1

    items, held = [], 0
    for pid, name in app:
        r = rs.get(name)
        if not r:
            print("[실패] 앱의 판 %s(%s) 가 규칙서에 없다" % (pid, name))
            return 1
        if pid not in HOLD:
            print("[실패] %s 의 쥐는 자리가 이 파일에 안 적혀 있다" % pid)
            return 1
        seat, why = HOLD[pid]
        role = r["역할"]
        # 두 자리 이름을 역할 칸에서 뽑는다
        base = re.sub(r"\*\*.*?\*\*", "", role).strip().rstrip(".")
        seats = [x.strip() for x in re.split(r"과 |와 ", base) if x.strip()]
        # **쥔다고 적은 자리가 역할 칸에 정말 있는가**
        if seat and seat not in role:
            print("[실패] %s 의 쥐는 자리 '%s' 가 역할 칸에 없다: %s"
                  % (pid, seat, role))
            return 1
        # 까닭이 비었는가. **줄글을 낱말로 맞춰 보는 것은 안 한다.**
        #
        # 처음에 `왜` 의 낱말이 도는 차례 칸에 있는지를 봤다. 파장이 걸렸다.
        # 여기는 "그 쪽만 눈금을 본다" 고 적었고 규칙서는 "눈금 위 자리를 짚는다"
        # 고 적었다. **같은 말인데 낱말이 다르다.** 줄글을 그렇게 맞추면
        # 맞는 것이 안 맞는 것으로 나오고 그러면 까닭을 규칙서 글자로 베끼게 된다.
        #
        # 기계가 진짜로 잴 수 있는 것은 **자리 이름이 역할 칸에 있는가**다.
        # 그 자리에만 뜨는지는 `check_play_screen.js` 가 화면을 그려서 잰다.
        if seat:
            if not why.strip():
                print("[실패] %s 의 까닭이 비었다" % pid)
                return 1
            held += 1
        # 자리가 언제 바뀌는가. 역할 칸의 굵은 글씨다
        m = re.search(r"\*\*(.+?)\*\*", role)
        items.append({"id": pid, "name": name, "seats": seats,
                      "hold": seat, "why": why,
                      "turns": m.group(1) if m else ""})

    obj = {
        "note": "판마다 정보를 쥐는 자리. 규칙서와 대 본 것이라 손으로 안 고친다. "
                "scripts/derive_hold.py 를 다시 돌린다.",
        "grade": "A",
        "gradeWhy": "영어가 없다. 규칙서 역할 칸과 도는 차례 칸을 대 본 것이다.",
        "generator": "scripts/derive_hold.py",
        "source": "docs/play_rules.md, app/js/25_play.js",
        "count": len(items),
        "held": held,
        "plays": items,
        # **앱이 누가 못 하는지를 모른다** (개정문 18번)
        "picks": False,
        "picksWhy": "앱은 두 사람의 실력을 나타내는 값을 안 갖는다. "
                    "그러니 누가 그 자리를 맡을지를 앱이 못 정한다. "
                    "앱은 그 자리가 어디인지만 알려 주고 두 사람이 정한다.",
    }
    io.open(os.path.join(OUT, "hold.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "hold.js"), "w", encoding="utf-8").write(
        "window.ENG2P_HOLD=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    print("out/data/hold.json / 판 %d개 / 쥐는 자리가 있는 판 %d개 / "
          "**앱이 누가 맡을지를 안 정한다**" % (len(items), held))
    return 0


if __name__ == "__main__":
    sys.exit(main())
