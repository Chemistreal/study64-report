#!/usr/bin/env python3
"""근거 없는 목록을 검증 큐가 쓸 수 있는 꼴로 뽑는다.

`state/verify_queue.md` 는 파일 단위다. **"dark l 낱말 목록의 선정" 이라고만 적혀 있다.**
그것을 받은 대화 세션은 그 파일을 열어 무엇을 볼지 다시 정해야 한다.
**할 일을 넘기면서 무엇을 할지는 안 넘긴 것이다.**

이제 항목 단위로 안다. 어느 표현이 52과 대본에 없는지가 표로 있다.
그것을 그대로 넘긴다. 대화 세션은 웹 검색으로 그 표현만 보면 된다.

**문장은 안 넘긴다.** 내가 지어 쓴 드릴 문장이고 말뭉치에 없는 것이 당연하다.
넘기는 것은 목록뿐이다. 로드맵 11.10이 목록이라고 적은 그것이다.

**같은 표현이 여러 자리에 있으면 한 번만 넘긴다.**
`kind of` 를 다섯 군데서 쓰면 검증은 한 번이면 되고 다섯 번 적으면 큐가 다섯 배가 된다.
대신 **몇 군데서 쓰는지 세어 앞에 둔다.** 많이 쓰는 것부터 본다.

쓰는 법:
    python3 scripts/derive_verify_list.py

결과: state/verify_list.md
규격: docs/roadmap.md 11.10
"""
import collections
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
GROUND = ROOT / "out" / "ground"
OUT = ROOT / "state" / "verify_list.md"
ROW = re.compile(r"^\| (.+?) \| (.+?) \| (.+?) \|$", re.M)


# 음운 용어다. 영어 표현이 아니라 이 과정이 쓰는 이름이다. 검증할 것이 없다.
TERM = {"dark l", "clear l", "schwa", "flap t", "glottal stop"}


def skip(t):
    """검증 큐에 안 넘길 것.

    **한 낱말짜리는 뺀다.** `milk` 나 `asked` 가 대본에 없는 것은 말뭉치가 작아서다.
    그 낱말을 고른 근거는 음운이고 기준서 7.3 근거표 안이다. 웹 검색이 할 일이 없다.
    `docs/wordlist.md` 에 내가 넣은 낱말이라고 이미 적어 뒀다.

    두 낱말 이상인 것만 넘긴다. 연어와 청크와 화용 표현이 그것이다.
    그것이 내가 판정 못 하고 대화 세션이 판정할 수 있는 것이다.
    """
    if t.lower() in TERM:
        return True
    return len(t.split()) < 2


def is_list(text):
    """목록인가 문장인가. 끝에 문장 부호가 있으면 문장이다. ground.py 와 같은 규칙."""
    return text.strip()[-1:] not in ".?!"


def main():
    if not GROUND.exists():
        print("[실패] %s 가 없다. ground.py 를 먼저 돌린다" % GROUND)
        return 1
    files = sorted(p for p in GROUND.glob("eng2p_ground_*.md")
                   if p.name != "eng2p_ground_index.md")
    if not files:
        print("[실패] 근거 보고서가 없다")
        return 1

    where = collections.defaultdict(set)
    for f in files:
        src = f.stem[len("eng2p_ground_"):]
        for tag, text, ev in ROW.findall(f.read_text(encoding="utf-8")):
            if tag == "자리" or "근거 없음" not in ev:
                continue
            t = text.strip()
            if not is_list(t) or skip(t):
                continue
            where[t].add(src)

    rows = sorted(where.items(), key=lambda kv: (-len(kv[1]), kv[0].lower()))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "신뢰도: A 생성 (제작 관리)",
        "",
        "# 근거 없는 목록",
        "",
        "`scripts/derive_verify_list.py` 가 낸다. 손으로 안 고친다.",
        "",
        "**이 목록은 결함 목록이 아니다.** 52과 대본에 없다는 것뿐이다.",
        "52과는 151분 1681줄이고 초급 교육용 자료다.",
        "거기 있다는 것은 실재한다는 뜻이고 **없다는 것은 아무 뜻도 아니다.**",
        "",
        "그러니 여기 있는 것은 **아직 아무 근거도 못 댄 표현**이다.",
        "빈도와 자연스러움은 내가 판정할 수 없다. 대화 세션이 웹 검색으로 한다.",
        "",
        "**문장은 안 넣었다.** 내가 지어 쓴 드릴 문장이고 말뭉치에 없는 것이 당연하다.",
        "넣은 것은 목록뿐이다. 여러 자리에서 쓰는 것부터 위에 둔다.",
        "",
        "표현 %d개 / 자리 %d군데" % (len(rows), sum(len(v) for _, v in rows)),
        "",
        "| 쓰는 자리 | 표현 | 어디서 |",
        "|---|---|---|",
    ]
    for t, srcs in rows:
        lines.append("| %d | %s | %s |"
                     % (len(srcs), t.replace("|", "\\|"), " ".join(sorted(srcs))))
    lines.append("")
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    multi = sum(1 for _, v in rows if len(v) >= 2)
    print("%s / 표현 %d개 (두 자리 이상에서 쓰는 것 %d개)"
          % (OUT.relative_to(ROOT), len(rows), multi))
    return 0


if __name__ == "__main__":
    sys.exit(main())
