/* =========================================================================
   되받아치기 (T285). `docs/play_rules.md` 6.3

     쓰는 것    오늘 과의 청크 목록. `out/data/chunks.js` (T270). **B등급**
     시작 조건  청크 회차를 마쳤다
     역할       던지는 쪽과 받는 쪽. **한 번 쉼이 생길 때마다 바뀐다**
     도는 차례  앞 사람 말끝을 받아 바로 잇는다. **쉼이 없어야 한다**
     판정       **받은 사람이 아니라 던진 사람.** 쉼을 던진 쪽이 듣는다
     끝         4분이 되면 끝난다. 몇 번 주고받았는지를 같이 센다
     못 했을 때 쉼이 생기면 그 자리에서 끊고 역할을 바꿔 다시 시작한다
     기록할 값  한 번에 제일 많이 주고받은 수. **공동 값 하나**

   ## 이어달리기와 자료가 같고 재는 것이 다르다

   둘 다 오늘 과의 청크를 쓰고 둘 다 연속을 센다. 그런데 다르다.

     이어달리기   말이 **되는가**. 둘이 같이 판정한다. 접힐 때 자리가 돈다
     되받아치기   **쉼이 없는가**. 던진 쪽이 판정한다. 쉼에 자리가 돈다

   규칙서가 이유를 적어 뒀다. **자기 말이 끝난 뒤의 쉼은 자기가 제일 잘 듣는다.**
   받는 쪽은 생각하느라 그 쉼을 못 느낀다.
   그래서 이 판은 **단추가 한쪽에만** 있다. 이어달리기는 둘 다 누른다.

   ## 말끝은 낱말이 아니라 쉼이다

   계획표가 이 턴을 "말끝 잇기 자료" 라고 적어 뒀다.
   앞 청크의 마지막 낱말로 시작하는 청크를 이어 주는 표를 뜻하는 말이었다.

   **그 표를 만들면 이 판이 죽는다.** 화면이 이을 것을 보여 주면
   두 사람은 그것을 찾아 읽고, 그러면 재는 것이 쉼이 아니라 눈이 된다.
   규칙서 6.3 어디에도 낱말이 맞아야 한다는 줄이 없다. 재는 것은 쉼이다.

   ## 셈을 합치는 법이 판마다 다르다

     절반이다     `playHalf`. 판정하는 자리가 판 안에서 돌아 한 기기에 절반만 남는다
     같은 수다    이어달리기. 둘이 같이 판정하므로 두 기기에 같은 수가 남는다
     **큰 것이다** 이 판. 각자 자기가 던진 동안의 제일 긴 연속을 들고 있다

   셋째가 여기서 처음 나온다. 더하면 안 된다. 한 번에 제일 많이 주고받은 수이지
   두 사람이 주고받은 것을 다 더한 수가 아니다.
   ========================================================================= */
var RBD={seats:["던지는 쪽","받는 쪽"]};

function rbdToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
/* 오늘 과의 청크. **이어달리기와 같은 자료를 그대로 쓴다.** 두 번 안 만든다.
   차례만 이 판의 씨앗으로 섞는다. 같은 차례로 두면 두 판이 같아 보인다. */
function rbdPool(){
  var d=DATA.chunks, mid=rbdToday();
  if(!d || !d.items || !mid) return null;
  var rows=d.items[mid]||[];
  if(!rows.length) return null;
  var ord=roundOrder(rows.length, roundSeed("rebound",0)), out=[];
  for(var i=0;i<rows.length;i++) out.push(rows[ord[i]]);
  return out;
}
/* 그날 셈. `run` 은 지금 이어지고 있는 수이고 `best` 는 이 기기가 던진 동안의 제일 긴 것이다.
   `stops` 는 쉼이 몇 번 났나. **셈이 아니라 자리 세기다.** */
function rbdRec(){ return playRec("rebound", {best:0, run:0, stops:0}); }

var RBDCLK={t:null, left:0, over:false};
function rbdClockStop(){ if(RBDCLK.t){ clearInterval(RBDCLK.t); RBDCLK.t=null; } }
function rbdClockText(){
  if(RBDCLK.over) return "0:00";
  var s=RBDCLK.left>0?RBDCLK.left:RBD.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function rbdClockGo(min){
  if(RBDCLK.t){ rbdClockStop(); return; }
  if(RBDCLK.left<=0){ RBDCLK.left=min*60; RBDCLK.over=false; }
  tone("start");
  RBDCLK.t=setInterval(function(){
    RBDCLK.left--;
    var e=document.getElementById("rbdClock");
    if(!e){ rbdClockStop(); return; }
    if(RBDCLK.left<=0){
      RBDCLK.over=true; rbdClockStop(); tone("blockend"); renderRebound(); return;
    }
    e.textContent=rbdClockText();
  },1000);
  var e=document.getElementById("rbdClock"); if(e) e.textContent=rbdClockText();
}

function renderRebound(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("rebound");
  RBD.min=p.min;
  if(!DATA.chunks){
    box.innerHTML='<div class="card tight small mut">청크 목록을 여는 중이다.</div>';
    loadData("chunks","ENG2P_CHUNKS",function(){ renderRebound(); });
    return;
  }
  var mid=rbdToday(), pool=rbdPool();
  if(!mid || !pool){
    box.innerHTML='<div class="card"><div class="note w">오늘 과의 청크가 없다. '+
      '<b>scripts/derive_chunks.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    return;
  }
  var s=roundStep("rebound"), rec=rbdRec();
  var h='<div class="card">'+playHead(p,s);

  if(RBDCLK.over){
    h+='<div class="note w" style="margin-top:10px"><b>'+RBD.min+'분이 됐다. 끝났다.</b> '+
       '이 기기가 던진 동안 제일 길게 간 것이 <b>'+
       Math.max(rec.best,rec.run)+'번</b>이다.</div>';
    h+='<div class="note">쉼이 난 것은 '+rec.stops+'번이다. '+
       '<b>누가 쉬었는지는 안 센다.</b> 쉼은 실패가 아니라 자리를 바꾸는 신호다.</div>';
    /* **더하지 않는다.** 규칙서가 남기라는 값은 "한 번에 제일 많이" 다.
       두 기기 수를 더하면 두 사람이 주고받은 것을 다 더한 수가 되고
       그것은 이 판이 재는 것이 아니다. */
    h+='<div class="note w">규칙서가 남기라는 값은 <b>한 번에 제일 많이 주고받은 수</b> '+
       '하나다. 각자 자기가 던진 동안의 것을 들고 있으니 '+
       '<b>두 기기 중 큰 것</b>이 그 판의 값이다. 더하지 않는다.</div>';
    h+=playGrade(DATA.chunks);
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="rbdAgain">처음부터</button></div></div>';
    box.innerHTML=h;
    $("#rbdAgain").onclick=function(){
      roundStepSet("rebound",0); turnForget("rebound");
      rec.best=0; rec.run=0; rec.stops=0; save();
      rbdClockStop(); RBDCLK.left=0; RBDCLK.over=false; renderRebound();
    };
    return;
  }

  /* 자리. **쉼이 날 때마다 바뀐다.** 몇 번인지 미리 모르므로 `roundStep` 을
     회가 아니라 쉼 횟수로 쓴다. 이어달리기가 접은 횟수로 쓴 것과 같다 (T271). */
  var first=roundFirst(s, 1);
  if(first===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '판정이 던진 쪽에 있어야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고른다.</div></div>';
    box.innerHTML=h; return;
  }

  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?RBD.seats[0]:RBD.seats[1])+'</b></span>'+
     '<span class="small mut">쉼 '+rec.stops+'번 · '+esc(mid)+'</span></div>';

  /* **세는 자리에만 큰 수를 둔다.** 받는 쪽에 0을 크게 띄우면 둘이 주고받는
     동안 화면이 0이라고 말한다. 안 세는 것과 0인 것은 다르다. */
  if(first)
    h+='<div class="chnbig"><b>'+rec.run+'</b> 번 주고받았다</div>'+
       '<div class="small mut">이 기기가 던진 동안 제일 길게 간 것 '+
       Math.max(rec.best,rec.run)+'번</div>';
  else
    h+='<div class="small mut" style="margin-top:10px">지금은 <b>던진 쪽 화면이 센다.</b> '+
       '이 기기가 던진 동안의 제일 긴 것은 '+rec.best+'번이다.</div>';

  h+='<div class="note" style="margin-top:10px">앞 사람 말끝을 받아 <b>바로</b> 잇는다. '+
     '<b>쉼이 없어야 한다.</b> 무슨 말인지보다 언제 들어오는지를 잰다. '+
     '낱말이 맞물릴 것은 없다.</div>';

  if(first){
    h+='<div class="row" style="margin-top:8px">'+
       '<button class="b" id="rbdOn">주고받았다 (+1)</button>'+
       '<button class="g" id="rbdStop">쉼이 생겼다</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>판정은 던진 사람이 한다.</b> 자기 말이 끝난 뒤의 쉼은 자기가 제일 잘 듣는다. '+
       '받는 쪽은 생각하느라 그 쉼을 못 느낀다. <b>쉼이 나면 자리가 바뀐다.</b></div>';
  }else{
    /* **누를 것이 하나뿐이다.** 판정은 안 하고 자리만 같이 민다.
       회는 기기마다 자기가 센다 (round.md 6장). 안 밀면 판 표시가 갈린다. */
    h+='<div class="row" style="margin-top:8px">'+
       '<button class="g" id="rbdSaid">쉼이 났다고 한다</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>이 자리에는 판정할 것이 없다.</b> 쉼은 던진 쪽이 듣는다. '+
       '그쪽이 쉼이라고 하면 이 단추를 누른다. 안 누르면 두 기기의 자리가 갈린다.</div>';
  }

  h+='<div class="chnpool"><div class="small mut">오늘 과의 청크. '+
     '<b>이 중에 없는 말을 해도 된다.</b> 막힐 때 여기서 집는다.</div>';
  pool.slice(0,12).forEach(function(c){
    h+='<span class="chnk">'+esc(c.c)+'</span>';
  });
  h+='</div>';

  h+='<div id="rbdTurn"></div>';
  h+='<div class="row" style="margin-top:10px">'+
     '<button class="g" id="rbdGo">'+RBD.min+'분 시계 <span class="mono" id="rbdClock">'+
     rbdClockText()+'</span></button></div>'+playGrade(DATA.chunks)+'</div>';
  box.innerHTML=h;

  $("#rbdGo").onclick=function(){ rbdClockGo(RBD.min); };
  if($("#rbdOn")) $("#rbdOn").onclick=function(){
    rec.run++;
    if(rec.run>rec.best) rec.best=rec.run;
    save(); tone("next"); renderRebound();
  };
  function stopHere(mine){
    if(mine && rec.run>rec.best) rec.best=rec.run;
    if(mine) rec.stops++;
    rec.run=0; save();
    var n=s+1;
    roundStepSet("rebound", n); renderRebound();
    if(turnCheck("rebound", n, 1)) turnAlert(n, 1, RBD.seats, "rbdTurn");
  }
  if($("#rbdStop")) $("#rbdStop").onclick=function(){ stopHere(true); };
  /* 받는 쪽은 자기 연속이 아니므로 `best` 도 `stops` 도 안 건드린다. */
  if($("#rbdSaid")) $("#rbdSaid").onclick=function(){ stopHere(false); };
}
PLAYREND.rebound=renderRebound;
