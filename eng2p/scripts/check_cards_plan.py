#!/usr/bin/env python3
"""카드 배정 계획을 기준서 8.1과 대조한다.

사용법: python3 scripts/check_cards_plan.py [분기]
기본은 q1 이다.

보는 것
1. 번호가 1부터 150까지 빠짐없이 한 번씩 나오는가
2. 유형 합계가 기준서 8.1 표와 같은가
3. 강의가 선언한 카드 구간과 배정표의 강 배정이 같은가
4. 배정표가 어떤 강에 준 유형이 그 강의 본문에도 나오는가

3번과 4번이 이 스크립트의 핵심이다.
배정표만 검사하면 배정표 안에서만 앞뒤가 맞는 문서가 된다.
강의와 대조해야 둘 중 하나가 틀렸을 때 걸린다.
"""
import re
import sys
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

# 기준서 8.1 총량과 배분. 이 표는 손대지 않는다.
SPEC = {
    "q1": {"판정": 75, "압박": 25, "확장": 20, "역할": 10, "repair": 20},
    "q2": {"판정": 35, "압박": 40, "확장": 40, "역할": 15, "repair": 20},
    "q3": {"판정": 20, "압박": 45, "확장": 35, "역할": 25, "repair": 25},
    "q4": {"판정": 10, "압박": 25, "확장": 30, "역할": 55, "repair": 30},
}
TYPES = ["판정", "압박", "확장", "역할", "repair"]

FAIL = []
WARN = []


def fail(msg):
    FAIL.append(msg)
    print("[실패] %s" % msg)


def warn(msg):
    WARN.append(msg)
    print("[경고] %s" % msg)


ROW = re.compile(
    r"^\|\s*(\d{3})(?:\s*-\s*(\d{3}))?\s*\|\s*(\d{2})\s*\|\s*(\S+)\s*\|"
)


def read_plan(path):
    """배정표에서 (번호, 강, 유형) 을 뽑는다."""
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        m = ROW.match(line)
        if not m:
            continue
        a = int(m.group(1))
        b = int(m.group(2) or m.group(1))
        lec = int(m.group(3))
        ty = m.group(4)
        if ty not in TYPES:
            fail("알 수 없는 유형: %s (%s)" % (ty, line.strip()))
            continue
        if b < a:
            fail("구간이 거꾸로다: %s" % line.strip())
            continue
        for n in range(a, b + 1):
            rows.append((n, lec, ty))
    return rows


def check_coverage(rows, total):
    seen = {}
    for n, lec, ty in rows:
        if n in seen:
            fail("번호 중복: %03d (%d강, %d강)" % (n, seen[n][0], lec))
        seen[n] = (lec, ty)
    missing = [n for n in range(1, total + 1) if n not in seen]
    if missing:
        fail("번호 누락 %d개: %s" % (len(missing),
                                 ", ".join("%03d" % n for n in missing[:10])))
    extra = [n for n in seen if n > total]
    if extra:
        fail("범위 밖 번호: %s" % ", ".join("%03d" % n for n in sorted(extra)))
    return seen


def check_totals(seen, quarter):
    tgt = SPEC[quarter]
    got = {t: 0 for t in TYPES}
    for lec, ty in seen.values():
        got[ty] += 1
    print("\n유형 합계 (기준서 8.1 %s)" % quarter.upper())
    for t in TYPES:
        mark = "" if got[t] == tgt[t] else "  <-- 어긋남"
        print("  %-7s %3d / %3d%s" % (t, got[t], tgt[t], mark))
        if got[t] != tgt[t]:
            fail("%s형 %d장. 기준서 8.1은 %d장이다" % (t, got[t], tgt[t]))
    return got


LEC_RANGE = re.compile(r"^카드\s+(\d{3})\s*~\s*(\d{3})", re.M)


def check_lectures(seen, quarter):
    """강의 본문의 카드 선언과 배정표를 대조한다."""
    lec_dir = ROOT / "out" / "lectures"
    for path in sorted(lec_dir.glob("eng2p_%s_l0*.md" % quarter)):
        m = re.search(r"_l(\d{3})\.md$", path.name)
        lec = int(m.group(1))
        text = path.read_text(encoding="utf-8")
        rng = LEC_RANGE.search(text)
        if not rng:
            fail("%s: 카드 구간 선언이 없다. '카드 001 ~ 007' 형식으로 쓴다" % path.name)
            continue
        a, b = int(rng.group(1)), int(rng.group(2))

        planned = sorted(n for n, v in seen.items() if v[0] == lec)
        if not planned:
            fail("%s: 배정표에 %d강 항목이 없다" % (path.name, lec))
            continue
        if [a, b] != [planned[0], planned[-1]]:
            fail("%s: 선언 %03d~%03d, 배정표 %03d~%03d"
                 % (path.name, a, b, planned[0], planned[-1]))
        if planned != list(range(planned[0], planned[-1] + 1)):
            fail("%s: 배정표의 %d강 번호가 이어지지 않는다" % (path.name, lec))

        # 배정표가 준 유형이 본문에도 나오는가
        body = text[text.find("## 4. 드릴 연결"):text.find("## 5.")]
        for ty in {seen[n][1] for n in planned}:
            if ("%s형" % ty) not in body:
                warn("%s: 배정표는 %s형을 주는데 본문에 그 말이 없다"
                     % (path.name, ty))


def main():
    quarter = (sys.argv[1] if len(sys.argv) > 1 else "q1").lower()
    if quarter not in SPEC:
        print("분기는 q1~q4 중 하나다")
        return 2
    path = ROOT / "out" / "cards" / ("eng2p_card_plan_%s.md" % quarter)
    if not path.exists():
        print("배정표가 없다: %s" % path)
        return 2

    rows = read_plan(path)
    seen = check_coverage(rows, 150)
    check_totals(seen, quarter)
    check_lectures(seen, quarter)

    print("\n배정 %d장 / 실패 %d / 경고 %d" % (len(seen), len(FAIL), len(WARN)))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
