/* 늦게 읽는 묶음. app/late/ 에서 나온다. 손으로 안 고친다. */
var showDone=false;
function renderVerify(){
  $("#vFilter").textContent = showDone?"미해결만 보기":"해결된 항목 보기";
  var lreBox=$("#vLre"), colBox=$("#vColl");
  lreBox.innerHTML=""; colBox.innerHTML="";
  var nL=0,nC=0;
  allDays().forEach(function(d){
    day(d).unres.forEach(function(u,i){
      if(!!u.done!==showDone) return;
      nL++;
      lreBox.appendChild(itemCard(d,u.t,[u.i?"걸린 것: "+u.i:"",u.h?S.names.a+": "+u.h:"",u.w?S.names.b+": "+u.w:""],u));
    });
    day(d).coll.forEach(function(c){
      if(!!c.done!==showDone) return;
      nC++;
      colBox.appendChild(itemCard(d,c.e,["출처: "+c.s,c.q?"궁금한 점: "+c.q:""],c));
    });
  });
  if(!nL) lreBox.innerHTML='<div class="note small">'+(showDone?
    "해결 표시된 항목이 없다.":
    "<b>미해결 LRE 없음.</b> 오늘 탭 아래 미해결 LRE 칸에 적으면 여기로 온다.")+'</div>';
  if(!nC) colBox.innerHTML='<div class="note small">'+(showDone?
    "해결 표시된 항목이 없다.":
    "<b>채집 표현 없음.</b> 블록 4에서 들은 것을 오늘 탭 채집 칸에 적으면 여기로 온다.")+'</div>';
}
function itemCard(d,title,lines,ref){
  var box=el("div","lreitem");
  var h=el("div","hd2");
  var left=el("div"); left.appendChild(el("b",null,title||"(내용 없음)"));
  h.appendChild(left);
  var lab=el("label","small mut"); lab.style.whiteSpace="nowrap";
  var cb=el("input"); cb.type="checkbox"; cb.checked=!!ref.done;
  cb.onchange=function(){
    ref.done=cb.checked;
    if(ref.done && !ref.box){ ref.box=1; ref.due=addDays(today(),1); }
    if(!ref.done){ ref.box=0; ref.due=null; }
    save(); renderVerify();
  };
  lab.appendChild(cb); lab.appendChild(document.createTextNode(" 판정 완료"));
  var acts=el("div","row"); acts.style.gap="8px";
  acts.appendChild(spkBtn(title||"")); acts.appendChild(lab);
  h.appendChild(acts); box.appendChild(h);
  lines.filter(Boolean).forEach(function(t){ box.appendChild(el("div","small mut",t)); });
  box.appendChild(el("div","small mut","기록일 "+d));
  return box;
}
$("#vFilter").onclick=function(){ showDone=!showDone; renderVerify(); };
$("#vCopy").onclick=function(){
  var L=["# 판정 세션 입력","","작성일: "+today(),"",
    "규칙: 채집 항목은 출처 없이 올리지 않는다. 출처가 없으면 판정이 안 된다.","",
    "## 미해결 LRE","","| 기록일 | 우리가 말한 문장 | 무엇이 걸렸나 | "+S.names.a+" | "+S.names.b+" |","|---|---|---|---|---|"];
  var n=0;
  allDays().forEach(function(d){ day(d).unres.forEach(function(u){
    if(u.done) return; n++;
    L.push("| "+d+" | "+u.t+" | "+(u.i||"")+" | "+(u.h||"")+" | "+(u.w||"")+" |");
  });});
  if(!n) L.push("| (없음) | | | | |");
  L.push("","## 채집 표현","","| 기록일 | 표현 | 출처 | 궁금한 점 |","|---|---|---|---|");
  var m=0;
  allDays().forEach(function(d){ day(d).coll.forEach(function(c){
    if(c.done) return; m++;
    L.push("| "+d+" | "+c.e+" | "+c.s+" | "+(c.q||"")+" |");
  });});
  if(!m) L.push("| (없음) | | | |");
  L.push("","미해결 LRE "+n+"건 / 채집 "+m+"건");
  copy(L.join("\n"), $("#vMsg"));
};
var curQ=1;
function qs(q){ if(!S.q["Q"+q]) S.q["Q"+q]={pass:{},rel:{a:{},b:{}}};
  if(!S.q["Q"+q].rel) S.q["Q"+q].rel={a:{},b:{}}; return S.q["Q"+q]; }
function renderQuarter(){
  var tb=$("#qTabs"); tb.innerHTML="";
  [1,2,3,4].forEach(function(q){
    var b=el("button","g"+(q===curQ?" on":""),"Q"+q);
    b.onclick=function(){curQ=q;renderQuarter();}; tb.appendChild(b);
  });
  var st=qs(curQ);
  var box=$("#qPass"); box.innerHTML="";
  PASS[curQ].forEach(function(c){
    var card=el("div","card tight");
    var row=el("div","row");
    var lab=el("div"); lab.style.flex="1"; lab.style.minWidth="200px";
    lab.appendChild(el("div",null,c.l));
    var meta=el("div","small mut"); meta.textContent=c.u+" "+c.need+" 이상 · 기준 "+c.src;
    lab.appendChild(meta); row.appendChild(lab);
    var inp=el("input"); inp.type="number"; inp.style.width="110px"; inp.style.flex="none";
    inp.value=(st.pass[c.k]!=null?st.pass[c.k]:"");
    var tag=el("span","tag");
    function paint(){
      var v=st.pass[c.k];
      if(v==null||v===""){ tag.textContent="미측정"; tag.className="tag"; }
      else if(+v>=c.need){ tag.textContent="통과"; tag.className="tag o"; }
      else { tag.textContent="미통과"; tag.className="tag w"; }
    }
    inp.oninput=function(){ st.pass[c.k]= inp.value===""?null:+inp.value; save(); paint(); summary(); };
    row.appendChild(inp); row.appendChild(tag);
    card.appendChild(row); box.appendChild(card); paint();
  });
  var sum=el("div","note small"); sum.id="qSum"; box.appendChild(sum);
  function summary(){
    var n=PASS[curQ].filter(function(c){var v=st.pass[c.k];return v!=null&&v!==""&&+v>=c.need;}).length;
    sum.textContent="통과 "+n+" / "+PASS[curQ].length+" 트랙. 미통과 트랙은 그대로 그 분기에 남는다. 남는 게 지연이 아니라 설계다.";
  }
  summary();
  $("#qFoot").textContent="기준 표시가 [운용]인 항목은 기준서에 숫자가 없어 이 콘솔에서 정한 값이다. 기준서 개정 시 함께 고친다.";

  var rb=$("#qRel"); rb.innerHTML="";
  [["a",S.names.a],["b",S.names.b]].forEach(function(p){
    var card=el("div","card tight");
    card.appendChild(el("h3",null,jo(p[1],"이","가")+" 적은 것"));
    REL_Q.forEach(function(q){
      var w=el("div"); w.style.margin="8px 0";
      var l=el("label","f",q.l); w.appendChild(l);
      var sel=el("select");
      sel.appendChild(el("option",null,"미기재"));
      q.opt.forEach(function(o){ sel.appendChild(el("option",null,o)); });
      sel.value=st.rel[p[0]][q.k]||"미기재";
      sel.onchange=function(){ st.rel[p[0]][q.k]=sel.value; save(); signals(); };
      w.appendChild(sel); card.appendChild(w);
    });
    rb.appendChild(card);
  });
  signals();

  function signals(){
    var out=$("#qSignal"); out.innerHTML="";
    var A=st.rel.a, B=st.rel.b, hits=[];
    if(A.share==="7대 3 넘음"||B.share==="7대 3 넘음") hits.push("share");
    if((A.fix&&A.fix.indexOf("만")>0)&&(B.fix&&B.fix.indexOf("만")>0)&&A.fix===B.fix) hits.push("fix");
    var prev=S.q["Q"+(curQ-1)];
    if(prev&&prev.rel&&A.lead&&A.lead!=="미기재"&&A.lead!=="비슷"&&prev.rel.a&&prev.rel.a.lead===A.lead) hits.push("lead");
    REL_Q.forEach(function(q){
      var a=A[q.k],b=B[q.k];
      if(a&&b&&a!=="미기재"&&b!=="미기재"&&a!==b&&hits.indexOf("gap")<0) hits.push("gap");
    });
    if(!hits.length){
      out.innerHTML='<div class="note small">걸린 신호 없음. 신호가 없어도 이 표는 매 분기 채운다. 변화를 보려면 정상일 때 값이 남아 있어야 한다.</div>';
      return;
    }
    hits.forEach(function(k){
      var r=RX[k], d=el("div","card tight");
      var h=el("div","row");
      h.appendChild(el("span","tag w",r.t));
      h.appendChild(el("b",null,"처방: "+r.p));
      d.appendChild(h);
      d.appendChild(el("div","small mut",r.d));
      out.appendChild(d);
    });
    out.appendChild(el("div","note small","적용 기간은 2주. 2주 뒤 같은 양식으로 재점검한다. 걸린 신호에 해당하는 처방만 쓴다. 전부 적용하지 않는다."));
    out.appendChild(el("div","note small","이 신호는 '말수가 적다'가 아니라 '고착됐다'를 잡는 장치다. 조용한 사람을 말하게 만드는 게 목적이 아니다."));
  }
}

function renderBadge(){
  var box=$("#badgeList"); if(!box) return;
  var d=DATA.badge;
  if(!d){
    box.innerHTML='<div class="small mut">배지를 여는 중이다.</div>';
    loadData("badge","ENG2P_BADGE",function(){ renderBadge(); });
    return;
  }
  var got=0, h="";
  d.badges.forEach(function(b){
    var st=(S.q&&S.q["Q"+b.quarter]) ? S.q["Q"+b.quarter] : null;
    var pass=st?(st.pass||{}):{};
    var now, ok;
    if(b.kind==="all"){
      now=0;
      (PASS[b.quarter]||[]).forEach(function(c){
        var v=pass[c.k];
        if(v!=null && v!=="" && +v>=c.need) now++;
      });
      ok = now>=b.need;
    }else{
      var v=pass[b.key];
      now = (v==null||v==="") ? null : +v;
      ok = now!=null && now>=b.need;
    }
    if(ok) got++;
    h+='<div class="row" style="justify-content:space-between;align-items:baseline">'+
       '<span'+(b.kind==="all"?' class="badgeall"':'')+'>'+
       (ok?'<b>지났다</b> ':'<span class="mut">아직 </span>')+esc(b.name)+'</span>'+
       '<span class="small mut mono">'+
       (now==null?"미측정":now+" / "+b.need)+' '+esc(b.unit)+'</span></div>';
  });
  box.innerHTML=h;
  var c=$("#badgeCount");
  if(c) c.textContent=got+" / "+d.count+" 를 지났다";
}
var TRANSLIT=["디스","왓","하우","웨어","쓰리","파이브","굿모닝","땡큐","쏘리","플리즈","아이엠"];
var CLICHE=["결론적으로","중요한 것은","핵심은 바로","요약하자면"];
var VAGUE=["자연스러워지면","익숙해지면","감이 오면","편해지면","어느 정도"];
var LEC_BLOCKS=["## 1. 원리","## 2. 한국어 화자 함정","## 3. 역할 지정","## 4. 드릴 연결","## 5. 통과 기준","## 6. 다음 강 예고"];
var B2KEYS=["모음 삽입","음절 박자","구개음화","dark l","표기"];
var CARD_T=["판정형","압박형","확장형","역할형","repair형"];
var ROLE_E=["상황","관계","목적","레지스터","종료"];
var HANGUL=/[가-힣]/;

function kindOf(name){
  var k=[];
  if(/_q\d_l\d{3}\b/.test(name)) k.push("강의");
  if(name.indexOf("card")>=0) k.push("카드");
  if(/_set_/.test(name)) k.push("세트");
  if(/_audio_/.test(name)) k.push("음성 대본");
  return k.length?k.join(", "):"공통만";
}
var AUDIO_META=[
 ["종류",/^종류:\s*(생성 음성|실제 녹음)\s*$/m],
 ["음성 파일",/^음성 파일:\s*[A-Za-z0-9_.\-]+\.(mp3|m4a|wav|mp4|webm)\s*$/m],
 ["화자 수",/^화자 수:\s*\d+\s*$/m],
 ["속도",/^속도:\s*\S+/m],
 ["길이",/^길이:\s*.*\d/m],
 ["트랙",/^트랙:\s*(소리|청크|자동화|문법|화용|repair)\s*$/m],
 ["분기",/^분기:\s*Q[1-4]\s*$/m],
 ["학습용 인공물",/^학습용 인공물:\s*(예|아니오)\s*$/m]
];
var SPK_MAX={Q1:2,Q2:2,Q3:3,Q4:99};
function sect(t,a,b){
  var i=t.indexOf(a); if(i<0) return "";
  var j=t.indexOf(b,i+a.length);
  return t.slice(i, j>0?j:t.length);
}
function runCheck(name,text){
  var F=[],W=[];
  function f(m){F.push(m);} function w(m){W.push(m);}

  if(!/^[A-Za-z0-9_.\-]+$/.test(name)) f("파일명이 ASCII가 아니다");
  [["\u2014","em-dash (U+2014)"],["\uFFFD","U+FFFD"],["\u2013","en-dash (U+2013)"]].forEach(function(p){
    var n=text.split(p[0]).length-1; if(n) f(p[1]+" "+n+"개");
  });
  if(/\\u[0-9a-fA-F]{4}/.test(text)) f("유니코드 이스케이프 발견. 리터럴 UTF-8로 쓴다");
  TRANSLIT.forEach(function(t){
    var i=-1;
    while((i=text.indexOf(t,i+1))>=0){
      var before=text[i-1]||"", after=text[i+t.length]||"";
      if(!HANGUL.test(before)&&!HANGUL.test(after)){ w("한글 음차 의심: "+t); break; }
    }
  });
  CLICHE.forEach(function(c){ if(text.indexOf(c)>=0) w("AI 상투 표현: "+c); });
  var isAudio=/_audio_/.test(name);
  if(!/^신뢰도:\s*[ABC]/m.test(text)) f("신뢰도 등급 표시가 없다 (첫 줄에 '신뢰도: A')");
  if(/^신뢰도:\s*C/m.test(text)&&!isAudio) f("C등급은 제작하지 않는다. 조준표에 채집 지시만 쓴다");
  if(/^신뢰도:\s*B/m.test(text)&&text.indexOf("검증로그:")<0) f("B등급인데 검증로그 항목이 없다");
  ["혼자","각자 알아서","스스로 만들어"].forEach(function(p){
    if(text.indexOf(p)>=0) w("1인 수행 지시 의심: "+p);
  });

  var kind=kindOf(name);

  if(kind.indexOf("강의")>=0){
    var pos=-1;
    LEC_BLOCKS.forEach(function(b){
      var i=text.indexOf(b);
      if(i<0) f("블록 누락: "+b);
      else if(i<pos) f("블록 순서 어긋남: "+b);
      else pos=i;
    });
    var n=text.replace(/\s/g,"").length;
    if(n<2400||n>3600) f("분량 이탈: 공백 제외 "+n+"자 (허용 2400~3600, 목표 2700~3300)");
    else if(n<2700||n>3300) w("목표 분량 밖: 공백 제외 "+n+"자 (목표 2700~3300)");

    var s2=sect(text,"## 2. 한국어 화자 함정","## 3.");
    if(s2&&!/한국어(에서는|는|가)/.test(s2)) f("블록 2에 한국어 간섭의 인과가 없다");
    if(s2&&!B2KEYS.some(function(k){return s2.indexOf(k)>=0;})) w("블록 2가 근거표 밖이다. B등급 표시 확인");

    var s4=sect(text,"## 4. 드릴 연결","## 5.");
    if(s4&&!/\b\d{3}\b/.test(s4)) f("블록 4에 카드 번호가 없다");

    var s5=sect(text,"## 5. 통과 기준","## 6.");
    if(s5){
      if(!/\d/.test(s5)) f("블록 5 통과 기준에 숫자가 없다");
      VAGUE.forEach(function(v){ if(s5.indexOf(v)>=0) f("블록 5에 모호한 기준: "+v); });
    }
    if(name.indexOf("_q1_")>=0&&/^트랙:\s*문법/m.test(text)) f("Q1에 문법 트랙 강의는 없다");
    var s3=sect(text,"## 3. 역할 지정","## 4.");
    if(s3&&(s3.indexOf("A")<0||s3.indexOf("B")<0)) f("블록 3에 A/B 역할이 모두 없다");
  }

  if(kind.indexOf("카드")>=0){
    text.split(/^---$/m).forEach(function(c){
      if(c.indexOf("[A면]")<0&&c.indexOf("[B면]")<0) return;
      var num=c.match(/\[(\d{3})\]/);
      var tag="카드 "+(num?num[1]:"?");
      var t=CARD_T.filter(function(x){return c.indexOf(x)>=0;})[0];
      if(!t){ f(tag+": 유형 표시 없음"); return; }
      var a=sect(c,"[A면]","[B면]"), b=sect(c,"[B면]","\n---");
      [[a,"A면"],[b,"B면"]].forEach(function(p){
        var m=p[0].match(/지시:\s*(.+)/);
        if(m&&(m[1].split(".").length-1)>2) f(tag+" "+p[1]+": 지시문 3문장 초과");
      });
      if(t==="판정형"&&/정답:/.test(b)) f(tag+": 판정형 정답이 B면에 노출됐다");
      if(t==="압박형"&&!/\d+\s*초/.test(c)) f(tag+": 압박형에 제한시간 숫자가 없다");
      if(t==="확장형"&&c.indexOf("변형축:")<0) f(tag+": 확장형에 변형 축이 없다");
      if(t==="역할형") ROLE_E.forEach(function(e){ if(c.indexOf(e)<0) f(tag+": 역할형에 "+e+" 없음"); });
      if(t==="repair형"&&c.indexOf("실패가 정상")<0) f(tag+": repair형에 '실패가 정상' 문구 없음");
    });
  }

  if(kind.indexOf("세트")>=0){
    ["1단계","2단계","3단계","4단계"].forEach(function(s){ if(text.indexOf(s)<0) f("단계 누락: "+s); });
    if(text.indexOf("나는 이렇게 이해했다")<0) f("'나는 이렇게 이해했다' 규칙 문구가 없다");
    if(text.indexOf("LRE")<0) f("4단계에 LRE 기록란이 없다");
    if(!/대응강의:\s*\S+/.test(text)) f("대응 강의 번호가 없다");
  }

  if(text.indexOf("[1층]")>=0&&text.indexOf("학습용 인공물")<0) f("1층 대화에 '학습용 인공물' 표기가 없다");
  if(text.indexOf("[2층]")>=0&&text.indexOf("출처:")<0) f("2층 자료에 출처 표기가 없다");
  if(text.indexOf("[3층]")>=0&&name.indexOf("_q1_")>=0) f("3층 대조판은 Q2부터다");

  if(isAudio){
    var g=text.match(/^신뢰도:\s*(C-gen|C-real)\s*$/m);
    if(!g) f("음성 대본은 신뢰도가 C-gen 또는 C-real 이어야 한다");
    else {
      var gen=g[1]==="C-gen";
      AUDIO_META.forEach(function(m){ if(!m[1].test(text)) f("메타 항목 누락 또는 형식 오류: "+m[0]); });
      if(gen){
        if(!/^학습용 인공물:\s*예\s*$/m.test(text)) f("C-gen 인데 학습용 인공물 표기가 예가 아니다");
        if(text.indexOf("2층")>=0) f("C-gen 은 2층 자료가 될 수 없다. audio_intake.md 1장");
        if(/^트랙:\s*소리\s*$/m.test(text)) w("C-gen 을 소리 트랙에 쓴다. 연습은 되지만 통과 판정에는 못 쓴다");
      }
      var mf=text.match(/^음성 파일:\s*(\S+)$/m);
      if(mf){
        var stem=mf[1].replace(/\.[^.]+$/,"");
        var base=name.replace(/\.[^.]+$/,"");
        if(stem!==base) f("음성 파일 이름이 대본과 다르다: "+stem+" vs "+base);
      }
      var q=text.match(/^분기:\s*(Q[1-4])\s*$/m), sn=text.match(/^화자 수:\s*(\d+)\s*$/m);
      if(q&&sn&&+sn[1]>SPK_MAX[q[1]]) w(q[1]+" 재료 조건보다 화자가 많다 ("+sn[1]+"명)");
      if(text.indexOf("## 대본")<0) f("'## 대본' 절이 없다");
    }
  }

  return {fail:F,warn:W,kind:kind,len:text.replace(/\s/g,"").length};
}
function paintKind(){
  var n=$("#kName").value.trim();
  $("#kKind").value=kindOf(n);
  var t=$("#kText").value;
  $("#kLen").textContent="공백 제외 "+t.replace(/\s/g,"").length+"자";
}
function checkBind(){
  if(checkBind.done){ paintKind(); return; }
  checkBind.done=true;
  $("#kName").oninput=paintKind;
  $("#kText").oninput=paintKind;
  $("#kRun").onclick=checkRun;
  paintKind();
}
function checkRun(){
  var name=$("#kName").value.trim(), text=$("#kText").value;
  if(!text.trim()){ $("#kOut").innerHTML='<div class="note w small">검사할 내용이 없다.</div>'; return; }
  var r=runCheck(name,text);
  var h=['<div class="card"><div class="row" style="margin-bottom:10px">'];
  h.push('<span class="tag '+(r.fail.length?"w":"o")+'">'+(r.fail.length?"실패 "+r.fail.length:"통과")+'</span>');
  h.push('<span class="tag'+(r.warn.length?" a":"")+'">경고 '+r.warn.length+'</span>');
  h.push('<span class="tag">'+esc(r.kind)+'</span>');
  h.push('<span class="tag">공백 제외 '+r.len+'자</span></div>');
  h.push('<div class="res">');
  r.fail.forEach(function(m){ h.push('<span class="f">[실패] '+esc(m)+'</span>\n'); });
  r.warn.forEach(function(m){ h.push('<span class="w2">[경고] '+esc(m)+'</span>\n'); });
  if(!r.fail.length&&!r.warn.length) h.push("걸린 항목 없음.");
  h.push('</div>');
  if(!r.fail.length) h.push('<div class="note small">규격 검사는 형식만 본다. 영어 표현의 현행성은 잡지 못한다. 확신 없는 표현은 B등급으로 표시하고 대화 세션에서 웹 검색으로 검증한다.</div>');
  h.push('</div>');
  $("#kOut").innerHTML=h.join("");
}
function fillSel(id,arr){
  var s=$(id); s.innerHTML="";
  arr.forEach(function(x){
    var o=el("option",null,x[0]+" "+x[1]); o.value=x[0]; s.appendChild(o);
  });
}
function rotCounts(){
  var c={d:{},r:{},f:{},combo:{}};
  S.rot.forEach(function(x){
    c.d[x.d]=(c.d[x.d]||0)+1; c.r[x.r]=(c.r[x.r]||0)+1; c.f[x.f]=(c.f[x.f]||0)+1;
    c.combo[x.d+"-"+x.r+"-"+x.f]=1;
  });
  return c;
}
function rotRound(d){ return S.rot.filter(function(x){return x.d===d;}).length+1; }
function rotFill(){
  if(rotFill.done) return;
  fillSel("#rD",DOM); fillSel("#rR",REL); fillSel("#rF",FUN);
  rotFill.done=true;
}
function renderRot(){
  rotFill();
  var d=$("#rD").value,r=$("#rR").value,f=$("#rF").value,q=+$("#rQ").value;
  var round=rotRound(d), step=Math.min(round,4);
  $("#rLadder").innerHTML="<b>"+esc(d)+" "+esc(round)+"회차</b> · 추상도 "+step+"단계 ("+LEVELS[step-1]+")<br>"+
    esc(LADDER[d][step-1])+(round>4?"<br><span class='mut'>5회차 이상은 추상도를 4단계에 두고 관계와 기능만 바꾼다.</span>":"");

  var c=rotCounts(), n=S.rot.length, out=[];
  var relOpen=REL.filter(function(x){return x[0]===r;})[0][2];
  var funOpen=FUN.filter(function(x){return x[0]===f;})[0][2];
  if(relOpen>q) out.push([r+"는 Q"+relOpen+"부터 연다","분기 허용 밖이다. 다른 관계를 고른다."]);
  if(funOpen>q) out.push([f+"는 Q"+funOpen+"부터 연다","분기 허용 밖이다. 다른 기능을 고른다."]);
  if(c.combo[d+"-"+r+"-"+f]) out.push(["조합 중복","같은 조합은 전 과정에서 한 번만 쓴다."]);
  var dflt=["D01","R2","F10"], hit=[d,r,f].filter(function(x){return dflt.indexOf(x)>=0;});
  if(hit.length>=2) out.push(["기본값 회귀","제작할 때 제일 손이 가는 조합이다. 편하게 써지면 편향 신호로 읽는다."]);
  if(n>=10){
    if((c.r[r]||0)/n>0.3) out.push([r+" 관계 편중","누적 30%를 넘었다. 다음 3개 제작물에서 뺀다."]);
    if((c.f[f]||0)/n>0.2) out.push([f+" 기능 편중","누적 20%를 넘었다. 다음 3개 제작물에서 뺀다."]);
    var ext=["D09","D10","D11","D12"].reduce(function(a,x){return a+(c.d[x]||0);},0);
    if(ext/n<0.15) out.push(["확장 영역 부족","확장 4가 누적 15% 미만이다. 다음 제작물을 D09~D12에서 고른다."]);
  }
  var ab=$("#rAlerts"); ab.innerHTML="";
  if(!out.length) ab.innerHTML='<div class="note small">걸린 경보 없음. 등록해도 된다.</div>';
  else out.forEach(function(o){
    var x=el("div","note w"); x.appendChild(el("b",null,o[0])); x.appendChild(el("div","small",o[1])); ab.appendChild(x);
  });

  var rows=['<tr><th scope="col">축</th><th scope="col">코드</th><th scope="col">이름</th><th scope="col" class="n">등장</th><th scope="col" class="n">비중</th><th scope="col">비고</th></tr>'];
  DOM.forEach(function(x){
    var k=c.d[x[0]]||0;
    rows.push('<tr><td>영역</td><td class="mono">'+x[0]+'</td><td>'+x[1]+'</td><td class="n">'+k+
      '</td><td class="n">'+(n?Math.round(k/n*100):0)+'%</td><td class="small mut">'+x[2]+' · 목표 5회</td></tr>');
  });
  REL.forEach(function(x){
    var k=c.r[x[0]]||0;
    rows.push('<tr><td>관계</td><td class="mono">'+x[0]+'</td><td>'+x[1]+'</td><td class="n">'+k+
      '</td><td class="n">'+(n?Math.round(k/n*100):0)+'%</td><td class="small mut">Q'+x[2]+' 개방</td></tr>');
  });
  FUN.forEach(function(x){
    var k=c.f[x[0]]||0;
    rows.push('<tr><td>기능</td><td class="mono">'+x[0]+'</td><td>'+x[1]+'</td><td class="n">'+k+
      '</td><td class="n">'+(n?Math.round(k/n*100):0)+'%</td><td class="small mut">Q'+x[2]+' 개방</td></tr>');
  });
  $("#rCount").innerHTML=rows.join("");

  var lg=['<tr><th scope="col">제작물</th><th scope="col">분기</th><th scope="col">영역</th><th scope="col">관계</th><th scope="col">기능</th><th scope="col" class="n">회차</th><th scope="col"></th></tr>'];
  if(!S.rot.length) lg.push('<tr><td colspan="7" class="mut">등록 없음. 첫 등록은 Q1 강의 1편에서 발생한다.</td></tr>');
  S.rot.forEach(function(x,i){
    lg.push('<tr><td class="mono">'+esc(x.id)+'</td><td>Q'+x.q+'</td><td class="mono">'+x.d+'</td><td class="mono">'+x.r+
      '</td><td class="mono">'+x.f+'</td><td class="n">'+x.round+'</td><td><button class="del" data-i="'+i+'">삭제</button></td></tr>');
  });
  $("#rLog").innerHTML=lg.join("");
  $("#rLog").querySelectorAll(".del").forEach(function(b){
    b.onclick=function(){
      var i=+b.dataset.i, gone=S.rot.splice(i,1)[0];
      save(); renderRot();
      offerUndo("회전 등록 1건 삭제",function(){ S.rot.splice(i,0,gone); renderRot(); });
    };
  });
}
["#rD","#rR","#rF","#rQ"].forEach(function(s){ $(s).addEventListener("change",renderRot); });
$("#rAdd").onclick=function(){
  var id=$("#rId").value.trim();
  if(!id){ $("#rId").focus(); return; }
  var d=$("#rD").value;
  S.rot.push({id:id,q:+$("#rQ").value,d:d,r:$("#rR").value,f:$("#rF").value,round:rotRound(d),date:today()});
  save(); $("#rId").value=""; renderRot();
};
$("#rRowCopy").onclick=function(){
  var d=$("#rD").value,r=$("#rR").value,f=$("#rF").value;
  var nm=function(a,k){return a.filter(function(x){return x[0]===k;})[0][1];};
  copy("| "+($("#rId").value.trim()||"(ID)")+" | Q"+$("#rQ").value+" | 강의 | "+nm(DOM,d)+" | "+nm(REL,r)+" | "+nm(FUN,f)+" | "+rotRound(d)+" | "+today()+" |",null);
  alert("state/rotation.md 3장에 붙일 한 줄을 복사했다.");
};
