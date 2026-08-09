/* =========================================================================
   자료. 조준표.
   음성은 만들지 않고 겨눈다. 저장 사본은 재배포 권리를 확인한 것만 올린다.
   ========================================================================= */
var SOURCES=[
 {n:"VOA Learning English", lic:"퍼블릭 도메인. 교육과 상업 목적 재배포 허용. 출처 표기 필요",
  u:"https://learningenglish.voanews.com",
  good:"Q1 주력. Level One 은 어휘 1500단어에 속도가 느리고 대본이 같이 온다. 소리 트랙과 청크 트랙 둘 다 된다. Let's Learn English 52과는 이미 미디어 탭에 받아 두었다. C-real 이라 Q1 통과 판정에 쓸 수 있다.",
  bad:"낭독 뉴스라 실제 대화의 겹침과 중단이 없다. 2층 자료로는 못 쓴다."},
 {n:"LibriVox", lic:"퍼블릭 도메인 오디오북. 자원 봉사 녹음",
  u:"https://librivox.org",
  good:"원문 텍스트가 있어 소리와 글자를 붙일 수 있다. 강세 박자 관찰에 좋다. 화자가 많아 목소리 변이를 준다.",
  bad:"낭독체다. 녹음 품질이 들쭉날쭉하다. 2층 아님."},
 {n:"Santa Barbara Corpus of Spoken American English", lic:"CC BY-ND 3.0 US. 가공 금지. 자르거나 편집해서 재배포하지 않는다",
  u:"https://www.linguistics.ucsb.edu/research/santa-barbara-corpus-spoken-american-english",
  good:"2층 전용이다. 미국 각지의 자연 대화 60건, 각 20분 내외. 전사가 무료이고 인토네이션 단위로 타임스탬프가 붙어 있어 어디서 끊기고 겹치는지 눈으로 확인된다.",
  bad:"Q1에는 너무 빠르다. Q2 3층 대조판부터 쓴다. 음성은 Internet Archive 사본을 쓴다: https://archive.org/details/santabarbara_201509"}
];
var SRC_COND={
 1:{len:"2~4분",spd:"느림. Level One 급",spk:"1~2인",top:"일상, 집, 음식",
    types:["VOA Learning English Level One 기사","LibriVox 단편 낭독","교과서 부속 음원","느린 속도 뉴스 낭독","동일 화자의 짧은 독백"]},
 2:{len:"3~6분",spd:"보통보다 약간 느림",spk:"2인",top:"일상, 관계, 일",
    types:["VOA Level Two","인터뷰 형식 낭독","오디오북 대화 장면","교육용 대담","같은 주제 다른 화자 2종"]},
 3:{len:"5~10분",spd:"보통",spk:"2~3인",top:"판단, 돈, 가르침",
    types:["VOA Level Three","Santa Barbara Corpus 발췌 구간","공개 강연","패널 대담","오디오북 다인 낭독"]},
 4:{len:"10분 이상",spd:"제한 없음",spk:"3인 이상",top:"전 영역",
    types:["Santa Barbara Corpus 전체","공개 회의 녹음","자유 대담","다지역 화자 모음","속도 무보정 자료"]}
};
var SRC_PASS=[
 ["1회","소리","어디가 줄었는지만 찾는다. 무슨 말인지는 묻지 않는다.","각자 표시한 지점을 대조한다"],
 ["2회","청크","통째로 굴러가는 덩어리를 찾는다. 단어로 쪼개지 않는다.","각자 3개씩 적고 겹치는 것을 본다"],
 ["3회","의미","이제 내용을 잡는다. 앞의 두 회차가 먼저다.","한 사람이 요약하고 다른 사람이 보탠다"]
];
var MPAIRS=[
 {t:"/r/ 와 /l/", why:"한국어 유음 하나가 둘을 다 덮어서 구분이 안 된다", w:[["right","light"],["rock","lock"],["pray","play"],["correct","collect"]]},
 {t:"/f/ 와 /p/", why:"한국어에 순치 마찰음이 없어서 파열음으로 대치한다", w:[["fan","pan"],["coffee","copy"],["fool","pool"],["four","pour"]]},
 {t:"/v/ 와 /b/", why:"같은 이유로 유성 순치 마찰음이 파열음이 된다", w:[["van","ban"],["vest","best"],["curve","curb"],["very","berry"]]},
 {t:"/th/ 와 /s/", why:"한국어에 치간 마찰음이 없다", w:[["think","sink"],["thick","sick"],["mouth","mouse"],["path","pass"]]},
 {t:"/sh/ 와 /s/", why:"한국어 구개음화 규칙이 전이돼 앞모음 앞에서 갈린다", w:[["she","see"],["sheet","seat"],["ship","sip"],["shore","sore"]]},
 {t:"긴 i 와 짧은 i", why:"한국어는 길이로 이 둘을 가르지 않는다", w:[["sheep","ship"],["seat","sit"],["feel","fill"],["leave","live"]]},
 {t:"a 와 e", why:"한국어 모음 체계에 중간값이 없어 하나로 뭉친다", w:[["bad","bed"],["sat","set"],["man","men"],["had","head"]]},
 {t:"자음군", why:"한국어 음절 구조가 자음군을 허용하지 않아 모음을 끼워 넣는다", w:[["street","street"],["sprint","sprint"],["glimpse","glimpse"],["asked","asked"]]}
];
var curSrcQ=1;

var REPO="https://github.com/Chemistreal/study64-report/blob/main/eng2p/";
var DOCS=[
 {g:"강의 24편", n:"01강부터 24강. 소리 15, 청크 4, repair 3, 화용 2",
  f:(function(){var a=[];for(var i=1;i<=24;i++){var s=("00"+i).slice(-3);
    a.push({t:("0"+i).slice(-2)+"강", u:"out/lectures/eng2p_q1_l"+s+".md"});}return a;})()},
 {g:"드릴 카드 150장", n:"판정 75, 압박 25, 확장 20, 역할 10, repair 20",
  f:[{t:"001-050",u:"out/cards/eng2p_card_q1_001_050.md"},
     {t:"051-100",u:"out/cards/eng2p_card_q1_051_100.md"},
     {t:"101-150",u:"out/cards/eng2p_card_q1_101_150.md"},
     {t:"배정표",u:"out/cards/eng2p_card_plan_q1.md"}]},
 {g:"대조 교차 세트 72개", n:"주 6세트. 한 파일이 한 주다",
  f:(function(){var a=[];for(var i=1;i<=12;i++){var s=("0"+i).slice(-2);
    a.push({t:s+"주", u:"out/sets/eng2p_set_w"+s+".md"});}return a;})()},
 {g:"산출 과제집 12주분", n:"주 1개. 한 문장씩 번갈아 만든다",
  f:(function(){var a=[];for(var i=1;i<=12;i++){var s=("0"+i).slice(-2);
    a.push({t:s+"주", u:"out/tasks/eng2p_task_w"+s+".md"});}return a;})()},
 {g:"그 밖", n:"조준표, 비상판, 매뉴얼, 대장, 점검 보고서",
  f:[{t:"입력 조준표",u:"out/input/eng2p_input_q1.md"},
     {t:"비상판 20개",u:"out/emergency/eng2p_emg_001_020.md"},
     {t:"운영 매뉴얼",u:"out/manual/eng2p_manual.md"},
     {t:"진행 대장",u:"out/manual/eng2p_ledger.md"},
     {t:"Q1 점검 보고서",u:"out/manual/eng2p_q1_review.md"}]}
];

var DOCS2=[
 {g:"강의 24편", n:"25강부터 48강. 청크 9, 소리 4, 자동화 6, repair 3, 문법 2",
  f:(function(){var a=[];for(var i=25;i<=48;i++){var s=("00"+i).slice(-3);
    a.push({t:i+"강", u:"out/lectures/eng2p_q2_l"+s+".md"});}return a;})()},
 {g:"드릴 카드 150장", n:"판정 35, 압박 40, 확장 40, 역할 15, repair 20",
  f:[{t:"001-050",u:"out/cards/eng2p_card_q2_001_050.md"},
     {t:"051-100",u:"out/cards/eng2p_card_q2_051_100.md"},
     {t:"101-150",u:"out/cards/eng2p_card_q2_101_150.md"},
     {t:"배정표",u:"out/cards/eng2p_card_plan_q2.md"}]},
 {g:"대조 교차 세트 72개", n:"13주부터 24주. 20주와 24주에 관계 점검이 붙는다",
  f:(function(){var a=[];for(var i=13;i<=24;i++){var s=("0"+i).slice(-2);
    a.push({t:s+"주", u:"out/sets/eng2p_set_w"+s+".md"});}return a;})()},
 {g:"3층 대조판 6장", n:"1층과 2층 병치. 2주에 한 장. 기준서 6.4",
  f:(function(){var a=[];for(var i=1;i<=6;i++){var s=("00"+i).slice(-3);
    a.push({t:s, u:"out/dialog/eng2p_dialog_q2_"+s+".md"});}
    a.push({t:"운용 문서",u:"out/dialog/eng2p_dialog_manual.md"});return a;})()},
 {g:"산출 과제집 12주분", n:"주 1개. 분량 250자",
  f:(function(){var a=[];for(var i=13;i<=24;i++){var s=("0"+i).slice(-2);
    a.push({t:s+"주", u:"out/tasks/eng2p_task_w"+s+".md"});}return a;})()},
 {g:"그 밖", n:"조준표, 비상판, 점검 보고서",
  f:[{t:"입력 조준표",u:"out/input/eng2p_input_q2.md"},
     {t:"비상판 20개",u:"out/emergency/eng2p_emg_021_040.md"},
     {t:"Q2 점검 보고서",u:"out/manual/eng2p_q2_review.md"}]}
];

var DOCS3=[
 {g:"강의 24편", n:"49강부터 72강. 자동화 9, 청크 5, 문법 4, repair 3, 화용 3",
  f:(function(){var a=[];for(var i=49;i<=72;i++){var s=("00"+i).slice(-3);
    a.push({t:i+"강", u:"out/lectures/eng2p_q3_l"+s+".md"});}return a;})()},
 {g:"드릴 카드 150장", n:"판정 20, 압박 45, 확장 35, 역할 25, repair 25. 제한 시간 3초",
  f:[{t:"001-050",u:"out/cards/eng2p_card_q3_001_050.md"},
     {t:"051-100",u:"out/cards/eng2p_card_q3_051_100.md"},
     {t:"101-150",u:"out/cards/eng2p_card_q3_101_150.md"},
     {t:"배정표",u:"out/cards/eng2p_card_plan_q3.md"}]},
 {g:"대조 교차 세트 72개", n:"25주부터 36주. 32주에 관계 점검, 36주에 분기 마감",
  f:(function(){var a=[];for(var i=25;i<=36;i++){var s=("0"+i).slice(-2);
    a.push({t:s+"주", u:"out/sets/eng2p_set_w"+s+".md"});}return a;})()},
 {g:"3층 대조판 6장", n:"1층과 2층 병치. 2주에 한 장. 기준서 6.4",
  f:(function(){var a=[];for(var i=1;i<=6;i++){var s=("00"+i).slice(-3);
    a.push({t:s, u:"out/dialog/eng2p_dialog_q3_"+s+".md"});}
    a.push({t:"운용 문서",u:"out/dialog/eng2p_dialog_manual.md"});return a;})()},
 {g:"산출 과제집 12주분", n:"주 1개. 분량 400자",
  f:(function(){var a=[];for(var i=25;i<=36;i++){var s=("0"+i).slice(-2);
    a.push({t:s+"주", u:"out/tasks/eng2p_task_w"+s+".md"});}return a;})()},
 {g:"그 밖", n:"조준표, 비상판, 점검 보고서",
  f:[{t:"입력 조준표",u:"out/input/eng2p_input_q3.md"},
     {t:"비상판 20개",u:"out/emergency/eng2p_emg_041_060.md"},
     {t:"Q3 점검 보고서",u:"out/manual/eng2p_q3_review.md"}]}
];

function renderDocs(){
  var box=$("#srcDocs"); if(!box) return; box.innerHTML="";
  var q=(typeof curSrcQ!=="undefined"&&curSrcQ)?curSrcQ:1;
  var ttl=$("#srcDocsTitle"); if(ttl) ttl.textContent=(q>=3?"Q3":(q>=2?"Q2":"Q1"))+" 교재";
  var nt=$("#srcDocsNote"); if(nt) nt.textContent=(q>=4?"Q4 제작물은 아직 없다. Q3 것을 보여 준다.":"");
  (q>=3?DOCS3:(q>=2?DOCS2:DOCS)).forEach(function(g){
    var d=el("div","card");
    d.appendChild(el("h4",null,g.g));
    d.appendChild(el("div","small mut",g.n));
    var r=el("div","row"); r.style.flexWrap="wrap"; r.style.marginTop="6px";
    g.f.forEach(function(f){
      var a=el("a","tag"); a.textContent=f.t; a.href=REPO+f.u;
      a.target="_blank"; a.rel="noopener noreferrer"; r.appendChild(a);
    });
    d.appendChild(r); box.appendChild(d);
  });
}

function renderSrc(){
  renderDocs();
  var box=$("#srcList"); box.innerHTML="";
  SOURCES.forEach(function(s){
    var d=el("div","src");
    d.appendChild(el("h4",null,s.n));
    var a=el("a",null,s.u); a.href=s.u; a.target="_blank"; a.rel="noopener noreferrer";
    d.appendChild(a);
    d.appendChild(el("div","lic","라이선스: "+s.lic));
    d.appendChild(el("div","small","쓰는 법: "+s.good));
    d.appendChild(el("div","small mut","한계: "+s.bad));
    box.appendChild(d);
  });

  var tb=$("#srcQTabs"); tb.innerHTML="";
  [1,2,3,4].forEach(function(q){
    var b=el("button","g"+(q===curSrcQ?" on":""),"Q"+q);
    b.onclick=function(){ curSrcQ=q; renderSrc(); }; tb.appendChild(b);
  });
  var c=SRC_COND[curSrcQ];
  $("#srcCond").innerHTML='<div class="card"><div class="grid g3">'+
    '<div><div class="small mut">길이</div><b>'+c.len+'</b></div>'+
    '<div><div class="small mut">속도</div><b>'+c.spd+'</b></div>'+
    '<div><div class="small mut">화자 수</div><b>'+c.spk+'</b></div>'+
    '<div><div class="small mut">주제 범위</div><b>'+c.top+'</b></div></div>'+
    '<div class="small mut" style="margin-top:12px">조건을 채우는 재료 유형 5종</div><ul style="margin:6px 0 0;padding-left:18px">'+
    c.types.map(function(x){return '<li class="small">'+esc(x)+'</li>';}).join("")+'</ul></div>';

  $("#srcPass").innerHTML='<tr><th>회차</th><th>초점</th><th>찾을 것</th><th>상호 확인</th></tr>'+
    SRC_PASS.map(function(r){
      return '<tr><td class="mono">'+r[0]+'</td><td><span class="tag a">'+r[1]+'</span></td><td>'+r[2]+'</td><td class="mut">'+r[3]+'</td></tr>';
    }).join("");

  $("#srcCollect").innerHTML=
    '<div class="small">채집은 2층 자료 확보를 겸한다. 의미가 아니라 <b>양상</b>을 적는다.</div>'+
    '<ul style="margin:10px 0;padding-left:18px">'+
    ['누가 먼저 말했나','어디서 끊겼나','어떻게 고쳐 말했나','못 알아들었을 때 뭐라고 되물었나','두 사람이 동시에 말한 곳이 있었나']
      .map(function(x){return '<li class="small">'+x+'</li>';}).join("")+'</ul>'+
    '<div class="note small" style="margin-bottom:0">적은 것은 판정 탭으로 올린다. 출처 없이 올리지 않는다.</div>';

  var mb=$("#mpList"); mb.innerHTML="";
  MPAIRS.forEach(function(g){
    var d=el("div","src");
    d.appendChild(el("h4",null,g.t));
    d.appendChild(el("div","lic","한국어에서는 "+g.why+". 그래서 영어에서 두 소리가 한 소리로 들린다."));
    var row=el("div","row"); row.style.marginTop="8px";
    g.w.forEach(function(pair){
      var uniq = pair[0]===pair[1];
      var label = uniq ? pair[0] : pair[0]+" / "+pair[1];
      var b=el("button","g",label);
      b.style.fontSize="13px";
      b.onclick=function(){
        TTS.stop=false;
        if(uniq){ spk(pair[0]); }
        else { try{speechSynthesis.cancel();}catch(e){} playSeq([pair[0],pair[1]],1); }
      };
      if(!TTS.ok) b.disabled=true;
      row.appendChild(b);
    });
    d.appendChild(row);
    mb.appendChild(d);
  });
}
$("#srcCopy").onclick=function(){
  var L=["# 채집 기록","","날짜: "+today(),"자료: ","링크: ","구간: ","",
    "| 항목 | 적은 것 |","|---|---|",
    "| 누가 먼저 말했나 |  |","| 어디서 끊겼나 |  |","| 어떻게 고쳐 말했나 |  |",
    "| 되묻기 표현 |  |","| 동시에 말한 곳 |  |","",
    "## 판정 받을 표현","","| 표현 | 출처 | 궁금한 점 |","|---|---|---|","|  |  |  |"];
  copy(L.join("\n"), $("#srcMsg"));
};

/* =========================================================================
   규칙 탭
   ========================================================================= */
function renderRules(){
  var w=$("#wall"); w.innerHTML="";
  var h=el("div");
  h.appendChild(el("h4",null,"2인 영어 세션 규칙 카드"));
  h.appendChild(el("div","small mut","오늘의 A : 짝수 날 = "+S.names.a+" / 홀수 날 = "+S.names.b));
  w.appendChild(h);
  var s1=el("div","wc-sec");
  var t=el("table");
  t.innerHTML='<tr><th>블록</th><th>시간</th><th>형태</th></tr>'+
    BLOCKS.map(function(b,i){return '<tr><td>'+(i+1)+' '+b.n+'</td><td class="n">'+b.m+'분</td><td>'+b.d+'</td></tr>';}).join("");
  s1.appendChild(t); w.appendChild(s1);

  var s2=el("div","wc-sec"); s2.appendChild(el("h4",null,"말할 때"));
  var u=el("ul");
  ['"틀렸다" 대신 "나는 이렇게 이해했다"','못 알아들으면 넘어가지 말고 되묻는다','막히면 한국어로 새지 말고 아는 말로 돌려 말한다']
    .forEach(function(x){u.appendChild(el("li",null,x));});
  s2.appendChild(u); w.appendChild(s2);

  var s3=el("div","wc-sec"); s3.appendChild(el("h4",null,"하지 않는 것"));
  var u2=el("ul");
  ["한글로 발음 적기","한국어 자막","단어장 외우기","눈으로 복습하기","번역해서 말하기"]
    .forEach(function(x){u2.appendChild(el("li",null,x));});
  s3.appendChild(u2); w.appendChild(s3);

  var s4=el("div","wc-sec"); s4.appendChild(el("h4",null,"끝내기 전 30초"));
  var u3=el("ul");
  ["LRE 몇 번이었는지 적는다","해결 안 된 것 한 줄로 적는다"].forEach(function(x){u3.appendChild(el("li",null,x));});
  s4.appendChild(u3);
  s4.appendChild(el("div","small mut","하루 빠졌으면 다음 날은 무조건 한다. 안 되면 비상판 15분. 비상판도 수행일이다."));
  w.appendChild(s4);

  $("#banA").innerHTML='<tr><th>항목</th><th>구간</th><th>이유</th></tr>'+
    BAN_A.map(function(x){return '<tr><td>'+x[0]+'</td><td class="mut">'+x[1]+'</td><td class="mut">'+x[2]+'</td></tr>';}).join("");
  $("#banB").innerHTML='<tr><th>항목</th><th>이유</th></tr>'+
    BAN_B.map(function(x){return '<tr><td>'+x[0]+'</td><td class="mut">'+x[1]+'</td></tr>';}).join("");
  $("#failTbl").innerHTML='<tr><th>시점</th><th>현상</th><th>원인</th><th>대응</th></tr>'+
    FAILPT.map(function(x){return '<tr><td class="mono">'+x[0]+'</td><td>'+x[1]+'</td><td class="mut">'+x[2]+'</td><td class="mut">'+x[3]+'</td></tr>';}).join("");
}

/* =========================================================================
   시작
   ========================================================================= */
buildNav();
fillSel("#rD",DOM); fillSel("#rR",REL); fillSel("#rF",FUN);
/* 끊긴 세션이 있으면 그 자리에서 다시 편다. 저절로 안 돈다. 누르면 이어 간다. */
loadSession();
/* **못 읽은 기록이 있으면 제일 먼저 말한다.** 조용히 넘어가면 두 사람이
   빈 화면을 보고 다시 시작하고 그 다음 저장이 옛 기록 위를 덮는다. */
if(typeof LOAD_ERR!=="undefined" && LOAD_ERR) toast(LOAD_ERR);
applyFs(); renderOnboard(); renderToday(); paintTimer(); renderRules(); paintKind(); paintSide(); paintVeil();
ttsVoices(); renderSound(); renderClip(); renderScript();
go((location.hash.slice(1)||"today"));
window.addEventListener("hashchange",function(){ go(location.hash.slice(1)||"today"); });
