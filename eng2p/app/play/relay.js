/* =========================================================================
   전달 놀이 (T268). `docs/play_rules.md` 3.4

     쓰는 것    오늘 과의 대본 한 줄 + 줄 고르기. `out/data/relay.js` (T267). **B등급**
     시작 조건  대본 줄 하나를 골랐다
     역할       처음 듣는 쪽과 옮기는 쪽. **한 바퀴마다 바뀐다**
     도는 차례  A가 소리를 듣는다. B에게 말로 옮긴다. B가 적는다. 원문과 견준다
     판정       **둘이 같이 본다.** 원문이 화면에 있다
     끝         세 바퀴를 돌면 끝난다
     못 했을 때 틀어졌으면 **어디서 틀어졌는지 되짚는다.** 그것이 이 판의 목적이다
     기록할 값  세 바퀴에서 **틀어진 자리가 몇 군데인가**

   **스무 판 중 앱이 소리를 내는 유일한 판이다** (`docs/round.md` 13장).
   그래서 이 판만 이어폰을 묻는다. 소리는 화면처럼 못 가른다. 한 상에서 울리면
   둘 다 듣는다. 앱이 할 수 있는 것은 **어느 기기가 소리를 낼지**뿐이다.

   그리고 이 판만 **기계가 판정한다.** 앞의 셋은 사람이 했다.
   여기서 재는 것은 소리가 아니라 **적은 글과 원문이 몇 군데 다른가**다.
   그것은 셀 수 있다. 소리를 재는 것이 아니라서 기계에 맡길 수 있다.
   ========================================================================= */
var RLY={every:1, n:3, seats:["처음 듣는 쪽","옮기는 쪽"], said:null, ready:false};

function rlyToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
function rlyItems(){
  var d=DATA.relay, mid=rlyToday();
  if(!d || !d.items || !mid) return null;
  var rows=d.items[mid]||[];
  if(!rows.length) return null;
  var ord=roundOrder(rows.length, roundSeed("relay",0)), out=[];
  for(var i=0;i<Math.min(RLY.n,rows.length);i++) out.push(rows[ord[i]]);
  return out;
}
function rlyLine(li){
  var t=DATA.transcripts, mid=rlyToday();
  if(!t || !t.items || !mid) return null;
  var ls=t.items[mid]; if(!ls || li>=ls.length) return null;
  return String(ls[li]).replace(/^[A-Z][A-Za-z .'-]{0,20}:\s*/, "");
}
function rlyRec(){ return playRec("relay", {off:0, done:0, ln:-1}); }

/* =========================================================================
   되짚기. **어디서 틀어졌는지를 낱말 단위로 짚는다.**

   규칙서가 "어디서 틀어졌는지 되짚는다. 그것이 이 판의 목적이다" 라고 적었다.
   목적이라고 적힌 것을 사람 눈에 맡기면 안 한다. 기계가 짚어 준다.

   **소리를 재는 것이 아니다.** 적은 글과 원문을 견주는 것이고 그것은 셀 수 있다.
   대소문자와 문장부호는 안 본다. 옮겨 말한 것을 받아 적은 글이라
   쉼표가 다른 것은 틀어진 것이 아니다.
   ========================================================================= */
function rlyWords(s){
  return String(s||"").toLowerCase().replace(/[’']/g,"'")
    .replace(/[^a-z' ]+/g," ").split(/\s+/).filter(function(x){return x;});
}
/* 가장 긴 공통 차례를 잡고 그 밖을 틀어진 자리로 본다.
   낱말 수가 열몇이라 이 셈은 눈 깜짝할 새다. */
function rlyDiff(src, got){
  var a=rlyWords(src), b=rlyWords(got);
  var m=[], i, j;
  for(i=0;i<=a.length;i++){ m.push([]); for(j=0;j<=b.length;j++) m[i].push(0); }
  for(i=1;i<=a.length;i++) for(j=1;j<=b.length;j++)
    m[i][j]=(a[i-1]===b[j-1]) ? m[i-1][j-1]+1 : Math.max(m[i-1][j], m[i][j-1]);
  /* 뒤에서 되짚어 어느 낱말이 살아남았는지 표시한다. */
  var keepA=[], keepB=[];
  for(i=0;i<a.length;i++) keepA.push(false);
  for(j=0;j<b.length;j++) keepB.push(false);
  i=a.length; j=b.length;
  while(i>0 && j>0){
    if(a[i-1]===b[j-1]){ keepA[i-1]=true; keepB[j-1]=true; i--; j--; }
    else if(m[i-1][j]>=m[i][j-1]) i--;
    else j--;
  }
  /* **자리를 센다. 낱말을 안 센다.** 이어 붙은 것은 한 군데다.
     낱말로 세면 긴 토막 하나가 다섯 군데로 잡히고 그것은 되짚을 자리가 아니다. */
  function spots(keep){
    var n=0, was=true;
    keep.forEach(function(k){ if(!k && was) n++; was=k; });
    return n;
  }
  return {a:a, b:b, keepA:keepA, keepB:keepB,
          off:Math.max(spots(keepA), spots(keepB))};
}
function rlyMark(words, keep){
  return words.map(function(w,i){
    return keep[i] ? esc(w) : '<b class="rlyoff">'+esc(w)+'</b>';
  }).join(" ") || '<span class="mut">(빈 칸)</span>';
}

/* 소리. **듣는 쪽 기기만 낸다** (`docs/round.md` 13장). */
var RLYA={el:null, stop:null};
function rlyAudioStop(){
  if(RLYA.stop){ clearTimeout(RLYA.stop); RLYA.stop=null; }
  if(RLYA.el){ try{ RLYA.el.pause(); }catch(e){} }
}
function rlyPlay(it){
  var mid=rlyToday(), m=MEDIA.filter(function(x){return x.id===mid;})[0];
  if(!m) return false;
  if(!RLYA.el){ RLYA.el=document.createElement("audio"); RLYA.el.preload="none"; }
  rlyAudioStop();
  if(RLYA.el.src.indexOf(m.audio)<0) RLYA.el.src=m.audio;
  try{
    RLYA.el.currentTime=Math.max(0, it.at);
    RLYA.el.play();
    /* 어림이라 조금 넘겨 잡는다. 일찍 끊는 것보다 조금 더 듣는 것이 낫다. */
    RLYA.stop=setTimeout(function(){ rlyAudioStop(); }, (it.dur+0.7)*1000);
  }catch(e){ return false; }
  return true;
}

var RLYCLK={t:null, left:0, over:false};
function rlyClockStop(){ if(RLYCLK.t){ clearInterval(RLYCLK.t); RLYCLK.t=null; } }
function rlyClockText(){
  if(RLYCLK.over) return "0:00";
  var s=RLYCLK.left>0?RLYCLK.left:RLY.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function rlyClockGo(min){
  if(RLYCLK.t){ rlyClockStop(); return; }
  if(RLYCLK.left<=0){ RLYCLK.left=min*60; RLYCLK.over=false; }
  tone("start");
  RLYCLK.t=setInterval(function(){
    RLYCLK.left--;
    var e=document.getElementById("rlyClock");
    if(!e){ rlyClockStop(); return; }
    if(RLYCLK.left<=0){
      RLYCLK.over=true; rlyClockStop(); tone("blockend"); renderRelay(); return;
    }
    e.textContent=rlyClockText();
  },1000);
  var e=document.getElementById("rlyClock"); if(e) e.textContent=rlyClockText();
}

function renderRelay(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("relay");
  RLY.min=p.min;
  if(!DATA.relay){
    box.innerHTML='<div class="card tight small mut">줄 고르기를 여는 중이다.</div>';
    loadData("relay","ENG2P_RELAY",function(){ renderRelay(); });
    return;
  }
  if(!DATA.transcripts){
    box.innerHTML='<div class="card tight small mut">대본을 여는 중이다.</div>';
    loadData("transcripts","ENG2P_TRANSCRIPTS",function(){ renderRelay(); });
    return;
  }
  if(!MEDIA.length){
    box.innerHTML='<div class="card tight small mut">소리 차림표를 여는 중이다.</div>';
    needMedia(function(){ renderRelay(); });
    return;
  }
  var mid=rlyToday(), items=rlyItems();
  if(!mid || !items){
    box.innerHTML='<div class="card"><div class="note w">오늘 과의 줄이 없다. '+
      '<b>scripts/derive_relay.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    return;
  }
  var s=roundStep("relay"), rec=rlyRec();
  if(soloOn() && soloHanding()){
    box.innerHTML='<div class="card">'+soloCover([S.names.a,S.names.b])+'</div>';
    $("#soTake").onclick=function(){ soloTake(renderRelay); };
    return;
  }
  var h='<div class="card">'+playHead(p,s);
  if(RLYCLK.over)
    h+='<div class="note w" style="margin-top:10px"><b>5분이 됐다.</b> '+
       '남은 바퀴는 안 돈다. 못 돈 것은 <b>시간이 그만큼인 것</b>이다.</div>';

  if(s>=items.length){
    h+='<div class="note g" style="margin-top:10px"><b>'+items.length+
       '바퀴를 다 돌았다.</b> 이 기기가 적은 바퀴는 '+rec.done+'이고 '+
       '거기서 <b>틀어진 자리가 '+rec.off+'군데</b>다.</div>';
    /* **틀어진 것이 이 판의 산출물이다.** 못한 셈이 아니라고 화면이 적는다. */
    h+='<div class="note">틀어진 자리가 <b>안 들리는 자리</b>다. '+
       '벌이 아니라 다음에 들을 자리다. 규칙서가 그렇게 적었다.</div>';
    h+=playHalf(items.length)+playGrade(DATA.relay);
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="rlyAgain">처음부터</button></div></div>';
    box.innerHTML=h;
    $("#rlyAgain").onclick=function(){
      roundStepSet("relay",0); turnForget("relay");
      rec.off=0; rec.done=0; rec.ln=-1; save();
      RLY.said=null; rlyAudioStop(); rlyClockStop();
      RLYCLK.left=0; RLYCLK.over=false;
      revealReset("relay"+s); renderRelay();
    };
    return;
  }

  var it=items[s], line=rlyLine(it.li), first=roundFirst(s, RLY.every);
  if(line==null){
    h+='<div class="note w" style="margin-top:10px">대본에서 그 줄을 못 찾았다.'+
       '</div></div>';
    box.innerHTML=h; return;
  }
  if(first===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '한 기기만 소리를 내야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고르거나, 기기가 하나면 규칙 탭에서 '+
       '<b>돌려 보기</b>를 켠다.</div></div>';
    box.innerHTML=h; return;
  }

  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?RLY.seats[0]:RLY.seats[1])+'</b>'+
     (soloOn()?' <span class="small mut">(돌려 보기)</span>':'')+'</span>'+
     '<span class="small mut">'+(s+1)+' / '+items.length+'바퀴 · '+esc(mid)+'</span></div>';

  /* 이어폰. **이 판만 묻는다.** 소리를 내는 기기에만 뜬다 (T254). */
  h+='<div id="rlyEar" style="margin-top:10px"></div>';

  var key="relay"+s, open=revealOpen(key);
  if(first) h+=rlyHear(it, open, line);
  else h+=rlyWrite(key, open, line, s, rec);

  h+='<div id="rlyTurn"></div>';
  h+='<div class="small mut" style="margin-top:10px">자리는 <b>한 바퀴마다</b> 바뀐다.'+
     (soloOn()?' <b>기기가 하나다. 바퀴마다 건넨다.</b>':'')+'</div>';
  h+='<div class="row" style="margin-top:8px">'+
     '<button class="g" id="rlyGo">5분 시계 <span class="mono" id="rlyClock">'+
     rlyClockText()+'</span></button>';
  if(soloOn()) h+='<button class="g" id="rlyHand">건넨다</button>';
  h+='</div>'+playGrade(DATA.relay)+'</div>';
  box.innerHTML=h;
  earAsk("relay", "rlyEar", null, s, RLY.every);
  rlyBind(it, key, open, line, s, rec, first);
}

/* 처음 듣는 쪽. **소리가 이 기기에서만 난다.** 원문 글자는 펴기 전에 없다.
   글자가 있으면 듣지 않고 읽어서 옮긴다. 그러면 이 판이 아무것도 안 잰다. */
function rlyHear(it, open, line){
  var h='<div class="note" style="margin-top:10px">단추를 눌러 <b>한 번 듣는다.</b> '+
    '듣고 나서 <b>상대에게 말로 옮긴다.</b> 상대가 그것을 적는다.</div>'+
    '<div class="row"><button class="b" id="rlySound">소리 듣기 '+
    '<span class="small">'+it.dur.toFixed(1)+'초쯤</span></button>'+
    '<button class="g" id="rlyAgainSnd">다시 듣기</button></div>'+
    '<div class="small mut" style="margin-top:6px">소리 자리가 <b>어림</b>이라 '+
    '조금 일찍 끊기거나 늦게 시작할 수 있다. 다시 듣기로 맞춘다.</div>';
  if(!open)
    h+='<div class="vhid" aria-hidden="true" style="margin-top:10px">'+
       '<span>원문은 상대가 다 적은 뒤에 둘이 같이 편다</span></div>'+
       '<div class="note w"><b>상대가 다 적었다고 하면</b> 둘이 같이 누른다.</div>'+
       '<div class="row"><button class="g" data-reveal="relayA">펴기</button></div>';
  else
    h+='<div class="note g" style="margin-top:10px">폈다. 원문이다.</div>'+
       '<div class="swpline">'+esc(line)+'</div>'+
       '<div class="note">상대 화면에 <b>어디서 틀어졌는지</b>가 짚여 있다. '+
       '같이 본다.</div>';
  return h;
}
/* 옮기는 쪽. **소리가 이 기기에서 안 난다.** 들은 것을 말로 받아 적는다. */
function rlyWrite(key, open, line, s, rec){
  var h='<div class="note" style="margin-top:10px">상대가 말로 옮겨 주는 것을 '+
    '<b>그대로 적는다.</b> 못 알아들으면 다시 말해 달라고 한다.</div>'+
    '<textarea id="rlyIn" rows="3" placeholder="들은 대로 적는다" '+
    (open?'readonly':'')+'>'+esc(RLY.said||"")+'</textarea>';
  if(!open) return h+revealGate(key, "rlyIn", "원문과 견준다");
  var d=rlyDiff(line, RLY.said||"");
  h+='<div class="note g" style="margin-top:10px">폈다. <b>틀어진 자리 '+d.off+
     '군데.</b> 벌이 아니라 <b>다음에 들을 자리</b>다.</div>'+
     '<div class="small mut">원문</div><div class="rlyline">'+
     rlyMark(d.a, d.keepA)+'</div>'+
     '<div class="small mut">적은 것</div><div class="rlyline">'+
     rlyMark(d.b, d.keepB)+'</div>'+
     '<div class="small mut">대소문자와 문장부호는 안 본다. 말로 옮긴 것을 '+
     '받아 적은 글이라 쉼표가 다른 것은 틀어진 것이 아니다.</div>'+
     '<div class="row" style="margin-top:8px">'+
     '<button class="b" id="rlyNext">되짚었다. 다음 바퀴</button></div>';
  return h;
}
function rlyBind(it, key, open, line, s, rec, first){
  if($("#rlyGo")) $("#rlyGo").onclick=function(){ rlyClockGo(RLY.min); };
  if($("#rlyHand")) $("#rlyHand").onclick=function(){
    rlyAudioStop(); soloHandOff(renderRelay);
  };
  if($("#rlySound")) $("#rlySound").onclick=function(){
    if(!rlyPlay(it)) $("#rlyEar").innerHTML=
      '<div class="note w">소리 파일을 못 열었다. 내려받은 자리에 '+
      '<b>media/english/audio</b> 가 같이 있어야 한다.</div>';
  };
  if($("#rlyAgainSnd")) $("#rlyAgainSnd").onclick=function(){ rlyPlay(it); };
  var pane=$("#playPane");
  revealBind(pane, function(){ renderRelay(); });
  /* 처음 듣는 쪽의 펴기는 열쇠가 다르다. 두 기기가 각자 편다. */
  pane.querySelectorAll('[data-reveal="relayA"]').forEach(function(b){
    b.onclick=function(){ REVEAL.open[key]=true; renderRelay(); };
  });
  var ta=$("#rlyIn");
  if(ta && !open) ta.oninput=function(){
    RLY.said=ta.value;
    /* **펴는 단추가 켜지려면 다시 그려야 한다.** `revealGate` 는 그릴 때
       칸이 비었는지를 보고 잠근다 (T240). 적어도 다시 안 그리면 잠긴 채로 남고
       두 사람은 다 적어 놓고 펴지를 못한다. 실제로 그랬다. T268

       **글자마다 다시 그리지 않는다.** 그러면 커서가 튄다.
       비었다가 찼을 때와 찼다가 비었을 때만 그린다. */
    var now=!!String(ta.value||"").trim();
    if(now===RLY.ready) return;
    RLY.ready=now;
    renderRelay();
    var t2=$("#rlyIn");
    if(t2){ t2.focus(); try{ t2.setSelectionRange(t2.value.length, t2.value.length); }catch(e){} }
  };
  if($("#rlyNext")) $("#rlyNext").onclick=function(){
    var d=rlyDiff(line, RLY.said||"");
    rec.ln=s; rec.off+=d.off; rec.done++; save();
    RLY.said=null; revealReset(key); rlyAudioStop();
    var n=s+1;
    roundStepSet("relay", n); renderRelay();
    if(turnCheck("relay", n, RLY.every))
      turnAlert(n, RLY.every, RLY.seats, "rlyTurn");
  };
}
PLAYREND.relay=renderRelay;
