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
function renderAimPane(pl, seat, round){
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
  var h2='<div class="aim"><div class="k">같이 듣고 맞춰 보는 법 · '+round+'회차</div>';
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

