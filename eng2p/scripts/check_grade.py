#!/usr/bin/env python3
"""등급과 재료가 어긋나는 자리를 잡는다.

**등급은 파일 머리에 한 번 붙고 재료는 줄에 있다.** 그 사이가 비어 있었다.

`collect_b.py` 는 `신뢰도: B` 인 파일만 걷는다. 그래서 A등급 파일이 B등급 재료를
담고 있으면 그 재료는 어디에도 안 잡힌다. 비상판 넷이 그 자리다.
근거 없는 표현을 제일 많이 쓰는데 큐에 한 건도 없다. T420 에 쟀다.

여기서 잡는 것은 영어의 옳고 그름이 아니다. **표기가 있느냐 없느냐다.**
CLAUDE.md 가 1층 대화에 학습용 인공물 표기가 빠지면 심각한 결함이라고 적었다.
까닭은 읽는 쪽이 스스로 알아챌 수 없기 때문이다. 여기도 같다.
**A라고 적힌 파일에서 B등급 목록을 꺼내 쓰면 읽는 쪽은 그것이 B인 줄 모른다.**

## 무엇을 목록으로 세나

CLAUDE.md 가 B등급을 이렇게 적었다. 연어와 청크 목록, 레지스터, 화용 표현.
**목록이라는 말이 그 정의의 한가운데 있다.** 그래서 목록을 센다.

    (한줄) 한 줄에 두 낱말 이상 영어 조각이 셋 이상 늘어선 줄
           `청크 5분: Nice to meet you / Where are you from / Let's go`
    (묶음) 영어만 있고 문장 부호로 안 끝나는 줄이 셋 이상 잇달아 오는 자리
           강의가 목록을 적는 꼴이 이것이다

셋으로 자른 것은 `docs/verify_plan.md` 1.1 이 106건을 가를 때 쓴 자와 같다.
둘은 대조고 셋부터 목록이다. **셋을 골라 늘어놓았으면 고른 사람이 있다.**

빼는 것도 적어 둔다. 문장 부호가 있는 줄은 문장이라 뺀다. `ground.py` 와 같은 자다.
대본 과 번호를 대는 줄(`31과에 ... 가 있다`)은 인용이라 뺀다. 고른 것이 아니다.

**이것은 목록으로 보이는 자리다.** 마지막 판정은 사람이 한다.
이 검사가 하는 일은 그 자리가 **늘어나는 것을 막는 것**이다.

## 표기를 갖췄다는 것

목록을 담은 A등급 파일이 둘 중 하나를 적으면 표기가 있는 것이다.

    원본:     그 목록이 어디서 왔는지. 등급을 따라갈 수 있다
    검증대상: 무엇을 검증해야 하는지. `collect_b.py` 가 이것을 보고 큐에 들인다

강의록 97편이 앞의 것을 이미 하고 있다. 원본을 적고 손으로 적은 줄이 없다고 적었다.
비상판과 세트와 A등급 강의는 **같은 일을 하면서 표기만 빠졌다.** 그것이 결함이다.

쓰는 법:
    python3 scripts/check_grade.py

종료 코드 0이면 표와 같은 것이다. **어긋난 자리가 없다는 말이 아니다.**
규격: docs/verify_plan.md 6장, 9장
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
QUEUE = ROOT / "state" / "verify_queue.md"

# 두 낱말 이상 이어진 영어. ground.py 의 SPAN 과 같은 자다.
SPAN = re.compile(r"[A-Za-z][A-Za-z'’]*(?:\s+[A-Za-z][A-Za-z'’]*)+")
WORD = re.compile(r"[A-Za-z]{2,}")
HANGUL = re.compile(r"[가-힣]")
MARK = re.compile(r"^(?:[-*>]\s+|\d+\.\s+)+")
# 대본을 대고 있는 줄이다. 고른 것이 아니라 옮긴 것이다.
CITE = re.compile(r"\d+과|lle1-")
MIN = 3

# 파생물과 관리 문서는 등급 뒤에 `생성 (...)` 을 붙인다. **내용 등급이 아니다.**
# `신뢰도: A` 는 이 파일의 내용이 A라는 말이고 `신뢰도: A 생성 (파생)` 은
# 이 파일을 어떻게 만들었는지를 적은 말이다. 둘을 같이 세면 안 된다.
GRADE = re.compile(r"^신뢰도:\s*([ABC])([A-Za-z-]*)(.*)$", re.M)
# `\s*` 를 쓰면 안 된다. 빈 칸에서 줄바꿈까지 먹고 아랫줄을 값으로 읽는다.
# `검증대상:` 이 비었는데 `검증로그:` 를 값으로 물어 오면 온 파일이 표기를 갖춘 것이 된다.
FIELD = re.compile(r"^(원본|검증대상|검증로그):[ \t]*(.*)$", re.M)

SKIP = ("/ground/", "/data/", "/app/")


# **표기가 빠진 자리.** 아래 숫자는 통과 점수가 아니라 지금 서 있는 자리다.
#
# 자리마다 왜 비었는지는 `docs/verify_plan.md` 9장에 적었다.
# 고치는 길은 둘이다. 목록의 집을 `원본:` 으로 대든지 `검증대상:` 을 적든지다.
# **하나를 고치면 이 표에서 그 줄을 뺀다.** 표를 내리는 것이 이 구간의 일이다.
#
# 0을 바로 걸지 않은 까닭이 있다. 지금 열여섯이고 이 턴에 고칠 권한이 없었다.
# 늘 실패하는 검사기는 아무도 안 본다. 안 보는 검사기는 없는 것과 같다.
# **대신 표에 없는 파일이 어긋나면 바로 실패다. 구멍이 안 커진다.**
BASELINE = {
    "eng2p_emg_001_020.md": 18,
    "eng2p_emg_021_040.md": 13,
    "eng2p_emg_041_060.md": 14,
    "eng2p_emg_061_080.md": 16,
    "eng2p_q1_l002.md": 1,
    "eng2p_q1_l003.md": 1,
    "eng2p_q1_l004.md": 1,
    "eng2p_q1_l005.md": 2,
    "eng2p_q1_l006.md": 1,
    "eng2p_q1_l011.md": 2,
    "eng2p_q1_l012.md": 2,
    "eng2p_set_w04.md": 1,
    "eng2p_set_w05.md": 1,
    "eng2p_set_w09.md": 1,
    "eng2p_set_w14.md": 1,
}


def bare(s):
    """줄머리 표시를 뗀다."""
    s = MARK.sub("", s.strip())
    if s.startswith("신뢰도") or s.startswith("검증") or s.startswith("원본"):
        return ""
    return s


def inline(s):
    """한 줄에 늘어놓은 목록인가. 조각 수를 낸다."""
    s = bare(s)
    if not s or s[0] in "|#`" or re.search(r"[.?!]", s) or CITE.search(s):
        return 0
    parts = []
    for a in s.split(" / "):
        parts.extend(a.split(", "))
    return sum(1 for p in parts if SPAN.search(p))


def solo(s):
    """영어만 있는 줄인가. 문장이면 아니다."""
    s = bare(s)
    if not s or s[0] in "|#`" or HANGUL.search(s) or not WORD.search(s):
        return False
    return s[-1] not in ".?!:"


def label(s):
    """묶음을 안 끊는 줄인가. 빈 줄과 짧은 한글 이름표다.

    강의가 목록을 토막 내어 적는 일이 있다. 88강이 그렇다.

        1단계
        Anyway
        I should go

        2단계
        So we said

    **여덟을 골라 놓고 이름표로 넷씩 갈라 적은 것이다.** 목록이 아닌 것이 아니다.
    이 자리를 안 이으면 두 줄짜리 토막 넷이 되고 셋에 못 미쳐 다 빠진다.
    강의록이 같은 여덟을 한 칸에 모아 뽑는 것이 그 증거다.
    """
    s = s.strip()
    return not s or (len(s) <= 8 and not WORD.search(s))


def places(text):
    """목록 자리를 낸다. [(첫줄, 몇줄, 갈래), ...]"""
    out, run, gap, fence = [], [], 0, False
    for i, raw in enumerate(text.split("\n"), 1):
        if raw.strip().startswith("```"):
            fence = not fence
            run = []
            continue
        if fence:
            continue
        if inline(raw) >= MIN:
            out.append((i, 1, "한줄"))
            run, gap = [], 0
            continue
        if solo(raw):
            run.append(i)
            gap = 0
            continue
        # 이름표와 빈 줄은 둘까지 건너뛴다. 셋이 이어지면 목록이 끝난 것으로 본다.
        if run and gap < 2 and label(raw):
            gap += 1
            continue
        if len(run) >= MIN:
            out.append((run[0], len(run), "묶음"))
        run, gap = [], 0
    if len(run) >= MIN:
        out.append((run[0], len(run), "묶음"))
    return out


def head(text):
    """머리의 등급과 딸린 칸을 읽는다. (등급자, 내용등급인가, 칸)"""
    m = GRADE.search(text)
    if not m:
        return None, False, {}
    f = {k: v.strip() for k, v in FIELD.findall(text)}
    return m.group(1), not m.group(3).strip(), f


def files():
    for p in sorted(OUT.rglob("*.md")):
        if any(s in p.as_posix() for s in SKIP):
            continue
        yield p


def main():
    if not OUT.exists():
        print("[실패] %s 가 없다" % OUT)
        return 1

    fails, rows, flip = [], [], []
    grades = {}
    for p in files():
        g, _bare, _f = head(p.read_text(encoding="utf-8"))
        grades[p.name] = g
    for p in files():
        text = p.read_text(encoding="utf-8")
        g, only, f = head(text)
        src = f.get("원본", "")
        # 파생물이 원본보다 높은 등급을 달았나. **세기만 한다.**
        # 고칠 자리는 파생기 안이고 이 검사기가 손댈 자리가 아니다.
        if src and g == "A":
            for name in re.findall(r"eng2p_[a-z0-9_]+\.md", src):
                if grades.get(name) == "B":
                    flip.append((p.name, name))
                    break
        # **내용 등급이 A라고 적은 파일만 본다.** `생성 (파생)` 은 만든 법을 적은 것이다.
        if g != "A" or not only:
            continue
        pl = places(text)
        if not pl:
            continue
        if src or f.get("검증대상"):
            continue                     # 표기가 있다. 따라갈 수 있다
        rows.append((p, pl))

    got = {p.name: len(pl) for p, pl in rows}
    for name in sorted(got):
        if name not in BASELINE:
            fails.append("%s 가 표에 없는데 표기가 빠졌다. 새로 생긴 구멍이다" % name)
        elif got[name] != BASELINE[name]:
            fails.append("%s 목록 자리가 %d개다. 표에는 %d개다. 표를 고친다"
                         % (name, got[name], BASELINE[name]))
    for name in sorted(BASELINE):
        if name not in got:
            # 표기를 갖춰서 빠질 수도 있고 등급 줄을 갈아 끼워서 빠질 수도 있다.
            # **둘을 여기서 안 가른다.** 어느 쪽이든 사람이 한 번 봐야 하는 자리다.
            fails.append("%s 가 이제 안 잡힌다. 표기를 갖췄으면 표에서 빼고 "
                         "아니면 왜 빠졌는지 본다" % name)

    # **검증대상을 적었으면 큐에 있어야 한다.** 없으면 collect_b.py 를 안 돌린 것이다.
    q = QUEUE.read_text(encoding="utf-8") if QUEUE.exists() else ""
    if not q:
        fails.append("state/verify_queue.md 가 없다. collect_b.py 를 먼저 돌린다")
    else:
        for p in files():
            _g, _only, f = head(p.read_text(encoding="utf-8"))
            if f.get("검증대상") and p.name not in q:
                fails.append("%s 가 검증대상을 적었는데 큐에 없다. collect_b.py 를 돌린다"
                             % p.name)

    for m in fails:
        print("[실패] " + m)
    print()
    print("== 등급은 A인데 목록을 담고 표기가 빠진 자리 ==")
    for p, pl in sorted(rows, key=lambda x: -len(x[1])):
        print("  %-28s %2d자리  %s" % (p.name, len(pl),
              " ".join("%d줄(%d%s)" % (a, b, c) for a, b, c in pl[:5])
              + (" 외 %d" % (len(pl) - 5) if len(pl) > 5 else "")))
    if not rows:
        print("  (없음)")
    print()
    print("파생물이 원본보다 높은 등급을 단 자리 %d개. **세기만 한다**" % len(flip))
    if flip:
        print("  %s 외 %d개. 고칠 자리는 scripts/derive_handout.py 안이다"
              % (flip[0][0], len(flip) - 1))
    print()
    print("표기 빠진 파일 %d개 / 목록 자리 %d개. **둘 다 0이 되면 그때 게이트다**"
          % (len(rows), sum(got.values())))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
