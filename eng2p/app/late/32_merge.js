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
              "recOpen","emgOpen","onboarded",
              /* 돌려 보기는 이 기기의 일이다. 기기가 둘인 쪽 파일을 받아도 안 바뀐다. T241 */
              "solo","soloSeat","soloHand","veiled",
              /* 판의 회 번호와 지난번 자리. 각자 세는 값이다 (T247) */
              "rstep","rseat",
              /* 판의 그날 셈. **아직 안 건너간다.** 판정은 읽은 사람이 하고
                 읽는 자리가 판 안에서 바뀌므로 한 기기에는 절반만 있다.
                 절반과 절반을 더하는 규칙은 T320 이 정한다. 그 전에 합치면
                 절반을 온것으로 여기게 된다. 그것이 제일 나쁘다. T259 */
              "rhit"];
/* 그날 기록 안에서 큰 것을 남기는 자리 */
/* `one` 은 0 아니면 1이다. 큰 것을 남기면 **한쪽만 열었어도 연 날이 된다.**
   둘이 같이 여는 판이고 한쪽만 누른 것뿐이다 (T325). */
var MG_MAXDAY=["speak","cards","lre","h","one"];
/* 그날 기록 안에서 모으는 자리 */
var MG_BAGDAY=["unres","coll"];
/* 그날 기록 안에서 묻는 자리. 자리마다 안쪽 칸이 있다 */
var MG_ASKDAY=["aim","xchk"];

function mgNum(v){ var n=+v; return isFinite(n)?n:0; }
function mgBig(a,b){ return mgNum(a)>=mgNum(b)?mgNum(a):mgNum(b); }
/* 카드 하나를 합친다. **늦게 돈 쪽이 상자와 다음 차례를 준다.**
   돈 날은 어느 쪽에 있든 다 남긴다. 한쪽만 돌린 날이 있으면 그 날도 돈 날이다. */
/* 사람별로 갈린 뒤에도 규칙은 그대로다 (T358).
   갈래마다 따로 합친다. **글이 아니라 날짜라 이을 수 있다** (T340).
   한쪽 기기에만 있는 갈래는 그대로 가져온다. 묻는 것이 안 는다. */
function mgCardSide(a,b){
  var A=mgCardOld(a), B=mgCardOld(b);
  if(!A) return B; if(!B) return A;
  var out={};
  ["a","b"].forEach(function(k){ out[k]=mgCardOne(A[k],B[k]); });
  return out;
}
/* 옛 꼴을 새 꼴로. `06_cards.js` 의 `cardSplit` 과 같은 규칙이다.
   합치기는 앱과 따로 돌 수 있어서 여기에도 있어야 한다. */
function mgCardOld(c){
  if(!c) return null;
  if(c.a!==undefined || c.b!==undefined) return c;
  var one={box:c.box, due:c.due, ran:c.ran, hist:(c.hist||[]).slice()};
  return {a:one, b:{box:one.box, due:one.due, ran:one.ran, hist:one.hist.slice()}};
}
function mgCardOne(a,b){
  if(!a) return b; if(!b) return a;
  var late=(String(b.ran||"")>String(a.ran||"")) ? b : a, seen={};
  [a,b].forEach(function(x){
    var h=(x.hist && x.hist.length) ? x.hist : (x.ran ? [x.ran] : []);
    h.forEach(function(d){ seen[d]=1; });
  });
  return {box:late.box, due:late.due, ran:late.ran, hist:Object.keys(seen).sort()};
}
function mgCard(a,b){ return mgCardSide(a,b); }
/* 값이 있는가. 0과 빈 글자와 빈 모음은 없는 것으로 본다.
   **없는 자리를 채우는 것은 안 묻는다.** 그것은 고를 것이 없는 일이다. */
/* 두 기기에 다르게 적힌 글을 잇는다 (T340). **덮지 않고 잇는다.**
   두 번 합쳐도 같아야 한다. 이미 든 글이면 안 덧붙인다. */
function mgJoin(a,b){
  if(!a) return b;
  if(!b || a===b) return a;
  if(a.indexOf(b)>=0) return a;
  return a+"\n[저쪽 기기] "+b;
}
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
           normal:"정상", emg:"비상판", absent:"결석",
           speak:"발화 분", cards:"드릴 장수", lre:"LRE 횟수", h:"시간",
           pass:"통과 회차", done:"돈 횟수", fav:"즐겨찾기"};
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
  var ask=[], chg=[], add={days:0, unres:0, coll:0, rot:0, clips:0};
  /* **늘어나는 것만 보이면 모자란다.** 발화 분이 12에서 99로 뛰는 것은
     아무것도 안 늘어나지만 대장이 통째로 달라진다.
     늘어나는 것과 바뀌는 것은 다른 일이라 따로 센다.
     안 세면 화면이 "바뀔 것이 없다" 와 "숫자가 뛴다" 를 같은 말로 한다. T238 */
  function note(what,from,to){ if(from!==to) chg.push({what:what, from:from, to:to}); }

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
      if(t[k]==null && m[k]==null) return;
      var was=o[k];
      o[k]=mgBig(m[k],t[k]);
      note(d+" "+(MG_KO[k]||k), mgNum(was), o[k]);
    });
    MG_BAGDAY.forEach(function(k){
      var was=(m[k]||[]).length;
      o[k]=mgBag(m[k],t[k]);
      add[k]+=o[k].length-was;
    });
    /* **상태가 조용히 바뀌고 있었다.** 빈 자리를 채우는 것은 안 묻는 것이 맞는데
       (`docs/merge.md` 3.4) 안 묻는 것과 안 보이는 것은 다르다.
       그날 상태는 진도를 정하는 값이다. 그것이 바뀌는데 화면이 아무 말도 안 했다.
       두 화면을 나란히 읽다가 보였다. 합치기 칸이 "부딪치는 자리가 없다" 라고만
       적고 넘어갔고 실제로는 기록 없음이 정상으로 바뀌고 있었다. T255 */
    if(mgHas(t.status) && !mgHas(m.status)){
      o.status=t.status;
      note(d+" 그날 상태", "기록 없음", mgKo(t.status));
    }
    else if(mgHas(t.status) && mgHas(m.status) && t.status!==m.status)
      mgAsk(ask,["days",d,"status"],d+" 그날 상태",mgKo(m.status),mgKo(t.status));
    MG_ASKDAY.forEach(function(k){
      var tv=t[k]||{}, mv=m[k]||{};
      for(var c in tv){
        if(!mgHas(tv[c])) continue;
        if(!mgHas(mv[c])){
          o[k]=o[k]||{}; o[k][c]=tv[c];
          /* 빈 칸이 글로 채워지는 것도 바뀌는 것이다. 안 적으면 조용히 들어온다. */
          note(d+" "+mgKo(k)+" ("+c.toUpperCase()+")", "(빈 칸)", "채워진다");
          continue;
        }
        /* **글은 안 묻고 둘 다 남긴다** (T340).

           전에는 여기서 물었다. 1년을 따로 돌고 합치면 **물음이 288개**가 난다.
           하나씩 고르는 것은 아무도 못 하고 그 288 중 하나를 잘못 고르면
           그날 적은 글이 없어진다. 합치기는 **덮는 것이 아니다** (merge.md).

           둘 다 남기면 아무것도 안 잃는다. 지우는 것은 사람이 나중에 하면 되고
           그것은 되돌릴 수 있다. 고르는 것은 그 자리에서 하나를 버리는 일이다. */
        if(String(mv[c])!==String(tv[c])){
          var both=mgJoin(String(mv[c]), String(tv[c]));
          if(both!==String(mv[c])){
            o[k]=o[k]||{}; o[k][c]=both;
            note(d+" "+mgKo(k)+" ("+c.toUpperCase()+")","한 기기 것","둘 다 남긴다");
          }
        }
      }
    });
  }

  /* 과와 회차. 진도는 뒤로 안 간다. */
  var tm=theirs.media||{};
  /* **`pass` 는 셈이 아니라 회차 켜짐표다.** `{1:true,2:true,3:true}` 꼴이다.
     셈으로 다루면 빈 표를 빈 표로 덮으면서 "바뀐다" 고 적는다. 실제로 그랬다. T238
     회차마다 켜짐을 모은다. 한쪽에서 켰으면 켜진 것이다. 진도는 뒤로 안 간다. */
  ["done","pass","fav"].forEach(function(k){
    var s=tm[k]||{}; out.media[k]=out.media[k]||{};
    for(var id in s){
      var a=out.media[k][id], b=s[id], ko=id+" "+(MG_KO[k]||k);
      if(typeof b==="number"||typeof a==="number"){
        var was=mgNum(a); out.media[k][id]=mgBig(a,b); note(ko, was, out.media[k][id]);
      }else if(b && typeof b==="object"){
        /* 회차 켜짐표. 켠 것을 끄지 않는다. */
        var cur=(a&&typeof a==="object")?a:{}, on=[];
        out.media[k][id]=cur;
        for(var rk in b){
          if(b[rk] && !cur[rk]){ cur[rk]=b[rk]; on.push(rk); }
        }
        if(on.length) note(ko, "안 켜짐 "+on.join(","), "켜짐 "+on.join(","));
      }else if(!mgHas(a) && mgHas(b)){
        out.media[k][id]=b; note(ko, "(없음)", String(b));
      }
    }
  });
  /* 강의 회차는 media.lec 안에 있다. 같은 규칙이다. */
  if(tm.lec){
    out.media.lec=out.media.lec||{};
    for(var no in tm.lec){
      var was=mgNum(out.media.lec[no]);
      out.media.lec[no]=mgBig(was, tm.lec[no]);
      note(no+"강 끝낸 회차", was, out.media.lec[no]);
    }
  }

  /* 카드 간격. **늦게 돈 쪽을 남기고 돈 날은 합친다** (T312).

     전에는 `String(tc[cid]) > String(was)` 로 견줬다. 둘 다 객체라
     `"[object Object]"` 가 되고 **그 비교는 늘 거짓이었다.**
     그래서 한쪽에만 있는 카드만 건너갔다. 늦은 날짜를 남긴다고 적어 놓고 안 남겼다.
     **적어 놓은 것과 도는 것이 달랐고 아무도 안 봤다.** */
  var tc=theirs.cardDue||{};
  out.cardDue=out.cardDue||{};
  for(var cid in tc){
    var was=out.cardDue[cid], got=mgCard(was, tc[cid]);
    if(JSON.stringify(got)!==JSON.stringify(was)){
      out.cardDue[cid]=got;
      note(cid+" 다음 차례", (was&&was.due)||"(없음)", got.due||"(없음)");
    }
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

  return {out:out, ask:ask, chg:chg, add:add};
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
/* 고를 것이 이만큼을 넘으면 하나씩 안 묻는다 (T340). 표도 여기까지만 그린다 */
var MG_MANY=20;
var MG={plan:null, pick:{}, name:""};

function mgText(v){
  if(v==null) return "(없음)";
  if(typeof v==="object") return JSON.stringify(v);
  return String(v);
}
/* **세션 중에는 안 합친다.**

   블록 칸이 그날 기록을 들고 있다. 합치면 그 기록이 밑에서 바뀌는데
   블록 칸은 다시 안 그려진다. 그 상태에서 블록 3이 돈 카드 수를 적으면
   화면에 남아 있던 옛 값이 합친 값 위에 덮인다. T216 에 겪은 그 자리다.

   두 시간 중에 합칠 이유도 없다. 짝을 맞추는 자리는 세션이 끝난 뒤다 (10.11). */
function mergeBusy(){ return typeof T!=="undefined" && T.run; }

/* 파일 고르는 자리도 여기서 든다 (T396). 전에는 `11_ledger.js` 에 있었는데
   그것은 열자마자 읽는 조각이고 거기서 `mergePlan` 을 이름으로 불렀다.
   **아직 없는 함수를 부르는 자리**가 되므로 단추째로 옮겼다.
   이 자리는 `renderMerge()` 가 그릴 때 붙으므로 그때는 이미 다 읽혀 있다. */
function mergeBind(){
  var b=$("#mgBtn"); if(!b || b.dataset.bound) return;
  b.dataset.bound="1";
  b.onclick=function(){ $("#mgFile").click(); };
  $("#mgFile").onchange=function(e){
    var f=e.target.files[0]; if(!f) return;
    var r=new FileReader();
    r.onload=function(){
      try{
        var o=JSON.parse(r.result);
        if(!o.days) throw 0;
        MG.plan=mergePlan(S,o); MG.pick={}; MG.name=f.name;
        renderMerge();
        $("#mgBox").scrollIntoView({block:"nearest"});
      }catch(err){ alert("JSON 형식이 아니다."); }
    };
    r.readAsText(f); e.target.value="";
  };
}

function renderMerge(){
  mergeBind();
  var box=$("#mgBox"); if(!box) return;
  if(!MG.plan){ box.hidden=true; box.innerHTML=""; return; }
  box.hidden=false;
  if(mergeBusy()){
    box.innerHTML='<div class="note w"><b>세션 중에는 안 합친다.</b> '+
      '블록 칸이 오늘 기록을 들고 있어서 밑에서 바꾸면 그 칸이 옛 값을 되쓴다. '+
      '세션을 끝내고 합친다.</div>'+
      '<div class="row" style="margin-top:12px"><button class="g" id="mgNo">닫는다</button></div>';
    $("#mgNo").onclick=function(){ MG.plan=null; MG.pick={}; renderMerge(); };
    return;
  }
  var p=MG.plan, a=p.add;
  var h='<h4 style="margin:0 0 8px">합치기: '+esc(MG.name)+'</h4>';
  h+='<div class="small mut">아직 안 바꿨다. 아래를 보고 정한다.</div>';
  /* **늘어나는 것을 먼저 보인다.** 합치기가 지우지 않는다는 것이 여기서 보인다. */
  var got=[["날",a.days],["미해결",a.unres],["채집",a.coll],
           ["회전 등록",a.rot],["클립 구간",a.clips]]
          .filter(function(x){ return x[1]>0; });
  /* **바뀌는 것이 없으면 없다고 말한다.** 전에는 이 자리가 "셈만 맞춰진다" 였는데
     그것은 아무것도 안 바뀌는 판과 숫자가 뛰는 판에 똑같이 나왔다. T238 */
  if(!got.length && !p.chg.length && !p.ask.length){
    h+='<div class="note g" style="margin-top:10px">'+
       '바뀌는 것이 없다. 두 기기가 이미 같다.</div>';
    h+='<div class="row" style="margin-top:12px">'+
       '<button class="g" id="mgNo">닫는다</button></div>';
    h+='<div id="mgMsg" class="small mut"></div>';
    box.innerHTML=h;
    $("#mgNo").onclick=function(){ MG.plan=null; MG.pick={}; renderMerge(); };
    return;
  }
  if(got.length)
    h+='<div class="note g" style="margin-top:10px">늘어난다: '+
       esc(got.map(function(x){return x[0]+" "+x[1];}).join(", "))+'</div>';
  /* 바뀌는 셈. **열 줄까지만 적고 나머지는 몇 개인지만 말한다.**
     48주를 합치면 수백 줄이 되고 그러면 아무도 안 읽는다. */
  if(p.chg.length){
    h+='<div class="note" style="margin-top:8px"><b>바뀐다.</b><br>'+
       p.chg.slice(0,10).map(function(c){
         return esc(c.what)+": "+esc(String(c.from))+" \u2192 "+esc(String(c.to));
       }).join("<br>");
    if(p.chg.length>10) h+='<br>그리고 '+(p.chg.length-10)+'개 더';
    h+='</div>';
  }
  if(!p.ask.length){
    h+='<div class="note" style="margin-top:8px">고를 것이 없다. 부딪치는 자리가 없다.</div>';
  }else{
    h+='<div class="note w" style="margin-top:8px"><b>고를 것이 '+p.ask.length+
       '개다.</b> 둘 다 값이 있고 서로 다른 자리다. '+
       '기계가 어느 쪽이 맞는지 모른다. <b>다 고르기 전에는 안 바뀐다.</b></div>';
    /* **많으면 하나씩 안 고른다** (T340). 1년을 따로 돌고 합치면 여기가 수백 줄이 된다.
       하나씩 고르라고 하면 아무도 안 하고 그러면 합치기가 통째로 안 돌아간다.
       그때는 통째로 한쪽을 고르는 것이 맞다. **어느 기기가 더 오래 돌았는가**가
       그 판단이고 그것은 두 사람이 안다. */
    if(p.ask.length>MG_MANY)
      h+='<div class="note" style="margin-top:8px">'+
         '<b>두 기기가 오래 떨어져 있었다.</b> 이만큼을 하나씩 고르는 것은 못 한다. '+
         '<b>통째로 한쪽을 고른다.</b> 더 오래 돌린 기기 쪽이 대개 맞다. '+
         '고른 뒤에 아래 표에서 몇 개만 다시 바꿔도 된다.</div>';
    h+='<div class="row" style="gap:8px;margin-top:8px">'+
       '<button class="g" id="mgAllM">다 이 기기 것으로</button>'+
       '<button class="g" id="mgAllT">다 가져온 것으로</button>'+
       '<button class="g" id="mgClr">고른 것 지우기</button>'+
       '<span class="small mut" id="mgPicked">'+
       Object.keys(MG.pick).length+' / '+p.ask.length+' 골랐다</span></div>';
    h+='<table class="mgtab"><tr><th scope="col">무엇</th><th scope="col">이 기기</th><th scope="col">가져온 것</th></tr>';
    /* 표는 스무 줄까지만 그린다. 바뀌는 셈을 열 줄까지만 적는 것과 같은 이유다 */
    p.ask.slice(0,MG_MANY).forEach(function(q,i){
      var mk=MG.pick[q.path]==="mine", tk=MG.pick[q.path]==="theirs";
      h+='<tr><td>'+esc(q.what)+'</td>'+
         '<td><button class="mgpick'+(mk?" on":"")+'" data-i="'+i+'" data-s="mine">'+
         esc(mgText(q.mine))+'</button></td>'+
         '<td><button class="mgpick'+(tk?" on":"")+'" data-i="'+i+'" data-s="theirs">'+
         esc(mgText(q.theirs))+'</button></td></tr>';
    });
    h+='</table>';
    if(p.ask.length>MG_MANY)
      h+='<div class="small mut">그리고 '+(p.ask.length-MG_MANY)+
         '개 더. 위의 통째 고르기가 그것까지 다 정한다.</div>';
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
  /* 통째 고르기 (T340). **지우는 자리도 같이 둔다.** 잘못 누르면 되돌려야 한다 */
  function mgAll(side){
    p.ask.forEach(function(q){ MG.pick[q.path]=side; });
    renderMerge();
  }
  if($("#mgAllM")) $("#mgAllM").onclick=function(){ mgAll("mine"); };
  if($("#mgAllT")) $("#mgAllT").onclick=function(){ mgAll("theirs"); };
  if($("#mgClr")) $("#mgClr").onclick=function(){ MG.pick={}; renderMerge(); };
  $("#mgNo").onclick=function(){ MG.plan=null; MG.pick={}; renderMerge(); };
  $("#mgGo").onclick=function(){
    /* 화면을 띄운 뒤에 세션이 시작될 수 있다. **누르는 그 순간에 다시 본다.** */
    if(mergeBusy()){ renderMerge(); return; }
    var r=mergeApply(MG.plan, MG.pick);
    if(!r.ok){ $("#mgMsg").textContent=r.err+". 그 줄에서 한쪽을 누른다"; return; }
    /* 되돌릴 수 있게 해 둔다. T184 가 가져오기에 붙인 것과 같은 장치다. */
    var before=JSON.stringify(S);
    S=r.out; var b=blank(); for(var k in b) if(!(k in S)) S[k]=b[k];
    saveNow(); MG.plan=null; MG.pick={};
    renderToday(); renderLedger(); lateDo("renderWeekCheck"); renderPair(); renderMerge();
    offerUndo("기록을 합쳤다",function(){
      S=JSON.parse(before); saveNow();
      renderToday(); renderLedger(); lateDo("renderWeekCheck"); renderPair();
    });
  };
}
