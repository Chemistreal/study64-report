#!/usr/bin/env python3
"""파생 자료의 크기와 해시를 적는다. **파생기 중에 제일 나중에 돈다.**

이 표는 `index.json` 안에 있었다. 그리고 `derive_data.py` 가 만들었다.
그런데 그 파생기는 넷째로 돈다. 대본과 소리 길이와 구간표와 근거는 그 뒤에 생긴다.

**그래서 처음 뽑을 때와 다시 뽑을 때 표가 달랐다.**

```
처음 뽑기   12개
다시 뽑기   18개  (transcripts.js audiolen.js cues.js ground.js 가 더 있다)
```

T150 에 파생물을 다 지우고 다시 뽑아 보다가 나왔다.
`check_derived.py` 는 이것을 못 잡는다. 그 검사는 파일이 이미 다 있는 상태에서
다시 뽑아 견주기 때문이다. **빈 자리에서 시작해 봐야 나오는 결함이다.**

받은 것이 온전한지 보라고 만든 표가 **넷을 빼놓고 온전하다고 말하고 있었다.**
그것이 없는 표보다 나쁘다. 없으면 확인을 안 하지만 있으면 확인했다고 여긴다.

그래서 갈라 냈다. 이 파생기는 맨 뒤에 돌고 **적어 둔 이름이 다 있는지 먼저 본다.**
하나라도 없으면 표를 안 내고 실패한다. 순서가 틀리면 여기서 걸린다.

쓰는 법:
    python3 scripts/derive_manifest.py

결과: out/data/manifest.js 와 out/data/manifest.json
규격: docs/roadmap.md 11.10
"""
import hashlib
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "out" / "data"

# **여기 적힌 것이 다 있어야 한다.** 있는 것을 훑는 것이 아니라 적어 둔 것을 찾는다.
# 훑으면 빠진 것이 안 보인다. 적어 두면 빠진 것이 실패로 나온다.
EXPECT = [
    "audiolen.js", "cards.js", "cards.json", "chunks.js", "chunks.json", "cues.js",
    "emergency.js", "emergency.json", "ground.js",
    "halves.js", "halves.json", "handouts.js", "handouts.json",
    # 차림표를 분기 넷으로 쪼갰다. 머리만 열자마자 읽는다. T245
    "index_head.js", "index_q1.js", "index_q2.js", "index_q3.js", "index_q4.js",
    "input.js", "input.json", "ladder.js", "ladder.json",
    "wall.js", "wall.json",
    "situ.js", "situ.json",
    "wave.js", "wave.json",
    "whose.js", "whose.json",
    "lectures.js", "lectures.json", "lecturetext.js",
    "listen.js", "listen.json",
    "pairs.js", "pairs.json", "relay.js", "relay.json",
    "sets.js", "sets.json", "swaps.js", "swaps.json",
    "tasks.js", "tasks.json", "transcripts.js",
]


def main():
    if not OUT.exists():
        print("[실패] %s 가 없다" % OUT)
        return 1
    missing = [n for n in EXPECT if not (OUT / n).exists()]
    if missing:
        print("[실패] 적어 둔 파일이 없다: %s" % " ".join(missing))
        print("파생 순서가 틀렸거나 파생기가 하나 빠졌다. all.py 순서를 본다.")
        return 1
    # 적어 두지 않은 것이 생겼으면 그것도 알린다. 표에서 조용히 빠지면 안 된다.
    here = sorted(f.name for f in list(OUT.glob("*.js")) + list(OUT.glob("*.json"))
                  if f.stem not in ("index", "manifest"))
    extra = [n for n in here if n not in EXPECT]
    if extra:
        print("[실패] 적어 두지 않은 파일이 있다: %s" % " ".join(extra))
        print("새로 만든 것이면 이 스크립트의 EXPECT 에 넣는다.")
        return 1

    rows = []
    for n in EXPECT:
        b = (OUT / n).read_bytes()
        rows.append({"file": n, "bytes": len(b),
                     "sha256": hashlib.sha256(b).hexdigest()})
    body = {
        "note": "out/data 의 파생 자료마다 크기와 해시다. 받은 것이 온전한지 보는 표다. "
                "손으로 고치지 않는다. scripts/derive_manifest.py 를 다시 돌린다.",
        "generator": "scripts/derive_manifest.py",
        "count": len(rows),
        "files": rows,
    }
    text = json.dumps(body, ensure_ascii=False, indent=2)
    (OUT / "manifest.json").write_text(text + "\n", encoding="utf-8")
    (OUT / "manifest.js").write_text("window.ENG2P_MANIFEST=%s;\n" % text, encoding="utf-8")
    print("out/data/manifest.js / 파일 %d개 %.1fMB"
          % (len(rows), sum(r["bytes"] for r in rows) / 1048576))
    return 0


if __name__ == "__main__":
    sys.exit(main())
