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

  /* **따로 적고 같이 편다** (T330). 매뉴얼 7.2 가 그렇게 시킨다.

       각자 다른 방에서 아래 4항목을 혼자 적는다. 5분.
       상의하지 않는다. **상의하면 힘센 쪽 답으로 수렴한다.**
       동시에 종이를 뒤집어 공개한다.

     앱은 그동안 **두 사람 칸을 나란히 보여 주고 있었다.** 종이가 막으려던
     바로 그것을 앱이 하고 있었다. 따로 쓰고 같이 펴기 판이 쓰는 문을 그대로 쓴다.

     **누구 것을 적나** 를 고르고 그 사람 칸만 보인다. 넷을 다 고르면 문이 열린다.
     기기가 둘이면 각자 제 것을 적고 하나면 돌려 가며 적는다. */
  var rkey="rel"+curQ;
  revealKeep(rkey, function(){ return !!st.relOpen; });
  var side = st.relSide==="b" ? "b" : "a";
  var full = function(w){
    var n=0;
    REL_Q.forEach(function(q){
      var v=st.rel[w][q.k];
      if(v && v!=="미기재") n++;
    });
    return n===REL_Q.length;
  };
  var open = revealOpen(rkey);
  var rb=$("#qRel"); rb.innerHTML="";

  if(!open){
    var pick=el("div","row");
    pick.appendChild(el("span","small mut","누구 것을 적나"));
    [["a",S.names.a],["b",S.names.b]].forEach(function(p){
      var btn=el("button", side===p[0]?"b":"g", p[1]);
      btn.type="button";
      btn.onclick=function(){ st.relSide=p[0]; save(); renderQuarter(); };
      pick.appendChild(btn);
    });
    rb.appendChild(pick);
    rb.appendChild(el("div","small mut",
      "따로 적는다. 상의하지 않는다. 상의하면 힘센 쪽 답으로 수렴한다."));
  }

  [["a",S.names.a],["b",S.names.b]].forEach(function(p){
    if(!open && p[0]!==side){
      var v=el("div","card tight");
      v.innerHTML='<h3>'+esc(jo(p[1],"이","가")+" 적은 것")+'</h3>'+
        '<div class="vpane"><div class="vhid" aria-hidden="true"><span>'+
        (full(p[0]) ? '다 적었다. 펴면 보인다' : '아직이다. 저쪽에서 적는다')+
        '</span></div></div>';
      rb.appendChild(v);
      return;
    }
    var card=el("div","card tight");
    card.appendChild(el("h3",null,jo(p[1],"이","가")+" 적은 것"));
    REL_Q.forEach(function(q){
      var w=el("div"); w.style.margin="8px 0";
      /* **어긋난 자리에만 표시한다** (T331). 매뉴얼 7.2 의 넷째 걸음이다.
         편 뒤에만 붙는다. 펴기 전에 붙으면 상대 답을 알려 주는 것이 된다.

         어느 쪽이 맞는지는 안 적는다. **어긋났다는 것이 답이다.**
         한쪽은 비슷하다 하고 한쪽은 네가 우세하다 하면 이미 한 사람이
         말을 삼키고 있다는 뜻이다 (매뉴얼 7.3 마지막 줄). */
      var gap = open && st.rel.a[q.k] && st.rel.b[q.k] &&
                st.rel.a[q.k]!=="미기재" && st.rel.b[q.k]!=="미기재" &&
                st.rel.a[q.k]!==st.rel.b[q.k];
      var l=el("label","f",q.l+(gap?" · 어긋났다":"")); w.appendChild(l);
      if(gap) l.className="f relgap";
      var sel=el("select");
      sel.appendChild(el("option",null,"미기재"));
      q.opt.forEach(function(o){ sel.appendChild(el("option",null,o)); });
      sel.value=st.rel[p[0]][q.k]||"미기재";
      sel.onchange=function(){ st.rel[p[0]][q.k]=sel.value; save(); renderQuarter(); };
      w.appendChild(sel); card.appendChild(w);
    });
    rb.appendChild(card);
  });

  if(open){
    /* 다시 적는 자리. **무르는 것이 아니라 다시 재는 것이다.**
       2주 뒤 재점검을 매뉴얼 7.3 이 시킨다. 그때 이 분기 값을 지우고 다시 적는다.
       지난 분기 값은 안 건드린다. 주도권 고정은 두 분기를 견줘서 나온다. */
    var again=el("div","row"); again.style.marginTop="8px";
    var ab=el("button","g","다시 적는다"); ab.type="button";
    ab.onclick=function(){
      st.relOpen=0; REVEAL.open["rel"+curQ]=false;
      st.rel={a:{},b:{}}; save(); renderQuarter();
      offerUndo("관계 점검을 다시 적기로 했다", function(){
        st.relOpen=1; save(); renderQuarter();
      });
    };
    again.appendChild(ab);
    again.appendChild(el("span","small mut",
      "2주 뒤 재점검에 쓴다. 지난 분기 값은 안 지운다."));
    rb.appendChild(again);
  }

  if(!open){
    var gate=el("div");
    gate.innerHTML=revealGate(rkey, full("a")&&full("b"),
      "두 사람 답이 어긋난 자리에만 표시가 붙는다");
    rb.appendChild(gate);
    revealBind(gate, function(){ st.relOpen=1; save(); renderQuarter(); });
  }
  signals();

  function signals(){
    var out=$("#qSignal"); out.innerHTML="";
    /* **셈은 한 자리에서만 한다** (T332). `rxHits` 가 늘 있는 자리에 있고
       첫 화면도 그것을 쓴다. 여기에 다시 적으면 언젠가 갈린다 (T320). */
    var hits=rxHits(curQ);
    /* 처방을 언제부터 쓰기 시작했나. **편 날이다.** 안 적으면 2주를 못 센다 */
    if(open && hits.length && !st.rxAt){ st.rxAt=today(); save(); }
    if(open && !hits.length && st.rxAt){ st.rxAt=null; save(); }
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

/* 공동 배지 (T329). `out/data/badge.js` 가 자료다.

   **지난 것과 안 지난 것을 같이 보여 준다.** 지난 것만 보이면 남은 것이 몇인지
   모르고 안 지난 것만 보이면 그것이 빚이 된다.

   안 지난 것에는 **얼마가 모자란지를 안 적는다.** 지금 얼마인지만 적는다.
   퀘스트에서 정한 것과 같은 결이다 (`quest.md` 5.3). */
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

/* 되돌아보기 녹음 (T334). `out/data/voice.js` 가 자료다. `docs/growth.md` 가 규격이다.

   ## 못 하는 것을 조용히 안 하면 안 된다

   `file://` 로 열면 브라우저가 마이크를 안 준다. 안전한 자리가 아니기 때문이다.
   그런데 이 앱은 `file://` 로 열어도 돌아야 한다. 종이와 같이 쓰는 물건이다.

   단추가 안 눌리면 두 사람은 **앱이 고장 난 줄 안다.**
   왜 안 되는지와 대신 무엇을 하는지를 화면이 말한다.

   ## 앱이 소리를 안 들고 있는다

   녹음이 끝나면 **내려받게 한다.** 파일은 두 사람 기기에 있고
   앱은 언제 무엇을 읽었는지와 파일 이름만 적는다.

   파일을 못 찾으면 못 찾는다고 적는다. **들고 있는 척하지 않는다.** */
var VOICE={rec:null, chunks:[], url:null};
function voiceKey(w){ return "w"+String(w).padStart(2,"0"); }
function voiceLog(){ if(!S.voice) S.voice={}; return S.voice; }
function voiceCan(){
  return !!(location.protocol!=="file:" &&
            navigator.mediaDevices && navigator.mediaDevices.getUserMedia &&
            typeof MediaRecorder!=="undefined");
}
function voiceName(w){
  return "eng2p_voice_"+voiceKey(w)+"_"+today()+".webm";
}

function renderVoice(){
  var box=$("#voiceList"); if(!box) return;
  var d=DATA.voice;
  if(!d){
    box.innerHTML='<div class="small mut">읽을 줄을 여는 중이다.</div>';
    loadData("voice","ENG2P_VOICE",function(){ renderVoice(); });
    return;
  }
  var line=$("#voiceLine");
  if(line) line.textContent=d.at.line;
  var log=voiceLog(), got=0;

  var how=$("#voiceHow");
  if(how){
    if(voiceCan()){
      how.innerHTML='<div class="row" style="margin-top:8px">'+
        '<button class="b" id="voiceGo" type="button">녹음</button>'+
        '<span class="small mut" id="voiceMsg">한 번 읽고 멈춘다. '+
        '끝나면 <b>내려받는다.</b> 파일은 이 기기에 둔다.</span></div>';
    }else{
      /* **안 된다고 말한다.** 왜와 대신 무엇을 하는지를 같이 적는다 */
      how.innerHTML='<div class="note w" style="margin-top:8px">'+
        '<b>여기서는 녹음이 안 된다.</b> 이 화면을 <b>파일에서 열었기 때문</b>이고 '+
        '브라우저가 안전한 자리에서만 마이크를 준다. 앱이 고장 난 것이 아니다.'+
        '<br><b>대신 기기 녹음기로 녹음한다.</b> 이름을 <b class="mono">'+
        esc(voiceName(plan().week))+'</b> 로 적고 아래에 적어 둔다.</div>';
    }
  }

  var h="";
  (d.weeks||[]).forEach(function(w){
    var k=voiceKey(w.week), r=log[k];
    if(r) got++;
    h+='<div class="row" style="justify-content:space-between;align-items:baseline">'+
       '<span>'+esc(w.when)+' <span class="small mut">'+w.week+'주</span></span>'+
       '<span class="small mut mono">'+(r?esc(r.file):"아직")+'</span>'+
       (r ? '<button class="g" type="button" data-vdel="'+esc(k)+'">지운다</button>'
          : '<button class="g" type="button" data-vadd="'+esc(k)+'">적는다</button>')+
       '</div>';
  });
  box.innerHTML=h;
  var c=$("#voiceCount");
  if(c) c.textContent=got+" / "+(d.weeks||[]).length+" 를 읽었다";

  box.querySelectorAll("[data-vadd]").forEach(function(b){
    b.onclick=function(){
      var k=b.dataset.vadd, w=+k.slice(1);
      var name=prompt("파일 이름을 적는다", voiceName(w));
      if(!name) return;
      voiceLog()[k]={file:name, at:today()};
      save(); renderVoice();
      offerUndo("녹음을 적었다", function(){
        delete voiceLog()[k]; save(); renderVoice();
      });
    };
  });
  box.querySelectorAll("[data-vdel]").forEach(function(b){
    b.onclick=function(){
      var k=b.dataset.vdel, was=voiceLog()[k];
      delete voiceLog()[k]; save(); renderVoice();
      offerUndo("적어 둔 것을 지웠다", function(){
        voiceLog()[k]=was; save(); renderVoice();
      });
    };
  });

  if($("#voiceGo")) $("#voiceGo").onclick=function(){ voiceToggle(); };
}

/* 녹음과 멈춤. **한 단추다.** 두 단추면 어느 것이 켜졌는지를 또 봐야 한다. */
function voiceToggle(){
  var btn=$("#voiceGo"), msg=$("#voiceMsg");
  if(VOICE.rec && VOICE.rec.state==="recording"){ VOICE.rec.stop(); return; }
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){
    VOICE.chunks=[];
    VOICE.rec=new MediaRecorder(st);
    VOICE.rec.ondataavailable=function(e){ if(e.data.size) VOICE.chunks.push(e.data); };
    VOICE.rec.onstop=function(){
      st.getTracks().forEach(function(t){ t.stop(); });
      var blob=new Blob(VOICE.chunks,{type:"audio/webm"});
      if(VOICE.url) URL.revokeObjectURL(VOICE.url);
      VOICE.url=URL.createObjectURL(blob);
      var w=plan().week, name=voiceName(w);
      var a=document.createElement("a");
      a.href=VOICE.url; a.download=name; a.click();
      if(btn) btn.textContent="녹음";
      if(msg) msg.innerHTML='<b>'+esc(name)+'</b> 를 내려받았다. '+
        '아래에서 <b>적는다</b>를 눌러 적어 둔다. 앱은 파일을 안 들고 있는다.';
    };
    VOICE.rec.start();
    if(btn) btn.textContent="멈춘다";
    if(msg) msg.textContent="읽는다. 다 읽으면 멈춘다.";
  }).catch(function(){
    if(msg) msg.innerHTML='<b>마이크를 못 열었다.</b> 브라우저가 막았거나 '+
      '기기에 마이크가 없다. <b>기기 녹음기로 녹음하고 아래에 적어 둔다.</b>';
  });
}

