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

## 나들이: cookie_snack

작성자: claude-sonnet-5.5 (2026-10-10)
장소: honolulu_cookie_company
세션: 23
목표 등급: A1
할 일: cd-cookie-1 / I can choose cookies, say how many, pay, and say thank you. / 쿠키를 고르고, 몇 개인지 말하고, 값을 내고, 고맙다고 말할 수 있다.
허용 이름: -

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| cs-01 | door | npc | Clerk | Hi! Can I help you? | A1 | 인사 안내 | A | - | 안녕하세요! 도와드릴까요? |
| cs-02 | door | wait | 두 사람 | Hi! Cookies, please. | A1 | 인사 주문 | A | - | 안녕하세요! 쿠키 주세요. |
| cs-03 | flavor | npc | Clerk | Chocolate or coconut? | A1 | 고르게 묻기 | A | - | 초콜릿이요, 코코넛이요? |
| cs-04 | flavor | option | A자리 | Chocolate, please. | A1 | 맛 고르기 | A | - | 초콜릿으로 주세요. |
| cs-05 | flavor | option | A자리 | Coconut, please. | A1 | 맛 고르기 | A | - | 코코넛으로 주세요. |
| cs-06 | flavor | npc | Clerk | And for you? | A1 | 상대에게 묻기 | A | - | 그쪽은요? |
| cs-07 | flavor | option | B자리 | The same, please. | A1 | 같은 것 고르기 | A | - | 같은 걸로 주세요. |
| cs-08 | flavor | option | B자리 | One of each, please. | A1 | 하나씩 고르기 | A | - | 하나씩 주세요. |
| cs-09 | count | wait | A자리 | Two or four, {B}? | A1 | 상대에게 묻기 | A | - | {B}, 두 개? 네 개? |
| cs-10 | count | wait | B자리 | I want four. And you? | A1 | 말하고 되묻기 | A | - | 난 네 개. 너는? |
| cs-11 | count | npc | Clerk | How many cookies? | A1 | 수량 묻기 | A | - | 쿠키 몇 개요? |
| cs-12 | count | option | 두 사람 | Two cookies, please. | A1 | 수량 말하기 | A | - | 쿠키 두 개 주세요. |
| cs-13 | count | option | 두 사람 | Four cookies, please. | A1 | 수량 말하기 | A | - | 쿠키 네 개 주세요. |
| cs-14 | count | option | 두 사람 | Six cookies, please. | A1 | 수량 말하기 | A | - | 쿠키 여섯 개 주세요. |
| cs-15 | more | npc | Clerk | Okay. Is that all? | A1 | 추가 묻기 | A | - | 네. 이게 다예요? |
| cs-16 | more | option | 두 사람 | Yes, that is all. | A1 | 대답 | A | - | 네, 그게 다예요. |
| cs-17 | more | option | 두 사람 | One more, please. | A1 | 추가 요청 | A | - | 하나 더 주세요. |
| cs-18 | bag | npc | Clerk | A bag or a box? | A1 | 고르게 묻기 | A | - | 봉지에 드릴까요, 상자에 드릴까요? |
| cs-19 | bag | option | 두 사람 | A bag, please. | A1 | 고르기 | A | - | 봉지에 주세요. |
| cs-20 | bag | option | 두 사람 | A box, please. | A1 | 고르기 | A | - | 상자에 주세요. |
| cs-21 | pay | wait | 두 사람 | How much is it? | A1 | 값 묻기 | A | - | 얼마예요? |
| cs-22 | pay | npc | Clerk | That is eleven dollars. Cash or card? | A1 | 값 말하기 결제 묻기 | A | - | 11달러예요. 현금이세요, 카드세요? |
| cs-23 | pay | option | 두 사람 | Cash, please. | A1 | 결제 | A | - | 현금으로 할게요. |
| cs-24 | pay | option | 두 사람 | Card, please. | A1 | 결제 | A | - | 카드로 할게요. |
| cs-25 | pay | option | 두 사람 | Sorry, can you say that one more time? | A2 | 되묻기 | A | - | 죄송해요, 한 번만 더 말해 주시겠어요? |
| cs-26 | thanks | npc | Clerk | Here are your cookies. Enjoy! | A1 | 물건 내기 | A | - | 쿠키 여기 있어요. 맛있게 드세요! |
| cs-27 | thanks | wait | 두 사람 | Thank you very much! | A1 | 감사 | A | - | 정말 고맙습니다! |
| cs-28 | share | wait | A자리 | Do you want one now, {B}? | A1 | 권하기 | A | - | {B}, 지금 하나 먹을래? |
| cs-29 | share | wait | B자리 | Yes, please! | A1 | 대답 | A | - | 응, 줘! |
| cs-30 | bye | npc | Clerk | You are welcome! Have a nice day! | A1 | 작별 | A | - | 천만에요! 좋은 하루 보내세요! |
| cs-31 | bye | wait | 두 사람 | You too! Bye! | A1 | 작별 | A | - | 당신도요! 안녕히 계세요! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량(Q1 판정 75 등)에 안 들어간다. **나들이 안에서만 쓰는 연습 말**이다. 줄 id 로 위 표를 가리킨다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| cs-p1 | Chocolate, please. | 맛 고르기 | cs-04 | 초콜릿으로 주세요. |
| cs-p2 | One of each, please. | 하나씩 고르기 | cs-08 | 하나씩 주세요. |
| cs-p3 | Four cookies, please. | 수량 말하기 | cs-13 | 쿠키 네 개 주세요. |
| cs-p4 | Yes, that is all. | 대답 | cs-16 | 네, 그게 다예요. |
| cs-p5 | A box, please. | 고르기 | cs-20 | 상자에 주세요. |
| cs-p6 | How much is it? | 값 묻기 | cs-21 | 얼마예요? |
| cs-p7 | Sorry, can you say that one more time? | 되묻기 | cs-25 | 죄송해요, 한 번만 더 말해 주시겠어요? |
| cs-p8 | Thank you very much! | 감사 | cs-27 | 정말 고맙습니다! |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | door | cs-01 | cs-02 | 둘 중 누구든 |
| t2 | flavor | cs-03 | cs-04/cs-05 | A |
| t3 | flavor | cs-06 | cs-07/cs-08 | B |
| t4 | count | - | cs-09 | A |
| t5 | count | - | cs-10 | B |
| t6 | count | cs-11 | cs-12/cs-13/cs-14 | 둘 중 누구든 |
| t7 | more | cs-15 | cs-16/cs-17 | 둘 중 누구든 |
| t8 | bag | cs-18 | cs-19/cs-20 | 둘 중 누구든 |
| t9 | pay | - | cs-21 | 둘 중 누구든 |
| t10 | pay | cs-22 | cs-23/cs-24/cs-25 | 둘 중 누구든 |
| t11 | thanks | cs-26 | cs-27 | 둘 중 누구든 |
| t12 | share | - | cs-28 | A |
| t13 | share | - | cs-29 | B |
| t14 | bye | cs-30 | cs-31 | 둘 중 누구든 |

## 나들이: shave_ice_snack

작성자: claude-sonnet-5.5 (2026-10-10)
장소: waiola_shave_ice
세션: 26
목표 등급: A1
할 일: cd-shave-1 / I can choose a flavor and a size and order shave ice. / 맛과 크기를 골라 빙수를 주문할 수 있다.
허용 이름: -

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| si-01 | door | npc | Clerk | Hi! What can I get you? | A1 | 인사 주문 묻기 | A | - | 안녕하세요! 뭐 드릴까요? |
| si-02 | door | wait | 두 사람 | Shave ice, please. | A1 | 주문 | A | - | 빙수 주세요. |
| si-03 | size | npc | Clerk | Small, medium, or large? | A2 | 크기 묻기 | A | - | 작은 거, 중간 거, 큰 거 중에 어떤 걸로 할까요? |
| si-04 | size | option | A자리 | Small, please. | A1 | 크기 고르기 | A | - | 작은 걸로 주세요. |
| si-05 | size | option | A자리 | Medium, please. | A1 | 크기 고르기 | A | - | 중간 걸로 주세요. |
| si-06 | size | option | A자리 | Large, please. | A1 | 크기 고르기 | A | - | 큰 걸로 주세요. |
| si-07 | size | npc | Clerk | What size for your friend? | A1 | 크기 묻기 | A | - | 친구분은 어떤 크기로 할까요? |
| si-08 | size | option | B자리 | The same size, please. | A1 | 같은 것 고르기 | A | - | 같은 크기로 주세요. |
| si-09 | size | option | B자리 | A small one, please. | A1 | 크기 고르기 | A | - | 작은 것 하나 주세요. |
| si-10 | flavor | npc | Clerk | What flavor? | A1 | 맛 묻기 | A | - | 무슨 맛으로 할까요? |
| si-11 | flavor | option | A자리 | Strawberry, please. | A1 | 맛 고르기 | A | - | 딸기 맛으로 주세요. |
| si-12 | flavor | option | A자리 | Mango, please. | A1 | 맛 고르기 | A | - | 망고 맛으로 주세요. |
| si-13 | flavor | npc | Clerk | And what flavor for your friend? | A1 | 맛 묻기 | A | - | 친구분은 무슨 맛으로 할까요? |
| si-14 | flavor | option | B자리 | Lemon, please. | A1 | 맛 고르기 | A | - | 레몬 맛으로 주세요. |
| si-15 | flavor | option | B자리 | The same flavor, please. | A1 | 같은 것 고르기 | A | - | 같은 맛으로 주세요. |
| si-16 | cream | npc | Clerk | With ice cream? | A1 | 선택 묻기 | A | - | 아이스크림도 넣을까요? |
| si-17 | cream | option | 두 사람 | Yes, please. | A1 | 예 대답 | A | - | 네, 넣어 주세요. |
| si-18 | cream | option | 두 사람 | No, thank you. | A1 | 아니오 대답 | A | - | 아니요, 괜찮아요. |
| si-19 | spoon | npc | Clerk | One spoon or two? | A1 | 수량 묻기 | A | - | 숟가락은 하나요, 두 개요? |
| si-20 | spoon | option | 두 사람 | One spoon, please. | A1 | 수량 말하기 | A | - | 숟가락 하나 주세요. |
| si-21 | spoon | option | 두 사람 | Two spoons, please. | A1 | 수량 말하기 | A | - | 숟가락 두 개 주세요. |
| si-22 | pay | wait | 두 사람 | How much for two? | A1 | 값 묻기 | A | - | 두 개에 얼마예요? |
| si-23 | pay | npc | Clerk | That is eight dollars. | A1 | 값 말하기 | A | - | 8달러예요. |
| si-24 | pay | option | 두 사람 | Here is ten dollars. | A1 | 값 내기 | B | 돈을 건네며 하는 말로 "Here you go."가 더 흔할 수 있다. 금액을 넣어 "Here is twenty dollars."라고 해도 이해는 되지만 원어민이 실제로 이렇게 말하는 빈도에는 확신이 없다 | 여기 10달러요. |
| si-25 | pay | option | 두 사람 | Sorry, can you say that again? | A2 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| si-26 | pay | npc | Clerk | Here is your change. Thank you! | A1 | 거스름돈 감사 | A | - | 거스름돈 여기 있어요. 고맙습니다! |
| si-27 | pay | wait | 두 사람 | Thank you! | A1 | 감사 | A | - | 고맙습니다! |
| si-28 | food | npc | Clerk | Here is your shave ice. Enjoy! | A1 | 음식 내기 | A | - | 빙수 여기 있어요. 맛있게 드세요! |
| si-29 | food | wait | 두 사람 | Wow, it is big! | A1 | 감탄 | A | - | 와, 크다! |
| si-30 | talk | wait | A자리 | Is it good, {B}? | A1 | 상대에게 묻기 | A | - | 맛있어, {B}? |
| si-31 | talk | option | B자리 | It is very good! | A1 | 대답 | A | - | 아주 맛있어! |
| si-32 | talk | option | B자리 | It is very cold! | A1 | 대답 | A | - | 아주 차가워! |
| si-33 | bye | npc | Clerk | Have a nice day! | A1 | 작별 | A | - | 좋은 하루 보내세요! |
| si-34 | bye | wait | 두 사람 | You too! Bye! | A1 | 작별 | A | - | 당신도요! 안녕히 계세요! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량(Q1 판정 75 등)에 안 들어간다. **나들이 안에서만 쓰는 연습 말**이다. 줄 id 로 위 표를 가리킨다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| si-p1 | Shave ice, please. | 주문 | si-02 | 빙수 주세요. |
| si-p2 | Medium, please. | 크기 고르기 | si-05 | 중간 걸로 주세요. |
| si-p3 | Mango, please. | 맛 고르기 | si-12 | 망고 맛으로 주세요. |
| si-p4 | The same flavor, please. | 같은 것 고르기 | si-15 | 같은 맛으로 주세요. |
| si-p5 | No, thank you. | 아니오 대답 | si-18 | 아니요, 괜찮아요. |
| si-p6 | Two spoons, please. | 수량 말하기 | si-21 | 숟가락 두 개 주세요. |
| si-p7 | How much for two? | 값 묻기 | si-22 | 두 개에 얼마예요? |
| si-p8 | Sorry, can you say that again? | 되묻기 | si-25 | 죄송해요, 다시 말해 주시겠어요? |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | door | si-01 | si-02 | 둘 중 누구든 |
| t2 | size | si-03 | si-04/si-05/si-06 | A |
| t3 | size | si-07 | si-08/si-09 | B |
| t4 | flavor | si-10 | si-11/si-12 | A |
| t5 | flavor | si-13 | si-14/si-15 | B |
| t6 | cream | si-16 | si-17/si-18 | 둘 중 누구든 |
| t7 | spoon | si-19 | si-20/si-21 | 둘 중 누구든 |
| t8 | pay | - | si-22 | 둘 중 누구든 |
| t9 | pay | si-23 | si-24/si-25 | 둘 중 누구든 |
| t10 | pay | si-26 | si-27 | 둘 중 누구든 |
| t11 | food | si-28 | si-29 | 둘 중 누구든 |
| t12 | talk | - | si-30 | A |
| t13 | talk | - | si-31/si-32 | B |
| t14 | bye | si-33 | si-34 | 둘 중 누구든 |

## 나들이: musubi_day

작성자: claude-sonnet-5.5 (2026-10-10)
장소: musubi_cafe_iyasume
세션: 28
목표 등급: A1
할 일: cd-musubi-1 / I can choose a kind of musubi, say how many, and buy it. / 무스비 종류를 고르고 개수를 말해 살 수 있다.
허용 이름: Spam

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| mu-01 | door | npc | Clerk | Hello! Welcome! | A1 | 인사 | A | - | 안녕하세요! 어서 오세요! |
| mu-02 | door | wait | 두 사람 | Hi! One minute, please. | A1 | 시간 벌기 | A | - | 안녕하세요! 잠깐만요. |
| mu-03 | talk | wait | A자리 | Spam or chicken, {B}? | A1 | 상대에게 묻기 | A | - | {B}, 스팸? 치킨? |
| mu-04 | talk | wait | B자리 | Spam for me. And you? | A1 | 말하고 되묻기 | A | - | 난 스팸. 너는? |
| mu-05 | kind | npc | Clerk | What kind of musubi? | A1 | 종류 묻기 | A | - | 무스비는 어떤 걸로 할까요? |
| mu-06 | kind | option | A자리 | Spam, please. | A1 | 종류 고르기 | A | - | 스팸으로 주세요. |
| mu-07 | kind | option | A자리 | Chicken, please. | A1 | 종류 고르기 | A | - | 치킨으로 주세요. |
| mu-08 | kind | option | A자리 | Egg, please. | A1 | 종류 고르기 | A | - | 달걀로 주세요. |
| mu-09 | count | npc | Clerk | How many? | A1 | 수량 묻기 | A | - | 몇 개요? |
| mu-10 | count | option | B자리 | Two, please. | A1 | 수량 말하기 | A | - | 두 개 주세요. |
| mu-11 | count | option | B자리 | Three, please. | A1 | 수량 말하기 | A | - | 세 개 주세요. |
| mu-12 | count | option | B자리 | One each, please. | A1 | 수량 말하기 | A | - | 하나씩 주세요. |
| mu-13 | more | npc | Clerk | Anything else? | A1 | 추가 묻기 | A | - | 더 필요한 건요? |
| mu-14 | more | option | 두 사람 | No, that is all. | A1 | 대답 | A | - | 아니요, 그게 다예요. |
| mu-15 | more | option | 두 사람 | One more Spam musubi, please. | A1 | 추가 요청 | A | - | 스팸 무스비 하나 더 주세요. |
| mu-16 | go | npc | Clerk | For here or to go? | A1 | 고르게 묻기 | A | - | 여기서 드실 건가요, 포장하실 건가요? |
| mu-17 | go | option | 두 사람 | For here, please. | A1 | 고르기 | A | - | 여기서 먹을게요. |
| mu-18 | go | option | 두 사람 | To go, please. | A1 | 고르기 | A | - | 포장해 주세요. |
| mu-19 | pay | wait | A자리 | How much is one? | A1 | 값 묻기 | A | - | 하나에 얼마예요? |
| mu-20 | pay | npc | Clerk | Each one is three dollars. | A1 | 값 말하기 | A | - | 하나에 3달러예요. |
| mu-21 | pay | option | 두 사람 | Okay. Card, please. | A1 | 결제 | A | - | 알겠어요. 카드로 할게요. |
| mu-22 | pay | option | 두 사람 | Okay. Cash, please. | A1 | 결제 | A | - | 알겠어요. 현금으로 할게요. |
| mu-23 | pay | option | 두 사람 | Sorry, can you say that again? | A2 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| mu-24 | napkin | npc | Clerk | Do you want a napkin? | A1 | 선택 묻기 | A | - | 냅킨 필요하세요? |
| mu-25 | napkin | option | 두 사람 | Yes, please. | A1 | 예 대답 | A | - | 네, 주세요. |
| mu-26 | napkin | option | 두 사람 | No, thank you. | A1 | 아니오 대답 | A | - | 아니요, 괜찮아요. |
| mu-27 | food | npc | Clerk | Here is your musubi. Enjoy! | A1 | 음식 내기 | A | - | 무스비 여기 있어요. 맛있게 드세요! |
| mu-28 | food | wait | 두 사람 | Thank you! | A1 | 감사 | A | - | 고맙습니다! |
| mu-29 | eat | wait | A자리 | Is it good, {B}? | A1 | 상대에게 묻기 | A | - | 맛있어, {B}? |
| mu-30 | eat | option | B자리 | Yes, it is very good. | A1 | 대답 | A | - | 응, 아주 맛있어. |
| mu-31 | eat | option | B자리 | It is okay. | A1 | 대답 | A | - | 괜찮아. |
| mu-32 | bye | npc | Clerk | Have a nice day! | A1 | 작별 | A | - | 좋은 하루 보내세요! |
| mu-33 | bye | wait | 두 사람 | You too! Thank you! | A1 | 작별 | A | - | 당신도요! 고맙습니다! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량(Q1 판정 75 등)에 안 들어간다. **나들이 안에서만 쓰는 연습 말**이다. 줄 id 로 위 표를 가리킨다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| mu-p1 | Hi! One minute, please. | 시간 벌기 | mu-02 | 안녕하세요! 잠깐만요. |
| mu-p2 | Spam, please. | 종류 고르기 | mu-06 | 스팸으로 주세요. |
| mu-p3 | One each, please. | 수량 말하기 | mu-12 | 하나씩 주세요. |
| mu-p4 | To go, please. | 고르기 | mu-18 | 포장해 주세요. |
| mu-p5 | For here, please. | 고르기 | mu-17 | 여기서 먹을게요. |
| mu-p6 | How much is one? | 값 묻기 | mu-19 | 하나에 얼마예요? |
| mu-p7 | No, thank you. | 아니오 대답 | mu-26 | 아니요, 괜찮아요. |
| mu-p8 | Sorry, can you say that again? | 되묻기 | mu-23 | 죄송해요, 다시 말해 주시겠어요? |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | door | mu-01 | mu-02 | 둘 중 누구든 |
| t2 | talk | - | mu-03 | A |
| t3 | talk | - | mu-04 | B |
| t4 | kind | mu-05 | mu-06/mu-07/mu-08 | A |
| t5 | count | mu-09 | mu-10/mu-11/mu-12 | B |
| t6 | more | mu-13 | mu-14/mu-15 | 둘 중 누구든 |
| t7 | go | mu-16 | mu-17/mu-18 | 둘 중 누구든 |
| t8 | pay | - | mu-19 | A |
| t9 | pay | mu-20 | mu-21/mu-22/mu-23 | 둘 중 누구든 |
| t10 | napkin | mu-24 | mu-25/mu-26 | 둘 중 누구든 |
| t11 | food | mu-27 | mu-28 | 둘 중 누구든 |
| t12 | eat | - | mu-29 | A |
| t13 | eat | - | mu-30/mu-31 | B |
| t14 | bye | mu-32 | mu-33 | 둘 중 누구든 |

## 나들이: leonards_malasadas

작성자: claude-sonnet-5.5 (2026-10-10)
장소: leonards_bakery
세션: 37
목표 등급: A1
할 일: cd-mala-1 / I can say how many malasadas I want and ask for a box. / 말라사다 개수를 말하고 상자에 담아 달라고 부탁할 수 있다.
허용 이름: -

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| lm-01 | door | npc | Clerk | Aloha! Next, please. | A1 | 인사 부르기 | B | 가게 점원이 손님을 "Aloha! Next, please."로 부르는 것이 하와이 빵집에서 실제로 흔한지 확신이 없다. 말 자체는 쉽고 틀리지 않는다 | 알로하! 다음 분 오세요. |
| lm-02 | door | wait | 두 사람 | Hello! Malasadas, please. | A1 | 인사 주문 | A | - | 안녕하세요! 말라사다 주세요. |
| lm-03 | count | npc | Clerk | How many? | A1 | 수량 묻기 | A | - | 몇 개요? |
| lm-04 | count | option | 두 사람 | Two, please. | A1 | 수량 말하기 | A | - | 두 개 주세요. |
| lm-05 | count | option | 두 사람 | Six, please. | A1 | 수량 말하기 | A | - | 여섯 개 주세요. |
| lm-06 | count | option | 두 사람 | Twelve, please. | A1 | 수량 말하기 | A | - | 열두 개 주세요. |
| lm-07 | type | npc | Clerk | Sugar or cinnamon? | A1 | 고르게 묻기 | A | - | 설탕이요, 시나몬이요? |
| lm-08 | type | option | A자리 | Sugar, please. | A1 | 고르기 | A | - | 설탕으로 주세요. |
| lm-09 | type | option | A자리 | Cinnamon, please. | A1 | 고르기 | A | - | 시나몬으로 주세요. |
| lm-10 | type | option | A자리 | Half and half, please. | A1 | 반반 고르기 | A | - | 반반으로 주세요. |
| lm-11 | check | wait | B자리 | Is that enough, {A}? | A1 | 상대에게 묻기 | A | - | {A}, 그 정도면 충분해? |
| lm-12 | check | wait | A자리 | Yes, that is enough. | A1 | 대답 | A | - | 응, 충분해. |
| lm-13 | more | npc | Clerk | Anything else? | A1 | 추가 묻기 | A | - | 더 필요한 건요? |
| lm-14 | more | option | 두 사람 | No, thank you. That is all. | A1 | 주문 끝내기 | A | - | 아니요, 고맙습니다. 그게 다예요. |
| lm-15 | more | option | 두 사람 | Two more, please. | A1 | 추가 요청 | A | - | 두 개 더 주세요. |
| lm-16 | go | npc | Clerk | For here or to go? | A1 | 고르게 묻기 | A | - | 여기서 드실 건가요, 포장하실 건가요? |
| lm-17 | go | option | 두 사람 | To go, please. | A1 | 고르기 | A | - | 포장해 주세요. |
| lm-18 | go | option | 두 사람 | For here, please. | A1 | 고르기 | A | - | 여기서 먹을게요. |
| lm-19 | box | option | B자리 | Can I have a box, please? | A2 | 포장 부탁 | A | - | 상자에 담아 주시겠어요? |
| lm-20 | box | option | B자리 | Can I have a bag, please? | A2 | 포장 부탁 | A | - | 봉지에 담아 주시겠어요? |
| lm-21 | pay | wait | A자리 | How much is that? | A1 | 값 묻기 | A | - | 얼마예요? |
| lm-22 | pay | npc | Clerk | Your total is fourteen dollars. | A1 | 값 말하기 | A | - | 합계는 14달러예요. |
| lm-23 | pay | option | 두 사람 | Card, please. | A1 | 결제 | A | - | 카드로 할게요. |
| lm-24 | pay | option | 두 사람 | Here is twenty dollars. | A1 | 값 내기 | B | 돈을 건네며 하는 말로 "Here you go."가 더 흔할 수 있다. 금액을 넣어 "Here is twenty dollars."라고 해도 이해는 되지만 원어민이 실제로 이렇게 말하는 빈도에는 확신이 없다 | 여기 20달러요. |
| lm-25 | pay | option | 두 사람 | Sorry, can you say that again? | A2 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| lm-26 | hot | npc | Clerk | Here you go. Careful, they are hot! | A2 | 물건 내기 주의 | A | - | 여기 있어요. 조심하세요, 뜨거워요! |
| lm-27 | hot | wait | 두 사람 | Thank you! They smell so good! | A1 | 감사 감탄 | A | - | 고맙습니다! 냄새가 정말 좋아요! |
| lm-28 | try | wait | A자리 | Try one, {B}! | A1 | 권하기 | A | - | 하나 먹어 봐, {B}! |
| lm-29 | try | option | B자리 | It is so good! | A1 | 대답 | A | - | 정말 맛있어! |
| lm-30 | try | option | B자리 | Wow, it is hot! | A1 | 대답 | A | - | 와, 뜨거워! |
| lm-31 | bye | npc | Clerk | Have a nice day! | A1 | 작별 | A | - | 좋은 하루 보내세요! |
| lm-32 | bye | wait | 두 사람 | You too! Bye! | A1 | 작별 | A | - | 당신도요! 안녕히 계세요! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량(Q1 판정 75 등)에 안 들어간다. **나들이 안에서만 쓰는 연습 말**이다. 줄 id 로 위 표를 가리킨다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| lm-p1 | Six, please. | 수량 말하기 | lm-05 | 여섯 개 주세요. |
| lm-p2 | Half and half, please. | 반반 고르기 | lm-10 | 반반으로 주세요. |
| lm-p3 | Two more, please. | 추가 요청 | lm-15 | 두 개 더 주세요. |
| lm-p4 | To go, please. | 고르기 | lm-17 | 포장해 주세요. |
| lm-p5 | Can I have a box, please? | 포장 부탁 | lm-19 | 상자에 담아 주시겠어요? |
| lm-p6 | How much is that? | 값 묻기 | lm-21 | 얼마예요? |
| lm-p7 | Here is twenty dollars. | 값 내기 | lm-24 | 여기 20달러요. |
| lm-p8 | Sorry, can you say that again? | 되묻기 | lm-25 | 죄송해요, 다시 말해 주시겠어요? |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | door | lm-01 | lm-02 | 둘 중 누구든 |
| t2 | count | lm-03 | lm-04/lm-05/lm-06 | 둘 중 누구든 |
| t3 | type | lm-07 | lm-08/lm-09/lm-10 | A |
| t4 | check | - | lm-11 | B |
| t5 | check | - | lm-12 | A |
| t6 | more | lm-13 | lm-14/lm-15 | 둘 중 누구든 |
| t7 | go | lm-16 | lm-17/lm-18 | 둘 중 누구든 |
| t8 | box | - | lm-19/lm-20 | B |
| t9 | pay | - | lm-21 | A |
| t10 | pay | lm-22 | lm-23/lm-24/lm-25 | 둘 중 누구든 |
| t11 | hot | lm-26 | lm-27 | 둘 중 누구든 |
| t12 | try | - | lm-28 | A |
| t13 | try | - | lm-29/lm-30 | B |
| t14 | bye | lm-31 | lm-32 | 둘 중 누구든 |

## 나들이: food_truck_lunch

작성자: claude-sonnet-5.5 (2026-10-10)
장소: -
세션: 39
목표 등급: A1
할 일: cd-truck-1 / I can order a lunch plate and answer yes or no to questions. / 점심 메뉴 하나를 주문하고 질문에 예 아니오로 대답할 수 있다.
허용 이름: -

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| ft-01 | talk | wait | A자리 | Chicken or fish, {B}? | A1 | 상대에게 묻기 | A | - | {B}, 치킨? 생선? |
| ft-02 | talk | wait | B자리 | Chicken for me. And you? | A1 | 말하고 되묻기 | A | - | 난 치킨. 너는? |
| ft-03 | menu | npc | Clerk | Hi! What would you like? | A2 | 인사 주문 묻기 | A | - | 안녕하세요! 뭘 드릴까요? |
| ft-04 | menu | option | A자리 | A chicken plate, please. | A1 | 주문 | A | - | 치킨 플레이트 하나 주세요. |
| ft-05 | menu | option | A자리 | A fish plate, please. | A1 | 주문 | A | - | 생선 플레이트 하나 주세요. |
| ft-06 | menu | npc | Clerk | And for you? | A1 | 상대에게 묻기 | A | - | 그쪽은요? |
| ft-07 | menu | option | B자리 | The same, please. | A1 | 같은 것 고르기 | A | - | 같은 걸로 주세요. |
| ft-08 | menu | option | B자리 | A chicken plate, please. | A1 | 주문 | A | - | 치킨 플레이트 하나 주세요. |
| ft-09 | rice | npc | Clerk | Rice or salad? | A1 | 고르게 묻기 | A | - | 밥이요, 샐러드요? |
| ft-10 | rice | option | 두 사람 | Rice, please. | A1 | 고르기 | A | - | 밥으로 주세요. |
| ft-11 | rice | option | 두 사람 | Salad, please. | A1 | 고르기 | A | - | 샐러드로 주세요. |
| ft-12 | spicy | npc | Clerk | Do you want it spicy? | A1 | 예 아니오 묻기 | A | - | 맵게 해 드릴까요? |
| ft-13 | spicy | option | 두 사람 | Yes, please. | A1 | 예 대답 | A | - | 네, 그렇게 해 주세요. |
| ft-14 | spicy | option | 두 사람 | No, thank you. | A1 | 아니오 대답 | A | - | 아니요, 괜찮아요. |
| ft-15 | spicy | option | 두 사람 | A little, please. | A1 | 정도 말하기 | A | - | 조금만 해 주세요. |
| ft-16 | drink | npc | Clerk | Do you want a drink? | A1 | 예 아니오 묻기 | A | - | 음료는 필요하세요? |
| ft-17 | drink | option | B자리 | Water, please. | A1 | 음료 주문 | A | - | 물 주세요. |
| ft-18 | drink | option | B자리 | No, thank you. | A1 | 아니오 대답 | A | - | 아니요, 괜찮아요. |
| ft-19 | pay | wait | A자리 | How much is that? | A1 | 값 묻기 | A | - | 얼마예요? |
| ft-20 | pay | npc | Clerk | That is sixteen dollars. | A1 | 값 말하기 | A | - | 16달러예요. |
| ft-21 | pay | option | 두 사람 | Card, please. | A1 | 결제 | A | - | 카드로 할게요. |
| ft-22 | pay | option | 두 사람 | Here is twenty dollars. | A1 | 값 내기 | B | 돈을 건네며 하는 말로 "Here you go."가 더 흔할 수 있다. 금액을 넣어 "Here is twenty dollars."라고 해도 이해는 되지만 원어민이 실제로 이렇게 말하는 빈도에는 확신이 없다 | 여기 20달러요. |
| ft-23 | pay | option | 두 사람 | Sorry, can you say that again? | A2 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| ft-24 | receipt | npc | Clerk | Do you want a receipt? | A1 | 예 아니오 묻기 | A | - | 영수증 드릴까요? |
| ft-25 | receipt | option | A자리 | Yes, please. | A1 | 예 대답 | A | - | 네, 주세요. |
| ft-26 | receipt | option | A자리 | No, thank you. | A1 | 아니오 대답 | A | - | 아니요, 괜찮아요. |
| ft-27 | number | npc | Clerk | Your number is fourteen. Please wait here. | A1 | 안내 | A | - | 번호는 14번이에요. 여기서 기다려 주세요. |
| ft-28 | number | wait | 두 사람 | Okay, thank you. | A1 | 대답 | A | - | 네, 고맙습니다. |
| ft-29 | call | npc | Clerk | Number fourteen! | A1 | 번호 부르기 | A | - | 14번 손님! |
| ft-30 | call | wait | 두 사람 | Here! Thank you! | A1 | 대답 감사 | A | - | 여기요! 고맙습니다! |
| ft-31 | food | npc | Clerk | Here you go. Enjoy your lunch! | A1 | 음식 내기 | A | - | 여기 있어요. 점심 맛있게 드세요! |
| ft-32 | food | wait | 두 사람 | Thank you very much! | A1 | 감사 | A | - | 정말 고맙습니다! |
| ft-33 | eat | wait | A자리 | Is it good, {B}? | A1 | 상대에게 묻기 | A | - | 맛있어, {B}? |
| ft-34 | eat | option | B자리 | Yes, it is very good. | A1 | 대답 | A | - | 응, 아주 맛있어. |
| ft-35 | eat | option | B자리 | It is a little spicy! | A1 | 대답 | A | - | 조금 매워! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량(Q1 판정 75 등)에 안 들어간다. **나들이 안에서만 쓰는 연습 말**이다. 줄 id 로 위 표를 가리킨다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| ft-p1 | A fish plate, please. | 주문 | ft-05 | 생선 플레이트 하나 주세요. |
| ft-p2 | The same, please. | 같은 것 고르기 | ft-07 | 같은 걸로 주세요. |
| ft-p3 | Rice, please. | 고르기 | ft-10 | 밥으로 주세요. |
| ft-p4 | Yes, please. | 예 대답 | ft-13 | 네, 그렇게 해 주세요. |
| ft-p5 | No, thank you. | 아니오 대답 | ft-14 | 아니요, 괜찮아요. |
| ft-p6 | A little, please. | 정도 말하기 | ft-15 | 조금만 해 주세요. |
| ft-p7 | How much is that? | 값 묻기 | ft-19 | 얼마예요? |
| ft-p8 | Here! Thank you! | 대답 감사 | ft-30 | 여기요! 고맙습니다! |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | talk | - | ft-01 | A |
| t2 | talk | - | ft-02 | B |
| t3 | menu | ft-03 | ft-04/ft-05 | A |
| t4 | menu | ft-06 | ft-07/ft-08 | B |
| t5 | rice | ft-09 | ft-10/ft-11 | 둘 중 누구든 |
| t6 | spicy | ft-12 | ft-13/ft-14/ft-15 | 둘 중 누구든 |
| t7 | drink | ft-16 | ft-17/ft-18 | B |
| t8 | pay | - | ft-19 | A |
| t9 | pay | ft-20 | ft-21/ft-22/ft-23 | 둘 중 누구든 |
| t10 | receipt | ft-24 | ft-25/ft-26 | A |
| t11 | number | ft-27 | ft-28 | 둘 중 누구든 |
| t12 | call | ft-29 | ft-30 | 둘 중 누구든 |
| t13 | food | ft-31 | ft-32 | 둘 중 누구든 |
| t14 | eat | - | ft-33 | A |
| t15 | eat | - | ft-34/ft-35 | B |

## 나들이: cheesecake_dessert

작성자: claude-sonnet-5.5 (2026-10-10)
장소: cheesecake_factory
세션: 43
목표 등급: A1
할 일: cd-cheese-1 / I can choose a dessert and a drink and order them. / 디저트 하나를 고르고 음료와 함께 주문할 수 있다.
허용 이름: Cheesecake, Factory

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| cc-01 | door | npc | Host | Welcome to The Cheesecake Factory! Table for two? | A2 | 인사 인원 묻기 | A | - | 치즈케이크 팩토리에 어서 오세요! 두 분이세요? |
| cc-02 | door | wait | 두 사람 | Yes, please. | A1 | 대답 | A | - | 네, 부탁해요. |
| cc-03 | door | npc | Host | Follow me, please. Here are your menus. | A1 | 안내 | A | - | 따라오세요. 메뉴 여기 있어요. |
| cc-04 | drink | npc | Server | Hi! What would you like to drink? | A2 | 음료 묻기 | A | - | 안녕하세요! 마실 것은 뭘로 하시겠어요? |
| cc-05 | drink | option | A자리 | Coffee, please. | A1 | 음료 주문 | A | - | 커피 주세요. |
| cc-06 | drink | option | A자리 | Tea, please. | A1 | 음료 주문 | A | - | 차 주세요. |
| cc-07 | drink | npc | Server | And for you? | A1 | 상대에게 묻기 | A | - | 그쪽은요? |
| cc-08 | drink | option | B자리 | Lemonade, please. | A1 | 음료 주문 | A | - | 레모네이드 주세요. |
| cc-09 | drink | option | B자리 | Milk, please. | A1 | 음료 주문 | A | - | 우유 주세요. |
| cc-10 | pick | wait | A자리 | Cheesecake or chocolate cake, {B}? | A1 | 상대에게 묻기 | A | - | {B}, 치즈케이크? 초콜릿 케이크? |
| cc-11 | pick | wait | B자리 | Cheesecake for me. And you? | A1 | 말하고 되묻기 | A | - | 난 치즈케이크. 너는? |
| cc-12 | order | npc | Server | What would you like? | A2 | 주문 묻기 | A | - | 뭘로 하시겠어요? |
| cc-13 | order | option | A자리 | A piece of cheesecake, please. | A1 | 주문 | A | - | 치즈케이크 한 조각 주세요. |
| cc-14 | order | option | A자리 | A piece of chocolate cake, please. | A1 | 주문 | A | - | 초콜릿 케이크 한 조각 주세요. |
| cc-15 | order | npc | Server | What about you? | A1 | 상대에게 묻기 | A | - | 그쪽은요? |
| cc-16 | order | option | B자리 | The same, please. | A1 | 같은 것 고르기 | A | - | 같은 걸로 주세요. |
| cc-17 | order | option | B자리 | Cheesecake, please. | A1 | 주문 | A | - | 치즈케이크 주세요. |
| cc-18 | fork | wait | 두 사람 | Can we have two forks, please? | A2 | 부탁 | A | - | 포크 두 개 주시겠어요? |
| cc-19 | fork | npc | Server | Sure. I will be right back. | A2 | 안내 | A | - | 그럼요. 금방 올게요. |
| cc-20 | cream | npc | Server | Do you want ice cream with it? | A1 | 예 아니오 묻기 | A | - | 아이스크림도 같이 드릴까요? |
| cc-21 | cream | option | A자리 | Yes, please. | A1 | 예 대답 | A | - | 네, 주세요. |
| cc-22 | cream | option | A자리 | No, thank you. | A1 | 아니오 대답 | A | - | 아니요, 괜찮아요. |
| cc-23 | food | npc | Server | Here is your dessert. Enjoy! | A1 | 음식 내기 | A | - | 디저트 여기 있어요. 맛있게 드세요! |
| cc-24 | food | wait | 두 사람 | Thank you! It looks so good! | A1 | 감사 감탄 | A | - | 고맙습니다! 정말 맛있어 보여요! |
| cc-25 | eat | wait | A자리 | Is it good, {B}? | A1 | 상대에게 묻기 | A | - | 맛있어, {B}? |
| cc-26 | eat | option | B자리 | Yes, it is very good. | A1 | 대답 | A | - | 응, 아주 맛있어. |
| cc-27 | eat | option | B자리 | It is so sweet! | A1 | 대답 | A | - | 정말 달아! |
| cc-28 | pay | wait | 두 사람 | Check, please. | A1 | 계산서 요청 | A | - | 계산서 주세요. |
| cc-29 | pay | npc | Server | Here is the check. It is eighteen dollars. | A1 | 값 말하기 | A | - | 계산서 여기 있어요. 18달러예요. |
| cc-30 | pay | option | 두 사람 | Card, please. | A1 | 결제 | A | - | 카드로 할게요. |
| cc-31 | pay | option | 두 사람 | Here is twenty dollars. | A1 | 값 내기 | B | 돈을 건네며 하는 말로 "Here you go."가 더 흔할 수 있다. 금액을 넣어 "Here is twenty dollars."라고 해도 이해는 되지만 원어민이 실제로 이렇게 말하는 빈도에는 확신이 없다 | 여기 20달러요. |
| cc-32 | pay | option | 두 사람 | Sorry, can you say that again? | A2 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| cc-33 | bye | npc | Server | Thank you! Have a nice day! | A1 | 작별 | A | - | 고맙습니다! 좋은 하루 보내세요! |
| cc-34 | bye | wait | 두 사람 | Thank you! Bye! | A1 | 작별 | A | - | 고맙습니다! 안녕히 계세요! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량(Q1 판정 75 등)에 안 들어간다. **나들이 안에서만 쓰는 연습 말**이다. 줄 id 로 위 표를 가리킨다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| cc-p1 | Coffee, please. | 음료 주문 | cc-05 | 커피 주세요. |
| cc-p2 | Lemonade, please. | 음료 주문 | cc-08 | 레모네이드 주세요. |
| cc-p3 | A piece of cheesecake, please. | 주문 | cc-13 | 치즈케이크 한 조각 주세요. |
| cc-p4 | The same, please. | 같은 것 고르기 | cc-16 | 같은 걸로 주세요. |
| cc-p5 | Can we have two forks, please? | 부탁 | cc-18 | 포크 두 개 주시겠어요? |
| cc-p6 | Check, please. | 계산서 요청 | cc-28 | 계산서 주세요. |
| cc-p7 | Here is twenty dollars. | 값 내기 | cc-31 | 여기 20달러요. |
| cc-p8 | Sorry, can you say that again? | 되묻기 | cc-32 | 죄송해요, 다시 말해 주시겠어요? |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | door | cc-01 | cc-02 | 둘 중 누구든 |
| n1 | door | cc-03 | - | - |
| t2 | drink | cc-04 | cc-05/cc-06 | A |
| t3 | drink | cc-07 | cc-08/cc-09 | B |
| t4 | pick | - | cc-10 | A |
| t5 | pick | - | cc-11 | B |
| t6 | order | cc-12 | cc-13/cc-14 | A |
| t7 | order | cc-15 | cc-16/cc-17 | B |
| t8 | fork | - | cc-18 | 둘 중 누구든 |
| n2 | fork | cc-19 | - | - |
| t9 | cream | cc-20 | cc-21/cc-22 | A |
| t10 | food | cc-23 | cc-24 | 둘 중 누구든 |
| t11 | eat | - | cc-25 | A |
| t12 | eat | - | cc-26/cc-27 | B |
| t13 | pay | - | cc-28 | 둘 중 누구든 |
| t14 | pay | cc-29 | cc-30/cc-31/cc-32 | 둘 중 누구든 |
| t15 | bye | cc-33 | cc-34 | 둘 중 누구든 |

## 나들이: neighbor_greeting

작성자: claude-sonnet-5.5 (2026-10-10)
장소: -
세션: 15
목표 등급: A1
할 일: cd-ng-1 / I can greet a neighbor and say my name. / 이웃에게 인사하고 내 이름을 말할 수 있다.
허용 이름: Pat (이웃 NPC의 이름. 가게 이름이 아니라 인물 이름)
갈래: ng-08 > ng-09

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| ng-01 | hello | npc | Neighbor | Hello! How are you? | A1 | 인사 안부 묻기 | A | - | 안녕하세요! 어떻게 지내세요? |
| ng-02 | hello | option | 두 사람 | I'm fine, thank you. And you? | A1 | 안부 대답 | A | - | 잘 지내요, 고맙습니다. 당신은요? |
| ng-03 | hello | option | 두 사람 | Good, thank you. And you? | A1 | 안부 대답 | A | - | 좋아요, 고맙습니다. 당신은요? |
| ng-04 | hello | npc | Neighbor | I'm fine too. Thank you! | A1 | 안부 대답 | A | - | 저도 잘 지내요. 고맙습니다! |
| ng-05 | hello | npc | Neighbor | Are you new here? | A1 | 묻기 | A | - | 여기 새로 오셨어요? |
| ng-06 | hello | option | 두 사람 | Yes, we are new. | A1 | 대답 | A | - | 네, 저희는 새로 왔어요. |
| ng-07 | hello | option | 두 사람 | Yes, we are. | A1 | 대답 | A | - | 네, 맞아요. |
| ng-08 | hello | option | 두 사람 | Sorry, can you say that again? | A1 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| ng-09 | hello | npc | Neighbor | Sure. Are you new here? | A1 | 되풀이 | A | - | 그럼요. 여기 새로 오셨어요? |
| ng-10 | name | npc | Neighbor | Welcome! I'm Pat. | A1 | 환영 소개 | A | - | 환영해요! 저는 팻이에요. |
| ng-11 | name | npc | Neighbor | What's your name? | A1 | 이름 묻기 | A | - | 이름이 뭐예요? |
| ng-12 | name | option | A자리 | My name is {A}. | A1 | 이름 말하기 | A | - | 제 이름은 {A}예요. |
| ng-13 | name | option | A자리 | I'm {A}. | A1 | 이름 말하기 | A | - | 저는 {A}예요. |
| ng-14 | name | npc | Neighbor | Nice to meet you, {A}. And you? | A1 | 인사 되묻기 | A | - | 만나서 반가워요, {A}. 당신은요? |
| ng-15 | name | option | B자리 | My name is {B}. | A1 | 이름 말하기 | A | - | 제 이름은 {B}예요. |
| ng-16 | name | option | B자리 | I'm {B}. | A1 | 이름 말하기 | A | - | 저는 {B}예요. |
| ng-17 | name | npc | Neighbor | Nice to meet you, {B}. | A1 | 인사 | A | - | 만나서 반가워요, {B}. |
| ng-18 | name | wait | 두 사람 | Nice to meet you too. | A1 | 인사 | A | - | 저도 만나서 반가워요. |
| ng-19 | chat | npc | Neighbor | Do you like it here? | A1 | 묻기 | A | - | 여기가 마음에 드세요? |
| ng-20 | chat | option | 두 사람 | Yes, I like it. | A1 | 대답 | A | - | 네, 마음에 들어요. |
| ng-21 | chat | option | 두 사람 | Yes, it is very nice. | A1 | 대답 | A | - | 네, 아주 좋아요. |
| ng-22 | chat | option | 두 사람 | Yes, it is beautiful. | A1 | 대답 | A | - | 네, 아름다워요. |
| ng-23 | bye | npc | Neighbor | Well, I have to go. See you soon! | A1 | 작별 | A | - | 그럼, 저는 가 봐야 해요. 곧 또 봐요! |
| ng-24 | bye | option | 두 사람 | Bye, Pat! See you soon! | A1 | 작별 | A | - | 안녕히 가세요, 팻! 곧 또 봐요! |
| ng-25 | bye | option | 두 사람 | Goodbye, Pat! Have a nice day! | A1 | 작별 | A | - | 안녕히 가세요, 팻! 좋은 하루 보내세요! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량에 안 들어간다. 나들이 안에서만 쓰는 연습 말이다 (설명은 eggs_n_things_breakfast 장과 같다).

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| ng-p1 | I'm fine, thank you. And you? | 안부 대답 | ng-02 | 잘 지내요, 고맙습니다. 당신은요? |
| ng-p2 | Yes, we are new. | 대답 | ng-06 | 네, 저희는 새로 왔어요. |
| ng-p3 | My name is {A}. | 이름 말하기 틀 1 | ng-12 | 제 이름은 {A}예요. |
| ng-p4 | I'm {A}. | 이름 말하기 틀 2 | ng-13 | 저는 {A}예요. |
| ng-p5 | Nice to meet you too. | 인사 | ng-18 | 저도 만나서 반가워요. |
| ng-p6 | Sorry, can you say that again? | 되묻기 | ng-08 | 죄송해요, 다시 말해 주시겠어요? |
| ng-p7 | Yes, it is very nice. | 대답 | ng-21 | 네, 아주 좋아요. |
| ng-p8 | Goodbye, Pat! Have a nice day! | 작별 | ng-25 | 안녕히 가세요, 팻! 좋은 하루 보내세요! |

### 미니게임 차례

규칙은 eggs_n_things_breakfast 장과 같다 (`-` 는 NPC 만 말하거나 고르는 줄이 없는 차례, `+` 는 NPC 가 이어서 말함, `/` 는 후보 중 하나만 말하면 통과).

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | hello | ng-01 | ng-02/ng-03 | 둘 중 누구든 |
| t2 | hello | ng-04+ng-05 | ng-06/ng-07/ng-08 | 둘 중 누구든 |
| t3 | name | ng-10+ng-11 | ng-12/ng-13 | A |
| t4 | name | ng-14 | ng-15/ng-16 | B |
| t5 | name | ng-17 | ng-18 | 둘 중 누구든 |
| t6 | chat | ng-19 | ng-20/ng-21/ng-22 | 둘 중 누구든 |
| t7 | bye | ng-23 | ng-24/ng-25 | 둘 중 누구든 |

## 나들이: hotel_front_desk

작성자: claude-sonnet-5.5 (2026-10-10)
장소: outrigger_reef
세션: 17
목표 등급: A1
할 일: cd-hf-1 / I can say my room number and ask for towels at a hotel front desk. / 호텔 프런트에서 방 번호를 말하고 수건을 부탁할 수 있다.
허용 이름: Outrigger Reef (아웃리거 리프. 장소 이름. 줄에는 안 쓴다)
갈래: hf-10 > hf-11, hf-28 > hf-30, hf-29 > hf-30

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| hf-01 | desk | wait | 두 사람 | Excuse me. | A1 | 말 걸기 | A | - | 실례합니다. |
| hf-02 | desk | npc | Clerk | Hello! How can I help you? | A1 | 인사 안내 | A | - | 안녕하세요! 무엇을 도와드릴까요? |
| hf-03 | desk | option | 두 사람 | We need towels, please. | A1 | 부탁 | A | - | 수건이 필요해요. |
| hf-04 | desk | option | 두 사람 | Can we have towels, please? | A1 | 부탁 | A | - | 수건 좀 주시겠어요? |
| hf-05 | desk | option | 두 사람 | Towels, please. | A1 | 부탁 | A | - | 수건 주세요. |
| hf-06 | room | npc | Clerk | Okay. What is your room number? | A1 | 방 번호 묻기 | A | - | 네. 방 번호가 어떻게 되세요? |
| hf-07 | room | option | A자리 | Room four-one-two. | A1 | 방 번호 말하기 | B | 방 번호를 한 자리씩 읽는 말투와 하이픈 표기가 이 등급에서 자연스러운지, TTS 가 어떻게 읽을지 확신이 없다 | 412호예요. |
| hf-08 | room | option | A자리 | It is room three-oh-five. | A1 | 방 번호 말하기 | B | 방 번호를 한 자리씩 읽는 말투와 하이픈 표기가 이 등급에서 자연스러운지, TTS 가 어떻게 읽을지 확신이 없다 | 305호예요. |
| hf-09 | room | option | A자리 | Room six-one-eight. | A1 | 방 번호 말하기 | B | 방 번호를 한 자리씩 읽는 말투와 하이픈 표기가 이 등급에서 자연스러운지, TTS 가 어떻게 읽을지 확신이 없다 | 618호예요. |
| hf-10 | room | option | A자리 | Sorry, can you say that again? | A1 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| hf-11 | room | npc | Clerk | Sure. Your room number, please? | A1 | 되풀이 | A | - | 그럼요. 방 번호가요? |
| hf-12 | name | npc | Clerk | Thank you. And your name, please? | A1 | 이름 묻기 | A | - | 고맙습니다. 성함도 알려 주세요. |
| hf-13 | name | option | B자리 | My name is {B}. | A1 | 이름 말하기 | A | - | 제 이름은 {B}예요. |
| hf-14 | name | option | B자리 | I'm {B}. | A1 | 이름 말하기 | A | - | 저는 {B}예요. |
| hf-15 | stay | npc | Clerk | Thank you, {B}. Are you enjoying your stay? | A2 | 안부 묻기 | A | - | 고맙습니다, {B}. 머무시는 건 즐거우세요? |
| hf-16 | stay | option | 두 사람 | Yes, it is very nice. | A1 | 대답 | A | - | 네, 아주 좋아요. |
| hf-17 | stay | option | 두 사람 | Yes, we like it. | A1 | 대답 | A | - | 네, 마음에 들어요. |
| hf-18 | count | npc | Clerk | Okay. How many towels? | A1 | 수 묻기 | A | - | 네. 수건 몇 장이요? |
| hf-19 | count | option | 두 사람 | Two, please. | A1 | 수 말하기 | A | - | 두 장이요. |
| hf-20 | count | option | 두 사람 | Four towels, please. | A1 | 수 말하기 | A | - | 수건 네 장이요. |
| hf-21 | count | option | 두 사람 | Just one, please. | A1 | 수 말하기 | A | - | 한 장만요. |
| hf-22 | more | npc | Clerk | Anything else? | A1 | 추가 묻기 | A | - | 더 필요한 건요? |
| hf-23 | more | option | 두 사람 | No, thank you. That is all. | A1 | 주문 끝내기 | A | - | 아니요, 고맙습니다. 그게 다예요. |
| hf-24 | more | option | 두 사람 | Another key, please. | A1 | 부탁 | A | - | 열쇠 하나 더 주세요. |
| hf-25 | more | option | 두 사람 | Two bottles of water, please. | A1 | 부탁 | A | - | 물 두 병 주세요. |
| hf-26 | bring | npc | Clerk | Okay. We will bring it soon. | A1 | 안내 | A | - | 네. 곧 가져다 드릴게요. |
| hf-27 | bring | wait | 두 사람 | Thank you very much. | A1 | 감사 | A | - | 정말 고맙습니다. |
| hf-28 | ask | option | 두 사람 | Where is the elevator? | A1 | 위치 묻기 | A | - | 엘리베이터가 어디예요? |
| hf-29 | ask | option | 두 사람 | Where is the pool? | A1 | 위치 묻기 | A | - | 수영장이 어디예요? |
| hf-30 | ask | npc | Clerk | It is over there, on the right. | A1 | 위치 안내 | A | - | 저쪽 오른쪽에 있어요. |
| hf-31 | ask | npc | Clerk | Have a nice day! | A1 | 작별 | A | - | 좋은 하루 보내세요! |
| hf-32 | ask | wait | 두 사람 | Thank you. You too! | A1 | 작별 | A | - | 고맙습니다. 당신도요! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량에 안 들어간다. 나들이 안에서만 쓰는 연습 말이다 (설명은 eggs_n_things_breakfast 장과 같다).

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| hf-p1 | Excuse me. | 말 걸기 | hf-01 | 실례합니다. |
| hf-p2 | We need towels, please. | 부탁 틀 1 | hf-03 | 수건이 필요해요. |
| hf-p3 | Can we have towels, please? | 부탁 틀 2 | hf-04 | 수건 좀 주시겠어요? |
| hf-p4 | Where is the pool? | 위치 묻기 | hf-29 | 수영장이 어디예요? |
| hf-p5 | Two bottles of water, please. | 부탁 수 말하기 | hf-25 | 물 두 병 주세요. |
| hf-p6 | Sorry, can you say that again? | 되묻기 | hf-10 | 죄송해요, 다시 말해 주시겠어요? |
| hf-p7 | Where is the elevator? | 위치 묻기 | hf-28 | 엘리베이터가 어디예요? |
| hf-p8 | No, thank you. That is all. | 끝내기 | hf-23 | 아니요, 고맙습니다. 그게 다예요. |

### 미니게임 차례

규칙은 eggs_n_things_breakfast 장과 같다 (`-` 는 NPC 만 말하거나 고르는 줄이 없는 차례, `+` 는 NPC 가 이어서 말함, `/` 는 후보 중 하나만 말하면 통과).

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | desk | - | hf-01 | 둘 중 누구든 |
| t2 | desk | hf-02 | hf-03/hf-04/hf-05 | 둘 중 누구든 |
| t3 | room | hf-06 | hf-07/hf-08/hf-09/hf-10 | A |
| t4 | name | hf-12 | hf-13/hf-14 | B |
| t5 | stay | hf-15 | hf-16/hf-17 | 둘 중 누구든 |
| t6 | count | hf-18 | hf-19/hf-20/hf-21 | 둘 중 누구든 |
| t7 | more | hf-22 | hf-23/hf-24/hf-25 | 둘 중 누구든 |
| t8 | bring | hf-26 | hf-27 | 둘 중 누구든 |
| t9 | ask | - | hf-28/hf-29 | 둘 중 누구든 |
| t10 | ask | hf-31 | hf-32 | 둘 중 누구든 |

## 나들이: cafe_order

작성자: claude-sonnet-5.5 (2026-10-10)
장소: island_vintage_coffee
세션: 20
목표 등급: A1
할 일: cd-cf-1 / I can order a drink and say the size at a cafe. / 카페에서 음료 하나를 주문하고 크기를 말할 수 있다.
허용 이름: Island Vintage Coffee (아일랜드 빈티지 커피. 장소 이름. 줄에는 안 쓴다)
갈래: cf-05 > cf-06

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| cf-01 | drink | npc | Cashier | Hi! What can I get you? | A1 | 주문 묻기 | A | - | 안녕하세요! 뭘 드릴까요? |
| cf-02 | drink | option | A자리 | Coffee, please. | A1 | 음료 주문 | A | - | 커피 주세요. |
| cf-03 | drink | option | A자리 | A latte, please. | A1 | 음료 주문 | A | - | 라테 주세요. |
| cf-04 | drink | option | A자리 | Tea, please. | A1 | 음료 주문 | A | - | 차 주세요. |
| cf-05 | drink | option | A자리 | Sorry, can you say that again? | A1 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| cf-06 | drink | npc | Cashier | Sure. What can I get you? | A1 | 되풀이 | A | - | 그럼요. 뭘 드릴까요? |
| cf-07 | temp | npc | Cashier | Hot or iced? | A1 | 고르기 묻기 | A | - | 따뜻한 걸로요, 차가운 걸로요? |
| cf-08 | temp | option | A자리 | Hot, please. | A1 | 고르기 | A | - | 따뜻한 걸로 주세요. |
| cf-09 | temp | option | A자리 | Iced, please. | A1 | 고르기 | A | - | 차가운 걸로 주세요. |
| cf-10 | size | npc | Cashier | What size? Small, medium or large? | A1 | 크기 묻기 | A | - | 어떤 크기로요? 작은 거, 중간, 큰 거요? |
| cf-11 | size | option | A자리 | Small, please. | A1 | 크기 말하기 | A | - | 작은 걸로 주세요. |
| cf-12 | size | option | A자리 | Medium, please. | A1 | 크기 말하기 | A | - | 중간 크기로 주세요. |
| cf-13 | size | option | A자리 | Large, please. | A1 | 크기 말하기 | A | - | 큰 걸로 주세요. |
| cf-14 | friend | npc | Cashier | And for you? | A1 | 상대에게 묻기 | A | - | 그럼 당신은요? |
| cf-15 | friend | option | B자리 | A latte, please. | A1 | 음료 주문 | A | - | 라테 주세요. |
| cf-16 | friend | option | B자리 | Orange juice, please. | A1 | 음료 주문 | A | - | 오렌지 주스 주세요. |
| cf-17 | friend | option | B자리 | Water, please. | A1 | 음료 주문 | A | - | 물 주세요. |
| cf-18 | friend | npc | Cashier | Small, medium or large? | A1 | 크기 묻기 | A | - | 작은 거, 중간, 큰 거요? |
| cf-19 | friend | option | B자리 | Small, please. | A1 | 크기 말하기 | A | - | 작은 걸로 주세요. |
| cf-20 | friend | option | B자리 | Large, please. | A1 | 크기 말하기 | A | - | 큰 걸로 주세요. |
| cf-21 | go | npc | Cashier | For here or to go? | A1 | 먹고 갈지 묻기 | A | - | 여기서 드실 거예요, 가져가실 거예요? |
| cf-22 | go | option | 두 사람 | For here, please. | A1 | 고르기 | A | - | 여기서 먹을게요. |
| cf-23 | go | option | 두 사람 | To go, please. | A1 | 고르기 | A | - | 가져갈게요. |
| cf-24 | name | npc | Cashier | What's your name? | A1 | 이름 묻기 | A | - | 이름이 뭐예요? |
| cf-25 | name | option | A자리 | It's {A}. | A1 | 이름 말하기 | A | - | {A}예요. |
| cf-26 | name | option | A자리 | My name is {A}. | A1 | 이름 말하기 | A | - | 제 이름은 {A}예요. |
| cf-27 | food | npc | Cashier | Anything else? | A1 | 추가 묻기 | A | - | 더 필요한 건요? |
| cf-28 | food | option | B자리 | A cookie, please. | A1 | 추가 주문 | A | - | 쿠키 하나 주세요. |
| cf-29 | food | option | B자리 | No, thank you. That is all. | A1 | 주문 끝내기 | A | - | 아니요, 고맙습니다. 그게 다예요. |
| cf-30 | pay | npc | Cashier | That's nine dollars. Cash or card? | A1 | 값 결제 묻기 | A | - | 9달러예요. 현금이세요, 카드세요? |
| cf-31 | pay | option | 두 사람 | Card, please. | A1 | 결제 | A | - | 카드로 할게요. |
| cf-32 | pay | option | 두 사람 | Cash, please. | A1 | 결제 | A | - | 현금으로 할게요. |
| cf-33 | pay | npc | Cashier | Thank you! We will call your name. | A1 | 안내 | A | - | 고맙습니다! 이름을 불러 드릴게요. |
| cf-34 | pay | wait | 두 사람 | Thank you! | A1 | 감사 | A | - | 고맙습니다! |
| cf-35 | pick | npc | Server | Here are your drinks. | A1 | 음료 내기 | A | - | 음료 나왔어요. |
| cf-36 | pick | wait | 두 사람 | Thank you very much! | A1 | 감사 | A | - | 정말 고맙습니다! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량에 안 들어간다. 나들이 안에서만 쓰는 연습 말이다 (설명은 eggs_n_things_breakfast 장과 같다).

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| cf-p1 | Coffee, please. | 음료 주문 | cf-02 | 커피 주세요. |
| cf-p2 | A latte, please. | 음료 주문 | cf-03 | 라테 주세요. |
| cf-p3 | Iced, please. | 고르기 | cf-09 | 차가운 걸로 주세요. |
| cf-p4 | Medium, please. | 크기 말하기 | cf-12 | 중간 크기로 주세요. |
| cf-p5 | To go, please. | 고르기 | cf-23 | 가져갈게요. |
| cf-p6 | It's {A}. | 이름 말하기 | cf-25 | {A}예요. |
| cf-p7 | Card, please. | 결제 | cf-31 | 카드로 할게요. |
| cf-p8 | Sorry, can you say that again? | 되묻기 | cf-05 | 죄송해요, 다시 말해 주시겠어요? |

### 미니게임 차례

규칙은 eggs_n_things_breakfast 장과 같다 (`-` 는 NPC 만 말하거나 고르는 줄이 없는 차례, `+` 는 NPC 가 이어서 말함, `/` 는 후보 중 하나만 말하면 통과).

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | drink | cf-01 | cf-02/cf-03/cf-04/cf-05 | A |
| t2 | temp | cf-07 | cf-08/cf-09 | A |
| t3 | size | cf-10 | cf-11/cf-12/cf-13 | A |
| t4 | friend | cf-14 | cf-15/cf-16/cf-17 | B |
| t5 | friend | cf-18 | cf-19/cf-20 | B |
| t6 | go | cf-21 | cf-22/cf-23 | 둘 중 누구든 |
| t7 | name | cf-24 | cf-25/cf-26 | A |
| t8 | food | cf-27 | cf-28/cf-29 | B |
| t9 | pay | cf-30 | cf-31/cf-32 | 둘 중 누구든 |
| t10 | pay | cf-33 | cf-34 | 둘 중 누구든 |
| t11 | pick | cf-35 | cf-36 | 둘 중 누구든 |

## 나들이: convenience_store_abc

작성자: claude-sonnet-5.5 (2026-10-10)
장소: -
세션: 22
목표 등급: A1
할 일: cd-ab-1 / I can find things in a store, ask the price and pay. / 편의점에서 물건을 찾고 값을 묻고 계산할 수 있다.
허용 이름: ABC Stores (실제 체인. 장소 이름. 줄에는 안 쓴다)
갈래: ab-13 > ab-15, ab-14 > ab-15, ab-22 > ab-23

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| ab-01 | shelf | npc | Clerk | Hi! Can I help you? | A1 | 인사 안내 | A | - | 안녕하세요! 도와드릴까요? |
| ab-02 | shelf | option | A자리 | Where is the water? | A1 | 위치 묻기 | A | - | 물이 어디 있어요? |
| ab-03 | shelf | option | A자리 | Where is the juice? | A1 | 위치 묻기 | A | - | 주스가 어디 있어요? |
| ab-04 | shelf | option | A자리 | Where are the snacks? | A1 | 위치 묻기 | A | - | 과자가 어디 있어요? |
| ab-05 | shelf | npc | Clerk | Over there, on the left. | A1 | 위치 안내 | A | - | 저쪽 왼쪽에 있어요. |
| ab-06 | shelf | wait | 두 사람 | Thank you! | A1 | 감사 | A | - | 고맙습니다! |
| ab-07 | shelf2 | npc | Clerk | Can I help you too? | A1 | 도움 묻기 | A | - | 당신도 도와드릴까요? |
| ab-08 | shelf2 | option | B자리 | Where is the sunscreen? | A1 | 위치 묻기 | A | - | 선크림이 어디 있어요? |
| ab-09 | shelf2 | option | B자리 | Where are the towels? | A1 | 위치 묻기 | A | - | 수건이 어디 있어요? |
| ab-10 | shelf2 | option | B자리 | Where are the hats? | A1 | 위치 묻기 | A | - | 모자가 어디 있어요? |
| ab-11 | shelf2 | npc | Clerk | Over there, on the right. | A1 | 위치 안내 | A | - | 저쪽 오른쪽에 있어요. |
| ab-12 | shelf2 | wait | 두 사람 | Thank you very much! | A1 | 감사 | A | - | 정말 고맙습니다! |
| ab-13 | price | option | A자리 | How much is this? | A1 | 값 묻기 | A | - | 이거 얼마예요? |
| ab-14 | price | option | A자리 | How much is it? | A1 | 값 묻기 | A | - | 얼마예요? |
| ab-15 | price | npc | Cashier | That's three dollars. | A1 | 값 말하기 | A | - | 3달러예요. |
| ab-16 | pay | npc | Cashier | Is that all? | A1 | 확인 | A | - | 이게 다예요? |
| ab-17 | pay | option | 두 사람 | Yes, that is all. | A1 | 대답 | A | - | 네, 그게 다예요. |
| ab-18 | pay | option | 두 사람 | Yes, thank you. | A1 | 대답 | A | - | 네, 고맙습니다. |
| ab-19 | pay | npc | Cashier | That's six dollars. Cash or card? | A1 | 값 결제 묻기 | A | - | 6달러예요. 현금이세요, 카드세요? |
| ab-20 | pay | option | B자리 | Card, please. | A1 | 결제 | A | - | 카드로 할게요. |
| ab-21 | pay | option | B자리 | Cash, please. | A1 | 결제 | A | - | 현금으로 할게요. |
| ab-22 | pay | option | B자리 | Sorry, can you say that again? | A1 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| ab-23 | pay | npc | Cashier | Sure. Cash or card? | A1 | 되풀이 | A | - | 그럼요. 현금이세요, 카드세요? |
| ab-24 | bag | npc | Cashier | Do you need a bag? | A1 | 봉투 묻기 | A | - | 봉투 필요하세요? |
| ab-25 | bag | option | A자리 | Yes, please. | A1 | 대답 | A | - | 네, 주세요. |
| ab-26 | bag | option | A자리 | No, thank you. | A1 | 대답 | A | - | 아니요, 괜찮아요. |
| ab-27 | bye | npc | Cashier | Here you are. Have a nice day! | A1 | 작별 | A | - | 여기 있어요. 좋은 하루 보내세요! |
| ab-28 | bye | wait | 두 사람 | Thank you! You too! | A1 | 작별 | A | - | 고맙습니다! 당신도요! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량에 안 들어간다. 나들이 안에서만 쓰는 연습 말이다 (설명은 eggs_n_things_breakfast 장과 같다).

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| ab-p1 | Where is the water? | 위치 묻기 틀 1 | ab-02 | 물이 어디 있어요? |
| ab-p2 | Where are the snacks? | 위치 묻기 틀 2 | ab-04 | 과자가 어디 있어요? |
| ab-p3 | Thank you very much! | 감사 | ab-12 | 정말 고맙습니다! |
| ab-p4 | How much is this? | 값 묻기 | ab-13 | 이거 얼마예요? |
| ab-p5 | Sorry, can you say that again? | 되묻기 | ab-22 | 죄송해요, 다시 말해 주시겠어요? |
| ab-p6 | Yes, that is all. | 대답 | ab-17 | 네, 그게 다예요. |
| ab-p7 | Card, please. | 결제 | ab-20 | 카드로 할게요. |
| ab-p8 | No, thank you. | 대답 | ab-26 | 아니요, 괜찮아요. |

### 미니게임 차례

규칙은 eggs_n_things_breakfast 장과 같다 (`-` 는 NPC 만 말하거나 고르는 줄이 없는 차례, `+` 는 NPC 가 이어서 말함, `/` 는 후보 중 하나만 말하면 통과).

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | shelf | ab-01 | ab-02/ab-03/ab-04 | A |
| t2 | shelf | ab-05 | ab-06 | 둘 중 누구든 |
| t3 | shelf2 | ab-07 | ab-08/ab-09/ab-10 | B |
| t4 | shelf2 | ab-11 | ab-12 | 둘 중 누구든 |
| t5 | price | - | ab-13/ab-14 | A |
| t7 | pay | ab-16 | ab-17/ab-18 | 둘 중 누구든 |
| t8 | pay | ab-19 | ab-20/ab-21/ab-22 | B |
| t9 | bag | ab-24 | ab-25/ab-26 | A |
| t10 | bye | ab-27 | ab-28 | 둘 중 누구든 |

## 나들이: pharmacy_basic

작성자: claude-sonnet-5.5 (2026-10-10)
장소: -
세션: 42
목표 등급: A1
할 일: cd-ph-1 / I can say what I need at a pharmacy and ask the price. / 약국에서 필요한 물건 이름을 말하고 값을 물을 수 있다.
허용 이름: -
갈래: ph-05 > ph-06, ph-10 > ph-12, ph-11 > ph-12, ph-18 > ph-20, ph-19 > ph-20, ph-24 > ph-25

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| ph-01 | door | npc | Clerk | Hello! Can I help you? | A1 | 인사 안내 | A | - | 안녕하세요! 도와드릴까요? |
| ph-02 | door | option | A자리 | I need sunscreen, please. | A1 | 물건 말하기 | A | - | 선크림이 필요해요. |
| ph-03 | door | option | A자리 | Do you have toothpaste? | A1 | 물건 말하기 | A | - | 치약 있어요? |
| ph-04 | door | option | A자리 | I need bandages, please. | A1 | 물건 말하기 | A | - | 반창고가 필요해요. |
| ph-05 | door | option | A자리 | Sorry, can you say that again? | A1 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| ph-06 | door | npc | Clerk | Sure. Can I help you? | A1 | 되풀이 | A | - | 그럼요. 도와드릴까요? |
| ph-07 | item | npc | Clerk | Yes, here it is. Small or large? | A1 | 찾아 주기 크기 묻기 | A | - | 네, 여기 있어요. 작은 거요, 큰 거요? |
| ph-08 | item | option | A자리 | Small, please. | A1 | 크기 말하기 | A | - | 작은 걸로 주세요. |
| ph-09 | item | option | A자리 | Large, please. | A1 | 크기 말하기 | A | - | 큰 걸로 주세요. |
| ph-10 | price1 | option | A자리 | How much is it? | A1 | 값 묻기 | A | - | 얼마예요? |
| ph-11 | price1 | option | A자리 | What is the price? | A1 | 값 묻기 | A | - | 가격이 얼마예요? |
| ph-12 | price1 | npc | Clerk | That's eight dollars. | A1 | 값 말하기 | A | - | 8달러예요. |
| ph-13 | more | npc | Clerk | Anything else? | A1 | 추가 묻기 | A | - | 더 필요한 건요? |
| ph-14 | more | option | B자리 | Soap, please. | A1 | 물건 말하기 | A | - | 비누 주세요. |
| ph-15 | more | option | B자리 | Shampoo, please. | A1 | 물건 말하기 | A | - | 샴푸 주세요. |
| ph-16 | more | option | B자리 | No, thank you. That is all. | A1 | 주문 끝내기 | A | - | 아니요, 고맙습니다. 그게 다예요. |
| ph-17 | price2 | npc | Clerk | Okay. Here you are. | A1 | 건네기 | A | - | 네. 여기 있어요. |
| ph-18 | price2 | option | B자리 | How much is this? | A1 | 값 묻기 | A | - | 이거 얼마예요? |
| ph-19 | price2 | option | B자리 | How much is the soap? | A1 | 값 묻기 | A | - | 비누는 얼마예요? |
| ph-20 | price2 | npc | Clerk | That's four dollars. | A1 | 값 말하기 | A | - | 4달러예요. |
| ph-21 | pay | npc | Clerk | That's twelve dollars. Cash or card? | A1 | 값 결제 묻기 | A | - | 12달러예요. 현금이세요, 카드세요? |
| ph-22 | pay | option | 두 사람 | Card, please. | A1 | 결제 | A | - | 카드로 할게요. |
| ph-23 | pay | option | 두 사람 | Cash, please. | A1 | 결제 | A | - | 현금으로 할게요. |
| ph-24 | pay | option | 두 사람 | Sorry, can you say that again? | A1 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| ph-25 | pay | npc | Clerk | Sure. Cash or card? | A1 | 되풀이 | A | - | 그럼요. 현금이세요, 카드세요? |
| ph-26 | bag | npc | Clerk | Do you need a bag? | A1 | 봉투 묻기 | A | - | 봉투 필요하세요? |
| ph-27 | bag | option | A자리 | Yes, please. | A1 | 대답 | A | - | 네, 주세요. |
| ph-28 | bag | option | A자리 | No, thank you. | A1 | 대답 | A | - | 아니요, 괜찮아요. |
| ph-29 | bye | npc | Clerk | Thank you. Have a nice day! | A1 | 작별 | A | - | 고맙습니다. 좋은 하루 보내세요! |
| ph-30 | bye | wait | 두 사람 | You too! Thank you! | A1 | 작별 | A | - | 당신도요! 고맙습니다! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량에 안 들어간다. 나들이 안에서만 쓰는 연습 말이다 (설명은 eggs_n_things_breakfast 장과 같다).

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| ph-p1 | I need sunscreen, please. | 물건 말하기 틀 1 | ph-02 | 선크림이 필요해요. |
| ph-p2 | Do you have toothpaste? | 물건 말하기 틀 2 | ph-03 | 치약 있어요? |
| ph-p3 | Small, please. | 크기 말하기 | ph-08 | 작은 걸로 주세요. |
| ph-p4 | How much is it? | 값 묻기 | ph-10 | 얼마예요? |
| ph-p5 | Soap, please. | 물건 말하기 | ph-14 | 비누 주세요. |
| ph-p6 | How much is the soap? | 값 묻기 | ph-19 | 비누는 얼마예요? |
| ph-p7 | Card, please. | 결제 | ph-22 | 카드로 할게요. |
| ph-p8 | Sorry, can you say that again? | 되묻기 | ph-05 | 죄송해요, 다시 말해 주시겠어요? |

### 미니게임 차례

규칙은 eggs_n_things_breakfast 장과 같다 (`-` 는 NPC 만 말하거나 고르는 줄이 없는 차례, `+` 는 NPC 가 이어서 말함, `/` 는 후보 중 하나만 말하면 통과).

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | door | ph-01 | ph-02/ph-03/ph-04/ph-05 | A |
| t2 | item | ph-07 | ph-08/ph-09 | A |
| t3 | price1 | - | ph-10/ph-11 | A |
| t4 | more | ph-13 | ph-14/ph-15/ph-16 | B |
| t5 | price2 | ph-17 | ph-18/ph-19 | B |
| t6 | pay | ph-21 | ph-22/ph-23/ph-24 | 둘 중 누구든 |
| t7 | bag | ph-26 | ph-27/ph-28 | A |
| t8 | bye | ph-29 | ph-30 | 둘 중 누구든 |

## 나들이: bus_fare_question

작성자: claude-sonnet-5.5 (2026-10-10)
장소: -
세션: 44
목표 등급: A1
할 일: cd-bs-1 / I can ask the bus fare and say where I get off. / 버스 요금을 묻고 내릴 곳을 말할 수 있다.
허용 이름: -
갈래: bs-02 > bs-04, bs-03 > bs-05, bs-06 > bs-09, bs-07 > bs-09, bs-08 > bs-09, bs-13 > bs-14, bs-17 > bs-19, bs-18 > bs-19, bs-20 > bs-22, bs-21 > bs-22

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| bs-01 | board | npc | Driver | Hi there! | A1 | 인사 | A | - | 안녕하세요! |
| bs-02 | board | option | A자리 | Does this bus go to the zoo? | A1 | 노선 묻기 | A | - | 이 버스 동물원 가요? |
| bs-03 | board | option | A자리 | Is this the bus to the zoo? | A1 | 노선 묻기 | A | - | 이 버스가 동물원 가는 버스예요? |
| bs-04 | board | npc | Driver | Yes, it does. | A1 | 대답 | A | - | 네, 가요. |
| bs-05 | board | npc | Driver | Yes, it is. | A1 | 대답 | A | - | 네, 맞아요. |
| bs-06 | fare | option | B자리 | How much is the fare? | A1 | 요금 묻기 | A | - | 요금이 얼마예요? |
| bs-07 | fare | option | B자리 | How much is it? | A1 | 요금 묻기 | A | - | 얼마예요? |
| bs-08 | fare | option | B자리 | How much is one ride? | A1 | 요금 묻기 | A | - | 한 번 타는 데 얼마예요? |
| bs-09 | fare | npc | Driver | It is three dollars each. | A1 | 요금 말하기 | B | 요금은 장면용으로 정한 숫자다. 실제 버스 요금과 같은지, 그리고 each 로 말하는 것이 이 등급에 맞는지 확신이 없다 | 한 사람에 3달러예요. |
| bs-10 | pay | npc | Driver | Pay here, please. | A1 | 안내 | B | 버스 기사가 요금을 받을 때 실제로 이렇게 말하는지 확신이 없다. 보통은 요금함을 가리키거나 말없이 기다릴 수 있다 | 여기에 내 주세요. |
| bs-11 | pay | option | 두 사람 | Here you are. | A1 | 건네기 | A | - | 여기 있어요. |
| bs-12 | pay | option | 두 사람 | Here is the money. | A1 | 건네기 | A | - | 돈 여기 있어요. |
| bs-13 | pay | option | 두 사람 | Sorry, can you say that again? | A1 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| bs-14 | pay | npc | Driver | Sure. Pay here, please. | A1 | 되풀이 | B | 버스 기사가 요금을 받을 때 실제로 이렇게 말하는지 확신이 없다. 보통은 요금함을 가리키거나 말없이 기다릴 수 있다 | 그럼요. 여기에 내 주세요. |
| bs-15 | seat | npc | Driver | Thank you. Please take a seat. | A1 | 안내 | A | - | 고맙습니다. 앉으세요. |
| bs-16 | seat | wait | 두 사람 | Thank you. | A1 | 감사 | A | - | 고맙습니다. |
| bs-17 | getoff | option | A자리 | We get off at the zoo. | A1 | 내릴 곳 말하기 | A | - | 저희는 동물원에서 내려요. |
| bs-18 | getoff | option | A자리 | Please tell us. We get off at the zoo. | A2 | 내릴 곳 말하기 부탁 | A | - | 알려 주세요. 저희는 동물원에서 내려요. |
| bs-19 | getoff | npc | Driver | Okay. I will tell you when we get there. | A2 | 안내 | A | - | 네. 도착하면 말씀드릴게요. |
| bs-20 | ride | option | B자리 | Is this the zoo? | A1 | 도착 묻기 | A | - | 여기가 동물원이에요? |
| bs-21 | ride | option | B자리 | Is this our stop? | A1 | 도착 묻기 | A | - | 여기가 우리가 내릴 곳이에요? |
| bs-22 | ride | npc | Driver | Not yet. The next stop is the zoo. | A1 | 대답 | A | - | 아직이에요. 다음 정류장이 동물원이에요. |
| bs-23 | stop | npc | Driver | This is the zoo! | A1 | 도착 알리기 | A | - | 동물원이에요! |
| bs-24 | stop | option | 두 사람 | Thank you! We get off here. | A1 | 내리기 | A | - | 고맙습니다! 여기서 내려요. |
| bs-25 | stop | option | 두 사람 | Thank you! This is our stop. | A1 | 내리기 | A | - | 고맙습니다! 여기가 우리가 내릴 곳이에요. |
| bs-26 | bye | npc | Driver | Have a nice day! | A1 | 작별 | A | - | 좋은 하루 보내세요! |
| bs-27 | bye | wait | 두 사람 | Thank you! Bye! | A1 | 작별 | A | - | 고맙습니다! 안녕히 가세요! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량에 안 들어간다. 나들이 안에서만 쓰는 연습 말이다 (설명은 eggs_n_things_breakfast 장과 같다).

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| bs-p1 | Does this bus go to the zoo? | 노선 묻기 | bs-02 | 이 버스 동물원 가요? |
| bs-p2 | How much is the fare? | 요금 묻기 틀 1 | bs-06 | 요금이 얼마예요? |
| bs-p3 | How much is it? | 요금 묻기 틀 2 | bs-07 | 얼마예요? |
| bs-p4 | Here you are. | 건네기 | bs-11 | 여기 있어요. |
| bs-p5 | We get off at the zoo. | 내릴 곳 말하기 | bs-17 | 저희는 동물원에서 내려요. |
| bs-p6 | Is this the zoo? | 도착 묻기 | bs-20 | 여기가 동물원이에요? |
| bs-p7 | Thank you! We get off here. | 내리기 | bs-24 | 고맙습니다! 여기서 내려요. |
| bs-p8 | Sorry, can you say that again? | 되묻기 | bs-13 | 죄송해요, 다시 말해 주시겠어요? |

### 미니게임 차례

규칙은 eggs_n_things_breakfast 장과 같다 (`-` 는 NPC 만 말하거나 고르는 줄이 없는 차례, `+` 는 NPC 가 이어서 말함, `/` 는 후보 중 하나만 말하면 통과).

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | board | bs-01 | bs-02/bs-03 | A |
| t2 | fare | - | bs-06/bs-07/bs-08 | B |
| t3 | pay | bs-10 | bs-11/bs-12/bs-13 | 둘 중 누구든 |
| t4 | seat | bs-15 | bs-16 | 둘 중 누구든 |
| t5 | getoff | - | bs-17/bs-18 | A |
| t6 | ride | - | bs-20/bs-21 | B |
| t7 | stop | bs-23 | bs-24/bs-25 | 둘 중 누구든 |
| t8 | bye | bs-26 | bs-27 | 둘 중 누구든 |

## 나들이: ala_moana_basic_shopping

작성자: claude-sonnet-5.5 (2026-10-10)
장소: ala_moana_center
세션: 45
목표 등급: A1
할 일: cd-am-1 / I can ask about size and price in a shop and pay. / 가게에서 크기와 값을 묻고 사서 계산할 수 있다.
허용 이름: -
갈래: am-16 > am-17, am-20 > am-21

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| am-01 | shop | npc | Clerk | Hi! Can I help you? | A1 | 인사 안내 | A | - | 안녕하세요! 도와드릴까요? |
| am-02 | shop | option | 두 사람 | I'm looking for a shirt. | A1 | 찾는 물건 말하기 | A | - | 셔츠를 찾고 있어요. |
| am-03 | shop | option | 두 사람 | I'm looking for a hat. | A1 | 찾는 물건 말하기 | A | - | 모자를 찾고 있어요. |
| am-04 | shop | option | 두 사람 | I'm looking for a dress. | A1 | 찾는 물건 말하기 | A | - | 원피스를 찾고 있어요. |
| am-05 | shop | npc | Clerk | Sure! It's over here. | A1 | 안내 | A | - | 그럼요! 이쪽에 있어요. |
| am-06 | shop | npc | Clerk | Take your time. | A1 | 안내 | A | - | 천천히 보세요. |
| am-07 | size | wait | A자리 | What size are you, {B}? | A1 | 상대에게 묻기 | A | - | {B}, 사이즈가 뭐예요? |
| am-08 | size | wait | B자리 | I'm a small. And you? | A1 | 말하고 되묻기 | A | - | 나는 스몰이에요. 너는요? |
| am-09 | size | npc | Clerk | What size do you want? | A1 | 크기 묻기 | A | - | 어떤 사이즈를 드릴까요? |
| am-10 | size | option | A자리 | Small, please. | A1 | 크기 말하기 | A | - | 스몰로 주세요. |
| am-11 | size | option | A자리 | Medium, please. | A1 | 크기 말하기 | A | - | 미디엄으로 주세요. |
| am-12 | size | option | A자리 | Large, please. | A1 | 크기 말하기 | A | - | 라지로 주세요. |
| am-13 | size | wait | B자리 | Do you have this in small? | A1 | 크기 묻기 | B | 'in small'과 'in a small' 중 미국 가게에서 어느 쪽이 더 흔한지 확신이 없다. 둘 다 들린다 | 이거 스몰 있어요? |
| am-14 | size | npc | Clerk | Let me check. Yes, we do. | A1 | 확인 | A | - | 확인해 볼게요. 네, 있어요. |
| am-15 | price | npc | Clerk | Here you go. | A1 | 건네기 | A | - | 여기 있어요. |
| am-16 | price | wait | 두 사람 | How much is this? | A1 | 값 묻기 | A | - | 이거 얼마예요? |
| am-17 | price | npc | Clerk | It's twenty dollars. | A1 | 값 말하기 | A | - | 20달러예요. |
| am-18 | price | option | 두 사람 | Okay. I'll take it. | A1 | 사기로 하기 | A | - | 네. 이걸로 할게요. |
| am-19 | price | option | 두 사람 | It's too much. | A1 | 비싸다고 말하기 | A | - | 너무 비싸요. |
| am-20 | price | option | 두 사람 | Sorry, can you say that again? | A2 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| am-21 | price | npc | Clerk | Sure. Twenty dollars. | A1 | 되풀이 | A | - | 네. 20달러예요. |
| am-22 | pay | npc | Cashier | Is that all? | A1 | 추가 묻기 | A | - | 이게 다예요? |
| am-23 | pay | wait | 두 사람 | Yes, that's all. | A1 | 대답 | A | - | 네, 그게 다예요. |
| am-24 | pay | npc | Cashier | Cash or card? | A1 | 결제 묻기 | A | - | 현금이세요, 카드세요? |
| am-25 | pay | option | 두 사람 | Card, please. | A1 | 결제 | A | - | 카드로 할게요. |
| am-26 | pay | option | 두 사람 | Cash, please. | A1 | 결제 | A | - | 현금으로 할게요. |
| am-27 | pay | npc | Cashier | Do you want a bag? | A1 | 봉투 묻기 | B | 점원은 'Do you need a bag?'나 'Would you like a bag?'를 더 자주 쓸 수 있다. want 가 조금 직설적인지 확신이 없다 | 봉투 필요하세요? |
| am-28 | pay | option | A자리 | Yes, please. | A1 | 대답 | A | - | 네, 주세요. |
| am-29 | pay | option | A자리 | No, thank you. | A1 | 대답 | A | - | 아니요, 괜찮아요. |
| am-30 | bye | npc | Cashier | Thank you! Have a nice day! | A1 | 작별 | A | - | 고맙습니다! 좋은 하루 보내세요! |
| am-31 | bye | wait | 두 사람 | You too! Bye! | A1 | 작별 | A | - | 당신도요! 안녕히 가세요! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량에 안 들어간다. **나들이 안에서만 쓰는 연습 말**이다. 줄 id 로 위 표를 가리킨다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| am-p1 | I'm looking for a shirt. | 찾는 물건 말하기 | am-02 | 셔츠를 찾고 있어요. |
| am-p2 | Medium, please. | 크기 말하기 | am-11 | 미디엄으로 주세요. |
| am-p3 | How much is this? | 값 묻기 | am-16 | 이거 얼마예요? |
| am-p4 | Okay. I'll take it. | 사기로 하기 | am-18 | 네. 이걸로 할게요. |
| am-p5 | Sorry, can you say that again? | 되묻기 | am-20 | 죄송해요, 다시 말해 주시겠어요? |
| am-p6 | Yes, that's all. | 대답 | am-23 | 네, 그게 다예요. |
| am-p7 | Card, please. | 결제 | am-25 | 카드로 할게요. |
| am-p8 | No, thank you. | 대답 | am-29 | 아니요, 괜찮아요. |

### 미니게임 차례

미션은 시간 상한이 없는 작은 미니게임이다 (docs/outings.md 3장). 차례마다 NPC 줄 하나(없을 수 있다)와 두 사람이 고르는 줄이 있다.

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | shop | am-01 | am-02/am-03/am-04 | 둘 중 누구든 |
| n1 | shop | am-05+am-06 | - | - |
| t2 | size | - | am-07 | A |
| t3 | size | - | am-08 | B |
| t4 | size | am-09 | am-10/am-11/am-12 | A |
| t5 | size | - | am-13 | B |
| n2 | size | am-14 | - | - |
| t6 | price | am-15 | am-16 | 둘 중 누구든 |
| t7 | price | - | am-18/am-19/am-20 | 둘 중 누구든 |
| t8 | pay | am-22 | am-23 | 둘 중 누구든 |
| t9 | pay | am-24 | am-25/am-26 | 둘 중 누구든 |
| t10 | pay | am-27 | am-28/am-29 | A |
| t11 | bye | am-30 | am-31 | 둘 중 누구든 |

## 나들이: waikiki_beach_chair_umbrella

작성자: claude-sonnet-5.5 (2026-10-10)
장소: waikiki_beach
세션: 30
목표 등급: A1
할 일: cd-bc-1 / I can rent a beach chair and an umbrella and ask the price. / 해변에서 의자와 우산을 빌리고 값을 물을 수 있다.
허용 이름: -
갈래: bc-09 > bc-10, bc-11 > bc-13, bc-12 > bc-13, bc-24 > bc-25

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| bc-01 | greet | npc | Clerk | Hi! Can I help you? | A1 | 인사 안내 | A | - | 안녕하세요! 도와드릴까요? |
| bc-02 | greet | wait | 두 사람 | One minute, please. | A1 | 시간 벌기 | A | - | 잠깐만요. |
| bc-03 | greet | npc | Clerk | Sure. Take your time. | A1 | 안내 | A | - | 그럼요. 천천히 하세요. |
| bc-04 | plan | wait | A자리 | Do you want an umbrella, {B}? | A1 | 상대에게 묻기 | A | - | {B}, 우산 쓸래? |
| bc-05 | plan | wait | B자리 | Yes! It's very hot. | A1 | 대답과 이유 | A | - | 응! 너무 더워. |
| bc-06 | order | npc | Clerk | Okay. What do you want? | A1 | 주문 묻기 | A | - | 네. 뭘 드릴까요? |
| bc-07 | order | option | 두 사람 | Two chairs, please. | A1 | 빌릴 것 말하기 | A | - | 의자 두 개 주세요. |
| bc-08 | order | option | 두 사람 | A chair and an umbrella, please. | A1 | 빌릴 것 말하기 | A | - | 의자 하나랑 우산 하나 주세요. |
| bc-09 | order | option | 두 사람 | Sorry, can you say that again? | A2 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| bc-10 | order | npc | Clerk | Sure. Chairs or umbrellas? | A1 | 되풀이 | A | - | 네. 의자요, 우산이요? |
| bc-11 | price | option | 두 사람 | How much is a chair? | A1 | 값 묻기 | A | - | 의자는 얼마예요? |
| bc-12 | price | option | 두 사람 | How much is it? | A1 | 값 묻기 | A | - | 얼마예요? |
| bc-13 | price | npc | Clerk | Ten dollars each. | A1 | 값 말하기 | A | - | 하나에 10달러예요. |
| bc-14 | more | npc | Clerk | Is that all? | A1 | 추가 묻기 | A | - | 이게 다예요? |
| bc-15 | more | wait | 두 사람 | Yes, that's all. | A1 | 대답 | A | - | 네, 그게 다예요. |
| bc-16 | pay | npc | Clerk | That's twenty dollars. | A1 | 값 말하기 | A | - | 20달러예요. |
| bc-17 | pay | wait | A자리 | Is twenty dollars okay, {B}? | A1 | 상대에게 묻기 | A | - | {B}, 20달러 괜찮아? |
| bc-18 | pay | wait | B자리 | Yes, that's okay. | A1 | 대답 | A | - | 응, 괜찮아. |
| bc-19 | pay | npc | Clerk | Cash or card? | A1 | 결제 묻기 | A | - | 현금이세요, 카드세요? |
| bc-20 | pay | option | 두 사람 | Cash, please. | A1 | 결제 | A | - | 현금으로 할게요. |
| bc-21 | pay | option | 두 사람 | Card, please. | A1 | 결제 | A | - | 카드로 할게요. |
| bc-22 | place | npc | Clerk | Your spot is on the left. | A1 | 위치 알려 주기 | B | 해변 대여소 직원이 자리를 정해 주는지는 실제 운영 방식을 모른다(장면용으로 정함). 'spot' 이라는 말은 자연스럽지만 직원이 이렇게 말하는지 확신이 없다 | 자리는 왼쪽이에요. |
| bc-23 | place | wait | 두 사람 | On the left. Thank you! | A1 | 확인과 감사 | A | - | 왼쪽이요. 고맙습니다! |
| bc-24 | place | wait | A자리 | Is it far? | A1 | 거리 묻기 | A | - | 멀어요? |
| bc-25 | place | npc | Clerk | No, it's near. | A1 | 대답 | A | - | 아니요, 가까워요. |
| bc-26 | bye | npc | Clerk | Have fun! | A1 | 작별 | A | - | 즐거운 시간 보내세요! |
| bc-27 | bye | wait | 두 사람 | Thank you! Bye! | A1 | 작별 | A | - | 고맙습니다! 안녕히 계세요! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량에 안 들어간다. **나들이 안에서만 쓰는 연습 말**이다. 줄 id 로 위 표를 가리킨다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| bc-p1 | One minute, please. | 시간 벌기 | bc-02 | 잠깐만요. |
| bc-p2 | Two chairs, please. | 빌릴 것 말하기 | bc-07 | 의자 두 개 주세요. |
| bc-p3 | A chair and an umbrella, please. | 빌릴 것 말하기 | bc-08 | 의자 하나랑 우산 하나 주세요. |
| bc-p4 | Sorry, can you say that again? | 되묻기 | bc-09 | 죄송해요, 다시 말해 주시겠어요? |
| bc-p5 | How much is a chair? | 값 묻기 | bc-11 | 의자는 얼마예요? |
| bc-p6 | Yes, that's all. | 대답 | bc-15 | 네, 그게 다예요. |
| bc-p7 | Cash, please. | 결제 | bc-20 | 현금으로 할게요. |
| bc-p8 | Is it far? | 거리 묻기 | bc-24 | 멀어요? |

### 미니게임 차례

미션은 시간 상한이 없는 작은 미니게임이다 (docs/outings.md 3장). 차례마다 NPC 줄 하나(없을 수 있다)와 두 사람이 고르는 줄이 있다.

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | greet | bc-01 | bc-02 | 둘 중 누구든 |
| n1 | greet | bc-03 | - | - |
| t2 | plan | - | bc-04 | A |
| t3 | plan | - | bc-05 | B |
| t4 | order | bc-06 | bc-07/bc-08/bc-09 | 둘 중 누구든 |
| t5 | price | - | bc-11/bc-12 | 둘 중 누구든 |
| t6 | more | bc-14 | bc-15 | 둘 중 누구든 |
| t7 | pay | bc-16 | bc-17 | A |
| t8 | pay | - | bc-18 | B |
| t9 | pay | bc-19 | bc-20/bc-21 | 둘 중 누구든 |
| t10 | place | bc-22 | bc-23 | 둘 중 누구든 |
| t11 | place | - | bc-24 | A |
| t12 | bye | bc-26 | bc-27 | 둘 중 누구든 |

## 나들이: honolulu_zoo_ticket

작성자: claude-sonnet-5.5 (2026-10-10)
장소: honolulu_zoo
세션: 41
목표 등급: A1
할 일: cd-hz-1 / I can buy zoo tickets and say how many people. / 동물원에서 표를 사고 몇 명인지 말할 수 있다.
허용 이름: -
갈래: hz-07 > hz-08, hz-12 > hz-14, hz-13 > hz-15

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| hz-01 | ticket | npc | Cashier | Hi! How many people? | A1 | 인원 묻기 | A | - | 안녕하세요! 몇 분이세요? |
| hz-02 | ticket | option | 두 사람 | Two, please. | A1 | 인원 말하기 | A | - | 두 명이요. |
| hz-03 | ticket | option | 두 사람 | Two tickets, please. | A1 | 표 사기 | A | - | 표 두 장 주세요. |
| hz-04 | ticket | option | 두 사람 | Two adults, please. | A1 | 표 사기 | A | - | 어른 두 명이요. |
| hz-05 | ticket | npc | Cashier | Two tickets. Is that right? | A1 | 확인 | A | - | 표 두 장이죠? 맞아요? |
| hz-06 | ticket | option | 두 사람 | Yes, that's right. | A1 | 확인 대답 | A | - | 네, 맞아요. |
| hz-07 | ticket | option | 두 사람 | Sorry, can you say that again? | A2 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| hz-08 | ticket | npc | Cashier | Two tickets. Okay? | A1 | 되풀이 | A | - | 표 두 장. 괜찮죠? |
| hz-09 | map | npc | Cashier | Do you want a map? | A1 | 안내 | A | - | 지도 필요하세요? |
| hz-10 | map | option | A자리 | Yes, please. | A1 | 대답 | A | - | 네, 주세요. |
| hz-11 | map | option | A자리 | No, thank you. | A1 | 대답 | A | - | 아니요, 괜찮아요. |
| hz-12 | price | option | 두 사람 | How much is a ticket? | A1 | 값 묻기 | A | - | 표는 한 장에 얼마예요? |
| hz-13 | price | option | 두 사람 | How much is it? | A1 | 값 묻기 | A | - | 얼마예요? |
| hz-14 | price | npc | Cashier | Ten dollars each. | A1 | 값 말하기 | A | - | 한 장에 10달러예요. |
| hz-15 | price | npc | Cashier | That's twenty dollars. | A1 | 값 말하기 | A | - | 20달러예요. |
| hz-16 | pay | npc | Cashier | Cash or card? | A1 | 결제 묻기 | A | - | 현금이세요, 카드세요? |
| hz-17 | pay | option | 두 사람 | Cash, please. | A1 | 결제 | A | - | 현금으로 할게요. |
| hz-18 | pay | option | 두 사람 | Card, please. | A1 | 결제 | A | - | 카드로 할게요. |
| hz-19 | pay | npc | Cashier | Here are your tickets. | A1 | 건네기 | A | - | 표 여기 있어요. |
| hz-20 | pay | wait | 두 사람 | Thank you! | A1 | 감사 | A | - | 고맙습니다! |
| hz-21 | plan | npc | Cashier | Enjoy the zoo! | A1 | 작별 | A | - | 동물원에서 즐거운 시간 보내세요! |
| hz-22 | plan | wait | A자리 | Where do you want to go, {B}? | A1 | 상대에게 묻기 | A | - | {B}, 어디 가고 싶어? |
| hz-23 | plan | wait | B자리 | Everything! Let's start here. | A1 | 대답 | A | - | 다 보고 싶어! 여기서 시작하자. |
| hz-24 | ask | wait | A자리 | Excuse me. Where is the bathroom? | A1 | 길 묻기 | A | - | 실례합니다. 화장실이 어디예요? |
| hz-25 | ask | npc | Cashier | Go straight. It's on the right. | A1 | 방향 알려 주기 | A | - | 곧장 가세요. 오른쪽에 있어요. |
| hz-26 | ask | wait | B자리 | Straight, then right. Thank you! | A1 | 확인과 감사 | A | - | 곧장 가서 오른쪽이요. 고맙습니다! |
| hz-27 | ask | npc | Cashier | You're welcome! | A1 | 인사 | A | - | 천만에요! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량에 안 들어간다. **나들이 안에서만 쓰는 연습 말**이다. 줄 id 로 위 표를 가리킨다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| hz-p1 | Two, please. | 인원 말하기 | hz-02 | 두 명이요. |
| hz-p2 | Two tickets, please. | 표 사기 | hz-03 | 표 두 장 주세요. |
| hz-p3 | Yes, that's right. | 확인 대답 | hz-06 | 네, 맞아요. |
| hz-p4 | Sorry, can you say that again? | 되묻기 | hz-07 | 죄송해요, 다시 말해 주시겠어요? |
| hz-p5 | How much is a ticket? | 값 묻기 | hz-12 | 표는 한 장에 얼마예요? |
| hz-p6 | Card, please. | 결제 | hz-18 | 카드로 할게요. |
| hz-p7 | Excuse me. Where is the bathroom? | 길 묻기 | hz-24 | 실례합니다. 화장실이 어디예요? |
| hz-p8 | Straight, then right. Thank you! | 확인과 감사 | hz-26 | 곧장 가서 오른쪽이요. 고맙습니다! |

### 미니게임 차례

미션은 시간 상한이 없는 작은 미니게임이다 (docs/outings.md 3장). 차례마다 NPC 줄 하나(없을 수 있다)와 두 사람이 고르는 줄이 있다.

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | ticket | hz-01 | hz-02/hz-03/hz-04 | 둘 중 누구든 |
| t2 | ticket | hz-05 | hz-06/hz-07 | 둘 중 누구든 |
| t3 | map | hz-09 | hz-10/hz-11 | A |
| t4 | price | - | hz-12/hz-13 | 둘 중 누구든 |
| t5 | pay | hz-16 | hz-17/hz-18 | 둘 중 누구든 |
| t6 | pay | hz-19 | hz-20 | 둘 중 누구든 |
| n1 | plan | hz-21 | - | - |
| t7 | plan | - | hz-22 | A |
| t8 | plan | - | hz-23 | B |
| t9 | ask | - | hz-24 | A |
| n2 | ask | hz-25 | - | - |
| t10 | ask | - | hz-26 | B |
| n3 | ask | hz-27 | - | - |

## 나들이: diamond_head_lookout_directions

작성자: claude-sonnet-5.5 (2026-10-10)
장소: diamond_head_lookout
세션: 46
목표 등급: A1
할 일: cd-dh-1 / I can ask the way to a lookout and understand simple directions. / 전망대로 가는 길을 묻고 간단한 방향 설명을 알아들을 수 있다.
허용 이름: -
갈래: dh-07 > dh-08, dh-09 > dh-11, dh-10 > dh-12

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| dh-01 | ask | npc | Guide | Hello! Can I help you? | A1 | 인사 안내 | A | - | 안녕하세요! 도와드릴까요? |
| dh-02 | ask | option | 두 사람 | Excuse me, where is the lookout? | A2 | 길 묻기 | A | - | 실례합니다, 전망대가 어디예요? |
| dh-03 | ask | option | 두 사람 | Where is the lookout, please? | A2 | 길 묻기 | A | - | 전망대가 어디인가요? |
| dh-04 | way1 | npc | Guide | Sure. Go straight, then turn left. | A1 | 방향 알려 주기 | A | - | 네. 곧장 가서 왼쪽으로 도세요. |
| dh-05 | way1 | option | 두 사람 | Straight, then left. | A1 | 방향 확인 | A | - | 곧장 가서 왼쪽이요. |
| dh-06 | way1 | option | 두 사람 | Go straight, then turn left. | A1 | 방향 확인 | A | - | 곧장 가서 왼쪽으로 돌라고요. |
| dh-07 | way1 | option | 두 사람 | Sorry, can you say that again? | A2 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| dh-08 | way1 | npc | Guide | Straight. Then turn left. | A1 | 되풀이 | A | - | 곧장 가세요. 그리고 왼쪽으로 도세요. |
| dh-09 | far | option | 두 사람 | Is it far? | A1 | 거리 묻기 | A | - | 멀어요? |
| dh-10 | far | option | 두 사람 | Is it near? | A1 | 거리 묻기 | A | - | 가까워요? |
| dh-11 | far | npc | Guide | No, it's near. | A1 | 거리 말하기 | A | - | 아니요, 가까워요. |
| dh-12 | far | npc | Guide | Yes, it's near. | A1 | 거리 말하기 | A | - | 네, 가까워요. |
| dh-13 | way2 | npc | Guide | At the corner, turn right. | A1 | 방향 알려 주기 | A | - | 모퉁이에서 오른쪽으로 도세요. |
| dh-14 | way2 | option | 두 사람 | Corner, then right. | A1 | 방향 확인 | A | - | 모퉁이에서 오른쪽이요. |
| dh-15 | way2 | option | 두 사람 | Turn right at the corner. | A1 | 방향 확인 | A | - | 모퉁이에서 오른쪽으로 돈다고요. |
| dh-16 | way2 | wait | A자리 | Left or right, {B}? | A1 | 상대에게 묻기 | A | - | {B}, 왼쪽이야, 오른쪽이야? |
| dh-17 | way2 | wait | B자리 | Right, at the corner. | A1 | 대답 | A | - | 오른쪽, 모퉁이에서. |
| dh-18 | way3 | npc | Guide | Then go up the stairs. | A1 | 방향 알려 주기 | A | - | 그다음에 계단을 올라가세요. |
| dh-19 | way3 | option | 두 사람 | Up the stairs. Okay! | A1 | 방향 확인 | A | - | 계단 위로요. 알겠어요! |
| dh-20 | way3 | option | 두 사람 | Up the stairs, thank you! | A1 | 방향 확인과 감사 | A | - | 계단 위로요, 고맙습니다! |
| dh-21 | stairs | npc | Guide | The stairs are on the left. | A1 | 위치 알려 주기 | A | - | 계단은 왼쪽에 있어요. |
| dh-22 | stairs | wait | 두 사람 | On the left. Okay! | A1 | 방향 확인 | A | - | 왼쪽이요. 알겠어요! |
| dh-23 | recap | wait | A자리 | Straight, left, right. Okay? | A2 | 길 되짚기 | A | - | 곧장, 왼쪽, 오른쪽. 맞지? |
| dh-24 | recap | wait | B자리 | Yes! Then up the stairs. | A1 | 길 되짚기 | A | - | 응! 그다음에 계단 위로. |
| dh-25 | end | npc | Guide | The lookout is on the right. | A2 | 위치 알려 주기 | A | - | 전망대는 오른쪽에 있어요. |
| dh-26 | end | wait | 두 사람 | On the right. Thank you! | A1 | 확인과 감사 | A | - | 오른쪽이요. 고맙습니다! |
| dh-27 | bye | npc | Guide | Enjoy the view! | A1 | 작별 | A | - | 경치 즐기세요! |
| dh-28 | bye | wait | 두 사람 | Thank you very much! | A1 | 감사 | A | - | 정말 고맙습니다! |
| dh-29 | bye | npc | Guide | You're welcome. Have fun! | A1 | 작별 | A | - | 천만에요. 즐거운 시간 보내세요! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량에 안 들어간다. **나들이 안에서만 쓰는 연습 말**이다. 줄 id 로 위 표를 가리킨다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| dh-p1 | Excuse me, where is the lookout? | 길 묻기 | dh-02 | 실례합니다, 전망대가 어디예요? |
| dh-p2 | Straight, then left. | 방향 확인 | dh-05 | 곧장 가서 왼쪽이요. |
| dh-p3 | Sorry, can you say that again? | 되묻기 | dh-07 | 죄송해요, 다시 말해 주시겠어요? |
| dh-p4 | Is it far? | 거리 묻기 | dh-09 | 멀어요? |
| dh-p5 | Corner, then right. | 방향 확인 | dh-14 | 모퉁이에서 오른쪽이요. |
| dh-p6 | Up the stairs. Okay! | 방향 확인 | dh-19 | 계단 위로요. 알겠어요! |
| dh-p7 | On the right. Thank you! | 확인과 감사 | dh-26 | 오른쪽이요. 고맙습니다! |
| dh-p8 | Thank you very much! | 감사 | dh-28 | 정말 고맙습니다! |

### 미니게임 차례

미션은 시간 상한이 없는 작은 미니게임이다 (docs/outings.md 3장). 차례마다 NPC 줄 하나(없을 수 있다)와 두 사람이 고르는 줄이 있다.

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | ask | dh-01 | dh-02/dh-03 | 둘 중 누구든 |
| t2 | way1 | dh-04 | dh-05/dh-06/dh-07 | 둘 중 누구든 |
| t3 | far | - | dh-09/dh-10 | 둘 중 누구든 |
| t4 | way2 | dh-13 | dh-14/dh-15 | 둘 중 누구든 |
| t5 | way2 | - | dh-16 | A |
| t6 | way2 | - | dh-17 | B |
| t7 | way3 | dh-18 | dh-19/dh-20 | 둘 중 누구든 |
| n1 | stairs | dh-21 | - | - |
| t8 | stairs | - | dh-22 | 둘 중 누구든 |
| t9 | recap | - | dh-23 | A |
| t10 | recap | - | dh-24 | B |
| t11 | end | dh-25 | dh-26 | 둘 중 누구든 |
| t12 | bye | dh-27 | dh-28 | 둘 중 누구든 |
| n2 | bye | dh-29 | - | - |

## 나들이: hanauma_bay_gear_rental

작성자: claude-sonnet-5.5 (2026-10-10)
장소: hanauma_bay
세션: 48
목표 등급: A1
할 일: cd-hb-1 / I can answer yes or no for snorkel gear and say my size. / 스노클링 장비를 빌릴지 예 아니오로 답하고 내 크기를 말할 수 있다.
허용 이름: -
갈래: hb-04 > hb-05, hb-23 > hb-24

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| hb-01 | gear | npc | Clerk | Hi! Do you want masks? | A1 | 장비 묻기 | A | - | 안녕하세요! 마스크 필요하세요? |
| hb-02 | gear | option | 두 사람 | Yes, please. | A1 | 예 대답 | A | - | 네, 주세요. |
| hb-03 | gear | option | 두 사람 | No, thank you. | A1 | 아니오 대답 | A | - | 아니요, 괜찮아요. |
| hb-04 | gear | option | 두 사람 | Sorry, can you say that again? | A2 | 되묻기 | A | - | 죄송해요, 다시 말해 주시겠어요? |
| hb-05 | gear | npc | Clerk | Sure. Do you want masks? | A1 | 되풀이 | A | - | 네. 마스크 필요하세요? |
| hb-06 | gear | npc | Clerk | And fins? | A2 | 장비 묻기 | A | - | 오리발은요? |
| hb-07 | gear | option | A자리 | Yes, please. | A1 | 예 대답 | A | - | 네, 주세요. |
| hb-08 | gear | option | A자리 | No, thank you. | A1 | 아니오 대답 | A | - | 아니요, 괜찮아요. |
| hb-09 | gear | npc | Clerk | A snorkel too? | A2 | 장비 묻기 | A | - | 스노클도요? |
| hb-10 | gear | option | B자리 | Yes, please. | A1 | 예 대답 | A | - | 네, 주세요. |
| hb-11 | gear | option | B자리 | No, thank you. | A1 | 아니오 대답 | A | - | 아니요, 괜찮아요. |
| hb-12 | size | wait | A자리 | What size are you, {B}? | A1 | 상대에게 묻기 | A | - | {B}, 사이즈가 뭐예요? |
| hb-13 | size | wait | B자리 | I'm a medium. And you? | A1 | 말하고 되묻기 | A | - | 나는 미디엄이에요. 너는요? |
| hb-14 | size | npc | Clerk | What size do you need? | A1 | 크기 묻기 | A | - | 어떤 사이즈가 필요하세요? |
| hb-15 | size | option | A자리 | Small, please. | A1 | 크기 말하기 | A | - | 스몰로 주세요. |
| hb-16 | size | option | A자리 | Medium, please. | A1 | 크기 말하기 | A | - | 미디엄으로 주세요. |
| hb-17 | size | option | A자리 | Large, please. | A1 | 크기 말하기 | A | - | 라지로 주세요. |
| hb-18 | size | npc | Clerk | And for you? | A1 | 크기 묻기 | A | - | 당신은요? |
| hb-19 | size | option | B자리 | Small, please. | A1 | 크기 말하기 | A | - | 스몰로 주세요. |
| hb-20 | size | option | B자리 | Medium, please. | A1 | 크기 말하기 | A | - | 미디엄으로 주세요. |
| hb-21 | size | option | B자리 | Large, please. | A1 | 크기 말하기 | A | - | 라지로 주세요. |
| hb-22 | size | npc | Clerk | Okay. Here you go. | A1 | 건네기 | A | - | 네. 여기 있어요. |
| hb-23 | pay | wait | 두 사람 | How much is it? | A1 | 값 묻기 | A | - | 얼마예요? |
| hb-24 | pay | npc | Clerk | It's twenty dollars. | A1 | 값 말하기 | A | - | 20달러예요. |
| hb-25 | pay | npc | Clerk | Cash or card? | A1 | 결제 묻기 | A | - | 현금이세요, 카드세요? |
| hb-26 | pay | option | 두 사람 | Cash, please. | A1 | 결제 | A | - | 현금으로 할게요. |
| hb-27 | pay | option | 두 사람 | Card, please. | A1 | 결제 | A | - | 카드로 할게요. |
| hb-28 | more | npc | Clerk | Is that all? | A1 | 추가 묻기 | A | - | 이게 다예요? |
| hb-29 | more | wait | 두 사람 | Yes, that's all. | A1 | 대답 | A | - | 네, 그게 다예요. |
| hb-30 | safety | npc | Clerk | Do not touch the fish. | A1 | 주의 듣기 | B | 영어는 자연스럽지만 실제 하나우마 베이의 규칙 문구인지 확인하지 못했다. 직원은 'Please do not...'이라고 더 정중하게 말할 수 있다 | 물고기를 만지지 마세요. |
| hb-31 | safety | wait | 두 사람 | Okay! Thank you. | A1 | 알겠다고 말하기 | A | - | 알겠어요! 고맙습니다. |
| hb-32 | safety | npc | Clerk | Stay with your friend. | A1 | 주의 듣기 | B | 안전 문구로는 'Stay with your buddy.'가 더 흔할 수 있고, 직원이 장비 대여 때 이 말을 하는지 실제 절차를 모른다 | 친구와 함께 계세요. |
| hb-33 | safety | wait | 두 사람 | Okay, we will. | A1 | 알겠다고 말하기 | A | - | 네, 그럴게요. |
| hb-34 | bye | npc | Clerk | Have fun! | A1 | 작별 | A | - | 즐거운 시간 보내세요! |
| hb-35 | bye | wait | 두 사람 | Thank you! Bye! | A1 | 작별 | A | - | 고맙습니다! 안녕히 계세요! |

### 연습할 말 (이 나들이의 카드 여덟)

기준서 8.1 의 카드 총량에 안 들어간다. **나들이 안에서만 쓰는 연습 말**이다. 줄 id 로 위 표를 가리킨다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| hb-p1 | Yes, please. | 예 대답 | hb-02 | 네, 주세요. |
| hb-p2 | No, thank you. | 아니오 대답 | hb-03 | 아니요, 괜찮아요. |
| hb-p3 | Sorry, can you say that again? | 되묻기 | hb-04 | 죄송해요, 다시 말해 주시겠어요? |
| hb-p4 | I'm a medium. And you? | 말하고 되묻기 | hb-13 | 나는 미디엄이에요. 너는요? |
| hb-p5 | Medium, please. | 크기 말하기 | hb-16 | 미디엄으로 주세요. |
| hb-p6 | Large, please. | 크기 말하기 | hb-17 | 라지로 주세요. |
| hb-p7 | How much is it? | 값 묻기 | hb-23 | 얼마예요? |
| hb-p8 | Card, please. | 결제 | hb-27 | 카드로 할게요. |

### 미니게임 차례

미션은 시간 상한이 없는 작은 미니게임이다 (docs/outings.md 3장). 차례마다 NPC 줄 하나(없을 수 있다)와 두 사람이 고르는 줄이 있다.

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | gear | hb-01 | hb-02/hb-03/hb-04 | 둘 중 누구든 |
| t2 | gear | hb-06 | hb-07/hb-08 | A |
| t3 | gear | hb-09 | hb-10/hb-11 | B |
| t4 | size | - | hb-12 | A |
| t5 | size | - | hb-13 | B |
| t6 | size | hb-14 | hb-15/hb-16/hb-17 | A |
| t7 | size | hb-18 | hb-19/hb-20/hb-21 | B |
| t8 | size | hb-22 | hb-23 | 둘 중 누구든 |
| t9 | pay | hb-25 | hb-26/hb-27 | 둘 중 누구든 |
| t10 | more | hb-28 | hb-29 | 둘 중 누구든 |
| t11 | safety | hb-30 | hb-31 | 둘 중 누구든 |
| t12 | safety | hb-32 | hb-33 | 둘 중 누구든 |
| t13 | bye | hb-34 | hb-35 | 둘 중 누구든 |
