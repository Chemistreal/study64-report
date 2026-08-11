/* =========================================================================
   대본 동기. **클립 조각에서 갈라 나왔다** (T365).

   `18_clip.js` 가 498줄이 되어 한 조각 500줄에 두 줄 남았다.
   T363 에 마디 뽑기가 들어오고 T365 에 기준 겹치기가 들어왔다.
   **자리가 모자라서 가른 것이 아니라 다른 일이라서 갈랐다.**

   클립은 소리를 자르고 이것은 그 소리에 글을 붙인다.
   대본은 텍스트라 저장한다. **소리는 저장하지 않는다.**
   ========================================================================= */
/* 대본 동기화. 줄마다 시각을 찍어 두면 그 줄만 골라 반복할 수 있다.
   대본은 텍스트라 저장한다. 음성은 저장하지 않는다. */
function scKey(){ return CLIP.file ? CLIP.file.name : null; }
function scLines(){
  var k=scKey();
  return (k && S.scripts[k]) ? S.scripts[k] : [];
}
function renderScript(){
  var box=$("#scList"); if(!box) return;
  box.innerHTML="";
  var k=scKey();
  if(!k){ box.innerHTML='<div class="note small">파일을 먼저 연다. 대본은 파일 이름에 붙는다.</div>'; return; }
  var arr=scLines();
  if(!arr.length){ box.innerHTML='<div class="note small">대본을 붙여넣고 줄 나누기를 누른다.</div>'; return; }
  arr.forEach(function(ln,i){
    var d=el("div","clip");
    var top=el("div","hd2");
    var left=el("div"); left.style.flex="1"; left.style.minWidth="140px";
    left.appendChild(el("div",null,ln.line));
    left.appendChild(el("div","small mut tc", ln.t==null ? "시각 미지정" : mmss(ln.t)));
    top.appendChild(left);
    var acts=el("div","row"); acts.style.gap="6px";
    var mark=el("button","g","여기 찍기");
    mark.style.padding="3px 10px"; mark.style.fontSize="12px";
    mark.onclick=function(){
      if(!CLIP.el) return;
      ln.t=+CLIP.el.currentTime.toFixed(1); save(); renderScript();
    };
    acts.appendChild(mark);
    if(ln.t!=null){
      var play=el("button","g","이 줄 재생");
      play.style.padding="3px 10px"; play.style.fontSize="12px";
      play.onclick=function(){
        if(!CLIP.el) return;
        var nxt=null;
        for(var j=i+1;j<arr.length;j++){ if(arr[j].t!=null){ nxt=arr[j].t; break; } }
        CLIP.a=ln.t; CLIP.b=(nxt!=null?nxt:Math.min(dur(),ln.t+6));
        CLIP.loop=true; $("#cLoop").classList.add("on");
        CLIP.el.currentTime=ln.t; CLIP.el.play(); paintScrub();
      };
      acts.appendChild(play);
    }
    acts.appendChild(spkBtn(ln.line.replace(/^[A-Z]\s*:\s*/,"")));
    top.appendChild(acts); d.appendChild(top);
    box.appendChild(d);
  });
  var done=arr.filter(function(x){return x.t!=null;}).length;
  box.appendChild(el("div","note small","시각 지정 "+done+" / "+arr.length+"줄. 앞줄부터 순서대로 찍는다. 다음 줄 시각이 그 줄의 끝이 된다."));
}
$("#scLoad").onclick=function(){
  var k=scKey();
  if(!k){ flash("파일을 먼저 연다"); return; }
  var lines=$("#scText").value.split("\n").map(function(x){return x.trim();}).filter(Boolean);
  if(!lines.length){ flash("대본이 비어 있다"); return; }
  var old=S.scripts[k]||[];
  S.scripts[k]=lines.map(function(L){
    var hit=old.filter(function(o){return o.line===L;})[0];
    return {line:L, t: hit?hit.t:null};
  });
  save(); renderScript(); flash(lines.length+"줄로 나눴다");
};
$("#scClear").onclick=function(){
  var k=scKey(); if(!k) return;
  var gone=S.scripts[k];
  delete S.scripts[k]; save(); renderScript();
  offerUndo("대본 1개 삭제",function(){ S.scripts[k]=gone; renderScript(); });
};
