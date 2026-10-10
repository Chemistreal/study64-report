# 감사 D1. 첫 공개(세션 1~48, A1) 범위: 낱말 선행, 간격, 부하, 다시 하기

신뢰도: B 생성 (읽기 전용 감사. 콘텐츠는 안 고쳤다. 낱말 어간과 등급은 `scripts/authored_lib.py` 의 근사를 그대로 썼다)
검증로그: 2026-10-10 / `authored_lib.heard_vocab` `parse_lines` `line_problems` 를 재사용해 18개 미션 559줄과 세션 1~48 자료를 기계로 셌다. `check_authored.py` 는 실패 0 / 보류 / 세는 방식은 아래 0장. 판단(고칠지, 어떻게)은 사용자 몫
작성일: 2026-10-10

## 0. 한눈에 (결론)

1. **기계 관문은 통과(실패 0)지만, 관문이 보는 "들은 낱말"이 느슨하다.** 관문은 "블록 1 말뭉치 대본(lle1-NN)에서 들었거나 `authored_words.md` 에 올라 있으면" 통과시킨다. 그래서 *미션이 처음 가르치는 낱말*이 실패로 안 잡힌다. 18개 미션이 열리는 세션 시점에서 **들은 적 없는 낱말 종류가 미션당 4~27개**다 (4장 표).
2. **세션 1~48 에서 가르치는 영어는 말뭉치 12과(lle1-01,05,06,09,10,11,12,13,14,17,18,19)와 카드뿐이다.** 한국어 강의 1~16강에는 `please` `sorry` `my name` `how much` `dollar` `water` `excuse me` 가 한 번도 없다 (grep 확인). 세션 30 이후(31~48)는 새 말뭉치 낱말이 0이다 (복습 주 31~36, 반복 주 37~48).
3. 가장 큰 구멍: 미션이 쓰는 **핵심 틀이 가르치기 전에 쓰인다.** `Sorry, can you say that again?`(16개 미션 연습에 들어감, 첫 줄 `ng-08` 세션 15)은 `can/do/have` 가 세션 16, `sorry` 가 23, `name` 이 19 에야 처음 들린다. `please`(미션 연습 62개)는 세션 17 첫 사용, 말뭉치 첫 청취는 27. `how much` 는 세션 20~22 사용, `much` 청취는 25. `dollar` `card` `water` `juice` 와 숫자 6~20 은 48 까지 말뭉치에 없다.
4. 간격: 말뭉치 청크 64개 전부 2회 이상 돌아오지만 **하루 몰아서 3일 → 18~28세션 뒤 한 번**이 전부다. 5~12과(세션 13~30)의 청크는 복습 주(31~36)에서 **딱 한 번**만 돌아오고 48까지 끝이다.
5. 부하: 새 낱말 많은 날은 세션 19(말뭉치 71, 중앙값 36의 2배), 세션 1(말뭉치 29 + 카드 54), 16, 25. 미션 쪽은 세션 17(27개), 20(22개), 37·39·43(각 19개, 같은 주에 새 말뭉치 0).
6. 다시 하기: 미션 18개 모두 `retryable` 이고 NPC 줄, 연습 8개, 자리(A/B)가 **고정**이다. 달라지는 것은 고르는 줄뿐이고 그것도 대부분 같은 기능의 다른 말이다 (6장).

## 1. 쓴 방법과 한계

| 항목 | 내용 |
|---|---|
| 해금 세션 | `out/game/outings.json` 의 `missions[].unlock.session` (= `outings.md` 6장 표의 주.날. 주 6일). 15, 17, 20, 22, 23, 26, 28, 30, 37, 39, 41~48 |
| 들은 낱말 | `authored_lib.heard_vocab(s)`: 세션 s 까지 처음 나온 말뭉치 과의 어간 집합 (관문과 같다). 세션 30 이후 486어간으로 고정 |
| 보조 | 카드(`cards.json` 카드 자료 영어)는 따로 셌다. 카드에 처음 나오는 영어는 미션 낱말 해소에 거의 안 보탠다 (`water` 21, `six` 19, `can` 13 정도) |
| 한계 1 | 어간 근사 때문에 `cookie`/`cooky`, `pancakes`/`pancake` 같은 짝이 따로 센다. 숫자가 아니라 경향을 본다 |
| 한계 2 | 한국어 강의 본문이 영어 표현을 가르치는지는 `please` 등 대표 낱말의 grep 으로만 확인했다 (1~16강 0건) |
| 한계 3 | 미션 보상의 같은 미션 반복 지급 규칙은 game 저장소 `Docs/level_KO.md` 에 있고 이 저장소에는 없어서 못 봤다 (6장) |
| 안 본 것 | 영어의 자연스러움(점검 B 19줄은 `state/authored_b.md` 가 이미 모은다), 음성, 앱 화면 |

## 2. (a) 미션별 선행 낱말 표

열: 해금 세션 / 줄 안 낱말 종류 / 그때까지 안 들은 종류 / 안 들은 것을 뺀 낱말의 덮임(토큰 %) / 말하는 줄(option·wait)에 있는데 연습 8개에도 없는 안 들은 낱말 수 / 연습 8개 중 안 들은 낱말이 든 개수.

| # | 미션 id | 세션 | 종류 | 안 들은 | 덮임% | 말하는 줄·연습 밖 | 연습 중 안 들은 포함 |
|---|---|---|---|---|---|---|---|
| 1 | neighbor_greeting | 15 | 43 | 8 | 89 | 0 | 5/8 |
| 2 | hotel_front_desk | 17 | 70 | **27** | **69** | **9** | 6/8 |
| 3 | cafe_order | 20 | 52 | **22** | **57** | **9** | 7/8 |
| 4 | convenience_store_abc | 22 | 50 | 13 | 82 | 4 | 6/8 |
| 5 | cookie_snack | 23 | 55 | 14 | **67** | 5 | 6/8 |
| 6 | shave_ice_snack | 26 | 57 | 11 | 77 | 4 | 5/8 |
| 7 | musubi_day | 28 | 56 | 10 | 88 | 3 | 1/8 |
| 8 | waikiki_beach_chair_umbrella | 30 | 52 | 8 | 83 | 3 | 3/8 |
| 9 | leonards_malasadas | 37 | 61 | 19 | 79 | **8** | 4/8 |
| 10 | food_truck_lunch | 39 | 52 | 19 | 78 | 6 | 4/8 |
| 11 | honolulu_zoo_ticket | 41 | 52 | 10 | 84 | 1 | 3/8 |
| 12 | pharmacy_basic | 42 | 50 | 13 | 85 | 3 | 5/8 |
| 13 | cheesecake_dessert | 43 | 71 | 19 | 83 | 6 | 5/8 |
| 14 | bus_fare_question | 44 | 55 | 8 | 88 | 1 | 4/8 |
| 15 | ala_moana_basic_shopping | 45 | 58 | 4 | 94 | 0 | 1/8 |
| 16 | diamond_head_lookout_directions | 46 | 44 | 5 | 89 | 0 | 2/8 |
| 17 | eggs_n_things_breakfast | 47 | 76 | 15 | 86 | 5 | 2/8 |
| 18 | hanauma_bay_gear_rental | 48 | 55 | 9 | 90 | 0 | 1/8 |

(허용 이름은 뺐다. 줄 수 25~36. 18개 모두 `check_authored.py` 관문은 통과. 새 낱말 줄당 4개 상한은 지켜진다.)

### 2.1 핵심 낱말이 들리기 전에 쓰이는 곳

| 낱말·틀 | 미션에서 첫 사용 (줄 id) | 말뭉치에서 처음 들림 | 비고 |
|---|---|---|---|
| can / do / have | 세션 15, `ng-08` `ng-19` `ng-23` | 16 | 한 세션 차이 |
| sorry (`Sorry, can you say that again?`) | 세션 15, `ng-08` (연습 `ng-p6`) | 23 | 되묻기 틀. 18개 중 16개 미션 연습에 들어간다 |
| name (`My name is {A}`) | 세션 15, `ng-11` `ng-12` | 19 | 첫 미션의 핵심 말하기 |
| please | 세션 17, `hf-03` | 27 | 미션 연습 62개가 `X, please` 틀 |
| much (`Thank you very much` / `How much`) | 세션 17, `hf-27` | 25 | `How much is it?` 는 13개 미션 |
| dollar, card (`Cash or card?`) | 세션 20, `cf-30` | 48 까지 없음 | 14개 미션이 값을 말한다 |
| water, juice | 세션 17, `hf-25` | 없음 (카드에 water 21) | |
| 숫자 five~twenty, sixteen | 세션 17 이후 | 없음 (six 카드 19, one·two·three·four 만 말뭉치) | 값 말하기에 필수 |
| help, sure, very, enjoy, fine | 17~22 | help 19, sure 19, very 19, enjoy·fine 없음 | |

### 2.2 말하는 줄(option·wait)에 있으면서 연습 8개 밖인 안 들은 낱말 (생산을 요구하는데 연습에 없음)

| 미션 | 낱말 |
|---|---|
| hotel_front_desk (`hf-`) | five, six, eight, name, very, just, another, key, much |
| cafe_order (`cf-`) | tea, hot, small, large, orange, juice, water, cookie, much |
| cookie_snack | coconut, same, six, bag, card |
| convenience_store_abc | juice, sunscreen, towels, hats |
| shave_ice_snack | strawberry, lemon, dollars, ten |
| leonards_malasadas | malasadas, twelve, sugar, cinnamon, enough, bag, card, smell |
| food_truck_lunch | salad, spicy, water, dollars, card, twenty |
| cheesecake_dessert | tea, milk, chocolate, cake, sweet, card |
| eggs_n_things_breakfast | juice, water, eggs, toast, card |
| pharmacy_basic | bandages, price, shampoo |

등급이 A1 이 아닌 안 들은 낱말: A2 42개, B1 3개 (`lookout`, `fins`, `snorkel`). 대부분 장소 낱말(`towels` `latte` `toothpaste`)이다.

### 2.3 이후 장면과 18개 미션 사이

- 세션 1~48 장면(`scenes.json`)의 말뭉치 줄 중 아직 안 들은 과에서 온 줄은 **0개**다. 장면은 문제없다.
- 장면에는 지은(authored) 줄이 안 섞여 있다 (`check_authored` 판 `corpus`). 그래서 미션 낱말이 장면에서 다시 쓰이지 않는다 = 미션 낱말의 복습은 **미션 자기 자신과 다른 미션뿐**이다 (4장).

## 3. (c) 부하: 세션별 새 낱말

세는 방식: 말뭉치 새 낱말(관문 정의) / 같은 날 해금되는 미션의 안 들은 낱말 / 카드 영어의 새 낱말(참고) / 셋의 합집합 중 이전에 없던 어간.

| 세션 | 말뭉치 새 | 미션 새 | 합집합 새 | 비고 |
|---|---|---|---|---|
| 1 | 29 | 0 | **83** | 첫날 카드 영어 54 가 더해져 최대 |
| 4 | 32 | 0 | 49 | |
| 7 | 44 | 0 | 28 | |
| 10 | 31 | 0 | 42 | |
| 13 | 31 | 0 | 50 | |
| 15 | 0 | 8 | 6 | neighbor |
| 16 | 53 | 0 | 55 | |
| 17 | 0 | 27 | 22 | hotel (세션 16 의 새 53 바로 다음 날) |
| 19 | **71** | 0 | 67 | 말뭉치 중앙값 36 의 약 2배 |
| 20 | 0 | 22 | 15 | cafe |
| 21 | 32 | 0 | 38 | |
| 23 | 40 | 14 | 45 | 같은 날 새 과 + 미션 |
| 25 | 48 | 0 | 48 | |
| 27 | 44 | 0 | 44 | |
| 29 | 31 | 0 | 40 | |
| 37 | 0 | 19 | 14 | 새 과 없음. 미션 새 19 |
| 39 | 0 | 19 | 9 | |
| 43 | 0 | 19 | 17 | |
| 그 밖 | 0 | 4~15 | 0~5 | |

- 새 과가 있는 12일(세션 1, 4, 7, 10, 13, 16, 19, 21, 23, 25, 27, 29)의 말뭉치 새 낱말 중앙값은 36, 최소 29, 최대 71. 세션 19 가 이상치, 53(16), 48(25)이 그 다음.
- 세션 31~36(복습 주)에는 새 낱말도 미션도 **0**인데 세션 37~48 은 미션 10개가 12일에 몰린다(41~48은 8일 연속 날마다 1개 해금). 부하가 한쪽 주에 쏠려 있고 복습 주는 비어 있다.
- 세션 15, 17, 20, 22, 23 은 새 과가 1일 간격으로 막 시작하는 시점(세션 13, 16, 19, 21)에 미션이 겹친다: 세션 16(새 53)→17(미션 27).

## 4. (b) 간격과 복습

### 4.1 말뭉치 과 12개의 노출 (세션 번호)

| 과 | 처음 | 두 번째 | 세 번째 |
|---|---|---|---|
| lle1-01 | 1~3 | 31 | 37~39 |
| lle1-05 | 4~6 | 31 | 40~42 |
| lle1-06 | 7~9 | 32 | 43~45 |
| lle1-09 | 10~12 | 32 | 46~48 |
| lle1-10 | 13~15 | 33 | 49(범위 밖) |
| lle1-11 | 16~18 | 33 | |
| lle1-12 | 19~20 | 34 | |
| lle1-13 | 21~22 | 34 | |
| lle1-14 | 23~24 | 35 | |
| lle1-17 | 25~26 | 35 | |
| lle1-18 | 27~28 | 36 | |
| lle1-19 | 29~30 | 36 | |

- 청크 64개(`chunks.json` 중 이 12과) 중 한 번 나오고 끝인 청크는 **0**. 하지만 **두 번 나오는 청크가 29개**: 5~12과 소속. 간격은 6~18세션(`is your` `at the` `there are` `across from` `a big` 18, `you know` `do you have` 15, `can you` 11, `you are` `the news` 6). 세션 25~30(lle1-17,18,19)의 청크는 6~9세션 뒤 복습 한 번뿐이고 이후 48 까지 안 나온다.
- 1~4과(세션 1~12)는 마지막 날에서 복습 주까지 19~28세션 뒤에 돌아오고(예 lle1-01: 3→31), 반복 주(37~48)에는 복습 주에서 6~14세션 뒤에 다시 온다(31→37). 큰 공백 뒤에 짧은 복귀라 간격이 늘어나는 모양(확장 간격)이 아니다.
- 카드(`cards`)는 새 카드 107장 모두 3~7회 나온다(하루 단위 반복 포함). 한 번뿐인 카드 0. 간격 분포: 1일 203, 2~3일 110, 5~6일 98, 8~18일 60.
- 말뭉치 청크 64개 중 미션 줄에 한 번이라도 나오는 것은 **34개**. 안 나오는 30개(`let's try`, `my new`, `where are you`, `there are`, `across from`, `a big`, `what are you doing` 등)는 장면과 카드에서만 돈다.

### 4.2 미션에서 처음 가르치는 낱말과 틀의 반복

- 말뭉치에 한 번도 없고 미션 줄에 나오는 낱말 **106어간**. 이 중 **미션 한 개에만 나오는 것이 77개**(음식, 장소 낱말). 다른 미션에서 다시 안 나오고 장면에도 없으니 다시 보는 길은 그 미션 다시 하기뿐이다.
- 한 미션에만 나오는 낱말 (어간 짝 오류 `cooky/cookie` 포함): hotel `bottle` `bring` `elevator` `key` `pool` `another` `five` / cafe `latte` `iced` `nine` / cookie_snack `coconut` `eleven` / shave_ice `flavor` `lemon` `mango` `strawberry` `shave` / leonards `aloha` `cinnamon` `careful` `smell` `total` `enough` `half` `sugar` / food_truck `plate` `rice` `salad` `spicy` `receipt` `sixteen` `lunch` `little` / zoo `adult` `map` `ticket` / pharmacy `bandage` `shampoo` `soap` `toothpaste` `price` / cheesecake `cake` `dessert` `fork` `lemonade` `milk` `piece` `sweet` `table` `follow` / bus `fare` `pay` `seat` `us` `yet` / diamond_head `lookout` `stair` `view` / eggs `pancake` `toast` `order` / hanauma `fin` `mask` `snorkel` `touch`. 낱말 한 개가 한 번 나오는 것은 문제가 아닐 수 있다(장소 어휘). 다만 `order` `pay` `price` `table` `key` 같은 일반어는 다른 미션에서 되풀이될 자리가 있다.
- 미션 사이 틀의 반복은 좋다. 줄 안에서 쓰인 미션 수: `thank you` 18, `say that again` 17, `please` 17, `how much` 13, `have a nice day` 12, `cash or card` 9, `do you want` 9, `anything else` 6. 연습 144개 중 서로 다른 것은 96개(48개가 다른 미션과 같은 말). 최대 간격은 틀마다 7~11세션이라 적당하다.
- 약한 틀: `Can I have ...` 는 미션 2개(세션 37, 47, 간격 10), `I would like` 1개(47), `I need` 1개(42), `Where are` 1개. 주문 동사 틀(`I'd like`, `Can I have`)이 `X, please` 하나에 기대고 있다.
- 연습 144개 중 다른 미션과 2낱말 이상 겹치는 부분이 없는 것은 28개. 거의 `<명사>, please` 틀의 명사 부분이다(`Chocolate, please.` `Mango, please.` `Two tickets, please.`). 틀은 반복되고 명사만 한 번이다.

## 5. 우선순위 수정 목록

비용: 작음(자료·문서 몇 줄 또는 스크립트), 중간(여러 파일), 큼(과정 구조 변경).

| 순위 | 파일 · 줄 id | 문제 | 제안 | 비용 |
|---|---|---|---|---|
| P1 | `docs/authored_lines.md` `ng-08` `ng-p6` 외 16개 미션 연습 / `docs/outings.md` 6장 36~53행 | 되묻기 틀 `Sorry, can you say that again?` 이 세션 15 에 처음 나오는데 어느 과·카드·강의에도 세션 1~48 안에 없음 (can 16, sorry 23) | 세션 13~15 카드 세트에 이 틀의 듣기 카드를 한 장 넣는다(8.1 카드 총량 안에서 교체), 또는 `neighbor_greeting` 해금을 세션 23 이후로 미루고 첫 미션은 인사만 있는 것으로 바꾼다 | 중간 |
| P1 | `docs/authored_words.md` 가 아니라 `scripts/check_authored.py` / `authored_lib.line_problems` | 관문이 "미션이 처음 가르치는 낱말"을 실패로 안 센다(안 들은 낱말이 등급표에 있으면 통과). 미션당 안 들은 4~27개가 눈에 안 보인다 | 판 `preflight` 같은 알림 줄을 더한다: 미션별 안 들은 종류, 말하는 줄이면서 연습 밖인 안 들은 낱말, 덮임%. 상한은 먼저 알림으로(예: 안 들은 12 이하, 덮임 75% 이상). 현재 초과: hotel, cafe, cookie, leonards, food_truck, cheesecake | 작음 |
| P1 | `docs/authored_lines.md` `hf-` `cf-` 연습 8개 (`hf-p*` `cf-p*`) | 해금이 가장 이른 hotel(17), cafe(20)가 안 들은 낱말 27, 22개에 덮임 69, 57%. 말하는 줄 중 연습 밖 낱말이 각 9개 | 연습 8개에 `please`, `How much is it?`, 숫자·값 말하기 틀을 올리고 옵션 줄의 안 들은 말을 연습 밖에서 줄인다. 또는 해금을 세션 27(please 청취) 이후로 옮긴다 | 중간 |
| P2 | `docs/outings.md` 6장 표 열리는 때 (44~53행) | 세션 31~36 은 새 과도 미션도 0, 37~48 에 미션 10개가 몰림(41~48 날마다 1개). 새 과(13, 16, 19, 21, 23)와 미션이 같은 주에 겹침(17, 20, 22, 23) | 해금 재배치: 37~48 의 미션 10개 중 둘셋(예 `leonards_malasadas` `food_truck_lunch` `honolulu_zoo_ticket`)을 31~36 복습 주로 당긴다. 복습 주는 새 낱말이 0이라 미션 낱말을 얹기 좋다. `outings.md` 표만 고치고 `derive_outings.py` 로 `outings.json` 갱신 | 작음 |
| P2 | `docs/outings.md` 6장 + 신규 숫자 연습 | 값 말하기에 쓰는 숫자 five~twenty, `dollar`, `card` 가 세션 1~48 어디에도 안 가르쳐짐. 14개 미션이 값을 말한다 | 숫자·값 한 묶음(1~20, `dollars`, `cash or card`)을 첫 값 미션(`cafe_order` 세션 20) 앞의 카드 세트나 미션 연습에 넣는다 | 중간 |
| P2 | `docs/authored_lines.md` 의 `Can I have` `I would like` `I need` 가 든 줄 (`lm-19` `lm-20` `enb-15`~`enb-18`) | 주문 동사 틀이 `X, please` 하나에 기대고 미션 1~2개에만 나옴 | 연습 8개 중 1개를 `Can I have ..., please?` 로 돌려 여러 미션에서 반복시킨다. 줄은 그대로 두고 연습 `line` 만 바꾼다 | 작음 |
| P2 | 카드 세트 세션 25~30 (lle1-17,18,19) | 이 청크들은 복습 주에 6~9세션 뒤 한 번만 돌고 끝 | 세션 37~48 의 카드 리뷰에 5~7과 청크를 넣거나, 7~8주 반복 주의 과를 1·5·6·9과 대신 10~19과 중 일부로 바꾼다 | 큼 |
| P3 | `docs/outings.md` 6장 연습·반복 | 한 미션에만 나오는 일반어(`order` `pay` `price` `table` `key` `bring`) | 인접 미션 줄에 한 번씩 넣는다(줄 id 를 새로 만들지 않고 기존 줄 한 개 교체). 관문의 새 낱말 상한 안에서 | 작음 |
| P3 | 세션 19 (lle1-12) | 말뭉치 새 낱말 71 로 중앙값의 2배 | 12과를 2일이 아니라 3일로 늘리거나 낱말 일부를 13과로 넘긴다. 강의 배치를 바꾸므로 사용자 결정 | 큼 |
| P3 | 아래 6장 | 다시 하기가 같은 모양 | 6장 제안 | 중간 |

## 6. (d) 다시 하기 규칙: 다시 해도 쓸모 있나

| 미션 | 차례 | 후보 2개 이상 차례 | 후보 1개 차례 | 분기 | 경로 수(곱) | 기능이 다른 후보 차례 | 자리 |
|---|---|---|---|---|---|---|---|
| neighbor_greeting | 7 | 6 | 1 | 1 | 144 | 1 | either 5, A 1, B 1 |
| hotel_front_desk | 10 | 7 | 3 | 2 | 864 | 2 | either 8, A 1, B 1 |
| cafe_order | 11 | 9 | 2 | 1 | 2304 | 2 | A 4, B 3, either 4 |
| convenience_store_abc | 9 | 6 | 3 | 2 | 216 | 1 | A 3, B 2, either 4 |
| cookie_snack | 14 | 6 | 8 | 0 | 144 | 3 | either 8, A 3, B 3 |
| shave_ice_snack | 14 | 8 | 6 | 0 | 384 | 4 | either 8, A 3, B 3 |
| musubi_day | 14 | 7 | 7 | 0 | 432 | 3 | either 7, A 4, B 3 |
| waikiki_beach_chair_umbrella | 13 | 3 | 9 | 3 | **12** | 1 | either 8, A 3, B 2 |
| leonards_malasadas | 14 | 7 | 7 | 0 | 432 | 3 | either 7, A 4, B 3 |
| food_truck_lunch | 15 | 8 | 7 | 0 | 576 | 5 | A 5, B 4, either 6 |
| honolulu_zoo_ticket | 13 | 5 | 5 | 2 | 48 | 2 | either 8, A 3, B 2 |
| pharmacy_basic | 8 | 7 | 1 | 4 | 576 | 3 | A 4, B 2, either 2 |
| cheesecake_dessert | 17 | 7 | 8 | 0 | 192 | 3 | either 8, A 5, B 4 |
| bus_fare_question | 8 | 6 | 2 | 5 | 144 | 2 | A 2, B 2, either 4 |
| ala_moana_basic_shopping | 13 | 5 | 6 | 2 | 108 | 1 | either 8, A 3, B 2 |
| diamond_head_lookout_directions | 14 | 5 | 7 | 2 | **48** | 2 | either 10, A 2, B 2 |
| eggs_n_things_breakfast | 15 | 5 | 8 | 1 | **72** | 2 | either 11, A 2, B 2 |
| hanauma_bay_gear_rental | 13 | 6 | 7 | 2 | 216 | 3 | either 7, A 3, B 3 |
| 합계 | 222 | 113(51%) | 97(44%) | | | | |

(`outings.json` `game.turns`, `docs/authored_lines.md` 줄 기능 칸으로 센 값. 경로 수는 후보 수의 곱이라 상한이다.)

판단:

- **다시 하면 같은 대화다.** NPC 줄(차례당 고정), 연습 8개(`game.practice` 고정), 자리(A/B/둘 중 누구든 고정)가 매번 같다. 달라지는 것은 후보 중 무엇을 고르느냐뿐이다.
- 후보가 있는 차례(51%)도 기능이 같은 말이 대부분이다 (예 `I'm fine, thank you. And you?` / `Good, thank you. And you?`). 후보가 하나 이상이라도 *하나만 말하면 통과*라서 가장 쉬운 후보만 반복할 수 있고, 다른 후보를 말해 볼 이유가 점수에 없다. 기능이 다른 후보가 있는 차례는 미션당 1~5개다.
- 가장 얇은 미션: `waikiki_beach_chair_umbrella`(경로 12, 후보 있는 차례 3/13), `honolulu_zoo_ticket`(48), `diamond_head_lookout_directions`(48), `eggs_n_things_breakfast`(72). 이 넷은 다시 해도 사실상 같은 일이다.
- 보상: 미션 하나는 `activity` 6/5/3 + 차례마다 2/2/1(`docs/outings.md` 3장). 14차례를 다 통과하면 한 번에 약 34점이고 열쇠가 `outing:<id>`(미션 단위), `outing:<id>:<차례>`(차례 단위)다. **같은 열쇠의 반복 지급을 막는지·줄이는지는 이 저장소에 규정이 없다** (game 저장소 `Docs/level_KO.md` 소관, 이번에 못 봄). 안 막으면 가장 쉬운 미션 반복이 최단 경험치 길이고 줄이면 다시 할 이유는 연습뿐인데, 연습이 고정이라 두 경우 다 다시 하기의 학습 가치가 낮다.
- 좋은 점: 못해도 잠기지 않고(`docs/outings.md` 3장) 연습 말 가운데 16개 미션이 공유하는 `say that again` 같은 틀은 미션을 바꿔 가며 반복되므로 *다른 미션으로 넘어가는 것*은 반복으로 유효하다.

다시 하기 제안 (5장 표의 P3 `다시 하기`):

| 파일 | 제안 | 비용 |
|---|---|---|
| `scripts/derive_outings.py`, `docs/outings.md` 3장 | 두 번째 시도부터 자리 바꿈(A 차례와 B 차례를 맞바꿈). 데이터는 `seat` 를 뒤집는 규칙 한 줄이고 줄은 그대로 | 작음 (게임 로더 쪽 규칙 필요) |
| `docs/outings.md` 3장, 게임 규칙 | 같은 미션의 두 번째 이후 통과는 *이전에 안 한 후보를 말했을 때*만 `line_wait` 를 주거나, 첫 통과만 `activity` 전액 | 작음 (사용자 결정) |
| `docs/authored_lines.md` 연습 표 | 연습을 8개 고정이 아니라 12개 중 8개 순환으로. 새 연습 4개는 이후 미션의 틀(`Can I have`, 숫자·값 말하기)을 미리 넣는다 | 중간 |
| 얇은 4개 미션 (`bc-` `hz-` `dh-` `enb-` 줄) | 후보 있는 차례를 2~3개 더 늘린다(기능이 다른 후보로) | 중간 |
| 같은 미션 장면 변이 | NPC 첫 줄을 둘 중 하나로 (`Hello!` / `Hi there!` 식), 값 말하기에서 값이 바뀐다(`That's nine dollars.` / `eleven dollars.`). `outings.json` 구조에 npc 후보가 이미 있다(`turns[].npc` 가 배열) | 중간 |

## 7. 이 감사가 확인한 것 / 못 한 것

| 확인 | 결과 |
|---|---|
| `python3 scripts/check_authored.py` | 판 8, 나들이 18장, 559줄(점검 A 540, B 19), 실패 0 |
| 장면 1~48 의 줄이 안 들은 과에서 온 것 | 0 |
| 청크 한 번만 나오고 끝 | 말뭉치 청크 0, 카드 0. 미션 낱말은 77어간 (4.2) |
| 못 한 것 | 한국어 강의 1~16강이 영어 표현을 가르치는 부분의 전수 점검(대표 낱말 grep 만), game 저장소의 보상 반복 규칙, 점검 B 19줄의 자연스러움 |


## 7. 정정 (클라우드 본 세션, 2026-10-10)

5장 P2 "해금 재배치: 세션 31~36 이 비어 있으니 미션을 옮긴다" 는 **하지 않는다.** 6주는 의도한 **다지기 주(짧은 날)** 이고 `check_authored.py` 가 그 주에 미션이 열리면 실패로 센다 (`열리는 때가 다지기 주(6주, 짧은 날)다`). 옮겨 보았다가 되돌렸다. 나머지 항목은 그대로 유효하다.
