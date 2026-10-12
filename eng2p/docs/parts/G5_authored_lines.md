# G5 이후 B2 미션 대사

신뢰도: B (학습용 기능 대화예요. 줄마다 A/B를 적었으며 실제 미국 영어 화용·음성·PC 플레이는 미검증이에요.)
검증로그: 2026-10-11 / 합본 파생·대사·추가 상한 검사 / 해당 검사 통과 / 전체 실행의 실패와 환경 한계는 result_G5.zip의 report.md에 기록해요.

기존 authored_lines.md에 덧붙일 14개 장이에요. 첫 공개 18개와 해금 세션은 바꾸지 않아요. 수치·절차는 미션별 가상 장면 값이며 실제 장소의 정책·가격·안전 안내를 제공하지 않아요. 이후 공개 지시대로 모든 한국어 풀이 칸은 -예요. 연습 말은 본보기 데이터이며 음성 파일이나 필수 선행 이수를 구현한 것은 아니에요.

## 나들이: eggs_n_things_special_requests

작성자: gpt (2026-10-11)
장소: eggs_n_things_saratoga
세션: 203
목표 등급: B2
할 일: cd-esr-1 / I can ask about ingredients, make special requests, and politely ask for a replacement. / 성분을 확인하고 특별 요청을 전하며 잘못 나온 음식을 정중히 바꿔 달라고 할 수 있다.
허용 이름: -
갈래: esr-04 > esr-06, esr-05 > esr-07, esr-17 > esr-18, esr-20 > esr-22, esr-21 > esr-22, esr-23 > esr-24, esr-27 > esr-28, esr-31 > esr-32, esr-36 > esr-37

상황: 에그스 앤 띵스 사라토가를 배경으로 한 가상 아침 식사다. 달걀 요리에 우유를 쓰는 조리법, 조리 공간 공유, 요청을 전달하는 절차, 잘못 나온 치즈, 교체에 걸리는 열 분과 계산서 처리는 모두 학습용 장면값이다. 실제 메뉴·운영·알레르기 안전을 확인한 정보가 아니다. A자리만 우유 알레르기가 있으며 직원의 보증 불가 안내를 듣고 음식 주문을 하지 않고 물만 요청한다. B자리는 본인의 달걀과 토스트를 주문하고 치즈를 빼 달라고 한다. 소스 선택은 주문 기록에 남고 치즈 때문에 새 달걀을 만들 때에도 그 선택을 유지한다. t7 전에 B의 음식이 나오고 t10 전에 새 달걀이 나온 것으로 장면을 옮긴다. 두 접시를 모두 청구하지 않는 것은 가상 계산서 값이다. 마지막은 계산서 검토까지이며 결제가 자동으로 끝났다고 처리하지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| esr-01 | allergy | npc | Server | Do you have any food allergies or special requests? | B1 | 알레르기와 요청 묻기 | A | - | - |
| esr-02 | allergy | wait | A자리 | I have a milk allergy. Could you check the ingredients, please? | B1 | 알레르기 알리고 성분 확인 요청 | A | - | - |
| esr-03 | check | npc | Server | This egg dish contains milk. Milk is also used in this kitchen. | B1 | 성분과 조리 공간 안내 | B | 우유를 넣는 조리법과 조리 공간은 실제 매장 정보가 아니라 가상 장면값이다 | - |
| esr-04 | check | option | A자리 | Could you ask the cook about food without milk? | B1 | 조리 담당자 확인 요청 | A | - | - |
| esr-05 | check | option | A자리 | Before I decide, how do you cook the food? | B2 | 결정 전 조리 과정 묻기 | B | 알레르기 상황에서 조리 과정을 묻는 범위와 현지 화용은 사람 검수가 필요하다 | - |
| esr-06 | check | npc | Server | I'll ask the cook, but we use milk in this kitchen. | B1 | 확인 계획과 조리 제약 알리기 | B | 직원 확인 절차와 우유 사용은 실제 매장 정책이 아니라 가상 장면값이다 | - |
| esr-07 | check | npc | Server | Some food is cooked on the same cooking surface. | B1 | 조리 공간 공유 설명 | B | 같은 조리 면을 쓴다는 설명은 가상 장면값이며 안전 판정이 아니다 | - |
| esr-08 | decide | npc | Server | I can't promise there will be no milk in your food. | B2 | 안전 보증 불가 설명 | B | 직원의 확인 한계 표현이며 실제 알레르기 안전이나 무우유 조리를 보증하지 않는다 | - |
| esr-09 | decide | wait | A자리 | Then I won't order food. I'll just have water, please. | B1 | 이유에 따라 음식 주문하지 않기 | A | - | - |
| esr-10 | order | npc | Server | I'll bring your water. What would your friend like? | B1 | 물 요청 수락과 동행 주문 묻기 | A | - | - |
| esr-11 | order | option | B자리 | I'd like eggs and toast without cheese, please. | A2 | 음식 주문과 재료 제외 요청 | A | - | - |
| esr-12 | order | option | B자리 | For my eggs and toast, could you leave off the cheese? | B1 | 주문할 음식과 제외할 재료 명시 | A | - | - |
| esr-13 | sauce | npc | Server | For your order, should the sauce come on the side? | B1 | 소스 제공 방식 묻기 | B | 소스를 따로 내는 가능 여부와 on the side의 연어는 현장 검수가 필요하다 | - |
| esr-14 | sauce | option | B자리 | Yes, please. I'd like to add it myself. | B1 | 제공 방식 동의와 이유 말하기 | A | - | - |
| esr-15 | sauce | option | B자리 | No sauce, please. I prefer the eggs plain. | B1 | 소스 거절과 선호 설명 | A | - | - |
| esr-16 | record | npc | Server | I'll pass your request on to the kitchen. | B1 | 요청 전달 계획 알리기 | B | pass a request on의 연어와 실제 주방 전달 절차는 사람 검수가 필요하다 | - |
| esr-17 | review | wait | A자리 | Could you repeat both orders so we can check the details? | B1 | 두 사람 주문 확인 요청 | A | - | - |
| esr-18 | review | npc | Server | You ordered water. Your friend ordered eggs and toast without cheese. | B1 | 사람별 주문 요약 | B | 두 사람의 주문을 분리해 읽는 절차는 학습용 가상 장면값이다 | - |
| esr-19 | wrong | npc | Server | Here are your eggs and toast. Is everything as requested? | B1 | 음식 제공과 요청 확인 | B | 음식 제공 시점과 요청 확인 절차는 학습용 장면값이며 현지 화용은 미검증이다 | - |
| esr-20 | wrong | option | B자리 | I asked for no cheese, but there's cheese on these eggs. | B1 | 잘못 나온 재료 정중히 지적 | A | - | - |
| esr-21 | wrong | option | B자리 | Could you replace these eggs? They came with cheese. | B1 | 이유를 밝히고 교체 요청 | A | - | - |
| esr-22 | wrong | npc | Server | I'm sorry. I'll have the kitchen make a new plate. | B1 | 문제 인정과 교체 계획 | B | 새 접시를 만드는 직원 절차는 실제 매장 보상 정책이 아니라 가상 장면값이다 | - |
| esr-23 | replace | wait | B자리 | Could you make new eggs instead of just taking off the cheese? | B2 | 단순 제거 대신 새 조리 요청 | B | 제거와 새 조리의 차이를 협의하는 화용이며 실제 조리나 안전을 보증하지 않는다 | - |
| esr-24 | replace | npc | Server | Yes. I'll ask the cook to make fresh eggs without cheese. | B1 | 새 조리 요청 전달 계획 | B | 치즈 없는 새 달걀을 요청하는 가상 절차이며 실제 이행이나 알레르기 안전 보증이 아니다 | - |
| esr-25 | wait | npc | Server | The new plate will take about ten minutes. | B1 | 예상 대기 시간 안내 | B | 열 분은 실제 매장 대기 시간이 아니라 학습용 가상 장면값이다 | - |
| esr-26 | wait | option | B자리 | That's fine. Thank you for taking care of it. | A2 | 대기 수락과 감사 | B | take care of it의 문제 처리 연어와 난이도는 사람 검수가 필요하다 | - |
| esr-27 | wait | option | B자리 | Could you bring some water while I wait? | B1 | 대기 중 물 요청 | A | - | - |
| esr-28 | wait | npc | Server | I'll bring you some water. | A2 | 물 제공 계획 알리기 | B | 대기 중 물을 제공하는 절차는 실제 매장 운영이 아니라 가상 장면값이다 | - |
| esr-29 | new | npc | Server | Here are the new eggs. Please check your order. | B1 | 교체 음식 제공과 확인 부탁 | B | 교체 음식 제공 시점은 가상 장면값이며 실제 조리 완료를 보증하지 않는다 | - |
| esr-30 | new | option | B자리 | The eggs look right this time. Thank you. | A2 | 교체한 음식 확인과 감사 | A | - | - |
| esr-31 | new | option | B자리 | Could you bring a clean fork, please? | A2 | 새 식기 요청 | A | - | - |
| esr-32 | new | npc | Server | Of course. I'll bring a clean fork. | A2 | 식기 요청 수락 | A | - | - |
| esr-33 | check_bill | wait | A자리 | Could we have the check when you have a moment? | B1 | 직원 사정을 배려해 계산서 요청 | A | - | - |
| esr-34 | review_bill | npc | Server | Here is your check. Please review the items. | B1 | 계산서 건네며 검토 부탁 | A | - | - |
| esr-35 | review_bill | option | B자리 | The items look right. Thank you for checking. | B1 | 계산 내역 확인과 감사 | A | - | - |
| esr-36 | review_bill | option | B자리 | Is the first plate included on this check? | B1 | 교체 전 음식 청구 여부 묻기 | A | - | - |
| esr-37 | review_bill | npc | Server | Only the new plate is on the check. | B1 | 교체 음식 청구 범위 설명 | B | 새 접시만 청구하는 것은 실제 매장 보상 정책이 아니라 가상 계산서 값이다 | - |

### 연습할 말

두 사람이 번갈아 연습하는 본보기 데이터다. 본문 줄을 그대로 연결하며 실제 소리 재생과 발화 전 필수 이수를 이 표로 보장하지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| esr-p1 | I have a milk allergy. Could you check the ingredients, please? | 알레르기 알리고 성분 확인 요청 | esr-02 | - |
| esr-p2 | Could you ask the cook about food without milk? | 조리 담당자 확인 요청 | esr-04 | - |
| esr-p3 | Before I decide, how do you cook the food? | 결정 전 조리 과정 묻기 | esr-05 | - |
| esr-p4 | Then I won't order food. I'll just have water, please. | 이유에 따라 음식 주문하지 않기 | esr-09 | - |
| esr-p5 | I'd like eggs and toast without cheese, please. | 음식 주문과 재료 제외 요청 | esr-11 | - |
| esr-p6 | No sauce, please. I prefer the eggs plain. | 소스 거절과 선호 설명 | esr-15 | - |
| esr-p7 | Could you repeat both orders so we can check the details? | 두 사람 주문 확인 요청 | esr-17 | - |
| esr-p8 | I asked for no cheese, but there's cheese on these eggs. | 잘못 나온 재료 정중히 지적 | esr-20 | - |
| esr-p9 | Could you replace these eggs? They came with cheese. | 이유를 밝히고 교체 요청 | esr-21 | - |
| esr-p10 | Could you make new eggs instead of just taking off the cheese? | 단순 제거 대신 새 조리 요청 | esr-23 | - |
| esr-p11 | Could you bring some water while I wait? | 대기 중 물 요청 | esr-27 | - |
| esr-p12 | Could we have the check when you have a moment? | 직원 사정을 배려해 계산서 요청 | esr-33 | - |
| esr-p13 | Is the first plate included on this check? | 교체 전 음식 청구 여부 묻기 | esr-36 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | allergy | esr-01 | esr-02 | A |
| t2 | check | esr-03 | esr-04/esr-05 | A |
| t3 | decide | esr-08 | esr-09 | A |
| t4 | order | esr-10 | esr-11/esr-12 | B |
| t5 | sauce | esr-13 | esr-14/esr-15 | B |
| n1 | record | esr-16 | - | - |
| t6 | review | - | esr-17 | A |
| t7 | wrong | esr-19 | esr-20/esr-21 | B |
| t8 | replace | - | esr-23 | B |
| t9 | wait | esr-25 | esr-26/esr-27 | B |
| t10 | new | esr-29 | esr-30/esr-31 | B |
| t11 | check_bill | - | esr-33 | A |
| t12 | review_bill | esr-34 | esr-35/esr-36 | B |

## 나들이: polynesian_cultural_center

작성자: gpt (2026-10-11)
장소: polynesian_cultural_center
세션: 209
목표 등급: B2
할 일: cd-pcc-1 / I can plan a visit, compare activities, and check my understanding of a show introduction. / 방문 일정을 짜고 활동을 비교하며 공연 진행 설명을 이해했는지 확인할 수 있다.
허용 이름: -
갈래: pcc-05 > pcc-07, pcc-06 > pcc-08, pcc-13 > pcc-15, pcc-14 > pcc-16, pcc-17 > pcc-19, pcc-18 > pcc-19, pcc-21 > pcc-23, pcc-22 > pcc-24, pcc-29 > pcc-30, pcc-33 > pcc-34, pcc-38 > pcc-39

상황: 폴리네시안 문화 센터를 배경으로 두 사람이 가상 안내자와 방문 계획을 상의한다. 짧은 안내 설명, 그림을 쓰는 방식, 뒤의 공연, 시간 간격, 인사와 음악과 질문의 순서, 휴식 자리와 안내표 위치는 모두 이 미션의 가상 진행안이다. 실제 시간표, 표 값, 좌석, 촬영 규칙, 문화적 의미, 역사, 노래 뜻이나 의례는 정하지 않는다.

안내 설명이 끝나기 전에 공연을 이해했다고 말하지 않는다. t2의 두 갈래는 각각 활동의 차이와 두 활동을 볼 시간에 답하며, t3부터는 두 사람이 짧은 설명을 먼저 듣기로 상의한다. t5의 어느 선택에도 인사 다음 음악, 마지막 질문이라는 가상 순서를 알려 주므로 t6의 확인이 가능하다. t8 뒤 안내 설명이 끝나고 t9에서 다음 계획을 말한다. t10은 종료 안내를 들은 뒤다. t10 뒤 두 사람이 선택한 대로 안내표를 확인하거나 잠시 쉬고 안내표를 확인한 다음 t11로 간다. 공연 관람이나 이동을 자동으로 완료했다고 세지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| pcc-01 | welcome | npc | Guide | What would you like to see today? | A2 | 방문 목적 묻기 | A | - | - |
| pcc-02 | welcome | option | A자리 | We'd like an introduction before we watch the show. | B1 | 방문 목적 말하기 | B | introduction의 공연 안내 뜻과 줄의 난이도 경계는 사람 검수가 필요하다 | - |
| pcc-03 | welcome | option | A자리 | Could you help us plan the afternoon without rushing? | B2 | 일정 도움 요청 | A | - | - |
| pcc-04 | compare | npc | Guide | The talk uses pictures. The show has music and starts thirty minutes later. | B2 | 활동 차이와 시간 안내 | B | 그림 설명과 공연의 시간 간격은 실제 운영 정보가 아니라 가상 진행안이다 | - |
| pcc-05 | compare | option | B자리 | How does the talk differ from the show? | B2 | 활동 비교 질문 | B | differ from의 비교 기능과 난이도는 낱말 검사만으로 검증되지 않는다 | - |
| pcc-06 | compare | option | B자리 | Would there be enough time to attend both? | B2 | 일정 가능성 확인 | A | - | - |
| pcc-07 | compare | npc | Guide | The talk explains the program, while the show lets you watch and listen. | B2 | 활동 비교 설명 | B | 두 활동의 설명 방식과 구성은 실제 프로그램을 확인한 사실이 아니라 가상 진행안이다 | - |
| pcc-08 | compare | npc | Guide | Yes. There's a short break after the talk, so you can attend both. | B2 | 일정 가능성 안내 | B | 짧은 휴식과 두 활동의 관람 가능성은 이 미션에만 둔 가상 일정이다 | - |
| pcc-09 | plan | wait | A자리 | I'd prefer the talk first, but how does that sound to you, {B}? | B2 | 선호와 상대 의견 묻기 | A | - | - |
| pcc-10 | plan | option | B자리 | That suits me because I'd like some background before the show. | B2 | 동의와 이유 | B | suits me와 background의 관람 맥락 연어는 사람 검수가 필요하다 | - |
| pcc-11 | plan | option | B자리 | I prefer music, but let's try the talk before we decide about the show. | B2 | 다른 선호와 절충 | A | - | - |
| pcc-12 | introduction | npc | Guide | Before we begin, would you like me to explain the order? | B1 | 설명 필요 묻기 | A | - | - |
| pcc-13 | introduction | option | A자리 | Yes, please. Could you explain the order before we decide? | B2 | 결정 전 순서 설명 요청 | A | - | - |
| pcc-14 | introduction | option | A자리 | May I ask questions after your explanation? | B1 | 질문 시점 허락 요청 | A | - | - |
| pcc-15 | introduction | npc | Guide | First, the host welcomes everyone. Music follows, and questions come at the end. | B2 | 가상 공연 순서 설명 | B | 인사와 음악과 질문의 순서는 실제 공연 설명이 아니라 가상 진행안이다 | - |
| pcc-16 | introduction | npc | Guide | Yes. First, the host welcomes everyone; then music follows. Questions come at the end. | B2 | 허락과 가상 순서 설명 | B | 질문 허락과 인사와 음악의 순서는 이 미션의 가상 진행안이다 | - |
| pcc-17 | understanding | option | B자리 | So the welcome comes before the music, and we ask questions afterward. Is that right? | B2 | 설명 요약과 확인 | A | - | - |
| pcc-18 | understanding | option | B자리 | When you say questions come last, do you mean after the music? | B2 | 설명 범위 되묻기 | A | - | - |
| pcc-19 | understanding | npc | Guide | Yes. The questions come after the music. | A2 | 이해 확인 대답 | B | 질문의 시점은 실제 행사 관습이 아니라 앞서 설명한 가상 순서다 | - |
| pcc-20 | question | npc | Guide | Do you have any questions about that order? | A2 | 추가 질문 초대 | A | - | - |
| pcc-21 | question | option | A자리 | Why do the questions come at the end rather than between parts? | B2 | 진행 이유 질문 | A | - | - |
| pcc-22 | question | option | A자리 | Could you give us an example of a question we could ask? | B2 | 질문 예시 요청 | A | - | - |
| pcc-23 | question | npc | Guide | It helps us finish each part before discussing it. | B1 | 진행 이유 설명 | B | 순서를 정한 이유는 실제 공연자의 의도가 아니라 가상 안내자의 설명이다 | - |
| pcc-24 | question | npc | Guide | You might ask why the host uses this order. | B1 | 질문 예시 제안 | A | - | - |
| pcc-25 | reflection | option | B자리 | I like having time for questions because we can check our understanding. | B2 | 의견과 이유 | A | - | - |
| pcc-26 | reflection | option | B자리 | We could write down our questions while we listen. | B2 | 듣기 방법 제안 | A | - | - |
| pcc-27 | next | npc | Guide | What will you do after the talk? | A2 | 다음 계획 묻기 | A | - | - |
| pcc-28 | next | option | A자리 | We'll check the time before deciding whether to watch the show. | B2 | 조건을 둔 다음 계획 | A | - | - |
| pcc-29 | next | option | A자리 | Where could we take a break while we decide? | B2 | 휴식 장소 질문 | A | - | - |
| pcc-30 | next | npc | Guide | You can use the seats beside this table while you decide. | B1 | 휴식 장소 안내 | B | 탁자 옆 휴식 자리는 실제 시설 위치가 아니라 가상 장면값이다 | - |
| pcc-31 | end_talk | npc | Guide | The talk is over. The show has not started yet. | A2 | 종료와 현재 진행 상태 안내 | B | 안내 설명 종료와 공연 시작 전이라는 상태는 이 미션의 가상 진행 시점이다 | - |
| pcc-32 | end_talk | option | B자리 | Let's check the schedule together before we choose our next stop. | B2 | 다음 결정 전 확인 제안 | A | - | - |
| pcc-33 | end_talk | option | B자리 | I'd like a short break first, since we've already heard the introduction. | B2 | 휴식 요청과 이유 | A | - | - |
| pcc-34 | end_talk | npc | Guide | That's fine. Come back when you're ready to check the schedule. | B1 | 휴식 뒤 안내 제안 | B | 휴식 뒤 돌아와 일정표를 확인하는 진행은 이 미션의 가상 안내다 | - |
| pcc-35 | review | wait | A자리 | Let's compare the next options before we make a final decision. | B2 | 최종 결정 전 비교 제안 | A | - | - |
| pcc-36 | review | npc | Guide | Will you need help with the next part of your visit? | B1 | 다음 계획 도움 제안 | A | - | - |
| pcc-37 | review | option | B자리 | We'll discuss the options together and ask if we need help. | B2 | 공동 결정과 추가 도움 계획 | A | - | - |
| pcc-38 | review | option | B자리 | Could you show us where the next talk is listed? | B1 | 일정표 정보 위치 요청 | A | - | - |
| pcc-39 | review | npc | Guide | The next talk is on this page, below the show. | B1 | 일정표 정보 위치 안내 | B | 일정표의 쪽과 항목 배치는 실제 자료가 아니라 가상 안내표 내용이다 | - |

### 연습할 말

두 사람이 번갈아 연습할 말의 데이터 본보기다. 본문 줄과 같은 말이며 필수 선행 이수나 실제 음성 재생은 이 파일이 보장하지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| pcc-p1 | Could you help us plan the afternoon without rushing? | 일정 도움 요청 | pcc-03 | - |
| pcc-p2 | How does the talk differ from the show? | 활동 비교 질문 | pcc-05 | - |
| pcc-p3 | Would there be enough time to attend both? | 일정 가능성 확인 | pcc-06 | - |
| pcc-p4 | I'd prefer the talk first, but how does that sound to you, {B}? | 선호와 상대 의견 묻기 | pcc-09 | - |
| pcc-p5 | I prefer music, but let's try the talk before we decide about the show. | 다른 선호와 절충 | pcc-11 | - |
| pcc-p6 | Yes, please. Could you explain the order before we decide? | 결정 전 순서 설명 요청 | pcc-13 | - |
| pcc-p7 | So the welcome comes before the music, and we ask questions afterward. Is that right? | 설명 요약과 확인 | pcc-17 | - |
| pcc-p8 | Why do the questions come at the end rather than between parts? | 진행 이유 질문 | pcc-21 | - |
| pcc-p9 | We could write down our questions while we listen. | 듣기 방법 제안 | pcc-26 | - |
| pcc-p10 | We'll check the time before deciding whether to watch the show. | 조건을 둔 다음 계획 | pcc-28 | - |
| pcc-p11 | I'd like a short break first, since we've already heard the introduction. | 휴식 요청과 이유 | pcc-33 | - |
| pcc-p12 | Let's compare the next options before we make a final decision. | 최종 결정 전 비교 제안 | pcc-35 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | welcome | pcc-01 | pcc-02/pcc-03 | A |
| t2 | compare | pcc-04 | pcc-05/pcc-06 | B |
| t3 | plan | - | pcc-09 | A |
| t4 | plan | - | pcc-10/pcc-11 | B |
| t5 | introduction | pcc-12 | pcc-13/pcc-14 | A |
| t6 | understanding | - | pcc-17/pcc-18 | B |
| t7 | question | pcc-20 | pcc-21/pcc-22 | A |
| t8 | reflection | - | pcc-25/pcc-26 | B |
| t9 | next | pcc-27 | pcc-28/pcc-29 | A |
| t10 | end_talk | pcc-31 | pcc-32/pcc-33 | B |
| t11 | review | - | pcc-35 | A |
| t12 | review | pcc-36 | pcc-37/pcc-38 | B |

## 나들이: airport_rental_car

작성자: gpt (2026-10-11)
장소: -
세션: 215
목표 등급: B2
할 일: cd-acr-1 / I can check a car booking, compare insurance choices, and confirm return terms. / 상황의 조건과 정보를 함께 확인할 수 있다.
허용 이름: -
갈래: acr-03 > acr-04, acr-17 > acr-20, acr-18 > acr-19, acr-23 > acr-24

상황: 제안 장소 id는 new:honolulu_airport이며 원본에 등록되지 않아 장소 메타는 -다. 공항 차량 인수 창구의 가상 장면이며 보험 상품, 서류 요건, 화면 요금 항목, 서명과 반납 절차는 학습용 값이다. 실제 법이나 업체 정책을 설명하지 않으며 금액, 반납 장소와 시각을 새로 정하지 않고 표시된 자료를 확인한다.

A자리가 예약 명의자이며 유일한 운전자다. A가 자기 면허증, 사진 신분증, 신용카드를 제출하고 B는 동행자로서 두 사람의 요금과 조건을 확인한다. 서면 조건과 가격을 실제로 읽고 필요하면 직원 설명을 들은 뒤에만 보험 선택 차례로 넘어가며, 이 확인 과정의 시간은 생략하지 않는다. 보험 추가 후보는 두 사람이 검토 자료에 표시한 한 가지 옵션을 가리키며 모든 옵션의 자동 추가가 아니다. 마지막에 진행을 택해도 실제 서명, 결제, 차량 인수의 자동 완료는 보장하지 않고, 유보를 택하면 서명 전 대화에서 끝난다. 37주 전 연속성 관문을 지키려고 영어 줄은 car booking과 pickup으로 기능을 유지하며 일반 낱말을 허용 이름으로 면제하지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| acr-01 | booking | npc | Clerk | Can I have the booking name and confirmation number? | B2 | 예약 정보 요청 | B | 공항 차량 인수의 접수 표현과 서류 절차는 실제 업체별 확인이 필요하다 | - |
| acr-02 | booking | option | A자리 | The booking is under {A}; here's the confirmation number. | B2 | 예약 정보 제공 | A | - | - |
| acr-03 | booking | option | A자리 | Could you check the booking using my name first? | B2 | 조회 방식 요청 | A | - | - |
| acr-04 | booking | npc | Clerk | Sure. I can look it up under {A}. | B2 | 이름으로 조회 수락 | B | 이름만으로 조회하는 방식은 실제 업체 정책이 아니라 가상 장면의 절차다 | - |
| acr-05 | driver | npc | Clerk | Who will be driving? | B2 | 운전자 확인 | A | - | - |
| acr-06 | driver | option | A자리 | I'll be the only driver; {B} is traveling with me. | B2 | 운전자와 동행자 구분 | A | - | - |
| acr-07 | driver | option | A자리 | I'm the driver. Which documents do you need from me? | B2 | 운전자 밝히고 서류 요청 | A | - | - |
| acr-08 | documents | npc | Clerk | I need your license, photo ID, and credit card. | B2 | 필요 서류 안내 | B | 필요한 서류 세 가지는 실제 업체 요건이 아니라 가상 장면의 값이다 | - |
| acr-09 | documents | option | A자리 | Here are my documents; please tell me if anything is missing. | B2 | 서류 제출과 누락 확인 | A | - | - |
| acr-10 | documents | option | A자리 | Here are my documents. Do you need anything else from me? | B2 | 서류 제출과 추가 요구 확인 | A | - | - |
| acr-11 | documents | npc | Clerk | Thanks. I have the documents I need for this booking. | B2 | 서류 수령 확인 | B | 서류 수령만 뜻하며 실제 자격이나 결제 가능성을 판정한 정보는 아니다 | - |
| acr-12 | insurance | npc | Clerk | Would you like to hear the optional insurance choices? | B2 | 보험 설명 제안 | B | 선택 보험이라는 구분과 제안 방식은 실제 상품 정보가 아니라 가상 장면값이다 | - |
| acr-13 | insurance | option | B자리 | Yes. Please explain what each option covers before we decide. | B2 | 보험 범위 설명 요청 | B | 보험 보장 범위를 묻는 covers의 연어와 현장 화용은 사람 검수가 필요하다 | - |
| acr-14 | insurance | option | B자리 | Can we see the price and conditions in writing first? | B2 | 서면 조건 요청 | A | - | - |
| acr-15 | insurance | npc | Clerk | I'll show you the insurance terms and price before you decide. | B2 | 서면 조건 제시 | B | 선택 보험의 조건과 가격을 보여 주는 순서는 가상 장면의 절차다 | - |
| acr-16 | charges | npc | Clerk | The screen shows the booking charge and taxes. | B2 | 요금 항목 안내 | B | 화면 요금 항목과 세금 구분은 실제 업체 요금표가 아니라 가상 장면값이다 | - |
| acr-17 | charges | option | B자리 | Which amount would we pay if we decline the optional insurance? | B2 | 보험 거절 시 합계 확인 | B | 선택 보험을 거절하는 표현과 요금 확인의 현장 화용은 사람 검수가 필요하다 | - |
| acr-18 | charges | option | B자리 | Why is the total higher than the booking charge? | B2 | 기본 요금과 합계 비교 | A | - | - |
| acr-19 | charges | npc | Clerk | You pay the booking charge, taxes, and any insurance you choose. | B2 | 합계 구성 설명 | B | 요금 계산 구성은 실제 업체의 모든 비용을 설명하는 정보가 아니라 가상 장면값이다 | - |
| acr-20 | charges | npc | Clerk | If you decline insurance, you pay only the booking charge and taxes. | B2 | 보험 제외 금액 구성 | B | 보험 제외 시 요금 구성은 실제 업체 계약 정보가 아니라 가상 장면값이다 | - |
| acr-21 | review | npc | Clerk | Please review the written terms before making an insurance choice. | B2 | 보험 조건 검토 요청 | B | 보험 선택 전 서면 검토를 요청하는 순서는 가상 장면의 절차다 | - |
| acr-22 | review | option | A자리 | I'd like to read these terms before choosing any optional insurance. | B2 | 검토 시간 확보 | A | - | - |
| acr-23 | review | option | A자리 | Could you explain which costs these options don't cover? | B2 | 보험 제외 범위 질문 | A | - | - |
| acr-24 | review | npc | Clerk | The exclusions are listed here; I can go through them with you. | B2 | 제외 범위 함께 확인 | B | exclusions는 보험 문서의 전문 낱말이며 실제 보장 제외 내용을 새로 정하지 않았다 | - |
| acr-25 | choice | option | A자리 | I've read the terms. I'll decline the insurance. | B2 | 선택 보험 거절 | B | 보험 거절의 현장 화용과 decline의 등급은 사람 검수가 필요하다 | - |
| acr-26 | choice | option | A자리 | Please add the insurance option marked here to this booking. | B2 | 표시된 선택 보험 요청 | B | 구체 상품을 새로 정하지 않고 가상 화면의 조건과 가격을 선택하는 말이다 | - |
| acr-27 | total | npc | Clerk | The screen now shows the total for your choice. Please review it. | B2 | 선택 결과 합계 검토 | B | 보험 선택에 따라 바뀐 화면 합계는 가상 장면값이며 고정 금액을 지어내지 않았다 | - |
| acr-28 | total | option | B자리 | This total matches our choice. Could we have a copy before signing? | B2 | 합계 확인과 사본 요청 | B | matches our choice와 서명 전 사본 요청의 현장 화용은 사람 검수가 필요하다 | - |
| acr-29 | total | option | B자리 | Could you go through this total before we sign anything? | B2 | 서명 전 요금 재설명 요청 | A | - | - |
| acr-30 | total | npc | Clerk | I'll give you a written copy and explain any charges you ask about. | B2 | 사본과 요금 설명 수락 | B | 서면 사본 제공과 요금 설명은 실제 업체 보장이 아니라 가상 장면의 절차다 | - |
| acr-31 | return | npc | Clerk | Before you sign, what would you like to check about returning the car? | B2 | 서명 전 반납 질문 받기 | A | - | - |
| acr-32 | return | option | A자리 | Where should we return the car, and when is it due? | B2 | 반납 장소와 시각 확인 | A | - | - |
| acr-33 | return | option | A자리 | What happens to the charge if we return the car after the agreed time? | B2 | 늦은 반납 요금 질문 | A | - | - |
| acr-34 | return | npc | Clerk | The return place, due time, and late charges are on this sheet. | B2 | 서면 반납 조건 안내 | B | 반납 조건을 적은 가상 서류를 가리키며 실제 장소나 시각이나 요금은 정하지 않았다 | - |
| acr-35 | details | option | B자리 | Could you mark the return place and due time on our copy? | B2 | 서류에 조건 표시 요청 | A | - | - |
| acr-36 | details | option | B자리 | Please explain the late charges before we agree to the booking. | B2 | 동의 전 추가 요금 설명 요청 | A | - | - |
| acr-37 | details | npc | Clerk | I'll mark those details and review the late charges with you. | B2 | 조건 표시와 요금 재확인 | B | 서류에 표시하고 늦은 반납 요금을 검토하는 절차는 가상 장면값이다 | - |
| acr-38 | finish | npc | Clerk | Once you've reviewed everything, please tell me whether you're ready to sign. | B2 | 검토 후 서명 의사 확인 | A | - | - |
| acr-39 | finish | option | A자리 | We've reviewed the terms. We'd like to sign and continue with pickup. | B2 | 검토 후 진행 의사 | B | 차량 인수의 pickup 연어와 서명 진행 의사의 현장 화용은 사람 검수가 필요하다 | - |
| acr-40 | finish | option | A자리 | We need more time to discuss the terms before signing. | B2 | 서명 유보 | A | - | - |

### 연습할 말

두 사람이 번갈아 연습할 데이터 본보기다. 본문 줄을 그대로 연결하며 실제 음성과 발화 전 필수 이수는 이 파일로 보장하지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| acr-p1 | Could you check the booking using my name first? | 조회 방식 요청 | acr-03 | - |
| acr-p2 | I'm the driver. Which documents do you need from me? | 운전자 밝히고 서류 요청 | acr-07 | - |
| acr-p3 | Yes. Please explain what each option covers before we decide. | 보험 범위 설명 요청 | acr-13 | - |
| acr-p4 | Can we see the price and conditions in writing first? | 서면 조건 요청 | acr-14 | - |
| acr-p5 | Which amount would we pay if we decline the optional insurance? | 보험 거절 시 합계 확인 | acr-17 | - |
| acr-p6 | Why is the total higher than the booking charge? | 기본 요금과 합계 비교 | acr-18 | - |
| acr-p7 | I'd like to read these terms before choosing any optional insurance. | 검토 시간 확보 | acr-22 | - |
| acr-p8 | Could you explain which costs these options don't cover? | 보험 제외 범위 질문 | acr-23 | - |
| acr-p9 | I've read the terms. I'll decline the insurance. | 선택 보험 거절 | acr-25 | - |
| acr-p10 | Please add the insurance option marked here to this booking. | 표시된 선택 보험 요청 | acr-26 | - |
| acr-p11 | Could you go through this total before we sign anything? | 서명 전 요금 재설명 요청 | acr-29 | - |
| acr-p12 | Where should we return the car, and when is it due? | 반납 장소와 시각 확인 | acr-32 | - |
| acr-p13 | What happens to the charge if we return the car after the agreed time? | 늦은 반납 요금 질문 | acr-33 | - |
| acr-p14 | Could you mark the return place and due time on our copy? | 서류에 조건 표시 요청 | acr-35 | - |
| acr-p15 | Please explain the late charges before we agree to the booking. | 동의 전 추가 요금 설명 요청 | acr-36 | - |
| acr-p16 | We've reviewed the terms. We'd like to sign and continue with pickup. | 검토 후 진행 의사 | acr-39 | - |
| acr-p17 | We need more time to discuss the terms before signing. | 서명 유보 | acr-40 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | booking | acr-01 | acr-02/acr-03 | A |
| t2 | driver | acr-05 | acr-06/acr-07 | A |
| t3 | documents | acr-08 | acr-09/acr-10 | A |
| n1 | documents | acr-11 | - | - |
| t4 | insurance | acr-12 | acr-13/acr-14 | B |
| n2 | insurance | acr-15 | - | - |
| t5 | charges | acr-16 | acr-17/acr-18 | B |
| t6 | review | acr-21 | acr-22/acr-23 | A |
| t7 | choice | - | acr-25/acr-26 | A |
| t8 | total | acr-27 | acr-28/acr-29 | B |
| n3 | total | acr-30 | - | - |
| t9 | return | acr-31 | acr-32/acr-33 | A |
| n4 | return | acr-34 | - | - |
| t10 | details | - | acr-35/acr-36 | B |
| n5 | details | acr-37 | - | - |
| t11 | finish | acr-38 | acr-39/acr-40 | A |

## 나들이: apartment_hunting

작성자: gpt (2026-10-11)
장소: -
세션: 221
목표 등급: B2
할 일: cd-aph-1 / I can compare apartment costs, ask about rules, and discuss terms before we decide. / 상황의 조건과 정보를 함께 확인할 수 있다.
허용 이름: -
갈래: aph-07 > aph-08, aph-39 > aph-40

상황: 제안 장소 id는 new:apartment_viewing이며 원본에 등록되지 않아 장소 메타는 -다. 이름 없는 가상 집을 함께 보며 월세 이천 달러, 별도 전기 요금, 수도 포함, 일 년 계약은 이 장면만의 값이다. 그 밖의 보증금, 납부일, 손님 규칙, 조용한 시간, 수리 책임은 값을 새로 정하지 않고 가상 서면 제안에서 확인한다. 실제 매물이나 법이나 임대 조건의 조언이 아니다.

A와 B는 함께 살 공간을 비교하는 사람이며 어느 쪽도 임대 계약을 마쳤다고 말하지 않는다. 방을 살피거나 창문과 책상 자리를 확인하는 차례에서는 요청한 확인 행동을 할 시간을 둔 뒤 비용 대화로 넘어간다. 두 사람이 비교할 다른 서면 제안도 가지고 있다는 가상 상황이며 그 집을 계약했다는 뜻은 아니다. 사본을 가져가 나중에 검토하는 선택 뒤에도 현재 방문 중 일반 질문을 계속할 수 있고, 마지막까지 입주와 서명은 완료하지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| aph-01 | start | npc | Clerk | Are you here to view the apartment together? | B2 | 방문 목적 확인 | A | - | - |
| aph-02 | start | option | A자리 | Yes. We'd like to compare the space and costs before making a decision. | B2 | 비교 목적 설명 | A | - | - |
| aph-03 | start | option | A자리 | Yes. Could you tell us what we'll see during the viewing? | B2 | 집 보기 순서 질문 | B | 집 보기를 viewing으로 말하는 연어와 등급은 사람 검수가 필요하다 | - |
| aph-04 | start | npc | Clerk | We'll look at the rooms, then go over the monthly costs and rules. | B2 | 방문 순서 안내 | B | 방을 본 뒤 비용과 규칙을 검토하는 순서는 가상 장면의 진행 안내다 | - |
| aph-05 | space | npc | Clerk | Here's the living room. What matters most to you? | B2 | 중요 조건 묻기 | A | - | - |
| aph-06 | space | option | B자리 | We need enough space for two people to work at home. | B2 | 공간 필요 설명 | A | - | - |
| aph-07 | space | option | B자리 | How much noise can we expect from the street? | B2 | 소음 조건 질문 | A | - | - |
| aph-08 | space | npc | Clerk | I can't judge the noise for you; we can listen with the windows open. | B2 | 소음 함께 확인 제안 | B | 소음을 보증하지 않고 창문을 열어 함께 듣는 제안은 가상 집 보기 절차다 | - |
| aph-09 | check | npc | Clerk | Take a look around, and tell me what you'd like to check. | B2 | 직접 확인할 점 묻기 | A | - | - |
| aph-10 | check | option | A자리 | Could we open the windows to see how much noise comes in? | B2 | 소음 직접 확인 요청 | A | - | - |
| aph-11 | check | option | A자리 | Could you show us where we'd put a desk? | B2 | 책상 배치 확인 요청 | A | - | - |
| aph-12 | check | npc | Clerk | Yes. We can check the windows and where a desk would fit. | B2 | 공간과 창문 확인 수락 | A | - | - |
| aph-13 | cost | option | B자리 | The space could work for us, but we'd like to understand the full monthly cost. | B2 | 가능성 평가와 비용 확인 | A | - | - |
| aph-14 | cost | option | B자리 | What is the monthly rent, and which bills would we pay separately? | B2 | 월세와 별도 요금 질문 | A | - | - |
| aph-15 | cost | npc | Clerk | Rent is two thousand dollars a month; you pay electricity separately. | B2 | 가상 월세와 별도 비용 안내 | B | 월세 이천 달러와 별도 전기 요금은 실제 매물이 아니라 이 가상 장면만의 값이다 | - |
| aph-16 | fees | npc | Clerk | Water is included. What else would you like to check about costs? | B2 | 포함 요금 안내와 질문 받기 | B | 수도 요금 포함은 실제 임대 조건이 아니라 가상 장면의 값이다 | - |
| aph-17 | fees | option | A자리 | Is there a deposit, and when would we need to pay it? | B2 | 보증금과 납부 시점 질문 | A | - | - |
| aph-18 | fees | option | A자리 | Would any other charges be due before we could move in? | B2 | 입주 전 추가 비용 질문 | A | - | - |
| aph-19 | fees | npc | Clerk | This offer lists all charges and when you need to pay. | B2 | 비용 서류 확인 안내 | B | 보증금과 납부일의 실제 값은 새로 정하지 않고 가상 서면 제안에서 확인한다 | - |
| aph-20 | copy | option | B자리 | Could you show us the offer so we can compare the costs? | B2 | 비용 비교 자료 요청 | A | - | - |
| aph-21 | copy | option | B자리 | Could we take a copy and review it together later? | B2 | 검토 유보와 사본 요청 | A | - | - |
| aph-22 | copy | npc | Clerk | Yes. You can take a copy; nothing is agreed during this viewing. | B2 | 사본 제공과 합의 미완료 확인 | B | 집 보기 중 합의가 없다는 것은 이 가상 대화의 상태이며 실제 계약 법률 설명이 아니다 | - |
| aph-23 | lease | npc | Clerk | This offer has a one-year lease. What would you like to know about it? | B2 | 가상 계약 기간 안내 | B | 일 년 계약은 실제 매물의 계약 조건이 아니라 가상 제안의 값이다 | - |
| aph-24 | lease | option | A자리 | What happens if we need to leave before the lease ends? | B2 | 중도 퇴거 조건 질문 | A | - | - |
| aph-25 | lease | option | A자리 | Can we discuss a shorter lease before we decide? | B2 | 계약 기간 협의 요청 | A | - | - |
| aph-26 | lease | npc | Clerk | The terms for ending early are here. We can discuss the lease length. | B2 | 서면 조건 협의 안내 | B | 중도 퇴거 조건은 가상 제안에서 확인하고 기간 협의 가능성만 말하며 실제 법률 조언은 아니다 | - |
| aph-27 | rules | npc | Clerk | Which house rules would you like to ask about? | B2 | 거주 규칙 질문 받기 | A | - | - |
| aph-28 | rules | option | B자리 | Are overnight guests allowed, and are there any limits we should know about? | B2 | 손님 규칙과 제한 질문 | A | - | - |
| aph-29 | rules | option | B자리 | When are quiet hours, and how do we report a noise problem? | B2 | 조용한 시간과 신고 방법 질문 | B | quiet hours라는 거주 규칙 연어와 현장 화용은 사람 검수가 필요하다 | - |
| aph-30 | rules | npc | Clerk | The sheet lists guest rules, quiet hours, and how to report noise. Let's read it together. | B2 | 서면 거주 규칙 검토 | A | - | - |
| aph-31 | repair | option | A자리 | Could you also explain how we would request a repair? | B2 | 수리 요청 방법 질문 | B | 수리 요청의 현장 화용과 절차 용어는 사람 검수가 필요하다 | - |
| aph-32 | repair | option | A자리 | Which repairs would we be expected to pay for ourselves? | B2 | 수리비 책임 범위 질문 | B | 수리비 부담을 묻는 현장 화용은 사람 검수가 필요하며 실제 법률 책임은 정하지 않았다 | - |
| aph-33 | repair | npc | Clerk | The offer lists repair contacts and who pays; we can check each point. | B2 | 서면 연락처와 비용 책임 확인 | B | 수리 연락처와 비용 책임을 가상 제안에서 확인하며 실제 권리나 의무를 설명하지 않는다 | - |
| aph-34 | decision | npc | Clerk | What would help you make a decision after the viewing? | B2 | 결정에 필요한 조건 묻기 | A | - | - |
| aph-35 | decision | option | B자리 | Could we come back at another time to hear the street noise? | B2 | 추가 방문 요청 | A | - | - |
| aph-36 | decision | option | B자리 | We'd like to compare this offer with another apartment before we decide. | B2 | 다른 집과 비교 위해 결정 유보 | A | - | - |
| aph-37 | decision | npc | Clerk | That's fine. Contact me if you'd like another viewing or want to discuss the offer. | B2 | 추가 방문과 협의 연락 제안 | B | 추가 방문과 연락을 허용하는 것은 가상 진행이며 실제 방문 예약 완료가 아니다 | - |
| aph-38 | finish | option | A자리 | Thank you. We'll review this offer together before making a decision. | B2 | 공동 검토 계획 | A | - | - |
| aph-39 | finish | option | A자리 | Thank you. Could you write down the details we still need to check? | B2 | 남은 확인 사항 기록 요청 | A | - | - |
| aph-40 | finish | npc | Clerk | Yes. I'll note the open questions for you to review. | B2 | 확인 사항 기록 수락 | A | - | - |

### 연습할 말

두 사람이 번갈아 연습할 데이터 본보기다. 본문 줄을 그대로 연결하며 실제 음성과 발화 전 필수 이수는 이 파일로 보장하지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| aph-p1 | Yes. We'd like to compare the space and costs before making a decision. | 비교 목적 설명 | aph-02 | - |
| aph-p2 | Yes. Could you tell us what we'll see during the viewing? | 집 보기 순서 질문 | aph-03 | - |
| aph-p3 | How much noise can we expect from the street? | 소음 조건 질문 | aph-07 | - |
| aph-p4 | Could we open the windows to see how much noise comes in? | 소음 직접 확인 요청 | aph-10 | - |
| aph-p5 | The space could work for us, but we'd like to understand the full monthly cost. | 가능성 평가와 비용 확인 | aph-13 | - |
| aph-p6 | What is the monthly rent, and which bills would we pay separately? | 월세와 별도 요금 질문 | aph-14 | - |
| aph-p7 | Is there a deposit, and when would we need to pay it? | 보증금과 납부 시점 질문 | aph-17 | - |
| aph-p8 | Would any other charges be due before we could move in? | 입주 전 추가 비용 질문 | aph-18 | - |
| aph-p9 | Could we take a copy and review it together later? | 검토 유보와 사본 요청 | aph-21 | - |
| aph-p10 | What happens if we need to leave before the lease ends? | 중도 퇴거 조건 질문 | aph-24 | - |
| aph-p11 | Can we discuss a shorter lease before we decide? | 계약 기간 협의 요청 | aph-25 | - |
| aph-p12 | Are overnight guests allowed, and are there any limits we should know about? | 손님 규칙과 제한 질문 | aph-28 | - |
| aph-p13 | When are quiet hours, and how do we report a noise problem? | 조용한 시간과 신고 방법 질문 | aph-29 | - |
| aph-p14 | Could you also explain how we would request a repair? | 수리 요청 방법 질문 | aph-31 | - |
| aph-p15 | Which repairs would we be expected to pay for ourselves? | 수리비 책임 범위 질문 | aph-32 | - |
| aph-p16 | Could we come back at another time to hear the street noise? | 추가 방문 요청 | aph-35 | - |
| aph-p17 | We'd like to compare this offer with another apartment before we decide. | 다른 집과 비교 위해 결정 유보 | aph-36 | - |
| aph-p18 | Thank you. Could you write down the details we still need to check? | 남은 확인 사항 기록 요청 | aph-39 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | start | aph-01 | aph-02/aph-03 | A |
| n1 | start | aph-04 | - | - |
| t2 | space | aph-05 | aph-06/aph-07 | B |
| t3 | check | aph-09 | aph-10/aph-11 | A |
| n2 | check | aph-12 | - | - |
| t4 | cost | - | aph-13/aph-14 | B |
| n3 | cost | aph-15 | - | - |
| t5 | fees | aph-16 | aph-17/aph-18 | A |
| n4 | fees | aph-19 | - | - |
| t6 | copy | - | aph-20/aph-21 | B |
| n5 | copy | aph-22 | - | - |
| t7 | lease | aph-23 | aph-24/aph-25 | A |
| n6 | lease | aph-26 | - | - |
| t8 | rules | aph-27 | aph-28/aph-29 | B |
| n7 | rules | aph-30 | - | - |
| t9 | repair | - | aph-31/aph-32 | A |
| n8 | repair | aph-33 | - | - |
| t10 | decision | aph-34 | aph-35/aph-36 | B |
| n9 | decision | aph-37 | - | - |
| t11 | finish | - | aph-38/aph-39 | A |

## 나들이: lei_day

작성자: gpt (2026-10-11)
장소: kapiolani_park
세션: 228
목표 등급: B2
할 일: cd-lyd-1 / I can ask about a display, check instructions politely, and explain my opinion. / 전시에 대해 묻고 진행 안내를 예의 있게 확인하며 의견을 설명할 수 있다.
허용 이름: lei
갈래: lyd-02 > lyd-04, lyd-03 > lyd-05, lyd-07 > lyd-09, lyd-08 > lyd-10, lyd-12 > lyd-14, lyd-13 > lyd-14, lyd-16 > lyd-18, lyd-17 > lyd-19, lyd-20 > lyd-22, lyd-21 > lyd-23, lyd-25 > lyd-27, lyd-26 > lyd-28, lyd-32 > lyd-33

상황: 레이 데이 행사를 배경으로 두 사람이 가상 안내 탁자 앞에서 진행 설명을 듣는다. 행사 날짜와 연도, 역사, 의례, 노래 뜻, 선물 받기 관습은 이 미션에 새로 정하지 않는다. 표지의 부탁, 만지기 전에 묻는 절차, 전시용 물건과 활동용 물건의 구분, 꽃과 잎을 각각 적은 두 이름표, 질문하는 시점과 정보 탁자는 모두 이 미션의 가상 안내다. 어느 꽃이나 잎이 실제 특정 레이에 들어가는지, 문화적 의미가 무엇인지는 정하지 않는다.

하와이어 주석: lei는 제공된 culture.md 5.1의 꽃목걸이 뜻으로만 쓴다. 철자는 lei이며 복수도 lei다. 영어 복수 -s를 붙이지 않는다. 허용 이름은 이 문화 낱말 하나를 표기 범위로 허용한 것이며 일반 영어 낱말을 면제하지 않는다. 레이를 보상이나 물건 수집 목표로 쓰지 않는다.

두 갈래 모두 t2에서 만지기 전에 안내자에게 묻는 가상 절차를 확인할 수 있다. t4와 t5에서 두 이름표가 재료를 말해 준다는 설명을 들은 뒤 t6에서 요약하거나 추가 정보 위치를 묻는다. t7은 질문할 때의 절차를 확인하며 실제 행사 전체의 예절 규칙이라고 말하지 않는다. t9에서 참여를 유보해도 t10 이후는 관찰과 의견만 이어지므로 자동으로 물건을 만지거나 활동을 시작하지 않는다. 이동은 끝의 제안일 뿐 정보 탁자에 도착한 것으로 세지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| lyd-01 | sign | npc | Guide | Welcome. Please read the sign before coming to the table. | B1 | 가상 안내표 읽기 요청 | B | 안내표를 먼저 읽는 절차는 실제 행사 규정이 아니라 가상 탁자의 안내다 | - |
| lyd-02 | sign | option | A자리 | Could you explain what the sign asks visitors to do? | B2 | 안내표 설명 요청 | A | - | - |
| lyd-03 | sign | option | A자리 | May we watch from here before we go closer? | B1 | 관찰 위치 허락 요청 | A | - | - |
| lyd-04 | sign | npc | Guide | Please look first and ask me before touching anything on the table. | B1 | 가상 진행 부탁 설명 | B | 먼저 보고 만지기 전에 묻는 순서는 실제 행사 전체의 규정이 아니라 가상 안내다 | - |
| lyd-05 | sign | npc | Guide | Yes. Watch from here, then ask me before touching anything on the table. | B2 | 관찰 허락과 절차 안내 | B | 관찰 위치와 만지기 전에 묻는 절차는 이 미션의 가상 안내다 | - |
| lyd-06 | clarification | npc | Guide | What would you like to ask? | A2 | 질문 초대 | A | - | - |
| lyd-07 | clarification | option | B자리 | Does that mean we should ask before picking up a lei? | B2 | 부탁 범위 확인 | A | - | - |
| lyd-08 | clarification | option | B자리 | Why are visitors asked to check with you first? | B2 | 진행 이유 질문 | A | - | - |
| lyd-09 | clarification | npc | Guide | Yes. Ask first so I can show you which items we use for this activity. | B2 | 범위 확인과 안내 이유 | B | 물건을 구분해 보여 주는 이유는 실제 문화 관습이 아니라 가상 진행 설명이다 | - |
| lyd-10 | clarification | npc | Guide | Some items are for the display; I'll show you what we can use. | B2 | 물건 구분 이유 설명 | B | 전시용과 활동용 물건의 구분은 이 미션에서 정한 가상 장면값이다 | - |
| lyd-11 | labels | wait | A자리 | Let's ask about the labels before we decide what to do, {B}. | B2 | 공동 확인 제안 | A | - | - |
| lyd-12 | labels | option | B자리 | I'd like to understand the difference between these two lei. | B2 | 설명을 듣고 싶은 목적 | A | - | - |
| lyd-13 | labels | option | B자리 | Could you explain what the two labels tell us? | B2 | 이름표 설명 요청 | A | - | - |
| lyd-14 | labels | npc | Guide | This label lists flowers, and that one lists leaves. | B1 | 가상 이름표 정보 설명 | B | 꽃과 잎을 적은 두 이름표는 실제 전시 자료를 확인한 정보가 아니라 가상 내용이다 | - |
| lyd-15 | materials | npc | Guide | What would you like to know about the labels? | A2 | 이름표 추가 질문 초대 | A | - | - |
| lyd-16 | materials | option | A자리 | Do the labels describe what each lei is made of? | B2 | 이름표 정보 범위 확인 | A | - | - |
| lyd-17 | materials | option | A자리 | Could you give us an example using the first label? | B2 | 설명 예시 요청 | A | - | - |
| lyd-18 | materials | npc | Guide | Yes. They tell you what is used to make each lei. | B1 | 정보 범위 확인 대답 | B | 이름표가 재료를 설명한다는 범위는 이 미션의 가상 자료에만 해당한다 | - |
| lyd-19 | materials | npc | Guide | The first label says this lei is made with flowers. | B1 | 가상 이름표 예시 | B | 첫 번째 레이의 꽃 재료는 실제 전시물을 확인한 사실이 아니라 가상 장면값이다 | - |
| lyd-20 | understanding | option | B자리 | So they describe the materials, rather than the history. Is that right? | B2 | 설명 요약과 확인 | A | - | - |
| lyd-21 | understanding | option | B자리 | Where could we learn about the history instead? | B2 | 추가 설명 경로 질문 | A | - | - |
| lyd-22 | understanding | npc | Guide | Yes. That's what these labels tell you. | A2 | 요약 확인 대답 | B | 이름표의 설명 범위를 확인하는 대답은 앞서 제시한 가상 자료에만 해당한다 | - |
| lyd-23 | understanding | npc | Guide | You can ask the host at the information table. | B1 | 추가 설명 경로 안내 | B | 안내자를 만날 정보 탁자의 위치와 역할은 실제 행사 배치가 아니라 가상 설정이다 | - |
| lyd-24 | questions | npc | Guide | Would you like to ask anything else before the activity? | B1 | 활동 전 질문 초대 | A | - | - |
| lyd-25 | questions | option | A자리 | What should we do if we have questions during the activity? | B2 | 질문 대응 절차 묻기 | A | - | - |
| lyd-26 | questions | option | A자리 | Could we watch first and ask questions afterward? | B1 | 관찰 뒤 질문 허락 요청 | A | - | - |
| lyd-27 | questions | npc | Guide | If you have a question, ask me before you continue. | B1 | 가상 질문 절차 안내 | B | 진행 전에 안내자에게 묻는 절차는 실제 문화 예절을 확정한 말이 아니라 가상 안내다 | - |
| lyd-28 | questions | npc | Guide | Yes. Watch first, then ask me questions before trying anything. | B1 | 관찰 뒤 질문 허락 | B | 관찰 뒤 질문하고 시도하는 순서는 이 미션의 가상 활동 안내다 | - |
| lyd-29 | opinion | wait | B자리 | I appreciate having time to ask because I don't want to assume I understand. | B2 | 조심스러운 의견과 이유 | B | appreciate와 assume의 화용 강도와 줄의 B2 경계는 사람 검수가 필요하다 | - |
| lyd-30 | plan | npc | Guide | What is your plan for the activity? | A2 | 다음 계획 묻기 | A | - | - |
| lyd-31 | plan | option | A자리 | We'll watch first, then ask before we try anything. | B2 | 조건을 둔 참여 계획 | A | - | - |
| lyd-32 | plan | option | A자리 | I'd prefer to watch today and leave the activity for another visit. | B2 | 참여 유보와 대안 | A | - | - |
| lyd-33 | plan | npc | Guide | That's fine. You can stay here and watch. | A2 | 참여 유보 수락 | B | 관찰만 할 수 있다는 대답은 실제 행사 참여 규정이 아니라 가상 안내다 | - |
| lyd-34 | observation | wait | B자리 | I'd like to look at the two lei again while we watch. | B2 | 관찰 초점 말하기 | A | - | - |
| lyd-35 | compare | npc | Guide | Have the labels helped you compare them? | B1 | 설명 도움 확인 | A | - | - |
| lyd-36 | compare | option | A자리 | Yes. Knowing the materials helps me describe the difference more clearly. | B2 | 설명 평가와 이유 | A | - | - |
| lyd-37 | compare | option | A자리 | They help, but I'd need more information before discussing the history of the lei. | B2 | 평가와 판단 유보 | A | - | - |
| lyd-38 | next | option | B자리 | Let's ask the host where we can find more information. | B2 | 추가 질문 제안 | A | - | - |
| lyd-39 | next | option | B자리 | For now, I'd rather focus on what the guide explained. | B2 | 현재 범위에 대한 선호 | B | focus on의 의견 표현과 줄의 난이도 경계는 사람 검수가 필요하다 | - |

### 연습할 말

두 사람이 번갈아 연습할 말의 데이터 본보기다. 본문 줄과 같은 말이며 필수 선행 이수나 실제 음성 재생은 이 파일이 보장하지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| lyd-p1 | Could you explain what the sign asks visitors to do? | 안내표 설명 요청 | lyd-02 | - |
| lyd-p2 | May we watch from here before we go closer? | 관찰 위치 허락 요청 | lyd-03 | - |
| lyd-p3 | Does that mean we should ask before picking up a lei? | 부탁 범위 확인 | lyd-07 | - |
| lyd-p4 | Why are visitors asked to check with you first? | 진행 이유 질문 | lyd-08 | - |
| lyd-p5 | Let's ask about the labels before we decide what to do, {B}. | 공동 확인 제안 | lyd-11 | - |
| lyd-p6 | Do the labels describe what each lei is made of? | 이름표 정보 범위 확인 | lyd-16 | - |
| lyd-p7 | So they describe the materials, rather than the history. Is that right? | 설명 요약과 확인 | lyd-20 | - |
| lyd-p8 | What should we do if we have questions during the activity? | 질문 대응 절차 묻기 | lyd-25 | - |
| lyd-p9 | I appreciate having time to ask because I don't want to assume I understand. | 조심스러운 의견과 이유 | lyd-29 | - |
| lyd-p10 | I'd prefer to watch today and leave the activity for another visit. | 참여 유보와 대안 | lyd-32 | - |
| lyd-p11 | They help, but I'd need more information before discussing the history of the lei. | 평가와 판단 유보 | lyd-37 | - |
| lyd-p12 | For now, I'd rather focus on what the guide explained. | 현재 범위에 대한 선호 | lyd-39 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | sign | lyd-01 | lyd-02/lyd-03 | A |
| t2 | clarification | lyd-06 | lyd-07/lyd-08 | B |
| t3 | labels | - | lyd-11 | A |
| t4 | labels | - | lyd-12/lyd-13 | B |
| t5 | materials | lyd-15 | lyd-16/lyd-17 | A |
| t6 | understanding | - | lyd-20/lyd-21 | B |
| t7 | questions | lyd-24 | lyd-25/lyd-26 | A |
| t8 | opinion | - | lyd-29 | B |
| t9 | plan | lyd-30 | lyd-31/lyd-32 | A |
| t10 | observation | - | lyd-34 | B |
| t11 | compare | lyd-35 | lyd-36/lyd-37 | A |
| t12 | next | - | lyd-38/lyd-39 | B |

## 나들이: dole_plantation

작성자: gpt (2026-10-11)
장소: dole_plantation
세션: 233
목표 등급: B2
할 일: cd-dpt-1 / I can understand a tour plan, ask follow-up questions, and buy a souvenir. / 투어 진행 설명을 이해하고 이어서 질문하고 기념품을 살 수 있다.
허용 이름: -
갈래: dpt-06 > dpt-08, dpt-07 > dpt-09, dpt-11 > dpt-13, dpt-12 > dpt-13, dpt-15 > dpt-17, dpt-16 > dpt-17, dpt-18 > dpt-20, dpt-19 > dpt-21, dpt-33 > dpt-35, dpt-34 > dpt-35, dpt-37 > dpt-38

상황: 돌 플랜테이션을 배경으로 한 가상 투어 안내와 기념품 구매다. 실제 농장 역사나 재배법을 설명하지 않는다. 가상 안내 그림은 현재 설명 자리와 정원 입구라는 두 모임 지점을 보여 준다. 안내 자리에서 먼저 설명하고 질문을 받으며, 정원 안내와 가게 방문은 별개라는 진행 방식도 가상 장면 값이다. t4의 두 선택은 모두 걷기를 미루고 질문을 계속하므로 다음 대사에서 자동 출발하지 않는다. t6 뒤에는 n2를 듣고 두 사람이 가게로 갈 준비를 밝혔다고 진행자가 확인할 때까지 현재 자리에서 기다린다. 그 후 별도 가게 장면으로 옮기며, 이 파일이 기다림이나 이동의 실제 구현을 보장하지 않는다. 컵 두 개의 같은 가격, 상자에 맞는 크기, 현금과 카드 접수, 작은 컵 한 개와 상자를 포함한 총액 12달러는 모두 가상 장면 값이다. t10의 결제 방식 선택과 n3 뒤 실제 결제 동작을 하고 진행자가 결제 성공을 확인한 다음에만 n4의 물건과 영수증을 건넨다. 연습 표는 두 사람이 번갈아 말할 본보기 데이터이며 선행 이수나 소리 파일을 보장하지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| dpt-01 | plan | npc | Guide | Would you like to hear the plan before you decide about the walk? | B1 | 걷기 결정 전 안내 제안 | A | - | - |
| dpt-02 | plan | option | A자리 | Could you explain the main parts of the tour? | B1 | 전체 진행 설명 요청 | A | - | - |
| dpt-03 | plan | option | A자리 | Does the plan include time to ask questions? | B1 | 질문 시간 포함 여부 확인 | A | - | - |
| dpt-04 | plan | npc | Guide | We start at this display, and you can ask questions here. | B1 | 시작 지점과 질문 안내 | B | 안내 자리에서 시작하는 진행 방식은 실제 투어 절차가 아닌 가상 장면 값이다 | - |
| dpt-05 | plan | npc | Guide | Later, the guide shows the garden. The shop visit is separate. | B1 | 투어와 가게 방문 구분 | B | 정원 안내와 별도 가게 방문은 실제 프로그램 정보가 아닌 가상 장면 값이다 | - |
| dpt-06 | scope | option | A자리 | So the shop visit is separate from the garden tour, right? | B2 | 들은 설명 요약 확인 | A | - | - |
| dpt-07 | scope | option | A자리 | Does the garden part include time for questions? | B1 | 설명 범위 추가 확인 | A | - | - |
| dpt-08 | scope | npc | Guide | That's right. The shop is a separate visit. | B1 | 요약 확인 응답 | B | 가게 방문이 투어와 별개라는 사실은 가상 진행 안내에만 해당한다 | - |
| dpt-09 | scope | npc | Guide | Yes. You can ask the guide questions in the garden. | B1 | 정원 질문 시간 설명 | B | 정원에서 안내자에게 질문하는 운영 절차는 가상 장면 값이다 | - |
| dpt-10 | picture | npc | Guide | This picture shows our meeting points: this display and the garden entrance. | B1 | 가상 안내 그림 설명 | B | 그림의 모임 지점은 실제 현장 표지나 정원 배치 정보가 아니다 | - |
| dpt-11 | picture | option | B자리 | So we meet here first, then at the garden entrance? | B2 | 그림과 순서 종합 확인 | A | - | - |
| dpt-12 | picture | option | B자리 | Which meeting point comes first? | B1 | 순서 명확화 요청 | A | - | - |
| dpt-13 | picture | npc | Guide | We meet here first, before going to the garden entrance. | B1 | 모임 순서 재설명 | B | 먼저 설명 자리에서 모인다는 순서는 가상 안내 그림의 내용이다 | - |
| dpt-14 | pause | npc | Guide | Would you like to walk now or stay here a little longer? | B1 | 걷기와 대기 선택 묻기 | A | - | - |
| dpt-15 | pause | option | A자리 | We'd like to stay here while we ask about the shop. | B1 | 질문을 위한 대기 제안 | A | - | - |
| dpt-16 | pause | option | A자리 | Could we decide about the walk after one more question? | B1 | 결정 유보 요청 | A | - | - |
| dpt-17 | pause | npc | Guide | Of course. We can talk here without starting the walk. | B1 | 걷기 유보 수락 | A | - | - |
| dpt-18 | shopquestion | option | B자리 | Can we visit the shop without joining the garden tour? | B2 | 투어와 구매의 독립성 질문 | B | 투어 참가 없이 가게에 갈 수 있는지는 현지 운영 확인이 필요한 화용이다 | - |
| dpt-19 | shopquestion | option | B자리 | Could you point out the shop on this map? | B1 | 지도에서 위치 요청 | A | - | - |
| dpt-20 | shopquestion | npc | Guide | Yes. The shop visit is separate from the garden tour. | B1 | 가게 방문 조건 확인 | B | 가게에 따로 방문할 수 있다는 대답은 가상 장면 조건이다 | - |
| dpt-21 | shopquestion | npc | Guide | The shop is here on the map, near this display. | B1 | 가상 지도 위치 설명 | B | 가게가 안내 자리 가까이 있다는 배치는 가상 지도 값이다 | - |
| dpt-22 | next | npc | Guide | What would you like to do next? | A2 | 다음 계획 묻기 | A | - | - |
| dpt-23 | next | option | B자리 | Let's visit the shop and decide about the garden later. | B1 | 별도 방문과 결정 연기 제안 | A | - | - |
| dpt-24 | next | option | B자리 | Could we have a moment before we visit the shop? | B1 | 이동 전 시간 요청 | A | - | - |
| dpt-25 | next | npc | Guide | Take your time here, and tell me when you're ready for the shop. | B1 | 준비 확인까지 기다리기 | A | - | - |
| dpt-26 | gift | npc | Clerk | Are you looking for a gift or something for yourself? | B1 | 구매 목적 묻기 | A | - | - |
| dpt-27 | gift | option | A자리 | I'm looking for a gift that's easy to carry home. | B1 | 휴대할 선물 조건 설명 | A | - | - |
| dpt-28 | gift | option | A자리 | Could you show us the smaller cups first? | B1 | 비교할 물건 요청 | A | - | - |
| dpt-29 | choose | npc | Clerk | These two cups are the same price. Both fit in this box. | B1 | 가격과 포장 조건 설명 | B | 두 컵의 가격과 상자 크기는 실제 판매 정보가 아닌 가상 장면 값이다 | - |
| dpt-30 | choose | option | A자리 | I'll take one small cup, please. | A2 | 수량과 물건 선택 | A | - | - |
| dpt-31 | choose | option | A자리 | I'd like one small cup. Could I check the price before paying? | B1 | 선택 후 가격 확인 요청 | A | - | - |
| dpt-32 | total | npc | Cashier | For one small cup, the total is twelve dollars. | B1 | 선택 수량의 총액 안내 | B | 작은 컵 한 개의 총액 십이 달러는 실제 가격이 아닌 가상 장면 값이다 | - |
| dpt-33 | total | option | B자리 | Does that include the box? | B1 | 총액의 포함 범위 확인 | A | - | - |
| dpt-34 | total | option | B자리 | Could you show me the total on the screen? | B1 | 표시 금액 확인 요청 | A | - | - |
| dpt-35 | total | npc | Cashier | Yes. The screen shows twelve dollars, including the box. | B1 | 총액과 상자 포함 확인 | B | 화면 금액과 상자 포함 조건은 가상 장면에만 해당한다 | - |
| dpt-36 | pay | option | B자리 | I'll pay by card, please. | A2 | 결제 방식 선택 | A | - | - |
| dpt-37 | pay | option | B자리 | Can I pay in cash? | A2 | 다른 결제 방식 허용 요청 | A | - | - |
| dpt-38 | pay | npc | Cashier | Yes, cash and cards are both accepted here. | B1 | 결제 방식 허용 응답 | B | 현금과 카드의 접수 가능 여부는 실제 매장 정책이 아닌 가상 장면 값이다 | - |
| dpt-39 | pay | npc | Cashier | Please pay when you're ready. | A2 | 실제 결제 동작 요청 | A | - | - |
| dpt-40 | collect | npc | Cashier | Here are your cup and receipt. | A2 | 결제 확인 뒤 물건 건네기 | A | - | - |

### 연습할 말

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| dpt-p1 | Could you explain the main parts of the tour? | 전체 진행 설명 요청 | dpt-02 | - |
| dpt-p2 | So the shop visit is separate from the garden tour, right? | 들은 설명 요약 확인 | dpt-06 | - |
| dpt-p3 | So we meet here first, then at the garden entrance? | 그림과 순서 종합 확인 | dpt-11 | - |
| dpt-p4 | Could we decide about the walk after one more question? | 결정 유보 요청 | dpt-16 | - |
| dpt-p5 | Can we visit the shop without joining the garden tour? | 투어와 구매의 독립성 질문 | dpt-18 | - |
| dpt-p6 | Let's visit the shop and decide about the garden later. | 별도 방문과 결정 연기 제안 | dpt-23 | - |
| dpt-p7 | I'm looking for a gift that's easy to carry home. | 휴대할 선물 조건 설명 | dpt-27 | - |
| dpt-p8 | I'd like one small cup. Could I check the price before paying? | 선택 후 가격 확인 요청 | dpt-31 | - |
| dpt-p9 | Does that include the box? | 총액의 포함 범위 확인 | dpt-33 | - |
| dpt-p10 | Can I pay in cash? | 다른 결제 방식 허용 요청 | dpt-37 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | plan | dpt-01 | dpt-02/dpt-03 | A |
| n1 | plan | dpt-04+dpt-05 | - | - |
| t2 | scope | - | dpt-06/dpt-07 | A |
| t3 | picture | dpt-10 | dpt-11/dpt-12 | B |
| t4 | pause | dpt-14 | dpt-15/dpt-16 | A |
| t5 | shopquestion | - | dpt-18/dpt-19 | B |
| t6 | next | dpt-22 | dpt-23/dpt-24 | B |
| n2 | next | dpt-25 | - | - |
| t7 | gift | dpt-26 | dpt-27/dpt-28 | A |
| t8 | choose | dpt-29 | dpt-30/dpt-31 | A |
| t9 | total | dpt-32 | dpt-33/dpt-34 | B |
| t10 | pay | - | dpt-36/dpt-37 | B |
| n3 | pay | dpt-39 | - | - |
| n4 | collect | dpt-40 | - | - |

## 나들이: manoa_falls_hike

작성자: gpt (2026-10-11)
장소: manoa_falls
세션: 239
목표 등급: B2
할 일: cd-mfh-1 / I can ask about weather and trail conditions, check a warning, and discuss other plans. / 날씨와 길 상태를 묻고 경고를 확인하며 다른 계획을 의논할 수 있다.
허용 이름: -
갈래: mfh-06 > mfh-08, mfh-07 > mfh-09, mfh-11 > mfh-13, mfh-12 > mfh-14, mfh-19 > mfh-21, mfh-20 > mfh-22, mfh-24 > mfh-26, mfh-25 > mfh-26

상황: 마노아 폭포 길 입구를 배경으로 한 가상 직원 대화다. 현재 확인된 날씨나 길 상태 업데이트가 없다는 설정이다. 가상 주의 안내문은 직원의 업데이트를 받을 때까지 현재 자리에서 기다리라는 내용이며, 실제 표지나 현장 정책을 옮긴 것이 아니다. 날씨 보고가 바뀔 수 있다는 설명과 직원이 길 상태 질문에 답할 정보가 아직 없다는 이유도 가상 장면 값이다. 실제 위험 수치나 장비 및 등산 요령, 통행 허가, 길의 안전 여부를 판정하지 않는다. t2에서 안내문의 뜻을 확인한 뒤 두 사람이 서로 요약하거나 불확실한 부분을 말하고 다시 직원에게 묻는다. 직원에게 기다리는 동안 계획을 의논하겠다고 말할 수 있지만, 다음 차례에서도 입구에 머물며 길로 들어가지 않는다. 마지막 두 선택은 현재 자리에서 기다리거나 길에 들어가지 않고 다른 계획을 의논하는 것이며 그 뒤 자동 출발하지 않는다. 선택된 활동의 실행이나 이동은 이 파일이 구현하지 않는다. 연습 표는 두 사람이 번갈아 말할 본보기 데이터이며 선행 이수나 소리 파일을 보장하지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| mfh-01 | update | npc | Guide | What would you like to check before making plans? | B1 | 확인할 정보 묻기 | A | - | - |
| mfh-02 | update | option | A자리 | Has there been a weather update since this morning? | B1 | 날씨 정보의 변화 질문 | A | - | - |
| mfh-03 | update | option | A자리 | Do you have an update on the trail conditions? | B1 | 현재 길 상태 질문 | A | - | - |
| mfh-04 | update | npc | Guide | I don't have a new update yet. Please wait here. | B1 | 정보 미확정과 대기 안내 | B | 업데이트가 없고 현재 자리에서 기다리라는 지시는 가상 직원의 안내다 | - |
| mfh-05 | notice | npc | Guide | This notice asks visitors to wait for an update. | B1 | 가상 주의 안내문 설명 | B | 기다림을 요청하는 안내문은 실제 표지나 현장 정책을 옮긴 것이 아니다 | - |
| mfh-06 | notice | option | B자리 | So we should wait here before we decide about the walk? | B2 | 주의 안내의 뜻 요약 확인 | A | - | - |
| mfh-07 | notice | option | B자리 | Does this notice tell us anything about today's weather? | B1 | 안내문 정보 범위 확인 | A | - | - |
| mfh-08 | notice | npc | Guide | Yes. Staff will give an update before you decide. | B1 | 기다림의 의미 확인 | B | 직원의 업데이트 후 결정한다는 순서는 가상 진행 안내다 | - |
| mfh-09 | notice | npc | Guide | No. This notice asks visitors to wait; it isn't a weather report. | B1 | 안내문과 날씨 보고 구분 | B | 안내문이 날씨를 설명하지 않는다는 말은 가상 안내문에만 해당한다 | - |
| mfh-10 | clarify | npc | Guide | The weather report may change, and we don't have the trail update yet. | B2 | 정보의 한계와 변화 설명 | B | 날씨 보고와 길 상태 정보의 한계는 실제 현장 판단이 아닌 가상 장면 값이다 | - |
| mfh-11 | clarify | option | A자리 | Could you explain what that means for our plans? | B2 | 정보 한계의 영향 설명 요청 | A | - | - |
| mfh-12 | clarify | option | A자리 | Where can we get the next update before we decide? | B2 | 후속 정보 출처 요청 | A | - | - |
| mfh-13 | clarify | npc | Guide | Please wait for the update before making any plans to walk. | B1 | 미확정 정보에 따른 대기 재설명 | B | 걷기 계획 전 기다리라는 대답은 가상 직원의 진행 안내다 | - |
| mfh-14 | clarify | npc | Guide | You can ask us here. We don't have the update yet. | B1 | 후속 질문 장소 안내 | B | 이 자리에서 직원에게 다시 묻는 절차는 가상 장면 값이다 | - |
| mfh-15 | pair | wait | B자리 | Could you tell me what the notice means, {A}? | B1 | 동행에게 안내 요약 요청 | A | - | - |
| mfh-16 | pair | option | A자리 | It asks us to wait here until staff give an update. | B2 | 주의 안내문 내용 요약 | A | - | - |
| mfh-17 | pair | option | A자리 | I'm still unsure about part of it. Let's ask the staff again. | B1 | 이해의 한계와 재확인 제안 | A | - | - |
| mfh-18 | repeat | npc | Guide | I can explain it again: please wait here for the update. | B1 | 요약 뒤 주의 안내 재확인 | B | 가상 안내문의 뜻을 다시 설명하며 실제 등산 판단을 대신하지 않는다 | - |
| mfh-19 | repeat | option | B자리 | Thanks. Could you say when the next update is expected? | B2 | 후속 정보의 예상 시점 질문 | A | - | - |
| mfh-20 | repeat | option | B자리 | Could you explain why the notice asks us to wait? | B2 | 대기 안내의 이유 질문 | A | - | - |
| mfh-21 | repeat | npc | Guide | I don't have a time to give you yet. | A2 | 시점 미확정 설명 | B | 업데이트 시점을 모른다는 설정은 실제 현장 일정이 아닌 가상 장면 값이다 | - |
| mfh-22 | repeat | npc | Guide | We don't have the trail update yet, so we can't answer questions about trail conditions. | B2 | 안내 이유와 정보 한계 설명 | B | 길 상태 질문에 답할 정보가 없다는 이유는 가상 장면 조건이다 | - |
| mfh-23 | discuss | npc | Guide | Would you like to discuss your plans while you wait? | B1 | 대기 중 계획 의논 제안 | A | - | - |
| mfh-24 | discuss | option | A자리 | Could we wait for the update before we choose a plan? | B1 | 계획 결정 유보 요청 | A | - | - |
| mfh-25 | discuss | option | A자리 | I'd rather talk about another place while we wait here. | B1 | 다른 계획 논의 선호 표현 | A | - | - |
| mfh-26 | discuss | npc | Guide | Of course. We can talk here without entering the trail. | B1 | 현재 자리에서 의논 수락 | B | 길에 들어가지 않고 입구에서 의논하는 것은 가상 진행 설정이다 | - |
| mfh-27 | proposal | option | B자리 | We could visit a shop later if we decide against the walk. | B2 | 조건을 붙인 대안 제안 | B | decide against의 선택을 접는 연어와 조건부 제안의 등급은 사람 검토가 필요하다 | - |
| mfh-28 | proposal | option | B자리 | Let's choose another activity after we get the update. | B1 | 정보 확인 후 대안 결정 제안 | A | - | - |
| mfh-29 | response | option | A자리 | That sounds reasonable, but let's wait for the update first. | B2 | 제안 수락에 대기 조건 붙이기 | B | 제안에 유보 조건을 붙이는 reasonable의 화용과 등급은 사람 검토가 필요하다 | - |
| mfh-30 | response | option | A자리 | I'd prefer to decide together once we have more information. | B2 | 함께 결정할 시점 제안 | A | - | - |
| mfh-31 | ending | npc | Guide | There's no update yet. What would you like to do for now? | B1 | 현재 정보와 임시 계획 묻기 | B | 마지막 차례에도 업데이트가 없다는 상태는 가상 장면 설정이다 | - |
| mfh-32 | ending | option | B자리 | We'll stay here and ask again later. | A2 | 현재 자리 대기 선택 | A | - | - |
| mfh-33 | ending | option | B자리 | We'll discuss other plans without entering the trail. | B1 | 길에 들어가지 않고 대안 의논 선택 | A | - | - |
| mfh-34 | ending | npc | Guide | Thank you for checking before making plans. | B1 | 확인 대화 마무리 | A | - | - |

### 연습할 말

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| mfh-p1 | Has there been a weather update since this morning? | 날씨 정보의 변화 질문 | mfh-02 | - |
| mfh-p2 | Do you have an update on the trail conditions? | 현재 길 상태 질문 | mfh-03 | - |
| mfh-p3 | So we should wait here before we decide about the walk? | 주의 안내의 뜻 요약 확인 | mfh-06 | - |
| mfh-p4 | Could you explain what that means for our plans? | 정보 한계의 영향 설명 요청 | mfh-11 | - |
| mfh-p5 | It asks us to wait here until staff give an update. | 주의 안내문 내용 요약 | mfh-16 | - |
| mfh-p6 | I'm still unsure about part of it. Let's ask the staff again. | 이해의 한계와 재확인 제안 | mfh-17 | - |
| mfh-p7 | Could you explain why the notice asks us to wait? | 대기 안내의 이유 질문 | mfh-20 | - |
| mfh-p8 | We could visit a shop later if we decide against the walk. | 조건을 붙인 대안 제안 | mfh-27 | - |
| mfh-p9 | That sounds reasonable, but let's wait for the update first. | 제안 수락에 대기 조건 붙이기 | mfh-29 | - |
| mfh-p10 | We'll discuss other plans without entering the trail. | 길에 들어가지 않고 대안 의논 선택 | mfh-33 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | update | mfh-01 | mfh-02/mfh-03 | A |
| n1 | update | mfh-04 | - | - |
| t2 | notice | mfh-05 | mfh-06/mfh-07 | B |
| t3 | clarify | mfh-10 | mfh-11/mfh-12 | A |
| t4 | pair | - | mfh-15 | B |
| t5 | pair | - | mfh-16/mfh-17 | A |
| t6 | repeat | mfh-18 | mfh-19/mfh-20 | B |
| t7 | discuss | mfh-23 | mfh-24/mfh-25 | A |
| t8 | proposal | - | mfh-27/mfh-28 | B |
| t9 | response | - | mfh-29/mfh-30 | A |
| t10 | ending | mfh-31 | mfh-32/mfh-33 | B |
| n2 | ending | mfh-34 | - | - |

## 나들이: hospital_emergency

작성자: gpt (2026-10-11)
장소: -
세션: 245
목표 등급: B2
할 일: cd-her-1 / I can describe symptoms and their order, give registration details, and check instructions. / 상황의 조건과 정보를 함께 확인할 수 있다.
허용 이름: -
갈래: her-08 > her-09, her-16 > her-17, her-26 > her-28, her-27 > her-28, her-30 > her-33, her-31 > her-32, her-35 > her-37, her-36 > her-37

상황: 제안 장소 id는 new:hospital_er이며 원본에 등록되지 않아 장소 메타는 -다. 이름 없는 가상 응급실에서 증상, 시간 순서, 접수 정보와 안내 이해만 연습한다. 실제 접수 순서, 대기 장소, 서류 요건과 진료 가능성을 확인한 정보가 아니며 진단, 약 이름, 복용량과 치료법을 넣지 않는다.

A자리가 환자이고 B는 동행자다. 가상 경위는 아침 식사 뒤 배가 아프기 시작했고 A가 앉았으며 두 사람이 함께 왔다는 것이다. 시작 시각은 대략 여덟 시이거나 정확히 기억하지 못하는 표현을 고르고, B는 본 행동이나 A에게 들은 변화만 보고한다. 통증이 더 심해졌다는 정보도 A가 말한 변화로만 다룬다. A가 허락해서 B는 A의 가방에서 A의 신분증을 꺼내 전달한다. 양식을 작성하고 이름과 주소를 확인 또는 수정할 시간을 둔 뒤 대기 안내로 이어지며 이 안내는 실제 응급 대응을 대신하지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| her-01 | arrival | npc | Nurse | What brings you to the emergency department today? | B2 | 증상 설명 요청 | B | 미국 병원 접수의 표현과 실제 응급실 절차는 사람과 현장별 확인이 필요하다 | - |
| her-02 | arrival | option | A자리 | I've had pain in my stomach since this morning, and it's getting worse. | B2 | 증상과 악화 경위 설명 | B | 증상 보고의 표현과 등급은 사람 검수가 필요하며 실제 환자 상태를 판정하지 않는다 | - |
| her-03 | arrival | option | A자리 | My stomach started hurting this morning. I need help explaining what happened. | B2 | 증상 설명과 언어 도움 요청 | B | 증상을 설명하는 연어는 사람 검수가 필요하며 진단이나 치료 내용을 담지 않았다 | - |
| her-04 | time | npc | Nurse | I'll listen. Please tell me when the pain started. | B2 | 증상 시작 시점 질문 | A | - | - |
| her-05 | time | option | A자리 | It started around eight, shortly after breakfast; it hasn't stopped since then. | B2 | 대략 시각과 지속 설명 | A | - | - |
| her-06 | time | option | A자리 | It began after breakfast, but I'm not sure of the exact time. | B2 | 시점 설명과 불확실성 표시 | A | - | - |
| her-07 | witness | option | B자리 | I was with {A} at breakfast, before the pain started. | B2 | 동행자의 관찰 범위 설명 | A | - | - |
| her-08 | witness | option | B자리 | Would it help if I told you what I saw after breakfast? | B2 | 관찰 내용 제공 제안 | A | - | - |
| her-09 | witness | npc | Nurse | Yes. Please tell me what you saw, without guessing at the cause. | B2 | 관찰 내용 요청 | B | 원인을 추측하지 않고 본 것을 묻는 것은 이 언어 연습의 가상 안내다 | - |
| her-10 | witness | npc | Nurse | Is someone here who can tell me what they saw? | B2 | 동행자의 관찰 정보 요청 | A | - | - |
| her-11 | events | npc | Nurse | What did you notice after the pain began? | B2 | 발생 후 경위 질문 | A | - | - |
| her-12 | events | option | B자리 | {A} sat down because of the pain, and we came here together. | B2 | 관찰한 행동 순서 설명 | A | - | - |
| her-13 | events | option | B자리 | {A} told me the pain was getting worse, so we came here together. | B2 | 들은 변화와 이동 경위 설명 | A | - | - |
| her-14 | describe | npc | Nurse | What does the pain feel like now? | B2 | 현재 증상 표현 요청 | B | 증상 느낌을 묻는 임상 접수 표현과 화용은 사람 검수가 필요하다 | - |
| her-15 | describe | option | A자리 | It's still in my stomach, but I can't describe the feeling clearly. | B2 | 현재 위치와 표현 한계 설명 | B | 증상 표현의 연어와 등급은 사람 검수가 필요하며 의학적 판정을 대신하지 않는다 | - |
| her-16 | describe | option | A자리 | Could you ask me one question at a time so I can explain it? | B2 | 질문 방식 조정 요청 | A | - | - |
| her-17 | describe | npc | Nurse | Of course. Let's focus on where you feel the pain first. | B2 | 한 번에 한 질문 수락 | B | 질문의 초점을 한 가지로 좁히는 것은 가상 대화 절차이며 치료 지시가 아니다 | - |
| her-18 | location | npc | Nurse | Can you point to where it hurts? | B2 | 증상 위치 확인 요청 | B | 증상 위치를 가리켜 달라는 임상 접수 표현은 사람 검수가 필요하다 | - |
| her-19 | location | option | A자리 | It hurts here. Could you write down what I've told you? | B2 | 증상 위치와 기록 요청 | A | - | - |
| her-20 | location | option | A자리 | It hurts here. Please tell me if you need me to explain anything again. | B2 | 증상 위치와 추가 설명 제안 | A | - | - |
| her-21 | registration | npc | Nurse | I'll note what you've told me. We also need some details for registration. | B2 | 접수 정보 안내 | B | 증상 설명 후 접수 정보를 묻는 순서는 가상 장면이며 실제 응급실 절차를 보장하지 않는다 | - |
| her-22 | registration | option | A자리 | I can give you my name and address. Which form should I use? | B2 | 접수 정보 제공과 양식 질문 | A | - | - |
| her-23 | registration | option | A자리 | Could you help me with the form while {B} gets my ID? | B2 | 양식 작성 도움 요청 | B | 동행자가 환자 신분증을 가져오는 도움 방식은 가상 장면이며 실제 접수 규정은 아니다 | - |
| her-24 | registration | npc | Nurse | Use this form. Your friend can bring your ID to this desk. | B2 | 접수 양식과 제출 위치 안내 | B | 양식과 신분증 제출 위치는 가상 접수 절차이며 실제 현장 요구는 확인이 필요하다 | - |
| her-25 | companion | npc | Nurse | Are you the patient or the person who came with the patient? | B2 | 환자와 동행자 구분 | B | patient와 접수 확인의 화용과 등급은 사람 검수가 필요하다 | - |
| her-26 | companion | option | B자리 | I'm here with {A}, and I have permission to hand you my friend's ID. | B2 | 동행자와 서류 전달 권한 설명 | B | 환자 서류를 허락받아 전달하는 표현은 가상 상황이며 개인정보 권한을 실제 판정하지 않는다 | - |
| her-27 | companion | option | B자리 | I'm here with {A}. May I hand you my friend's ID? | B2 | 동행자 밝히고 서류 전달 허락 요청 | A | - | - |
| her-28 | companion | npc | Nurse | Yes. Please hand it to me, and I'll return it after checking the details. | B2 | 서류 전달과 반환 안내 | B | 동행자에게 신분증을 받아 돌려주는 절차는 실제 병원 정책이 아니라 가상 장면값이다 | - |
| her-29 | details | npc | Nurse | Please check the patient's name and address on the form. | B2 | 접수 내용 검토 요청 | B | 양식의 환자 이름과 주소 확인은 가상 접수 절차이며 실제 기록 형식은 미검증이다 | - |
| her-30 | details | option | A자리 | These are my details. Could you read them back so I can check them? | B2 | 본인 정보 읽어 확인 요청 | A | - | - |
| her-31 | details | option | A자리 | My address needs correcting. Can you help me change this line? | B2 | 주소 오류 수정 요청 | A | - | - |
| her-32 | details | npc | Nurse | Certainly. Let's check that line together before we continue. | B2 | 주소 수정 확인 수락 | A | - | - |
| her-33 | details | npc | Nurse | I'll read the name and address to you so you can check them. | B2 | 이름과 주소 읽어 확인 수락 | A | - | - |
| her-34 | wait | npc | Nurse | Please stay here until a staff member comes to speak with you. | B2 | 가상 대기 지시 | B | 직원이 올 때까지 이 자리에서 대기하는 것은 가상 안내이며 실제 응급 대응 지시가 아니다 | - |
| her-35 | wait | option | B자리 | So we should wait here and speak to a staff member when they come? | B2 | 대기 지시 요약 확인 | A | - | - |
| her-36 | wait | option | B자리 | Could you repeat where we should wait, please? | B2 | 대기 위치 재확인 | A | - | - |
| her-37 | wait | npc | Nurse | Stay here, at this desk, until a staff member comes to speak with you. | B2 | 대기 위치 다시 안내 | B | 책상 앞 대기는 가상 안내이며 실제 병원 대기 위치나 진료 순서를 정하지 않았다 | - |
| her-38 | change | option | A자리 | While we wait, who should I tell if the pain gets worse? | B2 | 변화 전달 대상 질문 | A | - | - |
| her-39 | change | option | A자리 | I'd like to report a change in the pain. Who should I speak to? | B2 | 변화 보고 의사와 대상 질문 | A | - | - |
| her-40 | change | npc | Nurse | Tell me or another nurse if anything changes; I'll note what you report. | B2 | 보고받을 대상 확인 | B | 증상 보고의 전달 대상만 확인하는 가상 안내이며 진단과 약과 치료 내용을 담지 않았다 | - |

### 연습할 말

두 사람이 번갈아 연습할 데이터 본보기다. 본문 줄을 그대로 연결하며 실제 음성과 발화 전 필수 이수는 이 파일로 보장하지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| her-p1 | I've had pain in my stomach since this morning, and it's getting worse. | 증상과 악화 경위 설명 | her-02 | - |
| her-p2 | My stomach started hurting this morning. I need help explaining what happened. | 증상 설명과 언어 도움 요청 | her-03 | - |
| her-p3 | It started around eight, shortly after breakfast; it hasn't stopped since then. | 대략 시각과 지속 설명 | her-05 | - |
| her-p4 | It began after breakfast, but I'm not sure of the exact time. | 시점 설명과 불확실성 표시 | her-06 | - |
| her-p5 | Would it help if I told you what I saw after breakfast? | 관찰 내용 제공 제안 | her-08 | - |
| her-p6 | {A} sat down because of the pain, and we came here together. | 관찰한 행동 순서 설명 | her-12 | - |
| her-p7 | {A} told me the pain was getting worse, so we came here together. | 들은 변화와 이동 경위 설명 | her-13 | - |
| her-p8 | It's still in my stomach, but I can't describe the feeling clearly. | 현재 위치와 표현 한계 설명 | her-15 | - |
| her-p9 | Could you ask me one question at a time so I can explain it? | 질문 방식 조정 요청 | her-16 | - |
| her-p10 | It hurts here. Could you write down what I've told you? | 증상 위치와 기록 요청 | her-19 | - |
| her-p11 | Could you help me with the form while {B} gets my ID? | 양식 작성 도움 요청 | her-23 | - |
| her-p12 | I'm here with {A}, and I have permission to hand you my friend's ID. | 동행자와 서류 전달 권한 설명 | her-26 | - |
| her-p13 | I'm here with {A}. May I hand you my friend's ID? | 동행자 밝히고 서류 전달 허락 요청 | her-27 | - |
| her-p14 | These are my details. Could you read them back so I can check them? | 본인 정보 읽어 확인 요청 | her-30 | - |
| her-p15 | My address needs correcting. Can you help me change this line? | 주소 오류 수정 요청 | her-31 | - |
| her-p16 | So we should wait here and speak to a staff member when they come? | 대기 지시 요약 확인 | her-35 | - |
| her-p17 | Could you repeat where we should wait, please? | 대기 위치 재확인 | her-36 | - |
| her-p18 | While we wait, who should I tell if the pain gets worse? | 변화 전달 대상 질문 | her-38 | - |
| her-p19 | I'd like to report a change in the pain. Who should I speak to? | 변화 보고 의사와 대상 질문 | her-39 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | arrival | her-01 | her-02/her-03 | A |
| t2 | time | her-04 | her-05/her-06 | A |
| t3 | witness | her-10 | her-07/her-08 | B |
| t4 | events | her-11 | her-12/her-13 | B |
| t5 | describe | her-14 | her-15/her-16 | A |
| t6 | location | her-18 | her-19/her-20 | A |
| t7 | registration | her-21 | her-22/her-23 | A |
| n1 | registration | her-24 | - | - |
| t8 | companion | her-25 | her-26/her-27 | B |
| t9 | details | her-29 | her-30/her-31 | A |
| t10 | wait | her-34 | her-35/her-36 | B |
| t11 | change | - | her-38/her-39 | A |
| n2 | change | her-40 | - | - |

## 나들이: hanauma_bay_conservation

작성자: gpt (2026-10-11)
장소: hanauma_bay
세션: 257
목표 등급: B2
할 일: cd-hbc-1 / I can ask about conservation advice, summarize its reasons, and give a considered opinion. / 보호 안내의 이유를 묻고 요약하며 조건을 덧붙여 의견을 말할 수 있다.
허용 이름: -
갈래: hbc-02 > hbc-04, hbc-03 > hbc-04, hbc-06 > hbc-08, hbc-07 > hbc-08, hbc-10 > hbc-11, hbc-14 > hbc-15, hbc-16 > hbc-17, hbc-25 > hbc-27, hbc-26 > hbc-27, hbc-32 > hbc-34

상황: 하나우마에 도착한 뒤 가상 안내자와 보호 안내의 이유를 검토한다. 거리 두기와 물건을 그 자리에 두기, 질문할 직원, 안내를 함께 읽는 절차는 이 대화의 가상 방문 조건이며 실제 환경 규정이나 운영 안내가 아니다. 생물이 살 공간을 그대로 두려는 일반적인 보호 이유만 다루며 거리 수치, 운영 시간, 입수 가능 여부, 특정 생물의 행동을 새로 정하지 않는다.

두 사람은 같은 안내 자리에서 계속 대화한다. 본문에 적힌 짧은 NPC 설명을 듣고 나서 요약한다. 선택에 따라 안내자가 이유를 덧붙이고, 마지막에는 실제 행동을 시작하지 않고 확인 계획을 말한다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| hbc-01 | begin | npc | Guide | Before we begin, what would you like to know? | B1 | 안내 전 질문 받기 | A | - | - |
| hbc-02 | begin | option | A자리 | Could you explain why visitors should keep their distance from sea life? | B2 | 보호 안내의 이유 질문 | B | sea life와 거리 두기 안내의 현지 화용은 사람 검수가 필요하다 | - |
| hbc-03 | begin | option | A자리 | I'd like to understand how our choices affect sea life. | B2 | 설명 초점 요청 | B | 보호 맥락의 affect sea life 연어와 등급은 사람 검수가 필요하다 | - |
| hbc-04 | begin | npc | Guide | Animals need space to feed and rest without being disturbed. | B2 | 일반적인 보호 이유 설명 | B | 일반적인 보호 이유로 제한했지만 안내자의 설명 표현은 사람 검수가 필요하다 | - |
| hbc-05 | reason | npc | Guide | For this visit, please watch from a distance and leave things where you find them. | B2 | 가상 방문 안내 | B | 거리 두기와 물건을 두는 지시는 실제 규정이 아니라 가상 방문 조건이다 | - |
| hbc-06 | reason | option | B자리 | Why does leaving things in place matter? | B1 | 안내 이유 질문 | A | - | - |
| hbc-07 | reason | option | B자리 | Could you explain what you're trying to protect? | B1 | 보호 대상 확인 | A | - | - |
| hbc-08 | reason | npc | Guide | Sea life needs a place to live, so we try to leave that place unchanged. | B2 | 공간을 보존하는 이유 설명 | B | 생물이 살 공간을 두려는 일반적인 이유만 담았으며 설명 표현은 검수가 필요하다 | - |
| hbc-09 | summary | npc | Guide | What is the main point of that explanation? | B1 | 들은 설명 요약 요청 | A | - | - |
| hbc-10 | summary | wait | A자리 | So the idea is to protect sea life by giving it space. | B2 | 보호 이유 요약 | B | by giving it space로 보호 이유를 요약하는 청크와 등급은 검수가 필요하다 | - |
| hbc-11 | summary | npc | Guide | Yes. We want visitors to enjoy the bay without changing it. | B1 | 요약 확인 | B | 가상 안내의 취지를 확인하는 말이며 실제 관리기관의 설명을 대변하지 않는다 | - |
| hbc-12 | opinion | npc | Guide | Would you like to add anything? | B1 | 의견이나 확인 요청 받기 | A | - | - |
| hbc-13 | opinion | option | B자리 | I think the reason matters because people follow advice more carefully when they understand it. | B2 | 이유를 든 의견 | B | 안내 이해와 행동을 연결하는 의견의 표현과 B2 판단은 사람 검수가 필요하다 | - |
| hbc-14 | opinion | option | B자리 | Could you explain the goal before we decide how to act? | B2 | 결정 전 설명 요청 | A | - | - |
| hbc-15 | opinion | npc | Guide | We want people to notice how their actions affect the place. | B2 | 가상 안내의 초점 보충 | B | 가상 안내자의 교육 목적이며 실제 기관의 운영 방침을 대변하지 않는다 | - |
| hbc-16 | staff | wait | A자리 | If we see something unusual, should we ask a member of staff? | B2 | 조건을 둔 확인 질문 | B | a member of staff의 직원 확인 화용은 현장별로 달라 검수가 필요하다 | - |
| hbc-17 | staff | npc | Guide | Please ask us before you act if you're unsure what to do. | B2 | 가상 확인 절차 안내 | B | 안내자에게 먼저 묻는 절차는 실제 운영 규정이 아니라 가상 장면 값이다 | - |
| hbc-18 | explain | npc | Guide | How would you explain the reason to a friend? | B1 | 이유 전달 요청 | A | - | - |
| hbc-19 | explain | option | B자리 | Give sea life space so it can live without our visit changing its home. | B2 | 보호 이유를 동행에게 전달 | B | visit changing its home의 압축된 이유 설명과 등급은 사람 검수가 필요하다 | - |
| hbc-20 | explain | option | B자리 | I'd explain the goal first, then ask what my friend thinks. | B1 | 설명 방법 제안 | A | - | - |
| hbc-21 | discuss | wait | A자리 | What seems most important to you, {B}? | B1 | 동행의 판단 묻기 | A | - | - |
| hbc-22 | discuss | option | B자리 | I support this approach, although I'd like people to have clear explanations. | B2 | 조건을 덧붙인 지지 의견 | B | support this approach의 연어와 양보 의견 청크는 사람 검수가 필요하다 | - |
| hbc-23 | discuss | option | B자리 | I understand the goal, but I'm unsure how to judge each situation. | B2 | 이해와 판단 유보 | B | judge each situation의 보호 맥락 쓰임과 등급은 사람 검수가 필요하다 | - |
| hbc-24 | help | npc | Guide | What would help you make that judgment? | B1 | 판단에 필요한 도움 묻기 | B | make that judgment의 청크와 등급은 사람 검수가 필요하다 | - |
| hbc-25 | help | option | A자리 | A short example would help us connect the advice with our choices. | B2 | 사례 제안 | B | connect the advice with our choices의 연어와 등급은 사람 검수가 필요하다 | - |
| hbc-26 | help | option | A자리 | Could we check our understanding before moving on? | B1 | 이해 확인 요청 | B | moving on의 대화 진행 청크는 사람 검수가 필요하다 | - |
| hbc-27 | help | npc | Guide | For example, watching without moving things leaves the place as you found it. | B2 | 가상 보호 행동의 사례 설명 | B | 물건을 옮기지 않고 보는 가상 예이며 실제 규정이나 행동의 안전을 정하지 않는다 | - |
| hbc-28 | suggest | npc | Guide | What would you suggest for visitors who feel unsure? | B1 | 확인 방법 제안 요청 | A | - | - |
| hbc-29 | suggest | option | B자리 | They could ask staff instead of assuming that a small action makes no difference. | B2 | 직원 확인 제안 | B | instead of assuming의 청크와 보호 맥락의 판단 표현은 검수가 필요하다 | - |
| hbc-30 | suggest | option | B자리 | I'd suggest waiting until they understand what the advice means. | B2 | 행동 전 판단 유보 제안 | A | - | - |
| hbc-31 | finish | npc | Guide | Is there anything you want to check before we finish? | B1 | 마지막 확인 받기 | A | - | - |
| hbc-32 | finish | option | A자리 | I understand the reason, but I'd like to read the guidance before making plans. | B2 | 계획 전 안내 검토 요청 | B | guidance 검토 요청의 화용과 등급은 사람 검수가 필요하다 | - |
| hbc-33 | finish | option | A자리 | No further questions. I think protecting this place is worth a little inconvenience. | B2 | 불편을 고려한 평가 | B | worth a little inconvenience의 가치 평가 청크와 등급은 검수가 필요하다 | - |
| hbc-34 | finish | npc | Guide | We can go over the guidance together before you decide what to do. | B2 | 가상 공동 검토 제안 | B | 안내를 함께 검토하는 절차는 가상 장면 값이며 go over의 청크는 검수가 필요하다 | - |
| hbc-35 | close | option | B자리 | Thanks. We'll check with staff whenever we're uncertain about an action. | B2 | 조건을 둔 확인 계획 | B | whenever와 uncertain about an action의 청크 및 등급은 검수가 필요하다 | - |
| hbc-36 | close | option | B자리 | Thanks. We'll keep the reason in mind when we decide what to do. | B2 | 이유를 고려한 계획 | B | keep the reason in mind의 청크와 등급은 사람 검수가 필요하다 | - |

### 연습할 말

두 사람이 번갈아 연습할 데이터 본보기다. 본문 줄을 그대로 연결하며 필수 선행 이수나 실제 음성 재생을 보장하지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| hbc-p1 | Could you explain why visitors should keep their distance from sea life? | 보호 안내의 이유 질문 | hbc-02 | - |
| hbc-p2 | Why does leaving things in place matter? | 안내 이유 질문 | hbc-06 | - |
| hbc-p3 | So the idea is to protect sea life by giving it space. | 보호 이유 요약 | hbc-10 | - |
| hbc-p4 | I think the reason matters because people follow advice more carefully when they understand it. | 이유를 든 의견 | hbc-13 | - |
| hbc-p5 | Could you explain the goal before we decide how to act? | 결정 전 설명 요청 | hbc-14 | - |
| hbc-p6 | If we see something unusual, should we ask a member of staff? | 조건을 둔 확인 질문 | hbc-16 | - |
| hbc-p7 | I'd explain the goal first, then ask what my friend thinks. | 설명 방법 제안 | hbc-20 | - |
| hbc-p8 | I support this approach, although I'd like people to have clear explanations. | 조건을 덧붙인 지지 의견 | hbc-22 | - |
| hbc-p9 | Could we check our understanding before moving on? | 이해 확인 요청 | hbc-26 | - |
| hbc-p10 | They could ask staff instead of assuming that a small action makes no difference. | 직원 확인 제안 | hbc-29 | - |
| hbc-p11 | No further questions. I think protecting this place is worth a little inconvenience. | 불편을 고려한 평가 | hbc-33 | - |
| hbc-p12 | Thanks. We'll keep the reason in mind when we decide what to do. | 이유를 고려한 계획 | hbc-36 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | begin | hbc-01 | hbc-02/hbc-03 | A |
| t2 | reason | hbc-05 | hbc-06/hbc-07 | B |
| t3 | summary | hbc-09 | hbc-10 | A |
| t4 | opinion | hbc-12 | hbc-13/hbc-14 | B |
| t5 | staff | - | hbc-16 | A |
| t6 | explain | hbc-18 | hbc-19/hbc-20 | B |
| t7 | discuss | - | hbc-21 | A |
| t8 | discuss | - | hbc-22/hbc-23 | B |
| t9 | help | hbc-24 | hbc-25/hbc-26 | A |
| t10 | suggest | hbc-28 | hbc-29/hbc-30 | B |
| t11 | finish | hbc-31 | hbc-32/hbc-33 | A |
| t12 | close | - | hbc-35/hbc-36 | B |

## 나들이: kamehameha_day

작성자: gpt (2026-10-11)
장소: kamehameha_statue
세션: 263
목표 등급: B2
할 일: cd-kmd-1 / I can understand a visit plan, weigh its benefits, and ask how to join a discussion politely. / 행사 방문 안내를 이해하고 장점을 따져 의견을 말하며 대화에 예의 있게 참여하는 법을 물을 수 있다.
허용 이름: Kamehameha
갈래: kmd-02 > kmd-04, kmd-03 > kmd-04, kmd-06 > kmd-08, kmd-07 > kmd-08, kmd-10 > kmd-12, kmd-11 > kmd-12, kmd-20 > kmd-22, kmd-21 > kmd-22, kmd-25 > kmd-26

상황: 카메하메하 대왕의 날 행사를 배경으로 도착한 두 사람이 가상 방문 안내자의 설명을 듣는 연습이다. 짧은 이야기 뒤 질문 시간을 갖는 순서, 안내자가 질문을 받는 방식과 듣는 예절은 이 집단의 가상 진행 설명이다. 실제 행사 날짜나 현장 규칙, 왕의 업적, 의례와 역사 설명을 새로 만들지 않는다. Kamehameha는 culture.md 5.1에 있는 고유 이름의 철자이며 여기서는 행사와 장소의 식별에만 쓴다. 일반 낱말의 등급을 면제하는 이름으로 쓰지 않는다.

듣기 대상은 본문에 실제로 적힌 짧은 방문 안내다. 역사 강연을 들었다고 가정해 요약하지 않는다. 대화 전체는 이야기를 기다리는 안내 자리에서 이루어지고, 마지막 두 차례도 앞으로 듣고 생각할 계획을 말한다. 두 사람의 의견이 달라도 다음 질문은 그 의견의 이유를 묻는 열린 질문으로 이어진다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| kmd-01 | begin | npc | Guide | What would you like to know before the talk begins? | B1 | 안내 전 질문 받기 | A | - | - |
| kmd-02 | begin | option | A자리 | Could you explain what will happen during this visit? | B1 | 진행 설명 요청 | A | - | - |
| kmd-03 | begin | option | A자리 | I'd like to know when visitors can ask questions. | B1 | 질문 가능 시점 확인 | A | - | - |
| kmd-04 | begin | npc | Guide | We'll hear a short talk first, then there will be time for questions. | B2 | 가상 진행 순서 설명 | B | 짧은 이야기와 질문 시간의 순서는 실제 행사 일정이 아니라 가상 진행 설명이다 | - |
| kmd-05 | etiquette | npc | Guide | Please let the speaker finish before asking a question. | B1 | 가상 대화 예절 안내 | B | 이야기 뒤 질문하는 방식은 실제 행사 규칙이 아니라 이 집단의 가상 안내다 | - |
| kmd-06 | etiquette | option | B자리 | Is that to help everyone follow the talk without interruptions? | B2 | 예절 안내의 이유 확인 | B | follow the talk without interruptions의 연어와 등급은 사람 검수가 필요하다 | - |
| kmd-07 | etiquette | option | B자리 | Could you explain why you're asking us to wait? | B1 | 예절 안내의 이유 질문 | A | - | - |
| kmd-08 | etiquette | npc | Guide | Waiting lets everyone hear the full explanation before we discuss it. | B2 | 가상 안내의 이유 설명 | A | - | - |
| kmd-09 | summary | npc | Guide | How would you describe the plan in your own words? | B1 | 들은 진행 설명 요약 요청 | A | - | - |
| kmd-10 | summary | option | A자리 | We'll listen first and ask questions afterward, so we don't miss the speaker's point. | B2 | 진행과 이유 요약 | B | afterward와 speaker's point의 요약 청크 및 등급은 사람 검수가 필요하다 | - |
| kmd-11 | summary | option | A자리 | The plan puts listening before questions. Have I understood the order correctly? | B2 | 요약을 통한 이해 확인 | B | puts listening before questions의 청크와 등급은 사람 검수가 필요하다 | - |
| kmd-12 | summary | npc | Guide | That's right. The question period comes after the talk. | B1 | 요약 확인 | B | question period의 연어와 등급은 검수가 필요하며 순서는 가상 장면 값이다 | - |
| kmd-13 | opinion | npc | Guide | What do you think of that plan? | B1 | 진행 방식에 대한 의견 받기 | A | - | - |
| kmd-14 | opinion | option | B자리 | I appreciate having time for questions, but I'd prefer a brief introduction. | B2 | 장점과 선호를 함께 말하기 | B | appreciate having과 brief introduction의 연어 및 등급은 사람 검수가 필요하다 | - |
| kmd-15 | opinion | option | B자리 | I support listening first, provided there's time to ask about unclear points. | B2 | 조건을 둔 지지 의견 | B | provided there's time의 조건 청크와 등급은 사람 검수가 필요하다 | - |
| kmd-16 | discuss | wait | A자리 | What would help you get more from the talk, {B}? | B1 | 동행에게 필요한 도움 묻기 | B | get more from the talk의 청크와 등급은 사람 검수가 필요하다 | - |
| kmd-17 | discuss | option | B자리 | A little background would help me understand why people care about this day. | B2 | 배경 설명의 필요 말하기 | B | background와 care about this day의 표현 및 등급은 사람 검수가 필요하다 | - |
| kmd-18 | discuss | option | B자리 | I'd rather hear the whole talk before deciding what to ask. | B2 | 듣기 전 판단 유보 | A | - | - |
| kmd-19 | participate | npc | Guide | We have a moment before the talk. Any final questions? | B1 | 안내 중 마지막 질문 받기 | A | - | - |
| kmd-20 | participate | option | A자리 | Could you tell us how to ask something without interrupting the group? | B2 | 참여 방법 질문 | B | without interrupting의 대화 참여 화용은 현지 사람 검수가 필요하다 | - |
| kmd-21 | participate | option | A자리 | Would it be better to save our questions until the talk ends? | B2 | 참여 방법 제안과 확인 | A | - | - |
| kmd-22 | participate | npc | Guide | Please wait until I invite questions, and then give others a turn too. | B2 | 가상 참여 순서 안내 | B | 안내자가 질문을 받는 순서와 발언 기회는 실제 행사 규칙이 아니라 가상 안내다 | - |
| kmd-23 | reason | npc | Guide | What is the main reason for waiting to ask questions? | B1 | 안내 이유 요약 요청 | A | - | - |
| kmd-24 | reason | option | B자리 | It helps everyone hear the full explanation before sharing their own views. | B2 | 듣는 예절의 이유 요약 | A | - | - |
| kmd-25 | reason | option | B자리 | I understand the order, but could you confirm who invites questions? | B2 | 이해와 진행 담당자 확인 | A | - | - |
| kmd-26 | reason | npc | Guide | I'll invite questions when the speaker has finished. | B1 | 가상 진행 담당자 확인 | B | 질문을 받는 담당자와 시점은 실제 행사 운영이 아니라 가상 진행 설명이다 | - |
| kmd-27 | suggest | npc | Guide | How would you respond if your friend wanted to speak early? | B1 | 가정 상황의 대응 묻기 | A | - | - |
| kmd-28 | suggest | option | A자리 | I'd suggest waiting because everyone should have a chance to hear the full explanation. | B2 | 이유를 든 기다림 제안 | B | 행사 듣기 상황에서의 제안 강도와 화용은 사람 검수가 필요하다 | - |
| kmd-29 | suggest | option | A자리 | I'd note the question so my friend could ask it at the right time. | B2 | 질문을 보관하는 방법 제안 | B | note the question의 기록 동사 쓰임과 등급은 사람 검수가 필요하다 | - |
| kmd-30 | reflect | npc | Guide | What do you want to remember from this guidance? | B1 | 안내를 바탕으로 생각 받기 | A | - | - |
| kmd-31 | reflect | option | B자리 | I'd like to balance my wish to ask questions with other people's chance to listen. | B2 | 상반된 필요를 고려한 의견 | B | balance my wish with의 청크와 B2 판단은 사람 검수가 필요하다 | - |
| kmd-32 | reflect | option | B자리 | I don't want to assume that being interested gives me the right to interrupt. | B2 | 관심과 발언 권한을 구분하기 | B | gives me the right to interrupt의 화용과 등급은 사람 검수가 필요하다 | - |
| kmd-33 | close | wait | A자리 | Shall we wait for the talk and compare our thoughts afterward, {B}? | B2 | 듣고 생각을 나눌 계획 제안 | B | compare our thoughts의 청크와 등급은 사람 검수가 필요하다 | - |
| kmd-34 | close | option | B자리 | Yes. Hearing the whole talk should give us more to discuss. | B2 | 제안 수락과 기대 설명 | A | - | - |
| kmd-35 | close | option | B자리 | Let's listen first. I'd like some time to think before discussing it. | B2 | 수락과 생각할 시간 요청 | A | - | - |

### 연습할 말

두 사람이 번갈아 연습할 데이터 본보기다. 본문 줄을 그대로 연결하며 필수 선행 이수나 실제 음성 재생을 보장하지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| kmd-p1 | Could you explain what will happen during this visit? | 진행 설명 요청 | kmd-02 | - |
| kmd-p2 | Is that to help everyone follow the talk without interruptions? | 예절 안내의 이유 확인 | kmd-06 | - |
| kmd-p3 | We'll listen first and ask questions afterward, so we don't miss the speaker's point. | 진행과 이유 요약 | kmd-10 | - |
| kmd-p4 | The plan puts listening before questions. Have I understood the order correctly? | 요약을 통한 이해 확인 | kmd-11 | - |
| kmd-p5 | I appreciate having time for questions, but I'd prefer a brief introduction. | 장점과 선호를 함께 말하기 | kmd-14 | - |
| kmd-p6 | I support listening first, provided there's time to ask about unclear points. | 조건을 둔 지지 의견 | kmd-15 | - |
| kmd-p7 | What would help you get more from the talk, {B}? | 동행에게 필요한 도움 묻기 | kmd-16 | - |
| kmd-p8 | I'd rather hear the whole talk before deciding what to ask. | 듣기 전 판단 유보 | kmd-18 | - |
| kmd-p9 | Could you tell us how to ask something without interrupting the group? | 참여 방법 질문 | kmd-20 | - |
| kmd-p10 | I understand the order, but could you confirm who invites questions? | 이해와 진행 담당자 확인 | kmd-25 | - |
| kmd-p11 | I'd like to balance my wish to ask questions with other people's chance to listen. | 상반된 필요를 고려한 의견 | kmd-31 | - |
| kmd-p12 | Let's listen first. I'd like some time to think before discussing it. | 수락과 생각할 시간 요청 | kmd-35 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | begin | kmd-01 | kmd-02/kmd-03 | A |
| t2 | etiquette | kmd-05 | kmd-06/kmd-07 | B |
| t3 | summary | kmd-09 | kmd-10/kmd-11 | A |
| t4 | opinion | kmd-13 | kmd-14/kmd-15 | B |
| t5 | discuss | - | kmd-16 | A |
| t6 | discuss | - | kmd-17/kmd-18 | B |
| t7 | participate | kmd-19 | kmd-20/kmd-21 | A |
| t8 | reason | kmd-23 | kmd-24/kmd-25 | B |
| t9 | suggest | kmd-27 | kmd-28/kmd-29 | A |
| t10 | reflect | kmd-30 | kmd-31/kmd-32 | B |
| t11 | close | - | kmd-33 | A |
| t12 | close | - | kmd-34/kmd-35 | B |

## 나들이: kailua_lanikai_day

작성자: gpt (2026-10-11)
장소: lanikai_beach
세션: 269
목표 등급: B2
할 일: cd-kld-1 / I can plan a beach day, divide the packing, and agree on a flexible schedule. / 해변 하루 일정을 정하고 장비와 간식 준비를 나누며 조건을 붙여 합의할 수 있다.
허용 이름: -
갈래: -

상황: 라니카이 해변을 배경으로 두 사람이 가상의 안내자와 하루 계획을 세우는 학습용 장면이다. 안내자가 있는 계획 자리, 음식과 물품 목록, 오전 휴식과 점심 뒤 오후 산책의 순서는 모두 가상 장면 값이다. 실제 안내 서비스, 시설, 입수 가능 여부, 안전 조건, 이동 시간, 운영 시각, 예약, 요금이나 날씨를 확인한 정보가 아니다. 대사에는 실제 장소의 수치나 규칙을 정하지 않는다.

두 사람이 과일과 샌드위치를 준비하기로 정하고 물, 수건, 모자와 자외선 차단제를 나누어 챙기는 계획을 말한다. 이 목록은 실제 활동에 충분한 장비나 안전을 보증하지 않는다. 여행 시간과 현장 조건 확인은 마지막까지 남은 일이다. 오전 휴식, 점심, 오후 산책이라는 순서를 계획하되 산책 여부는 점심 뒤 다시 정하며, 끝에서도 출발 시각을 확정하거나 출발을 실행하지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| kld-01 | wishes | npc | Guide | What do you want from your day at the beach? | B1 | 하루 목표 묻기 | A | - | - |
| kld-02 | wishes | option | A자리 | I'd like a quiet morning, with time for lunch and a walk. | B1 | 원하는 하루 설명 | A | - | - |
| kld-03 | wishes | option | A자리 | Before we decide, could we compare the activities we both want? | B2 | 결정 전 비교 요청 | A | - | - |
| kld-04 | compare | npc | Guide | First, let's compare a walk, lunch, and a quiet break. | B1 | 비교할 활동 정리 | A | - | - |
| kld-05 | flexibility | option | B자리 | Let's leave the afternoon open in case either of us needs a rest. | B2 | 필요에 따른 여유 제안 | B | leave open과 in case의 결합 난이도와 계획 협의 화용은 사람 검수 전이다 | - |
| kld-06 | flexibility | option | B자리 | Could we keep the plan flexible instead of filling every hour? | B2 | 일정 부담 완화 요청 | B | flexible의 계획 용법과 요청 말투의 실제 사용 빈도는 검증하지 않았다 | - |
| kld-07 | timing | npc | Guide | What should we check before we choose a time? | B1 | 일정 확정 전 확인 묻기 | A | - | - |
| kld-08 | timing | option | A자리 | We should check travel time and today's conditions before fixing our schedule. | B2 | 확인할 조건 설명 | B | 조건과 일정 확정에 관한 표현의 등급 경계는 사람 검수 전이다 | - |
| kld-09 | timing | option | A자리 | Could we plan lunch first and choose our departure time later? | B2 | 계획 순서 조정 요청 | A | - | - |
| kld-10 | food_start | npc | Guide | Let's plan the food and gear before we choose when to leave. | B2 | 시간 유보와 준비 안내 | A | - | - |
| kld-11 | lunch_question | wait | A자리 | Would you rather pack a light lunch or buy food later, {B}? | B1 | 동행의 식사 선호 묻기 | B | light lunch와 would rather의 결합 등급은 사람 검수 전이다 | - |
| kld-12 | lunch_choice | option | B자리 | I'd rather bring sandwiches so we don't depend on finding a shop. | B2 | 준비 선호와 이유 설명 | A | - | - |
| kld-13 | lunch_choice | option | B자리 | Could we bring fruit now and decide about lunch before we leave? | B2 | 간식 제안과 점심 결정 유보 | A | - | - |
| kld-14 | food_agreement | option | A자리 | Let's bring fruit and sandwiches, so we won't need to look for food. | B2 | 점심과 간식 확정 제안 | A | - | - |
| kld-15 | food_agreement | option | A자리 | I can pack fruit and sandwiches. Would you take care of the water? | B2 | 준비 분담 요청 | B | take care of의 준비 분담 용법과 등급은 사람 검수 전이다 | - |
| kld-16 | gear | option | B자리 | I'll bring water and towels, but I'd like to keep the bags light. | B2 | 준비 수락과 부담 조건 | A | - | - |
| kld-17 | gear | option | B자리 | I can bring water and towels. Do we need anything else for the sun? | B2 | 준비 수락과 추가 물품 질문 | A | - | - |
| kld-18 | sun_items | npc | Guide | Think about hats and sunscreen before you finish packing. | B1 | 가상 물품 검토 안내 | B | 물품 제안은 가상 준비 목록이며 실제 활동에 충분한 장비를 확인한 안내가 아니다 | - |
| kld-19 | packing | option | A자리 | I'll add hats and sunscreen. We can leave anything we won't use at home. | B2 | 추가 준비와 짐 줄이기 제안 | A | - | - |
| kld-20 | packing | option | A자리 | Could you check the hats while I add sunscreen to the bag? | B2 | 물품 확인 역할 나누기 | A | - | - |
| kld-21 | bag_check | npc | Guide | Check the bag together before you leave. | A2 | 함께 확인할 행동 안내 | A | - | - |
| kld-22 | day_order | npc | Guide | How will you fit the activities around lunch? | B1 | 점심을 기준으로 순서 묻기 | B | fit around의 일정 용법과 난이도 경계는 사람 검수 전이다 | - |
| kld-23 | day_order | option | A자리 | Let's relax in the morning, eat lunch, and leave the walk for the afternoon. | B2 | 하루 활동 순서 제안 | A | - | - |
| kld-24 | day_order | option | A자리 | Could we put lunch between a morning break and an afternoon walk? | B2 | 활동 순서 합의 요청 | A | - | - |
| kld-25 | order_agreement | npc | Guide | That order works. We can still keep the plan flexible. | B1 | 제안 순서와 유연성 확인 | A | - | - |
| kld-26 | walk_decision | option | B자리 | If we feel tired after lunch, let's skip the walk and rest instead. | B2 | 피곤할 때 계획 조정 제안 | A | - | - |
| kld-27 | walk_decision | option | B자리 | Could we decide about the walk after lunch rather than promise to do everything? | B2 | 산책 결정 유보 요청 | A | - | - |
| kld-28 | remaining | npc | Guide | What needs to be settled before you leave? | B1 | 남은 결정 묻기 | B | settled의 계획 결정 용법과 등급은 사람 검수 전이다 | - |
| kld-29 | remaining | option | A자리 | We still need to check travel times and conditions before we choose when to leave. | B2 | 남은 확인과 출발 조건 설명 | A | - | - |
| kld-30 | remaining | option | A자리 | Could we write down the remaining checks so neither of us forgets them? | B2 | 확인 목록 기록 요청 | B | remaining checks와 neither of us의 결합 등급은 사람 검수 전이다 | - |
| kld-31 | check_list | npc | Guide | Check travel times and conditions, then choose when to leave. | B1 | 남은 확인 순서 정리 | B | 일반형 준비 확인이며 실제 교통이나 현장 조건을 확인한 안내가 아니다 | - |
| kld-32 | summary | option | B자리 | So we have a plan for food and gear; the departure time is still open. | B2 | 합의와 유보 사항 요약 | B | gear와 departure의 계획 용법과 출발 시각을 열어 두는 표현은 사람 검수 전이다 | - |
| kld-33 | summary | option | B자리 | I agree with that plan. Let's confirm the remaining details before we leave. | B2 | 조건을 남긴 최종 동의 | A | - | - |
| kld-34 | end | npc | Guide | You can keep planning here until those details are clear. | B1 | 확인 전 계획 지속 안내 | B | 계획을 이어 가는 자리는 가상 장면 값이며 실제 현장 서비스가 아니다 | - |

### 연습할 말

두 사람이 번갈아 연습할 데이터 본보기다. 본문 줄을 그대로 연결하며 실제 음성 재생이나 발화 전 필수 이수를 보장하지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| kld-p1 | Before we decide, could we compare the activities we both want? | 결정 전 비교 요청 | kld-03 | - |
| kld-p2 | Let's leave the afternoon open in case either of us needs a rest. | 필요에 따른 여유 제안 | kld-05 | - |
| kld-p3 | We should check travel time and today's conditions before fixing our schedule. | 확인할 조건 설명 | kld-08 | - |
| kld-p4 | Would you rather pack a light lunch or buy food later, {B}? | 동행의 식사 선호 묻기 | kld-11 | - |
| kld-p5 | I'd rather bring sandwiches so we don't depend on finding a shop. | 준비 선호와 이유 설명 | kld-12 | - |
| kld-p6 | I can pack fruit and sandwiches. Would you take care of the water? | 준비 분담 요청 | kld-15 | - |
| kld-p7 | I'll bring water and towels, but I'd like to keep the bags light. | 준비 수락과 부담 조건 | kld-16 | - |
| kld-p8 | Could you check the hats while I add sunscreen to the bag? | 물품 확인 역할 나누기 | kld-20 | - |
| kld-p9 | Could we decide about the walk after lunch rather than promise to do everything? | 산책 결정 유보 요청 | kld-27 | - |
| kld-p10 | So we have a plan for food and gear; the departure time is still open. | 합의와 유보 사항 요약 | kld-32 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | wishes | kld-01 | kld-02/kld-03 | A |
| n1 | compare | kld-04 | - | - |
| t2 | flexibility | - | kld-05/kld-06 | B |
| t3 | timing | kld-07 | kld-08/kld-09 | A |
| n2 | food_start | kld-10 | - | - |
| t4 | lunch_question | - | kld-11 | A |
| t5 | lunch_choice | - | kld-12/kld-13 | B |
| t6 | food_agreement | - | kld-14/kld-15 | A |
| t7 | gear | - | kld-16/kld-17 | B |
| n3 | sun_items | kld-18 | - | - |
| t8 | packing | - | kld-19/kld-20 | A |
| n4 | bag_check | kld-21 | - | - |
| t9 | day_order | kld-22 | kld-23/kld-24 | A |
| n5 | order_agreement | kld-25 | - | - |
| t10 | walk_decision | - | kld-26/kld-27 | B |
| t11 | remaining | kld-28 | kld-29/kld-30 | A |
| n6 | check_list | kld-31 | - | - |
| t12 | summary | - | kld-32/kld-33 | B |
| n7 | end | kld-34 | - | - |

## 나들이: dukes_celebration

작성자: gpt (2026-10-11)
장소: dukes_waikiki
세션: 275
목표 등급: B2
할 일: cd-dcl-1 / I can book a celebration dinner, change the time, and discuss seating requests. / 기념일 저녁을 예약하고 시간을 바꾸며 자리 요청을 협의할 수 있다.
허용 이름: -
갈래: dcl-04 > dcl-06, dcl-05 > dcl-07, dcl-09 > dcl-10, dcl-14 > dcl-15, dcl-17 > dcl-19, dcl-18 > dcl-19, dcl-25 > dcl-27, dcl-26 > dcl-27, dcl-28 > dcl-30, dcl-29 > dcl-30, dcl-33 > dcl-35, dcl-34 > dcl-35

상황: 듀크스 와이키키를 배경으로 한 가상 예약과 방문이다. 두 사람은 기념일 저녁을 다음 날 여섯 시로 예약한 뒤 B의 퇴근 시간을 듣고 같은 이름으로 일곱 시로 변경한다. 시간 변경 가능 여부, 기념일 메모, 자리 요청 기록과 현장 이동은 모두 학습용 장면값이며 실제 매장의 정책이나 예약 가능 시간을 확인한 정보가 아니다. 창가와 조용한 자리 요청은 보장하지 않는다. t7 뒤 다음 날 일곱 시에 도착하는 장면으로 옮기며 예약이 현실에서 실행됐다고 처리하지 않는다. t9의 문 근처 자리에서 다른 안쪽 자리를 보고 두 사람이 함께 선택한다. 음식 주문 전 메뉴를 받는 데서 끝나며 유보나 취소 뒤 자동 주문은 없다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| dcl-01 | book | npc | Host | How can I help you with your reservation? | B1 | 예약 용건 묻기 | A | - | - |
| dcl-02 | book | wait | A자리 | I'd like a table for two tomorrow at six. | A2 | 날짜 시간 인원 밝히며 예약 요청 | A | - | - |
| dcl-03 | occasion | npc | Host | Is this for a special occasion? | A2 | 기념할 일 묻기 | A | - | - |
| dcl-04 | occasion | option | B자리 | We're celebrating our anniversary. Could you add a note? | B1 | 기념일 알리고 예약 메모 요청 | B | 기념일 메모 요청의 현지 화용과 anniversary의 등급은 사람 검수가 필요하다 | - |
| dcl-05 | occasion | option | B자리 | It's our anniversary, but we'd prefer a quiet dinner. | B1 | 기념일과 식사 분위기 선호 설명 | A | - | - |
| dcl-06 | occasion | npc | Host | I'll add an anniversary note. | B1 | 기념일 메모 기록 계획 | B | 기념일 메모를 기록하는 절차는 실제 매장 정책이 아니라 가상 장면값이다 | - |
| dcl-07 | occasion | npc | Host | I'll note that you prefer a quiet dinner. | B1 | 분위기 선호 기록 계획 | B | 조용한 식사 선호를 기록하는 절차는 실제 매장 정책이 아니라 가상 장면값이다 | - |
| dcl-08 | name | npc | Host | May I have a name for the reservation? | A2 | 예약자 이름 요청 | A | - | - |
| dcl-09 | name | wait | A자리 | Please put it under {A}. Can you confirm the time? | B1 | 예약 이름 전하고 시간 확인 요청 | A | - | - |
| dcl-10 | name | npc | Host | It's for two tomorrow at six, under {A}. | A2 | 시간 인원 이름 확인 | A | - | - |
| dcl-11 | plan | wait | A자리 | Does six still work for you, {B}? | B1 | 동행에게 일정 재확인 | B | 시간이 괜찮은지 묻는 work for의 연어와 난이도는 사람 검수가 필요하다 | - |
| dcl-12 | change_reason | wait | B자리 | Actually, could we make it seven? I finish work at six. | B1 | 변경 제안과 이유 설명 | A | - | - |
| dcl-13 | change | npc | Host | Seven is available. Would you like to change the reservation? | B1 | 변경 가능 시간과 의사 확인 | B | 일곱 시 예약 가능 여부는 실제 예약 현황이 아니라 가상 장면값이다 | - |
| dcl-14 | change | wait | A자리 | Yes, please move it to seven, under the same name. | B1 | 이름 유지하며 시간 변경 확정 | A | - | - |
| dcl-15 | change | npc | Host | Your reservation is now for two at seven, under the same name. | B1 | 변경된 예약 내용 요약 | B | 예약 변경 완료는 학습용 장면값이며 현실 예약의 이행을 보증하지 않는다 | - |
| dcl-16 | request | npc | Host | Would you like to request a table near the window? | B1 | 자리 요청 의사 묻기 | A | - | - |
| dcl-17 | request | option | B자리 | Yes, if possible. We'd like to sit near the window. | B1 | 가능 여부를 배려하며 창가 요청 | A | - | - |
| dcl-18 | request | option | B자리 | A quieter table matters more to us than the view. | B2 | 자리 선택에서 우선순위 설명 | B | 선호의 우선순위를 말하는 matters more의 연어와 난이도는 사람 검수가 필요하다 | - |
| dcl-19 | request | npc | Host | I'll note your preference, but I can't promise a particular table. | B2 | 요청 기록과 보장 한계 설명 | B | 자리 요청 기록과 보장 한계는 실제 매장 정책이 아니라 가상 장면값이다 | - |
| dcl-20 | arrive | npc | Host | Good evening. Do you have a reservation? | A2 | 예약 방문 확인 | A | - | - |
| dcl-21 | arrive | option | A자리 | Yes, for two at seven, under {A}. | A2 | 변경된 예약으로 방문 확인 | A | - | - |
| dcl-22 | arrive | option | A자리 | We have a reservation under {A}. Is our table ready? | B1 | 예약 확인과 준비 상태 묻기 | A | - | - |
| dcl-23 | arrive | npc | Host | Your table is ready. Please come with me. | A2 | 준비된 자리로 안내 | B | 예약 시간의 자리 준비 상태는 실제 매장 정보가 아니라 가상 장면값이다 | - |
| dcl-24 | seat | npc | Host | This is the table we have available. | A2 | 현재 가능한 자리 소개 | B | 문 근처 자리의 제공 가능 여부는 실제 매장 정보가 아니라 가상 장면값이다 | - |
| dcl-25 | seat | option | B자리 | Could we sit somewhere quieter, if another table is open? | B2 | 가능한 범위에서 조용한 자리 요청 | B | 현장에서 조건을 붙여 자리 변경을 요청하는 화용은 사람 검수가 필요하다 | - |
| dcl-26 | seat | option | B자리 | Could we move away from the door? It's quite busy here. | B1 | 관찰한 이유를 밝혀 자리 변경 요청 | A | - | - |
| dcl-27 | seat | npc | Host | There is another table inside. Would you like to see it? | B1 | 다른 자리 제안 | B | 안쪽에 다른 자리가 있다는 안내는 실제 매장 배치가 아니라 가상 장면값이다 | - |
| dcl-28 | look | option | A자리 | Yes, let's look at that table before we decide. | B1 | 결정 전 다른 자리 보기 제안 | A | - | - |
| dcl-29 | look | option | A자리 | Could you show us how far it is from the door? | B1 | 다른 자리의 위치 확인 요청 | A | - | - |
| dcl-30 | look | npc | Host | It's farther from the door. Please follow me. | B1 | 거리 설명과 자리 이동 안내 | B | 문에서 더 먼 자리라는 설명과 이동 절차는 가상 장면값이다 | - |
| dcl-31 | compare | npc | Host | Please take a look before you decide where to sit. | B1 | 관찰 후 선택 권하기 | A | - | - |
| dcl-32 | compare | wait | A자리 | Would this table work better for us, {B}? | B1 | 동행에게 대안 평가 묻기 | B | 대안이 더 나은지 묻는 work better의 연어와 난이도는 사람 검수가 필요하다 | - |
| dcl-33 | agree | option | B자리 | Yes, let's take this one. Thank you for helping. | B1 | 자리 합의와 감사 | A | - | - |
| dcl-34 | agree | option | B자리 | It seems quieter here, so I'd prefer this table. | B1 | 관찰한 이유에 따라 자리 선택 | A | - | - |
| dcl-35 | agree | npc | Host | I'll note your choice and bring your menus. | B1 | 자리 선택 기록과 메뉴 제공 계획 | B | 자리 선택 기록과 메뉴 제공은 실제 매장 절차가 아니라 가상 장면값이다 | - |

### 연습할 말

두 사람이 번갈아 연습하는 본보기 데이터다. 본문 줄을 그대로 연결하며 실제 소리 재생과 발화 전 필수 이수를 이 표로 보장하지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| dcl-p1 | I'd like a table for two tomorrow at six. | 날짜 시간 인원 밝히며 예약 요청 | dcl-02 | - |
| dcl-p2 | We're celebrating our anniversary. Could you add a note? | 기념일 알리고 예약 메모 요청 | dcl-04 | - |
| dcl-p3 | It's our anniversary, but we'd prefer a quiet dinner. | 기념일과 식사 분위기 선호 설명 | dcl-05 | - |
| dcl-p4 | Please put it under {A}. Can you confirm the time? | 예약 이름 전하고 시간 확인 요청 | dcl-09 | - |
| dcl-p5 | Does six still work for you, {B}? | 동행에게 일정 재확인 | dcl-11 | - |
| dcl-p6 | Actually, could we make it seven? I finish work at six. | 변경 제안과 이유 설명 | dcl-12 | - |
| dcl-p7 | Yes, please move it to seven, under the same name. | 이름 유지하며 시간 변경 확정 | dcl-14 | - |
| dcl-p8 | Yes, if possible. We'd like to sit near the window. | 가능 여부를 배려하며 창가 요청 | dcl-17 | - |
| dcl-p9 | A quieter table matters more to us than the view. | 자리 선택에서 우선순위 설명 | dcl-18 | - |
| dcl-p10 | We have a reservation under {A}. Is our table ready? | 예약 확인과 준비 상태 묻기 | dcl-22 | - |
| dcl-p11 | Could we sit somewhere quieter, if another table is open? | 가능한 범위에서 조용한 자리 요청 | dcl-25 | - |
| dcl-p12 | Yes, let's look at that table before we decide. | 결정 전 다른 자리 보기 제안 | dcl-28 | - |
| dcl-p13 | Would this table work better for us, {B}? | 동행에게 대안 평가 묻기 | dcl-32 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | book | dcl-01 | dcl-02 | A |
| t2 | occasion | dcl-03 | dcl-04/dcl-05 | B |
| t3 | name | dcl-08 | dcl-09 | A |
| t4 | plan | - | dcl-11 | A |
| t5 | change_reason | - | dcl-12 | B |
| t6 | change | dcl-13 | dcl-14 | A |
| t7 | request | dcl-16 | dcl-17/dcl-18 | B |
| t8 | arrive | dcl-20 | dcl-21/dcl-22 | A |
| n1 | arrive | dcl-23 | - | - |
| t9 | seat | dcl-24 | dcl-25/dcl-26 | B |
| t10 | look | - | dcl-28/dcl-29 | A |
| t11 | compare | dcl-31 | dcl-32 | A |
| t12 | agree | - | dcl-33/dcl-34 | B |

## 나들이: ala_moana_gift_shopping

작성자: gpt (2026-10-11)
장소: ala_moana_center
세션: 281
목표 등급: B2
할 일: cd-ags-1 / I can ask for gift advice, compare choices, and request wrapping and shipping. / 선물 조언을 구하고 선택지를 비교하며 포장과 배송을 요청할 수 있다.
허용 이름: -
갈래: ags-04 > ags-06, ags-05 > ags-06, ags-08 > ags-10, ags-09 > ags-11, ags-16 > ags-17, ags-20 > ags-22, ags-21 > ags-22, ags-24 > ags-26, ags-25 > ags-27, ags-31 > ags-33, ags-32 > ags-34

상황: 알라모아나 센터의 이름 없는 가게에서 선물을 고르는 가상 장면이다. 가방 두 개의 크기·수납·관리·가격 비교, 상자 포장과 가격 표시 제거, 배송 가능 여부와 절차는 모두 학습용 장면값이며 특정 실제 점포의 상품이나 정책을 확인한 정보가 아니다. A자리의 자매에게 줄 선물이며 B는 A가 말한 취향을 함께 설명한다. t3에서 보여 달라는 선택을 하면 직원이 두 가방을 열어 보여 준 다음 동행 대화로 넘어간다. t6에서 가격만 물어도 t7에서 A가 작은 가방을 명시적으로 선택한다. 포장은 계획으로만 요청하며 결제 전에 구매나 배송이 끝났다고 하지 않는다. t10에서 B가 주소를 적고 두 사람과 직원이 주소를 확인한 다음 t11로 넘어간다. 작은 가방 이십 달러·상자 이 달러·배송 팔 달러로 합계 삼십 달러, 예상 배송 약 닷새는 모두 가상 견적값이며 실제 요금이나 도착 보증이 아니다. t12는 확인한 주소로 보내 달라는 승인, t13은 합의한 합계를 검토한 뒤 결제 수단을 말하는 단계다. 실제 결제·발송·도착을 자동으로 보증하지 않는다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| ags-01 | gift | npc | Clerk | What kind of gift are you looking for? | A2 | 선물 목적 묻기 | A | - | - |
| ags-02 | gift | wait | A자리 | I'd like a gift for my sister that's easy to pack. | B1 | 받는 사람과 선물 조건 설명 | A | - | - |
| ags-03 | advice | npc | Clerk | What does she like? | A1 | 받는 사람 취향 묻기 | A | - | - |
| ags-04 | advice | option | B자리 | She likes simple bags. What would you suggest? | B1 | 취향을 전하고 조언 구하기 | A | - | - |
| ags-05 | advice | option | B자리 | She travels often, so we're looking for something useful. | B1 | 생활 습관을 근거로 조건 설명 | A | - | - |
| ags-06 | advice | npc | Clerk | These two bags might work. One is smaller than the other. | B1 | 두 대안 제시 | B | 가방 두 개와 크기 차이는 실제 점포 상품 정보가 아니라 가상 장면값이다 | - |
| ags-07 | compare | npc | Clerk | Would you like to compare them? | A2 | 비교 제안 | A | - | - |
| ags-08 | compare | option | A자리 | How do they differ apart from the size? | B2 | 크기 이외의 차이 묻기 | B | apart from으로 비교 범위를 제한하는 연어와 난이도는 사람 검수가 필요하다 | - |
| ags-09 | compare | option | A자리 | Could you show us how much each bag holds? | B1 | 수납 공간 시범 요청 | A | - | - |
| ags-10 | compare | npc | Clerk | The larger bag has more pockets. Both are easy to clean. | B1 | 수납과 관리 조건 비교 | B | 수납 주머니 수와 관리 방법은 실제 상품 정보가 아니라 가상 장면값이다 | - |
| ags-11 | compare | npc | Clerk | I'll open both bags so you can see the space inside. | B1 | 수납 공간 보여 줄 계획 | B | 가방을 열어 비교하는 절차는 실제 점포 정책이 아니라 가상 장면값이다 | - |
| ags-12 | partner | wait | B자리 | Would your sister use the smaller one more often, {A}? | B1 | 받는 사람의 사용 예상 묻기 | A | - | - |
| ags-13 | reason | wait | A자리 | I think so. She usually carries just a few things. | B1 | 이유를 들어 예상 답하기 | A | - | - |
| ags-14 | choice | npc | Clerk | The smaller bag costs less. Which would you prefer? | B1 | 가격 차이와 선택 묻기 | B | 작은 가방이 더 저렴하다는 설명은 실제 가격이 아니라 가상 비교값이다 | - |
| ags-15 | choice | option | B자리 | We'd prefer the smaller one because it's easier to carry. | B1 | 이유를 들어 선호 말하기 | A | - | - |
| ags-16 | choice | option | B자리 | Before we decide, could you compare the prices? | B1 | 결정 유보와 가격 비교 요청 | A | - | - |
| ags-17 | choice | npc | Clerk | The prices are on these labels. The smaller bag costs less. | B1 | 표시된 가격으로 비교 설명 | B | 라벨 가격과 작은 가방의 가격 우위는 실제 상품 정보가 아니라 가상 장면값이다 | - |
| ags-18 | wrap | wait | A자리 | We'll take the smaller bag. Could you wrap it as a gift? | B1 | 상품 선택 확정과 선물 포장 요청 | A | - | - |
| ags-19 | package | npc | Clerk | Would you like a gift box or just paper? | A2 | 포장 방식 묻기 | A | - | - |
| ags-20 | package | option | B자리 | A box, please. Could you keep the price off the gift? | B1 | 상자 선택과 가격 표시 제거 요청 | B | 선물의 가격 표시를 빼 달라는 화용과 포장 범위는 사람 검수가 필요하다 | - |
| ags-21 | package | option | B자리 | Could you put it in a box to protect it? | B1 | 보호 목적의 상자 포장 요청 | A | - | - |
| ags-22 | package | npc | Clerk | I'll use a box and keep the price off the gift. | B1 | 포장 요청 처리 계획 | B | 상자 포장과 가격 표시 제거는 실제 점포 정책이 아니라 가상 장면값이다 | - |
| ags-23 | shipping | npc | Clerk | Do you want to take it with you or ask about shipping? | B1 | 수령 또는 배송 문의 의사 묻기 | B | 배송 문의를 받는 절차는 실제 점포 정책이 아니라 가상 장면값이다 | - |
| ags-24 | shipping | option | A자리 | Could you tell us whether you can ship it to her? | B2 | 받는 사람에게 배송 가능한지 묻기 | A | - | - |
| ags-25 | shipping | option | A자리 | How much would it cost to send this gift? | B1 | 배송 비용 묻기 | A | - | - |
| ags-26 | shipping | npc | Clerk | We can send it to the address you provide. I'll check the cost. | B1 | 배송 가능 안내와 비용 확인 계획 | B | 주소로 배송할 수 있다는 설명은 실제 점포 서비스가 아니라 가상 장면값이다 | - |
| ags-27 | shipping | npc | Clerk | I'll check the cost using the address you provide. | B1 | 주소를 근거로 배송 비용 확인 계획 | B | 주소를 받아 비용을 확인하는 절차는 실제 점포 정책이 아니라 가상 장면값이다 | - |
| ags-28 | address | npc | Clerk | Please write the address here so I can check the shipping cost. | B1 | 배송 견적을 위한 주소 요청 | B | 주소 작성과 배송 비용 확인은 실제 점포 정책이 아니라 가상 장면값이다 | - |
| ags-29 | address | wait | B자리 | We'll write it down. Please check it with us before sending anything. | B1 | 주소 작성 동의와 발송 전 확인 요청 | A | - | - |
| ags-30 | total | npc | Clerk | The total is thirty dollars. Delivery should take about five days. | B1 | 합계와 예상 배송 기간 안내 | B | 삼십 달러 합계와 약 닷새 배송은 가상 견적값이며 실제 요금이나 도착 보증이 아니다 | - |
| ags-31 | total | option | A자리 | Does that total include the bag, box, and shipping? | B1 | 합계에 포함된 항목 확인 | A | - | - |
| ags-32 | total | option | A자리 | Could you explain what each charge is for? | B1 | 항목별 비용 설명 요청 | A | - | - |
| ags-33 | total | npc | Clerk | Yes, those three items are included in this total. | B1 | 합계 포함 항목 확인 | B | 가방 상자 배송이 포함된 합계는 실제 점포 요금이 아니라 가상 계산값이다 | - |
| ags-34 | total | npc | Clerk | The charges are for the bag, box, and shipping. | B1 | 항목별 비용 설명 | B | 가방 상자 배송의 비용 구성은 실제 점포 요금이 아니라 가상 계산값이다 | - |
| ags-35 | authorize | wait | B자리 | That works for us. Please send it to the address we checked. | B1 | 견적 수락과 확인된 주소로 배송 요청 | A | - | - |
| ags-36 | pay | npc | Clerk | Please pay this total before I prepare the package. | B1 | 포장 준비 전 결제 안내 | B | 결제 뒤 포장을 준비하는 순서는 실제 점포 절차가 아니라 가상 장면값이다 | - |
| ags-37 | pay | wait | A자리 | We'll pay by card. The total looks right. | A2 | 합계 확인 뒤 결제 수단 선택 | A | - | - |

### 연습할 말

두 사람이 번갈아 연습하는 본보기 데이터다. 본문 줄을 그대로 연결하며 실제 소리 재생과 발화 전 필수 이수를 이 표로 보장하지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| ags-p1 | I'd like a gift for my sister that's easy to pack. | 받는 사람과 선물 조건 설명 | ags-02 | - |
| ags-p2 | She likes simple bags. What would you suggest? | 취향을 전하고 조언 구하기 | ags-04 | - |
| ags-p3 | She travels often, so we're looking for something useful. | 생활 습관을 근거로 조건 설명 | ags-05 | - |
| ags-p4 | How do they differ apart from the size? | 크기 이외의 차이 묻기 | ags-08 | - |
| ags-p5 | Could you show us how much each bag holds? | 수납 공간 시범 요청 | ags-09 | - |
| ags-p6 | Would your sister use the smaller one more often, {A}? | 받는 사람의 사용 예상 묻기 | ags-12 | - |
| ags-p7 | We'd prefer the smaller one because it's easier to carry. | 이유를 들어 선호 말하기 | ags-15 | - |
| ags-p8 | Before we decide, could you compare the prices? | 결정 유보와 가격 비교 요청 | ags-16 | - |
| ags-p9 | We'll take the smaller bag. Could you wrap it as a gift? | 상품 선택 확정과 선물 포장 요청 | ags-18 | - |
| ags-p10 | A box, please. Could you keep the price off the gift? | 상자 선택과 가격 표시 제거 요청 | ags-20 | - |
| ags-p11 | Could you tell us whether you can ship it to her? | 받는 사람에게 배송 가능한지 묻기 | ags-24 | - |
| ags-p12 | How much would it cost to send this gift? | 배송 비용 묻기 | ags-25 | - |
| ags-p13 | We'll write it down. Please check it with us before sending anything. | 주소 작성 동의와 발송 전 확인 요청 | ags-29 | - |
| ags-p14 | Does that total include the bag, box, and shipping? | 합계에 포함된 항목 확인 | ags-31 | - |
| ags-p15 | Could you explain what each charge is for? | 항목별 비용 설명 요청 | ags-32 | - |
| ags-p16 | That works for us. Please send it to the address we checked. | 견적 수락과 확인된 주소로 배송 요청 | ags-35 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | gift | ags-01 | ags-02 | A |
| t2 | advice | ags-03 | ags-04/ags-05 | B |
| t3 | compare | ags-07 | ags-08/ags-09 | A |
| t4 | partner | - | ags-12 | B |
| t5 | reason | - | ags-13 | A |
| t6 | choice | ags-14 | ags-15/ags-16 | B |
| t7 | wrap | - | ags-18 | A |
| t8 | package | ags-19 | ags-20/ags-21 | B |
| t9 | shipping | ags-23 | ags-24/ags-25 | A |
| t10 | address | ags-28 | ags-29 | B |
| t11 | total | ags-30 | ags-31/ags-32 | A |
| t12 | authorize | - | ags-35 | B |
| t13 | pay | ags-36 | ags-37 | A |

## 나들이: diamond_head_sunrise

작성자: gpt (2026-10-11)
장소: diamond_head_trailhead
세션: 287
목표 등급: B2
할 일: cd-dhs-1 / I can confirm our hiking plans and reflect on a year of practicing together. / 두 사람의 등산 준비를 확인하고 함께 연습한 지난 1년을 돌아볼 수 있다.
허용 이름: -
갈래: dhs-12 > dhs-13

상황: 다이아몬드 헤드 등산로 입구와 정상에서 이어지는 가상 새벽 산행 장면이다. 입장 계획이 확인되었다는 안내, 준비 목록의 물과 조명, 안내자, 산행 뒤 정상에 있는 상황은 모두 가상 장면 값이다. 실제 개방 시각, 예약 완료, 입장 요건, 요금, 일출 시각, 날씨, 접근 가능 여부나 안전 상태를 확인한 정보가 아니다. 준비 목록은 실제 산행의 충분한 장비나 안전 지침이 아니다.

t3에서 시간을 요청하거나 함께 확인하자고 한 뒤에는 두 사람이 가상으로 두 가방을 함께 확인하는 행동을 마치고 t4로 간다. t5에서 준비를 알리든 잠시 기다리자고 하든, t6에서 A가 천천히 함께 걷자는 속도를 제안하고 B의 준비를 다시 묻는다. t7의 B가 두 사람 모두 준비되었다고 최종 확인하기 전에는 출발하지 않는다. t7 뒤에는 두 사람이 가상 산행을 마친 뒤 정상에서 쉬는 장면으로 전환하며 실제 이동이나 입장을 실행하지 않는다.

정상 회상은 가상의 두 학습자가 이 연습 장면 속에서 지난 1년의 연습, 질문할 자신감과 서로 도운 방식을 돌아보는 역할 대화다. 원본에서 확정되지 않은 실제 여행, 집 계약, 직장 경험이나 행사를 겪었다고 만들지 않는다. 가상 인물의 회상 대사는 실제 사용자 두 사람의 학습 성과를 평가하거나 경험을 확정한 말이 아니다.

| id | 장면 | 종류 | 인물 | 영어 | 등급 | 기능 | 점검 | 이유 | 한국어 |
|---|---|---|---|---|---|---|---|---|---|
| dhs-01 | preparation | npc | Guide | What should you check before you decide whether you're ready to start? | B2 | 출발 결정 전 확인 묻기 | A | - | - |
| dhs-02 | preparation | option | A자리 | I'd like to confirm our entry plans before we check the bags. | B2 | 입장 계획 확인 요청 | B | entry plans의 절차 용법은 실제 입장 정책이나 예약을 확인한 표현이 아니다 | - |
| dhs-03 | preparation | option | A자리 | Could you help us review what still needs checking before we start? | B2 | 남은 준비 검토 요청 | A | - | - |
| dhs-04 | entry_check | npc | Guide | Your entry plans are confirmed in this scene. Let's check your bags next. | B2 | 가상 입장 확인과 준비 연결 | B | 입장 계획 확인은 가상 장면 값이며 실제 예약이나 접근 가능 여부를 보증하지 않는다 | - |
| dhs-05 | bag_question | wait | A자리 | Do we each have water and a light, {B}? | A2 | 두 사람의 물품 확인 질문 | A | - | - |
| dhs-06 | bag_check | option | B자리 | I have mine, but I'd like a minute to check your bag with you. | B2 | 시간 요청과 함께 확인 제안 | A | - | - |
| dhs-07 | bag_check | option | B자리 | Could we check both bags together so we don't miss anything? | B2 | 빠뜨림 방지 확인 요청 | A | - | - |
| dhs-08 | check_action | npc | Guide | Take your time. Check both bags together before you decide. | B1 | 확인 행동과 결정 유보 안내 | B | 준비 확인 방식은 가상 진행 안내이며 실제 안전 판정을 대신하지 않는다 | - |
| dhs-09 | checked | wait | A자리 | We've checked both bags, and each of us has water and a light. | B2 | 함께 확인한 준비 보고 | B | 물품 확인 완료는 이 가상 장면의 행동 뒤 보고하며 실제 장비 충분성을 보증하지 않는다 | - |
| dhs-10 | readiness | npc | Guide | Are you both ready, or do you need more time? | B1 | 두 사람의 준비와 유보 묻기 | A | - | - |
| dhs-11 | readiness | option | B자리 | We're ready, and we'd like to take our time on the walk. | B2 | 준비 확인과 속도 선호 설명 | A | - | - |
| dhs-12 | readiness | option | B자리 | Could we wait a moment and agree on a pace before we start? | B2 | 출발 유보와 속도 합의 요청 | B | agree on a pace의 등급과 동행 간 합의 화용은 사람 검수 전이다 | - |
| dhs-13 | pace_wait | npc | Guide | Of course. Agree on a pace before you make your final decision. | B1 | 기다림 수락과 결정 순서 안내 | B | 합의 뒤 결정하는 순서는 가상 진행이며 pace의 등급 경계는 사람 검수 전이다 | - |
| dhs-14 | pace_agreement | wait | A자리 | Let's take our time and stay together. Are you ready now, {B}? | B1 | 함께 걸을 속도 제안과 최종 질문 | A | - | - |
| dhs-15 | start_agreement | wait | B자리 | Yes. We've checked everything together, and we're both ready to start. | B2 | 두 사람의 출발 준비 최종 확인 | B | 실제 안전 판정이 아니라 두 사람이 확인 행동을 마친 가상 준비 보고다 | - |
| dhs-16 | start | npc | Guide | All right. You both agree that you're ready to start. | A2 | 두 사람의 합의 확인 | A | - | - |
| dhs-17 | summit_break | npc | Guide | Take a moment here before we talk about your year of practice. | B1 | 가상 산행 뒤 회상 시작 안내 | B | 정상에서 쉬는 것은 가상 전환 값이며 실제 일출이나 산행 가능 여부를 확인한 정보가 아니다 | - |
| dhs-18 | year_change | npc | Guide | Looking back on your practice this year, what can you do better now? | B2 | 연습 변화 회상 묻기 | B | looking back on의 회상 연어와 등급은 사람 검수 전이다 | - |
| dhs-19 | year_change | option | A자리 | I used to wait for the right words; now I try and ask for help. | B2 | 과거와 현재 자신감 비교 | A | - | - |
| dhs-20 | year_change | option | A자리 | I'm still nervous sometimes, but I can explain what I need more clearly now. | B2 | 남은 어려움과 변화 설명 | A | - | - |
| dhs-21 | partner_change | npc | Guide | And what stands out to you? | B1 | 상대의 중요한 변화 묻기 | B | stands out의 회상 질문 용법과 등급은 사람 검수 전이다 | - |
| dhs-22 | partner_change | option | B자리 | I learned to ask for another explanation instead of pretending I understood. | B2 | 연습에서 얻은 방법 설명 | B | pretending의 학습 회상 용법과 understood의 등급은 사람 검수 전이다 | - |
| dhs-23 | partner_change | option | B자리 | Your questions helped me notice when I hadn't understood something. | B2 | 동행 도움의 영향 설명 | A | - | - |
| dhs-24 | help_question | wait | A자리 | What did we learn about helping each other, {B}? | B1 | 서로 도운 방식 회상 질문 | A | - | - |
| dhs-25 | help_reflection | option | B자리 | We learned to give each other time without answering every question for each other. | B2 | 도움의 역할과 한계 설명 | A | - | - |
| dhs-26 | help_reflection | option | B자리 | When I lost my place, you waited and helped me start again. | B2 | 다시 시작하게 도운 과정 회상 | B | lost my place의 연습 흐름 용법과 난이도는 사람 검수 전이다 | - |
| dhs-27 | future_help | npc | Guide | You can each say what kind of help matters most. | B1 | 앞으로 중요한 도움 의견 요청 | A | - | - |
| dhs-28 | future_help | option | A자리 | I'd like us to keep asking questions, even when we don't find the words immediately. | B2 | 어려움에도 질문 지속 희망 | A | - | - |
| dhs-29 | future_help | option | A자리 | Could we agree to explain what we mean before trying to speak faster? | B2 | 설명 우선의 공동 합의 요청 | A | - | - |
| dhs-30 | future_summary | npc | Guide | You can ask questions and give each other time to explain. | B1 | 두 도움 방식 정리 | A | - | - |
| dhs-31 | final_agreement | option | B자리 | Yes. We can keep practicing together, with time to ask and explain. | B1 | 함께 연습할 계획 수락 | A | - | - |
| dhs-32 | final_agreement | option | B자리 | Let's keep that habit, and remind each other that it's fine to need help. | B2 | 지속 계획과 서로 격려 제안 | A | - | - |
| dhs-33 | end | npc | Guide | Thank you both for sharing what you've learned. | A2 | 두 사람의 회상 마무리 | A | - | - |

### 연습할 말

두 사람이 번갈아 연습할 데이터 본보기다. 본문 줄을 그대로 연결하며 실제 음성 재생이나 발화 전 필수 이수를 보장하지 않는다.

| id | 연습할 말 | 기능 | 줄 | 한국어 |
|---|---|---|---|---|
| dhs-p1 | Could you help us review what still needs checking before we start? | 남은 준비 검토 요청 | dhs-03 | - |
| dhs-p2 | Do we each have water and a light, {B}? | 두 사람의 물품 확인 질문 | dhs-05 | - |
| dhs-p3 | Could we check both bags together so we don't miss anything? | 빠뜨림 방지 확인 요청 | dhs-07 | - |
| dhs-p4 | We've checked both bags, and each of us has water and a light. | 함께 확인한 준비 보고 | dhs-09 | - |
| dhs-p5 | Could we wait a moment and agree on a pace before we start? | 출발 유보와 속도 합의 요청 | dhs-12 | - |
| dhs-p6 | Let's take our time and stay together. Are you ready now, {B}? | 함께 걸을 속도 제안과 최종 질문 | dhs-14 | - |
| dhs-p7 | I used to wait for the right words; now I try and ask for help. | 과거와 현재 자신감 비교 | dhs-19 | - |
| dhs-p8 | I learned to ask for another explanation instead of pretending I understood. | 연습에서 얻은 방법 설명 | dhs-22 | - |
| dhs-p9 | We learned to give each other time without answering every question for each other. | 도움의 역할과 한계 설명 | dhs-25 | - |
| dhs-p10 | Could we agree to explain what we mean before trying to speak faster? | 설명 우선의 공동 합의 요청 | dhs-29 | - |

### 미니게임 차례

| 차례 | 장면 | NPC 줄 | 고르는 줄 | 자리 |
|---|---|---|---|---|
| t1 | preparation | dhs-01 | dhs-02/dhs-03 | A |
| n1 | entry_check | dhs-04 | - | - |
| t2 | bag_question | - | dhs-05 | A |
| t3 | bag_check | - | dhs-06/dhs-07 | B |
| n2 | check_action | dhs-08 | - | - |
| t4 | checked | - | dhs-09 | A |
| t5 | readiness | dhs-10 | dhs-11/dhs-12 | B |
| t6 | pace_agreement | - | dhs-14 | A |
| t7 | start_agreement | - | dhs-15 | B |
| n3 | start | dhs-16 | - | - |
| n4 | summit_break | dhs-17 | - | - |
| t8 | year_change | dhs-18 | dhs-19/dhs-20 | A |
| t9 | partner_change | dhs-21 | dhs-22/dhs-23 | B |
| t10 | help_question | - | dhs-24 | A |
| t11 | help_reflection | - | dhs-25/dhs-26 | B |
| t12 | future_help | dhs-27 | dhs-28/dhs-29 | A |
| n5 | future_summary | dhs-30 | - | - |
| t13 | final_agreement | - | dhs-31/dhs-32 | B |
| n6 | end | dhs-33 | - | - |
