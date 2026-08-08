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
import hashlib
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
HAND = ROOT / "out" / "handouts"
EMG = ROOT / "out" / "emergency"
TASKS = ROOT / "out" / "tasks"

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


def handouts():
    """강의록 96편. 여섯 칸을 앞면 넷과 뒷면 둘로 갈라 담는다.

    강의에서 다시 뽑지 않고 강의록 마크다운을 읽는다.
    **강의에서 또 뽑으면 파생 경로가 둘이 된다.** 둘이 어긋나면 어느 쪽이 종이인지 모른다.
    앱이 보여 주는 것은 종이와 같아야 하므로 종이를 읽는다.
    """
    rows, bad = [], []
    for f in sorted(HAND.glob("eng2p_handout_l*.md")):
        text = f.read_text(encoding="utf-8")
        n = int(f.stem[-3:])
        m = re.search(r"^# (\d+)강 강의록\. (.+)$", text, re.M)
        if not m:
            bad.append("%s: 제목 줄이 없다" % f.name)
            continue

        def cell(num, name):
            mm = re.search(r"## %d\. %s\n(.*?)(?=\n## |\n---\n|\Z)"
                           % (num, name), text, re.S)
            # 줄 앞의 빈칸을 안 지운다. 영어 재료 칸은 네 칸 들여쓰기가 표시다.
            # strip() 을 걸면 첫 줄의 들여쓰기가 사라지고 영어 줄이 안 잡힌다.
            return mm.group(1).strip("\n") if mm else None

        eng = [x.strip() for x in (cell(2, "영어 재료") or "").split("\n")
               if x.startswith("    ")]
        note = [x.strip() for x in (cell(2, "영어 재료") or "").split("\n")
                if x.strip() and not x.startswith("    ")]
        rec = cell(5, "기록 칸") or ""
        items = re.findall(r"^(\d+)\. (.+)$", rec, re.M)
        rows.append({
            "no": n,
            "lecture": int(m.group(1)),
            "title": m.group(2).strip(),
            "quarter": re.search(r"^분기:\s*(\S+)", text, re.M).group(1),
            "track": re.search(r"^트랙:\s*(\S+)", text, re.M).group(1),
            "source": "out/handouts/%s" % f.name,
            "front": {
                "today": cell(1, "오늘 하는 것"),
                "english": eng,
                "englishNote": note,
                "plan": cell(3, "30분 진행표"),
                "cards": cell(4, "카드"),
            },
            "back": {
                "record": [{"no": int(a), "text": b} for a, b in items],
                "notMeasured": re.findall(r"^안 재는 것: (.+)$", rec, re.M),
                "stuck": cell(6, "막혔을 때"),
            },
        })
        for side, key in (("front", "today"), ("front", "plan"),
                          ("front", "cards"), ("back", "stuck")):
            if not rows[-1][side][key]:
                bad.append("%s: %s 칸이 비었다" % (f.name, key))
        if not rows[-1]["front"]["english"]:
            bad.append("%s: 영어 재료가 없다" % f.name)
        if not rows[-1]["back"]["record"]:
            bad.append("%s: 기록 항목이 없다" % f.name)
    return rows, bad


EMG_HEAD = re.compile(r"^##\s*(\d{3})\s+(.+?인출)\s*$", re.M)


def emergency():
    """비상판 80개. 인출 지시와 청크 목록과 붙는 강이다."""
    rows, bad = [], []
    for f in sorted(EMG.glob("*.md")):
        text = f.read_text(encoding="utf-8")
        quarter = re.search(r"^분기:\s*(\S+)", text, re.M).group(1)
        heads = list(EMG_HEAD.finditer(text))
        for i, m in enumerate(heads):
            end = heads[i + 1].start() if i + 1 < len(heads) else len(text)
            body = text[m.end():end].split("\n---")[0]
            pull = re.search(r"^인출 10분: (.+?)(?=\n청크 5분:|\Z)", body, re.S | re.M)
            chunk = re.search(r"^청크 5분: (.+)$", body, re.M)
            # 대응강의 줄이 원본이다. 본문의 "강의 NN" 은 설명 문장이라 없는 항목이 있다.
            # Q1 스무 개가 그 상태였다. 제목이 강과 1:1 인데 데이터에는 안 나왔다.
            lec = re.search(r"^대응강의:\s*(\d+)강", body, re.M)
            if not pull or not chunk:
                bad.append("%s %s: 인출이나 청크가 없다" % (f.name, m.group(1)))
                continue
            rows.append({
                "no": int(m.group(1)),
                "title": m.group(2).strip(),
                "quarter": quarter,
                "lecture": int(lec.group(1)) if lec else None,
                "source": "out/emergency/%s" % f.name,
                "minutes": {"pull": 10, "chunk": 5},
                "pull": re.sub(r"\s+", " ", pull.group(1)).strip(),
                "chunks": [c.strip() for c in chunk.group(1).split(" / ")],
            })
    return rows, bad


def tasks():
    """산출 과제집 48주. 분량과 조건과 만드는 방법이다."""
    rows, bad = [], []
    for f in sorted(TASKS.glob("eng2p_task_w*.md")):
        text = f.read_text(encoding="utf-8")
        w = int(re.search(r"_w(\d+)", f.name).group(1))

        def sec(name):
            m = re.search(r"^## %s\n(.*?)(?=\n## |\Z)" % name, text, re.S | re.M)
            return re.sub(r"\n{3,}", "\n\n", m.group(1)).strip() if m else None

        length = re.search(r"^분량:\s*(\d+)자", text, re.M)
        lec = re.search(r"^대응강의:\s*(.+)$", text, re.M)
        cond = re.search(r"^조건:\s*(.+)$", text, re.M)
        if not length:
            bad.append("%s: 분량이 없다" % f.name)
            continue
        rows.append({
            "week": w,
            "quarter": re.search(r"^분기:\s*(\S+)", text, re.M).group(1),
            "lectures": [w * 2 - 1, w * 2],
            "lectureLine": lec.group(1).strip() if lec else None,
            "minChars": int(length.group(1)),
            "source": "out/tasks/%s" % f.name,
            "task": sec("과제"),
            "condition": cond.group(1).strip() if cond else None,
            "how": sec("만드는 방법"),
            "check": sec("확인"),
            "prompt": sec("교정 요청 프롬프트"),
            "keep": sec("보관"),
        })
    return rows, bad


def manifest(lec, card, sett, hand, emg, task):
    """앱이 제일 먼저 읽는 한 장이다.

    데이터 여섯 파일이 1.8MB 다. 첫 화면을 띄우자고 그것을 다 물릴 이유가 없다.
    오늘 무엇을 하는지는 주차와 강 번호와 제목만 있으면 정해진다.
    나머지는 그 화면에서 고른 뒤에 물린다.

    파일마다 크기와 해시를 같이 적는다. 앱이 받은 것이 이 저장소의 것인지 본다.
    """
    weeks = []
    byweek = {}
    for x in lec:
        byweek.setdefault(x["week"], []).append(x)
    emg_by_lec = {x["lecture"]: x["no"] for x in emg}
    task_by_week = {x["week"]: x for x in task}
    set_by_week = {}
    for s in sett:
        set_by_week.setdefault(s["week"], []).append(s["id"])
    for w in sorted(byweek):
        ls = sorted(byweek[w], key=lambda x: x["no"])
        weeks.append({
            "week": w,
            "quarter": ls[0]["quarter"],
            "lectures": [{
                "no": x["no"],
                "title": x["title"],
                "track": x["track"],
                "cards": x["cards"],
                "media": x["media"],
                "emergency": emg_by_lec.get(x["no"]),
            } for x in ls],
            "sets": sorted(set_by_week.get(w, [])),
            "task": {"minChars": task_by_week[w]["minChars"]} if w in task_by_week else None,
        })
    return {
        "weeks": weeks,
        "counts": {
            "lectures": len(lec), "cards": len(card), "sets": len(sett),
            "handouts": len(hand), "emergency": len(emg), "tasks": len(task),
        },
    }


def stamp_files():
    """파생된 파일마다 크기와 해시를 적는다."""
    out = []
    # 앱이 읽는 것은 .js 쪽이다. 해시가 그것도 덮어야 받은 것을 확인할 수 있다.
    # index 자신은 뺀다. 자기 해시를 자기 안에 적을 수 없다.
    for f in sorted(list(OUT.glob("*.json")) + list(OUT.glob("*.js"))):
        if f.stem == "index":
            continue
        b = f.read_bytes()
        out.append({
            "file": f.name,
            "bytes": len(b),
            "sha256": hashlib.sha256(b).hexdigest(),
        })
    return out


# 앱이 file:// 로 열릴 수 있다. 종이와 같이 쓰는 물건이라 내려받아 여는 것이 정상이다.
# file:// 에서는 fetch 가 막힌다. 그래서 JSON 옆에 script 로 읽는 판을 같이 낸다.
# media/english/catalog.js 가 이미 그 방식이다. 같은 모양을 쓴다.
GLOBALS = {
    "index.json": "ENG2P_INDEX",
    "lectures.json": "ENG2P_LECTURES",
    "cards.json": "ENG2P_CARDS",
    "sets.json": "ENG2P_SETS",
    "handouts.json": "ENG2P_HANDOUTS",
    "emergency.json": "ENG2P_EMERGENCY",
    "tasks.json": "ENG2P_TASKS",
}


def write_js(name, text):
    """JSON 과 같은 내용을 script 로 읽는 판으로 낸다."""
    g = GLOBALS[name]
    p = OUT / name.replace(".json", ".js")
    p.write_text("window.%s=%s;\n" % (g, text.rstrip("\n")), encoding="utf-8")
    return p


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
    text = json.dumps(body, ensure_ascii=False, indent=2) + "\n"
    p.write_text(text, encoding="utf-8")
    write_js(name, text)
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

    hrows, bad = handouts()
    for m in bad:
        print("[실패] %s" % m)
    if bad:
        return 1
    if len(hrows) != 96:
        print("[실패] 강의록이 %d편이다. 96편이어야 한다" % len(hrows))
        return 1
    p = write("handouts.json", hrows)
    print("%s / 강의록 %d편" % (p.relative_to(ROOT), len(hrows)))

    erows, bad = emergency()
    for m in bad:
        print("[실패] %s" % m)
    if bad or len(erows) != 80:
        print("[실패] 비상판이 %d개다. 80개여야 한다" % len(erows))
        return 1
    p = write("emergency.json", erows)
    print("%s / 비상판 %d개" % (p.relative_to(ROOT), len(erows)))

    trows, bad = tasks()
    for m in bad:
        print("[실패] %s" % m)
    if bad or len(trows) != 48:
        print("[실패] 과제집이 %d주다. 48주여야 한다" % len(trows))
        return 1
    p = write("tasks.json", trows)
    print("%s / 과제집 %d주" % (p.relative_to(ROOT), len(trows)))

    idx = manifest(rows, crows, srows, hrows, erows, trows)
    idx["files"] = stamp_files()
    p = OUT / "index.json"
    itext = json.dumps({
        "note": "앱이 제일 먼저 읽는 한 장이다. 마크다운에서 파생시킨 것이라 "
                "손으로 고치지 않는다. scripts/derive_data.py 를 다시 돌린다.",
        "generator": "scripts/derive_data.py",
        "counts": idx["counts"],
        "files": idx["files"],
        "weeks": idx["weeks"],
    }, ensure_ascii=False, indent=2) + "\n"
    p.write_text(itext, encoding="utf-8")
    write_js("index.json", itext)
    print("%s / %d주 (%.0fKB)"
          % (p.relative_to(ROOT), len(idx["weeks"]), p.stat().st_size / 1024))
    return 0


if __name__ == "__main__":
    sys.exit(main())
