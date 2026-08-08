/* =========================================================================
   오늘 배정. eng2p/out/data/index.js 에서 온다. 손으로 적은 값이 없다.
   ========================================================================= */
var IDX=(window.ENG2P_INDEX)||null;

/* 진도는 달력이 아니라 **수행한 정규 세션 수**로 센다.
   전에는 시작일부터 지난 주 수로 셌다. 사흘 빠지면 안 한 주가 지나간 것으로 나온다.
   두 사람은 12주차라고 듣고 실제로는 9주를 한 상태가 된다.
   비상판은 진도로 안 센다. 15분 인출이고 새 재료가 없다. 매뉴얼 2.2가 그렇게 정한다.
   빠진 것은 지워지는 것이 아니라 미뤄지는 것이다. 밀린 주 수를 따로 보여 준다. */
function doneSessions(){
  var n=0; for(var k in S.days){ if(S.days[k] && S.days[k].status==="normal") n++; }
  return n;
}
function plan(){
  var done=doneSessions();
  var idx=Math.min(done, 287);              // 288세션이 마지막이다
  var week=Math.floor(idx/6)+1, day=(idx%6)+1;
  var calWeek=Math.floor((parseISO(today())-parseISO(S.start))/604800000)+1;
  var out={done:done, session:idx+1, week:week, day:day,
           behind:Math.max(0, Math.min(48,calWeek)-week), finished:done>=288};
  if(IDX && IDX.weeks && IDX.weeks[week-1]){
    var w=IDX.weeks[week-1];
    var dd=(w.days||[])[day-1] || null;
    out.quarter=w.quarter; out.task=w.task; out.sets=w.sets;
    if(dd){
      out.set=dd.set;
      out.lectureNo=dd.lecture;
      var L=(w.lectures||[]).filter(function(x){return x.no===dd.lecture;})[0];
      if(L){ out.title=L.title; out.track=L.track; out.cards=L.cards;
             out.media=L.media; out.emergency=L.emergency; }
    }
  }
  return out;
}

/* =========================================================================
   오늘 한 장. 두 사람이 앉아서 제일 먼저 보는 자리다.
   여기 없는 값은 앱 어디에도 없다. 전부 plan() 이 준 파생값이다.
   ========================================================================= */

/* =========================================================================
   이어서 하기. 끊긴 세션이 있으면 오늘 한 장 위에 뜬다.
   어디서 멈췄는지와 얼마나 남았는지를 적는다. 그것을 모르면 다시 처음부터 하게 된다.
   ========================================================================= */

/* =========================================================================
   오늘 못 하는 날. 비상판 15분으로 바로 간다.
   기준서 11.2. 이 과정 유일한 1인 예외이고 학습 장치가 아니라 연속성 장치다.
   **찾게 하면 그날은 그냥 쉰다.** 그래서 첫 화면에서 한 번에 간다.
   ========================================================================= */
/* 큰 자료는 첫 화면에 안 물린다. 카드 562KB, 세트 493KB, 강의 301KB 다.
   쓸 때 가져온다. fetch 를 안 쓴다. file:// 에서 막힌다.
   script 를 꽂는 방식은 Pages 에서도 file:// 에서도 된다. */
var DATA={}, loading={};
function loadData(name, global, cb){
  if(window[global]){ DATA[name]=window[global]; return cb(DATA[name]); }
  if(loading[name]){ loading[name].push(cb); return; }
  loading[name]=[cb];
  var s=document.createElement("script");
  s.src="eng2p/out/data/"+name+".js";
  function done(ok){
    var v=ok?window[global]:null; DATA[name]=v;
    var qs=loading[name]||[]; loading[name]=null;
    qs.forEach(function(f){ f(v); });
  }
  s.onload=function(){ done(true); };
  s.onerror=function(){ done(false); };
  document.head.appendChild(s);
}
var EMG=null;
function loadEmg(cb){ loadData("emergency","ENG2P_EMERGENCY",function(v){ EMG=v; cb(!!v); }); }
function renderEmg(pl){
  var line=$("#emgLine"), box=$("#emgBox");
  if(!line||!box) return;
  var rec=day(today());
  if(rec.status==="emg"){
    line.innerHTML='<button type="button" id="emgClose">비상판을 쓴 날로 적었다. 되돌리기</button>';
    $("#emgClose").onclick=function(){ rec.status=null; S.emgOpen=false; save(); renderToday(); };
  } else if(S.emgOpen){
    line.innerHTML='<button type="button" id="emgHide">접기</button>';
    $("#emgHide").onclick=function(){ S.emgOpen=false; save(); renderToday(); };
  } else {
    box.innerHTML="";
    if(pl.emergency==null){
      line.innerHTML='<span class="small mut">이 강에는 비상판이 없다. '+
        '상대가 없으면 앞 번호를 하나 꺼내 쓴다.</span>';
      return;
    }
    line.innerHTML='<button type="button" id="emgOpen">오늘 상대가 없다. 비상판 15분으로</button>';
    $("#emgOpen").onclick=function(){ S.emgOpen=true; save(); renderToday(); };
    return;
  }
  if(pl.emergency==null){ box.innerHTML=""; return; }
  box.innerHTML='<div class="small mut">비상판을 여는 중이다.</div>';
  loadEmg(function(ok){
    if(!ok){
      box.innerHTML='<div class="emgbox"><div class="small mut">'+
        '비상판 자료를 못 읽었다. eng2p/out/data/emergency.js 경로를 확인한다.</div></div>';
      return;
    }
    var it=(EMG.items||[]).filter(function(x){return x.no===pl.emergency;})[0];
    if(!it){ box.innerHTML=""; return; }
    box.innerHTML='<div class="emgbox">'+
      '<div class="k">비상판 '+String(it.no).padStart(3,"0")+' · 15분 · 혼자 한다</div>'+
      '<h4>'+esc(it.title)+'</h4>'+
      '<p><b>인출 10분.</b> '+esc(it.pull)+'</p>'+
      '<div class="ch"><b>청크 5분</b><br>'+esc((it.chunks||[]).join("  /  "))+'</div>'+
      '<p class="small mut">쓴 날도 수행일로 센다. 다만 진도는 안 나간다. '+
      '새 재료가 없기 때문이다.</p>'+
      '<div style="margin-top:12px"><button class="g" id="emgMark" type="button">'+
      (day(today()).status==="emg"?"적음":"비상판을 쓴 날로 적기")+'</button></div></div>';
    var mk=$("#emgMark");
    if(mk) mk.onclick=function(){ day(today()).status="emg"; save(); renderToday(); };
  });
}

function renderResume(pl){
  var box=$("#resumeBox"); if(!box) return;
  var s=S.session, started=(T.idx>0||T.left<BLOCKS[0].m*60);
  if(!s || s.date!==today() || !started){ box.innerHTML=""; return; }
  var b=BLOCKS[T.idx];
  box.innerHTML='<div class="resume"><div>'+
    '<b>블록 '+(T.idx+1)+' '+esc(b.n)+'에서 멈췄다</b>'+
    '<div class="small">이 블록에 '+Math.ceil(T.left/60)+'분, 세션 전체로 '+
    sessionLeftMin()+'분 남았다</div></div>'+
    '<button class="g" id="resumeGo" type="button">이어서 하기</button></div>';
  var go=$("#resumeGo"); if(go) go.onclick=function(){ $("#tOne").click(); };
}

/* 기록 묶음. 세션이 끝났거나 손으로 펴면 보인다.
   첫 화면은 오늘 할 것만 보여 준다. 앉자마자 입력 폼을 보면 적을 것을 찾게 된다. */

/* =========================================================================
   블록 6 기록. 그날 값을 그 강의 통과 기준 옆에 놓는다.
   **따로 놓으면 대조를 안 한다.** 숫자를 적어 놓고 기준은 종이에서 찾아야 하면
   그 자리에서 안 찾고 나중에도 안 찾는다.
   통과선이 있는 항목은 넣는 즉시 갈린다. 없는 항목은 손으로 판정한다고 적는다.
   ========================================================================= */
function critRec(){
  var r=day(today());
  if(!r.crit) r.crit={};
  return r.crit;
}
function critJudge(th, v){
  if(th==null || v==="" || v==null) return null;
  var n=+v; if(isNaN(n)) return null;
  if(th.op==="min") return n>=th.value;
  if(th.op==="max") return n<=th.value;
  return n===th.value;
}

/* =========================================================================
   블록 7 마무리. 다음 날 배정을 여기서 알린다.
   끝난 자리에서 다음이 보이면 내일 앉자마자 시작한다.
   **끝났다는 말만 있으면 내일 다시 찾는 일부터 한다.** D구간에서 고친 것과 같은 문제다.
   진도가 이미 올랐으므로 plan() 이 곧 다음 날 것이다.
   ========================================================================= */
function renderNextDay(){
  var box=$("#nextDay"); if(!box) return;
  var pl=plan();
  if(pl.finished){
    box.innerHTML='<b>288세션을 다 했다.</b><div class="m">96강이 끝났다. 카드는 계속 돈다.</div>';
    return;
  }
  var due=dueCards().length;
  var bits=[];
  if(pl.set) bits.push("세트 "+esc(pl.set));
  if(pl.cards) bits.push("카드 "+String(pl.cards.from).padStart(3,"0")+" ~ "+
                          String(pl.cards.to).padStart(3,"0"));
  if(pl.media) bits.push("미디어 "+esc(pl.media));
  box.innerHTML='<b>다음은 '+pl.lectureNo+'강 '+esc(pl.title||"")+'</b>'+
    '<div class="m">'+esc(pl.quarter||"")+' · '+esc(pl.track||"")+' 트랙 · '+
    pl.week+'주 '+pl.day+'일째 · '+bits.join(" · ")+'</div>'+
    (due? '<div class="m">다시 낼 카드가 '+due+'장 밀려 있다.</div>' : "");
}

function renderCrit(){
  var box=$("#critBox"); if(!box) return;
  var rec=day(today());
  var open = S.recOpen===true || rec.status;
  if(!open){ box.innerHTML=""; return; }
  var lec=DATA.lectures;
  if(!lec){ loadData("lectures","ENG2P_LECTURES",function(){ renderCrit(); }); 
            box.innerHTML='<div class="card tight small mut">통과 기준을 여는 중이다.</div>'; return; }
  var pl=plan();
  var L=(lec.items||[]).filter(function(x){return x.no===pl.lectureNo;})[0];
  if(!L || !L.criteria || !L.criteria.length){ box.innerHTML=""; return; }
  var m=critRec();
  var h='<div class="card"><b>'+pl.lectureNo+'강 통과 기준</b>'+
    '<div class="small mut" style="margin-top:3px">오늘 값을 넣으면 그 자리에서 갈린다. '+
    '선이 없는 항목은 두 사람이 판정한다.</div>';
  L.criteria.forEach(function(c){
    var v=m[c.no]==null?"":m[c.no];
    var ok=critJudge(c.threshold,v);
    var mark = c.threshold==null ? '<span class="v hand">손으로</span>'
             : ok===null ? '<span class="v hand">-</span>'
             : ok ? '<span class="v ok">통과</span>' : '<span class="v no">미달</span>';
    var line=esc(c.text);
    /* 부등호를 말로 쓴다. 기호가 글꼴에 없으면 네모로 나오고 뜻이 뒤집혀도 모른다. T152 */
    if(c.threshold) line+=' <b>'+c.threshold.value+
      (c.threshold.op==="min"?" 이상":c.threshold.op==="max"?" 이하":" 정확히")+'</b>';
    h+='<div class="critrow"><div class="t">'+line+'</div>'+
       '<input type="number" step="1" data-crit="'+c.no+'" value="'+esc(v)+'">'+
       mark+'</div>';
  });
  var judged=L.criteria.filter(function(c){return c.threshold;});
  var pass=judged.filter(function(c){return critJudge(c.threshold,m[c.no])===true;}).length;
  h+='<div class="small mut" id="critSum" style="margin-top:10px"></div></div>';
  box.innerHTML=h;
  /* 요약은 따로 갱신한다. 값을 넣을 때마다 전체를 다시 그리면 커서가 튄다. */
  function sum(){
    var m2=critRec();
    var ok=judged.filter(function(c){return critJudge(c.threshold,m2[c.no])===true;}).length;
    var el=$("#critSum"); if(!el) return;
    el.textContent="선이 있는 항목 "+judged.length+"개 중 "+ok+"개 통과. 나머지 "+
      (L.criteria.length-judged.length)+"개는 손으로 판정한다.";
  }
  sum();
  box.querySelectorAll("[data-crit]").forEach(function(el){
    el.oninput=function(){
      var r=critRec();
      if(el.value==="") delete r[el.dataset.crit]; else r[el.dataset.crit]=+el.value;
      save();
      /* 다시 그리면 커서가 튄다. 그 줄의 판정만 바꾼다. */
      var c=L.criteria.filter(function(x){return String(x.no)===el.dataset.crit;})[0];
      var v=el.parentNode.querySelector(".v");
      var ok=critJudge(c.threshold, el.value);
      v.className="v "+(c.threshold==null?"hand":ok===null?"hand":ok?"ok":"no");
      v.textContent = c.threshold==null?"손으로":ok===null?"-":ok?"통과":"미달";
      sum();
    };
  });
}

function renderRecGate(rec){
  var gate=$("#recGate"), card=$("#recCard");
  if(!gate||!card) return;
  var open = S.recOpen===true || (rec && rec.status);
  gate.hidden=!!open; card.hidden=!open;
}

function renderSheet(pl){
  var box=$("#todaySheet"); if(!box) return;
  if(!IDX){
    box.innerHTML='<div class="small mut">차림표를 못 읽었다. '+
      'eng2p/out/data/index.js 경로를 확인한다.</div>';
    return;
  }
  if(pl.finished){
    box.innerHTML='<div class="lec"><b>288세션을 다 했다.</b></div>'+
      '<div class="tk">96강이 끝났다. 카드는 계속 돈다.</div>';
    return;
  }
  var g=[];
  function cell(k,v){ if(v==null||v==="") return;
    g.push('<div class="g"><div class="k">'+esc(k)+'</div><div class="v">'+esc(v)+'</div></div>'); }
  cell("세트", pl.set);
  function pad3(n){ return String(n).padStart(3,"0"); }
  // 카드는 자료에서 [041] 처럼 세 자리다. 화면이 41 이라고 하면 두 사람이 그것을 찾는다.
  cell("카드", pl.cards ? pad3(pl.cards.from)+" ~ "+pad3(pl.cards.to) : null);
  cell("미디어", pl.media);
  cell("과제 분량", pl.task ? pl.task.minChars+"자" : null);
  cell("비상판", pl.emergency!=null ? String(pl.emergency) : "없는 강");
  /* 다시 낼 날이 된 카드. 오늘 범위 밖의 것도 있다. 그것을 안 보여 주면 간격이 무너진다. */
  var dn=dueCards().length;
  if(dn) cell("다시 낼 카드", dn+"장");

  var h='<div class="lec"><b>'+pl.lectureNo+'강</b> '+esc(pl.title||"")+'</div>'+
        '<div class="tk">'+esc(pl.quarter||"")+' · '+esc(pl.track||"")+' 트랙 · '+
        pl.week+'주 '+pl.day+'일째 · 오늘이 '+pl.session+'번째 세션이다</div>'+
        '<div class="grid">'+g.join("")+'</div>'+
        band(pl);
  box.innerHTML=h;
}

/* 48주 띠. 한 줄로 1년이 다 보인다. 분기마다 명암을 바꾼다. */
function band(pl){
  var s='<div class="weekband">';
  for(var w=1;w<=48;w++){
    var c=[]; if(w<pl.week) c.push("done"); if(w===pl.week) c.push("now");
    if(w%12===0 && w<48) c.push("qend");
    s+='<i class="'+c.join(" ")+'"></i>';
  }
  s+='</div><div class="bandnote"><span>1주</span>';
  s+='<span>'+(pl.behind>0 ? "달력보다 "+pl.behind+"주 밀렸다" :
                pl.week>1 ? (pl.week-1)+"주 마쳤다" : "시작 주다")+'</span>';
  s+='<span>48주</span></div>';
  return s;
}

function hoursOf(rec){ return !rec||!rec.status?0: rec.status==="normal"?2: rec.status==="emg"?0.25:0; }
function toast(m){ var f=$("#fMsg"); if(f){f.textContent=m; setTimeout(function(){f.textContent="자동 저장된다";},2600);} }

/* 삭제 되돌리기. 실수로 지운 기록을 다시 적게 하지 않는다. */
var UNDO={box:null,t:null};
function offerUndo(label,restore){
  if(UNDO.box) UNDO.box.remove();
  clearTimeout(UNDO.t);
  var d=el("div","undo");
  d.appendChild(el("span",null,label));
  var b=el("button",null,"실행 취소");
  b.onclick=function(){ restore(); save(); d.remove(); UNDO.box=null; };
  d.appendChild(b);
  document.body.appendChild(d); UNDO.box=d;
  UNDO.t=setTimeout(function(){ if(UNDO.box===d){ d.remove(); UNDO.box=null; } },7000);
}
function copy(text,msgEl){
  function ok(){ if(msgEl){msgEl.textContent="복사됨"; setTimeout(function(){msgEl.textContent="";},2000);} }
  if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(ok,fallback); }
  else fallback();
  function fallback(){
    var t=document.createElement("textarea"); t.value=text;
    t.style.position="fixed"; t.style.opacity="0"; document.body.appendChild(t);
    t.select(); try{document.execCommand("copy"); ok();}catch(e){} document.body.removeChild(t);
  }
}
/* 이름 뒤 조사. 받침이 있으면 이/은/을, 없으면 가/는/를. */
function jo(name,withJ,without){
  var s=String(name||"");
  if(!s) return s+without;
  var c=s.charCodeAt(s.length-1);
  var has=(c>=0xAC00&&c<=0xD7A3) ? ((c-0xAC00)%28)!==0 : false;
  return s+(has?withJ:without);
}
function monday(d){ var x=parseISO(d); var w=(x.getDay()+6)%7; x.setDate(x.getDate()-w); return iso(x); }

