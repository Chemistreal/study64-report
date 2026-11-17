'use strict';
// 긴 오디오는 조각으로 나눠 차례로 튼다(2026-11-17: 원음 통찰력 약 340MB를 아이폰이 한 파일로 재생하다 화면째 종료).
// - MP3는 약 80MB마다 프레임 머리에서 자른다(새로 저장하지 않고 같은 파일의 구간).
// - 시간·진행·문단 따라가기·이어 듣기는 한 권 기준: 조각을 건너 탐색, 조각 끝 → 다음 조각 자동 재생, 무음 유지 뒤 다른 조각으로 돌아오기.
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

  // 0) MP3 자르기: 크기 기준 근처의 프레임 머리(FF Fx)에서 자르고, 조각을 이으면 원래 파일 그대로
  const cut=await page.evaluate(async()=>{
   const n=300000,u=new Uint8Array(n);for(let i=0;i<n;i++)u[i]=(i*7)%200;for(let i=0;i<n;i+=144){u[i]=0xFF;u[i+1]=0xFB;u[i+2]=0x90;u[i+3]=0x64}
   window.__ybAudioPartBytes=100000;const parts=await audioPartsOf(new Blob([u],{type:'audio/mpeg'}));delete window.__ybAudioPartBytes;
   const heads=[];for(const p of parts.slice(1)){const h=new Uint8Array(await p.slice(0,2).arrayBuffer());heads.push(h[0]===0xFF&&h[1]===0xFB)}
   const joined=new Uint8Array(await new Blob(parts).arrayBuffer());let same=joined.length===n;for(let i=0;same&&i<n;i+=997)same=joined[i]===u[i];
   const small=(await audioPartsOf(new Blob([u.subarray(0,1000)]))).length;
   return {count:parts.length,heads,same,small}});
  assert.deepEqual(cut,{count:3,heads:[true,true],same:true,small:1},'MP3 is cut at frame headers into ~max-size parts: '+JSON.stringify(cut));

  // 30문단 책 + 30초 WAV(문단마다 1초). 시험에서는 WAV를 머리가 붙은 10초짜리 세 조각으로 자른다.
  const id=await page.evaluate(async()=>{
   const blocks=Array.from({length:30},(_,i)=>({kind:'paragraph',text:(i+1)+'번째 문단입니다. '+'화면을 채우는 문장입니다. '.repeat(5)}));
   const {id}=await addBook('긴 오디오 시험','md',blocks);
   const wav=sec=>{const rate=8000,n=rate*sec,b=new ArrayBuffer(44+n),v=new DataView(b),w=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))};w(0,'RIFF');v.setUint32(4,36+n,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,'data');v.setUint32(40,n,true);new Uint8Array(b,44).fill(128);return new Blob([b],{type:'audio/wav'})};
   window.__ybSplitAudio=async blob=>blob.size>100000?[wav(10),wav(10),wav(10)]:[blob];
   await storeReq('audio','readwrite',s=>s.put({id,blob:wav(30),name:'긴.wav',aiVoice:'Hyunsu',timeline:blocks.map((_,i)=>[i,i]),timelineDuration:30}));
   const b=state.books.find(x=>x.id===id);b.index=15;await storeReq('books','readwrite',s=>s.put(b));await storeReq('audioPositions','readwrite',s=>s.put({id,time:15.3,updated:Date.now()}));
   return id});
  await page.evaluate(async id=>{await openBook(id)},id);
  await page.waitForFunction(()=>hasAttachedAudio()&&multiPart()&&state.pendingSeek==null&&state.audio.readyState>=1,null,{timeout:15000});
  // 1) 열면 이어 듣기 자리(15.3초)가 들어 있는 둘째 조각, 전체 길이는 30초
  const a1=await page.evaluate(()=>({parts:state.audioParts.length,part:state.partIdx,now:audioNow(),dur:audioDur(),index:state.index,shown:$('#playerPercent').textContent,log:audioLogText()}));
  assert.equal(a1.parts,3);assert.equal(a1.part,1);assert.ok(Math.abs(a1.now-15.3)<0.3&&Math.abs(a1.dur-30)<0.5,JSON.stringify(a1));
  assert.equal(a1.index,15);assert.match(a1.shown,/^0:15 \/ 0:30 · 5\d%$/);assert.match(a1.log,/긴 오디오를 3조각으로 나눠 재생/);
  // 2) 다른 조각으로 탐색(문단 누르기 = 9.6초쯤) → 첫 조각, 재생하면 조각 끝에서 다음 조각으로 이어진다
  await page.evaluate(()=>{setAudioNow(9.6);followAudioBlock(true)});
  await page.waitForFunction(()=>state.partIdx===0&&state.pendingSeek==null&&state.audio.readyState>=1&&Math.abs(audioNow()-9.6)<0.3,null,{timeout:10000});
  await page.locator('#playBtn').click();
  await page.waitForFunction(()=>state.partIdx===1&&state.playing&&!state.audio.paused&&audioNow()>10.05,null,{timeout:10000});
  await page.waitForTimeout(700);
  const a2=await page.evaluate(()=>({now:audioNow(),index:state.index,playing:state.playing,label:$('#playBtn').getAttribute('aria-label')}));
  assert.ok(a2.now>10&&a2.now<12.5&&a2.index===10&&a2.playing&&a2.label==='일시정지','the next part plays on and the paragraph follows: '+JSON.stringify(a2));
  // 3) 무음 유지 중 다른 조각 자리로 옮기고(잠금 화면 탐색) 재생 → 그 조각의 그 자리부터
  await page.locator('#playBtn').click();
  await page.waitForFunction(()=>state.softPause&&state.audio.src===state.silentAudioUrl,null,{timeout:10000});
  await page.evaluate(()=>window.__ms.seekto({seekTime:25.4}));
  await page.evaluate(()=>window.__ms.play());
  await page.waitForFunction(()=>!state.softPause&&state.partIdx===2&&state.playing&&!state.audio.paused&&Math.abs(audioNow()-25.4)<1.2,null,{timeout:10000});
  // 4) 이어 듣기 저장은 한 권 기준 시간
  await page.evaluate(()=>stopSpeech());
  const saved=await page.evaluate(id=>storeReq('audioPositions','readonly',s=>s.get(id)),id);
  assert.ok(saved.time>25&&saved.time<28,'the saved position is book time, not part time: '+saved.time);
  assert.deepEqual(errors,[]);
  console.log('여백 긴 오디오: MP3 프레임에서 약 80MB씩 자르기 · 이어 듣기 자리의 조각으로 열기 · 한 권 기준 시간·길이 · 조각 건너 탐색 · 조각 끝에서 다음 조각 자동 재생 · 무음 유지 뒤 다른 조각으로 · 저장은 한 권 기준 PASS');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
