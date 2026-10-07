# 장면. 288세션이 게임 안에서 어떻게 보이나 (G3)

신뢰도: A 생성 (설계. 대사는 VOA 실제 녹음 대본에서만 온다)
상위 규격: docs/game.md / docs/world.md / docs/town.md
작성일: 2026-10-07

세션 JSON(`out/game/sessions.json`) 은 그날 **무엇을** 하는지 정한다. 이 문서는 그것이 **어디서, 누구와, 무슨 말로** 일어나는지 정한다.
`scripts/derive_scenes.py` 가 이 문서와 세 문서를 읽어 `out/game/scenes.json` 을 낸다. **손으로 JSON 을 안 고친다.**

## 1. 뼈대는 셈으로 나온다

| 무엇 | 어디서 |
|---|---|
| 그 주의 화와 고비와 의미 층 | world.md 5장 |
| 블록의 장소 | game.md 4장. 그 주 그날만 옮기는 블록은 town.md 5.2 손님 표 |
| 장소에 있는 사람 | town.md 5장 명단에 그 주 손님(town.md 5.2)을 더한다 |
| 카드를 내는 사람 | town.md 5.3. 표에 없는 장소는 명단의 첫 사람 |
| 명절과 기념일 | world.md 6.1 달력. 2026-08-10 월요일에 시작한다 |
| 그날 강, 세트, 카드, 녹음, 판 | sessions.json |
| 날의 자리 | 1일은 열기, 2~5일은 다시 오기, 6일은 풀기 |

| 날 | 무엇이 일어나나 |
|---|---|
| 열기 (1일) | 고비가 처음 나타난다. 두 사람은 아직 못 푼다. 그것이 정상이다 |
| 다시 오기 (2~5일) | 같은 고비가 다른 얼굴로 온다. 그날 카드와 판이 그 고비의 연습이다 |
| 풀기 (6일) | 두 사람이 영어로 고비를 푼다. 그 주 과제집이 그날 저녁 일기가 된다 |

카드는 블록 3 의 장소에서 그곳 사람이 낸다. 카드 유형이 장면 갈래가 된다 (game.md 5장).
**판정형 카드의 답은 장면에 안 싣는다.** 게임이 카드 자료에서 쥐고 판단한다 (기준서 13.2).
**판정형 카드의 재료도 그날 블록 1~3 장면에 미리 안 나온다.** 한 번만 듣는 카드가 정말 처음 듣는 것이어야 한다 (2.6).

## 2. 대사의 규칙

**NPC 는 두 사람이 이미 들은 실제 녹음의 줄만 말한다.** 영어를 새로 짓지 않는다 (1번 규칙).

| 규칙 | 무엇 |
|---|---|
| 근거 | 줄마다 대본 이름(`lle1-NN`)을 단다. 그 대본 한 사람의 말 안에서 **이어진 문장 그대로**여야 한다 |
| 들은 것만 | 그 세션까지 블록 1 에서 이미 나온 대본이어야 한다. 아직 안 들은 과의 줄은 안 쓴다 |
| 이름만 바꾼다 | `{A}` `{B}` 는 **그 대본의 화자 이름 자리만** 대신한다 (2.1). 두 사람이 지은 캐릭터 이름이 들어간다 (world.md 2장) |
| 철자 | `{A철자}` 는 이름을 글자마다 끊어 부른 것이다. `{A틀린철자}` 는 게임이 글자 하나를 빼거나 겹친 것이다 |
| 두 사람의 줄 | 인물 칸이 `두 사람` 이면 NPC 가 기다리는 말이다. 기계가 넉넉하게 듣는다 (game.md 6장). 둘 중 누가 말해도 된다 |
| 자리의 줄 | 인물 칸이 `A자리` `B자리` 면 그날 그 자리 사람이 한다. 저녁 블록 4 에서 둘이 서로에게 묻고 답하는 자리다 (world.md 3장 5층) |
| 그 자리에 있는 사람 | NPC 는 그 블록 장소 명단(town.md 5장, 5.1)이나 그 주 손님 표(town.md 5.2)에 있어야 말한다. **숙소 방에는 사람 NPC 가 없다** |
| 한 칸에 한 사람 | `Mr. and Mrs. Lee` 처럼 둘을 한 칸에 안 쓴다. TTS 목소리가 사람마다 하나다 |
| 고르게 부른다 | NPC 가 `{A}` 를 부르는 수와 `{B}` 를 부르는 수의 차이가 주마다 2 이하다. 1년 합으로도 한쪽이 45% 밑으로 안 내려간다 |
| 되묻기 | NPC 가 다시 해 보자고 할 때는 1과 줄 "Let's try that again." 을 쓴다. "Sorry?" 는 52과에 되묻는 꼴로 없어서 NPC 가 안 쓴다 (game.md 6장) |
| 연속성 | world.md 6.2 표. 25주 첫 출근 전에 일 이야기가 없고 37주 새 집 전에 집세 이야기가 없다 |
| 달력 | world.md 6.1 표. 명절 말("Happy New Year!")은 그 주 앞뒤 한 주 안에서만 나온다 |
| 표시 | NPC 목소리는 TTS 다. 1층 대화 표기를 단다 (기준서 13.2) |

**주마다 장면이 있는 세션이 넷 이상이어야 한다** (`derive_scenes.py` 가 건다).
3~48주 대사는 에이전트 여덟이 주 범위를 나눠 쓰고 각자 이 검사를 통과시킨 것을 합쳤다 (2026-10-07). 상표 검사가 Scrabble 두 줄을 잡아 고쳤다.
그 뒤 이야기 감사가 나쁜 줄 88을 짚었다. 고치면서 아래 2.1~2.6 검사를 더했고 검사마다 일부러 어긴 줄을 넣어 잡히는지 봤다.

**장면 대사가 없는 세션도 있다.** 대사는 화의 고비에만 쓴다. 나머지는 카드와 판이 말을 만든다.
대사가 없는 세션에서 NPC 는 몸짓과 표정으로만 맞는다.

### 2.1 이름 자리

`{A}` 는 그날 A 자리에 앉은 사람의 이름이다 (world.md 2.1). 대본에서는 **화자 칸에 나오는 사람 이름**만 대신한다.
예전에는 대문자로 시작하는 낱말이면 무엇이든 대신할 수 있었다. 그래서 "Washington weather changes often." 이 "{A} weather changes often." 으로 통과할 수 있었다.
이제 lle1-01 의 `{A}` 는 Anna 나 Pete 만 대신한다. Phone, Announcer, Director 처럼 화자 칸에 오지만 사람 이름이 아닌 것도 안 대신한다.

### 2.2 48주에만 쓰는 줄

lle1-52 의 1년 돌아보기 줄이다. **48주 집들이에서 처음 한다.** 그 전에 쓰면 피날레가 미리 터진다.

| 줄 | 대본 |
|---|---|
| Looking back over the past year, I've done so many amazing things! | lle1-52 |
| I have met people from all over the world. | lle1-52 |
| I've made many good friends. | lle1-52 |
| And I have a great job! | lle1-52 |
| And I've taken a lot of chances. | lle1-52 |
| I had to make a change. | lle1-52 |
| So, I took some chances. | lle1-52 |
| Sometimes I succeeded. | lle1-52 |
| Sometimes I failed. | lle1-52 |
| But I will never stop trying. | lle1-52 |

### 2.3 8층 줄기에서 안 쓰는 맞장구

world.md 3.2 의 세션(1903 이야기)에서는 아래 줄을 안 쓴다. 원래 대본에서 가게 말투나 사무적 넘김이던 줄이 이민 이야기 뒤에 오면 가볍게 들린다.
대신 "Who are they?", "And it's good to remember them.", "Thanks for listening." 같은 듣는 줄을 쓴다.

| 줄 | 왜 |
|---|---|
| Wow! | 이민 이야기에 감탄사 |
| Good! | 원문은 시청률 차트를 보고 하는 말 |
| Great! | 이야기를 칭찬하는 자리가 아니다 |
| Okay then. | 원문은 상사의 사무적 넘김 |
| Why? | 가계도 앞에서 따지는 꼴 |
| That sounds like fun. | 고된 이야기에 재밌겠다 |
| That sounds fun! | 위와 같다 |
| Okay, let's try it! | 이야기를 말하기 연습으로 만든다 |
| Sorry. Let me try again. | 위와 같다 |

### 2.4 막는 말

대본 줄 그대로여도 안 쓰는 말이다. 슬랭은 전면 금지(CLAUDE.md), 실존 인물과 실제 장소 이름과 상표도 금지(game.md 2장)다.
끝이 부호인 것은 그 문장 하나와 같을 때 잡고, 아닌 것은 낱말 경계로 찾는다. 슬랭은 대소문자를 안 가리고 실명은 가린다.

| 말 | 갈래 | 왜 |
|---|---|---|
| I'm good. | 슬랭 | 거절 뜻의 구어 |
| Gotta go | 슬랭 | lle2-14 |
| No way | 슬랭 | lle2-30 |
| awesome | 슬랭 | lle1-16 |
| you guys | 슬랭 | lle2 |
| bummer | 슬랭 | lle2-28 |
| flop | 슬랭 | lle2-28 |
| Sure thing | 슬랭 | lle1-07 |
| What's up | 슬랭 | 구어 인사 |
| Washington | 실명 | 대본의 도시. 게임은 호놀룰루다 |
| D.C | 실명 | 위와 같다 |
| Metro | 실명 | 실제 교통 이름 |
| Nationals | 실명 | 실제 야구단 |
| Ford | 실명 | 실제 극장 |
| Lincoln | 실명 | 실존 인물 |
| Shakespeare | 실명 | 실존 인물 |
| Georgetown | 실명 | 실제 동네 |
| Spy Museum | 실명 | 실제 박물관 |
| Weaver | 실명 | 대본 속 상사의 성. 게임 인물이 아니다 |
| Matteo | 실명 | 대본 속 주인공의 성 |
| The News | 실명 | 대본 속 회사 이름 |
| Emma G | 실명 | 실존 가수 (lle2-23) |
| Hollywood | 실명 | 실제 장소 |
| DC Ducks | 상표 | lle2-07 |

### 2.5 반복 상한

**같은 줄은 한 주에 두 번, 한 분기에 여섯 번까지다.** 매일 같은 말을 들으면 그 장면은 이야기가 아니라 녹음 재생이 된다.
두 낱말 이하의 짧은 줄("Thanks!", "What's wrong?", "Hi {A}!")은 기능 줄이라 안 센다. 인물이 달라도 같은 줄이면 같이 센다.

### 2.6 판정형 카드 재료

그날 판정형 카드의 재료 문장(세 낱말 이상)이 같은 세션 블록 1~3 대사에 나오면 실패다. 블록 4 는 카드 뒤라 안 본다.
재료의 화자 머리("Anna:")와 괄호 지시("(2초 쉼)")는 떼고 문장끼리 견준다.
이름 자리가 든 대사는 두 사람의 이름이 들어가므로 "Are you Anna?" 재료와 "Are you {A}?" 대사는 다른 문장으로 본다.

## 3. 대사

| 세션 | 블록 | 인물 | 줄 | 근거 |
|---|---|---|---|---|
| 1 | 1 | Daniel | Hi! Are you {A}? | lle1-01 |
| 1 | 1 | 두 사람 | Yes! Hi there! | lle1-01 |
| 1 | 1 | Daniel | "{A}" Is that {A틀린철자}? | lle1-01 |
| 1 | 1 | 두 사람 | No. {A철자} | lle1-01 |
| 1 | 1 | Daniel | Let's try that again. | lle1-01 |
| 2 | 2 | Lena | Hi! Are you {B}? | lle1-01 |
| 2 | 2 | 두 사람 | Yes! | lle1-01 |
| 2 | 2 | Lena | "{B}" Is that {B틀린철자}? | lle1-01 |
| 2 | 2 | 두 사람 | No. {B철자} | lle1-01 |
| 3 | 3 | Mr. Ortiz | Hi! Are you {A}? | lle1-01 |
| 3 | 3 | 두 사람 | Yes! Hi there! | lle1-01 |
| 4 | 4 | Daniel | Here we are! | lle1-05 |
| 4 | 4 | Daniel | We cook in the kitchen. | lle1-05 |
| 4 | 4 | Daniel | We relax in the living room. | lle1-05 |
| 4 | 4 | Daniel | We sleep in the bedroom. | lle1-05 |
| 5 | 4 | 두 사람 | I eat in the kitchen. | lle1-05 |
| 5 | 4 | 두 사람 | I relax in the living room. | lle1-05 |
| 6 | 4 | 두 사람 | Where are you? | lle1-05 |
| 6 | 4 | 두 사람 | I am in the bedroom. | lle1-05 |
| 6 | 4 | 두 사람 | I wash in the bathroom. | lle1-05 |
| 7 | 2 | Lena | Oh, hi, {B}. How's it going? | lle1-06 |
| 8 | 2 | Lena | How's it going? | lle1-06 |
| 8 | 2 | 두 사람 | It's going great. | lle1-06 |
| 9 | 1 | 두 사람 | Where is the gym? | lle1-06 |
| 9 | 1 | Daniel | The gym is across from the lounge. It's next to the mailroom. Go that way. | lle1-06 |
| 9 | 1 | Daniel | No, {B}! Not that way! Go that way! | lle1-06 |
| 9 | 1 | 두 사람 | Across from the lounge. Right. Thanks! | lle1-06 |
| 10 | 2 | 두 사람 | Is it windy today? | lle1-09 |
| 10 | 2 | Lena | No, it is not windy today. | lle1-09 |
| 11 | 3 | 두 사람 | Is it sunny today? | lle1-09 |
| 11 | 3 | Mr. Ortiz | Yes, {A}. It is sunny. | lle1-09 |
| 12 | 2 | Lena | How's it going? | lle1-06 |
| 12 | 2 | 두 사람 | It's going great. How's it going with you? | lle1-06 |
| 13 | 1 | Daniel | Then at the bus station turn left. Then walk straight ahead. | lle1-10 |
| 13 | 1 | 두 사람 | Thanks! | lle1-06 |
| 13 | 1 | Daniel | No, {A}! Not that way! Go that way! | lle1-06 |
| 14 | 2 | 두 사람 | Where is the gym? | lle1-06 |
| 14 | 2 | Lena | The gym is across from the lounge. It's next to the mailroom. Go that way. | lle1-06 |
| 14 | 2 | 두 사람 | The gym is across from … what? | lle1-06 |
| 14 | 2 | Lena | The gym is across from the lounge. | lle1-06 |
| 14 | 2 | 두 사람 | Across from the lounge. Right. Thanks! | lle1-06 |
| 15 | 1 | 두 사람 | This is not the gym. | lle1-06 |
| 15 | 1 | Daniel | That's right, {B}. This is the mailroom. | lle1-06 |
| 15 | 1 | Daniel | The gym is across from the lounge. It is behind the lobby. | lle1-06 |
| 15 | 1 | 두 사람 | Right. Right. See you. | lle1-06 |
| 15 | 1 | Daniel | See you, {B}! | lle1-06 |
| 16 | 3 | 두 사람 | Is there a post office near here? | lle1-11 |
| 16 | 3 | Mr. Ortiz | Um, no. The post office is far from here. But there is a mailbox across from the store. | lle1-11 |
| 16 | 3 | 두 사람 | Is there a bank near here? | lle1-11 |
| 16 | 3 | Mr. Ortiz | There is a bank behind you. | lle1-11 |
| 17 | 1 | 두 사람 | Where is the library? | lle1-11 |
| 17 | 1 | Daniel | It is on this street on the corner. | lle1-11 |
| 17 | 1 | 두 사람 | Let's go! | lle1-11 |
| 18 | 3 | Mr. Ortiz | Is there a post office near here? | lle1-11 |
| 18 | 3 | 두 사람 | Um, no. The post office is far from here. But there is a mailbox across from the store. | lle1-11 |
| 18 | 3 | Mr. Ortiz | Is there a bank near here? | lle1-11 |
| 18 | 3 | 두 사람 | There is a bank behind you. | lle1-11 |
| 18 | 3 | Mr. Ortiz | Thanks, {A}. You know our neighborhood so well. | lle1-11 |
| 19 | 2 | Lena | {B}, here's your coffee. | lle1-12 |
| 19 | 2 | 두 사람 | Thanks! | lle1-06 |
| 19 | 2 | Lena | What's wrong? | lle1-12 |
| 19 | 2 | 두 사람 | I'm thinking about my family. I'm feeling homesick. | lle1-12 |
| 19 | 2 | Lena | Do you want to talk about it? | lle1-12 |
| 20 | 1 | Daniel | Oh, hi, {A}. How's it going? | lle1-06 |
| 20 | 1 | 두 사람 | It's going great. How's it going with you? | lle1-06 |
| 20 | 1 | 두 사람 | {B}, I want to work out. | lle1-06 |
| 20 | 1 | Daniel | I want to work out too! Join me! | lle1-06 |
| 21 | 2 | Grace | What's wrong? | lle1-12 |
| 21 | 2 | 두 사람 | I'm feeling homesick. | lle1-12 |
| 21 | 2 | Grace | Photos really help. | lle1-12 |
| 22 | 1 | 두 사람 | I like to exercise. I like to shop. I like to garden. But today I feel bored. | lle1-13 |
| 22 | 1 | Daniel | When I feel bored I always look for something unusual to do! | lle1-13 |
| 22 | 1 | Daniel | I hear music. Let's go see! | lle1-13 |
| 22 | 1 | 두 사람 | What is going on here? | lle1-13 |
| 24 | 2 | Lena | {A}, here's your coffee. | lle1-12 |
| 24 | 2 | 두 사람 | Thanks! | lle1-06 |
| 24 | 2 | Lena | What's wrong? | lle1-12 |
| 24 | 2 | 두 사람 | I'm thinking about my family. I'm feeling homesick. | lle1-12 |
| 24 | 2 | Lena | Do you want to talk about it? | lle1-12 |
| 24 | 2 | 두 사람 | Sure! I have some photos. | lle1-12 |
| 24 | 2 | Lena | Thanks for showing me your family photos. | lle1-12 |
| 24 | 2 | 두 사람 | I do feel better. Thanks for listening. | lle1-12 |
| 25 | 3 | 두 사람 | How about jeans and a t-shirt? | lle1-14 |
| 25 | 3 | Mr. Ortiz | Yes, the right size for you is medium. | lle1-14 |
| 25 | 3 | Mr. Ortiz | Do you have cash? | lle1-11 |
| 25 | 3 | 두 사람 | I do! | lle1-11 |
| 26 | 2 | Lena | What's wrong? | lle1-12 |
| 26 | 2 | 두 사람 | It's too small. | lle1-14 |
| 26 | 2 | Lena | Yes, it is too small. | lle1-14 |
| 27 | 3 | Mr. Ortiz | Do you have more cash? | lle1-11 |
| 27 | 3 | 두 사람 | No. Is there a bank near here? | lle1-11 |
| 27 | 3 | Mr. Ortiz | There is a bank behind you. | lle1-11 |
| 28 | 3 | 두 사람 | How about a hat? | lle1-14 |
| 28 | 3 | Mr. Ortiz | Mm, take off the hat. That's better. | lle1-14 |
| 28 | 3 | 두 사람 | Thanks. | lle1-14 |
| 30 | 3 | Mr. Ortiz | Hi, {B}. What's going on? | lle1-17 |
| 30 | 3 | 두 사람 | Not much. How about you? | lle1-17 |
| 30 | 3 | Mr. Ortiz | Busy as usual. | lle1-17 |
| 30 | 3 | 두 사람 | It's too small. | lle1-14 |
| 30 | 3 | Mr. Ortiz | Yes, the right size for you is medium. Let's try again. | lle1-14 |
| 30 | 3 | 두 사람 | Oh. Thanks! | lle1-14 |
| 30 | 3 | Mr. Ortiz | That looks great. | lle1-14 |
| 31 | 1 | Daniel | Now, {A}, remember. | lle1-18 |
| 31 | 1 | Daniel | Are you ready? | lle1-18 |
| 31 | 1 | 두 사람 | Yes. | lle1-18 |
| 31 | 1 | Daniel | Stop! | lle1-18 |
| 32 | 1 | Daniel | Now, {B}, remember. | lle1-18 |
| 32 | 1 | Daniel | Stop! {B}, you are doing it again. | lle1-18 |
| 32 | 1 | 두 사람 | Sorry. Let me try again. | lle1-18 |
| 33 | 2 | Lena | What's wrong? | lle1-12 |
| 33 | 2 | 두 사람 | This is going to be a very long day. | lle1-18 |
| 33 | 2 | Lena | I have an idea. | lle1-18 |
| 34 | 2 | Lena | That's too bad. It's really hot today. | lle1-19 |
| 34 | 2 | 두 사람 | Yes it is. | lle1-19 |
| 34 | 4 | Daniel | When you arrive, please come to my office. I have important news to tell you. | lle1-19 |
| 34 | 4 | 두 사람 | Of course. | lle1-19 |
| 35 | 1 | Daniel | {A}, I have good news and I have bad news. Which do you want to hear first? | lle1-19 |
| 35 | 1 | 두 사람 | The good news. No … okay, the bad news. | lle1-19 |
| 36 | 1 | Daniel | Now, {A}, remember. | lle1-18 |
| 36 | 1 | 두 사람 | Okay. I got it. | lle1-18 |
| 36 | 1 | Daniel | Are you ready? | lle1-18 |
| 36 | 1 | 두 사람 | Yes. | lle1-18 |
| 36 | 1 | Daniel | That's right! Now you've got it! | lle1-18 |
| 37 | 2 | Lena | Hi, {B}. What's going on? | lle1-17 |
| 37 | 2 | 두 사람 | Not much. How about you? | lle1-17 |
| 37 | 2 | Lena | Busy as usual. | lle1-17 |
| 37 | 2 | Lena | I'm going to teach children how to play the ukulele. | lle1-17 |
| 38 | 3 | 두 사람 | What do you and your family do together? | lle1-17 |
| 38 | 3 | Mr. Ortiz | We always eat dinner together and sometimes we play board games. | lle1-17 |
| 38 | 3 | 두 사람 | Playing board games is fun, too! | lle1-17 |
| 39 | 2 | Lena | I am busy on Monday night. I'm going to jog in the park with my friend. Do you jog? | lle1-17 |
| 39 | 2 | 두 사람 | Oh! I always jog. Well, sometimes I jog. Okay, I never jog. | lle1-17 |
| 39 | 2 | Lena | I always feel great after I jog. | lle1-17 |
| 40 | 1 | Daniel | Are you busy this Thursday at 6pm? | lle1-17 |
| 40 | 1 | 두 사람 | I'm busy. I am going to tap dance with my friends Thursday night. | lle1-17 |
| 40 | 1 | Daniel | Tap dancing? That sounds fun! | lle1-17 |
| 40 | 1 | 두 사람 | I'm still learning. But it is fun! | lle1-17 |
| 41 | 3 | 두 사람 | Who is that woman in the picture? | lle1-12 |
| 41 | 3 | Mr. Ortiz | She is my mom's sister. | lle1-12 |
| 41 | 3 | 두 사람 | Oh. I see. | lle1-09 |
| 42 | 2 | Lena | Hi, {A}. What's going on? | lle1-17 |
| 42 | 2 | 두 사람 | Not much. How about you? | lle1-17 |
| 42 | 2 | Lena | Busy as usual. | lle1-17 |
| 42 | 2 | Lena | I'm going to teach children how to play the ukulele. | lle1-17 |
| 42 | 2 | 두 사람 | The world does need more ukulele players. | lle1-17 |
| 43 | 1 | Daniel | What's wrong? | lle1-12 |
| 43 | 1 | 두 사람 | I am really nervous. | lle1-18 |
| 43 | 1 | Daniel | Do you want to talk about it? | lle1-12 |
| 44 | 3 | Mr. Ortiz | Are you busy now? | lle1-17 |
| 44 | 3 | 두 사람 | I'm busy. | lle1-17 |
| 44 | 3 | Mr. Ortiz | Okay. See you soon. | lle1-10 |
| 46 | 3 | 진료소 접수 | Hi! Are you {B}? | lle1-01 |
| 46 | 3 | 두 사람 | Yes! | lle1-01 |
| 46 | 3 | Dr. Patel | What's wrong? | lle1-12 |
| 46 | 3 | 두 사람 | I am really nervous. | lle1-18 |
| 46 | 3 | Dr. Patel | Let me see. | lle1-14 |
| 48 | 3 | Dr. Patel | Do you want to talk about it? | lle1-12 |
| 48 | 3 | 두 사람 | Sure! | lle1-12 |
| 48 | 3 | 두 사람 | I do feel better. Thanks for listening. | lle1-12 |
| 49 | 1 | Daniel | {B}! Over here! | lle1-10 |
| 49 | 1 | Daniel | Oh, hi, {B}. How's it going? | lle1-06 |
| 49 | 1 | 두 사람 | It's going great. How's it going with you? | lle1-06 |
| 49 | 1 | Daniel | Let's try that again. | lle1-01 |
| 50 | 2 | Lena | Hi {A}! | lle1-10 |
| 50 | 2 | 두 사람 | Hi there! | lle1-06 |
| 50 | 2 | Lena | Nice to meet you. | lle1-01 |
| 50 | 2 | 두 사람 | Nice to meet you. | lle1-01 |
| 50 | 2 | Lena | See you soon! | lle1-10 |
| 51 | 3 | Mr. Ortiz | Hi! Are you {B}? | lle1-01 |
| 51 | 3 | 두 사람 | Yes! Hi there! | lle1-01 |
| 51 | 3 | 두 사람 | How's it going? | lle1-06 |
| 51 | 3 | Mr. Ortiz | Hi, {B}. It's going great. How's it going with you? | lle1-06 |
| 52 | 1 | Daniel | Oh, hi, {A}. How's it going? | lle1-06 |
| 52 | 1 | 두 사람 | It's going great. How's it going with you? | lle1-06 |
| 52 | 1 | 두 사람 | Is there a post office near here? | lle1-11 |
| 52 | 1 | Daniel | The post office is far from here. But there is a mailbox across from the store. | lle1-11 |
| 53 | 3 | Mr. Ortiz | Hi {A}! | lle1-10 |
| 53 | 3 | Mr. Ortiz | Do you have cash? | lle1-11 |
| 53 | 3 | 두 사람 | No. Is there a bank near here? | lle1-11 |
| 53 | 3 | Mr. Ortiz | There is a bank behind you. | lle1-11 |
| 54 | 1 | 두 사람 | How's it going? | lle1-06 |
| 54 | 1 | Daniel | Hi, {A}. It's going great. How's it going with you? | lle1-06 |
| 54 | 1 | 두 사람 | Is there a bank near here? | lle1-11 |
| 54 | 1 | Daniel | It is on this street on the corner. | lle1-11 |
| 54 | 1 | 두 사람 | Thanks! | lle1-06 |
| 54 | 1 | Daniel | See you, {A}! | lle1-06 |
| 54 | 1 | 두 사람 | See you. | lle1-06 |
| 55 | 1 | Daniel | Remember to check the forecast -- the right forecast. | lle1-09 |
| 55 | 1 | 두 사람 | Is it windy today? | lle1-09 |
| 56 | 2 | Lena | {B}, here's your coffee. | lle1-12 |
| 56 | 2 | Lena | What's wrong? | lle1-12 |
| 56 | 2 | 두 사람 | Is it sunny today? | lle1-09 |
| 56 | 2 | Lena | Yes, {B}. | lle1-09 |
| 58 | 4 | 두 사람 | What is going on here? | lle1-13 |
| 58 | 4 | Daniel | Remember to check the forecast -- the right forecast. | lle1-09 |
| 58 | 4 | 두 사람 | Oh. I see. | lle1-09 |
| 59 | 2 | Grace | What's wrong? | lle1-12 |
| 59 | 2 | 두 사람 | I am really nervous. | lle1-18 |
| 59 | 2 | Grace | Do you want to talk about it? | lle1-12 |
| 59 | 2 | 두 사람 | Sure! | lle1-12 |
| 60 | 1 | Daniel | What's wrong? | lle1-12 |
| 60 | 1 | 두 사람 | Is it windy today? | lle1-09 |
| 60 | 1 | Daniel | No, it is not windy today. | lle1-09 |
| 60 | 1 | 두 사람 | Is it sunny today? | lle1-09 |
| 60 | 1 | Daniel | Yes, {A}. It is sunny. | lle1-09 |
| 60 | 1 | 두 사람 | Oh. I see. | lle1-09 |
| 61 | 1 | Daniel | Something is wrong. | lle1-14 |
| 61 | 1 | Daniel | Let me see. | lle1-14 |
| 61 | 1 | 두 사람 | Let's try again. | lle1-14 |
| 61 | 1 | Daniel | Sorry, {A}. I have to help other friends. | lle1-14 |
| 64 | 1 | Daniel | Hey, do you wanna see a movie with me? | lle1-17 |
| 64 | 1 | 두 사람 | When? | lle1-17 |
| 64 | 1 | Daniel | How about on Wednesday night? | lle1-17 |
| 64 | 1 | 두 사람 | Let me see. | lle1-14 |
| 65 | 2 | Lena | Hey, do you wanna see a movie with me? | lle1-17 |
| 65 | 2 | 두 사람 | Wednesday night I am not busy. Oh, no, wait. This Wednesday night I will be busy. | lle1-17 |
| 65 | 2 | Lena | What are you doing? | lle1-17 |
| 65 | 2 | 두 사람 | I'm not busy Monday night. | lle1-17 |
| 66 | 1 | Daniel | Wait a minute. Are you busy now? | lle1-17 |
| 66 | 1 | 두 사람 | I'm busy. | lle1-17 |
| 66 | 1 | 두 사람 | How about on Wednesday night? | lle1-17 |
| 66 | 1 | Daniel | Wednesday night I am not busy. Oh, no, wait. This Wednesday night I will be busy. | lle1-17 |
| 66 | 1 | 두 사람 | I'm not busy Monday night. | lle1-17 |
| 66 | 1 | Daniel | Sure! | lle1-17 |
| 67 | 1 | Daniel | Great. Are you ready? | lle1-18 |
| 67 | 1 | 두 사람 | Yes. | lle1-18 |
| 67 | 1 | 두 사람 | I am really nervous. | lle1-18 |
| 67 | 1 | Daniel | I have an idea. | lle1-18 |
| 70 | 1 | Daniel | Oh, hi, {B}. How's it going? | lle1-06 |
| 70 | 1 | 두 사람 | It's going great. How's it going with you? | lle1-06 |
| 70 | 1 | Daniel | When you arrive, please come to my office. I have important news to tell you. | lle1-19 |
| 70 | 1 | 두 사람 | Of course. Good-bye. | lle1-19 |
| 71 | 2 | Grace | Are you ready? | lle1-18 |
| 71 | 2 | 두 사람 | I am really nervous. | lle1-18 |
| 71 | 2 | 두 사람 | Sorry. Let me try again. | lle1-18 |
| 71 | 2 | Grace | That's right! Now you've got it! | lle1-18 |
| 72 | 1 | 두 사람 | Hi there! | lle1-19 |
| 72 | 1 | 면담관 | Great. Are you ready? | lle1-18 |
| 72 | 1 | 두 사람 | Yes. | lle1-18 |
| 72 | 1 | 면담관 | {A}, I have good news and I have bad news. Which do you want to hear first? | lle1-19 |
| 72 | 1 | 두 사람 | Let me see. | lle1-14 |
| 72 | 1 | 두 사람 | The good news. | lle1-19 |
| 72 | 1 | 면담관 | Well, you are good at asking questions. You are good at talking to people. | lle1-19 |
| 72 | 1 | 두 사람 | Of course. Good-bye. | lle1-19 |
| 73 | 1 | Mrs. Tanaka | Hi there! | lle1-21 |
| 73 | 1 | Mrs. Tanaka | "{B}" Is that {B틀린철자}? | lle1-01 |
| 73 | 1 | 두 사람 | No. {B철자} | lle1-01 |
| 73 | 1 | Mrs. Tanaka | Can you come with me? | lle1-21 |
| 73 | 1 | 두 사람 | Sure. That sounds like fun. | lle1-21 |
| 74 | 2 | Rosa | Hi there! | lle1-21 |
| 74 | 2 | Rosa | Can you help me? | lle1-21 |
| 74 | 2 | 두 사람 | Sure. | lle1-21 |
| 74 | 2 | Rosa | Great! | lle1-21 |
| 76 | 1 | 두 사람 | Can you help me? | lle1-21 |
| 76 | 1 | Mrs. Tanaka | Sure. | lle1-21 |
| 76 | 1 | Mrs. Tanaka | Okay, let's try it! | lle1-22 |
| 76 | 1 | 두 사람 | Let's do it! | lle1-22 |
| 78 | 1 | 두 사람 | Hi there! | lle1-22 |
| 78 | 1 | 두 사람 | Can you come with me? | lle1-21 |
| 78 | 1 | Mrs. Tanaka | Sure. That sounds like fun. | lle1-21 |
| 78 | 1 | Mrs. Tanaka | Okay, let's try it! | lle1-22 |
| 78 | 1 | 두 사람 | Let's do it! | lle1-22 |
| 79 | 1 | Mrs. Tanaka | Hi there! | lle1-22 |
| 79 | 1 | Mrs. Tanaka | Yesterday was the most amazing day. | lle1-24 |
| 79 | 1 | 두 사람 | I see something new every day -- like yesterday. | lle1-24 |
| 79 | 1 | Mrs. Tanaka | That sounds like fun. | lle1-21 |
| 80 | 2 | Grace | Okay, let's try it! | lle1-22 |
| 80 | 2 | 두 사람 | And I wanted a break. | lle1-24 |
| 80 | 2 | Grace | Right! | lle1-22 |
| 82 | 1 | Mrs. Tanaka | Hi, {B}! Have a seat. | lle1-29 |
| 82 | 1 | 두 사람 | Thanks. This was a good idea. | lle1-29 |
| 82 | 1 | Mrs. Tanaka | How are you these days? | lle1-29 |
| 82 | 1 | 두 사람 | I am tired. | lle1-29 |
| 82 | 1 | Mrs. Tanaka | Hmm, that's too bad. | lle1-29 |
| 83 | 2 | Rosa | Hi, {A}! Have a seat. | lle1-29 |
| 83 | 2 | 두 사람 | Thanks. | lle1-29 |
| 83 | 2 | Rosa | How's it going? | lle1-06 |
| 83 | 2 | 두 사람 | It's going great. | lle1-06 |
| 84 | 1 | Mrs. Tanaka | Hi, {A}! Have a seat. | lle1-29 |
| 84 | 1 | Mrs. Tanaka | How are you these days? | lle1-29 |
| 84 | 1 | 두 사람 | I am tired. | lle1-29 |
| 84 | 1 | 두 사람 | I see something new every day -- like yesterday. | lle1-24 |
| 84 | 1 | 두 사람 | And I wanted a break. | lle1-24 |
| 84 | 1 | Mrs. Tanaka | Really? | lle1-29 |
| 85 | 2 | Rosa | Hi, {B}! Have a seat. | lle1-29 |
| 85 | 2 | Rosa | How are you these days? | lle1-29 |
| 85 | 2 | 두 사람 | Yesterday was the most amazing day. | lle1-24 |
| 85 | 2 | Rosa | Do you want to talk about it? | lle1-12 |
| 85 | 2 | 두 사람 | Sorry. Let me try again. | lle1-18 |
| 86 | 3 | Ben | How much money can you spend? | lle1-30 |
| 86 | 3 | 두 사람 | Let me see. | lle1-14 |
| 86 | 3 | Ben | Is that everything you need? | lle1-30 |
| 87 | 1 | Mrs. Tanaka | Hi, {B}. What's going on? | lle1-17 |
| 87 | 1 | 두 사람 | Not much. | lle1-17 |
| 87 | 1 | Mrs. Tanaka | Do you want to talk about it? | lle1-12 |
| 87 | 1 | 두 사람 | I am tired. | lle1-29 |
| 88 | 2 | Rosa | {A}, what took you so long? | lle1-35 |
| 88 | 2 | 두 사람 | I love shopping! | lle1-35 |
| 88 | 2 | 두 사람 | I bought everything on the list. | lle1-35 |
| 88 | 2 | Rosa | Let me see. | lle1-35 |
| 90 | 2 | Rosa | Hi, {A}! Have a seat. | lle1-29 |
| 90 | 2 | Rosa | How's it going? | lle1-06 |
| 90 | 2 | 두 사람 | And I wanted a break. So, I walked and walked … and walked. Then, I saw something! It was a festival -- a big festival! | lle1-24 |
| 90 | 2 | Rosa | That sounds like fun. | lle1-21 |
| 90 | 2 | 두 사람 | I love shopping! And, I did not spend too much money. Oh, no! But I did spend too much time! | lle1-35 |
| 90 | 2 | Rosa | Um-hum, I can believe that. | lle1-29 |
| 91 | 3 | Ben | My favorite season is summer because of summer vacation! | lle1-22 |
| 91 | 3 | 두 사람 | Yes. | lle1-21 |
| 91 | 3 | Ben | When I go camping, {B}, I like to go hiking and fishing. | lle1-22 |
| 91 | 3 | 두 사람 | Okay. | lle1-36 |
| 91 | 3 | Ben | Is that everything you need? | lle1-30 |
| 93 | 3 | Ben | I always feel great after I jog. | lle1-17 |
| 93 | 3 | 두 사람 | Really? | lle1-29 |
| 93 | 3 | Ben | Do you jog? | lle1-17 |
| 93 | 3 | 두 사람 | Okay, I never jog. But I will try because it is good for you. | lle1-17 |
| 94 | 3 | Ben | {B}! I am really happy to see you! | lle1-38 |
| 94 | 3 | 두 사람 | Me too! | lle1-38 |
| 94 | 3 | Ben | Is that everything you need? | lle1-30 |
| 94 | 3 | 두 사람 | Yes. | lle1-30 |
| 94 | 3 | Ben | Okay. | lle1-36 |
| 96 | 3 | Ben | {A}! I am really happy to see you! | lle1-38 |
| 96 | 3 | 두 사람 | Me too! | lle1-38 |
| 96 | 3 | Ben | I'm still learning. But it is fun! | lle1-17 |
| 96 | 3 | 두 사람 | That sounds fun! | lle1-17 |
| 96 | 3 | Ben | It is really good to talk to you. | lle1-38 |
| 97 | 2 | Rosa | Are you busy this Thursday at 6pm? | lle1-17 |
| 97 | 2 | 두 사람 | What? | lle1-29 |
| 97 | 2 | Rosa | Everyone has to bring something or do something. You can bring food, or you can perform. | lle1-21 |
| 97 | 2 | 두 사람 | Yes. | lle1-21 |
| 97 | 2 | Rosa | Great! | lle1-21 |
| 98 | 3 | Ben | I have to help my friend with the party. Can you help me? | lle1-21 |
| 98 | 3 | 두 사람 | What? | lle1-29 |
| 98 | 3 | Ben | Can you help me? | lle1-21 |
| 98 | 3 | 두 사람 | Sure. | lle1-21 |
| 99 | 2 | Rosa | {A}, what took you so long? Our guests will be here soon! | lle1-35 |
| 99 | 2 | 두 사람 | When do our guests arrive? | lle1-35 |
| 99 | 2 | Rosa | They arrive in 30 minutes! | lle1-35 |
| 99 | 2 | 두 사람 | Wait a minute. | lle1-17 |
| 100 | 1 | 두 사람 | Excuse me. Can you help me? | lle1-30 |
| 100 | 1 | Mrs. Tanaka | Sure! What do you need? | lle1-30 |
| 100 | 1 | 두 사람 | Everyone has to bring something or do something. | lle1-21 |
| 100 | 1 | Mrs. Tanaka | I can help with that. | lle1-48 |
| 100 | 1 | Mrs. Tanaka | You can bring food, or you can perform. | lle1-21 |
| 100 | 1 | 두 사람 | I'll write that on my list! | lle1-48 |
| 102 | 2 | 두 사람 | I bought everything on the list. | lle1-35 |
| 102 | 2 | Rosa | Let me see. | lle1-35 |
| 102 | 2 | Rosa | Wow, thanks. | lle1-48 |
| 102 | 2 | Grace | We always eat dinner together and sometimes we play board games. | lle1-17 |
| 102 | 2 | 두 사람 | Playing board games is fun, too! | lle1-17 |
| 102 | 2 | 두 사람 | I can help with that. | lle1-48 |
| 103 | 2 | Rosa | How are you these days? | lle1-29 |
| 103 | 2 | 두 사람 | I see something new every day -- like yesterday. | lle1-24 |
| 103 | 2 | 두 사람 | Can you hear me? | lle1-49 |
| 103 | 2 | Rosa | Wait here. | lle1-11 |
| 103 | 2 | Rosa | Hi, {A}. What's going on? | lle1-17 |
| 103 | 2 | 두 사람 | Not much. | lle1-17 |
| 104 | 3 | Ben | Wait a minute. | lle1-17 |
| 104 | 3 | Ben | Is that everything you need? | lle1-30 |
| 106 | 2 | Rosa | Please, please, sit down. | lle1-52 |
| 106 | 2 | 두 사람 | Yesterday was the most amazing day. | lle1-24 |
| 106 | 2 | Rosa | Wait here. | lle1-11 |
| 106 | 2 | Rosa | {A}, tell us more. | lle1-52 |
| 106 | 2 | 두 사람 | Wait a minute. | lle1-17 |
| 108 | 2 | Rosa | Please, please, sit down. | lle1-52 |
| 108 | 2 | 두 사람 | Yesterday was the most amazing day. | lle1-24 |
| 108 | 2 | Rosa | Wait here. | lle1-11 |
| 108 | 2 | 두 사람 | I see something new every day -- like yesterday. | lle1-24 |
| 108 | 2 | Rosa | {B}, tell us more. | lle1-52 |
| 108 | 2 | 두 사람 | And I wanted a break. So, I walked and walked … and walked. Then, I saw something! | lle1-24 |
| 108 | 2 | Rosa | Well, thank you for sharing your news and so much more with us, {B}. | lle1-52 |
| 109 | 1 | Mrs. Tanaka | Playing board games is fun, too! | lle1-17 |
| 109 | 1 | 두 사람 | I don't know. | lle1-21 |
| 109 | 1 | Mrs. Tanaka | Really? | lle1-29 |
| 109 | 1 | 두 사람 | Yes. | lle1-21 |
| 109 | 1 | Mrs. Tanaka | It's okay. | lle1-22 |
| 110 | 2 | Lena | {B}, here's your coffee. | lle1-12 |
| 110 | 2 | 두 사람 | Thanks! | lle1-06 |
| 110 | 2 | Rosa | I love the beach! | lle1-22 |
| 110 | 2 | 두 사람 | Me too! | lle1-38 |
| 110 | 2 | Rosa | Really? | lle1-29 |
| 110 | 2 | 두 사람 | Yes. | lle1-21 |
| 112 | 1 | Mrs. Tanaka | My favorite season is summer because of summer vacation! | lle1-22 |
| 112 | 1 | 두 사람 | Me, too. | lle1-22 |
| 112 | 1 | Mrs. Tanaka | I love the beach! | lle1-22 |
| 112 | 1 | 두 사람 | But I love the water. And I love being on the water. | lle1-30 |
| 113 | 2 | Rosa | Guess what I wanted to be? | lle1-29 |
| 113 | 2 | 두 사람 | What? | lle1-29 |
| 113 | 2 | Rosa | I wanted to be... an astronaut. | lle1-29 |
| 113 | 2 | 두 사람 | Really? | lle1-29 |
| 114 | 1 | 두 사람 | My favorite season is summer because of summer vacation! | lle1-22 |
| 114 | 1 | Mrs. Tanaka | Really? | lle1-29 |
| 114 | 1 | 두 사람 | One of the most popular vacations is … going to the beach! | lle1-22 |
| 114 | 1 | Mrs. Tanaka | That sounds like fun. | lle1-21 |
| 115 | 1 | Mrs. Tanaka | Well, {B}, please share that news with us. | lle1-52 |
| 115 | 1 | 두 사람 | Yesterday was the most amazing day. | lle1-24 |
| 115 | 1 | 두 사람 | Wait a minute. | lle1-17 |
| 115 | 1 | Mrs. Tanaka | It's okay. | lle1-22 |
| 116 | 2 | Rosa | {A}, tell us more. | lle1-52 |
| 116 | 2 | 두 사람 | I see something new every day -- like yesterday. | lle1-24 |
| 116 | 2 | 두 사람 | And I wanted a break. | lle1-24 |
| 116 | 2 | 두 사람 | Sorry. Let me try again. | lle1-18 |
| 118 | 4 | A자리 | What's wrong? | lle1-12 |
| 118 | 4 | B자리 | I am tired. | lle1-29 |
| 118 | 4 | A자리 | Hmm, that's too bad. | lle1-29 |
| 120 | 1 | Mrs. Tanaka | {A}, tell us more. | lle1-52 |
| 120 | 1 | 두 사람 | Yesterday was the most amazing day. | lle1-24 |
| 120 | 1 | 두 사람 | And I wanted a break. So, I walked and walked … and walked. Then, I saw something! It was a festival -- a big festival! | lle1-24 |
| 120 | 1 | 두 사람 | There was dancing and food and games! | lle1-24 |
| 120 | 1 | Mrs. Tanaka | Really? | lle1-29 |
| 120 | 1 | 두 사람 | Honestly. | lle1-29 |
| 120 | 1 | Mrs. Tanaka | That sounds like fun. | lle1-21 |
| 121 | 1 | Mrs. Tanaka | Sure! What do you need? | lle1-30 |
| 121 | 1 | Mrs. Tanaka | How much money can you spend? | lle1-30 |
| 121 | 1 | 두 사람 | But what does all that mean? | lle1-19 |
| 121 | 1 | Mrs. Tanaka | How much money can you spend? | lle1-30 |
| 121 | 1 | 두 사람 | I don't know. | lle1-21 |
| 121 | 1 | Mrs. Tanaka | Let's try that again. | lle1-01 |
| 123 | 3 | 두 사람 | Is there a bank near here? | lle1-11 |
| 123 | 3 | Ben | There is a bank behind you. | lle1-11 |
| 123 | 3 | 두 사람 | Is there a post office near here? | lle1-11 |
| 123 | 3 | Ben | The post office is far from here. | lle1-11 |
| 124 | 1 | Mrs. Tanaka | Let me see. | lle1-35 |
| 124 | 1 | Mrs. Tanaka | It is on this street on the corner. | lle1-11 |
| 124 | 1 | 두 사람 | But what does all that mean? | lle1-19 |
| 124 | 1 | Mrs. Tanaka | The post office is far from here. But there is a mailbox across from the store. | lle1-11 |
| 125 | 4 | A자리 | Happy New Year! | lle1-40 |
| 125 | 4 | B자리 | Happy New Year! | lle1-40 |
| 125 | 4 | A자리 | Some people, at the start of a new year, make a resolution -- a promise to yourself to be better. | lle1-40 |
| 125 | 4 | B자리 | I thought about my resolution carefully. | lle1-40 |
| 125 | 4 | B자리 | Wish me luck! | lle1-40 |
| 126 | 1 | Mrs. Tanaka | Sure! What do you need? | lle1-30 |
| 126 | 1 | 두 사람 | Is there a bank near here? | lle1-11 |
| 126 | 1 | Mrs. Tanaka | It is on this street on the corner. | lle1-11 |
| 126 | 1 | 두 사람 | Is there a post office near here? | lle1-11 |
| 126 | 1 | Mrs. Tanaka | The post office is far from here. But there is a mailbox across from the store. | lle1-11 |
| 126 | 1 | 두 사람 | Good point. | lle1-29 |
| 126 | 1 | 두 사람 | Well, thanks for your help. | lle1-30 |
| 127 | 1 | Mrs. Tanaka | I have some photos. | lle1-12 |
| 127 | 1 | 두 사람 | Who are they? | lle1-12 |
| 127 | 1 | Mrs. Tanaka | And it's good to remember them. | lle1-29 |
| 127 | 1 | 두 사람 | In fact, this park reminds me of my home very far away. | lle1-12 |
| 128 | 2 | Rosa | What's wrong? | lle1-12 |
| 128 | 2 | 두 사람 | I'm thinking about my family. | lle1-12 |
| 128 | 2 | Rosa | Do you want to talk about it? | lle1-12 |
| 128 | 2 | 두 사람 | I don't know. | lle1-21 |
| 130 | 1 | Mrs. Tanaka | I have so much to tell you. | lle1-38 |
| 130 | 1 | 두 사람 | Who are they? | lle1-12 |
| 130 | 1 | Mrs. Tanaka | At first it was hard. | lle1-38 |
| 130 | 1 | Mrs. Tanaka | And it's good to remember them. | lle1-29 |
| 131 | 4 | A자리 | I'm thinking about my family. | lle1-12 |
| 131 | 4 | B자리 | Do you want to talk about it? | lle1-12 |
| 131 | 4 | A자리 | I have some photos. | lle1-12 |
| 132 | 1 | 두 사람 | I have so much to tell you. | lle1-38 |
| 132 | 1 | 두 사람 | At first it was hard. | lle1-38 |
| 132 | 1 | 두 사람 | But I like remembering my old home, too. | lle1-12 |
| 132 | 1 | Mrs. Tanaka | It is really good to talk to you. | lle1-38 |
| 132 | 1 | 두 사람 | Thanks for listening. | lle1-12 |
| 133 | 1 | Mrs. Tanaka | {A}, you are speaking too softly. | lle1-40 |
| 133 | 1 | 두 사람 | Sorry. Let me try again. | lle1-40 |
| 133 | 1 | Mrs. Tanaka | Yes, that is loud enough. | lle1-40 |
| 134 | 2 | Rosa | How's it going? | lle1-06 |
| 134 | 2 | 두 사람 | It's going great. How's it going with you? | lle1-06 |
| 134 | 2 | Rosa | Busy as usual. | lle1-17 |
| 134 | 2 | 두 사람 | See you. | lle1-06 |
| 137 | 1 | Mrs. Tanaka | {B}, you are speaking too softly. | lle1-40 |
| 137 | 1 | 두 사람 | Sorry. Let me try again. | lle1-40 |
| 137 | 1 | Mrs. Tanaka | Yes, that is loud enough. | lle1-40 |
| 138 | 1 | 두 사람 | Well, thanks for your help. See you later! | lle1-30 |
| 138 | 1 | Mrs. Tanaka | It is really good to talk to you. | lle1-38 |
| 139 | 2 | Rosa | Can you help me? | lle1-21 |
| 139 | 2 | 두 사람 | Sure. That sounds like fun. | lle1-21 |
| 139 | 2 | Rosa | Our guests will be here soon! | lle1-35 |
| 139 | 2 | Rosa | How are you these days? | lle1-29 |
| 139 | 2 | 두 사람 | I don't know. | lle1-21 |
| 139 | 2 | Rosa | This is going to be a very long day. | lle1-18 |
| 140 | 2 | Rosa | They arrive in 30 minutes! | lle1-35 |
| 140 | 2 | Rosa | Think of the team! | lle1-49 |
| 140 | 2 | 두 사람 | Got it! | lle1-49 |
| 141 | 3 | Ben | Is that everything you need? | lle1-30 |
| 141 | 3 | 두 사람 | Yes. | lle1-30 |
| 141 | 3 | Ben | Cash or credit? | lle1-30 |
| 141 | 3 | 두 사람 | Credit, please. | lle1-30 |
| 142 | 2 | Rosa | That is amazing! {A}, tell us more. | lle1-52 |
| 142 | 2 | 두 사람 | I have so much to tell you. | lle1-38 |
| 143 | 4 | A자리 | How are you these days? | lle1-29 |
| 143 | 4 | B자리 | I am tired. | lle1-29 |
| 143 | 4 | A자리 | That's too bad. | lle1-22 |
| 144 | 2 | 두 사람 | I have so much to tell you. | lle1-38 |
| 144 | 2 | Rosa | That is amazing! {B}, tell us more. | lle1-52 |
| 144 | 2 | Rosa | {B}, you made it work! | lle1-36 |
| 144 | 2 | Rosa | Well, thanks for your help. | lle1-30 |
| 145 | 1 | Malia | Nice to meet you! | lle1-02 |
| 145 | 3 | Ms. Evans | I have a new assignment for you! | lle1-19 |
| 145 | 3 | Ms. Evans | Can you help me? | lle1-21 |
| 145 | 3 | 두 사람 | Sure. That sounds like fun. | lle1-21 |
| 145 | 3 | Ms. Evans | Okay, let's try it! | lle1-22 |
| 146 | 2 | Tom | Can you help me? | lle1-21 |
| 146 | 2 | 두 사람 | Sure. | lle1-21 |
| 147 | 3 | Ms. Evans | Are you busy on Friday night? | lle1-17 |
| 147 | 3 | 두 사람 | I don't know. | lle1-21 |
| 147 | 3 | Ms. Evans | Will you be busy all day? | lle1-21 |
| 148 | 1 | Malia | What's wrong? | lle1-12 |
| 148 | 1 | 두 사람 | I am tired. Today was a busy day at work. And I still have work to do! | lle1-29 |
| 148 | 1 | Malia | That's too bad. | lle1-22 |
| 149 | 4 | A자리 | Hey, {B}, my friend is having a party on Saturday. Can you come with me? | lle1-21 |
| 149 | 4 | B자리 | Sorry, I can't come with you. | lle1-21 |
| 150 | 3 | Ms. Evans | Are you busy on Friday night? | lle1-17 |
| 150 | 3 | 두 사람 | I am sorry. | lle1-03 |
| 150 | 3 | 두 사람 | I'm busy. | lle1-17 |
| 150 | 3 | Ms. Evans | Of course. | lle1-19 |
| 151 | 1 | Malia | How are you two? | lle1-04 |
| 151 | 1 | 두 사람 | Can you help me? | lle1-21 |
| 151 | 1 | Malia | Sure! What do you need? | lle1-30 |
| 151 | 3 | 두 사람 | Can you help me? | lle1-21 |
| 151 | 3 | Ms. Evans | Excuse me? | lle1-03 |
| 151 | 3 | 두 사람 | Excuse me. Can you help me? | lle1-30 |
| 152 | 2 | Grace | But you learn a little more every day. | lle1-04 |
| 152 | 2 | Tom | {B}, do you have a pen? | lle1-04 |
| 152 | 2 | 두 사람 | Yes. I have a pen in my bag. | lle1-04 |
| 153 | 3 | 두 사람 | Excuse me. | lle1-30 |
| 153 | 3 | Ms. Evans | Are you ready? | lle1-18 |
| 153 | 3 | 두 사람 | Sorry. Let me try again. | lle1-18 |
| 154 | 2 | Tom | Really, {A}? Can you help me? | lle1-20 |
| 154 | 2 | 두 사람 | Yes, I can. Let me help. | lle1-20 |
| 155 | 4 | A자리 | So, what's wrong? | lle1-20 |
| 155 | 4 | B자리 | This is going to be a very long day. | lle1-18 |
| 155 | 4 | A자리 | I have an idea. | lle1-18 |
| 156 | 3 | 두 사람 | Excuse me. Can you help me? | lle1-30 |
| 156 | 3 | Ms. Evans | Yes, I can. Let me help. | lle1-20 |
| 157 | 1 | Malia | Hey, {B}, my friend is having a party on Saturday. Can you come with me? | lle1-21 |
| 157 | 1 | 두 사람 | Sorry, I can't come with you. | lle1-21 |
| 157 | 1 | Malia | Will you be busy all day? | lle1-21 |
| 157 | 1 | 두 사람 | I don't know. | lle1-21 |
| 157 | 1 | Malia | That's too bad. | lle1-22 |
| 158 | 3 | Ms. Evans | Are you ready? | lle1-18 |
| 158 | 3 | 두 사람 | Yes. | lle1-18 |
| 158 | 3 | Ms. Evans | Just be back by noon. | lle1-49 |
| 158 | 3 | 두 사람 | Of course. | lle1-19 |
| 159 | 2 | Tom | Are you busy this Thursday at 6pm? | lle1-17 |
| 159 | 2 | 두 사람 | I'm busy. | lle1-17 |
| 159 | 2 | Tom | How about on Wednesday night? | lle1-17 |
| 159 | 2 | 두 사람 | Wednesday night I am not busy. Oh, no, wait. This Wednesday night I will be busy. | lle1-17 |
| 160 | 3 | Ms. Evans | When you arrive, please come to my office. | lle1-19 |
| 160 | 3 | 두 사람 | Sorry, I can't hear you. | lle1-20 |
| 160 | 3 | Ms. Evans | When you arrive, please come to my office. I have important news to tell you. | lle1-19 |
| 160 | 3 | 두 사람 | Of course. | lle1-19 |
| 162 | 1 | Malia | Hey, {A}, my friend is having a party on Saturday. Can you come with me? | lle1-21 |
| 162 | 1 | 두 사람 | When? | lle1-17 |
| 162 | 1 | Malia | The party is at night. | lle1-21 |
| 162 | 1 | 두 사람 | Oh. Then I can come with you to the party on Saturday night. | lle1-21 |
| 162 | 1 | Malia | Great! | lle1-21 |
| 163 | 3 | Tom | Just the facts, {A}. | lle1-18 |
| 163 | 3 | 두 사람 | Right. | lle1-18 |
| 163 | 3 | Tom | You should be more careful. | lle1-25 |
| 163 | 3 | 두 사람 | Sorry! | lle1-25 |
| 164 | 2 | Malia | How are you these days? | lle1-29 |
| 164 | 2 | 두 사람 | In the morning, I painted for hours. In the afternoon, I cut wood. | lle1-27 |
| 164 | 2 | Tom | But I don't need to know all that. | lle1-27 |
| 166 | 3 | Tom | Not now! | lle1-28 |
| 166 | 3 | Tom | Look first! | lle1-28 |
| 166 | 3 | 두 사람 | Please don't yell at me! | lle1-28 |
| 166 | 3 | Tom | I'm sorry! | lle1-28 |
| 167 | 2 | Malia | Why? What happened? | lle1-28 |
| 167 | 2 | 두 사람 | It started fine. | lle1-28 |
| 167 | 2 | Malia | That sounds awful. | lle1-28 |
| 168 | 3 | Tom | Look first! | lle1-28 |
| 168 | 3 | 두 사람 | I know. | lle1-38 |
| 168 | 3 | 두 사람 | When something goes wrong with your plan, just change the plan! | lle1-36 |
| 168 | 3 | Tom | Good point. | lle1-29 |
| 168 | 3 | Tom | Okay, let's try it! | lle1-22 |
| 169 | 1 | Malia | Hi, {B}! Have a seat. | lle1-29 |
| 169 | 1 | 두 사람 | I have a plan. | lle1-36 |
| 169 | 1 | Malia | Why? | lle1-36 |
| 169 | 1 | 두 사람 | I don't know. | lle1-21 |
| 170 | 2 | Malia | How are you these days? | lle1-29 |
| 170 | 2 | 두 사람 | I am tired. Today was a busy day at work. And I still have work to do! | lle1-29 |
| 170 | 2 | Malia | I'm really busy too, {A}. Let's get to work. | lle1-29 |
| 171 | 3 | Ms. Evans | Sure! What do you need? | lle1-30 |
| 171 | 3 | 두 사람 | I have an idea. | lle1-29 |
| 171 | 3 | Ms. Evans | Why? | lle1-36 |
| 171 | 3 | 두 사람 | Working outdoors is nice. | lle1-29 |
| 174 | 3 | Ms. Evans | Sure! What do you need? | lle1-30 |
| 174 | 3 | 두 사람 | I have an idea. | lle1-29 |
| 174 | 3 | Ms. Evans | Why? | lle1-36 |
| 174 | 3 | 두 사람 | Most days of the week, people are really busy. But it's important to find time to be with your friends! | lle1-17 |
| 174 | 3 | Ms. Evans | Good idea. | lle1-39 |
| 174 | 3 | 두 사람 | Let's do it! | lle1-22 |
| 175 | 3 | Ms. Evans | Now, I have another very important mission for you. | lle1-49 |
| 175 | 3 | 두 사람 | No. | lle1-49 |
| 175 | 3 | Ms. Evans | Why not? What is wrong? | lle1-27 |
| 175 | 3 | 두 사람 | I don't know. | lle1-21 |
| 176 | 2 | Tom | Can you help me? | lle1-21 |
| 176 | 2 | 두 사람 | Excuse me, I have to go. | lle1-20 |
| 176 | 2 | Tom | Okay. | lle1-10 |
| 178 | 3 | Ms. Evans | Would you like to help us? | lle1-51 |
| 178 | 3 | 두 사람 | I'm sorry. | lle1-51 |
| 178 | 3 | Ms. Evans | Why not? What is wrong? | lle1-27 |
| 178 | 3 | 두 사람 | Today was a busy day at work. And I still have work to do! | lle1-29 |
| 179 | 3 | Mr. Ortiz | Excuse me. Can you help me? | lle1-30 |
| 179 | 3 | 두 사람 | Yes, I can. Let me help. | lle1-20 |
| 179 | 3 | Mr. Ortiz | Thanks, {B}. You know our neighborhood so well. | lle1-11 |
| 180 | 1 | Malia | Are you busy on Friday night? | lle1-17 |
| 180 | 1 | 두 사람 | I'm busy. | lle1-17 |
| 180 | 2 | Tom | Hey, {A}, my friend is having a party on Saturday. Can you come with me? | lle1-21 |
| 180 | 2 | 두 사람 | Sorry, I can't come with you. | lle1-21 |
| 180 | 3 | Ms. Evans | Would you like to help us? | lle1-51 |
| 180 | 3 | 두 사람 | I'm sorry. | lle1-51 |
| 180 | 3 | 두 사람 | Today was a busy day at work. And I still have work to do! | lle1-29 |
| 180 | 3 | Ms. Evans | I'm sorry to hear that. | lle1-27 |
| 181 | 3 | Ms. Evans | So, {B}, what's the plan for the show? | lle1-22 |
| 181 | 3 | 두 사람 | I have a plan. | lle1-36 |
| 181 | 3 | Ms. Evans | {B}, what do you mean? | lle1-27 |
| 182 | 2 | Malia | Hi, {B}. What's going on? | lle1-17 |
| 182 | 2 | 두 사람 | Not much. | lle1-17 |
| 182 | 2 | Malia | Busy as usual. | lle1-17 |
| 183 | 4 | A자리 | So, tell me about your job. | lle1-38 |
| 183 | 4 | B자리 | I love my work! | lle1-38 |
| 183 | 4 | A자리 | Really? | lle1-29 |
| 184 | 3 | Ms. Evans | So, {A}, what's the plan for the show? | lle1-22 |
| 184 | 3 | 두 사람 | I have a plan. | lle1-36 |
| 184 | 3 | Ms. Evans | Excuse me? | lle1-03 |
| 184 | 3 | 두 사람 | First, we're going to introduce the subject. | lle1-22 |
| 186 | 3 | Ms. Evans | So, {A}, what's the plan for the show? | lle1-22 |
| 186 | 3 | 두 사람 | First, we're going to introduce the subject. Then we can show pictures and video. | lle1-22 |
| 186 | 3 | Ms. Evans | Great idea! | lle1-22 |
| 187 | 2 | Tom | Hi, {A}! Hi, {B}! | lle1-04 |
| 187 | 2 | Tom | How are you two? | lle1-04 |
| 187 | 2 | 두 사람 | I am great! | lle1-04 |
| 187 | 2 | Malia | Let's get coffee! | lle1-04 |
| 188 | 2 | Malia | {A}, do you have a pen? | lle1-04 |
| 188 | 2 | 두 사람 | Yes. I have a pen in my bag. | lle1-04 |
| 190 | 2 | Tom | So, what's wrong? You look sad. | lle1-20 |
| 190 | 2 | 두 사람 | I am tired. | lle1-29 |
| 192 | 2 | Tom | Hi, {A}! Hi, {B}! | lle1-04 |
| 192 | 2 | Tom | What's going on? | lle1-17 |
| 192 | 2 | 두 사람 | Not much. | lle1-17 |
| 192 | 2 | 두 사람 | How about you? | lle1-17 |
| 192 | 2 | Malia | Busy as usual. | lle1-17 |
| 192 | 2 | 두 사람 | Let's get coffee! | lle1-04 |
| 192 | 2 | Malia | Sure, let's go! | lle1-21 |
| 192 | 2 | Tom | Yes! Let's go! | lle1-28 |
| 193 | 3 | Ms. Evans | I have a new assignment for you! | lle1-19 |
| 193 | 3 | 두 사람 | I can help with that. | lle1-48 |
| 193 | 3 | Tom | {B}, what do you mean? | lle1-27 |
| 193 | 3 | 두 사람 | Sorry. Let me try again. | lle1-40 |
| 193 | 3 | Malia | Let me help. | lle1-20 |
| 194 | 1 | 새 직원 | Can you help me? | lle1-20 |
| 194 | 1 | 두 사람 | Yes, I can. Let me help. | lle1-20 |
| 194 | 1 | 두 사람 | They're in your phone. See? | lle1-25 |
| 194 | 1 | 새 직원 | I see. | lle1-25 |
| 194 | 1 | 새 직원 | Got it. | lle1-25 |
| 195 | 2 | Grace | Yeah. But you learn a little more every day. | lle1-04 |
| 195 | 2 | 두 사람 | I have a plan. | lle1-36 |
| 195 | 2 | Grace | Okay, let's try it! | lle1-22 |
| 196 | 3 | 두 사람 | First, we're going to introduce the subject. Then we can show pictures and video. | lle1-22 |
| 196 | 3 | Tom | How is this going to help? | lle1-20 |
| 196 | 3 | 두 사람 | Sorry. Let me try again. | lle1-40 |
| 196 | 3 | Malia | I didn't know that. | lle1-26 |
| 197 | 4 | A자리 | I am a little nervous. | lle1-28 |
| 197 | 4 | B자리 | You don't need to be nervous. | lle1-28 |
| 197 | 4 | B자리 | Good luck! | lle1-25 |
| 198 | 3 | Ms. Evans | Are you ready? | lle1-18 |
| 198 | 3 | 두 사람 | I have a plan. | lle1-36 |
| 198 | 3 | 두 사람 | First, we're going to introduce the subject. Then we can show pictures and video. | lle1-22 |
| 198 | 3 | 두 사람 | Finally, we can read the questions and tell them where to learn more. | lle1-22 |
| 198 | 3 | Malia | I didn't know that. | lle1-26 |
| 198 | 3 | Ms. Evans | Good job! | lle1-33 |
| 199 | 2 | Tom | Why? What happened? | lle1-28 |
| 199 | 2 | 두 사람 | Well, yesterday I felt fine. | lle1-27 |
| 199 | 2 | 두 사람 | In the morning, I painted for hours. | lle1-27 |
| 199 | 2 | Tom | {B}, what do you mean? | lle1-27 |
| 199 | 2 | Tom | But I don't need to know all that. | lle1-27 |
| 200 | 1 | Malia | How are you these days? | lle1-29 |
| 200 | 1 | 두 사람 | Yesterday started like a usual work day. | lle1-24 |
| 200 | 1 | Malia | Really? | lle1-29 |
| 200 | 1 | 두 사람 | It started fine. | lle1-28 |
| 201 | 3 | 두 사람 | It started fine. | lle1-28 |
| 201 | 3 | Tom | Why? What happened? | lle1-28 |
| 201 | 3 | 두 사람 | Sorry, I can't hear you. | lle1-20 |
| 201 | 3 | Tom | But I don't need to know all that. | lle1-27 |
| 202 | 2 | Tom | What happened? | lle1-28 |
| 202 | 2 | 두 사람 | I did! But it was not easy. | lle1-28 |
| 202 | 2 | Malia | Really? | lle1-29 |
| 204 | 3 | Tom | What happened? | lle1-28 |
| 204 | 3 | 두 사람 | Yesterday started like a usual work day. | lle1-24 |
| 204 | 3 | Tom | {A}, what do you mean? | lle1-27 |
| 204 | 3 | 두 사람 | Yes, it did not go well. But, I practiced and passed the second time! | lle1-28 |
| 204 | 3 | Tom | Great. | lle1-28 |
| 205 | 3 | Ms. Evans | Our guests will be here soon! | lle1-35 |
| 205 | 3 | 두 사람 | What? | lle1-51 |
| 205 | 3 | 두 사람 | When do our guests arrive? | lle1-35 |
| 205 | 3 | Ms. Evans | They arrive in 30 minutes! | lle1-35 |
| 205 | 3 | 두 사람 | What are we going to do? | lle1-35 |
| 206 | 1 | Malia | Are you busy this Thursday at 6pm? | lle1-17 |
| 206 | 1 | 두 사람 | Wednesday night I am not busy. | lle1-17 |
| 206 | 1 | Malia | How about on Wednesday night? | lle1-17 |
| 206 | 1 | 두 사람 | Oh, no, wait. This Wednesday night I will be busy. | lle1-17 |
| 207 | 2 | Malia | What are we going to do? | lle1-35 |
| 207 | 2 | Grace | When something goes wrong with your plan, just change the plan! | lle1-36 |
| 207 | 2 | 두 사람 | I can fix this. | lle1-35 |
| 208 | 3 | Ms. Evans | Is something wrong? | lle1-39 |
| 208 | 3 | 두 사람 | Oh, no! This is not good. | lle1-39 |
| 208 | 3 | Malia | It's not what? | lle1-39 |
| 209 | 4 | A자리 | So, what's wrong? | lle1-20 |
| 209 | 4 | B자리 | I have an idea. | lle1-18 |
| 209 | 4 | A자리 | Good idea. | lle1-39 |
| 210 | 3 | Ms. Evans | Is something wrong? | lle1-39 |
| 210 | 3 | 두 사람 | When do our guests arrive? | lle1-35 |
| 210 | 3 | Ms. Evans | They arrive in 30 minutes! | lle1-35 |
| 210 | 3 | 두 사람 | I can fix this. | lle1-35 |
| 210 | 3 | 두 사람 | Okay. I got it. | lle1-18 |
| 210 | 3 | Ms. Evans | Good job! That was fast. | lle1-33 |
| 211 | 3 | Ms. Evans | Well, {B}, please share that news with us. | lle1-52 |
| 211 | 3 | 두 사람 | This is going to be a very long day. | lle1-18 |
| 211 | 3 | Ms. Evans | {B}, you are speaking too softly. | lle1-40 |
| 211 | 3 | Tom | Sorry, I can't hear you. | lle1-20 |
| 212 | 1 | Malia | {B}, tell us more. | lle1-52 |
| 212 | 1 | 두 사람 | I have so much to tell you. | lle1-38 |
| 212 | 1 | Malia | Yes, that is loud enough. | lle1-40 |
| 213 | 2 | 두 사람 | I am really nervous. | lle1-18 |
| 213 | 2 | Grace | You don't need to be nervous. | lle1-28 |
| 213 | 2 | Grace | I think big things are going to happen for you, {A}. | lle1-52 |
| 214 | 3 | Ms. Evans | How long have you been training? | lle1-51 |
| 214 | 3 | 두 사람 | I started today. | lle1-51 |
| 214 | 3 | Ms. Evans | {A}, training a little every day is a good habit to get into. Not all at once! | lle1-51 |
| 215 | 4 | A자리 | Are you ready? | lle1-18 |
| 215 | 4 | B자리 | This is going to be a very long day. | lle1-18 |
| 215 | 4 | A자리 | You don't need to be nervous. | lle1-28 |
| 216 | 3 | Ms. Evans | Well, {A}, please share that news with us. | lle1-52 |
| 216 | 3 | 두 사람 | I've just found my new goal. | lle1-51 |
| 216 | 3 | Ms. Evans | That is amazing! | lle1-52 |
| 216 | 3 | Tom | Good job! | lle1-33 |
| 216 | 3 | 두 사람 | We did it, {B}! | lle1-45 |
| 217 | 1 | 두 사람 | Excuse me! | lle1-03 |
| 217 | 1 | 산책하는 사람 | Hi! | lle1-34 |
| 217 | 2 | Grace | {B}, what's wrong? | lle1-34 |
| 217 | 2 | 두 사람 | This is hard. | lle1-34 |
| 218 | 3 | Ben | Hi! | lle1-34 |
| 218 | 3 | Mr. Kahale | What do you need? | lle1-34 |
| 218 | 3 | 두 사람 | Sure! First, what do you do? | lle1-34 |
| 219 | 2 | Grace | Of course you will go. | lle1-34 |
| 219 | 2 | Grace | Have fun, {A}! | lle1-34 |
| 220 | 1 | 두 사람 | Excuse me. | lle1-16 |
| 220 | 1 | 두 사람 | Do you have time for a couple of questions? | lle1-16 |
| 220 | 1 | 산책하는 사람 | Sure, I have time. | lle1-16 |
| 220 | 1 | 두 사람 | Thanks! | lle1-06 |
| 220 | 1 | 산책하는 사람 | You're welcome. | lle1-16 |
| 221 | 3 | Mr. Kahale | Sure, I have time. | lle1-16 |
| 221 | 3 | Mr. Kahale | What is your name and where are you from? | lle1-16 |
| 222 | 1 | 두 사람 | Hello! | lle1-16 |
| 222 | 1 | 두 사람 | Do you have time for a couple of questions? | lle1-16 |
| 222 | 1 | 산책하는 사람 | Sure! | lle1-16 |
| 222 | 1 | 두 사람 | What languages do you speak? | lle1-16 |
| 222 | 1 | 산책하는 사람 | I speak Chinese and English. | lle1-16 |
| 222 | 1 | 두 사람 | Thanks! | lle1-06 |
| 222 | 1 | 산책하는 사람 | You're welcome. | lle1-16 |
| 223 | 2 | Mr. Lee | Hi {B}, how are you? | lle1-15 |
| 223 | 2 | 두 사람 | I'm doing great! | lle1-15 |
| 223 | 2 | Mr. Lee | It's a beautiful day, isn't it? | lle1-15 |
| 223 | 2 | 두 사람 | It is. | lle1-15 |
| 224 | 3 | Ben | {B}, today the weather is beautiful, isn't it? | lle1-15 |
| 224 | 3 | 두 사람 | It is. | lle1-15 |
| 224 | 3 | Ben | Let's people-watch a little more. | lle1-15 |
| 225 | 2 | Mrs. Lee | Come and join us! | lle1-15 |
| 225 | 2 | Mrs. Lee | No need to hurry. | lle1-15 |
| 225 | 2 | 두 사람 | Sure! | lle1-15 |
| 225 | 2 | Mrs. Lee | Let's sit! | lle1-15 |
| 226 | 2 | Mrs. Lee | Come in. | lle1-07 |
| 226 | 2 | Mrs. Lee | Well, {A}, welcome. | lle1-07 |
| 226 | 2 | 두 사람 | Thank you. | lle1-07 |
| 226 | 2 | Mrs. Lee | Are you excited? | lle1-07 |
| 226 | 2 | 두 사람 | Yes, I am excited! | lle1-07 |
| 227 | 3 | 두 사람 | Hi there! I'm {A}. | lle1-07 |
| 227 | 3 | Mr. Kahale | Nice to meet you! | lle1-07 |
| 227 | 3 | 두 사람 | What are you doing? | lle1-07 |
| 228 | 2 | Mr. Lee | Hi {A}, how are you? | lle1-15 |
| 228 | 2 | 두 사람 | I'm doing great! | lle1-15 |
| 228 | 2 | 두 사람 | It's a beautiful day, isn't it? | lle1-15 |
| 228 | 2 | Mr. Lee | Yes, it is. | lle1-15 |
| 228 | 2 | 두 사람 | What are you doing? | lle1-07 |
| 228 | 2 | Mr. Lee | I love people-watching too! | lle1-15 |
| 228 | 2 | Mrs. Lee | Come and join us! | lle1-15 |
| 228 | 2 | 두 사람 | Thank you. | lle1-07 |
| 229 | 4 | 두 사람 | Excuse me. Can you help me? | lle1-30 |
| 229 | 4 | Sarah | So sorry, but I am busy. | lle1-07 |
| 229 | 4 | Sarah | Okay, I'll be back in 15 minutes. | lle1-23 |
| 229 | 4 | 두 사람 | This day is not going well. | lle1-07 |
| 230 | 2 | Mrs. Lee | Is your rent expensive? | lle1-38 |
| 230 | 2 | 두 사람 | Well, I have a roommate. So, we split the rent. | lle1-38 |
| 230 | 2 | Mrs. Lee | Remember, {B}. Be careful! | lle1-34 |
| 231 | 4 | Sarah | And it does not cost a lot. | lle1-23 |
| 231 | 4 | 두 사람 | Really? | lle1-29 |
| 231 | 4 | 두 사람 | What are we going to do? | lle1-35 |
| 232 | 4 | 두 사람 | Are you busy? | lle1-08 |
| 232 | 4 | Sarah | Yes, I'm busy. | lle1-08 |
| 232 | 4 | 두 사람 | Okay. See you later, maybe. | lle1-08 |
| 232 | 4 | Sarah | Maybe I'll see you later. | lle1-08 |
| 233 | 4 | 두 사람 | Wait a minute. Are you busy now? | lle1-17 |
| 233 | 4 | Sarah | I'm a little busy. | lle1-08 |
| 233 | 4 | Sarah | Come by this afternoon. | lle1-08 |
| 234 | 4 | Sarah | Come in. | lle1-08 |
| 234 | 4 | 두 사람 | I want to say I'm sorry for yesterday. | lle1-08 |
| 234 | 4 | Sarah | It's okay, {A}. | lle1-08 |
| 234 | 4 | 두 사람 | Excuse me. Can you help me? | lle1-30 |
| 234 | 4 | Sarah | I can fix this. | lle1-35 |
| 234 | 4 | Sarah | And it does not cost a lot. | lle1-23 |
| 234 | 4 | 두 사람 | Thank you. | lle1-07 |
| 235 | 3 | Mr. Kahale | Do you want to talk about it? | lle1-12 |
| 235 | 3 | 두 사람 | I don't know. | lle1-21 |
| 235 | 3 | Ben | Are you okay, {B}? | lle1-51 |
| 236 | 2 | Mr. Lee | Why? What happened? | lle1-28 |
| 236 | 2 | 두 사람 | It started fine. | lle1-28 |
| 238 | 3 | 두 사람 | Hello, everyone. | lle1-32 |
| 238 | 3 | 두 사람 | Oh well. | lle1-32 |
| 238 | 3 | Mr. Kahale | Why? What happened? | lle1-28 |
| 239 | 2 | Grace | Let's try again. | lle1-32 |
| 239 | 2 | 두 사람 | First, we're going to introduce the subject. | lle1-22 |
| 239 | 2 | Grace | That is right, {A}. | lle1-32 |
| 240 | 3 | 두 사람 | Hello, everyone. I'm {A}, and thanks for coming! | lle1-32 |
| 240 | 3 | 두 사람 | It started fine. | lle1-28 |
| 240 | 3 | 두 사람 | First, we're going to introduce the subject. Then we can show pictures and video. | lle1-22 |
| 240 | 3 | 두 사람 | Thanks for listening. | lle1-12 |
| 240 | 3 | Mr. Kahale | Well, thank you for sharing your news and so much more with us, {A}. | lle1-52 |
| 241 | 2 | Mr. Lee | I'm thinking about my family. | lle1-12 |
| 241 | 2 | 두 사람 | Do you want to talk about it? | lle1-12 |
| 241 | 2 | Mr. Lee | Sure! I have some photos. | lle1-12 |
| 241 | 2 | 두 사람 | Who are they? | lle1-12 |
| 241 | 2 | Mr. Lee | This is my mother and this is my father. | lle1-12 |
| 242 | 2 | Mr. Lee | I have so much to tell you. | lle1-38 |
| 242 | 2 | Mr. Lee | At first it was hard. | lle1-38 |
| 242 | 2 | Mrs. Lee | And it's good to remember them. | lle1-29 |
| 244 | 2 | Mr. Lee | This is a family tree. | lle1-12 |
| 244 | 2 | 두 사람 | Who are they? | lle1-12 |
| 244 | 2 | 두 사람 | When I first came here, I felt lost ... all the time. | lle1-37 |
| 244 | 2 | Mr. Lee | Our hometown isn't the same now. | lle1-38 |
| 245 | 2 | Mr. Lee | Our hometown isn't the same now. | lle1-38 |
| 245 | 2 | 두 사람 | Are you okay? | lle1-37 |
| 245 | 2 | Mr. Lee | I'm thinking about my family. | lle1-12 |
| 246 | 2 | Mr. Lee | I have some photos. | lle1-12 |
| 246 | 2 | Mr. Lee | This is what happened. | lle1-52 |
| 246 | 2 | 두 사람 | They make history come alive! | lle1-16 |
| 246 | 2 | 두 사람 | I'm sure your family is very proud. | lle1-52 |
| 246 | 2 | Mr. Lee | Thanks for listening. | lle1-12 |
| 247 | 3 | Mr. Kahale | Hello, everyone. | lle1-32 |
| 247 | 3 | Mr. Kahale | Well, {B}, please share that news with us. | lle1-52 |
| 247 | 3 | 두 사람 | Hello, everyone. | lle1-32 |
| 247 | 3 | 두 사람 | I don't know. | lle1-21 |
| 247 | 3 | Mr. Kahale | Please don't worry. | lle1-41 |
| 248 | 3 | Mr. Kahale | Tell us your name. | lle1-42 |
| 248 | 3 | Mr. Kahale | So, what happened next? | lle1-42 |
| 248 | 3 | 두 사람 | Then what happened? | lle1-42 |
| 250 | 3 | 두 사람 | Excuse me. Can you help me? | lle1-30 |
| 250 | 3 | Ben | {A}, I can't. I'm too busy. | lle1-43 |
| 250 | 3 | 두 사람 | That's okay. | lle1-43 |
| 250 | 3 | Ben | I do wish I could help. | lle1-43 |
| 251 | 3 | Mr. Kahale | Please don't worry. | lle1-41 |
| 251 | 3 | Mr. Kahale | Here's the plan. | lle1-41 |
| 251 | 3 | 두 사람 | Thanks! | lle1-43 |
| 252 | 3 | Mr. Kahale | Hello, everyone. | lle1-32 |
| 252 | 3 | 두 사람 | Hello, everyone. I'm {A}, and thanks for coming! | lle1-32 |
| 252 | 3 | 두 사람 | First, we're going to introduce the subject. Then we can show pictures and video. | lle1-22 |
| 252 | 3 | Mr. Kahale | Good job, team. | lle1-41 |
| 252 | 3 | 두 사람 | Let's get to work! | lle1-41 |
| 253 | 3 | 두 사람 | Hello, everyone. I'm {B}, and thanks for coming! | lle1-32 |
| 253 | 3 | 두 사람 | I don't remember the name. | lle1-51 |
| 253 | 3 | Ben | Are you okay, {B}? | lle1-51 |
| 253 | 3 | 두 사람 | This is hard. | lle1-34 |
| 254 | 3 | Mr. Kahale | I know what you two need! | lle1-44 |
| 254 | 3 | Mr. Kahale | When something goes wrong with your plan, just change the plan! | lle1-36 |
| 254 | 3 | 두 사람 | Good idea. | lle1-31 |
| 256 | 3 | Ben | Don't be nervous. Just pay attention and do your best! | lle1-50 |
| 256 | 3 | 두 사람 | That is great advice. | lle1-50 |
| 256 | 3 | 두 사람 | But sometimes I still feel like I don't understand. | lle1-50 |
| 257 | 3 | 두 사람 | I don't remember the name. | lle1-51 |
| 257 | 3 | 두 사람 | Sorry. Let me try again. | lle1-40 |
| 257 | 3 | Mr. Kahale | But don't worry. | lle1-50 |
| 258 | 3 | 두 사람 | Hello, everyone. I'm {A}, and thanks for coming! | lle1-32 |
| 258 | 3 | 두 사람 | Oh, no! | lle1-50 |
| 258 | 3 | 두 사람 | Sorry. Let me try again. | lle1-40 |
| 258 | 3 | Mr. Kahale | That is amazing! | lle1-52 |
| 259 | 2 | Grace | We are celebrating at 7pm tonight. Did you forget? | lle1-46 |
| 259 | 2 | 두 사람 | What is happening tonight? | lle1-46 |
| 259 | 2 | Grace | Don't forget! | lle1-46 |
| 259 | 3 | Ben | Is something wrong? | lle1-39 |
| 259 | 3 | 두 사람 | I forgot about that! | lle1-38 |
| 260 | 2 | 두 사람 | Do you have pen and paper I can borrow? | lle1-46 |
| 260 | 2 | Mrs. Lee | Of course. | lle1-46 |
| 260 | 3 | 두 사람 | Can I borrow your scissors? Sorry to bother you. | lle1-46 |
| 260 | 3 | Ben | Yes, I can lend them to you, but you must return them. | lle1-46 |
| 260 | 3 | 두 사람 | And I'll bring them back tomorrow. | lle1-46 |
| 260 | 3 | Ben | Good. | lle1-46 |
| 261 | 2 | 두 사람 | Many people loaned or shared their supplies with me. | lle1-46 |
| 261 | 2 | Grace | Sometimes all the money in the world can't buy the perfect gift. | lle1-46 |
| 261 | 2 | 두 사람 | That is great advice. | lle1-50 |
| 262 | 3 | 두 사람 | How can I help? I was planning to visit some friends. But if you need help, I can help. | lle1-47 |
| 262 | 3 | Mr. Kahale | Great! But we need teamwork. | lle1-47 |
| 262 | 3 | 두 사람 | Okay. | lle1-47 |
| 263 | 2 | 두 사람 | New friends are good. But old friends are the best. | lle1-38 |
| 263 | 2 | Daniel | Okay, well, good luck, {A}! | lle1-51 |
| 263 | 2 | 두 사람 | Are you busy on Friday night? | lle1-17 |
| 263 | 2 | Daniel | How about on Wednesday night? | lle1-17 |
| 263 | 2 | 두 사람 | Wednesday night I am not busy. Oh, no, wait. This Wednesday night I will be busy. | lle1-17 |
| 263 | 2 | Daniel | Okay. See you soon! | lle1-10 |
| 264 | 3 | 두 사람 | I can go on vacation next summer. | lle1-22 |
| 264 | 3 | 두 사람 | You can trust me. | lle1-47 |
| 264 | 3 | Mr. Kahale | That's a great idea! | lle1-37 |
| 264 | 3 | Ben | Good luck! | lle1-34 |
| 264 | 3 | Daniel | See you, {B}! | lle1-06 |
| 265 | 2 | 두 사람 | Come by this afternoon. | lle1-08 |
| 265 | 2 | Mrs. Lee | Excuse me? | lle1-03 |
| 265 | 2 | 두 사람 | Sorry. | lle1-07 |
| 265 | 2 | Mrs. Lee | I might go. I might not go. | lle1-34 |
| 266 | 4 | Sarah | Hi, {A}! What do you need? | lle1-34 |
| 266 | 4 | 두 사람 | Come in. | lle1-07 |
| 266 | 4 | Sarah | Thank you. | lle1-07 |
| 266 | 4 | 두 사람 | Well, have a seat! | lle1-15 |
| 266 | 4 | Sarah | Okay. | lle1-34 |
| 267 | 2 | 두 사람 | Are you going? | lle1-34 |
| 267 | 2 | Mr. Lee | I might. | lle1-34 |
| 267 | 2 | 두 사람 | Okay. | lle1-34 |
| 268 | 2 | 두 사람 | Do you have time for a couple of questions? | lle1-16 |
| 268 | 2 | Mr. Lee | Sure, I have time. | lle1-16 |
| 268 | 2 | 두 사람 | Who are they? | lle1-12 |
| 268 | 2 | Mr. Lee | This is my mother and this is my father. | lle1-12 |
| 268 | 2 | 두 사람 | Thanks for showing me your family photos. | lle1-12 |
| 270 | 2 | 두 사람 | I love having my friends over. Come on! | lle1-10 |
| 270 | 2 | Grace | Great! | lle1-10 |
| 270 | 2 | 두 사람 | Come by this afternoon. | lle1-08 |
| 270 | 2 | Mrs. Lee | Sure! | lle1-16 |
| 270 | 4 | 두 사람 | Come in. | lle1-07 |
| 270 | 4 | Sarah | Thank you. | lle1-07 |
| 270 | 4 | Sarah | Thanks. This was a good idea. | lle1-29 |
| 271 | 4 | Sarah | Is something wrong? | lle1-39 |
| 271 | 4 | 두 사람 | It's not starting! | lle1-47 |
| 271 | 4 | Sarah | Then what happened? | lle1-42 |
| 271 | 4 | 두 사람 | This is hard. | lle1-34 |
| 272 | 2 | Mr. Lee | So, what happened next? | lle1-42 |
| 272 | 2 | 두 사람 | Sorry. Let me try again. | lle1-18 |
| 272 | 2 | Mr. Lee | Okay. | lle1-34 |
| 273 | 4 | Sarah | I can fix this. Do you trust me? | lle1-35 |
| 273 | 4 | 두 사람 | Yes. | lle1-35 |
| 273 | 4 | 두 사람 | This is wrong! | lle1-39 |
| 273 | 4 | Sarah | What's wrong? | lle1-47 |
| 274 | 2 | Grace | We don't have to agree with people. They have their opinions. We have ours. | lle1-37 |
| 274 | 4 | Sarah | I disagree. | lle1-37 |
| 274 | 4 | 두 사람 | That's a good point. | lle1-37 |
| 275 | 2 | Grace | When something goes wrong with your plan, just change the plan! | lle1-36 |
| 275 | 2 | 두 사람 | I have an idea. | lle1-37 |
| 275 | 3 | 두 사람 | Come by this afternoon. | lle1-08 |
| 275 | 3 | Mr. Kahale | So sorry, but I am busy. | lle1-07 |
| 275 | 3 | Ben | Is that what she wants? | lle1-41 |
| 275 | 3 | 두 사람 | I don't know. | lle1-21 |
| 276 | 4 | Sarah | Is something wrong? | lle1-39 |
| 276 | 4 | 두 사람 | Sorry. Let me try again. | lle1-18 |
| 276 | 4 | 두 사람 | It's not starting! | lle1-47 |
| 276 | 4 | Sarah | I can fix this. | lle1-35 |
| 276 | 4 | 두 사람 | Thank you. | lle1-07 |
| 277 | 3 | 두 사람 | Am I late? | lle1-50 |
| 277 | 3 | Mr. Kahale | You're a little late. But don't worry. | lle1-50 |
| 277 | 3 | Mr. Kahale | Everyone has to bring something or do something. You can bring food, or you can perform. | lle1-21 |
| 277 | 3 | 두 사람 | I don't know. | lle1-21 |
| 278 | 3 | Ben | {B}, you should go a lot earlier than 7 o'clock. | lle1-31 |
| 278 | 3 | 두 사람 | Good point. | lle1-31 |
| 278 | 3 | Mr. Kahale | Being early is better than being late. | lle1-31 |
| 279 | 2 | 두 사람 | This is hard. | lle1-34 |
| 279 | 2 | Grace | {B}, training a little every day is a good habit to get into. Not all at once! | lle1-51 |
| 279 | 2 | 두 사람 | That is great advice. | lle1-50 |
| 280 | 3 | Mr. Kahale | Okay, team. | lle1-41 |
| 280 | 3 | Mr. Kahale | Here's the plan. | lle1-41 |
| 280 | 3 | Ben | Are you sure? | lle1-41 |
| 280 | 3 | 두 사람 | Let's get to work! | lle1-41 |
| 281 | 2 | Grace | Everyone has different skills. You have skills. I have skills. The important thing is to know what you are good at. | lle1-19 |
| 281 | 2 | 두 사람 | I'm still learning. But it is fun! | lle1-17 |
| 281 | 2 | Grace | Have fun, {A}! | lle1-34 |
| 282 | 3 | 두 사람 | Being early is better than being late. | lle1-31 |
| 282 | 3 | 두 사람 | Most days of the week, people are really busy. But it's important to find time to be with your friends! | lle1-17 |
| 282 | 3 | 두 사람 | We don't have to agree with people. They have their opinions. We have ours. | lle1-37 |
| 282 | 3 | 두 사람 | When something goes wrong with your plan, just change the plan! | lle1-36 |
| 282 | 3 | Mr. Kahale | Good job, team. | lle1-41 |
| 282 | 3 | Ben | That's a great idea! | lle1-37 |
| 283 | 2 | 두 사람 | Come and join us! | lle1-15 |
| 283 | 2 | Mrs. Lee | What is happening tonight? | lle1-46 |
| 283 | 2 | 두 사람 | Oh, dear. | lle1-32 |
| 283 | 3 | Mr. Kahale | Who wants to give their talk first? | lle1-50 |
| 283 | 3 | 두 사람 | Who me? | lle1-50 |
| 284 | 3 | 두 사람 | Come and join us! | lle1-15 |
| 284 | 3 | Ben | Sure. That sounds like fun. | lle1-21 |
| 284 | 3 | Mr. Kahale | Great! | lle1-10 |
| 285 | 4 | 두 사람 | Hello, everyone. I'm {A}, and thanks for coming! | lle1-32 |
| 285 | 4 | 두 사람 | Oh, dear. | lle1-32 |
| 285 | 4 | Sarah | Please don't worry. | lle1-41 |
| 286 | 2 | 두 사람 | I am a little nervous. | lle1-28 |
| 286 | 2 | Grace | Don't be nervous. Just pay attention and do your best! | lle1-50 |
| 286 | 2 | 두 사람 | That is great advice. You know, I have been paying attention. But sometimes I still feel like I don't understand. | lle1-50 |
| 287 | 4 | 두 사람 | Our guests will be here soon! | lle1-35 |
| 287 | 4 | Sarah | Can I help? I'm not busy right now. | lle1-21 |
| 287 | 4 | 두 사람 | Thank you. | lle1-07 |
| 288 | 4 | Daniel | {A}, hi! Remember me? | lle1-07 |
| 288 | 4 | 두 사람 | Hi there! | lle1-01 |
| 288 | 4 | Daniel | Hi! Are you {B}? | lle1-01 |
| 288 | 4 | 두 사람 | Yes! | lle1-01 |
| 288 | 4 | Lena | {A}, here's your coffee. | lle1-12 |
| 288 | 4 | Mr. Ortiz | Thanks, {B}. You know our neighborhood so well. | lle1-11 |
| 288 | 4 | Dr. Patel | It is really good to talk to you. | lle1-38 |
| 288 | 4 | Mrs. Tanaka | Yes, that is loud enough. | lle1-40 |
| 288 | 4 | Rosa | {B}, you made it work! | lle1-36 |
| 288 | 4 | Ben | {A}! I am really happy to see you! | lle1-38 |
| 288 | 4 | Ms. Evans | Good job! | lle1-33 |
| 288 | 4 | Tom | But I don't need to know all that. | lle1-27 |
| 288 | 4 | Malia | Your friends sound great! | lle1-38 |
| 288 | 4 | A자리 | Hello, everyone. I'm {A}, and thanks for coming! | lle1-32 |
| 288 | 4 | A자리 | Looking back over the past year, I've done so many amazing things! I have met people from all over the world. I've made many good friends. | lle1-52 |
| 288 | 4 | B자리 | Hello, everyone. I'm {B}, and thanks for coming! | lle1-32 |
| 288 | 4 | B자리 | I had to make a change. So, I took some chances. Sometimes I succeeded. Sometimes I failed. But I will never stop trying. | lle1-52 |
| 288 | 4 | Mr. Lee | I'm sure your family is very proud. | lle1-52 |
| 288 | 4 | Mrs. Lee | Let's sit! | lle1-15 |
| 288 | 4 | Grace | I think big things are going to happen for you, {B}. | lle1-52 |
| 288 | 4 | Mr. Kahale | Good job, team. | lle1-41 |
| 288 | 4 | Sarah | Thank you. Thank you so much for having me here. | lle1-52 |

1주차는 이름이 고비다 (world.md 5.1). 1일에 프런트에서 `{A}` 가 철자를 못 맞추고, 2일에 카페에서 `{B}` 가 철자를 대고,
3일에 편의점에서 처음 인사를 주고받는다. 4~6일은 5과가 들어와 Daniel 이 방을 보여 주고(town.md 5.2 손님), 6일에 두 사람이 서로를 찾으며 방 이름을 말한다.

48주 6일(288세션)이 피날레다. 손님 표의 열넷이 차례로 와서 각자 1년 동안 한 자기 줄을 하나씩 한다.
Daniel 이 1일차 그 줄 "Hi! Are you {B}?" 로 돌아오고 이번에는 철자를 틀리지 않는다. A자리와 B자리가 차례로 인사말을 하고 2.2 의 줄을 여기서 처음 한다.
사진첩 마지막 장은 1일차 프런트 사진과 로비 벽의 항구 사진이다. 음악은 1931년 이전에 나온 가벼운 곡이나 CC0 곡으로 닫는다. **"Aloha ʻOe" 로 닫지 않는다** (sources.md 3.4).

## 4. 기계가 안 보는 것

**그 장면에서 두 사람이 웃는가.** 셈은 대사가 들은 녹음에서 왔는지까지만 본다.
