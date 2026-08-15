/* 찾기 (T395).

   ## 1년치를 뒤질 길이 없었다

   찾는 칸이 미디어 탭 안에 하나 있었고 그것은 52과 제목만 본다.
   강의 96편도 카드 600장도 세트 288개도 대본 52편도 못 찾았다.

   제일 나쁜 것은 **두 사람이 적은 것**이었다. 미해결 LRE 와 채집 표현은
   그날 칸에만 그려진다. 어제 적은 것은 오늘 화면에 안 뜬다.
   판정 탭이 전체를 돌기는 하는데 거기서도 훑을 뿐 찾지는 못한다.
   쉰 주째면 수백 건이다. **적어 두고 다시 못 보면 안 적은 것과 같다.**

   ## 우리가 적은 것이 먼저다

   갈래를 다섯 두고 우리가 적은 것을 맨 위에 둔다. 그것은 저장소에 있어서
   아무것도 안 읽어도 곧바로 나온다. 자료는 읽어야 나오고 그동안 기다린다.
   **기다리는 동안에도 우리가 적은 것은 이미 떠 있다.**

   ## 판정을 안 한다

   몇 건인지는 적는다. 그것이 잘한 것도 못한 것도 아니다.
   많이 적은 주와 적게 적은 주를 견주지 않는다 (`tone.md`). */

/* 갈래. `data` 가 없으면 저장소에서 온다. **읽을 것이 없다** */
var FIND_KIND=[
  {k:"mine", name:"우리가 적은 것"},
  {k:"lec",  name:"강의 96",   data:"lectures",    global:"ENG2P_LECTURES"},
  {k:"card", name:"카드 600",  data:"cards",       global:"ENG2P_CARDS"},
  {k:"set",  name:"세트 288",  data:"sets",        global:"ENG2P_SETS"},
  {k:"scr",  name:"대본 52",   data:"transcripts", global:"ENG2P_TRANSCRIPTS"}
];
var FIND_ON={mine:true,lec:true,card:true,set:true,scr:true};
/* 한 갈래에서 이만큼까지 찾는다. 그 위는 안 센다 */
var FIND_CAP=60;
/* 처음에 보이는 줄. **다 보이면 어느 것도 안 보인다.**
   갈래 다섯이 다 펼쳐지니 결과가 5780px 이었다. 손가락으로 한참 민다.
   갈래마다 몇 건인지는 제목에 적으니 접혀 있어도 어디 있는지는 안다. */
var FIND_SHOW=6;
var FIND_MORE={};
/* 읽으러 간 자료. 두 번 안 간다 */
var FIND_ASKED={};

function findNorm(s){ return String(s==null?"":s).toLowerCase(); }
/* 찾은 자리를 굵게. **찾은 말만 굵게 한다.** 줄 전체를 굵게 하면 못 읽는다 */
function findMark(text, q){
  var t=String(text==null?"":text), i=findNorm(t).indexOf(findNorm(q));
  if(i<0) return esc(t);
  return esc(t.slice(0,i))+"<b>"+esc(t.slice(i,i+q.length))+"</b>"+esc(t.slice(i+q.length));
}
/* 긴 줄은 찾은 자리 둘레만 자른다. 앞뒤를 얼마나 남길지는 한 값으로 둔다 */
function findCut(text, q, span){
  var t=String(text==null?"":text), i=findNorm(t).indexOf(findNorm(q));
  if(i<0 || t.length<=span) return t;
  var from=Math.max(0,i-Math.floor(span/3));
  var out=t.slice(from, from+span);
  return (from?"...":"")+out+((from+span<t.length)?"...":"");
}

/* 우리가 적은 것. **날을 거꾸로 돈다.** 가까운 날이 먼저다 */
function findMine(q){
  var out=[], days=Object.keys(S.days||{}).sort();
  for(var i=days.length-1;i>=0 && out.length<FIND_CAP*3;i--){
    var d=days[i], r=S.days[d]||{};
    (r.unres||[]).forEach(function(u){
      var hay=[u.t,u.i,u.k,u.h,u.w].join(" ");
      if(findNorm(hay).indexOf(findNorm(q))<0) return;
      out.push({day:d, tag:"미해결 LRE", head:u.t||"(문장 없음)",
                body:[u.i?"걸린 것: "+u.i:"", u.h?S.names.a+": "+u.h:"",
                      u.w?S.names.b+": "+u.w:""].filter(Boolean).join(" · ")});
    });
    (r.coll||[]).forEach(function(c){
      var hay=[c.e,c.s,c.q,c.k].join(" ");
      if(findNorm(hay).indexOf(findNorm(q))<0) return;
      out.push({day:d, tag:"채집 표현", head:c.e||"(표현 없음)",
                body:"출처: "+(c.s||"(없음)")+(c.q?" · "+c.q:"")});
    });
  }
  return out;
}

function findLec(q, D){
  var out=[];
  (D.items||[]).forEach(function(x){
    if(out.length>=FIND_CAP) return;
    var hay=[x.no+"강", x.title, x.track, x.quarter, x.media].join(" ");
    if(findNorm(hay).indexOf(findNorm(q))<0) return;
    out.push({head:x.no+"강 "+x.title, go:"l:"+x.no,
              body:x.quarter+" · "+x.track+" 트랙 · "+x.week+"주 · 카드 "+
                   (x.cards?x.cards.from+"~"+x.cards.to:"-")});
  });
  return out;
}
/* 카드 번호로 그 강을 찾는다. **강의 자료가 읽혀 있을 때만 된다.**
   없으면 안 적는다. 지어내면 엉뚱한 강으로 보낸다. */
function findLecOfCard(no){
  var D=DATA.lectures; if(!D||!D.items) return null;
  for(var i=0;i<D.items.length;i++){
    var c=D.items[i].cards;
    if(c && no>=c.from && no<=c.to) return D.items[i].no;
  }
  return null;
}
function findCard(q, D){
  var out=[];
  (D.items||[]).forEach(function(x){
    if(out.length>=FIND_CAP) return;
    var mat=((x.a&&x.a.material)||[]).join(" / ");
    var hay=[x.id, x.type, mat, (x.a&&x.a.instruction)||""].join(" ");
    if(findNorm(hay).indexOf(findNorm(q))<0) return;
    /* **답을 안 담는다.** 판정형 정답은 A면에만 있고 여기는 A면이 아니다 */
    var ln=findLecOfCard(x.no);
    out.push({head:x.id+" "+x.type+"형"+(ln?" · "+ln+"강":""),
              go:ln?("l:"+ln):null, body:findCut(mat,q,120)});
  });
  return out;
}
function findSet(q, D){
  var out=[];
  (D.items||[]).forEach(function(x){
    if(out.length>=FIND_CAP) return;
    var lines=[];
    (x.steps||[]).forEach(function(s){
      lines.push(s.name);
      (s.items||[]).forEach(function(t){ lines.push(t); });
    });
    var hay=[x.id].concat(lines).join(" ");
    if(findNorm(hay).indexOf(findNorm(q))<0) return;
    var hit=lines.filter(function(t){ return findNorm(t).indexOf(findNorm(q))>=0; })[0];
    out.push({head:x.id+" 세트 ("+x.week+"주)", go:"l:"+x.lecture,
              body:findCut(hit||lines[0]||"",q,120)});
  });
  return out;
}
function findScr(q, D){
  var out=[], items=D.items||{};
  Object.keys(items).forEach(function(id){
    (items[id]||[]).forEach(function(line, n){
      if(out.length>=FIND_CAP) return;
      if(findNorm(line).indexOf(findNorm(q))<0) return;
      out.push({head:id+" "+(n+1)+"째 줄", go:"m:"+id, body:findCut(line,q,120)});
    });
  });
  return out;
}

/* 갈래 하나를 그린다. 자료가 아직 없으면 읽으러 가고 그동안 기다린다고 적는다 */
function findOne(kind, q){
  if(kind.k==="mine") return {rows:findMine(q)};
  var D=DATA[kind.data];
  if(!D){
    /* 이름을 다시 안 적는다. 제목이 바로 위에 있어서
       "강의 96 강의 96 를 여는 중이다" 가 됐다 */
    if(dataFailed(kind.data)) return {wait:dataWait("이 갈래를", kind.data)};
    /* **한 번만 읽으러 간다.** 치는 대로 다시 그리는 자리라 그냥 두면
       글자 수만큼 콜백이 쌓이고 자료가 오는 순간 그만큼 다시 그린다.
       T388 에 자료가 3초에 1432번 불린 것과 같은 갈래다. */
    if(!FIND_ASKED[kind.data]){
      FIND_ASKED[kind.data]=true;
      loadData(kind.data, kind.global, function(){ renderFind(); });
    }
    return {wait:dataWait("이 갈래를", kind.data)};
  }
  if(kind.k==="lec")  return {rows:findLec(q,D)};
  if(kind.k==="card") return {rows:findCard(q,D)};
  if(kind.k==="set")  return {rows:findSet(q,D)};
  return {rows:findScr(q,D)};
}

function renderFindKinds(){
  var box=$("#fdKinds"); if(!box || box.children.length) return;
  FIND_KIND.forEach(function(k){
    var b=el("button","g"+(FIND_ON[k.k]?" on":""),k.name);
    b.type="button"; b.dataset.fk=k.k;
    b.setAttribute("aria-pressed",FIND_ON[k.k]?"true":"false");
    b.onclick=function(){
      FIND_ON[k.k]=!FIND_ON[k.k];
      b.classList.toggle("on",FIND_ON[k.k]);
      b.setAttribute("aria-pressed",FIND_ON[k.k]?"true":"false");
      renderFind();
    };
    box.appendChild(b);
  });
}

function renderFind(){
  var out=$("#fdOut"); if(!out) return;
  renderFindKinds();
  var q=($("#fdQ")&&$("#fdQ").value||"").trim();
  if(q.length<2){
    /* **0건이라고 안 적는다.** 아직 안 찾은 것이지 없는 것이 아니다 */
    out.innerHTML='<div class="card tight small mut">두 글자부터 찾는다. '+
      '영어 표현을 그대로 쳐도 되고 한국어로 쳐도 된다. '+
      '<b>우리가 적은 것</b>은 이 기기에 있어서 곧바로 나온다.</div>';
    return;
  }
  var h="", any=false;
  FIND_KIND.forEach(function(k){
    if(!FIND_ON[k.k]) return;
    any=true;
    var got=findOne(k,q);
    if(got.wait){ h+='<h3>'+esc(k.name)+'</h3>'+got.wait; return; }
    var rows=got.rows, n=rows.length;
    /* **건수를 제목에 적는다.** 접혀 있어도 어디 있는지는 알아야 한다.
       많다 적다를 안 적는다. 수만 적는다 (`tone.md`). */
    h+='<h3>'+esc(k.name)+' <span class="mut" style="font-weight:600">'+
       (n>=FIND_CAP?FIND_CAP+"건 넘음":n+"건")+'</span></h3>';
    /* 빈 갈래는 한 줄이다. 카드로 두었더니 갈래마다 120px 씩 먹었다.
       **없다는 것도 알려야 할 것이라 안 지운다.** 자리만 줄인다 */
    if(!n){ h+='<div class="fdnone small mut">여기에는 없다.</div>'; return; }
    var show=FIND_MORE[k.k]?n:Math.min(n,FIND_SHOW);
    h+='<div class="card tight">';
    rows.slice(0,show).forEach(function(r){
      var head=findMark(r.head,q), body=r.body?findMark(r.body,q):"";
      var meta=r.day?'<span class="tag">'+esc(r.day)+'</span> <span class="tag">'+esc(r.tag)+'</span> ':"";
      if(r.go){
        h+='<button type="button" class="fdrow gto" data-go="'+esc(r.go)+'">'+
           '<div class="fdhead">'+meta+head+'</div>'+
           (body?'<div class="small mut">'+body+'</div>':"")+'</button>';
      }else{
        h+='<div class="fdrow"><div class="fdhead">'+meta+head+'</div>'+
           (body?'<div class="small mut">'+body+'</div>':"")+'</div>';
      }
    });
    if(n>show)
      h+='<button type="button" class="g fdmore" data-fm="'+esc(k.k)+'">'+
         (n-show)+'건 더 보기</button>';
    else if(FIND_MORE[k.k] && n>FIND_SHOW)
      h+='<button type="button" class="g fdmore" data-fm="'+esc(k.k)+'">접기</button>';
    h+='</div>';
  });
  if(!any) h='<div class="card tight small mut">갈래를 하나도 안 골랐다. 위에서 고른다.</div>';
  out.innerHTML=h;
  if(typeof bindSheetGo==="function") bindSheetGo(out);
  out.querySelectorAll("[data-fm]").forEach(function(b){
    b.onclick=function(){
      var k=b.getAttribute("data-fm");
      FIND_MORE[k]=!FIND_MORE[k];
      renderFind();
    };
  });
}

/* 치는 대로 찾는다. **손이 멈추면 찾는다.** 한 글자마다 찾으면 손이 끊긴다 */
var findTimer=null;
if($("#fdQ")) $("#fdQ").oninput=function(){
  clearTimeout(findTimer);
  /* 찾을 말이 바뀌면 펴 둔 갈래를 접는다. 앞 결과의 자리가 남으면 헷갈린다 */
  findTimer=setTimeout(function(){ FIND_MORE={}; renderFind(); },180);
};
