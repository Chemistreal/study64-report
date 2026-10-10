#!/usr/bin/env python3
"""입문 세션의 라디오 대본 한국어 풀이 (`docs/game_data.md` 12장). `out/game/transcripts_ko.json` 을 낸다.

사용자 결정 2026-10-10: 입문 세션에서는 한국어 번역을 허용한다 (기준서 13.1 의 개정문 29번).
게임은 듣기를 **끝낸 뒤** 영어 대본 줄 밑에 한국어 한 줄을 그린다. 영어 줄은 `out/game/transcripts.json` 이고 열쇠는
`<과 번호>#<줄 번호>` (줄 번호는 1부터) 다. 게임 쪽 규칙은 HnlActsCore.h 의 KoreanLineId / KoreanGlossAllowed.

    원본      docs/transcripts_ko.md. 표 한 줄이 대본 한 줄이다 (줄, 영어, 한국어). **번역은 사람이 쓴 글이고 여기가 원본이다**
    범위      docs/game_data.md 11.3 표의 koreanTranslationThroughSession (N). 세션 1~N 이 쓰는 과(sessions.json 의 media) 전부다.
              원본이 그 과를 하나라도 빠뜨리거나 더 가지면 실패한다 (한계를 올리면 새 과의 번역이 먼저 들어와야 한다)
    어긋남    원본의 영어 칸이 transcripts.json 의 그 줄과 다르면 실패한다. 대본이 바뀌면 번역을 다시 보게 한다
    출력      맨 위에 열쇠만 있는 지도 {"<과>#<줄>": "한국어"}. 게임 로더는 글자 칸을 전부 한국어 줄로 읽으므로
              note 나 generator 같은 칸을 두지 않는다. 출처는 이 머리말과 docs 가 말한다

사용법:
    python3 scripts/derive_transcripts_ko.py

결과: out/game/transcripts_ko.json (game 저장소 Data/transcripts_ko.json 과 바이트가 같다)
규격: docs/game_data.md 12장 / 검사: scripts/check_transcripts_ko.py
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import derive_acts as DA  # noqa: E402  11.3 표를 같은 함수로 읽는다

ROOT = DA.ROOT
SRC = os.path.join(ROOT, "docs", "transcripts_ko.md")
TRANSCRIPTS = os.path.join(ROOT, "out", "game", "transcripts.json")
SESSIONS = DA.SESSIONS
OUT = os.path.join(ROOT, "out", "game", "transcripts_ko.json")

ROW = re.compile(r"^\| (\d+) \| (.*?) \| (.*) \|$")


def through(errs):
    cap = DA.kv("### 11.3 ", errs)
    v = cap.get("koreanTranslationThroughSession", "")
    if not v.isdigit():
        errs.append("11.3 표에 koreanTranslationThroughSession 정수가 없다: %r" % v)
        return None
    return int(v)


def read_source(errs):
    """원본을 {과: [(줄 번호, 영어, 한국어), ...]} 로 읽는다. 과 차례는 원본 차례다."""
    out, cur = {}, None
    with open(SRC, encoding="utf-8") as f:
        for n, raw in enumerate(f, 1):
            line = raw.rstrip("\n")
            m = re.match(r"^## (\S+)$", line)
            if m:
                cur = m.group(1)
                if cur in out:
                    errs.append("%s 절이 두 번 나온다 (원본 %d줄)" % (cur, n))
                out[cur] = []
                continue
            r = ROW.match(line)
            if r and cur is not None:
                out[cur].append((int(r.group(1)), r.group(2), r.group(3)))
    return out


def media_used(upto, errs):
    with open(SESSIONS, encoding="utf-8") as f:
        s = json.load(f)
    seen = []
    for x in s["sessions"][:upto]:
        if x["media"] not in seen:
            seen.append(x["media"])
    return seen


def build(errs):
    n = through(errs)
    if n is None:
        return None
    with open(TRANSCRIPTS, encoding="utf-8") as f:
        eng = json.load(f)
    src = read_source(errs)
    need = media_used(n, errs)
    if sorted(src) != sorted(need):
        errs.append("원본의 과 %s 가 세션 1~%d 이 쓰는 과 %s 와 다르다. 빠진 것 %s 남는 것 %s"
                    % (sorted(src), n, sorted(need), sorted(set(need) - set(src)), sorted(set(src) - set(need))))
        return None
    out = {}
    for media in need:
        lines = eng.get(media)
        if not isinstance(lines, list):
            errs.append("transcripts.json 에 %s 가 없다" % media)
            continue
        rows = src[media]
        if [r[0] for r in rows] != list(range(1, len(lines) + 1)):
            errs.append("%s: 원본의 줄 번호가 1..%d 로 이어지지 않는다 (원본 %d줄)" % (media, len(lines), len(rows)))
            continue
        for (no, en, ko), line in zip(rows, lines):
            if en.strip() != line.strip():
                errs.append("%s#%d: 영어 칸이 대본과 다르다. 대본이 바뀌었으면 번역을 다시 본다\n   원본: %s\n   대본: %s" % (media, no, en, line))
            elif not ko.strip():
                errs.append("%s#%d: 한국어 칸이 비었다" % (media, no))
            else:
                out["%s#%d" % (media, no)] = ko.strip()
    return None if errs else out


def main():
    errs = []
    body = build(errs)
    if errs or body is None:
        for e in errs or ["transcripts_ko.json 을 못 만들었다"]:
            print("[실패] " + e)
        return 1
    text = json.dumps(body, ensure_ascii=False, indent=1) + "\n"
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)
    media = sorted({k.split("#")[0] for k in body})
    print("out/game/transcripts_ko.json / 과 %d개 %d줄 / 세션 1~%d" % (len(media), len(body), through([])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
