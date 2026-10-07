# 동네 안내문. 정부 자료의 사실을 쉬운 영어로 새로 쓴 것

신뢰도: B 생성 (사실은 근거가 있다. 영어는 내가 새로 썼다. 원어민 확인 전)
검증로그: 2026-10-07 / USCIS M-618 (rev. 09/15), FEMA Ready 허리케인 V-1006 (2023-09), 쓰나미 V-1011 원본 PDF 를 받아 둔 사본과 쪽마다 대조 / 보류 / 사실은 맞췄다. 영어 문장이 자연스러운지는 spec 5.2 표본 검증을 기다린다
상위 규격: docs/expansion.md 5장
작성일: 2026-10-07

**이 파일이 원본이다.** `scripts/derive_ext_notices.py` 가 읽어 `out/data/ext_notices.json` 을 낸다.
게임 안에서는 숙소와 동네 게시판, 라디오 방송으로 나온다. **화면에 "학습용 인공물. 공식 안내문이 아니다" 를 늘 단다.**

## 1. 쓰는 법

| 규칙 | 무엇 |
|---|---|
| 사실만 가져온다 | 원문 문장을 옮기지 않는다. M-618 은 고치지 않은 배포만 허락하고 Ready.gov 는 고치지 않기를 바란다 |
| 줄마다 근거 | 영어 줄 앞 `[f1]` 이 그 안내문의 근거 칸 f1 을 가리킨다. `[장면]` 은 사실이 아니라 게임 안 지시다 (프런트에 묻기 등) |
| 낱말 문 | 그 주까지 들은 LLE1 낱말 + docs/wordlist.md + docs/expansion.md 9장. 밖의 낱말이 하나라도 있으면 파생기가 안 낸다 |
| 마크와 로고와 사진 | 안 쓴다. 기관 이름도 화면에 안 쓴다. 근거 칸에만 있다 |
| 숫자 | 911 같은 숫자는 원문 그대로 쓴다. 낱말로 안 센다 |

근거 원본 (받아 둔 사본의 sha256 은 `/home/user/game_store/gov/README.md` 에 있다)

| 기호 | 문서 | 주소 |
|---|---|---|
| M618 | USCIS M-618 Welcome to the United States (rev. 09/15) | https://www.uscis.gov/sites/default/files/document/guides/M-618.pdf |
| HUR | FEMA Be Prepared for a Hurricane (V-1006, 2023-09) | https://www.ready.gov/sites/default/files/2024-07/ready.gov_hurricane_info-sheet.pdf |
| TSU | FEMA Be Prepared for a Tsunami (V-1011) | https://www.ready.gov/sites/default/files/2020-03/tsunami-information-sheet.pdf |

## 2. 안내문

### n01
- 주: 1
- 갈래: 게시판
- 장소: 숙소 로비
- 제목: Call 911
- f1: M618 #page=85 (책 79쪽) "Call 911 to: Report a fire ... Request emergency medical help"
- f2: M618 #page=86 (책 80쪽) "If you do not speak English, tell the operator what language you speak. An interpreter should come on the line."
- f3: M618 #page=86 (책 80쪽) "When the operator answers, there will be silence on the phone for several seconds. Do not hang up."
- 검증로그: 2026-10-07 / M618 79~80쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] Fire? Call 911.
[f1] A person is very sick? Call 911.
[f3] Wait. Do not hang up.
[f2] You do not speak English? Say your language. A person will help you.
```

### n02
- 주: 3
- 갈래: 게시판
- 장소: 버스 정류장
- 제목: The City Bus
- f1: M618 #page=49 (책 43쪽) "Anyone can ride public transportation for a small fee."
- f2: M618 #page=49 (책 43쪽) "In some places, you can buy a card to use for several trips on trains or buses. You can also pay for each trip separately."
- f3: M618 #page=49 (책 43쪽) "Taxis are more expensive than public transportation."
- 검증로그: 2026-10-07 / M618 43쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] Anyone can ride the city bus.
[f1] It is not a lot of money.
[f2] You can buy a bus card at the store. Use it every day.
[f2] Or you can pay with cash on the bus.
[f3] A taxi is more money than the bus.
```

### n03
- 주: 4
- 갈래: 게시판
- 장소: 숙소 로비
- 제목: A Bank Account
- f1: M618 #page=54 (책 48쪽) "A bank account is a safe place to keep your money. ... Checking accounts and savings accounts are two common ones."
- f2: M618 #page=54 (책 48쪽) "When you open an account, you will be asked to prove your identity."
- f3: M618 #page=54 (책 48쪽) "It is not safe to carry around large amounts of cash or to leave cash in your home"
- 검증로그: 2026-10-07 / M618 48쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] A bank is a safe place for your money.
[f2] Do you want a bank account? Take your card with your name and photo.
[f3] Do not keep a lot of cash in your room.
[f3] Do not carry a lot of cash on the street.
```

### n04
- 주: 5
- 갈래: 게시판
- 장소: 시장
- 제목: Get a Receipt
- f1: M618 #page=29 (책 23쪽) "Try to avoid paying cash for services. Make sure you get a receipt for your payment. Be sure to keep your original documents."
- 검증로그: 2026-10-07 / M618 23쪽 원문 대조 / 보류 / 원문은 이민 상담 비용 대목이다. 영수증을 받으라는 사실만 가져왔다
- 메모: 원문은 이민 서비스에 돈을 낼 때다. 게임에서는 동네 가게로 옮겼다. 사실 줄은 "돈을 내면 영수증을 받아 둔다" 하나다

```
[f1] When you pay, ask for a receipt.
[f1] Keep the receipt in a safe place.
[장면] Do you want to return something? Take the receipt to the store.
```

### n05
- 주: 7
- 갈래: 게시판
- 장소: 숙소 로비
- 제목: Know Your Neighbors
- f1: M618 #page=83 (책 77쪽) "To help keep your neighborhood safe, get to know your neighbors. Talk with them about how to handle an emergency in your area."
- 검증로그: 2026-10-07 / M618 77쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] Say hello to the people on your street.
[f1] Learn their names.
[f1] Talk with them about a bad storm. What will you do? Where will you go?
[f1] A good neighbor helps you, and you help them.
```

### n06
- 주: 10
- 갈래: 게시판
- 장소: 숙소 로비
- 제목: A Hurricane Is Coming
- f1: HUR 1쪽 "Know your evacuation zone"
- f2: HUR 2쪽 "Gather enough food, water and emergency supplies to last you several days."
- f3: HUR 1쪽 "Evacuate immediately if told to do so. If not, take shelter from high winds in ... an interior room."
- f4: HUR 2쪽 "If you do not evacuate, take shelter indoors and stay away from windows and doors."
- 검증로그: 2026-10-07 / FEMA V-1006 1~2쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] A big storm is coming this week.
[f2] Have food and water for many days.
[f1] Ask the front desk: Where do we go?
[f3] They say go? Go now.
[f4] You stay here? Stay inside, away from the windows and doors.
```

### n07
- 주: 10
- 갈래: 방송
- 장소: 숙소 라디오
- 제목: Storm Radio 1
- f1: HUR 2쪽 "Monitor weather reports and updates ... Be on alert for heavy rain."
- f2: HUR 1쪽 "Turn around, don't drown! Do not walk, swim or drive through floodwaters."
- 검증로그: 2026-10-07 / FEMA V-1006 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] This is the weather. Heavy rain is coming tonight.
[f2] Do not walk in the water on the street.
[f2] Do not drive in the water.
[f1] Listen to the radio for more news.
```

### n08
- 주: 10
- 갈래: 방송
- 장소: 숙소 라디오
- 제목: Storm Radio 2
- f1: HUR 2쪽 "Plan to text or message because you may not be able to make or receive phone calls."
- f2: HUR 1쪽 "Only use generators outdoors and away from windows."
- 검증로그: 2026-10-07 / FEMA V-1006 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] The phones are very busy.
[f1] Send a text to your family. Do not call.
[f2] Is your power out? Never use a generator inside.
```

### n09
- 주: 11
- 갈래: 게시판
- 장소: 진료소
- 제목: The Clinic
- f1: M618 #page=76 (책 70쪽) "Most communities have at least one health care facility that provides free or low-cost services. These are sometimes called clinics or community health centers."
- f2: M618 #page=76 (책 70쪽) "If you need immediate medical care, you can go to the emergency room of the nearest hospital"
- 검증로그: 2026-10-07 / M618 70쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] This is a clinic. A doctor can see you here.
[f1] It does not cost a lot of money.
[장면] Please make an appointment at the front desk.
[f2] Very sick at night? Go to the hospital.
```

### n10
- 주: 12
- 갈래: 게시판
- 장소: 숙소 로비
- 제목: Keep Your Papers Safe
- f1: HUR 2쪽 "Keep important documents in a dry, safe place such as a fireproof and waterproof box, and create password-protected digital copies."
- 검증로그: 2026-10-07 / FEMA V-1006 2쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] Keep your important papers in a dry and safe place.
[f1] Take a photo of each paper with your phone.
[f1] Then you have a copy.
```

### n11
- 주: 14
- 갈래: 게시판
- 장소: 도서관
- 제목: Your Number Card
- f1: M618 #page=59 (책 53쪽) "Leaving your Social Security card at home in a safe place. Do not carry it with you."
- f2: M618 #page=59 (책 53쪽) "Making sure you know and trust the people or businesses you give your personal information to"
- 검증로그: 2026-10-07 / M618 53쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] Do you have a Social Security card? Keep it at home in a safe place.
[f1] Do not carry it with you every day.
[f2] Someone on the phone asks for your number? Do not say it.
[f2] Give your number only to people you know.
```

### n12
- 주: 23
- 갈래: 게시판
- 장소: 숙소 로비
- 제목: Check Your Storm Kit
- f1: M618 #page=82 (책 76쪽) "Prepare a disaster kit that includes a flashlight, portable radio, extra batteries, blankets, first-aid supplies, and enough canned or packaged food and bottled water to last for at least three days."
- f2: M618 #page=82 (책 76쪽) "Keep all of these things in one place where it is easy to find them."
- 검증로그: 2026-10-07 / M618 76쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] It is a new year. Look at your storm kit.
[f1] You need a light, a radio, and batteries.
[f1] You need food and water for three days.
[f2] Put it all in one place. Then you can find it fast.
```

### n13
- 주: 24
- 갈래: 게시판
- 장소: 도서관
- 제목: A First-Aid Kit
- f1: M618 #page=83 (책 77쪽) "Keep a first-aid kit at home, at work, and in your car. A first-aid kit has items you can use for small injuries or for pain, such as bandages ..."
- f2: M618 #page=83 (책 77쪽) "You can take a first-aid training class through your local Red Cross."
- 검증로그: 2026-10-07 / M618 77쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] Keep a first-aid kit at home, at work, and in your car.
[f1] It has things for small cuts and pain.
[f2] You can take a first-aid class. Ask at the front desk of the library.
```

### n14
- 주: 25
- 갈래: 게시판
- 장소: 사무실
- 제목: Your Number for Work
- f1: M618 #page=34 (책 28쪽) "Your Social Security number is also used by financial institutions and other agencies ... You may be asked for your Social Security number when you rent an apartment"
- f2: M618 #page=34 (책 28쪽) "The Social Security office can provide an interpreter free of charge to help you apply for a Social Security number."
- f3: M618 #page=35 (책 29쪽) "You should receive your Social Security card about two weeks after the SSA has all documents needed for your application."
- 검증로그: 2026-10-07 / M618 28~29쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] A new job will ask for your Social Security number.
[f1] A bank will ask for it too.
[f2] Do you need help in your language? The office will find a person for you. It is free.
[f3] Your card comes in the mail. It takes about two weeks.
```

### n15
- 주: 27
- 갈래: 게시판
- 장소: 해변
- 제목: Tsunami: When the Ground Shakes
- f1: TSU 2쪽 "If you are in a tsunami area and there is an earthquake, first protect yourself from the earthquake. Drop, Cover, and Hold On."
- f2: TSU 2쪽 "When the shaking stops ... move immediately to a safe place as high and as far inland as possible."
- f3: TSU 1쪽 "Be alert to signs of a tsunami, such as a sudden rise or draining of ocean waters."
- f4: TSU 2쪽 "Evacuation routes are often marked by a wave with an arrow in the direction of higher ground."
- 검증로그: 2026-10-07 / FEMA V-1011 1~2쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] Is the ground shaking? First, get down. Cover your head. Hold on.
[f2] When it stops, walk up and away from the water. Go high. Go now.
[f3] Is the ocean water going away very fast? Do not look. Go.
[f4] Look for the signs with a wave and an arrow. They show the way up.
[f2] Do not wait for the radio.
```

### n16
- 주: 31
- 갈래: 게시판
- 장소: 새 집
- 제목: Smoke Alarms
- f1: M618 #page=82 (책 76쪽) "Make sure you have smoke alarms on the ceiling near bedrooms and on each level of your house. Check the alarm each month to make sure it works. Replace the batteries in your smoke alarms at least once a year."
- 검증로그: 2026-10-07 / M618 76쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] A smoke alarm makes a loud sound when there is smoke.
[f1] Put one near every bedroom.
[f1] Check it every month. Push the button.
[f1] Put in new batteries one time every year.
```

### n17
- 주: 33
- 갈래: 게시판
- 장소: 사무실
- 제목: Where We Meet
- f1: M618 #page=82 (책 76쪽) "Practice with your family how to get out of your house in case of a fire or other emergency. ... Plan a place to meet"
- 검증로그: 2026-10-07 / M618 76쪽 원문 대조 / 보류 / 원문은 집과 가족이다. 사무실로 옮겼다
- 메모: 원문은 가족과 집이다. 게임에서는 일터 동료로 옮겼다. 사실 줄은 "나가는 길을 연습하고 만날 곳을 정한다" 다

```
[f1] Do you know the way out of this office? Walk it one time this week.
[f1] We meet at the big tree in front of the building.
[f1] Wait there. We count everyone.
```

### n18
- 주: 34
- 갈래: 게시판
- 장소: 사무실
- 제목: Drop, Cover, Hold On
- f1: TSU 2쪽 "Drop to your hands and knees. Cover your head and neck with your arms. Hold on to any sturdy furniture until the shaking stops."
- 검증로그: 2026-10-07 / FEMA V-1011 2쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] When the ground shakes, get down on your hands and knees.
[f1] Cover your head and neck with your arms.
[f1] Get under a strong desk or table and hold on.
[f1] Stay there until the shaking stops.
```

### n19
- 주: 38
- 갈래: 게시판
- 장소: 동네 게시판
- 제목: A Plan With Your Neighbors
- f1: M618 #page=83 (책 77쪽) "Talk with them about how to handle an emergency in your area. If you have neighbors with disabilities, see if they will need special help in the event of an emergency."
- f2: M618 #page=82 (책 76쪽) "Ask a friend or family member living in another area to be the main person your family will call if you are separated in an emergency."
- 검증로그: 2026-10-07 / M618 76~77쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] Talk with your neighbors about a storm plan.
[f1] Does a neighbor need help to walk or to see? Ask them now, not in the storm.
[f2] Choose one friend in a different city. Everyone in the family calls that friend.
[f2] Then you know where everyone is.
```

### n20
- 주: 42
- 갈래: 게시판
- 장소: 동네 게시판
- 제목: Fire Safety Meeting
- f1: M618 #page=82 (책 76쪽) "Practice with your family how to get out of your house in case of a fire or other emergency. Make sure your children know what the smoke alarm sounds like and what to do if they hear it."
- f2: M618 #page=82 (책 76쪽) "Choose one spot outside of your home to meet and another spot outside of your neighborhood, in case you cannot return home."
- 검증로그: 2026-10-07 / M618 76쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[장면] Fire safety meeting this Saturday at the community center.
[f1] We will practice how to get out of a house fast.
[f1] Bring your children. They need to know the sound of the smoke alarm.
[f2] Choose two places to meet. One near your house. One far from your street.
```

### n21
- 주: 46
- 갈래: 게시판
- 장소: 새 집
- 제목: The Power Is Out
- f1: M618 #page=84 (책 78쪽) "Have a television or radio in your home that works on batteries in case electricity in your area is temporarily lost."
- f2: M618 #page=84 (책 78쪽) "Listen to the radio or television for instructions."
- 검증로그: 2026-10-07 / M618 78쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] Keep a radio that works with batteries.
[f2] When the power goes out, turn on the radio and listen.
[f2] The radio will tell you what to do.
[f1] Keep new batteries for it in your storm kit.
```

### n22
- 주: 47
- 갈래: 게시판
- 장소: 동네 게시판
- 제목: Storm Season
- f1: HUR 1쪽 "Hurricanes ... are most active in September."
- f2: HUR 2쪽 "Sign up to receive emergency alerts and notifications from your local emergency management office."
- f3: HUR 2쪽 "Secure outdoor items and furniture or move them indoors."
- 검증로그: 2026-10-07 / FEMA V-1006 1~2쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] The storm months are coming. Big storms come most often in September.
[f2] Get the storm news on your phone.
[f3] Before a storm, bring your chairs and tables inside the house.
[f2] Then you will know when a storm is coming.
```

### n23
- 주: 47
- 갈래: 방송
- 장소: 새 집 라디오
- 제목: Storm Radio 3
- f1: HUR 2쪽 "Practice going to a safe shelter for high winds ... a small, interior windowless room in a sturdy building."
- 검증로그: 2026-10-07 / FEMA V-1006 2쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] This is the weather. Strong wind is coming tonight.
[f1] Find a small room with no windows in your home.
[f1] Stay in that room until the wind stops.
```

### n24
- 주: 47
- 갈래: 방송
- 장소: 새 집 라디오
- 제목: Storm Radio 4
- f1: HUR 2쪽 "If you experience flooding, go to the highest level of the building ... but do not climb into a closed attic."
- 검증로그: 2026-10-07 / FEMA V-1006 2쪽 원문 대조 / 보류 / 영어 원어민 확인 전

```
[f1] There is water in some streets tonight.
[f1] Is there water in your building? Go up to a higher floor.
[f1] Do not go into a closed room under the roof.
```
