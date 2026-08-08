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
function revGrade(it,ok){
  if(ok){ it.box=(it.box||1)+1; }
  else { it.box=1; }
  it.due = it.box>IVL.length ? null : addDays(today(), IVL[it.box-1]);
  save();
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

/* =========================================================================
   소리. 기기 내장 음성 합성만 쓴다. 외부 음성 파일을 받지 않는다.
   ========================================================================= */
var TTS={ok:(typeof window!=="undefined"&&"speechSynthesis" in window),voices:[],busy:false,stop:false};

/* 축약 20종. 신뢰도 B.
   약형은 슬랭이 아니라 규칙적인 음운 현상이라 목록 자체는 안정적이다.
   다만 철자 표기가 자료마다 갈려서 B로 둔다. 검증 로그는 vLog 에 찍는다. */
var PAIRS=[
 ["going to","gonna"],["want to","wanna"],["got to","gotta"],["have to","hafta"],
 ["has to","hasta"],["ought to","oughta"],["kind of","kinda"],["sort of","sorta"],
 ["lot of","lotta"],["out of","outta"],["give me","gimme"],["let me","lemme"],
 ["don't know","dunno"],["because","cuz"],["what are you","whatcha"],["would you","wouldya"],
 ["could you","couldya"],["should have","shoulda"],["would have","woulda"],["could have","coulda"]
];
var PAIR_LOG="검증일 2026-08-07 / 축약 20종 목록 / 결과: 20종 모두 ESL 청취 교육의 표준 reduced forms 로 확인. 슬랭이 아니라 규칙적 약형이라 슬랭 금지에 걸리지 않는다 / 조치: 목록 유지, 철자 변이가 있는 항목(wouldya, couldya, cuz)은 B등급 유지. 출처는 state/journal.md 검증 로그에 기록";

function wait(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
function ttsVoices(){
  var s=$("#vVoice"); if(!s) return;
  if(!TTS.ok){ s.innerHTML=""; s.appendChild(el("option",null,"지원 안 함")); return; }
  var prev=s.value;
  TTS.voices=(speechSynthesis.getVoices()||[]).filter(function(v){ return /^en/i.test(v.lang); });
  s.innerHTML="";
  if(!TTS.voices.length){ s.appendChild(el("option",null,"영어 음성 없음")); return; }
  TTS.voices.forEach(function(v,i){
    var o=el("option",null,v.name+" ("+v.lang+")"); o.value=i; s.appendChild(o);
  });
  if(prev!==""&&s.querySelector('option[value="'+prev+'"]')) s.value=prev;
}
function utter(text){
  return new Promise(function(res){
    if(!TTS.ok||TTS.stop||!text) return res();
    var u=new SpeechSynthesisUtterance(text);
    var vi=+($("#vVoice").value);
    if(TTS.voices[vi]){ u.voice=TTS.voices[vi]; u.lang=TTS.voices[vi].lang; } else { u.lang="en-US"; }
    u.rate=+$("#vRate").value||0.85;
    var done=false;
    function fin(){ if(done) return; done=true; res(); }
    u.onend=fin; u.onerror=fin;
    setTimeout(fin, Math.max(4000, text.length*260));  // 엔진이 onend 를 안 주는 경우 대비
    try{ speechSynthesis.speak(u); }catch(e){ fin(); }
  });
}
function spk(text){
  if(!TTS.ok) return;
  TTS.stop=false;
  try{ speechSynthesis.cancel(); }catch(e){}
  utter(text);
}
function spkBtn(text){
  var b=el("button","g","소리");
  b.style.padding="2px 9px"; b.style.fontSize="12px";
  b.onclick=function(){ spk(text); };
  if(!TTS.ok) b.disabled=true;
  return b;
}
function ttsStop(){
  TTS.stop=true; TTS.busy=false;
  try{ speechSynthesis.cancel(); }catch(e){}
  paintSeq(-1);
}
function paintSeq(i){
  document.querySelectorAll("#vList .lreitem").forEach(function(n,k){
    n.style.borderColor = (k===i) ? "var(--acc)" : "var(--line)";
  });
}
function playSeq(items,times){
  TTS.stop=false; TTS.busy=true;
  var i=0,t=0;
  function gap(text){
    // 섀도잉은 따라 말할 틈이 있어야 성립한다. 글자 수와 속도로 추정한다.
    if($("#vMode").value!=="shadow") return 280;
    var rate=+$("#vRate").value||0.85;
    return Math.max(1200, Math.round(text.length*75/rate));
  }
  function step(){
    if(TTS.stop||i>=items.length){ TTS.busy=false; paintSeq(-1); return; }
    paintSeq(i);
    var cur=items[i];
    utter(cur).then(function(){
      if(TTS.stop){ TTS.busy=false; paintSeq(-1); return; }
      t++;
      if(t>=times){ t=0; i++; }
      return wait(gap(cur)).then(step);
    });
  }
  step();
}
function soundLines(){
  return $("#vText").value.split("\n").map(function(x){return x.trim();}).filter(Boolean);
}
function renderSoundList(){
  var box=$("#vList"); box.innerHTML="";
  var lines=soundLines();
  if(!lines.length){ box.innerHTML='<div class="note small">읽을 내용이 비어 있다.</div>'; return; }
  lines.forEach(function(t){
    var d=el("div","lreitem");
    var h=el("div","hd2");
    h.appendChild(el("span",null,t));
    h.appendChild(spkBtn(t));
    d.appendChild(h); box.appendChild(d);
  });
}
function renderSound(){
  var w=$("#ttsWarn");
  if(!TTS.ok){
    w.innerHTML='<div class="note w"><b>이 브라우저는 음성 합성을 지원하지 않는다.</b><div class="small">크롬, 사파리, 엣지 최신판에서 열면 된다. 소리가 없어도 나머지 탭은 그대로 쓴다.</div></div>';
  } else if(!TTS.voices.length){
    w.innerHTML='<div class="note w"><b>영어 음성이 하나도 없다.</b><div class="small">기기 설정에서 영어 음성을 받아야 한다. 안드로이드는 설정의 음성 합성, 윈도우는 설정의 음성에서 받는다.</div></div>';
  } else { w.innerHTML=""; }

  var rows=['<tr><th>원형</th><th></th><th>축약형</th><th></th></tr>'];
  PAIRS.forEach(function(p,i){
    rows.push('<tr><td>'+p[0]+'</td><td><button class="g pbtn" data-i="'+i+'" data-k="0" style="padding:1px 8px;font-size:12px">소리</button></td>'+
              '<td><b>'+p[1]+'</b></td><td><button class="g pbtn" data-i="'+i+'" data-k="1" style="padding:1px 8px;font-size:12px">소리</button></td></tr>');
  });
  $("#vPairs").innerHTML=rows.join("");
  $("#vPairs").querySelectorAll(".pbtn").forEach(function(b){
    b.onclick=function(){ spk(PAIRS[+b.dataset.i][+b.dataset.k]); };
    if(!TTS.ok) b.disabled=true;
  });
  $("#vLog").textContent="검증 로그 / "+PAIR_LOG;
  renderSoundList();
}
if(TTS.ok){
  try{ speechSynthesis.onvoiceschanged=function(){ ttsVoices(); renderSound(); }; }catch(e){}
}
$("#vRate").oninput=function(){ $("#vRateN").textContent=(+this.value).toFixed(2); };
$("#vLoad").onclick=renderSoundList;
$("#vStop").onclick=ttsStop;
$("#vAll").onclick=function(){
  var lines=soundLines();
  if(!lines.length){ renderSoundList(); return; }
  renderSoundList();
  playSeq(lines, +$("#vRep").value||1);
};
$("#vPairAll").onclick=function(){
  var seq=[];
  PAIRS.forEach(function(p){ seq.push(p[0]); seq.push(p[1]); });
  $("#vText").value=seq.join("\n"); renderSoundList();
  playSeq(seq,1);
};
$("#vPairPush").onclick=function(){
  $("#vText").value=PAIRS.map(function(p){return p[0]+" ... "+p[1];}).join("\n");
  renderSoundList();
};

/* =========================================================================
   클립. 로컬 파일 구간 반복.
   파일은 objectURL 로만 다룬다. 업로드도 저장도 하지 않는다.
   남는 것은 파일 이름과 시각과 메모뿐이다.
   ========================================================================= */
var CLIP={el:null,url:null,file:null,loop:false,a:null,b:null,active:-1,
  peaks:null,waveState:"idle",waveToken:0,heard:false,phase:"prepare"};

function mmss(s){
  if(s==null||isNaN(s)) return "-";
  s=Math.max(0,s);
  var m=Math.floor(s/60), r=s-m*60;
  return m+":"+(r<10?"0":"")+r.toFixed(1);
}
function setClipPhase(phase){
  CLIP.phase=phase;
  var a=$("#clipRoleA"), b=$("#clipRoleB"), hint=$("#clipRoleHint");
  if(a){ a.classList.toggle("active",phase==="prepare"); a.removeAttribute("aria-current"); }
  if(b){ b.classList.toggle("active",phase!=="prepare"); b.removeAttribute("aria-current"); }
  var current=phase==="prepare"?a:b;
  if(current) current.setAttribute("aria-current","step");
  if(!hint) return;
  hint.textContent=phase==="prepare"?"A가 들을 구간을 정한다.":
    phase==="listen"?"B가 화면을 보지 않고 소리만 듣는다.":
    "B가 들은 것을 말한다. A는 답을 넘기지 않는다.";
}
function waveInfo(){
  var info=$("#clipWaveInfo"); if(!info) return;
  var msg;
  if(CLIP.loop&&CLIP.a!=null&&CLIP.b!=null&&CLIP.b>CLIP.a){
    msg="반복 중 · "+(CLIP.b-CLIP.a).toFixed(1)+"초 · "+mmss(CLIP.a)+"~"+mmss(CLIP.b);
  }else if(CLIP.waveState==="ready"){
    msg="실제 음성 파형 · A와 B 사이를 골라 반복한다.";
  }else if(CLIP.waveState==="loading"){
    msg="실제 음성 파형 분석 중";
  }else if(CLIP.waveState==="failed"){
    msg="이 파일은 파형을 읽을 수 없다. 구간 시각과 반복 기능은 그대로 쓴다.";
  }else{
    msg="파일을 열면 실제 음성 파형을 분석한다.";
  }
  if(info.textContent!==msg) info.textContent=msg;
}
function paintWave(){
  var canvas=$("#clipWave"); if(!canvas) return;
  var rect=canvas.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
  if(!rect.width||!rect.height) return;
  var w=Math.max(1,Math.round(rect.width*dpr)), h=Math.max(1,Math.round(rect.height*dpr));
  if(canvas.width!==w||canvas.height!==h){ canvas.width=w; canvas.height=h; }
  var ctx=canvas.getContext("2d");
  ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,rect.width,rect.height);
  var css=getComputedStyle(document.documentElement), muted=css.getPropertyValue("--mut").trim()||"#94a3b8";
  ctx.globalAlpha=.22; ctx.strokeStyle=muted; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,rect.height/2); ctx.lineTo(rect.width,rect.height/2); ctx.stroke();
  if(!CLIP.peaks||!CLIP.peaks.length) return;
  var now=CLIP.el&&dur()?CLIP.el.currentTime/dur():0;
  var active=css.getPropertyValue("--a1").trim()||"#6366f1";
  var future=css.getPropertyValue("--a3").trim()||"#0891b2";
  var mid=rect.height/2, maxH=Math.max(3,mid-5), count=CLIP.peaks.length;
  ctx.lineWidth=Math.max(1,rect.width/count*.7); ctx.lineCap="round";
  CLIP.peaks.forEach(function(p,i){
    var x=(i+.5)/count*rect.width, amp=Math.max(1.5,p*maxH);
    ctx.globalAlpha=i/count<=now?.82:.34; ctx.strokeStyle=i/count<=now?active:future;
    ctx.beginPath(); ctx.moveTo(x,mid-amp); ctx.lineTo(x,mid+amp); ctx.stroke();
  });
  ctx.globalAlpha=1;
}
function decodeClipAudio(ctx,buf){
  return new Promise(function(resolve,reject){
    var settled=false;
    function ok(v){ if(!settled){ settled=true; resolve(v); } }
    function no(e){ if(!settled){ settled=true; reject(e); } }
    try{
      var p=ctx.decodeAudioData(buf,ok,no);
      if(p&&typeof p.then==="function") p.then(ok,no);
    }catch(e){ no(e); }
  });
}
function buildWaveform(source){
  var token=++CLIP.waveToken, C=window.AudioContext||window.webkitAudioContext;
  CLIP.peaks=null; CLIP.waveState="loading"; paintWave(); waveInfo();
  if(!C){ CLIP.waveState="failed"; waveInfo(); return; }
  var bytes=source&&typeof source.arrayBuffer==="function"?source.arrayBuffer():
    fetch(CLIP.url).then(function(r){ if(!r.ok) throw new Error("media fetch"); return r.arrayBuffer(); });
  bytes.then(function(buf){
    if(token!==CLIP.waveToken) throw new Error("stale waveform");
    var ctx=new C();
    return decodeClipAudio(ctx,buf.slice(0)).then(function(audio){
      if(token!==CLIP.waveToken){ ctx.close(); return null; }
      var bins=320, len=audio.length, channels=audio.numberOfChannels, peaks=[];
      for(var i=0;i<bins;i++){
        var from=Math.floor(i*len/bins), to=Math.max(from+1,Math.floor((i+1)*len/bins));
        var stride=Math.max(1,Math.floor((to-from)/64)), sum=0, n=0;
        for(var ch=0;ch<channels;ch++){
          var data=audio.getChannelData(ch);
          for(var j=from;j<to;j+=stride){ var v=data[j]||0; sum+=v*v; n++; }
        }
        peaks.push(n?Math.min(1,Math.sqrt(sum/n)*2.8):0);
      }
      ctx.close(); return peaks;
    });
  }).then(function(peaks){
    if(!peaks||token!==CLIP.waveToken) return;
    CLIP.peaks=peaks; CLIP.waveState="ready"; paintWave(); waveInfo();
  }).catch(function(){
    if(token!==CLIP.waveToken) return;
    CLIP.peaks=null; CLIP.waveState="failed"; paintWave(); waveInfo();
  });
}
function loadMedia(file){
  mountClip(file.name, URL.createObjectURL(file), true,
    /^video\//.test(file.type)||/\.(mp4|webm|mov|mkv)$/i.test(file.name),file);
}
/* 미디어 라이브러리에서 온 레슨은 objectURL 이 아니라 경로다. 되돌릴 필요가 없다. */
function loadClipUrl(name, url, isVid){ mountClip(name, url, false, isVid,null); }

function mountClip(name, url, revocable, isVid, source){
  if(CLIP.url&&CLIP.revocable) URL.revokeObjectURL(CLIP.url);
  var file={name:name};
  CLIP.file=file; CLIP.url=url; CLIP.revocable=!!revocable;
  var host=$("#mediaHost"); host.innerHTML="";
  var m=document.createElement(isVid?"video":"audio");
  m.src=CLIP.url; m.controls=true; m.preload="metadata";
  try{ m.preservesPitch=true; m.mozPreservesPitch=true; m.webkitPreservesPitch=true; }catch(e){}
  host.appendChild(m); CLIP.el=m; CLIP.a=null; CLIP.b=null; CLIP.loop=false;
  CLIP.peaks=null; CLIP.waveState="loading"; CLIP.heard=false;
  $("#cLoop").classList.remove("on");
  $("#clipCtl").hidden=false;
  m.addEventListener("loadedmetadata",function(){ paintScrub(); renderClip(); });
  m.addEventListener("timeupdate",function(){
    if(CLIP.loop&&CLIP.a!=null&&CLIP.b!=null&&m.currentTime>=CLIP.b){ m.currentTime=CLIP.a; }
    paintScrub();
  });
  m.addEventListener("play",function(){ CLIP.heard=true; $("#cPlay").textContent="일시정지"; setClipPhase("listen"); });
  m.addEventListener("pause",function(){ $("#cPlay").textContent="재생"; setClipPhase(CLIP.heard?"recall":"prepare"); });
  m.addEventListener("ended",function(){ setClipPhase("recall"); });
  m.playbackRate=+$("#cRate").value||1;
  var saved=S.scripts[file.name];
  $("#scText").value = saved ? saved.map(function(x){return x.line;}).join("\n") : "";
  setClipPhase("prepare"); buildWaveform(source);
  paintScrub(); renderClip(); renderScript();
}
function dur(){ return (CLIP.el&&CLIP.el.duration&&isFinite(CLIP.el.duration))?CLIP.el.duration:0; }
function paintScrub(){
  var d=dur();
  var t2=CLIP.el?CLIP.el.currentTime:0;
  $("#cA").value=mmss(CLIP.a); $("#cB").value=mmss(CLIP.b);
  var valid=CLIP.a!=null&&CLIP.b!=null&&CLIP.b>CLIP.a;
  $("#scrub").classList.toggle("looping",!!(CLIP.loop&&valid));
  if(!d){ paintWave(); waveInfo(); return; }
  $("#scPh").style.left=(t2/d*100)+"%";
  $("#scLb").textContent=mmss(t2);
  $("#scLb2").textContent=mmss(d);
  var A=$("#scA"), B=$("#scB"), R=$("#scRng");
  if(CLIP.a!=null){ A.style.display="block"; A.style.left=(CLIP.a/d*100)+"%"; } else A.style.display="none";
  if(CLIP.b!=null){ B.style.display="block"; B.style.left=(CLIP.b/d*100)+"%"; } else B.style.display="none";
  if(valid){
    R.style.left=(CLIP.a/d*100)+"%"; R.style.width=((CLIP.b-CLIP.a)/d*100)+"%";
  } else { R.style.width="0"; }
  paintWave(); waveInfo();
}
window.addEventListener("resize",paintWave);
function renderClip(){
  var box=$("#clipList"); if(!box) return;
  var A=roleOf(today())==="a"?S.names.a:S.names.b;
  var B=roleOf(today())==="a"?S.names.b:S.names.a;
  var ra=$("#clipRa"), rb=$("#clipRb");
  if(ra) ra.textContent="A "+A;
  if(rb) rb.textContent="B "+B;

  box.innerHTML="";
  if(!S.clips.length){
    box.innerHTML='<div class="note small">저장한 구간이 없다. 파일을 열고 A와 B를 찍은 뒤 저장한다.</div>';
    return;
  }
  var cur=CLIP.file?CLIP.file.name:null;
  var groups={};
  S.clips.forEach(function(c,i){ (groups[c.f]=groups[c.f]||[]).push({c:c,i:i}); });
  Object.keys(groups).sort().forEach(function(fname){
    var h=el("div","row"); h.style.marginTop="14px";
    h.appendChild(el("b",null,fname));
    h.appendChild(el("span","tag"+(fname===cur?" o":""), fname===cur?"열려 있음":"파일을 다시 열면 재생된다"));
    box.appendChild(h);
    groups[fname].forEach(function(x){
      var c=x.c, i=x.i;
      var d=el("div","clip"+(CLIP.active===i?" on":""));
      var top=el("div","hd2");
      var left=el("div");
      left.appendChild(el("b",null,c.label||"무제"));
      left.appendChild(el("div","small mut tc",
        mmss(c.a)+"  ~  "+mmss(c.b)+"   ("+(c.b-c.a).toFixed(1)+"초)   ·   "+c.focus+"회 초점"));
      top.appendChild(left);
      var acts=el("div","row"); acts.style.gap="8px";
      if(fname===cur){
        var play=el("button","g","구간 재생");
        play.style.padding="3px 10px"; play.style.fontSize="12px";
        play.onclick=function(){
          CLIP.a=c.a; CLIP.b=c.b; CLIP.loop=true; CLIP.active=i;
          $("#cLoop").classList.add("on");
          CLIP.el.currentTime=c.a; CLIP.el.play(); paintScrub(); renderClip();
        };
        acts.appendChild(play);
      }
      var del=el("button","del","삭제");
      del.onclick=function(){
        var gone=S.clips.splice(i,1)[0]; save(); renderClip();
        offerUndo("구간 1개 삭제",function(){ S.clips.splice(i,0,gone); renderClip(); });
      };
      acts.appendChild(del);
      top.appendChild(acts); d.appendChild(top);

      var row=el("div","row"); row.style.marginTop="10px";
      var inp=el("input"); inp.placeholder="여기서 들린 표현을 적는다";
      inp.style.flex="1"; inp.style.minWidth="170px"; inp.value=c.note||"";
      inp.oninput=function(){ c.note=inp.value; save(); };
      var send=el("button","g","채집으로");
      send.onclick=function(){
        var e2=(c.note||"").trim();
        if(!e2){ inp.focus(); flash("들린 표현을 먼저 적는다"); return; }
        day(today()).coll.push({e:e2, s:fname+" "+mmss(c.a)+"-"+mmss(c.b), q:c.label||"", k:"", done:false});
        save(); renderColl(); flash("채집으로 보냈다");
        offerUndo("채집 1건 추가",function(){ day(today()).coll.pop(); renderColl(); });
      };
      row.appendChild(inp); row.appendChild(send);
      d.appendChild(row);
      box.appendChild(d);
    });
  });
}

/* 대본 동기화. 줄마다 시각을 찍어 두면 그 줄만 골라 반복할 수 있다.
   대본은 텍스트라 저장한다. 음성은 저장하지 않는다. */
function scKey(){ return CLIP.file ? CLIP.file.name : null; }
function scLines(){
  var k=scKey();
  return (k && S.scripts[k]) ? S.scripts[k] : [];
}
function renderScript(){
  var box=$("#scList"); if(!box) return;
  box.innerHTML="";
  var k=scKey();
  if(!k){ box.innerHTML='<div class="note small">파일을 먼저 연다. 대본은 파일 이름에 붙는다.</div>'; return; }
  var arr=scLines();
  if(!arr.length){ box.innerHTML='<div class="note small">대본을 붙여넣고 줄 나누기를 누른다.</div>'; return; }
  arr.forEach(function(ln,i){
    var d=el("div","clip");
    var top=el("div","hd2");
    var left=el("div"); left.style.flex="1"; left.style.minWidth="140px";
    left.appendChild(el("div",null,ln.line));
    left.appendChild(el("div","small mut tc", ln.t==null ? "시각 미지정" : mmss(ln.t)));
    top.appendChild(left);
    var acts=el("div","row"); acts.style.gap="6px";
    var mark=el("button","g","여기 찍기");
    mark.style.padding="3px 10px"; mark.style.fontSize="12px";
    mark.onclick=function(){
      if(!CLIP.el) return;
      ln.t=+CLIP.el.currentTime.toFixed(1); save(); renderScript();
    };
    acts.appendChild(mark);
    if(ln.t!=null){
      var play=el("button","g","이 줄 재생");
      play.style.padding="3px 10px"; play.style.fontSize="12px";
      play.onclick=function(){
        if(!CLIP.el) return;
        var nxt=null;
        for(var j=i+1;j<arr.length;j++){ if(arr[j].t!=null){ nxt=arr[j].t; break; } }
        CLIP.a=ln.t; CLIP.b=(nxt!=null?nxt:Math.min(dur(),ln.t+6));
        CLIP.loop=true; $("#cLoop").classList.add("on");
        CLIP.el.currentTime=ln.t; CLIP.el.play(); paintScrub();
      };
      acts.appendChild(play);
    }
    acts.appendChild(spkBtn(ln.line.replace(/^[A-Z]\s*:\s*/,"")));
    top.appendChild(acts); d.appendChild(top);
    box.appendChild(d);
  });
  var done=arr.filter(function(x){return x.t!=null;}).length;
  box.appendChild(el("div","note small","시각 지정 "+done+" / "+arr.length+"줄. 앞줄부터 순서대로 찍는다. 다음 줄 시각이 그 줄의 끝이 된다."));
}
$("#scLoad").onclick=function(){
  var k=scKey();
  if(!k){ flash("파일을 먼저 연다"); return; }
  var lines=$("#scText").value.split("\n").map(function(x){return x.trim();}).filter(Boolean);
  if(!lines.length){ flash("대본이 비어 있다"); return; }
  var old=S.scripts[k]||[];
  S.scripts[k]=lines.map(function(L){
    var hit=old.filter(function(o){return o.line===L;})[0];
    return {line:L, t: hit?hit.t:null};
  });
  save(); renderScript(); flash(lines.length+"줄로 나눴다");
};
$("#scClear").onclick=function(){
  var k=scKey(); if(!k) return;
  var gone=S.scripts[k];
  delete S.scripts[k]; save(); renderScript();
  offerUndo("대본 1개 삭제",function(){ S.scripts[k]=gone; renderScript(); });
};

$("#drop").onclick=function(){ $("#clipFile").click(); };
$("#clipFile").onchange=function(e){ if(e.target.files[0]) loadMedia(e.target.files[0]); };
["dragenter","dragover"].forEach(function(ev){
  $("#drop").addEventListener(ev,function(e){ e.preventDefault(); this.classList.add("over"); });
});
["dragleave","drop"].forEach(function(ev){
  $("#drop").addEventListener(ev,function(e){ e.preventDefault(); this.classList.remove("over"); });
});
$("#drop").addEventListener("drop",function(e){
  var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];
  if(f) loadMedia(f);
});
$("#cPlay").onclick=function(){ if(!CLIP.el) return; if(CLIP.el.paused) CLIP.el.play(); else CLIP.el.pause(); };
$("#cSetA").onclick=function(){
  if(!CLIP.el) return;
  CLIP.a=+CLIP.el.currentTime.toFixed(1);
  if(CLIP.b!=null&&CLIP.b<=CLIP.a) CLIP.b=null;
  setClipPhase("prepare"); paintScrub();
};
$("#cSetB").onclick=function(){
  if(!CLIP.el) return;
  CLIP.b=+CLIP.el.currentTime.toFixed(1);
  if(CLIP.a!=null&&CLIP.a>=CLIP.b) CLIP.a=null;
  setClipPhase("prepare"); paintScrub();
};
$("#cLoop").onclick=function(){
  if(CLIP.a==null||CLIP.b==null){ flash("A와 B를 먼저 찍는다"); return; }
  CLIP.loop=!CLIP.loop; this.classList.toggle("on",CLIP.loop);
  if(CLIP.loop&&CLIP.el){ CLIP.el.currentTime=CLIP.a; CLIP.el.play(); }
};
$("#cBack").onclick=function(){ if(CLIP.el) CLIP.el.currentTime=Math.max(0,CLIP.el.currentTime-3); };
$("#cRate").oninput=function(){
  $("#cRateN").textContent=(+this.value).toFixed(2);
  if(CLIP.el) CLIP.el.playbackRate=+this.value;
};
document.querySelectorAll("[data-nud]").forEach(function(b){
  b.onclick=function(){
    var k=b.dataset.nud, d=+b.dataset.d;
    if(CLIP[k]==null) return;
    CLIP[k]=Math.max(0,+(CLIP[k]+d).toFixed(1));
    setClipPhase("prepare"); paintScrub();
  };
});
$("#scrub").onclick=function(e){
  if(!CLIP.el||!dur()) return;
  var r=this.getBoundingClientRect();
  CLIP.el.currentTime=(e.clientX-r.left)/r.width*dur();
  setClipPhase("prepare"); paintScrub();
};
$("#cSave").onclick=function(){
  if(!CLIP.file){ flash("파일을 먼저 연다"); return; }
  if(CLIP.a==null||CLIP.b==null||CLIP.b<=CLIP.a){ flash("A와 B를 찍는다"); return; }
  S.clips.push({f:CLIP.file.name,a:CLIP.a,b:CLIP.b,label:$("#cLabel").value.trim(),
    focus:+$("#cFocus").value,note:"",date:today()});
  $("#cLabel").value=""; setClipPhase("prepare"); save(); renderClip(); flash("구간을 저장했다");
};

/* =========================================================================
   미디어 라이브러리. VOA 자체 제작 퍼블릭 도메인 52개 레슨.
   음성은 저장소 사본, 영상은 공식 원본을 필요할 때만 불러온다.
   ========================================================================= */
var MEDIA=(window.ENG_MEDIA_CATALOG&&window.ENG_MEDIA_CATALOG.items)||[];
var LIB={active:-1,mode:"audio",el:null,rate:1};
LIB.rate=(+S.rate>=0.75&&+S.rate<=1.25)?+S.rate:1;   /* 고른 속도는 남는다. T135 */

function mediaRec(){
  if(!S.media||typeof S.media!=="object") S.media={done:{},fav:{},last:null};
  if(!S.media.done) S.media.done={};
  if(!S.media.fav) S.media.fav={};
  return S.media;
}
function mediaItem(i){ return i>=0&&i<MEDIA.length?MEDIA[i]:null; }
function setMediaFlag(kind,id,on){
  var r=mediaRec();
  if(on) r[kind][id]=true; else delete r[kind][id];
  save(); renderMediaStats(); renderMediaList(); paintMediaPlayer();
}
function renderMediaStats(){
  var box=$("#libStats"); if(!box) return;
  var done=MEDIA.filter(function(x){return mediaPassCount(x.id)===3;}).length;
  var passes=MEDIA.reduce(function(n,x){return n+mediaPassCount(x.id);},0);
  var next=MEDIA.filter(function(x){return mediaPassCount(x.id)<3;})[0];
  var nextPass=next?mediaNextPass(next.id):null;
  box.innerHTML="";
  [[passes+" / "+(MEDIA.length*3),"완료한 듣기 회차"],[done+" / "+MEDIA.length,"세 회차를 마친 레슨"],
   [next?(next.id.toUpperCase()+" · "+nextPass[1]):"완료","다음 학습 초점"]].forEach(function(x){
    var d=el("div","libstat"); d.appendChild(el("b",null,x[0])); d.appendChild(el("span",null,x[1])); box.appendChild(d);
  });
}
function paintMediaPlayer(){
  var it=mediaItem(LIB.active), p=$("#libPlayer"), empty=$("#libEmpty");
  if(!p||!empty) return;
  if(!it){ p.hidden=true; empty.hidden=false; return; }
  p.hidden=false; empty.hidden=true;
  $("#libTitle").textContent=it.title;
  var n=mediaPassCount(it.id), next=mediaNextPass(it.id);
  $("#libMeta").textContent="Q"+it.quarter+" · "+it.duration+" · "+(next?(next[0]+"회 "+next[1]+" 초점"):"3회차 완료");
  var r=mediaRec(), fav=!!r.fav[it.id], done=n===3;
  $("#libFav").textContent=fav?"★ 즐겨찾기":"☆ 즐겨찾기";
  $("#libFav").classList.toggle("on",fav); $("#libFav").setAttribute("aria-pressed",fav?"true":"false");
  $("#libDone").textContent=done?"세 회차 완료":next[0]+"회 "+next[1]+" 완료";
  $("#libDone").disabled=done;
  $("#libPage").href=it.page;
  $("#libTranscript").href=it.transcript||it.page; $("#libTranscript").hidden=!it.transcript;
  $("#libWorksheet").href=it.worksheet||it.page; $("#libWorksheet").hidden=!it.worksheet;
  $("#libDownload").href=it.audio; $("#libDownload").setAttribute("download",it.id+".mp3");
  $("#libPrev").disabled=LIB.active<=0; $("#libNext").disabled=LIB.active>=MEDIA.length-1;
  document.querySelectorAll("[data-lib-mode]").forEach(function(b){ b.classList.toggle("on",b.dataset.libMode===LIB.mode); });
  renderLibPass(it); renderLibScript(it);
}

/* 3회차 진행. 기준서 10.3은 같은 자료를 최소 3회 듣되 회차마다 초점을 바꾸라고 한다.
   카탈로그의 focus 는 1회차 권장값일 뿐이고 진행은 여기서 관리한다. */
var PASSES=[[1,"소리","어디가 줄었는지만 찾는다. 무슨 말인지는 묻지 않는다"],
            [2,"청크","통째로 굴러가는 덩어리를 찾는다. 단어로 쪼개지 않는다"],
            [3,"의미","이제 내용을 잡는다. 앞의 두 회차가 먼저다"]];
function passRec(){
  var r=mediaRec(); if(!r.pass) r.pass={};
  Object.keys(r.done).forEach(function(id){
    if(r.done[id]&&!r.pass[id]) r.pass[id]={1:true,2:true,3:true};
  });
  return r.pass;
}
function mediaPassCount(id){
  var cur=passRec()[id]||{}, n=0;
  PASSES.forEach(function(p){ if(cur[p[0]]) n++; });
  return n;
}
function mediaNextPass(id){
  var cur=passRec()[id]||{};
  return PASSES.filter(function(p){return !cur[p[0]];})[0]||null;
}
function curPassDone(id,pass){ return !!((passRec()[id]||{})[pass]); }
function syncMediaDone(id){
  var r=mediaRec();
  if(mediaPassCount(id)===3) r.done[id]=true; else delete r.done[id];
}
function renderLibPass(it){
  var box=$("#libPass"); if(!box) return;
  var pr=passRec(), cur=pr[it.id]||{};
  box.innerHTML="";
  var lab=el("div","small mut","회차 초점. 같은 자료를 세 번 듣고 매번 다른 것을 찾는다");
  lab.style.marginBottom="8px"; box.appendChild(lab);
  var row=el("div","row");
  var next=mediaNextPass(it.id);
  PASSES.forEach(function(p){
    var on=!!cur[p[0]];
    var b=el("button","g"+(on?" on":""),p[0]+"회 "+p[1]);
    b.type="button"; b.title=p[2]; b.disabled=!on&&(!next||p[0]!==next[0]);
    b.onclick=function(){
      var c=pr[it.id]||(pr[it.id]={});
      if(c[p[0]]) PASSES.forEach(function(q){ if(q[0]>=p[0]) delete c[q[0]]; });
      else if(mediaNextPass(it.id)&&p[0]===mediaNextPass(it.id)[0]) c[p[0]]=true;
      syncMediaDone(it.id); save(); renderMediaStats(); paintMediaPlayer(); renderMediaList();
    };
    row.appendChild(b);
  });
  box.appendChild(row);
  var n=PASSES.filter(function(p){return !!cur[p[0]];}).length;
  var next=PASSES.filter(function(p){return !cur[p[0]];})[0];
  box.appendChild(el("div","small mut",
    n+" / 3 회차 완료"+(next?".  다음: "+next[0]+"회 "+next[1]+". "+next[2]:".  세 회차를 다 돌았다")));
}

/* 대본. 조수가 catalog 의 transcript 를 채우면 코드 수정 없이 여기로 흐른다.
   문자열 배열과 {t, line} 객체 배열을 둘 다 받는다. */
function trLines(it){
  var tr=it&&it.transcript;
  if(!Array.isArray(tr)||!tr.length) return null;
  return tr.map(function(x){
    return (typeof x==="string") ? {t:null,line:x} : {t:(typeof x.t==="number"?x.t:null),line:String(x.line||"")};
  }).filter(function(x){ return x.line; });
}
/* 대본 파일(.md)에서 본문만 뽑는다. 머리말 메타는 버린다. */
function parseTranscriptMd(txt){
  var i=txt.indexOf("## 대본");
  var body=(i>=0)?txt.slice(i+"## 대본".length):txt;
  return body.split("\n").map(function(s){return s.trim();})
    .filter(function(s){ return s && s.charAt(0)!=="#" && s.indexOf("|")!==0; })
    .map(function(s){ return {t:null,line:s}; });
}
function renderLibScript(it){
  var box=$("#libScript"); if(!box) return;
  box.innerHTML="";
  var tr=it&&it.transcript;
  if(typeof tr==="string"&&tr){
    /* 묶어 둔 판을 먼저 본다. **fetch 는 file:// 에서 막힌다.**
       이 물건은 내려받아 여는 것이 정상 사용이고 블록 4는 대본을 보는 블록이다.
       T114 에서 대본 52편을 script 한 파일로 묶었다. 그것이 있으면 그것을 쓴다. */
    var packed=(window.ENG2P_TRANSCRIPTS&&window.ENG2P_TRANSCRIPTS.items)||null;
    if(packed && packed[it.id]){
      paintLibScript(it, packed[it.id].map(function(s){return {t:null,line:s};}));
      return;
    }
    if(!packed){
      box.innerHTML='<div class="note small" style="margin-bottom:0">대본 불러오는 중</div>';
      loadData("transcripts","ENG2P_TRANSCRIPTS",function(v){
        if(mediaItem(LIB.active)!==it) return;
        if(v&&v.items&&v.items[it.id])
          paintLibScript(it, v.items[it.id].map(function(s){return {t:null,line:s};}));
        else renderLibScript(it);
      });
      return;
    }
    box.innerHTML='<div class="note small" style="margin-bottom:0">대본 불러오는 중</div>';
    fetch(tr).then(function(r){ if(!r.ok) throw new Error(r.status); return r.text(); })
      .then(function(txt){
        if(mediaItem(LIB.active)!==it) return;   // 그 사이 다른 레슨으로 넘어갔으면 버린다
        paintLibScript(it, parseTranscriptMd(txt));
      })
      .catch(function(){
        if(mediaItem(LIB.active)!==it) return;
        box.innerHTML='<div class="note small" style="margin-bottom:0"><b>대본 파일을 이 방식으로는 못 연다.</b>'+
          '<div style="margin-top:4px">로컬 파일로 열면 브라우저가 다른 파일 읽기를 막는다. '+
          '배포된 주소에서 열면 바로 나온다. 지금은 위의 저장 대본 링크를 쓴다.<br><span class="mono">'+esc(tr)+'</span></div></div>';
      });
    return;
  }
  paintLibScript(it, trLines(it));
}
function paintLibScript(it, lines){
  var box=$("#libScript"); if(!box) return;
  box.innerHTML="";
  if(!lines||!lines.length){
    box.innerHTML='<div class="note small" style="margin-bottom:0"><b>대본이 아직 없다.</b> '+
      '위의 공식 원문 링크에서 확인한다. 카탈로그에 transcript 가 채워지면 여기에 자동으로 나온다. '+
      'eng2p/tasks/gpt_backlog.md T-001</div>';
    return;
  }
  var head=el("div","row"); head.style.margin="14px 0 6px";
  head.appendChild(el("b",null,"대본 "+lines.length+"줄"));
  var toClip=el("button","g","대본을 클립으로"); toClip.type="button";
  toClip.onclick=function(){
    var name=it.id+".mp3";
    S.scripts[name]=lines.map(function(x){ return {line:x.line, t:x.t}; });
    loadClipUrl(name, it.audio, false);
    var lab=$("#cLabel"); if(lab&&!lab.value) lab.value=it.title;
    $("#scText").value=lines.map(function(x){return x.line;}).join("\n");
    save(); renderScript(); go("clip");
    flash("대본 "+lines.length+"줄을 클립으로 보냈다");
  };
  head.appendChild(toClip);
  box.appendChild(head);
  lines.forEach(function(x){
    var d=el("div","clip");
    var top=el("div","hd2");
    var left=el("div"); left.style.flex="1"; left.style.minWidth="140px";
    left.appendChild(el("div",null,x.line));
    if(x.t!=null) left.appendChild(el("div","small mut tc",mmss(x.t)));
    top.appendChild(left);
    var acts=el("div","row"); acts.style.gap="6px";
    if(x.t!=null&&LIB.el){
      var jump=el("button","g","여기부터"); jump.type="button";
      jump.style.padding="3px 10px"; jump.style.fontSize="12px";
      jump.onclick=function(){ LIB.el.currentTime=x.t; var q=LIB.el.play(); if(q&&q.catch) q.catch(function(){}); };
      acts.appendChild(jump);
    }
    acts.appendChild(spkBtn(x.line.replace(/^[^:]{1,14}:\s*/,"")));
    top.appendChild(acts); d.appendChild(top);
    box.appendChild(d);
  });
}
/* 재생기를 만들어 자리에 건다. 미디어 탭과 세션 블록이 이 하나를 같이 쓴다.
   두 자리에 따로 만들면 T121 에서 낸 망 끊김 안내가 한 자리에만 생긴다.
   **한 자리에만 있는 안내는 다른 자리에서는 없는 것이다.** */
function mountPlayer(host, it, mode, opt){
  opt=opt||{};
  host.innerHTML="";
  var isVideo=mode==="video";
  var m=document.createElement(isVideo?"video":"audio");
  m.controls=true; m.preload="metadata"; m.playsInline=true;
  m.src=isVideo?it.video:(mode==="original"?it.originalAudio:it.audio);
  m.setAttribute("aria-label",it.title+" "+(isVideo?"영상":"음성"));
  try{m.preservesPitch=true;m.mozPreservesPitch=true;m.webkitPreservesPitch=true;}catch(e){}
  m.playbackRate=opt.rate||1;
  /* 영상은 원격이다. 소리와 대본과 이미지는 저장소 안에 있다.
     망이 끊기면 영상만 죽는데 그것이 **아무 말 없이 죽는다.**
     화면에는 안 되는 재생기만 남는다. 두 사람은 앱이 고장 난 줄 안다.
     왜 안 되는지 적고 저장된 소리로 가는 길을 같이 낸다. T121 에서 재 봤다. */
  m.onerror=function(){
    var old=document.getElementById(opt.noteId); if(old) old.remove();
    var box=el("div"); box.id=opt.noteId; box.className="note small w";
    host.parentNode.insertBefore(box, host.nextSibling);
    if(isVideo){
      box.innerHTML='<b>영상을 못 불러왔다.</b> 영상은 VOA 서버에서 바로 받는다. '+
        '망이 끊겼거나 그 주소가 바뀐 것이다.<br>'+
        '<b>소리와 대본은 저장소 안에 있어 망 없이도 된다.</b> '+
        '<button class="g" type="button" style="margin-top:7px">저장된 소리로</button>';
      var ta=box.querySelector("button");
      if(ta) ta.onclick=function(){ if(opt.onAudio) opt.onAudio(); };
    }else{
      box.innerHTML='<b>소리를 못 불러왔다.</b> '+
        '<span class="mono">'+esc(m.src)+'</span> 자리를 확인한다. '+
        '저장소를 통째로 내려받았는지 본다.';
    }
  };
  host.appendChild(m);
  if(opt.play){ var q=m.play(); if(q&&q.catch) q.catch(function(){}); }
  return m;
}
function openMedia(i,mode,play){
  var it=mediaItem(i); if(!it) return;
  LIB.active=i; LIB.mode=mode||"audio";
  var r=mediaRec(); r.last=it.id; save();
  if(LIB.el){ try{LIB.el.pause();}catch(e){} }
  var oldNote=$("#libMediaNote"); if(oldNote) oldNote.remove();
  LIB.el=mountPlayer($("#libMediaHost"), it, LIB.mode, {
    rate: LIB.rate, play: play!==false, noteId: "libMediaNote",
    onAudio: function(){ openMedia(LIB.active,"audio",true); },
  });
  paintMediaPlayer(); renderMediaList();
}
function renderMediaList(){
  var box=$("#libList"); if(!box) return;
  if(!MEDIA.length){
    box.innerHTML='<div class="note w small">미디어 목록을 불러오지 못했다. media/english/catalog.js 경로를 확인한다.</div>';
    return;
  }
  var q=$("#libQ").value, state=$("#libFilter").value;
  var needle=$("#libSearch").value.trim().toLowerCase(), r=mediaRec();
  var shown=MEDIA.map(function(x,i){return {x:x,i:i};}).filter(function(o){
    var x=o.x;
    if(q!=="all"&&String(x.quarter)!==q) return false;
    if(state==="done"&&mediaPassCount(x.id)<3) return false;
    if(state==="todo"&&mediaPassCount(x.id)===3) return false;
    if(state==="fav"&&!r.fav[x.id]) return false;
    return !needle||(x.title+" "+x.lesson+" "+x.focus).toLowerCase().indexOf(needle)>=0;
  });
  $("#libCount").textContent="전체 "+MEDIA.length+"개 중 "+shown.length+"개 표시";
  box.innerHTML="";
  shown.forEach(function(o){
    var x=o.x, passN=mediaPassCount(x.id), d=el("article","mitem"+(o.i===LIB.active?" on":"")+(passN===3?" done":""));
    if(x.image){
      var img=document.createElement("img"); img.className="mthumb"; img.src=x.image;
      img.alt=x.title+" 대표 이미지"; img.loading="lazy"; img.decoding="async"; d.appendChild(img);
    }
    var top=el("div","row");
    top.appendChild(el("span","mnum","Q"+x.quarter+" · "+x.id.toUpperCase()));
    var grow=el("span"); grow.style.flex="1"; top.appendChild(grow);
    if(r.fav[x.id]) top.appendChild(el("span","tag a","즐겨찾기"));
    if(passN===3) top.appendChild(el("span","tag o","3회 완료"));
    d.appendChild(top); d.appendChild(el("h4",null,x.title));
    var next=mediaNextPass(x.id);
    d.appendChild(el("div","small mut",x.duration+" · "+(next?"다음: "+next[0]+"회 "+next[1]:"소리·청크·의미 완료")));
    var passRow=el("div","mpasses");
    PASSES.forEach(function(p){ passRow.appendChild(el("span","mpass"+(curPassDone(x.id,p[0])?" done":""),p[1]+(curPassDone(x.id,p[0])?" ✓":""))); });
    d.appendChild(passRow);
    var acts=el("div","macts");
    var ab=el("button","b",passN?"이어서 듣기":"음성 듣기"); ab.type="button"; ab.onclick=function(){openMedia(o.i,"audio",true); $("#libPlayerCard").scrollIntoView({behavior:"smooth",block:"start"});};
    var fa=el("button","g",r.fav[x.id]?"★":"☆"); fa.type="button"; fa.title="즐겨찾기"; fa.setAttribute("aria-label",x.title+" 즐겨찾기");
    fa.onclick=function(){setMediaFlag("fav",x.id,!r.fav[x.id]);};
    var res=document.createElement("details"); res.className="mresources";
    var sum=document.createElement("summary"); sum.textContent="자료"; res.appendChild(sum);
    var links=el("div","mresourcebox");
    function addLink(label,href){ if(!href) return; var a=el("a",null,label); a.href=href; a.target="_blank"; a.rel="noopener noreferrer"; links.appendChild(a); }
    addLink("전체 영상",x.video); addLink("저장 대본",x.transcript); addLink("수업 PDF",x.worksheet); addLink("공식 원문",x.page);
    res.appendChild(links);
    acts.appendChild(ab); acts.appendChild(fa); acts.appendChild(res); d.appendChild(acts); box.appendChild(d);
  });
  if(!shown.length) box.innerHTML='<div class="note small">조건에 맞는 레슨이 없다.</div>';
}
function renderMedia(){
  mediaRec(); renderMediaStats(); renderMediaList();
  if(LIB.active<0&&S.media.last){
    var i=MEDIA.findIndex(function(x){return x.id===S.media.last;});
    if(i>=0) openMedia(i,"audio",false);
  }else paintMediaPlayer();
}

document.querySelectorAll("[data-lib-mode]").forEach(function(b){
  b.onclick=function(){ if(LIB.active>=0) openMedia(LIB.active,b.dataset.libMode,true); };
});
$("#libFav").onclick=function(){ var x=mediaItem(LIB.active); if(x) setMediaFlag("fav",x.id,!mediaRec().fav[x.id]); };
$("#libDone").onclick=function(){
  var x=mediaItem(LIB.active); if(!x) return;
  var next=mediaNextPass(x.id); if(!next) return;
  var c=passRec()[x.id]||(passRec()[x.id]={}); c[next[0]]=true;
  syncMediaDone(x.id); save(); renderMediaStats(); paintMediaPlayer(); renderMediaList();
};
$("#libPrev").onclick=function(){ if(LIB.active>0) openMedia(LIB.active-1,LIB.mode,true); };
$("#libNext").onclick=function(){ if(LIB.active<MEDIA.length-1) openMedia(LIB.active+1,LIB.mode,true); };
$("#libBack").onclick=function(){ if(LIB.el) LIB.el.currentTime=Math.max(0,LIB.el.currentTime-3); };

/* 라이브러리와 클립 도구를 잇는다.
   여기까지 와야 파이프라인이 하나로 돈다.
   레슨 -> 구간 반복 -> 들린 표현 채집 -> 주간 판정 -> 간격 반복 복습. */
$("#libToClip").onclick=function(){
  var it=mediaItem(LIB.active); if(!it) return;
  if(LIB.el){ try{ LIB.el.pause(); }catch(e){} }
  var isVid=LIB.mode==="video";
  var src=isVid?it.video:(LIB.mode==="original"?it.originalAudio:it.audio);
  loadClipUrl(it.id+(isVid?".mp4":".mp3"), src, isVid);
  var lab=$("#cLabel"); if(lab&&!lab.value) lab.value=it.title;
  go("clip");
  flash(it.title+" 를 클립으로 보냈다");
};
/* **선을 두 자리에서 다르게 두면 안 된다.** 전에는 여기가 0.6~1.2 였고
   세션 칸은 0.75~1.25 였다. 같은 값을 두 자리가 다르게 잘랐다. 로드맵 11.9의
   0.75~1.25 로 맞췄다. setRate 가 그 선을 지키는 한 자리다. T135 */
$("#libRate").oninput=function(){ setRate(+this.value); };
setRate(rateOf());   /* 저장해 둔 속도를 화면에 올린다 */
$("#libSearch").oninput=renderMediaList; $("#libQ").onchange=renderMediaList; $("#libFilter").onchange=renderMediaList;

