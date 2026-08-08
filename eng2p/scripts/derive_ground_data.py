#!/usr/bin/env python3
"""근거를 앱이 읽는 꼴로 낸다. 카드 재료가 실제 녹음의 어디에 있는지다.

`ground.py` 는 보고서를 낸다. **보고서는 내가 읽는 것이고 두 사람은 안 읽는다.**
두 사람이 보는 자리는 카드다. 거기에 근거가 있어야 값을 한다.

무엇에 쓰는가. 카드 재료가 실제 녹음에 있으면 **그 소리를 들으러 갈 수 있다.**
`I want to see it.` 이 lle1-03 의 3번째 줄에 있다는 것을 알면
A가 자기 발음이 맞는지 확인할 자리가 생긴다. **A는 영어 제로다.**
자기 소리를 스스로 못 고친다. 원본 소리가 있는 자리를 아는 것이 유일한 길이다.

**근거 없는 것은 안 싣는다.** 그것은 내가 쓴 문장이라는 뜻이고
카드에 "이 문장은 근거가 없다" 라고 적어 봐야 두 사람이 할 일이 없다.
그 판단은 `out/ground/` 보고서와 `check_ground.py` 가 맡는다.

쓰는 법:
    python3 scripts/derive_ground_data.py

종료 코드 0이면 다 뽑은 것이다.
규격: docs/roadmap.md 11.10
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
GROUND = ROOT / "out" / "ground"
OUT = ROOT / "out" / "data" / "ground.js"
ROW = re.compile(r"^\| (\S+) \| (.+?) \| (.+?) \|$", re.M)
# 카드 자리 표시는 `051-2` 나 `051-2a` 꼴이다. 앞 셋이 카드 번호다.
TAG = re.compile(r"^(\d{3})-\d")


def main():
    if not GROUND.exists():
        print("[실패] %s 가 없다. ground.py 를 먼저 돌린다" % GROUND)
        return 1
    files = sorted(GROUND.glob("eng2p_ground_card_q*.md"))
    if not files:
        print("[실패] 카드 근거 보고서가 없다")
        return 1

    items, nrow = {}, 0
    for f in files:
        q = re.search(r"_q(\d)_", f.name).group(1)
        for tag, text, ev in ROW.findall(f.read_text(encoding="utf-8")):
            if tag == "자리":
                continue
            m = TAG.match(tag)
            if not m or "근거 없음" in ev:
                continue
            nrow += 1
            key = "Q%s-%s" % (q, m.group(1))
            hits = [x.strip() for x in ev.replace("**", "").split(" / ") if x.strip()]
            # `lle1-07:14 외 2` 처럼 뒤에 개수가 붙은 것이 있다. 자리만 남긴다.
            hits = [x.split(" 외 ")[0].strip() for x in hits]
            hits = [x for x in hits if re.match(r"^lle1-\d+(:\d+| 제목)$", x)]
            items.setdefault(key, []).append({"t": text.strip(), "at": hits})

    OUT.parent.mkdir(parents=True, exist_ok=True)
    body = {
        "note": "out/ground/*.md 에서 파생시킨 것이다. 손으로 고치지 않는다. "
                "scripts/derive_ground_data.py 를 다시 돌린다. "
                "근거 있는 재료만 싣는다. 없는 것은 안 싣는다.",
        "generator": "scripts/derive_ground_data.py",
        "count": len(items),
        "items": items,
    }
    OUT.write_text("window.ENG2P_GROUND=%s;\n"
                   % json.dumps(body, ensure_ascii=False, indent=1), encoding="utf-8")
    print("%s / 카드 %d장에 근거 %d줄 (%.0fKB)"
          % (OUT.relative_to(ROOT), len(items), nrow, OUT.stat().st_size / 1024))
    return 0


if __name__ == "__main__":
    sys.exit(main())
