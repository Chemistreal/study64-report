/* =========================================================================
   클립. 로컬 파일 구간 반복.
   파일은 objectURL 로만 다룬다. 업로드도 저장도 하지 않는다.
   남는 것은 파일 이름과 시각과 메모뿐이다.
   ========================================================================= */
var CLIP={el:null,url:null,file:null,loop:false,a:null,b:null,active:-1,
  peaks:null,waveState:"idle",waveToken:0,heard:false,phase:"prepare"};

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

