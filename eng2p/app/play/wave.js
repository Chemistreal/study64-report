/* =========================================================================
   파장 (T292). `docs/play_rules.md` 7.2

     쓰는 것    격식 눈금 다섯 칸. `out/data/wave.js` (T291). **B등급**
     시작 조건  눈금 위 한 점이 **A 화면에만** 떴다
     역할       세기를 쥔 쪽과 맞히는 쪽. **한 점마다 바뀐다**
     도는 차례  A가 그 세기로 한 줄을 말한다. B가 눈금 위 자리를 짚는다
     판정       **세기를 쥔 사람.** 한 칸 안이면 닿은 것으로 본다
     끝         여섯 점을 돌면 끝난다
     못 했을 때 두 칸 넘게 벌어지면 A가 어디였는지 보여 주고 다시 말한다
     기록할 값  여섯 중 한 칸 안에 든 것이 몇인가

   ## 말할 거리는 오늘 과의 줄이다

   규칙서의 쓰는 것 칸은 눈금만 적었다. 그런데 "한 줄을 말한다" 라고 하면
   무엇을 말할지가 있어야 한다. 없으면 두 사람이 매번 그것부터 정한다.

   오늘 과의 줄을 쓴다. `relay.js` 가 이미 낱말 6~14 짜리 줄을 들고 있다 (T267).
   **자료를 두 번 안 만든다.** 그 줄을 다섯 세기로 고쳐 말하는 것이 이 판이다.

   줄은 **둘 다 본다.** 감추는 것은 줄이 아니라 세기다.

   ## 사람이 자리를 대고 앱이 칸수를 센다

   판정하는 사람은 세기를 쥔 쪽이다. 그런데 "몇 칸 벌어졌나" 는 셈이다.
   B가 짚은 자리를 소리 내어 말하고 **A가 그것을 자기 기기에 댄다.**
   그러면 앱이 칸수를 센다.

   사람이 하는 것은 **무엇을 짚었는가**이고 앱이 하는 것은 **몇 칸인가**다.
   겹치면 지운다에서 앱이 글자만 견주는 것과 같은 자리다 (T276).

   ## 한 칸 안이면 닿은 것이다

   규칙서가 그렇게 정했다. 정확히 맞히는 판이 아니다.
   **격식은 점이 아니라 폭이다.** 폭을 인정 안 하면 통과가 안 되고
   통과가 안 되면 판이 죽는다. 화면이 그 말을 적는다.
   ========================================================================= */
var WAV={seats:["세기를 쥔 쪽","맞히는 쪽"]};

function wavToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
/* 오늘 줄. **전달 놀이가 쓰는 것을 그대로 쓴다.** */
function wavPiece(){
  var d=DATA.relay, mid=wavToday();
  if(!d || !d.items || !mid) return null;
  var rows=d.items[mid]||[];
  if(!rows.length) return null;
  /* **`roundPick` 으로 바꿔 봤다가 되돌렸다** (T413~T415).
     자루가 6이고 한 과가 엿새 도니 여섯을 다 낼 줄 알았는데
     309 중 199가 163으로 **줄었다.** 자루가 작을 때 커서 걸음과 자루 크기가
     맞물려 같은 자리를 되풀이한다. 까닭을 다 못 밝혀서 되돌린다.
     **고쳐서 나빠지면 안 고친 것만 못하다.** `docs/play_unused.md` 에 적어 뒀다. */
  return rows[roundSeed("wave",0)%rows.length];
}
function wavLine(li){
  var t=DATA.transcripts, mid=wavToday();
  if(!t || !t.items || !mid) return null;
  var ls=t.items[mid]; if(!ls || li>=ls.length) return null;
  return String(ls[li]).replace(/^[A-Z][A-Za-z .'-]{0,20}:\s*/, "");
}
/* 이 점의 세기. **점마다 다르고 두 기기가 같은 값을 낸다.**
   씨앗이 같으니 같은 수가 나온다. 그리는 쪽만 다르다. */
function wavAim(s){
  var d=DATA.wave;
  if(!d || !d.steps || !d.steps.length) return null;
  return d.steps[roundSeed("wave", s+1) % d.steps.length];
}
function wavStep(n){
  var d=DATA.wave;
  return d.steps.filter(function(x){ return x.n===n; })[0] || null;
}
/* 그날 셈. `near` 는 한 칸 안에 든 점 수, `list` 는 점마다 몇 칸 벌어졌나. */
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

/* 마감. **두 자리에서 부른다.** T289 에 두 번 적어 놓고 한쪽만 고쳤다. */
function wavDone(d, rec, head){
  var h=head;
  h+='<div class="note">한 칸 안에 든 것이 <b>'+rec.near+'</b>점이다. '+
     '벌어진 칸수는 '+(rec.list.length?esc(rec.list.join(", ")):"아직 없다")+'.</div>';
  /* **두 줄이 같은 말로 시작하지 않게 한다.** 아래 `playHalf` 도
     "규칙서가 남기라는 값은" 으로 연다. 두 번 읽으면 둘째를 안 읽는다. */
  h+='<div class="note w"><b>'+d.near+'칸 안이면 닿은 것</b>으로 센 수다. '+
     '<b>정확히 맞히는 판이 아니다.</b> 격식은 점이 아니라 폭이다.</div>';
  /* `playHalf` 가 "<이 글> 중 몇이다" 를 만든다. **"중 몇" 을 두 번 적지 않는다.**
     T289 에 같은 자리에서 "장마다 물은 수 중 몇" 이 나왔다. */
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
    box.innerHTML=dataWait("눈금을","wave");
    if(!dataFailed("wave")) loadData("wave","ENG2P_WAVE",function(){ renderWave(); });
    return;
  }
  if(!DATA.relay){
    box.innerHTML=dataWait("줄을","relay");
    if(!dataFailed("relay")) loadData("relay","ENG2P_RELAY",function(){ renderWave(); });
    return;
  }
  if(!DATA.transcripts){
    box.innerHTML=dataWait("대본을","transcripts");
    if(!dataFailed("transcripts")) loadData("transcripts","ENG2P_TRANSCRIPTS",function(){ renderWave(); });
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

  /* 줄은 둘 다 본다. **감추는 것은 줄이 아니라 세기다.** */
  h+='<div class="small mut" style="margin-top:10px">이 줄을 그 세기로 고쳐 말한다</div>'+
     '<div class="swpline">'+esc(line||"")+'</div>';

  /* 눈금. **다섯 칸이 둘 다 보인다.** 짚을 자리가 안 보이면 못 짚는다. */
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
      /* **두 칸 넘게 벌어지면 다시 말한다.** 점은 안 넘어간다.
         어디였는지를 보여 주고 그 자리에서 한 번 더 한다 (규칙서 7.2). */
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
/* 처음부터. **두 마감이 같은 것을 부른다.** */
function wavReset(rec){
  roundStepSet("wave",0); turnForget("wave");
  rec.near=0; rec.list=[]; rec.again=0; save();
  wavClockStop(); WAVCLK.left=0; WAVCLK.over=false; renderWave();
}
PLAYREND.wave=renderWave;
