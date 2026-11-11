'use strict';
// 여백 '현재 책 AI 오디오' 버튼: 누르면 단계(모델 받기 → 불러오기 → 구간별 만들기)를 보여 주며 자동으로 만들고,
// 진행 중에는 버튼이 '일시정지', 멈추면 '이어서 만들기(n/m 구간 완료)', 다 되면 '바로 듣기'가 된다.
// 예전에는 버튼 글자가 그대로라 진행 중에 누르면 말없이 일시정지되어 '작동 안 함'처럼 보였다.
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
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[],dialogs=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('dialog',d=>{dialogs.push(d.type());d.accept()});
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof state!=='undefined'&&state.db);
  await page.evaluate(async()=>{
   state.settings.aiAuto=false;await saveSettings();
   window.__parts=0;window.__gate=null;
   window.aiModule=async()=>({warmUp:async()=>true,generateAIBackgroundAudio:async(book,{onProgress,signal})=>{
    onProgress?.({stage:'loading',message:'AI 모델 받는 중 120/약 380MB · 나갔다 와도 받은 데서 이어 받습니다'});
    await new Promise(r=>setTimeout(r,120));
    onProgress?.({stage:'synthesizing',done:0,total:1});
    if(window.__gate)await window.__gate;
    await new Promise(r=>setTimeout(r,120));
    if(signal?.aborted)throw new DOMException('x','AbortError');
    window.__parts++;
    return {blob:new Blob([new Uint8Array(900)],{type:'audio/mpeg'}),marks:[[book.blocks[0].source??0,0]],duration:1};
   }});
   const para='가나다라마바사 아자차카타파하 문장을 길게 이어 씁니다. '.repeat(20);
   const book=await addBook('버튼 시험','md',[0,1,2,3,4].map(()=>({kind:'paragraph',text:para})));
   openBook(book.id);
  });
  await page.waitForFunction(()=>!document.querySelector('#playBtn').disabled);
  await page.locator('#settingsBtn').click();
  const button=page.locator('#aiConvertBtn'),status=page.locator('#aiConvertStatus');
  assert.equal(await button.textContent(),'AI 오디오 만들기 시작');
  assert.equal(await page.locator('#aiModelClearBtn').isVisible(),false,'hidden buttons stay hidden');
  // 시작: 모델 다운로드 허용 확인 1번 → 단계 안내 → 버튼은 '일시정지'
  await page.evaluate(()=>{let open;window.__gate=new Promise(r=>open=r);window.__open=open});
  await button.click();
  await page.waitForFunction(()=>/1\/3단계/.test(document.querySelector('#aiConvertStatus').textContent));
  assert.equal(await button.textContent(),'일시정지','while making, the button says it will pause');
  assert.deepEqual(dialogs,['confirm'],'model download is confirmed once');
  await page.waitForFunction(()=>/3\/3단계 · 음성 만들기 0\/\d+구간/.test(document.querySelector('#aiConvertStatus').textContent));
  await page.evaluate(()=>window.__open());
  await page.evaluate(()=>{window.__gate=null});
  await page.waitForFunction(()=>window.__parts>=2);
  // 일시정지 → '이어서 만들기(n/m 구간 완료)'
  await button.click();
  await page.waitForFunction(()=>/^이어서 만들기 \(\d+\/\d+구간 완료\)$/.test(document.querySelector('#aiConvertBtn').textContent));
  assert.match(await status.textContent(),/일시정지됨 · \d+\/\d+구간 저장됨/);
  const madeBefore=await page.evaluate(()=>window.__parts);
  // 이어서: 저장된 구간은 다시 만들지 않고 나머지만 만든다 → 완료되면 '바로 듣기'
  await button.click();
  await page.waitForFunction(()=>document.querySelector('#aiConvertBtn').textContent==='AI 오디오 준비됨 · 바로 듣기',null,{timeout:20000});
  const total=await page.evaluate(()=>state.localAiQueue.find(j=>j.bookId===state.book.id).total);
  assert.equal(await page.evaluate(()=>window.__parts),total,'each part is made exactly once across the pause ('+madeBefore+' before pause)');
  assert.match(await status.textContent(),/^완료/);
  // 지난번 멈춤 표시가 있어도 버튼을 누르면 다시 시도한다.
  const other=await page.evaluate(async()=>{closeLayers();const b=await addBook('두 번째','md',[{kind:'paragraph',text:'짧은 글입니다.'}]);openBook(b.id);state.aiLoadCrashed=true;return b.id});
  await page.waitForFunction(()=>!document.querySelector('#playBtn').disabled);
  await page.locator('#settingsBtn').click();
  await button.click();
  await page.waitForFunction(()=>document.querySelector('#aiConvertBtn').textContent==='AI 오디오 준비됨 · 바로 듣기',null,{timeout:20000});
  assert.equal(await page.evaluate(()=>state.aiLoadCrashed),false);
  assert.ok(other);
  assert.deepEqual(errors,[]);
  console.log('여백 현재 책 AI 오디오 버튼: 단계 안내 · 일시정지/이어서 만들기 · 완료 후 바로 듣기 PASS');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
