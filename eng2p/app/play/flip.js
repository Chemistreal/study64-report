/* =========================================================================
   거꾸로 판정 (T307). `docs/play_rules.md` 8.1

     쓰는 것    `answer` 가 있는 카드. Q2 이후 68장. `out/data/flip.js` (T306)
     시작 조건  카드 다섯 장이 뽑혀 있다
     역할       답하는 쪽과 판정하는 쪽. **한 장마다 바뀐다**
     도는 차례  B가 답한다. **A 화면에는 정답이 아니라 기준만 있다.** A가 기준으로 본다
     판정       판정하는 사람
     끝         다섯 장을 돌면 끝난다
     못 했을 때 기준으로 못 가르면 **못 가른다고 적는다.** 그 카드가 검증 대기열로 간다
     기록할 값  다섯 중 기준으로 갈린 장이 몇인가

   ## 정답이 어느 화면에도 없다

   앞의 판들은 답을 **한쪽에** 뒀다. 짚는 쪽에만 안 보이면 됐다.
   이 판은 다르다. `derive_flip.py` 가 정답을 아예 안 담았다.
   **두 화면 어디에도 없고 자료에도 없다.** 그것이 이 판의 이름이다.

   그래서 이 판에는 `veilPane` 이 정답을 가리는 데 안 쓰인다.
   가릴 것이 없다. 가리는 것은 **재료**다. 답하는 쪽이 문장을 눈으로 보면
   듣고 답하는 것이 아니라 읽고 답하는 것이 된다.

   ## 기준이 셈뿐인 장이 쉰아홉이다

   T307 에 화면을 짜다가 알았다. 68장 중 쉰아홉의 기준이 이렇다.

       B가 5개 중 4개 이상 맞히면 성공.

   **무엇이 맞음인지가 안 적혀 있다.** 아홉 장만 가르는 말을 갖고 있다.

       B가 5개 중 4개 이상에서 앞의 것을 고르면 성공.

   셈뿐인 장을 든 판정하는 사람은 기준으로 못 가른다. 아는 것으로 가르거나
   **못 가른다고 적는다.** 규칙서의 못 했을 때 칸이 그 자리를 이미 열어 뒀다.

   화면이 둘을 갈라 적는다. 안 가르면 기준을 읽고 아무것도 못 얻은 사람이
   자기가 못한 줄 안다. **못 가른 것은 그 사람 탓이 아니라 카드 탓이다.**

   ## 절반이다

   판정하는 자리가 한 장마다 바뀐다. 다섯 장이면 한 기기가 둘이나 셋을 판정한다.
   그래서 이 기기 셈은 **절반이다.** `playHalf` 를 쓴다.
   ========================================================================= */
var FLP={seats:["판정하는 쪽","답하는 쪽"]};

/* 그날 강까지 나온 것만 쓴다. **안 배운 카드를 드릴에 넣지 않는다.** */
function flpPool(){
  var d=DATA.flip, pl=(typeof plan==="function")?plan():null;
  if(!d || !d.cards || !pl || !pl.cards || !pl.quarter) return [];
  /* 뽑는 법이 첫 세션부터 되짚는다 (T409). 되짚으려면 차림표 48주가 다 있어야 한다.
     **반만 들고 세면 기기마다 읽은 만큼이 달라 덱이 갈린다.** 읽고 다시 그린다. */
  if(!roundHistory(renderFlip)) return [];
  return d.cards.filter(function(c){
    return c.q < pl.quarter || (c.q === pl.quarter && c.no <= pl.cards.to);
  });
}
function flpRec(){ return playRec("flip", {split:0, stuck:0, ids:[], deck:null}); }

/* 이 판에 낼 다섯 장. **판 도중에 안 바뀐다** (3초 벽과 같다. T283). */
function flpDeck(){
  var d=DATA.flip, pool=flpPool(), rec=flpRec();
  if(!d || !pool.length) return [];
  var by={}; pool.forEach(function(c){ by[c.id]=c; });
  if(rec.deck && rec.deck.length){
    var kept=rec.deck.map(function(id){ return by[id]; }).filter(Boolean);
    if(kept.length===rec.deck.length) return kept;
  }
  /* **그때 자루가 몇이었는지를 같이 준다** (T409). 카드는 강이 나갈 때마다 늘고
     늘어난 자루로 나머지셈을 하면 자리가 튄다. 되짚을 때 그 크기를 쓴다. */
  var out=roundPick("flip", pool, d.end, function(s){ return roundCardsAt(d.cards, s); });
  rec.deck=out.map(function(c){ return c.id; });
  save();
  return out;
}

var FCLK={t:null, left:0, over:false};
function flpClockStop(){ if(FCLK.t){ clearInterval(FCLK.t); FCLK.t=null; } }
function flpClockText(){
  if(FCLK.over) return "0:00";
  var s=FCLK.left>0?FCLK.left:FLP.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function flpClockGo(min){
  if(FCLK.t){ flpClockStop(); return; }
  if(FCLK.left<=0){ FCLK.left=min*60; FCLK.over=false; }
  tone("start");
  FCLK.t=setInterval(function(){
    FCLK.left--;
    var e=document.getElementById("flpClock");
    if(!e){ flpClockStop(); return; }
    if(FCLK.left<=0){
      FCLK.over=true; flpClockStop(); tone("blockend"); renderFlip(); return;
    }
    e.textContent=flpClockText();
  },1000);
  var e=document.getElementById("flpClock"); if(e) e.textContent=flpClockText();
}

function flpDone(d, rec, head){
  var h=head;
  h+='<div class="note">기준으로 갈린 장이 <b>'+rec.split+'</b>이고 '+
     '못 가른 장이 <b>'+rec.stuck+'</b>이다.</div>';
  h+=playHalf(d.end);
  if((rec.ids||[]).length){
    /* **번호를 화면이 들고만 있는다.** 앱은 파일을 못 쓴다 (`round.md` 2장).
       옮겨 적는 것은 사람이 한다. 안 적으면 이 판이 아무 데도 안 닿는다. */
    h+='<div class="note w"><b>못 가른 카드 번호를 검증 대기열에 옮겨 적는다.</b> '+
       '<span class="mono">'+rec.ids.map(esc).join(" ")+'</span><br>'+
       '앱은 파일을 못 쓴다. 이것을 적어야 다음에 내가 본다.</div>';
  }
  h+='<div class="note"><b>못 가른 것은 진 것이 아니다.</b> '+
     '기준에 무엇이 맞음인지가 안 적힌 카드가 있고 그것은 카드 탓이다. '+
     '<b>정답은 앱 어디에도 없다.</b> 이 판은 정답을 안 싣는다.</div>';
  return h+playGrade(d)+
    '<div class="row" style="margin-top:10px">'+
    '<button class="g" id="flpAgain">처음부터</button></div></div>';
}

function renderFlip(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("flip");
  FLP.min=p.min;
  if(!DATA.flip){
    box.innerHTML=dataWait("카드를","flip");
    if(!dataFailed("flip")) loadData("flip","ENG2P_FLIP",function(){ renderFlip(); });
    return;
  }
  /* 기기가 하나인 날. **건네는 1초에 화면이 켜져 있다** (T241).
     `solo_plays.md` 14번이 이 판을 돌려 보기로 적었다. 한 장마다 건넨다.
     덮개 밑에 아무것도 안 그린다. 여기서 재료가 보이면 답할 사람이 읽고 만다. */
  if(soloOn() && soloHanding()){
    box.innerHTML='<div class="card">'+soloCover([S.names.a,S.names.b])+'</div>';
    $("#soTake").onclick=function(){ soloTake(renderFlip); };
    return;
  }
  var d=DATA.flip, pl=(typeof plan==="function")?plan():null;
  var h='<div class="card">';

  /* **Q1 에는 안 돈다.** 문법 트랙이고 Q1 문법은 0퍼센트다 (규칙서 13.3). */
  if(pl && pl.quarter && pl.quarter < d.from){
    h+=playHead(p,0);
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 '+esc(d.from)+
       ' 부터 돈다.</b> 문법 트랙이고 Q1 문법은 0퍼센트다. '+
       '오늘은 '+esc(pl.quarter)+' 다. 다른 판을 연다.</div></div>';
    box.innerHTML=h; return;
  }

  var deck=flpDeck();
  if(deck.length < d.end){
    /* **없다고 보여 준다** (T298). 몇 장이 모자란지까지 적는다. */
    h+=playHead(p,0);
    h+='<div class="note w" style="margin-top:10px"><b>오늘은 이 판을 안 연다.</b> '+
       '그날 강까지 나온 카드에서 '+d.end+'장을 뽑아야 하는데 '+deck.length+
       '장뿐이다. 안 배운 카드를 드릴에 넣지 않는다.<br>'+
       '<b>분기가 바뀌는 첫머리에 나는 일이다.</b> 다음 강이면 열린다.</div></div>';
    box.innerHTML=h; return;
  }

  var s=roundStep("flip"), rec=flpRec();
  h+=playHead(p,s);

  if(FCLK.over){
    box.innerHTML=flpDone(d, rec, h+
      '<div class="note w" style="margin-top:10px"><b>'+FLP.min+'분이 됐다. 끝났다.</b> '+
      '남은 장은 안 돈다.</div>');
    $("#flpAgain").onclick=function(){ flpReset(rec); };
    return;
  }
  if(s>=deck.length){
    box.innerHTML=flpDone(d, rec, h+
      '<div class="note g" style="margin-top:10px"><b>'+deck.length+
      '장을 다 돌았다.</b></div>');
    $("#flpAgain").onclick=function(){ flpReset(rec); };
    return;
  }

  var c=deck[s], first=roundFirst(s, d.swap);
  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span class="small mut">'+esc(c.id)+' · '+esc(c.type)+'형</span>'+
     '<span class="small mut">'+(s+1)+' / '+deck.length+'장 · '+
     '<b>한 장마다 자리가 바뀐다</b></span></div>';
  h+='<div id="flpTurn"></div>';

  if(first===null){
    /* 기기 쪽을 안 골랐거나 한 기기로 도는 날이다. **둘 다 보인다.**
       가려 봐야 볼 사람이 하나다. 그래도 정답은 여전히 어디에도 없다. */
    h+='<div class="note w" style="margin-top:10px"><b>기기 쪽을 안 골랐다.</b> '+
       '한 기기로 도는 날이면 이대로 돈다. 재료를 답하는 사람이 안 보게 든다.</div>';
  }

  if(first===null || first===true){
    h+='<div class="note" style="margin-top:10px"><b>판정하는 쪽이다.</b> '+
       esc(c.ins)+'</div>';
    h+='<div class="flpmat">'+c.mat.map(function(m,i){
         return '<div><span class="lno">'+(i+1)+'</span>'+esc(m)+'</div>';
       }).join("")+'</div>';
    h+='<div class="flppass"><b>기준</b><br>'+esc(c.pass)+'</div>';
    if(c.splits){
      h+='<div class="note g"><b>이 기준은 무엇이 맞음인지를 적고 있다.</b> '+
         '그대로 가른다.</div>';
    }else{
      /* **셈뿐인 기준이다.** 그것을 화면이 말해야 한다.
         안 말하면 기준을 읽고 아무것도 못 얻은 사람이 자기가 못한 줄 안다. */
      h+='<div class="note w"><b>이 기준은 셈만 적고 있다.</b> '+
         '무엇이 맞음인지가 카드에 안 적혀 있다. '+
         '<b>아는 것으로 가르고 안 되면 못 가른다고 누른다.</b> '+
         '못 가른 것은 네 탓이 아니라 카드 탓이다.</div>';
    }
    h+='<div class="note"><b>정답은 이 화면에 없다.</b> '+
       '앱 어디에도 없고 자료에도 안 실려 있다. <b>그것이 이 판이다.</b></div>';
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="b" id="flpSplit">기준으로 갈렸다</button>'+
       '<button class="g" id="flpStuck">못 가른다</button></div>';
  }else{
    h+='<div class="note" style="margin-top:10px"><b>답하는 쪽이다.</b> '+
       esc(c.bIns)+'</div>';
    /* 재료를 가린다. **정답이 아니라 재료다.** 보면 듣는 것이 아니라 읽는 것이 된다. */
    h+=veilPane([], c.mat, "판정하는 쪽", []);
    h+='<div class="note"><b>문장은 저쪽 화면에만 있다.</b> '+
       '듣고 답한다. 읽고 답하는 것이 아니다.</div>';
    h+='<div class="small mut" style="margin-top:6px">이 자리 기준 <b>'+
       esc(c.bPass)+'</b></div>';
    /* **이 기기도 장을 넘겨야 한다.** 회 번호는 각자 센다 (`round.md` 6장).
       판정하는 쪽만 누르면 이 기기 회가 0에 머물고 두 기기가 영영 어긋난다.
       3초 벽에서 겪은 자리와 같다 (T283). 거기서는 미룬 장이 어긋났다.
       **판정이 한쪽에만 있는 판은 다 이 단추가 있어야 한다.** */
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="flpNext">저쪽이 눌렀다. 다음 장</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>이 자리에는 판정할 것이 없다.</b> 이 단추는 판정이 아니라 '+
       '<b>이 기기도 다음 장으로 넘기는 것</b>이다. '+
       '안 누르면 두 기기의 회가 어긋나고 판 표시가 달라진다. '+
       '다음 장에서 자리가 바뀐다.</div>';
  }

  h+='<div class="small mut" style="margin-top:8px">갈린 장 <b>'+rec.split+
     '</b> · 못 가른 장 <b>'+rec.stuck+'</b> <span class="mut">(이 기기 몫)</span></div>';
  if(soloOn())
    h+='<div class="note" style="margin-top:8px"><b>기기가 하나다.</b> '+
       '판정하는 쪽이 들고 <b>'+d.swap+'장마다 건넨다.</b> '+
       '재료가 이 화면에 있다. 답할 사람이 보면 듣는 것이 아니라 읽는 것이 된다.</div>'+
       '<div class="row" style="margin-top:10px">'+
       '<button class="g" id="flpHand">건넨다</button></div>';
  h+='<div class="row" style="margin-top:10px">'+
     '<button class="g" id="flpGo">'+FLP.min+'분 시계 <span class="mono" id="flpClock">'+
     flpClockText()+'</span></button></div>'+playGrade(d)+'</div>';
  box.innerHTML=h;

  /* 자리가 바뀌면 알린다. **처음 여는 판은 안 알린다** (`turnCheck` 가 그것을 본다). */
  if(turnCheck("flip", s, d.swap)) turnAlert(s, d.swap, FLP.seats, "flpTurn");
  $("#flpGo").onclick=function(){ flpClockGo(FLP.min); };
  if($("#flpHand")) $("#flpHand").onclick=function(){ soloHandOff(renderFlip); };
  function step(){ save(); roundStepSet("flip", s+1); renderFlip(); }
  /* **셈을 안 건드린다.** 이 기기는 이 장을 판정하지 않았다. */
  if($("#flpNext")) $("#flpNext").onclick=function(){ step(); };
  if($("#flpSplit")) $("#flpSplit").onclick=function(){
    rec.split++; tone("done"); step();
  };
  if($("#flpStuck")) $("#flpStuck").onclick=function(){
    /* **번호를 적어 둔다.** 검증 대기열로 가는 것이 이 판의 산출물이다. */
    rec.stuck++;
    if(!rec.ids) rec.ids=[];
    if(rec.ids.indexOf(c.id)<0) rec.ids.push(c.id);
    step();
  };
}
function flpReset(rec){
  roundStepSet("flip",0); turnForget("flip");
  rec.split=0; rec.stuck=0; rec.ids=[]; rec.deck=null; save();
  flpClockStop(); FCLK.left=0; FCLK.over=false; renderFlip();
}
PLAYREND.flip=renderFlip;
