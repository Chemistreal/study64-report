# G8 G5 대사 두 번째 검토

신뢰도: B (미국 영어와 한국 성인 학습 관점의 AI 재검토이며 실제 현지 원어민·교사의 인증이 아니다.)
검증로그: 2026-10-12 / 원문·상황·모든 차례·연습·갈래 대조 / 보류 / 실제 문구 관문 출력과 전체 실행 한계는 zip의 report.md에 적는다.

14개 미션의 대사 519줄, 점수 차례 163개, 연습 문장 184개를 모두 읽었다. 비점수 NPC 차례도 읽었다. 원문의 B는 230줄이다. 연습 표의 같은 영어는 대사 수에 중복 계산하지 않았다. 문제 12줄, 판단 유보 3줄, 문구 교체안 11줄이다. 실제 장소의 메뉴·계약·요금·안전·행사 규칙을 인증하지 않으며, 상황이 명시한 가상 값과 행동은 그 장면 안에서 공급된 것으로 읽었다.

## 문제 줄

| 줄 ID | 미션 | 원래 영어 | 문제 종류 | 이유 | 같은 기능 교체안 | 확신 |
| --- | --- | --- | --- | --- | --- | --- |
| acr-23 | airport_rental_car | Could you explain which costs these options leave out? | 연어·학습자 함정 | 보험 options가 costs를 leave out한다고 하면 보장 제외를 묻는지 가격표에서 비용을 빠뜨렸는지 모호하다. 바로 다음 exclusions와 원래 기능은 보험 미보장 비용이므로 don't cover로 뜻을 분명히 한다. | Could you explain which costs these options don't cover? | A |
| aph-30 | apartment_hunting | Guest rules and quiet hours are on this sheet; let's review them together. | 대화 흐름·미응답 질문 | aph-29는 조용한 시간과 소음 신고 방법 두 가지를 묻는데 이 줄은 손님 규칙과 조용한 시간만 자료에서 확인한다. 신고 방법을 다룬다는 정보는 상황이나 다음 수리 연락처에도 없으므로 같은 서면 검토 기능에서 그 항목도 명시해야 한다. | The sheet lists guest rules, quiet hours, and how to report noise. Let's read it together. | A |
| aph-35 | apartment_hunting | Could we come back at another time to hear the street noise again? | 대화 흐름·정보 전제 | t2에서 업무 공간 aph-06, t3에서 책상 배치 aph-11을 택하면 소음 듣기 제안 aph-08과 소음 확인 요청 aph-10을 모두 지나지 않는다. 공통 aph-12와 상황은 창문·배치 확인만 보장하므로 이전 소음 청취를 전제하는 again을 빼 추가 방문 요청만 유지한다. | Could we come back at another time to hear the street noise? | A |
| lyd-37 | lei_day | They help, but I'd need more information before discussing their history. | 대화 흐름·대명사 지시 대상·학습자 함정 | t11 질문의 labels를 They로 받은 뒤 their history에서는 lei의 역사를 뜻하려 해 지시 대상이 바뀐다. 가까운 문법 선행사는 labels여서 이름표의 역사인지 레이의 역사인지 학습자가 혼동할 수 있다. 판단 유보 기능을 유지하면서 history of the lei로 대상을 명시한다. | They help, but I'd need more information before discussing the history of the lei. | A |
| dpt-37 | dole_plantation | Can I pay in cash instead? | 대화 문맥·한국어 학습자 함정 | t10에서 이 후보를 고른 경로에는 앞서 카드 결제 의사나 카드 기본값이 나온 적이 없다. 화면에 따로 제시된 다른 선택 dpt-36은 이 경로에서 발화되지 않아 instead의 대비 대상을 대화 안에서 만들지 못한다. 현금 허용 요청 기능을 유지하면서 instead만 빼면 없는 앞 결제 선택을 전제하지 않는다. | Can I pay in cash? | A |
| her-35 | hospital_emergency | So we should wait here and speak to a staff member when they come? | 대화 흐름·미응답 확인 | 대기 장소와 직원이 오면 이야기하는지 확인하는 질문형 요약은 영어 자체가 명확하다. 그러나 her-36과 달리 응답 갈래가 없어 다음 환자의 질문으로 넘어가 확인 답이 남으므로 문구보다 흐름 보완이 필요하다. | 문구 교체 보류; 흐름 제안 참고 | B |
| hbc-14 | hanauma_bay_conservation | I'd like one point clarified before we decide how to act. | 설명 요청 대상 누락·대화 흐름 | 설명받고 싶은 one point가 무엇인지 말하지 않는데 hbc-15는 안내의 목표를 보충하고 곧바로 t5로 넘어간다. 장면에도 손으로 특정 지점을 가리키거나 먼저 그 지점을 정한다는 행동은 없다. 목표를 설명해 달라고 요청하면 결정 전 설명 요청 기능을 유지하면서 예정된 응답과 초점이 맞는다. | Could you explain the goal before we decide how to act? | A |
| kmd-08 | kamehameha_day | Waiting lets everyone hear the full point before we discuss it. | 자연스러움·의미가 흐린 결합 | point는 전달할 요지나 주장인데 hear the full point는 여기서 끝까지 듣는 대상이 설명 전체인지 핵심인지 불분명한 결합이다. full explanation으로 바꾸면 끊지 않고 끝까지 듣는다는 이유가 명확하고 discuss it의 대상도 이어진다. 실제 문화 예절을 바꾸지 않는 문구 보완이다. | Waiting lets everyone hear the full explanation before we discuss it. | A |
| kmd-24 | kamehameha_day | It helps everyone hear the full point before sharing their own views. | 자연스러움·의미가 흐린 결합 | 앞의 kmd-08과 같은 hear the full point 결합을 재사용한다. 듣는 대상이 완결된 설명임을 full explanation으로 구체화하면 원래의 이유 요약과 자기 의견 공유라는 기능을 유지한다. sharing their own views 자체는 B2 의견 전달 표현으로 가능하다. | It helps everyone hear the full explanation before sharing their own views. | A |
| kld-09 | kailua_lanikai_day | Could we plan lunch first and set the travel time later? | 학습자 함정·계획 대상의 모호함 | travel time은 바로 앞 kld-08과 뒤 kld-29/31에서 이동 소요 시간인데 set the travel time은 그 기간을 임의로 정하는 뜻 또는 출발 시각을 정하는 뜻으로 갈린다. 마지막 kld-32의 departure time과 같은 결정 대상임을 명시하면 계획 순서 조정 기능을 그대로 두면서 기간과 시각의 혼동을 없앤다. | Could we plan lunch first and choose our departure time later? | A |
| kld-10 | kailua_lanikai_day | Let's leave travel times open while we plan the food and gear. | 학습자 함정·시간 유보 대상의 모호함 | 앞뒤의 travel time은 확인할 이동 소요 시간이지만 leave travel times open은 출발 시각을 열어 둔다는 요약과 대상이 다르게 읽힌다. 음식과 장비를 먼저 계획하고 언제 떠날지는 뒤에 고른다고 말하면 시간 유보와 준비 안내 기능이 분명해진다. | Let's plan the food and gear before we choose when to leave. | A |
| kld-25 | kailua_lanikai_day | A morning break, lunch, then a walk can stay a flexible plan. | 자연스러움·어색한 술어 | 활동 나열이 can stay a flexible plan의 주어가 되면서 활동 자체가 계획인 상태를 유지한다는 술어가 어색하다. 두 앞 후보가 같은 순서를 제시하므로 That order로 그 순서를 확인하고 keep the plan flexible로 유연성을 따로 말하면 원래 확인 기능과 유보 조건이 유지된다. | That order works. We can still keep the plan flexible. | A |

## 판단 유보 줄

| 줄 ID | 미션 | 원래 영어 | 유보 종류 | 이유 | 제안 | 확신 |
| --- | --- | --- | --- | --- | --- | --- |
| esr-26 | eggs_n_things_special_requests | That's fine. Thank you for taking care of it. | A2 관용 청크 난도 유보 | 문제 처리에 대한 감사로 take care of it를 쓰는 영어는 교체 요청 문맥에 맞는다. 다만 낱말 care를 안다고 이 관용적 처리 뜻까지 A2에서 이해한다고 확정할 수는 없다. 기존 B의 A2 청크 난도만 유보하며 실제 오류나 교체 필요로 단정하지 않는다. | 원문 유지; 교사 검토 필요 | B |
| lyd-38 | lei_day | Let's ask the host where we can find more information. | 인물 역할 선행 정보·판단 유보 | t6에서 lyd-21을 택하면 lyd-23이 host를 소개하지만 lyd-20 > lyd-22 경로에는 담당자가 나오지 않는다. 상황은 정보 탁자를 제공하나 host의 존재·시각적 소개를 명시하지 않아 the host를 두 사람이 이미 특정할 수 있는지 텍스트만으로 확정하기 어렵다. 가상 장면 오류로 단정하지 않고 기존 A를 유보한다. | 원문 유지; 교사 검토 필요 | B |
| hbc-24 | hanauma_bay_conservation | What would help you make that judgment? | 대명사 지칭·경로별 판단 유보 | hbc-23 뒤에서는 that judgment가 각 상황의 판단을 분명하게 받는다. hbc-22 뒤에서는 이미 한 접근 지지 판단인지 앞으로 할 행동 판단인지 지칭이 넓다. 앞의 전체 결정 주제를 받는 자연스러운 질문일 가능성도 있어 확정 오류로 단정하지 않는다. B1 줄에 있는 judgment는 기존 표의 한 단계 어휘 허용 여부와 별개로 이 경로의 지칭을 사람 검토할 대상으로 남긴다. | 원문 유지; 교사 검토 필요 | B |

## 기존 B 가운데 이번 재검토상 괜찮은 모든 줄

괜찮다는 말은 원래 B를 자동으로 A로 바꾸거나 실제 장소 사실을 확인했다는 뜻이 아니다.

| 줄 ID | 미션 | 영어 | 괜찮다고 본 이유 |
| --- | --- | --- | --- |
| esr-03 | eggs_n_things_special_requests | This egg dish contains milk. Milk is also used in this kitchen. | contains milk는 메뉴 성분을 직접 알려 주며 이어서 주방에서도 우유를 쓴다고 구별한다. 두 내용은 상황에 명시된 허구 조리값이라 실제 에그스 앤 띵스의 조리법 주장으로 보지 않는다. 원래 B는 보존한다. |
| esr-05 | eggs_n_things_special_requests | Before I decide, how do you cook the food? | 결정을 유보하며 조리 과정을 넓게 묻는 말이다. 바로 앞 우유 성분·주방 안내와 뒤 공유 조리면 설명이 질문 범위를 좁혀 주므로 이 장면에서 발화 가능하다. 구체적인 알레르기 확인 절차가 완성됐다는 뜻은 아니며 원래 B는 보존한다. |
| esr-06 | eggs_n_things_special_requests | I'll ask the cook, but we use milk in this kitchen. | 조리 담당자에게 묻겠다는 계획과 주방의 우유 사용이라는 제약을 함께 말한다. 가상 확인 절차이며 다음 보증 불가 안내와도 맞으므로 확인 약속을 안전 판정으로 오인시키지 않는다. 원래 B는 보존한다. |
| esr-07 | eggs_n_things_special_requests | Some food is cooked on the same cooking surface. | 공유 조리면은 앞의 조리 과정 질문에 대한 범위 있는 설명이다. 같은 주방에서 우유를 쓴다는 앞 정보와 함께 읽히며, 상황에 허구 값이라고 명시되어 실제 교차 접촉 여부나 안전성을 판정하는 지침이 아니다. 원래 B는 보존한다. |
| esr-08 | eggs_n_things_special_requests | I can't promise there will be no milk in your food. | 우유가 전혀 없을 것이라고 약속할 수 없다는 한계를 분명히 말한다. A는 이 말을 듣고 음식 주문을 하지 않으며 직원이 안전 허가나 진단을 제공하는 흐름이 아니다. 원래 B는 보존한다. |
| esr-13 | eggs_n_things_special_requests | For your order, should the sauce come on the side? | on the side는 바로 뒤 스스로 소스를 더하겠다는 응답과 대비되어 별도 제공 뜻이 드러난다. 소스 제공 선택과 기록은 가상 주문 설정이며 실제 매장의 제공 가능성을 인증하지 않는다. 원래 B는 보존한다. |
| esr-16 | eggs_n_things_special_requests | I'll pass your request on to the kitchen. | pass your request on to the kitchen은 B의 재료·소스 요청을 전달하겠다는 기능이 분명하다. 실제 특정 매장의 전달 체계를 주장하지 않는 가상 계획이며 원래 B는 보존한다. |
| esr-18 | eggs_n_things_special_requests | You ordered water. Your friend ordered eggs and toast without cheese. | A의 물과 B의 치즈 없는 음식 주문을 따로 요약하여 주문자를 보존한다. 상황에서 소스 선택의 기록·유지를 이미 명시했으므로 요약에 소스가 없다고 취소된 갈래로 판정하지 않는다. 가상 주문 요약인 원래 B는 보존한다. |
| esr-19 | eggs_n_things_special_requests | Here are your eggs and toast. Is everything as requested? | 음식을 내며 요청에 맞는지 묻는 기능 질문이다. 잘못 나온 치즈와 t7 전 음식 제공은 상황에 있는 사건이므로 직원이 먼저 질문했다는 이유로 흐름 고장으로 보지 않는다. 원래 B는 보존한다. |
| esr-22 | eggs_n_things_special_requests | I'm sorry. I'll have the kitchen make a new plate. | 사과 뒤 새 음식 한 접시를 만들도록 하겠다는 조치 계획을 말한다. make a new plate는 이 음식 문맥에서 새 식기 제조가 아닌 새 음식 제공을 가리킬 수 있고 다음 새 달걀 요청이 범위를 구체화한다. 실제 보상 정책을 인증하지 않으며 원래 B는 보존한다. |
| esr-23 | eggs_n_things_special_requests | Could you make new eggs instead of just taking off the cheese? | 앞의 새 접시 계획에서 치즈만 제거하는 것이 아닌 새 조리를 원한다고 구체화하는 부탁이다. B에게 알레르기가 있다는 전제가 없고 실제 조리 안전도 보증하지 않는다. instead of가 두 처리 방식을 구별하는 B2 기능이며 원래 B는 보존한다. |
| esr-24 | eggs_n_things_special_requests | Yes. I'll ask the cook to make fresh eggs without cheese. | 새 달걀 요청에 Yes로 답하고 조리 담당자에게 치즈 없이 새로 만들어 달라고 전하겠다는 계획을 말한다. 요청 전달과 실제 알레르기 안전 보증은 다르며 이 장면은 전자만 제시한다. 원래 B는 보존한다. |
| esr-25 | eggs_n_things_special_requests | The new plate will take about ten minutes. | about가 예상 대기임을 드러내며 열 분은 상황의 허구 시간값이다. B의 수락 또는 기다리는 동안 물 요청 어느 쪽에도 연결할 수 있다. 원래 B는 보존한다. |
| esr-28 | eggs_n_things_special_requests | I'll bring you some water. | B의 물 요청에 직접 제공 계획으로 답한다. 상황이 가상 운영 절차임을 밝히고 물을 곧 제공하겠다는 쉬운 문장이므로 문구 오류는 찾지 못했다. 원래 B는 보존한다. |
| esr-29 | eggs_n_things_special_requests | Here are the new eggs. Please check your order. | 상황에 명시된 t10 전 교체 음식 제공을 말한 뒤 눈앞의 주문을 확인하도록 부탁한다. 안전성을 직접 판정하지 않고 B의 외관 확인 또는 새 포크 요청을 받을 수 있다. 원래 B는 보존한다. |
| esr-37 | eggs_n_things_special_requests | Only the new plate is on the check. | 새 접시만 청구했다는 답은 두 접시를 모두 청구하지 않는다는 허구 계산서 조건과 일치한다. 첫 접시 청구 질문에 직접 답하며 실제 매장의 환불·보상 원칙으로 일반화하지 않는다. 원래 B는 보존한다. |
| pcc-02 | polynesian_cultural_center | We'd like an introduction before we watch the show. | introduction은 뒤 공연 전에 듣는 짧은 안내라는 상황과 이어지는 talk로 구체화된다. 공연을 이미 이해했다고 말하지 않는 방문 목적이며 B1 문장 안에서 쓸 수 있다. 원래 B는 유지한다. |
| pcc-04 | polynesian_cultural_center | The talk uses pictures. The show has music and starts thirty minutes later. | 그림을 쓰는 talk와 음악이 있는 show를 대비하며 later는 앞서 말한 talk와의 시간 간격으로 읽힌다. 30분은 상황에 둔 가상값이며 실제 센터 시간표를 인증하지 않는다. 원래 B는 유지한다. |
| pcc-05 | polynesian_cultural_center | How does the talk differ from the show? | differ from은 앞에서 소개한 두 활동의 차이를 묻고 pcc-07이 설명과 관람의 차이로 답한다. 직접적인 B2 비교 질문으로 의미가 분명하며 원래 B는 유지한다. |
| pcc-07 | polynesian_cultural_center | The talk explains the program, while the show lets you watch and listen. | while은 프로그램 설명과 보고 듣는 활동을 대조한다. 두 활동의 구성은 가상 진행안이며 어떤 폴리네시아 문화의 본질을 단정하지 않는다. 원래 B는 유지한다. |
| pcc-08 | polynesian_cultural_center | Yes. There's a short break after the talk, so you can attend both. | Yes가 두 활동에 갈 시간이 있느냐는 질문에 답하고 휴식과 참석 가능성을 연결한다. 명시된 가상 일정 안의 가능성으로 범위가 정해져 있으며 원래 B는 유지한다. |
| pcc-10 | polynesian_cultural_center | That suits me because I'd like some background before the show. | That suits me는 A의 설명 우선 계획에 동의한다. background는 공연 전에 얻을 배경 정보의 필요를 말하며 아직 문화 내용을 안다고 주장하지 않는다. B2 의견과 이유로 가능하고 원래 B는 유지한다. |
| pcc-15 | polynesian_cultural_center | First, the host welcomes everyone. Music follows, and questions come at the end. | 인사, 음악, 질문이라는 순서가 first와 at the end로 명확하다. 상황에서 가상 공연 진행안으로 한정했으며 실제 의례의 순서로 일반화하지 않는다. 원래 B는 유지한다. |
| pcc-16 | polynesian_cultural_center | Yes. First, the host welcomes everyone; then music follows. Questions come at the end. | Yes로 설명 뒤 질문 허락을 수락하고 두 갈래 모두에서 필요한 공연 순서를 말한다. host는 그 가상 공연의 진행 역할이며 원래 B는 유지한다. |
| pcc-19 | polynesian_cultural_center | Yes. The questions come after the music. | Yes가 두 요약 확인 갈래 모두에 답하고 음악 뒤 질문이라는 공통 정보를 반복한다. 실제 행사 관습이 아닌 선행 가상 설명의 확인이며 원래 B는 유지한다. |
| pcc-23 | polynesian_cultural_center | It helps us finish each part before discussing it. | 첫 It은 질문을 끝에 두는 배치, 뒤 it은 각각의 part를 받는다. 각 부분을 마친 뒤 논의한다는 가상 안내자의 이유로 질문에 답하며 문화적 의도를 대변하지 않는다. 원래 B는 유지한다. |
| pcc-30 | polynesian_cultural_center | You can use the seats beside this table while you decide. | this table을 현장에서 가리키며 옆 좌석을 답할 수 있다. 위치와 좌석 사용은 상황에 명시한 가상값이고 실제 센터 시설 안내는 아니다. 원래 B는 유지한다. |
| pcc-31 | polynesian_cultural_center | The talk is over. The show has not started yet. | t8 뒤 설명 종료가 상황에 있고 아직 공연 전이라는 시점을 알려 준다. 다음 일정표 확인 또는 휴식 선택을 지원하는 가상 상태 안내이며 원래 B는 유지한다. |
| pcc-34 | polynesian_cultural_center | That's fine. Come back when you're ready to check the schedule. | 휴식을 수락한 뒤 준비되면 일정표 확인에 돌아오라고 한다. 상황이 휴식과 공동 확인 후 t11로 간다고 명시하여 요청을 무시하지 않는다. 원래 B는 유지한다. |
| pcc-39 | polynesian_cultural_center | The next talk is on this page, below the show. | this page와 below the show는 상황에 둔 가상 안내표를 함께 가리키는 위치 답이다. 현재 자료 배치를 말할 뿐 실제 센터 인쇄물의 사실을 단정하지 않는다. 원래 B는 유지한다. |
| acr-01 | airport_rental_car | Can I have the booking name and confirmation number? | 예약 이름과 확인 번호를 함께 요청하는 공손한 질문이다. 이름 먼저 조회하는 대안도 acr-04가 받아 주므로 번호를 반드시 이미 내야 한다는 실제 업체 요건을 만들지 않는다. |
| acr-04 | airport_rental_car | Sure. I can look it up under {A}. | look it up의 it은 바로 앞 booking을 받으며 under {A}가 이름 조회 방식에 답한다. 조회 가능 여부는 가상 장면에만 한정하고 원래 B를 유지한다. |
| acr-08 | airport_rental_car | I need your license, photo ID, and credit card. | license는 운전자 질문 직후여서 운전면허 뜻이 명확하다. 세 서류를 A가 제출한다고 상황에 명시했고 실제 모든 업체의 요건으로 일반화하지 않는다. |
| acr-11 | airport_rental_car | Thanks. I have the documents I need for this booking. | I have the documents I need는 서류를 받았다는 뜻에 한정된다. A의 운전자 자격이나 신용카드 결제 승인을 선언하지 않아 가상 수령 확인으로 적절하다. |
| acr-12 | airport_rental_car | Would you like to hear the optional insurance choices? | 보험이 optional이라고 먼저 알려 설명을 제안하며 즉시 가입을 확정하지 않는다. choices는 가상 자료의 여러 선택지를 가리키고 다음 두 후보가 설명이나 서면 확인을 요청한다. |
| acr-13 | airport_rental_car | Yes. Please explain what each option covers before we decide. | what each option covers는 각 보험의 보장 범위를 묻는 명확한 기능 질문이다. 실제로 조건을 읽고 설명을 들을 시간을 둔다는 상황이 있어 설명 없이 선택으로 건너뛴다고 판정하지 않는다. |
| acr-15 | airport_rental_car | I'll show you the insurance terms and price before you decide. | terms and price를 선택 전에 보여 주겠다고 답한다. acr-13 경로에도 상황이 필요한 직원 설명과 실제 읽기 시간을 보장하므로 서면 제시만 하고 질문을 무시하는 경로가 아니다. |
| acr-16 | airport_rental_car | The screen shows the booking charge and taxes. | 화면의 booking charge와 taxes를 두 요금 항목으로 가리킨다. 이 명칭과 합계는 가상 화면의 항목이며 실제 업체의 기본 요금이나 세목을 인증하지 않는다. |
| acr-17 | airport_rental_car | Which amount would we pay if we decline the optional insurance? | decline the optional insurance는 선택 보험을 거절하는 뜻으로 문맥이 명확하다. 어느 금액을 낼지의 질문은 acr-20에서 화면 항목의 합으로 답하고 금액을 새로 지어내지 않는다. |
| acr-19 | airport_rental_car | You pay the booking charge, taxes, and any insurance you choose. | any insurance you choose가 보험 비용을 선택한 경우로 제한한다. 아직 선택 전인 t5에서도 합계 구조를 설명할 수 있으며 실제 모든 렌터카 비용의 완전한 목록이라는 주장은 아니다. |
| acr-20 | airport_rental_car | If you decline insurance, you pay only the booking charge and taxes. | 보험을 거절하면 booking charge와 taxes만 낸다는 조건문으로 acr-17에 답한다. only의 범위는 명시된 가상 화면 계산 안에 있고 실제 계약상 비용 보장은 아니다. |
| acr-21 | airport_rental_car | Please review the written terms before making an insurance choice. | written terms는 t4와 n2에서 제시한 자료를 받는다. 조건을 읽고 필요하면 설명을 들은 뒤 보험 선택으로 넘어간다고 상황에 명시해 검토 요청이 빈 약속으로 끝나지 않는다. |
| acr-24 | airport_rental_car | The exclusions are listed here; I can go through them with you. | exclusions는 앞서 제시한 보험 terms의 제외 항목을 가리키고 go through them은 그것을 함께 확인하겠다는 뜻이다. 전문 낱말이지만 기존 B2 표의 exclusion을 유지하고 실제 제외 내용을 창작하지 않는다. |
| acr-25 | airport_rental_car | I've read the terms. I'll decline the insurance. | decline은 앞에서 들은 선택 보험을 거절하는 뜻으로 직접 연결된다. I've read는 조건을 실제 읽고 난 뒤에만 선택한다는 상황의 선행 행동에 근거하며 실제 보험 필요성을 조언하지 않는다. |
| acr-26 | airport_rental_car | Please add the insurance option marked here to this booking. | the option marked here는 두 사람이 검토 자료에 표시한 한 가지라는 상황의 정보다. 여러 보험을 자동 추가하거나 직원이 임의로 선택한다는 뜻이 없어 요청 기능이 성립한다. |
| acr-27 | airport_rental_car | The screen now shows the total for your choice. Please review it. | now와 your choice는 바로 앞 보험 추가 또는 거절의 결과를 화면에서 확인하는 상태를 받는다. 금액은 화면의 가상값이며 review it은 그 합계를 다시 확인하라는 뜻이다. |
| acr-28 | airport_rental_car | This total matches our choice. Could we have a copy before signing? | our choice는 A가 한 보험 선택을 B도 함께 검토한 공동 결정으로 받는다. 합계 확인과 서명 전 사본 요청을 함께 할 수 있으며 사본 제공은 acr-30으로 이어진다. |
| acr-30 | airport_rental_car | I'll give you a written copy and explain any charges you ask about. | 사본을 요청한 경로와 합계 설명을 요청한 경로 모두에 사본 제공과 요금 설명을 약속하여 합류한다. 실제 업체의 사본 발급 의무로 일반화하지 않고 가상 대화의 응대로 읽는다. |
| acr-34 | airport_rental_car | The return place, due time, and late charges are on this sheet. | 반납 장소, 기한과 지연 요금을 한 서류에서 보여 주므로 두 반납 질문에 모두 답할 수 있다. 실제 공항 반납 지점, 실제 시각이나 비용을 새로 단정하지 않는다. |
| acr-37 | airport_rental_car | I'll mark those details and review the late charges with you. | those details는 acr-34의 장소와 시각을 받으며 표시 요청과 지연 요금 설명 요청을 함께 수락한다. 서류 표시와 검토는 가상 응대이며 실제 반납 조건이나 수치를 만드는 말이 아니다. |
| acr-39 | airport_rental_car | We've reviewed the terms. We'd like to sign and continue with pickup. | with pickup은 차량 인수 단계로 계속 진행하고 싶다는 의향이다. 상황이 실제 서명·결제·차량 인수의 자동 완료를 보장하지 않으므로 완료 사실을 앞당기는 말로 판정하지 않고 기존 B를 유지한다. |
| aph-03 | apartment_hunting | Yes. Could you tell us what we'll see during the viewing? | during the viewing은 현재 집을 둘러보는 방문을 가리키고 what we'll see가 순서를 묻는다. 가상 방문의 범위가 앞 질문으로 주어져 B2에서 지시 대상이 명확하지만 현지 용어 사용의 B는 유지한다. |
| aph-04 | apartment_hunting | We'll look at the rooms, then go over the monthly costs and rules. | look at the rooms 다음 go over costs and rules라는 방문 순서를 설명한다. 공간 확인 요청을 실제 수행할 시간을 둔다는 상황이 있어 바로 비용으로 뛰어넘는 약속이 아니며 실제 중개 절차를 주장하지 않는다. |
| aph-08 | apartment_hunting | I can't judge the noise for you; we can listen with the windows open. | 직원이 각자의 소음 판단을 보장하지 않고 열린 창문에서 함께 들어 보자고 제안한다. 상황의 가상 확인 행동으로 가능하고 실제 집의 소음 상태나 적합성을 인증하지 않는다. |
| aph-15 | apartment_hunting | Rent is two thousand dollars a month; you pay electricity separately. | 월세 이천 달러와 전기 별도 납부는 상황에 명시한 가상값이다. rent와 electricity를 비용 비교 질문에 직접 연결하며 실제 호놀룰루 매물 가격이나 임대 규정으로 제시하지 않는다. |
| aph-16 | apartment_hunting | Water is included. What else would you like to check about costs? | 포함된 수도 요금을 앞 비용 답변에 덧붙이고 추가 비용 질문을 받는다. included의 대상은 문맥상 water 비용이며 수도 포함은 이 가상 제안의 조건이다. |
| aph-19 | apartment_hunting | This offer lists all charges and when you need to pay. | all charges와 납부 시점을 서면에서 보여 주어 보증금 또는 입주 전 비용 질문을 받는다. 실제 임대료 외 비용이나 법률상 납부 기한을 새로 정하는 말은 아니다. |
| aph-22 | apartment_hunting | Yes. You can take a copy; nothing is agreed during this viewing. | 사본을 가져가도 되고 현재 방문에서 합의가 완료되지 않았다고 확인한다. 이미 두 후보 모두 자료 확인을 요청했고 이 상태 설명은 실제 계약 성립 기준의 법률 조언이 아니다. |
| aph-23 | apartment_hunting | This offer has a one-year lease. What would you like to know about it? | one-year lease는 상황에 명시한 이 제안의 기간이고 it은 lease를 받는다. 두 뒤 후보가 중도 퇴거 또는 더 짧은 기간을 물으므로 질문의 범위가 분명하다. |
| aph-26 | apartment_hunting | The terms for ending early are here. We can discuss the lease length. | ending early의 조건은 가상 서면에서 확인하고 lease length의 협의 가능성만 말한다. 중도 퇴거의 실제 권리, 비용이나 합법성을 보장하지 않아 문구 자체의 오류로 보지 않는다. |
| aph-29 | apartment_hunting | When are quiet hours, and how do we report a noise problem? | quiet hours는 가상 거주 규칙의 시간대를 묻는 문맥에서 명확하며 소음 문제 신고 방법을 추가로 묻는 정중한 질문이다. 줄 자체는 적절하지만 다음 aph-30이 신고 방법 부분을 받지 못하는 흐름을 별도로 기록한다. |
| aph-31 | apartment_hunting | Could you also explain how we would request a repair? | request a repair는 수리가 필요할 때 요청하는 방법을 묻는 뜻으로 명확하다. 실제 담당자나 임차인의 수리 의무를 정하지 않고 aph-33의 가상 연락처 확인으로 이어진다. |
| aph-32 | apartment_hunting | Which repairs would we be expected to pay for ourselves? | be expected to pay for ourselves는 스스로 부담할 수리비의 범위를 조건형으로 묻는다. 책임을 단정하는 법률 답변이 아니라 서면 확인 요청이므로 B2 기능 대화로 성립한다. |
| aph-33 | apartment_hunting | The offer lists repair contacts and who pays; we can check each point. | repair contacts와 who pays를 같은 가상 offer에서 확인하여 방법 문의와 비용 책임 문의를 모두 받는다. 실제 임차인의 수리 책임이나 권리의 범위를 새로 설명하지 않는다. |
| aph-37 | apartment_hunting | That's fine. Contact me if you'd like another viewing or want to discuss the offer. | 추가 viewing을 원할 때나 offer를 협의하고 싶을 때 연락하라고 제안하여 두 유보 경로를 함께 받는다. 다른 시각 방문을 실제 예약했다고 말하지 않아 가상 연락 제안으로 적절하다. |
| lyd-01 | lei_day | Welcome. Please read the sign before coming to the table. | 안내표를 먼저 읽어 달라는 탁자 안내이며 이해 도움을 청하는 lyd-02나 멀리서 보겠다는 lyd-03과 맞는다. 실제 행사 규정이 아닌 이 탁자의 가상 절차이고 원래 B는 유지한다. |
| lyd-04 | lei_day | Please look first and ask me before touching anything on the table. | 보기와 만지기 전 질문을 분명히 구분한다. on the table로 가상 탁자 물건에 범위를 두어 실제 레이 예절 전체의 규칙처럼 말하지 않으며 원래 B는 유지한다. |
| lyd-05 | lei_day | Yes. Watch from here, then ask me before touching anything on the table. | Yes로 현재 자리 관찰을 허락하고 물건을 만지기 전에 묻는 조건을 덧붙인다. 위치와 순서는 명시된 가상 안내이며 원래 B는 유지한다. |
| lyd-09 | lei_day | Yes. Ask first so I can show you which items we use for this activity. | Yes로 레이를 집기 전 질문도 포함함을 답하고 활동용 물건을 보여 주겠다고 이유를 설명한다. 실제 문화 관습을 새로 확정하지 않는 가상 절차이며 원래 B는 유지한다. |
| lyd-10 | lei_day | Some items are for the display; I'll show you what we can use. | display용 물건과 사용할 수 있는 물건의 차이가 먼저 확인하는 이유를 답한다. 가상 안내자의 앞으로 보여 주겠다는 말이지 활동을 이미 수행했다는 선언은 아니다. 원래 B는 유지한다. |
| lyd-14 | lei_day | This label lists flowers, and that one lists leaves. | this label과 that one으로 상황의 두 이름표를 가리켜 꽃과 잎이라는 가상 재료를 답한다. 실제 특정 레이의 재료나 문화적 의미를 인증하지 않으며 원래 B는 유지한다. |
| lyd-18 | lei_day | Yes. They tell you what is used to make each lei. | They는 질문의 labels를 받고 each lei에 쓰인 재료를 설명한다고 확인한다. 가상 이름표 내용으로 범위가 한정되어 실제 모든 레이 설명법을 일반화하지 않으며 원래 B는 유지한다. |
| lyd-19 | lei_day | The first label says this lei is made with flowers. | 첫 이름표의 꽃 정보를 문장으로 읽어 예시 요청에 답한다. made with flowers는 가상 전시물의 재료 설명이고 실제 특정 식물이나 의미를 창작하지 않는다. 원래 B는 유지한다. |
| lyd-22 | lei_day | Yes. That's what these labels tell you. | Yes로 이름표가 재료를 설명한다는 요약을 확인한다. 가상 자료의 범위를 확인하는 응답으로 문화사를 새로 설명하지 않으며 원래 B는 유지한다. |
| lyd-23 | lei_day | You can ask the host at the information table. | history 정보를 묻는 갈래에서 information table의 host를 새로 소개해 문의 경로를 준다. 안내 장소와 담당 역할은 가상 설정이고 이 줄 자체에는 실제 행사 배치 단정이 없다. 원래 B는 유지한다. |
| lyd-27 | lei_day | If you have a question, ask me before you continue. | before you continue는 가상 활동을 계속하기 전에 Guide에게 질문하라는 답이다. 문장이 실제 문화 예절 전체나 물건 조작의 안전을 보장하지 않으며 원래 B는 유지한다. |
| lyd-28 | lei_day | Yes. Watch first, then ask me questions before trying anything. | 관찰 후 질문을 허락하되 시도 전 질문 조건을 유지한다. 해당 가상 활동 안의 순서 설명이고 자동 참여나 실제 레이 관습 단정은 없어 원래 B는 유지한다. |
| lyd-29 | lei_day | I appreciate having time to ask because I don't want to assume I understand. | appreciate having은 질문 시간을 긍정 평가하고 assume I understand는 이해 여부를 섣불리 단정하지 않겠다는 자기 태도다. 어떤 문화 집단이 어렵거나 신비롭다는 일반화가 아니며 B2 의견과 이유로 가능하다. 원래 B는 유지한다. |
| lyd-33 | lei_day | That's fine. You can stay here and watch. | 참여 유보를 수락하고 여기에서 볼 수 있다고 답한다. 실제 행사 관찰 허용 규정이 아닌 가상 Guide의 응대이고 원래 B는 유지한다. |
| lyd-39 | lei_day | For now, I'd rather focus on what the guide explained. | focus on은 현재 Guide가 실제로 설명한 재료와 절차 범위를 선택한다는 뜻이다. 문화 전체를 이해했다거나 더 묻지 말아야 한다고 말하지 않으며 B2 선호 표현으로 가능하다. 원래 B는 유지한다. |
| dpt-04 | dole_plantation | We start at this display, and you can ask questions here. | this display와 here는 상황에 명시된 현재 설명 자리를 가리킨다. 두 t1 후보 모두에 시작 위치와 질문 가능 여부를 알려 주며 실제 투어의 시작 절차를 주장하지 않아 원래 B를 유지한 채 괜찮게 본다. |
| dpt-05 | dole_plantation | Later, the guide shows the garden. The shop visit is separate. | 현재 설명 후 정원 안내, 가게는 별도라는 순서는 상황의 가상 진행값이다. shows the garden은 그 안내 활동을 가리킬 수 있고 다음 요약 확인의 근거를 주므로 문구 오류로 단정하지 않는다. 실제 프로그램을 인증하지 않고 B를 유지한다. |
| dpt-08 | dole_plantation | That's right. The shop is a separate visit. | 직전 shop visit 구분을 확인하므로 shop을 별도 방문 활동으로 줄여 말한 뜻이 문맥에서 복원된다. 더 명시적인 shop visit을 선호할 수 있으나 기능상 고장으로 보지 않으며 실제 운영 정보가 아니므로 B를 유지한다. |
| dpt-09 | dole_plantation | Yes. You can ask the guide questions in the garden. | t2에서 정원 질문 시간 여부를 고른 갈래에만 나온다. 정원에서 guide에게 질문할 수 있다는 직접 응답이고 상황의 가상 절차이므로 현장 정책 인증 없이 B를 유지한다. |
| dpt-10 | dole_plantation | This picture shows our meeting points: this display and the garden entrance. | 그림과 두 모임 지점이 상황에 제공되어 this picture, this display, garden entrance 모두 가리킬 대상이 있다. 실제 지도나 현장 배치의 정확성을 보증하지 않으므로 B를 유지한다. |
| dpt-13 | dole_plantation | We meet here first, before going to the garden entrance. | 현재 자리에서 먼저 설명한다는 상황과 dpt-04를 되말한다. t3의 요약 확인 및 순서 질문 양쪽에 답하며 실제 모임 순서로 일반화하지 않고 B를 유지한다. |
| dpt-18 | dole_plantation | Can we visit the shop without joining the garden tour? | 정원 투어 참여가 가게 방문의 조건인지 직원에게 묻는 요청이다. 가능하다고 스스로 단정하지 않고 dpt-20에서 가상 조건을 답하므로 현지 운영 미확인만으로 오류가 아니며 B를 유지한다. |
| dpt-20 | dole_plantation | Yes. The shop visit is separate from the garden tour. | t5의 투어 참여 없이 방문 가능한지 질문에 Yes와 별도 방문 설명으로 답한다. 실제 입장 조건이 아니라 상황에 정한 가상 조건이므로 B를 유지한다. |
| dpt-21 | dole_plantation | The shop is here on the map, near this display. | map과 display를 함께 가리키는 응답이 dpt-19의 위치 요청을 완결한다. 가게가 설명 자리 가까이 있다는 배치는 가상 지도값이므로 B를 유지한다. |
| dpt-29 | dole_plantation | These two cups are the same price. Both fit in this box. | 보여 주는 두 컵과 상자에 these, both, this를 쓸 수 있다. 같은 가격과 두 컵 각각이 상자에 맞는다는 가상 조건을 알려 주며 한 개 선택과 모순되지 않아 B를 유지한다. |
| dpt-32 | dole_plantation | For one small cup, the total is twelve dollars. | 앞의 두 후보 모두 작은 컵 한 개를 고르므로 For one small cup이 수량을 유지한다. 십이 달러는 상자를 포함한 가상 총액으로 정해져 있어 실제 가격 인증 없이 B를 유지한다. |
| dpt-35 | dole_plantation | Yes. The screen shows twelve dollars, including the box. | 상자 포함 여부에는 Yes로 답하고 화면 요청에는 금액 표시를 안내하므로 두 갈래에 맞는다. 금액과 상자 포함은 상황의 가상값이며 화면 설명을 실제 결제 완료로 읽지 않고 B를 유지한다. |
| dpt-38 | dole_plantation | Yes, cash and cards are both accepted here. | 현금 허용 요청에 Yes로 답하면서 현금과 카드 모두 받는다는 가상 조건을 제시한다. 실제 매장 정책을 보증하지 않고 이 현금 갈래에만 이어지므로 B를 유지한다. |
| mfh-04 | manoa_falls_hike | I don't have a new update yet. Please wait here. | 직원에게 새로 확인한 정보가 없다는 설정을 n1에서 양쪽 질문에 알린다. wait here는 가상 입구의 대기 진행이며 현실 등산의 충분한 안전 지침이나 통행 허가가 아니므로 B를 유지한다. |
| mfh-05 | manoa_falls_hike | This notice asks visitors to wait for an update. | 가상 안내문의 대기 요청 내용을 소개하므로 notice가 이후 질문과 동행 요약의 지시 대상이 된다. 실제 현장 표지나 정책을 옮긴 대사가 아니어서 B를 유지한다. |
| mfh-08 | manoa_falls_hike | Yes. Staff will give an update before you decide. | t2의 대기 후 결정 요약에 Yes로 답하며 직원 업데이트를 기다리는 가상 순서를 확인한다. 뒤에서도 업데이트가 없다고 반복하므로 즉시 안전 승인이나 출발 약속으로 읽지 않고 B를 유지한다. |
| mfh-09 | manoa_falls_hike | No. This notice asks visitors to wait; it isn't a weather report. | 날씨 정보 범위 질문에 No라고 답하고 안내문이 대기 요청임을 설명한다. 가상 문서와 날씨 보고를 구분하는 응답이며 실제 표지의 문구 검증이 아니므로 B를 유지한다. |
| mfh-10 | manoa_falls_hike | The weather report may change, and we don't have the trail update yet. | 날씨 보고의 변화 가능성과 길 상태 업데이트 부재를 각각 말한다. 특정 예보나 안전 상태는 주지 않고 다음 설명·출처 질문의 근거를 제공하는 가상 정보 한계 설명이므로 B를 유지한다. |
| mfh-13 | manoa_falls_hike | Please wait for the update before making any plans to walk. | 정보 한계가 걷기 계획에 미치는 영향을 물은 갈래에 결정 전 기다리라고 재설명한다. 실제 위험 수치나 산행 요령을 새로 주지 않는 가상 진행 안내라 B를 유지한다. |
| mfh-14 | manoa_falls_hike | You can ask us here. We don't have the update yet. | where 질문에 here로 장소를 답하고 아직 정보가 없다는 한계를 보존한다. 가상 직원에게 다시 묻는 출처 안내이며 실제 현장 인력이나 업무를 보증하지 않아 B를 유지한다. |
| mfh-18 | manoa_falls_hike | I can explain it again: please wait here for the update. | 상황은 t5의 요약 또는 불확실성 표현 뒤 다시 직원에게 묻는 행동을 제공한다. 따라서 정확한 요약 갈래 뒤에도 직원의 재확인이 가능하며, 가상 대기 안내 재설명만 하므로 B를 유지한다. |
| mfh-21 | manoa_falls_hike | I don't have a time to give you yet. | 시점 질문에 아직 알려 줄 시간이 없다고 직접 답한다. I do not have a time은 공유할 예상 시각을 아직 갖고 있지 않다는 문맥이고 실제 운영 일정 인증이 아니므로 B를 유지한다. |
| mfh-22 | manoa_falls_hike | We don't have the trail update yet, so we can't answer questions about trail conditions. | 대기 이유 질문에 아직 길 상태 정보가 없어 답할 수 없다고 설명한다. 직원의 정보 한계를 밝히며 위험 판정이나 등산 안전 보장으로 확장하지 않는 가상 이유여서 B를 유지한다. |
| mfh-26 | manoa_falls_hike | Of course. We can talk here without entering the trail. | Of course는 두 t7 요청을 수락하고 여기서 의논하며 길에 들어가지 않는다는 가상 진행 조건을 확인한다. entering the trail의 입구 진입 뜻은 문맥에서 분명하며 실제 통행 안전이나 허가를 판정하지 않아서 B를 유지한다. |
| mfh-27 | manoa_falls_hike | We could visit a shop later if we decide against the walk. | 이미 논의한 walk를 decide against로 포기할 경우라는 조건을 붙인다. 가게 방문은 later의 가능한 대안이고 즉시 이동하는 명령이 아니다. 연어 뜻은 이 B2 문맥에 맞지만 실제 수업 난도 인증 없이 원래 B를 유지한다. |
| mfh-29 | manoa_falls_hike | That sounds reasonable, but let's wait for the update first. | that은 t8의 두 대안 중 발화된 제안을 받아 긍정 평가하며 업데이트를 먼저 기다리자는 조건을 붙인다. reasonable은 기존 표의 B2 낱말이고 타당성 판단은 대안 계획에 대한 것이며 길의 안전 판정이 아니므로 B를 유지한다. |
| mfh-31 | manoa_falls_hike | There's no update yet. What would you like to do for now? | 마지막에도 정보가 없다고 명시하고 지금 할 일을 묻는다. 아직 업데이트를 받았다고 오해시키지 않고 입구 대기와 다른 계획 의논의 두 종료 선택을 받는 가상 상태 설명이라 B를 유지한다. |
| her-01 | hospital_emergency | What brings you to the emergency department today? | What brings you to는 내원 이유를 묻는 기능 질문이고 응급실 상황과 뒤 증상 설명으로 뜻이 분명하다. emergency department라는 장소 말은 진단이나 실제 병원의 분류·접수 순서를 보장하지 않아 기존 B의 현장 확인 한계만 유지한다. |
| her-02 | hospital_emergency | I've had pain in my stomach since this morning, and it's getting worse. | 환자가 since this morning으로 지속 시점과 getting worse로 자기 변화를 보고한다. 악화는 상황에도 A가 말한 변화로 한정되어 있고 질병 원인·진단·치료 판단을 담지 않는다. |
| her-03 | hospital_emergency | My stomach started hurting this morning. I need help explaining what happened. | stomach started hurting는 환자가 아픈 부위를 일상 말로 설명하는 뜻이다. 뒤 I need help는 언어 설명 도움을 요청하며 약이나 처치 요청을 새로 만드는 말이 아니다. |
| her-09 | hospital_emergency | Yes. Please tell me what you saw, without guessing at the cause. | 본 내용을 말하되 원인을 추측하지 말라는 범위 지정이다. cause의 원인을 실제로 설명하거나 진단하지 않고 B의 관찰과 전해 들은 사실 보고에 한정하므로 의학 조언으로 보지 않는다. |
| her-14 | hospital_emergency | What does the pain feel like now? | feel like가 통증의 느낌을 묻는 문맥으로 명확하다. 치료나 원인 판단을 하지 않으며 환자가 느낌을 표현하기 어렵다는 답이나 질문 방식 조정 요청을 할 수 있다. |
| her-15 | hospital_emergency | It's still in my stomach, but I can't describe the feeling clearly. | still은 앞서 계속된 통증을 받고 in my stomach은 이미 말한 부위다. 느낌을 분명히 설명하지 못한다는 한계를 환자가 말하여 표현 실패를 의료적 판단으로 바꾸지 않는다. |
| her-17 | hospital_emergency | Of course. Let's focus on where you feel the pain first. | 질문 방식 요청 her-16에 Of course로 수락하고 위치부터 이야기하자고 범위를 좁힌다. 그 다음 her-18이 한 가지 위치 질문을 하며 치료 순서를 처방하지 않는다. |
| her-18 | hospital_emergency | Can you point to where it hurts? | 아픈 위치를 손으로 가리켜 달라는 언어 도움 질문이다. 어느 장기나 질병인지 판정하지 않고 다음 here를 실제 가리킴과 함께 말할 수 있다. |
| her-21 | hospital_emergency | I'll note what you've told me. We also need some details for registration. | note는 두 앞 후보 모두에게 설명을 기록하겠다는 응답이고 registration details로 접수 정보 장면을 예고한다. 증상 뒤 양식으로 넘어가는 순서는 가상 진행이며 진료 전반의 실제 우선순위를 인증하지 않는다. |
| her-23 | hospital_emergency | Could you help me with the form while {B} gets my ID? | B가 A의 ID를 가져오는 동작은 A가 허락해 자기 가방에서 꺼낸다는 상황에 명시되어 있다. while이 동행자 도움과 양식 작성을 함께 진행하는 관계를 나타내며 실제 병원 필수 요건을 단정하지 않는다. |
| her-24 | hospital_emergency | Use this form. Your friend can bring your ID to this desk. | 양식과 ID 전달 책상을 가리키며 두 접수 후보에 답한다. this desk는 현재 창구의 가상 위치이고 실제 어떤 응급실에서든 신분증이 먼저 필요하다는 규칙으로 일반화하지 않는다. |
| her-25 | hospital_emergency | Are you the patient or the person who came with the patient? | B에게 patient인지 companion인지 구별하는 질문으로 두 후보가 자신은 A와 함께 왔다고 답한다. 실제 임상 접수에 이 문장을 반드시 사용한다는 주장은 아니며 patient의 B1 등급을 유지한다. |
| her-26 | hospital_emergency | I'm here with {A}, and I have permission to hand you my friend's ID. | B가 A의 동행자임과 ID 전달 허락을 받았다는 사실을 밝힌다. 상황의 A 허락에 근거하고 타인의 서류를 임의로 제출할 권한이나 실제 개인정보 정책을 판정하지 않는다. |
| her-28 | hospital_emergency | Yes. Please hand it to me, and I'll return it after checking the details. | it은 바로 앞 친구 ID를 받으며 확인 후 반환하겠다고 약속한다. A의 ID 소유는 유지되고 제출·반환은 가상 응대라 실제 병원 문서 보관 정책을 보장하지 않는다. |
| her-29 | hospital_emergency | Please check the patient's name and address on the form. | 작성한 form의 patient name과 address를 확인해 달라는 요청이다. 상황이 양식 작성 시간을 명시해 빈 양식을 확인하는 오류가 없고 실제 기록 형식이나 진료 요건을 정하지 않는다. |
| her-34 | hospital_emergency | Please stay here until a staff member comes to speak with you. | here는 현재 접수 위치이고 직원이 와서 말할 때까지 기다리라는 가상 안내다. 지시를 실제 응급 대응의 완전한 절차로 제시하지 않으며 후반에 증상 변화의 보고 대상을 따로 질문할 수 있다. |
| her-37 | hospital_emergency | Stay here, at this desk, until a staff member comes to speak with you. | at this desk가 직전 here를 구체화하여 대기 위치 재질문에 답한다. 짧은 위치 재안내이며 실제 병원 대기 장소·진료 순서의 정보가 아니라 상황의 가상 책상이다. |
| her-40 | hospital_emergency | Tell me or another nurse if anything changes; I'll note what you report. | me or another nurse로 두 변화 보고 질문에 대상만 답한다. note what you report는 환자가 말한 사실을 기록하겠다는 약속이며 진단·약·용량·처치를 새로 제시하거나 진료 완료를 주장하지 않는다. |
| hbc-02 | hanauma_bay_conservation | Could you explain why visitors should keep their distance from sea life? | keep their distance from은 거리를 두라는 가상 안내의 이유를 정중히 묻는다. 거리 수치나 실제 하나우마 규정을 말하지 않고 hbc-04의 공간 설명으로 받는다. |
| hbc-03 | hanauma_bay_conservation | I'd like to understand how our choices affect sea life. | choices affect sea life는 방문자의 선택이 미치는 영향에 초점을 요청하는 뜻이 분명하다. 다음 가상 설명의 방해받지 않을 공간과 이어지며 구체적인 생물 행동이나 현장 규정을 덧붙이지 않는다. |
| hbc-04 | hanauma_bay_conservation | Animals need space to feed and rest without being disturbed. | without being disturbed는 먹거나 쉬는 동안 방해받지 않는다는 수동 표현으로 앞의 두 설명 요청에 맞는다. 장면이 정한 일반적인 보호 이유만 말하며 특정 종의 행동이나 입수 안전성을 인증하지 않는다. |
| hbc-05 | hanauma_bay_conservation | For this visit, please watch from a distance and leave things where you find them. | For this visit가 이번 가상 방문 조건의 범위를 표시한다. from a distance와 leave things where you find them은 관찰 및 물건 유지 지시로 연결되고, 상황이 실제 환경 규정과 명시적으로 구별한다. 포괄적인 실제 안전 지침으로 승인한 것이 아니다. |
| hbc-08 | hanauma_bay_conservation | Sea life needs a place to live, so we try to leave that place unchanged. | that place는 같은 문장 안의 a place to live를 받는다. leave that place unchanged는 공간을 그대로 두려는 가상 설명이며, 물건 보존 이유와 보호 대상 질문 두 갈래에 답한다. |
| hbc-10 | hanauma_bay_conservation | So the idea is to protect sea life by giving it space. | by giving it space는 앞에서 들은 공간 보호 이유를 요약한다. sea life는 집합적인 단수 표현이어서 it과 연결되며 새 현장 정보를 덧붙이지 않는다. |
| hbc-11 | hanauma_bay_conservation | Yes. We want visitors to enjoy the bay without changing it. | Yes로 요약을 확인하고 it은 같은 문장의 bay를 받는다. we는 가상 안내자의 설명 주체이며 실제 관리기관의 공식 설명이나 변화가 전혀 없다는 과학적 보장을 대변하지 않는다. |
| hbc-13 | hanauma_bay_conservation | I think the reason matters because people follow advice more carefully when they understand it. | I think가 개인의 의견임을 드러낸다. because와 when으로 이해와 안내 준수를 연결하는 B2 의견 기능이 성립하며 모든 방문자의 실제 행동을 입증한 사실로 읽지 않았다. |
| hbc-15 | hanauma_bay_conservation | We want people to notice how their actions affect the place. | notice how their actions affect the place는 가상 안내의 교육 목적을 보충하는 문장이다. 목적 설명 자체는 명확하고 실제 기관의 운영 방침을 주장하지 않는다. hbc-14에서 요청 대상을 명시하지 않은 문제는 요청 줄에서 보완한다. |
| hbc-16 | hanauma_bay_conservation | If we see something unusual, should we ask a member of staff? | If we see something unusual은 가정 조건이고 a member of staff는 직원 한 사람을 가리키는 이해 가능한 표현이다. 구체적인 위험 대응이나 안전 허가를 정하지 않고 다음 가상 문의 절차로 이어진다. 미국 현장 사용 빈도는 인증하지 않았다. |
| hbc-17 | hanauma_bay_conservation | Please ask us before you act if you're unsure what to do. | ask us는 직전 직원 문의를 가상 안내자 쪽에 먼저 하라는 응답이다. before you act와 if you are unsure가 행동 전 확인 조건을 보존한다. 문의 상대와 절차는 상황의 가상 값이며 실제 긴급 대응을 완결하는 안내로 읽지 않았다. |
| hbc-19 | hanauma_bay_conservation | Give sea life space so it can live without our visit changing its home. | without our visit changing its home은 우리 방문으로 서식 공간을 바꾸지 않게 하자는 압축된 B2 설명이다. 문법상 visit이 changing의 주어이며 its는 앞의 sea life를 집합적으로 받는다. 낱말 뜻을 문자 그대로 방문이라는 사람으로 해석할 필요는 없고 실제 보존 규정이나 특정 서식지 상태를 새로 단정하지 않는다. |
| hbc-22 | hanauma_bay_conservation | I support this approach, although I'd like people to have clear explanations. | support this approach는 지금 들은 보호 접근에 대한 지지이고 although 이하가 명확한 설명의 필요를 덧붙인다. 기존 설명을 전혀 듣지 않았다고 말하거나 이미 행동을 시작하는 것이 아니라 방문자가 받을 설명에 조건을 두는 B2 의견이다. |
| hbc-23 | hanauma_bay_conservation | I understand the goal, but I'm unsure how to judge each situation. | 목표를 이해하는 것과 각각의 상황을 판단할 확신이 없는 것을 구별한다. judge each situation은 의견·판단 기능이며 실제 위험을 판정하거나 행동 허가를 내리지 않는다. |
| hbc-25 | hanauma_bay_conservation | A short example would help us connect the advice with our choices. | short example이 필요한 도움을 답하고 connect the advice with our choices는 안내를 선택과 연결해 이해한다는 뜻이다. 새 보존 정책을 요구하지 않으며 hbc-27의 가상 사례가 이어진다. |
| hbc-26 | hanauma_bay_conservation | Could we check our understanding before moving on? | moving on은 같은 안내 대화의 다음 단계로 넘어감을 뜻한다. 이해 확인 요청 뒤 hbc-27의 사례를 들어 다시 확인할 수 있고 실제 이동이나 자동 행동 시작을 뜻하지 않는다. |
| hbc-27 | hanauma_bay_conservation | For example, watching without moving things leaves the place as you found it. | leaves the place as you found it는 관찰하며 물건을 옮기지 않는 사례에서 이전 상태를 유지한다는 설명이다. 사례 요청과 이해 확인 요청 양쪽의 가상 안내를 보충하며 실제 장소 규정이나 모든 관찰 행동의 안전을 보장하지 않는다. |
| hbc-29 | hanauma_bay_conservation | They could ask staff instead of assuming that a small action makes no difference. | They는 직전 visitors who feel unsure를 받는다. instead of assuming은 작은 행동의 영향이 없다고 섣불리 판단하지 말자는 이유를 직원 문의 제안에 붙이며 구체적인 규정이나 위해 정도를 결정하지 않는다. |
| hbc-32 | hanauma_bay_conservation | I understand the reason, but I'd like to read the guidance before making plans. | 이유 이해와 계획 전 guidance 검토를 구별하므로 안내 내용 전체를 이미 안다고 전제하지 않는다. guidance는 앞의 보호 안내를 받고, 가상 자료 공동 검토 제안으로 이어지며 실제 자료 존재를 보증하지 않는다. |
| hbc-33 | hanauma_bay_conservation | No further questions. I think protecting this place is worth a little inconvenience. | worth a little inconvenience는 보호를 위해 약간의 불편을 감수할 가치가 있다는 개인 평가다. No further questions로 추가 문의가 없음을 말하며 실제 입수나 작업을 강제하지 않고 특정 문화의 가치를 폄하하지 않는다. |
| hbc-34 | hanauma_bay_conservation | We can go over the guidance together before you decide what to do. | go over the guidance together는 가상 안내문 공동 검토 제안이다. before you decide가 앞으로의 행동 결정을 남겨 두어 hbc-32의 계획 전 검토 요청에 맞고, 실제 검토가 완료되었다고 말하지 않는다. |
| hbc-35 | hanauma_bay_conservation | Thanks. We'll check with staff whenever we're uncertain about an action. | whenever we are uncertain about an action은 직원 확인 계획에 조건을 붙인다. 앞서 설명한 가상 문의 절차를 이어 받으며 실제 현장의 직원 가용성이나 안전 승인을 보장하는 말이 아니다. |
| hbc-36 | hanauma_bay_conservation | Thanks. We'll keep the reason in mind when we decide what to do. | keep the reason in mind는 앞에서 들은 보호 이유를 앞으로 결정할 때 고려한다는 뜻이다. 아직 계획을 검토한다는 마지막 상황과 맞고 당장 행동을 시작하거나 안내문 이해가 완료되었다고 선언하지 않는다. |
| kmd-04 | kamehameha_day | We'll hear a short talk first, then there will be time for questions. | short talk와 그 뒤 질문 시간을 설명하여 t1의 두 갈래 모두에 답한다. we는 Guide와 방문자들이 앞으로 함께 들을 집단을 받을 수 있으며 실제 행사 일정은 아니다. 원래 B는 유지한다. |
| kmd-05 | kamehameha_day | Please let the speaker finish before asking a question. | speaker의 말이 끝날 때까지 질문을 기다려 달라는 공손한 부탁이다. 이 집단의 가상 진행 방식으로 범위가 정해져 특정 문화의 보편 규칙처럼 말하지 않는다. 원래 B는 유지한다. |
| kmd-06 | kamehameha_day | Is that to help everyone follow the talk without interruptions? | follow the talk는 이야기의 흐름을 이해한다는 뜻이며 without interruptions가 왜 기다리는지의 가설을 구체화한다. 이유 확인을 묻는 B2 문장이고 원래 B는 유지한다. |
| kmd-10 | kamehameha_day | We'll listen first and ask questions afterward, so we don't miss the speaker's point. | afterward는 선행 listen first 다음 질문을 받는다. speaker's point는 화자의 요지를 놓치지 않겠다는 일반 목적이며 아직 그 요지를 들었다고 주장하지 않는다. B2 요약과 이유로 가능하고 원래 B는 유지한다. |
| kmd-11 | kamehameha_day | The plan puts listening before questions. Have I understood the order correctly? | puts listening before questions는 순서에서 듣기를 먼저 둔다는 비유다. 직전 가상 계획을 재진술하고 understood correctly로 확인받으므로 B2 이해 확인에 맞는다. 원래 B는 유지한다. |
| kmd-12 | kamehameha_day | That's right. The question period comes after the talk. | That's right가 두 요약 갈래를 확인하고 question period를 이야기 뒤의 질문 시간으로 바로 풀어 준다. B1 기능 응답으로 의미가 구체화되어 있고 가상 순서임을 유지한다. 원래 B는 유지한다. |
| kmd-14 | kamehameha_day | I appreciate having time for questions, but I'd prefer a brief introduction. | appreciate having으로 질문 시간의 장점을 평가하고 brief introduction으로 짧은 안내 선호를 말한다. 앞의 short talk 약속과 모순되는 요구가 아니며 B2 장점과 선호 표현으로 가능하다. 원래 B는 유지한다. |
| kmd-15 | kamehameha_day | I support listening first, provided there's time to ask about unclear points. | provided가 질문 시간이 있다는 조건 아래 듣기 우선 계획을 지지한다는 뜻을 명확히 한다. 실제 행사 운영 조건을 확정하는 말이 아닌 방문자의 조건부 의견이며 원래 B는 유지한다. |
| kmd-16 | kamehameha_day | What would help you get more from the talk, {B}? | get more from the talk는 이야기에서 더 많이 이해하거나 얻을 도움을 묻는 청크다. 이후 background의 필요 또는 끝까지 듣는 전략으로 답할 수 있어 B1 대화 기능이 명확하며 원래 B는 유지한다. |
| kmd-17 | kamehameha_day | A little background would help me understand why people care about this day. | background는 이 기념일이 사람들에게 왜 의미가 있는지 이해할 배경 정보의 필요다. 개인의 지식 부족을 말할 뿐 원주민 전체의 신념이나 역사 사실을 만들어 단정하지 않는다. B2 설명 필요 표현으로 가능하고 원래 B는 유지한다. |
| kmd-20 | kamehameha_day | Could you tell us how to ask something without interrupting the group? | 집단의 흐름을 끊지 않고 질문할 방법을 Guide에게 정중히 묻는다. without interrupting은 자기 참여 방식을 확인하며 실제 현지 예절을 스스로 확정하지 않는다. 원래 B는 유지한다. |
| kmd-22 | kamehameha_day | Please wait until I invite questions, and then give others a turn too. | I로 Guide가 질문을 여는 담당자임을 말하고 다른 사람에게도 차례를 주라고 안내한다. speaker와 Guide는 다른 역할로도 가능하며 이 집단의 가상 방식일 뿐 실제 행사 규칙은 아니다. 원래 B는 유지한다. |
| kmd-26 | kamehameha_day | I'll invite questions when the speaker has finished. | I는 바로 앞 kmd-22에서 질문을 초대한다고 한 Guide다. speaker가 끝나면 자신이 초대한다는 담당자와 시점 확인으로 자연스럽고 실제 행사 인력을 인증하지 않는다. 원래 B는 유지한다. |
| kmd-28 | kamehameha_day | I'd suggest waiting because everyone should have a chance to hear the full explanation. | I'd suggest로 가정 속 제안임을 밝히고 모두 설명을 들을 기회를 이유로 든다. 특정 집단을 훈계하거나 문화 관습을 대변하지 않는 B2 이유 제안이며 원래 B는 유지한다. |
| kmd-29 | kamehameha_day | I'd note the question so my friend could ask it at the right time. | note the question은 그 가정 상황에서 질문을 적어 두겠다는 동사 쓰임이다. so 뒤 친구가 알맞은 때 묻도록 한다는 목적이 있어 발언 자체를 막는 뜻이 아니다. B2 대응 제안으로 가능하고 원래 B는 유지한다. |
| kmd-31 | kamehameha_day | I'd like to balance my wish to ask questions with other people's chance to listen. | balance A with B는 자기 질문 욕구와 타인의 청취 기회를 함께 고려한다는 관계다. wish와 chance가 두 필요를 분명히 나누며 본인이 앞으로 지킬 태도를 말하는 B2 의견으로 가능하다. 원래 B는 유지한다. |
| kmd-32 | kamehameha_day | I don't want to assume that being interested gives me the right to interrupt. | being interested와 right to interrupt를 구별하는 자기 태도다. 관심만으로 발언 권한을 단정하지 않겠다는 말이며 문화 집단의 성격이나 실제 법적 권한을 주장하지 않는다. 원래 B는 유지한다. |
| kmd-33 | kamehameha_day | Shall we wait for the talk and compare our thoughts afterward, {B}? | Shall we는 동행에게 앞으로 이야기를 듣고 생각을 나눌 계획을 제안한다. compare our thoughts는 두 사람의 생각을 나란히 살피겠다는 B2 표현이고 아직 들은 것으로 가정하지 않는다. 원래 B는 유지한다. |
| kld-05 | kailua_lanikai_day | Let's leave the afternoon open in case either of us needs a rest. | 앞에서 아직 오후를 확정하지 않았으므로 leave the afternoon open은 결정을 남겨 두자는 뜻이 분명하다. in case either of us는 어느 동행자든 쉬고 싶을 가능성을 포함하며 B2 조건부 제안에 맞지만 원래 B는 유지한다. |
| kld-06 | kailua_lanikai_day | Could we keep the plan flexible instead of filling every hour? | 일정의 여유를 논의하는 자리여서 flexible은 계획을 바꿀 수 있다는 뜻이고 filling every hour는 모든 시간을 채우는 부담을 가리킨다. 상대에게 완화를 요청할 수 있으며 실제 지역 발화 빈도는 인증하지 않고 B를 유지한다. |
| kld-08 | kailua_lanikai_day | We should check travel time and today's conditions before fixing our schedule. | travel time은 이동에 걸리는 시간을 확인하는 정상적인 대상이고 conditions는 상황에서 남겨 둔 현장 조건이다. before fixing our schedule은 이 문맥에서 일정 확정을 뜻하며 실제 조건이 확인되었다고 말하지 않으므로 B2 검토 범위에서 원래 B를 유지한다. |
| kld-11 | kailua_lanikai_day | Would you rather pack a light lunch or buy food later, {B}? | pack a light lunch와 buy food later는 준비 방법의 대안이고 would rather는 그 선호를 묻는다. 장소에 실제 가게가 있다고 단정하지 않으며 kld-12는 준비 선호, kld-13은 결정 유보로 응답할 수 있어 문구를 유지하고 원래 B도 남긴다. |
| kld-15 | kailua_lanikai_day | I can pack fruit and sandwiches. Would you take care of the water? | 음식은 A가 맡고 물은 B에게 맡길지 묻는 준비 분담이다. take care of the water의 대상이 곧 kld-16/17의 bring water로 구체화되어 돌봄이나 의료 행동으로 오해할 필요가 없고 원래 B는 유지한다. |
| kld-18 | kailua_lanikai_day | Think about hats and sunscreen before you finish packing. | 모자와 자외선 차단제를 생각해 보라는 검토 제안이며 장비가 충분하다고 단정하지 않는다. 상황이 가상 준비 목록과 실제 안전 확인의 한계를 명시하여 두 준비 후보 뒤에 성립하고 원래 B를 유지한다. |
| kld-22 | kailua_lanikai_day | How will you fit the activities around lunch? | 이미 공동 점심을 정한 뒤라 fit the activities around lunch는 점심을 중심으로 활동 순서를 배열하는 뜻이다. kld-23/24가 오전 휴식과 오후 산책으로 구체화하므로 B1의 구동사 이해는 문맥으로 가능하되 원래 B는 유지한다. |
| kld-28 | kailua_lanikai_day | What needs to be settled before you leave? | settled는 출발 전 정해야 할 계획 사항을 뜻하며 앞서 아직 열어 둔 시간과 조건을 받는다. B1 줄에 허용된 한 단계 어휘 판단은 근사임을 남기되 문구 기능은 성립하여 원래 B를 유지한다. |
| kld-30 | kailua_lanikai_day | Could we write down the remaining checks so neither of us forgets them? | remaining checks는 앞서 남긴 이동 시간과 조건 확인이고 them은 바로 그 확인 항목을 받는다. neither of us는 두 사람 모두 잊지 않도록 하자는 B2 범위의 이유절이며 원래 B를 유지한다. |
| kld-31 | kailua_lanikai_day | Check travel times and conditions, then choose when to leave. | 이동 소요 시간과 현장 조건 확인 후 출발 시각을 고르는 순서를 정리한다. 구체적인 실제 교통 시간이나 안전 조건을 제시하지 않고 출발도 실행하지 않으므로 가상 준비 대화에서 허용되며 원래 B를 유지한다. |
| kld-32 | kailua_lanikai_day | So we have a plan for food and gear; the departure time is still open. | food and gear는 앞서 정한 음식과 물품, departure time은 아직 고르지 않은 출발 시각이다. 합의된 준비와 열린 결정 사항을 구분하는 B2 요약이며 open의 뜻도 앞의 유보 흐름에 맞아 원래 B를 유지한다. |
| kld-34 | kailua_lanikai_day | You can keep planning here until those details are clear. | here는 상황에 명시된 가상 계획 자리를 가리키고 those details는 바로 앞의 미확정 확인 항목이다. 실제 안내 서비스나 해변 시설의 존재를 보장하지 않는 종료 안내라 유지하며 원래 B도 남긴다. |
| dcl-04 | dukes_celebration | We're celebrating our anniversary. Could you add a note? | anniversary를 먼저 알렸으므로 add a note의 메모 내용과 예약이라는 기록 대상이 문맥에 있다. B1의 짧은 설명·부탁 기능이며 실제 듀크스의 메모 제도를 요구 사항으로 단정하지 않는다. 원래 B는 보존한다. |
| dcl-06 | dukes_celebration | I'll add an anniversary note. | 직전 기념일 메모 요청을 anniversary note로 구체적으로 수락한다. 상황이 메모 기록을 가상 절차로 규정하므로 실제 매장 정책 미확인은 문구 오류가 아니다. 원래 B는 보존한다. |
| dcl-07 | dukes_celebration | I'll note that you prefer a quiet dinner. | 직전 quiet dinner 선호를 같은 내용으로 기록하겠다고 말한다. 기록 계획은 조용한 자리 보장과 구별되며 뒤의 보장 불가 응답과 충돌하지 않는다. 원래 B는 보존한다. |
| dcl-11 | dukes_celebration | Does six still work for you, {B}? | work for you는 여섯 시가 동행 일정에 맞는지 묻는 뜻이며 다음 퇴근 시간 설명이 그 뜻을 명확히 한다. 상황에 여섯 시 예약과 공동 계획이 있어 still의 재확인도 가능하다. 원래 B는 보존한다. |
| dcl-13 | dukes_celebration | Seven is available. Would you like to change the reservation? | 제안된 일곱 시가 가능하다고 알려 주고 실제 변경 의사를 별도로 묻는다. 이 가능 시각은 허구 예약 현황이며 자동 변경을 먼저 선언하지 않는다. 원래 B는 보존한다. |
| dcl-15 | dukes_celebration | Your reservation is now for two at seven, under the same name. | 명시적 변경 동의 뒤 두 명·일곱 시·같은 이름을 요약한다. 다음 날 방문하는 상황 전환과 일치하지만 현실 예약이 실행됐다는 인증은 아니므로 원래 B는 보존한다. |
| dcl-18 | dukes_celebration | A quieter table matters more to us than the view. | matters more to us than이 조용함과 전망의 우선순위를 명시한다. 창가 제안 직후라 view의 비교 대상이 이해되고 B2 선호 설명 기능에 맞는다. 원래 B는 보존한다. |
| dcl-19 | dukes_celebration | I'll note your preference, but I can't promise a particular table. | 선호 기록과 특정 자리 보장 불가를 but로 구별한다. 창가 요청과 조용함 우선 후보 모두에 대응하고 상황의 가상 요청 절차를 실제 운영 원칙으로 단정하지 않는다. 원래 B는 보존한다. |
| dcl-23 | dukes_celebration | Your table is ready. Please come with me. | 두 도착 후보 뒤 공통 NPC 차례에서 자리 준비를 알리고 함께 이동하도록 안내한다. 실제 매장 준비 상태는 아닌 상황의 가상값이며 원래 B는 보존한다. |
| dcl-24 | dukes_celebration | This is the table we have available. | 현재 제공할 수 있는 테이블을 소개하는 말이다. 상황에 문 근처 테이블이 있어 this의 지시 대상이 있고 이후 자리 변경 요청을 막지 않는다. 원래 B는 보존한다. |
| dcl-25 | dukes_celebration | Could we sit somewhere quieter, if another table is open? | another table is open은 이 좌석 문맥에서 이용 가능한 다른 테이블이 있다는 조건이다. 조용한 곳을 정중히 요청하고 가상 직원의 대안 제안으로 답을 받으므로 실제 자리 변경 보장 없이 기능이 성립한다. 원래 B는 보존한다. |
| dcl-27 | dukes_celebration | There is another table inside. Would you like to see it? | 상황의 다른 안쪽 테이블을 제안하며 먼저 보겠는지 묻는다. 현재 테이블도 실내일 수 있으나 inside는 이 장면에서 더 안쪽 자리라는 지시로 읽힌다. 실제 매장 배치를 단정하지 않으며 원래 B는 보존한다. |
| dcl-30 | dukes_celebration | It's farther from the door. Please follow me. | 문에서 더 멀다는 답과 follow me 안내가 함께 있어 위치 질문 또는 보기 동의 양쪽을 받을 수 있다. 상황에 실제로 안쪽 자리를 보는 행동이 있으며 허구 동선을 현실 매장 안내로 인증하지 않는다. 원래 B는 보존한다. |
| dcl-32 | dukes_celebration | Would this table work better for us, {B}? | work better for us는 보러 온 대안 테이블이 두 사람의 선호에 더 맞는지 평가하는 뜻이다. 앞의 조용한 곳·문에서 떨어진 곳 요청과 현재 관찰이 비교 근거를 제공한다. 원래 B는 보존한다. |
| dcl-35 | dukes_celebration | I'll note your choice and bring your menus. | 자리 합의 뒤 선택을 기록하고 메뉴를 가져오겠다는 계획이다. 기록은 상황에 있는 가상 현장 절차이며 메뉴 제공은 주문 완료 선언이 아니다. 원래 B는 보존한다. |
| ags-06 | ala_moana_gift_shopping | These two bags might work. One is smaller than the other. | these로 직원이 보여 주는 두 가방을 가리키고 might로 적합성 제안을 완곡하게 한다. 크기 차이는 상황의 허구 상품값이며 뒤의 smaller 비교 기준을 제공한다. 원래 B는 보존한다. |
| ags-08 | ala_moana_gift_shopping | How do they differ apart from the size? | apart from the size가 이미 제시된 크기 차이를 제외하고 다른 점을 묻는 비교 범위를 명확히 한다. B2에서 differ와 apart from을 묶는 기능이 성립하고 뒤 주머니 차이 설명을 받는다. 원래 B는 보존한다. |
| ags-10 | ala_moana_gift_shopping | The larger bag has more pockets. Both are easy to clean. | 주머니 수라는 차이와 둘 다 청소하기 쉽다는 공통 관리 조건을 구별하여 답한다. 상황에 허구 상품 비교값이라고 명시되어 있어 실제 제품 관리 안내로 인증하지 않는다. 원래 B는 보존한다. |
| ags-11 | ala_moana_gift_shopping | I'll open both bags so you can see the space inside. | 두 가방을 열어 수납 공간을 보여 주겠다는 계획이다. 상황이 t3 뒤 실제로 열어 보여 준다고 명시하므로 약속만 하고 다음 대화로 넘어간 누락으로 판정하지 않는다. 원래 B는 보존한다. |
| ags-14 | ala_moana_gift_shopping | The smaller bag costs less. Which would you prefer? | 허구 가격 비교에서 작은 가방이 더 저렴하다고 먼저 밝힌 뒤 선호를 묻는다. t6의 가격 재확인 요청도 뒤에 받아 주므로 즉시 구매를 강요하지 않는다. 원래 B는 보존한다. |
| ags-17 | ala_moana_gift_shopping | The prices are on these labels. The smaller bag costs less. | 눈앞 라벨에 있는 가격을 확인하도록 하면서 작은 가방이 더 저렴함을 설명한다. 가상 라벨이 가격 비교의 자료이므로 큰 가방의 숫자를 대사로 읽지 않았다고 필수 정보 누락으로 단정하지 않는다. 원래 B는 보존한다. |
| ags-20 | ala_moana_gift_shopping | A box, please. Could you keep the price off the gift? | keep the price off the gift는 이 선물 포장 문맥에서 가격 표시가 선물에 남지 않게 해 달라는 결과 요청으로 이해할 수 있다. 상황이 가격 표시 제거를 가상 처리값으로 명시하므로 어떤 실제 매장의 선물 영수증 제도를 전제할 필요가 없다. 원래 B는 보존한다. |
| ags-22 | ala_moana_gift_shopping | I'll use a box and keep the price off the gift. | 양쪽 후보의 상자 선택을 받아 포장 계획을 알린다. 가격을 선물에 남기지 않겠다는 말은 상황에 있는 가상 포장 처리이고 추가 구매·비용을 자동 승인하는 뜻은 아니므로 ags-21 뒤도 고장으로 단정하지 않는다. 원래 B는 보존한다. |
| ags-23 | ala_moana_gift_shopping | Do you want to take it with you or ask about shipping? | 직접 가져갈지 배송을 먼저 알아볼지 묻는다. 뒤 두 후보는 배송 가능 여부 또는 비용을 알아보는 응답이라 문의를 실제 발송 승인으로 바꾸지 않는다. 배송 문의 수용은 허구 절차이며 원래 B는 보존한다. |
| ags-26 | ala_moana_gift_shopping | We can send it to the address you provide. I'll check the cost. | 주소를 제공하면 보낼 수 있다고 설명하고 비용 확인은 계획으로 남긴다. 배송 서비스와 절차는 명시된 허구 설정이므로 실제 모든 주소에 배송된다는 현재 정책 주장으로 보지 않는다. 원래 B는 보존한다. |
| ags-27 | ala_moana_gift_shopping | I'll check the cost using the address you provide. | 제공받을 주소를 기준으로 비용을 확인하겠다는 직접적인 응답이다. 아직 주소가 작성되지 않았다는 점을 미래 계획이 보존하며 실제 점포 견적 체계를 단정하지 않는다. 원래 B는 보존한다. |
| ags-28 | ala_moana_gift_shopping | Please write the address here so I can check the shipping cost. | 배송 견적을 위해 주소를 적을 위치를 가리키는 요청이다. 상황이 주소 작성·공동 확인을 t10 뒤 행동으로 제공하므로 실제 주소가 없다는 미답 문제는 없다. 원래 B는 보존한다. |
| ags-30 | ala_moana_gift_shopping | The total is thirty dollars. Delivery should take about five days. | 가상 합계 20+2+8=30을 제시하고 should와 about로 닷새를 예상 기간으로 말한다. 실제 배송 도착이나 요금의 보장이 아니며 견적 수락은 뒤에 별도로 받는다. 원래 B는 보존한다. |
| ags-33 | ala_moana_gift_shopping | Yes, those three items are included in this total. | those three items는 직전 A가 말한 가방·상자·배송을 직접 받는다. 세 항목 포함 합계는 상황의 허구 계산값이며 실제 추가 세금·수수료 정책을 일반화하지 않는다. 원래 B는 보존한다. |
| ags-34 | ala_moana_gift_shopping | The charges are for the bag, box, and shipping. | 가방·상자·배송이라는 비용 용도를 밝히므로 each charge is for 질문의 항목 설명 기능에 답한다. 숫자별 비용은 상황의 가상 견적이고 이 대사는 실제 점포 가격 구성 인증이 아니다. 원래 B는 보존한다. |
| ags-36 | ala_moana_gift_shopping | Please pay this total before I prepare the package. | 합의한 합계를 결제한 뒤 포장 준비한다는 순서를 알려 준다. 아직 결제·포장·발송이 완료됐다고 하지 않고 명시된 가상 순서만 제시하므로 원래 B는 보존한다. |
| dhs-02 | diamond_head_sunrise | I'd like to confirm our entry plans before we check the bags. | entry plans는 상황에 공급된 가상 입장 계획을 가리키며 실제 입장 요건이나 예약 완료를 주장하지 않는 확인 요청이다. bags 확인 전이라는 순서도 다음 NPC와 맞고 원래 B를 유지한다. |
| dhs-04 | diamond_head_sunrise | Your entry plans are confirmed in this scene. Let's check your bags next. | in this scene이 확인 범위를 가상 장면으로 직접 제한한다. 상황이 가상 입장 계획 확인을 공급했고 양 요청 뒤 가방 확인으로 연결되므로 실제 예약 보증의 오류로 보지 않으며 원래 B를 유지한다. |
| dhs-08 | diamond_head_sunrise | Take your time. Check both bags together before you decide. | 결정 전에 시간을 갖고 두 가방을 함께 확인하라고 안내한다. 상황에서 확인 행동이 실제 가상 진행으로 공급되어 약속만 하고 즉시 완료를 주장하는 고장은 없으며 실제 안전 판정도 대신하지 않아 원래 B를 유지한다. |
| dhs-09 | diamond_head_sunrise | We've checked both bags, and each of us has water and a light. | 상황에 명시된 t3 뒤 공동 확인 행동을 마친 후 하는 보고다. each of us와 water and a light는 dhs-05의 물품 질문에 답하고 완전한 산행 준비라고 확대하지 않으므로 원래 B를 유지한다. |
| dhs-12 | diamond_head_sunrise | Could we wait a moment and agree on a pace before we start? | 출발 전 잠시 기다리며 걸을 속도를 합의하자는 요청이다. dhs-13이 기다림을 수락하고 t6에서 서두르지 않는 공동 속도를 제안하므로 agree on a pace의 대상이 추상적으로 사라지지 않아 원래 B를 유지한다. |
| dhs-13 | diamond_head_sunrise | Of course. Agree on a pace before you make your final decision. | dhs-12 요청 갈래에만 연결되어 Of course가 기다림 수락으로 자연스럽다. 속도 합의 뒤 최종 결정을 하자는 순서는 t6/t7과 맞으며 실제 안전 속도를 정하지 않아 원래 B를 유지한다. |
| dhs-15 | diamond_head_sunrise | Yes. We've checked everything together, and we're both ready to start. | everything은 이 가상 장면에서 정한 공동 확인과 속도 합의를 받는다. t3 뒤 행동 및 t6 뒤 질문이 공급되어 준비 보고가 선행 정보 없이 생기지 않으며 실제 산행 안전을 보증하는 말로 확대하지 않고 원래 B를 유지한다. |
| dhs-17 | diamond_head_sunrise | Take a moment here before we talk about your year of practice. | here는 상황에서 t7 뒤 가상 산행을 마치고 쉬는 정상으로 지정했다. 장면 전환이 공급되어 실제 이동 시간이 사라진 고장으로 보지 않으며 회상 전 잠시 쉬자는 안내로 성립하여 원래 B를 유지한다. |
| dhs-18 | diamond_head_sunrise | Looking back on your practice this year, what can you do better now? | looking back on은 지난 연습을 돌아보는 틀이고 better now는 뒤의 과거와 현재 변화 두 후보를 받는다. 실제 사용자의 성취를 평가하는 말이 아니라 상황의 두 가상 학습자 회상 질문이므로 원래 B를 유지한다. |
| dhs-21 | diamond_head_sunrise | And what stands out to you? | 바로 앞의 올해 연습 변화 질문이 계속되는 문맥이라 stands out은 가장 기억에 남는 변화를 묻는다. B가 자기 방법 또는 A 질문의 도움을 답할 수 있고 구동사의 실제 빈도는 인증하지 않으므로 원래 B를 유지한다. |
| dhs-22 | diamond_head_sunrise | I learned to ask for another explanation instead of pretending I understood. | 이해한 척하는 대신 설명을 더 요청하게 되었다는 학습 변화다. pretending과 understood는 기존 합쳐진 등급표에 있으며 instead of가 방법을 비교하는 B2 구조로 기능한다. 실제 성취 인증 없이 역할 회상으로 받아들여 원래 B를 유지한다. |
| dhs-26 | diamond_head_sunrise | When I lost my place, you waited and helped me start again. | lost my place는 연습에서 어디까지 진행했는지 놓친 경우로 읽을 수 있고 waited and helped me start again이 그 도움을 구체화한다. 단순히 말문이 막혔다는 뜻으로 보편화하는 인증은 하지 않으며 이 연습 회상 문맥에서는 유지하고 원래 B를 남긴다. |

## 기존 A 가운데 새로 의심한 모든 줄

| 줄 ID | 미션 | 영어 | 이유 | 상태 |
| --- | --- | --- | --- | --- |
| aph-35 | apartment_hunting | Could we come back at another time to hear the street noise again? | t2에서 업무 공간 aph-06, t3에서 책상 배치 aph-11을 택하면 소음 듣기 제안 aph-08과 소음 확인 요청 aph-10을 모두 지나지 않는다. 공통 aph-12와 상황은 창문·배치 확인만 보장하므로 이전 소음 청취를 전제하는 again을 빼 추가 방문 요청만 유지한다. | problem |
| lyd-37 | lei_day | They help, but I'd need more information before discussing their history. | t11 질문의 labels를 They로 받은 뒤 their history에서는 lei의 역사를 뜻하려 해 지시 대상이 바뀐다. 가까운 문법 선행사는 labels여서 이름표의 역사인지 레이의 역사인지 학습자가 혼동할 수 있다. 판단 유보 기능을 유지하면서 history of the lei로 대상을 명시한다. | problem |
| lyd-38 | lei_day | Let's ask the host where we can find more information. | t6에서 lyd-21을 택하면 lyd-23이 host를 소개하지만 lyd-20 > lyd-22 경로에는 담당자가 나오지 않는다. 상황은 정보 탁자를 제공하나 host의 존재·시각적 소개를 명시하지 않아 the host를 두 사람이 이미 특정할 수 있는지 텍스트만으로 확정하기 어렵다. 가상 장면 오류로 단정하지 않고 기존 A를 유보한다. | pending |
| dpt-37 | dole_plantation | Can I pay in cash instead? | t10에서 이 후보를 고른 경로에는 앞서 카드 결제 의사나 카드 기본값이 나온 적이 없다. 화면에 따로 제시된 다른 선택 dpt-36은 이 경로에서 발화되지 않아 instead의 대비 대상을 대화 안에서 만들지 못한다. 현금 허용 요청 기능을 유지하면서 instead만 빼면 없는 앞 결제 선택을 전제하지 않는다. | problem |
| her-35 | hospital_emergency | So we should wait here and speak to a staff member when they come? | 대기 장소와 직원이 오면 이야기하는지 확인하는 질문형 요약은 영어 자체가 명확하다. 그러나 her-36과 달리 응답 갈래가 없어 다음 환자의 질문으로 넘어가 확인 답이 남으므로 문구보다 흐름 보완이 필요하다. | problem |
| kld-09 | kailua_lanikai_day | Could we plan lunch first and set the travel time later? | travel time은 바로 앞 kld-08과 뒤 kld-29/31에서 이동 소요 시간인데 set the travel time은 그 기간을 임의로 정하는 뜻 또는 출발 시각을 정하는 뜻으로 갈린다. 마지막 kld-32의 departure time과 같은 결정 대상임을 명시하면 계획 순서 조정 기능을 그대로 두면서 기간과 시각의 혼동을 없앤다. | problem |

## conversation problems

현재 원문에 대한 제안이다. ID·기능·갈래·차례를 실제 수정하지 않았다. 문구 교체안 적용만으로 아래 구조 항목이 해결되었다고 말하지 않는다. 확정 문제와 판단 유보를 구분한다.

| 미션 | 상태 | 정확한 차례 | 현재 줄 ID | 경로 | 문제 | 가장 작은 변경 제안 | 문구만으로 해결 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| airport_rental_car | 문제 | t6 | acr-23, acr-24 | t6 acr-21 → acr-23 → acr-24 → t7 acr-25/acr-26 | 갈래는 정상이나 옵션이 비용을 leave out한다는 말이 보장 제외인지 요금표 누락인지 모호하다. acr-24의 exclusions와 기능 칸은 보장 제외를 뜻한다. | acr-23만 비용을 보장하지 않는 범위를 물도록 바꾼다. ID·기능·갈래·실제 제외 조건은 유지하며 새로운 보험 내용을 만들지 않는다. | 예 |
| apartment_hunting | 문제 | t8, n7, t9, n8 | aph-29, aph-30, aph-33 | t8 aph-27 → aph-29 → n7 aph-30 → t9 aph-31/aph-32 → n8 aph-33 | 조용한 시간과 소음 신고 방법 중 신고 방법이 공유 답변에 남는다. aph-30은 guest rules와 quiet hours만 함께 검토하고 이후 aph-33의 연락처는 수리용이므로 소음 신고 방법을 대신하지 않는다. | aph-30의 같은 가상 서면 안내에 소음 신고 방법도 적혀 있음을 명시하고 함께 읽는다. 실제 연락처·규칙·의무는 만들지 않는다. | 예 |
| apartment_hunting | 문제 | t2, t3, n2, t10 | aph-06, aph-11, aph-12, aph-35 | t2 aph-05 → aph-06 → t3 aph-09 → aph-11 → n2 aph-12 → t4~t9 → t10 aph-34 → aph-35 | 이 경로는 소음 제안 aph-08과 소음 확인 요청 aph-10을 거치지 않는다. 공통 창문·책상 확인과 요청한 행동의 시간만으로 거리 소음을 이미 들었다는 완료 사실을 보장할 수 없어 again의 앞선 행동이 없다. | aph-35에서 again만 빼고 다른 시각의 추가 방문으로 거리 소음을 확인하려는 요청은 그대로 둔다. | 예 |
| lei_day | 문제 | t11 | lyd-35, lyd-37 | t10 lyd-34 > t11 lyd-35 > lyd-37 | 질문의 labels를 They로 다시 받은 뒤 their history의 대상은 lei로 바뀌어 두 지시 대상이 섞인다. 레이의 역사를 아직 판단하지 않겠다는 의도는 상황과 맞으나 학습자가 이름표의 역사로 읽을 수 있다. | lyd-37의 마지막 소유대명사 대신 레이의 역사라고 직접 적어 같은 평가와 판단 유보 기능을 유지한다. | 예 |
| lei_day | 유보 | t6, t12 | lyd-20, lyd-22, lyd-38 | t6 lyd-20 > lyd-22 > t7~t11 임의 선택 > t12 lyd-38; 대비 경로: t6 lyd-21 > lyd-23 > t12 lyd-38 | 유보: 역사 질문 경로의 lyd-23에서만 host를 소개한다. 다른 경로는 the host를 이미 특정할 수 있다는 전제가 필요한데 상황의 정보 탁자가 담당자의 시각적 소개까지 포함하는지 텍스트만으로 확정하기 어렵다. 참조 단절이나 실제 문화 사실 오류로 단정하지 않는다. | 모든 갈래에서 정보 탁자의 담당자가 보이고 두 사람이 그 역할을 알 수 있다는 짧은 상황 설명을 제안한다. 다른 방법은 lyd-38을 특정 담당자 존재를 전제하지 않는 추가 문의 제안으로 바꾸는 것이다. 이번에는 역할 가정을 확정하지 않고 교체를 보류한다. | 예 |
| dole_plantation | 문제 | t10 | dpt-37 | t1 dpt-02 -> n1 dpt-04+dpt-05 -> t2 dpt-06>dpt-08 -> t3 dpt-11>dpt-13 -> t4 dpt-15>dpt-17 -> t5 dpt-18>dpt-20 -> t6 dpt-23 -> n2 dpt-25 -> 상황의 준비 확인 뒤 가게 전환 -> t7 dpt-27 -> t8 dpt-30 -> t9 dpt-33>dpt-35 -> t10 dpt-37>dpt-38 -> n3 dpt-39 -> 상황의 결제 성공 확인 -> n4 dpt-40 | 이 경로와 다른 모든 현금 선택 경로에서 직전까지 카드 결제 제안이나 카드 기본값이 발화 또는 상황으로 주어지지 않는다. t10의 화면 선택지 dpt-36을 읽을 수 있다는 점과 이 경로에서 그 말을 실제로 했다는 점은 다르므로 instead가 받아야 할 앞 결제 선택이 대화에 없다. 결제가 중단되는 고장이 아니라 불필요한 대비 전제를 학습시키는 문구 문제다. | dpt-37에서 대신이라는 뜻의 낱말만 삭제하여 현금으로 결제해도 되는지 요청한다. 현금 허용 요청 기능, ID, 등급, dpt-37>dpt-38 갈래 및 t10은 유지하고 연결 연습 dpt-p10만 같은 새 문구로 맞춘다. | 예 |
| hospital_emergency | 문제 | t10, t11, n2 | her-34, her-35, her-38, her-39, her-40 | t10 her-34 → her-35 → t11 her-38/her-39 → n2 her-40 | her-35는 대기하고 직원이 오면 이야기하면 되는지 묻는 확인 질문인데 응답 갈래가 없어 A의 새로운 질문으로 넘어간다. her-40은 변화 보고 대상만 답하여 앞 요약을 명시적으로 확인하지 않는다. 대기 지시의 의료적 적정성을 판정한 문제는 아니며 질문과 답의 연결 문제다. | 구조 제안만: 기존 her-37을 요약 질문에도 응답하도록 her-35 > her-37 갈래를 추가하는 안을 검토한다. her-37의 재안내가 대기 요약을 다시 확인하므로 모든 ID·대사·기능·차례는 그대로 둘 수 있다. 원문에는 적용하지 않았다. | 아니오 |
| hanauma_bay_conservation | 문제 | t4, t5 | hbc-12, hbc-14, hbc-15, hbc-16 | t4 hbc-12 → hbc-14 → hbc-15 → t5 hbc-16 | hbc-14가 어떤 한 지점을 설명해 달라는지 특정하지 않아 hbc-15의 안내 목표 보충이 요청한 지점을 답했는지 확인할 수 없다. 상황은 추가 이유 설명만 정하고 특정 지점을 가리키는 행동은 공급하지 않는다. | hbc-14에서 안내의 목표를 설명해 달라는 대상을 명시한다. 결정 전에 설명을 요청하는 기능과 같은 ID·등급·갈래·차례를 유지하는 문구 한 줄만 제안한다. | 예 |
| hanauma_bay_conservation | 유보 | t7, t8, t9 | hbc-21, hbc-22, hbc-23, hbc-24 | t7 hbc-21 → t8 hbc-22 → t9 hbc-24 (비교 경로: hbc-21 → hbc-23 → hbc-24) | 판단 유보 항목이다. hbc-23의 상황 판단은 that judgment의 직접적인 대상이지만 hbc-22의 지지 의견 뒤에는 이미 한 지지 판단과 앞으로 할 행동 판단 중 무엇을 가리키는지 넓다. 대화 전체의 결정 주제를 받는 해석도 가능하므로 확정된 파손으로 세지 않는다. | 사람 검토에서 지칭이 불명확하다고 확인되면 hbc-24의 공유 도움 질문에서 앞으로 행동을 결정하는 판단이라는 범위를 직접 드러내도록 같은 기능으로 재진술한다. 실제 교체안은 보류한다. | 예 |
| kailua_lanikai_day | 문제 | t3, n2, t11, n6, t12 | kld-07, kld-09, kld-10, kld-29, kld-31, kld-32 | t3:kld-07 > kld-09 > n2:kld-10 > t4~t10의 모든 후보 > t11:kld-29 또는 kld-30 > n6:kld-31 > t12:kld-32 또는 kld-33 | kld-09/10에서 정하거나 열어 두는 travel time(s)이 뒤의 확인 대상인 이동 소요 시간인지 kld-32의 departure time인지 흐려진다. 차례 참조가 끊기거나 출발을 강제하는 문제는 아니지만, 기간을 확인하는 일과 시각을 정하는 일을 한 대상으로 가르칠 수 있는 의미 연결 문제다. | ID·기능·차례·갈래를 유지하고 kld-09의 설정 대상을 출발 시각으로 명시한다. kld-10은 음식과 장비를 먼저 계획하고 언제 떠날지는 뒤에 고른다고 재진술한다. 이동 소요 시간을 확인하는 kld-08/29/31은 그대로 둔다. | 예 |

## 미션별 전체 대화 재독

### eggs_n_things_special_requests

상황·37대사·13연습·12점수 차례·NPC 전용 n1과 9갈래를 전문으로 읽었다. t1~t3에서 A의 우유 알레르기와 성분·공유 조리 공간·직원 보증 한계를 확인하고 음식 주문을 하지 않으므로 진단·복용량·알레르기 안전 허가를 생성하지 않는다. t2의 조리 담당자 확인/조리 과정 질문은 각각 esr-06/esr-07에 닿은 뒤 esr-08로 합류한다. t4~t6에서 B만 달걀·토스트·치즈 제외를 주문하고 두 소스 선택은 상황에 기록·유지가 명시되어 있어 esr-18의 요약에서 소스를 다시 말하지 않아도 취소된 주문으로 보지 않는다. t7 전 음식 제공과 t10 전 새 달걀 제공은 명시된 장면 전환이고, t7의 문제 지적/교체 요청 양쪽 뒤 새 접시 계획을 t8의 새 조리 요청이 구체화한다. t9의 수락/물 요청, t10의 외관 확인/포크 요청은 각각 같은 대기·교체 상태를 보존하며 모든 분기 답변이 존재한다. t11~t12는 계산서 요청·검토이며 첫 접시 청구 질문은 esr-37이 답하고 결제 완료를 주장하지 않는다. 128개 후보 조합을 확인해 참조 누락·도달 불가 줄·이미 답한 공통 NPC 질문 반복은 찾지 못했다. 음식·운영·열 분·청구 범위는 허구 값이고 실제 매장 정보나 완전한 안전 지침으로 인증하지 않았다. esr-26의 A2 관용 청크 난도만 유보하며 구조 수정 제안은 없다.

### polynesian_cultural_center

상황과 39개 대사, 12개 연습, 점수 차례 t1~t12와 11개 갈래를 모두 읽었다. 모든 차례 첫 NPC와 후보, 갈래 목적지가 존재한다. t1 방문 목적 뒤 t2의 비교 질문과 시간 질문은 각각 pcc-07과 pcc-08로 답한다. t3~t4에서 설명을 먼저 듣는 공동 계획에 합류하고 t5 양쪽에서 인사, 음악, 질문 순서를 받아 t6 확인과 t7 추가 질문이 근거를 가진다. t8의 이해 확인 의견과 듣기 방법 제안은 공연 내용을 이미 이해했다는 선언이 아니다. 상황의 t8 뒤 설명 종료, t10 뒤 일정표 확인 또는 휴식 후 확인 동작을 그대로 인정했고 t11~t12는 다음 선택의 비교와 도움 계획이다. 휴식 갈래를 요청 무시나 자동 이동으로 판정하지 않았다. 자리 A와 B는 각 6개 점수 차례이며 NPC 질문의 중복 사용은 없다. 숫자와 위치와 진행은 가상값이고 실제 센터 시간표, 좌석, 촬영 규칙, 노래 뜻, 역사와 문화 의미는 새로 단정하지 않는다. 문구 교체나 참조 파손을 찾지 못했다. 실제 음성·게임 장면 구현과 현지 교사 검수는 확인하지 않았다.

### airport_rental_car

상황과 대사 40줄, 연습 17줄, 점수 차례 t1~t11 및 n1~n5를 각각 모두 읽었다. 네 갈래의 후보 원천과 NPC 대상, 모든 첫 줄과 두 대안의 이후 합류가 존재한다. A만 운전하고 A 자신의 서류를 제출하며 B는 공동 비용과 조건을 묻는 역할이 유지된다. 이름 조회 경로는 직원의 조회 수락을 받고, 서류 추가 여부는 n1의 수령 확인이 답한다. 보험 범위와 서면 질문은 상황이 실제 읽기·필요한 설명 시간을 보장하므로 선택 이전 정보가 빠졌다고 단정하지 않는다. 추가 보험은 자료에 표시한 한 가지이며 거절 또는 추가 결과가 공통 화면 합계로 반영된다. 사본은 n3에서 양쪽 경로 모두 받고, 반납 조건은 n4의 같은 서류에서 확인해 n5에서 표시·재설명한다. 서명 의향 또는 유보로 끝나며 실제 서명·결제·차량 인수 완료는 말하지 않는다. acr-23의 보장 제외와 비용 목록 누락 사이 모호함만 같은 기능의 문구로 명확히 한다. 실제 업체 가격·보험 상품·법·서류 규칙을 검증하거나 추천하지 않았으며 문화 비하·슬랭은 찾지 못했다.

### apartment_hunting

상황과 대사 40줄, 연습 18줄, 점수 차례 t1~t11 및 n1~n9를 모두 읽었다. 두 갈래와 모든 차례의 첫 줄·후보·공통 안내가 존재하며 같은 NPC 질문을 중복해서 되묻는 차례는 없다. 방문 순서를 들은 뒤 공간·창문·책상 확인을 실제 할 시간을 상황에서 주고, 가상 월세 이천 달러·전기 별도·수도 포함·일 년 계약은 각 공통 안내에서 얻는다. 보증금과 납부 시점, 중도 퇴거·기간 협의, 손님 규칙, 수리 연락처·비용 책임은 가상 서면의 확인으로 유보하며 실제 법률이나 매물의 사실로 인증하지 않는다. 다른 서면 제안은 상황에 존재하고 사본을 나중에 읽는 선택 뒤에도 이번 방문 중 일반 질문을 계속할 수 있다. aph-29의 소음 신고 방법은 aph-30에서 빠지므로 같은 서면 검토 문구에 그 항목을 넣는다. 업무 공간·책상 경로에서는 앞서 소음을 들었다는 사실이 보장되지 않아 aph-35의 again을 제거한다. 마지막 기록 수락 aph-40은 기록 요청 갈래에만 연결되어 있고 계약·입주·서명은 양쪽 종료에서 모두 미완료다. 실제 현장 화용·공식 CEFR·게임의 동작 재현은 별도 검증하지 않았다.

### lei_day

상황과 39개 대사, 12개 연습, 점수 차례 t1~t12와 13개 갈래를 모두 읽었다. 모든 첫 줄·후속 NPC·연습 참조가 존재하고 자리 A와 B는 각 6개 점수 차례다. t1 두 갈래 모두 만지기 전 문의 조건을 받고 t2에서 범위 또는 이유를 확인한다. t4~t5에서 두 이름표가 꽃과 잎 재료를 설명하는 것을 들은 뒤 t6에서 요약 또는 역사 정보 경로를 묻는다. 역사 내용이나 실제 식물 종·의례·선물 관습을 창작하지 않으며 lei는 제공된 표기 규칙과 뜻 범위로만 쓴다. t7 활동 질문, t8 조심스러운 의견, t9 참여 조건 또는 관찰 유보 뒤에도 t10~t12는 관찰과 의견이다. 유보 뒤 물건을 만지거나 활동에 자동 참여하는 구조는 없다. lyd-37의 labels에서 lei로 바뀌는 대명사를 문구로 명확히 한다. lyd-38의 the host는 t6 역사 질문 경로에서는 소개되지만 다른 경로에서는 소개되지 않아, 정보 탁자 담당자가 모두에게 보인다는 가상 장면 가정이 필요한지 유보한다. 이는 확정된 갈래 파손이 아니며 원문 상황의 정보 탁자 제공을 부정하지 않는다. 공유 NPC 질문의 반복은 없다. 실제 행사 운영·시각 구현·교사 검수는 확인하지 않았다.

### dole_plantation

상황, 40개 대사, 별도 연습 10개, 점수 차례 10개와 NPC 전용 n1~n4를 모두 읽었으며 11개 갈래의 출발 후보와 NPC 목적지가 존재하고 각 대안 뒤 합류한다. 안내 자리와 정원 입구의 순서, t4의 두 걷기 유보, t6 뒤 준비 확인까지의 머묾 및 별도 가게 장면 전환은 상황에 제공되어 있으므로 없는 출발 동작을 가정하거나 이동 누락으로 잡지 않았다. 가게에서 두 컵 비교 후 모든 선택은 작은 컵 한 개로 합류하고, 가상 총액 십이 달러와 상자 포함을 확인한 뒤 수단 선택, n3 결제 동작 및 진행자의 성공 확인을 거쳐 n4 인도로 이어지며 실제 가격·결제 정책이나 농장 역사·재배법을 인증하지 않는다. 같은 NPC 질문을 이미 답한 뒤 다시 요구하는 구조는 없으나 t10의 현금 후보 dpt-37은 앞선 카드 선택이 없는 경로에도 instead를 써서 대비 대상을 전제하므로 같은 현금 허용 요청에서 이 낱말만 삭제하는 안을 제시한다.

### manoa_falls_hike

상황, 34개 대사, 별도 연습 10개, 점수 차례 10개와 n1/n2를 모두 읽었으며 8개 갈래의 후보와 NPC 목적지 및 모든 차례 첫 줄이 연결된다. 새 날씨·길 정보가 없는 설정에서 t2는 가상 대기 안내의 뜻 또는 범위를 확인하고 t3는 영향 또는 출처를 묻고, t4/t5의 동행 요약·불확실성 표현 뒤 직원에게 다시 묻는 행동이 상황에 있어 t6의 재설명은 근거 없는 끼어듦이나 이미 답한 질문의 중복이 아니다. t7의 유보·다른 장소 논의, t8/t9의 조건부 대안 및 공동 결정은 현재 입구에서의 의논이고 마지막에도 업데이트 부재를 알린 뒤 현재 대기 또는 길에 들어가지 않는 대안 의논으로 끝나며, 즉시 철수·이동 실행 줄은 없지만 걷기 포기 조건과 다른 계획의 선택이 있으므로 자동 입산이나 등산 강행을 요구한다고 보지 않는다. 안내문과 직원 응답은 실제 표지·정책이 아닌 가상값으로 한정되고 위험 수치·장비·산행 요령·통행 허가·안전 판정을 주지 않아 완전한 현실 안전 안내로 쓰이는 줄은 찾지 못했으며, 문구·갈래 수정안은 없고 실제 미국 현지 화용·사람의 B2 학습 난도·음성·게임 동작은 인증하지 않았다.

### hospital_emergency

상황과 대사 40줄, 연습 19줄, 점수 차례 t1~t11 및 n1/n2를 모두 읽었다. 일곱 갈래와 모든 차례 첫 줄·후보·NPC 대상은 존재한다. A가 환자, B가 동행자이며 아침 식사 뒤 통증 시작·앉은 행동·함께 도착한 순서는 상황에 주어진 가상 경위다. 대략 시각과 불확실성 대안은 모순 없이 합류하고 B는 본 행동 또는 A에게 들은 악화만 출처를 밝혀 말한다. 느낌을 말하기 어려운 대안과 질문을 한 번에 하나씩 요청하는 대안 모두 위치 가리킴 질문으로 이어진다. A 허락으로 B가 A 가방의 ID를 꺼내 전달하고 양식을 실제 작성·확인·수정할 시간이 상황에 있어 소유자·접수 정보가 바뀌지 않는다. her-35의 확인형 요약 질문은 응답 없이 t11로 넘어가는 흐름만 구조 제안으로 남긴다. 재질문 her-36에는 her-37이 직접 대기 위치를 답하며 두 마지막 질문은 her-40이 변화 보고 대상만 안내한다. 진단, 질병 원인 판정, 약 이름, 용량, 치료법 및 완전한 응급 대응 지침은 생성하지 않는다. 가상 대기 장소·ID 요건·접수 순서를 실제 병원의 규칙으로 인증하지 않았고 실제 임상 화용·TTS·플레이 재현은 미검증이다.

### hanauma_bay_conservation

상황 전문, 36개 대사, 중복 대사를 별도로 둔 12개 연습, 12개 점수 차례와 10개 갈래를 모두 읽었다. 점수 없는 별도 차례는 0개다. A와 B가 각각 6차례 참여하고 모든 첫 줄·후보·NPC 응답 ID가 존재한다. 9개 양자 선택의 512가지 조합을 기계적으로 구성해 36개 줄 모두의 도달성을 대조하고, 각 선택의 전후 설명·요약·의견·직원 문의·마지막 계획을 독해했다. t1 두 요청은 hbc-04, t2 두 질문은 hbc-08에 합류하여 t3 요약 전에 실제 본문 설명을 듣는다. t4의 의견은 설명 없이 t5로 갈 수 있고 추가 설명 요청만 hbc-15를 듣는다. 그 요청의 대상 누락은 hbc-14 문구 보완으로 제안한다. t5 문의의 us는 가상 안내자와 직원 쪽을 받으며 이후에도 같은 안내 자리에 머문다. t6 직접 이유 전달과 설명 방법 제안이 모두 동행 의견 질문으로 이어진다. t8 hbc-23 뒤에는 t9의 judgment가 분명하지만 hbc-22 뒤에는 지칭 범위를 유보해 기록한다. t9 두 도움 요청은 가상 관찰 사례를 듣고 확인 방법 제안으로 이어진다. t11 자료 검토 요청만 공동 검토 제안을 받으며 질문 종료 평가는 바로 마지막 계획으로 간다. 마지막 두 선택은 확인 계획만 말해 실제 행동이나 입수로 자동 진행하지 않는다. 반복되는 공유 NPC 질문·존재하지 않는 참조·구조적 순환은 발견하지 않았다. 거리 두기, 물건을 그대로 두기, 문의 상대, 공동 안내 검토는 상황의 가상 방문 조건이다. 생물이 살 공간이라는 일반 보호 이유도 주어진 장면 설명으로 읽었으며 실제 하나우마 규정, 운영·안전 지침, 특정 종의 행동으로 인증하지 않았다. 신성한 문화 설명, 하와이 문화 일반화, 실제 가격·계약·의료 조언은 이 미션에 없다. 현지 교사 인증·실제 발화 빈도·게임 동작·TTS는 검증하지 않았다.

### kamehameha_day

상황과 35개 대사, 12개 연습, 점수 차례 t1~t12와 9개 갈래를 모두 읽었다. 모든 첫 줄과 후보 및 갈래 NPC가 존재하며 자리 A와 B는 각 6개 점수 차례다. t1의 진행/질문 시점 두 갈래 모두 듣기 뒤 질문 시간을 받고 t2 이유를 들은 뒤 t3는 그 진행 안내만 요약한다. t4 다른 의견은 t5~t6의 필요한 도움 질문과 전략 답으로 이어져 의견을 자동 동의로 바꾸지 않는다. Guide는 질문을 여는 담당자이고 speaker는 강연자여도 역할 충돌이 없으며 kmd-22에서 담당자를 먼저 소개한다. t8의 kmd-25는 직접 이유 재요약 대신 담당자를 확인하는 의도적인 clarification 대안이다. 공통 kmd-08에서 기다림의 이유를 이미 제공받았고 kmd-26이 요청한 담당자를 답하므로 정상 repair 경로로 인정한다. kmd-08/24의 full point를 full explanation으로 명확히 하는 문구만 제안한다. t9 친구의 일찍 말하기는 가정이고 t10의 반성은 실제 제공된 진행 안내에 대한 의견이다. 마지막 t11~t12도 강연을 기다리고 듣고 생각할 앞으로의 계획이며 실제 역사 강연을 들었다고 가정하지 않는다. 날짜, 왕의 업적, 의례와 역사, 현지 예절을 새로 단정하지 않았고 사람들의 관심을 문화 집단 전체의 고정관념으로 만들지 않는다. 공유 NPC 재질문과 깨진 참조는 없다. 실제 TTS와 게임 실행, 현지 화용 인증은 하지 않았다.

### kailua_lanikai_day

상황, 본문 34줄, 연습 10개, 12개 채점 차례와 7개 NPC 전용 차례를 모두 읽었다. 명시 갈래는 없으며 모든 t/n 차례의 첫 줄과 후보가 실제 ID에 닿는다. t1~t3의 활동 비교와 시간 유보, t4~t7의 점심 선호·과일과 샌드위치 합의·물과 수건 준비, t8의 모자와 차단제 준비, t9~t10의 오전 휴식·점심·오후 산책 순서와 피로에 따른 산책 생략 또는 결정 유보를 대조했다. 상황이 공동 음식 계획을 공급하여 과일만 먼저 제안한 kld-13 뒤 샌드위치 제안과 준비 수락은 거절을 무시한 자동 실행이 아니다. kld-17의 햇볕 물품 질문에는 n3의 kld-18이 답하고 준비 목록은 완전한 장비나 안전 지침으로 쓰지 않는다. t11~n7은 이동 소요·조건 확인을 남긴 채 출발 시각도 확정하지 않고 가상 계획 자리에서 끝난다. 실제 시설·가게·요금·날씨·이동 가능 여부는 주장하지 않으며 문화적 고정관념을 찾지 않았다. kld-09/10의 시간 종류 혼동은 같은 기능 문구만으로 보완한다. 활동 순서 확인 kld-25는 문구 자연스러움 문제이며 두 앞 후보의 순서는 일치한다. 피로 후 실제 철수를 실행하는 장면은 아니고, 산책 생략/유보가 최종 요약에서 사라지거나 강제로 취소되는 경로도 찾지 않았다. 두 자리 채점 참여는 A 7회, B 5회다. 참조 단절·순환·답한 공유 NPC 질문 반복·문구로 해결할 수 없는 구조 문제는 찾지 못했다.

### dukes_celebration

상황·35대사·13연습·12점수 차례·NPC 전용 n1과 12갈래를 전문으로 읽었다. t1~t3의 두 명·다음 날 여섯 시 예약, 기념일 메모/조용한 식사 선호, A 이름과 시간 확인은 각 답변 뒤 같은 예약으로 합류한다. t4~t6에서 동행 일정을 재확인하고 B의 여섯 시 퇴근을 듣고 명시적 동의 뒤 같은 이름으로 일곱 시로 바꾼다. t7의 창가 요청 또는 조용함 우선은 모두 요청 기록·특정 자리 보장 불가 안내로 합류하므로 실제 자리 보장이나 자동 변경을 추가하지 않는다. 다음 날 일곱 시 도착은 상황에 명시되었고 t8 양 후보는 n1의 자리 준비 안내를 받는다. t9 문 근처 자리에서 조용한 곳/문에서 떨어진 곳을 요청하고 dcl-27이 안쪽 대안을 제시한다. t10 양 후보는 dcl-30의 설명·함께 이동으로 답을 받은 뒤 상황대로 자리를 보고 t11~t12에서 두 사람이 평가·합의한다. 64개 후보 조합의 참조·도달·공통 NPC 반복을 확인하여 고장을 찾지 못했고, 이름·인원·시간·선호의 선행 정보가 모든 경로에서 유지된다. 마지막 메뉴 제공 계획은 음식 주문 완료를 뜻하지 않으며 기념일의 특정 문화 행위도 창작하지 않는다. 허구 예약·배치·기록 절차를 실제 듀크스 운영으로 인증하지 않았으며 문구·구조 교체 제안은 없다.

### ala_moana_gift_shopping

상황·37대사·16연습·13점수 차례와 11갈래를 전문으로 읽었다. t1~t2의 선물 받는 사람은 A의 자매이며 B가 A에게 들은 취향·습관을 설명하는 행동이 명시되어 두 사람의 역할이나 she/her의 대상이 바뀌지 않는다. t3의 크기 외 차이/수납 시범은 각각 ags-10/ags-11에 닿고 보여 달라는 후보 뒤 실제로 가방을 열어 보여 주는 행동이 상황에 있다. t4~t5의 사용 예상과 이유 뒤 t6에서 B가 선호를 정하거나 가격을 먼저 물으며, 양쪽 모두 t7에서 A가 작은 가방을 명시적으로 선택한다. t8 양 후보는 상자를 선택하며 ags-22의 가격 표시 제외도 상황의 허구 포장 처리로 읽혀 요청하지 않은 별도 구매나 추가 요금 승인이 되지 않는다. t9의 배송 가능 여부/비용 질문은 문의이며 t10에서 B가 주소를 적고 직원·두 사람이 확인한 뒤 견적으로 넘어간다는 행동이 명시되어 있다. 따라서 t12의 확인한 주소에는 선행 정보가 있고, 삼십 달러 합계는 20+2+8로 맞으며 약 닷새는 should/about의 예상으로만 제시된다. t11 양 질문은 포함 항목 또는 비용 용도를 묻는 기능으로 각 NPC 답을 받고 t12 견적·발송 승인 뒤 t13에서 합계 검토·카드 선택을 한다. 64개 후보 조합에서 참조 누락·도달 불가·반복 NPC 질문을 찾지 못했다. 이름 없는 가게의 상품·가격·포장·배송은 모두 허구 값이고 실제 결제·발송·도착을 자동 완료하거나 현실 정책을 인증하지 않는다. 문구·구조 교체 제안은 없다.

### diamond_head_sunrise

상황, 본문 33줄, 연습 10개, 13개 채점 차례와 6개 NPC 전용 차례를 모두 읽었다. 유일한 갈래 dhs-12 > dhs-13의 원천·NPC 목적지가 존재하고 t5 뒤 t6으로 자연스럽게 합류한다. t1의 양 요청 뒤 가상 입장 계획 상태를 n1에서 공급하고, t2~t3의 각자 물·조명 및 공동 가방 확인 요청 뒤에는 상황이 실제 가상 확인 행동 완료를 명시하므로 t4의 완료 보고는 없는 정보를 사용하지 않는다. t5의 준비 또는 기다림 요청 양쪽 뒤 t6에서 A가 서두르지 않는 속도와 함께 걷기를 제안하고 B에게 다시 준비를 묻는다. t7의 B가 최종 확인하기 전에는 출발하지 않으므로 기다림이 즉시 취소되는 고장으로 보지 않는다. 실제 피로·철수 판단을 다루는 산행 지침은 이 미션의 기능이 아니며 준비 목록이나 두 사람의 ready가 현실의 안전 판정을 대신한다고 읽지 않는다. t7 뒤 정상 휴식 전환은 상황에 공급된 가상 이동이며 실제 개방 시각·일출·입장·예약·안전 상태를 검증한 정보가 아니다. t8~t9에서 A와 B 각각 연습 변화를 돌아보고, t10~t11에서 도움 방식을 질문·회상하며, t12~t13에서 질문 지속 또는 설명 우선 제안 뒤 B의 공동 연습 동의로 끝난다. dhs-27의 each 의견 안내가 A의 제안/B의 수락으로 이어져도 앞의 B 회상 공유가 존재한다. mine, everything, here, that habit의 대상은 각 이전 질문·상황·확인 행동·직전 도움 요약에서 공급된다. 회상은 두 가상 인물의 역할 대화로 명시되어 실제 사용자 성과나 미확정 여행·계약·직장 경험을 지어낸 줄로 보지 않는다. 두 자리 채점 참여는 A 7회, B 6회다. 참조 단절·순환·공유 NPC의 답한 질문 반복·선행 정보 누락·문화적 모욕·수정이 필요한 구조 문제는 찾지 못했다.

## 미션별 집계

| 미션 | 대사 | 연습 | 점수 차례 | 문제 | 유보 | 교체안 | 흐름 항목(유보 포함) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| eggs_n_things_special_requests | 37 | 13 | 12 | 0 | 1 | 0 | 0 |
| polynesian_cultural_center | 39 | 12 | 12 | 0 | 0 | 0 | 0 |
| airport_rental_car | 40 | 17 | 11 | 1 | 0 | 1 | 1 |
| apartment_hunting | 40 | 18 | 11 | 2 | 0 | 2 | 2 |
| lei_day | 39 | 12 | 12 | 1 | 1 | 1 | 2 |
| dole_plantation | 40 | 10 | 10 | 1 | 0 | 1 | 1 |
| manoa_falls_hike | 34 | 10 | 10 | 0 | 0 | 0 | 0 |
| hospital_emergency | 40 | 19 | 11 | 1 | 0 | 0 | 1 |
| hanauma_bay_conservation | 36 | 12 | 12 | 1 | 1 | 1 | 2 |
| kamehameha_day | 35 | 12 | 12 | 2 | 0 | 2 | 0 |
| kailua_lanikai_day | 34 | 10 | 12 | 3 | 0 | 3 | 1 |
| dukes_celebration | 35 | 13 | 12 | 0 | 0 | 0 | 0 |
| ala_moana_gift_shopping | 37 | 16 | 13 | 0 | 0 | 0 | 0 |
| diamond_head_sunrise | 33 | 10 | 13 | 0 | 0 | 0 | 0 |

먼저 볼 세 미션: kailua_lanikai_day (문제 3줄, 흐름 1건), apartment_hunting (문제 2줄, 흐름 2건), kamehameha_day (문제 2줄, 흐름 0건). 문제 줄 수, 흐름 항목 수, 유보 수, ID 순서로 정했다. 문제가 0인 경우에도 실제 영어 화용·음성·PC 플레이를 인증한 것이 아니다.
