#!/usr/bin/env python3
"""내 소리는 네가 판의 **듣는 쪽 지시**를 뽑는다. T264

`docs/roadmap.md` 12.14 가 이 턴을 "녹음 넘기기" 라고 적어 뒀다. **그 이름이 낡았다.**
그 표는 T257 에 썼고 규칙서는 T202~T204 에 이 판을 이렇게 정했다.

    **녹음을 안 쓴다.** 같은 방에 있으면 상대가 그 자리에서 듣는다.

그러면 이 판에서 없는 것은 녹음이 아니다. 규칙서 3.3 이 그것도 적어 뒀다.

    듣는 쪽 화면에 뜨는 것이 이 판의 핵심이다. "잘 들어 보세요" 가 아니라
    **"끝소리가 붙었는지 보세요" 처럼 무엇을 들을지를 준다.** 안 주면 둘 다 모른다.

**그 지시가 없다.** 이 파일이 그것을 만든다.

## 지어내지 않는다

지시의 알맹이는 **CLAUDE.md 블록 2 근거표**에서 온다. 그 표 안은 A등급이다.
표에 없는 현상은 안 만든다. 다섯 중 넷을 쓴다.

    모음 삽입        자음이 둘 붙은 자리. 사이에 '으' 를 넣는가
    /s/ 구개음화     /i/ 앞의 s. '시' 로 내는가
    dark l 곤란      끝이나 자음 앞의 l
    음절 박자 전이   긴 줄. 다 같은 길이로 또박또박 읽는가

다섯째 **표기 유도 오류**는 안 쓴다. 그것은 **적는** 자리에서 나는 일이고
이 판은 듣는 판이다. 안 쓰는 것을 적어 두는 것이 쓰는 것만큼 중요하다.

## 등급이 둘이다

T261 과 같은 자리다. 주장이 하나가 아니다.

    A   그 현상이 한국어 화자에게 일어난다      근거표에 있다
    B   **이 줄의 이 낱말이 그 자리다**         철자로 찾았다. 소리를 못 잰다

그래서 파일이 B등급이라고 적는다.

쓰는 법:
    python3 scripts/derive_listen.py

결과: out/data/listen.json 과 listen.js
규격: docs/play_rules.md 3.3, CLAUDE.md 블록 2 근거표
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

# 한 판이 여섯 줄이다 (규칙서 3.3 끝 조건). 넉넉히 두고 화면이 골라 쓴다.
PER = 9
MIN_WORDS = 4

# 자음 글자. 소리가 아니라 철자다. **그래서 이 찾기가 B등급이다.**
CONS = "bcdfghjklmnpqrstvwxz"
# 자음 둘이 붙었다고 안 세는 짝. 한 소리로 나거나 한 자가 안 난다.
DIGRAPH = ("ch", "sh", "th", "ph", "wh", "gh", "ck", "ng", "qu", "kn", "wr")

# 지시 넷. **알맹이는 근거표에서 오고 말투만 내가 쓴다.**
# `why` 는 근거표의 원인 칸이다. 그대로 옮긴다. 바꾸면 A등급이 아니다.
#
# **여기에 마크다운을 안 쓴다.** 이 글은 문서로 안 가고 화면으로 간다.
# 화면은 글자를 막아 그리므로 `**` 가 별표 두 개로 그대로 뜬다. T265 에 실제로 떴다.
KINDS = {
    "cluster": {
        "name": "자음이 붙은 자리",
        "why": "한국어 음절 구조가 자음군을 허용하지 않음",
        "say": "한국어는 자음을 모음 없이 못 이어서 사이에 '으' 를 넣게 된다. "
               "넣었는지 듣는다. 두 자음이 붙어서 났으면 짚을 것이 없다.",
    },
    "si": {
        "name": "/i/ 앞의 s",
        "why": "/i/ 앞에서 한국어 구개음화 규칙 전이",
        "say": "한국어는 /i/ 앞의 ㅅ 을 '시' 로 낸다. 그 규칙이 영어로 옮겨 온다. "
               "'시' 로 났는지 듣는다. 아니면 짚을 것이 없다.",
    },
    "darkl": {
        "name": "끝이나 자음 앞의 l",
        "why": "한국어 유음과 불일치. 위치 무관",
        "say": "한국어 유음은 하나뿐이라 이 자리의 l 이 안 잡힌다. "
               "혀끝이 붙었는지 듣는다. 붙어서 났으면 짚을 것이 없다.",
    },
    "beat": {
        "name": "긴 줄의 박자",
        "why": "한국어는 음절 박자, 영어는 강세 박자",
        "say": "한국어는 음절마다 같은 길이로 간다. 영어는 강한 자리만 길다. "
               "또박또박 다 같은 길이로 났는지 듣는다. 길고 짧음이 있었으면 "
               "짚을 것이 없다.",
    },
}


def lines():
    raw = io.open(SRC, encoding="utf-8").read()
    obj = json.loads(raw[raw.index("=") + 1:].rstrip().rstrip(";"))
    out = {}
    for mid, ls in obj["items"].items():
        out[mid] = [(i, re.sub(r"^[A-Z][A-Za-z .'-]{0,20}:\s*", "", ln))
                    for i, ln in enumerate(ls)]
    return out


def cluster(w):
    """자음군이 있나. **낱말의 첫머리와 끝만 본다.**

    근거표가 말하는 것은 자음군이다. 한국어가 못 허용하는 그 자리는
    음절 첫머리와 끝이다. 낱말 가운데의 자음 둘은 음절이 갈리는 자리라
    한국어로도 그냥 난다. 가운데까지 세면 거의 모든 낱말이 걸린다.
    실제로 1242줄 중 거의 다가 이것으로 뽑혔다 (T264).

    같은 글자가 겹친 것도 뺀다. `Anna` 의 `nn` 은 자음군이 아니라 한 소리다.
    """
    # **첫머리는 첫 글자가 자음일 때만 이어 본다.** 그래야 `street` 의 `str` 을 잡고
    # `acting` 의 `ct` 를 안 잡는다. 뒤엣것은 음절이 갈리는 자리(ac-ting)라
    # 한국어로도 그냥 난다. 모음으로 시작하는 낱말에서 자리 1을 보면 그것이 걸린다.
    for i in (0, 1):
        if i == 1 and w[0] not in CONS:
            break
        pair = w[i:i + 2]
        if len(pair) < 2:
            break
        if pair[0] in CONS and pair[1] in CONS and pair not in DIGRAPH \
                and pair[0] != pair[1]:
            return True
    pair = w[-2:]                          # 끝 두 자리
    if len(pair) == 2 and pair[0] in CONS and pair[1] in CONS \
            and pair not in DIGRAPH and pair[0] != pair[1]:
        return True
    return False


def darkl(w):
    """끝이나 자음 앞의 l.

    **겹친 `ll` 은 안 센다.** `hello` 의 `ll` 은 한 소리고 뒤에 모음이 온다.
    앞엣 l 만 보면 뒤가 자음이라 걸린다. 실제로 `Hello` 가 뽑혔다 (T264).
    """
    for i, c in enumerate(w):
        if c != "l":
            continue
        if i + 1 < len(w) and w[i + 1] == "l":
            continue
        if i == len(w) - 1 or w[i + 1] in CONS:
            return True
    return False


def si(w):
    """/i/ 앞의 s. **낱말 첫머리만 본다.**

    가운데의 `si` 는 s 가 /z/ 로 나는 자리가 많다. `busy` 와 `visit` 이 그렇다.
    `sea` 도 뺐다. `season` 은 맞는데 `search` 는 아니고 철자로는 안 갈린다.
    **철자로 못 가르는 것은 안 넣는다.** 첫머리 `si` 와 `see` 만 남긴다.
    """
    if re.match(r"^si[bcdfghjklmnpqrstvwxz]e$", w):
        return False      # `side` 와 `size`. 끝의 e 가 앞 모음을 길게 만든다
    return w.startswith("si") or w.startswith("see")


def pick(body, low_seen, used):
    """이 줄에서 무엇을 들으라고 할까. **한 줄에 하나만 준다.**

    둘을 주면 듣는 쪽이 둘을 다 듣다가 하나도 못 듣는다.

    **고르는 차례를 고정하지 않는다.** 자음군을 먼저 보게 두면 그것만 나온다.
    한 과가 여섯 줄인데 여섯 줄이 다 같은 것을 들으면 셋째 줄부터는 안 듣는다.
    그래서 **그 과에서 덜 나온 갈래를 먼저 준다.**
    """
    words = re.findall(r"[A-Za-z]+", body)
    low = [w.lower() for w in words]
    can = []
    for kind, fn in (("cluster", cluster), ("si", si), ("darkl", darkl)):
        for i, w in enumerate(low):
            # 이름은 안 쓴다. 한 번도 소문자로 안 나오면 이름으로 본다 (T261).
            if len(w) < 3 or (w not in low_seen and words[i][:1].isupper()):
                continue
            if fn(w):
                can.append((kind, words[i]))
                break
    if len(words) >= 8:
        can.append(("beat", ""))
    if not can:
        return None
    can.sort(key=lambda x: used.get(x[0], 0))
    return {"kind": can[0][0], "word": can[0][1]}


def main():
    if not os.path.exists(SRC):
        print("[실패] %s 가 없다" % SRC)
        return 1
    all_lines = lines()
    # 이름 거르개. T261 과 같다. 한 번도 소문자로 안 나오면 이름으로 본다.
    low_seen = set()
    for rows in all_lines.values():
        for _, body in rows:
            for w in re.findall(r"[A-Za-z]+", body):
                if w[0].islower():
                    low_seen.add(w.lower())
    out, thin, seen = {}, [], {}
    for mid in sorted(all_lines):
        got, used = [], {}
        for li, body in all_lines[mid]:
            words = re.findall(r"[A-Za-z]+", body)
            if len(words) < MIN_WORDS:
                continue
            p = pick(body, low_seen, used)
            if not p:
                continue
            p["li"] = li
            got.append(p)
            used[p["kind"]] = used.get(p["kind"], 0) + 1
        for p in got[:PER]:
            seen[p["kind"]] = seen.get(p["kind"], 0) + 1
        out[mid] = got[:PER]
        if len(out[mid]) < 6:
            thin.append("%s(%d)" % (mid, len(out[mid])))

    obj = {
        "note": "내 소리는 네가 판의 듣는 쪽 지시. 알맹이는 CLAUDE.md 블록 2 "
                "근거표에서 온다. 손으로 안 고친다. scripts/derive_listen.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "그 현상이 한국어 화자에게 일어난다는 것은 A등급이다 "
                    "(블록 2 근거표). 이 줄의 이 낱말이 그 자리라는 것은 B등급이다. "
                    "철자로 찾았고 소리는 못 쟀다. 사람이 확인한다.",
        "unused": "표기 유도 오류는 안 쓴다. 적는 자리에서 나는 일이고 이 판은 듣는 판이다.",
        "generator": "scripts/derive_listen.py",
        "kinds": KINDS,
        "per": PER,
        "items": out,
    }
    text = json.dumps(obj, ensure_ascii=False, indent=2) + "\n"
    io.open(os.path.join(OUT, "listen.json"), "w", encoding="utf-8").write(text)
    io.open(os.path.join(OUT, "listen.js"), "w", encoding="utf-8").write(
        "window.ENG2P_LISTEN=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")
    tot = sum(len(v) for v in out.values())
    print("out/data/listen.json / 과 %d개 / 줄 %d개 / 지시 %d갈래 (%s)"
          % (len(out), tot, len(KINDS),
             " ".join("%s %d" % (KINDS[k]["name"], seen.get(k, 0)) for k in KINDS)))
    if thin:
        print("  [모자람] 여섯 줄을 못 채운 과 %d개: %s"
              % (len(thin), " ".join(thin[:8])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
