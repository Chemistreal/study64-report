#!/usr/bin/env python3
"""거울 판의 최소대립쌍을 **52과 대본에서** 뽑는다. T258

`docs/play_rules.md` 3.1 이 이 판의 자료를 "최소대립쌍 표. 없음" 이라고 적어 뒀다.
없는 것을 만드는 턴이다. **그런데 지어내면 안 된다.**

CLAUDE.md 가 정한 1순위 규칙이 그것이다. 학습자 둘은 영어 제로고
내가 틀려도 검출할 사람이 없다. 그리고 `check_ground.py` 가
**대본 밖 낱말을 실패로 낸다.**

그래서 이렇게 만든다.

    대립 꼴을 내가 정한다      한국어 화자가 헷갈리는 자리. 블록 2 근거표가 원본
    낱말은 대본에서만 찾는다   양쪽이 다 52과에 나와야 한 쌍이 된다
    한쪽만 있으면 버린다       못 만든 쌍이 몇인지도 같이 적는다

**대립 꼴은 A등급이다.** 블록 2 근거표에 있는 다섯에서 나온다.
낱말은 대본에 있는 것이라 지어낸 것이 없다.
**쌍이 정말 최소대립인가는 철자로 정한다.** 소리로는 내가 못 잰다.
그래서 철자가 한 글자만 다르거나 정해 둔 꼴만 쓴다.

쓰는 법:
    python3 scripts/derive_pairs.py

결과: out/data/pairs.json 과 pairs.js
규격: docs/play_rules.md 3.1, CLAUDE.md 블록 2 근거표
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

# 대립 꼴. **블록 2 근거표의 다섯에서 나온다.** 하나마다 왜 헷갈리는지를 적는다.
# 여기 없는 꼴은 안 만든다. 늘리려면 근거표에 그 줄이 먼저 있어야 한다.
# **모음 대립을 뺐다.** 철자가 한 자리 다른 것과 소리가 한 자리 다른 것은
# 영어에서 자주 어긋난다. `fall`/`fell` 과 `and`/`end` 가 같은 꼴로 뽑히는데
# 앞엣것은 내가 적은 대립이 아니다. **모르면 안 만든다** (CLAUDE.md 1순위).
# 남긴 것은 자음뿐이고 자음도 **자리를 정해** 뽑는다.
#
#     pos "start"  낱말 첫머리에서만
#     pos "end"    낱말 끝에서만
#     pos "any"    어디서나
CONTRASTS = [
    {"id": "lr", "name": "l 과 r", "pos": "any",
     "why": "한국어 유음이 하나다. 자리에 따라 갈리지 않아 둘을 한 소리로 듣는다",
     "sub": [("l", "r")]},
    {"id": "pf", "name": "첫소리 p 와 f", "pos": "start",
     "why": "한국어에 순치 마찰음이 없다. f 를 ㅍ 로 옮겨 듣는다",
     "sub": [("p", "f")]},
    {"id": "bv", "name": "첫소리 b 와 v", "pos": "start",
     "why": "한국어에 v 가 없다. b 로 옮겨 듣는다",
     "sub": [("b", "v")]},
    {"id": "si", "name": "s 와 sh", "pos": "any",
     "why": "/i/ 앞에서 한국어 구개음화 규칙이 옮겨 온다. see 를 she 로 낸다",
     "sub": [("s", "sh")]},
    {"id": "th", "name": "첫소리 th 와 s", "pos": "start",
     "why": "한국어에 치간 마찰음이 없다. think 를 sink 로 낸다",
     "sub": [("th", "s")]},
    {"id": "dt", "name": "끝소리 d 와 t", "pos": "end",
     "why": "한국어 끝소리가 안 터진다. 끝의 d 와 t 를 같게 낸다",
     "sub": [("d", "t")]},
]

# 낱말로 안 세는 것. 사람 이름, 한 글자짜리, 그리고 **낱말이 아닌 소리**다.
# `shh` 나 `ha` 는 대본에 나오지만 최소대립쌍으로 못 쓴다. 뜻이 없다.
# 줄임말 조각도 뺀다. `we've` 를 자르면 `ve` 가 남는데 그것은 낱말이 아니다.
SKIP = {"a", "i", "o", "s", "t", "anna", "pete", "jonathan", "penelope",
        "ve", "re", "ll", "hm", "hmm", "ha", "haha", "shh", "shhh", "uh",
        "oh", "ah", "eh", "mm", "mmm", "ow", "wow", "hey", "yeah", "um"}


def words():
    """52과 대본의 낱말을 다 모은다. **여기 없는 낱말은 안 쓴다.**"""
    raw = io.open(SRC, encoding="utf-8").read()
    obj = json.loads(raw[raw.index("=") + 1:].rstrip().rstrip(";"))
    seen = {}
    for mid, lines in obj["items"].items():
        for ln in lines:
            # 화자표를 뗀다. "Pete: " 꼴이다.
            body = re.sub(r"^[A-Z][A-Za-z .'-]{0,20}:\s*", "", ln)
            for w in re.findall(r"[A-Za-z]+", body.lower()):
                if len(w) < 2 or w in SKIP:
                    continue
                seen.setdefault(w, set()).add(mid)
    return seen


def swap(w, a, b, pos):
    """한 자리만 바꾼 꼴을 낸다. **자리를 지킨다.**

    자리를 안 보면 "끝소리 d 와 t" 에 `do`/`to` 가 들어온다. 그것은 첫소리다.
    적어 둔 대립과 뽑힌 쌍이 다른 것을 말한다. 실제로 그렇게 나왔다 (T258).
    """
    out = []
    for i in range(len(w) - len(a) + 1):
        if w[i:i + len(a)] != a:
            continue
        if pos == "start" and i != 0:
            continue
        if pos == "end" and i + len(a) != len(w):
            continue
        out.append(w[:i] + b + w[i + len(a):])
    return out


def main():
    if not os.path.exists(SRC):
        print("[실패] %s 가 없다" % SRC)
        return 1
    seen = words()
    groups, dropped = [], 0
    for c in CONTRASTS:
        pairs, used = [], set()
        for a, b in c["sub"]:
            for w in sorted(seen):
                for v in swap(w, a, b, c["pos"]):
                    if v == w or v not in seen:
                        dropped += 1
                        continue
                    key = tuple(sorted([w, v]))
                    if key in used:
                        continue
                    used.add(key)
                    pairs.append({"a": key[0], "b": key[1],
                                  "at": sorted(seen[key[0]] | seen[key[1]])[:3]})
        # **여덟 쌍이 한 판이다.** 규칙서 3.1 이 그렇게 적었다. 모자라면 모자란 대로 낸다.
        groups.append({"id": c["id"], "name": c["name"], "why": c["why"],
                       "pos": c["pos"], "grade": "B",
                       "pairs": pairs[:8], "found": len(pairs)})
    ok = [g for g in groups if len(g["pairs"]) >= 2]
    obj = {
        "note": "거울 판의 최소대립쌍. 낱말은 52과 대본에 있는 것만 쓴다. "
                "손으로 안 고친다. scripts/derive_pairs.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "쌍이 정말 소리로 최소대립인지는 내가 못 잰다. "
                    "철자로 뽑고 자리를 지켰을 뿐이다. 사람이 확인한다.",
        "generator": "scripts/derive_pairs.py",
        "groups": groups,
    }
    text = json.dumps(obj, ensure_ascii=False, indent=2) + "\n"
    io.open(os.path.join(OUT, "pairs.json"), "w", encoding="utf-8").write(text)
    io.open(os.path.join(OUT, "pairs.js"), "w", encoding="utf-8").write(
        "window.ENG2P_PAIRS=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")
    tot = sum(len(g["pairs"]) for g in groups)
    print("out/data/pairs.json / 대립 %d꼴 중 쓸 만한 것 %d꼴 / 쌍 %d개 "
          "(대본 낱말 %d종에서)" % (len(groups), len(ok), tot, len(seen)))
    for g in groups:
        if len(g["pairs"]) < 2:
            print("  [모자람] %s: %d쌍뿐이다. 대본에 짝이 없다"
                  % (g["name"], len(g["pairs"])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
