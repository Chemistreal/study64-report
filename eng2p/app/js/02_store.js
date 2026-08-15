/* =========================================================================
   저장소
   ========================================================================= */
var KEY="eng2p.v1";
/* 사본 이름과 벌 수도 **여기 있어야 한다.** 아래 사본 문단에 두었더니
   load() 안에서 BAK 가 undefined 였고 사본이 하나도 안 보였다. 화면에는
   아무 표시가 없다. 깨진 날에만 드러난다. 아래 LOAD_ERR 과 같은 자리다. */
var BAK=KEY+".bak.";
var BAK_KEEP=7;
/* **이 줄이 load() 호출보다 위에 있어야 한다.**
   var 는 끌어올려지지만 대입은 안 그렇다. 아래에 두면 load() 가 넣은 값을
   그 다음 줄이 null 로 도로 지운다. T165 에 검사가 그것을 잡았다. */
var LOAD_ERR=null;
var S=load();

function blank(){
  return {names:{a:"남편",b:"아내"},start:iso(new Date()),days:{},q:{},rot:[],clips:[],scripts:{},
          media:{done:{},fav:{},last:null,pass:{}},wk:0,onboarded:false,session:null,device:null,recOpen:false,emgOpen:false,card:null,cardDue:{},cardMode:"today",cues:{},rate:1,fs:0,wchk:{},solo:false,soloSeat:0,soloHand:false,veiled:false,rstep:{},rseat:{},
          /* 배속 사다리 칸 (T372). **몇 번 만에 올라갔는지는 안 남긴다** */
          rung:{},
          /* 마지막으로 JSON 을 내보낸 날 (T390). 사본은 이 기기에만 있다 */
          exportAt:null};
}
/* 기기 설정 (T383). **저장소(S)와 다른 칸이다.**

   소리와 진동을 켰나 껐나는 기기마다 다르다. 헤드폰을 쓰는 사람과
   주머니에 넣는 사람이 같은 값을 들면 안 된다.

   `S` 에 넣으면 JSON 내보내기에 실리고 가져오기가 저쪽 값을 이쪽에 덮는다.
   그래서 키를 따로 쓴다. **저장소를 만지는 코드는 여기 한 자리에 모은다.**
   흩어지면 못 읽을 때 처리가 갈린다. */
/* **판(v1)에 안 매단다.** 기록은 판이 바뀌면 옮겨 주지만 설정은 그럴 것이 없다 */
var PREF_KEY="eng2p.snd";
function prefGet(){
  try{ return JSON.parse(localStorage.getItem(PREF_KEY)||"{}")||{}; }
  catch(e){ return {}; }
}
function prefSet(k,v){
  var o=prefGet(); o[k]=!!v;
  try{ localStorage.setItem(PREF_KEY, JSON.stringify(o)); }catch(e){}
}

/* 날마다 사본 (T390).

   ## 1년치가 한 벌에만 있었다

   깨지면 `.broken` 으로 옮겨 두기는 했다. 그런데 **옮겨 둔 것은 못 읽는 글자다.**
   되살릴 길이 없었다. 두 사람이 1년을 쌓은 값이 브라우저 칸 하나에 있었다.

   재 봤더니 1년치가 **115KB** 다. 저장소는 보통 5MB 다.
   사본 일곱 벌이 805KB 고 그것으로 이레를 되짚을 수 있다.

   ## 덮기 전에 남긴다

   그날 처음 저장할 때 **덮이기 전의 판**을 사본으로 남긴다.
   하루에 한 벌이고 이레를 넘으면 오래된 것부터 지운다.

   ## 사본이 저장을 막으면 안 된다

   사본을 못 남겨도 저장은 돌아야 한다. 순서가 그래서 중요하다.
   사본 쓰기가 실패하면 조용히 지나간다. **본 기록이 먼저다.**

   이름과 벌 수는 이 파일 맨 위에 있다. load() 보다 위여야 한다. */
function bakList(){
  var out=[];
  try{
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i);
      if(k && k.indexOf(BAK)===0) out.push(k);
    }
  }catch(e){}
  return out.sort();
}
function bakKeep(){
  try{
    var k=BAK+iso(new Date());
    if(localStorage.getItem(k)!=null) return;   /* 오늘 것은 이미 있다 */
    var cur=localStorage.getItem(KEY);
    if(!cur) return;
    /* **못 읽는 글자는 사본이 아니다.** 그것까지 남기면 오늘 한 자리를
       쓰레기가 차지하고 그만큼 되살릴 수 있는 날이 하루 줄어든다.
       깨진 글자 자체는 load() 가 .broken 으로 따로 옮겨 뒀다. */
    try{ var o=JSON.parse(cur); if(!o||typeof o!=="object") return; }
    catch(e2){ return; }
    localStorage.setItem(k,cur);
    var all=bakList();
    while(all.length>BAK_KEEP) localStorage.removeItem(all.shift());
  }catch(e){}
}
/* 사본 한 벌을 읽는다. 못 읽으면 null. **되살리는 것은 여기서 안 한다.**
   읽는 것과 덮는 것을 한 함수에 두면 보기만 하려다 덮는 날이 온다. */
function bakRead(day){
  try{
    var o=JSON.parse(localStorage.getItem(BAK+day));
    return (o && typeof o==="object") ? o : null;
  }catch(e){ return null; }
}
/* 제일 최근 사본. 못 읽으면 그 앞 것을 본다. **하나가 깨져도 이레가 남는다** */
function bakLatest(){
  var all=bakList();
  for(var i=all.length-1;i>=0;i--){
    try{
      var o=JSON.parse(localStorage.getItem(all[i]));
      if(o && typeof o==="object") return {day:all[i].slice(BAK.length), data:o};
    }catch(e){}
  }
  return null;
}

/* **못 읽은 기록을 지우지 않는다.**
   전에는 JSON 이 깨지면 조용히 빈 상태로 시작했다. 1년치 기록이 아직 거기 있는데
   화면에는 0회로 나온다. 두 사람은 그것이 사라졌다고 여기고 다시 시작한다.
   그리고 다음 저장이 그 위를 덮는다. **그때 진짜로 사라진다.**
   그래서 못 읽은 글자는 따로 옮겨 두고 그 사실을 화면에 말한다. */
function load(){
  var raw=null;
  try{ raw=localStorage.getItem(KEY); }
  catch(e){ LOAD_ERR="저장소를 못 읽었다"; return blank(); }
  if(!raw) return blank();
  try{
    var o=JSON.parse(raw); var b=blank();
    for(var k in b) if(!(k in o)) o[k]=b[k];
    return o;
  }catch(e){
    try{ localStorage.setItem(KEY+".broken."+Date.now(), raw); }catch(e2){}
    /* **사본이 있으면 그것으로 되살린다** (T390).
       전에는 여기서 빈 상태로 시작했다. 못 읽은 글자를 옮겨 두기는 했지만
       그것은 되살릴 수 없는 글자다. 두 사람은 1년치가 사라진 화면을 본다. */
    var b=bakLatest();
    if(b){
      var bl=blank();
      for(var k2 in bl) if(!(k2 in b.data)) b.data[k2]=bl[k2];
      LOAD_ERR="기록이 깨져서 "+b.day+" 사본으로 되살렸다. "+
        "그 뒤에 적은 것은 안 들어 있다. 대장 탭에서 JSON 을 내려받아 둔다";
      return b.data;
    }
    LOAD_ERR="기록을 못 읽었다. 지우지 않고 "+KEY+".broken 으로 옮겨 뒀다";
    return blank();
  }
}

/* 저장은 이 세 함수만 한다. **다른 자리에서 localStorage 를 직접 안 만진다.**
   흩어지면 어느 길로 쓴 값이 안 남았는지 알 수 없게 된다. */
var saveTimer=null;
function writeNow(){
  var text=JSON.stringify(S);
  /* **덮기 전에 남긴다** (T390). 사본이 실패해도 저장은 돌아야 한다 */
  bakKeep();
  try{
    localStorage.setItem(KEY,text);
  }catch(e){
    toast("저장 실패. 브라우저 저장 공간을 확인한다.");
    return false;
  }
  /* 쓴 뒤에 읽어 본다. 저장소가 꽉 차면 오류 없이 잘려 들어가는 브라우저가 있다. */
  try{
    if(localStorage.getItem(KEY)!==text){
      toast("저장이 온전하지 않다. 대장 탭에서 JSON 을 내려받아 둔다.");
      return false;
    }
  }catch(e){}
  return true;
}
/* 미루지 않고 바로 쓴다. **연달아 누르고 바로 닫으면 마지막 값이 안 남는다.**
   save() 는 120밀리초를 미루는데 100밀리초 간격으로 누르면 그 타이머가 계속 밀린다.
   T101 에서 세션 상태로 같은 것을 겪었다. 잃으면 안 되는 값은 여기로 쓴다. */
function saveNow(){ clearTimeout(saveTimer); saveTimer=null; return writeNow(); }
function save(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(function(){ saveTimer=null; writeNow(); },120);
}
/* 창이 닫히거나 화면이 숨을 때 미뤄 둔 저장을 흘려 보낸다.
   **120밀리초는 짧아 보이지만 마지막 한 번을 잃기에는 넉넉하다.** */
function flushSave(){ if(saveTimer) saveNow(); }
window.addEventListener("pagehide",flushSave);
document.addEventListener("visibilitychange",function(){
  if(document.visibilityState==="hidden") flushSave();
});
/* 전체 지우기. 이것도 저장소 일이라 여기 둔다. */
function wipeStore(){
  try{ localStorage.removeItem(KEY); }catch(e){}
  S=blank();
  return saveNow();
}
function day(d){
  /* 칸이 빠진 기록이 들어올 수 있다. 예전 판이 남긴 것이거나 손으로 넣은 것이다.
     하나만 없어도 그 줄을 읽는 자리에서 앱 전체가 멈춘다.
     T98 에서 겪었다. status 만 든 기록을 넣었더니 첫 화면이 안 떴다. */
  var b={status:null,started:null,speak:0,cards:0,lre:0,unres:[],coll:[],
          aim:{a:"",b:"",same:0,diff:0},xchk:{a:"",b:""}};
  var r=S.days[d];
  if(!r){ S.days[d]=b; return b; }
  for(var k in b) if(!(k in r)) r[k]=b[k];
  return r;
}

/* =========================================================================
   유틸
   ========================================================================= */
/* **적는 칸의 값을 그리는 글에 넣지 않는다.**
   블록 칸은 세션이 도는 동안 매초 다시 그려진다. 값이 그리는 글 안에 있으면
   한 글자 칠 때마다 글이 달라지고 칸이 통째로 갈린다. 그러면 손이 끊긴다.
   그래서 값은 그린 뒤에 넣는다. 그리는 글은 늘 같으니 칸이 안 갈린다.

   그리고 **손이 올라가 있는 칸은 안 건드린다.** 매초 값을 다시 넣으면
   글자는 같아도 자리가 끝으로 튄다. 가운데를 고치던 손이 끝으로 밀린다. T211 */
function fillField(id, val){
  var el=document.getElementById(id);
  if(!el || el===document.activeElement) return;
  if(el.value!==val) el.value=val;
}
function $(s,r){return (r||document).querySelector(s);}
function el(t,c,x){var e=document.createElement(t); if(c)e.className=c; if(x!=null)e.textContent=x; return e;}
function iso(d){
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function parseISO(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
/* 초를 분초로. **늦게 읽는 클립 조각에 있었다** (T331 뒤).
   그 조각을 늦게 읽게 옮기면서 여기로 왔다. 되풀이 목록도 이것을 쓴다.
   **한 자리에서만 쓰는 줄 알았는데 두 자리에서 썼다.** */
function mmss(s){
  if(s==null||isNaN(s)) return "-";
  s=Math.max(0,s);
  var m=Math.floor(s/60), r=s-m*60;
  return m+":"+(r<10?"0":"")+r.toFixed(1);
}
function addDays(s,n){var d=parseISO(s); d.setDate(d.getDate()+n); return iso(d);}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];});}
function today(){return iso(new Date());}
function roleOf(d){ return parseISO(d).getDate()%2===0 ? "a" : "b"; }

