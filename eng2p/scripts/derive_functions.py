#!/usr/bin/env python3
"""기능 라벨 (can-do) 자료를 낸다. `out/game/functions.json`. 설계와 규칙은 docs/functions.md.

사용자가 정했다 (2026-10-12): 학습 피드백을 점수가 아니라 **어떤 기능을 해냈는가**로 준다.
줄 587개와 연습 177개에는 기능 라벨(`authored.json` 의 `function`)이 이미 다 있다. 없던 것은 둘이다.

    카드 600장 중 495장   기능 라벨이 없었다 (`replies.json` 의 fn 은 역할형 105장뿐이다)
    미션과 줄을 잇는 색인  "오늘 해낸 말" 과 "다시 만날 자리" 를 만들 재료

그래서 이 파일이 낸다.

    cards              카드마다 기능 라벨 (없으면 왜 없는가)
    missions, turns    미션의 기능, 차례마다 후보 줄의 기능 (결과 줄 `outing_turn.pick` 이 가리키는 곳)
    byMissionFunction  기능 -> 그 기능이 있는 미션 (열리는 세션 순서)
    byLineFunction     줄 기능 -> 그 줄이 점수 차례에 나오는 미션
    byCardFunction     기능 -> 그 기능이 붙은 카드

**새 분류를 짓지 않는다.** 라벨은 아래 어휘 셋 가운데 하나여야 하고 파생기가 규칙으로만 붙인다.

    standard10  기준서 4.4 의 10기능 (요청 거절 제안 불동의 사과 불평 칭찬 설명 협상 잡담)
    repair      기준서 2.1 repair 트랙 내용의 낱말 (되묻기 자기수정 끊김 처리 이해 확인 명료화 요청 시간 벌기 대화 유지)
    authored    authored.json 줄과 연습의 function 값, outings.json 미션의 functions 값

카드에 붙이는 규칙 (위에서부터. **카드 자신의 것이 있으면 강의 것은 안 쓴다**):

    purpose   역할형 카드의 A 면 `purpose` (10기능 낱말). 역할형은 105장 전부 있다
    pass      repair형 카드의 `a.pass` 에 repair 낱말이 그대로 있다 ("되묻기로 대응하면 성공")
    rotation  그 카드가 든 강의가 state/rotation.md 3.1 조합 등록부에 있다 (기능 코드 F01~F10). 화용 강의 13편이 전부 있다
    title     그 카드가 든 강의 제목에 어휘 셋의 낱말이 있다. **청크와 repair 트랙 강의에만** 쓴다.
              소리, 자동화, 문법 트랙은 기능을 연습하는 강의가 아니라서 제목에 낱말이 우연히 있어도 안 붙인다

규칙으로 못 붙이는 카드는 억지로 붙이지 않는다. `fn` 이 비고 `why` 가 까닭을 말한다.

**점수, 사람 이름, 느낌표가 없다.** 기능은 팀 단위 사실이다 (docs/functions.md 6장).

사용법:
    python3 scripts/derive_functions.py
    python3 scripts/derive_functions.py --check     # 쓰지 않고 지금 파일과 같은지만 본다
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CARDS = os.path.join(ROOT, "out", "data", "cards.json")
LECTURES = os.path.join(ROOT, "out", "data", "lectures.json")
ROTATION = os.path.join(ROOT, "state", "rotation.md")
SPEC = os.path.join(ROOT, "docs", "spec.md")
AUTHORED = os.path.join(ROOT, "out", "game", "authored.json")
OUTINGS = os.path.join(ROOT, "out", "game", "outings.json")
OUT = os.path.join(ROOT, "out", "game", "functions.json")

VERSION = 1
# 기준서 2.1 "repair 트랙 내용" 목록에서 온 낱말. 파생기가 spec.md 에 이 낱말이 정말 있는지 본다 (공백 무시)
REPAIR_TERMS = ["되묻기", "자기수정", "끊김 처리", "이해 확인", "명료화 요청", "시간 벌기", "대화 유지"]
# 강의 단위 라벨을 붙여도 되는 트랙. 나머지(소리, 자동화, 문법)는 기능이 아니라 소리, 속도, 규칙을 연습한다
LECTURE_TRACKS = ["청크", "repair", "화용"]
BASES = ["purpose", "pass", "rotation", "title"]
# fn 이 빈 카드의 까닭. 키는 강의 트랙이다
WHY = {
    "소리": "소리 트랙 강의다. 소리를 가려내고 따라 하는 연습이라 기준서의 기능 낱말이 없다",
    "자동화": "자동화 트랙 강의다. 속도와 무중단을 재는 연습이라 기준서의 기능 낱말이 없다",
    "문법": "문법 트랙 강의다. 덩어리에서 규칙을 뽑는 연습이라 기준서의 기능 낱말이 없다",
    "청크": "청크 트랙 강의인데 제목이 기준서나 지은 줄의 기능 낱말이 아니다 (덩어리의 주제 이름이다)",
    "repair": "repair 트랙 강의인데 제목과 카드에 기준서 2.1 의 repair 낱말이 없다",
    "화용": "화용 트랙 강의인데 조합 등록부(state/rotation.md)에도 제목에도 없다",
}
SECTION_DONE = "done"


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def squash(s):
    return re.sub(r"\s+", "", s)


def section(text, head):
    """'### 4.4 ...' 처럼 head 로 시작하는 줄부터 다음 '###' 또는 '##' 전까지."""
    i = text.find(head)
    if i < 0:
        return None
    j = re.search(r"\n#{2,3} ", text[i + len(head):])
    return text[i:i + len(head) + (j.start() if j else len(text))]


def spec_terms(fail):
    """기준서 4.4 의 10기능 (문서 차례대로)와 2.1 repair 목록."""
    spec = open(SPEC, encoding="utf-8").read()
    sec = section(spec, "### 4.4 10기능")
    ten = []
    if sec:
        body = sec.split("\n", 1)[1]
        ten = [t.strip() for t in body.replace("\n", " ").split("/") if t.strip()]
    if len(ten) != 10:
        fail.append("docs/spec.md 4.4 에서 10기능을 %d개 읽었다" % len(ten))
    s21 = section(spec, "### 2.1 6트랙")
    block = ""
    if s21:
        i = s21.find("repair 트랙 내용:")
        block = s21[i:] if i >= 0 else ""
    if not block:
        fail.append("docs/spec.md 2.1 에서 'repair 트랙 내용' 을 못 읽었다")
    for t in REPAIR_TERMS:
        if squash(t) not in squash(block):
            fail.append("repair 낱말 '%s' 이 docs/spec.md 2.1 repair 트랙 내용에 없다" % t)
    return ten, REPAIR_TERMS[:]


def rows_of(text):
    out = []
    for ln in text.split("\n"):
        if ln.startswith("|") and not re.match(r"^\|[\s\-|]+\|?$", ln):
            out.append([c.strip() for c in ln.strip().strip("|").split("|")])
    return out


def rotation(fail, ten):
    """state/rotation.md: 1.3 기능 코드 표, 3.1 등록부. 돌려주는 것: (강의 번호 -> 낱말, (분기, 카드 번호) -> 낱말)."""
    text = open(ROTATION, encoding="utf-8").read()
    codes = {}
    for r in rows_of(section(text, "### 1.3 기능 10") or ""):
        if re.fullmatch(r"F\d\d", r[0]):
            codes[r[0]] = r[1]
    if sorted(codes.values()) != sorted(ten) or [codes.get("F%02d" % (i + 1)) for i in range(10)] != ten:
        fail.append("state/rotation.md 1.3 의 기능 코드 표가 기준서 4.4 의 10기능과 다르다")
    lec, card = {}, {}
    for r in rows_of(section(text, "### 3.1 현재 등록 내역") or ""):
        if len(r) != 8 or r[5] not in codes:
            continue
        m = re.fullmatch(r"eng2p_q\d_l(\d{3})", r[0])
        if r[2] == "강의" and m:
            lec[int(m.group(1))] = codes[r[5]]
        m = re.fullmatch(r"카드 (\d+)", r[0])
        if r[2] == "카드" and m:
            card[(r[1], int(m.group(1)))] = codes[r[5]]
    return lec, card


def find_terms(text, plain, strict):
    """text 안의 낱말을 긴 것부터 겹치지 않게 찾아 나온 차례대로 돌려준다.
    plain 은 그대로 들어 있으면 되고 strict 는 앞이 한글이 아니고 뒤가 한글 아니거나 와/과/하는 이어야 한다
    (authored 의 '묻기' '인사' 같은 흔한 낱말이 다른 낱말 속에서 잡히지 않게)."""
    used = [False] * len(text)
    hits = []
    pool = [(t, False) for t in plain] + [(t, True) for t in strict if t not in plain]
    pool.sort(key=lambda x: (-len(x[0]), x[0]))
    for term, st in pool:
        pat = re.escape(term)
        if st:
            pat = r"(?<![가-힣A-Za-z0-9])" + pat + r"(?=$|[^가-힣]|와|과|하는)"
        for m in re.finditer(pat, text):
            if not any(used[m.start():m.end()]):
                for i in range(m.start(), m.end()):
                    used[i] = True
                hits.append((m.start(), term))
    return [t for _, t in sorted(hits)]


def authored_terms(A, O):
    lines = set(l["function"] for l in A["lines"]) | set(p["function"] for p in A["practice"])
    missions = set(f for m in O["missions"] for f in m["functions"])
    return lines, missions


def build():
    """(결과 객체, 실패 목록)."""
    fail = []
    ten, repair = spec_terms(fail)
    lec_reg, card_reg = rotation(fail, ten)
    cards = load(CARDS)["items"]
    lectures = load(LECTURES)["items"]
    A, O = load(AUTHORED), load(OUTINGS)
    line_fns, mission_fns = authored_terms(A, O)
    vocab = set(ten) | set(repair) | line_fns | mission_fns
    strict = sorted(line_fns | mission_fns)

    # 카드 -> 강의
    lec_of = {}
    for l in lectures:
        for no in range(l["cards"]["from"], l["cards"]["to"] + 1):
            key = (l["quarter"], no)
            if key in lec_of:
                fail.append("카드 %s-%03d 가 강의 두 편에 걸렸다" % key)
            lec_of[key] = l
    if len(cards) != 600:
        fail.append("카드가 %d장이다 (600 이어야 한다)" % len(cards))

    # 강의 단위 라벨: 조합 등록부가 먼저, 없으면 제목
    lec_label = {}
    for l in lectures:
        if l["no"] in lec_reg:
            lec_label[l["no"]] = ([lec_reg[l["no"]]], "rotation")
        elif l["track"] in LECTURE_TRACKS:
            hits = find_terms(l["title"], ten + repair, strict)
            if hits:
                lec_label[l["no"]] = (hits, "title")

    out_cards, counts = {}, {"purpose": 0, "pass": 0, "rotation": 0, "title": 0, "none": 0}
    for c in cards:
        key = (c["quarter"], c["no"])
        l = lec_of.get(key)
        if l is None:
            fail.append("카드 %s 가 어느 강의에도 안 든다" % c["id"])
            continue
        fn, by = [], None
        if c["type"] == "역할":
            p = c["a"].get("purpose")
            if p in ten:
                fn, by = [p], "purpose"
        elif c["type"] == "repair":
            hits = find_terms(c["a"].get("pass", ""), repair, [])
            if hits:
                fn, by = hits, "pass"
        if not fn and l["no"] in lec_label:
            fn, by = lec_label[l["no"]]
        row = {"lecture": l["no"], "track": l["track"], "type": c["type"], "fn": fn, "by": by}
        if not fn:
            row["why"] = l["track"]
            counts["none"] += 1
        else:
            counts[by] += 1
        out_cards[c["id"]] = row
    for cid, row in out_cards.items():
        for f in row["fn"]:
            if f not in vocab:
                fail.append("카드 %s 의 기능 '%s' 이 어휘 셋에 없다" % (cid, f))

    # 미션과 차례
    lines = {l["id"]: l for l in A["lines"]}
    missions, turns = {}, {}
    by_line, by_mission = {}, {}
    order = sorted(O["missions"], key=lambda m: (m["unlock"]["session"], m["id"]))
    for m in order:
        mt, seen = {}, []
        for i, t in enumerate(m["game"]["turns"], 1):
            if not t["scored"]:
                continue
            pick = {}
            for pid in t["pick"]:
                ln = lines.get(pid)
                if ln is None or ln["outing"] != m["id"] or ln["kind"] not in ("option", "wait"):
                    fail.append("미션 %s 차례 %d 의 후보 %s 가 그 미션의 플레이어 줄이 아니다" % (m["id"], i, pid))
                    continue
                pick[pid] = ln["function"]
                if ln["function"] not in seen:
                    seen.append(ln["function"])
            fns = sorted(set(pick.values()))
            mt[str(i)] = {"id": t["id"], "same": fns[0] if len(fns) == 1 else None, "pick": pick}
        turns[m["id"]] = mt
        missions[m["id"]] = {"unlock": m["unlock"]["session"], "functions": list(m["functions"]), "lineFunctions": seen}
        for f in seen:
            by_line.setdefault(f, []).append(m["id"])
        for f in m["functions"]:
            by_mission.setdefault(f, []).append(m["id"])
    by_card = {}
    for cid in sorted(out_cards):
        for f in out_cards[cid]["fn"]:
            by_card.setdefault(f, []).append(cid)

    labeled = 600 - counts["none"]
    unlabeled = {}
    for cid, row in out_cards.items():
        if not row["fn"]:
            unlabeled.setdefault(row["lecture"], []).append(cid)
    result = {
        "version": VERSION,
        "note": "기능 라벨(can-do) 자료. 카드 600장의 기능, 미션 차례의 후보 줄 기능, 기능 -> 미션 색인. 손으로 안 고친다. "
                "scripts/derive_functions.py 를 다시 돌린다. 규칙과 쓰는 법은 docs/functions.md. 게임은 아직 안 읽는다(선택 자료).",
        "grade": "B",
        "gradeWhy": "기능 낱말은 기준서와 지은 줄에서 온 것이라 새로 짓지 않았다. 카드에 어느 낱말을 붙이는가는 사람이 정한 규칙이고 "
                    "강의 단위 라벨은 그 강의 카드 전부가 그 기능을 연습한다는 가정이다 (B).",
        "generator": "scripts/derive_functions.py",
        "source": ["docs/spec.md 2.1 4.4", "state/rotation.md 1.3 3.1", "out/data/cards.json", "out/data/lectures.json",
                   "out/game/authored.json", "out/game/outings.json"],
        "vocabulary": {
            "standard10": {"source": "docs/spec.md 4.4", "terms": ten},
            "repair": {"source": "docs/spec.md 2.1 repair 트랙 내용", "terms": repair},
            "authoredLine": {"source": "out/game/authored.json lines[].function, practice[].function", "count": len(line_fns)},
            "authoredMission": {"source": "out/game/outings.json missions[].functions", "count": len(mission_fns)},
        },
        "rules": {
            "cards": "카드 자신의 라벨이 있으면 강의 것은 안 쓴다. purpose: 역할형 카드 A 면의 purpose. pass: repair형 카드 a.pass 에 repair 낱말이 "
                     "그대로 있다. rotation: 강의가 state/rotation.md 3.1 에 있다. title: 청크와 repair 트랙 강의 제목에 어휘 셋의 낱말이 있다. "
                     "없으면 fn 이 비고 why 가 까닭(강의 트랙)이다",
            "done": "해낸 차례 = outcome 이 pass 나 near (docs/game_results.md 5.1). miss 와 skipped 의 기능은 세지 않는다 (tone.md 3장: 한 것만 적는다)",
            "turns": "미션 차례 번호는 game.turns 의 1부터 센 번호다 (NPC 만 말하는 차례도 번호를 먹는다). 점수 차례만 있다. "
                     "same 은 후보 줄의 기능이 모두 같으면 그 기능, 갈리면 null (그때는 결과 줄의 pick 으로만 안다)",
            "withScore": "기능 피드백은 점수를 대체하지 않고 점수와 함께 쓴다 (사용자 2026-10-12). 점수, 차례 결과(pass near miss), 레벨 곡선 데이터는 그대로이고 "
                         "이 파일은 거기에 더한 것이다. 이 파일에는 점수가 없다. 결과 줄과 같은 키 이름을 써서 같은 행/요약에서 함께 읽는다: "
                         "mission(미션 id), turn(차례 번호), outcome, pick(고른 줄 id), 카드는 id(Q1-001)",
            "join": "결과 줄 outing_turn {mission, turn, outcome, pick} -> turns[mission][turn].pick[pick] 이 그 차례에 해낸 줄의 기능. "
                    "pick 이 없으면 turns[mission][turn].same (갈리면 null 이라 기능을 모른다). card_run {id, outcome} -> cards[id].fn",
            "again": "다시 만날 자리 = byLineFunction[해낸 줄 기능] 에서 지금 미션을 빼고 unlock 이 오늘 세션 이하인 것",
        },
        "whyTexts": WHY,
        "counts": {
            "cards": 600, "labeled": labeled, "unlabeled": counts["none"],
            "by": {k: counts[k] for k in BASES},
            "cardFunctions": len(by_card),
            "missions": len(missions), "scoredTurns": sum(len(v) for v in turns.values()),
            "sameFunctionTurns": sum(1 for v in turns.values() for t in v.values() if t["same"] is not None),
            "splitFunctionTurns": sum(1 for v in turns.values() for t in v.values() if t["same"] is None),
            "lineFunctions": len(by_line), "missionFunctions": len(by_mission),
        },
        "unlabeledByLecture": {str(k): v for k, v in sorted(unlabeled.items())},
        "cards": out_cards,
        "missions": missions,
        "turns": turns,
        "byMissionFunction": dict(sorted(by_mission.items())),
        "byLineFunction": dict(sorted(by_line.items())),
        "byCardFunction": dict(sorted(by_card.items())),
    }
    return result, fail


def dump(obj):
    return json.dumps(obj, ensure_ascii=False, indent=1) + "\n"


def main():
    obj, fail = build()
    if fail:
        for f in fail:
            print("[실패] " + f)
        return 1
    text = dump(obj)
    c = obj["counts"]
    if "--check" in sys.argv:
        have = open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
        if have != text:
            print("[실패] out/game/functions.json 이 원본과 다르다. python3 scripts/derive_functions.py 를 돌린다")
            return 1
        print("functions.json 이 원본과 같다")
        return 0
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(text)
    print("out/game/functions.json / 카드 %d장 중 기능 라벨 %d (역할 %d, repair 낱말 %d, 등록부 %d, 제목 %d), 없음 %d / 미션 %d, 점수 차례 %d "
          "(기능이 갈리는 차례 %d) / %dKB"
          % (c["cards"], c["labeled"], c["by"]["purpose"], c["by"]["pass"], c["by"]["rotation"], c["by"]["title"],
             c["unlabeled"], c["missions"], c["scoredTurns"], c["splitFunctionTurns"], len(text.encode("utf-8")) // 1024))
    return 0


if __name__ == "__main__":
    sys.exit(main())
