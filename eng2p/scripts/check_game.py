#!/usr/bin/env python3
"""게임 1년치에 지금까지 만든 자료가 다 들어갔는가 (`docs/game.md`).

게임이 모든 공부를 대체한다 (2026-10-07 결정). 그러면 **게임 세션에 안 들어간
자료는 두 사람이 1년 동안 한 번도 못 보는 자료**다. 앱이 있을 때는 탭을 열어
볼 수 있었는데 게임에는 그 문이 없다.

그래서 세는 것이 아니라 **하나라도 빠지면 실패**로 건다.

    강 96 / 세트 288 / 카드 600 / 실제 녹음 52과 / 비상판 80 / 48주

그리고 하루의 꼴을 본다. 블록 넷이 120분인가, 두 사람이 늘 같은 곳에 있는가,
무대가 문서 표와 같은가.

개정문 24 25 26 (2026-10-07) 셋을 여기서 건다. **숫자는 기준서 문장에서 읽는다.**

    간격 복습 (8.4)    사다리대로 다시 나오는가. 카드마다 1년에 다섯 번 이상인가
    다시 말하기 (2.3)  블록 4 에 두 사람 몫이 다 있고 20분 안에 드는가
    다지기 주 (2.5)    그 주에 새 강과 새 카드가 없는가. 시간 셈이 576 그대로인가

간격은 **기준서 문장으로 다시 센다.** 앱의 `markCardRun` 을 옮겨 적은 것이 아니라
8.4 의 세 문장(오른다, 내린다, 일찍 돈 것은 안 올린다)을 그대로 셈으로 쓴 것이다.
둘이 어긋나면 앱이 기준서와 다른 것이다.

개정 2026-10-08 (`docs/game_results.md`, 두 노트북 결과 계약) 다섯 판을 더 건다.

    자료 계약    schemaVersion 과 appHash(낡음)가 있고 roleRule 이 구조화돼 있고 roleVectors 288개와 같은가.
                 모양이 바뀌었는데 판 번호를 안 올리면 실패 (모양 지문 표)
    결과 모양    results_schema.json 의 줄 종류, 칸, 값이 docs/game_results.md 4장 5장 표와 같은가
    결과 고정본  고정 기록이 모양을 통과하고, 합치기와 틱이 고정된 답을 내고 (node 로 --selftest),
                 **앱 코드를 안 쓰는 파이썬 계산이** 기준서 8.4 문장으로 같은 덱을 다시 세는가
    지문 표      `--manifest` 일 때만. out/game/manifest.json 이 지금 파일과 같은가, dataHash 시험값이 맞는가.
                 **맨 뒤에서 돈다**: 다른 갈래의 파생물(scenes, town, judge ...)이 다 내려온 뒤라야 맞다

사용법:
    python3 scripts/check_game.py              # 지문 표만 빼고 다
    python3 scripts/check_game.py --manifest   # 지문 표만 (derive_game_manifest.py 다음에)
    python3 scripts/check_game.py --all        # 둘 다 (손으로 볼 때)

**덱이 담은 영어는 여기서 안 본다.** 판 자료에서 왔고 그 자료는
`check_play_ground.py` 가 이미 근거 게이트를 건다. 두 곳에서 보면 한쪽만 고치는 날이 온다.

**기계가 안 보는 것: 그 하루가 두 사람에게 사는 것처럼 느껴지는가.**

사용법:
    python3 scripts/check_game.py
"""
import datetime
import glob
import hashlib
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME = os.path.join(ROOT, "out", "game", "sessions.json")
DATA = os.path.join(ROOT, "out", "data")
DOC = os.path.join(ROOT, "docs", "game.md")
SPEC = os.path.join(ROOT, "docs", "spec.md")
TRANS = os.path.join(ROOT, "..", "media", "english", "transcripts")
GAMEDIR = os.path.join(ROOT, "out", "game")
RSCHEMA = os.path.join(GAMEDIR, "results_schema.json")
MANIFEST = os.path.join(GAMEDIR, "manifest.json")
RDOC = os.path.join(ROOT, "docs", "game_results.md")
FIXTURE = os.path.join(ROOT, "tools", "game", "results_fixture")
TICK = os.path.join(ROOT, "scripts", "game_tick.js")
PLAYS_JS = os.path.join(ROOT, "out", "app", "plays.js")
RECALL_JS = os.path.join(ROOT, "app", "play", "recall.js")
ENGLISH_HTML = os.path.join(ROOT, "..", "english.html")

# 자료 계약 판 번호마다 **모양 지문**. 칸 이름(sessions.json 맨 위와 세션 줄)과 결과 줄 모양(설명 글 빼고)이 바뀌면
# 지문이 바뀐다. 바뀌었는데 schemaVersion 을 안 올렸으면 실패다. 올렸으면 이 표에 새 판의 지문을 더한다.
# 값을 더하는 것이 곧 "게임(C++)이 새 판을 읽게 고쳤다" 는 확인이다 (docs/game_results.md 9장).
SHAPES = {1: "3dd2178bbff905e4cfc430a7e50b975ebe523c2f95a810fc4be9b06d286b89ac"}

FAIL = []
n = 0


def data(name):
    return json.load(open(os.path.join(DATA, name + ".json"), encoding="utf-8"))


def gap(what, have, want):
    """빠진 것을 실패로 낸다. **하나라도 빠지면 그 자료는 1년 동안 안 뜬다.**"""
    global n
    n += 1
    miss = sorted(set(want) - set(have), key=str)
    if miss:
        FAIL.append("%s %d개가 게임 1년에 안 들어갔다: %s" %
                    (what, len(miss), " ".join(str(x) for x in miss[:8])))
    return len(set(want) & set(have)), len(set(want))


def main():
    global n
    if "--manifest" in sys.argv:
        return manifest_main()
    if not os.path.exists(GAME):
        print("[실패] out/game/sessions.json 이 없다. node scripts/derive_game.js 를 돌린다")
        return 1
    G = json.load(open(GAME, encoding="utf-8"))
    S = G.get("sessions") or []

    # 1. 288세션. 하루도 안 빠진다
    n += 1
    if len(S) != 288 or [x["s"] for x in S] != list(range(1, 289)):
        FAIL.append("세션이 1부터 288까지 한 번씩이 아니다 (%d개)" % len(S))

    # 2. 자료가 다 들어갔는가
    rows = []
    rows.append(("강", gap("강", [x["lecture"] for x in S],
                           [l["no"] for l in data("lectures")["items"]])))
    sets = [x["set"] for x in S]
    rows.append(("세트", gap("세트", sets, [s["id"] for s in data("sets")["items"]])))
    n += 1
    if len(sets) != len(set(sets)):
        FAIL.append("세트가 두 번 나오는 날이 있다. 세트는 하루 하나다")
    rows.append(("카드", gap("카드", [c for x in S for c in x["cards"]],
                             [c["id"] for c in data("cards")["items"]])))
    media = [os.path.basename(f)[:-3] for f in glob.glob(os.path.join(TRANS, "lle1-*.md"))]
    n += 1
    if len(media) < 52:
        FAIL.append("대본을 %d과만 찾았다. 52과여야 한다" % len(media))
    rows.append(("실제 녹음", gap("실제 녹음", [x["media"] for x in S], media)))
    rows.append(("비상판", gap("비상판", [x["emergency"] for x in S if x["emergency"]],
                               [e["no"] for e in data("emergency")["items"]])))
    rows.append(("주", gap("주", [x["week"] for x in S], range(1, 49))))
    rows.append(("과제집", gap("과제집 주", [x["week"] for x in S],
                               [t["week"] for t in data("tasks")["items"]])))
    rows.append(("강의록", gap("강의록", [x["lecture"] for x in S],
                               [h["lecture"] for h in data("handouts")["items"]])))

    # 3. 하루의 꼴. 블록 넷이 120분이다
    n += 1
    blocks = G.get("blocks") or []
    if [b.get("no") for b in blocks] != [1, 2, 3, 4] or sum(b.get("minutes", 0) for b in blocks) != 120:
        FAIL.append("블록 넷이 120분이 아니다: %s" %
                    " ".join("%s:%s" % (b.get("no"), b.get("minutes")) for b in blocks))

    src = open(DOC, encoding="utf-8").read()

    # 3b. **블록 넷 다 같이 하고 같이 말한다** (개정문 20번). 대화 금지 블록이 남으면 실패다
    n += 1
    quiet = [str(b.get("no")) for b in blocks if not (b.get("talk") and b.get("together"))]
    if quiet:
        FAIL.append("같이 말하지 않는 블록이 있다: %s. 하루 내내 붙어서 같이 한다" % " ".join(quiet))

    # 4. 무대가 문서 표와 같은가. **문서가 원본이다**
    table = {}
    for m in re.finditer(r"^\| (Q\d) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \| "
                         r"([^|]+?) \|\s*$", src, re.M):
        table[m.group(1)] = [m.group(i).strip() for i in range(2, 7)]
    n += 1
    if sorted(table) != ["Q1", "Q2", "Q3", "Q4"]:
        FAIL.append("docs/game.md 4장 무대 표에서 분기 넷을 못 읽었다")
    bad = []
    for x in S:
        t = table.get(x["quarter"])
        p = x.get("places") or {}
        got = [x.get("stage"), p.get("1"), p.get("2"), p.get("3"), p.get("4")]
        if t != got:
            bad.append(x["s"])
    n += 1
    if bad:
        FAIL.append("무대가 문서 표와 다른 세션이 %d개다 (%s). derive_game.js 를 다시 돌린다"
                    % (len(bad), " ".join(map(str, bad[:5]))))

    # 5. **두 사람이 늘 같이 있는가** (2026-10-07 결정).
    #    처음에는 블록 1 에서 둘을 다른 곳에 두고 그것을 이 판이 지켰다.
    #    기준서 2.3 이 블록 1 을 "같은 공간, 각자 헤드폰" 으로 적어 둔 것을 안 읽은 것이었다.
    #    지금은 블록마다 장소가 하나여야 한다. 사람별 장소 칸이 생기면 실패다.
    n += 1
    split = [x["s"] for x in S if set((x.get("places") or {}).keys()) != {"1", "2", "3", "4"}]
    if split:
        FAIL.append("블록마다 장소가 하나가 아닌 세션이 %d개다 (%s). 두 사람은 늘 같이 있다"
                    % (len(split), " ".join(map(str, split[:5]))))

    # 5b. **가리기에 기대던 판이 다 새 꼴을 받았나** (1.3, 2026-10-07).
    #     두 사람 사이에 가린 것이 없어지면 가리기로 돌던 판은 그대로 못 돈다.
    #     `solo_plays.md` 3장이 "그대로" 라고 안 적은 판이 그 판들이다.
    #     하나라도 새 꼴 없이 남으면 게임에서 그 판은 돌 길이 없다.
    solo = open(os.path.join(ROOT, "docs", "solo_plays.md"), encoding="utf-8").read()
    hid = []
    # **3장 표만 읽는다.** 같은 꼴 표가 7장에도 있다 (종이로 도는가). 둘을 섞으면 안 된다
    head = re.search(r"^\| # \| 판 \| 갈래 \| 어떻게 \|", solo, re.M)
    t3 = solo[head.start():] if head else ""
    t3 = t3[:t3.find("\n\n")] if "\n\n" in t3 else t3
    for m in re.finditer(r"^\| (\d+) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|\s*$", t3, re.M):
        no, name, how = int(m.group(1)), m.group(2).strip(), m.group(3).strip()
        if no <= 19 and "그대로" not in how:
            hid.append(name)
    sec = src[src.find("### 1.3"):src.find("## 2.")] if "### 1.3" in src else ""
    done = [m.group(1).strip() for m in re.finditer(r"^\| ([^|]+?) \| [^|]+? \| [^|]+? \|\s*$", sec, re.M)]
    n += 2
    if len(hid) < 10:
        FAIL.append("solo_plays.md 3장에서 가리기 판을 %d개만 읽었다" % len(hid))
    left = [h for h in hid if h not in done]
    if left:
        FAIL.append("가리기에 기대던 판 %d개가 새 꼴을 못 받았다: %s. docs/game.md 1.3 에 적는다"
                    % (len(left), " ".join(left)))

    # 5c. **이야기가 48주를 빠짐없이 덮는가** (`docs/world.md` 5장).
    #     한 주가 한 화다. 빠진 주는 이야기 없이 공부만 하는 주가 된다.
    #     화가 놓인 분기가 그 주 과제집의 분기와 다르면 이야기가 강과 어긋난다.
    world = open(os.path.join(ROOT, "docs", "world.md"), encoding="utf-8").read()
    wq = {}
    for blk in re.finditer(r"^### 5\.\d (Q\d) .*?(?=^### |^## )", world, re.M | re.S):
        for m in re.finditer(r"^\| (\d+) \| [^|]+? \| [^|]+? \| [^|]+? \| [^|]+? \|\s*$",
                             blk.group(0), re.M):
            wq.setdefault(int(m.group(1)), []).append(blk.group(1))
    tq = {t["week"]: t["quarter"] for t in data("tasks")["items"]}
    n += 2
    left = [w for w in range(1, 49) if len(wq.get(w, [])) != 1]
    if left:
        FAIL.append("docs/world.md 5장에 화가 한 번씩이 아닌 주가 %d개다: %s"
                    % (len(left), " ".join(map(str, left[:8]))))
    off = [w for w in wq if tq.get(w) not in wq[w]]
    if off:
        FAIL.append("docs/world.md 5장 화의 분기가 과제집과 다른 주가 있다: %s"
                    % " ".join(map(str, sorted(off)[:8])))

    # 6. 판. 그날 고른 판이 있고 덱이 비지 않는다
    n += 2
    nopick = [x["s"] for x in S if not x.get("pick")]
    if nopick:
        FAIL.append("오늘의 한 판이 없는 세션이 %d개다" % len(nopick))
    empty = [x["s"] for x in S if not x.get("decks")]
    if empty:
        FAIL.append("판 덱이 하나도 없는 세션이 %d개다" % len(empty))

    spec = open(SPEC, encoding="utf-8").read()
    rows.append(("간격 복습", spaced(G, S, spec)))
    rows.append(("다시 말하기", retold(G, S, blocks, spec)))
    rows.append(("다지기 주", firmed(G, S, spec)))
    rows.append(("자료 계약", contract(G, S)))
    rows.append(("결과 모양", results_schema_gate(G)))
    rows.append(("결과 고정본", results_fixture(G)))
    if "--all" in sys.argv:
        rows.extend(manifest_gates())

    for f in FAIL:
        print("[실패] " + f)
    print("")
    for name, (got, want) in rows:
        print("  %-8s %4d / %d" % (name, got, want))
    print("")
    print("**기계가 안 보는 것: 그 하루가 두 사람에게 사는 것처럼 느껴지는가**")
    if "--all" not in sys.argv:
        print("(지문 표는 맨 뒤에서 python3 scripts/check_game.py --manifest 로 본다)")
    print("게임 1년 %d판 (세션 %d개, 자료 %d갈래) / 실패 %d" % (n, len(S), len(rows), len(FAIL)))
    return 1 if FAIL else 0


def day(x):
    return datetime.date.fromisoformat(x)


def spaced(G, S, spec):
    """7. 간격 복습 (기준서 8.4, 개정문 24). **기준서 문장으로 다시 센다.**

    다 맞혔다고 친 명목 일정이다. 세션마다 그날 제 날이 된 카드가 `review` 에
    빠짐없이, 더 없이 있어야 한다. 사흘 몰아치고 사라지던 600장이 여기서 잡힌다."""
    global n
    m = re.search(r"카드는 처음 나온 뒤 ((?:\d+일, )*\d+일) 간격으로 다시 나온다", spec)
    n += 1
    if not m:
        FAIL.append("기준서 8.4 에서 간격 사다리를 못 읽었다")
        return 0, 1
    lad = [int(x) for x in re.findall(r"(\d+)일", m.group(1))]
    sp = G.get("spacing") or {}
    n += 1
    if sp.get("ladder") != lad:
        FAIL.append("sessions.json 의 간격 사다리 %s 가 기준서 8.4 의 %s 와 다르다"
                    % (sp.get("ladder"), lad))
    n += 1
    nodate = [x["s"] for x in S if "review" not in x or not x.get("date")]
    if nodate:
        FAIL.append("간격 복습 덱이나 날짜가 없는 세션이 %d개다 (%s)"
                    % (len(nodate), " ".join(map(str, nodate[:5]))))
        return 0, len(S)
    n += 1
    ds = [day(x["date"]) for x in S]
    if any(b <= a for a, b in zip(ds, ds[1:])):
        FAIL.append("세션 날짜가 앞으로만 가지 않는다")
    # 기준서 8.4 를 셈으로. 오른다 / 일찍 돈 것은 안 올린다 / 맨 위를 돌면 끝난다
    st, bad, seen, first = {}, [], {}, {}
    for x, d in zip(S, ds):
        today = set(x["cards"])
        want = sorted(k for k, (b, due) in st.items() if due and due <= d and k not in today)
        if x["review"] != want and len(bad) < 3:
            extra = sorted(set(x["review"]) - set(want))
            lack = sorted(set(want) - set(x["review"]))
            bad.append("세션 %d 더 %s / 빠짐 %s" % (x["s"], " ".join(extra[:3]), " ".join(lack[:3])))
        for k in x["cards"] + x["review"]:
            seen[k] = seen.get(k, 0) + 1
            first.setdefault(k, x["s"])
            b, due = st.get(k, (0, None))
            if b > 0 and due and due > d:
                continue
            st[k] = (b, None) if b >= len(lad) else (b + 1, d + datetime.timedelta(days=lad[b]))
    n += 1
    if bad:
        FAIL.append("간격 복습 덱이 기준서 8.4 사다리와 다르다: " + " / ".join(bad))
    # 1년에 다섯 번. **못 채우는 카드는 숨기지 않고 적는다.** 마지막 두 주에 처음 나온 것만 된다
    low = sorted(k for k, v in seen.items() if v < (sp.get("minAppear") or 5))
    n += 2
    if (sp.get("minAppear") or 0) < 5:
        FAIL.append("sessions.json 이 카드마다 1년에 다섯 번을 안 건다 (minAppear %s)" % sp.get("minAppear"))
    if sorted(G.get("carry") or []) != low:
        FAIL.append("다섯 번이 안 되는 카드 %d장과 carry %d장이 다르다"
                    % (len(low), len(G.get("carry") or [])))
    late = len(S) - 12
    early = [k for k in low if first[k] <= late]
    n += 1
    if early:
        FAIL.append("마지막 두 주 전에 처음 나왔는데 1년에 다섯 번이 안 되는 카드가 %d장이다: %s"
                    % (len(early), " ".join(early[:6])))
    return len(seen) - len(low), len(seen)


def retold(G, S, blocks, spec):
    """8. 블록 4 다시 말하기 (기준서 2.3, 개정문 25). **두 사람 다 말한다.**"""
    global n
    rm = re.search(r"한 사람이 (\d+)분, (\d+)분, (\d+)분 세 번 말한다", spec)
    qm = re.search(r"Q1 은 (\d+)초, (\d+)초, (\d+)초다", spec)
    n += 1
    if not rm or not qm:
        FAIL.append("기준서 2.3 에서 블록 4 다시 말하기 초를 못 읽었다")
        return 0, len(S)
    q1 = [int(qm.group(i)) for i in (1, 2, 3)]
    rest = [int(rm.group(i)) * 60 for i in (1, 2, 3)]
    b4 = [b for b in blocks if b.get("no") == 4]
    cap = (b4[0].get("minutes", 0) * 60) if b4 else 0
    n += 1
    if not b4 or not b4[0].get("retell"):
        FAIL.append("블록 4 에 다시 말하기 표시가 없다")
    bad = []
    for x in S:
        r = x.get("retell") or {}
        want = q1 if x["quarter"] == "Q1" else rest
        ok = (r.get("secs") == want and r.get("each") is True and r.get("together") is True
              and r.get("story") == x["week"] and r.get("total") == 2 * sum(want)
              and r.get("total", 0) <= cap)
        if not ok:
            bad.append(x["s"])
    n += 1
    if bad:
        FAIL.append("다시 말하기가 기준서 2.3 과 다른 세션이 %d개다 (%s). 두 사람 몫이 20분 안에 다 있어야 한다"
                    % (len(bad), " ".join(map(str, bad[:5]))))
    return len(S) - len(bad), len(S)


def firmed(G, S, spec):
    """9. 다지기 주와 짧은 날 (기준서 2.5, 7.1, 개정문 26). **시간 셈이 576 그대로인가.**"""
    global n
    cm = re.search(r"다지기 주는 ([\d, ]+)주다", spec)
    n += 1
    if not cm:
        FAIL.append("기준서 2.5 에서 다지기 주를 못 읽었다")
        return 0, 1
    weeks = [int(w) for w in re.findall(r"\d+", cm.group(1))]
    n += 1
    if (G.get("consolidation") or {}).get("weeks") != weeks:
        FAIL.append("sessions.json 다지기 주가 기준서 2.5 의 %s 와 다르다" % weeks)
    flag = sorted({x["week"] for x in S if x.get("consolidate")})
    n += 1
    if flag != sorted(weeks):
        FAIL.append("다지기 표시가 붙은 주 %s 가 기준서 2.5 의 %s 와 다르다" % (flag, weeks))
    # 새 강과 새 카드가 없다. 다시 짜는 강은 이미 연 강이다
    opened, met, bad = set(), set(), []
    for x in S:
        if x.get("consolidate"):
            if x.get("lecture") is not None:
                bad.append("세션 %d 에 새 강 %s 가 있다" % (x["s"], x["lecture"]))
            rv = x.get("revisit") or []
            if len(rv) != 2 or not set(rv) <= opened:
                bad.append("세션 %d 가 다시 짜는 강 %s 가 아직 안 연 강이다" % (x["s"], rv))
            new = [c for c in x["cards"] if c not in met]
            if new:
                bad.append("세션 %d 에 처음 나오는 카드가 %d장이다" % (x["s"], len(new)))
        elif x.get("lecture") is None:
            bad.append("다지기 주가 아닌 세션 %d 에 강이 없다" % x["s"])
        else:
            opened.add(x["lecture"])
        met.update(x["cards"])
    n += 1
    if bad:
        FAIL.append("다지기 주가 기준서 2.5 와 다르다: " + " / ".join(bad[:3]))
    # 세트는 제 강이 열린 뒤에 돈다. 강을 당기면 세트가 강보다 앞서는 날이 생길 수 있다
    lec_of = {t["id"]: t["lecture"] for t in data("sets")["items"]}
    opened, ahead = set(), []
    for x in S:
        if x.get("lecture") is not None:
            opened.add(x["lecture"])
        if lec_of.get(x["set"]) not in opened:
            ahead.append(x["s"])
    n += 1
    if ahead:
        FAIL.append("제 강보다 먼저 도는 세트가 %d개다 (%s)" % (len(ahead), " ".join(map(str, ahead[:5]))))
    # 7.1 주마다 강 수. 다지기 주 0, 그 앞 두 주 3, 나머지 2
    per = {}
    for x in S:
        if x.get("lecture") is not None:
            per.setdefault(x["week"], set()).add(x["lecture"])
    three = {w - k for w in weeks for k in (1, 2)}
    odd = [w for w in range(1, 49)
           if len(per.get(w, ())) != (0 if w in weeks else 3 if w in three else 2)]
    n += 1
    if odd:
        FAIL.append("주마다 강 수가 기준서 7.1 과 다른 주가 있다: %s" % " ".join(map(str, odd[:8])))
    # 시간 셈. 세션 288 x 블록 120분 = 576시간이 기준서 1장 값과 같아야 한다
    tm = re.search(r"총 (\d+)시간", spec)
    mins = sum(b.get("minutes", 0) for b in (G.get("blocks") or []))
    hours = len(S) * mins / 60
    n += 1
    if not tm or hours != int(tm.group(1)):
        FAIL.append("세션 %d개 x %d분 = %g시간이 기준서 1장 총 시간 %s 와 다르다"
                    % (len(S), mins, hours, tm.group(1) if tm else "?"))
    # 짧은 날. 45분, 세션이 아니다
    sd = G.get("shortDay") or {}
    sm = re.search(r"짧은 날은 (\d+)분이다", spec)
    parts = sum(p.get("minutes", 0) for p in sd.get("parts") or [])
    n += 1
    if not sm or sd.get("minutes") != int(sm.group(1)) or parts != sd.get("minutes") \
            or sd.get("session") is not False or not sd.get("together"):
        FAIL.append("짧은 날이 기준서 2.5 와 다르다: %s" % json.dumps(sd, ensure_ascii=False)[:120])
    return len(S) - len(bad), len(S)


# ---------------------------------------------------------------------------------------------
# 개정 2026-10-08. 두 노트북 결과 계약 (docs/game_results.md)
# ---------------------------------------------------------------------------------------------

ENVELOPE = ["v", "t", "s", "e", "device", "seat", "date", "t0", "t1"]
BYOUTCOME = {"pass": "up", "near": "hold", "miss": "down", "skipped": "none"}


def sha256_hex(b):
    return hashlib.sha256(b).hexdigest()


def line_hash(entries):
    """docs/game_results.md 10.1 의 꼴. 이름 차례(ordinal)로 `이름:해시` 줄을 LF 로 잇고 끝에도 LF."""
    names = sorted(entries)
    text = "".join("%s:%s\n" % (k, entries[k]) for k in names)
    return sha256_hex(text.encode("utf-8"))


def app_hash_now():
    """derive_game.js 의 appHash 와 같은 셈. 파일 둘의 바이트."""
    ent = {}
    for name, path in (("english.html", ENGLISH_HTML), ("eng2p/out/app/plays.js", PLAYS_JS)):
        ent[name] = sha256_hex(open(path, "rb").read().replace(b"\r\n", b"\n"))     # CRLF 는 LF 로 센다
    return line_hash(ent)


def strip_desc(o):
    if isinstance(o, dict):
        return {k: strip_desc(v) for k, v in o.items() if k not in ("description", "generator", "x-rules", "title")}
    if isinstance(o, list):
        return [strip_desc(v) for v in o]
    return o


def shape_print(G, S, RS):
    """모양 지문: sessions.json 맨 위 칸 이름 + 세션 줄 칸 이름 + 결과 줄 모양(설명 글 빼고)."""
    body = {"top": sorted(G.keys()), "row": sorted(S[0].keys()) if S else [], "results": strip_desc(RS)}
    return sha256_hex(json.dumps(body, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode("utf-8"))


def load_json(path):
    return json.load(open(path, encoding="utf-8"))


def contract(G, S):
    """10. 자료 계약. 판 번호, 앱 지문, 모양 지문, 먼저 말을 여는 사람, 사다리와 어제 그거 규칙."""
    global n
    ok = 0
    total = 0

    def chk(cond, msg):
        nonlocal ok, total
        global n
        n += 1
        total += 1
        if cond:
            ok += 1
        else:
            FAIL.append(msg)

    keys = list(G.keys())
    chk(isinstance(G.get("schemaVersion"), int) and not isinstance(G.get("schemaVersion"), bool)
        and G.get("schemaVersion") >= 1, "sessions.json 에 schemaVersion(정수)이 없다")
    chk(keys[:2] == ["schemaVersion", "appHash"], "schemaVersion 과 appHash 가 sessions.json 맨 위가 아니다: %s" % keys[:3])
    chk(all(len(set(x.keys())) == len(S[0].keys()) and set(x.keys()) == set(S[0].keys()) for x in S) if S else False,
        "세션 줄마다 칸 이름이 다르다")

    # 앱 지문. 앱이 바뀌었는데 sessions.json 을 안 다시 뽑았으면 낡은 것이다
    ah = G.get("appHash")
    try:
        now = app_hash_now()
    except OSError as e:
        now = None
        FAIL.append("앱 파일을 못 읽었다: %s" % e)
    chk(isinstance(ah, str) and re.fullmatch(r"[0-9a-f]{64}", ah) is not None, "appHash 가 소문자 16진수 64자가 아니다")
    chk(now is not None and ah == now,
        "sessions.json 이 낡았다. 만든 앱 %s / 지금 앱 %s. node scripts/derive_game.js 를 돌린다"
        % (str(ah)[:12], (now or "?")[:12]))

    # 모양 지문. 칸 이름이 바뀌었는데 판 번호를 안 올리면 C++ 가 조용히 빈 값을 읽는다
    RS = load_json(RSCHEMA) if os.path.exists(RSCHEMA) else None
    if RS is None:
        FAIL.append("out/game/results_schema.json 이 없다. node scripts/derive_game.js 를 돌린다")
        total += 1
        n += 1
    else:
        sv = G.get("schemaVersion")
        chk(RS.get("version") == sv, "results_schema.json 의 version %s 이 schemaVersion %s 와 다르다" % (RS.get("version"), sv))
        fp = shape_print(G, S, RS)
        want = SHAPES.get(sv)
        if want is None:
            chk(False, "schemaVersion %s 의 모양 지문이 check_game.py SHAPES 에 없다. 새 판이면 지문 %s 를 더한다" % (sv, fp))
        else:
            chk(fp == want, "모양이 바뀌었는데 schemaVersion(%s)을 안 올렸다. 지문 %s 가 표의 %s 와 다르다. "
                "칸을 바꿨으면 schemaVersion 을 올리고 SHAPES 에 새 지문을 더한다" % (sv, fp[:12], want[:12]))

    # 먼저 말을 여는 사람. 규칙이 구조화돼 있고 앱이 낸 288개와 한 개도 안 다르다
    rr = G.get("roleRule")
    chk(isinstance(rr, dict) and rr.get("kind") == "session_parity" and rr.get("odd") in ("a", "b")
        and rr.get("even") in ("a", "b") and rr.get("odd") != rr.get("even")
        and isinstance(rr.get("text"), str) and rr.get("text"),
        "roleRule 이 기계가 읽는 꼴이 아니다: %s" % json.dumps(rr, ensure_ascii=False)[:100])
    rv = G.get("roleVectors") or []
    chk(len(rv) == 288 and [v.get("s") for v in rv] == list(range(1, 289)) and all(v.get("A") in ("a", "b") for v in rv),
        "roleVectors 가 1부터 288까지 세션 번호마다 a 나 b 가 아니다 (%d개)" % len(rv))
    if isinstance(rr, dict) and rv:
        bad = [v.get("s") for v in rv if (rr.get("odd") if v.get("s", 0) % 2 == 1 else rr.get("even")) != v.get("A")]
        chk(not bad, "roleRule 이 앱의 roleOf 로 낸 roleVectors 와 다르다: 세션 %s" % " ".join(map(str, bad[:6])))
        same = [rv[i]["s"] for i in range(1, len(rv)) if rv[i]["A"] == rv[i - 1]["A"]]
        chk(not same, "같은 자리가 연달아 A 인 세션이 있다 (개정문 11): %s" % " ".join(map(str, same[:6])))
    idx_rule = data("index").get("roleRule")
    chk(isinstance(rr, dict) and rr.get("text") == idx_rule, "roleRule.text 가 앱 차림표의 roleRule 글과 다르다: %s" % idx_rule)

    # 사다리가 결과를 어떻게 움직이나, 어제 그거를 어떻게 짜나
    sp = G.get("spacing") or {}
    chk(sp.get("byOutcome") == BYOUTCOME, "spacing.byOutcome 이 %s 가 아니다: %s" % (BYOUTCOME, sp.get("byOutcome")))
    rcl = open(RECALL_JS, encoding="utf-8").read()
    m_end = re.search(r"var d=\{end:(\d+)\}", rcl)
    m_days = re.search(r"days:\[([\d,]+)\]", rcl)
    rule = (G.get("runtime") or {}).get("recallRule") or {}
    chk(m_end is not None and m_days is not None and rule.get("max") == int(m_end.group(1))
        and rule.get("back") == [int(x) for x in m_days.group(1).split(",")],
        "runtime.recallRule 의 max/back 이 앱 recall.js 의 한 판 장수와 되돌아보기와 다르다: %s" % json.dumps(rule, ensure_ascii=False)[:100])
    chk(rule.get("outcomes") == ["miss"] and rule.get("unit") == "session",
        "runtime.recallRule 이 못 한(miss) 카드를 세션 수로 세는 꼴이 아니다")
    txt = (G.get("runtime") or {}).get("recall", "")
    chk("game_tick.js" in txt and "못 한" in txt and "막힌 카드에서 짠다" not in txt,
        "runtime.recall 설명이 틱이 하는 일과 안 맞는다: %s" % txt[:60])
    return ok, total


def doc_tables(path):
    """docs/game_results.md 를 제목마다 표 줄(셀 목록)로 나눈다. {제목: [[셀, ...], ...]}"""
    out, cur = {}, None
    for ln in open(path, encoding="utf-8").read().split("\n"):
        if ln.startswith("#"):
            cur = ln.lstrip("#").strip()
            out[cur] = []
        elif cur is not None and ln.startswith("|"):
            cells = [c.strip() for c in ln.strip().strip("|").split("|")]
            if all(re.fullmatch(r":?-+:?", c) for c in cells if c):
                continue
            out[cur].append(cells)
    return out


def ticks(cell):
    return re.findall(r"`([^`]+)`", cell)


def val_value(v, sch, name, errs):
    """results_schema.json 의 부분집합 검사기. 틱(JS)과 따로 쓴 두 번째 구현이다."""
    if "const" in sch and v != sch["const"]:
        errs.append("%s 은 %r 이어야 한다" % (name, sch["const"]))
        return
    t = sch.get("type")
    if t == "integer" and (not isinstance(v, int) or isinstance(v, bool)):
        errs.append("%s 이 정수가 아니다" % name)
        return
    if t == "string" and not isinstance(v, str):
        errs.append("%s 이 글자가 아니다" % name)
        return
    if t == "boolean" and not isinstance(v, bool):
        errs.append("%s 이 참거짓이 아니다" % name)
        return
    if "enum" in sch and v not in sch["enum"]:
        errs.append("%s 값 %r 이 목록 밖이다" % (name, v))
        return
    if isinstance(v, int) and not isinstance(v, bool):
        if "minimum" in sch and v < sch["minimum"]:
            errs.append("%s 이 너무 작다" % name)
        if "maximum" in sch and v > sch["maximum"]:
            errs.append("%s 이 너무 크다" % name)
    if isinstance(v, str):
        if "pattern" in sch and not re.search(sch["pattern"][:-1] + r"\Z" if sch["pattern"].endswith("$") else sch["pattern"], v):
            errs.append("%s 꼴이 틀렸다" % name)
        if "minLength" in sch and len(v) < sch["minLength"]:
            errs.append("%s 이 너무 짧다" % name)
        if "maxLength" in sch and len(v) > sch["maxLength"]:
            errs.append("%s 이 너무 길다" % name)


def val_event(o, RS):
    if not isinstance(o, dict):
        return "객체가 아니다"
    bad = [k for k in RS.get("x-forbiddenKeys", []) if k in o]
    if bad:
        return "금지 칸 " + " ".join(bad)
    d = RS["$defs"].get(o.get("t"))
    if d is None:
        return "모르는 줄 종류 %r" % o.get("t")
    errs = []
    errs += ["%s 이 없다" % k for k in d["required"] if k not in o]
    errs += ["모르는 칸 %s" % k for k in o if k not in d["properties"]]
    for k, sch in d["properties"].items():
        if k in o:
            val_value(o[k], sch, k, errs)
    if not errs:
        try:
            datetime.date.fromisoformat(o["date"])
        except ValueError:
            errs.append("date 가 달력에 없다")
        if o["t1"] < o["t0"]:
            errs.append("t1 이 t0 보다 앞이다")
        if (o["e"][0] == "h") != (o["device"] == "host"):
            errs.append("e 의 기기 글자와 device 가 다르다")
        if "outcome" in o and ((o["outcome"] == "skipped") != (o["attempts"] == 0)):
            errs.append("skipped 이면 attempts 는 0, 아니면 1 이상이다")
    return "; ".join(errs) if errs else None


def results_schema_gate(G):
    """11. 결과 모양 파일이 문서 4장 5장과 같은가."""
    global n
    ok = 0
    total = 0

    def chk(cond, msg):
        nonlocal ok, total
        global n
        n += 1
        total += 1
        if cond:
            ok += 1
        else:
            FAIL.append(msg)

    if not os.path.exists(RSCHEMA):
        FAIL.append("out/game/results_schema.json 이 없다. node scripts/derive_game.js 를 돌린다")
        n += 1
        return 0, 1
    RS = load_json(RSCHEMA)
    defs = RS.get("$defs") or {}
    chk(len(defs) == 11 and [r.get("$ref") for r in RS.get("oneOf", [])] == ["#/$defs/" + k for k in defs],
        "결과 모양의 oneOf 가 $defs 와 다르다 (줄 종류 %d가지)" % len(defs))
    chk(len(RS.get("x-forbiddenKeys") or []) >= 10, "금지 칸 목록(x-forbiddenKeys)이 없거나 짧다")
    for t, d in defs.items():
        props = d.get("properties", {})
        chk(d.get("additionalProperties") is False and sorted(d.get("required", [])) == sorted(props)
            and all(k in props for k in ENVELOPE) and (props.get("t") or {}).get("const") == t
            and (props.get("v") or {}).get("const") == RS.get("version")
            and not (set(RS.get("x-forbiddenKeys", [])) & set(props)),
            "결과 줄 %s 의 모양이 겉봉/필수/금지 규칙을 못 지킨다" % t)

    # 문서 표와 견준다
    T = doc_tables(RDOC)
    env_doc = {r[0].strip("`"): r for r in T.get("4.1 모든 줄에 있는 칸 (겉봉)", []) if r and r[0].startswith("`")}
    chk(sorted(env_doc) == sorted(ENVELOPE), "문서 4.1 겉봉 칸 %s 이 %s 와 다르다" % (sorted(env_doc), sorted(ENVELOPE)))
    seen_types = []
    for head, rows in T.items():
        m = re.match(r"4\.\d+ `([a-z_]+)`", head)
        if not m:
            continue
        t = m.group(1)
        seen_types.append(t)
        d = defs.get(t)
        if d is None:
            chk(False, "문서 4장에 있는 줄 종류 %s 가 결과 모양에 없다" % t)
            continue
        doc_fields = {r[0].strip("`"): r for r in rows if r and r[0].startswith("`")}
        have = set(doc_fields) | set(ENVELOPE)
        chk(have == set(d["properties"]), "문서 4장 %s 의 칸이 결과 모양과 다르다 (문서에만 %s / 모양에만 %s)"
            % (t, sorted(have - set(d["properties"])), sorted(set(d["properties"]) - have)))
        # 필수 칸 표시와 목록 값
        for f, r in doc_fields.items():
            sch = d["properties"].get(f)
            if sch is None or len(r) < 3:
                continue
            chk((r[2] == "예") == (f in d["required"]), "문서 4장 %s.%s 의 필수 표시가 결과 모양과 다르다" % (t, f))
            if "enum" in sch and sch.get("type") == "string":
                toks = ticks(r[1])
                if toks:
                    chk(sorted(toks) == sorted(sch["enum"]), "문서 4장 %s.%s 값 %s 이 결과 모양 %s 과 다르다"
                        % (t, f, toks, sch["enum"]))
    chk(sorted(seen_types) == sorted(defs), "문서 4장 줄 종류 %s 이 결과 모양 %s 과 다르다" % (sorted(seen_types), sorted(defs)))
    # 겉봉 값 목록
    for f in ("device", "seat"):
        r = env_doc.get(f)
        sch = (defs.get("card_run") or {}).get("properties", {}).get(f, {})
        chk(r is not None and sorted(ticks(r[1])) == sorted(sch.get("enum", [])),
            "문서 4.1 %s 값이 결과 모양과 다르다" % f)
    # 5.1 outcome 표
    oc = [r[0].strip("`") for r in T.get("5.1 `outcome`", []) if r and r[0].startswith("`")]
    first = [x for x in oc[:4]]
    chk(sorted(first) == sorted(((defs.get("card_run") or {}).get("properties", {}).get("outcome") or {}).get("enum", [])),
        "문서 5.1 outcome 값 %s 이 결과 모양과 다르다" % first)
    # 5.1 의 사다리 열이 spacing.byOutcome 과 같은가
    by = {}
    for r in T.get("5.1 `outcome`", []):
        if r and r[0].startswith("`") and len(r) >= 3:
            m = re.match(r"`(up|hold|down|none)`", r[2])
            if m:
                by[r[0].strip("`")] = m.group(1)
    chk(by == BYOUTCOME, "문서 5.1 표의 사다리 열 %s 이 spacing.byOutcome %s 과 다르다" % (by, BYOUTCOME))
    # 5.2 via
    vi = [r[0].strip("`") for r in T.get("5.2 `via`", []) if r and r[0].startswith("`")]
    chk(sorted(vi) == sorted(((defs.get("card_run") or {}).get("properties", {}).get("via") or {}).get("enum", [])),
        "문서 5.2 via 값 %s 이 결과 모양과 다르다" % vi)
    # 5.4 device
    dv = [r[0].strip("`") for r in T.get("5.4 `device`", []) if r and r[0].startswith("`")]
    chk(sorted(dv) == ["guest", "host"], "문서 5.4 device 값이 host guest 가 아니다: %s" % dv)
    return ok, total


def read_lines(path):
    out = []
    for i, ln in enumerate(open(path, encoding="utf-8").read().split("\n")):
        if ln.strip():
            out.append((i + 1, ln))
    return out


def py_merge(lines_by_file, RS):
    """파이썬 기준 합치기. docs/game_results.md 6장을 그대로 옮긴 두 번째 구현이다.
    돌려주는 것: (합친 줄 목록, 건수 {lines, rejected, duplicates, conflicts})."""
    groups = {}
    st = {"lines": 0, "rejected": 0, "duplicates": 0, "conflicts": 0}
    for lines in lines_by_file:
        for _, ln in lines:
            st["lines"] += 1
            try:
                o = json.loads(ln)
                why = val_event(o, RS)
            except ValueError:
                why = "json 아님"
            if why:
                st["rejected"] += 1
                continue
            c = json.dumps(o, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
            g = groups.setdefault((o["s"], o["e"]), {"n": 0, "forms": set(), "best": None})
            g["n"] += 1
            g["forms"].add(c)
            if g["best"] is None or c > g["best"][0]:
                g["best"] = (c, o)
    events = []
    for g in groups.values():
        st["duplicates"] += g["n"] - len(g["forms"])
        st["conflicts"] += len(g["forms"]) - 1
        events.append(g["best"][1])
    events.sort(key=lambda o: (o["t0"], o["t1"], o["s"], o["e"]))
    return events, st


def py_emit(events, RS):
    out = []
    for o in events:
        order = list(RS["$defs"][o["t"]]["properties"])
        out.append(json.dumps({k: o[k] for k in order}, ensure_ascii=False, separators=(",", ":")) + "\n")
    return "".join(out)


def results_fixture(G):
    """12. 결과 고정본. 모양, 합치기, 틱, 그리고 앱 코드를 안 쓰는 독립 계산."""
    global n
    ok = 0
    total = 0

    def chk(cond, msg):
        nonlocal ok, total
        global n
        n += 1
        total += 1
        if cond:
            ok += 1
        else:
            FAIL.append(msg)

    need = ["host.jsonl", "guest.jsonl", "expected_merged.jsonl", "expected_next.json", "state.json", "sessions.mini.json"]
    miss = [f for f in need if not os.path.exists(os.path.join(FIXTURE, f))]
    if miss or not os.path.exists(RSCHEMA):
        FAIL.append("결과 고정본이 빠졌다: %s" % " ".join(miss or ["results_schema.json"]))
        n += 1
        return 0, 1
    RS = load_json(RSCHEMA)
    host = read_lines(os.path.join(FIXTURE, "host.jsonl"))
    guest = read_lines(os.path.join(FIXTURE, "guest.jsonl"))
    merged_txt = open(os.path.join(FIXTURE, "expected_merged.jsonl"), encoding="utf-8").read()
    merged = read_lines(os.path.join(FIXTURE, "expected_merged.jsonl"))
    exp = load_json(os.path.join(FIXTURE, "expected_next.json"))
    state = load_json(os.path.join(FIXTURE, "state.json"))
    mini = load_json(os.path.join(FIXTURE, "sessions.mini.json"))

    # (1) 고정본의 모든 줄이 모양을 통과한다. 파이썬 검사기가 따로 건다
    bad = []
    for name, ls in (("host", host), ("guest", guest), ("merged", merged)):
        for i, ln in ls:
            try:
                why = val_event(json.loads(ln), RS)
            except ValueError:
                why = "json 아님"
            if why:
                bad.append("%s:%d %s" % (name, i, why))
    chk(not bad, "고정 기록 줄이 결과 모양을 못 지킨다 %d줄: %s" % (len(bad), " / ".join(bad[:2])))

    # (2) 파이썬 합치기가 고정된 합친 글과 바이트까지 같다 (C++ 가 맞춰야 하는 것)
    evs, st = py_merge([host, guest], RS)
    chk(py_emit(evs, RS) == merged_txt, "파이썬 합치기가 expected_merged.jsonl 과 바이트까지 같지 않다 (JS 구현과 어긋났다)")
    e2, _ = py_merge([guest, host, host, guest], RS)
    chk(py_emit(e2, RS) == merged_txt, "합치기가 순서나 중복에 흔들린다 (파이썬 기준 구현)")
    chk(exp["merge"] == {"lines": st["lines"], "events": len(evs), "duplicates": st["duplicates"],
                         "conflicts": st["conflicts"], "rejected": st["rejected"]},
        "expected_next.json 의 merge 건수 %s 가 파이썬이 센 것 %s 과 다르다" % (exp["merge"], st))

    # (3) 틱 시험을 돌린다 (node)
    try:
        r = subprocess.run(["node", TICK, "--selftest"], capture_output=True, text=True, timeout=300)
        tail = (r.stdout.strip().split("\n") or [""])[-1]
        failed = [ln for ln in r.stdout.split("\n") if ln.startswith("[실패]")]
        chk(r.returncode == 0 and "실패 0" in tail,
            "틱 시험이 실패했다 (코드 %d): %s %s" % (r.returncode, " / ".join(failed[:3]), (r.stderr or "")[:200]))
    except FileNotFoundError:
        chk(False, "node 가 없어서 틱 시험을 못 돌렸다. 건너뛴 것은 통과가 아니다")
    except subprocess.TimeoutExpired:
        chk(False, "틱 시험이 300초 안에 안 끝났다")

    # (4) 독립 계산. 앱 코드를 안 쓰고 기준서 8.4 문장과 결과 줄만으로 다시 센다
    ladder = [int(x) for x in re.findall(r"(\d+)일", re.search(
        r"카드는 처음 나온 뒤 ((?:\d+일, )*\d+일) 간격으로 다시 나온다", open(SPEC, encoding="utf-8").read()).group(1))]
    D = datetime.date.fromisoformat
    st_side = {"a": {}, "b": {}}

    def step(side, cid, date, out):
        b, due = st_side[side].get(cid, (0, None))
        d = D(date)
        if out == "skipped":
            return
        if out == "miss":
            nb = max(1, b - 1)
            st_side[side][cid] = (nb, d + datetime.timedelta(days=ladder[nb - 1]))
            return
        if b > 0 and due and due > d:
            return                                    # 제 날 전에 돈 것은 칸을 안 올린다
        if b >= len(ladder):
            st_side[side][cid] = (b, None)
        elif out == "pass":
            st_side[side][cid] = (b + 1, d + datetime.timedelta(days=ladder[b]))
        else:                                         # near: 칸을 그대로 둔다
            nb = max(b, 1)
            st_side[side][cid] = (nb, d + datetime.timedelta(days=ladder[nb - 1]))

    miss_by, date_of, done = {}, {}, set()
    for o in evs:
        if o["t"] == "card_run":
            for side in (["a", "b"] if o["seat"] == "team" else [o["seat"]]):
                step(side, o["id"], o["date"], o["outcome"])
            if o["outcome"] == "miss":
                miss_by.setdefault(o["s"], set()).add(o["id"])
        date_of[o["s"]] = max(date_of.get(o["s"], ""), o["date"])
        if o["t"] == "session_end" and o["device"] == "host" and o["ended"] == "done" and o["mode"] == "normal":
            done.add(o["s"])
    for o in evs:                                      # 끝난 세션의 날은 그 줄의 날이다
        if o["t"] == "session_end" and o["device"] == "host" and o["ended"] == "done" and o["mode"] == "normal":
            date_of[o["s"]] = o["date"]
    through = max(done) if done else 0
    s = max(state.get("nextSession") or 1, through + 1)
    rows = mini["sessions"]
    own = set(rows[s - 1]["cards"]) if s <= len(rows) else set()
    today = D(exp["today"])
    review = sorted({k for side in st_side for k, (b, due) in st_side[side].items()
                     if due and due <= today and k not in own})
    known = {k for side in st_side for k in st_side[side]}
    unseen = sorted({c for x in rows[:through] for c in x["cards"] if c not in known and c not in own})
    rr = G.get("roleRule") or {}
    seat_a = rr.get("odd") if s % 2 == 1 else rr.get("even")
    gaps = [k for k in range(1, through + 1) if k not in done]
    chk(exp["s"] == s and exp["through"] == through and exp["gaps"] == gaps and exp["seatA"] == seat_a,
        "독립 계산이 세션 %s/%s 끝남 %s/%s 빈 번호 %s/%s 자리 %s/%s 로 expected_next.json 과 다르다"
        % (s, exp["s"], through, exp["through"], gaps, exp["gaps"], seat_a, exp["seatA"]))
    chk(exp["review"] == review, "독립 계산의 review %s 가 expected_next.json 의 %s 와 다르다" % (review, exp["review"]))
    chk(exp["unseen"] == unseen, "독립 계산의 unseen %s 가 expected_next.json 의 %s 와 다르다" % (unseen, exp["unseen"]))
    # 어제 그거: 앱의 섞는 차례는 따라가지 않고 **누가 들어가는가**만 센다
    rule = (G.get("runtime") or {}).get("recallRule") or {}
    pool = {}
    for nback in rule.get("back", []):
        if s - nback >= 1:
            for cid in miss_by.get(s - nback, ()):
                pool[cid] = (nback, s - nback, date_of.get(s - nback))
    got = exp.get("recall") or []
    is_recall = rows[s - 1]["pick"] == "recall" if s <= len(rows) else False
    want_n = min(rule.get("max", 0), len(pool)) if is_recall else 0
    ok_recall = (len(got) == want_n and len({x["id"] for x in got}) == len(got)
                 and all(x["id"] in pool and (x["n"], x["s"], x["d"]) == pool[x["id"]] for x in got))
    chk(ok_recall, "독립 계산의 어제 그거 %d장과 expected_next.json 의 %d장이 다르다 (못 한 카드 %s)"
        % (want_n, len(got), sorted(pool)))
    chk(exp["pick"] == (rows[s - 1]["pick"] if s <= len(rows) else None) and exp["v"] == G.get("schemaVersion"),
        "expected_next.json 의 pick/v 가 세션표와 다르다")
    return ok, total


def manifest_gates():
    """13. 지문 표. 맨 뒤에서 돈다."""
    global n
    ok = 0
    total = 0

    def chk(cond, msg):
        nonlocal ok, total
        global n
        n += 1
        total += 1
        if cond:
            ok += 1
        else:
            FAIL.append(msg)

    if not os.path.exists(MANIFEST):
        FAIL.append("out/game/manifest.json 이 없다. python3 scripts/derive_game_manifest.py 를 돌린다")
        n += 1
        return [("지문 표", (0, 1))]
    M = load_json(MANIFEST)
    sys.path.insert(0, os.path.join(ROOT, "scripts"))
    import derive_game_manifest as dgm

    # 시험값: 파일 셋에 같은 글이 있다 (기준 구현, 이 검사의 글자, manifest 에 박힌 것)
    literal = {
        "lines": ["B.json:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
                  "a.json:e346432021b04179518d9614f3560ccd71354a4ee101ddcb893d6959a9d6301c"],
        "dataHash": "bc65574e3451669e9be07235ba8ae7bac0f2abcbfce1f9232565f544133bf515",
    }
    chk(dgm.selftest() is None, "derive_game_manifest.py 의 기준 구현이 자기 시험값을 못 낸다: %s" % dgm.selftest())
    chk(M.get("testVector", {}).get("lines") == literal["lines"] and M["testVector"].get("dataHash") == literal["dataHash"],
        "manifest.json 의 testVector 가 검사에 박힌 시험값과 다르다")
    inline = {"a.json": b'{"a":1}\n', "B.json": b"[]"}
    chk(line_hash({k: sha256_hex(v) for k, v in inline.items()}) == literal["dataHash"],
        "검사의 독립 구현이 시험값 dataHash 를 못 낸다")

    # 파일 묶음: 이름, 크기, 해시, 출처
    files, src = {}, {}
    for f in sorted(glob.glob(os.path.join(GAMEDIR, "*.json"))):
        nm = os.path.basename(f)
        if nm == "manifest.json" or nm.endswith(".local.json"):
            continue
        files[nm] = open(f, "rb").read()
        src[nm] = "out/game/" + nm
    cp = os.path.join(DATA, "cards.json")
    if os.path.exists(cp):
        files["cards.json"] = open(cp, "rb").read()
        src["cards.json"] = "out/data/cards.json"
    rows = {r["file"]: r for r in M.get("files", [])}
    chk(sorted(rows) == sorted(files), "manifest.json 의 파일 목록이 지금 파일과 다르다 (표에만 %s / 지금만 %s)"
        % (sorted(set(rows) - set(files)), sorted(set(files) - set(rows))))
    bad = [nm for nm, r in rows.items() if nm in files and (r.get("bytes") != len(files[nm])
           or r.get("sha256") != sha256_hex(files[nm]) or r.get("from") != src.get(nm))]
    chk(not bad, "manifest.json 의 크기나 해시가 지금 파일과 다르다: %s. python3 scripts/derive_game_manifest.py 를 돌린다" % " ".join(bad[:6]))
    chk(M.get("count") == len(files), "manifest.json count %s 가 파일 수 %d 와 다르다" % (M.get("count"), len(files)))
    # 지문: 독립 구현으로 다시 센다
    want = line_hash({nm: sha256_hex(b) for nm, b in files.items()})
    chk(M.get("dataHash") == want, "manifest.json dataHash %s 가 지금 파일로 센 %s 와 다르다" % (M.get("dataHash"), want))
    # 아직 안 내려온 파일을 거짓말로 적지 않는다
    pend = [nm for nm in dgm.LATER if nm not in files]
    chk(M.get("pending") == pend, "manifest.json pending %s 이 실제로 없는 파일 %s 과 다르다" % (M.get("pending"), pend))
    miss_req = [nm for nm in dgm.REQUIRED if nm not in files]
    chk(not miss_req, "꼭 있어야 하는 파일이 없다: %s" % " ".join(miss_req))
    if pend:
        print("[알림] 아직 안 내려온 파일 %d개: %s. 지문은 있는 파일로만 센 값이다" % (len(pend), " ".join(pend)))
    return [("지문 표", (ok, total))]


def manifest_main():
    rows = manifest_gates()
    for f in FAIL:
        print("[실패] " + f)
    print("")
    for name, (got, want) in rows:
        print("  %-8s %4d / %d" % (name, got, want))
    print("")
    print("게임 지문 표 %d판 / 실패 %d" % (n, len(FAIL)))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
