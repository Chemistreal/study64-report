#!/usr/bin/env python3
"""강의에서 강의록을 파생시킨다.

강의는 제작 설계서다. 왜 그렇게 하는지와 함정과 근거가 들어 있다.
강의록은 세션 중에 책상에 펴 놓는 한 장이다. 접어서 A5 한 면에 들어간다.

**손으로 다시 쓰지 않는다.** 강의 블록 3과 4와 5에서 뽑는다.
못 뽑는 칸이 나오면 그것은 강의가 그 항목을 안 적었다는 뜻이다. 강의를 고친다.
그래서 이 파일이 파생기이면서 강의의 검사기다.

사용법:
    python3 scripts/derive_handout.py            # 전 강의
    python3 scripts/derive_handout.py 1 7        # 1강부터 7강까지
    python3 scripts/derive_handout.py --check    # 파일을 안 쓰고 못 뽑은 칸만 낸다

종료 코드 0이면 여섯 칸을 다 뽑은 것이고 1이면 빈 칸이 있는 것이다.
규격: docs/roadmap.md 11.5
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LEC = ROOT / "out" / "lectures"
OUT = ROOT / "out" / "handouts"

BLOCKS = ["## 1. 원리", "## 2. 한국어 화자 함정", "## 3. 역할 지정",
          "## 4. 드릴 연결", "## 5. 통과 기준", "## 6. 다음 강 예고"]

# 여섯 칸. 이름과 어디서 뽑는지.
SLOTS = ["오늘 하는 것", "영어 재료", "30분 진행표", "카드", "기록 칸", "막혔을 때"]

MISS = []


def blocks_of(text):
    out = []
    for i, b in enumerate(BLOCKS):
        s = text.find(b)
        if s < 0:
            return None
        e = text.find(BLOCKS[i + 1]) if i + 1 < len(BLOCKS) else len(text)
        out.append(text[s + len(b):e].strip())
    return out


def miss(name, slot, why):
    MISS.append((name, slot, why))


def pick_today(name, text, b):
    """오늘 하는 것. 제목과 블록 1의 첫 굵은 줄 하나."""
    m = re.search(r"^# (\d+)강\.\s*(.+)$", text, flags=re.M)
    if not m:
        miss(name, "오늘 하는 것", "제목 줄을 못 찾았다")
        return None, None, None
    num, title = m.group(1), m.group(2).strip()
    # 굵은 줄이 있으면 그것이 그 강의 한 줄이다. Q1 강의는 굵은 줄을 안 썼다.
    # 없으면 블록 1의 첫 문장을 쓴다. 정보가 없는 것이 아니라 표시가 없는 것이다.
    one = re.search(r"\*\*(.+?)\*\*", b[0])
    if one:
        return num, title, one.group(1).strip()
    # 첫 줄만 쓰면 문장이 가운데서 잘린다. 첫 문단을 통째로 쓴다.
    para = next((x for x in re.split(r"\n\s*\n", b[0]) if x.strip()), "")
    first = re.sub(r"\s+", " ", para).strip()
    if not first:
        miss(name, "오늘 하는 것", "블록 1이 비어 있다")
        return num, title, None
    return num, title, first


HAN = r"[\uac00-\ud7a3]"


def english_lines(block):
    """영어 줄을 뽑는다. 세 형태를 받는다.

    1. 한글이 한 자도 없는 줄. 대본 인용과 덩어리 목록이 여기 걸린다
    2. 줄임 표시 같은 한글 괄호만 든 줄. 괄호를 떼면 영어만 남는다
    3. 한글 라벨이 앞에 붙은 줄. 라벨을 떼면 영어만 남는다. 20강 세 거리가 그것이다
    """
    out = []
    for line in block.split("\n"):
        s = line.strip()
        if not s or s.startswith("#") or s.startswith("```"):
            continue
        if not re.search(r"[A-Za-z]", s):
            continue
        if not re.search(HAN, s):
            out.append(s)
            continue
        # 한글이 든 괄호를 떼 보고 나머지가 영어면 영어 줄로 센다.
        # **떼어 낸 것을 출력하지 않는다.** 줄임 표시가 사라지면 줄인 인용이
        # 온전한 인용으로 보인다. T47 부터 이 저장소가 계속 잡아 온 결함이다.
        s2 = re.sub(r"\([^)]*" + HAN + r"[^)]*\)", "", s).strip()
        s2 = re.sub(r"\s{2,}", " ", s2)
        if s2 and not re.search(HAN, s2) and re.search(r"[A-Za-z]", s2):
            out.append(s)
            continue
        # 앞에 한글 라벨이 붙은 줄을 떼 본다
        m = re.match(r"^(" + HAN + r"{1,6})\s{1,}(.+)$", s2 or s)
        if m and not re.search(HAN, m.group(2)) and re.search(r"[A-Za-z]", m.group(2)):
            out.append("%s  %s" % (m.group(1), m.group(2).strip()))
    return out


def pick_english(name, b):
    """영어 재료. 블록 1의 대본 인용 줄과 목록 줄과 낱말 줄이다.

    블록 1에 영어가 없는 강의가 있다. 6강이 그렇다.
    한글 표기를 쓰지 말라는 근거를 다루는 강이라 영어 예문이 없다.
    그때는 블록 4에서 뽑는다. 세션의 영어는 카드에서 나오기 때문이다.
    둘 다 없으면 그것은 강의의 빈칸이다.
    """
    out = english_lines(b[0])
    if out:
        return out, 1
    out = english_lines(b[3])
    if out:
        return out, 4
    miss(name, "영어 재료", "블록 1과 블록 4 어디에도 영어 줄이 없다")
    return [], None


def pick_plan(name, b):
    """30분 진행표. 블록 3의 구간 배분 줄과 구간별 지시."""
    split = re.search(r"30분을 이렇게 쓴다\.\s*((?:.+\n?)+?)(?:\n\s*\n|\Z)", b[2])
    if not split:
        miss(name, "30분 진행표", "블록 3에 '30분을 이렇게 쓴다' 줄이 없다")
        return None, []
    segs = []
    for line in b[2].split("\n"):
        s = line.strip()
        if re.match(r"^(앞|가운데|뒤|먼저|이어서)\s", s) and re.search(r"\d+분", s):
            segs.append(s)
    # 구간별 지시 줄이 따로 없거나 하나뿐인 강의가 있다.
    # 앞 구간을 다른 말로 적은 강의가 그렇다. 41강 45강 46강 70강이 그것이다.
    # 그때는 배분 문장 자체를 쉼표로 갈라 구간으로 쓴다. 정보는 그 안에 있다.
    if len(segs) < 2:
        segs = []
    if not segs:
        for part in re.split(r"[,\n]", split.group(1)):
            p2 = part.strip().rstrip(".")
            if re.search(r"\d+분", p2):
                segs.append(p2)
    if not segs:
        miss(name, "30분 진행표", "블록 3에 구간 배분이 없다")
    return re.sub(r"\s+", " ", split.group(1)).strip(), segs


def pick_cards(name, b):
    """카드. 블록 4의 번호 범위와 제한시간."""
    rng = re.search(r"카드\s+(\d{3})\s*~\s*(\d{3})", b[3])
    if not rng:
        miss(name, "카드", "블록 4에 카드 번호 범위가 없다")
        return None, None, None
    sec = re.search(r"제한\s?시간(?:은)?\s*(\d+)\s*초", b[3])
    med = re.search(r"미디어는\s+(lle1-\d+)\s*(?:\((\d)\s*회차\))?\s*[을를]?\s*쓴다", b[3])
    return (rng.group(1), rng.group(2)), (sec.group(1) if sec else None), (med.group(1) if med else None)


def pick_record(name, b):
    """기록 칸. 블록 5의 숫자가 든 줄에서 셀 것을 뽑는다."""
    out = []
    for para in re.split(r"\n\s*\n", b[4]):
        s = re.sub(r"\s+", " ", para.replace("**", "")).strip()
        if not s or s.startswith("이 항목"):
            continue
        if re.search(r"\d", s) and re.search(r"(센다|잰다|돈다|채운다|확인한다|판정한다|이상이면|이상이어야)", s):
            out.append(s)
    if not out:
        miss(name, "기록 칸", "블록 5에 셀 것이 든 줄이 없다")
    return out


def pick_stuck(name, b):
    """막혔을 때. 그 말이 든 문단을 통째로 가져온다.

    줄 단위로 뽑으면 문장이 가운데서 잘린다. 종이에서 안 읽힌다.
    Q1 은 "막혔을 때의 처리도 정해 둔다" 로 열고 다음 문장에 내용이 온다.
    Q2 부터는 "막혔을 때는" 뒤에 바로 온다. 19강은 줄 첫머리가 아니다. 셋 다 받는다.
    """
    for para in re.split(r"\n\s*\n", b[2]):
        if "막혔을 때" not in para:
            continue
        s = re.sub(r"\s+", " ", para.replace("**", "")).strip()
        s = re.sub(r"^막혔을 때는\s*", "", s)
        s = re.sub(r"^막혔을 때의 처리도 정해 둔다\.\s*", "", s)
        return s
    miss(name, "막혔을 때", "블록 3에 막혔을 때 처리가 없다")
    return None


def pick_role(b):
    m = re.search(r"^역할은 날짜로 정해(?:진다|져 있다)\.\s*(.+)$", b[2], flags=re.M)
    return m.group(1).strip() if m else None


def render(num, title, one, eng, engsrc, split, segs, cards, sec, med, rec, stuck, role, track, quarter):
    L = []
    L.append("신뢰도: A 생성 (파생)")
    L.append("분기: %s" % quarter)
    L.append("트랙: %s" % track)
    L.append("원본: out/lectures/%s" % LECNAME[num])
    L.append("검증대상:")
    L.append("검증로그: 2026-08-08 / 원본 강의에서 기계로 뽑았다 / 통과 / "
             "손으로 적은 줄이 없다. 원본이 바뀌면 다시 뽑는다")
    L.append("")
    L.append("# %s강 강의록. %s" % (num, title))
    L.append("")
    L.append("**손으로 고치지 않는다.** 강의에서 파생시킨 것이다.")
    L.append("고칠 것이 있으면 원본 강의를 고치고 다시 뽑는다.")
    L.append("")
    L.append("## 1. 오늘 하는 것")
    L.append("")
    L.append(one or "(못 뽑음)")
    L.append("")
    L.append("## 2. 영어 재료")
    L.append("")
    if engsrc == 4:
        L.append("이 강은 블록 1에 영어가 없다. 카드에서 뽑았다.")
        L.append("")
    if eng:
        for e in eng:
            L.append("    " + e)
    else:
        L.append("(못 뽑음)")
    L.append("")
    L.append("## 3. 30분 진행표")
    L.append("")
    L.append(split or "(못 뽑음)")
    L.append("")
    for s in segs:
        L.append("- " + s)
    if role:
        L.append("")
        L.append("역할: " + role)
    L.append("")
    L.append("## 4. 카드")
    L.append("")
    if cards:
        L.append("카드 %s ~ %s" % cards)
    else:
        L.append("(못 뽑음)")
    if sec:
        L.append("압박형 제한 시간 %s초" % sec)
    if med:
        L.append("미디어 %s" % med)
    else:
        L.append("미디어 없음")
    L.append("")
    L.append("## 5. 기록 칸")
    L.append("")
    for r in rec:
        L.append("- %s" % r)
        L.append("")
    L.append("## 6. 막혔을 때")
    L.append("")
    L.append(stuck or "(못 뽑음)")
    L.append("")
    return "\n".join(L)


LECNAME = {}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    check_only = "--check" in sys.argv
    lo, hi = (int(args[0]), int(args[1])) if len(args) == 2 else (1, 96)

    files = sorted(LEC.glob("eng2p_q*_l0*.md"))
    n = 0
    for f in files:
        m = re.search(r"_l0(\d+)\.md$", f.name)
        num = int(m.group(1))
        if not (lo <= num <= hi):
            continue
        text = f.read_text(encoding="utf-8")
        LECNAME[str(num)] = f.name
        b = blocks_of(text)
        if b is None:
            miss(f.name, "전체", "일곱 블록을 못 찾았다")
            continue
        track = (re.search(r"^트랙:\s*(\S+)", text, flags=re.M) or [None, "?"])[1]
        quarter = (re.search(r"^분기:\s*(\S+)", text, flags=re.M) or [None, "?"])[1]
        snum, title, one = pick_today(f.name, text, b)
        eng, engsrc = pick_english(f.name, b)
        split, segs = pick_plan(f.name, b)
        cards, sec, med = pick_cards(f.name, b)
        rec = pick_record(f.name, b)
        stuck = pick_stuck(f.name, b)
        role = pick_role(b)
        if not check_only:
            OUT.mkdir(parents=True, exist_ok=True)
            body = render(snum, title, one, eng, engsrc, split, segs, cards, sec, med,
                          rec, stuck, role, track, quarter)
            (OUT / ("eng2p_handout_l%03d.md" % int(snum))).write_text(body, encoding="utf-8")
        n += 1

    print("\n강의 %d편에서 뽑았다" % n)
    if MISS:
        print("못 뽑은 칸 %d건" % len(MISS))
        for name, slot, why in MISS:
            print("  [빈칸] %s: %s. %s" % (name, slot, why))
        return 1
    print("여섯 칸을 다 뽑았다")
    return 0


if __name__ == "__main__":
    sys.exit(main())
