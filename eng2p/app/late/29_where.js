/* 어디서 열었나 (T382).

   ## 기록이 사라진 것처럼 보이는 자리가 있었다

   내보내기 칸이 이렇게 적고 있었다.

       기록은 이 브라우저에만 저장된다. 기기를 바꾸면 JSON 으로 옮긴다.

   **기기만 말하고 여는 곳을 안 말한다.** 브라우저 저장소는 주소별로 갈린다.
   같은 기기 같은 브라우저라도 공개 주소로 열 때와 내려받은 파일로 열 때가
   서로 다른 칸을 쓴다. 오늘 주소로 적고 내일 파일로 열면 **기록이 0으로 보인다.**

   그리고 그 0은 처음 쓰는 것과 구별이 안 된다. 두 사람은 1년치가 날아갔다고 여긴다.
   실제로는 저쪽 칸에 그대로 있다.

   ## 겁주지 않고 적는다

   지금 어디서 열었는지를 적고 다른 데서 열면 따로 산다고 적는다.
   **잃었다고 안 적는다.** 옮기는 길이 이미 둘 있다 (JSON 과 짝 코드).

   ## 홈 화면에 붙이기

   붙일 수 있는 것은 주소로 연 때뿐이다. 파일은 홈에 못 붙인다.
   그리고 붙인 것은 **그 주소를 여는 것이라 인터넷이 있어야 한다.**

   절차는 기기와 브라우저 판마다 메뉴 이름이 다르다.
   **정확한 이름을 못 박지 않는다.** 어디를 누르는지만 적는다.
   지어낸 메뉴 이름을 적으면 두 사람이 없는 것을 찾는다. */
function openKind(){
  try{
    if(location.protocol==="file:") return "file";
    if((location.hostname||"").indexOf("github.io")>=0) return "pages";
    if(location.protocol==="http:"||location.protocol==="https:") return "web";
  }catch(e){}
  return "other";
}
var OPEN_NAME={
  file:"내려받은 파일",
  pages:"공개 주소",
  web:"웹 주소",
  other:"알 수 없는 자리"
};

function renderOpen(){
  var box=$("#openWhere"); if(!box) return;
  var k=openKind();
  var h='<div class="hd2"><b>지금 어디서 열었나</b>'+
        '<span class="small mut">'+esc(OPEN_NAME[k])+'</span></div>';
  h+='<div class="note"><b>여는 곳이 바뀌면 기록이 따로 산다.</b>'+
     '<div class="small" style="margin-top:4px">'+
     '브라우저 저장소는 주소별로 갈린다. 같은 기기 같은 브라우저라도 '+
     '공개 주소로 열 때와 내려받은 파일로 열 때가 서로 다른 칸을 쓴다.<br>'+
     '<b>저쪽 기록이 없어진 것이 아니라 이 칸에 안 보이는 것이다.</b> '+
     '옮기려면 위의 JSON 합치기를 쓴다. 기기끼리는 짝 코드가 있다.</div></div>';
  if(k==="file")
    h+='<div class="small mut">파일로 열면 인터넷이 없어도 돈다. '+
       '대신 <b>홈 화면에는 못 붙인다.</b> 붙이려면 공개 주소로 연다.</div>';
  else
    h+='<div class="n"><b>홈 화면에 붙이기</b>'+
       '<div class="small" style="margin-top:4px">'+
       '브라우저 메뉴에서 홈 화면에 더하는 자리를 찾는다. '+
       '<b>메뉴 이름은 기기와 판마다 다르다.</b> 공유 단추 안에 있기도 하고 '+
       '주소줄 옆 점 셋 안에 있기도 하다.<br>'+
       '붙인 것은 <b>이 주소를 여는 것이라 인터넷이 있어야 한다.</b> '+
       '인터넷 없이 쓰려면 파일을 내려받아 연다. 그때는 기록이 따로 산다.</div></div>';
  /* 사본이 몇 벌 있고 언제 것인지 (T390). **본 기록이 깨져도 이레가 남는다.**
     그리고 마지막으로 내보낸 날. 안 적으면 아무도 모른다. */
  var bl=(typeof bakList==="function")?bakList():[];
  h+='<div class="n" style="margin-top:10px"><b>이 기기의 사본</b>'+
     '<div class="small" style="margin-top:4px">';
  if(bl.length){
    var first=bl[0].slice(bl[0].lastIndexOf(".")+1);
    var last=bl[bl.length-1].slice(bl[bl.length-1].lastIndexOf(".")+1);
    h+='날마다 한 벌씩 <b>'+bl.length+'벌</b> 있다 ('+esc(first)+' ~ '+esc(last)+'). '+
       '본 기록이 깨지면 제일 가까운 사본으로 되살린다.';
  }else{
    h+='아직 없다. 내일 처음 저장할 때 어제 판이 한 벌 남는다.';
  }
  /* **다그치지 않는다.** 오래됐다고 안 적고 언제였는지만 적는다 (`tone.md`) */
  h+='<br>'+(S.exportAt
      ? 'JSON 을 마지막으로 내려받은 날은 <b>'+esc(S.exportAt)+'</b> 다.'
      : 'JSON 을 아직 안 내려받았다.')+
     ' 사본도 이 브라우저 안에 있다. <b>기기가 바뀌면 같이 사라진다.</b>'+
     '</div></div>';
  box.innerHTML=h;
}
