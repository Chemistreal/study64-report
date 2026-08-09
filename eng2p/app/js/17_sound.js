/* =========================================================================
   소리. 기기 내장 음성 합성만 쓴다. 외부 음성 파일을 받지 않는다.
   ========================================================================= */
var TTS={ok:(typeof window!=="undefined"&&"speechSynthesis" in window),voices:[],busy:false,stop:false};

/* 축약 20종. 신뢰도 B.
   약형은 슬랭이 아니라 규칙적인 음운 현상이라 목록 자체는 안정적이다.
   다만 철자 표기가 자료마다 갈려서 B로 둔다. 검증 로그는 vLog 에 찍는다. */
var PAIRS=[
 ["going to","gonna"],["want to","wanna"],["got to","gotta"],["have to","hafta"],
 ["has to","hasta"],["ought to","oughta"],["kind of","kinda"],["sort of","sorta"],
 ["lot of","lotta"],["out of","outta"],["give me","gimme"],["let me","lemme"],
 ["don't know","dunno"],["because","cuz"],["what are you","whatcha"],["would you","wouldya"],
 ["could you","couldya"],["should have","shoulda"],["would have","woulda"],["could have","coulda"]
];
var PAIR_LOG="검증일 2026-08-07 / 축약 20종 목록 / 결과: 20종 모두 ESL 청취 교육의 표준 reduced forms 로 확인. 슬랭이 아니라 규칙적 약형이라 슬랭 금지에 걸리지 않는다 / 조치: 목록 유지, 철자 변이가 있는 항목(wouldya, couldya, cuz)은 B등급 유지. 출처는 state/journal.md 검증 로그에 기록";

function wait(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
function ttsVoices(){
  var s=$("#vVoice"); if(!s) return;
  if(!TTS.ok){ s.innerHTML=""; s.appendChild(el("option",null,"지원 안 함")); return; }
  var prev=s.value;
  TTS.voices=(speechSynthesis.getVoices()||[]).filter(function(v){ return /^en/i.test(v.lang); });
  s.innerHTML="";
  if(!TTS.voices.length){ s.appendChild(el("option",null,"영어 음성 없음")); return; }
  TTS.voices.forEach(function(v,i){
    var o=el("option",null,v.name+" ("+v.lang+")"); o.value=i; s.appendChild(o);
  });
  if(prev!==""&&s.querySelector('option[value="'+prev+'"]')) s.value=prev;
}
function utter(text){
  return new Promise(function(res){
    if(!TTS.ok||TTS.stop||!text) return res();
    var u=new SpeechSynthesisUtterance(text);
    var vi=+($("#vVoice").value);
    if(TTS.voices[vi]){ u.voice=TTS.voices[vi]; u.lang=TTS.voices[vi].lang; } else { u.lang="en-US"; }
    u.rate=+$("#vRate").value||0.85;
    var done=false;
    function fin(){ if(done) return; done=true; res(); }
    u.onend=fin; u.onerror=fin;
    setTimeout(fin, Math.max(4000, text.length*260));  // 엔진이 onend 를 안 주는 경우 대비
    try{ speechSynthesis.speak(u); }catch(e){ fin(); }
  });
}
function spk(text){
  if(!TTS.ok) return;
  TTS.stop=false;
  try{ speechSynthesis.cancel(); }catch(e){}
  utter(text);
}
function spkBtn(text){
  var b=el("button","g","소리");
  b.style.padding="2px 9px"; b.style.fontSize="12px";
  b.onclick=function(){ spk(text); };
  if(!TTS.ok) b.disabled=true;
  return b;
}
function ttsStop(){
  TTS.stop=true; TTS.busy=false;
  try{ speechSynthesis.cancel(); }catch(e){}
  paintSeq(-1);
}
function paintSeq(i){
  document.querySelectorAll("#vList .lreitem").forEach(function(n,k){
    n.style.borderColor = (k===i) ? "var(--acc)" : "var(--line)";
  });
}
function playSeq(items,times){
  TTS.stop=false; TTS.busy=true;
  var i=0,t=0;
  function gap(text){
    // 섀도잉은 따라 말할 틈이 있어야 성립한다. 글자 수와 속도로 추정한다.
    if($("#vMode").value!=="shadow") return 280;
    var rate=+$("#vRate").value||0.85;
    return Math.max(1200, Math.round(text.length*75/rate));
  }
  function step(){
    if(TTS.stop||i>=items.length){ TTS.busy=false; paintSeq(-1); return; }
    paintSeq(i);
    var cur=items[i];
    utter(cur).then(function(){
      if(TTS.stop){ TTS.busy=false; paintSeq(-1); return; }
      t++;
      if(t>=times){ t=0; i++; }
      return wait(gap(cur)).then(step);
    });
  }
  step();
}
function soundLines(){
  return $("#vText").value.split("\n").map(function(x){return x.trim();}).filter(Boolean);
}
function renderSoundList(){
  var box=$("#vList"); box.innerHTML="";
  var lines=soundLines();
  if(!lines.length){ box.innerHTML='<div class="note small">읽을 내용이 비어 있다.</div>'; return; }
  lines.forEach(function(t){
    var d=el("div","lreitem");
    var h=el("div","hd2");
    h.appendChild(el("span",null,t));
    h.appendChild(spkBtn(t));
    d.appendChild(h); box.appendChild(d);
  });
}
function renderSound(){
  var w=$("#ttsWarn");
  if(!TTS.ok){
    w.innerHTML='<div class="note w"><b>이 브라우저는 음성 합성을 지원하지 않는다.</b><div class="small">크롬, 사파리, 엣지 최신판에서 열면 된다. 소리가 없어도 나머지 탭은 그대로 쓴다.</div></div>';
  } else if(!TTS.voices.length){
    w.innerHTML='<div class="note w"><b>영어 음성이 하나도 없다.</b><div class="small">기기 설정에서 영어 음성을 받아야 한다. 안드로이드는 설정의 음성 합성, 윈도우는 설정의 음성에서 받는다.</div></div>';
  } else { w.innerHTML=""; }

  var rows=['<tr><th scope="col">원형</th><th scope="col"></th><th scope="col">축약형</th><th scope="col"></th></tr>'];
  PAIRS.forEach(function(p,i){
    rows.push('<tr><td>'+p[0]+'</td><td><button class="g pbtn" data-i="'+i+'" data-k="0" style="padding:1px 8px;font-size:12px">소리</button></td>'+
              '<td><b>'+p[1]+'</b></td><td><button class="g pbtn" data-i="'+i+'" data-k="1" style="padding:1px 8px;font-size:12px">소리</button></td></tr>');
  });
  $("#vPairs").innerHTML=rows.join("");
  $("#vPairs").querySelectorAll(".pbtn").forEach(function(b){
    b.onclick=function(){ spk(PAIRS[+b.dataset.i][+b.dataset.k]); };
    if(!TTS.ok) b.disabled=true;
  });
  $("#vLog").textContent="검증 로그 / "+PAIR_LOG;
  renderSoundList();
}
if(TTS.ok){
  try{ speechSynthesis.onvoiceschanged=function(){ ttsVoices(); renderSound(); }; }catch(e){}
}
$("#vRate").oninput=function(){ $("#vRateN").textContent=(+this.value).toFixed(2); };
$("#vLoad").onclick=renderSoundList;
$("#vStop").onclick=ttsStop;
$("#vAll").onclick=function(){
  var lines=soundLines();
  if(!lines.length){ renderSoundList(); return; }
  renderSoundList();
  playSeq(lines, +$("#vRep").value||1);
};
$("#vPairAll").onclick=function(){
  var seq=[];
  PAIRS.forEach(function(p){ seq.push(p[0]); seq.push(p[1]); });
  $("#vText").value=seq.join("\n"); renderSoundList();
  playSeq(seq,1);
};
$("#vPairPush").onclick=function(){
  $("#vText").value=PAIRS.map(function(p){return p[0]+" ... "+p[1];}).join("\n");
  renderSoundList();
};

