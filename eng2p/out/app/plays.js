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
