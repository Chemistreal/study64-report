#!/usr/bin/env python3
"""파생과 검사를 정해진 순서로 다 돌린다. 세션 종료 절차다.

검사가 열한 개가 됐다. 순서도 있다. 그것을 기억으로 돌리면 언젠가 하나를 뺀다.
**뺀 검사는 안 돌린 것이 아니라 통과한 것처럼 보인다.** 그래서 한 자리에 모은다.

순서에는 이유가 있다.

1. 파생을 먼저 한다. 원본이 바뀌었으면 파생물이 옛 값이다. 옛 값을 검사해 봐야 소용없다
2. 파생물 어긋남을 본다. 1에서 뭔가 바뀌었으면 커밋 전에 알아야 한다
3. 규격 검사를 돈다. 파일 하나씩 보는 것들이다
4. 대조 검사를 돈다. 파일끼리 견주는 것들이다
5. 상태 파일을 갱신한다. 검사가 다 끝난 뒤의 값이어야 맞다

사용법:
    python3 scripts/all.py           # 다 돌린다
    python3 scripts/all.py --quick   # 파생과 대조만. 손볼 때 쓴다

하나라도 실패하면 종료 코드 1이다. 통과한 것도 다 보여 준다.
규격: CLAUDE.md 세션 종료 절차
"""
import pathlib
import subprocess
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent
S = ROOT / "scripts"

# (묶음, 스크립트, 인자, 빠른 판에도 도는가)
STEPS = [
    ("파생", "derive_handout.py", [], True),
    ("파생", "derive_index.py", [], True),
    ("파생", "derive_bundle.py", [], True),
    ("파생", "derive_data.py", [], True),
    ("어긋남", "check_derived.py", [], True),
    ("규격", "check.py", ["out/"], False),
    ("규격", "check_blocks.py", [], False),
    ("규격", "check_page.py", [], False),
    ("규격", "check_media.py", [], False),
    ("규격", "check_cards_plan.py", ["q4"], False),
    ("대조", "check_refs.py", [], True),
    ("대조", "check_data.py", [], True),
    ("화면", "check_ui.js", [], False),
    ("상태", "collect_b.py", [], False),
    ("상태", "update_status.py", [], False),
]


def main():
    quick = "--quick" in sys.argv
    rows, failed = [], []
    t0 = time.time()
    for group, script, args, in_quick in STEPS:
        if quick and not in_quick:
            continue
        # 화면 검사만 node 로 돈다. 브라우저가 없으면 스스로 건너뛰고 0을 낸다.
        cmd = (["node", str(S / script)] if script.endswith(".js")
               else [sys.executable, str(S / script)]) + args
        r = subprocess.run(cmd, capture_output=True, text=True, cwd=str(ROOT))
        # 마지막 뜻있는 줄이 그 검사의 판정이다.
        lines = [x for x in r.stdout.strip().split("\n") if x.strip()]
        last = lines[-1] if lines else "(출력 없음)"
        # 건너뛴 것과 통과한 것을 가른다. 둘 다 종료 코드가 0이라 그것만으로는 안 갈린다.
        skipped = "[건너뜀]" in r.stdout
        rows.append((group, script, r.returncode, last, skipped))
        if r.returncode != 0:
            # 실패 줄만 보여 준다. 경고가 일흔아홉이라 그대로 쏟으면 실패가 묻힌다.
            bad = [x for x in lines if "[실패]" in x or "실패" in x and "0개" not in x]
            failed.append((script, "\n".join(bad[:40]) or r.stdout.strip()[-800:]))

    w = max(len(s) for _, s, _, _, _ in rows)
    cur = None
    for group, script, code, last, skipped in rows:
        if group != cur:
            print("\n[%s]" % group)
            cur = group
        mark = "건너뜀" if skipped else ("OK  " if code == 0 else "실패")
        print("  %s %-*s  %s" % (mark, w, script, last))

    if failed:
        print("\n" + "=" * 60)
        for script, out in failed:
            print("\n### %s 가 실패했다\n%s" % (script, out))

    nskip = sum(1 for r in rows if r[4])
    print("\n%.1f초 / %d개 중 실패 %d개%s%s"
          % (time.time() - t0, len(rows), len(failed),
             " / 건너뜀 %d개" % nskip if nskip else "",
             " (빠른 판)" if quick else ""))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
