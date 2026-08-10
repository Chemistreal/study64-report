/* =========================================================================
   오늘의 한 판 (T316). `docs/play_rules.md` 12.2

     쓰는 것    앞의 열아홉 중 하나. `out/data/onepick.js` (T315)
     시작 조건  그날 세션을 마쳤다. **하루에 한 번만 열린다**
     역할       그 판의 역할을 따른다
     도는 차례  앱이 열아홉 중 하나를 고른다. 그 판을 그대로 한 판 돈다
     판정       그 판의 판정을 따른다
     끝         그 판이 끝나면 끝난다. **다시 못 연다**
     못 했을 때 그 판의 못 했을 때를 따른다
     기록할 값  열었는가 안 열었는가

   ## 이것은 판이 아니라 자리다

   아홉 줄 중 넷이 "그 판을 따른다" 다. **비운 것이 아니라 넘긴 것이다.**
   그래서 이 화면은 판을 그리지 않는다. **문을 그린다.**

   열면 그 판으로 넘어가고 거기서부터는 그 판의 화면이다.

   ## 마친 뒤에 도는 판이라 `plan()` 이 이미 내일을 가리킨다

   `plan()` 은 **끝낸 세션 수**로 오늘 자리를 센다. 그것이 맞다.
   그런데 이 판의 시작 조건이 "그날 세션을 마쳤다" 이고
   마치는 순간 그 수가 하나 는다. **그때부터 `plan()` 은 내일 자리다.**

   그대로 쓰면 내일 판을 오늘 연다. 하루씩 밀린 표를 288일 내내 본다.
   그래서 하나를 뺀다. **오늘 것이 이미 세어졌기 때문이다.**

   ## 더 하고 싶어도 못 하게 막는 것이 장치다

   Wordle 에서 왔다. 12장 소진 방지가 근거다.
   하루에 스무 판을 다 돌면 사흘이면 질린다.

   그래서 **연 것을 그날 안에 무를 수 없다.** 되돌리기를 안 붙인다.
   이 앱의 다른 자리는 거의 다 되돌릴 수 있는데 여기는 아니다.
   무를 수 있으면 막는 것이 아니다.

   ## 안 열리는 판이 뽑혔을 때

   표가 그날 열리는 판만 고른다 (T315). 하나만 못 거른다. 어제 그거다.
   그 판은 기기 기록을 쓰고 **한 기기만 안 열릴 수도 있다.**

   그때 이 자리가 대신 판정하지 않는다. 문을 열어 주고
   그 판이 제 시작 조건을 스스로 말한다. **자리는 자리의 일만 한다.**
   ========================================================================= */
var ODY={};

/* 조사를 이름에 맞춘다. **받침이 있으면 을/이고 없으면 를/가다.**

   판 이름 스무 개가 제각각이다. 거울과 3초 벽과 파장은 받침이 있고
   한 줄 바꾸기와 어제 그거는 없다. 하나로 적으면 "거울 를 연다" 가 나온다.
   두 사람이 읽는 글이라 그것을 그냥 두지 않는다. */
function odyJo(s, a, b){
  var t=String(s||""), c=t.charCodeAt(t.length-1);
  var fin=(c>=0xAC00 && c<=0xD7A3) ? (c-0xAC00)%28 : 0;
  /* **리을은 없는 쪽을 따른다.** 거울로지 거울으로가 아니다.
     을/를과 이/가는 안 그런데 으로/로만 그렇다. 그래서 받침을 번호로 본다. */
  var has=(a==="으로") ? (fin>0 && fin!==8) : (fin>0);
  return t+(has?a:b);
}

function odyGrade(){
  return playGrade({grade:"A",
    gradeWhy:"영어가 없다. 어느 판을 여는가만 적는다. 여는 판의 등급은 "+
             "그 판이 제 화면에서 말한다."});
}

/* 오늘 자리. **끝낸 수에서 하나를 뺀다.** 위 머리글을 본다. */
function odySlot(){
  var rec=(typeof day==="function") ? day(today()) : null;
  if(!rec || rec.status!=="normal") return null;
  var i=(typeof doneSessions==="function" ? doneSessions() : 0)-1;
  if(i<0 || i>287) return null;
  return {i:i, w:Math.floor(i/6)+1, d:(i%6)+1};
}
function odyRow(){
  var d=DATA.onepick, s=odySlot();
  if(!d || !d.days || !s) return null;
  var r=d.days[s.i];
  /* 자리 번호로 집고 **주와 날로 다시 맞춰 본다.** 표가 밀려 있으면 여기서 걸린다 */
  if(!r || r.w!==s.w || r.d!==s.d) return null;
  return {row:r, slot:s};
}
function odyRec(){ return playRec("oneday", {opened:0, done:0, pick:null}); }

function renderOneday(){
  var box=$("#playPane"); if(!box) return;
  var p=playById("oneday");
  if(!DATA.onepick){
    box.innerHTML='<div class="card tight small mut">오늘 판을 여는 중이다.</div>';
    loadData("onepick","ENG2P_ONEPICK",function(){ renderOneday(); });
    return;
  }
  var d=DATA.onepick, rec=odyRec();
  var h='<div class="card">'+playHead(p, rec.opened?1:0);

  var got=odyRow();
  if(!got){
    var rc=(typeof day==="function") ? day(today()) : null;
    var late=rc && rc.status==="normal";
    h+='<div class="note w" style="margin-top:10px"><b>아직 안 열린다.</b> '+
       (late ? '오늘 자리가 표에 없다. 288일을 다 돈 뒤다.'
             : '<b>그날 세션을 마쳐야 열린다.</b> 두 시간을 다 돌고 '+
               '세션 끝을 누르면 이 자리가 열린다.')+'</div>';
    h+='<div class="note">이 판은 <b>덤이다.</b> 세션이 먼저다. '+
       '이것 때문에 세션을 서두르면 거꾸로다.</div>';
    box.innerHTML=h+odyGrade()+'</div>'; return;
  }

  var pick=got.row.pick, pl=playById(pick);
  var name=pl ? pl.name : pick;
  var unknown=(d.unknown||[]).indexOf(pick)>=0;

  h+='<div class="row" style="margin-top:8px;justify-content:space-between">'+
     '<span class="small mut">'+got.slot.w+'주 '+got.slot.d+'일 · '+
     (got.slot.i+1)+' / '+d.count+'일째</span>'+
     '<span class="small mut">고를 판이 '+got.row.cand+'개였다</span></div>';

  if(rec.done){
    h+='<div class="note g" style="margin-top:10px"><b>오늘 것은 끝났다.</b> '+
       '오늘 판은 <b>'+esc(odyJo(name,"이었다","였다"))+
       '.</b> <b>다시 안 열린다.</b></div>';
    h+='<div class="note">더 하고 싶으면 <b>판 탭에서 아무 판이나 돈다.</b> '+
       '그것은 막지 않는다. 막는 것은 <b>이 자리 하나</b>다. '+
       '날마다 하나씩 오는 것이 이 판의 전부다.</div>';
    box.innerHTML=h+odyGrade()+'</div>'; return;
  }

  h+='<div class="odyname"><span class="small mut">오늘의 한 판</span><br>'+
     '<b>'+esc(name)+'</b>'+
     (pl ? ' <span class="small mut">'+esc(pl.track)+' '+pl.min+'분</span>' : '')+
     '</div>';

  if(unknown){
    h+='<div class="note" style="margin-top:8px">이 판은 <b>기기마다 기록이 달라서</b> '+
       '표가 미리 못 가린 판이다. <b>한 기기만 안 열릴 수도 있다.</b> '+
       '열어 보고 그 판이 하는 말을 따른다.</div>';
  }

  if(!rec.opened){
    h+='<div class="note w" style="margin-top:10px"><b>한 번 열면 못 무른다.</b> '+
       '오늘은 이 판 하나다. <b>더 하고 싶어도 이 자리는 다시 안 열린다.</b> '+
       '그것이 이 판의 전부다. 하루에 스무 판을 다 돌면 사흘이면 질린다.</div>';
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="b" id="odyGo">'+esc(odyJo(name,"을","를"))+' 연다</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>둘이 같이 누른다.</b> 두 기기가 같은 판을 연다. '+
       '표가 같으니 이름도 같다. 다르면 한쪽이 자료를 못 읽은 것이다.</div>';
  }else{
    h+='<div class="note" style="margin-top:10px"><b>오늘 것은 열었다.</b> '+
       '<b>'+esc(name)+'</b>'+odyJo(name,"을","를").slice(name.length)+' 판 탭에서 이어서 돈다. '+
       '판이 끝나면 여기로 돌아와 아래를 누른다.</div>';
    h+='<div class="row" style="margin-top:10px">'+
       '<button class="b" id="odyGo">'+esc(odyJo(name,"으로","로"))+' 간다</button>'+
       '<button class="g" id="odyEnd">다 돌았다</button></div>';
    h+='<div class="small mut" style="margin-top:6px">'+
       '<b>다 돌았다는 판정이 아니다.</b> 셈은 그 판이 적었다. '+
       '이 단추는 <b>오늘 자리를 닫는 것</b>이다.</div>';
  }

  box.innerHTML=h+odyGrade()+'</div>';

  if($("#odyGo")) $("#odyGo").onclick=function(){
    /* **여는 것을 먼저 적는다.** 넘어간 뒤에 적으면 넘어가다 만 날이 안 적힌다 */
    rec.opened=1; rec.pick=pick; saveNow();
    PLAY.at=pick; renderPlayTab();
  };
  if($("#odyEnd")) $("#odyEnd").onclick=function(){
    rec.done=1; saveNow(); tone("done"); renderOneday();
  };
}
PLAYREND.oneday=renderOneday;
