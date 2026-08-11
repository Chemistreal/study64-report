#!/usr/bin/env python3
"""소리를 다루는 자리를 다 세었는가 (T375).

`docs/sound.md` 가 원본이다. 표에 없는 소리 자리가 앱에 생기면 실패한다.

    python3 eng2p/scripts/check_sound.py

**앱이 소리를 안 든다** 는 말을 턴마다 그 자리에 적었다. 클립 탭에 적고
분기 탭에 적고 나란히 듣기에 적었다. 그런데 적은 자리를 세어 본 적이 없다.
자리가 하나 더 늘면 아무도 그것을 안 본다. `check_late.js` 와 같은 결이다.
"""
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent.parent
ROOT = HERE.parent

# ---- 소리 자리 열. `docs/sound.md` 3장이 같은 표다 --------------------------
# 갈래 셋. 낸다(play) / 담는다(rec) / 읽는다(read)
SPOTS = [
    ("js/07b_tone.js", "make", "신호음 여섯"),
    ("js/07_block14.js", "play", "블록 1과 4의 대본 소리"),
    ("js/08_script.js", "play", "세션 대본 소리"),
    ("js/19_library.js", "play", "자료실 재생"),
    ("play/ladder.js", "play", "배속 사다리"),
    ("play/relay.js", "play", "전달 놀이"),
    ("late/13_quarter.js", "rec", "되돌아보기 녹음"),
    ("late/18_clip.js", "read", "클립 재생과 파형"),
    ("late/24_script.js", "play", "대본 동기"),
    ("late/25_clips.js", "play", "저장한 구간"),
]

# 소리를 다룬다는 표시. 하나라도 있으면 소리 자리다
SIGNS = {
    "rec": r"getUserMedia|MediaRecorder",
    "read": r"decodeAudioData",
    "make": r"createOscillator",
    "play": r"\.play\(\)|createElement\(\"audio\"\)|new Audio\(",
}

# 한 곳뿐이어야 하는 일 넷. **읽는 자리가 둘이 되는 것이 제일 위험하다**
ONLY = [
    ("decodeAudioData", "late/18_clip.js", "소리를 읽는다"),
    ("getUserMedia", "late/13_quarter.js", "마이크를 연다"),
    ("MediaRecorder", "late/13_quarter.js", "녹음기를 만든다"),
    ("createOscillator", "js/07b_tone.js", "소리를 지어낸다"),
]

# 저장소 밑그림에 있으면 안 되는 낱말. 소리에서 나온 값이다
NO_STORE = ["peaks", "wave", "blob", "base64", "audio", "amp", "seg"]

# 소리를 들어야 잴 수 있는 것처럼 보이는 통과 칸 다섯 (sound.md 6장)
SOUND_PASS = ["red", "str", "non", "rct", "spk"]

SOUND_EXT = (".mp3", ".m4a", ".wav", ".webm", ".ogg", ".aac", ".flac", ".mp4")

fails = []


def no(m):
    fails.append(m)


def read(p):
    try:
        return p.read_text(encoding="utf-8")
    except OSError:
        return ""


# ---- 1. 소리 자리를 다 세었는가 ---------------------------------------------
# **표시가 있는데 표에 없으면 그 자리는 아무도 안 본다**
named = {s[0] for s in SPOTS}
found = {}
for d in ("js", "play", "body", "late"):
    for f in sorted((HERE / "app" / d).glob("*")):
        if not f.is_file():
            continue
        src = read(f)
        kinds = [k for k, rx in SIGNS.items() if re.search(rx, src)]
        if kinds:
            found[d + "/" + f.name] = kinds

for name in sorted(found):
    if name not in named:
        no("조각 app/%s 가 소리를 다루는데 표에 없다. sound.md 3장에 줄을 넣는다" % name)
for name, kind, what in SPOTS:
    if name not in found:
        no("%s: 표에 있는 app/%s 가 소리를 안 다룬다. 줄을 빼야 한다" % (what, name))
        continue
    # 갈래가 맞는가. 읽는 자리는 재생도 하므로 read 는 play 를 겸한다
    got = found[name]
    if kind not in got:
        no("%s: app/%s 의 갈래가 %s 인데 표시는 %s 다" % (what, name, kind, " ".join(got)))

# ---- 2. 홑자리 넷 -----------------------------------------------------------
for sign, where, what in ONLY:
    hit = sorted(n for n, _ in found.items() if sign in read(HERE / "app" / n))
    if hit != [where]:
        no("%s: %s 가 %s 에 있다. %s 하나뿐이어야 한다"
           % (what, sign, " ".join(hit) or "아무 데도 없다", where))

# ---- 3. 소리에서 나온 값을 저장소에 안 남기는가 -----------------------------
store = read(HERE / "app" / "js" / "02_store.js")
m = re.search(r"function blank\(\)\{(.*?)\n\}", store, re.S)
if not m:
    no("저장소 밑그림(blank)을 못 찾았다")
else:
    body = m.group(1)
    # 주석은 뺀다. 주석에는 안 남긴다는 말이 적혀 있다
    body = re.sub(r"/\*.*?\*/", "", body, flags=re.S)
    for w in NO_STORE:
        if re.search(r"\b" + w, body, re.I):
            no("저장소 밑그림에 소리 값 %s 가 있다. 소리는 그 자리에서만 산다" % w)

# ---- 4. 소리로 통과를 채우지 않는가 -----------------------------------------
led = read(HERE / "app" / "js" / "11_ledger.js")
m = re.search(r"var PASS_AUTO=\{(.*?)\};", led, re.S)
if not m:
    no("PASS_AUTO 를 못 찾았다")
else:
    auto = set(re.findall(r"(\w+)\s*:", m.group(1)))
    for k in SOUND_PASS:
        if k in auto:
            no("통과 칸 %s 를 앱이 저절로 채운다. 소리로 재는 칸이다" % k)
    if auto != {"hrs"}:
        no("앱이 저절로 채우는 칸이 %s 다. 누적 시간 하나뿐이어야 한다"
           % " ".join(sorted(auto)))

# **재는 자리가 생긴 칸에는 못 잰다는 말이 있어야 한다** (T370)
qt = read(HERE / "app" / "late" / "13_quarter.js")
m = re.search(r"var BEAT_NOT_PASS=\{(.*?)\n\};", qt, re.S)
if not m:
    no("BEAT_NOT_PASS 를 못 찾았다. 못 잰다는 말이 분기 탭에 없다")
else:
    say = m.group(1)
    if "str" not in say:
        no("강세 박자 칸에 못 잰다는 말이 없다. 클립 탭이 그 숫자를 낸다")
    if "판정은 상대가" not in say:
        no("판정을 누가 하는지가 안 적혀 있다")

# ---- 5. 저장소에 든 소리 ----------------------------------------------------
cat = ROOT / "media" / "english" / "catalog.json"
if not cat.exists():
    no("미디어 카탈로그가 없다")
else:
    # 카탈로그가 `audio` 로 가리킨다. **원본 주소는 저장소 밖이라 안 센다**
    listed = {pathlib.Path(x).name for x in
              re.findall(r'"audio"\s*:\s*"([^"]+)"', read(cat))}
    if len(listed) != 52:
        no("카탈로그가 가리키는 소리가 %d개다. 52개여야 한다" % len(listed))
    stray = []
    for f in ROOT.rglob("*"):
        if not f.is_file() or f.suffix.lower() not in SOUND_EXT:
            continue
        if ".git" in f.parts:
            continue
        if f.name not in listed:
            stray.append(str(f.relative_to(ROOT)))
    if stray:
        no("카탈로그 밖의 소리 파일 %d개: %s" % (len(stray), " ".join(stray[:3])))
    # **두 사람의 녹음은 이름꼴로 잡는다**
    mine = [str(f.relative_to(ROOT)) for f in ROOT.rglob("eng2p_voice_*")
            if f.is_file()]
    if mine:
        no("두 사람의 녹음이 저장소에 있다: " + " ".join(mine[:3]))

# ---- 6. 문서가 실제와 같은 말을 하는가 --------------------------------------
doc = read(HERE / "docs" / "sound.md")
if not doc:
    no("docs/sound.md 가 없다")
else:
    for name, _, what in SPOTS:
        if "`" + name + "`" not in doc:
            no("sound.md 3장에 %s (%s) 가 없다" % (name, what))
    for sign, _, what in ONLY:
        if sign not in doc:
            no("sound.md 4장에 %s (%s) 가 없다" % (sign, what))
    for k in SOUND_PASS:
        if "`" + k + "`" not in doc:
            no("sound.md 6장에 통과 칸 %s 가 없다" % k)
    for w in ["C-gen", "C-real"]:
        if w not in doc:
            no("sound.md 8장에 %s 가 없다" % w)

# **C-gen 으로 통과 판정 금지가 제작 지침에 있는가**
cl = read(HERE / "CLAUDE.md")
if "C-gen 음성으로 Q1 소리 트랙 통과 판정하기" not in cl:
    no("C-gen 으로 통과 판정 금지가 CLAUDE.md 하지 말 것에 없다")

# 판을 센다. **재는 자리마다 하나씩이지 어림이 아니다**
n_spot = len(SPOTS) * 2                      # 표에 있나 / 갈래가 맞나
n_only = len(ONLY)
n_store = 1 + len(NO_STORE)                  # 밑그림을 찾았나 + 낱말마다
n_pass = 1 + len(SOUND_PASS) + 1 + 3         # PASS_AUTO 와 못 잰다는 말
n_file = 4                                   # 카탈로그 / 52개 / 밖 / 두 사람 것
n_doc = 1 + len(SPOTS) + len(ONLY) + len(SOUND_PASS) + 2 + 1
n = n_spot + n_only + n_store + n_pass + n_file + n_doc
for m2 in fails:
    print("[실패] " + m2)
print("")
print("**기계가 안 보는 것: 두 사람이 그 숫자를 판정으로 여겼는가**")
print("소리 자리 %d판 (자리 %d곳 x 2, 홑자리 %d, 저장소 %d, 통과 칸 %d, "
      "저장소 파일 %d, 문서 %d) / 실패 %d"
      % (n, len(SPOTS), n_only, n_store, n_pass, n_file, n_doc, len(fails)))
sys.exit(1 if fails else 0)
