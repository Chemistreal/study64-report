/* =========================================================================
   주간 점검 30분.

   매뉴얼 대장 3장에 다섯 단계가 있다. 5 5 5 10 5 분이고 합이 30분이다.
   **학습은 하지 않는다.** 주 7일째의 그 30분이 이 화면이다.

   종이 기록표가 이미 있다. 그런데 그 표의 첫 세 단계는 **앱이 이미 아는 숫자**다.
   수행일과 비상판과 결석과 경보와 미해결 LRE 건수와 채집 건수다.
   사람이 그것을 다시 세어 적고 있었다. 세다가 틀리면 그 주가 틀리게 남는다.

   앱이 세고 사람은 **왜 그랬는지**를 적는다. 그것은 앱이 모른다. T226
   ========================================================================= */
var WCHK_STEPS=[
  {n:1,t:"수행 대조",m:5},
  {n:2,t:"미해결 LRE 정리",m:5},
  {n:3,t:"채집 표현 정리",m:5},
  {n:4,t:"다음 주 실행 의도",m:10},
  {n:5,t:"특이사항",m:5}
];
function wchkRec(w){
  if(!S.wchk) S.wchk={};
  if(!S.wchk[w]) S.wchk[w]={cause:"",lre:"",coll:"",first:"",block:"",odd:"",ask:"",done:false};
  return S.wchk[w];
}
/* 그 주 엿새를 센다. **주는 6일이다.** 이레째는 점검이라 배정이 없다. */
function wchkDays(w){
  var out=[], start=S.start;
  if(!start) return out;
  var d=parseISO(start), n=0;
  while(out.length<w*6){
    var iso1=isoOf(d);
    if(d.getDay()!==0){ n++; if(n>(w-1)*6) out.push(iso1); }
    d=new Date(d.getTime()+86400000);
    if(out.length>=w*6) break;
  }
  return out;
}
function isoOf(d){
  var z=new Date(d.getTime()-d.getTimezoneOffset()*60000);
  return z.toISOString().slice(0,10);
}
function wchkCount(w){
  var ds=wchkDays(w), o={norm:0,emg:0,abs:0,lre:0,coll:0,unres:0};
  ds.forEach(function(x){
    var r=S.days[x]; if(!r) return;
    if(r.status==="normal") o.norm++;
    else if(r.status==="emg") o.emg++;
    else if(r.status==="absent") o.abs++;
    o.lre+=r.lre||0;
    o.coll+=(r.coll||[]).length;
    o.unres+=(r.unres||[]).length;
  });
  o.days=ds;
  return o;
}
/* 경보는 대장 탭이 이미 거는 것과 같은 규칙이다. 그 주 것만 본다. */
function wchkAlerts(c){
  var out=[];
  if(c.abs>=2) out.push("결석 "+c.abs+"일");
  if(c.emg>=3) out.push("비상판 "+c.emg+"일");
  else if(c.emg>=2) out.push("비상판 2일");
  if(c.norm<4) out.push("수행일이 "+c.norm+"일이다");
  return out;
}
/* 한 주를 되짚는다 (T379). T378 과 같은 결이다.

   ## 셈은 있었고 되짚기가 없었다

   주간 점검이 숫자 여섯을 낸다. 수행 비상판 결석 LRE 미해결 채집이다.
   그것은 **다음에 무엇을 할지 정하는 재료**지 한 주가 무엇이었는지가 아니다.

   여섯 날이 지나고 이레째에 앉았는데 화면이 그 주에 무엇을 배웠는지를
   한 줄도 안 말했다. **차림표가 다 알고 있는데 아무도 안 물었다.**

   ## 무엇을 되짚나

   차림표에서 온다. 그 주 강의 둘의 번호와 제목과 트랙, 카드 번호 자리다.
   `needWeek` 이 그 분기를 읽어 온다. **누를 때만 읽는다** (T245).

   못 한 것을 안 센다. 수행 n/6 은 위 숫자 칸이 이미 말한다.
   여기는 **한 것**만 적는다. 그것이 T378 과 같은 규칙이다. */
function weekRecap(w){
  var row=(IDX&&IDX.weeks)?IDX.weeks[w-1]:null;
  if(!row||!row.lectures||!row.lectures.length) return null;
  var lo=null, hi=null;
  row.lectures.forEach(function(l){
    if(!l.cards) return;
    if(lo===null||l.cards.from<lo) lo=l.cards.from;
    if(hi===null||l.cards.to>hi) hi=l.cards.to;
  });
  return {q:row.quarter, lec:row.lectures, from:lo, to:hi};
}
function renderWeekRecap(w){
  var box=$("#wcRecap"); if(!box) return;
  var r=weekRecap(w);
  /* **차림표를 아직 못 읽었으면 안 뜬다.** 빈 자리를 띄우면 못 채운 자리로 읽힌다 */
  if(!r){ box.hidden=true; box.innerHTML=""; return; }
  box.hidden=false;
  var lec=r.lec.map(function(l){
    return '<div>'+l.no+'강 <b>'+esc(l.title)+'</b> '+
           '<span class="small mut">'+esc(l.track)+'</span></div>';
  }).join("");
  box.innerHTML='<div class="note"><b>이 주에 한 것</b> '+
    '<span class="small mut">'+esc(r.q)+' · '+w+'주</span>'+lec+
    (r.from!==null?'<div class="small mut">카드 '+r.from+'~'+r.to+'</div>':"")+
    '</div>';
}

function renderWeekCheck(){
  var box=$("#weekCheck"); if(!box) return;
  var pl=(typeof plan==="function")?plan():null;
  var w=(pl&&pl.week)||1;
  var c=wchkCount(w), a=wchkAlerts(c), r=wchkRec(w);
  var h='<div class="hd2"><b>주간 점검 30분 · '+w+'주차</b>'+
        '<span class="small mut">이레째에 한다. 학습은 하지 않는다</span></div>';
  /* 되짚기가 숫자보다 먼저다. **한 주가 무엇이었는지를 먼저 말한다.**
     숫자는 다음에 무엇을 할지 정하는 재료지 그 주가 무엇이었는지가 아니다 */
  h+='<div id="wcRecap" hidden></div>';
  h+='<div class="wcnum">'+
     '<span>수행 '+c.norm+' / 6</span><span>비상판 '+c.emg+'</span>'+
     '<span>결석 '+c.abs+'</span><span>LRE '+c.lre+'</span>'+
     '<span>미해결 '+c.unres+'</span><span>채집 '+c.coll+'</span></div>';
  /* **분기 점검 주면 그 말을 먼저 한다** (T351). 매뉴얼 7.2 가 그 주에
     20분을 더 쓰라고 한다. 주간 점검 화면이 그것을 안 말하면 그냥 30분만 하고 닫는다. */
  var qw=(typeof qWeekNow==="function") ? qWeekNow(w) : null;
  if(qw)
    h+='<div class="note w"><b>이 주가 Q'+qw.q+' 분기 점검 주다.</b> '+
       '주간 점검 30분에 <b>분기 점검 20분</b>이 더 붙는다 (매뉴얼 7.2).<br>'+
       '<b>분기 탭에서 셋을 한다.</b> 통과 조건 넷 · 관계 점검 · 되돌아보기 녹음. '+
       '<button type="button" class="g" id="wcQ">분기 탭으로</button></div>';
  h+='<div class="n">위 숫자는 앱이 센 것이다. 다시 세지 않는다. '+
     '아래는 앱이 모르는 것이라 사람이 적는다.</div>';
  if(a.length) h+='<div class="note w"><b>걸린 경보</b> '+esc(a.join(" · "))+'</div>';
  else h+='<div class="note small">걸린 경보 없음.</div>';
  /* 누구 말이야에서 갈린 자리 (T295). 규칙서 7.3 의 못 했을 때 칸이
     "갈렸다고 적고 넘어간다. **그 자리가 주 7일째 점검에 간다**" 다.
     그 판은 정답을 안 주므로 갈린 것이 틀린 것이 아니다. **물어볼 것이다.**

     앱이 그 자리를 세고 사람은 5단계에 무엇을 물을지 적는다.
     이 화면의 규칙이 그것이다 (T226). 앱이 아는 숫자를 사람이 다시 안 센다. */
  var sp=(S.wsplit&&S.wsplit[w])||[];
  if(sp.length){
    h+='<div class="note w"><b>누구 말이야에서 갈린 자리 '+sp.length+'개</b><br>'+
       sp.map(function(x){
         return esc(x.where)+' <span class="small mut">('+esc(x.who)+')</span>';
       }).join('<br>')+
       '<br><span class="small">갈린 것은 틀린 것이 아니다. 5단계에 물을 것으로 적는다.</span></div>';
  }
  var fields=[
    ["wcCause","1단계 · 경보가 걸렸으면 그 원인",a.length?"":"경보가 없으면 비워 둔다"],
    ["wcLre","2단계 · 판정 세션에 올릴 미해결 LRE","번호나 문장을 적는다"],
    ["wcColl","3단계 · 판정 세션에 올릴 채집 표현",""],
    ["wcFirst","4단계 · 다음 주 첫 동작","무엇을 언제 하는지 하나만"],
    ["wcBlock","4단계 · 예상 방해와 대체안",""],
    ["wcOdd","5단계 · 제작물에서 이상하다고 느낀 곳",""],
    ["wcAsk","5단계 · 개정 요청","적고 덮는다. 그 자리에서 논의하지 않는다"]
  ];
  fields.forEach(function(f){
    h+='<label class="blank aimw"><span>'+esc(f[1])+'</span>'+
       '<textarea id="'+f[0]+'" rows="2"'+(f[2]?' placeholder="'+esc(f[2])+'"':"")+
       '></textarea></label>';
  });
  h+='<div class="row" style="gap:8px;margin-top:10px">'+
     '<button type="button" class="g" id="wcDone">'+(r.done?"마친 것으로 되어 있다":"이 주 점검을 마쳤다로 적기")+'</button>'+
     '<button type="button" class="g" id="wcCopy">종이 기록표 꼴로 복사</button></div>';
  h+='<div class="n">개정 요청은 12개월차에 연다. 그 자리에서 논의하면 그것이 이탈의 입구다.</div>';
  box.innerHTML=h;
  /* 값은 그린 뒤에 넣는다. 손이 올라가 있는 칸은 안 건드린다. T211 규칙과 같다. */
  var map=[["wcCause","cause"],["wcLre","lre"],["wcColl","coll"],["wcFirst","first"],
           ["wcBlock","block"],["wcOdd","odd"],["wcAsk","ask"]];
  map.forEach(function(k){
    fillField(k[0], r[k[1]]||"");
    var el=document.getElementById(k[0]);
    if(el) el.oninput=function(){ r[k[1]]=el.value; save(); };
  });
  if($("#wcQ")) $("#wcQ").onclick=function(){ go("quarter"); };
  var dn=$("#wcDone");
  /* 차림표는 분기마다 따로 있고 **누를 때만 읽는다** (T245).
     읽어 온 뒤에 그린다. 못 읽으면 이 자리가 안 뜨는 것이 맞다 */
  renderWeekRecap(w);
  if(typeof needWeek==="function")
    needWeek(w,function(){ renderWeekRecap(w); });
  if(dn) dn.onclick=function(){
    var was=r.done; r.done=true; save(); renderWeekCheck();
    if(!was) offerUndo(w+"주 점검을 마쳤다로 적음",function(){ r.done=false; renderWeekCheck(); });
  };
  var cp=$("#wcCopy");
  if(cp) cp.onclick=function(){
    var L=["[ "+w+"주차 ]  작성 : 둘이 같이","",
      "1. 수행 대조 (5분)",
      "   수행일 "+c.norm+" / 6      비상판 "+c.emg+"일      결석 "+c.abs+"일",
      "   경보 걸린 항목 : "+(a.join(" · ")||"없음"),
      "   원인 : "+(r.cause||""),"",
      "2. 미해결 LRE 정리 (5분)",
      "   이번 주 미해결 총 "+c.unres+"건",
      "   판정 세션에 올릴 항목 : "+(r.lre||""),"",
      "3. 채집 표현 정리 (5분)",
      "   채집 "+c.coll+"건",
      "   판정 세션에 올릴 항목 : "+(r.coll||""),"",
      "4. 다음 주 실행 의도 (10분)",
      "   이번 주 첫 동작 : "+(r.first||""),
      "   예상 방해와 대체안 : "+(r.block||""),"",
      "5. 특이사항 (5분)",
      "   이상하다고 느낀 곳 : "+(r.odd||""),
      "   개정 요청 : "+(r.ask||"")];
    copy(L.join("\n"), $("#fMsg"));
    flash("종이 기록표 꼴로 복사했다");
  };
}

/* 개정 요청 봉투 (T336). 매뉴얼 1항이 규격이고 `docs/ahead.md` 10장이 설계다.

   ## 덮는 자리는 있었는데 여는 자리가 없었다

   5단계 개정 요청 칸이 처음부터 있었다. 화면도 "12개월차에 연다" 고 적고 있었다.
   **그런데 여는 자리가 앱 어디에도 없었다.** 적으면 그 주 화면에서만 보이고
   다음 주가 되면 사라진다. 12개월차가 와도 열 것이 없다.

   적고 덮는 것이 맞다. 덮은 것을 **못 여는 것**은 안 맞는다.

   ## 안은 안 보이고 몇 장인지는 보인다

   봉투다. 몇 장 들었는지는 보이고 안은 안 보인다.
   개수도 안 보이면 적은 것이 사라진 줄 안다. **들고 있다는 것은 말한다** (T334).
   안까지 보이면 그것이 곧 다시 그 생각을 부른다. 적는 행위로 해소되는 것을 되돌린다.

   ## 달력으로 센다

   12개월차는 달력 12개월이다. 세션 주가 아니다.
   매뉴얼 1항이 "12개월 동안 이 과정의 구조를 바꾸지 않는다" 고 시간으로 적었다.
   밀려서 40주째여도 열두 달이 지났으면 연다. **막는 것은 시간이지 진도가 아니다.**

   ## 저장소를 안 늘린다

   적은 날을 따로 안 적는다. `S.wchk[w].ask` 가 이미 있고 주차로 언제인지가 나온다.
   새 칸을 만들면 합치기가 또 한 갈래 는다 (merge.md). */
var ASK_DAYS=365;
function askOpenAt(){
  return S.start ? addDays(S.start, ASK_DAYS) : null;
}
function askEnv(){
  var at=askOpenAt();
  if(!at) return null;
  var items=[], wk=S.wchk||{};
  Object.keys(wk).sort(function(a,b){ return (+a)-(+b); }).forEach(function(w){
    var t=(wk[w]||{}).ask||"";
    if(t.trim()) items.push({week:+w, text:t.trim()});
  });
  var left=Math.ceil((parseISO(at)-parseISO(today()))/86400000);
  return {at:at, items:items, n:items.length, open:left<=0, left:Math.max(0,left)};
}

function renderAsk(){
  var box=$("#askEnv"); if(!box) return;
  var e=askEnv();
  /* **0인데 뜨면 잔소리다** (T181). 적은 것이 없으면 이 칸이 아예 없다 */
  if(!e || !e.n){ box.hidden=true; box.innerHTML=""; return; }
  box.hidden=false;
  var h='<div class="hd2"><b>개정 요청 '+e.n+'건</b>'+
        '<span class="small mut">매뉴얼 1항</span></div>';
  if(!e.open){
    /* **안은 안 보인다.** 몇 장인지와 언제 여는지만 */
    h+='<p class="small mut">적어 뒀다. <b>안은 아직 안 연다.</b> '+
       '<b class="mono">'+esc(e.at)+'</b> 에 연다. '+esc(String(e.left))+'일 남았다.<br>'+
       '고치지 말고 적는 것이 매뉴얼 1항이다. 적는 것으로 대부분 해소된다. '+
       '<b>지금 열면 그 자리에서 논의하게 되고 그것이 이탈의 입구다.</b></p>';
  }else{
    h+='<p class="small mut"><b>열두 달이 지났다. 이제 연다.</b> '+
       '적을 때의 나와 지금의 나가 같은 것을 말하는지 본다.</p>';
    h+='<div class="note small"><b>먼저 읽는다.</b> 730시간은 원어민급에 필요한 '+
       '2,000~2,500시간의 약 30%다. 12개월차에 "이 정도야?" 라고 느끼는 것은 '+
       '실패 신호가 아니라 <b>30% 지점의 정상 신호</b>다 (매뉴얼 1장 2항).</div>';
    h+=e.items.map(function(x){
      return '<div class="blank"><b class="mono">'+x.week+'주차</b> '+esc(x.text)+'</div>';
    }).join("");
  }
  box.innerHTML=h;
}
