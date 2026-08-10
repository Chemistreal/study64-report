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
    ' · <b>이 기기가 아는 날로 셌다.</b> 저쪽 날은 짝 코드로 합쳐야 온다.</div></div>';
  box.hidden=false;
}
