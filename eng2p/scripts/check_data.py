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
import hashlib
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "out" / "data" / "lectures.json"
CARDDATA = ROOT / "out" / "data" / "cards.json"
SETDATA = ROOT / "out" / "data" / "sets.json"
HANDDATA = ROOT / "out" / "data" / "handouts.json"
EMGDATA = ROOT / "out" / "data" / "emergency.json"
TASKDATA = ROOT / "out" / "data" / "tasks.json"
INDEX = ROOT / "out" / "data" / "index.json"
HAND = ROOT / "out" / "handouts"
SETS = ROOT / "out" / "sets"

FAIL = []


def cmp(n, what, a, b):
    if a != b:
        FAIL.append("%d강 %s: JSON 은 %r 인데 강의록은 %r 이다" % (n, what, a, b))


# 기준서 8.1 이 정한 분기별 유형 총량이다. JSON 이 그것을 담고 있는지 여기서 본다.
# check_cards_plan.py 가 배정표와 견주고 여기서는 파생된 데이터와 견준다.
TYPE_TOTALS = {
    "Q1": {"판정": 75, "압박": 25, "확장": 20, "역할": 10, "repair": 20},
    "Q4": {"판정": 10, "압박": 25, "확장": 30, "역할": 55, "repair": 30},
}
# 압박형 제한시간. 계단 카드는 발화 길이라 여기서 뺀다.
# 10초부터가 계단이다. Q2 086 이 39강 첫 계단이고 그것이 10초다.
# 반응 시간으로 10초를 주는 카드는 Q2 부터는 없다. Q1 만 소리 판정에 8초와 10초를 쓴다.
QUARTER_SEC = {"Q2": 5, "Q3": 3, "Q4": 2}


def check_cards(lec):
    """카드 JSON 이 강의 JSON 및 기준서와 맞는가."""
    if not CARDDATA.exists():
        FAIL.append("cards.json 이 없다")
        return
    cards = json.loads(CARDDATA.read_text(encoding="utf-8"))["items"]
    by = {}
    for c in cards:
        if c["id"] in by:
            FAIL.append("카드 id 가 겹친다: %s" % c["id"])
        by[c["id"]] = c

    for q, want in TYPE_TOTALS.items():
        got = {}
        for c in cards:
            if c["quarter"] == q:
                got[c["type"]] = got.get(c["type"], 0) + 1
        if got != want:
            FAIL.append("%s 유형 총량이 기준서 8.1과 다르다: %r" % (q, got))

    # 강의가 가리키는 카드가 그 분기 카드로 다 있는가
    for n, it in sorted(lec.items()):
        if not it["cards"]:
            continue
        for i in range(it["cards"]["from"], it["cards"]["to"] + 1):
            key = "%s-%03d" % (it["quarter"], i)
            if key not in by:
                FAIL.append("%d강이 가리키는 카드 %s 가 cards.json 에 없다" % (n, key))

    # 압박형 초가 분기 규정과 맞는가. 계단 카드(10초 넘음)는 발화 길이라 뺀다.
    for c in cards:
        if c["type"] != "압박" or c["quarter"] not in QUARTER_SEC:
            continue
        if c["seconds"] is None:
            FAIL.append("압박형 %s 에 초가 없다" % c["id"])
        elif c["seconds"] >= 10:
            continue
        elif c["seconds"] not in (QUARTER_SEC[c["quarter"]], 2):
            FAIL.append("압박형 %s 가 %d초다. %s는 %d초다"
                        % (c["id"], c["seconds"], c["quarter"],
                           QUARTER_SEC[c["quarter"]]))

    # 기준서가 정한 것 둘. 판정형 정답은 A면에만, 역할형은 5요소가 다 있어야 한다.
    need = ["situation", "relation", "purpose", "register", "endCondition"]
    for c in cards:
        if c["type"] == "판정" and c["b"].get("answer"):
            FAIL.append("판정형 %s 의 B면에 정답이 있다" % c["id"])
        if c["type"] == "역할":
            for s in ("a", "b"):
                miss = [k for k in need if not c[s].get(k)]
                if miss:
                    FAIL.append("역할형 %s %s면에 %s 가 없다"
                                % (c["id"], s.upper(), " ".join(miss)))
            # 다섯 요소는 두 면이 같아야 한다. 특히 종료 조건이다.
            # 한쪽이 헐거우면 한 사람은 끝났다고 보고 한 사람은 아니라고 본다.
            # T95 에서 Q1 세 장이 그 상태였다. 132 137 150 이다.
            for k in need:
                if c["a"].get(k) != c["b"].get(k):
                    FAIL.append("역할형 %s 의 %s 가 두 면에서 다르다" % (c["id"], k))
        for s in ("a", "b"):
            if not c[s].get("instruction") or not c[s].get("pass"):
                FAIL.append("%s %s면에 지시나 성공 기준이 없다" % (c["id"], s.upper()))


def check_sets(lec):
    """세트 JSON 이 주차 배정 및 30분 구성과 맞는가."""
    if not SETDATA.exists():
        FAIL.append("sets.json 이 없다")
        return
    sets = json.loads(SETDATA.read_text(encoding="utf-8"))["items"]
    if len(sets) != 288:
        FAIL.append("세트가 %d개다. 288개여야 한다" % len(sets))

    per = {}
    for s in sets:
        per.setdefault(s["week"], []).append(s)
        # 한 세트가 30분이다. 네 단계의 분을 더해 본다.
        got = sum(x["minutes"] for x in s["steps"])
        if got != 30:
            FAIL.append("세트 %s 의 분 합이 %d이다. 30이어야 한다" % (s["id"], got))
        if [x["step"] for x in s["steps"]] != [1, 2, 3, 4]:
            FAIL.append("세트 %s 의 단계가 1234가 아니다" % s["id"])
        # 그 세트가 붙는 강이 그 주차의 두 강 중 하나여야 한다.
        want = {s["week"] * 2 - 1, s["week"] * 2}
        if s["lecture"] not in want:
            FAIL.append("세트 %s 가 %r강에 붙는다. %d주차는 %s강이다"
                        % (s["id"], s["lecture"], s["week"], sorted(want)))
        if lec.get(s["lecture"], {}).get("quarter") != s["quarter"]:
            FAIL.append("세트 %s 의 분기가 그 강의 분기와 다르다" % s["id"])

    # 2단계 방식 넷이 연달아 같으면 안 된다. 세트 파일이 그렇게 적어 놓았다.
    # 주 안에서만 보면 주 경계가 안 잡힌다. 288개를 한 줄로 놓고 본다.
    # T95 에서 일곱 자리가 걸렸다. 주 안이 셋, 주 경계가 넷이다.
    METHODS = {"예시 추가", "반례 제시", "요약 압축", "상황 적용"}
    seq = sorted(sets, key=lambda y: (y["week"], y["no"]))
    for i, x in enumerate(seq):
        m = x["steps"][1]["fields"].get("재구성 방식")
        if m not in METHODS:
            FAIL.append("세트 %s 의 2단계 방식이 넷 밖이다: %r" % (x["id"], m))
        if i and m == seq[i - 1]["steps"][1]["fields"].get("재구성 방식"):
            FAIL.append("세트 %s 와 %s 가 연달아 같은 방식이다: %s"
                        % (seq[i - 1]["id"], x["id"], m))

    # 설명 대상이 288개 다 달라야 한다. 같은 제목이 둘이면 두 자리가 같은 것으로 보인다.
    # T95 에서 하나 나왔다. 70강과 94강이 제목만 같고 안이 달랐다.
    topics = {}
    for x in sets:
        k = x["steps"][0]["fields"].get("설명 대상")
        if k in topics:
            FAIL.append("세트 %s 와 %s 의 설명 대상이 같다: %s"
                        % (topics[k], x["id"], k))
        topics[k] = x["id"]

    # 주 6세트다. 하루 하나씩 여섯 날이다.
    for w, xs in sorted(per.items()):
        if len(xs) != 6:
            FAIL.append("%d주차 세트가 %d개다. 6개여야 한다" % (w, len(xs)))


def check_handouts(lec):
    """강의록 JSON 이 강의 JSON 과 같은 값을 드는가.

    둘은 파생 경로가 다르다. 강의록 JSON 은 강의록 마크다운을 읽고
    강의 JSON 은 강의 마크다운을 읽는다. 그래서 견줄 값이 된다.
    """
    if not HANDDATA.exists():
        FAIL.append("handouts.json 이 없다")
        return
    hs = {h["no"]: h for h in json.loads(
        HANDDATA.read_text(encoding="utf-8"))["items"]}
    if sorted(hs) != list(range(1, 97)):
        FAIL.append("handouts.json 번호가 1부터 96까지가 아니다")
    for n, it in sorted(lec.items()):
        h = hs.get(n)
        if not h:
            continue
        if h["title"] != it["title"]:
            FAIL.append("%d강 제목: 강의록 JSON 은 %r 인데 강의 JSON 은 %r 이다"
                        % (n, h["title"], it["title"]))
        if h["quarter"] != it["quarter"] or h["track"] != it["track"]:
            FAIL.append("%d강 분기나 트랙이 두 JSON 에서 다르다" % n)
        if len(h["back"]["record"]) != len(it["criteria"]):
            FAIL.append("%d강 기록 항목 수: 강의록 %d개 강의 %d개"
                        % (n, len(h["back"]["record"]), len(it["criteria"])))
        if len(h["back"]["notMeasured"]) != len(it["notMeasured"]):
            FAIL.append("%d강 안 재는 것 수가 두 JSON 에서 다르다" % n)
        if h["back"]["stuck"] != it["stuck"]:
            FAIL.append("%d강 막혔을 때가 두 JSON 에서 다르다" % n)
        # 카드 칸은 종이 문구다. 그 안의 번호가 강의 JSON 의 범위와 맞아야 한다.
        m = re.search(r"카드 (\d{3}) ~ (\d{3})", h["front"]["cards"] or "")
        want = {"from": int(m.group(1)), "to": int(m.group(2))} if m else None
        if want != it["cards"]:
            FAIL.append("%d강 카드 범위가 두 JSON 에서 다르다" % n)


# 기준서 개정 10번. 분기마다 스무 개다.
EMG_PER_QUARTER = 20
# 산출 과제집 분량 계단. 기준서 9장.
TASK_CHARS = {"Q1": 100, "Q2": 250, "Q3": 400, "Q4": 600}
# 비상판이 안 붙는 강. 분기마다 넷이고 네 파일이 그 이유를 적고 있다.
UNCOVERED = [21, 22, 23, 24, 44, 45, 47, 48, 69, 70, 71, 72, 83, 94, 95, 96]


def check_emergency(lec):
    if not EMGDATA.exists():
        FAIL.append("emergency.json 이 없다")
        return
    es = json.loads(EMGDATA.read_text(encoding="utf-8"))["items"]
    if sorted(x["no"] for x in es) != list(range(1, 81)):
        FAIL.append("비상판 번호가 1부터 80까지가 아니다")
    per = {}
    seen = {}
    for x in es:
        per[x["quarter"]] = per.get(x["quarter"], 0) + 1
        if not x["lecture"]:
            FAIL.append("비상판 %03d 에 대응강의가 없다" % x["no"])
            continue
        if x["lecture"] in seen:
            FAIL.append("비상판 %03d 과 %03d 이 같은 %d강에 붙는다"
                        % (seen[x["lecture"]], x["no"], x["lecture"]))
        seen[x["lecture"]] = x["no"]
        q = lec.get(x["lecture"], {}).get("quarter")
        if q != x["quarter"]:
            FAIL.append("비상판 %03d 은 %s인데 %d강은 %s다"
                        % (x["no"], x["quarter"], x["lecture"], q))
        if not x["chunks"]:
            FAIL.append("비상판 %03d 에 청크가 없다" % x["no"])
    # 비상판이 없는 강 열여섯이다. 넷씩 네 분기다.
    # Q3 와 Q4 는 상대가 있어야 하는 강이라 뺐고 Q1 과 Q2 는 총량에서 잘린 것이다.
    # 어느 쪽이든 네 파일이 그 이유를 적고 있어야 한다. 안 적으면 빠뜨린 것으로 보인다.
    uncovered = sorted(set(range(1, 97)) - set(seen))
    if uncovered != UNCOVERED:
        FAIL.append("비상판 없는 강이 %r 이다. 적어 둔 것은 %r 이다"
                    % (uncovered, UNCOVERED))
    src = "".join(f.read_text(encoding="utf-8")
                  for f in sorted((ROOT / "out" / "emergency").glob("*.md")))
    for n in uncovered:
        if "%d강" % n not in src and "%03d" % n not in src:
            FAIL.append("%d강에 비상판이 없는데 그 이유가 어디에도 없다" % n)

    for q, n in sorted(per.items()):
        if n != EMG_PER_QUARTER:
            FAIL.append("%s 비상판이 %d개다. %d개여야 한다"
                        % (q, n, EMG_PER_QUARTER))


def check_tasks(lec):
    if not TASKDATA.exists():
        FAIL.append("tasks.json 이 없다")
        return
    ts = json.loads(TASKDATA.read_text(encoding="utf-8"))["items"]
    if sorted(x["week"] for x in ts) != list(range(1, 49)):
        FAIL.append("과제집 주차가 1부터 48까지가 아니다")
    for x in ts:
        want = TASK_CHARS.get(x["quarter"])
        if want and x["minChars"] != want:
            FAIL.append("%d주차 분량이 %d자다. %s는 %d자다"
                        % (x["week"], x["minChars"], x["quarter"], want))
        for n in x["lectures"]:
            if lec.get(n, {}).get("quarter") != x["quarter"]:
                FAIL.append("%d주차 과제가 %d강에 붙는데 분기가 다르다"
                            % (x["week"], n))
        for k in ("task", "condition", "how", "check"):
            if not x.get(k):
                FAIL.append("%d주차 과제집에 %s 가 없다" % (x["week"], k))


def check_js_pairs():
    """.js 가 .json 과 같은 내용인가.

    앱은 .js 쪽을 읽는다. file:// 에서 fetch 가 막히기 때문이다.
    둘이 어긋나면 검사는 .json 을 보고 통과라고 하는데 앱은 다른 것을 보여 준다.
    **검사하는 것과 쓰는 것이 다르면 검사가 아니다.**
    """
    for j in sorted((ROOT / "out" / "data").glob("*.json")):
        js = j.with_suffix(".js")
        if not js.exists():
            FAIL.append("%s 에 짝이 되는 .js 가 없다" % j.name)
            continue
        body = js.read_text(encoding="utf-8")
        i = body.find("=")
        if i < 0 or not body.startswith("window."):
            FAIL.append("%s 가 window.NAME= 형태가 아니다" % js.name)
            continue
        try:
            a = json.loads(body[i + 1:].rstrip().rstrip(";"))
        except ValueError:
            FAIL.append("%s 안이 JSON 으로 안 읽힌다" % js.name)
            continue
        if a != json.loads(j.read_text(encoding="utf-8")):
            FAIL.append("%s 와 %s 의 내용이 다르다" % (js.name, j.name))


def check_index(lec):
    """묶음 파일이 다른 파일들과 맞는가. 크기와 해시까지 본다."""
    if not INDEX.exists():
        FAIL.append("index.json 이 없다")
        return
    idx = json.loads(INDEX.read_text(encoding="utf-8"))

    want = {"lectures": 96, "cards": 600, "sets": 288,
            "handouts": 96, "emergency": 80, "tasks": 48}
    if idx["counts"] != want:
        FAIL.append("index.json 개수가 다르다: %r" % idx["counts"])

    # 해시가 맞아야 앱이 받은 것이 이 저장소의 것이다.
    for f in idx["files"]:
        p = INDEX.parent / f["file"]
        if not p.exists():
            FAIL.append("index.json 이 없는 파일을 가리킨다: %s" % f["file"])
            continue
        b = p.read_bytes()
        if len(b) != f["bytes"]:
            FAIL.append("%s 크기가 index.json 과 다르다" % f["file"])
        if hashlib.sha256(b).hexdigest() != f["sha256"]:
            FAIL.append("%s 해시가 index.json 과 다르다" % f["file"])

    ws = [w["week"] for w in idx["weeks"]]
    if ws != list(range(1, 49)):
        FAIL.append("index.json 주차가 1부터 48까지가 아니다")
    for w in idx["weeks"]:
        ns = [x["no"] for x in w["lectures"]]
        if ns != [w["week"] * 2 - 1, w["week"] * 2]:
            FAIL.append("%d주차 강이 %r 이다" % (w["week"], ns))
        if len(w["sets"]) != 6:
            FAIL.append("%d주차 세트가 %d개다" % (w["week"], len(w["sets"])))
        for x in w["lectures"]:
            src = lec.get(x["no"], {})
            if x["title"] != src.get("title") or x["media"] != src.get("media"):
                FAIL.append("%d강 제목이나 미디어가 index.json 과 다르다" % x["no"])
        if not w["task"]:
            FAIL.append("%d주차 과제가 index.json 에 없다" % w["week"])
        # 한 주가 여섯 세션이다. 앞 사흘이 앞 강이고 뒤 사흘이 뒤 강이다.
        ds = w.get("days") or []
        if [d["day"] for d in ds] != [1, 2, 3, 4, 5, 6]:
            FAIL.append("%d주차 날이 1부터 6까지가 아니다" % w["week"])
            continue
        want = [w["week"] * 2 - 1] * 3 + [w["week"] * 2] * 3
        if [d["lecture"] for d in ds] != want:
            FAIL.append("%d주차 날별 강이 %r 이다. %r 이어야 한다"
                        % (w["week"], [d["lecture"] for d in ds], want))
        if sorted(d["set"] for d in ds) != sorted(w["sets"]):
            FAIL.append("%d주차 날별 세트가 그 주 세트 여섯과 다르다" % w["week"])

    # 블록 넷은 288세션이 다 같다. 매뉴얼 2.2 다. 합이 2시간이어야 한다.
    bl = idx.get("blocks") or []
    if [b["no"] for b in bl] != [1, 2, 3, 4]:
        FAIL.append("index.json 블록이 1234가 아니다")
    if sum(b["minutes"] for b in bl) != 120:
        FAIL.append("블록 시간 합이 %d분이다. 120분이어야 한다"
                    % sum(b["minutes"] for b in bl))
    if not idx.get("roleRule"):
        FAIL.append("index.json 에 역할 규칙이 없다")


# 판이 읽는 자료. **여기 들어 있는 글은 문서가 아니라 화면으로 간다.**
PLAYDATA = ["pairs", "swaps", "listen", "relay", "chunks", "halves",
            "ladder", "wall", "situ", "wave", "whose", "reask", "cutin",
            "clash", "flip", "onepick", "apart", "playblocks", "tally", "quest", "badge", "voice", "ahead", "track"]


def check_play_plain():
    """판 자료에 마크다운 표시가 섞였는가.

    **T265 에서 한 번 겪었다.** 화면은 `**` 를 굵게 안 그리고 별 둘을 그린다.
    그때 파생기 하나를 고쳤고 그 뒤에 만든 파생기 넷이 같은 것을 또 흘렸다.
    T292 에 `wall.json` 의 Q1-054 에서 다시 나왔다.

    **한 번 고친 자리는 검사로 막는다.** 안 막으면 다음 파생기가 또 흘린다.
    """
    for name in PLAYDATA:
        f = ROOT / "out" / "data" / (name + ".json")
        if not f.exists():
            continue
        hit = []

        def walk(o, path):
            if isinstance(o, str):
                if "**" in o:
                    hit.append(path)
            elif isinstance(o, dict):
                for k, v in o.items():
                    walk(v, path + "/" + str(k))
            elif isinstance(o, list):
                for i, v in enumerate(o):
                    walk(v, path + "/" + str(i))

        walk(json.loads(f.read_text(encoding="utf-8")), name)
        for h in hit[:5]:
            FAIL.append("%s 에 마크다운 표시가 있다. 화면은 별 둘을 그대로 그린다" % h)
        if len(hit) > 5:
            FAIL.append("%s 에 그런 자리가 %d곳 더 있다" % (name, len(hit) - 5))


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

    check_cards(items)
    check_sets(items)
    check_handouts(items)
    check_emergency(items)
    check_tasks(items)
    check_index(items)
    check_js_pairs()
    check_play_plain()

    for m in FAIL:
        print("[실패] %s" % m)
    print()
    nc = len(json.loads(CARDDATA.read_text(encoding="utf-8"))["items"]) if CARDDATA.exists() else 0
    ns = len(json.loads(SETDATA.read_text(encoding="utf-8"))["items"]) if SETDATA.exists() else 0
    nh = len(json.loads(HANDDATA.read_text(encoding="utf-8"))["items"]) if HANDDATA.exists() else 0
    def cnt(p):
        return len(json.loads(p.read_text(encoding="utf-8"))["items"]) if p.exists() else 0
    print("강의 %d편 / 카드 %d장 / 세트 %d개 / 강의록 %d편 / 비상판 %d개 / 과제집 %d주"
          % (len(items), nc, ns, nh, cnt(EMGDATA), cnt(TASKDATA)))
    print("실패 %d" % len(FAIL))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
