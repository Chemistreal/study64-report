#!/usr/bin/env python3
"""하루 끝 틱을 끝에서 끝까지 돌려 본다. 49일치를 가짜로 만들어 하루씩 이어 간다 (docs/game_results.md 8장, 12장).

`game_tick.js --selftest` 는 한 날의 고정 기록을 본다. 이 검사는 **게임이 실제로 하는 대로 날마다 이어 간다.**

    아침  Brain/next.json 을 읽는다. 오늘 것이 아니면 (쉰 날 뒤) 그날 날짜로 틱을 다시 돈다
    낮    next.json 의 세션 번호, 자리 A, 복습 덱으로 하루를 논다. 결과 줄을 host 파일과 guest 파일에 쓴다
    저녁  game_tick.js 를 게임과 같은 인자로 부른다 (--results Results --state Brain/state.json --sessions Data/sessions.json
          --today <오늘+1> --out Brain). 새 Brain/next.json 이 나온다

달력은 49일: 보통 날 43, 멈춘 날 1 (같은 번호를 다음 날 다시 한다), 바쁜 날 2, 짧은 날 1, 쉰 날 2.
세션 31~36 은 다지기 주(통합 주)고 11 27 43 은 어제 그거 날이다. 통과 / 거의 / 못함 / 건너뜀이 섞이고,
두 사람(a=방장 노트북, b=손님 노트북)의 결과가 갈리고, 어떤 날은 손님 파일이 하루 늦게 온다.

**틱 코드를 안 쓰는 독립 계산이 매일 같은 답을 내는지 견준다** (기준서 8.4 문장: 1, 3, 7, 21, 60, 120일. 제 날 전에 돈 것은
칸을 안 올림. 못 하면 한 칸 내림. near 는 칸을 그대로). 견주는 칸: s through gaps seatA pick review unseen recall merge appHash.

그 위에 지켜야 할 것:

    멱등      같은 줄을 한 번 더 넣어도 같다 (파일을 복사해 한 벌 더). 두 번 돌려도 바이트가 같다
    교환      줄 순서를 뒤집고 CRLF 와 BOM 을 붙여 한 파일에 몰아도 같다 (윈도우 편집기가 하는 것)
    합침      손님 줄을 방장 파일에 이어 붙여도 같다. 손님 줄이 안 오면 다른 답이 나와야 한다 (줄이 정말 쓰인다)
    덮지 않음 Results/ 의 파일이 틱 뒤에 그대로다. Brain/ 에는 next.json 과 state.json 뿐이다
    수렴      손님 파일이 늦게 와도 다 오면 한 번에 돌린 것과 같다
    사다리    카드 네 장으로 212일을 걷는다. 간격(1, 3, 7, 21, 60, 120)과 near, 제 날 전, 못함, 건너뜀, 사람별 칸을
              **손으로 센 표**와 견준다

`--break` 는 틀린 틱 열여덟 가지를 일부러 만들어 이 검사가 잡는지 본다. 하나라도 못 잡으면 실패다.
틱은 **표(out/tick/manifest.json)가 적은 파일만 복사한 묶음**으로 돈다. PC 의 Tools\\brain 과 같은 모양이라
묶음이 모자라면 여기서 먼저 실패한다.

사용법:
    python3 scripts/check_tick_e2e.py            # 49일 + 사다리
    python3 scripts/check_tick_e2e.py --break    # 위에 더해 깸 시험
    python3 scripts/check_tick_e2e.py --keep DIR # 만든 폴더를 지우지 않고 DIR 에 둔다 (보려고)

필요: node, python3. 브라우저 없음. 1분 안쪽.
규격: docs/game_results.md 12장
"""
import concurrent.futures
import datetime
import hashlib
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

HERE = pathlib.Path(__file__).resolve().parent.parent
REPO = HERE.parent
MANIFEST = HERE / "out" / "tick" / "manifest.json"
SESSIONS = HERE / "out" / "game" / "sessions.json"
SPEC = HERE / "docs" / "spec.md"
FIXTURE = HERE / "tools" / "game" / "results_fixture"
D = datetime.date.fromisoformat

# 49일. n 보통 / x 멈춤(session_end 없음) / b 바쁜 날 / s 짧은 날 / - 쉼
PLAN = "nnnnnn" "-" "nnnn" "x" "nnn" "b" "nnnnn" "s" "nnnn" "-" "nnnnnnnnnnnnnnnn" "b" "nnnnn"
DAY0 = "2026-11-02"
LATE_EVERY = 7          # 날 번호 % 7 == 3 인 보통 날은 손님 파일이 그날 저녁에 안 온다 (하루 늦게 온다)
CHECK_DAYS = {7, 16, 30, 40}   # 이 날에는 입력을 바꿔 한 번씩 더 돌려 본다 (멱등, 교환, 합침, 덮지 않음)
DATAHASH = json.loads(open(FIXTURE / "host.jsonl", encoding="utf-8").readline())["dataHash"]


class Stop(Exception):
    """fail-fast: 깸 시험은 첫 실패에서 선다."""


def sha(b):
    return hashlib.sha256(b).hexdigest()


def addd(date, n):
    return (D(date) + datetime.timedelta(days=n)).isoformat()


def jcore(text_or_obj):
    o = json.loads(text_or_obj) if isinstance(text_or_obj, (str, bytes)) else dict(text_or_obj)
    o.pop("merge", None)
    return json.dumps(o, sort_keys=True, ensure_ascii=False)


# ------------------------------------------------------------------ 묶음 (PC 의 Tools\brain 과 같은 모양)

def make_bundle(dest):
    """표가 적은 파일만 복사한다. 표와 파일이 다르면 낡은 표다."""
    m = json.loads(MANIFEST.read_text(encoding="utf-8"))
    for f in m["files"]:
        data = (REPO / f["file"]).read_bytes()
        if sha(data) != f["sha256"]:
            raise SystemExit("[실패] out/tick/manifest.json 이 낡았다 (%s). python3 scripts/derive_tick_bundle.py" % f["file"])
        out = dest / f["file"]
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(data)
    return dest / m["entry"]


def patch(path, old, new):
    t = path.read_text(encoding="utf-8")
    if t.count(old) != 1:
        raise SystemExit("[실패] 깸 시험 고칠 자리를 못 찾았다 (%s 에 %d곳): %s" % (path.name, t.count(old), old[:50]))
    path.write_text(t.replace(old, new), encoding="utf-8", newline="")


# ------------------------------------------------------------------ 기준서 문장에서 읽는 값과 독립 계산

def ladder_from_spec():
    t = SPEC.read_text(encoding="utf-8")
    m = re.search(r"카드는 처음 나온 뒤 ((?:\d+일, )*\d+일) 간격으로 다시 나온다", t)
    return [int(x) for x in re.findall(r"(\d+)일", m.group(1))]


class Oracle:
    """틱 코드를 안 쓴다. 보이는 줄(중복 포함)과 프로필과 오늘만으로 next.json 의 알맹이를 다시 센다."""

    def __init__(self, sf, ladder):
        self.sf, self.rows, self.ladder = sf, sf["sessions"], ladder
        self.rule = sf["runtime"]["recallRule"]

    def expect(self, visible, state, today):
        sf, rows, L = self.sf, self.rows, self.ladder
        uniq = {}
        for o in visible:
            uniq.setdefault((o["s"], o["e"]), o)
        evs = sorted(uniq.values(), key=lambda o: (o["t0"], o["t1"], o["s"], o["e"]))
        side = {"a": {}, "b": {}}

        def step(who, cid, date, out):
            b, due = side[who].get(cid, (0, None))
            d = D(date)
            if out == "skipped":
                return
            if out == "miss":
                nb = max(1, b - 1)
                side[who][cid] = (nb, d + datetime.timedelta(days=L[nb - 1]))
                return
            if b > 0 and due and due > d:
                return
            if b >= len(L):
                side[who][cid] = (b, None)
            elif out == "pass":
                side[who][cid] = (b + 1, d + datetime.timedelta(days=L[b]))
            else:
                nb = max(b, 1)
                side[who][cid] = (nb, d + datetime.timedelta(days=L[nb - 1]))

        miss_by, date_of, done = {}, {}, set()
        for o in evs:
            if o["t"] == "card_run":
                for w in (["a", "b"] if o["seat"] == "team" else [o["seat"]]):
                    step(w, o["id"], o["date"], o["outcome"])
                if o["outcome"] in self.rule["outcomes"]:
                    miss_by.setdefault(o["s"], set()).add(o["id"])
            date_of[o["s"]] = max(date_of.get(o["s"], ""), o["date"])
        for o in evs:
            if o["t"] == "session_end" and o["device"] == "host" and o["ended"] == "done" and o["mode"] == "normal":
                done.add(o["s"])
                date_of[o["s"]] = o["date"]
        through = max(done) if done else 0
        s = max(state.get("nextSession") or 1, through + 1)
        row = rows[s - 1] if s <= len(rows) else None
        own = set(row["cards"]) if row else set()
        td = D(today)
        review = sorted({k for w in side for k, (b, due) in side[w].items() if due and due <= td and k not in own})
        known = set(side["a"]) | set(side["b"])
        unseen = sorted({c for x in rows[:through] for c in x["cards"] if c not in known and c not in own})
        pool = {}
        for n in sorted(self.rule["back"]):                      # 가까운 세션이 먼저, 한 카드는 한 번 (8.5)
            if s - n >= 1:
                for cid in miss_by.get(s - n, ()):
                    pool.setdefault(cid, (n, s - n, date_of.get(s - n)))
        rr = sf["roleRule"]
        return {"v": sf["schemaVersion"], "today": today, "s": s, "through": through,
                "gaps": [k for k in range(1, through + 1) if k not in done], "finished": s > len(rows),
                "seatA": rr["odd"] if s % 2 == 1 else rr["even"], "pick": row["pick"] if row else None,
                "review": review, "unseen": unseen, "appHash": sf["appHash"],
                "pool": pool, "isRecall": bool(row and row["pick"] == "recall"),
                "merge": {"lines": len(visible), "events": len(uniq), "duplicates": len(visible) - len(uniq),
                          "conflicts": 0, "rejected": 0}}


# ------------------------------------------------------------------ 가짜 결과 줄 쓰기

class Writer:
    def __init__(self, device, date, s):
        self.dev, self.date, self.s, self.n, self.min = device, date, s, 0, 0
        self.run = date.replace("-", "") + "100000"
        self.lines = []

    def add(self, t, seat, dur=0, **kw):
        self.n += 1
        t0, t1 = self.min, self.min + dur
        self.min = t1 + 1
        stamp = lambda m: "%sT%02d:%02d:00Z" % (self.date, 10 + m // 60, m % 60)
        o = {"v": 1, "t": t, "s": self.s, "e": "%s%s-%04d" % ("h" if self.dev == "host" else "g", self.run, self.n),
             "device": self.dev, "seat": seat, "date": self.date, "t0": stamp(t0), "t1": stamp(t1)}
        o.update(kw)
        self.lines.append(o)

    def text(self):
        return "".join(json.dumps(o, ensure_ascii=False, separators=(",", ":")) + "\n" for o in self.lines)

    def name(self):
        return "%s_s%03d_%s.jsonl" % (self.run, self.s, self.dev)


def outcome_of(i, cid, who):
    h = int(sha(("%d:%s:%s" % (i, cid, who)).encode())[:8], 16) % 100
    return "pass" if h < 55 else "near" if h < 75 else "miss" if h < 92 else "skipped"


def card_line(w, seat, block, cid, out, via="speech"):
    att = {"pass": 1, "near": 2, "miss": 3, "skipped": 0}[out]
    rep = {"pass": 0, "near": 1, "miss": 1, "skipped": 0}[out]
    k = {"pass": 5, "near": 4, "miss": 1, "skipped": 0}[out]
    w.add("card_run", seat, dur=1, block=block, id=cid, outcome=out, via=via, attempts=att, repairs=rep, k=k,
          n=0 if out == "skipped" else 5)


# ------------------------------------------------------------------ 하루씩 이어 가기

class Sim:
    def __init__(self, name, tick, work, sessions_for_tick, sf, ladder, harness=(), fast=False):
        self.name, self.tick, self.work, self.sf = name, tick, pathlib.Path(work), sf
        self.sess_tick = sessions_for_tick
        self.oracle = Oracle(sf, ladder)
        self.harness, self.fast = set(harness), fast
        self.res, self.brain = self.work / "Results", self.work / "Brain"
        (self.res / "guest").mkdir(parents=True, exist_ok=True)
        self.brain.mkdir(parents=True, exist_ok=True)
        self.fails, self.n = [], 0
        self.host_events, self.guest_events, self.guest_pending = [], [], []
        self.next_session, self.start, self.nxt = 1, None, None
        self.ticks, self.guest_effect = 0, False
        self.env = dict(os.environ, TZ="Pacific/Honolulu", LC_ALL="C")   # 시간대와 로캘이 달라도 같아야 한다

    # -- 검사 기록
    def ok(self, cond, msg):
        self.n += 1
        if not cond:
            self.fails.append(msg)
            if self.fast:
                raise Stop(msg)

    # -- 틱 부르기 (게임의 LaunchBrainTick 과 같은 인자)
    def call(self, today, results=None, out=None, extra=(), state=True):
        res = str(results or self.res)
        out = str(out or self.brain)
        cmd = ["node", str(self.tick), "--results", res, "--out", out]
        sp = self.brain / "state.json"
        if state and sp.exists():
            cmd += ["--state", str(sp)]
        cmd += ["--sessions", str(self.sess_tick), "--today", today] + list(extra)
        r = subprocess.run(cmd, capture_output=True, text=True, env=self.env, timeout=120)
        self.ticks += 1
        return r

    def read_next(self, brain=None):
        p = pathlib.Path(brain or self.brain) / "next.json"
        return p.read_text(encoding="utf-8") if p.exists() else None

    # -- 틱 결과를 독립 계산과 견준다
    def verify(self, text, today, label):
        visible = self.host_events + self.guest_events
        st = {"nextSession": self.next_session}
        ex = self.oracle.expect(visible, st, today)
        got = json.loads(text)
        for k in ("v", "today", "s", "through", "gaps", "finished", "seatA", "pick", "review", "unseen", "appHash", "merge"):
            want = ex[k]
            self.ok(got.get(k) == want, "%s: %s 의 %s 이 독립 계산 %s 와 다르다 (틱 %s)" % (self.name, label, k, json.dumps(want, ensure_ascii=False)[:90], json.dumps(got.get(k), ensure_ascii=False)[:90]))
        # 이 달력에서는 빠진 세션이 없다: 번호가 건너뛰어지면 (바쁜 날에 번호가 올라간 경우) 여기서 걸린다
        self.ok(got["gaps"] == [] and got["s"] == got["through"] + 1, "%s: %s 에 세션 번호가 건너뛰어졌다 (s %s, 끝난 %s, 빈 번호 %s)" % (self.name, label, got["s"], got["through"], got["gaps"]))
        self.ok(got.get("mode") == "normal", "%s: %s 의 mode 가 normal 이 아니다" % (self.name, label))
        deck = got.get("recall") or []
        pool, want_n = ex["pool"], (min(self.oracle.rule["max"], len(ex["pool"])) if ex["isRecall"] else 0)
        self.ok(len(deck) == want_n and len({x["id"] for x in deck}) == len(deck)
                and all(x["id"] in pool and (x["n"], x["s"], x["d"]) == pool[x["id"]] for x in deck),
                "%s: %s 의 어제 그거 %d장이 독립 계산 %d장과 다르다 (못 한 카드 %d)" % (self.name, label, len(deck), want_n, len(pool)))
        return got

    # -- 하루 놀기
    def play_day(self, i, kind, date):
        nxt = self.nxt
        s = nxt["s"] if nxt else self.next_session
        seatA = nxt["seatA"] if nxt else ("a" if s % 2 == 1 else "b")
        rows = self.sf["sessions"]
        own = list(rows[s - 1]["cards"])
        review = list(nxt["review"]) if nxt else []
        unseen = list(nxt["unseen"]) if nxt else []
        h, g = Writer("host", date, s), Writer("guest", date, s)
        mode = {"n": "normal", "x": "normal", "b": "busy", "s": "short"}[kind]
        for w in (h, g):
            w.add("session_start", "team", mode=mode, seatA=seatA, dataHash=DATAHASH, game="0.1.0")
        if kind == "b":
            for w in (h, g):
                w.add("block_start", "team", block=9, place="숙소 앞")
            h.add("activity", "team", dur=10, block=9, kind="errand", ref="emg-01", outcome="pass", via="manual", attempts=1, repairs=0)
            for w in (h, g):
                w.add("block_end", "team", block=9, ended="done")
                w.add("session_end", "team", mode="busy", ended="done")
        else:
            todo = own + review + (unseen[:2] if i % 5 == 0 else [])
            if kind == "s":
                todo = review[:2] or own[:2]
            if kind == "x":
                todo = own[:3]
            chips = set(review[:2]) if (i % 3 == 0 and kind == "n") else set()      # 판정기 없이 칩으로 푼 카드는 team 줄
            for w in (h, g):
                w.add("block_start", "team", block=1, place="숙소 라운지")
            h.add("media_play", "team", dur=2, block=1, media="lle1-01", from_ms=0, to_ms=31200, rate_pct=100)
            h.add("line_wait", "a", dur=1, block=1, line=1, outcome="near", via="speech", attempts=2, repairs=1)
            g.add("line_wait", "b", dur=1, block=1, line=2, outcome="pass", via="speech", attempts=1, repairs=0)
            for w in (h, g):
                w.add("block_end", "team", block=1, ended="done")
                w.add("block_start", "team", block=3, place="편의점")
            for cid in todo:
                if cid in chips:
                    card_line(h, "team", 3, cid, "pass", via="manual")
                else:
                    card_line(h, "a", 3, cid, outcome_of(i, cid, "a"))
                    card_line(g, "b", 3, cid, outcome_of(i, cid, "b"))
            h.add("play_round", "a", dur=2, block=3, play="apart", round=1, outcome="pass", via="manual", attempts=1, repairs=0, hit=3, miss=1)
            for w in (h, g):
                w.add("block_end", "team", block=3, ended="timer" if kind == "x" else "done")
            if kind == "x":
                # 방장 노트북이 멈춰 session_end 를 못 썼는데 손님 노트북은 하루가 끝났다고 적었다. 방장 줄만 센다 (R7)
                g.add("session_end", "team", mode=mode, ended="done")
            else:
                h.add("block_start", "team", block=4, place="숙소 방")
                h.add("activity", "team", dur=3, block=4, kind="retell", ref="", outcome="pass", via="manual", attempts=1, repairs=0)
                h.add("note", "team", block=4, chars=140 + i)
                h.add("pause", "team", on=True)
                h.add("pause", "team", on=False)
                h.add("block_end", "team", block=4, ended="done")
                for w in (h, g):
                    w.add("session_end", "team", mode=mode, ended="done")
        (self.res / h.name()).write_text(h.text(), encoding="utf-8", newline="")
        self.host_events += h.lines
        late = (i % LATE_EVERY == 3 and kind == "n" and "no_late" not in self.harness)
        gf = self.res / "guest" / g.name()
        self.guest_pending.append((gf, g))
        if not late:
            for f, w in self.guest_pending:
                f.write_text(w.text(), encoding="utf-8", newline="")
                self.guest_events += w.lines
            self.guest_pending = []
        # 게임이 하루 끝에 적는 프로필. 보통 날만 번호를 올린다 (바쁜 날은 안 올린다: docs/game_results.md 4.2)
        if self.start is None:
            self.start = date
        if kind == "n" or ("game_busy_bumps" in self.harness and kind == "b"):
            self.next_session = s + 1
        (self.brain / "state.json").write_text(json.dumps({"v": 1, "start": self.start, "nextSession": self.next_session}) + "\n", encoding="utf-8")
        return kind == "n"

    # -- 쓰는 파일을 안 건드렸는지 본다
    def snapshot(self):
        return {str(p.relative_to(self.res)): sha(p.read_bytes()) for p in sorted(self.res.rglob("*")) if p.is_file()}

    def run(self):
        for i, kind in enumerate(PLAN):
            date = addd(DAY0, i)
            if kind == "-":
                continue
            if self.nxt is not None and self.nxt["today"] != date:
                if "no_morning_rerun" in self.harness:
                    self.ok(False, "%s: %s 에 오늘(%s) 것이 아닌 next.json(%s) 로 논다. 게임은 이것을 버리고 복습 덱 없이 논다" % (self.name, date, date, self.nxt["today"]))
                else:
                    r = self.call(date)                                 # 쉰 날 뒤 아침: 오늘 날짜로 틱을 다시 돈다
                    self.ok(r.returncode == 0, "%s: %s 아침 틱이 %d 로 끝났다: %s" % (self.name, date, r.returncode, r.stderr.strip()[:160]))
                    t = self.read_next()
                    prev = set(self.nxt["review"])
                    got = self.verify(t, date, date + " 아침")
                    self.ok(prev <= set(got["review"]) and got["s"] == self.nxt["s"], "%s: %s 아침에 다시 돌린 덱이 어제 것을 품지 않는다" % (self.name, date))
                    self.nxt = got
            counted = self.play_day(i, kind, date)
            before = self.snapshot()
            tomorrow = addd(date, 1)
            r = self.call(tomorrow)
            self.ok(r.returncode == 0, "%s: %s 저녁 틱이 %d 로 끝났다: %s" % (self.name, date, r.returncode, r.stderr.strip()[:200]))
            if r.returncode != 0:
                continue
            text = self.read_next()
            self.nxt = self.verify(text, tomorrow, date + " 저녁")
            self.ok(self.snapshot() == before, "%s: %s 틱이 Results 의 파일을 건드렸다" % (self.name, date))
            self.ok(sorted(p.name for p in self.brain.iterdir()) == ["next.json", "state.json"], "%s: Brain 에 next.json state.json 말고 %s 가 남았다" % (self.name, sorted(p.name for p in self.brain.iterdir())))
            if i in CHECK_DAYS:
                self.variants(date, tomorrow, text)
        # 마지막: 늦은 손님 파일이 다 오고 한 번 더 돈다 (R8). 한 번에 돌린 것과 같아야 한다
        last = addd(DAY0, len(PLAN))
        for f, w in self.guest_pending:
            f.write_text(w.text(), encoding="utf-8", newline="")
            self.guest_events += w.lines
        self.guest_pending = []
        r = self.call(last)
        self.ok(r.returncode == 0, "%s: 마지막 틱이 %d 로 끝났다" % (self.name, r.returncode))
        text = self.read_next()
        self.verify(text, last, "마지막(손님 파일이 다 온 뒤)")
        self.variants(last, last, text, final=True)
        self.final_checks(last, text)
        return self

    # -- 입력을 바꿔 다시 돌려도 같은가
    def tmp_results(self, files):
        d = pathlib.Path(tempfile.mkdtemp(prefix="v_", dir=self.work))
        for rel, data in files.items():
            p = d / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_bytes(data)
        return d

    def variants(self, date, today, text, final=False):
        core = jcore(text)
        files = {str(p.relative_to(self.res)): p.read_bytes() for p in sorted(self.res.rglob("*")) if p.is_file()}

        def run_in(files_map, extra=(), state=True):
            d = self.tmp_results(files_map)
            ob = pathlib.Path(tempfile.mkdtemp(prefix="b_", dir=self.work))
            shutil.copy(self.brain / "state.json", ob / "state.json")
            sp = str(ob / "state.json")
            cmd = ["node", str(self.tick), "--results", str(d), "--out", str(ob), "--sessions", str(self.sess_tick), "--today", today]
            if state:
                cmd += ["--state", sp]
            r = subprocess.run(cmd + list(extra), capture_output=True, text=True, env=self.env, timeout=120)
            self.ticks += 1
            return r, self.read_next(ob), d

        lab = date
        # 두 번 돌려도 바이트까지 같다
        r1 = self.call(today)
        self.ok(self.read_next() == text and r1.returncode == 0, "%s: %s 같은 입력으로 두 번 돌렸더니 next.json 이 다르다" % (self.name, lab))
        # 멱등: 모든 파일을 한 벌 더 (같은 줄이 다시 온다)
        dup = dict(files)
        for rel, data in files.items():
            dup["guest/zz_dup_" + rel.replace("/", "_")] = data
        r, t, _ = run_in(dup)
        self.ok(r.returncode == 0 and jcore(t) == core, "%s: %s 파일을 한 벌 더 넣었더니 답이 달라진다 (멱등이 깨졌다)" % (self.name, lab))
        m0, m1 = json.loads(text)["merge"], json.loads(t)["merge"]
        self.ok(m1["lines"] == 2 * m0["lines"] and m1["events"] == m0["events"] and m1["conflicts"] == 0,
                "%s: %s 한 벌 더 넣었더니 합친 수가 %s 에서 %s 로 간다 (줄은 두 배, 합친 줄은 그대로여야 한다)" % (self.name, lab, m0, m1))
        # 교환: 줄을 거꾸로, 한 파일에, CRLF, 맨 앞 BOM
        allines = []
        for rel in sorted(files):
            allines += [x for x in files[rel].decode("utf-8").split("\n") if x]
        blob = ("﻿" + "\r\n".join(reversed(allines)) + "\r\n").encode("utf-8")
        r, t, _ = run_in({"all.jsonl": blob})
        self.ok(r.returncode == 0 and jcore(t) == core, "%s: %s 줄 순서를 뒤집고 CRLF 와 BOM 을 붙여 한 파일에 넣었더니 답이 달라진다" % (self.name, lab))
        # 합침: 손님 줄을 방장 파일에 이어 붙여도 같다
        hostfiles = {k: v for k, v in files.items() if not k.startswith("guest/")}
        guestfiles = {k: v for k, v in files.items() if k.startswith("guest/")}
        merged = dict(hostfiles)
        if hostfiles:
            first = sorted(hostfiles)[0]
            merged[first] = hostfiles[first] + b"".join(guestfiles[k] for k in sorted(guestfiles))
        r, t, _ = run_in(merged)
        self.ok(r.returncode == 0 and jcore(t) == core, "%s: %s 손님 줄을 방장 파일에 이어 붙였더니 답이 달라진다" % (self.name, lab))
        # 손님 줄이 정말 쓰인다: 손님 파일이 없으면 다른 답이 나온다 (손님 몫 b 의 결과가 있을 때)
        if guestfiles and final:
            r, t, _ = run_in(hostfiles)
            self.guest_effect = jcore(t) != core
        # --merge-out 으로 내보낸 글을 다시 먹여도 같다
        mo = self.work / "merged_out.jsonl"
        r = self.call(today, out=pathlib.Path(tempfile.mkdtemp(prefix="b_", dir=self.work)), extra=["--merge-out", str(mo)])
        if r.returncode == 0 and mo.exists():
            r2, t2, _ = run_in({"merged.jsonl": mo.read_bytes()})
            self.ok(r2.returncode == 0 and jcore(t2) == core, "%s: %s 합친 글(--merge-out)을 다시 넣었더니 답이 달라진다" % (self.name, lab))
        else:
            self.ok(False, "%s: %s --merge-out 이 안 돌았다 (%d)" % (self.name, lab, r.returncode))

    def final_checks(self, last, text):
        self.ok(self.guest_effect, "%s: 손님 파일을 빼도 답이 같다 (손님 줄이 안 쓰인다)" % self.name)
        s = json.loads(text)["s"]
        self.ok(s == 44, "%s: 보통 날 43일 뒤 오늘의 세션이 44 가 아니다 (%d)" % (self.name, s))
        # 다지기 주를 지났고 어제 그거 날(11, 27, 43)을 만났는가 (이 검사가 그곳을 실제로 걸었다는 확인)
        self.ok(self.sf["sessions"][30]["consolidate"] and self.sf["sessions"][35]["consolidate"], "%s: 세션 31~36 이 다지기 주가 아니다" % self.name)


# ------------------------------------------------------------------ 사다리 212일 (손으로 센 표)

# 각 카드: 줄(날, 자리, 결과)과 그 줄 뒤에 두 사람 칸의 다음 날짜(날 번호, 없으면 None). 손으로 셌다.
#   칸 날수 1 3 7 21 60 120. 오르면 그날 + 새 칸. 제 날 전은 안 올림. 못 하면 한 칸 아래(맨 아래는 1일). near 는 칸 그대로.
WALK = {
    "Q1-001": {  # 팀 줄로 제 날마다 통과: 1 3 7 21 60 120 을 끝까지. 맨 위 칸을 돌면 끝난다
        "ev": [(0, "team", "pass"), (1, "team", "pass"), (4, "team", "pass"), (11, "team", "pass"), (32, "team", "pass"), (92, "team", "pass"), (212, "team", "pass")],
        "due": [(0, 1, 1), (1, 4, 4), (4, 11, 11), (11, 32, 32), (32, 92, 92), (92, 212, 212), (212, None, None)]},
    "Q1-002": {  # 제 날 전 통과, 건너뜀, near, 못함, 맨 아래 칸의 못함, 다시 통과
        "ev": [(0, "team", "pass"), (1, "team", "pass"), (2, "team", "pass"), (3, "team", "skipped"), (4, "team", "near"), (7, "team", "pass"),
               (14, "team", "miss"), (17, "team", "miss"), (18, "team", "miss"), (19, "team", "pass")],
        "due": [(0, 1, 1), (1, 4, 4), (2, 4, 4), (3, 4, 4), (4, 7, 7), (7, 14, 14), (14, 17, 17), (17, 18, 18), (18, 19, 19), (19, 22, 22)]},
    "Q1-003": {  # 사람1 만 돌았다. 사람2 칸은 비어 있다
        "ev": [(0, "a", "pass"), (1, "a", "pass")],
        "due": [(0, 1, None), (1, 4, None)]},
    "Q1-004": {  # 사람1 은 통과하고 사람2 는 못 했다. 사람2 가 다시 돌 때까지 덱에 남는다 (팀 합집합)
        "ev": [(0, "a", "pass"), (0, "b", "miss"), (1, "a", "pass"), (3, "b", "pass"), (4, "a", "pass"), (6, "b", "pass")],
        "due": [(0, 1, 1), (0, 1, 1), (1, 4, 1), (3, 4, 6), (4, 11, 6), (6, 11, 13)]},
}


def walk(tick, work, sess_tick, sf, fast, name="사다리"):
    """카드 넷의 212일을 CLI 로 걷는다. 매 날짜마다 덱이 손으로 센 표와 정확히 같은가."""
    rows = sf["sessions"]
    probes = sorted(WALK)
    s = next(k + 1 for k, x in enumerate(rows) if not set(probes) & set(x["cards"]))
    work = pathlib.Path(work)
    (work / "Results").mkdir(parents=True, exist_ok=True)
    (work / "Brain").mkdir(parents=True, exist_ok=True)
    (work / "Brain" / "state.json").write_text(json.dumps({"v": 1, "start": "2027-01-04", "nextSession": s}) + "\n")
    base = "2027-01-04"
    lines = []
    for cid in probes:
        for day, seat, out in WALK[cid]["ev"]:
            lines.append((day, cid, seat, out))
    lines.sort()
    days = set()
    for cid in probes:
        for d, a, b in WALK[cid]["due"]:
            days.add(d)
            for x in (a, b):
                if x is not None:
                    days.update({x - 1, x})
    days.add(300)
    fails, n = [], 0

    def table_has(cid, T):
        st = (None, None)
        for d, a, b in WALK[cid]["due"]:
            if d <= T:
                st = (a, b)
        return any(x is not None and x <= T for x in st)

    env = dict(os.environ, TZ="Pacific/Honolulu")
    for T in sorted(d for d in days if d >= 0):
        out = []
        for k, (day, cid, seat, o) in enumerate(l for l in lines if l[0] <= T):
            att = {"pass": 1, "near": 2, "miss": 3, "skipped": 0}[o]
            ln = {"v": 1, "t": "card_run", "s": s, "e": "h20270104100000-%04d" % (k + 1), "device": "host", "seat": seat,
                  "date": addd(base, day), "t0": addd(base, day) + "T10:00:00Z", "t1": addd(base, day) + "T10:00:30Z", "block": 3, "id": cid,
                  "outcome": o, "via": "speech", "attempts": att, "repairs": 0, "k": 0, "n": 0}
            out.append(json.dumps(ln, separators=(",", ":")) + "\n")
        (work / "Results" / ("20270104100000_s%03d_host.jsonl" % s)).write_text("".join(out), encoding="utf-8", newline="")
        r = subprocess.run(["node", str(tick), "--results", str(work / "Results"), "--state", str(work / "Brain" / "state.json"), "--sessions", str(sess_tick),
                            "--today", addd(base, T), "--out", str(work / "Brain")], capture_output=True, text=True, env=env, timeout=120)
        n += 1
        if r.returncode != 0:
            fails.append("%s: %d일째 틱이 %d 로 끝났다: %s" % (name, T, r.returncode, r.stderr.strip()[:120]))
            if fast:
                raise Stop(fails[-1])
            continue
        got = json.loads((work / "Brain" / "next.json").read_text(encoding="utf-8"))
        want = sorted(c for c in probes if table_has(c, T))
        if got["review"] != want or got["s"] != s:
            fails.append("%s: %d일째 복습 덱이 %s 인데 손으로 센 표는 %s (세션 %s)" % (name, T, got["review"], want, got["s"]))
            if fast:
                raise Stop(fails[-1])
    return n, fails


# ------------------------------------------------------------------ 깸 시험: 틀린 틱

def mutations():
    """(이름, 어디를 고치나, 고칠 것). 어디: tick/app/sessions/harness."""
    T = "eng2p/scripts/game_tick.js"
    return [
        ("near 를 올림으로 셈", "sessions", lambda sf: sf["spacing"]["byOutcome"].__setitem__("near", "up")),
        ("못함을 무시", "sessions", lambda sf: sf["spacing"]["byOutcome"].__setitem__("miss", "none")),
        ("건너뜀을 통과로 셈", "sessions", lambda sf: sf["spacing"]["byOutcome"].__setitem__("skipped", "up")),
        ("어제 그거에 near 도 담음", "sessions", lambda sf: sf["runtime"]["recallRule"].__setitem__("outcomes", ["miss", "near"])),
        ("사다리 21일이 14일", "app", ("eng2p/app/js/06_cards.js", "var SPACING=[1,3,7,21,60,120];", "var SPACING=[1,3,7,14,60,120];")),
        ("near 의 다음 날짜가 위 칸 날수", "tick", (T, "due: C.addDays(td, L[b - 1]), ran: td, hist: hist }); }", "due: C.addDays(td, L[Math.min(b, L.length - 1)]), ran: td, hist: hist }); }")),
        ("team 줄이 사람1 에게만", "tick", (T, 'const sides = e.seat === "team" ? ["a", "b"] : [e.seat];', 'const sides = e.seat === "team" ? ["a"] : [e.seat];')),
        ("못함을 두 번 셈", "tick", (T, "else if (act === \"down\") C.markCardStuck(e.id);", "else if (act === \"down\") { C.markCardStuck(e.id); C.markCardStuck(e.id); }")),
        ("손님 폴더를 안 읽음", "tick", (T, "if (ent.isDirectory()) walk(f);", "if (ent.isDirectory()) { if (ent.name !== \"guest\") walk(f); }")),
        ("손님의 session_end 도 끝으로 셈", "tick", (T, 'e.device === "host" && e.ended === "done" && e.mode === "normal"', 'e.ended === "done" && e.mode === "normal"')),
        ("바쁜 날도 끝난 세션으로 셈", "tick", (T, 'e.device === "host" && e.ended === "done" && e.mode === "normal"', 'e.device === "host" && e.ended === "done"')),
        ("파일마다 따로 세서 중복이 안 합쳐짐", "tick", (T, 'const key = o.s + "\\u0000" + o.e;', 'const key = o.s + "\\u0000" + o.e + "\\u0000" + t.name;')),
        ("줄 차례가 시각이 아니라 줄 번호", "tick", (T, "events.sort((a, b) => cmp(a.t0, b.t0) || cmp(a.t1, b.t1) || (a.s - b.s) || cmp(a.e, b.e));", "events.sort((a, b) => cmp(a.e, b.e));")),
        ("오늘 카드도 복습에 듦", "tick", (T, "C.dueCards().forEach((id) => { if (!set.has(id)) out.add(id); });", "C.dueCards().forEach((id) => { out.add(id); });")),
        ("한 번도 안 돈 카드를 안 가림", "tick", (T, "if (!seen.has(id) && !ownSet.has(id)) unseen.add(id);", "if (!ownSet.has(id)) unseen.add(id);")),
        ("먼저 말을 여는 사람이 하루 밀림", "tick", (T, "seatA: brain.seatA(s),", "seatA: brain.seatA(s + 1),")),
        ("게임이 바쁜 날 번호를 올림 (C++ 에 있던 틈)", "harness", "game_busy_bumps"),
        ("쉰 날 아침에 틱을 안 돌림 (옛 next.json 로 놂)", "harness", "no_morning_rerun"),
    ]


def run_one(name, kind, spec, tmp_root, sf, ladder, fast=True):
    """틱 묶음을 새로 복사해 고치고 49일을 (fail-fast 로) 돌린다. 못 잡으면 None, 잡았으면 첫 실패 글."""
    work = pathlib.Path(tempfile.mkdtemp(prefix="m_", dir=tmp_root))
    tick = make_bundle(work / "brain")
    sess = work / "Data" / "sessions.json"
    sess.parent.mkdir(parents=True)
    harness = ()
    if kind == "tick" or kind == "app":
        patch(work / "brain" / spec[0], spec[1], spec[2])
        shutil.copy(SESSIONS, sess)
    elif kind == "sessions":
        d = json.loads(SESSIONS.read_text(encoding="utf-8"))
        spec(d)
        sess.write_text(json.dumps(d, ensure_ascii=False), encoding="utf-8")
    elif kind == "harness":
        shutil.copy(SESSIONS, sess)
        harness = (spec,)
    try:
        sim = Sim(name, tick, work / "run", sess, sf, ladder, harness=harness, fast=True)
        sim.run()
        n, fails = walk(tick, work / "walk", sess, sf, True, name)
        return None if not (sim.fails or fails) else (sim.fails or fails)[0]
    except Stop as e:
        return str(e)


def main():
    args = sys.argv[1:]
    brk = "--break" in args
    keep = args[args.index("--keep") + 1] if "--keep" in args else None
    sf = json.loads(SESSIONS.read_text(encoding="utf-8"))
    ladder = ladder_from_spec()
    total, fails = 0, []
    root = pathlib.Path(keep) if keep else pathlib.Path(tempfile.mkdtemp(prefix="tick_e2e_"))
    root.mkdir(parents=True, exist_ok=True)

    def ok(cond, msg, label=None):
        nonlocal total
        total += 1
        if cond:
            print("[통과] " + (label or msg))
        else:
            fails.append(msg)
            print("[실패] " + msg)

    try:
        ok(ladder == [1, 3, 7, 21, 60, 120] and sf["spacing"]["ladder"] == ladder, "기준서 8.4 의 사다리 %s 와 sessions.json 의 %s 가 1, 3, 7, 21, 60, 120 이 아니다" % (ladder, sf["spacing"]["ladder"]),
           "기준서 8.4 사다리가 1, 3, 7, 21, 60, 120 일이다")
        tick = make_bundle(root / "brain")
        ok(True, "", "틱 묶음을 표(out/tick/manifest.json)대로 복사했다: 이 파일들만으로 돈다")
        sess = root / "Data" / "sessions.json"
        sess.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(SESSIONS, sess)
        sim = Sim("49일", tick, root / "run", sess, sf, ladder).run()
        total += sim.n
        fails += sim.fails
        n_ok = sim.n - len(sim.fails)
        print("[%s] 49일: 독립 계산과 견준 %d판 중 %d판 통과 (틱 %d번)" % ("통과" if not sim.fails else "실패", sim.n, n_ok, sim.ticks))
        for m in sim.fails[:6]:
            print("[실패] " + m)
        n, wf = walk(tick, root / "walk", sess, sf, False)
        total += n
        fails += wf
        print("[%s] 사다리 212일: 카드 넷, 틱 %d번, 덱이 손으로 센 표와 다른 날 %d" % ("통과" if not wf else "실패", n, len(wf)))
        for m in wf[:4]:
            print("[실패] " + m)
        if brk:
            ms = mutations()
            caught, missed = 0, []
            with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
                futs = [(m[0], ex.submit(run_one, m[0], m[1], m[2], root, sf, ladder)) for m in ms]
                for name, f in futs:
                    why = f.result()
                    total += 1
                    if why:
                        caught += 1
                        print("[잡음] %s -> %s" % (name, why[:110]))
                    else:
                        missed.append(name)
                        fails.append("깸 시험이 못 잡았다: " + name)
                        print("[못 잡음] " + name)
            print("깸 시험 %d가지 중 %d가지를 잡았다" % (len(ms), caught))
    finally:
        if not keep:
            shutil.rmtree(root, ignore_errors=True)
    print("\n틱 한 바퀴 %d판 / 실패 %d" % (total, len(fails)))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
