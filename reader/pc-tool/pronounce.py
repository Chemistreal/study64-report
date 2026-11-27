#!/usr/bin/env python3
"""여백 작업실 · 발음 사전: 현수에게 보내기 전에 글을 '소리 나는 대로' 바꾼다.

  python pronounce.py --check            # 사전 파일 읽기와 규칙 자체 검사
  python pronounce.py "BATNA를 정한다"    # 바꾼 결과 보기

- 사전 파일 pronounce.txt: 한 줄에 `글 = 읽기`. `#` 뒤는 설명. 대소문자를 가린다.
  영문·숫자는 낱말 단위로만 바꾼다(ENFP 안의 NF는 안 바꿈). 바로 뒤에 한글 조사가 붙어도 바꾼다.
- 연음·조사: 바꾼 읽기의 마지막 받침에 맞춰 바로 뒤 조사를 고친다
  (이/가, 은/는, 을/를, 과/와, 으로/로, 이나/나, 이랑/랑). 예) `SNS을` → `에스엔에스를`.
  한글로 넘기면 현수가 받침을 다음 소리에 이어(연음) 자연스럽게 읽는다.
- 겹받침 연음(표준 발음법 제14항, ㅎ은 제12항): 겹받침 바로 뒤에 모음으로 시작하는 글자가 오면 소리 나는 대로 바꾼다.
  현수는 `얇은`을 [얄은]으로 읽어 버린다(2026-11-27) → `얄븐`. 넓은→널븐, 읽어→일거, 없어→업써, 싫어→시러, 많은→마는, 앉아→안자.
- '의'(표준 발음법 제5항: 첫 글자가 아닌 '의'는 [이]도 허용): 현수는 '정의'를 조사처럼 [정에]로 읽는다(2026-11-27, 소리로 확인).
  말 안의 '의'(강의를→강이를, 회의에서→회이에서)와, 띄어 쓴 낱말 그대로인 '의'로 끝나는 명사(정의, 강의, 거의, 상의…)는 '이'로 적어 보낸다.
  조사 '의'(옷의, 13강의, 이번 주의)는 [에]로 읽어도 표준이라 그대로 둔다.
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

# 겹받침(종성 번호) → (남는 받침, 다음 글자 첫소리 번호). 첫소리 ㅇ(11) 자리에 넘어가는 소리.
# 종성: 3ㄳ 5ㄵ 6ㄶ 9ㄺ 10ㄻ 11ㄼ 12ㄽ 13ㄾ 14ㄿ 15ㅀ 18ㅄ / 남는 받침: 0없음 1ㄱ 4ㄴ 8ㄹ 17ㅂ
# 첫소리: 0ㄱ 2ㄴ 5ㄹ 6ㅁ 7ㅂ 10ㅆ 12ㅈ 16ㅌ 17ㅍ
LIAISON = {3: (1, 10), 5: (4, 12), 6: (0, 2), 9: (8, 0), 10: (8, 6), 11: (8, 7), 12: (8, 10), 13: (8, 16), 14: (8, 17), 15: (0, 5), 18: (17, 10)}
LIAISON_RX = re.compile('[가-힣](?=[가-힣])')

# '의'로 끝나는 명사 — 띄어 쓴 낱말 그대로일 때만 [이]로(앞말+조사 '의'와 헷갈리는 수의·결의·신의·주의(이번 주의)는 뺀다)
UI_NOUNS = {'강의', '정의', '회의', '동의', '합의', '논의', '토의', '건의', '문의', '협의', '의의', '호의', '예의', '유의', '창의', '질의', '심의', '모의', '제의',
            '상의', '하의', '탈의', '내의', '거의', '본의', '경의', '임의', '불의', '쟁의', '혐의', '항의', '결의안'}
UI_WORD = re.compile(r'(?<![0-9A-Za-z가-힣])([가-힣]+)(?![0-9A-Za-z가-힣])')
def soften_ui(text):
    """첫 글자가 아닌 '의'를 [이]로: 말 안의 '의'(강의를) + 낱말 그대로인 명사(정의)."""
    def word(m):
        w = m.group(1)
        if '의' not in w[1:]: return w
        if w in UI_NOUNS or (len(w) >= 3 and w.endswith('주의')): return w[:-1] + '이'
        return w[0] + ''.join('이' if ch == '의' and k < len(w) - 2 else ch for k, ch in enumerate(w[1:]))
    return UI_WORD.sub(word, text)

def link_double_finals(text):
    """겹받침 + 모음으로 시작하는 글자 → 소리 나는 대로(얇은→얄븐, 없어→업써, 많은→마는)."""
    chars = list(text)
    for i in range(len(chars) - 1):
        a, n = ord(chars[i]), ord(chars[i + 1])
        if not (0xAC00 <= a <= 0xD7A3 and 0xAC00 <= n <= 0xD7A3): continue
        jong = (a - 0xAC00) % 28
        if jong not in LIAISON or (n - 0xAC00) // 588 != 11: continue
        if chars[i + 1] == '의': continue   # 값의→'갑씌'는 현수가 어색하게 읽는다(조사 '의'는 [에]로도 읽혀 그대로 둔다)
        keep, onset = LIAISON[jong]
        chars[i] = chr(a - jong + keep)
        chars[i + 1] = chr(0xAC00 + onset * 588 + (n - 0xAC00) % 588)
    return ''.join(chars)

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
    """현수에게 보낼 글로 바꾼다(사전 + 숫자 범위 + 조사 맞추기 + '의' + 겹받침 연음)."""
    global _compiled
    if compiled is None:
        if _compiled is None: _compiled = compile_entries(load())
        compiled = _compiled
    text = RANGE.sub(lambda m: m.group(1) + '에서 ' + m.group(2), text)
    for rx, dst in compiled:
        text = rx.sub(lambda m, dst=dst: dst + fit_josa(dst, m.group(1) or ''), text)
    return link_double_finals(soften_ui(text))

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
        ('얇은 원단', '얄븐 원단'),                       # 겹받침 연음 ㄼ
        ('넓은 어깨가 얇다', '널븐 어깨가 얇다'),         # 자음 앞(얇다)은 그대로
        ('책을 읽어 보면 닭을', '책을 일거 보면 달글'),   # ㄺ
        ('시간이 없어요', '시간이 업써요'),               # ㅄ
        ('싫어도 많은 일을 앉아서', '시러도 마는 일을 안자서'),   # ㅀ·ㄶ(ㅎ은 소리 안 남)·ㄵ
        ('젊은이가 핥아 읊어 넋이', '절믄이가 할타 을퍼 넉씨'),   # ㄻ·ㄾ·ㄿ·ㄳ
        ('값의 차이', '값의 차이'),                       # 조사 '의' 앞은 그대로
        ('정의를 내리면 정의 그 자체', '정이를 내리면 정이 그 자체'),   # 말 안의 '의', 낱말 그대로인 명사
        ('13강의 핵심과 이번 주의 강의는', '13강의 핵심과 이번 주의 강이는'),   # 조사 '의'(13강의·주의)는 그대로
        ('옷의 상의와 하의, 거의 다', '옷의 상이와 하이, 거이 다'),
        ('의자와 의미, 민주주의', '의자와 의미, 민주주이'),     # 첫 글자 '의'는 그대로, ~주의
        ('공정의 기회의 회의실', '공정의 기회의 회이실'),       # 앞말+조사 '의'는 그대로
        ('얇 은', '얇 은'),                             # 띄어 있으면 그대로
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
