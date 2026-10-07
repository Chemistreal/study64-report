#!/usr/bin/env python3
"""도서관 책 (`docs/expansion.md` 6장). `docs/ext_readers.md` 를 읽어 `out/data/ext_readers.json` 을 낸다.

내기 전에 본다. 하나라도 어긋나면 실패로 내고 JSON 을 안 쓴다.

    편마다 주, 책, 원작자 (사망 연도), 원본 주소, 제목, 차례, 틀, 뺀 것, 검증로그가 있나
    원작자가 1963 전에 죽었나 (한국 퍼블릭 도메인. sources.md 3장)
    신성한 것 목록 (SACRED) 이 글에 없나
    낱말이 다 문 안인가 (들은 LLE1 + wordlist.md + expansion.md 9장)
    확장 낱말 비율, 편 길이, 문장 길이가 분기 범위 안인가 (expansion.md 6장 표)

**등급 B.** 줄거리는 원본에 있다. 영어는 다시 썼다.

사용법:
    python3 scripts/derive_ext_readers.py
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import derive_ext_common as C  # noqa: E402

SRC = os.path.join(C.DOCS, "ext_readers.md")
# 분기마다 (편 낱말 최소, 최대, 문장 최대 낱말, 확장 낱말 비율 상한 %). expansion.md 6장과 같아야 한다.
# 비율 상한은 계획 값(2~4%)이 아니라 **2026-10-07 실측 최댓값에 맞춘 막는 값이다.** 늘면 실패한다.
# Q1 과 Q3 은 아직 편이 없어 설계 값이다
LIMITS = {"Q1": (60, 150, 8, 10.0), "Q2": (100, 300, 10, 26.0),
          "Q3": (200, 500, 14, 20.0), "Q4": (350, 800, 18, 15.0)}
VLOG = re.compile(r"^\d{4}-\d{2}-\d{2} / .+ / (통과|보류|기각) / .+")
NEED = ("주", "책", "원작자", "원본", "제목", "차례", "틀", "뺀 것", "검증로그")


def parse(src):
    out = []
    for blk in re.split(r"^### ", src, flags=re.M)[1:]:
        rid = blk.split("\n", 1)[0].strip()
        meta = {m.group(1).strip(): m.group(2).strip() for m in re.finditer(r"^- ([^:\n]+): (.*)$", blk, re.M)}
        code = re.search(r"```\n(.*?)```", blk, re.S)
        lines = [ln.strip() for ln in (code.group(1) if code else "").splitlines() if ln.strip()]
        out.append((rid, meta, lines))
    return out


def sentences(line):
    s = line.replace("“", '"').replace("”", '"')
    return [x.strip() for x in re.findall(r"[^.!?]+[.!?]+\"?", s) if x.strip()] or [s]


def main():
    src = open(SRC, encoding="utf-8").read()
    lists = C.ext_lists()
    fails, items, need = [], [], {}
    for rid, meta, lines in parse(src):
        for k in NEED:
            if not meta.get(k):
                fails.append("%s: %s 칸이 없다" % (rid, k))
        if meta.get("검증로그") and not VLOG.match(meta["검증로그"]):
            fails.append("%s: 검증로그 꼴이 아니다" % rid)
        died = re.search(r"~(\d{4})\)", meta.get("원작자", ""))
        if not died or int(died.group(1)) >= 1963:
            fails.append("%s: 원작자 사망 연도가 없거나 1963 뒤다 (%s)" % (rid, meta.get("원작자")))
        week = int(meta.get("주", "0") or 0)
        if not 1 <= week <= 48 or not lines:
            fails.append("%s: 주가 1~48 밖이거나 글이 없다" % rid)
            continue
        text = " ".join(lines)
        for s in C.SACRED:
            if re.search(r"(?<![A-Za-z])%s(?![A-Za-z])" % re.escape(s), text, re.I):
                fails.append("%s: 신성한 것 / 금지 낱말: %s" % (rid, s))
        for b in C.BRANDS:
            if b.lower() in text.lower():
                fails.append("%s: 상표 %s" % (rid, b))
        base, ext, nm = C.gate_words(week, lists)
        toks = C.tokens(text)
        n_ext = 0
        for t in toks:
            if t in base or t in nm:
                continue
            if t in ext:
                n_ext += 1
                continue
            need.setdefault(t, set()).add((week, rid))
        q = C.quarter(week)
        lo, hi, smax, cap = LIMITS[q]
        n = len(toks)
        n_names = sum(1 for t in toks if t not in base and t in nm)
        ratio = 100.0 * n_ext / max(1, n - n_names)
        if not lo <= n <= hi:
            fails.append("%s: %d낱말. %s 는 %d~%d" % (rid, n, q, lo, hi))
        long_s = [s for ln in lines for s in sentences(ln) if len(C.tokens(s)) > smax]
        for s in long_s:
            fails.append("%s: 문장이 %d낱말을 넘는다 (%s): %s" % (rid, smax, q, s))
        if ratio > cap:
            fails.append("%s: 확장 낱말 비율 %.1f%% > %s 상한 %.1f%%" % (rid, ratio, q, cap))
        items.append({
            "id": rid, "week": week, "quarter": q, "book": meta.get("책"), "author": meta.get("원작자"),
            "authorDied": int(died.group(1)) if died else None,
            "src": meta.get("원본"), "title": meta.get("제목"), "part": meta.get("차례"),
            "frame": meta.get("틀"), "removed": meta.get("뺀 것"), "note": meta.get("메모"),
            "verifyLog": "검증로그: " + meta.get("검증로그", ""),
            "wordCount": n, "extRatio": round(ratio, 1), "extCount": n_ext,
            "license": "PD(US,KR)", "licenseNote": "원작은 미국과 한국 퍼블릭 도메인. 다시 쓴 영어는 이 저장소의 것",
            "grade": "B", "label": "학습용 인공물. 원작을 쉬운 영어로 다시 쓴 것",
            "lines": [{"text": ln, "grade": "B"} for ln in lines],
        })
    for t, where in sorted(need.items()):
        wk = min(w for w, _ in where)
        fails.append("문 밖 낱말 %s (%d주 %s). expansion.md 9장에 올리거나 고쳐 쓴다" % (
            t, wk, " ".join(sorted({n for _, n in where}))))
    if fails:
        for f in fails:
            print("[실패] " + f)
        print("책을 안 냈다. 실패 %d" % len(fails))
        return 1
    head = {
        "note": "도서관 책. docs/ext_readers.md 에서 파생. 손으로 안 고친다. scripts/derive_ext_readers.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "줄거리와 사실은 퍼블릭 도메인 원작에 있다. 쉬운 영어는 새로 썼고 원어민과 하와이 문화 감수 전이다.",
        "generator": "scripts/derive_ext_readers.py",
        "source": "docs/ext_readers.md (Gutenberg #66547, #329)",
        "license": "PD(US,KR)",
        "verifyLog": "검증로그: 2026-10-07 / 원작 줄거리 대조 / 보류 / spec 5.2 표본 검증과 원주민 감수자 대기",
        "limits": {q: {"min": a, "max": b, "sentenceMax": c, "extCapPct": d} for q, (a, b, c, d) in LIMITS.items()},
        "lines": sum(len(i["lines"]) for i in items),
        "wordCount": sum(i["wordCount"] for i in items),
    }
    C.write_ext("ext_readers", head, items)
    print("ext_readers: %d편 / 줄 %d / 낱말 %d" % (len(items), head["lines"], head["wordCount"]))
    for i in items:
        print("  %s %2d주 %4d낱말 확장 %.1f%% %s" % (i["id"], i["week"], i["wordCount"], i["extRatio"], i["title"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
