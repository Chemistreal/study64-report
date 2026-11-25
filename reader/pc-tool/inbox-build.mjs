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
// - 실패하면 요청 파일에 error를 적어 둔다(리더가 보여 주고, 같은 요청을 계속 다시 시도하지 않는다. 리더에서 다시 보내면 다시 만든다).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import * as E from './engine.mjs';
import * as P from './publish.mjs';
import {makeStatusWriter} from './build-status.mjs';

const args=process.argv.slice(2),arg=(k,d)=>{const i=args.indexOf(k);return i>=0?args[i+1]:d};
const site=path.resolve(arg('--site','site')),jobs=Math.max(1,Math.min(16,Number(arg('--jobs',10))||10));
const work=path.join(process.env.RUNNER_TEMP||os.tmpdir(),'yeobaek-work');
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
const push=(message,mutate)=>P.syncPush({gitDir:site,remoteUrl:null,auth:[],squash:false,workflow:false,message,mutate,report:m=>log(m)});

async function main(){
 const todo=listRequests(site);
 log('요청',todo.length,'개');
 const status=makeStatusWriter({log}),deferred=[];
 const queueAfter=i=>[...todo.slice(i+1).map(t=>({...brief(t),wait:'queue'})),...deferred];
 await status.update({current:null,queue:todo.map(t=>({...brief(t),wait:'queue'}))},{force:true});
 for(const [i,t] of todo.entries()){
  const r=await buildOne(t,i,status,deferred,queueAfter);
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
  // 오디오 저장소(GitHub Pages)는 1GB 앞에서 멈춘다. 다 만들어도 못 올릴 책은 만들지 않고 남겨 둔다 — 아이폰이 받아 가서 서버에서 지우면(그 기록이 다음 실행을 부른다) 이어 만든다.
  const need=E.estimate(book.chars,speed,profile).bytes,have=P.dirBytes(site);
  if(need>P.PAGES_SOFT_LIMIT){await fail('오디오가 너무 커서(약 '+Math.round(need/1048576)+'MB) 저장소에 올릴 수 없습니다. 글을 나눠 주세요.');return}
  if(have+need>P.PAGES_SOFT_LIMIT){log('저장소 자리가 모자라 다음에 만듦',id,book.title,'필요 약',Math.round(need/1048576)+'MB','· 지금',Math.round(have/1048576)+'MB');deferred.push({...brief(t),wait:'space'});return}
  log('만드는 중',id,book.title,book.chars.toLocaleString()+'자','· 예상',(E.estimate(book.chars,speed,profile).seconds/60).toFixed(0)+'분 분량');
  const started=Date.now();let last=0;
  const cur={...brief(t),stage:'start',done:0,total:book.blocks.length,retries:0,etaSec:null,started};
  await status.update({current:cur,queue:queueAfter(i)},{force:true});
  let r;
  try{r=await E.synthesizeBook(book,{speed,profile,concurrency:jobs,workDir:path.join(work,id),onProgress:p=>{Object.assign(cur,{stage:p.stage,done:p.done,total:p.total,retries:p.retries||0,etaSec:Number.isFinite(p.etaSec)?Math.round(p.etaSec):null});status.update({current:cur},{force:p.stage!=='synth'});const now=Date.now();if(now-last>30000||p.stage!=='synth'){last=now;log(' ',p.stage,p.done+'/'+p.total,p.retries?'다시 받음 '+p.retries:'')}}})}
  catch(e){
   // 지난번보다 더 만들었으면 멈춘 횟수를 다시 센다 — 아무것도 더 못 만들고 3번 연달아 멈출 때만 실패
   const stalls=path.join(work,id+'-stalls.txt');let prev={n:0,done:-1};try{prev=JSON.parse(fs.readFileSync(stalls,'utf8'))}catch(x){}
   const n=cur.done>prev.done?1:prev.n+1;
   if(/번째 문단을 받지 못했습니다/.test(e.message)&&n<3){fs.mkdirSync(work,{recursive:true});fs.writeFileSync(stalls,JSON.stringify({n,done:cur.done}));log('멈춤',id,e.message,'· '+cur.done+'/'+cur.total+' · 진척 없이 '+n+'번째');return 'retry'}
   fs.rmSync(stalls,{force:true});await fail('오디오를 만들지 못했습니다: '+e.message);return}
  const bundle=path.join(work,id,'bundle');E.writeSiteBundle(book,r,bundle);
  const entry={id,title:book.title,description:'현수 목소리 · '+speed+'배속',manifest:'books/'+id+'/book.json',bytes:r.bytes,duration:r.duration,chars:book.chars,speed,profile,published:Date.now(),source:'iphone'};
  await push('현수 오디오: '+book.title.slice(0,60),dir=>{P.mirrorDir(bundle,path.join(dir,'books',id));P.upsertShelf(dir,entry);fs.rmSync(path.join(dir,'inbox',t.file),{force:true})});
  log('완료',id,(r.duration/60).toFixed(1)+'분 오디오',(r.bytes/1048576).toFixed(1)+'MB',((Date.now()-started)/60000).toFixed(1)+'분 걸림');
  fs.rmSync(path.join(work,id),{recursive:true,force:true});fs.rmSync(path.join(work,id+'-stalls.txt'),{force:true});
 }
}
main().catch(e=>{console.error('오류:',e?.stack||e);process.exit(1)});
