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

**대본에 없는 철자로 구어 형태를 주장한 것들이다.**

`gonna` 와 `wanna` 와 `gotta` 는 글로도 쓰고 대본에도 있다. 아래 여섯은 아니다.
소리를 글자로 흉내 낸 표기이고 **영어 제로인 두 사람이 그것을 배운 형태로 알고 적게 된다.**

원형으로 적고 줄여 읽으라는 것은 지시문이 시킨다.
**줄이는 것은 입이 하는 일이지 글자가 하는 일이 아니다.**

T138 에 Q1 051~100 을 그렇게 고쳤다. 나머지는 T139 와 T140 이다.
이 칸이 비면 그 일이 끝난 것이다.

```
dunno gimme hafta hasta lemme oughta
```

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
