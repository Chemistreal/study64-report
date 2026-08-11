/* =========================================================================
   배속 사다리 (T280). `docs/play_rules.md` 6.1

     쓰는 것    대본 토막 `relay.js` + 사다리 규격 `ladder.js` (T279). **A등급**
     시작 조건  그 토막을 1.0 배속으로 한 번 들었다
     역할       말하는 쪽과 세는 쪽. **한 칸 오를 때마다 바뀐다**
     도는 차례  0.8 에서 시작한다. **세 번 연달아 되면 한 칸 올린다.** 1.2 까지
     판정       **세는 사람.** 배속마다 볼 것이 다르다
     끝         1.2 가 세 번 되면 끝난다. 5분이 되면 그 칸에서 끝난다
     못 했을 때 **두 번 연달아 안 되면 한 칸 내린다.** "한 번 더 다진다" 로 적는다
     기록할 값  그 판에서 닿은 제일 높은 칸

   **숫자를 이 파일에 안 적는다.** 세 칸도 3연속도 2연속도 다 `ladder.js` 에서 온다.
   그것은 `docs/bench_music.md` 6장에서 파생된다 (T279).
   여기에 손으로 적으면 문서와 앱이 두 자리가 되고 언젠가 갈라진다.

   ## 같은 것을 세 번 재는 것이 아니다

   규칙서가 그렇게 적었다. 배속마다 볼 것이 다르다.

     0.8   낱말이 다 들렸는가
     1.0   끊긴 자리가 없는가
     1.2   서두른 티가 안 나는가

   **그 글이 세는 쪽 화면에 있어야 한다.** 없으면 셋 다 "잘했나" 가 되고
   그러면 칸이 셋인 뜻이 없어진다.

   ## 내리는 것이 벌이 아니다

   T175 에 정한 말투 규칙이 그대로 걸린다. 사람이 아니라 **다음에 할 일**을 말한다.
   "실패. 0.8 로 내려갑니다" 가 아니라 "0.8 에서 한 번 더 다진다" 다.
   그 말도 문서에서 온다. 내가 여기서 다시 안 짓는다.
   ========================================================================= */
var LAD={seats:["말하는 쪽","세는 쪽"], ok:0, no:0};

/* 보이는 배속. **문서가 적은 글자를 쓴다.** 셈은 `rate` 로 하고 이것은 눈에만 간다.
   `1.0` 을 수로만 두면 화면에 "1 배속" 이라고 뜬다. 문서와 화면이 다른 말을 한다. */
function ladLabel(s){ return (s && s.label) || String(s && s.rate); }
function ladToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
/* 오늘 토막. **전달 놀이가 쓰는 것을 그대로 쓴다.** 자료를 두 번 안 만든다. */
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
/* 그날 셈. **닿은 제일 높은 칸 하나다.** 오르내린 자취는 안 센다. */
function ladRec(){ return playRec("ladder", {best:0, up:0, down:0}); }
/* 지금 칸. **오른 횟수가 곧 칸이다.** `roundStep` 을 회가 아니라 칸으로 쓴다
   (이어달리기가 접은 횟수로 쓴 것과 같다. T271). */
function ladStep(){
  var d=DATA.ladder;
  var n=roundStep("ladder");
  return Math.max(0, Math.min((d&&d.steps?d.steps.length:1)-1, n));
}
/* 자리. **한 칸 오를 때마다 바뀐다.** 칸이 곧 회다. */
function ladWho(){
  var f=roundFirst(roundStep("ladder"), 1);
  return f===null ? null : (f ? LAD.seats[0] : LAD.seats[1]);
}

var LADA={el:null, stop:null};
function ladAudioStop(){
  if(LADA.stop){ clearTimeout(LADA.stop); LADA.stop=null; }
  if(LADA.el){ try{ LADA.el.pause(); }catch(e){} }
}
/* **배속을 바꿔 튼다.** 이 판의 전부다. 앱 배속 범위가 0.75~1.25 고
   세 칸이 그 안에 든다 (`docs/bench_music.md` 6.1). */
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
    /* 느리게 틀면 그만큼 오래 걸린다. 어림에 0.7초를 더 얹는다 (T268). */
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
    box.innerHTML=dataWait("사다리 규격을","ladder");
    if(!dataFailed("ladder")) loadData("ladder","ENG2P_LADDER",function(){ renderLadder(); });
    return;
  }
  if(!DATA.relay){
    box.innerHTML=dataWait("토막을","relay");
    if(!dataFailed("relay")) loadData("relay","ENG2P_RELAY",function(){ renderLadder(); });
    return;
  }
  if(!DATA.transcripts){
    box.innerHTML=dataWait("대본을","transcripts");
    if(!dataFailed("transcripts")) loadData("transcripts","ENG2P_TRANSCRIPTS",function(){ renderLadder(); });
    return;
  }
  if(!MEDIA.length){
    /* **못 읽었으면 그렇다고 말한다** (T387). 차림표 키는 catalog 다 */
    box.innerHTML=dataWait("소리 차림표를","catalog");
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

  /* 사다리. **지금 칸이 어디인지가 한눈에 보여야 한다.** */
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

  /* **세는 쪽 화면에 볼 것이 있어야 한다.** 없으면 셋 다 "잘했나" 가 된다. */
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
  /* 시작 조건이 "1.0 배속으로 한 번 들었다" 다. 그 단추를 늘 둔다. */
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
      /* **말은 문서에서 온다.** 여기서 다시 안 짓는다 (T175). */
      moveTo(k-1, d.downSay);
      return;
    }
    renderLadder();
  };
}
PLAYREND.ladder=renderLadder;
