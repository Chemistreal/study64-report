/* =========================================================================
   말 겹치기 (T304). `docs/play_rules.md` 10.3

     쓰는 것    이웃한 두 줄 넉 회. `out/data/clash.js` (T303). **A등급**
     시작 조건  줄 넷이 화면에 있다
     역할       둘 다 같다. **역할이 없다**
     도는 차례  신호에 맞춰 둘이 **일부러 동시에 말한다.** 그다음에 누가 양보하고 어떻게 잇는지를 본다
     판정       **둘이 같이.** 이었으면 이은 것이다
     끝         넉 줄을 돌면 끝난다
     못 했을 때 둘 다 멈추면 **멈춘 것도 한 가지 답이다.** 다시 시작한다
     기록할 값  넷 중 말이 이어진 것이 몇인가

   ## 역할이 없는데 몫은 갈린다

   자리가 안 돈다. 판정도 둘이 같이 한다. **그런데 각자 다른 줄을 든다.**

   역할과 몫이 다르다. 역할은 **누가 판정하느냐**이고 몫은 **누가 무엇을 드느냐**다.
   겹치면 지운다도 그랬다 (T276). 자리는 없고 각자 적을 것이 있었다.

   그래서 이 판은 `deviceSide` 를 안 쓴다. **날마다 뒤집히면 안 된다.**
   `devicePerson` 이 그대로 몫을 정한다. 사람1이 늘 앞줄이다.
   자리가 안 도는 판에서 몫만 도는 것은 규칙서에 없는 일이다.

   ## 자기 줄만 본다

   상대 줄이 보이면 언제 끝날지를 눈으로 알고 그러면 겹치는 것을 피하게 된다.
   **이 판은 일부러 겹치는 판이다.** 피할 수 있으면 안 겹친다.

   ## 신호는 한 기기가 낸다

   둘이 같은 순간에 시작해야 한다. 두 기기가 각자 세면 어긋난다 (`round.md` 5장).
   끼어들기에서 정한 것과 같다 (T301). 사람1의 기기가 센다.

   ## 멈춘 것도 한 가지 답이다

   못 했을 때 칸이 그렇게 적었다. 둘 다 멈추면 다시 시작한다.
   **셈에 안 들 뿐이고 틀린 것이 아니다.** 화면이 그 말을 한다.
   ========================================================================= */
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
/* 몫. **자리가 아니다.** 날마다 안 뒤집힌다 (`devicePerson`). */
function clsMine(){
  var who=(typeof devicePerson==="function")?devicePerson():null;
  return who==="a" ? "a" : who==="b" ? "b" : null;
}
/* 신호를 내는 기기인가. **사람1이 센다.** 둘이 각자 세면 어긋난다. */
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

/* 셋을 세고 신호를 낸다. **소리로 낸다.** 두 사람이 화면을 안 보고 있다. */
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
  /* **둘이 같이 판정하므로 두 기기에 같은 수가 남는다** (이어달리기와 같다). */
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

  /* 자기 줄만 본다. 상대 줄이 보이면 겹치는 것을 피하게 된다. */
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
  /* 멈춘 것도 답이라 회는 넘어간다. **다시 시작한다는 것은 다음 회다.** */
  $("#clsStop").onclick=function(){ rec.stop++; step(); };
}
function clsReset(rec){
  roundStepSet("clash",0); turnForget("clash");
  rec.join=0; rec.stop=0; save();
  clsCueStop(); clsClockStop(); CLSCLK.left=0; CLSCLK.over=false; renderClash();
}
PLAYREND.clash=renderClash;
