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

**덱이 담은 영어는 여기서 안 본다.** 판 자료에서 왔고 그 자료는
`check_play_ground.py` 가 이미 근거 게이트를 건다. 두 곳에서 보면 한쪽만 고치는 날이 온다.

**기계가 안 보는 것: 그 하루가 두 사람에게 사는 것처럼 느껴지는가.**

사용법:
    python3 scripts/check_game.py
"""
import datetime
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME = os.path.join(ROOT, "out", "game", "sessions.json")
DATA = os.path.join(ROOT, "out", "data")
DOC = os.path.join(ROOT, "docs", "game.md")
SPEC = os.path.join(ROOT, "docs", "spec.md")
TRANS = os.path.join(ROOT, "..", "media", "english", "transcripts")

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

    for f in FAIL:
        print("[실패] " + f)
    print("")
    for name, (got, want) in rows:
        print("  %-8s %4d / %d" % (name, got, want))
    print("")
    print("**기계가 안 보는 것: 그 하루가 두 사람에게 사는 것처럼 느껴지는가**")
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


if __name__ == "__main__":
    sys.exit(main())
