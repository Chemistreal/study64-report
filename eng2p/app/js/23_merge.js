/* =========================================================================
   합치기. **덮는 것이 아니다.**

   `docs/merge.md` 가 갈래 넷을 정했다.

     안 건너감   이 기기 것을 그대로 둔다
     큰 것       둘 중 큰 값. 안 한 쪽이 0이다
     모음        둘을 합치고 겹친 것을 뺀다
     물음        자동으로 안 정한다. 사람이 고른다

   **넷째가 이 파일의 값이다.** 자동으로 못 정하는 것을 자동으로 정하면
   그것은 합치기가 아니라 조용한 덮기다. 조용하다는 것만 다르다.

   여기서는 셈만 한다. 화면은 안 그리고 저장도 안 한다.
   **무엇이 될지를 먼저 돌려주고 바꾸는 것은 사람이 누른 다음이다.**
   ========================================================================= */

/* 안 건너가는 것. `docs/pair.md` 3장이 정했다. **여기에 안 늘린다.** */
var MG_LOCAL=["device","fs","session","card","wk","cardMode","rate",
              "recOpen","emgOpen","onboarded"];
/* 그날 기록 안에서 큰 것을 남기는 자리 */
var MG_MAXDAY=["speak","cards","lre","h"];
/* 그날 기록 안에서 모으는 자리 */
var MG_BAGDAY=["unres","coll"];
/* 그날 기록 안에서 묻는 자리. 자리마다 안쪽 칸이 있다 */
var MG_ASKDAY=["aim","xchk"];

function mgNum(v){ var n=+v; return isFinite(n)?n:0; }
function mgBig(a,b){ return mgNum(a)>=mgNum(b)?mgNum(a):mgNum(b); }
/* 값이 있는가. 0과 빈 글자와 빈 모음은 없는 것으로 본다.
   **없는 자리를 채우는 것은 안 묻는다.** 그것은 고를 것이 없는 일이다. */
function mgHas(v){
  if(v==null) return false;
  if(typeof v==="string") return v.trim().length>0;
  if(Array.isArray(v)) return v.length>0;
  if(typeof v==="object") return Object.keys(v).length>0;
  return v!==0 && v!==false;
}
/* 글자가 같으면 같은 것으로 본다. 사람이 같은 것을 조금 다르게 적으면 둘 다 남는다.
   **지우는 것보다 두 번 적히는 것이 낫다.** */
function mgBag(a,b,key){
  a=Array.isArray(a)?a:[]; b=Array.isArray(b)?b:[];
  var seen={}, out=[];
  a.concat(b).forEach(function(x){
    var k=key?key(x):(typeof x==="string"?x:JSON.stringify(x));
    if(seen[k]) return;
    seen[k]=1; out.push(x);
  });
  return out;
}

/* 물음 하나. 어느 쪽을 고를지 사람이 정한다.

   **자리를 글자로 쪼개지 않는다.** `days.2026-01-05.aim.a` 를 점으로 쪼개면
   자리 이름에 점이 들어오는 날 조용히 엉뚱한 데를 쓴다.
   지금 자리 이름에는 점이 없지만 없다는 것을 매번 확인하며 살 수는 없다.
   `at` 이 자리를 배열로 들고 `path` 는 사람에게 보이는 이름표로만 쓴다. */
function mgAsk(list,at,what,mine,theirs){
  list.push({path:at.join("."), at:at, what:what, mine:mine, theirs:theirs});
}
/* 사람에게 보이는 이름. **키 이름을 그대로 보이면 안 된다.**
   두 사람은 영어 제로고 `aim` 이 무엇인지 알 길이 없다. */
var MG_KO={aim:"블록 1과 4에 적은 것", xchk:"블록 2 상호 검토",
           normal:"정상", emg:"비상판", absent:"결석"};
function mgKo(v){ return MG_KO[v]||v; }
/* 보인 말을 저장소 말로 되돌린다. **보인 것을 그대로 넣으면 상태가 한국어가 된다.** */
function mgBack(v){
  for(var k in MG_KO) if(MG_KO[k]===v && (k==="normal"||k==="emg"||k==="absent")) return k;
  return v;
}

/* 두 기록을 견줘 **무엇이 될지**와 **무엇을 물어야 하는지**를 돌려준다.
   저장은 안 한다. 부르는 쪽이 사람에게 보이고 나서 정한다. */
function mergePlan(mine, theirs){
  var out=JSON.parse(JSON.stringify(mine));
  var ask=[], add={days:0, unres:0, coll:0, rot:0, clips:0};

  /* 안 건너가는 것은 손대지 않는다. out 이 mine 을 베낀 것이라 그대로다. */

  /* 이름과 시작일. 한 번만 맞추면 되는 값이라 다르면 묻는다. */
  if(mgHas(theirs.start) && theirs.start!==mine.start)
    mgAsk(ask,["start"],"시작일",mine.start,theirs.start);
  ["a","b"].forEach(function(k){
    var m=(mine.names||{})[k], t=(theirs.names||{})[k];
    if(mgHas(t) && mgHas(m) && m!==t)
      mgAsk(ask,["names",k],"사람 "+(k==="a"?1:2)+" 이름",m,t);
    else if(mgHas(t) && !mgHas(m)) out.names[k]=t;
  });

  /* 날마다. **상대에게만 있는 날은 그대로 가져온다.** 날을 새로 만들지는 않는다. */
  var td=theirs.days||{}, md=mine.days||{};
  for(var d in td){
    var t=td[d], m=md[d];
    if(!m){ out.days[d]=JSON.parse(JSON.stringify(t)); add.days++; continue; }
    var o=out.days[d];
    MG_MAXDAY.forEach(function(k){
      if(t[k]!=null || m[k]!=null) o[k]=mgBig(m[k],t[k]);
    });
    MG_BAGDAY.forEach(function(k){
      var was=(m[k]||[]).length;
      o[k]=mgBag(m[k],t[k]);
      add[k]+=o[k].length-was;
    });
    if(mgHas(t.status) && !mgHas(m.status)) o.status=t.status;
    else if(mgHas(t.status) && mgHas(m.status) && t.status!==m.status)
      mgAsk(ask,["days",d,"status"],d+" 그날 상태",mgKo(m.status),mgKo(t.status));
    MG_ASKDAY.forEach(function(k){
      var tv=t[k]||{}, mv=m[k]||{};
      for(var c in tv){
        if(!mgHas(tv[c])) continue;
        if(!mgHas(mv[c])){ o[k]=o[k]||{}; o[k][c]=tv[c]; continue; }
        if(String(mv[c])!==String(tv[c]))
          mgAsk(ask,["days",d,k,c],d+" "+mgKo(k)+" ("+c.toUpperCase()+")",mv[c],tv[c]);
      }
    });
  }

  /* 과와 회차. 진도는 뒤로 안 간다. */
  var tm=theirs.media||{};
  ["done","pass","fav"].forEach(function(k){
    var s=tm[k]||{}; out.media[k]=out.media[k]||{};
    for(var id in s){
      var a=out.media[k][id], b=s[id];
      if(typeof b==="number"||typeof a==="number") out.media[k][id]=mgBig(a,b);
      else if(!mgHas(a)) out.media[k][id]=b;
    }
  });
  /* 강의 회차는 media.lec 안에 있다. 같은 규칙이다. */
  if(tm.lec){
    out.media.lec=out.media.lec||{};
    for(var no in tm.lec) out.media.lec[no]=mgBig(out.media.lec[no], tm.lec[no]);
  }

  /* 카드 간격. **늦은 날짜를 남긴다.** 늦다는 것은 누군가 그 카드를 돌렸다는 뜻이다. */
  var tc=theirs.cardDue||{};
  out.cardDue=out.cardDue||{};
  for(var cid in tc){
    var was=out.cardDue[cid];
    if(!was || String(tc[cid])>String(was)) out.cardDue[cid]=tc[cid];
  }

  /* 모으는 것들 */
  var n0=(out.rot||[]).length;
  out.rot=mgBag(mine.rot, theirs.rot, function(x){ return x.d+"|"+JSON.stringify(x); });
  add.rot=out.rot.length-n0;
  var c0=(out.clips||[]).length;
  out.clips=mgBag(mine.clips, theirs.clips, function(x){ return x.f+"|"+x.a+"|"+x.b; });
  add.clips=out.clips.length-c0;
  var ts=theirs.scripts||{};
  out.scripts=out.scripts||{};
  for(var f in ts){
    var have=(out.scripts[f]||[]).length;
    if(ts[f].length>have) out.scripts[f]=ts[f];
  }

  /* 주간 점검과 분기 판정과 어림 고침. 셋 다 **없으면 채우고 다르면 묻는다.** */
  var tw=theirs.wchk||{};
  out.wchk=out.wchk||{};
  for(var w in tw){
    if(!mgHas(out.wchk[w])){ out.wchk[w]=tw[w]; continue; }
    if(JSON.stringify(out.wchk[w])!==JSON.stringify(tw[w]))
      mgAsk(ask,["wchk",w],w+"주 점검",out.wchk[w],tw[w]);
  }
  var tq=theirs.q||{};
  out.q=out.q||{};
  for(var qk in tq){
    if(!mgHas(out.q[qk])){ out.q[qk]=tq[qk]; continue; }
    if(JSON.stringify(out.q[qk])!==JSON.stringify(tq[qk]))
      mgAsk(ask,["q",qk],qk+" 판정",out.q[qk],tq[qk]);
  }
  var tu=theirs.cues||{};
  out.cues=out.cues||{};
  for(var mid in tu){
    out.cues[mid]=out.cues[mid]||{};
    for(var ln in tu[mid]){
      if(!mgHas(out.cues[mid][ln])){ out.cues[mid][ln]=tu[mid][ln]; continue; }
      if(out.cues[mid][ln]!==tu[mid][ln])
        mgAsk(ask,["cues",mid,ln],mid+" "+ln+"째 줄 시각",
              out.cues[mid][ln],tu[mid][ln]);
    }
  }

  /* **안 건너가는 것을 되돌려 놓는다.** out 이 mine 을 베낀 것이라 이미 그대로지만
     그것은 위쪽 아무 줄도 그 자리를 안 건드린다는 뜻이고, 그 사실은 다음에 한 줄을
     보태면 깨진다. 목록으로 못 박는다. 목록이 있는데 안 쓰면 목록이 아니라 주석이다. */
  MG_LOCAL.forEach(function(k){ out[k]=mine[k]; });

  return {out:out, ask:ask, add:add};
}

/* 사람이 고른 것을 적용한다. `pick` 은 {path:"mine"|"theirs"} 다.
   **다 고르기 전에는 안 넘긴다.** 하나라도 안 고르면 그 자리가 조용히 내 것이 된다. */
function mergeApply(plan, pick){
  var left=plan.ask.filter(function(q){ return pick[q.path]!=="mine" && pick[q.path]!=="theirs"; });
  if(left.length) return {err:"아직 안 고른 것이 "+left.length+"개다", left:left};
  var out=JSON.parse(JSON.stringify(plan.out));
  plan.ask.forEach(function(q){
    if(pick[q.path]!=="theirs") return;
    var p=q.at, at=out;
    for(var i=0;i<p.length-1;i++){
      if(at[p[i]]==null) at[p[i]]={};
      at=at[p[i]];
    }
    /* 그날 상태는 사람 말로 보였다. 넣을 때는 저장소 말로 되돌린다. */
    at[p[p.length-1]]=(p[p.length-1]==="status") ? mgBack(q.theirs) : q.theirs;
  });
  return {ok:true, out:out};
}

/* =========================================================================
   합치기 화면. **바꾸기 전에 무엇이 바뀌는지를 보인다.**

   가져오기는 누르고 나서 보였다. 무엇이 덮였는지는 덮은 뒤에야 보인다 (T184).
   합치기는 누르기 전에 보인다. 그것이 이 화면의 값이다.
   ========================================================================= */
var MG={plan:null, pick:{}, name:""};

function mgText(v){
  if(v==null) return "(없음)";
  if(typeof v==="object") return JSON.stringify(v);
  return String(v);
}
function renderMerge(){
  var box=$("#mgBox"); if(!box) return;
  if(!MG.plan){ box.hidden=true; box.innerHTML=""; return; }
  box.hidden=false;
  var p=MG.plan, a=p.add;
  var h='<h4 style="margin:0 0 8px">합치기: '+esc(MG.name)+'</h4>';
  h+='<div class="small mut">아직 안 바꿨다. 아래를 보고 정한다.</div>';
  /* **늘어나는 것을 먼저 보인다.** 합치기가 지우지 않는다는 것이 여기서 보인다. */
  var got=[["날",a.days],["미해결",a.unres],["채집",a.coll],
           ["회전 등록",a.rot],["클립 구간",a.clips]]
          .filter(function(x){ return x[1]>0; });
  h+='<div class="note g" style="margin-top:10px">'+
     (got.length ? "늘어난다: "+got.map(function(x){return x[0]+" "+x[1];}).join(", ")
                 : "상대에게만 있는 것이 없다. 셈만 맞춰진다")+'</div>';
  if(!p.ask.length){
    h+='<div class="note" style="margin-top:8px">고를 것이 없다. 부딪치는 자리가 없다.</div>';
  }else{
    h+='<div class="note w" style="margin-top:8px"><b>고를 것이 '+p.ask.length+
       '개다.</b> 둘 다 값이 있고 서로 다른 자리다. '+
       '기계가 어느 쪽이 맞는지 모른다. <b>다 고르기 전에는 안 바뀐다.</b></div>';
    h+='<table class="mgtab"><tr><th>무엇</th><th>이 기기</th><th>가져온 것</th></tr>';
    p.ask.forEach(function(q,i){
      var mk=MG.pick[q.path]==="mine", tk=MG.pick[q.path]==="theirs";
      h+='<tr><td>'+esc(q.what)+'</td>'+
         '<td><button class="mgpick'+(mk?" on":"")+'" data-i="'+i+'" data-s="mine">'+
         esc(mgText(q.mine))+'</button></td>'+
         '<td><button class="mgpick'+(tk?" on":"")+'" data-i="'+i+'" data-s="theirs">'+
         esc(mgText(q.theirs))+'</button></td></tr>';
    });
    h+='</table>';
  }
  h+='<div class="row" style="margin-top:12px">'+
     '<button class="g" id="mgGo">합친다</button>'+
     '<button class="g" id="mgNo">그만둔다</button></div>';
  h+='<div id="mgMsg" class="small mut"></div>';
  box.innerHTML=h;
  box.querySelectorAll(".mgpick").forEach(function(btn){
    btn.onclick=function(){
      MG.pick[p.ask[+btn.dataset.i].path]=btn.dataset.s;
      renderMerge();
    };
  });
  $("#mgNo").onclick=function(){ MG.plan=null; MG.pick={}; renderMerge(); };
  $("#mgGo").onclick=function(){
    var r=mergeApply(MG.plan, MG.pick);
    if(!r.ok){ $("#mgMsg").textContent=r.err+". 그 줄에서 한쪽을 누른다"; return; }
    /* 되돌릴 수 있게 해 둔다. T184 가 가져오기에 붙인 것과 같은 장치다. */
    var before=JSON.stringify(S);
    S=r.out; var b=blank(); for(var k in b) if(!(k in S)) S[k]=b[k];
    saveNow(); MG.plan=null; MG.pick={};
    renderToday(); renderLedger(); renderWeekCheck(); renderPair(); renderMerge();
    offerUndo("기록을 합쳤다",function(){
      S=JSON.parse(before); saveNow();
      renderToday(); renderLedger(); renderWeekCheck(); renderPair();
    });
  };
}
