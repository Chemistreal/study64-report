#!/usr/bin/env python3
"""강의 본문 96편을 앱이 읽는 꼴로 뽑는다. **본문이 앱에 없었다.**

앱은 강의의 겉값만 들고 있었다. 번호와 제목과 트랙과 카드 범위와 통과 기준이다.
**본문은 없다.** 두 사람이 원리를 읽으려면 저장소에 가거나 종이를 봐야 했다.

블록 3은 강의록 30분을 도는 자리인데 화면에는 구간 배분표만 나온다.
"손뼉 속도를 맞추는 데 5분" 이라고 적혀 있고 그 손뼉이 무엇인지는 안 적혀 있다.
**그것이 강의 1장에 있는데 화면에 없다.**

96편 x 3천자면 30만자다. 그래서 따로 뽑고 **필요할 때 읽는다.**
`index.js` 처럼 처음부터 읽으면 첫 그림이 그만큼 늦어진다.
`loadData()` 가 이미 그 길을 안다. 구간표와 근거가 그 길로 온다.

쓰는 법:
    python3 scripts/derive_lecture_text.py

결과: out/data/lecturetext.js
규격: docs/roadmap.md 12.10
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "out" / "lectures"
OUT = ROOT / "out" / "data"

# 강의 7블록. 0번은 머리말이라 본문이 아니다.
HEAD = re.compile(r"^## (\d)\. (.+)$")


def parse(path):
    """한 편을 블록으로 가른다. **머리말과 제목은 따로 뽑는다.**"""
    text = path.read_text(encoding="utf-8")
    no, title = None, None
    m = re.search(r"^# (\d+)강\. (.+)$", text, re.M)
    if m:
        no, title = int(m.group(1)), m.group(2).strip()
    blocks, cur = [], None
    for line in text.split("\n"):
        h = HEAD.match(line)
        if h:
            cur = {"no": int(h.group(1)), "name": h.group(2).strip(), "body": []}
            blocks.append(cur)
            continue
        if cur is not None:
            cur["body"].append(line)
    for b in blocks:
        # 끝의 빈 줄만 턴다. 안쪽 빈 줄은 문단을 가르는 것이라 살린다.
        while b["body"] and not b["body"][-1].strip():
            b["body"].pop()
        while b["body"] and not b["body"][0].strip():
            b["body"].pop(0)
        b["body"] = "\n".join(b["body"])
    return no, title, blocks


def main():
    files = sorted(SRC.glob("eng2p_q*_l*.md"))
    if not files:
        print("[실패] %s 에 강의가 없다" % SRC)
        return 1
    items, bad = {}, []
    for f in files:
        no, title, blocks = parse(f)
        if no is None:
            bad.append("%s: 제목 줄에서 강 번호를 못 읽었다" % f.name)
            continue
        if len(blocks) != 6:
            bad.append("%s: 블록이 %d개다. 여섯이어야 한다" % (f.name, len(blocks)))
            continue
        empty = [b["name"] for b in blocks if not b["body"].strip()]
        if empty:
            bad.append("%s: 빈 블록 %s" % (f.name, " ".join(empty)))
            continue
        items[str(no)] = {"no": no, "title": title, "source": "out/lectures/" + f.name,
                          "blocks": [{"no": b["no"], "name": b["name"], "body": b["body"]}
                                     for b in blocks]}
    for m in bad:
        print("[실패] %s" % m)
    if bad:
        return 1
    if len(items) != 96:
        print("[실패] 강의가 %d편이다. 96편이어야 한다" % len(items))
        return 1

    body = {"note": "강의 96편의 본문이다. 원본은 out/lectures/ 의 마크다운이다. "
                    "손으로 고치지 않는다. scripts/derive_lecture_text.py 를 다시 돌린다.",
            "generator": "scripts/derive_lecture_text.py",
            "count": len(items), "items": items}
    text = json.dumps(body, ensure_ascii=False, separators=(",", ":"))
    (OUT / "lecturetext.js").write_text(
        "window.ENG2P_LECTURETEXT=%s;\n" % text, encoding="utf-8")
    chars = sum(len(b["body"]) for it in items.values() for b in it["blocks"])
    print("out/data/lecturetext.js / 강의 %d편 %d블록 %d자 (%.0fKB)"
          % (len(items), sum(len(i["blocks"]) for i in items.values()), chars,
             len(text.encode()) / 1024))
    return 0


if __name__ == "__main__":
    sys.exit(main())
