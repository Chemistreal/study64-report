/* =========================================================================
   복습. 간격 반복.
   간격은 널리 쓰이는 1/3/7/14/30/60일 일정을 따른다.
   읽어서 넘기는 형태로 만들지 않는다. 13.1이 복습 읽기를 금지하기 때문이다.
   단서만 보여주고 입으로 꺼내게 하고, 판정은 상대가 한다.
   ========================================================================= */
var IVL=[1,3,7,14,30,60];
var REV={queue:[],i:0,shown:false};

function revPrompt(it){ return it.k || it.i || it.q || (it.s ? "출처: "+it.s : ""); }
function revAnswer(it){ return it.t || it.e || ""; }
function revDue(){
  var out=[], td=today();
  allDays().forEach(function(d){
    var _r=day(d);
    _r.unres.concat(_r.coll).forEach(function(it){
      if(it.done && it.box && it.box<=IVL.length && it.due && it.due<=td) out.push(it);
    });
  });
  return out;
}
/* **잘못 누르면 간격이 날아간다.** 맞음과 틀림이 나란히 있고 둘 다 큰 단추다.
   틀림을 누르면 상자가 1로 되돌아간다. 60일 뒤에 낼 것이 내일이 된다.
   그것을 되돌릴 길이 없었다. T173 */
function revGrade(it,ok){
  var was={box:it.box,due:it.due};
  if(ok){ it.box=(it.box||1)+1; }
  else { it.box=1; }
  it.due = it.box>IVL.length ? null : addDays(today(), IVL[it.box-1]);
  save();
  offerUndo("복습 판정 "+(ok?"맞음":"틀림"),function(){
    it.box=was.box; it.due=was.due;
    REV.shown=false; if(REV.i>0) REV.i--;
    renderReview(); renderNudge();
  });
}
function renderNudge(){
  var box=$("#revNudge"); if(!box) return;
  var n=revDue().length;
  if(!n){ box.innerHTML=""; return; }
  box.innerHTML='<div class="card tight"><div class="row"><div style="flex:1;min-width:150px">'+
    '<div class="small mut">오늘 복습</div><div class="mono" style="font-size:19px;font-weight:650">'+n+'개</div></div>'+
    '<button class="g" id="revJump">복습 열기</button></div></div>';
  $("#revJump").onclick=function(){ go("review"); };
}
function renderReview(){
  var body=$("#revBody");
  REV.queue=revDue();
  if(!REV.queue.length){
    var waiting=0, td=today();
    allDays().forEach(function(d){
      var _r=day(d);
    _r.unres.concat(_r.coll).forEach(function(it){
        if(it.done && it.box && it.box<=IVL.length && it.due && it.due>td) waiting++;
      });
    });
    body.innerHTML='<div class="card"><b>오늘 복습할 것 없다.</b>'+
      '<div class="small mut" style="margin-top:6px">대기 중 '+waiting+'개. 판정 세션에서 완료 표시한 항목이 하루 뒤부터 들어온다.</div></div>';
    return;
  }
  if(REV.i>=REV.queue.length) REV.i=0;
  var it=REV.queue[REV.i];
  var A=roleOf(today())==="a"?S.names.a:S.names.b;
  var B=roleOf(today())==="a"?S.names.b:S.names.a;

  var c=el("div","revcard");
  c.appendChild(el("div","revmeta",(REV.i+1)+" / "+REV.queue.length+"   ·   "+
    jo(A,"이","가")+" 읽고 "+jo(B,"이","가")+" 영어로 말한다"));
  c.appendChild(el("div","revq",revPrompt(it)||"(단서 없음)"));
  var meta=[];
  if(it.s) meta.push("출처 "+it.s);
  if(it.i&&it.k) meta.push("걸린 것 "+it.i);
  c.appendChild(el("div","revmeta",meta.join("   ·   ")));

  var boxes=el("div","revbox");
  for(var k=0;k<IVL.length;k++){ var b=el("i"); if(k<(it.box||0)) b.className="on"; boxes.appendChild(b); }
  c.appendChild(boxes);

  var slot=el("div"); slot.style.marginTop="18px"; c.appendChild(slot);

  if(!REV.shown){
    var show=el("button","bigtap alt","정답 보기");
    show.onclick=function(){ REV.shown=true; renderReview(); };
    slot.appendChild(show);
  } else {
    var ans=el("div","reva",revAnswer(it)); slot.appendChild(ans);
    var sp=el("div","row"); sp.style.justifyContent="center"; sp.appendChild(spkBtn(revAnswer(it)));
    slot.appendChild(sp);
    var row=el("div","row"); row.style.marginTop="16px"; row.style.gap="10px";
    var no=el("button","bigtap alt","틀림"); no.style.flex="1";
    var yes=el("button","bigtap","맞음"); yes.style.flex="1";
    no.onclick=function(){ revGrade(it,false); step(); };
    yes.onclick=function(){ revGrade(it,true); step(); };
    row.appendChild(no); row.appendChild(yes); slot.appendChild(row);
  }
  body.innerHTML=""; body.appendChild(c);

  var hint=el("div","note small","다음 간격: 맞으면 "+
    ((it.box||1)>=IVL.length ? "졸업. 큐에서 빠진다" : IVL[Math.min(it.box||1,IVL.length-1)]+"일 뒤")+
    ", 틀리면 1일 뒤. 정답을 보기 전에 반드시 소리 내어 말한다.");
  body.appendChild(hint);

  function step(){ REV.shown=false; REV.i++; renderReview(); renderNudge(); }
}

