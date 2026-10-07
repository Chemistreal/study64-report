#!/usr/bin/env python3
"""확장층 48주 달력 (`docs/expansion.md` 7장). `out/data/ext_calendar.json` 을 낸다.

다섯 파일(ext_radio, ext_smalltalk, ext_notices, ext_readers, 아직 없는 ext_npc)의 week 칸에서 셈으로 나온다.
**손으로 적은 달력이 따로 없다.** 손으로 적는 것은 빈칸의 이유뿐이다 (expansion.md 7장 표).

칸이 비었는데 이유가 없으면 실패로 내고 달력을 안 쓴다. 이유가 있는데 칸이 찼으면 그것도 실패다 (낡은 이유).

사용법:
    python3 scripts/derive_ext_calendar.py
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import derive_ext_common as C  # noqa: E402

COLS = [("radio", "라디오", "ext_radio"), ("npc", "NPC", "ext_npc"), ("smalltalk", "잡담", "ext_smalltalk"),
        ("notices", "안내문", "ext_notices"), ("readers", "책", "ext_readers")]


def weeks_of(spec):
    out = set()
    for part in spec.split(","):
        part = part.strip()
        m = re.fullmatch(r"(\d+)-(\d+)", part)
        if m:
            out.update(range(int(m.group(1)), int(m.group(2)) + 1))
        elif part.isdigit():
            out.add(int(part))
    return out


def reasons():
    src = open(C.EXPANSION, encoding="utf-8").read()
    sec = C.section(src, "## 7.")
    out = {}
    for line in sec.splitlines():
        if not line.startswith("| ") or line.startswith("|---"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) != 3 or not re.match(r"^[\d,\- ]+$", cells[0]):
            continue
        for w in weeks_of(cells[0]):
            out[(w, cells[1])] = cells[2]
    return out


def main():
    why = reasons()
    data = {key: C.read_ext(fname) for key, _, fname in COLS}
    fails = []
    weeks = []
    for w in range(1, 49):
        row = {"week": w, "quarter": C.quarter(w)}
        for key, label, fname in COLS:
            d = data[key]
            its = [x for x in (d or {}).get("items", []) if x.get("week") == w]
            if key == "smalltalk":
                cell = {"count": len(its), "grade": "B" if its else None,
                        "places": sorted({x["place"] for x in its})}
            elif key == "radio":
                cell = {"items": [{"id": x["id"], "code": x["code"], "title": x["title"], "slot": x["slot"]}
                                  for x in its], "grade": "C-real" if its else None}
            else:
                cell = {"items": [{"id": x["id"], "title": x.get("title")} for x in its],
                        "grade": "B" if its else None}
            n = cell.get("count", len(cell.get("items", [])))
            r = why.get((w, label))
            if n == 0 and not r:
                fails.append("%d주 %s 칸이 비었는데 7장에 이유가 없다" % (w, label))
            if n and r:
                fails.append("%d주 %s 칸이 찼는데 7장에 빈칸 이유가 남아 있다" % (w, label))
            if n == 0:
                cell["empty"] = r
            row[key] = cell
        weeks.append(row)
    if fails:
        for f in fails:
            print("[실패] " + f)
        print("달력을 안 냈다. 실패 %d" % len(fails))
        return 1
    filled = {key: sum(1 for r in weeks if not r[key].get("empty")) for key, _, _ in COLS}
    head = {
        "note": "확장층 48주 달력. ext_*.json 의 week 칸과 docs/expansion.md 7장에서 파생. 손으로 안 고친다.",
        "grade": "B",
        "gradeWhy": "칸마다 아래 자료의 등급을 단다 (라디오 C-real, 나머지 B). 주 배치는 설계다.",
        "generator": "scripts/derive_ext_calendar.py",
        "source": "out/data/ext_radio.json, ext_smalltalk.json, ext_notices.json, ext_readers.json, docs/expansion.md 7장",
        "license": "VOA-PD, CC-BY-2.0-FR, CC0-1.0, PD-USGov, PD(US,KR) (칸마다 아래 자료의 권리)",
        "columns": [label for _, label, _ in COLS],
        "filledWeeks": filled,
    }
    C.write_ext("ext_calendar", head, weeks)
    print("ext_calendar: 48주 / 찬 주 " + " ".join("%s %d" % (k, v) for k, v in filled.items()))
    return 0


if __name__ == "__main__":
    sys.exit(main())
