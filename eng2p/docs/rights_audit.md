# 권리 점검. 도구 쪽(앱, 강의 자료에 쓴 외부 자료)

신뢰도: B 채집 (저장소 파일과 공식 원문을 대조했다. 원문을 연 줄과 목록만 본 줄을 표마다 갈랐다)
검증로그: 2026-10-09 / scripts/check_rights.py 실행(판 아홉, 깸 시험 아홉판 모두 잡음)과 공식 원문 열람(VOA 재사용 안내, Tatoeba 이용약관 6.2과 내려받기 쪽, 깃허브 릴리스 목록) / 보류 / 법률 판단은 사용자가 한다. 못 연 원문은 표에 "확인 못 함" 으로 남겼다
상위 규격: docs/sources.md / CLAUDE.md
작성일: 2026-10-09

게임 쪽 짝 문서: 게임 저장소 `Docs/licenses_KO.md` (엔진, 모델, 글꼴, 에셋 출처별). `tools/game/assets.json` 은 두 저장소가 같은 파일이라 그쪽 표 6장이 이 문서의 에셋 줄을 대신한다.
**이 문서는 법률 자문이 아니다.** 법과 안전은 사용자가 정한다. 규칙 표는 `docs/sources.md` 1장이 원본이고 여기서는 되풀이하지 않는다.

## 1. 먼저 볼 것 (위반과 어긋남)

| # | 무엇 | 왜 문제인가 | 지금 상태 | 정하는 사람 |
|---|---|---|---|---|
| 1 | **Santa Barbara 말뭉치가 아직 저장소와 릴리스에 있다** | 사용자는 안 쓰기로 했다(2026-10-09). 라이선스는 CC BY-ND 3.0 US 이고 `docs/sources.md` 1장은 BY-ND 를 "안 된다" 로 적는다 | (가) 공개 저장소의 릴리스 `english-media-v1` 에 `sbcsae-transcripts.zip` (6,844,416바이트)이 2026-08-07 부터 올라가 있다. 깃허브 API 로 읽기만 했다. (나) 추적하는 파일 27개가 말뭉치를 말한다(`check_rights.py` 가 매번 찍는다). (다) `media/english/archive/registry.json` 에 `cc-by-nd-3.0-us` 권리 항목과 `sbcsae` 묶음이 있다. (라) `out/input/eng2p_input_q1.md` 76행은 "2층은 Santa Barbara Corpus 를 Q2 3층 대조판부터 쓴다" 고 계획한다. (마) 앱 출처 화면 `app/body/07_src.html` 이 말뭉치를 소개한다. (바) 워크플로 `.github/workflows/archive-english-media.yml` 은 다시 돌면 같은 zip 을 다시 올린다 | 사용자. 릴리스 파일을 지울지, 목록과 계획에서 뺄지 |
| 2 | `media/english/RIGHTS.md` 와 `docs/sources.md` 가 다르게 말한다 | RIGHTS.md 는 말뭉치를 "원본 그대로 재배포 가능" 이라 적고, sources.md 규칙은 BY-ND 를 막는다. 말뭉치 줄이 sources.md 4장 표에 없다 | 이 점검은 기존 파일을 고치지 않았다 | 사용자 |
| 3 | Tatoeba 저자 표기가 앱이 아니라 게임에서 보인다 | CC BY 2.0 FR 은 저자 이름을 대야 쓸 수 있다. 문장마다 저자(owner)는 `out/data/ext_smalltalk.json` 에 있다(206명) | 앱 코드에는 이 줄을 보여 주는 곳이 없다. 게임에 들어오는 날 게임의 출처 화면이 저자 목록을 보여야 한다 | 게임 쪽 일(`Scripts/make_credits.py`) |
| 4 | 뿌리 쪽 PRISM 화면(`index.html` 외)이 구글 글꼴 서버에서 글꼴을 불러온다 | 글꼴 다섯(Hahmlet, IBM Plex Sans KR, IBM Plex Mono, Noto Serif KR, Noto Sans KR)이다. 사용자가 허용한 글꼴은 Pretendard 와 Noto Sans KR 뿐이다. 나머지 넷의 라이선스는 이번에 안 열었다 | `english.html`(eng2p 도구)은 밖의 주소를 하나도 안 부른다(검사 확인). 범위 밖이라 고치지 않았다 | 사용자 |
| 5 | VOA 사진의 통신사 표기 | VOA 안내는 AP, Reuters, AFP 사진은 다시 올리지 못한다고 한다. 저장소의 대표 이미지 52장(`media/english/images/`)이 모두 VOA 자체 사진인지는 이미지마다 안 봤다 | `check_ext.py` 의 `agency` 판은 라디오 **글** 만 본다 | 확인 못 함 |

## 2. 범위와 방법

| 범위 | 안에 | 밖에 |
|---|---|---|
| 앱 | `english.html`(`app/` 조각을 합친 파생물), `app/` 조각 | 뿌리 쪽 PRISM 화면(`index.html`, `report.html`, `answers.html`, `관리자.html`, `v2.html`)은 글꼴 한 줄만 4번에 적었다 |
| 강의 자료에 쓴 외부 자료 | VOA 레슨(`media/english/`), 확장층(`out/data/ext_*.json`), 게임 자료 목록(`tools/game/assets.json`), 말뭉치 계획 문서 | 강의 본문 영어는 우리가 쓴 것(권리 문제 없음. 정확성은 B등급 큐가 맡는다) |

방법은 세 가지다. 저장소 파일을 읽었다. `scripts/check_rights.py` 로 기계가 셀 수 있는 것을 셌다. 공식 원문은 열린 것만 읽었다.

## 3. 외부 자료별 표

확인 칸: **확인함** 은 이번에 원문 주소를 열어 읽었다는 뜻이다. **목록만** 은 `docs/sources.md` 검증로그(2026-10-07)나 파일의 권리 칸에 적힌 것이고 이번에 원문을 안 열었다.

| 자료 | 어디서 쓰나 | 권리 | 의무 | 근거 | 확인 | sources.md 와 |
|---|---|---|---|---|---|---|
| VOA Let's Learn English 1단계 52레슨 (MP3 52, 이미지 52, 대본 52, 교재 PDF 52, 레슨 JSON 52) | 앱, 강의, 소리 트랙 | 퍼블릭 도메인(VOA 자체 제작분). 통신사 자료 제외 | `learningenglish.voanews.com` 출처 표기. 통신사 사진과 글은 안 쓴다 | https://learningenglish.voanews.com/p/6861.html | **확인함.** "texts, MP3s, photos and videos are in the public domain ... with credit to learningenglish.voanews.com", AP, Reuters, AFP 는 재게시 금지 | 2장 표와 같다. 같은 근거 |
| VOA 2단계 30레슨 목록, American Stories 361편 목록, National Parks 48편(`ext_radio` 89편) | 확장층 라디오. 파일은 저장소 밖(`game_store/voa_ext`) | 같다(VOA-PD) | 같다 | 같다 | 확인함(같은 쪽). 편별 통신사 여부는 `check_ext.py` agency 판이 글에서 본다 | 2장 |
| VOA 교재 PDF(1단계 사용법, 수업안 등. 릴리스 zip `voa-course-guides.zip` 63MB) | 강의 참고 | VOA 자체 제작분으로 `registry.json` 이 적었다 | 같다 | `registry.json` courseResources | 목록만 | 2장 |
| Tatoeba 영어 문장 (`ext_smalltalk` 2,580줄: CC BY 2.0 FR 2,044, CC0 536) | 확장층 잡담(NPC 한 줄) | CC BY 2.0 FR. 일부 CC0 1.0 | **저자 이름을 댄다.** 줄마다 id, owner, src 를 가진다(검사 판 4). 파일에 표기 문구가 있다 | https://tatoeba.org/en/terms_of_use 6.2, https://tatoeba.org/en/downloads | **확인함.** "CC-BY 2.0 FR ... a condition of attribution", "These files are released under CC BY 2.0 FR. A part of our sentences are also available under CC0 1.0" | 4장 표와 같다 |
| 구텐베르크 책 둘(`ext_readers` 10편, 원작 #66547 과 #329) | 도서관 책 | PD(US,KR). 한국에서도 퍼블릭 도메인이어야 한다는 규칙 | 없다 | https://www.gutenberg.org/ | 목록만 | 3장 |
| USCIS M-618, FEMA 허리케인과 쓰나미 안내(`ext_notices` 24편) | 동네 안내문. 사실만 새 영어로 쓴다 | PD-USGov. M-618 은 고치지 않은 배포만 허락하고 Ready.gov 는 고치지 않기를 바란다 | 원문 문장을 옮기지 않는다. 로고와 사진과 기관 이름을 화면에 안 쓴다. "학습용 인공물" 표시를 단다 | `docs/ext_notices.md` 1장 | 목록만(원문 PDF 는 `game_store/gov/` 사본과 대조했다고 그 문서가 적었다) | 2장 |
| `tools/game/assets.json` (1,336개 12.83GB: CC0 727, 퍼블릭 도메인 607, CC BY 2) | 게임 에셋 목록. 파일은 저장소 밖 | 갈래별. 허용 밖 0(검사 판 1) | CC BY 둘(ESA WorldCover, Tatoeba)은 출처 표기 | 게임 저장소 `Docs/licenses_KO.md` 6장 | 반쯤 확인함. CC0 셋(ambientCG, Poly Haven, Kenney)과 ESA, Tatoeba 는 원문을 읽었다. 나머지는 목록만 | 5장, 6장 |
| LibriVox | 탐색 출처로만 등록. 파일 없음 | 미국에서 녹음은 퍼블릭 도메인(RIGHTS.md) | 개별 작품을 한국에서 배포하기 전에 원작자 사망연도 확인 | https://librivox.org/pages/public-domain/ | 목록만 | 없음 |
| YouTube | 임베드 아이디만 보관(`youtubeIds`). `english.html` 에 youtube 글자 0건 | 서비스 약관 | 내려받기, 추출, 재업로드 안 함 | https://www.youtube.com/static?template=terms | 목록만 | 없음 |
| 글꼴 | `english.html` 은 글꼴 파일도 글꼴 서버도 없다(`@font-face` 없음, 밖의 주소 검사 87파일 통과) | 해당 없음 | 없다 | - | 확인함(파일 검사) | 5장 |
| Common Voice, LibriSpeech, speechocean762, Google Ngram, Open English WordNet, game-icons.net | 계획에만 있다. 저장소에 파일이 없다(이름 검색 0건) | `sources.md` 가 "된다" 로 적었다 | CC BY 는 출처 표기 | `docs/sources.md` 4장, 5장 | 목록만 | 4장, 5장 |
| Santa Barbara 말뭉치 | 1번 표 | CC BY-ND 3.0 US | 1번 표 | `media/english/RIGHTS.md` | 1번 표 | 말뭉치 줄이 없고 BY-ND 규칙만 있다 |

## 4. 검사 스크립트 `scripts/check_rights.py`

기계가 셀 수 있는 것만 맡는다. 아홉 판이다.

| 판 | 보는 것 | 지금 결과 |
|---|---|---|
| 1 assets_license | `tools/game/assets.json` 의 권리 칸이 CC0, 퍼블릭 도메인, CC BY 중 하나 | 통과(1,336개) |
| 2 assets_ccby | CC BY 항목에 출처 주소 | 통과 |
| 3 ext_license | `out/data/ext_*.json` 의 파일과 편 권리 칸이 허용 다섯 중 하나 | 통과(2,703편) |
| 4 ext_ccby_credit | Tatoeba 줄의 저자, 원문 주소, 표기 문구, 저자 목록 | 통과 |
| 5 media_license | `media/english/manifest.json` 권리 글이 알려진 셋 | 통과 |
| 6 registry_license | `registry.json` 에 BY-ND, BY-NC, BY-SA 가 새로 안 생김 | **알려진 1건** (`cc-by-nd-3.0-us`) |
| 7 santa_barbara | 말뭉치를 말하는 파일이 새로 안 늘어남 | **알려진 27파일** |
| 8 no_external | `english.html` 과 `app/` 이 밖의 주소에서 글꼴, 스크립트, 이미지를 불러오지 않음 | 통과(87파일) |
| 9 no_font_files | 저장소에 글꼴 파일이 없음 | 통과 |

**알려진 위반은 실패로 세지 않고 매번 찍는다.** 사용자가 1번을 정하기 전에는 `check_rights.py` 가 늘 실패해서 아무도 안 보게 되는 것을 막으려는 설계다. 정리가 끝나면 `--strict` 로 바꿔 알려진 것까지 실패로 센다.
새 파일이 말뭉치를 말하기 시작하면(7), 새 BY-ND 권리가 생기면(6) 곧바로 `[실패]` 다.

깸 시험(`--break`): 판마다 실패를 심어 잡는지 본다. 심은 것은 CC-BY-NC 항목, 빈 권리 칸, 출처 없는 CC BY, 허용 밖 편 권리, 저자 없는 Tatoeba 줄, 표기 문구 삭제, 낯선 매체 권리 글, 새 BY-NC 권리 항목, 새 말뭉치 파일, 구글 글꼴 `<link>`, 글꼴 파일이다. 열세 가지를 모두 잡았고 깨끗한 현재 자료는 실패 0 으로 통과했다.

사용법:

```
python3 scripts/check_rights.py              # 검사
python3 scripts/check_rights.py --strict     # 알려진 위반도 실패
python3 scripts/check_rights.py --break      # 깸 시험
```

**`scripts/all.py` 에는 넣지 않았다.** 넣을 줄은 `check_ext.py` 줄(146행) 바로 아래다.

```
    ("대조", "check_rights.py", ["--break"], True),
```

알려진 위반이 남아 있는 동안은 종료 코드 0 이다. 사용자가 1번을 정해 정리한 뒤에는 인자를 `["--strict", "--break"]` 로 바꾼다.

## 5. 확인 못 함 (메인이 PC 에서 볼 것)

| # | 무엇 | 어디를 보나 |
|---|---|---|
| 1 | VOA 대표 이미지 52장의 통신사 표기 | 레슨 쪽 `https://learningenglish.voanews.com/` 의 각 레슨 사진 크레딧. 또는 `media/english/lessons/lle1-NN.json` 의 `heroImageOriginal` 주소가 가리키는 이미지의 출처 줄 |
| 2 | 릴리스 `english-media-v1` 의 `sbcsae-transcripts.zip` 을 지울지 | https://github.com/Chemistreal/study64-report/releases/tag/english-media-v1 (사용자 결정. 이 점검은 읽기만 했다) |
| 3 | 구글 글꼴 넷(Hahmlet, IBM Plex Sans KR, IBM Plex Mono, Noto Serif KR)의 라이선스 | https://fonts.google.com 의 각 글꼴 License 칸. 사용자가 허용한 것은 Noto Sans KR 과 Pretendard 뿐이다 |
| 4 | 구텐베르크 #66547, #329 의 저자 사망연도(한국 퍼블릭 도메인 규칙) | https://www.gutenberg.org/ebooks/66547 , /329 |
| 5 | 안내문 원본 PDF 사본의 해시 | `game_store/gov/README.md` (저장소 밖. 이 세션에서는 못 연다) |
| 6 | YouTube 약관과 LibriVox 쪽의 지금 문구 | RIGHTS.md 가 적은 주소 |

## 6. 가정과 한계

- 판단 기준은 `docs/sources.md` 1장과 사용자 지시(CC0, 퍼블릭 도메인, CC BY 만. Santa Barbara 안 씀)다. 그 기준 자체를 이 문서가 바꾸지 않았다.
- `check_rights.py` 의 허용 갈래 판별은 권리 글의 앞 낱말만 본다. `NC`, `SA`, `ND` 가 글 어디에 있어도 막는다. 새 표기법이 나오면 오탐이 날 수 있고 그때는 막는 쪽이 맞다.
- 알려진 파일 27개는 2026-10-09 기준 목록이다. 정리하면 스크립트의 `KNOWN_SB_FILES` 에서 지운다.
- 깃허브 릴리스는 읽기만 했다. 어떤 것도 지우거나 바꾸지 않았다.
- 기존 파일은 하나도 고치지 않았다. 새 파일은 이 문서와 `scripts/check_rights.py` 둘이다.
