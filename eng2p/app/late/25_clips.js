/* =========================================================================
   저장한 구간. **클립 조각에서 갈라 나왔다** (T367).

   `18_clip.js` 가 507줄이 되어 한 조각 500줄을 넘었다.
   T363 부터 T367 까지 마디와 봉우리와 기준 겹치기가 들어왔다.

   **가르는 자리는 일의 끝이다** (T365 에 한 번 틀리고 적어 둔 규칙).
   자르는 자리를 "저장한 구간" 한 일로 잡았다.
   파형을 그리는 것과 구간을 적어 두는 것은 다른 일이다.

   **파일은 여기에도 안 들어간다.** 파일 이름과 시각과 메모뿐이다.
   ========================================================================= */
function renderClip(){
  var box=$("#clipList"); if(!box) return;
  var A=roleOf(today())==="a"?S.names.a:S.names.b;
  var B=roleOf(today())==="a"?S.names.b:S.names.a;
  var ra=$("#clipRa"), rb=$("#clipRb");
  if(ra) ra.textContent="A "+A;
  if(rb) rb.textContent="B "+B;

  box.innerHTML="";
  if(!S.clips.length){
    box.innerHTML='<div class="note small">저장한 구간이 없다. 파일을 열고 A와 B를 찍은 뒤 저장한다.</div>';
    return;
  }
  var cur=CLIP.file?CLIP.file.name:null;
  var groups={};
  S.clips.forEach(function(c,i){ (groups[c.f]=groups[c.f]||[]).push({c:c,i:i}); });
  Object.keys(groups).sort().forEach(function(fname){
    var h=el("div","row"); h.style.marginTop="14px";
    h.appendChild(el("b",null,fname));
    h.appendChild(el("span","tag"+(fname===cur?" o":""), fname===cur?"열려 있음":"파일을 다시 열면 재생된다"));
    box.appendChild(h);
    groups[fname].forEach(function(x){
      var c=x.c, i=x.i;
      var d=el("div","clip"+(CLIP.active===i?" on":""));
      var top=el("div","hd2");
      var left=el("div");
      left.appendChild(el("b",null,c.label||"무제"));
      left.appendChild(el("div","small mut tc",
        mmss(c.a)+"  ~  "+mmss(c.b)+"   ("+(c.b-c.a).toFixed(1)+"초)   ·   "+c.focus+"회 초점"));
      top.appendChild(left);
      var acts=el("div","row"); acts.style.gap="8px";
      if(fname===cur){
        var play=el("button","g","구간 재생");
        play.style.padding="3px 10px"; play.style.fontSize="12px";
        play.onclick=function(){
          CLIP.a=c.a; CLIP.b=c.b; CLIP.loop=true; CLIP.active=i;
          $("#cLoop").classList.add("on");
          CLIP.el.currentTime=c.a; CLIP.el.play(); paintScrub(); renderClip();
        };
        acts.appendChild(play);
      }
      var del=el("button","del","삭제");
      del.onclick=function(){
        var gone=S.clips.splice(i,1)[0]; save(); renderClip();
        offerUndo("구간 1개 삭제",function(){ S.clips.splice(i,0,gone); renderClip(); });
      };
      acts.appendChild(del);
      top.appendChild(acts); d.appendChild(top);

      var row=el("div","row"); row.style.marginTop="10px";
      var inp=el("input"); inp.placeholder="여기서 들린 표현을 적는다";
      inp.style.flex="1"; inp.style.minWidth="170px"; inp.value=c.note||"";
      inp.oninput=function(){ c.note=inp.value; save(); };
      var send=el("button","g","채집으로");
      send.onclick=function(){
        var e2=(c.note||"").trim();
        if(!e2){ inp.focus(); flash("들린 표현을 먼저 적는다"); return; }
        day(today()).coll.push({e:e2, s:fname+" "+mmss(c.a)+"-"+mmss(c.b), q:c.label||"", k:"", done:false});
        save(); renderColl(); flash("채집으로 보냈다");
        offerUndo("채집 1건 추가",function(){ day(today()).coll.pop(); renderColl(); });
      };
      row.appendChild(inp); row.appendChild(send);
      d.appendChild(row);
      box.appendChild(d);
    });
  });
}

$("#cSave").onclick=function(){
  if(!CLIP.file){ flash("파일을 먼저 연다"); return; }
  if(CLIP.a==null||CLIP.b==null||CLIP.b<=CLIP.a){ flash("A와 B를 찍는다"); return; }
  S.clips.push({f:CLIP.file.name,a:CLIP.a,b:CLIP.b,label:$("#cLabel").value.trim(),
    focus:+$("#cFocus").value,note:"",date:today()});
  $("#cLabel").value=""; setClipPhase("prepare"); save(); renderClip(); flash("구간을 저장했다");
};
