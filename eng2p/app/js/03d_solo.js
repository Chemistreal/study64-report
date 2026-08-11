/* 없는 것이 상대인가 기기인가. T354

   `03_plan.js` 가 500줄을 넘어서 여기로 뺐다. 첫 화면의 한 줄이다.

   ## 없는 것이 상대인가 기기인가

       상대가 없다   비상판 15분. 이 과정 유일한 1인 예외다
       기기가 하나다  두 시간을 다 돈다. 스무 판 중 열여덟이 종이로 돈다

   **둘을 헷갈리면 그날 두 시간을 통째로 버린다.** 둘이 다 있는데 1인 장치를 쓰는 것이다.
   매뉴얼이 그 잘못을 자기 안에서 찾아 바로잡았다.

   그런데 앱은 상대가 없는 날만 첫 화면에서 한 번에 갔다.
   기기가 하나인 날을 켜는 자리는 **판 하나 안에** 있었다.
   찾게 하면 그날은 그냥 쉰다. 그래서 여기 둔다.
*/
function renderSoloLine(){
  var line=$("#soloLine"); if(!line) return;
  var on=(typeof soloOn==="function") && soloOn();
  line.innerHTML= on
    ? '<button type="button" id="soloOff">기기가 하나인 날로 돌고 있다. 끄기</button>'+
      '<span class="small mut">두 시간을 다 돈다. 판은 돌려 보며 한다. '+
      '<b>비상판이 아니다.</b> 둘이 다 있는 날이다.</span>'
    : '<button type="button" id="soloOn2">오늘 기기가 하나다</button>'+
      '<span class="small mut">두 시간을 다 돈다. <b>비상판으로 안 간다.</b> '+
      '없는 것이 상대일 때만 비상판이다 (매뉴얼 11장).</span>';
  if($("#soloOn2")) $("#soloOn2").onclick=function(){
    S.solo=true; S.soloSeat=0; save(); renderToday();
    flash("기기가 하나인 날로 돈다. 두 시간을 다 돈다");
  };
  if($("#soloOff")) $("#soloOff").onclick=function(){
    S.solo=false; save(); renderToday();
  };
}

/* 어제 못 했으면 오늘 그 말을 한다 (T355). 매뉴얼 2.4 다.

       하루 빠지는 건 사고고, 이틀 연속은 습관의 시작이다.
       하루 빠졌으면 다음 날은 무슨 일이 있어도 수행한다.

   앱에 경보가 있었다. **그런데 그 경보는 주간 점검에 뜬다.** 이레째다.
   월요일에 빠지면 그 말을 일요일에 듣는다. 그때는 이미 이틀이 지났다.

   **어제 일은 오늘 말해야 한다.**

   ## 다그치지 않는다

   "이틀 연속이면 끝입니다" 를 안 적는다. 그것은 겁주기다 (bench_habit 5장).
   규칙과 대신 무엇을 하는지를 적는다. 비상판 15분이 그 대신이다.

   ## 안 빠진 날에는 아예 안 뜬다

   0인데 뜨면 그것은 잔소리다 (T181). 어제 정규나 비상판을 했으면 이 줄이 없다.
   일요일은 원래 쉬는 날이라 안 센다. 미리 건 회복권도 안 센다. */
function missYesterday(){
  var d=addDays(today(),-1), n=0;
  /* 일요일과 회복권 건 날은 건너뛴다. 그 앞의 진짜 마지막 자리를 본다 */
  while(n<14){
    var wd=parseISO(d).getDay();
    if(wd!==0 && !((S.rest||{})[d])){
      var r=(S.days||{})[d];
      var st=r&&r.status;
      if(st==="normal"||st==="emg") return null;
      return {day:d, first:n===0};
    }
    d=addDays(d,-1); n++;
  }
  return null;
}

function renderMissLine(){
  var line=$("#missLine"); if(!line) return;
  /* 오늘을 이미 했으면 안 뜬다. 지난 일을 오늘 다 하고 나서 볼 까닭이 없다 */
  var t=(S.days||{})[today()];
  if(t && (t.status==="normal"||t.status==="emg")){ line.innerHTML=""; return; }
  var m=missYesterday();
  if(!m){ line.innerHTML=""; return; }
  line.innerHTML='<div class="note w"><b>어제 못 했다.</b> '+
    '<b>오늘은 무슨 일이 있어도 한다.</b> 정규 두 시간이 안 되면 '+
    '<b>비상판 15분</b>으로 대신한다. 비상판을 쓴 날도 수행일로 센다.<br>'+
    '<span class="small">하루 빠지는 것은 사고고 이틀 연속이 습관의 시작이다 '+
    '(매뉴얼 2.4). 얼마나 빠졌는지는 안 센다.</span></div>';
}

