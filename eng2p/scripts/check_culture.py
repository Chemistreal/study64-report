#!/usr/bin/env python3
"""문화 지침 검사 (`docs/culture.md`). **목록은 문서의 표에서 읽는다.**

규칙 셋을 본다.

    (a) 2.2 금지어(신성한 것, 고정관념)가 게임 내용에 있는가.
        2.3 문화 낱말과 놀이 장치 낱말이 한 줄(JSON 은 한 문자열)에 같이 있는가.
    (b) 5.1 목록의 하와이어 낱말이 ʻokina 나 장음 없이 적혔는가.
        ʻokina 자리에 U+02BB 아닌 글자(곧은 따옴표, 굽은 따옴표 둘, U+02BC, 억음, 양음)를 썼는가.
        하와이어 낱말에 영어 -s 복수를 붙였는가. 결합 장음 부호(U+0304)를 썼는가.
        **목록에 있는 낱말만 본다.** 목록 밖 낱말은 모른다.
    (c) 2.4 노래 두 곡(Aloha ʻOe, Hawaiʻi Ponoʻī)이 배경 음악 쓰임과 같이 나오는가.

대상은 docs/world.md, docs/town.md, docs/scenes.md, out/game/*.json 이다.
(c) 만은 docs/sources.md 도 본다. 곡을 고르는 표가 거기 3.4 에 있기 때문이다.
**이 넷은 다른 사람이 맡은 문서다.** 이 검사는 고치지 않고 실패만 보인다.

금지하는 문장은 봐 준다. 마크다운의 한 줄에 "안 넣는다", "금지", "쓰지 않" 같은 말이 있으면
(a) 를 그 줄에 안 건다. world.md 3.1 의 "퀘스트 보상이나 수집품으로 만들지 않는다" 가 그 꼴이다.
**JSON 은 봐 주지 않는다.** 게임이 화면에 내는 글이기 때문이다.

VOA 대본 줄은 (b) 를 안 건다. 들은 그대로여야 하기 때문이다 (scenes.md 2장).
scenes.md 의 표 줄 끝 칸이 lle1-NN 인 줄과 scenes.json 의 from 이 lle1- 인 say 가 그것이다.

**기계가 안 보는 것.** 뜻, 그림, 소리, 장면의 흐름. culture.md 4장 검토 목록 2~17번은 사람이 본다.

사용법:
    python3 scripts/check_culture.py              # 정해진 대상
    python3 scripts/check_culture.py 파일 ...     # 준 파일만. 세 규칙을 다 건다 (깸 시험용)

종료 코드 0이면 통과, 1이면 실패.
"""
import json
import pathlib
import re
import sys
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parent.parent
RULES = ROOT / "docs" / "culture.md"

TARGETS = ["docs/world.md", "docs/town.md", "docs/scenes.md"]
TARGET_GLOBS = ["out/game/*.json"]
MUSIC_ONLY = ["docs/sources.md"]

OKINA = chr(0x02BB)
# ʻokina 자리에 잘못 쓰는 글자들. 리터럴로 적으면 눈으로 못 가른다. 그래서 번호로 적는다.
WRONG_OKINA = [chr(0x0027), chr(0x2018), chr(0x2019), chr(0x02BC), chr(0x0060), chr(0x00B4)]
APOS_CLASS = "[" + OKINA + "".join(re.escape(c) for c in WRONG_OKINA) + "]"
COMBINING_MACRON = chr(0x0304)
MACRON = {"ā": "a", "ē": "e", "ī": "i", "ō": "o", "ū": "u"}

LATIN = "A-Za-z" + "".join(MACRON) + "".join(MACRON).upper() + OKINA
HANGUL = "가-힣"
# 한국어 낱말 뒤에 붙어도 같은 낱말로 보는 조사.
# 긴 것을 앞에 둔다. 정규식은 먼저 맞는 것을 고른다.
PARTICLES = ("으로는|으로|에서|에게|처럼|까지|부터|마다|이나|이랑|들이|들을|들은|들의|에는|로는|이다|이며|이야"
             "|은|는|이|가|을|를|도|와|과|의|로|에|만|나|랑|들|다|인|야")

# 금지하는 문장. 마크다운 줄에 이것이 있으면 (a) 를 안 건다.
NEGATION = re.compile(
    r"(안 넣|안 쓴|안 쓰|안 만든|안 만들|안 그린|안 그리|안 한다|안 된다|안 더하|않는다|않고|않게|"
    r"쓰지 않|넣지 않|만들지 않|그리지 않|두지 않|닫지 않|금지|하지 마|뺀다|빼고|"
    # 2026-10-07 합칠 때 더했다. "퀘스트가 아니고", "안 붙이고", "안 준다", "안 하는 것" 이
    # 금지 문장인데 실패로 잡혔다. 아홉 줄 다 그랬다
    r"아니고|아니다|안 붙|안 준|안 하는|안 건다|"
    r"\bnever\b|\bdo not\b|\bdon't\b|\bnot used\b)")

VOA_CELL = re.compile(r"\|\s*lle1-\d+\s*\|\s*$")
URL = re.compile(r"https?://\S+")

FAIL = []


def fail(rule, where, msg):
    FAIL.append((rule, where, msg))


# 문서의 표 읽기 ---------------------------------------------------------------

def section(text, head):
    """`### 2.2 ` 처럼 시작하는 제목 아래부터 다음 제목 전까지."""
    lines = text.split("\n")
    out, on = [], False
    for ln in lines:
        if ln.startswith("#"):
            if on:
                break
            if ln.lstrip("#").strip().startswith(head):
                on = True
                continue
        elif on:
            out.append(ln)
    return out


def table_rows(lines):
    rows = []
    for ln in lines:
        if not ln.startswith("|"):
            continue
        cells = [c.strip() for c in ln.strip().strip("|").split("|")]
        if all(re.fullmatch(r":?-+:?", c) for c in cells if c):
            continue
        rows.append(cells)
    return rows[1:]  # 머리 줄을 뺀다


def terms(cell):
    return [t.strip() for t in re.findall(r"`([^`]+)`", cell) if t.strip()]


def is_hangul(s):
    return bool(re.search("[" + HANGUL + "]", s))


def term_regex(term, flex_macron=False, korean_bound=True):
    """낱말 하나를 정규식으로. 영어는 대소문자와 ʻokina 꼴을 안 가린다."""
    if is_hangul(term):
        body = r"\s*".join(re.escape(p) for p in term.split())
        if not korean_bound:
            return re.compile(body)
        return re.compile(r"(?<![%s])%s(?=(?:%s)?(?![%s]))" % (HANGUL, body, PARTICLES, HANGUL))
    out = []
    for ch in term:
        if ch == OKINA or ch in WRONG_OKINA:
            out.append(APOS_CLASS + "?")
        elif flex_macron and ch.lower() in MACRON:
            base = MACRON[ch.lower()]
            out.append("[%s%s]" % (ch.lower(), base))
        elif flex_macron and ch.lower() in "aeiou":
            # 장음이 없는 모음에 장음을 붙인 것도 틀린 철자다. 여기서는 잡지 않는다.
            out.append(re.escape(ch))
        elif ch in " -":
            out.append(r"[\s\-]+")
        else:
            out.append(re.escape(ch))
    return re.compile(r"(?<![%s])%s(?![%s])" % (LATIN, "".join(out), LATIN), re.I)


def load_rules():
    text = RULES.read_text(encoding="utf-8")
    rules = {"forbid": [], "culture": [], "device": [], "song": [], "use": [], "allow": [], "words": []}

    for cells in table_rows(section(text, "2.2 ")):
        kind = cells[1] if len(cells) > 1 else ""
        for t in terms(cells[0]):
            rules["forbid"].append((t, kind, term_regex(t)))

    side_key = {"문화": "culture", "장치": "device"}
    for cells in table_rows(section(text, "2.3 ")):
        key = side_key.get(cells[1] if len(cells) > 1 else "")
        if not key:
            continue
        for t in terms(cells[0]):
            bound = key == "culture"   # 장치 낱말은 "해금된다", "보상으로" 처럼 뒤에 붙는다
            rules[key].append((t, term_regex(t, korean_bound=bound)))

    song_key = {"노래": "song", "쓰임": "use", "허용": "allow"}
    for cells in table_rows(section(text, "2.4 ")):
        key = song_key.get(cells[1] if len(cells) > 1 else "")
        if not key:
            continue
        for t in terms(cells[0]):
            if key == "song":
                rules[key].append((t, term_regex(t, flex_macron=True)))
            else:
                rules[key].append((t, term_regex(t, korean_bound=False)))

    for cells in table_rows(section(text, "5.1 ")):
        if len(cells) < 4:
            continue
        mode = cells[3]
        if mode not in ("예", "철자"):
            continue
        for t in terms(cells[0]):
            plural = "(s)?" if mode == "예" else "()"
            rx = term_regex(t, flex_macron=True)
            pat = rx.pattern.replace("(?![%s])" % LATIN, plural + "(?![%s])" % LATIN, 1)
            rules["words"].append((t, re.compile(pat, re.I)))

    # 6만 단위에 정규식 백칠십을 하나씩 걸지 않는다. 묶은 것으로 먼저 거른다.
    # 묶음은 거르기만 한다. 실패 판정은 낱말 하나하나의 정규식이 한다.
    for k, i in (("forbid", 2), ("culture", 1), ("song", 1), ("words", 1)):
        rules[k + "_any"] = re.compile("|".join("(?:%s)" % e[i].pattern for e in rules[k]), re.I) \
            if rules[k] else re.compile(r"(?!x)x")

    empty = [k for k in ("forbid", "culture", "device", "song", "use", "allow", "words") if not rules[k]]
    if empty:
        print("[실패] culture.md 의 표를 못 읽었다: %s. 제목 번호(2.2 2.3 2.4 5.1)가 바뀌었는지 본다"
              % " ".join(empty))
        sys.exit(1)
    return rules


# 대상 읽기 --------------------------------------------------------------------

def md_units(path):
    """마크다운은 줄이 단위다. 표의 머리 칸도 같이 넘긴다 ((c) 가 쓴다)."""
    lines = path.read_text(encoding="utf-8").split("\n")
    name = rel(path)
    header = None
    for i, ln in enumerate(lines):
        nxt = lines[i + 1] if i + 1 < len(lines) else ""
        if ln.startswith("|") and re.fullmatch(r"\|[\s:|\-]+\|?", nxt.strip()):
            header = [c.strip() for c in ln.strip().strip("|").split("|")]
        elif not ln.startswith("|"):
            header = None
        yield {"where": "%s:%d" % (name, i + 1), "text": ln, "md": True,
               "header": header, "voa": bool(VOA_CELL.search(ln))}


def json_units(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    name = rel(path)

    def walk(o, p, parent):
        if isinstance(o, dict):
            for k, v in o.items():
                yield from walk(v, p + "." + k, o)
        elif isinstance(o, list):
            for i, v in enumerate(o):
                yield from walk(v, "%s[%d]" % (p, i), o)
        elif isinstance(o, str):
            voa = (isinstance(parent, dict) and p.endswith(".say")
                   and str(parent.get("from", "")).startswith("lle1-"))
            yield {"where": "%s %s" % (name, p), "text": o, "md": False,
                   "header": None, "voa": voa}

    yield from walk(data, "$", None)


def units(path):
    if path.suffix == ".json":
        return json_units(path)
    return md_units(path)


def rel(path):
    try:
        return str(path.resolve().relative_to(ROOT))
    except ValueError:
        return str(path)


# 규칙 ------------------------------------------------------------------------

def rule_a(u, rules):
    text = u["text"]
    if u["md"] and NEGATION.search(text):
        return
    if not rules["forbid_any"].search(text) and not rules["culture_any"].search(text):
        return
    for t, kind, rx in rules["forbid"]:
        m = rx.search(text)
        if m:
            fail("a", u["where"], "금지어 '%s' (%s): %s" % (t, kind, snip(text, m)))
    c = [(t, rx.search(text)) for t, rx in rules["culture"]]
    c = [(t, m) for t, m in c if m]
    if not c:
        return
    d = [(t, rx.search(text)) for t, rx in rules["device"]]
    d = [(t, m) for t, m in d if m]
    if d:
        fail("a", u["where"], "문화 낱말 '%s' 와 놀이 장치 '%s' 가 한 줄에: %s"
             % (c[0][0], d[0][0], snip(text, c[0][1])))


def rule_b(u, rules):
    if u["voa"]:
        return
    raw = URL.sub(" ", u["text"])
    if COMBINING_MACRON in raw:
        i = raw.index(COMBINING_MACRON)
        fail("b", u["where"], "결합 장음 부호(U+0304). 합쳐진 글자(ā ē ī ō ū)로 적는다: %s"
             % raw[max(0, i - 15):i + 15].strip())
    text = unicodedata.normalize("NFC", raw)
    if not rules["words_any"].search(text):
        return
    for word, rx in rules["words"]:
        for m in rx.finditer(text):
            got = m.group(0)
            plural = m.group(1) if m.lastindex else None
            stem = got[:-1] if plural else got
            if plural:
                fail("b", u["where"], "'%s' 에 영어 복수 -s. 하와이어는 복수도 같은 꼴이다 (%s)"
                     % (got, word))
            if stem.casefold() == word.casefold():
                continue
            bad = sorted({"U+%04X" % ord(ch) for ch in stem if ch in WRONG_OKINA})
            if bad:
                fail("b", u["where"], "'%s' 의 ʻokina 자리가 %s 다. U+02BB 로 적는다: %s"
                     % (stem, " ".join(bad), word))
            else:
                fail("b", u["where"], "'%s' 에 ʻokina 나 장음이 빠졌다. %s 로 적는다" % (stem, word))


def rule_c(u, rules):
    text = u["text"]
    if not rules["song_any"].search(text):
        return
    # 금지하는 마크다운 문장은 (a) 처럼 봐 준다 ("집들이 끝에 쓰지 않는다")
    if u["md"] and NEGATION.search(text):
        return
    songs = [(t, rx.search(text)) for t, rx in rules["song"]]
    songs = [(t, m) for t, m in songs if m]
    if not songs:
        return
    if any(rx.search(text) for _, rx in rules["allow"]):
        return
    used = [t for t, rx in rules["use"] if rx.search(text)]
    if u["header"] and any(h == "곡" for h in u["header"]):
        used.append("곡 고르는 표")
    if used:
        fail("c", u["where"], "'%s' 를 배경 음악 쓰임(%s)과 같이 적었다. 행사에서 사람들이 일어서 부르는 소리로만: %s"
             % (songs[0][0], ", ".join(used[:3]), snip(text, songs[0][1])))


def snip(text, m, width=40):
    s = max(0, m.start() - width)
    e = min(len(text), m.end() + width)
    return ("…" if s else "") + text[s:e].strip() + ("…" if e < len(text) else "")


# 실행 ------------------------------------------------------------------------

def main(argv):
    rules = load_rules()
    if argv:
        full = [pathlib.Path(a) for a in argv]
        music = []
    else:
        full = [ROOT / t for t in TARGETS]
        for g in TARGET_GLOBS:
            full += sorted(ROOT.glob(g))
        music = [ROOT / t for t in MUSIC_ONLY]

    missing = [rel(p) for p in full + music if not p.exists()]
    if missing:
        print("[실패] 대상 파일이 없다: %s" % " ".join(missing))
        return 1

    n = 0
    for p in full:
        for u in units(p):
            n += 1
            rule_a(u, rules)
            rule_b(u, rules)
            rule_c(u, rules)
    for p in music:
        for u in units(p):
            n += 1
            rule_c(u, rules)

    for rule, where, msg in FAIL:
        print("[실패] (%s) %s: %s" % (rule, where, msg))

    count = {r: sum(1 for f in FAIL if f[0] == r) for r in "abc"}
    print("\n표에서 읽음: 금지어 %d, 문화 낱말 %d, 장치 낱말 %d, 노래 %d, 낱말 %d"
          % (len(rules["forbid"]), len(rules["culture"]), len(rules["device"]),
             len(rules["song"]), len(rules["words"])))
    print("검사 %d개 파일 (노래만 %d개) / %d 단위 / 실패 (a) %d (b) %d (c) %d"
          % (len(full), len(music), n, count["a"], count["b"], count["c"]))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
