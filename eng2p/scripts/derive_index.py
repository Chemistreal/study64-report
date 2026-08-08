#!/usr/bin/env python3
"""강의록 96편의 색인을 파생시킨다.

96편이 있는데 오늘 것을 찾을 방법이 파일 이름밖에 없었다.
주차와 강 번호의 관계를 두 사람이 외우고 있어야 했다.

주차가 원본이다. 1주차가 1강과 2강이고 48주차가 95강과 96강이다.
세트와 과제집이 대응강의 줄로 그것을 이미 적고 있다. 그 줄에서 뽑는다.
손으로 적지 않는다. 주차 배정이 바뀌면 이 표도 같이 바뀐다.

사용법:
    python3 scripts/derive_index.py

종료 코드 0이면 96편이 다 표에 올라간 것이다.
규격: docs/roadmap.md 11.5
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LEC = ROOT / "out" / "lectures"
HAND = ROOT / "out" / "handouts"
SETS = ROOT / "out" / "sets"
OUT = HAND / "eng2p_handout_index.md"

WEEKS = 48


def lecture_meta():
    """강 번호마다 제목과 트랙과 분기를 모은다."""
    meta = {}
    for f in sorted(LEC.glob("*.md")):
        t = f.read_text(encoding="utf-8")
        n = int(re.search(r"^# (\d+)강", t, re.M).group(1))
        meta[n] = {
            "title": re.search(r"^# \d+강\.\s*(.+)$", t, re.M).group(1).strip(),
            "track": re.search(r"^트랙:\s*(\S+)", t, re.M).group(1),
            "quarter": re.search(r"^분기:\s*(\S+)", t, re.M).group(1),
        }
    return meta


def handout_meta():
    """강의록에서 카드 범위와 미디어를 읽는다. 강의록이 이미 뽑아 둔 값이다."""
    meta = {}
    for f in sorted(HAND.glob("eng2p_handout_l*.md")):
        t = f.read_text(encoding="utf-8")
        n = int(f.stem[-3:])
        rng = re.search(r"카드 (\d{3}) ~ (\d{3})", t)
        mid = re.search(r"^미디어 (\S+)$", t, re.M)
        meta[n] = {
            "cards": "%s~%s" % rng.groups() if rng else "",
            "media": mid.group(1) if mid else "",
            "file": f.name,
        }
    return meta


def week_map():
    """세트의 대응강의 줄에서 주차와 강의 짝을 읽는다."""
    out = {}
    for f in sorted(SETS.glob("eng2p_set_w*.md")):
        w = int(re.search(r"_w(\d+)", f.name).group(1))
        m = re.search(r"^대응강의:\s*(.+)$", f.read_text(encoding="utf-8"), re.M)
        if not m:
            continue
        out[w] = [int(x.strip()[-3:]) for x in m.group(1).split(",")]
    return out


def main():
    lec, hand, weeks = lecture_meta(), handout_meta(), week_map()
    missing = [n for n in range(1, 97) if n not in lec or n not in hand]
    if missing:
        print("[실패] 강이나 강의록이 없다: %s" % missing)
        return 1
    placed = sorted(n for ns in weeks.values() for n in ns)
    if placed != list(range(1, 97)):
        print("[실패] 주차 배정이 96강을 다 안 덮는다")
        return 1

    L = [
        "신뢰도: A 생성 (파생)",
        "분기: 전체",
        "트랙: 전체",
        "원본: out/sets/eng2p_set_w01.md ~ w48.md 의 대응강의 줄",
        "검증대상:",
        "검증로그: 2026-08-08 / 세트의 대응강의 줄에서 기계로 뽑았다 / 통과 / "
        "손으로 적은 줄이 없다. 주차 배정이 바뀌면 다시 뽑는다",
        "",
        "# 강의록 색인. 48주 96강",
        "",
        "**손으로 고치지 않는다.** 세트의 대응강의 줄에서 파생시킨 것이다.",
        "",
        "한 주에 두 강이다. 강 하나가 세 세션이고 한 주가 여섯 세션이다.",
        "오늘이 몇 주차인지는 진행 대장이 센다. 여기서는 그 주차의 두 강을 찾는다.",
        "",
    ]
    for q in ["Q1", "Q2", "Q3", "Q4"]:
        ws = [w for w in sorted(weeks) if lec[weeks[w][0]]["quarter"] == q]
        L += ["## %s (%d주차 ~ %d주차)" % (q, ws[0], ws[-1]), "",
              "| 주 | 강 | 제목 | 트랙 | 카드 | 미디어 |",
              "|---|---|---|---|---|---|"]
        for w in ws:
            for n in weeks[w]:
                L.append("| %d | %d강 | %s | %s | %s | %s |"
                         % (w, n, lec[n]["title"], lec[n]["track"],
                            hand[n]["cards"], hand[n]["media"]))
        L.append("")

    # 트랙별 편수. 기준서가 정한 배분이 실제로 그렇게 됐는지 여기서 보인다.
    L += ["## 트랙별 편수", "", "| 분기 | " + " | ".join(
        ["소리", "청크", "자동화", "문법", "화용", "repair"]) + " |",
        "|---|---|---|---|---|---|---|"]
    for q in ["Q1", "Q2", "Q3", "Q4"]:
        row = [str(sum(1 for n in lec if lec[n]["quarter"] == q and lec[n]["track"] == tr))
               for tr in ["소리", "청크", "자동화", "문법", "화용", "repair"]]
        L.append("| %s | %s |" % (q, " | ".join(row)))
    L.append("")

    OUT.write_text("\n".join(L) + "\n", encoding="utf-8")
    print("색인을 뽑았다. 48주 96강")
    return 0


if __name__ == "__main__":
    sys.exit(main())
