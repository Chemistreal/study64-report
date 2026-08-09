/* =========================================================================
   판 화면의 나머지. 쪽 표시와 교대 알림과 가리기와 소리 나누기와 자리 맞추기다.

   **`24_round.js` 가 544줄이 됐다.** 500줄을 넘으면 한 화면에 안 들어오고
   그러면 고칠 때 위아래를 오가다 딴 데를 건드린다 (T161). 그래서 뗐다.
   앞엣것은 셈이고 이쪽은 화면이다. 그 자리에서 갈랐다.
   ========================================================================= */
/* =========================================================================
   이 기기가 어느 쪽인가를 화면 전체로 (T242).

   **기기 쪽은 날마다 뒤집힌다** (T216). 어제 A였다고 오늘 A가 아니다.
   그리고 판 안에서 자리가 또 돈다 (T239). 글자 한 줄로는 안 따라간다.

   화면 위에 띠를 두고 오른쪽 위에 글자를 적는다.
   **색만으로 안 가른다.** 색을 못 보는 눈에도 갈려야 한다.

   **매초 도는 자리에서 부르지 않는다.** 바뀔 때만 다시 그린다.
   매초 도는 자리에 무엇을 두면 그것이 매초 일어난다 (T211).
   ========================================================================= */
var SIDE={was:null};
function sideNow(){
  if(typeof soloOn==="function" && soloOn())
    return {cls:"side-"+(soloSeat()===0?"a":"b"),
            tag:(soloSeat()===0?"A":"B")+" 돌려 보기"};
  var d=(typeof deviceSide==="function")?deviceSide():null;
  if(!d) return {cls:"side-none", tag:"쪽 안 고름"};
  var who=(devicePerson()==="a")?S.names.a:S.names.b;
  return {cls:"side-"+d, tag:d.toUpperCase()+" "+who};
}
function paintSide(){
  var s=sideNow(), key=s.cls+"|"+s.tag;
  /* 값이 그대로여도 **자리가 정말 붙어 있는지**를 같이 본다.
     안 보면 다른 자리가 body 의 class 를 통째로 쓰는 날 띠가 지워지고
     이 함수는 안 바뀌었다며 그냥 돌아간다. **그러면 영영 안 돌아온다.**
     지금은 아무도 통째로 안 쓰는데 그것을 매번 확인하며 살 수는 없다. T242 */
  if(SIDE.was===key && document.body.classList.contains(s.cls)) return;
  SIDE.was=key;
  var b=document.body;
  b.classList.remove("side-a","side-b","side-none");
  b.classList.add(s.cls);
  var t=$("#sideTag"); if(t) t.textContent=s.tag;
}

/* =========================================================================
   자리가 바뀌었다고 알리기 (T243).

   `roundNextTurn` 이 언제 바뀌는지를 세 주기는 하는데 **바뀐 그 순간에 아무 일도
   안 났다.** 규칙서가 "넉 줄마다 바뀐다" 고 적어 놓았고 화면은 조용했다.
   그러면 두 사람이 세면서 돈다. 세다가 어긋나면 둘이 같은 자리를 맡는다.

   알리는 것에 셋이 붙는다.

     소리    `tone("swap")`. 같은 음 둘. 주고받는 꼴
     글      **누가 무엇을 하는지**를 적는다. 바뀌었다고만 하면 모른다
     띠      화면 위 띠가 잠깐 굵어진다. 소리를 껐을 수도 있다

   소리만으로 안 알린다. 소리를 끌 수 있고 (T222) 끈 사람에게는 아무 일도 안 난다.
   ========================================================================= */
/* **회 번호와 지난번 자리를 저장소에 남긴다.** 안 남기면 끊겼다 다시 열 때
   회가 0으로 돌아가고 (판을 다시 처음부터 돈다) 지난번 자리가 없어져
   자리가 바뀌지도 않았는데 알리거나 바뀌었는데 안 알린다. T247

   `docs/round.md` 6장이 "회 번호는 각자 센다" 고 정했다. 각자 센다는 것은
   각자 들고 있다는 뜻이고, 들고 있으려면 끊겨도 남아 있어야 한다.
   기기마다 다른 값이라 안 건너간다. */
function roundStep(playId){
  if(!S.rstep) S.rstep={};
  return S.rstep[String(playId)]|0;
}
function roundStepSet(playId, n){
  if(!S.rstep) S.rstep={};
  S.rstep[String(playId)]=Math.max(0,n|0); save();
}
var TURN={at:{}};
/* 지난번에 본 자리와 견준다. **처음 보는 판은 안 알린다.**
   판을 처음 열 때 알리면 아직 아무것도 안 바뀌었는데 바뀌었다고 하는 것이다. */
function turnCheck(playId, step, every){
  var f=roundFirst(step, every), k=String(playId);
  if(!S.rseat) S.rseat={};
  /* 이 판을 이번에 처음 보는가는 **저장소까지 보고** 정한다.
     기억만 보면 끊겼다 다시 열 때마다 처음 보는 판이 된다. */
  var was=(k in TURN.at) ? TURN.at[k] : (k in S.rseat ? S.rseat[k] : null);
  TURN.at[k]=f; S.rseat[k]=f; save();
  if(was==null || was===f || f===null) return null;
  return {step:step, next:roundNextTurn(step, every)};
}
function turnForget(playId){ delete TURN.at[String(playId)]; }
/* **바뀌었다고만 하면 모른다.** 이제 이 사람이 무엇을 하는지를 적는다.
   `names` 는 판이 주는 두 자리 이름이다. */
function turnSay(step, every, names){
  var f=roundFirst(step, every);
  if(f===null) return "";
  return "자리가 바뀌었다. 이제 "+(f?names[0]:names[1])+"이다.";
}
/* 띠를 잠깐 굵게. 소리를 껐어도 이것은 보인다. */
function turnFlash(){
  document.body.classList.add("turn-flash");
  clearTimeout(turnFlash.t);
  turnFlash.t=setTimeout(function(){
    document.body.classList.remove("turn-flash");
  },1400);
}
function turnAlert(step, every, names, into){
  var say=turnSay(step, every, names);
  if(typeof tone==="function") tone("swap");
  turnFlash();
  var box=(typeof into==="string")?$("#"+into):into;
  if(box) box.innerHTML='<div class="note w turnnote"><b>'+esc(say)+'</b></div>';
  return say;
}

/* =========================================================================
   즉시 가리기 (T244).

   T240 이 몫을 갈랐다. 이 기기 것만 보이고 상대 몫은 자리만 남는다.
   그것으로 안 되는 자리가 하나 있다. **상대가 이 화면 쪽으로 올 때다.**

   둘이 한 상에 마주 앉아 있다 (기준서 2.1). 기기가 둘이어도 상 하나다.
   몸을 기울이면 상대 화면이 보인다. 격차 판에서 그것이 판을 무너뜨린다.
   그리고 그것은 상대가 나쁜 것이 아니라 **눈이 하는 일**이다.

   그래서 그 자리에서 덮는 것을 하나 둔다.

     누른다      화면이 통째로 덮인다. 밑에 아무것도 안 그린다
     H 를 친다   같은 일. 손이 화면에서 멀 때
     다시 누른다 이 기기 사람이 푼다

   **덮개를 걷는 것을 상대가 못 하게 막지 않는다.** 그것은 자물쇠고
   자물쇠는 이 과정에 없다. 둘이 같이 하는 일이고 규칙으로 도는 것이다.
   화면은 규칙을 지키기 쉽게만 만든다.

   `veiled` 는 이 기기의 값이다. 안 건너간다.
   ========================================================================= */
function veiled(){ return !!(S && S.veiled); }
function veilToggle(after){
  S.veiled=!veiled(); save();
  if(typeof paintVeil==="function") paintVeil();
  if(after) after();
}
/* 덮개. **이 안에 판의 글이 한 글자도 없다.** 왜 덮였는지만 적는다. */
function paintVeil(){
  var on=veiled(), box=$("#veilCover");
  if(!box){
    if(!on) return;
    box=document.createElement("div");
    box.id="veilCover"; box.className="veilcover";
    document.body.appendChild(box);
  }
  box.hidden=!on;
  document.body.classList.toggle("veil-on", on);
  if(!on) return;
  box.innerHTML='<div class="veilbox"><div class="sotitle">가렸다</div>'+
    '<div class="somsg">이 기기를 보는 사람이 푼다. 상대가 지나갈 때 누른다.</div>'+
    '<button class="g" id="veilOff">푼다</button></div>';
  $("#veilOff").onclick=function(){ veilToggle(); };
}
/* 조작줄의 가림 단추. 세션 중에 늘 떠 있는 유일한 자리다. */
if($("#focusVeil")) $("#focusVeil").onclick=function(){ veilToggle(); };

/* =========================================================================
   소리 나누기 (T245).

   규칙서 스무 판을 훑어 **앱이 소리를 내는데 한쪽만 들어야 하는 판**을 셌다.
   하나다. "A가 소리를 듣는다. B에게 말로 옮긴다. B가 적는다. 원문과 견준다."

   나머지 판에서 나는 소리는 사람이 낸다. 사람이 내는 소리는 나눌 것이 없다.
   상대가 듣는 것이 그 판의 뼈대다.

   **소리는 화면처럼 못 가른다.** 화면은 두 기기가 각자 그리면 갈린다.
   소리는 한 상에서 울리면 둘 다 듣는다. 기기가 둘이어도 상은 하나다 (T244).

   앱이 할 수 있는 것과 못 하는 것을 갈라 둔다.

     할 수 있다   **어느 기기가 소리를 낼지**를 정한다. 듣는 쪽 기기만 낸다
     못 한다      그 소리가 상대 귀에 안 닿게 하는 것. 그것은 이어폰이다

   못 하는 것을 하는 척하지 않는다. **이어폰을 끼웠는지를 묻고 답을 받는다.**
   기기가 하나인 날은 이어폰 말고 길이 없다.
   ========================================================================= */
/* 이 기기가 지금 소리를 내는 자리인가. 안 고른 날은 낸다 (한 기기다). */
function soundMine(step, every){
  var f=roundFirst(step, every);
  return f===null ? true : !!f;
}
/* 이어폰을 물었고 답을 받았는가. **판마다 따로 묻는다.**
   한 번 묻고 그날 내내 안 물으면 다음 판에서 이어폰을 뺀 채로 돈다. */
var EAR={ok:{}};
function earOk(playId){ return !!EAR.ok[String(playId)]; }
/* **묻는 쪽이 정해져 있다.** 이어폰은 소리를 내는 기기에 끼운다.
   소리를 안 내는 기기에 물으면 엉뚱한 사람이 끼우고, 정작 소리가 나는 기기는
   안 끼운 채로 돈다. 두 화면을 나란히 읽다가 보였다 (T254).
   `step` 과 `every` 를 받으면 그것으로 가르고 안 받으면 그냥 묻는다. */
function earAsk(playId, into, after, step, every){
  var box=(typeof into==="string")?$("#"+into):into;
  if(!box) return;
  if(step!=null && typeof soundMine==="function" && !soundMine(step, every||1)){
    /* 한 줄로 다 말한다. 옆에 같은 말을 또 두면 두 줄이 겹쳐 읽힌다.
       실제로 "이 기기는 소리를 안 낸다" 가 두 줄 연달아 떴다 (T254). */
    box.innerHTML='<div class="note">이 기기는 소리를 안 낸다. '+
      '<b>이어폰은 상대 기기에 끼운다.</b> 듣는 자리는 위 표의 자리 줄에 있다.</div>';
    return;
  }
  if(earOk(playId)){
    box.innerHTML='<div class="note g">이어폰을 끼웠다. 이 기기 소리는 '+
      '<b>듣는 쪽 귀에만</b> 간다.</div>';
    return;
  }
  box.innerHTML='<div class="note w"><b>이 판은 한쪽만 듣는다.</b> '+
    '앱이 소리를 내는데 상 위에서 울리면 둘 다 듣는다. '+
    '<b>듣는 쪽이 이어폰을 끼운다.</b> 끼우기 전에는 안 시작한다.</div>'+
    '<button class="g" data-ear="'+esc(String(playId))+'">이어폰을 끼웠다</button>';
  box.querySelectorAll("[data-ear]").forEach(function(b){
    b.onclick=function(){ EAR.ok[b.dataset.ear]=true; earAsk(playId, box, after);
                          if(after) after(); };
  });
}
function earForget(playId){ delete EAR.ok[String(playId)]; }
/* 소리를 안 내는 기기가 조용히 있으면 고장 난 줄 안다. **왜 조용한지를 적는다.** */
function soundNote(step, every, names){
  if(soundMine(step, every)) return "";
  /* **자리 이름 뒤에 조사를 안 붙인다.** 이름은 판이 주는 것이고 받침이 있는 것과
     없는 것이 섞인다. "읽는 쪽가 듣는다" 가 실제로 나왔다. 쌍점으로 잇는다. T245 */
  return "이 기기는 소리를 안 낸다. 듣는 자리: "+(names&&names[0]||"상대")+".";
}

/* =========================================================================
   상대가 지금 어디인가 (T246).

   **이 기기는 모른다.** 망이 없다 (`docs/round.md` 2장).
   `docs/round.md` 5장이 동시 공개에서 같은 벽을 만났고 거기서 정한 대로 한다.
   **기기가 못 하는 것을 사람이 한다.** 둘이 마주 앉아 있다.

   그런데 사람이 하려면 견줄 것이 있어야 한다. 지금은 없다.
   시계는 각자 시작을 눌러 몇 초에서 몇 분까지 어긋나 있고
   블록을 한 번 잘못 넘긴 기기는 통째로 한 블록 앞서 간다.
   **어긋난 줄을 모르고 두 시간을 가는 것이 제일 나쁘다.**

   그래서 짧은 표시를 늘 띄운다. `3-12` 는 블록 3에 12분 남았다는 뜻이다.
   둘이 소리 내어 읽으면 그 자리에서 갈렸는지가 보인다.
   갈렸으면 상대 것을 쳐서 맞춘다. **뒤로도 앞으로도 간다.**
   ========================================================================= */
function sessTag(){
  if(typeof T==="undefined") return "";
  return (T.idx+1)+"-"+Math.max(0,Math.ceil(T.left/60));
}
/* 상대가 읽어 준 것을 받는다. `3-12` 꼴이고 사이에 무엇이 있어도 받는다. */
function sessRead(s){
  var m=/(\d)\s*[-.: ]\s*(\d{1,3})/.exec(String(s||""));
  if(!m) return null;
  var b=+m[1]-1, mi=+m[2];
  if(b<0 || b>=BLOCKS.length) return null;
  if(mi<0 || mi>BLOCKS[b].m) return null;
  return {idx:b, left:mi*60};
}
/* 맞춘다. **블록을 옮기는 것이지 되감는 것이 아니다.**
   블록 4에 있는데 상대가 블록 2를 읽어 주면 블록 2로 간다. 그것이 맞다.
   둘이 다른 블록에 있으면 같이 있는 것이 아니다. */
function sessAlign(at){
  if(!at) return false;
  T.idx=at.idx; T.left=at.left;
  if(typeof paintTimer==="function") paintTimer();
  if(typeof renderBlockPane==="function"){ PANE.sig=null; renderBlockPane(); }
  return true;
}
function renderWhere(){
  var b=$("#focusWhere"); if(b) b.textContent=sessTag();
  var box=$("#whereDock"); if(!box) return;
  if(box.hidden) return;
  box.innerHTML='<div class="small mut">이 기기는 <b class="mono">'+esc(sessTag())+
    '</b> 다. 상대가 읽어 준 것을 친다. 앞뒤 어느 쪽이든 간다.</div>'+
    '<div class="row"><input id="whereIn" class="mono" placeholder="3-12" '+
    'inputmode="text" autocomplete="off" style="max-width:110px">'+
    '<button class="g" id="whereGo">맞춘다</button>'+
    '<button class="g" id="whereNo">닫는다</button></div>'+
    '<div id="whereMsg" class="small mut"></div>';
  $("#whereGo").onclick=function(){
    var at=sessRead(($("#whereIn")||{}).value);
    if(!at){ $("#whereMsg").textContent="블록-분 꼴로 친다. 보기: 3-12"; return; }
    sessAlign(at);
    /* **다시 그린 다음에 적는다.** 먼저 적으면 다시 그리는 것이 그 글을 지운다.
       실제로 지웠다. 맞췄는데 화면이 아무 말도 안 했다. T246 */
    renderWhere();
    $("#whereMsg").textContent="맞췄다. 이제 "+sessTag()+" 다.";
  };
  $("#whereNo").onclick=function(){ box.hidden=true; box.innerHTML=""; };
}
if($("#focusWhere")) $("#focusWhere").onclick=function(){
  var box=$("#whereDock"); if(!box) return;
  box.hidden=!box.hidden; renderWhere();
};
