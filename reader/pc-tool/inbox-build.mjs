#!/usr/bin/env node
// 오디오 저장소(yeobaek-audio)의 GitHub Actions에서 돈다: inbox/ 의 '현수 오디오 만들어 줘' 요청을 만들어 books/ 에 넣는다.
//
//   node inbox-build.mjs --site <저장소 checkout 폴더> [--jobs 10]
//
// 요청 파일 inbox/<id>.json (고음질로 다시 받기는 inbox/<id>-hq.json — 같은 책의 추천 글 항목을 건드리지 않게 따로 만든다) = {format:'yeobaek-audio-request', version:1, id, title, type, blocks:[{kind,text,level?}], requested, speed?, profile?}
// - 아이폰 리더가 보낸 문단 그대로 만든다(같은 본문 해시 → 완성되면 리더가 그 책에 오디오를 붙인다).
// - 요청 하나가 끝날 때마다 바로 올린다(원격 최신 상태 위에 얹기). 중간에 멈춰도 끝난 책은 남는다.
// - 만드는 동안 몇 %인지 build-status 가지의 status.json 에 2분마다 적는다(리더 카드에 '서버에서 만드는 중 37%').
// - 음성 서버가 막아 중간에 멈추면 실패로 적지 않고 이번 실행을 끝낸다. 만든 문단은 캐시에 남고, 2시간마다 도는 실행(또는 다음 push)이 이어 만든다. 더 만들지 못하고 3번 연달아 멈추면 실패로 적는다.
// - 저장소(1GB)에 자리가 없으면 그 책도 미리 다 만들어 캐시에 두고, 앞 책을 아이폰이 받아 가 자리가 나면 곧바로 올린다(status 의 wait:'space', ready:true).
// - 책을 올릴 때마다 사이트 배포(pages.yml)를 곧바로 불러, 실행이 끝나기를 기다리지 않고 몇 분 안에 폰에 보이게 한다.
// - 한 번 실행은 YEOBAEK_BUDGET_MIN분까지만 만든다. 다 되면 멈추고(more=1) 사이트를 배포한 뒤 워크플로가 자기를 다시 불러 이어 만든다 — 5시간 제한에 걸려 실패하면 배포가 건너뛰어져 폰에 아무것도 안 보였다(2026-11-25~28).
// - 실패하면 요청 파일에 error를 적어 둔다(리더가 보여 주고, 같은 요청을 계속 다시 시도하지 않는다. 리더에서 다시 보내면 다시 만든다).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {pathToFileURL} from 'node:url';
import * as E from './engine.mjs';
import * as P from './publish.mjs';
import {makeStatusWriter} from './build-status.mjs';

const args=process.argv.slice(2),arg=(k,d)=>{const i=args.indexOf(k);return i>=0?args[i+1]:d};
const site=path.resolve(arg('--site','site')),jobs=Math.max(1,Math.min(16,Number(arg('--jobs',10))||10));
const work=path.join(process.env.RUNNER_TEMP||os.tmpdir(),'yeobaek-work');
// 한 번 실행에 쓸 시간(분, YEOBAEK_BUDGET_MIN). 다 되면 만들던 책은 캐시에 남기고 멈춘다 — 그래야 실행이 정상으로 끝나 사이트가 배포되고(폰에 보임), 다음 실행이 곧바로 이어 만든다.
const budgetMin=Number(process.env.YEOBAEK_BUDGET_MIN)||0,timeUp=new AbortController();
if(budgetMin>0)setTimeout(()=>timeUp.abort(),budgetMin*60000).unref();
const setOutput=(k,v)=>{if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,k+'='+v+'\n')};
const log=(...m)=>console.log(new Date().toISOString().slice(11,19),...m);

const reqChars=t=>Array.isArray(t.req?.blocks)?t.req.blocks.reduce((n,b)=>n+String(b?.text||'').length,0):0;
const brief=t=>({id:t.id,title:String(t.req?.title||'').slice(0,80),chars:reqChars(t)});
function listRequests(dir){
 const inbox=path.join(dir,'inbox');if(!fs.existsSync(inbox))return [];
 const out=[];
 for(const f of fs.readdirSync(inbox)){if(!/^b-[0-9a-f]{12}(-hq)?\.json$/.test(f))continue;
  try{const r=JSON.parse(fs.readFileSync(path.join(inbox,f),'utf8'));if(r?.format==='yeobaek-audio-request'&&!r.error)out.push({file:f,id:f.slice(0,-5),req:r})}catch(e){out.push({file:f,id:f.slice(0,-5),bad:e})}}
 // 짧은 글부터 만든다 — 강의 하나(몇 분)가 100만 자 묶음(한두 시간) 뒤에서 기다리지 않게. 길이가 같으면 먼저 온 순서.
 const chars=reqChars;
 return out.sort((a,b)=>chars(a)-chars(b)||(a.req?.requested||0)-(b.req?.requested||0));
}
// 다른 책을 위해 작업 폴더에 남아 있는 문단 크기(지금 만들 책 제외) — 미리 만들어 두는 양의 상한
const HOLD_LIMIT=3*1024**3;
const heldBytes=except=>{if(!fs.existsSync(work))return 0;let n=0;for(const d of fs.readdirSync(work)){const p=path.join(work,d);if(d!==except&&fs.statSync(p).isDirectory())n+=P.dirBytes(p)}return n};
const push=(message,mutate)=>P.syncPush({gitDir:site,remoteUrl:null,auth:[],squash:false,workflow:false,message,mutate,report:m=>log(m)});
// 책을 올리면 곧바로 사이트 배포(pages.yml)를 부른다 — 이 실행(최대 90분)이 끝나야 배포되면 다 된 책이 그동안 폰에 안 보였다(2026-11-28).
// 봇이 올린 push는 워크플로를 깨우지 않지만, 같은 토큰으로 부르는 workflow_dispatch는 돈다. 못 불러도 실행 끝의 배포가 있으니 멈추지 않는다.
export async function deployNow(why,{repo=process.env.GITHUB_REPOSITORY,token=process.env.GITHUB_TOKEN,api=process.env.YEOBAEK_GITHUB_API||'https://api.github.com'}={}){
 if(!repo||!token)return false;
 try{const r=await fetch(api+'/repos/'+repo+'/actions/workflows/pages.yml/dispatches',{method:'POST',headers:{authorization:'Bearer '+token,accept:'application/vnd.github+json','x-github-api-version':'2022-11-28','content-type':'application/json'},body:JSON.stringify({ref:'main'}),signal:AbortSignal.timeout(30000)});
  log(r.ok?'사이트 배포를 부름 — 몇 분 뒤 폰에 보임':'사이트 배포를 부르지 못함('+r.status+') — 이번 실행이 끝날 때 배포됨',why);return r.ok}
 catch(e){log('사이트 배포를 부르지 못함 — 이번 실행이 끝날 때 배포됨',why,e.message);return false}
}

async function main(){
 const todo=listRequests(site);
 log('요청',todo.length,'개');
 const status=makeStatusWriter({log}),deferred=[];
 const queueAfter=i=>[...todo.slice(i+1).map(t=>({...brief(t),wait:'queue'})),...deferred];
 await status.update({current:null,queue:todo.map(t=>({...brief(t),wait:'queue'}))},{force:true});
 for(const [i,t] of todo.entries()){
  if(timeUp.signal.aborted){await status.update({current:null,queue:[{...brief(t),wait:'queue'},...queueAfter(i)]},{force:true});log('이번 실행 시간이 다 됨 — 남은 요청은 다음 실행에서');setOutput('more','1');break}
  const r=await buildOne(t,i,status,deferred,queueAfter);
  if(r==='time'){await status.update({current:null,queue:[{...brief(t),wait:'queue'},...queueAfter(i)]},{force:true});log('이번 실행 시간('+budgetMin+'분)이 다 되어 여기서 멈춤 — 사이트를 배포하고 다음 실행이 이어 만듦');setOutput('more','1');break}
  if(r==='retry'){const rest=[{...brief(t),wait:'retry'},...queueAfter(i)];await status.update({current:null,queue:rest},{force:true});log('음성 서버가 막아 이번 실행은 여기서 멈춤 — 만든 문단은 남기고 다음 실행에서 이어 만듦');break}
  await status.update({current:null,queue:queueAfter(i)},{force:true});
 }
 await status.flush();
}

async function buildOne(t,i,status,deferred,queueAfter){
 {
  const fail=async msg=>{log('실패',t.id,msg);await push('현수 오디오 실패: '+t.id,dir=>{const f=path.join(dir,'inbox',t.file);if(!fs.existsSync(f))return;let r={};try{r=JSON.parse(fs.readFileSync(f,'utf8'))}catch(e){}r.error=String(msg).slice(0,300);r.failed=Date.now();fs.writeFileSync(f,JSON.stringify(r))})};
  if(t.bad){await fail('요청 파일을 읽지 못했습니다.');return}
  let book;
  try{book=E.bookFromBlocks(t.req.title,t.req.blocks,t.req.type)}catch(e){await fail(e.message);return}
  const id=t.id;
  if(P.bookId(book.hash)!==id.replace(/-hq$/,'')){await fail('요청 이름과 글 내용이 맞지 않습니다.');return}
  const speed=Number(t.req.speed)>=.8&&Number(t.req.speed)<=2?Number(t.req.speed):E.DEFAULTS.speed;
  const profile=E.PROFILES[t.req.profile]?t.req.profile:E.DEFAULTS.profile;
  // 오디오 저장소(GitHub Pages)는 1GB 앞에서 멈춘다. 지금 못 올릴 책도 미리 만들어 캐시(작업 폴더)에 둔다 — 아이폰이 앞 책을 받아 가서 서버에서 지우면(그 기록이 다음 실행을 부른다) 캐시에서 곧바로 올린다.
  // 미리 만든 책이 캐시에 너무 많이 쌓이면(HOLD_LIMIT) 그때는 만들지 않고 기다린다.
  const need=E.estimate(book.chars,speed,profile).bytes,fits=()=>P.dirBytes(site)+need<=P.PAGES_SOFT_LIMIT;
  if(need>P.PAGES_SOFT_LIMIT){await fail('오디오가 너무 커서(약 '+Math.round(need/1048576)+'MB) 저장소에 올릴 수 없습니다. 글을 나눠 주세요.');return}
  const hold=!fits();
  if(hold){const held=heldBytes(id);log('저장소 자리가 모자라 미리 만들어 둠',id,book.title,'필요 약',Math.round(need/1048576)+'MB','· 지금',Math.round(P.dirBytes(site)/1048576)+'MB','· 미리 만든 것',Math.round(held/1048576)+'MB');
   if(held+need>HOLD_LIMIT){log('미리 만든 책이 많아 이번에는 기다림',id);deferred.push({...brief(t),wait:'space'});return}}
  log('만드는 중',id,book.title,book.chars.toLocaleString()+'자','· 예상',(E.estimate(book.chars,speed,profile).seconds/60).toFixed(0)+'분 분량');
  const started=Date.now();let last=0;
  const cur={...brief(t),stage:'start',done:0,total:book.blocks.length,retries:0,etaSec:null,started};
  await status.update({current:cur,queue:queueAfter(i)},{force:true});
  let r;
  try{r=await E.synthesizeBook(book,{speed,profile,concurrency:jobs,workDir:path.join(work,id),signal:timeUp.signal,onProgress:p=>{Object.assign(cur,{stage:p.stage,done:p.done,total:p.total,retries:p.retries||0,etaSec:Number.isFinite(p.etaSec)?Math.round(p.etaSec):null});status.update({current:cur},{force:p.stage!=='synth'});const now=Date.now();if(now-last>30000||p.stage!=='synth'){last=now;log(' ',p.stage,p.done+'/'+p.total,p.retries?'다시 받음 '+p.retries:'')}}})}
  catch(e){
   if(timeUp.signal.aborted){log('시간이 다 되어 멈춤',id,cur.done+'/'+cur.total,'· 만든 문단은 캐시에 남음');return 'time'}
   // 지난번보다 더 만들었으면 멈춘 횟수를 다시 센다 — 아무것도 더 못 만들고 3번 연달아 멈출 때만 실패
   const stalls=path.join(work,id+'-stalls.txt');let prev={n:0,done:-1};try{prev=JSON.parse(fs.readFileSync(stalls,'utf8'))}catch(x){}
   const n=cur.done>prev.done?1:prev.n+1;
   if(/번째 문단을 받지 못했습니다/.test(e.message)&&n<3){fs.mkdirSync(work,{recursive:true});fs.writeFileSync(stalls,JSON.stringify({n,done:cur.done}));log('멈춤',id,e.message,'· '+cur.done+'/'+cur.total+' · 진척 없이 '+n+'번째');return 'retry'}
   fs.rmSync(stalls,{force:true});await fail('오디오를 만들지 못했습니다: '+e.message);return}
  if(hold&&!fits()){log('미리 만들어 둠 — 자리가 나면 올림',id,(r.bytes/1048576).toFixed(1)+'MB');fs.rmSync(path.join(work,id+'-stalls.txt'),{force:true});deferred.push({...brief(t),wait:'space',ready:true});return}
  const bundle=path.join(work,id,'bundle');E.writeSiteBundle(book,r,bundle);
  const entry={id,title:book.title,description:'현수 목소리 · '+speed+'배속',manifest:'books/'+id+'/book.json',bytes:r.bytes,duration:r.duration,chars:book.chars,speed,profile,published:Date.now(),source:'iphone'};
  await push('현수 오디오: '+book.title.slice(0,60),dir=>{P.mirrorDir(bundle,path.join(dir,'books',id));P.upsertShelf(dir,entry);fs.rmSync(path.join(dir,'inbox',t.file),{force:true})});
  await deployNow(id);
  log('완료',id,(r.duration/60).toFixed(1)+'분 오디오',(r.bytes/1048576).toFixed(1)+'MB',((Date.now()-started)/60000).toFixed(1)+'분 걸림');
  fs.rmSync(path.join(work,id),{recursive:true,force:true});fs.rmSync(path.join(work,id+'-stalls.txt'),{force:true});
 }
}
if(import.meta.url===pathToFileURL(process.argv[1]||'').href)main().catch(e=>{console.error('오류:',e?.stack||e);process.exit(1)});
