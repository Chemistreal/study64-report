# eng2p

2인 전용 영어 1년 과정 교재 제작 저장소.

## 시작하기

```bash
cat CLAUDE.md            # 제작 지침
cat docs/spec.md         # 상위 규격
cat state/status.md      # 진행 상태
```

## 운영 콘솔

저장소 루트의 `english.html` 이 학습자용 운영 도구다.
세션 타이머, 진행 대장, 판정 큐, 분기 점검, 규격 검사, 회전 대장이 한 파일에 들어 있다.
의존성 없는 단일 HTML이라 파일을 열기만 하면 되고, 기록은 브라우저 localStorage 에 남는다.
GitHub Pages 는 main 브랜치에서 배포된다.

## 검사

```bash
python3 scripts/check.py out/lectures/eng2p_q1_l001.md
python3 scripts/check.py out/
python3 scripts/collect_b.py
python3 scripts/update_status.py
```

## 역할 분담

| 작업 | 어디서 |
|---|---|
| 강의, 카드, 세트 대량 제작 | Claude Code |
| 규격 검사 | scripts/check.py |
| B등급 표현 검증 (웹 검색) | 대화 세션 |
| 주간 판정 (LRE, 채집 표현) | 대화 세션 |
| 산출 과제 교정, 롤플레이 | 대화 세션 |

B등급 검증을 Claude Code에서 하지 않는다.
대량 생성 중에는 검증 단계를 건너뛰기 쉽고, 그럴듯한 표현이 그대로 통과한다.
이 프로젝트의 구조적 최대 위험이 바로 그 지점이다.

## 주의

셸에 ANTHROPIC_API_KEY 가 설정돼 있으면 구독이 아니라 API 요금으로 청구된다.
이 분량에서는 차이가 크다. 작업 전에 확인한다.

```bash
echo $ANTHROPIC_API_KEY   # 비어 있어야 한다
```
