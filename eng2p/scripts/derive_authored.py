#!/usr/bin/env python3
"""지은 영어(authored) 줄을 낸다. 원본은 docs/authored_lines.md, 정책은 docs/authored.md.

`out/game/authored.json` (게임이 있으면 읽는 선택 자료. 지금은 게임이 안 읽는다)과
`state/authored_b.md` (점검 B 줄 목록)를 낸다. 관문(scripts/authored_lib.py)에서 하나라도 실패하면 안 낸다.
말뭉치 줄은 여기 없다. 말뭉치 줄의 provenance 는 scenes.json 의 `from: lle1-NN` 이 이미 말한다 (바뀐 것 없음).

사용법: python3 scripts/derive_authored.py
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import authored_lib as L  # noqa: E402

OUT = os.path.join(L.ROOT, "out", "game", "authored.json")


def build():
    S = json.load(open(L.SESS, encoding="utf-8"))["sessions"]
    table, dup = L.load_words()
    outs, fail = L.parse_lines()
    fail = list(fail) + ["낱말 등급표에서 한 낱말이 두 등급이다: " + d for d in dup]
    notes, lines, practice = [], [], []
    for o in outs:
        f, n, der = L.line_problems(o, table, S)
        fail += f
        notes += n
        s = L.outing_session(o)
        glossable = s is not None and s <= L.gloss_limit()
        cd = [x.strip() for x in o["meta"].get("할 일", "").split("/")]
        branch = {}
        for pair in o["meta"].get("갈래", "").split(","):
            if ">" in pair:
                a, b = [x.strip() for x in pair.split(">")]
                branch[a] = b
        for ln in o["lines"]:
            d = der.get(ln["id"], {})
            rec = {"id": ln["id"], "outing": o["id"], "scene": ln["scene"], "kind": ln["kind"], "who": ln["who"],
                   "say": ln["say"], "provenance": "authored", "author": o["meta"].get("작성자"),
                   "cefr": ln["cefr"], "function": ln["fn"],
                   "canDo": cd[0] if cd else None,
                   "selfCheck": ln["check"], "selfCheckWhy": None if ln["check"] == "A" else ln["why"],
                   "introduces": d.get("introduces", []), "stretchWords": d.get("stretch", [])}
            if ln["id"] in branch:
                rec["branchOf"] = [k for k, v in branch.items() if v == ln["id"]]
            if glossable and ln["ko"].strip() not in ("", "-"):
                rec["ko"] = ln["ko"]
            lines.append(rec)
        for p in o["practice"]:
            pr = {"id": p["id"], "outing": o["id"], "say": p["say"], "function": p["fn"], "line": p["line"], "provenance": "authored"}
            if glossable and p["ko"].strip() not in ("", "-"):
                pr["ko"] = p["ko"]
            practice.append(pr)
    return outs, lines, practice, notes, fail


def main():
    outs, lines, practice, notes, fail = build()
    for f in fail:
        print("[실패] " + f)
    if fail:
        print("지은 영어를 안 냈다. 실패 %d" % len(fail))
        return 1
    for n in notes:
        print("[알림] " + n)
    A = sum(1 for l in lines if l["selfCheck"] == "A")
    B = len(lines) - A
    obj = {
        "schemaVersion": 1,
        "note": "지은 영어(authored) 줄. 원본 docs/authored_lines.md. 손으로 안 고친다. scripts/derive_authored.py 를 다시 돌린다. 게임은 아직 안 읽는다(선택 자료).",
        "grade": "B",
        "gradeWhy": "작성자 판단으로 쓴 영어다. 줄마다 selfCheck 가 있고 B 는 확신이 없다는 뜻이다. 낱말 등급은 직접 매긴 근사다 (docs/authored.md 4장).",
        "generator": "scripts/derive_authored.py",
        "source": "docs/authored_lines.md, docs/authored_words.md, out/game/sessions.json, out/game/acts.json",
        "provenanceClasses": {"corpus": "VOA 녹음 대본 줄 그대로 (scenes.json 의 from)", "authored": "작성자가 쓴 줄. 이 파일"},
        "gates": ["schema", "vocab", "length", "load", "culture", "dup", "copy", "gloss", "blist"],
        "counts": {"lines": len(lines), "selfCheckA": A, "selfCheckB": B, "practice": len(practice)},
        "lines": lines,
        "practice": practice,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write("\n")
    os.makedirs(os.path.dirname(L.BLIST), exist_ok=True)
    with open(L.BLIST, "w", encoding="utf-8") as f:
        f.write(L.build_b_list(outs))
    print("out/game/authored.json / 줄 %d (점검 A %d, B %d) / 연습 %d / state/authored_b.md / 실패 0" % (len(lines), A, B, len(practice)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
