/* =========================================================================
   소리 여섯.

   전에는 하나였다. 블록이 끝날 때 나는 소리다.
   그런데 이 앱에서 소리로 알려야 하는 일이 여섯이다.
   **두 사람이 화면을 안 보고 있을 때가 많다.** 마주 앉아 말하는 중이거나
   헤드폰을 끼고 듣는 중이다. 그때 화면만 바뀌면 아무도 모른다.

   | 소리 | 언제 | 어떤 소리 |
   |---|---|---|
   | 시작 | 세션을 시작할 때 | 낮은 데서 높은 데로 둘 |
   | 넘김 | 블록이 바뀔 때 | 짧게 하나 |
   | 되풀이 | 구간이 한 바퀴 돌 때 | 아주 짧고 여린 하나 |
   | 교대 | 역할이 바뀔 때 | 같은 음 둘. 주고받는 꼴 |
   | 판 끝 | 블록 시간이 다 됐을 때 | 둘. 전에 쓰던 그 소리 |
   | 세션 끝 | 두 시간이 다 됐을 때 | 셋. 올라가는 꼴 |

   **소리는 규칙이 있어야 한다.** 아무 소리나 여섯이면 여섯을 외워야 한다.
   올라가면 시작하는 것이고 내려가면 끝나는 것이다. 짧으면 지나가는 것이고
   길면 멈추는 것이다. 그 둘만 알면 나머지는 안 외워도 된다.
   ========================================================================= */
var TONE={
  start:  {n:[523,784],       gap:0.16, len:0.30, vol:0.13},
  next:   {n:[698],           gap:0.00, len:0.16, vol:0.10},
  loop:   {n:[880],           gap:0.00, len:0.07, vol:0.05},
  swap:   {n:[659,659],       gap:0.13, len:0.14, vol:0.10},
  blockend:{n:[660,880],      gap:0.28, len:0.30, vol:0.12},
  done:   {n:[523,659,784],   gap:0.18, len:0.34, vol:0.13}
};
/* 소리를 낼 때마다 소리 상자를 새로 만들지 않는다. 되풀이는 한 바퀴마다 난다.
   상자를 계속 만들면 브라우저가 어느 순간 더 안 만들어 준다. */
var AC=null;
function actx(){
  try{
    var C=window.AudioContext||window.webkitAudioContext; if(!C) return null;
    if(!AC) AC=new C();
    if(AC.state==="suspended") AC.resume();
    return AC;
  }catch(e){ return null; }
}
/* 진동 (T381). **되는 기기에서만.** iOS Safari 에는 `navigator.vibrate` 가 없다.

   ## 소리를 대신하는 것이 아니라 같이 난다

   헤드폰을 끼고 있으면 소리가 들리고 주머니에 있으면 안 들린다.
   반대로 조용한 방에서는 소리가 낫다. **둘 중 하나를 고르는 것이 아니다.**

   그래서 소리를 꺼도 진동은 난다. 끄는 칸이 따로 있다.
   **한 칸으로 둘을 끄면 소리가 성가셔서 끈 사람이 진동까지 잃는다.**

   ## 여섯 중 셋에만 건다

   사람이 움직여야 하는 때다. 교대, 판 끝, 세션 끝.
   시작과 넘김과 되풀이는 지나가는 것이라 안 건다.
   **되풀이는 한 바퀴마다 나므로 진동하면 성가시다.**

   ## 소리와 같은 규칙이다

   짧으면 지나가는 것이고 길면 멈추는 것이다. 위 표가 정한 그 규칙을
   진동에도 쓴다. **두 벌을 외우게 하지 않는다.** */
var BUZZ={
  swap:    [60,80,60],            /* 짧게 둘. 주고받는 꼴 */
  blockend:[180,90,180],          /* 길게 둘. 멈추는 것 */
  done:    [120,80,120,80,240]    /* 셋. 마지막이 길다 */
};
function canBuzz(){
  try{ return typeof navigator.vibrate==="function"; }catch(e){ return false; }
}
function buzz(kind){
  var s=$("#tBuzz"); if(s && !s.checked) return;
  var p=BUZZ[kind]; if(!p) return;
  if(!canBuzz()) return;
  try{ navigator.vibrate(p); }catch(e){}
}
/* **안 되는 기기에서는 안 된다고 말한다.** 눌러도 아무 일이 없는 칸을
   그대로 두면 두 사람은 앱이 고장 난 줄 안다 (T334 녹음 자리와 같은 결). */
function paintBuzz(){
  var lab=$("#tBuzzWhy"); if(!lab) return;
  if(canBuzz()){ lab.hidden=true; lab.textContent=""; return; }
  lab.hidden=false;
  lab.textContent="이 기기는 진동이 안 된다. 앱이 고장 난 것이 아니다.";
  var s=$("#tBuzz"); if(s) s.disabled=true;
}

function tone(kind){
  /* **소리를 꺼도 진동은 난다.** 다른 물건이고 끄는 칸도 다르다 */
  buzz(kind);
  var s=$("#tSound"); if(s && !s.checked) return;
  var d=TONE[kind]; if(!d) return;
  var a=actx(); if(!a) return;
  try{
    var t=a.currentTime;
    d.n.forEach(function(f,i){
      var at=t+i*(d.gap||d.len);
      var o=a.createOscillator(), g=a.createGain();
      o.type="sine"; o.frequency.value=f;
      g.gain.setValueAtTime(0.0001,at);
      g.gain.exponentialRampToValueAtTime(d.vol,at+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,at+d.len);
      o.connect(g); g.connect(a.destination);
      o.start(at); o.stop(at+d.len+0.02);
    });
  }catch(e){}
}
/* 옛 이름. 블록이 끝날 때 나던 소리다. 부르는 자리가 남아 있어 그대로 둔다. */
function beep(){ tone("blockend"); }

