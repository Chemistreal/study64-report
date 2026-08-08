#!/usr/bin/env python3
"""강의와 강의록이 가리키는 것이 실제로 있는지 대조한다.

강의 96편이 1047번 서로를 가리킨다. 카드 번호와 미디어 id 도 가리키는 말이다.
가리키는 곳이 없거나 다른 것을 가리키면 세션에서 그 자리가 빈다.
그런데 그 빈 자리는 강의를 읽어서는 안 보인다. 대조해야 보인다.

네 가지를 본다.

1. 강의록의 카드 범위가 그 분기 카드에 실제로 있는가
2. 강의록의 미디어 id 가 카탈로그에 있고 분기가 맞는가
3. 뒤 강을 지난 일처럼 적지 않았는가. 앞 강을 앞일처럼 적지 않았는가
4. 블록 6이 바로 다음 강을 가리키는가

사용법:
    python3 scripts/check_refs.py

종료 코드 0이면 통과다.
규격: docs/roadmap.md 11.5
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
REPO = ROOT.parent
LEC = ROOT / "out" / "lectures"
HAND = ROOT / "out" / "handouts"
CARDS = ROOT / "out" / "cards"
CATALOG = REPO / "media" / "english" / "catalog.json"

LAST = 96
# 지난 일로 끝나는 말. 뒤 강을 이렇게 가리키면 두 사람이 안 배운 것을 배웠다고 여긴다.
PAST = (r"(했다|배웠다|봤다|보았다|정했다|다뤘다|썼다|나왔다|잡았다"
        r"|만들었다|적었다|셌다|끝냈다|올렸다|붙였다|열었다|골랐다)")
# 앞일로 끝나는 말. 앞 강을 이렇게 가리키는 것은 대개 차례를 훑는 문장이라
# 그것만으로는 결함이 아니다. 경고로만 낸다.
FUTURE = r"(할 것이다|배운다|다룬다|나온다|만든다|정한다|배울|다룰|나올)"

FAIL = []
WARN = []


def card_index():
    """분기별로 실제 있는 카드 번호를 모은다."""
    out = {}
    for f in CARDS.glob("*.md"):
        if "plan" in f.name:
            continue
        q = re.search(r"_q(\d)_", f.name)
        if not q:
            continue
        nums = re.findall(r"^\[(\d{3})\]\s+\S+형", f.read_text(encoding="utf-8"), re.M)
        out.setdefault(q.group(1), set()).update(nums)
    return out


def media_index():
    """카탈로그의 id 와 그 분기."""
    if not CATALOG.exists():
        WARN.append("카탈로그가 없다: %s" % CATALOG)
        return {}
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    items = next((v for v in data.values() if isinstance(v, list)), [])
    return {it["id"]: it["quarter"] for it in items if "id" in it}


def check_handouts(cards, media):
    # 색인은 강 하나에 붙는 종이가 아니라 96편을 훑는 표다. 여기서 안 본다.
    for f in sorted(HAND.glob("eng2p_handout_l*.md")):
        text = f.read_text(encoding="utf-8")
        q = re.search(r"^분기: Q(\d)", text, re.M)
        if not q:
            FAIL.append("%s: 분기 줄이 없다" % f.name)
            continue
        q = q.group(1)
        rng = re.search(r"카드 (\d{3}) ~ (\d{3})", text)
        if not rng:
            FAIL.append("%s: 카드 범위가 없다" % f.name)
        else:
            for i in range(int(rng.group(1)), int(rng.group(2)) + 1):
                if "%03d" % i not in cards.get(q, set()):
                    FAIL.append("%s: 카드 %03d 이 Q%s 에 없다" % (f.name, i, q))
        mid = re.search(r"^미디어 (\S+)$", text, re.M)
        if not mid:
            FAIL.append("%s: 미디어 줄이 없다" % f.name)
        elif media:
            mid = mid.group(1)
            if mid not in media:
                FAIL.append("%s: 카탈로그에 없는 미디어 %s" % (f.name, mid))
            elif media[mid] != int(q):
                FAIL.append("%s: %s 는 Q%d 자료인데 Q%s 가 쓴다"
                            % (f.name, mid, media[mid], q))


def check_tiling(cards):
    """분기마다 강의록 24편의 카드 범위가 150장을 빈틈없이 한 번씩 덮는가.

    한 장이 두 강에 붙으면 그 장은 두 번 돌고 다른 장이 밀린다.
    빠진 장은 한 해 동안 한 번도 안 돈다. 둘 다 표로 보기 전에는 안 보인다.
    색인을 뽑고 나서야 이 검사를 할 수 있게 됐다. T79 에서 붙였다.
    """
    for q in sorted(cards):
        seen = {}
        for f in sorted(HAND.glob("eng2p_handout_l*.md")):
            text = f.read_text(encoding="utf-8")
            if not re.search(r"^분기: Q%s" % q, text, re.M):
                continue
            rng = re.search(r"카드 (\d{3}) ~ (\d{3})", text)
            if not rng:
                continue
            for i in range(int(rng.group(1)), int(rng.group(2)) + 1):
                if i in seen:
                    FAIL.append("Q%s 카드 %03d 이 %s 와 %s 에 겹친다"
                                % (q, i, seen[i], f.name))
                seen[i] = f.name
        gaps = [i for i in range(1, 151) if i not in seen]
        if gaps:
            FAIL.append("Q%s 카드 %d장이 어느 강에도 안 붙는다: %s"
                        % (q, len(gaps), gaps[:8]))


def check_lectures():
    for f in sorted(LEC.glob("*.md")):
        text = f.read_text(encoding="utf-8")
        cur = int(re.search(r"^# (\d+)강", text, re.M).group(1))
        # 블록 6은 앞일을 적는 칸이라 시제 검사에서 뺀다. 따로 본다.
        body = text.split("## 6. 다음 강 예고")[0]

        for m in re.finditer(r"(\d{1,3})강", body):
            n = int(m.group(1))
            if n > LAST:
                FAIL.append("%s: %d강을 가리킨다. %d강까지다" % (f.name, n, LAST))

        for m in re.finditer(r"(\d{1,2})강[^.\n]{0,30}?" + PAST, body):
            if int(m.group(1)) > cur:
                FAIL.append("%s: %d강을 지난 일처럼 적었다: %s"
                            % (f.name, int(m.group(1)), m.group(0)[:40]))

        # 가리킨 강 바로 뒤에 붙은 것만 본다. 사이에 다른 강 번호나 "여기서" 가 끼면
        # 그것은 차례를 훑는 문장이라 앞일로 적은 것이 아니다. 셋 다 그런 문장이었다.
        for m in re.finditer(r"(\d{1,2})강(?:에서|에|은|이)\s*([^.\n]{0,12}?)" + FUTURE, body):
            if int(m.group(1)) >= cur:
                continue
            if "강" in m.group(2) or "여기" in m.group(2):
                continue
            if body[m.end():m.end() + 4].startswith("고 했다"):
                continue
            WARN.append("%s: %d강을 앞일처럼 적었다: %s"
                        % (f.name, int(m.group(1)), m.group(0)[:40]))

        # 블록 6. 96강만 다음 강이 없다.
        b6 = text.split("## 6. 다음 강 예고")
        b6 = b6[1] if len(b6) > 1 else ""
        nums = [int(x) for x in re.findall(r"(\d{1,2})강", b6)]
        if cur == LAST:
            # 마지막 강은 자기와 앞 강을 되짚는다. 뒤를 가리키면 없는 것을 가리키는 것이다.
            ahead = [n for n in nums if n > cur]
            if ahead:
                FAIL.append("%s: 마지막 강인데 예고가 %s강을 가리킨다" % (f.name, ahead[0]))
        elif not nums:
            FAIL.append("%s: 예고에 강 번호가 없다" % f.name)
        elif nums[0] != cur + 1:
            FAIL.append("%s: 예고 첫 번호가 %d강이다. %d강이어야 한다"
                        % (f.name, nums[0], cur + 1))


def main():
    cards = card_index()
    media = media_index()
    check_handouts(cards, media)
    check_tiling(cards)
    check_lectures()
    for m in FAIL:
        print("[실패] %s" % m)
    for m in WARN:
        print("[경고] %s" % m)
    print()
    print("강의 %d편 / 강의록 %d편 / 카드 %d장 / 미디어 %d개"
          % (len(list(LEC.glob("*.md"))), len(list(HAND.glob("eng2p_handout_l*.md"))),
             sum(len(v) for v in cards.values()), len(media)))
    print("실패 %d / 경고 %d" % (len(FAIL), len(WARN)))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
