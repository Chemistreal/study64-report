#!/usr/bin/env python3
"""mp3 52개의 진짜 길이를 파일에서 재서 낸다.

**길이가 세 군데 적혀 있다.** 카탈로그와 대본 머리말과 mp3 자체다.
앞의 둘은 사람이 적은 것이고 마지막 하나만 사실이다.

F구간이 대본 동기를 만든다. 어림이든 실측이든 **전체 길이 위에 얹는다.**
그 전체 길이가 틀리면 표가 통째로 어긋난다. 그래서 사실 쪽을 재 둔다.

이 상자에는 ffprobe 도 mutagen 도 없다. mp3 프레임을 직접 센다.
프레임 머리 4바이트에 판과 비트율과 표본율이 들어 있고
프레임 하나가 내는 시간은 표본수 / 표본율이다. 그것을 다 더한다.
CBR 이든 VBR 이든 같은 방법으로 맞는다.

쓰는 법:
    python3 scripts/derive_audiolen.py

종료 코드 0이면 52개를 다 잰 것이다.
규격: docs/roadmap.md 11.9
"""
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
REPO = ROOT.parent
SRC = REPO / "media" / "english" / "audio"
OUT = ROOT / "out" / "data" / "audiolen.js"

# Layer III 비트율 표. 위가 MPEG1, 아래가 MPEG2 와 MPEG2.5 다. 단위는 kbps.
BITRATE = {
    1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
    2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
}
SAMPLERATE = {3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000]}


def duration(path):
    """프레임을 다 훑어 초를 낸다. 못 읽으면 None 을 낸다."""
    b = path.read_bytes()
    i = 0
    if b[:3] == b"ID3":
        # ID3v2 크기는 7비트씩 네 바이트다. 여덟째 비트는 안 쓴다.
        i = 10 + ((b[6] & 0x7F) << 21 | (b[7] & 0x7F) << 14 |
                  (b[8] & 0x7F) << 7 | (b[9] & 0x7F))
    total, frames, n = 0.0, 0, len(b)
    while i + 4 <= n:
        if b[i] != 0xFF or (b[i + 1] & 0xE0) != 0xE0:
            i += 1
            continue
        ver = (b[i + 1] >> 3) & 3      # 3 = MPEG1, 2 = MPEG2, 0 = MPEG2.5, 1 = 없는 값
        layer = (b[i + 1] >> 1) & 3    # 1 = Layer III
        if ver == 1 or layer != 1:
            i += 1
            continue
        bri = (b[i + 2] >> 4) & 0xF
        sri = (b[i + 2] >> 2) & 3
        pad = (b[i + 2] >> 1) & 1
        if bri in (0, 15) or sri == 3:
            i += 1
            continue
        br = BITRATE[1 if ver == 3 else 2][bri] * 1000
        sr = SAMPLERATE[ver][sri]
        spf = 1152 if ver == 3 else 576          # 프레임 하나가 담는 표본 수
        flen = int(spf / 8 * br / sr) + pad
        if flen <= 4:
            i += 1
            continue
        total += spf / sr
        frames += 1
        i += flen
    return (round(total, 2), frames) if frames else (None, 0)


def main():
    if not SRC.exists():
        print("[실패] 소리 자리가 없다: %s" % SRC)
        return 1
    items, bad = {}, []
    for f in sorted(SRC.glob("*.mp3")):
        sec, frames = duration(f)
        if sec is None:
            bad.append(f.name)
            continue
        items[f.stem] = sec
    if bad:
        print("[실패] 프레임을 못 읽은 파일: %s" % " ".join(bad))
        return 1
    if len(items) != 52:
        print("[실패] %d개를 쟀다. 52개여야 한다" % len(items))
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    body = {
        "note": "media/english/audio/*.mp3 를 프레임 단위로 재서 낸 것이다. "
                "손으로 고치지 않는다. scripts/derive_audiolen.py 를 다시 돌린다.",
        "generator": "scripts/derive_audiolen.py",
        "unit": "seconds",
        "count": len(items),
        "items": items,
    }
    OUT.write_text("window.ENG2P_AUDIOLEN=%s;\n"
                   % json.dumps(body, ensure_ascii=False, indent=2), encoding="utf-8")
    tot = sum(items.values())
    print("%s / 소리 %d개 %.1f분 (%.0fKB)"
          % (OUT.relative_to(ROOT), len(items), tot / 60, OUT.stat().st_size / 1024))
    return 0


if __name__ == "__main__":
    sys.exit(main())
