/* =========================================================================
   한 줄 바꾸기 (T262). `docs/play_rules.md` 3.2

     쓰는 것    52과 대본 한 줄 + 바꿀 낱말. `out/data/swaps.js` (T261). **B등급**
     시작 조건  오늘 과의 대본이 열려 있다
     역할       읽는 쪽과 찾는 쪽. **한 줄마다 바뀐다**
     도는 차례  읽는 쪽 화면에만 바꿀 낱말이 뜬다. 찾는 쪽이 어디가 달랐는지 말한다
     판정       **읽은 사람**
     끝         다섯 줄을 돌면 끝난다
     못 했을 때 못 찾으면 **어디였는지 알려 주고 다시 읽는다**
     기록할 값  다섯 중 몇을 찾았는가

   거울 판과 갈리는 자리가 둘이다.

     자리가 **한 줄마다** 바뀐다. 거울은 넉 줄이다
     찾는 쪽이 **원문을 본다.** 시작 조건이 대본이 열려 있는 것이다

   뒤엣것이 이 판의 뼈대다. 찾는 쪽은 눈으로 원문을 따라가며 귀로 다른 데를 찾는다.
   그래서 **읽는 쪽 화면에만 있는 것은 바꾼 낱말 하나**다. 바뀐 줄 전체가 아니다.
   ========================================================================= */
var SWP={every:1, n:5, seats:["읽는 쪽","찾는 쪽"]};

/* 오늘 과의 줄들. **오늘 과가 아니면 안 돈다.** 시작 조건이 그것이다. */
function swpToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
function swpRows(){
  var d=DATA.swaps, mid=swpToday();
  if(!d || !d.items || !mid) return null;
  return d.items[mid] || [];
}
/* 오늘 돌 다섯. 씨앗으로 섞어 **두 기기가 같은 차례를 본다.**
   자료가 다섯보다 적은 과가 있다 (1과는 셋이다. T261).
   **모자라면 모자란 대로 돈다.** 이웃 과에서 안 가져온다. */
function swpItems(){
  var rows=swpRows(); if(!rows || !rows.length) return null;
  var ord=roundOrder(rows.length, roundSeed("swapline",0)), out=[];
  for(var i=0;i<Math.min(SWP.n,rows.length);i++) out.push(rows[ord[i]]);
  return out;
}
/* 대본 한 줄. 화자표를 뗀다. 화자 이름은 이 판이 쓰는 것이 아니다. */
function swpLine(li){
  var t=DATA.transcripts, mid=swpToday();
  if(!t || !t.items || !mid) return null;
  var ls=t.items[mid]; if(!ls || li>=ls.length) return null;
  return String(ls[li]).replace(/^[A-Z][A-Za-z .'-]{0,20}:\s*/, "");
}
function swpRec(){ return playRec("swapline", {hit:0, judged:0, ln:-1, told:false}); }

/* 5분 시계. 거울 판과 같다. **기기마다 따로 간다.** */
var SWPCLK={t:null, left:0, over:false};
function swpClockStop(){ if(SWPCLK.t){ clearInterval(SWPCLK.t); SWPCLK.t=null; } }
function swpClockText(){
  if(SWPCLK.over) return "0:00";
  var s=SWPCLK.left>0?SWPCLK.left:SWP.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function swpClockGo(min){
  if(SWPCLK.t){ swpClockStop(); return; }
  if(SWPCLK.left<=0){ SWPCLK.left=min*60; SWPCLK.over=false; }
  tone("start");
  SWPCLK.t=setInterval(function(){
    SWPCLK.left--;
    var e=document.getElementById("swpClock");
    if(!e){ swpClockStop(); return; }
    if(SWPCLK.left<=0){
      SWPCLK.over=true; swpClockStop(); tone("blockend"); renderSwapline(); return;
    }
    e.textContent=swpClockText();
  },1000);
  var e=document.getElementById("swpClock"); if(e) e.textContent=swpClockText();
}

function renderSwapline(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("swapline");
  SWP.min=p.min;
  /* 자료 둘을 게으르게 읽는다. **대본이 112KB 다.** 이 판을 안 열면 안 읽는다. */
  if(!DATA.swaps){
    box.innerHTML='<div class="card tight small mut">바꿀 낱말 표를 여는 중이다.</div>';
    loadData("swaps","ENG2P_SWAPS",function(){ renderSwapline(); });
    return;
  }
  if(!DATA.transcripts){
    box.innerHTML='<div class="card tight small mut">대본을 여는 중이다.</div>';
    loadData("transcripts","ENG2P_TRANSCRIPTS",function(){ renderSwapline(); });
    return;
  }
  var mid=swpToday();
  if(!mid){
    box.innerHTML='<div class="card"><div class="note w"><b>오늘 과가 없다.</b> '+
      '이 판은 오늘 과의 대본으로 돈다. 오늘 배정이 정해져야 시작한다.</div></div>';
    return;
  }
  var items=swpItems();
  if(!items || !items.length){
    box.innerHTML='<div class="card"><div class="note w">'+esc(mid)+
      ' 과에 바꿀 낱말이 없다. <b>scripts/derive_swaps.py</b> 를 돌려야 이 판이 돈다.'+
      '</div></div>';
    return;
  }
  var s=roundStep("swapline"), rec=swpRec();
  if(soloOn() && soloHanding()){
    box.innerHTML='<div class="card">'+soloCover([S.names.a,S.names.b])+'</div>';
    $("#soTake").onclick=function(){ soloTake(renderSwapline); };
    return;
  }
  var h='<div class="card">'+playHead(p,s);
  if(SWPCLK.over)
    h+='<div class="note w" style="margin-top:10px"><b>5분이 됐다.</b> '+
       '남은 줄은 안 돈다. 못 돈 줄은 못 한 것이 아니라 <b>시간이 그만큼인 것</b>이다.</div>';

  /* **다섯을 못 채우는 과가 있다.** 1과가 셋이다 (T261).
     다섯인 척하지 않는다. 몇 줄인지를 그 자리에서 적는다. */
  if(items.length<SWP.n && s===0)
    h+='<div class="note" style="margin-top:10px">이 과는 바꿀 자리가 <b>'+
       items.length+'줄</b>뿐이다. 규칙서는 다섯인데 대본이 그만큼을 안 댄다. '+
       '<b>있는 만큼 돈다.</b> 다른 과에서 가져오지 않는다.</div>';

  if(s>=items.length){
    h+='<div class="note g" style="margin-top:10px"><b>'+items.length+
       '줄을 다 돌았다.</b> 이 기기가 판정한 것은 '+rec.judged+'줄이고 '+
       '그중 '+rec.hit+'줄을 찾았다.</div>';
    h+=playHalf(items.length)+playGrade(DATA.swaps);
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="swpAgain">처음부터</button></div></div>';
    box.innerHTML=h;
    $("#swpAgain").onclick=function(){
      roundStepSet("swapline",0); turnForget("swapline");
      rec.hit=0; rec.judged=0; rec.ln=-1; rec.told=false; save();
      swpClockStop(); SWPCLK.left=0; SWPCLK.over=false; renderSwapline();
    };
    return;
  }

  var it=items[s], first=roundFirst(s, SWP.every), line=swpLine(it.li);
  if(line==null){
    h+='<div class="note w" style="margin-top:10px">대본에서 그 줄을 못 찾았다. '+
       '자료와 대본이 어긋났다. <b>python3 scripts/all.py</b> 를 돌린다.</div></div>';
    box.innerHTML=h; return;
  }
  /* 거울 판과 같은 자리다. 격차가 뼈대인 판은 기기 쪽을 안 고르면 안 돈다.
     `docs/play_app.md` 4장. */
  if(first===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '바꿀 낱말이 읽는 쪽 화면에만 떠야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고르거나, 기기가 하나면 규칙 탭에서 '+
       '<b>돌려 보기</b>를 켠다.</div></div>';
    box.innerHTML=h; return;
  }

  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?SWP.seats[0]:SWP.seats[1])+'</b>'+
     (soloOn()?' <span class="small mut">(돌려 보기)</span>':'')+'</span>'+
     '<span class="small mut">'+(s+1)+' / '+items.length+'번째 줄 · '+esc(mid)+'</span></div>';

  h+=first ? swpReader(it, line, s, rec) : swpFinder(line);

  h+='<div id="swpTurn"></div>';
  h+='<div class="small mut" style="margin-top:10px">자리는 <b>한 줄마다</b> 바뀐다.'+
     (soloOn()?' <b>기기가 하나다. 줄마다 건넨다.</b>':'')+'</div>';
  h+='<div class="row" style="margin-top:8px">'+
     '<button class="g" id="swpGo">5분 시계 <span class="mono" id="swpClock">'+
     swpClockText()+'</span></button>';
  if(soloOn()) h+='<button class="g" id="swpHand">건넨다</button>';
  h+='</div>'+playGrade(DATA.swaps)+'</div>';
  box.innerHTML=h;
  swpBind(it, s, rec, first);
}

/* 읽는 쪽. **바꿀 낱말이 이 화면에만 있다.**
   줄 전체를 바꿔서 보여 주지 않는다. 원문과 바꿀 자리를 같이 보이고
   읽는 사람이 그 자리에서 갈아 읽는다. 그래야 무엇을 바꿨는지 자기가 안다.
   그것이 이 판의 판정 근거다 (판정: 읽은 사람). */
function swpReader(it, line, s, rec){
  /* 바꿀 낱말만 짚어 준다. **줄에서 그 자리를 표시한다.**
     낱말만 주면 같은 낱말이 두 번 나올 때 어디를 바꿀지 모른다.
     자료가 두 번 나오는 낱말을 안 고르지만 (T261) 화면이 그것에 기대지 않는다. */
  var re=new RegExp("(^|[^A-Za-z])("+it.from.replace(/[^A-Za-z]/g,"")+")([^A-Za-z]|$)");
  /* **한 번 막은 글을 또 막지 않는다.** `esc` 를 거친 뒤의 글에서 자리를 찾고
     찾은 조각은 이미 막혀 있다. 다시 `esc` 를 걸면 `&amp;` 가 `&amp;amp;` 가 되고
     화면에 그대로 뜬다. 대본에 `&` 가 있는 줄에서 그 자리가 난다. */
  var shown=esc(line).replace(re, function(m,a,w,b){
    return a+'<b class="swpmark">'+w+'</b>'+b;
  });
  var h='<div class="note" style="margin-top:10px">아래 줄을 소리 내어 읽는다. '+
    '<b>짚어 둔 낱말만 바꿔 읽는다.</b> 나머지는 그대로다.</div>'+
    '<div class="swpline">'+shown+'</div>'+
    '<div class="swpswap"><span class="lno">바꿔</span>'+
    esc(it.from)+' <b>&rarr; '+esc(it.to)+'</b></div>'+
    '<div class="small mut">상대 화면에는 <b>원문만</b> 있다. 어디를 바꿨는지는 모른다.</div>';
  if(rec.ln===s && rec.told)
    h+='<div class="note w"><b>못 찾았다. 어디였는지 알려 주고 다시 읽는다.</b> '+
       '규칙서가 그렇게 정했다. 알려 준 뒤에 다음 줄로 간다. 벌은 없다.</div>'+
       '<div class="row" style="margin-top:8px">'+
       '<button class="b" id="swpNext">다음 줄</button></div>';
  else
    h+='<div class="row" style="margin-top:8px">'+
       '<button class="b" id="swpYes">찾았다</button>'+
       '<button class="g" id="swpNo">못 찾았다</button></div>'+
       '<div class="small mut" style="margin-top:6px">'+
       '<b>판정은 읽은 사람이 한다.</b> 상대가 말한 자리가 내가 바꾼 자리인지는 '+
       '나만 안다.</div>';
  return h;
}
/* 찾는 쪽. **원문이 이 화면에 있다.** 시작 조건이 대본이 열려 있는 것이다.
   바꿀 낱말은 여기 없다. `it` 을 아예 안 받는다. 안 받으면 못 그린다. */
function swpFinder(line){
  return '<div class="note" style="margin-top:10px">아래가 <b>원문</b>이다. '+
    '눈으로 따라가며 듣는다. <b>다르게 읽은 자리를 소리 내어 말한다.</b></div>'+
    '<div class="swpline">'+esc(line)+'</div>'+
    '<div class="vhid" aria-hidden="true" style="margin-top:10px">'+
    '<span>어디를 바꿔 읽는지는 상대 화면에만 있다</span></div>'+
    '<div class="small mut" style="margin-top:6px">맞았는지는 읽은 사람이 말해 준다. '+
    '이 기기는 모른다.</div>';
}
function swpBind(it, s, rec, first){
  if($("#swpGo")) $("#swpGo").onclick=function(){ swpClockGo(SWP.min); };
  if($("#swpHand")) $("#swpHand").onclick=function(){ soloHandOff(renderSwapline); };
  function step(){
    var n=s+1;
    roundStepSet("swapline", n); renderSwapline();
    if(turnCheck("swapline", n, SWP.every))
      turnAlert(n, SWP.every, SWP.seats, "swpTurn");
  }
  if(!first) return;
  if($("#swpYes")) $("#swpYes").onclick=function(){
    rec.ln=s; rec.hit++; rec.judged++; rec.told=false; save(); step();
  };
  /* 못 찾았을 때. **거울 판과 다르다.** 거기는 한 번 더 읽고 두 번째에 넘어가는데
     여기는 규칙서가 "알려 주고 다시 읽는다" 고 적었다. 알려 준 뒤에는
     찾는 쪽이 이미 알기 때문에 다시 판정하지 않는다. 그 줄은 못 찾은 줄이다. */
  if($("#swpNo")) $("#swpNo").onclick=function(){
    rec.ln=s; rec.judged++; rec.told=true; save(); renderSwapline();
  };
  if($("#swpNext")) $("#swpNext").onclick=function(){
    rec.told=false; save(); step();
  };
}
PLAYREND.swapline=renderSwapline;
