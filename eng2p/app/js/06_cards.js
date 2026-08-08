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
/* 카드 하나가 어느 강에 붙는지. 묶음의 주차 표에서 나온다.
   다시 낼 카드는 오늘 강의 것이 아니므로 이 값이 있어야 간격을 맞게 올린다. */
function cardLecture(id){
  if(!IDX) return null;
  var p=String(id).split("-"); if(p.length!==2) return null;
  var q=p[0], no=+p[1];
  for(var i=0;i<IDX.weeks.length;i++){
    var w=IDX.weeks[i]; if(w.quarter!==q) continue;
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
function markCardRun(id, lectureNo){
  var days=spacingDays(lectureNo);
  var m=cardDue(), cur=m[id];
  if(!days){ m[id]={box:0, due:null, ran:today()}; save(); return; }
  var box=cur && cur.box ? cur.box : 0;
  if(box>=days.length){ m[id]={box:box, due:null, ran:today()}; save(); return; }
  m[id]={box:box+1, due:addDays(today(), days[box]), ran:today()};
  save();
}
function dueCards(){
  var m=cardDue(), td=today(), out=[];
  for(var k in m) if(m[k] && m[k].due && m[k].due<=td) out.push(k);
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

function renderCardView(pl){
  var cards=DATA.cards;
  if(!cards){
    loadData("cards","ENG2P_CARDS",function(){ renderBlockPane(); });
    return '<div class="n">카드를 여는 중이다.</div>';
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
  h+=renderGround(c);
  if(!mine) h+='<div class="cardwarn">이 기기를 쓰는 사람을 안 골랐다. '+
    'A면을 보여 주는 중이다. 블록 3에서 B 는 카드를 안 본다.</div>';
  var m=cardDue()[c.id];
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
    '<button type="button" data-card="next">다음 카드</button></div>';
  setTimeout(function(){
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

function renderDrillPane(pl){
  var lec=DATA.lectures;
  var c=pl.cards ? String(pl.cards.from).padStart(3,"0")+" ~ "+String(pl.cards.to).padStart(3,"0") : "(없음)";
  var head='<div class="k">이 블록에 쓰는 것 · 카드</div><div class="v">'+esc(c)+'</div>';
  if(!lec){
    loadData("lectures","ENG2P_LECTURES",function(){ renderBlockPane(); });
    return head+'<div class="n">진행표를 여는 중이다.</div>';
  }
  var L=(lec.items||[]).filter(function(x){return x.no===pl.lectureNo;})[0];
  if(!L) return head;
  var ps=planPieces(L.plan && L.plan.split);
  if(!ps.length) return head+'<div class="n">'+esc(L.plan&&L.plan.split||"")+'</div>';

  var used=BLOCKS[2].m*60-Math.max(0,T.left), acc=0, cur=0;
  ps.forEach(function(x,i){ if(used>=acc) cur=i; acc+=x.min*60; });

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
  if(L.role) h+='<div class="n"><b>역할</b> '+esc(withNames(L.role))+'</div>';
  if(L.stuck) h+='<div class="n"><b>막혔을 때</b> '+esc(L.stuck)+'</div>';
  h+=renderCardView(pl);
  return h;
}


