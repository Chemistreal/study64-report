/* =========================================================================
   회전 대장
   ========================================================================= */
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
/* 고르개를 여기서 채운다. **전에는 시작에서 채웠다** (T313 뒤에 옮겼다).
   이 조각이 늦게 오므로 시작에는 이 함수가 없다. 두 번 채워도 같은 값이라 그냥 채운다. */
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
      /* 회전 대장은 편중을 막는 장치다. 한 줄을 잘못 지우면 그 조합이
         안 쓴 것으로 되돌아가고 다음 배정이 그쪽으로 쏠린다. T174 */
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

