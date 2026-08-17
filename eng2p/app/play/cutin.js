/* =========================================================================
   끼어들기 (T301). `docs/play_rules.md` 10.2

     쓰는 것    오늘 과의 대본 + 신호 시각 표 `out/data/cutin.js` (T300). **B등급**
     시작 조건  한 사람이 읽기 시작했다
     역할       읽는 쪽과 듣는 쪽. **신호가 올 때마다 바뀐다**
     도는 차례  앱이 아무 때나 신호를 낸다. 그 순간 듣던 쪽이 끼어든다
     판정       **읽던 사람.** 끊긴 자리가 자연스러웠는지 자기가 안다
     끝         3분이 되면 끝난다. 몇 번 주고받았는지를 같이 센다
     못 했을 때 못 끼어들면 신호가 한 번 더 온다. 두 번째도 못 하면 역할만 바꾼다
     기록할 값  3분 동안 뒤집힌 횟수. **공동 값 하나**

   ## 시계를 한 기기만 든다

   신호 시각은 두 기기가 같은 벌을 본다 (T300). 그런데 **시계가 어긋난다.**
   두 사람이 시작을 각자 누르면 몇 초씩 벌어지고 (`round.md` 5장)
   그러면 같은 표를 봐도 다른 순간에 울린다.

   한쪽만 울리면 그 사람만 준비를 하고 **그러면 압박이 없어진다.**

   그래서 시계를 한 기기만 든다. 마주 앉아 있으니 소리는 둘 다 듣는다.
   어느 기기인지는 **회 0의 읽는 쪽**이다. 두 기기가 같은 값을 셈으로 얻는다.
   파장에서 시계를 한 화면에만 둔 것과 같은 자리다 (T292).

   ## 못 끼어든 것과 뒤집힌 것을 가른다

   규칙서가 "못 끼어들면 신호가 한 번 더 온다. 두 번째도 못 하면 역할만 바꾼다" 라고 적었다.

     끼어들었다        뒤집혔다. **셈에 든다**
     한 번 못 했다      신호가 한 번 더 온다. 역할은 그대로
     두 번째도 못 했다  역할만 바꾼다. **셈에 안 든다**

   셋째가 이 판의 자리다. 역할은 바뀌는데 셈은 안 는다.
   **못 한 것을 못 한 채로 넘긴다.** 벌이 아니고 셈도 아니다.
   ========================================================================= */
/* `sig` 는 **신호가 나 있는가**다. 시계 값으로 읽으면 안 된다.
   한 번 못 했을 때 시계를 안 되돌리므로 시계로는 그 상태를 못 가린다. T301 */
var CUT={seats:["읽는 쪽","듣는 쪽"], sig:false, miss:0};

function cutToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
/* 읽을 거리. **둘 다 본다.** 감출 것이 없다 (`solo_plays.md` 3장 16번).
   압박은 무엇을 읽는지가 아니라 **언제 끊길지**를 모르는 데서 온다. */
function cutLines(){
  var t=DATA.transcripts, mid=cutToday();
  if(!t || !t.items || !mid) return null;
  var ls=(t.items[mid]||[]).map(function(x){
    return String(x).replace(/^[A-Z][A-Za-z .'-]{0,20}:\s*/, "");
  }).filter(function(x){ return x.split(/\s+/).length>=4; });
  return ls.length ? ls : null;
}
/* 그날 읽을 여섯 줄. **함수로 뺀다.**

   여기 있던 `lines.slice(0,6)` 이 대본 앞 여섯 줄만 냈다 (T413~T415).
   뽑는 것이 아니라 자르는 것이라 한 과가 엿새 도는 내내 같은 여섯 줄이었고
   1370줄 중 312줄만 떴다. 어제 낸 것을 또 낸 날이 67%다.

   **함수로 뺀 까닭이 따로 있다.** 그리는 자리에 셈을 두면 검사기가 그것을
   못 부르고 제 안에 똑같은 셈을 한 벌 더 갖게 된다. 그러면 앱을 고쳐도
   검사기가 안 따라오고, 실제로 `check_unused.js` 가 그렇게 만들어져 있었다.
   앱을 고쳤는데 잰 값이 312 그대로였다. **둘이 같은 함수를 봐야 한다.** */
function cutShow(){
  var ls=cutLines();
  return ls ? roundPick("cutin", ls, 6) : [];
}
/* 오늘의 신호 벌. **두 기기가 같은 씨앗을 가지니 같은 벌을 고른다.** */
function cutDeck(){
  var d=DATA.cutin;
  if(!d || !d.decks || !d.decks.length) return null;
  return d.decks[roundSeed("cutin",0)%d.decks.length];
}
/* 시계를 드는 기기인가. **회 0의 읽는 쪽이다.** 판 내내 안 바뀐다. */
function cutHolder(){ return roundFirst(0, 1); }
/* 그날 셈. `flip` 은 끼어들어 뒤집힌 수, `pass` 는 두 번 다 못 해 그냥 바꾼 수. */
function cutRec(){ return playRec("cutin", {flip:0, pass:0}); }

var CUTCLK={t:null, left:0, over:false, at:0};
function cutClockStop(){ if(CUTCLK.t){ clearInterval(CUTCLK.t); CUTCLK.t=null; } }
function cutClockText(sec){
  if(CUTCLK.over) return "0:00";
  var s=CUTCLK.left>0?CUTCLK.left:sec;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
/* 시계. **신호 시각에 닿으면 소리를 내고 멈춰 세운다.**
   멈추지 않으면 두 사람이 끼어드는 동안 다음 신호가 온다. */
function cutClockGo(sec, deck, after){
  if(CUTCLK.t){ cutClockStop(); return; }
  if(CUTCLK.left<=0){ CUTCLK.left=sec; CUTCLK.over=false; CUTCLK.at=0; }
  tone("start");
  CUTCLK.t=setInterval(function(){
    CUTCLK.left--;
    var gone=sec-CUTCLK.left;
    var e=document.getElementById("cutClock");
    if(!e){ cutClockStop(); return; }
    if(CUTCLK.left<=0){
      CUTCLK.over=true; cutClockStop(); tone("blockend"); after(); return;
    }
    e.textContent=cutClockText(sec);
    /* 아직 안 낸 신호 중에 지난 것이 있으면 낸다 */
    while(CUTCLK.at<deck.length && deck[CUTCLK.at]<=gone){
      CUTCLK.at++;
      cutClockStop();
      CUT.sig=true;
      tone("swap");
      after();
      return;
    }
  },1000);
  var e=document.getElementById("cutClock"); if(e) e.textContent=cutClockText(sec);
}

function cutDone(d, rec, head){
  var h=head;
  h+='<div class="note">끼어들어 뒤집힌 것이 <b>'+rec.flip+'</b>번이고 '+
     '두 번 다 못 해 그냥 바꾼 것이 <b>'+rec.pass+'</b>번이다.</div>';
  /* **더하지 않는다.** 뒤집힌 횟수는 둘이 같이 만든 하나다 (이어달리기와 같다). */
  h+='<div class="note w">규칙서가 남기라는 값은 <b>뒤집힌 횟수</b> 하나다. '+
     '<b>시계를 든 기기가 센다.</b> 다른 기기는 그 수를 받아 적는다. '+
     '더하지 않는다.</div>';
  h+='<div class="note"><b>못 끼어든 것은 벌이 아니다.</b> 셈에 안 들 뿐이다. '+
     '끼어드는 것은 편치 않다. 그래서 이 판이 스무 판 중 제일 짧다.</div>';
  return h+playGrade(d)+
    '<div class="row" style="margin-top:10px">'+
    '<button class="g" id="cutAgain">처음부터</button></div></div>';
}

function renderCutin(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("cutin");
  if(!DATA.cutin){
    box.innerHTML=dataWait("신호 표를","cutin");
    if(!dataFailed("cutin")) loadData("cutin","ENG2P_CUTIN",function(){ renderCutin(); });
    return;
  }
  if(!DATA.transcripts){
    box.innerHTML=dataWait("대본을","transcripts");
    if(!dataFailed("transcripts")) loadData("transcripts","ENG2P_TRANSCRIPTS",function(){ renderCutin(); });
    return;
  }
  var d=DATA.cutin, lines=cutLines(), deck=cutDeck();
  if(!lines || !deck){
    box.innerHTML='<div class="card"><div class="note w">오늘 과의 대본이나 '+
      '신호 표가 없다. <b>scripts/derive_cutin.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    return;
  }
  var s=roundStep("cutin"), rec=cutRec();
  var h='<div class="card">'+playHead(p,s);

  if(CUTCLK.over){
    box.innerHTML=cutDone(d, rec, h+
      '<div class="note w" style="margin-top:10px"><b>'+d.min+'분이 됐다. 끝났다.</b></div>');
    $("#cutAgain").onclick=function(){ cutReset(rec); };
    return;
  }

  var hold=cutHolder();
  if(hold===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '시계를 한 기기만 들어야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고른다.</div></div>';
    box.innerHTML=h; return;
  }
  /* 지금 누가 읽나. **신호마다 뒤집힌다.** 회가 곧 뒤집힌 횟수다. */
  var first=roundFirst(s, 1);
  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>지금 <b>'+esc(first?CUT.seats[0]:CUT.seats[1])+'</b></span>'+
     '<span class="small mut">뒤집힘 '+s+'번 · '+esc(cutToday())+'</span></div>';

  h+='<div class="note" style="margin-top:10px">'+
     '읽는 쪽이 아래 대본을 소리 내어 읽는다. <b>신호가 나면 듣던 쪽이 끼어든다.</b> '+
     '그러면 역할이 뒤집힌다. <b>언제 날지는 아무도 모른다.</b></div>';

  h+='<div class="cutbox">';
  cutShow().forEach(function(x){
    h+='<div class="cutline">'+esc(x)+'</div>';
  });
  h+='</div>';

  if(hold){
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="b" id="cutGo">'+d.min+'분 시계 <span class="mono" id="cutClock">'+
       cutClockText(d.sec)+'</span></button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>시계는 이 기기만 든다.</b> 둘이 마주 앉아 있으니 소리는 같이 듣는다. '+
       '두 기기가 각자 재면 몇 초씩 어긋나 다른 순간에 울린다.</div>';
    if(CUT.sig){
      h+='<div class="note w"><b>신호가 났다.</b> 듣던 쪽이 끼어들 자리다.'+
         (CUT.miss?' <b>두 번째 신호다.</b>':'')+'</div>';
      h+='<div class="row" style="margin-top:8px">'+
         '<button class="b" id="cutIn">끼어들었다</button>'+
         '<button class="g" id="cutNo">못 끼어들었다</button></div>';
      h+='<div class="small mut" style="margin-top:6px">'+
         '<b>판정은 읽던 사람이 한다.</b> 끊긴 자리가 자연스러웠는지 자기가 안다. '+
         '<b>못 한 것은 벌이 아니다.</b> 셈에 안 들 뿐이다.</div>';
    }
  }else{
    h+='<div class="note" style="margin-top:10px"><b>시계는 저쪽 기기가 든다.</b> '+
       '신호도 저쪽에서 난다. 소리를 같이 듣는다. '+
       '이 기기는 대본만 보인다.</div>';
    h+='<div class="row" style="margin-top:8px">'+
       '<button class="g" id="cutFlip">뒤집혔다</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>이 자리에는 판정할 것이 없다.</b> 뒤집힐 때마다 눌러 회를 맞춘다. '+
       '안 누르면 이 화면이 누가 읽는지를 틀리게 말한다.</div>';
  }

  h+='<div class="small mut" style="margin-top:8px">끼어들어 뒤집힌 것 <b>'+
     rec.flip+'</b> · 그냥 바꾼 것 <b>'+rec.pass+'</b></div>';
  h+='<div id="cutTurn"></div>'+playGrade(d)+'</div>';
  box.innerHTML=h;

  if($("#cutGo")) $("#cutGo").onclick=function(){
    CUT.miss=0; CUT.sig=false;
    cutClockGo(d.sec, deck, function(){ renderCutin(); });
  };
  function flip(counted){
    if(counted) rec.flip++; else rec.pass++;
    save();
    CUT.miss=0; CUT.sig=false;
    var n=s+1;
    roundStepSet("cutin", n); renderCutin();
    if(turnCheck("cutin", n, 1)) turnAlert(n, 1, CUT.seats, "cutTurn");
  }
  if($("#cutIn")) $("#cutIn").onclick=function(){ tone("done"); flip(true); };
  if($("#cutNo")) $("#cutNo").onclick=function(){
    /* **한 번 더 준다.** 두 번째도 못 하면 역할만 바꾼다 (규칙서 10.2). */
    if(!CUT.miss){
      /* 신호가 나 있는 채로 둔다. **시계를 되돌리지 않는다.**
         되돌리면 그다음 신호 자리가 앞으로 밀려 표와 어긋난다. */
      CUT.miss=1;
      tone("swap");
      renderCutin();
      return;
    }
    flip(false);
  };
  if($("#cutFlip")) $("#cutFlip").onclick=function(){
    var n=s+1;
    roundStepSet("cutin", n); renderCutin();
    if(turnCheck("cutin", n, 1)) turnAlert(n, 1, CUT.seats, "cutTurn");
  };
}
function cutReset(rec){
  roundStepSet("cutin",0); turnForget("cutin");
  rec.flip=0; rec.pass=0; save();
  CUT.miss=0; CUT.sig=false; cutClockStop();
  CUTCLK.left=0; CUTCLK.over=false; CUTCLK.at=0;
  renderCutin();
}
PLAYREND.cutin=renderCutin;
