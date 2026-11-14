#!/usr/bin/env python3
"""여백 작업실 · 발음 사전: 현수에게 보내기 전에 글을 '소리 나는 대로' 바꾼다.

  python pronounce.py --check            # 사전 파일 읽기와 규칙 자체 검사
  python pronounce.py "BATNA를 정한다"    # 바꾼 결과 보기

- 사전 파일 pronounce.txt: 한 줄에 `글 = 읽기`. `#` 뒤는 설명. 대소문자를 가린다.
  영문·숫자는 낱말 단위로만 바꾼다(ENFP 안의 NF는 안 바꿈). 바로 뒤에 한글 조사가 붙어도 바꾼다.
- 연음·조사: 바꾼 읽기의 마지막 받침에 맞춰 바로 뒤 조사를 고친다
  (이/가, 은/는, 을/를, 과/와, 으로/로, 이나/나, 이랑/랑). 예) `SNS을` → `에스엔에스를`.
  한글로 넘기면 현수가 받침을 다음 소리에 이어(연음) 자연스럽게 읽는다.
- 늘 쓰는 규칙: `49~52강` → `49에서 52강`(물결표는 화면 기호라 지우던 것이 '사십구 오십이'로 읽혔다).
- 문단마다 따로 소리를 만드므로 글자 수가 바뀌어도 문단 시간표(소리 따라 문단 표시)는 그대로 맞는다.
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DICT_FILE = os.path.join(HERE, 'pronounce.txt')

# 받침 있는 말 뒤 / 없는 말 뒤 (긴 것부터 찾는다)
JOSA = [('이랑', '랑'), ('으로', '로'), ('이나', '나'), ('이', '가'), ('은', '는'), ('을', '를'), ('과', '와')]
JOSA_RX = '(?:' + '|'.join(sorted({x for p in JOSA for x in p}, key=len, reverse=True)) + ')'
RANGE = re.compile(r'(\d)\s*~\s*(\d)')

def final_consonant(word):
    """마지막 글자의 받침 번호(0=없음, 8=ㄹ). 한글로 끝나지 않으면 None."""
    if not word: return None
    c = ord(word[-1])
    if 0xAC00 <= c <= 0xD7A3: return (c - 0xAC00) % 28
    return None

def fit_josa(word, josa):
    jong = final_consonant(word)
    if jong is None or not josa: return josa
    for withb, without in JOSA:
        if josa in (withb, without):
            if withb == '으로': return without if jong in (0, 8) else withb   # ㄹ 받침 뒤에는 '로'
            return withb if jong else without
    return josa

def load(path=DICT_FILE):
    entries = []
    try:
        with open(path, encoding='utf-8') as f:
            for line in f:
                line = line.split('#', 1)[0].strip()
                if '=' not in line: continue
                src, dst = (x.strip() for x in line.split('=', 1))
                if src and src != dst: entries.append((src, dst))
    except FileNotFoundError:
        pass
    entries.sort(key=lambda e: len(e[0]), reverse=True)
    return entries

def compile_entries(entries):
    out = []
    for src, dst in entries:
        edge_l = r'(?<![A-Za-z0-9])' if re.match(r'[A-Za-z0-9]', src) else ''
        edge_r = r'(?![A-Za-z0-9])' if re.search(r'[A-Za-z0-9]$', src) else ''
        rx = re.compile(edge_l + re.escape(src) + edge_r + '(' + JOSA_RX + r'(?![가-힣]))?')
        out.append((rx, dst))
    return out

_compiled = None
def speakable(text, compiled=None):
    """현수에게 보낼 글로 바꾼다(사전 + 숫자 범위 + 조사 맞추기)."""
    global _compiled
    if compiled is None:
        if _compiled is None: _compiled = compile_entries(load())
        compiled = _compiled
    text = RANGE.sub(lambda m: m.group(1) + '에서 ' + m.group(2), text)
    for rx, dst in compiled:
        text = rx.sub(lambda m, dst=dst: dst + fit_josa(dst, m.group(1) or ''), text)
    return text

def self_check():
    c = compile_entries([('BATNA', '바트나'), ('SNS', '에스엔에스'), ('vs', '대'), ('ⓐ', '에이,'), ('DNA', '디엔에이'), ('Kelly', '켈리')])
    cases = [
        ('BATNA를 정한다', '바트나를 정한다'),
        ('SNS을 끊는다', '에스엔에스를 끊는다'),         # 받침 없는 읽기 → 을→를
        ('Kelly이 말했다', '켈리가 말했다'),             # 이→가
        ('DNA으로 만든다', '디엔에이로 만든다'),         # 으로→로
        ('공격 vs 수비', '공격 대 수비'),
        ('ⓐ 사과', '에이, 사과'),
        ('49~52강이', '49에서 52강이'),
        ('DNAs와 RNA', 'DNAs와 RNA'),                   # 낱말 일부는 안 바꿈
        ('BATNA는데', '바트나는데'),                     # 조사가 아닌 말이 이어지면 조사로 보지 않음
    ]
    for src, want in cases:
        got = speakable(src, c)
        assert got == want, f'{src!r} → {got!r} (기대 {want!r})'
    assert fit_josa('설명회학', '로') == '으로' and fit_josa('서울', '으로') == '로' and fit_josa('바다', '은') == '는'
    n = len(load())
    print(f'발음 사전 {n}개 · 규칙 검사 {len(cases)}개 통과')

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--check': self_check()
    else: print(speakable(' '.join(sys.argv[1:])))
