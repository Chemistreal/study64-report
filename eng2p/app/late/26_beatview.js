/* =========================================================================
   마디를 글로 적는 자리. **클립 조각에서 갈라 나왔다** (T369).

   `18_clip.js` 는 파형에서 마디를 **뽑는다.** 여기는 그것을 **적는다.**
   T364 부터 T369 까지 적을 것이 넷으로 늘었다.

       강세    제일 긴 마디와 제일 센 마디 (T367)
       차이    기준과의 길이와 마디 수 (T366)
       박자    전체 배수를 뺀 상대 길이 (T368)
       표      마디마다 한 줄 (T369)

   **판정을 안 낸다.** 숫자와 몇 번째인지만 낸다 (`beat.md` 5장).
   ========================================================================= */
/* 제일 긴 마디와 제일 센 마디 (T367). **몇 번째인지를 낸다.**

   영어는 강세 박자라 마디 길이가 들쭉날쭉하다 (기준서 8장 표).
   그런데 **들쭉날쭉한 정도를 앱이 판정하지 않는다** (`beat.md` 5장).
   어디가 제일 긴지 어디가 제일 센지만 짚고 그다음은 두 사람이 본다.

   마디가 둘보다 적으면 짚을 것이 없다. **하나뿐인 것을 제일이라고 안 한다.** */
function beatPick(r){
  if(!r||r.segs.length<2) return null;
  var lo=0, hi=0, i;
  for(i=1;i<r.segs.length;i++){
    if(r.segs[i].t1-r.segs[i].t0 > r.segs[lo].t1-r.segs[lo].t0) lo=i;
    if(r.segs[i].amp > r.segs[hi].amp) hi=i;
  }
  return {longest:lo, loudest:hi, len:r.segs[lo].t1-r.segs[lo].t0,
          same:lo===hi};
}
function renderStress(){
  var box=$("#clipStress"); if(!box) return;
  var p=beatPick(beatNow());
  if(!p){ box.hidden=true; box.textContent=""; return; }
  box.hidden=false;
  /* **같으면 같다고 적는다.** 두 줄로 나눠 적으면 다른 자리로 읽힌다 */
  var say=p.same
    ? "제일 길고 제일 센 마디가 "+(p.longest+1)+"번째다 ("+p.len.toFixed(1)+"초)"
    : "제일 긴 마디 "+(p.longest+1)+"번째 ("+p.len.toFixed(1)+"초) · "+
      "제일 센 마디 "+(p.loudest+1)+"번째";
  say+=" · 마디 안 어디인지는 안 잰다";
  if(box.textContent!==say) box.textContent=say;
}

/* 기준과 이 파일의 차이 (T366). **그림으로 안 보이는 것만 낸다.**
   겹친 그림은 가로를 칸 번호로 맞춰서 길이 차이가 안 보인다 (`beat.md` 10.1).

   **판정을 안 낸다.** 몇 배인지와 몇 개인지만 낸다.
   기준이 없거나 길이를 모르면 `null` 이다. 없는 것을 0으로 안 적는다. */
function beatDiff(){
  if(!REF||!(REF.dur>0)) return null;
  var bt=beatNow(), d2=dur();
  if(!bt||!(d2>0)) return null;
  if(REF.name===(CLIP.file&&CLIP.file.name)) return null;
  return {refDur:REF.dur, myDur:d2, ratio:d2/REF.dur,
          refSegs:REF.segs, mySegs:bt.segs.length};
}
/* 박자를 대 본다 (T368). **전체가 느린 것과 한 마디만 늘어진 것은 다르다.**

   0.8배로 또박또박 말한 것은 박자가 맞는 것이다 (`bench_music.md` 6.1).
   그러니 전체 배수는 어긋남이 아니다. **그 배수를 빼고 남는 것이 박자다.**

       상대 길이 = (내 마디 / 내 전체) / (기준 마디 / 기준 전체)

   1.00 이면 그 마디가 전체와 같은 비율로 늘었다는 뜻이다.
   1.00 보다 크면 그 마디만 더 늘어졌고 작으면 그 마디만 더 뭉갰다.

   **마디 수가 다르면 짝을 못 짓는다.** 억지로 맞추면 그다음 숫자가 다 헛것이다.
   못 하는 것을 못 한다고 낸다. */
function beatMatch(){
  var d=beatDiff();
  if(!d) return null;
  var mine=beatNow();
  if(!mine||!REF||!REF.segs) return null;
  if(!REF.each||REF.each.length!==d.refSegs) return {paired:false};
  if(mine.segs.length!==d.refSegs) return {paired:false};
  var rows=mine.segs.map(function(g,i){
    var my=(g.t1-g.t0)/d.myDur, rf=REF.each[i]/d.refDur;
    return {i:i, rel:rf>0 ? my/rf : null};
  });
  /* 제일 어긋난 마디. **1.00 에서 얼마나 먼가로 센다** */
  var worst=null;
  rows.forEach(function(r){
    if(r.rel==null) return;
    var off=Math.abs(r.rel-1);
    if(!worst||off>worst.off) worst={i:r.i, rel:r.rel, off:off};
  });
  return {paired:true, rows:rows, worst:worst};
}
function renderMatch(){
  var box=$("#clipMatch"); if(!box) return;
  var m=beatMatch();
  if(!m){ box.hidden=true; box.textContent=""; return; }
  box.hidden=false;
  if(!m.paired){
    /* **못 하는 것을 못 한다고 낸다.** 억지로 맞추면 그다음 숫자가 다 헛것이다 */
    box.textContent="마디 수가 달라서 마디끼리 대 보지 못한다. "+
      "먼저 어디서 끊었는지를 맞춘다.";
    return;
  }
  var w=m.worst;
  if(!w){ box.hidden=true; box.textContent=""; return; }
  /* **전체 배수를 뺀 값이다.** 느리게 말한 것 자체는 어긋남이 아니다 */
  box.textContent="전체 배수를 빼고 대 보면 "+(w.i+1)+"번째 마디가 제일 다르다 "+
    "("+w.rel.toFixed(2)+"배). 1.00 이면 전체와 같은 비율이다.";
}


/* 마디마다 한 줄 (T369). **한 줄로는 어디가 어떻게 다른지 모른다.**

   T368 이 제일 어긋난 마디 하나를 짚었다. 그것으로는 두 번째로 어긋난 자리도,
   앞이 밀린 것인지 뒤가 밀린 것인지도 안 보인다.

   **표에도 판정을 안 적는다.** 초와 배수만 적는다. */
function renderRows(){
  var box=$("#clipRows"); if(!box) return;
  var m=beatMatch(), d=beatDiff(), mine=beatNow();
  if(!m||!m.paired||!d||!mine){ box.hidden=true; box.innerHTML=""; return; }
  box.hidden=false;
  box.innerHTML='<tr><th scope="col">마디</th><th scope="col">기준</th>'+
    '<th scope="col">이 파일</th><th scope="col">상대 길이</th></tr>'+
    m.rows.map(function(r){
      var g=mine.segs[r.i];
      return '<tr><td class="n">'+(r.i+1)+'</td>'+
        '<td class="n">'+REF.each[r.i].toFixed(2)+'초</td>'+
        '<td class="n">'+(g.t1-g.t0).toFixed(2)+'초</td>'+
        /* **빈 자리를 기호로 안 적는다.** 처음에 em-dash 를 썼다가 걸렸고
           그 검사가 맞다. 없는 것은 없다고 적는다 (`check_app.py` 빈 자리 말). */
        '<td class="n">'+(r.rel==null?"셀 수 없다":r.rel.toFixed(2)+"배")+'</td></tr>';
    }).join("");
}

/* 배속 사다리 세 칸을 클립 탭에도 건다 (T371).

   `bench_music.md` 5장이 이렇게 적었다.

       규격이 없어서 배속이 그냥 손잡이다. 두 사람이 아무 때나 아무 값으로 민다.

   그 손잡이가 여기 있다. 6장이 정한 세 칸을 단추로 두고
   **그 칸에 서면 그 칸의 판정 기준을 적는다.** 기준이 칸마다 다르다 (6.4).

   **숫자를 여기 안 적는다.** `out/data/ladder.js` 에서 온다.
   그 파일은 `docs/bench_music.md` 6장에서 파생된다. 놀이 판이 쓰는 것과 같은 자료다.

   손잡이 위 끝이 1 이었다. **사다리 위 칸이 1.2 라 못 만들었다** (T371 에 잡았다). */
function renderLadder(){
  var box=$("#cLadder"), say=$("#cLadderSay");
  if(!box||!say) return;
  var d=DATA.ladder;
  if(!d){ loadData("ladder","ENG2P_LADDER",function(){ renderLadder(); }); return; }
  var now=CLIP.el ? Math.round((+$("#cRate").value)*100)/100 : null;
  box.innerHTML="";
  (d.steps||[]).forEach(function(st){
    var on=(now!=null && Math.abs(now-st.rate)<0.005);
    var b=el("button","g"+(on?" on":""),st.name+" "+st.label);
    b.type="button";
    b.onclick=function(){
      $("#cRate").value=st.rate;
      $("#cRate").dispatchEvent(new Event("input"));
    };
    box.appendChild(b);
  });
  var at=(d.steps||[]).filter(function(st){
    return now!=null && Math.abs(now-st.rate)<0.005; })[0];
  /* **칸 밖에 있으면 그 말을 한다.** 사다리에 없는 값은 사다리가 아니다 */
  say.textContent = at
    ? at.name+" 칸 · 무엇을 보나: "+at.see+" · 듣는 쪽 기준: "+at.judge
    : "사다리 칸 밖이다. 세 칸 중 하나에 서야 그 칸 기준으로 잰다.";
}

function renderDiff(){
  var box=$("#clipDiff"); if(!box) return;
  var d=beatDiff();
  if(!d){ box.hidden=true; box.textContent=""; return; }
  box.hidden=false;
  /* **배수를 적고 어느 쪽이 나은지는 안 적는다.** 느린 것이 나쁜 것이 아니다.
     0.8배로 듣는 것이 사다리의 첫 칸이다 (`bench_music.md` 6.1). */
  var say="기준 "+d.refDur.toFixed(1)+"초 · 이 파일 "+d.myDur.toFixed(1)+"초"+
    " ("+d.ratio.toFixed(2)+"배)";
  say+= d.mySegs===d.refSegs
    ? " · 마디 수는 같다 ("+d.mySegs+"개)"
    : " · 마디 "+d.mySegs+"개 대 기준 "+d.refSegs+"개";
  if(box.textContent!==say) box.textContent=say;
}
