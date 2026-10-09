#!/usr/bin/env python3
"""세션 번호마다의 목표 등급과 공개 한계 (`docs/game_data.md` 11장). `out/game/acts.json` 을 낸다.

**막(Act)을 두지 않는다.** 단위는 세션 번호 1~288 뿐이다 (사용자 결정 2026-10-10, game 저장소 Docs/acts_KO.md 5장).
사람이 손으로 경계를 쓰지 않는다. 구간은 계획 숫자와 기준선 표에서 나온다 (통과선 파생 규칙과 같다).

    계획      세션 수는 sessions.json 의 count, 세션당 시간은 sessions.json 의 블록 분 합계(120분 = 2시간)에서 나온다.
              총시간은 앱 PASS 의 누적 시간 통과선(144/288/432/576)의 끝 값이고 세션 수 곱하기 세션당 시간과 같아야 한다
    구간      세션 s 의 목표 등급 = 그 세션 **끝** 누적 시간(세션당 시간 곱하기 s)이 처음으로 들어가는 기준선의 등급이다.
              기준선은 11.1 표(A1 100h, A2 200h, B1 400h, B2 600h)다. 이웃한 같은 등급은 하나로 접는다.
              시작의 소리와 글자(Pre-A1)는 A1 에 든다
    공개      11.2 표의 throughSession. 이 번호보다 큰 세션은 게임이 '곧 열려요' 로 잠근다. 세션이 하나씩 완성 기준을
              넘길 때마다 표의 값을 올린다 (지금은 48 이라 49번부터 잠긴다)
    자막      11.3 표. 듣는 동안은 안 보이고 듣기를 끝낸 뒤에 영어 글만 보인다. 한국어 번역은 안 된다 (기준서 13.1)
    늘리기    289번 세션부터 C1 을 향해 나중에 이어 붙인다. 지금은 later

**기준선은 케임브리지 영어가 말하는 안내된 학습 시간의 근사 안내다. 보증이 아니고 개인차가 크다.** 그래서 등급은 B등급이다.
무작위와 이름이 없다. 두 기기가 같은 바이트를 받는다.

사용법:
    python3 scripts/derive_acts.py

결과: out/game/acts.json (game 저장소 Data/acts.json 과 바이트가 같다)
규격: docs/game_data.md 11장 / 검사: scripts/check_acts.py
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC = os.path.join(ROOT, "docs", "game_data.md")
SESSIONS = os.path.join(ROOT, "out", "game", "sessions.json")
BADGE = os.path.join(ROOT, "out", "data", "badge.json")
SPEC = os.path.join(ROOT, "docs", "spec.md")
OUT = os.path.join(ROOT, "out", "game", "acts.json")

ORDER = ["A1", "A2", "B1", "B2"]
CAPTION_VALUES = {"duringListening": ("off", "en"), "afterListening": ("off", "en")}


def doc_table(head, cols):
    """docs/game_data.md 에서 `head` 로 시작하는 절의 표. 머리 줄은 뺀다. 못 찾으면 None."""
    with open(DOC, encoding="utf-8") as f:
        src = f.read()
    i = src.find(head)
    if i < 0:
        return None
    rest = src[i + len(head):]
    m = re.search(r"\n#{2,3} ", rest)
    sec = rest[:m.start()] if m else rest
    rows = []
    for line in sec.splitlines():
        if not line.startswith("| ") or line.startswith("|---"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) == cols:
            rows.append(cells)
    return rows[1:]


def jload(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def kv(head, errs):
    """11.2 11.3 11.4 의 (칸, 값, 뜻) 표를 {칸: 값} 으로."""
    rows = doc_table(head, 3)
    if not rows:
        errs.append("docs/game_data.md 에 '%s' 표가 없다" % head.strip())
        return {}
    return {r[0].strip("`"): r[1].strip("`") for r in rows}


def plan_numbers(errs):
    """계획 숫자. 손으로 안 적고 세션 자료와 앱 통과선에서 읽는다."""
    s = jload(SESSIONS)
    sessions = s.get("count")
    if not isinstance(sessions, int) or sessions != len(s.get("sessions", [])) or sessions < 1:
        errs.append("sessions.json 의 count 가 세션 수와 다르다")
        return None
    minutes = sum(b["minutes"] for b in s["blocks"])
    if minutes % 60 != 0 or minutes < 60:
        errs.append("블록 분 합계 %d 가 한 시간의 배수가 아니다" % minutes)
        return None
    hps = minutes // 60
    badge = jload(BADGE)
    pass_hours = [b["need"] for b in badge["badges"] if b.get("key") == "hrs"]
    if len(pass_hours) != 4 or pass_hours != sorted(pass_hours):
        errs.append("누적 시간 통과선이 넷으로 늘어나지 않는다: %s" % pass_hours)
        return None
    total = pass_hours[-1]
    if sessions * hps != total:
        errs.append("세션 %d 곱하기 %d시간이 총시간 %d 와 다르다" % (sessions, hps, total))
        return None
    q = sessions // 4
    if sessions % 4 != 0 or pass_hours != [hps * q * k for k in (1, 2, 3, 4)]:
        errs.append("통과선 %s 이 분기마다 같은 시간이 아니다" % pass_hours)
        return None
    return {"sessions": sessions, "hoursPerSession": hps, "totalHours": total, "passHours": pass_hours}


def thresholds(errs):
    rows = doc_table("### 11.1 ", 3)
    if not rows:
        errs.append("docs/game_data.md 11.1 기준선 표가 없다")
        return None
    out = []
    for cefr, hours, _why in rows:
        if not hours.isdigit():
            errs.append("기준선 시간이 정수가 아니다: %s" % hours)
            return None
        out.append({"cefr": cefr.strip("`"), "maxHours": int(hours)})
    if [t["cefr"] for t in out] != ORDER:
        errs.append("기준선 등급 차례가 %s 이 아니다: %s" % (ORDER, [t["cefr"] for t in out]))
        return None
    hs = [t["maxHours"] for t in out]
    if hs != sorted(set(hs)):
        errs.append("기준선 시간이 늘어나지 않는다: %s" % hs)
        return None
    return out


def level_of(end_hours, th):
    for t in th:
        if end_hours <= t["maxHours"]:
            return t["cefr"]
    return None


def ranges(plan, th, errs):
    """세션마다 등급을 구하고 이웃한 같은 등급을 접는다."""
    hps = plan["hoursPerSession"]
    per = []
    for s in range(1, plan["sessions"] + 1):
        c = level_of(hps * s, th)
        if c is None:
            errs.append("세션 %d 의 끝 누적 시간 %d 가 마지막 기준선 %d 를 넘는다" % (s, hps * s, th[-1]["maxHours"]))
            return None
        per.append(c)
    out = []
    for s, c in enumerate(per, 1):
        if out and out[-1]["cefr"] == c:
            out[-1]["toSession"] = s
        else:
            out.append({"cefr": c, "fromSession": s, "toSession": s})
    for r in out:
        r["fromHours"] = hps * (r["fromSession"] - 1)
        r["toHours"] = hps * r["toSession"]
    return out


def spec_forbids_korean_caption():
    """기준서 13.1 표에 '한국어 자막' 줄이 '전 구간' 으로 있는가. 풀리면 이 파일이 낡는다."""
    with open(SPEC, encoding="utf-8") as f:
        for line in f:
            if line.startswith("| 한국어 자막 |") and "전 구간" in line:
                return True
    return False


def build(errs):
    plan = plan_numbers(errs)
    th = thresholds(errs)
    if plan is None or th is None:
        return None
    lv = ranges(plan, th, errs)
    if lv is None:
        return None

    rel = kv("### 11.2 ", errs)
    cap = kv("### 11.3 ", errs)
    ext = kv("### 11.4 ", errs)
    if errs:
        return None

    through = rel.get("throughSession", "")
    if not through.isdigit() or not 0 <= int(through) <= plan["sessions"]:
        errs.append("throughSession 이 0~%d 정수가 아니다: %s" % (plan["sessions"], through))
        return None
    for k, ok in CAPTION_VALUES.items():
        if cap.get(k) not in ok:
            errs.append("자막 %s 가 %s 가 아니다: %s" % (k, ok, cap.get(k)))
            return None
    if cap.get("koreanTranslation") != "false":
        errs.append("한국어 번역은 false 여야 한다 (기준서 13.1): %s" % cap.get("koreanTranslation"))
        return None
    if not spec_forbids_korean_caption():
        errs.append("기준서 13.1 의 '한국어 자막 / 전 구간' 줄이 없다. 풀렸으면 11.3 표와 이 파생기를 같이 고친다")
        return None
    if ext.get("target") not in ("C1",) or ext.get("status") not in ("later", "open"):
        errs.append("늘리기 칸이 C1 later 가 아니다: %s" % ext)
        return None

    return {
        "schemaVersion": 1,
        "note": "게임이 받는 세션 번호 기준 구간표. 막(Act)을 두지 않는다. 세션 번호마다의 목표 등급(CEFR)은 계획 숫자와 "
                "기준선 표에서 파생했고 손으로 경계를 쓰지 않았다. 손으로 안 고친다. scripts/derive_acts.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "기준선은 케임브리지 영어가 말하는 안내된 학습 시간의 근사 안내다. 보증이 아니고 개인차가 크다.",
        "generator": "scripts/derive_acts.py",
        "source": "out/game/sessions.json (세션 수, 블록 분), out/data/badge.json (누적 시간 통과선), docs/game_data.md 11장 표, docs/spec.md 13.1",
        "basis": "기준선은 케임브리지 영어가 말하는 안내된 학습 시간의 근사 안내(%s)다. " % ", ".join(
                     "%s %d시간 이하" % (t["cefr"], t["maxHours"]) for t in th) +
                 "보증이 아니고 개인차가 크다. 세션의 등급은 그 세션이 끝난 때의 누적 시간으로 정한다. "
                 "시작의 소리와 글자(Pre-A1)는 A1 에 든다. 게임 밖 연결이 없어서 576시간 끝의 B2 는 낙관적인 목표다.",
        "plan": plan,
        "thresholds": th,
        "levels": lv,
        "release": {
            "throughSession": int(through),
            "rule": "이 번호보다 큰 세션은 게임이 '곧 열려요' 로 잠근다. 세션이 하나씩 완성 기준을 넘길 때 올린다.",
        },
        "captions": {
            "duringListening": cap["duringListening"],
            "afterListening": cap["afterListening"],
            "koreanTranslation": False,
            "why": "영어 글은 듣기를 끝낸 뒤에만 보인다. 듣는 동안은 지금처럼 글이 없다. 한국어 자막과 번역은 안 된다 (기준서 13.1).",
        },
        "extension": {
            "fromSession": plan["sessions"] + 1,
            "target": ext["target"],
            "status": ext["status"],
            "why": "288 뒤의 세션은 같은 방식으로 나중에 천천히 이어 붙인다. 막을 새로 만들지 않는다.",
        },
    }


def main():
    errs = []
    body = build(errs)
    if errs or body is None:
        for e in errs or ["acts.json 을 못 만들었다"]:
            print("[실패] " + e)
        return 1
    text = json.dumps(body, ensure_ascii=False, indent=1) + "\n"
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)
    print("out/game/acts.json / 세션 %d개 %d시간 / 구간 %s / 공개 %d번까지 / 자막 듣기 뒤 %s"
          % (body["plan"]["sessions"], body["plan"]["totalHours"],
             " ".join("%s %d-%d" % (r["cefr"], r["fromSession"], r["toSession"]) for r in body["levels"]),
             body["release"]["throughSession"], body["captions"]["afterListening"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
