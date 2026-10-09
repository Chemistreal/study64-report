#!/usr/bin/env python3
"""카드 600장 글(out/cards/eng2p_card_q*.md)에 두 사람 사이 정보 격차가 남아 있는지 훑는다.

기준서 8.2 가 이렇게 정한다 (개정문 23번).
**카드 파일은 A면과 B면을 갖는다. A면은 NPC 와 게임이 쥐고 B면은 두 사람이 같이 본다.
두 사람 사이에 가린 정보를 두지 않는다. 정답은 두 사람 다 보지 않는다.
역할 A와 B는 정보를 쥐는 자리가 아니라 먼저 말하는 차례다.**

카드 글은 옛 꼴을 남겨 놓고 있었다. 파일 머리에 "A면은 A만 본다. B면은 B만 본다" 가 있었고
지시와 성공 기준이 "A가 읽고 B가 맞힌다" 였고 정답이 "A면 아래 빈칸에 표시해 두고 대조 때 보여 준다" 였다.
**규칙이 바뀌어도 카드가 옛 말을 하고 있으면 게임이 NPC 에게 그 말을 시킨다.**
강의 96편 쪽은 scripts/check_lecture_info_gap.py 가 같은 규칙을 건다. 이 검사는 카드 쪽이다.

이 검사는 옛 말씨를 목록으로 든다. 목록에 걸리는 줄이 하나라도 있으면 실패다.
걸리는 것은 말씨다. 뜻이 아니다. 그래서 목록에 든 말씨를 다른 말씨로 돌려 쓰면 못 잡는다.
그 한계를 `--break` 가 보여 준다. 규칙마다 걸려야 하는 줄을 심고 잡는지 보고,
새 꼴로 쓴 줄이 안 걸리는지도 본다. 걸려야 하는 줄이 안 걸리면 규칙이 죽은 것이고
안 걸려야 하는 줄이 걸리면 규칙이 너무 넓은 것이다.

훑는 곳은 카드의 한국어 칸이다. 지시 / 정답 / 비고 / 모범 답안 / 성공 기준, 칸이 다음 줄로 이어진 자리,
재료 칸 가운데 한글이 든 줄 (영어 재료는 안 본다). 파일 머리 문단은 머리글 규칙만 본다.

잡지 않는 것이 있다.

- 영어 재료와 정답 열쇠. 영어는 이미 들은 대본에서 온 것이고 이 검사가 만지지 않는다
- 칸 이름과 면 이름 ([A면] [B면] 표지, a.instruction 같은 필드 이름). 게임 로더가 읽는다
- 재는 범위를 말하는 "안 본다". "결과가 뜻에 맞는지는 안 본다" 는 이 카드가 무엇을 재는지의 말이다
- B면의 "어느 낱말인지는 말하지 않는다". 답하는 쪽이 지킬 규칙이지 가린 정보가 아니다
- A면은 NPC 와 게임이 쥔 면이라 주어가 없는 "읽는다" "던진다" 는 NPC 가 하는 일로 읽는다 (파일 머리글이 그렇게 말한다)

사용법:
    python3 scripts/check_card_info_gap.py            # 카드 12벌 훑기
    python3 scripts/check_card_info_gap.py --break    # 훑기 + 규칙마다 깸 시험
    python3 scripts/check_card_info_gap.py out/cards/eng2p_card_q1_001_050.md   # 한 벌만

종료 코드 0이면 걸린 줄이 없는 것이다.
규격: docs/spec.md 2.3, 8.2, 8.3, 13.2 (개정문 22, 23)
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CARDS = ROOT / "out" / "cards"

# 훑는 칸. derive_data.py 의 CARD_FIELDS 와 같은 이름이다
LABELS = ("지시", "정답", "비고", "모범 답안", "성공 기준")

# 역할 글자. A와 B 가 영어 낱말의 일부가 아닐 때만 역할이다 (B가, A는, A의). A면 B면 은 카드 면이다.
ROLE = r"(?<![A-Za-z0-9])[AB](?![A-Za-z0-9]|면)"
PARTICLE = r"(?:가|는|은|의|를|을|에게|한테|도|와|과|만|에 대한)(?![가-힣])"

# 옛 머리글. 파일 어느 줄에서든 걸린다
HEAD_OLD = re.compile(r"[AB]면은 [AB]만 본다|한 장을 양쪽에서 본다")
# 새 머리글. 파일마다 있어야 한다
HEAD_NEW = "A면은 NPC 와 게임이 쥐고"

HIDE = re.compile(r"(?:말하지 않는다|알리지 않는다|알려 주지 않는다|안 알려 준다|보여 주지 않는다|안 보여 준다|미리 안 알린다)")

# (이름, 정규식, 왜 걸리나, 어느 면에서만). 문장 하나 안에서 찾는다.
RULES = [
    ("역할 글자", re.compile(ROLE + PARTICLE),
     "A나 B 가 주어나 목적어로 나온다. NPC 가 내고 둘이 같이 반응한다 (8.3). 카드 글에는 역할 글자를 안 쓴다", None),
    ("쪽지 대조", re.compile(r"빈칸에 (?:적어|표시)|대조 때|적어 두고 [^.\n]{0,12}보여"),
     "한 사람이 정답을 적어 두고 대조 때 보여 준다. 정답은 게임이 쥔다 (8.2)", None),
    ("A면은 게임이 쥔다", re.compile(r"(?<![A-Za-z0-9])A면"),
     "A면을 말하면서 게임이 쥔다고 안 적었다 (8.2). 같은 문장에 게임이나 NPC 가 있어야 한다", None),
    ("B면 노출", re.compile(r"(?<![A-Za-z0-9])B면"),
     "카드 글에서 B면을 가리킨다. B면은 두 사람이 같이 보는 면이라 따로 말할 것이 없다 (8.2)", None),
    ("안 알려 준다", HIDE,
     "A면에서 NPC 도 게임도 없이 안 알려 준다고만 적었다. 쥐는 쪽을 적는다 (22번)", "A"),
    ("안 보는 사람", re.compile(r"(?:카드|철자|글자|화면)(?:를|은|는)?\s*(?:보지 않|안 본다|안 보고|보면 안|못 본다)"),
     "한 사람이 카드나 글자를 안 본다. 가리는 일은 게임이 한다 (2.3)", None),
    ("눈 감기 숨김", re.compile(r"(?:눈을 감|눈 감|고개를 돌리|등을 돌리|뒤돌아|몰래|비밀|숨기|숨긴|숨겨|감춘|가려 놓|가린 채)"),
     "가린 정보를 둔다 (2.3). 가리는 것은 NPC 와 게임이 쥔다", None),
]

# 같은 문장에 NPC 나 게임이 있으면 기준서가 정한 꼴이라 통과시키는 규칙
GAME_MAY_HOLD = {"A면은 게임이 쥔다", "안 알려 준다", "안 보는 사람", "눈 감기 숨김"}


def sentences(s):
    return [p for p in re.split(r"(?<=[.?!])\s+", s.strip()) if p.strip()]


def card_lines(text):
    """(줄 번호, 면, 칸 이름, 줄 값) 목록. 훑을 한국어 칸만 낸다. 머리 문단은 안 낸다."""
    out = []
    side = None
    cur = None
    in_mat = False
    started = False
    for ln, line in enumerate(text.split("\n"), 1):
        if re.match(r"^\[\d{3}\]\s+\S+형\s+Q\d", line):
            started = True
            side = None
            cur = None
            continue
        if not started:
            continue
        m = re.match(r"^\[([AB])면\]\s*$", line)
        if m:
            side = m.group(1)
            cur = None
            in_mat = False
            continue
        if line.startswith("---"):
            side = None
            cur = None
            continue
        if side is None or not line.strip():
            continue
        lm = re.match(r"^([가-힣 ]{1,6}):\s*(.*)$", line)
        if lm:
            label, val = lm.group(1), lm.group(2)
            in_mat = (label == "재료")
            cur = label if label in LABELS else None
            if label == "재료" and val and re.search(r"[가-힣]", val):
                out.append((ln, side, "재료", val))
            elif cur:
                out.append((ln, side, cur, val))
            continue
        if in_mat:
            im = re.match(r"^\s+\d+\.\s+(.+)$", line)
            if im and re.search(r"[가-힣]", im.group(1)):
                out.append((ln, side, "재료", im.group(1)))
            continue
        if cur:
            out.append((ln, side, cur, line.strip()))
    return out


def scan(text):
    """걸린 줄 목록 [(줄, 규칙, 문장)]. 규칙 하나가 문장 하나에 한 번만 센다."""
    hits = []
    for ln, line in enumerate(text.split("\n"), 1):
        if HEAD_OLD.search(line):
            hits.append((ln, "옛 머리글", line.strip()))
    if re.search(r"^\[\d{3}\]\s+\S+형\s+Q\d", text, re.M) and HEAD_NEW not in text:
        hits.append((1, "새 머리글 없음", "(파일 머리에 \"%s ...\" 문단이 없다)" % HEAD_NEW))
    for ln, side, label, val in card_lines(text):
        for s in sentences(val):
            for name, rx, _why, only in RULES:
                if only and only != side:
                    continue
                if not rx.search(s):
                    continue
                if name in GAME_MAY_HOLD and re.search(r"게임|NPC", s):
                    continue
                hits.append((ln, name, "%s면 %s: %s" % (side, label, s)))
    return hits


def card_files(args):
    if args:
        return [pathlib.Path(a) for a in args]
    return sorted(CARDS.glob("eng2p_card_q*.md"))


# 깸 시험 ---------------------------------------------------------------------
# 규칙마다 걸려야 하는 줄 하나와, 같은 뜻을 새 꼴로 쓴 안 걸려야 하는 줄 하나.
# (규칙 이름, 면, 칸, 걸려야 하는 값, 안 걸려야 하는 값)
PLANT = [
    ("역할 글자", "A", "성공 기준", "B가 5개 중 4개 이상 맞히면 성공.", "둘이 5개 중 4개 이상 맞히면 성공."),
    ("역할 글자", "B", "지시", "A가 읽는 문장에서 살아남는 낱말을 짚는다.", "NPC 가 읽는 문장에서 살아남는 낱말을 짚는다."),
    ("역할 글자", "A", "지시", "아래 질문을 던진다. B에게 미리 안 알린다.", "아래 질문을 던진다. 게임이 질문을 미리 띄우지 않는다."),
    ("역할 글자", "A", "비고", "B의 답이 뜻에 맞는지는 안 따진다.", "둘의 답이 뜻에 맞는지는 안 따진다."),
    ("역할 글자", "A", "정답", "B는 A가 흘린 덩어리의 원형을 낸다. 재료 그대로다.", "둘은 NPC 가 흘린 덩어리의 원형을 낸다. 재료 그대로다."),
    ("쪽지 대조", "A", "정답", "읽은 쪽을 A면 아래 빈칸에 표시해 두고 대조 때 보여 준다.", "읽은 쪽은 게임이 쥐고 있다가 둘이 고른 뒤에 알려 준다."),
    ("A면은 게임이 쥔다", "A", "정답", "정답은 A면에만 있다.", "쉼 표시는 A면에만 있고 게임이 쥔다."),
    ("B면 노출", "A", "비고", "B면에는 정답을 적지 않는다.", "정답은 게임이 쥔다."),
    ("안 알려 준다", "A", "지시", "아래 짝을 읽는다. 어느 쪽인지 말하지 않는다.", "아래 짝을 읽는다. NPC 는 어느 쪽인지 말하지 않는다."),
    ("안 알려 준다", "A", "비고", "어느 항목인지 안 알려 준다.", "어느 항목인지 게임이 안 알려 준다."),
    ("안 보는 사람", "B", "지시", "낱말의 음절 수를 손가락으로 낸다. 철자를 보지 않는다.", "낱말의 음절 수를 손가락으로 낸다. 게임이 철자를 띄우지 않는다."),
    ("안 보는 사람", "B", "지시", "줄어들기 전의 형태를 말한다. 카드를 보지 않는다.", "줄어들기 전의 형태를 말한다. 게임이 글자를 띄우지 않는다."),
    ("눈 감기 숨김", "B", "지시", "눈을 감고 듣고 어느 쪽인지 고른다.", "소리만 듣고 어느 쪽인지 고른다."),
    ("눈 감기 숨김", "A", "지시", "고른 쪽을 몰래 정해 둔다.", "고른 쪽은 게임이 정한다."),
]

# 재는 범위를 말하는 줄과 답하는 쪽의 규칙과 새 꼴은 안 걸려야 한다. (면, 칸, 값)
CLEAN = [
    ("A", "비고", "결과가 뜻에 맞는지는 안 본다. 조각이 3초 안에 붙었는지만 본다."),
    ("B", "지시", "살아남는 낱말이 몇 개인지 손가락으로 낸다. 어느 낱말인지는 말하지 않는다."),
    ("A", "지시", "NPC 가 아래 문장을 한 번만 읽는다. NPC 는 낱말 수를 알려 주지 않는다."),
    ("A", "지시", "아래 낱말을 읽되 표시된 방식으로 읽는다. 표시는 게임이 쥔다."),
    ("A", "지시", "NPC 가 가게 직원을 맡는다. 둘이 중립 형태로 물으면 답한다."),
    ("A", "비고", "쉼 표시는 A면에만 있고 게임이 쥔다. 읽을 때 소리로만 낸다."),
    ("B", "지시", "NPC 가 읽는 소리를 듣고 줄어들기 전의 형태를 말한다. 게임이 글자를 띄우지 않는다."),
    ("A", "성공 기준", "둘이 5개 중 4개 이상에서 살아남는 낱말을 다 짚으면 성공."),
    ("B", "지시", "손가락으로 낸다. Plan B 를 따로 쓰지 않는다."),
]

HEAD_TEXT = ("# Q1 카드 001-050\n\n" + HEAD_NEW + " 정답은 두 사람 다 보지 않는다.\n\n---\n\n")


def synth(side, label, val):
    """깸 시험용 카드 한 장. 심은 줄이 한 면에 들어간다."""
    a = "[A면]\n지시: 아래 문장을 읽는다.\n"
    b = "[B면]\n지시: 소리를 듣고 낸다.\n"
    line = "%s: %s\n" % (label, val)
    if side == "A":
        a += line
    else:
        b += line
    return HEAD_TEXT + "[001] 판정형 Q1 3분\n\n" + a + "\n" + b + "\n---\n"


def run_breaks():
    fails = []
    planted = 0
    caught = 0
    clean_n = 0
    for rule, side, label, bad, good in PLANT:
        planted += 1
        if rule in [h[1] for h in scan(synth(side, label, bad))]:
            caught += 1
        else:
            fails.append("깸 시험이 안 잡혔다 (%s): %s" % (rule, bad))
        clean_n += 1
        got = [h[1] for h in scan(synth(side, label, good))]
        if got:
            fails.append("안 걸려야 하는 줄이 걸렸다 (%s -> %s): %s" % (rule, "/".join(got), good))
    for side, label, val in CLEAN:
        clean_n += 1
        got = [h[1] for h in scan(synth(side, label, val))]
        if got:
            fails.append("안 걸려야 하는 줄이 걸렸다 (%s): %s" % ("/".join(got), val))
    # 머리글
    planted += 1
    old = "# Q1 카드 001-050\n\nA면은 A만 본다. B면은 B만 본다. 한 장을 양쪽에서 본다.\n\n---\n\n[001] 판정형 Q1 3분\n\n[A면]\n지시: 읽는다.\n\n[B면]\n지시: 낸다.\n"
    if any(h[1] == "옛 머리글" for h in scan(old)):
        caught += 1
    else:
        fails.append("옛 머리글을 못 잡았다")
    planted += 1
    if any(h[1] == "새 머리글 없음" for h in scan(old.replace("A면은 A만 본다. B면은 B만 본다. 한 장을 양쪽에서 본다.", "카드 글"))):
        caught += 1
    else:
        fails.append("새 머리글이 빠진 파일을 못 잡았다")
    # 실제 카드 한 벌에 심어도 잡는가. 파일 읽기와 훑기가 이어지는지까지 본다
    f = CARDS / "eng2p_card_q1_001_050.md"
    if f.exists():
        t = f.read_text(encoding="utf-8")
        planted += 1
        planted_t = t.replace("지시: 아래 문장을 한 번만 읽는다. 다시 읽어 주지 않는다.",
                              "지시: 아래 문장을 한 번만 읽는다. B에게 낱말 수를 알려 주지 않는다.", 1)
        if planted_t != t and any(h[1] == "역할 글자" for h in scan(planted_t)):
            caught += 1
        else:
            fails.append("카드 본문에 심은 줄을 못 잡았다: 001")
        planted += 1
        planted_t = re.sub(r"(?m)^(성공 기준: )5개 중 4개 이상\.$", r"\1B가 5개 중 4개 이상.", t, count=1)
        if planted_t != t and any(h[1] == "역할 글자" for h in scan(planted_t)):
            caught += 1
        else:
            fails.append("B면 성공 기준에 심은 줄을 못 잡았다: 001")
    return planted, caught, clean_n, fails


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    files = card_files(args)
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
        planted, caught, clean_n, fails = run_breaks()
        for m in fails:
            bad += 1
            print("[실패] " + m)
        print("깸 시험 심은 것 %d개 중 잡힌 것 %d / 안 걸려야 하는 줄 %d개" % (planted, caught, clean_n))

    print()
    if by_rule:
        print("규칙별: " + " / ".join("%s %d" % (k, v) for k, v in sorted(by_rule.items())))
    print("카드 %d벌 / 규칙 %d+2 / 걸린 줄 %d (%d벌) / 실패 %d"
          % (len(files), len(RULES), total, fail_files, total + bad))
    return 1 if (total or bad) else 0


if __name__ == "__main__":
    sys.exit(main())
