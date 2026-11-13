'use strict';
// 여백 '내가 담은 책도 현수 오디오로': 리더가 글(문단 그대로)을 오디오 저장소 inbox/ 에 보내고(GitHub 키),
// 저장소의 GitHub Actions가 만들면 목록에 생긴 같은 본문의 책을 받아 그 책에 붙인다. 실패하면 카드에 보여 준다.
// GitHub API는 가짜로 대신한다(키·요청 내용·권한 오류를 본다). 키는 설정·백업에 들어가지 않는다.
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs/promises'),fss=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
(async()=>{
 const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'yb-req-'));
 const E=await import(pathToFileURL(path.join(root,'reader/pc-tool/engine.mjs')).href);
 const P=await import(pathToFileURL(path.join(root,'reader/pc-tool/publish.mjs')).href);
 const site=path.join(tmp,'yeobaek-audio');P.writeShelf(site,{format:'yeobaek-audio-shelf',version:1,items:[]});
 const server=http.createServer(async(req,res)=>{
  const url=decodeURIComponent((req.url||'/').split('?')[0]);let filename;
  if(url.startsWith('/yeobaek-audio/'))filename=path.resolve(site,url.slice('/yeobaek-audio/'.length));
  else filename=path.resolve(root,url==='/'?'reader/index.html':'reader/'+url.replace(/^\//,''));
  try{const data=await fs.readFile(filename);res.setHeader('Content-Type',filename.endsWith('.js')?'text/javascript; charset=utf-8':filename.endsWith('.json')?'application/json':filename.endsWith('.mp3')?'audio/mpeg':'text/html; charset=utf-8');res.end(data)}catch(e){res.writeHead(404);res.end()}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port+'/';
 let browser;
 try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  // 가짜 GitHub: 키 확인 · inbox 파일 올리기 · 실패 표시(raw)
  const puts=[],inbox=new Map(),failed=new Map(),gitTrees=[];let keyOk=true,gitHead=1;
  await page.route('https://api.github.com/**',async route=>{
   const req=route.request(),u=new URL(req.url()),auth=req.headers()['authorization'];
   const json=(status,body)=>route.fulfill({status,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(body)});
   if(auth!=='Bearer github_pat_good'||!keyOk)return json(401,{message:'Bad credentials'});
   if(u.pathname==='/repos/Chemistreal/yeobaek-audio')return json(200,{full_name:'Chemistreal/yeobaek-audio'});
   const m=u.pathname.match(/^\/repos\/Chemistreal\/yeobaek-audio\/contents\/inbox\/(b-[0-9a-f]{12}(?:-hq)?)\.json$/);
   if(!m){
    const g=u.pathname.replace('/repos/Chemistreal/yeobaek-audio','');
    if(req.method()==='GET'&&g==='/contents/inbox')return json(200,[...inbox.keys()].map(id=>({name:id+'.json',sha:'sha-'+id+(failed.has(id)?'-failed':'')})));   // 폴더 목록(sha가 바뀐 요청만 받아 본다)
    if(req.method()==='GET'&&g==='/git/ref/heads/main')return json(200,{object:{sha:'c'+gitHead}});
    if(req.method()==='GET'&&g==='/git/commits/c'+gitHead)return json(200,{tree:{sha:'t'+gitHead}});
    if(req.method()==='GET'&&g==='/git/trees/t'+gitHead){const list=[];const walk=(d,pre)=>{for(const e of fss.readdirSync(d,{withFileTypes:true})){const p=pre+e.name;if(e.isDirectory())walk(path.join(d,e.name),p+'/');else list.push({path:p,type:'blob',sha:p==='index.json'?'idx':'x'})}};walk(site,'');return json(200,{tree:list})}
    if(req.method()==='GET'&&g==='/git/blobs/idx')return json(200,{content:fss.readFileSync(path.join(site,'index.json')).toString('base64').replace(/(.{60})/g,'$1\n'),encoding:'base64'});
    if(req.method()==='POST'&&g==='/git/trees'){const body=JSON.parse(req.postData());gitTrees.push(body);return json(201,{sha:'nt'+gitTrees.length})}
    if(req.method()==='POST'&&g==='/git/commits')return json(201,{sha:'nc'+gitTrees.length});
    if(req.method()==='PATCH'&&g==='/git/refs/heads/main'){   // 실제로 지운 것처럼 site 폴더에 반영
     const tree=gitTrees[gitTrees.length-1];for(const t of tree.tree){if(t.sha===null)fss.rmSync(path.join(site,t.path),{force:true});else if(t.path==='index.json')fss.writeFileSync(path.join(site,'index.json'),t.content)}gitHead++;return json(200,{})}
    return json(404,{});
   }
   if(req.method()==='GET')return inbox.has(m[1])?json(200,{sha:'sha-'+m[1]}):json(404,{message:'Not Found'});
   const body=JSON.parse(req.postData());puts.push({id:m[1],sha:body.sha||null,message:body.message,data:JSON.parse(Buffer.from(body.content,'base64').toString('utf8'))});inbox.set(m[1],true);
   return json(201,{content:{sha:'sha-'+m[1]}});
  });
  await page.route('https://raw.githubusercontent.com/**',route=>{const id=(route.request().url().match(/inbox\/(b-[0-9a-f]{12}(?:-hq)?)\.json/)||[])[1];return failed.has(id)?route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({error:failed.get(id)})}):route.fulfill({status:404,body:''})});
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof state!=='undefined'&&state.db);
  // 1) 키: 틀린 키는 거절, 맞는 키는 이 기기에만 저장(설정·백업에는 없음)
  await page.evaluate(()=>openLayer('#settingsDrawer'));
  await page.locator('#githubKeyInput').fill('github_pat_wrong');await page.locator('#githubKeySave').click();
  await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>githubKey),'','a rejected key is not saved');
  await page.locator('#githubKeyInput').fill('github_pat_good');await page.locator('#githubKeySave').click();
  await page.waitForFunction(()=>githubKey==='github_pat_good');
  assert.match(await page.locator('#githubKeyStatus').textContent(),/저장되어 있습니다/);
  assert.equal(await page.locator('#githubKeyInput').inputValue(),'','the key field is cleared after saving');
  const where=await page.evaluate(async()=>({meta:(await storeReq('meta','readonly',s=>s.get('githubAudioKey')))?.value,inSettings:JSON.stringify(state.settings).includes('github_pat'),inBackup:JSON.stringify(exportableSettings()).includes('github_pat')}));
  assert.deepEqual(where,{meta:'github_pat_good',inSettings:false,inBackup:false});
  await page.evaluate(()=>closeLayers());
  // 2) 책 관리 → 현수 오디오 만들기: 문단 그대로·같은 해시 이름으로 inbox에 올린다
  const blocks=[{kind:'heading',text:'요청 시험',level:1},{kind:'paragraph',text:'첫 문단입니다.'},{kind:'paragraph',text:'둘째 문단입니다.'}];
  const bookId=await page.evaluate(async blocks=>(await addBook('요청 시험','md',blocks)).id,blocks);
  await page.evaluate(()=>backToLibrary());
  await page.evaluate(id=>openBookActions(id),bookId);
  assert.equal(await page.locator('#requestAudioBtn').textContent(),'현수 오디오 만들기');
  // 아이폰 폭에서 책 관리 버튼들이 화면 밖으로 밀리지 않는다(예전: '현수 오디오 만들기'가 왼쪽으로 잘림)
  const fit=await page.evaluate(()=>[...document.querySelectorAll('#bookActionsModal .modal-actions button')].map(b=>{const r=b.getBoundingClientRect();return {t:b.textContent,left:Math.round(r.left),right:Math.round(r.right)}}));
  for(const b of fit)assert.ok(b.left>=0&&b.right<=390,'book action buttons fit the phone: '+JSON.stringify(fit));
  await page.locator('#requestAudioBtn').click();
  await page.waitForFunction(()=>Object.keys(audioRequests).length===1);
  const expected=E.bookFromBlocks('요청 시험',blocks);
  assert.equal(puts.length,1);const sent=puts[0];
  assert.equal(sent.id,P.bookId(expected.hash),'request is named by the same body hash the builder will compute');
  assert.equal(sent.data.format,'yeobaek-audio-request');assert.equal(sent.data.speed,1.5);assert.equal(sent.data.profile,'high','new Hyunsu audio is made in high quality');assert.deepEqual(sent.data.blocks.map(b=>[b.kind,b.text]),expected.blocks.map(b=>[b.kind,b.text]),'blocks are sent as stored');
  assert.equal(E.bookFromBlocks(sent.data.title,sent.data.blocks).hash,expected.hash,'the builder rebuilds the identical book');
  const badge=t=>page.locator('#bookGrid .book-card',{hasText:t}).locator('.book-audio');
  await page.waitForFunction(()=>[...document.querySelectorAll('#bookGrid .book-audio')].some(el=>!el.hidden&&/만드는 중/.test(el.textContent)));
  await page.evaluate(id=>openBookActions(id),bookId);
  assert.deepEqual(await page.evaluate(()=>({text:$('#requestAudioBtn').textContent,disabled:$('#requestAudioBtn').disabled})),{text:'완성됐는지 확인하고 받기',disabled:false});
  await page.evaluate(()=>closeLayers());
  // 3) Actions가 만들었다고 치고 목록에 올린다 → 확인하면 받아서 그 책에 붙는다(새 책을 만들지 않음)
  const mp3=path.join(tmp,'a.mp3'),bytes=Buffer.from(Array.from({length:2400},(_,i)=>(i*11+3)%251));fss.writeFileSync(mp3,bytes);
  const r={mp3,marks:expected.blocks.map((b,i)=>[i,i*2]),duration:6,bytes:bytes.length,speed:1.5,profile:'small'};
  E.writeSiteBundle(expected,r,path.join(site,'books',sent.id),{partBytes:1000});
  P.upsertShelf(site,{id:sent.id,title:expected.title,manifest:'books/'+sent.id+'/book.json',bytes:bytes.length,duration:6,source:'iphone'});
  P.upsertShelf(site,{id:'b-000000000000',title:'PC 추천 글',manifest:'books/b-000000000000/book.json',bytes:10,duration:1});   // PC가 올린 추천 글(지우면 안 됨)
  await page.evaluate(()=>checkAudioRequests());
  await page.waitForFunction(id=>state.audioIds.has(id),bookId,{timeout:10000});
  const attached=await page.evaluate(async id=>{const a=await storeReq('audio','readonly',s=>s.get(id));return {books:state.books.length,size:a.blob.size,timeline:a.timeline.length,pending:Object.keys(audioRequests).length}},bookId);
  assert.deepEqual(attached,{books:1,size:bytes.length,timeline:3,pending:0});
  // 받은 뒤: 아이폰 요청분은 서버에서 책 폴더 전체와 목록 항목을 기록 하나로 지운다. PC 추천 글은 남는다.
  await page.waitForFunction(()=>true);for(let i=0;i<50&&!gitTrees.length;i++)await new Promise(r=>setTimeout(r,100));
  assert.equal(gitTrees.length,1,'one commit removes the downloaded book from the server');
  const del=gitTrees[0].tree;
  assert.ok(del.filter(t=>t.sha===null).length>=4&&del.filter(t=>t.sha===null).every(t=>t.path.startsWith('books/'+sent.id+'/')),'every file of that book folder (parts, book.json, 원문) is removed: '+JSON.stringify(del.map(t=>t.path)));
  const left=P.readShelf(site).items.map(x=>x.id);
  assert.ok(!left.includes(sent.id)&&left.includes('b-000000000000'),'the shelf entry is gone, the PC shelf book stays: '+left);
  assert.ok(!fss.existsSync(path.join(site,'books',sent.id,'audio.001.mp3')));
  assert.match(await badge('요청 시험').textContent(),/오디오 준비됨/);
  // 3-2) 큰 책 받기가 멈춰도(아이폰이 앱을 화면 밖으로 보내면 받던 것을 멈춤) 작은 책은 먼저 붙고, 멈춘 받기는 버렸다가 다음 확인 때 다시 받는다
  const mk=async(title,size)=>{const blocks=[{kind:'paragraph',text:title+' 본문입니다.'}];const id=await page.evaluate(async({title,blocks})=>{const b=await addBook(title,'md',blocks);const sid=await shelfIdFor(b);audioRequests[b.id]={id:sid,title,requested:Date.now()};await saveAudioRequests();return {bookId:b.id,sid}},{title,blocks});
   const book=E.bookFromBlocks(title,blocks);const f=path.join(tmp,title+'.mp3');fss.writeFileSync(f,Buffer.alloc(size,9));
   E.writeSiteBundle(book,{mp3:f,marks:[[0,0]],duration:3,bytes:size,speed:1.5,profile:'small'},path.join(site,'books',id.sid),{partBytes:1000});
   P.upsertShelf(site,{id:id.sid,title,manifest:'books/'+id.sid+'/book.json',bytes:size,duration:3});return id};
  const huge=await mk('아주 큰 합본',2600);
  await page.evaluate(()=>{window.__ybAutoAudioMaxBytes=2048;audioPolling=false;return checkAudioRequests()});
  assert.equal(await page.evaluate(id=>state.audioIds.has(id),huge.bookId),false,'big audio is not downloaded on its own');
  const hugeBadge=page.locator('#bookGrid .book-card',{hasText:'아주 큰 합본'}).locator('.book-audio');
  await page.waitForFunction(()=>[...document.querySelectorAll('#bookGrid .book-audio')].some(el=>/현수 오디오 받기/.test(el.textContent)));
  assert.match(await hugeBadge.textContent(),/⬇ 현수 오디오 받기 · 1MB/);
  await hugeBadge.click();   // 카드의 받기 버튼
  await page.waitForFunction(id=>state.audioIds.has(id),huge.bookId,{timeout:10000});
  await page.waitForFunction(()=>[...document.querySelectorAll('#bookGrid .book-card')].some(c=>/아주 큰 합본/.test(c.textContent)&&/오디오 준비됨/.test(c.querySelector('.book-audio')?.textContent||'')),null,{timeout:5000});   // 카드 표시는 받기가 끝난 직후(finally)에 바뀐다
  await page.evaluate(()=>{delete window.__ybAutoAudioMaxBytes});
  const big=await mk('큰 묶음 책',5000),small=await mk('작은 강의',1200);
  const hang=new RegExp('/yeobaek-audio/books/'+big.sid+'/audio\\.\\d+\\.mp3');
  const hangMatch=u=>hang.test(u.pathname);
  await page.route(hangMatch,()=>{});   // 큰 책 조각은 끝없이 기다리게(멈춘 받기)
  await page.evaluate(()=>{window.__ybAudioPartTimeoutMs=1500;audioPolling=false;return checkAudioRequests()});
  const afterStall=await page.evaluate(({big,small})=>({small:state.audioIds.has(small.bookId),big:state.audioIds.has(big.bookId),bigPending:!!audioRequests[big.bookId],polling:audioPolling,badge:bookAudioBadge(big.bookId)?.text}),{big,small});
  assert.deepEqual(afterStall,{small:true,big:false,bigPending:true,polling:false,badge:'⬇ 현수 오디오 받기 · 1MB'},'small book attaches first, the stalled big one is dropped and kept for later: '+JSON.stringify(afterStall));
  await page.unroute(hangMatch);
  await page.evaluate(id=>openBookActions(id),big.bookId);
  assert.deepEqual(await page.evaluate(()=>({text:$('#requestAudioBtn').textContent,disabled:$('#requestAudioBtn').disabled})),{text:'현수 오디오 받기',disabled:false});
  await page.locator('#requestAudioBtn').click();   // 책 관리에서 바로 받기
  await page.waitForFunction(id=>state.audioIds.has(id),big.bookId,{timeout:10000});
  await page.evaluate(()=>{delete window.__ybAudioPartTimeoutMs});
  // 4) 실패하면 카드에 '실패'를 보여 주고, 책 관리 버튼은 '다시 보내기'(같은 이름 파일을 sha와 함께 덮어씀)
  const failId=await page.evaluate(async()=>(await addBook('실패 시험','md',[{kind:'paragraph',text:'실패할 글입니다.'}])).id);
  await page.evaluate(async id=>{await requestHyunsuAudio(state.books.find(b=>b.id===id))},failId);
  const failName=puts[puts.length-1].id;failed.set(failName,'오디오를 만들지 못했습니다: 시험');
  await page.evaluate(()=>checkAudioRequests());
  await page.waitForFunction(()=>[...document.querySelectorAll('#bookGrid .book-audio')].some(el=>!el.hidden&&/실패/.test(el.textContent)));
  await page.evaluate(id=>openBookActions(id),failId);
  assert.equal(await page.locator('#requestAudioBtn').textContent(),'현수 오디오 다시 보내기');
  const resendFrom=puts.length;await page.locator('#requestAudioBtn').click();
  await page.waitForFunction(()=>Object.values(audioRequests).some(r=>r.title==='실패 시험'&&!r.error));
  assert.equal(puts.length,resendFrom+1);assert.equal(puts[puts.length-1].sha,'sha-'+failName,'resending updates the existing request file');
  // 5) 여러 권 선택 → 현수 오디오: 오디오 없는 책만 보낸다
  await page.evaluate(async()=>{for(const t of ['묶음 하나','묶음 둘'])await addBook(t,'md',[{kind:'paragraph',text:t+' 본문입니다.'}])});
  const before=puts.length;
  await page.locator('#selectModeBtn').click();await page.locator('#selectAll').check();
  await page.locator('#selectAudioBtn').click();
  await page.waitForFunction(n=>Object.keys(audioRequests).length>=3,null,{timeout:10000});
  await page.waitForFunction(()=>Object.values(audioRequests).filter(r=>/^묶음/.test(r.title)).length===2,null,{timeout:10000});
  assert.equal(puts.length-before,2,'only the two new books are sent: the one with audio and the one already being made are skipped');
  // 6) 자동 만들기를 켜면 새로 담는 책을 알아서 보낸다
  await page.evaluate(()=>openLayer('#settingsDrawer'));await page.locator('#autoAudioToggle').check();await page.evaluate(()=>closeLayers());
  const n0=puts.length;
  await page.evaluate(async()=>{await addBook('자동 시험','md',[{kind:'paragraph',text:'자동으로 보낼 글입니다.'}])});
  await page.waitForFunction(()=>Object.values(audioRequests).some(r=>r.title==='자동 시험'),null,{timeout:10000});
  assert.equal(puts.length,n0+1);
  // 7) 키가 만료되면 알려 준다
  keyOk=false;const res=await page.evaluate(async()=>{const b=await addBook('만료 시험','md',[{kind:'paragraph',text:'만료된 키.'}]);return requestHyunsuAudio(b)});
  assert.equal(res,false);
  // 8) 설정 → '현수 오디오 모두 고음질로 바꾸기': 고음질이 아닌 현수 오디오만 -hq 이름으로 다시 보내고, 완성되면 같은 책에 바꿔 끼운다
  keyOk=true;
  await page.evaluate(()=>openLayer('#settingsDrawer'));await page.evaluate(()=>refreshUpgradeAudioUI());
  await page.waitForFunction(()=>/고음질로 바꿀 수 있는 책 4권/.test($('#upgradeAudioStatus').textContent));
  const hqFrom=puts.length;
  await page.locator('#upgradeAudioBtn').click();
  await page.waitForFunction(()=>Object.values(audioRequests).filter(r=>r.upgrade).length===4,null,{timeout:10000});
  const hqPuts=puts.slice(hqFrom);
  assert.equal(hqPuts.length,4,'only the four Hyunsu audio books are sent again');
  assert.ok(hqPuts.every(x=>/^b-[0-9a-f]{12}-hq$/.test(x.id)&&x.data.profile==='high'),'upgrade requests use their own -hq name and ask for high quality: '+JSON.stringify(hqPuts.map(x=>[x.id,x.data.profile])));
  assert.match(await page.locator('#upgradeAudioStatus').textContent(),/바꿀 현수 오디오가 없습니다.*4권을 고음질로 바꾸는 중/);
  assert.equal(await page.locator('#upgradeAudioBtn').isDisabled(),true);
  // 아주 긴 합본은 아이폰에 담을 수 있는 크기 안에서 가장 좋은 음질로(통찰력 56만 자 → 고음질, 설명회학 68만 자 → 32kbps, 주식 99만 자 → 24kbps)
  assert.deepEqual(await page.evaluate(()=>[560000,683000,989000,3000000].map(n=>hyunsuProfileFor({blocks:[{text:'가'.repeat(n)}]}))),['high','clear','normal','small']);
  // 이 기기의 요청 기록이 사라져도(앱 다시 열기) 서버 inbox에 남은 -hq 요청을 보고 다시 잇는다
  await page.evaluate(async()=>{audioRequests={};await saveAudioRequests()});
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof state!=='undefined'&&state.db&&state.books.length);
  await page.waitForFunction(()=>Object.values(audioRequests).filter(r=>r.upgrade&&/-hq$/.test(r.id)).length===4,null,{timeout:10000});
  await page.evaluate(()=>closeLayers());
  assert.match(await badge('요청 시험').textContent(),/오디오 준비됨 · 고음질 만드는 중/);
  // 지금 오디오는 그대로 둔다(고음질이 오기 전까지 계속 듣는다)
  assert.equal(await page.evaluate(id=>state.audioIds.has(id),bookId),true);
  const hqId=sent.id+'-hq',hqBytes=Buffer.from(Array.from({length:3600},(_,i)=>(i*7+5)%251)),hqMp3=path.join(tmp,'hq.mp3');fss.writeFileSync(hqMp3,hqBytes);
  E.writeSiteBundle(expected,{mp3:hqMp3,marks:expected.blocks.map((b,i)=>[i,i*2]),duration:6,bytes:hqBytes.length,speed:1.5,profile:'high'},path.join(site,'books',hqId),{partBytes:1000});
  P.upsertShelf(site,{id:hqId,title:expected.title,manifest:'books/'+hqId+'/book.json',bytes:hqBytes.length,duration:6,speed:1.5,profile:'high',source:'iphone'});
  const trees0=gitTrees.length;
  await page.evaluate(()=>{audioPolling=false;return checkAudioRequests()});
  await page.waitForFunction(id=>!audioRequests[id],bookId,{timeout:10000});
  const swapped=await page.evaluate(async id=>{const a=await storeReq('audio','readonly',s=>s.get(id));return {books:state.books.length,size:a.blob.size,profile:a.profile,voice:a.aiVoice,left:Object.values(audioRequests).filter(r=>r.upgrade).length}},bookId);
  assert.deepEqual(swapped,{books:await page.evaluate(()=>state.books.length),size:hqBytes.length,profile:'high',voice:'Hyunsu',left:3},'the high-quality audio replaces the old one on the same book');
  for(let i=0;i<50&&gitTrees.length===trees0;i++)await new Promise(r=>setTimeout(r,100));
  assert.ok(gitTrees.length>trees0&&gitTrees[gitTrees.length-1].tree.filter(t=>t.sha===null).every(t=>t.path.startsWith('books/'+hqId+'/')),'the downloaded -hq copy is removed from the server');
  await page.waitForFunction(()=>[...document.querySelectorAll('#bookGrid .book-card')].some(c=>/요청 시험/.test(c.textContent)&&/^오디오 준비됨 · 고음질 · 바로 듣기$/.test(c.querySelector('.book-audio')?.textContent||'')),null,{timeout:5000});
  await page.evaluate(()=>refreshUpgradeAudioUI());
  assert.match(await page.locator('#upgradeAudioStatus').textContent(),/3권을 고음질로 바꾸는 중/);
  assert.deepEqual(errors,[]);
  console.log('여백 현수 오디오 요청: 키 저장(설정·백업 제외) · 책 관리에서 요청 · 같은 해시 · 만드는 중 표시 · 완성되면 자동으로 붙음 · 받은 뒤 서버에서 지움(추천 글은 남김) · 큰 것은 카드 받기 버튼 · 작은 것부터·멈춘 받기 다시·책 관리에서 바로 받기 · 실패 표시와 다시 보내기 · 여러 권 · 자동 만들기 · 만료된 키 · 모두 고음질로 바꾸기(-hq 요청·바꿔 끼우기·서버에서 지움) PASS');
 }finally{if(browser)await browser.close();server.close();await fs.rm(tmp,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exit(1)});
