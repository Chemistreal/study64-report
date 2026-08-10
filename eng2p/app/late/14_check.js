/* =========================================================================
   규격 검사 (scripts/check.py 이식)
   ========================================================================= */
/* 규격 목록 시작. check_app.py 가 이 사이를 안 본다 */
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
/* docs/audio_intake.md 규격. GPT 등 외부에서 만든 음성의 대본을 검사한다. */
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
  // 금지 문자는 이스케이프로 적는다. 이 파일 자체가 금지 문자를 품지 않게 한다.
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

/* 규격 목록 끝 */
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
/* **잇는 것을 함수 안으로 넣었다** (T313 뒤). 이 조각이 늦게 오므로
   맨 위에서 잇던 것을 그대로 두면 조각을 읽는 순간에 잇게 되고
   그때 검사 탭이 이미 열려 있다. 그래도 되지만 **다시 여는 날 또 잇는다.**
   한 번만 잇고 그 김에 칸을 한 번 칠한다. 탭 몰기가 이것을 부른다. */
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
