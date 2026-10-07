# 문화 지침. 하와이 원주민 문화와 호놀룰루를 게임에 담는 규칙

신뢰도: B 채집 (하와이 기관이 낸 공개 지침을 원문으로 대조했다. 하와이 원주민 감수자를 거치지 않았다)
검증로그: 2026-10-07 / Maʻemaʻe Toolkit 2022 원문 PDF, UH 하와이어 표기 안내, 주 법령(HRS 5-10, 8-1, 2023 Act 11, 2018 Act 104), NOAA 관찰 거리, OHA 가 올린 Paoakalani 선언, 공법 103-150, 한인 이민 기관 자료, Pukui-Elbert 사전과 Place Names of Hawaiʻi 를 읽고 규칙마다 출처를 달았다 / 보류 / 출처가 약한 규칙은 표에 B로 적었다. 원주민 감수는 사용자가 이 조사로 갈음하기로 했다 (2026-10-07)
상위 규격: docs/spec.md / docs/world.md 3.1 / docs/sources.md 3장 / docs/game.md 2장
작성일: 2026-10-07

**감수자를 두지 않기로 했다** (사용자 2026-10-07). 그래서 이 문서가 그 자리를 맡는다.
다만 이 문서의 A는 "하와이 기관의 원문이 그렇게 말한다" 는 뜻이지 "원주민이 이 게임을 보고 괜찮다고 했다" 는 뜻이 아니다.
**그 차이를 메우는 규칙이 하나 있다. 모르면 뺀다.** 넣을지 말지 갈리는 것은 넣지 않는 쪽이 기본이다.

이 문서는 상위 문서다. 게임 안의 내용을 바꾸는 사람은 누구든 4장 검토 목록을 통과해야 한다.
`scripts/check_culture.py` 가 2.2, 2.3, 2.4, 5.1 의 표를 그대로 읽어 검사한다. **표를 고치면 검사가 바뀐다.**
2026-10-07 문화 감사(읽기만 한 감사, 15건)가 짚은 문제를 이 문서가 지킬 규칙으로 옮겼다. 감사 원문은 저장소 밖 작업 공간에 있다.

등급 칸의 뜻은 이렇다.

| 등급 | 뜻 |
|---|---|
| A | 하와이 주 정부, 하와이 대학, HTA와 NaHHA, OHA, 박물관, 연방 법의 원문을 이번에 직접 열어 확인했다 |
| B | 2차 자료나 학술 논의, 생활 관찰, 내 판단이다. 감수자가 생기면 가장 먼저 물을 것이다 |

## 1. 원칙

| # | 원칙 | 무엇 | 근거 | 등급 |
|---|---|---|---|---|
| 1 | 살아 있는 문화다 | 하와이 원주민 문화는 지금 하와이에 있다. "옛날", "고대", "사라진" 으로 적지 않는다. 현재형으로 쓴다 | S1 Sensitivities "Ancient Hawaiian Practices" | A |
| 2 | 신성한 것은 놀이 장치에 안 넣는다 | 신, 사원(heiau), 상(kiʻi), 조상의 뼈, 의례 춤과 노래는 인물, 적, 꾸밈, 수집품, 퀘스트, 미니게임, 사진 자리 어디에도 안 쓴다 | S1 Heiau, Kiʻi, Sacred Sites. S8 문화 표현의 상업적 이용 반대 | A |
| 3 | "Hawaiian" 은 원주민만 가리킨다 | 주민 전체는 Hawaiʻi resident, local, kamaʻāina 다. 원주민은 Native Hawaiian(두 낱말 다 대문자), Kānaka Maoli 다 | S1 Hawaiian Language "Hawaiian (as an adjective)", Sensitivities "Native Hawaiian" | A |
| 4 | 땅의 사람과 건너온 사람을 한 줄에 세우지 않는다 | 원주민은 먼저 온 이민자가 아니다. "우리 모두 이민자" 이야기로 묶지 않는다. 한국인 이민사는 원주민이 사는 땅에 건너온 이야기로 적는다 | S25 (아시아계 정착민 식민주의 논의) | B |
| 5 | 바로 적는다 | ʻokina 는 U+02BB, 장음은 ā ē ī ō ū. 하와이 이름을 먼저 쓰고 영어 별명은 뒤에 | S1 Orthography, Proper Place Names. S3. S4. S5. S31 | A |
| 6 | 한 전승을 전부로 말하지 않는다 | 전설과 내력은 집안과 마을마다 다르다. 쓰더라도 "한 전승에 따르면" 으로 적고, 집안 이야기를 안 하겠다는 사람의 뜻을 따른다 | S1 Sensitivities "Traditions" | A |
| 7 | 하와이어 낱말과 가치를 우스개나 말장난으로 안 쓴다 | "Aloha means…" 류 말장난, "Big Kahuna", kamaʻāina 할인 농담 금지 | S1 Sensitivities "Humor & Wordplay", "Kahuna" | A |
| 8 | 문화를 상품으로 안 만든다 | 하와이어 가치 낱말을 업적, 배지, 메뉴, 아이템, 칭호 이름에 붙이지 않는다 | S8 (원칙). 게임에 옮긴 것은 내 판단 | B |
| 9 | 이야기의 주인은 그 사람들이다 | 원주민 이야기를 바깥 사람의 책과 입으로 대신 전하지 않는다. 쓸 수 있는 것은 공개된 사실과 지명 뜻까지다 | S26, S27, S28 | B |
| 10 | 실제 사람과 상표가 없다 | 실존 인물 이름(한인 독립운동가 포함)과 상표를 안 쓴다 | game.md 2장, sources.md 3.2 | A |
| 11 | 모르면 뺀다 | 근거를 못 찾은 표현, 그림, 장면은 넣지 않는다. 감수자가 없어서 생긴 이 과정의 운용 규칙이다 | 이 과정의 운용 규칙 | B |

## 2. 하라와 하지 마라

### 2.1 주제별 표

| 주제 | 하라 | 하지 마라 | 근거 | 등급 |
|---|---|---|---|---|
| 신성한 것 | 있다는 사실만 안다. 모르는 돌무더기와 구조물은 다 존중할 대상으로 다룬다 | heiau, kiʻi, 신(Pele 등), 조상의 뼈와 매장 굴, Kumulipo, 밤의 행렬, 옛 훌라와 oli 를 놀이, 꾸밈, 퀘스트, 적, 수집품, 사진 자리로 쓰기. 돌을 옮기거나 쌓는 장면, 잎에 싼 돌을 "공물" 로 두는 장면 | S1 Heiau, Kiʻi, Sacred Sites. S20. sources.md 3.5 | A |
| 살아 있는 문화 | 동네의 원주민 이웃은 지금을 사는 사람이다. 직업과 가족과 휴대전화가 있다 | "ancient", "고대 하와이인", "사라진 문화", 과거형 서술(world.md 71줄 "살았다" 꼴) | S1 "Ancient Hawaiian Practices" | A |
| 사람 부르는 말 | 원주민은 Native Hawaiian, Kānaka Maoli. 주민은 Hawaiʻi resident, local, kamaʻāina | 주민 전체를 "Hawaiian" 으로. "local" 을 원주민과 같은 뜻으로 | S1 "Hawaiian (as an adjective)", "Native Hawaiian" | A |
| 지명 | 게임 화면의 로마자 지명은 ʻokina 와 장음을 다 단다. 하와이 이름 먼저, 영어 별명 뒤: Lēʻahi (Diamond Head). Ala Moana, Ala Wai 는 두 낱말 | ʻokina 를 ' ‘ ’ 로 대신 쓰기. 장음 빼기. Kamehameha Day 를 "Kam Day" 로 줄이기. Diamond Head 만 쓰고 Lēʻahi 를 지우기 | S1 Orthography, Proper Place Names, "Abbreviation & Truncation". S5. S31 | A |
| 한국어 설계 문서 | 한국어 문장 안의 "하와이", "호놀룰루", "라나이" 같은 한국어 표기는 그대로 둔다. 화면에 나갈 로마자만 이 규칙을 따른다 | 한국어 음차를 게임 화면 표지나 지도 글자로 그대로 옮기기 | 이 과정의 운용 규칙 | B |
| 복수 | 하와이어 낱말에 영어 -s 를 안 붙인다. "two lei", "many keiki" | leis, keikis, lanais | S1 "Pluralization", Sensitivities "Lei" | A |
| 하와이 이름 짓기 | 1일차 이름 짓기 화면은 아무 이름도 권하지 않는다. NPC 의 새 하와이식 이름은 짓지 않는다 (지금 있는 Kahale, Malia 만) | 하와이식 이름 추천 목록, 무작위 하와이 이름 생성 | S1 "Giving Hawaiian Names" | A |
| Pidgin | Pidgin(Hawaiʻi Creole English)은 하나의 언어다. NPC 대사에 안 쓰는 까닭은 "이 과정의 학습 목표 밖" 이다. 배경 웅성임에 섞여 있어도 된다 | Pidgin 을 슬랭, 사투리, 망가진 영어, 못 배운 사람 표시, 우스개로 다루기. Pidgin 낱말을 하와이어라고 부르기 (kaukau 는 Pidgin 이다) | S1 "Pidgin or Pidgin English". S15. S16 | A |
| 레이 받기 | 받은 레이는 그날 건다. 벗어야 하면 보이는 곳에 걸어 둔다. 날이 지나면 마당 나무에 걸거나 흙에 묻고 실은 뺀다 | 레이를 거절하는 장면, 쓰레기통이나 바닥에 버리는 장면 | S1 Customs "Lei" (버리지 말고 걸어 둔다). 흙으로 돌려보내기는 생활 관습 자료뿐이다 | 버리기 A / 돌려보내기 B |
| 레이 그리기 | 하와이에서 자란 생화와 잎으로 만든 레이. 동네 사람이 탁자에서 꿰는 일상 공예 | 플라스틱과 인조 레이, 수입 난초 레이를 하와이 상징처럼, ʻōhiʻa lehua 레이. 임신한 사람에게 닫힌 레이를 거는 장면 | S1 Sensitivities "Lei", Customs "Lei" | A |
| 명절 | "그날 동네에 있었던 일" 로만 보인다. 두 사람은 구경하는 이웃이다. 날짜는 2.5 달력 | 명절을 퀘스트 보상, 해금 조건, 배지, 수집 대상으로. 두 사람이 의식의 주인공이 되기 | S9. S10. S1 Festivals | A |
| 동상에 레이 드리우기 (6월 11일, 3월 26일) | 멀리서 보이는 행사. 시민 단체와 가족이 한다 | 두 사람이 레이를 거는 장면, 사진첩 자동 촬영 | S9. S29. 거리 두기는 내 판단 | B |
| Lā Kūʻokoʻa (11월 28일) | 주법이 정한 기념일이다. **공휴일은 아니다.** 도서관 작은 전시 정도 | 공휴일처럼 가게를 닫는 장면 | S10. S11 | A |
| Statehood Day (8월 셋째 금요일) | 쉬는 날로만 | 축하 불꽃, 축제 장면. 원주민 다수에게 기념할 날이 아니라는 판단은 2차 자료뿐이다 | S9 (날짜). 판단은 B | B |
| 1893년 전복 | 24주(어림)에 도서관 게시판 한 장. 1893년 1월 17일 사실과 1993년 사과 결의(공법 103-150)를 쉬운 영어로(B등급 영어). 1903년 한국인이 닿은 곳이 그 뒤의 미국 영토였다는 한 줄 | 퀘스트, 선택지, 재연, 악역, 왕궁이나 여왕 초상을 꾸밈으로. 두 사람에게 옳고 그름을 고르게 하기. 주권 논의의 한 편을 게임이 정답으로 말하기 | S14. S1 Royal Heritage "Overthrow of the Hawaiian Kingdom" (주권 문제는 "very complicated", "many sensitivities") | A |
| 한국인 이민사 | 1903년 1월 13일 102명. 1905년까지 7천여 명. 그 뒤 사진 신부(수는 자료마다 다르다. "수백 명" 으로). 1909년 대한인국민회, 농장 노동자들이 임금을 떼어 독립운동을 도왔다. 이름 없는 기억으로 쓴다 ("할아버지가 월급에서 떼어 낸 돈") | 실존 인물 이름. 사진 신부를 낭만으로. 채찍과 감독(luna) 장면을 그리기. 한국인과 일본인 사이 긴장을 숨기거나 키우기 | S21. S22. S23. S24. sources.md 3.2. 낭만화와 긴장 처리는 B | 사실 A / 처리 B |
| 이민사와 원주민 | 7층 물음을 둘로 가른다. "이 땅의 사람은 누구인가" 와 "앞서 건너온 사람은 누구인가" | 원주민을 "먼저 온 사람" 으로 이민자 줄에 세우기 | S25 | B |
| 바다 생물 | 거리를 지키는 사람들을 그린다. 몽크물범 15m, 어미와 새끼 45m, 바다거북 3m, 돌고래 46m, 혹등고래 91m. 쉬는 몽크물범 둘레의 줄과 표지 | 동물을 만지기, 먹이 주기, 바짝 붙은 사진. 두 사람이 바다거북을 "구하는" 장면 | S18. S1 "Hawaiian Monk Seals", Mindful behaviors | A |
| 산호와 차단제 | 리프 세이프 차단제. oxybenzone, octinoxate 차단제는 하와이에서 팔지 못한다 | 산호를 밟는 장면 | S19 (법). 산호 밟기는 S1 의 "tread lightly" 를 옮긴 내 판단 | 법 A / 밟기 B |
| 토종 동식물 | 하와이 이름을 먼저: honu, manu-o-Kū, ʻilima, naupaka. 다른 열대 지역 꽃을 하와이 상징으로 쓰지 않는다 | 다른 열대 지역 동식물을 하와이 것처럼 | S1 Flora & Fauna, Mindful behaviors | A |
| 해변 청소 | 이미 있는 동네 일이고 두 사람은 자원봉사자다. 장갑, 자루, 체 | 두 사람이 땅을 지키는 사람이 되는 구원 서사 | S25 (정착민 무죄 서사 비판) | B |
| 숨은 명소 | 공개된 장소만 | "아무도 모르는 비밀 장소" 해금, 사유지와 위험한 곳 | S1 "Hidden Hawaiʻi" | A |
| 음식 | 일반명만: musubi, malasada, saimin, plate lunch, poke, poi, laulau, kālua pig, haupia, shave ice. 하와이 음식과 다민족이 섞인 지역 음식을 가른다 (plate lunch 는 지역 음식) | 상표 붙은 음식 이름(Spam musubi, Leonard's malasada). poi 를 낯설거나 역겨운 것, "벽지 풀" 로 그리기 | S1 "Hawaiian Food", "Lūʻau". derive_town.py 상표 목록. game.md 2장 | A |
| 잔치 | 가족 lūʻau(아이 첫돌, 졸업) 는 지역 전통이다 | 관광 lūʻau 쇼를 하와이 문화의 대표로. 횃불 춤(사모아의 것)을 하와이 것으로 | S1 "Lūʻau", "Other Polynesian Cultures" | A |
| 노래 | 1931년 이전 공표곡 가운데 뜻이 가벼운 곡이나 CC0 곡을 배경에 | "Aloha ʻOe" 를 배경 음악, 장면 끝 음악, 집들이 끝 음악으로. "Hawaiʻi Ponoʻī" 를 배경 음악으로 (행사에서 사람들이 일어서 부르는 소리로만). 전통 mele, oli | S12. S13. sources.md 3.4. 일어선다는 예절은 원문을 못 찾았다 | 곡 정체 A / 쓰임 B |
| 훌라 | TV 에서 대회 중계가 나오고 이웃이 본다 정도까지 | 훌라 동작을 모션 에셋으로, 두 사람에게 추게 하기, 훌라 미니게임, 훌라 인형, 다른 폴리네시아 춤을 훌라처럼 | S1 Customs "Hula", Sensitivities "Hula" ("whimsical hula-themed activities"), "Other Polynesian Cultures" | A |
| 그림 고정관념 | 평소 옷은 작업복, 티셔츠, 슬리퍼. 알로하 셔츠는 금요일 사무실 정장으로 | 풀치마, 코코넛 브라, 티키, 타히티 머리 장식, 늘 레이를 건 원주민 | S1 "Other Polynesian Cultures", "Kiʻi", "Tiki". S1 Customs "Aloha Friday" | A |
| 문신 | 그리지 않는다 | kākau 를 꾸밈으로 | 가문의 뜻이 있다는 판단. 원문 확인 못 함 | B |
| 사진첩 | 행사와 의식은 자동으로 안 찍힌다 | 레이 드리우기, 기념 행사, 원주민 관련 장소를 사진첩 수집 대상으로 | S1 "Tourism Hot Spots" 의 촬영 자제를 옮긴 내 판단 | B |
| 지도 | 원주민 관련 장소는 "불이 들어오는" 해금 대상에 안 넣는다 | 안개를 걷어 땅을 "발견" 하는 장치에 원주민 장소를 넣기 | 개척 은유 비판(S25, S26) | B |
| 낱말 고르기 | Continental U.S., Neighbor Islands | "Mainland", "Outer Islands" (게임 안 영어 글에서) | S1 "Mainland", "Neighbor Islands vs. Outer Islands" | A |
| 문화 실천가 | 나중에 원주민 성우, 작가, 실천가와 일하면 보수와 크레딧을 준다 | 무보수 "도움" 으로 문화 지식을 받기 | S1 "Cultural Practitioners" | A |

### 2.2 금지어. 신성한 것과 고정관념 (check_culture.py 가 읽는다)

**이 낱말이 게임 내용에 나오면 실패다.** 금지하는 문장(같은 줄에 "안 넣는다", "금지", "쓰지 않" 같은 말이 있는 줄)은 마크다운에서만 봐 준다. JSON 은 봐 주지 않는다.
여러 꼴은 ` / ` 로 가른다. 영어는 대소문자와 ʻokina 꼴을 안 가린다.

| 금지어 | 갈래 | 왜 | 근거 |
|---|---|---|---|
| `Pele` / `펠레` | 신성 | 신이다. 인물이나 적이나 저주 농담으로 쓰지 않는다 | S1 Kiʻi. sources.md 3.5 |
| `Lono` / `Kanaloa` / `Hiʻiaka` / `Māui` / `Kamapuaʻa` | 신성 | 신과 반신이다. Māui 는 장음이 있는 반신 이름이다(섬 Maui 와 다르다) | S1 Kiʻi, Proper Place Names. S6 |
| `heiau` / `헤이아우` | 신성 | 사원이다 | S1 Heiau |
| `kiʻi` / `tiki` / `티키` | 신성, 고정관념 | 신과 조상의 상이다. tiki 는 다른 폴리네시아 낱말이다 | S1 Kiʻi, Tiki |
| `Kumulipo` / `쿠물리포` | 신성 | 창조의 노래다 | sources.md 3.1, 3.5 |
| `night marchers` / `huakaʻi pō` / `밤의 행렬` | 신성 | 괴물로 쓰지 않는다 | sources.md 3.5 |
| `iwi kūpuna` / `조상의 뼈` / `매장 굴` | 신성 | 조상의 유해와 그 자리다 | S1 Sacred Sites. sources.md 3.5 |
| `ʻaumakua` / `ʻaumākua` | 신성 | 집안의 수호신이다 | S1 "ʻAumākua" |
| `hula kahiko` / `oli` | 신성 | 의례의 춤과 노래다 | S1 Customs "Hula" |
| `kahuna` / `kāhuna` / `Big Kahuna` / `카후나` | 신성, 말장난 | 오랜 수련 끝에 받는 칭호다. 말장난 금지 | S1 "Kahuna" |
| `menehune` / `메네후네` | 신성, 고정관념 | 전승의 사람들이다. 귀여운 마스코트로 쓰지 않는다 | S1 Proper Place Names (ʻAlekoko) |
| `Kalaupapa` | 아픈 역사 | 한센병 격리지다. 놀이 무대가 아니다 | sources.md 3.5 |
| `grass skirt` / `풀치마` | 고정관념 | 하와이 것이 아닌 그림 | S1 Other Polynesian Cultures |
| `coconut bra` / `코코넛 브라` | 고정관념 | 하와이 것이 아니다 | S1 Other Polynesian Cultures |
| `hula girl` / `hula doll` / `훌라 인형` / `훌라 걸` | 고정관념 | 장난스러운 훌라 그림 | S1 Sensitivities "Hula" |
| `fire knife` / `횃불 쇼` / `불춤` | 고정관념 | 사모아의 것을 하와이 것으로 | S1 Other Polynesian Cultures |
| `volcano sacrifice` / `화산 제물` / `Pele's curse` / `lava rock curse` / `용암 저주` | 고정관념 | 관광 신화와 저주 농담 | S1 Kiʻi, Sacred Sites. 저주 농담은 B |
| `Hawaiian time` / `하와이안 타임` | 고정관념 | 지각 농담 | S1 Humor & Wordplay (뜻을 넓힌 것은 B) |
| `Honorary Hawaiian` / `명예 하와이인` | 놀이화 | "Hawaiian" 은 원주민만 가리킨다 | S1 "Hawaiian (as an adjective)" |
| `Big Island` | 지명 | 영어 별명이다. Hawaiʻi Island 로 | S1 Proper Place Names |
| `Chinaman's Hat` | 지명 | 모욕적인 별명이다. Mokoliʻi 로 | S1 Proper Place Names |

### 2.3 놀이 장치와 같은 줄에 서면 안 되는 낱말 (check_culture.py 가 읽는다)

"문화" 쪽 낱말과 "장치" 쪽 낱말이 **한 줄(JSON 은 한 문자열)에 같이 있으면 실패다.** 따로 있는 것은 괜찮다.
레이가 탁자에 있는 것은 되고 레이가 보상인 것은 안 된다. 금지하는 문장은 2.2 와 같이 봐 준다.

| 낱말 | 쪽 | 왜 |
|---|---|---|
| `aloha` / `알로하` | 문화 | 가치 낱말. 상품 문구로 닳았다 (S1 Humor & Wordplay) |
| `mahalo` / `마할로` | 문화 | 같다 |
| `kuleana` / `쿨레아나` | 문화 | 책임과 권리. 가치 낱말 |
| `ʻohana` / `오하나` | 문화 | 가족. 상품 문구로 닳았다 |
| `mālama` / `말라마` | 문화 | 돌봄. 가치 낱말 |
| `pono` / `포노` | 문화 | 바름. 주 표어의 낱말이다 |
| `mana` / `마나` | 문화 | 게임 자원(MP)으로 쓰지 않는다 |
| `kapu` / `카푸` | 문화 | 금기. 게임 규칙 이름으로 쓰지 않는다 |
| `lei` / `레이` | 문화 | 선물이고 예절이 있다 (2.1) |
| `hula` / `훌라` | 문화 | 2.1 훌라 |
| `Liliʻuokalani` / `릴리우오칼라니` / `여왕` | 문화 | 사람이다. 수집 카드나 보상이 아니다 |
| `Kamehameha` / `카메하메하` / `Kūhiō` / `쿠히오` | 문화 | 사람과 기념일이다 |
| `Kūʻokoʻa` / `쿠오코아` | 문화 | 기념일이다 |
| `1893` / `overthrow` / `전복` | 문화 | 2.1 1893년 전복 |
| `Native Hawaiian` / `Kānaka Maoli` / `하와이 원주민` / `원주민 문화` | 문화 | 사람이다 |
| `업적` / `배지` / `퀘스트` / `보상` / `점수` / `수집품` / `해금` / `레벨` / `미니게임` / `아이템` / `칭호` / `경험치` / `포인트` / `랭킹` | 장치 | 게임 장치 |
| `achievement` / `badge` / `quest` / `reward` / `points` / `score` / `collectible` / `unlock` / `level up` / `XP` / `minigame` / `mini-game` / `trophy` | 장치 | 같다 |

### 2.4 노래 두 곡 (check_culture.py 가 읽는다)

"노래" 쪽 이름과 "쓰임" 쪽 낱말이 한 줄에 같이 있으면 실패다. 마크다운 표의 머리 칸에 "곡" 이 있으면 그 표 줄은 다 쓰임으로 본다 (곡을 고르는 표이기 때문이다).
"허용" 쪽 낱말이 같은 줄에 있으면 통과다. 사람들이 일어서 부르는 행사 장면이 그 자리다.
이 검사만은 `docs/sources.md` 도 본다. 곡을 고르는 표가 거기 3.4 에 있다.

| 낱말 | 쪽 |
|---|---|
| `Aloha ʻOe` / `알로하 오에` | 노래 |
| `Hawaiʻi Ponoʻī` / `하와이 포노이` | 노래 |
| `배경 음악` / `배경음` / `BGM` / `background music` / `배경에` / `엔딩` / `끝 음악` / `집들이 끝` / `장면 끝` / `틀어` / `틀면` / `튼다` / `흐른다` / `반복 재생` / `loop` / `미니게임` / `minigame` / `효과음` / `연주로 새로 녹음` / `동네 행사` / `메뉴 음악` / `로딩` | 쓰임 |
| `일어서` / `일어선다` / `stand` / `배경 음악 금지` / `배경 음악으로 쓰지` / `배경 음악으로 안` | 허용 |

"Aloha ʻOe" 는 1878년 Liliʻuokalani 가 지은 이별 노래다 (S13). "Hawaiʻi Ponoʻī" 는 왕국 때 지은 노래이고 지금 주가(state song)다 (S12).
두 곡 다 작곡 권리는 끝났다. **권리가 끝났다는 것과 아무 데나 깔아도 된다는 것은 다른 말이다.**
"Aloha ʻOe" 를 44주 Daniel 이 떠나는 날 쓸지조차 모르면 뺀다(원칙 11).

### 2.5 달력. 무엇을 어떻게 보이나

주는 world.md 5장 가정(Q1 1주가 8월 첫 주, 23주가 새해)으로 센 어림이다. 앞뒤 1주는 어긋날 수 있다.
**어느 날도 퀘스트, 보상, 해금이 아니다.** "그날 동네에 있었던 일" 이다.

| 주(어림) | 날 | 보이는 것 | 근거 | 등급 |
|---|---|---|---|---|
| 2~3 | 8월 15일 광복절 | Lee 부부 라나이에 태극기 하나. 설명 없이 | 생활 관찰 | B |
| 3 | 8월 셋째 금요일 Statehood Day | 쉬는 날로만. 축하 장면 없음 | S9 | 날짜 A / 처리 B |
| 5~8 | 9월 Aloha Festivals | 넣지 않거나 멀리 들리는 행렬 소리만 | S1 Festivals | B |
| 1~12 | 매달 첫 근무일 11시 45분 사이렌 시험 | 10주 허리케인 화 앞에 깐다. 동네 사람은 신경 안 쓴다 | S32 | B |
| 17 | 11월 28일 Lā Kūʻokoʻa | 도서관 작은 전시. 공휴일 아님 | S10. S11 | A |
| 22~23 | 연말과 새해 | 폭죽과 연기, 떡 치기(mochitsuki), 이웃끼리 음식 돌리기 | 생활 관찰 | B |
| 24 | 1월 13일 Korean American Day, 1월 17일 전복 | Lee 부부 집 작은 모임과 도서관 게시판 한 장. **둘을 같은 주에 같이 다룬다.** 한쪽만 기념하면 그림이 기운다 | S21. S14 | 날짜 A / 같이 다루기 B |
| 26~28 | 음력 설 | 사자춤 소리, Lee 부부의 떡국 | 생활 관찰 | B |
| 28~31 | 사순절 전 화요일 Malasada Day | 사무실에 누가 말라사다 상자를 가져온다. 상표 없이 | 생활 관찰 | B |
| 29 | 3월 1일 삼일절 | 교회나 도서관 게시판. 실명 없이 | 생활 관찰 | B |
| 32~33 | 3월 26일 Prince Kūhiō Day | 시민 단체(civic club)가 여는 행사. 멀리서. Kūhiō 는 1918년 첫 Hawaiian Civic Club 을 세웠고 1921년 Hawaiian Homes Commission Act 를 이끌었다 | S9. S29 | A |
| 33~35 | 부활절 주말 | 해변 공원에 가족 천막이 줄지어 선다 | 생활 관찰 | B |
| 37 | 5월 1일 Lei Day | **한 주로 좁힌다** (지금 town.md 는 37~40 넉 주 "꽃 축제"). 동네 사람이 레이를 꿰는 탁자. 학교 무대 훌라는 그리지 않거나 소리만 | S17 | A |
| 40~42 | 졸업철 | 졸업생이 레이를 귀까지 쌓아 건다. 마당 파티 | S1 Customs "Lei" (졸업에 레이) | A |
| 41~42 | Memorial Day | 국립묘지 레이 행사(멀리서) | S9 | B |
| 43 | 6월 11일 King Kamehameha I Day | 동상 레이 드리우기와 꽃 행렬을 멀리서. "Kam Day" 로 줄이지 않는다 | S9. S1 Abbreviation | A |
| 43~48 | 본 댄스 철 | 절 마당의 등불과 북. 누구나 낄 수 있다. Mrs. Tanaka 가 데려간다 | 생활 관찰 | B |
| 47 | 7월 4일 Independence Day | 불꽃. 그대로 | S9 | A |

## 3. 인물 울타리

### 3.1 Mr. Kahale

지금 문서(world.md 4장, 42주, town.md 5장)와 장면(scenes.json 에서 Mr. Kahale 가 Q4 블록 3 카드 450장을 혼자 낸다. 2026-10-07 셈)이 이 울타리 몇 개를 넘고 있다. 고치는 것은 그 문서 주인의 일이고 이 표는 기준이다.

| 울타리 | 하라 | 하지 마라 | 근거 | 등급 |
|---|---|---|---|---|
| 사람 | 낮 직업(예: 시 상수도 기술자, 과학 교사), 가족(손주 데리러 가느라 모임을 일찍 끝내는 날), 취미(카누 클럽 연습), 유머, 의견이 있다 | "문화 담당" 으로만 존재하기. 해변 청소와 행사만 하는 사람 | S26 (원주민을 전통 안에만 두는 고정관념) | B |
| 말투 | 실무로 말한다. 장갑 몇 켤레, 몇 시, 누가 음료를 가져오나. 대사는 VOA 줄 그대로다(scenes.md) | 격언으로만 말하는 현자, 자연과 교감하는 신비로운 안내자 | S25 | B |
| 주체성 | 회의에서 Ben 과 의견이 갈리고 그가 정한다. "그건 찍지 말아 달라", "그건 우리 집 이야기라 안 한다" 고 말할 수 있다 | 묻는 것마다 다 알려 주기. 집안 전승을 두 사람에게 들려주기 | S1 "Traditions" | A |
| 땅의 책임 | 끝까지 그가 동네 모임 진행자다. 42주는 그가 순서 하나(청소 보고, 포틀럭 신청 받기)를 두 사람에게 부탁하는 화로 | "이 땅을 돌보는 일을 맡긴다", 진행을 "넘겨받는다" (world.md 4장, 5.4장 42주) | S25 (정착민에게 넘겨주는 서사 비판) | B |
| 카드 | 그가 내는 카드는 모임 진행에 맞는 것만("확인", "시간"). 나머지 host 는 Ben, Lee 부부, 동네 사람에게 돌린다 | 한 사람이 장소의 카드를 다 내는 문제 자판기 (장소의 첫 사람이 host 로 고정된 지금 셈) | scenes.json 셈. 판단은 B | B |
| 혼자가 아니다 | 원주민 인물이 평범한 자리에도 있다(버스 기사, 진료소 간호사, Malia 를 원주민 집안으로 정할 수 있다) | 원주민이 동네에 그 한 사람뿐이기 | S26 | B |
| 옷과 몸 | 작업복, 티셔츠, 슬리퍼. 금요일 알로하 셔츠 | 늘 알로하 셔츠에 레이. 문신을 그리기 | S1 Aloha Friday, Other Polynesian Cultures | A |
| 이름 | Kahale 는 ka-HA-le 로 읽는다. TTS 에 음소를 지정하고 틀리면 그 줄을 TTS 로 내지 않는다 | 틀린 발음을 그대로 내보내기 | 발음 표기는 B | B |
| 48주 | 집들이에 손님으로 온다. 두 사람이 그를 대접한다 | 그가 두 사람에게 마지막 축복을 주는 장면 | 관계가 거꾸로도 흐르게 하는 판단 | B |
| 하와이어 | 그가 하와이어 낱말을 쓰면 5.1 목록 안에서만 | 그가 두 사람에게 하와이 이름을 지어 주기 | S1 "Giving Hawaiian Names" | A |

### 3.2 Mr. and Mrs. Lee

| 울타리 | 하라 | 하지 마라 | 근거 | 등급 |
|---|---|---|---|---|
| 세대 | 한국계 3세면 "할아버지가 1903년 배에 있었다" 거나 "할머니가 사진 신부로 왔다" 다 | "할아버지의 할아버지" (world.md 4장. 그러면 5세다) | 세대 셈: 이민자 1세, 자녀 2세, 손주 3세 | A |
| 말 | 영어로 산다. 한국어를 조금 아는 정도 | 한국어로 두 사람을 돕는 다리. 게임은 영어 전용이다 | spec(영어 전용). 3세 언어는 B | B |
| 기억 | 이름 없는 집안 기억: 월급에서 떼어 낸 독립 자금, 한국어 학교와 교회 | 실존 인물 이름. 독립운동 지도자 이름 | sources.md 3.2. S22 (대한인국민회 소송 기록 묶음이 따로 있을 만큼 다툼이 컸다) | 이름 금지 A / 다툼 판단 B |
| 사진 신부 | 사진 한 장 보고 바다를 건넌 젊은 여성, 그 뒤 교회와 학교를 꾸린 사람. 사실까지만 | 낭만, 운명적 사랑 | S24 | B |
| 농장 | 말로만, 짧게 | 채찍과 감독(luna) 장면을 그리기. 농장 일을 미니게임으로 | sources.md 3.2 ("미화하지 않는다") | B |
| 자리 | 그들의 이야기는 건너온 사람의 이야기다 | Lee 부부가 원주민 역사를 대신 들려주기. Lee 부부를 "이 땅의 첫 사람" 처럼 | S25 | B |
| 음식 | 김치, 갈비, 만두, meat jun. 상표 없이 | 상표 이름 | game.md 2장 | A |
| 날 | 1월 13일 작은 모임, 3월 1일과 8월 15일 작은 표시 | 큰 의식, 연설 | S21 | B |

## 4. 검토 목록

**게임 안의 내용이 바뀌면 이 목록을 다 통과해야 한다.** world.md, town.md, scenes.md, sources.md 3장, out/game/*.json, 앞으로 생길 안내판, 지도, 가이드북, 도서관 책 글이 다 해당된다.
통과는 예와 아니오로 가린다. 하나라도 아니오면 그 바꿈은 미완성이다.

| # | 물음 | 통과 |
|---|---|---|
| 1 | `python3 scripts/check_culture.py` 실패가 0인가 | 실패 0 |
| 2 | 하와이 원주민을 과거형이나 "ancient" 로 적은 줄이 0인가 | 0줄 |
| 3 | 신성한 것(2.2)이 장치, 꾸밈, 사진, 수집에 들어간 자리가 0인가 | 0곳 |
| 4 | "Hawaiian" 이 원주민 아닌 사람을 가리킨 자리가 0인가 | 0곳 |
| 5 | 화면에 나갈 하와이어 낱말이 다 5.1 목록에 있는가. 없으면 사전 근거와 함께 먼저 목록에 더했는가 | 목록 밖 0개 |
| 6 | 한 장면에 하와이어 낱말이 2개 이하인가 (장식으로 흩뿌리지 않는다) | 장면당 2개 이하 |
| 7 | 명절과 기념일이 보상, 해금, 퀘스트 조건으로 쓰인 자리가 0인가 | 0곳 |
| 8 | 1893년 전복을 다루는 자리가 도서관 게시판 1장 이하이고 선택지가 0인가 | 1장 이하, 선택지 0 |
| 9 | 실존 인물 이름(한인 독립운동가 포함)이 0인가 | 0개 |
| 10 | 상표 이름이 0인가 (`derive_town.py` 가 동네 표를 보고 이 검사가 나머지를 본다) | 0개 |
| 11 | 바다 생물 장면이 2.1 거리보다 가까운 사람을 그린 자리가 0인가 | 0곳 |
| 12 | Mr. Kahale 가 땅이나 진행을 "맡기는" 장면이 0이고, 그가 내는 카드가 모임 진행 카드뿐인가 | 0장면, 진행 카드 외 0장 |
| 13 | 원주민 인물이 Mr. Kahale 한 사람뿐인 분기가 0인가 (Q4 기준) | 0분기 |
| 14 | Pidgin 이 우스개나 "못 배운 사람" 표시로 쓰인 자리가 0인가 | 0곳 |
| 15 | 레이가 버려지거나 거절되는 장면이 0인가 | 0장면 |
| 16 | 원주민 전설이나 집안 이야기를 바깥 사람(사서, 작가, 두 사람)이 전하는 장면에 "1915년, 하와이 밖에서 온 사람이 쓴 책" 같은 출처 밝힘이 있는가 | 밝힘 없는 장면 0 |
| 17 | 새 규칙이나 낱말을 더했으면 출처 URL 이 6장에 있고 근거가 약하면 B로 적었는가 | 출처 없는 A 0개 |

### 4.1 검사기가 보는 것과 못 보는 것

`scripts/check_culture.py` 는 위 물음 가운데 1번만 기계로 본다. 2~17번은 사람이 읽고 답한다.

| 규칙 | 보는 것 | 어디 |
|---|---|---|
| (a) | 2.2 금지어, 2.3 문화 낱말과 장치 낱말이 한 줄에 같이 | world.md, town.md, scenes.md, out/game/*.json |
| (b) | 5.1 에서 검사가 "예" 나 "철자" 인 낱말이 ʻokina 나 장음 없이, 또는 U+02BB 아닌 글자(U+0027, U+2018, U+2019, U+02BC, U+0060, U+00B4)로 적힌 것. 검사가 "예" 인 낱말에 영어 -s 복수. 결합 장음 부호(U+0304) | 같다. 다만 VOA 대본 줄(출처가 lle1-)은 안 본다. 들은 그대로여야 하기 때문이다 |
| (c) | 2.4 노래 이름이 배경 음악 쓰임과 한 줄에 | 같은 넷과 docs/sources.md |

**못 보는 것.** 뜻(과거형, 구원 서사, 신비화), 그림, 소리, 장면의 흐름. 금지하는 문장을 봐 주는 것은 줄 단위라서 한 줄에 금지와 허용이 섞이면 놓칠 수 있다.
그리고 **5.1 목록 밖의 하와이어 낱말은 철자를 안 본다.** 낱말을 더할 때는 목록에 먼저 넣어야 검사가 그 낱말을 안다.

## 5. 쓰는 하와이어 낱말

**흔한 생활 낱말과 지명만이다. 신성한 낱말은 없다.** 철자는 Pukui-Elbert 사전(1986)과 Place Names of Hawaiʻi(1974)를 S6 에서 하나씩 찾아 맞췄다.
대사는 여전히 VOA 줄 그대로다(scenes.md). 이 낱말들은 안내판, 지도, 차림표, 도서관 게시판 같은 **글자** 자리에 쓴다.

### 5.1 목록 (check_culture.py 가 읽는다)

검사 칸: "예" 는 철자와 복수를 다 본다. "철자" 는 철자만 본다(영어 복수가 흔한 낱말). "아니오" 는 안 본다(같은 철자의 다른 낱말이 있다).

| 낱말 | 뜻 | 쓰는 자리 | 검사 | 근거 |
|---|---|---|---|---|
| `aloha` | 안녕(만나고 헤어질 때), 사랑 | 안내판 인사. 업적, 메뉴, 상품 이름에는 안 쓴다 (2.3) | 아니오 | S6 |
| `mahalo` | 고마움, 고맙다 | 쓰레기통, 버스, 가게 표지 | 예 | S6 |
| `lānai` | 지붕 있는 툇마루, 베란다 | 이웃집, 새 집 | 예 | S6 |
| `keiki` | 아이 | 공원 표지, 차림표의 어린이 메뉴 | 예 | S6 |
| `pau` | 끝났다 | 가게 문 표지 | 예 | S6 |
| `mauka` | 산 쪽 | 지도 방위, 길 안내 (S1 은 ma uka 로도 적는다) | 예 | S6. S1 |
| `makai` | 바다 쪽 | 지도 방위, 길 안내 (S1 은 ma kai 로도 적는다) | 예 | S6. S1 |
| `ʻEwa` | 호놀룰루에서 서쪽(ʻEwa 쪽)을 가리키는 방위이자 지명 | 지도 방위 | 철자 | S6 |
| `kamaʻāina` | 오래 산 주민, 그 땅에서 난 사람 | 가이드북 글 | 예 | S6. S1 |
| `kōkua` | 도움 | "Please kōkua" 안내판 | 철자 | S6 |
| `pūpū` | 전채, 안주 | 차림표 | 예 | S6 |
| `ʻono` | 맛있다 | 차림표 | 아니오 | S6. S1 (ono 는 생선 이름이라 철자로 못 가른다) |
| `honu` | 푸른바다거북 | 해변 안내판 | 예 | S6 |
| `ʻilima` | 오아후 섬 꽃, 노란 꽃 관목 | 꽃 이름표 | 예 | S6 |
| `naupaka` | 해안 관목, 반쪽 모양 흰 꽃 | 꽃 이름표 | 예 | S6. S1 |
| `manu-o-Kū` | 흰제비갈매기. 호놀룰루 시 새 | 새 이름표 | 철자 | S6 |
| `wikiwiki` | 빨리 | 표지 | 예 | S6 |
| `wahine` | 여자 | 화장실 표지 | 예 | S6 |
| `kāne` | 남자 | 화장실 표지 | 예 | S6 |
| `hale` | 집, 건물 | 건물 이름 | 아니오 | S6 (영어 hale 과 같은 철자) |
| `puka` | 구멍 | 생활 글 | 예 | S6 |
| `ʻōpala` | 쓰레기 | 쓰레기통 표지 | 예 | S6. S1 |
| `lei` | 꽃목걸이. 복수도 lei | 2.1 레이 | 예 | S6. S1 |
| `lūʻau` | 잔치 (본뜻은 어린 토란잎) | 가족 잔치 | 예 | S6. S1 |
| `poke` | 깍둑 썬 날생선 무침 (본뜻은 가로로 썰다) | 차림표 | 아니오 | S6. S1 (영어 poke 와 같은 철자) |
| `poi` | 토란을 찧은 음식 | 차림표 | 철자 | S6. S1 |
| `kalo` | 토란 | 시장, 차림표 | 예 | S6 |
| `laulau` | 잎에 싸서 찐 음식 | 차림표 | 예 | S6 |
| `haupia` | 코코넛 푸딩 | 차림표 | 예 | S6. S1 |
| `kālua` | 땅 화덕에 익힌 (kālua pig) | 차림표 | 예 | S1 Lūʻau |
| `lilikoʻi` | 패션프루트 | 시장, 차림표 | 예 | S6 |
| `ʻōlelo Hawaiʻi` | 하와이어 | 도서관 게시판 | 철자 | S6. S1 |
| `Hawaiʻi` | 하와이 (섬과 주) | 모든 글 | 철자 | S6. S1 |
| `Oʻahu` | 오아후 섬 | 지도 | 철자 | S6 |
| `Honolulu` | 호놀룰루 | 모든 글 | 철자 | S6 |
| `Waikīkī` | 와이키키 | 지도, 버스 정류장 | 철자 | S6. S1 |
| `Mānoa` | 마노아 | 지도, 버스 정류장 | 철자 | S6 |
| `Kapiʻolani` | 카피올라니 (거리, 공원) | 버스 정류장 | 철자 | S6 |
| `Kalākaua` | 칼라카우아 (거리) | 버스 정류장 | 철자 | S6 |
| `Kūhiō` | 쿠히오 (거리, 해변, 기념일) | 버스 정류장, 달력 | 철자 | S6. S9 |
| `Kamehameha` | 카메하메하 (기념일, 길) | 달력 | 철자 | S6. S9 |
| `Kūʻokoʻa` | 독립 (Lā Kūʻokoʻa) | 달력 | 철자 | S6. S10 |
| `Liliʻuokalani` | 릴리우오칼라니 (사람, 거리, 건물) | 도서관 게시판 | 철자 | S6. S13 |
| `Koʻolau` | 코올라우 산맥 | 지도, 원경 이름 | 철자 | S6. S1 |
| `Lēʻahi` | 다이아몬드 헤드의 하와이 이름 | 지도. Lēʻahi (Diamond Head) 꼴로 | 철자 | S6. S1 |
| `Mōʻiliʻili` | 모일리일리 | 버스 정류장 | 철자 | S6 |
| `Kakaʻako` | 카카아코 | 지도 | 철자 | S6 |
| `Kaimukī` | 카이무키 | 지도 | 철자 | S6 |
| `Nuʻuanu` | 누우아누 | 지도 | 철자 | S6 |
| `Makiki` | 마키키 | 지도 | 아니오 | S6 (부호 없음) |
| `Pālolo` | 팔롤로 | 지도 | 철자 | S6 |
| `Keʻeaumoku` | 케에아우모쿠 (거리) | 지도 | 철자 | S6 |
| `Ala Wai` | 알라 와이 (운하, 두 낱말) | 지도 | 아니오 | S6. S1 (부호 없음) |
| `Ala Moana` | 알라 모아나 (두 낱말) | 지도 | 아니오 | S6. S1 (부호 없음) |
| `Kona` | 남풍 (Kona wind), 바람 아래 쪽 | 날씨 방송 글 | 아니오 | S6 (부호 없음) |

### 5.2 목록에 일부러 안 넣은 낱말

| 낱말 | 왜 |
|---|---|
| ʻohana, kuleana, mālama, pono, aloha ʻāina | 가치 낱말이다. 상품과 문구로 가장 많이 닳았다. 게임이 장식으로 쓰면 그 닳음에 더한다 (2.3) |
| mana, kapu, kahuna, ʻaumakua, heiau, kiʻi | 신성하거나 의례와 이어진다 (2.2) |
| haole | 민감한 낱말이다(욕은 아니다). 게임 글에 쓸 까닭이 없다 (S1 "Haole") |
| kaukau | Pidgin 낱말이다. 하와이어가 아니다 (S1) |
| ʻIolani | 왕궁 이름이다. 왕궁은 wahi pana 로 다룬다 (S1 Royal Heritage). 도서관 게시판 글에서만, 감수 없이 꾸밈으로 안 쓴다 |
| wahi pana | 신성하거나 뜻이 큰 장소라는 말이다. 게임이 그런 장소를 고르지 않는다 |

### 5.3 글자

| 무엇 | 바른 글자 | 틀린 글자 |
|---|---|---|
| ʻokina | U+02BB (숫자 6 모양으로 서는 글자. 자리를 차지하는 자음이다) | U+0027 곧은 따옴표, U+2018 여는 따옴표, U+2019 닫는 따옴표, U+02BC, U+0060, U+00B4 |
| kahakō | 합쳐진 글자 ā ē ī ō ū (U+0101, U+0113, U+012B, U+014D, U+016B) | 모음 뒤에 결합 부호 U+0304 를 붙인 꼴 |
| 대문자 장음 | U+0100, U+0112, U+012A, U+014C, U+016A 는 게임 JSON 에는 쓸 수 있다 | **check.py 의 문자 범위에 없다.** 그래서 마크다운 문서에서는 문장을 소문자 장음으로 시작하게 쓴다 (ʻōlelo Hawaiʻi). 지금 이 문서도 그렇게 썼다 |
| 영어 형용사 | Hawaiian (부호 없음. 영어 낱말이다) | Hawaiʻian |
| 영어 차용어 | ukulele (VOA 대본에 이 꼴로 나온다. 들은 그대로 둔다) | 하와이어 글자 자리(표지)에서는 ʻukulele |

S1 은 ʻokina 를 "숫자 6 모양" 으로 보이게 하라고만 한다. U+2018 도 6 모양으로 보이지만 따옴표 글자다.
UH 는 ʻokina 를 &#699;(U+02BB)로 적으라고 코드까지 준다(S3). **이 과정은 U+02BB 하나로 고정한다.** 검사기가 가르려면 글자가 하나여야 한다.
글꼴 확인은 아직이다. Pretendard 와 Noto Sans KR 에서 U+02BB 와 ā ē ī ō ū 가 깨지지 않는지 화면에서 한 번 본다.

## 6. 출처

모두 2026-10-07 에 열었다. 열지 못한 것은 따로 적었다.

| # | 출처 | 주소 | 무엇에 |
|---|---|---|---|
| S1 | Hawaiʻi Tourism Authority, Native Hawaiian Hospitality Association. Maʻemaʻe Toolkit (2022 Edition). 원문 PDF 64쪽을 다 읽었다 | https://hta.hawaii.gov/wp-content/uploads/2026/06/maemae-toolkit_withspread-1.pdf | 언어, 민감 사항, 지명, 관습, 왕실 역사. 이 문서 A의 대부분 |
| S2 | HTA. Maʻemaʻe Toolkit 소개 쪽 | https://hta.hawaii.gov/what-we-do/tools-resources/ma%ca%bbema%ca%bbe-toolkit/ | S1 의 목적 |
| S3 | University of Hawaiʻi System. Hawaiian Language Considerations | https://www.hawaii.edu/offices/communications/standards/hawaiian-language-considerations/ | ʻokina 는 따옴표가 아니다. &#699; 코드. 하와이어 낱말을 기울이지 않는다 |
| S4 | University of Hawaiʻi. Hawaiian Language Online, diacritics | https://hawaii.edu/site/info/diacritics.php | 주와 UH 가 표기를 권한다 |
| S5 | Hawaiʻi Board on Geographic Names | https://planning.hawaii.gov/?p=166 , https://files.hawaii.gov/dbedt/op/gis/bgn/HBGN_Meeting_20250409_05-HBGN_Background.pdf | 지명 표기의 기준과 Pukui 지명 사전 |
| S6 | Wehewehe Wikiwiki (UH Hilo). Pukui-Elbert Hawaiian Dictionary (1986), Place Names of Hawaiʻi (1974), Hawaiʻi Place Names (2002) | https://hilo.hawaii.edu/wehe/ | 5.1 의 철자와 뜻. 낱말마다 찾았다 |
| S7 | Go Hawaiʻi 언론용 문화 정보 (HTA 산하) | https://media.gohawaii.com/statewide/hawaii-information/hawaiian-cultural-information | "Hawaiian" 구분. 직접 받기는 403 이었고 요약 도구로 읽었다 |
| S8 | Paoakalani Declaration (2003, OHA 게시) | https://www.oha.org/wp-content/uploads/Paoakalani-Declaration.pdf | 전통 지식과 문화 표현의 상업적 이용 반대 |
| S9 | Hawaii Revised Statutes 8-1 (주 공휴일) | https://data.capitol.hawaii.gov/hrscurrent/Vol01_Ch0001-0042F/HRS0008/HRS_0008-0001.htm | 3월 26일, 6월 11일, 8월 셋째 금요일 |
| S10 | Session Laws of Hawaii 2023, Act 11 (Lā Kūʻokoʻa) | https://data.capitol.hawaii.gov/sessions/sessionlaws/Years/SLH2023/SLH2023_Act11.pdf | 11월 28일. "not ... a state holiday" |
| S11 | Bishop Museum. Lā Kūʻokoʻa 행사 안내 | https://www.bishopmuseum.org/calendar/la-ku%ca%bboko%ca%bba-celebrating-the-independence-day-of-the-hawaiian-kingdom-2025/ | 기념일이 지금 기관 행사로 열린다 |
| S12 | Hawaii Revised Statutes 5-10 (주가) | https://data.capitol.hawaii.gov/hrscurrent/Vol01_Ch0001-0042F/HRS0005/HRS_0005-0010.htm | Hawaiʻi Ponoʻī 가 주가다 |
| S13 | Hawaiʻi State Archives. Music from Queen Liliʻuokalani Manuscript Collections | https://ags.hawaii.gov/?p=35785 | Aloha ʻOe 1878년 작곡 |
| S14 | Public Law 103-150 (1993 사과 결의) 전문 | https://en.wikisource.org/wiki/Public_Law_103-150 | 미국 요원과 시민의 가담, 원주민이 주권을 직접 내놓은 적이 없다는 인정 |
| S15 | Charlene Junko Sato Center for Pidgin, Creole and Dialect Studies (UH Mānoa) | https://www.hawaii.edu/satocenter/ | "Pidgin, the creole language of Hawaiʻi" |
| S16 | Hawaii News Now. 인구조사국이 Pidgin 을 언어로 집계 (2015) | https://www.hawaiinewsnow.com/story/30515676/pidgin-now-recognized-as-official-language/ | Pidgin 은 언어다 |
| S17 | City and County of Honolulu, Department of Parks and Recreation. Brief History of Lei Day | https://www.honolulu.gov/dpr/wp-content/uploads/sites/34/2023/11/leiday_docs/Brief_History_of_Lei_Day.pdf | 1927년 Don Blanding 의 생각, Grace Tower Warren 의 "May Day is Lei Day", 1928년 첫 Lei Day. 레이를 주고받는 것은 만든 사람의 일부를 주고받는 일이라고 적는다. 레이를 버리는 법은 이 글에 없다 |
| S18 | NOAA Fisheries. Viewing Marine Wildlife in Hawaiʻi | https://fisheries.noaa.gov/pacific-islands/marine-life-viewing-guidelines/viewing-marine-wildlife-hawaii | 관찰 거리 |
| S19 | Session Laws of Hawaii 2018, Act 104 | https://data.capitol.hawaii.gov/sessions/sessionlaws/Years/SLH2018/SLH2018_Act104.pdf | oxybenzone, octinoxate 차단제 |
| S20 | Hawaiʻi DLNR. Respect means not throwing rocks into Lake Waiau (2021) | https://dlnr.hawaii.gov/blog/2021/12/28/nr21-240/ | 성지에서 돌을 옮기거나 공물을 두지 않는다 |
| S21 | 109th Congress H.Res.487, Korean American Day | https://www.congress.gov/109/bills/hres487/BILLS-109hres487ih.pdf | 1903년 1월 13일 102명 |
| S22 | Online Archive of California. Korean National Association in Hawaii and related lawsuits collection (USC) | https://oac.cdlib.org/findaid/ark:/13030/c8p55txc | 대한인국민회는 농장 노동자들이 임금을 떼어 독립운동을 도왔다. 단체 안 소송 기록 |
| S23 | UH Mānoa Center for Korean Studies. Korean Immigration Databank | https://manoa.hawaii.edu/koreanstudies/library/korean-immigration-databank/ | 1910~1924 여권 자료. 실명 자료라 게임에 안 옮긴다 |
| S24 | Hawaii News Now. Korean immigration to the US marks 120 years (2023) | https://www.hawaiinewsnow.com/2023/10/13/korean-immigration-us-marks-120-years-it-started-with-hawaii/ | 7천여 명, 사진 신부, 독립 자금 |
| S25 | Fujikane, Okamura 엮음. Asian Settler Colonialism (UH Press, 2008). Trask 의 글이 실려 있다 | https://uhpress.hawaii.edu/title/asian-settler-colonialism-from-local-governance-to-the-habits-of-everyday-life-in-hawaii/ | 정착민 서사 비판. 책 원문은 못 읽었고 출판사 소개와 audit 요약을 따른다 |
| S26 | Cultural Survival. Elizabeth LaPensee 인터뷰 (원래 표기는 끝 e 에 악상이 붙는다. 문자 범위 때문에 뺐다) | https://www.culturalsurvival.org/node/14354 | 원주민 게임 재현과 자기결정 |
| S27 | AbTeC. Skins 5.0 He Au Hou (호놀룰루, 2017) | https://abtec.org/past-future-forward/ | Kanaka Maoli 가 스스로 만든 하와이어 게임 |
| S28 | NPR. Never Alone 공동 개발 (2014) | https://www.npr.org/sections/alltechconsidered/2014/08/23/342554915/native-stories-from-alaska-give-gamers-something-to-play-with | 원주민 공동 개발의 예 |
| S29 | Department of Hawaiian Home Lands. Prince Kūhiō Day 안내 | https://dhhl.hawaii.gov/wp-content/uploads/2021/03/8.5x11-DHHL-Prince-Kuhio-Day-Brochure.pdf | Kūhiō 와 civic club, 1921년 법 |
| S30 | UH Mānoa Hawaiʻinuiākea School of Hawaiian Knowledge | https://manoa.hawaii.edu/hshk/ | 나중에 감수자를 찾을 때 연락할 곳 |
| S31 | Hawaiʻi Department of Transportation. 새 고속도로 표지에 ʻokina 와 kahakō (2022) | https://hidot.hawaii.gov/highways/?p=20813 | 주가 표지에 부호를 단다 |
| S32 | Office of the Governor. 사이렌 시험 안내 | https://governorige.hawaii.gov/?p=14709 | 매달 첫 근무일 사이렌 시험. 이번에는 403 이라 못 열었다(감사 때 읽음) |

**못 연 것.** Kamehameha Schools 글(ksbe.edu)은 403 이었다. UH 한국학연구소 대한인국민회 쪽과 Harvard Houghton 의 Aloha ʻOe 글은 주소가 사라졌다(404, 410). wehewehe.org 는 403 이라 같은 사전을 UH Hilo 쪽에서 찾았다.
**출처가 약한 것.** 레이를 흙으로 돌려보내는 법, Hawaiʻi Ponoʻī 에 일어서는 예절, 문신, 사진첩, 인물 울타리 대부분이 B다. 감수자가 생기면 이 줄부터 묻는다.
