# G9 결과 보고

첫 공개 18개 미션의 영어 587줄과 한국어 풀이 587개, 연습 영어 177개와 연습 풀이 177개를 각각 모두 읽었다. 점수 차례 213개와 모든 비점수 차례·갈래도 읽었다. 원문과 검토 기록의 모든 ID·영어·한국어·원래 A/B가 정확히 한 번씩 일치하는지 대조했다. 읽은 수량과 자동 검사는 원어민 인증이 아니다.

문제 70줄, 판단 유보 25줄, 문구 교체안 64줄이다. 영어 교체 5줄이며 한국어만 교체하는 안은 나머지다. 문제 표의 구조 문제는 문구 교체안과 구분했다. 독립적인 연습 풀이 결함은 발견하지 못했고 본문과 같은 결함은 연결 연습에도 맞추되 중복 집계하지 않았다.

## 미션별 집계

| 미션 | 영어/풀이 | 연습 영어/풀이 | 점수 차례 | 문제 | 유보 | 교체안 |
| --- | --- | --- | --- | --- | --- | --- |
| eggs_n_things_breakfast | 37 | 10 | 13 | 4 | 1 | 4 |
| cookie_snack | 31 | 8 | 14 | 3 | 2 | 3 |
| shave_ice_snack | 34 | 8 | 14 | 1 | 2 | 1 |
| musubi_day | 33 | 8 | 14 | 4 | 1 | 3 |
| leonards_malasadas | 32 | 8 | 14 | 3 | 1 | 2 |
| food_truck_lunch | 35 | 8 | 15 | 8 | 0 | 7 |
| cheesecake_dessert | 34 | 8 | 15 | 0 | 1 | 0 |
| neighbor_greeting | 25 | 8 | 7 | 3 | 0 | 3 |
| hotel_front_desk | 42 | 21 | 13 | 6 | 0 | 6 |
| cafe_order | 39 | 21 | 11 | 3 | 0 | 3 |
| convenience_store_abc | 28 | 8 | 9 | 4 | 2 | 4 |
| pharmacy_basic | 30 | 8 | 8 | 5 | 0 | 4 |
| bus_fare_question | 27 | 8 | 8 | 0 | 0 | 0 |
| ala_moana_basic_shopping | 31 | 8 | 11 | 7 | 0 | 7 |
| waikiki_beach_chair_umbrella | 30 | 9 | 12 | 1 | 2 | 0 |
| honolulu_zoo_ticket | 31 | 10 | 10 | 2 | 1 | 2 |
| diamond_head_lookout_directions | 33 | 10 | 12 | 3 | 9 | 3 |
| hanauma_bay_gear_rental | 35 | 8 | 13 | 13 | 3 | 12 |

먼저 볼 세 미션: hanauma_bay_gear_rental (문제 13줄, 유보 3줄), food_truck_lunch (문제 8줄, 유보 0줄), ala_moana_basic_shopping (문제 7줄, 유보 0줄). 문제 줄 수, 유보 줄 수, ID로 동률을 정했다. 영어 자체의 오류 순위가 아니라 풀이·흐름을 포함한 작업 순위다.

## 학습 순서와 뜻풀이

낱말 등급표는 A1/A2/B1/B2의 근사 등급이고 명시적인 교수 세션이 없다. 세션 표와 듣기 대본을 대조한 첫 노출은 교수 날짜나 숙달 증거가 아니므로 아직 안 들은 짧은 A1 말 모두를 오류로 세지 않았다. 실제 뜻을 막을 수 있는 have의 주문 청크, plate의 한 끼 메뉴 뜻, aloha의 인사 뜻, snorkel의 장비 뜻 네 항목을 모두 적었다. have는 세션 16에서 소유 뜻으로 먼저 나오지만 주문 의미를 배웠다는 증거가 아니며, plate의 듣기 첫 등장은 미션보다 늦다. aloha/snorkel은 예정 말뭉치 첫 노출이 없다. 명시적인 교수 일정 위반은 이 입력만으로 확정하지 않았다.

한국어가 주문을 허락 질문으로 바꾼 부분, 당신 호칭, 크기 발음 표기, 동행 반말·존대 혼용, 계단 위치와 올라가는 행동의 혼동, 닭고기 조리법을 좁히는 풀이와 불투명한 장비 명칭을 검토했다. 음식·물품의 일반 한국어 차용어까지 금지하지 않았다. B 영어의 풀이만 고칠 때는 원래 영어 selfCheck와 이유를 유지했다. 실제 가격·규칙·길·안전 정보를 새로 만들지 않았다.

## 실제 검사

시험 복사본에서 빠진 대본 52개를 out/data/transcripts.json의 영어로 복원하고 원래 G2/G3/G5 대사·낱말을 합쳐 55개 미션 조건을 만들었다. 이후 37개 미션의 집필 상태는 복사본에서만 완료로 표시했다. 원본은 그대로다. G9 교체안 64개와 연결 연습 13개만 복사본에 적용했다. ID·기능·인물·등급·장면·갈래·차례·연습 연결은 유지했고 G2/G3/G5 내용은 입력과 같다. sessions/acts 바이트도 입력과 같다. 시험용 표 조립 중 연습의 한국어 칸 위치 오류는 불변 검사에서 잡았고 칸을 바로잡아 최종 불변 검사와 관문을 다시 통과했다.

명령의 작업 폴더는 시험 복사본 study다.

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

`python3 eng2p/scripts/check.py /workspace/scratch/2320b65bceac/round3/work/study/eng2p/docs/parts/G9_review_first_release.md /workspace/scratch/2320b65bceac/round3/work/study/eng2p/docs/parts/G9_fixes.md` - 종료 0

```text

검사 2개 파일 / 실패 0 / 경고 0
```

`python3 /workspace/scratch/2320b65bceac/round3_candidate_check.py /workspace/scratch/2320b65bceac/round3_staging/G9_candidates.json` - 종료 0

```text
  },
  "fail": []
}
```

후보 검사는 원래 미션 관문과 더 엄격한 길이(A1 8/A2 10/B1 14/B2 18), 새말 4개 상한을 모두 통과했다. 낱말 등급을 내리거나 새 등급을 만들지 않았다. 각 그룹의 저장 초안을 재검증했으며 마지막의 존대·장비 의미 통일 후보도 다시 통과했다.

전체 검사 `python3 -u scripts/all.py --jobs 4 --timeout 120`도 실행했다. 처음 시도는 요약 없이 끝나 재실행했고, 재실행의 완료 출력을 아래에 적었다. check_tick_e2e.py는 120초 시간 초과가 추가로 남았다. 전체는 통과하지 못했다. 마지막 출력:

```text

172.4초 / 146개 중 실패 56개 (건너뜀 42개 포함) / 병렬 4

```

실패로 표시된 걸음:

```text
[  8/148] 실패    0.2초 derive_audiolen.py
[ 40/148] 실패    0.2초 derive_ext_radio.py
[ 46/148] 실패    0.2초 derive_media_manifest.py
[ 47/148] 실패    3.2초 check_derived.py
[ 48/148] 실패    0.2초 check_pages.py
[ 56/148] 실패    1.0초 derive_game.js
[ 64/148] 실패    2.4초 check.py
[ 71/148] 실패    0.1초 check_media.py
[ 73/148] 실패    0.2초 check_sound.py
[ 75/148] 실패    0.1초 check_audio.py
[ 78/148] 실패    0.3초 check_ground.py
[123/148] 실패    0.2초 check_rights.py
[144/148] 실패   21.3초 check_authored.py
[145/148] 실패  120.2초 check_tick_e2e.py
```

전체 실패에는 입력에서 빠진 오디오·카탈로그·권리 근거·외부 자료, 복원 대본의 신뢰도 메타데이터, 브라우저 실행 환경, 기존 근거 비율 조건과 완료 상태를 다시 완료로 만드는 기존 --break 시험 조건이 남는다. 이 실패와 건너뜀을 통과로 계산하지 않았다. 허용 범위 밖 검사기와 원본을 고쳐 통과처럼 만들지 않았다.

## 남은 판단

재청취 뒤 주문·번호·결제 답을 다시 받지 않고 다음 차례로 가는 경로, 장비를 모두 거절해도 전달·청구로 가는 경로, 수량·크기 선택마다 같은 합계가 되는 장면 범위는 문구 표만으로 해결되지 않는다. 검토표의 미션별 재독에 정확한 ID와 경로를 적었으며 G10에서 구조 제안으로 다시 다룬다. 고정 세션과 모든 원래 구조는 이번 결과에서 유지한다.

실제 원어민의 화용·사용 빈도, 제로 학습자의 첫 이해도, enjoying your stay 같은 초기 청크 난도, TTS 숫자와 억양, 말하기 인식, 몸짓과 장비 그림의 실제 표시, 현재 매장·시설·정책·동선, 두 노트북 실행은 미검증이다. 교사와 학습자의 확인이 필요한 부분을 B/유보로 남겼다. 자료를 읽었다고 현지 원어민 교사의 신분이나 검증을 주장하지 않는다.

## 반환 안전 검사

허용된 신규 검토표·수정표 두 파일만 반환한다. 입력 기존 파일 바이트, 새 경로와 add 동작, 덮어쓰기 없음, SHA-256·UTF-8/LF·800KB 상한·zip CRC·목록과 실제 파일 일치를 확인했다. 사진·음성·비밀번호·토큰은 넣지 않았다. reviewer가 관문을 다시 돌려 반영할 제안이다.
