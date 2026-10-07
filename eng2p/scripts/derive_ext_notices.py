#!/usr/bin/env python3
"""동네 안내문 (`docs/expansion.md` 5장). `docs/ext_notices.md` 를 읽어 `out/data/ext_notices.json` 을 낸다.

내기 전에 본다. 하나라도 어긋나면 실패로 내고 JSON 을 안 쓴다.

    안내문마다 주, 갈래, 장소, 제목, 근거 칸이 하나 이상, 검증로그 꼴이 맞나
    영어 줄마다 [fN] 이 그 안내문의 근거 칸을 가리키나 ([장면] 은 사실이 아닌 게임 안 지시)
    낱말이 다 문 안인가: 그 주까지 들은 LLE1 낱말 + docs/wordlist.md + expansion.md 9장
    길이가 분기 범위 안인가 (expansion.md 5장 표)

**등급 B.** 사실은 근거가 있고 영어는 내가 썼다.

사용법:
    python3 scripts/derive_ext_notices.py
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import derive_ext_common as C  # noqa: E402

SRC = os.path.join(C.DOCS, "ext_notices.md")
DOCS = {
    "M618": "https://www.uscis.gov/sites/default/files/document/guides/M-618.pdf",
    "HUR": "https://www.ready.gov/sites/default/files/2024-07/ready.gov_hurricane_info-sheet.pdf",
    "TSU": "https://www.ready.gov/sites/default/files/2020-03/tsunami-information-sheet.pdf",
}
# 분기마다 낱말 수 (게시판). 방송은 짧게 따로. expansion.md 5장과 같아야 한다
LENGTH = {"게시판": {"Q1": (12, 60), "Q2": (25, 90), "Q3": (30, 110), "Q4": (30, 130)},
          "방송": {"Q1": (12, 60), "Q2": (12, 60), "Q3": (12, 60), "Q4": (12, 60)}}
VLOG = re.compile(r"^\d{4}-\d{2}-\d{2} / .+ / (통과|보류|기각) / .+")


def parse(src):
    out = []
    for blk in re.split(r"^### ", src, flags=re.M)[1:]:
        nid = blk.split("\n", 1)[0].strip()
        meta, facts = {}, {}
        for m in re.finditer(r"^- ([^:\n]+): (.*)$", blk, re.M):
            k, v = m.group(1).strip(), m.group(2).strip()
            if re.fullmatch(r"f\d+", k):
                facts[k] = v
            else:
                meta[k] = v
        code = re.search(r"```\n(.*?)```", blk, re.S)
        lines = []
        for ln in (code.group(1) if code else "").splitlines():
            m = re.match(r"^\[(f\d+|장면)\] (.+)$", ln.strip())
            if m:
                lines.append((m.group(1), m.group(2)))
            elif ln.strip():
                lines.append((None, ln.strip()))
        out.append((nid, meta, facts, lines))
    return out


def fact_link(v):
    m = re.match(r"^(M618|HUR|TSU)\s+(#page=\d+)?", v)
    if not m:
        return None, None
    url = DOCS[m.group(1)] + (m.group(2) or "")
    q = re.search(r'"(.*)"', v)
    return url, (q.group(1) if q else None)


def main():
    src = open(SRC, encoding="utf-8").read()
    lists = C.ext_lists()
    fails, items, need = [], [], {}
    for nid, meta, facts, lines in parse(src):
        for k in ("주", "갈래", "장소", "제목", "검증로그"):
            if not meta.get(k):
                fails.append("%s: %s 칸이 없다" % (nid, k))
        if not facts:
            fails.append("%s: 근거 칸이 없다" % nid)
            continue
        if meta.get("검증로그") and not VLOG.match(meta["검증로그"]):
            fails.append("%s: 검증로그 꼴이 아니다 (날짜 / 근거 / 통과|보류|기각 / 조치)" % nid)
        week = int(meta.get("주", "0") or 0)
        if not 1 <= week <= 48:
            fails.append("%s: 주가 1~48 밖이다" % nid)
            continue
        base, ext, nm = C.gate_words(week, lists)
        out_lines = []
        for tag, text in lines:
            if tag is None:
                fails.append("%s: 근거 표지 없는 줄: %s" % (nid, text))
                continue
            if tag != "장면" and tag not in facts:
                fails.append("%s: %s 가 근거 칸에 없다" % (nid, tag))
                continue
            url, quote = fact_link(facts[tag]) if tag != "장면" else (None, None)
            if tag != "장면" and not url:
                fails.append("%s: %s 근거의 문서 기호가 M618 HUR TSU 밖이다" % (nid, tag))
            for t in C.tokens(text):
                if t not in base and t not in ext and t not in nm:
                    need.setdefault(t, set()).add((week, nid))
            out_lines.append({"text": text, "fact": None if tag == "장면" else tag,
                              "src": url, "quote": quote, "grade": "B"})
        n = sum(len(C.tokens(l["text"])) for l in out_lines)
        q = C.quarter(week)
        lo, hi = LENGTH.get(meta.get("갈래"), LENGTH["게시판"])[q]
        if not lo <= n <= hi:
            fails.append("%s: %d낱말. %s %s 는 %d~%d" % (nid, n, q, meta.get("갈래"), lo, hi))
        toks = [t for l in out_lines for t in C.tokens(l["text"])]
        items.append({
            "id": nid, "week": week, "quarter": q, "kind": meta.get("갈래"), "place": meta.get("장소"),
            "title": meta.get("제목"), "wordCount": n,
            "extCount": sum(1 for t in toks if t not in base and t in ext),
            "facts": [{"id": k, "src": fact_link(v)[0], "quote": fact_link(v)[1], "ref": v} for k, v in sorted(facts.items())],
            "verifyLog": "검증로그: " + meta.get("검증로그", ""),
            "note": meta.get("메모"),
            "license": "PD-USGov", "licenseNote": "사실만 가져왔다. 영어는 새로 썼다. 공식 안내문이라고 표시하지 않는다",
            "grade": "B", "label": "학습용 인공물. 공식 안내문이 아니다",
            "lines": out_lines,
        })
    for t, where in sorted(need.items()):
        wk = min(w for w, _ in where)
        fails.append("문 밖 낱말 %s (%d주 %s). expansion.md 9장에 올리거나 고쳐 쓴다" % (
            t, wk, " ".join(sorted({n for _, n in where}))))
    if fails:
        for f in fails:
            print("[실패] " + f)
        print("안내문을 안 냈다. 실패 %d" % len(fails))
        return 1
    head = {
        "note": "동네 안내문. docs/ext_notices.md 에서 파생. 손으로 안 고친다. scripts/derive_ext_notices.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "사실은 미국 정부 자료(퍼블릭 도메인)에서 줄마다 근거를 달았다. 영어 문장은 새로 썼고 원어민 확인 전이다.",
        "generator": "scripts/derive_ext_notices.py",
        "source": "docs/ext_notices.md (USCIS M-618 rev. 09/15, FEMA V-1006, FEMA V-1011)",
        "license": "PD-USGov",
        "docs": DOCS,
        "verifyLog": "검증로그: 2026-10-07 / 정부 PDF 원문과 사실 대조 / 보류 / 영어는 spec 5.2 표본 검증 대기",
        "lines": sum(len(i["lines"]) for i in items),
        "wordCount": sum(i["wordCount"] for i in items),
    }
    C.write_ext("ext_notices", head, items)
    print("ext_notices: %d편 / 줄 %d / 낱말 %d" % (len(items), head["lines"], head["wordCount"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
