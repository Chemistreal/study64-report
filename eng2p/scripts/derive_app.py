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

**원본은 조각이고 `english.html` 은 파생물이다.** 손으로 고치지 않는다.
고치면 `check_derived.py` 가 다음 턴에 되돌린다.

쓰는 법:
    python3 scripts/derive_app.py

결과: english.html (저장소 뿌리)
규격: docs/roadmap.md 12.10
"""
import hashlib
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
APP = ROOT / "app"
OUT = ROOT.parent / "english.html"


def order():
    """합치는 차례. 이 파일이 곧 앱의 차례다."""
    rows = []
    for line in (APP / "order.txt").read_text(encoding="utf-8").split("\n"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        rows.append(line)
    return rows


def main():
    if not APP.exists():
        print("[실패] %s 가 없다" % APP)
        return 1
    names = order()
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

    parts = []
    for n in names:
        t = (APP / n).read_text(encoding="utf-8")
        # 조각마다 끝 줄바꿈을 하나 붙여 뒀다. 이을 때 그 하나를 뗀다.
        if t.endswith("\n"):
            t = t[:-1]
        parts.append(t)
    body = "\n".join(parts) + "\n"

    old = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
    OUT.write_text(body, encoding="utf-8")
    same = hashlib.sha256(old.encode()).hexdigest() == hashlib.sha256(body.encode()).hexdigest()
    print("english.html / 조각 %d개 %d줄 %.0fKB%s"
          % (len(names), body.count("\n"), len(body.encode()) / 1024,
             "" if same else "  (내용이 바뀌었다)"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
