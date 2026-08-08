#!/usr/bin/env python3
"""기준서를 규격 검사에 건다. **고칠 수 없는 파일이라 다르게 본다.**

`docs/spec.md` 는 사용자만 고친다. 그래서 실패가 나와도 내가 못 없앤다.
그러면 두 갈래밖에 없다. 검사에서 빼거나 실패를 그냥 안고 가거나다.

**둘 다 나쁘다.** 빼면 새로 생긴 실패도 안 보인다.
안고 가면 실패 목록이 늘 빨갛고 그것을 보는 눈이 무뎌진다.

그래서 세 번째로 한다. **실패의 개수가 아니라 실패의 목록을 견준다.**

- 알고 있는 실패 그대로면 통과다
- 알고 있는 실패가 없어졌으면 사용자가 개정문을 붙인 것이다. 통과이고 알린다
- **모르는 실패가 나오면 그때 실패다.** 기준서가 새로 어긋난 것이다

알고 있는 실패마다 개정문 몇 번인지를 적어 둔다.
**그 번호가 개정문에 실제로 있는지도 본다.** 없으면 실패다.
못 고치는 것을 적어 두기만 하고 넘길 자리를 안 만들려고 그렇게 짰다.

쓰는 법:
    python3 scripts/check_spec.py

규격: docs/roadmap.md 11.11
"""
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SPEC = ROOT / "docs" / "spec.md"
AMEND = ROOT / "docs" / "spec_amendments.md"

# (실패 줄에서 찾을 조각, 개정문 번호, 왜 못 고치는가)
KNOWN = [
    ("쓰는 문자 범위 밖", 12, "블록 번호 넷이 동그라미 친 숫자다. 사용자 파일이라 못 고친다"),
    ("신뢰도 등급 표시가 없다", 13, "머리에 등급 줄이 없다. 사용자 파일이라 못 고친다"),
]


def main():
    if not SPEC.exists():
        print("[실패] %s 가 없다" % SPEC)
        return 1

    r = subprocess.run([sys.executable, str(ROOT / "scripts" / "check.py"), str(SPEC)],
                       capture_output=True, text=True, cwd=str(ROOT))
    lines = [x for x in r.stdout.split("\n") if x.startswith("[실패]")]

    amend = AMEND.read_text(encoding="utf-8") if AMEND.exists() else ""
    bad, gone = [], []
    for frag, num, why in KNOWN:
        hit = [x for x in lines if frag in x]
        if not hit:
            gone.append((frag, num))
            continue
        lines = [x for x in lines if frag not in x]
        # 개정문에 그 번호가 실제로 있어야 한다. 적어 두기만 하는 자리를 안 만든다.
        if not re.search(r"^## %d\. " % num, amend, re.M):
            bad.append("개정문 %d번이 없다: %s (%s)" % (num, frag, why))

    for x in lines:
        bad.append("기준서에 모르는 실패가 났다: %s" % x)

    for f, n in gone:
        print("[알림] 개정문 %d번이 붙은 것 같다. 실패가 없어졌다: %s" % (n, f))
        print("       KNOWN 에서 그 줄을 지운다. 안 지우면 다음에 이 알림이 또 난다")
    for b in bad:
        print("[실패] %s" % b)

    print()
    print("기준서 알고 있는 실패 %d개 / 없어진 것 %d개 / 새 실패와 빠진 개정문 %d개"
          % (len(KNOWN) - len(gone), len(gone), len(bad)))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
