/* =========================================================================
   따로 쓰고 같이 펴기 (T310). `docs/play_rules.md` 12.1

     쓰는 것    오늘 강의 블록 2의 함정 문장과 묻는 틀. `out/data/apart.js` (T309)
     시작 조건  물음 하나가 둘 화면에 같이 떴다
     역할       둘 다 같다. **역할이 없다**
     도는 차례  각자 답을 적는다. **다 적을 때까지 서로 안 보인다.** 둘 다 되면 동시에 펴진다
     판정       **둘이 같이.** 답이 하나가 아니다
     끝         펴고 서로 다른 자리를 하나씩 말하면 끝난다
     못 했을 때 한쪽이 못 적으면 **적은 쪽이 먼저 펴지 않는다.** 시간이 되면 둘 다 펴진다
     기록할 값  **폈다는 것 하나.** 답을 채점하지 않는다

   ## 시계가 펴지 않는다

   못 했을 때 칸이 "시간이 되면 둘 다 펴진다" 다. 그것을 앱이 하면 안 된다.

   **두 기기의 시계가 따로 간다.** 각자 눌러 시작하니 몇 초씩 어긋나 있고
   저절로 펴면 먼저 울린 쪽이 먼저 펴진다. **그것이 이 판이 막으려던 바로 그것이다.**

   그래서 시간이 되면 **빈 칸이어도 단추가 켜지기만 한다.** 누르는 것은 둘이 같이 한다.
   `round.md` 5장이 정한 반반이 그대로다. 셈이 잠그고 사람이 맞춘다.

   ## 답을 안 센다

   기록할 값이 "폈다는 것 하나" 다. 몇 자를 적었는지도 안 세고 답을 안 견준다.
   **이 판에는 맞고 틀림이 없다.** 화면이 그 말을 한다.

   그래서 못 적고 편 것도 그냥 편 것이다. 셈이 하나뿐이라 깎일 자리가 없다.

   ## 기기가 하나면 이 판은 종이로 돈다

   `solo_plays.md` 4.2 가 정했다. 적는 자리가 하나면 뒤에 적는 사람이
   앞사람 것을 봤거나 **안 봤다는 것을 서로 못 믿는다.**

   화면에 적는 칸을 만들어 두고 돌려 보라고 하면 그 판이 판이 아니게 된다.
   그날은 칸을 안 낸다. 물음만 내고 종이에 적으라고 한다.
   ========================================================================= */
var APT={said:"", ready:false, min:5};

function aptItem(){
  var d=DATA.apart, pl=(typeof plan==="function")?plan():null;
  if(!d || !d.items || !pl || !pl.lectureNo) return null;
  for(var i=0;i<d.items.length;i++) if(d.items[i].no===pl.lectureNo) return d.items[i];
  return null;
}
/* **폈다는 것 하나.** 답을 안 담는다. 담으면 채점할 수 있게 되고 그러면 채점하게 된다. */
function aptRec(){ return playRec("apart", {opened:0}); }

var ACLK={t:null, left:0, over:false};
function aptClockStop(){ if(ACLK.t){ clearInterval(ACLK.t); ACLK.t=null; } }
function aptClockText(){
  if(ACLK.over) return "0:00";
  var s=ACLK.left>0?ACLK.left:APT.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function aptClockGo(min){
  if(ACLK.t){ aptClockStop(); return; }
  if(ACLK.left<=0){ ACLK.left=min*60; ACLK.over=false; }
  tone("start");
  ACLK.t=setInterval(function(){
    ACLK.left--;
    var e=document.getElementById("aptClock");
    if(!e){ aptClockStop(); return; }
    if(ACLK.left<=0){
      /* **시간이 다 돼도 안 편다.** 단추가 켜질 뿐이다. 위 머리글을 본다. */
      ACLK.over=true; aptClockStop(); tone("blockend"); renderApart(); return;
    }
    e.textContent=aptClockText();
  },1000);
  var e=document.getElementById("aptClock"); if(e) e.textContent=aptClockText();
}

function renderApart(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("apart");
  APT.min=p.min;
  if(!DATA.apart){
    box.innerHTML='<div class="card tight small mut">물음을 여는 중이다.</div>';
    loadData("apart","ENG2P_APART",function(){ renderApart(); });
    return;
  }
  var d=DATA.apart, it=aptItem(), s=roundStep("apart"), rec=aptRec();
  var h='<div class="card">'+playHead(p,s);
  if(!it){
    h+='<div class="note w" style="margin-top:10px"><b>오늘 강의 물음이 없다.</b> '+
       '<b>scripts/derive_apart.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    box.innerHTML=h; return;
  }

  if(s>=1){
    h+='<div class="note g" style="margin-top:10px"><b>폈고 서로 다른 자리를 말했다. '+
       '끝났다.</b></div>';
    h+='<div class="note">이 판이 남기는 값은 <b>폈다는 것 하나</b>다. '+
       '<b>답을 채점하지 않는다.</b> 맞고 틀림이 없는 판이다. '+
       '오늘 편 횟수 <b>'+rec.opened+'</b>.</div>';
    h+='<div class="note w"><b>두 기기에 같은 수가 있어야 한다.</b> '+
       '둘이 같이 폈으니 둘 다 1이다. <b>이 판은 절반이 아니다.</b></div>';
    h+=playGrade(d)+'<div class="row" style="margin-top:10px">'+
       '<button class="g" id="aptAgain">처음부터</button></div></div>';
    box.innerHTML=h;
    $("#aptAgain").onclick=function(){ aptReset(rec); };
    return;
  }

  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span class="small mut">이 판은 <b>역할이 없다.</b> 둘이 같은 일을 한다</span>'+
     '<span class="small mut">'+esc(it.q)+' '+it.no+'강 · '+esc(it.track)+'</span></div>';

  h+='<div class="small mut" style="margin-top:10px">오늘 강의 '+esc(it.title)+
     ' 의 함정</div><div class="aptrap">'+esc(it.trap)+'</div>';
  h+='<div class="aptask"><b>물음</b><br>'+esc(it.ask)+'</div>';
  h+='<div class="small mut">함정 문장은 <b>강의 그대로</b>다. 묻는 틀은 한국어 지시문이다.</div>';

  var key="apart"+today(), open=revealOpen(key);

  /* 기기가 하나면 칸을 안 낸다. **화면에 흉내를 안 낸다** (`solo_plays.md` 4.2). */
  if(typeof soloOn==="function" && soloOn()){
    h+='<div class="note w" style="margin-top:12px"><b>기기가 하나다. '+
       '이 판은 종이로 돈다.</b> 적는 자리가 하나면 뒤에 적는 사람이 앞사람 것을 '+
       '봤거나 <b>안 봤다는 것을 서로 못 믿는다.</b><br>'+
       '<b>각자 종이에 적고 같이 뒤집는다.</b> 화면은 물음만 낸다.</div>';
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="b" id="aptPaper">종이를 같이 뒤집었다</button></div>';
  }else if(!open){
    h+='<div class="note" style="margin-top:12px">답을 적는다. '+
       '<b>상대에게 안 보여 준다.</b> 다 적으면 펴는 단추가 켜진다. '+
       '<b>답이 하나가 아니다.</b> 길게 안 적어도 된다.</div>'+
       '<textarea id="aptIn" rows="3" aria-label="이 기기 사람의 답" '+
       'placeholder="여기에 적는다">'+esc(APT.said)+'</textarea>';
    /* **시간이 다 되면 빈 칸이어도 켜진다.** 저절로 펴지지는 않는다. */
    h+=revealGate(key, "aptIn", "서로 다른 자리를 하나씩 말한다", ACLK.over);
  }else{
    h+='<div class="note g" style="margin-top:12px">폈다. 이 기기 답은 이것이다.</div>'+
       '<div class="aptmine">'+(String(APT.said).trim()
         ? esc(APT.said)
         : '<span class="mut">이 기기는 못 적었다. 못 적은 것이 벌이 아니다.</span>')+
       '</div>';
    h+='<div class="note"><b>소리 내어 읽는다.</b> 상대 답을 듣는다. '+
       '그다음에 <b>서로 다른 자리를 하나씩</b> 말한다. 그것이 끝 조건이다.</div>';
    h+='<div class="note w"><b>답을 채점하지 않는다.</b> 답이 하나가 아니다. '+
       '누가 더 잘 적었는지를 안 가른다.</div>';
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="b" id="aptDone">다른 자리를 하나씩 말했다</button></div>';
  }

  h+='<div class="row" style="margin-top:10px">'+
     '<button class="g" id="aptGo">'+APT.min+'분 시계 <span class="mono" id="aptClock">'+
     aptClockText()+'</span></button></div>';
  if(ACLK.over && !open)
    h+='<div class="small mut" style="margin-top:6px"><b>시간이 됐다.</b> '+
       '앱이 저절로 펴지 않는다. 두 기기 시계가 따로 가서 먼저 울린 쪽이 먼저 펴진다. '+
       '<b>둘이 같이 누른다.</b></div>';
  h+=playGrade(d)+'</div>';
  box.innerHTML=h;

  $("#aptGo").onclick=function(){ aptClockGo(APT.min); };
  var ta=$("#aptIn");
  if(ta) ta.oninput=function(){
    APT.said=ta.value;
    /* 펴는 단추는 그릴 때 잠기고 풀린다. 바뀔 때만 다시 그린다 (T268). */
    var now=!!String(ta.value||"").trim();
    if(now===APT.ready) return;
    APT.ready=now; renderApart();
    var t2=$("#aptIn");
    if(t2){ t2.focus(); try{ t2.setSelectionRange(t2.value.length, t2.value.length); }catch(e){} }
  };
  revealBind($("#playPane"), function(){ renderApart(); });
  function finish(){
    rec.opened=1; save(); tone("done");
    roundStepSet("apart", 1); renderApart();
  }
  if($("#aptDone")) $("#aptDone").onclick=finish;
  if($("#aptPaper")) $("#aptPaper").onclick=finish;
}
function aptReset(rec){
  roundStepSet("apart",0); turnForget("apart");
  rec.opened=0; save();
  revealReset("apart"+today());
  APT.said=""; APT.ready=false;
  aptClockStop(); ACLK.left=0; ACLK.over=false; renderApart();
}
PLAYREND.apart=renderApart;
