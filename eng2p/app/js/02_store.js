/* =========================================================================
   저장소
   ========================================================================= */
var KEY="eng2p.v1";
var S=load();

function blank(){
  return {names:{a:"남편",b:"아내"},start:iso(new Date()),days:{},q:{},rot:[],clips:[],scripts:{},
          media:{done:{},fav:{},last:null,pass:{}},wk:0,onboarded:false,session:null,device:null,recOpen:false,emgOpen:false,card:null,cardDue:{},cardMode:"today",cues:{},rate:1};
}
function load(){
  try{
    var raw=localStorage.getItem(KEY);
    if(!raw) return blank();
    var o=JSON.parse(raw); var b=blank();
    for(var k in b) if(!(k in o)) o[k]=b[k];
    return o;
  }catch(e){ return blank(); }
}
var saveTimer=null;
/* 미루지 않고 바로 쓴다. **연달아 누르고 바로 닫으면 마지막 값이 안 남는다.**
   save() 는 120밀리초를 미루는데 100밀리초 간격으로 누르면 그 타이머가 계속 밀린다.
   T101 에서 세션 상태로 같은 것을 겪었다. 잃으면 안 되는 값은 여기로 쓴다. */
function saveNow(){
  try{ localStorage.setItem(KEY,JSON.stringify(S)); }catch(e){}
}
function save(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(function(){
    try{ localStorage.setItem(KEY,JSON.stringify(S)); }
    catch(e){ toast("저장 실패. 브라우저 저장 공간을 확인한다."); }
  },120);
}
function day(d){
  /* 칸이 빠진 기록이 들어올 수 있다. 예전 판이 남긴 것이거나 손으로 넣은 것이다.
     하나만 없어도 그 줄을 읽는 자리에서 앱 전체가 멈춘다.
     T98 에서 겪었다. status 만 든 기록을 넣었더니 첫 화면이 안 떴다. */
  var b={status:null,started:null,speak:0,cards:0,lre:0,unres:[],coll:[]};
  var r=S.days[d];
  if(!r){ S.days[d]=b; return b; }
  for(var k in b) if(!(k in r)) r[k]=b[k];
  return r;
}

/* =========================================================================
   유틸
   ========================================================================= */
function $(s,r){return (r||document).querySelector(s);}
function el(t,c,x){var e=document.createElement(t); if(c)e.className=c; if(x!=null)e.textContent=x; return e;}
function iso(d){
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function parseISO(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
function addDays(s,n){var d=parseISO(s); d.setDate(d.getDate()+n); return iso(d);}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];});}
function today(){return iso(new Date());}
function roleOf(d){ return parseISO(d).getDate()%2===0 ? "a" : "b"; }

