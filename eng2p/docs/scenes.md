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
| 블록의 장소 | game.md 4장 |
| 장소에 있는 사람 | town.md 5장 |
| 그날 강, 세트, 카드, 녹음, 판 | sessions.json |
| 날의 자리 | 1일은 열기, 2~5일은 다시 오기, 6일은 풀기 |

| 날 | 무엇이 일어나나 |
|---|---|
| 열기 (1일) | 고비가 처음 나타난다. 두 사람은 아직 못 푼다. 그것이 정상이다 |
| 다시 오기 (2~5일) | 같은 고비가 다른 얼굴로 온다. 그날 카드와 판이 그 고비의 연습이다 |
| 풀기 (6일) | 두 사람이 영어로 고비를 푼다. 그 주 과제집이 그날 저녁 일기가 된다 |

카드는 블록 3 의 장소에서 그곳 사람이 낸다. 카드 유형이 장면 갈래가 된다 (game.md 5장).
**판정형 카드의 답은 장면에 안 싣는다.** 게임이 카드 자료에서 쥐고 판단한다 (기준서 13.2).

## 2. 대사의 규칙

**NPC 는 두 사람이 이미 들은 실제 녹음의 줄만 말한다.** 영어를 새로 짓지 않는다 (1번 규칙).

| 규칙 | 무엇 |
|---|---|
| 근거 | 줄마다 대본 이름(`lle1-NN`)을 단다. 그 대본 한 사람의 말 안에서 **이어진 문장 그대로**여야 한다 |
| 들은 것만 | 그 세션까지 블록 1 에서 이미 나온 대본이어야 한다. 아직 안 들은 과의 줄은 안 쓴다 |
| 이름만 바꾼다 | 대본의 사람 이름 자리에 `{A}` `{B}` 를 쓴다. 두 사람이 지은 캐릭터 이름이 들어간다 (world.md 2장) |
| 철자 | `{A철자}` 는 이름을 글자마다 끊어 부른 것이다. `{A틀린철자}` 는 게임이 글자 하나를 빼거나 겹친 것이다 |
| 두 사람의 줄 | 인물 칸이 `두 사람` 이면 NPC 가 기다리는 말이다. 기계가 넉넉하게 듣는다 (game.md 6장). 둘 중 누가 말해도 된다 |
| 표시 | NPC 목소리는 TTS 다. 1층 대화 표기를 단다 (기준서 13.2) |

**주마다 장면이 있는 세션이 넷 이상이어야 한다** (`derive_scenes.py` 가 건다).
3~48주 대사는 에이전트 여덟이 주 범위를 나눠 쓰고 각자 이 검사를 통과시킨 것을 합쳤다 (2026-10-07). 상표 검사가 Scrabble 두 줄을 잡아 고쳤다.

**장면 대사가 없는 세션도 있다.** 대사는 화의 고비에만 쓴다. 나머지는 카드와 판이 말을 만든다.
대사가 없는 세션에서 NPC 는 몸짓과 표정으로만 맞는다.

## 3. 대사

| 세션 | 블록 | 인물 | 줄 | 근거 |
|---|---|---|---|---|
| 1 | 1 | Daniel | Hi! Are you {A}? | lle1-01 |
| 1 | 1 | 두 사람 | Yes! Hi there! Are you {B}? | lle1-01 |
| 1 | 1 | Daniel | Nice to meet you. | lle1-01 |
| 1 | 1 | Daniel | "{A}" Is that {A틀린철자}? | lle1-01 |
| 1 | 1 | 두 사람 | No. {A철자} | lle1-01 |
| 1 | 1 | Daniel | Let's try that again. | lle1-01 |
| 2 | 2 | Lena | Hi! Are you {B}? | lle1-01 |
| 2 | 2 | 두 사람 | Yes! | lle1-01 |
| 2 | 2 | Lena | Nice to meet you. | lle1-01 |
| 3 | 3 | Mr. Ortiz | Nice to meet you. | lle1-01 |
| 3 | 3 | 두 사람 | Nice to meet you. | lle1-01 |
| 4 | 4 | Daniel | Here we are! | lle1-05 |
| 4 | 4 | Daniel | We cook in the kitchen. | lle1-05 |
| 4 | 4 | Daniel | We relax in the living room. | lle1-05 |
| 4 | 4 | Daniel | We sleep in the bedroom. | lle1-05 |
| 5 | 4 | 두 사람 | I eat in the kitchen. | lle1-05 |
| 5 | 4 | 두 사람 | I relax in the living room. | lle1-05 |
| 6 | 4 | 두 사람 | Where are you? | lle1-05 |
| 6 | 4 | 두 사람 | I am in the bedroom. | lle1-05 |
| 6 | 4 | 두 사람 | I wash in the bathroom. | lle1-05 |
| 7 | 2 | Lena | Oh, hi, {A}. How's it going? | lle1-06 |
| 8 | 2 | Lena | How's it going? | lle1-06 |
| 8 | 2 | 두 사람 | It's going great. | lle1-06 |
| 9 | 1 | 두 사람 | Where is the gym? | lle1-06 |
| 9 | 1 | Daniel | The gym is across from the lounge. It's next to the mailroom. Go that way. | lle1-06 |
| 9 | 1 | Daniel | No, {A}! Not that way! Go that way! | lle1-06 |
| 9 | 1 | 두 사람 | Across from the lounge. Right. Thanks! | lle1-06 |
| 10 | 2 | 두 사람 | Is it windy today? | lle1-09 |
| 10 | 2 | Lena | No, it is not windy today. | lle1-09 |
| 11 | 3 | 두 사람 | Is it sunny today? | lle1-09 |
| 11 | 3 | Mr. Ortiz | Yes, {A}. It is sunny. | lle1-09 |
| 12 | 2 | Lena | How's it going? | lle1-06 |
| 12 | 2 | 두 사람 | It's going great. How's it going with you? | lle1-06 |
| 12 | 4 | 두 사람 | See you. | lle1-06 |
| 12 | 4 | Daniel | See you, {A}! | lle1-06 |
| 13 | 1 | Daniel | Then at the bus station turn left. Then walk straight ahead. | lle1-10 |
| 13 | 1 | 두 사람 | Thanks! | lle1-06 |
| 13 | 1 | Daniel | No, {A}! Not that way! Go that way! | lle1-06 |
| 13 | 3 | 두 사람 | My apartment is near a coffee shop. | lle1-10 |
| 13 | 3 | Mr. Ortiz | {A}, Which coffee shop? There are three coffee shops. | lle1-10 |
| 14 | 2 | 두 사람 | Where is the gym? | lle1-06 |
| 14 | 2 | Lena | The gym is across from the lounge. It's next to the mailroom. Go that way. | lle1-06 |
| 14 | 2 | 두 사람 | The gym is across from … what? | lle1-06 |
| 14 | 2 | Lena | The gym is across from the lounge. | lle1-06 |
| 14 | 2 | 두 사람 | Across from the lounge. Right. Thanks! | lle1-06 |
| 15 | 1 | 두 사람 | This is not the gym. | lle1-06 |
| 15 | 1 | Daniel | That's right, {A}. This is the mailroom. | lle1-06 |
| 15 | 1 | Daniel | The gym is across from the lounge. It is behind the lobby. | lle1-06 |
| 15 | 1 | 두 사람 | Right. Right. See you. | lle1-06 |
| 15 | 1 | Daniel | See you, {A}! | lle1-06 |
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
| 19 | 2 | Lena | {A}, here's your coffee. | lle1-12 |
| 19 | 2 | 두 사람 | Thanks! | lle1-06 |
| 19 | 2 | Lena | What's wrong? | lle1-12 |
| 19 | 2 | 두 사람 | I'm thinking about my family. I'm feeling homesick. | lle1-12 |
| 19 | 2 | Lena | Do you want to talk about it? | lle1-12 |
| 20 | 1 | Daniel | Oh, hi, {A}. How's it going? | lle1-06 |
| 20 | 1 | 두 사람 | It's going great. How's it going with you? | lle1-06 |
| 20 | 1 | 두 사람 | {B}, I want to work out. | lle1-06 |
| 20 | 1 | Daniel | I want to work out too! Join me! | lle1-06 |
| 20 | 1 | 두 사람 | I'm good. | lle1-06 |
| 21 | 2 | Grace | What's wrong? | lle1-12 |
| 21 | 2 | 두 사람 | I'm feeling homesick. | lle1-12 |
| 21 | 2 | Grace | Do you want to talk about it? | lle1-12 |
| 21 | 2 | 두 사람 | Sure! | lle1-12 |
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
| 30 | 3 | Mr. Ortiz | Hi, {A}. What's going on? | lle1-17 |
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
| 32 | 1 | Daniel | Now, {A}, remember. | lle1-18 |
| 32 | 1 | Daniel | Stop! {A}, you are doing it again. | lle1-18 |
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
| 35 | 1 | Daniel | Now, {A}, remember. | lle1-18 |
| 36 | 1 | Daniel | Now, {A}, remember. | lle1-18 |
| 36 | 1 | 두 사람 | Okay. I got it. | lle1-18 |
| 36 | 1 | Daniel | Are you ready? | lle1-18 |
| 36 | 1 | 두 사람 | Yes. | lle1-18 |
| 36 | 1 | Daniel | That's right! Now you've got it! | lle1-18 |
| 37 | 2 | Lena | Hi, {A}. What's going on? | lle1-17 |
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
| 46 | 1 | 두 사람 | Is it windy today? | lle1-09 |
| 46 | 1 | Daniel | No, it is not windy today. | lle1-09 |
| 46 | 1 | 두 사람 | Is it sunny today? | lle1-09 |
| 46 | 1 | Daniel | Yes, {A}. It is sunny. | lle1-09 |
| 48 | 1 | Daniel | What's wrong? | lle1-12 |
| 48 | 1 | 두 사람 | I am really nervous. | lle1-18 |
| 48 | 1 | Daniel | Do you want to talk about it? | lle1-12 |
| 48 | 1 | 두 사람 | Sure! | lle1-12 |
| 48 | 1 | 두 사람 | I do feel better. Thanks for listening. | lle1-12 |
| 49 | 1 | Daniel | {A}! Over here! | lle1-10 |
| 49 | 1 | Daniel | Oh, hi, {A}. How's it going? | lle1-06 |
| 49 | 1 | 두 사람 | It's going great. How's it going with you? | lle1-06 |
| 49 | 1 | Daniel | Let's try that again. | lle1-01 |
| 50 | 2 | Lena | Hi {A}! | lle1-10 |
| 50 | 2 | 두 사람 | Hi there! | lle1-06 |
| 50 | 2 | Lena | Nice to meet you. | lle1-01 |
| 50 | 2 | 두 사람 | Nice to meet you. | lle1-01 |
| 50 | 2 | Lena | See you soon! | lle1-10 |
| 51 | 3 | Mr. Ortiz | Hi! Are you {A}? | lle1-01 |
| 51 | 3 | 두 사람 | Yes! Hi there! | lle1-01 |
| 51 | 3 | 두 사람 | How's it going? | lle1-06 |
| 51 | 3 | Mr. Ortiz | Hi, {A}. It's going great. How's it going with you? | lle1-06 |
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
| 55 | 1 | Daniel | What's wrong? | lle1-12 |
| 55 | 1 | Daniel | Do you want to talk about it? | lle1-12 |
| 56 | 2 | Lena | {A}, here's your coffee. | lle1-12 |
| 56 | 2 | Lena | What's wrong? | lle1-12 |
| 56 | 2 | 두 사람 | Is it windy today? | lle1-09 |
| 56 | 2 | Lena | Yes, {A}. | lle1-09 |
| 58 | 4 | 두 사람 | What is going on here? | lle1-13 |
| 58 | 4 | Daniel | Remember to check the forecast -- the right forecast. | lle1-09 |
| 58 | 4 | 두 사람 | Oh. I see. | lle1-09 |
| 59 | 2 | Grace | What's wrong? | lle1-12 |
| 59 | 2 | 두 사람 | What is going on here? | lle1-13 |
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
| 64 | 1 | Daniel | Are you busy this Thursday at 6pm? | lle1-17 |
| 64 | 1 | 두 사람 | I'm busy. | lle1-17 |
| 64 | 1 | Daniel | Are you busy on Friday night? | lle1-17 |
| 64 | 1 | 두 사람 | Let me see. | lle1-14 |
| 64 | 1 | Daniel | How about on Wednesday night? | lle1-17 |
| 65 | 2 | Lena | How about on Wednesday night? | lle1-17 |
| 65 | 2 | 두 사람 | Wednesday night I am not busy. Oh, no, wait. This Wednesday night I will be busy. | lle1-17 |
| 65 | 2 | Lena | What are you doing? | lle1-17 |
| 65 | 2 | 두 사람 | I'm not busy Monday night. | lle1-17 |
| 66 | 1 | Daniel | Are you busy this Thursday at 6pm? | lle1-17 |
| 66 | 1 | 두 사람 | I'm busy. | lle1-17 |
| 66 | 1 | 두 사람 | How about on Wednesday night? | lle1-17 |
| 66 | 1 | Daniel | Wednesday night I am not busy. Oh, no, wait. This Wednesday night I will be busy. | lle1-17 |
| 66 | 1 | 두 사람 | I'm not busy Monday night. | lle1-17 |
| 66 | 1 | Daniel | Sure! | lle1-17 |
| 67 | 1 | Daniel | Great. Are you ready? | lle1-18 |
| 67 | 1 | 두 사람 | Yes. | lle1-18 |
| 67 | 1 | 두 사람 | I am really nervous. | lle1-18 |
| 67 | 1 | Daniel | I have an idea. | lle1-18 |
| 70 | 1 | Daniel | Oh, hi, {A}. How's it going? | lle1-06 |
| 70 | 1 | 두 사람 | It's going great. How's it going with you? | lle1-06 |
| 70 | 1 | Daniel | When you arrive, please come to my office. I have important news to tell you. | lle1-19 |
| 70 | 1 | 두 사람 | Of course. Good-bye. | lle1-19 |
| 71 | 2 | Grace | Great. Are you ready? | lle1-18 |
| 71 | 2 | 두 사람 | I am really nervous. | lle1-18 |
| 71 | 2 | 두 사람 | Sorry. Let me try again. | lle1-18 |
| 71 | 2 | Grace | That's right! Now you've got it! | lle1-18 |
| 72 | 1 | 두 사람 | Hi there! | lle1-19 |
| 72 | 1 | Daniel | Great. Are you ready? | lle1-18 |
| 72 | 1 | 두 사람 | Yes. | lle1-18 |
| 72 | 1 | Daniel | {A}, I have good news and I have bad news. Which do you want to hear first? | lle1-19 |
| 72 | 1 | 두 사람 | Let me see. | lle1-14 |
| 72 | 1 | 두 사람 | The good news. | lle1-19 |
| 72 | 1 | Daniel | Well, you are good at asking questions. You are good at talking to people. | lle1-19 |
| 72 | 1 | 두 사람 | Of course. Good-bye. | lle1-19 |
| 73 | 1 | Mrs. Tanaka | Hi there! | lle1-21 |
| 73 | 1 | Mrs. Tanaka | Can you come with me? | lle1-21 |
| 73 | 1 | 두 사람 | Sure. That sounds like fun. | lle1-21 |
| 73 | 1 | 두 사람 | Can you help me? | lle1-21 |
| 74 | 2 | Rosa | Hi there! | lle1-21 |
| 74 | 2 | Rosa | Can you help me? | lle1-21 |
| 74 | 2 | 두 사람 | Sure. That sounds like fun. | lle1-21 |
| 74 | 2 | Rosa | Great! | lle1-21 |
| 76 | 1 | 두 사람 | Can you help me? | lle1-21 |
| 76 | 1 | Mrs. Tanaka | Sure. | lle1-21 |
| 76 | 1 | Mrs. Tanaka | Okay, let's try it! | lle1-22 |
| 76 | 1 | 두 사람 | Let's do it! | lle1-22 |
| 78 | 1 | 두 사람 | Hi there! | lle1-22 |
| 78 | 1 | 두 사람 | Can you help me? | lle1-21 |
| 78 | 1 | Mrs. Tanaka | Sure. That sounds like fun. | lle1-21 |
| 78 | 1 | Mrs. Tanaka | Can you come with me? | lle1-21 |
| 78 | 1 | 두 사람 | Sure! | lle1-17 |
| 78 | 1 | Mrs. Tanaka | Okay, let's try it! | lle1-22 |
| 78 | 1 | 두 사람 | Let's do it! | lle1-22 |
| 79 | 1 | Mrs. Tanaka | Hi there! | lle1-22 |
| 79 | 1 | Mrs. Tanaka | Yesterday was the most amazing day. | lle1-24 |
| 79 | 1 | 두 사람 | Yesterday started like a usual work day. | lle1-24 |
| 79 | 1 | Mrs. Tanaka | It's okay. | lle1-22 |
| 80 | 2 | Grace | Okay, let's try it! | lle1-22 |
| 80 | 2 | 두 사람 | Yesterday started like a usual work day. | lle1-24 |
| 80 | 2 | 두 사람 | And I wanted a break. | lle1-24 |
| 80 | 2 | Grace | Right! | lle1-22 |
| 82 | 1 | Mrs. Tanaka | Hi, {A}! Have a seat. | lle1-29 |
| 82 | 1 | 두 사람 | Thanks. This was a good idea. | lle1-29 |
| 82 | 1 | Mrs. Tanaka | How are you these days? | lle1-29 |
| 82 | 1 | 두 사람 | I am tired. Today was a busy day at work. | lle1-29 |
| 82 | 1 | Mrs. Tanaka | Hmm, that's too bad. | lle1-29 |
| 83 | 2 | Rosa | Hi, {A}! Have a seat. | lle1-29 |
| 83 | 2 | 두 사람 | Thanks. | lle1-29 |
| 83 | 2 | Rosa | How are you these days? | lle1-29 |
| 83 | 2 | 두 사람 | I am tired. Today was a busy day at work. And I still have work to do! | lle1-29 |
| 84 | 1 | Mrs. Tanaka | Hi, {A}! Have a seat. | lle1-29 |
| 84 | 1 | Mrs. Tanaka | How are you these days? | lle1-29 |
| 84 | 1 | 두 사람 | I am tired. Today was a busy day at work. | lle1-29 |
| 84 | 1 | 두 사람 | Yesterday was the most amazing day. | lle1-24 |
| 84 | 1 | 두 사람 | I see something new every day -- like yesterday. Yesterday started like a usual work day. | lle1-24 |
| 84 | 1 | 두 사람 | And I wanted a break. | lle1-24 |
| 84 | 1 | Mrs. Tanaka | Really? | lle1-29 |
| 85 | 2 | Rosa | Hi, {A}! Have a seat. | lle1-29 |
| 85 | 2 | Rosa | How are you these days? | lle1-29 |
| 85 | 2 | 두 사람 | Yesterday started like a usual work day. | lle1-24 |
| 85 | 2 | Rosa | Do you want to talk about it? | lle1-12 |
| 85 | 2 | 두 사람 | Sorry. Let me try again. | lle1-18 |
| 86 | 3 | Ben | Did you grow up on the water? | lle1-30 |
| 86 | 3 | 두 사람 | No, I didn't. | lle1-30 |
| 86 | 3 | Ben | Is that everything you need? | lle1-30 |
| 87 | 1 | Mrs. Tanaka | Hi, {A}. What's going on? | lle1-17 |
| 87 | 1 | 두 사람 | Not much. | lle1-17 |
| 87 | 1 | Mrs. Tanaka | Do you want to talk about it? | lle1-12 |
| 87 | 1 | 두 사람 | I am tired. Today was a busy day at work. | lle1-29 |
| 88 | 2 | Rosa | {A}, what took you so long? | lle1-35 |
| 88 | 2 | 두 사람 | I love shopping! | lle1-35 |
| 88 | 2 | 두 사람 | I bought everything on the list. | lle1-35 |
| 88 | 2 | Rosa | Let me see. | lle1-35 |
| 90 | 2 | Rosa | Hi, {A}! Have a seat. | lle1-29 |
| 90 | 2 | Rosa | How are you these days? | lle1-29 |
| 90 | 2 | 두 사람 | Yesterday started like a usual work day. | lle1-24 |
| 90 | 2 | 두 사람 | And I wanted a break. So, I walked and walked … and walked. Then, I saw something! It was a festival -- a big festival! | lle1-24 |
| 90 | 2 | Rosa | That sounds like fun. | lle1-21 |
| 90 | 2 | 두 사람 | I love shopping! And, I did not spend too much money. Oh, no! But I did spend too much time! | lle1-35 |
| 90 | 2 | Rosa | Um-hum, I can believe that. | lle1-29 |
| 91 | 3 | Ben | My favorite season is summer because of summer vacation! | lle1-22 |
| 91 | 3 | 두 사람 | Yes. | lle1-21 |
| 91 | 3 | Ben | When I go camping, {A}, I like to go hiking and fishing. | lle1-22 |
| 91 | 3 | 두 사람 | Okay. | lle1-36 |
| 91 | 3 | Ben | Is that everything you need? | lle1-30 |
| 93 | 3 | Ben | I always feel great after I jog. | lle1-17 |
| 93 | 3 | 두 사람 | Really? | lle1-29 |
| 93 | 3 | Ben | Do you jog? | lle1-17 |
| 93 | 3 | 두 사람 | Okay, I never jog. But I will try because it is good for you. | lle1-17 |
| 94 | 3 | Ben | {A}! I am really happy to see you! | lle1-38 |
| 94 | 3 | 두 사람 | Me too! | lle1-38 |
| 94 | 3 | Ben | So, tell me about your job. | lle1-38 |
| 94 | 3 | 두 사람 | I love my work! | lle1-38 |
| 94 | 3 | Ben | Okay. | lle1-36 |
| 96 | 3 | Ben | {A}! I am really happy to see you! | lle1-38 |
| 96 | 3 | 두 사람 | Me too! | lle1-38 |
| 96 | 3 | Ben | So, tell me about your job. | lle1-38 |
| 96 | 3 | 두 사람 | I love my work! | lle1-38 |
| 96 | 3 | 두 사람 | How about you? | lle1-17 |
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
| 103 | 2 | 두 사람 | Yesterday started like a usual work day. | lle1-24 |
| 103 | 2 | 두 사람 | Can you hear me? | lle1-49 |
| 103 | 2 | Rosa | Wait here. | lle1-11 |
| 103 | 2 | Rosa | Hi, {A}. What's going on? | lle1-17 |
| 103 | 2 | 두 사람 | Not much. | lle1-17 |
| 104 | 3 | Ben | So, tell me about your job. | lle1-38 |
| 104 | 3 | 두 사람 | I love my work! | lle1-38 |
| 104 | 3 | Ben | Wait a minute. | lle1-17 |
| 104 | 3 | Ben | Is that everything you need? | lle1-30 |
| 106 | 2 | Rosa | Please, please, sit down. | lle1-52 |
| 106 | 2 | 두 사람 | Yesterday started like a usual work day. | lle1-24 |
| 106 | 2 | Rosa | Wait here. | lle1-11 |
| 106 | 2 | Rosa | {A}, tell us more. | lle1-52 |
| 106 | 2 | 두 사람 | Wait a minute. | lle1-17 |
| 108 | 2 | Rosa | Please, please, sit down. | lle1-52 |
| 108 | 2 | Rosa | How are you these days? | lle1-29 |
| 108 | 2 | 두 사람 | Yesterday started like a usual work day. | lle1-24 |
| 108 | 2 | Rosa | Wait here. | lle1-11 |
| 108 | 2 | 두 사람 | I said, "Yesterday started like a usual work day." | lle1-24 |
| 108 | 2 | Rosa | {A}, tell us more. | lle1-52 |
| 108 | 2 | 두 사람 | And I wanted a break. So, I walked and walked … and walked. Then, I saw something! | lle1-24 |
| 108 | 2 | Rosa | Well, thank you for sharing your news and so much more with us, {A}. | lle1-52 |
| 109 | 1 | Mrs. Tanaka | Playing board games is fun, too! | lle1-17 |
| 109 | 1 | 두 사람 | I don't know. | lle1-21 |
| 109 | 1 | Mrs. Tanaka | Really? | lle1-29 |
| 109 | 1 | 두 사람 | Yes. | lle1-21 |
| 109 | 1 | Mrs. Tanaka | It's okay. | lle1-22 |
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
| 115 | 1 | Mrs. Tanaka | Well, {A}, please share that news with us. | lle1-52 |
| 115 | 1 | 두 사람 | Yesterday was the most amazing day. | lle1-24 |
| 115 | 1 | 두 사람 | Wait a minute. | lle1-17 |
| 115 | 1 | Mrs. Tanaka | It's okay. | lle1-22 |
| 116 | 2 | Rosa | {A}, tell us more. | lle1-52 |
| 116 | 2 | 두 사람 | Yesterday started like a usual work day. | lle1-24 |
| 116 | 2 | 두 사람 | And I wanted a break. | lle1-24 |
| 116 | 2 | 두 사람 | Sorry. Let me try again. | lle1-18 |
| 118 | 4 | Daniel | How are you these days? | lle1-29 |
| 118 | 4 | 두 사람 | I am tired. Today was a busy day at work. And I still have work to do! | lle1-29 |
| 118 | 4 | Daniel | Hmm, that's too bad. | lle1-29 |
| 118 | 4 | 두 사람 | Let's get to work. | lle1-29 |
| 120 | 1 | Mrs. Tanaka | {A}, tell us more. | lle1-52 |
| 120 | 1 | 두 사람 | Yesterday started like a usual work day. | lle1-24 |
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
| 122 | 2 | Rosa | Where is your apartment? | lle1-10 |
| 122 | 2 | 두 사람 | I don't know. | lle1-21 |
| 122 | 2 | Rosa | Do you want to talk about it? | lle1-12 |
| 123 | 3 | 두 사람 | Is there a bank near here? | lle1-11 |
| 123 | 3 | Ben | There is a bank behind you. | lle1-11 |
| 123 | 3 | 두 사람 | Is there a post office near here? | lle1-11 |
| 123 | 3 | Ben | The post office is far from here. | lle1-11 |
| 124 | 1 | Mrs. Tanaka | Let me see. | lle1-35 |
| 124 | 1 | Mrs. Tanaka | It is on this street on the corner. | lle1-11 |
| 124 | 1 | 두 사람 | But what does all that mean? | lle1-19 |
| 124 | 1 | Mrs. Tanaka | The post office is far from here. But there is a mailbox across from the store. | lle1-11 |
| 125 | 4 | Daniel | What's wrong? | lle1-12 |
| 125 | 4 | 두 사람 | I don't know. | lle1-21 |
| 125 | 4 | Daniel | Don't worry, {A}. | lle1-35 |
| 125 | 4 | Daniel | Do you want to talk about it? | lle1-12 |
| 126 | 1 | Mrs. Tanaka | Sure! What do you need? | lle1-30 |
| 126 | 1 | 두 사람 | Is there a bank near here? | lle1-11 |
| 126 | 1 | Mrs. Tanaka | It is on this street on the corner. | lle1-11 |
| 126 | 1 | 두 사람 | Is there a post office near here? | lle1-11 |
| 126 | 1 | Mrs. Tanaka | The post office is far from here. But there is a mailbox across from the store. | lle1-11 |
| 126 | 1 | 두 사람 | Good point. | lle1-29 |
| 126 | 1 | 두 사람 | Well, thanks for your help. | lle1-30 |
| 127 | 1 | Mrs. Tanaka | I have some photos. | lle1-12 |
| 127 | 1 | 두 사람 | Who are they? | lle1-12 |
| 127 | 1 | Mrs. Tanaka | Photos really help. | lle1-12 |
| 127 | 1 | Mrs. Tanaka | Okay, let's try it! | lle1-22 |
| 127 | 1 | 두 사람 | Sorry. Let me try again. | lle1-18 |
| 128 | 2 | Rosa | What's wrong? | lle1-12 |
| 128 | 2 | 두 사람 | I'm thinking about my family. | lle1-12 |
| 128 | 2 | Rosa | Do you want to talk about it? | lle1-12 |
| 128 | 2 | 두 사람 | I don't know. | lle1-21 |
| 130 | 1 | Mrs. Tanaka | I have so much to tell you. | lle1-38 |
| 130 | 1 | 두 사람 | Who are they? | lle1-12 |
| 130 | 1 | Mrs. Tanaka | At first it was hard. | lle1-38 |
| 130 | 1 | Mrs. Tanaka | And it's good to remember them. | lle1-29 |
| 131 | 4 | 두 사람 | I have some photos. | lle1-12 |
| 131 | 4 | Daniel | Who are they? | lle1-12 |
| 131 | 4 | 두 사람 | I have so much to tell you. | lle1-38 |
| 131 | 4 | Daniel | Photos really help. | lle1-12 |
| 132 | 1 | 두 사람 | I have so much to tell you. | lle1-38 |
| 132 | 1 | 두 사람 | At first it was hard. | lle1-38 |
| 132 | 1 | 두 사람 | But I like remembering my old home, too. | lle1-12 |
| 132 | 1 | Mrs. Tanaka | And it's good to remember them. | lle1-29 |
| 132 | 1 | Mrs. Tanaka | It is really good to talk to you. | lle1-38 |
| 132 | 1 | 두 사람 | Thanks for listening. | lle1-12 |
| 133 | 1 | Mrs. Tanaka | Happy New Year! | lle1-40 |
| 133 | 1 | Mrs. Tanaka | Some people, at the start of a new year, make a resolution -- a promise to yourself to be better. | lle1-40 |
| 133 | 1 | 두 사람 | I thought about my resolution carefully. | lle1-40 |
| 133 | 1 | Mrs. Tanaka | {A}, you are speaking too softly. | lle1-40 |
| 133 | 1 | 두 사람 | Sorry. Let me try again. | lle1-40 |
| 134 | 2 | Rosa | Happy New Year! | lle1-40 |
| 134 | 2 | 두 사람 | Happy New Year! | lle1-40 |
| 134 | 2 | 두 사람 | Wish me luck! | lle1-40 |
| 134 | 2 | Rosa | That sounds like fun. | lle1-21 |
| 136 | 4 | 두 사람 | I thought about my resolution carefully. | lle1-40 |
| 136 | 4 | Daniel | I'll write that on my list, too! | lle1-48 |
| 136 | 4 | 두 사람 | Well, thanks for your help. See you later! | lle1-30 |
| 137 | 1 | 두 사람 | Happy New Year! | lle1-40 |
| 137 | 1 | Mrs. Tanaka | {A}, you are speaking too softly. | lle1-40 |
| 137 | 1 | 두 사람 | Sorry. Let me try again. | lle1-40 |
| 138 | 1 | 두 사람 | Happy New Year! | lle1-40 |
| 138 | 1 | 두 사람 | Some people, at the start of a new year, make a resolution -- a promise to yourself to be better. | lle1-40 |
| 138 | 1 | 두 사람 | I thought about my resolution carefully. | lle1-40 |
| 138 | 1 | Mrs. Tanaka | Yes, that is loud enough. | lle1-40 |
| 138 | 1 | Mrs. Tanaka | That sounds like fun. | lle1-21 |
| 138 | 1 | 두 사람 | Well, thanks for your help. See you later! | lle1-30 |
| 139 | 2 | Rosa | Can you help me? | lle1-21 |
| 139 | 2 | 두 사람 | Sure. That sounds like fun. | lle1-21 |
| 139 | 2 | Rosa | Our guests will be here soon! | lle1-35 |
| 139 | 2 | Rosa | How are you these days? | lle1-29 |
| 139 | 2 | 두 사람 | I don't know. | lle1-21 |
| 139 | 2 | Rosa | This is going to be a very long day. | lle1-18 |
| 140 | 2 | Rosa | They arrive in 30 minutes! | lle1-35 |
| 140 | 2 | Rosa | Think of the team! | lle1-49 |
| 140 | 2 | 두 사람 | Got it! | lle1-49 |
| 140 | 2 | Rosa | So, tell me about your job. | lle1-38 |
| 140 | 2 | 두 사람 | I love my work! | lle1-38 |
| 141 | 3 | Ben | Is that everything you need? | lle1-30 |
| 141 | 3 | 두 사람 | Yes. | lle1-30 |
| 141 | 3 | Ben | Cash or credit? | lle1-30 |
| 141 | 3 | 두 사람 | Credit, please. | lle1-30 |
| 142 | 2 | Rosa | That is amazing! {A}, tell us more. | lle1-52 |
| 142 | 2 | 두 사람 | I have met people from all over the world. | lle1-52 |
| 142 | 2 | 두 사람 | I've made many good friends. | lle1-52 |
| 143 | 4 | Daniel | So, tell me about your job. | lle1-38 |
| 143 | 4 | 두 사람 | I am tired. Today was a busy day at work. | lle1-29 |
| 143 | 4 | Daniel | That's too bad. | lle1-22 |
| 144 | 2 | Rosa | How are you these days? | lle1-29 |
| 144 | 2 | 두 사람 | Looking back over the past year, I've done so many amazing things! I have met people from all over the world. I've made many good friends. | lle1-52 |
| 144 | 2 | Rosa | That is amazing! {A}, tell us more. | lle1-52 |
| 144 | 2 | 두 사람 | I had to make a change. So, I took some chances. Sometimes I succeeded. Sometimes I failed. But I will never stop trying. | lle1-52 |
| 144 | 2 | Rosa | {A}, you made it work! | lle1-36 |
| 144 | 2 | Rosa | Well, thanks for your help. | lle1-30 |
| 145 | 1 | Malia | Where are you from? | lle1-02 |
| 145 | 1 | Malia | Nice to meet you! | lle1-02 |
| 145 | 3 | Ms. Evans | I have a new assignment for you! | lle1-19 |
| 145 | 3 | Ms. Evans | Can you help me? | lle1-21 |
| 145 | 3 | 두 사람 | Sure. That sounds like fun. | lle1-21 |
| 145 | 3 | Ms. Evans | Okay, let's try it! | lle1-22 |
| 146 | 2 | Tom | Can you help me? | lle1-21 |
| 146 | 2 | 두 사람 | Sure. | lle1-21 |
| 146 | 2 | Tom | I have to go now. | lle1-02 |
| 147 | 3 | Ms. Evans | Are you busy on Friday night? | lle1-17 |
| 147 | 3 | 두 사람 | I don't know. | lle1-21 |
| 147 | 3 | Ms. Evans | Will you be busy all day? | lle1-21 |
| 148 | 1 | Malia | What's wrong? | lle1-12 |
| 148 | 1 | 두 사람 | I am tired. Today was a busy day at work. And I still have work to do! | lle1-29 |
| 148 | 1 | Malia | That's too bad. | lle1-22 |
| 149 | 4 | 두 사람 | I am sorry. | lle1-03 |
| 149 | 4 | 두 사람 | Sorry, I can't come with you. | lle1-21 |
| 149 | 4 | Daniel | Let's try that again. | lle1-01 |
| 150 | 3 | Ms. Evans | Are you busy on Friday night? | lle1-17 |
| 150 | 3 | 두 사람 | I am sorry. | lle1-03 |
| 150 | 3 | 두 사람 | I'm busy. | lle1-17 |
| 150 | 3 | Ms. Evans | Of course. | lle1-19 |
| 151 | 1 | Malia | How are you two? | lle1-04 |
| 151 | 1 | 두 사람 | Can you help me? | lle1-21 |
| 151 | 1 | Malia | Sure! What do you need? | lle1-30 |
| 151 | 3 | 두 사람 | Can you help me? | lle1-21 |
| 151 | 3 | Ms. Evans | Excuse me? | lle1-03 |
| 151 | 3 | 두 사람 | I don't know. | lle1-21 |
| 152 | 2 | Grace | But you learn a little more every day. | lle1-04 |
| 152 | 2 | Tom | {A}, do you have a pen? | lle1-04 |
| 152 | 2 | 두 사람 | Yes. I have a pen in my bag. | lle1-04 |
| 153 | 3 | 두 사람 | Excuse me. | lle1-30 |
| 153 | 3 | Ms. Evans | Are you ready? | lle1-18 |
| 153 | 3 | 두 사람 | Sorry. Let me try again. | lle1-18 |
| 154 | 2 | Tom | Really, {A}? Can you help me? | lle1-20 |
| 154 | 2 | 두 사람 | Yes, I can. Let me help. | lle1-20 |
| 155 | 4 | Daniel | So, what's wrong? | lle1-20 |
| 155 | 4 | 두 사람 | Excuse me. Can you help me? | lle1-30 |
| 155 | 4 | Daniel | Sure! What do you need? | lle1-30 |
| 156 | 1 | 두 사람 | Can you help me? | lle1-21 |
| 156 | 1 | Malia | Sure! What do you need? | lle1-30 |
| 156 | 3 | 두 사람 | Excuse me. Can you help me? | lle1-30 |
| 156 | 3 | Ms. Evans | Yes, I can. Let me help. | lle1-20 |
| 157 | 1 | Malia | Hey, {A}, my friend is having a party on Saturday. Can you come with me? | lle1-21 |
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
| 169 | 1 | Malia | Hi, {A}! Have a seat. | lle1-29 |
| 169 | 1 | 두 사람 | I have an idea. | lle1-29 |
| 169 | 1 | Malia | Why? | lle1-36 |
| 169 | 1 | 두 사람 | I don't know. | lle1-21 |
| 170 | 2 | Malia | How are you these days? | lle1-29 |
| 170 | 2 | 두 사람 | I am tired. Today was a busy day at work. And I still have work to do! | lle1-29 |
| 170 | 2 | Malia | I'm really busy too, {A}. Let's get to work. | lle1-29 |
| 171 | 3 | Ms. Evans | Okay. What do you want? | lle1-30 |
| 171 | 3 | 두 사람 | I have an idea. | lle1-29 |
| 171 | 3 | Ms. Evans | Why? | lle1-36 |
| 171 | 3 | 두 사람 | Working outdoors is nice. | lle1-29 |
| 174 | 3 | Ms. Evans | Okay. What do you want? | lle1-30 |
| 174 | 3 | 두 사람 | I have an idea. | lle1-29 |
| 174 | 3 | Ms. Evans | Why? | lle1-36 |
| 174 | 3 | 두 사람 | Most days of the week, people are really busy. But it's important to find time to be with your friends! | lle1-17 |
| 174 | 3 | 두 사람 | Working outdoors is nice. | lle1-29 |
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
| 180 | 1 | Malia | Are you busy on Friday night? | lle1-17 |
| 180 | 1 | 두 사람 | I'm busy. | lle1-17 |
| 180 | 2 | Tom | Hey, {A}, my friend is having a party on Saturday. Can you come with me? | lle1-21 |
| 180 | 2 | 두 사람 | Sorry, I can't come with you. | lle1-21 |
| 180 | 3 | Ms. Evans | Would you like to help us? | lle1-51 |
| 180 | 3 | 두 사람 | I'm sorry. | lle1-51 |
| 180 | 3 | 두 사람 | Today was a busy day at work. And I still have work to do! | lle1-29 |
| 180 | 3 | Ms. Evans | I'm sorry to hear that. | lle1-27 |
| 181 | 3 | Ms. Evans | So, {A}, what's the plan for the show? | lle1-22 |
| 181 | 3 | 두 사람 | I have a plan. | lle1-36 |
| 181 | 3 | Ms. Evans | {A}, what do you mean? | lle1-27 |
| 182 | 2 | Malia | Hi, {A}. What's going on? | lle1-17 |
| 182 | 2 | 두 사람 | Not much. | lle1-17 |
| 182 | 2 | Malia | Busy as usual. | lle1-17 |
| 183 | 4 | Daniel | So, tell me about your job. | lle1-38 |
| 183 | 4 | 두 사람 | I love my work! | lle1-38 |
| 183 | 4 | Daniel | Really? | lle1-29 |
| 184 | 3 | Ms. Evans | So, {A}, what's the plan for the show? | lle1-22 |
| 184 | 3 | 두 사람 | I have a plan. | lle1-36 |
| 184 | 3 | Ms. Evans | Excuse me? | lle1-03 |
| 184 | 3 | 두 사람 | First, we're going to introduce the subject. | lle1-22 |
| 186 | 3 | Ms. Evans | So, {A}, what's the plan for the show? | lle1-22 |
| 186 | 3 | 두 사람 | First, we're going to introduce the subject. Then we can show pictures and video. | lle1-22 |
| 186 | 3 | Ms. Evans | Great idea! | lle1-22 |
| 186 | 4 | Daniel | So, tell me about your job. | lle1-38 |
| 186 | 4 | 두 사람 | I have met people from all over the world. I've made many good friends. And I have a great job! | lle1-52 |
| 186 | 4 | Daniel | Your friends sound great! | lle1-38 |
| 187 | 2 | Tom | Hi, {A}! Hi, {B}! | lle1-04 |
| 187 | 2 | Tom | How are you two? | lle1-04 |
| 187 | 2 | Malia | I am great! | lle1-04 |
| 187 | 2 | Tom | How's the new apartment? | lle1-04 |
| 187 | 2 | 두 사람 | Sorry, I can't hear you. | lle1-20 |
| 188 | 2 | Malia | {A}, do you have a pen? | lle1-04 |
| 188 | 2 | 두 사람 | Yes. I have a pen in my bag. | lle1-04 |
| 188 | 2 | Tom | Let's get coffee! | lle1-04 |
| 190 | 2 | Malia | Hi, {A}. Hi, {B}. | lle1-20 |
| 190 | 2 | Tom | So, what's wrong? You look sad. | lle1-20 |
| 190 | 2 | 두 사람 | I am tired. | lle1-29 |
| 192 | 2 | Tom | Hi, {A}! Hi, {B}! | lle1-04 |
| 192 | 2 | Tom | How are you two? | lle1-04 |
| 192 | 2 | 두 사람 | I am great! | lle1-04 |
| 192 | 2 | 두 사람 | How about you? | lle1-17 |
| 192 | 2 | Malia | Busy as usual. | lle1-17 |
| 192 | 2 | 두 사람 | Let's get coffee! | lle1-04 |
| 192 | 2 | Malia | Sure, let's go! | lle1-21 |
| 192 | 2 | Tom | Yes! Let's go! | lle1-28 |
| 193 | 3 | Ms. Evans | I have a new assignment for you! | lle1-19 |
| 193 | 3 | 두 사람 | I can help with that. | lle1-48 |
| 193 | 3 | Tom | {A}, what do you mean? | lle1-27 |
| 193 | 3 | 두 사람 | Sorry. Let me try again. | lle1-40 |
| 193 | 3 | Malia | Let me help. | lle1-20 |
| 194 | 1 | Malia | Can you help me? | lle1-20 |
| 194 | 1 | 두 사람 | Yes, I can. Let me help. | lle1-20 |
| 194 | 1 | 두 사람 | They're in your phone. See? | lle1-25 |
| 194 | 1 | Malia | I see. | lle1-25 |
| 194 | 1 | Malia | Got it. | lle1-25 |
| 195 | 2 | Grace | Yeah. But you learn a little more every day. | lle1-04 |
| 195 | 2 | 두 사람 | I have a plan. | lle1-36 |
| 195 | 2 | Grace | Okay, let's try it! | lle1-22 |
| 196 | 3 | 두 사람 | First, we're going to introduce the subject. Then we can show pictures and video. | lle1-22 |
| 196 | 3 | Tom | How is this going to help? | lle1-20 |
| 196 | 3 | 두 사람 | Sorry. Let me try again. | lle1-40 |
| 196 | 3 | Malia | I didn't know that. | lle1-26 |
| 197 | 4 | 두 사람 | I am a little nervous. | lle1-28 |
| 197 | 4 | Daniel | You don't need to be nervous. | lle1-28 |
| 197 | 4 | Daniel | Good luck! | lle1-25 |
| 198 | 3 | Ms. Evans | Are you ready? | lle1-18 |
| 198 | 3 | 두 사람 | I have a plan. | lle1-36 |
| 198 | 3 | 두 사람 | First, we're going to introduce the subject. Then we can show pictures and video. | lle1-22 |
| 198 | 3 | 두 사람 | Finally, we can read the questions and tell them where to learn more. | lle1-22 |
| 198 | 3 | Malia | I didn't know that. | lle1-26 |
| 198 | 3 | Ms. Evans | Good job! | lle1-33 |
| 199 | 2 | Tom | Why? What happened? | lle1-28 |
| 199 | 2 | 두 사람 | Well, yesterday I felt fine. | lle1-27 |
| 199 | 2 | 두 사람 | In the morning, I painted for hours. | lle1-27 |
| 199 | 2 | Tom | {A}, what do you mean? | lle1-27 |
| 199 | 2 | Tom | But I don't need to know all that. | lle1-27 |
| 200 | 1 | Malia | How are you these days? | lle1-29 |
| 200 | 1 | 두 사람 | Yesterday started like a usual work day. | lle1-24 |
| 200 | 1 | Malia | Why? What happened? | lle1-28 |
| 200 | 1 | 두 사람 | It started fine. | lle1-28 |
| 201 | 3 | 두 사람 | It started fine. | lle1-28 |
| 201 | 3 | Tom | Why? What happened? | lle1-28 |
| 201 | 3 | 두 사람 | Sorry, I can't hear you. | lle1-20 |
| 201 | 3 | Tom | But I don't need to know all that. | lle1-27 |
| 202 | 2 | Tom | What happened? | lle1-28 |
| 202 | 2 | 두 사람 | I did! But it was not easy. | lle1-28 |
| 202 | 2 | Malia | Why? What happened? | lle1-28 |
| 202 | 2 | 두 사람 | It started fine. | lle1-28 |
| 204 | 3 | Tom | Why? What happened? | lle1-28 |
| 204 | 3 | 두 사람 | Yesterday started like a usual work day. | lle1-24 |
| 204 | 3 | Tom | {A}, what do you mean? | lle1-27 |
| 204 | 3 | 두 사람 | It started fine. | lle1-28 |
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
| 209 | 4 | Daniel | Is something wrong? | lle1-39 |
| 209 | 4 | 두 사람 | I can fix this. | lle1-35 |
| 209 | 4 | Daniel | Good idea. | lle1-39 |
| 210 | 3 | Ms. Evans | Is something wrong? | lle1-39 |
| 210 | 3 | 두 사람 | When do our guests arrive? | lle1-35 |
| 210 | 3 | Ms. Evans | They arrive in 30 minutes! | lle1-35 |
| 210 | 3 | 두 사람 | I can fix this. | lle1-35 |
| 210 | 3 | 두 사람 | Okay. I got it. | lle1-18 |
| 210 | 3 | Ms. Evans | Good job! That was fast. | lle1-33 |
| 211 | 3 | Ms. Evans | Well, {A}, please share that news with us. | lle1-52 |
| 211 | 3 | 두 사람 | I am a little nervous. | lle1-28 |
| 211 | 3 | Ms. Evans | {A}, you are speaking too softly. | lle1-40 |
| 211 | 3 | Tom | Sorry, I can't hear you. | lle1-20 |
| 212 | 1 | Malia | {A}, tell us more. | lle1-52 |
| 212 | 1 | 두 사람 | I have so much to tell you. | lle1-38 |
| 212 | 1 | Malia | Yes, that is loud enough. | lle1-40 |
| 213 | 2 | 두 사람 | I am a little nervous. | lle1-28 |
| 213 | 2 | Grace | You don't need to be nervous. | lle1-28 |
| 213 | 2 | Grace | I think big things are going to happen for you, {A}. | lle1-52 |
| 214 | 3 | Ms. Evans | How long have you been training? | lle1-51 |
| 214 | 3 | 두 사람 | I started today. | lle1-51 |
| 214 | 3 | Ms. Evans | {A}, training a little every day is a good habit to get into. Not all at once! | lle1-51 |
| 215 | 4 | 두 사람 | I have met people from all over the world. I've made many good friends. | lle1-52 |
| 215 | 4 | Daniel | That is amazing! | lle1-52 |
| 215 | 4 | Daniel | Okay, well, good luck, {A}! | lle1-51 |
| 216 | 3 | Ms. Evans | Well, {A}, please share that news with us. | lle1-52 |
| 216 | 3 | 두 사람 | I have met people from all over the world. I've made many good friends. | lle1-52 |
| 216 | 3 | 두 사람 | I had to make a change. So, I took some chances. Sometimes I succeeded. Sometimes I failed. But I will never stop trying. | lle1-52 |
| 216 | 3 | 두 사람 | I've just found my new goal. | lle1-51 |
| 216 | 3 | Ms. Evans | That is amazing! | lle1-52 |
| 216 | 3 | Tom | Good job! | lle1-33 |
| 216 | 3 | 두 사람 | We did it, {B}! | lle1-45 |
| 217 | 1 | 두 사람 | Excuse me! | lle1-03 |
| 217 | 1 | 두 사람 | Hi! | lle1-34 |
| 217 | 2 | Grace | {A}, what's wrong? | lle1-34 |
| 217 | 2 | 두 사람 | This is hard. | lle1-34 |
| 218 | 3 | Ben | Hi! | lle1-34 |
| 218 | 3 | Mr. Kahale | What do you need? | lle1-34 |
| 218 | 3 | 두 사람 | Sure! First, what do you do? | lle1-34 |
| 219 | 2 | 두 사람 | I might go. I might not go. | lle1-34 |
| 219 | 2 | Grace | Of course you will go. | lle1-34 |
| 219 | 2 | Grace | Have fun, {A}! | lle1-34 |
| 220 | 1 | 두 사람 | Excuse me. | lle1-16 |
| 220 | 1 | 두 사람 | Do you have time for a couple of questions? | lle1-16 |
| 220 | 1 | 두 사람 | Have fun! | lle1-16 |
| 221 | 3 | Mr. Kahale | Sure, I have time. | lle1-16 |
| 221 | 3 | Mr. Kahale | What is your name and where are you from? | lle1-16 |
| 221 | 3 | Ben | Have fun! | lle1-16 |
| 222 | 1 | 두 사람 | Hello! | lle1-16 |
| 222 | 1 | 두 사람 | Do you have time for a couple of questions? | lle1-16 |
| 222 | 1 | 두 사람 | What is your name and where are you from? | lle1-16 |
| 222 | 1 | 두 사람 | Have fun! | lle1-16 |
| 223 | 2 | Mr. and Mrs. Lee | Hi {A}, how are you? | lle1-15 |
| 223 | 2 | 두 사람 | I'm doing great! | lle1-15 |
| 223 | 2 | Mr. and Mrs. Lee | It's a beautiful day, isn't it? | lle1-15 |
| 223 | 2 | 두 사람 | Yes, it is. | lle1-15 |
| 224 | 3 | Ben | {A}, today the weather is beautiful, isn't it? | lle1-15 |
| 224 | 3 | 두 사람 | Yes, it is. | lle1-15 |
| 224 | 3 | Ben | I love people-watching too! | lle1-15 |
| 225 | 2 | Mr. and Mrs. Lee | Come and join us! | lle1-15 |
| 225 | 2 | Mr. and Mrs. Lee | No need to hurry. | lle1-15 |
| 225 | 2 | 두 사람 | Sure! | lle1-15 |
| 225 | 2 | Mr. and Mrs. Lee | Let's sit! | lle1-15 |
| 226 | 2 | Mr. and Mrs. Lee | Come in. | lle1-07 |
| 226 | 2 | Mr. and Mrs. Lee | Well, {A}, welcome. | lle1-07 |
| 226 | 2 | 두 사람 | Thank you. | lle1-07 |
| 226 | 2 | Mr. and Mrs. Lee | Are you excited? | lle1-07 |
| 226 | 2 | 두 사람 | Yes, I am excited! | lle1-07 |
| 227 | 3 | 두 사람 | Hi there! I'm {A}. | lle1-07 |
| 227 | 3 | Mr. Kahale | Nice to meet you! | lle1-07 |
| 227 | 3 | 두 사람 | What are you doing? | lle1-07 |
| 228 | 2 | Mr. and Mrs. Lee | Hi {A}, how are you? | lle1-15 |
| 228 | 2 | 두 사람 | I'm doing great! | lle1-15 |
| 228 | 2 | 두 사람 | It's a beautiful day, isn't it? | lle1-15 |
| 228 | 2 | Mr. and Mrs. Lee | Yes, it is. | lle1-15 |
| 228 | 2 | 두 사람 | What are you doing? | lle1-07 |
| 228 | 2 | Mr. and Mrs. Lee | I love people-watching too! | lle1-15 |
| 228 | 2 | Mr. and Mrs. Lee | Come and join us! | lle1-15 |
| 228 | 2 | 두 사람 | Thank you. | lle1-07 |
| 229 | 4 | 두 사람 | Excuse me. Can you help me? | lle1-30 |
| 229 | 4 | Sarah | So sorry, but I am busy. | lle1-07 |
| 229 | 4 | Sarah | Okay, I'll be back in 15 minutes. | lle1-23 |
| 229 | 4 | 두 사람 | This day is not going well. | lle1-07 |
| 230 | 2 | Mr. and Mrs. Lee | I love your apartment building, {A}. Is your rent expensive? | lle1-38 |
| 230 | 2 | 두 사람 | Well, I have a roommate. So, we split the rent. | lle1-38 |
| 230 | 2 | Mr. and Mrs. Lee | Remember, {A}. Be careful! | lle1-34 |
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
| 235 | 3 | 두 사람 | Sure! | lle1-12 |
| 235 | 3 | 두 사람 | I don't know. | lle1-21 |
| 235 | 3 | Ben | Are you okay, {A}? | lle1-51 |
| 236 | 2 | Mr. and Mrs. Lee | Why? What happened? | lle1-28 |
| 236 | 2 | 두 사람 | It started fine. | lle1-28 |
| 236 | 2 | 두 사람 | So, I walked and walked … and walked. Then, I saw something! | lle1-24 |
| 238 | 3 | 두 사람 | Hello, everyone. | lle1-32 |
| 238 | 3 | 두 사람 | It started fine. | lle1-28 |
| 238 | 3 | 두 사람 | Oh well. | lle1-32 |
| 238 | 3 | Mr. Kahale | Why? What happened? | lle1-28 |
| 239 | 2 | Grace | Let's try again. | lle1-32 |
| 239 | 2 | 두 사람 | It started fine. | lle1-28 |
| 239 | 2 | 두 사람 | So, I walked and walked … and walked. | lle1-24 |
| 239 | 2 | 두 사람 | Then, I saw something! | lle1-24 |
| 239 | 2 | Grace | That is right, {A}. | lle1-32 |
| 240 | 3 | 두 사람 | Hello, everyone. I'm {A}, and thanks for coming! | lle1-32 |
| 240 | 3 | 두 사람 | It started fine. | lle1-28 |
| 240 | 3 | 두 사람 | So, I walked and walked … and walked. Then, I saw something! | lle1-24 |
| 240 | 3 | 두 사람 | Thanks for listening. | lle1-12 |
| 240 | 3 | Mr. Kahale | Well, thank you for sharing your news and so much more with us, {A}. | lle1-52 |
| 241 | 2 | Mr. and Mrs. Lee | I'm thinking about my family. | lle1-12 |
| 241 | 2 | Mr. and Mrs. Lee | This is what happened. | lle1-52 |
| 241 | 2 | 두 사람 | Wow! | lle1-23 |
| 241 | 2 | 두 사람 | Good! | lle1-41 |
| 241 | 2 | Mr. and Mrs. Lee | Okay then. | lle1-07 |
| 242 | 2 | Mr. and Mrs. Lee | I have some photos. | lle1-12 |
| 242 | 2 | 두 사람 | Wow! | lle1-23 |
| 242 | 2 | Grace | Please don't worry. | lle1-41 |
| 244 | 2 | Mr. and Mrs. Lee | This is a family tree. | lle1-12 |
| 244 | 2 | 두 사람 | Who are they? | lle1-12 |
| 244 | 2 | 두 사람 | Why? | lle1-37 |
| 244 | 2 | Mr. and Mrs. Lee | Okay then. | lle1-07 |
| 245 | 2 | Mr. and Mrs. Lee | Our hometown isn't the same now. | lle1-38 |
| 245 | 2 | 두 사람 | Are you okay? | lle1-37 |
| 245 | 2 | Mr. and Mrs. Lee | I'm thinking about my family. | lle1-12 |
| 246 | 2 | Mr. and Mrs. Lee | I'm thinking about my family. | lle1-12 |
| 246 | 2 | 두 사람 | Do you want to talk about it? | lle1-12 |
| 246 | 2 | Mr. and Mrs. Lee | Sure! I have some photos. | lle1-12 |
| 246 | 2 | 두 사람 | Who are they? | lle1-12 |
| 246 | 2 | Mr. and Mrs. Lee | This is what happened. | lle1-52 |
| 246 | 2 | 두 사람 | Why? | lle1-37 |
| 246 | 2 | 두 사람 | They make history come alive! | lle1-16 |
| 246 | 2 | Mr. and Mrs. Lee | I do feel better. Thanks for listening. | lle1-12 |
| 247 | 3 | Mr. Kahale | Hello, everyone. | lle1-32 |
| 247 | 3 | Mr. Kahale | Well, {A}, please share that news with us. | lle1-52 |
| 247 | 3 | 두 사람 | Hello, everyone. | lle1-32 |
| 247 | 3 | 두 사람 | I don't know. | lle1-21 |
| 247 | 3 | Mr. Kahale | Okay then. | lle1-07 |
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
| 252 | 3 | 두 사람 | Hello, everyone. I'm {A}, and thanks for coming! | lle1-32 |
| 252 | 3 | 두 사람 | Here's the plan. | lle1-41 |
| 252 | 3 | 두 사람 | Tell us your name. | lle1-42 |
| 252 | 3 | 두 사람 | Excuse me. Can you help me? | lle1-30 |
| 252 | 3 | Ben | Yes, I can. Let me help. | lle1-20 |
| 252 | 3 | 두 사람 | Let's get to work! | lle1-41 |
| 252 | 3 | Mr. Kahale | Good job, team. | lle1-41 |
| 253 | 3 | 두 사람 | Hello, everyone. I'm {A}, and thanks for coming! | lle1-32 |
| 253 | 3 | 두 사람 | I don't remember the name. | lle1-51 |
| 253 | 3 | Ben | Are you okay, {A}? | lle1-51 |
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
| 258 | 3 | 두 사람 | Sometimes I succeeded. Sometimes I failed. But I will never stop trying. | lle1-52 |
| 258 | 3 | Mr. Kahale | That is amazing! | lle1-52 |
| 259 | 2 | Grace | We are celebrating at 7pm tonight. Did you forget? | lle1-46 |
| 259 | 2 | 두 사람 | What is happening tonight? | lle1-46 |
| 259 | 2 | Grace | Don't forget! | lle1-46 |
| 259 | 3 | Ben | Is something wrong? | lle1-39 |
| 259 | 3 | 두 사람 | I forgot about that! | lle1-38 |
| 260 | 2 | 두 사람 | Do you have pen and paper I can borrow? | lle1-46 |
| 260 | 2 | Mr. and Mrs. Lee | Of course. | lle1-46 |
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
| 263 | 2 | 두 사람 | Are you busy on Friday night? | lle1-17 |
| 263 | 2 | Grace | Yes. | lle1-17 |
| 263 | 2 | Grace | How about on Wednesday night? | lle1-17 |
| 263 | 2 | 두 사람 | Wednesday night I am not busy. Oh, no, wait. This Wednesday night I will be busy. | lle1-17 |
| 263 | 2 | Grace | Wait a minute. Are you busy now? | lle1-17 |
| 264 | 3 | 두 사람 | Looking back over the past year, I've done so many amazing things! | lle1-52 |
| 264 | 3 | 두 사람 | New friends are good. But old friends are the best. | lle1-38 |
| 264 | 3 | 두 사람 | I can go on vacation next summer. | lle1-22 |
| 264 | 3 | 두 사람 | You can trust me. | lle1-47 |
| 264 | 3 | Mr. Kahale | That's a great idea! | lle1-37 |
| 264 | 3 | Ben | Good luck! | lle1-34 |
| 265 | 2 | 두 사람 | Come by this afternoon. | lle1-08 |
| 265 | 2 | Mr. and Mrs. Lee | Excuse me? | lle1-03 |
| 265 | 2 | 두 사람 | Sorry. | lle1-07 |
| 265 | 2 | Mr. and Mrs. Lee | I might go. I might not go. | lle1-34 |
| 266 | 4 | Sarah | Hi, {A}! What do you need? | lle1-34 |
| 266 | 4 | 두 사람 | Come in. | lle1-07 |
| 266 | 4 | Sarah | Thank you. | lle1-07 |
| 266 | 4 | 두 사람 | Well, have a seat! | lle1-15 |
| 266 | 4 | Sarah | Okay. | lle1-34 |
| 267 | 2 | 두 사람 | Are you going? | lle1-34 |
| 267 | 2 | Mr. and Mrs. Lee | I might. | lle1-34 |
| 267 | 2 | 두 사람 | Okay. | lle1-34 |
| 268 | 2 | 두 사람 | Do you have time for a couple of questions? | lle1-16 |
| 268 | 2 | Mr. and Mrs. Lee | Sure, I have time. | lle1-16 |
| 268 | 2 | 두 사람 | Who are they? | lle1-12 |
| 268 | 2 | Mr. and Mrs. Lee | This is my mother and this is my father. | lle1-12 |
| 268 | 2 | 두 사람 | Thanks for showing me your family photos. | lle1-12 |
| 270 | 2 | 두 사람 | I love having my friends over. Come on! | lle1-10 |
| 270 | 2 | Grace | Great! | lle1-10 |
| 270 | 2 | 두 사람 | Come by this afternoon. | lle1-08 |
| 270 | 2 | Mr. and Mrs. Lee | Sure! | lle1-16 |
| 270 | 4 | 두 사람 | Come in. | lle1-07 |
| 270 | 4 | Sarah | Thank you. | lle1-07 |
| 270 | 4 | Sarah | Thanks. This was a good idea. | lle1-29 |
| 271 | 4 | Sarah | Is something wrong? | lle1-39 |
| 271 | 4 | 두 사람 | It's not starting! | lle1-47 |
| 271 | 4 | Sarah | Then what happened? | lle1-42 |
| 271 | 4 | 두 사람 | This is hard. | lle1-34 |
| 272 | 2 | Mr. and Mrs. Lee | So, what happened next? | lle1-42 |
| 272 | 2 | 두 사람 | Sorry. Let me try again. | lle1-18 |
| 272 | 2 | Mr. and Mrs. Lee | Okay. | lle1-34 |
| 273 | 4 | Sarah | I can fix this. Do you trust me? | lle1-35 |
| 273 | 4 | 두 사람 | Yes. | lle1-35 |
| 273 | 4 | 두 사람 | This is wrong! | lle1-39 |
| 273 | 4 | Sarah | What's wrong? | lle1-47 |
| 274 | 2 | Grace | We don't have to agree with people. They have their opinions. We have ours. | lle1-37 |
| 274 | 4 | Sarah | I disagree. | lle1-37 |
| 274 | 4 | 두 사람 | That's a good point. | lle1-37 |
| 275 | 2 | Grace | When something goes wrong with your plan, just change the plan! | lle1-36 |
| 275 | 2 | 두 사람 | I have an idea. | lle1-37 |
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
| 278 | 3 | Ben | {A}, you should go a lot earlier than 7 o'clock. | lle1-31 |
| 278 | 3 | 두 사람 | Good point. | lle1-31 |
| 278 | 3 | Mr. Kahale | Being early is better than being late. | lle1-31 |
| 279 | 2 | 두 사람 | This is hard. | lle1-34 |
| 279 | 2 | Grace | {A}, training a little every day is a good habit to get into. Not all at once! | lle1-51 |
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
| 283 | 2 | Mr. and Mrs. Lee | What is happening tonight? | lle1-46 |
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
| 288 | 4 | 두 사람 | That's our guests! | lle1-36 |
| 288 | 4 | 두 사람 | Hello, everyone. I'm {A}, and thanks for coming! | lle1-32 |
| 288 | 4 | 두 사람 | Well, I have lived here for over a year. | lle1-48 |
| 288 | 4 | 두 사람 | I have met people from all over the world. I've made many good friends. | lle1-52 |
| 288 | 4 | 두 사람 | Sometimes I succeeded. Sometimes I failed. But I will never stop trying. | lle1-52 |
| 288 | 4 | Sarah | Thank you. Thank you so much for having me here. | lle1-52 |

1주차는 이름이 고비다 (world.md 5.1). 1일에 프런트에서 철자를 못 맞추고, 2일에 카페에서 다시 이름을 묻고,
3일에 편의점에서 처음 인사를 주고받는다. 4~6일은 5과가 들어와 Daniel 이 방을 보여 주고, 6일에 두 사람이 서로를 찾으며 방 이름을 말한다.

## 4. 기계가 안 보는 것

**그 장면에서 두 사람이 웃는가.** 셈은 대사가 들은 녹음에서 왔는지까지만 본다.
