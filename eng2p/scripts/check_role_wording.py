#!/usr/bin/env python3
"""강의 밖의 글에 옛 A/B 역할 말씨가 남아 있는지 훑는다.

`check_lecture_info_gap.py` 는 강의 96편만 본다. 개정문 22 23 (2026-10-07) 이 바꾼 것은
"A가 내고 B가 푼다. B는 카드를 안 본다" 였는데 그 말씨는 강의 밖에도 있었다.
블록 설명 문서, 제작 일지, 세트, 리허설 기록이다. 리허설 기록은 화면에 뜬 글을 받아 적은 것이라
강의록이 바뀌어도 다시 안 돌리면 옛 말을 계속 인용한다 (2026-10-09 에 "A가 출제 12분" 이 그랬다).

**규칙이 바뀌어도 어느 글이 옛 말을 하고 있으면 두 사람은 옛 규칙으로 논다.**

훑는 말씨는 다섯이다. 말씨를 든 것이라 뜻은 못 잡는다 (한계는 `--break` 가 보여 준다).

1. A가 출제   "A가 출제하는 데 10분", "A 출제"
2. 출제자 응답자   "출제자는 A면을 보고 응답자는 안 본다"
3. B는 안 본다   "B는 카드를 안 본다", "B 는 1단계 목록을 안 본다"
4. A면에만   "정답은 A면에만 있다". **같은 문단에 게임이나 NPC 가 있으면 통과.** 기준서 8.3 이 아직 그렇게 적는다
5. A만 본다   "A면은 A만 본다", "정답은 A만 쥔다"

걸리면 길이 셋이다.

- 고친다. 새 규칙으로 다시 쓴다
- 옛 규칙을 인용하는 기록이면 같은 절(제목 사이)에 `옛 규칙 인용` 이라고 적는다.
  제작 일지와 진단 문서는 그때 무엇을 했는지의 기록이라 말씨를 지우면 기록이 거짓이 된다.
  표시는 "이 말씨가 지금 규칙이 아니다" 라는 한 줄이다. 표시 없는 옛 말씨는 실패다
- 화면을 받아 적은 글(`out/manual/eng2p_rehearsal_*.md`)이면 **앱 화면이 아직 옛 말을 하는 것이다.**
  앱 화면은 게임이 대신하기 전까지 안 고친다 (docs/game.md 1). 그래서 줄 수를 기준으로 세어 두고
  **늘어나는 것만** 막는다. 기준보다 줄면 낮추라고 알린다. 기준을 높이려면 앱이 새로 옛 말을 한 것이다

안 훑는 곳이 있고 까닭이 있다.

| 곳 | 까닭 |
|---|---|
| out/cards/ | 카드는 다른 쪽이 맡는다 |
| out/lectures/ | `check_lecture_info_gap.py` 가 문장 단위로 더 촘촘히 본다 |
| out/data/, out/app/, out/game/ | 파생물과 앱 코드다. 원본을 고치고 생성기를 돌린다 |
| app/ scripts/ tools/ | 코드다. 검사기는 옛 말씨를 목록으로 들고 있다 |
| docs/spec_amendments.md | 개정문은 고치기 전 문안을 인용한다. 기준서 쪽은 `check_spec.py` 가 막는다 |
| tasks/ docs/collab.md | 종료된 기록이다 |

사용법:
    python3 scripts/check_role_wording.py            # 훑기
    python3 scripts/check_role_wording.py --break    # 훑기 + 깸 시험
    python3 scripts/check_role_wording.py docs/blocks.md   # 한 파일만

종료 코드 0이면 표시 없는 옛 말씨가 없다.
규격: docs/spec.md 2.3, 8.2, 8.3 (개정문 22, 23)
"""
import pathlib
import re
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent

MARK = re.compile(r"옛 규칙 인용")
GAME = re.compile(r"게임|NPC")

# 역할 글자. A와 B 가 영어 낱말의 일부가 아닐 때만 역할이다.
A = r"(?<![A-Za-z0-9])A"
B = r"(?<![A-Za-z0-9])B"

# (이름, 정규식, 왜 걸리나, 같은 문단에 게임이나 NPC 가 있으면 통과하는가)
RULES = [
    ("A가 출제", re.compile(A + r"\s*(?:가|는|이)?\s*출제"),
     "A가 내는 꼴이다. NPC 가 출제하고 A와 B는 먼저 말하는 차례다 (2.3, 8.2)", False),
    ("출제자 응답자", re.compile(r"출제자|응답자|풀이자|출제하는 쪽|풀이하는 쪽"),
     "내는 사람과 푸는 사람이 갈린 꼴이다. 출제는 NPC 가 하고 둘은 같이 반응한다 (2.3)", False),
    ("B는 안 본다", re.compile(
        B + r"\s*(?:는|가|도|만|에게는)?\s*[^.\n]{0,6}?(?:카드|A면|정답|답|목록|필수 요소)[^.\n]{0,12}"
        r"(?:보지 않|안 본|못 본|안 보|보면 안)"),
     "한 사람이 카드나 목록을 안 본다. 두 사람 사이에 가린 것을 두지 않는다 (2.3)", False),
    ("A면에만", re.compile(A + r"\s?면에만"),
     "A면을 말하면서 게임이 쥔다고 안 적었다. 정답은 두 사람 다 안 본다 (8.2)", True),
    ("A만 본다", re.compile(
        r"A\s?면은 A만|B\s?면은 B만|(?:정답|답)은 A만\s*(?:본|안|쥔)|A만\s*(?:정답|답)을?\s*(?:본|안|쥔)"),
     "A면은 게임이 쥐고 B면은 둘이 같이 본다 (8.2)", False),
]

# 화면을 받아 적은 글. 앱 화면이 아직 옛 말을 한다. 줄 수가 늘어나는 것만 막는다.
# 2026-10-09 기준. 앱 블록 2 의 1단계 목록 가림 (B 는 1단계 목록을 안 본다) 넷, 블록 3 의 카드 가림 넷.
SCREEN_DEBT = {
    "out/manual/eng2p_rehearsal_session.md": 8,
}
SCREEN_RX = re.compile(r"^out/manual/eng2p_rehearsal_[a-z0-9_]+\.md$")

# 안 훑는 곳. 상대 경로의 앞부분이다.
SKIP_PREFIX = ("out/cards/", "out/lectures/", "out/data/", "out/app/", "out/game/",
               "app/", "scripts/", "tools/", "tasks/", "node_modules/", ".git/")
SKIP_FILE = {"docs/spec_amendments.md", "docs/collab.md"}


def sections(lines):
    """줄마다 속한 절의 번호. 제목 줄이 새 절을 연다. 제목 앞은 0절."""
    out = []
    n = 0
    for s in lines:
        if re.match(r"#{1,6}\s", s):
            n += 1
        out.append(n)
    return out


def paragraphs(lines):
    """줄마다 속한 문단의 번호. 빈 줄이 문단을 끊는다."""
    out = []
    n = 0
    blank = True
    for s in lines:
        if not s.strip():
            blank = True
            out.append(-1)
            continue
        if blank:
            n += 1
            blank = False
        out.append(n)
    return out


def scan_text(text, honor_marks=True):
    """[(줄, 규칙, 줄 내용)]. 표시로 풀린 것은 빼고 (honor_marks), 푼 것의 수는 따로 센다."""
    hits, _ = scan_text_full(text, honor_marks)
    return hits


def scan_text_full(text, honor_marks=True):
    lines = text.split("\n")
    sec = sections(lines)
    par = paragraphs(lines)
    marked = {}
    for i, s in enumerate(lines):
        if MARK.search(s):
            marked[sec[i]] = True
    gamep = {}
    for i, s in enumerate(lines):
        if par[i] >= 0 and GAME.search(s):
            gamep[par[i]] = True
    hits = []
    cleared = 0
    for i, s in enumerate(lines):
        if not s.strip() or MARK.search(s):
            continue
        for name, rx, _why, game_ok in RULES:
            if not rx.search(s):
                continue
            if game_ok and gamep.get(par[i]):
                continue
            if honor_marks and marked.get(sec[i]):
                cleared += 1
                continue
            hits.append((i + 1, name, s.strip()))
    return hits, cleared


def rel_of(root, p):
    return p.relative_to(root).as_posix()


def skipped(rel):
    return rel in SKIP_FILE or rel.startswith(SKIP_PREFIX)


def md_files(root):
    out = []
    for p in sorted(root.rglob("*.md")):
        rel = rel_of(root, p)
        if not skipped(rel):
            out.append(p)
    return out


def run(root, files=None):
    """(실패 목록, 걸린 줄 수, 표시로 통과한 수, 화면 빚 목록, 훑은 파일 수)."""
    fails = []
    cleared_total = 0
    debts = []
    n = 0
    for p in (files if files is not None else md_files(root)):
        rel = rel_of(root, p) if p.is_absolute() else p.as_posix()
        try:
            text = p.read_text(encoding="utf-8")
        except OSError:
            continue
        n += 1
        if SCREEN_RX.match(rel):
            raw = scan_text(text, honor_marks=False)
            base = SCREEN_DEBT.get(rel, 0)
            debts.append((rel, len(raw), base))
            if len(raw) > base:
                for ln, name, s in raw:
                    fails.append("%s:%d (%s) %s" % (rel, ln, name, s))
                fails.append("%s: 화면에 옛 말씨가 %d줄이다. 기준은 %d줄이다. 앱 화면이 새로 옛 말을 한다"
                             % (rel, len(raw), base))
            continue
        hits, cleared = scan_text_full(text)
        cleared_total += cleared
        for ln, name, s in hits:
            fails.append("%s:%d (%s) %s" % (rel, ln, name, s))
    return fails, cleared_total, debts, n


# 깸 시험 ---------------------------------------------------------------------
# 규칙마다 걸려야 하는 줄과, 같은 뜻을 새 꼴로 쓴 안 걸려야 하는 줄
PLANT = [
    ("A가 출제", "준비 3분, A가 출제 12분, 역할 바꿔 12분, 기록 3분이다.",
     "준비 3분, A가 먼저 12분, 역할 바꿔 12분, 기록 3분이다."),
    ("A가 출제", "| 3 페어 드릴 | 30분 | A 출제 → B 반응 | 필수 |",
     "| 3 페어 드릴 | 30분 | NPC 가 출제하고 둘이 같이 반응한다 | 필수 |"),
    ("A가 출제", "Q1은 A가 출제하고 B가 판정받았다.", "Q1은 NPC 가 출제하고 A가 먼저 답했다."),
    ("출제자 응답자", "출제자는 A면을 보고 응답자는 안 본다.", "NPC 가 A면을 쥐고 둘이 B면을 같이 본다."),
    ("출제자 응답자", "Q2에서 출제하는 쪽의 일이 어떻게 바뀌는가", "Q2에서 A가 하는 일이 어떻게 바뀌는가"),
    ("B는 안 본다", "블록 3에서 B 는 카드를 안 본다.", "블록 3에서 둘이 같이 B면을 본다."),
    ("B는 안 본다", "B는 카드를 보지 않는다.", "둘이 카드 B면의 지시를 같이 본다."),
    ("B는 안 본다", "B 는 1단계 목록을 안 본다.", "둘이 1단계 목록을 같이 듣는다."),
    ("A면에만", "판정형 정답은 A면에만 있다.", "판정형 정답은 A면에만 있고 게임이 쥔다."),
    ("A만 본다", "A면은 A만 본다. B면은 B만 본다.", "A면은 게임이 쥔다. B면은 둘이 같이 본다."),
    ("A만 본다", "정답은 A만 본다.", "정답은 게임이 쥐고 확인한다."),
]

# 새 규칙으로 쓴 말은 안 걸려야 한다
CLEAN = [
    "NPC 가 출제하고 A가 먼저 답한다.",
    "A와 B는 정보를 쥐는 자리가 아니라 먼저 말하는 차례다.",
    "역할 A와 B는 그대로 둔다. 바뀌는 것은 그 뜻이다.",
    "A가 시간을 재고 B가 낸다. A의 일이 먼저 답하기에서 계측으로 옮겨 간다.",
    "B는 받기만 한다. 넘기는 쪽 훈련이다.",
    "정답은 두 사람 다 안 본다.",
]


def break_tests():
    fails = []
    planted = 0
    caught = 0
    cleans = 0

    def one(label, text, want_rule, expect_hit):
        nonlocal planted, caught, cleans
        got = [h[1] for h in scan_text(text)]
        if expect_hit:
            planted += 1
            if want_rule in got:
                caught += 1
            else:
                fails.append("깸 시험이 안 잡혔다 (%s): %s" % (label, text.strip()[:60]))
        else:
            cleans += 1
            if got:
                fails.append("안 걸려야 하는 줄이 걸렸다 (%s -> %s): %s"
                             % (label, "/".join(got), text.strip()[:60]))

    for rule, bad, good in PLANT:
        one(rule, "# 제목\n\n" + bad + "\n", rule, True)
        one(rule, "# 제목\n\n" + good + "\n", rule, False)
    for c in CLEAN:
        one("안 걸림", "# 제목\n\n" + c + "\n", "", False)

    # 같은 문단에 게임이 있으면 A면에만 은 통과, 문단이 갈리면 걸린다
    one("A면에만 문단", "# 제목\n\n판정형 정답은 A면에만 있다.\n판정은 게임이 한다.\n", "A면에만", False)
    one("A면에만 문단", "# 제목\n\n판정형 정답은 A면에만 있다.\n\n판정은 게임이 한다.\n", "A면에만", True)

    # 표시는 같은 절에서만 푼다. 다른 절의 표시는 못 푼다. 표시 줄 자체는 걸리지 않는다
    bad = "A가 출제 12분이었다."
    mark = "옛 규칙 인용: 개정문 22 이전의 말씨다."
    one("표시 같은 절", "## 가\n\n%s\n\n%s\n" % (bad, mark), "A가 출제", False)
    one("표시 다른 절", "## 가\n\n%s\n\n## 나\n\n%s\n" % (bad, mark), "A가 출제", True)
    one("표시 줄", "## 가\n\n옛 규칙 인용: A가 출제하던 때의 말씨다.\n", "A가 출제", False)

    # 영어 낱말 속 A와 B 는 역할이 아니다
    one("낱말 속 A", "# 제목\n\nQA 출제 일정을 본다. 3A 출제도 아니다.\n", "A가 출제", False)

    # 파일 걸음: 임시 저장소에 심어 본다. 훑는 곳은 잡고 안 훑는 곳은 안 잡아야 한다
    with tempfile.TemporaryDirectory() as tmp:
        root = pathlib.Path(tmp)
        bad_text = "# 제목\n\nA가 출제 12분.\n"
        for rel in ("docs/x.md", "out/manual/eng2p_x.md", "state/journal.md", "out/handouts/h.md",
                    "out/cards/c.md", "out/lectures/l.md", "docs/spec_amendments.md", "tasks/t.md"):
            p = root / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(bad_text, encoding="utf-8")
        f, _c, _d, _n = run(root)
        got = sorted({x.split(":")[0] for x in f})
        want = ["docs/x.md", "out/handouts/h.md", "out/manual/eng2p_x.md", "state/journal.md"]
        planted += len(want)
        caught += len([w for w in want if w in got])
        for w in want:
            if w not in got:
                fails.append("파일 걸음이 못 잡았다: " + w)
        for w in ("out/cards/c.md", "out/lectures/l.md", "docs/spec_amendments.md", "tasks/t.md"):
            cleans += 1
            if w in got:
                fails.append("안 훑어야 하는 곳이 걸렸다: " + w)

        # 화면 빚: 기준과 같으면 통과, 하나 늘면 실패, 기준보다 적으면 통과
        rel = "out/manual/eng2p_rehearsal_session.md"
        base = SCREEN_DEBT[rel]
        p = root / rel
        for extra, want_fail in ((0, False), (1, True), (-1, False)):
            n = max(base + extra, 0)
            p.write_text("# 제목\n\n" + "블록 3에서 B 는 카드를 안 본다.\n" * n, encoding="utf-8")
            f, _c, d, _n = run(root, [p])
            if want_fail:
                planted += 1
                if any("기준은" in x for x in f):
                    caught += 1
                else:
                    fails.append("화면 빚이 늘어도 안 잡혔다 (%d줄)" % n)
            else:
                cleans += 1
                if f:
                    fails.append("화면 빚이 기준 안인데 걸렸다 (%d줄)" % n)
        # 화면 글에는 표시를 달 수 없다. 달아도 풀리지 않는다
        p.write_text("# 제목\n\n옛 규칙 인용: 앱 화면이다.\n" + "블록 3에서 B 는 카드를 안 본다.\n" * (base + 1),
                     encoding="utf-8")
        f, _c, _d, _n = run(root, [p])
        planted += 1
        if any("기준은" in x for x in f):
            caught += 1
        else:
            fails.append("화면 글에 단 표시가 빚을 풀었다")

    # 실제 파일: 제작 일지에서 표시를 다 걷으면 걸려야 한다. 표시가 하는 일이 있다는 증명이다
    jp = ROOT / "state" / "journal.md"
    if jp.exists():
        t = jp.read_text(encoding="utf-8")
        stripped = "\n".join(l for l in t.split("\n") if not MARK.search(l))
        planted += 1
        if scan_text(stripped) and not scan_text(t):
            caught += 1
        else:
            fails.append("제작 일지의 표시가 하는 일이 없다 (걷어도 안 걸리거나, 달아도 걸린다)")
    # 실제 파일 끝에 심으면 잡는가. 읽기와 훑기가 이어지는지까지 본다
    bp = ROOT / "docs" / "blocks.md"
    if bp.exists():
        t = bp.read_text(encoding="utf-8") + "\n## 심은 절\n\n준비 3분, A가 출제 12분이다.\n"
        planted += 1
        if any(h[1] == "A가 출제" for h in scan_text(t)):
            caught += 1
        else:
            fails.append("블록 문서 끝에 심은 줄을 못 잡았다")
    return planted, caught, cleans, fails


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if args:
        files = [pathlib.Path(a).resolve() for a in args]
        fails, cleared, debts, n = run(ROOT, files)
    else:
        fails, cleared, debts, n = run(ROOT)
    for m in fails:
        print("[실패] " + m)
    for rel, got, base in debts:
        if got < base:
            print("[낮출 수 있다] %s 의 화면 옛 말씨가 %d줄로 줄었다. SCREEN_DEBT 를 %d 로 낮춘다" % (rel, got, got))
    bad = 0
    if "--break" in sys.argv:
        planted, caught, cleans, bfails = break_tests()
        for m in bfails:
            bad += 1
            print("[실패] " + m)
        print("깸 시험 심은 것 %d개 중 잡힌 것 %d / 안 걸려야 하는 것 %d개 중 잘못 걸린 것 %d"
              % (planted, caught, cleans, len([1 for m in bfails if m.startswith(("안 걸려야", "안 훑어야", "화면 빚이 기준"))])))
    print()
    debt_n = sum(g for _r, g, _b in debts)
    print("글 %d편 / 말씨 %d / 표시로 통과 %d / 화면 빚 %d줄 (기준 %d) / 실패 %d"
          % (n, len(RULES), cleared, debt_n, sum(b for _r, _g, b in debts), len(fails) + bad))
    return 1 if (fails or bad) else 0


if __name__ == "__main__":
    sys.exit(main())
