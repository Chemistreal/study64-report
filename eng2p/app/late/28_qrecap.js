/* 한 분기를 되짚는다 (T380). T378 T379 와 같은 결이다.

   ## 열두 주가 무엇이었는지를 아무 데도 안 적었다

   분기 탭에 통과 조건 넷과 관계 점검과 되돌아보기 녹음과 배지가 있다.
   그것은 다 **잰 값**이다. 그 열두 주에 무엇을 배웠는지는 한 줄도 없었다.

   주 되짚기(T379)와 같은 자리다. **차림표가 다 알고 있는데 아무도 안 물었다.**

   ## 무엇을 되짚나

   그 분기의 주 범위와 강의 범위, 트랙별 강의 수, 카드 자리다.
   차림표에서 온다. `needQuarter` 가 그 분기 열두 주를 읽어 온다.

   **트랙별 수는 차림표 값이지 사람 값이 아니다.** `track.md` 가 사람별로
   안 가른다고 했고 이것은 사람과 무관하다. Q1 이 소리에 쏠린 것은
   기준서가 그렇게 정한 것이고 그것이 보이는 편이 낫다.

   못 한 것을 안 센다. 통과 조건 칸이 이미 그 일을 한다.

   ## 되짚기가 잰 값보다 먼저다

   T379 와 같다. 무엇이었는지가 먼저고 얼마나 됐는지가 나중이다.
   그 차례가 뒤집히면 열두 주가 통과 조건 넷으로만 남는다. */
function qRecap(q){
  if(!window.IDX) return null;
  var name="Q"+q, ws=[], lec=[], lo=null, hi=null, tr={}, miss=false;
  ((IDX.weekQ)||[]).forEach(function(x,i){ if(x===name) ws.push(i+1); });
  if(!ws.length) return null;
  ws.forEach(function(w){
    var row=(IDX.weeks||[])[w-1];
    if(!row){ miss=true; return; }
    (row.lectures||[]).forEach(function(l){
      lec.push(l.no);
      if(l.track) tr[l.track]=(tr[l.track]||0)+1;
      if(l.cards){
        if(lo===null||l.cards.from<lo) lo=l.cards.from;
        if(hi===null||l.cards.to>hi) hi=l.cards.to;
      }
    });
  });
  /* **한 주라도 못 읽었으면 안 낸다.** 반쪽 셈이 온전한 셈처럼 보인다 */
  if(miss||!lec.length) return null;
  return {weeks:ws, lec:lec, tr:tr, from:lo, to:hi};
}

function renderQRecap(){
  var box=$("#qRecap"); if(!box) return;
  var r=qRecap(curQ);
  /* **차림표를 아직 못 읽었으면 안 뜬다.** 빈 자리는 못 채운 자리로 읽힌다 */
  if(!r){ box.hidden=true; box.innerHTML=""; return; }
  box.hidden=false;
  var w0=r.weeks[0], w1=r.weeks[r.weeks.length-1];
  var l0=Math.min.apply(null,r.lec), l1=Math.max.apply(null,r.lec);
  var tr=Object.keys(r.tr).map(function(k){
    return esc(k)+" "+r.tr[k];
  }).join(" · ");
  box.innerHTML='<div class="note"><b>Q'+curQ+' 는 이런 열두 주다</b> '+
    '<span class="small mut">'+w0+'~'+w1+'주 · '+l0+'~'+l1+'강</span>'+
    '<div class="small" style="margin-top:4px">트랙 '+tr+'</div>'+
    (r.from!==null?'<div class="small mut">카드 '+r.from+'~'+r.to+'</div>':"")+
    '<div class="small mut">한 트랙에 쏠린 것은 기준서가 그렇게 정한 것이다. '+
    '<b>사람별로 가른 값이 아니다.</b></div></div>';
}
