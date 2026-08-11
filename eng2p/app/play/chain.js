/* =========================================================================
   이어달리기 (T271). `docs/play_rules.md` 4.1

     쓰는 것    오늘 과의 청크 목록. `out/data/chunks.js` (T270). **B등급**
     시작 조건  청크 회차를 마쳤다
     역할       던지는 쪽과 붙이는 쪽. **한 번 접힐 때마다 바뀐다 (R34)**
     도는 차례  던지는 쪽이 청크 하나로 시작한다. 번갈아 붙여 문장을 늘린다
     판정       **둘이 같이.** 말이 되면 잇고 안 되면 접는다
     끝         5분이 되면 끝난다. **몇 마디까지 갔는지를 같이 센다**
     못 했을 때 끊기면 접고 다시 시작한다. **누가 끊었는지는 안 센다 (R32)**
     기록할 값  그 판에서 제일 길게 간 마디 수. **공동 값 하나 (R33)**

   **앞의 넷과 다르다. 이 판은 가릴 것이 없다.**
   `docs/solo_plays.md` 가 "그대로. 가릴 것이 없다. 말로만 돈다" 고 적었다.
   두 화면이 같은 것을 보인다. 그것이 맞다.

   그래서 이 판에서 두 기기가 하는 일도 같다. 둘 다 누른다.
   **셈이 절반이 아니다.** 앞의 넷은 판정하는 자리가 돌아 한 기기에 절반만 남았는데
   여기는 둘이 같이 판정하므로 두 기기에 같은 수가 남는다.
   같은 수가 남는다는 것은 **어긋나면 보인다**는 뜻이기도 하다.

   그리고 이 판만 **자리가 회로 안 돈다.** 접힐 때마다 돈다.
   접히는 것은 사람이 정하는 일이라 미리 몇 번인지 모른다.
   `roundStep` 을 회가 아니라 **접은 횟수**로 쓴다.
   ========================================================================= */
var CHN={n:0, seats:["던지는 쪽","붙이는 쪽"]};

function chnToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
function chnPool(){
  var d=DATA.chunks, mid=chnToday();
  if(!d || !d.items || !mid) return null;
  var rows=d.items[mid]||[];
  if(!rows.length) return null;
  var ord=roundOrder(rows.length, roundSeed("chain",0)), out=[];
  for(var i=0;i<rows.length;i++) out.push(rows[ord[i]]);
  return out;
}
/* 그날 셈. **제일 길게 간 마디 수 하나다.** 접은 횟수는 셈이 아니라 자리 세기다. */
function chnRec(){ return playRec("chain", {best:0, folds:0}); }

/* 지금 누가 말할 차례인가. 접은 횟수가 시작을 정하고 마디마다 번갈아 간다.
   **판 안에서 도는 것과 접힐 때 도는 것이 겹친다.** 둘을 더해 홀짝을 본다. */
function chnWho(folds, marks){
  var f=roundFirst(folds+marks, 1);
  return f===null ? null : (f ? CHN.seats[0] : CHN.seats[1]);
}

var CHNCLK={t:null, left:0, over:false};
function chnClockStop(){ if(CHNCLK.t){ clearInterval(CHNCLK.t); CHNCLK.t=null; } }
function chnClockText(){
  if(CHNCLK.over) return "0:00";
  var s=CHNCLK.left>0?CHNCLK.left:CHN.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function chnClockGo(min){
  if(CHNCLK.t){ chnClockStop(); return; }
  if(CHNCLK.left<=0){ CHNCLK.left=min*60; CHNCLK.over=false; }
  tone("start");
  CHNCLK.t=setInterval(function(){
    CHNCLK.left--;
    var e=document.getElementById("chnClock");
    if(!e){ chnClockStop(); return; }
    if(CHNCLK.left<=0){
      CHNCLK.over=true; chnClockStop(); tone("blockend"); renderChain(); return;
    }
    e.textContent=chnClockText();
  },1000);
  var e=document.getElementById("chnClock"); if(e) e.textContent=chnClockText();
}

function renderChain(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("chain");
  CHN.min=p.min;
  if(!DATA.chunks){
    box.innerHTML=dataWait("청크 목록을","chunks");
    if(!dataFailed("chunks")) loadData("chunks","ENG2P_CHUNKS",function(){ renderChain(); });
    return;
  }
  var mid=chnToday(), pool=chnPool();
  if(!mid || !pool){
    box.innerHTML='<div class="card"><div class="note w">오늘 과의 청크가 없다. '+
      '<b>scripts/derive_chunks.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    return;
  }
  var folds=roundStep("chain"), rec=chnRec(), marks=CHN.n;
  var h='<div class="card">'+playHead(p,folds);
  if(CHNCLK.over){
    h+='<div class="note w" style="margin-top:10px"><b>5분이 됐다. 끝났다.</b> '+
       '제일 길게 간 것이 <b>'+Math.max(rec.best,marks)+'마디</b>다. '+
       '규칙서가 남기라는 값이 그것이다.</div>';
    h+='<div class="note">접은 횟수는 '+rec.folds+'이다. '+
       '<b>누가 끊었는지는 안 센다.</b> 접는 것은 실패가 아니라 경계 표시다.</div>';
    /* **이 판은 절반이 아니다.** 둘이 같이 판정하므로 두 기기에 같은 수가 남는다.
       그래서 `playHalf` 를 안 쓴다. 대신 두 수를 견주라고 적는다. */
    h+='<div class="note">두 기기에 <b>같은 수</b>가 있어야 한다. '+
       '소리 내어 견준다. 다르면 세다가 어긋난 것이다.</div>';
    h+=playGrade(DATA.chunks);
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="chnAgain">처음부터</button></div></div>';
    box.innerHTML=h;
    $("#chnAgain").onclick=function(){
      roundStepSet("chain",0); turnForget("chain");
      rec.best=0; rec.folds=0; save();
      CHN.n=0; chnClockStop(); CHNCLK.left=0; CHNCLK.over=false; renderChain();
    };
    return;
  }

  var who=chnWho(folds, marks);
  /* **가릴 것이 없는 판이라 기기 쪽을 안 골라도 돈다.**
     다만 누구 차례인지는 못 말한다. 그것만 적고 판은 돌린다. */
  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>지금 <b>'+esc(who||"둘이 정한다")+'</b></span>'+
     '<span class="small mut">접은 횟수 '+folds+' · '+esc(mid)+'</span></div>';
  if(who===null)
    h+='<div class="note" style="margin-top:8px">기기 쪽을 안 골라 '+
       '<b>누구 차례인지는 못 말한다.</b> 이 판은 가릴 것이 없어서 그대로 돈다. '+
       '대장 탭에서 쪽을 고르면 차례가 뜬다.</div>';

  h+='<div class="chnbig"><b>'+marks+'</b> 마디</div>'+
     '<div class="small mut">제일 길게 간 것 '+Math.max(rec.best,marks)+'마디</div>';

  h+='<div class="note" style="margin-top:10px">청크 하나로 시작해 '+
     '<b>번갈아 붙여 문장을 늘린다.</b> 말로만 한다. 적지 않는다. '+
     '말이 되면 잇고 안 되면 접는다. <b>둘이 같이 정한다.</b></div>';
  h+='<div class="row" style="margin-top:8px">'+
     '<button class="b" id="chnAdd">이었다 (+1마디)</button>'+
     '<button class="g" id="chnFold">접는다</button></div>';
  h+='<div class="small mut" style="margin-top:6px">'+
     '<b>누가 끊었는지는 안 센다.</b> 접는 것은 실패가 아니라 배운 것의 경계 표시다. '+
     '접으면 자리가 바뀐다.</div>';

  h+='<div class="chnpool"><div class="small mut">오늘 과의 청크. '+
     '<b>배운 것 밖으로 나가면 접는다.</b></div>';
  pool.slice(0,12).forEach(function(c){
    h+='<span class="chnk">'+esc(c.c)+'</span>';
  });
  h+='</div>';
  h+='<div id="chnTurn"></div>';
  h+='<div class="row" style="margin-top:8px">'+
     '<button class="g" id="chnGo">5분 시계 <span class="mono" id="chnClock">'+
     chnClockText()+'</span></button></div>'+playGrade(DATA.chunks)+'</div>';
  box.innerHTML=h;

  $("#chnAdd").onclick=function(){
    CHN.n++;
    if(CHN.n>rec.best){ rec.best=CHN.n; save(); }
    tone("next"); renderChain();
  };
  $("#chnFold").onclick=function(){
    /* 접는다. **마디를 0으로 돌리고 자리를 바꾼다.** 누가 끊었는지는 안 받는다.
       받을 칸이 없는 것이 R32 를 지키는 방법이다. 물으면 그것이 곧 셈이 된다. */
    if(CHN.n>rec.best) rec.best=CHN.n;
    rec.folds++; save();
    CHN.n=0;
    var n=folds+1;
    roundStepSet("chain", n); renderChain();
    if(turnCheck("chain", n, 1)) turnAlert(n, 1, CHN.seats, "chnTurn");
  };
  $("#chnGo").onclick=function(){ chnClockGo(CHN.min); };
}
PLAYREND.chain=renderChain;
