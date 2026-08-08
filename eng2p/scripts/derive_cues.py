#!/usr/bin/env python3
"""대본 줄마다 어림 시각을 매긴다. **어림이다. 실측이 아니다.**

T126 에서 확인했다. 줄별 시각은 lessonData 에도 자막 파일에도 없다.
만들어 낼 수 없는 것은 만들지 않는다. **대신 어림을 만들고 어림이라고 적는다.**

어림 방법은 하나뿐이다. 그 과의 실제 길이를 그 과의 글자 수로 나눈다.
글자 수에 비례해서 줄마다 자리를 준다.

**여기에 없는 것을 적어 두는 게 중요하다.**

- 쉼을 안 센다. 화자가 바뀌는 자리의 틈을 모른다
- 한 과 안에서 빠르기가 변하는 것을 안 센다. 그것은 소리를 풀어야 안다
- 그래서 시작과 끝만 정확하고 가운데가 제일 많이 벌어진다

쉼 상수 같은 것을 지어내서 넣지 않는다. 그 값을 잴 방법이 없기 때문이다.
**모르는 값을 그럴듯하게 채우면 어림이 실측처럼 보인다.** 그것이 제일 나쁘다.

화자 이름표는 소리가 아니다. 글자 수에서 뺀다.
`Anna: Hello.` 에서 `Anna: ` 는 대본에만 있는 것이다.

낸 것은 줄마다 시작 초 하나다. 끝은 다음 줄의 시작이고 마지막 줄의 끝은 과의 길이다.
**대본 글은 안 싣는다.** transcripts.js 가 이미 들고 있고 줄 차례가 같다.
그 차례가 어긋나면 표가 통째로 엉뚱한 줄을 가리킨다. check_audio.py 가 그것을 본다.

쓰는 법:
    python3 scripts/derive_cues.py

종료 코드 0이면 52과 전부에 어림을 매긴 것이다.
규격: docs/roadmap.md 11.9, docs/audio_timing.md
"""
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from derive_transcripts import body_of, SRC as TR_SRC   # 줄 가르는 규칙을 같이 쓴다

ROOT = pathlib.Path(__file__).resolve().parent.parent
LEN = ROOT / "out" / "data" / "audiolen.js"
OUT = ROOT / "out" / "data" / "cues.js"

SPEAKER = re.compile(r"^[A-Z][A-Za-z .'-]{0,20}:\s*")


def spoken(line):
    """화자 이름표를 뗀 것. 이것이 실제로 소리 나는 부분이다."""
    return SPEAKER.sub("", line)


def load_js(path):
    t = path.read_text(encoding="utf-8")
    return json.loads(t[t.find("=") + 1:].rstrip().rstrip(";"))


def main():
    if not LEN.exists():
        print("[실패] audiolen.js 가 없다. derive_audiolen.py 를 먼저 돌린다")
        return 1
    real = load_js(LEN)["items"]

    items, bad = {}, []
    for f in sorted(TR_SRC.glob("lle1-*.md")):
        mid = f.stem
        lines = body_of(f.read_text(encoding="utf-8"))
        if mid not in real:
            bad.append("%s 의 길이를 모른다" % mid)
            continue
        dur = real[mid]
        weights = [max(1, len(spoken(l))) for l in lines]   # 빈 줄도 자리는 하나 준다
        total = sum(weights)
        starts, acc = [], 0
        for w in weights:
            starts.append(round(dur * acc / total, 2))
            acc += w
        items[mid] = starts

    if bad:
        for m in bad:
            print("[실패] " + m)
        return 1
    if len(items) != 52:
        print("[실패] %d과에 매겼다. 52과여야 한다" % len(items))
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    body = {
        "note": "대본 줄마다의 **어림** 시작 초다. 실측이 아니다. "
                "그 과의 실제 길이를 글자 수로 나눈 것이고 쉼을 안 센다. "
                "media/english/transcripts/*.md 와 out/data/audiolen.js 에서 파생시켰다. "
                "손으로 고치지 않는다. scripts/derive_cues.py 를 다시 돌린다.",
        "generator": "scripts/derive_cues.py",
        "estimate": True,
        "method": "글자 수 비례. 화자 이름표 제외. 쉼과 빠르기 변화는 안 셈",
        "unit": "seconds",
        "count": len(items),
        "items": items,
    }
    OUT.write_text("window.ENG2P_CUES=%s;\n"
                   % json.dumps(body, ensure_ascii=False, indent=2), encoding="utf-8")
    n = sum(len(v) for v in items.values())
    print("%s / 어림 %d과 %d줄 (%.0fKB)"
          % (OUT.relative_to(ROOT), len(items), n, OUT.stat().st_size / 1024))
    return 0


if __name__ == "__main__":
    sys.exit(main())
