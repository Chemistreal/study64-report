신뢰도: A 생성 (제작 관리)

# 검증 계획

로드맵 12.19 의 T420~T424 가 시킨 일이다.
`state/verify_queue.md` 의 보류 106건을 성격별로 가르고 대본 근거를 붙인 뒤
남은 것을 대화 세션이 물어볼 수 있는 꼴로 적는다.

## 이 문서가 무엇이 아닌가

**영어의 옳고 그름을 여기서 판정하지 않았다.** 그것은 이 저장소가 못 하는 일이다.
CLAUDE.md 가 검증은 대화 세션에서 웹 검색으로 한다고 적었고 그 선을 지켰다.

여기서 한 일은 셋이다. 갈래를 갈랐고, 대본에서 찾을 수 있는 것을 찾았고,
남은 것마다 무엇을 물어야 하는지를 적었다.

**영어 표현을 새로 짓지 않았다.** 이 문서에 나오는 영어는 전부 이미 산출물에 있던 것이다.

## 0. 먼저 볼 것

| 물음 | 답 |
|---|---|
| 보류 106건이 몇 갈래인가 | 넷이다. A 35건 / B 50건 / C 18건 / D 3건 |
| 그중 웹 검색이 답할 수 있는 것 | 갈래 A 35건뿐이다. 나머지 71건은 물음의 성질이 다르다 |
| 표현 단위로는 몇 개인가 | `verify_list.md` 의 214개다 (T420 에 다시 셌다. 215가 아니다) |
| 그중 이번에 근거가 붙은 것 | 10개 |
| 그중 애초에 검증 대상이 아닌 것 | 74개 |
| 그래서 실제로 물어볼 것 | **131개다.** 그중 50개가 두 자리 이상에서 쓰인다 |
| 제일 먼저 볼 것 | 5장의 1순위. 관계가 상하는 자리다 |

## 1. 106건을 어떤 축으로 갈랐나

축 넷을 썼다. 첫째 축이 갈래를 정하고 나머지 셋이 순서를 정한다.

### 1.1 축 1. 무엇을 묻고 있는가

각 파일의 검증로그를 다 읽었다. 로그는 전부 같은 꼴이다.
"X 는 표준 기술이다. Y 는 확인 못 했다" 또는 "Y 는 이 과정의 운용 판단이다".
그 Y 가 무엇이냐로 갈랐다.

갈래 판정은 기계로 했다.
**그 파일이 영어 목록을 세 개 이상 싣고 있으면 A, 아니면 B다.**

| 갈래 | 무엇을 묻나 | 건수 | 누가 답하나 |
|---|---|---|---|
| A | 영어 표현 목록의 선정과 빈도 | 35 | **대화 세션이 웹 검색으로 답한다** |
| B | 이 과정이 잡은 구분과 수치와 절차 | 50 | 웹 검색이 답할 것이 없다. 제작자가 정하거나 8주 실행이 잰다 |
| C | 1층 대화의 자연스러움 | 18 | 통째로는 아무도 못 답한다. 3층 대조가 그 자리다 |
| D | 밖에서 가져올 자료의 실재와 조건 | 3 | 웹 검색이 답하지만 영어 사실이 아니라 자료 조달이다 |

갈래별 내역은 이렇다.

- **A 35건**: 카드 12편 전부, 강의 23편 (l016 l017 l018 l027 l029 l031 l034 l036 l037 l038 l040 l042 l043 l046 l047 l050 l056 l060 l061 l065 l075 l082 l088)
- **B 50건**: 나머지 강의 50편. 목록이 없거나 두 개 이하다
- **C 18건**: `out/dialog/` 18편 전부
- **D 3건**: `out/input/` 의 q2 q3 q4

**갈래 B 50건이 이 분류의 제일 큰 소득이다.**
로그가 스스로 "이 과정의 운용 규칙이다" 라고 적어 놓았다.
30초를 다섯 자리로 채운 것, 멈춤을 2초로 잡은 것, 토막당 40초, 넷으로 가른 구분.
**이것들은 영어가 아니라 이 과정의 설계다. 웹 검색에 넣을 물음이 아예 없다.**

### 1.2 축 2. 대본 근거가 붙었는가

`scripts/ground.py` 의 규칙을 그대로 써서 보류 106건의 영어 재료를 다시 셌다.
낱말만 남겨 견주고 대본 한 줄 안에 통째로 들어 있어야 근거로 센다.

| 갈래 | 목록 재료 | 근거 있음 | 근거 없음 |
|---|---|---|---|
| A | 833 | 537 | 296 |
| B | 7 | 4 | 3 |
| C | 1 | 1 | 0 |
| D | 44 | 40 | 4 |
| 합 | 885 | 582 | **303** |

이 303자리를 표현 단위로 접으면 `verify_list.md` 의 215개가 된다.
한 낱말짜리와 음운 용어는 애초에 빠져 있다.

### 1.3 축 3. 여러 자리에서 되풀이 쓰는가

`verify_list.md` 가 자리 수를 세어 두었다. 287자리를 214표현이 나눠 쓴다.
두 자리 이상에서 쓰는 것이 53개고 그중 50개가 실제 검증 대상이다.
**되풀이가 많다는 것은 한 번 틀리면 여러 곳이 같이 틀린다는 뜻이다.**

출처별 자리 수는 이렇다.

| 어디서 | 자리 |
|---|---|
| emergency | 66 |
| card_q1_051_100 | 63 |
| lectures_q2 | 44 |
| lectures_q1 | 32 |
| lectures_q3 | 20 |
| card_q1_101_150 | 18 |
| 나머지 열하나 | 45 |

**맨 위가 비상판이다. 그런데 비상판 넷은 신뢰도 A라 큐에 안 들어간다.** 6장에서 다시 본다.

### 1.4 축 4. 학습자가 잘못 알면 손해인가

이 축은 기계로 못 가른다. 표현이 하는 일을 보고 손으로 갈랐다.

| 손해 | 무엇이 걸리나 | 어느 묶음 |
|---|---|---|
| 크다 | 관계가 상한다. 무례해지거나 거절이 안 먹힌다 | 가 나 다 라 마 |
| 중간 | 어색하지만 관계는 안 상한다 | 바 사 |
| 작다 | 빈도 순위 문제다. 틀려도 통한다 | 아 |
| 없다 | 뜻이 아니라 소리가 목적인 재료다 | 자 차 |

**영어 제로인 학습자가 스스로 못 알아채는 것이 손해 큰 쪽이다.**
"So yeah" 를 덜 쓰면 어색할 뿐이지만 격식 없는 거절을 상사에게 쓰면 다르다.

## 2. 대본 근거가 붙은 것

### 2.1 축약을 원형으로 되돌리니 찾아진 것 7자리

이 저장소는 축약 철자를 gonna wanna gotta 셋만 허용하고 나머지는 원형으로 적는다.
그래서 재료는 원형이고 대본은 축약이라 `ground.py` 가 못 찾았다.
축약 변이를 같이 보니 찾아진다. **대본 줄을 눈으로 다 확인했다.**

| 표현 | 대본 자리 | 대본 원문 |
|---|---|---|
| Who is your friend | lle1-02:1 | Who's your friend? |
| Who is your / | lle1-02:1 | 위와 같은 줄이다 |
| It's really windy | lle1-39:1 | It is really windy today. |
| That's why | lle1-31:20 | That is why I'm taking a taxi. |
| do not know | lle1-14:1 lle1-20:12 | I don't know |
| Sorry, I cannot | lle1-20:7 | Sorry, I can't hear you. |
| What is that | lle1-28:35 | What's that sound? |

### 2.2 빗금을 갈라 보니 찾아진 것 3자리

강의는 대조 재료를 `A / B` 꼴로 한 줄에 적는다.
카드 쪽 추출기는 이 빗금을 가르는데 **강의 쪽 추출기는 안 가른다.**
그래서 양쪽 다 대본에 있는데도 통째로는 못 찾아 근거 없음으로 셌다.

| 표현 | 갈라 본 결과 |
|---|---|
| to see you / to tell you / to be in Washington | lle1-38:2 / lle1-19:5 / lle1-38:6 셋 다 있다 |
| you find an American symbol / you want to see the White House | lle1-25:15 / lle1-28:44 둘 다 있다 |
| you win points / you need to walk | lle1-25:15 / lle1-28:44 둘 다 있다 |

**이것은 자료 문제가 아니라 도구 문제다.**
`scripts/ground.py` 의 `lecture_materials` 는 `->` 만 가르고 `/` 와 `,` 는 안 가른다.
같은 파일의 카드 경로는 둘 다 가른다.

고치면 강의 넷의 근거 없음 비율이 내려간다.
`check_ground.py` 의 BASELINE 은 나빠질 때만 실패하므로 고쳐도 검사는 안 깨진다.
**이 문서에서는 안 고쳤다. 파생물을 다시 뽑는 일이라 제작자가 할 일이다.**

### 2.3 파일 단위로 이미 다 해소된 것 4건

| 파일 | 상태 |
|---|---|
| out/cards/eng2p_card_q3_001_050.md | 목록 6개 전부 대본에 있다. 근거 없음 0 |
| out/cards/eng2p_card_q4_101_150.md | 목록 6개 전부 대본에 있다. 근거 없음 0 |
| out/lectures/eng2p_q2_l037.md | 목록 9개 전부 대본에 있다. 근거 없음 0 |
| out/cards/eng2p_card_q1_001_050.md | 근거 없음 79개가 전부 한 낱말이다. `docs/wordlist.md` 에 이미 적혀 있고 고른 근거는 기준서 7.3 근거표다 |

**이 넷은 대화 세션에 넘길 물음이 없다.** 검증로그를 통과로 고칠지는 제작자가 정한다.

## 3. 검증 대상이 아닌 것 74개

215개 중 74개는 웹 검색에 넣으면 안 되는 것이다. 넣으면 답이 거꾸로 온다.

| 갈래 | 개수 | 왜 아닌가 |
|---|---|---|
| 일부러 틀리게 쓴 재료 | 10 | **대본에 있으면 오히려 안 된다** |
| 끊김 재료가 갈라져 나온 부스러기 | 36 | 표현이 아니라 잘린 자리다 |
| 소리 대조표 줄 | 14 | 표현이 아니라 소리 짝이다 |
| 낱말 강세 재료 | 9 | 사전이 답한다. 웹 검색 물음이 아니다 |
| 자료 이름 | 5 | 영어 표현이 아니다. 갈래 D 에서 같이 본다 |

### 3.1 일부러 틀리게 쓴 재료 10개

카드 [063] 은 repair형이다. `of` 를 아예 빼고 읽어 B가 알아채는지 본다.
카드 [140] 은 판정형이다. 두 형태를 주고 맞는 쪽을 고르게 한다.

**둘 다 틀린 쪽이 재료로 실려 있다. 그것이 그 판의 설계다.**

| 표현 | 어디서 |
|---|---|
| a lot people / get out the room / a cup coffee / two them / most the time | 카드 [063] repair형. of 를 뺀 쪽 |
| at Friday / on 6pm / on the park / on this Thursday / go at work | 카드 [140] 판정형. 틀린 쪽 보기 |

### 3.2 끊김 부스러기 36개

카드가 `/` 로 끊을 자리를 표시한다. 추출기가 그 자리에서 갈라 앞토막만 남긴다.
`pick i` `t up` `He has to finish the` `Can you say that /` 같은 것이 그렇게 나온다.

**표현이 아니다. 검증할 것이 없다.**

### 3.3 소리 대조표와 강세 재료 23개

`seat / sheet` `sip / ship` 는 최소대립쌍이다. `a  in  a book` 은 약모음 대조표 줄이다.
`a CONtest / to conTEST` 는 명사와 동사의 강세 자리 짝이다.

**앞의 둘은 기준서 7.3 근거표 안이고 강세는 사전이 답한다.**
강세 아홉은 대화 세션이 아니라 사전 한 번으로 끝나므로 큐에서 뺀다.

## 4. 남은 131개를 무엇으로 묻는가

**"이 표현이 자연스러운가" 는 물음이 아니다.** 답이 예 아니면 아니오라 아무것도 안 남는다.
쓸 수 있는 물음은 자리를 묻는다.

```
<표현> 을 <어떤 상황> 에서 <어떤 관계> 의 화자가 쓰는가.
안 쓰면 그 자리에 무엇이 오는가.
```

뒷줄이 있어야 쓸모가 있다. **기각만 받으면 그 자리가 빈 채로 남는다.**
이 저장소는 영어를 새로 못 지으므로 대안을 같이 받아야 고칠 수 있다.

## 5. 우선순위

### 1순위. 관계가 상하는 자리 (다섯 묶음 51개)

틀리면 학습자가 손해를 본다. 그리고 **학습자가 스스로 못 알아챈다.**
2인 다 영어 제로라 무례한 거절을 해도 상대 반응을 못 읽는다.

#### 상위 열 건

**1. 부탁 틀 셋의 격식 서열**

Can you / Could you / Would you mind 를 한 묶음으로 저장하라고 18강이 시킨다.
서열은 이미 통과로 확인됐다. 안 된 것은 세 틀이 각각 어느 자리에 붙느냐다.

> Would you mind 를 어떤 상황에서 어떤 관계의 화자가 쓰는가.
> Could you 로 충분한 자리에 Would you mind 를 쓰면 상대가 어떻게 받는가.
> Would you mind 로 물었을 때의 답이 Sure 인가 아닌가.

마지막 줄이 중요하다. Would you mind 는 부정 물음이라 답이 뒤집힐 수 있다.
**18강도 카드도 그 답 형태를 안 적었다.** 학습자가 Sure 로 답하면 뜻이 갈릴 수 있다.
자리: `out/lectures/eng2p_q1_l018.md`, `out/cards/eng2p_card_q1_101_150.md`, `out/sets/`, 비상판

**2. 되묻기 2형의 세기**

42강이 명료화 요청을 네 형으로 나눈다. 2형이 부분만 짚는 형이고 거기 `The what` 과 `You bought what` 이 있다.

> The what 과 You bought what 을 어떤 상황에서 어떤 관계의 화자가 쓰는가.
> 처음 만난 사람이나 윗사람에게 써도 되는가.
> 안 되면 같은 자리에 무엇이 오는가.

**이 둘은 되묻기 중에 제일 센 쪽이다.** 세기를 모르고 쓰면 따지는 것으로 들린다.
자리: `out/lectures/eng2p_q2_l042.md`

**3. 거절 세 층의 층별 목록**

50강이 거절을 못 한다는 표시, 이유, 대안 셋으로 나눈다. 여섯이 근거 없음이다.

> I'm not able to / That won't work / I already / Something came up / Maybe next time / Can we
> 를 각각 어떤 상황에서 어떤 관계의 화자가 쓰는가.
> 이 여섯을 격식 순서로 줄 세우면 어떻게 되는가.

강의는 순서를 안 적었다. **세 층을 다 쓰라고만 하고 층 안의 세기를 안 갈랐다.**
자리: `out/lectures/eng2p_q3_l050.md`

**4. 조언에 쓰는 가정 한 개**

60강이 가정을 셋만 심고 `If I were you` 가 그 자리를 거의 다 덮는다고 적었다.
세 자리에서 쓰고 과제집에도 들어가 있다.

> If I were you 를 어떤 상황에서 어떤 관계의 화자가 쓰는가.
> 윗사람에게 써도 되는가. 처음 만난 사이에 써도 되는가.
> 안 되면 그 자리에 무엇이 오는가.

**조언은 관계를 타는 화행이다.** 한 형태로 다 덮는다는 설계가 여기서 걸린다.
자리: `out/lectures/eng2p_q3_l060.md`, `out/cards/eng2p_card_q3_051_100.md`, `out/tasks/`, 비상판

**5. 겹쳐 말했을 때 물러나는 말**

36강이 둘이 동시에 시작한 자리에 Go ahead / You first / Sorry, go on 셋을 놓는다.
2인 세션에서 매일 나오는 자리다.

> Go ahead 와 You first 를 어떤 상황에서 어떤 관계의 화자가 쓰는가.
> 셋 중 어느 것이 제일 흔한가. 세기 차이가 있는가.

자리: `out/lectures/eng2p_q2_l036.md`, `out/sets/`, 비상판

**6. 마무리 네 단계의 덩어리**

88강이 3분 대화를 네 단계로 닫는다. 여기 것들이 되풀이가 제일 많다.
`See you then` 이 네 자리, `I should go` 와 `So we said` 가 세 자리다.

> I should go 를 어떤 상황에서 어떤 관계의 화자가 쓰는가.
> So we said 로 정리를 여는 것이 실제로 있는 형태인가.
> See you then 이 다음 약속을 이미 정한 뒤에만 쓰는 말인가.

셋째 줄이 핵심이다. **약속을 안 정하고 See you then 을 쓰면 어긋난다.**
자리: `out/lectures/eng2p_q4_l088.md`, `out/cards/eng2p_card_q4_051_100.md`, `out/lectures/eng2p_q2_l046.md`, 비상판

**7. 되돌리는 덩어리**

31강이 한쪽이 지배하는 것을 막는 장치로 되돌리기를 넣는다.
기준서 2.4 가 관계 굳음을 위험으로 잡으므로 **이 목록은 설계의 핵심이다.**

> What about you / What do you think / Do you agree / Have you tried it / Don't you think
> 를 각각 어떤 상황에서 어떤 관계의 화자가 쓰는가.
> Don't you think 가 동의를 미리 깔고 묻는 형태인가.

마지막 줄을 꼭 물어야 한다. **되돌리기로 넣었는데 실제로는 압박이면 장치가 거꾸로 돈다.**
자리: `out/lectures/eng2p_q2_l031.md`

**8. 확인 자리 네 묶음**

40강의 확인은 대화를 굴리는 장치다. `Is that right` 이 세 자리에서 쓰인다.

> Is that right 을 어떤 상황에서 어떤 관계의 화자가 쓰는가.
> 상대가 방금 말한 것을 확인하는 자리에서 쓰는가, 아니면 따지는 쪽으로 들리는가.
> So you're saying 과 어떻게 갈리는가.

자리: `out/lectures/eng2p_q2_l040.md`, `out/lectures/eng2p_q3_l061.md`, 비상판

**9. 화제 전환 네 방법**

47강은 근거 없음이 일곱으로 강의 중에 제일 많다.

> Speaking of that / That reminds me / You said something about / By the way /
> So, different topic / What else is new / What have you been up to
> 를 각각 어떤 상황에서 어떤 관계의 화자가 쓰는가.
> 앞 화제와 이어진 전환과 끊고 옮기는 전환 중 어느 쪽인가.

47강이 네 방법을 갈랐는데 **어느 표현이 어느 방법인지가 확인 안 됐다.**
자리: `out/lectures/eng2p_q2_l047.md`

**10. 불동의 세 조각**

56강이 불동의를 인정과 뒤집기와 근거로 나눈다. 66강이 그것을 관계별로 조절한다.

> You're right / That's true / Even so 를 어떤 상황에서 어떤 관계의 화자가 쓰는가.
> 부분 인정으로 쓰는 That's true 와 온전한 동의로 쓰는 That's true 가 소리로 갈리는가.

자리: `out/lectures/eng2p_q3_l056.md`, `out/lectures/eng2p_q3_l066.md`, 비상판

#### 1순위 전체 목록

**가 부탁과 응답 (10개)**

| 자리 | 표현 | 어디서 |
|---|---|---|
| 2 | Can you say that again | emergency lectures_q1 |
| 2 | Would you mind | lectures_q1 sets |
| 1 | Can you come here | lectures_q1 |
| 1 | Can you say it slowly | emergency |
| 1 | Close the door | emergency |
| 1 | Could you close the door | emergency |
| 1 | Could you wait here | emergency |
| 1 | Do you have a minute | emergency |
| 1 | Would you mind closing the door | emergency |
| 1 | Would you mind waiting | emergency |

**나 거절과 못 함 (7개)**

| 자리 | 표현 | 어디서 |
|---|---|---|
| 2 | Maybe next time | emergency lectures_q3 |
| 2 | Something came up | emergency lectures_q3 |
| 1 | Can we | lectures_q3 |
| 1 | I already | lectures_q3 |
| 1 | I need to go | emergency |
| 1 | I'm not able to | lectures_q3 |
| 1 | That won't work | lectures_q3 |

**다 조건과 가정 (9개)**

| 자리 | 표현 | 어디서 |
|---|---|---|
| 3 | If I were you | emergency lectures_q3 tasks |
| 2 | If I can | emergency lectures_q3 |
| 2 | If I had time | emergency lectures_q3 |
| 2 | If it works | emergency lectures_q3 |
| 2 | When you get there | emergency lectures_q3 |
| 1 | If I had time, | card_q3_051_100 |
| 1 | If I were you, | card_q3_051_100 |
| 1 | If it works, | card_q3_051_100 |
| 1 | When you get there, | card_q3_051_100 |

**라 동의와 불동의 (6개)**

| 자리 | 표현 | 어디서 |
|---|---|---|
| 3 | Even so | emergency lectures_q2 lectures_q3 |
| 3 | What if we | card_q4_051_100 emergency lectures_q4 |
| 3 | You might be right | card_q4_051_100 emergency lectures_q4 |
| 2 | That's true | emergency lectures_q3 |
| 2 | You're right | emergency lectures_q3 |
| 1 | I do like it | emergency |

**마 되묻기와 끼어들기 (19개)**

| 자리 | 표현 | 어디서 |
|---|---|---|
| 3 | Go ahead | emergency lectures_q2 sets |
| 3 | Is that right | emergency lectures_q2 lectures_q3 |
| 3 | Let me think | emergency lectures_q1 sets |
| 2 | Can I say something | emergency lectures_q2 |
| 2 | Like what | emergency lectures_q2 |
| 2 | Say that again | card_q2_051_100 lectures_q2 |
| 2 | So you mean | emergency lectures_q2 |
| 2 | So you're saying | emergency lectures_q2 |
| 2 | The what | emergency lectures_q2 |
| 2 | Where was I | emergency lectures_q2 |
| 2 | You first | emergency lectures_q2 |
| 1 | Hold on | emergency |
| 1 | How do you say it | lectures_q3 |
| 1 | So you're saying it is closed | card_q2_051_100 |
| 1 | Sorry, go on | lectures_q2 |
| 1 | what did you ask | emergency |
| 1 | You bought what | lectures_q2 |
| 1 | You mean the library | emergency |
| 1 | You mean the red one | card_q2_051_100 |

### 2순위. 어색하지만 관계는 안 상하는 자리 (14개)

틀려도 무례해지지 않는다. 다만 **1층 대화가 실제 영어로 오인될 위험이 여기 있다.**

물음 꼴은 같다. 다만 대안을 꼭 같이 받는다.

**바 열고 닫기 (7개)**

| 자리 | 표현 | 어디서 |
|---|---|---|
| 4 | See you then | card_q4_051_100 emergency lectures_q2 lectures_q4 |
| 3 | Good to see you | emergency lectures_q1 sets |
| 3 | I should go | card_q4_051_100 emergency lectures_q4 |
| 3 | So we said | card_q4_051_100 emergency lectures_q4 |
| 2 | Let's do this again | emergency lectures_q4 |
| 1 | I'll let you know | lectures_q2 |
| 1 | Let's talk later | lectures_q2 |

**사 잡담 자리 (7개)**

| 자리 | 표현 | 어디서 |
|---|---|---|
| 2 | Do you like it | emergency lectures_q4 |
| 2 | Nice weather today | emergency lectures_q4 |
| 1 | I am from Korea | emergency |
| 1 | I am happy to see you | emergency |
| 1 | last year | lectures_q2 |
| 1 | this week | lectures_q2 |
| 1 | when I was young | lectures_q2 |

`I am happy to see you` 는 대본 lle1-38:2 에 `I am really happy to see you!` 로 있다.
**낱말 하나 차이라 근거로는 못 세지만 지어낸 것이 아니라는 것은 확인됐다.**

### 3순위. 빈도 순위 문제 (23개)

틀려도 통한다. 다만 **되풀이가 제일 많은 묶음이 여기다.**
`So yeah` 가 네 자리, `What about you` 가 세 자리다.

물음을 하나로 묶어도 된다.

> 아래 스물셋을 말을 여는 자리, 잇는 자리, 옮기는 자리로 나누면 어떻게 되는가.
> 각각 문장 앞에 오는가 뒤에 오는가.
> 이 중 초급 학습자가 안 써도 되는 것이 있는가.

셋째 줄이 실익이다. **스물셋을 다 심으면 Q2 청크 예산이 여기로 다 간다.**

**아 담화표지와 이음 (23개)**

| 자리 | 표현 | 어디서 |
|---|---|---|
| 4 | So yeah | card_q2_051_100 card_q2_101_150 emergency lectures_q2 |
| 3 | What about you | card_q2_051_100 emergency lectures_q2 |
| 2 | After that | card_q4_001_050 lectures_q2 |
| 2 | By the way | emergency lectures_q2 |
| 2 | What do you think | emergency lectures_q2 |
| 2 | What else | emergency lectures_q2 |
| 1 | But here's the thing | lectures_q2 |
| 1 | By the way, | card_q2_001_050 |
| 1 | Do you agree | lectures_q2 |
| 1 | Don't you think | lectures_q2 |
| 1 | First we eat | emergency |
| 1 | Have you tried it | lectures_q2 |
| 1 | It's the same as | lectures_q3 |
| 1 | Like you said | lectures_q2 |
| 1 | So we're doing that | lectures_q2 |
| 1 | So, different topic | lectures_q2 |
| 1 | Sounds good | lectures_q2 |
| 1 | Speaking of that | lectures_q2 |
| 1 | That reminds me | lectures_q2 |
| 1 | What else is new | lectures_q2 |
| 1 | What have you been up to | lectures_q2 |
| 1 | You know, like | lectures_q2 |
| 1 | You said something about | lectures_q2 |

`Do you agree` 와 `Don't you think` 는 1순위 7번과 겹친다. 되돌리기로 쓸 때는 1순위로 본다.

### 4순위. 소리 재료 (30개)

**뜻이 목적이 아니라 소리가 목적이다.**
`pick it up` 은 세 낱말이 소리에서 한 덩어리로 붙는 것을 보는 재료다.
그 자리를 고른 근거는 기준서 7.3 근거표이고 말뭉치가 아니다.

그래서 물음이 다르다. **빈도를 묻지 말고 소리를 물어야 한다.**

> pick it up 에서 t 가 앞뒤로 넘어가는 것이 표준 기술인가.
> 이 서른 개가 그 소리 자리를 보여 주는 재료로 맞는가.
> 더 흔한 재료가 있으면 무엇인가.

**자 소리 드릴 재료 (30개)**

| 자리 | 표현 | 어디서 |
|---|---|---|
| 4 | sort of | card_q1_051_100 emergency lectures_q1 sets |
| 3 | pick it up | card_q1_051_100 emergency lectures_q1 |
| 3 | should have | card_q1_051_100 emergency lectures_q1 |
| 2 | check it out | card_q1_051_100 emergency |
| 2 | could have | card_q1_051_100 lectures_q1 |
| 2 | out of the room | card_q1_051_100 emergency |
| 2 | should have gone | emergency sets |
| 2 | take it easy | card_q1_051_100 emergency |
| 2 | turn it off | card_q1_051_100 emergency |
| 2 | would have | card_q1_051_100 lectures_q1 |
| 1 | a lot of people | card_q1_051_100 |
| 1 | a lot of them | lectures_q1 |
| 1 | at the theater | lectures_q1 |
| 1 | big girl | lectures_q1 |
| 1 | give it a try | card_q1_051_100 |
| 1 | good day | lectures_q1 |
| 1 | got to leave | card_q1_051_100 |
| 1 | hold on a minute | card_q1_051_100 |
| 1 | kind of hard | lectures_q1 |
| 1 | kind of strange | card_q1_051_100 |
| 1 | look at the sky | card_q1_051_100 |
| 1 | look back | card_q1_051_100 |
| 1 | pick the book up | card_q1_051_100 |
| 1 | pick two books | card_q1_051_100 |
| 1 | put it away | card_q1_051_100 |
| 1 | sort of like that | lectures_q1 |
| 1 | sort of okay | card_q1_051_100 |
| 1 | turn on | lectures_q1 |
| 1 | turn the light off | card_q1_051_100 |
| 1 | turn the page | card_q1_051_100 |

`good day` 와 `big girl` 은 자음이 자음을 만나는 자리의 재료다 (11강).
**인사말로 실은 것이 아니다.** 그렇게 읽히면 재료 배치가 잘못된 것이다.

### 5순위. 목록으로 새 들어온 문장 (13개)

`verify_list.md` 는 문장을 안 넘긴다고 적었다. 끝에 문장 부호가 있으면 문장으로 본다.
**마침표를 안 찍은 문장이 목록으로 샜다.** 이 열셋이 그것이다.

| 자리 | 표현 | 어디서 |
|---|---|---|
| 2 | Where is my phone | emergency lectures_q1 |
| 2 | Where is the station | emergency lectures_q1 |
| 1 | a very big red car | card_q1_101_150 |
| 1 | I am going to the store | emergency |
| 1 | I want a book | emergency |
| 1 | It was really windy today | card_q3_051_100 |
| 1 | lesson start the | card_q2_101_150 |
| 1 | My apartment is near the Metro | card_q1_101_150 |
| 1 | She has a car | emergency |
| 1 | the book on the table | card_q1_101_150 |
| 1 | the same place now | card_q2_051_100 |
| 1 | The supermarket is near the apartment | card_q3_051_100 |
| 1 | This is my apartment | lectures_q1 |

이 중 셋은 **대본을 고쳐 쓴 것이라 따로 봐야 한다.**

| 표현 | 대본 원문 | 무엇이 달라졌나 |
|---|---|---|
| My apartment is near the Metro | lle1-10:5 My apartment is near the Columbia Heights Metro. | 낱말 둘을 뺐다 |
| The supermarket is near the apartment | lle1-03:19 The supermarket is at 1500 Irving Street. It is near the apartment. | 두 문장을 하나로 합쳤다 |
| lesson start the | lle1-22:38 ... Quiz Quiz - Lesson 22 Start the Quiz to find out ... | 숫자를 뺐고 **그 줄은 발화가 아니라 화면 문구다** |

셋째가 제일 무겁다. 카드 [127] 이 "다섯 다 52과 대본에 통째로 나오는 세 낱말이다" 라고 적고
4번 근거를 lle1-22:38 로 댔다. **그 줄은 있지만 그 세 낱말은 그 꼴로 없다.**

그리고 그 줄은 퀴즈 화면의 문구라 사람이 말한 것이 아니다.
**압박형 재료로 쓰기 전에 제작자가 볼 자리다.** 웹 검색이 아니라 대본 확인으로 끝난다.

## 6. 큐가 못 보는 자리

**비상판이 근거 없는 표현을 제일 많이 쓴다. 66자리다. 그런데 큐에 한 건도 없다.**

`scripts/collect_b.py` 는 `신뢰도: B` 인 파일만 모은다.
비상판 넷과 세트 마흔여덟과 과제집 마흔여덟은 전부 `신뢰도: A` 이고 검증대상이 비어 있다.
합해서 백 편이 영어를 싣고 큐에 안 들어간다.

| 갈래 | 편수 | 등급 | 큐 | verify_list 자리 |
|---|---|---|---|---|
| 비상판 | 4 | A | 없음 | 66 |
| 세트 | 48 | A | 없음 | 6 |
| 과제집 | 48 | A | 없음 | 1 |

**이것은 검사기의 구멍이 아니라 등급의 문제다.**
비상판이 A인 것은 신규 학습이 없고 배운 것을 꺼내는 장치라서다.
그런데 꺼낼 것 자체가 B등급 목록에서 왔다.
**A등급 파일이 B등급 재료를 담고 있으면 그 재료는 아무 데도 안 잡힌다.**

강의 열 편도 같은 자리에 있다 (l011 등). A등급인데 `verify_list.md` 에 출처로 잡힌다.
`verify_list.md` 는 등급을 안 보고 근거만 보므로 이 구멍을 메우고 있다.
**그래서 대화 세션은 큐가 아니라 `verify_list.md` 를 봐야 한다.** 큐는 파일까지만 말한다.

**여기까지가 T419 의 기록이다. T420 에 이 자리를 다시 쟀고 9장부터가 그것이다.**
66은 맞았고 갈래는 셋이 아니라 하나로 정해졌다. 검사기가 하나 생겼다.

## 7. 갈래 B 50건을 어떻게 끝낼 것인가

**웹 검색으로는 안 끝난다.** 로그가 스스로 그렇게 적었다.
50건의 로그를 읽으면 셋으로 갈린다.

| 무엇 | 대략 | 어떻게 끝나나 |
|---|---|---|
| 8주 실행에서 재기로 한 것 | 열몇 건 | 실행 뒤에 값이 나온다. 그때 통과나 기각을 적는다 |
| 이 과정이 정한 구분과 수치 | 서른몇 건 | **검증할 것이 없다.** 제작자가 확정하면 끝난다 |
| 표준 기술이라 이미 확인된 것 | 몇 건 | 로그 앞부분이 이미 확인됐다고 적었다 |

로그에 나오는 말이 그대로 신호다.
"8주 실행에서 본다" 는 실행 대기고 "이 과정의 운용 판단이다" 는 확정 대기다.
**이 둘을 검증 대기와 같은 칸에 넣어 둔 것이 106이라는 숫자를 만들었다.**

숫자를 다시 세면 이렇다.

| 무엇 | 건수 |
|---|---|
| 대화 세션이 웹 검색으로 볼 것 | 35 (갈래 A) |
| 그중 이미 다 해소된 것 | 4 |
| **큐에서 실제로 물어볼 파일** | **31건** |
| 제작자가 확정할 것 | 50 (갈래 B) |
| 실행이 답할 것 | 18 (갈래 C) |
| 자료를 구해야 답이 나오는 것 | 3 (갈래 D) |

표현 단위로는 131개다. 파일 31건보다 넓다.
**6장이 적은 대로 큐 밖의 A등급 파일이 그 표현들을 같이 쓰기 때문이다.**
그래서 세는 자리는 파일이 아니라 표현이어야 한다.

## 8. 다음에 할 일

1. 5장 1순위 상위 열 건을 대화 세션에서 본다. **대안을 같이 받는다**
2. 받은 답으로 강의와 카드의 검증로그를 고친다. 형식은 `날짜 / 근거 / 판정 / 조치` 다
3. `scripts/ground.py` 의 `lecture_materials` 가 `/` 와 `,` 를 안 가르는 것을 고칠지 정한다
4. 카드 [127] 4번의 근거를 제작자가 직접 본다. 대본 확인으로 끝나는 일이다
5. 비상판 넷과 A등급 강의 일곱과 세트 넷에 `검증대상:` 을 적는다. **11장이 그 목록이다**
6. `scripts/derive_handout.py` 가 원본의 등급을 물려주게 할지 정한다. 10장이 그 자리다

## 9. 구멍을 다시 쟀다 (T420)

6장이 "비상판이 66자리를 쓰는데 큐에 한 건도 없다" 고 적었다. 그 수부터 다시 쟀다.

### 9.1 66은 맞다. 다만 무엇을 센 수인지 적어야 한다

| 갈래 | 편수 | 영어 재료 | 근거 없음 | verify_list 표현 |
|---|---|---|---|---|
| 비상판 | 4 | 204 | 75 | **66** |
| 세트 | 48 | 38 | 8 | 6 |
| 과제집 | 48 | 67 | 25 | 1 |
| 백 편 합 | 100 | 309 | 108 | 67 |

**66은 표현 단위 수고 자리 단위로는 75다.** 둘의 차이는 아홉인데
여덟은 한 낱말짜리라 `derive_verify_list.py` 가 빼고 하나는 `dark l` 이라 음운 용어로 뺀다.
표현 단위로 접으면 백 편이 67개를 나눠 쓴다. 비상판 66 세트 6 과제집 1을 더한 73에서
겹치는 여섯을 뺀 값이다.

과제집 25가 큰 수처럼 보이지만 **스물넷이 같은 `If I were you` 다.** w25 부터 w48 까지
과제 프롬프트가 같은 문법 범위 줄을 되풀이한다. 표현으로는 하나다.

### 9.2 A등급 강의 열 편도 같은 자리다

6장이 지나가며 적은 것을 셌다. l001 부터 l006 과 l011 부터 l014 다.

| 갈래 | 편수 | 영어 재료 | 근거 없음 | verify_list 표현 |
|---|---|---|---|---|
| A등급 강의 | 10 | 63 | 36 | 14 |

**그러니 구멍은 백 편이 아니라 백열 편이다.** 재료 372개에 근거 없음 144개다.

### 9.3 그런데 진짜 구멍은 그 수가 아니다

근거 없는 표현 214개마다 그것을 담은 파일을 다 찾아 등급을 붙여 봤다.

| 무엇 | 개수 |
|---|---|
| B등급 파일이 한 자리라도 담고 있는 표현 | 182 |
| **A등급 파일에만 있는 표현** | **32** |

182개는 큐가 이미 가리키고 있다. 파일 단위로만 가리키지만 그 파일을 열면 나온다.
**32개는 어디로도 안 닿는다.** 비상판에 19, A등급 강의에 13이다.
`should have gone` 은 비상판과 세트에 같이 있고 열아홉 안에 든다.

강의 열셋은 최소대립쌍과 약모음 대조표라 3장이 이미 검증 대상이 아니라고 적었다.
`seat / sheet` 와 `a in a book` 이 그것이다. **남는 것은 비상판 열아홉이다.**

```
Can you say it slowly     Close the door           Could you close the door
Could you wait here       Do you have a minute     First we eat
Hold on                   I am from Korea          I am going to the store
I am happy to see you     I do like it             I need to go
I want a book             She has a car            should have gone
Would you mind closing the door                    Would you mind waiting
You mean the library      what did you ask
```

**이 스물이 어느 B등급 파일에도 없다.** 5장이 1순위로 올린 것이 여기 여럿 있다.
`Would you mind waiting` 과 `Could you wait here` 는 부탁 틀이고 관계가 걸린다.

## 10. 가 나 다 중에 나를 골랐다

세 갈래가 있었다.

| 갈래 | 무엇을 하나 |
|---|---|
| 가 | `collect_b.py` 가 A등급 파일 안의 B등급 재료도 걷는다. 등급이 줄 단위가 된다 |
| 나 | A등급 파일이 B등급 재료를 담으면 그것이 결함이다. 검사기로 잡는다 |
| 다 | 백 편의 등급 표기가 틀렸다고 보고 고친다 |

**나를 골랐다.** 까닭 넷을 적는다.

### 10.1 CLAUDE.md 가 같은 자리에서 이미 답을 냈다

> 1층에 표기가 빠지면 학습자가 실제 영어로 오인한다. 이건 심각한 결함이다.

이 규칙의 뼈대는 셋이다. 만든 것이 자기에 대한 주장을 달고 있다.
읽는 쪽이 그 주장을 스스로 검사할 수 없다. **그래서 표기가 빠진 것 자체가 결함이다.**

비상판이 그대로다. 머리에 `신뢰도: A` 라고 적혀 있고 안에 청크 목록이 열여덟 자리다.
꺼내 쓰는 쪽은 그것이 B등급 목록인 줄 모른다. **읽는 쪽이 스스로 못 알아챈다.**

가는 표기를 틀린 채로 두고 뒤에서 도구가 메우자는 것이다.
**그것이 바로 CLAUDE.md 가 결함이라고 부른 꼴이다.** 표기가 없어도 다른 장치가 있으니 괜찮다는 말이다.

### 10.2 가는 걸 신호가 없다

가를 하려면 어느 줄이 B인지 기계가 알아야 한다. 지금 있는 신호는 하나뿐이다. 근거 없음이다.
그런데 `state/verify_list.md` 가 스스로 이렇게 적었다.

> **이 목록은 결함 목록이 아니다.** 52과 대본에 없다는 것뿐이다.

**대본에 있는 청크 목록도 고른 사람이 있으면 B다.** 근거 없음을 B의 신호로 쓰면
큐가 저장소 스스로 아니라고 적은 것을 주장하게 된다.

가를 제대로 하려면 줄마다 표기가 있어야 하고, 그 표기를 강제하는 것이 나다.
**가를 똑바로 하면 나가 된다.**

### 10.3 다는 오늘을 고치고 내일을 안 막는다

다는 백 편을 다시 라벨링하는 일이다. 두 가지가 걸린다.

첫째. 백 편이 통째로 B인 것이 아니다. 비상판의 15분 구성과 쓰는 규칙과 인출 지시는 A다.
세트의 3단계 절차도 A다. **통째로 B를 달면 반대 방향으로 틀린 표기가 된다.**

둘째. 다음에 만드는 파일이 같은 자리에 또 선다. 라벨은 사람이 다는 것이고
**안 달았는지 세는 자가 없으면 안 단 것이 안 보인다.**

**다는 나가 시키는 조치 중 하나다.** 라이벌 세계관이 아니다.
나가 잡아 준 자리에서 제작자가 고르면 된다. 목록의 집을 `원본:` 으로 대든지,
`검증대상:` 을 적든지, 등급을 내리든지 셋이다.

### 10.4 강의록 97편이 이미 그 답을 하고 있었다

강의록은 B등급 강의에서 뽑은 파생물이고 목록을 그대로 담는다. 등급은 A다.
**그런데 결함이 아니다.** 머리에 이렇게 적혀 있기 때문이다.

```
신뢰도: A 생성 (파생)
원본: out/lectures/eng2p_q1_l018.md
검증로그: 2026-08-08 / 원본 강의에서 기계로 뽑았다 / 통과 / 손으로 적은 줄이 없다
```

목록이 어디서 왔는지 적혀 있어 등급을 따라갈 수 있다.
비상판과 세트는 **같은 일을 하면서 그 두 줄만 비어 있다.** 그것이 결함이다.

한 가지는 남는다. 강의록은 종이로 두 사람이 읽는 물건인데 원본이 B여도 머리에 A라고 적는다.
`derive_handout.py` 가 등급을 박아 넣기 때문이다. **여든여섯 편이 그 자리다.**
검사기가 세기만 하고 실패로 안 낸다. 고칠 자리가 파생기 안이고 이 턴에 손댈 권한이 없었다.

## 11. 검사기 `scripts/check_grade.py`

### 11.1 무엇을 목록으로 세나

CLAUDE.md 의 B등급 정의 한가운데 목록이라는 말이 있다. 연어와 청크 목록이다.
그래서 목록을 센다. 두 꼴이 있다.

| 갈래 | 꼴 | 어디에 |
|---|---|---|
| 한줄 | 두 낱말 이상 영어 조각이 셋 이상 한 줄에 늘어선다 | 비상판의 `청크 5분:` 줄 |
| 묶음 | 영어만 있는 줄이 셋 이상 잇달아 온다 | 강의가 목록을 적는 꼴 |

셋으로 자른 것은 1.1 이 106건을 가를 때 쓴 자와 같다. 둘은 대조고 셋부터 목록이다.
**셋을 골라 늘어놓았으면 고른 사람이 있다.**

빼는 것도 적는다. 문장 부호로 끝나면 문장이라 뺀다. `ground.py` 와 같은 자다.
대본 과 번호를 대는 줄은 인용이라 뺀다. `31과에 first base, second base ... 가 있다`
는 고른 것이 아니라 옮긴 것이다. 세트 w40 이 그 자리고 이 규칙이 그것을 뺀다.

**이름표로 토막 난 목록은 이어 본다.** 88강이 여덟을 골라 놓고 이렇게 적는다.

```
1단계
Anyway
I should go

2단계
So we said
```

토막마다 두 줄이라 셋에 못 미친다. 안 이으면 여덟이 통째로 빠진다.
강의록이 같은 여덟을 한 칸에 모아 뽑는 것이 그것이 한 목록이라는 증거다.
그래서 빈 줄과 여덟 자 이하 한글 이름표는 둘까지 건너뛴다. **셋이 이어지면 끝난 것으로 본다.**

**이것은 목록으로 보이는 자리다.** 마지막 판정은 사람이 한다.
검사기가 하는 일은 그 자리가 늘어나는 것을 막는 것이다.

### 11.2 지금 몇을 잡나

| 무엇 | 개수 | 어떻게 다루나 |
|---|---|---|
| 등급이 A인데 목록을 담고 표기가 빠진 파일 | **15** | 기준표에 박았다 |
| 그 파일들의 목록 자리 | **75** | 파일마다 자리 수를 표에 적었다 |
| 파생물이 원본보다 높은 등급을 단 자리 | 86 | **세기만 한다.** 고칠 자리가 파생기 안이다 |

열다섯은 비상판 4, A등급 강의 7, 세트 4다. 과제집은 0이다. 목록을 안 담는다.
`If I were you` 는 한 줄에 하나뿐이라 목록이 아니다.

### 11.3 0으로 걸지 않고 기준선으로 박은 까닭

이 턴에 열다섯을 고칠 권한이 없었다. 고치려면 `검증대상:` 을 적어야 하는데
비상판과 강의 본문에 손대지 않기로 되어 있었다. **0을 걸면 첫 실행부터 실패다.**

늘 빨간 검사기는 아무도 안 본다. CLAUDE.md 가 뺀 검사는 통과한 것처럼 보인다고 적었는데
늘 실패하는 검사도 같은 자리에 간다. `check_ground.py` 가 같은 자리에서 같은 선택을 했고
그 까닭을 파일에 적어 뒀다. **한 저장소에서 두 검사기가 다른 자를 쓰면 읽는 쪽이 헷갈린다.**

대신 셋을 걸었다.

- **표에 없는 파일이 어긋나면 바로 실패다.** 새 구멍은 0이다
- **표에 적은 수와 다르면 실패다.** 늘어도 줄어도 그렇다
- **표에 있던 파일이 안 잡히면 실패다.** 고쳐서 빠졌는지 등급 줄을 갈아서 빠졌는지 사람이 본다

세 번째가 중요하다. 등급 줄에 `생성 (제작 관리)` 를 붙이면 내용 등급 검사를 빠져나간다.
깸 시험 다섯이 그것이고 표가 그것을 잡는다.

## 12. 큐에서 내리는 길

### 12.1 71건이라는 수는 맞지 않다

7장이 71건을 검증이 아니라고 적었다. 갈래 B 50 과 C 18 과 D 3 의 합이다.
106건의 검증로그를 다시 읽고 세 가지를 고쳤다.

**첫째. 갈래 C 18건은 웹 검색이 답할 수 있다.** 1층 대화의 자연스러움을 통째로는 못 물어도
그 안의 표현은 물을 수 있다. 로그도 확정이나 실행이라고 안 적었다.

**둘째. 갈래 D 3건도 그렇다.** 1.1 표가 스스로 "웹 검색이 답하지만" 이라고 적었다.
답하는 주체가 같으면 같은 칸에 있어야 한다.

**셋째. 로그의 말만 보면 갈래 A 넷이 확정으로 잘못 내려간다.**
65강과 75강과 82강과 88강 로그가 이렇게 적혀 있다.

> 세 자리 구분과 **목록 선정은** 이 과정의 정리다

**구분은 확정이고 목록 선정은 검증이다. 한 로그가 둘을 같이 담고 있었다.**
그 자리를 확정으로 내리면 목록이 소리 없이 사라진다. 그래서 목록 유무를 먼저 본다.

### 12.2 다시 세면 46건이다

`collect_b.py` 가 이제 보류를 세 갈래로 가른다.

| 갈래 | 건수 | 누가 닫나 |
|---|---|---|
| **검증** | **60** | 대화 세션이 웹 검색으로 |
| 확정 | 37 | 제작자가 정하면 끝난다 |
| 실행 | 9 | 8주 실행이 값을 낸다 |

**46건이 검증 칸에서 내려간다.** 71이 아니라 46이다.

계획서가 갈래 A라 한 강의 23편은 **하나도 안 빠지고 검증에 남는다.**
갈래 B라 한 50편 중 넷이 검증으로 올라온다. l032 는 목록을 담았고
l045 와 l053 과 l057 은 로그에 확정 신호도 실행 신호도 없다.

### 12.3 어떻게 가르나

**로그가 스스로 적은 말이 신호다.** 7장이 짚은 그대로다. 없는 신호를 지어내지 않는다.

| 갈래 | 로그에 나오는 말 |
|---|---|
| 실행 | 8주 실행에서, 실행 뒤에 |
| 확정 | 이 과정의 운용 규칙이다, 운용 판단이다, 표준 분류는 아니다 |

그 위에 규칙 하나를 더 얹는다. **목록을 담은 파일은 무슨 말이 적혀 있든 검증에 남는다.**
12.1 셋째가 그 까닭이다. 목록 판정은 `check_grade.py` 의 자를 그대로 쓴다.
신호가 아예 없으면 검증에 남긴다. **안 내리는 쪽이 잘못 내리는 쪽보다 낫다.**

### 12.4 닫는 법은 갈래가 달라도 같다

판정 낱말을 새로 만들지 않았다. CLAUDE.md 가 통과와 보류와 기각 셋으로 정했고 그대로 둔다.
확정 갈래를 닫으려면 검증로그를 이렇게 고친다.

```
검증로그: 2026-08-16 / 제작자 확정 / 통과 / 40초로 확정한다
```

`collect_b.py` 가 형식만 보므로 그 줄이 서면 완료로 넘어간다.
**갈래는 누구를 기다리는지를 말할 뿐이고 문은 원래 있던 그 문이다.**

### 12.5 큐로 들어오는 문을 하나 더 냈다

`collect_b.py` 가 이제 `신뢰도: B` 말고 **`검증대상:` 이 적힌 파일도 걷는다.**
등급이 A라도 그렇다. 10장이 정한 대로 표기가 문이다.

지금은 그 문으로 들어오는 파일이 없다. A등급 파일 중에 `검증대상:` 을 적은 것이 없다.
**11장의 열다섯이 그것을 적으면 그때 들어온다.** 길은 났고 걸어 들어갈 일이 남았다.
