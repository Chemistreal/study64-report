#!/usr/bin/env python3
"""둘이 한 문장 판이 쓸 **앞뒤로 가른 문장**을 뽑는다. T273

`docs/play_rules.md` 4.2 가 쓰는 것을 "오늘 강의 청크에서 만든 문장 여섯.
**없음. A등급 예정 (강의에서 뽑는다)**" 라고 적었다.

## A등급이 맞다. 이번에는

T261 에서는 A등급 예정이라고 적힌 것이 B등급이었다. 자료 안에 **언어에 관한
주장**이 하나 숨어 있었기 때문이다 ("이 둘이 듣기로 가깝다").

여기는 그 주장이 없다.

    문장이 52과 대본에 있다        셀 수 있다
    앞 토막과 뒤 토막이 그 문장이다  셀 수 있다. 글자를 붙이면 원문이 된다
    **어디서 갈랐나**              내가 정했다. 그런데 이것은 언어에 관한 주장이 아니다

셋째가 설계다. 어디서 잘라도 붙이면 원문이 된다. **지어낸 영어가 없다.**
그래서 A등급이다.

가르는 자리는 가운데에 가장 가깝고 **청크를 안 쪼개는** 자리로 고른다.
청크 목록은 B등급인데 (`chunks.js`) 그것을 **고르는 데만 쓰고 결과에 안 넣는다.**
청크 정보가 없어도 가운데에서 자르면 되고 그때도 붙이면 원문이 된다.

## 절반씩 말이 되어야 하는 것은 아니다

이 판은 **붙여서 말이 되면 통과**다 (규칙서 4.2 판정).
앞 토막 혼자 말이 될 필요가 없다. 그래서 자르는 자리에 문법을 안 건다.
문법을 걸면 내가 영어 문법을 판정하는 것이 되고 Q1 문법은 0%다.

쓰는 법:
    python3 scripts/derive_halves.py

결과: out/data/halves.json 과 halves.js
규격: docs/play_rules.md 4.2
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "out", "data")
SRC = os.path.join(OUT, "transcripts.js")
CHK = os.path.join(OUT, "chunks.js")

PER = 8                      # 한 판이 여섯이다. 넉넉히 둔다
MIN_WORDS, MAX_WORDS = 6, 12
MIN_SIDE = 2                 # 한 토막이 두 낱말은 돼야 한다


# 줄임표의 마침표는 문장 끝이 아니다. `U.S.` 와 `D.C.` 가 그렇다.
# 자르기 전에 가려 두고 자른 뒤에 되돌린다. 안 가리면 `families in the U.` 가
# 한 문장이 되고 그것은 대본에 없는 글이다. T273
DOT = "\u0001"
ABBR = re.compile(r"\b(?:[A-Za-z]\.){2,}")


def sentences(body):
    """줄을 문장으로 자른다. 줄임표는 안 자른다."""
    masked = ABBR.sub(lambda m: m.group(0).replace(".", DOT), body)
    out = []
    for s in re.findall(r"[^.!?]+[.!?]*", masked):
        s = s.replace(DOT, ".").strip()
        if s:
            out.append(s)
    return out


def load(path):
    raw = io.open(path, encoding="utf-8").read()
    return json.loads(raw[raw.index("=") + 1:].rstrip().rstrip(";"))


def main():
    if not os.path.exists(SRC):
        print("[실패] %s 가 없다" % SRC)
        return 1
    tr = load(SRC)
    chunks = set()
    if os.path.exists(CHK):
        ch = load(CHK)
        for rows in (ch.get("items") or {}).values():
            for x in rows:
                chunks.add(x["c"])

    def cuts_chunk(ws, k):
        """`k` 자리에서 자르면 청크가 쪼개지나."""
        low = [w.lower().strip("'\"") for w in ws]
        for n in (2, 3, 4):
            for i in range(max(0, k - n + 1), min(k, len(low) - n + 1) + 1):
                if i < k < i + n and " ".join(low[i:i + n]) in chunks:
                    return True
        return False

    def cut(sent, li, si):
        """한 문장을 앞뒤로 가른다. 못 가르면 빈 목록이다."""
        ws = sent.split()
        if not (MIN_WORDS <= len(ws) <= MAX_WORDS):
            return []
        mid_k = len(ws) // 2
        # 가운데에서 밖으로 나가며 청크를 안 쪼개는 자리를 찾는다.
        best = None
        for d in range(0, len(ws)):
            for k in (mid_k - d, mid_k + d):
                if k < MIN_SIDE or k > len(ws) - MIN_SIDE:
                    continue
                if not cuts_chunk(ws, k):
                    best = k
                    break
            if best is not None:
                break
        if best is None:
            best = mid_k        # 다 쪼개면 그냥 가운데. 붙이면 원문이다
        if best < MIN_SIDE or best > len(ws) - MIN_SIDE:
            return []
        return [{"li": li, "si": si, "a": " ".join(ws[:best]),
                 "b": " ".join(ws[best:]), "n": len(ws)}]

    out, thin = {}, []
    for mid in sorted(tr["items"]):
        got = []
        for li, ln in enumerate(tr["items"][mid]):
            body = re.sub(r"^[A-Z][A-Za-z .'-]{0,20}:\s*", "", ln).strip()
            # **줄을 문장으로 자른다.** 한 줄에 문장이 여럿 든 것이 대부분이다.
            # 처음에는 그런 줄을 통째로 버렸는데 52과 중 36과가 여섯을 못 채웠다.
            # 줄 안의 한 문장도 대본에 그대로 있는 글이다. 버릴 이유가 없다. T273
            for si, sent in enumerate(sentences(body)):
                got.extend(cut(sent, li, si))
        # 가운데에 가깝게 갈린 것을 먼저 준다. 한쪽이 너무 짧으면 안 된다.
        got.sort(key=lambda x: (abs(len(x["a"].split()) - len(x["b"].split())), x["li"]))
        out[mid] = got[:PER]
        if len(out[mid]) < 6:
            thin.append("%s(%d)" % (mid, len(out[mid])))

    obj = {
        "note": "둘이 한 문장 판이 쓸 앞뒤로 가른 문장. 52과 대본의 한 문장을 "
                "두 토막으로 갈랐다. 붙이면 원문이다. 손으로 안 고친다. "
                "scripts/derive_halves.py 를 다시 돌린다.",
        "grade": "A",
        "gradeWhy": "지어낸 영어가 없다. 문장이 대본에 있고 두 토막을 붙이면 "
                    "원문이 된다. 둘 다 셀 수 있다. 가르는 자리는 내가 정했지만 "
                    "그것은 설계지 언어에 관한 주장이 아니다.",
        "cut": "가운데에 가장 가깝고 청크를 안 쪼개는 자리에서 가른다. "
               "청크 목록은 고르는 데만 쓰고 결과에 안 들어간다.",
        "generator": "scripts/derive_halves.py",
        "per": PER, "minWords": MIN_WORDS, "maxWords": MAX_WORDS,
        "items": out,
    }
    text = json.dumps(obj, ensure_ascii=False, indent=2) + "\n"
    io.open(os.path.join(OUT, "halves.json"), "w", encoding="utf-8").write(text)
    io.open(os.path.join(OUT, "halves.js"), "w", encoding="utf-8").write(
        "window.ENG2P_HALVES=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    # **붙이면 원문인지를 여기서 확인한다.** 이 파일의 등급이 그 말에 걸려 있다.
    bad = 0
    for mid, rows in out.items():
        for x in rows:
            body = re.sub(r"^[A-Z][A-Za-z .'-]{0,20}:\s*", "",
                          tr["items"][mid][x["li"]]).strip()
            sents = sentences(body)
            src = sents[x["si"]] if x["si"] < len(sents) else ""
            if " ".join(src.split()) != x["a"] + " " + x["b"]:
                bad += 1
    if bad:
        print("[실패] 붙여도 원문이 안 되는 것이 %d개다" % bad)
        return 1
    tot = sum(len(v) for v in out.values())
    print("out/data/halves.json / 과 %d개 / 문장 %d개 / 낱말 %d~%d / "
          "붙이면 원문인 것 %d개 전부" % (len(out), tot, MIN_WORDS, MAX_WORDS, tot))
    if thin:
        print("  [모자람] 여섯을 못 채운 과 %d개: %s" % (len(thin), " ".join(thin[:8])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
