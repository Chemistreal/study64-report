'use strict';
// 잠금 화면에서 '일시정지 → 다시 재생'이 앱을 다시 열지 않아도 이어져야 한다(아이폰 홈 화면 웹앱).
// - 잠금 화면 조작(미디어 세션)은 '지금 재생 중'이 된 뒤에도 다시 등록한다.
// - 잠깐 멈췄다 다시 누르면 같은 자리부터, 오래 멈춰 iOS가 소리를 놓았거나(주소가 죽음) 재생이 거부되면 저장된 소리를 다시 불러와 같은 자리부터.
// - 읽기 화면 재생 막대에는 오디오 시간(지금 / 전체)과 남은 시간이 나온다.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer(async(req,res)=>{
 const url=(req.url||'/').split('?')[0];
 const filename=path.resolve(root,url==='/'?'reader/index.html':'reader/'+decodeURIComponent(url).replace(/^\//,''));
 if(!filename.startsWith(path.join(root,'reader')+path.sep)){res.writeHead(404);res.end();return}
 try{const bytes=await fs.readFile(filename);res.setHeader('Content-Type',filename.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8');res.end(bytes)}catch(e){res.writeHead(404);res.end()}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
  // 잠금 화면 버튼 = 미디어 세션 조작. 등록되는 처리기를 붙잡아 둔다.
  await page.addInitScript(()=>{
   window.__ms={handlers:{},binds:0};
   const orig=navigator.mediaSession.setActionHandler.bind(navigator.mediaSession);
   navigator.mediaSession.setActionHandler=(action,fn)=>{window.__ms.handlers[action]=fn;if(action==='play')window.__ms.binds++;try{orig(action,fn)}catch(e){}};
  });
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>state.db&&document.querySelector('#bookCount'));
  // 3시간 길이 오디오 대신, 아주 낮은 표본율로 긴 소리(약 2시간 2분)를 만든다 → 시간 표시에 '시:분:초'가 나오는지 본다.
  await page.evaluate(async()=>{
   const {id}=await addBook('잠금 화면 시험','md',[{kind:'paragraph',text:'첫 문단.'},{kind:'paragraph',text:'둘째 문단.'}]);
   const rate=3000,n=rate*7330,b=new ArrayBuffer(44+n),v=new DataView(b),w=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))};
   w(0,'RIFF');v.setUint32(4,36+n,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,'data');v.setUint32(40,n,true);
   new Uint8Array(b,44).fill(128);
   await storeReq('audio','readwrite',store=>store.put({id,blob:new Blob([b],{type:'audio/wav'}),name:'잠금.wav',aiVoice:'Hyunsu'}));
  });
  await page.locator('*:has(.book-open)',{hasText:'잠금 화면 시험'}).last().locator('.book-open').click();
  await page.waitForFunction(()=>hasAttachedAudio()&&Number.isFinite(state.audio.duration)&&state.audio.duration>7000,null,{timeout:15000});
  // 1) 읽기 화면에 오디오 시간
  await page.evaluate(()=>{state.audio.currentTime=3725;state.audio.dispatchEvent(new Event('timeupdate'))});
  await page.waitForFunction(()=>/^1:02:0\d \/ 2:02:10$/.test($('#playerPercent').textContent),null,{timeout:5000});
  assert.match(await page.locator('#playerLabel').textContent(),/^51% 들음 · 남은 (59|60)분|^51% 들음 · 남은 1시간 0분/,'remaining time is shown');
  // 문단을 눌러 위치를 옮겨도(=showPosition) '읽음 %'로 바뀌지 않는다
  await page.evaluate(()=>showPosition(1,{scroll:false}));
  assert.match(await page.locator('#playerPercent').textContent(),/ \/ 2:02:10$/,'paragraph moves keep the audio clock');
  // 배속이면 남은 시간은 배속 기준
  await page.evaluate(()=>{state.audio.playbackRate=2;state.audio.currentTime=3725;state.audio.dispatchEvent(new Event('timeupdate'))});
  await page.waitForFunction(()=>/남은 30분 \(2배\)|남은 31분 \(2배\)/.test($('#playerLabel').textContent),null,{timeout:5000});
  await page.evaluate(()=>{state.audio.playbackRate=1});

  // 2) 앱에서 재생 → 재생 중이 되면 잠금 화면 조작을 다시 등록
  const bindsBefore=await page.evaluate(()=>window.__ms.binds);
  await page.evaluate(()=>{state.audio.currentTime=100});
  await page.locator('#playBtn').click();
  await page.waitForFunction(()=>!state.audio.paused&&state.playing,null,{timeout:10000});
  await page.waitForFunction(b=>window.__ms.binds>b,bindsBefore,{timeout:5000});
  // 3) 잠금 화면 일시정지 → 다시 재생: 같은 자리부터
  await page.evaluate(()=>window.__ms.handlers.pause());
  await page.waitForFunction(()=>state.audio.paused&&!state.playing&&navigator.mediaSession.playbackState==='paused',null,{timeout:5000});
  const pausedAt=await page.evaluate(()=>state.audio.currentTime);
  await page.evaluate(()=>window.__ms.handlers.play());
  await page.waitForFunction(()=>!state.audio.paused&&state.playing&&navigator.mediaSession.playbackState==='playing',null,{timeout:5000});
  assert.ok(Math.abs(await page.evaluate(()=>state.audio.currentTime)-pausedAt)<2,'resumes where it paused');
  // 4) 오래 멈춰서 iOS가 소리를 놓은 상황: 주소(blob)가 죽어 있어도 다시 불러와 같은 자리부터
  await page.evaluate(()=>window.__ms.handlers.pause());
  await page.waitForFunction(()=>state.audio.paused,null,{timeout:5000});
  const before=await page.evaluate(()=>{const t=state.audio.currentTime,url=state.audioUrl;URL.revokeObjectURL(url);state.audioPausedAt=Date.now()-11*60000;return {t,url}});
  await page.evaluate(()=>window.__ms.handlers.play());
  // 다시 불러오는 동안은 위치가 잠깐 0 → 재생이 시작되고 자리가 돌아올 때까지
  await page.waitForFunction(t=>!state.audio.paused&&state.playing&&state.audio.readyState>=2&&Math.abs(state.audio.currentTime-t)<2,before.t,{timeout:15000}).catch(()=>{});
  const after=await page.evaluate(()=>({t:state.audio.currentTime,url:state.audioUrl,src:state.audio.src}));
  assert.notEqual(after.url,before.url,'a fresh audio address is made from the saved file');
  assert.equal(after.src,after.url);
  assert.ok(Math.abs(after.t-before.t)<2,'stale resume keeps the position: '+before.t+' → '+after.t);
  // 5) 재생이 거부되면(멈춘 지 얼마 안 돼도) 다시 불러와 잇는다
  await page.evaluate(()=>window.__ms.handlers.pause());
  await page.waitForFunction(()=>state.audio.paused,null,{timeout:5000});
  await page.evaluate(()=>{const a=state.audio,orig=a.play.bind(a);let once=true;a.play=function(){if(once){once=false;return Promise.reject(new DOMException('interrupted','NotAllowedError'))}return orig()}});
  await page.evaluate(()=>window.__ms.handlers.play());
  await page.waitForFunction(()=>!state.audio.paused&&state.playing,null,{timeout:10000});
  // 6) 앱 재생 버튼으로 멈춤 → 잠금 화면 재생
  await page.locator('#playBtn').click();
  await page.waitForFunction(()=>state.audio.paused&&!state.playing,null,{timeout:5000});
  await page.evaluate(()=>window.__ms.handlers.play());
  await page.waitForFunction(()=>!state.audio.paused&&state.playing,null,{timeout:5000});
  // 7) 화면이 꺼진 채 잠금 화면 일시정지: 소리를 멈추지 않고 음소거 + 위치 기억(iOS가 5초 뒤 소리 연결을 끊지 않게)
  await page.evaluate(()=>{window.__hidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__hidden});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>window.__hidden?'hidden':'visible'});document.dispatchEvent(new Event('visibilitychange'))});
  await page.evaluate(()=>{window.__saves=[];const orig=saveAudioPosition;window.saveAudioPosition=function(f){window.__saves.push({soft:!!state.softPause,cur:state.audio.currentTime,stack:new Error().stack.split(String.fromCharCode(10)).slice(2,5).join(' | ')});return orig.apply(this,arguments)}});
  await page.evaluate(()=>window.__ms.handlers.pause());
  const soft=await page.evaluate(()=>({paused:state.audio.paused,muted:state.audio.muted,playing:state.playing,ms:navigator.mediaSession.playbackState,pos:state.softPause?.pos,label:$('#playBtn').getAttribute('aria-label')}));
  assert.equal(soft.paused,false,'the element keeps running so iOS keeps the audio session');
  assert.equal(soft.muted,true);assert.equal(soft.playing,false);assert.equal(soft.ms,'paused');assert.equal(soft.label,'읽어주기');
  // 그동안 소리 위치는 흘러가도(바쁜 컴퓨터에선 데이터를 기다릴 수 있어 넉넉히) 화면·저장 위치는 멈춘 자리
  await page.waitForFunction(p=>state.audio.currentTime>p+0.5,soft.pos,{timeout:15000});
  const held=await page.evaluate(()=>({shown:$('#playerPercent').textContent,saved:state.book.audioTime,cur:state.audio.currentTime,softNow:state.softPause,saves:window.__saves}));
  assert.ok(held.cur>soft.pos+0.5,'muted element kept playing');
  assert.ok(Math.abs(held.saved-soft.pos)<0.01,'saved position stays at the pause point: '+JSON.stringify({soft,held}));
  // 잠금 화면 재생 → 기억한 자리로 돌아가 소리 켜기
  await page.evaluate(()=>window.__ms.handlers.play());
  const resumed=await page.evaluate(()=>({muted:state.audio.muted,paused:state.audio.paused,playing:state.playing,ms:navigator.mediaSession.playbackState,cur:state.audio.currentTime,soft:!!state.softPause}));
  assert.equal(resumed.muted,false);assert.equal(resumed.paused,false);assert.equal(resumed.playing,true);assert.equal(resumed.ms,'playing');assert.equal(resumed.soft,false);
  assert.ok(Math.abs(resumed.cur-soft.pos)<0.3,'resumes exactly where it paused: '+soft.pos+' → '+resumed.cur);
  // 잠금 화면이 계속 '일시정지' 버튼을 보여 줘서 다시 누르면 → 재생으로(토글)
  await page.evaluate(()=>window.__ms.handlers.pause());
  assert.equal(await page.evaluate(()=>!!state.softPause&&state.audio.muted),true);
  await page.evaluate(()=>window.__ms.handlers.pause());
  assert.equal(await page.evaluate(()=>!state.softPause&&!state.audio.muted&&state.playing),true,'second pause press resumes');
  // 음소거 일시정지 중 앱 화면으로 돌아오면 진짜 일시정지(멈춘 자리)
  await page.evaluate(()=>window.__ms.handlers.pause());
  const pos2=await page.evaluate(()=>state.softPause.pos);
  await page.waitForTimeout(600);
  await page.evaluate(()=>{window.__hidden=false;document.dispatchEvent(new Event('visibilitychange'))});
  const back=await page.evaluate(()=>({paused:state.audio.paused,muted:state.audio.muted,soft:!!state.softPause,cur:state.audio.currentTime}));
  assert.equal(back.paused,true);assert.equal(back.muted,false);assert.equal(back.soft,false);assert.ok(Math.abs(back.cur-pos2)<0.3,'back in the app it is a real pause at the same spot');
  await page.locator('#playBtn').click();
  await page.waitForFunction(()=>!state.audio.paused&&state.playing&&!state.audio.muted,null,{timeout:5000});
  // 오래 두면(여기선 0.8초로 줄임) 배터리를 위해 진짜로 멈춘다
  await page.evaluate(()=>{window.__ybSoftPauseMaxMs=800;window.__hidden=true;document.dispatchEvent(new Event('visibilitychange'))});
  await page.evaluate(()=>window.__ms.handlers.pause());
  const pos3=await page.evaluate(()=>state.softPause.pos);
  await page.waitForFunction(()=>state.audio.paused&&!state.softPause&&!state.audio.muted,null,{timeout:5000});
  assert.ok(Math.abs(await page.evaluate(()=>state.audio.currentTime)-pos3)<0.3,'the long-pause stop goes back to the pause point');
  assert.deepEqual(errors,[]);
  console.log('여백 잠금 화면: 재생 막대 오디오 시간(1:02:05 / 2:02:10 · 남은 시간 · 배속 반영) · 재생 중이 되면 조작 다시 등록 · 일시정지→재생 같은 자리 · 오래 멈춤/죽은 주소는 다시 불러와 이어 듣기 · 재생 거부 시 다시 불러오기 · 화면 꺼진 일시정지는 음소거로 소리 연결 유지(재생·토글·앱 복귀·30분 뒤 진짜 멈춤) PASS');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
