'use strict';
/** Headless real-browser regression for chat ZIP paste, clipboard button and the compact iPhone composer. */
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
// 채팅 입력창의 '더 보기(⋯)'를 열어 클립보드 버튼을 꺼낸다.
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
  await page.waitForFunction(()=>!!state.db);
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
  const first=await page.evaluate(async()=>({count:state.books.length,names:state.books.map(b=>b.title),audio:(await storeReq('audio','readonly',s=>s.count())),aiQueue:typeof state.localAiQueue}));
  assert.equal(first.count,2);
  assert.ok(first.names.includes('01-first'));
  assert.equal(first.audio,0,'text-only ZIP adds no audio');
  assert.equal(first.aiQueue,'undefined','no on-device AI queue any more');
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
  console.log('PASS: iPhone-sized title/text paste, ZIP paste from title, explicit clipboard button, compact composer, file picker');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
