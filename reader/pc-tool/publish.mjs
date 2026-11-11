// 여백 오디오 저장소에 올리기: PC 작업실이 만든 'AI 오디오 책'을 GitHub Pages 저장소(기본 Chemistreal/yeobaek-audio)에 올린다.
// 주소가 https://chemistreal.github.io/yeobaek-audio/ 라서 여백 리더(chemistreal.github.io/study64-report/reader/)와 같은 사이트로 취급되어,
// 리더의 '추천 글'이 이 목록(index.json)을 그대로 읽고 받는다.
//
// 저장소 구조
//   index.json                     {format:'yeobaek-audio-shelf', version:1, updated, items:[{id,title,manifest,bytes,duration,…}]}
//   books/<id>/book.json           {format:'yeobaek-ai-audio', version:1, items:[{title,blocks,hash,timeline,…, audio:{parts,bytes}}]}
//   books/<id>/audio.001.mp3 …     MP3를 19MB씩 자른 조각(리더가 받아서 하나로 잇는다)
//   books/<id>/원문.md              원문
// 올릴 때마다 '지금 파일만 담은 한 장짜리 기록'으로 바꿔 올린다(force push) — 지운 오디오가 저장소 기록에 쌓여 용량을 먹지 않는다.
// 로그인은 GitHub CLI(gh)의 로그인을 그대로 쓴다. 이 프로그램은 비밀번호나 토큰을 저장하지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import {execFile} from 'node:child_process';

export const DEFAULT_TARGET={owner:'Chemistreal',repo:'yeobaek-audio'};
export const PAGES_SOFT_LIMIT=950*1024*1024;   // GitHub Pages 사이트 한도 1GB 앞에서 멈춘다
const GIT_AUTH=['-c','credential.helper=','-c','credential.helper=!gh auth git-credential'];   // 이 명령에서만 gh 로그인을 쓴다(전역 설정은 안 바꾼다)

function run(cmd,args,{cwd,input,allowFail=false}={}){
 return new Promise((resolve,reject)=>{
  const child=execFile(cmd,args,{cwd,windowsHide:true,maxBuffer:64*1024*1024,env:{...process.env,GH_PROMPT_DISABLED:'1',GIT_TERMINAL_PROMPT:'0'}},(err,stdout,stderr)=>{
   if(err&&!allowFail){const e=Error((stderr||stdout||err.message).toString().trim().split('\n').slice(-3).join(' / '));e.code=err.code;reject(e)}
   else resolve({ok:!err,code:err?.code??0,stdout:String(stdout).trim(),stderr:String(stderr).trim()});
  });
  if(input!==undefined){child.stdin.end(input)}
 });
}
export const siteUrl=t=>'https://'+t.owner.toLowerCase()+'.github.io/'+t.repo+'/';

// ── 상태 ──────────────────────────────────────────────
export async function ghStatus(){
 const v=await run('gh',['--version'],{allowFail:true}).catch(()=>({ok:false}));
 if(!v.ok)return {gh:false,loggedIn:false};
 const u=await run('gh',['api','user','--jq','.login'],{allowFail:true});
 return {gh:true,loggedIn:u.ok&&!!u.stdout,login:u.ok?u.stdout:''};
}
export async function repoStatus(t){
 const r=await run('gh',['api','repos/'+t.owner+'/'+t.repo,'--jq','.full_name'],{allowFail:true});
 if(!r.ok)return {exists:false,pages:false};
 const p=await run('gh',['api','repos/'+t.owner+'/'+t.repo+'/pages','--jq','.status'],{allowFail:true});
 return {exists:true,pages:p.ok,pagesStatus:p.stdout||''};
}

// ── 올릴 내용(로컬 사본) ─────────────────────────────────
export function readShelf(siteDir){try{const j=JSON.parse(fs.readFileSync(path.join(siteDir,'index.json'),'utf8'));if(j?.format==='yeobaek-audio-shelf'&&Array.isArray(j.items))return j}catch(e){}return {format:'yeobaek-audio-shelf',version:1,updated:0,items:[]}}
function writeShelf(siteDir,shelf){shelf.updated=Date.now();fs.mkdirSync(siteDir,{recursive:true});fs.writeFileSync(path.join(siteDir,'index.json'),JSON.stringify(shelf,null,1))}
export const bookId=hash=>'b-'+String(hash).slice(0,12);
export function addToShelf(siteDir,entry){const shelf=readShelf(siteDir);shelf.items=shelf.items.filter(x=>x.id!==entry.id);shelf.items.unshift(entry);writeShelf(siteDir,shelf);return shelf}
export function removeFromShelf(siteDir,id){const shelf=readShelf(siteDir);shelf.items=shelf.items.filter(x=>x.id!==id);writeShelf(siteDir,shelf);fs.rmSync(path.join(siteDir,'books',id),{recursive:true,force:true});return shelf}
export function dirBytes(dir){let n=0;if(!fs.existsSync(dir))return 0;for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='.git')continue;const p=path.join(dir,e.name);n+=e.isDirectory()?dirBytes(p):fs.statSync(p).size}return n}
function mirror(from,to){
 const want=new Set();
 const copy=(a,b)=>{fs.mkdirSync(b,{recursive:true});for(const e of fs.readdirSync(a,{withFileTypes:true})){const pa=path.join(a,e.name),pb=path.join(b,e.name);want.add(path.relative(to,pb));
   if(e.isDirectory())copy(pa,pb);else{const sa=fs.statSync(pa);if(!fs.existsSync(pb)||fs.statSync(pb).size!==sa.size||fs.statSync(pb).mtimeMs<sa.mtimeMs)fs.copyFileSync(pa,pb)}}};
 copy(from,to);
 const prune=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.name==='.git')continue;const p=path.join(d,e.name),rel=path.relative(to,p);if(!want.has(rel)){fs.rmSync(p,{recursive:true,force:true});continue}if(e.isDirectory())prune(p)}};
 prune(to);
}
const README=t=>`# 여백 AI 오디오 책

[여백 리더](https://chemistreal.github.io/study64-report/reader/)의 **추천 글**에 나오는 AI 낭독 오디오 책을 두는 저장소입니다.
PC의 '여백 작업실'(study64-report/reader/pc-tool)이 자동으로 올립니다. 손으로 고치지 마세요 — 올릴 때마다 이 저장소의 기록은 한 장으로 다시 써집니다.

- 목록: ${siteUrl(t)}index.json
- 목소리: Supertone Supertonic-3 (모델 라이선스는 원저작자를 따릅니다)
`;

// ── 올리기 ────────────────────────────────────────────
export async function publish({siteDir,gitDir,target=DEFAULT_TARGET,report=()=>{},waitForSite=true}){
 const shelf=readShelf(siteDir);
 const bytes=dirBytes(siteDir);
 if(bytes>PAGES_SOFT_LIMIT)throw Error('올릴 오디오가 '+Math.round(bytes/1048576)+'MB로 GitHub Pages 한도(1GB)에 너무 가깝습니다. 작업실에서 오래된 책을 사이트에서 내린 뒤 다시 올려 주세요.');
 report('GitHub 로그인 확인 중');
 const gh=await ghStatus();
 if(!gh.gh)throw Error('GitHub CLI(gh)가 없습니다. 작업실의 안내대로 설치해 주세요.');
 if(!gh.loggedIn)throw Error('GitHub 로그인이 필요합니다. 작업실의 [GitHub 로그인] 버튼을 누르거나, 터미널에서 gh auth login 을 실행해 주세요.');
 const full=target.owner+'/'+target.repo;
 let repo=await repoStatus(target);
 if(!repo.exists){
  report('오디오 저장소 만드는 중: '+full);
  await run('gh',['repo','create',full,'--public','--description','여백 리더 AI 오디오 책 (PC 작업실이 자동으로 올립니다)']);
  repo=await repoStatus(target);
 }
 // 로컬 git 사본 준비
 fs.mkdirSync(gitDir,{recursive:true});
 if(!fs.existsSync(path.join(gitDir,'.git'))){await run('git',['init','-q','-b','main'],{cwd:gitDir});await run('git',['remote','add','origin','https://github.com/'+full+'.git'],{cwd:gitDir})}
 else await run('git',['remote','set-url','origin','https://github.com/'+full+'.git'],{cwd:gitDir});
 // 원격에 이미 있는 파일은 다시 보내지 않도록 원격 기록을 받아 둔다(없으면 그냥 넘어감)
 report('올라가 있는 내용 확인 중');
 await run('git',[...GIT_AUTH,'fetch','-q','--depth=1','origin','main'],{cwd:gitDir,allowFail:true});
 // 파일 맞추기
 mirror(siteDir,gitDir);
 fs.writeFileSync(path.join(gitDir,'.nojekyll'),'');
 fs.writeFileSync(path.join(gitDir,'README.md'),README(target));
 fs.writeFileSync(path.join(gitDir,'.gitattributes'),'* -text\n');
 // 한 장짜리 기록으로 다시 쓰기
 const name=(await run('git',['config','user.name'],{cwd:gitDir,allowFail:true})).stdout;
 const email=(await run('git',['config','user.email'],{cwd:gitDir,allowFail:true})).stdout;
 const who=[];if(!name)who.push('-c','user.name='+(gh.login||'yeobaek-studio'));if(!email)who.push('-c','user.email='+(gh.login||'yeobaek-studio')+'@users.noreply.github.com');
 await run('git',['checkout','-q','--orphan','yeobaek-publish'],{cwd:gitDir});
 await run('git',['add','-A'],{cwd:gitDir});
 await run('git',[...who,'commit','-q','--allow-empty','-m','여백 오디오 책 '+shelf.items.length+'권 ('+new Date().toISOString().slice(0,16).replace('T',' ')+')'],{cwd:gitDir});
 await run('git',['branch','-D','main'],{cwd:gitDir,allowFail:true});
 await run('git',['branch','-m','main'],{cwd:gitDir});
 report('올리는 중 ('+Math.round(bytes/1048576)+'MB, 이미 올라간 파일은 건너뜀)');
 await run('git',[...GIT_AUTH,'push','-q','-f','origin','main'],{cwd:gitDir});
 // GitHub Pages 켜기(처음 한 번)
 if(!repo.pages){
  report('GitHub Pages 켜는 중');
  const r=await run('gh',['api','-X','POST','repos/'+full+'/pages','--input','-'],{input:JSON.stringify({build_type:'legacy',source:{branch:'main',path:'/'}}),allowFail:true});
  if(!r.ok&&!/already/i.test(r.stderr+r.stdout))throw Error('GitHub Pages를 켜지 못했습니다: '+(r.stderr||r.stdout).slice(0,200));
 }
 const url=siteUrl(target);
 if(!waitForSite)return {url,bytes,items:shelf.items.length};
 // 사이트에 반영될 때까지 기다린다(보통 1~3분)
 report('사이트에 반영되기를 기다리는 중(보통 1~3분)');
 const want=shelf.updated,deadline=Date.now()+12*60*1000;
 while(Date.now()<deadline){
  await new Promise(r=>setTimeout(r,10000));
  try{const res=await fetch(url+'index.json?t='+Date.now(),{cache:'no-store'});if(res.ok){const j=await res.json();if(j?.updated===want)return {url,bytes,items:shelf.items.length,live:true}}}catch(e){}
  const b=await run('gh',['api','repos/'+full+'/pages/builds/latest','--jq','.status + " " + (.error.message // "")'],{allowFail:true});
  if(b.ok&&/^errored/.test(b.stdout))throw Error('GitHub Pages 반영에 실패했습니다: '+b.stdout.slice(8,200));
 }
 return {url,bytes,items:shelf.items.length,live:false};
}
