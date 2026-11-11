'use strict';
// 여백 '읽어주기' 회귀: 처음 온 사람이 재생을 누르면 **바로 들려야** 한다.
// 예전에는 재생·저장 때마다 AI 모델 380MB 다운로드 확인창이 떴고, 거절하면 아무것도 읽지 않았다.
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
  const page=await browser.newPage({viewport:{width:1100,height:820}});
  const errors=[],dialogs=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('dialog',d=>{dialogs.push(d.message());d.dismiss()});
  // Fake speech engine: records each utterance and the sentence highlighted while it plays.
  await page.addInitScript(()=>{
   window.__spoken=[];window.__marked=[];
   speechSynthesis.speak=u=>{window.__spoken.push(u.text);setTimeout(()=>{const h=window.CSS?.highlights?.get('yb-speaking');const r=h?[...h][0]:null;window.__marked.push(r?r.toString():null);u.onend&&u.onend()},20)};
  });
  await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>state.db&&document.querySelector('#bookCount'));
  const long='가나다라 마바사 아자차 카타파하 '.repeat(20).trim()+'.';
  const same='같은 말을 되풀이하는 긴 문장입니다 '.repeat(6).trim()+'.';
  await page.locator('#composerText').fill('# 듣기 시험\n\n첫 문장입니다. 둘째 문장입니다.\n\n'+long+'\n\n'+same+' '+same);
  await page.locator('#composerSave').click();
  await page.locator('#readerTitle').getByText('듣기 시험').waitFor();
  assert.deepEqual(dialogs,[],'saving a book must not ask for the AI model download');
  await page.locator('#playBtn').click();
  await page.waitForFunction(()=>!state.playing&&window.__spoken.length>0,null,{timeout:10000});
  const result=await page.evaluate(()=>({spoken:window.__spoken,marked:window.__marked,consent:state.settings.aiConsent}));
  assert.deepEqual(dialogs,[],'play must not ask for the AI model download');
  assert.equal(result.consent,false);
  assert.equal(result.spoken[0],'듣기 시험');
  assert.ok(result.spoken.length>=6,'long paragraph is read in several chunks: '+result.spoken.length);
  assert.equal(result.spoken.join(' ').includes('둘째 문장입니다.'),true);
  assert.ok(result.marked.some(Boolean),'Chromium supports CSS highlights, so the spoken sentence must be marked');
  {
   // Each highlighted sentence matches what is being spoken, including repeated sentences.
   result.spoken.forEach((text,i)=>assert.equal(result.marked[i].replace(/\s+/g,' ').trim(),text.replace(/\s+/g,' ').trim(),'highlight #'+i));
  }
  const cleared=await page.evaluate(()=>{const h=window.CSS?.highlights?.get('yb-speaking');return h?h.size:0});
  assert.equal(cleared,0,'highlight is cleared when reading stops');
  assert.deepEqual(errors,[]);
  console.log('여백 읽어주기: 확인창 없이 바로 낭독 · 읽는 문장 표시 · '+result.spoken.length+'구간 PASS');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
