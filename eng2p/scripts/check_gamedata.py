#!/usr/bin/env python3
"""게임이 받는 자료 계약 검사 (`docs/game_data.md`). 판정 열쇠, NPC 응답, 목소리 목록, 덱 이름, JSON 짝.

게임은 이 자료를 **읽기만** 한다. 어긋나면 게임이 한 해 동안 멈추거나 NPC 가 지은 영어를 말한다.
그래서 세는 것이 아니라 **하나라도 빠지면 실패**로 건다.

    1 judge     판정형 140장이 다 열쇠가 있다. 못 읽은 카드(unparsed)가 0이다. 열쇠 없는 카드는 3.2 표의 넷과 같다
                통과선이 카드 글의 숫자와 같고 칸 수가 재료와 맞고 열쇠 값이 선택지 안에 있다
    2 secret    정답 열쇠가 화면으로 가는 자료와 앱에 없다
    3 replies   역할형 105장이 응답 줄이나 까닭이 있다. 다섯 요소(상황 관계 목적 격식 끝 조건)가 다 있다
    4 voice     장면의 NPC 줄 전부와 응답 줄이 목소리 목록에 있다. id 가 해시와 같고 목소리가 5.1 표와 같다
    5 decks     이름 든 NPC 덱 글마다 처리가 있다. swap 한 글에 이름이 안 남는다
    6 pairs     대본, 소리 길이, 어림 시각, 강의 본문의 .js 와 .json 이 같은 내용이다
    7 ground    **응답 줄, 목소리 목록 줄, 바꾼 덱 글이 들은 대본 한 마디 안에서 이어진 문장 그대로다.**
                파생기와 다른 코드로 다시 본다 (장면 파생기의 grounded 를 쓰지 않는다)
    8 fresh     네 JSON 이 원본을 다시 읽어 낸 것과 같다. 손으로 고친 것이 없다

`--break` 를 주면 규칙마다 실패를 하나 심어 그 규칙이 잡는지 본다. 안 잡는 규칙이 있으면 실패다.
안 잡히는 검사기는 통과한 것처럼 보인다 (CLAUDE.md 병렬 개발).

**기계가 안 보는 것: 그 줄이 그 순간에 자연스러운가. 판정 열쇠가 말의 뜻을 바르게 옮겼는가.**
앞의 것은 4주 리허설에서 두 사람 귀로, 뒤의 것은 3.1 표 근거 문구를 사람이 읽는다.

사용법:
    python3 scripts/check_gamedata.py           # 검사
    python3 scripts/check_gamedata.py --break   # 검사 + 깸 시험
"""
import copy
import glob
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import derive_deck_names as DN      # noqa: E402
import derive_judge as DJ           # noqa: E402
import derive_replies as DR         # noqa: E402
import derive_scenes as DS          # noqa: E402  읽기만 한다. 막는 말 표와 호칭만 쓴다
import derive_voicelist as DV       # noqa: E402

ROOT = DS.ROOT
GAME = os.path.join(ROOT, "out", "game")
DATA = os.path.join(ROOT, "out", "data")
TRANS = DS.TRANS
QUARTERS = ["Q1", "Q2", "Q3", "Q4"]
PAIRS = {"transcripts": "ENG2P_TRANSCRIPTS", "audiolen": "ENG2P_AUDIOLEN", "cues": "ENG2P_CUES",
         "lecturetext": "ENG2P_LECTURETEXT"}
TERM = ".!?"


def jload(p):
    return json.load(open(p, encoding="utf-8"))


# 대본 한 마디 안의 문장 그대로인가. 파생기와 다르게 짠다 --------------------------

class Verbatim:
    """줄을 낱말 열로 바꿔 대본 한 마디의 낱말 열 안에서 찾는다. 문장 머리와 끝이 맞아야 한다."""

    LABEL = re.compile(r"\s*((?:(?:Ms|Mr|Mrs|Dr)\. )?[A-Z][A-Za-z ]*?):\s*(.*)", re.S)
    TOK = re.compile(r"\{[^}]+\}|[a-z0-9]+(?:['\-][a-z0-9]+)*|[.!?]+")

    def __init__(self):
        self.turns = {}
        self.who = {}

    @classmethod
    def toks(cls, text):
        t = text.replace("’", "'").replace("‘", "'").lower()
        for ch in '"“”…' + chr(0x2014):          # 큰따옴표, 말줄임, 긴 줄표
            t = t.replace(ch, " ")
        t = t.replace("...", " ").replace("--", " ")
        out = []
        for x in cls.TOK.findall(t):
            x = x[0] if x[0] in TERM else x          # 마침표 열은 첫 글자 하나로
            out.append(x)
        return out

    def load(self, m):
        if m in self.turns:
            return
        p = os.path.join(TRANS, m + ".md")
        body = open(p, encoding="utf-8").read().split("## 대본", 1)[-1]
        turns, names, who = [], set(), None
        for para in re.split(r"\n\s*\n", body):
            if not para.strip():
                continue
            mm = self.LABEL.match(para)
            text = mm.group(2) if mm else para
            if mm:
                who = mm.group(1)
                lab = who.strip()
                if re.fullmatch(r"[A-Z][a-z]+", lab) and lab not in DS.ROLE_LABELS:
                    names.add(lab.lower())
            if who and text.strip():
                turns.append(self.toks(" ".join(text.split())))
        self.turns[m] = turns
        self.who[m] = names

    @staticmethod
    def same(lt, tt, names):
        if lt.startswith("{"):
            if lt in ("{a}", "{b}"):
                return tt in names
            return re.fullmatch(r"[a-z](?:-[a-z])+", tt) is not None   # {A철자} {A틀린철자}
        return lt == tt

    def has(self, line, m):
        """line 이 m 대본의 한 마디 안에서 이어진 문장 그대로인가."""
        self.load(m)
        L = self.toks(line)
        if not L:
            return False
        names = self.who[m]
        n = len(L)
        for T in self.turns[m]:
            for i in range(0, len(T) - n + 1):
                if i > 0 and T[i - 1] not in TERM:
                    continue                      # 문장 머리에서 시작해야 한다
                if L[-1] not in TERM and i + n != len(T):
                    continue                      # 끝 부호가 없으면 한 마디의 끝이어야 한다
                if all(self.same(a, b, names) for a, b in zip(L, T[i:i + n])):
                    return True
        return False

    def find(self, line, medias):
        for m in medias:
            if self.has(line, m):
                return m
        return None


# 자료 읽기 -----------------------------------------------------------------

def load():
    d = {"cards": jload(os.path.join(DATA, "cards.json"))["items"],
         "sessions": jload(os.path.join(GAME, "sessions.json"))["sessions"],
         "scenes": jload(os.path.join(GAME, "scenes.json")),
         "judge": jload(os.path.join(GAME, "judge.json")),
         "replies": jload(os.path.join(GAME, "replies.json")),
         "voicelist": jload(os.path.join(GAME, "voicelist.json")),
         "decknames": jload(os.path.join(GAME, "deck_names.json"))}
    pairs = {}
    for k, var in PAIRS.items():
        j = os.path.join(DATA, k + ".json")
        s = os.path.join(DATA, k + ".js")
        js = None
        if os.path.exists(s):
            t = open(s, encoding="utf-8").read()
            if t.startswith("window." + var + "="):
                try:
                    js = json.loads(t[t.find("=") + 1:].rstrip().rstrip(";"))
                except ValueError:
                    js = "깨짐"
        pairs[k] = {"js": js, "json": jload(j) if os.path.exists(j) else None}
    d["pairs"] = pairs
    first_media, first_card, heard = {}, {}, {}
    seen = []
    for x in d["sessions"]:
        if x["media"] not in first_media:
            first_media[x["media"]] = x["s"]
            seen.append(x["media"])
        heard[x["s"]] = list(seen)
        for c in x["cards"]:
            first_card.setdefault(c, x["s"])
    d["first_media"], d["first_card"], d["heard"] = first_media, first_card, heard
    return d


V = Verbatim()
LISTS = DR.block_lists()


# 규칙 ------------------------------------------------------------------------

def rule_judge(d):
    f = []
    J = d["judge"]
    cards = [c for c in d["cards"] if c["type"] == "판정"]
    ids = [c["id"] for c in cards]
    recs = {r["id"]: r for r in J["cards"]}
    if len(cards) != 140:
        f.append("판정형 카드가 %d장이다. 140장이어야 한다" % len(cards))
    miss = [i for i in ids if i not in recs]
    if miss:
        f.append("열쇠가 없는 판정형 카드 %d장: %s" % (len(miss), " ".join(miss[:6])))
    extra = [i for i in recs if i not in ids]
    if extra:
        f.append("판정형이 아닌 카드에 열쇠가 있다: " + " ".join(extra[:6]))
    if J.get("unparsed"):
        f.append("못 읽은 카드 %d장이 있다: %s" % (len(J["unparsed"]), " ".join(u["id"] for u in J["unparsed"][:6])))
    if J.get("count") != len(J["cards"]):
        f.append("judge.json 의 count 가 카드 수와 다르다")
    allowed = DJ.open_rows()
    if allowed is None:
        return f + ["game_data.md 3.2 표가 없다"]
    opens = {r["id"] for r in J["cards"] if r["key"]["form"] == "open"}
    if opens != set(allowed):
        f.append("열쇠 없는 카드가 3.2 표와 다르다: 표 %s / 자료 %s" % (sorted(allowed), sorted(opens)))
    manual = DJ.manual_rows() or {}
    for cid in manual:
        if cid not in ids:
            f.append("3.1 표의 카드가 판정형이 아니다: " + cid)
    cmap = {c["id"]: c for c in cards}
    for r in J["cards"]:
        c = cmap.get(r["id"])
        if not c:
            continue
        pa, pb = DJ.parse_pass(c["a"].get("pass", "")), DJ.parse_pass(c["b"].get("pass", ""))
        if pa is None or (r["k"], r["n"]) != pa:
            f.append("%s 통과선이 카드 글과 다르다: 자료 %s/%s 카드 %s" % (r["id"], r["k"], r["n"], pa))
        if pb is not None and pb != pa and r.get("kShown") != pb[0]:
            f.append("%s 의 B 면 통과선(%s)이 kShown 에 없다" % (r["id"], pb[0]))
        if not 1 <= r["k"] <= r["n"]:
            f.append("%s 의 통과선 숫자가 이상하다" % r["id"])
        if c.get("seconds") is not None and r.get("seconds") != c["seconds"]:
            f.append("%s 의 제한 시간이 카드와 다르다" % r["id"])
        if r["input"] not in J["inputs"]:
            f.append("%s 의 답하는 길이 목록 밖이다: %s" % (r["id"], r["input"]))
        k = r["key"]
        if k["form"] not in J["forms"]:
            f.append("%s 의 열쇠 형태가 목록 밖이다: %s" % (r["id"], k["form"]))
            continue
        mat = c["a"].get("material") or []
        items = k.get("items")
        if k["form"] == "open":
            if not (k.get("how") and k.get("rule") and k.get("why")):
                f.append("%s 열쇠 없는 카드에 갈래나 규칙이나 까닭이 없다" % r["id"])
            continue
        if k["form"] == "npc_pick":
            plan = k.get("plan")
            if not isinstance(plan, list) or not plan:
                f.append("%s 읽는 쪽 배정이 없다" % r["id"])
            elif k["pick"] == "two_of_all":
                if len(plan) != 2 or len(set(plan)) != 2 or any(not 0 <= i < len(mat) for i in plan):
                    f.append("%s 다섯 가운데 둘 배정이 이상하다: %s" % (r["id"], plan))
            elif len(plan) != len(mat) or any(b not in (0, 1) for b in plan) or len(set(plan)) < 2:
                f.append("%s 쌍마다 한쪽 배정이 이상하다: %s" % (r["id"], plan))
            continue
        if not isinstance(items, list) or len(items) != len(mat):
            f.append("%s 열쇠 칸 수가 재료와 다르다 (%s / %d)" % (r["id"], len(items or []), len(mat)))
            continue
        if k["form"] == "side":
            if any(i not in (0, 1) for i in items):
                f.append("%s 짝 고르기 열쇠가 0 이나 1 이 아니다" % r["id"])
            if len(k.get("options", [])) != len(items) or any(len(o) != 2 for o in k.get("options", [])):
                f.append("%s 짝 고르기 선택지가 이상하다" % r["id"])
        elif k["form"] == "number":
            flat = [x for it in items for x in (it if isinstance(it, list) else [it])]
            if any(not isinstance(x, int) or x < 0 for x in flat):
                f.append("%s 수 열쇠가 정수가 아니다" % r["id"])
        elif k["form"] == "label":
            labs = k.get("labels") or []
            if not labs:
                f.append("%s 이름표 열쇠에 선택지가 없다" % r["id"])
            for it in items:
                for x in (it if isinstance(it, list) else [it]):
                    if x not in labs:
                        f.append("%s 이름표 '%s' 가 선택지 밖이다" % (r["id"], x))
                        break
        elif k["form"] == "flag":
            if any(not isinstance(x, bool) for x in items) or not any(items):
                f.append("%s 있다 없다 열쇠가 이상하다" % r["id"])
        elif k["form"] == "position":
            for w, pos in zip(k.get("words", []), items):
                if not isinstance(pos, int) or not 0 <= pos <= len(w):
                    f.append("%s 끼운 자리 번호가 낱말 밖이다: %s %s" % (r["id"], w, pos))
        elif k["form"] == "tokens":
            for i, it in enumerate(items):
                if not it.get("of") or not 1 <= it.get("need", 0) <= len(it["of"]):
                    f.append("%s %d번 낱말 열쇠가 이상하다: %s" % (r["id"], i + 1, it))
                    continue
                # 짚는 카드는 살아남는 낱말이 문장 안에 있어야 한다
                if r["input"] == "tap_word":
                    text = mat[i].lower() if i < len(mat) else ""
                    for w in it["of"]:
                        if w.lower() not in re.findall(r"[a-z0-9']+", text) and w.lower() not in text:
                            f.append("%s %d번 열쇠 낱말 '%s' 가 재료 문장에 없다" % (r["id"], i + 1, w))
        if k["form"] in ("tokens", "label", "side", "flag") and r["input"] == "count":
            f.append("%s 형태 %s 인데 답하는 길이 수 세기다" % (r["id"], k["form"]))
    return f


def rule_secret(d):
    """정답 열쇠가 화면과 앱으로 가는 자료에 없다."""
    f = []
    J = d["judge"]
    if J.get("visibility") != "game-only":
        f.append("judge.json 이 game-only 표시가 아니다")
    blobs = {"scenes.json": json.dumps(d["scenes"], ensure_ascii=False),
             "replies.json": json.dumps(d["replies"], ensure_ascii=False),
             "voicelist.json": json.dumps(d["voicelist"], ensure_ascii=False),
             "deck_names.json": json.dumps(d["decknames"], ensure_ascii=False)}
    for c in d["cards"]:
        if c["type"] != "판정":
            continue
        ans = (c["a"].get("answer") or "").strip()
        if len(ans) < 9:
            continue
        for name, blob in blobs.items():
            if ans in blob:
                f.append("%s 의 답이 %s 에 실렸다" % (c["id"], name))
    # 앱은 이 파일을 안 읽는다. 앱이 읽으면 화면에 나올 수 있다
    app = [os.path.join(ROOT, "app")] + [os.path.join(ROOT, "out", "app")]
    for base in app:
        for p in glob.glob(os.path.join(base, "**", "*.js"), recursive=True):
            if "judge.json" in open(p, encoding="utf-8", errors="ignore").read():
                f.append("앱 조각이 judge.json 을 읽는다: " + os.path.relpath(p, ROOT))
    return f


def rule_replies(d):
    f = []
    R = d["replies"]
    roles = [c for c in d["cards"] if c["type"] == "역할"]
    recs = {r["id"]: r for r in R["cards"]}
    if len(roles) != 105 or len(R["cards"]) != 105:
        f.append("역할형이 %d장, 응답이 %d장이다. 둘 다 105 여야 한다" % (len(roles), len(R["cards"])))
    for c in roles:
        r = recs.get(c["id"])
        if not r:
            f.append("응답이 없는 역할형 카드: " + c["id"])
            continue
        a, b = c["a"], c["b"]
        for k in ("situation", "relation", "purpose", "register", "endCondition"):
            if not a.get(k):
                f.append("%s 에 역할 요소 %s 가 비었다" % (c["id"], k))
            if b.get(k) != a.get(k):
                f.append("%s 의 %s 가 A 면과 B 면이 다르다" % (c["id"], k))
        el = r.get("elements") or {}
        if el.get("register") not in DR.REGISTERS or el.get("relation") not in DR.RELATIONS \
                or el.get("purpose") not in DR.PURPOSES or not el.get("situation") or not el.get("endCondition"):
            f.append("%s 응답의 다섯 요소가 이상하다: %s" % (c["id"], el))
        elif (el["register"], el["relation"], el["purpose"]) != (a["register"], a["relation"], a["purpose"]):
            f.append("%s 응답의 요소가 카드와 다르다" % c["id"])
        if r["reply"] is None:
            if not r.get("reason") or r.get("gesture") not in DR.GESTURES:
                f.append("%s 는 줄이 없는데 까닭이나 몸짓이 없다" % c["id"])
        else:
            if not r["reply"].get("say"):
                f.append("%s 응답 줄이 비었다" % c["id"])
        if r.get("firstSession") != d["first_card"].get(c["id"]):
            f.append("%s 의 첫 세션이 세션 자료와 다르다" % c["id"])
    n = R["counts"]
    got = sum(1 for r in R["cards"] if r["reply"])
    if (n["role"], n["grounded"], n["gestureOnly"]) != (105, got, 105 - got):
        f.append("replies.json 의 counts 가 카드와 다르다")
    if n["full"] + n["partial"] != got:
        f.append("끝까지와 첫 반응만의 합이 줄 있는 카드 수와 다르다")
    # 막는 말과 이름 자리
    for r in R["cards"] + R["repair"]:
        rep = r.get("reply")
        if not rep:
            continue
        if re.search(r"\{[^}]*\}", rep["say"]):
            f.append("%s 응답 줄에 이름 자리가 있다 (speaker-neutral 이 아니다)" % r["id"])
        why = DR.blocked(rep["say"], LISTS)
        if why:
            f.append("%s 응답 줄 '%s' 이 막힌다: %s" % (r["id"], rep["say"], why))
        if set(re.findall(r"[A-Z][a-z]+", rep["say"])) & set(DN.radio_names()):
            f.append("%s 응답 줄에 라디오 인물 이름이 있다: %s" % (r["id"], rep["say"]))
    return f


def rule_ground(d):
    """응답 줄, 목소리 목록 줄, 바꾼 덱 글이 들은 대본 그대로인가."""
    f = []
    fm = d["first_media"]
    # 응답. 카드가 처음 나오는 세션까지 들은 과 안에 그대로 있다
    for r in d["replies"]["cards"] + d["replies"]["repair"]:
        rep = r.get("reply")
        if not rep:
            continue
        s0 = r["firstSession"]
        m = rep["from"]
        if m not in fm:
            f.append("%s 응답의 근거 과가 세션에 없다: %s" % (r["id"], m))
            continue
        if fm[m] > s0:
            f.append("%s 응답이 %d세션에 처음 나오는데 근거 %s 는 %d세션에야 듣는다" % (r["id"], s0, m, fm[m]))
        if rep.get("heardAt") != fm[m]:
            f.append("%s 응답의 heardAt 이 세션 자료와 다르다" % r["id"])
        if not V.has(rep["say"], m):
            f.append("%s 응답 줄이 %s 대본 한 마디 안의 이어진 문장이 아니다: %s" % (r["id"], m, rep["say"]))
    rt = d["replies"]["retry"]
    if not V.has(rt["say"], rt["from"]) or fm.get(rt["from"], 99) > 1:
        f.append("되묻는 줄이 1세션에 닿는 대본 그대로가 아니다")
    # 목소리 목록. 줄마다 처음 쓰는 세션까지 들은 과에 그대로 있다
    for ln in d["voicelist"]["lines"]:
        for m in [ln["from"]] + ln.get("alsoFrom", []):
            if m not in fm:
                f.append("목소리 줄의 근거 과가 세션에 없다: %s %s" % (ln["id"], m))
                continue
            if m == ln["from"] and fm[m] > ln["firstSession"]:
                f.append("목소리 줄 '%s' 이 %d세션에 처음 나오는데 근거 %s 는 %d세션에야 듣는다"
                         % (ln["say"], ln["firstSession"], m, fm[m]))
            if not V.has(ln["say"], m):
                f.append("목소리 줄 '%s' 이 %s 대본 그대로가 아니다" % (ln["say"], m))
        why = DR.blocked(ln["say"], LISTS, words_only=True)
        if why:
            f.append("목소리 줄 '%s' 이 막힌다: %s" % (ln["say"], why))
    # 바꾼 덱 글
    names = set(d["decknames"]["radioNames"])
    for it in d["decknames"]["items"]:
        if it["handling"] != "swap":
            continue
        sw = it["swapped"]
        if re.search(r"(?<![A-Za-z])(%s)(?![A-Za-z])" % "|".join(map(re.escape, names)), sw):
            f.append("바꾼 글에 라디오 이름이 남았다: %s" % sw)
        if "{" not in sw:
            f.append("바꾼 글에 이름 자리가 없다: %s" % sw)
        if not V.has(sw, it["media"]):
            f.append("바꾼 덱 글이 %s 대본 그대로가 아니다: %s" % (it["media"], sw))
    return f


def rule_voice(d):
    f = []
    VL = d["voicelist"]
    table, tf = DV.voices()
    f += tf
    if table is None:
        return f
    lines = VL["lines"]
    by = {(r["speaker"], r["say"]): r for r in lines}
    ids = [r["id"] for r in lines]
    if len(ids) != len(set(ids)):
        f.append("목소리 줄 id 가 겹친다")
    if len(by) != len(lines):
        f.append("같은 인물의 같은 줄이 목록에 두 번 있다")
    # 장면의 NPC 줄이 다 있다
    for s in d["scenes"]["sessions"]:
        for b in s["blocks"]:
            for ln in b["lines"]:
                if ln["who"] in DV.PLAYERS:
                    continue
                r = by.get((ln["who"], ln["say"]))
                if r is None:
                    f.append("장면 NPC 줄이 목록에 없다: %d세션 %s: %s" % (s["s"], ln["who"], ln["say"]))
                elif s["quarter"] not in r["quarters"] or s["s"] not in r.get("sessions", []):
                    f.append("목록 줄이 장면의 분기나 세션을 모른다: %d세션 %s" % (s["s"], ln["say"]))
    # 응답 줄이 다 있다
    host = {}
    for s in d["scenes"]["sessions"]:
        for b in s["blocks"]:
            for c in b.get("cards", []):
                host.setdefault(c["id"], c["host"])
    for r in d["replies"]["cards"] + d["replies"]["repair"]:
        if r["reply"] and by.get((host.get(r["id"]), r["reply"]["say"])) is None:
            f.append("응답 줄이 목록에 없다: %s %s" % (r["id"], r["reply"]["say"]))
    rt = d["replies"]["retry"]["say"]
    for sp in {r["speaker"] for r in lines if r["kinds"] != ["retry"]}:
        if (sp, rt) not in by:
            f.append("되묻는 줄이 목록에 없다: " + sp)
    # 거꾸로도 본다. 목록의 줄마다 장면이나 카드 응답이나 되묻기 중 하나에서 온 것이어야 한다
    scene_at = {}
    for s in d["scenes"]["sessions"]:
        for b in s["blocks"]:
            for ln in b["lines"]:
                if ln["who"] not in DV.PLAYERS:
                    scene_at.setdefault((ln["who"], ln["say"]), set()).add(s["s"])
    reply_of = {}
    for r in d["replies"]["cards"] + d["replies"]["repair"]:
        if r["reply"]:
            reply_of.setdefault((host.get(r["id"]), r["reply"]["say"]), set()).add(r["id"])
    for r in lines:
        key = (r["speaker"], r["say"])
        if "scene" in r["kinds"] and set(r.get("sessions", [])) != scene_at.get(key, set()):
            f.append("목록 줄의 장면 세션이 장면과 다르다: %s %s" % (r["speaker"], r["say"]))
        if "reply" in r["kinds"] and set(r.get("cards", [])) != reply_of.get(key, set()):
            f.append("목록 줄의 카드가 응답 자료와 다르다: %s %s" % (r["speaker"], r["say"]))
        if "scene" not in r["kinds"] and "reply" not in r["kinds"] and r["say"] != rt:
            f.append("어디서도 안 온 줄이 목록에 있다: %s %s" % (r["speaker"], r["say"]))
        if "scene" not in r["kinds"] and r.get("sessions"):
            f.append("장면 줄이 아닌데 세션이 적혔다: " + r["id"])
    cast = {k for k, v in table.items() if "borrowedFrom" not in v}
    radio = DN.name_rx(DN.radio_names())
    for r in lines:
        sp = r["speaker"]
        if radio.search(r["say"]):
            f.append("NPC 줄에 라디오 인물 이름이 그대로 있다 (이름 자리여야 한다): %s %s" % (sp, r["say"]))
        if r["id"] != DV.line_id(sp, r["say"]):
            f.append("줄 id 가 해시와 다르다: %s %s" % (r["id"], r["say"]))
        if r.get("synthetic") is not True:
            f.append("synthetic 이 참이 아니다 (NPC 소리는 모두 TTS): " + r["id"])
        if r.get("audioGrade") != "C-gen":
            f.append("audioGrade 가 C-gen 이 아니다: " + r["id"])
        slots = sorted(set(re.findall(r"\{[^}]+\}", r["say"])))
        if r["slots"] != slots or r["render"] != ("runtime" if slots else "pre"):
            f.append("이름 자리나 렌더 갈래가 줄과 다르다: %s %s" % (r["id"], r["say"]))
        v = table.get(sp)
        if not v:
            f.append("목소리 표에 없는 인물이다: " + sp)
            continue
        if (r["voice"]["engine"], r["voice"]["id"]) != (v["engine"], v["id"]):
            f.append("%s 의 목소리가 5.1 표와 다르다: %s %s" % (sp, r["voice"]["engine"], r["voice"]["id"]))
        for q in r["quarters"]:
            if r["speed"].get(q) != v["speed"][q] or r["pauseMs"].get(q) != v["pauseMs"][q]:
                f.append("%s 의 %s 빠르기나 쉼이 5.1 표와 다르다" % (sp, q))
        if set(r["speed"]) != set(r["quarters"]):
            f.append("빠르기가 분기와 어긋난다: " + r["id"])
        if (sp not in cast) != bool(r.get("uncast")):
            f.append("인물표 밖 손님 표시가 이상하다: %s" % sp)
        if v["engine"] == "kokoro" and any(x > 1.15 for x in v["speed"].values()):
            f.append("Kokoro 속도 상한 1.15 를 넘는다: " + sp)
    # 합계
    for sp, t in VL["bySpeaker"].items():
        mine = [r for r in lines if r["speaker"] == sp]
        if t["lines"] != len(mine) or t["runtime"] != sum(r["render"] == "runtime" for r in mine):
            f.append("인물별 합계가 줄과 다르다: " + sp)
    if sum(t["lines"] for t in VL["bySpeaker"].values()) != VL["count"] != len(lines):
        f.append("목소리 목록 count 가 줄 수와 다르다")
    for q in QUARTERS:
        n = sum(1 for r in lines if q in r["quarters"])
        if VL["byQuarter"][q]["lines"] != n:
            f.append("분기별 합계가 줄과 다르다: " + q)
    if VL["renders"] != sum(len(r["quarters"]) for r in lines):
        f.append("렌더 수가 분기 합과 다르다")
    return f


def deck_scan(d):
    """덱을 다시 훑어 이름 든 NPC 글을 모은다. 파생기의 units 를 쓰되 처리는 안 본다."""
    rx = DN.name_rx(DN.radio_names())
    voices = DN.deck_voices()
    L = DN.Lessons()
    cards = {c["id"]: c for c in d["cards"]}
    found, decks = {}, set()
    for x in d["sessions"]:
        for deck, items in x["decks"].items():
            decks.add(deck)
            v = (voices or {}).get(deck, {}).get("voice")
            if v is None or v in ("radio", "none"):
                continue
            for it in items:
                if deck in ("wall", "onesee", "whose", "flip"):
                    c = cards.get(it)
                    for i, m in enumerate((c or {}).get("a", {}).get("material") or []):
                        if isinstance(m, str) and rx.search(m):
                            found["card:%s#%d" % (it, i)] = m
                    continue
                for field, text, _ in DN.units(deck, it, x["media"], L):
                    if text and rx.search(text):
                        found[DN.eid(deck, field, text)] = text
    return found, decks, voices


def all_labels():
    """대본 52편의 화자 칸 글 전부 (Ms. Weaver, Anna's voice 도)."""
    got = set()
    for p in glob.glob(os.path.join(TRANS, "lle1-*.md")):
        body = open(p, encoding="utf-8").read().split("## 대본", 1)[-1]
        got |= {m.group(1).strip() for m in re.finditer(r"^\s*([A-Z][A-Za-z .']*?):", body, re.M)}
    return got


def rule_decks(d):
    f = []
    DNm = d["decknames"]
    found, decks, voices = deck_scan(d)
    if voices is None:
        return ["game_data.md 6.2 표가 없다"]
    for k in decks - set(voices):
        f.append("6.2 표에 없는 판이다: " + k)
    have = {i["id"]: i for i in DNm["items"]}
    for key, text in found.items():
        it = have.get(key)
        if it is None:
            f.append("이름 든 NPC 덱 글에 처리가 없다: %s" % text[:70])
        elif it["handling"] not in ("swap", "skip"):
            f.append("처리가 swap 도 skip 도 아니다: %s" % key)
        elif it["text"] != text:
            f.append("처리 항목의 글이 덱과 다르다: %s" % key)
    for key in have:
        if key not in found:
            f.append("덱에 없는 항목이 처리 목록에 있다: %s" % key)
    if DNm["count"] != len(DNm["items"]) or DNm["swap"] + DNm["skip"] != DNm["count"]:
        f.append("deck_names.json 의 합계가 항목과 다르다")
    names = DN.radio_names()
    rx = DN.name_rx(names)
    for it in DNm["items"]:
        if it["handling"] == "swap":
            sw = it["swapped"]
            back = sw.replace(it["slot"], it["names"][0])
            if back != it["text"] or rx.search(sw):
                f.append("swap 글이 이름만 바꾼 것이 아니다: %s" % it["id"])
            if it["slot"] not in ("{A}", "{B}"):
                f.append("swap 의 이름 자리가 {A} {B} 가 아니다: " + it["id"])
        else:
            if "swapped" in it:
                f.append("skip 항목에 바꾼 글이 있다: " + it["id"])
    # 라디오 구간 판은 줄 번호와 초뿐이다. 글이 있으면 NPC 가 읽을 수 있다
    for x in d["sessions"]:
        for deck, items in x["decks"].items():
            if voices.get(deck, {}).get("voice") == "radio":
                for it in items:
                    if not isinstance(it, dict) or "li" not in it or any(isinstance(v, str) and len(v) > 12 for v in it.values()):
                        f.append("라디오 구간 판 %s 에 글이 있다: %s" % (deck, str(it)[:60]))
                        break
    # who 칸은 라디오 화자 이름표다. 대본 화자 칸에 있는 이름이어야 하고 화면에 안 낸다 (6.2)
    labels = all_labels()
    for x in d["sessions"]:
        for it in x["decks"].get("clash", []):
            for side in ("a", "b"):
                if it[side]["who"] not in labels:
                    f.append("clash 의 who 가 대본 화자 칸에 없다: " + it[side]["who"])
    return f


def rule_pairs(d):
    f = []
    for k, p in d["pairs"].items():
        if p["json"] is None:
            f.append("%s.json 이 없다" % k)
        elif p["js"] is None:
            f.append("%s.js 가 window.%s= 꼴이 아니거나 없다" % (k, PAIRS[k]))
        elif p["js"] == "깨짐":
            f.append("%s.js 안이 JSON 으로 안 읽힌다" % k)
        elif p["js"] != p["json"]:
            f.append("%s.js 와 %s.json 의 내용이 다르다" % (k, k))
    return f


RULES = [("judge", rule_judge), ("secret", rule_secret), ("replies", rule_replies), ("voice", rule_voice),
         ("decks", rule_decks), ("pairs", rule_pairs), ("ground", rule_ground)]


def rule_fresh(d):
    """네 JSON 이 원본을 다시 읽어 낸 것과 같은가. 손으로 고쳤거나 원본이 바뀌고 안 뽑았으면 다르다."""
    f = []
    for name, mod, key in (("judge", DJ, "judge"), ("replies", DR, "replies"),
                           ("voicelist", DV, "voicelist"), ("deck_names", DN, "decknames")):
        fresh, fail = mod.build()
        if fail or fresh is None:
            f.append("%s 를 다시 못 뽑았다: %s" % (name, "; ".join(fail[:2])))
        elif json.loads(json.dumps(fresh, ensure_ascii=False)) != d[key]:
            f.append("%s.json 이 원본을 다시 읽은 것과 다르다. scripts/derive_%s.py 를 다시 돌린다"
                     % (name, "deck_names" if name == "deck_names" else name))
    return f


# 깸 시험 ---------------------------------------------------------------------

def first_of(lst, pred):
    for x in lst:
        if pred(x):
            return x
    raise KeyError


def breaks():
    """(이름, 규칙, 자료를 망가뜨리는 함수). 망가뜨린 자료로 그 규칙을 돌리면 실패가 나와야 한다."""
    B = []

    def add(name, rule):
        def deco(fn):
            B.append((name, rule, fn))
            return fn
        return deco

    @add("판정 카드 하나의 열쇠를 지운다", "judge")
    def _(d):
        d["judge"]["cards"].pop(5)

    @add("못 읽은 카드를 하나 적는다", "judge")
    def _(d):
        d["judge"]["unparsed"].append({"id": "Q1-001", "why": "시험"})

    @add("열쇠 없는 카드를 하나 늘린다", "judge")
    def _(d):
        first_of(d["judge"]["cards"], lambda r: r["key"]["form"] == "number")["key"] = \
            {"form": "open", "how": "x", "rule": "x", "why": "x"}

    @add("짝 고르기 열쇠에 2 를 넣는다", "judge")
    def _(d):
        first_of(d["judge"]["cards"], lambda r: r["key"]["form"] == "side")["key"]["items"][0] = 2

    @add("통과선 숫자를 바꾼다", "judge")
    def _(d):
        d["judge"]["cards"][0]["k"] = 1

    @add("낱말 열쇠에 문장에 없는 낱말을 넣는다", "judge")
    def _(d):
        first_of(d["judge"]["cards"], lambda r: r["input"] == "tap_word")["key"]["items"][0]["of"][0] = "zebra"

    @add("카드 답을 장면에 싣는다", "secret")
    def _(d):
        c = first_of(d["cards"], lambda c: c["type"] == "판정" and len(c["a"].get("answer", "")) > 12)
        d["scenes"]["sessions"][0]["blocks"][0]["lines"][0]["say"] = c["a"]["answer"]

    @add("judge.json 의 game-only 표시를 지운다", "secret")
    def _(d):
        d["judge"]["visibility"] = "screen"

    @add("역할형 카드 하나의 응답을 통째로 지운다", "replies")
    def _(d):
        d["replies"]["cards"].pop(10)

    @add("줄도 까닭도 없는 응답을 만든다", "replies")
    def _(d):
        r = first_of(d["replies"]["cards"], lambda r: r["reply"] is None)
        r["reason"] = None

    @add("응답의 격식을 셋 밖으로 바꾼다", "replies")
    def _(d):
        d["replies"]["cards"][0]["elements"]["register"] = "정중"

    @add("응답 줄에 이름 자리를 넣는다", "replies")
    def _(d):
        first_of(d["replies"]["cards"], lambda r: r["reply"])["reply"]["say"] = "Thanks, {A}!"

    @add("응답 줄을 대본에 없는 영어로 바꾼다", "ground")
    def _(d):
        first_of(d["replies"]["cards"], lambda r: r["reply"])["reply"]["say"] = "Absolutely, my dear friend."

    @add("응답 줄의 근거를 아직 안 들은 과로 옮긴다", "ground")
    def _(d):
        r = first_of(d["replies"]["cards"], lambda r: r["reply"] and r["firstSession"] < 100)
        r["reply"]["from"] = "lle1-52"
        r["reply"]["heardAt"] = d["first_media"]["lle1-52"]

    @add("응답 줄을 슬랭으로 바꾼다", "replies")
    def _(d):
        first_of(d["replies"]["cards"], lambda r: r["reply"])["reply"]["say"] = "Sure thing."

    @add("목소리 목록에서 장면 NPC 줄 하나를 뺀다", "voice")
    def _(d):
        i = next(i for i, r in enumerate(d["voicelist"]["lines"]) if r["kinds"] == ["scene"])
        d["voicelist"]["lines"].pop(i)

    @add("줄 id 를 바꾼다", "voice")
    def _(d):
        d["voicelist"]["lines"][3]["id"] = "vdeadbeefdead"

    @add("목소리를 표와 다르게 바꾼다", "voice")
    def _(d):
        d["voicelist"]["lines"][0]["voice"]["id"] = "af_nobody"

    @add("어디서도 안 온 줄을 목록에 더한다", "voice")
    def _(d):
        ln = copy.deepcopy(d["voicelist"]["lines"][0])
        ln["say"] = "Hello there, my friend."
        ln["id"] = DV.line_id(ln["speaker"], ln["say"])
        ln["kinds"] = ["scene"]
        ln["sessions"] = [1]
        d["voicelist"]["lines"].append(ln)

    @add("NPC 줄에 라디오 인물 이름을 그대로 둔다", "voice")
    def _(d):
        r = first_of(d["voicelist"]["lines"], lambda r: r["say"] == "Hi! Are you {A}?")
        r["say"] = "Hi! Are you Anna?"
        r["id"] = DV.line_id(r["speaker"], r["say"])

    @add("synthetic 을 거짓으로 바꾼다", "voice")
    def _(d):
        d["voicelist"]["lines"][0]["synthetic"] = False

    @add("목소리 목록 줄을 대본에 없는 영어로 바꾼다", "ground")
    def _(d):
        r = first_of(d["voicelist"]["lines"], lambda r: r["kinds"] == ["scene"])
        r["say"] = "Welcome to my humble home."
        r["id"] = DV.line_id(r["speaker"], r["say"])

    @add("덱 이름 처리 항목 하나를 뺀다", "decks")
    def _(d):
        d["decknames"]["items"].pop(7)

    @add("swap 한 글에 이름을 남긴다", "ground")
    def _(d):
        it = first_of(d["decknames"]["items"], lambda i: i["handling"] == "swap")
        it["swapped"] = it["text"]

    @add("대본.json 의 한 줄을 바꾼다", "pairs")
    def _(d):
        d["pairs"]["transcripts"]["json"]["items"]["lle1-01"][0] = "Pete: Hello."

    @add("강의 본문.json 을 없앤다", "pairs")
    def _(d):
        d["pairs"]["lecturetext"]["json"] = None

    @add("파생물 JSON 을 손으로 고친다", "fresh")
    def _(d):
        d["voicelist"]["lines"][0]["speed"]["Q1"] = 0.5

    return B


def selftest_verbatim():
    """Verbatim 자체의 깸 시험. 대본 줄은 맞다고, 지은 줄은 아니라고 해야 한다."""
    f = []
    v = Verbatim()
    ok = [("Hi! Are you {A}?", "lle1-01"), ("Let's try that again.", "lle1-01"), ("No. {A철자}", "lle1-01")]
    for line, m in ok:
        if not v.has(line, m):
            f.append("Verbatim 이 대본 줄을 못 찾는다: " + line)
    bad = [("Let's try that again please.", "lle1-01"), ("Are you {A}", "lle1-01"), ("Hi there are you Pete?", "lle1-01"),
           ("Nice to meet you, Daniel.", "lle1-01")]
    for line, m in bad:
        if v.has(line, m):
            f.append("Verbatim 이 대본에 없는 줄을 맞다고 한다: " + line)
    return f


def run_rules(d, fresh=False):
    out = []
    for name, fn in RULES:
        for m in fn(d):
            out.append((name, m))
    if fresh:
        for m in rule_fresh(d):
            out.append(("fresh", m))
    return out


def main():
    d = load()
    fails = run_rules(d, fresh=True)
    fails += [("ground", m) for m in selftest_verbatim()]
    for name, m in fails:
        print("[실패] (%s) %s" % (name, m))
    J, R, VL, DNm = d["judge"], d["replies"], d["voicelist"], d["decknames"]
    print("판정 열쇠 %d장 (열쇠 없음 %d, 못 읽음 %d) / 응답 역할형 %d (줄 %d, 몸짓만 %d) / 목소리 줄 %d (렌더 %d) "
          "/ 덱 이름 %d (swap %d, skip %d) / JSON 짝 %d"
          % (J["count"], J["open"], len(J["unparsed"]), R["counts"]["role"], R["counts"]["grounded"],
             R["counts"]["gestureOnly"], VL["count"], VL["renders"], DNm["count"], DNm["swap"], DNm["skip"], len(PAIRS)))
    bad = 0
    if "--break" in sys.argv:
        proofs = breaks()
        caught = 0
        rules = dict(RULES)
        rules["fresh"] = rule_fresh
        for name, rule, fn in proofs:
            # 읽기만 하는 큰 자료(세션, 카드)는 베끼지 않는다
            e = {k: (v if k in ("sessions", "cards") else copy.deepcopy(v)) for k, v in d.items()}
            fn(e)
            got = rules[rule](e)
            if got:
                caught += 1
            else:
                bad += 1
                print("[실패] 깸 시험이 안 잡혔다: %s (규칙 %s)" % (name, rule))
        print("깸 시험 %d개 중 잡힌 것 %d" % (len(proofs), caught))
    n = len(fails) + bad
    print("검사 규칙 %d+1 / 실패 %d" % (len(RULES), n))
    return 1 if n else 0


if __name__ == "__main__":
    sys.exit(main())
