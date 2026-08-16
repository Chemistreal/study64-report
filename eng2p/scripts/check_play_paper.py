#!/usr/bin/env python3
"""판 종이가 규칙서와 같은 말을 하는가 (T399).

파생 파일이라 손으로 안 고친다. 그런데 **파생시킨 것과 원본이 어긋날 수 있다.**
원본을 고치고 다시 안 돌리면 그렇다. `check_derived.py` 가 앱에 하는 일을
이 종이에 한다.

그리고 하나 더 본다. **종이로 안 도는 판을 돈다고 안 적었는가.**
그것이 이 종이의 값이다. 기기가 없는 날에 펴는 종이인데 거기 적힌 판이
소리를 요구하면 두 사람은 그 자리에서 막힌다.

사용법:
    python3 scripts/check_play_paper.py
"""
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAPER = os.path.join(ROOT, "out", "manual", "eng2p_play_paper.md")
SOLO = os.path.join(ROOT, "docs", "solo_plays.md")
RULES = os.path.join(ROOT, "docs", "play_rules.md")

FAIL = []
n = 0


def main():
    global n
    if not os.path.exists(PAPER):
        print("[실패] out/manual/eng2p_play_paper.md 가 없다. "
              "python3 scripts/derive_play_paper.py 를 돌린다")
        return 1
    txt = open(PAPER, encoding="utf-8").read()

    # 1. **다시 뽑아서 견준다.** 원본을 고치고 안 돌렸으면 여기서 갈린다
    n += 1
    r = subprocess.run([sys.executable,
                        os.path.join(ROOT, "scripts", "derive_play_paper.py")],
                       capture_output=True, text=True)
    if r.returncode:
        FAIL.append("다시 뽑는 데 실패했다: " + (r.stdout or r.stderr).strip()[:120])
    else:
        again = open(PAPER, encoding="utf-8").read()
        if again != txt:
            FAIL.append("종이가 원본과 어긋났다. derive_play_paper.py 를 다시 돌린다")
        txt = again

    # 2. 판 스물이 다 있는가. **번호가 빠지면 그 판을 못 찾는다**
    n += 1
    nums = [int(m.group(1)) for m in re.finditer(r"^## (\d+)\. ", txt, re.M)]
    if sorted(nums) != list(range(1, 21)):
        FAIL.append("판 번호가 1~20 이 아니다: %s" % nums)

    # 3. **종이로 안 도는 판을 돈다고 안 적었는가.** 이 종이의 값이 여기 있다.
    #
    # 이 판의 한계를 적어 둔다. `solo_plays.md` 가 그 사실의 **원본**이다.
    # 그 표를 고치면 종이도 바뀌고 이 판도 같이 속는다. 둘이 같은 것을 본다.
    # 여기서 잡는 것은 **원본을 고치고 다시 안 뽑은 자리**와
    # **파생물을 손으로 고친 자리**다. 원본이 틀린 것은 사람이 본다.
    # 그 표는 T202 에 판마다 역할과 도는 차례를 읽고 정했고 검증로그가 붙어 있다.
    n += 1
    solo = open(SOLO, encoding="utf-8").read()
    m = re.search(r"^\| # \| 판 \| 종이로 \| 왜 \|$", solo, re.M)
    off = []
    if not m:
        FAIL.append("solo_plays.md 에서 종이 표를 못 찾았다")
    else:
        for r2 in re.finditer(r"^\| (\d+) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|\s*$",
                              solo[m.end():], re.M):
            how = r2.group(3).replace("**", "").strip()
            if "안 돈다" in how:
                off.append((int(r2.group(1)), r2.group(2).strip()))
    for no, name in off:
        blk = re.search(r"^## %d\. %s$(.*?)(?=^## |\Z)" % (no, re.escape(name)),
                        txt, re.M | re.S)
        if not blk:
            FAIL.append("%d. %s 자리가 종이에 없다" % (no, name))
            continue
        body = blk.group(1)
        if "안 돈다" not in body:
            FAIL.append("%s 는 종이로 안 도는데 종이에 그 말이 없다" % name)
        # **안 도는 판에 도는 차례를 적지 않는다.** 적으면 돌 수 있는 줄 안다
        if "| 도는 차례 |" in body:
            FAIL.append("%s 는 종이로 안 도는데 도는 차례가 적혀 있다" % name)
    n += len(off) * 2

    # 4. **적는 칸이 있는가.** 앱이 세던 값을 종이에서는 사람이 적는다
    n += 1
    runs = len(nums) - len(off)
    boxes = len(re.findall(r"^적는 칸 \(", txt, re.M))
    if boxes != runs:
        FAIL.append("도는 판이 %d개인데 적는 칸이 %d개다" % (runs, boxes))

    # 5. **사람별 칸이 없는가.** 원칙 1이 막는 자리다 (docs/play.md)
    n += 1
    bad = re.findall(r"(남편|아내|A 가|B 가)\s*\d", txt)
    if bad:
        FAIL.append("사람별 칸이 생겼다: %s" % " ".join(bad[:4]))

    # 6. **판정을 사람이 한다고 적혀 있는가.** 종이에는 판정할 앱이 없다
    n += 1
    if "| 판정 |" not in txt:
        FAIL.append("판정 칸이 하나도 안 옮겨졌다")

    # 7. 규칙서에 있는 판 이름이 종이에 다 있는가
    n += 1
    rules = open(RULES, encoding="utf-8").read()
    names = [m2.group(3).strip() for m2 in
             re.finditer(r"^### (\d+)\.(\d+) (.+)$", rules, re.M)
             if 3 <= int(m2.group(1)) <= 12]
    miss = [x for x in names if ("## " + x) not in txt.replace(". ", ". ")
            and re.search(r"^## \d+\. %s$" % re.escape(x), txt, re.M) is None]
    if miss:
        FAIL.append("규칙서의 판이 종이에 없다: %s" % " ".join(miss))

    for f in FAIL:
        print("[실패] " + f)
    print("")
    print("**기계가 안 보는 것: 그 종이 한 장으로 두 시간이 도는가**")
    print("판 종이 %d판 (판 %d개, 종이로 안 도는 판 %d) / 실패 %d"
          % (n, len(nums), len(off), len(FAIL)))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
