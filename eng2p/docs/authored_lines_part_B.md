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
| bs-25 | stop | option | 두 사람 | Stop here, please. | A1 | 내리기 | B | 미국 시내버스는 보통 정차 줄을 당겨 내릴 곳을 알린다. 기사에게 말로 세워 달라고 하는 것이 자연스러운지 확신이 없다 | 여기서 세워 주세요. |
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
