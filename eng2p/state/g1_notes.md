# G1. 첫 공개 미션의 선행 어휘와 해금 제안

신뢰도: B 생성 (어휘 집계는 기존 함수의 근사이며, 해금 순서는 학습 설계 제안이다.)
검증로그: 2026-10-11 / 수정된 authored_lines.md 18개 미션 587줄과 연습 177개를 authored_lib.parse_lines, tokens, stem, heard_vocab로 다시 셈. 세션 30과 48의 청취 어간 486개가 기존 감사와 같음 / 통과 / 집계만 확인. 실제 청취와 발화 습득, 제안 순서의 효과는 검증하지 않음.
검증로그: 2026-10-11 / 해금 순서와 학습 효과에 대한 실제 2인 실행 자료 없음 / 보류 / 아래 순서는 제안으로만 기록하고 현재 해금 세션은 바꾸지 않음.

이 노트는 G1 수정본을 기준으로 한다. 현재 미션 18개의 id와 해금 세션은 그대로다. 호텔과 카페는 연습 21개씩이며, 나머지 연습을 합쳐 177개다.

## 1. 세는 기준과 한계

해금 세션이 s이면 해금 전에 들은 어간은 heard_vocab(s-1)로 센다. 기존 감사와 관문은 heard_vocab(s), 즉 해금 당일 블록 1까지 포함하므로 아래 표에 그 값도 함께 적었다. 당일 블록 1을 마치기 전에 미션을 열 수 있는지는 이 집계가 보증하지 않는다.

본문 낱말은 tokens와 stem을 그대로 쓰고, 허용 이름과 {A}, {B}를 뺀다. 생산 낱말은 실제 차례의 고르는 줄이 가리키는 후보만 센다. 연습 포함은 game.practice의 말 본보기에 그 어간이 있다는 뜻이며, 두 사람이 이미 익혔다거나 미션 실행기가 연습을 선행시켰다는 판정은 아니다.

첨부 묶음에는 media/english/transcripts 원본이 없다. 검사용 사본에서는 out/data/transcripts.json의 52과 items를 과별로 빈 줄로 이어 대본을 복원하고, 수정하지 않은 authored_lib를 호출했다. 원본의 머리말과 버려진 표는 복원하지 못했으므로 완전한 원본 재검증은 아니다. 세션 30의 486어간과 기존 미션 집계가 대조 기준이다.

카드, 강의, 앞서 한 미션의 단어를 heard_vocab에 보태지 않는다. 미션은 선택 활동이라 해금이 먼저 됐다고 두 사람이 그 미션을 했다고 가정할 수 없다. 따라서 아래 미청취 낱말은 미션 안 연습이 늘어도 자동으로 줄지 않는다.

어간은 실제 사전형과 다를 수 있다. anything은 anyth, cookies는 cooky, this는 thi처럼 처리되고 불규칙 변화도 놓친다. 낱말 하나를 들었는지와 그 낱말을 포함한 새 표현을 말할 수 있는지는 별개다.

## 2. 현재 해금 전 미청취 어간

미청취 개수는 미션마다 따로 센다. 두 미션에 같은 어간이 있으면 각 미션에서 한 번씩 센다. 해금 당일 포함은 기존 관문의 비교값이다.

| 미션 id | 현재 세션 | 해금 전 청취 어간 수 | 해금 전 미청취 수 | 당일 포함 미청취 수 | 해금 전에 안 들은 어간 |
|---|---|---|---|---|---|
| neighbor_greeting | 15 (3.3) | 167 | 8 | 8 | can, do, fine, have, name, sorry, sure, very |
| hotel_front_desk | 17 (3.5) | 220 | 29 | 29 | another, anyth, bottle, bring, card, dollar, eight, elevator, else, enjoy, five, help, just, key, many, much, name, number, of, please, pool, six, sorry, stay, sure, towel, very, water, will |
| cafe_order | 20 (4.2) | 291 | 22 | 22 | anyth, card, cookie, dollar, drink, else, hot, iced, juice, large, latte, medium, much, nine, orange, please, size, small, sorry, tea, water, will |
| convenience_store_abc | 22 (4.4) | 323 | 13 | 13 | bag, card, dollar, hat, juice, much, please, six, snack, sorry, sunscreen, towel, water |
| cookie_snack | 23 (4.5) | 323 | 15 | 14 | bag, box, card, chocolate, coconut, cooky, dollar, each, eleven, enjoy, much, please, same, six, sorry |
| shave_ice_snack | 26 (5.2) | 411 | 11 | 11 | dollar, eight, enjoy, flavor, lemon, mango, please, same, shave, strawberry, ten |
| musubi_day | 28 (5.4) | 455 | 10 | 10 | anyth, card, dollar, each, egg, else, enjoy, kind, musubi, napkin |
| waikiki_beach_chair_umbrella | 30 (5.6) | 486 | 9 | 9 | card, chair, dollar, each, spot, ten, twenty, umbrella, water |
| leonards_malasadas | 37 (7.1) | 486 | 19 | 19 | aloha, anyth, bag, box, card, careful, cinnamon, dollar, else, enough, fourteen, half, malasada, six, smell, sugar, total, twelve, twenty |
| food_truck_lunch | 39 (7.3) | 486 | 19 | 19 | card, dollar, drink, enjoy, fish, fourteen, little, lunch, number, plate, receipt, rice, salad, same, sixteen, spicy, twenty, water, would |
| honolulu_zoo_ticket | 41 (7.5) | 486 | 10 | 10 | adult, card, dollar, each, enjoy, map, ten, ticket, twenty, zoo |
| pharmacy_basic | 42 (7.6) | 486 | 13 | 13 | anyth, bag, bandage, card, dollar, eight, else, price, shampoo, soap, sunscreen, toothpaste, twelve |
| cheesecake_dessert | 43 (8.1) | 486 | 19 | 19 | cake, card, chocolate, dessert, dollar, drink, enjoy, follow, fork, lemonade, menu, milk, piece, same, sweet, table, tea, twenty, would |
| bus_fare_question | 44 (8.2) | 486 | 8 | 8 | dollar, each, fare, pay, seat, us, yet, zoo |
| ala_moana_basic_shopping | 45 (8.3) | 486 | 4 | 4 | bag, card, dollar, twenty |
| diamond_head_lookout_directions | 46 (8.4) | 486 | 6 | 6 | enjoy, lookout, map, stair, up, view |
| eggs_n_things_breakfast | 47 (8.5) | 486 | 15 | 15 | anyth, card, dollar, drink, egg, else, enjoy, juice, menu, order, pancake, toast, twenty, water, would |
| hanauma_bay_gear_rental | 48 (8.6) | 486 | 9 | 9 | card, dollar, fin, fish, mask, snorkel, stay, touch, twenty |

호텔의 미청취 수는 기존 감사의 27에서 29로 늘었다. 새 물 구매 장면이 card와 dollar를 넣었기 때문이며, 아래 표에서는 생산에 필요한 미청취 어간의 연습 밖 누락은 0이다. 쿠키는 해금 전 기준으로 15개, 당일 sorry 청취까지 포함하면 14개다.

## 3. 미션 안에서 연습하는 것과 생산 전에 연습 밖인 것

첫 열은 위 미청취 어간 중 연습 본보기에 있는 것이다. 둘째 열은 실제 차례의 발화 후보에 있으면서 해금 전 말뭉치에도, 해당 미션의 연습에도 없는 것이다. NPC가 먼저 말하는 줄을 만나는 것만으로 생산 연습을 했다고 보지 않는다. 새 지도 안내, 화장실이나 방향의 위치, 금액은 가상 대화의 장면값이며 실제 시설의 위치나 운영을 확인한 정보가 아니다.

| 미션 id | 미청취지만 해당 미션 연습에 포함된 어간 | 생산 후보에 있으나 해당 연습 밖인 미청취 어간 |
|---|---|---|
| neighbor_greeting | can, fine, have, name, sorry, very | - |
| hotel_front_desk | another, bottle, card, dollar, eight, elevator, five, just, key, much, name, of, please, pool, six, sorry, towel, very, water | - |
| cafe_order | card, cookie, dollar, hot, iced, juice, large, latte, medium, much, nine, orange, please, small, sorry, tea, water | - |
| convenience_store_abc | card, much, please, snack, sorry, water | hat, juice, sunscreen, towel |
| cookie_snack | box, chocolate, cooky, each, much, please, sorry | bag, card, coconut, same, six |
| shave_ice_snack | flavor, mango, please, same, shave | dollar, lemon, strawberry, ten |
| musubi_day | each | card, egg, musubi |
| waikiki_beach_chair_umbrella | chair, umbrella, water | card, dollar, twenty |
| leonards_malasadas | box, dollar, half, six, twenty | bag, card, cinnamon, enough, malasada, smell, sugar, twelve |
| food_truck_lunch | fish, little, plate, rice, same | card, dollar, salad, spicy, twenty, water |
| honolulu_zoo_ticket | card, map, ticket | adult |
| pharmacy_basic | card, soap, sunscreen, toothpaste | bandage, price, shampoo |
| cheesecake_dessert | dollar, fork, lemonade, piece, same, twenty | cake, card, chocolate, milk, sweet, tea |
| bus_fare_question | fare, zoo | us |
| ala_moana_basic_shopping | card | - |
| diamond_head_lookout_directions | lookout, map, stair, up | - |
| eggs_n_things_breakfast | pancake, water, would | card, egg, juice, toast |
| hanauma_bay_gear_rental | card | - |

호텔과 카페의 연습 밖 미청취 생산 어간은 각각 기존 감사의 9개에서 0개가 됐다. please가 든 부탁, How much is it?, Cash or card?, 숫자와 값, Sorry, can you say that again?을 본문 줄과 같은 말로 연습한다. 카페의 숫자는 nine, 호텔은 five, six, eight이며 이 작업이 숫자 1~20 전체를 가르쳤다는 뜻은 아니다.

0은 낱말 포함 검사 결과다. 호텔의 hf-07, hf-08, hf-09처럼 여러 자리 방 번호를 읽는 기존 후보는 여전히 B이며 그 문장 자체가 연습에 들어간 것은 아니다. 새 한 자리 번호 후보와 연습은 있지만 B 후보의 자연스러움이나 TTS 읽기는 검증하지 않았다. 다른 미션에서의 미청취 생산 어간은 남아 있으므로 선택한 후보를 말하기 전에 그 후보 본보기로 듣고 따라 말할 수 있는지 실제 게임에서 확인해야 한다.

## 4. 제안 해금 순서

현재 해금 표와 메타는 수정하지 않는다. 아래는 다음 설계 검토에서 쓸 대안이다. 표는 제안 세션 순서이며 6주인 31~36에는 새 미션을 열지 않는다. 모든 제안 세션은 첫 공개의 48 이하이고, 46은 새 해금 없이 다시 해 볼 여지다.

처음 미션을 sorry와 name의 청취 뒤로 미루고, 부하가 큰 호텔과 카페는 please의 첫 청취 뒤로 둔다. 쿠키와 편의점, 무스비에는 미션 내부 연습으로 먼저 만나는 말이 남는다. 다른 미션을 했다는 가정으로 관문을 약하게 하지 않으며, 제안 세션의 미청취 수 역시 오직 heard_vocab(제안 세션-1)로 센다.

| 제안 순서 | 미션 id | 현재 세션 | 제안 세션 | 제안 해금 전 미청취 수 | 배치 이유 |
|---|---|---|---|---|---|
| 1 | neighbor_greeting | 15 (3.3) | 24 (4.6) | 1 | 이름은 19, 되묻기의 sorry는 23에서 들은 뒤에 시작한다. |
| 2 | cookie_snack | 23 (4.5) | 25 (5.1) | 14 | 짧은 수량 주문을 먼저 한다. much의 첫 청취는 이 날이라 미션 연습을 반드시 먼저 한다. |
| 3 | convenience_store_abc | 22 (4.4) | 26 (5.2) | 10 | 쿠키에서 쓴 값 묻기와 계산을 물건 찾기에 다시 쓴다. please는 아직 미청취라 미션 안에서 연습한다. |
| 4 | musubi_day | 28 (5.4) | 27 (5.3) | 11 | 수량과 포장 틀을 다시 쓴다. please의 첫 청취가 이 날이므로 해금 전에는 미청취다. |
| 5 | cafe_order | 20 (4.2) | 28 (5.4) | 13 | please를 27에서 들은 뒤 음료와 크기, 숫자와 결제를 함께 연습한다. |
| 6 | hotel_front_desk | 17 (3.5) | 29 (5.5) | 18 | 처음 17보다 이름, 부탁, 숫자와 결제 연습을 뒤에 둔다. 이날 새 과가 있어 선택 미션으로 안내한다. |
| 7 | shave_ice_snack | 26 (5.2) | 30 (5.6) | 10 | 카페 크기 틀을 맛 고르기로 넓힌다. |
| 8 | waikiki_beach_chair_umbrella | 30 (5.6) | 37 (7.1) | 9 | 6주 다지기를 마친 뒤 부탁과 값을 여행 장면에 다시 쓴다. |
| 9 | ala_moana_basic_shopping | 45 (8.3) | 38 (7.2) | 4 | 미청취 어간이 적은 쇼핑으로 여유를 둔다. |
| 10 | leonards_malasadas | 37 (7.1) | 39 (7.3) | 19 | 쿠키와 무스비 수량, 포장에 숫자와 포장 부탁을 보탠다. |
| 11 | honolulu_zoo_ticket | 41 (7.5) | 40 (7.4) | 10 | 수량과 계산을 표 사기로 다시 쓴다. |
| 12 | food_truck_lunch | 39 (7.3) | 41 (7.5) | 19 | 카페와 빵집의 주문 틀에 옵션의 예 아니오를 보탠다. |
| 13 | pharmacy_basic | 42 (7.6) | 42 (7.6) | 13 | 물건 찾기와 값 묻기를 재사용한다. 증상이나 약효 안내는 넣지 않는다. |
| 14 | cheesecake_dessert | 43 (8.1) | 43 (8.1) | 19 | 카페 음료 주문에 디저트와 계산서 틀을 보탠다. |
| 15 | bus_fare_question | 44 (8.2) | 44 (8.2) | 8 | 동물원의 zoo와 계산 틀을 버스 요금으로 이어 쓴다. |
| 16 | diamond_head_lookout_directions | 46 (8.4) | 45 (8.3) | 6 | 동물원에서 들은 방향 확인을 전망대 길 묻기로 넓힌다. |
| 17 | eggs_n_things_breakfast | 47 (8.5) | 47 (8.5) | 15 | 46은 새 해금 없이 앞 미션을 다시 하는 여지로 남기고 식당의 여러 틀을 묶는다. |
| 18 | hanauma_bay_gear_rental | 48 (8.6) | 48 (8.6) | 9 | 예 아니오와 크기만 생산한다. 장비 이름은 듣는 말로 먼저 확인한다. |

세션 30 뒤에는 새 말뭉치 어간이 0이다. 따라서 늦추는 것만으로 card, dollar, water나 장면 전용 명사가 저절로 해결되지 않는다. 제안은 순서의 부하를 옮기는 것이며, 선행 학습을 완성하는 장치가 아니다. 실제로 적용하려면 authored_lines.md의 세션 메타와 outings.md 표를 함께 바꾸고 원래 관문과 계획 불변 검사를 다시 통과해야 한다.

## 5. 재현과 남은 확인

계산은 검사 사본 study를 기준으로 Python 3에서 authored_lib를 가져와 했다. 식은 다음과 같다.

```python
미청취 = 본문_어간 - heard_vocab(현재_세션 - 1)
연습_포함 = 미청취 & 연습_어간
연습_밖_생산 = 발화_후보_어간 - heard_vocab(현재_세션 - 1) - 연습_어간
제안_미청취 = 본문_어간 - heard_vocab(제안_세션 - 1)
```

parse_lines의 읽기 실패는 0이며 세션 30과 48은 각 486어간이다. 원본 작성 파일이 다시 바뀌면 모든 표를 재계산한다. 노트 자체의 문자와 등급 표시는 check.py로 검사한다.

게임 소스 HnlMissionPlay.cpp의 PlayPractice()는 현재 선택한 발화 줄인 PickedId와 줄 id가 같은 연습만 찾는다. 7키를 누를 때 호출하며, 연습 목록을 차례대로 필수 이수시키는 흐름은 없다. 따라서 데이터에 NPC의 Cash or card?나 이름 자리 본보기를 보태도 현재 선택한 발화 후보와 일치하지 않으면 그 본보기를 재생할 수 있는 길이 보장되지 않는다.

이번 G1은 데이터의 연습 포함을 보강했다. 모든 핵심 틀을 실제 발화 전에 듣고 말하게 강제하는 것은 허용된 파일 영역 밖의 게임 코드 작업이라 완료하지 않았으며 보장하지 않는다. 두 노트북에서는 후보를 고른 뒤 7키 본보기가 나오는지, 이름 자리 본보기와 NPC 문장의 음성이 연결되는지, 새 갈래의 순서가 맞는지 확인해야 한다. B 줄은 사용자 검증 전 TTS 대상으로 확정하지 않는다.

Tools/gpt_bundle.py와 Tools 폴더는 실제 첨부 묶음에 없다. 반환 zip은 이번 작업의 자체 경로, 해시, 크기 검사로 확인하고 검토자가 원본 반환 검사 도구로 다시 검사해야 한다. 최종 반영 때는 검토자가 파생 자료와 dataHash를 다시 만들고 두 노트북에 sync_data를 적용한다.

집계 기준 authored_lines.md SHA-256: 2bf266dffb65cf499d8c1274dcc2d117068d561a2ea09cefb182521443c8e1f9
