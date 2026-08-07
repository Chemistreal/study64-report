#!/usr/bin/env python3
"""강의의 블록별 분량 비중을 기준서 7.4와 대조한다.

사용법: python3 scripts/check_blocks.py [분기]
기본은 전 분기다.

기준서 7.2와 7.4가 서로 안 맞는다.
7.2의 블록별 절대 자수를 그대로 쓰면 어느 분기든 블록1+2가 63퍼센트다.
7.4는 Q1 45퍼센트에서 Q4 28퍼센트로 줄이라고 한다. 둘을 다 지킬 수가 없다.

어느 쪽이 맞는지는 사용자가 정한다. docs/spec.md 는 사용자만 고친다.
그래서 이 검사기는 한쪽 편을 들지 않는다.

- 절대 비중이 7.4 목표에서 벗어나면 **경고**로 낸다. 숫자는 항상 인쇄한다
- 분기가 갈수록 설명 비중이 줄어드는가는 **실패**로 낸다

방향은 7.4가 유일하게 주장하는 것이고 7.2와 안 부딪힌다.
7.2는 분기별로 다르게 하라는 말을 아예 안 하기 때문이다.
그래서 방향만 게이트로 걸고 절대값은 사용자 결정 전까지 숫자로만 남긴다.

이 판단은 state/journal.md 기준서 개정 대기 8번에 기록돼 있다.
"""
import re
import sys
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

BLOCKS = [
    "## 1. 원리",
    "## 2. 한국어 화자 함정",
    "## 3. 역할 지정",
    "## 4. 드릴 연결",
    "## 5. 통과 기준",
    "## 6. 다음 강 예고",
]

# 기준서 7.4. (블록1+2, 블록3+4) 목표 비중.
TARGET = {"q1": (45, 40), "q2": (40, 45), "q3": (33, 52), "q4": (28, 57)}

# 편당 허용 오차. 강의 한 편은 흔들려도 분기 평균이 맞으면 된다.
TOL_ONE = 8
TOL_AVG = 3

FAIL = []
WARN = []
MEASURED = {}


def n(s):
    return len(re.sub(r"\s", "", s))


def blocks_of(text):
    """블록별 자수를 센다. 머리말과 제목은 뺀다."""
    out = []
    for i, b in enumerate(BLOCKS):
        s = text.find(b)
        if s < 0:
            return None
        e = text.find(BLOCKS[i + 1]) if i + 1 < len(BLOCKS) else len(text)
        body = text[s + len(b):e]
        out.append(n(body))
    return out


def main():
    qs = [sys.argv[1].lower()] if len(sys.argv) > 1 else ["q1", "q2", "q3", "q4"]
    total_files = 0
    for q in qs:
        files = sorted((ROOT / "out" / "lectures").glob("eng2p_%s_l0*.md" % q))
        if not files:
            continue
        t12, t34 = TARGET[q]
        rows = []
        for f in files:
            b = blocks_of(f.read_text(encoding="utf-8"))
            if b is None:
                FAIL.append("%s: 블록을 못 찾았다" % f.name)
                continue
            tot = sum(b)
            p12 = (b[0] + b[1]) * 100.0 / tot
            p34 = (b[2] + b[3]) * 100.0 / tot
            rows.append((f.name, tot, p12, p34))
            total_files += 1

        if not rows:
            continue
        a12 = sum(r[2] for r in rows) / len(rows)
        a34 = sum(r[3] for r in rows) / len(rows)
        print("\n%s 강의 %d편. 목표 블록1+2 %d%% / 블록3+4 %d%%"
              % (q.upper(), len(rows), t12, t34))
        print("  분기 평균  1+2 %.1f%%  3+4 %.1f%%" % (a12, a34))

        MEASURED[q] = (a12, a34)
        if abs(a12 - t12) > TOL_AVG:
            WARN.append("%s 블록1+2 평균 %.1f%%. 7.4 목표 %d%% (개정 대기 8번)"
                        % (q.upper(), a12, t12))
        if abs(a34 - t34) > TOL_AVG:
            WARN.append("%s 블록3+4 평균 %.1f%%. 7.4 목표 %d%% (개정 대기 8번)"
                        % (q.upper(), a34, t34))

        for name, tot, p12, p34 in rows:
            bad = abs(p12 - t12) > TOL_ONE or abs(p34 - t34) > TOL_ONE
            if bad:
                WARN.append("%s: 1+2 %.1f%% / 3+4 %.1f%% (%d자)"
                            % (name, p12, p34, tot))

    # 방향 검사. 7.4가 주장하는 것은 분기가 갈수록 설명이 준다는 것이다.
    order = [q for q in ["q1", "q2", "q3", "q4"] if q in MEASURED]
    for a, b in zip(order, order[1:]):
        if MEASURED[b][0] > MEASURED[a][0] + 1:
            FAIL.append("%s 블록1+2 %.1f%% 가 %s %.1f%% 보다 크다. 7.4는 줄어야 한다고 쓴다"
                        % (b.upper(), MEASURED[b][0], a.upper(), MEASURED[a][0]))

    for w in WARN:
        print("[경고] %s" % w)
    for f in FAIL:
        print("[실패] %s" % f)
    print("\n검사 %d편 / 실패 %d / 경고 %d" % (total_files, len(FAIL), len(WARN)))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
