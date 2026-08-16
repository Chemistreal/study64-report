/* =========================================================================
   못 알아들은 척 (T298). `docs/play_rules.md` 10.1

     쓰는 것    되묻기 강도 세 단. `out/data/reask.js` (T297). **B등급**
     시작 조건  오늘 과의 대본 줄 다섯이 뽑혀 있다
     역할       뭉개는 쪽과 되묻는 쪽. **한 줄마다 바뀐다**
     도는 차례  A가 한 줄을 일부러 뭉갠다. **B 화면에만 어느 강도로 되물으라고 뜬다**
     판정       **뭉갠 사람.** 어디를 뭉갰는지 자기가 안다
     끝         다섯 줄을 돌면 끝난다
     못 했을 때 되묻는 말이 안 나오면 **화면이 그 강도의 보기를 보여 준다.** 보고 말한다
     기록할 값  다섯 중 **보기 없이** 되물은 것이 몇인가

   ## 두 화면이 서로 다른 것을 감춘다

   앞의 열세 판은 한쪽이 더 보고 한쪽이 덜 봤다. 이 판은 다르다.

     뭉개는 쪽   대본 줄을 본다. **어느 강도인지는 모른다**
     되묻는 쪽   강도를 본다. **무슨 줄인지는 모른다**

   줄을 둘 다 보면 뭉갠 자리를 귀로 안 찾고 눈으로 찾는다.
   강도를 둘 다 보면 뭉개는 쪽이 그 강도에 맞춰 뭉갠다.
   **감출 것이 하나씩 양쪽에 있다.**

   ## 보기는 벌이 아니라 사다리다

   못 했을 때 칸이 "화면이 그 강도의 보기를 보여 준다. 보고 말한다" 다.
   보기를 보는 것이 실패가 아니다. **셈에서 빠질 뿐이다.**
   그 말을 화면이 적는다. 안 적으면 두 사람이 보기를 안 열고 넘어간다.

   ## 보기가 없는 단이 있다

   대본 52과에 **전체를 다시 말해 달라는 되묻기가 하나도 없다** (T297).
   그 단이 걸리면 화면이 "대본에 보기가 없다" 고 적는다.

   빈 자리를 안 채운다. 채우려면 지어내야 하고 그것이 1순위 규칙이 막는 일이다.
   **없다는 것 자체가 두 사람이 알 것이다.** 실제 말에서 제일 센 것은 드물다.
   ========================================================================= */
var RSK={seats:["뭉개는 쪽","되묻는 쪽"], n:5};

function rskToday(){
  var pl=(typeof plan==="function")?plan():null;
  return pl && pl.media ? pl.media : null;
}
/* 오늘 과의 줄 다섯. **대본에서 그대로 온다.** */
function rskLines(){
  var t=DATA.transcripts, mid=rskToday();
  if(!t || !t.items || !mid) return null;
  var ls=(t.items[mid]||[]).map(function(x){
    return String(x).replace(/^[A-Z][A-Za-z .'-]{0,20}:\s*/, "");
  }).filter(function(x){ return x.split(/\s+/).length>=4; });
  if(!ls.length) return null;
  var out=roundPick("reask", ls, RSK.n);
  return out;
}
/* 이 줄의 강도. **줄마다 다르고 두 기기가 같은 값을 낸다.** */
function rskStep(s){
  var d=DATA.reask;
  if(!d || !d.steps || !d.steps.length) return null;
  return d.steps[roundSeed("reask", s+1) % d.steps.length];
}
/* 그날 셈. `alone` 은 보기 없이 되물은 줄, `shown` 은 보기를 본 줄. */
function rskRec(){ return playRec("reask", {alone:0, shown:0, open:false}); }

var RSKCLK={t:null, left:0, over:false};
function rskClockStop(){ if(RSKCLK.t){ clearInterval(RSKCLK.t); RSKCLK.t=null; } }
function rskClockText(){
  if(RSKCLK.over) return "0:00";
  var s=RSKCLK.left>0?RSKCLK.left:RSK.min*60;
  return String(Math.floor(s/60))+":"+String(s%60).padStart(2,"0");
}
function rskClockGo(min){
  if(RSKCLK.t){ rskClockStop(); return; }
  if(RSKCLK.left<=0){ RSKCLK.left=min*60; RSKCLK.over=false; }
  tone("start");
  RSKCLK.t=setInterval(function(){
    RSKCLK.left--;
    var e=document.getElementById("rskClock");
    if(!e){ rskClockStop(); return; }
    if(RSKCLK.left<=0){
      RSKCLK.over=true; rskClockStop(); tone("blockend"); renderReask(); return;
    }
    e.textContent=rskClockText();
  },1000);
  var e=document.getElementById("rskClock"); if(e) e.textContent=rskClockText();
}

function rskDone(d, rec, head, n){
  var h=head;
  h+='<div class="note">보기 없이 되물은 것이 <b>'+rec.alone+'</b>줄이고 '+
     '보기를 보고 말한 것이 <b>'+rec.shown+'</b>줄이다.</div>';
  h+='<div class="note w">규칙서가 남기라는 값은 <b>보기 없이 되물은 줄</b>이다. '+
     '<b>보기를 본 것은 실패가 아니다.</b> 셈에서 빠질 뿐이다.</div>';
  h+=playHalf(n+"줄");
  return h+playGrade(d)+
    '<div class="row" style="margin-top:10px">'+
    '<button class="g" id="rskAgain">처음부터</button></div></div>';
}

function renderReask(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("reask");
  RSK.min=p.min;
  if(!DATA.reask){
    box.innerHTML=dataWait("되묻기 단을","reask");
    if(!dataFailed("reask")) loadData("reask","ENG2P_REASK",function(){ renderReask(); });
    return;
  }
  if(!DATA.transcripts){
    box.innerHTML=dataWait("대본을","transcripts");
    if(!dataFailed("transcripts")) loadData("transcripts","ENG2P_TRANSCRIPTS",function(){ renderReask(); });
    return;
  }
  var d=DATA.reask, lines=rskLines();
  if(!lines){
    box.innerHTML='<div class="card"><div class="note w">오늘 과의 대본이 없다. '+
      '<b>scripts/derive_transcripts.py</b> 를 돌려야 이 판이 돈다.</div></div>';
    return;
  }
  var s=roundStep("reask"), rec=rskRec();
  var h='<div class="card">'+playHead(p,s);

  if(RSKCLK.over){
    box.innerHTML=rskDone(d, rec, h+
      '<div class="note w" style="margin-top:10px"><b>'+RSK.min+'분이 됐다. 끝났다.</b> '+
      '남은 줄은 안 돈다.</div>', lines.length);
    $("#rskAgain").onclick=function(){ rskReset(rec); };
    return;
  }
  if(s>=lines.length){
    box.innerHTML=rskDone(d, rec, h+
      '<div class="note g" style="margin-top:10px"><b>'+lines.length+
      '줄을 다 돌았다.</b></div>', lines.length);
    $("#rskAgain").onclick=function(){ rskReset(rec); };
    return;
  }

  var first=roundFirst(s, 1);
  if(first===null){
    h+='<div class="note w" style="margin-top:10px"><b>이 판은 이대로 안 돈다.</b> '+
       '줄과 강도가 서로 다른 화면에 있어야 하는데 이 기기는 어느 쪽인지를 모른다. '+
       '대장 탭에서 이 기기 쪽을 고른다.</div></div>';
    box.innerHTML=h; return;
  }

  var line=lines[s], st=rskStep(s);
  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span>이 기기 자리 <b>'+esc(first?RSK.seats[0]:RSK.seats[1])+'</b></span>'+
     '<span class="small mut">'+(s+1)+' / '+lines.length+'줄 · '+
     esc(rskToday())+'</span></div>';

  if(first){
    /* 뭉개는 쪽. **줄은 여기에만 있다.** 저쪽이 보면 귀로 안 찾는다. */
    h+='<div class="small mut" style="margin-top:10px">이 줄을 읽되 '+
       '<b>한 군데를 일부러 뭉갠다.</b> 어디를 뭉갤지는 스스로 고른다</div>'+
       '<div class="swpline">'+esc(line)+'</div>';
    h+='<div class="vpane"><div class="vhid" aria-hidden="true"><span>'+
       '어느 세기로 되물으라고 했는지는 저쪽 화면에만 있다</span></div></div>';
    h+='<div class="note" style="margin-top:10px"><b>판정은 이 자리다.</b> '+
       '어디를 뭉갰는지 자기가 안다. 상대가 그 자리를 되물었는지를 본다.</div>';
    h+='<div class="row" style="margin-top:8px">'+
       '<button class="b" id="rskAlone">보기 없이 되물었다</button>'+
       '<button class="g" id="rskShown">보기를 보고 말했다</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>보기를 본 것은 실패가 아니다.</b> 셈에서 빠질 뿐이다. '+
       '상대가 열었는지를 물어보고 누른다.</div>';
  }else{
    /* 되묻는 쪽. **강도는 여기에만 있다.** 저쪽이 보면 그 강도에 맞춰 뭉갠다. */
    h+='<div class="vpane"><div class="vhid" aria-hidden="true"><span>'+
       '무슨 줄인지는 저쪽 화면에만 있다</span></div></div>';
    h+='<div class="note" style="margin-top:10px">이 줄은 <b>'+esc(st.name)+
       '</b>으로 되묻는다. 듣고 그 세기로 한 번 되묻는다.</div>';
    if(rec.open){
      if(st.lines.length){
        h+='<div class="rskbox"><div class="small mut">대본에 있는 보기다. '+
           '<b>지어낸 것이 아니다.</b></div>';
        st.lines.forEach(function(x){
          h+='<div class="rskline">'+esc(x.line)+
             '<span class="small mut"> · '+esc(x.mid)+'</span></div>';
        });
        h+='</div>';
      }else{
        /* T297 의 발견이 여기서 화면으로 나온다. **빈 자리를 안 채운다.** */
        h+='<div class="note w"><b>이 세기는 대본에 보기가 없다.</b> '+
           '52과 어디에도 전체를 다시 말해 달라는 되묻기가 없다. '+
           '지어내지 않고 없다고 적는다. <b>둘이 만들어 본다.</b> '+
           '실제 말에서 제일 센 것은 드물다는 것이 여기서 보인다.</div>';
      }
    }else{
      h+='<div class="row" style="margin-top:8px">'+
         '<button class="g" id="rskOpen">되묻는 말이 안 나온다. 보기를 본다</button></div>';
      h+='<div class="small mut" style="margin-top:6px">'+
         '<b>먼저 해 본다.</b> 안 나오면 그때 연다. 여는 것이 벌이 아니다.</div>';
    }
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="g" id="rskNext">다음 줄</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>이 자리에는 판정할 것이 없다.</b> 어디를 뭉갰는지는 저쪽만 안다.</div>';
  }

  h+='<div class="small mut" style="margin-top:8px">보기 없이 <b>'+rec.alone+
     '</b> · 보기 보고 <b>'+rec.shown+'</b></div>';
  h+='<div id="rskTurn"></div>';
  h+='<div class="row" style="margin-top:10px">'+
     '<button class="g" id="rskGo">'+RSK.min+'분 시계 <span class="mono" id="rskClock">'+
     rskClockText()+'</span></button></div>'+playGrade(d)+'</div>';
  box.innerHTML=h;

  $("#rskGo").onclick=function(){ rskClockGo(RSK.min); };
  if($("#rskOpen")) $("#rskOpen").onclick=function(){
    rec.open=true; save(); renderReask();
  };
  function step(){
    rec.open=false; save();
    var n=s+1;
    roundStepSet("reask", n); renderReask();
    if(turnCheck("reask", n, 1)) turnAlert(n, 1, RSK.seats, "rskTurn");
  }
  if($("#rskAlone")) $("#rskAlone").onclick=function(){
    rec.alone++; tone("done"); step();
  };
  if($("#rskShown")) $("#rskShown").onclick=function(){
    rec.shown++; tone("next"); step();
  };
  if($("#rskNext")) $("#rskNext").onclick=function(){ step(); };
}
function rskReset(rec){
  roundStepSet("reask",0); turnForget("reask");
  rec.alone=0; rec.shown=0; rec.open=false; save();
  rskClockStop(); RSKCLK.left=0; RSKCLK.over=false; renderReask();
}
PLAYREND.reask=renderReask;
