#!/usr/bin/env python3
"""마크다운에서 앱이 읽는 JSON 을 파생시킨다.

**마크다운이 원본이고 JSON 은 파생물이다.** 손으로 JSON 을 안 적는다.
적으면 둘이 어긋나고 어긋난 것을 아무도 못 본다.
앱은 옛 값을 보여 주고 두 사람은 그것을 맞는 값으로 읽는다.

파서를 새로 안 짠다. `derive_handout.py` 의 것을 그대로 쓴다.
파서가 둘이면 같은 마크다운에서 다른 값이 나오는 날이 온다.
강의록과 JSON 이 다른 값을 들고 있으면 어느 쪽이 맞는지 알 방법이 없다.

사용법:
    python3 scripts/derive_data.py

종료 코드 0이면 다 뽑은 것이다.
규격: docs/roadmap.md 11.6
"""
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import derive_handout as H  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "out" / "data"
SETS = ROOT / "out" / "sets"
CARDS = ROOT / "out" / "cards"

# 통과 기준의 숫자만 뽑는다. 문장은 강의록이 들고 있다.
# 앱은 숫자로 진행을 재고 문장은 종이가 보여 준다. 같은 것을 두 곳에 안 적는다.
UNITS = (r"개|번|판|묶음|문항|회|초|분|시간|퍼센트|할|문장|낱말|쌍|장|덩어리"
         r"|자|쪽|줄|가지|곳|명|일|주|계단|층|칸|편|종|형")
NUM = re.compile(r"(\d+)\s*(" + UNITS + r")")

# 수를 한글로 적은 자리가 많다. "여섯 개를 채운다" 가 그것이다.
# T76 에서 이것 때문에 기준 81개가 강의록에 안 실렸다. 같은 자리를 여기서도 만난다.
# 앱이 진행을 재려면 이 수도 수여야 한다.
HANGUL_NUM = {
    "한": 1, "하나": 1, "두": 2, "둘": 2, "세": 3, "셋": 3, "네": 4, "넷": 4,
    "다섯": 5, "여섯": 6, "일곱": 7, "여덟": 8, "아홉": 9, "열": 10,
    "열한": 11, "열두": 12, "열다섯": 15, "스무": 20, "스물": 20,
    "스물넷": 24, "서른": 30, "마흔": 40,
}
# 긴 것부터 본다. "열두" 를 "열" 로 읽으면 안 된다.
HAN_KEYS = "|".join(sorted(HANGUL_NUM, key=len, reverse=True))
HAN_NUM = re.compile(r"(" + HAN_KEYS + r")\s*(" + UNITS + r")")

# 단위가 안 붙은 수도 있다. "넷 중 셋 이상" 과 "상태 낱말을 여섯 채운다" 가 그것이다.
# 뒤에 오는 말로 그것이 수라는 것을 안다. 단위는 없으므로 null 로 둔다.
BARE = re.compile(r"(?<![\d가-힣])(\d+|" + HAN_KEYS + r")\s*"
                  r"(?=이상|이하|중|까지|씩|을 |를 |채|이어야|여야|에 못 미치)")
# 절반처럼 비율로 적은 기준이 있다. "몰린 횟수의 절반 이상이어야 한다" 가 그것이다.
# 세는 값이 아니라 다른 값에 걸리는 값이라 따로 담는다.
RATIO = re.compile(r"(절반|(\d+)할)\s*(이상|이하)")


def week_of():
    """강 번호마다 주차를 낸다. 세트의 대응강의 줄이 원본이다."""
    out = {}
    for f in sorted(SETS.glob("eng2p_set_w*.md")):
        w = int(re.search(r"_w(\d+)", f.name).group(1))
        m = re.search(r"^대응강의:\s*(.+)$", f.read_text(encoding="utf-8"), re.M)
        if m:
            for x in m.group(1).split(","):
                out[int(x.strip()[-3:])] = w
    return out


def numbers_in(text):
    """항목 안의 수를 다 뽑는다. 아라비아 수와 한글 수와 단위 없는 수 셋을 본다."""
    out = [{"value": int(v), "unit": u} for v, u in NUM.findall(text)]
    out += [{"value": HANGUL_NUM[v], "unit": u, "hangul": True}
            for v, u in HAN_NUM.findall(text)]
    seen = {(x["value"], x["unit"]) for x in out}
    for v in BARE.findall(text):
        n = HANGUL_NUM.get(v, None)
        n = int(v) if n is None and v.isdigit() else n
        if n is not None and (n, None) not in seen:
            out.append({"value": n, "unit": None})
            seen.add((n, None))
    return out


def criteria(rec):
    """기록 항목마다 이름과 그 안의 숫자를 낸다.

    이름은 첫 문장이다. 앱의 목록에 한 줄로 놓을 것이라 짧아야 한다.
    숫자는 항목 전체에서 뽑는다. **첫 문장에만 있는 것이 아니다.**
    "침묵으로 멈춘 횟수를 따로 센다. 20번 중 3번 이하여야 한다" 가 그런 항목이다.
    첫 문장만 훑었더니 458개 중 191개에서 숫자가 안 나왔다. T85 에서 셌다.
    """
    out = []
    for i, r in enumerate(rec, 1):
        out.append({
            "no": i,
            "text": re.split(r"(?<=다)\.\s", r)[0],
            "numbers": numbers_in(r),
            "ratios": [{"of": 0.5 if a == "절반" else int(b) / 10.0, "op": op}
                       for a, b, op in RATIO.findall(r)],
            # 수도 비율도 없는 항목이 있다. 값을 적기만 하고 선을 안 긋는 항목이다.
            # 강의가 "통과 기준이 아니라 관찰 항목이다" 라고 적어 둔 자리들이다.
            # 앱이 이것을 통과 판정에 쓰면 안 된다. 그래서 갈라 둔다.
            "kind": ("measured" if numbers_in(r) or RATIO.search(r) else "observed"),
        })
    return out


def lectures():
    weeks = week_of()
    rows = []
    for f in sorted(H.LEC.glob("*.md")):
        text = f.read_text(encoding="utf-8")
        b = H.blocks_of(text)
        if not b:
            print("[실패] %s: 일곱 블록을 못 찾았다" % f.name)
            return None
        quarter = re.search(r"^분기:\s*(\S+)", text, re.M).group(1)
        num, title, _ = H.pick_today(f.name, text, b)
        n = int(num)
        cards, sec, med, per = H.pick_cards(f.name, b, quarter)
        rec, notes = H.pick_record(f.name, b)
        plan, segs = H.pick_plan(f.name, b)
        rows.append({
            "no": n,
            "title": title,
            "quarter": quarter,
            "track": re.search(r"^트랙:\s*(\S+)", text, re.M).group(1),
            "grade": re.search(r"^신뢰도:\s*(\S+)", text, re.M).group(1),
            "week": weeks.get(n),
            "source": "out/lectures/%s" % f.name,
            "handout": "out/handouts/eng2p_handout_l%03d.md" % n,
            "cards": {"from": int(cards[0]), "to": int(cards[1])} if cards else None,
            "pressureSeconds": int(sec) if sec else None,
            "cardSeconds": [{"card": c, "seconds": int(s)} for c, s in per],
            "media": med,
            "plan": {"split": plan, "segments": segs},
            "criteria": criteria(rec),
            "notMeasured": [re.split(r"(?<=다)\.\s", x)[0] for x in notes],
            "stuck": H.pick_stuck(f.name, b),
            "role": H.pick_role(b),
        })
    return rows


# 카드 한 장의 칸 이름이다. 이 밖의 이름이 나오면 새 칸이 생긴 것이라 실패로 낸다.
CARD_FIELDS = {
    "지시": "instruction", "성공 기준": "pass", "재료": "material",
    "비고": "note", "정답": "answer", "변형축": "axis", "모범 답안": "model",
    "상황": "situation", "관계": "relation", "목적": "purpose",
    "레지스터": "register", "종료 조건": "endCondition",
}
CARD_HEAD = re.compile(r"^\[(\d{3})\]\s+(\S+?)형\s+(Q\d)\s+(\d+)분\s*$", re.M)
SIDE = re.compile(r"^\[([AB])면\]\s*$", re.M)
# 초를 적는 형태가 하나가 아니다. "제한 시간 2초" 도 있고 "8초 안에" 도 있고
# "8초를 재고" 도 있다. 셋 다 같은 값이다. 하나만 보면 압박 카드 아홉 장이 초를 잃는다.
SEC_IN = re.compile(r"제한\s?시간(?:은|이)?\s*(\d+)\s*초|(\d+)\s*초\s*(?:안에|를 재|씩)")


def card_side(text):
    """한 면의 칸을 이름별로 담는다. 재료는 번호 붙은 목록이라 따로 받는다."""
    out, cur = {}, None
    for line in text.split("\n"):
        s = line.rstrip()
        if not s.strip():
            continue
        # 카드 사이의 가름줄이다. 여기서 끊는다. 안 끊으면 마지막 칸 끝에 붙는다.
        if s.strip().startswith("---"):
            break
        m = re.match(r"^([가-힣][가-힣 ]{0,6}):\s*(.*)$", s)
        if m and m.group(1) in CARD_FIELDS:
            cur = CARD_FIELDS[m.group(1)]
            out[cur] = m.group(2).strip()
            if cur == "material":
                out[cur] = []
            continue
        mm = re.match(r"^\s+\d+\.\s+(.+)$", s)
        if mm and cur == "material":
            out["material"].append(mm.group(1).strip())
            continue
        # 칸 안에서 줄이 이어지는 자리가 있다. 앞 칸에 이어 붙인다.
        if cur and isinstance(out.get(cur), str):
            out[cur] = (out[cur] + " " + s.strip()).strip()
    return out


def cards():
    rows, bad = [], []
    for f in sorted(CARDS.glob("*.md")):
        if "plan" in f.name:
            continue
        text = f.read_text(encoding="utf-8")
        heads = list(CARD_HEAD.finditer(text))
        for i, m in enumerate(heads):
            end = heads[i + 1].start() if i + 1 < len(heads) else len(text)
            body = text[m.end():end]
            sides, marks = {}, list(SIDE.finditer(body))
            for j, sm in enumerate(marks):
                e = marks[j + 1].start() if j + 1 < len(marks) else len(body)
                sides[sm.group(1)] = card_side(body[sm.end():e])
            if set(sides) != {"A", "B"}:
                bad.append("%s %s: 면이 %s 다" % (f.name, m.group(1), sorted(sides)))
                continue
            sec = SEC_IN.search(body)
            secv = next((g for g in sec.groups() if g), None) if sec else None
            rows.append({
                "no": int(m.group(1)),
                "type": m.group(2),
                "quarter": m.group(3),
                "minutes": int(m.group(4)),
                "id": "%s-%s" % (m.group(3), m.group(1)),
                "seconds": int(secv) if secv else None,
                "source": "out/cards/%s" % f.name,
                "a": sides["A"],
                "b": sides["B"],
            })
    return rows, bad


SET_HEAD = re.compile(r"^##\s*세트\s*(\d{3})\s*$", re.M)
STEP = re.compile(r"^###\s*(\d)단계\s*(.+?)\s*\((\d+)분\)\s*$", re.M)


def sets():
    """대조 교차 세트 288개. 네 단계와 그 안의 칸을 담는다."""
    rows, bad = [], []
    for f in sorted(SETS.glob("eng2p_set_w*.md")):
        w = int(re.search(r"_w(\d+)", f.name).group(1))
        text = f.read_text(encoding="utf-8")
        quarter = re.search(r"^분기:\s*(\S+)", text, re.M).group(1)
        heads = list(SET_HEAD.finditer(text))
        for i, m in enumerate(heads):
            end = heads[i + 1].start() if i + 1 < len(heads) else len(text)
            body = text[m.end():end]
            lec = re.search(r"^대응강의:\s*(\S+)", body, re.M)
            steps, marks = [], list(STEP.finditer(body))
            if len(marks) != 4:
                bad.append("%s 세트 %s: 단계가 %d개다" % (f.name, m.group(1), len(marks)))
                continue
            for j, sm in enumerate(marks):
                e = marks[j + 1].start() if j + 1 < len(marks) else len(body)
                chunk = body[sm.end():e]
                # 가름줄 뒤는 다음 세트다. 여기서 끊는다.
                chunk = chunk.split("\n---")[0]
                fields, items = {}, []
                cur = None
                for line in chunk.split("\n"):
                    s = line.rstrip()
                    if not s.strip():
                        continue
                    # 4단계 기록 칸의 이름은 "LRE 발생 횟수" 처럼 로마자로 시작한다.
                    # 한글로만 잡으면 그 셋이 한 덩어리 산문이 된다. 앱이 쓸 빈칸인데
                    # 빈칸인 줄을 모르게 된다. 로마자도 받는다.
                    fm = re.match(r"^([가-힣A-Za-z][가-힣A-Za-z ]{0,10}):\s*(.*)$", s)
                    im = re.match(r"^\s+\d+\.\s+(.+)$", s)
                    if im and cur:
                        items.append(im.group(1).strip())
                    elif fm:
                        cur = fm.group(1)
                        fields[cur] = fm.group(2).strip()
                    elif cur and fields.get(cur) is not None:
                        fields[cur] = (fields[cur] + " " + s.strip()).strip()
                    else:
                        fields.setdefault("본문", "")
                        fields["본문"] = (fields["본문"] + " " + s.strip()).strip()
                steps.append({
                    "step": int(sm.group(1)),
                    "name": sm.group(2),
                    "minutes": int(sm.group(3)),
                    "fields": fields,
                    "items": items,
                })
            rows.append({
                "no": int(m.group(1)),
                "id": "%s-%03d" % (quarter, int(m.group(1))),
                "week": w,
                "quarter": quarter,
                "lecture": int(lec.group(1)[-3:]) if lec else None,
                "source": "out/sets/%s" % f.name,
                "steps": steps,
            })
    return rows, bad


def write(name, payload):
    OUT.mkdir(parents=True, exist_ok=True)
    p = OUT / name
    # 손으로 안 고친다는 것을 파일 안에도 적는다. 파일만 보고 여는 사람이 있다.
    body = {
        "note": "마크다운에서 파생시킨 것이다. 손으로 고치지 않는다. "
                "고칠 것이 있으면 out/ 의 마크다운을 고치고 "
                "scripts/derive_data.py 를 다시 돌린다.",
        "generator": "scripts/derive_data.py",
        "count": len(payload),
        "items": payload,
    }
    p.write_text(json.dumps(body, ensure_ascii=False, indent=2) + "\n",
                 encoding="utf-8")
    return p


def main():
    rows = lectures()
    if rows is None:
        return 1
    if len(rows) != 96:
        print("[실패] 강의가 %d편이다. 96편이어야 한다" % len(rows))
        return 1
    p = write("lectures.json", rows)
    print("%s / 강의 %d편" % (p.relative_to(ROOT), len(rows)))
    empty = [r["no"] for r in rows if not r["criteria"]]
    if empty:
        print("[실패] 통과 기준이 빈 강: %s" % empty)
        return 1

    crows, bad = cards()
    for m in bad:
        print("[실패] %s" % m)
    if bad:
        return 1
    if len(crows) != 600:
        print("[실패] 카드가 %d장이다. 600장이어야 한다" % len(crows))
        return 1
    p = write("cards.json", crows)
    print("%s / 카드 %d장" % (p.relative_to(ROOT), len(crows)))

    srows, bad = sets()
    for m in bad:
        print("[실패] %s" % m)
    if bad:
        return 1
    if len(srows) != 288:
        print("[실패] 세트가 %d개다. 288개여야 한다" % len(srows))
        return 1
    p = write("sets.json", srows)
    print("%s / 세트 %d개" % (p.relative_to(ROOT), len(srows)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
