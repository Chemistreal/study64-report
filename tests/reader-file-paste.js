'use strict';
// 여백 아래 채팅 입력창에 '파일을 복사해 붙여넣기': 아이폰은 복사한 파일을 확장자 없는 이름(image·파일)이나 빈 종류로 넘기기도 하고,
// 큰 글(100만 자 가까운 강의 모음)은 글자로 붙기도 한다. 어느 쪽이든 책으로 담기고, 파일 이름만 붙으면 본문에 넣지 않고 안내한다.
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
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof state!=='undefined'&&state.db);
  // 입력창에 붙여넣기 이벤트를 보낸다(files: [{name,type,text}] 또는 text)
  const paste=(payload,target='#composerText')=>page.evaluate(({payload,target})=>{
   const dt=new DataTransfer();
   for(const f of payload.files||[])dt.items.add(new File([f.text],f.name,{type:f.type}));
   if(payload.text!==undefined)dt.setData('text/plain',payload.text);
   const el=document.querySelector(target);el.focus();
   const ev=new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true});
   return !el.dispatchEvent(ev);
  },{payload,target});
  const titles=()=>page.evaluate(()=>state.books.map(b=>b.title));
  const back=()=>page.evaluate(()=>{if(state.book)backToLibrary()});
  // 1) 이름 없는(image) md 파일 → 첫 제목 줄이 책 제목
  assert.equal(await paste({files:[{name:'image',type:'text/markdown',text:'# 27강. 분할매수는 심리학입니다\n\n첫 문단입니다.\n\n## 도입\n\n둘째 문단.'}]}),true);
  await page.waitForFunction(()=>state.books.length===1,null,{timeout:10000});
  assert.deepEqual(await titles(),['27강. 분할매수는 심리학입니다']);await back();
  // 2) 종류도 이름도 없는 글 파일 → 내용을 보고 글로 담는다
  await paste({files:[{name:'파일',type:'',text:'제목 없는 메모의 첫 줄입니다.\n\n두 번째 문단입니다.'}]});
  await page.waitForFunction(()=>state.books.length===2,null,{timeout:10000});
  assert.ok((await titles()).some(t=>/제목 없는 메모의 첫 줄/.test(t)),'untyped text file is read by its content: '+await titles());await back();
  // 3) 이름이 있는 md 파일은 그 이름으로
  await paste({files:[{name:'bsw_lectures_27to85_combined.md',type:'',text:'# 묶음\n\n본문.'}]});
  await page.waitForFunction(()=>state.books.length===3,null,{timeout:10000});
  assert.ok((await titles()).includes('bsw_lectures_27to85_combined'));await back();
  // 4) 100만 자 가까운 글을 글자로 붙여넣기 → 입력칸에 넣지 않고 바로 책으로(글자 수 한도·느려짐 없이)
  const longText='# 27강. 긴 강의 모음\n\n'+Array.from({length:4200},(_,i)=>'## '+(i+1)+'번째 소제목\n\n'+'가나다라마바사아자차카타파하 '.repeat(15)).join('\n\n');
  assert.ok(longText.length>990000,'test text is about the size of the real lecture file: '+longText.length);
  assert.equal(await paste({text:longText}),true,'long paste is handled by the reader, not typed into the box');
  await page.waitForFunction(()=>state.books.length===4,null,{timeout:30000});
  const long=await page.evaluate(()=>{const b=state.books.find(x=>x.title==='27강. 긴 강의 모음');return {found:!!b,chars:b?b.blocks.reduce((n,x)=>n+x.text.length,0):0,box:$('#composerText').value.length,opened:state.book?.id===b?.id}});
  assert.equal(long.found,true);assert.ok(long.chars>900000,'the whole text is kept: '+long.chars);assert.equal(long.box,0,'the long text did not go into the input box');assert.equal(long.opened,true);
  await back();
  // 5) 파일 이름만 붙은 경우 → 본문에 넣지 않고 안내
  assert.equal(await paste({text:'bsw_lectures_27to85_combined.md'}),true);
  assert.equal(await page.evaluate(()=>$('#composerText').value),'','a bare file name is not pasted as the book text');
  assert.match(await page.locator('#composerFileStatus').textContent(),/파일 이름만 붙여넣어졌습니다/);
  assert.equal((await titles()).length,4);
  // 6) 보통 길이의 글은 지금처럼 입력칸으로(제목 칸에 붙여도 본문으로)
  await paste({text:'# 짧은 글\n\n입력칸으로 들어갑니다.'},'#composerTitle');
  assert.match(await page.evaluate(()=>$('#composerText').value),/입력칸으로 들어갑니다/);
  assert.deepEqual(errors,[]);
  console.log('여백 입력창 파일 붙여넣기: 이름 없는 md(제목 줄로) · 종류 없는 글 파일 · 이름 있는 md · 100만 자 글은 바로 책으로 · 파일 이름만 붙으면 안내 · 짧은 글은 입력칸 PASS');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
