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
| hb-05 | gear | npc | Clerk | Sure. Masks, yes or no? | A1 | 되풀이 | B | 직원이 'yes or no?'로 되묻는 것이 자연스러운지 확신이 없다. 너무 딱딱하거나 퉁명스럽게 들릴 수 있다 | 네. 마스크요, 필요해요 아니면 아니에요? |
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
