# 지은 영어 줄 (authored). 원본

신뢰도: B 생성 (작성자 판단으로 쓴 영어. 자기 점검 A/B 를 줄마다 단다. 확신 없으면 B)
검증로그: 2026-10-10 / 파일럿 한 장(에그스 앤 띵스 아침) 33줄을 쓰고 관문(낱말 등급, 길이, 문화, 중복, 베끼기)을 기계로 통과 / 보류 / 자연스러움은 사용자 검증 전이다. 점검 B 줄은 state/authored_b.md
상위 규격: docs/authored.md (정책과 관문) / docs/outings.md (나들이 설계)
작성일: 2026-10-10

이 파일이 지은 영어의 **원본**이다. `scripts/derive_authored.py` 가 읽어 `out/game/authored.json` 을 내고 `state/authored_b.md` (B 등급 목록)를 낸다.
`scripts/check_authored.py` 가 관문을 건다. **손으로 JSON 을 안 고친다.** 말뭉치(VOA 대본) 줄은 여기에 없다. 말뭉치 줄은 그대로 `lle1-NN` 근거를 달고 scenes.md 에 있다.

## 읽는 법

장마다 `## 나들이: <미션 id>` 머리 아래 메타 줄(`키: 값`)이 먼저 오고 줄 표가 온다.

| 메타 | 뜻 |
|---|---|
| 작성자 | 작성자 태그. 줄마다 달린다 |
| 장소 | HnlLandmarks.json 의 id (게임 저장소). 없으면 `-` |
| 세션 | 이 장면이 놓이는 세션 번호. 이 세션까지 들은 말뭉치가 "이미 들은 낱말"이다 |
| 목표 등급 | 장면의 등급 (A1 A2 B1 B2). 줄마다 등급이 따로 있고 이 값을 한 단계까지 넘을 수 있다 (한 장면의 30% 까지) |
| 할 일 | 할 일(can-do) id / 영어 / 한국어 |
| 허용 이름 | 줄에 써도 되는 고유 이름 (실제 가게 이름 등). 비어 있으면 `-` |

| 줄 칸 | 뜻 |
|---|---|
| id | 줄 id. 전체에서 유일 |
| 장면 | 장면 이름 (door drink order food pay) |
| 종류 | `npc` NPC 가 하는 줄 / `wait` 두 사람이 해야 하는 줄 (기계가 넉넉하게 듣는다) / `option` 둘 중 하나를 고르는 두 사람의 줄 (같은 장면의 option 은 한 묶음) |
| 인물 | `Host` `Server` (NPC), `두 사람` `A자리` `B자리` |
| 영어 | 줄. `{A}` `{B}` 는 이름 자리 |
| 등급 | 이 줄의 목표 CEFR |
| 기능 | 이 줄이 하는 말의 기능 (인사 안내 주문 확인 계산 되묻기 등) |
| 점검 | 자연스러운 미국 영어인지 자기 점검. `A` 또는 `B`. **확신 없으면 B** (CLAUDE.md 3번) |
| 이유 | 점검이 B 일 때 왜 확신이 없는가. A 면 `-` |
| 한국어 | 한국어 풀이. 세션이 koreanTranslationThroughSession(50) 이하일 때만 쓴다. 아니면 `-` |

## 나들이: eggs_n_things_breakfast

작성자: claude-sonnet-5.5 (2026-10-10)
장소: eggs_n_things_saratoga
세션: 47
목표 등급: A1
할 일: cd-enb-1 / I can order a simple breakfast and pay in a restaurant. / 식당에서 간단한 아침 식사를 주문하고 계산할 수 있다.
허용 이름: -
갈래: enb-30 > enb-31

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| enb-01 | door | npc | Host | Good morning! How many? | A1 | 인사 안내 | A | - | 안녕하세요! 몇 분이세요? |
| enb-02 | door | wait | 두 사람 | Two, please. | A1 | 인원 말하기 | A | - | 두 명이요. |
| enb-03 | door | npc | Host | Right this way, please. | A1 | 안내 | A | - | 이쪽으로 오세요. |
| enb-04 | door | npc | Host | Here are your menus. | A1 | 안내 | A | - | 메뉴 여기 있어요. |
| enb-05 | drink | npc | Server | Hi! Can I get you something to drink? | A2 | 음료 묻기 | A | - | 안녕하세요! 마실 것 좀 드릴까요? |
| enb-06 | drink | option | A자리 | Coffee, please. | A1 | 음료 주문 | A | - | 커피 주세요. |
| enb-07 | drink | option | B자리 | Orange juice, please. | A1 | 음료 주문 | A | - | 오렌지 주스 주세요. |
| enb-08 | drink | option | 두 사람 | Water, please. | A1 | 음료 주문 | A | - | 물 주세요. |
| enb-09 | drink | npc | Server | Okay. I will be right back. | A2 | 안내 | A | - | 네. 금방 올게요. |
| enb-10 | order | npc | Server | Are you ready to order? | A1 | 주문 묻기 | A | - | 주문하시겠어요? |
| enb-11 | order | wait | 두 사람 | Just a minute, please. | A1 | 시간 벌기 | A | - | 잠깐만요. |
| enb-12 | order | wait | A자리 | What do you want to eat, {B}? | A1 | 상대에게 묻기 | A | - | {B}, 뭐 먹고 싶어? |
| enb-13 | order | wait | B자리 | I want pancakes. And you? | A1 | 말하고 되묻기 | A | - | 난 팬케이크. 너는? |
| enb-14 | order | npc | Server | Okay. What would you like? | A2 | 주문 묻기 | A | - | 네. 뭘 드릴까요? |
| enb-15 | order | option | A자리 | I would like the eggs and toast, please. | A2 | 주문 | A | - | 달걀이랑 토스트 주세요. |
| enb-16 | order | option | A자리 | Can I have the eggs and toast, please? | A2 | 주문 | A | - | 달걀이랑 토스트 먹어도 될까요? |
| enb-17 | order | option | B자리 | I would like the pancakes, please. | A2 | 주문 | A | - | 팬케이크 주세요. |
| enb-18 | order | option | B자리 | Can I have the pancakes, please? | A2 | 주문 | A | - | 팬케이크 먹어도 될까요? |
| enb-19 | order | npc | Server | Anything else? | A1 | 추가 묻기 | A | - | 더 필요한 건요? |
| enb-20 | order | wait | 두 사람 | No, thank you. That is all. | A1 | 주문 끝내기 | A | - | 아니요, 고맙습니다. 그게 다예요. |
| enb-21 | food | npc | Server | Here you go. Enjoy! | A1 | 음식 내기 | A | - | 여기 있어요. 맛있게 드세요! |
| enb-22 | food | wait | 두 사람 | Thank you! | A1 | 감사 | A | - | 고맙습니다! |
| enb-23 | food | npc | Server | Is everything okay? | A1 | 확인 | A | - | 다 괜찮으세요? |
| enb-24 | food | option | 두 사람 | Yes, it is very good. | A1 | 대답 | A | - | 네, 아주 맛있어요. |
| enb-25 | food | option | 두 사람 | Sorry, can you say that again? | A2 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| enb-26 | food | option | 두 사람 | More coffee, please. | A1 | 추가 요청 | A | - | 커피 더 주세요. |
| enb-27 | pay | wait | 두 사람 | Can we have the check, please? | A2 | 계산서 요청 | A | - | 계산서 주시겠어요? |
| enb-28 | pay | npc | Server | Sure. Will that be cash or card? | A2 | 결제 묻기 | A | - | 네. 현금이세요, 카드세요? |
| enb-29 | pay | option | 두 사람 | Card, please. | A1 | 결제 | A | - | 카드로 할게요. |
| enb-30 | pay | option | 두 사람 | How much is it? | A1 | 값 묻기 | A | - | 얼마예요? |
| enb-31 | pay | npc | Server | It is twenty-four dollars. | A1 | 값 말하기 | B | 숫자와 값은 장면용으로 정한 것이다. 실제 가격이 아니고 말투 자체는 자연스럽지만 달러 읽는 법("twenty-four dollars")이 이 등급에 맞는지 확신이 없다 | 24달러예요. |
| enb-32 | pay | npc | Server | Thank you. Have a nice day! | A1 | 작별 | A | - | 고맙습니다. 좋은 하루 보내세요! |
| enb-33 | pay | wait | 두 사람 | You too! Thank you! | A1 | 작별 | A | - | 당신도요! 고맙습니다! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량(Q1 판정 75 등)에 안 들어간다. **나들이 안에서만 쓰는 연습 말**이다. 줄 id 로 위 표를 가리킨다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| enb-p1 | Two, please. | 인원 말하기 | enb-02 | 두 명이요. |
| enb-p2 | Coffee, please. | 음료 주문 | enb-06 | 커피 주세요. |
| enb-p3 | I would like the pancakes, please. | 주문 틀 1 | enb-17 | 팬케이크 주세요. |
| enb-p4 | Can I have the pancakes, please? | 주문 틀 2 | enb-18 | 팬케이크 먹어도 될까요? |
| enb-p5 | No, thank you. That is all. | 주문 끝내기 | enb-20 | 아니요, 고맙습니다. 그게 다예요. |
| enb-p6 | Can we have the check, please? | 계산서 요청 | enb-27 | 계산서 주시겠어요? |
| enb-p7 | How much is it? | 값 묻기 | enb-30 | 얼마예요? |
| enb-p8 | Sorry, can you say that again? | 되묻기 | enb-25 | 죄송해요, 다시 말해 주시겠어요? |

### 미니게임 차례

미션은 시간 상한이 없는 작은 미니게임이다 (docs/outings.md 3장). 차례마다 NPC 줄 하나(없을 수 있다)와 두 사람이 고르는 줄이 있다.
`n` 으로 시작하는 차례는 NPC 만 말하는 이음 차례라 점수를 안 센다 (`고르는 줄` 이 `-`). `+` 는 NPC 가 이어서 말한다. `고르는 줄` 은 `/` 로 가른 후보 중 **하나만 말하면 통과**다 (기계가 넉넉하게 듣는다. game.md 6.1). `자리` 는 누가 말하나 (`A` `B` `둘 중 누구든`).
결과는 차례마다 통과 / 거의 / 못함이다. **통과** = 후보 중 하나를 첫 시도에 말했다. **거의** = 되묻기(enb-25)나 한 번 더 듣고 말했다. **못함** = 건너뛰기를 골랐거나 세 번 시도해도 못 했다. 시계는 없다.
미션 전체: 통과 차례가 77% 이상이면 통과, 54% 이상이면 거의, 그 밖에는 못함 (13차례면 10과 7). 못해도 아무것도 안 잠기고 같은 미션을 다시 열 수 있다.

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | door | enb-01 | enb-02 | 둘 중 누구든 |
| n1 | door | enb-03+enb-04 | - | - |
| t2 | drink | enb-05 | enb-06/enb-07/enb-08 | 둘 중 누구든 |
| n2 | drink | enb-09 | - | - |
| t3 | order | enb-10 | enb-11 | 둘 중 누구든 |
| t4 | order | - | enb-12 | A |
| t5 | order | - | enb-13 | B |
| t6 | order | enb-14 | enb-15/enb-16 | A |
| t7 | order | enb-14 | enb-17/enb-18 | B |
| t8 | order | enb-19 | enb-20 | 둘 중 누구든 |
| t9 | food | enb-21 | enb-22 | 둘 중 누구든 |
| t10 | food | enb-23 | enb-24/enb-25/enb-26 | 둘 중 누구든 |
| t11 | pay | - | enb-27 | 둘 중 누구든 |
| t12 | pay | enb-28 | enb-29/enb-30 | 둘 중 누구든 |
| t13 | pay | enb-32 | enb-33 | 둘 중 누구든 |
