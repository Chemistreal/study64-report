#!/usr/bin/env node
// 오디오 저장소(yeobaek-audio)의 GitHub Actions에서 돈다: inbox/ 의 '현수 오디오 만들어 줘' 요청을 만들어 books/ 에 넣는다.
//
//   node inbox-build.mjs --site <저장소 checkout 폴더> [--jobs 10]
//
// 요청 파일 inbox/<id>.json = {format:'yeobaek-audio-request', version:1, id, title, type, blocks:[{kind,text,level?}], requested, speed?, profile?}
// - 아이폰 리더가 보낸 문단 그대로 만든다(같은 본문 해시 → 완성되면 리더가 그 책에 오디오를 붙인다).
// - 요청 하나가 끝날 때마다 바로 올린다(원격 최신 상태 위에 얹기). 중간에 멈춰도 끝난 책은 남는다.
// - 실패하면 요청 파일에 error를 적어 둔다(리더가 보여 주고, 같은 요청을 계속 다시 시도하지 않는다. 리더에서 다시 보내면 다시 만든다).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import * as E from './engine.mjs';
import * as P from './publish.mjs';

const args=process.argv.slice(2),arg=(k,d)=>{const i=args.indexOf(k);return i>=0?args[i+1]:d};
const site=path.resolve(arg('--site','site')),jobs=Math.max(1,Math.min(16,Number(arg('--jobs',10))||10));
const work=path.join(process.env.RUNNER_TEMP||os.tmpdir(),'yeobaek-work');
const log=(...m)=>console.log(new Date().toISOString().slice(11,19),...m);

function listRequests(dir){
 const inbox=path.join(dir,'inbox');if(!fs.existsSync(inbox))return [];
 const out=[];
 for(const f of fs.readdirSync(inbox)){if(!/^b-[0-9a-f]{12}\.json$/.test(f))continue;
  try{const r=JSON.parse(fs.readFileSync(path.join(inbox,f),'utf8'));if(r?.format==='yeobaek-audio-request'&&!r.error)out.push({file:f,id:f.slice(0,-5),req:r})}catch(e){out.push({file:f,id:f.slice(0,-5),bad:e})}}
 // 짧은 글부터 만든다 — 강의 하나(몇 분)가 100만 자 묶음(한두 시간) 뒤에서 기다리지 않게. 길이가 같으면 먼저 온 순서.
 const chars=t=>Array.isArray(t.req?.blocks)?t.req.blocks.reduce((n,b)=>n+String(b?.text||'').length,0):0;
 return out.sort((a,b)=>chars(a)-chars(b)||(a.req?.requested||0)-(b.req?.requested||0));
}
const push=(message,mutate)=>P.syncPush({gitDir:site,remoteUrl:null,auth:[],squash:false,workflow:false,message,mutate,report:m=>log(m)});

async function main(){
 const todo=listRequests(site);
 log('요청',todo.length,'개');
 for(const t of todo){
  const fail=async msg=>{log('실패',t.id,msg);await push('현수 오디오 실패: '+t.id,dir=>{const f=path.join(dir,'inbox',t.file);if(!fs.existsSync(f))return;let r={};try{r=JSON.parse(fs.readFileSync(f,'utf8'))}catch(e){}r.error=String(msg).slice(0,300);r.failed=Date.now();fs.writeFileSync(f,JSON.stringify(r))})};
  if(t.bad){await fail('요청 파일을 읽지 못했습니다.');continue}
  let book;
  try{book=E.bookFromBlocks(t.req.title,t.req.blocks,t.req.type)}catch(e){await fail(e.message);continue}
  const id=P.bookId(book.hash);
  if(id!==t.id){await fail('요청 이름과 글 내용이 맞지 않습니다.');continue}
  const speed=Number(t.req.speed)>=.8&&Number(t.req.speed)<=2?Number(t.req.speed):E.DEFAULTS.speed;
  const profile=E.PROFILES[t.req.profile]?t.req.profile:E.DEFAULTS.profile;
  log('만드는 중',id,book.title,book.chars.toLocaleString()+'자','· 예상',(E.estimate(book.chars,speed,profile).seconds/60).toFixed(0)+'분 분량');
  const started=Date.now();let last=0;
  let r;
  try{r=await E.synthesizeBook(book,{speed,profile,concurrency:jobs,workDir:path.join(work,id),onProgress:p=>{const now=Date.now();if(now-last>30000||p.stage!=='synth'){last=now;log(' ',p.stage,p.done+'/'+p.total,p.retries?'다시 받음 '+p.retries:'')}}})}
  catch(e){await fail('오디오를 만들지 못했습니다: '+e.message);continue}
  const bundle=path.join(work,id,'bundle');E.writeSiteBundle(book,r,bundle);
  const entry={id,title:book.title,description:'현수 목소리 · '+speed+'배속',manifest:'books/'+id+'/book.json',bytes:r.bytes,duration:r.duration,chars:book.chars,speed,profile,published:Date.now(),source:'iphone'};
  await push('현수 오디오: '+book.title.slice(0,60),dir=>{P.mirrorDir(bundle,path.join(dir,'books',id));P.upsertShelf(dir,entry);fs.rmSync(path.join(dir,'inbox',t.file),{force:true})});
  log('완료',id,(r.duration/60).toFixed(1)+'분 오디오',(r.bytes/1048576).toFixed(1)+'MB',((Date.now()-started)/60000).toFixed(1)+'분 걸림');
  fs.rmSync(path.join(work,id),{recursive:true,force:true});
 }
}
main().catch(e=>{console.error('오류:',e?.stack||e);process.exit(1)});
