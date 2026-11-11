'use strict';
// 여백 AI 오디오 꾸러미: PC(GPU)에서 만든 AI 오디오를 'AI 오디오 보내기'로 묶어, 다른 기기(아이폰)에서 + 버튼으로 가져오면
// 같은 글에는 오디오와 문단 시간표가 붙고, 없는 글은 함께 만들어진다(중복 책을 만들지 않는다).
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer(async(req,res)=>{
 const url=(req.url||'/').split('?')[0];
 const file=url==='/'?'reader/index.html':'reader/'+decodeURIComponent(url).replace(/^\//,'');
 const filename=path.resolve(root,file);
 if(!filename.startsWith(path.join(root,'reader')+path.sep)){res.writeHead(404);res.end();return}
 try{const bytes=await fs.readFile(filename);res.setHeader('Content-Type',filename.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8');res.end(bytes)}catch(e){res.writeHead(404);res.end()}
});
const BODY=['첫 문단입니다. 꾸러미 시험.','둘째 문단입니다.','셋째 문단입니다.'];
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port+'/';
 let browser;const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'yb-pack-'));
 try{
  browser=await chromium.launch({headless:true});
  // 1) PC: AI 오디오가 있는 책 두 권을 보낸다.
  const pc=await (await browser.newContext({acceptDownloads:true})).newPage();
  const errors=[];pc.on('pageerror',e=>errors.push(e.message));
  await pc.goto(origin,{waitUntil:'domcontentloaded'});
  await pc.waitForFunction(()=>typeof state!=='undefined'&&state.db);
  await pc.evaluate(async body=>{
   state.settings.aiAuto=false;await saveSettings();
   const a=await addBook('꾸러미 시험','md',body.map(text=>({kind:'paragraph',text})));
   const b=await addBook('새로 갈 책','md',[{kind:'paragraph',text:'받는 기기에는 없는 글입니다.'}]);
   const mp3=n=>new Blob([new Uint8Array(n).fill(7)],{type:'audio/mpeg'});
   await storeReq('audio','readwrite',s=>s.put({id:a.id,blob:mp3(4000),name:'꾸러미 시험 · AI M1.mp3',aiVoice:'M1',generatedAt:Date.now(),timeline:[[0,0],[1,1.5],[2,3]],timelineDuration:4.5}));
   await storeReq('audio','readwrite',s=>s.put({id:b.id,blob:mp3(3000),name:'새로 갈 책 · AI F1.mp3',aiVoice:'F1',generatedAt:Date.now()}));
   await storeReq('audio','readwrite',s=>s.put({id:'not-a-book',blob:mp3(3000),name:'x',aiVoice:'F1'}));
   backToLibrary();
  },BODY);
  await pc.locator('#composerMoreBtn').click();
  const downloading=pc.waitForEvent('download');
  await pc.locator('#composerMore .ai-export-btn').click();
  const download=await downloading;
  const packPath=path.join(tmp,download.suggestedFilename());await download.saveAs(packPath);
  assert.match(download.suggestedFilename(),/^yeobaek-ai-audio-\d{4}-\d{2}-\d{2}\.zip$/);
  // 2) 아이폰: 같은 글 한 권만 있다 → 가져오기
  const phone=await (await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})).newPage();
  phone.on('pageerror',e=>errors.push(e.message));
  await phone.goto(origin,{waitUntil:'domcontentloaded'});
  await phone.waitForFunction(()=>typeof state!=='undefined'&&state.db);
  await phone.evaluate(async body=>{state.settings.aiAuto=false;await saveSettings();await addBook('꾸러미 시험','md',body.map(text=>({kind:'paragraph',text})));backToLibrary()},BODY);
  await phone.locator('#composerFileInput').setInputFiles(packPath);
  await phone.waitForFunction(()=>state.books.length===2&&state.audioIds.size===2,null,{timeout:15000});
  const got=await phone.evaluate(async()=>{const all=await storeReq('audio','readonly',s=>s.getAll());return {titles:state.books.map(b=>b.title).sort(),audio:all.map(r=>({title:state.books.find(b=>b.id===r.id)?.title,voice:r.aiVoice,size:r.blob.size,timeline:r.timeline||null})).sort((a,b)=>a.title.localeCompare(b.title))}});
  assert.deepEqual(got.titles,['새로 갈 책','꾸러미 시험'].sort(),'the matching book is reused, the missing one is created: '+JSON.stringify(got.titles));
  assert.deepEqual(got.audio.find(a=>a.title==='꾸러미 시험'),{title:'꾸러미 시험',voice:'M1',size:4000,timeline:[[0,0],[1,1.5],[2,3]]},'audio and paragraph timeline arrive with the book');
  assert.equal(got.audio.find(a=>a.title==='새로 갈 책').size,3000);
  // 카드에 '오디오 준비됨'이 보인다.
  await phone.waitForFunction(()=>[...document.querySelectorAll('#bookGrid .book-audio')].filter(el=>!el.hidden&&/오디오 준비됨/.test(el.textContent)).length===2);
  assert.deepEqual(errors,[]);
  console.log('여백 AI 오디오 꾸러미: PC에서 보내기 → 다른 기기에서 + 로 가져오기 (같은 글 재사용 · 없는 글 생성 · 문단 시간표 유지) PASS');
 }finally{if(browser)await browser.close();server.close();await fs.rm(tmp,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exit(1)});
