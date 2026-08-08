/* =========================================================================
   판정 탭
   ========================================================================= */
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
  /* **빈 자리는 없다고만 말하면 안 된다.** 없는 것이 정상인지 빠뜨린 것인지를
     두 사람이 모른다. 무엇을 하면 채워지는지를 같이 적는다. T183 */
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

