/* =========================================================================
   클립. 로컬 파일 구간 반복.
   파일은 objectURL 로만 다룬다. 업로드도 저장도 하지 않는다.
   남는 것은 파일 이름과 시각과 메모뿐이다.
   ========================================================================= */
var CLIP={el:null,url:null,file:null,loop:false,a:null,b:null,active:-1,
  peaks:null,waveState:"idle",waveToken:0,heard:false,phase:"prepare",beat:null};

/* 기준으로 잡아 둔 파형 (T365). **원본을 잡아 두고 내 녹음을 겹쳐 본다.**
   이 화면을 닫으면 없어진다. `S` 에 안 넣는다 (`beat.md` 6장).
   소리가 아니라 320칸짜리 눈금이지만 남기면 그것이 두 사람의 숫자가 된다. */
var REF=null;

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
    /* 마디 수를 같이 적는다 (T364). **판정 낱말을 안 쓴다.**
       "고르다" 나 "들쭉날쭉하다" 는 판정이고 그것은 상대가 한다 (`beat.md` 5장).
       길이를 모르면 이 자리가 통째로 없다. **모르면 안 적는다.** */
    var bt=beatNow();
    msg="실제 음성 파형"+
      (bt ? " · 마디 "+bt.segs.length+"개 · 쉼 "+beatGaps(bt).length+"군데" : "")+
      (REF ? " · 기준 "+REF.name+" 을 옅게 겹쳤다" : "")+
      " · A와 B 사이를 골라 반복한다.";
  }else if(CLIP.waveState==="loading"){
    msg="실제 음성 파형 분석 중";
  }else if(CLIP.waveState==="failed"){
    msg="이 파일은 파형을 읽을 수 없다. 구간 시각과 반복 기능은 그대로 쓴다.";
  }else{
    msg="파일을 열면 실제 음성 파형을 분석한다.";
  }
  if(info.textContent!==msg) info.textContent=msg;
  renderDiff(); renderStress();
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
  /* 기준을 먼저 옅게 깐다 (T365). **뒤에 깔아야 내 파형이 위에 온다.**
     가로는 칸 번호로 맞춘다. 둘 다 320칸이라 **길이가 달라도 모양이 겹친다.**
     길이 차이는 그림이 아니라 글로 적는다 (T366). */
  if(REF&&REF.peaks&&REF.name!==(CLIP.file&&CLIP.file.name)){
    ctx.globalAlpha=.3; ctx.lineWidth=Math.max(1,rect.width/REF.peaks.length*.7);
    ctx.lineCap="round"; ctx.strokeStyle=muted;
    REF.peaks.forEach(function(p,i){
      var x=(i+.5)/REF.peaks.length*rect.width, amp=Math.max(1.5,p*maxH);
      ctx.beginPath(); ctx.moveTo(x,mid-amp); ctx.lineTo(x,mid+amp); ctx.stroke();
    });
  }
  ctx.lineWidth=Math.max(1,rect.width/count*.7); ctx.lineCap="round";
  CLIP.peaks.forEach(function(p,i){
    var x=(i+.5)/count*rect.width, amp=Math.max(1.5,p*maxH);
    ctx.globalAlpha=i/count<=now?.82:.34; ctx.strokeStyle=i/count<=now?active:future;
    ctx.beginPath(); ctx.moveTo(x,mid-amp); ctx.lineTo(x,mid+amp); ctx.stroke();
  });
  /* 마디를 아래에 띠로 깐다 (T364). **파형을 안 가린다.**
     파형 위에 금을 그으면 어느 것이 소리고 어느 것이 금인지 헷갈린다.
     띠는 바닥에 붙어 있고 마디 하나가 한 토막이다. */
  var bt=beatNow();
  if(bt&&bt.segs.length){
    var y=rect.height-2, d2=dur();
    ctx.globalAlpha=.9; ctx.lineWidth=3; ctx.lineCap="butt";
    ctx.strokeStyle=css.getPropertyValue("--a2").trim()||"#0ea5e9";
    bt.segs.forEach(function(g){
      ctx.beginPath();
      ctx.moveTo(g.t0/d2*rect.width,y); ctx.lineTo(g.t1/d2*rect.width,y); ctx.stroke();
    });
    /* 마디마다 봉우리에 점 하나 (T367). **위쪽 여백에 찍는다.**
       파형 위에 찍으면 소리와 헷갈리고 아래에 찍으면 마디 띠와 겹친다. */
    ctx.fillStyle=css.getPropertyValue("--a1").trim()||"#6366f1";
    bt.segs.forEach(function(g){
      ctx.beginPath();
      ctx.arc(g.top/d2*rect.width, 3, 2.5, 0, Math.PI*2); ctx.fill();
    });
  }
  ctx.globalAlpha=1;
}

/* 마디를 그때 세고 안 남긴다 (`beat.md` 6장). **파일이 바뀌면 다시 센다.**
   `CLIP.beat` 은 그 파일을 여는 동안만 있는 값이고 저장소에 안 들어간다. */
function beatNow(){
  if(!CLIP.peaks||!CLIP.peaks.length) return null;
  var d2=dur();
  if(!d2) return null;
  if(!CLIP.beat||CLIP.beat.per*CLIP.peaks.length!==d2)
    CLIP.beat=beatSegs(CLIP.peaks,d2);
  return CLIP.beat;
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
    CLIP.peaks=peaks; CLIP.beat=null; CLIP.waveState="ready"; paintWave(); waveInfo();
  }).catch(function(){
    if(token!==CLIP.waveToken) return;
    CLIP.peaks=null; CLIP.waveState="failed"; paintWave(); waveInfo();
  });
}
/* =========================================================================
   마디 뽑기 (T363). **박자를 잰다. 음소는 안 잰다.**

   기준서 2.2 Q1 이 "강세 박자 재현" 을 통과 조건에 넣었고 8장 표가
   "한국어는 음절 박자, 영어는 강세 박자" 라고 적었다. **크기만 있으면
   어디서 소리가 나고 어디서 쉬는지가 나온다.** 음소는 필요 없다.

   규격은 `docs/beat.md` 다. 아래 값 넷이 그 문서 4장 표와 같아야 하고
   `scripts/check_beat.js` 가 그것을 대 본다.

   **이것은 판정이 아니라 눈금이다.** 앱이 어느 쪽이 맞는지 말하지 않는다.
   ========================================================================= */
var BEAT_PAUSE_S=0.18;   /* 이만큼 조용하면 쉼이다 */
var BEAT_MIN_SEG_S=0.12; /* 이보다 짧은 소리는 마디로 안 센다 */
var BEAT_FLOOR=0.06;     /* 이 아래는 무조건 조용한 것으로 본다 */
var BEAT_REL=0.22;       /* 그 파일에서 큰 쪽의 이만큼이 문턱이다 */

/* 문턱을 그 파일에서 낸다 (`beat.md` 4.1). **기기마다 녹음 크기가 다르다.**
   고정 문턱을 쓰면 작게 녹음한 쪽은 통째로 쉼이 된다.
   제일 큰 칸을 안 쓴다. 한 번 튄 잡음이 문턱을 통째로 올린다. */
function beatFloor(peaks){
  var s=peaks.slice().sort(function(a,b){ return b-a; });
  var top=s[Math.min(9,s.length-1)]||0;
  return Math.max(BEAT_FLOOR, top*BEAT_REL);
}

/* 마디를 뽑는다. **초로 정하고 칸으로 바꾼다** (`beat.md` 3장).
   320칸은 파일 길이와 상관없이 320칸이라 칸으로 규칙을 적으면
   5초 파일과 30초 파일에서 뜻이 여섯 배 달라진다.

   길이를 모르면 `null` 을 낸다. **어림해서 안 뽑는다.** */
function beatSegs(peaks, dur){
  if(!peaks||!peaks.length) return null;
  if(!(dur>0)) return null;
  var per=dur/peaks.length;
  var gapN=Math.max(1,Math.ceil(BEAT_PAUSE_S/per));
  var minN=Math.max(1,Math.ceil(BEAT_MIN_SEG_S/per));
  var thr=beatFloor(peaks);
  var segs=[], from=-1, quiet=0;
  function close(end){
    if(from<0) return;
    /* **`a` 와 `b` 를 안 쓴다.** 이 저장소에서 그 두 글자는 사람이다 (T345 T360).
       시작과 끝에 같은 이름을 붙이면 사람별 칸 검사가 걸고 그것이 맞다. */
    if(end-from>=minN){
      /* 마디 안에서 제일 센 자리 (T367). **음절이 아니라 봉우리다.**
         영어는 강세 자리가 길고 세다. 그 둘을 마디 단위로만 잰다. */
      var top=from, amp=peaks[from];
      for(var k=from;k<end;k++) if(peaks[k]>amp){ amp=peaks[k]; top=k; }
      segs.push({t0:from*per, t1:end*per, n:end-from, top:top*per, amp:amp});
    }
    from=-1;
  }
  for(var i=0;i<peaks.length;i++){
    if(peaks[i]>=thr){
      if(from<0) from=i;
      quiet=0;
    }else{
      quiet++;
      /* **쉼이 다 차야 마디를 닫는다.** 한 칸 조용한 것은 낱말 안에도 있다 */
      if(from>=0&&quiet>=gapN) close(i-quiet+1);
    }
  }
  close(peaks.length);
  return {thr:thr, per:per, segs:segs};
}

/* 제일 긴 마디와 제일 센 마디 (T367). **몇 번째인지를 낸다.**

   영어는 강세 박자라 마디 길이가 들쭉날쭉하다 (기준서 8장 표).
   그런데 **들쭉날쭉한 정도를 앱이 판정하지 않는다** (`beat.md` 5장).
   어디가 제일 긴지 어디가 제일 센지만 짚고 그다음은 두 사람이 본다.

   마디가 둘보다 적으면 짚을 것이 없다. **하나뿐인 것을 제일이라고 안 한다.** */
function beatPick(r){
  if(!r||r.segs.length<2) return null;
  var lo=0, hi=0, i;
  for(i=1;i<r.segs.length;i++){
    if(r.segs[i].t1-r.segs[i].t0 > r.segs[lo].t1-r.segs[lo].t0) lo=i;
    if(r.segs[i].amp > r.segs[hi].amp) hi=i;
  }
  return {longest:lo, loudest:hi, len:r.segs[lo].t1-r.segs[lo].t0,
          same:lo===hi};
}
function renderStress(){
  var box=$("#clipStress"); if(!box) return;
  var p=beatPick(beatNow());
  if(!p){ box.hidden=true; box.textContent=""; return; }
  box.hidden=false;
  /* **같으면 같다고 적는다.** 두 줄로 나눠 적으면 다른 자리로 읽힌다 */
  var say=p.same
    ? "제일 길고 제일 센 마디가 "+(p.longest+1)+"번째다 ("+p.len.toFixed(1)+"초)"
    : "제일 긴 마디 "+(p.longest+1)+"번째 ("+p.len.toFixed(1)+"초) · "+
      "제일 센 마디 "+(p.loudest+1)+"번째";
  say+=" · 마디 안 어디인지는 안 잰다";
  if(box.textContent!==say) box.textContent=say;
}

/* 기준과 이 파일의 차이 (T366). **그림으로 안 보이는 것만 낸다.**
   겹친 그림은 가로를 칸 번호로 맞춰서 길이 차이가 안 보인다 (`beat.md` 10.1).

   **판정을 안 낸다.** 몇 배인지와 몇 개인지만 낸다.
   기준이 없거나 길이를 모르면 `null` 이다. 없는 것을 0으로 안 적는다. */
function beatDiff(){
  if(!REF||!(REF.dur>0)) return null;
  var bt=beatNow(), d2=dur();
  if(!bt||!(d2>0)) return null;
  if(REF.name===(CLIP.file&&CLIP.file.name)) return null;
  return {refDur:REF.dur, myDur:d2, ratio:d2/REF.dur,
          refSegs:REF.segs, mySegs:bt.segs.length};
}
function renderDiff(){
  var box=$("#clipDiff"); if(!box) return;
  var d=beatDiff();
  if(!d){ box.hidden=true; box.textContent=""; return; }
  box.hidden=false;
  /* **배수를 적고 어느 쪽이 나은지는 안 적는다.** 느린 것이 나쁜 것이 아니다.
     0.8배로 듣는 것이 사다리의 첫 칸이다 (`bench_music.md` 6.1). */
  var say="기준 "+d.refDur.toFixed(1)+"초 · 이 파일 "+d.myDur.toFixed(1)+"초"+
    " ("+d.ratio.toFixed(2)+"배)";
  say+= d.mySegs===d.refSegs
    ? " · 마디 수는 같다 ("+d.mySegs+"개)"
    : " · 마디 "+d.mySegs+"개 대 기준 "+d.refSegs+"개";
  if(box.textContent!==say) box.textContent=say;
}

/* 마디 사이의 쉼. **마디가 하나면 쉼이 없다.** 0개를 0으로 적는다 */
function beatGaps(r){
  if(!r||r.segs.length<2) return [];
  var out=[];
  for(var i=1;i<r.segs.length;i++) out.push(r.segs[i].t0-r.segs[i-1].t1);
  return out;
}

/* 마디 길이가 고른가 (`beat.md` 1장). **고르면 음절 박자다.**
   퍼진 정도를 평균으로 나눈다. 파일 길이가 달라도 견줄 수 있는 값이 된다.
   마디가 둘보다 적으면 낼 값이 없다. **없는 것을 0으로 안 적는다.** */
function beatSpread(r){
  if(!r||r.segs.length<2) return null;
  var d=r.segs.map(function(s){ return s.t1-s.t0; });
  var m=d.reduce(function(a,b){ return a+b; },0)/d.length;
  if(!(m>0)) return null;
  var v=d.reduce(function(a,b){ return a+(b-m)*(b-m); },0)/d.length;
  return Math.sqrt(v)/m;
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
  CLIP.peaks=null; CLIP.beat=null; CLIP.waveState="loading"; CLIP.heard=false;
  $("#cLoop").classList.remove("on");
  $("#clipCtl").hidden=false;
  /* 파형과 길이가 따로 온다. **길이가 늦게 오면 그때 마디를 센다** (T364).
     먼저 왔을 때 못 세고 끝나면 마디 줄이 영영 안 뜬다. */
  m.addEventListener("loadedmetadata",function(){
    CLIP.beat=null; paintScrub(); paintWave(); waveInfo(); renderClip(); });
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
  setClipPhase("prepare"); paintRef(); buildWaveform(source);
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
/* 클립 조작. **대본 절을 갈라 내면서 여기로 돌아왔다** (T365).
   자를 자리를 글 첫머리로 잡았더니 뒤에 붙어 있던 클립 단추들이 같이 딸려 갔다.
   **가르는 자리는 글의 시작이 아니라 일의 끝이다.** */
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
/* 기준으로 잡기 (T365). **한 단추다.** 잡혀 있으면 지우는 단추가 된다.
   두 단추면 어느 것이 켜졌는지를 또 봐야 한다 (T334 녹음 단추와 같은 결). */
$("#cRef").onclick=function(){
  if(REF){ REF=null; paintRef(); paintWave(); waveInfo(); return; }
  var bt=beatNow();
  if(!CLIP.peaks||!bt){
    flash("파형을 아직 못 읽었다. 다 읽고 나서 잡는다"); return;
  }
  REF={name:(CLIP.file&&CLIP.file.name)||"", peaks:CLIP.peaks.slice(),
       dur:dur(), segs:bt.segs.length};
  paintRef(); paintWave(); waveInfo();
  flash("기준으로 잡았다. 다음 파일을 열면 겹쳐 보인다");
};
/* 단추 글자와 안내. **잡아 둔 것이 무엇인지 이름을 적는다.**
   안 적으면 무엇을 기준으로 보고 있는지 두 사람이 모른다. */
function paintRef(){
  var b=$("#cRef"); if(!b) return;
  b.textContent=REF?"기준 지우기":"기준으로 잡기";
  b.classList.toggle("on",!!REF);
}
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
