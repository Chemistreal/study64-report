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

  const test=await page.evaluate(async()=>{
   const JSZip=await zipLib(),zip=new JSZip();
   zip.file('첫번째.txt',('문장 자동 생성 테스트를 반복합니다. '.repeat(1100)));
   zip.file('둘째.md','# 두번째\n\n별도의 도서를 가져왔습니다.');
   const bytes=await zip.generateAsync({type:'uint8array'});
   const item=new File([bytes],'chat-batch.zip',{type:'application/zip'});
   const clipboard=new DataTransfer();clipboard.items.add(item);
   const event=new ClipboardEvent('paste',{clipboardData:clipboard,bubbles:true,cancelable:true});
   const delivered=document.querySelector('#composerText').dispatchEvent(event);
   return {prevented:!delivered,size:bytes.length}
  });
  assert.equal(test.prevented,true,'paste must be captured for ZIP files');
  await page.waitForFunction(()=>state.books.length===2,null,{timeout:30000});
  const first=await page.evaluate(()=>({
    count:state.books.length,queue:state.localAiQueue.map(j=>({title:j.title,status:j.status})),consent:state.settings.aiConsent,
    names:state.books.map(b=>b.title)
  }));
  assert.equal(first.count,2);
  assert.equal(first.consent,true,'first-use permission must be sought');
  assert.equal(first.queue.length,2);
  assert.ok(first.names.includes('첫번째'));

  await page.waitForFunction(()=>state.localAiQueue.some(j=>j.status==='failed'),null,{timeout:30000});
  const failed=await page.evaluate(async()=>{
   const tx=state.db.transaction('aiParts','readonly');
   const results=await new Promise(resolve=>{const req=tx.objectStore('aiParts').getAll();req.onsuccess=()=>resolve(req.result)});
   return {chunks:results.map(x=>x.id),calls:window.__aiInvocations}
  });
  assert.ok(failed.chunks.length>=1,'completed chunks must survive a failed batch');
  assert.ok(failed.calls>=2);
  await page.locator('#queueStartBtn').click();
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
  assert.equal(errors.length,0,'browser page exceptions: '+errors.join(', '));
  console.log('PASS: ZIP clipboard paste, automatic local AI queue, checkpointed retry, MP3 storage and reload');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
