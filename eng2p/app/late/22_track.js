/* 트랙별 진도 (T344). `docs/track.md` 가 규격이다.

   ## 세는 것이 아니라 읽는 것이다

   96강에 트랙이 하나씩 붙어 있다. `out/data/track.js` 가 그 표고
   여기서는 **마친 강이 몇 번째까지인가**만 셈해서 견준다.

   마친 세션 셋이 한 강이다. 주 엿새에 강 둘이라 그렇다.

   ## 고르지 않은 것이 정상이다

   Q1 을 마치면 소리는 열다섯이고 문법과 자동화는 0이다.
   기준서 3.1 이 분기마다 비중을 다르게 잡았기 때문이다.

   **막대 여섯을 나란히 놓으면 짧은 것이 밀린 것으로 읽힌다.**
   그래서 이 분기 배정 수를 같이 적고 0이면 `이 분기에는 없다` 라고 적는다.
   `0 / 0` 을 안 적는다. 0을 보이면 못 한 것으로 읽힌다.

   ## 남은 것을 안 적는다

   앞으로 몇 강 남았는지를 안 적는다. 남은 것을 적으면 빚이 되고 빚은 벌이다.
   **다음 하나가 언제인지**는 적는다. 그것은 빚이 아니라 차림표다. */
function trackDone(){
  /* 마친 세션 셋이 한 강이다. **끝낸 것만 센다.** 오늘 강은 아직 안 끝났다 */
  return Math.min(96, Math.floor(doneSessions()/3));
}

function renderTrack(){
  var box=$("#trackBox"); if(!box) return;
  var d=DATA.track;
  if(!d){
    /* **못 읽었으면 그렇다고 말한다** (T387). 전에는 영영 여는 중이었다 */
    box.innerHTML=dataWait("트랙 표를","track");
    if(!dataFailed("track"))
      loadData("track","ENG2P_TRACK",function(){ renderTrack(); });
    return;
  }
  var done=trackDone(), pl=plan(), q=pl.quarter;
  /* **못 읽었으면 Q1 인 척하지 않는다** (T380).
     `plan().quarter` 는 그 주 차림표에서 온다. 안 읽혀 있으면 undefined 고
     전에는 그것을 `||"Q1"` 로 받았다. **13주인데 Q1 배정을 보여 주고 있었다.**
     T379 가 주간 점검에 `needWeek` 을 걸면서 그 자리가 드러났다.
     못 읽었으면 읽어 오고 그동안은 아무 값도 안 적는다. */
  if(!q){
    box.innerHTML=dataWait("트랙 표를","idx"+(weekQuarter(pl.week)||"Q1"));
    if(typeof needWeek==="function") needWeek(pl.week,function(){ renderTrack(); });
    return;
  }
  var h='<p class="small mut">강의 96편에 트랙이 하나씩 붙어 있다. '+
        '<b>지금 '+done+'강까지 마쳤다.</b><br>'+
        '<b>트랙마다 속도가 다른 것이 정상이다.</b> '+
        '기준서 3.1 이 분기마다 비중을 다르게 잡았다.</p>';
  h+='<table class="mgtab"><tr><th scope="col">트랙</th>'+
     '<th scope="col">지금까지</th><th scope="col">이 분기</th>'+
     '<th scope="col">다음</th></tr>';
  (d.tracks||[]).forEach(function(t){
    var got=(t.nos||[]).filter(function(n){ return n<=done; }).length;
    var qn=(t.q||{})[q]||0;
    var nx=null;
    (t.nos||[]).forEach(function(n,i){
      if(nx===null && n>done) nx=(t.weeks||[])[i];
    });
    h+='<tr><td>'+esc(t.track)+'</td>'+
       '<td class="mono">'+got+' / '+t.all+'</td>'+
       /* **0 / 0 을 안 적는다.** 0을 보이면 못 한 것으로 읽힌다 */
       '<td class="small">'+(qn ? '<span class="mono">'+qn+'</span>강'
                                : '<span class="mut">이 분기에는 없다</span>')+'</td>'+
       '<td class="small mut">'+(nx===null ? '다 지났다' : nx+'주')+'</td></tr>';
  });
  h+='</table>';
  h+='<div class="n">여기 있는 것은 <b>차림표를 어디까지 지났는가</b>다. '+
     '그 트랙이 몸에 붙었는지는 분기 통과 조건이 재고 그중 열둘은 사람이 잰다.<br>'+
     '<b>둘이 같이 지난 것이다.</b> 사람마다 다르게 가는 것은 진도가 아니라 실력이다.</div>';
  box.innerHTML=h;
}
