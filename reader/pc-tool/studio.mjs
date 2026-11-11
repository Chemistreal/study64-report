#!/usr/bin/env node
// 여백 작업실: PC에서 글을 올리면 PC(그래픽카드·CPU)를 최대한 써서 원문+AI 오디오 ZIP을 만들고,
// 여백 리더의 '추천 글'(오디오 저장소, GitHub Pages)에 자동으로 올린다.
//
//   node studio.mjs            → http://127.0.0.1:7788 을 브라우저로 연다
//   (윈도우: studio.cmd 를 두 번 눌러도 된다)
//
// 작업 폴더: D:\yeobaek-studio (D 드라이브가 없으면 %USERPROFILE%\yeobaek-studio, YEOBAEK_STUDIO_DIR로 바꿀 수 있음)
//   jobs/<id>/      올린 글 · 구간별 계산 결과(끊겨도 이어서 만든다)
//   out/            원문+AI 오디오 ZIP (여백 + 버튼으로 바로 가져오는 형식)
//   site/           오디오 저장소에 올릴 내용(index.json · books/…)
//   publish-git/    오디오 저장소 git 사본
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import * as E from './engine.mjs';
import * as P from './publish.mjs';

const require=createRequire(import.meta.url);
const ROOT=E.STUDIO_ROOT;
const PORT=Number(process.env.YEOBAEK_STUDIO_PORT||7788);
const DIRS={jobs:path.join(ROOT,'jobs'),out:path.join(ROOT,'out'),site:path.join(ROOT,'site'),git:path.join(ROOT,'publish-git')};
for(const d of Object.values(DIRS))fs.mkdirSync(d,{recursive:true});
const STATE_FILE=path.join(ROOT,'state.json');

// ── 상태 ──────────────────────────────────────────────
const state={settings:{speed:E.DEFAULTS.speed,profile:E.DEFAULTS.profile,concurrency:E.DEFAULTS.concurrency,autoPublish:true,owner:P.DEFAULT_TARGET.owner,repo:P.DEFAULT_TARGET.repo},jobs:[],devices:'Edge 신경망 음성 · 현수(인터넷 필요)',engine:'idle',engineMessage:'',publish:{state:'idle',message:'',url:'',at:0},github:null};
try{const saved=JSON.parse(fs.readFileSync(STATE_FILE,'utf8'));Object.assign(state.settings,saved.settings||{});delete state.settings.voice;delete state.settings.voices;state.jobs=(saved.jobs||[]).map(j=>j.status==='running'?{...j,status:'queued'}:j);if(saved.publish)state.publish={...saved.publish,state:saved.publish.state==='publishing'?'pending':saved.publish.state}}catch(e){}
let saveTimer=null,pushTimer=null;const clients=new Set();
function changed(){
 clearTimeout(saveTimer);saveTimer=setTimeout(()=>fs.writeFileSync(STATE_FILE,JSON.stringify({settings:state.settings,jobs:state.jobs,publish:state.publish},null,1)),400);
 if(!pushTimer)pushTimer=setTimeout(()=>{pushTimer=null;const data='data: '+JSON.stringify(view())+'\n\n';for(const c of clients)c.write(data)},300);
}
function view(){
 // 사이트 목록 = 이 PC의 책 + 저장소에 있는 책(아이폰 요청으로 GitHub이 만든 책 포함, 마지막으로 올리거나 받은 상태) − 내린 책
 const removed=new Set(P.readRemoved(DIRS.site)),mine=P.readShelf(DIRS.site).items,remote=P.readShelf(DIRS.git).items;
 const shelf={items:[...mine,...remote.filter(x=>!mine.some(m=>m.id===x.id))].filter(x=>!removed.has(x.id))};
 return {...state,jobs:state.jobs.map(j=>({...j,estimate:E.estimate(j.chars,(j.used||state.settings).speed,(j.used||state.settings).profile)})),
  shelf:shelf.items,siteBytes:Math.max(P.dirBytes(DIRS.site),P.dirBytes(DIRS.git)),siteLimit:P.PAGES_SOFT_LIMIT,siteUrl:P.siteUrl(target()),readerUrl:'https://chemistreal.github.io/study64-report/reader/',
  voice:E.VOICE,profiles:E.PROFILES,root:ROOT};
}
const target=()=>({owner:state.settings.owner||P.DEFAULT_TARGET.owner,repo:state.settings.repo||P.DEFAULT_TARGET.repo});
const job=id=>state.jobs.find(j=>j.id===id);
const jobDir=j=>path.join(DIRS.jobs,j.id);
function loadBook(j){return E.bookFromFile(j.fileName,fs.readFileSync(path.join(jobDir(j),'source.'+j.ext)))}
const safeName=s=>s.replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').replace(/\s+/g,' ').trim().slice(0,120)||'책';

// ── 글 받기 ────────────────────────────────────────────
// 글 파일 하나 = 책 한 권.
function addTextJob(name,bytes){
 const book=E.bookFromFile(name,bytes),ext=name.split('.').pop().toLowerCase();
 const dup=state.jobs.find(j=>j.hash===book.hash&&j.status!=='error');
 if(dup)return [dup];
 const id=Date.now().toString(36)+crypto.randomBytes(3).toString('hex');
 fs.mkdirSync(path.join(DIRS.jobs,id),{recursive:true});fs.writeFileSync(path.join(DIRS.jobs,id,'source.'+ext),bytes);
 const j={id,title:book.title,fileName:path.basename(name),ext,chars:book.chars,blocks:book.blocks.length,hash:book.hash,created:Date.now(),status:'queued',progress:null,error:'',result:null};
 state.jobs.push(j);changed();return [j];
}
async function receiveUpload(name,bytes){
 const ext=name.split('.').pop().toLowerCase();
 if(ext==='zip'){
  const JSZip=require(path.join(E.SITE,'vendor','jszip.min.js'));const zip=await JSZip.loadAsync(bytes);const added=[];
  for(const [n,entry] of Object.entries(zip.files).sort(([a],[b])=>a.localeCompare(b,'ko',{numeric:true}))){if(entry.dir||n.split('/').some(p=>p.startsWith('.')||p==='__MACOSX'))continue;if(!E.TEXT_EXTS.has(n.split('.').pop().toLowerCase()))continue;added.push(...addTextJob(n.split('/').pop(),Buffer.from(await entry.async('uint8array'))))}
  if(!added.length)throw Error('ZIP 안에 글(.md, .txt)이 없습니다.');return added;
 }
 return addTextJob(name,bytes);
}

// ── 계산 ──────────────────────────────────────────────
let current=null,running=false,awake=null;
function keepAwake(on){ // 오래 걸리는 작업 중 PC가 잠들지 않게(작업이 끝나면 원래대로)
 if(process.platform!=='win32')return;
 if(on&&!awake){awake=spawn('powershell',['-NoProfile','-WindowStyle','Hidden','-Command','$t=Add-Type -MemberDefinition \'[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint f);\' -Name P -Namespace W -PassThru; while($true){[void]$t::SetThreadExecutionState(0x80000001); Start-Sleep 30}'],{windowsHide:true,stdio:'ignore'});awake.on('error',()=>{awake=null})}
 else if(!on&&awake){awake.kill();awake=null}
}
let setupOk=null;
async function ensureSetup(){
 if(setupOk)return;
 const r=await E.checkSetup();state.engineMessage=r.ok?'':r.message;changed();
 if(!r.ok)throw Error(r.message);setupOk=r;
}
async function runQueue(){
 if(running)return;running=true;
 try{
  for(;;){
   const j=state.jobs.find(x=>x.status==='queued');if(!j)break;
   keepAwake(true);
   j.status='running';j.error='';j.used={speed:state.settings.speed,profile:state.settings.profile};j.started=Date.now();changed();
   const ac=new AbortController();current={job:j,ac};
   try{
    const book=loadBook(j);await ensureSetup();
    state.engine='working';changed();
    const r=E.finishedResult(book,path.join(jobDir(j),'work'),j.used)||await E.synthesizeBook(book,{...j.used,concurrency:state.settings.concurrency,workDir:path.join(jobDir(j),'work'),signal:ac.signal,onProgress:p=>{j.progress=p;changed()}});
    j.progress={...(j.progress||{}),stage:'packing'};changed();
    const zip=path.join(DIRS.out,safeName(j.title)+'.zip');await E.writeBookZip(book,r,zip);
    const id=P.bookId(book.hash),bundle=E.writeSiteBundle(book,r,path.join(DIRS.site,'books',id));
    P.addToShelf(DIRS.site,{id,title:book.title,description:'현수 목소리 · '+r.speed+'배속',manifest:'books/'+id+'/book.json',bytes:bundle.bytes,duration:r.duration,chars:j.chars,speed:r.speed,profile:r.profile,published:Date.now()});
    j.status='done';j.finished=Date.now();j.result={zip,zipBytes:fs.statSync(zip).size,bytes:r.bytes,duration:r.duration,profile:r.profile,bookId:id};j.progress=null;changed();
    if(state.settings.autoPublish)schedulePublish();
   }catch(e){
    if(e?.name==='AbortError'){j.status='stopped';j.error=''}else{console.error(e);j.status='error';j.error=String(e?.message||e)}
    changed();
   }finally{current=null}
  }
 }finally{running=false;state.engine='idle';keepAwake(false);changed()}
}

// ── 올리기 ────────────────────────────────────────────
let publishing=null,publishAgain=false;
function schedulePublish(){
 if(publishing){publishAgain=true;return publishing}
 publishing=(async()=>{
  do{
   publishAgain=false;
   state.publish={...state.publish,state:'publishing',message:'올리는 준비 중'};changed();
   try{
    const r=await P.publish({siteDir:DIRS.site,gitDir:DIRS.git,target:target(),report:m=>{state.publish.message=m;changed()}});
    state.publish={state:r.live?'live':'pushed',message:r.live?'사이트에 반영됐습니다 · 책 '+r.items+'권 · '+Math.round(r.bytes/1048576)+'MB':'올렸습니다. 사이트 반영이 늦어지고 있습니다(몇 분 뒤 확인해 주세요).',url:r.url,at:Date.now()};
   }catch(e){console.error(e);state.publish={...state.publish,state:'error',message:String(e?.message||e),at:Date.now()}}
   state.github=await P.ghStatus().catch(()=>null);changed();
  }while(publishAgain);
 })().finally(()=>{publishing=null});
 return publishing;
}

// ── HTTP ──────────────────────────────────────────────
function send(res,code,body,type='application/json; charset=utf-8'){res.writeHead(code,{'Content-Type':type,'Cache-Control':'no-store'});res.end(typeof body==='string'||Buffer.isBuffer(body)?body:JSON.stringify(body))}
function readBody(req,limit=40*1024*1024){return new Promise((resolve,reject)=>{const chunks=[];let n=0;req.on('data',c=>{n+=c.length;if(n>limit){reject(Error('파일이 너무 큽니다(최대 40MB).'));req.destroy()}else chunks.push(c)});req.on('end',()=>resolve(Buffer.concat(chunks)));req.on('error',reject)})}
function openPath(p){if(process.platform==='win32')spawn('explorer',[p],{detached:true,stdio:'ignore'}).unref();else spawn(process.platform==='darwin'?'open':'xdg-open',[p],{detached:true,stdio:'ignore'}).unref()}
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://x');const p=url.pathname;
  // 이 PC 안에서만: 다른 사이트가 몰래 부르는 것을 막는다
  if(req.method!=='GET'&&req.headers.origin&&req.headers.origin!=='http://127.0.0.1:'+PORT&&req.headers.origin!=='http://localhost:'+PORT)return send(res,403,{error:'forbidden'});
  if(p==='/'||p==='/index.html')return send(res,200,fs.readFileSync(path.join(E.HERE,'studio.html')),'text/html; charset=utf-8');
  if(p==='/api/state')return send(res,200,view());
  if(p==='/api/events'){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-store',Connection:'keep-alive'});res.write('data: '+JSON.stringify(view())+'\n\n');clients.add(res);req.on('close',()=>clients.delete(res));return}
  if(req.method==='POST'&&p==='/api/upload'){
   const name=decodeURIComponent(req.headers['x-file-name']||'글.md');const added=await receiveUpload(name,await readBody(req));
   runQueue();return send(res,200,{added:added.map(j=>j.id)});
  }
  if(req.method==='POST'&&p==='/api/settings'){
   const body=JSON.parse((await readBody(req,65536)).toString('utf8')||'{}');const s=state.settings;
   if(Number.isFinite(+body.concurrency))s.concurrency=Math.round(Math.min(10,Math.max(1,+body.concurrency)));
   if(Number.isFinite(+body.speed))s.speed=Math.round(Math.min(2,Math.max(.8,+body.speed))*100)/100;
   if(E.PROFILES[body.profile])s.profile=body.profile;
   if(typeof body.autoPublish==='boolean')s.autoPublish=body.autoPublish;
   changed();return send(res,200,s);
  }
  let m=p.match(/^\/api\/job\/([\w-]+)\/(start|stop|delete|zip|redo)$/);
  if(m){
   const j=job(m[1]);if(!j)return send(res,404,{error:'작업을 찾지 못했습니다.'});
   if(m[2]==='zip'){if(!j.result?.zip||!fs.existsSync(j.result.zip))return send(res,404,{error:'ZIP이 없습니다.'});res.writeHead(200,{'Content-Type':'application/zip','Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(path.basename(j.result.zip))});return fs.createReadStream(j.result.zip).pipe(res)}
   if(req.method!=='POST')return send(res,405,{error:'POST'});
   if(m[2]==='start'){if(['stopped','error'].includes(j.status)){j.status='queued';changed();runQueue()}}
   if(m[2]==='redo'){if(j.status==='running')return send(res,409,{error:'만드는 중입니다.'});fs.rmSync(path.join(jobDir(j),'work'),{recursive:true,force:true});j.status='queued';j.result=null;changed();runQueue()}
   if(m[2]==='stop'){if(current?.job===j)current.ac.abort();else if(j.status==='queued'){j.status='stopped';changed()}}
   if(m[2]==='delete'){if(current?.job===j)current.ac.abort();state.jobs=state.jobs.filter(x=>x!==j);fs.rmSync(jobDir(j),{recursive:true,force:true});changed()}
   return send(res,200,{ok:true});
  }
  m=p.match(/^\/api\/shelf\/([\w-]+)\/remove$/);
  if(m&&req.method==='POST'){P.removeFromShelf(DIRS.site,m[1]);changed();if(state.settings.autoPublish)schedulePublish();return send(res,200,{ok:true})}
  if(req.method==='POST'&&p==='/api/publish'){schedulePublish();return send(res,200,{ok:true})}
  if(req.method==='POST'&&p==='/api/github/check'){state.github=await P.ghStatus();changed();return send(res,200,state.github)}
  if(req.method==='POST'&&p==='/api/github/login'){ // 사용자가 직접 브라우저에서 로그인하는 GitHub 공식 창을 띄운다
   if(process.platform==='win32')spawn('cmd',['/c','start "GitHub login" cmd /k "gh auth login --web --git-protocol https --hostname github.com"'],{detached:true,stdio:'ignore',windowsVerbatimArguments:true}).unref();
   return send(res,200,{ok:true});
  }
  if(req.method==='POST'&&p==='/api/open'){const which=url.searchParams.get('dir');openPath(which==='site'?DIRS.site:DIRS.out);return send(res,200,{ok:true})}
  send(res,404,{error:'없는 주소입니다.'});
 }catch(e){console.error(e);send(res,500,{error:String(e?.message||e)})}
});
server.on('error',e=>{if(e.code==='EADDRINUSE'){console.log('작업실이 이미 열려 있습니다: http://127.0.0.1:'+PORT);if(!process.env.YEOBAEK_NO_BROWSER)openPath('http://127.0.0.1:'+PORT);process.exit(0)}throw e});
server.listen(PORT,'127.0.0.1',async()=>{
 const url='http://127.0.0.1:'+PORT;
 console.log('여백 작업실: '+url+'\n작업 폴더: '+ROOT+'\n이 창을 닫으면 작업실이 꺼집니다(만들던 책은 다음에 이어서 만듭니다).');
 if(!process.env.YEOBAEK_NO_BROWSER){if(process.platform==='win32')spawn('cmd',['/c','start','',url],{detached:true,stdio:'ignore'}).unref();else openPath(url)}
 state.github=await P.ghStatus().catch(()=>null);changed();
 if(state.jobs.some(j=>j.status==='queued'))runQueue();
 if(state.publish.state==='pending'&&state.settings.autoPublish)schedulePublish();
});
process.on('SIGINT',()=>{keepAwake(false);process.exit(0)});
