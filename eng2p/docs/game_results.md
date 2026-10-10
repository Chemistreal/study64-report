# 결과 기록. 게임은 사실만 적고 앱이 해석한다

신뢰도: A 생성 (규격)
상위 규격: docs/game.md 1.1 6장 / docs/spec.md 13.2 / docs/improve.md U2 U8 (2026-10-08 노트북 두 대)
작성일: 2026-10-08

## 1. 결정

두 노트북이 각자 게임을 돌리고 **결과는 사실만 한 줄씩 적는다.** 그 줄을 읽고 오늘이 몇 세션인지,
누가 먼저 말을 여는지, 간격 복습 덱과 어제 그거 덱이 무엇인지 정하는 것은 앱의 셈이다.
그 셈을 C++ 로 다시 짜면 두 벌이 되고 언젠가 어긋난다 (T396).

    노트북 A (host, 방을 연 쪽)               노트북 B (guest)
    게임 -> Results/<run>_s001_host.jsonl     게임 -> Results/<run>_s001_guest.jsonl
                      ^                                  |
                      +---- 하루 끝에 guest 가 자기 파일을 보낸다 (LAN) ----+
    host: 받은 파일을 Results/guest/ 에 그대로 쌓는다 (덮지 않고 지우지 않는다)
    host: node scripts/game_tick.js --results Results ... --out Brain  ->  Brain/next.json
    host: next.json 을 guest 에 보낸다. 다음 날 두 노트북이 같은 next.json 을 읽는다

| 정한 것 | 무엇 |
|---|---|
| 사실만 | 세션 번호, 블록, 카드 id, 판 id, 어떻게(speech/manual), 결과(pass/near/miss/skipped), 시도, 고침, 시작과 끝 시각, 어느 노트북, 어느 자리 |
| 합치기 | guest 의 줄은 host 에 쌓인다. 열쇠는 (세션 번호, 줄 번호). 두 번 보내도 같고 순서를 바꿔도 같다 |
| 앱은 안 덮는다 | 결과는 앱의 기록(`S`)을 안 건드린다. 틱이 메모리에서 처음부터 접고 `next.json` 만 쓴다 |
| 판 번호 | `sessions.json` 의 `schemaVersion` 과 `results_schema.json` 의 `version` 과 줄의 `v` 가 같은 수다 (지금 1) |

만드는 쪽 파일은 셋이다. 이 문서와 `out/game/results_schema.json` (생성)과 `scripts/game_tick.js` (그것을 읽는 쪽).
모양의 원본은 `scripts/derive_game.js` 의 `buildResultsSchema()` 다. 이 문서 4장 표는 `check_game.py` 가 그것과 견준다.

## 2. 안 적는 것

| 안 적는 것 | 까닭 |
|---|---|
| 소리, 소리 파일 경로 | 녹음은 그 노트북에만 남는다 (game.md 1.1) |
| 받아쓴 글, 들린 낱말 | 재판정과 측정용이라 `Rec/` 옆 로컬 로그에만 둔다 |
| 캐릭터 이름, 두 사람 이름 | 이름은 두 사람이 짓고 저장소에 안 간다 (world.md 2.1) |
| 누가 어느 말을 했는지 (화자) | 팀이 같이 한다. 줄 안의 말을 사람별로 가르지 않는다. `seat` 는 결과가 누구 몫인지(아래)지 화자 표시가 아니다 |
| 점수, 확신도, 인식 오류율 | 점수를 안 매긴다 (game.md 6.1). 사람별 점수는 기준서 13.2 가 막는다 |
| 마이크 이름, 장치 번호 | 쓸 곳이 없다 |

`results_schema.json` 의 `x-forbiddenKeys` 가 금지 칸 목록이다. 모양 검사는 그 칸이 하나라도 있으면 줄을 버린다.
`additionalProperties: false` 라서 목록에 없는 칸도 못 들어온다.

**자리(`seat`)는 사람별 점수가 아니다.** 카드를 맞혔는지는 각자의 입에서 나온 값이고 기준서 13.2 아래 개정문 16번이 정했다.
*쌓는 것은 막지 않고 두 사람의 값을 견주는 것을 막는다.* 앱의 카드 간격이 이미 사람별이다 (`docs/cards_person.md`).
그래서 `seat` 는 **간격을 맞는 사람 몫에 쌓으려고** 적는다. 그 밖의 쓰임은 없다.
`next.json` 어디에도 자리별 목록이나 자리별 수가 없다. 복습 덱과 어제 그거 덱은 팀의 합집합이다.

## 3. 파일과 이름

| 무엇 | 어디 | 누가 |
|---|---|---|
| 줄 파일 | `<LocalRoot>/Results/<run>_s<NNN>_<device>.jsonl` | 그 노트북의 게임. 블록이 끝날 때마다 임시 파일에 쓰고 이름을 바꾼다 |
| 받은 guest 파일 | `<LocalRoot>/Results/guest/<받은 이름>` | host 의 게임. 내용을 안 고치고 이름만 겹치지 않게 한다 |
| 합친 정리본 (선택) | `Results/merged.jsonl` | `game_tick.js --merge-out`. 원본을 지우지 않는다 |
| 프로필 | `<LocalRoot>/Brain/state.json` | 게임. `{"v":1,"start":"2026-11-02","nextSession":1}` |
| 다음 날 | `<LocalRoot>/Brain/next.json` | 틱 |

`run` 은 그 세션을 연 UTC 시각 `YYYYMMDDHHMMSS` 다. 이름이 곧 시간 순이고 같은 날 다시 연 세션과 안 겹친다.
**이름은 합치는 열쇠가 아니다.** 열쇠는 줄 안의 `s` 와 `e` 다. 틱은 `Results/` 아래 `*.jsonl` 을 폴더째 읽는다.

한 파일은 그 세션을 연 뒤 지금까지의 줄을 다 담는다 (블록마다 통째로 다시 쓴다). 그래서 같은 파일의 나중 사본은 앞 사본을 품는다.
이어 붙이는 것이 아니라 **같은 줄이 다시 오는 것**이 정상이고 합치기가 그것을 하나로 만든다.

### 3.1 지금 C++ 에서 바뀌는 곳

게임(C++)의 결과 기록과 세션 쪽은 다른 갈래가 이 문서대로 고친다. 달라지는 곳을 모아 둔다.

| 지금 | 계약 |
|---|---|
| 파일 이름 `<date>_s%03d.jsonl` | `<run>_s<NNN>_<device>.jsonl` |
| 줄에 `e` `device` `seat` `date` `t0` `t1` 이 없다 | 모든 줄에 필수 (4장) |
| 소수 초 `sec`, `at`, `from`, `to`, `rate` | 없다. `t0` `t1` 과 정수 `from_ms` `to_ms` `rate_pct` |
| `tries` | `attempts` (첫 시도가 1). `repairs` 가 새로 생겼다 |
| outcome `pass retry_pass moved_on timeout not_run` | `pass near miss skipped` (5.1 표) |
| `line_wait.heard` | 없다. outcome 이 말한다 |
| `via` 는 `line_wait` 에만 | 단위 줄 넷 모두 (`line_wait` `card_run` `play_round` `activity`) |
| 사람은 `a` `b` `team` (C++ 는 person) | 칸 이름 `seat`, 값은 같다 |
| `ValidateLine` 의 필수 칸 표 | `results_schema.json` 을 읽는다 (표를 C++ 에 또 적지 않는다) |
| `FHnlNext.Due` | `review`. `unseen`, `through`, `gaps`, `finished`, `appHash` 가 새로 생겼다 |
| 판 번호를 `schema` 칸에서 읽는다 (`CheckSchema`) | `sessions.json` 맨 위 `schemaVersion`. 다른 파일에는 판 번호 칸이 없다 |
| `FHnlRoleRule` 이 `dayOfMonthParity` | `session_parity`. 벡터는 날짜가 아니라 세션 번호 (`roleVectors[].s`, `.A`) |

## 4. 줄 모양

JSON Lines. 한 줄이 객체 하나고 줄 안에 줄바꿈이 없다. UTF-8, BOM 없음. 숫자는 정수만 쓴다 (소수가 없어야 합친 글이 모든 언어에서 같다).
**모양의 원본은 `results_schema.json` 이다.** 아래 표는 그것을 사람이 읽게 옮긴 것이고 `check_game.py` 가 칸 이름과 필수 여부를 견준다.

### 4.1 모든 줄에 있는 칸 (겉봉)

| 칸 | 꼴 | 필수 | 뜻 |
|---|---|---|---|
| `v` | 정수 1 | 예 | 계약 판 번호 |
| `t` | 글자 | 예 | 줄 종류 (아래 12가지) |
| `s` | 정수 1~9999 | 예 | 세션 번호. 비상판과 짧은 날도 그날 세션 번호를 쓴다 (번호는 안 오른다) |
| `e` | `h` 나 `g` + 14자리 + `-` + 4~6자리 | 예 | 줄 번호 (5.5) |
| `device` | `host` `guest` | 예 | 이 줄을 쓴 노트북 (5.4) |
| `seat` | `a` `b` `team` | 예 | 앱의 사람 자리 (5.3). 단위 줄 다섯(`line_wait` `card_run` `play_round` `activity` `outing_turn`)만 `a` `b` 가 된다. 나머지는 `team` 하나뿐이다 |
| `date` | `YYYY-MM-DD` | 예 | 세션을 연 날, 현지 달력 (5.6) |
| `t0` | `YYYY-MM-DDTHH:MM:SSZ` | 예 | 시작 UTC |
| `t1` | 같은 꼴 | 예 | 끝 UTC. `t0` 이상. 한 순간이면 둘이 같다 |

### 4.2 `session_start`

세션을 연다. `seat` 는 `team`.

| 칸 | 꼴 | 필수 | 뜻 |
|---|---|---|---|
| `mode` | `normal` `busy` `short` | 예 | 보통 날 120분 / 바쁜 날 15분 혼자 / 짧은 날 45분 둘이 (기준서 2.5). `busy` 와 `short` 는 세션 번호를 안 올린다 |
| `seatA` | `a` `b` | 예 | 그날 먼저 말을 여는 사람의 자리 (역할 A). 틱이 정한 `next.json` 의 것을 그대로 적는다 |
| `dataHash` | 16진수 64자 | 예 | 그때 읽은 Data 의 지문 (10장) |
| `game` | 글자 1~16 | 예 | 게임 판 이름 |

### 4.3 `session_end`

| 칸 | 꼴 | 필수 | 뜻 |
|---|---|---|---|
| `mode` | `normal` `busy` `short` | 예 | `session_start` 의 것과 같다 |
| `ended` | `done` `quit` `error` | 예 | 끝까지 / 사람이 닫음 / 멈춤. 정상 세션 수는 host 의 `done` 만 센다 |

### 4.4 `block_start`

| 칸 | 꼴 | 필수 | 뜻 |
|---|---|---|---|
| `block` | 1 2 3 4 9 | 예 | 9 는 바쁜 날 심부름 |
| `place` | 글자 1~40 | 예 | 그 블록의 장소 이름 (`sessions.json` places) |

### 4.5 `block_end`

| 칸 | 꼴 | 필수 | 뜻 |
|---|---|---|---|
| `block` | 1 2 3 4 9 | 예 | |
| `ended` | `done` `timer` `quit` | 예 | 다 함 / 블록 시간이 끝남 / 닫음 |

### 4.6 `media_play`

| 칸 | 꼴 | 필수 | 뜻 |
|---|---|---|---|
| `block` | 1 2 3 4 9 | 예 | |
| `media` | 글자 3~24 | 예 | 녹음 id (`lle1-01`) |
| `from_ms` | 정수 | 예 | 튼 구간 시작 |
| `to_ms` | 정수 | 예 | 튼 구간 끝 |
| `rate_pct` | 정수 25~400 | 예 | 배속. 100 이 1배 |

### 4.7 `line_wait`

NPC 대사 뒤에 팀이 말할 차례를 기다린 한 번.

| 칸 | 꼴 | 필수 | 뜻 |
|---|---|---|---|
| `block` | 1 2 3 4 9 | 예 | |
| `line` | 정수 1~999 | 예 | 장면 줄 번호 (1부터) |
| `outcome` | 5.1 | 예 | |
| `via` | `speech` `manual` | 예 | 5.2 |
| `attempts` | 정수 0~99 | 예 | 5.7 |
| `repairs` | 정수 0~99 | 예 | 5.7 |

### 4.8 `card_run`

카드 한 장을 한 번 돈 것. 간격 복습과 어제 그거가 읽는 줄이다.

| 칸 | 꼴 | 필수 | 뜻 |
|---|---|---|---|
| `block` | 1 2 3 4 9 | 예 | |
| `id` | `Q1-001` 꼴 | 예 | 카드 id |
| `outcome` | 5.1 | 예 | |
| `via` | `speech` `manual` | 예 | |
| `attempts` | 정수 0~99 | 예 | |
| `repairs` | 정수 0~99 | 예 | |
| `k` | 정수 0~99 | 예 | 기준 낱말 중 들린 수. 모르면 0 |
| `n` | 정수 0~99 | 예 | 기준 낱말 수. 모르면 0 |

### 4.9 `play_round`

| 칸 | 꼴 | 필수 | 뜻 |
|---|---|---|---|
| `block` | 1 2 3 4 9 | 예 | |
| `play` | 영문 소문자 3~12 | 예 | 판 id (`playblocks.json`) |
| `round` | 정수 1~999 | 예 | 회 번호 |
| `outcome` | 5.1 | 예 | |
| `via` | `speech` `manual` | 예 | |
| `attempts` | 정수 0~99 | 예 | |
| `repairs` | 정수 0~99 | 예 | |
| `hit` | 정수 0~999 | 예 | 맞은 수 |
| `miss` | 정수 0~999 | 예 | 못 맞힌 수 |

### 4.10 `activity`

손으로 하는 블록 활동 한 번 (라디오, 수첩, 세트, 멘토, 일기, 심부름, 다시 말하기), 또는 나들이 미션 한 번의 결과 (`outing`).

| 칸 | 꼴 | 필수 | 뜻 |
|---|---|---|---|
| `block` | 0 1 2 3 4 9 | 예 | 0 은 블록 밖. `kind` 가 `outing` 일 때만 0 이다 (4.15) |
| `kind` | `radio` `notebook` `set` `mentor` `diary` `errand` `retell` `outing` | 예 | `outing` 은 나들이 미션 한 번의 결과 (4.15) |
| `ref` | 글자 0~40 | 예 | 자료 id. 없으면 빈 글자. `outing` 이면 미션 id |
| `outcome` | 5.1 | 예 | |
| `via` | `speech` `manual` | 예 | |
| `attempts` | 정수 0~99 | 예 | |
| `repairs` | 정수 0~99 | 예 | |

### 4.11 `outing_turn`

나들이 미션(`out/game/outings.json`, 설계 `docs/outings.md`)의 점수가 있는 차례 한 번. 블록 밖이라 `block` 칸이 없다 (4.15).
NPC 만 말하는 차례(`scored: false`)는 줄이 없다. 한 차례를 다시 해 봐도 줄은 하나고 `attempts` 가 센다.

| 칸 | 꼴 | 필수 | 뜻 |
|---|---|---|---|
| `mission` | 소문자 숫자 `_` 3~40 | 예 | 미션 id (`outings.json` `missions[].id`) |
| `turn` | 정수 1~99 | 예 | 그 미션 차례 표(`game.turns`)의 1부터 센 차례 번호 |
| `outcome` | 5.1 | 예 | 나들이 차례는 `pass` `near` `miss` 를 쓴다 (`skipped` 는 모양상 되지만 차례를 건너뛰는 길이 없다) |
| `via` | `speech` `manual` | 예 | |
| `attempts` | 정수 0~99 | 예 | |
| `repairs` | 정수 0~99 | 예 | |

### 4.12 `note`

| 칸 | 꼴 | 필수 | 뜻 |
|---|---|---|---|
| `block` | 1 2 3 4 9 | 예 | |
| `chars` | 정수 | 예 | 수첩에 쓴 글자 수. **글은 안 담는다** |

### 4.13 `pause`

| 칸 | 꼴 | 필수 | 뜻 |
|---|---|---|---|
| `on` | 참거짓 | 예 | 멈춤 켬 / 끔 |

### 4.14 줄 하나의 보기

```
{"v":1,"t":"session_start","s":10,"e":"h20261114100000-0001","device":"host","seat":"team","date":"2026-11-14","t0":"2026-11-14T10:00:00Z","t1":"2026-11-14T10:00:00Z","mode":"normal","seatA":"b","dataHash":"<64자>","game":"0.1.0"}
{"v":1,"t":"card_run","s":10,"e":"g20261114100007-0003","device":"guest","seat":"b","date":"2026-11-14","t0":"2026-11-14T10:31:00Z","t1":"2026-11-14T10:31:40Z","block":3,"id":"Q1-011","outcome":"miss","via":"speech","attempts":3,"repairs":1,"k":1,"n":5}
```

### 4.15 개정 2. 나들이 줄 (2026-10-10)

나들이 미션(설계 `docs/outings.md`)은 블록 안의 활동이 아니다. 시간 상한이 없고 블록 시계에 안 들고 세션 번호를 올리지도 않는다. 그래서 결과 줄에 **블록 밖** 표시가 필요하다.
사용자가 정한 것(2026-10-10): 나들이 기록을 더하고 이미 쓴 줄은 모두 그대로 맞아야 한다.

| 바뀐 것 | 어떻게 | 이유 |
|---|---|---|
| `block` 에 `0` | 모든 줄의 `block` 값 목록에 0 이 는다. 쓰는 것은 `activity` 의 `kind: outing` 뿐이다 | 블록 밖 |
| `activity.kind` 에 `outing` | 미션 한 번의 결과. `ref` = 미션 id, `outcome` = 통과 비율로 정한 미션 결과 (77% 이상 pass, 54% 이상 near, 그 밖 miss), `attempts` 1, `repairs` = 차례들의 `repairs` 합 (99 까지) | 경험치 단위 (`Docs/level_KO.md` 2장 `activity` 6/5/3, 열쇠 `outing:<id>`) |
| `activity.ref` 길이 | 24 -> 40 | 미션 id 가 31자까지 있다 |
| 줄 종류 `outing_turn` (4.11) | 점수 있는 차례마다 한 줄. 미션 id 와 차례 번호를 싣는다 | `line_wait` 는 블록과 줄 번호뿐이라 미션을 못 가린다. 경험치 단위 `line_wait` 2/2/1 (열쇠 `outing:<id>:<차례>`) |

- **판 번호 `v` 는 1 그대로다.** 칸을 빼지 않았고 값의 범위를 좁히지 않았고 필수 칸을 더하지 않았다. 새 줄 종류 하나와 값 몇 개를 더했을 뿐이라 옛 줄이 다 맞다. 그래서 모양 파일에 `revision`(지금 2)을 따로 둔다. `check_game.py` 는 개정 1 고정본(`tools/game/results_fixture/results_schema.rev1.json`)을 놓고 "모든 줄 종류, 필수 칸, 값 범위가 같거나 넓다"를 본다.
- `block 0` 은 `activity.kind outing` 에만 쓰는 약속이다. 모양 파일은 이를 못 말한다 (JSON Schema 부분집합에 칸끼리의 조건이 없다). 쓰는 쪽(게임의 `UHnlOutingSubsystem`)이 지키고 시험이 건다.
- 틱(`next.json`)은 나들이 줄을 읽지 않는다. 사다리와 어제 그거는 카드 줄만 본다. 나들이는 카드 간격을 안 움직인다.
- 고정본 `tools/game/results_fixture/outing.jsonl` 이 새 줄의 보기다. 개정 1 의 모양으로는 통과하지 못해야 한다 (새것을 시험한다는 뜻).
- 옛 게임이 새 `Data` 를 읽어도 줄 검사는 모양 파일을 읽으므로 새 줄을 알아본다 (C++ 에 칸 표가 없다). 지문(`dataHash`)이 다르니 두 노트북은 같은 개정끼리만 만난다 (10장).

### 4.16 줄 검사에서 모양 말고 더 보는 것

JSON Schema 가 못 말하는 규칙이다. 틱과 `check_game.py` 가 같이 건다.

| 규칙 | 까닭 |
|---|---|
| `t1` 이 `t0` 이상 | 시각이 거꾸로 가면 순서가 흔들린다 |
| `e` 의 첫 글자 `h` `g` 가 `device` `host` `guest` 와 같다 | 어느 노트북이 쓴 줄인지 한 칸에서 두 번 말한다. 어긋나면 베낀 줄이다 |
| `date` 가 달력에 있는 날이다 | 2월 30일 같은 날은 사다리 셈을 깬다 |
| `outcome` 이 `skipped` 일 때만 `attempts` 가 0 이다 | 해 보지 않은 것과 해 보고 못 한 것은 다르다 |

## 5. 낱말 뜻

### 5.1 `outcome`

| 값 | 뜻 | 사다리 (`spacing.byOutcome`) | 어제 그거 |
|---|---|---|---|
| `pass` | 첫 시도에 기준을 넘었다 | `up` 앱의 `markCardRun` | 안 든다 |
| `near` | 다시 하거나 고치고서야 넘었다 | `hold` 돈 날만 적고 칸은 그대로 | 안 든다 |
| `miss` | 기준을 못 넘기고 넘어갔다 (말 판정이 N번 뒤 진행) | `down` 앱의 `markCardStuck` | **든다** |
| `skipped` | 안 했다. 시간이 끝났거나 건너뛰었다 | `none` 아무것도 안 바꾼다 | 안 든다 |

**실패가 정상이다.** `miss` 는 벌이 아니다. 한 칸 내려 곧 다시 보게 하는 표시고 화면에 횟수를 안 적는다 (cards_person.md 8.2).
`near` 의 `hold` 는 앱에 없던 절차다. 기준서 8.4 는 오르거나 내리는 둘만 말한다. 어중간한 것을 오르게도 내리게도 안 하려고 정했다 (2026-10-08, 11장 물음 1).
이 표의 사다리 칸은 `sessions.json` 에 기계가 읽는 꼴로 있고 틱은 거기서 읽는다. 바꾸려면 `derive_game.js` 한 곳을 고친다.

지금 C++ 의 낱말에서 옮기는 법이다.

| 옛 | 새 | 까닭 |
|---|---|---|
| `pass` | `pass` | |
| `retry_pass` | `near` | 다시 하고서 넘었다 |
| `moved_on` | `miss` | N번 해도 못 넘고 넘어갔다 |
| `timeout` | `skipped` | 블록 시간이 끝나 안 했다. 해 보고 못 한 것이면 `miss` |
| `not_run` | `skipped` | |

### 5.2 `via`

| 값 | 뜻 |
|---|---|
| `speech` | 말 판정기가 들었다 |
| `manual` | 사람이 '했다' 단추를 눌렀다. 판정기가 없거나 죽은 날의 길이다. **누가 눌렀는지는 안 적는다** |

### 5.3 `seat`

앱의 **사람 자리**다. 사람1(첫 화면 이름 칸 `obA`)이 `a`, 사람2가 `b`. 그날의 역할 A/B 가 아니다 (그것은 `seatA` 가 말한다).
`team` 은 한 사람 몫이 아닌 줄이고 간격을 두 사람에게 똑같이 움직인다. 한 노트북이 한 사람만 듣는 날은 단위 줄이 그 사람 자리가 된다.

### 5.4 `device`

| 값 | 뜻 |
|---|---|
| `host` | 방을 연 노트북. 세션이 끝났는지는 host 의 줄만 센다 |
| `guest` | 들어온 노트북. 자기 사람 몫의 줄을 쓴다 |

방을 누가 여는지는 그날 자동으로 뽑힌다. 한 세션 안에서는 안 바뀐다. 다음 세션에는 바뀔 수 있다.

### 5.5 `e` 줄 번호

`<기기 글자 h|g><run 14자리>-<차례 4~6자리>` 예: `h20261114100000-0007`.
`run` 은 그 세션을 연 UTC 시각이고 차례는 그 노트북이 그 시도에서 쓴 줄 수다 (1부터).
**같은 세션 번호를 다시 열면(멈춘 뒤 다시 하기) `run` 이 다르니 줄 번호가 안 겹친다.**
한 번 쓴 줄 번호의 내용은 바뀌지 않는다.

### 5.6 `date`

세션을 연 날이다. 두 시간짜리 세션이 자정을 넘겨도 그 세션의 모든 줄은 연 날을 쓴다 (앱의 `today()` 규칙, T400).
간격 사다리의 날짜 셈이 이것을 쓴다. `t0` `t1` 은 UTC 라서 날짜로 못 쓴다.

### 5.7 `attempts` `repairs`

`attempts` 는 해 본 횟수다. 첫 시도가 1. 해 보지 않았으면 0 이고 그때 `outcome` 은 `skipped` 뿐이다.
`repairs` 는 고친 횟수다. NPC 가 "다시 해 보자" 고 했거나 팀이 되물은 횟수. repair 는 실패가 정상이라 이 수가 커도 `miss` 가 아니다.
둘 다 팀 값이고 점수가 아니다.

## 6. 두 노트북 합치기

| 번호 | 규칙 |
|---|---|
| R1 | guest 가 보낸 파일은 host 의 `Results/guest/` 에 **그대로** 쌓는다. 고치지 않고 지우지 않고 덮지 않는다 |
| R2 | 합치는 열쇠는 `(s, e)` 다. 파일 이름과 줄 순서는 열쇠가 아니다 |
| R3 | 열쇠가 같고 내용이 같으면 하나다 (같은 줄이 다시 온 것) |
| R4 | 열쇠가 같고 내용이 다르면 **충돌**이다. 정렬한 글자(아래 6.1)가 더 큰 쪽이 이기고 충돌 건수를 센다. 조용히 넘기지 않고 `next.json.merge.conflicts` 에 나온다 |
| R5 | 모양이 틀린 줄은 합치지 않고 센다 (`merge.rejected`). **파일 전체를 버리지 않는다.** `--strict` 이면 실패한다 |
| R6 | 합친 줄의 차례는 `(t0, t1, s, e)` 다. 입력이 어떤 차례로 와도 같다 |
| R7 | **host 가 기준이다.** 세션이 끝났는지는 host 의 `session_end` (`ended: done`, `mode: normal`)만 센다. guest 에만 있는 세션은 끝난 것이 아니다 |
| R8 | 늦게 온 guest 파일도 그냥 합친다. 지난 세션 줄이어도 된다. `next.json` 은 다시 돌리면 달라질 수 있다. 정상이다 |
| R9 | 멈춘 세션은 같은 번호로 다시 연다. 두 시도의 줄은 모두 사실이라 모두 남는다. 끝난 것은 `done` 이 있는 시도뿐이다 |

법칙 넷을 시험이 건다.

| 법칙 | 뜻 |
|---|---|
| 멱등 | 같은 줄을 몇 번 넣어도 한 번 넣은 것과 같다 |
| 교환 | host 와 guest 를 바꿔 넣어도 같다 |
| 결합 | 어느 둘을 먼저 합쳐도 같다 |
| 덮지 않음 | 합친 것은 어느 입력의 열쇠도 잃지 않는다 (합친 수는 어느 입력보다 작지 않다) |

### 6.1 정렬한 글자 (canon)

충돌을 가릴 때만 쓴다. 줄 객체를 이렇게 적은 글이다: 열쇠를 UTF-8 바이트 차례로 놓고, 공백 없이, 값은 JSON 그대로.
줄에는 정수와 글자와 참거짓뿐이다. 두 글을 **UTF-8 바이트로 견줘** 큰 쪽이 이긴다. 같은 내용이 열쇠 차례만 다르게 적혀 와도 같은 줄(R3)로 본다.

### 6.2 기준 구현과 시험값

`scripts/game_tick.js` 의 `mergeLines` 가 기준 구현이다. 시험값은 `tools/game/results_fixture/` 다.

| 파일 | 무엇 |
|---|---|
| `host.jsonl` `guest.jsonl` | 두 노트북이 쓴 줄. guest 에는 뒤쪽 세션의 줄 몇 개가 두 번 들어 있다 (다시 보낸 것) |
| `expected_merged.jsonl` | 둘을 합친 줄의 정해진 차례 (`t0`, `t1`, `s`, `e`). 칸 차례는 모양 파일의 `properties` 차례 |
| `state.json` `sessions.mini.json` | 틱에 주는 프로필과 작은 세션표 |
| `expected_next.json` | `--today 2026-11-16` 으로 돌린 틱의 정해진 답 |

C++ 의 host 합치기는 `host.jsonl` + `guest.jsonl` 에서 `expected_merged.jsonl` 과 **바이트까지** 같은 글을 내야 한다.

## 7. 앱 쪽. 덮지 않는다

앱의 대장 탭에 JSON 가져오기가 있다 (`imFile`). 그것은 `S=o` 로 **기록 통째를 덮는다.**
앱 감사 7번(2026-10-07)이 찾았다. PC 둘이 각자 결과를 내면 한쪽이 지워진다.

| 규칙 | 뜻 |
|---|---|
| 결과는 JSON 가져오기로 안 들어간다 | 그 길은 기록 백업과 되살리기 전용이다 |
| 결과는 틱만 읽는다 | 틱은 앱의 기록(`S`)에 쓰지 않는다. 메모리에서 처음부터 접고 `next.json` 만 쓴다 |
| 앱에 결과를 넣는 자리가 생기면 합친다 | `late/32_merge.js` 의 규칙(늦게 돈 쪽이 칸을 주고 돈 날은 합친다, `mgCard`)을 쓴다. `S=o` 를 부르지 않는다 |

틱이 사다리를 움직이는 길이다. 새 셈이 아니라 앱의 함수를 그대로 부른다.

| 줄 | 앱의 함수 |
|---|---|
| `card_run` `pass` | `markCardRun(id)` |
| `card_run` `miss` | `markCardStuck(id)` |
| `card_run` `near` | `cardSet` 으로 돈 날만 적는다 (`markCardRun` 이 제 날 전에 도는 가지와 같은 모양). 앱에 없던 절차다 |
| `seat` 가 `a` `b` | 그 사람 몫(`S.device`)에만. `team` 이면 둘 다 |
| 먼저 말을 여는 사람 | `roleOf` |
| 어제 그거 덱 | `rclDeck` |

## 8. 하루 끝 틱 (`scripts/game_tick.js`)

### 8.1 부르는 법

    node scripts/game_tick.js --results Results --state Brain/state.json --today 2026-11-16 --out Brain

| 인자 | 뜻 |
|---|---|
| `--results 경로` | JSONL 파일이나 폴더. 여러 번 줄 수 있다 |
| `--state 파일` | 선택. 프로필 `{"v":1,"start":...,"nextSession":...}`. `start` 는 앱의 시작일(어제 그거의 씨앗), `nextSession` 은 세션 번호의 바닥 |
| `--sessions 파일` | 기본 `out/game/sessions.json` |
| `--today 날짜` | 오늘. 없으면 마지막 세션 날 + 1일. **시계를 안 읽는다** |
| `--mode 값` | `normal` `busy` `short` 중 하나. 기본 normal. 그대로 적어 줄 뿐이다 |
| `--out 폴더` | `폴더/next.json` 을 임시 파일에 쓰고 이름을 바꾼다. 없으면 표준 출력 |
| `--merge-out 파일` | 합친 줄을 정해진 차례로 적는다 |
| `--strict` | 못 읽은 줄이 있으면 실패 (1) |
| `--selftest` | 시험 (9장) |

종료 코드는 0 됐다 / 1 쓰임새나 줄이 틀렸다 / 2 환경이 안 맞다 (앱이 낡았다, 세션 파일이 없다).
**틱이 실패하면 게임은 `next.json` 없이 돈다**: 세션 번호는 저장된 다음 번호, 자리는 `sessions.json` 의 규칙, 어제 그거는 비운다. 다른 판으로 안 바꾼다.
틱은 Node 와 틱 묶음(이 저장소의 사본이든 PC 의 `Tools\brain\` 이든)이 있는 노트북에서만 돈다 (11장 물음 2, 12장).

### 8.2 `next.json`

| 칸 | 뜻 |
|---|---|
| `v` | 1 |
| `today` | 오늘 (`--today`) |
| `s` | 오늘의 세션 번호 (8.3) |
| `through` | 끝난 정상 세션 중 가장 큰 번호. 없으면 0 |
| `gaps` | `through` 아래인데 끝난 줄이 없는 번호. 결과가 빠졌다는 신호다. 비어 있어야 정상 |
| `finished` | `s` 가 세션 수(288)를 넘었다 |
| `seatA` | `a` 나 `b`. 그날 먼저 말을 여는 사람 (8.3) |
| `mode` | `normal` `busy` `short` |
| `pick` | 그날의 한 판 id (`sessions.json` 의 `pick`) |
| `recall` | `pick` 이 `recall` 일 때만 덱. 아니면 `[]`. 항목 `{id, n, s, d}` (8.5) |
| `review` | 오늘 다시 낼 카드 id. 오늘 카드는 뺀다. id 차례 (8.4) |
| `unseen` | 지난 세션에 있었는데 한 번도 안 돈 카드 id (8.4) |
| `appHash` | 세션 파일을 뽑은 앱의 지문 (10.3) |
| `merge` | `{lines, events, duplicates, conflicts, rejected}`. 합친 건수 (6장) |

### 8.3 세션 번호와 먼저 말을 여는 사람

`s = max(state.nextSession, through + 1)`. 바쁜 날과 짧은 날은 `mode` 가 `busy` `short` 라 번호를 안 올린다 (`through` 는 `normal` 만 센다).
**멈춘 세션은 안 센다.** 그 번호를 다음 날 그대로 한다 (기준서 2.5).

`seatA` 는 앱의 `roleOf` 가 세션 번호로 정한다. 홀수 세션은 사람1(`a`), 짝수 세션은 사람2(`b`)가 먼저 연다 (개정문 11번).
`sessions.json` 에 같은 답이 두 꼴로 있다.

| 칸 | 뜻 |
|---|---|
| `roleRule` | `{"kind":"session_parity","odd":"a","even":"b","text":<사람이 읽는 글>}` |
| `roleVectors` | 288세션 각각 `{"s":1,"A":"a"}`. 앱의 `roleOf` 를 288번 걸으며 낸 값이다 |

C++ 는 규칙을 읽어 `s` 가 홀수면 `odd`, 짝수면 `even` 을 쓰고 `roleVectors` 288개와 한 개도 안 다른지 시험한다 (역할 벡터 시험).
`next.json.seatA` 가 있으면 그것이 우선이다. 규칙은 틱이 없을 때의 길이다.
`derive_game.js` 는 규칙을 먼저 적지 않는다. **벡터 288개에서 규칙을 읽고** 한 개라도 안 맞으면 규칙을 안 내고 실패한다.

### 8.4 간격 복습 덱 (`review`)

기준서 8.4(개정문 24)의 사다리 1, 3, 7, 21, 60, 120일이다. 오르면 `다음 날짜 = 그날 + 새 칸의 날수`.

| 줄 | 하는 일 |
|---|---|
| `pass` | 제 날이나 그 뒤면 한 칸 오른다. **제 날 전이면 칸을 안 올린다** (오늘 범위에 사흘 내리 뜨는 카드) |
| `near` | 제 날 전이면 돈 날만 적는다. 아니면 칸을 그대로 두고 다음 날짜는 **그 칸의 날수** 뒤. 새 카드면 1칸 |
| `miss` | 한 칸 내린다. 맨 아래 칸은 1일이라 다음 날 다시 온다. 새 카드도 1칸, 다음 날 |
| `skipped` | 아무것도 안 바뀐다 |

`review` 는 팀 합집합이다: 두 사람 중 누구든 제 날이 됐으면 든다. 사람별 사다리는 틱 안에만 있고 밖으로 안 나간다.
`sessions.json` 의 세션별 `review` 는 **다 맞혔다고 친 명목 일정**이고 `next.json.review` 가 실제다.
다 통과한 기록을 틱으로 접으면 명목과 같은 덱이 288세션 모두 나온다 (`--selftest` 의 명목 1년 판).

`unseen` 은 끝난 세션에 일정이 있었는데 한 줄도 `pass` `near` `miss` 가 없는 카드다. `skipped` 만 있으면 사다리에 안 들어가서
이대로 두면 영영 안 돌아온다. 오늘 카드는 뺀다. 게임은 `review` 를 돌고 시간이 남으면 `unseen` 을 돈다.

### 8.5 어제 그거 (`recall`)

**`pick` 이 `recall` 인 날만 덱이 나온다.** 앱의 `rclDeck` 을 그대로 부르고 `ranOn` 만 결과 기록으로 바꿔 끼운다.

| | 앱의 어제 그거 | 게임 (틱) |
|---|---|---|
| 무엇에서 짜나 | **돈** 카드 (`ranOn`) | 결과에서 실제로 **못 한(miss)** 카드 (`runtime.recallRule.outcomes`) |
| 되돌아보기 | 어제, 사흘 전, 이레 전을 **달력 날**로 | 1, 3, 7 **세션** 전 (`recallRule.back`, 앱의 `RCL.days` 를 그대로 읽는다) |
| 일요일 | 월요일의 어제가 일요일이라 늘 빈다 (앱 감사 22번, 2026-10-07) | 세션으로 세니 안 빈다 |
| 시작 조건 | 세 날이 다 있어야 연다 | 없는 날은 건너뛰고 있는 만큼 돈다 (T274) |
| 장수 | 열 장 | `recallRule.max` (앱의 `var d={end:10}` 에서 읽는다) |
| 같은 카드 | 날마다 따로 뽑아서 같은 카드가 두 번 든다 | 1, 3, 7 세션 전에 다 못 한 카드는 **가장 가까운 세션 몫으로 한 번만** 든다 (`n` 이 작은 쪽). 맨 아래 칸에서 되풀이해 못 한 카드가 흔해서, 그대로 두면 열 장 덱에 같은 카드가 두 번 나온다 |
| 섞는 차례 | `roundOrder(roundSeed("recall", n))` | 같은 함수. 씨앗의 날짜 자리에는 세션이 하루씩 오르는 가짜 달력을 놓는다 |
| 기록 | 이 기기 것 | 합친 결과 (두 노트북) |

덱 항목은 `{id, n, s, d}` 다. `n` 은 몇 세션 전인지, `s` 는 그 세션 번호, `d` 는 그 세션을 연 날이다.
**없으면 비운다.** 다른 판으로 안 바꾸고 그 시간은 블록 본 활동이 쓴다 (UE5 설계 감사 4.7, 2026-10-07).
`miss` 만 담는 것은 정한 일이지만 바꿀 수 있다: `derive_game.js` 의 `recallRule.outcomes` 한 곳 (11장 물음 3).

### 8.6 정해져 있다

같은 합친 줄과 같은 프로필과 같은 `--today` 면 `next.json` 이 바이트까지 같다. 난수, 시계, 시간대가 없다 (`TZ` 를 UTC 로 박는다).
입력 순서와 중복은 결과를 안 바꾼다 (6장). `merge` 칸만 입력에 따라 다르다.
틱이 낡은 앱으로 돌지 않게 `sessions.json` 의 `appHash` 를 지금 앱과 견주고 다르면 종료 코드 2 로 선다.

### 8.7 틱이 안 하는 것

연속일, 회복권, 주간 퀘스트, 배지는 `next.json` 에 아직 없다. 앱의 `S.days` 가 있어야 하는 셈이라 따로 정한다 (11장 물음 4).
합친 결과로 앱의 대장을 갱신하지도 않는다 (7장).

## 9. 검사와 고정본

`python3 scripts/check_game.py` 가 이 문서의 약속을 건다. 숫자는 문서가 아니라 파일에서 읽는다.

| 판 | 무엇을 보나 |
|---|---|
| 판 번호 | `sessions.json` 에 `schemaVersion` 이 있고 `results_schema.json` 의 `version` 과 같다 |
| 앱 지문 | `sessions.json` 의 `appHash` 가 지금 앱(english.html + out/app/plays.js)의 지문과 같다. 낡았으면 실패 |
| 모양 판 번호 | 칸 이름이 바뀌었는데 `schemaVersion` 을 안 올렸으면 실패. 모양 지문 표가 `check_game.py` 에 있다 |
| 먼저 말을 여는 사람 | `roleRule` 이 `session_parity` 로 구조화돼 있고 `roleVectors` 288개를 규칙이 한 개도 안 틀리고 낸다 |
| 사다리 규칙 | `spacing.byOutcome` 이 5.1 표와 같다. `recallRule` 이 8.5 표와 같다 |
| 모양 파일과 문서 | 줄 종류 12가지, 칸 이름, 필수 여부, `outcome` `via` `seat` `device` 값이 4장 5장 표와 같다 |
| 개정은 더하기만 | 개정 1 고정본의 줄 종류, 필수 칸, 값 범위가 지금 모양에서 같거나 넓다 (4.15). 옛 줄이 다 맞다 |
| 고정 기록 | 고정본의 모든 줄이 모양 파일을 통과한다 (파이썬이 따로 건다). 나들이 고정 줄(`outing.jsonl`)은 새 모양만 통과하고 합쳐도 안 사라진다 |
| 틱 시험 | `node scripts/game_tick.js --selftest`. 줄 검사(맞는 줄과 틀린 줄 변형), 합치기 법칙, 사다리 손계산, 입력을 안 건드리는가, 명목 1년, 자리 288개 |
| 독립 계산 | 파이썬이 기준서 8.4 문장으로 고정 기록을 다시 세어 `expected_next.json` 의 `s` `seatA` `review` `unseen` `recall` 과 견준다. 앱 코드를 안 쓰는 계산이다 |
| 지문 표 (`--manifest`) | `manifest.json` 이 지금 파일과 같고 `pending` 이 거짓말을 안 한다. 시험값도 본다. 맨 뒤에서 돈다 (10장) |

고정 기록의 하루들 (`tools/game/results_fixture/`):

| 세션 | 날 | 보는 것 |
|---|---|---|
| 1~3 | 11-02~04 | 새 카드, 같은 카드가 사흘 내리 (제 날 전은 칸 안 올림), 두 사람의 결과가 갈린다 |
| 4~6 | 11-05~07 | 못 한 카드가 내려간다. 4번 세션의 못 한 카드가 7세션 뒤 어제 그거에 든다 |
| 바쁜 날 | 11-09 | `mode: busy`. 번호가 안 오른다. 심부름 한 줄 |
| 7, 8 | 11-10, 11 | 8번 세션의 못 한 카드가 3세션 뒤 어제 그거에 든다 |
| 9 | 11-12, 13 | 첫 시도는 `session_end` 없이 멈추고 다음 날 다시 해서 끝난다 |
| 10 | 11-14 | 어제 그거의 1세션 전. 건너뛴 카드 한 장이 `unseen` 에 남는다 |
| 짧은 날 | 11-15 | `mode: short`. 번호가 안 오르고 카드 두 장이 사다리를 움직인다 (한 장은 복습 덱에서 빠지고 한 장은 남는다) |
| 오늘 | 11-16 | 세션 11, `pick` 이 `recall`, 먼저 말을 여는 사람은 `a` |

고정본을 다시 쓰려면 (줄 모양이나 규칙이 바뀌었을 때):

    node scripts/game_tick.js --regen-fixture
    git diff tools/game/results_fixture
    python3 scripts/check_game.py

자기 구현으로 자기 답을 다시 쓰는 것이라 **바로 믿지 않는다.** diff 를 눈으로 보고 독립 계산 판이 통과하는지 본다.

## 10. 데이터 지문

두 노트북이 같은 자료를 읽는지 보는 지문이 둘이다.

### 10.1 `dataHash`

게임이 Data 폴더에서 센다. 저장소의 `out/game/manifest.json` 이 기준값을 들고 있다.

    대상   Data/*.json 중에서 manifest.json 과 *.local.json 을 뺀 것. 폴더 안쪽은 안 본다
    차례   파일 이름 ordinal 순서 (글자 코드 순서. 대문자가 소문자보다 앞이다)
    줄     이름 + ":" + 그 파일 바이트의 sha256 (소문자 16진수 64자)
    지문   줄마다 LF 를 붙여 이은 글(끝에도 LF 하나)을 UTF-8 바이트로 보고 sha256 (소문자 16진수)

C++ 로 옮기면 이 모양이다.

    TArray<FString> Names = 폴더의 *.json 이름, "manifest.json" 과 ".local.json" 으로 끝나는 것을 뺀다
    Names.Sort([](const FString& A, const FString& B){ return A.Compare(B, ESearchCase::CaseSensitive) < 0; })
    FString Text;
    for (Name : Names) Text += Name + TEXT(":") + SHA256Hex(파일 바이트) + TEXT("\n");
    DataHash = SHA256Hex(UTF8(Text))      // 소문자

Data 폴더는 이 저장소의 `out/game/*.json` 전부와 `out/data/cards.json` 을 **바이트 그대로 복사한 것**이다
(`sessions.json scenes.json town.json cards.json results_schema.json` 과 다른 갈래가 내리는 `spelling_rule.json judge.json replies.json voicelist.json deck_names.json`, 선택 자료 여덟 `sets.json emergency.json playblocks.json tally.json hold.json transcripts.json cues.json audiolen.json` 은 game_data.md 10장, 세션 번호 기준 구간표 `acts.json` 은 game_data.md 11장). 그래서 선택 자료가 바뀌면 `dataHash` 도 바뀐다.
`results_schema.json` 도 센다. 줄 모양이 다른 노트북끼리는 만나면 안 되기 때문이다.
복사는 바이트로 한다. `Get-Content`/`Set-Content` 나 git 의 autocrlf 가 줄바꿈을 바꾸면 지문이 바뀐다.

이름은 ASCII 만 쓴다. 이름 차례를 글자 코드로 센다는 것은 ASCII 에서만 언어마다 같기 때문이다.

**시험값.** 아래 다섯 파일을 가진 폴더에서 `manifest.json` `x.local.json` `c.txt` 는 빠지고 `B.json` 이 `a.json` 앞에 온다.

| 이름 | 바이트 |
|---|---|
| `a.json` | `{"a":1}` 와 LF 하나 |
| `B.json` | `[]` (줄바꿈 없음) |
| `manifest.json` | 아무거나 (빠진다) |
| `x.local.json` | 아무거나 (빠진다) |
| `c.txt` | 아무거나 (json 이 아니라 빠진다) |

    B.json:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945
    a.json:e346432021b04179518d9614f3560ccd71354a4ee101ddcb893d6959a9d6301c

    dataHash = bc65574e3451669e9be07235ba8ae7bac0f2abcbfce1f9232565f544133bf515

기준 구현은 `scripts/derive_game_manifest.py` 의 `data_hash()` 고 같은 시험값이 그 파일의 `TEST_VECTOR` 와
`manifest.json` 의 `testVector` 에 있다. 게임의 지문 시험은 `manifest.json` 의 `testVector` 를 읽어 같은 값을 내야 한다.

### 10.2 `manifest.json`

| 칸 | 뜻 |
|---|---|
| `dataHash` | 위 10.1 의 값 |
| `files` | 파일마다 `{file, bytes, sha256, from}`. 이름 차례 |
| `pending` | 아직 안 내려온 파일 이름. 지문은 있는 파일로만 센 것이다 |
| `unlisted` | 적어 두지 않았는데 지문에 들어간 파일 |
| `algorithm` `testVector` | 위 10.1 을 기계가 읽는 꼴로 |

`files[]` 의 `file` 과 `sha256` 은 지금 로더(`VerifyManifest`)가 읽는 칸 이름 그대로다. 그 로더는 불러온 파일만 해시를 견주고 지문은 불러온 차례로 세는데, 계약은 폴더의 *.json 전부를 이름 차례로 센다 (10.1).
게임은 접속할 때 자기 `dataHash` 를 서로 보낸다. 다르면 "데이터가 다르다. 두 노트북에서 sync 를 다시 돌린다" 로 거절한다 (improve.md 8장).
Data 의 지문이 `manifest.json` 의 것과 다르면 sync 가 덜 됐거나 줄바꿈이 바뀐 것이다.

### 10.3 `appHash`

`sessions.json` 맨 위의 `appHash` 는 그 파일을 뽑은 앱의 지문이다. **10.1 과 같은 꼴**로 센다.
파일 둘 `english.html` 과 `eng2p/out/app/plays.js` 를 저장소 뿌리 기준 이름으로 쓴다. 조각(`app/`)이 아니라 이 둘인 까닭은 주석이다.
주석은 조각에만 남아서 주석만 고친 날 조각 지문이 바뀌면 헛경보다.
**줄바꿈 CRLF 는 LF 로 바꿔서 센다.** 윈도우 체크아웃(git autocrlf)이 줄바꿈을 바꿔도 같은 지문이어야 PC 에서 틱이 날마다 낡았다고 서지 않는다.
(10.1 의 `dataHash` 는 바이트 그대로 센다. 그쪽은 두 노트북이 같은 바이트를 갖는지가 목적이라 저장소의 줄바꿈을 지켜야 한다.)

| 누가 | 하는 일 |
|---|---|
| `derive_game.js` | 뽑을 때 적는다 |
| `check_game.py` | 지금 앱의 지문과 견준다. 다르면 실패 (빠른 판에서도 낡음을 잡는다) |
| `game_tick.js` | 같은 지문을 견주고 다르면 종료 코드 2 |

## 11. 못 한 것과 물음

| # | 물음 또는 못 한 것 | 기본 |
|---|---|---|
| 1 | `near` 를 사다리에서 어떻게 다루나 | 칸을 그대로 둔다 (`hold`). 기준서 8.4 에 없는 절차라 개정문이 필요하면 후속으로 간다. 바꾸려면 `derive_game.js` 의 `byOutcome` |
| 2 | 틱은 Node 와 저장소가 있는 노트북(PC1)에서만 돈다. PC2 는 패키지만 있다 (improve.md 8장). 방을 PC2 가 열면 | 합친 `Results/` 를 PC1 에 복사해 돌리거나 방을 늘 PC1 이 열게 고른다. 사용자가 정할 일 |
| 3 | 어제 그거를 `miss` 만 담으면 잘 하는 날 덱이 빈다 | 비운다. `near` 도 담으려면 `recallRule.outcomes` 에 넣는다 |
| 4 | 연속일, 회복권, 주간 퀘스트, 배지를 `next.json` 으로 | 아직 안 했다. 결과의 날과 앱의 `S.days` 를 잇는 규칙이 먼저 필요하다 |
| 5 | `review` 가 한꺼번에 많이 쌓인 날(결석 뒤) 어느 것부터 도나 | id 차례다. 오래 밀린 것부터가 낫지만 아직 안 했다 (명목 일정에서 하루 최대 27장, 평균 8장) |
| 6 | 사람별 사다리가 한쪽 노트북 줄이 빠지면 그쪽 사람 몫만 비어 버린다 | `gaps` 가 세션 단위로만 알린다. 사람 단위 빠짐은 못 본다 |
| 7 | 한 세션 안에서 방을 연 쪽이 바뀌는 경우(host 가 죽고 guest 가 이어받음) | 안 다룬다. 새 시도로 보고 R9 로 처리된다 |
| 8 | 줄에 `place` 같은 한국어 낱말이 있다 | 합치기 비교가 바이트 기준이라 괜찮다. 영어 칸에는 안 쓴다 |

## 12. PC 에서 틱이 도는 길 (2026-10-09)

PC1 에는 Node 도 이 저장소도 없다. 틱이 PC 에서 돌려면 **Node 와 틱 묶음** 둘이 있어야 하고 둘 다 해시를 맞춰 받는다.
게임 저장소의 `Tools\get_node.ps1` `Tools\sync_tick.ps1` `Tools\run_tick.ps1` 이 한다.

| 무엇 | 어디서 오나 | 놓이는 곳 (`D:\HonoluluGame`) | 맞추는 것 |
|---|---|---|---|
| Node 휴대판 | nodejs.org 공식 Windows zip (22 LTS). 설치 없음 | `Tools\node\node.exe` | zip 의 SHA-256 을 같은 폴더의 `SHASUMS256.txt` 와 스크립트에 박은 값 둘에 맞춘다. 푼 `node.exe` 가 버전을 답한다 |
| 틱 묶음 | `out/tick/manifest.json` (`derive_tick_bundle.py`)이 적은 29개: `game_tick.js` + 앱 조각 + `cards.js` + `results_schema.json` + `english.html` | `Tools\brain\` (**저장소와 같은 자리 배치**라 틱을 안 고친다) | 파일마다 크기와 SHA-256, 표의 `tickHash`, `appHash` 가 `sessions.json` 의 것과 같다 |
| 부르기 | 게임이 방장 노트북에서 끝날 때 자동 (`-HnlBrainScript=Tools\brain\eng2p\scripts\game_tick.js`) 이나 손으로 `Tools\run_tick.ps1` | `<LocalRoot>\Brain\next.json` | 같은 인자 (8.1). 틱이 실패하면 게임은 `next.json` 없이 돈다 |

처음 한 번:

    powershell -ExecutionPolicy Bypass -File Tools\get_node.ps1
    powershell -ExecutionPolicy Bypass -File Tools\sync_data.ps1
    powershell -ExecutionPolicy Bypass -File Tools\sync_tick.ps1
    powershell -ExecutionPolicy Bypass -File Tools\run_tick.ps1        # 결과가 있으면 손으로 한 번 돌려 본다

게임에는 `-HnlBrainScript=D:\HonoluluGame\Tools\brain\eng2p\scripts\game_tick.js` 를 준다. node 는 게임이 `-HnlNode=` 나
`Tools\node\node.exe` 나 PATH 의 `node` 순으로 찾는다.

**낡음을 세 겹으로 막는다.** (1) `derive_tick_bundle.py` 는 표의 `appHash` 가 `sessions.json` 의 것과 다르면 표를 안 쓴다.
(2) `run_tick.ps1` 은 놓인 묶음을 표로 다시 세고, `Data\results_schema.json` 이 묶음의 것과 다르면 종료 코드 3 으로 선다.
(3) 틱 자신이 `sessions.json` 의 `appHash` 를 묶음의 앱과 견주고 다르면 종료 코드 2 로 선다 (8.6).

**쉰 날 아침.** 게임은 `next.json` 의 `today` 가 오늘이 아니면 그 파일을 **버리고** 저장된 번호와 `roleRule` 로 논다 (복습 덱 없이).
틱은 플레이한 날의 다음 날로 `next.json` 을 만들기 때문에 하루를 쉬면 그 파일이 하루 늦다. 쉰 날의 아침에는
`Tools\run_tick.ps1 -Morning` 을 게임 전에 한 번 돈다 (오늘을 이 PC 의 날짜로). 복습 덱은 날짜가 늦을수록 늘기만 해서
(제 날이 된 카드가 더해진다) 어제 덱을 품는다. 게임이 이것을 스스로 하지는 않는다 (남은 일).

**검사.** `python3 scripts/check_tick_e2e.py` 가 49일을 하루씩 이어 간다: 아침에 `next.json` 읽기, 낮에 그 덱으로 놀며 방장 줄과 손님 줄 쓰기,
저녁에 게임과 같은 인자로 틱 부르기. 보통 날 43, 멈춘 날, 바쁜 날 둘, 짧은 날, 쉰 날 둘, 손님 파일이 하루 늦게 오는 날 일곱이고,
세션 31~36(다지기 주)과 어제 그거 날 11 27 43 을 지난다. 매일 앱 코드를 안 쓰는 파이썬 계산(기준서 8.4 문장)과
`s` `through` `gaps` `seatA` `pick` `review` `unseen` `recall` `merge` 를 견주고, 입력을 바꿔(한 벌 더, 뒤집어 한 파일에 CRLF 와 BOM,
손님 줄을 방장 파일에 이어 붙임, 합친 글 다시 넣기) 같은 답인지, Results 가 그대로인지를 본다. 카드 넷의 212일(간격 1 3 7 21 60 120,
near, 제 날 전, 못함, 건너뜀, 사람별 칸)은 손으로 센 표와 견준다. `--break` 는 틀린 틱 열여덟 가지를 만들어 다 잡는지 본다.
틱은 표가 적은 29개만 복사한 묶음으로 돈다. 묶음이 모자라면 PC 에서 돌기 전에 여기서 실패한다.

이 검사가 찾은 틈:

| 틈 | 고친 곳 |
|---|---|
| 어제 그거 덱에 같은 카드가 두 번 든다 (1, 3, 7 세션 전에 다 못 한 카드) | `game_tick.js` `recall()` 가 가까운 세션 몫으로 한 번. 8.5 표 |
| 게임이 바쁜 날도 `nextSession` 을 올려 틱이 세션 하나를 건너뛴다 | game 저장소 `SessionSubsystem.cpp` `EndDay` (보통 날만 올린다). `--break` 의 "게임이 바쁜 날 번호를 올림" 이 그 틈을 만든다 |
| PC1 에 Node 가 없어 게임이 `node` 를 못 찾는다 | `Tools\get_node.ps1` 과 `LaunchBrainTick` 의 `-HnlNode=` |
| 쉰 날 뒤 `next.json` 이 하루 늦어 게임이 버린다 | `run_tick.ps1 -Morning` (손으로). 게임이 스스로 다시 돌리는 것은 남았다 |

**기계가 안 보는 것: 두 사람이 그 화면 앞에서 영어를 입 밖에 내는가.** 이 문서는 줄이 맞는지, 합쳐지는지, 같은 답이 나오는지까지만 건다.
