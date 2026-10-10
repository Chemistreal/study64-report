# 지은 영어 (authored). 작성자가 필요한 영어를 쓴다

신뢰도: B 생성 (정책 구현. 낱말 등급은 직접 매긴 근사다. 영어는 줄마다 자기 점검 A/B)
검증로그: 2026-10-10 / 사용자 결정 "모든 장면과 모든 상황에서 클로드가 필요하다고 판단하는 영어를 넣는다" (game 저장소 AGENTS.md 3번) / 통과 / 기준서 개정문 30번, 관문 여덟 판과 깸 시험 서른둘, 파일럿 하나(에그스 앤 띵스 아침). 영어의 자연스러움은 B 목록으로 사용자가 본다
상위 규격: docs/spec.md 6.5 / eng2p/CLAUDE.md 3번 / docs/scenes.md 2장
작성일: 2026-10-10

## 1. 한눈에

| 무엇 | 정한 것 |
|---|---|
| 범위 | **게임**의 NPC 대사와 두 사람이 해야 할 말. 앱과 종이 교재, 2층 실제 발화(기준서 6.3)는 그대로 창작 금지다 |
| 출처 종류 | `corpus` (VOA 녹음 대본 줄 그대로. 옛 관문 그대로) / `authored` (작성자가 쓴 줄. 새 관문) |
| 안 섞는다 | 한 줄은 둘 중 하나다. authored 줄은 말뭉치 근거(`lle1-NN`)를 갖지 않고, corpus 줄은 authored 를 갖지 않는다 |
| 1순위 규칙 | CLAUDE.md 3번은 그대로다: **확신이 없으면 B**. 풀어 준 것은 쓸 권한이다. 확신의 기준을 낮춘 것이 아니다 |
| 원본 | `docs/authored_lines.md` (줄), `docs/authored_words.md` (낱말 등급표) |
| 파생 | `out/game/authored.json`, `state/authored_b.md` (scripts/derive_authored.py) |
| 검사 | `scripts/check_authored.py` (판 8, 깸 시험 32), `scripts/check_rights.py` 판 11 (출처와 베끼기) |

## 2. 줄이 갖는 칸

| 칸 | 값 |
|---|---|
| `provenance` | `authored` (고정) |
| `author` | 작성자 태그. 예 `claude-sonnet-5.5 (2026-10-10)` |
| `cefr` | 줄의 목표 등급 A1 A2 B1 B2 |
| `function`, `canDo` | 줄이 하는 말의 기능, 장면의 할 일(can-do) id |
| `selfCheck` | 자연스러운 미국 영어인지 자기 점검 `A` 또는 `B`. B 는 이유(`selfCheckWhy`)가 필수 |
| `introduces` | 그 세션까지 말뭉치에서 안 들은 낱말(새 낱말) |
| `stretchWords` | 줄 등급보다 한 단계 높은 낱말 |
| `ko` | 한국어 풀이. **세션이 `koreanTranslationThroughSession`(지금 50) 이하일 때만** 있다 |
| `kind`, `who`, `scene` | `npc` / `wait` / `option`, 인물, 장면 이름 |

## 3. 관문 (어느 것을 바꿨나)

말뭉치(corpus) 줄의 관문은 하나도 안 바꿨다. 지은 줄에만 아래가 걸린다. 숫자는 `scripts/authored_lib.py` 맨 위 상수다.

| 관문 | 무엇을 보나 | 숫자 | 어디서 |
|---|---|---|---|
| schema | 칸이 있고 값이 범위 안, 줄 id 유일, 종류와 인물이 맞음, 연습 말이 본문 줄과 같음 | | authored_lib |
| vocab (낱말 등급) | 이미 들은 낱말이거나 등급표에 올라 있다. 줄 등급보다 **두 단계 높으면 실패, 한 단계 높은 낱말은 줄마다 하나까지, 올라 있지 않으면 실패** | 한 단계 여유 1개 | authored_lib |
| level | 줄 등급은 장면 목표 등급보다 두 단계 이상 높을 수 없고, 한 단계 높은 줄은 한 장면의 40% 까지 | 40% | authored_lib |
| length (길이와 복잡도) | 낱말 수, 문장 수, 쉼표 수, 이음말 수 상한 | A1 8/2/1/0, A2 12/3/2/1, B1 18/3/3/2, B2 26/4/4/3 | authored_lib |
| load (새 낱말) | 줄마다 아직 안 들은 낱말 수 상한 | A1 4, A2 4, B1 5, B2 6 | authored_lib |
| culture | scenes.md 2.4 슬랭 표, 지어낸 철자 열세(`hafta` `gimme` `gonna` 등), 허용 이름 밖의 실제 상표, world.md 6.2 연속성, em-dash, `check_culture.py` 금지어(신성한 것, 고정관념) | | authored_lib, check_culture |
| dup | 같은 인물의 같은 말 되풀이 금지. 줄 전체가 말뭉치에 있으면 알림(말뭉치 근거로 쓰는 것이 맞다) | | authored_lib |
| copy (긴 구절 베끼기 금지) | 말뭉치 대본(VOA 52과, Tatoeba 잡담)과 **낱말 8개 이어서 같으면 실패**, 6개 이상은 알림 | 8 | authored_lib, check_rights 판 11 |
| gloss | 한국어 풀이는 세션 50 이하 장면에만 | 50 (acts.json) | authored_lib |
| blist | 점검 B 줄은 `state/authored_b.md` 에 다 올라가고 이유가 있다 | | derive_authored, check_authored |

**문화 지침.** 문화 지침(culture.md)은 사용자가 게임 로컬 빌드에서 풀었다(2026-10-09). 그 결정과 기록은 그대로 두었다. `check_culture.py` 는 `out/game/*.json` 을 훑으므로 `authored.json` 에도 자동으로 걸리고, 풀린 내용을 막는 데는 쓰지 않는다. 실제 가게 이름과 상표는 비공개 로컬 빌드에서 쓸 수 있다(game 저장소 AGENTS.md 6번). 줄에 상표를 쓰려면 나들이 메타 `허용 이름` 에 올린다.

**베끼기 판에 대하여.** VOA 대본은 퍼블릭 도메인이지만 Santa Barbara 말뭉치(CC BY-ND 3.0 US, 사용자가 쓰기로 정했다)는 고친 판을 남에게 줄 수 없다. 말뭉치의 긴 구절을 지은 줄로 둔갑시키면 그 선을 흐린다. 그래서 8낱말 이상 이어서 같은 줄을 막는다. 이 저장소에는 SBC 원문이 없어서(판 7) 시험은 VOA 52과와 Tatoeba 파일로 한다. SBC 와의 견줌은 PC 에 대본이 있을 때 `longest_shared` 에 말뭉치를 더해 돌려야 한다(다음 일).

## 4. 낱말 등급. 방법과 한계 (정직하게)

저장소에서 쓸 수 있는 CEFR 낱말 목록이 없다(`docs/sources.md` 4장: NGSL 은 BY-SA, CEFR-J 는 약관 불명, CC0/CC BY 등급 목록은 못 찾았다). 그래서 직접 짓는다.

**방법.** (1) 그 세션까지 블록 1 에서 들은 말뭉치 대본의 낱말은 **이미 들은 낱말**이다. 세션 47 이면 486 어간이다. (2) 그 밖의 낱말은 `docs/authored_words.md` 의 등급표에 올라 있어야 한다. 표는 내가 일반 CEFR 지식과 쓰임 감으로 매긴 것이다. (3) 표에도 말뭉치에도 없으면 실패다. 낱말을 올릴 때 한 번 등급을 생각하게 하는 마찰이 목적이다.

**한계.**

| 한계 | 영향 |
|---|---|
| 등급이 내 판단이다. 공식이 아니다 | 낱말 하나의 A2/B1 경계는 틀릴 수 있다. 줄 단위 상한(한 단계 하나)이 그 오차를 줄이지만 없애지 않는다 |
| 어간 처리가 거칠다 (`ies`, `s`, `ing`, `ed` 만 뗀다) | 불규칙 변화(went, better)는 따로 올려야 한다 |
| 낱말 뜻이 여럿이어도 한 등급이다 | `check` 를 계산서 뜻으로 A2 로 올렸다 |
| 이음말 수는 `because if when while which` 등만 센다 (`that`, `so` 는 안 센다) | 복잡한 문장을 놓칠 수 있다 |
| 숙어와 연어의 등급을 못 본다 | "Right this way" 같은 구는 낱말은 쉬워도 구는 어렵다. 이런 구는 자기 점검과 사용자 검증으로 본다 |
| 말뭉치가 작다 (52과) | 세션 47 에서 이미 들은 낱말이 486어간뿐이라 아침 식사 장면의 새 낱말이 줄마다 2~4개다. 상한이 그것을 보고 있다 |
| 자연스러움을 기계가 못 잰다 | 자기 점검 A/B 와 사용자 검증이 유일한 장치다. 이 문서의 어느 숫자도 "자연스럽다"를 보증하지 않는다 |

## 5. 무엇을 바꿨나 (정확히)

| 파일 | 바뀐 것 | 까닭 |
|---|---|---|
| `scripts/derive_scenes.py` | 근거 칸이 `authored:<줄 id>` 인 줄을 받는다. 이 줄은 근거 대본, 들은 과, 이어진 문장(grounded) 관문 대신 `authored_lib.scene_line_ok` 를 건다(글자 그대로, 종류, 세션). 막는 말, 상표, 연속성, 달력, 반복 상한, 판정형 재료는 지은 줄에도 똑같이 걸린다. **scenes.md 에 지은 줄을 아직 안 넣었고 `scenes.json` 은 바이트가 그대로다** | 장면에 지은 줄을 넣는 길을 열되 말뭉치 관문은 약하게 하지 않는다 |
| `scripts/derive_replies.py`, `derive_deck_names.py`, `check_gamedata.py` | **안 바꿨다.** `grounded()` 는 말뭉치 줄만 고른다. 역할 카드의 NPC 대답이 지은 줄도 고르게 하려면 `authored_lib.role_candidates()` 를 `Lessons.source` 뒤에 붙이고 `check_gamedata.py` 의 독립 재구현도 같이 고쳐야 한다. replies.json 이 바뀌므로 dataHash 가 또 바뀐다. 지금은 안 했다(6장) | 대답이 바뀌면 판정과 TTS 목록이 같이 바뀐다. 파일럿 범위를 넘는다 |
| `scripts/check_rights.py` | 판 11 `authored_provenance` 와 깸 시험 4 | 출처 표시와 긴 베끼기 |
| `scripts/check_culture.py` | **안 바꿨다.** `out/game/*.json` 을 훑는 길로 `authored.json` 에 자동으로 걸린다 | |
| `docs/spec.md` 6.5, `docs/spec_amendments.md` 30번, `scripts/check_spec.py` | 개정문 30번(반영됨), 조각 확인 | 기준서 6.5 가 "짓지 않는다"고 했다 |
| `CLAUDE.md`, `docs/scenes.md` 2장, `docs/game.md` 2장, `docs/game_data.md` 2장 | 규칙 문구에 예외 한 줄 | 문서가 서로 어긋나지 않게 |
| `scripts/derive_game_manifest.py`, `scripts/all.py` | 선택 자료 둘(authored.json, outings.json)을 매니페스트에 적고 파생 둘과 검사 하나를 걸음에 넣는다 | |

## 6. 게임과 음성에서 어떻게 쓰나

자세한 것은 game 저장소 `Docs/authored_english_KO.md`. 요약만 적는다.

| 쓰임 | 지금 | 다음 |
|---|---|---|
| 미션(나들이) 미니게임 | `outings.json` 이 `authored.json` 줄 id 를 가리킨다 | 게임 로더(안 함) |
| 음성(TTS) 목록 | 안 올렸다. authored 줄도 NPC 목소리는 TTS(C-gen)다 | `voicelist.json` 에 `provenance` 를 달아 올린다. 파생기가 authored 를 읽게 하는 일 |
| 말 판정 | 지은 `wait`/`option` 줄이 기대 문장이다. 넉넉하게 듣는다 | 로더 |
| 대본 화면과 한국어 풀이 | `ko` 가 있는 줄만, 듣기 뒤에만(세션 50 이하) | 로더 |
| 카드 | 연습 말 8개는 카드 총량(기준서 8.1)에 안 센다. 나들이 안에서만 쓴다 | 정식 카드 편입은 사용자 결정 |
| 역할 카드 NPC 대답 | 말뭉치 줄만(grounded). 지은 줄은 `role_candidates()` 로 준비만 | 5장의 두 번째 줄 |

## 6.1 첫 공개 범위 (사용자 2026-10-10)

첫 공개는 세션 1~48, A1 이다. authored 줄은 그 범위의 미션 18개(`docs/outings.md` 2.1)에만 쓴다. 그 미션은 세션이 50 이하라 **모든 줄과 연습 말에 한국어 풀이를 붙인다**(`check_authored.py` 판 `first`). 음성 렌더 대상은 NPC 줄과 연습 말 본보기(점검 A), 시험과 dataHash 영향은 outings.md 2.1.

## 7. B 목록 절차

`state/authored_b.md` 에 점검 B 줄이 자동으로 쌓인다(지금 1줄). 사용자가 대화에서 보고 `검증로그: 날짜 / 근거 / 통과·보류·기각 / 조치` 로 닫는다. 기각된 줄은 원본에서 고친다. **B 줄은 사용자가 통과시키기 전까지 게임이 TTS 로 읽지 않는 것이 맞다**(로더가 `selfCheck == "A"` 만 읽게 할지는 사용자 결정. 지금은 자료에 둘 다 있다).
