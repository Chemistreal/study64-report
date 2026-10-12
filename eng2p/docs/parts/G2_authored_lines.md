# G2 이후 미션 대사

신뢰도: B (학습용 기능 대화예요. 영어는 줄마다 자기 점검 A/B이며 실제 현지 화용·음성·플레이는 미검증이에요.)
검증로그: 2026-10-11 / 첨부 규격·원본 검사기·추가 길이와 새 낱말 검사 / 통과 / 상세 조건과 실행 결과는 result_G2.zip의 report.md에 적었어요.
검증로그: 2026-10-11 / 영어 화용과 지역별 절차 / 보류 / B 이유를 각 줄에 적었으며 사람 검증 전이에요.

이 파일은 docs/authored_lines.md에 덧붙일 새 장들이에요. 기존 ID·첫 공개 미션·해금 세션은 바꾸지 않아요. 수치와 운영 절차는 미션별 상황 설명에 적은 가상 장면 값이며 실제 장소의 현재 정책이 아니에요. 이후 미션 지시대로 한국어 풀이 칸은 모두 -예요.

## 나들이: dukes_dinner

작성자: gpt (2026-10-11)
장소: dukes_waikiki
세션: 59
목표 등급: A2
할 일: cd-dkd-1 / I can order dinner, ask about food, and pay. / 저녁 식사를 주문하고 음식에 대해 묻고 계산할 수 있다.
허용 이름: -
갈래: dkd-03 > dkd-04, dkd-07 > dkd-09, dkd-08 > dkd-10, dkd-22 > dkd-23, dkd-25 > dkd-10, dkd-28 > dkd-29, dkd-33 > dkd-34, dkd-35 > dkd-37, dkd-36 > dkd-37

상황: 듀크스 와이키키를 배경으로 한 가상 저녁 식사다. 창가 자리, 메뉴 구성, 음식의 맵기, 제공 방식과 결제는 학습용 장면값이며 실제 매장의 메뉴나 운영을 확인한 정보가 아니다. 금액을 정하지 않고 계산서를 받아 확인한다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| dkd-01 | door | npc | Host | Good evening! Table for two? | A1 | 인사와 인원 묻기 | A | - | - |
| dkd-02 | door | option | A자리 | Yes, please. | A1 | 인원 확인 | A | - | - |
| dkd-03 | door | option | A자리 | Is there a table by the window? | A2 | 자리 요청 | A | - | - |
| dkd-04 | door | npc | Host | Yes. Come with me, please. | A1 | 자리 요청 수락 | B | 창가 자리의 제공 가능 여부는 실제 매장 정보가 아니라 가상 장면값이다 | - |
| dkd-05 | door | npc | Host | Here are your menus. | A1 | 메뉴 건네기 | A | - | - |
| dkd-06 | ready | npc | Server | Are you ready to order? | A1 | 주문 준비 묻기 | A | - | - |
| dkd-07 | ready | option | A자리 | We need a minute, please. | A1 | 시간 요청 | A | - | - |
| dkd-08 | ready | option | A자리 | What do you recommend? | A2 | 추천 묻기 | A | - | - |
| dkd-09 | ready | npc | Server | Of course. Take your time. | A1 | 기다려 주기 | A | - | - |
| dkd-10 | ready | npc | Server | The fish is good. It comes with rice. | A2 | 음식 구성 안내 | A | - | - |
| dkd-11 | plan | wait | A자리 | Would you like fish or chicken, {B}? | A2 | 상대의 선택 묻기 | A | - | - |
| dkd-12 | plan | option | B자리 | I'd like fish. | A2 | 선호 말하기 | A | - | - |
| dkd-13 | plan | option | B자리 | I'm not sure yet. | A1 | 선택 유보 | A | - | - |
| dkd-14 | drink | npc | Server | What would you like to drink? | A2 | 음료 주문 묻기 | A | - | - |
| dkd-15 | drink | option | A자리 | Water, please. | A1 | 음료 주문 | A | - | - |
| dkd-16 | drink | option | A자리 | Tea, please. | A1 | 음료 주문 | A | - | - |
| dkd-17 | friend | npc | Server | And for you? | A1 | 상대 주문 묻기 | A | - | - |
| dkd-18 | friend | option | B자리 | Water for me, please. | A1 | 음료 주문 | A | - | - |
| dkd-19 | friend | option | B자리 | Tea for me, please. | A1 | 음료 주문 | A | - | - |
| dkd-20 | dinner | npc | Server | What would you like for dinner? | A2 | 식사 주문 묻기 | A | - | - |
| dkd-21 | dinner | option | A자리 | Can I have the chicken with rice, please? | A2 | 식사 주문 | A | - | - |
| dkd-22 | dinner | option | A자리 | The chicken, please. Is it spicy? | A2 | 주문과 맵기 확인 | A | - | - |
| dkd-23 | dinner | npc | Server | No. The chicken is not spicy. | A1 | 맵기 안내 | B | 음식의 맵기는 실제 메뉴를 확인한 정보가 아니라 가상 장면값이다 | - |
| dkd-24 | friend | option | B자리 | I'll have the fish, please. | A1 | 식사 주문 | A | - | - |
| dkd-25 | friend | option | B자리 | The fish, please. Does it come with rice? | A2 | 주문과 구성 확인 | A | - | - |
| dkd-26 | more | npc | Server | Anything else? | A1 | 추가 주문 묻기 | A | - | - |
| dkd-27 | more | option | B자리 | No, thank you. That is all. | A1 | 주문 끝내기 | A | - | - |
| dkd-28 | more | option | B자리 | Could we have two forks, please? | A2 | 식기 요청 | A | - | - |
| dkd-29 | more | npc | Server | Of course. Here are your forks. | A1 | 식기 건네기 | A | - | - |
| dkd-30 | food | npc | Server | Here are your meals. Enjoy! | A1 | 음식 건네기 | A | - | - |
| dkd-31 | food | npc | Server | How is everything? | A1 | 식사 상태 묻기 | A | - | - |
| dkd-32 | food | option | B자리 | It is very good, thank you. | A1 | 만족 말하기 | A | - | - |
| dkd-33 | food | option | B자리 | Could we have some water, please? | A2 | 추가 음료 요청 | A | - | - |
| dkd-34 | food | npc | Server | Of course. I'll bring you some water. | A1 | 요청 수락 | A | - | - |
| dkd-35 | pay | option | 두 사람 | Can we have the check, please? | A2 | 계산서 요청 | A | - | - |
| dkd-36 | pay | option | 두 사람 | Could we pay by card? | A2 | 결제 수단 확인 | A | - | - |
| dkd-37 | pay | npc | Server | Yes. Here is your check. | A1 | 계산서 건네기 | A | - | - |
| dkd-38 | pay | npc | Server | Cash or card? | A1 | 결제 수단 묻기 | A | - | - |
| dkd-39 | pay | option | 두 사람 | Card, please. | A1 | 결제 수단 선택 | A | - | - |
| dkd-40 | pay | option | 두 사람 | Cash, please. | A1 | 결제 수단 선택 | A | - | - |

### 연습할 말

두 사람이 번갈아 연습할 데이터 본보기다. 본문 줄을 그대로 연결하며 실제 음성 재생과 발화 전 필수 이수는 이 파일로 보장하지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| dkd-p1 | Is there a table by the window? | 자리 요청 | dkd-03 | - |
| dkd-p2 | We need a minute, please. | 시간 요청 | dkd-07 | - |
| dkd-p3 | What do you recommend? | 추천 묻기 | dkd-08 | - |
| dkd-p4 | Would you like fish or chicken, {B}? | 상대의 선택 묻기 | dkd-11 | - |
| dkd-p5 | Water, please. | 음료 주문 | dkd-15 | - |
| dkd-p6 | Can I have the chicken with rice, please? | 식사 주문 | dkd-21 | - |
| dkd-p7 | The chicken, please. Is it spicy? | 주문과 맵기 확인 | dkd-22 | - |
| dkd-p8 | The fish, please. Does it come with rice? | 주문과 구성 확인 | dkd-25 | - |
| dkd-p9 | Could we have two forks, please? | 식기 요청 | dkd-28 | - |
| dkd-p10 | Could we have some water, please? | 추가 음료 요청 | dkd-33 | - |
| dkd-p11 | Can we have the check, please? | 계산서 요청 | dkd-35 | - |
| dkd-p12 | Could we pay by card? | 결제 수단 확인 | dkd-36 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | door | dkd-01 | dkd-02/dkd-03 | A |
| n1 | door | dkd-05 | - | - |
| t2 | ready | dkd-06 | dkd-07/dkd-08 | A |
| t3 | plan | - | dkd-11 | A |
| t4 | plan | - | dkd-12/dkd-13 | B |
| t5 | drink | dkd-14 | dkd-15/dkd-16 | A |
| t6 | friend | dkd-17 | dkd-18/dkd-19 | B |
| t7 | dinner | dkd-20 | dkd-21/dkd-22 | A |
| t8 | friend | dkd-17 | dkd-24/dkd-25 | B |
| t9 | more | dkd-26 | dkd-27/dkd-28 | B |
| n2 | food | dkd-30 | - | - |
| t10 | food | dkd-31 | dkd-32/dkd-33 | B |
| t11 | pay | - | dkd-35/dkd-36 | 둘 중 누구든 |
| t12 | pay | dkd-38 | dkd-39/dkd-40 | 둘 중 누구든 |

## 나들이: marukame_udon

작성자: gpt (2026-10-11)
장소: marukame_udon
세션: 71
목표 등급: A2
할 일: cd-mud-1 / I can order udon, choose a size and toppings, and pay. / 우동을 주문하고 크기와 고명을 고른 뒤 계산할 수 있다.
허용 이름: -
갈래: mud-01 > mud-04, mud-02 > mud-03, mud-07 > mud-08, mud-11 > mud-12, mud-18 > mud-19, mud-24 > mud-26, mud-31 > mud-32, mud-35 > mud-36, mud-37 > mud-40, mud-38 > mud-39

상황: 마루카메 우동을 배경으로 한 가상 주문 장면이다. 줄 서는 위치, 뜨겁거나 차가운 메뉴, 그릇 크기, 고명, 물을 받는 곳, 화면에 표시되는 합계와 좌석은 학습용 장면값이며 실제 메뉴나 매장 절차를 확인한 정보가 아니다. 가격은 정하지 않고 화면의 합계를 확인한다. udon은 일본 음식의 이름이며 하와이어 표현으로 다루지 않는다.

크기 차례에서 B자리가 두 사람의 크기를 확정한다. A가 고명 추천만 물으면 추가 주문으로 세지 않고 앞서 고른 기본 국수를 유지한다. 고명을 직접 주문하는 B자리만 그 주문을 더하며, 주문한 물건의 수량으로 고정 금액을 추정하지 않는다.

결제 차례는 t10에서 결제 준비를 묻고(mud-41) 곧바로 결제하거나(mud-42) 합계를 먼저 보여 달라고 한다(mud-35 > mud-36). 두 갈래 모두 t11에서 결제 수단을 한 번만 묻는다(mud-33, mud-34). 이미 카드로 답한 갈래에서 같은 질문을 되묻지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| mud-01 | line | option | A자리 | Excuse me. Is this the line? | A1 | 줄 확인 | A | - | - |
| mud-02 | line | option | A자리 | Excuse me. Where do we order? | A1 | 주문 위치 묻기 | A | - | - |
| mud-03 | line | npc | Clerk | Please start at this counter. | A1 | 주문 위치 안내 | B | 주문 시작 위치와 절차는 실제 매장 운영을 확인한 정보가 아니라 가상 장면값이다 | - |
| mud-04 | line | npc | Clerk | Yes. Please wait here. | A1 | 줄 확인 대답 | A | - | - |
| mud-05 | order | npc | Clerk | You can order here now. | A1 | 주문 시작 안내 | A | - | - |
| mud-06 | order | option | A자리 | We'd like two bowls of udon, please. | A2 | 주문 시작 | A | - | - |
| mud-07 | order | option | A자리 | What kind of noodles do you have? | A2 | 메뉴 종류 묻기 | A | - | - |
| mud-08 | order | npc | Clerk | We have hot and cold udon. | A2 | 메뉴 종류 안내 | B | 메뉴 구성은 실제 차림표를 확인한 정보가 아니라 가상 장면값이다 | - |
| mud-09 | temperature | npc | Clerk | Hot or cold? | A1 | 온도 선택 묻기 | A | - | - |
| mud-10 | temperature | option | A자리 | Hot udon, please. | A2 | 메뉴 선택 | A | - | - |
| mud-11 | temperature | option | A자리 | Cold udon, please. Is there a sauce? | A2 | 선택과 소스 확인 | A | - | - |
| mud-12 | temperature | npc | Clerk | Yes. The sauce is on the side. | A1 | 소스 구성 안내 | B | 별도 소스의 제공은 실제 메뉴를 확인한 정보가 아니라 가상 장면값이다 | - |
| mud-13 | friend | npc | Clerk | And for you? | A1 | 상대 주문 묻기 | A | - | - |
| mud-14 | friend | option | B자리 | Hot udon for me, please. | A2 | 메뉴 선택 | A | - | - |
| mud-15 | friend | option | B자리 | The same as my friend, please. | A1 | 같은 메뉴 선택 | A | - | - |
| mud-16 | size | npc | Clerk | What size bowl would you like? | A2 | 그릇 크기 묻기 | A | - | - |
| mud-17 | size | option | A자리 | A small bowl, please. | A2 | 크기 선택 | A | - | - |
| mud-18 | size | option | A자리 | I need a minute to choose. | A2 | 선택 시간 요청 | A | - | - |
| mud-19 | size | npc | Clerk | Sure. Take your time. | A1 | 기다려 주기 | A | - | - |
| mud-20 | size | npc | Clerk | And what size for your friend? | A1 | 상대 크기 묻기 | A | - | - |
| mud-21 | size | option | B자리 | Two small bowls, please. | A2 | 두 사람의 크기 확정 | A | - | - |
| mud-22 | size | option | B자리 | Small for my friend, large for me, please. | A2 | 두 사람의 크기 확정 | A | - | - |
| mud-23 | topping | npc | Clerk | Would you like something on top? | A2 | 고명 추가 묻기 | A | - | - |
| mud-24 | topping | option | A자리 | What do you recommend? | A2 | 고명 추천 묻기 | A | - | - |
| mud-25 | topping | option | A자리 | No extras for me, thank you. | A2 | 추가 거절 | A | - | - |
| mud-26 | topping | npc | Clerk | You could add an egg. | A2 | 고명 제안 | B | 달걀을 고명으로 권하는 구성은 실제 메뉴를 확인한 정보가 아니라 가상 장면값이다 | - |
| mud-27 | friend | option | B자리 | An egg, please. | A1 | 고명 추가 주문 | A | - | - |
| mud-28 | friend | option | B자리 | No extra toppings, thank you. | A2 | 추가 거절 | A | - | - |
| mud-29 | more | npc | Cashier | Is that all? | A1 | 추가 주문 묻기 | A | - | - |
| mud-30 | more | option | B자리 | Yes, that's all. | A1 | 주문 끝내기 | A | - | - |
| mud-31 | more | option | B자리 | Water, please. | A1 | 음료 요청 | A | - | - |
| mud-32 | more | npc | Cashier | There's water by the tables. | A1 | 물 위치 안내 | B | 물을 받는 위치는 실제 매장 운영을 확인한 정보가 아니라 가상 장면값이다 | - |
| mud-41 | pay | npc | Cashier | Are you ready to pay? | A1 | 결제 준비 묻기 | A | - | - |
| mud-42 | pay | option | B자리 | Yes, we're ready. | A1 | 결제 준비 답하기 | A | - | - |
| mud-33 | pay | npc | Cashier | Cash or card? | A1 | 결제 수단 묻기 | A | - | - |
| mud-34 | pay | option | 두 사람 | Card, please. | A1 | 결제 수단 선택 | A | - | - |
| mud-35 | pay | option | B자리 | Can we see the total first? | A2 | 금액 확인 요청 | A | - | - |
| mud-36 | pay | npc | Cashier | Yes. The total is on the screen. | A2 | 금액 표시 안내 | B | 합계가 표시되는 방식은 실제 계산대 운영을 확인한 정보가 아니라 가상 장면값이다 | - |
| mud-37 | seat | option | 두 사람 | Where can we sit? | A1 | 좌석 위치 묻기 | A | - | - |
| mud-38 | seat | option | 두 사람 | Are there seats for two? | A2 | 좌석 가능 여부 묻기 | A | - | - |
| mud-39 | seat | npc | Cashier | Yes. There are seats over there. | A2 | 좌석 안내 | B | 빈자리와 좌석 위치는 실제 매장 상태를 확인한 정보가 아니라 가상 장면값이다 | - |
| mud-40 | seat | npc | Cashier | You can sit over there. | A1 | 좌석 위치 안내 | A | - | - |

### 연습할 말

두 사람이 번갈아 연습할 데이터 본보기다. 본문 줄을 그대로 연결하며 실제 음성 재생과 발화 전 필수 이수는 이 파일로 보장하지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| mud-p1 | Excuse me. Is this the line? | 줄 확인 | mud-01 | - |
| mud-p2 | Excuse me. Where do we order? | 주문 위치 묻기 | mud-02 | - |
| mud-p3 | We'd like two bowls of udon, please. | 주문 시작 | mud-06 | - |
| mud-p4 | What kind of noodles do you have? | 메뉴 종류 묻기 | mud-07 | - |
| mud-p5 | Hot udon, please. | 메뉴 선택 | mud-10 | - |
| mud-p6 | Cold udon, please. Is there a sauce? | 선택과 소스 확인 | mud-11 | - |
| mud-p7 | I need a minute to choose. | 선택 시간 요청 | mud-18 | - |
| mud-p8 | Two small bowls, please. | 두 사람의 크기 확정 | mud-21 | - |
| mud-p9 | What do you recommend? | 고명 추천 묻기 | mud-24 | - |
| mud-p10 | No extras for me, thank you. | 추가 거절 | mud-25 | - |
| mud-p11 | An egg, please. | 고명 추가 주문 | mud-27 | - |
| mud-p12 | Can we see the total first? | 금액 확인 요청 | mud-35 | - |
| mud-p13 | Where can we sit? | 좌석 위치 묻기 | mud-37 | - |
| mud-p14 | Are there seats for two? | 좌석 가능 여부 묻기 | mud-38 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | line | - | mud-01/mud-02 | A |
| t2 | order | mud-05 | mud-06/mud-07 | A |
| t3 | temperature | mud-09 | mud-10/mud-11 | A |
| t4 | friend | mud-13 | mud-14/mud-15 | B |
| t5 | size | mud-16 | mud-17/mud-18 | A |
| t6 | size | mud-20 | mud-21/mud-22 | B |
| t7 | topping | mud-23 | mud-24/mud-25 | A |
| t8 | friend | mud-13 | mud-27/mud-28 | B |
| t9 | more | mud-29 | mud-30/mud-31 | B |
| t10 | pay | mud-41 | mud-35/mud-42 | B |
| t11 | pay | mud-33 | mud-34 | 둘 중 누구든 |
| t12 | seat | - | mud-37/mud-38 | 둘 중 누구든 |

## 나들이: ala_moana_shopping

작성자: gpt-cloud (2026-10-11)
장소: ala_moana_center
세션: 77
목표 등급: A2
할 일: cd-ams-1 / I can ask about size and color, try on a shirt, and pay. / 옷의 크기와 색을 묻고, 입어 보고, 값을 낼 수 있다.
허용 이름: -
갈래: ams-05>ams-07, ams-06>ams-08, ams-10>ams-12, ams-11>ams-13, ams-19>ams-20, ams-27>ams-29, ams-28>ams-30

상황: ala_moana_shopping은 A가 셔츠를 고르고 입어 보며, B가 함께 질문하고 카드로 계산하는 가상 의류점 장면이다. 초록색을 보여 달라는 갈래에서도 같은 크기의 셔츠를 비교한 뒤 파란 셔츠 한 장으로 주문을 확정한다. 파란 셔츠의 최종 금액 20달러, 미디엄 재고, 탈의실 위치, 카드 결제 방식, 영수증 제공은 모두 이 장면의 가상 값과 규칙이다. 실제 Ala Moana 매장의 가격, 재고, 세금, 운영 규칙을 설명하지 않는다. 직원에게 입어 본 크기가 맞는지 물을 때의 어감과 카드 조작 안내는 B로 남긴다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| ams-01 | find | npc | Clerk | Hi! What are you looking for? | A2 | 인사하며 필요한 물건 묻기 | A | - | - |
| ams-02 | find | option | A자리 | I'd like a blue shirt, please. | A2 | 원하는 물건 요청 | A | - | - |
| ams-03 | find | option | A자리 | Do you have blue shirts? | A2 | 재고 질문 | A | - | - |
| ams-04 | size | npc | Clerk | What size do you need? | A2 | 크기 묻기 | A | - | - |
| ams-05 | size | option | A자리 | Medium, please. | A2 | 크기 선택 | A | - | - |
| ams-06 | size | option | A자리 | Could you help me choose a size? | A2 | 크기 선택 도움 요청 | B | 매장 직원에게 크기를 함께 고르자는 부탁의 어감을 확인하지 못했다 | - |
| ams-07 | size | npc | Clerk | Here's a medium shirt. | A2 | 고른 크기 내주기 | A | - | - |
| ams-08 | size | npc | Clerk | Try this medium first. | A2 | 먼저 입어 볼 크기 권하기 | B | 크기 추천과 권유의 매장 말투를 실제 화자에게 확인하지 못했다 | - |
| ams-09 | try | npc | Clerk | Would you like to try it on? | A2 | 입어 보기 권유 | A | - | - |
| ams-10 | try | option | A자리 | Yes, where can I try it on? | A2 | 입어 볼 위치 질문 | A | - | - |
| ams-11 | try | option | A자리 | Yes. Could you show me where to go? | A2 | 직접 안내 요청 | A | - | - |
| ams-12 | try | npc | Clerk | The fitting room is over there. | A2 | 위치 알려 주기 | B | 탈의실 안내 표현의 등급과 매장 어감을 외부 감수하지 못했다 | - |
| ams-13 | try | npc | Clerk | Follow me to the fitting room. | A2 | 직접 데려다주기 | B | 직원이 직접 안내하는 절차는 가상이며 매장 말투를 확인하지 못했다 | - |
| ams-14 | fit | npc | Clerk | How does it fit? | A2 | 입어 본 크기 묻기 | A | - | - |
| ams-15 | fit | option | A자리 | It fits well. | A2 | 착용감 답하기 | A | - | - |
| ams-16 | fit | option | A자리 | Can you check the fit? | A2 | 크기가 맞는지 봐 달라고 요청 | B | 옷의 맞음새를 직원에게 봐 달라는 표현의 자연스러움을 확인하지 못했다 | - |
| ams-17 | color | npc | Clerk | It looks good. Do you like the color? | A2 | 착용감에 답하고 색 선호 묻기 | B | 맞음새 확인에 대한 직원 답변과 칭찬의 어감을 감수하지 못했다 | - |
| ams-18 | color | option | B자리 | Yes, I like this blue. | A2 | 색 선호 답하기 | A | - | - |
| ams-19 | color | option | B자리 | Can I see the same shirt in green? | A2 | 다른 색 보여 달라고 요청 | A | - | - |
| ams-20 | color | npc | Clerk | Here's the same shirt in green. | A2 | 요청한 색 보여 주기 | A | - | - |
| ams-21 | choose | option | A자리 | I'll take the blue one. | A2 | 구매할 색 결정 | A | - | - |
| ams-22 | choose | option | A자리 | How much is the blue one? | A2 | 구매 전 값 질문 | A | - | - |
| ams-23 | pay | npc | Clerk | The blue one is twenty dollars. Ready to pay? | A2 | 값 알려 주고 결제 의사 묻기 | B | 세금 등을 포함한 최종 가상 금액이며 실제 매장 가격은 확인하지 않았다 | - |
| ams-24 | pay | option | B자리 | Can I pay by card? | A2 | 카드 결제 가능 여부 질문 | A | - | - |
| ams-25 | pay | option | B자리 | Could you tell me how to pay by card? | A2 | 카드 결제 방법 설명 요청 | B | 카드 사용 안내를 부탁하는 문장의 등급과 매장 어감을 감수하지 못했다 | - |
| ams-26 | card | npc | Clerk | Yes. Put your card here, please. | A2 | 카드 결제 위치 안내 | B | 실제 결제 단말기 절차가 아닌 장면 동작이며 영어 안내를 감수하지 못했다 | - |
| ams-27 | card | option | B자리 | Like this? | A2 | 카드 놓는 방식 확인 | A | - | - |
| ams-28 | card | option | B자리 | Could you show me? | A2 | 시범 요청 | A | - | - |
| ams-29 | card | npc | Clerk | Yes, that's right. | A2 | 조작 확인에 답하기 | A | - | - |
| ams-30 | card | npc | Clerk | Sure. Put it right here. | A2 | 가리키며 시범 안내 | B | 가리키는 동작이 동반되는 가상 안내이며 실제 단말기 절차를 확인하지 못했다 | - |
| ams-31 | receipt | npc | Clerk | Would you like a receipt? | A2 | 영수증 필요 여부 묻기 | A | - | - |
| ams-32 | receipt | option | A자리 | Yes, a receipt, please. | A2 | 영수증 요청 | A | - | - |
| ams-33 | receipt | option | A자리 | Could you put it with the shirt? | A2 | 영수증을 물건과 함께 두도록 요청 | B | 영수증을 옷과 함께 두라는 부탁의 매장 어감을 확인하지 못했다 | - |
| ams-34 | leave | npc | Clerk | Here are your shirt and receipt. | A2 | 물건과 영수증 건네기 | A | - | - |
| ams-35 | leave | wait | B자리 | Thank you! Have a nice day. | A2 | 감사하며 작별 | A | - | - |

### 연습할 말

이 나들이 안에서만 쓰는 연습 말이다. 기준서의 본 강의 카드 총량에는 넣지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| ams-p1 | I'd like a blue shirt, please. | 원하는 물건 요청 | ams-02 | - |
| ams-p2 | Could you help me choose a size? | 크기 선택 도움 요청 | ams-06 | - |
| ams-p3 | Yes, where can I try it on? | 입어 볼 위치 질문 | ams-10 | - |
| ams-p4 | It fits well. | 착용감 답하기 | ams-15 | - |
| ams-p5 | Can I see the same shirt in green? | 다른 색 보여 달라고 요청 | ams-19 | - |
| ams-p6 | I'll take the blue one. | 구매할 색 결정 | ams-21 | - |
| ams-p7 | How much is the blue one? | 구매 전 값 질문 | ams-22 | - |
| ams-p8 | Can I pay by card? | 카드 결제 가능 여부 질문 | ams-24 | - |
| ams-p9 | Could you show me? | 시범 요청 | ams-28 | - |
| ams-p10 | Yes, a receipt, please. | 영수증 요청 | ams-32 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | find | ams-01 | ams-02/ams-03 | A |
| t2 | size | ams-04 | ams-05/ams-06 | A |
| t3 | try | ams-09 | ams-10/ams-11 | A |
| t4 | fit | ams-14 | ams-15/ams-16 | A |
| t5 | color | ams-17 | ams-18/ams-19 | B |
| t6 | choose | - | ams-21/ams-22 | A |
| t7 | pay | ams-23 | ams-24/ams-25 | B |
| t8 | card | ams-26 | ams-27/ams-28 | B |
| t9 | receipt | ams-31 | ams-32/ams-33 | A |
| t10 | leave | ams-34 | ams-35 | B |

## 나들이: grocery_store

작성자: gpt-cloud (2026-10-11)
장소: -
세션: 83
목표 등급: A2
할 일: cd-grs-1 / I can find groceries, ask about quantities and prices, and pay. / 식료품 위치와 수량과 값을 묻고, 값을 낼 수 있다.
허용 이름: -
갈래: grs-02>grs-04, grs-03>grs-05, grs-10>grs-12, grs-11>grs-13, grs-19>grs-20, grs-31>grs-33, grs-32>grs-34

상황: grocery_store는 아직 게임 장소 목록에 없는 임시 마트(new:grocery_store)에서 A와 B가 함께 장을 보는 가상 장면이다. 장소 메타의 '-'는 연결된 기존 장소가 없다는 뜻이다. 두 사람은 봉투와 장보기 목록을 가지고 있다. 목록에는 빵 한 덩이와 사과 세 개가 적혀 있다. 각 상품을 더하기 전에 다시 동의를 받아 모든 갈래의 최종 바구니를 같게 맞춘다. 빵 한 덩이 3달러, 사과 세 개 2달러, 최종 합계 5달러, 진열 위치, 봉투 사용, 카드 결제와 영수증 제공은 이 장면의 가상 값과 규칙이다. 실제 마트의 가격, 세금, 상품 위치나 결제 규칙이 아니다. 카드 안내 뒤의 조작은 가상 장면의 동작이며 실제 결제 단말기 절차를 가르치지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| grs-01 | bread | npc | Clerk | Hi! Can I help you find something? | A2 | 인사하며 찾기 도움 제안 | A | - | - |
| grs-02 | bread | option | A자리 | Where is the bread? | A2 | 상품 위치 질문 | A | - | - |
| grs-03 | bread | option | A자리 | Could you show me where the bread is? | A2 | 직접 안내 요청 | A | - | - |
| grs-04 | bread | npc | Clerk | It's next to the milk. | A2 | 상품 위치 설명 | A | - | - |
| grs-05 | bread | npc | Clerk | Sure. Follow me. | A2 | 직접 데려다주기 | A | - | - |
| grs-06 | loaf | npc | Clerk | Here's the bread. | A2 | 찾은 상품 보여 주기 | A | - | - |
| grs-07 | loaf | option | B자리 | We need one loaf, please. | A2 | 필요한 수량 요청 | A | - | - |
| grs-08 | loaf | option | B자리 | How much is one loaf? | A2 | 해당 수량의 값 질문 | A | - | - |
| grs-09 | apples | npc | Clerk | One loaf is three dollars. Shall I add one? | A2 | 값 알려 주고 담을지 확인 | B | 직원이 상품을 담아 주는 가상 절차와 권유 표현의 어감을 감수하지 못했다 | - |
| grs-10 | apples | option | A자리 | Yes. Where are the apples? | A2 | 담기 동의하고 다음 상품 위치 질문 | A | - | - |
| grs-11 | apples | option | A자리 | Yes. Could you help me find apples? | A2 | 담기 동의하고 상품 찾기 도움 요청 | A | - | - |
| grs-12 | apples | npc | Clerk | They're next to the bananas. | A2 | 상품 위치 설명 | A | - | - |
| grs-13 | apples | npc | Clerk | Sure. Come this way. | A2 | 과일 진열대로 직접 안내 | B | 직원이 직접 데려다주는 절차는 가상이며 매장 말투를 감수하지 못했다 | - |
| grs-14 | count | npc | Clerk | How many apples would you like? | A2 | 필요한 수량 묻기 | A | - | - |
| grs-15 | count | option | B자리 | Three apples, please. | A2 | 수량 요청 | A | - | - |
| grs-16 | count | option | B자리 | How much are three apples? | A2 | 해당 수량의 값 질문 | A | - | - |
| grs-17 | add | npc | Clerk | Three apples are two dollars. Shall I add three? | A2 | 값 알려 주고 담을지 확인 | B | 직원이 사과를 담아 주는 가상 절차와 권유 표현의 어감을 감수하지 못했다 | - |
| grs-18 | add | option | A자리 | Yes, that's enough. | A2 | 수량 확정 | A | - | - |
| grs-19 | add | option | A자리 | Yes. Can we put them in this bag? | A2 | 수량 확정하며 봉투 사용 질문 | A | - | - |
| grs-20 | add | npc | Clerk | Yes, use that bag. | A2 | 가져온 봉투 사용 허용 | B | 봉투 사용 허용은 가상 규칙이며 실제 마트의 위생이나 결제 절차를 확인하지 못했다 | - |
| grs-21 | list | npc | Clerk | Anything else today? | A2 | 추가 상품 묻기 | A | - | - |
| grs-22 | list | option | B자리 | No, that's all. | A2 | 추가 구매 거절 | A | - | - |
| grs-23 | list | option | B자리 | Could you check our list? | A2 | 장보기 목록 확인 요청 | B | 직원에게 목록을 대조해 달라는 부탁의 매장 자연스러움을 감수하지 못했다 | - |
| grs-24 | total | npc | Cashier | Bread and apples. That's five dollars. | A2 | 목록 대조하며 최종 합계 안내 | B | 가상 상품 가격과 합계이며 실제 세금이나 매장 가격은 확인하지 않았다 | - |
| grs-25 | total | option | A자리 | Could you say the total again? | A2 | 합계 다시 말해 달라고 요청 | A | - | - |
| grs-26 | total | option | A자리 | Five dollars altogether, right? | A2 | 들은 합계 확인 | A | - | - |
| grs-27 | pay | npc | Cashier | Five dollars. How would you like to pay? | A2 | 합계 되말하고 결제 방법 묻기 | A | - | - |
| grs-28 | pay | option | B자리 | By card, please. | A2 | 결제 방법 선택 | A | - | - |
| grs-29 | pay | option | B자리 | Do you take cards? | A2 | 카드 결제 가능 여부 질문 | A | - | - |
| grs-30 | card | npc | Cashier | Yes. Put your card here, please. | A2 | 카드 결제 위치 안내 | B | 실제 단말기 절차가 아닌 가상 결제 안내이며 영어 어감을 감수하지 못했다 | - |
| grs-31 | card | option | A자리 | Like this? | A2 | 카드 놓는 방식 확인 | A | - | - |
| grs-32 | card | option | A자리 | Can you show me where? | A2 | 놓을 위치 시범 요청 | A | - | - |
| grs-33 | card | npc | Cashier | Yes, that's right. | A2 | 조작 확인에 답하기 | A | - | - |
| grs-34 | card | npc | Cashier | Sure. Put it here. | A2 | 가리키며 시범 안내 | B | 가리키는 장면 동작에 의존하는 안내이며 실제 카드 조작 절차를 확인하지 못했다 | - |
| grs-35 | receipt | npc | Cashier | Would you like a receipt? | A2 | 영수증 필요 여부 묻기 | A | - | - |
| grs-36 | receipt | option | A자리 | Yes, a receipt, please. | A2 | 영수증 요청 | A | - | - |
| grs-37 | receipt | option | A자리 | Could you put it in the bag? | A2 | 영수증을 봉투에 넣도록 요청 | A | - | - |
| grs-38 | leave | npc | Cashier | Here are your groceries and receipt. | A2 | 물건과 영수증 건네기 | A | - | - |
| grs-39 | leave | wait | B자리 | Thank you. Have a nice day! | A2 | 감사하며 작별 | A | - | - |

### 연습할 말

이 나들이 안에서만 쓰는 연습 말이다. 기준서의 본 강의 카드 총량에는 넣지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| grs-p1 | Where is the bread? | 상품 위치 질문 | grs-02 | - |
| grs-p2 | Could you show me where the bread is? | 직접 안내 요청 | grs-03 | - |
| grs-p3 | We need one loaf, please. | 필요한 수량 요청 | grs-07 | - |
| grs-p4 | How much is one loaf? | 해당 수량의 값 질문 | grs-08 | - |
| grs-p5 | Yes. Could you help me find apples? | 담기 동의하고 상품 찾기 도움 요청 | grs-11 | - |
| grs-p6 | Three apples, please. | 수량 요청 | grs-15 | - |
| grs-p7 | How much are three apples? | 해당 수량의 값 질문 | grs-16 | - |
| grs-p8 | Yes. Can we put them in this bag? | 수량 확정하며 봉투 사용 질문 | grs-19 | - |
| grs-p9 | Could you say the total again? | 합계 다시 말해 달라고 요청 | grs-25 | - |
| grs-p10 | Do you take cards? | 카드 결제 가능 여부 질문 | grs-29 | - |
| grs-p11 | Could you put it in the bag? | 영수증을 봉투에 넣도록 요청 | grs-37 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | bread | grs-01 | grs-02/grs-03 | A |
| t2 | loaf | grs-06 | grs-07/grs-08 | B |
| t3 | apples | grs-09 | grs-10/grs-11 | A |
| t4 | count | grs-14 | grs-15/grs-16 | B |
| t5 | add | grs-17 | grs-18/grs-19 | A |
| t6 | list | grs-21 | grs-22/grs-23 | B |
| t7 | total | grs-24 | grs-25/grs-26 | A |
| t8 | pay | grs-27 | grs-28/grs-29 | B |
| t9 | card | grs-30 | grs-31/grs-32 | A |
| t10 | receipt | grs-35 | grs-36/grs-37 | A |
| t11 | leave | grs-38 | grs-39 | B |

## 나들이: pharmacy

작성자: codex (2026-10-11)
장소: -
세션: 86
목표 등급: A2
할 일: cd-pha-1 / I can describe a symptom and ask pharmacy staff about a product and its use. / 약국 직원에게 증상을 말하고 제품과 사용법을 확인할 수 있어요.
허용 이름: -
갈래: pha-05 > pha-07, pha-06 > pha-08, pha-10 > pha-12, pha-11 > pha-13, pha-15 > pha-17, pha-16 > pha-17, pha-22 > pha-24, pha-26 > pha-28, pha-27 > pha-28, pha-30 > pha-32, pha-31 > pha-33

상황: 제안 장소 id는 pharmacy예요. Clerk는 물건과 라벨을 보여 주고 약사에게 상담을 연결하는 가상 직원이에요. 두 사람은 목이 아프다고 말하고 목 제품 상자 하나의 성분과 사용법을 확인하려고 해요. 직원은 사용법의 표시 위치만 안내하고 실제 복용량이나 진단, 제품 효능을 말하지 않아요. 한 상자 육 달러와 라벨 위치, 약사 호출은 이 미션만의 가상 장면 값이에요. 마지막에 구매하거나 약사 상담을 먼저 기다릴 수 있어요. 상담을 고르면 구매가 진행되지 않아요.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| pha-01 | greet | npc | Clerk | Hi. How can I help you? | A1 | 인사하고 용건 묻기 | A | - | - |
| pha-02 | greet | option | A자리 | My throat hurts. | A2 | 증상 설명하기 | A | - | - |
| pha-03 | greet | option | A자리 | Could you show me some throat drops? | A2 | 제품 보여 달라고 부탁하기 | B | throat drops라는 제품 이름과 부탁 말의 등급은 사용자 확인이 필요해요 | - |
| pha-04 | label | npc | Clerk | Here are throat drops. Let's check the label. | A2 | 제품과 라벨 보여 주기 | B | 목 제품을 제시하는 가상 직원 응대이며 증상에 맞는 제품이라는 판단은 하지 않아요 | - |
| pha-05 | label | option | A자리 | It started hurting this morning. | A2 | 증상 시작 시점 알리기 | A | - | - |
| pha-06 | label | option | A자리 | Could my partner look at it too? | A2 | 동행도 함께 보게 부탁하기 | A | - | - |
| pha-07 | label | npc | Clerk | We'll ask the pharmacist about your throat. | A2 | 증상 상담 연결하기 | B | 직원이 약사에게 연결하는 가상 절차이며 실제 약국의 응대 방식은 확인하지 않았어요 | - |
| pha-08 | label | npc | Clerk | Yes. You can both look at it. | A1 | 동행에게도 라벨 보여 주기 | A | - | - |
| pha-09 | ingredients | npc | Clerk | What would you like to check first? | A2 | 먼저 확인할 내용 묻기 | A | - | - |
| pha-10 | ingredients | option | B자리 | The ingredients, please. | A2 | 확인할 내용 고르기 | B | ingredients를 짧은 선택 답으로 쓰는 자연스러움과 등급은 사용자 확인이 필요해요 | - |
| pha-11 | ingredients | option | B자리 | Could you read the label with us? | A2 | 함께 라벨 읽어 달라고 부탁하기 | A | - | - |
| pha-12 | ingredients | npc | Clerk | The ingredients are on the back. | A2 | 성분 표시 위치 알려 주기 | B | 성분이 뒷면에 있는 것은 이 가상 상자의 설정이며 실제 제품 표시 위치를 단정하지 않아요 | - |
| pha-13 | ingredients | npc | Clerk | Let's read the ingredients on the back together. | A2 | 성분을 함께 읽기 | A | - | - |
| pha-14 | directions | npc | Clerk | The directions are here on the label. | A2 | 사용법 표시 위치 알려 주기 | B | 사용법의 위치만 안내하며 실제 제품의 사용 방법이나 복용량을 제시하지 않아요 | - |
| pha-15 | directions | option | B자리 | How do I use these drops? | A2 | 제품 사용법 묻기 | B | 약국에서 쓰는 제품 사용법 질문이며 drops가 목 제품을 가리키는 연어는 사용자 확인이 필요해요 | - |
| pha-16 | directions | option | B자리 | I need help understanding these directions. | A2 | 사용법 이해에 도움 요청하기 | B | 의약품 directions의 의미와 help understanding 구문의 난이도는 사용자 확인이 필요해요 | - |
| pha-17 | directions | npc | Clerk | We'll ask the pharmacist how to use these. | A2 | 사용법 설명을 약사에게 연결하기 | A | - | - |
| pha-18 | medicine | npc | Clerk | Do you take any other medicine? | A2 | 다른 약 사용 여부 묻기 | B | 가상 상담 연결을 위한 질문이며 실제 진단이나 제품 선택 근거로 쓰지 않았어요 | - |
| pha-19 | medicine | option | A자리 | No, I don't take any medicine. | A2 | 다른 약을 먹지 않는다고 알리기 | A | - | - |
| pha-20 | medicine | option | A자리 | I have my medicine list here. | A2 | 약 목록을 보여 주겠다고 알리기 | A | - | - |
| pha-21 | use | npc | Clerk | The pharmacist can answer your questions. | A2 | 사용 관련 질문을 약사에게 안내하기 | B | 약사 상담으로 연결하는 직원 표현과 pharmacist의 등급은 사용자 확인이 필요해요 | - |
| pha-22 | use | option | B자리 | Could you point to the directions? | A2 | 사용법 위치를 가리켜 달라고 부탁하기 | A | - | - |
| pha-23 | use | option | B자리 | We'll ask before using them. | A2 | 사용 전 확인하겠다고 알리기 | A | - | - |
| pha-24 | use | npc | Clerk | The directions are on this label. | A2 | 사용법 위치 다시 가리키기 | B | 라벨 위치를 안내하는 가상 응대이며 읽지 않은 사용법을 안다고 가정하지 않아요 | - |
| pha-25 | price | npc | Clerk | Would you like to see the price? | A2 | 가격 확인을 권하기 | A | - | - |
| pha-26 | price | option | A자리 | Yes. How much are these drops? | A2 | 가격 묻기 | A | - | - |
| pha-27 | price | option | A자리 | I'll check the price on the box. | A2 | 직접 가격을 확인하겠다고 알리기 | A | - | - |
| pha-28 | price | npc | Clerk | One box is six dollars. | A1 | 상자 하나의 가격 알려 주기 | B | 한 상자 육 달러는 이 미션의 가상 장면 값이며 실제 제품 가격을 나타내지 않아요 | - |
| pha-29 | decision | npc | Clerk | Do you want to buy this box? | A1 | 구매 여부 묻기 | A | - | - |
| pha-30 | decision | option | B자리 | I'll take it. Thank you. | A1 | 구매를 결정하고 감사하기 | A | - | - |
| pha-31 | decision | option | B자리 | Could we speak to the pharmacist first? | A2 | 구매를 미루고 약사 상담 요청하기 | A | - | - |
| pha-32 | decision | npc | Clerk | Keep the label. Ask a pharmacist before using these. | A2 | 사용 전 약사 확인을 안내하기 | A | - | - |
| pha-33 | decision | npc | Clerk | Sure. Please wait here. I'll ask them to come. | A2 | 약사 상담을 기다리게 안내하기 | B | 약사 호출과 대기 장소는 이 장면만의 가상 절차이며 실제 약국 절차를 단정하지 않아요 | - |

### 연습할 말 (이 나들이의 연습 15개)

위 본문 줄과 같은 영어로 연습해요. 나들이 안에서만 쓰며 기준서 8.1의 카드 총량에 넣지 않아요.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| pha-p1 | My throat hurts. | 증상 설명하기 | pha-02 | - |
| pha-p2 | Could you show me some throat drops? | 제품 보여 달라고 부탁하기 | pha-03 | - |
| pha-p3 | It started hurting this morning. | 증상 시작 시점 알리기 | pha-05 | - |
| pha-p4 | Could my partner look at it too? | 동행도 함께 보게 부탁하기 | pha-06 | - |
| pha-p5 | The ingredients, please. | 확인할 내용 고르기 | pha-10 | - |
| pha-p6 | Could you read the label with us? | 함께 라벨 읽어 달라고 부탁하기 | pha-11 | - |
| pha-p7 | How do I use these drops? | 제품 사용법 묻기 | pha-15 | - |
| pha-p8 | I need help understanding these directions. | 사용법 이해에 도움 요청하기 | pha-16 | - |
| pha-p9 | No, I don't take any medicine. | 다른 약을 먹지 않는다고 알리기 | pha-19 | - |
| pha-p10 | I have my medicine list here. | 약 목록을 보여 주겠다고 알리기 | pha-20 | - |
| pha-p11 | Could you point to the directions? | 사용법 위치를 가리켜 달라고 부탁하기 | pha-22 | - |
| pha-p12 | We'll ask before using them. | 사용 전 확인하겠다고 알리기 | pha-23 | - |
| pha-p13 | Yes. How much are these drops? | 가격 묻기 | pha-26 | - |
| pha-p14 | I'll take it. Thank you. | 구매를 결정하고 감사하기 | pha-30 | - |
| pha-p15 | Could we speak to the pharmacist first? | 구매를 미루고 약사 상담 요청하기 | pha-31 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | greet | pha-01 | pha-02/pha-03 | A |
| t2 | label | pha-04 | pha-05/pha-06 | A |
| t3 | ingredients | pha-09 | pha-10/pha-11 | B |
| t4 | directions | pha-14 | pha-15/pha-16 | B |
| t5 | medicine | pha-18 | pha-19/pha-20 | A |
| t6 | use | pha-21 | pha-22/pha-23 | B |
| t7 | price | pha-25 | pha-26/pha-27 | A |
| t8 | decision | pha-29 | pha-30/pha-31 | B |

## 나들이: thebus_ride

작성자: codex (2026-10-11)
장소: -
세션: 89
목표 등급: A2
할 일: cd-tbr-1 / I can check a bus route and fare and ask where to get off. / 버스 목적지와 요금을 확인하고 내릴 곳을 물을 수 있어요.
허용 이름: -
갈래: tbr-02 > tbr-04, tbr-03 > tbr-04, tbr-06 > tbr-08, tbr-07 > tbr-08, tbr-10 > tbr-12, tbr-11 > tbr-12, tbr-14 > tbr-16, tbr-15 > tbr-17, tbr-20 > tbr-21, tbr-23 > tbr-25, tbr-24 > tbr-26, tbr-28 > tbr-30, tbr-29 > tbr-31, tbr-34 > tbr-35

상황: 제안 장소 id는 bus_stop_kalakaua예요. 실제 TheBus의 요금이나 카드 규정을 재현하는 장면이 아니에요. 이 가상 노선은 해변으로 가며 공원 다음이 해변 정류장이에요. 한 사람 삼 달러, 두 사람 육 달러예요. 장면의 카드는 제시한 위치에서 결제돼요. 버스 뒷부분의 두 자리와 내리는 문, 해변 맞은편 건널목도 가상 장면 값이에요. 기사에게 부탁하는 말은 버스가 정차했을 때 해요. 자리 안내 뒤에는 두 사람이 앉은 채로 이동하고, 도착 안내 뒤에는 버스가 완전히 멈춘 상태에서 내려요.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| tbr-01 | route | npc | Driver | Hi. Where would you like to go? | A2 | 인사하고 목적지 묻기 | A | - | - |
| tbr-02 | route | option | A자리 | Does this bus go to the beach? | A2 | 버스 목적지 묻기 | A | - | - |
| tbr-03 | route | option | A자리 | We're going to the beach today. | A2 | 목적지 알리기 | A | - | - |
| tbr-04 | route | npc | Driver | Yes. We stop near the beach. | A2 | 목적지 확인해 주기 | B | 해변 근처에 정차하는 노선은 가상 장면 설정이며 실제 버스 노선을 단정하지 않아요 | - |
| tbr-05 | fare | npc | Driver | What would you like to know? | A2 | 궁금한 내용 묻기 | A | - | - |
| tbr-06 | fare | option | B자리 | How much is the fare for two people? | A2 | 두 사람 요금 묻기 | A | - | - |
| tbr-07 | fare | option | B자리 | Where can we check the fare? | A2 | 요금 안내 위치 묻기 | A | - | - |
| tbr-08 | fare | npc | Driver | Please check the fare on this sign. | A2 | 요금 안내판 가리키기 | B | 요금이 이 안내판에 표시된 것은 가상 장면의 설정이며 실제 버스 표시 방식은 확인하지 않았어요 | - |
| tbr-09 | total | npc | Driver | The fare is three dollars each. | A2 | 한 사람 요금 말하기 | B | 한 사람 삼 달러는 이 미션의 가상 요금이며 실제 버스 요금과 관계없어요 | - |
| tbr-10 | total | option | A자리 | So six dollars for both of us? | A2 | 두 사람 합계 확인하기 | A | - | - |
| tbr-11 | total | option | A자리 | Could you say the price again? | A2 | 요금 다시 말해 달라고 부탁하기 | A | - | - |
| tbr-12 | total | npc | Driver | It's six dollars for two people. | A2 | 두 사람 요금 다시 알려 주기 | B | 가상 요금 삼 달러에 두 사람을 곱한 합계이며 실제 할인이나 이용권 규정을 담지 않아요 | - |
| tbr-13 | pay | npc | Driver | Please pay here before you take a seat. | A2 | 결제 장소와 순서 안내하기 | B | 앉기 전에 이 위치에서 결제하는 것은 가상 버스 절차이며 실제 운영 규정을 단정하지 않아요 | - |
| tbr-14 | pay | option | B자리 | Can we use this card to pay? | A2 | 카드 사용 가능 여부 묻기 | A | - | - |
| tbr-15 | pay | option | B자리 | Please show me where to put the card. | A2 | 카드 결제 위치를 보여 달라고 부탁하기 | A | - | - |
| tbr-16 | pay | npc | Driver | Yes. Hold it here to pay. | A2 | 카드 사용과 결제 위치 안내하기 | B | 이 가상 카드가 이 위치에서 결제되는 설정이며 실제 버스 카드 종류나 사용 규정은 확인하지 않았어요 | - |
| tbr-17 | pay | npc | Driver | Hold your card here to pay. | A2 | 카드 결제 위치 보여 주기 | B | 카드를 대는 결제 방식은 가상 장면 설정이며 실제 버스 결제 방법을 단정하지 않아요 | - |
| tbr-18 | seat | npc | Driver | There are seats near the back. | A2 | 빈자리 위치 알려 주기 | B | 버스 뒷부분에 두 빈자리가 있는 것은 가상 장면 설정이에요 | - |
| tbr-19 | seat | option | A자리 | We'll sit together at the back. | A2 | 함께 앉을 자리 알리기 | A | - | - |
| tbr-20 | seat | option | A자리 | Could you show us where to sit? | A2 | 앉을 자리 안내 요청하기 | A | - | - |
| tbr-21 | seat | npc | Driver | It's okay to sit in those two seats. | A2 | 함께 앉을 자리 가리키기 | B | 두 빈자리를 가리키는 가상 응대이며 우선 좌석이나 실제 버스의 좌석 규정을 제시하지 않아요 | - |
| tbr-22 | stop | npc | Driver | The park is just before the beach stop. | A2 | 정류장 순서 알려 주기 | B | 공원 다음이 해변 정류장인 순서는 이 가상 노선만의 설정이에요 | - |
| tbr-23 | stop | option | B자리 | Could you tell us when to get off? | A2 | 내릴 때 알려 달라고 부탁하기 | A | - | - |
| tbr-24 | stop | option | B자리 | Is our stop the one after the park? | A2 | 내릴 정류장 순서 확인하기 | A | - | - |
| tbr-25 | stop | npc | Driver | Yes. I'll tell you when we reach the beach. | A2 | 내릴 때 알려 주겠다고 약속하기 | B | 기사의 알림 약속은 가상 응대이며 실제 버스 서비스로 보장되는 것이 아니에요 | - |
| tbr-26 | stop | npc | Driver | Yes. The beach stop is after the park. | A2 | 정류장 순서 확인해 주기 | B | 공원 다음 해변 정류장은 가상 노선 설정이며 실제 정류장 순서와 관계없어요 | - |
| tbr-27 | exit | npc | Driver | We're at the beach stop now. | A2 | 내릴 정류장에 도착했다고 알리기 | B | 해변 정류장 도착은 이 미션의 가상 이동 흐름이에요 | - |
| tbr-28 | exit | option | A자리 | Can we get off through this door? | A2 | 내릴 문 사용 가능 여부 묻기 | A | - | - |
| tbr-29 | exit | option | A자리 | Please give us a moment to stand up. | A2 | 일어날 시간 부탁하기 | A | - | - |
| tbr-30 | exit | npc | Driver | Yes. You can use this door. | A2 | 내릴 문 알려 주기 | B | 이 문으로 내리는 것은 가상 버스 설정이며 실제 버스의 승하차 문 규정을 단정하지 않아요 | - |
| tbr-31 | exit | npc | Driver | Take your time. I'll wait. | A2 | 내릴 준비를 기다려 주기 | B | 기사의 기다림은 가상 응대이며 실제 서비스나 운행 방식을 보장하지 않아요 | - |
| tbr-32 | bye | npc | Driver | Here we are. Have a good day! | A1 | 도착 인사하기 | A | - | - |
| tbr-33 | bye | option | B자리 | Thank you for your help. | A1 | 도움에 감사하기 | A | - | - |
| tbr-34 | bye | option | B자리 | Is the beach across the street? | A2 | 내린 뒤 해변 방향 묻기 | A | - | - |
| tbr-35 | bye | npc | Driver | Yes. Use the crossing over there. | A2 | 해변 쪽 건널목 가리키기 | B | 정류장 맞은편 해변과 건널목은 가상 장면 설정이며 실제 도로 안내가 아니에요 | - |

### 연습할 말 (이 나들이의 연습 16개)

위 본문 줄과 같은 영어로 연습해요. 나들이 안에서만 쓰며 기준서 8.1의 카드 총량에 넣지 않아요.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| tbr-p1 | Does this bus go to the beach? | 버스 목적지 묻기 | tbr-02 | - |
| tbr-p2 | We're going to the beach today. | 목적지 알리기 | tbr-03 | - |
| tbr-p3 | How much is the fare for two people? | 두 사람 요금 묻기 | tbr-06 | - |
| tbr-p4 | Where can we check the fare? | 요금 안내 위치 묻기 | tbr-07 | - |
| tbr-p5 | So six dollars for both of us? | 두 사람 합계 확인하기 | tbr-10 | - |
| tbr-p6 | Could you say the price again? | 요금 다시 말해 달라고 부탁하기 | tbr-11 | - |
| tbr-p7 | Can we use this card to pay? | 카드 사용 가능 여부 묻기 | tbr-14 | - |
| tbr-p8 | Please show me where to put the card. | 카드 결제 위치를 보여 달라고 부탁하기 | tbr-15 | - |
| tbr-p9 | We'll sit together at the back. | 함께 앉을 자리 알리기 | tbr-19 | - |
| tbr-p10 | Could you show us where to sit? | 앉을 자리 안내 요청하기 | tbr-20 | - |
| tbr-p11 | Could you tell us when to get off? | 내릴 때 알려 달라고 부탁하기 | tbr-23 | - |
| tbr-p12 | Is our stop the one after the park? | 내릴 정류장 순서 확인하기 | tbr-24 | - |
| tbr-p13 | Can we get off through this door? | 내릴 문 사용 가능 여부 묻기 | tbr-28 | - |
| tbr-p14 | Please give us a moment to stand up. | 일어날 시간 부탁하기 | tbr-29 | - |
| tbr-p15 | Thank you for your help. | 도움에 감사하기 | tbr-33 | - |
| tbr-p16 | Is the beach across the street? | 내린 뒤 해변 방향 묻기 | tbr-34 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | route | tbr-01 | tbr-02/tbr-03 | A |
| t2 | fare | tbr-05 | tbr-06/tbr-07 | B |
| t3 | total | tbr-09 | tbr-10/tbr-11 | A |
| t4 | pay | tbr-13 | tbr-14/tbr-15 | B |
| t5 | seat | tbr-18 | tbr-19/tbr-20 | A |
| t6 | stop | tbr-22 | tbr-23/tbr-24 | B |
| t7 | exit | tbr-27 | tbr-28/tbr-29 | A |
| t8 | bye | tbr-32 | tbr-33/tbr-34 | B |

## 나들이: bank_post_office

작성자: codex (2026-10-11)
장소: -
세션: 101
목표 등급: B1
할 일: cd-bpo-1 / I can explain my needs and ask about steps at a bank and a post office. / 은행과 우체국에서 용건을 말하고 필요한 절차를 물을 수 있다.
허용 이름: -
갈래: bpo-05 > bpo-06, bpo-09 > bpo-10, bpo-17 > bpo-19, bpo-18 > bpo-20, bpo-24 > bpo-25, bpo-27 > bpo-29, bpo-28 > bpo-30, bpo-33 > bpo-34

상황: 제안 장소 id는 `new:bank_and_post_office`다. 같은 건물에 은행 창구와 우체국 창구가 있는 가상 장면으로, A가 자기 계좌에 현금을 넣고 B가 편지를 보낸다. Clerk는 은행 장면의 직원과 우편 장면의 직원을 각각 가리킨다. 현금 100달러, 입금 뒤 잔액 200달러, 우편료 5달러, 금요일 도착 예상, 여권을 신분 확인에 받는 조건, 계좌 번호 찾기 도움, 카드 결제와 영수증 제공은 모두 이 장면에서만 정한 값과 절차다. 실제 기관의 규정·수수료·배달 기한을 뜻하지 않는다. 계좌 번호와 주소는 가상 화면에 있고 실제 개인정보를 입력하지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| bpo-01 | plan | wait | A자리 | I need to put money in my account. | B1 | 은행 용건 말하기 | A | - | - |
| bpo-02 | plan | wait | B자리 | Let's ask what documents we need. | B1 | 동행자와 절차 확인 계획 | A | - | - |
| bpo-03 | bank_request | npc | Clerk | How can I help you today? | B1 | 용건 묻기 | A | - | - |
| bpo-04 | bank_request | option | A자리 | I'd like to deposit some cash. | B1 | 현금 입금 요청 | A | - | - |
| bpo-05 | bank_request | option | A자리 | Could you explain how to deposit cash? | B1 | 입금 절차 설명 요청 | A | - | - |
| bpo-06 | bank_request | npc | Clerk | I'll walk you through it. | B1 | 단계별 안내 약속 | A | - | - |
| bpo-07 | account | npc | Clerk | Do you have your account number? | B1 | 계좌 정보 확인 | A | - | - |
| bpo-08 | account | option | A자리 | Yes. Here is my account number. | B1 | 계좌 정보 제시 | A | - | - |
| bpo-09 | account | option | A자리 | Could you help me find it? | B1 | 정보 찾기 도움 요청 | A | - | - |
| bpo-10 | account | npc | Clerk | We can look it up together. | B1 | 계좌 정보 찾기 안내 | B | 직원의 계좌 번호 찾기 도움은 이 가상 창구의 절차다. 실제 은행에서 허용되는 확인 방식은 검증하지 않았다. | - |
| bpo-11 | identity | npc | Clerk | Please show me your ID. | B1 | 신분 확인 요청 | B | 현금 입금에 필요한 신분 확인 절차는 기관마다 다를 수 있어 이 장면의 조건으로만 정했다. | - |
| bpo-12 | identity | wait | A자리 | Is my passport okay? | B1 | 사용할 서류 확인 | A | - | - |
| bpo-13 | account | npc | Clerk | Yes, that works for this visit. | B1 | 서류 사용 가능 확인 | B | 여권을 받아 주는 것은 가상 장면 조건이다. 실제 은행의 서류 요건을 확인하지 않았다. | - |
| bpo-14 | deposit | npc | Clerk | How much would you like to deposit? | B1 | 입금액 묻기 | A | - | - |
| bpo-15 | deposit | wait | A자리 | One hundred dollars, please. | B1 | 입금액 말하기 | A | - | - |
| bpo-16 | bank_finish | npc | Clerk | Would you like a receipt? | B1 | 영수증 필요 확인 | A | - | - |
| bpo-17 | bank_finish | option | A자리 | Yes, a paper receipt, please. | B1 | 종이 영수증 요청 | A | - | - |
| bpo-18 | bank_finish | option | A자리 | Can you tell me my balance? | B1 | 잔액 확인 요청 | A | - | - |
| bpo-19 | bank_finish | npc | Clerk | Here is your receipt. | B1 | 영수증 전달 | A | - | - |
| bpo-20 | bank_finish | npc | Clerk | You have two hundred dollars in your account. | B1 | 장면용 잔액 안내 | B | 잔액 200달러는 장면용 값이며 직원이 이렇게 바로 잔액을 알려 주는 절차는 실제 기관에서 검증하지 않았다. | - |
| bpo-21 | post_plan | wait | A자리 | Now let's mail our letter. | B1 | 다음 용건으로 이동 제안 | A | - | - |
| bpo-22 | address | npc | Clerk | Do you have the address? | B1 | 받는 주소 확인 | A | - | - |
| bpo-23 | address | option | B자리 | Yes, it's on the envelope. | B1 | 주소 위치 알려 주기 | A | - | - |
| bpo-24 | address | option | B자리 | Can you check the address for me? | B1 | 주소 확인 도움 요청 | A | - | - |
| bpo-25 | address | npc | Clerk | I'll check that it's easy to read. | B1 | 주소 가독성 확인 | B | 여기서는 글씨를 읽을 수 있는지만 확인한다. 실제 직원의 주소 확인 서비스 범위는 검증하지 않았다. | - |
| bpo-26 | post_service | npc | Clerk | The letter should arrive Friday. It costs five dollars. | B1 | 도착 예상과 비용 안내 | B | 요금과 도착일은 가상 장면 값이다. 실제 우편 서비스의 가격이나 기한을 보장하지 않는다. | - |
| bpo-27 | post_service | option | B자리 | Could you repeat the delivery date? | B1 | 도착일 다시 듣기 요청 | A | - | - |
| bpo-28 | post_service | option | B자리 | Does that price include everything? | B1 | 비용 포함 범위 확인 | A | - | - |
| bpo-29 | post_service | npc | Clerk | It should arrive Friday. | B1 | 예상 도착일 반복 | B | 금요일 도착은 가상 장면의 예상값이다. 실제 배송 기한을 조회하지 않았다. | - |
| bpo-30 | post_service | npc | Clerk | Yes, that is the full price. | B1 | 총비용 확인 | B | 추가 비용이 없다는 답은 이 가상 우편 서비스에서만 정한 조건이다. | - |
| bpo-31 | post_payment | npc | Clerk | How would you like to pay? | B1 | 결제 방법 묻기 | A | - | - |
| bpo-32 | post_payment | option | B자리 | I'll pay by card. | B1 | 카드 결제 선택 | A | - | - |
| bpo-33 | post_payment | option | B자리 | Can I have a receipt, too? | B1 | 결제 전 영수증 요청 | A | - | - |
| bpo-34 | post_payment | npc | Clerk | Yes, I'll give you one. | B1 | 영수증 제공 약속 | A | - | - |
| bpo-35 | card | wait | B자리 | Here is my card. | B1 | 결제 수단 제시 | A | - | - |
| bpo-36 | post_finish | npc | Clerk | Here's your receipt. We'll send the letter today. | B1 | 영수증 전달과 발송 안내 | B | 당일 발송과 종이 영수증 제공은 가상 장면 조건이다. 실제 접수 마감이나 영수증 절차는 확인하지 않았다. | - |
| bpo-37 | post_finish | wait | B자리 | Thank you. That's all I need. | B1 | 용건 완료와 감사 | A | - | - |

### 연습할 말 (이 나들이의 연습 12개)

나들이 안에서만 쓰는 본보기다. 아래 영어는 가리키는 원문 줄과 같고, 한국어 풀이는 이후 공개이므로 넣지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| bpo-p1 | I need to put money in my account. | 은행 용건 말하기 | bpo-01 | - |
| bpo-p2 | I'd like to deposit some cash. | 현금 입금 요청 | bpo-04 | - |
| bpo-p3 | Could you explain how to deposit cash? | 입금 절차 설명 요청 | bpo-05 | - |
| bpo-p4 | Could you help me find it? | 정보 찾기 도움 요청 | bpo-09 | - |
| bpo-p5 | Is my passport okay? | 사용할 서류 확인 | bpo-12 | - |
| bpo-p6 | Can you tell me my balance? | 잔액 확인 요청 | bpo-18 | - |
| bpo-p7 | Yes, it's on the envelope. | 주소 위치 알려 주기 | bpo-23 | - |
| bpo-p8 | Can you check the address for me? | 주소 확인 도움 요청 | bpo-24 | - |
| bpo-p9 | Could you repeat the delivery date? | 도착일 다시 듣기 요청 | bpo-27 | - |
| bpo-p10 | Does that price include everything? | 비용 포함 범위 확인 | bpo-28 | - |
| bpo-p11 | I'll pay by card. | 카드 결제 선택 | bpo-32 | - |
| bpo-p12 | Can I have a receipt, too? | 결제 전 영수증 요청 | bpo-33 | - |

### 미니게임 차례

은행 용건 뒤 우편 용건으로 넘어간다. 여권 확인 답은 다음 계좌 차례의 첫 NPC 줄로 듣는다. 결제 전 영수증을 먼저 요청한 갈래도 그다음 차례에서 카드로 결제하므로 결제가 생략되지 않는다.

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | plan | - | bpo-01 | A |
| t2 | plan | - | bpo-02 | B |
| t3 | bank_request | bpo-03 | bpo-04/bpo-05 | A |
| t4 | identity | bpo-11 | bpo-12 | A |
| t5 | account | bpo-13+bpo-07 | bpo-08/bpo-09 | A |
| t6 | deposit | bpo-14 | bpo-15 | A |
| t7 | bank_finish | bpo-16 | bpo-17/bpo-18 | A |
| t8 | post_plan | - | bpo-21 | A |
| t9 | address | bpo-22 | bpo-23/bpo-24 | B |
| t10 | post_service | bpo-26 | bpo-27/bpo-28 | B |
| t11 | post_payment | bpo-31 | bpo-32/bpo-33 | B |
| t12 | card | - | bpo-35 | B |
| t13 | post_finish | bpo-36 | bpo-37 | B |

## 나들이: taxi_ride

작성자: codex (2026-10-11)
장소: -
세션: 119
목표 등급: B1
할 일: cd-txr-1 / I can give a taxi destination, ask about the fare, and arrange a safe stop. / 택시 목적지를 알려 주고 요금을 물으며 안전하게 내릴 곳을 요청할 수 있다.
허용 이름: -
갈래: txr-04 > txr-06, txr-05 > txr-06, txr-09 > txr-11, txr-10 > txr-12, txr-14 > txr-16, txr-15 > txr-17, txr-21 > txr-23, txr-22 > txr-24, txr-31 > txr-32

상황: 제안 장소 id는 `new:taxi_stand`다. 두 사람은 가상의 택시 승강장에서 호텔로 간다. 호텔 주소는 휴대폰에 이미 적혀 있으며 실제 주소를 입력하지 않는다. 약 20달러라는 출발 전 예상, 최종 20달러, 약 15분이라는 예상, 추가 요금 없음, 카드 결제와 영수증 제공, 짐을 둘 자리와 음악은 모두 이 장면에만 있는 조건이다. 실제 택시 회사의 요금·결제 정책·운행 시간이나 실제 호텔의 승하차 위치를 뜻하지 않는다. 어느 짐 갈래를 골라도 마지막에는 자기 물건을 확인하고, 정문 근처 요청은 기사가 안전한 곳에 정차한다는 조건으로 받는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| txr-01 | plan | wait | A자리 | We need a ride to our hotel. | B1 | 이동 용건 말하기 | A | - | - |
| txr-02 | plan | wait | B자리 | Let's ask about the fare before we get in. | B1 | 탑승 전 확인 계획 | A | - | - |
| txr-03 | pickup | npc | Driver | Hi. Where are you heading? | B1 | 목적지 묻기 | A | - | - |
| txr-04 | pickup | option | A자리 | Could you take us to our hotel? | B1 | 목적지 이동 요청 | A | - | - |
| txr-05 | pickup | option | A자리 | Are you available for a short trip? | B1 | 차량 이용 가능 확인 | A | - | - |
| txr-06 | pickup | npc | Driver | Yes. Please show me the address. | B1 | 승차 가능과 주소 요청 | A | - | - |
| txr-07 | address | wait | A자리 | Here is the address on my phone. | B1 | 목적지 주소 제시 | A | - | - |
| txr-08 | fare | npc | Driver | I know that hotel. It should be about twenty dollars. | B1 | 목적지 확인과 예상 요금 | B | 기사가 호텔을 알고 있다는 설정과 예상 20달러는 가상 장면 값이다. 실제 노선별 요금은 확인하지 않았다. | - |
| txr-09 | fare | option | A자리 | Does that include any extra charges? | B1 | 추가 요금 확인 | A | - | - |
| txr-10 | fare | option | A자리 | How long should the ride take? | B1 | 소요 시간 묻기 | A | - | - |
| txr-11 | fare | npc | Driver | There are no extra charges for this trip. | B1 | 추가 요금 없음 안내 | B | 추가 요금이 없다는 조건은 이 가상 운행에만 해당한다. 실제 운임표나 할증 규정은 검증하지 않았다. | - |
| txr-12 | fare | npc | Driver | About fifteen minutes, if traffic is light. | B1 | 조건부 소요 시간 안내 | B | 15분은 가상 장면의 예상이며 교통 상황에 따른 표현이다. 실제 도로와 운행 시간을 확인하지 않았다. | - |
| txr-13 | bags | npc | Driver | Do you have any bags? | B1 | 짐 확인 | A | - | - |
| txr-14 | bags | option | B자리 | Could you put this bag in the trunk? | B1 | 짐 보관 도움 요청 | A | - | - |
| txr-15 | bags | option | B자리 | Can I keep my small bag with me? | B1 | 짐을 직접 지니기 요청 | A | - | - |
| txr-16 | bags | npc | Driver | Sure. I'll put it in the trunk. | B1 | 짐 보관 도움 수락 | A | - | - |
| txr-17 | bags | npc | Driver | Yes, you can keep it with you. | B1 | 짐을 지니는 요청 수락 | B | 객실에 작은 가방을 두는 허용은 장면 조건이다. 실제 차량의 공간이나 기사의 방침은 확인하지 않았다. | - |
| txr-18 | seat | npc | Driver | Please put on your seat belts. | B1 | 안전벨트 착용 요청 | A | - | - |
| txr-19 | seat | wait | 두 사람 | Okay. We're ready to go. | B1 | 출발 준비 확인 | A | - | - |
| txr-20 | music | npc | Driver | Is the music okay? | B1 | 음악 상태 확인 | A | - | - |
| txr-21 | music | option | B자리 | Could you turn it down a little? | B1 | 소리 크기 조절 요청 | A | - | - |
| txr-22 | music | option | B자리 | What kind of music is this? | B1 | 음악 정보 묻기 | A | - | - |
| txr-23 | music | npc | Driver | Sure. I'll lower the volume. | B1 | 소리 조절 요청 수락 | A | - | - |
| txr-24 | music | npc | Driver | It's guitar music. | B1 | 장면 속 음악 종류 안내 | B | 기타 음악을 듣고 있다는 가상 장면 설정이다. 실제 방송국이나 하와이 음악 장르를 설명하는 말은 아니다. | - |
| txr-25 | stop | wait | A자리 | Is it okay to stop near the main entrance? | B1 | 하차 위치 요청 | A | - | - |
| txr-26 | stop | npc | Driver | Yes. I'll stop where it's safe. | B1 | 안전한 정차 위치 확인 | B | 정문 근처의 정확한 정차 위치와 가능 여부는 가상 장면에서 정한 것으로 실제 호텔의 승하차 규정을 확인하지 않았다. | - |
| txr-27 | arrival | npc | Driver | We're here. Please wait until I stop. | B1 | 도착과 정차 전 대기 안내 | A | - | - |
| txr-28 | arrival | wait | B자리 | Okay. We'll wait until you stop. | B1 | 정차까지 기다리기 확인 | A | - | - |
| txr-29 | payment | npc | Driver | That comes to twenty dollars. | B1 | 최종 장면 요금 안내 | B | 최종 20달러는 장면용 요금이다. 실제 미터 요금이나 사전 견적과의 관계를 검증하지 않았다. | - |
| txr-30 | payment | option | A자리 | I'll pay by card. | B1 | 카드 결제 선택 | A | - | - |
| txr-31 | payment | option | A자리 | Could I get a receipt? | B1 | 영수증 요청 | A | - | - |
| txr-32 | payment | npc | Driver | Of course. I'll give you one. | B1 | 영수증 제공 약속 | A | - | - |
| txr-33 | card | wait | A자리 | Here is my card. | B1 | 결제 수단 제시 | A | - | - |
| txr-34 | receipt | npc | Driver | Here is your receipt. Have a good day! | B1 | 영수증 전달과 작별 | A | - | - |
| txr-35 | finish | npc | Driver | Please check that you have all your things. | B1 | 소지품 확인 요청 | A | - | - |
| txr-36 | finish | wait | B자리 | We've got everything. Thanks for the ride. | B1 | 소지품 확인과 감사 | A | - | - |

### 연습할 말 (이 나들이의 연습 12개)

나들이 안에서만 쓰는 본보기다. 아래 영어는 가리키는 원문 줄과 같고, 한국어 풀이는 이후 공개이므로 넣지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| txr-p1 | Let's ask about the fare before we get in. | 탑승 전 확인 계획 | txr-02 | - |
| txr-p2 | Could you take us to our hotel? | 목적지 이동 요청 | txr-04 | - |
| txr-p3 | Are you available for a short trip? | 차량 이용 가능 확인 | txr-05 | - |
| txr-p4 | Here is the address on my phone. | 목적지 주소 제시 | txr-07 | - |
| txr-p5 | Does that include any extra charges? | 추가 요금 확인 | txr-09 | - |
| txr-p6 | How long should the ride take? | 소요 시간 묻기 | txr-10 | - |
| txr-p7 | Could you put this bag in the trunk? | 짐 보관 도움 요청 | txr-14 | - |
| txr-p8 | Can I keep my small bag with me? | 짐을 직접 지니기 요청 | txr-15 | - |
| txr-p9 | Could you turn it down a little? | 소리 크기 조절 요청 | txr-21 | - |
| txr-p10 | What kind of music is this? | 음악 정보 묻기 | txr-22 | - |
| txr-p11 | Is it okay to stop near the main entrance? | 하차 위치 요청 | txr-25 | - |
| txr-p12 | Could I get a receipt? | 영수증 요청 | txr-31 | - |

### 미니게임 차례

요금 포함 범위와 시간 질문은 각각 답을 듣고 짐 확인으로 이어진다. 음악 갈래와 짐 갈래는 다음 차례의 조건을 바꾸지 않는다. 어느 결제 선택을 하든 별도 차례에서 카드를 제시해 결제를 마치며, 영수증은 그 뒤 이음 차례에서 받는다.

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | plan | - | txr-01 | A |
| t2 | plan | - | txr-02 | B |
| t3 | pickup | txr-03 | txr-04/txr-05 | A |
| t4 | address | - | txr-07 | A |
| t5 | fare | txr-08 | txr-09/txr-10 | A |
| t6 | bags | txr-13 | txr-14/txr-15 | B |
| t7 | seat | txr-18 | txr-19 | 둘 중 누구든 |
| t8 | music | txr-20 | txr-21/txr-22 | B |
| t9 | stop | - | txr-25 | A |
| n1 | stop | txr-26 | - | - |
| t10 | arrival | txr-27 | txr-28 | B |
| t11 | payment | txr-29 | txr-30/txr-31 | A |
| t12 | card | - | txr-33 | A |
| n2 | receipt | txr-34 | - | - |
| t13 | finish | txr-35 | txr-36 | B |

## 나들이: library_card

작성자: codex (2026-10-11)
장소: -
세션: 125
목표 등급: B1
할 일: cd-lbc-1 / I can ask for a library card and check how to borrow and return a book. / 도서관 카드를 요청하고 책의 대출과 반납 방법을 확인할 수 있다.
허용 이름: -
갈래: lbc-03 > lbc-04, lbc-07 > lbc-08, lbc-11 > lbc-12, lbc-15 > lbc-16, lbc-19 > lbc-20, lbc-23 > lbc-24, lbc-26 > lbc-28, lbc-31 > lbc-32, lbc-34 > lbc-36, lbc-35 > lbc-36, lbc-39 > lbc-40

상황: 제안 장소는 new:neighborhood_library이다. 이 가상 도서관에서 A의 카드 하나를 만들고 두 사람이 함께 책 한 권을 고른다. A는 사진 신분증과 A의 주소가 적힌 편지를 가지고 왔으며, 이름과 주소 확인은 A가 맡는다. 사진 신분증과 주소가 적힌 편지를 받는 설정, 대출 기간 두 주, 같은 데스크에 반납하는 설정은 모두 연습용 장면 값이다. 실제 도서관의 신분증 요건이나 기간을 안내하지 않는다. 책을 먼저 살펴보는 갈래 뒤에는 기간을 듣고 t8에서 대출을 확정한다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| lbc-01 | welcome | npc | Clerk | What can I help you with today? | A2 | 용건 묻기 | A | - | - |
| lbc-02 | welcome | option | A자리 | I'd like to get a library card. | A2 | 카드 발급 요청 | A | - | - |
| lbc-03 | welcome | option | A자리 | What do I need for a library card? | A2 | 필요 서류 질문 | A | - | - |
| lbc-04 | welcome | npc | Clerk | Please bring photo ID and something with your address. | B1 | 필요 서류 안내 | B | 주소 확인 서류를 넓게 가리키는 표현의 명확성과 화용을 확인해야 한다 | - |
| lbc-05 | form | npc | Clerk | Let's start with your name. | A2 | 이름 요청 | A | - | - |
| lbc-06 | form | option | A자리 | My name is {A}. | A1 | 이름 말하기 | A | - | - |
| lbc-07 | form | option | A자리 | Could you help me with this form? | A2 | 작성 도움 요청 | A | - | - |
| lbc-08 | form | npc | Clerk | Of course. We can fill it out together. | A2 | 작성 도움 수락 | A | - | - |
| lbc-09 | address | npc | Clerk | Do you have anything with your address on it? | A2 | 주소 서류 확인 | A | - | - |
| lbc-10 | address | option | A자리 | Yes. Here's a letter with my address. | A2 | 서류 제시 | A | - | - |
| lbc-11 | address | option | A자리 | Does this letter show what you need? | A2 | 서류 적합성 확인 | A | - | - |
| lbc-12 | address | npc | Clerk | Yes. I can use that. | A2 | 서류 확인 답변 | B | 서류 수락 상황에서 이 짧은 답변의 명확성을 사람에게 확인해야 한다 | - |
| lbc-13 | books | npc | Clerk | Your card is ready. Would you like to borrow a book? | B1 | 발급 안내와 대출 제안 | A | - | - |
| lbc-14 | books | option | A자리 | Yes. I'd like an easy book to read. | A2 | 쉬운 책 요청 | A | - | - |
| lbc-15 | books | option | A자리 | Could you show me where the books are? | A2 | 책 위치 질문 | A | - | - |
| lbc-16 | books | npc | Clerk | The books are on those shelves. | A2 | 책 위치 안내 | A | - | - |
| lbc-17 | topic | npc | Clerk | What kind of book are you looking for? | A2 | 책 주제 묻기 | A | - | - |
| lbc-18 | topic | option | B자리 | A book about cooking, please. | A2 | 책 주제 선택 | A | - | - |
| lbc-19 | topic | option | B자리 | Could you suggest something easy? | A2 | 쉬운 책 추천 요청 | B | 도서 추천 요청의 공손한 정도와 난이도는 사람 검수가 필요하다 | - |
| lbc-20 | topic | npc | Clerk | Let's look at these books together. | A2 | 함께 고르기 제안 | A | - | - |
| lbc-21 | look | npc | Clerk | Would you like this book? | A2 | 책 선택 묻기 | A | - | - |
| lbc-22 | look | option | A자리 | Yes. I'd like to borrow it. | A2 | 책 선택 의사 | A | - | - |
| lbc-23 | look | option | A자리 | May I look inside first? | A2 | 책 먼저 살펴보기 요청 | A | - | - |
| lbc-24 | look | npc | Clerk | Sure. Take your time. | A2 | 살펴보기 수락 | A | - | - |
| lbc-25 | period | npc | Clerk | You can keep a book for two weeks. | A2 | 대출 기간 안내 | A | - | - |
| lbc-26 | period | option | B자리 | When would I need to bring it back? | B1 | 반납 시점 질문 | A | - | - |
| lbc-27 | period | option | B자리 | Two weeks. Okay. | A2 | 기간 이해 확인 | A | - | - |
| lbc-28 | period | npc | Clerk | Two weeks from today. | A2 | 반납 시점 답변 | A | - | - |
| lbc-29 | borrow | npc | Clerk | Would you like to take this book home? | A2 | 최종 대출 의사 확인 | A | - | - |
| lbc-30 | borrow | option | A자리 | Yes, please. | A1 | 대출 확정 | A | - | - |
| lbc-31 | borrow | option | A자리 | Can I borrow this one with my card? | A2 | 카드 사용 확인 | A | - | - |
| lbc-32 | borrow | npc | Clerk | Yes. I'll check it out for you. | B1 | 카드 대출 처리 | B | 도서관 대출의 check it out은 구동사이므로 난이도와 장면별 화용 확인이 필요하다 | - |
| lbc-33 | return | npc | Clerk | Here is your book. | A1 | 책 건네기 | A | - | - |
| lbc-34 | return | option | B자리 | Where do I return it? | A2 | 반납 장소 질문 | A | - | - |
| lbc-35 | return | option | B자리 | Thank you. I'll bring it back here. | A2 | 반납 계획 제안 | A | - | - |
| lbc-36 | return | npc | Clerk | You can bring it back to this desk. | A2 | 반납 장소 안내 | A | - | - |
| lbc-37 | finish | npc | Clerk | Is there anything else you need? | A2 | 추가 필요 묻기 | A | - | - |
| lbc-38 | finish | option | B자리 | No. That's everything. Thank you. | A2 | 마무리 감사 | A | - | - |
| lbc-39 | finish | option | B자리 | Could you write down the return date? | B1 | 반납 날짜 기록 요청 | A | - | - |
| lbc-40 | finish | npc | Clerk | Of course. Here it is. | A1 | 기록 건네기 | A | - | - |

### 연습할 말

기준서 8.1의 카드 총량에 세지 않고 이 미션 안에서 연습한다. 모든 연습 말은 본문 줄을 그대로 가리킨다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| lbc-p1 | I'd like to get a library card. | 카드 발급 요청 | lbc-02 | - |
| lbc-p2 | What do I need for a library card? | 필요 서류 질문 | lbc-03 | - |
| lbc-p3 | Could you help me with this form? | 작성 도움 요청 | lbc-07 | - |
| lbc-p4 | Yes. Here's a letter with my address. | 서류 제시 | lbc-10 | - |
| lbc-p5 | Yes. I'd like an easy book to read. | 쉬운 책 요청 | lbc-14 | - |
| lbc-p6 | Could you suggest something easy? | 쉬운 책 추천 요청 | lbc-19 | - |
| lbc-p7 | May I look inside first? | 책 먼저 살펴보기 요청 | lbc-23 | - |
| lbc-p8 | When would I need to bring it back? | 반납 시점 질문 | lbc-26 | - |
| lbc-p9 | Can I borrow this one with my card? | 카드 사용 확인 | lbc-31 | - |
| lbc-p10 | Where do I return it? | 반납 장소 질문 | lbc-34 | - |
| lbc-p11 | Could you write down the return date? | 반납 날짜 기록 요청 | lbc-39 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | welcome | lbc-01 | lbc-02/lbc-03 | A |
| t2 | form | lbc-05 | lbc-06/lbc-07 | A |
| t3 | address | lbc-09 | lbc-10/lbc-11 | A |
| t4 | books | lbc-13 | lbc-14/lbc-15 | A |
| t5 | topic | lbc-17 | lbc-18/lbc-19 | B |
| t6 | look | lbc-21 | lbc-22/lbc-23 | A |
| t7 | period | lbc-25 | lbc-26/lbc-27 | B |
| t8 | borrow | lbc-29 | lbc-30/lbc-31 | A |
| t9 | return | lbc-33 | lbc-34/lbc-35 | B |
| t10 | finish | lbc-37 | lbc-38/lbc-39 | B |

## 나들이: clinic_visit

작성자: codex (2026-10-11)
장소: -
세션: 131
목표 등급: B1
할 일: cd-clv-1 / I can describe a symptom and ask staff to explain the next steps. / 증상을 설명하고 직원에게 다음 절차를 이해하도록 설명해 달라고 할 수 있다.
허용 이름: -
갈래: clv-03 > clv-04, clv-07 > clv-08, clv-11 > clv-12, clv-15 > clv-16, clv-19 > clv-20, clv-26 > clv-27, clv-30 > clv-31, clv-33 > clv-35, clv-34 > clv-35, clv-37 > clv-39

상황: 제안 장소는 new:clinic이다. 목이 아픈 A와 동행한 B가 가상 진료소의 접수와 문진을 연습한다. 증상 시작 시점, 당일 방문 수락, 동반 허용, 대기 위치, 진찰 및 안내서 제공은 모두 연습용 장면 값이다. 증상과 복용 목록은 선택에 따라 달라지며 병명, 약 이름, 복용량이나 치료 지시를 정하지 않는다. 마지막의 안내서는 가상 장면 속 자료이며 실제 연락처가 없다. 이 대화는 실제 진단이나 진료 절차 안내를 대신하지 않는다. B는 A와 함께 왔다고 접수에서 먼저 알린다(clv-40). 다음 절차를 설명하는 단계에서는 B가 A를 대신해 직원에게 적어 달라고 하거나 천천히 설명해 달라고 부탁한다. 이때 가상 안내서가 화면에 보이고 직원이 그것을 짚어 가며 함께 훑는 것이 설명이다. 병명, 약, 복용, 치료 지시는 말하지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| clv-01 | desk | npc | Clerk | Hi. How can I help you? | A1 | 접수 용건 묻기 | A | - | - |
| clv-02 | desk | option | A자리 | I'd like to see a doctor. | A2 | 진료 요청 | A | - | - |
| clv-03 | desk | option | A자리 | Do I need an appointment? | A2 | 예약 필요 질문 | A | - | - |
| clv-04 | desk | npc | Clerk | We can see you today. | A1 | 당일 접수 안내 | A | - | - |
| clv-05 | name | npc | Clerk | What is your name? | A1 | 이름 묻기 | A | - | - |
| clv-06 | name | option | A자리 | My name is {A}. | A1 | 이름 말하기 | A | - | - |
| clv-07 | name | option | A자리 | Could you help me fill out this form? | A2 | 서식 작성 도움 요청 | A | - | - |
| clv-08 | name | npc | Clerk | Of course. Let's do it together. | A1 | 작성 도움 수락 | A | - | - |
| clv-09 | wait | npc | Clerk | Please wait here. The nurse will call you. | A2 | 대기 안내 | A | - | - |
| clv-10 | wait | option | B자리 | Okay. I'll wait here. | A1 | 대기 수락 | A | - | - |
| clv-11 | wait | option | B자리 | Where is the bathroom? | A1 | 화장실 위치 질문 | A | - | - |
| clv-12 | wait | npc | Clerk | It's next to the waiting room. | A2 | 화장실 위치 안내 | A | - | - |
| clv-13 | symptom | npc | Nurse | What brings you in today? | B1 | 방문 이유 묻기 | B | 진료실 방문 이유를 묻는 관용 표현의 난이도와 실제 쓰임은 사람 확인이 필요하다 | - |
| clv-14 | symptom | option | A자리 | My throat hurts. | A2 | 증상 설명 | A | - | - |
| clv-15 | symptom | option | A자리 | My throat hurts. Could my partner stay? | B1 | 증상 설명과 동반 요청 | A | - | - |
| clv-16 | symptom | npc | Nurse | Yes. Your partner can stay. | B1 | 동반 요청 수락 | A | - | - |
| clv-17 | duration | npc | Nurse | How long has your throat been sore? | B1 | 증상 기간 묻기 | A | - | - |
| clv-18 | duration | option | A자리 | Since yesterday. | A2 | 기간 답변 | A | - | - |
| clv-19 | duration | option | A자리 | It started yesterday. Is that what you mean? | B1 | 기간 답변과 뜻 확인 | B | 질문 뜻을 되확인하는 답변의 자연스러움과 난이도는 사람 검수가 필요하다 | - |
| clv-20 | duration | npc | Nurse | Yes. That tells me when it started. | B1 | 답변 뜻 확인 | A | - | - |
| clv-21 | cough | npc | Nurse | Do you have a cough? | B1 | 다른 증상 묻기 | A | - | - |
| clv-22 | cough | option | A자리 | Yes. I've been coughing too. | B1 | 기침 여부 말하기 | A | - | - |
| clv-23 | cough | option | A자리 | No. Just the sore throat. | B1 | 기침 여부 말하기 | A | - | - |
| clv-24 | medicine | npc | Nurse | Do you take any medicine? | A2 | 복용 여부 묻기 | A | - | - |
| clv-25 | medicine | option | A자리 | No. I don't take any medicine. | A2 | 복용 여부 답변 | A | - | - |
| clv-26 | medicine | option | A자리 | Can I show you a list? | A2 | 목록 제시 요청 | A | - | - |
| clv-27 | medicine | npc | Nurse | Yes. Please show me your list. | A2 | 목록 제시 수락 | A | - | - |
| clv-28 | exam | npc | Doctor | Please sit here. I'll check your throat. | A2 | 진찰 전 안내 | A | - | - |
| clv-29 | exam | option | A자리 | Okay. I'm ready. | A1 | 진찰 준비 답변 | A | - | - |
| clv-30 | exam | option | A자리 | Could you tell me what you'll do first? | B1 | 진찰 절차 설명 요청 | A | - | - |
| clv-31 | exam | npc | Doctor | I'll look at your throat. | A2 | 진찰 내용 설명 | A | - | - |
| clv-32 | steps | npc | Nurse | Let me explain the next steps. | B1 | 후속 안내 시작 | A | - | - |
| clv-33 | steps | option | B자리 | Could you write them down for me? | A2 | 안내 기록 요청 | A | - | - |
| clv-34 | steps | option | B자리 | Please explain them slowly. | A2 | 안내 속도 조절 요청 | A | - | - |
| clv-35 | steps | npc | Nurse | Of course. We'll go through them together. | B1 | 안내 도움 수락 | B | go through로 설명을 함께 살피는 구의 난이도와 화용을 확인해야 한다 | - |
| clv-36 | finish | npc | Clerk | Here is the information from your visit. | A2 | 방문 안내서 건네기 | A | - | - |
| clv-37 | finish | option | B자리 | Who should I call with questions? | B1 | 연락 대상 질문 | A | - | - |
| clv-38 | finish | option | B자리 | Thank you. I'll read this at home. | A2 | 받은 정보 확인과 감사 | A | - | - |
| clv-39 | finish | npc | Clerk | You can call the number on this page. | A2 | 연락 번호 안내 | A | - | - |
| clv-40 | desk | wait | B자리 | I'm here with {A}. | A2 | 동행 관계 알리기 | A | - | - |

### 연습할 말

기준서 8.1의 카드 총량에 세지 않고 이 미션 안에서 연습한다. 모든 연습 말은 본문 줄을 그대로 가리킨다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| clv-p1 | I'd like to see a doctor. | 진료 요청 | clv-02 | - |
| clv-p2 | Do I need an appointment? | 예약 필요 질문 | clv-03 | - |
| clv-p3 | Could you help me fill out this form? | 서식 작성 도움 요청 | clv-07 | - |
| clv-p4 | Where is the bathroom? | 화장실 위치 질문 | clv-11 | - |
| clv-p5 | My throat hurts. | 증상 설명 | clv-14 | - |
| clv-p6 | My throat hurts. Could my partner stay? | 증상 설명과 동반 요청 | clv-15 | - |
| clv-p7 | Since yesterday. | 기간 답변 | clv-18 | - |
| clv-p8 | It started yesterday. Is that what you mean? | 기간 답변과 뜻 확인 | clv-19 | - |
| clv-p9 | Yes. I've been coughing too. | 기침 여부 말하기 | clv-22 | - |
| clv-p10 | Can I show you a list? | 목록 제시 요청 | clv-26 | - |
| clv-p11 | Could you tell me what you'll do first? | 진찰 절차 설명 요청 | clv-30 | - |
| clv-p12 | Could you write them down for me? | 안내 기록 요청 | clv-33 | - |
| clv-p13 | Please explain them slowly. | 안내 속도 조절 요청 | clv-34 | - |
| clv-p14 | Who should I call with questions? | 연락 대상 질문 | clv-37 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t0 | desk | - | clv-40 | B |
| t1 | desk | clv-01 | clv-02/clv-03 | A |
| t2 | name | clv-05 | clv-06/clv-07 | A |
| t3 | wait | clv-09 | clv-10/clv-11 | B |
| t4 | symptom | clv-13 | clv-14/clv-15 | A |
| t5 | duration | clv-17 | clv-18/clv-19 | A |
| t6 | cough | clv-21 | clv-22/clv-23 | A |
| t7 | medicine | clv-24 | clv-25/clv-26 | A |
| t8 | exam | clv-28 | clv-29/clv-30 | A |
| t9 | steps | clv-32 | clv-33/clv-34 | B |
| t10 | finish | clv-36 | clv-37/clv-38 | B |

## 나들이: ala_moana_returns

작성자: codex (2026-10-11)
장소: ala_moana_center
세션: 137
목표 등급: B1
할 일: cd-amr-1 / I can explain a return, ask about an exchange, and check a refund. / 반품 이유를 설명하고 교환과 환불 처리 방법을 확인할 수 있다.
허용 이름: -
갈래: amr-03 > amr-31, amr-06 > amr-32, amr-09 > amr-33, amr-12 > amr-34, amr-18 > amr-35, amr-21 > amr-36, amr-23 > amr-37, amr-24 > amr-38, amr-27 > amr-39, amr-30 > amr-40

상황: 알라모아나의 가상 옷가게에 두 사람이 재킷 하나와 원본 영수증, 결제했던 카드를 가져왔다. A가 B에게 사 준 재킷은 B에게 너무 작고 같은 제품의 다른 크기는 이 장면에 없다. 이 가게에서 원본 영수증을 요구하는 것, 환불 방법, 카드 끝 번호, 영업일 사흘이라는 처리 기간은 모두 가상 장면 값이다. 실제 알라모아나 상점의 반품 규정이나 카드 처리 기간을 안내하지 않는다. A는 구매자이고 B는 함께 와서 이유를 설명하며 카드 넣기를 돕는다. 두 자리의 모든 답은 같은 재킷의 반품과 카드 환불로 이어진다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| amr-01 | desk | npc | Clerk | Hi. How can I help you? | B1 | 용건 묻기 | A | - | - |
| amr-02 | desk | option | A자리 | I would like to return this jacket. | B1 | 반품 요청 | A | - | - |
| amr-03 | desk | option | A자리 | Is this the returns desk? | B1 | 담당 창구 확인 | B | 미국 옷가게에서 returns desk라는 창구 이름을 실제로 쓰는 범위는 확인하지 않았다 | - |
| amr-04 | reason | npc | Clerk | What is the problem with it? | B1 | 반품 이유 묻기 | A | - | - |
| amr-05 | reason | option | B자리 | It is too small for me. | B1 | 이유 설명 | A | - | - |
| amr-06 | reason | option | B자리 | Could you check the size on the label? | B1 | 크기 확인 부탁 | A | - | - |
| amr-07 | receipt | npc | Clerk | Do you have the original receipt? | B1 | 원본 영수증 요청 | A | - | - |
| amr-08 | receipt | option | A자리 | Here is the original receipt. | B1 | 영수증 내기 | A | - | - |
| amr-09 | receipt | option | A자리 | Do you need it for the return? | B1 | 필요 조건 확인 | A | - | - |
| amr-10 | exchange | npc | Clerk | I can offer a refund, but not an exchange. | B1 | 환불 제안과 교환 거절 | B | 교환을 거절하며 환불을 제안하는 직원의 실제 말투는 사람의 검증이 필요하다 | - |
| amr-11 | exchange | option | B자리 | A refund would be fine. | B1 | 제안 수락 | A | - | - |
| amr-12 | exchange | option | B자리 | Could you explain why I cannot exchange it? | B1 | 거절 이유 묻기 | A | - | - |
| amr-13 | method | npc | Clerk | The refund goes back on your card. | B1 | 환불 방법 설명 | B | goes back on your card라는 환불 설명의 지역별 실제 쓰임은 확인하지 않았다 | - |
| amr-14 | method | option | A자리 | I paid with this card. | B1 | 결제 수단 밝히기 | A | - | - |
| amr-15 | method | option | A자리 | Do you need the card I used? | B1 | 필요한 카드 확인 | A | - | - |
| amr-16 | reader | npc | Clerk | Please insert the card you paid with. | B1 | 카드 넣기 안내 | B | 환불에 카드를 넣는 절차는 가상 기계의 조건이며 실제 상점 절차는 확인하지 않았다 | - |
| amr-17 | reader | option | B자리 | I have it right here. | B1 | 준비 상태 알리기 | A | - | - |
| amr-18 | reader | option | B자리 | Could you show me where to put it? | B1 | 사용 위치 묻기 | A | - | - |
| amr-19 | card | npc | Clerk | Is the card ending in four six eight two yours? | B1 | 카드 소유 확인 | B | 카드 끝 번호를 하나씩 읽는 이 확인 문구의 실제 직원 말투는 확인하지 않았다 | - |
| amr-20 | card | option | A자리 | Yes, that is my card. | B1 | 소유 확인 | A | - | - |
| amr-21 | card | option | A자리 | Yes, that's my card. Could you repeat those numbers? | B1 | 번호 다시 듣기 | A | - | - |
| amr-22 | timing | npc | Clerk | The refund may take three business days. | B1 | 처리 시간 안내 | B | business days를 쓰는 환불 안내의 자연스러움과 난이도는 검증 전이다 | - |
| amr-23 | timing | option | B자리 | Could you write that down? | B1 | 기록 부탁 | A | - | - |
| amr-24 | timing | option | B자리 | What should I do if it takes longer? | B1 | 지연 때 대처 묻기 | A | - | - |
| amr-25 | paper | npc | Clerk | Here is a receipt for your return. | B1 | 반품 영수증 내기 | B | receipt for your return이라는 영수증 구분 표현의 실제 빈도는 확인하지 않았다 | - |
| amr-26 | paper | option | A자리 | Thank you. I will keep it. | B1 | 감사와 보관 알리기 | A | - | - |
| amr-27 | paper | option | A자리 | Can I keep the original receipt too? | B1 | 원본 보관 허락 묻기 | A | - | - |
| amr-28 | finish | npc | Clerk | Is there anything else I can help you with? | B1 | 남은 용건 묻기 | A | - | - |
| amr-29 | finish | option | B자리 | No, that is all for today. | B1 | 대화 끝내기 | A | - | - |
| amr-30 | finish | option | B자리 | Where can I find the customer service number? | B1 | 연락처 위치 묻기 | A | - | - |
| amr-31 | desk | npc | Clerk | Yes. I can help with that jacket. | B1 | 담당 확인 | A | - | - |
| amr-32 | reason | npc | Clerk | The label says small. | B1 | 표시된 크기 설명 | A | - | - |
| amr-33 | receipt | npc | Clerk | Yes. I need it to look up your purchase. | B1 | 필요 이유 설명 | B | look up your purchase라는 매장 직원의 거래 조회 표현은 사람의 검증이 필요하다 | - |
| amr-34 | exchange | npc | Clerk | We do not have another size in this style. | B1 | 교환 불가 이유 설명 | A | - | - |
| amr-35 | reader | npc | Clerk | The card reader is on your right. | B1 | 기계 위치 안내 | A | - | - |
| amr-36 | card | npc | Clerk | Four, six, eight, two. | B1 | 카드 번호 반복 | A | - | - |
| amr-37 | timing | npc | Clerk | I'll write how long it may take on your receipt. | B1 | 기록 약속 | A | - | - |
| amr-38 | timing | npc | Clerk | Call the number on your receipt if you need help. | B1 | 연락 방법 안내 | A | - | - |
| amr-39 | paper | npc | Clerk | Yes, you can keep both receipts. | B1 | 원본 보관 허락 | A | - | - |
| amr-40 | finish | npc | Clerk | It is printed on your receipt. | B1 | 연락처 안내 | A | - | - |

### 연습할 말

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| amr-p1 | I would like to return this jacket. | 반품 요청 | amr-02 | - |
| amr-p2 | It is too small for me. | 이유 설명 | amr-05 | - |
| amr-p3 | Here is the original receipt. | 영수증 내기 | amr-08 | - |
| amr-p4 | Could you explain why I cannot exchange it? | 거절 이유 묻기 | amr-12 | - |
| amr-p5 | I paid with this card. | 결제 수단 밝히기 | amr-14 | - |
| amr-p6 | Could you show me where to put it? | 사용 위치 묻기 | amr-18 | - |
| amr-p7 | Yes, that's my card. Could you repeat those numbers? | 번호 다시 듣기 | amr-21 | - |
| amr-p8 | Could you write that down? | 기록 부탁 | amr-23 | - |
| amr-p9 | What should I do if it takes longer? | 지연 때 대처 묻기 | amr-24 | - |
| amr-p10 | Can I keep the original receipt too? | 원본 보관 허락 묻기 | amr-27 | - |
| amr-p11 | Where can I find the customer service number? | 연락처 위치 묻기 | amr-30 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | desk | amr-01 | amr-02/amr-03 | A |
| t2 | reason | amr-04 | amr-05/amr-06 | B |
| t3 | receipt | amr-07 | amr-08/amr-09 | A |
| t4 | exchange | amr-10 | amr-11/amr-12 | B |
| t5 | method | amr-13 | amr-14/amr-15 | A |
| t6 | reader | amr-16 | amr-17/amr-18 | B |
| t7 | card | amr-19 | amr-20/amr-21 | A |
| t8 | timing | amr-22 | amr-23/amr-24 | B |
| t9 | paper | amr-25 | amr-26/amr-27 | A |
| t10 | finish | amr-28 | amr-29/amr-30 | B |

## 나들이: phone_and_laundry

작성자: codex (2026-10-11)
장소: -
세션: 167
목표 등급: B1
할 일: cd-pnl-1 / I can ask how to use laundry machines and call about my phone bill. / 세탁소 기계 쓰는 법을 묻고 전화로 휴대폰 요금 명세를 확인할 수 있다.
허용 이름: -
갈래: pnl-04 > pnl-30, pnl-05 > pnl-31, pnl-07 > pnl-32, pnl-10 > pnl-33, pnl-11 > pnl-34, pnl-13 > pnl-35, pnl-21 > pnl-36, pnl-22 > pnl-37, pnl-24 > pnl-38, pnl-28 > pnl-39

상황: 제안 장소는 new:laundromat이며 현재 장소 목록에 없는 뒤 공개 미션이라 메타 장소는 '-'다. 먼저 세탁소 직원에게 기계 사용법을 묻는다(t1~t5). 이후 세탁을 기다리며 가상 통신사 요금 문의 번호에 스피커폰으로 전화한다(t6~t10). 두 사람은 함께 사용하는 요금제의 같은 명세서를 보며 번갈아 묻는다. phone_call 장면의 Clerk는 세탁소 직원과 다른 통신사 상담 직원이다. 세탁소 직원에게 휴대폰 요금이나 요금제를 묻지 않는다. 세탁기 세제 서랍 위치, 카드 결제 방식, 세탁 4달러와 건조 2달러, 국제전화 추가 요금 5달러와 통화 포함 범위는 모두 가상 장면 값이다. 실제 기계 모델의 사용 지침이나 실제 통신사의 요금제가 아니다. 두 사람은 명세서의 국제전화 한 건을 확인하며, 요금이 부당했다고 단정하지 않는다. 실제 번호·개인정보는 쓰지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| pnl-01 | laundry_intro | npc | Clerk | Let me show you how to use this washer. | B1 | 기계 사용 안내 시작 | A | - | - |
| pnl-02 | laundry_intro | wait | A자리 | Could you show me where the detergent goes? | B1 | 세제 넣는 곳 묻기 | A | - | - |
| pnl-03 | detergent | npc | Clerk | Put it in this small drawer. | B1 | 세제 위치 안내 | B | 세제 서랍을 가리키는 안내의 실제 자연스러움은 기계 장면과 함께 확인해야 한다 | - |
| pnl-04 | detergent | option | B자리 | How much should I use? | B1 | 세제 양 묻기 | A | - | - |
| pnl-05 | detergent | option | B자리 | Could you show me which drawer you mean? | B1 | 가리킨 곳 확인 부탁 | A | - | - |
| pnl-06 | setting | npc | Clerk | Close the door and choose the wash setting. | B1 | 작동 준비 안내 | B | wash setting이라는 기계 안내 표현과 지시 순서는 가상 모델 기준이며 검증이 필요하다 | - |
| pnl-07 | setting | option | A자리 | Which setting is best for these clothes? | B1 | 설정 추천 묻기 | A | - | - |
| pnl-08 | setting | option | A자리 | I will check the labels first. | B1 | 확인 전 유보 | A | - | - |
| pnl-09 | laundry_cost | npc | Clerk | The wash costs four dollars. You can pay with a card. | B1 | 세탁 요금과 결제 안내 | B | wash를 세탁 한 회 요금에 쓰는 구어 표현의 실제 빈도는 확인하지 않았다 | - |
| pnl-10 | laundry_cost | option | B자리 | Does that include drying? | B1 | 포함 요금 확인 | A | - | - |
| pnl-11 | laundry_cost | option | B자리 | Can I pay here? | B1 | 결제 위치 묻기 | A | - | - |
| pnl-12 | dryer | npc | Clerk | When the wash ends, move the clothes to the dryer. | B1 | 다음 단계 안내 | B | 실제 옷감별 사용 지침이 아니라 가상 기계의 절차 설명이며 문구 검증이 필요하다 | - |
| pnl-13 | dryer | option | A자리 | Which heat setting should I use? | B1 | 건조 설정 묻기 | B | heat setting이라는 건조기 질문의 실제 연어와 난이도는 확인하지 않았다 | - |
| pnl-14 | dryer | option | A자리 | I will check the labels again. | B1 | 지침 확인 예고 | A | - | - |
| pnl-15 | phone_call | npc | Clerk | Thanks for calling. How can I help you? | B1 | 전화 용건 묻기 | A | - | - |
| pnl-16 | phone_call | wait | B자리 | I have a question about my phone bill. | B1 | 문의 목적 밝히기 | A | - | - |
| pnl-17 | phone_problem | npc | Clerk | Please tell me what you would like to check. | B1 | 확인할 항목 묻기 | A | - | - |
| pnl-18 | phone_problem | option | A자리 | My bill is higher than last month. | B1 | 변화 설명 | A | - | - |
| pnl-19 | phone_problem | option | A자리 | Could you explain the extra charge? | B1 | 추가 요금 설명 요청 | A | - | - |
| pnl-20 | phone_charge | npc | Clerk | There is a five-dollar charge for an international call. | B1 | 추가 요금 이유 설명 | B | 국제전화 추가 요금을 설명하는 문구의 실제 상담 말투는 확인하지 않았다 | - |
| pnl-21 | phone_charge | option | B자리 | What number was called? | B1 | 통화 내역 묻기 | A | - | - |
| pnl-22 | phone_charge | option | B자리 | Was that call included in my plan? | B1 | 요금제 포함 확인 | A | - | - |
| pnl-23 | phone_plan | npc | Clerk | I can explain the plan before your next call. | B1 | 다음 통화 전 안내 제안 | B | 전화 상담에서 이 전환 문구가 자연스러운지는 실제 화용 검증이 필요하다 | - |
| pnl-24 | phone_plan | option | A자리 | Which calls are included in my plan? | B1 | 포함 통화 범위 묻기 | A | - | - |
| pnl-25 | phone_plan | option | A자리 | Could you send me the plan details? | B1 | 자료 보내기 요청 | A | - | - |
| pnl-26 | phone_finish | npc | Clerk | I will send the plan details by text. | B1 | 자료 발송 약속 | A | - | - |
| pnl-27 | phone_finish | option | B자리 | Thank you. That answers my question. | B1 | 해결 확인과 감사 | A | - | - |
| pnl-28 | phone_finish | option | B자리 | Could you explain what the plan includes first? | B1 | 발송 전 포함 범위 설명 요청 | A | - | - |
| pnl-29 | phone_bye | npc | Clerk | Thank you for calling. Goodbye. | B1 | 전화 끝내기 | A | - | - |
| pnl-30 | detergent | npc | Clerk | Use the amount shown on the detergent bottle. | B1 | 용기 지침 확인 안내 | B | 세제 양을 용기의 지침으로 확인시키는 자연스러운 직원 말투는 검증 전이다 | - |
| pnl-31 | detergent | npc | Clerk | This one, on the left. | B1 | 세제 서랍 다시 가리키기 | A | - | - |
| pnl-32 | setting | npc | Clerk | Follow the labels on your clothes. | B1 | 옷의 지침 확인 안내 | A | - | - |
| pnl-33 | laundry_cost | npc | Clerk | No. The dryer costs two dollars. | B1 | 별도 건조 요금 설명 | A | - | - |
| pnl-34 | laundry_cost | npc | Clerk | Yes. Use the card reader on the machine. | B1 | 결제 위치 안내 | A | - | - |
| pnl-35 | dryer | npc | Clerk | Choose a heat setting that matches the labels. | B1 | 옷 지침에 맞춘 선택 안내 | A | - | - |
| pnl-36 | phone_charge | npc | Clerk | The number is listed on your bill. | B1 | 내역 확인 위치 안내 | A | - | - |
| pnl-37 | phone_charge | npc | Clerk | No. That call was not included. | B1 | 포함되지 않은 통화 확인 | A | - | - |
| pnl-38 | phone_plan | npc | Clerk | Local calls are included. International calls cost extra. | B1 | 포함 범위 설명 | B | 실제 요금제 사실이 아닌 가상 정책이며 local calls 범위의 이해 가능성을 검증해야 한다 | - |
| pnl-39 | phone_finish | npc | Clerk | Of course. Local calls are included. International calls cost extra. | B1 | 음성으로 범위 설명 | B | 실제 요금제 사실이 아닌 가상 정책이며 상담 마무리에서의 말투는 확인하지 않았다 | - |

### 연습할 말

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| pnl-p1 | Could you show me where the detergent goes? | 세제 넣는 곳 묻기 | pnl-02 | - |
| pnl-p2 | How much should I use? | 세제 양 묻기 | pnl-04 | - |
| pnl-p3 | Which setting is best for these clothes? | 설정 추천 묻기 | pnl-07 | - |
| pnl-p4 | Does that include drying? | 포함 요금 확인 | pnl-10 | - |
| pnl-p5 | Can I pay here? | 결제 위치 묻기 | pnl-11 | - |
| pnl-p6 | Which heat setting should I use? | 건조 설정 묻기 | pnl-13 | - |
| pnl-p7 | I have a question about my phone bill. | 문의 목적 밝히기 | pnl-16 | - |
| pnl-p8 | Could you explain the extra charge? | 추가 요금 설명 요청 | pnl-19 | - |
| pnl-p9 | Was that call included in my plan? | 요금제 포함 확인 | pnl-22 | - |
| pnl-p10 | Could you send me the plan details? | 자료 보내기 요청 | pnl-25 | - |
| pnl-p11 | Could you explain what the plan includes first? | 발송 전 포함 범위 설명 요청 | pnl-28 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | laundry_intro | pnl-01 | pnl-02 | A |
| t2 | detergent | pnl-03 | pnl-04/pnl-05 | B |
| t3 | setting | pnl-06 | pnl-07/pnl-08 | A |
| t4 | laundry_cost | pnl-09 | pnl-10/pnl-11 | B |
| t5 | dryer | pnl-12 | pnl-13/pnl-14 | A |
| t6 | phone_call | pnl-15 | pnl-16 | B |
| t7 | phone_problem | pnl-17 | pnl-18/pnl-19 | A |
| t8 | phone_charge | pnl-20 | pnl-21/pnl-22 | B |
| t9 | phone_plan | pnl-23 | pnl-24/pnl-25 | A |
| t10 | phone_finish | pnl-26 | pnl-27/pnl-28 | B |
| n1 | phone_bye | pnl-29 | - | - |
