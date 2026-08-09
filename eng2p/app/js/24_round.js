/* =========================================================================
   같은 판. **망 없이 두 기기가 같은 것을 보고 다른 것을 본다.**

   `docs/round.md` 가 정했다. 두 기기가 세션 중에 한 마디도 못 주고받는다.
   그래서 **둘 다 이미 아는 것에서 똑같이 셈해 낸다.**

     시작일    짝 코드가 맞춰 놓는다
     오늘      기기 시계
     판 번호   세션이 정한다
     회 번호   판 안에서 센다

   이 넷에서 나오는 것은 두 기기에서 반드시 같다.
   **시계에서 나오는 것은 안 그렇다.** 그래서 여기에 `Date.now()` 도 무작위도 없다.
   ========================================================================= */

/* 넷을 한 수로 접는다. 짝 코드의 검사 글자와 같은 꼴이다.
   자리마다 무게를 달리 줘야 자리를 바꿔 넣은 것이 다른 수가 된다. */
function roundSeed(playId, step){
  var s=String(S.start||"")+"|"+today()+"|"+String(playId)+"|"+String(step|0);
  var n=7;
  for(var i=0;i<s.length;i++) n=(n*31+s.charCodeAt(i))%2147483647;
  /* **끝에 한 번 더 섞는다.** 안 섞으면 아랫자리가 안 흩어진다.

     글자 하나만 다른 두 글월은 이 셈에서 딱 그 글자 차이만큼 다른 수가 된다.
     0회와 1회가 씨앗 1 차이가 되고, 그 씨앗으로 판 표시를 만들었더니
     "01" 과 "02" 가 나왔다. **다르기는 한데 나란하다.**
     나란한 표시는 두 사람이 흘끗 보고 같다고 여긴다. T239 */
  n^=n>>>13; n=(n*1274126177)%2147483647; n^=n>>>7;
  return n<0 ? n+2147483647 : n;
}
/* 씨앗 하나에서 수를 이어 뽑는다. **부르는 차례가 값을 정한다.**
   그래서 부르는 쪽이 늘 같은 차례로 불러야 두 기기가 같아진다. */
function roundNext(st){
  st.n=(st.n*1103515245+12345)%2147483647;
  if(st.n<0) st.n+=2147483647;
  return st.n;
}
/* 0에서 n-1 을 씨앗대로 섞는다. 뒤에서 앞으로 도는 자리 바꾸기다.
   **둘 다 같은 씨앗이면 같은 차례가 나온다.** 그것이 이 함수가 있는 이유다. */
function roundOrder(n, seed){
  var a=[], st={n:seed};
  for(var i=0;i<n;i++) a.push(i);
  for(var j=n-1;j>0;j--){
    var k=roundNext(st)%(j+1);
    var t=a[j]; a[j]=a[k]; a[k]=t;
  }
  return a;
}

/* 몇 회마다 자리가 도는가. 판이 값으로 준다 (규칙서가 판마다 다르게 적었다).
   **홀짝이 뒤집히는 자리가 자리가 바뀌는 자리다.** */
function roundTurn(step, every){
  every=Math.max(1, every|0);
  return Math.floor((step|0)/every)%2;
}
/* 이 기기가 지금 첫째 자리인가. **기기마다 다르게 나오는 것이 맞다.**
   한 기기가 읽는 쪽이면 다른 기기는 짚는 쪽이어야 한다.

   기기 쪽을 안 골랐으면 null 이다. 그때는 한 기기로 도는 날이고
   화면이 둘을 다 보인다. 가려 봐야 볼 사람이 하나다. */
function roundFirst(step, every){
  var mine=(typeof deviceSide==="function")?deviceSide():null;
  if(!mine) return null;
  return (mine==="a") === (roundTurn(step, every)===0);
}
/* 이 기기가 지금 무슨 자리인가. 판이 두 자리의 이름을 준다.
   `names` 는 ["읽는 쪽","짚는 쪽"] 꼴이다. */
function roundRole(step, every, names){
  var f=roundFirst(step, every);
  if(f===null) return null;
  return f ? names[0] : names[1];
}
/* 다음에 자리가 바뀌는 회. **언제 바뀌는지를 화면이 미리 말해야 한다.**
   규칙서가 "넉 줄마다 바뀐다" 고 적어 놓고 화면이 안 말하면 두 사람이 센다. */
function roundNextTurn(step, every){
  every=Math.max(1, every|0);
  return (Math.floor((step|0)/every)+1)*every;
}

/* 이 기기가 볼 몫. `parts` 는 두 몫이다. 첫째 자리가 첫 몫을 본다.
   기기 쪽을 안 골랐으면 둘 다 돌려준다. */
function roundPart(step, every, parts){
  var f=roundFirst(step, every);
  if(f===null) return {both:true, mine:parts, hidden:[]};
  return f ? {both:false, mine:[parts[0]], hidden:[parts[1]]}
           : {both:false, mine:[parts[1]], hidden:[parts[0]]};
}

/* 두 기기가 같은 판에 있는지를 사람이 견줄 수 있게 만든 짧은 표시.
   **회 번호는 각자 센다.** 어긋나면 이 글자가 달라지고 그것을 사람이 본다.
   `docs/round.md` 6장이 그것을 프로토콜이라고 적었다. */
function roundTag(playId, step){
  /* 서른두 글자 두 자리라 1024다. 36으로 나누고 32로 나머지를 내면
     두 자리가 서로 다른 셈을 하게 되고 첫 자리가 안 흩어진다. */
  var n=roundSeed(playId, step)%1024;
  var abc="0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  return abc[Math.floor(n/32)]+abc[n%32];
}
