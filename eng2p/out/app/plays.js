/* 판 화면 묶음. app/play/ 에서 나온다. 손으로 안 고친다. */
var MIR={every:4, n:8, seats:["읽는 쪽","짚는 쪽"]};

function mirPool(){
  var d=DATA.pairs; if(!d || !d.groups) return null;
  var out=[];
  d.groups.forEach(function(g){
    (g.pairs||[]).forEach(function(p){ out.push({a:p.a, b:p.b, g:g.name}); });
  });
  return out;
}
function mirItems(n){
  var pool=mirPool(); if(!pool || pool.length<2) return null;
  var ord=roundOrder(pool.length, roundSeed("mirror",0)), out=[];
  for(var i=0;i<Math.min(n,pool.length);i++) out.push(pool[ord[i]]);
  return out;
}
function mirTarget(i){ return roundSeed("mirror", 100+(i|0))%2; }
function mirRec(){ return playRec("mirror", {hit:0, judged:0, ln:-1, miss:0, pick:null}); }

var MIRCLK={t:null, left:0, over:false};
function mirClockStop(){ if(MIRCLK.t){ clearInterval(MIRCLK.t); MIRCLK.t=null; } }
function mirClockText(){
  if(MIRCLK.over) return "0:00";
  var s=MIRCLK.left>0?MIRCLK.left:MIR.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function mirClockGo(min){
  if(MIRCLK.t){ mirClockStop(); return; }
  if(MIRCLK.left<=0){ MIRCLK.left=min*60; MIRCLK.over=false; }
  tone("start");
  MIRCLK.t=setInterval(function(){
    MIRCLK.left--;
    var e=document.getElementById("mirClock");
    if(!e){ mirClockStop(); return; }
    if(MIRCLK.left<=0){
      MIRCLK.over=true; mirClockStop(); tone("blockend"); renderMirror(); return;
    }
    e.textContent=mirClockText();
  },1000);
  var e=document.getElementById("mirClock"); if(e) e.textContent=mirClockText();
}

function renderMirror(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("mirror");
  MIR.min=p.min;
  if(!DATA.pairs){
    box.innerHTML='<div class="card tight small mut">쌍 표를 여는 중이다.</div>';
    loadData("pairs","ENG2P_PAIRS",function(){ renderMirror(); });
    return;
  }
  var items=mirItems(MIR.n);
  if(!items){
    box.innerHTML='<div class="card"><div class="note w">쌍 표가 비어 있다. '+
      '<b>scripts/derive_pairs.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    return;
  }
  var s=roundStep("mirror"), rec=mirRec();
  if(soloOn() && soloHanding()){
    box.innerHTML='<div class="card">'+soloCover([S.names.a,S.names.b])+'</div>';
    $("#soTake").onclick=function(){ soloTake(renderMirror); };
    return;
  }
  var h='<div class="card">'+playHead(p,s);
  if(MIRCLK.over)
    h+='<div class="note w" style="margin-top:10px"><b>4분이 됐다.</b> '+
       '규칙서가 여기서 끝내라고 적었다. 남은 줄은 안 돈다. '+
       '못 돈 줄은 못 한 것이 아니라 <b>시간이 그만큼인 것</b>이다.</div>';

  if(s>=items.length){
    h+='<div class="note g" style="margin-top:10px"><b>여덟 쌍을 다 돌았다.</b> '+
       '이 기기가 판정한 것은 '+rec.judged+'줄이고 그중 '+rec.hit+'줄이 건너갔다.</div>';
    h+=playHalf(MIR.n)+playGrade(DATA.pairs);
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="mirAgain">처음부터</button></div></div>';
    box.innerHTML=h;
    $("#mirAgain").onclick=function(){
      roundStepSet("mirror",0); turnForget("mirror");
      rec.hit=0; rec.judged=0; rec.ln=-1; rec.miss=0; rec.pick=null; save();
      mirClockStop(); MIRCLK.left=0; MIRCLK.over=false; renderMirror();
    };
    return;
  }

  var it=items[s], first=roundFirst(s, MIR.every);

  if(first===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '읽는 쪽 화면에만 답이 떠야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고르거나, 기기가 하나면 규칙 탭에서 '+
       '<b>돌려 보기</b>를 켠다.</div></div>';
    box.innerHTML=h;
    return;
  }

  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?MIR.seats[0]:MIR.seats[1])+'</b>'+
     (soloOn()?' <span class="small mut">(돌려 보기)</span>':'')+'</span>'+
     '<span class="small mut">'+(s+1)+' / '+items.length+'번째 줄</span></div>';

  h+=first ? mirReader(it, s, rec) : mirPointer(it, s, rec);

  h+='<div id="mirTurn"></div>';
  h+='<div class="small mut" style="margin-top:10px">자리는 넉 줄마다 바뀐다. '+
     '다음에 바뀌는 줄은 '+(roundNextTurn(s,MIR.every)+1)+'번째다.'+
     (soloOn()?' <b>기기가 하나다. 그때 건넨다.</b>':'')+'</div>';
  h+='<div class="row" style="margin-top:8px">'+
     '<button class="g" id="mirGo">4분 시계 <span class="mono" id="mirClock">'+
     mirClockText()+'</span></button>';
  if(soloOn()) h+='<button class="g" id="mirHand">건넨다</button>';
  h+='</div>';
  h+=playGrade(DATA.pairs)+'</div>';
  box.innerHTML=h;
  mirBind(it, s, rec, first);
}

function mirReader(it, s, rec){
  var word=mirTarget(s)?it.b:it.a;
  var h='<div class="mirword">'+esc(word)+'</div>'+
    '<div class="small mut">대립: '+esc(it.g)+
    ' · 짝은 상대 화면에 둘 다 있다. <b>어느 쪽인지는 상대가 모른다.</b></div>'+
    '<div class="note" style="margin-top:10px">소리 내어 한 번 읽는다. '+
    '상대가 무엇을 골랐는지 말하면 <b>내가 읽은 것과 견준다.</b></div>';
  if(rec.ln===s && rec.miss===1)
    h+='<div class="note w"><b>못 짚었다. 한 번 더 읽는다.</b> '+
       '두 번째도 못 짚으면 넘어간다. 규칙서가 그렇게 정했다.</div>';
  h+='<div class="row" style="margin-top:8px">'+
     '<button class="b" id="mirYes">짚었다</button>'+
     '<button class="g" id="mirNo">못 짚었다</button></div>'+
     '<div class="small mut" style="margin-top:6px">'+
     '<b>판정은 읽은 사람이 한다.</b> 앱이 시킨 것과 내가 낸 소리가 다를 수 있고 '+
     '그것은 나만 안다. 누구 잘못인지는 안 가른다. 벌도 없다.</div>';
  return h;
}
function mirPointer(it, s, rec){
  var picked=(rec.ln===s && rec.pick!=null)?rec.pick:null;
  var h='<div class="vpane" style="margin-top:10px"><div class="vmine">'+
    '<div><span class="lno">1</span>'+esc(it.a)+'</div>'+
    '<div><span class="lno">2</span>'+esc(it.b)+'</div></div>'+
    '<div class="vhid" aria-hidden="true"><span>어느 쪽을 읽는지는 상대 화면에만 있다'+
    '</span></div></div>'+
    '<div class="small mut" style="margin-top:6px">대립: '+esc(it.g)+'</div>';
  if(picked==null){
    h+='<div class="note" style="margin-top:10px">읽는 것을 듣고 '+
       '<b>둘 중 하나를 누른다.</b></div>'+
       '<div class="row"><button class="g" data-mp="0">'+esc(it.a)+'</button>'+
       '<button class="g" data-mp="1">'+esc(it.b)+'</button></div>';
  }else{
    h+='<div class="note w" style="margin-top:10px"><b>'+esc(picked?it.b:it.a)+
       '</b> 를 골랐다. <b>소리 내어 말한다.</b> 맞았는지는 읽은 사람이 말해 준다. '+
       '이 기기는 모른다.</div>'+
       '<div class="row"><button class="g" data-mp="'+(picked?0:1)+'">'+
       esc(picked?it.a:it.b)+' 로 바꾼다</button>'+
       '<button class="b" id="mirNext">다음 줄</button></div>';
  }
  return h;
}
function mirBind(it, s, rec, first){
  if($("#mirGo")) $("#mirGo").onclick=function(){ mirClockGo(MIR.min); };
  if($("#mirHand")) $("#mirHand").onclick=function(){ soloHandOff(renderMirror); };
  function step(){
    var n=s+1;
    roundStepSet("mirror", n); renderMirror();
    if(turnCheck("mirror", n, MIR.every))
      turnAlert(n, MIR.every, MIR.seats, "mirTurn");
  }
  if(first){
    $("#mirYes").onclick=function(){
      rec.ln=s; rec.hit++; rec.judged++; rec.miss=0; rec.pick=null; save(); step();
    };
    $("#mirNo").onclick=function(){
      if(rec.ln===s && rec.miss>=1){
        rec.judged++; rec.miss=0; rec.pick=null; save(); step(); return;
      }
      rec.ln=s; rec.miss=1; save(); renderMirror();
    };
  }else{
    $("#playPane").querySelectorAll("[data-mp]").forEach(function(b){
      b.onclick=function(){ rec.ln=s; rec.pick=+b.dataset.mp; save(); renderMirror(); };
    });
    if($("#mirNext")) $("#mirNext").onclick=function(){ rec.pick=null; save(); step(); };
  }
}
PLAYREND.mirror=renderMirror;
var SWP={every:1, n:5, seats:["읽는 쪽","찾는 쪽"]};

function swpToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
function swpRows(){
  var d=DATA.swaps, mid=swpToday();
  if(!d || !d.items || !mid) return null;
  return d.items[mid] || [];
}
function swpItems(){
  var rows=swpRows(); if(!rows || !rows.length) return null;
  var ord=roundOrder(rows.length, roundSeed("swapline",0)), out=[];
  for(var i=0;i<Math.min(SWP.n,rows.length);i++) out.push(rows[ord[i]]);
  return out;
}
function swpLine(li){
  var t=DATA.transcripts, mid=swpToday();
  if(!t || !t.items || !mid) return null;
  var ls=t.items[mid]; if(!ls || li>=ls.length) return null;
  return String(ls[li]).replace(/^[A-Z][A-Za-z .'-]{0,20}:\s*/, "");
}
function swpRec(){ return playRec("swapline", {hit:0, judged:0, ln:-1, told:false}); }

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

function swpReader(it, line, s, rec){
  var re=new RegExp("(^|[^A-Za-z])("+it.from.replace(/[^A-Za-z]/g,"")+")([^A-Za-z]|$)");
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
  if($("#swpNo")) $("#swpNo").onclick=function(){
    rec.ln=s; rec.judged++; rec.told=true; save(); renderSwapline();
  };
  if($("#swpNext")) $("#swpNext").onclick=function(){
    rec.told=false; save(); step();
  };
}
PLAYREND.swapline=renderSwapline;
var HRM={every:3, n:6, seats:["말하는 쪽","듣는 쪽"]};

function hrmToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
function hrmItems(){
  var d=DATA.listen, mid=hrmToday();
  if(!d || !d.items || !mid) return null;
  var rows=d.items[mid]||[];
  if(!rows.length) return null;
  var ord=roundOrder(rows.length, roundSeed("hearme",0)), out=[];
  for(var i=0;i<Math.min(HRM.n,rows.length);i++) out.push(rows[ord[i]]);
  return out;
}
function hrmLine(li){
  var t=DATA.transcripts, mid=hrmToday();
  if(!t || !t.items || !mid) return null;
  var ls=t.items[mid]; if(!ls || li>=ls.length) return null;
  return String(ls[li]).replace(/^[A-Z][A-Za-z .'-]{0,20}:\s*/, "");
}
function hrmRec(){ return playRec("hearme", {none:0, judged:0, ln:-1}); }

var HRMCLK={t:null, left:0, over:false};
function hrmClockStop(){ if(HRMCLK.t){ clearInterval(HRMCLK.t); HRMCLK.t=null; } }
function hrmClockText(){
  if(HRMCLK.over) return "0:00";
  var s=HRMCLK.left>0?HRMCLK.left:HRM.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function hrmClockGo(min){
  if(HRMCLK.t){ hrmClockStop(); return; }
  if(HRMCLK.left<=0){ HRMCLK.left=min*60; HRMCLK.over=false; }
  tone("start");
  HRMCLK.t=setInterval(function(){
    HRMCLK.left--;
    var e=document.getElementById("hrmClock");
    if(!e){ hrmClockStop(); return; }
    if(HRMCLK.left<=0){
      HRMCLK.over=true; hrmClockStop(); tone("blockend"); renderHearme(); return;
    }
    e.textContent=hrmClockText();
  },1000);
  var e=document.getElementById("hrmClock"); if(e) e.textContent=hrmClockText();
}

function renderHearme(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("hearme");
  HRM.min=p.min;
  if(!DATA.listen){
    box.innerHTML='<div class="card tight small mut">듣는 쪽 지시를 여는 중이다.</div>';
    loadData("listen","ENG2P_LISTEN",function(){ renderHearme(); });
    return;
  }
  if(!DATA.transcripts){
    box.innerHTML='<div class="card tight small mut">대본을 여는 중이다.</div>';
    loadData("transcripts","ENG2P_TRANSCRIPTS",function(){ renderHearme(); });
    return;
  }
  var mid=hrmToday();
  if(!mid){
    box.innerHTML='<div class="card"><div class="note w"><b>오늘 과가 없다.</b> '+
      '이 판은 오늘 과의 대본으로 돈다.</div></div>';
    return;
  }
  var items=hrmItems();
  if(!items){
    box.innerHTML='<div class="card"><div class="note w">'+esc(mid)+
      ' 과에 듣는 쪽 지시가 없다. <b>scripts/derive_listen.py</b> 를 돌려야 돈다.'+
      '</div></div>';
    return;
  }
  var s=roundStep("hearme"), rec=hrmRec();
  var h='<div class="card">'+playHead(p,s);
  if(HRMCLK.over)
    h+='<div class="note w" style="margin-top:10px"><b>5분이 됐다.</b> '+
       '남은 줄은 안 돈다. 못 돈 줄은 못 한 것이 아니라 <b>시간이 그만큼인 것</b>이다.</div>';

  if(items.length<HRM.n && s===0)
    h+='<div class="note" style="margin-top:10px">이 과는 지시가 <b>'+
       items.length+'줄</b>뿐이다. <b>있는 만큼 돈다.</b> 다른 과에서 가져오지 않는다.</div>';

  if(s>=items.length){
    h+='<div class="note g" style="margin-top:10px"><b>'+items.length+
       '줄을 다 돌았다.</b> 이 기기가 판정한 것은 '+rec.judged+'줄이고 '+
       '그중 <b>짚을 것이 없었던 줄이 '+rec.none+'</b>이다.</div>';
    h+='<div class="note">규칙서가 남기라는 값은 <b>짚을 것이 없었던 줄</b>이다. '+
       '틀린 줄이 아니다. 늘어야 하는 쪽은 이 숫자다.</div>';
    h+=playHalf(items.length)+playGrade(DATA.listen);
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="hrmAgain">처음부터</button></div></div>';
    box.innerHTML=h;
    $("#hrmAgain").onclick=function(){
      roundStepSet("hearme",0); turnForget("hearme");
      rec.none=0; rec.judged=0; rec.ln=-1; save();
      hrmClockStop(); HRMCLK.left=0; HRMCLK.over=false; renderHearme();
    };
    return;
  }

  var it=items[s], line=hrmLine(it.li);
  var kind=(DATA.listen.kinds||{})[it.kind];
  if(line==null || !kind){
    h+='<div class="note w" style="margin-top:10px">대본이나 지시를 못 찾았다. '+
       '<b>python3 scripts/all.py</b> 를 돌린다.</div></div>';
    box.innerHTML=h; return;
  }

  var solo=(typeof soloOn==="function") && soloOn();
  var first=solo ? false : roundFirst(s, HRM.every);
  if(!solo && first===null){
    h+='<div class="note w" style="margin-top:10px"><b>기기 쪽을 안 골랐다.</b> '+
       '이 판은 기기가 하나여도 돈다. 대장 탭에서 쪽을 고르거나, '+
       '규칙 탭에서 <b>돌려 보기</b>를 켜면 이 기기가 듣는 쪽이 된다. '+
       '말하는 쪽은 종이 강의록의 대본을 본다.</div></div>';
    box.innerHTML=h; return;
  }
  if(solo)
    h+='<div class="note" style="margin-top:10px"><b>기기가 하나다. 건네지 않는다.</b> '+
       '둘이 같은 순간에 봐야 하는 판이다. 말하는 쪽은 <b>종이 강의록</b>의 대본을 보고 '+
       '이 기기는 듣는 쪽이 든다.</div>';

  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?HRM.seats[0]:HRM.seats[1])+'</b></span>'+
     '<span class="small mut">'+(s+1)+' / '+items.length+'번째 줄 · '+esc(mid)+'</span></div>';

  h+=first ? hrmSpeaker(line) : hrmListener(it, kind, s, rec);

  h+='<div id="hrmTurn"></div>';
  h+='<div class="small mut" style="margin-top:10px">자리는 <b>세 줄마다</b> 바뀐다. '+
     '다음에 바뀌는 줄은 '+(roundNextTurn(s,HRM.every)+1)+'번째다.</div>';
  h+='<div class="row" style="margin-top:8px">'+
     '<button class="g" id="hrmGo">5분 시계 <span class="mono" id="hrmClock">'+
     hrmClockText()+'</span></button></div>'+playGrade(DATA.listen)+'</div>';
  box.innerHTML=h;
  hrmBind(s, rec, first);
}

function hrmSpeaker(line){
  return '<div class="note" style="margin-top:10px">아래 줄을 <b>평소대로</b> 읽는다. '+
    '상대가 무엇을 듣고 있는지는 <b>모르는 채로 읽는다.</b></div>'+
    '<div class="swpline">'+esc(line)+'</div>'+
    '<div class="vhid" aria-hidden="true" style="margin-top:10px">'+
    '<span>무엇을 듣는지는 상대 화면에만 있다</span></div>';
}
function hrmListener(it, kind, s, rec){
  var h='<div class="note" style="margin-top:10px">듣는 것: <b>'+esc(kind.name)+'</b>'+
    (it.word ? ' · 낱말: <b>'+esc(it.word)+'</b>' : ' · 줄 전체의 박자')+'</div>'+
    '<div class="hrmsay">'+esc(kind.say)+'</div>'+
    '<div class="small mut">근거: '+esc(kind.why)+' (블록 2 근거표)</div>'+
    '<div class="note w" style="margin-top:10px">듣고 나서 <b>소리 내어 말해 준다.</b> '+
    '<b>짚을 것이 없으면 없다고 말한다. 없다도 답이다.</b></div>'+
    '<div class="row" style="margin-top:8px">'+
    '<button class="b" id="hrmNone">짚을 것이 없었다</button>'+
    '<button class="g" id="hrmSome">짚어 줬다</button></div>'+
    '<div class="small mut" style="margin-top:6px">'+
    '<b>판정은 듣는 사람이 한다.</b> 자기 발음은 자기가 못 듣는다. '+
    '누구 잘못인지는 안 가른다. 벌도 없다.</div>';
  return h;
}
function hrmBind(s, rec, first){
  if($("#hrmGo")) $("#hrmGo").onclick=function(){ hrmClockGo(HRM.min); };
  function step(){
    var n=s+1;
    roundStepSet("hearme", n); renderHearme();
    if(turnCheck("hearme", n, HRM.every))
      turnAlert(n, HRM.every, HRM.seats, "hrmTurn");
  }
  if(first) return;   /* 말하는 쪽에는 판정 단추가 없다 */
  if($("#hrmNone")) $("#hrmNone").onclick=function(){
    rec.ln=s; rec.none++; rec.judged++; save(); step();
  };
  if($("#hrmSome")) $("#hrmSome").onclick=function(){
    rec.ln=s; rec.judged++; save(); step();
  };
}
PLAYREND.hearme=renderHearme;
var RLY={every:1, n:3, seats:["처음 듣는 쪽","옮기는 쪽"], said:null, ready:false};

function rlyToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
function rlyItems(){
  var d=DATA.relay, mid=rlyToday();
  if(!d || !d.items || !mid) return null;
  var rows=d.items[mid]||[];
  if(!rows.length) return null;
  var ord=roundOrder(rows.length, roundSeed("relay",0)), out=[];
  for(var i=0;i<Math.min(RLY.n,rows.length);i++) out.push(rows[ord[i]]);
  return out;
}
function rlyLine(li){
  var t=DATA.transcripts, mid=rlyToday();
  if(!t || !t.items || !mid) return null;
  var ls=t.items[mid]; if(!ls || li>=ls.length) return null;
  return String(ls[li]).replace(/^[A-Z][A-Za-z .'-]{0,20}:\s*/, "");
}
function rlyRec(){ return playRec("relay", {off:0, done:0, ln:-1}); }

function rlyWords(s){
  return String(s||"").toLowerCase().replace(/[’']/g,"'")
    .replace(/[^a-z' ]+/g," ").split(/\s+/).filter(function(x){return x;});
}
function rlyDiff(src, got){
  var a=rlyWords(src), b=rlyWords(got);
  var m=[], i, j;
  for(i=0;i<=a.length;i++){ m.push([]); for(j=0;j<=b.length;j++) m[i].push(0); }
  for(i=1;i<=a.length;i++) for(j=1;j<=b.length;j++)
    m[i][j]=(a[i-1]===b[j-1]) ? m[i-1][j-1]+1 : Math.max(m[i-1][j], m[i][j-1]);
  var keepA=[], keepB=[];
  for(i=0;i<a.length;i++) keepA.push(false);
  for(j=0;j<b.length;j++) keepB.push(false);
  i=a.length; j=b.length;
  while(i>0 && j>0){
    if(a[i-1]===b[j-1]){ keepA[i-1]=true; keepB[j-1]=true; i--; j--; }
    else if(m[i-1][j]>=m[i][j-1]) i--;
    else j--;
  }
  function spots(keep){
    var n=0, was=true;
    keep.forEach(function(k){ if(!k && was) n++; was=k; });
    return n;
  }
  return {a:a, b:b, keepA:keepA, keepB:keepB,
          off:Math.max(spots(keepA), spots(keepB))};
}
function rlyMark(words, keep){
  return words.map(function(w,i){
    return keep[i] ? esc(w) : '<b class="rlyoff">'+esc(w)+'</b>';
  }).join(" ") || '<span class="mut">(빈 칸)</span>';
}

var RLYA={el:null, stop:null};
function rlyAudioStop(){
  if(RLYA.stop){ clearTimeout(RLYA.stop); RLYA.stop=null; }
  if(RLYA.el){ try{ RLYA.el.pause(); }catch(e){} }
}
function rlyPlay(it){
  var mid=rlyToday(), m=MEDIA.filter(function(x){return x.id===mid;})[0];
  if(!m) return false;
  if(!RLYA.el){ RLYA.el=document.createElement("audio"); RLYA.el.preload="none"; }
  rlyAudioStop();
  if(RLYA.el.src.indexOf(m.audio)<0) RLYA.el.src=m.audio;
  try{
    RLYA.el.currentTime=Math.max(0, it.at);
    RLYA.el.play();
    RLYA.stop=setTimeout(function(){ rlyAudioStop(); }, (it.dur+0.7)*1000);
  }catch(e){ return false; }
  return true;
}

var RLYCLK={t:null, left:0, over:false};
function rlyClockStop(){ if(RLYCLK.t){ clearInterval(RLYCLK.t); RLYCLK.t=null; } }
function rlyClockText(){
  if(RLYCLK.over) return "0:00";
  var s=RLYCLK.left>0?RLYCLK.left:RLY.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function rlyClockGo(min){
  if(RLYCLK.t){ rlyClockStop(); return; }
  if(RLYCLK.left<=0){ RLYCLK.left=min*60; RLYCLK.over=false; }
  tone("start");
  RLYCLK.t=setInterval(function(){
    RLYCLK.left--;
    var e=document.getElementById("rlyClock");
    if(!e){ rlyClockStop(); return; }
    if(RLYCLK.left<=0){
      RLYCLK.over=true; rlyClockStop(); tone("blockend"); renderRelay(); return;
    }
    e.textContent=rlyClockText();
  },1000);
  var e=document.getElementById("rlyClock"); if(e) e.textContent=rlyClockText();
}

function renderRelay(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("relay");
  RLY.min=p.min;
  if(!DATA.relay){
    box.innerHTML='<div class="card tight small mut">줄 고르기를 여는 중이다.</div>';
    loadData("relay","ENG2P_RELAY",function(){ renderRelay(); });
    return;
  }
  if(!DATA.transcripts){
    box.innerHTML='<div class="card tight small mut">대본을 여는 중이다.</div>';
    loadData("transcripts","ENG2P_TRANSCRIPTS",function(){ renderRelay(); });
    return;
  }
  if(!MEDIA.length){
    box.innerHTML='<div class="card tight small mut">소리 차림표를 여는 중이다.</div>';
    needMedia(function(){ renderRelay(); });
    return;
  }
  var mid=rlyToday(), items=rlyItems();
  if(!mid || !items){
    box.innerHTML='<div class="card"><div class="note w">오늘 과의 줄이 없다. '+
      '<b>scripts/derive_relay.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    return;
  }
  var s=roundStep("relay"), rec=rlyRec();
  if(soloOn() && soloHanding()){
    box.innerHTML='<div class="card">'+soloCover([S.names.a,S.names.b])+'</div>';
    $("#soTake").onclick=function(){ soloTake(renderRelay); };
    return;
  }
  var h='<div class="card">'+playHead(p,s);
  if(RLYCLK.over)
    h+='<div class="note w" style="margin-top:10px"><b>5분이 됐다.</b> '+
       '남은 바퀴는 안 돈다. 못 돈 것은 <b>시간이 그만큼인 것</b>이다.</div>';

  if(s>=items.length){
    h+='<div class="note g" style="margin-top:10px"><b>'+items.length+
       '바퀴를 다 돌았다.</b> 이 기기가 적은 바퀴는 '+rec.done+'이고 '+
       '거기서 <b>틀어진 자리가 '+rec.off+'군데</b>다.</div>';
    h+='<div class="note">틀어진 자리가 <b>안 들리는 자리</b>다. '+
       '벌이 아니라 다음에 들을 자리다. 규칙서가 그렇게 적었다.</div>';
    h+=playHalf(items.length)+playGrade(DATA.relay);
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="rlyAgain">처음부터</button></div></div>';
    box.innerHTML=h;
    $("#rlyAgain").onclick=function(){
      roundStepSet("relay",0); turnForget("relay");
      rec.off=0; rec.done=0; rec.ln=-1; save();
      RLY.said=null; rlyAudioStop(); rlyClockStop();
      RLYCLK.left=0; RLYCLK.over=false;
      revealReset("relay"+s); renderRelay();
    };
    return;
  }

  var it=items[s], line=rlyLine(it.li), first=roundFirst(s, RLY.every);
  if(line==null){
    h+='<div class="note w" style="margin-top:10px">대본에서 그 줄을 못 찾았다.'+
       '</div></div>';
    box.innerHTML=h; return;
  }
  if(first===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '한 기기만 소리를 내야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고르거나, 기기가 하나면 규칙 탭에서 '+
       '<b>돌려 보기</b>를 켠다.</div></div>';
    box.innerHTML=h; return;
  }

  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?RLY.seats[0]:RLY.seats[1])+'</b>'+
     (soloOn()?' <span class="small mut">(돌려 보기)</span>':'')+'</span>'+
     '<span class="small mut">'+(s+1)+' / '+items.length+'바퀴 · '+esc(mid)+'</span></div>';

  h+='<div id="rlyEar" style="margin-top:10px"></div>';

  var key="relay"+s, open=revealOpen(key);
  if(first) h+=rlyHear(it, open, line);
  else h+=rlyWrite(key, open, line, s, rec);

  h+='<div id="rlyTurn"></div>';
  h+='<div class="small mut" style="margin-top:10px">자리는 <b>한 바퀴마다</b> 바뀐다.'+
     (soloOn()?' <b>기기가 하나다. 바퀴마다 건넨다.</b>':'')+'</div>';
  h+='<div class="row" style="margin-top:8px">'+
     '<button class="g" id="rlyGo">5분 시계 <span class="mono" id="rlyClock">'+
     rlyClockText()+'</span></button>';
  if(soloOn()) h+='<button class="g" id="rlyHand">건넨다</button>';
  h+='</div>'+playGrade(DATA.relay)+'</div>';
  box.innerHTML=h;
  earAsk("relay", "rlyEar", null, s, RLY.every);
  rlyBind(it, key, open, line, s, rec, first);
}

function rlyHear(it, open, line){
  var h='<div class="note" style="margin-top:10px">단추를 눌러 <b>한 번 듣는다.</b> '+
    '듣고 나서 <b>상대에게 말로 옮긴다.</b> 상대가 그것을 적는다.</div>'+
    '<div class="row"><button class="b" id="rlySound">소리 듣기 '+
    '<span class="small">'+it.dur.toFixed(1)+'초쯤</span></button>'+
    '<button class="g" id="rlyAgainSnd">다시 듣기</button></div>'+
    '<div class="small mut" style="margin-top:6px">소리 자리가 <b>어림</b>이라 '+
    '조금 일찍 끊기거나 늦게 시작할 수 있다. 다시 듣기로 맞춘다.</div>';
  if(!open)
    h+='<div class="vhid" aria-hidden="true" style="margin-top:10px">'+
       '<span>원문은 상대가 다 적은 뒤에 둘이 같이 편다</span></div>'+
       '<div class="note w"><b>상대가 다 적었다고 하면</b> 둘이 같이 누른다.</div>'+
       '<div class="row"><button class="g" data-reveal="relayA">펴기</button></div>';
  else
    h+='<div class="note g" style="margin-top:10px">폈다. 원문이다.</div>'+
       '<div class="swpline">'+esc(line)+'</div>'+
       '<div class="note">상대 화면에 <b>어디서 틀어졌는지</b>가 짚여 있다. '+
       '같이 본다.</div>';
  return h;
}
function rlyWrite(key, open, line, s, rec){
  var h='<div class="note" style="margin-top:10px">상대가 말로 옮겨 주는 것을 '+
    '<b>그대로 적는다.</b> 못 알아들으면 다시 말해 달라고 한다.</div>'+
    '<textarea id="rlyIn" rows="3" placeholder="들은 대로 적는다" '+
    (open?'readonly':'')+'>'+esc(RLY.said||"")+'</textarea>';
  if(!open) return h+revealGate(key, "rlyIn", "원문과 견준다");
  var d=rlyDiff(line, RLY.said||"");
  h+='<div class="note g" style="margin-top:10px">폈다. <b>틀어진 자리 '+d.off+
     '군데.</b> 벌이 아니라 <b>다음에 들을 자리</b>다.</div>'+
     '<div class="small mut">원문</div><div class="rlyline">'+
     rlyMark(d.a, d.keepA)+'</div>'+
     '<div class="small mut">적은 것</div><div class="rlyline">'+
     rlyMark(d.b, d.keepB)+'</div>'+
     '<div class="small mut">대소문자와 문장부호는 안 본다. 말로 옮긴 것을 '+
     '받아 적은 글이라 쉼표가 다른 것은 틀어진 것이 아니다.</div>'+
     '<div class="row" style="margin-top:8px">'+
     '<button class="b" id="rlyNext">되짚었다. 다음 바퀴</button></div>';
  return h;
}
function rlyBind(it, key, open, line, s, rec, first){
  if($("#rlyGo")) $("#rlyGo").onclick=function(){ rlyClockGo(RLY.min); };
  if($("#rlyHand")) $("#rlyHand").onclick=function(){
    rlyAudioStop(); soloHandOff(renderRelay);
  };
  if($("#rlySound")) $("#rlySound").onclick=function(){
    if(!rlyPlay(it)) $("#rlyEar").innerHTML=
      '<div class="note w">소리 파일을 못 열었다. 내려받은 자리에 '+
      '<b>media/english/audio</b> 가 같이 있어야 한다.</div>';
  };
  if($("#rlyAgainSnd")) $("#rlyAgainSnd").onclick=function(){ rlyPlay(it); };
  var pane=$("#playPane");
  revealBind(pane, function(){ renderRelay(); });
  pane.querySelectorAll('[data-reveal="relayA"]').forEach(function(b){
    b.onclick=function(){ REVEAL.open[key]=true; renderRelay(); };
  });
  var ta=$("#rlyIn");
  if(ta && !open) ta.oninput=function(){
    RLY.said=ta.value;
    var now=!!String(ta.value||"").trim();
    if(now===RLY.ready) return;
    RLY.ready=now;
    renderRelay();
    var t2=$("#rlyIn");
    if(t2){ t2.focus(); try{ t2.setSelectionRange(t2.value.length, t2.value.length); }catch(e){} }
  };
  if($("#rlyNext")) $("#rlyNext").onclick=function(){
    var d=rlyDiff(line, RLY.said||"");
    rec.ln=s; rec.off+=d.off; rec.done++; save();
    RLY.said=null; revealReset(key); rlyAudioStop();
    var n=s+1;
    roundStepSet("relay", n); renderRelay();
    if(turnCheck("relay", n, RLY.every))
      turnAlert(n, RLY.every, RLY.seats, "rlyTurn");
  };
}
PLAYREND.relay=renderRelay;
var CHN={n:0, seats:["던지는 쪽","붙이는 쪽"]};

function chnToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
function chnPool(){
  var d=DATA.chunks, mid=chnToday();
  if(!d || !d.items || !mid) return null;
  var rows=d.items[mid]||[];
  if(!rows.length) return null;
  var ord=roundOrder(rows.length, roundSeed("chain",0)), out=[];
  for(var i=0;i<rows.length;i++) out.push(rows[ord[i]]);
  return out;
}
function chnRec(){ return playRec("chain", {best:0, folds:0}); }

function chnWho(folds, marks){
  var f=roundFirst(folds+marks, 1);
  return f===null ? null : (f ? CHN.seats[0] : CHN.seats[1]);
}

var CHNCLK={t:null, left:0, over:false};
function chnClockStop(){ if(CHNCLK.t){ clearInterval(CHNCLK.t); CHNCLK.t=null; } }
function chnClockText(){
  if(CHNCLK.over) return "0:00";
  var s=CHNCLK.left>0?CHNCLK.left:CHN.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function chnClockGo(min){
  if(CHNCLK.t){ chnClockStop(); return; }
  if(CHNCLK.left<=0){ CHNCLK.left=min*60; CHNCLK.over=false; }
  tone("start");
  CHNCLK.t=setInterval(function(){
    CHNCLK.left--;
    var e=document.getElementById("chnClock");
    if(!e){ chnClockStop(); return; }
    if(CHNCLK.left<=0){
      CHNCLK.over=true; chnClockStop(); tone("blockend"); renderChain(); return;
    }
    e.textContent=chnClockText();
  },1000);
  var e=document.getElementById("chnClock"); if(e) e.textContent=chnClockText();
}

function renderChain(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("chain");
  CHN.min=p.min;
  if(!DATA.chunks){
    box.innerHTML='<div class="card tight small mut">청크 목록을 여는 중이다.</div>';
    loadData("chunks","ENG2P_CHUNKS",function(){ renderChain(); });
    return;
  }
  var mid=chnToday(), pool=chnPool();
  if(!mid || !pool){
    box.innerHTML='<div class="card"><div class="note w">오늘 과의 청크가 없다. '+
      '<b>scripts/derive_chunks.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    return;
  }
  var folds=roundStep("chain"), rec=chnRec(), marks=CHN.n;
  var h='<div class="card">'+playHead(p,folds);
  if(CHNCLK.over){
    h+='<div class="note w" style="margin-top:10px"><b>5분이 됐다. 끝났다.</b> '+
       '제일 길게 간 것이 <b>'+Math.max(rec.best,marks)+'마디</b>다. '+
       '규칙서가 남기라는 값이 그것이다.</div>';
    h+='<div class="note">접은 횟수는 '+rec.folds+'이다. '+
       '<b>누가 끊었는지는 안 센다.</b> 접는 것은 실패가 아니라 경계 표시다.</div>';
    h+='<div class="note">두 기기에 <b>같은 수</b>가 있어야 한다. '+
       '소리 내어 견준다. 다르면 세다가 어긋난 것이다.</div>';
    h+=playGrade(DATA.chunks);
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="chnAgain">처음부터</button></div></div>';
    box.innerHTML=h;
    $("#chnAgain").onclick=function(){
      roundStepSet("chain",0); turnForget("chain");
      rec.best=0; rec.folds=0; save();
      CHN.n=0; chnClockStop(); CHNCLK.left=0; CHNCLK.over=false; renderChain();
    };
    return;
  }

  var who=chnWho(folds, marks);
  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>지금 <b>'+esc(who||"둘이 정한다")+'</b></span>'+
     '<span class="small mut">접은 횟수 '+folds+' · '+esc(mid)+'</span></div>';
  if(who===null)
    h+='<div class="note" style="margin-top:8px">기기 쪽을 안 골라 '+
       '<b>누구 차례인지는 못 말한다.</b> 이 판은 가릴 것이 없어서 그대로 돈다. '+
       '대장 탭에서 쪽을 고르면 차례가 뜬다.</div>';

  h+='<div class="chnbig"><b>'+marks+'</b> 마디</div>'+
     '<div class="small mut">제일 길게 간 것 '+Math.max(rec.best,marks)+'마디</div>';

  h+='<div class="note" style="margin-top:10px">청크 하나로 시작해 '+
     '<b>번갈아 붙여 문장을 늘린다.</b> 말로만 한다. 적지 않는다. '+
     '말이 되면 잇고 안 되면 접는다. <b>둘이 같이 정한다.</b></div>';
  h+='<div class="row" style="margin-top:8px">'+
     '<button class="b" id="chnAdd">이었다 (+1마디)</button>'+
     '<button class="g" id="chnFold">접는다</button></div>';
  h+='<div class="small mut" style="margin-top:6px">'+
     '<b>누가 끊었는지는 안 센다.</b> 접는 것은 실패가 아니라 배운 것의 경계 표시다. '+
     '접으면 자리가 바뀐다.</div>';

  h+='<div class="chnpool"><div class="small mut">오늘 과의 청크. '+
     '<b>배운 것 밖으로 나가면 접는다.</b></div>';
  pool.slice(0,12).forEach(function(c){
    h+='<span class="chnk">'+esc(c.c)+'</span>';
  });
  h+='</div>';
  h+='<div id="chnTurn"></div>';
  h+='<div class="row" style="margin-top:8px">'+
     '<button class="g" id="chnGo">5분 시계 <span class="mono" id="chnClock">'+
     chnClockText()+'</span></button></div>'+playGrade(DATA.chunks)+'</div>';
  box.innerHTML=h;

  $("#chnAdd").onclick=function(){
    CHN.n++;
    if(CHN.n>rec.best){ rec.best=CHN.n; save(); }
    tone("next"); renderChain();
  };
  $("#chnFold").onclick=function(){
    if(CHN.n>rec.best) rec.best=CHN.n;
    rec.folds++; save();
    CHN.n=0;
    var n=folds+1;
    roundStepSet("chain", n); renderChain();
    if(turnCheck("chain", n, 1)) turnAlert(n, 1, CHN.seats, "chnTurn");
  };
  $("#chnGo").onclick=function(){ chnClockGo(CHN.min); };
}
PLAYREND.chain=renderChain;
var TWH={every:1, n:6, seats:["앞을 받는 쪽","뒤를 받는 쪽"]};

function twhToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
function twhItems(){
  var d=DATA.halves, mid=twhToday();
  if(!d || !d.items || !mid) return null;
  var rows=d.items[mid]||[];
  if(!rows.length) return null;
  var ord=roundOrder(rows.length, roundSeed("twohalf",0)), out=[];
  for(var i=0;i<Math.min(TWH.n,rows.length);i++) out.push(rows[ord[i]]);
  return out;
}
function twhRec(){ return playRec("twohalf", {joined:0, done:0, ln:-1}); }

var TWHCLK={t:null, left:0, over:false};
function twhClockStop(){ if(TWHCLK.t){ clearInterval(TWHCLK.t); TWHCLK.t=null; } }
function twhClockText(){
  if(TWHCLK.over) return "0:00";
  var s=TWHCLK.left>0?TWHCLK.left:TWH.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function twhClockGo(min){
  if(TWHCLK.t){ twhClockStop(); return; }
  if(TWHCLK.left<=0){ TWHCLK.left=min*60; TWHCLK.over=false; }
  tone("start");
  TWHCLK.t=setInterval(function(){
    TWHCLK.left--;
    var e=document.getElementById("twhClock");
    if(!e){ twhClockStop(); return; }
    if(TWHCLK.left<=0){
      TWHCLK.over=true; twhClockStop(); tone("blockend"); renderTwohalf(); return;
    }
    e.textContent=twhClockText();
  },1000);
  var e=document.getElementById("twhClock"); if(e) e.textContent=twhClockText();
}

function renderTwohalf(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("twohalf");
  TWH.min=p.min;
  if(!DATA.halves){
    box.innerHTML='<div class="card tight small mut">가른 문장을 여는 중이다.</div>';
    loadData("halves","ENG2P_HALVES",function(){ renderTwohalf(); });
    return;
  }
  var mid=twhToday(), items=twhItems();
  if(!mid || !items){
    box.innerHTML='<div class="card"><div class="note w">오늘 과의 가른 문장이 없다. '+
      '<b>scripts/derive_halves.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    return;
  }
  var s=roundStep("twohalf"), rec=twhRec();
  if(soloOn() && soloHanding()){
    box.innerHTML='<div class="card">'+soloCover([S.names.a,S.names.b])+'</div>';
    $("#soTake").onclick=function(){ soloTake(renderTwohalf); };
    return;
  }
  var h='<div class="card">'+playHead(p,s);
  if(TWHCLK.over)
    h+='<div class="note w" style="margin-top:10px"><b>4분이 됐다.</b> '+
       '남은 문장은 안 돈다. 못 돈 것은 <b>시간이 그만큼인 것</b>이다.</div>';

  if(items.length<TWH.n && s===0)
    h+='<div class="note" style="margin-top:10px">이 과는 가른 문장이 <b>'+
       items.length+'개</b>뿐이다. <b>있는 만큼 돈다.</b></div>';

  if(s>=items.length){
    h+='<div class="note g" style="margin-top:10px"><b>'+items.length+
       '문장을 다 돌았다.</b> 그중 <b>'+rec.joined+'개가 붙었다.</b></div>';
    h+='<div class="note">두 기기에 <b>같은 수</b>가 있어야 한다. 소리 내어 견준다. '+
       '이 판은 둘이 같이 판정하므로 절반이 아니다.</div>';
    h+=playGrade(DATA.halves);
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="twhAgain">처음부터</button></div></div>';
    box.innerHTML=h;
    $("#twhAgain").onclick=function(){
      roundStepSet("twohalf",0); turnForget("twohalf");
      rec.joined=0; rec.done=0; rec.ln=-1; save();
      TWH.open=null; twhClockStop(); TWHCLK.left=0; TWHCLK.over=false; renderTwohalf();
    };
    return;
  }

  var it=items[s], first=roundFirst(s, TWH.every);
  if(first===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '각자 절반씩 봐야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고르거나, 기기가 하나면 규칙 탭에서 '+
       '<b>돌려 보기</b>를 켠다.</div></div>';
    box.innerHTML=h; return;
  }

  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?TWH.seats[0]:TWH.seats[1])+'</b>'+
     (soloOn()?' <span class="small mut">(돌려 보기)</span>':'')+'</span>'+
     '<span class="small mut">'+(s+1)+' / '+items.length+'문장 · '+esc(mid)+'</span></div>';

  var open=(TWH.open===s);
  if(open){
    h+='<div class="note g" style="margin-top:10px">폈다. 원래 문장이다.</div>'+
       '<div class="swpline">'+esc(it.a+" "+it.b)+'</div>'+
       '<div class="note"><b>펴 보는 것이 벌이 아니다.</b> 규칙서가 그렇게 적었다. '+
       '못 붙은 문장이 다음에 붙일 자리다.</div>'+
       '<div class="row" style="margin-top:8px">'+
       '<button class="b" id="twhNext">다음 문장</button></div>';
  }else{
    h+='<div class="note" style="margin-top:10px">이 기기에 <b>절반만</b> 있다. '+
       '<b>서로 안 보여 준다.</b> 차례로 말해 붙인다.</div>'+
       '<div class="swpline">'+esc(first?it.a:it.b)+'</div>'+
       '<div class="vhid" aria-hidden="true"><span>'+
       esc(first?"뒤 토막":"앞 토막")+'은 상대 화면에만 있다</span></div>'+
       '<div class="row" style="margin-top:10px">'+
       '<button class="b" id="twhYes">붙었다</button>'+
       '<button class="g" id="twhNo">안 붙는다. 펴 본다</button></div>'+
       '<div class="small mut" style="margin-top:6px">'+
       '<b>판정은 둘이 같이 한다.</b> 붙여서 말이 되면 통과다. '+
       '두 기기에서 같이 누른다.</div>';
  }

  h+='<div id="twhTurn"></div>';
  h+='<div class="small mut" style="margin-top:10px">자리는 <b>문장마다</b> 바뀐다.'+
     (soloOn()?' <b>기기가 하나다. 문장마다 건넨다.</b>':'')+'</div>';
  h+='<div class="row" style="margin-top:8px">'+
     '<button class="g" id="twhGo">4분 시계 <span class="mono" id="twhClock">'+
     twhClockText()+'</span></button>';
  if(soloOn()) h+='<button class="g" id="twhHand">건넨다</button>';
  h+='</div>'+playGrade(DATA.halves)+'</div>';
  box.innerHTML=h;

  if($("#twhGo")) $("#twhGo").onclick=function(){ twhClockGo(TWH.min); };
  if($("#twhHand")) $("#twhHand").onclick=function(){ soloHandOff(renderTwohalf); };
  function step(){
    TWH.open=null;
    var n=s+1;
    roundStepSet("twohalf", n); renderTwohalf();
    if(turnCheck("twohalf", n, TWH.every))
      turnAlert(n, TWH.every, TWH.seats, "twhTurn");
  }
  if($("#twhYes")) $("#twhYes").onclick=function(){
    rec.ln=s; rec.joined++; rec.done++; save(); step();
  };
  if($("#twhNo")) $("#twhNo").onclick=function(){
    rec.ln=s; rec.done++; save(); TWH.open=s; renderTwohalf();
  };
  if($("#twhNext")) $("#twhNext").onclick=function(){ step(); };
}
PLAYREND.twohalf=renderTwohalf;
var OVL={n:0, said:"", ready:false, heard:"", keep:[], hit:null};

function ovlToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
function ovlTarget(){
  var d=DATA.chunks, mid=ovlToday();
  if(!d || !d.items || !mid) return null;
  var rows=d.items[mid]||[];
  if(!rows.length) return null;
  return rows[roundSeed("overlap",0)%rows.length].c;
}
function ovlRec(){ return playRec("overlap", {rounds:0, wiped:0, hit:0}); }

function ovlSame(a, b){
  function k(s){
    return String(s||"").toLowerCase().replace(/[’]/g,"'")
      .replace(/[^a-z']/g,"");
  }
  var x=k(a), y=k(b);
  return !!x && x===y;
}

var OVLCLK={t:null, left:0, over:false};
function ovlClockStop(){ if(OVLCLK.t){ clearInterval(OVLCLK.t); OVLCLK.t=null; } }
function ovlClockText(){
  if(OVLCLK.over) return "0:00";
  var s=OVLCLK.left>0?OVLCLK.left:OVL.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function ovlClockGo(min){
  if(OVLCLK.t){ ovlClockStop(); return; }
  if(OVLCLK.left<=0){ OVLCLK.left=min*60; OVLCLK.over=false; }
  tone("start");
  OVLCLK.t=setInterval(function(){
    OVLCLK.left--;
    var e=document.getElementById("ovlClock");
    if(!e){ ovlClockStop(); return; }
    if(OVLCLK.left<=0){
      OVLCLK.over=true; ovlClockStop(); tone("blockend"); renderOverlap(); return;
    }
    e.textContent=ovlClockText();
  },1000);
  var e=document.getElementById("ovlClock"); if(e) e.textContent=ovlClockText();
}

function renderOverlap(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("overlap");
  OVL.min=p.min;
  if(!DATA.chunks){
    box.innerHTML='<div class="card tight small mut">청크 목록을 여는 중이다.</div>';
    loadData("chunks","ENG2P_CHUNKS",function(){ renderOverlap(); });
    return;
  }
  var mid=ovlToday(), tgt=ovlTarget();
  if(!tgt){
    box.innerHTML='<div class="card"><div class="note w">오늘 과의 청크가 없다. '+
      '<b>scripts/derive_chunks.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    return;
  }
  var r=roundStep("overlap"), rec=ovlRec();
  var h='<div class="card">'+playHead(p,r);

  if(OVL.hit!=null || OVLCLK.over){
    var done=(OVL.hit!=null);
    h+='<div class="note '+(done?"g":"w")+'" style="margin-top:10px">'+
       (done ? '<b>닿았다.</b> '+OVL.hit+'바퀴 만이다.'
             : '<b>4분이 됐다.</b> '+r+'바퀴를 돌았다. 못 닿아도 그것은 시간이다.')+
       '</div>';
    h+='<div class="note">지워진 단서가 '+rec.wiped+'개다. '+
       '<b>지워진 것이 손해가 아니다.</b> 둘이 같은 자리를 봤다는 뜻이고 '+
       '그것이 이 판이 찾는 것이다.</div>';
    h+='<div class="note">두 기기에 <b>같은 수</b>가 있어야 한다. 소리 내어 견준다. '+
       '이 판은 역할이 없어서 둘이 같은 일을 한다.</div>';
    h+=playGrade(DATA.chunks);
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="ovlAgain">처음부터</button></div></div>';
    box.innerHTML=h;
    $("#ovlAgain").onclick=function(){
      roundStepSet("overlap",0);
      rec.rounds=0; rec.wiped=0; save();
      OVL.said=""; OVL.heard=""; OVL.ready=false; OVL.keep=[]; OVL.hit=null;
      REVEAL.open={}; ovlClockStop(); OVLCLK.left=0; OVLCLK.over=false; renderOverlap();
    };
    return;
  }

  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span class="small mut">이 판은 <b>역할이 없다.</b> 둘이 같은 일을 한다</span>'+
     '<span class="small mut">'+(r+1)+'바퀴째 · '+esc(mid)+'</span></div>';
  h+='<div class="small mut" style="margin-top:10px">맞힐 것</div>'+
     '<div class="ovltgt">'+esc(tgt)+'</div>'+
     '<div class="small mut">둘 다 이것을 안다. 맞히는 것이 아니라 '+
     '<b>겹치지 않는 단서를 찾는 것</b>이 이 판이다.</div>';

  if(OVL.keep.length){
    h+='<div class="chnpool"><div class="small mut">남은 단서</div>';
    OVL.keep.forEach(function(w){ h+='<span class="chnk">'+esc(w)+'</span>'; });
    h+='</div>';
  }

  var key="overlap"+r, open=revealOpen(key);
  if(!open){
    h+='<div class="note" style="margin-top:12px">단서 <b>한 낱말</b>을 적는다. '+
       '<b>상대에게 안 보여 준다.</b> 다 적으면 펴는 단추가 켜진다.</div>'+
       '<input id="ovlIn" placeholder="단서 한 낱말" autocomplete="off" '+
       'value="'+esc(OVL.said)+'">';
    h+=revealGate(key, "ovlIn", "둘이 같이 편다");
  }else{
    h+='<div class="note g" style="margin-top:12px">폈다. 내 단서는 <b>'+
       esc(OVL.said)+'</b> 다. <b>소리 내어 말한다.</b></div>'+
       '<div class="note">상대가 말한 낱말을 친다. '+
       '<b>기기끼리는 못 주고받는다.</b> 치면 그 자리에서 견준다.</div>'+
       '<input id="ovlHeard" placeholder="상대가 말한 낱말" autocomplete="off" '+
       'value="'+esc(OVL.heard)+'">'+
       '<div id="ovlSay"></div>';
  }

  h+='<div class="row" style="margin-top:10px">'+
     '<button class="g" id="ovlGo">4분 시계 <span class="mono" id="ovlClock">'+
     ovlClockText()+'</span></button></div>'+playGrade(DATA.chunks)+'</div>';
  box.innerHTML=h;

  $("#ovlGo").onclick=function(){ ovlClockGo(OVL.min); };
  var ta=$("#ovlIn");
  if(ta) ta.oninput=function(){
    OVL.said=ta.value;
    var now=!!String(ta.value||"").trim();
    if(now===OVL.ready) return;
    OVL.ready=now; renderOverlap();
    var t2=$("#ovlIn");
    if(t2){ t2.focus(); try{ t2.setSelectionRange(t2.value.length, t2.value.length); }catch(e){} }
  };
  revealBind($("#playPane"), function(){ renderOverlap(); });
  function paintSay(){
    var sb=$("#ovlSay"); if(!sb) return;
    if(!String(OVL.heard||"").trim()){ sb.innerHTML=""; return; }
    var same=ovlSame(OVL.said, OVL.heard);
    sb.innerHTML='<div class="note '+(same?"w":"g")+'" style="margin-top:8px">'+
      (same ? '<b>겹쳤다. 둘 다 지운다.</b> 지워진 것이 손해가 아니다. '+
              '둘이 같은 자리를 봤다는 뜻이다.'
            : '<b>안 겹쳤다. 둘 다 남는다.</b>')+
      ' 앱은 <b>글자만</b> 본다. 뜻이 같은지는 둘이 정한다.</div>'+
      '<div class="row" style="margin-top:8px">'+
      '<button class="b" id="ovlNext">다음 바퀴</button>'+
      '<button class="g" id="ovlHit">남은 단서로 닿았다</button></div>';
    bindGo();
  }
  var hb=$("#ovlHeard");
  if(hb) hb.oninput=function(){ OVL.heard=hb.value; paintSay(); };
  function nextRound(){
    var same=ovlSame(OVL.said, OVL.heard);
    if(same){ rec.wiped+=2; }
    else {
      if(String(OVL.said||"").trim()) OVL.keep.push(String(OVL.said).trim());
      if(String(OVL.heard||"").trim()) OVL.keep.push(String(OVL.heard).trim());
    }
    rec.rounds++; save();
    OVL.said=""; OVL.heard=""; OVL.ready=false;
    revealReset(key);
    roundStepSet("overlap", r+1);
  }
  function bindGo(){
    if($("#ovlNext")) $("#ovlNext").onclick=function(){ nextRound(); renderOverlap(); };
    if($("#ovlHit")) $("#ovlHit").onclick=function(){
      nextRound();
      OVL.hit=r+1; rec.hit=OVL.hit; save();
      tone("done"); renderOverlap();
    };
  }
  paintSay();
}
PLAYREND.overlap=renderOverlap;
var LAD={seats:["말하는 쪽","세는 쪽"], ok:0, no:0};

function ladLabel(s){ return (s && s.label) || String(s && s.rate); }
function ladToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
function ladPiece(){
  var d=DATA.relay, mid=ladToday();
  if(!d || !d.items || !mid) return null;
  var rows=d.items[mid]||[];
  if(!rows.length) return null;
  return rows[roundSeed("ladder",0)%rows.length];
}
function ladLine(li){
  var t=DATA.transcripts, mid=ladToday();
  if(!t || !t.items || !mid) return null;
  var ls=t.items[mid]; if(!ls || li>=ls.length) return null;
  return String(ls[li]).replace(/^[A-Z][A-Za-z .'-]{0,20}:\s*/, "");
}
function ladRec(){ return playRec("ladder", {best:0, up:0, down:0}); }
function ladStep(){
  var d=DATA.ladder;
  var n=roundStep("ladder");
  return Math.max(0, Math.min((d&&d.steps?d.steps.length:1)-1, n));
}
function ladWho(){
  var f=roundFirst(roundStep("ladder"), 1);
  return f===null ? null : (f ? LAD.seats[0] : LAD.seats[1]);
}

var LADA={el:null, stop:null};
function ladAudioStop(){
  if(LADA.stop){ clearTimeout(LADA.stop); LADA.stop=null; }
  if(LADA.el){ try{ LADA.el.pause(); }catch(e){} }
}
function ladPlay(it, rate){
  var mid=ladToday(), m=MEDIA.filter(function(x){return x.id===mid;})[0];
  if(!m) return false;
  if(!LADA.el){ LADA.el=document.createElement("audio"); LADA.el.preload="none"; }
  ladAudioStop();
  if(LADA.el.src.indexOf(m.audio)<0) LADA.el.src=m.audio;
  try{
    LADA.el.playbackRate=rate;
    LADA.el.currentTime=Math.max(0, it.at);
    LADA.el.play();
    LADA.stop=setTimeout(function(){ ladAudioStop(); },
                         ((it.dur/rate)+0.7)*1000);
  }catch(e){ return false; }
  return true;
}

var LADCLK={t:null, left:0, over:false};
function ladClockStop(){ if(LADCLK.t){ clearInterval(LADCLK.t); LADCLK.t=null; } }
function ladClockText(){
  if(LADCLK.over) return "0:00";
  var s=LADCLK.left>0?LADCLK.left:LAD.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function ladClockGo(min){
  if(LADCLK.t){ ladClockStop(); return; }
  if(LADCLK.left<=0){ LADCLK.left=min*60; LADCLK.over=false; }
  tone("start");
  LADCLK.t=setInterval(function(){
    LADCLK.left--;
    var e=document.getElementById("ladClock");
    if(!e){ ladClockStop(); return; }
    if(LADCLK.left<=0){
      LADCLK.over=true; ladClockStop(); tone("blockend"); renderLadder(); return;
    }
    e.textContent=ladClockText();
  },1000);
  var e=document.getElementById("ladClock"); if(e) e.textContent=ladClockText();
}

function renderLadder(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("ladder");
  LAD.min=p.min;
  if(!DATA.ladder){
    box.innerHTML='<div class="card tight small mut">사다리 규격을 여는 중이다.</div>';
    loadData("ladder","ENG2P_LADDER",function(){ renderLadder(); });
    return;
  }
  if(!DATA.relay){
    box.innerHTML='<div class="card tight small mut">토막을 여는 중이다.</div>';
    loadData("relay","ENG2P_RELAY",function(){ renderLadder(); });
    return;
  }
  if(!DATA.transcripts){
    box.innerHTML='<div class="card tight small mut">대본을 여는 중이다.</div>';
    loadData("transcripts","ENG2P_TRANSCRIPTS",function(){ renderLadder(); });
    return;
  }
  if(!MEDIA.length){
    box.innerHTML='<div class="card tight small mut">소리 차림표를 여는 중이다.</div>';
    needMedia(function(){ renderLadder(); });
    return;
  }
  var d=DATA.ladder, it=ladPiece();
  if(!it){
    box.innerHTML='<div class="card"><div class="note w">오늘 과의 토막이 없다. '+
      '<b>scripts/derive_relay.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    return;
  }
  var line=ladLine(it.li), k=ladStep(), st=d.steps[k], rec=ladRec();
  var top=(k>=d.steps.length-1 && LAD.ok>=d.up);
  var h='<div class="card">'+playHead(p, k);

  if(top || LADCLK.over){
    h+='<div class="note '+(top?"g":"w")+'" style="margin-top:10px">'+
       (top ? '<b>꼭대기까지 갔다.</b> '+ladLabel(d.steps[d.steps.length-1])+
              ' 배속이 '+d.up+'번 됐다.'
            : '<b>'+LAD.min+'분이 됐다.</b> 그 칸에서 끝난다.')+
       ' 닿은 제일 높은 칸은 <b>'+ladLabel(d.steps[rec.best])+' 배속</b>이다.</div>';
    h+='<div class="note">규칙서가 남기라는 값은 <b>닿은 제일 높은 칸</b> 하나다. '+
       '오르내린 자취는 안 센다. <b>내려간 것은 셈에 안 들어간다.</b></div>';
    h+='<div class="note">두 기기에 <b>같은 칸</b>이 있어야 한다. 소리 내어 견준다.</div>';
    h+=playGrade(d);
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="ladAgain">처음부터</button></div></div>';
    box.innerHTML=h;
    $("#ladAgain").onclick=function(){
      roundStepSet("ladder",0); turnForget("ladder");
      rec.best=0; rec.up=0; rec.down=0; save();
      LAD.ok=0; LAD.no=0; ladAudioStop(); ladClockStop();
      LADCLK.left=0; LADCLK.over=false; renderLadder();
    };
    return;
  }

  var who=ladWho();
  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(who||"둘이 정한다")+'</b></span>'+
     '<span class="small mut">'+esc(ladToday())+'</span></div>';
  if(who===null)
    h+='<div class="note" style="margin-top:8px">기기 쪽을 안 골라 '+
       '<b>누가 세는지는 못 말한다.</b> 이 판은 소리를 둘이 같이 들어서 그대로 돈다. '+
       '대장 탭에서 쪽을 고르면 자리가 뜬다.</div>';

  h+='<div class="ladbox">';
  for(var i=d.steps.length-1;i>=0;i--){
    var s=d.steps[i];
    h+='<div class="ladrow'+(i===k?" on":"")+(i<k?" past":"")+'">'+
       '<b class="mono">'+ladLabel(s)+'</b><span>'+esc(s.see)+'</span></div>';
  }
  h+='</div>';

  h+='<div class="small mut" style="margin-top:10px">이 토막을 '+ladLabel(st)+
     ' 배속으로 듣고 따라 말한다</div>'+
     '<div class="swpline">'+esc(line||"")+'</div>'+
     '<div class="row"><button class="b" id="ladSound">'+ladLabel(st)+
     ' 배속으로 듣기</button>'+
     '<button class="g" id="ladOne">1.0 으로 한 번</button></div>';

  h+='<div class="note" style="margin-top:10px"><b>'+ladLabel(st)+' 배속에서 볼 것</b><br>'+
     esc(st.judge)+'</div>';
  h+='<div class="small mut">연달아 <b>'+LAD.ok+' / '+d.up+'</b>'+
     (LAD.no?' · 안 된 것 연달아 '+LAD.no+' / '+d.down:'')+'</div>';
  h+='<div class="row" style="margin-top:8px">'+
     '<button class="b" id="ladYes">됐다</button>'+
     '<button class="g" id="ladNo">한 번 더</button></div>'+
     '<div class="small mut" style="margin-top:6px">'+
     '<b>판정은 세는 사람이 한다.</b> 자기 소리는 자기가 못 듣는다. '+
     '<b>내려가는 것은 벌이 아니다.</b> 다음에 할 일이다.</div>';

  h+='<div id="ladTurn"></div>';
  h+='<div class="row" style="margin-top:10px">'+
     '<button class="g" id="ladGo">'+LAD.min+'분 시계 <span class="mono" id="ladClock">'+
     ladClockText()+'</span></button></div>'+playGrade(d)+'</div>';
  box.innerHTML=h;

  $("#ladGo").onclick=function(){ ladClockGo(LAD.min); };
  $("#ladSound").onclick=function(){
    if(!ladPlay(it, st.rate)) $("#ladTurn").innerHTML=
      '<div class="note w">소리 파일을 못 열었다. <b>media/english/audio</b> 가 '+
      '같이 있어야 한다.</div>';
  };
  $("#ladOne").onclick=function(){ ladPlay(it, 1); };

  function moveTo(n, why){
    roundStepSet("ladder", n);
    LAD.ok=0; LAD.no=0;
    var cur=ladStep();
    if(cur>rec.best){ rec.best=cur; }
    save();
    renderLadder();
    if(turnCheck("ladder", n, 1)) turnAlert(n, 1, LAD.seats, "ladTurn");
    if(why) $("#ladTurn").innerHTML+='<div class="note w">'+esc(why)+'</div>';
  }
  $("#ladYes").onclick=function(){
    LAD.ok++; LAD.no=0;
    if(LAD.ok>=d.up && k<d.steps.length-1){
      rec.up++; tone("done");
      moveTo(k+1, "한 칸 올랐다. 이제 "+ladLabel(d.steps[k+1])+" 배속이다.");
      return;
    }
    tone("next"); renderLadder();
  };
  $("#ladNo").onclick=function(){
    LAD.no++; LAD.ok=0;
    if(LAD.no>=d.down && k>0){
      rec.down++;
      moveTo(k-1, d.downSay);
      return;
    }
    renderLadder();
  };
}
PLAYREND.ladder=renderLadder;
var WAL={seats:["단서를 띄우는 쪽","받는 쪽"], stage:"ask"};

function walPool(){
  var d=DATA.wall, pl=(typeof plan==="function")?plan():null;
  if(!d || !d.cards || !pl || !pl.cards || !pl.quarter) return [];
  return d.cards.filter(function(c){
    return c.q < pl.quarter || (c.q === pl.quarter && c.no <= pl.cards.to);
  });
}
function walRec(){ return playRec("wall", {hit:0, done:0, defer:[], deck:null}); }

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
  var ord=roundOrder(rest.length, roundSeed("wall",0));
  for(var i=0;i<ord.length && out.length<d.end;i++) out.push(rest[ord[i]]);
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
    box.innerHTML='<div class="card tight small mut">단서를 여는 중이다.</div>';
    loadData("wall","ENG2P_WALL",function(){ renderWall(); });
    return;
  }
  var d=DATA.wall, pool=walPool();

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

  h+='<div class="walclock'+(WAL.stage==="relay"?" relay":"")+'">'+
     '<b class="mono" id="walClock">'+(first?walClockText(it.sec):String(it.sec))+'</b>'+
     '<span>'+it.sec+'초 · '+
     (first ? (WAL.stage==="relay"?"대신 받는 차례":"받는 차례")
            : "띄우는 쪽이 잰다")+'</span></div>';

  if(WAL.stage==="relay")
    h+='<div class="note w"><b>시간이 지났다. 상대가 대신 받는다.</b> '+
       '같은 '+it.sec+'초를 준다. <b>대신 받은 것도 받은 것으로 센다.</b></div>';

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
  if($("#walNext")) $("#walNext").onclick=function(){ nextCard(false, false); };
  if($("#walDefer")) $("#walDefer").onclick=function(){ nextCard(false, true); };
}
PLAYREND.wall=renderWall;
var RBD={seats:["던지는 쪽","받는 쪽"]};

function rbdToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
function rbdPool(){
  var d=DATA.chunks, mid=rbdToday();
  if(!d || !d.items || !mid) return null;
  var rows=d.items[mid]||[];
  if(!rows.length) return null;
  var ord=roundOrder(rows.length, roundSeed("rebound",0)), out=[];
  for(var i=0;i<rows.length;i++) out.push(rows[ord[i]]);
  return out;
}
function rbdRec(){ return playRec("rebound", {best:0, run:0, stops:0}); }

var RBDCLK={t:null, left:0, over:false};
function rbdClockStop(){ if(RBDCLK.t){ clearInterval(RBDCLK.t); RBDCLK.t=null; } }
function rbdClockText(){
  if(RBDCLK.over) return "0:00";
  var s=RBDCLK.left>0?RBDCLK.left:RBD.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function rbdClockGo(min){
  if(RBDCLK.t){ rbdClockStop(); return; }
  if(RBDCLK.left<=0){ RBDCLK.left=min*60; RBDCLK.over=false; }
  tone("start");
  RBDCLK.t=setInterval(function(){
    RBDCLK.left--;
    var e=document.getElementById("rbdClock");
    if(!e){ rbdClockStop(); return; }
    if(RBDCLK.left<=0){
      RBDCLK.over=true; rbdClockStop(); tone("blockend"); renderRebound(); return;
    }
    e.textContent=rbdClockText();
  },1000);
  var e=document.getElementById("rbdClock"); if(e) e.textContent=rbdClockText();
}

function renderRebound(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("rebound");
  RBD.min=p.min;
  if(!DATA.chunks){
    box.innerHTML='<div class="card tight small mut">청크 목록을 여는 중이다.</div>';
    loadData("chunks","ENG2P_CHUNKS",function(){ renderRebound(); });
    return;
  }
  var mid=rbdToday(), pool=rbdPool();
  if(!mid || !pool){
    box.innerHTML='<div class="card"><div class="note w">오늘 과의 청크가 없다. '+
      '<b>scripts/derive_chunks.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    return;
  }
  var s=roundStep("rebound"), rec=rbdRec();
  var h='<div class="card">'+playHead(p,s);

  if(RBDCLK.over){
    h+='<div class="note w" style="margin-top:10px"><b>'+RBD.min+'분이 됐다. 끝났다.</b> '+
       '이 기기가 던진 동안 제일 길게 간 것이 <b>'+
       Math.max(rec.best,rec.run)+'번</b>이다.</div>';
    h+='<div class="note">쉼이 난 것은 '+rec.stops+'번이다. '+
       '<b>누가 쉬었는지는 안 센다.</b> 쉼은 실패가 아니라 자리를 바꾸는 신호다.</div>';
    h+='<div class="note w">규칙서가 남기라는 값은 <b>한 번에 제일 많이 주고받은 수</b> '+
       '하나다. 각자 자기가 던진 동안의 것을 들고 있으니 '+
       '<b>두 기기 중 큰 것</b>이 그 판의 값이다. 더하지 않는다.</div>';
    h+=playGrade(DATA.chunks);
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="rbdAgain">처음부터</button></div></div>';
    box.innerHTML=h;
    $("#rbdAgain").onclick=function(){
      roundStepSet("rebound",0); turnForget("rebound");
      rec.best=0; rec.run=0; rec.stops=0; save();
      rbdClockStop(); RBDCLK.left=0; RBDCLK.over=false; renderRebound();
    };
    return;
  }

  var first=roundFirst(s, 1);
  if(first===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '판정이 던진 쪽에 있어야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고른다.</div></div>';
    box.innerHTML=h; return;
  }

  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?RBD.seats[0]:RBD.seats[1])+'</b></span>'+
     '<span class="small mut">쉼 '+rec.stops+'번 · '+esc(mid)+'</span></div>';

  if(first)
    h+='<div class="chnbig"><b>'+rec.run+'</b> 번 주고받았다</div>'+
       '<div class="small mut">이 기기가 던진 동안 제일 길게 간 것 '+
       Math.max(rec.best,rec.run)+'번</div>';
  else
    h+='<div class="small mut" style="margin-top:10px">지금은 <b>던진 쪽 화면이 센다.</b> '+
       '이 기기가 던진 동안의 제일 긴 것은 '+rec.best+'번이다.</div>';

  h+='<div class="note" style="margin-top:10px">앞 사람 말끝을 받아 <b>바로</b> 잇는다. '+
     '<b>쉼이 없어야 한다.</b> 무슨 말인지보다 언제 들어오는지를 잰다. '+
     '낱말이 맞물릴 것은 없다.</div>';

  if(first){
    h+='<div class="row" style="margin-top:8px">'+
       '<button class="b" id="rbdOn">주고받았다 (+1)</button>'+
       '<button class="g" id="rbdStop">쉼이 생겼다</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>판정은 던진 사람이 한다.</b> 자기 말이 끝난 뒤의 쉼은 자기가 제일 잘 듣는다. '+
       '받는 쪽은 생각하느라 그 쉼을 못 느낀다. <b>쉼이 나면 자리가 바뀐다.</b></div>';
  }else{
    h+='<div class="row" style="margin-top:8px">'+
       '<button class="g" id="rbdSaid">쉼이 났다고 한다</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>이 자리에는 판정할 것이 없다.</b> 쉼은 던진 쪽이 듣는다. '+
       '그쪽이 쉼이라고 하면 이 단추를 누른다. 안 누르면 두 기기의 자리가 갈린다.</div>';
  }

  h+='<div class="chnpool"><div class="small mut">오늘 과의 청크. '+
     '<b>이 중에 없는 말을 해도 된다.</b> 막힐 때 여기서 집는다.</div>';
  pool.slice(0,12).forEach(function(c){
    h+='<span class="chnk">'+esc(c.c)+'</span>';
  });
  h+='</div>';

  h+='<div id="rbdTurn"></div>';
  h+='<div class="row" style="margin-top:10px">'+
     '<button class="g" id="rbdGo">'+RBD.min+'분 시계 <span class="mono" id="rbdClock">'+
     rbdClockText()+'</span></button></div>'+playGrade(DATA.chunks)+'</div>';
  box.innerHTML=h;

  $("#rbdGo").onclick=function(){ rbdClockGo(RBD.min); };
  if($("#rbdOn")) $("#rbdOn").onclick=function(){
    rec.run++;
    if(rec.run>rec.best) rec.best=rec.run;
    save(); tone("next"); renderRebound();
  };
  function stopHere(mine){
    if(mine && rec.run>rec.best) rec.best=rec.run;
    if(mine) rec.stops++;
    rec.run=0; save();
    var n=s+1;
    roundStepSet("rebound", n); renderRebound();
    if(turnCheck("rebound", n, 1)) turnAlert(n, 1, RBD.seats, "rbdTurn");
  }
  if($("#rbdStop")) $("#rbdStop").onclick=function(){ stopHere(true); };
  if($("#rbdSaid")) $("#rbdSaid").onclick=function(){ stopHere(false); };
}
PLAYREND.rebound=renderRebound;
var ONE={seats:["상황을 쥔 쪽","알아내는 쪽"]};

function oneToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl || null;
}
function onePool(){
  var d=DATA.situ, pl=oneToday();
  if(!d || !d.cards || !pl || !pl.cards || !pl.quarter) return [];
  return d.cards.filter(function(c){
    return c.q < pl.quarter || (c.q === pl.quarter && c.no <= pl.cards.to);
  });
}
function oneSeen(id){
  if(!S.situ) S.situ={};
  if(!S.situ[id]) S.situ[id]=[];
  return S.situ[id];
}
function oneLeft(c){
  var d=DATA.situ, seen=oneSeen(c.id);
  return d.parts.filter(function(p){ return seen.indexOf(p.key)<0; });
}
function oneRec(){ return playRec("onesee", {asks:0, list:[], deck:null}); }

function oneDeck(){
  var pool=onePool(), rec=oneRec();
  var by={}; pool.forEach(function(c){ by[c.id]=c; });
  if(rec.deck && rec.deck.length){
    var kept=rec.deck.map(function(id){ return by[id]; }).filter(Boolean);
    if(kept.length===rec.deck.length) return kept;
  }
  var live=pool.filter(function(c){ return oneLeft(c).length>0; });
  if(!live.length) return [];
  var ord=roundOrder(live.length, roundSeed("onesee",0)), out=[];
  for(var i=0;i<ord.length;i++) out.push(live[ord[i]]);
  rec.deck=out.map(function(c){ return c.id; });
  save();
  return out;
}
function oneAsk(c){
  var d=DATA.situ, left=oneLeft(c);
  return left.slice(0, d.need);
}

function oneDone(d, rec, head){
  var got=rec.list.filter(function(x){ return x!==null; }).length;
  var h=head;
  h+='<div class="note">닿은 것은 '+got+'장이고 물은 수는 '+
     (rec.list.length
       ? esc(rec.list.map(function(x){
           return x===null ? "못 닿음" : String(x)+"번";
         }).join(", "))
       : "아직 없다")+'.</div>';
  h+='<div class="note w">규칙서가 남기라는 값은 <b>몇 번 물어서 닿았는가</b>다. '+
     '<b>적은 쪽이 잘한 것이 아니다.</b> 물은 수는 어디가 안 보였는지를 적은 것이다.</div>';
  h+='<div class="note">자리가 <b>한 장마다</b> 바뀌니 이 목록은 '+
     '<b>이 기기가 쥐었던 장</b>만이다. 나머지는 상대 기기에 있다. '+
     '소리 내어 이어 읽는다. 기기끼리는 못 잇는다.</div>';
  return h+playGrade(d)+
    '<div class="row" style="margin-top:10px">'+
    '<button class="g" id="oneAgain">처음부터</button></div></div>';
}

var ONECLK={t:null, left:0, over:false};
function oneClockStop(){ if(ONECLK.t){ clearInterval(ONECLK.t); ONECLK.t=null; } }
function oneClockText(){
  if(ONECLK.over) return "0:00";
  var s=ONECLK.left>0?ONECLK.left:ONE.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function oneClockGo(min){
  if(ONECLK.t){ oneClockStop(); return; }
  if(ONECLK.left<=0){ ONECLK.left=min*60; ONECLK.over=false; }
  tone("start");
  ONECLK.t=setInterval(function(){
    ONECLK.left--;
    var e=document.getElementById("oneClock");
    if(!e){ oneClockStop(); return; }
    if(ONECLK.left<=0){
      ONECLK.over=true; oneClockStop(); tone("blockend"); renderOnesee(); return;
    }
    e.textContent=oneClockText();
  },1000);
  var e=document.getElementById("oneClock"); if(e) e.textContent=oneClockText();
}

function renderOnesee(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("onesee");
  ONE.min=p.min;
  if(!DATA.situ){
    box.innerHTML='<div class="card tight small mut">상황 카드를 여는 중이다.</div>';
    loadData("situ","ENG2P_SITU",function(){ renderOnesee(); });
    return;
  }
  var d=DATA.situ, pool=onePool(), deck=oneDeck();

  if(!pool.length){
    box.innerHTML='<div class="card">'+playHead(p,0)+
      '<div class="note w" style="margin-top:10px"><b>아직 이 판은 안 연다.</b> '+
      '역할형 카드가 오늘까지 <b>한 장도</b> 안 나왔다. '+
      '<b>적어서가 아니라 아직 안 나와서다.</b> 강이 가면 나온다.</div>'+
      '<div class="note">그 사이에는 같은 화용 트랙의 다른 판을 돈다.</div>'+
      playGrade(d)+'</div>';
    return;
  }
  if(!deck.length){
    box.innerHTML='<div class="card">'+playHead(p,0)+
      '<div class="note w" style="margin-top:10px"><b>오늘까지 나온 '+pool.length+
      '장을 다 접었다.</b> 카드마다 다섯 요소를 다 알아냈다. '+
      '한 장을 <b>'+d.most+'번까지</b> 쓰는데 그것을 다 썼다.</div>'+
      '<div class="note">새 카드는 강이 가야 나온다. 그 사이에는 다른 판을 돈다.</div>'+
      playGrade(d)+'</div>';
    return;
  }

  var s=roundStep("onesee"), rec=oneRec();
  if(soloOn() && soloHanding()){
    box.innerHTML='<div class="card">'+soloCover([S.names.a,S.names.b])+'</div>';
    $("#soTake").onclick=function(){ soloTake(renderOnesee); };
    return;
  }

  var h='<div class="card">'+playHead(p,s);

  if(ONECLK.over){
    box.innerHTML=oneDone(d, rec, h+
      '<div class="note w" style="margin-top:10px"><b>'+ONE.min+'분이 됐다.</b> '+
      '쥔 쪽이 <b>나머지를 읽어 준다.</b> 못 맞힌 것을 듣는 것도 입력이다.</div>');
    $("#oneAgain").onclick=function(){
      roundStepSet("onesee",0); turnForget("onesee");
      rec.asks=0; rec.list=[]; rec.deck=null; save();
      oneClockStop(); ONECLK.left=0; ONECLK.over=false; renderOnesee();
    };
    return;
  }

  if(s>=deck.length){
    box.innerHTML=oneDone(d, rec, h+
      '<div class="note g" style="margin-top:10px"><b>오늘 낼 것을 다 냈다.</b> '+
      deck.length+'장을 돌았다.</div>');
    $("#oneAgain").onclick=function(){
      roundStepSet("onesee",0); turnForget("onesee");
      rec.asks=0; rec.list=[]; rec.deck=null; save();
      oneClockStop(); ONECLK.left=0; ONECLK.over=false; renderOnesee();
    };
    return;
  }

  var it=deck[s], first=roundFirst(s, 1);
  if(first===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '상황이 한쪽 화면에만 있어야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고르거나, 기기가 하나면 규칙 탭에서 '+
       '<b>돌려 보기</b>를 켠다.</div></div>';
    box.innerHTML=h; return;
  }

  var ask=oneAsk(it), left=oneLeft(it), round=d.parts.length-left.length;
  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?ONE.seats[0]:ONE.seats[1])+'</b>'+
     (soloOn()?' <span class="small mut">(돌려 보기)</span>':'')+'</span>'+
     '<span class="small mut">'+(s+1)+'장째 · '+esc(it.id)+'</span></div>';

  h+='<div class="note" style="margin-top:10px">이 장에서 알아낼 것 '+ask.length+
     '개: <b>'+ask.map(function(x){ return esc(x.name); }).join("</b>, <b>")+'</b>'+
     (round?'. 이 카드에서 <b>'+round+'개</b>는 지난 판에 알아냈다. 다시 안 낸다':'')+
     '</div>';

  if(first){
    h+='<div class="sitbox">';
    d.parts.forEach(function(x){
      var on=ask.filter(function(y){ return y.key===x.key; }).length;
      h+='<div class="sitrow'+(on?" on":"")+'"><b>'+esc(x.name)+'</b><span>'+
         esc(it.parts[x.key])+'</span></div>';
    });
    h+='</div>';
    h+='<div class="note" style="margin-top:10px"><b>쥔 쪽이 할 일</b><br>'+
       esc(it.ins)+'</div>';
    h+='<div class="note"><b>판정</b> '+esc(it.pass)+'</div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>이 표를 읽어 주지 않는다.</b> 그 상황인 것처럼 말한다. '+
       '상대가 물으면 그 말 안에서 답한다.</div>';
  }else{
    h+='<div class="vpane"><div class="vhid" aria-hidden="true"><span>'+
       '상황은 쥔 쪽 화면에만 있다</span></div></div>';
    h+='<div class="note" style="margin-top:10px"><b>알아내는 쪽이 할 일</b><br>'+
       '묻는다. 위의 <b>'+ask.length+'개</b>가 무엇인지 알아내면 된다. '+
       '나머지는 안 알아내도 된다.</div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>이름만 있고 값은 없다.</b> 값이 여기 있으면 알아낼 것이 없다.</div>';
  }

  h+='<div class="chnbig"><b>'+rec.asks+'</b> 번 물었다</div>';

  if(first){
    h+='<div class="row" style="margin-top:8px">'+
       '<button class="b" id="oneAsked">물었다 (+1)</button>'+
       '<button class="g" id="oneHit">'+ask.length+'개를 다 알아냈다</button>'+
       '<button class="g" id="oneGive">못 닿았다. 읽어 준다</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>판정은 쥔 사람이 한다.</b> 무엇이 답인지 그쪽만 안다. '+
       '<b>못 닿아도 벌이 아니다.</b> 나머지를 읽어 주는 것으로 끝낸다.</div>';
  }else{
    h+='<div class="row" style="margin-top:8px">'+
       '<button class="g" id="oneNext">다음 장</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>이 자리에는 판정할 것이 없다.</b> 닿았는지는 쥔 사람이 정한다. '+
       '그쪽이 넘겼다고 하면 이 단추를 누른다.</div>';
  }

  h+='<div id="oneTurn"></div>';
  if(soloOn())
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="oneHand">건넨다</button></div>';
  h+='<div class="row" style="margin-top:10px">'+
     '<button class="g" id="oneGo">'+ONE.min+'분 시계 <span class="mono" id="oneClock">'+
     oneClockText()+'</span></button></div>'+playGrade(d)+'</div>';
  box.innerHTML=h;

  $("#oneGo").onclick=function(){ oneClockGo(ONE.min); };
  if($("#oneHand")) $("#oneHand").onclick=function(){ soloHandOff(renderOnesee); };
  if($("#oneAsked")) $("#oneAsked").onclick=function(){
    rec.asks++; save(); tone("next"); renderOnesee();
  };
  function advance(){
    var seen=oneSeen(it.id);
    ask.forEach(function(x){ if(seen.indexOf(x.key)<0) seen.push(x.key); });
    rec.asks=0; save();
    var n=s+1;
    roundStepSet("onesee", n); renderOnesee();
    if(turnCheck("onesee", n, 1)) turnAlert(n, 1, ONE.seats, "oneTurn");
  }
  if($("#oneHit")) $("#oneHit").onclick=function(){
    rec.list.push(rec.asks); tone("done"); advance();
  };
  if($("#oneGive")) $("#oneGive").onclick=function(){
    rec.list.push(null); advance();
  };
  if($("#oneNext")) $("#oneNext").onclick=function(){ advance(); };
}
PLAYREND.onesee=renderOnesee;
var WAV={seats:["세기를 쥔 쪽","맞히는 쪽"]};

function wavToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
function wavPiece(){
  var d=DATA.relay, mid=wavToday();
  if(!d || !d.items || !mid) return null;
  var rows=d.items[mid]||[];
  if(!rows.length) return null;
  return rows[roundSeed("wave",0)%rows.length];
}
function wavLine(li){
  var t=DATA.transcripts, mid=wavToday();
  if(!t || !t.items || !mid) return null;
  var ls=t.items[mid]; if(!ls || li>=ls.length) return null;
  return String(ls[li]).replace(/^[A-Z][A-Za-z .'-]{0,20}:\s*/, "");
}
function wavAim(s){
  var d=DATA.wave;
  if(!d || !d.steps || !d.steps.length) return null;
  return d.steps[roundSeed("wave", s+1) % d.steps.length];
}
function wavStep(n){
  var d=DATA.wave;
  return d.steps.filter(function(x){ return x.n===n; })[0] || null;
}
function wavRec(){ return playRec("wave", {near:0, list:[], again:0}); }

var WAVCLK={t:null, left:0, over:false};
function wavClockStop(){ if(WAVCLK.t){ clearInterval(WAVCLK.t); WAVCLK.t=null; } }
function wavClockText(){
  if(WAVCLK.over) return "0:00";
  var s=WAVCLK.left>0?WAVCLK.left:WAV.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function wavClockGo(min){
  if(WAVCLK.t){ wavClockStop(); return; }
  if(WAVCLK.left<=0){ WAVCLK.left=min*60; WAVCLK.over=false; }
  tone("start");
  WAVCLK.t=setInterval(function(){
    WAVCLK.left--;
    var e=document.getElementById("wavClock");
    if(!e){ wavClockStop(); return; }
    if(WAVCLK.left<=0){
      WAVCLK.over=true; wavClockStop(); tone("blockend"); renderWave(); return;
    }
    e.textContent=wavClockText();
  },1000);
  var e=document.getElementById("wavClock"); if(e) e.textContent=wavClockText();
}

function wavDone(d, rec, head){
  var h=head;
  h+='<div class="note">한 칸 안에 든 것이 <b>'+rec.near+'</b>점이다. '+
     '벌어진 칸수는 '+(rec.list.length?esc(rec.list.join(", ")):"아직 없다")+'.</div>';
  h+='<div class="note w"><b>'+d.near+'칸 안이면 닿은 것</b>으로 센 수다. '+
     '<b>정확히 맞히는 판이 아니다.</b> 격식은 점이 아니라 폭이다.</div>';
  h+=playHalf(d.points+"점");
  if(rec.again)
    h+='<div class="note">'+d.far+'칸 넘게 벌어져 다시 말한 것이 '+rec.again+
       '번이다. <b>다시 말하는 것은 벌이 아니다.</b> 그 자리가 제일 안 보인 자리다.</div>';
  return h+playGrade(d)+
    '<div class="row" style="margin-top:10px">'+
    '<button class="g" id="wavAgain">처음부터</button></div></div>';
}

function renderWave(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("wave");
  WAV.min=p.min;
  if(!DATA.wave){
    box.innerHTML='<div class="card tight small mut">눈금을 여는 중이다.</div>';
    loadData("wave","ENG2P_WAVE",function(){ renderWave(); });
    return;
  }
  if(!DATA.relay){
    box.innerHTML='<div class="card tight small mut">줄을 여는 중이다.</div>';
    loadData("relay","ENG2P_RELAY",function(){ renderWave(); });
    return;
  }
  if(!DATA.transcripts){
    box.innerHTML='<div class="card tight small mut">대본을 여는 중이다.</div>';
    loadData("transcripts","ENG2P_TRANSCRIPTS",function(){ renderWave(); });
    return;
  }
  var d=DATA.wave, it=wavPiece();
  if(!it){
    box.innerHTML='<div class="card"><div class="note w">오늘 과의 줄이 없다. '+
      '<b>scripts/derive_relay.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    return;
  }
  var s=roundStep("wave"), rec=wavRec(), line=wavLine(it.li);
  var h='<div class="card">'+playHead(p,s);

  if(WAVCLK.over){
    box.innerHTML=wavDone(d, rec, h+
      '<div class="note w" style="margin-top:10px"><b>'+WAV.min+'분이 됐다. 끝났다.</b> '+
      '남은 점은 안 돈다.</div>');
    $("#wavAgain").onclick=function(){ wavReset(rec); };
    return;
  }
  if(s>=d.points){
    box.innerHTML=wavDone(d, rec, h+
      '<div class="note g" style="margin-top:10px"><b>'+d.points+'점을 다 돌았다.</b></div>');
    $("#wavAgain").onclick=function(){ wavReset(rec); };
    return;
  }

  var first=roundFirst(s, 1);
  if(first===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '세기가 한쪽 화면에만 있어야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고른다.</div></div>';
    box.innerHTML=h; return;
  }

  var aim=wavAim(s);
  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?WAV.seats[0]:WAV.seats[1])+'</b></span>'+
     '<span class="small mut">'+(s+1)+' / '+d.points+'점 · '+esc(wavToday())+'</span></div>';

  h+='<div class="small mut" style="margin-top:10px">이 줄을 그 세기로 고쳐 말한다</div>'+
     '<div class="swpline">'+esc(line||"")+'</div>';

  h+='<div class="wavbox">';
  d.steps.forEach(function(x){
    var on=(first && aim && x.n===aim.n);
    h+='<div class="wavrow'+(on?" on":"")+(x.anchor?"":" mid")+'">'+
       '<b class="mono">'+x.n+'</b><span>'+esc(x.name)+
       (x.anchor?'':' <span class="small mut">(넣은 자리)</span>')+'</span>'+
       (on?'<span class="wavnow">이 세기</span>':'')+'</div>';
  });
  h+='</div>';

  if(first){
    h+='<div class="note" style="margin-top:10px"><b>쥔 쪽이 할 일</b><br>'+
       '위 줄을 <b>'+esc(aim?aim.name:"")+'</b> 세기로 고쳐 말한다. '+
       '세기를 말로 알려 주지 않는다.</div>';
    h+='<div class="note">상대가 짚은 자리를 <b>소리 내어 듣고</b> 여기에 댄다. '+
       '몇 칸인지는 이 기기가 센다.</div>';
    h+='<div class="row" style="margin-top:8px">';
    d.steps.forEach(function(x){
      h+='<button class="g" data-wav="'+x.n+'">'+x.n+'</button>';
    });
    h+='</div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>'+d.near+'칸 안이면 닿은 것이다.</b> 정확히 맞히는 판이 아니다. '+
       '격식은 점이 아니라 폭이다.</div>';
  }else{
    h+='<div class="vpane"><div class="vhid" aria-hidden="true"><span>'+
       '이 점의 세기는 쥔 쪽 화면에만 있다</span></div></div>';
    h+='<div class="note" style="margin-top:10px"><b>맞히는 쪽이 할 일</b><br>'+
       '듣고 <b>위 눈금에서 한 자리를 짚는다.</b> 짚은 수를 소리 내어 말한다.</div>';
    h+='<div class="row" style="margin-top:8px">'+
       '<button class="g" id="wavNext">다음 점</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>이 자리에는 판정할 것이 없다.</b> 몇 칸인지는 쥔 쪽 기기가 센다. '+
       '그쪽이 넘겼다고 하면 이 단추를 누른다.</div>';
  }

  h+='<div class="small mut" style="margin-top:8px">한 칸 안에 든 것 <b>'+
     rec.near+'</b> / 돈 점 '+rec.list.length+'</div>';
  h+='<div id="wavTurn"></div>';
  h+='<div class="row" style="margin-top:10px">'+
     '<button class="g" id="wavGo">'+WAV.min+'분 시계 <span class="mono" id="wavClock">'+
     wavClockText()+'</span></button></div>'+playGrade(d)+'</div>';
  box.innerHTML=h;

  $("#wavGo").onclick=function(){ wavClockGo(WAV.min); };

  function step(){
    var n=s+1;
    roundStepSet("wave", n); renderWave();
    if(turnCheck("wave", n, 1)) turnAlert(n, 1, WAV.seats, "wavTurn");
  }
  box.querySelectorAll("[data-wav]").forEach(function(b){
    b.onclick=function(){
      var got=+b.dataset.wav, gap=Math.abs(got-(aim?aim.n:got));
      if(gap>d.far){
        rec.again++; save();
        var e=$("#wavTurn");
        if(e) e.innerHTML='<div class="note w"><b>'+gap+'칸 벌어졌다.</b> '+
          '이 점은 <b>'+esc(aim.name)+'</b> 였다. 보여 주고 <b>다시 말한다.</b> '+
          '점은 안 넘어간다.</div>';
        return;
      }
      rec.list.push(gap);
      if(gap<=d.near){ rec.near++; tone("done"); }
      else tone("next");
      save(); step();
    };
  });
  if($("#wavNext")) $("#wavNext").onclick=function(){ step(); };
}
function wavReset(rec){
  roundStepSet("wave",0); turnForget("wave");
  rec.near=0; rec.list=[]; rec.again=0; save();
  wavClockStop(); WAVCLK.left=0; WAVCLK.over=false; renderWave();
}
PLAYREND.wave=renderWave;
var WHO={seats:["자리를 고르는 쪽","고른 것을 판정하는 쪽"]};

function whoToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl || null;
}
function whoPool(){
  var d=DATA.whose, pl=whoToday();
  if(!d || !d.sets || !pl || !pl.cards || !pl.quarter) return [];
  return d.sets.filter(function(c){
    return c.q < pl.quarter || (c.q === pl.quarter && c.no <= pl.cards.to);
  });
}
function whoRec(){ return playRec("whose", {same:0, split:0, pick:null}); }

function whoDeck(){
  var d=DATA.whose, pool=whoPool();
  if(!d || !pool.length) return [];
  var ord=roundOrder(pool.length, roundSeed("whose",0)), out=[];
  for(var i=0;i<ord.length && out.length<d.rounds;i++) out.push(pool[ord[i]]);
  return out;
}
function whoSplit(w){
  if(!S.wsplit) S.wsplit={};
  if(!S.wsplit[w]) S.wsplit[w]=[];
  return S.wsplit[w];
}

var WHOCLK={t:null, left:0, over:false};
function whoClockStop(){ if(WHOCLK.t){ clearInterval(WHOCLK.t); WHOCLK.t=null; } }
function whoClockText(){
  if(WHOCLK.over) return "0:00";
  var s=WHOCLK.left>0?WHOCLK.left:WHO.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function whoClockGo(min){
  if(WHOCLK.t){ whoClockStop(); return; }
  if(WHOCLK.left<=0){ WHOCLK.left=min*60; WHOCLK.over=false; }
  tone("start");
  WHOCLK.t=setInterval(function(){
    WHOCLK.left--;
    var e=document.getElementById("whoClock");
    if(!e){ whoClockStop(); return; }
    if(WHOCLK.left<=0){
      WHOCLK.over=true; whoClockStop(); tone("blockend"); renderWhose(); return;
    }
    e.textContent=whoClockText();
  },1000);
  var e=document.getElementById("whoClock"); if(e) e.textContent=whoClockText();
}

function whoDone(d, rec, head){
  var h=head;
  h+='<div class="note">둘의 생각이 같았던 벌이 <b>'+rec.same+'</b>이고 '+
     '갈린 벌이 <b>'+rec.split+'</b>이다.</div>';
  h+='<div class="note w">두 기기에 <b>같은 수</b>가 있어야 한다. 소리 내어 견준다. '+
     '<b>이 판은 절반이 아니다.</b> 둘의 생각이 같았는가는 한 사람의 값이 아니다.</div>';
  h+='<div class="note"><b>갈린 것은 틀린 것이 아니다.</b> 물어볼 것이다. '+
     '그 자리가 <b>주 이레째 점검</b>으로 간다. 거기서 다시 본다.</div>';
  return h+playGrade(d)+
    '<div class="row" style="margin-top:10px">'+
    '<button class="g" id="whoAgain">처음부터</button></div></div>';
}

function renderWhose(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("whose");
  WHO.min=p.min;
  if(!DATA.whose){
    box.innerHTML='<div class="card tight small mut">쓸 자리를 여는 중이다.</div>';
    loadData("whose","ENG2P_WHOSE",function(){ renderWhose(); });
    return;
  }
  var d=DATA.whose, pool=whoPool();
  if(pool.length<d.rounds){
    box.innerHTML='<div class="card">'+playHead(p,0)+
      '<div class="note w" style="margin-top:10px"><b>아직 이 판은 안 연다.</b> '+
      '오늘까지 나온 쓸 자리가 <b>'+pool.length+'개</b>이고 이 판은 <b>'+d.rounds+
      '벌</b>을 돈다. 안 배운 카드를 앞당겨 쓰지 않는다.</div>'+
      '<div class="note">그 사이에는 같은 화용 트랙의 다른 판을 돈다.</div>'+
      playGrade(d)+'</div>';
    return;
  }

  var deck=whoDeck(), s=roundStep("whose"), rec=whoRec();
  var h='<div class="card">'+playHead(p,s);

  if(WHOCLK.over){
    box.innerHTML=whoDone(d, rec, h+
      '<div class="note w" style="margin-top:10px"><b>'+WHO.min+'분이 됐다. 끝났다.</b> '+
      '남은 벌은 안 돈다.</div>');
    $("#whoAgain").onclick=function(){ whoReset(rec); };
    return;
  }
  if(s>=deck.length){
    box.innerHTML=whoDone(d, rec, h+
      '<div class="note g" style="margin-top:10px"><b>'+deck.length+
      '벌을 다 돌았다.</b></div>');
    $("#whoAgain").onclick=function(){ whoReset(rec); };
    return;
  }

  var it=deck[s], first=roundFirst(s, 1);
  if(first===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '누가 먼저 고르는지를 정해야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고른다.</div></div>';
    box.innerHTML=h; return;
  }

  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?WHO.seats[0]:WHO.seats[1])+'</b></span>'+
     '<span class="small mut">'+(s+1)+' / '+deck.length+'벌 · '+esc(it.id)+'</span></div>';

  h+='<div class="whobox"><div class="whowhere">'+esc(it.where)+'</div>'+
     '<div class="small mut">상대: <b>'+esc(it.who)+'</b></div></div>';

  h+='<div class="note" style="margin-top:10px">'+
     (first ? '<b>먼저 고른다.</b> 이 자리에서 쓸 격식을 셋 중 하나 고르고 소리 내어 말한다.'
            : '<b>듣고 고른다.</b> 상대가 말한 뒤에 자기 것을 고르고 견준다.')+
     '</div>';

  h+='<div class="row" style="margin-top:8px">';
  d.regs.forEach(function(r){
    h+='<button class="g whopick'+(rec.pick===r?" on":"")+'" data-who="'+esc(r)+'">'+
       esc(r)+'</button>';
  });
  h+='</div>';
  h+='<div class="small mut" style="margin-top:6px">'+
     '<b>앱은 정답을 안 준다.</b> 이 자리에 무엇이 맞는지는 자료에 없다. '+
     '<b>격식은 답이 하나가 아니다.</b></div>';

  if(rec.pick){
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="b" id="whoSame">둘이 같았다</button>'+
       '<button class="g" id="whoSplit">갈렸다</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       (first
         ? '<b>판정은 상대가 한다.</b> 그쪽이 말한 것을 이 기기에도 적는다. '+
           '안 적으면 주 점검에 갈 자리가 한 기기에만 남는다.'
         : '<b>판정은 이 자리다.</b> 같았는지 갈렸는지를 소리 내어 말한다.')+
       '</div>';
  }else{
    h+='<div class="note" style="margin-top:10px">셋 중 하나를 고르면 '+
       '<b>같았다</b>와 <b>갈렸다</b>가 뜬다.</div>';
  }

  h+='<div class="small mut" style="margin-top:8px">같았던 벌 <b>'+rec.same+
     '</b> · 갈린 벌 <b>'+rec.split+'</b></div>';
  h+='<div id="whoTurn"></div>';
  h+='<div class="row" style="margin-top:10px">'+
     '<button class="g" id="whoGo">'+WHO.min+'분 시계 <span class="mono" id="whoClock">'+
     whoClockText()+'</span></button></div>'+playGrade(d)+'</div>';
  box.innerHTML=h;

  $("#whoGo").onclick=function(){ whoClockGo(WHO.min); };
  box.querySelectorAll("[data-who]").forEach(function(b){
    b.onclick=function(){ rec.pick=b.dataset.who; save(); renderWhose(); };
  });

  function step(){
    rec.pick=null; save();
    var n=s+1;
    roundStepSet("whose", n); renderWhose();
    if(turnCheck("whose", n, 1)) turnAlert(n, 1, WHO.seats, "whoTurn");
  }
  if($("#whoSame")) $("#whoSame").onclick=function(){
    rec.same++; tone("done"); step();
  };
  if($("#whoSplit")) $("#whoSplit").onclick=function(){
    rec.split++;
    var pl=whoToday(), w=(pl&&pl.week)||1, list=whoSplit(w);
    if(!list.filter(function(x){ return x.id===it.id; }).length)
      list.push({id:it.id, where:it.where, who:it.who, day:today()});
    tone("next"); step();
  };
}
function whoReset(rec){
  roundStepSet("whose",0); turnForget("whose");
  rec.same=0; rec.split=0; rec.pick=null; save();
  whoClockStop(); WHOCLK.left=0; WHOCLK.over=false; renderWhose();
}
PLAYREND.whose=renderWhose;
var RSK={seats:["뭉개는 쪽","되묻는 쪽"], n:5};

function rskToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
function rskLines(){
  var t=DATA.transcripts, mid=rskToday();
  if(!t || !t.items || !mid) return null;
  var ls=(t.items[mid]||[]).map(function(x){
    return String(x).replace(/^[A-Z][A-Za-z .'-]{0,20}:\s*/, "");
  }).filter(function(x){ return x.split(/\s+/).length>=4; });
  if(!ls.length) return null;
  var ord=roundOrder(ls.length, roundSeed("reask",0)), out=[];
  for(var i=0;i<ord.length && out.length<RSK.n;i++) out.push(ls[ord[i]]);
  return out;
}
function rskStep(s){
  var d=DATA.reask;
  if(!d || !d.steps || !d.steps.length) return null;
  return d.steps[roundSeed("reask", s+1) % d.steps.length];
}
function rskRec(){ return playRec("reask", {alone:0, shown:0, open:false}); }

var RSKCLK={t:null, left:0, over:false};
function rskClockStop(){ if(RSKCLK.t){ clearInterval(RSKCLK.t); RSKCLK.t=null; } }
function rskClockText(){
  if(RSKCLK.over) return "0:00";
  var s=RSKCLK.left>0?RSKCLK.left:RSK.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function rskClockGo(min){
  if(RSKCLK.t){ rskClockStop(); return; }
  if(RSKCLK.left<=0){ RSKCLK.left=min*60; RSKCLK.over=false; }
  tone("start");
  RSKCLK.t=setInterval(function(){
    RSKCLK.left--;
    var e=document.getElementById("rskClock");
    if(!e){ rskClockStop(); return; }
    if(RSKCLK.left<=0){
      RSKCLK.over=true; rskClockStop(); tone("blockend"); renderReask(); return;
    }
    e.textContent=rskClockText();
  },1000);
  var e=document.getElementById("rskClock"); if(e) e.textContent=rskClockText();
}

function rskDone(d, rec, head, n){
  var h=head;
  h+='<div class="note">보기 없이 되물은 것이 <b>'+rec.alone+'</b>줄이고 '+
     '보기를 보고 말한 것이 <b>'+rec.shown+'</b>줄이다.</div>';
  h+='<div class="note w">규칙서가 남기라는 값은 <b>보기 없이 되물은 줄</b>이다. '+
     '<b>보기를 본 것은 실패가 아니다.</b> 셈에서 빠질 뿐이다.</div>';
  h+=playHalf(n+"줄");
  return h+playGrade(d)+
    '<div class="row" style="margin-top:10px">'+
    '<button class="g" id="rskAgain">처음부터</button></div></div>';
}

function renderReask(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("reask");
  RSK.min=p.min;
  if(!DATA.reask){
    box.innerHTML='<div class="card tight small mut">되묻기 단을 여는 중이다.</div>';
    loadData("reask","ENG2P_REASK",function(){ renderReask(); });
    return;
  }
  if(!DATA.transcripts){
    box.innerHTML='<div class="card tight small mut">대본을 여는 중이다.</div>';
    loadData("transcripts","ENG2P_TRANSCRIPTS",function(){ renderReask(); });
    return;
  }
  var d=DATA.reask, lines=rskLines();
  if(!lines){
    box.innerHTML='<div class="card"><div class="note w">오늘 과의 대본이 없다. '+
      '<b>scripts/derive_transcripts.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    return;
  }
  var s=roundStep("reask"), rec=rskRec();
  var h='<div class="card">'+playHead(p,s);

  if(RSKCLK.over){
    box.innerHTML=rskDone(d, rec, h+
      '<div class="note w" style="margin-top:10px"><b>'+RSK.min+'분이 됐다. 끝났다.</b> '+
      '남은 줄은 안 돈다.</div>', lines.length);
    $("#rskAgain").onclick=function(){ rskReset(rec); };
    return;
  }
  if(s>=lines.length){
    box.innerHTML=rskDone(d, rec, h+
      '<div class="note g" style="margin-top:10px"><b>'+lines.length+
      '줄을 다 돌았다.</b></div>', lines.length);
    $("#rskAgain").onclick=function(){ rskReset(rec); };
    return;
  }

  var first=roundFirst(s, 1);
  if(first===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '줄과 강도가 서로 다른 화면에 있어야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고른다.</div></div>';
    box.innerHTML=h; return;
  }

  var line=lines[s], st=rskStep(s);
  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?RSK.seats[0]:RSK.seats[1])+'</b></span>'+
     '<span class="small mut">'+(s+1)+' / '+lines.length+'줄 · '+
     esc(rskToday())+'</span></div>';

  if(first){
    h+='<div class="small mut" style="margin-top:10px">이 줄을 읽되 '+
       '<b>한 군데를 일부러 뭉갠다.</b> 어디를 뭉갤지는 스스로 고른다</div>'+
       '<div class="swpline">'+esc(line)+'</div>';
    h+='<div class="vpane"><div class="vhid" aria-hidden="true"><span>'+
       '어느 세기로 되물으라고 했는지는 저쪽 화면에만 있다</span></div></div>';
    h+='<div class="note" style="margin-top:10px"><b>판정은 이 자리다.</b> '+
       '어디를 뭉갰는지 자기가 안다. 상대가 그 자리를 되물었는지를 본다.</div>';
    h+='<div class="row" style="margin-top:8px">'+
       '<button class="b" id="rskAlone">보기 없이 되물었다</button>'+
       '<button class="g" id="rskShown">보기를 보고 말했다</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>보기를 본 것은 실패가 아니다.</b> 셈에서 빠질 뿐이다. '+
       '상대가 열었는지를 물어보고 누른다.</div>';
  }else{
    h+='<div class="vpane"><div class="vhid" aria-hidden="true"><span>'+
       '무슨 줄인지는 저쪽 화면에만 있다</span></div></div>';
    h+='<div class="note" style="margin-top:10px">이 줄은 <b>'+esc(st.name)+
       '</b>으로 되묻는다. 듣고 그 세기로 한 번 되묻는다.</div>';
    if(rec.open){
      if(st.lines.length){
        h+='<div class="rskbox"><div class="small mut">대본에 있는 보기다. '+
           '<b>지어낸 것이 아니다.</b></div>';
        st.lines.forEach(function(x){
          h+='<div class="rskline">'+esc(x.line)+
             '<span class="small mut"> · '+esc(x.mid)+'</span></div>';
        });
        h+='</div>';
      }else{
        h+='<div class="note w"><b>이 세기는 대본에 보기가 없다.</b> '+
           '52과 어디에도 전체를 다시 말해 달라는 되묻기가 없다. '+
           '지어내지 않고 없다고 적는다. <b>둘이 만들어 본다.</b> '+
           '실제 말에서 제일 센 것은 드물다는 것이 여기서 보인다.</div>';
      }
    }else{
      h+='<div class="row" style="margin-top:8px">'+
         '<button class="g" id="rskOpen">되묻는 말이 안 나온다. 보기를 본다</button></div>';
      h+='<div class="small mut" style="margin-top:6px">'+
         '<b>먼저 해 본다.</b> 안 나오면 그때 연다. 여는 것이 벌이 아니다.</div>';
    }
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="rskNext">다음 줄</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>이 자리에는 판정할 것이 없다.</b> 어디를 뭉갰는지는 저쪽만 안다.</div>';
  }

  h+='<div class="small mut" style="margin-top:8px">보기 없이 <b>'+rec.alone+
     '</b> · 보기 보고 <b>'+rec.shown+'</b></div>';
  h+='<div id="rskTurn"></div>';
  h+='<div class="row" style="margin-top:10px">'+
     '<button class="g" id="rskGo">'+RSK.min+'분 시계 <span class="mono" id="rskClock">'+
     rskClockText()+'</span></button></div>'+playGrade(d)+'</div>';
  box.innerHTML=h;

  $("#rskGo").onclick=function(){ rskClockGo(RSK.min); };
  if($("#rskOpen")) $("#rskOpen").onclick=function(){
    rec.open=true; save(); renderReask();
  };
  function step(){
    rec.open=false; save();
    var n=s+1;
    roundStepSet("reask", n); renderReask();
    if(turnCheck("reask", n, 1)) turnAlert(n, 1, RSK.seats, "rskTurn");
  }
  if($("#rskAlone")) $("#rskAlone").onclick=function(){
    rec.alone++; tone("done"); step();
  };
  if($("#rskShown")) $("#rskShown").onclick=function(){
    rec.shown++; tone("next"); step();
  };
  if($("#rskNext")) $("#rskNext").onclick=function(){ step(); };
}
function rskReset(rec){
  roundStepSet("reask",0); turnForget("reask");
  rec.alone=0; rec.shown=0; rec.open=false; save();
  rskClockStop(); RSKCLK.left=0; RSKCLK.over=false; renderReask();
}
PLAYREND.reask=renderReask;
var CUT={seats:["읽는 쪽","듣는 쪽"], sig:false, miss:0};

function cutToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
function cutLines(){
  var t=DATA.transcripts, mid=cutToday();
  if(!t || !t.items || !mid) return null;
  var ls=(t.items[mid]||[]).map(function(x){
    return String(x).replace(/^[A-Z][A-Za-z .'-]{0,20}:\s*/, "");
  }).filter(function(x){ return x.split(/\s+/).length>=4; });
  return ls.length ? ls : null;
}
function cutDeck(){
  var d=DATA.cutin;
  if(!d || !d.decks || !d.decks.length) return null;
  return d.decks[roundSeed("cutin",0)%d.decks.length];
}
function cutHolder(){ return roundFirst(0, 1); }
function cutRec(){ return playRec("cutin", {flip:0, pass:0}); }

var CUTCLK={t:null, left:0, over:false, at:0};
function cutClockStop(){ if(CUTCLK.t){ clearInterval(CUTCLK.t); CUTCLK.t=null; } }
function cutClockText(sec){
  if(CUTCLK.over) return "0:00";
  var s=CUTCLK.left>0?CUTCLK.left:sec;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function cutClockGo(sec, deck, after){
  if(CUTCLK.t){ cutClockStop(); return; }
  if(CUTCLK.left<=0){ CUTCLK.left=sec; CUTCLK.over=false; CUTCLK.at=0; }
  tone("start");
  CUTCLK.t=setInterval(function(){
    CUTCLK.left--;
    var gone=sec-CUTCLK.left;
    var e=document.getElementById("cutClock");
    if(!e){ cutClockStop(); return; }
    if(CUTCLK.left<=0){
      CUTCLK.over=true; cutClockStop(); tone("blockend"); after(); return;
    }
    e.textContent=cutClockText(sec);
    while(CUTCLK.at<deck.length && deck[CUTCLK.at]<=gone){
      CUTCLK.at++;
      cutClockStop();
      CUT.sig=true;
      tone("swap");
      after();
      return;
    }
  },1000);
  var e=document.getElementById("cutClock"); if(e) e.textContent=cutClockText(sec);
}

function cutDone(d, rec, head){
  var h=head;
  h+='<div class="note">끼어들어 뒤집힌 것이 <b>'+rec.flip+'</b>번이고 '+
     '두 번 다 못 해 그냥 바꾼 것이 <b>'+rec.pass+'</b>번이다.</div>';
  h+='<div class="note w">규칙서가 남기라는 값은 <b>뒤집힌 횟수</b> 하나다. '+
     '<b>시계를 든 기기가 센다.</b> 다른 기기는 그 수를 받아 적는다. '+
     '더하지 않는다.</div>';
  h+='<div class="note"><b>못 끼어든 것은 벌이 아니다.</b> 셈에 안 들 뿐이다. '+
     '끼어드는 것은 편치 않다. 그래서 이 판이 스무 판 중 제일 짧다.</div>';
  return h+playGrade(d)+
    '<div class="row" style="margin-top:10px">'+
    '<button class="g" id="cutAgain">처음부터</button></div></div>';
}

function renderCutin(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("cutin");
  if(!DATA.cutin){
    box.innerHTML='<div class="card tight small mut">신호 표를 여는 중이다.</div>';
    loadData("cutin","ENG2P_CUTIN",function(){ renderCutin(); });
    return;
  }
  if(!DATA.transcripts){
    box.innerHTML='<div class="card tight small mut">대본을 여는 중이다.</div>';
    loadData("transcripts","ENG2P_TRANSCRIPTS",function(){ renderCutin(); });
    return;
  }
  var d=DATA.cutin, lines=cutLines(), deck=cutDeck();
  if(!lines || !deck){
    box.innerHTML='<div class="card"><div class="note w">오늘 과의 대본이나 '+
      '신호 표가 없다. <b>scripts/derive_cutin.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    return;
  }
  var s=roundStep("cutin"), rec=cutRec();
  var h='<div class="card">'+playHead(p,s);

  if(CUTCLK.over){
    box.innerHTML=cutDone(d, rec, h+
      '<div class="note w" style="margin-top:10px"><b>'+d.min+'분이 됐다. 끝났다.</b></div>');
    $("#cutAgain").onclick=function(){ cutReset(rec); };
    return;
  }

  var hold=cutHolder();
  if(hold===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '시계를 한 기기만 들어야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고른다.</div></div>';
    box.innerHTML=h; return;
  }
  var first=roundFirst(s, 1);
  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>지금 <b>'+esc(first?CUT.seats[0]:CUT.seats[1])+'</b></span>'+
     '<span class="small mut">뒤집힘 '+s+'번 · '+esc(cutToday())+'</span></div>';

  h+='<div class="note" style="margin-top:10px">'+
     '읽는 쪽이 아래 대본을 소리 내어 읽는다. <b>신호가 나면 듣던 쪽이 끼어든다.</b> '+
     '그러면 역할이 뒤집힌다. <b>언제 날지는 아무도 모른다.</b></div>';

  h+='<div class="cutbox">';
  lines.slice(0,6).forEach(function(x){
    h+='<div class="cutline">'+esc(x)+'</div>';
  });
  h+='</div>';

  if(hold){
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="b" id="cutGo">'+d.min+'분 시계 <span class="mono" id="cutClock">'+
       cutClockText(d.sec)+'</span></button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>시계는 이 기기만 든다.</b> 둘이 마주 앉아 있으니 소리는 같이 듣는다. '+
       '두 기기가 각자 재면 몇 초씩 어긋나 다른 순간에 울린다.</div>';
    if(CUT.sig){
      h+='<div class="note w"><b>신호가 났다.</b> 듣던 쪽이 끼어들 자리다.'+
         (CUT.miss?' <b>두 번째 신호다.</b>':'')+'</div>';
      h+='<div class="row" style="margin-top:8px">'+
         '<button class="b" id="cutIn">끼어들었다</button>'+
         '<button class="g" id="cutNo">못 끼어들었다</button></div>';
      h+='<div class="small mut" style="margin-top:6px">'+
         '<b>판정은 읽던 사람이 한다.</b> 끊긴 자리가 자연스러웠는지 자기가 안다. '+
         '<b>못 한 것은 벌이 아니다.</b> 셈에 안 들 뿐이다.</div>';
    }
  }else{
    h+='<div class="note" style="margin-top:10px"><b>시계는 저쪽 기기가 든다.</b> '+
       '신호도 저쪽에서 난다. 소리를 같이 듣는다. '+
       '이 기기는 대본만 보인다.</div>';
    h+='<div class="row" style="margin-top:8px">'+
       '<button class="g" id="cutFlip">뒤집혔다</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>이 자리에는 판정할 것이 없다.</b> 뒤집힐 때마다 눌러 회를 맞춘다. '+
       '안 누르면 이 화면이 누가 읽는지를 틀리게 말한다.</div>';
  }

  h+='<div class="small mut" style="margin-top:8px">끼어들어 뒤집힌 것 <b>'+
     rec.flip+'</b> · 그냥 바꾼 것 <b>'+rec.pass+'</b></div>';
  h+='<div id="cutTurn"></div>'+playGrade(d)+'</div>';
  box.innerHTML=h;

  if($("#cutGo")) $("#cutGo").onclick=function(){
    CUT.miss=0; CUT.sig=false;
    cutClockGo(d.sec, deck, function(){ renderCutin(); });
  };
  function flip(counted){
    if(counted) rec.flip++; else rec.pass++;
    save();
    CUT.miss=0; CUT.sig=false;
    var n=s+1;
    roundStepSet("cutin", n); renderCutin();
    if(turnCheck("cutin", n, 1)) turnAlert(n, 1, CUT.seats, "cutTurn");
  }
  if($("#cutIn")) $("#cutIn").onclick=function(){ tone("done"); flip(true); };
  if($("#cutNo")) $("#cutNo").onclick=function(){
    if(!CUT.miss){
      CUT.miss=1;
      tone("swap");
      renderCutin();
      return;
    }
    flip(false);
  };
  if($("#cutFlip")) $("#cutFlip").onclick=function(){
    var n=s+1;
    roundStepSet("cutin", n); renderCutin();
    if(turnCheck("cutin", n, 1)) turnAlert(n, 1, CUT.seats, "cutTurn");
  };
}
function cutReset(rec){
  roundStepSet("cutin",0); turnForget("cutin");
  rec.flip=0; rec.pass=0; save();
  CUT.miss=0; CUT.sig=false; cutClockStop();
  CUTCLK.left=0; CUTCLK.over=false; CUTCLK.at=0;
  renderCutin();
}
PLAYREND.cutin=renderCutin;
var CLS={n:0};

function clsToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
function clsRows(){
  var d=DATA.clash, mid=clsToday();
  if(!d || !d.items || !mid) return null;
  var rows=d.items[mid]||[];
  return rows.length ? rows : null;
}
function clsMine(){
  var who=(typeof devicePerson==="function")?devicePerson():null;
  return who==="a" ? "a" : who==="b" ? "b" : null;
}
function clsCaller(){ return clsMine()==="a"; }
function clsRec(){ return playRec("clash", {join:0, stop:0}); }

var CLSCLK={t:null, left:0, over:false};
function clsClockStop(){ if(CLSCLK.t){ clearInterval(CLSCLK.t); CLSCLK.t=null; } }
function clsClockText(){
  if(CLSCLK.over) return "0:00";
  var s=CLSCLK.left>0?CLSCLK.left:CLS.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function clsClockGo(min){
  if(CLSCLK.t){ clsClockStop(); return; }
  if(CLSCLK.left<=0){ CLSCLK.left=min*60; CLSCLK.over=false; }
  tone("start");
  CLSCLK.t=setInterval(function(){
    CLSCLK.left--;
    var e=document.getElementById("clsClock");
    if(!e){ clsClockStop(); return; }
    if(CLSCLK.left<=0){
      CLSCLK.over=true; clsClockStop(); tone("blockend"); renderClash(); return;
    }
    e.textContent=clsClockText();
  },1000);
  var e=document.getElementById("clsClock"); if(e) e.textContent=clsClockText();
}

var CLSGO={t:null, n:0};
function clsCue(after){
  if(CLSGO.t) return;
  CLSGO.n=3;
  var tick=function(){
    var e=document.getElementById("clsCue");
    if(CLSGO.n>0){
      if(e) e.textContent=String(CLSGO.n);
      tone("next");
      CLSGO.n--;
      return;
    }
    clearInterval(CLSGO.t); CLSGO.t=null;
    if(e) e.textContent="지금";
    tone("swap");
    if(after) after();
  };
  tick();
  CLSGO.t=setInterval(tick, 1000);
}
function clsCueStop(){ if(CLSGO.t){ clearInterval(CLSGO.t); CLSGO.t=null; } CLSGO.n=0; }

function clsDone(d, rec, head, n){
  var h=head;
  h+='<div class="note">말이 이어진 것이 <b>'+rec.join+'</b>회이고 '+
     '둘 다 멈춘 것이 <b>'+rec.stop+'</b>회다.</div>';
  h+='<div class="note w">두 기기에 <b>같은 수</b>가 있어야 한다. 소리 내어 견준다. '+
     '<b>이 판은 절반이 아니다.</b> 둘이 같이 판정한다.</div>';
  h+='<div class="note"><b>멈춘 것도 한 가지 답이다.</b> 셈에 안 들 뿐이고 틀린 것이 아니다. '+
     '<b>양보하는 쪽이 지는 것이 아니다.</b> 그래서 누가 양보했는지를 안 센다.</div>';
  return h+playGrade(d)+
    '<div class="row" style="margin-top:10px">'+
    '<button class="g" id="clsAgain">처음부터</button></div></div>';
}

function renderClash(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("clash");
  CLS.min=p.min;
  if(!DATA.clash){
    box.innerHTML='<div class="card tight small mut">겹칠 줄을 여는 중이다.</div>';
    loadData("clash","ENG2P_CLASH",function(){ renderClash(); });
    return;
  }
  var d=DATA.clash, rows=clsRows();
  if(!rows){
    box.innerHTML='<div class="card"><div class="note w">오늘 과의 겹칠 줄이 없다. '+
      '<b>scripts/derive_clash.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    return;
  }
  var s=roundStep("clash"), rec=clsRec();
  var h='<div class="card">'+playHead(p,s);

  if(CLSCLK.over){
    box.innerHTML=clsDone(d, rec, h+
      '<div class="note w" style="margin-top:10px"><b>'+CLS.min+'분이 됐다. 끝났다.</b> '+
      '남은 회는 안 돈다.</div>', rows.length);
    $("#clsAgain").onclick=function(){ clsReset(rec); };
    return;
  }
  if(s>=rows.length){
    box.innerHTML=clsDone(d, rec, h+
      '<div class="note g" style="margin-top:10px"><b>'+rows.length+
      '회를 다 돌았다.</b>'+
      (rows.length<d.rounds ? ' 이 과는 겹칠 줄이 '+rows.length+
       '회뿐이다. <b>있는 만큼 돈다.</b>' : '')+'</div>', rows.length);
    $("#clsAgain").onclick=function(){ clsReset(rec); };
    return;
  }

  var mine=clsMine();
  if(mine===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '각자 다른 줄을 들어야 하는데 이 기기를 누가 쓰는지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고른다.</div></div>';
    box.innerHTML=h; return;
  }

  var it=rows[s], line=it[mine];
  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 몫 <b>'+esc(line.who)+'</b> 줄'+
     (clsCaller()?' <span class="small mut">(신호도 낸다)</span>':'')+'</span>'+
     '<span class="small mut">'+(s+1)+' / '+rows.length+'회 · '+
     esc(clsToday())+'</span></div>';

  h+='<div class="note" style="margin-top:10px"><b>역할이 없다.</b> '+
     '둘 다 같은 일을 한다. 다만 <b>드는 줄이 다르다.</b> '+
     '신호에 맞춰 <b>일부러 동시에</b> 말한다.</div>';

  h+='<div class="clsline">'+esc(line.line)+'</div>';
  h+='<div class="vpane"><div class="vhid" aria-hidden="true"><span>'+
     '상대 줄은 저쪽 화면에만 있다</span></div></div>';

  if(clsCaller()){
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="b" id="clsCueGo">셋을 세고 신호</button>'+
       '<span class="clscue" id="clsCue">셋</span></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>신호는 이 기기만 낸다.</b> 두 기기가 각자 세면 어긋난다. '+
       '소리를 같이 듣는다.</div>';
  }else{
    h+='<div class="note" style="margin-top:10px"><b>신호는 저쪽 기기가 낸다.</b> '+
       '소리를 같이 듣는다. 셋을 세고 나면 같이 말한다.</div>';
  }

  h+='<div class="row" style="margin-top:10px">'+
     '<button class="b" id="clsJoin">말이 이어졌다</button>'+
     '<button class="g" id="clsStop">둘 다 멈췄다</button></div>';
  h+='<div class="small mut" style="margin-top:6px">'+
     '<b>판정은 둘이 같이 한다.</b> 이었으면 이은 것이다. '+
     '<b>양보하는 쪽이 지는 것이 아니다.</b> 누가 양보했는지는 안 센다. '+
     '<b>멈춘 것도 한 가지 답이다.</b></div>';

  h+='<div class="small mut" style="margin-top:8px">이어진 것 <b>'+rec.join+
     '</b> · 둘 다 멈춘 것 <b>'+rec.stop+'</b></div>';
  h+='<div id="clsTurn"></div>';
  h+='<div class="row" style="margin-top:10px">'+
     '<button class="g" id="clsGo">'+CLS.min+'분 시계 <span class="mono" id="clsClock">'+
     clsClockText()+'</span></button></div>'+playGrade(d)+'</div>';
  box.innerHTML=h;

  $("#clsGo").onclick=function(){ clsClockGo(CLS.min); };
  if($("#clsCueGo")) $("#clsCueGo").onclick=function(){ clsCue(null); };
  function step(){
    clsCueStop(); save();
    roundStepSet("clash", s+1); renderClash();
  }
  $("#clsJoin").onclick=function(){ rec.join++; tone("done"); step(); };
  $("#clsStop").onclick=function(){ rec.stop++; step(); };
}
function clsReset(rec){
  roundStepSet("clash",0); turnForget("clash");
  rec.join=0; rec.stop=0; save();
  clsCueStop(); clsClockStop(); CLSCLK.left=0; CLSCLK.over=false; renderClash();
}
PLAYREND.clash=renderClash;
