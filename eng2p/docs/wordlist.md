신뢰도: A 생성 (제작 관리)

# 대본 밖 낱말 목록

`scripts/check_ground.py` 가 이 파일을 읽는다. **여기 없는 낱말이 재료에 나오면 실패다.**

## 왜 이 목록이 있는가

제작물의 영어 재료에 나오는 낱말을 52과 대본과 견준다.
대본에 있으면 근거가 있는 것이다. 대본에 없으면 **내가 넣은 것이다.**

대본에 없다고 틀린 것이 아니다. 52과는 151분 1681줄이다.
`milk` 나 `chocolate` 가 거기 없는 것은 그 낱말이 나빠서가 아니라 **말뭉치가 작아서다.**
그러니 없다고 지우지 않는다. **대신 내가 넣었다는 것을 여기 적는다.**

적게 하는 것이 이 목록의 일이다. 지어낸 철자를 하나 넣으려면
**이 파일에 그 철자를 적어야 한다.** 적히면 보인다. 안 적으면 검사가 막는다.

## 1. 고칠 것

**비었다. T138 과 T139 에 여섯을 다 걷어냈다.**

`hafta` `hasta` `oughta` `dunno` `gimme` `lemme` 였다.
카드와 강의와 세트와 비상판에서 원형으로 바꿨다.
지어낸 철자를 또 넣으면 이 칸에 적어야 하고, 적으면 검사가 개수를 크게 낸다.

## 2. 조각

낱말이 아니다. 자음군과 어말 자음 드릴에 쓰는 소리 조각이다.
`spl` 은 `splash` 의 앞이고 `pple` 은 `apple` 의 뒤다.

```
ing ool pple reet rong sch sp spl
st
```

## 3. 낱말

보통 영어 낱말이다. 52과 대본에 안 나올 뿐이다.
드릴이 그 소리를 필요로 해서 내가 골랐다. 고른 근거는 음운이지 말뭉치가 아니다.

```
adjacent already asked black booking cheap chocolate choose
closes closing comfortable contest correct difficulty dog education
experience fish hold itinerary jumped korea leg load
lock longer maps market message mile miles milk
needed needs object parade pardon pear permit polite
pray preliminary present print rained reason red reimburse
ring salt save sea sell shave sheet shell
shock shore showed shy sigh sip six sky
sleeping sock sort splash stayed strange strong student
stuff support table text tried tuesday vegetable vicinity
waited washing worked
```
