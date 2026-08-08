#!/usr/bin/env python3
"""파생물이 원본과 어긋나 있는지 본다.

이 저장소에는 파생물이 다섯 있다. 강의록 96편과 색인 한 장과 묶음 넷과 JSON 과 대본 묶음이다.
다 원본 마크다운에서 나온다. 강의를 고치고 다시 안 뽑으면 종이와 앱이 옛 강의를 들고 있다.

**그 어긋남은 파일을 봐서는 안 보인다.** 파생물만 보면 멀쩡하기 때문이다.
다시 뽑아 보고 내용이 바뀌는지를 봐야 나온다.

그래서 이 검사는 다시 뽑는다. 뽑기 전과 뒤의 내용을 견준다.
바뀐 파일이 있으면 그것이 어긋나 있던 것이고 실패로 낸다.
**실패로 내면서 고쳐 놓는다.** 다시 돌리면 통과다. 두 번째 실행이 진짜 판정이다.

사용법:
    python3 scripts/check_derived.py

종료 코드 0이면 파생물이 원본과 맞는 것이다.
규격: docs/roadmap.md 11.5
"""
import hashlib
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCRIPTS = ROOT / "scripts"

# 파생기와 그것이 쓰는 자리. 순서가 있다. 묶음은 강의록에서 나오므로 뒤에 온다.
DERIVERS = [
    ("derive_handout.py", ROOT / "out" / "handouts", "eng2p_handout_l*.md", set()),
    ("derive_index.py", ROOT / "out" / "handouts", "eng2p_handout_index.md", set()),
    ("derive_bundle.py", ROOT / "out" / "bundles", "*.md", set()),
    # 데이터 파생기는 자기 것만 본다. 대본은 다른 파생기가 만든다.
    # 이름 첫 글자로 거르면 tasks.js 까지 빠진다. 뺄 것을 이름으로 적는다.
    ("derive_data.py", ROOT / "out" / "data", "*.js*", {"transcripts.js", "audiolen.js", "cues.js", "ground.js"}),
    ("derive_transcripts.py", ROOT / "out" / "data", "transcripts.js", set()),
    ("derive_audiolen.py", ROOT / "out" / "data", "audiolen.js", set()),
    ("derive_cues.py", ROOT / "out" / "data", "cues.js", set()),
    ("ground.py", ROOT / "out" / "ground", "*.md", set()),
    ("derive_ground_data.py", ROOT / "out" / "data", "ground.js", set()),
]


def snapshot(d, pat, skip):
    return {f.name: hashlib.sha256(f.read_bytes()).hexdigest()
            for f in sorted(d.glob(pat)) if f.name not in skip} if d.exists() else {}


def main():
    changed = []
    for script, d, pat, skip in DERIVERS:
        before = snapshot(d, pat, skip)
        r = subprocess.run([sys.executable, str(SCRIPTS / script)],
                           capture_output=True, text=True)
        if r.returncode != 0:
            print("[실패] %s 가 종료 코드 %d 로 끝났다" % (script, r.returncode))
            print(r.stdout.strip()[-800:])
            return 1
        after = snapshot(d, pat, skip)
        for name in sorted(set(before) | set(after)):
            if before.get(name) != after.get(name):
                why = ("새로 생겼다" if name not in before else
                       "없어졌다" if name not in after else "내용이 달랐다")
                changed.append((script, name, why))

    for script, name, why in changed:
        print("[실패] %s: %s 로 다시 뽑으니 %s" % (name, script, why))
    print()
    print("파생기 %d개 / 어긋난 파일 %d개" % (len(DERIVERS), len(changed)))
    if changed:
        print("고쳐 놓았다. 한 번 더 돌려서 통과하는지 본다.")
    return 1 if changed else 0


if __name__ == "__main__":
    sys.exit(main())
