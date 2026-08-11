/* =========================================================================
   어제 그거 (T313). `docs/play_rules.md` 11.1

     쓰는 것    지난 카드 기록. `S.cardDue[id][쪽].hist` (T312 에 여러 개로, T358 에 사람별로)
     시작 조건  어제와 사흘 전과 이레 전 기록이 있다
     역할       내는 쪽과 받는 쪽. **다섯 장마다 바뀐다**
     도는 차례  앱이 세 날 것을 섞어 낸다. 받는 쪽이 답하고 **어느 날 것인지도 말한다**
     판정       **내는 사람.** 화면에 날짜가 있다
     끝         열 장을 돌면 끝난다
     못 했을 때 날짜를 못 맞혀도 답이 맞으면 넘어간다. **날짜는 덤이다**
     기록할 값  열 중 답이 맞은 수. **날짜는 따로 안 센다**

   ## 두 기기가 다른 덱을 든다. 그래도 된다

   `S.cardDue` 는 기기마다 따로다. 짝 코드로 합치지만 오늘 합쳤을 리 없다.
   그래서 두 기기의 세 날 목록이 다를 수 있다.

   **이 판은 그래도 선다.** 카드를 보는 것은 내는 쪽뿐이고 받는 쪽은 듣고 답한다.
   다섯 장마다 자리가 바뀌니 **각자 제 기록에서 다섯 장씩 낸다.**
   두 기기가 같은 덱을 들 까닭이 없다.

   앞의 판들과 다른 자리다. 거기서는 같은 씨앗으로 같은 덱을 만들었다.
   거기는 **둘 다 같은 것을 봐야 하는 판**이었고 여기는 아니다.

   ## 회는 그래도 맞춰야 한다

   덱은 갈려도 **몇 장째인지는 같아야 한다.** 그것으로 자리가 바뀌기 때문이다.
   내는 쪽만 누르면 받는 쪽 회가 0에 머물고 영영 어긋난다 (T308 에서 겪었다).
   받는 쪽에 넘기는 단추를 둔다. **그 단추는 판정이 아니다.**

   ## 날짜는 덤이다

   못 했을 때 칸이 그렇게 적었다. 날짜를 물어보는 까닭은
   **언제 배운 것인지를 알면 그 앞뒤가 같이 딸려 오기** 때문이지
   날짜가 통과 조건이어서가 아니다. 그것은 영어가 아니다.

   그래서 단추가 둘이다. 맞았다와 못 맞혔다. **날짜 단추가 없다.**
   화면이 "날짜는 덤이다" 를 적는다. 안 적으면 덤인지 아닌지 모른다.
   ========================================================================= */
var RCL={seats:["내는 쪽","받는 쪽"], min:5, days:[1,3,7],
         names:{1:"어제", 3:"사흘 전", 7:"이레 전"}};

/* **등급을 여기서 적는다.** `cards.js` 에는 등급 칸이 없다. 카드 파일 열둘이
   다 신뢰도 B 이고 이 판은 그 카드를 그대로 낸다. 그러니 이 판도 B다.
   다른 판은 자료 파일이 스스로 적은 것을 옮기는데 (`playGrade`) 여기는 그 칸이 없어
   내가 적는다. **없는 것을 A로 두지 않는다.** */
function rclGrade(){
  return playGrade({grade:"B",
    gradeWhy:"카드 파일 열둘이 다 신뢰도 B 다. 이 판은 그 카드를 그대로 낸다. "+
             "cards.js 에는 등급 칸이 없어 여기서 적는다."});
}

/* 세 날 목록. **이 기기 기록만 본다.** 위 머리글을 본다. */
function rclDays(){
  var td=(typeof today==="function")?today():null;
  if(!td || typeof ranOn!=="function") return null;
  var out=[];
  RCL.days.forEach(function(n){
    out.push({n:n, d:addDays(td,-n), ids:ranOn(addDays(td,-n))});
  });
  return out;
}
function rclRec(){ return playRec("recall", {hit:0, miss:0, deck:null}); }

/* 열 장. 세 날에서 **골고루** 뽑는다. 한 날에서 다 뽑으면 섞은 것이 아니다. */
function rclDeck(d){
  var days=rclDays(); if(!days) return [];
  var rec=rclRec(), by={};
  var cards=(DATA.cards&&DATA.cards.items)?DATA.cards.items:[];
  cards.forEach(function(c){ by[c.id]=c; });
  if(rec.deck && rec.deck.length){
    var kept=rec.deck.filter(function(x){ return by[x.id]; });
    if(kept.length===rec.deck.length) return kept;
  }
  var pool=[];
  days.forEach(function(g){
    var have=g.ids.filter(function(id){ return by[id]; });
    var ord=roundOrder(have.length, roundSeed("recall", g.n));
    pool.push(ord.map(function(i){ return {id:have[i], n:g.n, d:g.d}; }));
  });
  /* 돌아가며 하나씩 집는다. 모자란 날은 건너뛴다 (**있는 만큼 돈다**. T274) */
  var out=[], at=0;
  while(out.length < d.end){
    var got=false;
    for(var k=0;k<pool.length;k++){
      if(pool[k].length>at){ out.push(pool[k][at]); got=true; }
      if(out.length>=d.end) break;
    }
    if(!got) break;
    at++;
  }
  rec.deck=out; save();
  return out;
}

var RCLK={t:null, left:0, over:false};
function rclClockStop(){ if(RCLK.t){ clearInterval(RCLK.t); RCLK.t=null; } }
function rclClockText(){
  if(RCLK.over) return "0:00";
  var s=RCLK.left>0?RCLK.left:RCL.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function rclClockGo(min){
  if(RCLK.t){ rclClockStop(); return; }
  if(RCLK.left<=0){ RCLK.left=min*60; RCLK.over=false; }
  tone("start");
  RCLK.t=setInterval(function(){
    RCLK.left--;
    var e=document.getElementById("rclClock");
    if(!e){ rclClockStop(); return; }
    if(RCLK.left<=0){
      RCLK.over=true; rclClockStop(); tone("blockend"); renderRecall(); return;
    }
    e.textContent=rclClockText();
  },1000);
  var e=document.getElementById("rclClock"); if(e) e.textContent=rclClockText();
}

function rclDone(d, rec, head){
  var h=head;
  h+='<div class="note">답이 맞은 것이 <b>'+rec.hit+'</b>장이고 '+
     '못 맞힌 것이 <b>'+rec.miss+'</b>장이다.</div>';
  h+=playHalf(d.end);
  h+='<div class="note"><b>날짜는 따로 안 셌다.</b> 덤이라 셈에 안 넣는다. '+
     '언제 배운 것인지를 알면 그 앞뒤가 같이 딸려 오는데 '+
     '<b>그것이 통과 조건은 아니다.</b> 그것은 영어가 아니다.</div>';
  return h+rclGrade()+'<div class="row" style="margin-top:10px">'+
    '<button class="g" id="rclAgain">처음부터</button></div></div>';
}

function renderRecall(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("recall");
  RCL.min=p.min;
  var d={end:10};
  if(!DATA.cards){
    box.innerHTML=dataWait("카드를","cards");
    if(!dataFailed("cards")) loadData("cards","ENG2P_CARDS",function(){ renderRecall(); });
    return;
  }
  /* 기기가 하나인 날. 돌려 보기다 (`solo_plays.md` 18번). 다섯 장마다 건넨다. */
  if(soloOn() && soloHanding()){
    box.innerHTML='<div class="card">'+soloCover([S.names.a,S.names.b])+'</div>';
    $("#soTake").onclick=function(){ soloTake(renderRecall); };
    return;
  }

  var days=rclDays(), s=roundStep("recall"), rec=rclRec();
  var h='<div class="card">'+playHead(p,s);

  /* **시작 조건이다.** 세 날 중 하나라도 비면 안 연다. 없다고 보여 준다 (T298). */
  var empty=(days||[]).filter(function(g){ return !g.ids.length; });
  if(!days || empty.length){
    h+='<div class="note w" style="margin-top:10px"><b>오늘은 이 판을 안 연다.</b> '+
       '어제와 사흘 전과 이레 전에 돈 카드가 다 있어야 한다.</div>';
    h+='<div class="small mut">';
    (days||[]).forEach(function(g){
      h+='<div>'+esc(RCL.names[g.n])+' ('+esc(g.d)+') <b>'+g.ids.length+'</b>장</div>';
    });
    h+='</div>';
    h+='<div class="note"><b>이 기기 기록만 본다.</b> 카드를 저쪽 기기로 돌렸으면 '+
       '그 기록은 저쪽에 있다. <b>짝 코드로 합치면 이쪽에도 온다.</b></div>'+
       rclGrade()+'</div>';
    box.innerHTML=h; return;
  }

  var deck=rclDeck(d);
  if(deck.length<d.end){
    h+='<div class="note w" style="margin-top:10px"><b>있는 만큼 돈다.</b> '+
       '세 날에서 모은 것이 '+deck.length+'장이다. '+d.end+'장이 안 된다.</div>';
  }
  if(RCLK.over || s>=deck.length){
    box.innerHTML=rclDone(d, rec, h+
      '<div class="note '+(RCLK.over?"w":"g")+'" style="margin-top:10px"><b>'+
      (RCLK.over ? RCL.min+'분이 됐다. 끝났다.' : deck.length+'장을 다 돌았다.')+
      '</b></div>');
    $("#rclAgain").onclick=function(){ rclReset(rec); };
    return;
  }

  var it=deck[s], c=null;
  (DATA.cards.items||[]).forEach(function(x){ if(x.id===it.id) c=x; });
  var first=roundFirst(s, 5);
  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span class="small mut">'+(s+1)+' / '+deck.length+'장</span>'+
     '<span class="small mut">다섯 장마다 자리가 바뀐다</span></div>';
  h+='<div id="rclTurn"></div>';

  if(first===false){
    /* 받는 쪽. **카드가 안 보인다.** 날짜도 안 보인다. 그것을 맞히는 것이 이 판이다. */
    h+='<div class="note" style="margin-top:10px"><b>받는 쪽이다.</b> '+
       '저쪽이 단서를 준다. 답하고 <b>어느 날 것인지도 말한다.</b> '+
       '어제인지 사흘 전인지 이레 전인지다.</div>';
    h+=veilPane([], ["카드와 날짜"], "내는 쪽", []);
    h+='<div class="note w"><b>날짜는 덤이다.</b> 못 맞혀도 답이 맞으면 넘어간다.</div>';
    /* **이 기기도 장을 넘겨야 한다** (T308). 안 누르면 회가 어긋난다. */
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="rclNext">저쪽이 눌렀다. 다음 장</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>이 자리에는 판정할 것이 없다.</b> 이 단추는 판정이 아니라 '+
       '<b>이 기기도 다음 장으로 넘기는 것</b>이다. 안 누르면 두 기기의 회가 어긋난다.</div>';
  }else{
    h+='<div class="note" style="margin-top:10px"><b>내는 쪽이다.</b> '+
       (first===null ? '기기 쪽을 안 골랐다. 한 기기로 도는 날이면 이대로 돈다. ' : '')+
       '카드를 보고 단서를 준다. <b>답을 그대로 읽어 주지 않는다.</b></div>';
    h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
       '<span class="small mut">'+esc(it.id)+' · '+esc((c&&c.type)||"")+'형</span>'+
       '<span class="rcld"><b>'+esc(RCL.names[it.n])+'</b> '+esc(it.d)+'</span></div>';
    if(c){
      var a=c.a||{};
      if(a.material && a.material.length)
        h+='<div class="rclmat">'+a.material.map(function(m,i){
             return '<div><span class="lno">'+(i+1)+'</span>'+esc(m)+'</div>';
           }).join("")+'</div>';
      if(a.answer)
        h+='<div class="rclans"><b>정답</b><br>'+esc(a.answer)+'</div>';
      h+='<div class="small mut">이 자리 기준 <b>'+esc(a.pass||"")+'</b></div>';
    }else{
      h+='<div class="note w">이 카드를 못 찾았다. <b>'+esc(it.id)+'</b></div>';
    }
    h+='<div class="note w" style="margin-top:10px"><b>날짜는 덤이다.</b> '+
       '받는 쪽이 어느 날인지 못 맞혀도 <b>답이 맞으면 맞았다를 누른다.</b> '+
       '날짜는 따로 안 센다.</div>';
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="b" id="rclHit">답이 맞았다</button>'+
       '<button class="g" id="rclMiss">못 맞혔다</button></div>';
    h+='<div class="small mut" style="margin-top:6px">못 맞힌 것이 벌이 아니다. '+
       '<b>지난 것이 아직 안 붙었다는 표시</b>고 그것을 보려고 도는 판이다.</div>';
  }

  h+='<div class="small mut" style="margin-top:8px">맞은 것 <b>'+rec.hit+
     '</b> · 못 맞힌 것 <b>'+rec.miss+'</b> <span class="mut">(이 기기 몫)</span></div>';
  if(soloOn())
    h+='<div class="note" style="margin-top:8px"><b>기기가 하나다.</b> '+
       '내는 쪽이 들고 <b>다섯 장마다 건넨다.</b> 카드와 날짜가 이 화면에 있다.</div>'+
       '<div class="row" style="margin-top:10px">'+
       '<button class="g" id="rclHand">건넨다</button></div>';
  h+='<div class="row" style="margin-top:10px">'+
     '<button class="g" id="rclGo">'+RCL.min+'분 시계 <span class="mono" id="rclClock">'+
     rclClockText()+'</span></button></div>'+rclGrade()+'</div>';
  box.innerHTML=h;

  if(turnCheck("recall", s, 5)) turnAlert(s, 5, RCL.seats, "rclTurn");
  $("#rclGo").onclick=function(){ rclClockGo(RCL.min); };
  if($("#rclHand")) $("#rclHand").onclick=function(){ soloHandOff(renderRecall); };
  function step(){ save(); roundStepSet("recall", s+1); renderRecall(); }
  if($("#rclNext")) $("#rclNext").onclick=function(){ step(); };
  if($("#rclHit")) $("#rclHit").onclick=function(){ rec.hit++; tone("done"); step(); };
  if($("#rclMiss")) $("#rclMiss").onclick=function(){ rec.miss++; step(); };
}
function rclReset(rec){
  roundStepSet("recall",0); turnForget("recall");
  rec.hit=0; rec.miss=0; rec.deck=null; save();
  rclClockStop(); RCLK.left=0; RCLK.over=false; renderRecall();
}
PLAYREND.recall=renderRecall;
