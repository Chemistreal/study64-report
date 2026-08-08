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


def lecture_materials(path):
    """강의의 영어 재료를 뽑는다. 카드와 꼴이 다르다.

    강의는 영어를 **줄 통째로** 적는다. 번호를 안 붙인다.
    한글이 섞인 줄은 설명이고 영어만 있는 줄이 재료다.
    머리표와 표와 목록표는 뺀다. `->` 가 있으면 왼쪽만 본다. 그것이 원형이다.
    """
    out, n = [], 0
    for raw in path.read_text(encoding="utf-8").split("\n"):
        s = raw.strip()
        n += 1
        if not s or HANGUL.search(s) or not ASCIIWORD.search(s):
            continue
        if s[0] in "#|-*>" or s.startswith("검증") or s.startswith("신뢰도"):
            continue
        if "->" in s:
            s = s.split("->")[0].strip()
            if not s or not ASCIIWORD.search(s):
                continue
        out.append(("%d줄" % n, s))
    return out


def materials(path):
    """그 파일의 영어 재료를 뽑는다. (표시, 문장) 목록."""
    if "lectures" in str(path) or "dialog" in str(path):
        # 3층 대화도 줄 통째로 적는다. `A: ...` 꼴이라 화자 이름표는 norm 이 뗀다.
        return lecture_materials(path)
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
        # `eat, free, seafood` 처럼 낱말을 쉼표로 늘어놓은 재료가 있다. 목록이지 문장이 아니다.
        # 통째로 찾으면 셋 다 대본에 있어도 못 찾는다. **없는 것으로 세면 안 된다.**
        # 쉼표로 가르되 **조각이 다 한두 낱말일 때만** 가른다. `So, yeah` 같은 것은 안 가른다.
        split = []
        for part in parts:
            bits = [x.strip(" .") for x in part.split(",") if x.strip(" .")]
            if len(bits) >= 2 and all(len(b.split()) <= 2 for b in bits):
                split.extend(bits)
            else:
                split.append(part)
        parts = split
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


def is_list(text):
    """목록인가 문장인가. **끝에 문장 부호가 있으면 문장이다.**

    로드맵 11.10 이 근거를 대라고 한 것은 **목록**이다.
    `a lot of` 나 `black cat` 은 목록이고 `I want to see it.` 은 내가 지어 쓴 드릴 문장이다.
    52과는 151분 1681줄이라 지어 쓴 문장이 거기 있을 리 없다.
    둘을 한 비율로 묶으면 그 비율은 내 잘못이 아니라 말뭉치 크기를 잰다. T138 에서 쟀다.
    """
    return text.strip()[-1:] not in ".?!"


def report(path, tr):
    """파일 한 장짜리 보고서."""
    return report_items("eng2p_ground_" + path.stem.replace("eng2p_", "") + ".md",
                        str(path.resolve().relative_to(ROOT)), materials(path), tr)


def report_group(name, src, paths, tr):
    """여러 파일을 한 장으로 묶는다.

    강의는 96편이다. 한 편에 한 장이면 보고서가 96장이 되고 아무도 안 본다.
    분기로 묶어 넷으로 낸다. 자리 표시에 파일 이름을 붙여 어느 강인지 남긴다.
    """
    items = []
    for q in paths:
        for tag, text in materials(q):
            items.append((q.stem.replace("eng2p_", "") + " " + tag, text))
    return report_items(name, src, items, tr)


def report_items(name, src, items, tr):
    rows = [(tag, text, find(text, tr)) for tag, text in items]
    got = [r for r in rows if r[2]]
    lst = [r for r in rows if is_list(r[1])]
    lst_got = [r for r in lst if r[2]]
    sen = [r for r in rows if not is_list(r[1])]
    sen_got = [r for r in sen if r[2]]
    OUT.mkdir(parents=True, exist_ok=True)
    lines = [
        "신뢰도: A 생성 (근거 대조)",
        "원본: " + src,
        "",
        "# 근거 대조 " + name[len("eng2p_ground_"):-3],
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
        "**갈래를 갈라 센다.** 로드맵 11.10 이 근거를 대라고 한 것은 목록이다.",
        "지어 쓴 드릴 문장이 151분짜리 말뭉치에 있을 리 없다. 그 비율은 말뭉치 크기를 잰다.",
        "",
        "목록 %d개 / 근거 없음 %d개 (%.0f%%)"
        % (len(lst), len(lst) - len(lst_got),
           100.0 * (len(lst) - len(lst_got)) / len(lst) if lst else 0),
        "",
        "문장 %d개 / 근거 없음 %d개 (%.0f%%)"
        % (len(sen), len(sen) - len(sen_got),
           100.0 * (len(sen) - len(sen_got)) / len(sen) if sen else 0),
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

    groups = []
    if not args:
        for q in ("q1", "q2", "q3", "q4"):
            g = sorted((ROOT / "out" / "lectures").glob("eng2p_%s_l*.md" % q))
            if g:
                groups.append(("eng2p_ground_lectures_%s.md" % q, "out/lectures/%s 24편" % q, g))
        # 3층 대화. **1층은 내가 지어 쓴 학습용 인공물이다.**
        # 그것이 실제 녹음과 얼마나 겹치는지가 이 대조에서 나온다.
        dg = sorted((ROOT / "out" / "dialog").glob("eng2p_dialog_q*.md"))
        if dg:
            groups.append(("eng2p_ground_dialog.md", "out/dialog %d편" % len(dg), dg))

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

    for name, src, gp in groups:
        n, g, name2 = report_group(name, src, gp, tr)
        tot += n
        hit += g
        index.append((src, n, g, name2))
        if not quiet:
            print("  %-34s 재료 %3d / 근거 %3d / 없음 %3d (%.0f%%)"
                  % (src, n, g, n - g, 100.0 * (n - g) / n if n else 0))

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
