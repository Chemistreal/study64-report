/* =========================================================================
   카드 뷰어. 블록 3에서 그날 카드 범위를 한 장씩 돈다.
   **기준서가 정한 것 하나가 여기서 화면 규칙이 된다. 판정형 정답은 A면에만 있다.**
   한 기기에 A면과 B면을 같이 띄우면 그 규칙이 화면에서 깨진다.
   기기 쪽을 안 고르면 A면을 보여 준다. 블록 3에서 B 는 카드를 안 본다.
   ========================================================================= */
function cardKey(){ var pl=plan(); return today()+"|"+(pl.cards?pl.cards.from:0)+"|"+(S.cardMode||"today"); }
function cardIdx(){
  var k=cardKey();
  if(!S.card || S.card.k!==k) S.card={k:k, i:0};
  return S.card.i;
}
function setCardIdx(i){ S.card={k:cardKey(), i:i}; save(); renderBlockPane(); }


/* =========================================================================
   카드 간격 반복. 강의가 정한 간격을 쓴다.
   96편이 블록 4에 한 문장씩 적고 있다. 88편이 1일 3일 7일이고
   86 90 92 95강이 30일, 96강이 60일, 48 70 72강은 다시 안 돈다.
   **앱이 간격을 새로 정하지 않는다.** 강의가 정한 값을 그대로 쓴다.
   ========================================================================= */
function cardDue(){ if(!S.cardDue) S.cardDue={}; return S.cardDue; }

/* 카드 간격을 사람별로 (T358). `docs/cards_person.md` 가 규격이다.

   ## 왜 갈랐나

   페어 드릴은 한 사람이 묻고 한 사람이 답한다. **답한 사람에게만 그 카드가 어렵다.**
   간격이 한 벌이면 한쪽이 못 맞힌 카드가 다른 쪽에게도 다시 온다.
   간격 반복이 그렇게 도는 장치라 그 어긋남은 시간이 갈수록 커진다.

   개정문 16번이 그 범위를 정했다. **막는 것은 값이 아니라 둘 사이의 우열이다.**
   그래서 쌓되 **한 화면에 나란히 안 놓는다.**

   ## 누구 것인가

   기기가 정해져 있으면 그 기기를 든 사람 것이다. 기기가 하나거나 안 정해졌으면
   **그날 답하는 쪽** 것이다. 페어 드릴에서 A가 묻고 B가 답한다 (매뉴얼 4장).

   ## 옛 기록을 안 버린다

   전에는 그 자리에 한 벌이 있었다. 갈래가 없는 옛 꼴을 만나면
   **둘 다에게 같은 값으로** 넣는다. 지금까지 둘이 같이 돈 것이라 그렇게 읽는 것이 맞다.
   **반만 고치면 옛 꼴과 새 꼴이 섞이고 그때 잃는 것이 1년치 간격이다.** */
function cardSide(){
  /* **자리가 아니라 사람이다** (T360 이 잡았다).
     처음에 `deviceSide()` 를 썼다. 그것은 **그날의 A/B 자리**고 날마다 뒤집힌다.
     그러면 같은 사람의 카드가 하루걸러 다른 갈래에 쌓인다.
     `devicePerson()` 이 이 기기를 쓰는 **사람**이다. 그것이 안 뒤집힌다. */
  var d=(typeof devicePerson==="function") ? devicePerson() : null;
  if(d==="a"||d==="b") return d;
  /* 기기를 안 골랐으면 그날 답하는 사람을 든다. 페어 드릴에서 B 자리가 답한다 */
  return roleOf(today())==="a" ? "b" : "a";
}
/* 옛 꼴을 새 꼴로. **한 번만 바꾸고 그 뒤로는 그대로 둔다** */
function cardSplit(c){
  if(!c) return {a:null, b:null};
  if(c.a!==undefined || c.b!==undefined) return c;
  var one={box:c.box, due:c.due, ran:c.ran, hist:(c.hist||[]).slice()};
  return {a:one, b:{box:one.box, due:one.due, ran:one.ran, hist:one.hist.slice()}};
}
function cardOne(id, side){
  var m=cardDue(), c=cardSplit(m[id]);
  m[id]=c;
  return c[side||cardSide()]||null;
}
function cardSet(id, rec, side){
  var m=cardDue(), c=cardSplit(m[id]);
  c[side||cardSide()]=rec; m[id]=c;
}
/* 카드 하나가 어느 강에 붙는지. 묶음의 주차 표에서 나온다.
   다시 낼 카드는 오늘 강의 것이 아니므로 이 값이 있어야 간격을 맞게 올린다. */
function cardLecture(id){
  if(!IDX) return null;
  var p=String(id).split("-"); if(p.length!==2) return null;
  var q=p[0], no=+p[1];
  /* 그 분기 조각을 아직 안 읽었으면 읽어 둔다. **이 함수는 답을 바로 내야 한다.**
     간격을 올리는 자리에서 부르는데 거기서 기다리면 카드가 멈춘다.
     그래서 지금은 못 찾았다고 하고 다음번에 찾는다. T245 */
  if(!haveQuarter(q)){ needQuarter(q); return null; }
  for(var i=0;i<IDX.weeks.length;i++){
    /* **`IDX.weeks` 에 구멍이 있다.** 읽은 분기 자리만 채워져 있다 (T245).
       구멍을 그냥 읽으면 undefined 에서 터진다. 리허설이 그것을 잡았다. */
    var w=IDX.weeks[i]; if(!w || w.quarter!==q) continue;
    for(var j=0;j<(w.lectures||[]).length;j++){
      var L=w.lectures[j];
      if(L.cards && no>=L.cards.from && no<=L.cards.to) return L.no;
    }
  }
  return null;
}
function spacingDays(no){
  var lec=DATA.lectures; if(!lec) return null;
  var L=(lec.items||[]).filter(function(x){return x.no===no;})[0];
  return (L && L.spacing && L.spacing.days && L.spacing.days.length) ? L.spacing.days : null;
}
/* 돈 날을 **여러 개** 남긴다 (T312).

   `ran` 은 마지막 한 번이다. 어제 그거 판이 어제와 사흘 전과 이레 전 것을 묻는데
   1일 간격 카드는 어제 돌면 오늘 다시 돈다. 그러면 `ran` 이 오늘로 덮이고
   **어제 돈 카드가 하나도 없게 된다.** 마지막만 남기면 지난 것을 못 찾는다.

   이레보다 오래된 날은 버린다. 이 판이 묻는 제일 먼 날이 이레 전이라
   그보다 오래된 것은 아무도 안 읽는다. 안 버리면 카드 600장에 날짜가 끝없이 쌓인다. */
function cardRanDays(cur, td){
  var h=(cur && cur.hist && cur.hist.length) ? cur.hist.slice()
      : (cur && cur.ran ? [cur.ran] : []);
  if(h.indexOf(td)<0) h.push(td);
  var keep=addDays(td,-7);
  return h.filter(function(d){ return d>=keep; }).sort();
}
/* 그날 돈 카드. **`ran` 하나로는 못 찾는다.** 위를 본다. */
function ranOn(d){
  var m=cardDue(), out=[];
  for(var k in m){
    var c=cardOne(k); if(!c) continue;
    var h=(c.hist && c.hist.length) ? c.hist : (c.ran ? [c.ran] : []);
    if(h.indexOf(d)>=0) out.push(k);
  }
  return out.sort();
}
function markCardRun(id, lectureNo){
  var days=spacingDays(lectureNo), td=today();
  var cur=cardOne(id), hist=cardRanDays(cur, td);
  if(!days){ cardSet(id,{box:0, due:null, ran:td, hist:hist}); save(); syncCardCount(); return; }
  var box=cur && cur.box ? cur.box : 0;
  if(box>=days.length){ cardSet(id,{box:box, due:null, ran:td, hist:hist}); save(); syncCardCount(); return; }
  cardSet(id,{box:box+1, due:addDays(td, days[box]), ran:td, hist:hist});
  save(); syncCardCount();
}
/* **오늘 돈 카드 수를 앱이 이미 알고 있다.** 그런데 대장은 손으로 받았다.
   `markCardRun` 이 카드마다 돈 날을 적어 두는데 그 수를 아무도 안 셌다.
   손으로 올리는 숫자는 언젠가 안 올라간다. 회전 대장에서 겪은 것과 같다.

   센 것보다 적게 적히는 일만 막는다. **종이로 더 돌았을 수 있어서 위로는 안 막는다.** T216 */
function ranToday(){
  var m=cardDue(), td=today(), n=0;
  for(var k in m){ var c=cardOne(k); if(c && c.ran===td) n++; }
  return n;
}
function syncCardCount(){
  var r=day(today()), n=ranToday();
  if(n>(r.cards||0)){ r.cards=n; save(); }
  return n;
}
/* 막힌 카드 (T359). **간격을 안 바꾼다.**

   강의가 간격을 정한다. 앱이 새로 정하지 않는다 (이 파일 머리말).
   그러니 막혔다고 다음 날짜를 당기지 않는다. 그것은 강의가 정한 값을 앱이 뒤집는 것이다.

   **대신 따로 모은다.** 막힌 카드가 한 덱이 되고 그 덱은 간격 밖에서 돈다.
   비상판 인출 10분이 그 자리다. 매뉴얼 11.2 가 그것을 인출이라고 부른다.

   ## 사람별이다

   막힌 것은 **답한 사람에게만** 막힌 것이다 (`docs/cards_person.md`).
   그러니 이 값도 사람별로 쌓이고 **한 화면에 둘을 나란히 안 놓는다.**

   ## 몇 번 막혔는지를 화면에 안 적는다

   세면 그것이 곧 빚이 된다 (원칙 4). 목록에서 앞에 오는 것으로만 쓴다. */
function markCardStuck(id){
  var cur=cardOne(id) || {box:0, due:null, ran:null, hist:[]};
  var n=(cur.stuck|0)+1;
  cardSet(id, {box:cur.box, due:cur.due, ran:cur.ran,
               hist:(cur.hist||[]).slice(), stuck:n});
  save();
}
function stuckCards(){
  var m=cardDue(), out=[];
  for(var k in m){ var c=cardOne(k); if(c && (c.stuck|0)>0) out.push([k, c.stuck|0]); }
  /* 많이 막힌 것이 앞에 온다. 같으면 번호 차례다. **무작위를 안 쓴다** */
  out.sort(function(a,b){ return b[1]-a[1] || (a[0]<b[0]?-1:1); });
  return out.map(function(x){ return x[0]; });
}
function clearCardStuck(id){
  var cur=cardOne(id); if(!cur) return;
  cardSet(id, {box:cur.box, due:cur.due, ran:cur.ran,
               hist:(cur.hist||[]).slice(), stuck:0});
  save();
}

function dueCards(){
  var m=cardDue(), td=today(), out=[];
  for(var k in m){ var c=cardOne(k); if(c && c.due && c.due<=td) out.push(k); }
  return out;
}

/* 근거. **이 카드의 문장이 실제 녹음의 어디에 있는지다.**

   A는 영어 제로다. 자기 소리가 맞는지 스스로 못 고친다.
   원본 소리가 있는 자리를 아는 것이 유일한 길이다.
   눌러서 그 과 그 줄로 바로 간다.

   **근거 없는 문장은 안 적는다.** 내가 쓴 문장이라는 뜻이고
   카드에 그렇게 적어 봐야 두 사람이 할 일이 없다.
   그 판단은 out/ground/ 보고서와 check_ground.py 가 맡는다. */
function renderGround(c){
  var g=DATA.ground;
  if(!g){
    loadData("ground","ENG2P_GROUND",function(){ renderBlockPane(); });
    return "";
  }
  var rows=(g.items||{})[c.id];   // 카드 id 가 이미 Q1-001 꼴이다
  if(!rows||!rows.length) return "";
  var h='<div class="ground"><div class="gh">이 문장이 실제 녹음에 있다 · '+rows.length+'줄</div>';
  rows.slice(0,6).forEach(function(r){
    var at=(r.at||[])[0];
    if(!at) return;
    h+='<div class="grow"><span class="gt">'+esc(r.t)+'</span>'+
       '<button type="button" class="gat" data-at="'+esc(at)+'">'+esc(at)+'</button></div>';
  });
  if(rows.length>6) h+='<div class="gh">외 '+(rows.length-6)+'줄</div>';
  return h+'</div>';
}
/* 그 과 그 줄로 간다. 미디어 탭에서 연다. 블록 3은 카드를 도는 자리라
   여기서 소리를 틀면 드릴이 끊긴다. 옮겨 가서 듣고 돌아온다. */
function goGround(at){
  var p=String(at).split(":"), id=p[0], line=+p[1]||1;
  function seek(){
    var cu=DATA.cues && DATA.cues.items && DATA.cues.items[id];
    var t=cu && cu[line-1];
    if(t==null || !LIB.el) return;
    var go2=function(){ try{ LIB.el.currentTime=t; }catch(e){} };
    if(LIB.el.readyState>0) go2(); else LIB.el.addEventListener("loadedmetadata",go2,{once:true});
    flash(id+" "+line+"번째 줄로 갔다. 시각은 어림이다");
  }
  /* 차림표를 늦게 읽는다. 그 과가 몇 번째인지는 차림표가 있어야 안다. T213 */
  needMedia(function(){
    var i=MEDIA.findIndex(function(x){return x.id===id;});
    if(i<0){ flash("그 과를 못 찾았다"); return; }
    openMedia(i,"audio",true); go("media");
    if(DATA.cues) seek(); else loadData("cues","ENG2P_CUES",seek);
  });
}

/* =========================================================================
   카드 제한시간 시계.

   **압박형 카드에 초가 붙어 있는데 화면은 그것을 글자로만 말했다.**
   "압박형 제한 시간 3초" 라고 적혀 있고 그다음은 사람이 센다.
   세면서 말하는 것은 안 된다. 세는 쪽이 곧 재는 쪽이고 그러면 출제자가 심판이 된다.

   시계가 그 자리를 대신한다. **출제자가 시작을 누르고 둘 다 남은 것을 본다.**
   시간이 되면 소리가 난다. 화면은 못 했다고 말하지 않는다.
   기준서 8.1 이 정한 초는 카드마다 붙어 있다. T205 에서 확인했다. T215

   숫자는 그리는 글에 안 넣는다. 넣으면 매초 칸이 갈린다. T211 규칙과 같다.
   ========================================================================= */
var CLK={t:null,left:0,id:null};
/* **지금 세는 것 하나만 크다.** 도는 동안 카드 시계가 커지고 블록 시계가 작아진다.
   시계가 다섯인데 다 같은 크기면 어느 것을 보는지 두 사람이 서로 다르게 고른다. T222 */
function markCardClock(on){ document.body.classList.toggle("card-clock",!!on); }
function stopCardClock(){ if(CLK.t){ clearInterval(CLK.t); CLK.t=null; } markCardClock(false); }
function paintCardClock(){
  var e=document.getElementById("ckLeft");
  if(!e){ stopCardClock(); return; }
  e.textContent=CLK.left>0?CLK.left+"초":"시간이 됐다";
}
function startCardClock(sec){
  stopCardClock();
  CLK.left=sec; markCardClock(true); paintCardClock(); tone("start");
  CLK.t=setInterval(function(){
    CLK.left--;
    if(CLK.left<=0){ clearInterval(CLK.t); CLK.t=null; CLK.left=0; paintCardClock();
                     tone("next");
                     /* 다 세고 나서 바로 줄이지 않는다. 끝난 것을 보고 나서 줄인다. */
                     setTimeout(function(){ markCardClock(false); },1500);
                     return; }
    paintCardClock();
  },1000);
}
function renderCardClock(c, mine){
  if(!c.seconds) return "";
  var h='<div class="ckrow"><span class="ckn" id="ckLeft">'+c.seconds+'초</span>';
  /* 응답자 화면에는 시작 단추를 안 낸다. 재는 쪽과 받는 쪽이 갈린다. */
  if(mine==="b") h+='<span class="n">'+esc(S.names.a)+' 쪽이 시작한다</span>';
  else h+='<button type="button" class="g" id="ckGo">'+c.seconds+'초 재기</button>';
  return h+'</div>';
}
/* **카드는 어느 분기 것이든 나온다.** 간격 반복이 옛 분기 카드를 오늘 낸다.
   그 카드가 어느 강에 붙는지를 알아야 간격을 맞게 올린다 (`cardLecture`).
   그래서 카드 자리를 열 때 분기 넷을 다 읽어 둔다. 눌러야 열리는 자리다. T245 */
var CARDIDX={done:false};
function needCardIndex(cb){
  if(CARDIDX.done) return cb();
  needAllWeeks(function(){ CARDIDX.done=true; cb(); });
}
function renderCardView(pl){
  var cards=DATA.cards;
  /* 카드 자료를 읽는 김에 분기 넷도 읽어 둔다. 둘 다 눌러야 열리는 자리다. */
  if(!CARDIDX.done) needCardIndex(function(){ renderBlockPane(); });
  if(!cards){
    loadData("cards","ENG2P_CARDS",function(){ renderBlockPane(); });
    return dataWait("카드를","cards");
  }
  if(!pl.cards) return "";
  /* 두 벌을 돈다. 오늘 범위와 다시 낼 카드다.
     다시 낼 카드는 오늘 범위 밖이라 이 화면이 없으면 영영 안 나온다.
     간격 반복은 다시 내는 것이 전부인 장치이므로 그것이 곧 장치가 없는 것이 된다. */
  var due=dueCards();
  var mode=(S.cardMode==="due" && due.length) ? "due" : "today";
  var list;
  if(mode==="due"){
    var set={}; due.forEach(function(k){ set[k]=1; });
    list=(cards.items||[]).filter(function(c){ return set[c.id]; })
         .sort(function(a,b){ return a.id<b.id?-1:1; });
  }else{
    list=(cards.items||[]).filter(function(c){
      return c.quarter===pl.quarter && c.no>=pl.cards.from && c.no<=pl.cards.to;
    }).sort(function(a,b){return a.no-b.no;});
  }
  if(!list.length) return "";
  var i=Math.max(0,Math.min(list.length-1,cardIdx()));
  var c=list[i];
  var mine=deviceSide();
  var side = mine==="b" ? "b" : "a";     // 안 고르면 A면. 블록 3에서 B 는 카드를 안 본다
  var f=c[side]||{};

  var h='<div class="cardview"><div class="top">'+
    '<span>'+esc(c.id)+' · '+esc(c.type)+'형 · '+c.minutes+'분'+
    (c.seconds?' · '+c.seconds+'초':'')+'</span>'+
    '<span class="side">'+side.toUpperCase()+'면 · '+(i+1)+' / '+list.length+'</span></div>';
  if(c.type==="역할"){
    h+='<div class="meta">'+esc(f.situation||"")+'<br>'+
       '관계 '+esc(f.relation||"")+' · 목적 '+esc(f.purpose||"")+
       ' · 레지스터 '+esc(f.register||"")+'<br>종료 조건 '+esc(f.endCondition||"")+'</div>';
  }
  h+='<div class="ins">'+esc(f.instruction||"")+'</div>';
  if(f.axis) h+='<div class="meta"><b>변형축</b> '+esc(f.axis)+'</div>';
  if(f.material && f.material.length)
    h+='<ol>'+f.material.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+'</ol>';
  if(f.note) h+='<div class="meta"><b>비고</b> '+esc(f.note)+'</div>';
  if(f.model) h+='<div class="meta"><b>모범 답안</b> '+esc(f.model)+'</div>';
  if(f.answer) h+='<div class="ans"><b>정답</b> '+esc(f.answer)+'</div>';
  if(f.pass) h+='<div class="meta"><b>통과 기준</b> '+esc(f.pass)+'</div>';
  h+=renderCardClock(c, mine);
  h+=renderGround(c);
  if(!mine) h+='<div class="cardwarn">이 기기를 쓰는 사람을 안 골랐다. '+
    'A면을 보여 주는 중이다. 블록 3에서 B 는 카드를 안 본다.</div>';
  var m=cardOne(c.id);
  /* 다시 낼 카드는 오늘 강의 것이 아니다. 그 카드가 붙은 강의 간격을 써야 한다. */
  var ownLec=cardLecture(c.id) || pl.lectureNo;
  var sp=spacingDays(ownLec);
  if(sp) h+='<div class="meta"><b>간격</b> '+sp.join("일 · ")+'일'+
    (m&&m.due?' · 다음 '+esc(m.due):(m&&m.box?' · 다 돌았다':''))+'</div>';
  h+='</div><div class="cardnav">'+
    (due.length ? '<button type="button" data-card="mode">'+
      (mode==="due" ? "오늘 범위로 ("+(pl.cards.to-pl.cards.from+1)+"장)"
                    : "다시 낼 카드로 ("+due.length+"장)")+'</button>' : "")+
    '<button type="button" data-card="prev">이전 카드</button>'+
    '<button type="button" data-card="run">'+
    (m&&m.ran===today()?'오늘 돌았다':'돌았다로 적기')+'</button>'+
    '<button type="button" data-card="stuck">막혔다</button>'+
    '<button type="button" data-card="next">다음 카드</button></div>';
  setTimeout(function(){
    var cg=document.getElementById("ckGo");
    if(cg) cg.onclick=function(){ startCardClock(c.seconds); };
    document.querySelectorAll("[data-at]").forEach(function(b){
      b.onclick=function(){ goGround(b.dataset.at); };
    });
    document.querySelectorAll("[data-card]").forEach(function(b){
      b.onclick=function(){
        if(b.dataset.card==="mode"){
          S.cardMode = (S.cardMode==="due") ? "today" : "due";
          S.card=null; save(); renderBlockPane();
          return;
        }
        stopCardClock();      // 카드를 넘기면 앞 카드의 시계는 끝난 것이다
        if(b.dataset.card==="stuck"){
          markCardStuck(c.id);
          setCardIdx(i+1>=list.length?0:i+1);
          return;
        }
        if(b.dataset.card==="run"){
          markCardRun(c.id, ownLec);
          /* 적고 나면 다음 카드로 간다. 한 장씩 도는 자리라 손이 한 번만 나가야 한다. */
          setCardIdx(i+1>=list.length?0:i+1);
          return;
        }
        var n=b.dataset.card==="next"?i+1:i-1;
        if(n<0) n=list.length-1; if(n>=list.length) n=0;
        setCardIdx(n);
      };
    });
  },0);
  return h;
}

/* 블록 3 구간이 어디까지 왔는지. 블록 2의 `SWAP` 과 같은 자리다. */
var DRILL={step:null};
function renderDrillPane(pl){
  var lec=DATA.lectures;
  var c=pl.cards ? String(pl.cards.from).padStart(3,"0")+" ~ "+String(pl.cards.to).padStart(3,"0") : "(없음)";
  var head='<div class="k">이 블록에 쓰는 것 · 카드</div><div class="v">'+esc(c)+'</div>';
  if(!lec){
    loadData("lectures","ENG2P_LECTURES",function(){ renderBlockPane(); });
    return head+dataWait("진행표를","lectures");
  }
  var L=(lec.items||[]).filter(function(x){return x.no===pl.lectureNo;})[0];
  if(!L) return head;
  var ps=planPieces(L.plan && L.plan.split);
  if(!ps.length) return head+'<div class="n">'+esc(L.plan&&L.plan.split||"")+'</div>';

  var used=BLOCKS[2].m*60-Math.max(0,T.left), acc=0, cur=0;
  ps.forEach(function(x,i){ if(used>=acc) cur=i; acc+=x.min*60; });

  /* **구간이 바뀌면 하는 일이 바뀌는데 아무 소리가 안 났다.**
     블록 2는 단계가 바뀔 때 소리로 알린다. 블록 3은 30분을 서너 구간으로 나누고
     그중 하나가 역할을 바꾸는 자리인데 화면만 바뀌었다.

     두 사람은 카드를 주고받는 중이라 화면을 안 본다. 그래서 교대를 놓친다.
     블록 2에서 T176 에 겪은 것과 같은 자리다. **같은 병을 두 번째로 고친다.** T217

     역할을 바꾸는 구간이면 다른 소리를 낸다. 그 구간이 이 블록의 중심이다.
     기준서 2.4 가 요구하는 교대가 실제로 일어나는 자리가 여기다. */
  if(T.run && DRILL.step!==null && DRILL.step!==cur){
    var lab=(ps[cur]||{}).label||"";
    var swap=/역할.*(바꿔|바꾸|교대)/.test(lab);
    tone(swap?"swap":"next");
    setTimeout(function(){
      flash(swap ? "이제 역할을 바꾼다 · "+lab : (cur+1)+"번째 구간 · "+lab);
    },0);
  }
  DRILL.step=T.run?cur:null;

  var h=head;
  if(L.pressureSeconds) h+='<div class="n">압박형 제한 시간 '+L.pressureSeconds+'초</div>';
  if(L.cardSeconds && L.cardSeconds.length)
    h+='<div class="n">카드별 시간 '+esc(L.cardSeconds.map(function(x){
      return String(x.card).padStart(3,"0")+" "+x.seconds+"초"; }).join(" / "))+'</div>';
  acc=0;
  ps.forEach(function(x,i){
    var left="";
    if(i===cur) left=" · 남은 "+Math.max(0,Math.ceil((acc+x.min*60-used)/60))+"분";
    acc+=x.min*60;
    h+='<div class="setstep'+(i===cur?" now":"")+'"><h5>'+esc(x.label)+left+'</h5></div>';
  });
  /* 구간 지시가 타이머 칸과 글자까지 같은 강이 있다. 배분 문장과 구간 목록이 한 문장인 강들이다.
     같은 것을 두 번 보여 주면 화면만 길어지고 읽을 것이 준다. 다를 때만 편다. */
  var segs=(L.plan&&L.plan.segments)||[];
  var labels=ps.map(function(x){return x.label;}).join("|");
  if(segs.length && segs.join("|")!==labels)
    h+='<div class="n"><b>구간 지시</b><br>'+segs.map(function(s){return esc(s);}).join("<br>")+'</div>';
  /* **이 블록이 남기는 것을 이 블록에서 받는다.** 오늘 탭까지 가서 적으면
     30분 드릴이 끊긴다. 장수는 앱이 세고 발화 분만 사람이 적는다. T216 */
  h+='<div class="drec"><div class="k">이 블록이 남기는 것</div>'+
     '<div class="cntrow">'+
     '<label class="blank"><span>오늘 돈 카드</span>'+
     '<input type="number" min="0" step="1" id="drCards" readonly></label>'+
     '<label class="blank"><span>발화 분</span>'+
     '<input type="number" min="0" step="1" id="drSpeak"></label></div>'+
     '<div class="n">장수는 돌았다로 적기를 누른 수다. 앱이 센다. '+
     '발화 분은 둘이 실제로 말한 시간이다.</div></div>';
  if(L.role) h+='<div class="n"><b>역할</b> '+esc(withNames(L.role))+'</div>';
  if(L.stuck) h+='<div class="n"><b>막혔을 때</b> '+esc(L.stuck)+'</div>';
  h+=renderCardView(pl);
  setTimeout(function(){
    var r=day(today());
    fillField("drCards", String(syncCardCount()));
    fillField("drSpeak", r.speak?String(r.speak):"");
    var sp=document.getElementById("drSpeak");
    if(sp) sp.oninput=function(){ day(today()).speak=+sp.value||0; save();
      var f=document.getElementById("fSpeak"); if(f) f.value=sp.value; };
  },0);
  return h;
}


