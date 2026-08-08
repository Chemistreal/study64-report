/* =========================================================================
   미디어 라이브러리. VOA 자체 제작 퍼블릭 도메인 52개 레슨.
   음성은 저장소 사본, 영상은 공식 원본을 필요할 때만 불러온다.
   ========================================================================= */
var MEDIA=(window.ENG_MEDIA_CATALOG&&window.ENG_MEDIA_CATALOG.items)||[];
var LIB={active:-1,mode:"audio",el:null,rate:1};
LIB.rate=(+S.rate>=0.75&&+S.rate<=1.25)?+S.rate:1;   /* 고른 속도는 남는다. T135 */

function mediaRec(){
  if(!S.media||typeof S.media!=="object") S.media={done:{},fav:{},last:null};
  if(!S.media.done) S.media.done={};
  if(!S.media.fav) S.media.fav={};
  return S.media;
}
function mediaItem(i){ return i>=0&&i<MEDIA.length?MEDIA[i]:null; }
function setMediaFlag(kind,id,on){
  var r=mediaRec();
  if(on) r[kind][id]=true; else delete r[kind][id];
  save(); renderMediaStats(); renderMediaList(); paintMediaPlayer();
}
function renderMediaStats(){
  var box=$("#libStats"); if(!box) return;
  var done=MEDIA.filter(function(x){return mediaPassCount(x.id)===3;}).length;
  var passes=MEDIA.reduce(function(n,x){return n+mediaPassCount(x.id);},0);
  var next=MEDIA.filter(function(x){return mediaPassCount(x.id)<3;})[0];
  var nextPass=next?mediaNextPass(next.id):null;
  box.innerHTML="";
  [[passes+" / "+(MEDIA.length*3),"완료한 듣기 회차"],[done+" / "+MEDIA.length,"세 회차를 마친 레슨"],
   [next?(next.id.toUpperCase()+" · "+nextPass[1]):"완료","다음 학습 초점"]].forEach(function(x){
    var d=el("div","libstat"); d.appendChild(el("b",null,x[0])); d.appendChild(el("span",null,x[1])); box.appendChild(d);
  });
}
function paintMediaPlayer(){
  var it=mediaItem(LIB.active), p=$("#libPlayer"), empty=$("#libEmpty");
  if(!p||!empty) return;
  if(!it){ p.hidden=true; empty.hidden=false; return; }
  p.hidden=false; empty.hidden=true;
  $("#libTitle").textContent=it.title;
  var n=mediaPassCount(it.id), next=mediaNextPass(it.id);
  $("#libMeta").textContent="Q"+it.quarter+" · "+it.duration+" · "+(next?(next[0]+"회 "+next[1]+" 초점"):"3회차 완료");
  var r=mediaRec(), fav=!!r.fav[it.id], done=n===3;
  $("#libFav").textContent=fav?"★ 즐겨찾기":"☆ 즐겨찾기";
  $("#libFav").classList.toggle("on",fav); $("#libFav").setAttribute("aria-pressed",fav?"true":"false");
  $("#libDone").textContent=done?"세 회차 완료":next[0]+"회 "+next[1]+" 완료";
  $("#libDone").disabled=done;
  $("#libPage").href=it.page;
  $("#libTranscript").href=it.transcript||it.page; $("#libTranscript").hidden=!it.transcript;
  $("#libWorksheet").href=it.worksheet||it.page; $("#libWorksheet").hidden=!it.worksheet;
  $("#libDownload").href=it.audio; $("#libDownload").setAttribute("download",it.id+".mp3");
  $("#libPrev").disabled=LIB.active<=0; $("#libNext").disabled=LIB.active>=MEDIA.length-1;
  document.querySelectorAll("[data-lib-mode]").forEach(function(b){ b.classList.toggle("on",b.dataset.libMode===LIB.mode); });
  renderLibPass(it); renderLibScript(it);
}

/* 3회차 진행. 기준서 10.3은 같은 자료를 최소 3회 듣되 회차마다 초점을 바꾸라고 한다.
   카탈로그의 focus 는 1회차 권장값일 뿐이고 진행은 여기서 관리한다. */
var PASSES=[[1,"소리","어디가 줄었는지만 찾는다. 무슨 말인지는 묻지 않는다"],
            [2,"청크","통째로 굴러가는 덩어리를 찾는다. 단어로 쪼개지 않는다"],
            [3,"의미","이제 내용을 잡는다. 앞의 두 회차가 먼저다"]];
function passRec(){
  var r=mediaRec(); if(!r.pass) r.pass={};
  Object.keys(r.done).forEach(function(id){
    if(r.done[id]&&!r.pass[id]) r.pass[id]={1:true,2:true,3:true};
  });
  return r.pass;
}
function mediaPassCount(id){
  var cur=passRec()[id]||{}, n=0;
  PASSES.forEach(function(p){ if(cur[p[0]]) n++; });
  return n;
}
function mediaNextPass(id){
  var cur=passRec()[id]||{};
  return PASSES.filter(function(p){return !cur[p[0]];})[0]||null;
}
function curPassDone(id,pass){ return !!((passRec()[id]||{})[pass]); }
function syncMediaDone(id){
  var r=mediaRec();
  if(mediaPassCount(id)===3) r.done[id]=true; else delete r.done[id];
}
function renderLibPass(it){
  var box=$("#libPass"); if(!box) return;
  var pr=passRec(), cur=pr[it.id]||{};
  box.innerHTML="";
  var lab=el("div","small mut","회차 초점. 같은 자료를 세 번 듣고 매번 다른 것을 찾는다");
  lab.style.marginBottom="8px"; box.appendChild(lab);
  var row=el("div","row");
  var next=mediaNextPass(it.id);
  PASSES.forEach(function(p){
    var on=!!cur[p[0]];
    var b=el("button","g"+(on?" on":""),p[0]+"회 "+p[1]);
    b.type="button"; b.title=p[2]; b.disabled=!on&&(!next||p[0]!==next[0]);
    b.onclick=function(){
      var c=pr[it.id]||(pr[it.id]={});
      if(c[p[0]]) PASSES.forEach(function(q){ if(q[0]>=p[0]) delete c[q[0]]; });
      else if(mediaNextPass(it.id)&&p[0]===mediaNextPass(it.id)[0]) c[p[0]]=true;
      syncMediaDone(it.id); save(); renderMediaStats(); paintMediaPlayer(); renderMediaList();
    };
    row.appendChild(b);
  });
  box.appendChild(row);
  var n=PASSES.filter(function(p){return !!cur[p[0]];}).length;
  var next=PASSES.filter(function(p){return !cur[p[0]];})[0];
  box.appendChild(el("div","small mut",
    n+" / 3 회차 완료"+(next?".  다음: "+next[0]+"회 "+next[1]+". "+next[2]:".  세 회차를 다 돌았다")));
}

/* 대본. 조수가 catalog 의 transcript 를 채우면 코드 수정 없이 여기로 흐른다.
   문자열 배열과 {t, line} 객체 배열을 둘 다 받는다. */
function trLines(it){
  var tr=it&&it.transcript;
  if(!Array.isArray(tr)||!tr.length) return null;
  return tr.map(function(x){
    return (typeof x==="string") ? {t:null,line:x} : {t:(typeof x.t==="number"?x.t:null),line:String(x.line||"")};
  }).filter(function(x){ return x.line; });
}
/* 대본 파일(.md)에서 본문만 뽑는다. 머리말 메타는 버린다. */
function parseTranscriptMd(txt){
  var i=txt.indexOf("## 대본");
  var body=(i>=0)?txt.slice(i+"## 대본".length):txt;
  return body.split("\n").map(function(s){return s.trim();})
    .filter(function(s){ return s && s.charAt(0)!=="#" && s.indexOf("|")!==0; })
    .map(function(s){ return {t:null,line:s}; });
}
function renderLibScript(it){
  var box=$("#libScript"); if(!box) return;
  box.innerHTML="";
  var tr=it&&it.transcript;
  if(typeof tr==="string"&&tr){
    /* 묶어 둔 판을 먼저 본다. **fetch 는 file:// 에서 막힌다.**
       이 물건은 내려받아 여는 것이 정상 사용이고 블록 4는 대본을 보는 블록이다.
       T114 에서 대본 52편을 script 한 파일로 묶었다. 그것이 있으면 그것을 쓴다. */
    var packed=(window.ENG2P_TRANSCRIPTS&&window.ENG2P_TRANSCRIPTS.items)||null;
    if(packed && packed[it.id]){
      paintLibScript(it, packed[it.id].map(function(s){return {t:null,line:s};}));
      return;
    }
    if(!packed){
      box.innerHTML='<div class="note small" style="margin-bottom:0">대본 불러오는 중</div>';
      loadData("transcripts","ENG2P_TRANSCRIPTS",function(v){
        if(mediaItem(LIB.active)!==it) return;
        if(v&&v.items&&v.items[it.id])
          paintLibScript(it, v.items[it.id].map(function(s){return {t:null,line:s};}));
        else renderLibScript(it);
      });
      return;
    }
    box.innerHTML='<div class="note small" style="margin-bottom:0">대본 불러오는 중</div>';
    fetch(tr).then(function(r){ if(!r.ok) throw new Error(r.status); return r.text(); })
      .then(function(txt){
        if(mediaItem(LIB.active)!==it) return;   // 그 사이 다른 레슨으로 넘어갔으면 버린다
        paintLibScript(it, parseTranscriptMd(txt));
      })
      .catch(function(){
        if(mediaItem(LIB.active)!==it) return;
        box.innerHTML='<div class="note small" style="margin-bottom:0"><b>대본 파일을 이 방식으로는 못 연다.</b>'+
          '<div style="margin-top:4px">로컬 파일로 열면 브라우저가 다른 파일 읽기를 막는다. '+
          '배포된 주소에서 열면 바로 나온다. 지금은 위의 저장 대본 링크를 쓴다.<br><span class="mono">'+esc(tr)+'</span></div></div>';
      });
    return;
  }
  paintLibScript(it, trLines(it));
}
function paintLibScript(it, lines){
  var box=$("#libScript"); if(!box) return;
  box.innerHTML="";
  if(!lines||!lines.length){
    box.innerHTML='<div class="note small" style="margin-bottom:0"><b>대본이 아직 없다.</b> '+
      '위의 공식 원문 링크에서 확인한다. 카탈로그에 transcript 가 채워지면 여기에 자동으로 나온다. '+
      'eng2p/tasks/gpt_backlog.md T-001</div>';
    return;
  }
  var head=el("div","row"); head.style.margin="14px 0 6px";
  head.appendChild(el("b",null,"대본 "+lines.length+"줄"));
  var toClip=el("button","g","대본을 클립으로"); toClip.type="button";
  toClip.onclick=function(){
    var name=it.id+".mp3";
    S.scripts[name]=lines.map(function(x){ return {line:x.line, t:x.t}; });
    loadClipUrl(name, it.audio, false);
    var lab=$("#cLabel"); if(lab&&!lab.value) lab.value=it.title;
    $("#scText").value=lines.map(function(x){return x.line;}).join("\n");
    save(); renderScript(); go("clip");
    flash("대본 "+lines.length+"줄을 클립으로 보냈다");
  };
  head.appendChild(toClip);
  box.appendChild(head);
  lines.forEach(function(x){
    var d=el("div","clip");
    var top=el("div","hd2");
    var left=el("div"); left.style.flex="1"; left.style.minWidth="140px";
    left.appendChild(el("div",null,x.line));
    if(x.t!=null) left.appendChild(el("div","small mut tc",mmss(x.t)));
    top.appendChild(left);
    var acts=el("div","row"); acts.style.gap="6px";
    if(x.t!=null&&LIB.el){
      var jump=el("button","g","여기부터"); jump.type="button";
      jump.style.padding="3px 10px"; jump.style.fontSize="12px";
      jump.onclick=function(){ LIB.el.currentTime=x.t; var q=LIB.el.play(); if(q&&q.catch) q.catch(function(){}); };
      acts.appendChild(jump);
    }
    acts.appendChild(spkBtn(x.line.replace(/^[^:]{1,14}:\s*/,"")));
    top.appendChild(acts); d.appendChild(top);
    box.appendChild(d);
  });
}
/* 재생기를 만들어 자리에 건다. 미디어 탭과 세션 블록이 이 하나를 같이 쓴다.
   두 자리에 따로 만들면 T121 에서 낸 망 끊김 안내가 한 자리에만 생긴다.
   **한 자리에만 있는 안내는 다른 자리에서는 없는 것이다.** */
function mountPlayer(host, it, mode, opt){
  opt=opt||{};
  host.innerHTML="";
  var isVideo=mode==="video";
  var m=document.createElement(isVideo?"video":"audio");
  m.controls=true; m.preload="metadata"; m.playsInline=true;
  m.src=isVideo?it.video:(mode==="original"?it.originalAudio:it.audio);
  m.setAttribute("aria-label",it.title+" "+(isVideo?"영상":"음성"));
  try{m.preservesPitch=true;m.mozPreservesPitch=true;m.webkitPreservesPitch=true;}catch(e){}
  m.playbackRate=opt.rate||1;
  /* 영상은 원격이다. 소리와 대본과 이미지는 저장소 안에 있다.
     망이 끊기면 영상만 죽는데 그것이 **아무 말 없이 죽는다.**
     화면에는 안 되는 재생기만 남는다. 두 사람은 앱이 고장 난 줄 안다.
     왜 안 되는지 적고 저장된 소리로 가는 길을 같이 낸다. T121 에서 재 봤다. */
  m.onerror=function(){
    var old=document.getElementById(opt.noteId); if(old) old.remove();
    var box=el("div"); box.id=opt.noteId; box.className="note small w";
    host.parentNode.insertBefore(box, host.nextSibling);
    if(isVideo){
      box.innerHTML='<b>영상을 못 불러왔다.</b> 영상은 VOA 서버에서 바로 받는다. '+
        '망이 끊겼거나 그 주소가 바뀐 것이다.<br>'+
        '<b>소리와 대본은 저장소 안에 있어 망 없이도 된다.</b> '+
        '<button class="g" type="button" style="margin-top:7px">저장된 소리로</button>';
      var ta=box.querySelector("button");
      if(ta) ta.onclick=function(){ if(opt.onAudio) opt.onAudio(); };
    }else{
      box.innerHTML='<b>소리를 못 불러왔다.</b> '+
        '<span class="mono">'+esc(m.src)+'</span> 자리를 확인한다. '+
        '저장소를 통째로 내려받았는지 본다.';
    }
  };
  host.appendChild(m);
  if(opt.play){ var q=m.play(); if(q&&q.catch) q.catch(function(){}); }
  return m;
}
function openMedia(i,mode,play){
  var it=mediaItem(i); if(!it) return;
  LIB.active=i; LIB.mode=mode||"audio";
  var r=mediaRec(); r.last=it.id; save();
  if(LIB.el){ try{LIB.el.pause();}catch(e){} }
  var oldNote=$("#libMediaNote"); if(oldNote) oldNote.remove();
  LIB.el=mountPlayer($("#libMediaHost"), it, LIB.mode, {
    rate: LIB.rate, play: play!==false, noteId: "libMediaNote",
    onAudio: function(){ openMedia(LIB.active,"audio",true); },
  });
  paintMediaPlayer(); renderMediaList();
}
function renderMediaList(){
  var box=$("#libList"); if(!box) return;
  if(!MEDIA.length){
    box.innerHTML='<div class="note w small">미디어 목록을 불러오지 못했다. media/english/catalog.js 경로를 확인한다.</div>';
    return;
  }
  var q=$("#libQ").value, state=$("#libFilter").value;
  var needle=$("#libSearch").value.trim().toLowerCase(), r=mediaRec();
  var shown=MEDIA.map(function(x,i){return {x:x,i:i};}).filter(function(o){
    var x=o.x;
    if(q!=="all"&&String(x.quarter)!==q) return false;
    if(state==="done"&&mediaPassCount(x.id)<3) return false;
    if(state==="todo"&&mediaPassCount(x.id)===3) return false;
    if(state==="fav"&&!r.fav[x.id]) return false;
    return !needle||(x.title+" "+x.lesson+" "+x.focus).toLowerCase().indexOf(needle)>=0;
  });
  $("#libCount").textContent="전체 "+MEDIA.length+"개 중 "+shown.length+"개 표시";
  box.innerHTML="";
  shown.forEach(function(o){
    var x=o.x, passN=mediaPassCount(x.id), d=el("article","mitem"+(o.i===LIB.active?" on":"")+(passN===3?" done":""));
    if(x.image){
      var img=document.createElement("img"); img.className="mthumb"; img.src=x.image;
      img.alt=x.title+" 대표 이미지"; img.loading="lazy"; img.decoding="async"; d.appendChild(img);
    }
    var top=el("div","row");
    top.appendChild(el("span","mnum","Q"+x.quarter+" · "+x.id.toUpperCase()));
    var grow=el("span"); grow.style.flex="1"; top.appendChild(grow);
    if(r.fav[x.id]) top.appendChild(el("span","tag a","즐겨찾기"));
    if(passN===3) top.appendChild(el("span","tag o","3회 완료"));
    d.appendChild(top); d.appendChild(el("h4",null,x.title));
    var next=mediaNextPass(x.id);
    d.appendChild(el("div","small mut",x.duration+" · "+(next?"다음: "+next[0]+"회 "+next[1]:"소리·청크·의미 완료")));
    var passRow=el("div","mpasses");
    PASSES.forEach(function(p){ passRow.appendChild(el("span","mpass"+(curPassDone(x.id,p[0])?" done":""),p[1]+(curPassDone(x.id,p[0])?" ✓":""))); });
    d.appendChild(passRow);
    var acts=el("div","macts");
    var ab=el("button","b",passN?"이어서 듣기":"음성 듣기"); ab.type="button"; ab.onclick=function(){openMedia(o.i,"audio",true); $("#libPlayerCard").scrollIntoView({behavior:"smooth",block:"start"});};
    var fa=el("button","g",r.fav[x.id]?"★":"☆"); fa.type="button"; fa.title="즐겨찾기"; fa.setAttribute("aria-label",x.title+" 즐겨찾기");
    fa.onclick=function(){setMediaFlag("fav",x.id,!r.fav[x.id]);};
    var res=document.createElement("details"); res.className="mresources";
    var sum=document.createElement("summary"); sum.textContent="자료"; res.appendChild(sum);
    var links=el("div","mresourcebox");
    function addLink(label,href){ if(!href) return; var a=el("a",null,label); a.href=href; a.target="_blank"; a.rel="noopener noreferrer"; links.appendChild(a); }
    addLink("전체 영상",x.video); addLink("저장 대본",x.transcript); addLink("수업 PDF",x.worksheet); addLink("공식 원문",x.page);
    res.appendChild(links);
    acts.appendChild(ab); acts.appendChild(fa); acts.appendChild(res); d.appendChild(acts); box.appendChild(d);
  });
  if(!shown.length) box.innerHTML='<div class="note small"><b>조건에 맞는 레슨이 없다.</b> '+
    '위 검색칸을 비우거나 분기를 전체로 바꾼다.</div>';
}
function renderMedia(){
  mediaRec(); renderMediaStats(); renderMediaList();
  if(LIB.active<0&&S.media.last){
    var i=MEDIA.findIndex(function(x){return x.id===S.media.last;});
    if(i>=0) openMedia(i,"audio",false);
  }else paintMediaPlayer();
}

document.querySelectorAll("[data-lib-mode]").forEach(function(b){
  b.onclick=function(){ if(LIB.active>=0) openMedia(LIB.active,b.dataset.libMode,true); };
});
$("#libFav").onclick=function(){ var x=mediaItem(LIB.active); if(x) setMediaFlag("fav",x.id,!mediaRec().fav[x.id]); };
$("#libDone").onclick=function(){
  var x=mediaItem(LIB.active); if(!x) return;
  var next=mediaNextPass(x.id); if(!next) return;
  var c=passRec()[x.id]||(passRec()[x.id]={}); c[next[0]]=true;
  syncMediaDone(x.id); save(); renderMediaStats(); paintMediaPlayer(); renderMediaList();
};
$("#libPrev").onclick=function(){ if(LIB.active>0) openMedia(LIB.active-1,LIB.mode,true); };
$("#libNext").onclick=function(){ if(LIB.active<MEDIA.length-1) openMedia(LIB.active+1,LIB.mode,true); };
$("#libBack").onclick=function(){ if(LIB.el) LIB.el.currentTime=Math.max(0,LIB.el.currentTime-3); };

/* 라이브러리와 클립 도구를 잇는다.
   여기까지 와야 파이프라인이 하나로 돈다.
   레슨 -> 구간 반복 -> 들린 표현 채집 -> 주간 판정 -> 간격 반복 복습. */
$("#libToClip").onclick=function(){
  var it=mediaItem(LIB.active); if(!it) return;
  if(LIB.el){ try{ LIB.el.pause(); }catch(e){} }
  var isVid=LIB.mode==="video";
  var src=isVid?it.video:(LIB.mode==="original"?it.originalAudio:it.audio);
  loadClipUrl(it.id+(isVid?".mp4":".mp3"), src, isVid);
  var lab=$("#cLabel"); if(lab&&!lab.value) lab.value=it.title;
  go("clip");
  flash(it.title+" 를 클립으로 보냈다");
};
/* **선을 두 자리에서 다르게 두면 안 된다.** 전에는 여기가 0.6~1.2 였고
   세션 칸은 0.75~1.25 였다. 같은 값을 두 자리가 다르게 잘랐다. 로드맵 11.9의
   0.75~1.25 로 맞췄다. setRate 가 그 선을 지키는 한 자리다. T135 */
$("#libRate").oninput=function(){ setRate(+this.value); };
setRate(rateOf());   /* 저장해 둔 속도를 화면에 올린다 */
$("#libSearch").oninput=renderMediaList; $("#libQ").onchange=renderMediaList; $("#libFilter").onchange=renderMediaList;

