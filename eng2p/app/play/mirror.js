/* =========================================================================
   거울 (T259). `docs/play_rules.md` 3.1

     쓰는 것    최소대립쌍. `out/data/pairs.js` (T258 에 대본에서 뽑았다). **B등급**
     시작 조건  쌍 여덟이 화면에 있다. **그리고 기기 쪽이 갈려 있다**
     역할       읽는 쪽과 짚는 쪽. 넉 줄마다 바뀐다
     도는 차례  읽는 쪽 화면에만 어느 쪽인지 뜬다. 짚는 쪽이 둘 중 하나를 누른다
     판정       **읽은 사람.** 자기가 무엇을 읽었는지 안다
     끝         여덟 쌍을 다 돌면. 4분이 되면 그 자리에서
     못 했을 때 못 짚으면 한 번 더 읽는다. 두 번째도 못 짚으면 넘어간다
     기록할 값  여덟 중 몇을 짚었는가. 한 숫자다

   T258 이 자료를 만들며 이 판의 꼴을 하나 바꿨다.
   **한 대립에서 여덟이 안 나온다.** 제일 많은 것이 여섯이고 l/r 은 하나뿐이다.
   그래서 여덟을 대립을 섞어 만든다. 섞는 것이 오히려 낫다. 한 대립만 여덟 번 하면
   셋째 줄부터는 듣지 않고 짚는다. 무엇을 듣는지 아니까.

   `docs/play_app.md` 7장이 이 판의 규격이다.
   ========================================================================= */
var MIR={every:4, n:8, seats:["읽는 쪽","짚는 쪽"]};

/* 쌍 전부를 한 자루에 담는다. **대립을 섞는다.** 위의 이유다.
   차례는 파일 차례다. 두 기기가 같은 파일을 읽으므로 자루가 같다. */
function mirPool(){
  var d=DATA.pairs; if(!d || !d.groups) return null;
  var out=[];
  d.groups.forEach(function(g){
    (g.pairs||[]).forEach(function(p){ out.push({a:p.a, b:p.b, g:g.name}); });
  });
  return out;
}
/* 오늘 돌 여덟. `roundOrder` 가 씨앗대로 섞으므로 **두 기기에서 같다.** */
function mirItems(n){
  var pool=mirPool(); if(!pool || pool.length<2) return null;
  var ord=roundOrder(pool.length, roundSeed("mirror",0)), out=[];
  for(var i=0;i<Math.min(n,pool.length);i++) out.push(pool[ord[i]]);
  return out;
}
/* 이 줄에서 읽을 쪽. 0이면 앞엣것 1이면 뒤엣것이다.
   **씨앗에서 나온다.** 두 기기가 같은 답을 셈할 수는 있는데
   **짚는 쪽에서는 이 함수를 안 부른다.** 부르면 값이 생기고
   값이 생기면 언젠가 어딘가에 그려진다 (`docs/play_app.md` 3장). */
function mirTarget(i){ return roundSeed("mirror", 100+(i|0))%2; }
function mirRec(){ return playRec("mirror", {hit:0, judged:0, ln:-1, miss:0, pick:null}); }

/* 4분 시계. **기기마다 따로 간다.** 두 기기가 각자 눌러 몇 초씩 어긋난다.
   그것을 맞추려 들지 않는다. 맞추려면 망이 있어야 하고 망이 없다.
   규칙서의 4분은 사람이 끝내는 선이고 시계는 그 선을 알려 주는 것뿐이다. */
var MIRCLK={t:null, left:0, over:false};
function mirClockStop(){ if(MIRCLK.t){ clearInterval(MIRCLK.t); MIRCLK.t=null; } }
/* **다 쓴 것과 안 켠 것을 갈라 적는다.** 둘 다 남은 초가 0이다.
   안 가르면 4분을 다 쓰고 나서도 시계가 4:00 이라고 적는다. */
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
    /* **매초 도는 자리에 숫자 말고 아무것도 안 둔다.** 여기에 무엇을 두면
       그것이 매초 일어난다 (T211). 다시 그리는 것은 끝날 때 한 번이다. */
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
  /* 자료를 게으르게 읽는다. 이 판을 안 열면 안 읽는다 (friction.md 8장). */
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
  /* 건네는 중이면 덮개만 그린다. **밑에 아무것도 안 그린다.** */
  if(soloOn() && soloHanding()){
    box.innerHTML='<div class="card">'+soloCover([S.names.a,S.names.b])+'</div>';
    $("#soTake").onclick=function(){ soloTake(renderMirror); };
    return;
  }
  var h='<div class="card">'+playHead(p,s);
  /* 규칙서의 끝 조건이 둘이다. 여덟을 다 돌거나 **4분이 되거나**다.
     4분 쪽은 남은 줄이 있어도 끝난다. 그것을 화면이 말해야 한다.
     안 말하면 소리만 한 번 나고 두 사람은 하던 줄을 계속 돈다. */
  if(MIRCLK.over)
    h+='<div class="note w" style="margin-top:10px"><b>4분이 됐다.</b> '+
       '규칙서가 여기서 끝내라고 적었다. 남은 줄은 안 돈다. '+
       '못 돈 줄은 못 한 것이 아니라 <b>시간이 그만큼인 것</b>이다.</div>';

  /* 다 돌았다. */
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

  /* **기기 쪽을 안 골랐으면 이 판을 안 돌린다.**
     다른 자리는 안 골랐을 때 둘 다 보였다 (round.md 8.1). 여기서는 그러면 안 된다.
     짚는 쪽이 답을 보면 이 판은 아무것도 안 재는 판이 된다. 정보 격차가 뼈대다.
     둘 다 보이는 화면을 주는 것보다 **안 주고 왜 안 주는지 적는 것**이 낫다.
     앞엣것은 두 사람이 그 판을 다 돌고 "원래 이런 건가" 하고 넘어간다. */
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

/* 읽는 쪽. **이 화면에만 어느 쪽인지 뜬다.** */
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
/* 짚는 쪽. **답이 이 화면의 어디에도 없다.** 그리지 않는다.
   가리는 것으로는 모자란다. 가린 것은 화면에 남은 글자를 세면 나온다 (T244).
   여기서는 아예 안 만든다 (`docs/play_app.md` 3장). */
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
    /* 고른 것을 말 안 하면 읽는 쪽이 판정을 못 한다. **화면이 시킨다.**
       시키지 않으면 사람도 안 한다 (round.md 5장). */
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
  /* 한 줄 넘긴다. **자리가 바뀌면 그 자리에서 알린다.** 세면서 돌게 두지 않는다. */
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
      /* 못 짚었을 때. **첫 번째는 다시 읽고 두 번째는 넘어간다.**
         넘어간 줄도 판정한 줄로 센다. 건너간 줄로는 안 센다. */
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
