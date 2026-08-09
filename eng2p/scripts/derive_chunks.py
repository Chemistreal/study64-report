#!/usr/bin/env python3
"""이어달리기 판이 쓸 **청크 목록**을 52과 대본에서 뽑는다. T270

`docs/play_rules.md` 4.1 이 쓰는 것을 "오늘 강의의 청크 목록. **있다**" 라고 적었다.

**T267 에서 만난 그 자리를 또 만났다.** 청크는 강의 본문에 있다. 줄글 안에
낱말 몇 개짜리 줄로 적혀 있고 앱이 그것을 못 읽는다. **원재료가 있다는 뜻이었다.**

## 무엇을 세는가

이어 붙는 덩어리를 대본에서 센다. 두 낱말에서 네 낱말까지 보고
**대본 전체에서 네 번 넘게 나온 것**만 남긴다.

    문장 경계를 안 넘는다      쉼표와 마침표에서 끊는다. 걸친 것은 덩어리가 아니다
    이름이 든 것은 뺀다        `Anna` 가 든 덩어리는 그 대본에서만 산다
    긴 것을 먼저 남긴다        `where are you from` 이 있으면 `are you from` 은 뺀다

셋째가 이 판에 중요하다. 이어달리기는 **덩어리로 나오는가**를 보는 판이다
(규칙서 2.2). 짧은 조각을 주면 낱말을 고르는 것과 구별이 안 된다.

## 등급

    A   그 덩어리가 대본에 몇 번 나오나        셀 수 있다
    B   **그것이 청크인가**                    CLAUDE.md 등급표가 청크 목록을 B로 정했다

둘째가 이 파일이 B등급인 이유다. 자주 나오는 것과 통째로 저장되는 것은 다르다.
자주 나오는 것은 셀 수 있고 통째로 저장되는지는 내가 못 잰다.

쓰는 법:
    python3 scripts/derive_chunks.py

결과: out/data/chunks.json 과 chunks.js
규격: docs/play_rules.md 4.1, CLAUDE.md 신뢰도 등급
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "out", "data")
SRC = os.path.join(OUT, "transcripts.js")

MIN_N, MAX_N = 2, 4          # 덩어리 길이
MIN_FREQ = 4                 # 대본 전체에서 몇 번 넘게 나와야 하나
PER = 12                     # 한 과에 몇 개까지 담나

# 낱말이 아닌 소리와 줄임말 조각. T258 부터 쓰는 그 목록이다.
SKIP = {"ve", "re", "ll", "hm", "hmm", "ha", "haha", "shh", "shhh", "uh",
        "oh", "ah", "eh", "mm", "mmm", "ow", "wow", "um"}


def pieces(body):
    """한 줄을 문장 토막으로 자른다. **덩어리는 토막을 안 넘는다.**

    자르기 전에 굽은 홑따옴표를 곧은 것으로 바꾼다. 대본이 `it’s` 로 적혀 있는데
    곧은 것만 낱말로 치면 `it` 과 `s` 로 쪼개진다. `it s` 와 `let s` 와 `don t` 가
    청크로 뽑혔다 (T270). **줄임말은 한 덩어리다.**
    """
    body = body.replace("\u2019", "'")
    return [p for p in re.split(r"[.!?,;:()\"]+", body) if p.strip()]


def lines():
    raw = io.open(SRC, encoding="utf-8").read()
    obj = json.loads(raw[raw.index("=") + 1:].rstrip().rstrip(";"))
    out = {}
    for mid, ls in obj["items"].items():
        out[mid] = [re.sub(r"^[A-Z][A-Za-z .'-]{0,20}:\s*", "", ln) for ln in ls]
    return out


def main():
    if not os.path.exists(SRC):
        print("[실패] %s 가 없다" % SRC)
        return 1
    all_lines = lines()

    # 이름 거르개. 한 번도 소문자로 안 나오면 이름으로 본다 (T261).
    low_seen = set()
    for ls in all_lines.values():
        for body in ls:
            for w in re.findall(r"[A-Za-z']+", body):
                if w[0].islower():
                    low_seen.add(w.lower())

    def words(piece):
        out = []
        for w in re.findall(r"[A-Za-z']+", piece):
            k = w.lower().strip("'")
            if not k or k in SKIP:
                return None          # 조각이 끼면 그 토막은 통째로 버린다
            if k not in low_seen and w[:1].isupper():
                return None          # 이름이 든 토막은 안 쓴다
            out.append(k)
        return out

    freq, where = {}, {}
    for mid, ls in all_lines.items():
        for body in ls:
            for piece in pieces(body):
                ws = words(piece)
                if not ws:
                    continue
                for n in range(MIN_N, MAX_N + 1):
                    for i in range(len(ws) - n + 1):
                        g = " ".join(ws[i:i + n])
                        freq[g] = freq.get(g, 0) + 1
                        where.setdefault(g, set()).add(mid)

    keep = {g: c for g, c in freq.items() if c >= MIN_FREQ}
    # **긴 것을 먼저 남긴다.** 긴 덩어리가 있으면 그 안의 짧은 것은 안 쓴다.
    # 짧은 조각을 주면 낱말을 고르는 것과 구별이 안 된다 (규칙서 2.2).
    #
    # **거의 그 안에서만 나오는 짧은 것을 뺀다.** 반씩 더 나오면 남긴다.
    # `where are` 10회 는 `where are you` 7회 안에서 거의 다 나온다. 뺀다.
    # `are you` 46회 는 `where are you` 7회 말고도 많이 나온다. 남긴다.
    # 자리를 딱 잘라 정할 수는 없다. 반이라는 선은 내가 정했고 그래서 B등급이다.
    longs = sorted(keep, key=lambda g: -len(g.split()))
    drop = set()
    for g in longs:
        if g in drop:
            continue
        gs = g.split()
        for n in range(MIN_N, len(gs)):
            for i in range(len(gs) - n + 1):
                sub = " ".join(gs[i:i + n])
                if sub != g and sub in keep and freq[sub] < freq[g] * 1.5:
                    drop.add(sub)
    keep = {g: c for g, c in keep.items() if g not in drop}

    out, thin = {}, []
    for mid in sorted(all_lines):
        here = [(freq[g], g) for g in keep if mid in where[g]]
        here.sort(key=lambda x: (-x[0], -len(x[1].split()), x[1]))
        out[mid] = [{"c": g, "n": f} for f, g in here[:PER]]
        if len(out[mid]) < 6:
            thin.append("%s(%d)" % (mid, len(out[mid])))

    obj = {
        "note": "이어달리기 판이 쓸 청크. 52과 대본에서 세었다. 손으로 안 고친다. "
                "scripts/derive_chunks.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "그 덩어리가 대본에 몇 번 나오나는 A등급이다 (셀 수 있다). "
                    "그것이 청크인가는 B등급이다. CLAUDE.md 등급표가 청크 목록을 "
                    "B로 정했다. 자주 나오는 것과 통째로 저장되는 것은 다르다.",
        "generator": "scripts/derive_chunks.py",
        "minN": MIN_N, "maxN": MAX_N, "minFreq": MIN_FREQ, "per": PER,
        "items": out,
    }
    text = json.dumps(obj, ensure_ascii=False, indent=2) + "\n"
    io.open(os.path.join(OUT, "chunks.json"), "w", encoding="utf-8").write(text)
    io.open(os.path.join(OUT, "chunks.js"), "w", encoding="utf-8").write(
        "window.ENG2P_CHUNKS=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")
    tot = sum(len(v) for v in out.values())
    ln = {}
    for g in keep:
        k = len(g.split())
        ln[k] = ln.get(k, 0) + 1
    print("out/data/chunks.json / 청크 %d종 (%s) / 과 %d개에 %d줄 / %d번 넘게 나온 것만"
          % (len(keep), " ".join("%d낱말 %d" % (k, ln[k]) for k in sorted(ln)),
             len(out), tot, MIN_FREQ))
    if thin:
        print("  [모자람] 여섯을 못 채운 과 %d개: %s" % (len(thin), " ".join(thin[:8])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
