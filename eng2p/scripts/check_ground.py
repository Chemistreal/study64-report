#!/usr/bin/env python3
"""근거 없음 비율을 잰다. G구간의 게이트다.

`ground.py` 는 찾기만 하고 판정을 안 한다. 판정은 여기서 한다.

로드맵 11.10이 정한 선이 하나다.
**근거 없음이 절반을 넘는 목록은 목록 자체를 다시 짠다.**

지금은 열두 파일 중 넷이 그 선을 넘는다. 그러니 이 검사를 바로 게이트로 걸면
매 턴이 실패로 끝난다. 그래서 두 가지를 따로 낸다.

1. **되돌아감**: 아래 적어 둔 값보다 나빠지면 실패다. 지금부터 나빠지지 않는다
2. **남은 것**: 선을 넘는 파일이 몇 개인지 크게 적는다. 0이 되면 그때 게이트다

**아래 숫자는 통과 점수가 아니라 지금 서 있는 자리다.**
그것을 통과로 읽으면 이 검사가 거꾸로 쓰인다.

쓰는 법:
    python3 scripts/check_ground.py

종료 코드 0이면 되돌아간 파일이 없는 것이다. **선을 넘긴 것과는 다른 말이다.**
규격: docs/roadmap.md 11.10
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
GROUND = ROOT / "out" / "ground"
LINE = 0.50          # 로드맵 11.10. 근거 없음이 절반을 넘으면 목록을 다시 짠다

# T137 에 처음 재고 T139 에 내렸다. **통과 점수가 아니다.** 나빠지는 것만 막는다.
# 목록을 고칠 때마다 이 표를 같이 내린다. 표를 내리는 것이 이 구간의 일이다.
BASELINE = {
    "eng2p_ground_card_q1_001_050.md": 0.51,
    "eng2p_ground_card_q1_051_100.md": 0.70,
    "eng2p_ground_card_q1_101_150.md": 0.46,
    "eng2p_ground_card_q2_001_050.md": 0.55,
    "eng2p_ground_card_q2_051_100.md": 0.70,
    "eng2p_ground_card_q2_101_150.md": 0.79,
    "eng2p_ground_card_q3_001_050.md": 0.48,
    "eng2p_ground_card_q3_051_100.md": 0.33,
    "eng2p_ground_card_q3_101_150.md": 0.29,
    "eng2p_ground_card_q4_001_050.md": 0.11,
    "eng2p_ground_card_q4_051_100.md": 0.16,
    "eng2p_ground_card_q4_101_150.md": 0.23,
}
HEAD = re.compile(r"재료 (\d+)개 / 대본에 있음 (\d+)개")
WORDLIST = ROOT / "docs" / "wordlist.md"
CARDS = ROOT / "out" / "cards"
TR = ROOT.parent / "media" / "english" / "transcripts"
ITEM = re.compile(r"^\s{2,}(\d+)\.\s+(.+?)\s*$")
HANGUL = re.compile(r"[가-힣]")


def corpus_words():
    """52과 대본에 나오는 낱말 종류."""
    out = set()
    for f in TR.glob("lle1-*.md"):
        t = f.read_text(encoding="utf-8")
        i = t.find("## 대본")
        out.update(re.findall(r"[a-z]+", (t[i:] if i >= 0 else t).lower()))
    return out


def wordlist():
    """docs/wordlist.md 의 세 칸을 읽는다. {낱말: 칸이름}."""
    if not WORDLIST.exists():
        return None
    out, cur = {}, None
    infence = False
    for line in WORDLIST.read_text(encoding="utf-8").split("\n"):
        m = re.match(r"^##\s*\d+\.\s*(\S+)", line)
        if m:
            cur = m.group(1)
            continue
        if line.strip().startswith("```"):
            infence = not infence
            continue
        if infence and cur:
            for w in re.findall(r"[a-z]+", line.lower()):
                out[w] = cur
    return out


def outside_words(vocab):
    """카드 재료에 나오는 낱말 중 대본에 없는 것. {낱말: 몇 번}."""
    out = {}
    for f in sorted(CARDS.glob("eng2p_card_q*.md")):
        if "plan" in f.name:
            continue
        for line in f.read_text(encoding="utf-8").split("\n"):
            m = ITEM.match(line)
            if not m or HANGUL.search(m.group(2)):
                continue
            for w in re.findall(r"[a-z]+", m.group(2).lower()):
                if w not in vocab:
                    out[w] = out.get(w, 0) + 1
    return out


def main():
    if not GROUND.exists():
        print("[실패] %s 가 없다. ground.py 를 먼저 돌린다" % GROUND)
        return 1
    files = sorted(p for p in GROUND.glob("eng2p_ground_*.md")
                   if p.name != "eng2p_ground_index.md")
    if not files:
        print("[실패] 근거 보고서가 없다. ground.py 를 먼저 돌린다")
        return 1

    fails, over, rows = [], [], []
    tot_n = tot_g = 0
    for f in files:
        m = HEAD.search(f.read_text(encoding="utf-8"))
        if not m:
            fails.append("%s 에서 재료 수를 못 읽었다" % f.name)
            continue
        n, g = int(m.group(1)), int(m.group(2))
        tot_n += n
        tot_g += g
        miss = (n - g) / n if n else 0.0
        rows.append((f.name, n, n - g, miss))
        base = BASELINE.get(f.name)
        if base is None:
            fails.append("%s 가 기준표에 없다. 새로 생겼으면 표에 넣는다" % f.name)
        elif miss > base + 0.005:
            fails.append("%s 근거 없음이 %.0f%% 다. 전에는 %.0f%% 였다. 나빠졌다"
                         % (f.name, miss * 100, base * 100))
        if miss > LINE:
            over.append((f.name, miss))
    for name in BASELINE:
        if not (GROUND / name).exists():
            fails.append("%s 가 없어졌다" % name)

    # **대본 밖 낱말은 목록에 적혀 있어야 한다.**
    # 지어낸 철자를 하나 넣으려면 그 철자를 목록에 적어야 한다. 적히면 보인다.
    # 비율은 말뭉치가 작아서 흔들린다. 이 검사는 안 흔들린다. 있거나 없거나다.
    known = wordlist()
    todo = []
    if known is None:
        fails.append("docs/wordlist.md 가 없다")
    else:
        vocab = corpus_words()
        outs = outside_words(vocab)
        unlisted = sorted(w for w in outs if w not in known)
        if unlisted:
            fails.append("대본에도 없고 목록에도 없는 낱말 %d개: %s"
                         % (len(unlisted), " ".join(unlisted[:12])))
        todo = sorted(w for w in outs if known.get(w) == "고칠")
        gone = sorted(w for w, k in known.items() if k == "고칠" and w not in outs)
        if gone:
            fails.append("목록의 고칠 것 %s 가 재료에 없다. 다 고쳤으면 목록에서 뺀다"
                         % " ".join(gone))

    for m in fails:
        print("[실패] " + m)
    print()
    for name, n, miss_n, miss in sorted(rows, key=lambda x: -x[3]):
        mark = "선 넘음" if miss > LINE else "      "
        print("  %s %-40s 재료 %4d / 없음 %4d (%3.0f%%)" % (mark, name, n, miss_n, miss * 100))
    print()
    print("합계 재료 %d개 / 근거 없음 %d개 (%.0f%%)"
          % (tot_n, tot_n - tot_g, 100.0 * (tot_n - tot_g) / tot_n if tot_n else 0))
    if over:
        print("다시 짤 것: " + " ".join(n for n, _ in over))
    # 마지막 줄이 all.py 요약에 뜬다. **남은 개수가 거기 있어야 한다.**
    if todo:
        print("지어낸 철자 %d개가 남았다: %s" % (len(todo), " ".join(todo)))
    print("되돌아간 파일 %d개 / 지어낸 철자 %d개 / **선을 넘는 목록 %d개. 셋 다 0이어야 G구간이 끝난다**"
          % (len(fails), len(todo), len(over)))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
