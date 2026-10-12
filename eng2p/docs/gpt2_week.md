# GPT2 한 주 꾸러미: 결과를 받아 합치는 순서와 관문 (연구 저장소 쪽)

신뢰도: B 생성 (합치는 순서와 관문 이름은 이 저장소의 스크립트와 앞선 적용 기록에서 읽은 것이다. GPT2 의 실제 결과는 아직 오지 않았다)
검증로그: 2026-10-13 / 게임 저장소 `Docs/gpt_tasks/G*_TASK.md` 25개의 허용 폴더와 이 저장소의 관문 스크립트 이름과 `docs/parts/G8_G9_G10_applied.md` 의 적용 방법을 대조 / 보류 / 결과가 오면 아래 표를 실제 적용 기록으로 고친다
상위: 게임 저장소 `Docs/gpt_next_week_KO.md` (명령 두 개와 붙여 넣을 말) / `docs/authored.md` / `docs/parts/G8_G9_G10_applied.md`
작성일: 2026-10-13

게임 저장소의 `Tools/make_gpt_week.py` 가 `GPT2.zip` 에 이 저장소의 `eng2p/` 전체를 담아 GPT2 에게 보낸다. GPT2 는 스물다섯 일을 우선순위대로 하고 일이 끝날 때마다 `result_G<번호>.zip` 을 돌려준다. 이 문서는 받은 뒤 이 저장소에서 무엇을 어떤 순서로 하는지만 적는다.

## 1. 지키는 규칙

1. GPT2 는 **새 파일만** 낸다 (`study/eng2p/docs/parts/G<번호>_*` 와 게임 저장소의 `Docs/qa/G<번호>_*`, 이미지 프롬프트 폴더). 이 저장소의 원본(`authored_lines.md`, 강의, 카드, `out/`)은 GPT2 가 안 건드린다. 고치는 일은 아래 표대로 Claude 가 한다.
2. 받으면 먼저 게임 저장소에서 `python3 Tools/make_gpt_week.py check-result --zip result_G17.zip --game <게임> --study <스터디>` 를 돌린다. 파일 이름이 그 일의 접두어인지, 허용 폴더 안인지, 해시가 맞는지 보고 하나라도 어긋나면 zip 째 거절한다.
3. **손으로 JSON 을 안 고친다.** 원본 글을 고친 뒤 파생기(`scripts/derive_*.py`)와 `python3 scripts/all.py` 를 돌린다. `out/` 는 파생물이다.
4. `docs/` 아래의 Markdown 은 모두 `scripts/check.py` 가 본다. 머리에 `신뢰도: A|B|C` 가 있어야 하고 B 면 `검증로그:` 가 있어야 한다. 글자는 ASCII, 한글, 따옴표 네 가지, 말줄임표, 가운뎃점, 화살표, 도 표시만 쓰고 줄표(em dash, en dash)는 안 쓴다. GPT2 에게 TASK.md 머리글로 이미 알렸다. 그래도 어긋난 파일은 머리만 고쳐서 받는다 (G8 G9 G10 보고서 세 개가 그랬다).
5. 줄 id 는 저장소 전체에서 유일해야 한다. 새 접두어(`ft-` G13, `fm-` G24)는 `grep -rn "<접두어>" docs/ out/` 로 안 쓰는 것을 확인한 일감이다.
6. 영어 줄은 점검 A/B 가 있고 B 는 `state/authored_b.md` 로 모인다. A 로 바꾼 줄은 사용자가 아직 안 본 것이다 (G8 의 일곱 줄처럼). 기록에 그렇게 적는다.

## 2. 일마다 합치는 곳과 관문

| 일 | 받는 것 | 합치는 곳 | 관문과 주의 |
|---|---|---|---|
| G20 | 첫 공개 18개 줄 검토와 교체안 | `docs/authored_lines.md` 의 줄과 연습 말 (G9 방법: 줄 id 와 기능을 안 바꾼다) | `derive_authored.py`, `check_authored.py`, `all.py`. 연습 말은 줄과 영어가 같아야 한다 (한국어는 관문이 안 비교하니 손으로 맞춘다). 바뀌면 `state/authored_b.md` 와 `dataHash` 가 바뀐다: 게임의 두 노트북에 `sync_data` 가 필요하다 |
| G12 | A1 한도 위반 고침 | 같은 곳 | 위와 같다. 말뭉치 줄(`lle1-*`)은 안 고친다. `G12_check.py` 의 마지막 줄을 확인 |
| G17 G18 G19 | 뒤 미션 37개의 새 형식 장 | `docs/parts/G17_authored_lines_v2.md` 등 **보관본으로 둔다**. `authored_lines.md` 에 합치는 때는 사용자가 정한다 (합치면 첫 공개 데이터가 달라진다) | 임시 사본에 장을 붙여 `check_authored.py` 의 `structure` 판까지 0 실패인지 본다 (G8 G9 G10 적용 기록 5장의 방법). 줄 id 가 하나도 안 사라졌는지 `G*_diff_KO.md` 의 숫자를 확인 |
| G21 G22 G23 | 뒤 미션 줄 검토와 교체안, 사실 재확인 | 해당 v2 보관본 | 교체안은 G9 형식이다. 사실표(`G*_facts*`)의 B 는 사용자가 본다 |
| G13 G24 | NPC 자유 대화 줄 (`ft-*`, `fm-*`) | `docs/parts/` 보관본. 게임이 읽는 길과 규격은 사용자가 정한 뒤에 | 접두어 유일성, 등급표 새 낱말(`G13_free_words.md`, `G24_free_words.md`)을 `authored_words.md` 에 올릴지는 합치는 때 |
| G33 | 55개 미션의 "상황 ·" 한 문장 | 첫 공개 미션은 `상황` 메타 (파생의 `game.situation`), 뒤 미션은 v2 보관본 | 글자 수 상한은 G33 이 게임 코드에서 찾은 값이다. 바꾸면 `dataHash` 가 바뀐다 |
| G15 G25 G26 G27 | 학습 곡선과 세션 내용 점검 | 고칠 곳은 원본 글 (`docs/*.md`, 강의 원본, 카드 계획)이고 `out/` 은 파생기로 다시 만든다 | `scripts/check_curve.py`, `check_blocks.py`, `check_grade.py`, `all.py`. 제안은 표이니 한 줄씩 판정하고 못 받는 것은 이유를 적는다 |
| G28 G29 G36 | 카드, 라디오 안내문 책, 강의 점검 | 같은 원칙 (원본 글을 고치고 파생) | `check_cards_plan.py`, `check_ext.py`, `check_culture.py`, `check.py`. 정답표가 틀린 카드는 먼저 고친다 (학습자가 틀림을 알 수 없다) |
| G34 | 하와이 사실 주장 점검 | `docs/culture.md`, `docs/world.md`, `docs/town.md`, 미션 `상황` | "contradicts" 와 "probably wrong" 만 받는다. 기억에서 온 B 는 바로 고치지 않는다 |
| G14 G30 G38 G16 G31 G32 | 게임 쪽 글 (`Docs/qa/`, 이미지 프롬프트 폴더) | 게임 저장소 | 이 저장소 일이 아니다. 게임 저장소의 `Docs/gpt_next_week_KO.md` 4장대로 |

## 3. 다음 주에 처음 보는 것

- `INVENTORY_STUDY.md` (zip 맨 위)는 미션 55장의 위치와 줄 수와 메타 여부를 도구가 센 것이다. 이 문서의 표보다 그 숫자가 최신이다.
- 뒤 미션 37개는 **이미 쓰여 있다** (`docs/parts/G2_authored_lines.md` 12, `G3_authored_lines.md` 11, `G5_authored_lines.md` 14). 그래서 새로 쓰기가 아니라 새 형식으로 올리기(G17~G19)와 검토(G21~G23)다.
- `scripts/check_authored.py` 의 `structure` 판은 미션 55장을 이미 이름으로 알고 있다. 보관본 37장에 처음 걸 때의 실패 목록이 G17~G19 의 출발점이다.
