#!/usr/bin/env python3
"""말 겹치기 판이 쓸 **겹칠 두 줄**을 대본에서 뽑는다. T303

규칙서 10.3 이 쓰는 것을 "오늘 과의 대본 줄 넷. **있다**" 라고 적었다.
대본은 있다. 그런데 **넷이 한 줄씩 넷인지 두 줄씩 넷인지**가 안 적혀 있다.

## 도는 차례가 그것을 정한다

    신호에 맞춰 둘이 **일부러 동시에 말한다.** 그다음에 누가 양보하고 어떻게 잇는지를 본다

둘이 같은 줄을 동시에 말하면 그것은 겹침이 아니라 **합창**이다.
양보할 것도 이을 것도 없다. 한 줄씩 넷으로 읽으면 이 판이 안 선다.

각자 다른 줄을 들고 동시에 말해야 겹친다. 그래서 **두 줄이 한 회다.**
넉 회면 여덟 줄이다.

## 이웃한 두 줄을 쓴다

아무 두 줄이나 겹치면 이을 것이 없다. **대본에서 이웃한 두 줄**을 쓴다.
원래는 차례로 오가는 말이고 그것을 일부러 동시에 내는 것이 이 판이다.
양보하고 나면 원래 차례로 돌아간다. 이을 자리가 거기 있다.

화자가 서로 달라야 한다. 같은 사람이 두 줄을 이어 말한 자리는 오가는 말이 아니다.

## 등급은 A다

줄이 대본 그대로다. 지어낸 영어가 없다.
"이 둘이 이웃한 다른 화자의 말이다" 는 세면 나온다. 둘이 한 문장과 같다 (T273).

쓰는 법:
    python3 scripts/derive_clash.py

결과: out/data/clash.json 과 clash.js
규격: docs/play_rules.md 10.3
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "out", "data")
RULES = os.path.join(ROOT, "docs", "play_rules.md")

# **넉** 이 있다. 규칙서가 "넉 줄을 돌면" 이라고 적었다.
# 세 와 서, 네 와 넉이 세는 것에 따라 갈린다. 한 꼴만 알면 못 찾는다.
KO = {"한": 1, "두": 2, "세": 3, "서": 3, "네": 4, "넉": 4, "다섯": 5,
      "여섯": 6, "일곱": 7, "여덟": 8, "아홉": 9, "열": 10}
KOPAT = "|".join(sorted(KO, key=len, reverse=True))

# 너무 짧은 줄은 겹쳐도 겹친 티가 안 난다. 낱말 넷은 한 숨에 나가는 길이다.
MINW = 4

SPK = re.compile(r"^([A-Z][A-Za-z .'-]{0,20}):\s*(.+)$")


def plain(s):
    return (s or "").replace("**", "")


def chapter(text, head, tail):
    i = text.find(head)
    if i < 0:
        return ""
    j = text.find(tail, i + len(head))
    return text[i:j if j > 0 else len(text)]


def spec():
    if not os.path.exists(RULES):
        return None, ["%s 가 없다" % RULES]
    seg = chapter(io.open(RULES, encoding="utf-8").read(),
                  "### 10.3 말 겹치기", "## 11")
    m = re.search(r"\|\s*끝 조건\s*\|.*?(%s)\s*줄을 돌면" % KOPAT, seg)
    if not m:
        return None, ["규칙서 10.3 의 끝 조건에서 몇 회를 도는지 못 찾았다"]
    return KO[m.group(1)], []


def main():
    rounds, bad = spec()
    tf = os.path.join(OUT, "transcripts.js")
    if not os.path.exists(tf):
        bad.append("out/data/transcripts.js 가 없다")
    if bad:
        for b in bad:
            print("[실패] " + b)
        return 1

    s = io.open(tf, encoding="utf-8").read()
    items = json.loads(s[s.index("=") + 1:].rstrip().rstrip(";"))["items"]

    out, thin = {}, []
    for mid in sorted(items):
        rows = []
        for li, line in enumerate(items[mid]):
            m = SPK.match(line.strip())
            rows.append((li, m.group(1), plain(m.group(2))) if m
                        else (li, None, plain(line.strip())))
        pairs = []
        for a, b in zip(rows, rows[1:]):
            if not a[1] or not b[1] or a[1] == b[1]:
                continue
            if len(a[2].split()) < MINW or len(b[2].split()) < MINW:
                continue
            pairs.append({"a": {"who": a[1], "line": a[2], "li": a[0]},
                          "b": {"who": b[1], "line": b[2], "li": b[0]}})
        # 앞에서부터 넉 회. **고르지 않는다.** 대본 차례가 곧 이 판의 차례다
        got = pairs[:rounds]
        if len(got) < rounds:
            thin.append("%s(%d)" % (mid, len(got)))
        out[mid] = got

    have = [k for k in out if out[k]]
    if not have:
        print("[실패] 겹칠 두 줄을 하나도 못 뽑았다")
        return 1

    obj = {
        "note": "말 겹치기가 쓸 두 줄. 대본에서 이웃한 다른 화자의 줄을 그대로 쓴다. "
                "손으로 안 고친다. scripts/derive_clash.py 를 다시 돌린다.",
        "grade": "A",
        "gradeWhy": "줄이 52과 대본 그대로다. 지어낸 영어가 없다. "
                    "이 둘이 이웃한 다른 화자의 말이라는 것은 세면 나온다.",
        "generator": "scripts/derive_clash.py",
        "source": "out/data/transcripts.js, docs/play_rules.md 10.3",
        "rounds": rounds, "minWords": MINW,
        "items": out,
    }
    io.open(os.path.join(OUT, "clash.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "clash.js"), "w", encoding="utf-8").write(
        "window.ENG2P_CLASH=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    n = sum(len(v) for v in out.values())
    if thin:
        print("  [모자람] %d회를 못 채운 과 %d개: %s"
              % (rounds, len(thin), " ".join(thin)))
    print("out/data/clash.json / 과 %d개 / 두 줄 %d회 / 한 회가 두 줄이다 / "
          "낱말 %d개 넘는 줄만 / **대본 그대로다**"
          % (len(out), n, MINW))
    return 0


if __name__ == "__main__":
    sys.exit(main())
