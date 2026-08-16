/* =========================================================================
   3초 벽 (T283). `docs/play_rules.md` 6.2

     쓰는 것    압박형 10초 이하 중 띄울 재료가 있는 94장 `wall.js` (T282). **B등급**
     시작 조건  그날 카드 회차를 마쳤다
     역할       단서를 띄우는 쪽과 받는 쪽. **다섯 장마다 바뀐다**
     도는 차례  단서가 뜬다. 제한시간 안에 받는다. 못 받으면 **상대가 대신 받는다**
     판정       **띄운 사람**
     끝         열 장을 돌면 끝난다
     못 했을 때 상대가 대신 받는다. 둘 다 못 받으면 그 장을 **다음 판으로 미룬다**
     기록할 값  열 장 중 시간 안에 받은 장 수. **누가 받았는지는 안 센다**

   **숫자를 이 파일에 안 적는다.** 열 장도 다섯 장도 제한시간도 다 `wall.js` 에서 온다.
   앞의 둘은 규칙서 6.2 에서 파생되고 제한시간은 카드마다 다르다 (T282).

   ## 시계가 두 번 선다

   이 판에 시계가 둘이 아니라 **한 시계가 한 장에 두 번 선다.**
   받는 쪽이 한 번, 못 받으면 띄운 쪽이 대신 한 번이다.
   같은 초를 준다. 대신 받는 쪽에 시간을 덜 주면 그것이 벌이 된다.

   블록 시계는 안 둔다. 규칙서의 끝 조건이 **장수**이지 분이 아니다.
   배속 사다리는 "5분이 되면 끝난다" 가 규칙서에 적혀 있어 시계를 뒀고
   이 판에는 그 줄이 없다. **없는 끝을 앱이 만들지 않는다.**

   ## 대신 받은 것도 받은 것이다

   규칙서가 "누가 받았는지는 안 센다" 라고 적었다.
   그래서 단추가 둘인데 세는 자리는 하나다. **그 말을 화면이 한다.**
   안 적으면 두 사람이 대신 받은 것을 뺀 수를 적는다.

   ## 가릴 것이 있다

   `docs/solo_plays.md` 3장 9번이 "가릴 것이 없다" 라고 적었다.
   T282 에 카드를 열어 보니 **94장 중 19장에 정답이 있고 그중 16장이 Q1**이다.
   이 판이 처음 도는 분기가 Q1 이다. 안 가리면 받는 쪽이 정답을 읽는다.

   정답은 **띄우는 쪽 화면에만** 둔다. 기기가 하나면 띄우는 쪽이 들고
   자리가 바뀔 때 건넨다. 그 문서도 T283 에 고쳤다.
   ========================================================================= */
var WAL={seats:["단서를 띄우는 쪽","받는 쪽"], stage:"ask"};

/* 그날 강까지 나온 것만 쓴다. **안 배운 카드를 드릴에 넣지 않는다.**
   분기는 글자 차례가 곧 시간 차례다 (Q1 < Q2 < Q3 < Q4). */
function walPool(){
  var d=DATA.wall, pl=(typeof plan==="function")?plan():null;
  if(!d || !d.cards || !pl || !pl.cards || !pl.quarter) return [];
  return d.cards.filter(function(c){
    return c.q < pl.quarter || (c.q === pl.quarter && c.no <= pl.cards.to);
  });
}
/* 그날 셈. **미룬 장은 처음부터를 눌러도 안 지운다.** 다음 판으로 가는 것이다. */
function walRec(){ return playRec("wall", {hit:0, done:0, defer:[], deck:null}); }

/* 이 판에 낼 장. **미룬 것이 먼저다.** 규칙서가 다음 판으로 미루라고 했으니
   다음 판이 그것부터 낸다. 안 그러면 미룬 장이 영영 안 나온다.

   ## 한 판 안에서는 안 바뀐다

   미룬 것을 앞에 놓는 셈을 그릴 때마다 다시 하면 **판 도중에 덱이 섞인다.**
   여섯째 장을 미루는 순간 그 장이 첫째가 되고 이미 돈 다섯 장이 뒤로 밀린다.
   그래서 첫 장을 그릴 때 한 번 정하고 `deck` 에 적어 둔다.
   `처음부터` 가 그것을 지운다. 그때 미룬 것이 앞으로 온다. */
function walDeck(){
  var d=DATA.wall, pool=walPool(), rec=walRec();
  if(!d || !pool.length) return [];
  var by={}; pool.forEach(function(c){ by[c.id]=c; });
  if(rec.deck && rec.deck.length){
    var kept=rec.deck.map(function(id){ return by[id]; }).filter(Boolean);
    if(kept.length===rec.deck.length) return kept;
  }
  var out=[], used={};
  (rec.defer||[]).forEach(function(id){
    if(by[id] && !used[id]){ out.push(by[id]); used[id]=1; }
  });
  var rest=pool.filter(function(c){ return !used[c.id]; });
  /* **미룬 것 뒤를 순환으로 채운다** (T403). 날마다 새로 섞던 때는
     아흔넷을 들고도 어제 낸 열 중 몇이 오늘 또 왔다. 겹친 날이 73.6%였다. */
  if(out.length<d.end) out=out.concat(roundPick("wall", rest, d.end-out.length));
  out=out.slice(0, d.end);
  rec.deck=out.map(function(c){ return c.id; });
  save();
  return out;
}

var WCLK={t:null, left:0, over:false};
function walClockStop(){ if(WCLK.t){ clearInterval(WCLK.t); WCLK.t=null; } }
function walClockReset(){ walClockStop(); WCLK.left=0; WCLK.over=false; }
function walClockText(sec){
  if(WCLK.over) return "0";
  return String(WCLK.left>0 ? WCLK.left : sec);
}
/* **초를 센다. 분이 아니다.** 제일 짧은 카드가 2초라 분으로 적으면 0:02 만 보인다. */
function walClockGo(sec){
  if(WCLK.t){ walClockStop(); return; }
  WCLK.left=sec; WCLK.over=false;
  tone("start");
  WCLK.t=setInterval(function(){
    WCLK.left--;
    var e=document.getElementById("walClock");
    if(!e){ walClockStop(); return; }
    if(WCLK.left<=0){
      WCLK.over=true; walClockStop(); tone("blockend");
      /* 시간이 다 됐다. **받는 쪽 차례면 대신 받기로 넘어간다.** */
      if(WAL.stage==="ask") WAL.stage="relay";
      renderWall();
      return;
    }
    e.textContent=walClockText(sec);
  },1000);
  var e=document.getElementById("walClock"); if(e) e.textContent=walClockText(sec);
}

function renderWall(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("wall");
  if(!DATA.wall){
    box.innerHTML=dataWait("단서를","wall");
    if(!dataFailed("wall")) loadData("wall","ENG2P_WALL",function(){ renderWall(); });
    return;
  }
  var d=DATA.wall, pool=walPool();

  /* 첫 다섯 강은 그날까지 쌓인 단서가 열이 안 된다 (T282).
     **같은 장을 두 번 내지 않는다.** 이미 본 단서는 압박이 아니다. */
  if(pool.length < d.end){
    box.innerHTML='<div class="card">'+playHead(p,0)+
      '<div class="note w" style="margin-top:10px"><b>아직 이 판은 안 연다.</b> '+
      '오늘까지 나온 단서가 <b>'+pool.length+'장</b>이고 이 판은 <b>'+d.end+
      '장</b>을 돈다. 안 배운 카드를 앞당겨 쓰지 않는다.</div>'+
      '<div class="note">모자란 날에 같은 장을 두 번 내지 않는다. '+
      '<b>받는 쪽이 이미 본 단서는 압박이 아니다.</b> 두 번째에는 답을 아는 채로 잰다.</div>'+
      '<div class="note">그 사이에는 같은 자동화 트랙의 다른 판을 돈다.</div>'+
      playGrade(d)+'</div>';
    return;
  }

  var deck=walDeck(), s=roundStep("wall"), rec=walRec();

  if(soloOn() && soloHanding()){
    box.innerHTML='<div class="card">'+soloCover([S.names.a,S.names.b])+'</div>';
    $("#soTake").onclick=function(){ soloTake(renderWall); };
    return;
  }

  var h='<div class="card">'+playHead(p,s);

  if(s>=deck.length){
    h+='<div class="note g" style="margin-top:10px"><b>'+deck.length+
       '장을 다 돌았다.</b> 그중 <b>'+rec.hit+'장</b>을 시간 안에 받았다.</div>';
    h+='<div class="note">규칙서가 남기라는 값은 <b>시간 안에 받은 장 수</b>다. '+
       '<b>누가 받았는지는 안 센다.</b> 대신 받은 것도 받은 것이다.</div>';
    h+=playHalf(d.end+"장 중 시간 안에 받은 장 수");
    if((rec.defer||[]).length)
      h+='<div class="note w">둘 다 못 받은 <b>'+rec.defer.length+
         '장</b>은 다음 판으로 미뤘다. 다음 판이 그것부터 낸다.</div>';
    h+=playGrade(d);
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="walAgain">처음부터</button></div></div>';
    box.innerHTML=h;
    $("#walAgain").onclick=function(){
      /* **미룬 장은 안 지운다.** 지우면 규칙서가 미루라고 한 것이 사라진다.
         덱은 지운다. 그래야 다음 판이 미룬 것부터 낸다. */
      roundStepSet("wall",0); turnForget("wall");
      rec.hit=0; rec.done=0; rec.deck=null; save();
      WAL.stage="ask"; walClockReset(); renderWall();
    };
    return;
  }

  var it=deck[s], first=roundFirst(s, d.swap);
  if(first===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '정답이 붙은 장이 있어 받는 쪽에 안 보여야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고르거나, 기기가 하나면 규칙 탭에서 '+
       '<b>돌려 보기</b>를 켠다.</div></div>';
    box.innerHTML=h; return;
  }

  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?WAL.seats[0]:WAL.seats[1])+'</b>'+
     (soloOn()?' <span class="small mut">(돌려 보기)</span>':'')+'</span>'+
     '<span class="small mut">'+(s+1)+' / '+deck.length+'장 · '+esc(it.id)+'</span></div>';

  /* 제한시간. **카드가 정한다.** 판 이름의 3초가 아니다 (규칙서 6.2).
     **시계는 띄우는 쪽 화면에서만 간다.** 카드가 "재고 시작 신호를 준다" 라고
     적었고 판정도 그쪽이다. 두 기기가 각자 재면 두 시계가 어긋나고
     어긋난 시계로 압박을 만들면 받는 쪽이 자기 시계를 보고 스스로 판정한다. */
  h+='<div class="walclock'+(WAL.stage==="relay"?" relay":"")+'">'+
     '<b class="mono" id="walClock">'+(first?walClockText(it.sec):String(it.sec))+'</b>'+
     '<span>'+it.sec+'초 · '+
     (first ? (WAL.stage==="relay"?"대신 받는 차례":"받는 차례")
            : "띄우는 쪽이 잰다")+'</span></div>';

  if(WAL.stage==="relay")
    h+='<div class="note w"><b>시간이 지났다. 상대가 대신 받는다.</b> '+
       '같은 '+it.sec+'초를 준다. <b>대신 받은 것도 받은 것으로 센다.</b></div>';

  /* 단서. **띄우는 쪽 화면에만 있다.** 역할 이름이 그 뜻이다.
     받는 쪽 화면에 미리 띄우면 그 사람은 시계가 서기 전에 다 읽는다.
     그러면 이 판이 재는 것이 압박이 아니라 읽기가 된다. */
  if(first)
    h+='<div class="walmat">'+
       it.mat.map(function(x,i){
         return '<div><span class="lno">'+(i+1)+'</span>'+esc(x)+'</div>';
       }).join("")+'</div>';

  if(first){
    h+='<div class="note" style="margin-top:10px"><b>띄우는 쪽이 할 일</b><br>'+
       esc(it.ins)+'</div>';
    if(it.ans)
      h+='<div class="note g"><b>정답</b> <span class="mono">'+esc(it.ans)+'</span><br>'+
         '<span class="small">받는 쪽 화면에는 이 줄이 없다. 소리 내어 읽지 않는다.</span></div>';
    if(it.note)
      h+='<div class="small mut" style="margin-top:6px">'+esc(it.note)+'</div>';
    h+='<div class="note"><b>판정</b> '+esc(it.pass)+'</div>';
    /* 받는 쪽이 그 낱말을 그대로 읽어야 하는 장이다 (94장 중 12장).
       **말로 불러 줄 수 없다.** 읽는 것을 재는 장이라 눈으로 봐야 한다. */
    if(it.show)
      h+='<div class="note w"><b>이 장은 받는 쪽이 눈으로 읽는다.</b> '+
         '시계를 세우면서 화면을 상대 쪽으로 돌린다.'+
         (it.ans?' <b>정답 줄은 손으로 가린다.</b>':'')+'</div>';
  }else{
    h+='<div class="note" style="margin-top:10px"><b>받는 쪽이 할 일</b><br>'+
       esc(it.bIns)+'</div>';
    h+='<div class="note"><b>됐다고 보는 선</b> '+esc(it.bPass)+'</div>';
    h+='<div class="vpane"><div class="vhid" aria-hidden="true"><span>'+
       (it.show ? "이 장은 띄우는 쪽이 화면을 돌려 준다"
                : "단서는 띄우는 쪽 화면에 있다")+
       '</span></div></div>';
  }

  /* **누를 것은 띄운 쪽에만 있다.** 규칙서의 판정 칸이 띄운 사람이다.
     받는 쪽에 단추를 두면 자기가 받았는지를 자기가 정하게 된다. */
  if(first){
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="b" id="walGo">'+(WCLK.t?"멈춘다":it.sec+"초 재기")+'</button>'+
       '<button class="g" id="walHit">'+
       (WAL.stage==="relay"?"대신 받았다":"시간 안에 받았다")+'</button>'+
       (WAL.stage==="relay"?'<button class="g" id="walMiss">둘 다 못 받았다</button>':"")+
       '</div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>판정은 띄운 사람이 한다.</b> 이 기기 셈 <b>'+rec.hit+'</b>장. '+
       '<b>누가 받았는지는 안 센다.</b> 대신 받은 것도 받은 것이다.</div>';
  }else{
    /* **판정 단추는 없고 넘기는 단추는 있다.** 회는 기기마다 자기가 센다
       (round.md 6장). 이 단추가 없으면 이 기기만 첫 장에 남고
       판 표시 두 글자가 갈린다. 그것은 사람이 눈으로 잡는 자리다. */
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="walNext">다음 장</button>'+
       '<button class="g" id="walDefer">둘 다 못 받았다고 한다</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>이 자리에는 판정할 것이 없다.</b> 받았는지는 띄운 사람이 정한다. '+
       '뒤엣단추는 판정이 아니라 <b>그쪽이 말한 것을 이 기기에도 적는 것</b>이다. '+
       '안 적으면 다음 판에 두 기기가 다른 장을 낸다. 이 기기 셈 <b>'+rec.hit+'</b>장.</div>';
  }
  if(soloOn())
    h+='<div class="note" style="margin-top:8px"><b>기기가 하나다.</b> '+
       '띄우는 쪽이 들고 <b>'+d.swap+'장마다 건넨다.</b> 정답이 붙은 장이 있다.</div>';

  h+='<div id="walTurn"></div>';
  if(soloOn())
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="walHand">건넨다</button></div>';
  h+=playGrade(d)+'</div>';
  box.innerHTML=h;

  if($("#walGo")) $("#walGo").onclick=function(){ walClockGo(it.sec); };
  if($("#walHand")) $("#walHand").onclick=function(){ soloHandOff(renderWall); };

  function nextCard(hit, defer){
    walClockReset();
    if(hit) rec.hit++;
    rec.done++;
    if(defer && (rec.defer||[]).indexOf(it.id)<0) rec.defer.push(it.id);
    save();
    WAL.stage="ask";
    roundStepSet("wall", s+1);
    renderWall();
    if(turnCheck("wall", s+1, d.swap)) turnAlert(s+1, d.swap, WAL.seats, "walTurn");
  }
  if($("#walHit")) $("#walHit").onclick=function(){ tone("next"); nextCard(true, false); };
  if($("#walMiss")) $("#walMiss").onclick=function(){ nextCard(false, true); };
  /* 받는 쪽은 셈을 안 건드리고 회만 민다. 미룬 것은 따로 적는다.
     **덱을 두 기기가 같이 만들어야 하기 때문이다.** */
  if($("#walNext")) $("#walNext").onclick=function(){ nextCard(false, false); };
  if($("#walDefer")) $("#walDefer").onclick=function(){ nextCard(false, true); };
}
PLAYREND.wall=renderWall;
