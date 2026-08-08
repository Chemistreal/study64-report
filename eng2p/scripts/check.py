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

# 쓰는 문자 범위. 이 밖의 글자는 실수로 섞여 든 것이다.
# Q4 86강 제목에 키릴 문자가 한 낱말 섞여 든 것을 블록 누락으로만 잡았다.
# 그때는 제목이 깨져서 걸렸다. 본문 가운데였으면 안 걸렸을 것이다.
ALLOWED_CHAR = re.compile(
    "[ -~"                    # ASCII
    "\uac00-\ud7a3"          # 한글 음절
    "\u3131-\u318e"          # 한글 자모
    "\n\r\t"
    "\u2018\u2019\u201c\u201d\u2026\u00b7\u2192\u00b0]"
)

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


def is_audio(name):
    return bool(re.search(r"_audio_", name) or re.fullmatch(r"lle1-\d{2}\.md", name))


def check_common(path, text):
    if not re.fullmatch(r"[A-Za-z0-9_.\-]+", path.name):
        fail(path, "파일명이 ASCII가 아니다")

    odd = sorted({c for c in text if not ALLOWED_CHAR.match(c)})
    if odd:
        fail(path, "쓰는 문자 범위 밖: %s" % " ".join(
            "%s(U+%04X)" % (c, ord(c)) for c in odd[:5]))

    bad_reg = sorted({m for m in REGISTER_LABEL.findall(text)
                      if m not in REGISTERS and not m.startswith("통과")})
    if bad_reg:
        fail(path, "레지스터 이름이 셋 밖이다: %s (격식 중립 친근만 쓴다)"
             % " ".join(bad_reg))

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

    # 음성 대본은 C-real / C-gen 을 쓴다. docs/audio_intake.md 1장.
    if re.search(r"^신뢰도:\s*C", text, re.M) and not is_audio(path.name):
        fail(path, "C등급은 제작하지 않는다. 조준표에 채집 지시만 쓴다")

    if re.search(r"^신뢰도:\s*B", text, re.M) and "검증로그:" not in text:
        fail(path, "B등급인데 검증로그 항목이 없다")

    # 1인 지시 탐지
    #
    # "혼자" 는 부정문과 "각자" 가 붙은 문장에서도 나온다.
    # "혼자 하는 블록은 없다" 와 "각자 혼자 적는다" 는 둘 다 2인 절차다.
    # 그 둘을 걸러야 경고가 남아 있는 것에 의미가 생긴다.
    #
    # 비상판만 예외다. 기준서 11.2가 이 과정 유일한 1인 예외로 지정한다.
    # 결석의 동기화를 막는 장치이므로 1인 수행이 규격 그 자체다.
    if "emg" in path.name:
        return

    SAFE = re.compile(r"(없다|않는다|없고|아니다|아니라|아닌|각자|둘 다|서로)")
    for m in re.finditer(r"(혼자|각자 알아서|스스로 만들어)", text):
        s = text.rfind("\n", 0, m.start()) + 1
        e = text.find("\n", m.end())
        line = text[s:e if e > 0 else len(text)]
        if m.group(1) == "혼자" and SAFE.search(line):
            continue
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
    check_plan30(path, seg)


# 블록 3의 30분 배분이다. 강의록 셋째 칸이 이 문장 하나에서 나온다.
# 손으로 적은 숫자라 합이 안 맞아도 아무 데도 안 걸렸다.
# T75 에서 61강이 36분, 95강이 32분이었다. 둘 다 한 해 내내 안 잡혔다.
MULT = {"둘": 2, "셋": 3, "넷": 4, "다섯": 5, "여섯": 6}
# 배분이 두 줄에 걸치는 강이 있다. 1강이 그렇다. 빈 줄까지 이어 붙이고 첫 문장만 센다.
PLAN_LINE = re.compile(r"30분을 이렇게 쓴다\.\s*(.+?)(?:\n\s*\n|\Z)", re.S)


def plan_minutes(line):
    """배분 문장에서 분을 더한다. "8분씩 셋" 은 곱해서 센다."""
    total = 0
    for part in re.split(r"[,、]", line):
        m = re.search(r"(\d+)\s*분", part)
        if not m:
            continue
        n = int(m.group(1))
        mm = re.search(r"분\s*씩\s*([가-힣]+)", part)
        if mm and mm.group(1) in MULT:
            n *= MULT[mm.group(1)]
        total += n
    return total


def check_plan30(path, seg):
    m = PLAN_LINE.search(seg or "")
    if not m:
        return
    line = re.split(r"(?<=다)\.\s", re.sub(r"\s+", " ", m.group(1)).strip())[0]
    got = plan_minutes(line)
    if got != 30:
        fail(path, "블록 3 배분 합이 %d분이다. 30분이어야 한다: %s" % (got, line))


def section(text, start, end):
    i = text.find(start)
    if i < 0:
        return ""
    j = text.find(end, i + len(start))
    return text[i:j if j > 0 else len(text)]


# 카드 검사 -----------------------------------------------------------------

CARD_TYPES = ["판정형", "압박형", "확장형", "역할형", "repair형"]
ROLE_ELEMS = ["상황", "관계", "목적", "레지스터", "종료"]

# 기준서 8.3 이 세 칸으로 고정한다. 20강이 그 셋을 가르는 물음 셋을 준다.
# 넷째 이름이 슬며시 늘어난 적이 있다. 정중 21건이 그것이고 T56 에서 격식으로 합쳤다.
# 이름이 하나 늘면 학습자에게는 칸이 하나 느는 것이고 90강 규칙이 그 자리에서 깨진다.
REGISTERS = ["격식", "중립", "친근"]
REGISTER_LABEL = re.compile(r"레지스터[:는]\s*([가-힣]+)")


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


# 음성 대본 검사 ------------------------------------------------------------
# docs/audio_intake.md 규격. 외부에서 만들어진 음성의 대본을 검사한다.
# 음성 자체는 검사할 수 없다. 그래서 대본 없는 음성은 반입하지 않는다.

AUDIO_META = [
    ("종류", r"^종류:\s*(생성 음성|실제 녹음)\s*$"),
    ("음성 파일", r"^음성 파일:\s*[A-Za-z0-9_.\-]+\.(mp3|m4a|wav|mp4|webm)\s*$"),
    ("화자 수", r"^화자 수:\s*\d+\s*$"),
    ("속도", r"^속도:\s*\S+"),
    ("길이", r"^길이:\s*.*\d"),
    # 트랙은 자료가 아니라 그 자료를 쓰는 강의의 속성이다.
    # 외부에서 받은 원자료는 미지정으로 둔다. 강의가 자기 트랙을 선언한다.
    ("트랙", r"^트랙:\s*(소리|청크|자동화|문법|화용|repair|미지정.*)\s*$"),
    ("분기", r"^분기:\s*Q[1-4]\s*$"),
    ("학습용 인공물", r"^학습용 인공물:\s*(예|아니오)\s*$"),
]

# 분기별 화자 수 상한. 기준서 10.2 재료 조건에서 온다.
SPK_MAX = {"Q1": 2, "Q2": 2, "Q3": 3, "Q4": 99}


def check_audio(path, text):
    grade = re.search(r"^신뢰도:\s*(C-gen|C-real)\s*$", text, re.M)
    if not grade:
        fail(path, "음성 대본은 신뢰도가 C-gen 또는 C-real 이어야 한다")
        return
    gen = grade.group(1) == "C-gen"

    for label, pat in AUDIO_META:
        if not re.search(pat, text, re.M):
            fail(path, "메타 항목 누락 또는 형식 오류: %s" % label)

    if gen:
        if not re.search(r"^학습용 인공물:\s*예\s*$", text, re.M):
            fail(path, "C-gen 인데 학습용 인공물 표기가 예가 아니다")
        if "2층" in text:
            fail(path, "C-gen 은 2층 자료가 될 수 없다. audio_intake.md 1장")
        if re.search(r"^트랙:\s*소리\s*$", text, re.M):
            warn(path, "C-gen 을 소리 트랙에 쓴다. 연습은 되지만 통과 판정에는 못 쓴다")

    # 음성 파일명은 대본 파일명과 확장자만 달라야 한다
    m = re.search(r"^음성 파일:\s*(\S+)$", text, re.M)
    if m:
        stem = m.group(1).rsplit(".", 1)[0]
        if stem != path.stem:
            fail(path, "음성 파일 이름이 대본과 다르다: %s vs %s" % (stem, path.stem))

    q = re.search(r"^분기:\s*(Q[1-4])\s*$", text, re.M)
    n = re.search(r"^화자 수:\s*(\d+)\s*$", text, re.M)
    if q and n and int(n.group(1)) > SPK_MAX[q.group(1)]:
        warn(path, "%s 재료 조건보다 화자가 많다 (%s명)" % (q.group(1), n.group(1)))

    if "## 대본" not in text:
        fail(path, "'## 대본' 절이 없다")


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
    if is_audio(name):
        check_audio(path, text)
    if "dialog" in name or "[1층]" in text:
        check_dialogue(path, text)


def main():
    if len(sys.argv) < 2:
        print("사용법: check.py <파일 또는 디렉터리>")
        return 1
    # 자리를 여럿 받는다. 내가 쓰는 문서는 폴더가 갈려 있어 한 번에 못 준다. T149
    files = []
    for a in sys.argv[1:]:
        t = pathlib.Path(a)
        files += sorted(t.rglob("*.md")) if t.is_dir() else [t]
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
