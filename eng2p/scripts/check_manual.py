#!/usr/bin/env python3
"""매뉴얼이 앱을 설명하는 자리를 앱과 견준다.

T155 에 매뉴얼을 앱 중심으로 다시 썼다. 그러면서 매뉴얼이 앱의 값을 말하게 됐다.
블록 이름과 분, 회차 초점 셋, 대본 가림 셋, 단추 자리다.

**설명하는 글은 설명 대상보다 늦게 낡는다.** 앱을 고치면 코드가 바뀌고 검사가 돈다.
매뉴얼은 아무도 안 건드린다. 그리고 두 사람은 매뉴얼을 믿는다.
T154 에 회차를 바꿨을 때 매뉴얼 10.2 가 옛말을 하고 있었다. 손으로 알아채고 고쳤다.
**손으로 알아채는 것은 다음에 안 된다.**

그래서 견준다. 매뉴얼에 적힌 값과 `english.html` 안의 값이 같은지만 본다.
글이 좋은지는 안 본다. 그것은 사람이 본다.

쓰는 법:
    python3 scripts/check_manual.py

규격: docs/roadmap.md 11.11
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MAN = ROOT / "out" / "manual" / "eng2p_manual.md"
APP = ROOT.parent / "english.html"

FAIL = []


def main():
    if not MAN.exists() or not APP.exists():
        print("[실패] 매뉴얼이나 앱이 없다")
        return 1
    man = MAN.read_text(encoding="utf-8")
    app = APP.read_text(encoding="utf-8")

    # 1. 블록 넷의 이름과 분. 앱의 BLOCKS 가 원본이다.
    blocks = re.findall(r'\{n:"([^"]+)",m:(\d+)', app)
    if len(blocks) != 4:
        FAIL.append("앱에서 블록 넷을 못 찾았다: %d개" % len(blocks))
    else:
        for i, (name, m) in enumerate(blocks, 1):
            row = re.search(r"^\| %d %s \| (\d+)분 \|" % (i, re.escape(name)), man, re.M)
            if not row:
                FAIL.append("매뉴얼 2.2 표에 '%d %s' 줄이 없다" % (i, name))
            elif row.group(1) != m:
                FAIL.append("블록 %d 이 앱은 %s분 매뉴얼은 %s분이다" % (i, m, row.group(1)))
        total = sum(int(m) for _, m in blocks)
        if total != 120:
            FAIL.append("블록 합이 %d분이다. 120분이어야 한다" % total)

    # 2. 회차 초점 셋. 순서까지 같아야 한다.
    focus = re.findall(r'"([0-9])회차 초점은 ([가-힣]+)다', app)
    got = [w for _, w in sorted(focus, key=lambda x: x[0])]
    if got != ["소리", "청크", "의미"]:
        FAIL.append("앱의 회차 초점이 %s 다. 소리 청크 의미여야 한다" % " ".join(got) if got
                    else "앱에서 회차 초점 셋을 못 찾았다")
    for n, word in zip(("1회차", "2회차", "3회차"), ("소리", "청크", "의미")):
        # 매뉴얼 10.2 표와 6장 카드 둘 다에 있어야 한다
        if not re.search(r"\| %s[^|]*\| %s" % (n, word), man):
            FAIL.append("매뉴얼 10.2 회차 표에 %s %s 줄이 없다" % (n, word))

    # 3. 대본 가림. veilOf 가 원본이다. 0이 다 보임, 1이 덩어리만, 2가 가림이다.
    m = re.search(r"function veilOf\(round\)\{[^}]*?return round===1 \? (\d) : "
                  r"round===2 \? (\d) : (\d);", app, re.S)
    if not m:
        FAIL.append("앱에서 veilOf 를 못 읽었다. 회차마다 가림이 다른지 볼 수 없다")
    else:
        want = {"1": "가림", "2": "덩어리만", "3": "다 보임"}
        veilname = ["다 보임", "덩어리만", "가림"]
        for i, v in enumerate(m.groups(), 1):
            if veilname[int(v)] != want[str(i)]:
                FAIL.append("앱에서 %d회차 가림이 %s 다. %s 여야 한다"
                            % (i, veilname[int(v)], want[str(i)]))
            if want[str(i)] not in man:
                FAIL.append("매뉴얼에 %d회차 가림(%s) 이 안 적혀 있다" % (i, want[str(i)]))

    # 4. 끝냈다 단추 자리. 앱은 같이 듣는 자리에만 낸다. 매뉴얼도 그렇게 말해야 한다.
    if 'seat==="together"' not in app:
        FAIL.append("앱이 끝냈다 단추를 자리로 안 가른다")
    if "블록 4에만 있다" not in man and "블록 4에서 회차 끝냈다" not in man:
        FAIL.append("매뉴얼에 끝냈다 단추가 블록 4에만 있다는 말이 없다")

    for f in FAIL:
        print("[실패] %s" % f)
    print()
    print("매뉴얼과 앱 대조 / 블록 4개 / 회차 3개 / 가림 3개 / 단추 자리 1개 / 실패 %d" % len(FAIL))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
