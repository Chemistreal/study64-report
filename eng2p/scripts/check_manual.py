#!/usr/bin/env python3
"""설명하는 글이 앱과 같은 말을 하는지 견준다.

T155 에 매뉴얼을 앱 중심으로 다시 썼다. 그러면서 매뉴얼이 앱의 값을 말하게 됐다.
블록 이름과 분, 회차 초점 셋, 대본 가림 셋, 단추 자리다.

**설명하는 글은 설명 대상보다 늦게 낡는다.** 앱을 고치면 코드가 바뀌고 검사가 돈다.
매뉴얼은 아무도 안 건드린다. 그리고 두 사람은 매뉴얼을 믿는다.
T154 에 회차를 바꿨을 때 매뉴얼 10.2 가 옛말을 하고 있었다. 손으로 알아채고 고쳤다.
**손으로 알아채는 것은 다음에 안 된다.**

그래서 견준다. 문서에 적힌 값과 `english.html` 안의 값이 같은지만 본다.
글이 좋은지는 안 본다. 그것은 사람이 본다.

보는 문서가 둘이다. `out/manual/eng2p_manual.md` 와 `docs/pair.md` 다.
뒤엣것은 T235 에 붙었다. **코드가 자기를 채점하면 늘 백 점**이라서다.
짝 코드의 자리 폭이 맞는지 아는 자리는 코드 밖에 하나뿐이고 그것이 규격 문서다.

쓰는 법:
    python3 scripts/check_manual.py

규격: docs/roadmap.md 11.11
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MAN = ROOT / "out" / "manual" / "eng2p_manual.md"
APP = ROOT.parent / "english.html"

FAIL = []
PAIR = ROOT / "docs" / "pair.md"

# 열두 열세를 셈으로 견주려면 말과 수를 잇는 표가 있어야 한다.
KONUM = {11: "열한", 12: "열두", 13: "열세", 14: "열네", 15: "열다섯"}


def check_pair(app):
    """짝 코드의 자리 폭을 `docs/pair.md` 7.1 과 견준다.

    `check_ui.js` 가 코덱을 판 열로 재는데 **그 기댓값을 코드 자신에게서 뽑는다.**
    그래서 자리 폭을 8에서 4로 바꿔도 안 걸린다. 일부러 깨 보고 알았다 (T235).
    폭이 맞는지를 아는 자리는 코드 밖에 하나뿐이다. 규격을 적어 둔 문서다.

    **코드가 자기를 채점하면 늘 백 점이다.**
    """
    if not PAIR.exists():
        FAIL.append("docs/pair.md 가 없다. 짝 코드 규격을 견줄 데가 없다")
        return 0
    doc = PAIR.read_text(encoding="utf-8")
    m = re.search(r"var PC_FIELDS=\[(.*?)\n\];", app, re.S)
    if not m:
        FAIL.append("앱에서 PC_FIELDS 를 못 읽었다")
        return 0
    fields = [(k, int(w)) for k, w in re.findall(r'\["(\w+)",\s*(\d+)\]', m.group(1))]
    if not fields:
        FAIL.append("앱의 PC_FIELDS 가 비었다")
        return 0
    for k, w in fields:
        row = re.search(r"^\| %s \| (\d+) \|" % re.escape(k), doc, re.M)
        if not row:
            FAIL.append("docs/pair.md 7.1 에 짝 코드 자리 %s 가 없다" % k)
        elif int(row.group(1)) != w:
            FAIL.append("짝 코드 %s 폭이 앱은 %d 인데 docs/pair.md 는 %s 다"
                        % (k, w, row.group(1)))
    for row in re.findall(r"^\| (\w+) \| \d+ \|", doc, re.M):
        if row not in [k for k, _ in fields]:
            FAIL.append("docs/pair.md 7.1 의 %s 가 앱에 없다" % row)

    # 비트 합과 글자 수. 둘 다 폭에서 나오는 값이라 손으로 적으면 어긋난다.
    bits = sum(w for _, w in fields)
    chars = -(-bits // 5)
    if ("합이 %d비트다" % bits) not in doc:
        FAIL.append("docs/pair.md 가 비트 합을 %d 로 안 적었다" % bits)
    for n, what in ((chars, "몸글자"), (chars + 1, "코드 길이")):
        word = KONUM.get(n)
        if word and (word + " 글자") not in doc:
            FAIL.append("docs/pair.md 에 %s가 '%s 글자' 로 안 적혀 있다" % (what, word))

    # 진도로 세는 자리. 갈리면 48주가 밀리는 쪽이라 문서와 코드가 같아야 한다.
    h = re.search(r'var PC_HEAVY=\[([^\]]*)\]', app)
    if not h:
        FAIL.append("앱에서 PC_HEAVY 를 못 읽었다")
    else:
        heavy = re.findall(r'"(\w+)"', h.group(1))
        # 3장에도 "진도" 로 시작하는 줄이 있다. 거기는 저장소 값 갈래고 여기는 코드 자리다.
        # **같은 말이 두 자리에 있으면 앞엣것이 걸린다.** 8장부터 본다.
        at = doc.find("## 8.")
        drow = re.search(r"^\| 진도 \| ([^|]+) \|", doc[at:] if at >= 0 else doc, re.M)
        if not drow:
            FAIL.append("docs/pair.md 8.2 에 진도 줄이 없다")
        else:
            want = re.findall(r"`(\w+)`", drow.group(1))
            if sorted(want) != sorted(heavy):
                FAIL.append("진도로 세는 자리가 앱은 %s 인데 문서는 %s 다"
                            % (",".join(heavy), ",".join(want)))
    return len(fields)


def check_pair_manual(app, man):
    """매뉴얼 10.11 이 짝 코드를 앱과 같게 설명하는가. T236

    **두 사람이 읽는 것은 이 글이다.** 코드가 열넷이 됐는데 매뉴얼이 열셋이라고
    적혀 있으면 두 사람은 열셋을 세고 하나가 남는 것을 자기 잘못으로 안다.
    """
    m = re.search(r"var PC_FIELDS=\[(.*?)\n\];", app, re.S)
    if not m:
        return
    bits = sum(int(w) for _, w in re.findall(r'\["(\w+)",\s*(\d+)\]', m.group(1)))
    ln = -(-bits // 5) + 1
    word = KONUM.get(ln)
    if word and (word + " 글자") not in man:
        FAIL.append("매뉴얼에 짝 코드가 '%s 글자' 로 안 적혀 있다" % word)
    # 앱이 내는 말 그대로. 길이가 바뀌면 이 인용이 먼저 낡는다.
    quote = "%d글자여야 하는데" % ln
    if quote not in man:
        FAIL.append("매뉴얼이 앱의 길이 안내('%s') 를 옛말로 적고 있다" % quote)
    # 뺀 글자. 앱의 글자표에 없는 것이 매뉴얼에도 없다고 적혀 있어야 한다.
    # **양쪽으로 본다.** 뺀 것이 매뉴얼에 있는가만 보면 뺐다가 도로 넣은 것이 안 걸린다.
    # 일부러 I 를 도로 넣어 봤는데 조용했다. 매뉴얼은 여전히 안 나온다고 적고 있었다. T236
    abc = re.search(r'var PC_ABC="([^"]+)"', app)
    if abc:
        table = abc.group(1)
        if len(table) != 32:
            FAIL.append("짝 코드 글자표가 %d글자다. 다섯 비트라 서른둘이어야 한다" % len(table))
        if len(set(table)) != len(table):
            FAIL.append("짝 코드 글자표에 같은 글자가 두 번 있다")
        # **머리말을 접두로 자르면 안 된다.** `### 10.11` 로 자르면 `### 10.12` 는
        # 안 물지만 `### 10.11b` 같은 것이 생기면 문다. 실제로 T241 에 물렸다.
        # 그 머리말에서 다음 머리말까지로 자른다.
        tail = ""
        m2 = re.search(r"^### 10\.11 .*?(?=^### )", man, re.S | re.M)
        if m2:
            tail = m2.group(0)
        else:
            FAIL.append("매뉴얼에 10.11 짝 코드 자리가 없다")
        # 와 과 를 번갈아 쓴다. 받침 때문이다. 이음말로 잡지 말고 글자만 줍는다.
        said = re.search(r"\*\*([^*]*?) 가 안 나온다", tail)
        said = re.findall(r"[A-Z]", said.group(1)) if said else []
        for c in [x for x in "ILOU" if x not in table]:
            if c not in said:
                FAIL.append("매뉴얼에 코드에서 뺀 글자 %s 가 안 적혀 있다" % c)
        for c in said:
            if c in table:
                FAIL.append("매뉴얼은 %s 가 코드에 안 나온다는데 글자표에 있다" % c)
    # 활동량이 다른 것은 맞추지 않는다. 이것을 안 적으면 두 사람이 숫자를 지어낸다.
    if "활동량은 원래 다르다" not in man:
        FAIL.append("매뉴얼에 활동량은 맞추지 않는다는 말이 없다")


MERGE = ROOT / "docs" / "merge.md"


def check_merge(app, man):
    """합치기가 규격과 매뉴얼과 같은 말을 하는가. T238

    **안 건너가는 목록이 제일 위험하다.** 여기에 하나를 빠뜨리면 그 값이
    조용히 상대 기기 것으로 바뀐다. 화면에서 안 보이고 검사에서도 안 보인다.
    목록이 세 자리에 있다. `docs/pair.md` 3장, `docs/merge.md` 3.1, 앱의 MG_LOCAL 이다.
    """
    if not MERGE.exists():
        FAIL.append("docs/merge.md 가 없다")
        return
    doc = MERGE.read_text(encoding="utf-8")
    m = re.search(r"var MG_LOCAL=\[([^\]]*)\]", app)
    if not m:
        FAIL.append("앱에서 MG_LOCAL 을 못 읽었다")
        return
    code = set(re.findall(r'"(\w+)"', m.group(1)))
    # 3.1 **표에서만** 줍는다. 줄글에도 백틱이 있다.
    # 3.1 이 "`veil` 은 저장소에 없다" 고 적어 두고 있는데 그것을 목록으로 읽었다.
    # **목록을 읽으려면 목록만 읽어야 한다.** 같은 문단에 있다고 같은 목록이 아니다.
    at = doc.find("### 3.1")
    end = doc.find("### 3.2", at if at >= 0 else 0)
    rows = [l for l in (doc[at:end] if at >= 0 else "").split("\n")
            if l.startswith("| `")]
    said = set()
    for l in rows:
        said |= set(re.findall(r"`(\w+)`", l.split("|")[1]))
    for k in sorted(code - said):
        FAIL.append("앱은 %s 를 안 건너가는 것으로 두는데 docs/merge.md 3.1 에 없다" % k)
    for k in sorted(said - code):
        FAIL.append("docs/merge.md 3.1 은 %s 가 안 건너간다는데 앱의 MG_LOCAL 에 없다" % k)
    # 세션 중 막기. 매뉴얼이 그렇게 적어 뒀으면 앱에 그 자리가 있어야 한다.
    if "세션 중에는 안 합친다" in man and "function mergeBusy" not in app:
        FAIL.append("매뉴얼은 세션 중에 안 합친다는데 앱에 그 자리가 없다")
    if "function mergeBusy" in app and "세션 중에는 안 합친다" not in man:
        FAIL.append("앱이 세션 중에 막는데 매뉴얼이 그 말을 안 한다")
    # 합치기가 기본이라고 적었으면 화면에 그 단추가 있어야 한다.
    if "JSON 합치기" in man and 'id="mgBtn"' not in app:
        FAIL.append("매뉴얼이 말하는 JSON 합치기 단추가 앱에 없다")

    # `docs/pair.md` 10장이 안 건너가는 것이 몇인지를 말로 적었다. T257
    # **말로 적은 수는 코드가 늘 때 안 따라 는다.** 세어서 견준다.
    pairdoc = PAIR.read_text(encoding="utf-8") if PAIR.exists() else ""
    m2 = re.search(r"첫째가 여섯에서 (\S+?)이 됐다", pairdoc)
    KO = {"열": 10, "열하나": 11, "열둘": 12, "열셋": 13, "열넷": 14,
          "열다섯": 15, "열여섯": 16, "열일곱": 17, "열여덟": 18,
          "열아홉": 19, "스물": 20}
    if m2:
        want = KO.get(m2.group(1))
        if want is None:
            FAIL.append("docs/pair.md 10장의 '%s' 를 셈으로 못 읽는다" % m2.group(1))
        elif want != len(code):
            FAIL.append("안 건너가는 것이 %d개인데 docs/pair.md 10장은 '%s' 이라고 적었다"
                        % (len(code), m2.group(1)))


def main():
    if not MAN.exists() or not APP.exists():
        print("[실패] 매뉴얼이나 앱이 없다")
        return 1
    man = MAN.read_text(encoding="utf-8")
    app = APP.read_text(encoding="utf-8")

    # 1. 블록 넷의 이름과 분. 앱의 BLOCKS 가 원본이다.
    blocks = re.findall(r'\{n:"([^"]+)",m:(\d+)', app)
    if len(blocks) != 4:
        FAIL.append("앱에서 블록 넷을 못 찾았다: %d개" % len(blocks))
    else:
        for i, (name, m) in enumerate(blocks, 1):
            row = re.search(r"^\| %d %s \| (\d+)분 \|" % (i, re.escape(name)), man, re.M)
            if not row:
                FAIL.append("매뉴얼 2.2 표에 '%d %s' 줄이 없다" % (i, name))
            elif row.group(1) != m:
                FAIL.append("블록 %d 이 앱은 %s분 매뉴얼은 %s분이다" % (i, m, row.group(1)))
        total = sum(int(m) for _, m in blocks)
        if total != 120:
            FAIL.append("블록 합이 %d분이다. 120분이어야 한다" % total)

    # 2. 회차 초점 셋. 순서까지 같아야 한다.
    focus = re.findall(r'"([0-9])회차 초점은 ([가-힣]+)다', app)
    got = [w for _, w in sorted(focus, key=lambda x: x[0])]
    if got != ["소리", "청크", "의미"]:
        FAIL.append("앱의 회차 초점이 %s 다. 소리 청크 의미여야 한다" % " ".join(got) if got
                    else "앱에서 회차 초점 셋을 못 찾았다")
    for n, word in zip(("1회차", "2회차", "3회차"), ("소리", "청크", "의미")):
        # 매뉴얼 10.2 표와 6장 카드 둘 다에 있어야 한다
        if not re.search(r"\| %s[^|]*\| %s" % (n, word), man):
            FAIL.append("매뉴얼 10.2 회차 표에 %s %s 줄이 없다" % (n, word))

    # 3. 대본 가림. veilOf 가 원본이다. 0이 다 보임, 1이 덩어리만, 2가 가림이다.
    m = re.search(r"function veilOf\(round\)\{[^}]*?return round===1 \? (\d) : "
                  r"round===2 \? (\d) : (\d);", app, re.S)
    if not m:
        FAIL.append("앱에서 veilOf 를 못 읽었다. 회차마다 가림이 다른지 볼 수 없다")
    else:
        want = {"1": "가림", "2": "덩어리만", "3": "다 보임"}
        veilname = ["다 보임", "덩어리만", "가림"]
        for i, v in enumerate(m.groups(), 1):
            if veilname[int(v)] != want[str(i)]:
                FAIL.append("앱에서 %d회차 가림이 %s 다. %s 여야 한다"
                            % (i, veilname[int(v)], want[str(i)]))
            if want[str(i)] not in man:
                FAIL.append("매뉴얼에 %d회차 가림(%s) 이 안 적혀 있다" % (i, want[str(i)]))

    # 4. 끝냈다 단추 자리. 앱은 같이 듣는 자리에만 낸다. 매뉴얼도 그렇게 말해야 한다.
    if 'seat==="together"' not in app:
        FAIL.append("앱이 끝냈다 단추를 자리로 안 가른다")
    if "블록 4에만 있다" not in man and "블록 4에서 회차 끝냈다" not in man:
        FAIL.append("매뉴얼에 끝냈다 단추가 블록 4에만 있다는 말이 없다")

    nfield = check_pair(app)
    check_pair_manual(app, man)
    check_merge(app, man)

    for f in FAIL:
        print("[실패] %s" % f)
    print()
    print("매뉴얼과 앱 대조 / 블록 4개 / 회차 3개 / 가림 3개 / 단추 자리 1개 / "
          "짝 코드 자리 %d개 / 실패 %d" % (nfield, len(FAIL)))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
