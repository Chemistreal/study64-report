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
      else if(seen || back>0) break;
    }
    d=addDays(d,-1); back++;
  }
  return n;
}
