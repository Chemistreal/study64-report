/* =========================================================================
   탭
   ========================================================================= */
var TABS=[["today","오늘","learn"],["review","복습","learn"],["sound","소리","learn"],["clip","클립","learn"],["media","미디어","learn"],["play","판","learn"],
          ["src","자료","manage"],["ledger","대장","manage"],["verify","판정","manage"],["quarter","분기","manage"],
          ["check","검사","manage"],["rot","회전","manage"],["rules","규칙","manage"]];
function navButton(t){
  var b=el("button",null,t[1]);
  b.type="button"; b.dataset.t=t[0]; b.setAttribute("aria-controls","t-"+t[0]);
  b.onclick=function(){ go(t[0]); };
  return b;
}
function buildNav(){
  var n=$("#nav");
  TABS.filter(function(t){return t[2]==="learn";}).forEach(function(t){ n.appendChild(navButton(t)); });
  var more=document.createElement("details"); more.className="navmore"; more.id="navMore";
  var sum=document.createElement("summary"); sum.textContent="운영"; more.appendChild(sum);
  var menu=el("div","navmenu"); menu.setAttribute("aria-label","운영 화면");
  TABS.filter(function(t){return t[2]==="manage";}).forEach(function(t){ menu.appendChild(navButton(t)); });
  more.appendChild(menu); n.appendChild(more);
}
function go(name){
  TABS.forEach(function(t){
    var sec=$("#t-"+t[0]); if(sec) sec.hidden=(t[0]!==name);
    var b=$('nav button[data-t="'+t[0]+'"]');
    if(b){ if(t[0]===name) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current"); }
  });
  var current=TABS.filter(function(t){return t[0]===name;})[0], more=$("#navMore");
  if(more){
    more.classList.toggle("active",!!current&&current[2]==="manage");
    var sum=more.querySelector("summary");
    if(sum) sum.textContent=current&&current[2]==="manage"?"운영 · "+current[1]:"운영";
    more.open=false;
  }
  /* 조작줄의 돌아갈 자리. **오늘 탭에 있을 때는 안 보인다.**
     거기 있는데 "오늘" 단추가 있으면 자리만 먹고 무엇을 가리키는지도 헷갈린다. */
  var home=$("#focusHome");
  if(home) home.hidden=(name==="today");
  if(typeof ttsStop==="function") ttsStop();
  if(name!=="media"&&typeof LIB!=="undefined"&&LIB.el) LIB.el.pause();
  /* 판 탭을 떠나면 판 시계를 멈춘다. **안 멈추면 안 보이는 자리에서 매초 돈다.**
     보이지도 않는 칸이 계속 도는 것을 T185 에서 한 번 겪었다. T259 */
  if(name!=="play"&&typeof mirClockStop==="function") mirClockStop();
  if(location.hash.slice(1)!==name) history.replaceState(null,"","#"+name);
  if(name==="review") renderReview();
  if(name==="sound") renderSound();
  if(name==="src") renderSrc();
  if(name==="clip") renderClip();
  /* **오늘 탭으로 돌아오면 다시 그린다.** 다른 탭은 다 다시 그리는데 이것만 아니었다.
     세션 중에 값이 바뀐다. 블록 3이 오늘 돈 카드 수를 세고 블록 2가 LRE 를 받는다.
     안 다시 그리면 옛 값이 칸에 남고, 그 상태에서 옆 칸을 고치면
     `pullForm` 이 옛 값을 그대로 다시 써 넣는다. **센 것이 지워진다.** T216 */
  if(name==="today") renderToday();
  if(name==="media") renderMedia();
  if(name==="ledger"){ renderLedger(); renderRest(); renderWeekCheck(); renderPair(); renderMerge(); }
  /* **드물게 여는 탭 넷은 늦게 읽는다** (T313 뒤). 21.3KB 라 열자마자 읽을 값이 아니다.
     판 탭이 쓰는 길과 같다 (T259). 다른 점은 **여기는 그릴 자리가 이미 화면에 있다**는
     것이다. 칸은 `body/` 조각에 있고 그리는 코드만 늦게 온다. */
  if(name==="verify") lateDo("renderVerify");
  if(name==="quarter") lateDo("renderQuarter");
  if(name==="quarter") lateDo("renderBadge");
  if(name==="rot") lateDo("renderRot");
  if(name==="check") lateDo("checkBind");
  if(name==="rules") renderSplit();
  if(name==="play") renderPlayTab();
  window.scrollTo(0,0);
}
document.addEventListener("click",function(e){
  var more=$("#navMore"); if(more&&more.open&&!more.contains(e.target)) more.open=false;
});

/* 늦게 읽는 탭 넷. **한 번만 읽는다.** 읽고 나면 그 안의 함수가 그냥 있다.
   못 읽으면 그 탭이 빈 채로 남는다. 빈 것과 없는 것을 가르려고 말을 적는다. */
var LATE={at:{}};
function lateDo(fn, box){
  if(typeof window[fn]==="function"){ window[fn](); return; }
  loadScript("late","eng2p/out/app/late.js",function(ok){
    if(ok && typeof window[fn]==="function"){ window[fn](); return; }
    var b=$(box||"#tab-"+(LATE.now||""));
    if(b) b.innerHTML='<div class="card"><div class="note w">이 탭을 못 읽었다. '+
      '<b>eng2p/out/app/late.js</b> 가 있어야 한다. 내려받을 때 그 자리가 빠졌으면 '+
      '이 탭은 안 돈다. 나머지는 그대로 돈다.</div></div>';
  });
}

/* =========================================================================
   오늘 탭
   ========================================================================= */
function renderToday(){
  var d=today(), r=roleOf(d), rec=day(d);
  $("#todayDate").textContent=d;
  var A = r==="a" ? S.names.a : S.names.b;
  var B = r==="a" ? S.names.b : S.names.a;
  $("#todayRole").innerHTML = '<span class="rb a">A '+esc(A)+'</span> <span class="rb b" style="margin-left:6px">B '+esc(B)+'</span>';
  var weekStart=monday(d), weekDone=0;
  for(var wi=0;wi<7;wi++){ var wr=S.days[addDays(weekStart,wi)]; if(wr&&(wr.status==="normal"||wr.status==="emg")) weekDone++; }
  var pl=plan();
  var msg="이번 주 "+weekDone+" / 6일 · 진도 "+pl.week+"주 "+pl.day+"일째 / 48주";
  if(pl.behind>0) msg+=" · 달력보다 "+pl.behind+"주 밀렸다";
  /* **고리와 겹치는 줄은 없앤다.** 역할 교대는 바로 위 lede 가 이미 말한다.
     밀린 주 수는 고리 이름표로 옮겼다. 그러면 이 줄은 평소에 비어 있다. */
  $("#todayProgress").textContent=msg+" · A/B는 날짜로 자동 교대";
  var p2=$("#todayProgress2"); if(p2) p2.textContent="";
  renderRings(pl,weekDone,rec);
  renderSlots();
  renderSheet(pl);
  renderResume(pl);
  renderRecGate(rec);
  renderCrit();
  renderEmg(pl);
  $("#labU1").textContent=S.names.a+" 생각"; $("#labU2").textContent=S.names.b+" 생각";
  $("#fSpeak").value=rec.speak||""; $("#fCards").value=rec.cards||""; $("#fLre").value=rec.lre||"";
  document.querySelectorAll("[data-st]").forEach(function(b){
    b.classList.toggle("on", rec.status===b.dataset.st);
  });
  renderUnres(); renderColl(); renderNudge();
  paintTimer();  // 이름이 바뀌면 블록별 2인 지시도 같이 갱신한다
  paintSide();   // 이름이 바뀌면 오른쪽 위 표시도 같이 갱신한다
}
document.querySelectorAll("[data-st]").forEach(function(b){
  b.onclick=function(){
    var rec=day(today()), was=rec.status;
    if(was===b.dataset.st) return;          // 같은 것을 다시 누르면 아무 일도 안 한다
    rec.status=b.dataset.st; save(); renderToday();
    /* **이 값이 진도를 정한다.** 정상을 결석으로 잘못 누르면 그날이 진도에서 빠진다.
       96강 배정이 통째로 하루 밀린다. 그것을 되돌릴 길이 없었다. T173 */
    offerUndo("수행 기록을 "+(b.textContent||"").trim()+"으로 바꿈",function(){
      day(today()).status=was; renderToday();
    });
  };
});
function pullForm(){
  var rec=day(today());
  rec.speak=+$("#fSpeak").value||0; rec.cards=+$("#fCards").value||0; rec.lre=+$("#fLre").value||0;
  save(); flash("저장됨");
}
function flash(m){
  var f=$("#fMsg"); if(!f) return;
  f.textContent=m; clearTimeout(flash.t);
  flash.t=setTimeout(function(){ f.textContent="자동 저장된다"; },1600);
}
["#fSpeak","#fCards","#fLre"].forEach(function(s){ $(s).addEventListener("input",pullForm); });
document.querySelectorAll("[data-stp]").forEach(function(b){
  b.onclick=function(){
    var inp=$("#"+b.dataset.stp);
    inp.value=Math.max(0,(+inp.value||0)+(+b.dataset.d));
    pullForm();
  };
});
$("#lrePlus").onclick=function(){
  var inp=$("#fLre"); inp.value=(+inp.value||0)+1;
  var rec=day(today()); if(!rec.status) rec.status="normal";
  pullForm(); renderToday();
};
function renderUnres(){
  var box=$("#uList"); box.innerHTML="";
  var rec=day(today());
  rec.unres.forEach(function(u,i){
    var d=el("div","lreitem");
    var h=el("div","hd2");
    h.appendChild(el("b",null,u.t||"(문장 없음)"));
    var acts=el("div","row"); acts.style.gap="8px";
    acts.appendChild(spkBtn(u.t||""));
    var x=el("button","del","삭제");
    x.onclick=function(){
      var gone=rec.unres.splice(i,1)[0]; save(); renderUnres();
      offerUndo("미해결 LRE 1건 삭제",function(){ rec.unres.splice(i,0,gone); renderUnres(); });
    };
    acts.appendChild(x); h.appendChild(acts); d.appendChild(h);
    if(u.i) d.appendChild(el("div","small mut","걸린 것: "+u.i));
    if(u.h) d.appendChild(el("div","small",S.names.a+": "+u.h));
    if(u.w) d.appendChild(el("div","small",S.names.b+": "+u.w));
    box.appendChild(d);
  });
}
$("#uAdd").onclick=function(){
  var t=$("#uT").value.trim(); if(!t){ $("#uT").focus(); return; }
  day(today()).unres.push({t:t,i:$("#uI").value.trim(),k:$("#uK").value.trim(),
    h:$("#uH").value.trim(),w:$("#uW").value.trim(),done:false});
  ["#uT","#uI","#uK","#uH","#uW"].forEach(function(s){$(s).value="";});
  save(); renderUnres();
};
function renderColl(){
  var box=$("#cList"); box.innerHTML="";
  var rec=day(today());
  rec.coll.forEach(function(c,i){
    var d=el("div","lreitem");
    var h=el("div","hd2"); h.appendChild(el("b",null,c.e));
    var acts=el("div","row"); acts.style.gap="8px";
    acts.appendChild(spkBtn(c.e||""));
    var x=el("button","del","삭제");
    x.onclick=function(){
      var gone=rec.coll.splice(i,1)[0]; save(); renderColl();
      offerUndo("채집 표현 1건 삭제",function(){ rec.coll.splice(i,0,gone); renderColl(); });
    };
    acts.appendChild(x); h.appendChild(acts); d.appendChild(h);
    d.appendChild(el("div","small mut","출처: "+(c.s||"(없음)")+(c.q?" · "+c.q:"")));
    box.appendChild(d);
  });
}
$("#cAdd").onclick=function(){
  var e=$("#cE").value.trim(); if(!e){ $("#cE").focus(); return; }
  var s=$("#cS").value.trim();
  if(!s){ toast("출처 없이 올리지 않는다."); $("#cS").focus(); return; }
  day(today()).coll.push({e:e,s:s,q:$("#cQ").value.trim(),k:$("#cK").value.trim(),done:false});
  ["#cE","#cS","#cQ","#cK"].forEach(function(x){$(x).value="";});
  save(); renderColl();
};


/* =========================================================================
   고리 셋. 오늘과 이번 주와 1년.

   **숫자를 읽게 하지 않는다.** 두 사람이 앉아서 제일 먼저 하는 것은
   얼마나 남았는지를 아는 것이다. 그것을 글자로 적으면 읽어야 하고
   읽으면 세 줄을 다 읽는다. 고리는 안 읽어도 보인다.

   셋 다 **둘이 같이 쌓는 값이다.** 사람별 칸을 안 만든다. 2인 원칙 1이다.
   ========================================================================= */
var RING=[
  {r:46,w:10,k:"오늘",c:"var(--a1)"},
  {r:33,w:10,k:"이번 주",c:"var(--a2)"},
  {r:20,w:10,k:"1년",c:"var(--a3)"}
];
function renderRings(pl,weekDone,rec){
  var box=$("#todayRings"); if(!box) return;
  /* 오늘은 블록 넷이다. 끝낸 블록 수로 센다.
     안 시작했으면 0이고 끝냈으면 4다. 도는 중이면 지난 블록 수다. */
  var today4=0;
  if(rec && rec.status==="normal") today4=4;
  else if(T.left===0) today4=4;
  else today4=T.idx;
  var v=[today4/4, weekDone/6, Math.min(1,(pl.done||0)/288)];
  /* 이름표와 읽어 주는 글이 같아야 한다. 두 자리에 따로 적으면 갈라진다.
     그래서 이름표를 먼저 짓고 그것을 읽어 주는 글에도 그대로 쓴다. */
  var num=[today4+" / 4 블록", weekDone+" / 6일",
           pl.week+" / 48주"+(pl.behind>0?" · "+pl.behind+"주 밀렸다":"")];
  var say=RING.map(function(g,i){ return g.k+" "+num[i]; }).join(", ");
  var s='<svg viewBox="0 0 120 120" role="img" aria-label="'+esc(say)+'">';
  RING.forEach(function(g,i){
    var c=2*Math.PI*g.r;
    s+='<circle cx="60" cy="60" r="'+g.r+'" fill="none" stroke="var(--line)" stroke-width="'+g.w+'"/>';
    s+='<circle class="rv" cx="60" cy="60" r="'+g.r+'" fill="none" stroke="'+g.c+
       '" stroke-width="'+g.w+'" stroke-linecap="round" stroke-dasharray="'+c.toFixed(1)+
       '" stroke-dashoffset="'+(c*(1-Math.max(0,Math.min(1,v[i])))).toFixed(1)+
       '" transform="rotate(-90 60 60)"/>';
  });
  s+="</svg>";
  s+='<div class="rlab">';
  RING.forEach(function(g,i){
    s+='<div><i style="background:'+g.c+'"></i><b>'+g.k+"</b> "+num[i]+"</div>";
  });
  s+="</div>";
  box.innerHTML=s;
}
