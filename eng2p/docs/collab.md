# 공동 개발 규약

신뢰도: A 생성 (제작 관리)
지위: 제안. docs/spec.md 와 충돌하면 spec.md 가 이긴다.
우선순위: spec.md > audio_intake.md > collab.md > CLAUDE.md

---

## 0. 역할

| 역할 | 담당 | 하는 일 |
|---|---|---|
| 주 개발 | Claude | 설계, 규격, 검사기, 통합, 최종 판정 |
| 조수 | GPT | 수집, 변환, 대량 반복 작업, 데이터 채우기 |

조수를 두는 이유는 분량이지 판단이 아니다.
조수가 잘하는 것은 52개 대본을 긁어 오는 일이고,
못 하는 것은 그 대본이 이 커리큘럼에 맞는지 정하는 일이다.

**둘 다 같은 실패 모드를 갖는다.** 그럴듯한 영어를 자신 있게 쓴다.
학습자 두 사람은 영어 제로라 그걸 못 잡는다. 기준서 1.3이 지목한 위험이다.
그래서 조수의 산출물은 사람이 눈으로 훑는 게 아니라 기계로 거른다.

---

## 1. 파일 소유권

고치는 사람이 정해져 있다. 남의 파일을 고치지 않는다.

| 경로 | 소유 | 비고 |
|---|---|---|
| docs/spec.md | 사용자 | 아무도 못 고친다. 개정 요청만 받는다 |
| docs/audio_intake.md | Claude | 조수는 읽기만 |
| docs/collab.md | Claude | 이 파일 |
| CLAUDE.md | Claude | 제작 지침 |
| scripts/ | Claude | 검사기. 조수가 통과 못 하면 데이터를 고치지 검사기를 고치지 않는다 |
| templates/ | Claude | 목표 형식 |
| out/ | Claude | 강의, 카드, 세트, 조준표 |
| state/ | Claude | 대장과 일지 |
| english.html | Claude | 구조와 로직 |
| media/english/catalog.json | **GPT** | 데이터. 스키마는 Claude 가 정한다 |
| media/english/catalog.js | **GPT** | catalog.json 과 내용이 같아야 한다 |
| media/english/audio/ | **GPT** | 라이선스 확인된 음성만 |
| media/english/transcripts/ | **GPT** | 대본. check.py 음성 대본 검사를 통과해야 한다 |
| media/english/images/ | **GPT** | 대표 이미지 |
| media/english/worksheets/ | **GPT** | 수업 자료 |
| media/english/*.md | **GPT** | NOTICE, README |
| scripts/sync_english_media.py | **GPT** | 수집 스크립트. 검사기가 아니다 |
| tasks/ | Claude 가 쓰고 GPT 가 읽는다 | 작업 지시서 |

english.html 은 조수가 건드리지 않는다.
데이터만 채우면 화면은 알아서 붙게 설계돼 있다.
화면에 뭔가 필요하면 지시서에 적어 Claude 에게 넘긴다.

**예외를 인정한 사례.** PR #3 에서 조수가 `eng2p/scripts/check.py` 의 `is_audio()` 를
넓혀 자기 대본 파일이 내 검사를 받게 했다. 소유권 위반이지만 방향이 맞아 수용했다.
자기 산출물을 게이트에 물리는 방향이면 다음에도 받는다.
게이트를 통과하려고 검사를 느슨하게 하는 방향이면 되돌려보낸다.

---

## 2. 반입 절차

```
1. Claude 가 tasks/ 에 지시서를 쓴다. 합격 기준이 기계로 검사 가능해야 한다
2. GPT 가 작업하고 PR 을 연다
3. Claude 가 검사기를 돌린다
     python3 eng2p/scripts/check_media.py
     python3 eng2p/scripts/check.py eng2p/out/
4. 실패가 있으면 되돌려보낸다. 고치는 건 GPT
5. 통과하면 Claude 가 통합하고 state/journal.md 에 판정을 기록한다
```

검사기를 통과했다고 내용이 맞는 건 아니다.
검사기는 형식만 본다. 영어의 현행성은 기준서 5.3 판정 루프에서 잡는다.

---

## 3. 조수가 하면 좋은 일

- 공개 자료 수집. 라이선스가 확인된 것만
- 대본 전사와 정리
- 카탈로그 필드 채우기
- 같은 형식을 수십 번 반복하는 변환
- 링크와 메타데이터 대조

## 4. 조수가 하면 안 되는 일

| 금지 | 이유 |
|---|---|
| 영어 표현을 새로 지어내기 | 검출할 사람이 없다. 기준서 1.3 |
| docs/spec.md 수정 | 사용자만 고친다 |
| 커리큘럼 순서와 트랙 비중 변경 | 기준서 2.1이 고정한다 |
| 검사기 수정 | 데이터를 고치지 검사기를 고치지 않는다 |
| english.html 구조 변경 | 통합이 깨진다 |
| 저작권 있는 자료 반입 | 이 저장소는 공개 배포된다 |
| 슬랭, 유행어, 시사 레퍼런스 | 기준서 13.2 |
| 한글 음차 | 기준서 13.1 |
| 대본 없는 음성 반입 | audio_intake.md 2.1 |

---

## 5. 카탈로그 스키마

조수가 채우는 유일한 계약이다. 검사기가 이 표를 강제한다.

### 5.1 최상위

| 필드 | 필수 | 형식 |
|---|---|---|
| name | 예 | 문자열 |
| count | 예 | items 길이와 같아야 한다 |
| source | 예 | 출처 이름 |
| sourceUrl | 예 | https |
| termsUrl | 예 | https. 라이선스 근거 페이지 |
| license | 예 | 무엇이 왜 허용되는지 한 문장 이상 |
| checked | 예 | YYYY-MM-DD. 라이선스를 확인한 날 |
| items | 예 | 배열 |

### 5.2 항목

| 필드 | 필수 | 형식 |
|---|---|---|
| id | 예 | 소문자, 숫자, 붙임표 |
| lesson | 예 | 정수. 중복 금지 |
| quarter | 예 | 1~4 |
| title | 예 | 문자열 |
| duration | 예 | M:SS 또는 MM:SS |
| focus | 예 | **소리 / 청크 / 의미** 중 하나 |
| audio | 예 | 저장소 상대 경로. 파일이 실제로 있어야 한다 |
| page | 예 | https. 원문과 대본 페이지 |
| originalAudio | 아니오 | https |
| video | 아니오 | https |
| track | 아니오 | 6트랙 값. 소리/청크/자동화/문법/화용/repair |
| speakers | 아니오 | 정수. 분기별 상한과 대조한다 |
| transcript | **곧 필수** | 아래 5.4 |
| image | 아니오 | 저장소 상대 경로 |
| worksheet | 아니오 | 저장소 상대 경로 |
| speakerCount | 아니오 | 정수. speakers 와 같은 뜻 |
| speed | 아니오 | 느림 / 보통 / 빠름 |
| grade | 아니오 | C-real 또는 C-gen |

### 5.3 focus 와 track 을 헷갈리지 않는다

- **focus** 는 회차 초점 어휘다. 기준서 10.3 "1회 소리, 2회 청크, 3회 의미"
- **track** 은 6트랙 어휘다. 기준서 2.1

지금 카탈로그는 레슨마다 focus 를 하나씩 돌려 붙였는데,
기준서 10.3은 **같은 자료를 세 번 듣되 회차마다 초점을 바꾸라**는 뜻이다.
자료마다 초점을 하나씩 배정하라는 뜻이 아니다.
3회차 진행은 앱이 관리한다. 카탈로그의 focus 는 1회차 권장값으로만 쓴다.

### 5.5 화자 수는 사람이 적지 않는다

`speakerCount` 는 대본에서 기계로 뽑는다. 손으로 적는 값이 아니다.

```bash
python3 eng2p/scripts/derive_speakers.py --check   # 집계만
python3 eng2p/scripts/derive_speakers.py --write   # 카탈로그와 대본을 맞춘다
```

정규화 규칙이 곧 화자 수의 정의다.

- 대본에서 `이름:` 형태의 발화 표시를 센다
- 뒤에 붙는 소유격 voice 는 뗀다. `Anna's voice` 와 `Anna` 는 한 사람이다
- 대소문자와 공백, 끝의 마침표는 무시한다

`check_media.py` 가 카탈로그 값, 대본 머리말의 `화자 수`, 본문에서 센 값
셋이 서로 같은지 본다. 하나라도 어긋나면 실패다.

**왜 이렇게 만들었나.** T-009 에서 경고 17건을 없애는 과정에 화자 수가
5건 내려갔다. 대본을 다시 세서 고친 것도 있었지만, 검사기가 선언값을
검증할 수 없으니 구분이 안 됐다. 숫자를 사람 판단에서 빼내면 이 문제가 사라진다.
분기도 화자 수에서 파생된다. 검사기를 통과하려고 값을 조정할 여지가 없다.

### 5.4 transcript 는 두 형태를 받는다

**형태 1. 파일 경로 (권장)**

```json
"transcript": "media/english/transcripts/lle1-01.md"
```

대본이 길면 카탈로그가 무거워진다. 52과 x 평균 15줄이면 그렇다.
파일은 audio_intake.md 2.2 메타 형식을 그대로 쓰고 `## 대본` 절에 본문을 넣는다.
이 파일은 `scripts/check.py` 의 음성 대본 검사도 함께 통과해야 한다.

**형태 2. 인라인 배열**

```json
"transcript": ["Anna: Hello!", "Man: Hi."]
"transcript": [{"t": 0.0, "line": "Anna: Hello!"}]
```

짧은 자료에만 쓴다. `t` 가 있으면 앱이 줄마다 재생 지점을 잡는다.

두 형태 다 대본 본문에 한글이 있으면 실패다. 머리말 메타는 한국어로 써도 된다.

---

## 6. 지시서 양식

tasks/ 에 다음 형식으로 쓴다. 합격 기준이 없으면 지시서가 아니다.

```
# T-000 제목

담당: GPT
선행: (없음 또는 T-00x)
소유 파일: (건드려도 되는 경로)

## 무엇을
## 왜
## 합격 기준 (기계 검사 가능해야 한다)
## 하지 말 것
```
