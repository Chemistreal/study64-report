'use strict';
/** Headless real-browser regression for chat ZIP paste and device-only AI job queue. */
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer(async(req,res)=>{
 const p=(req.url||'/').split('?')[0],file=p==='/'?'reader/index.html':'reader/'+decodeURIComponent(p).replace(/^\/+/,'');
 const filename=path.resolve(root,file);
 if(!filename.startsWith(path.join(root,'reader')+path.sep)){res.writeHead(404).end();return}
 try{const bytes=await fs.readFile(filename);res.setHeader('Content-Type',filename.endsWith('.html')?'text/html; charset=utf-8':filename.endsWith('.js')?'text/javascript':filename.endsWith('.webmanifest')?'application/manifest+json':'application/octet-stream');res.end(bytes)}catch(e){res.writeHead(404).end()}
});
// 채팅 입력창의 '더 보기(⋯)'를 열어 클립보드·AI 준비 버튼을 꺼낸다.
const openComposerMore=async page=>{if(await page.locator('#composerMore').isHidden())await page.locator('#composerMoreBtn').click()};
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1130,height:840}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  page.on('dialog',dialog=>dialog.accept());
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>state.db?.objectStoreNames?.contains('aiParts'));
  const setup=await page.evaluate(()=>{
   const old=window.aiModule;
   window.__aiInvocations=0;
   window.__aiInjected=true;
   window.__failureBudget=1;
   window.aiModule=async()=>({
    generateAIBackgroundAudio:async(book,{voiceId,onProgress})=>{
      window.__aiInvocations++;
      if(window.__aiInvocations===2&&window.__failureBudget-->0)throw Error('Simulated interruption after checkpoint');
      onProgress?.({stage:'synthesizing',done:1,total:1});
      // MP3 payload surrogate: browser test verifies job bookkeeping, not audio quality.
      const bytes=new Uint8Array(1600);bytes[0]=0xff;bytes[1]=0xfb;bytes[2]=0x90;bytes[3]=0x64;
      return {blob:new Blob([bytes],{type:'audio/mpeg'}),voiceId}
    }
   });
   return {replaced:window.aiModule!==old,queueAuto:state.settings.aiAuto}
  });
  assert.equal(setup.replaced,true);
  assert.equal(setup.queueAuto,true);
  // Explicitly grant first-use on-device model permission through the real UI.
  await openComposerMore(page);await page.locator('#queueStartBtn').click();
  await page.waitForFunction(()=>state.settings.aiConsent===true);

  const test=await page.evaluate(async()=>{
   const JSZip=await zipLib(),zip=new JSZip();
   zip.file('01-first.txt',('문장 자동 생성 테스트를 반복합니다. '.repeat(1100)));
   zip.file('02-second.md','# 두번째\n\n별도의 도서를 가져왔습니다.');
   const bytes=await zip.generateAsync({type:'uint8array'});
   const item=new File([bytes],'chat-batch.zip',{type:'application/zip'});
   const clipboard=new DataTransfer();clipboard.items.add(item);
   const event=new ClipboardEvent('paste',{clipboardData:clipboard,bubbles:true,cancelable:true});
   const delivered=document.querySelector('#composerTitle').dispatchEvent(event);
   return {prevented:!delivered,size:bytes.length}
  });
  assert.equal(test.prevented,true,'ZIP paste must be captured even when the title input is focused');
  await page.waitForFunction(()=>state.books.length===2,null,{timeout:30000});
  // ZIP entries commit one by one; model consent is requested only after importFiles finishes.
  // Synthetic paste may not grant user activation for confirm() in all Chromium versions.
  if(!await page.evaluate(()=>state.settings.aiConsent)){await openComposerMore(page);await page.locator('#queueStartBtn').click()}
  await page.waitForFunction(()=>state.settings.aiConsent===true,null,{timeout:15000});
  const first=await page.evaluate(()=>({
    count:state.books.length,queue:state.localAiQueue.map(j=>({title:j.title,status:j.status})),consent:state.settings.aiConsent,
    names:state.books.map(b=>b.title)
  }));
  assert.equal(first.count,2);
  assert.equal(first.consent,true,'first-use permission must be sought');
  assert.equal(first.queue.length,2);
  assert.ok(first.names.includes('01-first'));

  await page.waitForFunction(()=>state.localAiQueue.some(j=>j.status==='failed'),null,{timeout:30000});
  const failed=await page.evaluate(async()=>{
   const tx=state.db.transaction('aiParts','readonly');
   const results=await new Promise(resolve=>{const req=tx.objectStore('aiParts').getAll();req.onsuccess=()=>resolve(req.result)});
   return {chunks:results.map(x=>x.id),calls:window.__aiInvocations}
  });
  assert.ok(failed.chunks.length>=1,'completed chunks must survive a failed batch');
  assert.ok(failed.calls>=2);
  await openComposerMore(page);await page.locator('#queueStartBtn').click();
  await page.waitForFunction(()=>state.localAiQueue.every(j=>j.status==='ready'),null,{timeout:30000});
  const completed=await page.evaluate(async()=>{
   const tx=state.db.transaction(['audio','aiParts'],'readonly');
   const all=store=>new Promise(resolve=>{const r=tx.objectStore(store).getAll();r.onsuccess=()=>resolve(r.result)});
   const audio=await all('audio'),parts=await all('aiParts');
   return {audio:audio.map(x=>({id:x.id,size:x.blob.size,voice:x.aiVoice})),partialCount:parts.length,calls:window.__aiInvocations};
  });
  assert.equal(completed.audio.length,2);
  assert.equal(completed.partialCount,0,'temporary checkpoints must be cleared after success');
  assert.ok(completed.calls>=3);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>state.localAiQueue.length===2&&state.localAiQueue.every(j=>j.status==='ready'));
  // iPhone screenshot regression: text was pasted into the bottom title input,
  // which previously caused Safari to auto-zoom and left the body empty.
  const plainPaste=await page.evaluate(()=>{
    const transfer=new DataTransfer();
    transfer.setData('text/plain','# 붙여넣은 테스트 제목\n\n글 본문을 자동으로 저장합니다.');
    const e=new ClipboardEvent('paste',{clipboardData:transfer,bubbles:true,cancelable:true});
    const dispatched=document.querySelector('#composerTitle').dispatchEvent(e);
    return {prevented:!dispatched,body:document.querySelector('#composerText').value,title:document.querySelector('#composerTitle').value};
  });
  assert.equal(plainPaste.prevented,true);
  assert.match(plainPaste.body,/글 본문을 자동으로 저장/);
  assert.equal(plainPaste.title,'붙여넣은 테스트 제목');

  // The explicit clipboard button must work with plain text when Safari exposes only readText().
  await page.evaluate(()=>{
    document.querySelector('#composerText').value='';
    document.querySelector('#composerText').dispatchEvent(new Event('input',{bubbles:true}));
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{
      read:async()=>{throw new DOMException('iOS denies binary clipboard','NotAllowedError')},readText:async()=>('# 클립보드 버튼 제목\n\n버튼으로 붙여넣었습니다.')
    }});
  });
  await openComposerMore(page);await page.locator('#composerPasteBtn').click();
  await page.waitForFunction(()=>document.querySelector('#composerText').value.includes('버튼으로 붙여넣었습니다.'));
  assert.equal(await page.locator('#composerTitle').inputValue(),'클립보드 버튼 제목');

  const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const mobilePage=await mobile.newPage();
  await mobilePage.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await mobilePage.waitForFunction(()=>!!state.db);
  const sizes=await mobilePage.evaluate(()=>{
    const title=document.querySelector('#composerTitle'),input=document.querySelector('#composerText');
    const a=title.getBoundingClientRect(),b=input.getBoundingClientRect(),buttons=document.querySelector('#composerAttachBtn').getBoundingClientRect();
    return {titleFont:parseFloat(getComputedStyle(title).fontSize),inputFont:parseFloat(getComputedStyle(input).fontSize),windowWidth:innerWidth,pageWidth:document.documentElement.scrollWidth,
      titleRight:a.right,inputRight:b.right,buttonRight:buttons.right,buttonVisible:buttons.width>0}
  });
  // 채팅 입력창처럼: 비어 있을 때는 한 줄(+ · 입력칸 · ⋯ · 보내기)만 보이고, 더 보기는 접혀 있다.
  const dock=await mobilePage.evaluate(()=>({h:Math.round(document.querySelector('#composerBox').getBoundingClientRect().height),more:document.querySelector('#composerMore').hidden}));
  assert.ok(dock.h<=72&&dock.more,'empty composer stays one compact line on iPhone: '+JSON.stringify(dock));
  assert.ok(sizes.titleFont>=16,'iOS title font must prevent auto-zoom: '+JSON.stringify(sizes));
  assert.ok(sizes.inputFont>=16,'iOS input font must prevent auto-zoom');
  assert.ok(sizes.titleRight<=sizes.windowWidth+2&&sizes.inputRight<=sizes.windowWidth+2,'mobile composer input must fit viewport: '+JSON.stringify(sizes));
  assert.ok(sizes.buttonVisible&&sizes.buttonRight<=sizes.windowWidth+2,'file picker must fit on iPhone');
  mobilePage.on('dialog',dialog=>dialog.dismiss());
  const fileChooserPromise=mobilePage.waitForEvent('filechooser',{timeout:8000});
  await mobilePage.locator('#composerAttachBtn').click();
  const chooser=await fileChooserPromise;
  await chooser.setFiles({name:'iphone-file-attachment.txt',mimeType:'text/plain',buffer:Buffer.from('# 파일 첨부로 저장한 도서\n\n이 책은 브라우저 파일 선택으로 등록했습니다.','utf8')});
  await mobilePage.waitForFunction(()=>state.books.some(book=>book.title==='iphone-file-attachment'),null,{timeout:15000});
  await mobile.close();

  assert.equal(errors.length,0,'browser page exceptions: '+errors.join(', '));
  console.log('PASS: iPhone-sized title/text paste, ZIP paste from title, explicit clipboard button, AI queue and resume');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
