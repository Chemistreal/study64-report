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
  if(T.idx!==i) leaveSessPlay();
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
  T.run=false; clearInterval(T.tick); relWake();
  gotoBlock(0,{announce:true});
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
  if(!T.run){ hideSessionDone(); T.run=true; clearInterval(T.tick); T.tick=setInterval(tick,1000); reqWake(); }
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

/* 키보드 단축키. 데스크톱에서 세션 중 마우스를 안 잡게 한다. */
document.addEventListener("keydown",function(e){
  var tag=(e.target.tagName||"").toLowerCase();
  if(tag==="input"||tag==="textarea"||tag==="select"||e.metaKey||e.ctrlKey||e.altKey) return;
  var vis=TABS.filter(function(x){return x[0]!=="SEP";});
  if(e.key===" "){ e.preventDefault(); $("#tStart").click(); return; }
  if(e.key==="n"||e.key==="N"){ $("#tSkip").click(); return; }
  if(e.key==="p"||e.key==="P"){ $("#tPrev").click(); return; }
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

