/* =========================================================================
   겹치면 지운다 (T276). `docs/play_rules.md` 4.3

     쓰는 것    오늘 과의 청크 목록. `out/data/chunks.js` (T270). **B등급**
     시작 조건  맞힐 것 하나를 앱이 골랐다. **둘 다 그것을 안다**
     역할       둘 다 같다. **역할이 없다**
     도는 차례  각자 단서 한 낱말을 적는다. 동시에 편다. **같으면 둘 다 지운다**
     판정       앱이 글자만 견준다. **같은 낱말인지만 본다**
     끝         남은 단서로 맞힐 것에 닿으면 끝난다
     못 했을 때 다 지워지면 한 바퀴를 다시 돈다. **지워진 것이 손해가 아니다**
     기록할 값  몇 바퀴 만에 닿았는가

   **역할이 없는 유일한 판이다.** 규칙서가 비워 두지 않고 "역할이 없다" 고 적었다.
   비우면 빠뜨린 것이고 적으면 정한 것이다. 그래서 이 화면에는 자리 표시가 없다.

   ## 앱이 판정하는데 앱이 상대 낱말을 모른다

   규칙서가 "앱이 글자만 견준다" 고 적었다. 그런데 두 기기는 서로에게 말을 못 한다
   (`docs/round.md` 2장). **이 기기에는 내 낱말밖에 없다.**

   그래서 반만 기계가 한다. 5장에서 정한 그대로다.

     기계   두 낱말이 글자로 같은가. 그것만 본다
     사람   **상대 낱말을 소리 내어 말하고 이 기기에 친다**

   치는 것이 번거로운 것이 아니라 **그것이 동시 공개다.** 먼저 본 사람이
   자기 것을 바꾸면 이 판은 아무것도 안 재게 된다. 그래서 내 것을 다 적기 전에는
   펴는 단추가 안 켜진다 (`revealGate`, T240).
   ========================================================================= */
var OVL={n:0, said:"", ready:false, heard:"", keep:[], hit:null};

function ovlToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
/* 맞힐 것. **앱이 고르고 둘 다 안다.** 씨앗에서 나오므로 두 기기가 같다. */
function ovlTarget(){
  var d=DATA.chunks, mid=ovlToday();
  if(!d || !d.items || !mid) return null;
  var rows=d.items[mid]||[];
  if(!rows.length) return null;
  return rows[roundSeed("overlap",0)%rows.length].c;
}
function ovlRec(){ return playRec("overlap", {rounds:0, wiped:0, hit:0}); }

/* 글자만 견준다. **뜻은 안 본다.** 그것은 못 검사한다.
   대소문자와 앞뒤 빈칸과 문장부호를 뗀다. 그 밖은 그대로 본다. */
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
    box.innerHTML=dataWait("청크 목록을","chunks");
    if(!dataFailed("chunks")) loadData("chunks","ENG2P_CHUNKS",function(){ renderOverlap(); });
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

  /* **역할이 없다.** 그래서 자리 표시를 안 그린다. 비워 두는 것이 아니라 없는 것이다. */
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
  /* 기기가 하나면 이 판도 종이로 돈다 (`solo_plays.md` 4.2). **따로 쓰고 같이 펴기와
     같은 자리다.** T310 에 그 판을 짜다가 여기가 비어 있는 것을 알았다.
     적는 자리가 하나면 뒤에 적는 사람이 앞사람 것을 봤거나 **안 봤다는 것을 서로 못 믿는다.**
     화면에 칸을 만들어 두고 돌려 보라고 하면 그 판이 판이 아니게 된다. */
  if(typeof soloOn==="function" && soloOn() && !open){
    h+='<div class="note w" style="margin-top:12px"><b>기기가 하나다. '+
       '이 판은 종이로 돈다.</b> 적는 자리가 하나면 뒤에 적는 사람이 앞사람 것을 '+
       '봤거나 <b>안 봤다는 것을 서로 못 믿는다.</b><br>'+
       '<b>각자 종이에 단서 한 낱말을 적고 같이 뒤집는다.</b> '+
       '겹쳤는지는 둘이 눈으로 견준다. 화면은 맞힐 것과 남은 단서만 낸다.</div>';
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="b" id="ovlPaperSame">겹쳤다. 둘 다 지운다</button>'+
       '<button class="g" id="ovlPaperDiff">안 겹쳤다. 둘 다 남는다</button></div>';
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="ovlGo">4분 시계 <span class="mono" id="ovlClock">'+
       ovlClockText()+'</span></button>'+
       '<button class="g" id="ovlHit">남은 단서로 닿았다</button></div>'+
       playGrade(DATA.chunks)+'</div>';
    box.innerHTML=h;
    $("#ovlGo").onclick=function(){ ovlClockGo(OVL.min); };
    $("#ovlHit").onclick=function(){
      OVL.hit=r+1; rec.rounds=r+1; save(); renderOverlap();
    };
    $("#ovlPaperSame").onclick=function(){
      rec.wiped+=2; rec.rounds++; save();
      roundStepSet("overlap", r+1); renderOverlap();
    };
    $("#ovlPaperDiff").onclick=function(){
      rec.rounds++; save();
      roundStepSet("overlap", r+1); renderOverlap();
    };
    return;
  }
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
       /* **판정 자리를 따로 둔다.** 글자마다 다시 그리면 커서가 튀고
          글자가 바뀔 때 안 그리면 판정이 첫 글자로 굳는다. 실제로 굳었다.
          `water` 와 `Water!` 가 "안 겹쳤다" 로 떴다. 친 것은 `W` 하나였다. T276 */
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
    /* 펴는 단추는 그릴 때 잠기고 풀린다 (T268 에 이것을 안 해서 못 폈다). */
    var now=!!String(ta.value||"").trim();
    if(now===OVL.ready) return;
    OVL.ready=now; renderOverlap();
    var t2=$("#ovlIn");
    if(t2){ t2.focus(); try{ t2.setSelectionRange(t2.value.length, t2.value.length); }catch(e){} }
  };
  revealBind($("#playPane"), function(){ renderOverlap(); });
  /* 판정 자리만 다시 그린다. **화면 전체를 안 건드린다.** */
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
