#!/usr/bin/env python3
"""전달 놀이가 쓸 **줄 고르기**를 뽑는다. T267

`docs/play_rules.md` 3.4 가 쓰는 것을 "오늘 과의 대본 한 줄. **있다**" 라고 적었다.
줄은 있다. 그런데 **아무 줄이나 되는 것이 아니다.**

    A가 소리를 듣는다. B에게 말로 옮긴다. B가 적는다. 원문과 견준다.

한 번 듣고 통째로 옮겨야 한다. 그러면 줄에 조건이 붙는다.

| 조건 | 왜 |
|---|---|
| 너무 짧으면 안 된다 | 세 낱말은 안 틀어진다. 틀어지는 것이 이 판의 산출물이다 |
| 너무 길면 안 된다 | 한 번 듣고 못 담는다. 그러면 기억력 시험이 된다 |
| 소리 자리를 알아야 한다 | 앱이 그 줄만 들려줘야 한다 |

셋째가 이 파일이 있는 이유다. 소리 자리는 `out/data/cues.js` 에 있는데
**그것은 어림이다.** 실측이 아니라 과의 길이를 글자 수로 나눈 것이고 쉼을 안 센다.
그래서 이 자료도 그만큼만 믿을 수 있다.

## 등급

    A   그 줄이 52과 대본에 있다                    셀 수 있다
    A   낱말이 몇인가                               셀 수 있다
    B   **그 줄이 소리의 몇 초에 있다**             어림이다 (`derive_cues.py`)

세 번째 때문에 파일이 B등급이다. 앱이 조금 일찍 끊거나 늦게 시작할 수 있다.
**화면이 되감기와 다시 듣기를 줘야 한다.** 어림을 어림이라고 하고 사람이 맞춘다.

쓰는 법:
    python3 scripts/derive_relay.py

결과: out/data/relay.json 과 relay.js
규격: docs/play_rules.md 3.4, docs/round.md 13장, docs/audio_timing.md
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
CUE = os.path.join(OUT, "cues.js")
LEN = os.path.join(OUT, "audiolen.js")

# 한 판이 세 바퀴다 (규칙서 3.4 끝 조건). 넉넉히 두고 화면이 골라 쓴다.
PER = 6
# 한 번 듣고 옮길 수 있는 길이. **위아래를 다 건다.**
MIN_WORDS = 6
MAX_WORDS = 14


def load(path):
    raw = io.open(path, encoding="utf-8").read()
    return json.loads(raw[raw.index("=") + 1:].rstrip().rstrip(";"))


def main():
    for p in (SRC, CUE, LEN):
        if not os.path.exists(p):
            print("[실패] %s 가 없다" % p)
            return 1
    tr, cue, alen = load(SRC), load(CUE), load(LEN)
    lens = {}
    for k, v in (alen.get("items") or {}).items():
        lens[k] = v if isinstance(v, (int, float)) else (v or {}).get("sec")

    out, thin = {}, []
    for mid in sorted(tr["items"]):
        ls = tr["items"][mid]
        at = (cue.get("items") or {}).get(mid) or []
        total = lens.get(mid)
        got = []
        for li, ln in enumerate(ls):
            body = re.sub(r"^[A-Z][A-Za-z .'-]{0,20}:\s*", "", ln)
            words = re.findall(r"[A-Za-z']+", body)
            if not (MIN_WORDS <= len(words) <= MAX_WORDS):
                continue
            if li >= len(at):
                continue
            start = at[li]
            # 끝은 다음 줄의 시작이다. 마지막 줄은 과의 끝까지다.
            end = at[li + 1] if li + 1 < len(at) else total
            if end is None or end <= start:
                continue
            got.append({"li": li, "n": len(words),
                        "at": round(float(start), 2),
                        "dur": round(float(end) - float(start), 2)})
        # **가운데 길이를 먼저 준다.** 위아래 끝은 조건을 겨우 채운 줄이다.
        mid_n = (MIN_WORDS + MAX_WORDS) / 2.0
        got.sort(key=lambda x: (abs(x["n"] - mid_n), x["li"]))
        out[mid] = got[:PER]
        if len(out[mid]) < 3:
            thin.append("%s(%d)" % (mid, len(out[mid])))

    obj = {
        "note": "전달 놀이가 쓸 줄. 대본에서 고르고 소리 자리는 어림이다. "
                "손으로 안 고친다. scripts/derive_relay.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "그 줄이 대본에 있다는 것과 낱말이 몇인가는 A등급이다 "
                    "(셀 수 있다). 그 줄이 소리의 몇 초에 있다는 것은 B등급이다. "
                    "cues.js 가 어림이고 쉼을 안 센다. 화면이 되감기를 준다.",
        "warn": "소리 자리가 어림이라 조금 일찍 끊기거나 늦게 시작할 수 있다. "
                "다시 듣기로 맞춘다.",
        "generator": "scripts/derive_relay.py",
        "per": PER, "minWords": MIN_WORDS, "maxWords": MAX_WORDS,
        "items": out,
    }
    text = json.dumps(obj, ensure_ascii=False, indent=2) + "\n"
    io.open(os.path.join(OUT, "relay.json"), "w", encoding="utf-8").write(text)
    io.open(os.path.join(OUT, "relay.js"), "w", encoding="utf-8").write(
        "window.ENG2P_RELAY=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")
    tot = sum(len(v) for v in out.values())
    secs = [x["dur"] for v in out.values() for x in v]
    print("out/data/relay.json / 과 %d개 / 줄 %d개 / 낱말 %d~%d / "
          "한 줄 %.1f초쯤 (어림)"
          % (len(out), tot, MIN_WORDS, MAX_WORDS,
             sum(secs) / len(secs) if secs else 0))
    if thin:
        print("  [모자람] 세 바퀴를 못 채운 과 %d개: %s"
              % (len(thin), " ".join(thin[:8])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
