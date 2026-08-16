/* =========================================================================
   한 사람만 본다 (T289). `docs/play_rules.md` 7.1

     쓰는 것    역할형 카드의 A면 105장. `out/data/situ.js` (T288). **B등급**
     시작 조건  상황 카드 한 장이 **A 화면에만** 떴다
     역할       상황을 쥔 쪽과 알아내는 쪽. **한 장마다 바뀐다**
     도는 차례  A가 그 상황인 것처럼 말한다. B가 묻는다. **다섯 요소 중 둘**을 알아낸다
     판정       **상황을 쥔 사람**
     끝         둘을 알아내면 끝난다. 5분이 되면 A가 나머지를 읽어 주고 끝난다
     못 했을 때 A가 나머지 셋을 읽어 준다. **못 맞힌 것을 듣는 것도 입력이다**
     기록할 값  몇 번 물어서 닿았는가

   **자료에 B면이 없다** (T288). 화면이 가리는 것이 아니라 파생기가 안 담았다.
   그래서 이 파일에는 B면을 안 그리는 코드가 없다. 그릴 것이 없다.

   ## 알아낼 것은 값이 아니라 이름이다

   알아내는 쪽 화면에 뜨는 것은 **관계**와 **목적** 같은 요소 이름이다.
   그 값은 안 뜬다. 값이 뜨면 알아낼 것이 없다.

   이름도 안 주면 무엇을 물어야 할지 모른다. 그러면 판이 아니라 스무고개가 된다.
   **이름은 주고 값은 안 준다.** 그 사이가 이 판의 자리다.

   ## 같은 카드를 세 번까지 쓴다

   Q1 에 역할형이 열 장뿐이다 (`play_data.md` 6.1 의 D1).
   한 판에 둘씩 알아내니 다섯 요소가 2 + 2 + 1 로 세 판에 나뉜다.
   **이미 알아낸 요소를 빼고 낸다.** 다 빠지면 그 카드를 접는다.

   그래서 이 판만 **날을 넘는 기록**을 갖는다. `S.situ` 다.
   그날 셈(`playRec`)은 날마다 새로 나는데 어느 요소를 이미 냈는지는
   날이 바뀌어도 남아야 한다. 안 남기면 열 장이 열흘에 바닥난다.

   ## 스무 강까지 안 열린다

   그 열 장이 20강부터 나온다 (T288). 19강까지 한 장도 없다.
   **적어서가 아니라 아직 안 나와서다.** 화면이 그 둘을 다르게 적는다.
   ========================================================================= */
var ONE={seats:["상황을 쥔 쪽","알아내는 쪽"]};

function oneToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl || null;
}
/* 그날 강까지 나온 것만. **안 배운 카드를 앞당겨 쓰지 않는다.** */
function onePool(){
  var d=DATA.situ, pl=oneToday();
  if(!d || !d.cards || !pl || !pl.cards || !pl.quarter) return [];
  return d.cards.filter(function(c){
    return c.q < pl.quarter || (c.q === pl.quarter && c.no <= pl.cards.to);
  });
}
/* 날을 넘는 자리. **어느 요소를 이미 냈는가.** 그날 셈과 따로 둔다. */
function oneSeen(id){
  if(!S.situ) S.situ={};
  if(!S.situ[id]) S.situ[id]=[];
  return S.situ[id];
}
function oneLeft(c){
  var d=DATA.situ, seen=oneSeen(c.id);
  return d.parts.filter(function(p){ return seen.indexOf(p.key)<0; });
}
/* 그날 셈. `asks` 는 이 장에서 물은 수, `list` 는 장마다 몇 번에 닿았나. */
function oneRec(){ return playRec("onesee", {asks:0, list:[], deck:null}); }

/* 이 판에 낼 장. **아직 접지 않은 것만.** 다섯 요소를 다 낸 카드는 빠진다.

   **한 판 안에서는 안 바뀐다.** 한 장을 돌 때마다 요소 둘이 빠지고
   셋째 판이면 그 카드가 덱에서 없어진다. 그리면서 다시 세면
   그 순간 뒤 카드가 앞으로 당겨져 **이미 돈 장이 다시 나온다.**
   3초 벽에서 만난 그 자리다 (T283). 첫 장에 정해 두고 `처음부터` 가 지운다. */
function oneDeck(){
  var pool=onePool(), rec=oneRec();
  var by={}; pool.forEach(function(c){ by[c.id]=c; });
  if(rec.deck && rec.deck.length){
    var kept=rec.deck.map(function(id){ return by[id]; }).filter(Boolean);
    if(kept.length===rec.deck.length) return kept;
  }
  var live=pool.filter(function(c){ return oneLeft(c).length>0; });
  if(!live.length) return [];
  var out=roundPick("onesee", live, live.length);
  rec.deck=out.map(function(c){ return c.id; });
  save();
  return out;
}
/* 이 장에서 알아낼 요소. **안 낸 것 중 앞에서부터 `need` 개다.**
   남은 것이 모자라면 있는 만큼 낸다. 그것이 셋째 판이다. */
function oneAsk(c){
  var d=DATA.situ, left=oneLeft(c);
  return left.slice(0, d.need);
}

/* 마감. **두 자리에서 부른다.** 시계가 다 됐을 때와 덱을 다 돌았을 때다.
   두 번 적으면 한쪽만 고치는 날이 온다. 실제로 T289 에 두 번 적어 놓고
   한쪽 글만 고쳤다가 다시 합쳤다. */
function oneDone(d, rec, head){
  var got=rec.list.filter(function(x){ return x!==null; }).length;
  var h=head;
  h+='<div class="note">닿은 것은 '+got+'장이고 물은 수는 '+
     (rec.list.length
       ? esc(rec.list.map(function(x){
           return x===null ? "못 닿음" : String(x)+"번";
         }).join(", "))
       : "아직 없다")+'.</div>';
  h+='<div class="note w">규칙서가 남기라는 값은 <b>몇 번 물어서 닿았는가</b>다. '+
     '<b>적은 쪽이 잘한 것이 아니다.</b> 물은 수는 어디가 안 보였는지를 적은 것이다.</div>';
  /* `playHalf` 를 안 쓴다. 그 부품의 말은 "N장 중 몇" 꼴에 맞춰져 있고
     이 판의 값은 **장마다 몇 번 물었나** 라 셀 수 있는 하나가 아니다.
     틀에 안 맞는 값을 틀에 넣으면 화면이 "장마다 물은 수 중 몇" 이라고 적는다. */
  h+='<div class="note">자리가 <b>한 장마다</b> 바뀌니 이 목록은 '+
     '<b>이 기기가 쥐었던 장</b>만이다. 나머지는 상대 기기에 있다. '+
     '소리 내어 이어 읽는다. 기기끼리는 못 잇는다.</div>';
  return h+playGrade(d)+
    '<div class="row" style="margin-top:10px">'+
    '<button class="g" id="oneAgain">처음부터</button></div></div>';
}

var ONECLK={t:null, left:0, over:false};
function oneClockStop(){ if(ONECLK.t){ clearInterval(ONECLK.t); ONECLK.t=null; } }
function oneClockText(){
  if(ONECLK.over) return "0:00";
  var s=ONECLK.left>0?ONECLK.left:ONE.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function oneClockGo(min){
  if(ONECLK.t){ oneClockStop(); return; }
  if(ONECLK.left<=0){ ONECLK.left=min*60; ONECLK.over=false; }
  tone("start");
  ONECLK.t=setInterval(function(){
    ONECLK.left--;
    var e=document.getElementById("oneClock");
    if(!e){ oneClockStop(); return; }
    if(ONECLK.left<=0){
      ONECLK.over=true; oneClockStop(); tone("blockend"); renderOnesee(); return;
    }
    e.textContent=oneClockText();
  },1000);
  var e=document.getElementById("oneClock"); if(e) e.textContent=oneClockText();
}

function renderOnesee(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("onesee");
  ONE.min=p.min;
  if(!DATA.situ){
    box.innerHTML=dataWait("상황 카드를","situ");
    if(!dataFailed("situ")) loadData("situ","ENG2P_SITU",function(){ renderOnesee(); });
    return;
  }
  var d=DATA.situ, pool=onePool(), deck=oneDeck();

  /* 아직 안 나온 것과 다 접은 것을 **다르게 적는다.**
     앞엣것은 기다리면 오고 뒤엣것은 안 온다. 같은 말로 적으면 두 사람이 기다린다. */
  if(!pool.length){
    box.innerHTML='<div class="card">'+playHead(p,0)+
      '<div class="note w" style="margin-top:10px"><b>아직 이 판은 안 연다.</b> '+
      '역할형 카드가 오늘까지 <b>한 장도</b> 안 나왔다. '+
      '<b>적어서가 아니라 아직 안 나와서다.</b> 강이 가면 나온다.</div>'+
      '<div class="note">그 사이에는 같은 화용 트랙의 다른 판을 돈다.</div>'+
      playGrade(d)+'</div>';
    return;
  }
  if(!deck.length){
    box.innerHTML='<div class="card">'+playHead(p,0)+
      '<div class="note w" style="margin-top:10px"><b>오늘까지 나온 '+pool.length+
      '장을 다 접었다.</b> 카드마다 다섯 요소를 다 알아냈다. '+
      '한 장을 <b>'+d.most+'번까지</b> 쓰는데 그것을 다 썼다.</div>'+
      '<div class="note">새 카드는 강이 가야 나온다. 그 사이에는 다른 판을 돈다.</div>'+
      playGrade(d)+'</div>';
    return;
  }

  var s=roundStep("onesee"), rec=oneRec();
  if(soloOn() && soloHanding()){
    box.innerHTML='<div class="card">'+soloCover([S.names.a,S.names.b])+'</div>';
    $("#soTake").onclick=function(){ soloTake(renderOnesee); };
    return;
  }

  var h='<div class="card">'+playHead(p,s);

  if(ONECLK.over){
    box.innerHTML=oneDone(d, rec, h+
      '<div class="note w" style="margin-top:10px"><b>'+ONE.min+'분이 됐다.</b> '+
      '쥔 쪽이 <b>나머지를 읽어 준다.</b> 못 맞힌 것을 듣는 것도 입력이다.</div>');
    $("#oneAgain").onclick=function(){
      /* **낸 요소는 안 지운다.** 그것은 날을 넘는 기록이다 (D1). */
      roundStepSet("onesee",0); turnForget("onesee");
      rec.asks=0; rec.list=[]; rec.deck=null; save();
      oneClockStop(); ONECLK.left=0; ONECLK.over=false; renderOnesee();
    };
    return;
  }

  /* **한 판이 한 장이다.** 규칙서의 끝 조건이 "둘을 알아내면 끝난다" 다.
     덱을 감아 돌면 이미 다 알아낸 카드가 다시 나오고 그 장은 낼 것이 없다.
     덱 끝에 닿으면 그날 낼 것을 다 낸 것이다. */
  if(s>=deck.length){
    box.innerHTML=oneDone(d, rec, h+
      '<div class="note g" style="margin-top:10px"><b>오늘 낼 것을 다 냈다.</b> '+
      deck.length+'장을 돌았다.</div>');
    $("#oneAgain").onclick=function(){
      roundStepSet("onesee",0); turnForget("onesee");
      rec.asks=0; rec.list=[]; rec.deck=null; save();
      oneClockStop(); ONECLK.left=0; ONECLK.over=false; renderOnesee();
    };
    return;
  }

  var it=deck[s], first=roundFirst(s, 1);
  if(first===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '상황이 한쪽 화면에만 있어야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고르거나, 기기가 하나면 규칙 탭에서 '+
       '<b>돌려 보기</b>를 켠다.</div></div>';
    box.innerHTML=h; return;
  }

  var ask=oneAsk(it), left=oneLeft(it), round=d.parts.length-left.length;
  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?ONE.seats[0]:ONE.seats[1])+'</b>'+
     (soloOn()?' <span class="small mut">(돌려 보기)</span>':'')+'</span>'+
     '<span class="small mut">'+(s+1)+'장째 · '+esc(it.id)+'</span></div>';

  /* 알아낼 것. **이름은 두 화면에 다 있고 값은 한 화면에만 있다.**

     이름을 조사로 잇지 않는다. 와 과가 받침을 타고 요소 이름은 문서에서 온다.
     문서가 이름을 바꾸면 조사가 틀린다. **쌍점을 쓰면 그 자리가 없다** (T265). */
  h+='<div class="note" style="margin-top:10px">이 장에서 알아낼 것 '+ask.length+
     '개: <b>'+ask.map(function(x){ return esc(x.name); }).join("</b>, <b>")+'</b>'+
     (round?'. 이 카드에서 <b>'+round+'개</b>는 지난 판에 알아냈다. 다시 안 낸다':'')+
     '</div>';

  if(first){
    h+='<div class="sitbox">';
    d.parts.forEach(function(x){
      var on=ask.filter(function(y){ return y.key===x.key; }).length;
      h+='<div class="sitrow'+(on?" on":"")+'"><b>'+esc(x.name)+'</b><span>'+
         esc(it.parts[x.key])+'</span></div>';
    });
    h+='</div>';
    h+='<div class="note" style="margin-top:10px"><b>쥔 쪽이 할 일</b><br>'+
       esc(it.ins)+'</div>';
    h+='<div class="note"><b>판정</b> '+esc(it.pass)+'</div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>이 표를 읽어 주지 않는다.</b> 그 상황인 것처럼 말한다. '+
       '상대가 물으면 그 말 안에서 답한다.</div>';
  }else{
    h+='<div class="vpane"><div class="vhid" aria-hidden="true"><span>'+
       '상황은 쥔 쪽 화면에만 있다</span></div></div>';
    h+='<div class="note" style="margin-top:10px"><b>알아내는 쪽이 할 일</b><br>'+
       '묻는다. 위의 <b>'+ask.length+'개</b>가 무엇인지 알아내면 된다. '+
       '나머지는 안 알아내도 된다.</div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>이름만 있고 값은 없다.</b> 값이 여기 있으면 알아낼 것이 없다.</div>';
  }

  h+='<div class="chnbig"><b>'+rec.asks+'</b> 번 물었다</div>';

  if(first){
    h+='<div class="row" style="margin-top:8px">'+
       '<button class="b" id="oneAsked">물었다 (+1)</button>'+
       '<button class="g" id="oneHit">'+ask.length+'개를 다 알아냈다</button>'+
       '<button class="g" id="oneGive">못 닿았다. 읽어 준다</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>판정은 쥔 사람이 한다.</b> 무엇이 답인지 그쪽만 안다. '+
       '<b>못 닿아도 벌이 아니다.</b> 나머지를 읽어 주는 것으로 끝낸다.</div>';
  }else{
    h+='<div class="row" style="margin-top:8px">'+
       '<button class="g" id="oneNext">다음 장</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>이 자리에는 판정할 것이 없다.</b> 닿았는지는 쥔 사람이 정한다. '+
       '그쪽이 넘겼다고 하면 이 단추를 누른다.</div>';
  }

  h+='<div id="oneTurn"></div>';
  if(soloOn())
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="oneHand">건넨다</button></div>';
  h+='<div class="row" style="margin-top:10px">'+
     '<button class="g" id="oneGo">'+ONE.min+'분 시계 <span class="mono" id="oneClock">'+
     oneClockText()+'</span></button></div>'+playGrade(d)+'</div>';
  box.innerHTML=h;

  $("#oneGo").onclick=function(){ oneClockGo(ONE.min); };
  if($("#oneHand")) $("#oneHand").onclick=function(){ soloHandOff(renderOnesee); };
  if($("#oneAsked")) $("#oneAsked").onclick=function(){
    rec.asks++; save(); tone("next"); renderOnesee();
  };
  /* 낸 요소를 뺀다. **닿았든 못 닿았든 뺀다.** 읽어 준 것도 낸 것이다.
     안 빼면 같은 것을 또 낸다.

     그리고 **세 단추가 다 이것을 한다.** 알아내는 쪽도 뺀다.
     이 기록은 날을 넘고 두 기기가 각자 갖는다. 한쪽만 빼면 내일
     두 화면이 서로 다른 요소를 알아내라고 적는다. 3초 벽의 미룬 목록과 같다. */
  function advance(){
    var seen=oneSeen(it.id);
    ask.forEach(function(x){ if(seen.indexOf(x.key)<0) seen.push(x.key); });
    rec.asks=0; save();
    var n=s+1;
    roundStepSet("onesee", n); renderOnesee();
    if(turnCheck("onesee", n, 1)) turnAlert(n, 1, ONE.seats, "oneTurn");
  }
  if($("#oneHit")) $("#oneHit").onclick=function(){
    rec.list.push(rec.asks); tone("done"); advance();
  };
  if($("#oneGive")) $("#oneGive").onclick=function(){
    rec.list.push(null); advance();
  };
  /* 알아내는 쪽은 셈을 안 적는다. **요소만 뺀다.** */
  if($("#oneNext")) $("#oneNext").onclick=function(){ advance(); };
}
PLAYREND.onesee=renderOnesee;
