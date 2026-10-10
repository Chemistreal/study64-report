# 나들이(outing) 미션. 실제 장소에서 하는 작은 미니게임

신뢰도: B 생성 (설계. 배치와 등급은 판단이다. 영어는 authored 이고 줄마다 점검 A/B 가 있다)
검증로그: 2026-10-10 / 미션 표를 sessions.json 과 acts.json 과 landmarks 표에 기계로 맞춤(derive_outings.py) / 보류 / 배치와 등급은 설계 판단이다. 사용자가 보고 바꾼다
상위 규격: docs/authored.md (지은 영어) / docs/game.md / docs/scenes.md / docs/game_data.md 11장 (acts)
작성일: 2026-10-10 (사용자 정정 반영: 주말 미션이 아니다. 시간 상한이 없는 미니게임이다)

`scripts/derive_outings.py` 가 6장 표와 7장 표를 읽어 `out/game/outings.json` 을 낸다. **손으로 JSON 을 안 고친다.**
게임 쪽 요약은 game 저장소 `Docs/outings_KO.md`.

## 1. 한눈에

| 무엇 | 정한 것 |
|---|---|
| 미션이란 | 실제 장소(하와이 호놀룰루)에서 하는 **작은 미니게임**이다. 주문, 쇼핑, 길 묻기, 등산, 스노클링 같은 생활과 여행과 행사. 열세 차례쯤의 짧은 대화를 고르고 말한다 |
| 어디에 있나 | 미션판(Tab)의 목록. 288세션 계획 **안에서** 세션 번호로 열린다 (`열리는 때` = 주.날). 한번 열리면 안 닫힌다 |
| 시간 | **상한이 없다.** 끝나면 끝이다. 세션의 블록 시간표에 안 들어가고 합격선 시간에도 안 센다 (4장) |
| 영어 | 줄은 authored (docs/authored.md). 관문을 통과한 줄만. 말뭉치(corpus) 줄은 그대로 있고 안 바뀐다 |
| 규모 | 전체 55개 (생활 31, 여행 20, 행사 4). 등급은 A1 19, A2 7, B1 15, B2 14. **첫 공개(세션 1~48, A1)는 18개**(생활 14, 여행 4)만 만든다. 나머지 37개는 이후 공개 라운드다 (2.1) |
| 집필 | 파일럿 하나(`eggs_n_things_breakfast`)만 끝났다. 다음 집필 라운드는 첫 공개의 나머지 17개다 (11장) |

## 2. 정정된 틀 (사용자 2026-10-10)

1. **주말 미션이 아니다.** 일요일이든 토요일이든 따로 부르지 않는다. 미션은 1년 계획(288세션) 안에서 미니게임처럼 하는 작은 미션들이다.
2. **세션 2시간을 딱 지키지 않아도 되고 시간 제한이 없다.** 미션은 세션 안의 한 블록 끝이나 세션 사이의 짧은 미니게임으로 할 수 있다. 끝나면 끝이다.
3. 이 설계는 앞의 초안(블록 3 의 장면 틀로 쓰기, 일요일 다시 하기)을 **버렸다.** 그 두 가지는 이 문서와 코드와 자료 어디에도 없다.

### 2.1 첫 공개 범위 (사용자 2026-10-10: 첫 공개는 세션 1~48, A1 까지만 만든다)

`acts.json` 의 `release.throughSession` 이 48 이고 A1 은 세션 1~50 이다. 그래서 **만드는 것은 세션 48 까지 열리는 A1 미션**이다.
6장 표는 전체 목록을 그대로 두고 `공개` 열로 가른다: `첫 공개` 18개, `이후` 37개. `이후`는 일감 표로만 있고 `outings.json` 에는 개수만 든다 (게임이 모르는 것을 미리 내리지 않는다).
같은 장소가 쉬운 판(첫 공개, A1)과 어려운 판(이후)으로 두 번 나오는 곳이 있다: 알라모아나(기본 쇼핑 / A2 옷 / B1 반품 / B2 선물), 약국(기본 / A2 증상), 버스(요금 묻기 / A2 타기), 다이아몬드 헤드(전망대 길 묻기 / A2 사진 / B1 등산 / B2 새벽), 하나우마(장비 빌리기 / B1 스노클링 / B2 보호), 에그스 앤 띵스(A1 / B2).

| 순서 | 미션 id | 갈래 | 장소 | 열리는 때 | 할 일 |
|---|---|---|---|---|---|
| 1 | `neighbor_greeting` | 생활 | new:apartment_hallway | 3.3 | 이웃에게 인사하고 이름을 말한다 |
| 2 | `hotel_front_desk` | 생활 | `outrigger_reef` | 3.5 | 호텔 프런트에서 방 번호를 말하고 수건 같은 것을 부탁한다 |
| 3 | `cafe_order` | 생활 | `island_vintage_coffee` | 4.2 | 카페에서 음료 하나와 크기를 말한다 |
| 4 | `convenience_store_abc` | 생활 | new:abc_store_waikiki | 4.4 | 편의점에서 물건을 찾아 값을 묻고 계산한다 |
| 5 | `cookie_snack` | 생활 | `honolulu_cookie_company` | 4.5 | 쿠키를 골라 수를 말하고 값을 내고 감사한다 |
| 6 | `shave_ice_snack` | 생활 | `waiola_shave_ice` | 5.2 | 맛과 크기를 골라 주문한다 |
| 7 | `musubi_day` | 생활 | `musubi_cafe_iyasume` | 5.4 | 무스비 종류를 고르고 개수를 말해 산다 |
| 8 | `waikiki_beach_chair_umbrella` | 여행 | `waikiki_beach` | 5.6 | 해변에서 의자와 우산을 빌리고 값을 묻는다 |
| 9 | `leonards_malasadas` | 생활 | `leonards_bakery` | 7.1 | 말라사다 개수를 말하고 포장을 부탁한다 |
| 10 | `food_truck_lunch` | 생활 | new:food_truck_waikiki | 7.3 | 푸드트럭에서 메뉴 하나를 고르고 옵션을 예 아니오로 답한다 |
| 11 | `honolulu_zoo_ticket` | 여행 | `honolulu_zoo` | 7.5 | 동물원에서 표를 사고 몇 명인지 말한다 |
| 12 | `pharmacy_basic` | 생활 | new:pharmacy | 7.6 | 약국에서 필요한 물건 이름을 말하고 값을 묻는다 |
| 13 | `cheesecake_dessert` | 생활 | `cheesecake_factory` | 8.1 | 디저트 하나를 고르고 음료와 함께 주문한다 |
| 14 | `bus_fare_question` | 생활 | new:bus_stop_kalakaua | 8.2 | 버스 요금을 묻고 내릴 곳을 말한다 |
| 15 | `ala_moana_basic_shopping` | 생활 | `ala_moana_center` | 8.3 | 가게에서 크기와 값을 묻고 사서 계산한다 |
| 16 | `diamond_head_lookout_directions` | 여행 | `diamond_head_lookout` | 8.4 | 전망대로 가는 길을 묻고 대답을 알아듣는다 |
| 17 | `eggs_n_things_breakfast` | 생활 | `eggs_n_things_saratoga` | 8.5 | 간단한 아침 식사를 주문하고 계산한다 |
| 18 | `hanauma_bay_gear_rental` | 여행 | `hanauma_bay` | 8.6 | 스노클링 장비를 빌릴지 예 아니오로 답하고 크기를 말한다 |

**A1 로 단순화한 것.** 첫 공개 판의 영어는 예/아니오, 하나 고르기, 수 말하기, 값 묻기 수준이다(줄 8낱말, 새 낱말 줄당 4). 푸드트럭은 옵션을 예/아니오로 답한다. 하나우마는 장비 빌리기를 예/아니오와 크기 말하기까지만 하고 안내 영상과 안전 신호는 이후 B1 판이다.
**한국어 풀이.** 세션 1~50 에서만 쓰이므로 **첫 공개 미션의 모든 줄과 연습 말에 한국어 풀이를 붙인다.** `check_authored.py` 판 `first` 가 집필이 끝난 첫 공개 미션의 풀이 빠짐을 실패로 센다.
**이동.** 지구 밖(하나우마) 미션의 이동 장면은 **화면 전환 하나**다(짧은 암전과 장소 이름 자막). 버스 이동 시스템과 이동 중 대화는 이후 라운드다 (5장).
**음성 렌더 대상(첫 공개 기준).** TTS 로 렌더할 것은 NPC 줄(`npc`)과 연습 말의 본보기 소리다. 두 사람이 말하는 `wait`/`option` 줄은 렌더하지 않는다(말 판정의 기대 문장이다). 점검 B 줄은 사용자가 통과시킨 뒤에 렌더한다. 파일럿은 NPC 줄 13개(점검 A 12, B 1)와 연습 말 본보기 8개이고, 지금 렌더할 수 있는 것은 A 12 + 연습 8 = 20개다(B 줄은 검증 뒤). 첫 공개 18개가 파일럿과 같은 크기라면 약 360개다 (어림. 집필이 끝나면 `authored.json` 에서 센다).
**시험.** 이 저장소는 `check_authored.py`(판 8, 깸 시험 포함). game 저장소는 `Scripts/test_outings_data.py`(첫 공개 18개의 장소 id, 열리는 세션 <= 48, A1, 계획 불변). 이후 미션의 시험은 그 미션을 낼 때 늘린다.
**데이터 해시.** `outings.json` 은 첫 공개 18개만 든다. `authored.json` 은 지금 파일럿 33줄이고 나머지 17개를 쓸 때마다 커지고 dataHash 가 바뀐다. 집필 라운드를 한 번에 모아 해시를 한 번만 바꾸는 것이 좋다.

## 3. 미니게임 틀

| 칸 | 값 |
|---|---|
| 차례 | 차례마다 NPC 줄 하나(없을 수 있다)와 두 사람이 고르는 줄 후보가 있다. 파일럿은 13차례 |
| 선택 | 주문처럼 고를 수 있는 차례는 후보가 둘 이상이다. **후보 중 하나만 말하면 통과**다 (기계가 넉넉하게 듣는다. game.md 6.1) |
| 두 사람 | 차례마다 자리(A, B, 둘 중 누구든)가 있다. 1인 지시는 없다. 둘이 서로에게 묻는 차례도 있다 |
| 결과 | 차례마다 통과 / 거의 / 못함 (기존 `pass` `near` `miss`와 같은 뜻). 미션은 통과 차례 비율 77% 이상 통과, 54% 이상 거의, 그 밖에 못함 |
| 못해도 | 아무것도 안 잠기고 아무것도 안 깎인다. 같은 미션을 다시 열 수 있다. 실패가 정상이다 |
| 보상 | 새 상수 없음. game 저장소 `Docs/level_KO.md` 2장 표의 기존 단위를 쓴다. 미션 하나 = `activity` 한 단위(통과 6 / 거의 5 / 못함 3, 열쇠 `outing:<id>`) + 차례마다 `line_wait` 단위(통과 2 / 거의 2 / 못함 1, 열쇠 `outing:<id>:<차례>`). 레벨 곡선(총 86,400 기준)은 안 바뀐다. 미션이 늘면 곡선 끝이 앞당겨질 수 있어 9장에 확인할 것으로 적었다 |
| 점수 | 사람별 값 없음. 팀 하나 (기준서 13.2) |

## 4. 시간과 합격선

**선택: 세션 번호가 진행의 기준이다. 미션의 소요는 기록만 하고, 합격선(누적 144/288/432/576시간)에는 명목 시간만 반영한다.**

| 질문 | 답 |
|---|---|
| 합격선은 정확한 시간인가 | 아니다. 이미 명목이다. `out/game/acts.json` 의 `plan` 은 `sessions.json` 의 블록 분 합(120분) x 세션 수(288)에서 파생한 **명목 시간**이고 `passHours` 는 4개 분기 끝 세션(72, 144, 216, 288)에 매인다 (`derive_acts.py`). 사람이 실제로 쓴 분은 어디서도 합격선이 되지 않는다. 결석한 날, 짧은 날(45분)이 이미 명목과 다르다 |
| 미션이 합격선을 움직이나 | 아니다. 미션은 세션 번호를 올리지도 시간을 더하지도 않는다. 합격선은 세션 번호로 판단하므로 미션 소요가 길든 짧든 같다 |
| 소요는 어디에 남나 | 결과 파일의 줄이 가진 `t0` `t1` (UTC 시각)에 이미 있다. 추가 저장 칸이 없다. 단, 미션 결과 줄을 쓰려면 `results_schema.json` 의 `activity.kind` 에 `outing` 이, `block` 에 블록 밖 값이 필요하다 (9장 할 일. 지금은 스키마를 안 바꿨다) |
| 블록 시계는 | 미션 중에는 멈춘다고 정한다. 세션 하나의 블록 4개는 그대로 명목 분이다. 미션은 블록을 늘리지도 줄이지도 않는다 |
| 공부 시간이 늘어나는 것은 | 맞다. 실제로는 120분을 넘는 날이 생긴다. 그것은 합격선이 아니라 학습자에게 이득이다. 압박이 되지 않도록 열려 있어도 안 해도 되고 목표 등급 글씨는 안내다 (level_KO.md 1.1) |

### 4.1 기존 계획과 시험에 주는 영향 (확인한 것)

| 대상 | 영향 | 확인 |
|---|---|---|
| `acts.json` plan (288세션, 2시간, 576시간, passHours) | 없다. 미션은 `sessions.json` 도 `badge.json` 도 안 바꾼다. 계획 숫자는 그 두 파일에서만 파생한다 | `check_acts.py` 통과 (`derive_acts.py` 출력 바이트 불변) |
| `sessions.json`, `cards.json`, `scenes.json` 등 기존 Data | 바이트 그대로다. `HnlSim` 288일이 읽는 것은 이들이고 블록 3(카드 블록)의 명목 분(`cards.json` minutes)과 차례(`HnlCardOrderCore`)가 그대로다 | game 저장소 `test_card_order_core.py` 통과 |
| dataHash | 바뀐다. 새 파일 둘(authored.json, outings.json)이 `Data/*.json` 이라 지문에 들어간다. 5장 아닌 8장에서 새 값을 적었다 | `derive_game_manifest.py --strict`, `check_game.py --manifest` |
| `HnlSim` block 3 / 시간 계산 | 영향 없다. 미션을 안 읽는 한 시뮬은 기존과 같다. 로더를 달 때는 미션을 블록 시계 밖에서 돌려야 한다 (9장) | 컨테이너에는 언리얼이 없어 `HnlSim` 은 못 돌렸다. 근거는 위 두 줄(Data 불변 + 시험 통과)이다 |
| 레벨 곡선 | 안 바뀐다. 보상이 기존 단위라서다. 다만 미션이 55개이고 미션마다 약 10~40점을 더 벌 수 있어 총 경험치가 늘어난다. 곡선의 TotalXp 를 다시 정하는 일은 사용자 결정이다 | 9장 |

## 5. 이동

장소 단계는 game 저장소 `HnlLandmarks.json` 의 `stage` 다.

| 단계 | 장소 | 이동 |
|---|---|---|
| 0 | 마을 안 (도서관, 진료소, 숙소 복도 같은 곳) | 따로 없다 |
| 1 | 와이키키 지구 안 (걸어서) | 걷거나 **빠른 이동**(화면 전환). 미션을 받으면 도착 장소에서 시작한다 |
| 2 | 시내 | 빠른 이동 또는 **버스 장면** (`thebus_ride` 를 한 뒤에는 버스 장면을 직접 탄다. 영어 미션이기도 하다) |
| 3 | 먼 곳 (하나우마, 진주만, 노스쇼어 등) | **걷기만으로 못 간다.** 미션을 수락하면 이동한다. **첫 공개는 화면 전환 하나**(암전과 장소 이름 자막)다. 이후 라운드에서 버스나 차 안 몇 줄의 이동 장면(건너뛸 수 있다)을 붙인다 |

단계 2, 3 에서는 빠른 이동을 기본으로 하고 걷기는 쓰지 않는다. 버스 이동 시스템과 이동 대화(authored 2~3줄)는 이후 라운드다.

## 6. 미션 표 (원본)

열리는 때는 `주.날` 이다 (예: `8.5` = 8주 5일 = 세션 47). 등급은 열리는 세션의 목표 등급(acts.json)과 같아야 한다. 다지기 주(6, 18, 30, 42주)는 피한다. 같은 장소를 쉬운 단계와 어려운 단계로 두 번 쓰는 미션이 있다 (에그스 앤 띵스 A1/B2, 하나우마 B1/B2, 알라모아나 A2/B1/B2, 다이아몬드 헤드 A2/B1/B2, 듀크스 A2/B2, 카메하메하 B1/B2).
장소 칸이 `new:` 로 시작하는 것은 `HnlLandmarks.json` 에 아직 없는 장소다 (8장).

| 미션 id | 갈래 | 장소 id | 단계 | 등급 | 할 일(can-do) | 필요한 영어 기능 | 열리는 때 | 집필 | 공개 |
|---|---|---|---|---|---|---|---|---|---|
| `neighbor_greeting` | life | new:apartment_hallway | 0 | A1 | 이웃에게 인사하고 이름을 말한다 | 인사, 자기소개 | 3.3 | 집필 완료 | 첫 공개 |
| `hotel_front_desk` | life | `outrigger_reef` | 1 | A1 | 호텔 프런트에서 방 번호를 말하고 수건 같은 것을 부탁한다 | 부탁, 숫자 말하기 | 3.5 | 집필 완료 | 첫 공개 |
| `cafe_order` | life | `island_vintage_coffee` | 1 | A1 | 카페에서 음료 하나와 크기를 말한다 | 주문(고르기), 크기 | 4.2 | 집필 완료 | 첫 공개 |
| `convenience_store_abc` | life | new:abc_store_waikiki | 1 | A1 | 편의점에서 물건을 찾아 값을 묻고 계산한다 | 값 묻기, 계산 | 4.4 | 집필 완료 | 첫 공개 |
| `cookie_snack` | life | `honolulu_cookie_company` | 1 | A1 | 쿠키를 골라 수를 말하고 값을 내고 감사한다 | 주문(수량), 값 묻기, 감사 | 4.5 | 집필 완료 | 첫 공개 |
| `shave_ice_snack` | life | `waiola_shave_ice` | 1 | A1 | 맛과 크기를 골라 주문한다 | 주문(고르기), 크기 | 5.2 | 집필 완료 | 첫 공개 |
| `musubi_day` | life | `musubi_cafe_iyasume` | 1 | A1 | 무스비 종류를 고르고 개수를 말해 산다 | 주문(수량), 묻기 | 5.4 | 집필 완료 | 첫 공개 |
| `waikiki_beach_chair_umbrella` | trip | `waikiki_beach` | 1 | A1 | 해변에서 의자와 우산을 빌리고 값을 묻는다 | 빌리기, 값 묻기 | 5.6 | 집필 완료 | 첫 공개 |
| `leonards_malasadas` | life | `leonards_bakery` | 1 | A1 | 말라사다 개수를 말하고 포장을 부탁한다 | 주문(수량), 포장 부탁 | 7.1 | 집필 완료 | 첫 공개 |
| `food_truck_lunch` | life | new:food_truck_waikiki | 1 | A1 | 푸드트럭에서 메뉴 하나를 고르고 옵션을 예 아니오로 답한다 | 주문, 예 아니오 답 | 7.3 | 집필 완료 | 첫 공개 |
| `honolulu_zoo_ticket` | trip | `honolulu_zoo` | 1 | A1 | 동물원에서 표를 사고 몇 명인지 말한다 | 표 사기, 인원 말하기 | 7.5 | 집필 완료 | 첫 공개 |
| `pharmacy_basic` | life | new:pharmacy | 1 | A1 | 약국에서 필요한 물건 이름을 말하고 값을 묻는다 | 물건 말하기, 값 묻기 | 7.6 | 집필 완료 | 첫 공개 |
| `cheesecake_dessert` | life | `cheesecake_factory` | 1 | A1 | 디저트 하나를 고르고 음료와 함께 주문한다 | 주문(고르기), 음료 | 8.1 | 집필 완료 | 첫 공개 |
| `bus_fare_question` | life | new:bus_stop_kalakaua | 1 | A1 | 버스 요금을 묻고 내릴 곳을 말한다 | 요금 묻기, 장소 말하기 | 8.2 | 집필 완료 | 첫 공개 |
| `ala_moana_basic_shopping` | life | `ala_moana_center` | 1 | A1 | 가게에서 크기와 값을 묻고 사서 계산한다 | 크기 묻기, 값 묻기, 계산 | 8.3 | 집필 완료 | 첫 공개 |
| `diamond_head_lookout_directions` | trip | `diamond_head_lookout` | 1 | A1 | 전망대로 가는 길을 묻고 대답을 알아듣는다 | 길 묻기, 방향 알아듣기 | 8.4 | 집필 완료 | 첫 공개 |
| `eggs_n_things_breakfast` | life | `eggs_n_things_saratoga` | 1 | A1 | 간단한 아침 식사를 주문하고 계산한다 | 인원 말하기, 주문, 되묻기, 계산 | 8.5 | 파일럿 완료 | 첫 공개 |
| `hanauma_bay_gear_rental` | trip | `hanauma_bay` | 3 | A1 | 스노클링 장비를 빌릴지 예 아니오로 답하고 크기를 말한다 | 예 아니오 답, 크기 말하기 | 8.6 | 집필 완료 | 첫 공개 |
| `aloha_festival_parade` | event | new:kalakaua_parade_route | 1 | A1 | 퍼레이드를 보며 짧게 감탄하고 한 가지를 묻는다 | 감탄, 간단한 질문 | 7.4 | 대기 | 이후 |
| `dukes_dinner` | life | `dukes_waikiki` | 1 | A2 | 저녁 식사를 주문하고 음식에 대해 묻는다 | 주문, 추천 묻기, 계산 | 10.5 | 대기 | 이후 |
| `marukame_udon` | life | `marukame_udon` | 1 | A2 | 줄을 서서 우동과 고명을 고른다 | 줄 서기, 고르기, 계산 | 12.5 | 대기 | 이후 |
| `ala_moana_shopping` | life | `ala_moana_center` | 1 | A2 | 옷 크기와 색을 묻고 입어 보고 계산한다 | 크기 묻기, 입어 보기, 값, 계산 | 13.5 | 대기 | 이후 |
| `grocery_store` | life | new:grocery_store | 1 | A2 | 마트에서 물건 위치를 묻고 계산한다 | 위치 묻기, 수량, 계산 | 14.5 | 대기 | 이후 |
| `pharmacy` | life | new:pharmacy | 1 | A2 | 약국에서 증상을 말하고 약을 산다 | 증상 말하기, 약 묻기 | 15.2 | 대기 | 이후 |
| `thebus_ride` | life | new:bus_stop_kalakaua | 1 | A2 | 버스를 타고 내릴 곳을 묻고 내린다 | 길 묻기, 정류장, 요금 | 15.5 | 대기 | 이후 |
| `diamond_head_lookout` | trip | `diamond_head_lookout` | 1 | A2 | 전망대에서 사진을 부탁하고 경치를 말한다 | 부탁, 묘사, 감사 | 16.5 | 대기 | 이후 |
| `bank_post_office` | life | new:bank_and_post_office | 1 | B1 | 은행이나 우체국에서 일을 말하고 절차를 묻는다 | 용건 말하기, 절차 묻기 | 17.5 | 대기 | 이후 |
| `diamond_head_hike` | trip | `diamond_head_trailhead` | 2 | B1 | 등산로 입구에서 코스와 시간을 묻고 오르며 말을 나눈다 | 정보 묻기, 제안, 이동 중 대화 | 19.5 | 대기 | 이후 |
| `taxi_ride` | life | new:taxi_stand | 1 | B1 | 택시를 잡아 목적지와 요금을 말한다 | 목적지 말하기, 요금 묻기 | 20.5 | 대기 | 이후 |
| `library_card` | life | new:neighborhood_library | 0 | B1 | 도서관에서 카드를 만들고 책을 빌린다 | 요구 사항 말하기, 규칙 묻기 | 21.5 | 대기 | 이후 |
| `clinic_visit` | life | new:clinic | 0 | B1 | 진료소에서 아픈 곳과 기간을 말하고 지시를 듣는다 | 증상 설명, 지시 이해 | 22.5 | 대기 | 이후 |
| `ala_moana_returns` | life | `ala_moana_center` | 1 | B1 | 산 물건을 바꾸거나 반품하겠다고 말한다 | 이유 설명, 요청, 정중한 거절 듣기 | 23.5 | 대기 | 이후 |
| `hula_show` | event | `kapiolani_park` | 1 | B1 | 훌라 공연을 보고 느낀 점을 말하고 설명을 묻는다 | 의견 말하기, 묻기, 이해 확인 | 24.5 | 대기 | 이후 |
| `surf_lesson` | trip | `waikiki_beach` | 1 | B1 | 서핑 강습에서 안전 안내를 듣고 확인한다 | 지시 이해, 확인, 부탁 | 25.5 | 대기 | 이후 |
| `iolani_palace_tour` | trip | `iolani_palace` | 2 | B1 | 궁전 투어에서 안내를 듣고 질문한다 | 안내 이해, 질문, 이해 확인 | 26.5 | 대기 | 이후 |
| `kamehameha_statue_walk` | trip | `kamehameha_statue` | 2 | B1 | 동상 앞에서 길을 묻고 설명을 듣는다 | 길 묻기, 설명 이해 | 27.5 | 대기 | 이후 |
| `phone_and_laundry` | life | new:laundromat | 1 | B1 | 세탁소 기계 쓰는 법과 휴대폰 요금을 묻는다 | 방법 묻기, 요금 묻기 | 28.5 | 대기 | 이후 |
| `hanauma_bay_snorkel` | trip | `hanauma_bay` | 3 | B1 | 안내 영상을 보고 장비를 빌리고 안전 규칙과 물속 신호를 확인한다 | 지시 이해, 장비 빌리기, 신호, 안전 확인 | 29.5 | 대기 | 이후 |
| `pearl_harbor_visit` | trip | `pearl_harbor_visitor_center` | 3 | B1 | 방문자 센터에서 표와 일정을 묻고 안내를 듣는다 | 표 묻기, 일정, 안내 이해 | 31.5 | 대기 | 이후 |
| `north_shore_shrimp_truck` | trip | `giovannis_shrimp_truck` | 3 | B1 | 새우 푸드트럭에서 맵기와 양을 정해 주문한다 | 옵션 고르기, 맵기, 양 | 32.5 | 대기 | 이후 |
| `sunset_beach_day` | trip | `sunset_beach` | 3 | B1 | 해변에서 파도와 안전 표지를 묻고 노을을 본다 | 안전 묻기, 묘사 | 33.5 | 대기 | 이후 |
| `eggs_n_things_special_requests` | life | `eggs_n_things_saratoga` | 1 | B2 | 재료를 빼 달라고 하고 잘못 나온 음식을 정중히 바꿔 달라고 한다 | 특별 요청, 알레르기, 정중한 불만 | 34.5 | 대기 | 이후 |
| `polynesian_cultural_center` | trip | `polynesian_cultural_center` | 3 | B2 | 문화센터에서 일정을 짜고 공연 설명을 이해한다 | 계획 말하기, 설명 이해, 비교 | 35.5 | 대기 | 이후 |
| `airport_rental_car` | trip | new:honolulu_airport | 3 | B2 | 공항에서 렌터카를 빌리고 보험과 반납을 확인한다 | 조건 확인, 서류, 요금 이해 | 36.5 | 대기 | 이후 |
| `apartment_hunting` | life | new:apartment_viewing | 0 | B2 | 집을 보러 가서 조건과 월세를 묻고 비교한다 | 조건 묻기, 월세, 비교, 협의 | 37.5 | 대기 | 이후 |
| `lei_day` | event | `kapiolani_park` | 1 | B2 | 레이 데이 행사에서 예절을 지켜 말을 나눈다 | 예절, 설명 묻기, 의견 | 38.6 | 대기 | 이후 |
| `dole_plantation` | trip | `dole_plantation` | 3 | B2 | 농장 투어에서 설명을 듣고 질문하고 기념품을 산다 | 설명 이해, 질문, 구매 | 39.5 | 대기 | 이후 |
| `manoa_falls_hike` | trip | `manoa_falls` | 2 | B2 | 폭포 길에서 날씨와 길 상태를 묻고 경고를 이해한다 | 상태 묻기, 경고 이해, 제안 | 40.5 | 대기 | 이후 |
| `hospital_emergency` | life | new:hospital_er | 0 | B2 | 응급실에서 증상과 경위를 말하고 접수한다 | 경위 설명, 접수, 지시 이해 | 41.5 | 대기 | 이후 |
| `hanauma_bay_conservation` | trip | `hanauma_bay` | 3 | B2 | 해양 보호 설명을 듣고 규칙의 이유를 말한다 | 이유 설명, 요약, 의견 | 43.5 | 대기 | 이후 |
| `kamehameha_day` | event | `kamehameha_statue` | 2 | B2 | 카메하메하 대왕의 날 행사를 보며 설명을 듣고 의견을 말한다 | 설명 이해, 의견, 예절 | 44.5 | 대기 | 이후 |
| `kailua_lanikai_day` | trip | `lanikai_beach` | 3 | B2 | 해변 하루 일정을 정하고 장비와 간식을 계획한다 | 계획, 제안, 합의 | 45.5 | 대기 | 이후 |
| `dukes_celebration` | life | `dukes_waikiki` | 1 | B2 | 기념일 저녁을 예약하고 요청 사항을 전한다 | 예약, 요청, 정중한 변경 | 46.5 | 대기 | 이후 |
| `ala_moana_gift_shopping` | life | `ala_moana_center` | 1 | B2 | 선물을 고르며 조언을 구하고 포장과 배송을 부탁한다 | 조언 구하기, 비교, 부탁 | 47.5 | 대기 | 이후 |
| `diamond_head_sunrise` | trip | `diamond_head_trailhead` | 2 | B2 | 새벽 등산 준비를 확인하고 정상에서 지난 1년을 말한다 | 계획 확인, 회상 말하기 | 48.5 | 대기 | 이후 |

## 7. 랜드마크 id 표 (game 저장소 `HnlLandmarks.json` 사본)

game 저장소 시험(`Scripts/test_outings_ref.py`)이 이 표가 실제 파일과 같은지 본다. 파일이 바뀌면 이 표도 바꾼다.

| id | 단계 | 한국어 이름 |
|---|---|---|
| `waikiki_beach` | 1 | 와이키키 해변 |
| `kapiolani_park` | 1 | 카피올라니 공원 |
| `honolulu_zoo` | 1 | 호놀룰루 동물원 |
| `queen_kapiolani_hotel` | 1 | 퀘 카피올라니 호텔 |
| `ala_moana_center` | 1 | 알라모아나 센터 |
| `ala_moana_beach_park` | 1 | 알라모아나 비치 파크 |
| `outrigger_reef` | 1 | 아웃리거 리프 와이키키 비치 리조트 |
| `diamond_head_lookout` | 1 | 다이아몬드 헤드 전망대 |
| `eggs_n_things_saratoga` | 1 | 에그스 앤 띠스 사라토가 |
| `cheesecake_factory` | 1 | 치즈케이크 팩토리 |
| `marukame_udon` | 1 | 마루카메 우동 |
| `dukes_waikiki` | 1 | 듀크스 와이키키 |
| `island_vintage_coffee` | 1 | 아일랜드 빈티지 커피 |
| `honolulu_cookie_company` | 1 | 호놀룰루 쿠키 컴퍼니 |
| `leonards_bakery` | 1 | 레너즈 베이커리 |
| `musubi_cafe_iyasume` | 1 | 무스비 카페 이야스메 |
| `tonkatsu_tamafuji` | 1 | 돈카츠 타마후지 |
| `arancino_di_mare` | 1 | 아란치노 디 마레 |
| `hula_grill_waikiki` | 1 | 훘라 그릴 와이키키 |
| `heavenly_island_lifestyle` | 1 | 헤븐리 아일랜드 라이프스타일 |
| `waiola_shave_ice` | 1 | 와이올라 셸이브 아이스 |
| `banan_waikiki` | 1 | 바난 와이키키 |
| `diamond_head_trailhead` | 2 | 다이아몬드 헤드 등산로 입구 |
| `iolani_palace` | 2 | 이올라니 궁전 |
| `kamehameha_statue` | 2 | 카메하메하 대왕 동상 |
| `tantalus_lookout` | 2 | 탄탈루스 전망대 |
| `manoa_falls` | 2 | 마노아 폭포 |
| `hanauma_bay` | 3 | 하나우마 베이 |
| `pearl_harbor_visitor_center` | 3 | 진주만 방문자 센터 |
| `uss_arizona_memorial` | 3 | 애리조나 기념관 |
| `polynesian_cultural_center` | 3 | 폴리네시안 문화 센터 |
| `dole_plantation` | 3 | 돌 플랜테이션 |
| `kualoa_regional_park` | 3 | 쿠알로아 지역 공원 |
| `lanikai_beach` | 3 | 라니카이 해변 |
| `kailua_beach_park` | 3 | 카일루아 비치 파크 |
| `waimea_bay` | 3 | 와이메아 베이 |
| `sunset_beach` | 3 | 선셋 비치 |
| `ehukai_beach_park` | 3 | 에후카이 비치 파크 |
| `giovannis_shrimp_truck` | 3 | 조반니 새우 푸드트럭 |
| `teds_bakery` | 3 | 테드스 베이커리 |

## 8. 새로 필요한 장소

`new:` 장소는 `HnlLandmarks.json` 에 아직 없다. 게임 쪽 일(좌표를 OSM 에서 찾는 일은 `Docs/landmarks_KO.md` 6장 절차)이고 이 저장소는 id 만 제안한다.

| 제안 id | 무엇 | 비고 |
|---|---|---|
| `food_truck_waikiki` | 와이키키의 푸드트럭 | 실제로 한 곳을 고르거나 가상 장소로 둔다 (사용자) |
| `grocery_store`, `pharmacy`, `bank_and_post_office` | 생활 가게 | 실제 가게 하나씩 고를지 사용자 결정 |
| `bus_stop_kalakaua`, `taxi_stand`, `honolulu_airport` | 탈것 | 공항은 단계 3 |
| `kalakaua_parade_route` | 알로하 축제 퍼레이드 길 | 칼라카우아 대로 |
| `apartment_hallway`, `apartment_viewing`, `laundromat`, `neighborhood_library`, `clinic`, `hospital_er` | 마을 안이거나 가상 | 단계 0 은 `Data/town.json` 의 장소로 바로 연결할 수 있다 (도서관, 진료소) |

## 9. 데이터와 로더 할 일 (게임 쪽)

| # | 할 일 | 상태 |
|---|---|---|
| 1 | `Data/outings.json` `Data/authored.json` 로더. 없으면 조용히 건너뜀. 미션판(Tab)에 목록, 열린 것만 | **안 했다.** 지금은 파일만 복사했다. 게임은 읽지 않는다 |
| 2 | `results_schema.json` 에 미션 결과 줄: `activity.kind` 에 `outing`, `block` 에 블록 밖 표시(0). 스키마 판 번호 | **안 했다.** 계약 변경이라 사용자와 정한다 |
| 3 | 블록 시계: 미션 중에는 시계가 멈춘다 | 로더와 같이 |
| 4 | 보상: 기존 단위. 총 경험치 곡선을 미션 수만큼 늘릴지 | 사용자 결정 |
| 5 | 실제 장소 이름과 로고: 비공개 로컬 빌드에서 쓴다 (AGENTS.md 6번) | 이미 결정 |
| 6 | 영어 소리: authored 줄도 TTS(C-gen)다. voicelist 에 올릴지 | `docs/authored.md` 6장 |

## 10. 파일럿. 에그스 앤 띵스 아침 식사

- 미션 id `eggs_n_things_breakfast`, 장소 `eggs_n_things_saratoga`, 단계 1, 등급 A1, 8주 5일(세션 47)에 열린다. 첫 공개 한계(세션 48)와 한국어 풀이 구간(세션 50)에 든다.
- 줄 33개(NPC 줄과 두 사람 줄, 선택 줄), 연습할 말 8개, 차례 13개. 원본은 `docs/authored_lines.md`.
- 할 일(can-do): *I can order a simple breakfast and pay in a restaurant.* (식당에서 간단한 아침 식사를 주문하고 계산할 수 있다.)
- 점검: A 32, B 1 (`enb-31` 값 읽기. `state/authored_b.md`).
- 이 파일럿이 증명한 것: 원본 표 -> 관문(낱말 등급, 길이, 새 낱말, 문화, 중복, 베끼기, 풀이 구간, B 목록) -> `authored.json` + `outings.json` -> 매니페스트 -> 게임 Data 사본이 한 줄로 이어진다.

## 11. 다음 집필 라운드의 일감

**다음 라운드는 첫 공개의 나머지 17개다** (2.1 표 순서대로). 이후 공개 라운드(37개)는 그 뒤다.
미션마다 같은 것을 한다: (1) `authored_lines.md` 에 장 하나(메타, 줄 표, 연습할 말, 차례), (2) 쓴 낱말을 `authored_words.md` 에 올린다(없으면 막힌다), (3) 6장 표의 집필 칸을 `집필 완료` 로, (4) `python3 scripts/all.py`.
**첫 공개 미션은 줄과 연습 말 모두에 한국어 풀이를 붙인다**(세션 50 이하). 등급이 같은 미션끼리 낱말을 공유해 새 낱말 상한(줄마다 4개)을 지킨다.

| 미션 | 다음에 할 것 |
|---|---|
| `neighbor_greeting`, `hotel_front_desk`, `cafe_order`, `convenience_store_abc` | 가장 짧은 판(차례 6~8). 인사, 이름, 부탁, 크기. ABC 는 실제 체인이라 `허용 이름` 에 올릴지 정한다 |
| `cookie_snack`, `shave_ice_snack`, `musubi_day`, `leonards_malasadas` | 파일럿과 같은 틀의 짧은 판. 수량 말하기와 값. 말라사다는 "하와이 음식 상표 붙은 이름" 문화 표(2.1)를 로컬 빌드 면제로 본다 |
| `food_truck_lunch`, `cheesecake_dessert`, `ala_moana_basic_shopping`, `pharmacy_basic`, `bus_fare_question` | A1 로 단순화(예/아니오, 하나 고르기, 값). 약국은 증상을 말하지 않고 물건 이름만 말한다(의학 정보를 안 짓는다). 버스는 요금과 내릴 곳만 |
| `waikiki_beach_chair_umbrella`, `honolulu_zoo_ticket`, `diamond_head_lookout_directions`, `hanauma_bay_gear_rental` | 여행 넷. 길 묻기는 알아듣는 줄(NPC 방향 설명 2~3줄)이 많다. 하나우마는 예/아니오와 크기만, 이동은 화면 전환 하나 |
| 이후 공개 라운드 | A2 7개, B1 15개, B2 14개, A1 1개(알로하 축제 퍼레이드. 달력에 묶여 7주에 열리지만 첫 공개 18개에 안 넣었다). A2 부터 줄 길이 상한이 12, B1 은 18 이라 두 문장 줄이 나온다. 여행 판은 안내를 **듣는** 줄이 많다. 역사 사실(진주만, 궁전, 카메하메하)은 연도와 숫자를 짓지 않는다. 틀릴 수 있으면 B 점검. 이동 장면(버스, 차)과 안내 영상 줄도 이때 |
| 전체 | 낱말 등급표를 미션마다 늘리고 `check_authored.py` 의 새 낱말 합계 보고를 본다. 사용자가 B 목록(`state/authored_b.md`)을 대화에서 검증한다 |
