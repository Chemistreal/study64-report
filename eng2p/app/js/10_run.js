/* =========================================================================
   블록 몰기. 넘김과 되돌림을 한 자리에서 한다.
   전에는 넘김만 있었다. 잘못 눌러 넘어가면 되돌릴 방법이 없었다.
   40분짜리 블록을 실수로 넘기면 그 40분이 사라진다.
   ========================================================================= */
function gotoBlock(i, opt){
  opt=opt||{};
  if(i<0) i=0;
  if(i>=BLOCKS.length){ finishSession(); return; }
  /* 블록을 넘기면 소리를 끈다. 안 끄면 블록 1의 소리가 블록 2 위로 계속 흐른다.
     블록 2는 두 사람이 서로 말하는 블록이다. */
  if(T.idx!==i){ leaveSessPlay(); if(opt.announce) tone("next"); }
  T.idx=i;
  T.left=BLOCKS[i].m*60;
  hideSessionDone();
  saveSession();
  paintTimer();
  if(opt.announce) flash("블록 "+(i+1)+" "+BLOCKS[i].n);
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

/* 화면 꺼짐 방지. 2시간짜리 타이머를 켜 두고 매번 화면을 깨우게 하지 않는다. */
var wakeLock=null;
function reqWake(){
  try{
    if(!("wakeLock" in navigator)) return;
    navigator.wakeLock.request("screen").then(function(w){
      wakeLock=w;
      w.addEventListener("release",function(){ wakeLock=null; });
    }).catch(function(){});
  }catch(e){}
}
function relWake(){ try{ if(wakeLock){ wakeLock.release(); wakeLock=null; } }catch(e){} }
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
  var n=parseInt(e.key,10);
  if(n>=1&&n<=vis.length){ go(vis[n-1][0]); }
});

/* 첫 실행 온보딩. 물어보는 것은 세 개뿐이다. */
function renderOnboard(){
  var card=$("#onboard");
  if(S.onboarded){ card.hidden=true; return; }
  card.hidden=false;
  $("#obA").value=S.names.a; $("#obB").value=S.names.b; $("#obD").value=S.start;
}
$("#obGo").onclick=function(){
  S.names.a=$("#obA").value.trim()||"남편";
  S.names.b=$("#obB").value.trim()||"아내";
  S.start=$("#obD").value||today();
  S.onboarded=true; save(); renderOnboard(); renderToday();
};

