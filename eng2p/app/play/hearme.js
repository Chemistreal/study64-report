/* =========================================================================
   내 소리는 네가 (T265). `docs/play_rules.md` 3.3

     쓰는 것    오늘 과의 대본 + 듣는 쪽 지시. `out/data/listen.js` (T264). **B등급**
     시작 조건  두 사람이 마주 앉아 있다. **기기 수는 상관없다**
     역할       말하는 쪽과 듣는 쪽. **세 줄마다 바뀐다**
     도는 차례  말하는 쪽이 읽는다. 듣는 쪽 화면에 **무엇을 들으라고** 뜬다
     판정       **듣는 사람.** 자기 발음은 자기가 못 듣는다
     끝         여섯 줄을 돌면 끝난다
     못 했을 때 짚을 것이 없으면 없다고 말한다. **없다도 답이다**
     기록할 값  여섯 줄 중 **짚을 것이 없었던 줄**이 몇인가

   앞의 두 판과 갈리는 자리가 셋이다.

     **판정이 듣는 쪽에 있다.** 거울과 한 줄 바꾸기는 읽은 사람이 판정했다
     기록하는 것이 **못 한 것이 아니라 깨끗한 것**이다. 없는 것을 센다
     기기가 하나면 **돌려 보기가 안 된다.** 둘이 같은 순간에 봐야 한다

   셋째는 `docs/solo_plays.md` 4.1 이 정했다. 대본은 종이에 있고 지시는 화면에 있다.
   ========================================================================= */
var HRM={every:3, n:6, seats:["말하는 쪽","듣는 쪽"]};

function hrmToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
function hrmItems(){
  var d=DATA.listen, mid=hrmToday();
  if(!d || !d.items || !mid) return null;
  var rows=d.items[mid]||[];
  if(!rows.length) return null;
  var out=roundPick("hearme", rows, HRM.n);
  return out;
}
function hrmLine(li){
  var t=DATA.transcripts, mid=hrmToday();
  if(!t || !t.items || !mid) return null;
  var ls=t.items[mid]; if(!ls || li>=ls.length) return null;
  return String(ls[li]).replace(/^[A-Z][A-Za-z .'-]{0,20}:\s*/, "");
}
/* **여기서 세는 것은 없었던 줄이다.** 규칙서가 그렇게 적었다.
   틀린 것을 세면 그 숫자가 곧 못한 셈이 되고 그것은 원칙 4가 막는 자리다. */
function hrmRec(){ return playRec("hearme", {none:0, judged:0, ln:-1}); }

var HRMCLK={t:null, left:0, over:false};
function hrmClockStop(){ if(HRMCLK.t){ clearInterval(HRMCLK.t); HRMCLK.t=null; } }
function hrmClockText(){
  if(HRMCLK.over) return "0:00";
  var s=HRMCLK.left>0?HRMCLK.left:HRM.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function hrmClockGo(min){
  if(HRMCLK.t){ hrmClockStop(); return; }
  if(HRMCLK.left<=0){ HRMCLK.left=min*60; HRMCLK.over=false; }
  tone("start");
  HRMCLK.t=setInterval(function(){
    HRMCLK.left--;
    var e=document.getElementById("hrmClock");
    if(!e){ hrmClockStop(); return; }
    if(HRMCLK.left<=0){
      HRMCLK.over=true; hrmClockStop(); tone("blockend"); renderHearme(); return;
    }
    e.textContent=hrmClockText();
  },1000);
  var e=document.getElementById("hrmClock"); if(e) e.textContent=hrmClockText();
}

function renderHearme(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("hearme");
  HRM.min=p.min;
  if(!DATA.listen){
    box.innerHTML=dataWait("듣는 쪽 지시를","listen");
    if(!dataFailed("listen")) loadData("listen","ENG2P_LISTEN",function(){ renderHearme(); });
    return;
  }
  if(!DATA.transcripts){
    box.innerHTML=dataWait("대본을","transcripts");
    if(!dataFailed("transcripts")) loadData("transcripts","ENG2P_TRANSCRIPTS",function(){ renderHearme(); });
    return;
  }
  var mid=hrmToday();
  if(!mid){
    box.innerHTML='<div class="card"><div class="note w"><b>오늘 과가 없다.</b> '+
      '이 판은 오늘 과의 대본으로 돈다.</div></div>';
    return;
  }
  var items=hrmItems();
  if(!items){
    box.innerHTML='<div class="card"><div class="note w">'+esc(mid)+
      ' 과에 듣는 쪽 지시가 없다. <b>scripts/derive_listen.py</b> 를 돌려야 돈다.'+
      '</div></div>';
    return;
  }
  var s=roundStep("hearme"), rec=hrmRec();
  var h='<div class="card">'+playHead(p,s);
  if(HRMCLK.over)
    h+='<div class="note w" style="margin-top:10px"><b>5분이 됐다.</b> '+
       '남은 줄은 안 돈다. 못 돈 줄은 못 한 것이 아니라 <b>시간이 그만큼인 것</b>이다.</div>';

  if(items.length<HRM.n && s===0)
    h+='<div class="note" style="margin-top:10px">이 과는 지시가 <b>'+
       items.length+'줄</b>뿐이다. <b>있는 만큼 돈다.</b> 다른 과에서 가져오지 않는다.</div>';

  if(s>=items.length){
    h+='<div class="note g" style="margin-top:10px"><b>'+items.length+
       '줄을 다 돌았다.</b> 이 기기가 판정한 것은 '+rec.judged+'줄이고 '+
       '그중 <b>짚을 것이 없었던 줄이 '+rec.none+'</b>이다.</div>';
    /* **깨끗한 줄을 센다.** 규칙서가 남기라는 값이 그것이다.
       틀린 줄을 세면 그 숫자가 못한 셈이 되고 원칙 4가 그것을 막는다. */
    h+='<div class="note">규칙서가 남기라는 값은 <b>짚을 것이 없었던 줄</b>이다. '+
       '틀린 줄이 아니다. 늘어야 하는 쪽은 이 숫자다.</div>';
    h+=playHalf(items.length)+playGrade(DATA.listen);
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="hrmAgain">처음부터</button></div></div>';
    box.innerHTML=h;
    $("#hrmAgain").onclick=function(){
      roundStepSet("hearme",0); turnForget("hearme");
      rec.none=0; rec.judged=0; rec.ln=-1; save();
      hrmClockStop(); HRMCLK.left=0; HRMCLK.over=false; renderHearme();
    };
    return;
  }

  var it=items[s], line=hrmLine(it.li);
  var kind=(DATA.listen.kinds||{})[it.kind];
  if(line==null || !kind){
    h+='<div class="note w" style="margin-top:10px">대본이나 지시를 못 찾았다. '+
       '<b>python3 scripts/all.py</b> 를 돌린다.</div></div>';
    box.innerHTML=h; return;
  }

  /* **기기가 하나인 날은 돌려 보기가 안 된다.** `docs/solo_plays.md` 4.1.
     둘이 같은 순간에 다른 것을 봐야 한다. 대본은 종이에 있고 지시는 화면에 있다.
     그래서 기기를 든 사람이 늘 듣는 쪽이다. 건네지 않는다. */
  var solo=(typeof soloOn==="function") && soloOn();
  var first=solo ? false : roundFirst(s, HRM.every);
  if(!solo && first===null){
    /* 이 판은 앞의 둘과 다르다. 시작 조건이 **기기 수는 상관없다**이다.
       기기 쪽을 안 골랐으면 종이 갈래로 돌면 된다. 막지 않고 길을 알린다. */
    h+='<div class="note w" style="margin-top:10px"><b>기기 쪽을 안 골랐다.</b> '+
       '이 판은 기기가 하나여도 돈다. 대장 탭에서 쪽을 고르거나, '+
       '규칙 탭에서 <b>돌려 보기</b>를 켜면 이 기기가 듣는 쪽이 된다. '+
       '말하는 쪽은 종이 강의록의 대본을 본다.</div></div>';
    box.innerHTML=h; return;
  }
  if(solo)
    h+='<div class="note" style="margin-top:10px"><b>기기가 하나다. 건네지 않는다.</b> '+
       '둘이 같은 순간에 봐야 하는 판이다. 말하는 쪽은 <b>종이 강의록</b>의 대본을 보고 '+
       '이 기기는 듣는 쪽이 든다.</div>';

  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?HRM.seats[0]:HRM.seats[1])+'</b></span>'+
     '<span class="small mut">'+(s+1)+' / '+items.length+'번째 줄 · '+esc(mid)+'</span></div>';

  h+=first ? hrmSpeaker(line) : hrmListener(it, kind, s, rec);

  h+='<div id="hrmTurn"></div>';
  h+='<div class="small mut" style="margin-top:10px">자리는 <b>세 줄마다</b> 바뀐다. '+
     '다음에 바뀌는 줄은 '+(roundNextTurn(s,HRM.every)+1)+'번째다.</div>';
  h+='<div class="row" style="margin-top:8px">'+
     '<button class="g" id="hrmGo">5분 시계 <span class="mono" id="hrmClock">'+
     hrmClockText()+'</span></button></div>'+playGrade(DATA.listen)+'</div>';
  box.innerHTML=h;
  hrmBind(s, rec, first);
}

/* 말하는 쪽. **줄만 있다. 지시가 없다.**
   무엇을 듣는지 알면 그 자리만 신경 써서 읽는다. 그러면 재는 것이 없어진다. */
function hrmSpeaker(line){
  return '<div class="note" style="margin-top:10px">아래 줄을 <b>평소대로</b> 읽는다. '+
    '상대가 무엇을 듣고 있는지는 <b>모르는 채로 읽는다.</b></div>'+
    '<div class="swpline">'+esc(line)+'</div>'+
    '<div class="vhid" aria-hidden="true" style="margin-top:10px">'+
    '<span>무엇을 듣는지는 상대 화면에만 있다</span></div>';
}
/* 듣는 쪽. **지시가 이 화면에만 있다. 줄은 없다.**
   줄이 있으면 눈으로 읽어 버린다. 이 판은 귀로 하는 판이다. */
function hrmListener(it, kind, s, rec){
  /* **영어 낱말 뒤에 조사를 안 붙인다.** 받침이 있는 것과 없는 것이 섞이고
     `l` 이나 `all` 같은 것에는 무엇을 붙여도 어색하다. 쌍점으로 잇는다. T245 */
  var h='<div class="note" style="margin-top:10px">듣는 것: <b>'+esc(kind.name)+'</b>'+
    (it.word ? ' · 낱말: <b>'+esc(it.word)+'</b>' : ' · 줄 전체의 박자')+'</div>'+
    '<div class="hrmsay">'+esc(kind.say)+'</div>'+
    '<div class="small mut">근거: '+esc(kind.why)+' (블록 2 근거표)</div>'+
    '<div class="note w" style="margin-top:10px">듣고 나서 <b>소리 내어 말해 준다.</b> '+
    '<b>짚을 것이 없으면 없다고 말한다. 없다도 답이다.</b></div>'+
    '<div class="row" style="margin-top:8px">'+
    '<button class="b" id="hrmNone">짚을 것이 없었다</button>'+
    '<button class="g" id="hrmSome">짚어 줬다</button></div>'+
    '<div class="small mut" style="margin-top:6px">'+
    '<b>판정은 듣는 사람이 한다.</b> 자기 발음은 자기가 못 듣는다. '+
    '누구 잘못인지는 안 가른다. 벌도 없다.</div>';
  return h;
}
function hrmBind(s, rec, first){
  if($("#hrmGo")) $("#hrmGo").onclick=function(){ hrmClockGo(HRM.min); };
  function step(){
    var n=s+1;
    roundStepSet("hearme", n); renderHearme();
    if(turnCheck("hearme", n, HRM.every))
      turnAlert(n, HRM.every, HRM.seats, "hrmTurn");
  }
  if(first) return;   /* 말하는 쪽에는 판정 단추가 없다 */
  if($("#hrmNone")) $("#hrmNone").onclick=function(){
    rec.ln=s; rec.none++; rec.judged++; save(); step();
  };
  if($("#hrmSome")) $("#hrmSome").onclick=function(){
    rec.ln=s; rec.judged++; save(); step();
  };
}
PLAYREND.hearme=renderHearme;
