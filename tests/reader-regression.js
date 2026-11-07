'use strict';
// Browser regression for 여백. Runs against a temporary HTTP server with no user data.
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
async function request(value){return await value}
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1200,height:850}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#bookCount')?.textContent==='0');
  const raw='# 테스트 원본 제목\n\n본문 특수 표식: 원문보존특수표식.  \n\n**서식**과  줄바꿈을 그대로 보관합니다.';
  await page.locator('#composerText').fill(raw);
  assert.equal(await page.locator('#composerTitle').inputValue(),'테스트 원본 제목');
  await page.locator('#composerSave').click();
  await page.locator('#readerTitle').getByText('테스트 원본 제목').waitFor();
  await page.evaluate(()=>{const el=document.querySelectorAll('.reader-block')[1];const sel=window.getSelection(),range=document.createRange();range.setStart(el.firstChild,0);range.setEnd(el.firstChild,Math.min(12,el.firstChild.textContent.length));sel.removeAllRanges();sel.addRange(range);document.dispatchEvent(new Event('selectionchange'))});
  page.once('dialog',d=>d.accept('강조 구절 메모'));
  await page.locator('#highlightBtn').click();
  await page.waitForFunction(()=>document.querySelectorAll('.reader-highlight').length===1);
  await page.locator('#settingsBtn').click();
  await page.locator('#focusMode').check();
  await page.waitForFunction(()=>document.documentElement.dataset.focusReading==='true');
  await page.locator('#skipSeconds').selectOption('30');
  await page.locator('#sleepTimerSelect').selectOption('5');
  await page.waitForFunction(()=>document.querySelector('#sleepTimerStatus')?.textContent.includes('종료까지'));
  await page.locator('#sleepTimerSelect').selectOption('0');
  await page.locator('#settingsDrawer .close-layer').click();
  await page.locator('#outlineBtn').click();
  page.once('dialog',d=>d.accept('별도 메모 내용'));
  await page.locator('#noteBtn').click();
  await page.waitForFunction(()=>document.querySelector('#highlightsList')?.textContent.includes('별도 메모 내용'));
  await page.locator('#outlineDrawer .close-layer').click();
  await page.locator('#bookmarkBtn').click();
  await page.waitForFunction(()=>document.querySelector('#bookmarkBtn')?.getAttribute('aria-pressed')==='true');
  assert.equal(await page.locator('#bookmarkBtn').getAttribute('aria-pressed'),'true');
  await page.locator('#backBtn').click();
  await page.locator('#searchInput').fill('원문보존특수표식');
  await page.waitForTimeout(250);
  assert.equal(await page.locator('.book-card').count(),1,'full-body search');
  await page.locator('.book-card .book-menu').click();
  await page.locator('#editBookTags').fill('화학, 독서');
  await page.locator('#saveBookInfoBtn').click();
  await page.locator('#searchInput').fill('화학');
  await page.waitForTimeout(250);
  assert.equal(await page.locator('.book-card').count(),1,'tag search');
  const saved=await page.evaluate(async()=>{
   const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('yeobaek-reader-v1');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
   const tx=db.transaction(['books','sources'],'readonly');
   const entries=await new Promise((resolve,reject)=>{const r=tx.objectStore('books').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
   const original=await new Promise((resolve,reject)=>{const r=tx.objectStore('sources').get(entries[0].id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
   const text=await original.blob.text();
   return {original:text,tags:entries[0].tags,bookmarks:entries[0].bookmarks}
  });
  assert.equal(saved.original,raw,'exact source preservation');
  const duplicateResult=await page.evaluate(async text=>{
    const originalConfirm=window.confirm;window.confirm=()=>false;
    try{await addBook('Duplicate', 'MD', blocksFromText(text,true));return 'duplicate added'}catch(e){return e.message}finally{window.confirm=originalConfirm}
  },raw);
  assert.match(duplicateResult,/이미 동일한 글/);
  const ocrResult=await page.evaluate(async()=>{
    const originalConfirm=window.confirm,originalTesseract=window.Tesseract;window.confirm=()=>true;
    let terminated=false;window.Tesseract={createWorker:async()=>({recognize:async()=>({data:{text:'스캔된 페이지에서 찾은 문장입니다.'}}),terminate:async()=>{terminated=true}})};
    try{
      const pdf={numPages:1,getPage:async()=>({getViewport:()=>({width:900,height:1100}),render:()=>({promise:Promise.resolve()}),cleanup:()=>{}})};
      const blocks=await parseScannedPdf(pdf,new File([new Uint8Array(100)],'scan.pdf'));
      return {recognized:blocks.some(x=>x.text.includes('스캔된 페이지')),terminated};
    }finally{window.confirm=originalConfirm;window.Tesseract=originalTesseract}
  });
  assert.equal(ocrResult.recognized,true);
  assert.equal(ocrResult.terminated,true);


  assert.deepEqual(saved.tags,['화학','독서']);
  assert.equal(saved.bookmarks.length,1);
  await page.locator('#searchInput').fill('');
  await page.waitForTimeout(250);
  await page.locator('.book-card .book-menu').click();
  page.once('dialog',d=>d.accept());
  await page.locator('#trashBookBtn').click();
  await page.waitForFunction(()=>document.querySelector('#bookCount')?.textContent==='0');
  await page.locator('#trashBtn').click();
  await page.locator('#trashList button').getByText('복원').click();
  await page.locator('.book-card').first().waitFor();
  await page.locator('.close-layer').first().evaluate(el=>el.click()).catch(()=>{});
  await page.locator('#composerText').fill('임시 저장할 두 번째 글입니다.');
  await page.waitForTimeout(1200);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#composerText')?.value==='임시 저장할 두 번째 글입니다.');
  const manifest=await page.evaluate(async()=>{const response=await fetch('./manifest.webmanifest');return response.json()});
  assert.equal(manifest.short_name,'여백');
  const passphrase='secure-demo-passphrase-123!';
  const answerPrompt=dialog=>dialog.accept(passphrase);
  page.on('dialog',answerPrompt);
  await page.locator('#guideButton').click();
  const downloadPromise=page.waitForEvent('download',{timeout:30000});
  await page.locator('#encryptedBackupBtn').click();
  const archive=await downloadPromise;
  page.off('dialog',answerPrompt);
  assert.match(archive.suggestedFilename(),/\.ybk$/);
  const bytes=await fs.readFile(await archive.path());
  assert.equal(bytes.subarray(0,8).toString(),'YEOBAEK1');
  const restoredContext=await browser.newContext();
  const restoredPage=await restoredContext.newPage();
  restoredPage.on('dialog',d=>d.accept(passphrase));
  await restoredPage.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await restoredPage.waitForFunction(()=>typeof state!=='undefined'&&!!state.db);
  await restoredPage.locator('#backupInput').setInputFiles({name:'test.ybk',mimeType:'application/octet-stream',buffer:bytes});
  try{await restoredPage.waitForFunction(()=>document.querySelector('#bookCount')?.textContent==='1',null,{timeout:30000})}catch(e){console.error('Restore diagnostics:',await restoredPage.evaluate(()=>({toast:document.querySelector('#toast')?.textContent,status:document.querySelector('#bookCount')?.textContent,dbReady:!!state.db})));throw e}
  await restoredPage.waitForFunction(async()=>{
    const db=state.db;if(!db)return false;
    const books=await new Promise(resolve=>{const req=db.transaction('books').objectStore('books').getAll();req.onsuccess=()=>resolve(req.result)});
    if(!books.length)return false;
    const source=await new Promise(resolve=>{const req=db.transaction('sources').objectStore('sources').get(books[0].id);req.onsuccess=()=>resolve(req.result)});
    return !!source?.blob;
  },null,{timeout:30000});
  const restoredSource=await restoredPage.evaluate(async()=>{
   const db=await new Promise((resolve,reject)=>{const req=indexedDB.open('yeobaek-reader-v1');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
   const book=await new Promise(resolve=>{const req=db.transaction('books').objectStore('books').getAll();req.onsuccess=()=>resolve(req.result[0])});
   const source=await new Promise(resolve=>{const req=db.transaction('sources').objectStore('sources').get(book.id);req.onsuccess=()=>resolve(req.result)});
   return {text:await source.blob.text(),bookmarks:book.bookmarks.length,highlights:(book.highlights||[]).length}
  });
  assert.equal(restoredSource.text,raw);
  assert.equal(restoredSource.bookmarks,1);
  assert.equal(restoredSource.highlights,1);
  await restoredContext.close();
  assert.equal(errors.length,0,'browser errors: '+errors.join(', '));
  console.log('PASS: OCR, deduplication, encrypted ZIP roundtrip, privacy and library recovery');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
