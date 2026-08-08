#!/usr/bin/env python3
"""3층 대조판의 층을 검사한다. **2층은 내가 창작하지 않는다.**

기준서 6.4와 CLAUDE.md 가 정한 것이 셋이다.

1. 1층 기능 대화는 내가 쓴다. **상단에 "학습용 인공물" 표기가 필수다**
2. 2층 실제 발화는 **내가 창작하지 않는다.** 조준표가 채집 조건만 지정한다
3. 3층 대조판은 그 둘을 나란히 놓는다

**2번을 지금까지 아무것도 검사하지 않았다.** 파일 머리에 "대본 그대로라 실재가
보장된다" 고 적어 두었을 뿐이다. 적어 둔 것은 검사가 아니다.
T137 에 카드 머리의 같은 문구를 재 봤더니 절반이 틀렸다.

여기서 잰다. **2층 구역의 영어 줄은 52과 대본에 통째로 있어야 한다.**
한 줄이라도 없으면 그것은 내가 지어낸 것이거나 옮기다 고친 것이다.
둘 다 2층이 아니다. 2층이 아닌 것이 2층 자리에 있으면
**학습자는 그것을 실제 영어로 배운다.** 영어 제로라 가릴 수가 없다.

1층은 반대다. 안 나와도 된다. 내가 쓴 것이라고 적혀 있기 때문이다.
그래도 몇 줄이 우연히 겹치는지는 세어 둔다. 그 수가 크면 1층이 2층을 베낀 것이다.

쓰는 법:
    python3 scripts/check_layers.py

종료 코드 0이면 2층이 다 대본에 있는 것이다.
규격: docs/spec.md 6.4, CLAUDE.md 대화 자료 3층
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
REPO = ROOT.parent
TR = REPO / "media" / "english" / "transcripts"
DIALOG = ROOT / "out" / "dialog"

SPEAKER = re.compile(r"^[A-Z][A-Za-z .'-]{0,20}:\s*")
HANGUL = re.compile(r"[가-힣]")
ASCIIWORD = re.compile(r"[A-Za-z]{2,}")
SECTION = re.compile(r"^##\s*\[(\d)층\]")


def norm(s):
    s = SPEAKER.sub("", s)
    return " " + " ".join(re.sub(r"[^A-Za-z0-9]+", " ", s).lower().split()) + " "


def corpus():
    out = []
    for f in sorted(TR.glob("lle1-*.md")):
        t = f.read_text(encoding="utf-8")
        i = t.find("## 대본")
        n = 0
        for line in (t[i:] if i >= 0 else t).split("\n"):
            s = line.strip()
            if not s or s.startswith("#") or s.startswith("|"):
                continue
            n += 1
            out.append((f.stem, n, norm(s)))
    return out


def find(text, corp):
    needle = norm(text).strip()
    if not needle:
        return None
    for mid, n, hay in corp:
        if (" " + needle + " ") in hay:
            return "%s:%d" % (mid, n)
    return None


def main():
    if not DIALOG.exists():
        print("[실패] 대조판 자리가 없다: %s" % DIALOG)
        return 1
    corp = corpus()
    files = sorted(DIALOG.glob("eng2p_dialog_q*.md"))
    if not files:
        print("[실패] 대조판이 없다")
        return 1

    fails, warns = [], []
    n1 = n1hit = n2 = n2hit = 0
    for f in files:
        layer = None
        saw1 = False
        for raw in f.read_text(encoding="utf-8").split("\n"):
            s = raw.strip()
            m = SECTION.match(s)
            if m:
                layer = m.group(1)
                # **표기는 머리 줄에 붙어 있다.** `## [1층] 학습용 인공물` 이다.
                # 처음에는 머리 줄을 건너뛰고 본문만 봤다. 그래서 멀쩡한 열여섯 편이
                # 표기 없음으로 나왔다. 검사가 틀린 것을 결함으로 셀 뻔했다. T142
                if layer == "1" and "학습용 인공물" in s:
                    saw1 = True
                continue
            if layer == "1" and "학습용 인공물" in s:
                saw1 = True
            if not s or HANGUL.search(s) or not ASCIIWORD.search(s):
                continue
            if s[0] in "#|-*>" or s.startswith("검증") or s.startswith("신뢰도"):
                continue
            if layer == "1":
                n1 += 1
                if find(s, corp):
                    n1hit += 1
            elif layer == "2":
                n2 += 1
                where = find(s, corp)
                if where:
                    n2hit += 1
                else:
                    # **2층에 대본에 없는 줄이 있다.** 지어냈거나 옮기다 고친 것이다.
                    fails.append("%s 2층에 대본에 없는 줄이 있다: %s" % (f.name, s[:60]))
        if not saw1:
            fails.append("%s 1층에 '학습용 인공물' 표기가 없다" % f.name)

    for m in fails:
        print("[실패] " + m)
    for m in warns:
        print("[경고] " + m)
    print()
    print("대조판 %d편 / 2층 %d줄 중 대본에 있음 %d줄"
          % (len(files), n2, n2hit))
    print("     1층 %d줄 중 대본과 겹침 %d줄 (%.0f%%). **1층은 안 겹쳐도 된다. 내가 쓴 것이다**"
          % (n1, n1hit, 100.0 * n1hit / n1 if n1 else 0))
    print("실패 %d" % len(fails))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
