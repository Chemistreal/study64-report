신뢰도: B 생성 (번역)
검증로그: 2026-10-10 / 번역은 영어 대본 줄 311줄을 입문 성인 학습자용 해요체로 옮겼다. 영어 줄 자체는 기계가 대본과 글자 하나까지 견준다. 번역의 정확성은 기계가 못 잰다 / 보류 / 4주 리허설에서 두 사람이 어색한 줄을 표시하면 이 파일의 해당 줄만 고친다

# 대본 한국어 풀이 원본 (입문 세션 1~50)

상위 규격: docs/game_data.md 12장 / docs/spec.md 13.1 (개정문 29번)
작성일: 2026-10-10

이 파일이 `out/game/transcripts_ko.json` 의 **원본**이다. `scripts/derive_transcripts_ko.py` 가 읽어 낸다. 손으로 고치는 곳은 여기뿐이다.

## 쓰는 법

- 표 한 줄이 대본 한 줄이다. 줄 번호는 `out/game/transcripts.json` 의 그 과 배열에서 1부터 센다. 게임의 열쇠는 `<과 번호>#<줄 번호>` 다.
- 가운데 칸의 영어는 대본 줄 그대로다. **영어를 고치지 않는다.** 대본이 바뀌면 파생기가 어긋남으로 실패해서 번역을 다시 보게 한다.
- 오른쪽 칸의 한국어는 말한 사람 이름표(`Pete:`) 없이 말만 옮긴다. 이름표는 영어 줄에 이미 있다.
- 사람 이름, 장소, 프로그램과 책 이름, 가게 이름은 학습자가 귀로 듣는 대로 영어 철자를 남긴다 (`Anna`, `Washington, D.C.`, `The News`). 나라와 언어 이름, 일반 낱말은 한국어로 옮긴다.
- 카드나 문제의 답을 풀어 주는 말을 보태지 않는다. 대본에 있는 말만 옮긴다. 대본이 끊긴 줄은 끊긴 대로 옮긴다.
- 말이 없는 줄(`Marsha:`)은 말이 없다고 적는다. 한국어 줄은 비어 있으면 안 된다 (게임은 빈 줄을 안 그리고 검사기가 실패로 센다).
- 범위는 세션 1~50 이 쓰는 과 열둘이다 (`koreanTranslationThroughSession`, 11.3 표). 범위를 넓히면 새 과의 번역이 여기 다 들어와야 파생기가 통과한다.
- 이 번역은 듣기를 **끝낸 뒤** 대본 밑에서만 보인다 (게임 `captions.afterListening`). 듣는 동안은 안 보인다.

## lle1-01

| 줄 | 영어 | 한국어 |
|---|---|---|
| 1 | Pete: Hi! Are you Anna? | 안녕하세요! Anna 씨인가요? |
| 2 | Anna: Yes! Hi there! Are you Pete? | 네! 안녕하세요! Pete 씨인가요? |
| 3 | Pete: I am Pete. | 제가 Pete예요. |
| 4 | Anna: Nice to meet you. | 만나서 반가워요. |
| 5 | Anna: Let's try that again. I'm Anna. Nice to meet you. | 다시 해 봐요. 저는 Anna예요. 만나서 반가워요. |
| 6 | Pete: I'm Pete. "Anna" Is that A-N-A? | 저는 Pete예요. "Anna"요? A-N-A인가요? |
| 7 | Anna: No. A-N-N-A | 아니요. A-N-N-A예요. |
| 8 | Pete: Well, Anna with two "n's" ... Welcome to ... 1400 Irving Street! | 음, n이 두 개인 Anna군요 ... 1400 Irving Street에 오신 걸 환영해요! |
| 9 | Anna: My new apartment! Yes! | 제 새 아파트예요! 좋아요! |

## lle1-05

| 줄 | 영어 | 한국어 |
|---|---|---|
| 1 | Anna: Hello, everyone! Today my friend Marsha is at her friend's house. She says it is beautiful. I want to see this house! Here we are! | 안녕하세요, 여러분! 오늘은 제 친구 Marsha가 친구 집에 와 있어요. Marsha가 그 집이 아름답다고 해요. 저도 이 집을 보고 싶어요! 도착했어요! |
| 2 | Anna: Marsha, I am in the kitchen! It is a beautiful kitchen! | Marsha, 저 지금 부엌에 있어요! 정말 아름다운 부엌이에요! |
| 3 | Marsha: It is beautiful. We cook in the kitchen. | 정말 아름다워요. 우리는 부엌에서 요리해요. |
| 4 | Anna: I eat in the kitchen. | 저는 부엌에서 먹어요. |
| 5 | Marsha: We relax in the living room. | 우리는 거실에서 쉬어요. |
| 6 | Anna: I relax in the living room. | 저는 거실에서 쉬어요. |
| 7 | Marsha, let’s go upstairs! | Marsha, 위층으로 가요! |
| 8 | Marsha: | Marsha: (뒤에 말이 없음) |
| 9 | Anna? Where are you? | Anna? 어디 있어요? |
| 10 | Anna: Marsha, I am in the bathroom! I wash in the bathroom. | Marsha, 저 욕실에 있어요! 저는 욕실에서 씻어요. |
| 11 | Marsha: I am in the bedroom. We sleep in the bedroom. | 저는 침실에 있어요. 우리는 침실에서 자요. |
| 12 | Anna: I sleep in the bedroom! | 저는 침실에서 자요! |

## lle1-06

| 줄 | 영어 | 한국어 |
|---|---|---|
| 1 | Anna: Hi there! I’m Anna and I live in Washington, D.C. Every day I learn more about this great city. People in Washington like to work out! Oh, hi, Pete. How’s it going? | 안녕하세요! 저는 Anna이고 Washington, D.C.에 살아요. 저는 매일 이 멋진 도시에 대해 더 많이 배워요. Washington 사람들은 운동하는 걸 좋아해요! 아, 안녕하세요, Pete. 잘 지내요? |
| 2 | Pete: Hi, Anna. It’s going great. How’s it going with you? | 안녕하세요, Anna. 아주 잘 지내요. Anna는 어때요? |
| 3 | Anna: Things are awesome! Pete, I want to work out. Where is the gym? | 정말 좋아요! Pete, 저 운동하고 싶어요. 헬스장이 어디예요? |
| 4 | Pete: The gym is across from the lounge. It’s next to the mailroom. Go that way. | 헬스장은 라운지 맞은편에 있어요. 우편물실 옆이에요. 저쪽으로 가세요. |
| 5 | Anna: Thanks, Pete! | 고마워요, Pete! |
| 6 | (Anna walks away) | (Anna가 걸어간다) |
| 7 | Pete: No, Anna! Not that way! Go that way! | 아니에요, Anna! 그쪽이 아니에요! 저쪽으로 가요! |
| 8 | (In the mailroom) | (우편물실에서) |
| 9 | Anna: Oh, Pete. This is not the gym. | 아, Pete. 여기는 헬스장이 아니에요. |
| 10 | Pete: That’s right, Anna. This is the mailroom. | 맞아요, Anna. 여기는 우편물실이에요. |
| 11 | Anna: The gym is across from … what? | 헬스장은 ... 뭐 맞은편이죠? |
| 12 | Pete: The gym is across from the lounge. | 헬스장은 라운지 맞은편이에요. |
| 13 | Anna: Across from the lounge. Right. Thanks! | 라운지 맞은편. 맞다. 고마워요! |
| 14 | (In the lounge) | (라운지에서) |
| 15 | Anna: Pete! This is not the gym! | Pete! 여기는 헬스장이 아니에요! |
| 16 | Pete: The gym is across from the lounge. It is behind the lobby. | 헬스장은 라운지 맞은편이에요. 로비 뒤에 있어요. |
| 17 | Anna: Right. Right. See you. | 알겠어요. 알겠어요. 또 봐요. |
| 18 | Pete: See you, Anna! | 또 봐요, Anna! |
| 19 | Anna: See you. | 또 봐요. |
| 20 | Pete: See you, Anna. | 또 봐요, Anna. |
| 21 | (In the garage) | (주차장에서) |
| 22 | Anna: This is not the gym. This is a parking garage. | 여기는 헬스장이 아니에요. 주차장이에요. |
| 23 | Anna: Hello? Pete? | 여보세요? Pete? |
| 24 | (On the rooftop) | (옥상에서) |
| 25 | Anna: This is not a gym. This is a rooftop. | 여기는 헬스장이 아니에요. 옥상이에요. |
| 26 | (In the gym) | (헬스장에서) |
| 27 | Anna: Pete! Pete? | Pete! Pete? |
| 28 | Pete: I want to work out too! Join me! | 저도 운동하고 싶어요! 같이 해요! |
| 29 | Anna: I’m good. | 전 괜찮아요. |

## lle1-09

| 줄 | 영어 | 한국어 |
|---|---|---|
| 1 | Anna: Oh, hi, everyone! Here in Washington, DC, the weather changes often. One day is cold and windy. But the next day is warm and sunny! So, every day I check the forecast. Hello, Phone? What is today’s temperature? | 아, 여러분 안녕하세요! 여기 Washington, DC는 날씨가 자주 바뀌어요. 어떤 날은 춥고 바람이 불어요. 하지만 다음 날은 따뜻하고 화창해요! 그래서 저는 매일 일기 예보를 확인해요. Phone, 안녕하세요? 오늘 기온이 몇 도예요? |
| 2 | Phone: Today it is 18 degrees ... | 오늘은 18도예요 ... |
| 3 | Anna: Eighteen degrees! That is cold! | 18도요! 너무 추워요! |
| 4 | Phone: … eighteen degrees Celsius. | ... 섭씨 18도예요. |
| 5 | Anna: Oh, Celsius. That is 65 degrees Fahrenheit. That’s warm. | 아, 섭씨요. 그건 화씨로 65도예요. 따뜻하네요. |
| 6 | Phone: Yes, Anna. It is warm. | 네, Anna. 따뜻해요. |
| 7 | Anna: Excuse me, Phone. Is it windy today? | 실례지만, Phone. 오늘 바람이 불어요? |
| 8 | Phone: No, it is not windy today. | 아니요, 오늘은 바람이 불지 않아요. |
| 9 | Anna: Is it sunny today? | 오늘 화창해요? |
| 10 | Phone: Yes, Anna. It is sunny. | 네, Anna. 화창해요. |
| 11 | Anna: Excuse me, Phone? | 실례지만, Phone? |
| 12 | Phone: Yes, Anna. | 네, Anna. |
| 13 | Anna: Is it snowy today? | 오늘 눈이 와요? |
| 14 | Phone: No, Anna. It is not snowy. | 아니요, Anna. 눈이 오지 않아요. |
| 15 | Anna: Thank you, Phone! | 고마워요, Phone! |
| 16 | Anna: Today the weather is warm and sunny -- great for seeing Washington, D.C. | 오늘 날씨는 따뜻하고 화창해요 -- Washington, D.C.를 구경하기에 아주 좋아요. |
| 17 | Anna: Phone! It is not warm and sunny! It is cold and windy and snowy! | Phone! 따뜻하고 화창하지 않아요! 춥고 바람 불고 눈이 와요! |
| 18 | Phone: Anna, it is not cold, windy, or snowy. It is warm and sunny … in Mexico City, Mexico. | Anna, 춥지도 않고 바람이 불지도 않고 눈이 오지도 않아요. 따뜻하고 화창해요 ... Mexico City, Mexico에서요. |
| 19 | Anna: Oh. I see. Mexico. | 아. 알겠어요. Mexico군요. |
| 20 | Anna: Washington weather changes often. Remember to check the forecast -- the right forecast. | Washington 날씨는 자주 바뀌어요. 일기 예보를 꼭 확인하세요 -- 알맞은 지역의 예보로요. |
| 21 | Phone: Yes, Anna. Next time remember to check the right fore… | 네, Anna. 다음에는 알맞은 일기 예… |
| 22 | Anna: Okay, thank you Phone. Goodbye, Phone. | 알겠어요, 고마워요, Phone. 안녕, Phone. |
| 23 | Anna: Until next time! | 다음에 또 만나요! |

## lle1-10

| 줄 | 영어 | 한국어 |
|---|---|---|
| 1 | Anna: Hi! Today, my friend Ashley, is coming over. I am showing her my new apartment! Oh! That’s Ashley calling. | 안녕하세요! 오늘 제 친구 Ashley가 놀러 와요. 제 새 아파트를 보여 줄 거예요! 아! Ashley한테 전화가 왔어요. |
| 2 | Anna: Hi | 안녕 |
| 3 | Ashley! | Ashley! |
| 4 | Ashley: Hi Anna! I’m coming to your apartment. Where is your apartment? | 안녕하세요, Anna! 지금 가고 있어요. 아파트가 어디에 있어요? |
| 5 | Anna: My apartment is near the Columbia Heights Metro. | 제 아파트는 Columbia Heights Metro 근처에 있어요. |
| 6 | Ashley: It is near the Columbia Heights Metro? | Columbia Heights Metro 근처라고요? |
| 7 | Anna: Yes. Exit the Metro and turn right. Then at the bus station turn left. Then walk straight ahead. | 네. Metro에서 나와서 오른쪽으로 도세요. 그다음 버스 정류장에서 왼쪽으로 도세요. 그리고 곧장 앞으로 걸어오세요. |
| 8 | Ashley: Okay. Exit Metro, turn right, turn left, then go straight ahead? | 알겠어요. Metro에서 나와서 오른쪽으로 돌고, 왼쪽으로 돌고, 그다음 곧장 앞으로 가는 거죠? |
| 9 | Anna: Yes. My apartment is near a coffee shop. | 네. 제 아파트는 커피숍 근처에 있어요. |
| 10 | Ashley: Okay. See you soon! | 알겠어요. 곧 봐요! |
| 11 | Anna: Hi, | 안녕, |
| 12 | Ashley. | Ashley. |
| 13 | Ashley: Anna, Which coffee shop? There are three coffee shops. | Anna, 어느 커피숍이에요? 커피숍이 세 군데 있어요. |
| 14 | Anna: Okay, my apartment is across from a big department store. | 알겠어요, 제 아파트는 큰 백화점 맞은편에 있어요. |
| 15 | Ashley: A big department store? Ah, I see it! | 큰 백화점이요? 아, 보여요! |
| 16 | Anna: Okay! Bye, | 좋아요! 잘 가요, |
| 17 | Ashley. See you soon! | Ashley. 곧 봐요! |
| 18 | Ashley: Okay. See you soon. | 네. 곧 봐요. |
| 19 | Anna: Ashley! Ashley! Ashley! Over here! It’s | Ashley! Ashley! Ashley! 여기예요! 이쪽은 |
| 20 | Anna! It’s | Anna예요! 이쪽은 |
| 21 | Anna! Hi! | Anna예요! 안녕! |
| 22 | Anna: I love having my friends over. Come on! | 친구들이 집에 오는 게 정말 좋아요. 어서 와요! |
| 23 | Ashley: Great! | 좋아요! |

## lle1-11

| 줄 | 영어 | 한국어 |
|---|---|---|
| 1 | Anna: Hello! DC is a city for walking. In our neighborhood, I can do all my errands. Marsha, before we get ice cream, I need to return three books to the library. Where is the library? | 안녕하세요! DC는 걸어 다니는 도시예요. 우리 동네에서는 볼일을 다 볼 수 있어요. Marsha, 아이스크림을 먹기 전에 도서관에 책 세 권을 반납해야 해요. 도서관이 어디예요? |
| 2 | Marsha: It is on this street on the corner. | 이 길 모퉁이에 있어요. |
| 3 | Anna: Awesome! | 멋져요! |
| 4 | Marsha: Let's go! | 가요! |
| 5 | Anna: Marsha, I can return the books here. | Marsha, 책은 여기서 반납할 수 있어요. |
| 6 | Marsha: Anna, what are those in the books? | Anna, 책 안에 있는 그건 뭐예요? |
| 7 | Anna: Marsha, these are letters to my family and friends back home … four letters! Is there a post office near here? | Marsha, 이건 고향에 있는 가족과 친구들에게 쓴 편지예요 ... 네 통이에요! 이 근처에 우체국이 있어요? |
| 8 | Marsha: Um, no. The post office is far from here. But there is a mailbox across from the store. | 음, 아니요. 우체국은 여기서 멀어요. 하지만 가게 맞은편에 우체통이 있어요. |
| 9 | Anna: Awesome! Let’s go! | 멋져요! 가요! |
| 10 | (At the mailbox) | (우체통 앞에서) |
| 11 | Anna: Marsha, now I need to buy stamps. | Marsha, 이제 우표를 사야 해요. |
| 12 | Marsha: Do you have cash? | 현금 있어요? |
| 13 | Anna: No. Is there a bank near here? | 아니요. 이 근처에 은행이 있어요? |
| 14 | Marsha: There is a bank behind you. | 뒤에 은행이 있어요. |
| 15 | Anna: Thanks, Marsha. You know our neighborhood so well. | 고마워요, Marsha. 우리 동네를 정말 잘 알고 있네요. |
| 16 | Anna: Now I have cash. I can buy stamps. | 이제 현금이 생겼어요. 우표를 살 수 있어요. |
| 17 | Marsha: That store sells stamps. | 저 가게에서 우표를 팔아요. |
| 18 | Anna: Wait here. | 여기서 기다려요. |
| 19 | Anna: I have stamps. | 우표를 샀어요. |
| 20 | Marsha: Wow, you’re fast. | 와, 빠르네요. |
| 21 | Anna: Thank you, thank you letters, for sending my words… my love … to my family and friends - | 고마워요, 고마워요, 편지들아. 내 말을 ... 내 사랑을 ... 가족과 친구들에게 보내 줘서 - |
| 22 | Marsha: Do you have more cash? | 현금 더 있어요? |
| 23 | Anna: I do! | 있어요! |
| 24 | Marsh and | Marsha와 |
| 25 | Anna: Ice cream!! | 아이스크림!! |
| 26 | Anna: I love my new neighborhood! Everything is near our apartment! Even hair salons*, and ice cream! | 새 동네가 정말 좋아요! 모든 게 우리 아파트 가까이에 있어요! 미용실*도, 아이스크림도요! |
| 27 | Anna: Until next time! | 다음에 또 만나요! |
| 28 | *salon - n. a business that gives customers beauty treatments (such as haircuts) | *salon - 명사. 손님에게 미용 관리(예: 머리 손질)를 해 주는 가게 |

## lle1-12

| 줄 | 영어 | 한국어 |
|---|---|---|
| 1 | Anna: Hello! Washington, D.C. has many beautiful parks. In fact, this park reminds me of my home very far away. | 안녕하세요! Washington, D.C.에는 아름다운 공원이 많아요. 사실 이 공원을 보니 아주 멀리 있는 우리 집이 생각나요. |
| 2 | Marsha: Anna, here's your coffee. | Anna, 여기 커피예요. |
| 3 | Anna: Thanks, Marsha. | 고마워요, Marsha. |
| 4 | Marsha: What's wrong? | 무슨 일이에요? |
| 5 | Anna: I'm thinking about my family. I'm feeling homesick. | 가족 생각을 하고 있어요. 향수병이 났어요. |
| 6 | Marsha: Do you want to talk about it? | 그 이야기를 하고 싶어요? |
| 7 | Anna: Sure! I have some photos. | 물론이죠! 사진이 좀 있어요. |
| 8 | Marsha: Yes. Yes, you do! | 그래요. 맞아요, 있네요! |
| 9 | Anna: Photos really help. | 사진이 정말 도움이 돼요. |
| 10 | Anna: This is my mother and this is my father. They are rodeo clowns. | 이분은 우리 어머니고 이분은 우리 아버지예요. 두 분은 로데오 광대예요. |
| 11 | Marsha: What do rodeo clowns do? | 로데오 광대는 무슨 일을 해요? |
| 12 | Anna: They make jokes at a rodeo. They make people laugh. | 로데오에서 농담을 해요. 사람들을 웃게 만들어요. |
| 13 | Marsha: That-That';s very different. | 그, 그건 정말 색다르네요. |
| 14 | Marsha: Who is that woman in the picture? | 사진 속 저 여자분은 누구예요? |
| 15 | Anna: That is my Aunt Lavender. She is my mom's sister. She loves gardening and makes spoons. | 저분은 Aunt Lavender예요. 우리 엄마의 자매예요. 정원 가꾸기를 정말 좋아하고 숟가락을 만들어요. |
| 16 | Marsha: She makes spoons? | 숟가락을 만든다고요? |
| 17 | Anna: Of course. | 그럼요. |
| 18 | Marsha: That, too, is very different. | 그것도 정말 색다르네요. |
| 19 | Anna: Oh! This is my Uncle John. He is my father's brother. | 아! 이분은 Uncle John이에요. 우리 아버지의 형제예요. |
| 20 | Marsha: What does Uncle John do? | Uncle John은 무슨 일을 해요? |
| 21 | Anna: He's a chicken farmer. And makes guitars. He's awesome, and I'm his favorite niece. | 닭 농장을 해요. 그리고 기타를 만들어요. 정말 멋진 분이고, 저는 그분이 제일 아끼는 조카예요. |
| 22 | Marsha: Who are they? | 이 사람들은 누구예요? |
| 23 | Anna: They are my cousins. They are my Uncle John's daughter and son. | 제 사촌들이에요. Uncle John의 딸과 아들이에요. |
| 24 | Marsha: What do they do? | 이 사람들은 무슨 일을 해요? |
| 25 | Anna: They raise sheep and make sweaters. | 양을 키우고 스웨터를 만들어요. |
| 26 | Marsha: Yeah, that's not a surprise. | 네, 놀랍지도 않네요. |
| 27 | Marsha: Thanks for showing me your family photos. Your family is very different. | 가족사진을 보여 줘서 고마워요. 가족이 정말 색다르네요. |
| 28 | Anna: I do feel better. Thanks for listening. I have many more photos! | 기분이 정말 나아졌어요. 들어 줘서 고마워요. 사진이 훨씬 더 많아요! |
| 29 | Marsha: Yeah. Yeah, you do. | 그래요. 정말 그렇겠죠. |
| 30 | Anna: Washington, DC is my new home. But I like remembering my old home, too. | Washington, DC는 제 새 고향이에요. 하지만 옛 고향을 떠올리는 것도 좋아요. |
| 31 | Anna's Family Tree | Anna의 가계도 |
| 32 | This is a family tree. Anna tells Marsha about her parents. | 이것은 가계도예요. Anna가 Marsha에게 부모님에 대해 이야기해요. |
| 33 | Her mother and father are rodeo clowns. | 어머니와 아버지는 로데오 광대예요. |
| 34 | Her father's parents are from Italy. These grandparents speak Italian. | 아버지 쪽 조부모님은 Italy 출신이에요. 이 조부모님은 이탈리아어를 해요. |
| 35 | Anna's mother's parents live in California. These grandparents have a farm and raise horses. | Anna 어머니 쪽 조부모님은 California에 살아요. 이 조부모님은 농장이 있고 말을 키워요. |
| 36 | Anna's mother's sister is Aunt Lavender. She loves gardening. | Anna 어머니의 자매는 Aunt Lavender예요. 정원 가꾸기를 정말 좋아해요. |
| 37 | Anna's father has a brother. His name is John. Uncle John makes guitars. | Anna의 아버지에게는 형제가 한 명 있어요. 이름은 John이에요. Uncle John은 기타를 만들어요. |
| 38 | Uncle John has a daughter and a son. They are Anna's cousins. They raise sheep. | Uncle John에게는 딸과 아들이 있어요. 두 사람은 Anna의 사촌이에요. 양을 키워요. |
| 39 | Anna's brother has two children. They are Anna's niece and nephew. | Anna의 남자 형제에게는 아이가 둘 있어요. 두 아이는 Anna의 조카딸과 조카아들이에요. |

## lle1-13

| 줄 | 영어 | 한국어 |
|---|---|---|
| 1 | Anna: Hello! In Washington D.C. there are many things to do on a Sunday afternoon. I like to exercise. I like to shop. I like to garden. But today I feel bored. When I feel bored I always look for something unusual to do! I hear music. Let’s go see! What is going on here? | 안녕하세요! Washington D.C.에는 일요일 오후에 할 수 있는 일이 많아요. 저는 운동하는 걸 좋아해요. 쇼핑도 좋아하고요. 정원 가꾸는 것도 좋아해요. 하지만 오늘은 지루해요. 지루할 때는 늘 평소와 다른 일을 찾아봐요! 음악 소리가 들려요. 가 봐요! 여기 무슨 일이에요? |
| 2 | Rebecca: It’s a big birthday party for the writer William Shakespeare. | 작가 William Shakespeare의 큰 생일 파티예요. |
| 3 | Anna: This is a party for William Shakespeare? | William Shakespeare를 위한 파티라고요? |
| 4 | Rebecca: Yes! | 네! |
| 5 | Anna: Awesome! | 멋져요! |
| 6 | Rebecca: Awesome! | 멋져요! |
| 7 | Anna: This is a drum band. I never listen to a drum band. But today I am listening to a drum band because it’s Shakespeare’s birthday! | 이건 드럼 밴드예요. 저는 드럼 밴드를 절대 듣지 않아요. 하지만 오늘은 Shakespeare의 생일이라서 드럼 밴드를 듣고 있어요! |
| 8 | Anna: This is a puppet show. I never watch puppet shows. But today I am watching a puppet show because it’s Shakespeare’s birthday! | 이건 인형극이에요. 저는 인형극을 절대 보지 않아요. 하지만 오늘은 Shakespeare의 생일이라서 인형극을 보고 있어요! |
| 9 | Anna: My clothes are usual. His clothes are unusual. | 제 옷은 평범해요. 저분의 옷은 평범하지 않아요. |
| 10 | Anna: In Washington, D.C. seeing a politician or even the President is usual. Seeing the Queen of England is very unusual! Your majesty! | Washington, D.C.에서는 정치인이나 대통령을 보는 일도 흔해요. 영국 여왕을 보는 건 아주 드문 일이에요! 여왕 폐하! |
| 11 | Anna: This is sword fighting. I never sword fight. But today I am sword fighting because it’s Shakespeare’s birthday! | 이건 칼싸움이에요. 저는 칼싸움을 절대 하지 않아요. 하지만 오늘은 Shakespeare의 생일이라서 칼싸움을 하고 있어요! |
| 12 | Anna: There are many things to do in Washington, D.C. -- some usual, some unusual. | Washington, D.C.에는 할 일이 많아요 -- 흔한 일도 있고 평소와 다른 일도 있어요. |
| 13 | Anna: Today, I am not bored because … it is William Shakespeare’s birthday! | 오늘은 지루하지 않아요. 왜냐하면 ... William Shakespeare의 생일이니까요! |

## lle1-14

| 줄 | 영어 | 한국어 |
|---|---|---|
| 1 | Anna: Tonight I am going to the theater with my friends. But I don’t know what clothes to wear. Maybe this magazine can help. | 오늘 밤에는 친구들과 극장에 가요. 그런데 무슨 옷을 입을지 모르겠어요. 이 잡지가 도움이 될지도 몰라요. |
| 2 | Anna: Her clothes are beautiful! I really want a friend like her to help me. | 저 사람 옷이 정말 아름다워요! 저런 친구가 저를 도와주면 좋겠어요. |
| 3 | Anna: Who are you? | 누구세요? |
| 4 | Genie: I am Genie! You want help. I am here to help you find the right clothes! | 저는 Genie예요! 도움이 필요하죠. 알맞은 옷을 찾도록 제가 도와줄게요! |
| 5 | Anna: Awesome! How about jeans and a t-shirt? | 멋져요! 청바지와 티셔츠는 어때요? |
| 6 | Genie: No! Jeans and a t-shirt are too casual. How about something more formal? | 안 돼요! 청바지와 티셔츠는 너무 캐주얼해요. 좀 더 격식 있는 옷은 어때요? |
| 7 | Anna: Sure! | 좋아요! |
| 8 | Anna: Wow! Genie, this dress is beautiful. But it’s not the right size. It’s too small. | 와! Genie, 이 원피스 정말 아름다워요. 그런데 사이즈가 안 맞아요. 너무 작아요. |
| 9 | Genie: Yes, it is too small. But green looks great on you. | 맞아요, 너무 작아요. 하지만 초록색이 잘 어울려요. |
| 10 | Anna: Thanks. | 고마워요. |
| 11 | Genie: Take off the green dress. Let’s try a green shirt and a skirt. | 초록색 원피스를 벗어요. 초록색 셔츠와 치마를 입어 봐요. |
| 12 | Anna: Oh, Genie! This green shirt is too large and this orange skirt is too orange. | 아, Genie! 이 초록색 셔츠는 너무 크고 이 주황색 치마는 너무 주황색이에요. |
| 13 | Genie: Yes, the right size for you is medium. Let’s try again. | 맞아요, 잘 맞는 사이즈는 중간 사이즈예요. 다시 해 봐요. |
| 14 | Anna: Oh, I don’t like this outfit. | 아, 이 옷은 마음에 안 들어요. |
| 15 | Genie: No. That does not match. | 아니에요. 어울리지 않아요. |
| 16 | Anna: Nothing. | 아무것도 없어요. |
| 17 | Anna: These clothes are formal: a suit jacket, a dress shirt and a tie! They look great! | 이 옷들은 격식 있는 옷이에요. 정장 재킷, 와이셔츠, 넥타이요! 멋져 보여요! |
| 18 | Genie: Those clothes look great … for a man! Something is wrong. | 그 옷들은 멋져 보이네요 ... 남자에게는요! 뭔가 잘못됐어요. |
| 19 | Anna: Let me see. | 어디 봐요. |
| 20 | Anna: There. Now try. | 자, 이제 입어 봐요. |
| 21 | Genie: Oh. Thanks! Now these clothes look great on you! | 아. 고마워요! 이제 이 옷들이 잘 어울려요! |
| 22 | Anna: They do! Um, Genie, can you put on a gold belt? | 정말 그러네요! 음, Genie, 금색 벨트를 해 줄 수 있어요? |
| 23 | Genie: Sure! | 물론이죠! |
| 24 | Genie: That looks great. | 멋져 보여요. |
| 25 | Anna: Can you put on a jacket? | 재킷도 입혀 줄 수 있어요? |
| 26 | Genie: Why not? | 안 될 게 뭐 있겠어요? |
| 27 | Anna: I love the jacket! How about a hat? | 재킷이 마음에 들어요! 모자는 어때요? |
| 28 | Genie: Mm, take off the hat. That’s better. | 음, 모자는 벗어요. 그게 더 나아요. |
| 29 | Anna: Genie, these clothes look and feel great! Let’s go to the theater! | Genie, 이 옷들은 보기에도 입기에도 정말 좋아요! 극장에 가요! |
| 30 | Genie: Sorry, Anna. I have to help other friends. Go to the magazine if you want me to help again. | 미안해요, Anna. 다른 친구들도 도와야 해요. 다시 도움이 필요하면 잡지로 가세요. |
| 31 | Anna: Thanks, Genie. Sure thing. Goodbye! | 고마워요, Genie. 알겠어요. 안녕! |
| 32 | Genie: Goodbye! | 안녕! |
| 33 | Anna: There are many places in DC to go for a great evening out! And it’s nice to have a friend to help me look my best. Until next time! Bye! | DC에는 멋진 저녁 외출을 즐길 곳이 많아요! 그리고 제가 가장 멋져 보이도록 도와주는 친구가 있어서 좋아요. 다음에 또 만나요! 안녕! |

## lle1-17

| 줄 | 영어 | 한국어 |
|---|---|---|
| 1 | Marsha: Hi, Anna. What’s going on? | 안녕하세요, Anna. 별일 없어요? |
| 2 | Anna: Not much. How about you? | 별일 없어요. 당신은요? |
| 3 | Marsha: Busy as usual. Hey, do you wanna see a movie with me? | 늘 그렇듯 바빠요. 저기, 저랑 영화 보러 갈래요? |
| 4 | Anna: Sure! I never have time to see a movie. When? | 좋아요! 저는 영화 볼 시간이 전혀 없어요. 언제요? |
| 5 | Marsha: Are you busy this Thursday at 6pm? | 이번 주 목요일 저녁 6시에 바빠요? |
| 6 | Anna: Let’s see …. I’m busy. I am going to tap dance with my friends Thursday night. | 어디 보자 .... 바빠요. 목요일 밤에는 친구들과 탭댄스를 추러 갈 거예요. |
| 7 | Marsha: Tap dancing? That sounds fun! | 탭댄스요? 재미있겠어요! |
| 8 | Anna: I’m still learning. But it is fun! | 아직 배우는 중이에요. 하지만 재미있어요! |
| 9 | Anna: Are you busy on Friday night? | 금요일 밤에는 바빠요? |
| 10 | Marsha: Yes. Friday nights are when I visit my parents. | 네. 금요일 밤은 부모님을 찾아뵙는 날이에요. |
| 11 | Anna: What do you and your family do together? | 가족과 함께 뭘 해요? |
| 12 | Marsha: We always eat dinner together and sometimes we play board games. | 항상 같이 저녁을 먹고 가끔 보드게임을 해요. |
| 13 | Anna: Playing board games is fun, too! The word game Scrabble is my favorite. | 보드게임도 재미있죠! 단어 게임 Scrabble이 제일 좋아요. |
| 14 | Marsha: I like Connect Four! | 저는 Connect Four를 좋아해요! |
| 15 | Anna: I’m not busy Monday night. Are you? | 월요일 밤에는 안 바빠요. 당신은요? |
| 16 | Marsha: I am busy on Monday night. I’m going to jog in the park with my friend. Do you jog? | 월요일 밤에는 바빠요. 친구와 공원에서 조깅할 거예요. 조깅해요? |
| 17 | Anna: Oh! I always jog. Well, sometimes I jog. Okay, I never jog. But I will try because it is good for you. | 아! 저는 항상 조깅해요. 음, 가끔 조깅해요. 좋아요, 사실 절대 안 해요. 하지만 몸에 좋으니까 해 볼게요. |
| 18 | Marsha: I always feel great after I jog. | 저는 조깅하고 나면 항상 기분이 좋아요. |
| 19 | Marsha: How about on Wednesday night? | 수요일 밤은 어때요? |
| 20 | Anna: Wednesday night I am not busy. Oh, no, wait. This Wednesday night I will be busy. | 수요일 밤은 안 바빠요. 아, 아니, 잠깐만요. 이번 수요일 밤에는 바쁠 거예요. |
| 21 | Marsha: What are you doing? | 뭘 할 거예요? |
| 22 | Anna: I’m going to teach children how to play the ukulele. | 아이들에게 우쿨렐레 치는 법을 가르칠 거예요. |
| 23 | Anna: Now, children, play “C.” Good. I like your “C.” | 자, 얘들아, "C"를 쳐 보세요. 좋아요. "C" 소리가 마음에 들어요. |
| 24 | Marsha: The world does need more ukulele players. | 세상에는 우쿨렐레 연주자가 더 필요하긴 하죠. |
| 25 | Anna: Marsha, it looks like we’ll never have time to see a movie. | Marsha, 우리는 영화 볼 시간이 영영 없을 것 같아요. |
| 26 | Anna: Wait a minute. Are you busy now? | 잠깐만요. 지금 바빠요? |
| 27 | Marsha: It’s Saturday afternoon. This is always when I do my errands. | 토요일 오후잖아요. 이때는 늘 볼일을 보는 시간이에요. |
| 28 | Anna: Okay, but the new Star Wars movie is gonna start in 30 minutes. | 그래도 새 Star Wars 영화가 30분 뒤에 시작해요. |
| 29 | Marsha: I’ll do my errands on Sunday. Let’s go! | 볼일은 일요일에 볼게요. 가요! |
| 30 | Anna: Most days of the week, people are really busy. But it’s important to find time to be with your friends! | 한 주의 대부분의 날에 사람들은 정말 바빠요. 하지만 친구와 함께할 시간을 찾는 건 중요해요! |
| 31 | Anna: Until next time! | 다음에 또 만나요! |
| 32 | * Connect Four is a two-player connection game using colored discs. | * Connect Four는 색깔 있는 원반을 쓰는 2인용 연결 게임이에요. |

## lle1-18

| 줄 | 영어 | 한국어 |
|---|---|---|
| 1 | Anna: Hello, from Washington, D.C.! Today at work I am reading the news for the first time. I am really nervous. But my boss, Ms. Weaver, is here to help me. | 안녕하세요, Washington, D.C.에서 인사드려요! 오늘 회사에서 처음으로 뉴스를 읽어요. 정말 긴장돼요. 하지만 상사인 Ms. Weaver가 도와주러 와 있어요. |
| 2 | Caty: Now, Anna, remember. When we read the news we are always reading facts. We never show our feelings. | 자, Anna, 기억해요. 뉴스를 읽을 때는 항상 사실을 읽는 거예요. 감정은 절대 드러내지 않아요. |
| 3 | Anna: Sure thing, Ms. Weaver. | 알겠어요, Ms. Weaver. |
| 4 | Caty: Great. Are you ready? | 좋아요. 준비됐어요? |
| 5 | Anna: Yes. | 네. |
| 6 | Caty: Okay, let’s try the first story! | 좋아요, 첫 번째 기사를 해 봐요! |
| 7 | Anna: Hello, and welcome to The News. | 안녕하세요, The News에 오신 걸 환영합니다. |
| 8 | Anna: A new book is very popular with children and families. This is it. | 새 책이 아이들과 가족들에게 큰 인기를 끌고 있습니다. 바로 이 책입니다. |
| 9 | Anna: It is about a lost duckling. The duck's mother cannot find him. | 잃어버린 아기 오리에 대한 이야기입니다. 어미 오리가 아기 오리를 찾지 못합니다. |
| 10 | Caty: Stop! Anna, when you say the words “duck” and “duckling” you look really sad. | 멈춰요! Anna, "duck"과 "duckling"이라고 말할 때 정말 슬퍼 보여요. |
| 11 | Anna: I do? | 그래요? |
| 12 | Caty: Yes. Sad is a feeling. | 네. 슬픔은 감정이에요. |
| 13 | Anna: Sad is not a fact. Sorry. Let me try again. | 슬픔은 사실이 아니군요. 죄송해요. 다시 해 볼게요. |
| 14 | Caty: Okay, she’s trying again! And go. | 좋아요, 다시 해 보는 중이에요! 자, 시작! |
| 15 | Anna: Hello, and welcome to The News. A new book is very popular with children and families. This is it. | 안녕하세요, The News에 오신 걸 환영합니다. 새 책이 아이들과 가족들에게 큰 인기를 끌고 있습니다. 바로 이 책입니다. |
| 16 | Anna: It is about a lost duckling. The duck’s mother can not find ‘im. But a family gives him a home. | 잃어버린 아기 오리에 대한 이야기입니다. 어미 오리가 아기를 찾지 못합니다. 하지만 한 가족이 아기에게 집을 줍니다. |
| 17 | Caty: Stop! Anna, you are doing it again. | 멈춰요! Anna, 또 그러고 있어요. |
| 18 | Anna: This story is very sad. | 이 이야기는 정말 슬퍼요. |
| 19 | Caty: I have an idea. Let’s read the second story. She’s reading the second story. And … go! | 좋은 생각이 있어요. 두 번째 기사를 읽어 봐요. 지금 두 번째 기사를 읽어요. 자, 시작! |
| 20 | Anna: Hello , and welcome to The News. In Indiana, a grandmother is the first 80-year-old woman to win The Race Car 500. | 안녕하세요, The News에 오신 걸 환영합니다. Indiana에서 한 할머니가 The Race Car 500에서 우승한 첫 80세 여성이 되었습니다. |
| 21 | Anna: That is awesome! | 정말 멋져요! |
| 22 | Caty: Stop! Stop! Anna, please -- no feelings. | 멈춰요! 멈춰요! Anna, 제발 -- 감정은 안 돼요. |
| 23 | Anna: Right. But it is awesome that an 80-year-old grandmother wins a car race. | 알겠어요. 하지만 80세 할머니가 자동차 경주에서 우승한 건 정말 멋진 일이에요. |
| 24 | Caty: Just the facts, Anna. | 사실만 말해요, Anna. |
| 25 | Anna: Right. | 알겠어요. |
| 26 | Anna: Hello, and welcome to The News. In Indiana, a grandmother is the first 80-year-old woman to win The Race Car 500. | 안녕하세요, The News에 오신 걸 환영합니다. Indiana에서 한 할머니가 The Race Car 500에서 우승한 첫 80세 여성이 되었습니다. |
| 27 | Anna: She rarely talks to reporters. But when she does, she often says, “Nothing can stop me now!” | 그분은 기자들과 거의 이야기하지 않습니다. 하지만 이야기할 때는 종종 "이제 아무것도 저를 막을 수 없어요!"라고 말합니다. |
| 28 | Anna: I am very happy for her! | 저는 그분이 잘돼서 정말 기뻐요! |
| 29 | Caty: Stop, stop, stop!! Anna, you cannot say you are happy. | 멈춰요, 멈춰요, 멈춰요!! Anna, 기쁘다고 말하면 안 돼요. |
| 30 | Anna: But I am happy. | 하지만 저는 기쁜걸요. |
| 31 | Caty: But you can’t say it. | 그래도 그걸 말하면 안 돼요. |
| 32 | Anna: Why? | 왜요? |
| 33 | Caty: This is the News. Happy and sad are feelings. You can’t have them in The News. | 이건 뉴스예요. 기쁨과 슬픔은 감정이에요. 뉴스에는 감정을 넣을 수 없어요. |
| 34 | Anna: Okay. I got it. | 알겠어요. 이해했어요. |
| 35 | Caty: Okay. Let’s try the third story. She’s reading the third story! | 좋아요. 세 번째 기사를 해 봐요. 지금 세 번째 기사를 읽어요! |
| 36 | Anna: Hello and welcome to The News. | 안녕하세요, The News에 오신 걸 환영합니다. |
| 37 | City politicians in Big Town are using city money to have a big party on a cruise ship. They are taking the money for the party from the children’s library. | Big Town의 시 정치인들이 시의 돈으로 크루즈선에서 큰 파티를 열려고 합니다. 파티에 쓸 돈을 어린이 도서관에서 가져가고 있습니다. |
| 38 | Anna: What?! That makes me very angry. | 뭐라고요?! 정말 화가 나요. |
| 39 | Caty: No, no, no! Anna, you cannot say you are angry! This is The News!!! | 안 돼요, 안 돼요! Anna, 화난다고 말하면 안 돼요! 이건 뉴스예요!!! |
| 40 | Anna: What can I do, Ms. Weaver? Take out my feelings and put them here … on the news desk? | 어떻게 해야 해요, Ms. Weaver? 제 감정을 꺼내서 여기 ... 뉴스 데스크에 놓을까요? |
| 41 | Caty: Yes. Yes. That’s right! Now you’ve got it! | 네. 네. 맞아요! 이제 알았군요! |
| 42 | Caty: Let’s repeat the first story. | 첫 번째 기사를 다시 읽어 봐요. |
| 43 | Anna: This is going to be a very long day. | 정말 긴 하루가 될 것 같아요. |
| 44 | Anna: Until next time! | 다음에 또 만나요! |

## lle1-19

| 줄 | 영어 | 한국어 |
|---|---|---|
| 1 | Anna: Hi there! Summer in Washington, D.C. is hot and sunny. I always ride the Metro to work. Riding the Metro is cool and fast. But today it’s closed. So, I am walking to work. | 안녕하세요! Washington, D.C.의 여름은 덥고 화창해요. 저는 항상 Metro를 타고 출근해요. Metro를 타면 시원하고 빨라요. 그런데 오늘은 운행을 안 해요. 그래서 걸어서 출근하고 있어요. |
| 2 | (On the phone) Ms. Weaver, I am late this morning. The Metro is closed. So, I am walking to work. | (전화로) Ms. Weaver, 오늘 아침에 늦을 것 같아요. Metro가 운행하지 않아요. 그래서 걸어서 출근하고 있어요. |
| 3 | Caty: That’s too bad. It’s really hot today. | 안됐네요. 오늘 정말 더워요. |
| 4 | Anna: Yes it is. | 네, 그래요. |
| 5 | Caty: When you arrive, please come to my office. I have important news to tell you. | 도착하면 제 사무실로 와요. 알려 줄 중요한 소식이 있어요. |
| 6 | Anna: Of course. Good-bye. My boss has news for me. The question is: Is it good news or bad news? | 알겠어요. 안녕히 계세요. 상사가 저에게 전할 소식이 있대요. 문제는 이거예요. 좋은 소식일까요, 나쁜 소식일까요? |
| 7 | (At work) | (회사에서) |
| 8 | Anna: Hello, Ms. Weaver. | 안녕하세요, Ms. Weaver. |
| 9 | Caty: Anna, I have good news and I have bad news. Which do you want to hear first? | Anna, 좋은 소식과 나쁜 소식이 있어요. 어느 쪽을 먼저 듣고 싶어요? |
| 10 | Anna: The good news. No … okay, the bad news. | 좋은 소식이요. 아니 ... 아니에요, 나쁜 소식이요. |
| 11 | Caty: The bad news is you are not good at reading the news. | 나쁜 소식은 Anna가 뉴스를 읽는 데 서툴다는 거예요. |
| 12 | Anna: Oh. I am very sorry to hear that. | 아. 그런 말을 들으니 정말 속상해요. |
| 13 | Caty: So, starting next month you will not read the news. | 그래서 다음 달부터는 뉴스를 읽지 않게 될 거예요. |
| 14 | Anna: Next month is July. You are firing me in July. | 다음 달은 7월이에요. 7월에 저를 해고하시는 거네요. |
| 15 | Caty: No. I am not firing you in July … or in August or in September. That is the good news. | 아니에요. 7월에도, 8월에도, 9월에도 해고하지 않아요. 그게 좋은 소식이에요. |
| 16 | Anna: Okay. You are not firing me. I am not reading the news. What will I be doing? | 알겠어요. 해고하지 않으시는군요. 뉴스는 읽지 않고요. 그럼 저는 무엇을 하게 되나요? |
| 17 | Caty: Well, you are good at asking questions. You are good at talking to people. You are good at showing your feelings. And you are great at being silly. | 음, Anna는 질문을 잘해요. 사람들과 이야기를 잘 나눠요. 감정을 잘 드러내요. 그리고 엉뚱하게 구는 데는 최고예요. |
| 18 | Anna: Thank you, Ms. Weaver. But what does all that mean? | 고마워요, Ms. Weaver. 그런데 그게 다 무슨 뜻이에요? |
| 19 | Caty: I have a new assignment for you! Your skills are perfect for a new show … a children’s show. | 새 임무가 있어요! Anna의 능력은 새 프로그램에 딱 맞아요 ... 어린이 프로그램이에요. |
| 20 | Anna: A children’s show ... That is awesome! When do I start? | 어린이 프로그램이요 ... 정말 멋져요! 언제 시작해요? |
| 21 | Caty: You start next month. Start thinking of ideas for the show. | 다음 달부터 시작해요. 프로그램 아이디어를 생각해 보기 시작해요. |
| 22 | Anna: I have tons of ideas! I can show children what it’s like in outer space ... | 아이디어가 엄청 많아요! 아이들에게 우주가 어떤지 보여 줄 수 있어요 ... |
| 23 | Caty: Great … | 좋아요 ... |
| 24 | Anna: … or in the deep, dark ocean … | ... 아니면 깊고 어두운 바다 속이요 ... |
| 25 | Caty: Those are great ideas, Anna. Please go think of more … at your desk. | 좋은 아이디어예요, Anna. 책상으로 가서 더 생각해 와요. |
| 26 | Anna: Yes. What other things can I show them? Mt. Everest! Everyone has different skills. You have skills. I have skills. The important thing is to know what you are good at. Until next time! | 네. 아이들에게 또 무엇을 보여 줄 수 있을까요? Mt. Everest! 사람마다 능력이 달라요. 당신에게도 능력이 있고 저에게도 능력이 있어요. 중요한 건 자신이 무엇을 잘하는지 아는 거예요. 다음에 또 만나요! |
