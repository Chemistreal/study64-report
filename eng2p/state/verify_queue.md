# B등급 검증 대기열

갱신일: 2026-08-07

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
| out/dialog/eng2p_dialog_q2_001.md | 1층 대화의 자연스러움과 2층 자료의 성질 판정 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q2_002.md | 1층 대화의 자연스러움과 되돌리는 덩어리의 실제 빈도 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q2_003.md | 1층 대화의 자연스러움과 시간 덩어리의 자리 분포 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q2_004.md | 1층 대화의 자연스러움과 의견 세기와 확인의 실제 분포 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q2_005.md | 1층 이야기의 자연스러움과 순서 표시의 실제 밀도 | 보류 | 보류 |
| out/dialog/eng2p_dialog_q2_006.md | 1층 마무리의 자연스러움과 화제 전환 표시의 실제 형태 | 보류 | 보류 |
| out/input/eng2p_input_q1.md | 대체 재료 유형 5종의 조건 충족 여부와 라이선스 표기 | 완료 | 통과 |
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
| out/lectures/eng2p_q2_l028.md | gimme, lemme, dunno, cuz 의 철자 표기와 맞장구 소리의 형태 | 완료 | 통과 |
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

대기 0건 / 보류 38건 / 전체 51건
