/* =========================================================================
   분기 탭
   ========================================================================= */
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

