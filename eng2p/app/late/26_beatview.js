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
/* 되풀이 자리를 앱이 짚는다 (T373). **못 맞춘 마디만.**

   T368 이 제일 어긋난 마디를 냈고 T369 가 마디마다 시각을 들고 있다.
   그러면 그 마디를 A와 B로 잡아 주는 데 새로 셀 것이 없다.

   **이것도 판정이 아니다.** 어디를 다시 들을지 짚어 줄 뿐이고
   그 마디가 틀렸다고 말하지 않는다 (`beat.md` 5장).

   짝을 못 지으면 짚을 것도 없다. 마디 수부터 맞춰야 한다 (13.1). */
function renderPick(){
  var box=$("#cPick"); if(!box) return;
  var m=beatMatch(), mine=beatNow();
  if(!m||!m.paired||!m.worst||!mine){ box.hidden=true; box.innerHTML=""; return; }
  box.hidden=false; box.innerHTML="";
  var g=mine.segs[m.worst.i];
  var b=el("button","g","제일 다른 마디를 A와 B로 잡기");
  b.type="button";
  b.onclick=function(){
    /* **마디 앞뒤로 조금 넓힌다.** 딱 잘라 놓으면 첫소리가 잘려 들린다.
       0.1초는 `BEAT_MIN_SEG_S` 보다 작아서 옆 마디를 안 삼킨다. */
    CLIP.a=Math.max(0, Math.round((g.t0-0.1)*10)/10);
    CLIP.b=Math.min(dur(), Math.round((g.t1+0.1)*10)/10);
    setClipPhase("prepare"); paintScrub();
    flash((m.worst.i+1)+"번째 마디를 잡았다. 구간 반복으로 듣는다");
  };
  box.appendChild(b);
  box.appendChild(el("div","small mut",
    "앱이 짚는 것은 다시 들을 자리다. 그 마디가 틀렸다는 말이 아니다."));
}

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
  renderRung();
  say.textContent = at
    ? at.name+" 칸 · 무엇을 보나: "+at.see+" · 듣는 쪽 기준: "+at.judge
    : "사다리 칸 밖이다. 세 칸 중 하나에 서야 그 칸 기준으로 잰다.";
}

/* 사다리 칸을 센다 (T372). 규칙은 `bench_music.md` 6.2 와 6.3 이 정했고
   `out/data/ladder.js` 가 그것을 들고 온다.

       세 번 연달아 되면 한 칸 올라간다
       한 번 안 되면 그 칸에서 다시 센다 (0부터)
       두 번 연달아 안 되면 한 칸 내린다

   **남기는 것과 안 남기는 것이 6.5 에 있다.**

       남긴다      지금 몇 칸인가. 마지막으로 언제 했는가
       안 남긴다   몇 번 만에 올라갔는가. 누가 판정했는가. 사람별 칸

   `run` 은 지금 연달아 몇 번인가다. **셈에 쓰는 값이지 쌓은 값이 아니다.**
   올라가면 0으로 돌아가고 아무 데도 안 남는다. */
function rungKey(){ return (CLIP.file && CLIP.file.name) || null; }
function rungNow(){
  var k=rungKey(); if(!k) return null;
  var r=(S.rung||{})[k];
  return r || {i:0, run:0, miss:0, at:null};
}
function rungSet(r){
  var k=rungKey(); if(!k) return;
  if(!S.rung) S.rung={};
  S.rung[k]=r; save();
}
/* 됐다. **세 번 연달아여야 올라간다. 한 번은 운이다** (6.2) */
function rungOk(){
  var d=DATA.ladder, r=rungNow(); if(!d||!r) return;
  var top=(d.steps||[]).length-1;
  r.run++; r.miss=0; r.at=today();
  if(r.run>=d.up){
    r.run=0;
    if(r.i<top){ r.i++; flash("한 칸 올라간다"); }
    else flash("이 자리는 굳었다");
  }
  rungSet(r); renderLadder(); renderRung();
}
/* 안 됐다. **한 번 안 된 것으로 안 내린다. 그것도 운이다** (6.3) */
function rungNo(){
  var d=DATA.ladder, r=rungNow(); if(!d||!r) return;
  r.run=0; r.miss++; r.at=today();
  if(r.miss>=d.down){
    r.miss=0;
    /* **내리는 것이 벌이 아니라는 것을 화면이 말한다** (6.3 표) */
    if(r.i>0){ r.i--; flash(d.downSay); }
  }
  rungSet(r); renderLadder(); renderRung();
}
function renderRung(){
  var box=$("#cRung"); if(!box) return;
  var d=DATA.ladder, r=rungNow();
  if(!d||!r){ box.hidden=true; box.innerHTML=""; return; }
  box.hidden=false;
  var st=(d.steps||[])[r.i]||{};
  var say=el("div","small mut");
  /* **연달아 몇 번인지는 적는다.** 다음에 무엇을 하는지가 거기서 나온다.
     몇 번 만에 올라갔는지는 안 적는다. 그것이 성적이다 (6.5). */
  say.textContent="이 파일은 "+(st.name||"")+" 칸 · 연달아 "+r.run+"번 "+
    "("+d.up+"번이면 올라간다)"+(r.at?" · 마지막 "+r.at:"");
  box.innerHTML=""; box.appendChild(say);
  var row=el("div","row");
  var ok=el("button","b","됐다"); ok.type="button"; ok.onclick=rungOk;
  var no=el("button","g","안 됐다"); no.type="button"; no.onclick=rungNo;
  row.appendChild(ok); row.appendChild(no); box.appendChild(row);
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
