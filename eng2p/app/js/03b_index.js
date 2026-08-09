/* =========================================================================
   차림표를 게으르게 읽는 자리 (T245).

   48주 내용이 분기 조각 넷에 있다. 머리에는 주마다 분기만 있다.
   첫 그림에 쓰는 것은 오늘 그 한 주뿐이고 나머지는 눌러야 열린다.

   **`03_plan.js` 에 두려다 그 조각이 510줄이 됐다.** 500줄을 넘으면 한 화면에
   안 들어오고 그러면 고칠 때 딴 데를 건드린다 (T161). 그래서 여기로 뗐다.
   ========================================================================= */
/* **48주 내용은 분기 조각 넷에 있다.** 머리에는 주마다 분기만 있다 (T245).
   `IDX.weeks` 는 처음에 빈 자리고 읽은 분기만 채워진다.
   그 자리를 보는 쪽은 반드시 `needWeek` 이나 `needQuarter` 를 먼저 부른다. */
if(IDX && !IDX.weeks) IDX.weeks=[];
function weekQuarter(w){
  var q=(IDX&&IDX.weekQ)||[];
  return q[(w|0)-1]||null;
}
function haveQuarter(q){
  if(!IDX||!q) return false;
  var w=(IDX.weekQ||[]).indexOf(q);
  return w>=0 && !!IDX.weeks[w];
}
/* 분기 하나를 읽어 `IDX.weeks` 의 제자리에 꽂는다. 이미 있으면 바로 부른다. */
function needQuarter(q, cb){
  cb=cb||function(){};
  if(!IDX||!q) return cb(false);
  if(haveQuarter(q)) return cb(true);
  var g="ENG2P_INDEX_"+q.toUpperCase();
  loadScript("idx"+q, "eng2p/out/data/index_"+q.toLowerCase()+".js", function(){
    var rows=window[g];
    if(!rows) return cb(false);
    rows.forEach(function(w){ IDX.weeks[w.week-1]=w; });
    cb(true);
  });
}
function needWeek(w, cb){ needQuarter(weekQuarter(w), cb); }
/* 길 지도는 48주를 다 편다. 넷을 다 읽는다. **누를 때만 읽는다.** */
function needAllWeeks(cb){
  var qs=["Q1","Q2","Q3","Q4"], left=qs.length, ok=true;
  qs.forEach(function(q){
    needQuarter(q, function(good){ if(!good) ok=false; if(!--left) cb(ok); });
  });
}
