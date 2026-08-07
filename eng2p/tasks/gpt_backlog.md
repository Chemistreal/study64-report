# GPT 작업 목록

신뢰도: A 생성 (제작 관리)
규약: docs/collab.md
갱신일: 2026-08-07

담당은 전부 GPT다. 위에서부터 순서대로 한다.
합격 기준은 전부 기계로 검사한다. 통과 못 하면 미완성이다.

GPT 에게 그대로 붙여 넣을 프롬프트는 `tasks/gpt_prompt.md` 에 있다.
작업이 바뀌면 그 파일의 "이번에 할 일" 절만 갈아 끼운다.

검사 명령은 두 개뿐이다.

```bash
python3 eng2p/scripts/check_media.py
python3 eng2p/scripts/check.py eng2p/out/
```

---

## 현재 상태 (2026-08-07 갱신)

```
python3 eng2p/scripts/check_media.py
항목 52개 / 실패 0 / 경고 17

python3 eng2p/scripts/check.py media/english/transcripts/
검사 52개 파일 / 실패 0 / 경고 17
```

경고 17건은 전부 같은 것이다. 화자 수가 그 분기 재료 조건을 넘는다.
T-009 가 그것이다.

| 작업 | 상태 |
|---|---|
| T-001 대본 52개 | **완료** (PR #3) |
| T-002 메타 보강 | **완료** (PR #3. speakerCount, track, speed, grade) |
| T-009 화자 수 초과 17건 | 대기. 최우선 |
| T-003 축약 20종 용례 | 대기 |
| T-004 VOA Level 2 | 대기 |
| T-005 LibriVox 단편 | 대기 |
| T-006 최소대립쌍 검증 | 대기 |
| T-007 영상 용량 조사 | 대기 |
| T-008 대본 타임스탬프 | 대기 |

---

## T-009 화자 수 초과 17건 정리 (최우선)

담당: GPT
선행: 없음
소유 파일: media/english/catalog.json, media/english/catalog.js, media/english/transcripts/

### 무엇을

검사기가 아래를 경고로 잡는다. 화자 수가 그 분기 재료 조건을 넘는다.

```bash
python3 eng2p/scripts/check_media.py | grep 화자
```

lle1-29, lle1-31, lle1-32(9명), lle1-33(6명), lle1-34, lle1-37 등 17건이다.

각 건에 대해 둘 중 하나를 한다.

1. 화자 수를 잘못 셌으면 고친다. 대본에서 실제로 센다
2. 제대로 셌으면 그 레슨의 `quarter` 를 조건에 맞는 분기로 옮긴다

옮기면 그 분기의 레슨 수가 흔들린다. 흔들린 결과를 지시서 답변에 적는다.

### 왜

기준서 10.2가 분기별 재료 조건을 정한다. Q1 은 화자 1~2인, Q2 2인, Q3 2~3인이다.
조건은 임의로 정한 게 아니다. 제로 시작 학습자는 화자가 늘면 누가 말하는지부터 놓친다.
9명이 나오는 자료를 Q3 에 두면 그 회차는 통째로 버려진다.

### 합격 기준

```
python3 eng2p/scripts/check_media.py
항목 52개 / 실패 0 / 경고 0
```

- catalog 의 `speakerCount` 와 대본 파일의 `화자 수` 가 서로 같다
- `python3 eng2p/scripts/check.py media/english/transcripts/` 도 경고 0

### 하지 말 것

- 경고를 없애려고 화자 수를 낮춰 적지 않는다. 그건 데이터를 망치는 것이다
- 검사기의 상한을 고치지 않는다. 상한은 기준서 10.2에서 온다

---

## T-001 대본 52개 로컬화 (완료. PR #3)

담당: GPT
선행: 없음
상태: **완료.** 아래는 기록으로 남긴다.

조수가 인라인 배열 대신 파일 경로 방식을 썼다.

```json
"transcript": "media/english/transcripts/lle1-01.md"
```

52과 분량에는 그쪽이 낫다고 판단해 계약을 그 방향으로 고쳤다.
docs/collab.md 5.4에 두 형태를 다 받는다고 적었다.
대본 파일이 audio_intake.md 2.2 메타 형식을 그대로 따랐고
`check.py` 음성 대본 검사를 52개 전부 통과했다.

---

## T-002 카탈로그 메타 보강 (완료. PR #3)

담당: GPT
선행: T-001
상태: **완료.** speakerCount, track, speed, grade 가 52개 전부 채워졌다.
      다만 화자 수 17건이 분기 조건을 넘는다. T-009 로 넘긴다.
소유 파일: media/english/catalog.json, media/english/catalog.js

### 무엇을

항목마다 두 필드를 채운다.

| 필드 | 값 |
|---|---|
| `speakers` | 그 음성에 나오는 화자 수. 정수 |
| `track` | 6트랙 중 하나. 소리 / 청크 / 자동화 / 문법 / 화용 / repair |

`focus` 는 건드리지 않는다. 이미 소리, 청크, 의미로 맞춰져 있다.

### 왜

`speakers` 는 기준서 10.2 재료 조건과 대조하려는 것이다.
Q1 은 화자 1~2인, Q2 2인, Q3 2~3인이 조건이다.
조건에 안 맞는 자료를 그 분기에 배치하면 안 된다.

`track` 은 그 레슨이 6트랙 중 어디에 붙는지다.
회차 초점(`focus`)과 다른 축이다. 헷갈리면 docs/collab.md 5.3을 읽는다.

### 합격 기준

- 52개 전부 `speakers` 와 `track` 이 있다
- `check_media.py` 실패 0
- Q1 항목에 `speakers` 가 3 이상이면 경고가 뜬다. 뜨면 그 항목의 quarter 를 재검토해서 지시서로 보고한다

### 하지 말 것

- `focus` 값을 바꾸지 않는다
- 화자 수를 추측하지 않는다. 대본에서 실제로 센다

---

## T-003 축약 20종 실제 용례 채집 (지금 착수 가능)

담당: GPT
선행: T-001 완료됨. 바로 시작한다
소유 파일: media/english/reductions.json (신규)

### 무엇을

T-001 로 만든 52개 대본과 음성에서, 아래 20종의 축약이
**실제로 들리는 지점**을 찾아 목록으로 만든다.

```
going to / want to / got to / have to / has to / ought to /
kind of / sort of / lot of / out of / give me / let me /
don't know / because / what are you / would you / could you /
should have / would have / could have
```

형식은 이렇게 한다.

```json
{
  "checked": "2026-08-__",
  "source": "VOA Learning English Level 1",
  "items": [
    {
      "form": "going to",
      "lesson": 7,
      "audioId": "lle1-07",
      "time": "0:34",
      "line": "I am going to the market.",
      "reduced": true
    }
  ]
}
```

`reduced` 는 실제로 줄어들어 들리면 true, 또박또박 들리면 false 다.
false 도 값이 있다. 어디서 안 줄어드는지도 정보다.

### 왜

기준서 2.2의 Q1 통과 조건이 **축약 20종 청취 식별 90%** 다.
지금까지 그걸 잴 문항이 없었다.

이 목록이 그대로 시험 문항이 된다.
그리고 이건 **C-real 자료라 통과 판정에 쓸 수 있다.**
생성 음성으로는 이 판정을 못 한다. audio_intake.md 5장에 이유가 있다.

### 합격 기준

- 20종 각각에 최소 3건씩, 총 60건 이상
- 모든 `audioId` 가 catalog 의 id 에 존재한다
- 모든 `time` 이 그 음성의 길이 안에 있다
- `line` 이 해당 레슨 `transcript` 에 실제로 있는 문장이다
- 한글 없음

### 하지 말 것

- 대본에 없는 문장을 만들지 않는다
- 안 들리는데 들린다고 적지 않는다. 애매하면 빼고 보고한다

---

## T-004 VOA Level 2 수집

담당: GPT
선행: T-001, T-002
소유 파일: media/english/catalog_l2.json, media/english/audio_l2/

### 무엇을

VOA Learning English 의 Let's Learn English Level 2 를
Level 1 과 같은 스키마로 수집한다. 대본 포함.

### 왜

Q2 재료 조건은 길이 3~6분, 속도 보통보다 약간 느림, 화자 2인이다.
Level 1 은 Q1 조건에 맞고 Q2 에는 짧다.
8주 실행 피드백(기준서 16장 4단계) 전에 미리 쌓아 둔다.

### 합격 기준

- `check_media.py media/english/catalog_l2.json` 실패 0, 경고 0
- 최상위에 `termsUrl`, `license`, `checked` 가 있다
- 음성 파일이 전부 실재하고 10KB 이상이다

### 하지 말 것

- 라이선스를 확인하지 않고 담지 않는다.
  VOA 자체 제작물만 퍼블릭 도메인이다. VOA 페이지에 있다고 다 그런 게 아니다.
  통신사 재배포분이 섞여 있으면 뺀다

---

## T-005 LibriVox 단편 수집

담당: GPT
선행: 없음. T-001 과 병행 가능
소유 파일: media/english/catalog_lv.json, media/english/audio_lv/

### 무엇을

LibriVox 에서 5분 이하 단편 낭독 20개를 같은 스키마로 수집한다.
원문 텍스트를 `transcript` 에 넣는다.

화자가 서로 다른 것으로 고른다. 같은 낭독자로 몰지 않는다.

### 왜

강세 박자 재현이 Q1 통과 조건 중 하나다.
낭독체는 리듬이 또렷해서 그 훈련에 맞는다.
그리고 화자가 여럿이어야 목소리 변이에 귀가 열린다.

### 합격 기준

- 20개, 각 5분 이하
- 낭독자가 최소 10명 이상으로 흩어져 있다
- `transcript` 가 원문과 일치한다
- `check_media.py media/english/catalog_lv.json` 실패 0

### 하지 말 것

- 퍼블릭 도메인이 아닌 낭독을 담지 않는다
- 음질이 나쁜 것을 넣지 않는다. 소리 훈련용이다

---

## T-006 최소대립쌍 단어 검증

담당: GPT
선행: 없음
소유 파일: 없음. 결과를 지시서 답변으로 보고한다

### 무엇을

english.html 소리 탭의 최소대립쌍 8묶음 32쌍이
ESL 발음 교육에서 실제로 쓰이는 표준 쌍인지 확인한다.

```
r/l   : right-light, rock-lock, pray-play, correct-collect
f/p   : fan-pan, coffee-copy, fool-pool, four-pour
v/b   : van-ban, vest-best, curve-curb, very-berry
th/s  : think-sink, thick-sick, mouth-mouse, path-pass
sh/s  : she-see, sheet-seat, ship-sip, shore-sore
i/I   : sheep-ship, seat-sit, feel-fill, leave-live
ae/e  : bad-bed, sat-set, man-men, had-head
자음군 : street, sprint, glimpse, asked
```

### 왜

이 목록은 신뢰도 B다. 음운 대조 자체는 기준서 7.3 근거표 안이지만
단어 선택은 검증 대상이다. 강의에 싣기 전에 확인해야 한다.

### 합격 기준

- 32쌍 각각에 대해 통과 또는 교체 제안
- 교체 제안에는 출처 링크가 붙는다
- 한국어 화자 대상 자료를 최소 2건 이상 확인한다

### 하지 말 것

- 출처 없이 판정하지 않는다
- 새 쌍을 지어내지 않는다. 교재나 논문에 나오는 것만 제안한다

---

## T-007 영상 로컬화 여부 조사

담당: GPT
선행: 없음
소유 파일: 없음. 조사 결과만 보고한다

### 무엇을

catalog 의 `video` 52개를 로컬에 담을 때의 총 용량을 조사한다.
담지 말고 크기만 잰다.

### 왜

음성 52개가 이미 51.9MB 다. 영상까지 담으면 저장소가 무거워진다.
GitHub Pages 배포와 새 세션의 clone 시간에 영향이 있다.
숫자를 보고 정한다.

### 합격 기준

- 52개 각각의 바이트 크기와 총합
- 저장소 현재 크기와 합쳤을 때의 예상 크기
- 링크 유지와 로컬화 중 어느 쪽을 권하는지 한 문단

### 하지 말 것

- 조사 단계에서 파일을 커밋하지 않는다

---

## T-008 대본 타임스탬프 (선택)

담당: GPT
선행: T-001
소유 파일: media/english/catalog.json

### 무엇을

`transcript` 를 문자열 배열에서 객체 배열로 올린다.

```json
"transcript": [
  {"t": 0.0,  "line": "Anna: Hello! I am Anna."},
  {"t": 3.4,  "line": "Man: Hi, Anna."}
]
```

### 왜

english.html 클립 탭의 대본 동기화를 사람이 손으로 찍는 대신
불러오기만 하면 되게 만든다. 52과 x 평균 15줄이면 손으로는 780번이다.

### 합격 기준

- `t` 는 초 단위 실수, 오름차순
- 마지막 `t` 가 그 음성 길이를 넘지 않는다
- 문자열 배열 형식도 계속 통과해야 한다. 검사기가 둘 다 받는다

### 하지 말 것

- 정확도가 안 나오면 하지 않는다. 어긋난 타임스탬프는 없는 것보다 나쁘다
- 이 작업은 T-001 부터 T-003 이 끝난 뒤에 한다

---

## 보고 형식

작업이 끝나면 PR 을 열고 본문에 이것만 적는다.

```
작업: T-00x
검사 결과:
  python3 eng2p/scripts/check_media.py
  항목 __개 / 실패 __ / 경고 __
빼고 보고할 것:
  (추측으로 채우지 않고 남겨 둔 항목)
```
