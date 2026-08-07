#!/usr/bin/env python3
"""화자 수를 대본에서 파생시키고 분기를 규격대로 재배치한다.

화자 수를 사람이 적으면 경고를 없애려고 숫자를 낮출 수 있다.
그래서 사람 판단에서 빼내 대본에서 기계로 뽑는다.
이 스크립트가 정답을 만들고 check_media.py 가 그것과 대조한다.

사용법:
    python3 eng2p/scripts/derive_speakers.py --check   집계만 출력
    python3 eng2p/scripts/derive_speakers.py --write   카탈로그와 대본을 고친다

규격: eng2p/docs/collab.md 5.5
"""
import json
import pathlib
import re
import sys
import collections

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
CAT = ROOT / "media/english/catalog.json"
CATJS = ROOT / "media/english/catalog.js"

# 화자 이름 정규화 규칙. 이 규칙이 화자 수의 정의다.
#   - 뒤에 붙는 소유격 voice 는 떼어낸다. Anna's voice 와 Anna 는 한 사람이다
#   - 대소문자와 공백은 무시한다
#   - 끝의 마침표는 뗀다
LABEL_RE = re.compile(r"^([A-Z][A-Za-z .'’-]{0,24}?):\s")


def norm(name):
    n = name.strip().rstrip(".").strip()
    n = re.sub(r"['’]s\s+voice$", "", n, flags=re.I).strip()
    n = re.sub(r"\s+", " ", n)
    return n.lower()


def speakers(md_path):
    """대본 파일에서 화자 목록을 뽑는다. 등장 순서를 지킨다."""
    text = (ROOT / md_path).read_text(encoding="utf-8")
    if "## 대본" not in text:
        return []
    body = text.split("## 대본", 1)[1]
    out = []
    for ln in body.split("\n"):
        ln = ln.strip()
        if not ln or ln.startswith("#"):
            continue
        m = LABEL_RE.match(ln)
        if not m:
            continue
        k = norm(m.group(1))
        if k and k not in out:
            out.append(k)
    return out


def quarter_for(n, rank, half):
    """기준서 10.2 재료 조건에서 분기를 정한다.

    Q1 1~2인 / Q2 2인 / Q3 2~3인 / Q4 3인 이상.
    Q1 조건이 Q2 조건을 삼키므로 2인 이하는 레슨 순서로 반씩 가른다.
    VOA Level 1 은 레슨 순서가 곧 난이도 순이라 앞쪽이 Q1 이다.
    """
    if n <= 2:
        return 1 if rank < half else 2
    if n == 3:
        return 3
    return 4


def main():
    write = "--write" in sys.argv
    cat = json.loads(CAT.read_text(encoding="utf-8"))
    items = cat["items"]

    rows = []
    for it in items:
        names = speakers(it["transcript"])
        rows.append({"it": it, "names": names, "n": len(names)})

    small = [r for r in rows if r["n"] <= 2]
    small.sort(key=lambda r: r["it"]["lesson"])
    half = len(small) // 2
    rank = {id(r): i for i, r in enumerate(small)}

    changed = []
    for r in rows:
        it, n = r["it"], r["n"]
        q = quarter_for(n, rank.get(id(r), 0), half)
        d = []
        if it.get("speakerCount") != n:
            d.append(("speakerCount", it.get("speakerCount"), n))
        if it.get("quarter") != q:
            d.append(("quarter", it.get("quarter"), q))
        if d:
            changed.append((it["id"], d, r["names"]))
        if write:
            it["speakerCount"] = n
            it["quarter"] = q

    for cid, d, names in changed:
        parts = ", ".join("%s %s -> %s" % (f, a, b) for f, a, b in d)
        print("%-10s %s" % (cid, parts))
        if any(f == "speakerCount" for f, _, _ in d):
            print("%-10s   화자: %s" % ("", ", ".join(names)))

    dist = collections.Counter(
        (it["quarter"] if write else quarter_for(
            r["n"], rank.get(id(r), 0), half)) for r, it in ((r, r["it"]) for r in rows))
    spk = collections.Counter(r["n"] for r in rows)
    print("\n변경 %d건 / 전체 %d건" % (len(changed), len(rows)))
    print("화자 분포: %s" % dict(sorted(spk.items())))
    print("분기 분포: %s" % dict(sorted(dist.items())))

    if not write:
        print("\n--write 를 붙이면 카탈로그와 대본을 고친다")
        return 0

    CAT.write_text(json.dumps(cat, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    CATJS.write_text("window.ENG_MEDIA_CATALOG=" +
                     json.dumps(cat, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")

    # 대본 머리말도 같이 맞춘다. 두 곳이 어긋나면 검사기가 잡는다.
    for r in rows:
        it = r["it"]
        p = ROOT / it["transcript"]
        t = p.read_text(encoding="utf-8")
        t = re.sub(r"^화자 수:.*$", "화자 수: %d" % r["n"], t, count=1, flags=re.M)
        t = re.sub(r"^분기:.*$", "분기: Q%d" % it["quarter"], t, count=1, flags=re.M)
        p.write_text(t, encoding="utf-8")
    print("\n카탈로그와 대본 52개를 갱신했다")
    return 0


if __name__ == "__main__":
    sys.exit(main())
