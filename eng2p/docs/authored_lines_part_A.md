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
