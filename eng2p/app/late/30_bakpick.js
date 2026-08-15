/* 사본에서 되살리기 (T391).

   T390 이 사본을 남기게 했다. 되살리는 길은 하나뿐이었다.
   **본 기록이 깨졌을 때 앱이 알아서 되살린다.** 그것이 전부였다.

   기록을 잃는 길은 그것만이 아니다. 더 흔한 것은 이쪽이다.

     - 엉뚱한 JSON 을 가져와 덮었다. 되돌리기는 새로고침하면 없어진다
     - 전체 삭제를 눌렀다
     - 며칠치를 잘못 고쳤는데 어디를 고쳤는지 모른다

   깨진 것이 아니라 **멀쩡한 채로 틀린 것**이다. 앱은 그것을 못 알아본다.
   `LOAD_ERR` 도 안 뜨고 화면도 정상이다. 그래서 사람이 고르는 자리를 둔다.

   ## 무엇이 들었는지 보고 고른다

   날짜만 늘어놓으면 어느 것을 골라야 하는지 모른다.
   벌마다 적힌 날 수와 마지막으로 적은 날을 적는다. **지금 것과 견줘서 적는다.**
   지금보다 며칠이 적은지가 고르는 근거다.

   ## 되살리기도 되돌릴 수 있어야 한다

   사본으로 돌아가는 것 자체가 덮어쓰기다. 어제로 갔더니 오늘 한 것이
   사라졌다면 그것도 잃은 것이다. `offerUndo` 를 건다.
   그리고 되살리기 직전 판이 오늘 사본으로 한 벌 남는다.
   `writeNow()` 가 덮기 전에 남기기 때문이다. */
function bakDays(o){ return Object.keys((o&&o.days)||{}).length; }
function bakLast(o){
  var k=Object.keys((o&&o.days)||{}).sort();
  return k.length ? k[k.length-1] : null;
}

function renderBakPick(){
  var box=$("#bakPick"); if(!box) return;
  var bl=bakList(), now=bakDays(S);
  var h='<h3 style="margin-top:0">사본에서 되살리기</h3>';
  if(!bl.length){
    h+='<p class="lede">아직 사본이 없다. 내일 처음 저장할 때 오늘 판이 한 벌 남는다.</p>'+
       '<div class="small mut">사본은 날마다 한 벌씩 이레를 둔다. '+
       '이 브라우저 안에 있어서 <b>기기가 바뀌면 같이 사라진다.</b> '+
       '기기를 옮길 때는 위의 JSON 내려받기를 쓴다.</div>';
    box.innerHTML=h; return;
  }
  h+='<p class="lede">날마다 한 벌씩 이레를 둔다. 지금 적힌 날은 '+now+'일이다.</p>'+
     '<div class="scroll"><table><thead><tr>'+
     '<th scope="col">사본</th><th scope="col">적힌 날</th>'+
     '<th scope="col">마지막 적은 날</th><th scope="col"></th>'+
     '</tr></thead><tbody>';
  for(var i=bl.length-1;i>=0;i--){
    var day=bl[i].slice(bl[i].lastIndexOf(".")+1);
    var o=bakRead(day);
    if(!o){
      h+='<tr><td class="mono">'+esc(day)+'</td><td colspan="3" class="small mut">'+
         '이 벌은 못 읽는다. 다른 벌을 쓴다</td></tr>';
      continue;
    }
    var n=bakDays(o), last=bakLast(o);
    /* **적다고 나쁘다고 안 적는다.** 며칠인지만 적고 고르는 것은 사람이 한다 */
    var gap=n-now;
    h+='<tr><td class="mono">'+esc(day)+'</td>'+
       '<td>'+n+'일'+(gap===0?'':' ('+(gap>0?'+':'')+gap+')')+'</td>'+
       '<td class="mono">'+esc(last||"-")+'</td>'+
       '<td><button class="g" data-bak="'+esc(day)+'">되살리기</button></td></tr>';
  }
  h+='</tbody></table></div>'+
     '<div class="small mut" style="margin-top:8px">되살리면 지금 기록을 덮는다. '+
     '<b>되돌리기가 한 번 뜬다.</b> 그리고 덮기 직전 판이 오늘 사본으로 한 벌 남는다. '+
     '사본은 이 브라우저 안에 있어서 기기가 바뀌면 같이 사라진다.</div>';
  box.innerHTML=h;
  var bs=box.querySelectorAll("[data-bak]");
  for(var j=0;j<bs.length;j++) bs[j].onclick=function(){ bakGo(this.getAttribute("data-bak")); };
}

function bakGo(day){
  var o=bakRead(day);
  if(!o){ alert("그 사본을 못 읽었다. 다른 벌을 쓴다."); renderBakPick(); return; }
  if(!confirm(day+" 사본으로 되돌린다. 지금 기록을 덮는다. 진행할까.")) return;
  /* **덮기 전 것을 들고 있는다.** 물음 하나로는 모자란다 (T184 와 같은 자리) */
  var before=JSON.stringify(S);
  var back=function(){
    S=JSON.parse(before); saveNow();
    renderToday(); renderLedger(); renderBakPick();
  };
  S=o; var b=blank(); for(var k in b) if(!(k in S)) S[k]=b[k];
  saveNow(); renderToday(); renderLedger(); renderBakPick();
  offerUndo(day+" 사본으로 되돌림", back);
}
