#!/usr/bin/env python3
"""못 알아들은 척 판이 쓸 **되묻기 강도 세 단**을 만든다. T297

규칙서 10.1 이 쓰는 것을 "repair형 카드 + **되묻기 강도 세 단. 없음**" 이라고 적었다.
`play_data.md` 5.2 는 "세 단을 새로 정하는 것이 아니라 **95장을 세 단으로 가르는
일**이다" 라고 적었다.

## 95장을 가르는 일이 아니었다

repair형 95장을 열어 세어 봤다. **되묻기를 다루는 것이 13장이다.**
나머지 여든두 장은 소리를 짚거나 뭉갠 것을 찾는 카드다.
가를 것이 95장이 아니라 13장이고, 13장을 셋으로 가르면 한 단에 넷이다.

**그래서 카드에서 안 가른다.** 대본에서 뽑는다.

## 세 단은 규칙서가 이미 적어 뒀다

10.1 의 줄글이 이렇게 적었다.

    다시 말해 달라는 것과 한 낱말만 짚는 것과 알아들은 데까지 확인하는 것이 다르다

셋을 여기서 읽는다. **새로 짓지 않는다.** 못 찾으면 실패로 낸다.

## 보기는 대본에 있는 줄만 쓴다

판의 못 했을 때 칸이 "되묻는 말이 안 나오면 **화면이 그 강도의 보기를 보여 준다**" 다.
그 보기를 내가 지으면 이 과정의 1순위 규칙을 어긴다.

52과 대본에서 그 꼴에 맞는 줄을 **그대로** 가져온다.
과와 줄 번호를 같이 담아 어디서 왔는지가 남는다.

**줄이 대본에 있다는 것은 A등급이고 그 줄이 그 단이라는 것은 B등급이다.**
꼴로 갈랐고 꼴이 뜻을 다 담지 못한다.

쓰는 법:
    python3 scripts/derive_reask.py

결과: out/data/reask.json 과 reask.js
규격: docs/play_rules.md 10.1, docs/play_data.md 5.2
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

# 단마다 어떤 꼴을 찾나. **이 표가 이 파일에서 유일하게 내 판단이다.**
# 이름은 문서에서 오고 꼴은 여기 있다. 이름이 바뀌면 여기서 못 찾고 실패로 난다.
#
# 약한 것에서 센 것으로 놓았다. 기준서 13.1 이 막는 것이 "제일 센 것만 쓰기" 라
# 어느 쪽이 센지가 이 판의 값이다. 확인은 상대의 말을 되읽는 것이라 제일 가볍고
# 전체를 다시 말해 달라는 것은 상대의 말을 통째로 무르는 것이라 제일 무겁다.
FORMS = {
    "알아들은 데까지 확인하": [
        r"\b(do |did )?you mean\b",
        r"\byou said\b",
    ],
    "한 낱말만 짚": [
        # 되읽는 물음. **앞에 낱말이 있어야 한다.** 맨 "What?" 은 전체를 무르는 것이다
        r"\b\w+[ ,]+(what|who|where|when|which|whose)\?",
        r"\bwhat kind of\b",
        r"\bwhich one\b",
    ],
    "다시 말해 달라": [
        r"\bpardon\b",
        r"\bcome again\b",
        r"\bsay (that )?again\b",
        r"\bone more time\b",
        # 사과와 가르려고 **물음표를 요구한다**
        r"\b(sorry|excuse me)\s*\?",
    ],
}

# 이 말들은 되묻기가 아니다. 꼴은 맞는데 뜻이 다르다. **눈으로 보고 뺐다.**
# 뺀 자리를 여기 적어 둔다. 안 적으면 다음에 왜 빠졌는지 모른다.
DROP = {
    "One more time.":
        "혼잣말이다. 상대에게 다시 말해 달라는 것이 아니다",
    "Let’s repeat the first story.":
        "진행자의 지시다. 못 알아들어서 하는 말이 아니다",
    "I will try one more time, Anna.":
        "자기가 다시 해 보겠다는 말이다",
    "Excuse me?":
        "말을 거는 말이다. 다시 말해 달라는 것이 아니다",
    "I want to see an interesting museum but I don’t know which one.":
        "자기 말이다. 상대에게 묻는 것이 아니다",
}

# 한 되묻기는 짧다. **이보다 긴 것은 되묻기에 다른 말이 붙은 것이다.**
# 붙은 채로 화면에 띄우면 두 사람이 그 뒤까지 따라 읽는다.
MAXW = 8


def plain(s):
    return (s or "").replace("**", "")


def tiers():
    """규칙서 10.1 의 줄글에서 세 단의 이름을 읽는다."""
    if not os.path.exists(RULES):
        return [], ["%s 가 없다" % RULES]
    doc = io.open(RULES, encoding="utf-8").read()
    i = doc.find("### 10.1 못 알아들은 척")
    j = doc.find("### 10.2", i + 1) if i >= 0 else -1
    seg = doc[i:j] if i >= 0 else ""
    m = re.search(r"되묻기는 하나가 아니다\.\s*\n(.+?)이 다르다", seg, re.S)
    if not m:
        return [], ["규칙서 10.1 에서 되묻기 세 단을 적은 줄을 못 찾았다"]
    parts = [x.strip() for x in re.split(r"과\s+", m.group(1).replace("\n", " "))]
    parts = [re.sub(r"\s+", " ", x).strip() for x in parts if x.strip()]
    if len(parts) != 3:
        return [], ["규칙서 10.1 의 그 줄에서 셋을 못 갈랐다: %d개" % len(parts)]
    return parts, []


def main():
    said, bad = tiers()
    tf = os.path.join(OUT, "transcripts.js")
    if not os.path.exists(tf):
        bad.append("out/data/transcripts.js 가 없다")
    if bad:
        for b in bad:
            print("[실패] " + b)
        return 1

    s = io.open(tf, encoding="utf-8").read()
    items = json.loads(s[s.index("=") + 1:].rstrip().rstrip(";"))["items"]

    # 문서가 적은 셋과 이 파일이 아는 꼴 셋을 **이름으로 잇는다.**
    # 문서를 고치면 여기서 못 잇고 실패로 난다. 조용히 안 넘어간다.
    order = list(FORMS)
    link = []
    for name in order:
        hit = [x for x in said if name.replace(" ", "") in x.replace(" ", "")]
        if len(hit) != 1:
            print("[실패] 규칙서가 적은 셋에서 '%s' 를 못 찾았다: %s"
                  % (name, " / ".join(said)))
            return 1
        link.append((name, hit[0]))

    steps, dropped = [], []
    for n, (name, doctext) in enumerate(link, 1):
        seen, rows = set(), []
        for mid in sorted(items):
            for li, line in enumerate(items[mid]):
                one = re.sub(r"^[A-Z][A-Za-z .'-]{0,20}:\s*", "", line.strip())
                # **줄이 아니라 문장을 쓴다.** 되묻기 뒤에 딴말이 붙어 있는 줄이
                # 많다. "Do you mean drive a race car? It's really hard to ..."
                # 통째로 띄우면 두 사람이 뒤까지 따라 읽는다.
                for one in re.split(r"(?<=[.?!])\s+", one):
                    one = one.strip()
                    if not one:
                        continue
                    if not any(re.search(p, one, re.I) for p in FORMS[name]):
                        continue
                    if one in DROP:
                        dropped.append((one, DROP[one]))
                        continue
                    # **묻는 말만 쓴다.** 되묻기는 묻는 것이다.
                    # 서술문에 같은 꼴이 들어간 것은 따지는 말이거나 제 말이다
                    # ("You said in your ad it was a perfect product.").
                    if not one.endswith("?"):
                        continue
                    if len(one.split()) > MAXW:
                        continue
                    if one in seen:
                        continue
                    seen.add(one)
                    rows.append({"mid": mid, "li": li, "line": plain(one)})
        # **화면에 뜨는 이름은 문서가 적은 그대로다.** 여기 있는 이름은 잇는 열쇠다
        steps.append({"n": n, "name": plain(doctext), "key": plain(name),
                      "lines": rows})

    # **보기가 없는 단이 있을 수 있다.** 그것을 실패로 안 낸다.
    # 없는 것을 채우려면 지어내야 하고 그것이 이 과정의 1순위 규칙이 막는 일이다.
    # 대신 없다고 적어 두고 화면이 그 말을 한다. 없는 것도 재료다.
    empty = [x["key"] for x in steps if not x["lines"]]

    obj = {
        "note": "되묻기 강도 세 단. 이름은 docs/play_rules.md 10.1 에서, "
                "보기는 52과 대본에서 그대로 온다. 지어낸 영어가 없다. "
                "손으로 안 고친다. scripts/derive_reask.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "줄이 대본에 있다는 것은 A등급이다 (52과 녹음이 있다). "
                    "그 줄이 그 단이라는 것이 B등급이다. 꼴로 갈랐고 "
                    "꼴이 뜻을 다 담지 못한다.",
        "generator": "scripts/derive_reask.py",
        "source": "docs/play_rules.md 10.1 (이름), out/data/transcripts.js (보기)",
        "empty": empty,
        "steps": steps,
        "dropped": [{"line": plain(a), "why": b} for a, b in dropped],
    }
    io.open(os.path.join(OUT, "reask.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "reask.js"), "w", encoding="utf-8").write(
        "window.ENG2P_REASK=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    if empty:
        print("  [모자람] 대본에 보기가 없는 단: %s" % " / ".join(empty))
    print("out/data/reask.json / 세 단 (%s) / 보기 %d줄 / 눈으로 뺀 말 %d개 / "
          "**보기는 대본 그대로다**"
          % (" ".join("%s %d" % (x["key"], len(x["lines"])) for x in steps),
             sum(len(x["lines"]) for x in steps), len(dropped)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
