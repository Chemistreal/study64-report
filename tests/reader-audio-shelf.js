'use strict';
// 여백 추천 글의 'AI 오디오 책': PC 작업실이 오디오 저장소(같은 사이트의 /yeobaek-audio/)에 올린 책을
// '오디오와 함께 담기'로 받으면, 19MB 조각들을 받아 하나로 잇고 글·문단 시간표와 함께 서재에 넣는다.
// 같은 글이 이미 있으면 새 책을 만들지 않고 그 책에 오디오를 붙인다. 사이트 안 추천 글(./library)도 함께 보인다.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs/promises'),fss=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
(async()=>{
 const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'yb-shelf-'));
 const E=await import(pathToFileURL(path.join(root,'reader/pc-tool/engine.mjs')).href);
 const P=await import(pathToFileURL(path.join(root,'reader/pc-tool/publish.mjs')).href);
 // PC 작업실이 만드는 것과 같은 꾸러미(오디오는 가짜 바이트, 조각 3개)
 const book=E.bookFromFile('오디오 시험 책.md',Buffer.from('# 오디오 시험 책\n\n첫 문단입니다.\n\n둘째 문단입니다.\n\n셋째 문단입니다.'));
 const bytes=Buffer.from(Array.from({length:2600},(_,i)=>(i*13+5)%251));const mp3=path.join(tmp,'a.mp3');fss.writeFileSync(mp3,bytes);
 const r={mp3,marks:book.blocks.map((b,i)=>[i,i*2]),duration:book.blocks.length*2,bytes:bytes.length,speed:1.5,profile:'small'};
 const site=path.join(tmp,'yeobaek-audio'),id=P.bookId(book.hash);
 E.writeSiteBundle(book,r,path.join(site,'books',id),{partBytes:1000});
 P.addToShelf(site,{id,title:book.title,description:'현수 목소리 · 1.5배속',manifest:'books/'+id+'/book.json',bytes:bytes.length,duration:r.duration});
 const requested=[];
 const server=http.createServer(async(req,res)=>{
  const url=decodeURIComponent((req.url||'/').split('?')[0]);
  let filename;
  if(url.startsWith('/yeobaek-audio/')){requested.push(url);filename=path.resolve(site,url.slice('/yeobaek-audio/'.length));if(!filename.startsWith(site+path.sep)){res.writeHead(404);res.end();return}}
  else{filename=path.resolve(root,url==='/'?'reader/index.html':'reader/'+url.replace(/^\//,''));if(!filename.startsWith(path.join(root,'reader')+path.sep)){res.writeHead(404);res.end();return}}
  try{const data=await fs.readFile(filename);res.setHeader('Content-Type',filename.endsWith('.js')?'text/javascript; charset=utf-8':filename.endsWith('.json')?'application/json':filename.endsWith('.mp3')?'audio/mpeg':'text/html; charset=utf-8');res.end(data)}catch(e){res.writeHead(404);res.end()}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port+'/';
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
  const page=await (await browser.newContext()).newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.on('dialog',d=>d.accept());
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof state!=='undefined'&&state.db);
  await page.evaluate(async()=>{state.settings.aiAuto=false;await saveSettings()});
  // 1) 추천 글: AI 오디오 책과 사이트 안 추천 글이 함께 보인다
  await page.evaluate(()=>openLibraryShelf());
  const row=page.locator('#libraryList .trash-item',{hasText:'오디오 시험 책'});
  await row.waitFor();
  assert.match(await row.textContent(),/AI 낭독 오디오 포함/);
  assert.ok(await page.locator('#libraryList button',{hasText:'서재에 담기'}).count()>=1,'site library rows still show');
  // 2) 담기 → 조각 3개를 받아 잇고, 글·시간표·목소리와 함께 서재에 들어간다
  await row.locator('button').click();
  await page.waitForFunction(()=>state.books.some(b=>b.title==='오디오 시험 책')&&state.audioIds.size===1,null,{timeout:15000});
  const saved=await page.evaluate(async()=>{const b=state.books.find(x=>x.title==='오디오 시험 책');const a=await storeReq('audio','readonly',s=>s.get(b.id));return {blocks:b.blocks.length,size:a.blob.size,head:[...new Uint8Array(await a.blob.slice(0,8).arrayBuffer())],timeline:a.timeline,duration:a.timelineDuration,voice:a.aiVoice}});
  assert.equal(saved.blocks,book.blocks.length);assert.equal(saved.size,bytes.length);assert.deepEqual(saved.head,[...bytes.subarray(0,8)]);
  assert.equal(saved.timeline.length,book.blocks.length);assert.equal(saved.duration,r.duration);assert.equal(saved.voice,'Hyunsu');
  assert.deepEqual(requested.filter(u=>u.endsWith('.mp3')).sort(),['/yeobaek-audio/books/'+id+'/audio.001.mp3','/yeobaek-audio/books/'+id+'/audio.002.mp3','/yeobaek-audio/books/'+id+'/audio.003.mp3']);
  // 3) 다시 담아도 같은 글이면 새 책을 만들지 않는다
  await page.evaluate(()=>openLibraryShelf());
  await page.locator('#libraryList .trash-item',{hasText:'오디오 시험 책'}).locator('button').click();
  await page.waitForFunction(()=>!document.querySelector('#libraryModal')||document.querySelector('#libraryModal').classList.contains('hidden'),null,{timeout:15000});
  assert.equal(await page.evaluate(()=>state.books.filter(b=>b.title==='오디오 시험 책').length),1);
  // 4) 책을 열고 목차 등으로 셋째 문단에 간 뒤 읽어주기를 누르면 그 문단부터 오디오가 나온다.
  //    같은 문단 안에서 멈췄다 다시 누르면 처음으로 돌아가지 않고 듣던 자리에서 이어진다. 재생 중에는 소리를 따라 문단 표시가 움직인다.
  const follow=await page.evaluate(async()=>{
   await loadScript('./vendor/lame.min.js');
   const rate=16000,secs=8,pcm=new Int16Array(rate*secs);for(let i=0;i<pcm.length;i++)pcm[i]=Math.round(9000*Math.sin(i*2*Math.PI*330/rate));
   const enc=new lamejs.Mp3Encoder(1,rate,16),out=[];for(let i=0;i<pcm.length;i+=1152){const b=enc.encodeBuffer(pcm.subarray(i,i+1152));if(b.length)out.push(new Uint8Array(b))}out.push(new Uint8Array(enc.flush()));
   const b=state.books.find(x=>x.title==='오디오 시험 책');
   await storeReq('audio','readwrite',st=>st.put({id:b.id,blob:new Blob(out,{type:'audio/mpeg'}),name:'시험.mp3',aiVoice:'Hyunsu',generatedAt:Date.now(),timeline:[[0,0],[1,2],[2,4],[3,6]],timelineDuration:8}));
   state.settings.rate=1;openBook(b.id);
   const a=state.audio;for(let i=0;i<100&&!(Number.isFinite(a.duration)&&a.duration>0&&state.audioTimeline);i++)await new Promise(r=>setTimeout(r,100));
   a.currentTime=0;showPosition(2,{mark:true});                    // 목차로 셋째 문단(시각 4초)에 감
   startSpeech();const jumped=a.currentTime;
   await new Promise(r=>setTimeout(r,700));stopSpeech();
   const paused=a.currentTime;startSpeech();const resumed=a.currentTime;   // 같은 문단: 이어 듣기
   for(let i=0;i<40&&state.index<3;i++)await new Promise(r=>setTimeout(r,100)); // 6초 지나면 넷째 문단으로
   const followed=state.index;stopSpeech();
   return {jumped,paused,resumed,followed,duration:a.duration};
  });
  assert.ok(Math.abs(follow.jumped-4*follow.duration/8)<.35,'play starts at the paragraph being read: '+JSON.stringify(follow));
  assert.ok(follow.paused>follow.jumped&&Math.abs(follow.resumed-follow.paused)<.2,'same paragraph resumes where it paused: '+JSON.stringify(follow));
  assert.equal(follow.followed,3,'the highlighted paragraph follows the audio');
  await page.evaluate(()=>backToLibrary());
  // 5) 오디오 저장소가 없거나 꺼져 있어도 사이트 안 추천 글은 그대로 보인다
  await fs.rm(path.join(site,'index.json'));
  await page.evaluate(()=>openLibraryShelf());
  await page.locator('#libraryList button',{hasText:'서재에 담기'}).first().waitFor();
  assert.equal(await page.locator('#libraryList .trash-item',{hasText:'오디오 시험 책'}).count(),0);
  assert.deepEqual(errors,[]);
  console.log('여백 추천 글 AI 오디오 책: 목록 · 조각 받아 잇기 · 시간표 · 중복 없음 · 읽는 문단부터 재생·이어 듣기·문단 따라가기 · 저장소 없을 때 PASS');
 }finally{await browser?.close();server.close();await fs.rm(tmp,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exit(1)});
