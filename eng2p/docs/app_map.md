# 앱 조각 지도

신뢰도: A 생성 (파생물)
상위 규격: docs/roadmap.md 12.10

**손으로 안 고친다.** `python3 scripts/derive_app.py` 가 다시 뽑는다.
이름은 `app/order.txt` 에서 오고 줄 수는 조각을 세서 낸다.

차례도 그 파일이 정한다. **그 차례가 곧 파일의 차례다.**

| 조각 | 줄 | 무엇 |
|---|---|---|
| `page/00_head.html` | 9 | 문서 머리. 제목과 화면 규격 |
| `style/01_tokens.css` | 91 | 색과 글꼴 토큰, 머리띠 |
| `style/02_common.css` | 166 | 공통 자리. 카드와 단추와 표 |
| `style/03_timer.css` | 389 | 시계와 블록 칸과 집중 화면 |
| `style/04_parts.css` | 304 | 차트와 규칙 카드와 인쇄 |
| `page/01_open.html` | 3 | style 닫고 body 열기 |
| `body/01_header.html` | 14 | 머리띠와 조작줄 |
| `body/02_today.html` | 143 | 오늘 탭 |
| `body/03_review.html` | 12 | 복습 탭 |
| `body/04_sound.html` | 63 | 소리 탭 |
| `body/05_clip.html` | 86 | 클립 탭 |
| `body/06_media.html` | 77 | 미디어 탭 |
| `body/07_src.html` | 44 | 자료 탭 |
| `body/08_ledger.html` | 73 | 대장 탭 |
| `body/09_verify.html` | 15 | 판정 탭 |
| `body/10_quarter.html` | 17 | 분기 탭 |
| `body/11_check.html` | 18 | 검사 탭 |
| `body/12_rot.html` | 27 | 회전 탭 |
| `body/13_rules.html` | 48 | 규칙 탭 |
| `body/14_footer.html` | 5 | 바닥글 |
| `page/02_script.html` | 2 | 자료 script 태그와 script 열기 |
| `js/01_const.js` | 105 | 상수. 기준서에서 온 값 |
| `js/02_store.js` | 115 | 저장소와 유틸 |
| `js/03_plan.js` | 476 | 오늘 배정과 오늘 한 장 |
| `js/04_today.js` | 229 | 탭 몰기와 오늘 탭 그리기 |
| `js/05_session.js` | 374 | 시계와 세션 상태와 기기 쪽 |
| `js/06_cards.js` | 337 | 카드 뷰어와 간격 반복과 근거 |
| `js/07_block14.js` | 408 | 블록 1과 4. 미디어를 그 자리에서 |
| `js/07b_tone.js` | 61 | 소리 여섯. 시작 넘김 되풀이 교대 판끝 세션끝 |
| `js/08_script.js` | 471 | 대본 동기와 되풀이와 배속 |
| `js/09_lecture.js` | 183 | 강의 본문 96편. 읽는 자리 |
| `js/10_run.js` | 192 | 블록 몰기. 넘김과 되돌림 |
| `js/11_ledger.js` | 211 | 대장 탭 |
| `js/12_verify.js` | 73 | 판정 탭 |
| `js/13_quarter.js` | 89 | 분기 탭 |
| `js/14_check.js` | 179 | 규격 검사 이식 |
| `js/15_rot.js` | 94 | 회전 대장 |
| `js/16_review.js` | 110 | 복습. 간격 반복 |
| `js/17_sound.js` | 148 | 소리. 기기 내장 음성 합성 |
| `js/18_clip.js` | 354 | 클립. 로컬 파일 구간 반복 |
| `js/19_library.js` | 372 | 미디어 라이브러리 52과 |
| `js/21_weekcheck.js` | 134 | 주간 점검 30분. 앱이 세고 사람은 왜 그랬는지를 적는다 |
| `js/22_paircode.js` | 229 | 짝 코드. **셈만 건너간다.** 사람이 손으로 치는 스물몇 글자 |
| `js/23_merge.js` | 279 | 합치기. **덮는 것이 아니다.** 못 정하는 것은 사람에게 묻는다 |
| `js/20_docs.js` | 265 | 자료와 규칙과 시작 |
| `page/03_close.html` | 3 | script 닫고 body 닫기 |

조각 46개 7097줄이다. **한 조각은 500줄을 안 넘는다.**
넘으면 `check_app.py` 가 실패로 낸다.
쪼갤 자리가 없으면 그 검사의 면제표에 이유를 적는다. 문턱은 안 올린다.
