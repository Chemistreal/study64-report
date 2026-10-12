# G10 결과 보고

현재 입력 원문의 첫 공개 18개와 G2/G3/G5 37개, 총 55개 미션을 기계 검사한 뒤 문맥으로 다시 읽었다. 대사 1,976줄, 연습 649개, 점수 차례 627개와 모든 비점수 차례·갈래·상황을 읽었다. G8/G9 교체안은 이 감사에 적용하지 않았다.

## 검사별 발견

| 검사 | 확정 | 유보/조건부 | 설명 |
| --- | --- | --- | --- |
| 참조 | 0 | 0 | 모든 갈래·차례·연습의 ID와 종류, 중복 원천을 검사 |
| 도달 | 0 | 0 | 선택 가능한 갈래의 NPC 목표까지 발생별로 도달 |
| 막힘 | 0 | 0 | 마지막 전의 빈 차례/말단 없음. 대답이 없이 거래가 이어지는 의미 문제와 구분 |
| 순환 | 0 | 0 | 차례/phase별 위상 정렬. 재사용 줄 ID를 가짜 순환으로 세지 않음 |
| 이미 답한 공유 질문 | 1 | 0 | marukame t10 카드 선택 뒤 t11 같은 결제 질문 |
| 선행 정보 | 7 | 13 | 대명사, 선택 대상, 미정 물품, 가상 견적 범위 등 |
| 응답/거래 흐름 | 20 | 1 | 재청취 후 답 누락과 거절 뒤 거래 등 |
| 자리 35% | 1 | 27미션의 47자리 | clinic B20%는 확정. 나머지는 누구든 배정에 따른 위험 |
| 25~40줄 | 1 | 0 | hotel 42줄 |
| 8~14점수 차례 | 3 | 0 | neighbor 7, foodtruck 15, cheesecake 15 |
| 새말 4개 상한 | 0 | 0 | 기존 B1/B2보다 엄격한 상한도 통과 |

문맥 확정 28건과 유보 14건이다. 기계 확정은 수량4건과 자리1건이며 문맥 발견에 중복 계산하지 않았다. 누구든을 반씩 나누었다고 가정해서 실제 비중을 만들지 않았다. 자리 위험 47개는 47개 미션이나 실측 실패가 아니다.

## 미션별 집계

| 미션 | 줄 | 점수 | A/B/누구든 | 반복 | 정보 | 대화 | 유보 | 수량 | 자리 확정/조건 | 확정 합계 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| eggs_n_things_breakfast | 37 | 13 | 2/2/9 | 0 | 1 | 2 | 0 | 0 | 0/2 | 3 |
| cookie_snack | 31 | 14 | 3/3/8 | 0 | 0 | 1 | 3 | 0 | 0/2 | 1 |
| shave_ice_snack | 34 | 14 | 3/3/8 | 0 | 0 | 1 | 1 | 0 | 0/2 | 1 |
| musubi_day | 33 | 14 | 4/3/7 | 0 | 0 | 1 | 0 | 0 | 0/2 | 1 |
| leonards_malasadas | 32 | 14 | 4/3/7 | 0 | 0 | 1 | 1 | 0 | 0/2 | 1 |
| food_truck_lunch | 35 | 15 | 5/4/6 | 0 | 0 | 1 | 1 | 1 | 0/2 | 2 |
| cheesecake_dessert | 34 | 15 | 5/4/6 | 0 | 0 | 1 | 1 | 1 | 0/2 | 2 |
| neighbor_greeting | 25 | 7 | 1/1/5 | 0 | 0 | 1 | 0 | 1 | 0/2 | 2 |
| hotel_front_desk | 42 | 13 | 1/1/11 | 0 | 1 | 0 | 1 | 1 | 0/2 | 2 |
| cafe_order | 39 | 11 | 4/3/4 | 0 | 0 | 2 | 1 | 0 | 0/1 | 2 |
| convenience_store_abc | 28 | 9 | 3/2/4 | 0 | 0 | 1 | 0 | 0 | 0/2 | 1 |
| pharmacy_basic | 30 | 8 | 4/2/2 | 0 | 1 | 2 | 0 | 0 | 0/1 | 3 |
| bus_fare_question | 27 | 8 | 2/2/4 | 0 | 0 | 0 | 0 | 0 | 0/2 | 0 |
| ala_moana_basic_shopping | 31 | 11 | 3/2/6 | 0 | 0 | 0 | 0 | 0 | 0/2 | 0 |
| waikiki_beach_chair_umbrella | 30 | 12 | 3/2/7 | 0 | 1 | 0 | 0 | 0 | 0/2 | 1 |
| honolulu_zoo_ticket | 31 | 10 | 3/2/5 | 0 | 0 | 1 | 0 | 0 | 0/2 | 1 |
| diamond_head_lookout_directions | 33 | 12 | 2/2/8 | 0 | 0 | 0 | 1 | 0 | 0/2 | 0 |
| hanauma_bay_gear_rental | 35 | 13 | 3/3/7 | 0 | 0 | 2 | 1 | 0 | 0/2 | 2 |
| dukes_dinner | 40 | 12 | 3/3/6 | 0 | 0 | 0 | 0 | 0 | 0/2 | 0 |
| marukame_udon | 40 | 12 | 4/3/5 | 1 | 0 | 0 | 0 | 0 | 0/2 | 1 |
| ala_moana_shopping | 35 | 10 | 6/3/1 | 0 | 0 | 0 | 0 | 0 | 0/1 | 0 |
| grocery_store | 39 | 11 | 6/5/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| pharmacy | 33 | 8 | 4/4/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| thebus_ride | 35 | 8 | 4/4/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| bank_post_office | 37 | 13 | 7/6/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| taxi_ride | 36 | 13 | 7/5/1 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| library_card | 40 | 10 | 6/3/1 | 0 | 0 | 0 | 0 | 0 | 0/1 | 0 |
| clinic_visit | 39 | 10 | 8/2/0 | 0 | 0 | 0 | 1 | 0 | 1/0 | 1 |
| ala_moana_returns | 40 | 10 | 5/5/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| phone_and_laundry | 39 | 10 | 5/5/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| diamond_head_lookout | 39 | 12 | 7/3/2 | 0 | 0 | 0 | 0 | 0 | 0/1 | 0 |
| diamond_head_hike | 37 | 13 | 7/5/1 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| surf_lesson | 38 | 11 | 6/5/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| hanauma_bay_snorkel | 40 | 12 | 6/6/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| iolani_palace_tour | 37 | 9 | 3/2/4 | 0 | 0 | 0 | 0 | 0 | 0/2 | 0 |
| kamehameha_statue_walk | 36 | 10 | 4/4/2 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| pearl_harbor_visit | 38 | 11 | 5/4/2 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| north_shore_shrimp_truck | 40 | 12 | 5/4/3 | 0 | 0 | 0 | 0 | 0 | 0/1 | 0 |
| sunset_beach_day | 39 | 12 | 5/5/2 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| aloha_festival_parade | 33 | 10 | 3/2/5 | 0 | 0 | 0 | 0 | 0 | 0/2 | 0 |
| hula_show | 40 | 12 | 5/3/4 | 0 | 0 | 0 | 0 | 0 | 0/1 | 0 |
| eggs_n_things_special_requests | 37 | 12 | 5/7/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| polynesian_cultural_center | 39 | 12 | 6/6/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| airport_rental_car | 40 | 11 | 7/4/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| apartment_hunting | 40 | 11 | 6/5/0 | 0 | 1 | 1 | 0 | 0 | 0/0 | 2 |
| lei_day | 39 | 12 | 6/6/0 | 0 | 1 | 0 | 1 | 0 | 0/0 | 1 |
| dole_plantation | 40 | 10 | 5/5/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| manoa_falls_hike | 34 | 10 | 5/5/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| hospital_emergency | 40 | 11 | 7/4/0 | 0 | 0 | 1 | 0 | 0 | 0/0 | 1 |
| hanauma_bay_conservation | 36 | 12 | 6/6/0 | 0 | 0 | 1 | 1 | 0 | 0/0 | 1 |
| kamehameha_day | 35 | 12 | 6/6/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| kailua_lanikai_day | 34 | 12 | 7/5/0 | 0 | 1 | 0 | 0 | 0 | 0/0 | 1 |
| dukes_celebration | 35 | 12 | 7/5/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| ala_moana_gift_shopping | 37 | 13 | 7/6/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |
| diamond_head_sunrise | 33 | 13 | 7/6/0 | 0 | 0 | 0 | 0 | 0 | 0/0 | 0 |

먼저 볼 다섯 미션: eggs_n_things_breakfast (확정 3, 유보 0), pharmacy_basic (확정 3, 유보 0), cafe_order (확정 2, 유보 1), cheesecake_dessert (확정 2, 유보 1), food_truck_lunch (확정 2, 유보 1). 확정 수, 유보 수, ID로 동률을 정했고 조건부 자리 위험은 확정 수에서 뺐다. 객관적인 학습 실패 빈도 순위가 아니다.

## 수정 제안과 동시 제약

마루카메는 t10을 기존 합계 질문 mud-35/36으로 두고 t11에서 mud-33/34로 결제 방법을 한 번만 고르는 현재 모델 지원안을 제안했다. 모든 40줄과 기능·12차례·도달성을 보존하며 합계를 먼저 확인하는 순서 변화가 있다. 원래 즉시 카드 선택을 유지하는 별도 설계는 조건별 진행 상태가 필요하다.

hospital_emergency의 확인 질문은 기존 her-37에 her-35 갈래를 추가하는 안이다. clinic은 증상 발화를 환자 A에게 유지하고 t9 안내 도움 요청을 B로 옮기며 동행 관계 알림 clv-40/새 t0 한 개를 추가하는 안이다. 40줄/11차례/A7 B4로 B36.36%를 보장한다. neighbor는 환영 감사 ng-26/새 t6b로 26줄/8차례가 되며 별도 자리 배정안과 함께 A3 B4 누구든1을 만들 수 있다. 새 영어와 zoo의 확인 재질문 제거 문구는 실제 영어 관문과 엄격한 길이·새말 상한을 통과했다.

누구든 차례를 제한하는 27개 미션의 최소 수량 배정안을 정확한 차례 ID로 제시했다. 고정 배정의 의미·후보 인물·이름 지칭과 다른 구조 변경을 함께 검토해야 하며, 원래 영어와 기능을 자동 변경하지 않았다. 실제 플레이 기록과 배정 보장을 구분했다.

호텔 42줄은 기존 ID·기능 전부 보존과 40줄 상한을 동시에 만족하는 삭제안이 없다. 두 15차례 미션도 서로 다른 플레이어 발화를 대안 하나로 합치거나 NPC로 바꾸면 기능을 잃는다. 이 세 건은 분할·세부 단계 규격 또는 상한 예외를 담당 검토자가 정한 뒤 다시 검사해야 하는 적용 보류 설계안으로 남겼다. 해결됐다고 주장하지 않았다.

재청취/가격 문의의 답을 받으려면 기존 원 차례 안에서 질문·답변 phase를 재개하고 결과는 한 번만 기록하는 방식이 우선이다. 새 점수 차례를 무작정 붙이면 14 상한을 깨뜨린다. 현행 갈래는 NPC 한 줄만 재생하며 다른 차례로 점프하거나 원 후보로 돌아가지 않는다. 필요한 응답/조건부 진행 상태의 저작·로더·판정·노트북 동기화 코드는 이 글 결과에서 구현하지 않았다.

## 재실행과 실제 검사

선택 스크립트 G10_audit.py는 Python3 표준 라이브러리만 쓰고 원본을 읽는다. 본 표는 수정 전 감사다. 기본 종료0은 감사 실행 성공일 뿐 발견0 판정이 아니며 --strict를 쓰면 현재 발견 때문에 종료1이 맞다. 파싱은 55장 전체 메타·본문·연습·차례가 기존 parser와 일치한다. 새말 introduces도 1,976줄 모두 기존 계산과 같다. 처음 표 헤더 id를 줄로 세던 문제는 원문 수량 대조로 잡아 고쳤으며 최종 수량은 1,976이다. 제목에 잘못 들어간 한자 한 글자는 문자 관문에서 잡아 고친 뒤 문서 관문을 다시 통과했다.

`python3 G10_audit.py --selftest`의 16개 오류/정상 사례가 통과했다. 참조 누락·고아 줄·빈 차례·중복 줄/갈래 원천·잘못된 줄 종류·자리/수량/새말 경계와, 정상 ID 재사용 및 갈래 전용 NPC 도달을 검사한다. 지원 가능한 수정안 32개는 별도 메모리 복사본에서 ID·기능 보존과 도달/비중을 검사했다(자리27개 + 마루카메/병원/clinic/neighbor/zoo 5개). 모델 확장안과 적용 보류 설계를 코드 실행으로 검증한 것은 아니다. 새 문구 실제 계산:

- clv-40: 낱말 3개, 새말 [], 한 단계 말 []
- ng-26: 낱말 3개, 새말 [], 한 단계 말 []
- hz-08: 낱말 2개, 새말 ['tickets'], 한 단계 말 ['tickets']

관문은 원래 대본 JSON으로 52개 누락 대본을 복원하고 원래 G2/G3/G5를 합친 시험 복사본에서 돌렸다. 이후 미션 집필 표기는 그 복사본에서만 완료로 맞췄다. 모든 원본과 sessions/acts 바이트는 그대로다. 구조/문구 제안은 복사본 본 데이터에도 적용하지 않고 제안 파일만 추가했다.

`python3 eng2p/scripts/derive_authored.py` - 종료 0

```text
[알림] hsh-39: 줄 전체가 말뭉치에 있다. 말뭉치 근거로 쓰면 corpus 다
[알림] hbc-31: 말뭉치와 6낱말 이어서 같다
out/game/authored.json / 줄 1976 (점검 A 1535, B 441) / 연습 649 / state/authored_b.md / 실패 0
```

`python3 eng2p/scripts/derive_outings.py` - 종료 0

```text
out/game/outings.json / 첫 공개 미션 18 (생활 14, 여행 4) / 이후 37 / 집필 18 / 실패 0
```

`python3 eng2p/scripts/check_authored.py` - 종료 0

```text
지은 영어 판 8 / 나들이 55장 / 줄 1976 (점검 A 1535, B 441) / 미션 18 / 실패 0
```

`python3 eng2p/scripts/check.py /workspace/scratch/2320b65bceac/round3/work/study/eng2p/docs/parts/G10_structure_audit.md /workspace/scratch/2320b65bceac/round3/work/study/eng2p/docs/parts/G10_structure_fixes.md` - 종료 0

```text

검사 2개 파일 / 실패 0 / 경고 0
```

## 전체 검사와 남은 한계

`python3 -u scripts/all.py --jobs 4 --timeout 120`도 끝까지 실행했다. 전체는 통과하지 못했다.

```text
137.3초 / 146개 중 실패 55개 (건너뜀 42개 포함) / 병렬 4
```

실패한 단계(건너뜀 포함)는 다음과 같다.

```text
derive_audiolen.py
derive_ext_radio.py
derive_ext_smalltalk.py
derive_media_manifest.py
check_derived.py
check.py
check_media.py
check_sound.py
check_audio.py
check_ground.py
check_rights.py
check_ui.js
check_friction.js
check_pages.py
check_contrast.js
check_write.js
check_unused.js
derive_game.js
check_authored.py
check_streak.js
check_badge.js
check_relation.js
check_growth.js
check_ahead.js
check_year.js
check_track.js
check_adapt.js
check_role.js
check_versus.js
check_reach.js
check_late.js
check_split.js
check_beat.js
check_sound_screen.js
check_cando.js
check_tone.js
check_wait.js
check_store.js
check_a11y.js
check_print.js
check_size.js
check_find.js
check_keys.js
check_graphic.js
check_midnight.js
check_input.js
check_scale.js
check_supply.js
check_perf.js
check_session.js
check_pair.js
check_play_screen.js
rehearse.js
rehearse_session.js
rehearse_pair.js
```

입력에서 빠진 오디오·외부 자료·카탈로그·권리 근거·복원 대본 신뢰도, 브라우저/크로미움 실행 조건, 기존 근거 비율과 이미 완료된 dukes_dinner를 다시 완료로 만드는 --break 조건 등이 남았다. 건너뜀을 통과로 세지 않았다. G9에서 시간 초과했던 check_tick_e2e는 이번에는 106초에 끝났지만 전체 자료 조건은 여전히 통과하지 못했다.

스크립트는 의미·대명사의 뜻·문맥별 같은 질문·실제 메뉴·가격·안전·진료·계약 사실·장면의 몸짓·물품 상태·사람의 학습과 음성 인식을 판단하지 못한다. 기계 반복 후보는 재독 뒤 정상 반복과 고장을 구분했다. 의미 재독도 현지 원어민·교사의 인증이 아니고 실제 원문 구현/말하기/두 노트북/PC 빌드/성능은 미검증이다. Miss에서 갈래 설명이 생략되는 공통 제한도 남는다.

허용된 신규 감사표·수정 제안·작은 Python 스크립트만 반환했다. 원본 바이트 보존, 신규 add 경로·덮어쓰기 없음, SHA-256·UTF-8/LF·800KB 상한·zip CRC·목록 일치를 확인했다. 사진·음성·토큰·비밀번호는 넣지 않았다.
