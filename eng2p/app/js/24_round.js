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

/* =========================================================================
   판 화면 두 조각. **E단계 스무 판이 다 이 둘을 쓴다.**

     가리기      이 기기 몫만 보이고 상대 몫은 자리만 남는다
     동시 공개   내 것을 다 적기 전에는 안 펴진다

   여기서 만들어 두고 판마다 새로 안 만든다.
   스무 번 새로 만들면 스무 벌이 조금씩 다르게 되고 그중 하나가 안 가린다.
   ========================================================================= */

/* 가리는 자리. **없는 것처럼 만들지 않는다.** 자리를 남기고 왜 안 보이는지를 적는다.
   빈 자리로 두면 두 사람이 앱이 고장 난 줄 안다. 가린 것과 없는 것은 다르다. */
function veilPane(mine, hidden, who){
  var h='<div class="vpane"><div class="vmine">'+
        mine.map(function(x){ return '<div>'+esc(x)+'</div>'; }).join("")+'</div>';
  if(hidden && hidden.length)
    h+='<div class="vhid" aria-hidden="true"><span>'+
       esc((who||"상대")+" 화면에만 있다")+'</span></div>';
  return h+'</div>';
}

/* 동시 공개.

   `docs/round.md` 5장이 정했다. **상대가 다 적었는지를 이 기기가 알 길이 없다.**
   그래서 반만 셈으로 한다.

     셈이 하는 것    내 것이 비어 있으면 안 펴진다
     사람이 하는 것  상대가 됐다고 말해 주는 것

   시계로 맞추지 않는다. 두 기기가 시작을 각자 눌러 몇 초씩 어긋나 있고
   어긋난 시계로 동시를 만들면 한쪽이 먼저 펴진다. **먼저 펴지는 쪽이 손해다.** */
var REVEAL={open:{}};
function revealReady(id){
  var el=document.getElementById(id);
  return !!(el && String(el.value||"").trim().length);
}
function revealOpen(key){ return !!REVEAL.open[key]; }
function revealGate(key, fieldId, what){
  var ready=revealReady(fieldId), open=revealOpen(key);
  if(open) return '<div class="note g">폈다. '+esc(what||"서로 다른 자리를 하나씩 말한다")+'</div>';
  var h='<div class="rgate">';
  if(!ready){
    h+='<div class="note">이 기기 것을 다 적으면 펴는 단추가 켜진다.</div>';
    h+='<button class="g" disabled>펴기</button>';
  }else{
    /* **상대가 됐다고 말하기 전에는 누르지 말라고 화면이 시킨다.**
       기기가 못 하는 것을 사람이 한다. 시키지 않으면 사람도 안 한다. */
    h+='<div class="note w">다 적었다. <b>상대도 다 적었는지 물어보고</b> 둘이 같이 누른다.</div>';
    h+='<button class="g" data-reveal="'+esc(key)+'">둘 다 됐다. 편다</button>';
  }
  return h+'</div>';
}
/* 펴기 단추를 잇는다. 그린 다음에 부른다. */
function revealBind(box, after){
  if(!box) return;
  box.querySelectorAll("[data-reveal]").forEach(function(b){
    b.onclick=function(){ REVEAL.open[b.dataset.reveal]=true; if(after) after(); };
  });
}
function revealReset(key){ delete REVEAL.open[key]; }

/* =========================================================================
   두 기기가 갈리는지 확인하는 자리. 규칙 탭에 있다.

   E단계 스무 판이 다 위의 두 조각을 쓴다. 그런데 판이 아직 없다.
   **기기 쪽을 잘못 골라 두면 판이 생긴 날에야 그것이 보이고 그때는 세션 중이다.**
   그래서 미리 확인할 자리를 둔다. 두 기기를 나란히 놓고 이 화면을 편다.
   ========================================================================= */
var SPLIT={step:0};
function renderSplit(){
  var box=$("#splitCheck"); if(!box) return;
  var s=SPLIT.step, mine=(typeof deviceSide==="function")?deviceSide():null;
  var h='<div class="small mut">두 기기를 나란히 놓고 이 자리를 편다. '+
        '<b>같아야 하는 것과 달라야 하는 것이 아래에 갈려 있다.</b></div>';
  h+='<table class="pairtab"><tr><th>무엇</th><th>이 기기</th><th>두 기기가</th></tr>'+
     '<tr><td>판 표시</td><td class="mono">'+esc(roundTag("check",s))+
     '</td><td>같아야 한다</td></tr>'+
     '<tr><td>회</td><td class="mono">'+s+'</td><td>같아야 한다</td></tr>'+
     '<tr><td>이 기기 쪽</td><td class="mono">'+esc(mine?mine.toUpperCase():"안 고름")+
     '</td><td><b>달라야 한다</b></td></tr>'+
     '<tr><td>자리</td><td class="mono">'+
     esc(roundRole(s,2,["읽는 쪽","짚는 쪽"])||"둘 다")+
     '</td><td><b>달라야 한다</b></td></tr></table>';
  var p=roundPart(s,2,["왼쪽 몫","오른쪽 몫"]);
  h+='<div style="margin-top:12px">'+veilPane(p.mine,p.hidden,"상대")+'</div>';
  if(!mine)
    h+='<div class="note w">기기 쪽을 안 골랐다. 대장 탭에서 고르면 화면이 갈린다. '+
       '안 고르면 한 기기로 도는 날이라 둘 다 보인다.</div>';
  h+='<div class="small mut" style="margin-top:10px">자리는 두 회마다 바뀐다. '+
     '다음에 바뀌는 회는 '+roundNextTurn(s,2)+'이다.</div>';
  h+='<div class="row" style="margin-top:8px">'+
     '<button class="g" id="splitPrev">이전 회</button>'+
     '<button class="g" id="splitNext">다음 회</button></div>';
  box.innerHTML=h;
  $("#splitPrev").onclick=function(){ SPLIT.step=Math.max(0,SPLIT.step-1); renderSplit(); };
  $("#splitNext").onclick=function(){ SPLIT.step++; renderSplit(); };
}
