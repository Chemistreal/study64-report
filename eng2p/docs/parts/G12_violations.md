# G12 첫 공개 A1 상한 새 집계

신뢰도: B 생성 (첨부 원본을 새로 세고 필요한 짧은 영어를 제안했으며 실제 말투와 음성은 확인하지 못했어요.)
검증로그: 2026-10-13 / 현재 깊은 검사와 원본 대사 및 낱말 등급표 대조 / 보류 / 실제 검사 결과와 남은 범위는 report.md에 적었어요.

현재 원본에서 A1_WORD_LIMIT 571건과 A1_NEW_WORD_LIMIT 0건을 찾았어요. 571은 서로 다른 영어 문장 수가 아니라 파일별 저장 위치 수예요. 동일 녹음의 덱과 카드 및 음성 목록 사본이 각각 세어져요. 앞 보고서와 위반 수가 같고 첫 공개 저장 줄 검사 수는 4970에서 5032로 늘었어요. 파일별 위반 수와 대상 지은 두 줄은 앞 보고서와 같아요. 늘어난 검사 위치의 정확한 내역은 과거 Data 사본을 따로 대조하지 않아 확정하지 못했어요.

검사는 첫 공개에 나오는 줄을 실제 줄 등급과 관계없이 8낱말로 제한해요. 반면 authored_lib는 원본의 각 줄 등급을 사용해서 버스 미션의 두 A2 줄을 허용해요. 깊은 검사는 내부 아포스트로피를 포함한 영어와 숫자 및 이름 자리 하나를 한 낱말로 세며 개행만 줄 경계로 삼아요. 새 낱말은 authored의 introduces와 stretchWords 합집합만 세어요. 녹음과 그 사본의 완전한 단어 교육표는 없어 실제 미학습 낱말 수를 확정하지 못해요.

아래 words는 깊은 검사 방식의 수예요. new words의 -는 조사하지 않은 영역이 아니라 이 검사에 측정 자료가 없다는 뜻이에요. none으로 보고하지 않았어요. 함수 이름과 한국어의 확신은 별도로 검토했어요.

## 수정 대상인 지은 대사

| file | id | mission | session | English | kind | words | new words | 처리 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| authored.json | bs-18 | bus_fare_question | 44 | Please tell us. We get off at the zoo. | too many words | 9 | 2 | G12_fixes.md 교체안 |
| authored.json | bs-19 | bus_fare_question | 44 | Okay. I will tell you when we get there. | too many words | 9 | 0 | G12_fixes.md 교체안 |

## 녹음 자료와 사본: 이 일감에서는 고치지 않아요

이 569개 위치는 원본 녹음의 대본이나 카드 및 장면과 세션 덱 및 음성 목록의 자료예요. 녹음 내용을 짧게 다시 쓰면 원래 소리와 달라져요. TASK.md가 허용한 authored 줄 교체 범위 밖이므로 모두 그대로 보관해요. 관련 학습 설계를 검토할 사람은 같은 녹음의 여러 위치를 묶어 별도로 판단해야 해요.

| file | id | mission | session | English | kind | words | new words | 수정하지 않는 이유 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| cards.json | Q1-003/a/material/4 | - | 1 | Every day I learn more about this great city. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-045/a/material/0 | - | 19 | I am going to eat. / I am going to Boston. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-045/a/material/1 | - | 19 | She is going to study. / She is going to the library. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-045/a/material/2 | - | 19 | We are going to leave. / We are going to the park. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-045/a/material/3 | - | 19 | He is going to help. / He is going to school. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-045/a/material/4 | - | 19 | They are going to wait. / They are going to New York. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-053/a/material/4 | - | 21 | I want to try. / I want a new phone. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-060/a/material/0 | - | 23 | a lot of / I have a lot of work. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-070/a/material/4 | - | 25 | We would have been out of there by now. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-087/a/material/0 | - | 37 | I want it. / I want a big new book. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-087/a/material/1 | - | 37 | She works. / She works in a big office today. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-087/a/material/2 | - | 37 | We can meet. / We can meet you at the park tomorrow. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-087/a/material/3 | - | 37 | They have time. / They have a lot of free time now. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-087/a/material/4 | - | 37 | He is reading. / He is reading a new book about history. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-091/a/material/4 | - | 40 | When do we need it? / We need it now. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-092/a/material/0 | - | 40 | I want a book. (Who wants a book? / What do you want?) | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-092/a/material/1 | - | 40 | She works here. (Who works here? / Where does she work?) | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-092/a/material/2 | - | 40 | We need it now. (Who needs it? / When do we need it?) | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-092/a/material/3 | - | 40 | They have a car. (Who has a car? / What do they have?) | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-092/a/material/4 | - | 40 | He called me. (Who called you? / Who did he call?) | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| cards.json | Q1-094/a/material/2 | - | 40 | When do we need it? / [We] need it now. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:13/block:1/line:1 | - | 13 | Then at the bus station turn left. Then walk straight ahead. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:14/block:2/line:2 | - | 14 | The gym is across from the lounge. It's next to the mailroom. Go that way. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:15/block:1/line:3 | - | 15 | The gym is across from the lounge. It is behind the lobby. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:16/block:3/line:2 | - | 16 | Um, no. The post office is far from here. But there is a mailbox across from the store. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:18/block:3/line:2 | - | 18 | Um, no. The post office is far from here. But there is a mailbox across from the store. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:22/block:1/line:1 | - | 22 | I like to exercise. I like to shop. I like to garden. But today I feel bored. | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:22/block:1/line:2 | - | 22 | When I feel bored I always look for something unusual to do! | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:30/block:3/line:5 | - | 30 | Yes, the right size for you is medium. Let's try again. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:33/block:2/line:2 | - | 33 | This is going to be a very long day. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:34/block:4/line:1 | - | 34 | When you arrive, please come to my office. I have important news to tell you. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:35/block:1/line:1 | - | 35 | {A}, I have good news and I have bad news. Which do you want to hear first? | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:37/block:2/line:4 | - | 37 | I'm going to teach children how to play the ukulele. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:38/block:3/line:2 | - | 38 | We always eat dinner together and sometimes we play board games. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:39/block:2/line:1 | - | 39 | I am busy on Monday night. I'm going to jog in the park with my friend. Do you jog? | too many words | 19 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:39/block:2/line:2 | - | 39 | Oh! I always jog. Well, sometimes I jog. Okay, I never jog. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:40/block:1/line:2 | - | 40 | I'm busy. I am going to tap dance with my friends Thursday night. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:42/block:2/line:4 | - | 42 | I'm going to teach children how to play the ukulele. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| scenes.json | session:9/block:1/line:2 | - | 9 | The gym is across from the lounge. It's next to the mailroom. Go that way. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:1/decks/clash/1/a/line | - | 1 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:1/decks/clash/2/a/line | - | 1 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:1/decks/cutin/0 | - | 1 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:1/decks/cutin/5 | - | 1 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:1/decks/reask/0 | - | 1 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:10/decks/clash/0/a/line | - | 10 | Oh, hi, everyone! Here in Washington, DC, the weather changes often. One day is cold and windy. But the next day is warm and sunny! So, every day I check the forecast. Hello, Phone? What is today’s temperature? | too many words | 38 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:10/decks/clash/3/b/line | - | 10 | Oh, Celsius. That is 65 degrees Fahrenheit. That’s warm. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:10/decks/cutin/1 | - | 10 | Oh, hi, everyone! Here in Washington, DC, the weather changes often. One day is cold and windy. But the next day is warm and sunny! So, every day I check the forecast. Hello, Phone? What is today’s temperature? | too many words | 38 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:10/decks/cutin/4 | - | 10 | Washington weather changes often. Remember to check the forecast -- the right forecast. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:11/decks/clash/0/a/line | - | 11 | Oh, hi, everyone! Here in Washington, DC, the weather changes often. One day is cold and windy. But the next day is warm and sunny! So, every day I check the forecast. Hello, Phone? What is today’s temperature? | too many words | 38 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:11/decks/clash/3/b/line | - | 11 | Oh, Celsius. That is 65 degrees Fahrenheit. That’s warm. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:11/decks/cutin/2 | - | 11 | Phone! It is not warm and sunny! It is cold and windy and snowy! | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:11/decks/cutin/3 | - | 11 | Anna, it is not cold, windy, or snowy. It is warm and sunny … in Mexico City, Mexico. | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:11/decks/reask/1 | - | 11 | Anna, it is not cold, windy, or snowy. It is warm and sunny … in Mexico City, Mexico. | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:11/decks/reask/2 | - | 11 | Phone! It is not warm and sunny! It is cold and windy and snowy! | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:12/decks/clash/0/a/line | - | 12 | Oh, hi, everyone! Here in Washington, DC, the weather changes often. One day is cold and windy. But the next day is warm and sunny! So, every day I check the forecast. Hello, Phone? What is today’s temperature? | too many words | 38 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:12/decks/clash/3/b/line | - | 12 | Oh, Celsius. That is 65 degrees Fahrenheit. That’s warm. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:12/decks/cutin/0 | - | 12 | Yes, Anna. Next time remember to check the right fore… | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:12/decks/cutin/1 | - | 12 | Oh, Celsius. That is 65 degrees Fahrenheit. That’s warm. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:12/decks/cutin/3 | - | 12 | Today the weather is warm and sunny -- great for seeing Washington, D.C. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:12/decks/reask/2 | - | 12 | Oh, hi, everyone! Here in Washington, DC, the weather changes often. One day is cold and windy. But the next day is warm and sunny! So, every day I check the forecast. Hello, Phone? What is today’s temperature? | too many words | 38 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:12/decks/reask/4 | - | 12 | Oh, Celsius. That is 65 degrees Fahrenheit. That’s warm. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:13/decks/clash/0/a/line | - | 13 | Hi Anna! I’m coming to your apartment. Where is your apartment? | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:13/decks/clash/2/b/line | - | 13 | Yes. Exit the Metro and turn right. Then at the bus station turn left. Then walk straight ahead. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:13/decks/clash/3/a/line | - | 13 | Yes. Exit the Metro and turn right. Then at the bus station turn left. Then walk straight ahead. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:13/decks/clash/3/b/line | - | 13 | Okay. Exit Metro, turn right, turn left, then go straight ahead? | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:13/decks/cutin/0 | - | 13 | Yes. Exit the Metro and turn right. Then at the bus station turn left. Then walk straight ahead. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:13/decks/cutin/2 | - | 13 | Hi! Today, my friend Ashley, is coming over. I am showing her my new apartment! Oh! That’s Ashley calling. | too many words | 19 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:13/decks/cutin/3 | - | 13 | Okay. Exit Metro, turn right, turn left, then go straight ahead? | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:14/decks/clash/0/a/line | - | 14 | Hi Anna! I’m coming to your apartment. Where is your apartment? | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:14/decks/clash/2/b/line | - | 14 | Yes. Exit the Metro and turn right. Then at the bus station turn left. Then walk straight ahead. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:14/decks/clash/3/a/line | - | 14 | Yes. Exit the Metro and turn right. Then at the bus station turn left. Then walk straight ahead. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:14/decks/clash/3/b/line | - | 14 | Okay. Exit Metro, turn right, turn left, then go straight ahead? | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:14/decks/cutin/4 | - | 14 | Okay, my apartment is across from a big department store. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:14/decks/reask/1 | - | 14 | Okay. Exit Metro, turn right, turn left, then go straight ahead? | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:14/decks/reask/2 | - | 14 | Hi Anna! I’m coming to your apartment. Where is your apartment? | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:14/decks/reask/4 | - | 14 | Yes. Exit the Metro and turn right. Then at the bus station turn left. Then walk straight ahead. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:15/decks/clash/0/a/line | - | 15 | Hi Anna! I’m coming to your apartment. Where is your apartment? | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:15/decks/clash/2/b/line | - | 15 | Yes. Exit the Metro and turn right. Then at the bus station turn left. Then walk straight ahead. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:15/decks/clash/3/a/line | - | 15 | Yes. Exit the Metro and turn right. Then at the bus station turn left. Then walk straight ahead. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:15/decks/clash/3/b/line | - | 15 | Okay. Exit Metro, turn right, turn left, then go straight ahead? | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:15/decks/cutin/1 | - | 15 | Anna, Which coffee shop? There are three coffee shops. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:15/decks/cutin/2 | - | 15 | Hi Anna! I’m coming to your apartment. Where is your apartment? | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:15/decks/cutin/3 | - | 15 | Yes. Exit the Metro and turn right. Then at the bus station turn left. Then walk straight ahead. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:15/decks/cutin/5 | - | 15 | Hi! Today, my friend Ashley, is coming over. I am showing her my new apartment! Oh! That’s Ashley calling. | too many words | 19 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:15/decks/reask/1 | - | 15 | Okay, my apartment is across from a big department store. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:15/decks/reask/2 | - | 15 | Anna, Which coffee shop? There are three coffee shops. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:15/decks/reask/3 | - | 15 | Hi! Today, my friend Ashley, is coming over. I am showing her my new apartment! Oh! That’s Ashley calling. | too many words | 19 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:16/decks/clash/0/a/line | - | 16 | Hello! DC is a city for walking. In our neighborhood, I can do all my errands. Marsha, before we get ice cream, I need to return three books to the library. Where is the library? | too many words | 35 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:16/decks/clash/2/b/line | - | 16 | Marsha, these are letters to my family and friends back home … four letters! Is there a post office near here? | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:16/decks/clash/3/a/line | - | 16 | Marsha, these are letters to my family and friends back home … four letters! Is there a post office near here? | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:16/decks/clash/3/b/line | - | 16 | Um, no. The post office is far from here. But there is a mailbox across from the store. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:16/decks/cutin/2 | - | 16 | *salon - n. a business that gives customers beauty treatments (such as haircuts) | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:16/decks/cutin/5 | - | 16 | I love my new neighborhood! Everything is near our apartment! Even hair salons*, and ice cream! | too many words | 16 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:16/decks/reask/0 | - | 16 | Marsha, these are letters to my family and friends back home … four letters! Is there a post office near here? | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:16/decks/reask/2 | - | 16 | Thank you, thank you letters, for sending my words… my love … to my family and friends - | too many words | 16 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:16/decks/reask/4 | - | 16 | Hello! DC is a city for walking. In our neighborhood, I can do all my errands. Marsha, before we get ice cream, I need to return three books to the library. Where is the library? | too many words | 35 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:17/decks/clash/0/a/line | - | 17 | Hello! DC is a city for walking. In our neighborhood, I can do all my errands. Marsha, before we get ice cream, I need to return three books to the library. Where is the library? | too many words | 35 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:17/decks/clash/2/b/line | - | 17 | Marsha, these are letters to my family and friends back home … four letters! Is there a post office near here? | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:17/decks/clash/3/a/line | - | 17 | Marsha, these are letters to my family and friends back home … four letters! Is there a post office near here? | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:17/decks/clash/3/b/line | - | 17 | Um, no. The post office is far from here. But there is a mailbox across from the store. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:17/decks/cutin/0 | - | 17 | Thank you, thank you letters, for sending my words… my love … to my family and friends - | too many words | 16 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:17/decks/cutin/2 | - | 17 | Marsha, these are letters to my family and friends back home … four letters! Is there a post office near here? | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:17/decks/cutin/3 | - | 17 | Um, no. The post office is far from here. But there is a mailbox across from the store. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:17/decks/cutin/4 | - | 17 | Hello! DC is a city for walking. In our neighborhood, I can do all my errands. Marsha, before we get ice cream, I need to return three books to the library. Where is the library? | too many words | 35 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:18/decks/clash/0/a/line | - | 18 | Hello! DC is a city for walking. In our neighborhood, I can do all my errands. Marsha, before we get ice cream, I need to return three books to the library. Where is the library? | too many words | 35 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:18/decks/clash/2/b/line | - | 18 | Marsha, these are letters to my family and friends back home … four letters! Is there a post office near here? | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:18/decks/clash/3/a/line | - | 18 | Marsha, these are letters to my family and friends back home … four letters! Is there a post office near here? | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:18/decks/clash/3/b/line | - | 18 | Um, no. The post office is far from here. But there is a mailbox across from the store. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:18/decks/reask/2 | - | 18 | I love my new neighborhood! Everything is near our apartment! Even hair salons*, and ice cream! | too many words | 16 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:19/decks/clash/0/a/line | - | 19 | Hello! Washington, D.C. has many beautiful parks. In fact, this park reminds me of my home very far away. | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:19/decks/cutin/0 | - | 19 | Her father's parents are from Italy. These grandparents speak Italian. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:19/decks/cutin/1 | - | 19 | They are my cousins. They are my Uncle John's daughter and son. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:19/decks/cutin/2 | - | 19 | They make jokes at a rodeo. They make people laugh. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:19/decks/reask/2 | - | 19 | Anna's brother has two children. They are Anna's niece and nephew. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:19/decks/reask/4 | - | 19 | Washington, DC is my new home. But I like remembering my old home, too. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:2/decks/clash/1/a/line | - | 2 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:2/decks/clash/2/a/line | - | 2 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:2/decks/cutin/1 | - | 2 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:2/decks/reask/0 | - | 2 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:2/decks/reask/2 | - | 2 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:20/decks/clash/0/a/line | - | 20 | Hello! Washington, D.C. has many beautiful parks. In fact, this park reminds me of my home very far away. | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:20/decks/cutin/0 | - | 20 | Anna's brother has two children. They are Anna's niece and nephew. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:20/decks/cutin/2 | - | 20 | Washington, DC is my new home. But I like remembering my old home, too. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:20/decks/cutin/4 | - | 20 | Uncle John has a daughter and a son. They are Anna's cousins. They raise sheep. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:20/decks/reask/0 | - | 20 | Her father's parents are from Italy. These grandparents speak Italian. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:20/decks/reask/3 | - | 20 | Anna's father has a brother. His name is John. Uncle John makes guitars. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:20/decks/reask/4 | - | 20 | They make jokes at a rodeo. They make people laugh. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:21/decks/clash/0/a/line | - | 21 | Hello! In Washington D.C. there are many things to do on a Sunday afternoon. I like to exercise. I like to shop. I like to garden. But today I feel bored. When I feel bored I always look for something unusual to do! I hear music. Let’s go see! What is going on here? | too many words | 55 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:21/decks/clash/0/b/line | - | 21 | It’s a big birthday party for the writer William Shakespeare. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:21/decks/clash/1/a/line | - | 21 | It’s a big birthday party for the writer William Shakespeare. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:21/decks/cutin/0 | - | 21 | This is sword fighting. I never sword fight. But today I am sword fighting because it’s Shakespeare’s birthday! | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:21/decks/cutin/1 | - | 21 | This is a drum band. I never listen to a drum band. But today I am listening to a drum band because it’s Shakespeare’s birthday! | too many words | 25 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:21/decks/cutin/2 | - | 21 | Today, I am not bored because … it is William Shakespeare’s birthday! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:21/decks/cutin/3 | - | 21 | There are many things to do in Washington, D.C. -- some usual, some unusual. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:21/decks/reask/0 | - | 21 | There are many things to do in Washington, D.C. -- some usual, some unusual. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:21/decks/reask/2 | - | 21 | Hello! In Washington D.C. there are many things to do on a Sunday afternoon. I like to exercise. I like to shop. I like to garden. But today I feel bored. When I feel bored I always look for something unusual to do! I hear music. Let’s go see! What is going on here? | too many words | 55 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:21/decks/reask/3 | - | 21 | In Washington, D.C. seeing a politician or even the President is usual. Seeing the Queen of England is very unusual! Your majesty! | too many words | 23 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:22/decks/clash/0/a/line | - | 22 | Hello! In Washington D.C. there are many things to do on a Sunday afternoon. I like to exercise. I like to shop. I like to garden. But today I feel bored. When I feel bored I always look for something unusual to do! I hear music. Let’s go see! What is going on here? | too many words | 55 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:22/decks/clash/0/b/line | - | 22 | It’s a big birthday party for the writer William Shakespeare. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:22/decks/clash/1/a/line | - | 22 | It’s a big birthday party for the writer William Shakespeare. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:22/decks/cutin/0 | - | 22 | This is sword fighting. I never sword fight. But today I am sword fighting because it’s Shakespeare’s birthday! | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:22/decks/cutin/1 | - | 22 | This is a drum band. I never listen to a drum band. But today I am listening to a drum band because it’s Shakespeare’s birthday! | too many words | 25 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:22/decks/cutin/2 | - | 22 | Today, I am not bored because … it is William Shakespeare’s birthday! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:22/decks/cutin/3 | - | 22 | There are many things to do in Washington, D.C. -- some usual, some unusual. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:22/decks/reask/0 | - | 22 | There are many things to do in Washington, D.C. -- some usual, some unusual. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:22/decks/reask/2 | - | 22 | Hello! In Washington D.C. there are many things to do on a Sunday afternoon. I like to exercise. I like to shop. I like to garden. But today I feel bored. When I feel bored I always look for something unusual to do! I hear music. Let’s go see! What is going on here? | too many words | 55 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:22/decks/reask/3 | - | 22 | In Washington, D.C. seeing a politician or even the President is usual. Seeing the Queen of England is very unusual! Your majesty! | too many words | 23 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:23/decks/clash/0/a/line | - | 23 | I am Genie! You want help. I am here to help you find the right clothes! | too many words | 16 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:23/decks/clash/1/b/line | - | 23 | No! Jeans and a t-shirt are too casual. How about something more formal? | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:23/decks/clash/2/a/line | - | 23 | Wow! Genie, this dress is beautiful. But it’s not the right size. It’s too small. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:23/decks/clash/2/b/line | - | 23 | Yes, it is too small. But green looks great on you. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:23/decks/clash/3/a/line | - | 23 | Take off the green dress. Let’s try a green shirt and a skirt. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:23/decks/clash/3/b/line | - | 23 | Oh, Genie! This green shirt is too large and this orange skirt is too orange. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:23/decks/cutin/0 | - | 23 | Wow! Genie, this dress is beautiful. But it’s not the right size. It’s too small. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:23/decks/cutin/2 | - | 23 | Take off the green dress. Let’s try a green shirt and a skirt. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:23/decks/cutin/4 | - | 23 | Tonight I am going to the theater with my friends. But I don’t know what clothes to wear. Maybe this magazine can help. | too many words | 23 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:23/decks/cutin/5 | - | 23 | Sorry, Anna. I have to help other friends. Go to the magazine if you want me to help again. | too many words | 19 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:23/decks/reask/1 | - | 23 | Tonight I am going to the theater with my friends. But I don’t know what clothes to wear. Maybe this magazine can help. | too many words | 23 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:23/decks/reask/3 | - | 23 | Sorry, Anna. I have to help other friends. Go to the magazine if you want me to help again. | too many words | 19 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:23/decks/reask/4 | - | 23 | Take off the green dress. Let’s try a green shirt and a skirt. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:24/decks/clash/0/a/line | - | 24 | I am Genie! You want help. I am here to help you find the right clothes! | too many words | 16 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:24/decks/clash/1/b/line | - | 24 | No! Jeans and a t-shirt are too casual. How about something more formal? | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:24/decks/clash/2/a/line | - | 24 | Wow! Genie, this dress is beautiful. But it’s not the right size. It’s too small. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:24/decks/clash/2/b/line | - | 24 | Yes, it is too small. But green looks great on you. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:24/decks/clash/3/a/line | - | 24 | Take off the green dress. Let’s try a green shirt and a skirt. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:24/decks/clash/3/b/line | - | 24 | Oh, Genie! This green shirt is too large and this orange skirt is too orange. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:24/decks/cutin/0 | - | 24 | Wow! Genie, this dress is beautiful. But it’s not the right size. It’s too small. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:24/decks/cutin/2 | - | 24 | Take off the green dress. Let’s try a green shirt and a skirt. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:24/decks/cutin/4 | - | 24 | Tonight I am going to the theater with my friends. But I don’t know what clothes to wear. Maybe this magazine can help. | too many words | 23 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:24/decks/cutin/5 | - | 24 | Sorry, Anna. I have to help other friends. Go to the magazine if you want me to help again. | too many words | 19 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:24/decks/reask/1 | - | 24 | Tonight I am going to the theater with my friends. But I don’t know what clothes to wear. Maybe this magazine can help. | too many words | 23 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:24/decks/reask/3 | - | 24 | Sorry, Anna. I have to help other friends. Go to the magazine if you want me to help again. | too many words | 19 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:24/decks/reask/4 | - | 24 | Take off the green dress. Let’s try a green shirt and a skirt. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:25/decks/clash/1/b/line | - | 25 | Busy as usual. Hey, do you wanna see a movie with me? | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:25/decks/clash/2/a/line | - | 25 | Busy as usual. Hey, do you wanna see a movie with me? | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:25/decks/clash/2/b/line | - | 25 | Sure! I never have time to see a movie. When? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:25/decks/clash/3/a/line | - | 25 | Sure! I never have time to see a movie. When? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:25/decks/cutin/0 | - | 25 | Busy as usual. Hey, do you wanna see a movie with me? | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:25/decks/cutin/1 | - | 25 | Marsha, it looks like we’ll never have time to see a movie. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:25/decks/cutin/2 | - | 25 | It’s Saturday afternoon. This is always when I do my errands. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:25/decks/cutin/3 | - | 25 | Yes. Friday nights are when I visit my parents. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:25/decks/cutin/4 | - | 25 | Let’s see …. I’m busy. I am going to tap dance with my friends Thursday night. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:25/decks/reask/0 | - | 25 | Most days of the week, people are really busy. But it’s important to find time to be with your friends! | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:25/decks/reask/1 | - | 25 | Yes. Friday nights are when I visit my parents. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:25/decks/reask/4 | - | 25 | Let’s see …. I’m busy. I am going to tap dance with my friends Thursday night. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:26/decks/clash/1/b/line | - | 26 | Busy as usual. Hey, do you wanna see a movie with me? | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:26/decks/clash/2/a/line | - | 26 | Busy as usual. Hey, do you wanna see a movie with me? | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:26/decks/clash/2/b/line | - | 26 | Sure! I never have time to see a movie. When? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:26/decks/clash/3/a/line | - | 26 | Sure! I never have time to see a movie. When? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:26/decks/cutin/0 | - | 26 | Busy as usual. Hey, do you wanna see a movie with me? | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:26/decks/cutin/1 | - | 26 | Marsha, it looks like we’ll never have time to see a movie. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:26/decks/cutin/2 | - | 26 | It’s Saturday afternoon. This is always when I do my errands. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:26/decks/cutin/3 | - | 26 | Yes. Friday nights are when I visit my parents. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:26/decks/cutin/4 | - | 26 | Let’s see …. I’m busy. I am going to tap dance with my friends Thursday night. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:26/decks/reask/0 | - | 26 | Most days of the week, people are really busy. But it’s important to find time to be with your friends! | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:26/decks/reask/1 | - | 26 | Yes. Friday nights are when I visit my parents. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:26/decks/reask/4 | - | 26 | Let’s see …. I’m busy. I am going to tap dance with my friends Thursday night. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:27/decks/clash/0/a/line | - | 27 | Hello, from Washington, D.C.! Today at work I am reading the news for the first time. I am really nervous. But my boss, Ms. Weaver, is here to help me. | too many words | 31 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:27/decks/clash/0/b/line | - | 27 | Now, Anna, remember. When we read the news we are always reading facts. We never show our feelings. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:27/decks/clash/1/a/line | - | 27 | Now, Anna, remember. When we read the news we are always reading facts. We never show our feelings. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:27/decks/cutin/1 | - | 27 | This is going to be a very long day. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:27/decks/cutin/3 | - | 27 | Okay. Let’s try the third story. She’s reading the third story! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:27/decks/cutin/4 | - | 27 | Right. But it is awesome that an 80-year-old grandmother wins a car race. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:27/decks/cutin/5 | - | 27 | What can I do, Ms. Weaver? Take out my feelings and put them here … on the news desk? | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:27/decks/reask/2 | - | 27 | What can I do, Ms. Weaver? Take out my feelings and put them here … on the news desk? | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:28/decks/clash/0/a/line | - | 28 | Hello, from Washington, D.C.! Today at work I am reading the news for the first time. I am really nervous. But my boss, Ms. Weaver, is here to help me. | too many words | 31 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:28/decks/clash/0/b/line | - | 28 | Now, Anna, remember. When we read the news we are always reading facts. We never show our feelings. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:28/decks/clash/1/a/line | - | 28 | Now, Anna, remember. When we read the news we are always reading facts. We never show our feelings. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:28/decks/cutin/1 | - | 28 | This is going to be a very long day. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:28/decks/cutin/3 | - | 28 | Okay. Let’s try the third story. She’s reading the third story! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:28/decks/cutin/4 | - | 28 | Right. But it is awesome that an 80-year-old grandmother wins a car race. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:28/decks/cutin/5 | - | 28 | What can I do, Ms. Weaver? Take out my feelings and put them here … on the news desk? | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:28/decks/reask/2 | - | 28 | What can I do, Ms. Weaver? Take out my feelings and put them here … on the news desk? | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:29/decks/clash/0/a/line | - | 29 | When you arrive, please come to my office. I have important news to tell you. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:29/decks/clash/0/b/line | - | 29 | Of course. Good-bye. My boss has news for me. The question is: Is it good news or bad news? | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:29/decks/clash/1/a/line | - | 29 | Anna, I have good news and I have bad news. Which do you want to hear first? | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:29/decks/clash/2/b/line | - | 29 | The bad news is you are not good at reading the news. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:29/decks/clash/3/a/line | - | 29 | The bad news is you are not good at reading the news. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:29/decks/cutin/1 | - | 29 | Of course. Good-bye. My boss has news for me. The question is: Is it good news or bad news? | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:29/decks/cutin/2 | - | 29 | Anna, I have good news and I have bad news. Which do you want to hear first? | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:29/decks/cutin/3 | - | 29 | Okay. You are not firing me. I am not reading the news. What will I be doing? | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:29/decks/cutin/4 | - | 29 | I have tons of ideas! I can show children what it’s like in outer space ... | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:29/decks/cutin/5 | - | 29 | You start next month. Start thinking of ideas for the show. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:29/decks/reask/0 | - | 29 | Of course. Good-bye. My boss has news for me. The question is: Is it good news or bad news? | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:29/decks/reask/1 | - | 29 | Well, you are good at asking questions. You are good at talking to people. You are good at showing your feelings. And you are great at being silly. | too many words | 28 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:29/decks/reask/2 | - | 29 | Those are great ideas, Anna. Please go think of more … at your desk. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:29/decks/reask/4 | - | 29 | Thank you, Ms. Weaver. But what does all that mean? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:3/decks/clash/1/a/line | - | 3 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:3/decks/clash/2/a/line | - | 3 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:3/decks/cutin/0 | - | 3 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:3/decks/cutin/2 | - | 3 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:3/decks/reask/2 | - | 3 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:3/decks/reask/4 | - | 3 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:30/decks/clash/0/a/line | - | 30 | When you arrive, please come to my office. I have important news to tell you. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:30/decks/clash/0/b/line | - | 30 | Of course. Good-bye. My boss has news for me. The question is: Is it good news or bad news? | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:30/decks/clash/1/a/line | - | 30 | Anna, I have good news and I have bad news. Which do you want to hear first? | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:30/decks/clash/2/b/line | - | 30 | The bad news is you are not good at reading the news. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:30/decks/clash/3/a/line | - | 30 | The bad news is you are not good at reading the news. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:30/decks/cutin/1 | - | 30 | Of course. Good-bye. My boss has news for me. The question is: Is it good news or bad news? | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:30/decks/cutin/2 | - | 30 | Anna, I have good news and I have bad news. Which do you want to hear first? | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:30/decks/cutin/3 | - | 30 | Okay. You are not firing me. I am not reading the news. What will I be doing? | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:30/decks/cutin/4 | - | 30 | I have tons of ideas! I can show children what it’s like in outer space ... | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:30/decks/cutin/5 | - | 30 | You start next month. Start thinking of ideas for the show. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:30/decks/reask/0 | - | 30 | Of course. Good-bye. My boss has news for me. The question is: Is it good news or bad news? | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:30/decks/reask/1 | - | 30 | Well, you are good at asking questions. You are good at talking to people. You are good at showing your feelings. And you are great at being silly. | too many words | 28 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:30/decks/reask/2 | - | 30 | Those are great ideas, Anna. Please go think of more … at your desk. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:30/decks/reask/4 | - | 30 | Thank you, Ms. Weaver. But what does all that mean? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:31/decks/clash/1/a/line | - | 31 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:31/decks/clash/2/a/line | - | 31 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:31/decks/cutin/1 | - | 31 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:31/decks/cutin/3 | - | 31 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:31/decks/reask/4 | - | 31 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:32/decks/clash/0/a/line | - | 32 | Hi there! I’m Anna and I live in Washington, D.C. Every day I learn more about this great city. People in Washington like to work out! Oh, hi, Pete. How’s it going? | too many words | 33 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:32/decks/clash/0/b/line | - | 32 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:32/decks/clash/1/a/line | - | 32 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:32/decks/clash/1/b/line | - | 32 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:32/decks/clash/2/a/line | - | 32 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:32/decks/clash/2/b/line | - | 32 | The gym is across from the lounge. It’s next to the mailroom. Go that way. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:32/decks/cutin/1 | - | 32 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:32/decks/cutin/4 | - | 32 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:32/decks/reask/0 | - | 32 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:32/decks/reask/1 | - | 32 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:32/decks/reask/3 | - | 32 | Hi there! I’m Anna and I live in Washington, D.C. Every day I learn more about this great city. People in Washington like to work out! Oh, hi, Pete. How’s it going? | too many words | 33 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:32/decks/reask/4 | - | 32 | The gym is across from the lounge. It is behind the lobby. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:33/decks/clash/0/a/line | - | 33 | Hi Anna! I’m coming to your apartment. Where is your apartment? | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:33/decks/clash/2/b/line | - | 33 | Yes. Exit the Metro and turn right. Then at the bus station turn left. Then walk straight ahead. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:33/decks/clash/3/a/line | - | 33 | Yes. Exit the Metro and turn right. Then at the bus station turn left. Then walk straight ahead. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:33/decks/clash/3/b/line | - | 33 | Okay. Exit Metro, turn right, turn left, then go straight ahead? | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:33/decks/cutin/0 | - | 33 | Okay. Exit Metro, turn right, turn left, then go straight ahead? | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:34/decks/clash/0/a/line | - | 34 | Hello! Washington, D.C. has many beautiful parks. In fact, this park reminds me of my home very far away. | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:34/decks/cutin/0 | - | 34 | Anna's mother's parents live in California. These grandparents have a farm and raise horses. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:34/decks/cutin/1 | - | 34 | He's a chicken farmer. And makes guitars. He's awesome, and I'm his favorite niece. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:34/decks/cutin/2 | - | 34 | Hello! Washington, D.C. has many beautiful parks. In fact, this park reminds me of my home very far away. | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:34/decks/cutin/3 | - | 34 | This is my mother and this is my father. They are rodeo clowns. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:34/decks/cutin/5 | - | 34 | This is a family tree. Anna tells Marsha about her parents. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:34/decks/reask/0 | - | 34 | Anna's mother's parents live in California. These grandparents have a farm and raise horses. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:34/decks/reask/4 | - | 34 | Uncle John has a daughter and a son. They are Anna's cousins. They raise sheep. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:35/decks/clash/0/a/line | - | 35 | I am Genie! You want help. I am here to help you find the right clothes! | too many words | 16 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:35/decks/clash/1/b/line | - | 35 | No! Jeans and a t-shirt are too casual. How about something more formal? | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:35/decks/clash/2/a/line | - | 35 | Wow! Genie, this dress is beautiful. But it’s not the right size. It’s too small. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:35/decks/clash/2/b/line | - | 35 | Yes, it is too small. But green looks great on you. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:35/decks/clash/3/a/line | - | 35 | Take off the green dress. Let’s try a green shirt and a skirt. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:35/decks/clash/3/b/line | - | 35 | Oh, Genie! This green shirt is too large and this orange skirt is too orange. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:35/decks/cutin/1 | - | 35 | Those clothes look great … for a man! Something is wrong. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:35/decks/cutin/2 | - | 35 | Her clothes are beautiful! I really want a friend like her to help me. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:35/decks/cutin/4 | - | 35 | Genie, these clothes look and feel great! Let’s go to the theater! | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:35/decks/cutin/5 | - | 35 | Wow! Genie, this dress is beautiful. But it’s not the right size. It’s too small. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:35/decks/reask/0 | - | 35 | There are many places in DC to go for a great evening out! And it’s nice to have a friend to help me look my best. Until next time! Bye! | too many words | 30 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:35/decks/reask/1 | - | 35 | Yes, the right size for you is medium. Let’s try again. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:35/decks/reask/2 | - | 35 | Her clothes are beautiful! I really want a friend like her to help me. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:35/decks/reask/3 | - | 35 | Those clothes look great … for a man! Something is wrong. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:36/decks/clash/0/a/line | - | 36 | Hello, from Washington, D.C.! Today at work I am reading the news for the first time. I am really nervous. But my boss, Ms. Weaver, is here to help me. | too many words | 31 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:36/decks/clash/0/b/line | - | 36 | Now, Anna, remember. When we read the news we are always reading facts. We never show our feelings. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:36/decks/clash/1/a/line | - | 36 | Now, Anna, remember. When we read the news we are always reading facts. We never show our feelings. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:36/decks/cutin/0 | - | 36 | It is about a lost duckling. The duck's mother cannot find him. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:36/decks/cutin/3 | - | 36 | Hello , and welcome to The News. In Indiana, a grandmother is the first 80-year-old woman to win The Race Car 500. | too many words | 23 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:36/decks/cutin/5 | - | 36 | She rarely talks to reporters. But when she does, she often says, “Nothing can stop me now!” | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:36/decks/reask/0 | - | 36 | Right. But it is awesome that an 80-year-old grandmother wins a car race. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:36/decks/reask/1 | - | 36 | No, no, no! Anna, you cannot say you are angry! This is The News!!! | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:36/decks/reask/2 | - | 36 | Hello, from Washington, D.C.! Today at work I am reading the news for the first time. I am really nervous. But my boss, Ms. Weaver, is here to help me. | too many words | 31 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:36/decks/reask/4 | - | 36 | A new book is very popular with children and families. This is it. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:37/decks/clash/1/a/line | - | 37 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:37/decks/clash/2/a/line | - | 37 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:37/decks/cutin/1 | - | 37 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:37/decks/cutin/3 | - | 37 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:37/decks/reask/4 | - | 37 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:38/decks/clash/1/a/line | - | 38 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:38/decks/clash/2/a/line | - | 38 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:38/decks/cutin/2 | - | 38 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:38/decks/cutin/4 | - | 38 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:38/decks/reask/1 | - | 38 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:39/decks/clash/1/a/line | - | 39 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:39/decks/clash/2/a/line | - | 39 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:39/decks/cutin/3 | - | 39 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:39/decks/cutin/5 | - | 39 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:39/decks/reask/1 | - | 39 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:39/decks/reask/3 | - | 39 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:4/decks/clash/0/a/line | - | 4 | Marsha, I am in the kitchen! It is a beautiful kitchen! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:4/decks/cutin/0 | - | 4 | Hello, everyone! Today my friend Marsha is at her friend's house. She says it is beautiful. I want to see this house! Here we are! | too many words | 25 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:4/decks/cutin/2 | - | 4 | Marsha, I am in the bathroom! I wash in the bathroom. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:4/decks/cutin/4 | - | 4 | I am in the bedroom. We sleep in the bedroom. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:4/decks/reask/2 | - | 4 | I am in the bedroom. We sleep in the bedroom. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:4/decks/reask/4 | - | 4 | Hello, everyone! Today my friend Marsha is at her friend's house. She says it is beautiful. I want to see this house! Here we are! | too many words | 25 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:40/decks/clash/0/a/line | - | 40 | Marsha, I am in the kitchen! It is a beautiful kitchen! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:40/decks/cutin/1 | - | 40 | Marsha, I am in the kitchen! It is a beautiful kitchen! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:40/decks/cutin/4 | - | 40 | Hello, everyone! Today my friend Marsha is at her friend's house. She says it is beautiful. I want to see this house! Here we are! | too many words | 25 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:40/decks/reask/0 | - | 40 | Hello, everyone! Today my friend Marsha is at her friend's house. She says it is beautiful. I want to see this house! Here we are! | too many words | 25 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:40/decks/reask/2 | - | 40 | Marsha, I am in the kitchen! It is a beautiful kitchen! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:41/decks/clash/0/a/line | - | 41 | Marsha, I am in the kitchen! It is a beautiful kitchen! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:41/decks/cutin/0 | - | 41 | Marsha, I am in the bathroom! I wash in the bathroom. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:41/decks/cutin/2 | - | 41 | I am in the bedroom. We sleep in the bedroom. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:41/decks/reask/0 | - | 41 | Marsha, I am in the bathroom! I wash in the bathroom. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:41/decks/reask/4 | - | 41 | I am in the bedroom. We sleep in the bedroom. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:42/decks/clash/0/a/line | - | 42 | Marsha, I am in the kitchen! It is a beautiful kitchen! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:42/decks/cutin/0 | - | 42 | Marsha, I am in the kitchen! It is a beautiful kitchen! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:42/decks/cutin/3 | - | 42 | Hello, everyone! Today my friend Marsha is at her friend's house. She says it is beautiful. I want to see this house! Here we are! | too many words | 25 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:42/decks/cutin/5 | - | 42 | Marsha, I am in the bathroom! I wash in the bathroom. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:42/decks/reask/1 | - | 42 | Hello, everyone! Today my friend Marsha is at her friend's house. She says it is beautiful. I want to see this house! Here we are! | too many words | 25 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:42/decks/reask/3 | - | 42 | Marsha, I am in the kitchen! It is a beautiful kitchen! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:43/decks/clash/0/a/line | - | 43 | Hi there! I’m Anna and I live in Washington, D.C. Every day I learn more about this great city. People in Washington like to work out! Oh, hi, Pete. How’s it going? | too many words | 33 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:43/decks/clash/0/b/line | - | 43 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:43/decks/clash/1/a/line | - | 43 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:43/decks/clash/1/b/line | - | 43 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:43/decks/clash/2/a/line | - | 43 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:43/decks/clash/2/b/line | - | 43 | The gym is across from the lounge. It’s next to the mailroom. Go that way. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:43/decks/cutin/1 | - | 43 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:43/decks/cutin/4 | - | 43 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:43/decks/reask/0 | - | 43 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:43/decks/reask/1 | - | 43 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:43/decks/reask/3 | - | 43 | Hi there! I’m Anna and I live in Washington, D.C. Every day I learn more about this great city. People in Washington like to work out! Oh, hi, Pete. How’s it going? | too many words | 33 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:43/decks/reask/4 | - | 43 | The gym is across from the lounge. It is behind the lobby. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:44/decks/clash/0/a/line | - | 44 | Hi there! I’m Anna and I live in Washington, D.C. Every day I learn more about this great city. People in Washington like to work out! Oh, hi, Pete. How’s it going? | too many words | 33 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:44/decks/clash/0/b/line | - | 44 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:44/decks/clash/1/a/line | - | 44 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:44/decks/clash/1/b/line | - | 44 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:44/decks/clash/2/a/line | - | 44 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:44/decks/clash/2/b/line | - | 44 | The gym is across from the lounge. It’s next to the mailroom. Go that way. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:44/decks/cutin/0 | - | 44 | Hi there! I’m Anna and I live in Washington, D.C. Every day I learn more about this great city. People in Washington like to work out! Oh, hi, Pete. How’s it going? | too many words | 33 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:44/decks/cutin/4 | - | 44 | The gym is across from the lounge. It’s next to the mailroom. Go that way. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:44/decks/cutin/5 | - | 44 | The gym is across from the lounge. It is behind the lobby. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:44/decks/reask/2 | - | 44 | This is not a gym. This is a rooftop. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:44/decks/reask/4 | - | 44 | The gym is across from the lounge. It’s next to the mailroom. Go that way. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:45/decks/clash/0/a/line | - | 45 | Hi there! I’m Anna and I live in Washington, D.C. Every day I learn more about this great city. People in Washington like to work out! Oh, hi, Pete. How’s it going? | too many words | 33 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:45/decks/clash/0/b/line | - | 45 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:45/decks/clash/1/a/line | - | 45 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:45/decks/clash/1/b/line | - | 45 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:45/decks/clash/2/a/line | - | 45 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:45/decks/clash/2/b/line | - | 45 | The gym is across from the lounge. It’s next to the mailroom. Go that way. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:45/decks/cutin/0 | - | 45 | This is not the gym. This is a parking garage. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:45/decks/cutin/1 | - | 45 | This is not a gym. This is a rooftop. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:45/decks/cutin/5 | - | 45 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:45/decks/reask/4 | - | 45 | This is not the gym. This is a parking garage. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:46/decks/clash/0/a/line | - | 46 | Oh, hi, everyone! Here in Washington, DC, the weather changes often. One day is cold and windy. But the next day is warm and sunny! So, every day I check the forecast. Hello, Phone? What is today’s temperature? | too many words | 38 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:46/decks/clash/3/b/line | - | 46 | Oh, Celsius. That is 65 degrees Fahrenheit. That’s warm. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:46/decks/cutin/2 | - | 46 | Oh, hi, everyone! Here in Washington, DC, the weather changes often. One day is cold and windy. But the next day is warm and sunny! So, every day I check the forecast. Hello, Phone? What is today’s temperature? | too many words | 38 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:46/decks/cutin/5 | - | 46 | Washington weather changes often. Remember to check the forecast -- the right forecast. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:46/decks/reask/1 | - | 46 | Washington weather changes often. Remember to check the forecast -- the right forecast. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:46/decks/reask/2 | - | 46 | Today the weather is warm and sunny -- great for seeing Washington, D.C. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:46/decks/reask/3 | - | 46 | Yes, Anna. Next time remember to check the right fore… | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:47/decks/clash/0/a/line | - | 47 | Oh, hi, everyone! Here in Washington, DC, the weather changes often. One day is cold and windy. But the next day is warm and sunny! So, every day I check the forecast. Hello, Phone? What is today’s temperature? | too many words | 38 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:47/decks/clash/3/b/line | - | 47 | Oh, Celsius. That is 65 degrees Fahrenheit. That’s warm. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:47/decks/cutin/3 | - | 47 | Phone! It is not warm and sunny! It is cold and windy and snowy! | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:47/decks/cutin/4 | - | 47 | Anna, it is not cold, windy, or snowy. It is warm and sunny … in Mexico City, Mexico. | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:48/decks/clash/0/a/line | - | 48 | Oh, hi, everyone! Here in Washington, DC, the weather changes often. One day is cold and windy. But the next day is warm and sunny! So, every day I check the forecast. Hello, Phone? What is today’s temperature? | too many words | 38 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:48/decks/clash/3/b/line | - | 48 | Oh, Celsius. That is 65 degrees Fahrenheit. That’s warm. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:48/decks/cutin/1 | - | 48 | Yes, Anna. Next time remember to check the right fore… | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:48/decks/cutin/2 | - | 48 | Oh, Celsius. That is 65 degrees Fahrenheit. That’s warm. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:48/decks/cutin/4 | - | 48 | Today the weather is warm and sunny -- great for seeing Washington, D.C. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:48/decks/reask/0 | - | 48 | Anna, it is not cold, windy, or snowy. It is warm and sunny … in Mexico City, Mexico. | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:48/decks/reask/1 | - | 48 | Phone! It is not warm and sunny! It is cold and windy and snowy! | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:5/decks/clash/0/a/line | - | 5 | Marsha, I am in the kitchen! It is a beautiful kitchen! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:5/decks/cutin/2 | - | 5 | Marsha, I am in the kitchen! It is a beautiful kitchen! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:5/decks/cutin/5 | - | 5 | Hello, everyone! Today my friend Marsha is at her friend's house. She says it is beautiful. I want to see this house! Here we are! | too many words | 25 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:5/decks/reask/1 | - | 5 | Marsha, I am in the kitchen! It is a beautiful kitchen! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:5/decks/reask/4 | - | 5 | Marsha, I am in the bathroom! I wash in the bathroom. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:6/decks/clash/0/a/line | - | 6 | Marsha, I am in the kitchen! It is a beautiful kitchen! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:6/decks/cutin/1 | - | 6 | Marsha, I am in the bathroom! I wash in the bathroom. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:6/decks/cutin/3 | - | 6 | I am in the bedroom. We sleep in the bedroom. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:6/decks/reask/3 | - | 6 | I am in the bedroom. We sleep in the bedroom. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:7/decks/clash/0/a/line | - | 7 | Hi there! I’m Anna and I live in Washington, D.C. Every day I learn more about this great city. People in Washington like to work out! Oh, hi, Pete. How’s it going? | too many words | 33 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:7/decks/clash/0/b/line | - | 7 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:7/decks/clash/1/a/line | - | 7 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:7/decks/clash/1/b/line | - | 7 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:7/decks/clash/2/a/line | - | 7 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:7/decks/clash/2/b/line | - | 7 | The gym is across from the lounge. It’s next to the mailroom. Go that way. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:7/decks/cutin/3 | - | 7 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:7/decks/reask/0 | - | 7 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:7/decks/reask/2 | - | 7 | Hi there! I’m Anna and I live in Washington, D.C. Every day I learn more about this great city. People in Washington like to work out! Oh, hi, Pete. How’s it going? | too many words | 33 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:7/decks/reask/3 | - | 7 | The gym is across from the lounge. It is behind the lobby. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:8/decks/clash/0/a/line | - | 8 | Hi there! I’m Anna and I live in Washington, D.C. Every day I learn more about this great city. People in Washington like to work out! Oh, hi, Pete. How’s it going? | too many words | 33 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:8/decks/clash/0/b/line | - | 8 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:8/decks/clash/1/a/line | - | 8 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:8/decks/clash/1/b/line | - | 8 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:8/decks/clash/2/a/line | - | 8 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:8/decks/clash/2/b/line | - | 8 | The gym is across from the lounge. It’s next to the mailroom. Go that way. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:8/decks/cutin/0 | - | 8 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:8/decks/cutin/2 | - | 8 | Hi there! I’m Anna and I live in Washington, D.C. Every day I learn more about this great city. People in Washington like to work out! Oh, hi, Pete. How’s it going? | too many words | 33 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:8/decks/reask/1 | - | 8 | This is not a gym. This is a rooftop. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:8/decks/reask/3 | - | 8 | The gym is across from the lounge. It’s next to the mailroom. Go that way. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:9/decks/clash/0/a/line | - | 9 | Hi there! I’m Anna and I live in Washington, D.C. Every day I learn more about this great city. People in Washington like to work out! Oh, hi, Pete. How’s it going? | too many words | 33 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:9/decks/clash/0/b/line | - | 9 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:9/decks/clash/1/a/line | - | 9 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:9/decks/clash/1/b/line | - | 9 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:9/decks/clash/2/a/line | - | 9 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:9/decks/clash/2/b/line | - | 9 | The gym is across from the lounge. It’s next to the mailroom. Go that way. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:9/decks/cutin/0 | - | 9 | The gym is across from the lounge. It’s next to the mailroom. Go that way. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:9/decks/cutin/1 | - | 9 | The gym is across from the lounge. It is behind the lobby. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:9/decks/cutin/2 | - | 9 | This is not the gym. This is a parking garage. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:9/decks/cutin/3 | - | 9 | This is not a gym. This is a rooftop. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| sessions.json | session:9/decks/reask/3 | - | 9 | This is not the gym. This is a parking garage. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-01#5 | - | 1 | Let's try that again. I'm Anna. Nice to meet you. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-01#8 | - | 1 | Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-05#1 | - | 4 | Hello, everyone! Today my friend Marsha is at her friend's house. She says it is beautiful. I want to see this house! Here we are! | too many words | 25 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-05#10 | - | 4 | Marsha, I am in the bathroom! I wash in the bathroom. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-05#11 | - | 4 | I am in the bedroom. We sleep in the bedroom. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-05#2 | - | 4 | Marsha, I am in the kitchen! It is a beautiful kitchen! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-06#1 | - | 7 | Hi there! I’m Anna and I live in Washington, D.C. Every day I learn more about this great city. People in Washington like to work out! Oh, hi, Pete. How’s it going? | too many words | 33 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-06#16 | - | 7 | The gym is across from the lounge. It is behind the lobby. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-06#2 | - | 7 | Hi, Anna. It’s going great. How’s it going with you? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-06#22 | - | 7 | This is not the gym. This is a parking garage. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-06#25 | - | 7 | This is not a gym. This is a rooftop. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-06#3 | - | 7 | Things are awesome! Pete, I want to work out. Where is the gym? | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-06#4 | - | 7 | The gym is across from the lounge. It’s next to the mailroom. Go that way. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-09#1 | - | 10 | Oh, hi, everyone! Here in Washington, DC, the weather changes often. One day is cold and windy. But the next day is warm and sunny! So, every day I check the forecast. Hello, Phone? What is today’s temperature? | too many words | 38 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-09#16 | - | 10 | Today the weather is warm and sunny -- great for seeing Washington, D.C. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-09#17 | - | 10 | Phone! It is not warm and sunny! It is cold and windy and snowy! | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-09#18 | - | 10 | Anna, it is not cold, windy, or snowy. It is warm and sunny … in Mexico City, Mexico. | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-09#20 | - | 10 | Washington weather changes often. Remember to check the forecast -- the right forecast. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-09#21 | - | 10 | Yes, Anna. Next time remember to check the right fore… | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-09#5 | - | 10 | Oh, Celsius. That is 65 degrees Fahrenheit. That’s warm. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-10#1 | - | 13 | Hi! Today, my friend Ashley, is coming over. I am showing her my new apartment! Oh! That’s Ashley calling. | too many words | 19 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-10#13 | - | 13 | Anna, Which coffee shop? There are three coffee shops. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-10#14 | - | 13 | Okay, my apartment is across from a big department store. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-10#4 | - | 13 | Hi Anna! I’m coming to your apartment. Where is your apartment? | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-10#7 | - | 13 | Yes. Exit the Metro and turn right. Then at the bus station turn left. Then walk straight ahead. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-10#8 | - | 13 | Okay. Exit Metro, turn right, turn left, then go straight ahead? | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-11#1 | - | 16 | Hello! DC is a city for walking. In our neighborhood, I can do all my errands. Marsha, before we get ice cream, I need to return three books to the library. Where is the library? | too many words | 35 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-11#21 | - | 16 | Thank you, thank you letters, for sending my words… my love … to my family and friends - | too many words | 16 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-11#26 | - | 16 | I love my new neighborhood! Everything is near our apartment! Even hair salons*, and ice cream! | too many words | 16 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-11#28 | - | 16 | *salon - n. a business that gives customers beauty treatments (such as haircuts) | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-11#7 | - | 16 | Marsha, these are letters to my family and friends back home … four letters! Is there a post office near here? | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-11#8 | - | 16 | Um, no. The post office is far from here. But there is a mailbox across from the store. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#1 | - | 19 | Hello! Washington, D.C. has many beautiful parks. In fact, this park reminds me of my home very far away. | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#10 | - | 19 | This is my mother and this is my father. They are rodeo clowns. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#12 | - | 19 | They make jokes at a rodeo. They make people laugh. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#15 | - | 19 | That is my Aunt Lavender. She is my mom's sister. She loves gardening and makes spoons. | too many words | 16 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#19 | - | 19 | Oh! This is my Uncle John. He is my father's brother. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#21 | - | 19 | He's a chicken farmer. And makes guitars. He's awesome, and I'm his favorite niece. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#23 | - | 19 | They are my cousins. They are my Uncle John's daughter and son. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#27 | - | 19 | Thanks for showing me your family photos. Your family is very different. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#28 | - | 19 | I do feel better. Thanks for listening. I have many more photos! | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#30 | - | 19 | Washington, DC is my new home. But I like remembering my old home, too. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#32 | - | 19 | This is a family tree. Anna tells Marsha about her parents. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#34 | - | 19 | Her father's parents are from Italy. These grandparents speak Italian. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#35 | - | 19 | Anna's mother's parents live in California. These grandparents have a farm and raise horses. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#36 | - | 19 | Anna's mother's sister is Aunt Lavender. She loves gardening. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#37 | - | 19 | Anna's father has a brother. His name is John. Uncle John makes guitars. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#38 | - | 19 | Uncle John has a daughter and a son. They are Anna's cousins. They raise sheep. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-12#39 | - | 19 | Anna's brother has two children. They are Anna's niece and nephew. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-13#1 | - | 21 | Hello! In Washington D.C. there are many things to do on a Sunday afternoon. I like to exercise. I like to shop. I like to garden. But today I feel bored. When I feel bored I always look for something unusual to do! I hear music. Let’s go see! What is going on here? | too many words | 55 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-13#10 | - | 21 | In Washington, D.C. seeing a politician or even the President is usual. Seeing the Queen of England is very unusual! Your majesty! | too many words | 23 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-13#11 | - | 21 | This is sword fighting. I never sword fight. But today I am sword fighting because it’s Shakespeare’s birthday! | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-13#12 | - | 21 | There are many things to do in Washington, D.C. -- some usual, some unusual. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-13#13 | - | 21 | Today, I am not bored because … it is William Shakespeare’s birthday! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-13#2 | - | 21 | It’s a big birthday party for the writer William Shakespeare. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-13#7 | - | 21 | This is a drum band. I never listen to a drum band. But today I am listening to a drum band because it’s Shakespeare’s birthday! | too many words | 25 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-13#8 | - | 21 | This is a puppet show. I never watch puppet shows. But today I am watching a puppet show because it’s Shakespeare’s birthday! | too many words | 22 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-14#1 | - | 23 | Tonight I am going to the theater with my friends. But I don’t know what clothes to wear. Maybe this magazine can help. | too many words | 23 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-14#11 | - | 23 | Take off the green dress. Let’s try a green shirt and a skirt. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-14#12 | - | 23 | Oh, Genie! This green shirt is too large and this orange skirt is too orange. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-14#13 | - | 23 | Yes, the right size for you is medium. Let’s try again. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-14#17 | - | 23 | These clothes are formal: a suit jacket, a dress shirt and a tie! They look great! | too many words | 16 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-14#18 | - | 23 | Those clothes look great … for a man! Something is wrong. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-14#2 | - | 23 | Her clothes are beautiful! I really want a friend like her to help me. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-14#21 | - | 23 | Oh. Thanks! Now these clothes look great on you! | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-14#22 | - | 23 | They do! Um, Genie, can you put on a gold belt? | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-14#29 | - | 23 | Genie, these clothes look and feel great! Let’s go to the theater! | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-14#30 | - | 23 | Sorry, Anna. I have to help other friends. Go to the magazine if you want me to help again. | too many words | 19 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-14#33 | - | 23 | There are many places in DC to go for a great evening out! And it’s nice to have a friend to help me look my best. Until next time! Bye! | too many words | 30 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-14#4 | - | 23 | I am Genie! You want help. I am here to help you find the right clothes! | too many words | 16 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-14#6 | - | 23 | No! Jeans and a t-shirt are too casual. How about something more formal? | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-14#8 | - | 23 | Wow! Genie, this dress is beautiful. But it’s not the right size. It’s too small. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-14#9 | - | 23 | Yes, it is too small. But green looks great on you. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-17#10 | - | 25 | Yes. Friday nights are when I visit my parents. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-17#12 | - | 25 | We always eat dinner together and sometimes we play board games. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-17#13 | - | 25 | Playing board games is fun, too! The word game Scrabble is my favorite. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-17#16 | - | 25 | I am busy on Monday night. I’m going to jog in the park with my friend. Do you jog? | too many words | 19 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-17#17 | - | 25 | Oh! I always jog. Well, sometimes I jog. Okay, I never jog. But I will try because it is good for you. | too many words | 22 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-17#20 | - | 25 | Wednesday night I am not busy. Oh, no, wait. This Wednesday night I will be busy. | too many words | 16 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-17#22 | - | 25 | I’m going to teach children how to play the ukulele. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-17#23 | - | 25 | Now, children, play “C.” Good. I like your “C.” | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-17#25 | - | 25 | Marsha, it looks like we’ll never have time to see a movie. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-17#27 | - | 25 | It’s Saturday afternoon. This is always when I do my errands. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-17#28 | - | 25 | Okay, but the new Star Wars movie is gonna start in 30 minutes. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-17#3 | - | 25 | Busy as usual. Hey, do you wanna see a movie with me? | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-17#30 | - | 25 | Most days of the week, people are really busy. But it’s important to find time to be with your friends! | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-17#32 | - | 25 | * Connect Four is a two-player connection game using colored discs. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-17#4 | - | 25 | Sure! I never have time to see a movie. When? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-17#6 | - | 25 | Let’s see …. I’m busy. I am going to tap dance with my friends Thursday night. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#1 | - | 27 | Hello, from Washington, D.C.! Today at work I am reading the news for the first time. I am really nervous. But my boss, Ms. Weaver, is here to help me. | too many words | 31 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#10 | - | 27 | Stop! Anna, when you say the words “duck” and “duckling” you look really sad. | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#13 | - | 27 | Sad is not a fact. Sorry. Let me try again. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#15 | - | 27 | Hello, and welcome to The News. A new book is very popular with children and families. This is it. | too many words | 19 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#16 | - | 27 | It is about a lost duckling. The duck’s mother can not find ‘im. But a family gives him a home. | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#19 | - | 27 | I have an idea. Let’s read the second story. She’s reading the second story. And … go! | too many words | 16 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#2 | - | 27 | Now, Anna, remember. When we read the news we are always reading facts. We never show our feelings. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#20 | - | 27 | Hello , and welcome to The News. In Indiana, a grandmother is the first 80-year-old woman to win The Race Car 500. | too many words | 23 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#23 | - | 27 | Right. But it is awesome that an 80-year-old grandmother wins a car race. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#26 | - | 27 | Hello, and welcome to The News. In Indiana, a grandmother is the first 80-year-old woman to win The Race Car 500. | too many words | 23 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#27 | - | 27 | She rarely talks to reporters. But when she does, she often says, “Nothing can stop me now!” | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#29 | - | 27 | Stop, stop, stop!! Anna, you cannot say you are happy. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#33 | - | 27 | This is the News. Happy and sad are feelings. You can’t have them in The News. | too many words | 16 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#35 | - | 27 | Okay. Let’s try the third story. She’s reading the third story! | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#37 | - | 27 | City politicians in Big Town are using city money to have a big party on a cruise ship. They are taking the money for the party from the children’s library. | too many words | 30 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#39 | - | 27 | No, no, no! Anna, you cannot say you are angry! This is The News!!! | too many words | 14 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#40 | - | 27 | What can I do, Ms. Weaver? Take out my feelings and put them here … on the news desk? | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#43 | - | 27 | This is going to be a very long day. | too many words | 9 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#8 | - | 27 | A new book is very popular with children and families. This is it. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-18#9 | - | 27 | It is about a lost duckling. The duck's mother cannot find him. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#1 | - | 29 | Hi there! Summer in Washington, D.C. is hot and sunny. I always ride the Metro to work. Riding the Metro is cool and fast. But today it’s closed. So, I am walking to work. | too many words | 35 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#11 | - | 29 | The bad news is you are not good at reading the news. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#13 | - | 29 | So, starting next month you will not read the news. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#14 | - | 29 | Next month is July. You are firing me in July. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#15 | - | 29 | No. I am not firing you in July … or in August or in September. That is the good news. | too many words | 19 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#16 | - | 29 | Okay. You are not firing me. I am not reading the news. What will I be doing? | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#17 | - | 29 | Well, you are good at asking questions. You are good at talking to people. You are good at showing your feelings. And you are great at being silly. | too many words | 28 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#18 | - | 29 | Thank you, Ms. Weaver. But what does all that mean? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#19 | - | 29 | I have a new assignment for you! Your skills are perfect for a new show … a children’s show. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#2 | - | 29 | (On the phone) Ms. Weaver, I am late this morning. The Metro is closed. So, I am walking to work. | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#20 | - | 29 | A children’s show ... That is awesome! When do I start? | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#21 | - | 29 | You start next month. Start thinking of ideas for the show. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#22 | - | 29 | I have tons of ideas! I can show children what it’s like in outer space ... | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#25 | - | 29 | Those are great ideas, Anna. Please go think of more … at your desk. | too many words | 13 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#26 | - | 29 | Yes. What other things can I show them? Mt. Everest! Everyone has different skills. You have skills. I have skills. The important thing is to know what you are good at. Until next time! | too many words | 34 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#5 | - | 29 | When you arrive, please come to my office. I have important news to tell you. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#6 | - | 29 | Of course. Good-bye. My boss has news for me. The question is: Is it good news or bad news? | too many words | 20 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| transcripts.json | lle1-19#9 | - | 29 | Anna, I have good news and I have bad news. Which do you want to hear first? | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| voicelist.json | v2c9003062f2d | - | 13 | Then at the bus station turn left. Then walk straight ahead. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| voicelist.json | v382fbefe69a4 | - | 22 | When I feel bored I always look for something unusual to do! | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| voicelist.json | v488c88d845fc | - | 37 | I'm going to teach children how to play the ukulele. | too many words | 10 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| voicelist.json | v5e5889b7f90c | - | 34 | When you arrive, please come to my office. I have important news to tell you. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| voicelist.json | v7777f32e2ae5 | - | 14 | The gym is across from the lounge. It's next to the mailroom. Go that way. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| voicelist.json | v7cac47275188 | - | 15 | The gym is across from the lounge. It is behind the lobby. | too many words | 12 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| voicelist.json | v8050377054bd | - | 35 | {A}, I have good news and I have bad news. Which do you want to hear first? | too many words | 17 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| voicelist.json | va0f6ea26df30 | - | 39 | I am busy on Monday night. I'm going to jog in the park with my friend. Do you jog? | too many words | 19 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| voicelist.json | vbae2aab4880e | - | 30 | Yes, the right size for you is medium. Let's try again. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| voicelist.json | ve2b4bbc6ba01 | - | 38 | We always eat dinner together and sometimes we play board games. | too many words | 11 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| voicelist.json | vee0699326970 | - | 16 | Um, no. The post office is far from here. But there is a mailbox across from the store. | too many words | 18 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
| voicelist.json | vf5f0007c8f48 | - | 9 | The gym is across from the lounge. It's next to the mailroom. Go that way. | too many words | 15 | - | 녹음 자료 또는 그 사본이며 지은 미션 줄이 아니에요. |
