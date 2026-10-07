# 확장층. 1년 핵심 위에 얹는 영어 자료

신뢰도: B 설계 (출처와 권리와 셈은 실측이다. 주 배치, 길이 범위, 확장 낱말 목록은 설계라 리허설에서 바뀐다)
검증로그: 2026-10-07 / audit_material.md 계획 열다섯 중 라디오, 잡담, 안내문, 책, 달력, 검사를 만들고 VOA 쪽 400여 개, Tatoeba 내보내기 전수, 정부 PDF 셋, 구텐베르크 두 권을 원문으로 대조 / 보류 / B 줄은 spec 5.2 표본 검증, 하와이 대목은 원주민 감수자 대기
상위 규격: docs/world.md 8장, docs/sources.md, docs/spec.md 1.2 와 13.1
작성일: 2026-10-07

world.md 8장이 두 층을 갈랐다. **핵심은 288세션이고 확장은 일요일과 남는 시간이다.**
이 문서는 확장층의 규칙, 출처, 등급, 달력을 정한다. 자료는 `out/data/ext_*.json` 다섯이고 다 파생물이다.

## 1. 무엇이 있나

| 파일 | 무엇 | 원본 | 파생기 | 등급 |
|---|---|---|---|---|
| ext_radio.json | 라디오. LLE2 30과, American Stories, America's National Parks | 저장소의 voa-lle2-full.json, game_store/voa_ext 에 받아 둔 VOA 쪽 | scripts/derive_ext_radio.py | C-real |
| ext_smalltalk.json | NPC 잡담. Tatoeba 영어 문장 | game_store/tatoeba (영어 내보내기 넷) | scripts/derive_ext_smalltalk.py | B |
| ext_notices.json | 동네 안내문. 정부 자료 사실을 쉬운 영어로 | docs/ext_notices.md | scripts/derive_ext_notices.py | B |
| ext_readers.json | 도서관 책. 하와이 PD 문헌을 쉬운 영어로 | docs/ext_readers.md | scripts/derive_ext_readers.py | B |
| ext_calendar.json | 48주 x 다섯 칸 | 위 넷과 이 문서 7장 | scripts/derive_ext_calendar.py | 칸마다 아래 것의 등급 |

검사는 `scripts/check_ext.py` 하나다 (10장). 깸 시험을 같이 돈다.

2026-10-07 실측 (파생기 출력 그대로)

| 파일 | 편 | 줄 | 낱말 | 비고 |
|---|---:|---:|---:|---|
| ext_radio | 89 | 3,395 | 83,668 | LLE2 30 (bot 줄 147), American Stories 23 (달력 17, 열림 6), Parks 36 (달력 12, 열림 24) |
| ext_smalltalk | 2,580줄 | 2,580 | | 후보 137,145 / 저자 208명 / CC0 문장 먼저 |
| ext_notices | 24 | 92 | 864 | 게시판 20, 방송 4. 사실 근거는 M618, HUR, TSU |
| ext_readers | 10 | 362 | 3,526 | 장소 전설 2 (16, 17주), Bottle Imp 8 (42~48주) |
| ext_calendar | 48주 | | | 찬 주: 라디오 36, NPC 0, 잡담 46, 안내문 20, 책 9 |

기준선 LLE1 대본 16,938 낱말에 견주면 라디오만 4.9배다. 계획의 116,000 낱말 중 이번에 든 것은 약 88,000 이다 (11장 남은 것).

## 2. 지킬 것

| 규칙 | 어디서 | 어떻게 지키나 |
|---|---|---|
| PD, CC0, CC BY 만 | world.md 8장, sources.md 1장 | 줄마다 license 칸. VOA-PD, PD-USGov, PD(US,KR), CC0-1.0, CC-BY-2.0-FR 밖이면 검사 실패 |
| 음성 파일은 저장소에 안 넣는다 | CLAUDE.md | 라디오는 음성 주소만 적는다. 저장소에 mp3 mp4 wav m4a ogg 가 생기면 검사 실패 |
| 대본 없는 음성 금지 | CLAUDE.md, audio_intake.md | 라디오 편마다 글 줄이 하나 이상 |
| 근거 없이 새로 쓴 영어는 B | spec 1.2 | 잡담, 안내문, 책은 줄마다 grade B. 파일 머리와 편마다 검증로그 |
| 한국어 번역 짝 금지 | spec 13.1 번역 경유 | Tatoeba 는 영어 내보내기만. links 파일을 안 받는다. 자료에 한글 영어 짝 칸(ko, kor, korean, translation)이 없다 |
| 단어장 암기 금지 | spec 13.1 | Words in This Story 칸과 과 끝 낱말 목록을 뺀다. 자료에 words, vocab, wordlist 칸이 없다 |
| 문법서 Q1~Q2 금지 | spec 13.1 | Professor Bot 해설 줄은 25주부터. 24주까지 bot 줄이 하나라도 있으면 실패 |
| 슬랭 전면 금지 | CLAUDE.md | 잡담과 새로 쓴 글에 SLANG 목록 (derive_ext_common.py) 이 없다. 라디오 원문은 VOA 그대로라 안 건다 |
| 상표와 실존 인물 | town.md, scenes.md | derive_town.py BRANDS 를 그대로 쓴다. 잡담과 새로 쓴 글에 PEOPLE 목록이 없다 |
| 신성한 것 | sources.md 3.5, audit_culture | 새로 쓴 글에 SACRED 목록 (Pele, heiau, Kumulipo, 1893 전복 등) 이 없다 |
| 하루 120분을 안 민다 | world.md 6, 8장 | 확장은 다 일요일과 남는 시간. 안 해도 이야기는 간다 |

## 3. 라디오 (C-real)

### 3.1 갈래

| 갈래 | 주 | 받는 곳 | 편 |
|---|---|---|---:|
| LLE2 Let's Learn English Level 2 | 25~48 | 저장소 media/english/archive/voa-lle2-full.json | 30 |
| American Stories | 달력 17편 (17주부터), 나머지 통과분 6편은 13주에 '열림' | https://learningenglish.voanews.com/z/1581 (목록 30쪽 361편) | 23 |
| America's National Parks | 달력 12편 (13~24주), 나머지 통과분 24편은 13주에 '열림' | https://learningenglish.voanews.com/p/5849.html (48편) | 36 |

권리: https://learningenglish.voanews.com/p/6861.html "Learning English texts, MP3s, photos and videos are in the public domain ... However, stories, photos and video images from news agencies such as AP, Reuters and AFP are copyrighted".
화면에 출처 줄 "VOA Learning English, learningenglish.voanews.com" 을 늘 띄운다. VOA 쪽은 받을 때 원문과 sha256 을 game_store/voa_ext/index.json 에 같이 남긴다 (2025년 3월 뒤로 새 글이 없어 주소가 사라질 수 있다).

### 3.2 LLE2 를 줄로 만드는 법

| 문제 | 처리 |
|---|---|
| 한 덩어리에 화자 이름이 박혀 있다 (01, 02, 04, 26) | 알려진 화자 이름 앞에서 다시 자른다 |
| 화자 이름 표기가 여럿 (Prof Bot, PROF. BOT VO, Pofessor Bot) | Professor Bot 하나로 맞추고 bot 표지 |
| 해설 문장이 화자 칸에 (Kaveh uses this when he says 등 여섯) | bot 으로 돌린다 |
| 화자 없는 줄 | 앞이 bot 이면 bot, 아니면 화자 없음. "Chef 1:" 꼴은 화자로 |
| 괄호 안 (무대 지시, 숫자 풀이), MUSIC 표지, 각주 | 뺀다. 뺀 수를 dropped 칸에 적는다 |
| 과 끝 낱말 목록 | 뺀다 (단어장) |
| 08과 대화 MP3 없음 | 영상 주소로 대신한다. audioNote 칸에 적는다 |

LLE2 주 배치는 계획 1.2 표 그대로다 (25주 01·02 부터 48주 08·19 까지). **30과가 한 번씩 다 나온다.**

### 3.3 American Stories 와 Parks 거름

| 규칙 | 뺀다 |
|---|---|
| 본문에 Associated Press, AP, Reuters, AFP, Agence France | 글 전체 |
| 원작자가 1963년 뒤 사망, 또는 사망 연도 표에 없음 (모름) | 글 전체. 표는 derive_ext_radio.py AUTHOR_DIED. 옛 민담(Paul Bunyan 등)은 원작자 없음으로 받는다 |
| 제목에 공포, 전쟁, 죽임, 악마, 유령, 노예, 정치인 (DENY_TITLE) | 글 전체. 계획 2.3 의 실측 목록과 경계 다섯을 다 넣었다 |
| 본문에 폭력 낱말 (kill, blood, gun, dead, ghost ...) 이 셋을 넘음 | 글 전체 |
| 가사, 영화 | 글 전체 |
| 사진과 캡션, Words in This Story, 퀴즈, 교사용 안내, 재생기 문구, 댓글과 SNS 안내 | 그 칸만 |
| 같은 글이 다시 실림 (Short Story:, Children's Story: 머리) | 하나만 둔다. 음성 있는 것, 긴 것, 늦은 것 순 |
| 여러 편짜리인데 첫 편이 거름에 걸림 | 남은 편도 뺀다 (Part Two 만 남는 일) |

기계 거름 뒤에 사람이 두 갈래를 고쳤다. 둘 다 derive_ext_radio.py 안에 이름으로 적혀 있다.

| 갈래 | 글 | 까닭 |
|---|---|---|
| 기계가 통과시켰는데 뺀다 (DENY_TITLE 끝 다섯) | William Wilson, Paul's Case, The Cop and the Anthem, From the Cabby's Seat, The Line of Least Resistance | 죽임과 분신, 자살로 끝남, 술과 체포, 술 취한 마부, 혼외 관계 |
| 기계가 뺐는데 받는다 (REVIEWED) | Two Thanksgiving Day Gentlemen, Chicken Little, The Ransom of Red Chief, A White Heron, The Lady or the Tiger, The Count and the Wedding Guest | 계획 2.3 이 읽고 남긴 것. 폭력 낱말 셈과 영화 언급만 건너뛴다. 통신사와 원작자 규칙은 그대로 건다 |

뺀 까닭은 편마다 game_store/voa_ext/judge_report.tsv 에 남는다.
**거름은 기계가 한 것이다.** 통과분도 사람이 한 번 훑는다. 특히 달력에 없는 '열림' 편은 13주에 같이 열리니 Q2 에 맞는지 본다.

## 4. NPC 잡담 (B)

| 항목 | 정한 것 |
|---|---|
| 원본 | Tatoeba eng_sentences_detailed, eng_tags, user_languages, eng_sentences_CC0 (https://downloads.tatoeba.org/exports/) |
| 권리 | CC BY 2.0 FR (CC0 문장은 CC0-1.0). 줄마다 id, owner, src. 크레딧 화면에 "Sentences from Tatoeba (tatoeba.org), CC BY 2.0 FR" 과 저자 목록 (owners 칸) |
| 거름 | 저자 없음, 영어 모어 아님, 나쁜 꼬리표, 3~8낱말 밖, 숫자와 따옴표, 첫머리 밖 대문자, 주제 금지어와 슬랭과 관용구와 상표와 실존 인물, 겹침 |
| 낱말 문 | **그 주까지 블록 1 에서 들은 LLE1 대본 낱말 (두 번 이상) 만.** 다른 문은 없다. wordlist.md 도 안 연다 |
| 배치 | 1~2주 0, 3~6주 30, 7~12주 50, 13~48주 60. 합 2,580. 한 문장은 1년에 한 번 |
| 저자 상한 | 한 주에 저자 하나가 40% 이하 |
| 고르는 순서 | 그 주에 새로 열린 것 먼저, CC0 먼저, 그다음 id 해시. 무작위가 없다. 장소 갈래 일곱(카페, 버스, 날씨, 일터, 집, 가게, 거리)을 돌려 가며 |
| 짝 | 물음과 대답을 짝짓지 않는다. Tatoeba 문장은 서로 대화가 아니다 |
| 화면 | 목록으로 안 낸다. NPC 가 지나가며 한 줄씩. 1층 표기 (학습용 인공물) |

**B 인 까닭.** 모어 화자가 쓴 문장이어도 그 장면에서 자연스러운지, 지금 쓰는 말인지는 모른다. spec 5.2 대로 주마다 10줄을 뽑아 검증 큐에 넣는다. 표본 기각이 30% 넘으면 그 주 묶음을 통째 뺀다.

## 5. 동네 안내문 (B)

원본은 `docs/ext_notices.md` 다. 사실은 줄마다 근거 칸 (문서, 쪽, 원문 인용) 을 가리킨다. 근거 문서 셋은 받아 둔 원본 PDF 다.

| 기호 | 문서 | 받아 둔 사본 |
|---|---|---|
| M618 | USCIS M-618 Welcome to the United States (rev. 09/15) | game_store/gov/uscis_M-618_welcome-guide_rev09-15.pdf |
| HUR | FEMA Be Prepared for a Hurricane (V-1006, 2023-09) | game_store/gov/fema_ready_hurricane_info-sheet_V-1006_2023-09.pdf |
| TSU | FEMA Be Prepared for a Tsunami (V-1011) | game_store/gov/fema_ready_tsunami_info-sheet_V-1011.pdf |

길이 (낱말). derive_ext_notices.py LENGTH 와 같다.

| 분기 | 게시판 | 방송 |
|---|---|---|
| Q1 | 12~60 | 12~60 |
| Q2 | 25~90 | 12~60 |
| Q3 | 30~110 | 12~60 |
| Q4 | 30~130 | 12~60 |

계획 4.1 은 Q1 40~60 이었다. **1주에 들은 낱말이 서른넷이라** 첫 안내문을 스무 낱말 남짓으로 줄였다. 아래 길이도 그래서 낮췄다.
화면에 "학습용 인공물. 공식 안내문이 아니다" 를 늘 단다. 기관 이름, 마크, 사진은 안 쓴다.

## 6. 도서관 책 (B)

원본은 `docs/ext_readers.md` 다. 지금 있는 것은 둘이다.

| 책 | 편 | 주 | 다룬 것 |
|---|---:|---|---|
| Westervelt, Legends of Old Honolulu (1915) II장 | 2 | 13, 14 | 지명 Honolulu 와 Kou, 옛 놀이 (kōnane, 굴리는 돌), Kawaiahaʻo 의 물, Māmala 의 파도. 사원, 제물, 유령, 상어 신 대목은 다 뺐다 |
| Stevenson, The Bottle Imp (1891) | 8 | 42~48 | 줄거리 전부. 악마는 "병 속의 무엇", 지옥은 "모든 것을 영원히 잃는다". 삼촌의 죽음과 술 대목은 바꿨고 병 이름과 Molokai 는 안 쓴다 |

길이와 낱말. derive_ext_readers.py LIMITS 와 같다.

| 분기 | 한 편 낱말 | 문장 최대 | 확장 낱말 비율 상한 |
|---|---|---:|---:|
| Q1 | 60~150 | 8 | 10% (설계. 아직 편이 없다) |
| Q2 | 100~300 | 10 | 26% (실측 최댓값 25.5%) |
| Q3 | 200~500 | 14 | 20% (설계. 아직 편이 없다) |
| Q4 | 350~800 | 18 | 15% (실측 최댓값 14.5%) |

확장 낱말 비율은 9장 '낱말' 줄에 올린 낱말이 글에서 차지하는 몫이다 (이름은 뺀다). 계획 5.3 은 Q2 2%, Q4 4% 였다.
**그 값으로는 한 편도 못 썼다. 이것이 이번 실측의 가장 큰 발견이다.**

| 까닭 | 실측 |
|---|---|
| LLE1 대본은 거의 현재형이다 | was, said 는 14주, had 는 18주에 처음 두 번이 된다 |
| 이야기에 꼭 드는 과거형이 48주까지도 안 들린다 | went, looked, sat, stood, knew, laughed, cried 는 LLE1 에 두 번이 안 된다 |
| 열쇠 낱말이 되풀이된다 | bottle 은 Bottle Imp 여덟 편에 다 나온다 |

그래서 상한은 계획 값이 아니라 **실측 최댓값 바로 위에 둔 막는 값이다.** 늘면 실패한다.
Q2 책은 74%, Q4 책은 85% 남짓이 들은 낱말이라 **혼자 읽기에는 어렵다.** 혼자 읽는 책이 아니라 Mrs. Tanaka 가 읽어 주고 둘이 따라 읽는 책으로 쓴다. 장소 전설 둘을 계획의 13, 14주에서 16, 17주로 미룬 것도 이 까닭이다 (13주 37%, 16주 26%). 17주는 Lā Kūʻokoʻa (11월 28일) 주라 도서관 작은 전시와 맞는다 (audit_culture 3장).
화면 맨 앞에 `틀` 줄 (1915년, 하와이 밖에서 온 사람이 쓴 책) 을 띄운다. Mr. Kahale 가 "우리 집에서는 다르게 전한다" 고 말할 자리를 둔다 (audit_culture 0장 4번).

## 7. 달력

`scripts/derive_ext_calendar.py` 가 다섯 파일의 week 칸에서 48주 x 다섯 칸을 낸다. 칸은 라디오, NPC, 잡담, 안내문, 책이다.
**칸이 비면 이유가 있어야 한다.** 이유는 아래 표에서 읽는다. 표에 없는 빈칸이 하나라도 있으면 달력을 안 낸다.

| 주 | 칸 | 이유 |
|---|---|---|
| 1-12 | 라디오 | Q1 은 보류. LLE1 말하기 발음 연습 영상 104편의 대본을 아직 못 찾았다 (계획 11장 11번) |
| 1-48 | NPC | ext_npc 는 아직 없다. scenes.md 2장 "들은 것만" 개정이 먼저다 (계획 1.4, 11장 10번) |
| 1-2 | 잡담 | 1~2주는 들은 낱말이 서른넷과 아흔둘이라 안 쓴다 (계획 3.2) |
| 2,6,8-9,13,15-22,26,28-30,32,35-37,39-41,43-45,48 | 안내문 | 받아 둔 정부 PDF 셋에 그 주 화와 맞는 사실이 없다. MedlinePlus 와 Ready.gov 다른 쪽을 받으면 채운다 |
| 1-15,18-41 | 책 | 아직 안 썼다. Q1 엽서 둘(Bird), Q2 나머지와 Q3 열둘이 남았다. 하와이 장소 전설은 감수자가 고르기 전에는 더 안 쓴다 |

## 8. 등급

| 자료 | 글 | 소리 | 화면 표기 |
|---|---|---|---|
| 라디오 (LLE2, American Stories, Parks) | 원문 그대로 | C-real (주소만) | 출처 줄 상시 |
| 잡담 | B | C-gen (게임 TTS) | 1층 표기 + 크레딧 |
| 안내문 | B (사실은 근거 있음, 영어는 내가 씀) | 방송 판은 C-gen | 학습용 인공물. 공식 안내문이 아니다 |
| 책 | B | 없음 | 학습용 인공물 + 원작 표기 + 틀 |

## 9. 확장 낱말

**들은 낱말과 wordlist.md 밖인데 새로 쓴 글이 쓰는 낱말이다.** 그 주부터 쓸 수 있다. 여기 없는 낱말이 안내문이나 책에 나오면 파생기가 안 낸다.
'이름' 은 사람, 땅, 놀이의 고유한 이름이라 비율에 안 센다. 잡담은 이 표를 안 연다 (들은 낱말만).
**적게 하는 것이 이 표의 일이다.** 글을 고쳐 들은 낱말로 쓸 수 있으면 여기서 지운다. 마지막 칸은 그 낱말을 쓰는 글이다.

| 주부터 | 갈래 | 낱말 | 쓰는 글 |
|---|---|---|---|
| 1 | 낱말 | call do fire hang help language not person say sick speak up very wait will your | n01 n08 n09 n14 n20 r03 r08 |
| 1 | 이름 | english | n01 |
| 3 | 낱말 | anyone bus card lot money of or pay ride taxi than use | n02 n03 n04 n08 n09 r02 |
| 4 | 낱말 | account carry keep name photo place safe take | n03 n04 n10 n11 n13 |
| 5 | 낱말 | ask receipt | n04 n06 r01 |
| 7 | 낱말 | helps learn names neighbor storm talk their | n05 n06 n12 n19 n21 n22 r01 |
| 10 | 낱말 | days doors drive food front generator heavy inside listen phones power radio rain send stay tonight walk water week windows | n06 n07 n08 n09 n12 n13 n15 n17 n18 n21 n23 r03 r05 r06 r07 r10 |
| 11 | 낱말 | appointment clinic cost doctor hospital | n09 r04 |
| 12 | 낱말 | copy dry each paper papers | n10 r01 r04 |
| 14 | 낱말 | asks give number only someone | n11 |
| 14 | 이름 | security social | n11 n14 |
| 16 | 낱말 | ago around calm changed chief chiefs gave grew had harbor its king land may means parts quiet streets taro years | n24 r01 r02 r03 r05 r07 r08 |
| 16 | 이름 | hawaiian hono honolulu kakuhihewa kou lulu oahu | r01 r02 r04 r05 r06 r07 r08 |
| 17 | 낱말 | another came church flat holes named road rolled round stone stones used watch waves white | r02 r05 r06 |
| 17 | 이름 | hao kawaiahao konane mamala | r02 |
| 23 | 낱말 | batteries kit light | n12 n13 n16 n21 |
| 24 | 낱말 | aid class cuts pain | n13 |
| 25 | 낱말 | comes free mail takes weeks | n14 r03 |
| 27 | 낱말 | arrow cover ground head high shaking signs stops wave | n15 n18 n23 |
| 31 | 낱말 | alarm button push smoke | n16 n20 |
| 33 | 낱말 | building count | n17 |
| 34 | 낱말 | arms knees neck shakes under | n18 n24 r04 r09 r10 |
| 38 | 낱말 | calls neighbors | n19 |
| 42 | 낱말 | bottle center clear colors community dollars face fifty floor forever held hill houses island less lives looked lose meeting moved ninety paid pocket practice rich safety shadow ships smart smiled threw young | n20 n24 r03 r04 r05 r06 r07 r08 r09 r10 |
| 42 | 이름 | francisco hawaii keawe san | r03 r04 r05 r06 r07 r08 r09 r10 |
| 43 | 낱말 | born box build coast coat counted cried flowers giving glass islands numbers opened picture pictures sixty sold surprised turned went wrote | r04 r05 r06 r07 r08 r09 r10 |
| 43 | 이름 | kona lopaka | r04 r05 r06 r07 |
| 44 | 낱말 | above bright clocks clouds color floors fruit newspapers porch rooms sang sat stood trees walls watched wide | r05 r06 r07 r08 r09 r10 |
| 45 | 낱말 | bath bird heart homes horse knew laughed mark married marry rode sickness singing stopped talked | r06 r07 r08 r09 r10 |
| 45 | 이름 | kailua kiano kokua | r06 r07 r08 r09 r10 |
| 46 | 낱말 | among buys cent cents everywhere fell five gone hotel lawyer lights listened price | r07 r08 r09 r10 |
| 46 | 이름 | beretania | r07 |
| 47 | 낱말 | alone beginning believed centime centimes chairs coin happiest higher horses months mountains porches roof september smiling storms strangers tables wind | n22 n23 n24 r08 r09 r10 |
| 47 | 이름 | france french papeete tahiti | r08 |
| 48 | 낱말 | asleep ate bed coins holding husband kindly lamp peace poor sailor tomorrow understood wife woke | r09 r10 |

## 10. 검사 (scripts/check_ext.py)

판마다 깸 시험이 있다. `python3 scripts/check_ext.py --break` 가 판마다 실패를 하나씩 심어 그 판이 잡는지 본다. 하나라도 안 잡으면 실패다.

| # | 판 | 무엇을 막나 |
|---:|---|---|
| 1 | license | 줄마다 권리 칸이 다섯 중 하나 |
| 2 | grade | 파일, 편, 줄마다 등급 (C-real, B) |
| 3 | audio | 저장소에 음성 파일 없음. 라디오의 audio 칸은 주소 (http) 뿐 |
| 4 | transcript | 라디오 편마다 글 줄이 하나 이상 |
| 5 | korean | 영어 칸에 한글 없음, 번역 짝 칸 없음 |
| 6 | wordlist | words, vocab, wordlist 칸 없음 |
| 7 | grammar | 24주까지 Professor Bot 줄 없음 |
| 8 | tatoeba | 잡담 줄마다 id, owner, src 가 맞음 |
| 9 | gate | 잡담 낱말이 그 주까지 들은 낱말 안. 안내문과 책은 9장 표까지 |
| 10 | author | 잡담 한 주에 저자 하나 40% 이하 |
| 11 | agency | 라디오 글에 AP, Reuters, AFP 없음 |
| 12 | brand | derive_town.py BRANDS 가 잡담, 안내문, 책에 없음 |
| 13 | slang | 슬랭 목록이 잡담, 안내문, 책에 없음 |
| 14 | sacred | 신성한 것 목록이 책과 안내문에 없음 |
| 15 | verify | B 편마다 검증로그 꼴 (날짜 / 근거 / 통과 보류 기각 / 조치) |
| 16 | calendar | 48주 다섯 칸이 차거나 7장 이유가 있음 |
| 17 | sources | 안내문 사실 줄마다 근거 주소, 책 편마다 원본 주소 |

## 11. 남은 것

| 것 | 왜 아직 |
|---|---|
| ext_npc (LLE2 줄을 NPC 대사로, 360줄) | scenes.md 2장 개정이 먼저다 |
| Everyday Grammar, Words and Their Stories, Health & Lifestyle 라디오 | 이번에 안 받았다. 같은 거름을 쓴다 |
| 안내문 나머지 서른여섯 (MedlinePlus, Ready.gov 다른 쪽, 동네 모임 퀴즈) | 원본을 아직 안 받았다. 2025 시민 문항 PDF 는 fetch_assets.py 가 받을 자리만 고쳤다 |
| 책 나머지 서른 | 1편씩 이 문서 9장 표를 늘리며 쓴다. 장소 전설은 감수자 뒤 |
| collect_b.py 가 ext_*.json 을 걷게 | 공용 파일이라 이번에 안 고쳤다 |
| all.py 차례와 manifest 목록 등록 | 공용 파일이라 이번에 안 고쳤다 |
