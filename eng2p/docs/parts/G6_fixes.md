# G6 바로 적용할 문구 교체안

신뢰도: B (미국 영어와 한국 성인 학습자의 기능 대화 관점으로 다시 읽은 AI 검토이며 실제 현지 원어민·교사의 인증은 아니에요.)
검증로그: 2026-10-12 / 전체 원문·상황·차례·갈래 재독 / 검토 완료 / 대사 수정안의 실제 관문 결과와 전체 실행 한계는 zip의 report.md에 기록해요.

원본은 그대로 두고 아래 교체안만 제시합니다. ID·장면·자리·줄 등급·기능·갈래·차례는 유지합니다. reviewer는 관문을 다시 통과시킨 뒤 원문 10칸 표의 영어·점검·이유와 그 줄을 가리키는 모든 연습 표의 영어를 함께 바꿉니다. 연습 ID와 연결 줄 ID는 유지합니다. 여기서 A/B는 교체 영어의 자기 점검입니다. 확신 B의 장면·정책 조건은 가상 설정 안에서만 유효하며 실제 현장 사실 인증이 아닙니다.

| id | new English | self check | reason |
| --- | --- | --- | --- |
| dkd-10 | The fish is good. It comes with rice. | A | - |
| mud-22 | Small for my friend, large for me, please. | A | - |
| pha-13 | Let's read the ingredients on the back together. | A | - |
| pha-17 | We'll ask the pharmacist how to use these. | A | - |
| pha-32 | Keep the label. Ask a pharmacist before using these. | A | - |
| amr-21 | Yes, that's my card. Could you repeat those numbers? | A | - |
| amr-37 | I'll write how long it may take on your receipt. | A | - |
| pnl-35 | Choose a heat setting that matches the labels. | A | - |
| dlp-39 | I like the ocean. Let's sit here. | A | - |
| sfl-04 | We'll start with the safety talk. | A | - |
| phv-22 | Please ask the entrance staff about the bag rules before you enter. | A | - |
| phv-25 | Ask the staff there before you enter. | A | - |
| afp-14 | Yes. Let's listen to the music. | A | - |
| hsh-12 | I don't understand it yet. I'd like to learn more. | A | - |

reason은 원문 10칸 표의 실제 이유 칸에 넣을 값입니다. 원본 검사 규칙에 따라 자기 점검 A는 반드시 `-`로 넣습니다. 교체를 제안한 상세 사유는 G6_review_G2_G3.md의 같은 ID 행에 있습니다. B 교체안은 그 이유를 그대로 넣습니다.

기존 낱말 등급을 내리거나 새로운 낱말 등급 파일을 만들지 않습니다. 문구만으로 해결 불가능한 갈래는 검토표의 고장 기록에 남기며 위 표만 적용해서 완전히 해결되었다고 주장하지 않습니다.

## 구조 수정 (2026-10-12, G6 이 남긴 marukame_udon mud-33/mud-34)

문제: t10 에서 `Card, please.`(mud-34)를 고른 갈래에서도 t11 이 `Cash or card?`(mud-33)와 `Card, please.`(mud-34)를 되풀이했다. 이 차례 표는 갈래에 따라 차례를 건너뛰는 칸이 없다(`derive_outings.py` 의 `game_of`).

고친 방법: 차례를 조건부로 나누지 않고 t10 의 물음을 바꿔 두 갈래가 같은 t11 로 모이게 했다.

| 차례 | 전 | 후 |
|---|---|---|
| t10 | mud-33 `Cash or card?` / mud-34 `Card, please.` / mud-35 `Can we see the total first?` | mud-41 `Are you ready to pay?` (새 NPC 줄) / mud-35 `Can we see the total first?` / mud-42 `Yes, we're ready.` (새 고르는 줄) |
| t11 | mud-33 / mud-34 | 그대로. 결제 수단을 한 번만 묻는다 |

- 기존 줄 mud-01~mud-40 의 id, 영어, 기능, 점검은 그대로다. 갈래 `mud-35 > mud-36` 도 그대로다. 연습 말 mud-p1~p14 와 연결 줄도 그대로다.
- 새 줄 둘은 둘 다 A1, 점검 A, 장면 pay. 새 낱말 등급표 항목은 없다.
- 합계를 먼저 본 갈래: t10 mud-35 > mud-36 > t11 `Cash or card?` > `Card, please.`
- 바로 결제하는 갈래: t10 mud-42 > t11 `Cash or card?` > `Card, please.`
- 주문 흐름(합계 확인은 선택, 결제 수단은 한 번)은 보존된다. 달라진 점은 결제 수단 질문이 합계 확인 뒤로 한 자리 물러난 것뿐이다.
