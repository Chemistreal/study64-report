# G3 이후 미션 대사

신뢰도: B (학습용 기능 대화예요. 영어는 줄마다 자기 점검 A/B이며 실제 현지 화용·음성·플레이는 미검증이에요.)
검증로그: 2026-10-11 / 첨부 규격·원본 검사기·추가 길이와 새 낱말 검사 / 통과 / 상세 조건과 실행 결과는 result_G3.zip의 report.md에 적었어요.
검증로그: 2026-10-11 / 영어 화용과 지역별 절차 / 보류 / B 이유를 각 줄에 적었으며 사람 검증 전이에요.

이 파일은 docs/authored_lines.md에 덧붙일 새 장들이에요. 기존 ID·첫 공개 미션·해금 세션은 바꾸지 않아요. 수치와 운영 절차는 미션별 상황 설명에 적은 가상 장면 값이며 실제 장소의 현재 정책이 아니에요. 이후 미션 지시대로 한국어 풀이 칸은 모두 -예요.

## 나들이: diamond_head_lookout

작성자: codex (2026-10-11)
장소: diamond_head_lookout
세션: 95
목표 등급: A2
할 일: cd-dlp-1 / I can ask someone to take our photo and describe the view. / 전망대에서 사진을 부탁하고 경치를 말할 수 있다.
허용 이름: -
갈래: dlp-02 > dlp-04, dlp-03 > dlp-05, dlp-07 > dlp-09, dlp-08 > dlp-10, dlp-12 > dlp-14, dlp-13 > dlp-15, dlp-20 > dlp-22, dlp-21 > dlp-23, dlp-25 > dlp-27, dlp-26 > dlp-28, dlp-30 > dlp-32, dlp-31 > dlp-33

상황: diamond_head_lookout에서 두 사람이 경치를 보고 가상 안내원 Guide에게 사진을 부탁해. 사진 자리, 보이는 풍경, 앉을 자리와 안내원의 도움은 이 미션의 가상 장면 값이고 실제 시설이나 서비스 정보가 아니야. t2에서 A가 자기 휴대전화 또는 두 사람의 카메라를 Guide에게 건네면 Guide가 그 기기를 사용하고 t9 뒤 돌려줘. t6의 기다림 갈래에서는 두 사람이 모자를 정리한 뒤 사진을 보고, t8에서 다시 찍을지 정한 다음 어느 갈래든 같은 기기를 돌려받아.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| dlp-01 | help | npc | Guide | Hi! Do you need any help? | A2 | 인사 용건 묻기 | A | - | - |
| dlp-02 | help | option | A자리 | Could you take a photo of us? | A2 | 사진 촬영 부탁 | A | - | - |
| dlp-03 | help | option | A자리 | Where is a good spot for photos? | A2 | 사진 자리 묻기 | A | - | - |
| dlp-04 | help | npc | Guide | Sure. I can take your photo here. | A2 | 부탁 수락 | A | - | - |
| dlp-05 | help | npc | Guide | This spot has a nice view. | A2 | 자리 설명 | A | - | - |
| dlp-06 | device | npc | Guide | Do you have a phone? | A2 | 기기 확인 | A | - | - |
| dlp-07 | device | option | A자리 | Yes. Here is my phone. | A2 | 자기 기기 건네기 | A | - | - |
| dlp-08 | device | option | A자리 | Could you use our camera instead? | A2 | 다른 기기 사용 부탁 | A | - | - |
| dlp-09 | device | npc | Guide | Thanks. I will use your phone. | A2 | 사용할 기기 확인 | A | - | - |
| dlp-10 | device | npc | Guide | Sure. I will use your camera. | A2 | 다른 기기 사용 수락 | A | - | - |
| dlp-11 | view | npc | Guide | Would you like the ocean behind you? | A2 | 사진 배경 묻기 | A | - | - |
| dlp-12 | view | option | B자리 | Yes. The ocean looks beautiful. | A2 | 배경 수락과 묘사 | A | - | - |
| dlp-13 | view | option | B자리 | Can you get more of the view? | A2 | 사진 구도 변경 부탁 | B | 사진에 경치를 더 담아 달라는 구어 연어와 A2 난이도는 사람 검수가 필요해. | - |
| dlp-14 | view | npc | Guide | Okay. The ocean will be behind you. | A2 | 배경 확인 | A | - | - |
| dlp-15 | view | npc | Guide | Sure. I can include more of the view. | A2 | 구도 요청 수락 | B | 사진 구도를 말하는 include의 쓰임과 장면에서의 자연스러움을 직접 확인하지 못했어. | - |
| dlp-16 | pose | wait | A자리 | Do you want to stand here, {B}? | A2 | 동행에게 위치 묻기 | A | - | - |
| dlp-17 | pose | option | B자리 | Yes. We can see the ocean here. | A2 | 위치 수락과 설명 | A | - | - |
| dlp-18 | pose | option | B자리 | Let us move a little closer together. | A2 | 사진 자세 제안 | A | - | - |
| dlp-19 | ready | npc | Guide | Great. Are you both ready? | A2 | 준비 확인 | A | - | - |
| dlp-20 | ready | option | 두 사람 | Yes. We are ready. | A2 | 준비 대답 | A | - | - |
| dlp-21 | ready | option | 두 사람 | One moment. My hat is in the way. | A2 | 잠시 기다림 요청 | A | - | - |
| dlp-22 | ready | npc | Guide | Great. Look at the camera. | A2 | 촬영 안내 | A | - | - |
| dlp-23 | ready | npc | Guide | Take your time. I can wait. | A2 | 기다림 수락 | A | - | - |
| dlp-24 | review | npc | Guide | Here is the photo. What do you think? | A2 | 사진 보여주고 의견 묻기 | A | - | - |
| dlp-25 | review | option | A자리 | Thank you. The view looks great. | A2 | 사진 의견 말하기 | A | - | - |
| dlp-26 | review | option | A자리 | Could you show it to {B}, too? | A2 | 동행에게 사진 보여주기 부탁 | A | - | - |
| dlp-27 | review | npc | Guide | You are welcome. | A2 | 감사에 답하기 | A | - | - |
| dlp-28 | review | npc | Guide | Of course. You can both look. | A2 | 함께 보기 수락 | A | - | - |
| dlp-29 | another | npc | Guide | Would you like another photo? | A2 | 추가 촬영 묻기 | A | - | - |
| dlp-30 | another | option | 두 사람 | No, thanks. This one is fine. | A2 | 추가 촬영 거절 | A | - | - |
| dlp-31 | another | option | 두 사람 | Could you take one with us sitting? | A2 | 다른 자세 촬영 부탁 | B | 앉은 사진을 부탁하는 with us sitting의 구어 빈도와 등급 판단은 미확인이야. | - |
| dlp-32 | another | npc | Guide | All right. We are done with the photos. | A2 | 촬영 마무리 | A | - | - |
| dlp-33 | another | npc | Guide | Sure. Here is your other photo. | A2 | 추가 사진 보여주기 | A | - | - |
| dlp-34 | return | wait | A자리 | May I have it back, please? | A2 | 맡긴 기기 돌려받기 | A | - | - |
| dlp-35 | return | npc | Guide | Of course. Here you go. | A2 | 기기 돌려주기 | A | - | - |
| dlp-36 | talk | wait | A자리 | What do you like about the view, {B}? | A2 | 동행에게 경치 의견 묻기 | A | - | - |
| dlp-37 | talk | option | B자리 | I like the blue ocean. | A2 | 경치 묘사 | A | - | - |
| dlp-38 | talk | option | B자리 | Which part do you like? | A2 | 동행에게 되묻기 | A | - | - |
| dlp-39 | finish | wait | A자리 | I like the ocean. Let's sit here. | A2 | 의견 말하고 휴식 제안 | A | - | - |

### 연습할 말 (이 나들이의 연습 10개)

줄 id로 위 표를 가리켜. 기준서 8.1의 카드 총량에 넣지 않고 이 나들이 안에서 두 사람이 듣고 말하는 연습이야.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| dlp-p1 | Could you take a photo of us? | 사진 촬영 부탁 | dlp-02 | - |
| dlp-p2 | Where is a good spot for photos? | 사진 자리 묻기 | dlp-03 | - |
| dlp-p3 | Yes. Here is my phone. | 자기 기기 건네기 | dlp-07 | - |
| dlp-p4 | Could you use our camera instead? | 다른 기기 사용 부탁 | dlp-08 | - |
| dlp-p5 | Yes. The ocean looks beautiful. | 배경 수락과 묘사 | dlp-12 | - |
| dlp-p6 | Do you want to stand here, {B}? | 동행에게 위치 묻기 | dlp-16 | - |
| dlp-p7 | One moment. My hat is in the way. | 잠시 기다림 요청 | dlp-21 | - |
| dlp-p8 | Could you show it to {B}, too? | 동행에게 사진 보여주기 부탁 | dlp-26 | - |
| dlp-p9 | May I have it back, please? | 맡긴 기기 돌려받기 | dlp-34 | - |
| dlp-p10 | What do you like about the view, {B}? | 동행에게 경치 의견 묻기 | dlp-36 | - |

### 미니게임 차례

후보 중 하나를 말하면 돼. 갈래 응답은 선택한 후보에 이어서 듣고 다음 차례로 가. n1은 기기를 돌려주는 점수 없는 이음 차례야. 시간 상한은 없고 못해도 같은 미션을 다시 열 수 있어.

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | help | dlp-01 | dlp-02/dlp-03 | A |
| t2 | device | dlp-06 | dlp-07/dlp-08 | A |
| t3 | view | dlp-11 | dlp-12/dlp-13 | B |
| t4 | pose | - | dlp-16 | A |
| t5 | pose | - | dlp-17/dlp-18 | B |
| t6 | ready | dlp-19 | dlp-20/dlp-21 | 둘 중 누구든 |
| t7 | review | dlp-24 | dlp-25/dlp-26 | A |
| t8 | another | dlp-29 | dlp-30/dlp-31 | 둘 중 누구든 |
| t9 | return | - | dlp-34 | A |
| n1 | return | dlp-35 | - | - |
| t10 | talk | - | dlp-36 | A |
| t11 | talk | - | dlp-37/dlp-38 | B |
| t12 | finish | - | dlp-39 | A |

## 나들이: diamond_head_hike

작성자: codex (2026-10-11)
장소: diamond_head_trailhead
세션: 113
목표 등급: B1
할 일: cd-dhh-1 / I can ask about a hiking route, check the information, and plan with my partner. / 등산 코스와 시간을 묻고 안내를 확인하며 동행과 계획할 수 있다.
허용 이름: -
갈래: dhh-02 > dhh-04, dhh-03 > dhh-05, dhh-07 > dhh-09, dhh-08 > dhh-10, dhh-12 > dhh-14, dhh-13 > dhh-15, dhh-22 > dhh-24, dhh-23 > dhh-25, dhh-30 > dhh-32, dhh-31 > dhh-33

상황: diamond_head_hike에서 두 사람이 입구 안내원에게 지도를 보여주고 코스와 시간을 물은 뒤, 이동 중 표지 앞 가상 안내원에게 다시 확인해. 두 안내원은 모두 Guide 역할로 적었어. 짧은 코스, 한 시간이라는 예상 소요, 같은 입구로 돌아오는 길, 표지·화살표·책상 위치와 안내원 배치는 전부 가상 장면 값이며 실제 등산로·현재 운영·안전 정보를 뜻하지 않아. 이 미션은 실제 안전 교육을 대신하지 않고 직원에게 설명과 확인을 요청하는 언어 연습이며 실제 위험 수치나 장비 동작을 새로 정하지 않아.

t7에서 안내문을 보라는 갈래를 고르면 두 사람이 가상 안내문을 살핀 뒤 이동해. t10의 현재 위치 응답에서 안내원은 지도에 손가락으로 위치를 짚어. 마지막 두 갈래는 쉬고 돌아갈 길을 함께 확인하는 계획에 합의해.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| dhh-01 | route | npc | Guide | Hi. What would you like to know about the trail? | B1 | 인사 용건 묻기 | A | - | - |
| dhh-02 | route | option | A자리 | Which route would you suggest for our first hike? | B1 | 코스 추천 부탁 | B | 첫 등산 코스를 직원에게 추천받는 장면의 화용과 난이도 경계는 사람 검수가 필요해. | - |
| dhh-03 | route | option | A자리 | Could you show us the route on this map? | B1 | 지도에서 코스 보여주기 부탁 | A | - | - |
| dhh-04 | route | npc | Guide | I can show you the shorter route. | B1 | 코스 추천 응답 | A | - | - |
| dhh-05 | route | npc | Guide | Yes. The route is marked here. | B1 | 지도 위치 안내 | A | - | - |
| dhh-06 | time | npc | Guide | This is the shorter route on the map. | B1 | 코스 소개 | A | - | - |
| dhh-07 | time | option | A자리 | How long does the walk usually take? | B1 | 예상 소요 시간 묻기 | A | - | - |
| dhh-08 | time | option | A자리 | Does it return to this entrance? | B1 | 돌아오는 위치 확인 | A | - | - |
| dhh-09 | time | npc | Guide | Allow about an hour for the walk. | B1 | 가상 소요 시간 안내 | B | 가상 코스의 예상 시간만 말하는 줄이지만 allow about의 안내 말투는 사람 검수가 필요해. | - |
| dhh-10 | time | npc | Guide | Yes. It brings you back to this entrance. | B1 | 돌아오는 위치 응답 | A | - | - |
| dhh-11 | signs | npc | Guide | The route returns here. The signs are on this map. | B1 | 돌아오는 위치와 표지 소개 | A | - | - |
| dhh-12 | signs | option | B자리 | Can you explain the signs before we start? | B1 | 표지 설명 부탁 | A | - | - |
| dhh-13 | signs | option | B자리 | Could you tell us where to ask for help? | B1 | 도움받을 위치 묻기 | A | - | - |
| dhh-14 | signs | npc | Guide | This arrow shows the route back to the entrance. | B1 | 가상 표지 뜻 설명 | B | 화살표의 뜻은 가상 지도 설정이며 실제 표지 해석과 안내원의 표현은 확인하지 못했어. | - |
| dhh-15 | signs | npc | Guide | Please ask at this desk. | B1 | 도움받을 위치 안내 | A | - | - |
| dhh-16 | signs | npc | Guide | Please ask me about anything you do not understand. | B1 | 추가 확인 권하기 | A | - | - |
| dhh-17 | plan | wait | A자리 | How do you feel about starting with this route, {B}? | B1 | 동행의 의견 묻기 | A | - | - |
| dhh-18 | plan | option | B자리 | I would like to try the shorter route. | B1 | 코스 선택 말하기 | A | - | - |
| dhh-19 | plan | option | B자리 | Can we look at the map together first? | B1 | 함께 확인 제안 | A | - | - |
| dhh-20 | plan | wait | A자리 | Let us look at it before we start. | B1 | 지도 확인 합의 | A | - | - |
| dhh-21 | check | npc | Guide | Do you have any more questions before you go? | B1 | 출발 전 확인 묻기 | A | - | - |
| dhh-22 | check | option | 두 사람 | Are there any changes to the route today? | B1 | 현재 코스 정보 묻기 | A | - | - |
| dhh-23 | check | option | 두 사람 | Could you repeat the part about the entrance? | B1 | 돌아오는 위치 되묻기 | A | - | - |
| dhh-24 | check | npc | Guide | Please check this notice for any changes. | B1 | 가상 안내문 확인 요청 | A | - | - |
| dhh-25 | check | npc | Guide | The route returns to this entrance. | B1 | 돌아오는 위치 반복 | A | - | - |
| dhh-26 | walk | option | A자리 | Let us check the map at this sign. | B1 | 지도 확인 제안 | A | - | - |
| dhh-27 | walk | option | A자리 | Is this the turn marked on our map? | B1 | 방향 바꾸는 곳 확인 | A | - | - |
| dhh-28 | walk | wait | B자리 | Let us check with the guide before we continue. | B1 | 직원에게 확인 제안 | A | - | - |
| dhh-29 | locate | npc | Guide | What would you like to check? | B1 | 확인할 내용 묻기 | A | - | - |
| dhh-30 | locate | option | B자리 | Is this the route back to the entrance? | B1 | 돌아갈 길 확인 | A | - | - |
| dhh-31 | locate | option | B자리 | Could you show where we are on this map? | B1 | 지도에서 현재 위치 표시 부탁 | A | - | - |
| dhh-32 | locate | npc | Guide | Yes. This route returns to the entrance. | B1 | 돌아갈 길 응답 | A | - | - |
| dhh-33 | locate | npc | Guide | You are here, beside this sign. | B1 | 가상 현재 위치 안내 | A | - | - |
| dhh-34 | rest | wait | A자리 | I would like a break before we go farther. | B1 | 휴식 필요 말하기 | A | - | - |
| dhh-35 | rest | option | B자리 | Let us rest first, then check the way back. | B1 | 휴식과 복귀 확인 제안 | A | - | - |
| dhh-36 | rest | option | B자리 | Would you like to head back after our break? | B1 | 동행의 복귀 의사 묻기 | A | - | - |
| dhh-37 | finish | wait | A자리 | Yes. Let us check the way back together. | B1 | 복귀 계획 합의 | A | - | - |

### 연습할 말 (이 나들이의 연습 10개)

줄 id로 위 표를 가리켜. 기준서 8.1의 카드 총량에 넣지 않고 이 나들이 안에서 두 사람이 듣고 말하는 연습이야.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| dhh-p1 | Could you show us the route on this map? | 지도에서 코스 보여주기 부탁 | dhh-03 | - |
| dhh-p2 | How long does the walk usually take? | 예상 소요 시간 묻기 | dhh-07 | - |
| dhh-p3 | Does it return to this entrance? | 돌아오는 위치 확인 | dhh-08 | - |
| dhh-p4 | Can you explain the signs before we start? | 표지 설명 부탁 | dhh-12 | - |
| dhh-p5 | Could you tell us where to ask for help? | 도움받을 위치 묻기 | dhh-13 | - |
| dhh-p6 | Can we look at the map together first? | 함께 확인 제안 | dhh-19 | - |
| dhh-p7 | Could you repeat the part about the entrance? | 돌아오는 위치 되묻기 | dhh-23 | - |
| dhh-p8 | Let us check with the guide before we continue. | 직원에게 확인 제안 | dhh-28 | - |
| dhh-p9 | I would like a break before we go farther. | 휴식 필요 말하기 | dhh-34 | - |
| dhh-p10 | Would you like to head back after our break? | 동행의 복귀 의사 묻기 | dhh-36 | - |

### 미니게임 차례

후보 중 하나를 말하면 돼. 갈래 응답은 선택한 후보에 이어서 듣고 다음 차례로 가. n1은 안내원에게 질문해도 된다는 점수 없는 이음 차례야. t8부터 이동 장면이고 t10에서 표지 앞 가상 안내원에게 확인해. 시간 상한은 없고 못해도 같은 미션을 다시 열 수 있어.

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | route | dhh-01 | dhh-02/dhh-03 | A |
| t2 | time | dhh-06 | dhh-07/dhh-08 | A |
| t3 | signs | dhh-11 | dhh-12/dhh-13 | B |
| n1 | signs | dhh-16 | - | - |
| t4 | plan | - | dhh-17 | A |
| t5 | plan | - | dhh-18/dhh-19 | B |
| t6 | plan | - | dhh-20 | A |
| t7 | check | dhh-21 | dhh-22/dhh-23 | 둘 중 누구든 |
| t8 | walk | - | dhh-26/dhh-27 | A |
| t9 | walk | - | dhh-28 | B |
| t10 | locate | dhh-29 | dhh-30/dhh-31 | B |
| t11 | rest | - | dhh-34 | A |
| t12 | rest | - | dhh-35/dhh-36 | B |
| t13 | finish | - | dhh-37 | A |

## 나들이: surf_lesson

작성자: codex (2026-10-11)
장소: waikiki_beach
세션: 149
목표 등급: B1
할 일: cd-sfl-1 / I can ask about safety and check instructions during a surf lesson. / 서핑 강습에서 안전을 묻고 직원의 지침을 확인할 수 있다.
허용 이름: -
갈래: sfl-02 > sfl-04, sfl-03 > sfl-04, sfl-06 > sfl-08, sfl-07 > sfl-05, sfl-10 > sfl-12, sfl-11 > sfl-12, sfl-14 > sfl-16, sfl-15 > sfl-16, sfl-18 > sfl-20, sfl-19 > sfl-21, sfl-23 > sfl-25, sfl-24 > sfl-25, sfl-27 > sfl-29, sfl-28 > sfl-29, sfl-31 > sfl-33, sfl-32 > sfl-33, sfl-36 > sfl-38, sfl-37 > sfl-38

상황: 와이키키 해변의 surf_lesson 가상 강습이다. 두 사람은 대화 내내 해변에서 설명을 듣고 질문하며 물에 들어가지 않는다. 안내 순서, 강사의 응대, 장비 점검과 휴식 가능 여부는 가상 장면값이며 실제 강습 정책이 아니다. 지은 대사는 강습의 언어 연습으로, 실제 안전 강습이나 현장 판단을 대신하지 않는다. 장비 동작이나 신호 형태, 위험 수치를 지어내지 않고 강사에게 설명과 시범을 요청한다. 휴식을 고르면 준비될 때까지 같은 해변에 머문 후 질문을 잇는다. sfl-07의 느린 말 요청 갈래는 같은 원문 sfl-05를 재제시한다. 별도 속도 필드가 없으며 실제 느린 음성과 TTS 속도 변화는 미검증이다. 신호 시범과 설명을 듣고 보는 행동은 상황 전제이며, 실제 시범 내용은 창작하지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| sfl-01 | door | npc | Guide | Welcome! Have you taken a surf lesson before? | B1 | 인사와 경험 묻기 | A | - | - |
| sfl-02 | door | option | A자리 | No. This is my first lesson. | A2 | 경험 말하기 | A | - | - |
| sfl-03 | door | option | A자리 | Can you explain the safety rules first? | B1 | 안전 설명 요청 | A | - | - |
| sfl-04 | door | npc | Guide | We'll start with the safety talk. | B1 | 안전 설명 시작 | A | - | - |
| sfl-05 | begin | npc | Guide | Please wait for my instructions before we begin. | B1 | 시작 전 지침 안내 | B | 가상 강습의 일반 안내이며 실제 강사의 안전 지침을 확인한 대사가 아니다 | - |
| sfl-06 | begin | option | B자리 | So we wait until you tell us to start? | B1 | 들은 지침 확인 | A | - | - |
| sfl-07 | begin | option | B자리 | Could you say that more slowly? | A2 | 속도 조절 요청 | A | - | - |
| sfl-08 | begin | npc | Guide | Yes. I'll tell you when we can start. | B1 | 지침 이해 확인 | B | 실제 입수 허가나 현장 안전 판단을 대신하지 않는 가상 대답이다 | - |
| sfl-09 | board | npc | Guide | What would you like to know about the board? | B1 | 장비 질문 받기 | A | - | - |
| sfl-10 | board | option | A자리 | Can you check this board for me? | A2 | 장비 점검 요청 | B | 서핑 장비 점검을 부탁하는 현장 표현과 절차의 적합성은 사람 검증 전이다 | - |
| sfl-11 | board | option | A자리 | I haven't used a board before. | A2 | 장비 경험 설명 | A | - | - |
| sfl-12 | board | npc | Guide | I'll check it with you and explain how to use it. | B1 | 점검과 설명 약속 | B | 실제 장비 조작을 설명하지 않으며 담당 강사의 교육을 요청하는 가상 대답이다 | - |
| sfl-13 | signal | npc | Guide | We will also discuss how to ask for help. | B1 | 도움 요청 안내 예고 | B | 현장의 구조 신호 교육을 대신하지 않는 가상 안내이며 연어도 검증 전이다 | - |
| sfl-14 | signal | option | B자리 | What signal should I use to ask for help? | B1 | 도움 신호 묻기 | B | 서핑 강습에서 쓰는 신호의 이름과 질문 표현은 현장 전문가 검증 전이다 | - |
| sfl-15 | signal | option | B자리 | Please show us how to ask for help. | B1 | 시범 요청 | A | - | - |
| sfl-16 | signal | npc | Guide | I'll explain it and show you before we begin. | B1 | 신호 설명과 시범 약속 | B | 안전 신호의 실제 형태를 지어내지 않고 강사의 시범을 요청하는 장면이다 | - |
| sfl-17 | signs | npc | Guide | What else would you like to ask? | A2 | 추가 질문 받기 | A | - | - |
| sfl-18 | signs | option | A자리 | What does that warning sign mean? | B1 | 경고 뜻 묻기 | A | - | - |
| sfl-19 | signs | option | A자리 | I'd like time to read the signs. | A2 | 읽을 시간 요청 | A | - | - |
| sfl-20 | signs | npc | Guide | Let's read it together. I'll explain what it means. | B1 | 표지 설명 제안 | A | - | - |
| sfl-21 | signs | npc | Guide | Take your time. Ask me about anything you don't understand. | B1 | 시간 허락과 질문 권유 | A | - | - |
| sfl-22 | partner | wait | A자리 | How do you feel about the lesson, {B}? | B1 | 상대 기분 묻기 | A | - | - |
| sfl-23 | partner | option | B자리 | I'm nervous. I want to talk to the teacher. | B1 | 불안과 필요 설명 | A | - | - |
| sfl-24 | partner | option | B자리 | Let's ask our questions before we start. | B1 | 함께 질문하기 제안 | A | - | - |
| sfl-25 | partner | npc | Guide | I can answer your questions here. | A2 | 질문 받기 | A | - | - |
| sfl-26 | breaks | npc | Guide | Is there anything I should know before we continue? | B1 | 필요 사항 묻기 | A | - | - |
| sfl-27 | breaks | option | A자리 | I get tired easily. Can we talk about that? | B1 | 상태 설명과 상담 요청 | A | - | - |
| sfl-28 | breaks | option | A자리 | What should I do if I need a break? | B1 | 휴식 방법 묻기 | A | - | - |
| sfl-29 | breaks | npc | Guide | We can pause this talk anytime. Tell me what you need. | B1 | 대화 휴식 허락 | B | 해변에서 설명을 듣는 중의 휴식일 뿐 물속 안전 행동을 안내하는 대사가 아니다 | - |
| sfl-30 | ready | npc | Guide | Do you want to continue this talk or take a break? | B1 | 계속할지 묻기 | A | - | - |
| sfl-31 | ready | option | B자리 | Let's continue. I still have a question. | B1 | 계속하기 제안 | A | - | - |
| sfl-32 | ready | option | B자리 | I'd like a short break first. | A2 | 휴식 요청 | A | - | - |
| sfl-33 | ready | npc | Guide | We'll stay here. Ask your question when you're ready. | B1 | 대기와 질문 권유 | A | - | - |
| sfl-34 | review | wait | A자리 | Can we review the safety rules before we enter the water? | B1 | 안전 지침 재확인 요청 | B | 안전 지침의 실제 내용을 제공하지 않고 현장 강사에게 재확인을 요청하는 표현이다 | - |
| sfl-35 | review | npc | Guide | Yes. We'll review them here before you decide to go in. | B1 | 입수 전 재확인 약속 | B | 실제 입수 안전성을 보증하지 않는 가상 대답이며 현장 지침 확인이 필요하다 | - |
| sfl-36 | review | option | B자리 | I want to stay here for now. | A2 | 입수 유보 | A | - | - |
| sfl-37 | review | option | B자리 | Please explain anything I still need to know. | B1 | 추가 설명 요청 | A | - | - |
| sfl-38 | review | npc | Guide | We'll stay here and go over your questions. | B1 | 해변에 머물며 질문 받기 | A | - | - |

### 연습할 말

기준서 8.1의 카드 총량에 넣지 않는 미션 안의 연습이다. 두 사람이 번갈아 본문 줄을 그대로 연습하며, 아래 표 자체가 실제 음성 재생이나 필수 이수를 보장하지는 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| sfl-p1 | No. This is my first lesson. | 경험 말하기 | sfl-02 | - |
| sfl-p2 | Can you explain the safety rules first? | 안전 설명 요청 | sfl-03 | - |
| sfl-p3 | So we wait until you tell us to start? | 들은 지침 확인 | sfl-06 | - |
| sfl-p4 | Could you say that more slowly? | 속도 조절 요청 | sfl-07 | - |
| sfl-p5 | Can you check this board for me? | 장비 점검 요청 | sfl-10 | - |
| sfl-p6 | What signal should I use to ask for help? | 도움 신호 묻기 | sfl-14 | - |
| sfl-p7 | Please show us how to ask for help. | 시범 요청 | sfl-15 | - |
| sfl-p8 | What does that warning sign mean? | 경고 뜻 묻기 | sfl-18 | - |
| sfl-p9 | I get tired easily. Can we talk about that? | 상태 설명과 상담 요청 | sfl-27 | - |
| sfl-p10 | What should I do if I need a break? | 휴식 방법 묻기 | sfl-28 | - |
| sfl-p11 | I'd like a short break first. | 휴식 요청 | sfl-32 | - |
| sfl-p12 | Can we review the safety rules before we enter the water? | 안전 지침 재확인 요청 | sfl-34 | - |
| sfl-p13 | I want to stay here for now. | 입수 유보 | sfl-36 | - |

### 미니게임 차례

갈래 응답은 선택 뒤에 듣는다. 동일 안내가 다시 필요한 경우 기존 줄 ID를 재사용한다. 점수 차례의 후보 하나를 말하면 통과하며 시간 상한은 없다.

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | door | sfl-01 | sfl-02/sfl-03 | A |
| t2 | begin | sfl-05 | sfl-06/sfl-07 | B |
| t3 | board | sfl-09 | sfl-10/sfl-11 | A |
| t4 | signal | sfl-13 | sfl-14/sfl-15 | B |
| t5 | signs | sfl-17 | sfl-18/sfl-19 | A |
| t6 | partner | - | sfl-22 | A |
| t7 | partner | - | sfl-23/sfl-24 | B |
| t8 | breaks | sfl-26 | sfl-27/sfl-28 | A |
| t9 | ready | sfl-30 | sfl-31/sfl-32 | B |
| t10 | review | - | sfl-34 | A |
| t11 | review | sfl-35 | sfl-36/sfl-37 | B |

## 나들이: hanauma_bay_snorkel

작성자: codex (2026-10-11)
장소: hanauma_bay
세션: 173
목표 등급: B1
할 일: cd-hbs-1 / I can ask about equipment and confirm safety instructions before snorkeling. / 스노클링 전에 장비를 묻고 직원의 안전 지침을 확인할 수 있다.
허용 이름: -
갈래: hbs-02 > hbs-04, hbs-03 > hbs-05, hbs-07 > hbs-09, hbs-08 > hbs-10, hbs-12 > hbs-14, hbs-13 > hbs-14, hbs-16 > hbs-18, hbs-17 > hbs-18, hbs-20 > hbs-22, hbs-21 > hbs-22, hbs-26 > hbs-28, hbs-27 > hbs-28, hbs-30 > hbs-32, hbs-31 > hbs-32, hbs-34 > hbs-36, hbs-35 > hbs-36

상황: 하나우마 베이의 hanauma_bay_snorkel 가상 장면이다. 안전 안내 영상과 직원 상담 뒤 장비를 살펴보고 신호 설명과 해변 연습 확인을 요청한다. t1의 응답 후 영상을 끝까지 보고 t2로 넘어가는 장면이다. 직원의 규칙 설명과 신호 시범을 듣고 보는 행동을 상황 전제로 삼지만, 실제 교육 내용이나 신호 형태를 대사로 창작하지 않는다. 영상의 제공 방식과 음량 조절, 장비 제공과 크기, 직원 역할, 반납 데스크는 가상 장면값이며 실제 시설의 운영이나 정책이 아니다. 요금과 시간을 정하지 않는다. t3에서 두 사람은 각자 쓸 장비를 함께 고른다. t4의 착용감 질문 전에 두 사람 모두 자기 마스크를 써 본 상황이다. 대화 내내 육지에 머물며, 입수를 유보해도 직원 상담과 장비 반납 확인으로 이어진다. 이 대사는 안전 강습의 언어 연습이며 실제 강습이나 현장 안전 판단을 대신하지 않는다. 신호 형태, 장비 동작, 위험 수치를 새로 가르치지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| hbs-01 | video | npc | Guide | Please watch the video before we talk about the water. | B1 | 안내 영상 권유 | B | 안내 영상과 대화 순서는 가상 장면값이며 실제 장소 운영을 확인하지 않았다 | - |
| hbs-02 | video | option | A자리 | Can we ask questions after the video? | B1 | 질문 허락 묻기 | A | - | - |
| hbs-03 | video | option | A자리 | Could you turn the volume up a little? | B1 | 음량 조절 요청 | A | - | - |
| hbs-04 | video | npc | Guide | Yes. We can talk after you've watched it. | B1 | 질문 허락 | B | 직원에게 질문할 수 있다는 응대는 실제 운영 보장이 아닌 가상 장면값이다 | - |
| hbs-05 | video | npc | Guide | Of course. I'll turn it up for you. | A2 | 음량 요청 수락 | B | 영상 음량을 직원이 조절하는 절차는 실제 시설을 확인한 정보가 아니다 | - |
| hbs-06 | meaning | npc | Guide | What would you like to ask about the video? | B1 | 영상 질문 받기 | A | - | - |
| hbs-07 | meaning | option | B자리 | Could you explain the safety rules again? | B1 | 안전 규칙 재설명 요청 | A | - | - |
| hbs-08 | meaning | option | B자리 | Where can we read those rules? | B1 | 규칙 글 위치 묻기 | A | - | - |
| hbs-09 | meaning | npc | Guide | Let's go over them here before you make any plans. | B1 | 안전 규칙 설명 약속 | B | 실제 안전 규칙을 지어내지 않고 직원 설명을 받는 가상 응대다 | - |
| hbs-10 | meaning | npc | Guide | We can look at the rules on this sign together. | B1 | 규칙 표지 안내 | B | 규칙 표지의 위치와 제공 형태는 실제 시설 정보가 아닌 가상 장면값이다 | - |
| hbs-11 | gear | npc | Clerk | What equipment do you need? | B1 | 필요 장비 묻기 | A | - | - |
| hbs-12 | gear | option | A자리 | I'd like a mask and fins, please. | B1 | 장비 빌리기 요청 | A | - | - |
| hbs-13 | gear | option | A자리 | Does the equipment come in different sizes? | B1 | 장비 크기 범위 묻기 | A | - | - |
| hbs-14 | gear | npc | Clerk | Yes. Let's look at the equipment and find your size. | B1 | 장비 고르기 안내 | B | 장비 제공과 크기 선택은 실제 대여 절차를 확인한 정보가 아닌 가상 장면값이다 | - |
| hbs-15 | fit | npc | Clerk | How does the mask feel? | A2 | 장비 착용감 묻기 | A | - | - |
| hbs-16 | fit | option | B자리 | It feels loose. Can you check it? | B1 | 착용 문제 설명 | B | 마스크 착용 문제의 현장 표현과 적합성은 전문 검증 전이며 점검을 요청한다 | - |
| hbs-17 | fit | option | B자리 | Could I try another size? | A2 | 다른 크기 요청 | A | - | - |
| hbs-18 | fit | npc | Clerk | Of course. Let's find a mask that fits you. | B1 | 맞는 장비 찾기 | B | 장비 조작법을 가르치지 않고 직원이 맞는 장비를 찾아 주는 가상 응대다 | - |
| hbs-19 | signal | npc | Guide | Let's talk about the signals before you go in. | B1 | 신호 안내 제안 | B | 실제 물속 신호를 지어내지 않고 직원에게 설명을 요청하는 가상 대화다 | - |
| hbs-20 | signal | option | A자리 | What signal means I need help? | B1 | 도움 신호 뜻 묻기 | B | 스노클링 현장의 도움 신호 질문 표현은 전문가와 원어민 검증 전이다 | - |
| hbs-21 | signal | option | A자리 | Can you show us the signals first? | B1 | 신호 시범 요청 | A | - | - |
| hbs-22 | signal | npc | Guide | I'll show you and explain what each one means. | B1 | 신호 시범과 설명 약속 | B | 신호의 형태나 행동 지침을 제공하지 않는 가상 설명 예고다 | - |
| hbs-23 | confirm | wait | B자리 | Could you watch us practice the signals here? | B1 | 신호 연습 확인 요청 | B | 직원에게 해변에서 연습을 확인받는 현장 화용은 실제 검증 전이다 | - |
| hbs-24 | confirm | npc | Guide | Yes. We can practice here before you make a decision. | B1 | 육지 연습 확인 수락 | B | 연습 가능 장소와 직원 응대는 실제 시설 정책이 아닌 가상 장면값이다 | - |
| hbs-25 | partner | wait | A자리 | Do you want to ask anything else, {B}? | A2 | 상대 질문 묻기 | A | - | - |
| hbs-26 | partner | option | B자리 | I want to ask about today's conditions. | B1 | 질문할 주제 설명 | A | - | - |
| hbs-27 | partner | option | B자리 | I'd like to stay out of the water for now. | B1 | 입수 유보 | A | - | - |
| hbs-28 | partner | npc | Guide | We can stay here and talk about your choices. | B1 | 입수 없이 상담 제안 | A | - | - |
| hbs-29 | conditions | npc | Guide | What else would you like to know? | A2 | 추가 질문 받기 | A | - | - |
| hbs-30 | conditions | option | A자리 | Are today's conditions suitable for us? | B1 | 상태 판단 요청 | B | 해양 안전 판단을 직원에게 요청하는 표현이며 실제 입수 허가를 뜻하지 않는다 | - |
| hbs-31 | conditions | option | A자리 | Let's ask the staff about our plans first. | B1 | 직원에게 확인 제안 | A | - | - |
| hbs-32 | conditions | npc | Guide | I can help you ask the staff about that. | B1 | 담당 직원 질문 지원 | B | 질문을 담당 직원에게 연결하는 가상 응대이며 실제 인력과 역할은 미확인이다 | - |
| hbs-33 | decide | npc | Guide | What would you like to do now? | A2 | 다음 선택 묻기 | A | - | - |
| hbs-34 | decide | option | B자리 | Let's talk to the staff before we decide. | B1 | 직원 상담 제안 | A | - | - |
| hbs-35 | decide | option | B자리 | I'd rather stay here today. | B1 | 육지에 머물기 선택 | A | - | - |
| hbs-36 | decide | npc | Guide | Okay. We can talk to them while you stay here. | B1 | 육지에서 상담 이어가기 | B | 입수하지 않은 채 직원과 대화하는 가상 응대이며 현장 운영 보장은 아니다 | - |
| hbs-37 | return | wait | A자리 | Where should we return the equipment when we're done? | B1 | 장비 반납 위치 묻기 | A | - | - |
| hbs-38 | return | npc | Clerk | Bring it back to this desk when you're finished. | B1 | 반납 위치 안내 | B | 반납 장소와 절차는 실제 시설을 확인한 정보가 아니라 가상 장면값이다 | - |
| hbs-39 | return | wait | B자리 | So we bring it back here. Is that right? | B1 | 반납 안내 이해 확인 | A | - | - |
| hbs-40 | return | npc | Clerk | Yes. You can ask us if you need more help. | B1 | 이해 확인과 도움 권유 | A | - | - |

### 연습할 말

기준서 8.1의 카드 총량에 넣지 않는 미션 안의 연습이다. 두 사람이 번갈아 본문 줄을 그대로 연습하며, 아래 표 자체가 실제 음성 재생이나 필수 이수를 보장하지는 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| hbs-p1 | Can we ask questions after the video? | 질문 허락 묻기 | hbs-02 | - |
| hbs-p2 | Could you turn the volume up a little? | 음량 조절 요청 | hbs-03 | - |
| hbs-p3 | Could you explain the safety rules again? | 안전 규칙 재설명 요청 | hbs-07 | - |
| hbs-p4 | Where can we read those rules? | 규칙 글 위치 묻기 | hbs-08 | - |
| hbs-p5 | I'd like a mask and fins, please. | 장비 빌리기 요청 | hbs-12 | - |
| hbs-p6 | Does the equipment come in different sizes? | 장비 크기 범위 묻기 | hbs-13 | - |
| hbs-p7 | It feels loose. Can you check it? | 착용 문제 설명 | hbs-16 | - |
| hbs-p8 | Could I try another size? | 다른 크기 요청 | hbs-17 | - |
| hbs-p9 | What signal means I need help? | 도움 신호 뜻 묻기 | hbs-20 | - |
| hbs-p10 | Can you show us the signals first? | 신호 시범 요청 | hbs-21 | - |
| hbs-p11 | Could you watch us practice the signals here? | 신호 연습 확인 요청 | hbs-23 | - |
| hbs-p12 | I'd like to stay out of the water for now. | 입수 유보 | hbs-27 | - |
| hbs-p13 | Are today's conditions suitable for us? | 상태 판단 요청 | hbs-30 | - |
| hbs-p14 | Let's talk to the staff before we decide. | 직원 상담 제안 | hbs-34 | - |
| hbs-p15 | I'd rather stay here today. | 육지에 머물기 선택 | hbs-35 | - |
| hbs-p16 | Where should we return the equipment when we're done? | 장비 반납 위치 묻기 | hbs-37 | - |
| hbs-p17 | So we bring it back here. Is that right? | 반납 안내 이해 확인 | hbs-39 | - |

### 미니게임 차례

갈래 응답은 선택 뒤에 듣는다. 동일 안내가 다시 필요한 경우 기존 줄 ID를 재사용한다. 점수 차례의 후보 하나를 말하면 통과하며 시간 상한은 없다.

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | video | hbs-01 | hbs-02/hbs-03 | A |
| t2 | meaning | hbs-06 | hbs-07/hbs-08 | B |
| t3 | gear | hbs-11 | hbs-12/hbs-13 | A |
| t4 | fit | hbs-15 | hbs-16/hbs-17 | B |
| t5 | signal | hbs-19 | hbs-20/hbs-21 | A |
| t6 | confirm | - | hbs-23 | B |
| n1 | confirm | hbs-24 | - | - |
| t7 | partner | - | hbs-25 | A |
| t8 | partner | - | hbs-26/hbs-27 | B |
| t9 | conditions | hbs-29 | hbs-30/hbs-31 | A |
| t10 | decide | hbs-33 | hbs-34/hbs-35 | B |
| t11 | return | - | hbs-37 | A |
| n2 | return | hbs-38 | - | - |
| t12 | return | - | hbs-39 | B |
| n3 | return | hbs-40 | - | - |

## 나들이: iolani_palace_tour

작성자: gpt (2026-10-11)
장소: iolani_palace
세션: 155
목표 등급: B1
할 일: cd-ipt-1 / I can follow tour instructions, ask questions, and check my understanding. / 투어 안내를 듣고 질문하며 이해한 내용을 확인할 수 있다.
허용 이름: ʻIolani Palace
갈래: ipt-02 > ipt-04, ipt-03 > ipt-05, ipt-08 > ipt-10, ipt-09 > ipt-11, ipt-13 > ipt-15, ipt-14 > ipt-15, ipt-17 > ipt-19, ipt-18 > ipt-20, ipt-22 > ipt-24, ipt-23 > ipt-25, ipt-29 > ipt-31, ipt-30 > ipt-32, ipt-34 > ipt-36, ipt-35 > ipt-37

이름 주석: ʻIolani Palace는 이 미션 배경인 왕궁의 고유 이름이다. ʻIolani 첫 글자는 docs/culture.md 5.3의 U+02BB ʻokina로 쓴다. 이름의 어원이나 번역 뜻을 새로 설명하지 않는다. culture.md 5.2의 원래 사용 제한과 2026-10-09 로컬 빌드 허용 기록을 함께 확인했다. 일반 영어 palace를 허용 이름으로 면제하지 않으며 대사에는 고유 이름을 넣지 않는다. 이름 발음과 문화적 화용은 미확인이다.

속도 요청 주석: ipt-08과 ipt-10은 천천히 말해 달라는 요청과 그 응답을 연습하는 대사다. 이 데이터에는 음성 속도 설정이 없으며 실제 말하기 속도와 TTS 재생 속도는 검증하지 않았다.

상황: iolani_palace_tour의 가상 안내 연습이다. 대기 위치, 안내문, entrance 표지와 다음 줄, 문과 출구, 함께 걷는 방식, 둘러볼 시간과 안내문을 가져가는 허락은 모두 가상 장면값이다. 실제 궁전의 현재 규칙이나 투어 구성으로 제시하지 않는다. 역사 연도, 왕의 업적, 문화 사실, 운영시간과 가격은 대사에 넣지 않는다. 두 사람은 안내문을 받은 뒤 투어를 시작한다. 준비 시간이나 둘러볼 시간을 요청한 경로는 그 시간을 기다린 뒤 다음 차례로 이어진다.  다음 장소를 확인하는 차례 뒤에는 장면을 전환하여 투어 마지막 안내로 넘어간다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| ipt-01 | welcome | npc | Clerk | Welcome! Are you here for the tour? | B1 | 인사와 방문 목적 묻기 | A | - | - |
| ipt-02 | welcome | option | 두 사람 | Yes. Where should we wait? | A2 | 대기 위치 묻기 | A | - | - |
| ipt-03 | welcome | option | 두 사람 | Yes. Could we see the tour information first? | B1 | 안내 자료 요청 | A | - | - |
| ipt-04 | welcome | npc | Clerk | Please wait here with the group. | B1 | 대기 위치 안내 | B | 실제 대기 장소와 단체 운영은 확인하지 않은 가상 장면값이다 | - |
| ipt-05 | welcome | npc | Clerk | Here is the tour information. You can wait here. | B1 | 안내 자료와 대기 위치 제공 | B | 실제 안내 자료와 대기 절차는 확인하지 않은 가상 장면값이다 | - |
| ipt-06 | sheet | npc | Guide | Please take an information sheet before we begin. | B1 | 안내문 받기 안내 | B | 실제 안내문 배부 여부와 절차는 확인하지 않은 가상 장면값이다 | - |
| ipt-07 | ready | npc | Guide | We can begin when everyone is ready. | B1 | 시작 준비 확인 | B | 준비를 기다리는 진행 방식은 실제 투어 운영이 아니라 가상 장면값이다 | - |
| ipt-08 | ready | option | 두 사람 | We're ready. Please speak slowly. | A2 | 준비 알림과 속도 요청 | A | - | - |
| ipt-09 | ready | option | 두 사람 | Could you give us a moment, please? | A2 | 준비 시간 요청 | A | - | - |
| ipt-10 | ready | npc | Guide | Of course. I'll speak slowly. | A2 | 말하기 속도 요청 수락 | A | - | - |
| ipt-11 | ready | npc | Guide | Of course. Let me know when you're ready. | B1 | 준비 시간 허락 | A | - | - |
| ipt-12 | walk | npc | Guide | Please stay with the group as we walk. | B1 | 함께 걷기 안내 | B | 함께 걷는 방식은 실제 투어 규칙을 확인하지 않은 가상 장면값이다 | - |
| ipt-13 | walk | option | A자리 | So we should stay with you? | B1 | 안내 내용 확인 | A | - | - |
| ipt-14 | walk | option | A자리 | Could you show us where to walk? | B1 | 걷는 위치 요청 | A | - | - |
| ipt-15 | walk | npc | Guide | Please stay beside me as we walk. | B1 | 걷는 위치 구체화 | B | 안내자 옆에서 걷는 위치는 실제 동선이 아니라 가상 장면값이다 | - |
| ipt-16 | sign | npc | Guide | This sign says entrance. | B1 | 표지 읽어 주기 | B | entrance 표지는 이 연습에서 정한 가상 안내문이며 실제 표지 확인은 하지 않았다 | - |
| ipt-17 | sign | option | B자리 | What does entrance mean? | B1 | 낱말 뜻 묻기 | A | - | - |
| ipt-18 | sign | option | B자리 | Could you read the next line, please? | B1 | 다음 줄 읽기 요청 | A | - | - |
| ipt-19 | sign | npc | Guide | It means the way into a place. | B1 | 낱말 뜻 설명 | A | - | - |
| ipt-20 | sign | npc | Guide | The next line says please wait here. | B1 | 다음 표지 줄 읽기 | B | 다음 표지 문구는 실제 안내판 내용이 아니라 가상 장면값이다 | - |
| ipt-21 | room | npc | Guide | What would you like to ask about this room? | B1 | 질문 기회 주기 | A | - | - |
| ipt-22 | room | option | A자리 | Where can we read more about it? | B1 | 추가 자료 위치 묻기 | A | - | - |
| ipt-23 | room | option | A자리 | Could we have a moment to look around? | B1 | 둘러볼 시간 요청 | A | - | - |
| ipt-24 | room | npc | Guide | You can start with the information sheet. | B1 | 추가 자료 안내 | B | 안내문이 해당 방 정보를 담는 구성은 확인하지 않은 가상 장면값이다 | - |
| ipt-25 | room | npc | Guide | Yes. Take a moment, and then we'll continue. | B1 | 둘러볼 시간 허락 | B | 둘러볼 시간을 허락하는 진행 방식은 확인하지 않은 가상 장면값이다 | - |
| ipt-26 | partner | wait | A자리 | Did you understand that, {B}? | A2 | 상대의 이해 묻기 | A | - | - |
| ipt-27 | partner | option | B자리 | Yes. I understand the guide now. | B1 | 이해한 상태 알림 | A | - | - |
| ipt-28 | partner | option | B자리 | I'm not sure. Let's ask one more question. | B1 | 이해 유보와 추가 질문 제안 | A | - | - |
| ipt-29 | next | option | 두 사람 | Could you tell us what happens next? | B1 | 다음 순서 묻기 | A | - | - |
| ipt-30 | next | option | 두 사람 | Can we stop here for a moment? | A2 | 잠시 멈춤 요청 | A | - | - |
| ipt-31 | next | npc | Guide | We will continue through this door. | B1 | 다음 동선 안내 | B | 이어지는 문의 위치와 투어 동선은 확인하지 않은 가상 장면값이다 | - |
| ipt-32 | next | npc | Guide | Yes. We can wait here before we continue. | B1 | 잠시 멈춤 허락 | B | 잠시 멈추는 장소와 허락은 확인하지 않은 가상 장면값이다 | - |
| ipt-33 | end | npc | Guide | That is the end of our tour. | B1 | 투어 종료 안내 | A | - | - |
| ipt-34 | end | option | 두 사람 | Thank you. Where is the exit? | A2 | 출구 위치 묻기 | A | - | - |
| ipt-35 | end | option | 두 사람 | Thank you. May I keep this information sheet? | B1 | 안내문 보관 허락 요청 | A | - | - |
| ipt-36 | end | npc | Guide | The exit is through this door. | B1 | 출구 안내 | B | 출구와 문의 위치는 실제 궁전 동선을 확인하지 않은 가상 장면값이다 | - |
| ipt-37 | end | npc | Guide | Yes. You can keep it. | A2 | 안내문 보관 허락 | B | 안내문을 가져가는 허락은 실제 정책을 확인하지 않은 가상 장면값이다 | - |

### 연습할 말

본문과 같은 영어를 두 사람이 번갈아 연습하는 데이터다. 실제 음성 재생과 발화 전 이수는 이 파일로 확인할 수 없다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| ipt-p1 | Yes. Where should we wait? | 대기 위치 묻기 | ipt-02 | - |
| ipt-p2 | Yes. Could we see the tour information first? | 안내 자료 요청 | ipt-03 | - |
| ipt-p3 | We're ready. Please speak slowly. | 준비 알림과 속도 요청 | ipt-08 | - |
| ipt-p4 | Could you give us a moment, please? | 준비 시간 요청 | ipt-09 | - |
| ipt-p5 | So we should stay with you? | 안내 내용 확인 | ipt-13 | - |
| ipt-p6 | What does entrance mean? | 낱말 뜻 묻기 | ipt-17 | - |
| ipt-p7 | Could you read the next line, please? | 다음 줄 읽기 요청 | ipt-18 | - |
| ipt-p8 | Where can we read more about it? | 추가 자료 위치 묻기 | ipt-22 | - |
| ipt-p9 | Did you understand that, {B}? | 상대의 이해 묻기 | ipt-26 | - |
| ipt-p10 | Could you tell us what happens next? | 다음 순서 묻기 | ipt-29 | - |
| ipt-p11 | Thank you. Where is the exit? | 출구 위치 묻기 | ipt-34 | - |
| ipt-p12 | Thank you. May I keep this information sheet? | 안내문 보관 허락 요청 | ipt-35 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | welcome | ipt-01 | ipt-02/ipt-03 | 둘 중 누구든 |
| n1 | sheet | ipt-06 | - | - |
| t2 | ready | ipt-07 | ipt-08/ipt-09 | 둘 중 누구든 |
| t3 | walk | ipt-12 | ipt-13/ipt-14 | A |
| t4 | sign | ipt-16 | ipt-17/ipt-18 | B |
| t5 | room | ipt-21 | ipt-22/ipt-23 | A |
| t6 | partner | - | ipt-26 | A |
| t7 | partner | - | ipt-27/ipt-28 | B |
| t8 | next | - | ipt-29/ipt-30 | 둘 중 누구든 |
| t9 | end | ipt-33 | ipt-34/ipt-35 | 둘 중 누구든 |

## 나들이: kamehameha_statue_walk

작성자: gpt (2026-10-11)
장소: kamehameha_statue
세션: 161
목표 등급: B1
할 일: cd-ksw-1 / I can ask for directions, follow an explanation, and check unfamiliar words. / 길을 묻고 설명을 들으며 모르는 낱말을 확인할 수 있다.
허용 이름: Kamehameha
갈래: ksw-01 > ksw-03, ksw-02 > ksw-04, ksw-06 > ksw-08, ksw-07 > ksw-09, ksw-15 > ksw-17, ksw-16 > ksw-18, ksw-20 > ksw-22, ksw-21 > ksw-23, ksw-24 > ksw-26, ksw-25 > ksw-27, ksw-32 > ksw-34, ksw-33 > ksw-35

이름 주석: Kamehameha는 이 미션의 동상 이름에 쓰이는 고유 이름이다. docs/culture.md 5.1에 나온 철자를 유지하고 줄인 이름이나 새로운 어원 풀이를 만들지 않는다. 대사에는 이 이름을 넣지 않으며 일반 영어 statue는 이름 면제를 적용하지 않는다. 사람의 업적과 역사는 이 연습에서 설명하지 않으며 이름 발음과 문화적 화용은 미확인이다.

상황: kamehameha_statue_walk의 가상 길 묻기와 안내문 이해 연습이다. 동상, 길모퉁이와 횡단 위치, 지도 표시, 표지와 안내문, 다음 표지, 버스 정류장과 돌아가는 동선은 모두 가상 장면값이다. 실제 장소의 길 안내나 횡단 안전 지침을 대신하지 않는다. 현재 운영시간과 가격, 역사 연도와 왕의 업적, 문화 사실을 새로 만들지 않는다. 길 확인 뒤 동상 앞 안내 구역으로 장면을 전환하며, 모든 경로에서 두 사람은 안내문을 먼저 받는다. 뜻을 묻는 path는 문화 용어가 아닌 일반 영어이며, 계속 걷거나 쉬자는 두 선택 뒤에는 떠나기 전 길을 묻는 차례로 이어진다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| ksw-01 | directions | option | A자리 | Excuse me. Which way is the statue? | B1 | 방향 묻기 | A | - | - |
| ksw-02 | directions | option | A자리 | Excuse me. Could you show us the statue on the map? | B1 | 지도 표시 요청 | A | - | - |
| ksw-03 | directions | npc | Clerk | The statue is across the street. | B1 | 방향 안내 | B | 동상이 길 건너 있다는 위치는 실제 지리를 확인하지 않은 가상 장면값이다 | - |
| ksw-04 | directions | npc | Clerk | Here it is on the map. | A2 | 지도에서 위치 표시 | B | 지도에 표시하는 위치는 실제 지도를 확인하지 않은 가상 장면값이다 | - |
| ksw-05 | crossing | npc | Clerk | Use the crossing at the corner. | B1 | 횡단 위치 안내 | B | 모퉁이 횡단 위치는 가상 동선이며 실제 횡단 시설이나 안전 지침을 확인하지 않았다 | - |
| ksw-06 | crossing | option | B자리 | So we should use the crossing at the corner? | B1 | 길 안내 내용 확인 | A | - | - |
| ksw-07 | crossing | option | B자리 | Could you point to the crossing, please? | B1 | 횡단 위치 표시 요청 | A | - | - |
| ksw-08 | crossing | npc | Clerk | Yes. The crossing is at that corner. | B1 | 횡단 위치 확인 응답 | B | 모퉁이 횡단 위치는 실제 지리를 확인하지 않은 가상 장면값이다 | - |
| ksw-09 | crossing | npc | Clerk | It's there at the corner. | A2 | 횡단 위치 가리키기 | B | 손으로 가리키는 위치는 실제 지리를 확인하지 않은 가상 장면값이다 | - |
| ksw-10 | partner | wait | A자리 | Can you see the sign, {B}? | A2 | 상대의 표지 확인 묻기 | A | - | - |
| ksw-11 | partner | option | B자리 | Yes. Let's read it from here. | A2 | 표지 읽기 제안 | A | - | - |
| ksw-12 | partner | option | B자리 | I can't see it. Let's ask for help. | A2 | 어려움 알림과 도움 제안 | A | - | - |
| ksw-13 | sheet | npc | Guide | Here's an information sheet. It shows the path and the statue. | B1 | 안내문 제공 | B | 현장 안내자와 안내문 제공은 실제 운영을 확인하지 않은 가상 장면값이다 | - |
| ksw-14 | sign | npc | Guide | Would you like help with the sign? | B1 | 안내문 도움 제안 | A | - | - |
| ksw-15 | sign | option | 두 사람 | Could you read this part aloud, please? | B1 | 안내문 소리 내어 읽기 요청 | A | - | - |
| ksw-16 | sign | option | 두 사람 | Where can we find more information about the statue? | B1 | 추가 정보 위치 묻기 | A | - | - |
| ksw-17 | sign | npc | Guide | This part says please stay on the path. | B1 | 표지 내용 읽기 | B | 길 위에 머물라는 표지 문구는 실제 규정이 아니라 가상 장면값이다 | - |
| ksw-18 | sign | npc | Guide | You can find more information on this sheet. | B1 | 추가 정보 자료 안내 | B | 안내문의 구성과 제공 정보는 실제 자료를 확인하지 않은 가상 장면값이다 | - |
| ksw-19 | information | npc | Guide | What would you like to know? | A2 | 질문 기회 주기 | A | - | - |
| ksw-20 | information | option | A자리 | Does this sheet tell us about the statue? | B1 | 자료 내용 확인 | A | - | - |
| ksw-21 | information | option | A자리 | Which part should we read first? | A2 | 읽을 순서 묻기 | A | - | - |
| ksw-22 | information | npc | Guide | Yes. It gives information about the statue. | B1 | 자료 내용 확인 응답 | B | 안내문에 동상 정보가 있다는 구성은 실제 자료가 아니라 가상 장면값이다 | - |
| ksw-23 | information | npc | Guide | Start with the part at the top. | A2 | 읽을 위치 안내 | B | 안내문 윗부분부터 읽는 구성은 실제 자료를 확인하지 않은 가상 장면값이다 | - |
| ksw-24 | word | option | B자리 | What does path mean? | B1 | 낱말 뜻 묻기 | A | - | - |
| ksw-25 | word | option | B자리 | Does path mean a place to walk? | B1 | 낱말 뜻 추측 확인 | A | - | - |
| ksw-26 | word | npc | Guide | A path is a place where people walk. | B1 | 일반 낱말 뜻 설명 | A | - | - |
| ksw-27 | word | npc | Guide | Yes. It's a place where people walk. | B1 | 일반 낱말 뜻 확인 응답 | A | - | - |
| ksw-28 | plan | wait | A자리 | Shall we keep walking, {B}? | A2 | 다음 행동 제안 | A | - | - |
| ksw-29 | plan | option | B자리 | Yes. Let's look at the next sign. | A2 | 걷기 제안 수락 | A | - | - |
| ksw-30 | plan | option | B자리 | Let's take a break before we go. | A2 | 휴식 제안 | A | - | - |
| ksw-31 | leave | npc | Guide | Would you like directions before you leave? | B1 | 돌아갈 길 안내 제안 | A | - | - |
| ksw-32 | leave | option | 두 사람 | Which way is the bus stop? | A2 | 정류장 방향 묻기 | A | - | - |
| ksw-33 | leave | option | 두 사람 | Could you show us the way back? | B1 | 돌아가는 길 표시 요청 | A | - | - |
| ksw-34 | leave | npc | Guide | The bus stop is near that corner. | A2 | 정류장 위치 안내 | B | 버스 정류장과 모퉁이 위치는 실제 지리를 확인하지 않은 가상 장면값이다 | - |
| ksw-35 | leave | npc | Guide | You can use the same crossing to go back. | B1 | 돌아가는 동선 안내 | B | 같은 횡단 위치로 돌아가는 동선은 실제 지리를 확인하지 않은 가상 장면값이다 | - |
| ksw-36 | goodbye | npc | Guide | Take your time. Have a good day! | A2 | 여유와 작별 인사 | A | - | - |

### 연습할 말

본문과 같은 영어를 두 사람이 번갈아 연습하는 데이터다. 실제 음성 재생과 발화 전 이수는 이 파일로 확인할 수 없다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| ksw-p1 | Excuse me. Which way is the statue? | 방향 묻기 | ksw-01 | - |
| ksw-p2 | Excuse me. Could you show us the statue on the map? | 지도 표시 요청 | ksw-02 | - |
| ksw-p3 | So we should use the crossing at the corner? | 길 안내 내용 확인 | ksw-06 | - |
| ksw-p4 | Could you point to the crossing, please? | 횡단 위치 표시 요청 | ksw-07 | - |
| ksw-p5 | Can you see the sign, {B}? | 상대의 표지 확인 묻기 | ksw-10 | - |
| ksw-p6 | Could you read this part aloud, please? | 안내문 소리 내어 읽기 요청 | ksw-15 | - |
| ksw-p7 | Where can we find more information about the statue? | 추가 정보 위치 묻기 | ksw-16 | - |
| ksw-p8 | Which part should we read first? | 읽을 순서 묻기 | ksw-21 | - |
| ksw-p9 | What does path mean? | 낱말 뜻 묻기 | ksw-24 | - |
| ksw-p10 | Does path mean a place to walk? | 낱말 뜻 추측 확인 | ksw-25 | - |
| ksw-p11 | Shall we keep walking, {B}? | 다음 행동 제안 | ksw-28 | - |
| ksw-p12 | Could you show us the way back? | 돌아가는 길 표시 요청 | ksw-33 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | directions | - | ksw-01/ksw-02 | A |
| t2 | crossing | ksw-05 | ksw-06/ksw-07 | B |
| t3 | partner | - | ksw-10 | A |
| t4 | partner | - | ksw-11/ksw-12 | B |
| n1 | sheet | ksw-13 | - | - |
| t5 | sign | ksw-14 | ksw-15/ksw-16 | 둘 중 누구든 |
| t6 | information | ksw-19 | ksw-20/ksw-21 | A |
| t7 | word | - | ksw-24/ksw-25 | B |
| t8 | plan | - | ksw-28 | A |
| t9 | plan | - | ksw-29/ksw-30 | B |
| t10 | leave | ksw-31 | ksw-32/ksw-33 | 둘 중 누구든 |
| n2 | goodbye | ksw-36 | - | - |

## 나들이: pearl_harbor_visit

작성자: gpt (2026-10-11)
장소: pearl_harbor_visitor_center
세션: 185
목표 등급: B1
할 일: cd-phv-1 / I can ask about tickets and schedules and check visitor instructions. / 표와 일정을 묻고 방문 안내를 확인할 수 있다.
허용 이름: -
갈래: phv-02 > phv-04, phv-03 > phv-04, phv-05 > phv-07, phv-06 > phv-08, phv-09 > phv-11, phv-10 > phv-12, phv-13 > phv-15, phv-14 > phv-16, phv-17 > phv-19, phv-18 > phv-20, phv-21 > phv-22, phv-23 > phv-25, phv-24 > phv-26, phv-27 > phv-29, phv-28 > phv-30, phv-34 > phv-36, phv-35 > phv-37

상황: pearl_harbor_visit는 진주만 방문자 센터 안내 창구를 배경으로 한 학습용 기능 대화다. 지도에 전시와 프로그램이 보이고 두 사람은 표와 일정 및 방문 순서를 직원에게 확인한다. 프로그램, 일정표의 표시 위치, 지도, 전시, 자료 배부 방식은 모두 가상 장면값이다. 역사 연도나 피해 수치, 실제 운영시간과 가격은 넣지 않았으며 현재 가방 허용 규칙이나 보관 절차도 단정하지 않는다. 가방은 직원에게 확인하는 질문으로만 다룬다. t8 뒤에는 직원과 일정표를 함께 확인하고, 공통 NPC 줄 phv-38로 다음 프로그램 전 전시를 볼 여유가 있는 가상 장면 상태를 확인한 뒤 t9로 넘어간다. 확인하는 시간은 실제 운영 시각이나 프로그램 소요 시간의 사실값이 아니다. 어느 선택을 하든 두 사람은 전시를 먼저 살피고 일정표를 다시 확인하기로 끝에서 합의한다. phv-23의 느리게 반복 요청 뒤 phv-25는 짧은 재진술이다. 이 자료에는 음성 속도 필드가 없으며 실제 느린 TTS 재생과 이해 가능성은 미검증이다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| phv-01 | help | npc | Clerk | Hello! How can I help you? | A1 | 방문 목적 묻기 | A | - | - |
| phv-02 | help | option | 두 사람 | We would like to plan our visit. | A2 | 방문 계획 도움 요청 | A | - | - |
| phv-03 | help | option | 두 사람 | What can we see here? | A1 | 볼거리 질문 | A | - | - |
| phv-04 | help | npc | Clerk | Here are a map and today's schedule. The map shows the displays. | B1 | 방문 자료 안내 | B | 지도와 일정표 및 전시 표시는 실제 현장 자료가 아닌 가상 장면값이다 | - |
| phv-05 | tickets | option | A자리 | Do we need tickets for the programs? | A2 | 표 필요 여부 질문 | A | - | - |
| phv-06 | tickets | option | A자리 | Could we see the program schedule? | A2 | 일정표 요청 | A | - | - |
| phv-07 | tickets | npc | Clerk | Let's check the ticket information for each program. | A2 | 표 정보 확인 제안 | B | 실제 프로그램별 표 정책을 확인하지 않아 직원과 정보를 확인하는 가상 응답이다 | - |
| phv-08 | tickets | npc | Clerk | Here is the schedule for today's programs. | A2 | 일정표 건네기 | B | 현재 일정표의 존재나 내용을 확인한 안내가 아닌 가상 장면값이다 | - |
| phv-09 | time | option | B자리 | Could you tell us when the next program starts? | B1 | 시작 시각 질문 | A | - | - |
| phv-10 | time | option | B자리 | How long does the next program take? | A2 | 소요 시간 질문 | A | - | - |
| phv-11 | time | npc | Clerk | The start time is here on the schedule. | A2 | 시작 시각 표시 안내 | B | 일정표 표시 방식은 실제 방문자 센터 운영 정보가 아닌 가상 장면값이다 | - |
| phv-12 | time | npc | Clerk | The length is listed next to the start time. | A2 | 소요 시간 표시 안내 | B | 프로그램 소요 시간이 이렇게 표시되는지는 확인하지 않은 가상 장면값이다 | - |
| phv-13 | conditions | option | A자리 | Is there a charge for that program? | B1 | 요금 유무 질문 | A | - | - |
| phv-14 | conditions | option | A자리 | Do we need to book it before we go? | A2 | 사전 신청 여부 질문 | A | - | - |
| phv-15 | conditions | npc | Clerk | The cost is listed here for each program. | A2 | 요금 정보 위치 안내 | B | 프로그램별 요금이나 실제 표시 방식을 확인하지 않아 장면값으로만 둔다 | - |
| phv-16 | conditions | npc | Clerk | Let's check the booking information for that program. | A2 | 신청 정보 확인 제안 | B | 실제 사전 예약 절차를 확인하지 않았으며 현장 정보 확인으로 답하는 장면이다 | - |
| phv-17 | choose | option | B자리 | Could we take a moment to choose? | A2 | 선택 시간 요청 | A | - | - |
| phv-18 | choose | option | B자리 | Could you suggest where we should start? | B1 | 방문 순서 추천 요청 | A | - | - |
| phv-19 | choose | npc | Clerk | Of course. Take your time. | A1 | 선택 시간 허용 | A | - | - |
| phv-20 | choose | npc | Clerk | You could look at the displays first. | A2 | 방문 순서 제안 | B | 전시를 먼저 보라는 추천은 실제 동선 지침이 아닌 가상 직원의 제안이다 | - |
| phv-21 | bag | wait | A자리 | What should we do with this bag? | A2 | 가방 처리 질문 | A | - | - |
| phv-22 | bag | npc | Clerk | Please ask the entrance staff about the bag rules before you enter. | B1 | 직원에게 규칙 확인 요청 | A | - | - |
| phv-23 | repair | option | B자리 | Could you say that more slowly, please? | A2 | 느리게 반복 요청 | A | - | - |
| phv-24 | repair | option | B자리 | Could you show us the rules in writing? | A2 | 글로 된 규칙 요청 | B | 현장 규정을 글로 보여 달라는 요청의 지역 화용은 사람 검수가 필요하다 | - |
| phv-25 | repair | npc | Clerk | Ask the staff there before you enter. | A2 | 안내를 짧게 반복 | A | - | - |
| phv-26 | repair | npc | Clerk | I'll show you where to find the written rules. | A2 | 글로 된 규칙 위치 안내 | B | 규칙을 적은 자료의 실제 제공 여부를 확인하지 않은 가상 장면값이다 | - |
| phv-27 | route | option | A자리 | Where should we go for the next program? | A2 | 다음 프로그램 장소 질문 | A | - | - |
| phv-28 | route | option | A자리 | Could we see the displays before the next program? | B1 | 일정 조정 가능 여부 질문 | A | - | - |
| phv-29 | route | npc | Clerk | The meeting point is shown here on the map. | A2 | 모이는 위치 표시 안내 | B | 지도에 모이는 곳이 표시되는지는 실제 시설 사실이 아닌 가상 장면값이다 | - |
| phv-30 | route | npc | Clerk | Let's check how much time you have first. | A2 | 여유 시간 확인 제안 | A | - | - |
| phv-31 | plan | wait | B자리 | Let's look at the displays first, {A}. | A2 | 동행에게 방문 순서 제안 | A | - | - |
| phv-32 | plan | wait | A자리 | That works for me. Let's check the schedule too. | A2 | 동의와 일정 확인 제안 | A | - | - |
| phv-33 | close | npc | Clerk | Do you need anything else? | A1 | 추가 도움 묻기 | A | - | - |
| phv-34 | close | option | 두 사람 | No, thank you. We have what we need. | A2 | 도움 마무리 | A | - | - |
| phv-35 | close | option | 두 사람 | May we take this map with us? | A2 | 지도 가져가기 허락 요청 | A | - | - |
| phv-36 | close | npc | Clerk | You're welcome. Enjoy your visit. | A1 | 방문 인사 | A | - | - |
| phv-37 | close | npc | Clerk | Yes. You can take this map. | A1 | 지도 가져가기 허락 | B | 지도 배부와 가져가기 허용은 실제 시설 규정이 아닌 가상 장면값이다 | - |
| phv-38 | route | npc | Clerk | There is enough time to see the displays first. | A2 | 여유 시간 확인 완료 | B | 일정표를 함께 확인한 뒤 여유가 있다는 응답은 실제 운영 시간이 아닌 가상 장면값이다 | - |

### 연습할 말

두 사람이 번갈아 연습하는 본보기다. 본문 줄과 같은 영어를 연결한다. 실제 음성 품질이나 연습 완료 여부는 이 표로 검증하지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| phv-p1 | We would like to plan our visit. | 방문 계획 도움 요청 | phv-02 | - |
| phv-p2 | Do we need tickets for the programs? | 표 필요 여부 질문 | phv-05 | - |
| phv-p3 | Could we see the program schedule? | 일정표 요청 | phv-06 | - |
| phv-p4 | Could you tell us when the next program starts? | 시작 시각 질문 | phv-09 | - |
| phv-p5 | How long does the next program take? | 소요 시간 질문 | phv-10 | - |
| phv-p6 | Is there a charge for that program? | 요금 유무 질문 | phv-13 | - |
| phv-p7 | Do we need to book it before we go? | 사전 신청 여부 질문 | phv-14 | - |
| phv-p8 | Could you suggest where we should start? | 방문 순서 추천 요청 | phv-18 | - |
| phv-p9 | What should we do with this bag? | 가방 처리 질문 | phv-21 | - |
| phv-p10 | Could you say that more slowly, please? | 느리게 반복 요청 | phv-23 | - |
| phv-p11 | Could you show us the rules in writing? | 글로 된 규칙 요청 | phv-24 | - |
| phv-p12 | Where should we go for the next program? | 다음 프로그램 장소 질문 | phv-27 | - |
| phv-p13 | Could we see the displays before the next program? | 일정 조정 가능 여부 질문 | phv-28 | - |
| phv-p14 | Let's look at the displays first, {A}. | 동행에게 방문 순서 제안 | phv-31 | - |
| phv-p15 | May we take this map with us? | 지도 가져가기 허락 요청 | phv-35 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | help | phv-01 | phv-02/phv-03 | 둘 중 누구든 |
| t2 | tickets | - | phv-05/phv-06 | A |
| t3 | time | - | phv-09/phv-10 | B |
| t4 | conditions | - | phv-13/phv-14 | A |
| t5 | choose | - | phv-17/phv-18 | B |
| t6 | bag | - | phv-21 | A |
| t7 | repair | - | phv-23/phv-24 | B |
| t8 | route | - | phv-27/phv-28 | A |
| n1 | route | phv-38 | - | - |
| t9 | plan | - | phv-31 | B |
| t10 | plan | - | phv-32 | A |
| t11 | close | phv-33 | phv-34/phv-35 | 둘 중 누구든 |

## 나들이: north_shore_shrimp_truck

작성자: gpt (2026-10-11)
장소: giovannis_shrimp_truck
세션: 191
목표 등급: B1
할 일: cd-nss-1 / I can choose shrimp portions and spice, check an order, and pay. / 새우의 양과 맵기를 고르고 주문을 확인해 계산할 수 있다.
허용 이름: -
갈래: nss-02 > nss-04, nss-03 > nss-04, nss-11 > nss-12, nss-15 > nss-16, nss-18 > nss-20, nss-19 > nss-21, nss-22 > nss-23, nss-25 > nss-26, nss-28 > nss-30, nss-29 > nss-30, nss-33 > nss-34, nss-37 > nss-39, nss-38 > nss-40

상황: north_shore_shrimp_truck는 지오반니스 새우 트럭 장소를 배경으로 한 학습용 기능 대화다. 대사의 새우 접시, 양 표시, 매운 소스와 제외 또는 따로 담기, 현금과 카드, 영수증과 대기 절차는 실제 메뉴나 운영 확인 정보가 아닌 가상 장면값이다. 실제 메뉴명, 요금, 제공량이나 알레르기 안전을 보장하지 않는다. 처음에는 함께 먹거나 각자 먹을지 의논하지만 A가 두 접시로 정하고 두 주문 대안도 모두 두 접시다. 맵기 질문 뒤 소스 차례에서 음식에는 매운 소스를 넣지 않기로 최종 확정한다. 소스를 따로 받으면 별도 컵으로 받고 음식 위에는 넣지 않는다. 마지막 주문 확인은 두 갈래에 공통인 두 접시와 음식 위 소스 제외만 다시 읽는다. 소스 컵 갈래의 수락은 그 갈래 응답에서 확인한다. 총액은 숫자를 만들지 않고 표시된 주문 총액을 확인한다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| nss-01 | menu | npc | Clerk | Hi! What would you like? | A2 | 주문 도움 묻기 | A | - | - |
| nss-02 | menu | option | A자리 | Could we see the menu, please? | A2 | 메뉴 요청 | A | - | - |
| nss-03 | menu | option | A자리 | How big is a shrimp plate? | A2 | 한 접시 양 질문 | A | - | - |
| nss-04 | menu | npc | Clerk | Here is the menu. The portions are shown here. | A2 | 메뉴와 양 표시 안내 | B | 실제 메뉴의 구성이나 양 표시 방식이 아닌 가상 차림표의 장면값이다 | - |
| nss-05 | share | wait | A자리 | Should we share one plate, {B}? | A2 | 동행에게 나눠 먹기 제안 | A | - | - |
| nss-06 | share | option | B자리 | I'd rather have my own plate. | B1 | 각자 먹기 선호 | A | - | - |
| nss-07 | share | option | B자리 | I'm not sure. How hungry are you? | A2 | 선택 유보와 배고픔 질문 | A | - | - |
| nss-08 | share | wait | A자리 | I'm hungry. Let's get two plates. | A2 | 배고픔 설명과 수량 결정 | A | - | - |
| nss-09 | quantity | npc | Clerk | How many plates would you like? | A2 | 주문 수량 묻기 | A | - | - |
| nss-10 | quantity | option | A자리 | Two shrimp plates, please. | A2 | 수량 주문 | A | - | - |
| nss-11 | quantity | option | A자리 | Two plates, please. What comes with the shrimp? | A2 | 주문과 음식 구성 질문 | A | - | - |
| nss-12 | quantity | npc | Clerk | The menu shows what comes with each plate. | A2 | 구성 정보 위치 안내 | B | 실제 음식 구성을 만들지 않고 가상 메뉴의 표시 위치만 안내하는 장면이다 | - |
| nss-13 | spice | npc | Clerk | Do you want them spicy? | A2 | 맵기 묻기 | B | 실제 매장의 맵기 선택이나 조절 가능 여부를 확인하지 않은 가상 주문이다 | - |
| nss-14 | spice | option | B자리 | Not spicy, please. | A2 | 맵기 선택 | A | - | - |
| nss-15 | spice | option | B자리 | How spicy is the sauce? | A2 | 소스 맵기 질문 | A | - | - |
| nss-16 | spice | npc | Clerk | It's quite spicy. You can leave it off. | B1 | 소스 맵기 설명과 제외 안내 | B | 소스의 맵기 정도와 제외 가능 여부는 실제 매장 사실을 확인하지 않은 장면값이다 | - |
| nss-17 | sauce | npc | Clerk | Would you like sauce on both plates? | A2 | 소스 제공 방식 묻기 | B | 소스 제공 방식은 실제 메뉴나 선택 가능 여부가 아닌 가상 장면값이다 | - |
| nss-18 | sauce | option | 두 사람 | No spicy sauce on either plate, please. | A2 | 매운 소스 제외 선택 | A | - | - |
| nss-19 | sauce | option | 두 사람 | Please put the spicy sauce on the side. | A2 | 소스 따로 제공 요청 | A | - | - |
| nss-20 | sauce | npc | Clerk | Of course. I'll leave the spicy sauce off both plates. | B1 | 소스 제외 확인 | B | 소스 제외를 수락하는 것은 실제 매장의 제공 가능 여부가 아닌 가상 장면값이다 | - |
| nss-21 | sauce | npc | Clerk | I'll put the sauce in a separate cup. | A2 | 소스 따로 제공 수락 | B | 따로 담는 컵 제공 여부와 이 상황의 연어 자연스러움은 현장 검수가 필요하다 | - |
| nss-22 | review | wait | B자리 | Could you read our order back to us? | A2 | 주문 내용 다시 읽기 요청 | A | - | - |
| nss-23 | review | npc | Clerk | Two shrimp plates. No spicy sauce on the food. | A2 | 공통 주문 내용 확인 | A | - | - |
| nss-24 | confirm | option | A자리 | Yes, that is our order. | A1 | 주문 확정 | A | - | - |
| nss-25 | confirm | option | A자리 | Yes, please. Could we have two forks? | A2 | 주문 확정과 식기 요청 | A | - | - |
| nss-26 | confirm | npc | Clerk | Of course. I'll add two forks. | A2 | 식기 요청 수락 | A | - | - |
| nss-27 | total | npc | Clerk | Anything else? | A1 | 추가 주문 묻기 | A | - | - |
| nss-28 | total | option | B자리 | That is all. How much is the total? | A2 | 주문 마무리와 총액 질문 | A | - | - |
| nss-29 | total | option | B자리 | That is all. Can we pay by card? | A2 | 주문 마무리와 결제 수단 확인 | A | - | - |
| nss-30 | total | npc | Clerk | Here is the total. We accept cash or card. | A2 | 총액 제시와 결제 안내 | B | 실제 가격은 정하지 않으며 현금과 카드 수납도 가상 장면값으로만 둔다 | - |
| nss-31 | pay | npc | Clerk | Cash or card? | A1 | 결제 수단 묻기 | A | - | - |
| nss-32 | pay | option | 두 사람 | Card, please. | A1 | 결제 수단 선택 | A | - | - |
| nss-33 | pay | option | 두 사람 | Card, please. Could we have a receipt? | A2 | 결제 수단 선택과 영수증 요청 | A | - | - |
| nss-34 | pay | npc | Clerk | Of course. Here is your receipt. | A1 | 영수증 건네기 | A | - | - |
| nss-35 | pickup | npc | Clerk | Thank you. Please wait here for your order. | A2 | 주문 대기 안내 | B | 주문 뒤 이 자리에서 기다리는 절차는 실제 매장 운영이 아닌 가상 장면값이다 | - |
| nss-36 | pickup | npc | Clerk | Your order is ready. | A1 | 음식 준비 알림 | A | - | - |
| nss-37 | pickup | option | 두 사람 | Thank you. Are both plates here? | A2 | 주문 수량 확인 | A | - | - |
| nss-38 | pickup | option | 두 사람 | Thank you. Could we have some napkins? | A2 | 냅킨 요청 | A | - | - |
| nss-39 | pickup | npc | Clerk | Yes. Both plates are here. | A1 | 두 접시 확인 | A | - | - |
| nss-40 | pickup | npc | Clerk | Here are your napkins. | A1 | 냅킨 건네기 | A | - | - |

### 연습할 말

두 사람이 번갈아 연습하는 본보기다. 본문 줄과 같은 영어를 연결한다. 실제 음성 품질이나 연습 완료 여부는 이 표로 검증하지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| nss-p1 | Could we see the menu, please? | 메뉴 요청 | nss-02 | - |
| nss-p2 | How big is a shrimp plate? | 한 접시 양 질문 | nss-03 | - |
| nss-p3 | Should we share one plate, {B}? | 동행에게 나눠 먹기 제안 | nss-05 | - |
| nss-p4 | I'd rather have my own plate. | 각자 먹기 선호 | nss-06 | - |
| nss-p5 | I'm not sure. How hungry are you? | 선택 유보와 배고픔 질문 | nss-07 | - |
| nss-p6 | I'm hungry. Let's get two plates. | 배고픔 설명과 수량 결정 | nss-08 | - |
| nss-p7 | Two shrimp plates, please. | 수량 주문 | nss-10 | - |
| nss-p8 | Two plates, please. What comes with the shrimp? | 주문과 음식 구성 질문 | nss-11 | - |
| nss-p9 | Not spicy, please. | 맵기 선택 | nss-14 | - |
| nss-p10 | How spicy is the sauce? | 소스 맵기 질문 | nss-15 | - |
| nss-p11 | No spicy sauce on either plate, please. | 매운 소스 제외 선택 | nss-18 | - |
| nss-p12 | Please put the spicy sauce on the side. | 소스 따로 제공 요청 | nss-19 | - |
| nss-p13 | Could you read our order back to us? | 주문 내용 다시 읽기 요청 | nss-22 | - |
| nss-p14 | Yes, that is our order. | 주문 확정 | nss-24 | - |
| nss-p15 | Yes, please. Could we have two forks? | 주문 확정과 식기 요청 | nss-25 | - |
| nss-p16 | That is all. How much is the total? | 주문 마무리와 총액 질문 | nss-28 | - |
| nss-p17 | That is all. Can we pay by card? | 주문 마무리와 결제 수단 확인 | nss-29 | - |
| nss-p18 | Card, please. Could we have a receipt? | 결제 수단 선택과 영수증 요청 | nss-33 | - |
| nss-p19 | Thank you. Are both plates here? | 주문 수량 확인 | nss-37 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | menu | nss-01 | nss-02/nss-03 | A |
| t2 | share | - | nss-05 | A |
| t3 | share | - | nss-06/nss-07 | B |
| t4 | share | - | nss-08 | A |
| t5 | quantity | nss-09 | nss-10/nss-11 | A |
| t6 | spice | nss-13 | nss-14/nss-15 | B |
| t7 | sauce | nss-17 | nss-18/nss-19 | 둘 중 누구든 |
| t8 | review | - | nss-22 | B |
| t9 | confirm | - | nss-24/nss-25 | A |
| t10 | total | nss-27 | nss-28/nss-29 | B |
| t11 | pay | nss-31 | nss-32/nss-33 | 둘 중 누구든 |
| n1 | pickup | nss-35 | - | - |
| t12 | pickup | nss-36 | nss-37/nss-38 | 둘 중 누구든 |

## 나들이: sunset_beach_day

작성자: codex (2026-10-11)
장소: sunset_beach
세션: 197
목표 등급: B1
할 일: cd-sbd-1 / I can ask about beach signs and waves and describe a sunset. / 해변 표지와 파도에 관해 묻고 노을을 묘사할 수 있다.
허용 이름: -
갈래: sbd-02 > sbd-04, sbd-03 > sbd-05, sbd-07 > sbd-09, sbd-08 > sbd-06, sbd-10 > sbd-12, sbd-11 > sbd-13, sbd-16 > sbd-17, sbd-22 > sbd-24, sbd-23 > sbd-25, sbd-30 > sbd-32, sbd-31 > sbd-33, sbd-35 > sbd-37, sbd-36 > sbd-38

상황: sunset_beach_day에서 두 사람이 Sunset Beach에 동행한 가상의 안내원 Guide와 표지를 보고 파도와 노을에 관해 이야기한다. Guide는 안전 판정을 내리는 전문가가 아니며, 해변 상태와 계획은 현장 직원에게 확인하도록 연결한다. 표지 문구, 직원과 안내판의 위치, 파도 크기, 하늘 색, 앞서 본 파도는 모두 가상 장면 값이다. 실제 날씨, 운영 시간, 요금, 규칙, 수영 허용 여부나 안전 수치는 제시하지 않는다. 두 사람은 육지에서 관찰하며 물에 들어가는 장면은 없다. t7 뒤에는 해변 직원을 통해 필요한 확인을 마치고, t9 뒤에는 잠시 조용히 노을을 본 뒤 t10으로 이어진다. 마지막에는 두 갈래 모두 떠날 준비를 한다.

이름 주석: 대사에는 하와이어 낱말과 고유 이름이 없다. Sunset Beach는 상황 설명에만 쓰는 영어 지명이며, 새 하와이어 이름이나 번역을 만들지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| sbd-01 | arrival | npc | Guide | Hi! What brings you here today? | B1 | 방문 목적 묻기 | B | 방문 목적을 묻는 표현의 화용과 목표 등급은 사람 검수가 필요하다 | - |
| sbd-02 | arrival | option | A자리 | We would like to watch the sunset. | B1 | 방문 목적 말하기 | A | - | - |
| sbd-03 | arrival | option | A자리 | Could you explain the signs before we look around? | B1 | 사전 설명 요청 | A | - | - |
| sbd-04 | arrival | npc | Guide | What would you like to know? | B1 | 질문 권하기 | A | - | - |
| sbd-05 | arrival | npc | Guide | Yes. Let's look at this sign together. | B1 | 함께 읽기 제안 | A | - | - |
| sbd-06 | signs | npc | Guide | This sign asks visitors to check with the beach staff. | B1 | 표지 내용 전달 | B | 가상 표지 내용이며 현장 표지의 실제 문구와 안내 말투는 확인하지 못했다 | - |
| sbd-07 | signs | option | B자리 | Does that include people who just want to watch? | B1 | 적용 범위 질문 | A | - | - |
| sbd-08 | signs | option | B자리 | Could you say that more slowly, please? | B1 | 천천히 말하기 요청 | A | - | - |
| sbd-09 | signs | npc | Guide | You can ask the staff about your plans. | B1 | 확인 대상 안내 | A | - | - |
| sbd-10 | conditions | option | A자리 | What are the waves like today? | B1 | 파도 상태 질문 | A | - | - |
| sbd-11 | conditions | option | A자리 | Who can answer questions about the waves? | B1 | 문의 대상 질문 | A | - | - |
| sbd-12 | conditions | npc | Guide | I can describe them, but let's ask the staff about safety. | B1 | 설명 범위와 확인 대상 알리기 | B | 안전 문의를 현장 직원에게 연결하는 표현은 전문 안내 말투의 사람 검수가 필요하다 | - |
| sbd-13 | conditions | npc | Guide | The beach staff can explain today's conditions. | B1 | 문의 대상 안내 | B | 가상 직원의 안내 역할이며 실제 현장 인력과 업무 범위는 확인하지 못했다 | - |
| sbd-14 | waves | npc | Guide | Look at those waves. What do you notice? | B1 | 관찰 질문 | A | - | - |
| sbd-15 | waves | option | B자리 | They look larger than the waves we saw earlier. | B1 | 파도 비교 묘사 | A | - | - |
| sbd-16 | waves | option | B자리 | Could you show me which waves you mean? | B1 | 관찰 대상 확인 요청 | A | - | - |
| sbd-17 | waves | npc | Guide | I mean those waves farther out. | B1 | 관찰 대상 설명 | A | - | - |
| sbd-18 | plans | wait | A자리 | Would you like to watch for a while, {B}? | B1 | 상대 의향 묻기 | A | - | - |
| sbd-19 | plans | option | B자리 | Yes. Let's stay on land and watch. | B1 | 관찰 선택과 제안 | A | - | - |
| sbd-20 | plans | option | B자리 | I'd rather leave after we see the sunset. | B1 | 선호와 출발 계획 말하기 | B | 선호를 말하는 축약 표현의 화용과 목표 등급은 사람 검수가 필요하다 | - |
| sbd-21 | notices | npc | Guide | Do you have any more questions? | B1 | 추가 질문 묻기 | A | - | - |
| sbd-22 | notices | option | 두 사람 | Where can we check the notices again? | B1 | 안내판 위치 질문 | A | - | - |
| sbd-23 | notices | option | 두 사람 | We have enough information for now, thank you. | B1 | 설명 마무리 | A | - | - |
| sbd-24 | notices | npc | Guide | The notices are next to that desk. | B1 | 가상 안내판 위치 전달 | A | - | - |
| sbd-25 | notices | npc | Guide | Please ask the staff if you have more questions. | B1 | 추가 문의 권하기 | A | - | - |
| sbd-26 | sunset | wait | A자리 | The sky is turning orange. What do you think, {B}? | B1 | 노을 묘사와 의견 묻기 | A | - | - |
| sbd-27 | sunset | option | B자리 | The colors are beautiful. I want to take a picture. | B1 | 감상과 희망 말하기 | A | - | - |
| sbd-28 | sunset | option | B자리 | Could we just watch for a moment? | B1 | 조용한 관찰 요청 | A | - | - |
| sbd-29 | photo | npc | Guide | Would you like me to take your picture? | B1 | 사진 촬영 제안 | A | - | - |
| sbd-30 | photo | option | A자리 | Yes, please. We would like the sunset behind us. | B1 | 제안 수락과 구도 요청 | A | - | - |
| sbd-31 | photo | option | A자리 | No, thank you. We want to watch quietly. | B1 | 제안 거절과 의향 설명 | A | - | - |
| sbd-32 | photo | npc | Guide | Sure. I can take it from here. | B1 | 촬영 요청 수락 | A | - | - |
| sbd-33 | photo | npc | Guide | Of course. Enjoy the view. | B1 | 선택 존중 | A | - | - |
| sbd-34 | departure | npc | Guide | Is there anything else you would like to ask? | B1 | 마지막 질문 묻기 | A | - | - |
| sbd-35 | departure | option | B자리 | Where is the path back to the entrance? | B1 | 돌아갈 길 질문 | A | - | - |
| sbd-36 | departure | option | B자리 | We would like to leave now, thank you. | B1 | 출발 의향 전달 | A | - | - |
| sbd-37 | departure | npc | Guide | It is over there, next to the desk. | B1 | 가상 길 위치 안내 | A | - | - |
| sbd-38 | departure | npc | Guide | Have a good evening! | B1 | 작별 인사 | A | - | - |
| sbd-39 | departure | wait | 두 사람 | Thank you for your help. Have a good evening. | B1 | 감사와 작별 | A | - | - |

### 연습할 말 (이 나들이의 연습 12개)

나들이 안에서 쓸 연습 말의 본보기 데이터이며, 기준서 8.1의 카드 총량에는 들어가지 않는다. 두 사람이 자리를 바꾸어 쓸 수 있도록 원문 줄을 그대로 연결한다. 이 데이터가 필수 선행 연습이나 음성 속도를 보장하지는 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| sbd-p1 | We would like to watch the sunset. | 방문 목적 말하기 | sbd-02 | - |
| sbd-p2 | Could you explain the signs before we look around? | 사전 설명 요청 | sbd-03 | - |
| sbd-p3 | Does that include people who just want to watch? | 적용 범위 질문 | sbd-07 | - |
| sbd-p4 | Could you say that more slowly, please? | 천천히 말하기 요청 | sbd-08 | - |
| sbd-p5 | What are the waves like today? | 파도 상태 질문 | sbd-10 | - |
| sbd-p6 | Who can answer questions about the waves? | 문의 대상 질문 | sbd-11 | - |
| sbd-p7 | They look larger than the waves we saw earlier. | 파도 비교 묘사 | sbd-15 | - |
| sbd-p8 | Yes. Let's stay on land and watch. | 관찰 선택과 제안 | sbd-19 | - |
| sbd-p9 | Where can we check the notices again? | 안내판 위치 질문 | sbd-22 | - |
| sbd-p10 | The sky is turning orange. What do you think, {B}? | 노을 묘사와 의견 묻기 | sbd-26 | - |
| sbd-p11 | Could we just watch for a moment? | 조용한 관찰 요청 | sbd-28 | - |
| sbd-p12 | Where is the path back to the entrance? | 돌아갈 길 질문 | sbd-35 | - |

### 미니게임 차례

갈래 응답은 선택 직후 제시할 줄 데이터다. sbd-08의 천천히 말해 달라는 요청 뒤에는 sbd-06 원문을 다시 제시하지만, 실제 음성 속도와 TTS는 미검증이다. t3에서는 물놀이 허용이나 안전 여부를 판정하지 않고 문의할 사람을 확인한다. t7 뒤의 현장 확인과 t9 뒤의 잠시 관찰은 점수 없는 상황 전환이며, 실제 확인 결과를 새 영어 사실로 만들지 않는다.

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | arrival | sbd-01 | sbd-02/sbd-03 | A |
| t2 | signs | sbd-06 | sbd-07/sbd-08 | B |
| t3 | conditions | - | sbd-10/sbd-11 | A |
| t4 | waves | sbd-14 | sbd-15/sbd-16 | B |
| t5 | plans | - | sbd-18 | A |
| t6 | plans | - | sbd-19/sbd-20 | B |
| t7 | notices | sbd-21 | sbd-22/sbd-23 | 둘 중 누구든 |
| t8 | sunset | - | sbd-26 | A |
| t9 | sunset | - | sbd-27/sbd-28 | B |
| t10 | photo | sbd-29 | sbd-30/sbd-31 | A |
| t11 | departure | sbd-34 | sbd-35/sbd-36 | B |
| t12 | departure | - | sbd-39 | 둘 중 누구든 |

## 나들이: aloha_festival_parade

작성자: GPT2-G3-parade-hula (2026-10-11)
장소: -
세션: 40
목표 등급: A1
할 일: cd-afp-1 / I can react to a parade and ask a simple question. / 퍼레이드를 보며 짧게 감탄하고 한 가지를 물을 수 있다.
허용 이름: aloha (하와이어 인사말로만 사용한다. 뜻을 문화 전체의 정의로 넓히지 않는다.)
갈래: afp-02>afp-04, afp-03>afp-05, afp-07>afp-09, afp-08>afp-10, afp-16>afp-18, afp-17>afp-19, afp-20>afp-22, afp-21>afp-18, afp-28>afp-30, afp-29>afp-31

상황: aloha_festival_parade는 이후 공개 미션이다. 세션 40이어도 TASK 지시대로 모든 줄과 연습 풀이를 '-'로 둔다. 임시 장소 제안 id는 outings.md의 new:kalakaua_parade_route이며 authored 장소는 '-'다. 두 사람은 행사 직원에게 관람 자리를 확인하고, 기다리는 동안 들리는 음악을 이야기한 뒤 지나가는 행렬을 본다. ten이라는 시작 시각, 관람할 쪽, 앉을 자리, 종료 시점과 머물 수 있다는 안내는 모두 가상 장면 값이며 실제 행사 시간·규칙·배치 안내가 아니다. time 장면 뒤 flowers 장면에서는 시간이 지나 행렬이 도착하고, end 장면에서는 행렬이 끝난다. 꽃은 가상 장면에서 보이는 꽃이며 특정 문화적 의미를 붙이지 않는다.

표기와 근거 범위: aloha는 이 철자의 인사 용도만 쓴다. 기존 authored_lines.md의 인사 쓰임과 culture.md의 하와이어 낱말을 말장난으로 쓰지 않는 기준을 따른다. 실제 축제의 유래나 aloha의 넓은 문화적 뜻은 설명하지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| afp-01 | arrival | npc | Host | Aloha! Can I help you? | A1 | 인사 안내 | B | 실제 행사 직원의 인사로 이 하와이어를 쓰는 빈도는 확인하지 않았다. | - |
| afp-02 | arrival | option | 두 사람 | Hi! Is this the parade? | A1 | 행사 확인 질문 | A | - | - |
| afp-03 | arrival | option | 두 사람 | Hi! We are here to watch. | A1 | 방문 목적 말하기 | A | - | - |
| afp-04 | arrival | npc | Host | Yes. You can watch from here. | A1 | 확인 관람 안내 | A | - | - |
| afp-05 | arrival | npc | Host | Welcome! You can watch from here. | A1 | 환영 관람 안내 | A | - | - |
| afp-06 | place | npc | Host | Please stay on this side. | A1 | 자리 안내 | A | - | - |
| afp-07 | place | option | 두 사람 | Here, on the left? | A1 | 위치 이해 확인 | A | - | - |
| afp-08 | place | option | 두 사람 | Can we sit here? | A1 | 앉기 허락 요청 | A | - | - |
| afp-09 | place | npc | Host | Yes. This side, please. | A1 | 위치 확인 | A | - | - |
| afp-10 | place | npc | Host | Yes, you can sit here. | A1 | 허락 대답 | A | - | - |
| afp-11 | music | option | A자리 | I like the music! | A1 | 감상 말하기 | A | - | - |
| afp-12 | music | option | A자리 | Can you hear the music, {B}? | A1 | 동행에게 묻기 | A | - | - |
| afp-13 | music | option | B자리 | Yes. I like it! | A1 | 동의 감상 | A | - | - |
| afp-14 | music | option | B자리 | Yes. Let's listen to the music. | A1 | 함께 듣기 제안 | A | - | - |
| afp-15 | time | npc | Host | You can ask me a question. | A1 | 질문 권유 | A | - | - |
| afp-16 | time | option | 두 사람 | What time does it start? | A1 | 시작 시각 질문 | A | - | - |
| afp-17 | time | option | 두 사람 | We will wait here. | A1 | 기다릴 뜻 말하기 | A | - | - |
| afp-18 | time | npc | Host | It starts at ten. | A1 | 시각 안내 | A | - | - |
| afp-19 | time | npc | Host | Okay. It starts at ten. | A1 | 뜻 받기 시각 안내 | A | - | - |
| afp-20 | time | option | A자리 | Ten? Is that right? | A1 | 들은 시각 확인 | A | - | - |
| afp-21 | time | option | A자리 | Please say that again. | A1 | 반복 요청 | A | - | - |
| afp-22 | time | npc | Host | Yes. Ten. | A1 | 시각 확인 대답 | A | - | - |
| afp-23 | flowers | npc | Host | Look! Here they come! | A1 | 행렬 도착 알림 | B | 실제 행사 안내자의 행렬 도착 알림으로 쓰는 빈도는 확인하지 않았다. | - |
| afp-24 | flowers | option | A자리 | Look at the flowers! | A1 | 감탄 주의 끌기 | A | - | - |
| afp-25 | flowers | option | A자리 | Can you see the flowers, {B}? | A1 | 동행의 관찰 확인 | A | - | - |
| afp-26 | flowers | wait | B자리 | Yes. They are beautiful! | A1 | 동의 감탄 | A | - | - |
| afp-27 | end | npc | Host | The parade is over now. | A1 | 종료 안내 | A | - | - |
| afp-28 | end | option | 두 사람 | That was beautiful! | A1 | 감상 전하기 | A | - | - |
| afp-29 | end | option | 두 사람 | Can we stay here? | A1 | 머물기 허락 요청 | A | - | - |
| afp-30 | end | npc | Host | Thank you! | A1 | 감상에 감사 | B | 공연자가 아닌 행사 직원이 관람 감상에 감사하는 화용은 검증이 필요하다. | - |
| afp-31 | end | npc | Host | Yes. You can stay here. | A1 | 머물기 허락 | A | - | - |
| afp-32 | goodbye | npc | Host | Have a nice day! | A1 | 작별 | A | - | - |
| afp-33 | goodbye | wait | 두 사람 | Thank you! Bye! | A1 | 감사 작별 | A | - | - |

### 연습할 말

두 사람이 차례로 듣고 말한다. 연습은 미션 안에서만 쓰고 본문 player 줄을 그대로 재사용한다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| afp-p1 | Hi! Is this the parade? | 행사 확인 질문 | afp-02 | - |
| afp-p2 | Can we sit here? | 앉기 허락 요청 | afp-08 | - |
| afp-p3 | I like the music! | 감상 말하기 | afp-11 | - |
| afp-p4 | What time does it start? | 시작 시각 질문 | afp-16 | - |
| afp-p5 | Ten? Is that right? | 들은 시각 확인 | afp-20 | - |
| afp-p6 | Please say that again. | 반복 요청 | afp-21 | - |
| afp-p7 | Look at the flowers! | 감탄 주의 끌기 | afp-24 | - |
| afp-p8 | Yes. They are beautiful! | 동의 감탄 | afp-26 | - |
| afp-p9 | Can we stay here? | 머물기 허락 요청 | afp-29 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | arrival | afp-01 | afp-02/afp-03 | 둘 중 누구든 |
| t2 | place | afp-06 | afp-07/afp-08 | 둘 중 누구든 |
| t3 | music | - | afp-11/afp-12 | A |
| t4 | music | - | afp-13/afp-14 | B |
| t5 | time | afp-15 | afp-16/afp-17 | 둘 중 누구든 |
| t6 | time | - | afp-20/afp-21 | A |
| t7 | flowers | afp-23 | afp-24/afp-25 | A |
| t8 | flowers | - | afp-26 | B |
| t9 | end | afp-27 | afp-28/afp-29 | 둘 중 누구든 |
| t10 | goodbye | afp-32 | afp-33 | 둘 중 누구든 |

## 나들이: hula_show

작성자: GPT2-G3-parade-hula (2026-10-11)
장소: kapiolani_park
세션: 143
목표 등급: B1
할 일: cd-hsh-1 / I can describe my reaction to a hula show, ask for an explanation, and check my understanding. / 훌라 공연을 보고 느낀 점을 말하고 설명을 요청하며 이해한 내용을 확인할 수 있다.
허용 이름: hula (하와이어 춤 이름으로만 사용한다. 특정 형식·동작·의례의 이름이나 뜻은 설명하지 않는다.)
갈래: hsh-05>hsh-07, hsh-06>hsh-08, hsh-14>hsh-16, hsh-15>hsh-17, hsh-19>hsh-21, hsh-20>hsh-22, hsh-23>hsh-25, hsh-24>hsh-26, hsh-27>hsh-29, hsh-28>hsh-30, hsh-35>hsh-37, hsh-36>hsh-38

상황: hula_show에서 두 사람이 공연을 보고 감상을 나눈 뒤 가상의 행사 직원과 안내자에게 노래 설명을 요청한다. 좌석·탁자·안내자의 위치, 안내 프로그램의 존재, 공연 종료 시점과 직원의 도움 제안은 모두 가상 장면 값이다. 실제 공원의 공연 일정·촬영 정책·관람 규칙·배치를 주장하지 않는다. reaction 장면은 공연 감상 뒤이고 question 장면에서 직원이 공연 종료를 알린다. 안내자는 그 노래를 모른다고 정직하게 말하며, 두 사람은 설명을 아직 듣지 못했다는 점과 누구에게 다시 물을지 확인한다. help 장면에서 설명할 사람을 찾거나 프로그램을 읽을 방법을 요청하고 끝낸다. 신화·가사 내용·곡의 뜻·특정 춤 동작·의례·역사를 대사로 생성하지 않는다.

표기와 근거 범위: hula는 이 철자를 유지하고 하와이어 춤 이름의 뜻으로만 쓴다. culture.md 2.1의 훌라 공연 구분과 다른 폴리네시아 춤을 훌라라고 부르지 않는 기준을 따른다. 대사는 개인 감상과 안내 요청이며 실제 문화 설명이 아니다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| hsh-01 | arrival | npc | Host | Hi! Are you here for the hula show? | B1 | 방문 목적 묻기 | A | - | - |
| hsh-02 | arrival | option | 두 사람 | Yes. We'd like to watch. | B1 | 방문 목적 대답 | A | - | - |
| hsh-03 | arrival | option | 두 사람 | We don't know where to sit. | B1 | 자리 정보 부족 알리기 | A | - | - |
| hsh-04 | seats | npc | Host | You can sit here or on the other side. | B1 | 자리 안내 | A | - | - |
| hsh-05 | seats | option | 두 사람 | We'd like to sit here, please. | B1 | 자리 선택 | A | - | - |
| hsh-06 | seats | option | 두 사람 | Could you show us the other seats? | B1 | 위치 안내 요청 | A | - | - |
| hsh-07 | seats | npc | Host | These two seats are free. | B1 | 자리 사용 가능 안내 | A | - | - |
| hsh-08 | seats | npc | Host | The other seats are by that table. | B1 | 다른 자리 위치 안내 | A | - | - |
| hsh-09 | reaction | option | A자리 | I liked that song, {B}. | B1 | 개인 감상 말하기 | A | - | - |
| hsh-10 | reaction | option | A자리 | Did you understand the words of that song, {B}? | B1 | 동행의 이해 묻기 | A | - | - |
| hsh-11 | reaction | option | B자리 | I'm not sure what it means. | B1 | 지식 부족 말하기 | A | - | - |
| hsh-12 | reaction | option | B자리 | I don't understand it yet. I'd like to learn more. | B1 | 더 알고 싶은 뜻 말하기 | A | - | - |
| hsh-13 | question | npc | Host | The show is over. Do you have a question? | B1 | 종료 알림 질문 권유 | A | - | - |
| hsh-14 | question | option | A자리 | Could we ask about the song? | B1 | 질문 허락 요청 | A | - | - |
| hsh-15 | question | option | A자리 | We want to understand what the song means. | B1 | 설명이 필요한 목적 말하기 | A | - | - |
| hsh-16 | question | npc | Host | Yes. You can ask the guide over there. | B1 | 질문할 사람 안내 | B | 실제 훌라 공연에서 별도 안내자에게 연결하는 역할 배치는 확인하지 않았다. | - |
| hsh-17 | question | npc | Host | The guide is here. You can ask about it. | B1 | 설명 요청할 사람 안내 | B | 실제 훌라 공연에서 이 역할의 안내자가 질문을 받는지는 확인하지 않았다. | - |
| hsh-18 | explanation | npc | Guide | What would you like to know? | B1 | 질문 받기 | A | - | - |
| hsh-19 | explanation | option | A자리 | Could you explain what that song means? | B1 | 설명 요청 | A | - | - |
| hsh-20 | explanation | option | A자리 | I don't know what that song means. | B1 | 자신의 지식 부족 알리기 | A | - | - |
| hsh-21 | explanation | npc | Guide | I don't know that song. The host can help you ask someone. | B1 | 지식 한계 알리기 연결 제안 | B | 문화 지식이 없는 가상 안내자의 연결 제안이며 실제 행사 대응은 검증하지 않았다. | - |
| hsh-22 | explanation | npc | Guide | I don't know either. The host can help you ask someone. | B1 | 지식 한계 인정 연결 제안 | B | 노래 뜻을 모른다고 답하는 안내자의 화용과 역할은 실제 공연에서 검증하지 않았다. | - |
| hsh-23 | repair | option | A자리 | So the host can help us ask someone? | B1 | 안내 내용 이해 확인 | A | - | - |
| hsh-24 | repair | option | A자리 | Could you repeat that last part, please? | B1 | 일부 반복 요청 | A | - | - |
| hsh-25 | repair | npc | Guide | Yes. The host can help you find someone to ask. | B1 | 연결 방법 확인 | A | - | - |
| hsh-26 | repair | npc | Guide | The host can help you find someone to ask. | B1 | 연결 방법 다시 말하기 | A | - | - |
| hsh-27 | understanding | option | B자리 | We don't have an explanation yet, right? | B1 | 설명을 못 들은 상태 확인 | A | - | - |
| hsh-28 | understanding | option | B자리 | I understand. We'll ask the host. | B1 | 다음 행동 선택 | A | - | - |
| hsh-29 | understanding | npc | Guide | That's right. I haven't explained the song. | B1 | 설명하지 않은 상태 확인 | B | 안내자가 자신의 설명 한계를 이렇게 확인하는 화용은 사람 검증이 필요하다. | - |
| hsh-30 | understanding | npc | Guide | Okay. The host is by that table. | B1 | 선택 받기 위치 안내 | A | - | - |
| hsh-31 | feelings | wait | A자리 | How did the show make you feel, {B}? | B1 | 동행의 느낀 점 묻기 | A | - | - |
| hsh-32 | feelings | option | B자리 | I felt calm listening to the music. | B1 | 개인 느낌 말하기 | A | - | - |
| hsh-33 | feelings | option | B자리 | I enjoyed it, but I want to understand the words. | B1 | 감상과 남은 질문 말하기 | A | - | - |
| hsh-34 | help | npc | Host | How can I help you? | B1 | 도움 요청 받기 | A | - | - |
| hsh-35 | help | option | 두 사람 | We'd like help finding someone who can explain the song. | B1 | 설명할 사람 찾기 요청 | A | - | - |
| hsh-36 | help | option | 두 사람 | Is there a program we can read? | B1 | 읽을 자료 유무 질문 | B | 공연 인쇄 안내물을 program으로 묻는 연어와 현장 쓰임은 확인하지 않았다. | - |
| hsh-37 | help | npc | Host | I'll ask who is available to speak with you. | B1 | 연결을 알아보겠다고 말하기 | B | 실제 행사 직원이 설명할 사람의 대화 가능 여부를 확인하는 대응은 검증하지 않았다. | - |
| hsh-38 | help | npc | Host | Yes. It's on this table. You can read it here. | B1 | 자료 유무와 위치 안내 | A | - | - |
| hsh-39 | goodbye | npc | Host | Thanks for coming. | B1 | 방문 감사 | A | - | - |
| hsh-40 | goodbye | wait | 두 사람 | Thank you for your help. | B1 | 도움 감사 | A | - | - |

### 연습할 말

두 사람이 차례로 듣고 말한다. 감상·설명 요청·이해 확인·반복 요청을 실제 player 줄에 연결한다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| hsh-p1 | Could you show us the other seats? | 위치 안내 요청 | hsh-06 | - |
| hsh-p2 | Did you understand the words of that song, {B}? | 동행의 이해 묻기 | hsh-10 | - |
| hsh-p3 | I'm not sure what it means. | 지식 부족 말하기 | hsh-11 | - |
| hsh-p4 | Could you explain what that song means? | 설명 요청 | hsh-19 | - |
| hsh-p5 | So the host can help us ask someone? | 안내 내용 이해 확인 | hsh-23 | - |
| hsh-p6 | Could you repeat that last part, please? | 일부 반복 요청 | hsh-24 | - |
| hsh-p7 | We don't have an explanation yet, right? | 설명을 못 들은 상태 확인 | hsh-27 | - |
| hsh-p8 | How did the show make you feel, {B}? | 동행의 느낀 점 묻기 | hsh-31 | - |
| hsh-p9 | I felt calm listening to the music. | 개인 느낌 말하기 | hsh-32 | - |
| hsh-p10 | We'd like help finding someone who can explain the song. | 설명할 사람 찾기 요청 | hsh-35 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | arrival | hsh-01 | hsh-02/hsh-03 | 둘 중 누구든 |
| t2 | seats | hsh-04 | hsh-05/hsh-06 | 둘 중 누구든 |
| t3 | reaction | - | hsh-09/hsh-10 | A |
| t4 | reaction | - | hsh-11/hsh-12 | B |
| t5 | question | hsh-13 | hsh-14/hsh-15 | A |
| t6 | explanation | hsh-18 | hsh-19/hsh-20 | A |
| t7 | repair | - | hsh-23/hsh-24 | A |
| t8 | understanding | - | hsh-27/hsh-28 | B |
| t9 | feelings | - | hsh-31 | A |
| t10 | feelings | - | hsh-32/hsh-33 | B |
| t11 | help | hsh-34 | hsh-35/hsh-36 | 둘 중 누구든 |
| t12 | goodbye | hsh-39 | hsh-40 | 둘 중 누구든 |
