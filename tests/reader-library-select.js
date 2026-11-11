'use strict';
// 여백 서재 '여러 권 선택': 카드를 눌러 여러 권을 고르거나 전체 선택해 한 번에 휴지통으로 옮긴다(복원 가능).
// 검색 중에는 보이는 책만 전체 선택된다. 선택을 끝내면 카드를 눌러 다시 책을 연다. 아이폰 폭에서도 막대가 화면 안에 들어간다.
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
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[],dialogs=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>{dialogs.push(d.message());d.accept()});
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof state!=='undefined'&&state.db);
  await page.evaluate(async()=>{for(const t of ['1강 가','2강 나','3강 다','4강 라','5강 마','6강 바','남길 책'])await addBook(t,'md',[{kind:'paragraph',text:t+' 본문입니다.'}])});
  const card=t=>page.locator('#bookGrid .book-card',{hasText:t});
  const count=()=>page.locator('#selectCount').textContent();
  // 선택 모드: 막대가 보이고, 카드를 누르면 책이 열리지 않고 선택된다
  assert.equal(await page.locator('#selectBar').isHidden(),true);
  await page.locator('#selectModeBtn').click();
  assert.equal(await page.locator('#selectBar').isVisible(),true);
  assert.equal(await page.locator('#selectModeBtn').textContent(),'선택 끝내기');
  await card('1강 가').click();await card('2강 나').locator('.book-title').click();await card('3강 다').locator('.book-open').click();
  assert.equal(await page.locator('#readerView').isHidden(),true,'tapping a card in select mode does not open the book');
  assert.equal(await count(),'3권 선택됨');
  await card('3강 다').click();assert.equal(await count(),'2권 선택됨','tapping again unselects');
  assert.equal(await card('1강 가').getAttribute('aria-checked'),'true');
  // 전체 선택 → 하나 빼면 '일부 선택' 상태
  await page.locator('#selectAll').check();assert.equal(await count(),'7권 선택됨');
  await card('남길 책').click();assert.equal(await count(),'6권 선택됨');
  assert.deepEqual(await page.evaluate(()=>({checked:$('#selectAll').checked,mixed:$('#selectAll').indeterminate})),{checked:false,mixed:true});
  // 아이폰 폭에서 막대가 화면 밖으로 밀리지 않는다
  const fit=await page.evaluate(()=>({right:$('#selectBar').getBoundingClientRect().right,width:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(fit.right<=fit.width+1&&fit.scroll<=fit.width+1,'select bar fits the phone: '+JSON.stringify(fit));
  // 휴지통으로 → 6권이 옮겨지고(확인창 한 번), 선택 모드가 끝난다
  await page.locator('#selectTrashBtn').click();
  await page.waitForFunction(()=>state.books.length===1);
  assert.equal(dialogs.length,1);assert.match(dialogs[0],/6권을 휴지통으로/);
  assert.deepEqual(await page.evaluate(()=>state.books.map(b=>b.title)),['남길 책']);
  assert.equal(await page.locator('#trashCount').textContent(),'6');
  assert.equal(await page.locator('#selectBar').isHidden(),true);
  assert.equal(await page.locator('#selectModeBtn').textContent(),'여러 권 선택');
  // 검색 중 전체 선택은 보이는 책만 고른다
  await page.evaluate(async()=>{for(const t of ['경제 하나','경제 둘','소설 하나'])await addBook(t,'md',[{kind:'paragraph',text:t+' 본문.'}])});
  await page.locator('#searchInput').fill('경제');await page.locator('#searchInput').dispatchEvent('input');
  await page.locator('#selectModeBtn').click();await page.locator('#selectAll').check();
  assert.equal(await count(),'2권 선택됨','select-all covers only the books shown by the search');
  await page.locator('#selectCancelBtn').click();
  assert.equal(await page.locator('#selectBar').isHidden(),true);
  // 선택을 끝내면 카드를 눌러 다시 책을 연다
  await page.locator('#searchInput').fill('');await page.locator('#searchInput').dispatchEvent('input');
  await card('남길 책').locator('.book-open').click();
  await page.locator('#readerTitle').getByText('남길 책').waitFor();
  assert.deepEqual(errors,[]);
  console.log('여백 서재 여러 권 선택: 카드 눌러 고르기 · 전체 선택/일부 해제 · 검색 중 보이는 책만 · 한 번에 휴지통(복원 가능) · 아이폰 폭 · 선택 끝내면 다시 열기 PASS');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
