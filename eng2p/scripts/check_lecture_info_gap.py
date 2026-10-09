#!/usr/bin/env python3
"""강의 96편에 두 사람 사이 정보 격차가 남아 있는지 훑는다.

기준서 2.3 과 8.2 가 이렇게 정한다. **두 사람 사이에 가린 정보를 두지 않는다.**
가리는 것은 NPC 와 게임이 쥔다. 판정형 정답은 카드 A면에만 있고 게임이 쥐며 두 사람 다 안 본다.
역할 A와 B는 정보를 쥐는 자리가 아니라 먼저 말하는 차례다 (개정문 22번 23번).

강의 블록 3 은 옛 꼴을 남겨 놓고 있었다. "A가 출제하고 B가 답한다. B는 카드를 안 본다.
정답은 A만 본다." 개정문 23번이 8장 9장 13장을 바꿀 때 강의 96편은 따라가지 않았다.
**규칙이 바뀌어도 강의가 옛 말을 하고 있으면 두 사람은 옛 규칙으로 논다.**

이 검사는 옛 말씨를 목록으로 든다. 목록에 걸리는 문장이 하나라도 있으면 실패다.
걸리는 것은 말씨다. 뜻이 아니다. 그래서 목록에 든 말씨를 다른 말씨로 돌려 쓰면 못 잡는다.
그 한계를 `--break` 가 보여 준다. 규칙마다 걸려야 하는 문장을 심고 잡는지 보고,
새 꼴로 쓴 문장이 안 걸리는지도 본다. 걸려야 하는 문장이 안 걸리면 규칙이 죽은 것이고
안 걸려야 하는 문장이 걸리면 규칙이 너무 넓은 것이다.

세 갈래를 본다.

- 한 사람이 보거나 쥐거나 안다고 말하는 문장 (규칙 열둘)
- A면을 말하면서 게임이 쥔다고 안 적은 문장. 같은 문장에 게임이나 NPC 가 있어야 한다
- 블록 3 에 NPC 도 게임도 안 나오는 강. 블록 3 은 NPC 가 카드를 내고 둘이 반응하는 자리다

잡지 않는 것이 있다. 둘이다.

- 재는 범위를 말하는 "안 본다". "문장이 맞는지는 안 본다" 는 이 강이 무엇을 재는지의 말이다
- 둘 다 같이 하는 일. "둘 다 앞 값을 안 연다" 는 격차가 아니라 앵커링을 막는 절차다

가리는 일을 NPC 나 게임이 하는 문장은 기준서가 정한 꼴이라 통과시킨다
("어느 항목인지 NPC 가 안 알려 준다"). 블록 1 2 6 은 한국어 화자의 소리를 설명하는 글이라
말씨가 좁은 규칙만 건다 ("억양은 문장 종류를 그대로 알려 주지 않는다" 가 걸리면 거짓이다).

사용법:
    python3 scripts/check_lecture_info_gap.py            # 강의 96편 훑기
    python3 scripts/check_lecture_info_gap.py --break    # 훑기 + 규칙마다 깸 시험
    python3 scripts/check_lecture_info_gap.py out/lectures/eng2p_q1_l008.md   # 한 편만

종료 코드 0이면 걸린 문장이 없는 것이다.
규격: docs/spec.md 2.3, 8.2, 8.3, 13.2 (개정문 22, 23)
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LEC = ROOT / "out" / "lectures"

# 역할 글자. A와 B 가 영어 낱말의 일부가 아닐 때만 역할이다 (B가, A는, A의). A면 B면 은 카드 면이다.
ROLE = r"(?<![A-Za-z0-9])[AB](?![A-Za-z0-9]|면)"

# 재는 범위를 말하는 문장은 격차가 아니다. "내용이 맞는지는 안 본다" 가 그렇다.
SCOPE = re.compile(r"(맞는지|맞았는지|옳은지|정확한지|정확성|내용|뜻|영어가|근거가|답이|지시가|문장이|표현이|형태가)\S*\s*(?:는|은)?\s*안 본다")

# (이름, 정규식, 왜 걸리나). 문장 하나 안에서 찾는다.
RULES = [
    ("안 보는 사람", re.compile(
        ROLE + r"(?:는|가|도|만|에게는)?[^.\n]{0,24}?"
        r"(?:안 본다|안 보고|안 보며|보지 않|못 본다|못 보게|보면 안 된|안 보여 준|보여 주지 않|안 보이게)"
        r"|상대(?:에게|가)[^.\n]{0,12}(?:안 보이|못 보|안 보여|감추|숨기)"),
     "한 사람이 카드나 상대를 안 본다. 두 사람 사이에 가린 것을 두지 않는다 (2.3)"),
    ("눈 감기", re.compile(r"(?:눈을 감|눈 감|고개를 돌리|시선을 돌리|등을 돌리|뒤돌아)"),
     "한 사람이 눈을 감거나 돌아앉는다. 가리는 일은 게임이 한다 (2.3)"),
    ("안 알려 준다", re.compile(
        r"(?:알려 주지 않|알려 주지 말|안 알려 준|안 알려 주|미리 알리지 않|미리 안 알린|말해 주지 않|"
        r"안 보여 준|보여 주지 않|미리 안 보여|티 내지 않|밝히지 않|안 밝힌다)"),
     "한쪽이 쥐고 상대에게 안 알려 준다 (22번). 쥐는 쪽은 NPC 와 게임이다"),
    ("공개", re.compile(r"(?:공개한다|공개하고|공개해|공개를|까 보여|펴 보여 준다|" + ROLE + r"가[^.\n]{0,20}보여 주는 것으로 한다)"),
     "한쪽이 쥔 답을 열어 준다. 답은 게임이 쥐고 게임이 알려 준다 (8.3)"),
    ("몰래 비밀 숨김", re.compile(
        r"(?:몰래|비밀|숨기|숨긴|숨겨|감춘|감추|가려 놓|가려 두|가린 채|가려진|가리고 |가린다|가려서|"
        + ROLE + r"(?:가|는)?\s*[^.\n]{0,12}모르게)"),
     "가린 정보를 둔다 (2.3). 가리는 것은 NPC 와 게임이 쥔다"),
    ("답을 아는 쪽", re.compile(
        r"(?:답을 아는|정답을 아는|아는 쪽|모르는 쪽|모르는 채|모른 채|어느 쪽인지 모르|"
        + ROLE + r"만\s*(?:정답|답|알|안다|본다|보고|쥐)|한쪽만 (?:안다|알|본다|쥔다)|한 사람만 (?:안다|알|본다|쥔다)|"
        r"혼자 (?:본다|보고|보는|쥐)|" + ROLE + r" 화면에만|한쪽 화면)"),
     "한 사람만 답이나 카드를 안다. 정답은 두 사람 다 안 보고 게임이 쥔다 (8.2)"),
    ("출제 풀이", re.compile(
        ROLE + r"(?:가|는|의)\s*(?:출제|풀이)|출제자|풀이자|출제하는 쪽|풀이하는 쪽|출제 \d+분|"
        r"출제가 틀리면|출제하고 판정"),
     "A가 내고 B가 푸는 꼴이다. NPC 가 출제하고 둘이 같이 반응한다 (2.3). A와 B는 먼저 말하는 차례다"),
    ("A면은 게임이 쥔다", re.compile(r"(?<![A-Za-z0-9])A면"),
     "A면을 말하면서 게임이 쥔다고 안 적었다 (8.2). 같은 문장에 게임이나 NPC 가 있어야 한다"),
    ("B면 노출", re.compile(r"(?<![A-Za-z0-9])B면[^.\n]{0,12}(?:노출|금지|숨)|" + ROLE + r"가 (?:카드의 )?A면"),
     "A면이나 B면을 한 사람만 본다. A면은 게임이 쥐고 B면은 두 사람이 같이 본다 (8.2)"),
    ("A가 A면을", re.compile(ROLE + r"(?:가|는)\s*(?:카드\s*)?A면"),
     "A가 A면을 읽거나 보여 준다. A면은 NPC 와 게임이 쥔다 (8.2)"),
]

# 줄 규칙. 문장 둘에 걸치는 말씨라 한 줄을 통째로 본다. "007 은 repair형이다. A가 중간에 일부러 ..."
LINE_RULES = [
    ("repair형은 NPC", re.compile(r"repair형이다\.\s*A(?:가|는)"),
     "repair형은 NPC 가 일부러 무너뜨린다 (8.3). A가 무너뜨리면 B는 언제 무엇이 올지 모르는 채가 된다"),
]

# 블록 1 2 6 은 설명하는 글이다. 말씨가 좁은 규칙만 모든 블록에 건다.
EVERY_BLOCK = {"안 보는 사람", "눈 감기", "공개", "출제 풀이", "A면은 게임이 쥔다", "B면 노출", "A가 A면을"}
# 가리는 일을 NPC 나 게임이 하는 문장은 기준서가 정한 꼴이다.
GAME_MAY_HIDE = {"안 알려 준다", "몰래 비밀 숨김", "답을 아는 쪽"}

NEED_GAME = ("블록 3 에 NPC 도 게임도 없다",
             "블록 3 은 NPC 가 카드를 내고 정답은 게임이 쥔다고 말해야 한다 (2.3, 8.2, templates/lecture.md)")


def sentences(text):
    """문장 단위로 쪼갠다. 줄 끝과 마침표 뒤 공백에서 끊는다. (줄 번호, 블록 번호, 문장)."""
    out = []
    block = 0
    started = False
    for ln, line in enumerate(text.split("\n"), 1):
        s = line.strip()
        if not started:
            # 머리말 다섯 줄은 안 훑는다. 첫 제목 줄부터 본다. 줄 번호는 파일 그대로 센다
            started = s.startswith("# ")
            continue
        m = re.match(r"## (\d)\. ", s)
        if m:
            block = int(m.group(1))
        if not s or s.startswith("#"):
            continue
        for part in re.split(r"(?<=[.?!])\s+", s):
            if part.strip():
                out.append((ln, block, part.strip()))
    return out


def scan(text):
    """걸린 문장 목록 [(줄, 규칙, 문장)]. 규칙 하나가 문장 하나에 한 번만 센다."""
    hits = []
    b3 = []
    head3 = 0
    block = 0
    for ln, line in enumerate(text.split("\n"), 1):
        m = re.match(r"## (\d)\. ", line)
        if m:
            block = int(m.group(1))
        if block in (3, 4, 5):
            for name, rx, _why in LINE_RULES:
                if rx.search(line):
                    hits.append((ln, name, line.strip()))
    for ln, block, s in sentences(text):
        if block == 3:
            b3.append(s)
            head3 = head3 or ln
        for name, rx, _why in RULES:
            if not rx.search(s):
                continue
            if block not in (3, 4, 5) and name not in EVERY_BLOCK:
                continue
            if name == "A면은 게임이 쥔다" and re.search(r"게임|NPC", s):
                continue
            if name in GAME_MAY_HIDE and re.search(r"게임|NPC", s):
                continue
            if name == "안 보는 사람" and SCOPE.search(s):
                continue
            hits.append((ln, name, s))
    # 블록 3 이 있는 강에서 NPC 도 게임도 안 나오면 걸린다. 블록 3 이 없는 글은 블록 검사가 따로 잡는다
    if b3 and not any(re.search(r"게임|NPC", x) for x in b3):
        hits.append((head3, NEED_GAME[0], "(블록 3 에 NPC 와 게임이 한 번도 안 나온다)"))
    return hits


def lecture_files(args):
    if args:
        return [pathlib.Path(a) for a in args]
    return sorted(LEC.glob("eng2p_q*_l*.md"))


# 깸 시험 ---------------------------------------------------------------------
# 규칙마다 걸려야 하는 문장 하나와, 같은 뜻을 새 꼴로 쓴 안 걸려야 하는 문장 하나.
PLANT = [
    ("안 보는 사람", "B는 카드를 보지 않는다.", "둘이 카드 B면의 지시를 같이 본다."),
    ("안 보는 사람", "B가 A의 입을 안 보고 듣는다.", "둘이 나란히 앉아 같은 카드만 본다."),
    ("안 보는 사람", "정답은 상대에게 안 보이게 접어 둔다.", "정답은 게임이 쥐고 확인한다."),
    ("눈 감기", "B는 눈을 감고 듣는다.", "게임이 글자를 띄우지 않고 소리만 낸다."),
    ("안 알려 준다", "A는 원형을 알려 주지 않는다.", "원형은 게임이 쥐고 있다."),
    ("안 알려 준다", "B에게는 그 일정을 안 보여 준다.", "일정은 NPC 가 쥐고 둘이 영어로 물어서 알아낸다."),
    ("공개", "A가 순서를 공개하고 둘이 맞춰 본다.", "게임이 순서를 알려 주고 둘이 맞춰 본다."),
    ("공개", "대조는 A가 원형을 보여 주는 것으로 한다.", "대조는 게임이 원형을 알려 주는 것으로 한다."),
    ("몰래 비밀 숨김", "A가 답을 몰래 정한다.", "답은 게임이 정한다."),
    ("몰래 비밀 숨김", "A는 B가 모르게 순서를 바꾼다.", "순서는 게임이 바꾸고 둘이 같이 듣는다."),
    ("답을 아는 쪽", "정답을 아는 쪽이 먼저 말한다.", "먼저 말하는 차례는 A다."),
    ("답을 아는 쪽", "A만 정답을 본다.", "정답은 게임이 쥐고 확인한다."),
    ("답을 아는 쪽", "상황은 A 화면에만 뜬다.", "상황은 NPC 가 쥐고 둘이 같이 물어서 알아낸다."),
    ("출제 풀이", "준비 3분, A가 출제 12분, 역할 바꿔 12분, 기록 3분이다.",
     "준비 3분, A가 먼저 12분, 역할 바꿔 12분, 기록 3분이다."),
    ("출제 풀이", "A는 출제하고 B는 푼다.", "NPC 가 출제하고 A가 먼저 답한다."),
    ("A면은 게임이 쥔다", "정답은 A면에만 있다.", "정답은 A면에만 있고 게임이 쥐고 확인한다."),
    ("B면 노출", "B면 노출 금지다.", "B면은 둘이 같이 본다."),
    ("B면 노출", "B가 A면을 보면 안 된다.", "A면은 게임이 쥐고 두 사람 다 안 본다."),
    ("A가 A면을", "A는 카드 A면의 축약형을 한 번만 읽는다.", "NPC 가 축약형을 한 번만 읽는다."),
    ("A가 A면을", "대조는 A가 카드 A면의 원형을 읽는 것으로 한다.", "대조는 게임이 A면의 원형을 읽어 주는 것으로 한다."),
    ("repair형은 NPC", "007 은 repair형이다. A가 중간에 일부러 박자를 흐트러뜨린다.",
     "007 은 repair형이다. NPC 가 중간에 일부러 박자를 흐트러뜨린다."),
]

# 재는 범위를 말하는 문장과 둘이 같이 하는 일은 안 걸려야 한다
CLEAN = [
    "문장이 맞는지는 안 본다.",
    "A는 묶음이 맞았는지만 본다. 문장이 맞는지는 안 본다.",
    "B는 받기만 한다. 넘기는 쪽 훈련이라 받는 방식은 안 본다.",
    "끝나기 전에는 둘 다 값을 안 연다.",
    "A와 B는 정보를 쥐는 자리가 아니라 먼저 말하는 차례다.",
    "NPC 가 출제하고 A가 먼저 답한다.",
    "정답은 A면에만 있고 게임이 쥐고 확인한다.",
    "어느 항목인지 NPC 가 안 알려 준다.",
    "게임이 NPC 의 입 모양을 띄우지 않는다.",
    "107 은 repair형이다. B가 덩어리 중간에서 막힌다.",
]


def breaks():
    """(규칙 이름, 문장, 걸려야 하는가) 목록."""
    out = []
    for rule, bad, good in PLANT:
        out.append((rule, bad, True))
        out.append((rule, good, False))
    for c in CLEAN:
        out.append(("안 걸림", c, False))
    return out


def run_breaks():
    fails = []
    caught = 0
    planted = 0
    for rule, sent, should in breaks():
        # 블록 3 안에 심는다. 게임이 한 번도 안 나오면 블록 3 규칙이 따로 걸리므로 줄을 하나 더한다
        text = "# 1강. 깸 시험\n\n## 3. 역할 지정\n\n게임이 쥔다.\n" + sent + "\n"
        got = [h[1] for h in scan(text)]
        if should:
            planted += 1
            if rule in got:
                caught += 1
            else:
                fails.append("깸 시험이 안 잡혔다 (%s): %s" % (rule, sent))
        elif got:
            fails.append("안 걸려야 하는 문장이 걸렸다 (%s -> %s): %s" % (rule, "/".join(got), sent))
    # 블록 3 에 NPC 도 게임도 없는 강
    planted += 1
    if any(h[1] == NEED_GAME[0] for h in scan("# 1강. 깸 시험\n\n## 3. 역할 지정\n\nA는 읽고 B는 센다.\n")):
        caught += 1
    else:
        fails.append("블록 3 에 NPC 와 게임이 없는 강을 못 잡았다")
    # 실제 강의 한 편에 심어도 잡는가. 파일 읽기와 훑기가 이어지는지까지 본다
    f = next(iter(sorted(LEC.glob("eng2p_q1_l008.md"))), None)
    if f is not None:
        t = f.read_text(encoding="utf-8")
        planted_t = t.replace("## 3. 역할 지정\n", "## 3. 역할 지정\n\nB는 카드를 보지 않는다.\n", 1)
        planted += 1
        if any(h[2] == "B는 카드를 보지 않는다." for h in scan(planted_t)):
            caught += 1
        else:
            fails.append("강의 본문에 심은 문장을 못 잡았다: 8강")
    return planted, caught, fails


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    files = lecture_files(args)
    total = 0
    fail_files = 0
    by_rule = {}
    for f in files:
        text = f.read_text(encoding="utf-8")
        hits = scan(text)
        if hits:
            fail_files += 1
        for ln, name, s in hits:
            total += 1
            by_rule[name] = by_rule.get(name, 0) + 1
            print("[실패] %s:%d (%s) %s" % (f.name, ln, name, s))

    bad = 0
    if "--break" in sys.argv:
        planted, caught, fails = run_breaks()
        for m in fails:
            bad += 1
            print("[실패] " + m)
        print("깸 시험 심은 것 %d개 중 잡힌 것 %d / 안 걸려야 하는 문장 %d개"
              % (planted, caught, len([1 for _, _, s in breaks() if not s])))

    print()
    if by_rule:
        print("규칙별: " + " / ".join("%s %d" % (k, v) for k, v in sorted(by_rule.items())))
    print("강의 %d편 / 규칙 %d+1 / 걸린 문장 %d (%d편) / 실패 %d"
          % (len(files), len(RULES) + len(LINE_RULES), total, fail_files, total + bad))
    return 1 if (total or bad) else 0


if __name__ == "__main__":
    sys.exit(main())
