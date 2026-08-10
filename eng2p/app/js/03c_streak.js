/* 공동 연속일 (T321). **날을 세지 사람을 안 센다.** `docs/streak.md`

   세션은 혼자 못 돈다 (1인 지시 금지). 한 날이 마쳐졌으면 둘이 같이 마친 것이다.
   그래서 누가 했는지를 안 적는다. **적는 순간 그것이 개인 칸이다.**

     마쳤다     +1 이어진다
     비상판     안 끊긴다. 안 는다. 둘이 앉기는 했고 세션은 아니다
     안 했다    끊긴다
     일요일     안 본다. 주 6일이라 쉬는 날이 끊는 날이 아니다

   오늘부터 거꾸로 간다. **오늘을 아직 안 했으면 어제부터 센다.**
   안 그러면 하루 내내 0으로 보이고 저녁에 갑자기 붙는다. */
function streak(from){
  var d=from||today(), n=0, back=0, seen=false;
  while(back<400){
    var x=parseISO(d);
    if(x.getDay()!==0){
      var r=(S.days||{})[d];
      var st=r ? r.status : null;
      if(st==="normal"){ n++; seen=true; }
      else if(st==="emg"){ /* 건너뛴다 */ }
      /* **미리 건 쉬는 날.** 안 끊고 안 는다 (T323).
         비상판과 결과가 같고 조건이 다르다. 비상판은 그날 15분을 한 것이고
         이것은 아무것도 안 한 것이다. 대신 **미리 걸어야** 하고 달에 둘뿐이다. */
      else if(REST()[d]){ /* 건너뛴다 */ }
      else if(seen || back>0) break;
    }
    d=addDays(d,-1); back++;
  }
  return n;
}

/* 회복권 (T323). **달에 둘. 미리 선언해야 쓴다.** `docs/streak.md` 6장

   ## 미리가 무슨 뜻인가

   **오늘보다 뒤에만 건다.** 오늘에도 못 건다.

   오늘 저녁에 걸 수 있게 하면 못 한 날을 그 자리에서 메우게 된다.
   그러면 그것은 회복권이 아니라 **끊김을 없애는 단추**다.

   갑자기 못 하게 된 날은 못 쓴다. 그날은 그냥 끊긴다.
   **끊긴 것은 벌이 아니다** (원칙 4). 그러니 메울 것도 없다.
   이 장치는 미리 아는 날을 위한 것이다. 시댁에 가는 날, 출장, 결혼식.

   ## 걸어 놓고 결국 한 날은 안 쓴 것이다

   미리 걸었는데 그날 세션을 마쳤으면 회복권을 안 쓴 것으로 친다.
   달 셈에서 빼 준다. **안 쓴 것을 쓴 것으로 세면 걸기가 무서워진다.**

   ## 지난 것은 못 무른다

   앞날 것은 무를 수 있다. 아직 안 썼기 때문이다.
   지난 날 것은 못 무른다. 무르면 그날이 소급해서 끊기고
   그것은 **지난 것을 오늘 바꾸는 일**이다. */
var REST_MAX=2;
function REST(){ if(!S.rest) S.rest={}; return S.rest; }
/* 그 달에 **실제로 쓴** 장수. 걸어 놓고 결국 한 날은 안 센다. */
function restUsed(d){
  var m=(d||today()).slice(0,7), r=REST(), n=0;
  for(var k in r){
    if(k.slice(0,7)!==m) continue;
    var rec=(S.days||{})[k];
    if(rec && rec.status==="normal") continue;
    n++;
  }
  return n;
}
function restLeft(d){ return Math.max(0, REST_MAX-restUsed(d)); }
/* 걸 수 있는 날인가. **오늘보다 뒤이고 일요일이 아니고 그 달에 자리가 있어야 한다.** */
function restCan(d){
  if(!d || d<=today()) return "오늘보다 뒤에만 건다";
  if(parseISO(d).getDay()===0) return "일요일은 원래 쉬는 날이다";
  if(REST()[d]) return "이미 걸린 날이다";
  if(!restLeft(d)) return "그 달 회복권을 다 썼다";
  return null;
}
/* 되돌리기 없어도 된다: 앞날에만 걸고 앞날 것은 목록에서 무를 수 있다.
   되돌리기 줄은 한 번 누르면 사라지는데 이 자리는 **목록이 늘 거기 있다.**
   지난 것을 못 무르는 것은 규격이다 (지난 것을 오늘 바꾸는 일이 된다). */
function restSet(d, on){
  var r=REST();
  /* 되돌리기 없어도 된다: 앞날 것은 목록에서 늘 무를 수 있다. 지난 것을 못 무르는 것은 규격이다 */
  if(on) r[d]=1; else delete r[d];
  save();
}

/* 첫 화면 빈 자리 (T322). T166 에 비워 둔 `#todaySlots` 가 이 자리다.

   ## 무엇을 보여 주고 무엇을 안 보여 주나

   숫자 하나와 그 숫자가 무엇으로 센 것인지를 보여 준다.
   **제일 길었던 연속일은 안 보여 준다.** 지난 것을 오늘과 견주게 만든다.

   끊긴 것을 벌로 안 만든다. 0이면 "잃었다" 가 아니라 **"오늘부터 시작한다"** 다.
   원칙 4가 침묵이 지는 것이 되면 안 된다고 했다. 그 결이 여기에도 온다.

   ## 이 기기가 아는 날로 셌다

   `S.days` 는 기기마다 따로다. 한쪽에서만 세션 끝을 눌렀으면
   그 기기만 그날을 마친 날로 안다. **틀린 것이 아니라 덜 아는 것이다.**

   짝 코드로 합치면 상대에게만 있는 날이 건너온다. 그러면 두 기기가 같아진다.
   화면이 그 사이를 말한다. 안 적으면 두 사람이 서로 다른 수를 보고
   앱이 틀렸다고 여긴다. */
function renderSlots(){
  var box=$("#todaySlots"); if(!box) return;
  var n=streak(), rec=day(today());
  /* **두 줄이다.** T322 에 넉 줄로 짰다가 첫 화면이 2499px 에서 2700px 이 됐다.
     T166 이 4231 을 2508 로 줄여 놓은 자리라 마찰 게이트가 바로 잡았다.
     말을 빼지 않고 줄을 합쳤다. **줄일 것은 글자가 아니라 줄이다.** */
  var why = n ? "일요일과 비상판은 안 센다"
    : (rec && rec.status==="emg"
        ? "비상판은 세션이 아니라 안 센다. 대신 안 끊는다"
        : "오늘부터 시작한다. 지난 것을 안 적는다");
  /* **글자만 붙인다.** 거는 것은 대장 탭이다. 첫 화면 높이를 안 늘린다 (T322) */
  why += " · 이 달 회복권 " + restLeft() + "장 남았다";
  box.innerHTML='<div class="card tight">'+
    '<div class="row" style="justify-content:space-between;align-items:baseline">'+
    '<span><b class="stkbig">'+n+'</b> <b>일째 같이 하고 있다</b></span>'+
    '<span class="small mut">둘의 날이다</span></div>'+
    '<div class="small mut" style="margin-top:4px">'+why+
    ' · <b>이 기기가 아는 날로 셌다.</b> 저쪽 날은 짝 코드로 합쳐야 온다.</div>'+
    questLine()+'</div>';
  box.hidden=false;
}

/* 공동 퀘스트가 세는 값 (T324). `docs/quest.md` 2장

   **주는 세션 주다.** 달력 주가 아니다. 밀리면 달력은 가고 세션 주는 안 간다.
   퀘스트가 달력을 따라가면 밀린 두 사람에게 못 채울 목표가 쌓인다.

   그 주에 든 날을 세션 수로 찾는다. `plan()` 이 끝낸 세션 수로 주와 날을 세므로
   **주 w 의 날은 그 주에 마친 날들**이다. 마친 날만 세면 저절로 그렇게 된다.
   빠진 날은 다음 주로 밀린다. 그것이 이 과정의 밀림 규칙이다. */
function weekDays(w){
  var out=[], n=0, ks=Object.keys(S.days||{}).sort();
  for(var i=0;i<ks.length;i++){
    var r=S.days[ks[i]];
    if(!r || r.status!=="normal") continue;
    n++;
    if(Math.floor((n-1)/6)+1===w) out.push(ks[i]);
  }
  return out;
}
/* 그 주에 얼마나 찼나. **못 쓰는 값은 여기 없다** (`quest.md` 2.1). */
function questNow(kind, w){
  var ds=weekDays(w||plan().week), n=0;
  ds.forEach(function(d){
    var r=S.days[d]||{};
    if(kind==="session") n++;
    else if(kind==="speak") n+=(+r.speak||0);
    else if(kind==="cards") n+=(+r.cards||0);
    else if(kind==="lre") n+=(+r.lre||0);
    else if(kind==="coll") n+=((r.coll||[]).length);
    else if(kind==="one") n+=(r.one?1:0);
  });
  return n;
}

/* 이 주 퀘스트 한 줄 (T325). **칸을 새로 안 만든다.**

   T322 에 연속일 칸이 133px 을 먹었고 첫 화면 예산이 빠듯하다.
   퀘스트는 그 칸 안에 **한 줄로** 들어간다.

   ## 개인 기여도를 안 보여 준다

   숫자가 둘이다. 지금 얼마와 목표 얼마. **누가 얼마인지는 없다.**
   그 값을 앱이 아예 안 갖고 있으므로 보여 줄 수도 없다 (`quest.md` 4장).

   ## 못 채운 것을 재촉하지 않는다

   "3장 남았다" 를 안 적는다. 지금 얼마인지만 적는다.
   남은 것을 적으면 그것이 빚이 되고 빚은 벌이다 (원칙 4). */
function questLine(){
  var d=DATA.quest;
  if(!d || !d.weeks){
    loadData("quest","ENG2P_QUEST",function(){ renderSlots(); });
    return '';
  }
  var w=plan().week, q=null;
  d.weeks.forEach(function(x){ if(x.week===w) q=x; });
  if(!q) return '<div class="small mut" style="margin-top:4px">'+
    '이 주 퀘스트는 아직 안 정했다. <b>'+d.count+'주까지 정해져 있다.</b></div>';
  var now=questNow(q.kind, w), done=now>=q.goal;
  return '<div class="small mut" style="margin-top:4px">'+
    '<b>이 주 '+esc(q.name)+'</b> · <b class="mono">'+now+' / '+q.goal+'</b>'+
    (done ? ' <b>채웠다</b>' : '')+
    ' · <b>둘이 같이 채운다.</b> 누가 얼마인지는 안 센다.</div>';
}
