#!/usr/bin/env python3
"""NPC 가 말하는 줄 전부의 목록 (`docs/game_data.md` 5장). `out/game/voicelist.json` 을 낸다.

NPC 목소리는 TTS 다. 소유자 PC 가 줄마다 소리 파일을 **미리** 만든다 (game.md 8장 6번).
이름 자리({A} {B} 철자)가 든 줄은 두 사람이 이름을 정한 뒤에야 만들 수 있다.
그 둘을 가르고, 줄마다 누가 어떤 엔진과 목소리로 어느 빠르기로 읽는지 못 박는다.

    scenes.json 의 NPC 줄    인물 칸이 두 사람, A자리, B자리가 아닌 것
    replies.json 의 응답 줄  카드를 내는 NPC 가 읽는다. 되묻는 줄 한 줄을 인물마다 더한다
    id                       sha1(인물 + 줄) 앞 12자. 같은 인물이 같은 줄이면 같은 id 다. 무작위가 아니다
    목소리                   game_data.md 5.1 표. 인물표(cast.md 3.2)에서 옮겼다. 빠르기는 분기마다 다르다

**인물표에 없는 손님 넷**(진료소 접수, 면담관, 새 직원, 산책하는 사람)은 5.2 표가 목소리를 빌린다.
`uncast` 로 표시한다. 인물표에 자리가 생기면 5.2 표를 지운다.

**synthetic 은 모든 줄이 참이다.** NPC 말소리는 기계 음성(C-gen)이고 화면에 TTS 배지를 단다.
실제 사람 녹음(C-real)은 라디오뿐이고 이 목록에 없다 (CLAUDE.md, game.md 2장).

글자는 대본 그대로다. 근거 대본과 처음 들은 세션을 줄마다 적는다. 검사가 다시 대 본다.

사용법:
    python3 scripts/derive_voicelist.py
"""
import hashlib
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from derive_judge import doc_rows  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCENES = os.path.join(ROOT, "out", "game", "scenes.json")
REPLIES = os.path.join(ROOT, "out", "game", "replies.json")
SESS = os.path.join(ROOT, "out", "game", "sessions.json")
OUT = os.path.join(ROOT, "out", "game", "voicelist.json")

PLAYERS = {"두 사람", "A자리", "B자리"}
QUARTERS = ["Q1", "Q2", "Q3", "Q4"]
SLOT = re.compile(r"\{[^}]+\}")


def line_id(speaker, say):
    return "v" + hashlib.sha1((speaker + "\n" + say).encode("utf-8")).hexdigest()[:12]


def voices():
    """5.1 표를 읽는다. 인물 -> 목소리. 5.2 표의 손님은 빌린 인물의 목소리를 받는다."""
    rows = doc_rows("### 5.1 ", 14)
    guests = doc_rows("### 5.2 ", 3)
    if rows is None or guests is None:
        return None, ["docs/game_data.md 에 5.1 이나 5.2 표가 없다"]
    fail = []
    table = {}
    for r in rows:
        name, eng, vid, feng, fid = r[:5]
        try:
            speed = dict(zip(QUARTERS, [float(x) for x in r[5:9]]))
            pause = dict(zip(QUARTERS, [int(x) for x in r[9:13]]))
        except ValueError:
            fail.append("5.1 표의 속도나 쉼이 수가 아니다: " + name)
            continue
        table[name] = {"engine": eng, "id": vid, "fallback": {"engine": feng, "id": fid},
                       "speed": speed, "pauseMs": pause, "note": r[13]}
    for g, lender, why in guests:
        if lender not in table:
            fail.append("5.2 표의 빌려 주는 인물이 5.1 에 없다: %s -> %s" % (g, lender))
            continue
        v = dict(table[lender])
        v["borrowedFrom"] = lender
        v["why"] = why
        table[g] = v
    return table, fail


def build():
    fail = []
    table, f = voices()
    fail += f
    if table is None:
        return None, fail
    scenes = json.load(open(SCENES, encoding="utf-8"))
    replies = json.load(open(REPLIES, encoding="utf-8"))
    sess = json.load(open(SESS, encoding="utf-8"))["sessions"]

    lines = {}      # (speaker, say) -> record

    def add(speaker, say, src, kind, quarter, where):
        key = (speaker, say)
        r = lines.get(key)
        if r is None:
            r = lines[key] = {"id": line_id(speaker, say), "speaker": speaker, "say": say, "srcs": set(),
                              "kinds": set(), "quarters": set(), "sessions": set(), "cards": set()}
        r["srcs"].add(src)
        r["kinds"].add(kind)
        r["quarters"].add(quarter)
        if kind == "scene":
            r["sessions"].add(where)
        elif kind == "reply":
            r["cards"].add(where)

    # 장면. 인물 칸이 NPC 인 줄
    for s in scenes["sessions"]:
        for b in s["blocks"]:
            for ln in b["lines"]:
                if ln["who"] in PLAYERS:
                    continue
                add(ln["who"], ln["say"], ln["from"], "scene", s["quarter"], s["s"])

    # 응답. 카드를 내는 NPC 가 읽는다
    host = {}
    for s in scenes["sessions"]:
        for b in s["blocks"]:
            for c in b.get("cards", []):
                host.setdefault(c["id"], c["host"])
    qs = {}     # 카드 -> 나온 분기들 (오늘 카드와 복습 카드)
    first = {}
    for x in sess:
        for cid in list(x["cards"]) + list(x.get("review") or []):
            qs.setdefault(cid, set()).add(x["quarter"])
    for x in sess:
        for cid in x["cards"]:
            first.setdefault(cid, x["s"])
    hosts = set()
    for r in replies["cards"] + replies["repair"]:
        if not r["reply"]:
            continue
        h = host.get(r["id"])
        if not h:
            fail.append("카드 %s 를 내는 NPC 가 장면에 없다" % r["id"])
            continue
        hosts.add(h)
        for q in qs.get(r["id"], {r["quarter"]}):
            add(h, r["reply"]["say"], r["reply"]["from"], "reply", q, r["id"])
    # 되묻는 줄. 카드를 내거나 장면에 서는 인물이면 누구나 한다 (game.md 6장)
    speakers = {sp for sp, _ in lines} | hosts
    rt = replies["retry"]
    for sp in sorted(speakers):
        for q in QUARTERS:
            if any(k[0] == sp and lines[k]["kinds"] != {"retry"} and q in lines[k]["quarters"] for k in lines):
                add(sp, rt["say"], rt["from"], "retry", q, "retry")

    # 같은 줄이 대본 둘에 다 있으면 먼저 들은 과가 근거다. 그래야 처음 쓰는 세션에 이미 들은 것이 된다
    first_heard = {}
    for x in sess:
        first_heard.setdefault(x["media"], x["s"])
    for r in lines.values():
        ordered = sorted(r["srcs"], key=lambda m: (first_heard.get(m, 999), m))
        r["from"] = ordered[0]
        if len(ordered) > 1:
            r["alsoFrom"] = set(ordered[1:])

    order = list(table)
    out = []
    for (sp, say), r in lines.items():
        if sp not in table:
            fail.append("목소리가 없는 인물이다: %s (5.1, 5.2 표)" % sp)
            continue
        v = table[sp]
        qlist = [q for q in QUARTERS if q in r["quarters"]]
        slots = sorted(set(SLOT.findall(say)))
        rec = {"id": r["id"], "speaker": sp, "say": say, "from": r["from"], "kinds": sorted(r["kinds"]),
               "slots": slots, "render": "runtime" if slots else "pre", "synthetic": True,
               "audioGrade": "C-gen",
               "voice": {"engine": v["engine"], "id": v["id"], "fallback": v["fallback"]},
               "quarters": qlist,
               "speed": {q: v["speed"][q] for q in qlist},
               "pauseMs": {q: v["pauseMs"][q] for q in qlist}}
        if "alsoFrom" in r:
            rec["alsoFrom"] = sorted(r["alsoFrom"])
        firsts = []
        if r["sessions"]:
            rec["sessions"] = sorted(r["sessions"])
            firsts.append(rec["sessions"][0])
        if r["cards"]:
            rec["cards"] = sorted(r["cards"])
            firsts.append(min(first[c] for c in rec["cards"]))
        rec["firstSession"] = min(firsts) if firsts else 1
        if "borrowedFrom" in v:
            rec["uncast"] = True
            rec["borrowedFrom"] = v["borrowedFrom"]
        out.append(rec)
    out.sort(key=lambda r: (order.index(r["speaker"]), r["firstSession"], r["say"]))

    # 같은 줄이 같은 인물에게 두 번 안 나온다 (id 가 겹치면 안 된다)
    ids = [r["id"] for r in out]
    if len(ids) != len(set(ids)):
        fail.append("줄 id 가 겹친다")

    by_sp, by_q = {}, {q: {"lines": 0, "runtime": 0, "pre": 0} for q in QUARTERS}
    for r in out:
        t = by_sp.setdefault(r["speaker"], {"lines": 0, "scene": 0, "reply": 0, "retry": 0, "runtime": 0,
                                           "uncast": bool(r.get("uncast"))})
        t["lines"] += 1
        for k in r["kinds"]:
            t[k] += 1
        t["runtime"] += r["render"] == "runtime"
        for q in r["quarters"]:
            by_q[q]["lines"] += 1
            by_q[q][r["render"]] += 1
    obj = {
        "note": "NPC 가 말하는 줄 전부다. out/game/scenes.json 의 NPC 줄과 out/game/replies.json 의 응답 줄이다. "
                "손으로 안 고친다. scripts/derive_voicelist.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "글은 대본 그대로라 A 다. 목소리와 빠르기는 인물표의 설계 값이고 렌더해 듣고 나서 확정한다 (cast.md 3장) 그래서 B 다.",
        "generator": "scripts/derive_voicelist.py",
        "source": "out/game/scenes.json, out/game/replies.json, docs/game_data.md 5장",
        "idRule": "v + sha1(인물 + 줄바꿈 + 줄)의 앞 12자",
        "fileRule": "소리 파일 이름은 <id>.<분기>.wav 다. 분기마다 빠르기가 달라 따로 렌더한다. 이름 자리가 든 줄은 이름을 정한 뒤 PC 에서만 만든다",
        "count": len(out),
        "runtime": sum(1 for r in out if r["render"] == "runtime"),
        "pre": sum(1 for r in out if r["render"] == "pre"),
        "renders": sum(len(r["quarters"]) for r in out),
        "bySpeaker": by_sp,
        "byQuarter": by_q,
        "lines": out,
    }
    return obj, fail


def main():
    obj, fail = build()
    for f in fail:
        print("[실패] " + f)
    if fail or obj is None:
        print("목소리 목록을 안 냈다. 실패 %d" % len(fail))
        return 1
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print("out/game/voicelist.json / 줄 %d (미리 %d, 이름 든 %d) / 렌더 %d / 인물 %d / 실패 0"
          % (obj["count"], obj["pre"], obj["runtime"], obj["renders"], len(obj["bySpeaker"])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
