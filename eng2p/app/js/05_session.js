/* =========================================================================
   타이머
   ========================================================================= */
var T={idx:0,left:BLOCKS[0].m*60,run:false,tick:null};

/* =========================================================================
   세션 상태 저장. 브라우저를 닫아도 어디서 멈췄는지 남는다.
   전에는 T 가 메모리에만 있었다. 새로고침 한 번에 40분이 사라졌다.
   ========================================================================= */
function saveSession(){
  S.session={date:today(), idx:T.idx, left:T.left, at:Date.now()};
  /* 바로 쓴다. save() 는 120밀리초 미룬다.
     세션 상태는 그 사이에 창이 닫히면 잃는 값이고, 잃으면 40분을 다시 한다. */
  saveNow();
}
function loadSession(){
  var s=S.session;
  if(!s || s.date!==today()) return false;   // 어제 것은 안 이어 간다
  if(s.idx==null || s.left==null) return false;
  T.idx=Math.max(0,Math.min(BLOCKS.length-1, s.idx));
  T.left=Math.max(0, Math.min(BLOCKS[T.idx].m*60, s.left));
  T.run=false;                                // 이어 가려면 눌러야 한다. 저절로 안 돈다
  return true;
}
function clearSession(){ S.session=null; save(); }
/* 남은 세션 시간. 이어서 하기 안내에 쓴다. */
function sessionLeftMin(){
  var s=T.left;
  for(var i=T.idx+1;i<BLOCKS.length;i++) s+=BLOCKS[i].m*60;
  return Math.ceil(s/60);
}
function fmt(s){var m=Math.floor(s/60);return String(m).padStart(2,"0")+":"+String(s%60).padStart(2,"0");}
var RINGC=552.9;
/* 미리 보기. **시계를 안 건드리고 그 블록의 재료만 편다.**
   T159 에 재 보니 오늘 칸이 여섯 가지를 알려 주는데 눌러서 닿는 것이 하나였다.
   앱이 오늘 무엇인지 알면서 사람에게 찾아오라고 시키고 있었다.

   그렇다고 눌렀을 때 `gotoBlock` 을 부르면 안 된다. 그것은 세션 상태를 바꾼다.
   재료를 한 번 봤을 뿐인데 "블록 2에서 멈췄다"가 되고 이어서 하기가 뜬다.
   **보는 것과 하는 것은 다르다.** 그래서 따로 둔다. */
var PEEK=null;
/* 강의 본문 미리 보기. **블록이 아니라 강의를 편다.**
   본문 30만자는 처음부터 안 읽는다. 누른 그때 읽는다. */
var PEEKLEC=null;
/* 길 지도. 48주가 어디까지 왔고 어느 주에 무엇이 있는지를 한 장에 편다. */
var PEEKMAP=false;
function peekMap(){
  PEEKMAP=true; PEEK=null; PEEKLEC=null; PANE.sig=null;
  syncSessionFocus(); renderBlockPane(); paintTimer();
  var box=$("#blockPane");
  if(box) box.scrollIntoView({behavior:"smooth",block:"start"});
  /* **지도는 48주를 다 편다.** 분기 조각 넷을 여기서 읽는다 (T245).
     누를 때만 읽는다. 다 읽으면 다시 그린다. 먼저 그린 판에는 읽은 주만 있다. */
  needAllWeeks(function(){
    if(!PEEKMAP) return;                     // 그 사이 닫았으면 안 그린다
    PANE.sig=null; renderBlockPane();
  });
}
function peekLecture(no){
  loadData("lecturetext","ENG2P_LECTURETEXT",function(v){
    if(!v || !v.items || !v.items[String(no)]){ flash("그 강의 본문을 못 찾았다"); return; }
    PEEKLEC=no; PEEK=null; PEEKMAP=false; PANE.sig=null;
    syncSessionFocus(); renderBlockPane(); paintTimer();
    var box=$("#blockPane");
    if(box) box.scrollIntoView({behavior:"smooth",block:"start"});
  });
}
function peekBlock(k){
  PEEKLEC=null; PEEKMAP=false;
  PEEK=k; PANE.sig=null;
  syncSessionFocus(); renderBlockPane(); paintTimer();
  var box=$("#blockPane");
  if(box) box.scrollIntoView({behavior:"smooth",block:"start"});
}
function closePeek(){
  if(PEEK==null && PEEKLEC==null && !PEEKMAP) return;
  PEEK=null; PEEKLEC=null; PEEKMAP=false; PANE.sig=null;
  syncSessionFocus(); renderBlockPane(); paintTimer();
  var c=$("#todaySheet"); if(c) c.scrollIntoView({behavior:"smooth",block:"center"});
}

/* **아직 안 시작한 세션의 시계는 자리만 먹는다.**
   T159 에 재 보니 오늘 화면 4231px 중 1724px 이 시계 묶음과 조작줄이었다.
   전체의 41%다. 그리고 그것은 세션이 돌 때만 쓴다.
   시작 전에는 접는다. 시작하거나 중간에 멈춘 상태면 편다. */
function sessionIdle(){
  return !T.run && T.idx===0 && T.left===BLOCKS[0].m*60;
}
function peekIdx(){ return PEEK!=null ? PEEK : T.idx; }
function peeking(){ return PEEK!=null || PEEKLEC!=null || PEEKMAP; }
var LASTIDLE=null;
function syncSessionFocus(){
  document.body.classList.toggle("session-focus",T.run);
  var idle=sessionIdle();
  document.body.classList.toggle("session-idle",idle);
  /* **접혔다 펴질 때 다시 만들어야 한다.**
     T185 에 접힌 칸을 안 만들게 했더니, 세션을 시작해도 그 칸이 빈 채로 남았다.
     접는 쪽만 손보고 펴는 쪽을 안 봤다. T166 에서 배운 것과 같은 자리다. */
  if(LASTIDLE!==null && LASTIDLE!==idle){ PANE.sig=null; renderBlockPane(); }
  LASTIDLE=idle;
  document.body.classList.toggle("peek",PEEK!=null||PEEKLEC!=null||PEEKMAP);
  var card=$("#sessionCard");
  if(card) card.setAttribute("aria-busy",T.run?"true":"false");
  var dock=$("#focusDock"); if(dock) dock.setAttribute("aria-hidden",T.run?"false":"true");
}
function hideSessionDone(){ var done=$("#sessionDone"); if(done) done.hidden=true; }

/* 두 시간을 되짚는다 (T378). `docs/roadmap.md` 12.18

   ## 끝난 자리가 곧바로 다음 일을 시키고 있었다

   세션이 끝나면 "2인 세션 완료" 한 줄이 뜨고 바로 밑에 기록을 남기라고 적혀 있었다.
   **끝난 것을 알리는 화면이 아니라 다음 일을 시키는 화면이다.**
   12.5.2 가 다그치지 않는다고 정했고 이 자리가 그 자리다.

   ## 무엇을 되짚나

   블록 넷의 이름과 분이다. **고정값이라 저장소를 안 늘린다.**
   오늘이 정상으로 적혔으면 넷을 다 돈 것이다. 못 한 것을 안 센다.

   숫자는 둘뿐이다. 두 시간과 몇 번째인가.
   **점수가 아니다.** 누가 무엇을 더 했는지도 안 가른다 (`quest.md` 원칙).

   ## 자리를 옮기지 않는다

   기록 남기라는 말은 그대로 두고 **뒤로 민다.** 빼면 안 된다.
   30초 안에 남기는 일이 이 과정의 기록 규칙이다. */
function renderDoneRecap(){
  var box=$("#doneRecap"); if(!box) return;
  var p=plan();
  var line=BLOCKS.map(function(b){ return b.n+" "+b.m+"분"; }).join(" · ");
  box.innerHTML='<div class="small" style="margin-top:6px">'+esc(line)+'</div>'+
    '<div class="small mut" style="margin-top:2px">'+
    '<b>'+(TOTAL_MIN/60)+'시간을 채웠다.</b> 이것으로 '+p.done+'번째다.</div>';
}
function finishSession(){
  /* **밀기 하나로 되돌릴 수 없는 일이 일어난다.**
     T170 에 손가락으로 밀어 블록을 옮기게 했다. 블록 4에서 왼쪽으로 밀면
     여기로 온다. 그러면 그날이 정상으로 적히고 진도가 하나 는다.
     96강 배정이 통째로 하루 당겨진다. 그것을 되돌릴 길이 없었다. T184 */
  var was={idx:T.idx, left:T.left, status:day(today()).status,
           sess:S.session ? {date:S.session.date, idx:S.session.idx, left:S.session.left} : null};
  T.run=false; clearInterval(T.tick); T.left=0; relWake(); leaveSessPlay();
  document.body.classList.remove("session-focus");
  document.body.classList.remove("session-idle");
  var done=$("#sessionDone"); if(done) done.hidden=false;
  tone("done");
  /* **여기서 정상으로 센다. 시작 버튼에서 세지 않는다.**
     T97 에서 진도를 정상 세션 수로 바꿨다. 시작만 눌러도 세면
     2분 하고 덮은 날이 하루 진도로 나간다. 96강이 그만큼 앞당겨진다. */
  var rec=day(today());
  if(rec.status!=="normal"){ rec.status="normal"; }
  clearSession();
  renderToday();
  renderDoneRecap();
  renderNextDay();
  paintTimer();
  offerUndo("세션을 끝냈다",function(){
    T.idx=was.idx; T.left=was.left; T.run=false;
    day(today()).status=was.status;
    S.session=was.sess;
    hideSessionDone();
    PANE.sig=null;
    saveNow(); renderToday(); paintTimer(); renderBlockPane();
  });
}
function restartFinishedSession(){
  if(T.idx===BLOCKS.length-1&&T.left<=0){
    T.idx=0; T.left=BLOCKS[0].m*60; hideSessionDone();
  }
}

/* =========================================================================
   이 기기의 쪽. A 인가 B 인가.
   역할 자체는 날짜가 정한다. 기기는 "이 화면을 보는 사람이 누구인가" 만 고른다.
   그래서 사람 이름으로 고르고 A/B 는 날짜에서 나온다.
   ========================================================================= */
function devicePerson(){ return S.device || null; }        // "a"=사람1, "b"=사람2
function deviceSide(){
  var who=devicePerson(); if(!who) return null;
  /* 사람1이 A인 날이면 사람1 기기는 A쪽이다. */
  return roleOf(today())==="a" ? (who==="a"?"a":"b") : (who==="a"?"b":"a");
}
function renderSidePick(A,B){
  var box=$("#tSide"); if(!box) return;
  var who=devicePerson();
  var h='<span>이 기기를 쓰는 사람</span>';
  h+='<button data-dev="a" class="'+(who==="a"?"on":"")+'">'+esc(S.names.a)+'</button>';
  h+='<button data-dev="b" class="'+(who==="b"?"on":"")+'">'+esc(S.names.b)+'</button>';
  if(who) h+='<button data-dev="">지움</button>';
  else h+='<span class="mut">안 고르면 두 쪽을 다 보여 준다</span>';
  /* 기기 둘을 쓰면 각 기기가 저장을 따로 한다. 브라우저 저장이 기기마다 따로이기 때문이다.
     한쪽에서만 끝냈다를 누르면 다른 기기는 어제 강을 든 채로 남는다.
     기기 사이를 잇는 길이 없으므로 규칙으로 정한다. **기록은 한 기기에만 남긴다.**
     맞출 일이 생기면 운영 탭의 JSON 내보내기와 가져오기를 쓴다. */
  if(who) h+='<span class="mut" style="flex-basis:100%;text-align:center">'+
    '기록은 한 기기에만 남긴다. 다른 기기는 보기만 한다. '+
    '어긋나면 운영 탭에서 JSON 을 내보내 가져온다.</span>';
  box.innerHTML=h;
  box.querySelectorAll("[data-dev]").forEach(function(btn){
    btn.onclick=function(){
      S.device=btn.dataset.dev||null; save(); paintTimer(); paintSide();
    };
  });
}


/* =========================================================================
   블록마다 쓰는 것. 오늘 배정에서 그대로 나온다.
   **세션 중에 이것을 찾으러 가면 그 블록이 무너진다.**
   블록 1과 4는 미디어, 2는 세트, 3은 카드와 진행표다.
   여기가 E구간에서 실제 뷰어로 바뀔 자리다. 지금은 무엇을 쓰는지만 적는다.
   ========================================================================= */

/* =========================================================================
   블록 2. 대조 교차 세트를 네 단계로 편다.
   **B 는 1단계의 필수 포함 요소를 그 자리에서 안 본다.**
   B 가 목록을 보면서 들으면 재구성이 아니라 목록 대조가 된다.
   A 가 무엇을 빠뜨렸는지는 3단계 상호 검토에서 갈린다. 그것이 이 세트의 장치다.
   기기 쪽을 안 고르면 다 보여 준다. 기기가 하나인 날도 있다. 그때는 종이 규칙으로 돈다.
   ========================================================================= */
/* 지금 몇 단계인지를 들고 있는 자리. 바뀔 때만 알리려면 앞 값이 있어야 한다. */
var SWAP={step:null};
/* 3단계 상호 검토에서 각자 적는 칸.
   본문이 "합의 지점 1개 이상, 불일치 지점 1개 이상을 각자 적는다" 고 시킨다.
   **시키는데 적을 자리가 없었다.** 블록 1과 다른 점이 하나 있다.
   여기는 서로 보는 자리다. 같이 검토하는 10분이라 가리면 검토가 안 된다. T212 */
function xchkWrite(){
  var A=roleOf(today())==="a"?S.names.a:S.names.b;
  var B=roleOf(today())==="a"?S.names.b:S.names.a;
  function one(side,name){
    /* 이름 뒤에 조사를 안 붙인다. 이름은 두 사람이 정한다.
       받침이 있는 이름과 없는 이름에 같은 조사를 붙이면 한쪽이 어색해진다. */
    return '<label class="blank aimw"><span>'+esc(name)+' · 합의와 불일치</span>'+
           '<textarea id="xch'+side.toUpperCase()+'" rows="2" '+
           'placeholder="합의 하나, 불일치 하나"></textarea></label>';
  }
  return '<div class="k">각자 적는다</div>'+one("a",A)+one("b",B)+
         '<div class="n">틀렸다고 말하지 않는다. 나는 이렇게 이해했다 꼴로 적는다.</div>';
}
function bindXchkWrite(){
  var r=day(today()), x=r.xchk||(r.xchk={a:"",b:""});
  [["xchA","a"],["xchB","b"]].forEach(function(k){
    fillField(k[0], x[k[1]]||"");
    var el=document.getElementById(k[0]);
    if(el) el.oninput=function(){ x[k[1]]=el.value; save(); };
  });
}

function renderSetPane(pl){
  var sets=DATA.sets;
  if(!sets){
    loadData("sets","ENG2P_SETS",function(){ renderBlockPane(); });
    return '<div class="k">이 블록에 쓰는 것 · 대조 교차 세트</div>'+
           '<div class="v">'+esc(pl.set||"(없음)")+'</div>'+
           dataWait("세트를","sets");
  }
  var s=(sets.items||[]).filter(function(x){return x.id===pl.set;})[0];
  if(!s) return '<div class="k">대조 교차 세트</div><div class="v">'+esc(pl.set||"(없음)")+'</div>';
  var mine=deviceSide();
  /* 30분 안에서 지금 몇 단계인지는 시간이 이미 알고 있다. 8 8 10 4 로 나뉜다.
     화면이 그것을 안 쓰면 두 사람이 시계를 따로 본다. 블록 타이머가 있는데 그렇다. */
  var used=BLOCKS[1].m*60-Math.max(0,T.left), acc=0, curStep=0;
  s.steps.forEach(function(st,i){
    if(used>=acc) curStep=i;
    acc+=st.minutes*60;
  });
  /* **단계가 바뀌면 말하는 사람이 바뀐다.** 1단계는 A 가 설명하고 2단계는 B 가 재구성한다.
     시간이 그 자리를 정하는데 화면만 바뀌고 아무 소리가 없었다.
     두 사람은 서로를 보고 말하는 중이라 화면을 안 본다. 그래서 교대를 놓친다.
     세션이 도는 중일 때만 알린다. 미리 보기에서는 안 울린다. T176 */
  if(T.run && SWAP.step!==null && SWAP.step!==curStep){
    tone("swap");
    var who=(curStep===0||curStep===2)?"A":"B";
    setTimeout(function(){ flash((curStep+1)+"단계 · 이제 "+who+" 차례다"); },0);
  }
  SWAP.step=T.run?curStep:null;
  var h='<div class="k">이 블록에 쓰는 것 · 대조 교차 세트</div><div class="v">'+esc(s.id)+'</div>';
  acc=0;
  s.steps.forEach(function(st,i){
    var f=st.fields||{};
    var body="";
    if(st.step===1){
      body='<div class="body"><b>설명 대상</b> '+esc(f["설명 대상"]||"")+'</div>';
      if(mine==="b"){
        /* B 화면에서는 목록을 가린다. 이 한 줄이 이 세트의 장치를 지킨다. */
        body+='<div class="hid">필수 포함 요소는 B 화면에 안 띄운다. '+
              'A 의 설명만 듣고 재구성한다. 빠진 것은 3단계에서 갈린다.</div>';
      }else if(st.items && st.items.length){
        body+='<ol>'+st.items.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+'</ol>';
      }
    }else if(st.step===2){
      body='<div class="body"><b>'+esc(f["재구성 방식"]||"")+'</b><br>'+esc(f["지시"]||"")+'</div>';
    }else if(st.step===3){
      body='<div class="body">'+esc(f["본문"]||"")+'</div>';
      if(f["규칙"]) body+='<div class="body"><b>규칙</b> '+esc(f["규칙"])+'</div>';
      /* **1단계에서 가린 것을 여기서 편다.**
         1단계 코드에 "빠진 것은 3단계에서 갈린다" 고 적어 놓고 안 폈다.
         B 는 그 목록을 세션 내내 한 번도 못 봤다. 그러면 무엇이 빠졌는지를
         A 가 말해 줘야 하고, 그것은 A 가 채점하는 자리가 된다.
         **목록을 펴면 둘이 같은 것을 보고 갈린다.** T212 */
      /* **3단계에 그려 두기만 하면 새어 나간다.** 네 단계가 한 칸에 다 그려진다.
         B 가 1단계에서 아래로 밀면 3단계 목록이 그대로 보인다. 그러면 격차가 없다.
         `check_ui.js` 가 그것을 잡았다. 세트 288개 중 셋에서 났다.
         **시간이 3단계에 닿아야 편다.** 그 전에는 아예 안 그린다. */
      var s1=(s.steps||[]).filter(function(x){return x.step===1;})[0];
      if(curStep>=2 && s1 && s1.items && s1.items.length){
        body+='<div class="body"><b>1단계에 들어갔어야 하는 것</b>'+
          '<ol>'+s1.items.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+'</ol>'+
          '<div class="n">2단계까지 B 화면에서 가려 뒀던 것이다. '+
          '빠진 것이 있으면 그것이 불일치 지점이다.</div></div>';
      }
      /* **누가 먼저 말하는지를 적는다** (T350).

         세트 48개가 머리글에 이렇게 적어 놨다.

             1단계에서 설명한 사람이 3단계에서 먼저 말하지 않는다.

         **종이에만 있었다.** 앱은 그 말을 어디에서도 안 했다.
         세션 중에 세트 파일을 펴는 사람은 없다 (매뉴얼 0장).
         안 적으면 설명한 쪽이 그대로 먼저 말하고 그것이 자리가 굳는 자리다.

         누가 1단계 설명이었는지는 앱이 안다. 그날 A다. 그러니 3단계 첫마디는 B다. */
      var b3=(roleOf(today())==="a") ? S.names.b : S.names.a;
      body+='<div class="note w"><b>3단계는 '+esc(jo(b3,"이","가"))+
        ' 먼저 말한다.</b> 1단계에서 설명한 사람이 먼저 말하지 않는다. '+
        '설명한 쪽이 먼저 말하면 그 자리가 그대로 굳는다.</div>';
      /* 각자 적는다. 본문이 "각자 적는다" 고 시키는데 적을 자리가 없었다. */
      body+='<div class="body">'+xchkWrite()+'</div>';
    }else{
      /* 적는 자리는 적을 수 있어야 한다. 보여 주기만 하면 종이를 따로 꺼내게 된다.
         값은 그날 기록에 바로 들어간다. LRE 횟수는 이미 있는 칸을 쓴다. */
      var rec=day(today());
      /* **아래 칸에 적으라고 시키는데 아래는 오늘 탭이다.**
         4분짜리 기록 단계에서 탭을 옮겨 가서 적고 돌아와야 했다.
         세션 중에 다른 탭에 가면 시계는 도는데 두 사람은 그것을 안 본다.
         **여기서 적는다.** 오늘 탭의 그 칸과 같은 자리에 쌓인다. T224 */
      body='<div class="body">'+
        '<label class="blank">LRE 발생 횟수'+
        /* 값을 여기 안 넣는다. 그린 뒤에 넣는다. 위 fillField 설명을 본다 */
        '<input type="number" min="0" step="1" id="setLre"'+
        ' style="width:80px;margin-left:8px"></label>'+
        '<div class="unresbox">'+
        '<label class="blank aimw"><span>미해결 LRE · 어긋난 문장을 그대로 적는다</span>'+
        '<textarea id="setUn" rows="2" placeholder="누가 맞았는지는 안 적는다"></textarea></label>'+
        '<button type="button" class="g" id="setUnAdd">이 문장을 남긴다</button>'+
        '<div class="n" id="setUnCnt"></div></div>'+
        '</div>';
    }
    var left="";
    if(i===curStep){
      var end=acc+st.minutes*60;
      left=" · 남은 "+Math.max(0,Math.ceil((end-used)/60))+"분";
    }
    acc+=st.minutes*60;
    h+='<div class="setstep'+(i===curStep?" now":"")+'"><h5>'+st.step+'단계 · '+
       esc(st.name)+' · '+st.minutes+'분'+left+'</h5>'+body+'</div>';
  });
  setTimeout(function(){
    bindXchkWrite();
    var el=document.getElementById("setLre");
    /* rec 은 4단계 칸 안에서 잡은 값이다. 그 단계가 없는 세트면 안 잡힌다.
       여기서 다시 읽는다. 없는 것을 읽어 세션이 멎으면 안 된다. */
    var rc=day(today());
    fillField("setLre", rc.lre?String(rc.lre):"");
    var uc=document.getElementById("setUnCnt");
    if(uc) uc.textContent="지금 "+(rc.unres||[]).length+"건 있다. 오늘 탭의 미해결 LRE 칸과 같은 자리다.";
    var ua=document.getElementById("setUnAdd"), ut=document.getElementById("setUn");
    if(ua&&ut) ua.onclick=function(){
      var v=ut.value.trim(); if(!v){ ut.focus(); return; }
      day(today()).unres.push({t:v,i:"",k:"",h:"",w:"",done:false});
      ut.value=""; save(); renderUnres && renderUnres();
      if(uc) uc.textContent="지금 "+day(today()).unres.length+"건 있다. 오늘 탭의 미해결 LRE 칸과 같은 자리다.";
      flash("미해결 LRE 를 남겼다");
      /* 남긴 것을 잘못 남길 수 있다. 세션 중이라 더 급하게 누른다. */
      offerUndo("미해결 LRE 1건 남김",function(){
        day(today()).unres.pop(); renderUnres && renderUnres();
        if(uc) uc.textContent="지금 "+day(today()).unres.length+"건 있다. 오늘 탭의 미해결 LRE 칸과 같은 자리다.";
      });
    };
    if(el) el.oninput=function(){ day(today()).lre=+el.value||0; save();
      var f=document.getElementById("fLre"); if(f) f.value=el.value; };
  },0);
  if(!mine) h+='<div class="n">이 기기를 쓰는 사람을 안 골랐다. '+
               '두 쪽을 다 보여 주는 중이다. B 는 1단계 목록을 안 본다.</div>';
  return h;
}


/* =========================================================================
   블록 3. 강의록 30분 진행표를 구간 타이머로 돈다.
   **시간은 배분 문장에서 온다.** 96편이 다 합 30분이고 check_plan30 이 그것을 지킨다.
   구간 목록(앞 12분은 ... / 뒤 12분은 ...)은 지시문이고 준비와 기록을 빼고 적은 강이 38편이다.
   그래서 둘을 짝지어 짐작하지 않는다. 타이머는 배분 문장으로 돌고 지시는 따로 편다.
   ========================================================================= */
var PLAN_MULT={"둘":2,"셋":3,"넷":4,"다섯":5,"여섯":6};
/* 강의록에서 온 글에는 역할이 "남편" 과 "아내" 로 박혀 있다. 기준서 4장의 말이다.
   그런데 두 사람은 첫 화면에서 자기들 이름을 적어 넣을 수 있다.
   **적어 넣으면 한 화면에 부른 이름과 안 부른 이름이 같이 뜬다.** T153 리허설에서 나왔다.
   그래서 화면에 낼 때 갈아 끼운다. 기본값 그대로면 아무것도 안 바뀐다.
   원본은 안 고친다. 종이는 기준서의 말을 그대로 들고 있는 것이 맞다. */
function withNames(s){
  if(!s) return s;
  var A=(S.names&&S.names.a)||"남편", B=(S.names&&S.names.b)||"아내";
  if(A==="남편" && B==="아내") return s;
  return s.split("남편").join(A).split("아내").join(B);
}

function planPieces(line){
  var out=[];
  (line||"").split(",").forEach(function(part){
    /* 배분 문장을 쉼표로 자른 것이라 **마지막 토막에 문장 끝이 붙어 온다.**
       "기록 3분이다" 가 그대로 구간 이름이 되고 알림이 그것을 읽는다.
       T231 에 한 세션 기록을 읽다가 보였다. 끝의 서술만 떼고 뜻은 안 건드린다. */
    var p=part.trim().replace(/\.$/,"").replace(/이다$/,"").trim();
    var m=/(\d+)\s*분/.exec(p); if(!m) return;
    var n=+m[1];
    var mm=/분\s*씩\s*([가-힣]+)/.exec(p);
    if(mm && PLAN_MULT[mm[1]]){
      for(var k=0;k<PLAN_MULT[mm[1]];k++) out.push({label:p+" ("+(k+1)+")", min:n});
    }else out.push({label:p, min:n});
  });
  return out;
}

