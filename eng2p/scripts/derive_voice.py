#!/usr/bin/env python3
"""되돌아보기 녹음이 읽을 줄을 대본에서 뽑는다. T333

`docs/growth.md` 2장이 조건 셋을 적었다.

    낱말 8~14개        3~5초다. 짧으면 못 견주고 길면 안 읽는다
    첫 과에 있다       1주에 읽어야 하는데 그때는 첫 과까지만 배웠다
    자음군과 강세가 있다  Q1 소리 트랙이 그것을 본다. 늘면 거기서 는다

셋째를 어떻게 재나. **블록 2 근거표가 그 답을 갖고 있다.**
CLAUDE.md 의 근거표가 한국어 화자의 함정 다섯을 적었고 그중 둘이
자음군(모음 삽입)과 강세 박자다. 그 둘이 걸리는 줄을 고른다.

    자음군   낱말 안에 자음 둘이 붙어 있다 (str, spl, nd, st ...)
    음절 수  낱말이 여러 음절이면 강세가 어디 있는지가 드러난다

**지어낸 영어가 없다.** 대본 줄 그대로다 (A등급).

## 무작위를 안 쓴다

조건에 맞는 줄이 여럿이면 **첫째를 고른다.** 대본 차례가 곧 이 파일의 차례다.
다시 뽑아도 같은 줄이 나온다.

쓰는 법:
    python3 scripts/derive_voice.py

결과: out/data/voice.json 과 voice.js
규격: docs/growth.md 2장과 3장
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "out", "data")
DOC = os.path.join(ROOT, "docs", "growth.md")

WORD = re.compile(r"[A-Za-z']+")
# 자음군. 모음 없이 자음이 둘 넘게 붙은 자리
CLUSTER = re.compile(r"[bcdfgklmnprstvwxz]{2,}", re.I)
VOWEL = re.compile(r"[aeiouy]+", re.I)


def spec():
    """읽을 줄의 낱말 수를 문서에서 읽는다. **문서가 원본이다** (T279)."""
    if not os.path.exists(DOC):
        return None, ["%s 가 없다" % DOC]
    m = re.search(r"낱말 (\d+)~(\d+)개", io.open(DOC, encoding="utf-8").read())
    if not m:
        return None, ["growth.md 2장에서 낱말 수를 못 찾았다"]
    return (int(m.group(1)), int(m.group(2))), []


def weeks():
    """언제 읽나. **문서 3장 표가 원본이다.**"""
    s = io.open(DOC, encoding="utf-8").read()
    i = s.find("## 3. 언제 읽나")
    j = s.find("## 4.", i)
    out = []
    for line in s[i:j].split("\n"):
        line = line.strip()
        if not line.startswith("|") or "---" in line:
            continue
        c = [x.strip() for x in line.strip("|").split("|")]
        if len(c) >= 2 and re.match(r"^\d+$", c[1]):
            out.append({"week": int(c[1]), "when": c[0]})
    return out


def syll(w):
    """음절 수 어림. **어림이다.** 모음 덩어리를 센다."""
    return max(1, len(VOWEL.findall(w)))


def main():
    lo_hi, bad = spec()
    ws = weeks() if os.path.exists(DOC) else []
    if not ws:
        bad.append("growth.md 3장에서 읽을 주를 못 찾았다")
    tf = os.path.join(OUT, "transcripts.js")
    if not os.path.exists(tf):
        bad.append("out/data/transcripts.js 가 없다")
    if bad:
        for b in bad:
            print("[실패] " + b)
        return 1
    lo, hi = lo_hi

    s = io.open(tf, encoding="utf-8").read()
    items = json.loads(s[s.index("=") + 1:].rstrip().rstrip(";"))["items"]
    first = sorted(items)[0]

    pick, seen = None, 0
    for li, line in enumerate(items[first]):
        t = re.sub(r"^[A-Z][A-Za-z .'-]{0,20}:\s*", "", line).strip()
        ws_ = WORD.findall(t)
        if not (lo <= len(ws_) <= hi):
            continue
        seen += 1
        cl = [w for w in ws_ if CLUSTER.search(w)]
        multi = [w for w in ws_ if syll(w) >= 2]
        if not cl or not multi:
            continue
        pick = {"mid": first, "li": li, "line": t, "words": len(ws_),
                "clusters": cl[:5], "multi": multi[:5]}
        break

    if not pick:
        print("[실패] 조건에 맞는 줄을 못 찾았다. 낱말 %d~%d 인 줄이 %d개였다"
              % (lo, hi, seen))
        return 1

    obj = {
        "note": "되돌아보기 녹음이 읽을 줄. 52과 대본 그대로다. "
                "손으로 안 고친다. scripts/derive_voice.py 를 다시 돌린다.",
        "grade": "A",
        "gradeWhy": "대본 한 줄 그대로다. 지어낸 영어가 없다. "
                    "자음군과 여러 음절 낱말이 있다는 것은 세면 나온다.",
        "generator": "scripts/derive_voice.py",
        "source": "out/data/transcripts.js, docs/growth.md 2장과 3장",
        "minWords": lo, "maxWords": hi,
        "at": pick,
        "weeks": ws,
        # **앱이 소리를 안 들고 있는다.** growth.md 4장이 그 셈이다
        "keepsAudio": False,
        "keepsAudioWhy": "저장소에 음성 파일을 안 넣는 것이 절대 규칙이고 "
                         "1년치 소리를 브라우저에 맡기는 것도 같은 위험이다. "
                         "앱은 언제 무엇을 읽었는지와 파일 이름만 적는다.",
    }
    io.open(os.path.join(OUT, "voice.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "voice.js"), "w", encoding="utf-8").write(
        "window.ENG2P_VOICE=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    print("out/data/voice.json / %s %d째 줄 / 낱말 %d / 자음군 %d / 여러 음절 %d / "
          "읽는 때 %d번 / **대본 그대로다**"
          % (pick["mid"], pick["li"], pick["words"], len(pick["clusters"]),
             len(pick["multi"]), len(ws)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
