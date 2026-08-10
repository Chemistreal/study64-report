#!/usr/bin/env python3
"""오늘의 한 판이 **그날 어느 판을 여는가**를 288일치로 뽑는다. T315

규칙서 12.2 가 이렇게 적었다.

    도는 차례  앱이 열아홉 중 하나를 고른다. 그 판을 그대로 한 판 돈다
    시작 조건  그날 세션을 마쳤다. **하루에 한 번만 열린다**

## 고르는 것을 앱이 그 자리에서 하면 안 된다

`round.md` 6장이 막았다.

    시계에서 아무것도 안 낸다. `Date.now()` 도 무작위도 안 쓴다.

두 기기가 다른 판을 열면 이 판은 아예 안 돈다. 열아홉 판이 다 둘이 하는 판이다.
그래서 **미리 뽑아 표로 만든다.** 끼어들기 신호와 같은 길이다 (T300).

## 그날 안 열리는 판을 고르면 그날이 빈다

3초 벽은 첫 다섯 강에 안 연다 (T283). 거꾸로 판정은 Q1 내내 안 연다 (T306).
한 사람만 본다는 상황 카드가 없는 강이 있다 (T288).

**오늘의 한 판은 다시 못 연다.** 안 열리는 판이 뽑히면 그날 하나가 통째로 빈다.
그래서 **그날 열리는 판 중에서만 고른다.**

## 거를 수 있는 것과 못 거르는 것

거의 다 거를 수 있다. 강 번호와 분기와 그날 과가 정하기 때문이다.
**하나만 못 거른다.** 어제 그거다 (T313).

그 판은 `S.cardDue` 를 쓰고 그것은 **기기마다 따로다.** 파생물이 알 수 없다.
게다가 한 기기만 안 열릴 수도 있다.

빼지 않는다. 규칙서가 "앞의 열아홉 중 하나" 라고 적었고 빼면 그 판만 영영 안 나온다.
뽑히면 그 판이 제 시작 조건을 스스로 말한다. **자리가 판의 조건을 대신 판정하지 않는다.**
이 파일이 그 하나를 `unknown` 에 적어 둔다. **모르는 것을 안다고 적지 않는다.**

## 고르는 법에도 무작위가 없다

같은 판이 이틀 잇달아 나오면 안 되고 어느 판은 많이 어느 판은 적게 나와도 안 된다.
무작위로 뽑으면 둘 다 일어난다. 288일에 열아홉이면 판마다 열다섯 번쯤이다.

그래서 **제일 적게 나온 판을 든다.** 같으면 오래 안 나온 판, 그래도 같으면 이름 차례다.
어제 나온 판은 뺀다. 무작위가 아니라 셈이라 **다시 뽑아도 같은 표다.**

쓰는 법:
    python3 scripts/derive_onepick.py

결과: out/data/onepick.json 과 onepick.js
규격: docs/play_rules.md 12.2, docs/round.md 6장
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "out", "data")

QORDER = ["Q1", "Q2", "Q3", "Q4"]

# 판 열아홉. **이름과 차례는 `app/js/25_play.js` 의 `PLAYS` 와 같아야 한다.**
# 스무째(오늘의 한 판)는 자기를 못 고른다. 그래서 여기 없다.
PLAYS = ["mirror", "swapline", "hearme", "relay", "chain", "twohalf",
         "overlap", "ladder", "wall", "rebound", "onesee", "wave",
         "whose", "reask", "cutin", "clash", "flip", "apart", "recall"]

# 파생물이 못 거르는 판. **기기 기록을 쓴다.**
UNKNOWN = ["recall"]

# 스무째 판. 자기를 못 고른다
SELF = "oneday"

APPJS = os.path.join(ROOT, "app", "js", "25_play.js")


def appPlays():
    """앱이 아는 판 이름을 읽어 온다. **여기 적은 열아홉과 같아야 한다.**

    안 대 보면 판을 하나 더 붙였을 때 이 표가 조용히 낡는다.
    새 판이 오늘의 한 판에 영영 안 나오고 **아무도 그것을 모른다.**
    """
    if not os.path.exists(APPJS):
        return None, ["%s 가 없다" % APPJS]
    got = re.findall(r'\{id:"([a-z0-9]+)"', io.open(APPJS, encoding="utf-8").read())
    got = [g for g in got if g != SELF]
    if got != PLAYS:
        return None, ["앱이 아는 판과 이 파일이 아는 판이 다르다. "
                      "앱 %d개 이 파일 %d개. 다른 것: %s"
                      % (len(got), len(PLAYS),
                         " ".join(sorted(set(got) ^ set(PLAYS))) or "차례")]
    return got, []


def load(name):
    p = os.path.join(OUT, name + ".json")
    if not os.path.exists(p):
        return None
    return json.load(io.open(p, encoding="utf-8"))


def upto(cards, q, to):
    """그날 강까지 나온 카드. **안 배운 카드를 앞당겨 쓰지 않는다.**"""
    n = 0
    for c in cards:
        if QORDER.index(c["q"]) < QORDER.index(q) or (c["q"] == q and c["no"] <= to):
            n += 1
    return n


def build(D):
    """판마다 그날 열리는가를 재는 함수를 만든다.

    **저마다 근거가 다르다.** 어느 판은 그날 과의 자료를 쓰고 어느 판은
    그날까지 나온 카드를 쓴다. 한 규칙으로 묶으면 틀린 판이 생긴다.
    """
    mid_of = {}
    for g in (D["pairs"].get("groups") or []):
        for pr in g.get("pairs", []):
            for m in pr.get("at", []):
                mid_of[m] = mid_of.get(m, 0) + 1

    def have(name, mid):
        it = (D[name] or {}).get("items") or {}
        return len(it.get(mid) or [])

    wallShort = set(x["lecture"] for x in (D["wall"].get("short") or []))
    situShort = set(x["lecture"] for x in (D["situ"].get("short") or []))
    flipShort = set(x["lecture"] for x in (D["flip"].get("short") or []))
    apartNo = set(x["no"] for x in (D["apart"].get("items") or []))
    flipFrom = QORDER.index(D["flip"].get("from") or "Q2")

    def f(pid, c):
        mid, lec, q, to = c["mid"], c["lec"], c["q"], c["to"]
        if pid == "mirror":
            return mid_of.get(mid, 0) > 0
        if pid == "swapline":
            return have("swaps", mid) > 0
        if pid == "hearme":
            return have("listen", mid) > 0
        if pid in ("relay", "ladder", "wave"):
            # 셋 다 전달 놀이의 줄을 쓴다. 사다리와 파장이 그 줄 위에서 돈다
            return have("relay", mid) > 0
        if pid in ("chain", "overlap", "rebound"):
            # 셋 다 청크를 쓴다
            return have("chunks", mid) > 0
        if pid == "twohalf":
            return have("halves", mid) > 0
        if pid == "clash":
            return have("clash", mid) > 0
        if pid == "wall":
            return lec not in wallShort
        if pid == "onesee":
            return lec not in situShort
        if pid == "whose":
            return upto(D["whose"].get("sets") or [], q, to) >= (D["whose"].get("rounds") or 5)
        if pid == "flip":
            return QORDER.index(q) >= flipFrom and lec not in flipShort
        if pid == "apart":
            return lec in apartNo
        if pid in ("reask", "cutin"):
            # 대본과 규격만 쓴다. 과를 안 가린다
            return True
        if pid == "recall":
            # **기기 기록이라 못 안다.** 위 머리글을 본다
            return True
        raise SystemExit("[실패] 열리는 조건을 안 적은 판이 있다: " + pid)
    return f


def main():
    need = ["index", "pairs", "swaps", "listen", "relay", "chunks", "halves",
            "wall", "situ", "whose", "clash", "flip", "apart"]
    D, bad = {}, []
    _, abad = appPlays()
    bad += abad
    for n in need:
        D[n] = load(n)
        if D[n] is None:
            bad.append("out/data/%s.json 이 없다" % n)
    if bad:
        for b in bad:
            print("[실패] " + b)
        return 1

    # 288일. **주와 날이 원본이고 강은 그 날이 가리키는 것이다.**
    lec = {}
    for w in D["index"]["weeks"]:
        for L in w.get("lectures", []):
            lec[L["no"]] = {"q": w["quarter"], "mid": L.get("media"),
                            "to": (L.get("cards") or {}).get("to") or 0}
    days = []
    for w in D["index"]["weeks"]:
        for dd in w.get("days", []):
            L = lec.get(dd["lecture"])
            if not L:
                print("[실패] %d주 %d일이 가리키는 %d강이 없다"
                      % (w["week"], dd["day"], dd["lecture"]))
                return 1
            days.append({"w": w["week"], "d": dd["day"], "lec": dd["lecture"],
                         "q": L["q"], "mid": L["mid"], "to": L["to"]})

    opens = build(D)
    for c in days:
        c["cand"] = [p for p in PLAYS if opens(p, c)]

    thin = [c for c in days if len(c["cand"]) < 2]
    if thin:
        print("[실패] 고를 판이 둘도 안 되는 날이 %d개다: %s"
              % (len(thin), " ".join("%d주%d일" % (c["w"], c["d"]) for c in thin[:5])))
        return 1

    # 고른다. **무작위가 아니다.** 제일 적게 나온 판을 들고 어제 것은 뺀다
    used = {p: 0 for p in PLAYS}
    last = {p: -99 for p in PLAYS}
    prev = None
    for i, c in enumerate(days):
        pool = [p for p in c["cand"] if p != prev] or list(c["cand"])
        pool.sort(key=lambda p: (used[p], last[p], p))
        c["pick"] = pool[0]
        used[c["pick"]] += 1
        last[c["pick"]] = i
        prev = c["pick"]

    # **뽑고 나서 다시 센다.** 뽑는 셈이 맞는지를 뽑은 값으로 잰다 (T302 와 같다)
    same = [days[i]["w"] for i in range(1, len(days))
            if days[i]["pick"] == days[i - 1]["pick"]]
    if same:
        print("[실패] 같은 판이 이틀 잇달아 나오는 자리가 %d곳이다" % len(same))
        return 1

    # 뽑은 판이 그날 정말 열리는가. **후보를 고르는 자리와 따로 잰다.**
    #
    # 깸 시험에서 후보를 열아홉 통째로 바꿔 봤더니 **아무도 안 잡았다.**
    # 후보가 곧 답이었기 때문이다. 만드는 줄 하나가 틀리면 표 전체가 틀리는데
    # 그것을 볼 자리가 없었다. 여기서 한 번 더 본다.
    shut = [c for c in days if not opens(c["pick"], c)]
    if shut:
        print("[실패] 그날 안 열리는 판이 뽑힌 날이 %d개다: %s"
              % (len(shut), " ".join("%d주%d일 %s" % (c["w"], c["d"], c["pick"])
                                     for c in shut[:5])))
        return 1

    # 고르게 나오는가. **적게 나온 것을 드는 셈이 도는지를 결과로 잰다.**
    # 288일에 열아홉이면 판마다 열다섯 번쯤이다. 둘 넘게 벌어지면 셈이 안 돈 것이다.
    lo, hi = min(used.values()), max(used.values())
    if hi - lo > 2:
        print("[실패] 판마다 나오는 횟수가 %d~%d 로 벌어졌다. 고르게 안 골랐다"
              % (lo, hi))
        return 1

    never = [p for p in PLAYS if not used[p]]
    if never:
        print("[실패] 한 번도 안 나오는 판이 있다: %s" % " ".join(never))
        return 1

    obj = {
        "note": "오늘의 한 판이 그날 열 판. 그날 열리는 판 중에서만 고른다. "
                "무작위를 안 쓴다. 두 기기가 같은 표를 본다. "
                "손으로 안 고친다. scripts/derive_onepick.py 를 다시 돌린다.",
        "grade": "A",
        "gradeWhy": "영어가 없다. 어느 판을 여는가만 적는다. 열리는 조건은 "
                    "판마다의 자료 파일에서 세었고 고르는 법은 셈이라 "
                    "다시 뽑아도 같은 표다.",
        "generator": "scripts/derive_onepick.py",
        "source": "out/data/index.json 과 판 자료 열둘, docs/play_rules.md 12.2",
        "plays": PLAYS,
        # **모르는 것을 안다고 적지 않는다.** 이 판은 기기 기록을 쓴다
        "unknown": UNKNOWN,
        "count": len(days),
        "used": used,
        "days": [{"w": c["w"], "d": c["d"], "lec": c["lec"], "pick": c["pick"],
                  "cand": len(c["cand"])} for c in days],
    }
    io.open(os.path.join(OUT, "onepick.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "onepick.js"), "w", encoding="utf-8").write(
        "window.ENG2P_ONEPICK=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    cn = [len(c["cand"]) for c in days]
    print("out/data/onepick.json / %d일 / 판 %d개가 %d~%d번씩 / "
          "고를 판 %d~%d개 / 못 거르는 판 %d개 / **무작위를 안 썼다**"
          % (len(days), len(PLAYS), lo, hi, min(cn), max(cn), len(UNKNOWN)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
