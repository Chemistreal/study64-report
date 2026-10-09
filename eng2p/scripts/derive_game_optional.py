#!/usr/bin/env python3
"""게임이 Data 폴더에서 찾는 선택 자료 여덟을 낸다 (`docs/game_data.md` 10장).

게임 로더(HnlDataSubsystem.cpp)는 sets emergency playblocks tally hold transcripts cues audiolen 을
있으면 읽고 없으면 알림만 낸다. 앱 쪽 `out/data/` 에 같은 이름이 이미 있었지만 **그대로는 게임이 못 읽거나
옛 말을 든다.** 그래서 앱 자료에서 뽑아 게임이 읽는 꼴로 `out/game/` 에 다시 낸다.

    transcripts cues audiolen   앱 파일은 {note, generator, count, items:{과: ...}} 다. 로더는 과 번호가 맨 위에
                                있는 지도(또는 칸이 하나뿐인 껍질)만 읽는다. 칸이 넷 이상이면 껍질을 안 벗기고
                                지도가 비어 버린다. **아무 알림도 없이** 라디오 대본과 줄 시각이 사라진다.
                                그래서 과 번호를 맨 위에 올린다. 글자 칸(note, generator)은 로더가 형으로 걸러 버린다
                                (배열이 아니거나 수가 아니면 건너뛴다). 수 칸을 맨 위에 두면 audiolen 에 과로 들어간다
    sets emergency              로더가 읽는 칸만 남긴다 (출처 경로 칸을 뺀다). 값이 글자가 아니면 그 항목은 조용히 빠진다
    playblocks                  판이 붙는 블록. 앱 파일의 blocks, empty, together, why 는 옛 값이다 (블록 1 은 따로 하는 블록이
                                아니다, game.md 4장). 안 싣는다. 붙는 블록(fit)은 10.3 표와 같아야 낸다
    tally                       판마다 셈을 합치는 법. screen 칸(앱 화면 이름)과 why 를 뺀다
    hold                        판마다 정보를 쥐는 쪽. 앱 자료는 사람 자리를 말했다. 게임은 10.4 표대로 NPC 가 쥔다.
                                거울은 NPC 가 둘 중 어느 낱말을 말하는지를 세션 288개마다 해시로 못 박는다 (10.5)

**영어를 새로 짓지 않는다.** 대본, 세트, 비상판은 앱 파일의 글이고 여기서 고치지 않는다. 난수도 안 쓴다.
정답 열쇠는 어디에도 안 싣는다 (game.md 1.3). 검사는 `scripts/check_gameopt.py` 다.

사용법:
    python3 scripts/derive_game_optional.py
"""
import hashlib
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from derive_judge import doc_rows  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "out", "data")
GAME = os.path.join(ROOT, "out", "game")
GENERATOR = "scripts/derive_game_optional.py"

NAMES = ["sets", "emergency", "playblocks", "tally", "hold", "transcripts", "cues", "audiolen"]
MEDIA_MAPS = ["transcripts", "cues", "audiolen"]
BY = ("npc", "game", "none")
WAYS = ("add", "same", "max", "one", "follow")


def jload(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def balanced_plan(tag, n):
    """0 과 1 이 같은 수인 배정. 순서는 sha1(tag:번호) 이 정한다. 홀수면 어느 쪽이 하나 더 많은지도 해시가 정한다."""
    order = sorted(range(n), key=lambda i: hashlib.sha1(("%s:%d" % (tag, i)).encode("utf-8")).hexdigest())
    extra = int(hashlib.sha1(("%s:n" % tag).encode("utf-8")).hexdigest(), 16) % 2 if n % 2 else 0
    ones = set(order[:n // 2 + extra])
    return "".join("1" if i in ones else "0" for i in range(n))


def hold_rows():
    """10.4 표. 판 -> (쥐는 쪽, 쥐는 자리, 쥐는 것, 근거 문구)."""
    rows = doc_rows("### 10.4 ", 5)
    if rows is None:
        return None
    return {r[0]: {"by": r[1], "seat": "" if r[2] == "-" else r[2], "holds": "" if r[3] == "-" else r[3],
                   "basis": "" if r[4] == "-" else r[4]} for r in rows}


def fit_rows():
    """10.3 표. 판 -> 붙는 블록 목록."""
    rows = doc_rows("### 10.3 ", 2)
    if rows is None:
        return None
    return {r[0]: [int(x) for x in r[1].split(",")] for r in rows}


def head(note, grade, why, source, **more):
    out = {"note": note, "grade": grade, "gradeWhy": why, "generator": GENERATOR, "source": source}
    out.update(more)
    return out


def build_sets(src, fail):
    items = []
    for it in src["items"]:
        steps = []
        for st in it["steps"]:
            for k, v in st["fields"].items():
                if not isinstance(v, str):
                    fail.append("세트 %s 단계 %s 의 칸 '%s' 가 글자가 아니다" % (it["id"], st["step"], k))
            steps.append({"step": st["step"], "name": st["name"], "minutes": st["minutes"],
                          "fields": st["fields"], "items": st["items"]})
        items.append({"no": it["no"], "id": it["id"], "week": it["week"], "quarter": it["quarter"],
                      "lecture": it["lecture"], "steps": steps})
    return head("블록 2 맞춰 보기 절차 288개다. out/data/sets.json 에서 로더가 읽는 칸만 옮겼다. 손으로 안 고친다. "
                "%s 를 다시 돌린다." % GENERATOR, "A", "마크다운 세트를 앱이 파생한 것을 옮겼다. 글은 안 바꿨다.",
                "out/data/sets.json", count=len(items), items=items)


def build_emergency(src, fail):
    items = []
    for it in src["items"]:
        if not (isinstance(it["minutes"], dict) and all(isinstance(v, int) for v in it["minutes"].values())):
            fail.append("비상판 %s 의 minutes 가 {글자: 정수} 가 아니다" % it["no"])
        items.append({"no": it["no"], "title": it["title"], "quarter": it["quarter"], "lecture": it["lecture"],
                      "minutes": it["minutes"], "pull": it["pull"], "chunks": it["chunks"]})
    return head("바쁜 날 15분 심부름 80개다. out/data/emergency.json 에서 로더가 읽는 칸만 옮겼다. 손으로 안 고친다. "
                "%s 를 다시 돌린다." % GENERATOR, "A", "마크다운 비상판을 앱이 파생한 것을 옮겼다. 글은 안 바꿨다.",
                "out/data/emergency.json", count=len(items), items=items)


def build_playblocks(src, fit, fail):
    plays = []
    for p in src["plays"]:
        want = fit.get(p["id"])
        if want is None:
            fail.append("10.3 표에 판이 없다: " + p["id"])
        elif want != p["fit"]:
            fail.append("판 %s 이 붙는 블록이 앱 자료(%s)와 10.3 표(%s)가 다르다. 게임의 대체 표도 같이 고친다"
                        % (p["id"], p["fit"], want))
        plays.append({"id": p["id"], "name": p["name"], "min": p["min"], "src": p["src"], "fit": p["fit"]})
    for k in fit:
        if k not in {p["id"] for p in plays}:
            fail.append("10.3 표에만 있는 판: " + k)
    return head("판 스무 개가 붙는 블록. 게임은 표를 읽을 뿐 정하지 않는다. out/data/playblocks.json 에서 id name min src fit 만 "
                "옮겼다. 블록 1 이 따로 하는 블록이라는 옛 칸은 안 싣는다. 손으로 안 고친다. %s 를 다시 돌린다." % GENERATOR,
                "A", "판 규칙서의 쓰는 것과 도는 차례와 분을 앱이 센 값이다. 붙는 블록은 10.3 표(게임의 대체 표)와 같다.",
                "out/data/playblocks.json, docs/game_data.md 10.3", count=len(plays), plays=plays)


def build_tally(src, fail):
    plays = []
    by_how = {}
    for p in src["plays"]:
        if p["how"] not in WAYS:
            fail.append("판 %s 의 셈하는 법 '%s' 를 모른다" % (p["id"], p["how"]))
        by_how[p["how"]] = by_how.get(p["how"], 0) + 1
        plays.append({"id": p["id"], "name": p["name"], "how": p["how"]})
    return head("판마다 셈을 합치는 법. 게임은 how 를 읽고 셈을 C++ 에 박지 않는다. out/data/tally.json 에서 옮겼다. "
                "손으로 안 고친다. %s 를 다시 돌린다." % GENERATOR, "A",
                "규칙서 14장 표를 앱이 파생한 것이다. 앱 화면 이름 칸(screen)은 게임이 안 읽어 뺐다.",
                "out/data/tally.json", ways={k: v for k, v in src["ways"].items() if k in WAYS},
                byHow=dict(sorted(by_how.items())), count=len(plays), plays=plays)


def build_hold(src, rows, sessions, fail):
    app = {p["id"]: p for p in src["plays"]}
    for pid in rows:
        if pid not in app:
            fail.append("10.4 표에만 있는 판: " + pid)
    plays = []
    for p in src["plays"]:
        r = rows.get(p["id"])
        if r is None:
            fail.append("10.4 표에 판이 없다: " + p["id"])
            continue
        if r["by"] not in BY:
            fail.append("판 %s 의 쥐는 쪽 '%s' 를 모른다" % (p["id"], r["by"]))
        if r["seat"] and r["seat"] not in p["seats"]:
            fail.append("판 %s 의 쥐는 자리 '%s' 가 앱의 자리 %s 에 없다" % (p["id"], r["seat"], p["seats"]))
        if r["by"] != "npc" and r["seat"]:
            fail.append("판 %s 는 NPC 가 쥐는 판이 아닌데 자리가 있다" % p["id"])
        e = {"id": p["id"], "name": p["name"], "seats": p["seats"],
             "hold": r["seat"] if r["by"] == "npc" else "",
             "by": r["by"], "holds": r["holds"], "basis": r["basis"], "turns": p["turns"]}
        if p["id"] == "mirror":
            plan = {}
            for q in sessions:
                deck = q["decks"]
                deck = json.loads(deck) if isinstance(deck, str) else deck
                n = len(deck.get("mirror", []))
                if n:
                    plan[str(q["s"])] = balanced_plan("mirror:%d" % q["s"], n)
            e["pick"] = {"of": "NPC 가 말하는 낱말. 0 이면 덱 항목의 a, 1 이면 b",
                         "rule": "세션마다 0 과 1 이 같은 수. 순서는 sha1(mirror:세션:회 번호) 사전순의 앞쪽 절반이 1",
                         "plan": plan}
        plays.append(e)
    return head("판마다 정보를 쥐는 쪽. NPC 가 쥐는 판은 hold 가 그 자리다 (비어 있으면 NPC 가 앉는 자리가 없다). "
                "난수 없이 거울은 NPC 가 말하는 낱말을 세션마다 못 박았다. out/data/hold.json 의 자리와 "
                "docs/game_data.md 10.4 표에서 낸다. 손으로 안 고친다. %s 를 다시 돌린다." % GENERATOR,
                "B", "자리 이름은 앱이 규칙서에서 파생한 것이라 A 다. 어느 판을 NPC 가 쥐는지와 어느 자리를 맡는지는 "
                "game.md 1.3 표를 사람이 읽고 정한 10.4 표라 B 다.",
                "out/data/hold.json, docs/game_data.md 10.4, out/game/sessions.json", count=len(plays), plays=plays)


def build_media(tr, cu, au, sessions, fail):
    t = {k: list(v) for k, v in tr["items"].items()}
    c = {k: list(v) for k, v in cu["items"].items()}
    a = dict(au["items"])
    if not (set(t) == set(c) == set(a)):
        fail.append("대본, 어림 시각, 소리 길이의 과가 서로 다르다")
    for m in sorted({q["media"] for q in sessions}):
        if m not in t:
            fail.append("세션이 쓰는 과 %s 가 대본에 없다" % m)
    note_t = ("라디오 대본 52과의 줄이다. 과 번호 -> 'Who: line' 줄 목록. 줄은 대본 그대로다. out/data/transcripts.json 의 "
              "items 를 맨 위로 올렸다 (로더는 맨 위에 과 번호가 있는 지도를 읽는다). 손으로 안 고친다. %s 를 다시 돌린다." % GENERATOR)
    note_c = ("대본 줄마다의 **어림** 시작 초다. 실측이 아니다. 글자 수 비례이고 쉼을 안 센다. 과 번호 -> 시작 초 목록. "
              "줄 번호는 transcripts 와 같다. out/data/cues.json 의 items 를 맨 위로 올렸다. 손으로 안 고친다. %s 를 다시 돌린다." % GENERATOR)
    note_a = ("mp3 52개의 진짜 길이(초)다. 과 번호 -> 초. 맨 위에 수 칸을 두지 않는다 (로더가 과로 읽는다). "
              "out/data/audiolen.json 의 items 를 맨 위로 올렸다. 손으로 안 고친다. %s 를 다시 돌린다." % GENERATOR)
    out_t = {"note": note_t, "generator": GENERATOR}
    out_t.update(t)
    out_c = {"note": note_c, "generator": GENERATOR, "estimate": True, "unit": "seconds"}
    out_c.update(c)
    out_a = {"note": note_a, "generator": GENERATOR, "unit": "seconds"}
    out_a.update(a)
    return out_t, out_c, out_a


def build():
    fail = []
    need = ["sets", "emergency", "playblocks", "tally", "hold", "transcripts", "cues", "audiolen"]
    src = {}
    for n in need:
        p = os.path.join(DATA, n + ".json")
        if not os.path.exists(p):
            return None, ["앱 자료가 없다: out/data/%s.json" % n]
        src[n] = jload(p)
    sess_path = os.path.join(GAME, "sessions.json")
    if not os.path.exists(sess_path):
        return None, ["out/game/sessions.json 이 없다. derive_game.js 를 먼저 돌린다"]
    sessions = jload(sess_path)["sessions"]
    fit = fit_rows()
    rows = hold_rows()
    if fit is None or rows is None:
        return None, ["docs/game_data.md 에 10.3 이나 10.4 표가 없다"]
    out = {}
    out["sets"] = build_sets(src["sets"], fail)
    out["emergency"] = build_emergency(src["emergency"], fail)
    out["playblocks"] = build_playblocks(src["playblocks"], fit, fail)
    out["tally"] = build_tally(src["tally"], fail)
    out["hold"] = build_hold(src["hold"], rows, sessions, fail)
    out["transcripts"], out["cues"], out["audiolen"] = build_media(
        src["transcripts"], src["cues"], src["audiolen"], sessions, fail)
    return out, fail


def dump(obj):
    return json.dumps(obj, ensure_ascii=False, indent=1) + "\n"


def main():
    out, fail = build()
    for f in fail:
        print("[실패] " + f)
    if out is None or fail:
        print("선택 자료를 안 냈다")
        return 1
    os.makedirs(GAME, exist_ok=True)
    sizes = []
    for n in NAMES:
        with open(os.path.join(GAME, n + ".json"), "w", encoding="utf-8", newline="\n") as f:
            f.write(dump(out[n]))
        sizes.append("%s %dKB" % (n, len(dump(out[n]).encode("utf-8")) // 1024))
    held = sum(1 for p in out["hold"]["plays"] if p["by"] == "npc")
    print("out/game 선택 자료 %d개 / 세트 %d 비상판 %d 판 %d / NPC 가 쥐는 판 %d / 거울 배정 %d세션 / %s"
          % (len(NAMES), out["sets"]["count"], out["emergency"]["count"], out["playblocks"]["count"], held,
             len(next(p for p in out["hold"]["plays"] if p["id"] == "mirror")["pick"]["plan"]), " ".join(sizes)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
