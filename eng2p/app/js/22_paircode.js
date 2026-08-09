/* =========================================================================
   짝 코드. **셈만 건너간다.** 글은 안 담는다.

   `docs/pair.md` 가 정한 것이 셋이다.
   안 건너가는 여섯은 안 담고, 셈은 코드로 글은 파일로, 그리고 합치기는 따로다.

   왜 이런 꼴인가.

     서버 없음     이 물건은 파일 하나다. 1년을 쓰는데 남의 서버에 안 매단다
     망 없음       세션 두 시간 중에 밖으로 나가는 것은 영상뿐이다
     카메라 없음   `file://` 은 안전한 자리가 아니라 브라우저가 카메라를 안 준다

   그래서 **사람이 눈으로 보고 손으로 친다.** 452글자는 못 치고 열아홉은 친다.
   담는 것을 숫자로만 두고 서른두 글자꼴로 적는다.

   글자를 고를 때 헷갈리는 것을 뺀다. I 와 1, O 와 0, L 과 1, U 는 안 쓴다.
   **손으로 치는 것이라 잘못 치는 것이 정상이다.** 그래서 검사 글자를 하나 붙인다.
   ========================================================================= */
var PC_ABC="0123456789ABCDEFGHJKMNPQRSTVWXYZ";   /* I L O U 를 뺐다. 서른둘 */

/* 담는 자리와 그 자리의 폭. **폭을 넘으면 그 자리에서 자른다.**
   자르는 것이 맞다. 발화 분이 255를 넘는 날은 두 시간 세션에서 안 나온다. */
var PC_FIELDS=[
  ["done",    9],   /* 끝낸 세션 수. 0에서 288. **이것이 진도다** */
  ["status",  2],   /* 0 없음 1 정상 2 비상판 3 결석 */
  ["speak",   8],   /* 발화 분 */
  ["cards",   8],   /* 드릴 장수 */
  ["lre",     6],   /* LRE 횟수 */
  ["unres",   6],   /* 미해결 LRE 건수. **글이 아니라 건수다** */
  ["coll",    6],   /* 채집 건수. 같다 */
  ["round",   2],   /* 그날 강의 회차. 0에서 3 */
  ["same",    6],   /* 블록 4에서 겹친 것 */
  ["diff",    6]    /* 블록 4에서 안 겹친 것 */
];
var PC_STATUS={normal:1, emg:2, absent:3};
var PC_STATUS_BACK=[null,"normal","emg","absent"];
/* 길이는 세지 않고 파생시킨다. 자리를 하나 늘리면 여기가 따라 늘어야 한다.
   **적어 둔 열셋과 도는 열셋이 갈리는 것**이 이 프로젝트에서 제일 잦은 고장이다. */
var PC_BITS=0; PC_FIELDS.forEach(function(f){ PC_BITS+=f[1]; });
var PC_CHARS=Math.ceil(PC_BITS/5), PC_LEN=PC_CHARS+1;

function pcClamp(v,bits){
  var max=Math.pow(2,bits)-1;
  v=Math.floor(+v||0);
  if(v<0) v=0;
  return v>max?max:v;
}
/* 자릿수를 이어 붙여 하나의 수로 만든다. 59비트라 곱셈으로 쌓으면 정밀도를 넘는다.
   그래서 **글자 다섯 비트씩 잘라 쌓는다.** 자바스크립트 수는 53비트까지만 정확하다. */
function pcEncode(vals){
  var bits="";
  PC_FIELDS.forEach(function(f,i){
    var v=pcClamp(vals[i], f[1]).toString(2);
    while(v.length<f[1]) v="0"+v;
    bits+=v;
  });
  while(bits.length%5) bits+="0";
  var out="";
  for(var i=0;i<bits.length;i+=5) out+=PC_ABC[parseInt(bits.substr(i,5),2)];
  return out;
}
function pcDecode(s){
  var bits="";
  for(var i=0;i<s.length;i++){
    var n=PC_ABC.indexOf(s[i]);
    if(n<0) return null;
    var b=n.toString(2);
    while(b.length<5) b="0"+b;
    bits+=b;
  }
  var out=[], at=0;
  for(var k=0;k<PC_FIELDS.length;k++){
    var w=PC_FIELDS[k][1];
    if(at+w>bits.length) return null;
    out.push(parseInt(bits.substr(at,w),2));
    at+=w;
  }
  return out;
}
/* 검사 글자. 잘못 친 한 글자를 잡는다. 자리마다 무게를 달리 줘서
   **두 글자를 바꿔 친 것도** 잡는다. 사람이 제일 흔히 하는 실수가 그것이다. */
function pcSum(s){
  var n=0;
  for(var i=0;i<s.length;i++) n=(n*3+PC_ABC.indexOf(s[i])+1)%32;
  return PC_ABC[n];
}

/* 오늘 기록에서 셈만 뽑는다. **글은 안 담는다.**

   **오늘 것만 만든다.** 날을 고르게 하면 진도와 활동량이 다른 날을 가리킨다.
   진도는 오늘 세는 값이고 활동량은 그날 값이라 섞이면 둘 다 못 믿는다.
   짝을 맞추는 자리는 세션이 끝난 직후다. 그때 맞출 것은 오늘 것이다. T235 */
function pairValues(){
  var r=day(today()), a=r.aim||{};
  var pl=(typeof plan==="function")?plan():null;
  var lec=(pl&&pl.lectureNo)||null;
  return [(pl&&pl.done)||0, PC_STATUS[r.status]||0, r.speak||0, r.cards||0, r.lre||0,
          (r.unres||[]).length, (r.coll||[]).length,
          lec!=null&&typeof lecPass==="function"?lecPass(lec):0,
          a.same||0, a.diff||0];
}
function pairCode(){
  var body=pcEncode(pairValues());
  return body+pcSum(body);
}
/* 읽는다. 못 읽으면 왜 못 읽었는지를 말한다. **틀렸다고만 하면 다시 칠 수가 없다.** */
function pairRead(code){
  var s=String(code||"").toUpperCase().replace(/[^0-9A-Z]/g,"");
  /* 헷갈리는 글자를 친 것은 잘못이 아니라 손이 아는 대로 친 것이다. 받아 준다. */
  s=s.replace(/I/g,"1").replace(/L/g,"1").replace(/O/g,"0").replace(/U/g,"V");
  /* **길이를 먼저 본다.** 한 글자를 빠뜨린 것은 검사 글자로도 걸리기는 하지만
     "마지막 글자가 안 맞는다" 고 말하면 엉뚱한 자리를 다시 보게 된다.
     빠뜨린 것은 빠뜨렸다고 말해야 그 자리를 찾는다. T235 */
  if(s.length!==PC_LEN)
    return {err:PC_LEN+"글자여야 하는데 "+s.length+"글자다"};
  var body=s.slice(0,-1), sum=s.slice(-1);
  if(pcSum(body)!==sum) return {err:"코드를 잘못 쳤다. 마지막 글자가 안 맞는다"};
  var v=pcDecode(body);
  if(!v) return {err:"코드에 없는 글자가 있다"};
  var o={};
  PC_FIELDS.forEach(function(f,i){ o[f[0]]=v[i]; });
  o.statusName=PC_STATUS_BACK[o.status]||null;
  return {ok:true, v:o};
}

/* =========================================================================
   짝 맞추기 화면.

   **읽기만 한다. 안 고친다.** 상대 코드를 읽어 무엇이 다른지만 보여 준다.
   합치는 것은 다른 일이고 다른 자리다 (T237). `docs/pair.md` 6장이 그렇게 갈랐다.

   가져오기가 통째로 덮는 것을 T233 에 나쁘다고 적어 놓고
   여기서 또 덮으면 같은 잘못을 두 번 하는 것이다.
   ========================================================================= */
var PC_LABEL={done:"끝낸 세션", status:"오늘 상태", speak:"발화 분", cards:"드릴 장수",
              lre:"LRE 횟수", unres:"미해결 건수", coll:"채집 건수",
              round:"오늘 강의 회차", same:"블록 4 겹침", diff:"블록 4 안 겹침"};
var PC_STATUS_KO=["기록 없음","정상","비상판","결석"];
/* 값을 사람 말로. 0이 "없음" 인 자리와 "0" 인 자리가 다르다. */
function pcShow(k,v){
  if(k==="status") return PC_STATUS_KO[v]||String(v);
  if(k==="round") return v===0?"아직 없음":v+"회차";
  return String(v);
}
/* 네 글자씩 끊는다. 열두 글자를 한 줄로 두면 읽다가 자리를 잃는다.
   검사 글자는 따로 뗀다. 그것은 담은 값이 아니라 잘못 친 것을 잡는 글자다. */
function pcGroup(code){
  var b=code.slice(0,-1), out=[];
  for(var i=0;i<b.length;i+=4) out.push(b.substr(i,4));
  return out.join(" ")+"  "+code.slice(-1);
}
/* 진도가 갈린 것과 활동량이 다른 것은 무게가 다르다.
   **활동량은 원래 다르다.** 둘이 같은 분을 말할 이유가 없다.
   진도가 갈리면 48주가 밀린다. 그래서 그 둘을 따로 센다. */
var PC_HEAVY=["done","status","round"];
function pairDiff(mine,theirs){
  var rows=[], heavy=[], light=0;
  PC_FIELDS.forEach(function(f){
    var k=f[0], a=mine[k], b=theirs[k], same=a===b, hv=PC_HEAVY.indexOf(k)>=0;
    if(!same){ if(hv) heavy.push(PC_LABEL[k]||k); else light++; }
    rows.push({k:k, a:a, b:b, same:same, heavy:hv});
  });
  return {rows:rows, heavy:heavy, light:light};
}
function renderPair(){
  var box=$("#pairBox"); if(!box) return;
  var keep=($("#pairIn")||{}).value||"";
  var mine=pairCode();
  var h='<div class="small mut">셈만 건너간다. 적은 글은 안 담는다. '+
        '그것은 운영 탭의 JSON 으로 옮긴다.</div>';
  h+='<div class="paircode mono" id="pairMine">'+esc(pcGroup(mine))+'</div>';
  h+='<div class="small mut">오늘 '+today()+' 것이다. 이 '+PC_LEN+
     '글자를 상대에게 읽어 준다. 끝의 한 글자는 잘못 친 것을 잡는 검사 글자다.</div>';
  /* **코드가 시작일을 안 담는다.** 진도는 끝낸 세션 수로 세고 시작일은 거기 안 든다.
     그래서 시작일이 갈려도 코드는 같게 나온다. 그런데 판 씨앗에는 시작일이 든다
     (`docs/round.md` 3장). 코드만 견주면 다 같다고 나오고 다음 판에서 갈린다.
     코드가 못 잡는 것을 화면이 말한다. **날짜 하나는 사람이 읽으면 된다.** T253 */
  h+='<div class="note" style="margin-top:8px">시작일 <b class="mono">'+
     esc(S.start)+'</b> 도 같이 읽는다. <b>이것이 다르면 코드가 같아도 갈린 것이다.</b> '+
     '판이 서로 다른 차례로 뜬다.</div>';
  h+='<label class="blank" style="margin-top:12px"><span>상대가 읽어 준 코드</span>'+
     '<input id="pairIn" class="mono" autocomplete="off" autocapitalize="characters" '+
     'spellcheck="false" placeholder="'+esc(new Array(PC_CHARS+1).join("X"))+'X"></label>';
  h+='<div class="row"><button class="g" id="pairGo">견줘 보기</button>'+
     '<button class="g" id="pairClr">지움</button></div>';
  h+='<div id="pairOut"></div>';
  box.innerHTML=h;
  fillField("pairIn", keep);
  $("#pairGo").onclick=pairCompare;
  $("#pairClr").onclick=function(){ $("#pairIn").value=""; $("#pairOut").innerHTML=""; };
  /* 열세 글자를 다 치면 바로 견준다. 단추를 또 누르게 하지 않는다.

     덜 친 동안에는 틀렸다고 안 한다. **치는 중에 틀렸다고 하면 안 된다.**
     그렇다고 아무 말도 안 하면 한 글자를 빠뜨린 사람이 그 앞에서 멈춘다.
     열두 글자에서 손을 놓으면 화면이 조용하고 왜 조용한지를 모른다.
     그래서 **틀렸다고는 안 하되 몇 글자인지는 센다.** T235 */
  $("#pairIn").oninput=function(){
    var s=this.value.replace(/[^0-9A-Za-z]/g,"");
    if(s.length>=PC_LEN) pairCompare();
    else if(!s.length) $("#pairOut").innerHTML="";
    else $("#pairOut").innerHTML='<div class="small mut">'+s.length+" / "+
      PC_LEN+" 글자</div>";
  };
}
function pairCompare(){
  var out=$("#pairOut"); if(!out) return;
  var got=pairRead(($("#pairIn")||{}).value||"");
  if(!got.ok){ out.innerHTML='<div class="note w">'+esc(got.err)+'</div>'; return; }
  var mine=pairRead(pairCode()).v;
  var d=pairDiff(mine, got.v);
  var A=S.names.a, B=S.names.b, meIs=devicePerson();
  var meName=meIs==="b"?B:(meIs==="a"?A:"이 기기");
  var h='<table class="pairtab"><tr><th scope="col">항목</th><th scope="col">'+esc(meName)+
        '</th><th scope="col">상대</th></tr>';
  d.rows.forEach(function(r){
    h+='<tr class="'+(r.same?"":(r.heavy?"pd-heavy":"pd-light"))+'">'+
       '<td>'+esc(PC_LABEL[r.k]||r.k)+'</td>'+
       '<td class="mono">'+esc(pcShow(r.k,r.a))+'</td>'+
       '<td class="mono">'+esc(pcShow(r.k,r.b))+'</td></tr>';
  });
  h+='</table>';
  /* 무엇이 다른지를 보였으면 그래서 어떻게 하는지를 말한다.
     **다르다고만 하면 두 사람이 그 앞에서 멈춘다.** */
  if(!d.heavy.length&&!d.light)
    h+='<div class="note g">다 같다. 두 기기가 같은 자리에 있다.</div>';
  else if(d.heavy.length)
    /* **무엇이 갈렸는지를 이름으로 적는다.** "위에 표시된 자리" 라고 하면
       열 줄짜리 표에서 그 자리를 다시 찾아야 한다. 찾는 동안 세션이 끝난다. */
    h+='<div class="note w"><b>진도가 갈렸다.</b> 갈린 자리: '+
       esc(d.heavy.join(", "))+'. 어느 쪽이 맞는지 둘이 정하고 맞는 쪽 기기에서 '+
       'JSON 을 내보내 다른 기기로 가져간다. 활동량은 원래 서로 다르다.</div>';
  else
    h+='<div class="note">진도는 같다. 다른 것은 활동량뿐이고 '+
       '그것은 둘이 같을 이유가 없다. 각자 자기 것을 적으면 된다.</div>';
  out.innerHTML=h;
}
