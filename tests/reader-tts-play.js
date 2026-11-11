'use strict';
// 여백 '읽어주기' 회귀: 처음 온 사람이 재생을 누르면 **바로 들려야** 한다.
// 예전에는 재생·저장 때마다 AI 모델 380MB 다운로드 확인창이 떴고, 거절하면 아무것도 읽지 않았다.
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
  assert.deepEqual(dialogs,[],'saving a book must not ask for the AI model download');
  await page.locator('#playBtn').click();
  await page.waitForFunction(()=>!state.playing&&window.__spoken.length>0,null,{timeout:10000});
  const result=await page.evaluate(()=>({spoken:window.__spoken,marked:window.__marked,consent:state.settings.aiConsent}));
  assert.deepEqual(dialogs,[],'play must not ask for the AI model download');
  assert.equal(result.consent,false);
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

  // Uploading a ZIP (here via the 추천 글 shelf) asks once for the on-device model, then prepares AI audio by itself.
  const shelf=await browser.newPage({viewport:{width:1100,height:820}});
  const shelfErrors=[],shelfDialogs=[];
  shelf.on('pageerror',e=>shelfErrors.push(e.message));
  shelf.on('dialog',d=>{shelfDialogs.push(d.type());d.accept()});
  await shelf.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await shelf.waitForFunction(()=>state.db&&document.querySelector('#bookCount'));
  await shelf.evaluate(()=>{window.__aiCalls=0;window.aiModule=async()=>({generateAIBackgroundAudio:async(book,{voiceId,onProgress})=>{window.__aiCalls++;onProgress?.({stage:'synthesizing',done:1,total:1});const bytes=new Uint8Array(1600);bytes[0]=0xff;bytes[1]=0xfb;return {blob:new Blob([bytes],{type:'audio/mpeg'}),voiceId}}})});
  await shelf.locator('#libraryBtn').click();
  await shelf.locator('#libraryList button').first().click();
  await shelf.waitForFunction(()=>state.books.length>=37,null,{timeout:60000});
  await shelf.waitForFunction(()=>state.settings.aiConsent===true&&window.__aiCalls>0,null,{timeout:30000});
  const shelfState=await shelf.evaluate(()=>({titles:state.books.map(b=>b.title),queued:state.localAiQueue.length}));
  assert.equal(shelfDialogs.filter(t=>t==='confirm').length,1,'model download is confirmed exactly once');
  assert.ok(shelfState.titles.some(t=>t.startsWith('49강')),'first lecture imported');
  assert.ok(shelfState.titles.some(t=>t.startsWith('82강')),'last lecture imported');
  assert.ok(shelfState.queued>=37,'every uploaded lecture is queued for AI audio');
  // 서재 카드마다 AI 음성 준비 상태가 보인다(대기 → 만드는 중 → 준비됨).
  await shelf.waitForFunction(()=>[...document.querySelectorAll('#bookGrid .book-audio')].some(el=>!el.hidden&&/오디오 준비됨/.test(el.textContent)),null,{timeout:30000});
  const badges=await shelf.evaluate(()=>[...document.querySelectorAll('#bookGrid .book-audio')].filter(el=>!el.hidden).map(el=>el.textContent));
  assert.ok(badges.length>=37,'every lecture card shows its AI audio state: '+badges.length);
  assert.ok(badges.some(t=>/대기|만드는 중/.test(t)),'cards still waiting say so: '+badges.slice(0,5).join(','));
  assert.deepEqual(shelfErrors,[]);

  // 실시간 AI 낭독: 미리 만들지 않아도 재생하면 AI 목소리로 지금 문장부터 이어 읽는다(모델은 짧은 무음 WAV를 돌려주는 가짜).
  const live=await browser.newPage({viewport:{width:1100,height:820}});
  const liveErrors=[],liveDialogs=[];
  live.on('pageerror',e=>liveErrors.push(e.message));
  live.on('dialog',d=>{liveDialogs.push(d.type());d.dismiss()});
  await live.addInitScript(()=>{window.__spoken=[];speechSynthesis.speak=u=>{window.__spoken.push(u.text);setTimeout(()=>u.onend&&u.onend(),20)}});
  await live.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await live.waitForFunction(()=>state.db&&document.querySelector('#bookCount'));
  await live.evaluate(async()=>{
   state.settings.aiConsent=true;await saveSettings();
   window.__synth=[];window.__played=[];window.__voices=[];
   const wav=seconds=>{const rate=8000,n=Math.round(rate*seconds),b=new ArrayBuffer(44+n*2),v=new DataView(b),w=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))};w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);return new Blob([b],{type:'audio/wav'})};
   window.aiModule=async()=>({synthesizeSpeech:async(text,opts)=>{window.__synth.push(text);window.__voices.push(opts?.voiceId);(window.__steps=window.__steps||[]).push(opts?.steps);await new Promise(r=>setTimeout(r,40));return {blob:wav(.12),duration:.12}}});
  });
  await live.locator('#composerText').fill('# 실시간\n\n첫째 문장입니다. 둘째 문장입니다.\n\n셋째 문단입니다.');
  await live.locator('#composerSave').click();
  await live.locator('#readerTitle').getByText('실시간').waitFor();
  await live.evaluate(()=>{window.__labels=[];const a=liveAudio();a.addEventListener('playing',()=>{window.__labels.push($('#playerLabel').textContent);if(!a.loop)window.__played.push(CSS.highlights.get('yb-speaking')?[...CSS.highlights.get('yb-speaking')][0]?.toString()||'':'')})});
  // 목소리 메뉴 맨 위의 AI 목소리를 고르면 실시간 낭독이 그 목소리로 나온다.
  await live.evaluate(()=>loadVoices());
  const pickVoice=async value=>{await live.locator('#voiceShortcut').click();await live.locator('#voiceSelect').selectOption(value);await live.waitForTimeout(100);await live.locator('#settingsDrawer .close-layer').click()};
  assert.equal(await live.locator('#voiceSelect option[value^="ai:"]').count(),6,'six AI voices in the voice menu');
  await pickVoice('ai:M1');
  assert.deepEqual(await live.evaluate(()=>({live:state.settings.aiLive,voice:state.settings.aiVoice,section:$('#aiVoiceSelect').value})),{live:true,voice:'M1',section:'M1'});
  await live.locator('#playBtn').click();
  await live.waitForFunction(()=>state.book.completed===true&&!state.playing,null,{timeout:20000});
  const liveResult=await live.evaluate(()=>({synth:window.__synth,played:window.__played,spoken:window.__spoken,voices:window.__voices}));
  assert.ok(liveResult.voices.length&&liveResult.voices.every(v=>v==='M1'),'live narration uses the AI voice chosen in the menu');
  assert.ok((await live.evaluate(()=>window.__steps)).every(n=>n===8),'normal AI quality uses 8 refinement steps');
  assert.deepEqual(liveDialogs,[],'live AI reading asks nothing');
  const labels=await live.evaluate(()=>({seen:window.__labels,now:$('#playerLabel').textContent}));
  assert.ok(labels.seen.some(t=>/^AI 낭독 · (\d+초 앞서 준비|마지막 문장)/.test(t)),'player shows how far ahead the AI voice is: '+labels.seen.join(' | '));
  assert.equal(labels.now,'LISTENING MODE','label returns when reading stops');
  assert.deepEqual(liveResult.spoken,[],'device speech is not used while AI live reading works');
  assert.deepEqual(liveResult.synth,['실시간','첫째 문장입니다. 둘째 문장입니다.','셋째 문단입니다.'],'AI synthesizes each passage in order');
  assert.deepEqual(liveResult.played.map(t=>t.replace(/\s+/g,' ').trim()),liveResult.synth,'each AI passage plays with its sentence highlighted');

  // 같은 목소리로 다시 들으면 방금 만든 소리를 다시 써서 AI를 또 부르지 않는다.
  await live.evaluate(()=>{state.book.completed=false;state.index=0;state.chunk=0;window.__synth=[]});
  await live.locator('#playBtn').click();
  await live.waitForFunction(()=>state.book.completed===true&&!state.playing,null,{timeout:20000});
  assert.deepEqual(await live.evaluate(()=>window.__synth),[],'replaying reuses the clips it just made');
  // 기기 음성을 고르면 기기 음성으로 읽는다.
  const deviceVoice=await live.evaluate(()=>[...$('#voiceSelect').options].find(o=>!o.value.startsWith('ai:')).value);
  await pickVoice(deviceVoice);
  assert.equal(await live.evaluate(()=>state.settings.aiLive),false);
  await live.evaluate(()=>{state.book.completed=false;state.index=0;state.chunk=0;window.__spoken=[];window.__synth=[]});
  await live.locator('#playBtn').click();
  await live.waitForFunction(()=>window.__spoken.length>=3&&!state.playing,null,{timeout:20000});
  assert.deepEqual(await live.evaluate(()=>window.__synth),[],'device voice choice does not call the AI');

  // AI를 못 불러오면 기기 음성으로 넘어간다.
  await pickVoice('ai:F1');
  await live.evaluate(()=>{window.aiModule=async()=>{throw Error('offline')};state.book.completed=false;state.index=0;state.chunk=0;window.__spoken=[]});
  await live.locator('#playBtn').click();
  await live.waitForFunction(()=>window.__spoken.length>=3&&!state.playing,null,{timeout:20000});
  assert.equal(await live.evaluate(()=>state.liveAiFailed),true);
  assert.deepEqual(liveErrors,[]);

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
  // AI 미리 만들기는 지금 책, 그다음 강의 순서로 고른다.
  const pick=await series.evaluate(()=>{const saved=state.localAiQueue;const id=t=>state.books.find(b=>b.title===t).id;
   state.localAiQueue=['10강 끝','2강 가운데','1강 처음'].map(t=>({bookId:id(t),title:t,status:'queued'}));
   const order=[];for(let i=0;i<3;i++){const j=nextQueuedAiJob();order.push(j.title);j.status='ready'}
   state.localAiQueue=saved;return order});
  assert.deepEqual(pick,['1강 처음','2강 가운데','10강 끝'],'AI preparation follows the listening order');
  assert.deepEqual(seriesErrors,[]);

  // 미리 만든 AI 오디오는 재생 위치에 맞춰 읽는 문단을 따라가고, 문단을 누르면 그 문단의 소리로 이동한다.
  const synced=await browser.newPage({viewport:{width:1100,height:820}});
  const syncedErrors=[];synced.on('pageerror',e=>syncedErrors.push(e.message));synced.on('dialog',d=>d.dismiss());
  await synced.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await synced.waitForFunction(()=>state.db&&document.querySelector('#bookCount'));
  await synced.evaluate(async()=>{
   const {id}=await addBook('동기화 시험','md',[{kind:'paragraph',text:'첫 문단.'},{kind:'paragraph',text:'둘째 문단.'},{kind:'paragraph',text:'셋째 문단.'}]);
   const rate=8000,n=rate*6,b=new ArrayBuffer(44+n*2),v=new DataView(b),w=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))};w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
   await storeReq('audio','readwrite',store=>store.put({id,blob:new Blob([b],{type:'audio/wav'}),name:'동기화.wav',aiVoice:'F1',timeline:[[0,0],[1,1],[2,2]],timelineDuration:3}));
  });
  await synced.locator('*:has(.book-open)',{hasText:'동기화 시험'}).last().locator('.book-open').click();
  await synced.waitForFunction(()=>state.audioTimeline&&Number.isFinite(state.audio.duration)&&state.audio.duration>5);
  // 실제 길이 6초 / 시간표 3초 → 비율 2배로 맞춘다: 2.5초는 둘째 문단(1초×2 이후).
  await synced.evaluate(()=>{state.audio.currentTime=2.5;state.audio.dispatchEvent(new Event('timeupdate'))});
  assert.equal(await synced.evaluate(()=>state.index),1,'audio position moves the current paragraph');
  await synced.locator('.reader-block').nth(2).click();
  const jumped=await synced.evaluate(()=>({time:state.audio.currentTime,index:state.index}));
  assert.equal(jumped.index,2);
  assert.ok(Math.abs(jumped.time-4)<0.05,'tapping a paragraph seeks the audio to it: '+jumped.time);
  assert.deepEqual(syncedErrors,[]);
  console.log('여백 읽어주기: 확인창 없이 바로 낭독 · 읽는 문장 표시 · '+result.spoken.length+'구간 · 추천 글 '+shelfState.titles.length+'권 업로드 후 AI 자동 준비 · 다음 책 이어 듣기 · 오디오 문단 동기화 · 메뉴에서 고른 AI 목소리로 실시간 낭독 · 기기 음성 선택·대체 PASS');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
