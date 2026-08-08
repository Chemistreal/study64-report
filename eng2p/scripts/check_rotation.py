#!/usr/bin/env python3
"""회전 대장의 셈을 등록부에서 다시 세어 견준다.

`state/rotation.md` 는 손으로 쓰는 파일이다. 3.1 등록부에 한 줄을 더할 때
4장 카운터 셋과 4.4 조합 목록도 손으로 같이 올린다.

**손으로 올리는 숫자는 언젠가 안 올라간다.** 대장 본문이 스스로 그렇게 적어 뒀다.
"숫자를 안 올리면 이 대장은 아무 일도 하지 않는 파일이 된다."

그 문장은 맞는데 그것을 아무도 안 봤다. T67 에 48주 전수 판정을 한 번 했고
그 뒤로 손으로만 갔다. 그래서 T156 에 기계가 다시 세게 했다.

이 검사가 보는 것은 넷이다.

1. 4.1 4.2 4.3 카운터가 3.1 등록부를 다시 센 값과 같은가
2. 4.4 조합 목록이 등록부의 조합과 같은가. 그리고 같은 조합이 두 번 있는가
3. 5장 경보 다섯이 지금도 다 통과인가
4. 5.1 에 적어 둔 판정 값이 지금 값과 같은가

**글이 좋은지는 안 본다.** 숫자가 서로 맞는지만 본다.

쓰는 법:
    python3 scripts/check_rotation.py

규격: docs/roadmap.md 11.11
"""
import collections
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ROT = ROOT / "state" / "rotation.md"

FAIL, WARN = [], []

# 5장 경보의 선. 대장 5장이 정하는 값이다.
REL_MAX = 0.30      # 한 관계가 누적 30%를 넘으면 경보
FUN_MAX = 0.20      # 한 기능이 누적 20%를 넘으면 경보
EXT_MIN = 0.15      # 확장 넷 합계가 15% 미만이면 경보
DOMAIN_MIN = 5      # 영역마다 최소 등장
EXT = {"D09", "D10", "D11", "D12"}
DEFAULTS = {"D01", "R2", "F10"}   # 기본값 회귀. 둘 이상 겹치면 경보


def table(text, head):
    """머리글이 있는 표의 줄들을 낸다. 표 밖으로 나가면 멈춘다."""
    i = text.find(head)
    if i < 0:
        return []
    out = []
    for ln in text[i:].split("\n")[1:]:
        if not ln.startswith("|"):
            if out:
                break
            continue
        cells = [c.strip() for c in ln.strip("|").split("|")]
        if set("".join(cells)) <= set("-: "):
            continue
        out.append(cells)
    return out


def main():
    if not ROT.exists():
        print("[실패] %s 가 없다" % ROT)
        return 1
    t = ROT.read_text(encoding="utf-8")

    # 3.1 등록부. 이것이 원본이다.
    rows = [c for c in table(t, "### 3.1 현재 등록 내역")
            if len(c) >= 7 and re.fullmatch(r"D\d\d", c[3])]
    if not rows:
        print("[실패] 3.1 등록부를 못 읽었다")
        return 1
    n = len(rows)
    dom = collections.Counter(c[3] for c in rows)
    rel = collections.Counter(c[4] for c in rows)
    fun = collections.Counter(c[5] for c in rows)
    combos = [(c[3], c[4], c[5]) for c in rows]

    # 1. 카운터 셋을 다시 센 값과 견준다
    for head, counted, label in (("### 4.1 영역 카운터", dom, "영역"),
                                 ("### 4.2 관계 카운터", rel, "관계"),
                                 ("### 4.3 기능 카운터", fun, "기능")):
        got = {}
        for c in table(t, head):
            if not re.fullmatch(r"[DRF]\d+", c[0]):
                continue
            num = [x for x in c if re.fullmatch(r"\d+", x)]
            if num:
                got[c[0]] = int(num[0])
        if not got:
            FAIL.append("%s 카운터 표를 못 읽었다" % label)
            continue
        for code in sorted(set(got) | set(counted)):
            if got.get(code, 0) != counted.get(code, 0):
                FAIL.append("%s %s: 대장이 %s 인데 등록부를 세면 %d 이다"
                            % (label, code, got.get(code, "없음"), counted.get(code, 0)))

    # 2. 4.4 조합 목록. 등록부와 같아야 하고 겹치는 것이 없어야 한다.
    listed = set()
    m = re.search(r"이미 쓴 조합 목록:\n```\n(.*?)```", t, re.S)
    if not m:
        FAIL.append("4.4 조합 목록을 못 읽었다")
    else:
        for ln in m.group(1).split("\n"):
            g = re.match(r"(D\d\d)-(R\d)-(F\d\d)", ln.strip())
            if g:
                listed.add(g.groups())
        here = set(combos)
        for c in sorted(here - listed):
            FAIL.append("4.4 목록에 없는 조합이 등록부에 있다: %s-%s-%s" % c)
        for c in sorted(listed - here):
            FAIL.append("4.4 목록에만 있고 등록부에 없는 조합이다: %s-%s-%s" % c)
    dup = [c for c, k in collections.Counter(combos).items() if k > 1]
    for c in sorted(dup):
        WARN.append("같은 조합을 두 번 썼다: %s-%s-%s (%d번)"
                    % (c + (collections.Counter(combos)[c],)))

    # 3. 5장 경보 다섯
    alarms = []
    big_r = rel.most_common(1)[0] if rel else ("", 0)
    if big_r[1] / n > REL_MAX:
        alarms.append("관계 편중: %s 가 %.1f%%" % (big_r[0], big_r[1] / n * 100))
    big_f = fun.most_common(1)[0] if fun else ("", 0)
    if big_f[1] / n > FUN_MAX:
        alarms.append("기능 편중: %s 가 %.1f%%" % (big_f[0], big_f[1] / n * 100))
    ext = sum(v for k, v in dom.items() if k in EXT)
    if ext / n < EXT_MIN:
        alarms.append("확장 영역 부족: 합계가 %.1f%%" % (ext / n * 100))
    thin = sorted(k for k in ("D%02d" % i for i in range(1, 13))
                  if dom.get(k, 0) < DOMAIN_MIN)
    if thin:
        alarms.append("영역 방치: %s 가 %d회 미만" % (" ".join(thin), DOMAIN_MIN))
    back = [c for c in combos if len(set(c) & DEFAULTS) >= 2]
    if back:
        alarms.append("기본값 회귀: %d건" % len(back))
    for a in alarms:
        FAIL.append("5장 경보가 걸렸다. %s" % a)

    # 4. 5.1 에 적어 둔 판정 값이 지금 값과 같은가.
    #    **정해진 한 문장만 본다.** 아무 데나 나온 숫자를 보면 지난 판정을 설명하는
    #    문장까지 걸린다. 실제로 그렇게 만들었다가 T156 에 스스로 걸렸다.
    said = re.search(r"\*\*지금 등록은 (\d+)건이다\.\*\*", t)
    if not said:
        FAIL.append("5.1 에 '지금 등록은 N건이다' 문장이 없다. 전수 판정 값이 어디인지 알 수 없다")
    elif int(said.group(1)) != n:
        FAIL.append("5.1 이 등록 %s건이라 하는데 지금 %d건이다. 전수 판정을 다시 적는다"
                    % (said.group(1), n))

    for w in WARN:
        print("[경고] %s" % w)
    for f in FAIL:
        print("[실패] %s" % f)
    print()
    print("등록 %d건 / 관계 최대 %s %.1f%% / 기능 최대 %s %.1f%% / 확장 %.1f%% / "
          "영역 최소 %d회 / 조합 중복 %d / 실패 %d / 경고 %d"
          % (n, big_r[0], big_r[1] / n * 100, big_f[0], big_f[1] / n * 100,
             ext / n * 100, min(dom.get("D%02d" % i, 0) for i in range(1, 13)),
             len(dup), len(FAIL), len(WARN)))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
