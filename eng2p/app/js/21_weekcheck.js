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
function renderWeekCheck(){
  var box=$("#weekCheck"); if(!box) return;
  var pl=(typeof plan==="function")?plan():null;
  var w=(pl&&pl.week)||1;
  var c=wchkCount(w), a=wchkAlerts(c), r=wchkRec(w);
  var h='<div class="hd2"><b>주간 점검 30분 · '+w+'주차</b>'+
        '<span class="small mut">이레째에 한다. 학습은 하지 않는다</span></div>';
  h+='<div class="wcnum">'+
     '<span>수행 '+c.norm+' / 6</span><span>비상판 '+c.emg+'</span>'+
     '<span>결석 '+c.abs+'</span><span>LRE '+c.lre+'</span>'+
     '<span>미해결 '+c.unres+'</span><span>채집 '+c.coll+'</span></div>';
  h+='<div class="n">위 숫자는 앱이 센 것이다. 다시 세지 않는다. '+
     '아래는 앱이 모르는 것이라 사람이 적는다.</div>';
  if(a.length) h+='<div class="note w"><b>걸린 경보</b> '+esc(a.join(" · "))+'</div>';
  else h+='<div class="note small">걸린 경보 없음.</div>';
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
  var dn=$("#wcDone");
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
