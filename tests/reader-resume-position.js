'use strict';
// 읽던 자리가 뒤로 가지 않는다(2026-11-17 "이전에 읽었던 부분이 나온다").
// - 책을 열 때 오디오 복원 탐색이 읽던 문단을 덮어쓰지 않고, 오디오 위치가 다른 문단이면 읽던 문단 처음으로 맞춘다.
// - 불러오기 전(0초)에 닫아도 저장된 이어 듣기 위치가 0으로 바뀌지 않는다.
// - 화면이 스스로 움직인 스크롤은 읽던 문단을 바꾸지 않고, 사용자가 민 스크롤만 바꾼다(화면 가운데 문단).
// - 화면이 꺼진 채 들어서 문단이 앞으로 갔으면, 화면으로 돌아올 때 그 문단을 보여 준다.
// - iOS가 저장소 연결을 끊어도 다시 열어 저장한다. 바꿔 끼운 오디오는 예전 초를 버린다.
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
  const page=await browser.newPage({viewport:{width:390,height:700},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
  await page.addInitScript(()=>{window.__ms={};const orig=navigator.mediaSession.setActionHandler.bind(navigator.mediaSession);navigator.mediaSession.setActionHandler=(action,fn)=>{window.__ms[action]=fn;try{orig(action,fn)}catch(e){}}});
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>state.db&&document.querySelector('#bookCount'));
  // 40문단 책 + 40초 무음 WAV, 문단마다 1초(시간표 길이 20초 → 실제 40초라 2배로 맞춤)
  const id=await page.evaluate(async()=>{
   const blocks=Array.from({length:40},(_,i)=>({kind:'paragraph',text:(i+1)+'번째 문단입니다. '+'긴 문장으로 화면을 채웁니다. '.repeat(6)}));
   const {id}=await addBook('이어 듣기 시험','md',blocks);
   const rate=8000,n=rate*40,b=new ArrayBuffer(44+n),v=new DataView(b),w=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))};
   w(0,'RIFF');v.setUint32(4,36+n,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,'data');v.setUint32(40,n,true);new Uint8Array(b,44).fill(128);
   await storeReq('audio','readwrite',s=>s.put({id,blob:new Blob([b],{type:'audio/wav'}),name:'이어.wav',aiVoice:'Hyunsu',timeline:blocks.map((_,i)=>[i,i*0.5]),timelineDuration:20}));
   return id});
  const saved=()=>page.evaluate(async id=>({index:(await storeReq('books','readonly',s=>s.get(id))).index,time:(await storeReq('audioPositions','readonly',s=>s.get(id)))?.time}),id);
  const setSaved=(index,time)=>page.evaluate(async([id,index,time])=>{backToLibrary();const b=state.books.find(x=>x.id===id);b.index=index;b.audioTime=time;await storeReq('books','readwrite',s=>s.put(b));if(time==null)await storeReq('audioPositions','readwrite',s=>s.delete(id));else await storeReq('audioPositions','readwrite',s=>s.put({id,time,updated:Date.now()}))},[id,index,time]);
  const open=()=>page.evaluate(async id=>{backToLibrary();await openBook(id)},id);
  const ready=()=>page.waitForFunction(()=>hasAttachedAudio()&&state.pendingSeek==null&&state.audio.readyState>=1&&Number.isFinite(state.audio.duration),null,{timeout:15000});

  // 1) 읽던 문단 25, 오디오 위치는 앞쪽 문단 5(10초) → 열어도 읽던 문단 그대로, 오디오는 문단 25 처음(25초)으로
  await setSaved(25,10);
  await open();await ready();await page.waitForTimeout(400);
  const a1=await page.evaluate(()=>({index:state.index,time:state.audio.currentTime,log:audioLogText()}));
  assert.equal(a1.index,25,'opening keeps the reading paragraph: '+JSON.stringify(a1));
  assert.ok(Math.abs(a1.time-25)<0.3,'audio is moved to the start of the reading paragraph: '+a1.time);
  assert.match(a1.log,/이어 듣기를 읽던 문단에 맞춤 \(0:10 → 0:25, 26번째 문단\)/);
  assert.equal((await saved()).index,25,'the stored reading position is not overwritten by the restore seek');
  // 2) 같은 문단 안의 오디오 위치는 초 단위 그대로(문단 25 = 25~26초 → 25.6초)
  await setSaved(25,25.6);
  await open();await ready();await page.waitForTimeout(300);
  assert.ok(Math.abs(await page.evaluate(()=>state.audio.currentTime)-25.6)<0.3,'a position inside the reading paragraph is kept exactly');
  // 3) 불러오기 전에(요소가 아직 0초) 바로 닫아도 이어 듣기 위치는 0이 되지 않는다
  await setSaved(25,25.6);
  await page.evaluate(async id=>{backToLibrary();await openBook(id);backToLibrary()},id);
  await page.waitForTimeout(300);
  const s3=await saved();
  assert.ok(Math.abs(s3.time-25.6)<0.01,'closing before the audio loaded keeps the saved spot: '+JSON.stringify(s3));
  assert.equal(s3.index,25);
  // 4) 멈춘 채 화면이 스스로 움직인 스크롤은 읽던 문단을 바꾸지 않는다 · 사용자가 민 스크롤만 바꾼다(화면 가운데 문단)
  await open();await ready();
  await page.evaluate(()=>scrollToReading());await page.waitForTimeout(1300);
  await page.evaluate(()=>window.scrollBy(0,-600));
  await page.waitForTimeout(1500);
  assert.equal(await page.evaluate(()=>state.index),25,'a scroll nobody made (smooth-scroll tail, screen restore) does not move the reading position');
  await page.evaluate(()=>{window.dispatchEvent(new Event('touchmove'));window.scrollBy(0,-600)});
  await page.waitForFunction(()=>state.index<25,null,{timeout:5000}).catch(()=>{});await page.waitForTimeout(400);
  const a4=await page.evaluate(()=>{const mid=window.innerHeight/2,el=[...document.querySelectorAll('#readerContent > *')].find(e=>{const r=e.getBoundingClientRect();return r.top<=mid&&r.bottom>=mid});return {index:state.index,mid:[...document.querySelectorAll('#readerContent > *')].indexOf(el)}});
  assert.ok(a4.index<25&&a4.index===a4.mid,'a user scroll moves the reading position to the paragraph in the middle of the screen: '+JSON.stringify(a4));
  // 5) 화면이 꺼진 채 들어서 읽는 문단이 앞으로 갔다면(화면은 그대로), 돌아올 때 그 문단을 화면 가운데로
  await page.evaluate(()=>{window.__hidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.__hidden});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>window.__hidden?'hidden':'visible'});document.dispatchEvent(new Event('visibilitychange'));showPosition(33,{scroll:false})});
  await page.evaluate(()=>{window.__hidden=false;document.dispatchEvent(new Event('visibilitychange'))});
  await page.waitForTimeout(300);
  const a5=await page.evaluate(()=>{const r=blockElem(33).getBoundingClientRect();return {index:state.index,top:r.top,bottom:r.bottom,h:window.innerHeight}});
  assert.ok(a5.index===33&&a5.top<a5.h/2+5&&a5.bottom>a5.h/2-5,'coming back shows the current paragraph: '+JSON.stringify(a5));
  await page.waitForTimeout(1300);
  assert.equal(await page.evaluate(()=>state.index),33,'that scroll does not move the position');
  // 6) iOS가 저장소 연결을 끊어도(연결 닫힘) 다시 열어 저장한다
  await page.evaluate(()=>state.db.close());
  await page.evaluate(()=>{state.audio.currentTime=30;saveAudioPosition(true)});
  await page.waitForFunction(id=>storeReq('audioPositions','readonly',s=>s.get(id)).then(r=>Math.abs((r?.time||0)-30)<0.3),id,{timeout:5000});
  assert.match(await page.evaluate(()=>audioLogText()),/저장소 연결이 끊겨 다시 엽니다/);
  // 7) 오디오를 바꿔 끼우면(현수 원음 교체) 예전 초는 버리고 다음에 읽던 문단 처음부터
  await page.evaluate(async id=>{const book=state.books.find(b=>b.id===id),rec=await storeReq('audio','readonly',s=>s.get(id));const hashes=new Map([[await bookHash(book),book]]);await attachAiAudioItem({title:book.title,hash:await bookHash(book),blocks:book.blocks,aiVoice:'Hyunsu',profile:'high',timeline:rec.timeline,timelineDuration:rec.timelineDuration},rec.blob,hashes)},id);
  assert.equal((await saved()).time,undefined,'the old seconds are dropped when the audio is replaced');
  // 8) 무음 유지 중에 읽기 위치를 옮겼으면(목차·스크롤) 잠금 화면·이어폰 재생도 그 문단부터
  await setSaved(10,10.2);await open();await ready();
  await page.locator('#playBtn').click();
  await page.waitForFunction(()=>state.playing&&!state.audio.paused,null,{timeout:10000});
  await page.locator('#playBtn').click();
  await page.waitForFunction(()=>state.softPause&&state.audio.src===state.silentAudioUrl,null,{timeout:10000});
  await page.evaluate(()=>showPosition(30));
  await page.evaluate(()=>window.__ms.play());
  await page.waitForFunction(()=>!state.softPause&&state.playing&&!state.audio.paused&&state.audio.src===state.audioUrl,null,{timeout:10000});
  const a8=await page.evaluate(()=>({t:state.audio.currentTime,index:state.index}));
  assert.ok(Math.abs(a8.t-30)<1.5&&a8.index===30,'lock-screen play resumes from the moved reading paragraph: '+JSON.stringify(a8));
  // 9) 되돌리는 중에 앱 버튼을 또 누르면 소리가 몰래 나지 않고 다시 무음 유지(멈춤)로
  await page.evaluate(()=>window.__ms.pause());
  await page.waitForFunction(()=>state.softPause&&!state.softPause.restoring&&state.audio.src===state.silentAudioUrl,null,{timeout:10000});
  await page.evaluate(()=>{window.__ms.play();pauseReading()});
  await page.waitForFunction(()=>state.softPause&&!state.softPause.restoring&&state.audio.src===state.silentAudioUrl,null,{timeout:10000});
  await page.waitForTimeout(800);
  assert.deepEqual(await page.evaluate(()=>({playing:state.playing,soft:!!state.softPause,silent:state.audio.src===state.silentAudioUrl,label:$('#playBtn').getAttribute('aria-label')})),{playing:false,soft:true,silent:true,label:'읽어주기'},'a press while restoring ends in a consistent pause');
  // 10) 다 들은 책을 다시 틀면 처음 문단부터
  await page.evaluate(()=>{setAudioNow(audioDur());state.book.completed=true;showPosition(39)});   // 오디오도 끝, 읽던 자리도 마지막 문단
  await page.locator('#playBtn').click();
  await page.waitForFunction(()=>state.playing&&!state.audio.paused&&state.audio.src===state.audioUrl,null,{timeout:10000});
  const a10=await page.evaluate(()=>({t:state.audio.currentTime,index:state.index}));
  assert.ok(a10.t<1.5&&a10.index===0,'replaying a finished book starts at the beginning: '+JSON.stringify(a10));
  // 10-2) 끝까지 들은 뒤 목차로 다른 문단(12)에 가서 재생하면 책 처음이 아니라 그 문단부터
  await page.evaluate(()=>{stopSpeech();state.audio.currentTime=state.audio.duration;});
  await page.waitForFunction(()=>state.audio.ended||state.audio.duration-state.audio.currentTime<.5,null,{timeout:5000});
  await page.evaluate(()=>{state.book.completed=true;showPosition(39);stopSpeech();showPosition(12)});
  await page.locator('#playBtn').click();
  await page.waitForFunction(()=>state.playing&&!state.audio.paused,null,{timeout:10000});
  const a102=await page.evaluate(()=>({t:state.audio.currentTime,index:state.index}));
  assert.ok(Math.abs(a102.t-12)<1.5&&a102.index===12,'after finishing, a paragraph chosen from the outline is where playback starts: '+JSON.stringify(a102));
  // 10-3) 취침 타이머로 멈춘 무음 유지에서는 '일시정지' 명령(잠든 사이 AirPods 빼기)이 책을 다시 틀지 않는다
  await page.evaluate(()=>pauseReading('취침 타이머'));
  await page.waitForFunction(()=>state.softPause&&state.softPause.sleep&&state.audio.src===state.silentAudioUrl,null,{timeout:10000});
  await page.evaluate(()=>window.__ms.pause());await page.waitForTimeout(600);
  assert.equal(await page.evaluate(()=>!!state.softPause&&!state.playing&&state.audio.src===state.silentAudioUrl),true,'a pause command keeps the sleep-timer pause');
  await page.evaluate(()=>window.__ms.play());
  await page.waitForFunction(()=>!state.softPause&&state.playing&&state.audio.src===state.audioUrl,null,{timeout:10000});
  await page.evaluate(()=>stopSpeech());
  // 11) 멈춘 채 설정의 기본 플레이어로 옮긴 오디오 위치는 문단도 따라간다(앱 재생 버튼이 예전 문단으로 되돌리지 않게)
  await setSaved(5,5.2);await open();await ready();await page.waitForTimeout(1700);
  await page.evaluate(()=>{state.audio.currentTime=35.4});
  await page.waitForFunction(()=>state.index===35,null,{timeout:5000}).catch(()=>{});
  assert.equal(await page.evaluate(()=>state.index),35,'a native-player seek while paused moves the reading paragraph');
  assert.deepEqual(errors,[]);
  console.log('여백 이어 듣기 위치: 열 때 읽던 문단 우선(다른 문단이면 그 처음으로, 같은 문단이면 초 그대로) · 불러오기 전 닫아도 0 저장 안 함 · 저절로 생긴 스크롤은 위치 안 바꿈·사용자 스크롤은 가운데 문단 · 돌아오면 지금 문단 보여 줌 · 끊긴 저장소 다시 열기 · 바꿔 끼운 오디오는 예전 초 버림 · 잠금 화면 재생도 옮긴 문단부터 · 되돌리는 중 누름은 멈춤으로 · 다 들은 책은 처음부터 · 기본 플레이어 탐색 따라감 PASS');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
