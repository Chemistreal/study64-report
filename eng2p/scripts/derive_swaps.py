#!/usr/bin/env python3
"""한 줄 바꾸기 판의 **바꿀 낱말 표**를 52과 대본에서 뽑는다. T261

`docs/play_rules.md` 3.2 가 이 자료를 "바꿀 낱말 표. 없음. A등급 예정" 이라고 적었다.
그리고 왜 A등급이 될 수 있는지도 같이 적어 놨다.

    바꿀 낱말은 **대본에 있는 낱말끼리만** 바꾼다. 지어내면 그 자리가 C등급이 된다.

그래서 낱말은 다 대본에서 온다. 지어낸 것이 없다.

## 등급이 한 갈래가 아니다

이 표에는 서로 다른 두 주장이 들어 있다. **하나는 A고 하나는 B다.**

    A   `bad` 와 `bat` 이 둘 다 52과 대본에 있다. 셀 수 있다
    B   그 둘이 **듣기로 가깝다.** 나는 소리를 못 잰다. 철자로 어림잡았다

T258 이 거울 판에서 같은 자리를 만났다. 거기서 한 대로 한다.
**파일이 스스로 갈래마다 등급을 적는다.** 화면이 그것을 옮긴다.

## 왜 가까운 낱말로 바꾸나

멀면 안 듣고도 찾는다. `I went to the store` 를 `I went to the dog` 로 바꾸면
소리를 안 들어도 뜻이 걸린다. 그러면 이 판은 소리 트랙이 아니라 읽기 판이 된다.

철자가 한두 자 다른 낱말로 바꾸면 **그 자리를 안 들으면 못 찾는다.**
철자와 소리가 어긋나는 자리가 영어에 많다는 것은 안다 (T258 에 모음을 그래서 뺐다).
그래서 이 어림은 **B등급**이고 사람이 확인한다.

## 바뀐 줄은 틀린 줄이다

이 판이 내는 줄은 **일부러 틀리게 만든 줄**이다. 그것이 이 판의 뼈대다.
화면이 그렇다고 적어야 한다. 안 적으면 두 사람이 그 줄을 외운다.
CLAUDE.md 가 1층 자료에 "학습용 인공물" 을 적으라고 한 것과 같은 자리다.

쓰는 법:
    python3 scripts/derive_swaps.py

결과: out/data/swaps.json 과 swaps.js
규격: docs/play_rules.md 3.2, docs/play_app.md
"""
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "out", "data")
SRC = os.path.join(OUT, "transcripts.js")

# 한 판이 다섯 줄이다 (규칙서 3.2 끝 조건).
#
# **여덟이던 것을 서른으로 올렸다** (T416). 여덟은 "넉넉히" 로 정한 수였고
# 재 보니 넉넉하지 않았다. `check_supply.js` 가 이 판을 288일 돌려 보고
# **안 잼** 으로 적었다. 자루가 여덟인데 어제 다섯 오늘 다섯을 내면
# 그 둘을 합친 것보다 자루가 커지는 날이 300날 중 이틀뿐이다.
# 그러면 뽑는 법이 좋은지 나쁜지를 잴 날이 없다 (`docs/friction.md` 9장).
#
# **뚜껑을 셈에서 낸다.** 한 판에 내는 수 x 한 과가 도는 날수다.
#
#     5줄 x 6날 = 30
#
# 한 과가 여섯 날을 돈다 (52과 중 마흔셋이 엿새고 여덟이 사흘이다).
# 그 엿새 동안 어제 읽은 줄이 오늘 또 나오지 않으려면 자루가 그만큼은 돼야 한다.
# 대본에서 나오는 것이 과마다 평균 스물둘이라 **이 뚜껑은 대개 안 걸린다.**
# 걸리는 자리를 정해 두는 것과 안 정해 두는 것은 다르다.
PER = 30
# 너무 짧은 줄은 못 쓴다. 찾을 자리가 없다.
MIN_WORDS = 5
# 낱말로 안 세는 것. 사람 이름과 낱말이 아닌 소리와 줄임말 조각이다.
# T258 에 거울 판에서 같은 목록을 썼다. **같은 이유로 같은 것을 뺀다.**
SKIP = {"anna", "pete", "jonathan", "penelope",
        "ve", "re", "ll", "hm", "hmm", "ha", "haha", "shh", "shhh", "uh",
        "oh", "ah", "eh", "mm", "mmm", "ow", "wow", "hey", "yeah", "um"}
# 바꿔도 티가 안 나거나, 바꾸면 줄이 통째로 무너지는 자리다.
# 기능어를 바꾸면 문장이 아예 안 되고 그러면 소리가 아니라 문법이 걸린다.
# **대답말과 인사말도 넣었다.** `Yes` 를 바꾸면 줄이 시작부터 무너진다.
FUNC = {"the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "at",
        "is", "are", "was", "were", "be", "been", "am", "do", "does", "did",
        "have", "has", "had", "will", "would", "can", "could", "not", "no",
        "i", "you", "he", "she", "it", "we", "they", "this", "that", "my",
        "your", "his", "her", "its", "our", "their", "for", "with", "as",
        "yes", "okay", "ok", "hi", "hello", "bye", "please", "thanks",
        "let", "lets", "don", "doesn", "didn", "isn", "aren", "won", "can"}

# 바꿔 넣을 낱말이 대본에 몇 번은 나와야 한다. **한 번 나온 것은 낱말이 아닐 수 있다.**
# 실제로 `too` 를 `hoo` 로 바꾸는 것이 나왔다. `hoo` 는 "woo hoo" 의 그 조각이다.
MIN_FREQ = 3
# 낱말 꼴 바꾸기는 안 센다. `vacation` 을 `vacations` 로 바꾸는 것은 소리가 아니라
# 문법이고 **Q1 문법은 0%다** (CLAUDE.md). 끝에 붙는 것만 다르면 버린다.
# `n` 과 `en` 이 붙는 것은 불규칙 과거분사다. `see` 를 `seen` 으로 바꾸는 것이
# 나왔다. "Seen you later" 는 소리가 아니라 문법이 걸린 줄이다. T261
TAILS = ("s", "es", "ed", "d", "ing", "er", "r", "est", "st", "ly", "y",
         "n", "en", "ne")


def lines():
    """52과 대본. 줄마다 화자표를 떼고 본문만 돌려준다."""
    raw = io.open(SRC, encoding="utf-8").read()
    obj = json.loads(raw[raw.index("=") + 1:].rstrip().rstrip(";"))
    out = {}
    for mid, ls in obj["items"].items():
        rows = []
        for i, ln in enumerate(ls):
            body = re.sub(r"^[A-Z][A-Za-z .'-]{0,20}:\s*", "", ln)
            rows.append((i, body))
        out[mid] = rows
    return out


def vocab(all_lines):
    """대본 전체의 낱말. **여기 없는 낱말로는 안 바꾼다.**

    같이 두 가지를 센다.

        몇 번 나오나        한 번짜리는 낱말이 아닐 수 있다
        소문자로 나오나     한 번도 소문자로 안 나오면 이름이다

    뒤엣것이 이름 거르개다. `Marsha` 를 `marsh` 로 바꾸는 것이 나왔다 (T261).
    이름을 손으로 적어 거르면 대본에 있는 이름을 다 알아야 하고 나는 모른다.
    **세어서 가른다.** 손으로 적은 목록은 다음 대본에서 낡는다.
    """
    freq, low_seen = {}, set()
    for rows in all_lines.values():
        for _, body in rows:
            for w in re.findall(r"[A-Za-z]+", body):
                k = w.lower()
                if len(k) < 3 or k in SKIP:
                    continue
                freq[k] = freq.get(k, 0) + 1
                if w[0].islower():
                    low_seen.add(k)
    return freq, low_seen


def inflect(a, b):
    """둘이 낱말 꼴만 다른가. 긴 쪽이 짧은 쪽에 꼬리를 붙인 것이면 그렇다."""
    x, y = (a, b) if len(a) <= len(b) else (b, a)
    if not y.startswith(x[:max(1, len(x) - 1)]):
        return False
    return any(y == x + t or y == x[:-1] + t for t in TAILS)


def like(src, rep):
    """바꿔 넣는 낱말에 원래 낱말의 대소문자를 입힌다.

    안 입히면 `What is your name?` 이 `hat is your name?` 이 된다.
    읽는 사람이 그 자리에서 걸린다. **바꾸려던 것은 소리 하나다.**
    """
    return rep[0].upper() + rep[1:] if src[:1].isupper() else rep


def dist(a, b, cap=2):
    """철자가 몇 자 다른가. **cap 을 넘으면 그냥 cap+1 을 낸다.**
    멀리 있는 것은 얼마나 먼지가 필요 없다. 안 쓸 것이라서다."""
    if abs(len(a) - len(b)) > cap:
        return cap + 1
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        if min(cur) > cap:
            return cap + 1
        prev = cur
    return prev[-1]


def near(w, freq, low_seen):
    """`w` 와 철자가 한두 자 다른 대본 낱말. **가까운 것부터.**

    거르는 것이 셋이다. 드문 것, 이름, 낱말 꼴만 다른 것.
    """
    out = []
    for v, n in freq.items():
        if v == w or n < MIN_FREQ:
            continue
        if v not in low_seen:          # 한 번도 소문자로 안 나온다. 이름이다
            continue
        if inflect(w, v):              # 꼬리만 다르다. 소리가 아니라 문법이다
            continue
        d = dist(w, v)
        if d <= 2:
            out.append((d, v))
    out.sort()
    return out


def main():
    if not os.path.exists(SRC):
        print("[실패] %s 가 없다" % SRC)
        return 1
    all_lines = lines()
    freq, low_seen = vocab(all_lines)
    # 가까운 낱말 찾기는 낱말마다 한 번만 한다. 줄마다 다시 하면 오래 걸린다.
    cache = {}
    out, thin = {}, []
    for mid in sorted(all_lines):
        got = []
        for li, body in all_lines[mid]:
            # **줄임말을 한 덩이로 잡는다.** 낱말만 잡으면 `Let's` 가 `Let` 과 `s` 로
            # 쪼개지고 앞엣것을 바꾸면 `get's try that again` 이 된다. 실제로 나왔다.
            # 아포스트로피가 붙은 덩이는 통째로 건너뛴다.
            words = re.findall(r"[A-Za-z]+(?:['’][A-Za-z]+)?", body)
            if len(words) < MIN_WORDS:
                continue
            low = [w.lower() for w in words]
            best = None
            for wi, w in enumerate(low):
                if "'" in w or "’" in w:
                    continue
                if len(w) < 3 or w in SKIP or w in FUNC:
                    continue
                if words[wi] not in low_seen and words[wi][:1].isupper() \
                        and w not in low_seen:
                    continue          # 한 번도 소문자로 안 나온다. 이름이다
                # **같은 줄에 두 번 나오는 낱말은 안 쓴다.** 어느 것을 바꿨는지
                # 두 사람이 못 가린다. 찾는 쪽이 맞게 말해도 틀렸다고 하게 된다.
                if low.count(w) > 1:
                    continue
                if w not in cache:
                    cache[w] = near(w, freq, low_seen)
                for d, v in cache[w]:
                    if v in low:
                        continue          # 그 줄에 이미 있는 낱말로는 안 바꾼다
                    if best is None or d < best[0]:
                        best = (d, wi, words[wi], like(words[wi], v))
                    break
            if best:
                got.append({"li": li, "wi": best[1], "from": best[2],
                            "to": best[3], "d": best[0]})
        # 가까운 것부터 담는다. 화면은 앞에서부터 다섯을 쓴다.
        got.sort(key=lambda x: (x["d"], x["li"]))
        out[mid] = got[:PER]
        if len(out[mid]) < 5:
            thin.append("%s(%d)" % (mid, len(out[mid])))

    obj = {
        "note": "한 줄 바꾸기 판의 바꿀 낱말. 낱말은 52과 대본에 있는 것만 쓴다. "
                "손으로 안 고친다. scripts/derive_swaps.py 를 다시 돌린다.",
        "grade": "B",
        "gradeWhy": "낱말이 대본에 있다는 것은 A등급이다 (셀 수 있다). "
                    "그 둘이 듣기로 가깝다는 것은 B등급이다. 철자로 어림잡았고 "
                    "영어는 철자와 소리가 자주 어긋난다. 사람이 확인한다.",
        "warn": "바뀐 줄은 일부러 틀리게 만든 줄이다. 따라 외우지 않는다.",
        "generator": "scripts/derive_swaps.py",
        "per": PER,
        "items": out,
    }
    text = json.dumps(obj, ensure_ascii=False, indent=2) + "\n"
    io.open(os.path.join(OUT, "swaps.json"), "w", encoding="utf-8").write(text)
    io.open(os.path.join(OUT, "swaps.js"), "w", encoding="utf-8").write(
        "window.ENG2P_SWAPS=" +
        json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n")
    tot = sum(len(v) for v in out.values())
    d1 = sum(1 for v in out.values() for x in v if x["d"] == 1)
    print("out/data/swaps.json / 과 %d개 / 줄 %d개 (한 자 다른 것 %d개) / "
          "대본 낱말 %d종에서" % (len(out), tot, d1, len(freq)))
    # **다섯을 못 채운 과를 적는다.** 한 판이 다섯 줄이다 (규칙서 3.2).
    if thin:
        print("  [모자람] 다섯 줄을 못 채운 과 %d개: %s"
              % (len(thin), " ".join(thin[:8])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
