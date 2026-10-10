#!/usr/bin/env python3
"""B 등급 지은 줄(점검 B)의 사용자 검토를 게임이 읽는 승인 목록으로 옮긴다.

흐름
    1. `--sheet`  검토 시트(state/authored_b_review.html, A4 한 장)와 빈 양식(state/authored_b_review.json)을 낸다.
                  양식은 이미 채운 답을 지우지 않는다 (새 B 줄만 null 로 더하고, 더는 B 가 아닌 줄은 뺀다).
    2. 사용자가 시트를 보고 줄마다 O (쓴다) 나 X (뺀다) 를 답한다. 답을 양식 JSON 에 옮긴다.
       값은 "approved" | "rejected" | null (아직 안 정함). "O" 와 "X" 도 받는다.
    3. 기본 실행  승인 목록을 낸다 -> out/approved/HnlAuthoredApproved.json
    4. `--check`  거부한 줄이 나들이(out/game/outings.json 의 차례)에 아직 쓰이면 실패한다 (종료 코드 1).
                  어느 미션이 다른 줄을 더 받아야 하는지(빈자리) 찍는다. 아직 정하지 않은 줄(null)은 알림만 한다. `--strict` 면 실패.

게임 쪽 형식 (가정. 게임 저장소가 여기 없고 docs 에 HnlAuthoredApproved 가 없다)
    게임은 `Config/HnlAuthoredApproved.json` 으로 승인한 줄 id 목록을 읽는다고 가정한다.
    여기서는 {"schemaVersion": 1, "approved": ["hf-07", ...]} 로 낸다. id 는 정렬한다.
    게임이 맨 배열(["hf-07", ...])을 기대하면 `--plain` 으로 낸다. 점검 A 줄은 목록에 안 넣는다 (A 는 승인 없이 쓴다는 가정).
    게임에 복사하는 일은 사람이 한다 (여기서는 out/approved/ 까지만 쓴다).

사용법
    python3 scripts/apply_b_review.py --sheet
    python3 scripts/apply_b_review.py            # 승인 목록 쓰기
    python3 scripts/apply_b_review.py --check [--strict]
    python3 -m unittest scripts/test_apply_b_review.py
"""
import argparse
import html
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

REVIEW = os.path.join(ROOT, "state", "authored_b_review.json")
SHEET = os.path.join(ROOT, "state", "authored_b_review.html")
OUTINGS = os.path.join(ROOT, "out", "game", "outings.json")
OUT = os.path.join(ROOT, "out", "approved", "HnlAuthoredApproved.json")

STATES = ("approved", "rejected")
ALIAS = {"o": "approved", "approved": "approved", "x": "rejected", "rejected": "rejected"}

# 줄마다 쉬운 한국어로 "무엇이 걸리나". (걸리는 말, 이유)
NOTE = {
    "enb-31": ("twenty-four dollars", "값 읽기. 24달러는 장면용 값이고, 초급에서 'twenty-four'를 이렇게 읽어 주는 게 맞는지 확신이 없다."),
    "si-24": ("Here is ten dollars.", "돈을 낼 때는 'Here you go.'가 더 흔할 수 있다. 뜻은 통한다."),
    "lm-01": ("Aloha! Next, please.", "점원이 손님을 이렇게 부르는 게 하와이 가게에서 흔한지 모른다. 말은 쉽고 틀리진 않다."),
    "lm-24": ("Here is twenty dollars.", "돈을 낼 때는 'Here you go.'가 더 흔할 수 있다. 뜻은 통한다."),
    "ft-22": ("Here is twenty dollars.", "돈을 낼 때는 'Here you go.'가 더 흔할 수 있다. 뜻은 통한다."),
    "cc-31": ("Here is twenty dollars.", "돈을 낼 때는 'Here you go.'가 더 흔할 수 있다. 뜻은 통한다."),
    "hf-07": ("four-one-two", "방 번호를 한 자리씩 읽는 말투(4-1-2)가 이 단계에 맞는지, 음성이 어떻게 읽을지 모른다."),
    "hf-08": ("three-oh-five", "방 번호를 한 자리씩 읽고 0을 'oh'로 읽는다. 자연스럽긴 한데 이 단계에 맞는지 모른다."),
    "hf-09": ("six-one-eight", "방 번호를 한 자리씩 읽는 말투가 이 단계에 맞는지, 음성이 어떻게 읽을지 모른다."),
    "bs-09": ("three dollars each", "요금 3달러는 장면용 값이다. 'each'(한 사람당)로 말하는 게 이 단계에 맞는지 모른다."),
    "bs-10": ("Pay here, please.", "기사가 말로 이렇게 하는지 모른다. 보통은 요금함을 가리키거나 말없이 기다린다."),
    "bs-14": ("Pay here, please.", "기사가 말로 이렇게 하는지 모른다. 보통은 요금함을 가리키거나 말없이 기다린다."),
    "bs-25": ("Stop here, please.", "미국 시내버스는 보통 줄을 당겨 내릴 곳을 알린다. 기사에게 말로 세워 달라고 하는지 모른다."),
    "am-13": ("in small", "'in small'과 'in a small' 중 가게에서 어느 쪽이 더 흔한지 모른다. 둘 다 들린다."),
    "am-27": ("Do you want a bag?", "점원은 'Do you need a bag?'나 'Would you like a bag?'를 더 쓸 수 있다. want 가 조금 직설적일 수 있다."),
    "bc-22": ("Your spot is on the left.", "해변 대여소 직원이 자리를 정해 주는지 실제 운영 방식을 모른다(장면용). 말 자체는 자연스럽다."),
    "hb-05": ("Masks, yes or no?", "직원이 'yes or no?'로 되묻는 게 딱딱하거나 퉁명스럽게 들릴 수 있다."),
    "hb-30": ("Do not touch the fish.", "영어는 자연스럽다. 실제 하나우마 베이의 규칙 문구인지 모르고, 'Please do not...'이 더 정중하다."),
    "hb-32": ("Stay with your friend.", "안전 문구는 'Stay with your buddy.'가 더 흔할 수 있다. 장비 대여 때 이 말을 하는지 모른다."),
}
SCENE_KO = {"door": "입구", "pay": "계산", "room": "방 번호", "fare": "요금", "stop": "내리기", "size": "크기",
            "place": "자리 안내", "safety": "안전 안내", "gear": "장비"}
WHO_KO = {"Host": "안내 직원", "Server": "종업원", "Cashier": "계산원", "Clerk": "점원", "Guide": "안내자", "Driver": "버스 기사",
          "Doctor": "의사", "Nurse": "간호사", "Neighbor": "이웃", "두 사람": "우리 둘", "A자리": "우리 중 A", "B자리": "우리 중 B"}


# ------------------------------------------------------------------ 읽기

def b_lines(outs):
    """원본에서 점검 B 줄을 나들이 순서대로. [(나들이 dict, 줄 dict, 번호)]"""
    res = []
    for o in outs:
        for ln in o["lines"]:
            if ln["check"] == "B":
                res.append((o, ln, len(res) + 1))
    return res


def normalize(review, b_ids):
    """양식 -> ({id: approved|rejected|None}, 오류 목록). 모르는 id, 이상한 값을 오류로 센다. 빠진 B 줄은 None."""
    err, out = [], {}
    if not isinstance(review, dict):
        return {}, ["양식이 {id: 값} 객체가 아니다"]
    for k, v in review.items():
        if k not in b_ids:
            err.append("%s: 점검 B 줄이 아니거나 없는 id 다" % k)
            continue
        if v is None:
            out[k] = None
        elif isinstance(v, str) and v.strip().lower() in ALIAS:
            out[k] = ALIAS[v.strip().lower()]
        else:
            err.append("%s: 값이 approved, rejected, null (또는 O, X) 이 아니다: %r" % (k, v))
    for k in b_ids:
        out.setdefault(k, None)
    return out, err


def approved_ids(state):
    return sorted(k for k, v in state.items() if v == "approved")


def write_approved(state, path=OUT, plain=False):
    ids = approved_ids(state)
    obj = ids if plain else {"schemaVersion": 1, "note": "승인한 B 등급 지은 줄 id. scripts/apply_b_review.py 가 state/authored_b_review.json 에서 낸다. 손으로 안 고친다.",
                             "approved": ids}
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write("\n")
    return ids


# ------------------------------------------------------------------ 점검

def mission_gaps(mission, outing, rejected):
    """거부한 줄을 빼면 미션이 어떻게 되나. (빈자리 목록, 빼기만 하면 되는 줄 목록). 둘 다 사람이 읽는 문장.
    빈자리 = 다른 줄을 더 써야 한다. 차례의 NPC 줄이나 고를 줄이 다 사라짐, 갈래 도착 줄이 사라짐, 한 장면의 option 이 둘 미만."""
    gaps, loose = [], []
    turns = (mission.get("game") or {}).get("turns", [])
    bad = {i for i in rejected}
    text = {ln["id"]: ln["say"] for ln in (outing or {}).get("lines", [])}
    for t in turns:
        npc, pick = t.get("npc", []), t.get("pick", [])
        for r in [i for i in npc + pick if i in bad]:
            loose.append("%s '%s'" % (r, text.get(r, "")))
        if npc and all(i in bad for i in npc):
            gaps.append("차례 %s(%s)에 상대(점원 등)가 할 말이 없어진다 (%s)" % (t["id"], t["scene"], ", ".join(npc)))
        if pick and all(i in bad for i in pick):
            gaps.append("차례 %s(%s)에 두 사람이 고를 말이 없어진다 (%s)" % (t["id"], t["scene"], ", ".join(pick)))
        for src, dst in (t.get("branch") or {}).items():
            if dst in bad:
                gaps.append("차례 %s(%s)에서 %s 다음에 올 대답 %s 가 사라진다" % (t["id"], t["scene"], src, dst))
                loose.append("%s '%s'" % (dst, text.get(dst, "")))
    # option 장면은 두 줄 이상이어야 선택이다 (authored_lib 의 관문)
    scenes = {}
    for ln in (outing or {}).get("lines", []):
        if ln["kind"] == "option":
            scenes.setdefault(ln["scene"], []).append(ln["id"])
    for sc, ids in scenes.items():
        left = [i for i in ids if i not in bad]
        if len(ids) >= 2 and len(left) < 2 and len(left) < len(ids):
            gaps.append("장면 %s 의 고를 말이 %d개로 줄어 선택이 안 된다 (%s 중 %s)" % (sc, len(left), ", ".join(ids), ", ".join(i for i in ids if i in bad)))
    return gaps, sorted(set(loose))


def check(state, outs, missions, strict=False):
    """(실패 목록, 알림 목록)"""
    fail, note = [], []
    by_mission = {m["id"]: m for m in missions}
    outing_of = {o["id"]: o for o in outs}
    rejected = {k for k, v in state.items() if v == "rejected"}
    for oid, o in outing_of.items():
        mine = sorted(i for i in rejected if any(ln["id"] == i for ln in o["lines"]))
        if not mine:
            continue
        m = by_mission.get(oid)
        if not m:
            fail.append("미션 %s: 거부한 줄 %s 가 지은 줄 원본에 있다" % (oid, " ".join(mine)))
            continue
        gaps, loose = mission_gaps(m, o, mine)
        if loose:
            fail.append("미션 %s: 거부한 줄이 아직 쓰인다: %s" % (oid, " / ".join(loose)))
        for g in gaps:
            fail.append("미션 %s 은 다른 줄이 더 필요하다: %s" % (oid, g))
        if loose and not gaps:
            note.append("미션 %s: 다른 선택지가 남아 있어 줄만 빼면 된다" % oid)
    pending = sorted(k for k, v in state.items() if v is None)
    if pending:
        (fail if strict else note).append("아직 정하지 않은 B 줄 %d개: %s" % (len(pending), " ".join(pending)))
    return fail, note


# ------------------------------------------------------------------ 시트

def prior_line(o, ln, turns):
    """상황 설명에 쓸 앞 말. 고르는 말이면 그 차례의 NPC 줄, 아니면 표에서 바로 앞 줄."""
    ids = {x["id"]: x for x in o["lines"]}
    for t in turns:
        if ln["id"] in t.get("pick", []) and t.get("npc"):
            return ids.get(t["npc"][-1])
    i = o["lines"].index(ln)
    return o["lines"][i - 1] if i > 0 else None


def sheet_html(outs, missions, state):
    by_mission = {m["id"]: m for m in missions}
    rows = []
    cur = None
    for o, ln, n in b_lines(outs):
        turns = (by_mission.get(o["id"], {}).get("game") or {}).get("turns", [])
        if o["id"] != cur:
            cur = o["id"]
            cd = [x.strip() for x in o["meta"].get("할 일", "").split("/")]
            rows.append('<tr class="m"><td colspan="6"><b>%s</b> <span>%s</span></td></tr>' % (html.escape(cd[-1] if cd else o["id"]), html.escape(o["id"])))
        pr = prior_line(o, ln, turns)
        who = WHO_KO.get(ln["who"], ln["who"])
        sc = SCENE_KO.get(ln["scene"], ln["scene"])
        situ = "%s 장면 / 말하는 사람: %s" % (html.escape(sc), html.escape(who))
        if pr:
            situ += '<br><i>앞 말 (%s)</i> %s' % (html.escape(WHO_KO.get(pr["who"], pr["who"])), html.escape(pr["say"]))
        key, why = NOTE[ln["id"]]
        mark = {"approved": "O", "rejected": "X"}.get(state.get(ln["id"]), "")
        rows.append('<tr><td class="n">%d<br><small>%s</small></td><td class="e">%s</td><td>%s</td><td>%s</td><td><b>%s</b><br>%s</td><td class="a">%s</td></tr>' % (
            n, html.escape(ln["id"]), html.escape(ln["say"]), situ, html.escape(ln["ko"]), html.escape(key), html.escape(why), mark))
    body = "\n".join(rows)
    return """<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>B 등급 영어 줄 검토</title>
<style>
@page { size: A4 landscape; margin: 6mm; }
body { font: 9px/1.25 "Noto Sans KR", "Malgun Gothic", sans-serif; margin: 0; color: #111; background: #fff; }
h1 { font-size: 13px; margin: 0 0 2px; }
p { margin: 0 0 3px; }
table { border-collapse: collapse; width: 100%%; }
td, th { border: 1px solid #999; padding: 1px 4px; vertical-align: top; }
th { background: #eee; }
tr.m td { background: #dde7f3; }
tr.m span { color: #555; font-size: 9px; }
td.n { text-align: center; width: 34px; }
td.n small { color: #666; font-size: 8px; }
td.e { font-weight: bold; width: 135px; font-size: 11px; }
td.a { width: 80px; text-align: center; font-size: 14px; }
i { color: #555; font-style: normal; }
@media (max-width: 700px) { table { font-size: 9px; } }
</style></head><body>
<h1>B 등급 영어 줄 검토 (%d줄)</h1>
<p>줄마다 <b>O (쓴다)</b> 나 <b>X (뺀다)</b> 만 적는다. 뜻이 통하고 말해도 어색하지 않으면 O. 모르겠으면 비워 둔다. 답은 "3 O, 4 X" 처럼 번호로 말해도 된다.</p>
<table>
<tr><th>번호</th><th>영어</th><th>상황</th><th>한국어 뜻</th><th>왜 B 인가 (걸리는 말)</th><th>O (쓴다) / X (뺀다)</th></tr>
%s
</table>
</body></html>
""" % (len(b_lines(outs)), body)


def write_sheet(outs, missions, review_path=REVIEW, sheet_path=SHEET):
    """양식은 있는 답을 남기고 B 줄에 맞춘다. 시트는 그 답을 반영한다."""
    ids = [ln["id"] for _, ln, _ in b_lines(outs)]
    old = {}
    if os.path.exists(review_path):
        old = json.load(open(review_path, encoding="utf-8"))
    state, _ = normalize({k: v for k, v in old.items() if k in ids}, ids)
    tpl = {i: state[i] for i in ids}
    with open(review_path, "w", encoding="utf-8") as f:
        json.dump(tpl, f, ensure_ascii=False, indent=1)
        f.write("\n")
    with open(sheet_path, "w", encoding="utf-8") as f:
        f.write(sheet_html(outs, missions, state))
    return tpl


# ------------------------------------------------------------------ 실행

def load_sources():
    import authored_lib as L
    outs, fail = L.parse_lines()
    if fail:
        raise SystemExit("지은 줄 원본에 실패가 있다: %s" % fail[0])
    missions = json.load(open(OUTINGS, encoding="utf-8"))["missions"]
    return outs, missions


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--sheet", action="store_true", help="검토 시트와 빈 양식을 낸다")
    ap.add_argument("--check", action="store_true", help="거부한 줄이 나들이에 아직 쓰이면 실패한다")
    ap.add_argument("--strict", action="store_true", help="--check 에서 아직 정하지 않은 줄(null)도 실패로 센다")
    ap.add_argument("--plain", action="store_true", help="승인 목록을 맨 배열로 낸다")
    ap.add_argument("--review", default=REVIEW)
    ap.add_argument("--out", default=OUT)
    a = ap.parse_args(argv)
    outs, missions = load_sources()
    if a.sheet:
        tpl = write_sheet(outs, missions, a.review)
        print("시트 %s / 양식 %s / B 줄 %d" % (os.path.relpath(SHEET, ROOT), os.path.relpath(a.review, ROOT), len(tpl)))
        return 0
    ids = [ln["id"] for _, ln, _ in b_lines(outs)]
    state, err = normalize(json.load(open(a.review, encoding="utf-8")), ids)
    for e in err:
        print("[실패] " + e)
    if err:
        return 2
    if a.check:
        fail, note = check(state, outs, missions, a.strict)
        for x in note:
            print("[알림] " + x)
        for x in fail:
            print("[실패] " + x)
        print("승인 %d / 거부 %d / 미정 %d / 실패 %d" % (len(approved_ids(state)), sum(v == "rejected" for v in state.values()),
                                                       sum(v is None for v in state.values()), len(fail)))
        return 1 if fail else 0
    got = write_approved(state, a.out, a.plain)
    print("승인 %d줄 -> %s" % (len(got), os.path.relpath(a.out, ROOT) if a.out.startswith(ROOT) else a.out))
    pend = [k for k, v in state.items() if v is None]
    if pend:
        print("[알림] 아직 정하지 않은 줄 %d개는 승인 목록에 없다: %s" % (len(pend), " ".join(pend)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
