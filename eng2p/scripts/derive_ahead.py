#!/usr/bin/env python3
"""기준서 12장이 예고한 세 자리를 앱이 읽는 꼴로 뽑는다. T335

**기준서 12장 표가 원본이다.** 손으로 옮겨 적지 않는다.
`app/js/01_const.js` 의 `FAILPT` 도 그 표를 옮긴 것이라 둘을 견준다.
어긋나면 파생이 실패한다.

## 재는 것 둘

    주 범위를 읽는다        "20주 전후" 는 숫자가 아니다. ahead.md 7장이 읽는 법
    대응이 정말 거기 있나   기준서가 적은 것과 강의 차림표가 같은 말을 하는가

둘째가 이 파일의 일이다. 기준서가 "Q1 화용 2편과 repair 3편을 이 구간에 배치"
라고 적었으므로 `out/data/index.json` 에서 10~12주 강의 트랙을 다시 센다.
**적어 놓은 것과 도는 것이 다를 수 있다** (T312, T320, T330).

쓰는 법:
    python3 scripts/derive_ahead.py

결과: out/data/ahead.json 과 ahead.js
규격: docs/ahead.md
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "out", "data")
SPEC = os.path.join(ROOT, "docs", "spec.md")
DOC = os.path.join(ROOT, "docs", "ahead.md")
CONST = os.path.join(ROOT, "app", "js", "01_const.js")

# 미리 알리는 주 수와 지나갔다고 말하는 주 수. **문서 6장이 정한 값이다**
LEAD = 2
AFTER = 1

# 앱에서 무엇을 가리키나. 문서 4장 표가 원본이고 키는 시점 글자다.
# **가리킬 데가 없는 것도 한 갈래다** (10~14주). 그것을 빈칸으로 안 둔다.
WHERE = {
    # `%s` 에 기준서에서 센 것이 들어간다. **편 수를 여기 안 적는다**
    "10~14주": {"tab": "", "act": "%s이 여기 이미 들어 있다. 따로 할 일이 없다"},
    "20주 전후": {"tab": "quarter", "act": "분기 탭에서 관계 점검을 지금 적는다"},
    "24~28주": {"tab": "ledger", "act": "고치지 말고 대장 탭 5단계에 적는다. 12개월차에 연다"},
}


def weeks_of(label):
    """시점 글자를 주 범위로. **읽는 법이 문서 7장에 있다.**"""
    m = re.match(r"^(\d+)~(\d+)주$", label)
    if m:
        return int(m.group(1)), int(m.group(2))
    m = re.match(r"^(\d+)주 전후$", label)
    if m:
        n = int(m.group(1))
        return n - 1, n + 1
    return None


def spec_rows():
    """기준서 12장 표. **이것이 원본이다.**"""
    s = io.open(SPEC, encoding="utf-8").read()
    i = s.find("## 12. 예상 실패 지점")
    if i < 0:
        return [], ["기준서에서 12장을 못 찾았다"]
    j = s.find("\n## ", i + 5)
    out = []
    for line in s[i:j if j > 0 else len(s)].split("\n"):
        line = line.strip()
        if not line.startswith("|") or "---" in line:
            continue
        c = [x.strip() for x in line.strip("|").split("|")]
        if len(c) != 4 or c[0] == "시점":
            continue
        out.append(c)
    if len(out) != 3:
        return [], ["기준서 12장 표가 3줄이 아니라 %d줄이다" % len(out)]
    return out, []


def const_rows():
    """앱 상수 `FAILPT`. 기준서를 옮긴 것이라 견줄 대상이다."""
    s = io.open(CONST, encoding="utf-8").read()
    i = s.find("var FAILPT=[")
    if i < 0:
        return [], ["01_const.js 에서 FAILPT 를 못 찾았다"]
    j = s.find("];", i)
    out = []
    for line in s[i:j].split("\n"):
        line = line.strip()
        if not line.startswith('["'):
            continue
        out.append(json.loads(line.rstrip(",")))
    return out, []


def q1_tracks(lo, hi):
    """그 구간 Q1 강의의 트랙을 차림표에서 다시 센다.

    Q1 이 12주까지라 13~14주 강의는 아직 없다. 기준서가 **Q1** 화용 2편이라고
    못박았으므로 Q1 안에서 센다 (문서 5장). 센 자리도 같이 돌려준다."""
    f = os.path.join(OUT, "index.json")
    if not os.path.exists(f):
        return None, None, ["out/data/index.json 이 없다"]
    d = json.load(io.open(f, encoding="utf-8"))
    cnt, saw = {}, []
    for w in d.get("weeks", []):
        if not (lo <= w.get("week", 0) <= hi) or w.get("quarter") != "Q1":
            continue
        for lec in w.get("lectures", []):
            t = lec.get("track", "")
            cnt[t] = cnt.get(t, 0) + 1
            saw.append({"week": w["week"], "no": lec.get("no"), "track": t})
    return cnt, saw, []


def need_from_spec(fix):
    """기준서 대응 칸에서 "화용 2편과 repair 3편" 을 읽는다.

    **숫자를 여기 안 적는다.** 기준서 글자에서 뽑는다. 기준서가 바뀌면 같이 바뀐다.
    적힌 차례를 지킨다. 화면에 그 차례로 나간다."""
    out = []
    for m in re.finditer(r"([가-힣A-Za-z]+)\s*(\d+)편", fix):
        out.append((m.group(1), int(m.group(2))))
    return out


def main():
    bad = []
    if not os.path.exists(DOC):
        bad.append("docs/ahead.md 가 없다")
    rows, e = spec_rows()
    bad += e
    cons, e = const_rows()
    bad += e
    if bad:
        for b in bad:
            print("[실패] " + b)
        return 1

    # 기준서와 앱 상수가 같은 말을 하는가. 시점과 현상만 본다.
    # 대응 칸은 앱 쪽이 짧게 줄여 적혀 있고 그것은 화면 폭 때문이라 봐준다.
    if len(cons) != len(rows):
        print("[실패] FAILPT 가 %d줄인데 기준서 12장은 %d줄이다" % (len(cons), len(rows)))
        return 1
    for a, b in zip(rows, cons):
        if a[0] != b[0] or a[1] != b[1]:
            print("[실패] 기준서와 FAILPT 가 다르다: %s %s / %s %s"
                  % (a[0], a[1], b[0], b[1]))
            return 1

    items, checked = [], None
    for c in rows:
        rng = weeks_of(c[0])
        if not rng:
            print("[실패] 시점 '%s' 를 주 범위로 못 읽었다. ahead.md 7장을 본다" % c[0])
            return 1
        lo, hi = rng
        w = WHERE.get(c[0])
        if not w:
            print("[실패] 시점 '%s' 가 앱 어디를 가리키는지가 안 적혀 있다" % c[0])
            return 1
        items.append({"label": c[0], "from": lo, "to": hi, "what": c[1],
                      "why": c[2], "fix": c[3], "tab": w["tab"], "act": w["act"]})

    # **대응이 정말 거기 있는가.** 첫 줄만 셀 수 있는 대응이다
    first = items[0]
    need = need_from_spec(first["fix"])
    if not need:
        print("[실패] 기준서 첫 줄 대응에서 '무엇 몇 편' 을 못 읽었다: " + first["fix"])
        return 1
    cnt, saw, e = q1_tracks(first["from"], first["to"])
    if e:
        for b in e:
            print("[실패] " + b)
        return 1
    miss = ["%s %d편 (센 것 %d편)" % (k, v, cnt.get(k, 0))
            for k, v in need if cnt.get(k, 0) != v]
    if miss:
        print("[실패] 기준서가 적은 대응이 그 구간에 없다: " + " / ".join(miss))
        print("       기준서 12장: " + first["fix"])
        print("       센 자리: " + json.dumps(saw, ensure_ascii=False))
        return 1
    said = "과 ".join("%s %d편" % (k, v) for k, v in need)
    items[0]["act"] = items[0]["act"] % said
    checked = {"need": dict(need), "saw": saw,
               "note": "기준서 12장이 적은 대응을 index.json 에서 다시 셌다"}

    obj = {
        "note": "기준서 12장이 예고한 세 자리. 기준서가 원본이라 손으로 안 고친다. "
                "scripts/derive_ahead.py 를 다시 돌린다.",
        "grade": "A",
        "generator": "scripts/derive_ahead.py",
        "source": "docs/spec.md 12장, docs/ahead.md, out/data/index.json",
        "lead": LEAD, "after": AFTER,
        "items": items,
        "checked": checked,
        # **묻지 않는다.** 화면이 증상을 안 묻는다 (문서 3장)
        "asks": False,
        "asksWhy": "지루하냐고 물으면 없던 것도 생긴다. 증상을 안 적고 "
                   "설계와 대응을 적는다. 증상은 매뉴얼 8장에 있다.",
    }
    io.open(os.path.join(OUT, "ahead.json"), "w", encoding="utf-8").write(
        json.dumps(obj, ensure_ascii=False, indent=2) + "\n")
    io.open(os.path.join(OUT, "ahead.js"), "w", encoding="utf-8").write(
        "window.ENG2P_AHEAD=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")

    print("out/data/ahead.json / 자리 %d곳 (%s) / 미리 %d주 지나고 %d주 / "
          "대응 다시 셈 %s / **기준서 12장이 원본이다**"
          % (len(items), " ".join(x["label"] for x in items), LEAD, AFTER,
             " ".join("%s%d" % (k, v) for k, v in need)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
