# 도서관 책. 퍼블릭 도메인 하와이 문헌을 쉬운 영어로 다시 쓴 것

신뢰도: B 생성 (줄거리와 사실은 원본에 있다. 영어는 내가 다시 썼다. 원어민과 하와이 문화 감수 전)
검증로그: 2026-10-07 / 구텐베르크 #66547 II장, #329 The Bottle Imp 원문을 읽고 줄거리 대조 / 보류 / 영어는 spec 5.2 표본 검증, 하와이 대목은 출시 전 원주민 감수자 (audit_culture 0장 4번)
상위 규격: docs/expansion.md 6장
작성일: 2026-10-07

**이 파일이 원본이다.** `scripts/derive_ext_readers.py` 가 읽어 `out/data/ext_readers.json` 을 낸다.
게임 안에서는 도서관(13주부터)과 새 집 책꽂이에서 펼친다. **화면에 "학습용 인공물. 원작을 쉬운 영어로 다시 쓴 것" 과 원작 표기를 늘 단다.**

## 1. 다시 쓰는 법

| 규칙 | 무엇 |
|---|---|
| 줄거리와 사실만 | 원문 문장을 옮기지 않는다. 원문은 초급에게 너무 어렵고, 옮기면 그 시대 표현이 따라온다 |
| 신성한 것 | 신, 사원(heiau), 제물, 유령, 조상의 뼈, 한센병과 Kalaupapa 를 안 쓴다 (sources.md 3.5). 원문에 있어도 그 대목을 뺀다 |
| 무섭지 않게 | Bottle Imp 의 악마는 "병 속의 무엇" 이다. 지옥은 "모든 것을 영원히 잃는다" 로 쓴다. 죽음, 술, 범죄 대목은 줄거리를 바꾸지 않는 선에서 뺀다 |
| 바깥 사람의 책 | Westervelt (1915) 와 Stevenson (1891) 은 하와이 밖에서 온 사람이다. 책마다 `틀` 줄을 화면 맨 앞에 띄운다 (audit_culture 0장 4번) |
| 장소 전설 | 줄인다. 지명 뜻과 옛 놀이처럼 신성하지 않은 사실만. 하와이 집안마다 다르게 전한다고 밝힌다 |
| 하와이어 표기 | ʻokina 와 장음을 바로 쓴다 (Kōkua, kōnane, Kawaiahaʻo). 원문 철자 Kokua 는 원작 표기 칸에만 |
| 낱말 문 | 들은 LLE1 낱말 + docs/wordlist.md + docs/expansion.md 9장. 밖의 낱말이 하나라도 있으면 파생기가 안 낸다 |
| 길이 | expansion.md 6장 표 (분기마다 편 길이와 문장 길이) |

## 2. 책

### r01
- 주: 16
- 책: Legends of Old Honolulu (1915)
- 원작자: W. D. Westervelt (1849~1939)
- 원본: https://www.gutenberg.org/ebooks/66547 II. Legendary Places in Honolulu
- 제목: The Name Honolulu
- 차례: 1/2
- 틀: This book is from 1915. A man from outside Hawaiʻi wrote it. Hawaiian families tell these stories in their own way.
- 뺀 것: 장 안의 사원, 제물, 유령, 상어 신, 하인 대목 전부
- 검증로그: 2026-10-07 / #66547 II장 첫 세 문단 대조 (이름 뜻, Kou, 물 많은 밭) / 보류 / 지명 뜻은 하와이어 사전과 감수자 확인 전

```
This is a very old name.
Honolulu has two parts, hono and lulu.
Some people say it means a quiet place.
Old Hawaiian people said it means a lot of calm.
It was not the name of the harbor.
It was the name of good farm land.
That land had a lot of water.
People grew taro there.
Long ago this town had a different name.
People called it Kou.
Kou was the name of a chief.
A king of Oʻahu gave him this land.
His name was Kākuhihewa.
The king gave land to many chiefs.
Each place got the name of its chief.
Then people said Kou for many years.
Around the year 1800, the name changed to Honolulu.
Today you can walk in this town.
Look at the names of the streets.
Many names are old Hawaiian names.
Ask your neighbor about the names.
Your neighbor may know a different story.
```

### r02
- 주: 17
- 책: Legends of Old Honolulu (1915)
- 원작자: W. D. Westervelt (1849~1939)
- 원본: https://www.gutenberg.org/ebooks/66547 II. Legendary Places in Honolulu
- 제목: Old Games in Kou
- 차례: 2/2
- 틀: This book is from 1915. A man from outside Hawaiʻi wrote it. Hawaiian families tell these stories in their own way.
- 뺀 것: 내기에 목숨을 건 대목, 사원 자리, 유령이 모이던 곳, Punchbowl 제물, 은행 건물 이름
- 검증로그: 2026-10-07 / #66547 II장 Kawaiahaʻo, Ke-kau-kukui, maika, Māmala 대목 대조 / 보류 / 놀이 이름과 표기는 감수자 확인 전

```
Kou had places for games.
One game was kōnane.
You play it on a flat stone.
The stone has many small holes.
You need black stones and white stones.
Two people play together.
The chiefs loved this game.
Another game used a round stone.
People rolled it on a long, flat road.
The road was near the sea.
The chiefs came to watch.
In Kou there was also good water.
It was the water of a chief named Hao.
In Hawaiian, it is Kawaiahaʻo.
Today a big old church has that name.
The waves near the harbor had a name too.
They had the name of a woman, Māmala.
She loved to ride the waves.
She also loved to play kōnane.
Next time, walk to the harbor.
Look at the waves.
Say her name.
```

### r03
- 주: 42
- 책: Island Nights' Entertainments (1893) 안 The Bottle Imp (1891)
- 원작자: Robert Louis Stevenson (1850~1894)
- 원본: https://www.gutenberg.org/ebooks/329 The Bottle Imp
- 제목: The Bottle Imp 1. The House on the Hill
- 차례: 1/8
- 틀: A man from Scotland wrote this story in 1891. He lived in Samoa. A Hawaiian newspaper printed it in Hawaiian the same year.
- 뺀 것: 악마와 지옥이라는 말, 병을 가졌던 실존 인물 이름 (Napoleon, Cook)
- 검증로그: 2026-10-07 / #329 2844~3010줄 대조 / 보류 / 영어 원어민 확인 전

```
Keawe was a young man from the island of Hawaiʻi.
He did not have much money, but he was strong and smart.
He could read and write well.
He worked on ships, and he was very good at it.
One day Keawe wanted to see the big world.
He got a job on a ship to San Francisco.
San Francisco was a big city with many rich people.
One hill had many beautiful houses.
Keawe walked up the hill with fifty dollars in his pocket.
He looked at the houses and thought, "These people must be very happy."
One house was not very big, but it was perfect.
The windows were very clear and clean.
A man looked out of the window at Keawe.
The man was old, and his face was very sad.
Keawe looked at the man, and the man looked at Keawe.
Each man wanted the life of the other man.
The man smiled and asked Keawe to come in.
He showed Keawe every room in the house.
"This is a beautiful house," said Keawe. "Why are you sad?"
"You can have a house like this," said the man. "Do you have any money?"
"I have fifty dollars," said Keawe.
"Then you can buy this," said the man.
He took out a bottle.
The bottle was white like milk, with many colors in it.
Something moved inside it, like a shadow and a fire.
"Try to break it," said the man.
Keawe threw it on the floor many times, but it did not break.
"Something lives in this bottle," said the man.
"Tell it what you want. Then you will have it. Money, a house, anything."
"Why do you want to sell it?" asked Keawe.
"I am old, and I have everything," said the man.
"But there is a problem. You must sell it for less money than you paid."
"If you sell it for the same money, it comes back to you."
"And you must sell it before the end of your life."
"If you still have it at the end, you will lose everything, forever."
"I paid ninety dollars for it," said the man.
"Give me your fifty dollars. Then ask the bottle for your money back."
Keawe was afraid, but he gave the man the money.
He held the bottle and said, "I want my fifty dollars back."
Right away, his pocket was heavy with money again.
"This is a very strange bottle," said Keawe.
"Now it is your bottle," said the man. "Goodbye."
```

### r04
- 주: 43
- 책: Island Nights' Entertainments (1893) 안 The Bottle Imp (1891)
- 원작자: Robert Louis Stevenson (1850~1894)
- 원본: https://www.gutenberg.org/ebooks/329 The Bottle Imp
- 제목: The Bottle Imp 2. It Always Comes Back
- 차례: 2/8
- 틀: A man from Scotland wrote this story in 1891. He lived in Samoa. A Hawaiian newspaper printed it in Hawaiian the same year.
- 뺀 것: 삼촌과 사촌의 죽음 (삼촌이 땅을 넘겨준 것으로 바꿨다), 악마라는 말
- 검증로그: 2026-10-07 / #329 3010~3170줄 대조 / 보류 / 줄거리를 하나 바꿨다. 원작은 삼촌과 사촌이 죽는다
- 메모: 원작에서는 삼촌이 죽고 사촌이 바다에서 죽어 땅이 Keawe 에게 온다. 여기서는 늙은 삼촌이 땅과 돈을 넘겨준다

```
Keawe walked in the street with the bottle under his arm.
He counted his money. It was all there.
"Maybe it is true," he thought. "Let me try one more thing."
He put the bottle down on the street and walked away.
He looked back two times. The bottle was still there.
Then he turned a corner.
Right away, something hit his arm.
It was the bottle, in the pocket of his coat.
On the way to his ship, Keawe saw a small store.
The man in the store sold old and strange things from many places.
Keawe showed him the bottle.
The bottle was very beautiful, so the man paid sixty dollars for it.
He put it in his window.
Keawe went back to his ship and opened his box.
The bottle was in the box.
It came back faster than Keawe.
Keawe had a friend on the ship. His name was Lopaka.
"What is wrong?" asked Lopaka.
Keawe told him everything.
"This is very strange," said Lopaka.
"Ask the bottle for something. If it works, I will buy it from you."
"I want a ship of my own," said Lopaka. "Then I can sell things to all the islands."
Keawe said, "I want a beautiful house on the Kona coast, where I was born."
"I want a big garden with flowers, and glass in every window."
"I want to live there with my friends and my family."
The ship went back to Honolulu.
When they got off the ship, a friend met Keawe on the beach.
"Your uncle is very old now," said the friend.
"He wants to rest. He is giving you his land and his money."
Keawe was surprised.
"Maybe the bottle did this," said Lopaka. "Let us find a man to build the house."
They went to a man who made pictures of houses.
He showed Keawe a picture.
Keawe looked at it and almost cried out.
It was the house from his dream, every part of it.
"How much money will this house cost?" asked Keawe.
The man thought, and wrote some numbers on a paper.
It was the same money that Keawe got from his uncle.
Keawe and Lopaka looked at each other.
"I will have this house," thought Keawe.
"But I will not ask the bottle for one more thing."
```

### r05
- 주: 44
- 책: Island Nights' Entertainments (1893) 안 The Bottle Imp (1891)
- 원작자: Robert Louis Stevenson (1850~1894)
- 원본: https://www.gutenberg.org/ebooks/329 The Bottle Imp
- 제목: The Bottle Imp 3. The Bright House
- 차례: 3/8
- 틀: A man from Scotland wrote this story in 1891. He lived in Samoa. A Hawaiian newspaper printed it in Hawaiian the same year.
- 뺀 것: 옛 왕들이 묻힌 절벽과 무덤 길, 하인을 부르는 원작의 말 (Chinaman), 악마라는 말
- 검증로그: 2026-10-07 / #329 3170~3290줄 대조 / 보류 / 영어 원어민 확인 전

```
Keawe and Lopaka went away on a long trip on the sea.
They did not want to ask the bottle for anything more.
When they came back, the house was ready.
They took a small ship down the coast to Kona.
The house stood high on the side of the mountain.
Above it, the forest went up into the clouds and the rain.
Below it, black rock went down to the sea.
There were flowers of every color in the garden.
There were fruit trees on the left and on the right.
The house was three floors high.
Every floor had a wide porch all around it.
The windows were as clear as water and as bright as day.
There were pictures on the walls and clocks that made music.
From the front porch, Keawe could see the ships on the sea.
Keawe and Lopaka sat on the porch.
"Is it all the way you wanted it?" asked Lopaka.
"It is better than my dream," said Keawe.
"I gave you my word, and I will buy the bottle," said Lopaka.
"But first I want to see the thing inside it, one time."
"I am afraid of it," said Keawe. "But I want to see it too."
"Thing in the bottle," said Keawe, "show yourself to us."
Right away, it looked out of the bottle and went back in, very fast.
Keawe and Lopaka sat like two stones.
It was night before they could say a word.
Then Lopaka gave Keawe the money and took the bottle.
"I am a man of my word," said Lopaka.
"I will get my ship, and then I will sell this bottle fast."
"Please go now, tonight," said Keawe. "I cannot sleep when it is in my house."
"Take a light. Take any picture you like from my house."
Lopaka went down the mountain in the dark.
Keawe stood on the porch and watched the small light go down the road.
The next day was very bright, and Keawe was happy.
He lived in his new house, and every day was a good day.
He read the Honolulu newspapers on the back porch.
People came from far away to see his beautiful rooms.
They called it the Great House, and sometimes the Bright House.
Everything in it was clean and bright, like the morning.
Keawe sang when he walked in the rooms.
When a ship went by on the sea, he put up his flag.
```

### r06
- 주: 45
- 책: Island Nights' Entertainments (1893) 안 The Bottle Imp (1891)
- 원작자: Robert Louis Stevenson (1850~1894)
- 원본: https://www.gutenberg.org/ebooks/329 The Bottle Imp
- 제목: The Bottle Imp 4. Kōkua
- 차례: 4/8
- 틀: A man from Scotland wrote this story in 1891. He lived in Samoa. A Hawaiian newspaper printed it in Hawaiian the same year.
- 뺀 것: 병의 이름과 섬의 이름 (원작의 Chinese Evil, Molokai, Kalaupapa), 밤에 걷는 옛 죽은 이들, 무덤 길
- 검증로그: 2026-10-07 / #329 3290~3420줄 대조 / 보류 / 병 이름을 안 쓴다 (sources.md 3.5). 감수자 확인 전
- 메모: 원작은 이 병을 이름으로 부르고 Molokai 로 보내지는 일을 말한다. 여기서는 "피부에 난 병" 과 "Kōkua 와 결혼할 수 없다" 만 남겼다

```
One day Keawe rode his horse to Kailua to visit some friends.
The next morning he rode home fast. He wanted to see his house.
Near the sea he saw a young woman. She came up out of the water.
She put on her red dress and stood by the road.
Her eyes were bright and kind.
Keawe stopped his horse.
"I know everyone here," he said. "Why do I not know you?"
"I am Kōkua, the daughter of Kiano," she said. "I just came back from Oʻahu. Who are you?"
"I will tell you later," said Keawe. "First, tell me one thing. Are you married?"
Kōkua laughed. "You ask a lot of questions," she said. "Are you married?"
"No," said Keawe. "I saw your eyes, and my heart went to you like a bird."
"If you do not like me, tell me, and I will go home."
"If you like me, I will come to your father's house tonight."
Kōkua did not say a word. She looked at the sea and laughed.
"I think that means yes," said Keawe.
At her father's house, Kiano knew Keawe's name.
Kōkua heard the name and knew about the Bright House.
That night they talked and laughed together.
The next day Keawe talked with Kōkua again.
"I did not tell you my name," he said, "because I have a big house."
"I want you to like the man, not the house."
"Do you want me to go?"
"No," said Kōkua. This time she did not laugh.
Keawe rode home up the mountain, and he sang all the way.
That night he wanted a hot bath.
But in the bathroom he stopped singing.
He saw a mark on his skin.
He knew this mark. It was a bad sickness.
People with this sickness had to leave their homes.
He could not marry Kōkua now.
All night Keawe walked around and around the porch.
"I can leave my house," he thought. "But I cannot leave Kōkua."
Late in the night, he thought of the bottle.
"The bottle can make me well," he thought.
"I was afraid of it. But I must find it again, for Kōkua."
The next day a ship was going to Honolulu.
"I will go to Honolulu and find Lopaka," Keawe thought.
In the morning he rode down the mountain in the rain.
He sat with the people who waited for the ship, but he did not talk.
"Keawe of the Bright House is very sad today," they said.
From the ship he looked for Kōkua's house on the beach.
A small red dress moved by the door.
"I will find the bottle for you," he said quietly.
```

### r07
- 주: 46
- 책: Island Nights' Entertainments (1893) 안 The Bottle Imp (1891)
- 원작자: Robert Louis Stevenson (1850~1894)
- 원본: https://www.gutenberg.org/ebooks/329 The Bottle Imp
- 제목: The Bottle Imp 5. One Cent
- 차례: 5/8
- 틀: A man from Scotland wrote this story in 1891. He lived in Samoa. A Hawaiian newspaper printed it in Hawaiian the same year.
- 뺀 것: 젊은 사람이 가게 돈을 훔친 대목, 술잔, 지옥 불, 실존 악단장 이름 (Berger)
- 검증로그: 2026-10-07 / #329 3420~3600줄 대조 / 보류 / 영어 원어민 확인 전

```
The ship came to Honolulu in the evening.
Keawe asked everyone for Lopaka.
"Lopaka has a ship now," they said. "He went far away to the south."
Keawe went to see a lawyer, a friend of Lopaka.
The lawyer had a new house by the beach, and he looked very happy.
"Lopaka sold a bottle to someone," said Keawe. "Do you know who has it now?"
The lawyer's face changed. "I do not know," he said. "But ask this man."
For many days Keawe went from one house to another.
Everywhere he saw new clothes and new houses and happy people.
"These are the people who had the bottle," he thought.
"When I find a sad face, I will find the bottle."
At last someone sent him to a young man on Beretania Street.
The young man had a new house and new lights in the windows.
But his face was white, and his eyes were dark and tired.
"I want to buy the bottle," said Keawe.
The young man almost fell down.
"You want to buy it?" he said. "Do you know the price now?"
"How much did you pay for it?" asked Keawe.
"Two cents," said the young man.
Keawe stopped. Two cents! Then the next price was one cent.
And no one can sell it for less than one cent.
The man who buys it for one cent can never sell it.
"Please buy it!" cried the young man.
"I did a bad thing, and I needed the bottle. Now I am afraid."
Keawe thought of Kōkua.
"Give me the bottle," he said. "Here are five cents. Give me four cents back."
The young man was ready. He gave Keawe the bottle and the money.
Keawe held the bottle and said, "I want to be well."
In his room, he looked at his skin.
The mark was gone. He was well.
But now Keawe felt cold all over.
"I have the bottle now," he thought. "And I can never sell it."
"At the end of my life, I will lose everything, forever."
He was too afraid to stay in his room.
That night a band played music at the hotel.
Keawe walked among the happy people, but he did not hear the music.
Then the band played a song. It was a song he sang with Kōkua.
He stood and listened.
"It is done now," he thought. "I did it for Kōkua."
He went back to Hawaiʻi on the first ship.
```

### r08
- 주: 47
- 책: Island Nights' Entertainments (1893) 안 The Bottle Imp (1891)
- 원작자: Robert Louis Stevenson (1850~1894)
- 원본: https://www.gutenberg.org/ebooks/329 The Bottle Imp
- 제목: The Bottle Imp 6. The Small Coins of Tahiti
- 차례: 6/8
- 틀: A man from Scotland wrote this story in 1891. He lived in Samoa. A Hawaiian newspaper printed it in Hawaiian the same year.
- 뺀 것: 지옥 불, 사람들이 성호를 긋는 대목, 아이들이 비명을 지르며 달아나는 대목
- 검증로그: 2026-10-07 / #329 3600~3760줄 대조 / 보류 / 영어 원어민 확인 전

```
Keawe married Kōkua, and they lived in the Bright House.
When they were together, Keawe was calm.
But when he was alone, he thought about the bottle and he cried.
Kōkua sang all day in the house, like a bird.
But after some time, she stopped singing.
They sat on different porches, far from each other.
One day Keawe found Kōkua on the floor. She was crying.
"Before, you were the happiest man on the island," she said.
"Then you married me, and you stopped smiling. What is wrong with me?"
Keawe sat by her side.
"Nothing is wrong with you," he said. "Now I will tell you everything."
He told her the whole story, from the beginning.
"You did this for me?" said Kōkua. "Then I am not afraid."
"I went to school in Honolulu. I am not a child. I will help you."
"You say there is nothing less than one cent. But the world is big."
"In France, they have a very small coin. It is called a centime."
"Five centimes are about one cent."
"Let us go to Tahiti. The French live there, and they use centimes."
"We can sell it for four centimes, or three, or two, or one."
Keawe held her hands. "Then let us go," he said.
The next day Kōkua put the bottle in a box with their best clothes.
"We must look rich," she said. "Then people will believe in the bottle."
They told people they were going on a trip.
They went to Honolulu, then to San Francisco, then to Tahiti.
After a long trip, they came to the town of Papeʻete.
They saw white houses by the sea, and green mountains behind them.
They got a house in the town.
They asked the bottle for money, so they had horses and fine clothes.
People in the town talked about the rich strangers from Hawaiʻi.
Soon they could speak the language of Tahiti. It is like Hawaiian.
Then they started to sell the bottle.
But it was very hard.
Some people did not believe them and laughed.
Other people believed them and were afraid.
Soon people walked away when Keawe and Kōkua came near.
Keawe and Kōkua were very sad.
At night they sat in their house and did not say a word.
Sometimes they put the bottle on the floor and looked at it all night.
```

### r09
- 주: 48
- 책: Island Nights' Entertainments (1893) 안 The Bottle Imp (1891)
- 원작자: Robert Louis Stevenson (1850~1894)
- 원본: https://www.gutenberg.org/ebooks/329 The Bottle Imp
- 제목: The Bottle Imp 7. Kōkua Buys the Bottle
- 차례: 7/8
- 틀: A man from Scotland wrote this story in 1891. He lived in Samoa. A Hawaiian newspaper printed it in Hawaiian the same year.
- 뺀 것: 노인이 Kōkua 를 마녀라 부르는 대목, 지옥 불과 연기, 땅바닥에 누워 우는 대목
- 검증로그: 2026-10-07 / #329 3760~3900줄 대조 / 보류 / 영어 원어민 확인 전

```
One night Kōkua woke up, and Keawe was not in the bed.
She looked out the door.
Keawe was in the garden, under the trees. He was crying.
Kōkua wanted to run to him, but she stopped.
"He is crying because of me," she thought.
"He took the bottle for me. Now I will take it for him."
She took four small coins and went out into the dark street.
Under a tree, she found an old man. He was poor and alone, and he was sick.
"Will you help me?" said Kōkua. "I am a daughter of Hawaiʻi, far from home."
She told him the whole story.
"Go to my husband," she said. "Buy the bottle for four centimes."
"He will sell it to you. Then I will buy it from you for three."
The old man looked at her for a long time. "Give me the money," he said.
Kōkua waited in the street alone.
The wind was loud in the trees, and she was very afraid.
Then the old man came back with the bottle.
"Your husband cried like a child," he said. "Tonight he will sleep well."
"Ask the bottle to make you well," said Kōkua.
"No," said the old man. "I am old. I do not want anything from it."
Kōkua tried to take the bottle, but her hand stopped.
"You are afraid," said the old man kindly. "I can keep it."
"No!" said Kōkua. "Here is your money. Give me the bottle."
She held the bottle under her dress and walked home.
Keawe was asleep, like a child.
"Now you can sleep, my husband," she said quietly.
"Tomorrow you can sing and laugh. I will not sing again."
In the morning Keawe told her the good news.
"The bottle is gone!" he said. "An old man bought it last night."
He laughed, ate a big breakfast, and talked about going home.
Kōkua did not eat. She did not talk.
"Why are you sad?" asked Keawe. "I am free!"
"I feel bad for the old man," said Kōkua.
Keawe got angry, because he knew she was right.
"You should be happy for me," he said, and he went out.
Kōkua sat alone in the house.
No one will buy the bottle for two centimes, she thought.
She took the bottle out and looked at it, and she was very afraid.
```

### r10
- 주: 48
- 책: Island Nights' Entertainments (1893) 안 The Bottle Imp (1891)
- 원작자: Robert Louis Stevenson (1850~1894)
- 원본: https://www.gutenberg.org/ebooks/329 The Bottle Imp
- 제목: The Bottle Imp 8. The Last Price
- 차례: 8/8
- 틀: A man from Scotland wrote this story in 1891. He lived in Samoa. A Hawaiian newspaper printed it in Hawaiian the same year.
- 뺀 것: 술 마시는 대목 전부, 늙은 선원의 과거 (감옥), 때리겠다는 말, 아내를 의심하게 만드는 말
- 검증로그: 2026-10-07 / #329 3900~4100줄 대조 / 보류 / 줄거리를 하나 바꿨다. 원작은 Keawe 가 선원과 술을 마신다
- 메모: 원작에서는 Keawe 가 하루 종일 술을 마시고 선원도 취해 있다. 여기서는 Keawe 가 시내를 걷다가 늙은 선원을 만난다

```
Keawe walked in the town all day.
He was angry, but he knew Kōkua was right.
In the evening he met an old sailor from a big ship.
The sailor had a hard face, and he was not afraid of anything.
Keawe went home for some money.
He opened the back door quietly.
Kōkua was on the floor with a lamp.
In front of her was a white bottle, with a long neck.
Kōkua was crying and holding her hands together.
Keawe stood at the door for a long time.
Then he understood. The old man did not keep the bottle.
Kōkua bought it from him. She did it for Keawe.
Keawe closed the door quietly.
Then he came in the front door, and the bottle was gone.
"I am going out again," said Keawe. "I need some money."
He looked in the box. The bottle was not there.
"Kōkua," he said, "I was not kind to you today. Please forget it."
Kōkua held him and cried. "I only wanted a kind word," she said.
Keawe went out to the old sailor at the corner.
"My wife has a bottle," said Keawe.
"Here are two centimes. Go and buy the bottle from her."
"Then bring it to me, and I will buy it from you for one."
"Do not tell her about me."
The sailor laughed, but he went.
Keawe waited in the dark street.
His heart was heavy. "Now it is my turn," he thought.
After a long time, the sailor came back.
He had the bottle in his coat.
"Give it to me," said Keawe. "Here is one centime."
"No," said the sailor. "This is a very good bottle. I will keep it."
"You do not understand," said Keawe. "You can never sell it."
"At the end of your life, you will lose everything, forever."
"I am not afraid," said the sailor. "I will keep it. Good night."
He walked away down the street, and the bottle went with him.
Keawe ran home to Kōkua, fast like the wind.
That night they were very happy.
They went home to Hawaiʻi.
And they lived in peace in the Bright House for all their days.
```
