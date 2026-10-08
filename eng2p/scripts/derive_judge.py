#!/usr/bin/env python3
"""판정형 카드 140장의 기계 열쇠 (`docs/game_data.md` 3장). `out/game/judge.json` 을 낸다.

게임은 두 사람이 말하거나 누른 것을 **정답을 보이지 않고** 채점해야 한다 (기준서 8.2, 13.2).
카드의 `a.answer` 는 사람이 읽는 글이다. "1) Pete  2) Anna" 도 있고
"다섯 개 모두 1음절이다" 도 있고 "읽은 쪽을 A면 아래 빈칸에 표시해 두고" 도 있다.
이 파일은 그 글을 **게임이 읽는 꼴**로 옮긴다. 새로 짓는 것은 없다.

    통과선        a.pass 에서 k 와 n 을 읽는다. b.pass 와 다르면 kShown 에 같이 적는다
    열쇠          a.answer 를 읽는다. 번호 목록, 갈래 목록, 한 줄 산문 세 꼴을 다 읽는다
    산문 답       docs/game_data.md 3.1 표가 읽은 값을 준다. 표의 근거 문구가 답에 그대로 있어야 한다
    열쇠 없는 넷  docs/game_data.md 3.2 표. 말의 뜻으로 채점할 수 없는 카드다. 까닭을 적는다
    읽는 쪽이 고르는 카드  NPC 가 어느 쪽을 읽을지를 여기서 정해 낸다. 해시라서 무작위가 아니다

못 읽은 카드는 `unparsed` 에 적고 **JSON 을 안 쓴다.** 게임이 열쇠 없는 카드를 만나면 안 된다.

**이 파일은 게임만 쥔다.** 화면에 안 낸다. 정답을 둘 다 안 본다 (game.md 1.3).

사용법:
    python3 scripts/derive_judge.py
"""
import hashlib
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARDS = os.path.join(ROOT, "out", "data", "cards.json")
DOC = os.path.join(ROOT, "docs", "game_data.md")
OUT = os.path.join(ROOT, "out", "game", "judge.json")

KO = {"한": 1, "하나": 1, "두": 2, "둘": 2, "세": 3, "셋": 3, "네": 4, "넷": 4, "다섯": 5, "여섯": 6,
      "일곱": 7, "여덟": 8, "아홉": 9, "열": 10}
NUM = r"(\d+|%s)" % "|".join(sorted(KO, key=len, reverse=True))

FORMS = ["tokens", "number", "label", "side", "flag", "position", "npc_pick", "open"]
INPUTS = ["tap_word", "count", "choose", "speak", "speak_ko", "write", "tap_position", "observe"]


def num(s):
    s = s.strip()
    return int(s) if s.isdigit() else KO.get(s)


# 통과선 -----------------------------------------------------------------------

def parse_pass(text):
    """"5개 중 4개 이상" 은 (k=4, n=5). "5개 모두", "두 개를 다" 는 (n, n). 못 읽으면 None."""
    if not text:
        return None
    m = re.search(NUM + r"\s*(?:개|쌍|판|문장|자리)\s*중\s*" + NUM + r"\s*(?:개|쌍|판|문장|자리)?", text)
    if m:
        n, k = num(m.group(1)), num(m.group(2))
        return (k, n) if k and n and k <= n else None
    m = re.search(NUM + r"\s*(?:개|쌍|문장)\s*모두", text)
    if m and num(m.group(1)):
        return (num(m.group(1)),) * 2
    m = re.search(NUM + r"\s*(?:개|자리)(?:를|을)\s*다", text)
    if m and num(m.group(1)):
        return (num(m.group(1)),) * 2
    return None


# 문서 표 ----------------------------------------------------------------------

def doc_rows(head, cols):
    """docs/game_data.md 에서 `head` 로 시작하는 절의 표를 읽는다. 머리 줄은 뺀다."""
    src = open(DOC, encoding="utf-8").read()
    i = src.find(head)
    if i < 0:
        return None
    m = re.search(r"\n#{2,3} ", src[i + len(head):])
    sec = src[i:i + len(head) + (m.start() if m else len(src))]
    out = []
    for line in sec.splitlines():
        if not line.startswith("| ") or line.startswith("|---"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) == cols:
            out.append(cells)
    return out[1:]


def manual_rows():
    rows = doc_rows("### 3.1 ", 5)
    if rows is None:
        return None
    out = {}
    for cid, form, val, evid, opts in rows:
        try:
            out[cid] = {"form": form, "value": json.loads(val),
                        "evidence": evid, "options": json.loads(opts) if opts != "-" else None}
        except ValueError:
            out[cid] = {"error": "값이나 선택지가 JSON 이 아니다: %s | %s" % (val, opts)}
    return out


def open_rows():
    rows = doc_rows("### 3.2 ", 4)
    if rows is None:
        return None
    return {r[0]: {"how": r[1], "rule": r[2], "why": r[3]} for r in rows}


# 번호 목록 ("1) Pete  2) Anna") ------------------------------------------------

def numbered(ans):
    """("앞말", [칸1, 칸2, ...]) 또는 None. 칸 번호가 1부터 차례로 이어져야 한다."""
    parts = re.split(r"(?:(?<=\s)|^)(\d+)\)\s*", ans)
    if len(parts) < 5:
        return None
    lead = parts[0].strip()
    nums = [int(x) for x in parts[1::2]]
    cells = [x.strip() for x in parts[2::2]]
    if nums != list(range(1, len(nums) + 1)):
        return None
    return lead, cells


def cell_tokens(cell):
    """한 칸을 낱말 칸으로 읽는다. 못 읽으면 None. 영어 낱말만 든 칸이어야 한다."""
    alt = [x.strip() for x in cell.split("또는")]
    if len(alt) > 1:
        got = [cell_tokens(x) for x in alt]
        if any(g is None for g in got):
            return None
        return {"of": [t for g in got for t in g["of"]], "need": 1}
    if "에서" in cell:
        w = [x.strip() for x in cell.split("에서")]
        if all(re.fullmatch(r"[A-Za-z' ]+", x) for x in w):
            return {"of": w, "need": 2}
        return None
    if re.fullmatch(r"[A-Za-z0-9'.]+(?:,\s*[A-Za-z0-9'.]+)+", cell):
        w = [x.strip() for x in cell.split(",")]
        return {"of": w, "need": len(w)}
    if re.fullmatch(r"[A-Za-z0-9'.]+(?: [A-Za-z0-9'.]+)*(?: \.\.\. [A-Za-z0-9'.]+(?: [A-Za-z0-9'.]+)*)*", cell):
        if " ... " in cell:
            # "I am ... to see you" 는 앞토막과 뒤토막을 다 말해야 한다. 가운데는 바뀌는 자리다
            w = [x.strip() for x in cell.split(" ... ")]
            return {"of": w, "need": len(w), "gap": True}
        return {"of": [cell], "need": 1}
    return None


def from_numbered(card, lead, cells, how):
    """번호 목록을 열쇠로. how 는 B 면 지시 (짚는다, 적는다, 손가락으로 낸다 ...)."""
    n = len(cells)
    mat = material_of(card)
    if len(mat) == n and all(" / " in x for x in mat):
        opts = pair_options(mat)
        idx = [[o.lower() for o in op].index(c.lower()) if c.lower() in [o.lower() for o in op] else None
               for op, c in zip(opts, cells)]
        if all(i is not None for i in idx):
            return {"form": "side", "items": idx, "options": opts}
    ints = [re.fullmatch(r"(\d+)\s*개?", c) for c in cells]
    if all(ints):
        return {"form": "number", "items": [int(m.group(1)) for m in ints]}
    toks = [cell_tokens(c) for c in cells]
    if all(toks):
        multi = any(len(t["of"]) > 1 and t["need"] == len(t["of"]) for t in toks)
        phrase = any(" " in t["of"][0] and t["need"] == 1 and "에서" not in c for t, c in zip(toks, cells))
        word_match = "word" if (multi or not phrase) else "phrase"
        if any(t.get("gap") for t in toks):
            word_match = "phrase"
        if "몇 개" in how or "손가락으로 낸다" in how:
            # 낱말 목록이 답이고 B 는 그 개수를 낸다 (Q1-078)
            return {"form": "number", "items": [len(t["of"]) for t in toks],
                    "derived": "낱말 목록의 개수", "words": [t["of"] for t in toks]}
        return {"form": "tokens", "match": word_match, "items": toks}
    # 한국어 칸. 닫힌 선택지가 있는 이름표다
    return {"form": "label", "items": cells, "labels": sorted(set(cells), key=cells.index)}


# 갈래 목록 ("1형은 1번과 4번, ...") --------------------------------------------

NUMTOK = r"\d+번|\d+(?![가-힣\d])"
NUMLIST = r"(?:%s)(?:\s*(?:과|와|,)\s*(?:%s))*" % (NUMTOK, NUMTOK)


def nums_of(s):
    return [int(x) for x in re.findall(r"\d+", s)]


def split_clauses(text):
    """쉼표와 "이고" 와 마침표로 절을 가른다. 번호 목록 안의 쉼표는 가르지 않는다."""
    text = re.sub(r"\s+", " ", text.strip())
    out, cur, i = [], "", 0
    while i < len(text):
        ch = text[i]
        if ch == ",":
            rest = text[i + 1:].lstrip()
            # 쉼표 뒤가 "3번," "5번이다" "10 이다" 처럼 목록을 잇는 번호면 안 가른다
            if re.match(r"(?:%s)(?=\s*(?:,|\.|이다|다\b|이고|이며|과|와|$))" % NUMTOK, rest) and \
                    re.search(r"(?:%s)\s*$" % NUMTOK, cur):
                cur += ch
            else:
                out.append(cur)
                cur = ""
        elif ch == "." and (i + 1 == len(text) or text[i + 1] == " "):
            out.append(cur)
            cur = ""
        else:
            cur += ch
        i += 1
    if cur.strip():
        out.append(cur)
    res = []
    for c in out:
        for p in re.split(r"(?<=다)\s*이고\s+|(?<=이다)\s*이며\s+|(?<=번)이고\s+", c):
            if p.strip():
                res.append(p.strip())
    return res


def clean_label(s):
    """절 끝의 서술어를 뗀다. "아니다" 는 이름표 "아님" 이다."""
    s = s.strip()
    if s.endswith("아니다"):
        return "아님"
    s = re.sub(r"\s*[이가] 빠졌다$|\s*(?:이다|한다)$", "", s).strip()
    if s.endswith("다") and not s.endswith("르다") and len(s) > 1:
        s = s[:-1].strip()
    return s


def groups(card, ans, n):
    """갈래 목록을 번호 -> 이름표 로. 못 읽거나 n 칸을 다 못 채우면 None."""
    labels = {}      # 번호 -> [이름표]
    rest = None
    for cl in split_clauses(ans):
        cl = cl.strip()
        if not cl:
            continue
        m = re.fullmatch(r"(?P<l>.+?)(?:은|는)\s+(?P<n>%s)\s*(?:이다|다)?" % NUMLIST, cl)
        if m and not re.fullmatch(NUMLIST, m.group("l")):
            for k in nums_of(m.group("n")):
                labels.setdefault(k, []).append(m.group("l").strip())
            continue
        m = re.fullmatch(r"(?P<n>%s)(?:은|는)\s+(?P<l>.+)" % NUMLIST, cl)
        if m:
            for k in nums_of(m.group("n")):
                labels.setdefault(k, []).append(clean_label(m.group("l")))
            continue
        m = re.fullmatch(r"(?P<n>\d+)번\s+(?P<l>.+)", cl)
        if m:
            labels.setdefault(int(m.group("n")), []).append(clean_label(m.group("l")))
            continue
        m = re.fullmatch(r"나머지\s+%s(?:은|는)\s+(?P<l>.+)" % NUM, cl)
        if m:
            rest = clean_label(m.group("l"))
            continue
        if not re.search(r"\d", cl):
            continue          # 숫자 없는 절은 앞말이다 ("언제나 낮은 쪽이다")
        return None
    if rest is not None:
        for k in range(1, n + 1):
            if k not in labels:
                labels[k] = [rest]
    if sorted(labels) != list(range(1, n + 1)):
        return labels if labels else None
    return labels


# 열쇠 하나 --------------------------------------------------------------------

def sha_int(s):
    return int(hashlib.sha1(s.encode("utf-8")).hexdigest(), 16)


def pick_plan(cid, n, kind):
    """NPC 가 어느 쪽을 읽을지. 무작위가 아니라 카드 번호와 칸 번호의 해시다. 두 기기가 같다."""
    if kind == "two_of_all":
        order = sorted(range(n), key=lambda i: sha_int("%s:%d" % (cid, i)))
        return sorted(order[:2])
    # 해시 순서로 줄 세워 앞쪽 절반을 1 로 한다. 어느 쪽이 더 많은지는 카드 해시가 정한다
    order = sorted(range(n), key=lambda i: sha_int("%s:%d" % (cid, i)))
    bits = [0] * n
    for rank, i in enumerate(order):
        bits[i] = 1 if rank < n // 2 else 0
    if sha_int(cid) % 2:
        bits = [1 - b for b in bits]
    return bits


def pair_options(material):
    return [[x.strip() for x in m.split(" / ")] for m in material]


def input_of(card, form, how):
    """두 사람이 답하는 길. 한국어 이름표는 말로 못 받아쓰므로 누른다 (영어 받아쓰기 모델)."""
    if "한국어로 말한다" in how:
        return "speak_ko"          # 한국어 뜻을 말로 받는다. 영어 받아쓰기로는 못 받는다 (game_data.md 3장)
    if form in ("label", "side", "flag", "npc_pick"):
        return "choose"
    if form == "number":
        return "count"
    if form == "position":
        return "tap_position"
    if form == "open":
        return "observe"
    if "짚" in how:
        return "tap_word"
    if "적는다" in how:
        return "write"
    return "speak"


def material_of(card):
    return card["a"].get("material") or []


def key_of(card, manual):
    """카드 하나의 열쇠. (key dict, 어디서 읽었나) 또는 (None, 이유)."""
    cid = card["id"]
    a, b = card["a"], card["b"]
    ans = a.get("answer") or ""
    how = b.get("instruction", "")
    n = len(material_of(card))

    mrow = manual.get(cid)
    if mrow:
        if "error" in mrow:
            return None, mrow["error"]
        if mrow["evidence"] not in ans and mrow["evidence"] not in a.get("note", "") \
                and mrow["evidence"] not in how:
            return None, "3.1 표의 근거 문구가 카드에 없다: %s" % mrow["evidence"]
        return manual_key(card, mrow), "table"

    nm = numbered(ans)
    if nm:
        return from_numbered(card, nm[0], nm[1], how), "answer"

    # 한 줄 산문 가운데 읽는 꼴 셋
    m = re.fullmatch(r"(?:마지막 낱말은 )?%s\s*(?:개|쌍|문장)\s*모두\s*(\d+)음절이(?:다|고 끝에 모음이 없다)\." % NUM, ans)
    if m:
        return {"form": "number", "items": [int(m.group(2))] * n, "derived": "한 줄 산문: 모두 같다"}, "answer"
    m = re.fullmatch(r"%s\s*문장\s*모두\s*강세가\s*%s이다\." % (NUM, NUM), ans)
    if m:
        return {"form": "number", "items": [num(m.group(2))] * n, "derived": "한 줄 산문: 모두 같다"}, "answer"
    m = re.fullmatch(r"앞쪽이 (\d+)음절이고 뒤쪽이 (\d+)음절이다\.", ans)
    if m:
        return {"form": "number", "pair": True, "items": [[int(m.group(1)), int(m.group(2))]] * n,
                "derived": "한 줄 산문: 앞뒤 낱말의 음절"}, "answer"
    m = re.fullmatch(r"다섯 개 모두 gonna 자리가 (.+?) 다\.", ans)
    if m:
        return {"form": "tokens", "match": "phrase",
                "items": [{"of": [m.group(1)], "need": 1}] * n,
                "derived": "한 줄 산문: 모두 같다"}, "answer"
    m = re.fullmatch(r"다섯 개 모두 앞의 두 낱말이 (.+?) 로 같다\.", ans)
    if m:
        return {"form": "tokens", "match": "phrase",
                "items": [{"of": [m.group(1)], "need": 1}] * n,
                "derived": "한 줄 산문: 모두 같다"}, "answer"
    m = re.fullmatch(r"B는 (?:A가 )?흘린 덩어리(?:가 원래 어느 낱말들인지|의 원형(?:과 낱말 수)?)(?:을|를)? 낸다\. 재료 그대로다\.", ans)
    if m:
        items = [{"of": [x], "need": 1} for x in material_of(card)]
        k = {"form": "tokens", "match": "phrase", "items": items, "derived": "재료 그대로"}
        if "낱말 수" in ans:
            k["alsoCount"] = [len(x.split()) for x in material_of(card)]
        return k, "answer+material"
    m = re.fullmatch(r"받아들이는 응답은 (.+?) 이고 거절은 (.+?) 이다\.", ans)
    if m:
        words = [x.strip() for x in m.group(1).split(",")] + [x.strip() for x in m.group(2).split(",")]
        return {"form": "tokens", "match": "phrase", "items": [{"of": words, "need": 1}] * n,
                "derived": "받아들이는 응답과 거절 어느 것이든 하나"}, "answer"

    g = groups(card, ans, n)
    if g and sorted(g) == list(range(1, n + 1)):
        return from_groups(card, g, n), "answer"
    if g and ans:
        # 한 갈래만 적은 꼴 ("틀린 것은 2번과 5번이다")
        m = re.match(r"(.+?)(?:은|는)\s", ans)
        if len(set(l for v in g.values() for l in v)) == 1 and m:
            return {"form": "flag", "items": [k in g for k in range(1, n + 1)],
                    "flagLabel": list(g.values())[0][0]}, "answer"
    return None, "답을 못 읽었다: %s" % ans[:60]


def from_groups(card, g, n):
    """번호 -> 이름표 를 열쇠로. 수 이름표는 number, 이름표가 겹쳐 적히면 labels 다."""
    flat = [v for k in sorted(g) for v in g[k]]
    singles = [g[k][0] for k in sorted(g)]
    if all(len(g[k]) == 1 for k in g) and all(re.fullmatch(r"\d+개?|%s" % "|".join(KO), s) for s in singles):
        return {"form": "number", "items": [int(s.rstrip("개")) if s.rstrip("개").isdigit() else KO[s] for s in singles]}
    # 이름표 하나에 "2층과 3층" 처럼 둘이 붙은 것은 쪼갠다
    base = [l for k in g for l in g[k] if not re.search(r"과|와", l)]
    out = {}
    for k in sorted(g):
        vals = []
        for l in g[k]:
            if re.search(r"(?<=\S)(?:과|와)(?=\s)|(?<=[층조각단계])(?:과|와)", l) and \
                    all(p.strip() in base or re.sub(r"[이가]? 빠졌다$", "", p.strip()) in base
                        for p in re.split(r"과|와", l)):
                vals += [p.strip() for p in re.split(r"과|와", l)]
            else:
                vals.append(l)
        out[k] = vals
    labels = sorted({l for v in out.values() for l in v}, key=lambda x: flat.index(x) if x in flat else 999)
    if all(len(out[k]) == 1 for k in out):
        return {"form": "label", "items": [out[k][0] for k in sorted(out)], "labels": labels}
    return {"form": "label", "multi": True, "items": [out[k] for k in sorted(out)], "labels": labels}


def manual_key(card, row):
    """3.1 표의 한 줄을 열쇠로. 값이 낱개면 칸마다 같은 값이다."""
    cid = card["id"]
    f, v = row["form"], row["value"]
    mat = material_of(card)
    n = len(mat)
    if f == "side":
        items = v if isinstance(v, list) else [v] * n
        return {"form": "side", "items": items, "options": pair_options(mat), "derived": "표 3.1"}
    if f == "label":
        items = v if isinstance(v, list) else [v] * n
        k = {"form": "label", "items": items, "labels": row["options"], "derived": "표 3.1"}
        if any(isinstance(x, list) for x in items):
            k["multi"] = True
        return k
    if f == "flag":
        return {"form": "flag", "items": v, "flagLabel": row["options"][0] if row["options"] else "", "derived": "표 3.1"}
    if f == "npc_pick":
        # v 는 어떻게 고르나: "pair" 한 쌍에서 한쪽, "two_of_all" 다섯에서 둘, "order" 같은 덩어리를 두 번 읽는 차례
        if v == "two_of_all":
            plan = pick_plan(cid, n, "two_of_all")
            return {"form": "npc_pick", "pick": "two_of_all", "options": mat, "plan": plan, "derived": "표 3.1"}
        if v == "bracket":
            opts = []
            for x in mat:
                halves = [h.strip() for h in x.split(" / ")]
                opts.append([re.search(r"\[([^\]]+)\]", h).group(1) for h in halves])
            return {"form": "npc_pick", "pick": "pair", "options": opts,
                    "plan": pick_plan(cid, n, "pair"), "derived": "표 3.1: 대괄호 낱말"}
        if v == "order":
            return {"form": "npc_pick", "pick": "order", "options": mat,
                    "plan": pick_plan(cid, n, "pair"), "derived": "표 3.1: 흘린 쪽이 몇 번째"}
        return {"form": "npc_pick", "pick": "pair", "options": pair_options(mat),
                "plan": pick_plan(cid, n, "pair"), "derived": "표 3.1"}
    if f == "position":
        items = []
        for x in mat:
            m = re.fullmatch(r"([a-z]*)\[\]([a-z]*)", x)
            items.append(len(m.group(1)) if m else None)
        return {"form": "position", "items": items, "words": [x.replace("[]", "") for x in mat],
                "derived": "표 3.1: 대괄호 자리"}
    if f == "tokens_pair":
        return {"form": "tokens", "match": "phrase", "items": [{"of": [x], "need": 1} for x in v], "derived": "표 3.1"}
    return {"form": "?", "error": f}


def open_key(card, row):
    return {"form": "open", "how": row["how"], "rule": row["rule"], "why": row["why"]}


def build():
    fail = []
    cards = [c for c in json.load(open(CARDS, encoding="utf-8"))["items"] if c["type"] == "판정"]
    manual = manual_rows()
    opens = open_rows()
    if manual is None or opens is None:
        return None, ["docs/game_data.md 에 3.1 이나 3.2 표가 없다"]
    out, unparsed, keyed, mism = [], [], 0, []
    for c in cards:
        cid = c["id"]
        pa, pb = parse_pass(c["a"].get("pass", "")), parse_pass(c["b"].get("pass", ""))
        if pa is None:
            unparsed.append({"id": cid, "why": "a.pass 에서 숫자를 못 읽었다: %s" % c["a"].get("pass")})
            continue
        if pb is None:
            unparsed.append({"id": cid, "why": "b.pass 에서 숫자를 못 읽었다: %s" % c["b"].get("pass")})
            continue
        how = c["b"].get("instruction", "")
        rec = {"id": cid, "no": c["no"], "quarter": c["quarter"], "n": pa[1], "k": pa[0]}
        if pa != pb:
            rec["kShown"] = pb[0]
            rec["nShown"] = pb[1]
            mism.append(cid)
        if c.get("seconds") is not None:
            rec["seconds"] = c["seconds"]
        if cid in opens:
            key = open_key(c, opens[cid])
            rec["input"] = input_of(c, "open", how)
            rec["key"] = key
            rec["source"] = "table"
            out.append(rec)
            continue
        key, src = key_of(c, manual)
        if key is None:
            unparsed.append({"id": cid, "why": src})
            continue
        if key["form"] not in FORMS:
            unparsed.append({"id": cid, "why": "형태를 모른다: %s" % key.get("error", key["form"])})
            continue
        rec["input"] = input_of(c, key["form"], how)
        rec["key"] = key
        rec["source"] = src
        keyed += 1
        out.append(rec)
    obj = {
        "note": "판정형 카드 140장의 기계 열쇠다. out/data/cards.json 의 a.answer 와 a.pass 에서 읽는다. "
                "손으로 안 고친다. scripts/derive_judge.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "열쇠 값은 카드 글을 옮긴 것이라 A 다. 산문 답을 읽은 표(game_data.md 3.1)와 NPC 가 읽는 쪽의 해시 배정은 사람이 읽은 것이라 B 다.",
        "generator": "scripts/derive_judge.py",
        "source": "out/data/cards.json (판정 140장), docs/game_data.md 3장",
        "visibility": "game-only",
        "visibilityNote": "정답 열쇠다. 게임이 쥐고 판단하는 데만 쓴다. 화면, 말풍선, 가이드북, 결과 JSON 어디에도 안 낸다 (기준서 8.2, 13.2, game.md 1.3).",
        "forms": FORMS,
        "inputs": INPUTS,
        "count": len(out),
        "keyed": sum(1 for r in out if r["key"]["form"] != "open"),
        "open": sum(1 for r in out if r["key"]["form"] == "open"),
        "unparsed": unparsed,
        "passMismatch": mism,
        "cards": out,
    }
    return obj, fail


def main():
    obj, fail = build()
    for f in fail:
        print("[실패] " + f)
    if obj is None:
        return 1
    if obj["unparsed"]:
        for u in obj["unparsed"]:
            print("[실패] %s: %s" % (u["id"], u["why"]))
        print("판정 열쇠를 안 냈다. 못 읽은 카드 %d장" % len(obj["unparsed"]))
        return 1
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write("\n")
    forms = {}
    for r in obj["cards"]:
        forms[r["key"]["form"]] = forms.get(r["key"]["form"], 0) + 1
    print("out/game/judge.json / 판정 %d장 열쇠 %d 열쇠 없음 %d / 못 읽음 0 / 통과선 어긋남 %d / %s"
          % (obj["count"], obj["keyed"], obj["open"], len(obj["passMismatch"]),
             " ".join("%s %d" % kv for kv in sorted(forms.items()))))
    return 0


if __name__ == "__main__":
    sys.exit(main())
