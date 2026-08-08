#!/usr/bin/env python3
"""대본 52편을 script 로 읽는 한 파일로 묶는다.

앱이 대본을 `fetch` 로 가져오고 있었다. **`file://` 에서는 막힌다.**
코드 안에 그 사실이 이미 적혀 있었다. "로컬 파일로 열면 브라우저가 다른 파일 읽기를 막는다" 다.

블록 4는 같은 자료를 같이 듣고 대본을 보는 블록이다.
내려받아 여는 것이 이 물건의 정상 사용이고 그때 대본이 안 뜬다.
T93 에서 JSON 에 같은 처리를 했다. 대본에도 같은 처리를 한다.

212KB 라 한 파일로 묶어도 된다. 블록 4에 올 때만 가져온다.
**대본 원본은 media/english/transcripts/*.md 다.** 이 파일은 파생물이다.

사용법:
    python3 scripts/derive_transcripts.py

종료 코드 0이면 52편을 다 묶은 것이다.
규격: docs/roadmap.md 11.8
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
REPO = ROOT.parent
SRC = REPO / "media" / "english" / "transcripts"
OUT = ROOT / "out" / "data" / "transcripts.js"


def body_of(text):
    """머리말 메타를 버리고 대본 줄만 낸다. 앱의 parseTranscriptMd 와 같은 규칙이다."""
    i = text.find("## 대본")
    body = text[i + len("## 대본"):] if i >= 0 else text
    out = []
    for line in body.split("\n"):
        s = line.strip()
        if not s or s.startswith("#") or s.startswith("|"):
            continue
        out.append(s)
    return out


def main():
    if not SRC.exists():
        print("[실패] 대본 자리가 없다: %s" % SRC)
        return 1
    items = {}
    empty = []
    for f in sorted(SRC.glob("lle1-*.md")):
        lines = body_of(f.read_text(encoding="utf-8"))
        if not lines:
            empty.append(f.name)
        items[f.stem] = lines
    if empty:
        print("[실패] 대본이 빈 파일: %s" % " ".join(empty))
        return 1
    if len(items) != 52:
        print("[실패] 대본이 %d편이다. 52편이어야 한다" % len(items))
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    body = {
        "note": "media/english/transcripts/*.md 에서 파생시킨 것이다. 손으로 고치지 않는다. "
                "고칠 것이 있으면 그 마크다운을 고치고 "
                "scripts/derive_transcripts.py 를 다시 돌린다.",
        "generator": "scripts/derive_transcripts.py",
        "count": len(items),
        "items": items,
    }
    OUT.write_text("window.ENG2P_TRANSCRIPTS=%s;\n"
                   % json.dumps(body, ensure_ascii=False, indent=2),
                   encoding="utf-8")
    n = sum(len(v) for v in items.values())
    print("%s / 대본 %d편 %d줄 (%.0fKB)"
          % (OUT.relative_to(ROOT), len(items), n, OUT.stat().st_size / 1024))
    return 0


if __name__ == "__main__":
    sys.exit(main())
