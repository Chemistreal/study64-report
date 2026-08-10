/* =========================================================================
   판. **E단계 스무 판이 여기 붙는다.**

   `docs/play_rules.md` 가 판마다 아홉 줄로 규격을 적었고
   `docs/round.md` 8장이 두 화면 가르는 조각을 만들어 뒀다.
   이 자리는 그 둘을 잇는다. 규칙서가 정한 것을 화면이 그대로 시킨다.

   **판마다 새로 만들지 않는다.** 자리 돌기와 가리기와 회 번호는
   `24_round.js` 와 `24b_side.js` 것을 그대로 쓴다. 스무 번 새로 만들면
   스무 벌이 조금씩 달라지고 그중 하나가 안 가린다 (round.md 8장).

   **여기 있는 것은 목록과 틀뿐이다.** 판 화면 자체는 `app/play/` 에 있고
   판 탭을 처음 열 때 읽는다. 스무 판을 다 english.html 에 넣으면
   그것만으로 100KB 가 넘고 `check_perf.js` 의 천장을 넘는다.
   **두 사람이 판 탭을 안 여는 날도 있다.** 그날은 안 읽는다.

   `docs/play_app.md` 가 이 자리의 규격이다.
   ========================================================================= */

/* 화면이 붙은 판. **붙을 때마다 여기 한 줄이 는다.**
   안 붙은 판을 목록에 안 적는다. 적어 두면 눌러 보고 아무 일도 안 나고
   그러면 두 사람이 앱이 고장 난 줄 안다. 남은 열아홉은 T261~T317 이다.

   **여기 있는 것은 규격 아홉 줄 중 앞의 셋뿐이다.** 고르기 전에 보이는 것들이다.
   나머지 여섯은 그 판을 그리는 자리가 갖는다. */
var PLAYS=[
  {id:"mirror", name:"거울", track:"소리", min:4},
  {id:"swapline", name:"한 줄 바꾸기", track:"소리", min:5},
  {id:"hearme", name:"내 소리는 네가", track:"소리", min:5},
  {id:"relay", name:"전달 놀이", track:"소리", min:5},
  {id:"chain", name:"이어달리기", track:"청크", min:5},
  {id:"twohalf", name:"둘이 한 문장", track:"청크", min:4},
  {id:"overlap", name:"겹치면 지운다", track:"청크", min:4},
  {id:"ladder", name:"배속 사다리", track:"자동화", min:5},
  {id:"wall", name:"3초 벽", track:"자동화", min:4},
  {id:"rebound", name:"되받아치기", track:"자동화", min:4},
  {id:"onesee", name:"한 사람만 본다", track:"화용", min:5},
  {id:"wave", name:"파장", track:"화용", min:5},
  {id:"whose", name:"누구 말이야", track:"화용", min:4}
];
/* 판을 그리는 자리. **`app/play/` 조각이 여기에 자기를 넣는다.**
   목록에 있는데 여기 없으면 아직 안 읽은 것이다. 읽고 나서 다시 그린다. */
var PLAYREND={};
var PLAY={at:null, loading:false};

function playById(id){
  for(var i=0;i<PLAYS.length;i++) if(PLAYS[i].id===id) return PLAYS[i];
  return null;
}
/* 판 화면을 읽는다. **판 탭을 열 때 딱 한 번이다.** */
function playLoad(cb){
  if(PLAYREND[PLAY.at]) return cb(true);
  loadScript("plays","eng2p/out/app/plays.js",cb);
}
function renderPlayTab(){
  var list=$("#playList"); if(!list) return;
  var h="";
  PLAYS.forEach(function(p){
    h+='<button class="'+(PLAY.at===p.id?"b":"g")+'" data-play="'+esc(p.id)+'">'+
       esc(p.name)+' <span class="small mut">'+esc(p.track)+' '+p.min+'분</span></button>';
  });
  /* **스무 판 중 몇이 붙었는지를 적는다.** 안 적으면 하나뿐인 목록을 보고
     이것이 전부인 줄 안다. 나머지는 없는 것이 아니라 아직 안 만든 것이다. */
  h+='<span class="small mut">스무 판 중 '+PLAYS.length+'개가 화면에 붙었다. '+
     '나머지는 규칙 카드와 종이로 돈다.</span>';
  list.innerHTML=h;
  list.querySelectorAll("[data-play]").forEach(function(b){
    b.onclick=function(){
      PLAY.at=(PLAY.at===b.dataset.play)?null:b.dataset.play;
      renderPlayTab();
    };
  });
  renderPlayPane();
}
function renderPlayPane(){
  var box=$("#playPane"); if(!box) return;
  if(!PLAY.at){ box.innerHTML=""; return; }
  var f=PLAYREND[PLAY.at];
  if(f) return f();
  box.innerHTML='<div class="card tight small mut">판 화면을 여는 중이다.</div>';
  playLoad(function(ok){
    if(!ok || !PLAYREND[PLAY.at]){
      box.innerHTML='<div class="card"><div class="note w">판 화면을 못 읽었다. '+
        '<b>eng2p/out/app/plays.js</b> 가 있어야 한다. 내려받을 때 그 자리가 빠졌으면 '+
        '그 판은 규칙 카드와 종이로 돈다.</div></div>';
      return;
    }
    PLAYREND[PLAY.at]();
  });
}

/* 판 위에 늘 붙는 머리. **두 기기가 같아야 하는 것을 먼저 보인다.**
   회 번호는 각자 세고 (round.md 6장) 어긋나면 이 두 글자가 달라진다.
   달라진 것을 사람이 본다. 기기가 서로에게 말할 길이 없다. */
function playHead(p, s){
  return '<div class="row" style="justify-content:space-between;align-items:baseline">'+
    '<b>'+esc(p.name)+'</b>'+
    '<span class="small mut">판 표시 <b class="mono">'+esc(roundTag(p.id,s))+
    '</b> · 회 <b class="mono">'+s+'</b> · <b>둘이 같아야 한다</b></span></div>';
}

/* 그날의 셈. **판정은 규칙서가 정한 사람이 하고 그 자리가 판 안에서 바뀐다.**
   그래서 한 기기에는 절반만 있다. 나머지 절반은 상대 기기에 있고
   더하는 것은 사람이 한다. 기기끼리 말할 길이 없다 (round.md 2장).
   합치는 규칙은 T320 이 정한다. 그때까지 `rhit` 는 안 건너간다. */
function playRec(id, blank){
  if(!S.rhit) S.rhit={};
  var k=id+"|"+today();
  if(!S.rhit[k]) S.rhit[k]=blank;
  return S.rhit[k];
}
/* **이 숫자가 절반이라고 화면이 적는다.** 안 적으면 두 사람이 이것을 판의 셈으로
   읽는다. 넷 중 셋을 보고 "여덟 중 셋" 이라고 적는다. 그것이 제일 나쁘다. */
function playHalf(all){
  return '<div class="note w">규칙서가 남기라는 값은 <b>'+all+' 중 몇</b>이다. '+
    '이 기기 숫자는 그 절반이다. 판정하는 자리가 판 안에서 바뀌었으니 '+
    '<b>두 기기 숫자를 소리 내어 더한다.</b> 기기끼리는 못 더한다.</div>';
}
/* **자료 등급을 화면이 말한다.** 파일이 스스로 적은 것을 그대로 옮긴다.
   내가 다시 안 적는다. 자료가 A등급이 되는 날 화면도 같이 바뀌어야 하고
   옮겨 적으면 안 바뀐다.

   **통과 판정에 안 쓴다는 말은 B등급에만 붙인다.** T273 에 A등급 자료가 처음
   나왔는데 이 줄이 거기에도 "Q1 소리 트랙 통과 판정에는 안 쓴다" 를 붙이고 있었다.
   그것은 없는 금지다. 지어낸 영어가 없는 자료에 그 말을 붙이면
   **두 사람이 쓸 수 있는 것을 못 쓰는 것으로 읽는다.**
   CLAUDE.md 가 막은 것은 확신 없는 것으로 통과를 정하는 일이지 A등급이 아니다. */
function playGrade(d){
  if(!d) return "";
  var g=d.grade||"B";
  return '<div class="small mut" style="margin-top:10px">쓰는 자료는 <b>'+
    esc(g)+'등급</b>이다. '+esc(d.gradeWhy||"")+
    (g==="A" ? "" : ' <b>Q1 소리 트랙 통과 판정에는 안 쓴다.</b> 연습에만 쓴다.')+
    '</div>';
}
