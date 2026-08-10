#!/usr/bin/env python3
"""저장소 뿌리의 화면 검수를 `all.py` 안으로 들인다. **CI 와 같은 자를 쓴다.**

PR #9 (2026-08-09) 가 `tools/audit_pages.py` 와 `tools/noindex.py` 를 심고
CI 에 걸었다. 여섯 장 중 다섯 장이 걸렸고 `english.html` 도 그중 하나였다.

**그런데 `english.html` 은 파생물이다.** PR 은 그것을 손으로 고쳤다.
고친 것을 `app/` 조각으로 옮겨 놓지 않으면 다음 파생이 지운다.
지워도 이 저장소 안에서는 아무 소리도 안 나고, **밀고 나서 CI 가 빨간불이 된다.**
그때는 이미 Pages 에 올라가 있다.

그래서 같은 자를 여기서도 든다. 미는 것보다 먼저 잰다.

**뿌리 전체를 잰다. `english.html` 만 안 잰다.** CI 가 전체를 재기 때문이다.
내 것만 재면 내 것만 초록불이고 미는 순간 빨간불이 된다.

쓰는 법:
    python3 scripts/check_pages.py

규격: .github/workflows/tests.yml, tools/audit_pages.py, tools/noindex.py
"""
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
TOOLS = ROOT / "tools"

# CI 가 도는 차례 그대로다. **여기서 빼면 여기서만 초록불이다.**
JOBS = [("audit_pages.py", "대비와 글씨와 뼈대"),
        ("noindex.py", "검색에서 뺐나"),
        ("js_syntax.py", "화면 안 자바스크립트가 깨졌나"),
        ("input_labels.py", "입력칸에 이름이 붙었나"),
        ("font_block.py", "바깥 글꼴이 그리기를 막나")]

# **그 자들이 안 보는 자리.** `js_syntax.py` 는 `.html` 안의 `<script>` 만 본다.
# 이 저장소에는 홀로 선 `.js` 파생물이 있고 (T259 에 판 화면을 밖으로 뺐다)
# 그것은 그 자의 눈에 안 든다.
#
# T289 에 실제로 그 자리에 섰다. `app/play/onesee.js` 의 따옴표 하나가 어긋나
# 판 묶음이 통째로 안 읽혔는데 **파생과 규격 검사가 다 초록불이었다.**
# 브라우저 검사가 8초를 기다리다 터지는 것으로만 알았다.
LOOSE = ["eng2p/out/app/plays.js"]


def main():
    if not TOOLS.exists():
        print("[실패] %s 가 없다. CI 가 쓰는 자가 저장소에 없다" % TOOLS)
        return 1
    bad, said = 0, []
    for name, what in JOBS:
        f = TOOLS / name
        if not f.exists():
            print("[실패] tools/%s 가 없다 (%s)" % (name, what))
            bad += 1
            continue
        r = subprocess.run([sys.executable, str(f), "--check"],
                           capture_output=True, text=True, cwd=str(ROOT))
        lines = [x for x in r.stdout.strip().split("\n") if x.strip()]
        tail = lines[-1] if lines else "(출력 없음)"
        if r.returncode:
            bad += 1
            print("[실패] tools/%s (%s)" % (name, what))
            for x in lines[-12:]:
                print("   " + x)
        said.append("%s: %s" % (what, tail))
    # 홀로 선 파생 `.js` 는 `node --check` 로 직접 본다. node 가 없으면
    # **건너뛴다고 적는다.** 조용히 넘어가면 안 본 것이 통과처럼 보인다.
    seen = 0
    for rel in LOOSE:
        f = ROOT / rel
        if not f.exists():
            print("[실패] %s 가 없다. 파생을 먼저 돌린다" % rel)
            bad += 1
            continue
        try:
            r = subprocess.run(["node", "--check", str(f)],
                               capture_output=True, text=True, cwd=str(ROOT))
        except OSError:
            said.append("홀로 선 자바스크립트: node 가 없어 건너뛴다. 통과가 아니다")
            break
        if r.returncode:
            bad += 1
            print("[실패] %s 의 문법이 깨졌다" % rel)
            for x in (r.stderr or "").strip().split("\n")[:6]:
                print("   " + x)
        seen += 1
    else:
        said.append("홀로 선 자바스크립트 %d개: 깨진 것 %s"
                    % (seen, "0개" if not bad else "있다"))

    for s in said:
        print("  " + s)
    print("뿌리 화면 검수 %d갈래 + 홀로 선 %d개 / 실패 %d"
          % (len(JOBS), len(LOOSE), bad))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
