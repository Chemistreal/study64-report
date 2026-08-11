/* 늦게 읽는 묶음. app/late/ 에서 나온다. 손으로 안 고친다. */
var CLIP={el:null,url:null,file:null,loop:false,a:null,b:null,active:-1,
  peaks:null,waveState:"idle",waveToken:0,heard:false,phase:"prepare",beat:null};

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
  var bt=beatNow();
  if(bt&&bt.segs.length){
    var y=rect.height-2, d2=dur();
    ctx.globalAlpha=.9; ctx.lineWidth=3; ctx.lineCap="butt";
    ctx.strokeStyle=css.getPropertyValue("--a2").trim()||"#0ea5e9";
    bt.segs.forEach(function(g){
      ctx.beginPath();
      ctx.moveTo(g.t0/d2*rect.width,y); ctx.lineTo(g.t1/d2*rect.width,y); ctx.stroke();
    });
    ctx.fillStyle=css.getPropertyValue("--a1").trim()||"#6366f1";
    bt.segs.forEach(function(g){
      ctx.beginPath();
      ctx.arc(g.top/d2*rect.width, 3, 2.5, 0, Math.PI*2); ctx.fill();
    });
  }
  ctx.globalAlpha=1;
}

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
var BEAT_PAUSE_S=0.18;   /* 이만큼 조용하면 쉼이다 */
var BEAT_MIN_SEG_S=0.12; /* 이보다 짧은 소리는 마디로 안 센다 */
var BEAT_FLOOR=0.06;     /* 이 아래는 무조건 조용한 것으로 본다 */
var BEAT_REL=0.22;       /* 그 파일에서 큰 쪽의 이만큼이 문턱이다 */

function beatFloor(peaks){
  var s=peaks.slice().sort(function(a,b){ return b-a; });
  var top=s[Math.min(9,s.length-1)]||0;
  return Math.max(BEAT_FLOOR, top*BEAT_REL);
}

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
    if(end-from>=minN){
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
      if(from>=0&&quiet>=gapN) close(i-quiet+1);
    }
  }
  close(peaks.length);
  return {thr:thr, per:per, segs:segs};
}

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
  var say=p.same
    ? "제일 길고 제일 센 마디가 "+(p.longest+1)+"번째다 ("+p.len.toFixed(1)+"초)"
    : "제일 긴 마디 "+(p.longest+1)+"번째 ("+p.len.toFixed(1)+"초) · "+
      "제일 센 마디 "+(p.loudest+1)+"번째";
  say+=" · 마디 안 어디인지는 안 잰다";
  if(box.textContent!==say) box.textContent=say;
}

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
  var say="기준 "+d.refDur.toFixed(1)+"초 · 이 파일 "+d.myDur.toFixed(1)+"초"+
    " ("+d.ratio.toFixed(2)+"배)";
  say+= d.mySegs===d.refSegs
    ? " · 마디 수는 같다 ("+d.mySegs+"개)"
    : " · 마디 "+d.mySegs+"개 대 기준 "+d.refSegs+"개";
  if(box.textContent!==say) box.textContent=say;
}

function beatGaps(r){
  if(!r||r.segs.length<2) return [];
  var out=[];
  for(var i=1;i<r.segs.length;i++) out.push(r.segs[i].t0-r.segs[i-1].t1);
  return out;
}

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

$("#cSave").onclick=function(){
  if(!CLIP.file){ flash("파일을 먼저 연다"); return; }
  if(CLIP.a==null||CLIP.b==null||CLIP.b<=CLIP.a){ flash("A와 B를 찍는다"); return; }
  S.clips.push({f:CLIP.file.name,a:CLIP.a,b:CLIP.b,label:$("#cLabel").value.trim(),
    focus:+$("#cFocus").value,note:"",date:today()});
  $("#cLabel").value=""; setClipPhase("prepare"); save(); renderClip(); flash("구간을 저장했다");
};
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
    var tag=el("span","tag");
    function paint(){
      var v=passVal(curQ,c.k);
      if(v==null){ tag.textContent="미측정"; tag.className="tag"; }
      else if(v>=c.need){ tag.textContent="통과"; tag.className="tag o"; }
      else { tag.textContent="미통과"; tag.className="tag w"; }
    }
    if(passAuto(c.k)){
      var got=el("span","mono"); got.style.width="110px"; got.style.flex="none";
      got.style.textAlign="right"; got.textContent=String(passVal(curQ,c.k));
      meta.textContent=c.u+" "+c.need+" 이상 · 기준 "+c.src+" · 앱이 셌다. 다시 안 적는다";
      row.appendChild(got); row.appendChild(tag);
    }else{
      var inp=el("input"); inp.type="number"; inp.style.width="110px"; inp.style.flex="none";
      inp.value=(st.pass[c.k]!=null?st.pass[c.k]:"");
      inp.oninput=function(){ st.pass[c.k]= inp.value===""?null:+inp.value; save(); paint(); summary(); if(c.fill) c.fill(); };
      row.appendChild(inp); row.appendChild(tag);
    }
    card.appendChild(row);
    var mo=el("div","n small"); mo.style.display="none";
    card.appendChild(mo);
    (function(c2,box2){
      function fill(){
        var v=passVal(curQ,c2.k);
        if(v!=null && v>=c2.need){ box2.style.display="none"; return; }
        var d=DATA.more;
        if(!d){ loadData("more","ENG2P_MORE",function(){ fill(); }); return; }
        var it=(d.items||[]).filter(function(x){ return x.k===c2.k; })[0];
        if(!it){ box2.style.display="none"; return; }
        box2.style.display="";
        box2.innerHTML='<b>더 돌 자리</b> '+
          (it.plays.length
            ? it.plays.map(function(p){ return esc(p.name); }).join(" · ")+
              ' <span class="mut">('+esc(it.track)+' 트랙 판)</span>'
            : esc(it.alt))+
          '. <b>지난 강으로 안 돌아간다.</b>';
      }
      c2.fill=fill; fill();
    })(c, mo);
    box.appendChild(card); paint();
  });
  var who=el("div","note small");
  who.innerHTML='<b>이 숫자는 둘의 것이다.</b> 서로에게 재고 <b>낮은 쪽</b>을 적는다. '+
    '통과는 둘 다 넘어야 하는 것이라 높은 쪽을 적으면 낮은 쪽이 사라진다. '+
    '<b>누가 낮은지는 안 적는다.</b>';
  box.appendChild(who);
  var gap=el("div","note w small");
  gap.innerHTML='<b>이 숫자가 강의를 막지 않는다.</b> 앱은 96강을 차례로 낸다. '+
    '기준서 2.2 는 조건을 통과해야 다음 분기로 간다고 적었다. '+
    '<b>어긋난 자리고 개정문 19번에 적어 뒀다.</b> '+
    '못 넘은 것은 그 트랙 드릴을 더 돌아서 넘는다. 강의를 멈추고 기다리지 않는다.';
  box.appendChild(gap);
  var sum=el("div","note small"); sum.id="qSum"; box.appendChild(sum);
  function summary(){
    var n=PASS[curQ].filter(function(c){var v=passVal(curQ,c.k);return v!=null&&v>=c.need;}).length;
    sum.textContent="통과 "+n+" / "+PASS[curQ].length+" 트랙. 미통과 트랙은 그대로 그 분기에 남는다. 남는 게 지연이 아니라 설계다.";
  }
  summary();
  $("#qFoot").textContent="기준 표시가 [운용]인 항목은 기준서에 숫자가 없어 이 콘솔에서 정한 값이다. 기준서 개정 시 함께 고친다.";

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
    var hits=rxHits(curQ);
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
    var now, ok;
    if(b.kind==="all"){
      now=0;
      (PASS[b.quarter]||[]).forEach(function(c){
        var v=passVal(b.quarter,c.k);
        if(v!=null && v>=c.need) now++;
      });
      ok = now>=b.need;
    }else{
      now = passVal(b.quarter, b.key);
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

var VOICE={rec:null, chunks:[], url:null, cmp:0};
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
  if(typeof renderVoiceCmp==="function") renderVoiceCmp();
}

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


function voiceCmpList(){
  var d=DATA.voice, log=voiceLog(), out=[];
  if(!d) return out;
  (d.weeks||[]).forEach(function(w){
    var k=voiceKey(w.week), r=log[k];
    if(r) out.push({week:w.week, when:w.when, file:r.file, at:r.at});
  });
  return out;
}

function renderVoiceCmp(){
  var box=$("#voiceCmp"); if(!box) return;
  var list=voiceCmpList();
  if(list.length<2){ box.hidden=true; box.innerHTML=""; return; }
  box.hidden=false;
  if(VOICE.cmp==null || VOICE.cmp>=list.length) VOICE.cmp=0;
  var i=VOICE.cmp, cur=list[i], d=DATA.voice;
  var ears=((d.at.clusters||[]).concat(d.at.multi||[]))
    .filter(function(x,n,a){ return a.indexOf(x)===n; });
  var h='<div class="hd2" style="margin-top:10px"><b>나란히 듣기</b>'+
        '<span class="small mut">'+(i+1)+' / '+list.length+'</span></div>';
  h+='<p class="small mut">처음 것부터 잇달아 듣는다. '+
     '<b>앱은 좋아졌는지를 안 말한다.</b> 듣고 두 사람이 정한다.</p>';
  h+='<div class="note"><b>지금 여는 것</b> '+esc(cur.when)+
     ' <span class="small mut">'+cur.week+'주</span><br>'+
     '<b class="mono">'+esc(cur.file)+'</b><br>'+
     '<span class="small">클립 탭에서 이 파일을 연다. 파일은 이 기기에 있다.</span></div>';
  if(ears.length)
    h+='<div class="n"><b>어디를 듣나</b> '+esc(ears.join(" · "))+
       ' <span class="small mut">이 낱말들이 이 줄을 고른 까닭이다. '+
       '나아졌는지는 앱이 안 정한다.</span></div>';
  h+='<div class="row" style="gap:8px;margin-top:8px">'+
     '<button class="g" type="button" data-vcmp="-1"'+(i?"":" disabled")+'>앞엣것</button>'+
     '<button class="g" type="button" data-vcmp="1"'+
       (i<list.length-1?"":" disabled")+'>다음 것</button>'+
     '<button class="g" type="button" id="vcName">이름 복사</button>'+
     '<button class="b" type="button" id="vcGo">클립 탭으로</button></div>';
  box.innerHTML=h;
  box.querySelectorAll("[data-vcmp]").forEach(function(b){
    b.onclick=function(){ VOICE.cmp=i+(+b.dataset.vcmp); renderVoiceCmp(); };
  });
  if($("#vcName")) $("#vcName").onclick=function(){
    copy(cur.file, null); flash("파일 이름을 복사했다");
  };
  if($("#vcGo")) $("#vcGo").onclick=function(){ go("clip"); };
}
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
  var map=[["wcCause","cause"],["wcLre","lre"],["wcColl","coll"],["wcFirst","first"],
           ["wcBlock","block"],["wcOdd","odd"],["wcAsk","ask"]];
  map.forEach(function(k){
    fillField(k[0], r[k[1]]||"");
    var el=document.getElementById(k[0]);
    if(el) el.oninput=function(){ r[k[1]]=el.value; save(); };
  });
  if($("#wcQ")) $("#wcQ").onclick=function(){ go("quarter"); };
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
  if(!e || !e.n){ box.hidden=true; box.innerHTML=""; return; }
  box.hidden=false;
  var h='<div class="hd2"><b>개정 요청 '+e.n+'건</b>'+
        '<span class="small mut">매뉴얼 1항</span></div>';
  if(!e.open){
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
function trackDone(){
  return Math.min(96, Math.floor(doneSessions()/3));
}

function renderTrack(){
  var box=$("#trackBox"); if(!box) return;
  var d=DATA.track;
  if(!d){
    box.innerHTML='<div class="small mut">트랙 표를 여는 중이다.</div>';
    loadData("track","ENG2P_TRACK",function(){ renderTrack(); });
    return;
  }
  var done=trackDone(), pl=plan(), q=pl.quarter||"Q1";
  var h='<p class="small mut">강의 96편에 트랙이 하나씩 붙어 있다. '+
        '<b>지금 '+done+'강까지 마쳤다.</b><br>'+
        '<b>트랙마다 속도가 다른 것이 정상이다.</b> '+
        '기준서 3.1 이 분기마다 비중을 다르게 잡았다.</p>';
  h+='<table class="mgtab"><tr><th scope="col">트랙</th>'+
     '<th scope="col">지금까지</th><th scope="col">이 분기</th>'+
     '<th scope="col">다음</th></tr>';
  (d.tracks||[]).forEach(function(t){
    var got=(t.nos||[]).filter(function(n){ return n<=done; }).length;
    var qn=(t.q||{})[q]||0;
    var nx=null;
    (t.nos||[]).forEach(function(n,i){
      if(nx===null && n>done) nx=(t.weeks||[])[i];
    });
    h+='<tr><td>'+esc(t.track)+'</td>'+
       '<td class="mono">'+got+' / '+t.all+'</td>'+
       '<td class="small">'+(qn ? '<span class="mono">'+qn+'</span>강'
                                : '<span class="mut">이 분기에는 없다</span>')+'</td>'+
       '<td class="small mut">'+(nx===null ? '다 지났다' : nx+'주')+'</td></tr>';
  });
  h+='</table>';
  h+='<div class="n">여기 있는 것은 <b>차림표를 어디까지 지났는가</b>다. '+
     '그 트랙이 몸에 붙었는지는 분기 통과 조건이 재고 그중 열둘은 사람이 잰다.<br>'+
     '<b>둘이 같이 지난 것이다.</b> 사람마다 다르게 가는 것은 진도가 아니라 실력이다.</div>';
  box.innerHTML=h;
}
var SOURCES=[
 {n:"VOA Learning English", lic:"퍼블릭 도메인. 교육과 상업 목적 재배포 허용. 출처 표기 필요",
  u:"https://learningenglish.voanews.com",
  good:"Q1 주력. Level One 은 어휘 1500단어에 속도가 느리고 대본이 같이 온다. 소리 트랙과 청크 트랙 둘 다 된다. Let's Learn English 52과는 이미 미디어 탭에 받아 두었다. C-real 이라 Q1 통과 판정에 쓸 수 있다.",
  bad:"낭독 뉴스라 실제 대화의 겹침과 중단이 없다. 2층 자료로는 못 쓴다."},
 {n:"LibriVox", lic:"퍼블릭 도메인 오디오북. 자원 봉사 녹음",
  u:"https://librivox.org",
  good:"원문 텍스트가 있어 소리와 글자를 붙일 수 있다. 강세 박자 관찰에 좋다. 화자가 많아 목소리 변이를 준다.",
  bad:"낭독체다. 녹음 품질이 들쭉날쭉하다. 2층 아님."},
 {n:"Santa Barbara Corpus of Spoken American English", lic:"CC BY-ND 3.0 US. 가공 금지. 자르거나 편집해서 재배포하지 않는다",
  u:"https://www.linguistics.ucsb.edu/research/santa-barbara-corpus-spoken-american-english",
  good:"2층 전용이다. 미국 각지의 자연 대화 60건, 각 20분 내외. 전사가 무료이고 인토네이션 단위로 타임스탬프가 붙어 있어 어디서 끊기고 겹치는지 눈으로 확인된다.",
  bad:"Q1에는 너무 빠르다. Q2 3층 대조판부터 쓴다. 음성은 Internet Archive 사본을 쓴다: https://archive.org/details/santabarbara_201509"}
];
var SRC_COND={
 1:{len:"2~4분",spd:"느림. Level One 급",spk:"1~2인",top:"일상, 집, 음식",
    types:["VOA Learning English Level One 기사","LibriVox 단편 낭독","교과서 부속 음원","느린 속도 뉴스 낭독","동일 화자의 짧은 독백"]},
 2:{len:"3~6분",spd:"보통보다 약간 느림",spk:"2인",top:"일상, 관계, 일",
    types:["VOA Level Two","인터뷰 형식 낭독","오디오북 대화 장면","교육용 대담","같은 주제 다른 화자 2종"]},
 3:{len:"5~10분",spd:"보통",spk:"2~3인",top:"판단, 돈, 가르침",
    types:["VOA Level Three","Santa Barbara Corpus 발췌 구간","공개 강연","패널 대담","오디오북 다인 낭독"]},
 4:{len:"10분 이상",spd:"제한 없음",spk:"3인 이상",top:"전 영역",
    types:["Santa Barbara Corpus 전체","공개 회의 녹음","자유 대담","다지역 화자 모음","속도 무보정 자료"]}
};
var SRC_PASS=[
 ["1회","소리","어디가 줄었는지만 찾는다. 무슨 말인지는 묻지 않는다.","각자 표시한 지점을 대조한다"],
 ["2회","청크","통째로 굴러가는 덩어리를 찾는다. 단어로 쪼개지 않는다.","각자 3개씩 적고 겹치는 것을 본다"],
 ["3회","의미","이제 내용을 잡는다. 앞의 두 회차가 먼저다.","한 사람이 요약하고 다른 사람이 보탠다"]
];
var MPAIRS=[
 {t:"/r/ 와 /l/", why:"한국어 유음 하나가 둘을 다 덮어서 구분이 안 된다", w:[["right","light"],["rock","lock"],["pray","play"],["correct","collect"]]},
 {t:"/f/ 와 /p/", why:"한국어에 순치 마찰음이 없어서 파열음으로 대치한다", w:[["fan","pan"],["coffee","copy"],["fool","pool"],["four","pour"]]},
 {t:"/v/ 와 /b/", why:"같은 이유로 유성 순치 마찰음이 파열음이 된다", w:[["van","ban"],["vest","best"],["curve","curb"],["very","berry"]]},
 {t:"/th/ 와 /s/", why:"한국어에 치간 마찰음이 없다", w:[["think","sink"],["thick","sick"],["mouth","mouse"],["path","pass"]]},
 {t:"/sh/ 와 /s/", why:"한국어 구개음화 규칙이 전이돼 앞모음 앞에서 갈린다", w:[["she","see"],["sheet","seat"],["ship","sip"],["shore","sore"]]},
 {t:"긴 i 와 짧은 i", why:"한국어는 길이로 이 둘을 가르지 않는다", w:[["sheep","ship"],["seat","sit"],["feel","fill"],["leave","live"]]},
 {t:"a 와 e", why:"한국어 모음 체계에 중간값이 없어 하나로 뭉친다", w:[["bad","bed"],["sat","set"],["man","men"],["had","head"]]},
 {t:"자음군", why:"한국어 음절 구조가 자음군을 허용하지 않아 모음을 끼워 넣는다", w:[["street","street"],["sprint","sprint"],["glimpse","glimpse"],["asked","asked"]]}
];
var curSrcQ=1;

var REPO="https://github.com/Chemistreal/study64-report/blob/main/eng2p/";
var DOCS=[
 {g:"강의 24편", n:"01강부터 24강. 소리 15, 청크 4, repair 3, 화용 2",
  f:(function(){var a=[];for(var i=1;i<=24;i++){var s=("00"+i).slice(-3);
    a.push({t:("0"+i).slice(-2)+"강", u:"out/lectures/eng2p_q1_l"+s+".md"});}return a;})()},
 {g:"드릴 카드 150장", n:"판정 75, 압박 25, 확장 20, 역할 10, repair 20",
  f:[{t:"001-050",u:"out/cards/eng2p_card_q1_001_050.md"},
     {t:"051-100",u:"out/cards/eng2p_card_q1_051_100.md"},
     {t:"101-150",u:"out/cards/eng2p_card_q1_101_150.md"},
     {t:"배정표",u:"out/cards/eng2p_card_plan_q1.md"}]},
 {g:"대조 교차 세트 72개", n:"주 6세트. 한 파일이 한 주다",
  f:(function(){var a=[];for(var i=1;i<=12;i++){var s=("0"+i).slice(-2);
    a.push({t:s+"주", u:"out/sets/eng2p_set_w"+s+".md"});}return a;})()},
 {g:"산출 과제집 12주분", n:"주 1개. 한 문장씩 번갈아 만든다",
  f:(function(){var a=[];for(var i=1;i<=12;i++){var s=("0"+i).slice(-2);
    a.push({t:s+"주", u:"out/tasks/eng2p_task_w"+s+".md"});}return a;})()},
 {g:"그 밖", n:"조준표, 비상판, 매뉴얼, 대장, 점검 보고서",
  f:[{t:"입력 조준표",u:"out/input/eng2p_input_q1.md"},
     {t:"비상판 20개",u:"out/emergency/eng2p_emg_001_020.md"},
     {t:"운영 매뉴얼",u:"out/manual/eng2p_manual.md"},
     {t:"진행 대장",u:"out/manual/eng2p_ledger.md"},
     {t:"Q1 점검 보고서",u:"out/manual/eng2p_q1_review.md"}]}
];

var DOCS2=[
 {g:"강의 24편", n:"25강부터 48강. 청크 9, 소리 4, 자동화 6, repair 3, 문법 2",
  f:(function(){var a=[];for(var i=25;i<=48;i++){var s=("00"+i).slice(-3);
    a.push({t:i+"강", u:"out/lectures/eng2p_q2_l"+s+".md"});}return a;})()},
 {g:"드릴 카드 150장", n:"판정 35, 압박 40, 확장 40, 역할 15, repair 20",
  f:[{t:"001-050",u:"out/cards/eng2p_card_q2_001_050.md"},
     {t:"051-100",u:"out/cards/eng2p_card_q2_051_100.md"},
     {t:"101-150",u:"out/cards/eng2p_card_q2_101_150.md"},
     {t:"배정표",u:"out/cards/eng2p_card_plan_q2.md"}]},
 {g:"대조 교차 세트 72개", n:"13주부터 24주. 20주와 24주에 관계 점검이 붙는다",
  f:(function(){var a=[];for(var i=13;i<=24;i++){var s=("0"+i).slice(-2);
    a.push({t:s+"주", u:"out/sets/eng2p_set_w"+s+".md"});}return a;})()},
 {g:"3층 대조판 6장", n:"1층과 2층 병치. 2주에 한 장. 기준서 6.4",
  f:(function(){var a=[];for(var i=1;i<=6;i++){var s=("00"+i).slice(-3);
    a.push({t:s, u:"out/dialog/eng2p_dialog_q2_"+s+".md"});}
    a.push({t:"운용 문서",u:"out/dialog/eng2p_dialog_manual.md"});return a;})()},
 {g:"산출 과제집 12주분", n:"주 1개. 분량 250자",
  f:(function(){var a=[];for(var i=13;i<=24;i++){var s=("0"+i).slice(-2);
    a.push({t:s+"주", u:"out/tasks/eng2p_task_w"+s+".md"});}return a;})()},
 {g:"그 밖", n:"조준표, 비상판, 점검 보고서",
  f:[{t:"입력 조준표",u:"out/input/eng2p_input_q2.md"},
     {t:"비상판 20개",u:"out/emergency/eng2p_emg_021_040.md"},
     {t:"Q2 점검 보고서",u:"out/manual/eng2p_q2_review.md"}]}
];

var DOCS3=[
 {g:"강의 24편", n:"49강부터 72강. 자동화 9, 청크 5, 문법 4, repair 3, 화용 3",
  f:(function(){var a=[];for(var i=49;i<=72;i++){var s=("00"+i).slice(-3);
    a.push({t:i+"강", u:"out/lectures/eng2p_q3_l"+s+".md"});}return a;})()},
 {g:"드릴 카드 150장", n:"판정 20, 압박 45, 확장 35, 역할 25, repair 25. 제한 시간 3초",
  f:[{t:"001-050",u:"out/cards/eng2p_card_q3_001_050.md"},
     {t:"051-100",u:"out/cards/eng2p_card_q3_051_100.md"},
     {t:"101-150",u:"out/cards/eng2p_card_q3_101_150.md"},
     {t:"배정표",u:"out/cards/eng2p_card_plan_q3.md"}]},
 {g:"대조 교차 세트 72개", n:"25주부터 36주. 32주에 관계 점검, 36주에 분기 마감",
  f:(function(){var a=[];for(var i=25;i<=36;i++){var s=("0"+i).slice(-2);
    a.push({t:s+"주", u:"out/sets/eng2p_set_w"+s+".md"});}return a;})()},
 {g:"3층 대조판 6장", n:"1층과 2층 병치. 2주에 한 장. 기준서 6.4",
  f:(function(){var a=[];for(var i=1;i<=6;i++){var s=("00"+i).slice(-3);
    a.push({t:s, u:"out/dialog/eng2p_dialog_q3_"+s+".md"});}
    a.push({t:"운용 문서",u:"out/dialog/eng2p_dialog_manual.md"});return a;})()},
 {g:"산출 과제집 12주분", n:"주 1개. 분량 400자",
  f:(function(){var a=[];for(var i=25;i<=36;i++){var s=("0"+i).slice(-2);
    a.push({t:s+"주", u:"out/tasks/eng2p_task_w"+s+".md"});}return a;})()},
 {g:"그 밖", n:"조준표, 비상판, 점검 보고서",
  f:[{t:"입력 조준표",u:"out/input/eng2p_input_q3.md"},
     {t:"비상판 20개",u:"out/emergency/eng2p_emg_041_060.md"},
     {t:"Q3 점검 보고서",u:"out/manual/eng2p_q3_review.md"}]}
];

function renderDocs(){
  var box=$("#srcDocs"); if(!box) return; box.innerHTML="";
  var q=(typeof curSrcQ!=="undefined"&&curSrcQ)?curSrcQ:1;
  var ttl=$("#srcDocsTitle"); if(ttl) ttl.textContent=(q>=3?"Q3":(q>=2?"Q2":"Q1"))+" 교재";
  var nt=$("#srcDocsNote"); if(nt) nt.textContent=(q>=4?"Q4 제작물은 아직 없다. Q3 것을 보여 준다.":"");
  (q>=3?DOCS3:(q>=2?DOCS2:DOCS)).forEach(function(g){
    var d=el("div","card");
    d.appendChild(el("h4",null,g.g));
    d.appendChild(el("div","small mut",g.n));
    var r=el("div","row"); r.style.flexWrap="wrap"; r.style.marginTop="6px";
    g.f.forEach(function(f){
      var a=el("a","tag"); a.textContent=f.t; a.href=REPO+f.u;
      a.target="_blank"; a.rel="noopener noreferrer"; r.appendChild(a);
    });
    d.appendChild(r); box.appendChild(d);
  });
}

function renderSrc(){
  renderDocs();
  var box=$("#srcList"); box.innerHTML="";
  SOURCES.forEach(function(s){
    var d=el("div","src");
    d.appendChild(el("h4",null,s.n));
    var a=el("a",null,s.u); a.href=s.u; a.target="_blank"; a.rel="noopener noreferrer";
    d.appendChild(a);
    d.appendChild(el("div","lic","라이선스: "+s.lic));
    d.appendChild(el("div","small","쓰는 법: "+s.good));
    d.appendChild(el("div","small mut","한계: "+s.bad));
    box.appendChild(d);
  });

  var tb=$("#srcQTabs"); tb.innerHTML="";
  [1,2,3,4].forEach(function(q){
    var b=el("button","g"+(q===curSrcQ?" on":""),"Q"+q);
    b.onclick=function(){ curSrcQ=q; renderSrc(); }; tb.appendChild(b);
  });
  var c=SRC_COND[curSrcQ];
  $("#srcCond").innerHTML='<div class="card"><div class="grid g3">'+
    '<div><div class="small mut">길이</div><b>'+c.len+'</b></div>'+
    '<div><div class="small mut">속도</div><b>'+c.spd+'</b></div>'+
    '<div><div class="small mut">화자 수</div><b>'+c.spk+'</b></div>'+
    '<div><div class="small mut">주제 범위</div><b>'+c.top+'</b></div></div>'+
    '<div class="small mut" style="margin-top:12px">조건을 채우는 재료 유형 5종</div><ul style="margin:6px 0 0;padding-left:18px">'+
    c.types.map(function(x){return '<li class="small">'+esc(x)+'</li>';}).join("")+'</ul></div>';

  $("#srcPass").innerHTML='<tr><th scope="col">회차</th><th scope="col">초점</th><th scope="col">찾을 것</th><th scope="col">상호 확인</th></tr>'+
    SRC_PASS.map(function(r){
      return '<tr><td class="mono">'+r[0]+'</td><td><span class="tag a">'+r[1]+'</span></td><td>'+r[2]+'</td><td class="mut">'+r[3]+'</td></tr>';
    }).join("");

  $("#srcCollect").innerHTML=
    '<div class="small">채집은 2층 자료 확보를 겸한다. 의미가 아니라 <b>양상</b>을 적는다.</div>'+
    '<ul style="margin:10px 0;padding-left:18px">'+
    ['누가 먼저 말했나','어디서 끊겼나','어떻게 고쳐 말했나','못 알아들었을 때 뭐라고 되물었나','두 사람이 동시에 말한 곳이 있었나']
      .map(function(x){return '<li class="small">'+x+'</li>';}).join("")+'</ul>'+
    '<div class="note small" style="margin-bottom:0">적은 것은 판정 탭으로 올린다. 출처 없이 올리지 않는다.</div>';

  var mb=$("#mpList"); mb.innerHTML="";
  MPAIRS.forEach(function(g){
    var d=el("div","src");
    d.appendChild(el("h4",null,g.t));
    d.appendChild(el("div","lic","한국어에서는 "+g.why+". 그래서 영어에서 두 소리가 한 소리로 들린다."));
    var row=el("div","row"); row.style.marginTop="8px";
    g.w.forEach(function(pair){
      var uniq = pair[0]===pair[1];
      var label = uniq ? pair[0] : pair[0]+" / "+pair[1];
      var b=el("button","g",label);
      b.style.fontSize="13px";
      b.onclick=function(){
        TTS.stop=false;
        if(uniq){ spk(pair[0]); }
        else { try{speechSynthesis.cancel();}catch(e){} playSeq([pair[0],pair[1]],1); }
      };
      if(!TTS.ok) b.disabled=true;
      row.appendChild(b);
    });
    d.appendChild(row);
    mb.appendChild(d);
  });
}
$("#srcCopy").onclick=function(){
  var L=["# 채집 기록","","날짜: "+today(),"자료: ","링크: ","구간: ","",
    "| 항목 | 적은 것 |","|---|---|",
    "| 누가 먼저 말했나 |  |","| 어디서 끊겼나 |  |","| 어떻게 고쳐 말했나 |  |",
    "| 되묻기 표현 |  |","| 동시에 말한 곳 |  |","",
    "## 판정 받을 표현","","| 표현 | 출처 | 궁금한 점 |","|---|---|---|","|  |  |  |"];
  copy(L.join("\n"), $("#srcMsg"));
};

function renderRules(){
  var w=$("#wall"); w.innerHTML="";
  var h=el("div");
  h.appendChild(el("h4",null,"2인 영어 세션 규칙 카드"));
  h.appendChild(el("div","small mut","오늘의 A : 짝수 날 = "+S.names.a+" / 홀수 날 = "+S.names.b));
  w.appendChild(h);
  var s1=el("div","wc-sec");
  var t=el("table");
  t.innerHTML='<tr><th scope="col">블록</th><th scope="col">시간</th><th scope="col">형태</th></tr>'+
    BLOCKS.map(function(b,i){return '<tr><td>'+(i+1)+' '+b.n+'</td><td class="n">'+b.m+'분</td><td>'+b.d+'</td></tr>';}).join("");
  s1.appendChild(t); w.appendChild(s1);

  var s2=el("div","wc-sec"); s2.appendChild(el("h4",null,"말할 때"));
  var u=el("ul");
  ['"틀렸다" 대신 "나는 이렇게 이해했다"','못 알아들으면 넘어가지 말고 되묻는다','막히면 한국어로 새지 말고 아는 말로 돌려 말한다']
    .forEach(function(x){u.appendChild(el("li",null,x));});
  s2.appendChild(u); w.appendChild(s2);

  var s3=el("div","wc-sec"); s3.appendChild(el("h4",null,"하지 않는 것"));
  var u2=el("ul");
  ["한글로 발음 적기","한국어 자막","단어장 외우기","눈으로 복습하기","번역해서 말하기"]
    .forEach(function(x){u2.appendChild(el("li",null,x));});
  s3.appendChild(u2); w.appendChild(s3);

  var s4=el("div","wc-sec"); s4.appendChild(el("h4",null,"끝내기 전 30초"));
  var u3=el("ul");
  ["LRE 몇 번이었는지 적는다","해결 안 된 것 한 줄로 적는다"].forEach(function(x){u3.appendChild(el("li",null,x));});
  s4.appendChild(u3);
  s4.appendChild(el("div","small mut","하루 빠졌으면 다음 날은 무조건 한다. 안 되면 비상판 15분. 비상판도 수행일이다."));
  w.appendChild(s4);

  $("#banA").innerHTML='<tr><th scope="col">항목</th><th scope="col">구간</th><th scope="col">이유</th></tr>'+
    BAN_A.map(function(x){return '<tr><td>'+x[0]+'</td><td class="mut">'+x[1]+'</td><td class="mut">'+x[2]+'</td></tr>';}).join("");
  $("#banB").innerHTML='<tr><th scope="col">항목</th><th scope="col">이유</th></tr>'+
    BAN_B.map(function(x){return '<tr><td>'+x[0]+'</td><td class="mut">'+x[1]+'</td></tr>';}).join("");
  $("#failTbl").innerHTML='<tr><th scope="col">시점</th><th scope="col">현상</th><th scope="col">원인</th><th scope="col">대응</th></tr>'+
    FAILPT.map(function(x){return '<tr><td class="mono">'+x[0]+'</td><td>'+x[1]+'</td><td class="mut">'+x[2]+'</td><td class="mut">'+x[3]+'</td></tr>';}).join("");
}
