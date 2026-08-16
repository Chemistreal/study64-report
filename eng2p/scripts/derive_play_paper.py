#!/usr/bin/env python3
"""놀이 스무 판의 종이 대체판을 파생시킨다 (T399).

## 종이가 필요하다고 적어 두고 그 종이를 안 만들었다

`docs/solo_plays.md` 가 스무 판을 종이로 도는 법을 다 적었다.
셋은 아예 기기로 못 돌고 종이가 있어야 한다고 적었다.
`out/manual/` 을 보면 강의록과 매뉴얼과 대장은 있는데 **판 종이가 없다.**

기기가 없는 날이 온다. 배터리가 없는 날도 온다.
그날 두 사람 앞에 있는 것은 강의록 한 장뿐이고 **판은 하나도 못 돈다.**

## 손으로 안 적는다

규칙서에 이미 판마다 아홉 줄이 있다. 종이 목록도 이미 있다.
여기서 다시 적으면 두 벌이 되고 그때부터 한쪽만 고치는 날이 시작된다
(T396 에 글쇠 목록으로 겪었다).

**두 문서에서 뽑아 한 장으로 엮는다.**

    docs/play_rules.md   판마다 아홉 줄
    docs/solo_plays.md   그 판이 종이로 도는가

## 안 도는 판을 안 도는 것으로 적는다

넷은 종이로 안 돌거나 꼴이 바뀐다. **돈다고 안 적는다.**
안 되는 것을 안 된다고 적는 것이 이 저장소의 규칙이다 (`docs/cando.md`).

사용법:
    python3 scripts/derive_play_paper.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RULES = os.path.join(ROOT, "docs", "play_rules.md")
SOLO = os.path.join(ROOT, "docs", "solo_plays.md")
OUT = os.path.join(ROOT, "out", "manual", "eng2p_play_paper.md")

# 종이에 옮길 줄. **아홉 줄을 다 옮기지 않는다.**
# 기록할 값은 앱이 세는 값이고 종이에는 셀 앱이 없다. 대신 적는 칸을 둔다.
KEEP = ["트랙 구조 분", "쓰는 것", "시작 조건", "역할", "도는 차례",
        "판정", "끝 조건", "못 했을 때"]
FAIL = []


def rules():
    """판마다 아홉 줄을 뽑는다. `### N.M 이름` 다음의 표다."""
    src = open(RULES, encoding="utf-8").read()
    out = []
    # 3장부터 판이 시작한다. 1장은 규격이고 2장은 구조 뜯기다
    for m in re.finditer(r"^### (\d+)\.(\d+) (.+)$", src, re.M):
        ch = int(m.group(1))
        if ch < 3 or ch > 12:
            continue
        name = m.group(3).strip()
        body = src[m.end():]
        nxt = re.search(r"^#{2,3} ", body, re.M)
        if nxt:
            body = body[:nxt.start()]
        rows = {}
        for r in re.finditer(r"^\| ([^|]+?) \| (.+?) \|\s*$", body, re.M):
            k = r.group(1).strip()
            if k in ("칸", "---"):
                continue
            rows[k] = r.group(2).strip()
        if not rows:
            continue
        out.append({"name": name, "rows": rows})
    return out


def paper():
    """그 판이 종이로 도는가. `solo_plays.md` 의 표가 원본이다."""
    src = open(SOLO, encoding="utf-8").read()
    m = re.search(r"^\| # \| 판 \| 종이로 \| 왜 \|$", src, re.M)
    if not m:
        FAIL.append("solo_plays.md 에서 종이 표를 못 찾았다")
        return {}
    out = {}
    for r in re.finditer(r"^\| (\d+) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|\s*$",
                         src[m.end():], re.M):
        out[r.group(2).strip()] = {"no": int(r.group(1)),
                                   "how": r.group(3).strip().replace("**", ""),
                                   "why": r.group(4).strip().replace("**", "")}
    return out


def main():
    R = rules()
    P = paper()
    if len(R) != 20:
        FAIL.append("규칙서에서 판 %d개를 뽑았다. 스물이어야 한다" % len(R))
    # **이름이 두 문서에서 같아야 한다.** 다르면 짝이 안 맞는다
    for x in R:
        if x["name"] not in P:
            FAIL.append("%s 가 solo_plays.md 종이 표에 없다" % x["name"])
    for name in P:
        if not any(x["name"] == name for x in R):
            FAIL.append("%s 가 규칙서에 없다" % name)
    if FAIL:
        for f in FAIL:
            print("[실패] " + f)
        return 1

    R.sort(key=lambda x: P[x["name"]]["no"])
    L = []
    L.append("# 놀이 스무 판 종이판")
    L.append("")
    L.append("신뢰도: A 생성 (설계 파생)")
    L.append("상위 규격: docs/play_rules.md / docs/solo_plays.md")
    L.append("")
    L.append("**파생 파일이다. 손으로 고치지 않는다.**")
    L.append("고칠 것이 있으면 위 두 문서를 고치고")
    L.append("`python3 scripts/derive_play_paper.py` 를 다시 돌린다.")
    L.append("")
    L.append("기기가 없는 날에 쓴다. 배터리가 없는 날도 같다.")
    L.append("**뽑아서 강의록과 같이 둔다.** 그날 찾으면 늦는다.")
    L.append("")
    L.append("## 이 장에서 바뀌는 것")
    L.append("")
    L.append("| | 화면에서 | 종이에서 |")
    L.append("|---|---|---|")
    L.append("| 가리기 | 화면을 덮는다 | **뒤집는다.** 종이가 더 낫다 |")
    L.append("| 셈 | 앱이 센다 | 아래 적는 칸에 손으로 적는다 |")
    L.append("| 고르기 | 앱이 골라 준다 | 적힌 차례로 돈다 |")
    L.append("| 소리 | 앱이 낸다 | **안 된다.** 그 판은 아래에 안 돈다고 적혀 있다 |")
    L.append("")
    no_run = [x for x in R if "안 돈다" in P[x["name"]]["how"]]
    alt = [x for x in R if "바뀐" in P[x["name"]]["how"]]
    L.append("**종이로 안 도는 판이 %d개다.** %s."
             % (len(no_run), ", ".join(x["name"] for x in no_run)))
    L.append("둘 다 앱이 소리를 내는 판이다. 그날은 그 판을 안 연다.")
    L.append("꼴이 바뀌는 판이 %d개다. %s."
             % (len(alt), ", ".join(x["name"] for x in alt)))
    L.append("바뀐 꼴은 `docs/solo_plays.md` 7.4 에 있다.")
    L.append("")

    for x in R:
        p = P[x["name"]]
        L.append("## %d. %s" % (p["no"], x["name"]))
        L.append("")
        if "안 돈다" in p["how"]:
            L.append("**종이로 안 돈다.** %s. 그날은 이 판을 안 연다." % p["why"])
            L.append("")
            continue
        if "바뀐" in p["how"]:
            L.append("**꼴이 바뀐다.** %s. 바뀐 꼴은 `docs/solo_plays.md` 7.4 에 있다."
                     % p["why"])
            L.append("")
        L.append("| 칸 | |")
        L.append("|---|---|")
        for k in KEEP:
            v = x["rows"].get(k)
            if v is None:
                FAIL.append("%s 에 %s 칸이 없다" % (x["name"], k))
                continue
            L.append("| %s | %s |" % (k, v))
        L.append("| 종이로 | %s. %s |" % (p["how"], p["why"]))
        L.append("")
        # **적는 칸을 둔다.** 앱이 세던 값을 종이에서는 사람이 적는다.
        # 규칙서의 기록할 값을 그대로 이름표로 쓴다. 새 이름을 안 짓는다
        rec = x["rows"].get("기록할 값", "")
        L.append("적는 칸 (%s)" % re.sub(r"\*\*", "", rec).strip())
        L.append("")
        L.append("```")
        L.append("날짜 ______   값 ______")
        L.append("```")
        L.append("")

    if FAIL:
        for f in FAIL:
            print("[실패] " + f)
        return 1

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    open(OUT, "w", encoding="utf-8").write("\n".join(L) + "\n")
    print("out/manual/eng2p_play_paper.md / 판 %d개 (종이로 안 도는 판 %d, 꼴이 바뀌는 판 %d)"
          % (len(R), len(no_run), len(alt)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
