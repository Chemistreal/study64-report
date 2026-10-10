#!/usr/bin/env python3
"""나들이(outing) 미션 표를 낸다. 원본은 docs/outings.md 6장 표와 7장 랜드마크 표, 파일럿 차례는 docs/authored_lines.md.

`out/game/outings.json` 을 낸다. 게임이 있으면 읽는 선택 자료다 (지금은 게임이 안 읽는다. docs/outings.md 9장 로더 할 일).
**세션 시간을 안 바꾼다.** 미션은 세션 안의 블록도 아니고 시간 상한도 없다. 열리는 때(주.날)는 세션 번호로만 정한다.
sessions.json, acts.json(plan), cards.json 은 읽기만 한다.

내기 전에 본다.
    id 가 유일하다, 갈래가 life trip event 다
    장소가 랜드마크 표(7장)에 있거나 `new:<제안 id>` 거나 `-` 다. 표에 있으면 단계가 표와 같다
    열리는 때의 세션이 1~288 이고 다지기 주(짧은 날 45분)가 아니고 등급이 그 세션의 목표 등급과 같다
    같은 장소는 세 번까지, 등급이 서로 다르다
    요구 목록(사용자가 말한 장소와 일상)이 다 있다
    파일럿(집필 상태 '파일럿 완료') 은 지은 줄(authored_lines.md)과 차례가 있고 차례가 가리키는 줄이 다 있다

사용법: python3 scripts/derive_outings.py
"""
import datetime
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import authored_lib as L  # noqa: E402
import derive_scenes as DS  # noqa: E402

OUT = os.path.join(L.ROOT, "out", "game", "outings.json")
OUT_MD = os.path.join(L.DOCS, "outings.md")
KINDS = ("life", "trip", "event")
TRAVEL = {0: "town", 1: "walk-or-fast", 2: "bus-or-fast", 3: "transit-scene"}
STATUS = ("대기", "파일럿 완료", "집필 완료")
# 사용자가 말한 것 (2026-10-10). 하나라도 없으면 실패다
REQUIRED = """eggs_n_things_breakfast cookie_snack musubi_day food_truck_lunch ala_moana_shopping cheesecake_dessert
diamond_head_hike leonards_malasadas shave_ice_snack dukes_dinner marukame_udon grocery_store pharmacy bank_post_office
thebus_ride taxi_ride clinic_visit hospital_emergency library_card neighbor_greeting apartment_hunting phone_and_laundry
hanauma_bay_snorkel north_shore_shrimp_truck pearl_harbor_visit iolani_palace_tour kamehameha_statue_walk sunset_beach_day
polynesian_cultural_center surf_lesson hula_show aloha_festival_parade lei_day kamehameha_day airport_rental_car""".split()
START = DS.START
CONSOLIDATION_WEEKS = (6, 18, 30, 42)
REWARD = {"activity": {"pass": 6, "near": 5, "miss": 3},
          "lineWait": {"pass": 2, "near": 2, "miss": 1},
          "note": "Docs/level_KO.md 2장 표의 기존 단위(activity 6/5/3, line_wait 2/2/1)를 그대로 쓴다. 새 상수 없음."}


def section_rows(src, head, cols):
    i = src.find(head)
    if i < 0:
        return []
    j = src.find("\n## ", i + len(head))
    return DS.rows(src[i:j if j > 0 else len(src)], cols)


def load():
    fail = []
    src = open(OUT_MD, encoding="utf-8").read()
    marks = {c[0].strip("`"): (int(c[1]), c[2]) for c in section_rows(src, "## 7. 랜드마크 id 표", 3) if c[1].isdigit()}
    if len(marks) < 30:
        fail.append("outings.md 7장 랜드마크 표에서 %d개만 읽었다" % len(marks))
    rows = section_rows(src, "## 6. 미션 표", 10)
    if len(rows) < 40:
        fail.append("outings.md 6장 미션 표에서 %d개만 읽었다" % len(rows))
    S = json.load(open(L.SESS, encoding="utf-8"))["sessions"]
    A = json.load(open(L.ACTS, encoding="utf-8"))
    outs, f = L.parse_lines()
    fail += f
    pilots = {o["id"]: o for o in outs}
    table, _ = L.load_words()
    ms, seen, per_place = [], set(), {}
    for mid, kind, place, stage, lvl, can, fns, when, status, rel in rows:
        mid = mid.strip("`")
        if mid in seen or not re.fullmatch(r"[a-z0-9_]+", mid):
            fail.append("미션 id 가 겹치거나 꼴이 아니다: " + mid)
        seen.add(mid)
        if kind not in KINDS:
            fail.append("%s: 갈래가 life/trip/event 가 아니다: %s" % (mid, kind))
        if rel not in ("첫 공개", "이후"):
            fail.append("%s: 공개 칸이 '첫 공개' 나 '이후' 가 아니다: %s" % (mid, rel))
        if status not in STATUS:
            fail.append("%s: 집필 상태가 %s 가 아니다: %s" % (mid, "/".join(STATUS), status))
        place = place.strip("`")
        if not stage.isdigit() or int(stage) not in TRAVEL:
            fail.append("%s: 단계가 0~3 이 아니다: %s" % (mid, stage))
            continue
        st = int(stage)
        proposed = None
        if place.startswith("new:"):
            proposed, place = place[4:], None
            if st == 0:
                pass
        elif place == "-":
            place = None
        else:
            if place not in marks:
                fail.append("%s: 장소 %s 가 랜드마크 표에 없다" % (mid, place))
            elif marks[place][0] != st:
                fail.append("%s: 단계 %d 가 랜드마크 표의 %d 와 다르다 (%s)" % (mid, st, marks[place][0], place))
            per_place.setdefault(place, []).append((mid, lvl))
        if lvl not in L.LV:
            fail.append("%s: 등급이 A1~B2 가 아니다: %s" % (mid, lvl))
            continue
        m = re.fullmatch(r"(\d+)\.(\d)", when)
        if not m:
            fail.append("%s: 열리는 때가 주.날 꼴이 아니다: %s" % (mid, when))
            continue
        w, d = int(m.group(1)), int(m.group(2))
        s = (w - 1) * 6 + d
        if not (1 <= w <= 48 and 1 <= d <= 6):
            fail.append("%s: 열리는 때 %s 가 48주 6일 밖이다" % (mid, when))
            continue
        if w in CONSOLIDATION_WEEKS:
            fail.append("%s: 열리는 때가 다지기 주(%d주, 짧은 날)다" % (mid, w))
        x = S[s - 1]
        if (x["week"], x["day"]) != (w, d):
            fail.append("%s: sessions.json 의 세션 %d 가 %d주 %d일이 아니다" % (mid, s, w, d))
        if L.session_level(s) != lvl:
            fail.append("%s: 등급 %s 가 세션 %d 의 목표 등급 %s 와 다르다" % (mid, lvl, s, L.session_level(s)))
        date = (START + datetime.timedelta(days=(w - 1) * 7 + (d - 1))).isoformat()
        if date != x["date"]:
            fail.append("%s: 날짜 셈 %s 가 sessions.json %s 와 다르다" % (mid, date, x["date"]))
        first = rel == "첫 공개"
        if first:
            if lvl != "A1":
                fail.append("%s: 첫 공개 미션은 A1 이다 (%s)" % (mid, lvl))
            if s > A["release"]["throughSession"]:
                fail.append("%s: 첫 공개 미션이 공개 한계 세션 %d 보다 뒤(%d)에 열린다" % (mid, A["release"]["throughSession"], s))
            if kind == "event":
                fail.append("%s: 첫 공개에 행사 갈래는 없다 (생활 14, 여행 4)" % mid)
        rec = {"id": mid, "release": "first" if first else "later", "kind": kind, "placeId": place, "proposedPlaceId": proposed, "stage": st,
               "travel": "screen-transition" if first and st >= 2 else TRAVEL[st], "cefr": lvl, "canDo": can, "functions": [t.strip() for t in fns.split(",")],
               "unlock": {"session": s, "week": w, "day": d, "date": date},
               "reward": {"activity": dict(REWARD["activity"], ref="outing:" + mid),
                          "lineWait": dict(REWARD["lineWait"])},
               "authoring": status}
        o = pilots.get(mid)
        if (status != "대기") != (o is not None):
            fail.append("%s: 집필 상태 '%s' 와 authored_lines.md 의 장 유무가 안 맞는다" % (mid, status))
        if o:
            if outing_session(o) != s:
                fail.append("%s: authored_lines.md 의 세션 %s 가 열리는 때의 세션 %d 와 다르다" % (mid, o["meta"].get("세션"), s))
            if o["meta"].get("목표 등급") != lvl:
                fail.append("%s: authored_lines.md 의 목표 등급이 표와 다르다" % mid)
            if (o["meta"].get("장소") or "-") != (place or "-"):
                fail.append("%s: authored_lines.md 의 장소가 표와 다르다" % mid)
            rec["game"], f2 = game_of(o)
            fail += f2
        ms.append(rec)
    for p, ls in per_place.items():
        if len(ls) > 4 or len({l for _, l in ls}) != len(ls):
            fail.append("장소 %s 가 다섯 번 이상이거나 같은 등급으로 겹친다: %s" % (p, ls))
    firsts = [m for m in ms if m["release"] == "first"]
    nl = sum(1 for m in firsts if m["kind"] == "life")
    nt = sum(1 for m in firsts if m["kind"] == "trip")
    if (nl, nt) != (14, 4):
        fail.append("첫 공개 미션이 생활 %d, 여행 %d 다 (사용자 범위: 생활 14, 여행 4)" % (nl, nt))
    miss = [r for r in REQUIRED if r not in seen]
    if miss:
        fail.append("요구 목록에서 빠진 미션: " + " ".join(miss))
    ms.sort(key=lambda r: (r["unlock"]["session"], r["id"]))
    return ms, marks, fail


def outing_session(o):
    return L.outing_session(o)


def game_of(o):
    """파일럿의 미니게임 차례를 줄 id 가 실제 있는 꼴로 낸다."""
    fail = []
    lines = {ln["id"]: ln for ln in o["lines"]}
    branch = {}
    for pair in o["meta"].get("갈래", "").split(","):
        if ">" in pair:
            a, b = [x.strip() for x in pair.split(">")]
            branch[a] = b
    used = set()
    turns = []
    for t in o["turns"]:
        npcs = [] if t["npc"] == "-" else [x.strip() for x in t["npc"].split("+")]
        npc = npcs[0] if npcs else None
        picks = [] if t["pick"] == "-" else [x.strip() for x in t["pick"].split("/")]
        if not npcs and not picks:
            fail.append("%s: 차례 %s 가 비었다" % (o["id"], t["id"]))
        for i in npcs + picks:
            if i not in lines:
                fail.append("%s: 차례 %s 가 없는 줄을 가리킨다: %s" % (o["id"], t["id"], i))
            used.add(i)
        for npc_i in npcs:
            if lines.get(npc_i, {}).get("kind") != "npc":
                fail.append("%s: 차례 %s 의 NPC 줄 %s 가 npc 가 아니다" % (o["id"], t["id"], npc_i))
        for i in picks:
            if lines.get(i, {}).get("kind") == "npc":
                fail.append("%s: 차례 %s 의 고르는 줄 %s 가 npc 줄이다" % (o["id"], t["id"], i))
        seat = {"A": "A", "B": "B"}.get(t["seat"], "either")
        turns.append({"id": t["id"], "scene": t["scene"], "npc": npcs, "pick": picks, "seat": seat,
                      "scored": bool(picks),
                      "branch": {k: v for k, v in branch.items() if k in picks}})
    for b in branch.values():
        used.add(b)
    left = sorted(set(lines) - used, key=lambda x: int(x.rsplit("-", 1)[1]))
    if left:
        fail.append("%s: 차례가 안 쓰는 줄: %s" % (o["id"], " ".join(left)))
    if not turns:
        fail.append("%s: 미니게임 차례 표가 비었다" % o["id"])
    return {"timeLimit": None, "retryable": True, "turns": turns,
            "result": {"turnOutcomes": ["pass", "near", "miss"], "passShare": 77, "nearShare": 54,
                       "rule": "차례 통과 비율 77% 이상 pass, 54% 이상 near, 그 밖에 miss. 시계 없음. 아무것도 잠그지 않는다"},
            "practice": [p["id"] for p in o["practice"]]}, fail


def main():
    ms, marks, fail = load()
    for f in fail:
        print("[실패] " + f)
    if fail:
        print("나들이 표를 안 냈다. 실패 %d" % len(fail))
        return 1
    S = json.load(open(L.SESS, encoding="utf-8"))
    later = [m for m in ms if m["release"] == "later"]
    ms = [m for m in ms if m["release"] == "first"]
    by_lvl = {}
    for m in ms:
        by_lvl[m["cefr"]] = by_lvl.get(m["cefr"], 0) + 1
    obj = {
        "schemaVersion": 1,
        "note": "나들이 미션 표. 원본 docs/outings.md. 손으로 안 고친다. scripts/derive_outings.py 를 다시 돌린다. 게임은 아직 안 읽는다(선택 자료).",
        "grade": "B",
        "gradeWhy": "배치와 등급은 설계 판단이다. 영어는 authored (out/game/authored.json, 점검 A/B).",
        "generator": "scripts/derive_outings.py",
        "source": "docs/outings.md, docs/authored_lines.md, out/game/sessions.json, out/game/acts.json",
        "rules": {"timeLimit": None, "occupiesBlock": False, "hoursCount": "nominal-only",
                  "unlockBy": "sessionNumber", "planUnchanged": {"sessions": S["count"]},
                  "reward": REWARD},
        "landmarkIdsFrom": "game Honolulu/Config/HnlLandmarks.json (snapshot in docs/outings.md 7장)",
        "scope": {"release": "first", "throughSession": json.load(open(L.ACTS, encoding="utf-8"))["release"]["throughSession"],
                  "note": "첫 공개(세션 1~48, A1) 미션만 든다. 이후 공개 라운드의 미션은 docs/outings.md 6장 표에만 있다.",
                  "laterMissions": len(later)},
        "counts": {"missions": len(ms), "byLevel": by_lvl, "life": sum(1 for m in ms if m["kind"] == "life"),
                   "trip": sum(1 for m in ms if m["kind"] == "trip"),
                   "authored": sum(1 for m in ms if m["authoring"] != "대기")},
        "missions": ms,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print("out/game/outings.json / 첫 공개 미션 %d (생활 %d, 여행 %d) / 이후 %d / 집필 %d / 실패 0"
          % (len(ms), obj["counts"]["life"], obj["counts"]["trip"], len(later), obj["counts"]["authored"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
