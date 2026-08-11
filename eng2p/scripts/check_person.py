#!/usr/bin/env python3
"""저장소에서 사람별로 갈리는 칸이 넷뿐인가. T345

`docs/gap.md` 3장이 규격이다.

    names.a/.b       두 사람 이름
    days[d].aim.a/.b 블록 1과 4에 각자 적은 글
    days[d].xchk     블록 2 상호 검토에 각자 적은 글
    q[Qn].rel.a/.b   관계 점검에 각자 적은 답

**넷 다 글이다. 숫자가 하나도 없다.**
숫자가 사람별로 갈리면 그것은 견줄 수 있는 값이 되고 견주면 순위다.

## 어떻게 재나

**코드를 글자로 읽는다.** 저장소에 무엇이 들어가는지는 코드가 정한다.
`S.<무엇>` 에 `.a` 나 `.b` 를 붙여 쓰는 자리를 다 찾아서 넷 말고 있는지 본다.

T329 배지, T332 분기 탭, T341 판 셈에 이어 **네 번째로 코드를 읽는 검사**다.

사용법:
    python3 scripts/check_person.py

규격: docs/gap.md
"""
import io
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DOC = os.path.join(ROOT, "docs", "gap.md")
DIRS = [os.path.join(ROOT, "app", "js"),
        os.path.join(ROOT, "app", "late"),
        os.path.join(ROOT, "app", "play")]

# 사람별로 갈려도 되는 뿌리 넷. **문서 3장 표가 원본이다.**
OK_ROOT = {"names", "aim", "xchk", "rel"}

# 사람별 칸을 만드는 꼴. `S.무엇...a` 또는 `무엇.a` 로 쓰는 자리를 찾는다.
# 앞의 이름을 뿌리로 본다.
SPLIT = re.compile(r"([A-Za-z_$][A-Za-z0-9_$]*)\s*(?:\[[^\]]*\]\s*)*\.\s*([ab])\b")

# 사람이 아닌 `a`/`b`. **하나하나 왜인지를 적는다.**
#
# 이름만 보고는 사람인지 조각인지 모른다. 그러니 검사가 알 수 없다.
# 아는 사람이 적어 두는 수밖에 없고 **왜인지를 안 적으면 그 목록이 곧 구멍**이 된다.
# 여기 이름을 더할 때는 반드시 그 자리를 열어 보고 까닭을 적는다.
NOT_PERSON = {
    "CLIP": "클립 구간의 처음과 끝 시각이다. a 가 시작이고 b 가 끝이다",
    "it": "최소대립쌍의 두 낱말이고 둘이 한 문장의 앞뒤 토막이다",
}


def doc_roots():
    """문서 3장 표에서 갈려도 되는 칸을 읽는다. **문서가 원본이다.**"""
    s = io.open(DOC, encoding="utf-8").read()
    i = s.find("## 3. 저장소에서 사람별로 갈리는 칸은 넷뿐이다")
    j = s.find("### 3.1", i)
    out = set()
    for line in s[i:j].split("\n"):
        line = line.strip()
        if not line.startswith("|") or "---" in line:
            continue
        c = [x.strip() for x in line.strip("|").split("|")]
        if len(c) != 3 or c[0] == "칸":
            continue
        for m in re.finditer(r"`([^`]+)`", c[0]):
            g = m.group(1)
            g = re.sub(r"\[[^\]]*\]", "", g)
            parts = [x.strip() for x in g.replace("S.", "").split(".")]
            parts = [x for x in parts if x and x not in ("a", "b")]
            # **마지막 조각이 그 칸의 이름이다.** `days[d].aim.a` 의 뿌리는 aim 이다
            if parts:
                out.add(parts[-1])
    return out


def main():
    fails = []
    if not os.path.exists(DOC):
        print("[실패] docs/gap.md 가 없다")
        return 1

    # **문서와 이 파일이 같은 넷을 드는가.** 다르면 하나가 낡은 것이다
    doc = doc_roots()
    if doc != OK_ROOT:
        fails.append("문서 3장 표와 검사가 다른 칸을 든다: 문서 %s / 검사 %s"
                     % (" ".join(sorted(doc)), " ".join(sorted(OK_ROOT))))

    seen, files = {}, 0
    for d in DIRS:
        for f in sorted(os.listdir(d)):
            if not f.endswith(".js"):
                continue
            files += 1
            s = io.open(os.path.join(d, f), encoding="utf-8").read()
            # 주석은 뺀다. 무엇을 안 하는지를 주석이 적는다
            s = re.sub(r"/\*.*?\*/", "", s, flags=re.S)
            s = re.sub(r"(?m)^\s*//.*$", "", s)
            for m in SPLIT.finditer(s):
                root = m.group(1)
                if root in NOT_PERSON or root in OK_ROOT:
                    continue
                # 한 글자 이름은 도는 변수라 뿌리를 모른다. 위에서 걸렀다
                if len(root) <= 1:
                    continue
                seen.setdefault(root, []).append(
                    os.path.basename(d) + "/" + f)

    for root in sorted(seen):
        where = sorted(set(seen[root]))[:2]
        fails.append("사람별로 갈리는 칸이 넷 말고 또 있다: %s (%s)"
                     % (root, " ".join(where)))

    for m in fails:
        print("[실패] " + m)
    print("")
    print("**기계가 안 보는 것: 서로에게 잴 때 봐주는가**")
    print("사람별 칸 %d판 (조각 %d개 x 1, 문서 대조 1) / 실패 %d"
          % (files + 1, files, len(fails)))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
