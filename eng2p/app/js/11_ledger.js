/* =========================================================================
   글자 크기 세 단.

   화면의 글자를 다 `rem` 으로 적어 뒀다. 여기서 뿌리 크기만 바꾸면 다 따라온다.
   **기기마다 따로 정한다.** 두 사람의 눈이 다르고 기기도 다르다.
   그래서 다른 기록과 달리 이 값은 주고받지 않는다.
   ========================================================================= */
function applyFs(){
  var v=+(S.fs||0);
  if(v) document.documentElement.setAttribute("data-fs",String(v));
  else document.documentElement.removeAttribute("data-fs");
  document.querySelectorAll("#fsPick button").forEach(function(b){
    var on=(+b.dataset.fs===v);
    b.classList.toggle("on",on);
    b.setAttribute("aria-pressed",on?"true":"false");
  });
}
document.querySelectorAll("#fsPick button").forEach(function(b){
  b.onclick=function(){ S.fs=+b.dataset.fs; saveNow(); applyFs(); };
});

/* =========================================================================
   대장 탭
   ========================================================================= */
function allDays(){ return Object.keys(S.days).sort(); }
function totalHours(){ return allDays().reduce(function(a,d){return a+hoursOf(S.days[d]);},0); }

function renderLedger(){
  $("#sStart").value=S.start; $("#sNameA").value=S.names.a; $("#sNameB").value=S.names.b;
  var th=totalHours();
  var weeks=Math.max(1,Math.floor((parseISO(today())-parseISO(S.start))/604800000)+1);
  var norm=0,emg=0,abs=0,lre=0;
  allDays().forEach(function(d){var r=S.days[d];
    if(r.status==="normal")norm++; else if(r.status==="emg")emg++; else if(r.status==="absent")abs++;
    lre+=r.lre||0;});
  var sc=$("#statCards"); sc.innerHTML="";
  [["누적 시간",th.toFixed(2).replace(/\.?0+$/,"")+"h","총량 576h · 분기선 144/288/432/576"],
   ["주차",weeks+" / 48",""],
   ["수행일",norm+"일","비상판 "+emg+" · 결석 "+abs],
   ["LRE 누적",lre+"회","활동량 기록"]
  ].forEach(function(x){
    var c=el("div","card tight");
    c.appendChild(el("div","small mut",x[0]));
    var v=el("div",null,x[1]); v.style.fontSize="21px"; v.style.fontWeight="650"; v.className="mono";
    c.appendChild(v);
    if(x[2]) c.appendChild(el("div","small mut",x[2]));
    sc.appendChild(c);
  });
  drawChart(); renderWeek(); renderAlerts();
}
["#sStart","#sNameA","#sNameB"].forEach(function(s){
  $(s).oninput=function(){
    S.start=$("#sStart").value||S.start;
    S.names.a=$("#sNameA").value||"A"; S.names.b=$("#sNameB").value||"B";
    save(); renderToday();
  };
});

function drawChart(){
  var W=640,H=190,P={l:34,r:10,t:12,b:20};
  var maxW=48, maxH=760;
  function x(w){ return P.l+(w/maxW)*(W-P.l-P.r); }
  function y(h){ return H-P.b-(h/maxH)*(H-P.t-P.b); }
  var pts=[],cum=0;
  var start=parseISO(S.start);
  var byWeek={};
  allDays().forEach(function(d){
    var wk=Math.floor((parseISO(d)-start)/604800000);
    if(wk<0) wk=0;
    byWeek[wk]=(byWeek[wk]||0)+hoursOf(S.days[d]);
  });
  var lastWk=Math.max(0,Math.floor((parseISO(today())-start)/604800000));
  for(var w=0;w<=Math.min(maxW,lastWk);w++){ cum+=byWeek[w]||0; pts.push([w+1,cum]); }
  var actual=pts.map(function(p){return x(p[0])+","+y(p[1]);}).join(" ");
  var svg=[
    '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="누적 학습 시간">',
    '<defs><linearGradient id="actg" x1="0" y1="0" x2="1" y2="0">'+
    '<stop offset="0" stop-color="var(--a1)"/><stop offset="1" stop-color="var(--a3)"/></linearGradient></defs>',
    '<line class="ax" x1="'+P.l+'" y1="'+y(0)+'" x2="'+(W-P.r)+'" y2="'+y(0)+'"/>',
    '<line class="ax" x1="'+P.l+'" y1="'+P.t+'" x2="'+P.l+'" y2="'+y(0)+'"/>'
  ];
  [0,144,288,432,576].forEach(function(h){
    svg.push('<text x="2" y="'+(y(h)+3)+'">'+h+'</text>');
    if(h>0) svg.push('<line class="ax" x1="'+P.l+'" y1="'+y(h)+'" x2="'+(W-P.r)+'" y2="'+y(h)+'" opacity=".45"/>');
  });
  [12,24,36,48].forEach(function(w){
    var anchor = w===maxW ? "end" : "middle";
    svg.push('<text x="'+x(w)+'" y="'+(H-6)+'" text-anchor="'+anchor+'">'+w+'주</text>');
  });
  svg.push('<polyline class="tgt" points="'+x(0)+","+y(0)+" "+x(48)+","+y(576)+'"/>');
  if(pts.length) svg.push('<polyline class="act" points="'+x(0)+","+y(0)+" "+actual+'"/>');
  svg.push('</svg>');
  $("#chart").innerHTML=svg.join("");
}

function renderWeek(){
  var base=monday(today());
  var start=addDays(base, S.wk*7);
  $("#wLabel").textContent=start+" ~ "+addDays(start,6);
  var names=["월","화","수","목","금","토","일"];
  var rows=['<tr><th scope="col">일자</th><th scope="col">요일</th><th scope="col">오늘 A</th><th scope="col">수행</th><th scope="col" class="n">발화</th><th scope="col" class="n">드릴</th><th scope="col" class="n">LRE</th><th scope="col" class="n">미해결</th></tr>'];
  var sp=0,cd=0,lr=0,hh=0;
  for(var i=0;i<7;i++){
    var d=addDays(start,i), r=S.days[d];
    var st=!r||!r.status?"-":r.status==="normal"?"정상":r.status==="emg"?"비상판":"결석";
    var role=roleOf(d)==="a"?S.names.a:S.names.b;
    sp+=r?(r.speak||0):0; cd+=r?(r.cards||0):0; lr+=r?(r.lre||0):0; hh+=hoursOf(r);
    var un=r?r.unres.length:0;
    rows.push('<tr'+(d===today()?' style="background:var(--sub)"':'')+'><td class="mono">'+d.slice(5)+'</td><td>'+names[i]+
      '</td><td>'+esc(i===6?"점검":role)+'</td><td>'+st+
      '</td><td class="n">'+(r&&r.speak?r.speak:"")+'</td><td class="n">'+(r&&r.cards?r.cards:"")+
      '</td><td class="n">'+(r&&r.lre?r.lre:"")+'</td><td class="n">'+(un||"")+'</td></tr>');
  }
  rows.push('<tr><td colspan="4"><b>합계</b> <span class="mut small">'+hh.toFixed(2).replace(/\.?0+$/,"")+'h</span></td><td class="n"><b>'+sp+'</b></td><td class="n"><b>'+cd+'</b></td><td class="n"><b>'+lr+'</b></td><td></td></tr>');
  $("#weekTable").innerHTML=rows.join("");
}
$("#wPrev").onclick=function(){S.wk--;save();renderWeek();renderAlerts();};
$("#wNext").onclick=function(){S.wk++;save();renderWeek();renderAlerts();};

function renderAlerts(){
  var box=$("#alerts"); box.innerHTML="";
  var ds=allDays(); var out=[];
  var runAbs=0,runEmg=0,maxAbs=0,maxEmg=0;
  // 실제 달력 연속으로 센다. 기록이 없는 날은 끊긴 것으로 보지 않는다.
  if(ds.length){
    var cur=ds[0], end=today();
    while(cur<=end){
      var r=S.days[cur];
      runAbs = (r&&r.status==="absent")?runAbs+1:0;
      runEmg = (r&&r.status==="emg")?runEmg+1:0;
      maxAbs=Math.max(maxAbs,runAbs); maxEmg=Math.max(maxEmg,runEmg);
      cur=addDays(cur,1);
    }
  }
  if(maxAbs>=2) out.push(["결석 연속 "+maxAbs+"일","즉시 다음 날 비상판이라도 수행한다. 원인을 주간 점검에 적는다."]);
  if(maxEmg>=3) out.push(["비상판 "+maxEmg+"일","주간 점검에서 원인을 기록한다."]);
  else if(maxEmg>=2) out.push(["비상판 연속 2일","경고. 다음 날은 정규 세션으로 돌아온다."]);
  var withStatus=ds.filter(function(d){return S.days[d].status;});
  if(!withStatus.length) out.push(["기록 없음","오늘 탭에서 수행 여부부터 누른다."]);
  if(!out.length){ box.innerHTML='<div class="note small"><b>걸린 경보 없음.</b> '+
    '수행 기록이 쌓이면 밀림과 편중을 여기서 알린다.</div>'; return; }
  out.forEach(function(o){
    var d=el("div","note w");
    d.appendChild(el("b",null,o[0])); d.appendChild(el("div","small",o[1]));
    box.appendChild(d);
  });
}

$("#exJson").onclick=function(){
  var blob=new Blob([JSON.stringify(S,null,2)],{type:"application/json"});
  var a=el("a"); a.href=URL.createObjectURL(blob); a.download="eng2p_ledger_"+today()+".json";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(a.href);},1000);
};
$("#exMd").onclick=function(){
  var L=["# eng2p 진행 대장 내보내기","","생성일: "+today(),"시작일: "+S.start,
    "누적 시간: "+totalHours()+"h","",
    "| 일자 | 오늘 A | 수행 | 발화(분) | 드릴(장) | LRE | 미해결 |","|---|---|---|---|---|---|---|"];
  allDays().forEach(function(d){
    var r=S.days[d];
    L.push("| "+d+" | "+(roleOf(d)==="a"?S.names.a:S.names.b)+" | "+
      (r.status==="normal"?"정상":r.status==="emg"?"비상판":r.status==="absent"?"결석":"-")+
      " | "+(r.speak||0)+" | "+(r.cards||0)+" | "+(r.lre||0)+" | "+r.unres.length+" |");
  });
  copy(L.join("\n"), $("#fMsg"));
  alert("대장 마크다운을 복사했다.");
};
/* 합치기. **덮는 것이 아니다.** docs/merge.md 가 갈래 넷을 정했다. T237 */
$("#mgBtn").onclick=function(){ $("#mgFile").click(); };
$("#mgFile").onchange=function(e){
  var f=e.target.files[0]; if(!f) return;
  var r=new FileReader();
  r.onload=function(){
    try{
      var o=JSON.parse(r.result);
      if(!o.days) throw 0;
      MG.plan=mergePlan(S,o); MG.pick={}; MG.name=f.name;
      renderMerge();
      $("#mgBox").scrollIntoView({block:"nearest"});
    }catch(err){ alert("JSON 형식이 아니다."); }
  };
  r.readAsText(f); e.target.value="";
};
$("#imBtn").onclick=function(){ $("#imFile").click(); };
$("#imFile").onchange=function(e){
  var f=e.target.files[0]; if(!f) return;
  var r=new FileReader();
  r.onload=function(){
    try{
      var o=JSON.parse(r.result);
      if(!o.days) throw 0;
      if(!confirm("현재 기록을 통째로 덮어쓴다. 합치기가 아니다. 진행할까.")) return;
      /* **덮어쓰기 전 것을 들고 있는다.** 물음을 하나 두는 것으로는 모자란다.
         엉뚱한 파일을 골랐어도 물음은 똑같이 뜨고 똑같이 예를 누른다.
         무엇이 덮였는지는 덮은 뒤에야 보인다. T184 */
      var before=JSON.stringify(S);
      S=o; var b=blank(); for(var k in b) if(!(k in S)) S[k]=b[k];
      saveNow(); renderToday(); renderLedger();
      offerUndo("기록을 가져왔다",function(){
        S=JSON.parse(before); saveNow(); renderToday(); renderLedger();
      });
    }catch(err){ alert("JSON 형식이 아니다."); }
  };
  r.readAsText(f); e.target.value="";
};
$("#wipe").onclick=function(){
  if(!confirm("전체 기록을 지운다. 되돌릴 수 없다.")) return;
  if(!confirm("정말 지울까. JSON 내려받기를 먼저 하는 게 낫다.")) return;
  wipeStore(); renderToday(); renderLedger();
};

