/* =========================================================================
   강의 본문. **앱에 없던 것이다.**

   블록 3은 강의록 30분을 도는 자리인데 화면에는 구간 배분표만 나왔다.
   "손뼉 속도를 맞추는 데 5분" 이라고 적혀 있고 그 손뼉이 무엇인지는 안 적혀 있다.
   그것이 강의 1장에 있는데 화면에 없었다. 두 사람은 종이를 찾거나 저장소에 갔다.

   여섯 블록을 그대로 편다. 접지 않는다. **읽으라고 만든 글이다.**
   ========================================================================= */
function renderLecturePane(no){
  var v=DATA.lecturetext, it=v && v.items && v.items[String(no)];
  if(!it) return '<div class="peekbar"><b>강의 본문</b> 못 읽었다'+
    '<button class="g" id="peekClose" type="button">닫기</button></div>';
  var h='<div class="peekbar"><b>'+no+'강</b> '+esc(it.title||"")+
        ' · 읽는 자리다<button class="g" id="peekClose" type="button">닫기</button></div>';
  h+='<div class="lecbody">';
  it.blocks.forEach(function(b){
    h+='<h4>'+b.no+". "+esc(b.name)+"</h4>";
    h+=lecPara(b.body);
  });
  h+="</div>";
  return h;
}
/* 마크다운을 다 옮기지 않는다. 강의가 쓰는 것만 옮긴다.
   문단과 표와 목록이다. **안 쓰는 문법을 옮기면 안 쓰는 코드가 는다.**

   강의 문체는 한 문장 한 줄이고 빈 줄이 문단을 가른다.
   그래서 줄마다 문단으로 만들면 안 된다. 그러면 온 글이 뚝뚝 끊긴다.
   **줄바꿈은 살리고 문단만 벌린다.** */
function lecPara(body){
  var out="", rows=null, para=[];
  function flushPara(){
    if(!para.length) return;
    out+="<p>"+para.join("<br>")+"</p>";
    para=[];
  }
  function flushRows(){
    if(!rows) return;
    out+='<table class="lectab">'+rows.join("")+"</table>";
    rows=null;
  }
  body.split("\n").forEach(function(line){
    var s=line.trim();
    if(!s){ flushRows(); flushPara(); return; }
    if(s.charAt(0)==="|"){
      flushPara();
      var cells=s.replace(/^\||\|$/g,"").split("|");
      if(cells.every(function(c){ return /^\s*:?-{2,}:?\s*$/.test(c); })) return;
      if(!rows) rows=[];
      var tag=rows.length?"td":"th";
      rows.push("<tr>"+cells.map(function(c){
        return "<"+tag+">"+esc(c.trim())+"</"+tag+">"; }).join("")+"</tr>");
      return;
    }
    flushRows();
    if(/^[-*] /.test(s)){ flushPara(); out+='<div class="lecli">'+esc(s.slice(2))+"</div>"; return; }
    if(/^\d+\. /.test(s)){ flushPara(); out+='<div class="lecli">'+esc(s)+"</div>"; return; }
    para.push(esc(s));
  });
  flushRows(); flushPara();
  return out;
}
