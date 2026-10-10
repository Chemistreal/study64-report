# 지은 영어 낱말 등급표

신뢰도: B 생성 (내가 매긴 등급이다. 공식 목록이 아니다. 방법과 한계는 docs/authored.md 4장)
검증로그: 2026-10-10 / 저장소에 쓸 수 있는 등급 낱말 목록이 없어서(docs/sources.md 4장: NGSL BY-SA, CEFR-J 약관 불명) 장면에 쓰는 낱말만 직접 매겼다. 일반 CEFR 지식과 쓰임 빈도 감으로 / 보류 / 사용자나 대화 세션이 바꿀 수 있다. 다음 라운드에서 나들이마다 낱말이 늘 때 같이 늘린다

`scripts/authored_lib.py` 가 읽는다. 아래 코드 블록의 머리말(`A1` `A2` `B1` `B2`)이 등급이다. 낱말은 어간으로 센다(`pancakes` 와 `pancake` 는 같다).

**규칙.**

- 이미 들은 낱말(그 세션까지 말뭉치 대본에 나온 낱말)은 여기 없어도 된다. 그 밖의 낱말은 여기 올라 있어야 한다. **없으면 실패다.**
- 한 낱말은 한 등급에만 둔다. 겹치면 실패다.
- 올릴 때는 그 낱말이 **그 뜻으로** 어느 등급인지 본다. `check` 는 계산서 뜻이면 A2 다.
- 고유 이름(가게, 지명)은 여기 안 올린다. 나들이의 `허용 이름` 메타로 허락한다.
- 등급을 바꾸면 그 낱말이 든 줄이 다시 검사된다. 내려 매기고 싶은 유혹을 조심한다. 바꾼 까닭을 검증로그에 쓴다.

## 1. 음식과 식당

```A1
anything breakfast lunch dinner coffee tea juice water milk egg toast bread pancake bacon sausage rice fruit apple banana
orange sandwich salad soup chicken fish beef cheese cookie cake ice snack sugar salt menu table order drink eat enjoy
card cash dollar cent twenty thirty forty fifty hundred check cup glass plate bottle bag
```

```A2
bill tip receipt waiter waitress server hungry thirsty delicious tasty fresh spicy sweet sour dessert noodle bowl fork spoon knife napkin straw refill share reservation seat wait ready bring recommend special lemonade
```

```B1
vegetarian allergic allergy ingredient portion appetizer entree undercooked overcooked complain refund substitute
```

## 2. 가게와 쇼핑

```A1
buy pay price shop store size color red blue green black white big small
```

```A2
cheap expensive sale discount cashier wallet receipt fit shirt shorts dress shoes hat sunglasses sunscreen towel gift souvenir wrap return exchange change available
```

```B1
refund warranty broken defective customer lease coupon bargain
```

## 3. 길, 탈것, 장소

```A1
bus taxi car walk left right straight corner street map near far here there stop
```

```A2
ticket station airport hotel beach park library bank pharmacy hospital doctor nurse medicine post office driver transfer schedule arrive leave late early minute hour block downstairs upstairs
```

```B1
passenger rental license insurance deposit luggage delay boarding reserve itinerary directions entrance admission
guided tour lookout trail summit hike
```

## 4. 사람과 관계, 일상

```A1
morning afternoon evening night today tomorrow yesterday
```

```A2
neighbor invite introduce welcome tonight weekend
```

## 5. 동사, 부사, 기능어

```A1
get give have want need like love please thank sorry help ask say tell look see know think try take make come go
more some any another other else very much many too also again
```

```A2
would could should prefer decide choose borrow lend agree explain repeat spell sure certainly probably maybe actually
```

```B1
suggest mind apologize arrange afford manage
```

```B2
fascinating unfortunately accommodate
```

## 6. 이 등급표가 아직 안 덮는 것

나들이 하나를 집필할 때마다 이 표에 낱말을 올린다. 올리지 않은 낱말이 든 줄은 `check_authored.py` 가 막는다. 그것이 일부러 둔 마찰이다. 낱말을 올리는 순간 등급을 한 번 생각하게 한다.

## 7. 추가 낱말 (첫 공개 집필 라운드 A조: cookie_snack, shave_ice_snack, musubi_day, leonards_malasadas, food_truck_lunch, cheesecake_dessert)

하와이 음식 이름은 그 장소에서 실제로 듣는 이름이라 올렸다. 등급은 쓰임 감으로 매겼다.

```A1
box chocolate coconut each same flavor strawberry mango lemon kind aloha cinnamon half little number piece
six eight ten eleven twelve fourteen sixteen
musubi malasada cookies
```

```A2
shave enough total careful follow smell
```

## 8. 나들이 여섯 집필(part B)에서 올린 낱말

neighbor_greeting, hotel_front_desk, cafe_order, convenience_store_abc, pharmacy_basic, bus_fare_question 을 쓰며 올린 낱말이다. 등급은 이 낱말이 **그 장면의 뜻으로** 어느 등급인지 본 것이다.

```A1
fine can do name number five six eight nine twelve key just of will hot large medium us soap zoo
```

```A2
latte iced toothpaste bandage shampoo fare yet elevator pool
```

## 9. 해변, 동물원, 전망대, 물놀이 장비 (집필 part C)

알라모아나 기본 쇼핑, 와이키키 해변 의자와 우산, 호놀룰루 동물원 표, 다이아몬드 헤드 전망대 길 묻기, 하나우마 장비 빌리기에서 올린 낱말이다. `rent` 는 올리지 않았다: world.md 6.2 연속성이 37주 전의 `rent` 를 막는다(월세). 그래서 빌리기는 "Two chairs, please." 로 말한다.

```A1
chair ten zoo up stay
```

```A2
umbrella adult stair view mask touch spot
```

```B1
fin snorkel
```
