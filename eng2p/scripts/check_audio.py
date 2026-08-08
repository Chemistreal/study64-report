#!/usr/bin/env python3
"""소리 길이가 세 군데 적혀 있다. 그 셋이 같은 말을 하는지 본다.

1. `media/english/audio/*.mp3` 자체. **이것만 사실이다**
2. `media/english/catalog.json` 의 duration. 사람이 적었다
3. `media/english/transcripts/*.md` 머리말의 "길이". 사람이 적었다

F구간이 대본 동기를 만든다. 어림 표든 실측 표든 **전체 길이 위에 얹는다.**
2번이나 3번이 틀리면 그 위에 세운 표가 통째로 어긋나고
**어긋난 표는 안 어긋난 것처럼 보인다.** 줄을 눌러 엉뚱한 데로 가야 안다.

그래서 재서 견준다. 사람이 적은 쪽을 사실 쪽에 맞춘다.
표기는 초 단위라 3초까지 봐준다. 그 이상 벌어지면 실패다.

쓰는 법:
    python3 scripts/check_audio.py

종료 코드 0이면 세 군데가 다 같은 말을 하는 것이다.
규격: docs/roadmap.md 11.9
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
REPO = ROOT.parent
LEN = ROOT / "out" / "data" / "audiolen.js"
CAT = REPO / "media" / "english" / "catalog.json"
CUES = ROOT / "out" / "data" / "cues.js"
TRJS = ROOT / "out" / "data" / "transcripts.js"
TR = REPO / "media" / "english" / "transcripts"
SLACK = 3.0     # 표기가 초 단위라 반올림으로 1초는 늘 어긋난다


def parse_clock(s):
    """00:30 이나 01:02:03 을 초로 바꾼다. 못 읽으면 None."""
    if not s or not re.fullmatch(r"\d+(:\d\d)+", s.strip()):
        return None
    p = [int(x) for x in s.strip().split(":")]
    return p[0] * 60 + p[1] if len(p) == 2 else p[0] * 3600 + p[1] * 60 + p[2]


def load_js(path, var):
    t = path.read_text(encoding="utf-8")
    i = t.find("=")
    return json.loads(t[i + 1:].rstrip().rstrip(";"))


def main():
    if not LEN.exists():
        print("[실패] %s 가 없다. derive_audiolen.py 를 먼저 돌린다" % LEN.name)
        return 1
    real = load_js(LEN, "ENG2P_AUDIOLEN")["items"]

    cat = json.loads(CAT.read_text(encoding="utf-8"))
    items = cat if isinstance(cat, list) else cat.get("items", cat.get("media", []))
    labeled = {x["id"]: x.get("duration") for x in items}

    fails, warns = [], []
    for mid in sorted(real):
        sec = real[mid]
        # 2. 카탈로그
        if mid not in labeled:
            fails.append("%s 가 카탈로그에 없다" % mid)
        else:
            got = parse_clock(labeled[mid])
            if got is None:
                fails.append("%s 카탈로그 길이가 시계 꼴이 아니다: %r" % (mid, labeled[mid]))
            elif abs(got - sec) > SLACK:
                fails.append("%s 카탈로그가 %s(%d초)라는데 실제는 %.1f초다"
                             % (mid, labeled[mid], got, sec))
        # 3. 대본 머리말
        f = TR / (mid + ".md")
        if not f.exists():
            fails.append("%s 대본이 없다" % mid)
            continue
        m = re.search(r"^길이:\s*(\S+)\s*$", f.read_text(encoding="utf-8"), re.M)
        if not m:
            fails.append("%s 대본 머리말에 길이가 없다" % mid)
            continue
        got = parse_clock(m.group(1))
        if got is None:
            fails.append("%s 대본 길이가 시계 꼴이 아니다: %r" % (mid, m.group(1)))
        elif abs(got - sec) > SLACK:
            fails.append("%s 대본이 %s(%d초)라는데 실제는 %.1f초다" % (mid, m.group(1), got, sec))

    # 카탈로그에만 있고 소리가 없는 것
    for mid in sorted(labeled):
        if mid not in real:
            warns.append("%s 는 카탈로그에 있는데 mp3 가 없다" % mid)

    # 어림 구간표. **줄 차례가 대본과 같아야 한다.**
    # 시각만 싣고 글은 안 싣는다. 차례가 한 칸 밀리면 표가 통째로
    # 엉뚱한 줄을 가리키는데 **화면에서는 그냥 잘 도는 것처럼 보인다.**
    if CUES.exists() and TRJS.exists():
        cues = load_js(CUES, "ENG2P_CUES")
        tr = load_js(TRJS, "ENG2P_TRANSCRIPTS")["items"]
        if not cues.get("estimate"):
            fails.append("구간표에 어림 표시가 없다. 어림을 실측처럼 내면 안 된다")
        ci = cues["items"]
        if len(ci) != len(tr):
            fails.append("구간표가 %d과인데 대본은 %d과다" % (len(ci), len(tr)))
        for mid in sorted(ci):
            if mid not in tr:
                fails.append("%s 구간표가 있는데 대본이 없다" % mid)
                continue
            if len(ci[mid]) != len(tr[mid]):
                fails.append("%s 구간표가 %d줄인데 대본은 %d줄이다"
                             % (mid, len(ci[mid]), len(tr[mid])))
                continue
            t = ci[mid]
            if t[0] != 0:
                fails.append("%s 구간표 첫 줄이 %s초다. 0이어야 한다" % (mid, t[0]))
            for k in range(1, len(t)):
                if t[k] <= t[k - 1]:
                    fails.append("%s 구간표 %d번째가 앞줄보다 안 늦다 (%s <= %s)"
                                 % (mid, k + 1, t[k], t[k - 1]))
                    break
            if mid in real and t[-1] >= real[mid]:
                fails.append("%s 구간표 마지막이 %s초인데 소리는 %.1f초다"
                             % (mid, t[-1], real[mid]))
        for mid in sorted(tr):
            if mid not in ci:
                fails.append("%s 대본이 있는데 구간표가 없다" % mid)
    else:
        warns.append("구간표나 대본 묶음이 없어 어림 검사를 건너뛰었다")

    for m in fails:
        print("[실패] " + m)
    for m in warns:
        print("[경고] " + m)
    print()
    ncue = sum(len(v) for v in load_js(CUES, "ENG2P_CUES")["items"].values()) if CUES.exists() else 0
    print("소리 %d개 / 어림 %d줄 / 실패 %d / 경고 %d / 합계 %.1f분"
          % (len(real), ncue, len(fails), len(warns), sum(real.values()) / 60))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
