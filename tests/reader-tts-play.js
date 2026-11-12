'use strict';
// 여백 '읽어주기' 회귀: 처음 온 사람이 재생을 누르면 **바로 들려야** 한다(확인창 없이 기기 음성으로).
// 기기 안 AI 목소리는 뺐다 — AI 낭독은 PC 여백 작업실이 만든 오디오 책으로 듣는다(tests/reader-audio-shelf.js).
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer(async(req,res)=>{
 const url=(req.url||'/').split('?')[0];
 const file=url==='/'?'reader/index.html':'reader/'+decodeURIComponent(url).replace(/^\//,'');
 const filename=path.resolve(root,file);
 if(!filename.startsWith(path.join(root,'reader')+path.sep)){res.writeHead(404);res.end();return}
 try{const bytes=await fs.readFile(filename);res.setHeader('Content-Type',filename.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8');res.end(bytes)}catch(e){res.writeHead(404);res.end()}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1100,height:820}});
  const errors=[],dialogs=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('dialog',d=>{dialogs.push(d.message());d.dismiss()});
  // Fake speech engine: records each utterance and the sentence highlighted while it plays.
  await page.addInitScript(()=>{
   window.__spoken=[];window.__marked=[];
   speechSynthesis.speak=u=>{window.__spoken.push(u.text);setTimeout(()=>{const h=window.CSS?.highlights?.get('yb-speaking');const r=h?[...h][0]:null;window.__marked.push(r?r.toString():null);u.onend&&u.onend()},20)};
  });
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>state.db&&document.querySelector('#bookCount'));
  const long='가나다라 마바사 아자차 카타파하 '.repeat(20).trim()+'.';
  const same='같은 말을 되풀이하는 긴 문장입니다 '.repeat(6).trim()+'.';
  await page.locator('#composerText').fill('# 듣기 시험\n\n첫 문장입니다. 둘째 문장입니다.\n\n'+long+'\n\n'+same+' '+same);
  await page.locator('#composerSave').click();
  await page.locator('#readerTitle').getByText('듣기 시험').waitFor();
  assert.deepEqual(dialogs,[],'saving a book asks nothing');
  await page.locator('#playBtn').click();
  await page.waitForFunction(()=>!state.playing&&window.__spoken.length>0,null,{timeout:10000});
  const result=await page.evaluate(()=>({spoken:window.__spoken,marked:window.__marked}));
  assert.deepEqual(dialogs,[],'play asks nothing');
  assert.equal(result.spoken[0],'듣기 시험');
  assert.ok(result.spoken.length>=6,'long paragraph is read in several chunks: '+result.spoken.length);
  assert.equal(result.spoken.join(' ').includes('둘째 문장입니다.'),true);
  assert.ok(result.marked.some(Boolean),'Chromium supports CSS highlights, so the spoken sentence must be marked');
  {
   // Each highlighted sentence matches what is being spoken, including repeated sentences.
   result.spoken.forEach((text,i)=>assert.equal(result.marked[i].replace(/\s+/g,' ').trim(),text.replace(/\s+/g,' ').trim(),'highlight #'+i));
  }
  const cleared=await page.evaluate(()=>{const h=window.CSS?.highlights?.get('yb-speaking');return h?h.size:0});
  assert.equal(cleared,0,'highlight is cleared when reading stops');
  assert.deepEqual(errors,[]);
  assert.equal(await page.locator('#streamServerUrl').count(),0,'stream-server settings are removed from the menu');

  // 추천 글의 강의 ZIP을 담으면 37권이 들어오고, 확인창·AI 준비 대기열·AI 배지가 없다. 목소리 메뉴에는 기기 음성만 있다.
  const shelf=await browser.newPage({viewport:{width:1100,height:820}});
  const shelfErrors=[],shelfDialogs=[];
  shelf.on('pageerror',e=>shelfErrors.push(e.message));
  shelf.on('dialog',d=>{shelfDialogs.push(d.type());d.accept()});
  await shelf.addInitScript(()=>{window.__spoken=[];speechSynthesis.speak=u=>{window.__spoken.push({text:u.text,voice:u.voice?.name||''});setTimeout(()=>u.onend&&u.onend(),15)}});
  await shelf.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await shelf.waitForFunction(()=>state.db&&document.querySelector('#bookCount'));
  await shelf.locator('#libraryBtn').click();
  await shelf.locator('#libraryList button',{hasText:'서재에 담기'}).first().click();
  await shelf.waitForFunction(()=>state.books.length>=37,null,{timeout:60000});
  const shelfState=await shelf.evaluate(()=>({titles:state.books.map(b=>b.title),badges:[...document.querySelectorAll('#bookGrid .book-audio')].filter(el=>!el.hidden).length,aiOptions:document.querySelectorAll('#voiceSelect option[value^="ai:"],#voiceSelect optgroup[data-ai]').length}));
  assert.deepEqual(shelfDialogs,[],'importing the shelf asks nothing');
  assert.ok(shelfState.titles.some(t=>t.startsWith('49강'))&&shelfState.titles.some(t=>t.startsWith('82강')),'all lectures imported');
  assert.equal(shelfState.badges,0,'books without audio show no audio badge');
  assert.equal(shelfState.aiOptions,0,'the voice menu has device voices only');
  // 오디오가 없는 책은 재생을 누르면 기기 음성으로 바로 읽는다(AI를 부르거나 묻지 않는다).
  await shelf.locator('*:has(.book-open)',{hasText:'49강'}).last().locator('.book-open').click();
  await shelf.locator('#playBtn').click();
  await shelf.waitForFunction(()=>window.__spoken.length>=2,null,{timeout:10000});
  await shelf.evaluate(()=>stopSpeech());
  assert.match((await shelf.evaluate(()=>window.__spoken))[0].text,/49강/,'device voice reads the opened lecture from its title');
  assert.deepEqual(shelfDialogs,[],'playing asks nothing');
  assert.deepEqual(shelfErrors,[]);

  // 책 하나를 다 들으면 서재 제목 순서(1강→2강→10강)로 다음 책을 이어 읽는다. 끄면 그 책에서 멈춘다.
  const series=await browser.newPage({viewport:{width:1100,height:820}});
  const seriesErrors=[];series.on('pageerror',e=>seriesErrors.push(e.message));series.on('dialog',d=>d.dismiss());
  await series.addInitScript(()=>{window.__spoken=[];speechSynthesis.speak=u=>{window.__spoken.push(u.text);setTimeout(()=>u.onend&&u.onend(),15)}});
  await series.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await series.waitForFunction(()=>state.db&&document.querySelector('#bookCount'));
  for(const [title,body] of [['10강 끝','열째 강의 본문입니다.'],['2강 가운데','둘째 강의 본문입니다.'],['1강 처음','첫째 강의 본문입니다.']]){
   if(await series.locator('#readerView:not(.hidden)').count())await series.locator('#backBtn').click();
   await series.locator('#composerText').fill('# '+title+'\n\n'+body);
   await series.locator('#composerSave').click();
   await series.locator('#readerTitle').getByText(title).waitFor();
  }
  assert.equal(await series.evaluate(()=>state.settings.continueNext),true,'continuing to the next book is on by default');
  await series.locator('#playBtn').click();
  await series.waitForFunction(()=>state.book?.title==='10강 끝'&&state.book.completed&&!state.playing,null,{timeout:20000});
  const seriesSpoken=await series.evaluate(()=>window.__spoken);
  assert.deepEqual(seriesSpoken,['1강 처음','첫째 강의 본문입니다.','2강 가운데','둘째 강의 본문입니다.','10강 끝','열째 강의 본문입니다.'],'books continue in natural title order');
  // 끄면 다음 책으로 넘어가지 않는다.
  await series.locator('#backBtn').click();
  await series.locator('*:has(.book-open)',{hasText:'1강 처음'}).last().locator('.book-open').click();
  await series.locator('#readerTitle').getByText('1강 처음').waitFor();
  await series.locator('#settingsBtn').click();await series.locator('#continueNextToggle').uncheck();await series.locator('#settingsDrawer .close-layer').click();
  await series.evaluate(()=>{window.__spoken=[];state.book.completed=false;state.index=0;state.chunk=0});
  await series.locator('#playBtn').click();
  await series.waitForFunction(()=>state.book.completed&&!state.playing,null,{timeout:20000});
  assert.equal(await series.evaluate(()=>state.book.title),'1강 처음','stays on the finished book when turned off');
  assert.deepEqual(await series.evaluate(()=>window.__spoken),['1강 처음','첫째 강의 본문입니다.']);
  // 취침 타이머 '이 책이 끝나면': 이어 듣기가 켜져 있어도 이 책에서 멈춘다.
  await series.locator('#settingsBtn').click();await series.locator('#continueNextToggle').check();await series.locator('#sleepTimerSelect').selectOption('book');
  assert.match(await series.locator('#sleepTimerStatus').textContent(),/끝까지 읽으면 멈춥니다/);
  await series.locator('#settingsDrawer .close-layer').click();
  await series.evaluate(()=>{window.__spoken=[];state.book.completed=false;state.index=0;state.chunk=0});
  await series.locator('#playBtn').click();
  await series.waitForFunction(()=>state.book.completed&&!state.playing&&!state.sleepAfterBook,null,{timeout:20000});
  await series.waitForTimeout(300);
  assert.equal(await series.evaluate(()=>state.book.title),'1강 처음','sleep-after-book stops at the end of this book');
  assert.equal(await series.locator('#sleepTimerSelect').inputValue(),'0','the timer resets after stopping');
  assert.deepEqual(seriesErrors,[]);

  // 미리 만든 오디오(시간표 있음)는 재생 위치에 맞춰 읽는 문단을 따라가고, 문단을 누르면 그 문단의 소리로 이동한다.
  const synced=await browser.newPage({viewport:{width:1100,height:820}});
  const syncedErrors=[];synced.on('pageerror',e=>syncedErrors.push(e.message));synced.on('dialog',d=>d.dismiss());
  await synced.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await synced.waitForFunction(()=>state.db&&document.querySelector('#bookCount'));
  await synced.evaluate(async()=>{
   const {id}=await addBook('동기화 시험','md',[{kind:'paragraph',text:'첫 문단.'},{kind:'paragraph',text:'둘째 문단.'},{kind:'paragraph',text:'셋째 문단.'}]);
   const rate=8000,n=rate*6,b=new ArrayBuffer(44+n*2),v=new DataView(b),w=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))};w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
   await storeReq('audio','readwrite',store=>store.put({id,blob:new Blob([b],{type:'audio/wav'}),name:'동기화.wav',aiVoice:'Hyunsu',timeline:[[0,0],[1,1],[2,2]],timelineDuration:3}));
  });
  await synced.locator('*:has(.book-open)',{hasText:'동기화 시험'}).last().locator('.book-open').click();
  await synced.waitForFunction(()=>state.audioTimeline&&Number.isFinite(state.audio.duration)&&state.audio.duration>5);
  // 실제 길이 6초 / 시간표 3초 → 비율 2배로 맞춘다: 2.5초는 둘째 문단(1초×2 이후).
  await synced.evaluate(()=>{state.audio.currentTime=2.5;state.audio.dispatchEvent(new Event('timeupdate'))});
  assert.equal(await synced.evaluate(()=>state.index),1,'audio position moves the current paragraph');
  await synced.locator('.reader-block').nth(2).click();
  await synced.waitForFunction(()=>state.index===2&&Math.abs(state.audio.currentTime-4)<0.05,null,{timeout:5000}).catch(()=>{});   // 바쁜 컴퓨터에서도 위치가 맞춰질 때까지
  const jumped=await synced.evaluate(()=>({time:state.audio.currentTime,index:state.index}));
  assert.equal(jumped.index,2);
  assert.ok(Math.abs(jumped.time-4)<0.05,'tapping a paragraph seeks the audio to it: '+jumped.time);
  assert.deepEqual(syncedErrors,[]);
  console.log('여백 읽어주기: 확인창 없이 바로 낭독 · 읽는 문장 표시 · '+result.spoken.length+'구간 · 추천 글 '+shelfState.titles.length+'권 담기(AI 대기열·배지 없음) · 오디오 없는 책은 기기 음성 · 다음 책 이어 듣기 · 취침 타이머 · 오디오 문단 동기화 PASS');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
