/* =========================================================================
   둘이 한 문장 (T274). `docs/play_rules.md` 4.2

     쓰는 것    앞뒤로 가른 문장 여섯. `out/data/halves.js` (T273). **A등급**
     시작 조건  문장 여섯이 앞뒤로 갈려 있다
     역할       앞을 받는 쪽과 뒤를 받는 쪽. **문장마다 바뀐다**
     도는 차례  각자 화면에 절반씩 뜬다. 서로 안 보여 준다. 차례로 말해 붙인다
     판정       **둘이 같이.** 붙여서 말이 되면 통과다
     끝         여섯 문장을 돌면 끝난다
     못 했을 때 안 붙으면 둘 다 화면을 펴고 본다. **펴 보는 것이 벌이 아니다**
     기록할 값  여섯 중 몇이 붙었는가

   **가리기와 같이 판정하기가 한 판에 같이 있다.** 앞의 다섯에는 없던 짝이다.

     거울·한 줄 바꾸기·내 소리는 네가·전달   가린다. 한쪽이 판정한다
     이어달리기                              안 가린다. 둘이 같이 판정한다
     **둘이 한 문장**                        **가린다. 둘이 같이 판정한다**

   그래서 셈이 두 기기에 같은 수로 남는다 (이어달리기와 같다).
   가린다고 셈이 절반이 되는 것이 아니다. **판정하는 자리가 도는 것이 절반을 만든다.**

   이 판은 처음으로 그 둘을 갈라 보게 한다.
   ========================================================================= */
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
    box.innerHTML=dataWait("가른 문장을","halves");
    if(!dataFailed("halves")) loadData("halves","ENG2P_HALVES",function(){ renderTwohalf(); });
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
    /* **둘이 같이 판정하는 판이라 두 기기에 같은 수가 남는다.**
       가린다고 절반이 되는 것이 아니다. 판정하는 자리가 도는 것이 절반을 만든다. */
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
    /* 펴 본 자리. **벌이 아니라고 화면이 적는다.** 규칙서가 그렇게 정했다. */
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
