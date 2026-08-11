/* =========================================================================
   대본 동기. 줄을 누르면 그 자리로 가고 들으면 그 줄이 밝아진다.

   **시각은 어림이다.** T126 에서 확인했다. 줄별 시각은 lessonData 에도
   자막 파일에도 없다. eng2p/out/data/cues.js 는 그 과의 실제 길이를
   글자 수로 나눈 것이고 쉼을 안 셌다. docs/audio_timing.md 에 근거가 있다.

   **어림이라고 화면에 적는다.** 시각 앞에 물결표를 붙이고 머리에 한 줄 쓴다.
   그러지 않으면 두 사람이 이 숫자를 사실로 읽는다. 영어 제로라 가릴 수가 없다.
   ========================================================================= */
function fmtT(s){
  s=Math.max(0,Math.round(s));
  return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
}
/* 잡아 둔 자리. 두 사람이 들으면서 찍은 것이다. 기기에 남는다.
   S.cues = { "lle1-01": { "4": 9.2 } } 꼴이다. 줄 번호는 문자열로 들어온다. */
/* **줄 번호로 저장한다. 그러니 대본 줄 수가 바뀌면 그 번호가 딴 줄을 가리킨다.**
   지금 대본은 고정이지만 파생기를 고치면 줄이 하나 늘거나 준다. 실제로 T126 에
   머리말 읽는 자리를 건드렸다. 그때 잡아 둔 자리가 통째로 한 칸씩 밀리는데
   **화면에서는 잘 도는 것처럼 보인다.** 잡았던 줄에 초록 표시가 그대로 있다.
   줄 수를 같이 적어 두고 다르면 버린다. 버렸다고 말한다. */
function cueRec(id, n){
  if(!S.cues) S.cues={};
  var r=S.cues[id];
  if(r && typeof n==="number" && typeof r._n==="number" && r._n!==n){
    delete S.cues[id]; r=null; save();
    flash("대본 줄 수가 바뀌어 잡아 둔 자리를 지웠다");
  }
  if(!r){ r=S.cues[id]={}; }
  if(typeof n==="number") r._n=n;
  return r;
}
function cueFixed(id,i){
  var r=(S.cues||{})[id]; var v=r&&r[i];
  return (typeof v==="number") ? v : null;
}
function cueCount(id){
  var r=(S.cues||{})[id]; if(!r) return 0;
  var n=0; for(var k in r) if(k!=="_n") n++;
  return n;
}
/* 실제로 쓸 시각. **잡은 자리는 못이고 그 사이를 어림으로 편다.**
   한 줄만 잡아도 그 앞뒤가 다 같이 맞아 든다. 어림의 모양은 그대로 두고
   길이만 늘이고 줄이기 때문이다. 잡은 자리가 늘수록 표가 굳는다. */
function effCues(id, cue, dur){
  if(!cue||!cue.length) return null;
  var n=cue.length, fix=(S.cues||{})[id]||{};
  var anchors=[{i:0, t:(typeof fix[0]==="number")?fix[0]:0}];
  for(var i=1;i<n;i++) if(typeof fix[i]==="number") anchors.push({i:i, t:fix[i]});
  var end=(typeof dur==="number" && dur>0) ? dur : cue[n-1]+1;
  anchors.push({i:n, t:end});          // 끝은 소리의 길이다. 늘 못이다
  var out=new Array(n), k=0;
  for(var a=0;a<anchors.length-1;a++){
    var p=anchors[a], q=anchors[a+1];
    /* 어림 자리도 소리 길이 위에 폈다. 그러니 마지막 줄 다음 자리는 곧 소리의 끝이다.
       여기서 그 끝을 딴 값으로 어림하면 **못을 하나도 안 박았는데 표가 바뀐다.**
       실제로 한 번 그렇게 만들었고 27.03초짜리 줄이 23.13초로 당겨졌다. T129 */
    var cp=cue[p.i]==null?0:cue[p.i], cq=(q.i>=n)?end:cue[q.i];
    var span=cq-cp;
    for(k=p.i;k<Math.min(q.i,n);k++){
      out[k]= (span>0) ? p.t+(q.t-p.t)*(cue[k]-cp)/span : p.t;
      out[k]=Math.round(out[k]*100)/100;
    }
  }
  return out;
}
/* 대본 가리기. **1회차에 글을 보면 소리를 안 듣는다.**
   기준서 10.3의 회차 초점이 소리 / 청크 / 의미다. 글이 다 보이면 세 회차가 다 의미가 된다.
   그래서 회차가 기본값을 정한다. 두 사람이 바꿀 수 있지만 기본은 회차를 따른다.

   0 다 보임 · 1 덩어리만 · 2 가림
   블록 1은 1회차라 가림, 블록 4는 2회차라 덩어리만이다. */
/* 가림도 회차를 따른다. 1회차는 소리라 다 가리고, 2회차는 덩어리만 주고,
   **3회차는 의미라 다 보여 준다.** 글을 봐야 무슨 말인지를 듣는다. */
function veilOf(round){
  if(SESS.veil!=null) return SESS.veil;
  return round===1 ? 2 : round===2 ? 1 : 0;
}
var VEILNAME=["다 보임","덩어리만","가림"];
function maskOf(line, veil){
  var body=line.replace(/^[A-Z][A-Za-z .\'-]{0,20}:\s*/,"");
  var w=body.split(/\s+/).filter(Boolean).length;
  if(veil===2) return w+"낱말";
  var first=(body.split(/\s+/).filter(Boolean)[0]||"");
  return first+" ... "+w+"낱말";
}
function renderSyncScript(it, round){
  var tr=DATA.transcripts, cu=DATA.cues, al=DATA.audiolen;
  if(!tr||!cu||!al){
    if(!tr) loadData("transcripts","ENG2P_TRANSCRIPTS",function(){ renderBlockPane(); });
    if(!cu) loadData("cues","ENG2P_CUES",function(){ renderBlockPane(); });
    if(!al) loadData("audiolen","ENG2P_AUDIOLEN",function(){ renderBlockPane(); });
    return dataWait("대본을","audiolen");
  }
  var lines=(tr.items||{})[it.id], cue=(cu.items||{})[it.id];
  if(!lines||!lines.length) return '<div class="n"><b>이 과는 대본이 없다.</b> '+
    '소리는 그대로 듣는다. 대본이 있는 과는 미디어 탭 목록에 표시가 붙는다.</div>';
  var eff=effCues(it.id, cue, (al.items||{})[it.id]);
  var nfix=cueCount(it.id);
  var veil=veilOf(round);
  /* 안내는 짧게. **긴 안내는 안 읽힌다.** 두 사람이 세션 중에 보는 칸이다.
     어림이라는 것과 고칠 수 있다는 것 둘만 남긴다. T133 */
  var h='<div class="syncnote">대본 '+lines.length+'줄 · 누르면 그 자리로 간다. '+
    '<b>시각은 어림이다</b>(물결표). 그 줄이 날 때 <b>여기</b> 를 누르면 앞뒤가 같이 맞아 든다.'+
    (nfix?' · '+nfix+'줄 잡았다':'')+'</div>'+
    (veil?'<div class="syncnote"><b>'+VEILNAME[veil]+'.</b> '+
      (veil===2?'글을 보면 소리를 안 듣는다. 그래서 가린다.'
               :'첫 낱말과 길이만 준다. 덩어리로 끊어 듣는 자리다.')+'</div>'
        :'<div class="syncnote"><b>다 보임.</b> 이제 무슨 말인지를 본다.</div>')+
    '<div class="syncscript veil'+veil+'" id="sessScript">';
  lines.forEach(function(s,i){
    var t=eff?eff[i]:null, fixed=cueFixed(it.id,i)!=null;
    h+='<button type="button" class="scline'+(fixed?" fixed":"")+
       (SESS.loop!=null&&i>=SESS.loop&&i<SESS.loop+loopSpan()?" loop":"")+'" data-cue="'+i+'">'+
       /* 시각을 모르는 줄이다. em-dash 를 쓰고 있었다. 절대 규칙에 걸린다. T152 */
       /* **줄 번호는 원본 차례에서 나온다.** 보이는 것만 세면 안 된다.
          가리기 회차에서는 글이 마스크로 덮이는데 줄은 그대로 있다.
          그래도 두 기기가 서로 다른 것을 가리는 판이 오면 (T240) 보이는 것만
          세는 순간 "위에서 세 번째" 가 서로 다른 줄이 된다. T248 */

       /* **줄 번호는 원본 차례에서 나온다.** 보이는 것만 세면 안 된다.
          가리기 회차에서는 글이 마스크로 덮이는데 줄은 그대로 있다.
          그래도 두 기기가 서로 다른 것을 가리는 판이 오면 (T240) 보이는 것만
          세는 순간 "위에서 세 번째" 가 서로 다른 줄이 된다. T248 */
       '<span class="lno">'+(i+1)+'</span>'+
       '<span class="sct">'+(t==null?"--":(fixed?"":"~")+fmtT(t))+'</span>'+
       '<span class="scl" data-mask="'+esc(maskOf(s,veil||1))+'">'+esc(s)+'</span>'+
       '<span class="sca" data-anchor="'+i+'" role="button" tabindex="0" '+
       'title="지금 나는 자리를 이 줄로 잡는다">'+(fixed?"지움":"여기")+'</span></button>';
  });
  return h+'</div>';
}
/* 지금 어느 줄인지를 **class 만 바꿔서** 칠한다.
   다시 그리면 재생기가 죽는다. T125 에서 그것 때문에 칸을 안 그리게 만들었다.
   여기서 innerHTML 을 건드리면 그 일을 도로 무른 것이 된다. */
/* 그 줄이 끝나는 자리. 다음 줄의 시작이고 마지막 줄이면 소리의 끝이다. */
function lineEnd(i){
  var c=SESS.cue; if(!c) return null;
  if(i+1<c.length) return c[i+1];
  /* 마지막 줄의 끝은 소리의 끝이다. **재생기가 아는 값을 먼저 쓴다.**
     audiolen.js 는 mp3 프레임을 세서 낸 값이라 브라우저보다 0.1초쯤 길다.
     인코더가 앞뒤에 붙인 빈 자리를 브라우저는 빼고 프레임 세기는 못 뺀다.
     T136 에 52과를 다 재 봤고 -0.08 에서 -0.107초로 늘 같은 쪽이었다.
     그 0.1초 때문에 **마지막 줄 되풀이가 한 바퀴도 안 돌았다.**
     끝에 못 닿으니 소리가 그냥 끝나 버린다. 재 보기 전에는 몰랐다. */
  if(SESS.el && SESS.el.duration > 0) return SESS.el.duration;
  var al=DATA.audiolen;
  return (al&&al.items&&al.items[SESS.id]) || null;
}
/* 되풀이하는 구간의 끝. 한 줄이면 그 줄의 끝이고 여러 줄이면 마지막 줄의 끝이다.
   **여러 줄이 필요한 이유가 있다.** 3회차 초점은 의미다. 한 줄만 돌면
   앞뒤가 없어서 무슨 말인지 모른다. 주고받는 두세 줄이 한 덩어리다. */
function loopEnd(){
  if(SESS.loop==null) return null;
  return lineEnd(SESS.loop+(SESS.loopN||1)-1);
}
function loopSpan(){ return (SESS.loopN||1); }
function paintLap(){
  var lap=$("#sessLap"); if(lap) lap.textContent=(SESS.laps||0)+"번 돌았다";
  var r=$("#sessRate"); if(r) r.textContent="속도 "+rateOf().toFixed(2)+"배";
}
/* 배속. **0.75에서 1.25까지다.** 그 밖은 못 고른다.
   더 늦추면 소리가 늘어져서 이어 말하기의 리듬이 없어진다.
   더 빠르게 하면 두 사람이 못 따라간다. 기준서 10.3의 회차 구조가 무너진다.

   피치는 유지한다. `preservesPitch` 를 재생기 만들 때 켠다.
   안 켜면 늦출 때 목소리가 낮아지고 **그 낮아진 소리를 따라 하게 된다.**
   그것은 다른 소리를 익히는 것이다.

   **고른 속도는 남는다.** 두 사람이 정한 것을 다음 날 다시 정하게 하지 않는다. */
var RATE_MIN=0.75, RATE_MAX=1.25, RATE_STEP=0.05;
function rateOf(){
  var v=+(S.rate||1);
  return (v>=RATE_MIN && v<=RATE_MAX) ? v : 1;
}
function setRate(v){
  v=Math.round(Math.min(RATE_MAX, Math.max(RATE_MIN, v))*100)/100;
  S.rate=v; saveNow();
  if(typeof LIB!=="undefined"){ LIB.rate=v; if(LIB.el) LIB.el.playbackRate=v; }
  if(SESS.el) SESS.el.playbackRate=v;
  var sl=$("#libRate"); if(sl) sl.value=v;
  var sn=$("#libRateN"); if(sn) sn.textContent=v.toFixed(2);
  paintLap();
}
function syncCur(){
  paintLap();
  var box=$("#sessScript"); if(!box||!SESS.el||!SESS.cue) return;
  var t=SESS.el.currentTime, c=SESS.cue, i=0;
  /* 되풀이. **A-B 를 손으로 안 찍는다.** 줄의 시작과 끝이 이미 A 와 B 다.
     소리든 영상이든 같은 자리에서 돈다. 재생기가 하나이기 때문이다. */
  if(SESS.loop!=null){
    var a=c[SESS.loop], b=loopEnd();
    if(b!=null && t>=b-0.03){
      SESS.laps=(SESS.laps||0)+1;
      try{ SESS.el.currentTime=a; }catch(e){}
      paintLap();
      /* 한 바퀴 돌 때 아주 짧고 여린 소리. **듣던 것 위에 얹히는 소리다.**
         크면 대본을 덮는다. 여기 소리는 알림이 아니라 표시다. */
      tone("loop");
      return;
    }
    if(t<a-0.5){ try{ SESS.el.currentTime=a; }catch(e){} return; }
  }
  for(var k=0;k<c.length;k++){ if(c[k]<=t) i=k; else break; }
  if(i===SESS.line) return;
  SESS.line=i;
  var was=box.querySelector(".scline.cur"); if(was) was.classList.remove("cur");
  var now=box.children[i]; if(!now) return;
  now.classList.add("cur");
  /* 목록 안에서만 굴린다. 페이지를 굴리면 재생기가 화면 밖으로 나간다. */
  box.scrollTop=Math.max(0, now.offsetTop-box.clientHeight/2+now.offsetHeight/2);
}
/* 자리를 잡는다. **못을 아무 데나 박으면 표가 뒤집힌다.**
   앞 줄보다 이르거나 뒷 줄보다 늦으면 거절한다. 그때는 안 잡느니만 못하다. */
function anchorLine(it, i){
  if(!SESS.el){ flash("소리를 먼저 튼다"); return; }
  var cu=DATA.cues, al=DATA.audiolen;
  var cue=(cu&&cu.items&&cu.items[it.id])||null; if(!cue) return;
  var rec=cueRec(it.id, cue.length);
  if(cueFixed(it.id,i)!=null){
    var gone=rec[i];
    delete rec[i]; save(); renderBlockPane();
    flash((i+1)+"번째 줄 자리를 지웠다");
    /* 자리를 잡는 데는 그 줄까지 듣고 멈춰야 한다. 잘못 지우면 그것을 다시 한다. T174 */
    offerUndo((i+1)+"번째 줄 자리 지움",function(){
      cueRec(it.id)[i]=gone; PANE.sig=null; renderBlockPane(); });
    return;
  }
  var t=Math.round(SESS.el.currentTime*100)/100;
  var dur=(al&&al.items||{})[it.id]||SESS.el.duration||0;
  /* **이웃 어림과 견주지 않는다.** 어림이 통째로 밀려 있으면 그때 잡는 것이고
     그런데 그 밀린 어림을 기준으로 거절하면 아무것도 못 잡는다.
     견줄 것은 이미 잡아 둔 못뿐이다. 못 사이는 어림을 다시 펴서 채운다.
     못들이 차례대로면 표는 반드시 차례대로다. 그것만 지키면 된다. */
  var prev=0, next=dur, k, v;
  for(k=i-1;k>=0;k--){ v=cueFixed(it.id,k); if(v!=null){ prev=v; break; } }
  for(k=i+1;k<cue.length;k++){ v=cueFixed(it.id,k); if(v!=null){ next=v; break; } }
  if(t<=prev){ flash("앞서 잡은 줄보다 이르다. 그 자리는 못 잡는다"); return; }
  if(t>=next){ flash("뒤에 잡은 줄보다 늦다. 그 자리는 못 잡는다"); return; }
  rec[i]=t; save(); renderBlockPane();
  flash((i+1)+"번째 줄을 "+fmtT(t)+" 에 잡았다");
}
function bindSyncScript(it){
  var box=$("#sessScript"); if(!box) return;
  var cu=DATA.cues, al=DATA.audiolen;
  SESS.cue=effCues(it.id,(cu&&cu.items&&cu.items[it.id])||null,
                   (al&&al.items||{})[it.id]);
  SESS.line=-1;
  if(box.dataset.bound==="1"){ syncCur(); return; }
  box.dataset.bound="1";
  box.onclick=function(e){
    var a=e.target.closest ? e.target.closest(".sca") : null;
    if(a){ anchorLine(it, +a.dataset.anchor); return; }
    var b=e.target.closest ? e.target.closest(".scline") : null;
    if(!b||!SESS.cue) return;
    var i=+b.dataset.cue, t=SESS.cue[i];
    if(t==null||!SESS.el) return;
    /* 되풀이 중에 딴 줄을 누르면 그 줄로 되풀이가 옮겨 간다.
       안 옮기면 눌러도 곧바로 되돌아와서 앱이 말을 안 듣는 것처럼 보인다. */
    if(SESS.loop!=null){ SESS.loop=i; SESS.loopN=1; SESS.laps=0; renderBlockPane(); }
    try{ SESS.el.currentTime=t; }catch(err){ return; }
    var q=SESS.el.play(); if(q&&q.catch) q.catch(function(){});
    SESS.line=-1; syncCur();
  };
  syncCur();
}

/* 세션 안 재생기. 블록 1과 4에서만 산다.
   블록 칸이 매초 다시 그려지던 것을 T125 에서 멈췄다. 그래서 여기 살 수 있다. */
var SESS={id:null, mode:null, el:null, cue:null, line:-1, loop:null, loopN:1, laps:0, at:null, was:null, veil:null};
function sessPlay(it, mode, play){
  var host=$("#sessPlayHost"); if(!host) return;
  if(SESS.el && SESS.id===it.id && SESS.mode===mode && host.firstChild){
    if(play){ var q=SESS.el.play(); if(q&&q.catch) q.catch(function(){}); }
    return;
  }
  /* 회차를 적으면 칸의 글자가 바뀌고 칸이 다시 그려진다. 그때 재생기가 떨어져 나간다.
     **듣던 자리에서 처음으로 돌아가면 40분 블록에서 그 40분을 다시 듣는다.**
     같은 과 같은 방식이면 자리와 돌던 여부를 이어받는다. */
  var at=0, was=false;
  if(SESS.el && SESS.id===it.id && SESS.mode===mode){
    /* 칸을 다시 그리기 직전에 적어 둔 값이 있으면 그것이 맞다. 위 설명을 본다. */
    at=(typeof SESS.at==="number")?SESS.at:(SESS.el.currentTime||0);
    was=(typeof SESS.was==="boolean")?SESS.was:!SESS.el.paused;
  }
  SESS.at=null; SESS.was=null;
  stopSessPlay();
  SESS.id=it.id; SESS.mode=mode;
  SESS.el=mountPlayer(host, it, mode, {
    rate: rateOf(), play: !!play||was, noteId: "sessMediaNote",
    onAudio: function(){ sessPlay(it,"audio",true); },
  });
  if(at>0){
    var m=SESS.el;
    var seek=function(){ try{ m.currentTime=at; }catch(e){} };
    if(m.readyState>0) seek(); else m.addEventListener("loadedmetadata", seek, {once:true});
  }
  /* 들으면 그 줄이 밝아진다. timeupdate 는 초에 네 번쯤 온다. */
  SESS.line=-1;
  SESS.el.ontimeupdate=syncCur;
  SESS.el.onseeked=syncCur;
  /* 끝까지 갔는데 되풀이 중이면 처음으로 되돌린다. **마지막 보루다.**
     끝이 몇 초인지 잘못 알고 있어도 여기서는 안 틀린다. 소리가 끝났다는
     사실 하나만 보기 때문이다. T136 */
  SESS.el.onended=function(){
    if(SESS.loop==null||!SESS.cue) return;
    SESS.laps=(SESS.laps||0)+1; paintLap();
    try{ SESS.el.currentTime=SESS.cue[SESS.loop]; }catch(e){}
    var q=SESS.el.play(); if(q&&q.catch) q.catch(function(){});
  };
  /* 고른 것이 버튼에 보여야 한다. 다시 그리면 setTimeout 이 다시 칠한다. */
  document.querySelectorAll("#blockPane [data-media]").forEach(function(b){
    var k=b.dataset.media;
    if(k==="audio"||k==="video") b.className=mode===k?"on":"";
  });
}
/* **재생기만 치운다.** 되풀이와 가림은 안 건드린다.
   이 함수는 두 자리에서 쓴다. 블록을 떠날 때와 **같은 과를 다시 걸 때**다.
   뒤에서 지우면 방금 켠 되풀이가 꺼지고 방금 바꾼 가림이 되돌아간다.
   T131 에 되풀이로 겪고 여기서 가림으로 또 겪었다. 같은 결함이다.
   블록을 떠나는 것은 gotoBlock 이 안다. 지우는 것은 거기서 한다. T133 */
function stopSessPlay(){
  if(SESS.el){ try{ SESS.el.pause(); }catch(e){} SESS.el.ontimeupdate=null; SESS.el.onseeked=null; SESS.el.onended=null; }
  var n=$("#sessMediaNote"); if(n) n.remove();
  /* **자리에서도 치운다.** 전에는 세우기만 하고 두었다. 그러면 화면에는
     재생기가 남는데 SESS.el 은 비어 있다. 대본 줄을 눌러도 아무 일이 없고
     다시 걸리지도 않는다. 다시 거는 조건이 "자리가 비었으면" 이기 때문이다.
     **멈춘 재생기가 화면에 남아 있으면 두 사람은 고장 난 줄 안다.** T128 */
  var host=$("#sessPlayHost"); if(host) host.innerHTML="";
  SESS.el=null; SESS.id=null; SESS.line=-1;
}
/* 블록을 떠난다. 재생기도 끄고 이 블록에서 켠 것도 다 되돌린다.
   가림은 회차 기본값으로 돌아간다. 블록 1은 1회차고 블록 4는 2회차다. */
function leaveSessPlay(){
  stopSessPlay();
  SESS.loop=null; SESS.loopN=1; SESS.laps=0; SESS.veil=null; SESS.at=null; SESS.was=null;
}

/* 그려 놓은 것을 기억한다. 같으면 손대지 않는다.
   **paintTimer 가 매초 돌고 그 안에서 이 함수가 돈다.** 그래서 블록 칸이
   매초 통째로 지워지고 다시 생겼다. 안에 심은 것은 1초를 못 산다.
   T125 에서 재 봤다. 심어 둔 노드도 재생기도 1초 뒤에 없었다.
   블록 칸의 내용은 매초 바뀌지 않는다. 구간이 넘어갈 때와 남은 분이 줄 때만 바뀐다.
   글자가 같으면 안 그린다. 그러면 재생기가 그 안에서 살 수 있다. */
var PANE={sig:null};
function renderBlockPane(){
  var box=$("#blockPane"); if(!box) return;
  var pl=plan();
  if(pl.finished || !pl.lectureNo){ box.hidden=true; PANE.sig=null; return; }
  /* **접었으면 안에서도 안 만든다.**
     T166 에 세션 시작 전 시계 묶음을 접었다. 그런데 접은 것은 화면뿐이었다.
     블록 칸은 계속 만들어지고 있었고, 만들면서 대본과 구간표와 소리 길이를 읽었다.
     열자마자 136KB 를 더 읽는다. 보이지도 않는 칸 때문에.
     T185 에 처음 읽는 바이트를 재다가 나왔다. **화면에 없는 것은 값이 없는 것이 아니다.** */
  if(sessionIdle() && !peeking()){
    /* 감추기만 하면 안 된다. **안에 든 것이 그대로 남는다.**
       미리 보기를 닫았을 때 띠가 남아 있는 것이 그래서 나왔다. */
    box.hidden=true; box.innerHTML=""; PANE.sig=null; return;
  }
  box.hidden=false;
  var i=peekIdx(), h="";
  if(PEEKMAP){
    box.hidden=false;
    h=renderMapPane();
    if(PANE.sig===h && box.firstChild) return;
    PANE.sig=h; box.innerHTML=h;
    bindMapPane(box);
    var pcm=$("#peekClose"); if(pcm) pcm.onclick=closePeek;
    return;
  }
  if(PEEKLEC!=null){
    box.hidden=false;
    h=renderLecturePane(PEEKLEC);
    if(PANE.sig===h && box.firstChild) return;
    PANE.sig=h; box.innerHTML=h;
    var pc0=$("#peekClose"); if(pc0) pc0.onclick=closePeek;
    return;
  }
  function row(k,v,n){
    return '<div class="k">'+esc(k)+'</div><div class="v">'+esc(v)+'</div>'+
           (n?'<div class="n">'+esc(n)+'</div>':"");
  }
  /* **블록은 회차를 안 정한다.** 자리만 정한다. 블록 1은 각자 듣는 자리이고
     블록 4는 같이 듣는 자리다. 회차는 그 과를 몇 번 돌았는가가 정한다.
     T153 리허설에서 블록이 회차를 정하고 있었고, 이튿날부터 화면이
     "1회차" 라고 하는데 버튼은 "3회차" 라고 했다. 스물넷 중 여덟 칸이 그랬다. */
  if(i===0){
    h=renderMediaPane(pl,"alone");
  }else if(i===1){
    h=renderSetPane(pl);
  }else if(i===2){
    h=renderDrillPane(pl);
  }else{
    h=renderMediaPane(pl,"together");
  }
  if(PEEK!=null){
    h='<div class="peekbar"><b>미리 보기</b> 블록 '+(PEEK+1)+" "+esc(BLOCKS[PEEK].n)+
      ' · 시계는 안 돈다<button class="g" id="peekClose" type="button">닫기</button></div>'+h;
  }
  if(PANE.sig===h && box.firstChild) return;
  /* **여기서 재생기가 자리에서 떨어져 나간다.** 그리고 문서에서 떨어진 재생기는
     브라우저가 세운다. 규격이 그렇게 정한다. 그것이 곧바로 일어나지 않아서
     떨어진 뒤에 `paused` 를 읽으면 어떤 때는 참이고 어떤 때는 거짓이다.
     **되풀이를 끄면 소리가 멎는 일이 그래서 났다.** 떼기 전에 적어 둔다. T131 */
  if(SESS.el){ SESS.at=SESS.el.currentTime||0; SESS.was=!SESS.el.paused; }
  PANE.sig=h;
  box.innerHTML=h;
  if(slideDir){
    box.classList.remove("slide-next","slide-prev");
    // 클래스를 떼고 바로 붙이면 브라우저가 같은 것으로 보고 안 움직인다.
    void box.offsetWidth;
    box.classList.add("slide-"+slideDir);
    slideDir=null;
  }
  var pc=$("#peekClose"); if(pc) pc.onclick=closePeek;
}

function paintTimer(){
  var b=BLOCKS[T.idx];
  $("#tBlockName").textContent="블록 "+(T.idx+1)+" · "+b.n;
  var frac=1-(T.left/(b.m*60));
  var ring=$("#tRing");
  if(ring) ring.setAttribute("stroke-dashoffset", (RINGC*(1-Math.min(1,Math.max(0,frac)))).toFixed(1));
  var A=roleOf(today())==="a"?S.names.a:S.names.b;
  var B=roleOf(today())==="a"?S.names.b:S.names.a;
  var duo=$("#tDuo");
  if(duo){
    /* 이 기기가 어느 쪽인지 골라 두면 자기 것이 커지고 상대 것이 흐려진다.
       두 사람이 각자 기기를 보는 자리라 자기 지시를 찾는 데 시간이 들면 안 된다.
       E구간에서 카드 A면 B면을 기기로 가를 때 이 값을 그대로 쓴다. */
    var mine=deviceSide();
    function pane(side,label,name,what){
      var c=!mine?"":(mine===side?"mine":"other");
      return '<div class="'+c+'"><div class="who"><span class="rb '+side+'">'+label+' '+esc(name)+
             (mine===side?' · 이 기기':'')+'</span></div><div class="what">'+esc(what)+'</div></div>';
    }
    duo.innerHTML=pane("a","A",A,b.da)+pane("b","B",B,b.db);
  }
  renderSidePick(A,B);
  renderBlockPane();
  $("#tClock").textContent=fmt(Math.max(0,T.left));
  var sl=$("#tSessLeft");
  if(sl) sl.textContent="세션 남은 "+sessionLeftMin()+"분 · 블록 "+(T.idx+1)+" / "+BLOCKS.length;
  $("#tDesc").textContent=b.d;
  var doneMin=BLOCKS.slice(0,T.idx).reduce(function(a,x){return a+x.m;},0);
  var pct=(doneMin+(b.m-T.left/60))/TOTAL_MIN*100;
  $("#tBar").style.width=Math.min(100,Math.max(0,pct))+"%";
  var st=$("#tSteps"); st.innerHTML="";
  BLOCKS.forEach(function(x,i){
    var d=el("div"); d.style.setProperty("--w",x.m);
    d.style.flex=x.m; d.className=i<T.idx?"done":i===T.idx?"now":"";
    st.appendChild(d);
  });
  $("#tStart").textContent=T.run?"일시정지":(T.left===b.m*60&&T.idx===0?"시작":"이어서");
  $("#tOne").textContent=T.left===BLOCKS[0].m*60&&T.idx===0?"세션 시작":"세션 이어서";
  $("#focusBlock").textContent="블록 "+(T.idx+1)+" · "+b.n;
  $("#focusClock").textContent=fmt(Math.max(0,T.left));
  /* 짝과 견줄 짧은 표시. 상대가 지금 어디인지는 이 기기가 모른다 (T246). */
  if(typeof renderWhere==="function") renderWhere();
  $("#focusToggle").textContent=T.run?"일시정지":"이어서";
  document.title=(T.run?fmt(Math.max(0,T.left))+" · ":"")+"eng2p 운영 콘솔";
  syncSessionFocus();
  /* 세션이 도는 동안 다음 블록 자료를 미리 읽어 둔다. 한 블록에 한 번만 건다. T221 */
  if(typeof prefetchNext==="function" && !sessionIdle()) prefetchNext();
}
function tick(){
  T.left--;
  if(T.left%10===0) saveSession();   // 10초마다 남긴다. 매초 쓰면 저장이 잦다
  if(T.left<=0){
    beep();
    if(T.idx<BLOCKS.length-1){ gotoBlock(T.idx+1); return; }
    finishSession(); return;
  }
  paintTimer();
  /* **날이 바뀌면 이 기기 쪽이 뒤집힌다** (T216). 세션 중에 자정을 넘길 수 있다.
     그래서 매초 자리에서 부르되 `paintSide` 가 안 바뀌었으면 바로 돌아온다.
     매초 도는 자리에 무엇을 두면 그것이 매초 일어난다 (T211). 그래서 재 봤다.
     하는 일이 글자 몇 개를 잇고 견주는 것뿐이다. 그것은 둬도 된다. */
  paintSide();
}
$("#tStart").onclick=function(){
  restartFinishedSession();
  T.run=!T.run;
  clearInterval(T.tick);
  if(T.run){ hideSessionDone(); T.tick=setInterval(tick,1000); reqWake(); } else { relWake(); }
  paintTimer();
};

