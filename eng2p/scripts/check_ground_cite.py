#!/usr/bin/env python3
"""근거 인용이 실제로 그 자리를 가리키는지 본다.

`ground.py` 가 `lle1-03:23` 같은 인용을 3천 개쯤 냈다.
그것이 카드 화면에 뜨고 누르면 그 자리로 간다.
**그런데 그 인용이 맞는지는 아무도 안 봤다.**

인용이 한 칸씩 밀려 있어도 화면은 멀쩡하다. 줄 번호가 그럴듯하게 나오고
눌렀을 때 소리도 난다. **엉뚱한 소리가 날 뿐이다.**
두 사람은 영어 제로라 그것을 못 가린다.

여기서 잰다. 인용마다 **그 과 그 줄을 열어 그 글이 실제로 있는지** 본다.
줄 번호 세는 법이 `ground.py` 와 다르면 여기서 어긋난다.
그것이 이 검사의 값이다. **두 자리가 따로 세면 언젠가 갈라진다.**

제목 인용(`lle1-10 제목`)은 카탈로그에서 본다. 대본 줄이 아니다.

쓰는 법:
    python3 scripts/check_ground_cite.py

종료 코드 0이면 인용이 다 맞는 것이다.
규격: docs/roadmap.md 11.10
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
REPO = ROOT.parent
TR = REPO / "media" / "english" / "transcripts"
CAT = REPO / "media" / "english" / "catalog.json"
GROUND = ROOT / "out" / "ground"
DATA = ROOT / "out" / "data" / "ground.js"
ROW = re.compile(r"^\| (.+?) \| (.+?) \| (.+?) \|$", re.M)
SPEAKER = re.compile(r"^[A-Z][A-Za-z .'-]{0,20}:\s*")
CITE = re.compile(r"^(lle1-\d+):(\d+)$")
TITLE = re.compile(r"^(lle1-\d+) 제목$")


def norm(s):
    s = SPEAKER.sub("", s)
    return " " + " ".join(re.sub(r"[^A-Za-z0-9]+", " ", s).lower().split()) + " "


def lines_of():
    """{과: [고른꼴]}. 줄 번호는 1부터다. **ground.py 와 같은 규칙이어야 한다.**"""
    out = {}
    for f in sorted(TR.glob("lle1-*.md")):
        t = f.read_text(encoding="utf-8")
        i = t.find("## 대본")
        rows = []
        for line in (t[i:] if i >= 0 else t).split("\n"):
            s = line.strip()
            if not s or s.startswith("#") or s.startswith("|"):
                continue
            rows.append(norm(s))
        out[f.stem] = rows
    return out


def titles_of():
    if not CAT.exists():
        return {}
    d = json.loads(CAT.read_text(encoding="utf-8"))
    items = d if isinstance(d, list) else d.get("items", d.get("media", []))
    return {x["id"]: norm(x.get("title", "")) for x in items if x.get("id")}


def main():
    tr = lines_of()
    ti = titles_of()
    if len(tr) != 52:
        print("[실패] 대본이 %d편이다" % len(tr))
        return 1

    fails, n, ntitle = [], 0, 0
    files = sorted(p for p in GROUND.glob("eng2p_ground_*.md")
                   if p.name != "eng2p_ground_index.md")
    for f in files:
        for tag, text, ev in ROW.findall(f.read_text(encoding="utf-8")):
            if tag == "자리" or "근거 없음" in ev:
                continue
            needle = norm(text).strip()
            for c in ev.replace("**", "").split(" / "):
                c = c.split(" 외 ")[0].strip()
                m = CITE.match(c)
                if m:
                    n += 1
                    mid, k = m.group(1), int(m.group(2))
                    rows = tr.get(mid)
                    if rows is None:
                        fails.append("%s: %s 라는 과가 없다" % (f.name, mid))
                    elif not (1 <= k <= len(rows)):
                        fails.append("%s: %s 에 %d번째 줄이 없다 (%d줄)"
                                     % (f.name, mid, k, len(rows)))
                    elif (" " + needle + " ") not in rows[k - 1]:
                        fails.append("%s: %s 가 %s 에 없다" % (f.name, text[:34], c))
                    continue
                m = TITLE.match(c)
                if m:
                    ntitle += 1
                    if (" " + needle + " ") not in ti.get(m.group(1), ""):
                        fails.append("%s: %s 가 %s 에 없다" % (f.name, text[:34], c))
                    continue
                fails.append("%s: 인용 꼴이 아니다: %r" % (f.name, c))

    # 앱이 읽는 판도 같은 인용을 들고 있어야 한다.
    ndata = 0
    if DATA.exists():
        d = json.loads(DATA.read_text(encoding="utf-8").split("=", 1)[1].rstrip().rstrip(";"))
        for key, rows in (d.get("items") or {}).items():
            for r in rows:
                needle = norm(r.get("t", "")).strip()
                for c in r.get("at", []):
                    ndata += 1
                    m = CITE.match(c)
                    if not m:
                        if not TITLE.match(c):
                            fails.append("ground.js %s: 인용 꼴이 아니다: %r" % (key, c))
                        continue
                    mid, k = m.group(1), int(m.group(2))
                    rows2 = tr.get(mid)
                    if not rows2 or not (1 <= k <= len(rows2)):
                        fails.append("ground.js %s: %s 가 자리를 벗어났다" % (key, c))
                    elif (" " + needle + " ") not in rows2[k - 1]:
                        fails.append("ground.js %s: %s 가 %s 에 없다" % (key, r["t"][:30], c))

    for m in fails[:20]:
        print("[실패] " + m)
    if len(fails) > 20:
        print("[실패] 외 %d건" % (len(fails) - 20))
    print()
    print("보고서 인용 %d개 (제목 %d개) / 앱 인용 %d개 / 실패 %d"
          % (n, ntitle, ndata, len(fails)))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
