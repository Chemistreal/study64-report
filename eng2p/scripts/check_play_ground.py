#!/usr/bin/env python3
"""판 자료의 **영어에 근거가 있는가.** G구간 게이트를 판에도 건다. T319

G구간에 `check_ground.py` 를 만들었다. 제작물의 영어 재료가 52과 대본 어디에
있는지 찾고 없으면 `docs/wordlist.md` 에 적혀 있어야 실패를 안 낸다.

**그 게이트가 보는 것이 강의와 카드와 세트와 조준표다.**
판 자료 열일곱은 그 뒤에 생겼고 아무도 안 본다.

## 판이 화면에 영어를 낸다

    거울        light / right
    말 겹치기    대본 두 줄 그대로
    3초 벽      카드의 재료 다섯 줄
    거꾸로 판정   카드의 재료 다섯 줄

앞의 둘은 대본에서 왔고 뒤의 둘은 카드에서 왔다.
**카드는 G구간이 이미 본다.** 그러면 다 본 것인가. 아니다.

파생기가 카드에서 뽑을 때 **글자를 손댈 수 있다.** `plain()` 이 `**` 를 떼고
어느 파생기는 화자 이름을 자른다. 뽑힌 뒤의 글자를 본 자가 없다.

## 무엇을 재나

판 자료 스물여섯에서 영어를 다 꺼내 이렇게 가른다.

    대본에 그대로 있다          줄 통째나 화자 표시다. 근거가 제일 세다
    카드 재료에 그대로 있다      카드가 진 등급을 그대로 진다
    대본 한 줄 안에 이어져 있다   토막이다. **차례까지 대본 그대로여야 한다**
    카드 한 줄 안에 이어져 있다   같은 것을 카드에서 본다
    어디에도 안 이어져 있다      **조립한 것이다. 아래 표에 적혀야 통과한다**

## 차례를 안 보면 안 잡힌다 (T425 에 고쳤다)

전에는 셋째 칸이 없었다. 통째로 못 찾으면 **낱말로 내려가서** 그 낱말이 대본에
있는지만 봤다. 그러면 **대본에 있는 낱말을 대본에 없는 차례로 이어 붙인 것**이
안 잡힌다. 실제로 깸 시험에서 `Nice bathroom meet / you the festival now` 를
넣었더니 게이트가 통과를 냈다. 낱말 여섯이 다 대본에 있기 때문이다.

그때 셋째 칸에 든 것이 7452개 중 5357개였다. **재료의 일흔둘이 차례를 안 보고
지나가고 있었다.** 통과라고 적힌 자리가 사실은 안 본 자리였다.

그래서 `ground.py` 와 같은 자로 바꿨다. 그 파일이 이렇게 적어 놨다.

    대본 한 줄 안에 통째로 들어 있어야 찾은 것이다. 줄을 넘겨 잇지 않는다
    이으면 없는 문장도 찾아진다. 앞줄 끝과 뒷줄 앞을 붙이면 아무도 말한 적 없는 말이 만들어진다

낱말 검사는 그대로 둔다. **차례 검사가 낱말 검사를 대신하지 않는다.**
한쪽은 없는 철자를 잡고 한쪽은 없는 차례를 잡는다. 둘은 다른 것을 잡는다.

## 한글 줄 안에 박힌 영어도 본다 (T425 에 넣었다)

전에는 한글이 한 자라도 섞이면 지시문으로 보고 통째로 건너뛰었다.
그런데 판 자료가 `3초 안에 Let me think 나 Hold on 을 낸다` 처럼 **설명 안에
영어를 박아 둔다.** 그것도 두 사람이 읽고 따라 말하는 영어다.
`ground.py` 의 `inline_materials` 가 세트와 조준표에서 같은 일을 한다.
낱말 둘 이상이 이어진 자리만 꺼낸다. 하나짜리는 용어라 안 꺼낸다.

사용법:
    python3 scripts/check_play_ground.py

규격: docs/roadmap.md 12.15, docs/wordlist.md
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "out", "data")
CARDS = os.path.join(ROOT, "out", "cards")
WORDLIST = os.path.join(ROOT, "docs", "wordlist.md")

# 판이 읽는 자료. `check_data.py` 의 PLAYDATA 와 같아야 한다
PLAYDATA = ["pairs", "swaps", "listen", "relay", "chunks", "halves",
            "ladder", "wall", "situ", "wave", "whose", "reask", "cutin",
            "clash", "flip", "onepick", "apart", "playblocks",
            "tally", "quest", "badge", "voice", "ahead", "track", "hold", "more"]

HANGUL = re.compile(r"[가-힣]")
WORD = re.compile(r"[A-Za-z]{2,}")
SPEAKER = re.compile(r"^[A-Z][A-Za-z .'’-]{0,20}:\s*")
# 한글 딱지. `정답: 1) Hi  2) ...` 의 앞머리다. 떼면 뒤는 영어만 남는다.
# 안 떼면 카드가 답을 적어 둔 줄이 통째로 지시문으로 빠지고, 그 줄에서 뽑은
# 3초 벽의 답이 **근거가 없는 것처럼 보인다.** 실제로 네 줄이 그랬다. T425
KLABEL = re.compile(r"^[가-힣][가-힣 ]*:\s*")
# 한국어 설명 안에 박힌 영어. 낱말 둘 이상이 이어진 자리만 본다.
INLINE = re.compile(r"[A-Za-z][A-Za-z'’]*(?:\s+[A-Za-z][A-Za-z'’]*)+")

# 두 사람이 안 읽는 칸. **파일 이름과 만든 자 이름이다.**
# 처음에는 이것까지 세어서 `scripts` 와 `py` 가 지어낸 철자로 나왔다.
# 재는 것은 **화면으로 가는 영어**지 자료가 자기를 적은 글이 아니다.
# `k` 는 통과 조건의 열쇠 이름이다 (T353). 화면에 안 나간다. 화면에 나가는 것은 `l` 이다.
META = {"k",
        "generator", "source", "note", "gradeWhy", "grade", "emptyWhy",
        "id", "key", "sec", "src", "uses", "pick", "hidden", "plays",
        "unknown", "empty", "fit", "why", "mid", "at", "pos", "kind",
        "track", "name", "label", "anchor", "judge", "see", "q",
        "how", "screen", "ways", "type", "tab"}
PATHY = re.compile(r"[/\\]|\.(py|js|json|md|mp3)\b")

# **조립한 자리는 여기 적는다. 적어야만 통과한다.**
#
# `check_ground.py` 의 EXEMPT 와 같은 꼴이다. 문턱을 슬쩍 내리는 대신
# 자리마다 이유를 글로 쓴다. 문턱은 왜 내렸는지 안 남고 이 표는 남는다.
# 열쇠는 `판/자리` 이고 과 번호(`lle1-24`)는 `*` 로 접는다.
ASSEMBLED = {
    "apart/items/title":
        "CLAUDE.md 블록 2 근거표의 현상 이름이다. `dark l` 하나다. "
        "대본에서 뽑은 재료가 아니라 **그 표에서 옮긴 용어**고 표 안은 A등급이다. "
        "두 사람이 따라 말할 영어가 아니라 무엇을 듣는지 가리키는 이름이다.",
}


def slot(name, path):
    """자리 열쇠. 과 번호는 접는다. `clash/items/lle1-24/b/who` -> `clash/items/*/b/who`"""
    return name + re.sub(r"/lle1-\d+", "/*", path)


def english(s, path=""):
    """화면으로 가는 영어인가."""
    if not isinstance(s, str):
        return False
    if PATHY.search(s):
        return False
    last = path.rsplit("/", 1)[-1] if path else ""
    if last in META:
        return False
    # **낱말 하나짜리도 영어다.** 처음에는 둘을 넘어야 문장으로 봤는데
    # 그러면 거울의 최소대립쌍(`light` / `right`)과 한 줄 바꾸기의 바꿀 낱말과
    # 내 소리는 네가의 낱말이 통째로 안 걸린다. 판 다섯이 전체 0으로 나왔다.
    # **화면에 뜨는 영어는 길이로 가르는 것이 아니다.**
    return len(WORD.findall(s)) >= 1


def pieces(s):
    """이 문자열에서 견줄 영어를 낸다.

    한글이 없으면 통째로 하나다. 한글이 섞이면 **설명 안에 박힌 영어**만 꺼낸다.
    낱말 하나짜리는 안 꺼낸다. 한국어 설명에 박힌 한 낱말은 용어지 재료가 아니다.
    """
    if not HANGUL.search(s):
        return [s]
    return [m.group(0).strip() for m in INLINE.finditer(s)]


def norm(s):
    """견주기 전에 다듬는다. 대소문자와 문장부호와 겹공백을 지운다."""
    s = re.sub(r"[^A-Za-z ]+", " ", s.lower())
    return " ".join(s.split())


class Hay:
    """이어진 자리를 찾는 자루. 낱말로 색인을 걸어 빠르게 찾는다.

    1681줄을 문자열마다 다 훑으면 7천 번이 천육백 번씩이라 느리다.
    낱말 하나를 골라 그 낱말이 든 줄만 본다. 고르는 것은 **제일 드문 낱말**이다.
    """

    def __init__(self):
        self.rows = []
        self.idx = {}
        self.exact = set()

    def add(self, text):
        k = norm(text)
        if not k:
            return
        self.exact.add(k)
        i = len(self.rows)
        self.rows.append(" " + k + " ")
        for w in set(k.split()):
            self.idx.setdefault(w, []).append(i)

    def has(self, k):
        """`k` 가 어느 한 줄 안에 통째로 이어져 있는가."""
        ws = k.split()
        if not ws:
            return False
        best = None
        for w in ws:
            got = self.idx.get(w)
            if got is None:
                return False
            if best is None or len(got) < len(best):
                best = got
        needle = " " + k + " "
        return any(needle in self.rows[i] for i in best)


def wordlist():
    if not os.path.exists(WORDLIST):
        return None
    out, cur, infence = set(), None, False
    for line in io.open(WORDLIST, encoding="utf-8").read().split("\n"):
        if re.match(r"^##\s*\d+\.\s*(\S+)", line):
            cur = 1
            continue
        if line.strip().startswith("```"):
            infence = not infence
            continue
        if infence and cur:
            for w in re.findall(r"[a-z]+", line.lower()):
                out.add(w)
    return out


def walk(v, out, path=""):
    if isinstance(v, dict):
        for k in v:
            walk(v[k], out, path + "/" + str(k))
    elif isinstance(v, list):
        for i, x in enumerate(v):
            walk(x, out, path)
    elif english(v, path):
        out.append((path, v))


def transcripts():
    """대본 자루 둘. **줄 본문과 화자 표시를 갈라 담는다.**

    처음에는 둘 다 떼고 셌다. 그랬더니 말 겹치기의 `who` 칸에 있는
    Rebecca 와 Jill 과 Phil 이 **지어낸 철자**로 나왔다.
    그 셋은 대본에 있다. 내가 떼어 놓고 없다고 한 것이다.

    붙여서 담으면 안 된다. **화자 표시와 첫 낱말이 이어진 것처럼 보인다.**
    `Anna: I said` 를 한 줄로 담으면 `Anna I said` 가 대본에 있는 것이 된다.
    아무도 그렇게 말한 적이 없다. 그래서 따로 담는다.
    """
    tf = os.path.join(OUT, "transcripts.js")
    if not os.path.exists(tf):
        return None, None, None
    s = io.open(tf, encoding="utf-8").read()
    tr = json.loads(s[s.index("=") + 1:].rstrip().rstrip(";"))["items"]
    hay, vocab, bodies = Hay(), set(), {}
    for mid in tr:
        bodies[mid] = []
        for ln in tr[mid]:
            # 낱말은 화자 표시까지 센다. **화자 이름도 대본에 있는 낱말이다.**
            for w in WORD.findall(ln.lower()):
                vocab.add(w)
            m = SPEAKER.match(ln)
            if m:
                hay.add(m.group(0).rstrip().rstrip(":"))
            body = SPEAKER.sub("", ln).strip()
            hay.add(body)
            bodies[mid].append(body)
    return hay, vocab, bodies


def cards():
    """카드 자루. **G구간이 이미 본 글자다.**

    셋을 담는다. 영어만 있는 줄, 한글 딱지를 뗀 줄, 한국어 설명에 박힌 영어다.
    셋째가 없으면 `Let me think` 같은 되묻기 재료가 카드에 있는데도 없다고 나온다.
    """
    hay = Hay()
    if not os.path.isdir(CARDS):
        return hay
    for f in sorted(os.listdir(CARDS)):
        if not f.startswith("eng2p_card_q") or "plan" in f:
            continue
        for ln in io.open(os.path.join(CARDS, f), encoding="utf-8").read().split("\n"):
            ln = re.sub(r"^\s*[-*\d.)\s]+", "", ln).strip()
            # 머리말은 재료가 아니다. `ground.py` 의 `inline_materials` 도 이 둘을 뺀다.
            # 검증로그에 적힌 영어를 자루에 넣으면 **내가 적은 메모가 근거가 된다.**
            if ln.startswith("검증") or ln.startswith("신뢰도"):
                continue
            ln = KLABEL.sub("", ln).strip()
            if not ln:
                continue
            if not HANGUL.search(ln):
                hay.add(ln)
            else:
                for m in INLINE.finditer(ln):
                    hay.add(m.group(0).strip())
    return hay


DOT = "\u0001"
ABBR = re.compile(r"\b(?:[A-Za-z]\.){2,}")


def sentences(body):
    """줄을 문장으로 자른다. `derive_halves.py` 와 같은 자여야 한다."""
    masked = ABBR.sub(lambda m: m.group(0).replace(".", DOT), body)
    out = []
    for s in re.findall(r"[^.!?]+[.!?]*", masked):
        s = s.replace(DOT, ".").strip()
        if s:
            out.append(s)
    return out


def rows_checked():
    """자리를 대 본 줄이 몇이냐. **센 수를 적는다.** 안 세면 0줄을 대고도 통과다."""
    n = 0
    for name in ("swaps", "halves", "listen"):
        p = os.path.join(OUT, name + ".json")
        if os.path.exists(p):
            d = json.load(io.open(p, encoding="utf-8"))
            n += sum(len(v) for v in d.get("items", {}).values())
    return n


def structural(bodies, vocab):
    """**자리까지 대조한다.** 줄 하나하나가 제 대본 줄에서 나왔는지 본다. T425

    윗칸의 차례 검사는 문자열만 본다. 그것으로 못 잡는 것이 하나 있다.
    **앞줄 끝과 뒷줄 앞을 따로 담으면 둘 다 이어져 있는 것으로 나온다.**
    붙이면 아무도 말한 적 없는 말인데 조각으로는 둘 다 대본에 있다.
    `ground.py` 가 "줄을 넘겨 잇지 않는다" 고 적은 그 자리다.

    잡으려면 자료가 스스로 적어 둔 자리(`li` `wi` `si`)를 믿지 말고 대 봐야 한다.
    파생기 셋이 저마다 그 자리를 적어 두었으므로 대 볼 수 있다.

        한 줄 바꾸기   `wi` 번째 낱말이 정말 `from` 인가. `to` 가 대본 낱말인가
        둘이 한 문장   `a` 와 `b` 를 붙이면 `li` 줄 `si` 번째 문장인가
        내 소리는 네가  `word` 가 `li` 줄에 있는 낱말인가

    파생기 안에도 같은 확인이 있다 (`derive_halves.py` 끝). **거기 있는 것으로는
    모자란다.** 파생기는 자기가 방금 만든 것을 보고 게이트는 저장소에 있는 것을 본다.
    손으로 고친 자료는 파생기를 안 거친다.
    """
    out = []

    def line_of(name, mid, x):
        if mid not in bodies:
            out.append("%s/%s: 대본에 없는 과다" % (name, mid))
            return None
        li = x.get("li")
        if not isinstance(li, int) or li < 0 or li >= len(bodies[mid]):
            out.append("%s/%s: 줄 번호 %r 이 대본 밖이다" % (name, mid, li))
            return None
        return bodies[mid][li]

    p = os.path.join(OUT, "swaps.json")
    if os.path.exists(p):
        d = json.load(io.open(p, encoding="utf-8"))
        for mid, rows in d.get("items", {}).items():
            for x in rows:
                body = line_of("swaps", mid, x)
                if body is None:
                    continue
                # `derive_swaps.py` 와 같은 자로 쪼갠다. 줄임말은 한 덩이다
                ws = re.findall(r"[A-Za-z]+(?:['’][A-Za-z]+)?", body)
                wi = x.get("wi")
                if not isinstance(wi, int) or wi < 0 or wi >= len(ws):
                    out.append("swaps/%s:%s 낱말 자리 %r 이 줄 밖이다"
                               % (mid, x.get("li"), wi))
                elif ws[wi] != x.get("from"):
                    out.append("swaps/%s:%s 그 자리 낱말은 %r 인데 from 은 %r 이다"
                               % (mid, x.get("li"), ws[wi], x.get("from")))
                if str(x.get("to", "")).lower() not in vocab:
                    out.append("swaps/%s:%s 바꿔 넣을 %r 가 대본에 없는 낱말이다"
                               % (mid, x.get("li"), x.get("to")))

    p = os.path.join(OUT, "halves.json")
    if os.path.exists(p):
        d = json.load(io.open(p, encoding="utf-8"))
        for mid, rows in d.get("items", {}).items():
            for x in rows:
                body = line_of("halves", mid, x)
                if body is None:
                    continue
                ss = sentences(body)
                si = x.get("si")
                src = ss[si] if isinstance(si, int) and 0 <= si < len(ss) else ""
                if " ".join(src.split()) != x.get("a", "") + " " + x.get("b", ""):
                    out.append("halves/%s:%s 붙여도 그 줄 그 문장이 아니다 (%s)"
                               % (mid, x.get("li"),
                                  (x.get("a", "") + " " + x.get("b", ""))[:50]))

    p = os.path.join(OUT, "listen.json")
    if os.path.exists(p):
        d = json.load(io.open(p, encoding="utf-8"))
        for mid, rows in d.get("items", {}).items():
            for x in rows:
                body = line_of("listen", mid, x)
                if body is None:
                    continue
                w = x.get("word", "")
                if x.get("kind") == "beat":
                    if w:
                        out.append("listen/%s:%s 박자 지시인데 낱말이 붙어 있다"
                                   % (mid, x.get("li")))
                elif not w or w not in re.findall(r"[A-Za-z]+", body):
                    out.append("listen/%s:%s 짚은 낱말 %r 이 그 줄에 없다"
                               % (mid, x.get("li"), w))
    return out


def main():
    fails, said = [], []

    thay, vocab, bodies = transcripts()
    if thay is None:
        print("[실패] out/data/transcripts.js 가 없다")
        return 1
    chay = cards()

    known = wordlist()
    if known is None:
        print("[실패] docs/wordlist.md 가 없다")
        return 1

    tot = {"line": 0, "card": 0, "span": 0, "cspan": 0, "made": 0}
    bad, made, used = [], [], set()
    for name in PLAYDATA:
        p = os.path.join(OUT, name + ".json")
        if not os.path.exists(p):
            fails.append("out/data/%s.json 이 없다" % name)
            continue
        got = []
        walk(json.load(io.open(p, encoding="utf-8")), got)
        n = {"line": 0, "card": 0, "span": 0, "cspan": 0, "made": 0}
        for path, v in got:
            for part in pieces(v):
                k = norm(part)
                if not k:
                    continue
                # **낱말 검사는 어느 칸에 들어가든 한다.** 차례 검사가 이것을 안 대신한다.
                for w in WORD.findall(part.lower()):
                    if w not in vocab and w not in known:
                        bad.append("%s%s: %s (%s)" % (name, path, w, part[:44]))
                if k in thay.exact:
                    n["line"] += 1
                elif k in chay.exact:
                    n["card"] += 1
                elif thay.has(k):
                    n["span"] += 1
                elif chay.has(k):
                    n["cspan"] += 1
                else:
                    n["made"] += 1
                    if slot(name, path) in ASSEMBLED:
                        used.add(slot(name, path))
                    else:
                        made.append("%s%s: %s" % (name, path, part[:60]))
        for k in tot:
            tot[k] += n[k]
        said.append("  %-12s 줄 %4d / 카드 %4d / 이어짐 %4d / 카드이어짐 %3d / 조립 %2d"
                    % (name, n["line"], n["card"], n["span"], n["cspan"], n["made"]))

    off = structural(bodies, vocab)
    if off:
        fails.append("자료가 적어 둔 대본 자리와 안 맞는 것이 %d곳이다: %s"
                     % (len(off), " / ".join(off[:5])))

    if bad:
        fails.append("대본에도 목록에도 없는 낱말이 %d곳이다: %s"
                     % (len(bad), " / ".join(bad[:5])))
    if made:
        fails.append("대본에도 카드에도 이어져 있지 않은 영어가 %d곳이다. "
                     "낱말이 다 대본에 있어도 **그 차례로 말한 사람이 없다**: %s"
                     % (len(made), " / ".join(made[:5])))
    # **안 쓰는 허용은 지운다.** `check_ground.py` 가 `고칠` 목록에 하는 것과 같다.
    # 남겨 두면 다음에 그 자리에 무엇이 들어와도 조용히 통과한다.
    stale = sorted(k for k in ASSEMBLED if k not in used)
    if stale:
        fails.append("조립 허용에 적힌 %s 가 자료에 없다. 없어졌으면 표에서 뺀다"
                     % " ".join(stale))

    for m in fails:
        print("[실패] " + m)
    if fails:
        print("")
        for s in said:
            print(s)
    print("")
    print("판 자료 %d개 / 영어 %d개 (대본 그대로 %d, 카드 그대로 %d, "
          "대본에 이어짐 %d, 카드에 이어짐 %d, 조립 %d)"
          % (len(PLAYDATA), sum(tot.values()), tot["line"], tot["card"],
             tot["span"], tot["cspan"], tot["made"]))
    print("자리 대조 %d줄 (한 줄 바꾸기와 둘이 한 문장과 내 소리는 네가) / 안 맞음 %d"
          % (rows_checked(), len(off)))
    print("지어낸 철자 0개 / 안 이어진 것 0개 / 자리 안 맞음 0개여야 한다 / 실패 %d"
          % len(fails))
    for key, why in ASSEMBLED.items():
        print("조립 허용 %s" % key)
        print("     " + why.replace("**", ""))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
