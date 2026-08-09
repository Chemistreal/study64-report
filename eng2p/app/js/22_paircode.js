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
  ["session", 9],   /* 몇 번째 세션인가. 1부터 288 */
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

/* 그날 기록에서 셈만 뽑는다. **글은 안 담는다.** */
function pairValues(d){
  var r=day(d), a=r.aim||{};
  var pl=(typeof plan==="function")?plan():null;
  var sess=(pl&&pl.session)||1;
  var lec=(pl&&pl.lectureNo)||null;
  return [sess, PC_STATUS[r.status]||0, r.speak||0, r.cards||0, r.lre||0,
          (r.unres||[]).length, (r.coll||[]).length,
          lec!=null&&typeof lecPass==="function"?lecPass(lec):0,
          a.same||0, a.diff||0];
}
function pairCode(d){
  var body=pcEncode(pairValues(d||today()));
  return body+pcSum(body);
}
/* 읽는다. 못 읽으면 왜 못 읽었는지를 말한다. **틀렸다고만 하면 다시 칠 수가 없다.** */
function pairRead(code){
  var s=String(code||"").toUpperCase().replace(/[^0-9A-Z]/g,"");
  /* 헷갈리는 글자를 친 것은 잘못이 아니라 손이 아는 대로 친 것이다. 받아 준다. */
  s=s.replace(/I/g,"1").replace(/L/g,"1").replace(/O/g,"0").replace(/U/g,"V");
  if(s.length<2) return {err:"코드가 너무 짧다"};
  var body=s.slice(0,-1), sum=s.slice(-1);
  if(pcSum(body)!==sum) return {err:"코드를 잘못 쳤다. 마지막 글자가 안 맞는다"};
  var v=pcDecode(body);
  if(!v) return {err:"코드에 없는 글자가 있다"};
  var o={};
  PC_FIELDS.forEach(function(f,i){ o[f[0]]=v[i]; });
  o.statusName=PC_STATUS_BACK[o.status]||null;
  return {ok:true, v:o};
}
