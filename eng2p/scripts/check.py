#!/usr/bin/env python3
"""eng2p 제작물 규격 검사기.

사용법:
    python3 scripts/check.py out/lectures/eng2p_q1_l001.md
    python3 scripts/check.py out/            # 디렉터리 전체

종료 코드 0이면 통과, 1이면 실패.
"""
import re
import sys
import pathlib

FAIL = []
WARN = []


def fail(path, msg):
    FAIL.append("%s: %s" % (path.name, msg))


def warn(path, msg):
    WARN.append("%s: %s" % (path.name, msg))


# 공통 검사 -----------------------------------------------------------------

BANNED_CHARS = {
    "\u2014": "em-dash (U+2014)",
    "\ufffd": "U+FFFD",
    "\u2013": "en-dash (U+2013)",
}

# 한글 음차 탐지: 영어 예문 근처에 나오는 가타카나식 한글 표기는 잡기 어렵다.
# 대신 흔한 음차 패턴을 목록으로 관리한다.
TRANSLITERATION = [
    "디스", "왓", "하우", "웨어", "쓰리", "파이브",
    "굿모닝", "땡큐", "쏘리", "플리즈", "아이엠",
]
# 짧은 음차는 일반 한국어 단어에 섞여 오탐이 난다("포" in "포함").
# 앞뒤가 한글이 아닌 경우에만 잡는다.
TRANSLIT_RE = re.compile(
    r"(?<![가-힣])(%s)(?![가-힣])" % "|".join(TRANSLITERATION)
)

AI_CLICHE = ["결론적으로", "중요한 것은", "핵심은 바로", "요약하자면"]

VAGUE_CRITERIA = ["자연스러워지면", "익숙해지면", "감이 오면", "편해지면", "어느 정도"]


def check_common(path, text):
    if not re.fullmatch(r"[A-Za-z0-9_.\-]+", path.name):
        fail(path, "파일명이 ASCII가 아니다")

    for ch, label in BANNED_CHARS.items():
        n = text.count(ch)
        if n:
            fail(path, "%s %d개" % (label, n))

    if re.search(r"\\u[0-9a-fA-F]{4}", text):
        fail(path, "유니코드 이스케이프 발견. 리터럴 UTF-8로 쓴다")

    for m in TRANSLIT_RE.finditer(text):
        warn(path, "한글 음차 의심: %s" % m.group(1))

    for w in AI_CLICHE:
        if w in text:
            warn(path, "AI 상투 표현: %s" % w)

    if not re.search(r"^신뢰도:\s*[ABC]", text, re.M):
        fail(path, "신뢰도 등급 표시가 없다 (첫 줄에 '신뢰도: A')")

    if re.search(r"^신뢰도:\s*C", text, re.M):
        fail(path, "C등급은 제작하지 않는다. 조준표에 채집 지시만 쓴다")

    if re.search(r"^신뢰도:\s*B", text, re.M) and "검증로그:" not in text:
        fail(path, "B등급인데 검증로그 항목이 없다")

    # 1인 지시 탐지
    for m in re.finditer(r"(혼자|각자 알아서|스스로 만들어)", text):
        warn(path, "1인 수행 지시 의심: %s" % m.group(1))


# 강의 검사 -----------------------------------------------------------------

LECTURE_BLOCKS = [
    "## 1. 원리",
    "## 2. 한국어 화자 함정",
    "## 3. 역할 지정",
    "## 4. 드릴 연결",
    "## 5. 통과 기준",
    "## 6. 다음 강 예고",
]

BLOCK2_KEYS = ["모음 삽입", "음절 박자", "구개음화", "dark l", "표기"]


def body_len(text):
    """머리말과 표를 뺀 대략적 본문 길이."""
    t = re.sub(r"^\|.*$", "", text, flags=re.M)
    t = re.sub(r"^#.*$", "", t, flags=re.M)
    return len(re.sub(r"\s", "", t))


def check_lecture(path, text):
    pos = -1
    for b in LECTURE_BLOCKS:
        i = text.find(b)
        if i < 0:
            fail(path, "블록 누락: %s" % b)
        elif i < pos:
            fail(path, "블록 순서 어긋남: %s" % b)
        else:
            pos = i

    n = len(re.sub(r"\s", "", text))
    if not (2400 <= n <= 3600):
        fail(path, "분량 이탈: 공백 제외 %d자 (목표 2700~3300)" % n)

    # 블록 2 인과 형식
    seg = section(text, "## 2. 한국어 화자 함정", "## 3.")
    if seg and not re.search(r"한국어(에서는|는|가)", seg):
        fail(path, "블록 2에 한국어 간섭의 인과가 없다")
    if seg and not any(k in seg for k in BLOCK2_KEYS):
        warn(path, "블록 2가 근거표 밖이다. B등급 표시 확인")

    # 블록 4 카드 번호
    seg = section(text, "## 4. 드릴 연결", "## 5.")
    if seg and not re.search(r"\b\d{3}\b", seg):
        fail(path, "블록 4에 카드 번호가 없다")

    # 블록 5 숫자 기준
    seg = section(text, "## 5. 통과 기준", "## 6.")
    if seg:
        if not re.search(r"\d", seg):
            fail(path, "블록 5 통과 기준에 숫자가 없다")
        for w in VAGUE_CRITERIA:
            if w in seg:
                fail(path, "블록 5에 모호한 기준: %s" % w)

    # Q1 문법 0%
    if "_q1_" in path.name and re.search(r"^트랙:\s*문법", text, re.M):
        fail(path, "Q1에 문법 트랙 강의는 없다")

    # 2인 전제
    seg = section(text, "## 3. 역할 지정", "## 4.")
    if seg and ("A" not in seg or "B" not in seg):
        fail(path, "블록 3에 A/B 역할이 모두 없다")


def section(text, start, end):
    i = text.find(start)
    if i < 0:
        return ""
    j = text.find(end, i + len(start))
    return text[i:j if j > 0 else len(text)]


# 카드 검사 -----------------------------------------------------------------

CARD_TYPES = ["판정형", "압박형", "확장형", "역할형", "repair형"]
ROLE_ELEMS = ["상황", "관계", "목적", "레지스터", "종료"]


def check_cards(path, text):
    cards = re.split(r"^---$", text, flags=re.M)
    for c in cards:
        if "[A면]" not in c and "[B면]" not in c:
            continue
        num = re.search(r"\[(\d{3})\]", c)
        tag = "카드 %s" % (num.group(1) if num else "?")

        t = next((x for x in CARD_TYPES if x in c), None)
        if not t:
            fail(path, "%s: 유형 표시 없음" % tag)
            continue

        a = section(c, "[A면]", "[B면]")
        b = section(c, "[B면]", "\n---")

        for face, name in ((a, "A면"), (b, "B면")):
            ins = re.search(r"지시:\s*(.+)", face)
            if ins and ins.group(1).count(".") > 2:
                fail(path, "%s %s: 지시문 3문장 초과" % (tag, name))

        if t == "판정형" and re.search(r"정답:", b):
            fail(path, "%s: 판정형 정답이 B면에 노출됐다" % tag)
        if t == "압박형" and not re.search(r"\d+\s*초", c):
            fail(path, "%s: 압박형에 제한시간 숫자가 없다" % tag)
        if t == "확장형" and "변형축:" not in c:
            fail(path, "%s: 확장형에 변형 축이 없다" % tag)
        if t == "역할형":
            for e in ROLE_ELEMS:
                if e not in c:
                    fail(path, "%s: 역할형에 %s 없음" % (tag, e))
        if t == "repair형" and "실패가 정상" not in c:
            fail(path, "%s: repair형에 '실패가 정상' 문구 없음" % tag)


# 세트 검사 -----------------------------------------------------------------

SET_STAGES = ["1단계", "2단계", "3단계", "4단계"]


def check_set(path, text):
    for s in SET_STAGES:
        if s not in text:
            fail(path, "단계 누락: %s" % s)
    if "나는 이렇게 이해했다" not in text:
        fail(path, "'나는 이렇게 이해했다' 규칙 문구가 없다")
    if "LRE" not in text:
        fail(path, "4단계에 LRE 기록란이 없다")
    if not re.search(r"대응강의:\s*\S+", text):
        fail(path, "대응 강의 번호가 없다")


# 대화 자료 검사 ------------------------------------------------------------

def check_dialogue(path, text):
    if "[1층]" in text and "학습용 인공물" not in text:
        fail(path, "1층 대화에 '학습용 인공물' 표기가 없다")
    if "[2층]" in text and "출처:" not in text:
        fail(path, "2층 자료에 출처 표기가 없다")
    if "[3층]" in text and "_q1_" in path.name:
        fail(path, "3층 대조판은 Q2부터다")


# 라우팅 ---------------------------------------------------------------------

def run(path):
    text = path.read_text(encoding="utf-8")
    check_common(path, text)
    name = path.name
    # 강의는 파일명 규칙이 eng2p_q1_l001.md 이다.
    # "_l" 부분 일치로 잡으면 eng2p_ledger.md 같은 파일이 강의로 오인된다.
    if re.search(r"_q\d_l\d{3}\b", name):
        check_lecture(path, text)
    if "card" in name:
        check_cards(path, text)
    if re.search(r"_set_", name):
        check_set(path, text)
    if "dialog" in name or "[1층]" in text:
        check_dialogue(path, text)


def main():
    if len(sys.argv) < 2:
        print("사용법: check.py <파일 또는 디렉터리>")
        return 1
    target = pathlib.Path(sys.argv[1])
    files = sorted(target.rglob("*.md")) if target.is_dir() else [target]
    if not files:
        print("검사할 .md 파일이 없다")
        return 1
    for f in files:
        run(f)

    for w in WARN:
        print("[경고] %s" % w)
    for e in FAIL:
        print("[실패] %s" % e)

    print("\n검사 %d개 파일 / 실패 %d / 경고 %d" % (len(files), len(FAIL), len(WARN)))
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
