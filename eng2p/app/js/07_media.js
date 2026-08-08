/* =========================================================================
   블록 1과 4. 미디어를 그 자리에서 연다.
   전에는 "미디어 탭에서 그 과를 연다" 라고 적기만 했다.
   **적어 놓은 지시는 찾는 일을 사람에게 넘긴 것이다.** 52과 중에서 골라야 한다.
   재생기를 여기 새로 안 만든다. 미디어 탭에 이미 있고 배속과 구간 반복과 대본이 붙어 있다.
   같은 것을 두 벌 만들면 두 벌이 어긋난다. 그 탭으로 보내되 그 과를 열어 놓고 보낸다.
   ========================================================================= */
function mediaPass(id){
  try{ var c=(S.media&&S.media.pass&&S.media.pass[id])||{};
       return ["1","2","3"].filter(function(k){return c[k];}).length; }
  catch(e){ return 0; }
}
/* 회차마다 초점이 다르다. 기준서 10.3 이 셋으로 정한다.
   **앱은 T153 까지 둘만 돌았다.** 블록 1이 소리이고 블록 4가 청크였다.
   의미 회차는 화면에 한 번도 안 떴다. 하루에 자리가 둘뿐이라
   세션 한 벌만 보면 둘로도 차서 안 보인다. 사흘을 이어 돌아야 셋째가 빈 것이 보인다. */
var ROUND_FOCUS = [null,
  "1회차 초점은 소리다. 무슨 말인지 말고 어디가 줄었는지를 듣는다.",
  "2회차 초점은 청크다. 낱말이 아니라 덩어리로 끊어 듣는다.",
  "3회차 초점은 의미다. 이제 무슨 말인지를 듣는다."];
/* 자리마다 하는 것이 다르다. 회차와 따로다. */
var SEAT_NOTE = {alone: "각자 헤드폰이다. 말을 걸지 않는다.",
                 together: "같은 자료를 같이 듣는다. A가 재생을 맡는다."};

/* 오늘 도는 회차. **한 과를 사흘 돈다. 하루가 한 회차다.**
   하루에 자리가 둘(블록 1과 4)인데 그 둘은 같은 회차다.
   그래서 끝냈다 단추는 그날 마지막 자리에만 둔다. 두 자리에 다 두면
   하루에 회차가 둘씩 올라 이틀 반이면 셋이 다 찬다. T153 에서 실제로 그랬다.

   **회차는 강마다 센다. 과마다 세지 않는다.** 96강이 52과를 나눠 쓴다.
   44과는 두 강이 같이 쓴다. 과로 세면 뒤에 오는 강이 시작부터 다 찬 채로 뜬다.
   T156 에 48주를 훑어 보고 나왔다. 96묶음이 다 사흘인 것도 거기서 확인했다.
   미디어 탭의 3회차 표시는 과마다 그대로 둔다. 그것은 그 과를 들었는가를 보는 자리다. */
function lecRound(){ var r=mediaRec(); if(!r.lec) r.lec={}; return r.lec; }
function lecPass(no){ return no==null ? 0 : Math.min(lecRound()[no]||0, 3); }
function roundNow(no){ return Math.min(lecPass(no)+1, 3); }

function renderMediaPane(pl, seat){
  var head='<div class="k">이 블록에 쓰는 것 · 미디어</div><div class="v">'+
           esc(pl.media||"(없음)")+'</div>';
  if(!pl.media) return head;
  var i=(typeof MEDIA!=="undefined") ?
        MEDIA.findIndex(function(x){return x.id===pl.media;}) : -1;
  var it=i>=0?MEDIA[i]:null;
  if(!it) return head+'<div class="n">카탈로그에서 그 과를 못 찾았다.</div>';
  var done=lecPass(pl.lectureNo);
  var round=roundNow(pl.lectureNo);
  var full=done>=3;
  var focus = (full ? "세 회차를 다 끝냈다. 오늘은 다시 듣기다. 초점은 의미다."
                    : ROUND_FOCUS[round]) + " " + SEAT_NOTE[seat];
  /* 기준서와 CLAUDE.md 가 금지한 것 하나가 여기서 화면 규칙이 된다.
     **C-gen 음성으로 Q1 소리 트랙 통과 판정을 하지 않는다.**
     오늘 자료 52과는 다 C-real 이라 지금은 어긋남이 없다.
     그런데 그것은 자료가 우연히 맞는 것이지 앱이 규칙을 지키는 것이 아니다.
     C-gen 이 하나라도 들어오면 그날부터 판정이 잘못된다. 여기서 막는다. */
  var soundQ1 = (pl.quarter==="Q1" && pl.track==="소리");
  var locked = soundQ1 && it.grade!=="C-real";
  var h=head+'<div class="n"><b>'+esc(it.title)+'</b> · '+esc(it.duration||"")+
    ' · '+esc(it.grade||"등급 없음")+
    '<br>'+focus+'<br>회차 '+done+' / 3 끝냈다</div>';
  if(locked) h+='<div class="cardwarn">이 과는 '+esc(it.grade||"등급 없음")+
    ' 이다. Q1 소리 트랙 통과 판정은 C-real 로만 한다. 연습에는 쓴다.</div>';
  /* **재생기가 이 칸 안에 있다.** 전에는 미디어 탭으로 보냈다.
     블록 1은 40분이고 블록 4는 20분이다. 그 시간 내내 다른 탭에 가 있으면
     지시와 회차와 남은 시간이 다 안 보인다. 여기서 튼다. T125 */
  h+='<div class="sessplay" id="sessPlayHost"></div>';
  var veil=veilOf(round);
  h+=renderSyncScript(it, round);
  h+='<div class="cardnav">'+
    '<button type="button" data-media="audio">소리</button>'+
    (it.video?'<button type="button" data-media="video">영상</button>':"")+
    /* **그날 마지막 자리에만 둔다.** 각자 듣는 자리에도 두면 하루에 둘씩 오른다. */
    (done<3 && !locked && seat==="together" ?
      '<button type="button" data-media="pass">'+round+'회차 끝냈다로 적기</button>' : "")+
    '<button type="button" data-media="loop" class="'+(SESS.loop!=null?"on":"")+'">'+
      (SESS.loop!=null?"되풀이 끄기":"이 줄 되풀이")+'</button>'+
    (SESS.loop!=null?'<button type="button" data-media="less">구간 &minus;</button>'+
      '<button type="button" data-media="more">구간 &plus;</button>':"")+    '<button type="button" data-media="veil">대본 '+VEILNAME[veil]+'</button>'+    '<button type="button" data-media="slow">느리게</button>'+
    '<button type="button" data-media="fast">빠르게</button>'+
    '<button type="button" data-media="lib">미디어 탭에서</button>'+
    '</div>'+
    /* **돈 횟수는 여기 글자로 안 넣는다.** 넣으면 한 바퀴 돌 때마다 글자가 바뀌고
       칸이 다시 그려지고 재생기가 다시 걸린다. 그러면 되풀이가 한 바퀴에 한 번씩
       끊긴다. 실제로 그렇게 만들었고 첫 바퀴에서 소리가 멎었다.
       빈 칸만 두고 숫자는 syncCur 이 써 넣는다. T125 와 같은 규칙이다. */
    '<div class="n"><span id="sessRate"></span>'+
    (SESS.loop!=null?' · <span id="sessLap"></span>':"")+'</div>';
  setTimeout(function(){
    var host=$("#sessPlayHost");
    if(host && !host.firstChild) sessPlay(it, SESS.mode||"audio", false);
    bindSyncScript(it);
    document.querySelectorAll("#blockPane [data-media]").forEach(function(b){
      var k=b.dataset.media;
      if(k==="audio"||k==="video") b.className=(SESS.mode||"audio")===k?"on":"";
      b.onclick=function(){
        if(k==="pass"){
          if(locked){ flash("C-real 이 아니라 판정에 안 쓴다"); return; }
          var no=pl.lectureNo, cur=lecPass(no);
          if(cur>=3){ flash("세 회차를 다 끝냈다"); return; }
          /* **강 회차가 진짜 값이다.** 과 회차는 미디어 탭이 쓰는 딸린 값이다.
             과를 두 강이 나눠 쓰면 과 회차는 먼저 차고 강 회차는 강마다 새로 센다. */
          lecRound()[no]=cur+1;
          var next=mediaNextPass(it.id);
          if(next){ var c=passRec()[it.id]||(passRec()[it.id]={});
                    c[next[0]]=true; syncMediaDone(it.id); }
          save();
          renderBlockPane(); renderMediaStats && renderMediaStats();
          flash((cur+1)+"회차를 적었다");
          return;
        }
        if(k==="loop"){
          if(SESS.loop!=null){ SESS.loop=null; SESS.laps=0; }
          else{
            if(!SESS.cue){ flash("대본이 아직 안 열렸다"); return; }
            /* 지금 밝은 줄을 돈다. 밝은 줄이 없으면 첫 줄부터다. */
            SESS.loop=Math.max(0, SESS.line);
            SESS.loopN=1; SESS.laps=0;
            if(SESS.el){ try{ SESS.el.currentTime=SESS.cue[SESS.loop]; }catch(e){}
                         var q=SESS.el.play(); if(q&&q.catch) q.catch(function(){}); }
          }
          renderBlockPane();
          flash(SESS.loop!=null?(SESS.loop+1)+"번째 줄을 되풀이한다":"되풀이를 껐다");
          return;
        }
        if(k==="slow"||k==="fast"){
          var was=rateOf();
          setRate(was+(k==="fast"?RATE_STEP:-RATE_STEP));
          if(rateOf()===was) flash(k==="fast"?"제일 빠른 자리다":"제일 느린 자리다");
          return;
        }
        if(k==="veil"){
          /* 다 보임 -> 덩어리만 -> 가림 -> 다 보임 */
          SESS.veil=((veilOf(round))+2)%3;
          renderBlockPane();
          flash("대본을 "+VEILNAME[SESS.veil]+" 로 바꿨다");
          return;
        }
        if(k==="more"||k==="less"){
          if(SESS.loop==null||!SESS.cue) return;
          var n=(SESS.loopN||1)+(k==="more"?1:-1);
          if(n<1){ flash("한 줄이 제일 작다"); return; }
          if(SESS.loop+n>SESS.cue.length){ flash("마지막 줄까지다"); return; }
          SESS.loopN=n; SESS.laps=0; renderBlockPane();
          flash(SESS.loop+1+"번째 줄부터 "+n+"줄을 되풀이한다");
          return;
        }
        if(k==="lib"){
          /* 그 과를 열어 놓고 보낸다. 52과에서 고르게 하지 않는다. */
          stopSessPlay(); openMedia(i, SESS.mode||"audio", true); go("media"); return;
        }
        sessPlay(it, k, true);
      };
    });
  },0);
  return h;
}

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
    return '<div class="n">대본을 여는 중이다.</div>';
  }
  var lines=(tr.items||{})[it.id], cue=(cu.items||{})[it.id];
  if(!lines||!lines.length) return '<div class="n">이 과는 대본이 없다.</div>';
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
  if(cueFixed(it.id,i)!=null){ delete rec[i]; save(); renderBlockPane(); flash((i+1)+"번째 줄 자리를 지웠다"); return; }
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
  box.hidden=false;
  var i=T.idx, h="";
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
  if(PANE.sig===h && box.firstChild) return;
  /* **여기서 재생기가 자리에서 떨어져 나간다.** 그리고 문서에서 떨어진 재생기는
     브라우저가 세운다. 규격이 그렇게 정한다. 그것이 곧바로 일어나지 않아서
     떨어진 뒤에 `paused` 를 읽으면 어떤 때는 참이고 어떤 때는 거짓이다.
     **되풀이를 끄면 소리가 멎는 일이 그래서 났다.** 떼기 전에 적어 둔다. T131 */
  if(SESS.el){ SESS.at=SESS.el.currentTime||0; SESS.was=!SESS.el.paused; }
  PANE.sig=h;
  box.innerHTML=h;
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
  $("#focusToggle").textContent=T.run?"일시정지":"이어서";
  document.title=(T.run?fmt(Math.max(0,T.left))+" · ":"")+"eng2p 운영 콘솔";
  syncSessionFocus();
}
function beep(){
  if(!$("#tSound").checked) return;
  try{
    var C=window.AudioContext||window.webkitAudioContext; if(!C) return;
    var a=new C(), t=a.currentTime;
    [660,880].forEach(function(f,i){
      var o=a.createOscillator(), g=a.createGain();
      o.type="sine"; o.frequency.value=f;
      g.gain.setValueAtTime(0.0001,t+i*0.28);
      g.gain.exponentialRampToValueAtTime(0.12,t+i*0.28+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,t+i*0.28+0.26);
      o.connect(g); g.connect(a.destination); o.start(t+i*0.28); o.stop(t+i*0.28+0.3);
    });
    setTimeout(function(){a.close();},1200);
  }catch(e){}
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
}
$("#tStart").onclick=function(){
  restartFinishedSession();
  T.run=!T.run;
  clearInterval(T.tick);
  if(T.run){ hideSessionDone(); T.tick=setInterval(tick,1000); reqWake(); } else { relWake(); }
  paintTimer();
};
