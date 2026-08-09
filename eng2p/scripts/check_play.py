"""놀이 규칙서 검사. **사람이 판정하는데 기계는 무엇을 보는가.**

스무 판의 판정은 사람이 한다. 기계는 그 판정을 못 한다.
그러면 기계가 할 일이 없는가. 있다. **규칙서가 원칙을 어겼는지는 기계가 본다.**

무엇을 보는가를 갈라 둔다.

    본다      칸이 다 있는가, 분이 5 이하인가, 로드맵 12.9 와 같은 말을 하는가,
              못 했을 때 칸에 벌이 있는가, 기록할 값에 사람별 값이 있는가
    못 본다   그 판이 재미있는가, 판정이 맞는가, 자료가 좋은가

**빈 칸과 "없다" 를 가르는 것이 이 검사의 첫 일이다.** T204 에 그렇게 적었다.
역할이 없는 판이 셋이고 셋 다 둘이 동시에 같은 것을 한다. 비운 것이 아니라 적은 것이다.

사용법:
    python3 scripts/check_play.py

규격: docs/play.md, docs/play_rules.md, docs/roadmap.md 12.9, docs/solo_plays.md
"""
import io
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
RULES = os.path.join(ROOT, "docs", "play_rules.md")
ROADMAP = os.path.join(ROOT, "docs", "roadmap.md")
DATA = os.path.join(ROOT, "docs", "play_data.md")
SOLO = os.path.join(ROOT, "docs", "solo_plays.md")
MANUAL = os.path.join(ROOT, "out", "manual", "eng2p_manual.md")

# 한 기기로 도는 갈래 셋. `docs/solo_plays.md` 2장이 정했다. T249
SOLO_KINDS = ["그대로", "돌려 보기", "종이", "고른 판을 따른다"]

# 기기가 아예 없는 날. `docs/solo_plays.md` 7장이 정했다. T250
PAPER_KINDS = ["돈다", "안 돈다", "바뀐 꼴로", "고른 판을 따른다"]

# 판마다 이 아홉 줄이 이 차례로 있어야 한다. docs/play_rules.md 1장이 규격이다.
ROWS = ["트랙 구조 분", "쓰는 것", "시작 조건", "역할",
        "도는 차례", "판정", "끝 조건", "못 했을 때", "기록할 값"]

# **벌 낱말을 짧게 잡는다.** "벌" 한 글자는 세는 말이기도 하다 (다섯 벌, 한 벌마다).
# 넓게 잡으면 맞는 것까지 잡는다. T204 에서 P2 를 좁힌 것과 같은 이유다.
PENALTY = ["감점", "벌점", "벌칙", "점수를 잃", "차례를 잃"]

# 승패 표현. 한 사람 주어인 문장 자체는 막지 않는다 (P2 다듬음, T204).
WINLOSE = ["이긴다", "이겼", "진다", "졌다", "승자", "패자"]

# 기록할 값에 사람을 남기는 말. **부정문을 안 잡게 긍정 표지만 넣는다.**
# "누가 받았는지는 안 센다" 는 통과해야 한다.
PERSON = ["남편", "아내", "사람별", "각자", "개인"]

# 셈을 적었다는 표시. 하나는 있어야 한다.
COUNTED = ["몇", "수", "횟수", "칸", "하나", "는가"]

# 역할 칸이 셋 중 하나여야 한다. 빈 칸은 실패다.
ROLE_OK = ["바뀐다", "역할이 없다", "그 판의 역할을 따른다"]


def strip(s):
    """굵게 표시와 인용 표시를 걷어 낸다. 글자만 본다."""
    return re.sub(r"[*`]", "", s)


def rulebook():
    """규칙서에서 판마다 아홉 줄을 뽑는다."""
    txt = io.open(RULES, encoding="utf-8").read()
    out = []
    pat = r"### \d+\.\d+ ([^\n]+)\n\n\| 칸 \| \|\n\|---\|---\|\n((?:\|[^\n]*\n)+)"
    for name, body in re.findall(pat, txt):
        rows = []
        for line in body.strip().split("\n"):
            c = [x.strip() for x in line.strip().strip("|").split("|")]
            rows.append((strip(c[0]), strip(c[1]) if len(c) > 1 else ""))
        out.append((name.strip(), rows))
    return out


def plan():
    """로드맵 12.9 표. 판 이름과 트랙과 구조와 분이 여기 있다."""
    txt = io.open(ROADMAP, encoding="utf-8").read()
    sec = txt.split("### 12.9 놀이 스무 판")[1].split("### 12.10")[0]
    out = {}
    for line in sec.split("\n"):
        if not line.startswith("| ") or "---" in line or line.startswith("| 판 "):
            continue
        c = [strip(x.strip()) for x in line.strip().strip("|").split("|")]
        if len(c) < 5 or not c[4].isdigit():
            continue
        out[c[0]] = {"track": c[1], "struct": c[3], "min": int(c[4])}
    return out


def missing_data():
    """play_data.md 5장이 센 진짜로 없는 자료."""
    txt = io.open(DATA, encoding="utf-8").read()
    # **제목의 숫자말에 기대지 않는다.** 자료를 하나 만들면 그 말이 바뀌고
    # 그러면 검사가 장을 못 찾아 조용히 0을 센다. 장 번호로 찾는다. T259
    m = re.search(r"^## 5\..*?(?=^### 5\.1)", txt, re.S | re.M)
    if not m:
        return -1
    sec = m.group(0)
    n = 0
    for line in sec.split("\n"):
        if line.startswith("| ") and "---" not in line and "어느 판" not in line:
            n += 1
    return n


def check_solo(books, fails):
    """스무 판이 한 기기로 어떻게 도는지가 판마다 적혀 있는가. T249

    **판이 늘거나 이름이 바뀌면 이 표가 먼저 낡는다.** 그러면 기기가 하나인 날에
    이 판은 어떻게 도느냐를 그 자리에서 정하게 되고, 그 자리에서 정하면
    가리기가 필요한 판을 그냥 둘이 같이 보게 된다.

    규칙서가 원본이고 이 표는 규칙서를 따라간다. 하나라도 빠지면 실패다.
    """
    if not os.path.exists(SOLO):
        fails.append("docs/solo_plays.md 가 없다")
        return 0
    doc = io.open(SOLO, encoding="utf-8").read()
    shorts = [n.strip() for n, _ in books]

    def table(head, tail):
        """그 장의 표만 읽는다. **문서 전체를 긁으면 뒤 표가 앞 표를 덮는다.**
        3장과 7.3 이 꼴이 같은 표라 실제로 덮였다. 스무 판이 다 틀린 갈래로 나왔다."""
        a = doc.find(head)
        b = doc.find(tail, a if a >= 0 else 0)
        seg = doc[a:b] if a >= 0 else ""
        out = {}
        for m in re.finditer(r"^\| (\d+) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|$", seg, re.M):
            out[m.group(2).strip()] = m.group(3).strip().replace("**", "")
        return out

    rows = table("## 3. 판마다", "## 4.")
    # **이름을 손대지 않는다.** `rulebook()` 이 이미 절 번호를 뗀 이름을 준다.
    # 여기서 또 앞의 숫자를 떼려다 "3초 벽" 이 "초 벽" 이 됐다. T249
    for name, _rows in books:
        short = name.strip()
        if short not in rows:
            fails.append("docs/solo_plays.md 에 '%s' 판이 없다" % short)
            continue
        if rows[short] not in SOLO_KINDS:
            fails.append("'%s' 의 한 기기 갈래가 '%s' 다. 셋 중 하나여야 한다"
                         % (short, rows[short]))
    for got in rows:
        if got not in shorts:
            fails.append("docs/solo_plays.md 의 '%s' 가 규칙서에 없다" % got)
    # 기기가 아예 없는 날의 표도 같은 스무 판을 덮어야 한다 (7.3).
    prows = table("### 7.3", "### 7.4")
    for short in shorts:
        if short not in prows:
            fails.append("docs/solo_plays.md 7.3 에 '%s' 판이 없다" % short)
        elif prows[short] not in PAPER_KINDS:
            fails.append("'%s' 의 종이 갈래가 '%s' 다. 넷 중 하나여야 한다"
                         % (short, prows[short]))
    n_no = sum(1 for v in prows.values() if v == "안 돈다")
    m = re.search(r"\*\*안 도는 것이 (둘|셋|넷|다섯)이다\.\*\*", doc)
    KO = {"둘": 2, "셋": 3, "넷": 4, "다섯": 5}
    if not m:
        fails.append("docs/solo_plays.md 7.3 에 안 도는 판 수가 없다")
    elif KO[m.group(1)] != n_no:
        fails.append("종이로 안 도는 판이 %d개인데 '%s' 이라고 적었다" % (n_no, m.group(1)))

    # **두 사람이 읽는 것은 매뉴얼이다.** 규격 문서가 아니다. T251
    # 매뉴얼 10.14 가 같은 스무 판을 같은 갈래로 적고 있어야 한다.
    # 두 자리에 같은 표가 있으면 한쪽이 먼저 낡는다. 그 자리를 여기서 막는다.
    if os.path.exists(MANUAL):
        man = io.open(MANUAL, encoding="utf-8").read()
        a = man.find("### 10.14")
        b = man.find("## 11장", a if a >= 0 else 0)
        seg = man[a:b] if a >= 0 else ""
        if not seg:
            fails.append("매뉴얼에 10.14 판 고르기 자리가 없다")
        else:
            mrows = {}
            for m in re.finditer(r"^\| (\d+) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|$",
                                 seg, re.M):
                mrows[m.group(2).strip()] = (m.group(3).strip().replace("**", ""),
                                             m.group(4).strip().replace("**", ""))
            for short in shorts:
                if short not in mrows:
                    fails.append("매뉴얼 10.14 에 '%s' 판이 없다" % short)
                    continue
                one, pap = mrows[short]
                if one != rows.get(short):
                    fails.append("'%s' 한 기기 갈래가 매뉴얼은 '%s' 규격은 '%s' 다"
                                 % (short, one, rows.get(short)))
                if pap != prows.get(short):
                    fails.append("'%s' 종이 갈래가 매뉴얼은 '%s' 규격은 '%s' 다"
                                 % (short, pap, prows.get(short)))

    # 못 도는 판은 몇인가. 세어 둔 수와 실제가 같아야 한다.
    n_paper = sum(1 for v in rows.values() if v == "종이")
    m = re.search(r"^\| \*\*종이\*\* \|[^|]*\| (\d+) \|$", doc, re.M)
    if not m:
        fails.append("docs/solo_plays.md 2장에 종이 판 수가 없다")
    elif int(m.group(1)) != n_paper:
        fails.append("종이 판이 %d개인데 2장은 %s개라고 적었다" % (n_paper, m.group(1)))
    return len(rows)


def main():
    fails = []
    books = rulebook()
    P = plan()

    if len(books) != 20:
        fails.append("규칙서에 판이 %d개다. 스무 개여야 한다" % len(books))
    if len(P) != 20:
        fails.append("로드맵 12.9 에 판이 %d개다" % len(P))

    names = [n for n, _ in books]
    for n in names:
        if n not in P:
            fails.append("규칙서의 '%s' 가 12.9 표에 없다" % n)
    for n in P:
        if n not in names:
            fails.append("12.9 표의 '%s' 가 규칙서에 없다" % n)

    judges, roleless, mins = {}, 0, []
    for name, rows in books:
        cell = dict(rows)
        got = [k for k, _ in rows]

        # 아홉 줄이 이 차례로 다 있어야 한다
        if got != ROWS:
            fails.append("%s: 칸이 규격과 다르다 %s" % (name, got))
            continue
        # **빈 칸은 실패다.** "없다" 는 적은 것이고 빈 칸은 빠뜨린 것이다
        for k in ROWS:
            if not cell[k].strip():
                fails.append("%s: '%s' 칸이 비었다" % (name, k))

        head = cell["트랙 구조 분"]
        m = re.match(r"([^/]+)/([^/]+)/\s*(\d)분", head)
        if not m:
            fails.append("%s: 머리 줄이 '트랙 / 구조 / N분' 꼴이 아니다: %s" % (name, head))
            continue
        track, struct, mn = m.group(1).strip(), m.group(2).strip(), int(m.group(3))
        mins.append(mn)

        if mn > 5:
            fails.append("%s: %d분이다. 원칙 6은 5분이다" % (name, mn))
        if name in P:
            q = P[name]
            if q["min"] != mn:
                fails.append("%s: 규칙서 %d분, 12.9 표 %d분" % (name, mn, q["min"]))
            if q["track"] != track:
                fails.append("%s: 규칙서 트랙 %s, 12.9 표 %s" % (name, track, q["track"]))
            if q["struct"] != struct:
                fails.append("%s: 규칙서 구조 %s, 12.9 표 %s" % (name, struct, q["struct"]))

        # 원칙 5. 바뀌거나 없다고 적거나 그 판을 따르거나
        role = cell["역할"]
        if not any(w in role for w in ROLE_OK):
            fails.append("%s: 역할 칸이 바뀜도 없음도 안 적었다: %s" % (name, role))
        if "역할이 없다" in role:
            roleless += 1

        # 원칙 4. 못 했을 때 칸에 벌이 없다
        for w in PENALTY:
            if w in cell["못 했을 때"]:
                fails.append("%s: 못 했을 때 칸에 벌이 있다 (%s)" % (name, w))

        # 원칙 2 (P2 다듬음). 승패 표현만 막는다
        for w in WINLOSE:
            if w in cell["끝 조건"]:
                fails.append("%s: 끝 조건에 승패 표현이 있다 (%s)" % (name, w))

        # 원칙 1, V3. 사람별 값이 없고 셈은 있다
        val = cell["기록할 값"]
        for w in PERSON:
            if w in val:
                fails.append("%s: 기록할 값에 사람이 남는다 (%s)" % (name, w))
        if not any(w in val for w in COUNTED):
            fails.append("%s: 기록할 값에 무엇을 세는지가 없다: %s" % (name, val))

        judges[name] = cell["판정"]

    if mins and sum(mins) != 90:
        fails.append("분 합이 %d다. 90분이어야 한다" % sum(mins))
    if roleless != 3:
        fails.append("역할이 없다고 적은 판이 %d개다. 셋이어야 한다" % roleless)

    # 쓰는 것 칸의 '없음' 개수가 play_data.md 가 센 것과 같아야 한다
    none_here = [n for n, rows in books if "없음" in dict(rows).get("쓰는 것", "")]
    want = missing_data()
    if len(none_here) != want:
        fails.append("쓰는 것 칸의 없음이 %d개인데 play_data.md 는 %d개다: %s"
                     % (len(none_here), want, " ".join(none_here)))

    # **기계가 못 보는 것을 여기 적어 둔다.** 안 적으면 통과가 전부인 줄 안다
    by_app = [n for n, j in judges.items() if j.startswith("앱")]
    print("  판 %d개 / 아홉 줄 규격 / 분 합 %d분" % (len(books), sum(mins)))
    print("  사람이 판정하는 판 %d, 앱이 판정하는 판 %d" %
          (len(judges) - len(by_app), len(by_app)))
    print("  역할이 없다고 적은 판 %d / 자료가 없는 판 %d" % (roleless, len(none_here)))
    print("  **기계가 안 보는 것: 재미, 판정의 옳고 그름, 자료의 질**")
    # **찍기 전에 부른다.** 뒤에 두면 세기만 하고 안 보여 준다. 실제로 그랬다.
    nsolo = check_solo(books, fails)
    for m in fails:
        print("[실패] " + m)
    print("")
    print("놀이 규칙서 %d판 / 한 기기 갈래 %d판 / 실패 %d"
          % (len(books), nsolo, len(fails)))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
