/* =========================================================================
   블록 몰기. 넘김과 되돌림을 한 자리에서 한다.
   전에는 넘김만 있었다. 잘못 눌러 넘어가면 되돌릴 방법이 없었다.
   40분짜리 블록을 실수로 넘기면 그 40분이 사라진다.
   ========================================================================= */
/* 다음 그림이 어느 쪽에서 들어올지. 그린 뒤에 비운다. */
var slideDir=null;
function gotoBlock(i, opt){
  opt=opt||{};
  if(i<0) i=0;
  if(i>=BLOCKS.length){ finishSession(); return; }
  /* 블록을 넘기면 소리를 끈다. 안 끄면 블록 1의 소리가 블록 2 위로 계속 흐른다.
     블록 2는 두 사람이 서로 말하는 블록이다. */
  if(T.idx!==i){
    leaveSessPlay();
    if(opt.announce) tone("next");
    /* **넘어가는 방향과 화면이 미는 방향이 같아야 한다.**
       다음 블록으로 가는데 화면이 위에서 내려오면 앞으로 가는 것인지
       처음으로 가는 것인지 몸이 모른다. 오른쪽에서 들어오면 앞으로 가는 것이고
       왼쪽에서 들어오면 되돌아가는 것이다. 손가락으로 미는 방향과도 맞는다. T177 */
    slideDir = (i>T.idx) ? "next" : "prev";
  }
  T.idx=i;
  T.left=BLOCKS[i].m*60;
  hideSessionDone();
  saveSession();
  paintTimer();
  prefetchNext();
  if(opt.announce) flash("블록 "+(i+1)+" "+BLOCKS[i].n);
}

/* =========================================================================
   다음 블록이 쓸 자료를 미리 읽어 둔다.

   **블록이 바뀌는 순간에 읽기 시작하면 그 순간이 빈다.**
   블록 2로 넘어가면 세트 493KB 를 그때부터 읽고 화면은 "세트를 여는 중이다" 를
   띄운다. 블록 3은 카드 565KB 다. 두 사람은 넘어가자마자 시작하려는 참인데
   화면이 아직 준비가 안 됐다고 말한다.

   **지금 블록에 40분이 있다.** 그 안에 다음 것을 읽으면 넘어갈 때 이미 있다.
   읽는 양은 같다. 읽는 때만 옮긴다. 열자마자 읽는 것은 안 는다.

   지금 블록이 그리고 나서 읽는다. 넘어가자마자 읽으면 지금 그림과 다툰다. T221
   ========================================================================= */
var PRE={t:null,at:null};
var PRE_NEED=[["sets","ENG2P_SETS"],["cards","ENG2P_CARDS"],null,null];
function prefetchNext(){
  /* **한 블록에 한 번만 건다.** 이 함수는 시계가 매초 부르는 자리에서도 온다.
     매번 다시 걸면 타이머가 계속 밀려 영영 안 읽는다. */
  if(PRE.at===T.idx) return;
  PRE.at=T.idx;
  clearTimeout(PRE.t);
  var need=PRE_NEED[T.idx];
  if(!need || DATA[need[0]]) return;
  PRE.t=setTimeout(function(){
    if(DATA[need[0]]) return;
    loadData(need[0], need[1], function(){});
  }, 2500);
}
$("#tSkip").onclick=function(){ gotoBlock(T.idx+1,{announce:true}); };
$("#tPrev").onclick=function(){
  /* 되돌리면 그 블록을 처음부터 다시 잰다. 남은 시간을 이어받지 않는다.
     블록은 시간이 아니라 하는 일이다. 되돌린다는 것은 그 일을 다시 한다는 뜻이다. */
  if(T.idx===0){ flash("첫 블록이다"); return; }
  gotoBlock(T.idx-1,{announce:true});
};
$("#tReset").onclick=function(){
  /* **처음으로는 지금까지 온 자리를 버린다.** 블록 3에서 누르면 두 시간 중
     한 시간 사십 분이 사라진다. 옆에 다음 블록이 있어서 잘못 누르기도 쉽다.
     되돌릴 자리를 같이 준다. T173 */
  var was={idx:T.idx,left:T.left,run:T.run};
  T.run=false; clearInterval(T.tick); relWake();
  gotoBlock(0,{announce:true});
  if(was.idx!==0 || was.left!==BLOCKS[0].m*60){
    offerUndo("세션을 처음으로 되돌림",function(){
      T.idx=was.idx; T.left=was.left; T.run=false;
      saveSession(); PANE.sig=null; renderBlockPane(); paintTimer();
    });
  }
};

/* 화면 꺼짐 방지. 2시간짜리 타이머를 켜 두고 매번 화면을 깨우게 하지 않는다.

   ## 안 될 때 아무 말도 안 했다 (T384)

   전에는 `return` 하고 `.catch` 가 실패를 삼켰다. **안 되면 조용했다.**

   두 시간짜리 세션인데 화면이 30초마다 꺼지면 두 사람은 계속 화면을 깨운다.
   그것이 앱의 결함으로 읽힌다. 실제로는 브라우저가 안 주는 것이다.

   그리고 이 물건은 **내려받아 여는 것이 정상 사용**이다 (`file://`).
   그 자리에서는 안 될 가능성이 크다. 안전한 자리가 아니라 브라우저가 안 준다.
   짝 코드의 카메라와 같은 결이다 (`22_paircode.js`).

   ## 대응을 적는다

   `ahead.md` 가 정했다. **문제만 적고 대응을 안 적으면 겁주기다.**
   기기 설정에서 화면 꺼지는 시간을 늘리라고 적는다.

   ## 세션 중에만 뜬다

   시작 전에 띄우면 아직 안 겪은 일로 겁을 준다. 걸어 본 뒤에 말한다. */
var wakeLock=null;
/* 왜 안 되나. **그 자리 값이라 저장소에 안 남는다.** 기기와 여는 곳이 정한다 */
var WAKE_WHY=null;
function reqWake(){
  WAKE_WHY=null;
  try{
    /* **이름만 있고 값이 없을 수 있다.** `in` 만 보면 그 자리를 지난다 */
    if(!navigator.wakeLock || !navigator.wakeLock.request){
      WAKE_WHY=(location.protocol==="file:")
        ? "파일로 열면 화면 켜 두기가 안 된다"
        : "이 브라우저는 화면 켜 두기를 안 준다";
      paintWake(); return;
    }
    navigator.wakeLock.request("screen").then(function(w){
      wakeLock=w; WAKE_WHY=null; paintWake();
      w.addEventListener("release",function(){ wakeLock=null; });
    }).catch(function(){
      WAKE_WHY="브라우저가 화면 켜 두기를 안 줬다"; paintWake();
    });
  }catch(e){ WAKE_WHY="화면 켜 두기를 걸다 막혔다"; paintWake(); }
  paintWake();
}
/* **앱이 고장 난 것이 아니라고 적는다.** 안 적으면 두 사람이 그렇게 읽는다 */
function paintWake(){
  var box=$("#wakeWhy"); if(!box) return;
  if(!WAKE_WHY || !T.run){ box.hidden=true; box.innerHTML=""; return; }
  box.hidden=false;
  box.innerHTML='<b>'+esc(WAKE_WHY)+'.</b> 앱이 고장 난 것이 아니다. '+
    '<span class="small">기기 설정에서 화면이 꺼지는 시간을 길게 잡는다. '+
    '두 시간을 켜 두는 세션이다.</span>';
}
function relWake(){
  try{ if(wakeLock){ wakeLock.release(); wakeLock=null; } }catch(e){}
  WAKE_WHY=null; paintWake();
}
document.addEventListener("visibilitychange",function(){
  if(document.visibilityState==="visible" && T.run && !wakeLock) reqWake();
});

/* 원탭 시작. 수행 표시와 타이머와 화면 유지를 한 번에 건다. */
$("#tOne").onclick=function(){
  /* 시작은 시작만 적는다. 정상 판정은 finishSession 이 한다. */
  var rec=day(today());
  if(!rec.started){ rec.started=today(); save(); }
  restartFinishedSession();
  if(!T.run){ hideSessionDone(); T.run=true; clearInterval(T.tick); T.tick=setInterval(tick,1000); reqWake();
    /* 시작 소리는 여기서만 낸다. 이어서 누를 때도 같은 소리다.
       두 사람이 화면을 안 보고 있을 때 시작한 것을 알리는 자리다. */
    tone("start"); }
  saveSession();   // 누른 그 순간을 남긴다. 10초 뒤가 아니라
  paintTimer();
  var c=$("#tClock"); if(c) c.scrollIntoView({behavior:"smooth",block:"center"});
};
(function(){ var b=$("#recOpen"); if(b) b.onclick=function(){
  S.recOpen=true; save(); renderToday();
  var c=$("#recCard"); if(c) c.scrollIntoView({behavior:"smooth",block:"center"});
}; })();
$("#focusLre").onclick=function(){ $("#lrePlus").click(); flash("LRE +1"); };
$("#focusToggle").onclick=function(){ $("#tStart").click(); };
$("#focusNext").onclick=function(){ $("#tSkip").click(); };
$("#focusPrev").onclick=function(){ $("#tPrev").click(); };
/* 오늘 화면으로 돌아간다. 블록 칸까지 데려다준다. 탭만 바꾸면 또 찾아야 한다. */
$("#focusHome").onclick=function(){
  go("today");
  var box=$("#blockPane");
  if(box) box.scrollIntoView({behavior:"smooth",block:"start"});
};

/* =========================================================================
   손가락 하나로 옮기기.

   블록을 옮기려면 화면을 위로 올려 조작줄을 찾아야 했다.
   세션 중에는 조작줄이 아래에 떠 있지만 그것도 눌러야 한다.
   **밀면 옮겨진다.**

   조심할 것이 셋이다.

   1. 안에 가로로 넘기는 것이 있다. 표와 대본이 그렇다. 그 위에서 시작한 밀기는 안 센다
   2. 위아래로 넘기는 것과 헷갈리면 안 된다. 가로가 세로보다 뚜렷할 때만 센다
   3. **잘못 밀면 40분이 날아간다.** 그래서 조작줄에 이전을 같이 넣었다
   ========================================================================= */
var SWIPE={x:0,y:0,on:false};
function swipeHost(){ return $("#blockPane"); }
function scrollsX(el){
  for(var e=el; e && e!==document.body; e=e.parentElement){
    if(e.scrollWidth>e.clientWidth+4) return true;
  }
  return false;
}
document.addEventListener("touchstart",function(e){
  var host=swipeHost();
  if(!host || !host.contains(e.target) || e.touches.length!==1){ SWIPE.on=false; return; }
  if(scrollsX(e.target)){ SWIPE.on=false; return; }
  SWIPE.on=true; SWIPE.x=e.touches[0].clientX; SWIPE.y=e.touches[0].clientY;
},{passive:true});
document.addEventListener("touchend",function(e){
  if(!SWIPE.on) return;
  SWIPE.on=false;
  var t0=e.changedTouches&&e.changedTouches[0]; if(!t0) return;
  var dx=t0.clientX-SWIPE.x, dy=t0.clientY-SWIPE.y;
  if(Math.abs(dx)<70 || Math.abs(dy)>45 || Math.abs(dy)>Math.abs(dx)*0.6) return;
  /* 미리 보기 중에는 블록을 안 옮긴다. 보는 자리지 하는 자리가 아니다. */
  if(peeking()) return;
  if(dx<0) $("#tSkip").click(); else $("#tPrev").click();
},{passive:true});


/* 키보드 단축키. 데스크톱에서 세션 중 마우스를 안 잡게 한다. */
document.addEventListener("keydown",function(e){
  var tag=(e.target.tagName||"").toLowerCase();
  if(tag==="input"||tag==="textarea"||tag==="select"||e.metaKey||e.ctrlKey||e.altKey) return;
  var vis=TABS.filter(function(x){return x[0]!=="SEP";});
  if(e.key===" "){ e.preventDefault(); $("#tStart").click(); return; }
  if(e.key==="n"||e.key==="N"||e.key==="ArrowRight"){ $("#tSkip").click(); return; }
  if(e.key==="p"||e.key==="P"||e.key==="ArrowLeft"){ $("#tPrev").click(); return; }
  if(e.key==="l"||e.key==="L"){ var b=$("#lrePlus"); if(b){ b.click(); flash("LRE +1"); } return; }
  /* **손이 화면에서 멀 때 칠 수 있어야 한다.** 상대가 다가오는 것을 보고
     단추를 찾아 누르는 사이에 이미 보인다. 덮여 있을 때도 같은 키로 푼다. T244 */
  if(e.key==="h"||e.key==="H"){ veilToggle(); return; }
  if(veiled()) return;             // 덮여 있으면 다른 키는 안 듣는다
  var n=parseInt(e.key,10);
  if(n>=1&&n<=vis.length){ go(vis[n-1][0]); }
});

/* 첫 실행 온보딩. 물어보는 것은 세 개뿐이다. */
function renderOnboard(){
  var card=$("#onboard");
  /* **아직 안 들어온 사람에게 지나온 값을 안 보인다** (T389).
     처음 여는 화면이 3335px 이었다. 이름을 아직 안 정했는데 적는 칸의
     이름표가 벌써 "남편 생각" 이고, 정상 세션을 한 번도 안 본 사람에게
     1인 예외 두 줄이 먼저 왔다. 남기는 것은 온보딩 카드와 시작 칸뿐이다. */
  if(S.onboarded){ card.hidden=true; return; }
  card.hidden=false;
  /* **숫자와 이름을 여기 안 적는다.** `BLOCKS` 가 원본이고 두 자리에 적으면
     갈라진다. 둘이 있어야 돈다는 것을 먼저 말한다. */
  var w=$("#obWhat");
  if(w) w.textContent="둘이 있어야 돈다. 두 시간은 블록 넷이다. "+
    BLOCKS.map(function(b){ return b.m+"분 "+b.n; }).join(" · ")+".";
  $("#obA").value=S.names.a; $("#obB").value=S.names.b; $("#obD").value=S.start;
}
$("#obGo").onclick=function(){
  S.names.a=$("#obA").value.trim()||"남편";
  S.names.b=$("#obB").value.trim()||"아내";
  S.start=$("#obD").value||today();
  S.onboarded=true; save(); renderOnboard(); renderToday();
};

