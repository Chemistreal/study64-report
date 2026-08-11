# eng2p 제작 지침

신뢰도: A 생성 (제작 관리)

2인 전용 영어 1년 과정의 교재 제작 저장소다.
상위 규격은 docs/spec.md 이며, 이 파일과 충돌하면 spec.md가 우선한다.

## 첫 3줄 요약

1. 제작 전에 docs/spec.md 의 해당 규격 절을 읽는다.
2. 제작 후 반드시 `python3 scripts/all.py` 를 돌린다. 통과 못 하면 미완성이다.
3. 확신 없는 영어 표현은 지어내지 말고 B등급으로 표시한다. 이것이 이 프로젝트의 1순위 규칙이다.

## 이 프로젝트의 구조적 위험

학습자 2인은 영어 제로다. 내가 틀려도 검출할 사람이 없다.
다른 프로젝트는 사용자가 해당 분야 전문가라 검출기 역할을 했지만
여기에는 그 장치가 없다.

따라서 다음을 지킨다.

- 그럴듯한 영어를 자신 있게 쓰지 않는다. 확신과 정확성은 다르다.
- 실제 빈도를 모르는 표현은 A등급으로 쓰지 않는다.
- 슬랭은 전면 금지다. 예외 없다.
- 모르면 B등급으로 표시하고 넘어간다. 검증은 사용자가 대화에서 한다.

## 신뢰도 등급

모든 제작물 상단에 등급을 표시한다.

- A: 커리큘럼, 순서, 한국어 대조 설명, 드릴 구조, 문법 설명, 학습용 기능 대화
- B: 연어와 청크 목록, 레지스터, 화용 표현, 사어 판정, 난이도 등급
- C: 음성 자료, 현행 구어 빈도, 슬랭, 시사 레퍼런스, 지역 변이

음성은 C를 둘로 가른다. docs/audio_intake.md 를 따른다.

- C-real: 사람이 실제로 말한 것의 녹음. 1층과 2층 둘 다 가능
- C-gen: 기계가 생성한 음성. **1층 전용.** 2층을 대체하지 못한다

외부에서 만든 음성은 대본 없이 받지 않는다.
나는 음성을 검사할 수 없고 대본은 검사할 수 있다.
Q1 소리 트랙의 통과 판정은 C-real 로만 한다. C-gen 은 연습에만 쓴다.

B등급 항목은 `state/verify_queue.md` 에 자동으로 쌓는다.
`python3 scripts/collect_b.py` 를 실행하면 큐가 갱신된다.

검증로그는 형식이 정해져 있다. 이 형식을 갖춘 것만 완료로 센다.

```
검증로그: 2026-08-07 / 근거 / 통과 / 조치
```

날짜로 시작하고 통과, 보류, 기각 중 하나가 있어야 한다.
"나중에 확인한다" 는 로그가 아니라 예고문이고 대기로 센다.
C등급은 만들지 않는다. 조준표에 채집 지시만 쓴다.

## 제작 순서

1. 운영 매뉴얼, 진행 대장, 회전 대장
2. Q1 강의 24편
3. Q1 카드 150장, 세트 72개, 조준표 1권
4. **8주 실행 후 피드백. 원래는 여기서 멈춘다.**
5. Q2 → Q3 → Q4

4단계 정지는 사용자가 세 번 다 진행을 지시해 지나갔다.
2026-08-07 에 모든 의사결정 기준을 제작자에게 넘겼다.
기준서 개정 8건도 그 지시로 다 결정했다. state/journal.md 5장에 있다.

## 세션 시작 절차

```bash
cat state/status.md          # 자동 집계 (파일 개수)
cat state/journal.md         # 마지막 완료 지점, 개정 대기
cat state/rotation.md        # 주제 조합 편중 확인
ls out/lectures | tail -3    # 직전 제작물 확인
```

직전 제작물 1개를 열어 문체와 구조를 대조한 뒤 제작한다.

## 세션 종료 절차

```bash
python3 scripts/all.py
```

**한 줄이다.** 파생 마흔과 검사 마흔셋과 상태 갱신 셋, 여든여섯을 정해진 순서로 돈다.
브라우저 검사까지 다 돌면 6분쯤 걸린다. 화면 검사가 브라우저를 띄운다. 손볼 때는 `--quick` 으로 파생과 대조만 돈다.

순서에 이유가 있다. 파생을 먼저 해야 옛 값을 검사하지 않는다.
검사가 열이 되고 나서 순서를 기억으로 돌리는 것을 그만뒀다.
**뺀 검사는 안 돌린 것이 아니라 통과한 것처럼 보인다.**

하나라도 실패하면 종료 코드가 1이고 실패 줄만 따로 모아 보여 준다.

## 파일 배치

```
docs/spec.md            상위 규격. 수정 금지. 개정은 사용자만
docs/audio_intake.md    외부 제작 음성 반입 규격 (승격 확정. 기준서 9장 부속)
docs/audio_timing.md    소리 시간 표시 조사 (T126). 어림 표의 근거와 한계
docs/spec_amendments.md 기준서 개정문 8건. 사용자가 spec.md 에 붙일 문안
docs/roadmap.md         완료까지의 턴 단위 계획. 매 턴 갱신한다
docs/collab.md          공동 개발 규약 (종료. 기록으로만 남긴다)
tasks/                  조수 지시서 (종료. 기록으로만 남긴다)
templates/              각 산출물 템플릿
out/lectures/           eng2p_q1_l001.md
out/cards/              eng2p_card_q1_001_050.md
out/sets/               eng2p_set_w01.md
out/input/              eng2p_input_q1.md
out/manual/             운영 매뉴얼, 진행 대장, 분기 점검 보고서
out/audio/              eng2p_audio_q1_001.md (대본만. 음성 파일은 넣지 않는다)
state/status.md         진행 상태 (자동 생성)
state/journal.md        제작 일지 (수기). 단계 진척, 기준서 개정 결정
state/rotation.md       주제 조합 회전 대장
state/verify_queue.md   B등급 검증 대기열
state/verify_list.md    근거 없는 표현 목록. **무엇을 볼지가 여기 있다**
scripts/check.py        제작물 규격 검사
scripts/check_media.py  미디어 카탈로그 검사
scripts/check_cards_plan.py 카드 유형 총량을 기준서 8.1과 대조
scripts/derive_handout.py 강의에서 강의록을 파생. 강의의 검사기이기도 하다
scripts/check_page.py  강의록이 A4 앞뒤 두 면에 들어가는지 잰다
scripts/check_refs.py  카드 번호와 미디어 id 와 강 참조가 실제로 있는지 대조
scripts/derive_index.py 48주 96강 색인을 세트의 대응강의 줄에서 파생
scripts/derive_input.py 조준표 넷을 파생. **48주 과제가 빠짐없이 한 번씩 나오는지 본다**
scripts/derive_pairs.py 거울 판 최소대립쌍. **대본에 있는 낱말끼리만.** B등급
scripts/derive_swaps.py 한 줄 바꾸기 판의 바꿀 낱말. 낱말은 A등급, 가깝다는 것은 B등급
scripts/derive_listen.py 내 소리는 네가 판의 듣는 쪽 지시. **블록 2 근거표 넷에서 온다**
scripts/derive_relay.py 전달 놀이가 쓸 줄. 낱말 6~14. **소리 자리는 어림이다**
scripts/derive_chunks.py 이어달리기가 쓸 청크. 대본에서 셌다. **청크 목록은 B등급**
scripts/derive_halves.py 둘이 한 문장의 앞뒤 토막. **붙이면 원문이다.** A등급
scripts/derive_ladder.py 배속 사다리 규격. **bench_music.md 6장이 원본.** 못 찾으면 실패
scripts/derive_wall.py 3초 벽이 띄울 단서. **124장 중 서른은 재료가 비어 있다.** B등급
scripts/derive_situ.py 한 사람만 본다의 상황 카드. **B면을 안 담는다.** 안 실으면 안 샌다
scripts/derive_wave.py 파장의 격식 눈금 다섯. **2와 4에 새 이름을 안 짓는다.** B등급
scripts/derive_whose.py 누구 말이야의 쓸 자리. **register 를 안 담는다.** 정답이 없는 판
scripts/derive_reask.py 되묻기 강도 세 단. **보기는 대본 그대로다.** 없는 단은 없다고 적는다
scripts/derive_cutin.py 끼어들기 신호 시각 예순네 벌. **무작위를 안 쓴다.** 두 기기가 같은 벌
scripts/derive_clash.py 말 겹치기가 쓸 두 줄. **한 회가 두 줄이다.** 대본 그대로. A등급
scripts/derive_flip.py 거꾸로 판정이 쓸 카드. **정답과 해설을 안 담는다.** Q2 이후 68장
scripts/derive_apart.py 따로 쓰고 같이 펴기의 물음. **강의에 물음이 없다.** 소재만 뽑는다
scripts/derive_onepick.py 오늘의 한 판이 그날 열 판. **그날 열리는 판만.** 288일 무작위 없음
scripts/derive_blocks.py 스무 판이 블록 넷 중 어디에 붙나. **블록 1은 비어 있고 그것이 맞다**
scripts/derive_tally.py 판마다 셈을 합치는 법 넷. **합친 값을 저장소에 안 남긴다**
scripts/derive_quest.py 주마다의 공동 퀘스트. **quest.md 5장 표가 원본이다**
scripts/derive_badge.py 공동 배지 스물. **새 이름을 안 짓는다.** PASS 에서 옮긴다
scripts/derive_voice.py 되돌아보기 녹음이 읽을 줄. **대본 그대로다.** 앱이 소리를 안 든다
scripts/derive_ahead.py 기준서 12장이 예고한 세 자리. **기준서 표가 원본이다.** 때 맞춰 뜬다
scripts/derive_track.py 트랙 여섯의 진도표. **세는 것이 아니라 차림표에서 읽는다**
scripts/derive_hold.py 판마다 정보를 쥐는 자리. **어디인지만 알려 주고 누가 맡을지는 안 정한다**
scripts/derive_more.py 못 넘은 조건을 어디서 더 도나. **되돌리지 않고 그 자리를 더 돈다**
docs/blocks.md         블록 넷 현행 진단. 무엇이 화면에 있고 무엇이 종이에만 있나
docs/pair.md           기기 둘. 무엇이 갈리고 무엇이 건너가야 하는가. **셈은 코드로 글은 파일로**
docs/merge.md          합치기. **덮는 것이 아니다.** 갈래 넷과 묻는 일곱
docs/growth.md        늘어난 것 보여 주기. **점수가 아니라 소리다.** 앱이 소리를 안 든다
                      6장이 나란히 듣기다. **어디를 듣는지만 가리키고 판정 안 한다**
docs/ahead.md         미리 아는 것. **묻지 않는다.** 문제만 적고 대응을 안 적으면 겁주기다
                      10장이 개정 요청 봉투다. **안은 안 보이고 몇 장인지는 보인다**
docs/quest.md         공동 퀘스트. **개인 기여도는 안 보여 준다.** 셀 수 있는 값 다섯
docs/streak.md        공동 연속일과 회복권. **날을 세지 사람을 안 센다.** 미리 선언해야 쓴다
docs/round.md          같은 판. **망 없이 셈으로 맞춘다.** 시계에서 아무것도 안 낸다
docs/engine.md        공동 진행 엔진 F단계 결산. **만든 것은 대부분 무엇을 안 하는가다**
docs/track.md         트랙별 진도. **고르지 않은 것이 정상이다.** 사람별로 안 가른다
docs/cards_person.md  카드 간격을 사람별로. **쌓되 나란히 안 놓는다.** 개정문 16번이 근거
docs/gap.md           갈릴 때. **기준서가 진도 격차를 위험으로 안 본다.** 갈리는 칸 넷
docs/split.md         갈릴 때 G단계 결산. **조건이 붙은 자리는 안 뜨는 것이 정상처럼 보인다**
                      5장이 역할 교대다. **주마다 한 번씩 멈춘다.** 개정문 11번이 그 자리
docs/year.md          1년을 통째로 돈다. **앱이 아는 것을 사람이 다시 적고 있었다**
                      6장이 밀린 해다. **오백 날이 넘게 걸리는 해가 있다**
                      7장이 1년치 합치기다. **이을 것과 골라야 할 것을 가른다**
scripts/derive_bundle.py 강의록을 분기마다 한 파일로 묶는다 (인쇄용)
scripts/derive_data.py  앱이 읽는 JSON 을 파생. 마크다운이 원본이다
scripts/derive_transcripts.py 대본 52편을 script 한 파일로 묶는다 (file:// 대응)
scripts/derive_audiolen.py mp3 52개의 진짜 길이를 프레임으로 잰다
scripts/derive_cues.py  대본 줄마다 어림 시각. **어림이다.** 쉼을 안 센다
scripts/ground.py       제작물의 영어 재료가 52과 대본 어디에 있는지 찾는다
scripts/check_ground.py 근거 없음 비율과 **대본 밖 낱말 목록**. G구간의 게이트
scripts/check_play_ground.py 판 자료 열여덟의 영어. **G구간 게이트를 판에도 건다**
scripts/check_play_score.py 개인 칸 86판. **규칙서가 아니라 코드와 자료를 읽는다**
scripts/check_person.py 사람별 칸 52판. **갈리는 칸 다섯. 넷은 글이고 하나는 숫자다**
docs/wordlist.md      대본에 없는데 내가 쓴 낱말. **여기 없는 낱말이 재료에 나오면 실패다**
scripts/check_layers.py 3층 대조판. **2층 줄이 다 52과 대본에 있는지 잰다**
scripts/derive_ground_data.py 근거를 앱이 읽는 꼴로. 카드에서 그 녹음 자리로 간다
scripts/check_ground_cite.py 인용이 정말 그 줄을 가리키는지. 3360개 전수
scripts/check_audio.py 길이가 적힌 세 자리(카탈로그·대본 머리말·mp3)가 같은 말을 하는지
out/data/               파생된 자료. 손으로 안 고친다
out/data/index.json     48주 차림표. 앱은 머리와 오늘 분기만 읽는다 (index_head/index_q*)
out/data/manifest.json  파생 자료 열여섯의 크기와 해시. 받은 것이 온전한지 보는 표
out/data/*.js           같은 내용을 script 로 읽는 판. **앱은 이쪽을 읽는다**
                        file:// 에서 fetch 가 막히기 때문이다. 종이와 같이 쓰는 물건이라
                        내려받아 여는 것이 정상이고 그때도 돌아야 한다
scripts/derive_manifest.py 파생 자료의 크기와 해시. **맨 나중에 돈다.** 적어 둔 열여섯을 찾는다
scripts/derive_media_manifest.py 미디어 표의 크기와 해시를 다시 잰다. 275개 157MB
scripts/check_spec.py  기준서를 검사한다. **개수가 아니라 알고 있는 실패 목록과 견준다**
scripts/check_app.py   앱의 한국어를 규격 검사에 건다. **조각을 본다.** 파생물은 주석이 빠져 있다
app/                   **앱의 원본.** 조각 쉰둘이다. english.html 은 이것에서 나온다
app/play/              판 화면. **english.html 에 안 들어간다.** 판 탭을 열 때 읽는다
app/late/              드물게 여는 조각 여덟. **english.html 에 안 들어간다.** 그 자리를 열 때 읽는다
out/app/plays.js       판 묶음. 파생물이다. 손으로 안 고친다
out/app/late.js        조각 여덟 묶음. 파생물이다. 73KB 를 여기로 뺐다 (T313 뒤, T331 뒤, T336, T344, T361)
app/order.txt          합치는 차례. 이 파일이 곧 앱의 차례다
scripts/derive_app.py  조각을 합쳐 ../english.html 을 만든다. **주석은 조각에만 남는다**
scripts/check_manual.py 설명하는 글과 앱을 견준다. 매뉴얼 넷과 짝 코드 자리 폭
scripts/check_rotation.py 회전 대장의 셈을 등록부에서 다시 세고 경보 다섯을 건다
scripts/check_play.py 놀이 규칙서 스무 판. **판정은 사람이 하고 규칙은 기계가 본다**
docs/play.md          2인 놀이 원칙 여섯 확정판. 부딪치는 자리와 검사 갈래
docs/play_rules.md    스무 판 규칙서. 판마다 아홉 줄. 이 파일이 check_play.py 의 원본
docs/play_data.md     판마다 쓸 자료를 out/data 와 대조. 없다고 적은 것을 찾은 표
docs/solo_plays.md    기기가 하나인 날 스무 판이 어떻게 도는가. **셋은 종이가 있어야 한다**
docs/play_blocks.md   판이 세션 어디에 붙나. **블록 1은 비어 있고 그것이 맞다**
docs/play_app.md      판 화면. 규칙서 아홉 줄이 화면의 어디로 가는가. 거울부터
docs/bench_verdict.md 채용 열여섯과 기각 열. 다섯 문서와 12.7 을 합친 확정판
docs/bench_axes.md    앱 서른둘을 열여섯 축에. **빈 자리가 이 과정의 자리다**
scripts/check_derived.py 파생물이 원본과 어긋났는지 다시 뽑아 견준다
scripts/check_data.py  JSON 과 강의록이 같은 값을 드는지 견준다 (다른 파생물끼리)
scripts/all.py         파생과 검사를 정해진 순서로 다 돈다. 세션 종료는 이것 하나다
scripts/check_ui.js    화면 검사. 브라우저로 띄워 본다. 없으면 건너뛴다 (통과 아님)
scripts/check_session.js 블록 넷을 실제로 돌린다. 여덟 주 x 넷 = 서른두 판
scripts/check_pair.js  **기기 둘을 나란히 몬다.** 스무 회와 짝 코드와 합치기
scripts/check_streak.js 연속일과 회복권과 퀘스트 69판. **날을 세지 사람을 안 센다**
scripts/check_badge.js 공동 배지 16판. **새 이름을 안 짓고 잠그지 않는다**
scripts/check_relation.js 관계 점검과 신호 49판. **따로 적고 같이 편다**
scripts/check_growth.js 되돌아보기 33판. **앱이 소리를 안 들고 있는다**
scripts/check_ahead.js 미리 아는 것과 봉투 72판. **표는 있었는데 그때 안 떴다**
scripts/check_year.js  1년을 통째로 돈다 324판. **막는 값이 세는 값이 되면 안 된다**
scripts/check_track.js 트랙 진도 22판. **고르지 않은 것이 정상이라고 말한다**
scripts/check_adapt.js 적응 16판. **갈린 채로 오래 도는가.** 자리와 사람은 다르다
scripts/check_role.js  역할 교대 13판. **잰 값을 박아 둔다.** 고치는 것이 아니다
scripts/check_versus.js 견줌 18판. **코드가 아니라 화면을 훑는다.** 이름 옆의 숫자
scripts/check_reach.js 닿는 길 28판. **만든 것과 닿는 것은 다르다**
scripts/check_late.js  늦게 읽는 조각 55판. **파일은 멀쩡하고 화면만 빈다.** 탭을 열어 본다
scripts/check_split.js 갈린 자리 17판. **조건을 만들어 놓고 뜨는지 본다.** 안 뜨는 쪽도 잰다
scripts/check_play_screen.js 판 화면. **답이 짚는 쪽 화면에 정말 없는가.** 그려서 견준다
scripts/check_pages.py 뿌리 화면 검수 열여덟을 들인다. **CI 와 같은 자다.** 그 자가 안 보는 홀로 선 js 도 본다
scripts/rehearse.js    **검사가 아니라 리허설이다.** 엿새를 실제로 돌고 화면 글을 옮겨 적는다
scripts/rehearse_session.js 한 세션 두 시간. 블록 안에서 바뀌는 자리 열넷을 뜬다
scripts/rehearse_pair.js **두 화면을 나란히 받아 적는다.** 자리 여섯 곳
scripts/derive_speakers.py 화자 수를 대본에서 파생. 손으로 적지 않는다
out/cards/eng2p_card_plan_q1.md 카드 001~150 배정표. 강의보다 이쪽이 기준
```

## 절대 규칙

| 항목 | 규칙 |
|---|---|
| 파일명 | ASCII만. 한글 파일명 금지 |
| 인코딩 | 한국어 리터럴 UTF-8. \uXXXX 금지 |
| 금지 문자 | em-dash (U+2014), U+FFFD |
| 문체 | 대치동 1타강사 반말. 한 문단 4문장 이내 |
| 영어 예문 | 영어로만. 한글 음차 절대 금지 |
| 슬랭 | 전면 금지 |
| 구어 축약 철자 | gonna, wanna, gotta 셋만. 대본에 있는 것이 그 셋이다 |
|  | 나머지는 원형으로 적고 줄여 읽으라고 지시문이 시킨다 |
| 1인 지시 | 금지. 모든 과제는 2인 전제 |
| 통과 기준 | 반드시 숫자. "자연스러워지면" 류 금지 |
| 통과선 | 선언하지 않고 계획에서 파생시킨다. 누적 시간 144/288/432/576 이 그 예다 |

## 강의 7블록 (순서 고정)

| 블록 | 분량 | 내용 |
|---|---|---|
| 0 | 1행 | 신뢰도 등급 |
| 1 | 600자 | 원리 |
| 2 | 500자 | 한국어 화자 함정 |
| 3 | 300자 | A/B 역할 지정 |
| 4 | 400자 | 드릴 연결 (카드 번호 명시) |
| 5 | 200자 | 통과 기준 (숫자) |
| 6 | 200자 | 다음 강 예고 |

총 2,700~3,300자. 나머지 800자는 블록 1과 2의 예시에 배분.

## 블록 2 근거표

이 표 안의 내용은 A등급이다. 벗어나면 B등급으로 표시한다.

| 현상 | 원인 |
|---|---|
| 모음 삽입 | 한국어 음절 구조가 자음군을 허용하지 않음 |
| 음절 박자 전이 | 한국어는 음절 박자, 영어는 강세 박자 |
| /s/ 구개음화 | /i/ 앞에서 한국어 구개음화 규칙 전이 |
| dark l 곤란 | 한국어 유음과 불일치. 위치 무관 |
| 표기 유도 오류 | 한글은 자음군을 모음 없이 못 적음 |

반드시 "한국어에서는 X이므로 영어에서 Y로 잘못한다" 형식의 인과를 쓴다.
현상만 나열하면 실패로 판정한다.

## 6트랙

소리 / 청크 / 자동화 / 문법 / 화용 / repair

Q1 문법은 0%다. 예외 없다.
repair는 되묻기, 자기수정, 끊김 처리, 이해 확인, 시간 벌기, 대화 유지.

## 카드 5유형

판정형 / 압박형 / 확장형 / 역할형 / repair형

분기별 유형 총량은 기준서 8.1이 고정한다. Q1은 판정 75, 압박 25, 확장 20, 역할 10, repair 20.
강의를 한 편씩 쓰면서 카드를 붙이면 이 총량이 반드시 어긋난다.
`out/cards/eng2p_card_plan_q1.md` 가 배정의 기준이고 강의는 거기에 맞춘다.

- 판정형 정답은 A면에만. B면 노출 금지
- 압박형 제한시간은 숫자 (Q2 5초, Q3 3초, Q4 2초)
- 확장형은 변형 축 명시
- 역할형은 상황, 관계, 목적, 레지스터, 종료 조건 5요소 필수
- repair형은 "실패가 정상" 문구 필수

## 대화 자료 3층

- 1층 기능 대화: 내가 작성. 상단에 "학습용 인공물" 표기 필수
- 2층 실제 발화: 내가 창작하지 않는다. 조준표가 채집 조건만 지정
- 3층 대조판: Q2부터. 1층과 2층 병치

1층에 표기가 빠지면 학습자가 실제 영어로 오인한다. 이건 심각한 결함이다.

## 주제 3축

12영역 x 6관계 x 10기능. 조합은 state/rotation.md 에 기록한다.
기록하지 않으면 익숙한 조합(일상 x 친구 x 잡담)에 몰린다.

추상도와 언어 난이도는 분리한다.
게임과 투자와 철학 주제를 A2 문장으로 다룰 수 있다.
초급 주제만 주면 학습자가 이탈한다.

## 단독 개발

**조수를 쓰지 않는다. 전부 내가 직접 만들고 내가 검사한다.**

이전에 조수(GPT)가 만든 미디어 52과와 대본은 그대로 쓴다.
`docs/collab.md` 와 `tasks/` 는 그 기간의 기록으로만 남긴다.
새 작업 지시는 나가지 않는다.

혼자 만든다고 검사를 건너뛰지 않는다. 오히려 반대다.
검출할 사람이 아무도 없어졌으므로 검사기가 유일한 외부 눈이다.
`docs/roadmap.md` 가 완료까지의 턴 단위 계획이다. 매 턴 그 표를 갱신한다.

## 하지 말 것

- docs/spec.md 수정. 개정문은 docs/spec_amendments.md 에 적고 사용자가 붙인다
- 검사 스크립트 통과 없이 세션 종료
- 확신 없는 표현을 A등급으로 쓰기
- 1인 수행 가능한 과제 쓰기
- 슬랭, 유행어, 시사 레퍼런스
- "말수 적으면 손해"라는 전제 깔기
- 대본 없는 음성 반입
- C-gen 음성을 2층 자료로 쓰기
- C-gen 음성으로 Q1 소리 트랙 통과 판정하기
- 음성 파일을 저장소에 넣기
