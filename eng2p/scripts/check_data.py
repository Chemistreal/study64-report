#!/usr/bin/env python3
"""JSON 과 강의록이 같은 값을 들고 있는지 견준다.

`check_derived.py` 는 JSON 을 다시 뽑아 견준다. 그것으로는 파서의 잘못을 못 잡는다.
같은 파서로 두 번 뽑으면 두 번 다 같게 틀리기 때문이다.

여기서는 다른 것과 견준다. 강의록은 마크다운이고 JSON 은 데이터인데
둘 다 같은 강의에서 나왔으므로 같은 값을 들고 있어야 한다.
**둘이 다르면 적어도 하나는 틀린 것이다.** 어느 쪽인지는 강의를 보고 정한다.

여섯 가지를 본다.

1. 강 번호와 제목이 같은가
2. 카드 범위가 같은가
3. 미디어가 같은가
4. 압박 제한시간과 카드별 시간이 같은가
5. 배분 문장이 같은가
6. 기록 항목 수가 같은가

사용법:
    python3 scripts/check_data.py

종료 코드 0이면 통과다.
규격: docs/roadmap.md 11.6
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "out" / "data" / "lectures.json"
HAND = ROOT / "out" / "handouts"
SETS = ROOT / "out" / "sets"

FAIL = []


def cmp(n, what, a, b):
    if a != b:
        FAIL.append("%d강 %s: JSON 은 %r 인데 강의록은 %r 이다" % (n, what, a, b))


def main():
    if not DATA.exists():
        print("[실패] %s 가 없다. derive_data.py 를 먼저 돌린다" % DATA.name)
        return 1
    data = json.loads(DATA.read_text(encoding="utf-8"))
    items = {it["no"]: it for it in data["items"]}
    if sorted(items) != list(range(1, 97)):
        FAIL.append("JSON 강 번호가 1부터 96까지가 아니다")

    for n, it in sorted(items.items()):
        f = HAND / ("eng2p_handout_l%03d.md" % n)
        if not f.exists():
            FAIL.append("%d강 강의록이 없다" % n)
            continue
        h = f.read_text(encoding="utf-8")

        m = re.search(r"^# (\d+)강 강의록\. (.+)$", h, re.M)
        cmp(n, "번호", n, int(m.group(1)))
        cmp(n, "제목", it["title"], m.group(2).strip())

        m = re.search(r"^카드 (\d{3}) ~ (\d{3})$", h, re.M)
        want = {"from": int(m.group(1)), "to": int(m.group(2))} if m else None
        cmp(n, "카드 범위", it["cards"], want)

        m = re.search(r"^미디어 (\S+)$", h, re.M)
        cmp(n, "미디어", it["media"], m.group(1) if m else None)

        m = re.search(r"^압박형 제한 시간 (\d+)초$", h, re.M)
        cmp(n, "제한시간", it["pressureSeconds"], int(m.group(1)) if m else None)

        m = re.search(r"^카드별 시간 (.+)$", h, re.M)
        want = []
        if m:
            for part in m.group(1).split(" / "):
                a, b = re.match(r"(\d{3}) (\d+)초", part.strip()).groups()
                want.append({"card": int(a), "seconds": int(b)})
        cmp(n, "카드별 시간", it["cardSeconds"], want)

        m = re.search(r"## 3\. 30분 진행표\n\n(.*?)\n", h, re.S)
        cmp(n, "배분", it["plan"]["split"], m.group(1).strip() if m else None)

        m = re.search(r"## 5\. 기록 칸\n(.*?)\n날짜 ", h, re.S)
        got = len(re.findall(r"^\d+\. ", m.group(1), re.M)) if m else 0
        cmp(n, "기록 항목 수", len(it["criteria"]), got)

        m = re.search(r"^역할: (.+)$", h, re.M)
        cmp(n, "역할", it["role"], m.group(1).strip() if m else None)

    # 주차는 세트가 원본이다. JSON 이 그것을 옮겨 적었는지 본다.
    for f in sorted(SETS.glob("eng2p_set_w*.md")):
        w = int(re.search(r"_w(\d+)", f.name).group(1))
        m = re.search(r"^대응강의:\s*(.+)$", f.read_text(encoding="utf-8"), re.M)
        for x in (m.group(1).split(",") if m else []):
            n = int(x.strip()[-3:])
            if items.get(n, {}).get("week") != w:
                FAIL.append("%d강 주차: JSON 은 %r 인데 세트는 %d주차다"
                            % (n, items.get(n, {}).get("week"), w))

    for m in FAIL:
        print("[실패] %s" % m)
    print()
    print("강의 %d편 / 견준 항목 9가지" % len(items))
    print("실패 %d" % len(FAIL))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
