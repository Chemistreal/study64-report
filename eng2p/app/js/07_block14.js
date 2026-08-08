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

