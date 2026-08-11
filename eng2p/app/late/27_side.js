/* 처음 녹음과 오늘 녹음 나란히 (T374). `docs/growth.md` 6장이 규격이다.

   ## 클립 탭에 닿으면 무엇을 하러 왔는지가 사라졌다

   분기 탭이 나란히 듣기를 몬다. 차례를 세고 파일 이름을 복사해 주고
   클립 탭으로 보낸다. 그런데 클립 탭에 닿는 순간 그 안내가 화면에서 사라진다.
   **이름을 외워서 파일을 열고 기준으로 잡는 것을 사람이 손으로 했다.**

   T373 과 같은 자리다. 앱이 아는 것을 사람이 다시 옮겨 적고 있었다.

   ## 처음 것이 기준이다

   growth.md 6.1 이 "늘 처음부터 간다" 고 했다. 최근 것부터 거꾸로 안 간다.
   제 것을 제 것과 견주는 일이라 시간 차례가 곧 그 견줌이다.
   그러니 기준(T365)은 늘 목록의 첫째다. 딴 것을 잡아 두면 앱이 그렇다고 적는다.

   ## 판정은 여기서도 안 한다

   12~14장이 마디를 대 준다. 그것은 길이 숫자지 발음이 아니다.
   **좋아졌는지는 앱이 안 말한다.** 그 말이 띠에 늘 붙어 있다.
   growth.md 6.2 의 표가 그대로다.

   ## 저장소에 안 남긴다

   몇 번째를 보고 있는지는 여기서만 산다 (growth.md 6.4).
   화면을 닫으면 꺼진다. 남기면 합치기가 또 한 갈래 늘고
   두 기기가 서로 다른 자리를 든다. **남길 값이 아니다.** */

/* 지금 어느 단계인가. 갈래 다섯이고 그 밖은 없다.
   open1 처음 것을 연다 / mark 기준으로 잡는다 / open2 지금 것을 연다
   on 둘을 대고 있다 / odd 기준이 처음 것이 아니다 */
function sideStep(){
  var list=voiceCmpList();
  if(!VOICE.side||list.length<2) return null;
  var i=Math.min(VOICE.side,list.length-1);
  if(i<1) i=1;
  var first=list[0], cur=list[i], now=(CLIP.file&&CLIP.file.name)||"";
  var st;
  if(!REF) st=now?"mark":"open1";
  else if(REF.name!==first.file) st="odd";
  else st=(now===cur.file)?"on":"open2";
  return {list:list, i:i, first:first, cur:cur, now:now, st:st};
}

function renderSide(){
  var box=$("#cSide"); if(!box) return;
  var s=sideStep();
  /* **하나뿐이면 안 뜬다.** 견줄 것이 없다 (growth.md 6.3).
     켜지 않았을 때도 안 뜬다. 클립 탭은 나란히 듣기 말고도 쓰는 자리다 */
  if(!s){ box.hidden=true; box.innerHTML=""; return; }
  box.hidden=false;
  var h='<div class="card"><div class="hd2"><b>나란히 듣기</b>'+
        '<span class="small mut">처음 것과 '+(s.i+1)+'번째를 댄다</span></div>';
  if(s.st==="odd")
    h+='<div class="w"><b>기준이 처음 것이 아니다.</b> 지금 기준은 '+
       '<span class="mono">'+esc(REF.name)+'</span> 다. 처음 것은 '+
       '<span class="mono">'+esc(s.first.file)+'</span> 다. '+
       '<span class="small">지우고 처음 것으로 다시 잡는다.</span></div>';
  else if(s.st==="open1")
    h+='<div class="note"><b>1) 처음 것을 연다</b> '+
       '<span class="small mut">'+esc(s.first.when)+' · '+s.first.week+'주</span><br>'+
       '<b class="mono">'+esc(s.first.file)+'</b><br>'+
       '<span class="small">파일은 이 기기에 있다. 열고 나서 기준으로 잡는다.</span></div>';
  else if(s.st==="mark")
    h+='<div class="note"><b>2) 이것을 기준으로 잡는다</b><br>'+
       '<span class="small">잡아 두면 옅게 겹쳐 그린다. '+
       '이 화면을 닫으면 없어지고 저장소에 안 들어간다.</span></div>';
  else if(s.st==="open2")
    h+='<div class="note"><b>3) 이제 이것을 연다</b> '+
       '<span class="small mut">'+esc(s.cur.when)+' · '+s.cur.week+'주</span><br>'+
       '<b class="mono">'+esc(s.cur.file)+'</b><br>'+
       '<span class="small">열면 밑에 마디 표가 뜬다.</span></div>';
  else
    h+='<div class="n"><b>4) 지금 이 둘을 대고 있다</b><br>'+
       '<span class="mono">'+esc(s.first.file)+'</span><br>'+
       '<span class="mono">'+esc(s.cur.file)+'</span><br>'+
       '<span class="small">밑의 마디 표가 그 둘을 댄 것이다.</span></div>';
  h+='<p class="small mut">앱은 마디 길이만 잰다. '+
     '<b>좋아졌는지는 앱이 안 말한다.</b> 듣고 두 사람이 정한다.</p>';
  h+='<div class="row" style="gap:8px">'+
     '<button class="g" type="button" data-side="-1"'+
       (s.i>1?"":" disabled")+'>앞엣것</button>'+
     '<button class="g" type="button" data-side="1"'+
       (s.i<s.list.length-1?"":" disabled")+'>다음 것</button>';
  if(s.st==="open1"||s.st==="open2")
    h+='<button class="g" type="button" id="sdName">이름 복사</button>';
  if(s.st==="mark"||s.st==="odd")
    h+='<button class="b" type="button" id="sdRef">'+
       (s.st==="odd"?"기준 지우기":"기준으로 잡기")+'</button>';
  h+='<button class="g" type="button" id="sdOff">그만두기</button></div></div>';
  box.innerHTML=h;
  box.querySelectorAll("[data-side]").forEach(function(b){
    b.onclick=function(){ VOICE.side=s.i+(+b.dataset.side); renderSide(); };
  });
  if($("#sdName")) $("#sdName").onclick=function(){
    copy(s.st==="open1"?s.first.file:s.cur.file, null);
    flash("파일 이름을 복사했다");
  };
  /* 기준 단추를 대신 누른다. **여기에 기준을 따로 두지 않는다.**
     둘을 두면 어느 쪽이 진짜인지 화면이 두 말을 한다 */
  if($("#sdRef")) $("#sdRef").onclick=function(){
    var b=$("#cRef"); if(b) b.click();
    renderSide();
  };
  if($("#sdOff")) $("#sdOff").onclick=function(){ VOICE.side=0; renderSide(); };
}
