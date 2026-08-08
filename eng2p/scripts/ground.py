#!/usr/bin/env python3
"""제작물의 영어 재료가 52과 대본 어디에 있는지 찾는다.

**이것은 검증이 아니다.** 빈도도 자연스러움도 판정하지 않는다. 나는 그것을 못 한다.
할 수 있는 것은 하나다. **그 문장이 실제 녹음에 있는지 없는지 말하는 것이다.**

그럴듯하다에서 `lle1-01 의 12번째 줄에 있다` 로 내려간다.
그리고 없는 것은 **없다고 적는다. 그것이 이 일의 절반이다.**

카드 파일 머리에 "문장은 VOA 대본이라 실재는 보장된다" 라고 적어 둔 것이 있다.
그 말이 맞는지를 이 스크립트가 잰다. 적어 둔 것과 실제가 다르면 여기서 나온다.

찾는 방법은 좁고 정직하다.

- 잔글씨와 문장 부호를 지우고 낱말만 남겨 견준다
- 대본 한 줄 안에 통째로 들어 있어야 찾은 것이다. 줄을 넘겨 잇지 않는다
- 화자 이름표(`Anna:`)는 소리가 아니므로 뺀다

**줄을 넘겨 잇지 않는 이유가 있다.** 이으면 없는 문장도 찾아진다.
앞줄 끝과 뒷줄 앞을 붙이면 아무도 말한 적 없는 말이 만들어진다.
찾은 것이 적게 나오는 쪽이 틀리게 나오는 쪽보다 낫다.

쓰는 법:
    python3 scripts/ground.py                     # 다 훑는다
    python3 scripts/ground.py out/cards/x.md      # 그 파일만
    python3 scripts/ground.py --quiet             # 요약만

내는 것은 `out/ground/` 아래 보고서다. **원본은 안 고친다.**
카드와 강의는 이미 규격 검사를 받는 파일이라 거기에 줄을 끼우면 그 검사가 흔들린다.

종료 코드 0이면 다 훑은 것이다. 근거 없음이 많다고 실패로 내지 않는다.
**그 판단은 check_ground.py 가 한다.**
규격: docs/roadmap.md 11.10
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
REPO = ROOT.parent
TR = REPO / "media" / "english" / "transcripts"
OUT = ROOT / "out" / "ground"

SPEAKER = re.compile(r"^[A-Z][A-Za-z .'-]{0,20}:\s*")
# 재료 줄. `  1. I am Pete.` 꼴이다.
ITEM = re.compile(r"^\s{2,}(\d+)\.\s+(.+?)\s*$")
# 영어가 실제로 들어 있는가. 한글이 섞이면 지시문이다.
HANGUL = re.compile(r"[가-힣]")
ASCIIWORD = re.compile(r"[A-Za-z]{2,}")


def norm(s):
    """낱말만 남긴다. 대소문자와 문장 부호를 지운다."""
    s = SPEAKER.sub("", s)
    s = re.sub(r"[^A-Za-z0-9]+", " ", s)
    return " " + " ".join(s.lower().split()) + " "


def load_transcripts():
    """{과: [(줄번호, 원문, 고른꼴)]} 를 낸다. 줄 번호는 1부터다."""
    out = {}
    for f in sorted(TR.glob("lle1-*.md")):
        txt = f.read_text(encoding="utf-8")
        i = txt.find("## 대본")
        body = txt[i + len("## 대본"):] if i >= 0 else txt
        rows, n = [], 0
        for line in body.split("\n"):
            s = line.strip()
            if not s or s.startswith("#") or s.startswith("|"):
                continue
            n += 1
            rows.append((n, s, norm(s)))
        out[f.stem] = rows
    return out


def materials(path):
    """그 파일의 영어 재료를 뽑는다. (표시, 문장) 목록."""
    out, cur = [], None
    for raw in path.read_text(encoding="utf-8").split("\n"):
        m = re.match(r"^\[(\d{3})\]", raw.strip())
        if m:
            cur = m.group(1)
            continue
        m = re.match(r"^##\s*(\d+)강", raw.strip())
        if m:
            cur = m.group(1) + "강"
            continue
        m = ITEM.match(raw)
        if not m:
            continue
        text = m.group(2)
        if HANGUL.search(text):
            continue                      # 한글이 섞이면 지시문이다
        if not ASCIIWORD.search(text):
            continue
        # `I want to go. / I want a book.` 처럼 한 줄에 둘을 적은 재료가 많다.
        # 통째로 찾으면 둘 다 대본에 있어도 못 찾는다. **없는 것으로 세면 안 된다.**
        # 갈라서 조각마다 따로 본다. 조각 글도 표에 적으니 읽는 쪽이 헷갈릴 일이 없다.
        parts = [x.strip() for x in text.split(" / ") if x.strip()]
        tag = (cur or "?") + "-" + m.group(1)
        if len(parts) == 1:
            out.append((tag, text))
        else:
            for k, part in enumerate(parts):
                out.append((tag + "abcdefgh"[k] if k < 8 else tag, part))
    return out


def find(text, tr):
    """그 문장이 든 대본 자리를 다 낸다. ['lle1-01:12', ...]"""
    needle = norm(text).strip()
    if not needle:
        return []
    hits = []
    for mid in sorted(tr):
        for n, _raw, hay in tr[mid]:
            if (" " + needle + " ") in hay:
                hits.append("%s:%d" % (mid, n))
    return hits


def report(path, tr):
    items = materials(path)
    rows = [(tag, text, find(text, tr)) for tag, text in items]
    got = [r for r in rows if r[2]]
    OUT.mkdir(parents=True, exist_ok=True)
    name = "eng2p_ground_" + path.stem.replace("eng2p_", "") + ".md"
    lines = [
        "신뢰도: A 생성 (근거 대조)",
        "원본: " + str(path.relative_to(ROOT)),
        "",
        "# 근거 대조 " + path.stem,
        "",
        "**이것은 검증이 아니다.** 그 문장이 52과 대본에 있는지만 본다.",
        "빈도도 자연스러움도 판정하지 않는다. 그것은 대화 세션의 일이다.",
        "",
        "찾는 규칙은 좁다. 낱말만 남겨 견주고 **대본 한 줄 안에 통째로** 들어 있어야 한다.",
        "줄을 넘겨 이으면 아무도 말한 적 없는 말이 만들어진다.",
        "",
        "재료 %d개 / 대본에 있음 %d개 / **근거 없음 %d개 (%.0f%%)**"
        % (len(rows), len(got), len(rows) - len(got),
           100.0 * (len(rows) - len(got)) / len(rows) if rows else 0),
        "",
        "| 자리 | 문장 | 근거 |",
        "|---|---|---|",
    ]
    for tag, text, hits in rows:
        ev = " / ".join(hits[:4]) + (" 외 %d" % (len(hits) - 4) if len(hits) > 4 else "")
        lines.append("| %s | %s | %s |" % (tag, text.replace("|", "\\|"), ev or "**근거 없음**"))
    lines.append("")
    (OUT / name).write_text("\n".join(lines) + "\n", encoding="utf-8")
    return len(rows), len(got), name


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    quiet = "--quiet" in sys.argv
    if not TR.exists():
        print("[실패] 대본 자리가 없다: %s" % TR)
        return 1
    tr = load_transcripts()
    if len(tr) != 52:
        print("[실패] 대본이 %d편이다. 52편이어야 한다" % len(tr))
        return 1

    if args:
        paths = [pathlib.Path(a) for a in args]
    else:
        paths = sorted((ROOT / "out" / "cards").glob("eng2p_card_q*.md"))
        paths = [p for p in paths if "plan" not in p.name]

    tot, hit, index = 0, 0, []
    for p in paths:
        if not p.exists():
            print("[실패] %s 가 없다" % p)
            return 1
        n, g, name = report(p, tr)
        tot += n
        hit += g
        index.append((p.name, n, g, name))
        if not quiet:
            print("  %-34s 재료 %3d / 근거 %3d / 없음 %3d (%.0f%%)"
                  % (p.name, n, g, n - g, 100.0 * (n - g) / n if n else 0))

    lines = [
        "신뢰도: A 생성 (근거 대조)",
        "",
        "# 근거 대조 색인",
        "",
        "`scripts/ground.py` 가 낸다. 손으로 안 고친다.",
        "**이것은 검증이 아니다.** 52과 대본에 그 문장이 있는지만 본다.",
        "",
        "| 원본 | 재료 | 근거 있음 | 근거 없음 | 보고서 |",
        "|---|---|---|---|---|",
    ]
    for name, n, g, rep in index:
        lines.append("| %s | %d | %d | %d | %s |" % (name, n, g, n - g, rep))
    lines += ["", "합계 재료 %d개 / 근거 있음 %d개 / **근거 없음 %d개 (%.0f%%)**"
              % (tot, hit, tot - hit, 100.0 * (tot - hit) / tot if tot else 0), ""]
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "eng2p_ground_index.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

    print()
    print("파일 %d개 / 재료 %d개 / 근거 있음 %d개 / 근거 없음 %d개 (%.0f%%)"
          % (len(index), tot, hit, tot - hit, 100.0 * (tot - hit) / tot if tot else 0))
    return 0


if __name__ == "__main__":
    sys.exit(main())
