'use strict';
// 여백 원문+오디오 ZIP: PC 여백 작업실이 만든 ZIP(yeobaek-ai-audio.json · audio/0.mp3 · 원문/)을 아이폰에서 + 버튼으로 가져오면
// 같은 글에는 오디오와 문단 시간표가 붙고, 없는 글은 함께 만들어진다(중복 책을 만들지 않는다). 다른 TTS로 만든 글+MP3 세트 ZIP도 붙는다.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const {pathToFileURL}=require('node:url');
const server=http.createServer(async(req,res)=>{
 const url=(req.url||'/').split('?')[0];
 const file=url==='/'?'reader/index.html':'reader/'+decodeURIComponent(url).replace(/^\//,'');
 const filename=path.resolve(root,file);
 if(!filename.startsWith(path.join(root,'reader')+path.sep)){res.writeHead(404);res.end();return}
 try{const bytes=await fs.readFile(filename);res.setHeader('Content-Type',filename.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8');res.end(bytes)}catch(e){res.writeHead(404);res.end()}
});
const BODY=['첫 문단입니다. 꾸러미 시험.','둘째 문단입니다.','셋째 문단입니다.'];
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port+'/';
 let browser;const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'yb-pack-'));
 try{
  browser=await chromium.launch({headless:true});
  // 1) PC 여백 작업실: 책 두 권의 원문+오디오 ZIP을 만든다(실제 작업실과 같은 함수).
  const E=await import(pathToFileURL(path.join(root,'reader/pc-tool/engine.mjs')).href);
  const errors=[],packs=[];
  for(const [title,body,size,marks] of [['꾸러미 시험',BODY,4000,[[0,0],[1,1.5],[2,3]]],['새로 갈 책',['받는 기기에는 없는 글입니다.'],3000,[[0,0]]]]){
   const book=E.bookFromFile(title+'.md',Buffer.from(body.join('\n\n')));
   const mp3=path.join(tmp,title+'.mp3');await fs.writeFile(mp3,Buffer.alloc(size,7));
   const file=path.join(tmp,title+'.zip');await E.writeBookZip(book,{mp3,marks,duration:4.5,bytes:size,speed:1.5,profile:'small'},file);packs.push(file);
  }
  // 2) 아이폰: 같은 글 한 권만 있다 → 가져오기
  const phone=await (await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true})).newPage();
  phone.on('pageerror',e=>errors.push(e.message));
  await phone.goto(origin,{waitUntil:'domcontentloaded'});
  await phone.waitForFunction(()=>typeof state!=='undefined'&&state.db);
  await phone.evaluate(async body=>{await addBook('꾸러미 시험','md',body.map(text=>({kind:'paragraph',text})));backToLibrary()},BODY);
  await phone.locator('#composerFileInput').setInputFiles(packs);
  await phone.waitForFunction(()=>state.books.length===2&&state.audioIds.size===2,null,{timeout:15000});
  const got=await phone.evaluate(async()=>{const all=await storeReq('audio','readonly',s=>s.getAll());return {titles:state.books.map(b=>b.title).sort(),audio:all.map(r=>({title:state.books.find(b=>b.id===r.id)?.title,voice:r.aiVoice,size:r.blob.size,timeline:r.timeline||null})).sort((a,b)=>a.title.localeCompare(b.title))}});
  assert.deepEqual(got.titles,['새로 갈 책','꾸러미 시험'].sort(),'the matching book is reused, the missing one is created: '+JSON.stringify(got.titles));
  assert.deepEqual(got.audio.find(a=>a.title==='꾸러미 시험'),{title:'꾸러미 시험',voice:'Hyunsu',size:4000,timeline:[[0,0],[1,1.5],[2,3]]},'audio and paragraph timeline arrive with the book');
  assert.equal(got.audio.find(a=>a.title==='새로 갈 책').size,3000);
  // 카드에 '오디오 준비됨'이 보인다.
  await phone.waitForFunction(()=>[...document.querySelectorAll('#bookGrid .book-audio')].filter(el=>!el.hidden&&/오디오 준비됨/.test(el.textContent)).length===2);
  // 3) 다른 TTS 프로그램 결과: 글과 이름이 같은 MP3를 한 ZIP에 → 글을 담고 오디오를 붙인다(이미 있는 같은 글은 재사용).
  const pairs=await phone.evaluate(async()=>{
   const JSZip=await zipLib(),zip=new JSZip();
   const mp3=n=>{const a=new Uint8Array(n);a.set([0xFF,0xF3,0x48,0xC4]);return a};
   zip.file('세트/01-첫 강의.md','# 첫 강의\n\n세트로 올린 글입니다.');zip.file('세트/01-첫 강의.mp3',mp3(5000));
   zip.file('세트/02-둘째.txt','오디오 없는 글입니다.');
   await addBook('01-첫 강의','md',blocksFromText('# 첫 강의\n\n세트로 올린 글입니다.',true));
   const before=state.books.length;
   const n=await importFiles([new File([await zip.generateAsync({type:'uint8array'})],'세트.zip',{type:'application/zip'})]);
   const all=await storeReq('audio','readonly',s=>s.getAll());const first=state.books.filter(b=>b.title==='01-첫 강의');
   return {n,added:state.books.length-before,firstCount:first.length,firstAudio:all.some(a=>a.id===first[0].id&&a.blob.size===5000&&a.blob.type==='audio/mpeg'),second:!!state.books.find(b=>b.title==='02-둘째')}
  });
  assert.deepEqual(pairs,{n:2,added:1,firstCount:1,firstAudio:true,second:true},'text+audio set ZIP: '+JSON.stringify(pairs));
  assert.deepEqual(errors,[]);
  console.log('여백 원문+오디오 ZIP: PC 작업실 ZIP → 아이폰 + 로 가져오기 (같은 글 재사용 · 없는 글 생성 · 문단 시간표 유지) · 글+MP3 세트 ZIP PASS');
 }finally{if(browser)await browser.close();server.close();await fs.rm(tmp,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exit(1)});
