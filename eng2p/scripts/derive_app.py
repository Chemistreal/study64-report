#!/usr/bin/env python3
"""`app/` 조각을 합쳐 `english.html` 을 만든다. **앱도 이제 파생물이다.**

한 파일이 4759줄이었다. 여기에 놀이 스무 판과 기기 둘을 더 넣으면 만 줄을 넘는다.
넣기 전에 쪼갠다. **쪼갠 뒤에 넣으면 한 턴이지만 넣고 쪼개면 세 턴이다.**

쪼갠 방식이 중요하다. 줄을 옮기지 않았다. 자르기만 했다.
`app/order.txt` 의 차례대로 이어 붙이면 **원래 파일과 한 바이트도 안 다르다.**
그래야 쪼개면서 잃은 것이 없다고 말할 수 있다. T161 에 그것을 확인하고 넣었다.

조각은 셋으로 나뉜다.

| 자리 | 무엇 |
|---|---|
| `app/page/` | 뼈대. 문서 머리와 태그 여닫이 |
| `app/style/` | 색과 자리와 시계와 인쇄 |
| `app/body/` | 탭마다 한 장 |
| `app/js/` | 열한 조각. 상수, 저장소, 배정, 오늘, 세션, 카드, 미디어, 몰기, 대장, 복습, 자료 |
| `app/play/` | **english.html 에 안 들어간다.** 판 탭을 열 때 읽는 묶음 |

**원본은 조각이고 `english.html` 은 파생물이다.** 손으로 고치지 않는다.
고치면 `check_derived.py` 가 다음 턴에 되돌린다.

## 나가는 파일이 둘이다 (T259)

`app/play/` 만 다른 파일로 나간다. `eng2p/out/app/plays.js` 다.

E단계가 스무 판을 붙인다. 첫 판이 10KB 였다. 스물이면 100KB 가 넘고
그것만으로 `check_perf.js` 의 천장을 넘는다. 천장은 그런 것을 막으려고 둔 것이다.

**두 사람이 판 탭을 안 여는 날도 있다.** 블록 1은 40분 듣기고 판이 안 든다.
그날은 안 읽으면 된다. `out/data` 의 무거운 것을 미룬 것과 같은 자리다
(`docs/friction.md` 8장).

가르는 자리는 `app/order.txt` 의 경로다. `play/` 로 시작하면 묶음으로 간다.
따로 표시를 안 만든다. **표시가 둘이면 둘이 어긋난다.**

쓰는 법:
    python3 scripts/derive_app.py

결과: english.html (저장소 뿌리) 와 eng2p/out/app/plays.js
규격: docs/roadmap.md 12.10 / docs/play_app.md
"""
import hashlib
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = ROOT / "app"
OUT = ROOT.parent / "english.html"
# 판 화면 묶음. **english.html 에 안 들어간다.** 판 탭을 열 때 읽는다.
LATEDIR = ROOT / "out" / "app"
# 늦게 읽는 자리 둘. **접두사가 곧 묶음 이름이다.**
#   play/  판 화면.        판 탭을 열 때 읽는다 (T259)
#   late/  드물게 여는 탭.  그 탭을 열 때 읽는다 (T313 뒤)
#
# 둘로 가른 까닭이 있다. 판 탭을 여는 사람과 회전 탭을 여는 사람이 다른 날이다.
# 한 묶음으로 두면 판 하나 열려고 검사 탭 코드까지 읽는다.
LAZY = {"play/": "plays.js", "late/": "late.js"}

# 조각 안에서만 사는 것. 합칠 때 뗀다. **주석은 조각에 남고 파생물에서만 빠진다.**
#
# 왜 떼는가. `check_perf.js` 의 천장에 닿았다 (T235). 처음에 읽는 것이 390KB 고
# 천장이 390 이다. 천장은 "기준선을 올려 검사를 끄는 길" 을 막으려고 둔 것이라
# 닿으면 **줄이는 쪽을 만들어야 한다.** 앱의 29%가 주석이었다.
#
# 두 사람은 주석을 안 읽는다. 읽는 것은 나고 나는 `app/` 을 읽는다.
# 그러니 파생물에서 빼도 잃는 것이 없다. 원본은 조각이다.
#
# **줄에 걸린 것만 뗀다.** 이유가 있다.
#
#     accept="audio/*,video/*"        HTML 속성 안에 /* 가 있다
#     replace(/^[A-Z]\s*:\s*/,"")     정규식 리터럴 안에 */ 가 있다
#
# 아무 데서나 `/*` 를 찾으면 저것들을 문다. 줄 첫머리에서 열고 줄 끝에서 닫는 것만
# 주석으로 본다. 그것이 이 저장소가 주석을 적는 꼴이고 저 둘은 그 꼴이 아니다.
# 줄 끝에 붙은 짧은 주석은 안 뗀다. 뗄 값도 0.9KB 고 무는 위험만 는다.
CUT_BLOCK = re.compile(r"^[ \t]*/\*(?:(?!\*/).)*?\*/[ \t]*\n", re.S | re.M)
CUT_LINE = re.compile(r"^[ \t]*//.*\n", re.M)
CUT_HTML = re.compile(r"^[ \t]*<!--(?:(?!-->).)*?-->[ \t]*\n", re.S | re.M)


def strip_notes(text, name):
    """조각 하나에서 줄에 걸린 주석을 뗀다. 줄 수는 안 지킨다.

    `english.html` 의 줄 번호를 쓰는 자리가 없다. 검사는 조각을 보고
    조각의 줄 번호로 말한다 (T235). 그래서 빈 줄로 채울 이유가 없다.
    """
    out = CUT_BLOCK.sub("", text)
    out = CUT_HTML.sub("", out)
    if name.endswith(".js"):
        out = CUT_LINE.sub("", out)
    return out


def order():
    """합치는 차례와 조각 이름. 이 파일이 곧 앱의 차례다.

    이름을 여기 둔다. 조각 안에 두면 CSS 와 HTML 조각에는 둘 자리가 없고,
    합쳐지는 파일에 설명이 섞여 들어간다. **차례와 이름이 한 자리에 있어야
    조각을 옮길 때 둘이 같이 움직인다.**
    """
    rows = []
    for line in (APP / "order.txt").read_text(encoding="utf-8").split("\n"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split(None, 1)
        if len(parts) < 2:
            print("[실패] 차례에 이름이 없다: %s" % parts[0])
            print("조각 이름 다음에 그 조각이 무엇인지를 적는다.")
            sys.exit(1)
        rows.append((parts[0], parts[1].strip()))
    return rows


def write_map(rows, parts):
    """조각 지도. **파생물이다.** 손으로 안 고친다.

    이름은 `app/order.txt` 가 갖고 줄 수는 조각을 세서 낸다.
    손으로 적은 지도는 조각을 옮기면 거짓말을 한다. 이 표는 못 그런다.
    """
    lines = [
        "# 앱 조각 지도",
        "",
        "신뢰도: A 생성 (파생물)",
        "상위 규격: docs/roadmap.md 12.10",
        "",
        "**손으로 안 고친다.** `python3 scripts/derive_app.py` 가 다시 뽑는다.",
        "이름은 `app/order.txt` 에서 오고 줄 수는 조각을 세서 낸다.",
        "",
        "차례도 그 파일이 정한다. **그 차례가 곧 파일의 차례다.**",
        "",
        "| 조각 | 줄 | 무엇 |",
        "|---|---|---|",
    ]
    tot = 0
    for (n, what), body in zip(rows, parts):
        k = body.count("\n") + 1
        tot += k
        lines.append("| `%s` | %d | %s |" % (n, k, what))
    lines += [
        "",
        "조각 %d개 %d줄이다. **한 조각은 500줄을 안 넘는다.**" % (len(rows), tot),
        "넘으면 `check_app.py` 가 실패로 낸다.",
        "쪼갤 자리가 없으면 그 검사의 면제표에 이유를 적는다. 문턱은 안 올린다.",
        "",
    ]
    (ROOT / "docs" / "app_map.md").write_text("\n".join(lines), encoding="utf-8")


def main():
    if not APP.exists():
        print("[실패] %s 가 없다" % APP)
        return 1
    rows = order()
    names = [n for n, _ in rows]
    missing = [n for n in names if not (APP / n).exists()]
    if missing:
        print("[실패] 차례에 적힌 조각이 없다: %s" % " ".join(missing))
        return 1

    # 차례에 안 적힌 조각이 생겼으면 그것도 알린다. 조용히 빠지면 안 된다.
    here = sorted(str(f.relative_to(APP)) for f in APP.rglob("*")
                  if f.is_file() and f.name != "order.txt")
    extra = [n for n in here if n not in names]
    if extra:
        print("[실패] 차례에 없는 조각이 있다: %s" % " ".join(extra))
        print("새로 만든 것이면 app/order.txt 에 넣는다. 자리가 곧 차례다.")
        return 1

    parts, slim = [], []
    lazy = {k: [] for k in LAZY}
    for n in names:
        t = (APP / n).read_text(encoding="utf-8")
        # 조각마다 끝 줄바꿈을 하나 붙여 뒀다. 이을 때 그 하나를 뗀다.
        if t.endswith("\n"):
            t = t[:-1]
        parts.append(t)
        got = strip_notes(t, n).rstrip("\n")
        for k in LAZY:
            if n.startswith(k):
                lazy[k].append(got)
                break
        else:
            slim.append(got)
    body = "\n".join(slim) + "\n"

    # 지도는 **조각의 줄 수**를 적는다. 파생물의 줄 수가 아니다.
    # 500줄 문턱은 조각을 재는 것이라 뗀 뒤의 수를 적으면 문턱이 저절로 헐거워진다.
    write_map(rows, parts)

    raw = len("\n".join(parts).encode()) + 1
    old = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
    OUT.write_text(body, encoding="utf-8")
    same = hashlib.sha256(old.encode()).hexdigest() == hashlib.sha256(body.encode()).hexdigest()
    kb = len(body.encode()) / 1024

    # 늦게 읽는 묶음들. **비어도 파일을 쓴다.** 없으면 그 탭이 못 읽었다고 적고
    # 두 사람이 내려받다 빠뜨린 줄 안다. 빈 것과 없는 것은 다르다.
    LATEDIR.mkdir(parents=True, exist_ok=True)
    late = []
    for pre in sorted(LAZY):
        f = LATEDIR / LAZY[pre]
        b = ("/* 늦게 읽는 묶음. app/%s 에서 나온다. 손으로 안 고친다. */\n" % pre
             + "\n".join(lazy[pre]) + "\n")
        f.write_text(b, encoding="utf-8")
        late.append("%s %d개 %.0fKB" % (LAZY[pre], len(lazy[pre]), len(b.encode()) / 1024))
    nlazy = sum(len(v) for v in lazy.values())

    print("english.html / 조각 %d개 %d줄 %.0fKB (주석 %.0fKB 를 뗐다)%s / "
          "늦게 읽는 것 %s 는 따로 나간다"
          % (len(names) - nlazy, body.count("\n"), kb, raw / 1024 - kb,
             "" if same else "  (내용이 바뀌었다)", " / ".join(late)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
