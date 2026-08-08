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


/* =========================================================================
   48주 길 지도.

   띠는 어디까지 왔는지만 말했다. **어느 주에 무엇이 있는지는 안 말했다.**
   그것을 알려면 자료 탭으로 가서 96편 중에 찾아야 했다.

   한 장에 편다. 주마다 칸 하나, 칸 안에 여섯 날이다.
   지나온 날은 채우고 오늘은 테두리를 두른다. 분기가 바뀌는 자리에 금을 긋는다.

   **누르면 그 주에 무엇이 있는지 펴진다.** 강의 둘과 세트 여섯이다.
   ========================================================================= */
var MAPOPEN=null;
function pad3(n){ return String(n).padStart(3,"0"); }
/* 어떤 날이 몇이었나. **진도가 아니라 앉은 날을 센다.** */
function dayTally(){
  var t={normal:0,emg:0,absent:0};
  Object.keys(S.days||{}).forEach(function(d){
    var s=(S.days[d]||{}).status;
    if(s==="normal") t.normal++;
    else if(s==="emg") t.emg++;
    else if(s==="absent") t.absent++;
  });
  return t;
}
function renderMapPane(){
  if(!IDX) return '<div class="peekbar"><b>길 지도</b> 차림표를 못 읽었다'+
    '<button class="g" id="peekClose" type="button">닫기</button></div>';
  var pl=plan();
  var h='<div class="peekbar"><b>48주 길</b> '+
        (pl.finished?"288세션을 다 했다":pl.week+"주 "+pl.day+"일째")+
        '<button class="g" id="peekClose" type="button">닫기</button></div>';
  /* **계획만 있고 무슨 일이 있었는지가 없었다.**
     칸이 채워지는 것은 세션 수로만 정해진다. 그래서 비상판으로 때운 날도
     결석한 날도 지도에 안 나온다. 두 사람은 지도를 보고 순조롭다고 여긴다.

     진도는 세션 수로 세고 달력은 날짜로 센다. **둘의 차이가 이 지도의 값이다.**
     달력상 지금 있어야 할 주를 따로 표시한다. T181 */
  var tally=dayTally();
  h+='<div class="wmap">';
  (IDX.weeks||[]).forEach(function(wk){
    var w=wk.week, cls=["wcell"];
    if(w<pl.week) cls.push("done");
    if(w===pl.week) cls.push("now");
    if(w===pl.calWeek && w!==pl.week) cls.push("cal");
    if(w%12===1 && w>1) cls.push("qstart");
    h+='<button type="button" class="'+cls.join(" ")+'" data-w="'+w+'"'+
       ' aria-label="'+w+'주 '+esc(wk.quarter||"")+'">';
    h+='<span class="wno">'+w+'</span><span class="wdots">';
    for(var d=1;d<=6;d++){
      var on=(w<pl.week)||(w===pl.week&&d<=(pl.day||0));
      h+='<i class="'+(on?"on":"")+'"></i>';
    }
    h+='</span></button>';
  });
  h+='</div>';
  h+='<div class="wlegend"><span><i class="lg done"></i>지나온 주</span>'+
     '<span><i class="lg now"></i>이번 주</span>'+
     (pl.behind>0?'<span><i class="lg cal"></i>달력상 이번 주</span>':"")+
     '<span><i class="lg"></i>남은 주</span></div>';
  /* 지도 아래 한 줄. **채워진 칸이 안 말하는 것을 여기서 말한다.** */
  h+='<div class="wtally">'+
     '<span><b>'+tally.normal+'</b>일 정상</span>'+
     '<span><b>'+tally.emg+'</b>일 비상판</span>'+
     '<span><b>'+tally.absent+'</b>일 결석</span>'+
     (pl.behind>0?'<span class="warn">달력보다 <b>'+pl.behind+'</b>주 밀렸다</span>':"")+
     '</div>';
  if(tally.emg||tally.absent){
    h+='<div class="wnote">비상판과 결석은 칸을 안 채운다. '+
       '진도는 정상 세션으로만 는다. 매뉴얼 2.2 가 그렇게 정한다.</div>';
  }
  if(MAPOPEN) h+=weekCard(MAPOPEN);
  return h;
}
function weekCard(w){
  var wk=(IDX.weeks||[]).filter(function(x){return x.week===w;})[0];
  if(!wk) return "";
  var h='<div class="wdetail"><h4>'+w+'주 · '+esc(wk.quarter||"")+'</h4>';
  (wk.lectures||[]).forEach(function(L){
    h+='<button type="button" class="wlec" data-go="l:'+L.no+'">'+
       '<b>'+L.no+'강</b> '+esc(L.title||"")+
       '<span class="wtrack">'+esc(L.track||"")+'</span></button>';
    /* **그 주에 무엇이 있는지가 반만 나왔다.** 강의와 세트는 적었는데
       그 강이 쓰는 소리와 그날 못 할 때 쓰는 비상판은 안 적었다.
       매일 쓰는 넷 중 둘이 빠져 있었다. T180 */
    var line=[];
    if(L.cards) line.push("카드 "+pad3(L.cards.from)+" ~ "+pad3(L.cards.to));
    if(L.emergency!=null) line.push("비상판 "+L.emergency);
    if(line.length) h+='<div class="wsub">'+esc(line.join(" · "))+'</div>';
    if(L.media) h+='<button type="button" class="wmed" data-go="m:'+esc(L.media)+'">'+
      '소리 '+esc(L.media)+'</button>';
  });
  h+='<div class="wsets">세트 '+esc((wk.sets||[]).join(" "))+'</div>';
  if(wk.task) h+='<div class="wsets">과제 '+wk.task.minChars+'자</div>';
  h+='</div>';
  return h;
}
function bindMapPane(box){
  box.querySelectorAll("[data-w]").forEach(function(b){
    b.onclick=function(){
      var w=+b.dataset.w;
      MAPOPEN=(MAPOPEN===w)?null:w;
      PANE.sig=null; renderBlockPane();
    };
  });
  box.querySelectorAll("[data-go]").forEach(function(b){
    b.onclick=function(){
      var v=b.getAttribute("data-go");
      if(v.indexOf("l:")===0){ peekLecture(+v.slice(2)); return; }
      if(v.indexOf("m:")===0){
        var id=v.slice(2);
        needMedia(function(){
          var i=MEDIA.findIndex(function(x){return x.id===id;});
          if(i<0){ flash("그 과를 못 찾았다"); return; }
          openMedia(i,"audio",false); go("media");
        });
      }
    };
  });
}
