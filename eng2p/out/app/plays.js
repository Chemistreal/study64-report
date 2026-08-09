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
