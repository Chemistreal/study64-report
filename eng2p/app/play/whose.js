/* =========================================================================
   누구 말이야 (T295). `docs/play_rules.md` 7.3

     쓰는 것    쓸 자리 105개. `out/data/whose.js` (T294). **B등급**
     시작 조건  세 격식 한 벌이 화면에 있다
     역할       자리를 고르는 쪽과 고른 것을 판정하는 쪽. **한 벌마다 바뀐다**
     도는 차례  앱이 쓸 자리를 준다. 고르는 쪽이 셋 중 하나를 고른다. 판정하는 쪽이 본다
     판정       **판정하는 사람. 앱은 정답을 안 준다**
     끝         다섯 벌을 돌면 끝난다
     못 했을 때 둘의 생각이 갈리면 **갈렸다고 적고 넘어간다.** 그 자리가 주 점검에 간다
     기록할 값  다섯 중 둘의 생각이 같았던 벌이 몇인가

   ## 정답이 자료에 없다

   `whose.js` 에는 register 가 없다 (T294). 담고 안 그리는 것이 아니라 안 담았다.
   **그래서 이 화면에는 답을 맞히는 코드가 없다.** 견줄 것이 없다.

   앱이 하는 것은 자리를 내는 것과 둘이 같았는지를 적는 것뿐이다.
   맞았는지는 아무도 모른다. **격식은 답이 하나가 아니다.**

   ## 갈린 것이 이 판의 산출물이다

   못 했을 때 칸이 "갈렸다고 적고 넘어간다" 다. 갈린 것을 고치지 않는다.
   그 자리를 적어 두고 **주 이레째 점검으로 보낸다.** 거기서 둘이 다시 본다.

   그래서 이 판만 `S.wsplit` 에 남긴다. 그날 셈이 아니라 그 주의 것이다.

   ## 셈이 절반이 아니다

   기록할 값이 "둘의 생각이 **같았던** 벌" 이다. 한 사람의 셈이 아니라 둘의 셈이다.
   그래서 두 기기에 같은 수가 남는다. 이어달리기와 같다 (T271).
   판정은 판정하는 쪽이 말하고 **고르는 쪽은 그 말을 자기 기기에도 적는다.**
   안 적으면 주 점검에 갈 자리가 한 기기에만 남는다.
   ========================================================================= */
var WHO={seats:["자리를 고르는 쪽","고른 것을 판정하는 쪽"]};

function whoToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl || null;
}
/* 그날 강까지 나온 것만. **안 배운 카드를 앞당겨 쓰지 않는다.** */
function whoPool(){
  var d=DATA.whose, pl=whoToday();
  if(!d || !d.sets || !pl || !pl.cards || !pl.quarter) return [];
  return d.sets.filter(function(c){
    return c.q < pl.quarter || (c.q === pl.quarter && c.no <= pl.cards.to);
  });
}
function whoRec(){ return playRec("whose", {same:0, split:0, pick:null}); }

/* 이 판에 낼 벌.

   **얼리지 않는다.** 3초 벽(T283)과 한 사람만 본다(T289)는 덱을 `rec` 에 적어 뒀다.
   그 둘은 판을 도는 동안 카드가 덱에서 빠진다. 미루면 앞으로 오고
   요소를 다 내면 사라진다. 그래서 그리는 자리에서 다시 세면 자리가 밀렸다.

   이 판은 빠지는 것이 없다. 벌을 돌아도 못에서 아무것도 안 준다.
   `roundPick` 이 같은 날에 같은 것을 내므로 몇 번을 다시 세도 같다.

   T296 에 얼리는 자리를 넣어 뒀다가 뺐다. **깨 봐도 안 깨졌다.**
   깨지지 않는 것을 지키는 코드는 지키는 일을 안 하고 지키는 것처럼 보이기만 한다. */
function whoDeck(){
  var d=DATA.whose, pool=whoPool();
  if(!d || !pool.length) return [];
  var out=roundPick("whose", pool, d.rounds);
  return out;
}
/* 갈린 자리. **그 주의 것이다.** 주 이레째 점검이 이것을 읽는다. */
function whoSplit(w){
  if(!S.wsplit) S.wsplit={};
  if(!S.wsplit[w]) S.wsplit[w]=[];
  return S.wsplit[w];
}

var WHOCLK={t:null, left:0, over:false};
function whoClockStop(){ if(WHOCLK.t){ clearInterval(WHOCLK.t); WHOCLK.t=null; } }
function whoClockText(){
  if(WHOCLK.over) return "0:00";
  var s=WHOCLK.left>0?WHOCLK.left:WHO.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function whoClockGo(min){
  if(WHOCLK.t){ whoClockStop(); return; }
  if(WHOCLK.left<=0){ WHOCLK.left=min*60; WHOCLK.over=false; }
  tone("start");
  WHOCLK.t=setInterval(function(){
    WHOCLK.left--;
    var e=document.getElementById("whoClock");
    if(!e){ whoClockStop(); return; }
    if(WHOCLK.left<=0){
      WHOCLK.over=true; whoClockStop(); tone("blockend"); renderWhose(); return;
    }
    e.textContent=whoClockText();
  },1000);
  var e=document.getElementById("whoClock"); if(e) e.textContent=whoClockText();
}

function whoDone(d, rec, head){
  var h=head;
  h+='<div class="note">둘의 생각이 같았던 벌이 <b>'+rec.same+'</b>이고 '+
     '갈린 벌이 <b>'+rec.split+'</b>이다.</div>';
  /* **절반이 아니다.** 둘의 생각이 같았는가는 한 사람의 값이 아니다 (T271 과 같다). */
  h+='<div class="note w">두 기기에 <b>같은 수</b>가 있어야 한다. 소리 내어 견준다. '+
     '<b>이 판은 절반이 아니다.</b> 둘의 생각이 같았는가는 한 사람의 값이 아니다.</div>';
  h+='<div class="note"><b>갈린 것은 틀린 것이 아니다.</b> 물어볼 것이다. '+
     '그 자리가 <b>주 이레째 점검</b>으로 간다. 거기서 다시 본다.</div>';
  return h+playGrade(d)+
    '<div class="row" style="margin-top:10px">'+
    '<button class="g" id="whoAgain">처음부터</button></div></div>';
}

function renderWhose(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("whose");
  WHO.min=p.min;
  if(!DATA.whose){
    box.innerHTML=dataWait("쓸 자리를","whose");
    if(!dataFailed("whose")) loadData("whose","ENG2P_WHOSE",function(){ renderWhose(); });
    return;
  }
  var d=DATA.whose, pool=whoPool();
  if(pool.length<d.rounds){
    box.innerHTML='<div class="card">'+playHead(p,0)+
      '<div class="note w" style="margin-top:10px"><b>아직 이 판은 안 연다.</b> '+
      '오늘까지 나온 쓸 자리가 <b>'+pool.length+'개</b>이고 이 판은 <b>'+d.rounds+
      '벌</b>을 돈다. 안 배운 카드를 앞당겨 쓰지 않는다.</div>'+
      '<div class="note">그 사이에는 같은 화용 트랙의 다른 판을 돈다.</div>'+
      playGrade(d)+'</div>';
    return;
  }

  var deck=whoDeck(), s=roundStep("whose"), rec=whoRec();
  var h='<div class="card">'+playHead(p,s);

  if(WHOCLK.over){
    box.innerHTML=whoDone(d, rec, h+
      '<div class="note w" style="margin-top:10px"><b>'+WHO.min+'분이 됐다. 끝났다.</b> '+
      '남은 벌은 안 돈다.</div>');
    $("#whoAgain").onclick=function(){ whoReset(rec); };
    return;
  }
  if(s>=deck.length){
    box.innerHTML=whoDone(d, rec, h+
      '<div class="note g" style="margin-top:10px"><b>'+deck.length+
      '벌을 다 돌았다.</b></div>');
    $("#whoAgain").onclick=function(){ whoReset(rec); };
    return;
  }

  var it=deck[s], first=roundFirst(s, 1);
  if(first===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '누가 먼저 고르는지를 정해야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고른다.</div></div>';
    box.innerHTML=h; return;
  }

  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?WHO.seats[0]:WHO.seats[1])+'</b></span>'+
     '<span class="small mut">'+(s+1)+' / '+deck.length+'벌 · '+esc(it.id)+'</span></div>';

  /* 쓸 자리. **둘 다 본다.** 감출 것이 없다. 정답이 없기 때문이다. */
  h+='<div class="whobox"><div class="whowhere">'+esc(it.where)+'</div>'+
     /* 조사를 안 붙인다. 관계 이름이 카드에서 오고 받침이 있는 것과
        없는 것이 섞여 있다 (동료 / 상사와 권위). **쌍점을 쓴다** (T265). */
     '<div class="small mut">상대: <b>'+esc(it.who)+'</b></div></div>';

  h+='<div class="note" style="margin-top:10px">'+
     (first ? '<b>먼저 고른다.</b> 이 자리에서 쓸 격식을 셋 중 하나 고르고 소리 내어 말한다.'
            : '<b>듣고 고른다.</b> 상대가 말한 뒤에 자기 것을 고르고 견준다.')+
     '</div>';

  h+='<div class="row" style="margin-top:8px">';
  d.regs.forEach(function(r){
    h+='<button class="g whopick'+(rec.pick===r?" on":"")+'" data-who="'+esc(r)+'">'+
       esc(r)+'</button>';
  });
  h+='</div>';
  h+='<div class="small mut" style="margin-top:6px">'+
     '<b>앱은 정답을 안 준다.</b> 이 자리에 무엇이 맞는지는 자료에 없다. '+
     '<b>격식은 답이 하나가 아니다.</b></div>';

  if(rec.pick){
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="b" id="whoSame">둘이 같았다</button>'+
       '<button class="g" id="whoSplit">갈렸다</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       (first
         ? '<b>판정은 상대가 한다.</b> 그쪽이 말한 것을 이 기기에도 적는다. '+
           '안 적으면 주 점검에 갈 자리가 한 기기에만 남는다.'
         : '<b>판정은 이 자리다.</b> 같았는지 갈렸는지를 소리 내어 말한다.')+
       '</div>';
  }else{
    h+='<div class="note" style="margin-top:10px">셋 중 하나를 고르면 '+
       '<b>같았다</b>와 <b>갈렸다</b>가 뜬다.</div>';
  }

  h+='<div class="small mut" style="margin-top:8px">같았던 벌 <b>'+rec.same+
     '</b> · 갈린 벌 <b>'+rec.split+'</b></div>';
  h+='<div id="whoTurn"></div>';
  h+='<div class="row" style="margin-top:10px">'+
     '<button class="g" id="whoGo">'+WHO.min+'분 시계 <span class="mono" id="whoClock">'+
     whoClockText()+'</span></button></div>'+playGrade(d)+'</div>';
  box.innerHTML=h;

  $("#whoGo").onclick=function(){ whoClockGo(WHO.min); };
  box.querySelectorAll("[data-who]").forEach(function(b){
    b.onclick=function(){ rec.pick=b.dataset.who; save(); renderWhose(); };
  });

  function step(){
    rec.pick=null; save();
    var n=s+1;
    roundStepSet("whose", n); renderWhose();
    if(turnCheck("whose", n, 1)) turnAlert(n, 1, WHO.seats, "whoTurn");
  }
  if($("#whoSame")) $("#whoSame").onclick=function(){
    rec.same++; tone("done"); step();
  };
  if($("#whoSplit")) $("#whoSplit").onclick=function(){
    rec.split++;
    /* **갈린 자리를 그 주에 남긴다.** 그날 셈이 아니다. 주 점검이 읽는다. */
    var pl=whoToday(), w=(pl&&pl.week)||1, list=whoSplit(w);
    if(!list.filter(function(x){ return x.id===it.id; }).length)
      list.push({id:it.id, where:it.where, who:it.who, day:today()});
    tone("next"); step();
  };
}
function whoReset(rec){
  roundStepSet("whose",0); turnForget("whose");
  rec.same=0; rec.split=0; rec.pick=null; save();
  whoClockStop(); WHOCLK.left=0; WHOCLK.over=false; renderWhose();
}
PLAYREND.whose=renderWhose;
