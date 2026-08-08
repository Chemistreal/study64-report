신뢰도: A 생성 (제작 관리)

# B등급 검증 대기열

갱신일: 2026-08-08

이 목록은 자동 생성된다. 직접 수정하지 않는다.
검증은 Claude Code가 아니라 대화 세션에서 웹 검색으로 한다.

완료로 세는 조건은 하나다. 검증로그가 아래 형식을 갖추는 것이다.

```
검증로그: 2026-08-07 / 근거 / 통과 / 조치
           날짜        출처   판정   결과
```

판정은 통과, 보류, 기각 셋 중 하나다.
보류는 확인은 했는데 결론이 안 난 것이다. 완료와 따로 센다.
'나중에 확인한다' 는 로그가 아니라 예고문이다. 대기로 센다.
이 규칙이 없으면 예고문을 적는 것만으로 대기열이 0이 된다.

| 파일 | 검증 대상 | 상태 | 판정 |
|---|---|---|---|
| out/cards/eng2p_card_q1_001_050.md | dark l 낱말 목록과 자음군 낱말 목록의 선정 | 보류 | 보류 |
| out/cards/eng2p_card_q1_051_100.md | 연음 자리와 약모음 자리의 낱말 선정, 억양 방향의 대응 | 보류 | 보류 |
| out/cards/eng2p_card_q1_101_150.md | 고빈도 덩어리 목록, 되묻기 3형과 자기수정 3형의 형태, 3레지스터 대표 형태 | 보류 | 보류 |
| out/cards/eng2p_card_q2_001_050.md | 각 자리 덩어리 목록의 선정과 빈도 순위 | 보류 | 보류 |
| out/cards/eng2p_card_q2_051_100.md | 각 자리 덩어리 목록의 선정과 명료화 요청 네 형의 유형 지위 | 보류 | 보류 |
| out/cards/eng2p_card_q2_101_150.md | 이야기와 마무리와 화제 전환 목록의 선정 | 보류 | 보류 |
| out/cards/eng2p_card_q3_001_050.md | 거절 세 층과 불동의 세 조각의 목록 선정, 조건과 이유 표시어의 자리 | 보류 | 보류 |
| out/cards/eng2p_card_q3_051_100.md | 진술을 받는 세 방식, 거절의 세 거리, 조건과 가정 목록, 붙이는 자리 셋 | 보류 | 보류 |
| out/cards/eng2p_card_q3_101_150.md | 설명 세 자리 목록, 관계 세 묶음, 겹침 세 경우, 때 표시 두 방법, 세는 두 규칙 | 보류 | 보류 |
| out/cards/eng2p_card_q4_001_050.md | 잡담 네 자리와 잇는 방법 셋의 목록 선정, 협상과 처음 만난 자리의 표현 선택 | 보류 | 보류 |
| out/cards/eng2p_card_q4_051_100.md | 이음매 셋과 물러나는 말 목록의 선정, 마무리 네 단계의 덩어리 선택 | 보류 | 보류 |
| out/cards/eng2p_card_q4_101_150.md | 레지스터 유지와 자기수정 세 갈래와 물러나는 양 셋의 구분, 규칙 여덟 맞대기의 판정 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q2_001.md | 1층 대화의 자연스러움과 2층 자료의 성질 판정 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q2_002.md | 1층 대화의 자연스러움과 되돌리는 덩어리의 실제 빈도 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q2_003.md | 1층 대화의 자연스러움과 시간 덩어리의 자리 분포 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q2_004.md | 1층 대화의 자연스러움과 의견 세기와 확인의 실제 분포 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q2_005.md | 1층 이야기의 자연스러움과 순서 표시의 실제 밀도 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q2_006.md | 1층 마무리의 자연스러움과 화제 전환 표시의 실제 형태 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q3_001.md | 1층 대화의 자연스러움과 2층 자료의 성질 판정 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q3_002.md | 1층 대화의 자연스러움과 2층 자료의 성질 판정 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q3_003.md | 1층 대화의 자연스러움과 2층 자료의 성질 판정 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q3_004.md | 1층 대화의 자연스러움과 2층 자료의 성질 판정 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q3_005.md | 1층 대화의 자연스러움과 2층 자료의 성질 판정 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q3_006.md | 1층 대화의 자연스러움과 2층 자료의 성질 판정 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q4_001.md | 1층 대화의 자연스러움과 2층 자료의 성질 판정 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q4_002.md | 1층 대화의 자연스러움과 2층 자료의 성질 판정 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q4_003.md | 1층 대화의 자연스러움과 2층 자료의 성질 판정 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q4_004.md | 1층 대화의 자연스러움과 2층 자료의 성질 판정 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q4_005.md | 1층 대화의 자연스러움과 2층 자료의 성질 판정 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q4_006.md | 1층 대화의 자연스러움과 2층 자료의 성질 판정 | 보류 | 보류 |
| out/input/eng2p_input_q1.md | 대체 재료 유형 5종의 조건 충족 여부와 라이선스 표기 | 완료 | 통과 |
| out/input/eng2p_input_q2.md | 대체 재료 유형 5종의 조건 충족 여부 | 보류 | 보류 |
| out/input/eng2p_input_q3.md | 대체 재료 유형 5종의 조건 충족 여부와 3인 자료 확보 가능성 | 보류 | 보류 |
| out/input/eng2p_input_q4.md | 대체 재료 유형 5종의 조건 충족 여부와 넷 이상 자료 확보 가능성 | 보류 | 보류 |
| out/lectures/eng2p_q1_l007.md | going to, got to, ought to 의 축약형 철자 표기 | 완료 | 통과 |
| out/lectures/eng2p_q1_l008.md | want to, have to, has to 의 축약형 철자 표기 | 완료 | 통과 |
| out/lectures/eng2p_q1_l009.md | lot of, out of, kind of, sort of 의 축약형 철자 표기 | 완료 | 통과 |
| out/lectures/eng2p_q1_l010.md | what are you, would you, could you, should have, would have, could have 의 축약형 철자 표기 | 완료 | 통과 |
| out/lectures/eng2p_q1_l015.md | 문말 억양과 뜻의 대응. 근거표 밖 서술이다 | 완료 | 통과 |
| out/lectures/eng2p_q1_l016.md | 고빈도 청크 목록. 근거표 밖 서술이다 | 보류 | 보류 |
| out/lectures/eng2p_q1_l017.md | 인사와 확인에 쓰는 고빈도 덩어리 목록 | 보류 | 보류 |
| out/lectures/eng2p_q1_l018.md | 요청과 응답에 쓰는 고빈도 덩어리 목록 | 보류 | 보류 |
| out/lectures/eng2p_q1_l019.md | 되묻기 3형의 형태와 강도 구분 | 완료 | 통과 |
| out/lectures/eng2p_q1_l020.md | 3레지스터 구분과 각 단계의 대표 형태 | 완료 | 통과 |
| out/lectures/eng2p_q1_l021.md | 자기수정 표지어 세 형태와 각 형태가 쓰이는 자리 | 완료 | 통과 |
| out/lectures/eng2p_q1_l022.md | 시간과 장소에 쓰는 고빈도 덩어리 목록과 전치사 대응 | 완료 | 통과 |
| out/lectures/eng2p_q1_l023.md | 시간 벌기 표현 세 묶음과 각 묶음이 버는 시간의 길이 | 완료 | 통과 |
| out/lectures/eng2p_q1_l024.md | 대화를 여닫는 표현의 단계 구성과 각 단계의 대표 형태 | 보류 | 보류 |
| out/lectures/eng2p_q2_l025.md | 선언 지식과 절차 지식의 구분, 자동화된 상태를 학습자가 스스로 못 알아본다는 서술 | 완료 | 통과 |
| out/lectures/eng2p_q2_l026.md | 600 목록을 여덟 자리로 나누는 구분과 자리별 배분 수 | 보류 | 보류 |
| out/lectures/eng2p_q2_l027.md | 시작 덩어리 목록과 자리별 쓰임 | 보류 | 보류 |
| out/lectures/eng2p_q2_l028.md | give me, let me, don't know, because 가 줄어드는 폭과 맞장구 소리의 형태 | 완료 | 통과 |
| out/lectures/eng2p_q2_l029.md | 이어 붙이는 덩어리 목록과 세 묶음 구분 | 보류 | 보류 |
| out/lectures/eng2p_q2_l030.md | 0.5초를 빈자리 유무로 바꿔 재는 방식 | 보류 | 보류 |
| out/lectures/eng2p_q2_l031.md | 되돌리는 덩어리 목록과 네 묶음 구분 | 보류 | 보류 |
| out/lectures/eng2p_q2_l032.md | 규칙을 먼저 주면 조립으로 돌아간다는 서술과 네 단계 뽑기 절차 | 보류 | 보류 |
| out/lectures/eng2p_q2_l033.md | 속도가 올라갈 때 무너지는 자리 셋과 강세 간격이 유지된다는 서술 | 보류 | 보류 |
| out/lectures/eng2p_q2_l034.md | 시간 덩어리 목록과 앞뒤 자리 구분 | 보류 | 보류 |
| out/lectures/eng2p_q2_l035.md | 막히는 자리를 셋으로 가르는 진단과 종류별 처방 | 보류 | 보류 |
| out/lectures/eng2p_q2_l036.md | 끊기는 자리를 넷으로 가른 구분과 끼어들기 표현 목록 | 보류 | 보류 |
| out/lectures/eng2p_q2_l037.md | 의견 덩어리를 세기 셋으로 가른 구분과 묶음별 목록 | 보류 | 보류 |
| out/lectures/eng2p_q2_l038.md | 지나간 일 표시의 세 소리 구분과 앞으로 할 일 표시 둘의 쓰임 차이 | 보류 | 보류 |
| out/lectures/eng2p_q2_l039.md | 30초를 다섯 자리로 채우는 구성과 멈춤을 2초로 정한 기준 | 보류 | 보류 |
| out/lectures/eng2p_q2_l040.md | 확인 자리를 네 묶음으로 나눈 구분과 묶음별 목록 | 보류 | 보류 |
| out/lectures/eng2p_q2_l041.md | 강세가 옮겨 가는 세 자리 구분과 조동사에 강세가 붙는 자리 | 보류 | 보류 |
| out/lectures/eng2p_q2_l042.md | 명료화 요청 네 형 구분과 확인 실패를 잡아내는 절차 | 보류 | 보류 |
| out/lectures/eng2p_q2_l043.md | 이야기 자리를 네 묶음으로 나눈 구분과 묶음별 목록 | 보류 | 보류 |
| out/lectures/eng2p_q2_l044.md | 60초를 이야기 자리를 늘려 채운다는 구성과 두 바퀴를 금지한 판단 | 보류 | 보류 |
| out/lectures/eng2p_q2_l045.md | 자음이 겹칠 때 앞의 것이 안 들리는 자리 셋과 소리는 남는다는 서술 | 보류 | 보류 |
| out/lectures/eng2p_q2_l046.md | 마무리 자리를 네 묶음으로 나눈 구분과 세 단계 절차 | 보류 | 보류 |
| out/lectures/eng2p_q2_l047.md | 화제를 옮기는 네 방법과 끊긴 대화를 살리는 절차 | 보류 | 보류 |
| out/lectures/eng2p_q2_l048.md | 90초를 두 화제로 채운다는 구성과 분기 마감 측정 항목 | 보류 | 보류 |
| out/lectures/eng2p_q3_l049.md | 3초를 인출 속도가 아니라 반응 속도로 가르는 구분 | 보류 | 보류 |
| out/lectures/eng2p_q3_l050.md | 거절 덩어리를 세 층으로 나눈 구분과 층별 목록 | 보류 | 보류 |
| out/lectures/eng2p_q3_l051.md | 권위 앞의 격식 표지 목록과 배역 장치의 효과 | 보류 | 보류 |
| out/lectures/eng2p_q3_l052.md | 늦는 이유를 넷으로 가른 진단과 초 분포로 읽는 방법 | 보류 | 보류 |
| out/lectures/eng2p_q3_l053.md | 조건 표현을 두 조각으로 가른 정리와 when 의 반례 처리 | 보류 | 보류 |
| out/lectures/eng2p_q3_l054.md | 세 사람 겹침을 둘과 가른 구분과 양보 순서 규칙 | 보류 | 보류 |
| out/lectures/eng2p_q3_l055.md | 질문 종류로 계단을 나눈 순서와 난이도 판단 | 보류 | 보류 |
| out/lectures/eng2p_q3_l056.md | 불동의를 인정과 뒤집기와 근거 셋으로 나눈 구분과 목록 | 보류 | 보류 |
| out/lectures/eng2p_q3_l057.md | 이유와 결과를 두 방향으로 가른 정리와 표시어 배치 | 보류 | 보류 |
| out/lectures/eng2p_q3_l058.md | 진술을 받는 세 방식과 반응 여부 판단을 없앤 처리 | 보류 | 보류 |
| out/lectures/eng2p_q3_l059.md | 거절 길이가 관계에 따라 달라진다는 서술과 세 거리의 층 수 | 보류 | 보류 |
| out/lectures/eng2p_q3_l060.md | 조건과 가정을 가른 구분과 자리별 덩어리 목록 | 보류 | 보류 |
| out/lectures/eng2p_q3_l061.md | LRE 를 일부러 만드는 세 방법과 해결 여부로 세는 규칙 | 보류 | 보류 |
| out/lectures/eng2p_q3_l062.md | 붙이는 자리를 셋으로 가른 정리와 자리별 순서 | 보류 | 보류 |
| out/lectures/eng2p_q3_l063.md | 3인 대화에서 차례를 잡는 네 방법과 이름 부르기의 효과 | 보류 | 보류 |
| out/lectures/eng2p_q3_l064.md | 3인에서 3초가 늦어지는 이유를 차례 판단으로 돌린 서술 | 보류 | 보류 |
| out/lectures/eng2p_q3_l065.md | 설명 덩어리를 세 자리로 가른 구분과 자리별 목록 | 보류 | 보류 |
| out/lectures/eng2p_q3_l066.md | 불동의 세 조각을 관계 묶음별로 조절하는 규칙과 낯선 관계에서 사실을 겨누는 형태 | 보류 | 보류 |
| out/lectures/eng2p_q3_l067.md | 끊긴 뒤 하던 말로 안 돌아간다는 처리 규칙과 겹침 세 경우의 구분 | 보류 | 보류 |
| out/lectures/eng2p_q3_l068.md | 때 표시를 두 방법으로 가른 정리와 표시를 한 번만 한다는 규칙 | 보류 | 보류 |
| out/lectures/eng2p_q3_l069.md | 오해를 알아채는 신호 셋과 어긋난 자리만 다시 낸다는 절차 | 보류 | 보류 |
| out/lectures/eng2p_q3_l070.md | 통과선을 재기 전에 적어 둔다는 절차와 측정 중 교정 금지 규칙 | 보류 | 보류 |
| out/lectures/eng2p_q3_l071.md | 덩어리를 세는 두 규칙과 900의 300 증분을 새 자리 셋에 배분한 구성 | 보류 | 보류 |
| out/lectures/eng2p_q3_l072.md | 두 번 재고 낮은 값으로 판정한다는 절차와 누적 시간 항목을 보류로 두는 처리 | 완료 | 통과 |
| out/lectures/eng2p_q4_l073.md | 3분을 채우는 단위를 문장이 아니라 토막으로 잡은 정리와 토막당 길이 | 보류 | 보류 |
| out/lectures/eng2p_q4_l074.md | 처음 만난 사람 관계의 세 단계 구분과 단계별 덩어리 목록 | 보류 | 보류 |
| out/lectures/eng2p_q4_l075.md | 잡담 덩어리를 네 자리로 가른 구분과 자리별 목록 | 보류 | 보류 |
| out/lectures/eng2p_q4_l076.md | 2초에서 늦는 이유 넷 중 셋이 빠진다는 서술과 남는 하나의 처방 | 보류 | 보류 |
| out/lectures/eng2p_q4_l077.md | 협상과 불동의를 가른 구분과 협상 네 단계 정리 | 보류 | 보류 |
| out/lectures/eng2p_q4_l078.md | 3분 발화에서 끊기는 자리를 셋으로 가른 구분과 자리별 처리 | 보류 | 보류 |
| out/lectures/eng2p_q4_l079.md | 토막을 잇는 규칙을 세 가지로 뽑은 정리와 순서 표시가 앞에 온다는 규칙 | 보류 | 보류 |
| out/lectures/eng2p_q4_l080.md | 잡담 화제를 고르는 세 층 순서와 안 고르는 것의 목록 | 보류 | 보류 |
| out/lectures/eng2p_q4_l081.md | 토막 둘을 잇는 세 이음매 구분과 이음매별 처리 시간 | 보류 | 보류 |
| out/lectures/eng2p_q4_l082.md | 협상 덩어리를 물러나는 말과 맞추는 말로 가른 구분과 자리별 목록 | 보류 | 보류 |
| out/lectures/eng2p_q4_l083.md | 주도권을 넘기는 세 방법과 받는 세 방법의 구분 | 보류 | 보류 |
| out/lectures/eng2p_q4_l084.md | 화제를 버리는 판단 기준 셋과 버리고 옮기는 절차 | 보류 | 보류 |
| out/lectures/eng2p_q4_l085.md | 3분 발화가 무너지는 세 지점 구분과 지점별 복구 방법 | 보류 | 보류 |
| out/lectures/eng2p_q4_l086.md | 처음 만난 사람과의 잡담이 최난도인 이유와 그 자리의 세 제약 | 보류 | 보류 |
| out/lectures/eng2p_q4_l087.md | 시간이 겹치는 자리의 두 형태 구분과 때 표시가 둘로 늘어나는 조건 | 보류 | 보류 |
| out/lectures/eng2p_q4_l088.md | 마무리에 다음 약속을 붙이는 네 단계와 단계별 목록 | 보류 | 보류 |
| out/lectures/eng2p_q4_l089.md | 이음매 셋을 한 발화 안에서 각각 한 번씩 쓴다는 배분 규칙 | 보류 | 보류 |
| out/lectures/eng2p_q4_l090.md | 3분 발화 안에서 레지스터를 하나로 유지한다는 규칙과 바꿔도 되는 조건 | 보류 | 보류 |
| out/lectures/eng2p_q4_l091.md | 3분 발화에서 고칠 것과 두고 갈 것을 가르는 세 갈래 | 보류 | 보류 |
| out/lectures/eng2p_q4_l092.md | 물러나는 양을 셋으로 가르는 구분과 다 물러날 자리를 정하는 규칙 | 보류 | 보류 |
| out/lectures/eng2p_q4_l093.md | 뽑아 둔 규칙 여덟을 맞대어 보는 네 갈래 판정 절차 | 보류 | 보류 |
| out/lectures/eng2p_q4_l094.md | 3분 발화 다섯 항목을 한자리에서 재는 절차와 재기 전에 적어 두는 규칙 | 보류 | 보류 |
| out/lectures/eng2p_q4_l095.md | 화용 넷을 동시에 지키는 것이 종합이라는 정의와 넷 사이의 순서 | 보류 | 보류 |
| out/lectures/eng2p_q4_l096.md | 마감 측정의 두 번 재기와 낮은 쪽 판정, 그리고 남은 것을 적는 절차 | 보류 | 보류 |

대기 0건 / 보류 106건 / 전체 120건
