'use strict';
// 여백 AI 오디오 압축 회귀: 용량 단계(작게·보통·좋게)마다 실제 lamejs로 만든 MP3에 소리가 들어 있어야 한다.
// 예전 44.1kHz·48kbps 설정은 lamejs 내부 표본율 변환 버그로 거의 무음 MP3를 만들었다 — 그런 파일은 찾아서 다시 만든다.
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
  const context=await browser.newContext({serviceWorkers:'block'});
  await context.route('https://huggingface.co/**',route=>{const url=route.request().url();const headers={'access-control-allow-origin':'*','access-control-expose-headers':'*'};
   if(url.endsWith('.onnx'))return route.fulfill({status:200,headers:{...headers,'content-type':'application/octet-stream'},body:Buffer.alloc(2048,1)});
   if(url.endsWith('tts.json'))return route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify({ae:{sample_rate:44100}})});
   if(url.includes('/voice_styles/'))return route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify({style_ttl:{dims:[1,1,1],data:[[[0]]]},style_dp:{dims:[1,1,1],data:[[[0]]]}})});
   if(url.endsWith('unicode_indexer.json'))return route.fulfill({status:200,headers,contentType:'application/json',body:'[]'});
   return route.fulfill({status:404,headers,body:''})});
  await context.addInitScript(()=>{window.ort={env:{wasm:{}},Tensor:class{},InferenceSession:{create:async()=>({})}}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof state!=='undefined'&&state.db);
  await page.addScriptTag({url:'./vendor/lame.min.js'});
  const result=await page.evaluate(async()=>{
   const mod=await import('./ai-auto.js');const engine=await mod.loadLocalAI();
   // 말소리 대신 220Hz+1300Hz 소리: 글자당 0.05초
   engine.call=async text=>{const n=Math.round(text.length*.05*44100),wav=new Float32Array(n);for(let i=0;i<n;i++)wav[i]=.3*(.6*Math.sin(2*Math.PI*220*i/44100)+.4*Math.sin(2*Math.PI*1300*i/44100));return {wav}};
   const blocks=[{text:'첫째 문단입니다. '.repeat(8)},{text:'둘째 문단입니다. '.repeat(8)}];const out={};
   for(const audio of ['small','normal','high']){
    const r=await mod.generateAIBackgroundAudio({blocks},{voiceId:'F1',audio});
    const decoded=await new OfflineAudioContext(1,1,44100).decodeAudioData(await r.blob.arrayBuffer());
    const d=decoded.getChannelData(0),from=Math.floor(d.length*.1),to=Math.floor(d.length*.4);let sum=0;for(let i=from;i<to;i++)sum+=d[i]*d[i];
    out[audio]={bytes:r.blob.size,duration:r.duration,decoded:decoded.duration,rms:Math.sqrt(sum/(to-from)),mbPerHour:r.blob.size/r.duration*3600/1048576}
   }
   return out;
  });
  for(const [name,r] of Object.entries(result)){
   assert.ok(r.rms>.1,name+' MP3 must contain sound (rms '+r.rms.toFixed(3)+')');
   assert.ok(Math.abs(r.decoded-r.duration)<.25,name+' decoded length matches: '+r.decoded+' vs '+r.duration);
  }
  assert.ok(result.small.bytes<result.normal.bytes&&result.normal.bytes<result.high.bytes,'smaller settings make smaller files');
  assert.ok(result.small.mbPerHour<8&&result.normal.mbPerHour<12&&result.high.mbPerHour<23,'size per hour: '+JSON.stringify(Object.fromEntries(Object.entries(result).map(([k,v])=>[k,+v.mbPerHour.toFixed(1)]))));
  // 예전 설정(44.1kHz·48kbps, MPEG-1 머리 FF FB 38)으로 만든 AI 오디오는 찾아 지우고 다시 만들도록 대기열에 넣는다.
  const repaired=await page.evaluate(async()=>{
   state.settings.aiAuto=false;
   const old=await addBook('예전 무음 오디오','md',[{kind:'paragraph',text:'다시 만들어야 할 글입니다.'}]);
   const ok=await addBook('정상 오디오','md',[{kind:'paragraph',text:'그대로 둘 글입니다.'}]);
   const head=b=>{const a=new Uint8Array(2000);a.set(b);return new Blob([a],{type:'audio/mpeg'})};
   await storeReq('audio','readwrite',s=>s.put({id:old.id,blob:head([0xFF,0xFB,0x38,0xC4]),aiVoice:'F1'}));
   await storeReq('audio','readwrite',s=>s.put({id:ok.id,blob:head([0xFF,0xF3,0x48,0xC4]),aiVoice:'F1'}));
   const fixed=await repairSilentAiAudio();
   return {fixed,oldAudio:!!(await storeReq('audio','readonly',s=>s.get(old.id))),okAudio:!!(await storeReq('audio','readonly',s=>s.get(ok.id))),queued:state.localAiQueue.find(j=>j.bookId===old.id)?.status}
  });
  assert.deepEqual(repaired,{fixed:1,oldAudio:false,okAudio:true,queued:'queued'});
  assert.deepEqual(errors,[]);
  console.log('여백 AI 오디오 압축: 작게 '+result.small.mbPerHour.toFixed(1)+' · 보통 '+result.normal.mbPerHour.toFixed(1)+' · 좋게 '+result.high.mbPerHour.toFixed(1)+' MB/시간, 모두 소리 있음 · 예전 무음 파일 다시 만들기 PASS');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
