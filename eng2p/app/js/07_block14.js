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

/* =========================================================================
   조준표를 그 자리에 편다.

   **40분 동안 화면이 "조준표 과제대로 듣는다" 고만 말했다.** T208 진단이다.
   어느 과제인지는 종이에 있었다. 종이를 펴면 화면과 종이가 둘 다 켜진다.

   자리마다 펴는 것이 다르다. 블록 1은 각자 찾으며 듣는 자리라 **찾을 것**이고
   블록 4는 같이 듣고 맞춰 보는 자리라 **대조하는 법**이다.
   둘을 다 펴면 40분짜리 지시와 20분짜리 지시가 한 화면에 겹친다.
   ========================================================================= */
function aimWeek(pl){
  var d=DATA.input; if(!d) return null;
  var out=null;
  (d.items||[]).forEach(function(q){
    (q.weeks||[]).forEach(function(w){ if(w.week===pl.week) out=w; });
  });
  return out;
}
function aimCollect(pl){
  var d=DATA.input; if(!d) return null;
  var out=null;
  (d.items||[]).forEach(function(q){
    (q.collect||[]).forEach(function(c){ if(c.week===pl.week) out=c; });
  });
  return out;
}
function aimCross(pl, round){
  var d=DATA.input; if(!d) return null;
  var out=null;
  (d.items||[]).forEach(function(q){
    if(q.quarter!==pl.quarter) return;
    (q.crosscheck||[]).forEach(function(c){ if(c.round===round) out=c; });
  });
  return out;
}
/* **과제가 둘인 주가 열둘이다.** 강의 둘이 서로 다른 과를 쓰는 주다.
   한 대본에서 둘을 찾는 것이 아니라 강마다 자기 과에서 하나씩 한다.
   그래서 오늘 강에 걸린 것 하나만 편다. 둘을 다 펴면 조준표 4장이 금지한
   "한 번에 두 가지 찾기" 가 된다. */
function aimTask(w, pl){
  if(!w || !w.tasks || !w.tasks.length) return null;
  if(w.tasks.length===1) return w.tasks[0];
  var i=(w.lectures||[]).indexOf(pl.lectureNo);
  return w.tasks[i>=0 && i<w.tasks.length ? i : 0];
}
/* =========================================================================
   블록 4의 20분을 자료 길이에서 파생시킨다.

   블록 2와 3은 시간이 구간으로 갈린다. 강의록에 배분이 적혀 있기 때문이다.
   **블록 4는 20분이 통째로 있다.** 같이 듣기와 맞춰 보기가 한 덩어리다.
   그러면 듣다가 시간이 다 가고 맞춰 보는 자리가 없어진다.

   숫자를 새로 선언하지 않는다. **자료 길이가 그 숫자를 이미 갖고 있다.**
   조준표 1장이 자료를 2분에서 4분으로 정했고 카탈로그에 그 길이가 적혀 있다.
   두 번 트는 데 걸리는 시간이 듣는 자리고 남는 것이 맞춰 보는 자리다. T218
   ========================================================================= */
var PHASE={at:null};
function mmssSec(s){
  var m=/(\d+):(\d+)/.exec(String(s||"")); if(!m) return 0;
  return (+m[1])*60+(+m[2]);
}
function aimPhase(pl){
  var i=MEDIA.length?MEDIA.findIndex(function(x){return x.id===pl.media;}):-1;
  var dur=i>=0?mmssSec(MEDIA[i].duration):0;
  if(!dur) return "";
  var listen=Math.min(BLOCKS[3].m*60-120, Math.ceil(dur*2/60)*60);   // 두 번 듣기, 분으로 올림
  var used=BLOCKS[3].m*60-Math.max(0,T.left);
  var on=(used<listen)?"listen":"check";
  if(T.run && PHASE.at!==null && PHASE.at!==on){
    tone("swap");
    setTimeout(function(){ flash(on==="check"?"이제 따로 적은 것을 편다":"같이 듣는 자리다"); },0);
  }
  PHASE.at=T.run?on:null;
  var left=Math.max(0,Math.ceil((on==="listen"?listen-used:BLOCKS[3].m*60-used)/60));
  return '<div class="phase'+(on==="check"?" chk":"")+'">'+
    (on==="listen" ? "같이 듣는 자리 · 남은 "+left+"분"
                   : "맞춰 보는 자리 · 남은 "+left+"분")+
    /* 시각 뒤에 조사를 안 붙인다. 03:21 과 04:00 이 다르게 읽힌다. */
    '<span class="n">이 과는 '+esc(MEDIA[i].duration||"")+' 다. 두 번 듣는 데 '+
    Math.round(listen/60)+'분이고 남는 것이 맞춰 보는 시간이다.</span></div>';
}
function renderAimPane(pl, seat, round){
  var h2b="";
  if(!DATA.input){
    loadData("input","ENG2P_INPUT",function(){ renderBlockPane(); });
    return '<div class="n">조준표를 여는 중이다.</div>';
  }
  var w=aimWeek(pl);
  if(!w) return '<div class="n">'+pl.week+'주 조준표 과제를 못 찾았다.</div>';
  if(seat==="alone"){
    var task=aimTask(w,pl), c=aimCollect(pl);
    /* **초점을 두 곳이 말하면 두 사람이 어느 쪽인지 모른다.**
       위 줄이 회차 초점을 말한다. 기준서 10.3 이 정한 것이고 하루가 한 회차다.
       조준표는 그 위에 더 좁은 것을 얹는다. 조준표 4장이 "강의가 지정하는 과제는
       이보다 좁다" 고 적어 뒀다. **넓은 것과 좁은 것이지 둘 중 하나가 아니다.**
       그래서 여기서 초점을 다시 말하지 않는다. 좁은 것만 말한다. T210 */
    var h='<div class="aim"><div class="k">이 주에 찾을 것 · '+pl.week+'주</div>'+
          '<div class="v big">'+esc(task||"")+'</div>'+
          '<div class="n">회차 초점보다 좁다. 이것 하나만 한다.'+
          ' 다른 것이 들려도 이번에는 안 센다.</div>';
    if(w.tasks.length>1)
      h+='<div class="n">이 주는 강마다 과제가 다르다. 위엣것이 '+pl.lectureNo+'강 것이다.</div>';
    if(c) h+='<div class="k">주마다 적어 올 것</div><div class="v">'+esc(c.text)+'</div>'+
            (c.layer2?'<div class="n">2층 채집이다. 지어내지 않고 본 것을 그대로 적는다.</div>':"");
    return h+aimWrite("alone")+'</div>';
  }
  var x=aimCross(pl,round);
  h2b=aimPhase(pl);
  var h2='<div class="aim">'+h2b+'<div class="k">같이 듣고 맞춰 보는 법 · '+round+'회차</div>';
  h2+='<div class="v">'+esc(x?x.how:"")+'</div>';
  h2+='<div class="n">누가 맞았는지 정하지 않는다. 어긋났다는 것만 적는다.</div>';
  return h2+aimWrite("together",round)+'</div>';
}

/* 적는 칸. **적으라고 하는데 적을 칸이 없었다.** T208 진단이다.
   그래서 두 사람이 종이를 꺼냈고 그 종이가 40분 내내 화면 옆에 켜져 있었다.

   자리마다 다르다.

     블록 1   각자 적는다. **서로 안 보인다.** 그것이 이 자리의 장치다
     블록 4   둘 것을 펴고 겹친 수와 안 겹친 수를 같이 센다

   기기가 하나면 가릴 수 없다. 그때는 두 칸을 다 보이고 그 사실을 말한다.
   D단계가 기기 둘을 만들면 그 말이 없어진다. */
/* **회차마다 대조하는 것이 다르다.** 조준표 6장이 그렇게 정한다.
   1회차는 표시한 지점을 세고, 2회차는 덩어리를 견주고, 3회차는 요약을 맞춘다.
   같은 칸 두 개로 셋을 다 받되 **이름과 판정이 회차마다 다르다.** T214

     1회차   겹친 지점과 안 겹친 지점을 센다. 안 겹친 것이 더 많으면 한 번 더 듣는다
     2회차   덩어리를 견준다. 하나도 안 겹치면 덩어리 판정 기준이 아직 안 잡힌 것이다
     3회차   한 사람이 요약하고 한 사람이 보탠다. 어긋난 것은 미해결 LRE 로 간다 */
var AIMLABEL={1:["표시한 지점","표시한 지점"],
              2:["끊어 들은 덩어리","끊어 들은 덩어리"],
              3:["요약","보탤 것"]};
function aimWrite(seat, round){
  var mine=deviceSide();
  var A=roleOf(today())==="a"?S.names.a:S.names.b;
  var B=roleOf(today())==="a"?S.names.b:S.names.a;
  var lab=AIMLABEL[round]||AIMLABEL[1];
  function box(side,name,what){
    /* 이름 뒤에 조사를 안 붙인다. 받침 있는 이름과 없는 이름이 다르게 읽힌다. */
    return '<label class="blank aimw"><span>'+esc(name)+' · '+esc(what)+'</span>'+
           '<textarea id="aim'+side.toUpperCase()+'" rows="2" '+
           'placeholder="한 줄로 적는다"></textarea></label>';
  }
  if(seat==="alone"){
    var h='<div class="k">여기 적는다</div>';
    if(mine==="a") h+=box("a",A,"찾은 자리")+'<div class="n">상대 칸은 이 기기에 안 뜬다. 블록 4에서 같이 편다.</div>';
    else if(mine==="b") h+=box("b",B,"찾은 자리")+'<div class="n">상대 칸은 이 기기에 안 뜬다. 블록 4에서 같이 편다.</div>';
    else h+=box("a",A,"찾은 자리")+box("b",B,"찾은 자리")+
      '<div class="n">이 기기를 쓰는 사람을 안 골랐다. 두 칸을 다 보여 주는 중이다. '+
      '따로 적는 자리라 서로 안 보는 것이 낫다.</div>';
    return h;
  }
  var h2='<div class="k">따로 적은 것을 편다</div>'+box("a",A,lab[0])+box("b",B,lab[1]);
  /* 3회차는 세는 것이 아니라 맞추는 것이다. 셈 칸을 안 낸다. */
  if(round===3)
    return h2+'<div class="n" id="aimSay">어긋난 것은 미해결 LRE 로 적는다. '+
           '누가 맞았는지는 정하지 않는다.</div>';
  return h2+'<div class="cntrow">'+
    '<label class="blank"><span>겹친 것</span>'+
    '<input type="number" min="0" step="1" id="aimSame"></label>'+
    '<label class="blank"><span>안 겹친 것</span>'+
    '<input type="number" min="0" step="1" id="aimDiff"></label></div>'+
    '<div class="n" id="aimSay"></div>';
}
/* **판정을 화면이 말한다.** 조준표 6장에 적힌 조건을 사람이 매번 세어 볼 수는 없다.
   숫자를 넣으면 그 자리에서 무엇을 해야 하는지가 나온다. 판정하는 사람은 없다. */
function aimVerdict(round){
  var e=document.getElementById("aimSay");
  if(!e || round===3) return;
  var a=(day(today()).aim)||{}, s=+a.same||0, d=+a.diff||0;
  if(!s && !d){ e.textContent="센 것을 넣으면 무엇을 할지 여기서 말한다."; return; }
  if(round===2 && s===0){
    e.textContent="덩어리가 하나도 안 겹쳤다. 덩어리 판정 기준이 아직 안 잡힌 것이다. "+
                  "그 강의 통과 기준을 다시 잰다."; return;
  }
  if(d>s) e.textContent="안 겹친 것이 더 많다. 그 자료를 한 번 더 듣는다. 조준표 6장이 정한다.";
  else e.textContent="겹친 것이 더 많다. 다음으로 넘어간다.";
}
/* 값은 그린 뒤에 넣고 손이 올라가 있는 칸은 안 건드린다. `fillField` 를 본다. */
function bindAimWrite(rd){
  var r=day(today()), a=r.aim||(r.aim={a:"",b:"",same:0,diff:0});
  [["aimA","a"],["aimB","b"]].forEach(function(x){
    fillField(x[0], a[x[1]]||"");
    var el=document.getElementById(x[0]);
    if(el) el.oninput=function(){ a[x[1]]=el.value; save(); };
  });
  [["aimSame","same"],["aimDiff","diff"]].forEach(function(x){
    fillField(x[0], a[x[1]]?String(a[x[1]]):"");
    var el=document.getElementById(x[0]);
    if(el) el.oninput=function(){ a[x[1]]=+el.value||0; save(); aimVerdict(rd); };
  });
  aimVerdict(rd);
}

/* **조준표 8장이 안 하는 것을 정해 놓았는데 앱이 그것을 한 번도 안 말했다.**
   자막 켜고 듣기, 대본 먼저 읽고 듣기, 속도 낮춰 두 번 이상 듣기다.
   앱에 그 단추가 다 있다. 대본 가림 단추와 느리게 단추다.

   막지는 않는다. **막으면 종이로 하게 된다.** 그 자리에서 규칙을 말한다.
   그리고 늘 말하지 않는다. **그 자리에 갔을 때만** 말한다.
   늘 떠 있으면 안 읽는다. T220 */
/* 찾는 차례가 있다. **이 앱에는 자막이 없고 대본이 있다.**
   자막 줄이 목록에서 먼저 나오는데 그것을 집으면 안 한 일을 했다고 말하게 된다.
   그래서 규칙을 하나로 안 찾고 차례대로 찾는다. */
function aimAvoid(pl, res){
  var d=DATA.input; if(!d) return null;
  var q=(d.items||[]).filter(function(x){return x.quarter===pl.quarter;})[0];
  if(!q) return null;
  for(var i=0;i<res.length;i++){
    var hit=(q.avoid||[]).filter(function(a){return res[i].test(a.what);})[0];
    if(hit) return hit.what+(hit.why?" · "+hit.why:"");
  }
  return null;
}
function renderMediaPane(pl, seat){
  var head='<div class="k">이 블록에 쓰는 것 · 미디어</div><div class="v">'+
           esc(pl.media||"(없음)")+'</div>';
  if(!pl.media) return head;
  /* 차림표를 늦게 읽는다. 블록 칸은 세션에 들어가야 그린다. T213 */
  if(!MEDIA.length){
    needMedia(function(){ renderBlockPane(); });
    return head+'<div class="n">차림표를 여는 중이다.</div>';
  }
  var i=MEDIA.findIndex(function(x){return x.id===pl.media;});
  var it=i>=0?MEDIA[i]:null;
  if(!it) return head+'<div class="n">카탈로그에서 그 과를 못 찾았다.</div>';
  var done=lecPass(pl.lectureNo);
  var round=roundNow(pl.lectureNo);
  var full=done>=3;
  var focus = (full ? "세 회차를 다 끝냈다. 오늘은 다시 듣기다. 초점은 의미다."
                    : ROUND_FOCUS[round]) + " " + SEAT_NOTE[seat];
  /* **다 끝내고 나서 무엇을 하는지가 화면에 없었다.** 세 회차를 마치면
     그 과는 끝인데 화면은 다시 듣기라고만 했다. 그 과가 끝났다는 것과
     다음이 무엇인지는 회전 탭에 있고 세션 중에는 거기까지 안 간다. T219 */
  var after = full && seat==="together"
    ? '<div class="n">이 과는 세 회차를 다 돌았다. 다음 강의 과는 다음 세션에 뜬다. '+
      '지금 남은 시간은 다시 듣기와 대조에 쓴다.</div>' : "";
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
  h+=after;
  h+=renderAimPane(pl, seat, round);
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
  /* 지금 어긴 것만 말한다. 대본을 회차 기본보다 더 보이게 했거나 속도를 낮췄을 때다. */
  var deft=(round===1?2:round===2?1:0);
  if(veil<deft){
    var sc=aimAvoid(pl,[/대본/,/자막/]);
    if(sc) h+='<div class="cardwarn">조준표가 안 하기로 한 것이다. '+esc(sc)+'</div>';
  }
  if(rateOf()<1){
    var rt=aimAvoid(pl,[/속도/]);
    if(rt) h+='<div class="cardwarn">조준표가 안 하기로 한 것이다. '+esc(rt)+'</div>';
  }
  setTimeout(function(){
    bindAimWrite(round);
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
          var addedPass=null;
          if(next){ var c=passRec()[it.id]||(passRec()[it.id]={});
                    c[next[0]]=true; addedPass=next[0]; syncMediaDone(it.id); }
          save();
          renderBlockPane(); renderMediaStats && renderMediaStats();
          flash((cur+1)+"회차를 적었다");
          /* **회차는 사흘에 하나씩 오르는 값이다.** 잘못 누르면 그날 것이 사라지고
             그 과가 하루 일찍 끝난 것으로 남는다. 그리고 그것이 눈에 안 띈다.
             다음 세션에 초점이 한 칸 건너뛴 채로 뜰 뿐이다.
             기록을 지우는 자리가 아니라 **올리는 자리인데도 되돌릴 수 있어야 한다.** T219 */
          offerUndo((cur+1)+"회차로 적었다",function(){
            lecRound()[no]=cur;
            if(addedPass){ var pc=passRec()[it.id];
                           if(pc) delete pc[addedPass];
                           syncMediaDone(it.id); }
            renderBlockPane(); renderMediaStats && renderMediaStats();
          });
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

