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

