'use strict';
// Browser regression for 여백. Runs against a temporary HTTP server with no user data.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer(async(req,res)=>{
 const url=(req.url||'/').split('?')[0];
 const file=url==='/'?'reader/index.html':decodeURIComponent(url).replace(/^\//,'');
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
  await page.locator('#bookmarkBtn').click();
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
   const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('yeobaek-reader-v1',4);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
   const tx=db.transaction(['books','sources'],'readonly');
   const entries=await new Promise((resolve,reject)=>{const r=tx.objectStore('books').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
   const original=await new Promise((resolve,reject)=>{const r=tx.objectStore('sources').get(entries[0].id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
   const text=await original.blob.text();
   return {original:text,tags:entries[0].tags,bookmarks:entries[0].bookmarks}
  });
  assert.equal(saved.original,raw,'exact source preservation');
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
  assert.equal(errors.length,0,'browser errors: '+errors.join(', '));
  console.log('PASS: original bytes, full-text/tag search, bookmarks, trash restore, draft reload');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
