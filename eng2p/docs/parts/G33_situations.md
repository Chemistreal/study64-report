# G33 모든 미션의 화면용 상황

신뢰도: B 생성 (화면용 짧은 상황과 가상 장면값 보존안이며 실제 글꼴·창과 학습자 읽기는 미검증이에요).
검증로그: 2026-10-13 / 미션 원문과 G17·G18·G19의 최신 형식안, HnlUiMission·HnlUiWidgets / 보류 / 화면과 실제 소품을 실행하지 않았어요.

## 실제 화면 규칙

HnlUiMission.cpp 116~118행은 접두사를 붙일 뿐 자르지 않고, 228~230행과 281~283행은 안내·소개 글 앞에 줄바꿈을 넣어요. HnlUiWidgets.cpp 161~163행의 Para는 AutoWrapText(true), 1246행의 목록 안내는 16크기, 1303행의 소개 Body는 22크기로 Para를 써요. 따라서 한 줄이라는 문서 표현은 문단 시작의 한 항목이고 물리적인 줄 하나로 고정되거나 70자에서 잘리는 코드가 아니에요. 고정 글자수 제한을 찾지 못했으므로 이 제안의 편집 상한을 70자로 두고 공백·기호까지 포함해 더 엄격히 세요. 한 줄 폭이나 글꼴의 실제 크기는 실행 검수가 필요해요.

짧은 줄과 긴 설명을 같은 데이터 칸으로 자동 덮어쓰지 않아요. 화면 짧은 줄은 별도 제안이고 긴 메타는 아래 long form에 그대로 남겨요. 현재 한 칸만 읽는 로더의 분리는 적용 담당자가 검토해야 해요.

| mission id | session | level | place | A seat | B seat | situation sentence (Korean) | characters | chars | basis | A/B |
|---|---|---|---|---|---|---|---|---|---|---|
| neighbor_greeting | 15 | A1 | new:apartment_hallway | 안부 대답 / 이름 말하기 / 대답 | 대답 / 이름 말하기 / 인사 | 동행과 함께 복도에서 이웃에게 인사하고 이름을 말해요. | 두 사람 / 이웃 | 30 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md ng-01~ng-26와 차례 표 | B |
| hotel_front_desk | 17 | A1 | outrigger_reef | 말 걸기 / 부탁 / 방 번호 말하기 | 이름 말하기 / 대답 / 감사 | 동행과 호텔 안내 창구에 들러 필요한 물건과 방 번호를 말해요. | 두 사람 / 직원 | 35 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md hf-01~hf-42와 차례 표 | B |
| cafe_order | 20 | A1 | island_vintage_coffee | 음료 주문 / 고르기 / 크기 말하기 | 음료 주문 / 크기 말하기 / 고르기 | 동행과 카페에서 음료를 고르고 계산할 내용을 확인해요. | 두 사람 / 계산 직원 / 서빙 직원 | 30 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md 상황 및 차례 표 | B |
| convenience_store_abc | 22 | A1 | new:abc_store_waikiki | 위치 묻기 / 감사 / 값 묻기 | 위치 묻기 / 감사 / 대답 | 동행과 편의점에서 필요한 물건을 찾고 값을 물어봐요. | 두 사람 / 계산 직원 / 직원 | 29 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md ab-01~ab-28와 차례 표 | B |
| cookie_snack | 23 | A1 | honolulu_cookie_company | 인사 주문 / 맛 고르기 / 상대에게 묻기 | 같은 것 고르기 / 말하고 되묻기 / 대답 | 동행과 쿠키 가게에서 맛과 개수를 고르고 주문해요. | 두 사람 / 직원 | 28 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md 상황 및 차례 표 | B |
| shave_ice_snack | 26 | A1 | waiola_shave_ice | 주문 / 크기 고르기 / 맛 고르기 | 같은 것 고르기 / 맛 고르기 / 수량 말하기 | 동행과 빙수 가게에서 맛과 크기를 고르고 주문을 확인해요. | 두 사람 / 직원 | 32 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md 상황 및 차례 표 | B |
| musubi_day | 28 | A1 | musubi_cafe_iyasume | 시간 벌기 / 상대에게 묻기 / 종류 고르기 | 말하고 되묻기 / 수량 말하기 / 대답 | 동행과 무스비 가게에서 종류와 개수를 의논하고 주문해요. | 두 사람 / 직원 | 31 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md mu-01~mu-33와 차례 표 | B |
| waikiki_beach_chair_umbrella | 30 | A1 | waikiki_beach | 시간 벌기 / 상대에게 묻기 / 빌릴 것 말하기 | 대답과 이유 / 값 묻기 / 대답 | 동행과 와이키키 비치 대여소에서 의자와 우산을 물어봐요. | 두 사람 / 직원 | 31 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md bc-01~bc-30와 차례 표 | B |
| leonards_malasadas | 37 | A1 | leonards_bakery | 인사 주문 / 고르기 / 대답 | 수량 말하기 / 상대에게 묻기 / 주문 끝내기 | 동행과 레너즈 베이커리에서 말라사다 개수를 정하고 포장을 부탁해요. | 두 사람 / 직원 | 37 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md 상황 및 차례 표 | B |
| food_truck_lunch | 39 | A1 | new:food_truck_waikiki | 상대에게 묻기 / 주문 / 고르기 | 말하고 되묻기 / 같은 것 고르기 / 예 대답 | 동행과 푸드트럭에서 점심 메뉴를 고르고 필요한 걸 부탁해요. | 두 사람 / 직원 | 33 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md 상황 및 차례 표 | B |
| honolulu_zoo_ticket | 41 | A1 | honolulu_zoo | 인원 말하기 / 대답 / 상대에게 묻기 | 확인 대답 / 값 묻기 / 대답 | 동행과 호놀룰루 동물원 매표소에서 인원과 표를 확인해요. | 두 사람 / 계산 직원 | 31 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md hz-01~hz-31와 차례 표 | B |
| pharmacy_basic | 42 | A1 | new:pharmacy | 물건 말하기 / 크기 말하기 / 값 묻기 | 물건 말하기 / 값 묻기 / 결제 | 동행과 약국에서 필요한 물건을 고르고 값을 물어봐요. | 두 사람 / 직원 | 29 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md 상황 및 차례 표 | B |
| cheesecake_dessert | 43 | A1 | cheesecake_factory | 대답 / 음료 주문 / 상대에게 묻기 | 음료 주문 / 말하고 되묻기 / 같은 것 고르기 | 동행과 식당에서 후식과 음료를 의논하고 주문해요. | 두 사람 / 안내 직원 / 서빙 직원 | 27 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md 상황 및 차례 표 | B |
| bus_fare_question | 44 | A1 | new:bus_stop_kalakaua | 노선 묻기 / 건네기 / 내릴 곳 말하기 | 요금 묻기 / 감사 / 도착 묻기 | 동행과 정류장에서 버스 요금과 내릴 곳을 물어봐요. | 두 사람 / 기사 | 28 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md bs-01~bs-27와 차례 표 | B |
| ala_moana_basic_shopping | 45 | A1 | ala_moana_center | 찾는 물건 말하기 / 상대에게 묻기 / 크기 말하기 | 말하고 되묻기 / 크기 묻기 / 값 묻기 | 동행과 알라 모아나 센터 가게에서 크기와 값을 확인해요. | 두 사람 / 계산 직원 / 직원 | 31 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md am-01~am-31와 차례 표 | B |
| diamond_head_lookout_directions | 46 | A1 | diamond_head_lookout | 길 묻기 / 방향 확인 / 거리 묻기 | 방향 확인 / 대답 / 길 되짚기 | 동행과 다이아몬드 헤드 안내소에서 전망대로 가는 길을 물어봐요. | 두 사람 / 안내인 | 35 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md 상황 및 차례 표 | B |
| eggs_n_things_breakfast | 47 | A1 | eggs_n_things_saratoga | 인원 말하기 / 시간 벌기 / 상대에게 묻기 | 말하고 되묻기 / 주문 / 감사 | 동행과 에그스 앤 띵스에서 아침을 주문하고 요청을 확인해요. | 두 사람 / 안내 직원 / 서빙 직원 | 33 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md enb-01~enb-37와 차례 표 | B |
| hanauma_bay_gear_rental | 48 | A1 | hanauma_bay | 예 대답 / 상대에게 묻기 / 크기 말하기 | 예 대답 / 말하고 되묻기 / 크기 말하기 | 동행과 하나우마 베이 대여소에서 장비를 빌릴지 의논해요. | 두 사람 / 직원 | 31 | validation/week5/G20_check_source/study/eng2p/docs/authored_lines.md 상황 및 차례 표 | B |
| aloha_festival_parade | 40 | A1 | new:kalakaua_parade_route | 행사 확인 질문 / 감상 말하기 / 들은 시각 확인 | 위치 이해 확인 / 동의 감상 / 시작 시각 질문 | 동행과 알로하 축제 행렬을 기다리며 안내인에게 궁금한 걸 물어봐요. | 두 사람 / 안내 직원 | 37 | deliverables_week5/G18/files/study/eng2p/docs/parts/G18_authored_lines_v2.md 상황 및 차례 표 | B |
| dukes_dinner | 59 | A2 | dukes_waikiki | 인원 확인 / 시간 요청 / 상대의 선택 묻기 | 선호 말하기 / 음료 주문 / 식사 주문 | 동행과 듀크스에서 저녁 메뉴를 의논하고 각자 주문해요. | 두 사람 / 안내 직원 / 서빙 직원 | 30 | deliverables_week5/G17/files/study/eng2p/docs/parts/G17_authored_lines_v2.md 상황 및 차례 표 | B |
| marukame_udon | 71 | A2 | marukame_udon | 줄 확인 / 주문 시작 / 메뉴 선택 | 메뉴 선택 / 두 사람의 크기 확정 / 고명 추가 주문 | 동행과 마루카메에서 우동 두 그릇의 크기와 고명을 의논해요. | 두 사람 / 계산 직원 / 직원 | 33 | deliverables_week5/G17/files/study/eng2p/docs/parts/G17_authored_lines_v2.md 상황 및 차례 표 | B |
| ala_moana_shopping | 77 | A2 | ala_moana_center | 원하는 물건 요청 / 크기 선택 / 입어 볼 위치 질문 | 색 선호 답하기 / 카드 결제 가능 여부 질문 / 카드 놓는 방식 확인 | 동행과 알라 모아나 센터에서 옷을 입어 보고 색과 크기를 확인해요. | 두 사람 / 직원 | 37 | deliverables_week5/G17/files/study/eng2p/docs/parts/G17_authored_lines_v2.md 상황 및 차례 표 | B |
| grocery_store | 83 | A2 | new:grocery_store | 상품 위치 질문 / 담기 동의하고 다음 상품 위치 질문 / 수량 확정 | 필요한 수량 요청 / 수량 요청 / 추가 구매 거절 | 동행과 마트에서 물건 위치와 개수를 묻고 합계를 확인해요. | 두 사람 / 계산 직원 / 직원 | 32 | deliverables_week5/G17/files/study/eng2p/docs/parts/G17_authored_lines_v2.md 상황 및 차례 표 | B |
| pharmacy | 86 | A2 | new:pharmacy | 증상 설명하기 / 증상 시작 시점 알리기 / 다른 약을 먹지 않는다고 알리기 | 확인할 내용 고르기 / 제품 사용법 묻기 / 사용법 위치를 가리켜 달라고 부탁하기 | 동행과 약국에서 궁금한 표시를 읽고 약사에게 물어볼 내용을 정해요. | 두 사람 / 직원 | 37 | deliverables_week5/G17/files/study/eng2p/docs/parts/G17_authored_lines_v2.md 상황 및 차례 표 | B |
| thebus_ride | 89 | A2 | new:bus_stop_kalakaua | 버스 목적지 묻기 / 두 사람 합계 확인하기 / 함께 앉을 자리 알리기 | 두 사람 요금 묻기 / 카드 사용 가능 여부 묻기 / 내릴 때 알려 달라고 부탁하기 | 동행과 버스에서 요금을 확인하고 해변에 내릴 곳을 물어봐요. | 두 사람 / 기사 | 33 | deliverables_week5/G17/files/study/eng2p/docs/parts/G17_authored_lines_v2.md 상황 및 차례 표 | B |
| diamond_head_lookout | 95 | A2 | diamond_head_lookout | 사진 촬영 부탁 / 자기 기기 건네기 / 동행에게 위치 묻기 | 배경 수락과 묘사 / 위치 수락과 설명 / 준비 대답 | 동행과 다이아몬드 헤드 전망대에서 사진을 부탁하고 풍경을 이야기해요. | 두 사람 / 안내인 | 38 | deliverables_week5/G18/files/study/eng2p/docs/parts/G18_authored_lines_v2.md 상황 및 차례 표 | B |
| bank_post_office | 101 | B1 | new:bank_and_post_office | 은행 용건 말하기 / 현금 입금 요청 / 사용할 서류 확인 | 동행자와 절차 확인 계획 / 주소 위치 알려 주기 / 도착일 다시 듣기 요청 | 동행과 은행에서 입금을 확인한 뒤 우체국에서 편지를 보내요. | 두 사람 / 직원 | 33 | deliverables_week5/G17/files/study/eng2p/docs/parts/G17_authored_lines_v2.md 상황 및 차례 표 | B |
| diamond_head_hike | 113 | B1 | diamond_head_trailhead | 코스 추천 부탁 / 예상 소요 시간 묻기 / 동행의 의견 묻기 | 표지 설명 부탁 / 코스 선택 말하기 / 직원에게 확인 제안 | 동행과 다이아몬드 헤드 입구에서 지도를 보고 걷는 길을 물어봐요. | 두 사람 / 안내인 | 36 | deliverables_week5/G18/files/study/eng2p/docs/parts/G18_authored_lines_v2.md 상황 및 차례 표 | B |
| taxi_ride | 119 | B1 | new:taxi_stand | 이동 용건 말하기 / 목적지 이동 요청 / 목적지 주소 제시 | 탑승 전 확인 계획 / 짐 보관 도움 요청 / 소리 크기 조절 요청 | 동행과 택시에서 호텔 주소를 보여 주고 요금과 요청을 확인해요. | 두 사람 / 기사 | 35 | deliverables_week5/G17/files/study/eng2p/docs/parts/G17_authored_lines_v2.md 상황 및 차례 표 | B |
| library_card | 125 | B1 | new:neighborhood_library | 카드 발급 요청 / 이름 말하기 / 서류 제시 | 책 주제 선택 / 반납 시점 질문 / 반납 장소 질문 | 동행과 도서관에서 카드를 만들고 책을 빌릴 때 궁금한 걸 물어봐요. | 두 사람 / 직원 | 37 | deliverables_week5/G17/files/study/eng2p/docs/parts/G17_authored_lines_v2.md 상황 및 차례 표 | B |
| clinic_visit | 131 | B1 | new:clinic | 진료 요청 / 이름 말하기 / 증상 설명 | 동행 관계 알리기 / 대기 수락 / 안내 기록 요청 | 동행과 진료소에 와서 아픈 곳과 기간을 말하고 안내를 확인해요. | 두 사람 / 직원 / 의사 / 간호사 | 35 | deliverables_week5/G17/files/study/eng2p/docs/parts/G17_authored_lines_v2.md 상황 및 차례 표 | B |
| ala_moana_returns | 137 | B1 | ala_moana_center | 반품 요청 / 영수증 내기 / 결제 수단 밝히기 | 이유 설명 / 제안 수락 / 준비 상태 알리기 | 동행과 알라 모아나 센터에서 재킷을 반품하며 이유와 절차를 확인해요. | 두 사람 / 직원 | 38 | deliverables_week5/G17/files/study/eng2p/docs/parts/G17_authored_lines_v2.md 상황 및 차례 표 | B |
| hula_show | 143 | B1 | kapiolani_park | 개인 감상 말하기 / 질문 허락 요청 / 설명 요청 | 방문 목적 대답 / 자리 선택 / 지식 부족 말하기 | 동행과 훌라 공연을 본 뒤 느낌을 나누고 노래 뜻을 물어봐요. | 두 사람 / 안내인 / 안내 직원 | 34 | deliverables_week5/G18/files/study/eng2p/docs/parts/G18_authored_lines_v2.md 상황 및 차례 표 | B |
| surf_lesson | 149 | B1 | waikiki_beach | 경험 말하기 / 장비 점검 요청 / 경고 뜻 묻기 | 들은 지침 확인 / 도움 신호 묻기 / 불안과 필요 설명 | 동행과 서핑 강습 안내를 들으며 궁금한 걸 묻고 참여할지 의논해요. | 두 사람 / 안내인 | 37 | deliverables_week5/G18/files/study/eng2p/docs/parts/G18_authored_lines_v2.md 상황 및 차례 표 | B |
| iolani_palace_tour | 155 | B1 | iolani_palace | 대기 위치 묻기 / 안내 내용 확인 / 추가 자료 위치 묻기 | 준비 알림과 속도 요청 / 낱말 뜻 묻기 / 이해한 상태 알림 | 동행과 이올라니 궁전의 가상 관람 안내를 듣고 표지와 순서를 물어봐요. | 두 사람 / 직원 / 안내인 | 39 | deliverables_week5/G18/files/study/eng2p/docs/parts/G18_authored_lines_v2.md 상황 및 차례 표 | B |
| kamehameha_statue_walk | 161 | B1 | kamehameha_statue | 방향 묻기 / 상대의 표지 확인 묻기 / 자료 내용 확인 | 길 안내 내용 확인 / 표지 읽기 제안 / 낱말 뜻 묻기 | 동행과 카메하메하 동상 근처에서 지도와 안내지를 읽고 길을 물어봐요. | 두 사람 / 직원 / 안내인 | 38 | deliverables_week5/G18/files/study/eng2p/docs/parts/G18_authored_lines_v2.md 상황 및 차례 표 | B |
| phone_and_laundry | 167 | B1 | new:laundromat | 세제 넣는 곳 묻기 / 설정 추천 묻기 / 건조 설정 묻기 | 세제 양 묻기 / 포함 요금 확인 / 문의 목적 밝히기 | 동행과 세탁소에서 기계 사용을 확인한 뒤 휴대폰 요금을 물어봐요. | 두 사람 / 직원 | 36 | deliverables_week5/G17/files/study/eng2p/docs/parts/G17_authored_lines_v2.md 상황 및 차례 표 | B |
| hanauma_bay_snorkel | 173 | B1 | hanauma_bay | 질문 허락 묻기 / 장비 빌리기 요청 / 도움 신호 뜻 묻기 | 안전 규칙 재설명 요청 / 착용 문제 설명 / 신호 연습 확인 요청 | 동행과 하나우마 베이 안내를 듣고 장비와 참여 선택을 확인해요. | 두 사람 / 직원 / 안내인 | 35 | deliverables_week5/G18/files/study/eng2p/docs/parts/G18_authored_lines_v2.md 상황 및 차례 표 | B |
| pearl_harbor_visit | 185 | B1 | pearl_harbor_visitor_center | 표 필요 여부 질문 / 요금 유무 질문 / 가방 처리 질문 | 시작 시각 질문 / 선택 시간 요청 / 느리게 반복 요청 | 동행과 진주만 방문자 센터에서 자료를 보고 방문 일정을 의논해요. | 두 사람 / 직원 | 36 | deliverables_week5/G18/files/study/eng2p/docs/parts/G18_authored_lines_v2.md 상황 및 차례 표 | B |
| north_shore_shrimp_truck | 191 | B1 | giovannis_shrimp_truck | 메뉴 요청 / 동행에게 나눠 먹기 제안 / 배고픔 설명과 수량 결정 | 각자 먹기 선호 / 맵기 선택 / 매운 소스 제외 선택 | 동행과 새우 푸드트럭에서 양과 소스 제공 방식을 의논하고 주문해요. | 두 사람 / 직원 | 37 | deliverables_week5/G18/files/study/eng2p/docs/parts/G18_authored_lines_v2.md 상황 및 차례 표 | B |
| sunset_beach_day | 197 | B1 | sunset_beach | 방문 목적 말하기 / 파도 상태 질문 / 상대 의향 묻기 | 적용 범위 질문 / 파도 비교 묘사 / 관찰 선택과 제안 | 동행과 선셋 비치에서 안내문을 확인하고 노을을 어떻게 볼지 의논해요. | 두 사람 / 안내인 | 38 | deliverables_week5/G18/files/study/eng2p/docs/parts/G18_authored_lines_v2.md 상황 및 차례 표 | B |
| eggs_n_things_special_requests | 203 | B2 | eggs_n_things_saratoga | 알레르기 알리고 성분 확인 요청 / 조리 담당자 확인 요청 / 이유에 따라 음식 주문하지 않기 | 음식 주문과 재료 제외 요청 / 제공 방식 동의와 이유 말하기 / 잘못 나온 재료 정중히 지적 | 동행과 에그스 앤 띵스에서 성분과 요청을 확인하고 잘못 나온 주문을 알려요. | 두 사람 / 서빙 직원 | 42 | deliverables_week5/G19/files/study/eng2p/docs/parts/G19_authored_lines_v2.md 상황 및 차례 표 | B |
| polynesian_cultural_center | 209 | B2 | polynesian_cultural_center | 방문 목적 말하기 / 선호와 상대 의견 묻기 / 결정 전 순서 설명 요청 | 활동 비교 질문 / 동의와 이유 / 설명 요약과 확인 | 동행과 문화센터에서 설명과 공연을 비교하고 다음 일정을 의논해요. | 두 사람 / 안내인 | 36 | deliverables_week5/G19/files/study/eng2p/docs/parts/G19_authored_lines_v2.md 상황 및 차례 표 | B |
| airport_rental_car | 215 | B2 | new:honolulu_airport | 예약 정보 제공 / 운전자와 동행자 구분 / 서류 제출과 누락 확인 | 보험 범위 설명 요청 / 보험 거절 시 합계 확인 / 합계 확인과 사본 요청 | 동행과 공항 렌터카 창구에서 조건을 읽고 비용과 반납을 확인해요. | 두 사람 / 직원 | 36 | deliverables_week5/G19/files/study/eng2p/docs/parts/G19_authored_lines_v2.md 상황 및 차례 표 | B |
| apartment_hunting | 221 | B2 | new:apartment_viewing | 비교 목적 설명 / 소음 직접 확인 요청 / 보증금과 납부 시점 질문 | 공간 필요 설명 / 가능성 평가와 비용 확인 / 비용 비교 자료 요청 | 동행과 집을 보러 와서 공간과 비용을 비교하고 궁금한 조건을 물어봐요. | 두 사람 / 직원 | 39 | deliverables_week5/G19/files/study/eng2p/docs/parts/G19_authored_lines_v2.md 상황 및 차례 표 | B |
| lei_day | 228 | B2 | kapiolani_park | 안내표 설명 요청 / 공동 확인 제안 / 이름표 정보 범위 확인 | 부탁 범위 확인 / 설명을 듣고 싶은 목적 / 설명 요약과 확인 | 동행과 레이 데이 활동 안내를 듣고 전시물과 질문 순서를 확인해요. | 두 사람 / 안내인 | 37 | deliverables_week5/G19/files/study/eng2p/docs/parts/G19_authored_lines_v2.md 상황 및 차례 표 | B |
| dole_plantation | 233 | B2 | dole_plantation | 전체 진행 설명 요청 / 들은 설명 요약 확인 / 질문을 위한 대기 제안 | 그림과 순서 종합 확인 / 투어와 구매의 독립성 질문 / 별도 방문과 결정 연기 제안 | 동행과 돌 플랜테이션에서 관람 순서를 묻고 가게에서 선물을 골라요. | 두 사람 / 계산 직원 / 직원 / 안내인 | 37 | deliverables_week5/G19/files/study/eng2p/docs/parts/G19_authored_lines_v2.md 상황 및 차례 표 | B |
| manoa_falls_hike | 239 | B2 | manoa_falls | 날씨 정보의 변화 질문 / 정보 한계의 영향 설명 요청 / 주의 안내문 내용 요약 | 주의 안내의 뜻 요약 확인 / 동행에게 안내 요약 요청 / 후속 정보의 예상 시점 질문 | 동행과 마노아 폭포 길 입구에서 새 안내를 기다리며 계획을 의논해요. | 두 사람 / 안내인 | 38 | deliverables_week5/G19/files/study/eng2p/docs/parts/G19_authored_lines_v2.md 상황 및 차례 표 | B |
| hospital_emergency | 245 | B2 | new:hospital_er | 증상과 악화 경위 설명 / 대략 시각과 지속 설명 / 현재 위치와 표현 한계 설명 | 동행자의 관찰 범위 설명 / 관찰한 행동 순서 설명 / 동행자와 서류 전달 권한 설명 | 동행과 응급실에 와서 아픈 경위와 본 일을 말하고 접수 안내를 확인해요. | 두 사람 / 간호사 | 40 | deliverables_week5/G19/files/study/eng2p/docs/parts/G19_authored_lines_v2.md 상황 및 차례 표 | B |
| hanauma_bay_conservation | 257 | B2 | hanauma_bay | 보호 안내의 이유 질문 / 보호 이유 요약 / 조건을 둔 확인 질문 | 안내 이유 질문 / 이유를 든 의견 / 보호 이유를 동행에게 전달 | 동행과 하나우마 베이의 가상 보호 설명을 듣고 이유와 선택을 이야기해요. | 두 사람 / 안내인 | 40 | deliverables_week5/G19/files/study/eng2p/docs/parts/G19_authored_lines_v2.md 상황 및 차례 표 | B |
| kamehameha_day | 263 | B2 | kamehameha_statue | 진행 설명 요청 / 진행과 이유 요약 / 동행에게 필요한 도움 묻기 | 예절 안내의 이유 확인 / 장점과 선호를 함께 말하기 / 배경 설명의 필요 말하기 | 동행과 카메하메하 대왕의 날 설명을 기다리며 질문 순서와 의견을 나눠요. | 두 사람 / 안내인 | 40 | deliverables_week5/G19/files/study/eng2p/docs/parts/G19_authored_lines_v2.md 상황 및 차례 표 | B |
| kailua_lanikai_day | 269 | B2 | lanikai_beach | 원하는 하루 설명 / 확인할 조건 설명 / 동행의 식사 선호 묻기 | 필요에 따른 여유 제안 / 준비 선호와 이유 설명 / 준비 수락과 부담 조건 | 동행과 라니카이 비치 나들이를 준비하며 음식과 활동 순서를 의논해요. | 두 사람 / 안내인 | 38 | deliverables_week5/G19/files/study/eng2p/docs/parts/G19_authored_lines_v2.md 상황 및 차례 표 | B |
| dukes_celebration | 275 | B2 | dukes_waikiki | 날짜 시간 인원 밝히며 예약 요청 / 예약 이름 전하고 시간 확인 요청 / 동행에게 일정 재확인 | 기념일 알리고 예약 메모 요청 / 변경 제안과 이유 설명 / 가능 여부를 배려하며 창가 요청 | 동행과 듀크스 기념일 저녁을 예약하고 시간과 자리 요청을 의논해요. | 두 사람 / 안내 직원 | 37 | deliverables_week5/G19/files/study/eng2p/docs/parts/G19_authored_lines_v2.md 상황 및 차례 표 | B |
| ala_moana_gift_shopping | 281 | B2 | ala_moana_center | 받는 사람과 선물 조건 설명 / 크기 이외의 차이 묻기 / 이유를 들어 예상 답하기 | 취향을 전하고 조언 구하기 / 받는 사람의 사용 예상 묻기 / 이유를 들어 선호 말하기 | 동행과 알라 모아나 센터에서 선물을 고르고 포장과 배송을 확인해요. | 두 사람 / 직원 | 37 | deliverables_week5/G19/files/study/eng2p/docs/parts/G19_authored_lines_v2.md 상황 및 차례 표 | B |
| diamond_head_sunrise | 287 | B2 | diamond_head_trailhead | 입장 계획 확인 요청 / 두 사람의 물품 확인 질문 / 함께 확인한 준비 보고 | 시간 요청과 함께 확인 제안 / 준비 확인과 속도 선호 설명 / 두 사람의 출발 준비 최종 확인 | 동행과 다이아몬드 헤드 입구에서 준비를 확인하고 일 년의 연습을 돌아봐요. | 두 사람 / 안내인 | 41 | deliverables_week5/G19/files/study/eng2p/docs/parts/G19_authored_lines_v2.md 상황 및 차례 표 | B |

## 기존 아홉 메타를 짧은 줄로 제안한 이유

기존 아홉은 가격·절차를 설명하는 긴 가상 상황 메타예요. 모두 -다 체이고 일부는 영어를 포함하며 70자보다 길어 화면용 해요체 한 문장 규칙과 다르므로 짧은 줄을 별도로 제안했어요. 긴 원문은 삭제하거나 고치지 않고 long form에 그대로 남겨요.

| 미션 | 기존 chars | 70자 이하 | 해요체 | 결정과 이유 |
|---|---:|---|---|---|
| cafe_order | 135 | no | no | 짧은 화면 문장만 제안하고 긴 원문은 그대로 보존해요. 가상 금액이나 정책이 답으로 미리 보이지 않게 해요. |
| cookie_snack | 233 | no | no | 짧은 화면 문장만 제안하고 긴 원문은 그대로 보존해요. 가상 금액이나 정책이 답으로 미리 보이지 않게 해요. |
| shave_ice_snack | 94 | no | no | 짧은 화면 문장만 제안하고 긴 원문은 그대로 보존해요. 가상 금액이나 정책이 답으로 미리 보이지 않게 해요. |
| leonards_malasadas | 108 | no | no | 짧은 화면 문장만 제안하고 긴 원문은 그대로 보존해요. 가상 금액이나 정책이 답으로 미리 보이지 않게 해요. |
| food_truck_lunch | 104 | no | no | 짧은 화면 문장만 제안하고 긴 원문은 그대로 보존해요. 가상 금액이나 정책이 답으로 미리 보이지 않게 해요. |
| pharmacy_basic | 167 | no | no | 짧은 화면 문장만 제안하고 긴 원문은 그대로 보존해요. 가상 금액이나 정책이 답으로 미리 보이지 않게 해요. |
| cheesecake_dessert | 103 | no | no | 짧은 화면 문장만 제안하고 긴 원문은 그대로 보존해요. 가상 금액이나 정책이 답으로 미리 보이지 않게 해요. |
| diamond_head_lookout_directions | 95 | no | no | 짧은 화면 문장만 제안하고 긴 원문은 그대로 보존해요. 가상 금액이나 정책이 답으로 미리 보이지 않게 해요. |
| hanauma_bay_gear_rental | 180 | no | no | 짧은 화면 문장만 제안하고 긴 원문은 그대로 보존해요. 가상 금액이나 정책이 답으로 미리 보이지 않게 해요. |

## B와 적용 한계

입문 알라 모아나는 크기와 값을 묻는 구매, 후기 옷 장은 입어 보고 색을 비교, 반품 장은 재킷과 환불, 선물 장은 포장과 배송으로 구별해요. 다이아몬드 헤드는 길 묻기·사진·지도 걷기·새벽 준비와 연간 회상으로, 하나우마는 대여 여부·영상 뒤 참여 선택·보호 이유로 구별해요. A/B는 그날 고정 자리이고 특정 컴퓨터나 사람 성별을 뜻하지 않아요. 약국·진료소·응급실은 실제 약효·진단·치료를 미리 정하지 않아요.
