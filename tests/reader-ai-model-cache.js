'use strict';
// 여백 기기 내 AI 모델 영구 보관 회귀: 약 380MB 모델은 기기에 한 번만 받아야 한다.
// 예전에는 브라우저 HTTP 캐시에만 기대어, 큰 파일이 밀려나면 재생할 때마다 다시 받았다.
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
const SIZES={duration_predictor:3000,text_encoder:5000,vector_estimator:70000,vocoder:9000};
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({serviceWorkers:'block'});
  const hits=[];
  await context.route('https://huggingface.co/**',route=>{
   const url=route.request().url();hits.push(url.split('/').pop());
   const headers={'access-control-allow-origin':'*'};
   const name=url.split('/').pop().replace('.onnx','');
   if(SIZES[name])return route.fulfill({status:200,headers:{...headers,'content-type':'application/octet-stream'},body:Buffer.alloc(SIZES[name],7)});
   if(url.endsWith('tts.json'))return route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify({ae:{sample_rate:44100}})});
   if(url.includes('/voice_styles/'))return route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify({style_ttl:{dims:[1,1,1],data:[[[0]]]},style_dp:{dims:[1,1,1],data:[[[0]]]}})});
   if(url.endsWith('unicode_indexer.json'))return route.fulfill({status:200,headers,contentType:'application/json',body:'[]'});
   return route.fulfill({status:404,headers,body:''});
  });
  await context.addInitScript(()=>{
   window.__created=[];
   window.ort={env:{wasm:{}},Tensor:class{},InferenceSession:{create:async src=>{window.__created.push(src instanceof Uint8Array?src.length:typeof src);return {}}}};
   window.lamejs={Mp3Encoder:class{encodeBuffer(){return new Int8Array(40)}flush(){return new Int8Array(600)}}};
  });
  const errors=[];
  const openBook=async page=>{
   await page.locator('#composerText').fill('# 저장 시험\n\n첫 문장입니다.');
   await page.locator('#composerSave').click();
   await page.locator('#readerTitle').getByText('저장 시험').waitFor();
  };
  const load=async()=>{
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>typeof state!=='undefined'&&state.db);
   const messages=await page.evaluate(async()=>{const mod=await import('./ai-auto.js');const msgs=[];const engine=await mod.loadLocalAI(m=>msgs.push(m));return {msgs,rate:engine.sampleRate,created:window.__created}});
   return {page,...messages};
  };
  const first=await load();
  assert.deepEqual(first.created,[3000,5000,70000,9000],'모델은 받은 바이트로 엔진을 만든다');
  assert.equal(first.rate,44100);
  assert.ok(first.msgs.some(m=>m.includes('처음 한 번만')),'처음에는 다운로드 안내: '+first.msgs.join(' / '));
  assert.ok(first.msgs.some(m=>/AI 모델 받는 중: vector_estimator/.test(m)),'다운로드 진행률 표시');
  assert.equal(hits.filter(h=>h.endsWith('.onnx')).length,4,'처음에는 모델 4개를 받는다');
  await openBook(first.page);
  await first.page.click('#settingsBtn');
  await first.page.waitForFunction(()=>/기기에 저장되어 있습니다/.test(document.querySelector('#aiModelStatus').textContent));
  assert.equal(await first.page.isVisible('#aiModelClearBtn'),true,'지우기 버튼이 보인다');
  await first.page.close();

  hits.length=0;
  const second=await load();
  assert.equal(hits.length,0,'두 번째 실행에서는 네트워크로 모델을 다시 받지 않는다: '+hits.join(','));
  assert.deepEqual(second.created,[3000,5000,70000,9000],'저장된 모델로 엔진을 만든다');
  assert.ok(second.msgs.some(m=>m.includes('기기에 저장된 AI 모델')),'저장된 모델 안내');

  // 만든 AI 오디오에 문단별 시각이 붙는다(문단 0은 0초, 다음 문단은 앞 문장 길이 + 쉼 뒤).
  const marks=await second.page.evaluate(async()=>{
   const mod=await import('./ai-auto.js');const engine=await mod.loadLocalAI();
   engine.call=async text=>({wav:new Float32Array(text.length*1000)});
   const out=await mod.generateAIBackgroundAudio({blocks:[{text:'가나다.',source:4},{text:'라마바사.',source:4},{text:'아자차카타.',source:6}]},{voiceId:'F1'});
   return {marks:out.marks,duration:out.duration};
  });
  assert.deepEqual(marks.marks.map(m=>m[0]),[4,6],'one mark per source paragraph');
  assert.equal(marks.marks[0][1],0);
  assert.ok(Math.abs(marks.marks[1][1]-(4000+5000+2*Math.floor(44100*.22))/44100)<0.002,'second paragraph starts after the first two sentences and pauses: '+marks.marks[1][1]);
  second.page.on('dialog',d=>d.accept());
  await openBook(second.page);
  await second.page.click('#voiceShortcut');
  await second.page.waitForSelector('#aiModelClearBtn:not([hidden])');
  await second.page.click('#aiModelClearBtn');
  await second.page.waitForFunction(()=>/아직 기기에 없습니다/.test(document.querySelector('#aiModelStatus').textContent));
  assert.equal(await second.page.evaluate(()=>caches.has('yeobaek-ai-model-v1')),false,'지우면 저장소가 사라진다');
  assert.deepEqual(errors,[]);
  console.log('AI 모델 영구 보관 검사 통과');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
