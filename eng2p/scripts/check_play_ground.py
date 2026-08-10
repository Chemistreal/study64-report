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

판 자료 열일곱에서 영어 문장을 다 꺼내 이렇게 가른다.

    대본에 그대로 있다          근거가 제일 세다
    카드 재료에 그대로 있다      카드가 진 등급을 그대로 진다
    둘 다 아니다                **낱말이 다 대본에 있어야 한다**

셋째가 이 검사의 일이다. 파생기가 잘라 붙인 토막은 통째로는 어디에도 없다.
그때는 **낱말로 내려가서** 대본에 있는지 본다. 없으면 `wordlist.md` 에 있어야 한다.

`check_ground.py` 와 같은 문턱이다. **다른 문턱을 만들지 않는다.**

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
            "tally", "quest", "badge", "voice", "ahead"]

HANGUL = re.compile(r"[가-힣]")
WORD = re.compile(r"[A-Za-z]{2,}")

# 두 사람이 안 읽는 칸. **파일 이름과 만든 자 이름이다.**
# 처음에는 이것까지 세어서 `scripts` 와 `py` 가 지어낸 철자로 나왔다.
# 재는 것은 **화면으로 가는 영어**지 자료가 자기를 적은 글이 아니다.
META = {"generator", "source", "note", "gradeWhy", "grade", "emptyWhy",
        "id", "key", "sec", "src", "uses", "pick", "hidden", "plays",
        "unknown", "empty", "fit", "why", "mid", "at", "pos", "kind",
        "track", "name", "label", "anchor", "judge", "see", "q",
        "how", "screen", "ways", "type", "tab"}
PATHY = re.compile(r"[/\\]|\.(py|js|json|md|mp3)\b")


def english(s, path=""):
    """화면으로 가는 영어인가. **한글이 섞이면 지시문이다.**"""
    if not isinstance(s, str) or HANGUL.search(s):
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


def norm(s):
    """견주기 전에 다듬는다. 대소문자와 문장부호와 겹공백을 지운다."""
    s = re.sub(r"[^A-Za-z ]+", " ", s.lower())
    return " ".join(s.split())


def walk(v, out, path=""):
    if isinstance(v, dict):
        for k in v:
            walk(v[k], out, path + "/" + str(k))
    elif isinstance(v, list):
        for i, x in enumerate(v):
            walk(x, out, path)
    elif english(v, path):
        out.append((path, v))


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


def main():
    fails, said = [], []

    tf = os.path.join(OUT, "transcripts.js")
    if not os.path.exists(tf):
        print("[실패] out/data/transcripts.js 가 없다")
        return 1
    s = io.open(tf, encoding="utf-8").read()
    tr = json.loads(s[s.index("=") + 1:].rstrip().rstrip(";"))["items"]

    # 대본. 줄 통째와 낱말 둘 다 만든다
    # **줄은 화자 표시를 떼고 낱말은 안 뗀다.**
    #
    # 처음에는 둘 다 떼고 셌다. 그랬더니 말 겹치기의 `who` 칸에 있는
    # Rebecca 와 Jill 과 Phil 이 **지어낸 철자**로 나왔다.
    # 그 셋은 대본에 있다. 내가 떼어 놓고 없다고 한 것이다.
    #
    # 줄을 견줄 때는 떼는 것이 맞다. 판이 화자 표시 없이 줄만 쓰기 때문이다.
    # 낱말을 셀 때는 아니다. **화자 이름도 대본에 있는 낱말이다.**
    lines, vocab = set(), set()
    for mid in tr:
        for ln in tr[mid]:
            for w in WORD.findall(ln.lower()):
                vocab.add(w)
            lines.add(norm(re.sub(r"^[A-Z][A-Za-z .'-]{0,20}:\s*", "", ln).strip()))

    # 카드 재료. **G구간이 이미 본 글자다**
    card = set()
    if os.path.isdir(CARDS):
        for f in sorted(os.listdir(CARDS)):
            if not f.startswith("eng2p_card_q") or "plan" in f:
                continue
            for ln in io.open(os.path.join(CARDS, f), encoding="utf-8").read().split("\n"):
                ln = re.sub(r"^\s*[-*\d.)\s]+", "", ln).strip()
                if ln and not HANGUL.search(ln):
                    card.add(norm(ln))

    known = wordlist()
    if known is None:
        print("[실패] docs/wordlist.md 가 없다")
        return 1

    tot = {"line": 0, "card": 0, "word": 0}
    bad = []
    for name in PLAYDATA:
        p = os.path.join(OUT, name + ".json")
        if not os.path.exists(p):
            fails.append("out/data/%s.json 이 없다" % name)
            continue
        got = []
        walk(json.load(io.open(p, encoding="utf-8")), got)
        n = {"line": 0, "card": 0, "word": 0}
        for path, v in got:
            k = norm(v)
            if not k:
                continue
            if k in lines:
                n["line"] += 1
                continue
            if k in card:
                n["card"] += 1
                continue
            # 통째로는 없다. **낱말로 내려간다**
            n["word"] += 1
            for w in WORD.findall(v.lower()):
                if w not in vocab and w not in known:
                    bad.append("%s%s: %s (%s)" % (name, path, w, v[:44]))
        for k in tot:
            tot[k] += n[k]
        said.append("%s %d/%d/%d" % (name, n["line"], n["card"], n["word"]))

    if bad:
        fails.append("대본에도 목록에도 없는 낱말이 %d곳이다: %s"
                     % (len(bad), " / ".join(bad[:5])))

    for m in fails:
        print("[실패] " + m)
    print("")
    print("판 자료 %d개 / 영어 문장 %d개 (대본 그대로 %d, 카드 그대로 %d, "
          "잘라 붙인 것 %d) / 지어낸 철자 0개여야 한다 / 실패 %d"
          % (len(PLAYDATA), sum(tot.values()), tot["line"], tot["card"],
             tot["word"], len(fails)))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
