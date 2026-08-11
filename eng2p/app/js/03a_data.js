/* =========================================================================
   자료를 읽는 자리.

   **03_plan.js 가 538줄이 됐다** (T387). 500줄을 넘으면 한 화면에 안 들어오고
   그러면 고칠 때 딴 데를 건드린다 (T161). 자료 읽기를 통째로 뗐다.

   여기 있는 것은 넷이다.

       loadScript   script 를 꽂아 읽는다. fetch 는 file:// 에서 막힌다
       loadData     그 자료를 DATA 에 담는다
       dataPath     그 자료가 어느 자리에 있나
       dataWait     기다리는 칸과 못 읽은 칸

   **저장소를 만지는 코드를 02_store.js 에 모은 것과 같은 손이다** (T383).
   흩어지면 못 읽을 때 처리가 갈린다.
   ========================================================================= */
/* **읽는 것을 뒤로 미루는 자리가 둘이 됐다.**
   하나는 `out/data` 의 파생 자료고 하나는 미디어 차림표다. 경로가 다르다.
   그래서 붙이는 일만 떼어 둔다. 같은 것을 두 번 붙이지 않는 것이 이 함수의 일이다. */
var pending={};
/* 못 읽은 것을 기억한다 (T387).

   ## 화면이 영영 여는 중에 머물렀다

   못 읽으면 부르는 쪽이 다시 그리고 다시 그리면 또 읽으러 간다.
   **3초에 1432번 읽으러 갔다.** 화면은 그동안 "여는 중이다" 였다.

   두 사람은 기다린다. 기다려도 안 온다. 앱이 멎은 것으로 보인다.
   실제로는 그 파일이 없는 것이고 그것은 기다릴 일이 아니다.

   한 번 실패한 것은 기억한다. 그러면 두 번째부터 곧바로 아니라고 답한다.
   화면은 `dataFailed` 를 보고 **못 읽었다고 말한다.** */
var failed={};
function dataFailed(key){ return !!failed[key]; }
function loadScript(key, src, cb){
  if(failed[key]) return cb(false);
  if(pending[key]){ pending[key].push(cb); return; }
  pending[key]=[cb];
  var s=document.createElement("script");
  s.src=src;
  function done(ok){
    var qs=pending[key]||[]; pending[key]=null;
    qs.forEach(function(f){ f(ok); });
  }
  s.onload=function(){ done(true); };
  s.onerror=function(){ failed[key]=true; done(false); };
  document.head.appendChild(s);
}
function loadData(name, global, cb){
  if(window[global]){ DATA[name]=window[global]; return cb(DATA[name]); }
  /* **이미 못 읽은 것은 콜백을 안 부른다** (T388).
     콜백이 하는 일은 대개 다시 그리는 것이고 다시 그리면 그 그림이 또 여기로 온다.
     전에는 script 를 새로 만들어 비동기로 실패했으니 재귀가 안 보였다.
     실패를 기억하고 곧바로 답하게 하자 **스택이 넘쳤다.** 검사가 잡았다.

     부르는 쪽은 이미 `dataWait` 로 못 읽었다고 그렸다. 다시 그릴 까닭이 없다. */
  if(dataFailed(name)) return;
  loadScript(name, "eng2p/out/data/"+name+".js", function(ok){
    DATA[name]=ok?window[global]:null; cb(DATA[name]);
  });
}
/* 자료를 기다리는 칸 (T387). **읽는 중과 못 읽었다를 가른다.**
   한 자리에 모아 둔다. 부르는 자리가 마흔 곳이 넘어 저마다 적으면 갈라진다. */
/* 자료가 어느 자리에 있나 (T387). **틀린 이름을 적으면 없는 것을 찾는다.**
   `out/data` 밖에 있는 것이 셋이고 분기 차림표는 이름꼴이 다르다. */
var DATA_AT={
  catalog:"media/english/catalog.js",
  plays:"eng2p/out/app/plays.js",
  late:"eng2p/out/app/late.js"
};
function dataPath(name){
  if(DATA_AT[name]) return DATA_AT[name];
  if(name.indexOf("idx")===0)
    return "eng2p/out/data/index_"+name.slice(3).toLowerCase()+".js";
  return "eng2p/out/data/"+name+".js";
}
/* **조사를 앱이 안 짓는다.** 이름표에 담아 넘긴다. "물음을" 과 "표를" 이
   섞여 있어 하나로 지으면 "물음를" 이 된다. 한국어 조사는 앞말이 정한다. */
function dataWait(what, name){
  if(dataFailed(name))
    return '<div class="note w">'+esc(what)+' 못 읽었다. '+
      '<b>'+esc(dataPath(name))+'</b> 가 있어야 한다. '+
      '내려받을 때 그 자리가 빠졌으면 이 칸은 안 돈다. 나머지는 그대로 돈다.</div>';
  return '<div class="small mut">'+esc(what)+' 여는 중이다.</div>';
}
