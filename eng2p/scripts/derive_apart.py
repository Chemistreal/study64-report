#!/usr/bin/env python3
"""따로 쓰고 같이 펴기 판이 쓸 **물음 하나**를 강의에서 뽑는다. T309

규칙서 12.1 이 쓰는 것을 이렇게 적었다.

    오늘 강의에서 뽑은 물음 하나. **없음. A등급 예정 (강의에서 뽑는다)**

## 강의에 물음이 없다

96편을 다 열어 봤다. 물음표로 끝나는 문장이 일흔일곱이고 **마흔여덟 강에는 하나도 없다.**
그나마 있는 것은 `Where are you out of?` 처럼 **영어 예문**이고 배우는 사람에게
던지는 물음이 아니다.

"강의에서 뽑는다" 를 글자 그대로는 못 지킨다. 뽑을 것이 없다.
T204 에 이 칸을 적을 때 강의를 안 열어 봤다.

## 소재를 뽑고 틀은 짓는다

그러면 무엇을 뽑나. **블록 2의 인과 문장**이다.

    한국어에서는 모든 음절이 같은 무게이므로 영어에서도 일곱 박자를 고르게 찍는다.

`CLAUDE.md` 가 블록 2를 "한국어에서는 X이므로 영어에서 Y로 잘못한다" 꼴로 못 박았고
`check.py` 가 그것을 검사한다. 그래서 **96편에서 다 나온다.** 하나도 안 빠졌다.

물음의 틀은 내가 짓는다. 한국어 지시문이고 영어를 안 짓는다.
`CLAUDE.md` 의 등급표가 한국어 대조 설명을 A로 둔다.

**뽑은 문장은 그 강의 등급을 그대로 진다.** 96편 중 여든여섯이 B라
이 파일도 B다. 판정에 안 쓰는 판이라 그것으로 족하다.
규칙서 12.1 의 기록할 값 칸이 "**답을 채점하지 않는다**" 다.

## 틀이 넷이고 강 번호가 고른다

한 틀만 쓰면 마흔여덟 주 내내 같은 물음이다. 넷을 돌린다.
**무작위가 아니다.** 강 번호로 고른다 (`round.md` 6장).

넷 다 답이 갈리는 물음이다. 답이 하나인 물음을 넣으면 이 판이 채점이 된다.
그리고 넷 다 **각자**라고 적는다. 이 과정에 1인 과제가 없다.

쓰는 법:
    python3 scripts/derive_apart.py

결과: out/data/apart.json 과 apart.js
규격: docs/play_rules.md 12.1, docs/play_data.md 24장
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

# 물음의 틀. **답이 갈리는 것만 둔다.** 답이 하나면 이 판이 채점이 된다.
# 넷 다 "각자" 를 적는다. 이 과정에 1인 과제가 없다 (`CLAUDE.md`).
#
# **트랙을 안 가린다.** 처음에 "오늘 소리 낼 때" 라고 적었다가 고쳤다.
# 함정이 소리에만 있는 것이 아니다. 61강 함정은 "왜 그렇게 말하는지를 안 묻는다" 다.
# 여섯 트랙이 다 이 틀을 지나므로 틀에 트랙 이름이 들어가면 안 된다.
FRAMES = [
    "이 함정에 걸린 자리를 각자 하나씩 적는다. 언제 어디서였는지까지 적는다.",
    "오늘 이 함정이 어디서 제일 세게 나올 것 같은지를 각자 적는다.",
    "상대가 이 함정에 걸리면 어떻게 알려 줄지를 각자 한 줄로 적는다.",
    "이 함정을 덜 겪으려면 다음 한 주에 무엇을 바꿀지를 각자 한 줄로 적는다.",
]

# 블록 2에서 찾을 것. **한국어와 영어가 한 문장에 있고 인과가 있어야 한다.**
CAUSE = re.compile(r"(이므로|으므로|므로|때문에)")
LONG = 160


def plain(s):
    return (s or "").replace("**", "")


def block2(text):
    i = text.find("## 2.")
    j = text.find("## 3.")
    return text[i:j] if i >= 0 and j > i else ""


def sentences(seg):
    seg = re.sub(r"\s+", " ", seg)
    return [x.strip() + "." for x in seg.split(". ") if x.strip()]


def pick(text):
    """블록 2에서 인과 문장 하나. **첫 것을 든다. 안 고른다.**"""
    for s in sentences(block2(text)):
        if "한국어" in s and "영어" in s and CAUSE.search(s) and len(s) <= LONG:
            return plain(s)
    return None


def spec():
    """규칙서 12.1 이 몇 분인지. **문서가 원본이다** (T279)."""
    if not os.path.exists(RULES):
        return None, ["%s 가 없다" % RULES]
    text = io.open(RULES, encoding="utf-8").read()
    i = text.find("### 12.1 따로 쓰고 같이 펴기")
    if i < 0:
        return None, ["규칙서에서 12.1 을 못 찾았다"]
    m = re.search(r"\|\s*트랙 구조 분\s*\|[^|]*?(\d+)\s*분", text[i:i + 900])
    if not m:
        return None, ["규칙서 12.1 의 트랙 구조 분에서 몇 분인지 못 찾았다"]
    return int(m.group(1)), []


def main():
    minutes, bad = spec()
    lf = os.path.join(OUT, "lectures.json")
    if not os.path.exists(lf):
        bad.append("out/data/lectures.json 이 없다. derive_data.py 를 먼저 돌린다")
    if bad:
        for b in bad:
            print("[실패] " + b)
        return 1

    lecs = json.load(io.open(lf, encoding="utf-8"))["items"]

    items, miss = [], []
    for L in lecs:
        src = os.path.join(ROOT, L["source"]) if not os.path.isabs(L["source"]) \
            else L["source"]
        if not os.path.exists(src):
            miss.append("%d강 원본이 없다" % L["no"])
            continue
        got = pick(io.open(src, encoding="utf-8").read())
        if not got:
            miss.append("%d강 블록 2에서 인과 문장을 못 찾았다" % L["no"])
            continue
        items.append({
            "no": L["no"], "q": L["quarter"], "track": L["track"],
            "title": plain(L["title"]),
            # **강의 그대로다.** 손대지 않는다
            "trap": got,
            # 틀은 내가 지은 한국어다. 강 번호가 고른다. 무작위가 아니다
            "ask": FRAMES[L["no"] % len(FRAMES)],
            "frame": L["no"] % len(FRAMES),
            # **그 강의 등급을 그대로 진다.** 올려 적지 않는다
            "grade": L.get("grade", "B"),
        })

    if miss:
        for m in miss:
            print("[실패] " + m)
        return 1
    if len(items) != len(lecs):
        print("[실패] 강 %d편 중 %d편만 물음이 됐다" % (len(lecs), len(items)))
        return 1

    grades = sorted({i["grade"] for i in items})
    worst = "B" if "B" in grades else "A"
    nb = sum(1 for i in items if i["grade"] == "B")

    obj = {
        "note": "따로 쓰고 같이 펴기가 쓸 물음. 함정 문장은 강의 블록 2 그대로다. "
                "묻는 틀은 한국어 지시문이다. 영어를 짓지 않는다. "
                "손으로 안 고친다. scripts/derive_apart.py 를 다시 돌린다.",
        "grade": worst,
        "gradeWhy": "함정 문장이 그 강의 등급을 그대로 진다. 강의 96편 중 %d편이 "
                    "B라 이 파일도 B다. 묻는 틀은 한국어 지시문이라 A지만 "
                    "낮은 쪽을 적는다. 이 판은 답을 채점하지 않으므로 "
                    "통과 판정에 안 쓰는 것이 규격 그대로다." % nb,
        "generator": "scripts/derive_apart.py",
        "source": "out/lectures/ (블록 2 인과 문장), docs/play_rules.md 12.1",
        "min": minutes, "frames": FRAMES, "count": len(items),
        "gradeB": nb,
        "items": items,
    }

    # **영어를 안 지었는지 다시 센다.** 물음 틀에 라틴 글자가 있으면 내가 지은 것이다.
    # 함정 문장 안의 예문은 강의 그대로라 괜찮다. 틀만 본다.
    for f in FRAMES:
        if re.search(r"[A-Za-z]", f):
            print("[실패] 묻는 틀에 영어가 있다: %s" % f)
            return 1

    io.open(os.path.join(OUT, "apart.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "apart.js"), "w", encoding="utf-8").write(
        "window.ENG2P_APART=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    print("out/data/apart.json / 강 %d편에 물음 하나씩 / 틀 %d개 (강 번호가 고른다) / "
          "B등급 강 %d편 / %d분 / **함정은 강의 그대로, 틀은 한국어다**"
          % (len(items), len(FRAMES), nb, minutes))
    return 0


if __name__ == "__main__":
    sys.exit(main())
