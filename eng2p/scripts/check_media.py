#!/usr/bin/env python3
"""미디어 카탈로그 검사기.

media/english/catalog.json 과 실제 파일을 대조한다.
조수(GPT)가 채운 데이터를 통합 전에 기계로 거른다.

사용법:
    python3 eng2p/scripts/check_media.py
    python3 eng2p/scripts/check_media.py media/english/catalog.json

종료 코드 0이면 통과, 1이면 실패.
규격: eng2p/docs/audio_intake.md, eng2p/docs/collab.md
"""
import json
import pathlib
import re
import sys

FAIL = []
WARN = []


def fail(m):
    FAIL.append(m)


def warn(m):
    WARN.append(m)


ROOT = pathlib.Path(__file__).resolve().parent.parent.parent

TOP_REQUIRED = ["name", "count", "source", "sourceUrl", "termsUrl", "license", "checked", "items"]
ITEM_REQUIRED = ["id", "lesson", "quarter", "title", "duration", "focus", "audio", "page"]
# focus 는 회차 초점 어휘다. 기준서 10.3 "1회 소리, 2회 청크, 3회 의미".
# 6트랙 어휘(자동화, 문법, 화용, repair)와 섞지 않는다. 그건 track 필드다.
FOCUS_OK = {"소리", "청크", "의미"}
TRACK_OK = {"소리", "청크", "자동화", "문법", "화용", "repair"}

# 분기별 화자 수 상한. 기준서 10.2 재료 조건.
SPK_MAX = {1: 2, 2: 2, 3: 3, 4: 99}

ID_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
DUR_RE = re.compile(r"^\d{1,2}:\d{2}$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def check_top(cat):
    for k in TOP_REQUIRED:
        if k not in cat:
            fail("최상위 필드 누락: %s" % k)
    if "checked" in cat and not DATE_RE.match(str(cat["checked"])):
        fail("checked 는 YYYY-MM-DD 여야 한다: %r" % cat["checked"])
    for k in ("sourceUrl", "termsUrl"):
        if k in cat and not str(cat[k]).startswith("https://"):
            fail("%s 는 https 로 시작해야 한다" % k)
    if "license" in cat and len(str(cat["license"])) < 10:
        fail("license 설명이 너무 짧다. 무엇이 왜 허용되는지 적는다")
    items = cat.get("items") or []
    if "count" in cat and cat["count"] != len(items):
        fail("count(%s) 와 items 길이(%d) 가 다르다" % (cat.get("count"), len(items)))
    return items


def check_line(tag, where, s):
    if re.search(r"[가-힣]", s):
        fail("%s: %s 에 한글이 있다. 대본은 영어로만 적는다" % (tag, where))
    for ch, label in (("\u2014", "em-dash"), ("\ufffd", "U+FFFD")):
        if ch in s:
            fail("%s: %s 에 금지 문자 %s" % (tag, where, label))


def check_transcript_file(tag, rel):
    """대본을 별도 파일로 둔 형태. 경로와 내용을 대조한다."""
    if not rel.endswith(".md"):
        fail("%s: transcript 경로는 .md 여야 한다 (%s)" % (tag, rel))
        return
    p = ROOT / rel
    if not p.exists():
        fail("%s: transcript 파일이 없다 (%s)" % (tag, rel))
        return
    text = p.read_text(encoding="utf-8")
    if not re.search(r"^신뢰도:\s*(C-gen|C-real)\s*$", text, re.M):
        fail("%s: 대본 파일에 C-gen 또는 C-real 표시가 없다" % tag)
    if "## 대본" not in text:
        fail("%s: 대본 파일에 '## 대본' 절이 없다" % tag)
        return
    body = text.split("## 대본", 1)[1]
    # 대본 본문에는 한글이 없어야 한다. 머리말 메타는 한국어라 제외한다.
    for j, ln in enumerate(body.split("\n")):
        ln = ln.strip()
        if not ln or ln.startswith("#"):
            continue
        check_line(tag, "%s 대본 %d행" % (rel, j), ln)


def check_item(it, i, seen_ids, seen_lessons):
    tag = "items[%d] %s" % (i, it.get("id", "?"))
    for k in ITEM_REQUIRED:
        if k not in it or it[k] in (None, ""):
            fail("%s: 필드 누락 %s" % (tag, k))

    _id = str(it.get("id", ""))
    if _id and not ID_RE.match(_id):
        fail("%s: id 는 소문자, 숫자, 붙임표만 쓴다" % tag)
    if _id in seen_ids:
        fail("%s: id 중복" % tag)
    seen_ids.add(_id)

    q = it.get("quarter")
    if q not in (1, 2, 3, 4):
        fail("%s: quarter 는 1~4 여야 한다 (%r)" % (tag, q))

    lesson = it.get("lesson")
    if not isinstance(lesson, int):
        fail("%s: lesson 은 정수여야 한다" % tag)
    elif lesson in seen_lessons:
        fail("%s: lesson 번호 중복 (%s)" % (tag, lesson))
    else:
        seen_lessons.add(lesson)

    if it.get("focus") not in FOCUS_OK:
        fail("%s: focus 는 소리, 청크, 의미 중 하나여야 한다 (%r). "
             "회차 초점 어휘다" % (tag, it.get("focus")))
    if "track" in it and it["track"] not in TRACK_OK:
        fail("%s: track 이 6트랙 밖이다 (%r)" % (tag, it.get("track")))

    dur = str(it.get("duration", ""))
    if dur and not DUR_RE.match(dur):
        fail("%s: duration 은 M:SS 또는 MM:SS 형식이어야 한다 (%r)" % (tag, dur))

    # 로컬 음성 파일 존재 확인
    a = it.get("audio")
    if a:
        p = ROOT / a
        if not p.exists():
            fail("%s: audio 파일이 없다 (%s)" % (tag, a))
        elif p.stat().st_size < 10240:
            fail("%s: audio 파일이 10KB 미만이다. 받다 만 것으로 본다" % tag)

    for k in ("originalAudio", "video", "page"):
        v = it.get(k)
        if v and not str(v).startswith("https://"):
            fail("%s: %s 는 https 로 시작해야 한다" % (tag, k))

    # 대본. 두 형태를 받는다.
    #   1) 파일 경로 문자열. 대본이 길어서 카탈로그에 넣기 곤란할 때
    #   2) 인라인 배열. 문자열 또는 {t, line}
    tr = it.get("transcript")
    if tr is None:
        warn("%s: transcript 없음. 대본 없는 음성은 반입 대상이 아니다 (audio_intake.md 2.1)" % tag)
    elif isinstance(tr, str):
        check_transcript_file(tag, tr)
    elif isinstance(tr, list):
        if not tr:
            fail("%s: transcript 배열이 비어 있다" % tag)
        for j, ln in enumerate(tr):
            s = ln if isinstance(ln, str) else (ln or {}).get("line")
            if not isinstance(s, str) or not s.strip():
                fail("%s: transcript[%d] 가 비어 있다" % (tag, j))
                continue
            check_line(tag, "transcript[%d]" % j, s)
    else:
        fail("%s: transcript 는 파일 경로 문자열이거나 배열이어야 한다" % tag)

    # 화자 수는 선택이지만 있으면 분기 조건과 대조한다
    spk = it.get("speakers")
    if spk is None:
        spk = it.get("speakerCount")
    if isinstance(spk, int) and isinstance(q, int) and q in SPK_MAX and spk > SPK_MAX[q]:
        warn("%s: Q%d 재료 조건보다 화자가 많다 (%d명)" % (tag, q, spk))


def main():
    target = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "media/english/catalog.json"
    if not target.exists():
        print("카탈로그가 없다: %s" % target)
        return 1
    try:
        cat = json.loads(target.read_text(encoding="utf-8"))
    except Exception as e:
        print("JSON 파싱 실패: %s" % e)
        return 1

    items = check_top(cat)
    seen_ids, seen_lessons = set(), set()
    for i, it in enumerate(items):
        check_item(it, i, seen_ids, seen_lessons)

    # catalog.js 는 catalog.json 과 같은 내용을 담아야 한다
    js = target.parent / "catalog.js"
    if js.exists():
        body = js.read_text(encoding="utf-8")
        m = re.search(r"=\s*(\{.*\})\s*;?\s*$", body, re.S)
        if not m:
            fail("catalog.js 에서 객체를 찾지 못했다")
        else:
            try:
                if json.loads(m.group(1)) != cat:
                    fail("catalog.js 와 catalog.json 의 내용이 다르다")
            except Exception:
                fail("catalog.js 의 객체를 JSON 으로 읽지 못했다")
    else:
        warn("catalog.js 가 없다. english.html 이 이 파일을 읽는다")

    for w in WARN:
        print("[경고] %s" % w)
    for f in FAIL:
        print("[실패] %s" % f)
    print("\n항목 %d개 / 실패 %d / 경고 %d" % (len(items), len(FAIL), len(WARN)))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
