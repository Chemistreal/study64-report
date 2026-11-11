// 여백 오디오 저장소(기본 Chemistreal/yeobaek-audio, GitHub Pages)에 올리기. PC 작업실과 저장소의 GitHub Actions(inbox-build.mjs)가 함께 쓴다.
// 주소가 https://chemistreal.github.io/yeobaek-audio/ 라서 여백 리더(chemistreal.github.io/study64-report/reader/)와 같은 사이트로 취급되어,
// 리더의 '추천 글'이 이 목록(index.json)을 그대로 읽고 받는다.
//
// 저장소 구조
//   index.json                     {format:'yeobaek-audio-shelf', version:1, updated, items:[{id,title,manifest,bytes,duration,…}]}
//   books/<id>/book.json           {format:'yeobaek-ai-audio', version:1, items:[{title,blocks,hash,timeline,…, audio:{parts,bytes}}]}
//   books/<id>/audio.001.mp3 …     MP3를 19MB씩 자른 조각(리더가 받아서 하나로 잇는다)
//   books/<id>/원문.md              원문
//   inbox/<id>.json                아이폰 리더가 보낸 '현수 오디오 만들어 줘' 요청(글 문단). Actions가 만들고 지운다. 실패하면 error를 적어 둔다.
//   .github/workflows/site.yml     요청을 만들고 사이트를 배포하는 워크플로(audio-site/site.yml에서 복사)
//
// 올리기 = '원격 최신 상태 위에 바꿀 것만 얹기'. 그 사이 원격이 바뀌면(아이폰 요청·Actions 완성) 다시 받아 다시 얹는다.
// PC에서는 기록을 한 장으로 다시 써서(squash) 지운 오디오가 저장소 기록에 쌓이지 않게 한다.
// 로그인은 GitHub CLI(gh)의 로그인을 그대로 쓴다. 이 프로그램은 비밀번호나 토큰을 저장하지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const HERE=path.dirname(fileURLToPath(import.meta.url));
export const WORKFLOW_SRC=path.join(HERE,'audio-site','site.yml');
export const DEFAULT_TARGET={owner:'Chemistreal',repo:'yeobaek-audio'};
export const PAGES_SOFT_LIMIT=950*1024*1024;   // GitHub Pages 사이트 한도 1GB 앞에서 멈춘다
export const GH_AUTH=['-c','credential.helper=','-c','credential.helper=!gh auth git-credential'];   // 이 명령에서만 gh 로그인을 쓴다(전역 설정은 안 바꾼다)

export function run(cmd,args,{cwd,input,allowFail=false}={}){
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
 const p=await run('gh',['api','repos/'+t.owner+'/'+t.repo+'/pages','--jq','.build_type'],{allowFail:true});
 return {exists:true,pages:p.ok,buildType:p.stdout||''};
}

// ── 목록(index.json)과 책 폴더 ──────────────────────────
export function readShelf(dir){try{const j=JSON.parse(fs.readFileSync(path.join(dir,'index.json'),'utf8'));if(j?.format==='yeobaek-audio-shelf'&&Array.isArray(j.items))return j}catch(e){}return {format:'yeobaek-audio-shelf',version:1,updated:0,items:[]}}
// 책 목록이 그대로면 갱신 시각도 그대로 둔다(바뀐 것 없이 올리지 않게).
export function writeShelf(dir,shelf){const old=readShelf(dir);shelf.updated=JSON.stringify(old.items)===JSON.stringify(shelf.items)&&old.updated?old.updated:Date.now();fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.json'),JSON.stringify(shelf,null,1));return shelf}
export const bookId=hash=>'b-'+String(hash).slice(0,12);
export function upsertShelf(dir,entry){const shelf=readShelf(dir);shelf.items=shelf.items.filter(x=>x.id!==entry.id);shelf.items.unshift(entry);return writeShelf(dir,shelf)}
export const addToShelf=upsertShelf;
// 작업실에서 내린 책은 removed.json에 적어 두었다가, 다음에 올릴 때 원격에서도 지운다.
const removedFile=dir=>path.join(dir,'removed.json');
export function readRemoved(dir){try{const j=JSON.parse(fs.readFileSync(removedFile(dir),'utf8'));return Array.isArray(j)?j:[]}catch(e){return []}}
export function removeFromShelf(dir,id){const shelf=readShelf(dir);shelf.items=shelf.items.filter(x=>x.id!==id);writeShelf(dir,shelf);fs.rmSync(path.join(dir,'books',id),{recursive:true,force:true});const removed=new Set(readRemoved(dir));removed.add(id);fs.writeFileSync(removedFile(dir),JSON.stringify([...removed]));return shelf}
export function dirBytes(dir){let n=0;if(!fs.existsSync(dir))return 0;for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='.git')continue;const p=path.join(dir,e.name);n+=e.isDirectory()?dirBytes(p):fs.statSync(p).size}return n}
// 책 폴더 하나를 그대로 맞춘다(바뀐 파일만 복사, 없어진 파일은 지움).
export function mirrorDir(from,to){
 fs.mkdirSync(to,{recursive:true});const want=new Set(fs.readdirSync(from));
 for(const name of want){const a=path.join(from,name),b=path.join(to,name),st=fs.statSync(a);if(st.isDirectory()){mirrorDir(a,b);continue}if(!fs.existsSync(b)||fs.statSync(b).size!==st.size||!fs.readFileSync(a).equals(fs.readFileSync(b)))fs.copyFileSync(a,b)}
 for(const name of fs.readdirSync(to))if(!want.has(name))fs.rmSync(path.join(to,name),{recursive:true,force:true});
}
const README=t=>`# 여백 AI 오디오 책

[여백 리더](https://chemistreal.github.io/study64-report/reader/)의 **추천 글**에 나오는 AI 낭독 오디오 책(목소리: 현수)을 두는 저장소입니다.

- PC의 '여백 작업실'(study64-report/reader/pc-tool)이 올리거나, 아이폰 리더에서 보낸 글(inbox/)을 이 저장소의 GitHub Actions가 만들어 올립니다.
- 손으로 고치지 마세요. PC에서 올릴 때마다 이 저장소의 기록은 한 장으로 다시 써집니다.
- 공개 저장소입니다 — 여기 들어온 글과 오디오는 누구나 볼 수 있습니다.
- 목록: ${siteUrl(t)}index.json
`;

// ── 원격 최신 상태 위에 얹어 올리기 ─────────────────────
// mutate(dir): 원격 최신 상태로 맞춘 dir에 바꿀 것을 얹는다(동기 함수). squash: 기록을 한 장으로(PC). auth: git 인증 옵션.
// workflow: 워크플로 파일도 맞출지(PC만. Actions 기본 토큰은 워크플로 파일을 바꾸는 push를 거부당한다).
export async function syncPush({gitDir,remoteUrl,mutate,message,squash=true,auth=GH_AUTH,report=()=>{},target=DEFAULT_TARGET,who=[],workflow=true}){
 fs.mkdirSync(gitDir,{recursive:true});
 if(!fs.existsSync(path.join(gitDir,'.git'))){await run('git',['init','-q','-b','main'],{cwd:gitDir});await run('git',['remote','add','origin',remoteUrl],{cwd:gitDir})}
 else if(remoteUrl)await run('git',['remote','set-url','origin',remoteUrl],{cwd:gitDir});
 for(let attempt=1;attempt<=6;attempt++){
  const f=await run('git',[...auth,'fetch','-q','--depth=1','origin','main'],{cwd:gitDir,allowFail:true});
  let base='';
  if(f.ok){base=(await run('git',['rev-parse','FETCH_HEAD'],{cwd:gitDir})).stdout;await run('git',['checkout','-q','-f','--detach',base],{cwd:gitDir});await run('git',['clean','-qfdx'],{cwd:gitDir})}
  else{for(const e of fs.readdirSync(gitDir))if(e!=='.git')fs.rmSync(path.join(gitDir,e),{recursive:true,force:true})}
  mutate(gitDir);
  fs.writeFileSync(path.join(gitDir,'.nojekyll'),'');
  fs.writeFileSync(path.join(gitDir,'README.md'),README(target));
  fs.writeFileSync(path.join(gitDir,'.gitattributes'),'* -text\n');
  if(workflow&&fs.existsSync(WORKFLOW_SRC)){fs.mkdirSync(path.join(gitDir,'.github','workflows'),{recursive:true});fs.copyFileSync(WORKFLOW_SRC,path.join(gitDir,'.github','workflows','site.yml'))}
  const bytes=dirBytes(gitDir);
  if(bytes>PAGES_SOFT_LIMIT)throw Error('오디오 저장소가 '+Math.round(bytes/1048576)+'MB로 GitHub Pages 한도(1GB)에 너무 가깝습니다. 오래된 책을 사이트에서 내린 뒤 다시 올려 주세요.');
  const name=(await run('git',['config','user.name'],{cwd:gitDir,allowFail:true})).stdout,email=(await run('git',['config','user.email'],{cwd:gitDir,allowFail:true})).stdout;
  const id=[...who];if(!name)id.push('-c','user.name=yeobaek-studio');if(!email)id.push('-c','user.email=yeobaek-studio@users.noreply.github.com');
  if(squash||!base){
   await run('git',['branch','-D','yeobaek-publish'],{cwd:gitDir,allowFail:true});
   await run('git',['checkout','-q','--orphan','yeobaek-publish'],{cwd:gitDir});
  }
  await run('git',['add','-A'],{cwd:gitDir});
  if(base&&(await run('git',['write-tree'],{cwd:gitDir})).stdout===(await run('git',['rev-parse',base+'^{tree}'],{cwd:gitDir})).stdout)return {bytes,changed:false,attempt};   // 원격과 똑같으면 올리지 않는다
  const c=await run('git',[...id,'commit','-q','-m',message],{cwd:gitDir,allowFail:true});
  if(!c.ok&&/nothing to commit/.test(c.stdout+c.stderr))return {bytes,changed:false,attempt};
  if(!c.ok)throw Error('기록을 만들지 못했습니다: '+(c.stderr||c.stdout).slice(0,200));
  const lease=squash||!base?['--force-with-lease=refs/heads/main:'+base]:[];
  const p=await run('git',[...auth,'push','-q',...lease,'origin','HEAD:refs/heads/main'],{cwd:gitDir,allowFail:true});
  if(p.ok)return {bytes,changed:true,attempt};
  report('그 사이 다른 곳에서 먼저 올렸습니다. 최신 상태를 다시 받아 맞추는 중 ('+attempt+'/6)');
  await new Promise(r=>setTimeout(r,1500*attempt));
 }
 throw Error('여러 번 다시 맞춰 봤지만 올리지 못했습니다. 잠시 뒤 다시 올려 주세요.');
}

// ── PC 작업실: 내 책 올리기 ─────────────────────────────
export async function publish({siteDir,gitDir,target=DEFAULT_TARGET,report=()=>{},waitForSite=true}){
 report('GitHub 로그인 확인 중');
 const gh=await ghStatus();
 if(!gh.gh)throw Error('GitHub CLI(gh)가 없습니다. 작업실의 안내대로 설치해 주세요.');
 if(!gh.loggedIn)throw Error('GitHub 로그인이 필요합니다. 작업실의 [GitHub 로그인] 버튼을 누르거나, 터미널에서 gh auth login 을 실행해 주세요.');
 const full=target.owner+'/'+target.repo;
 let repo=await repoStatus(target);
 if(!repo.exists){report('오디오 저장소 만드는 중: '+full);await run('gh',['repo','create',full,'--public','--description','여백 리더 AI 오디오 책 (PC 작업실과 GitHub Actions가 자동으로 올립니다)']);repo=await repoStatus(target)}
 const local=readShelf(siteDir),removed=readRemoved(siteDir);
 let stamp=0;
 report('올리는 중 (이미 올라간 파일은 건너뜀)');
 const r=await syncPush({gitDir,remoteUrl:'https://github.com/'+full+'.git',target,report,squash:true,message:'여백 오디오 책 (PC 작업실, '+new Date().toISOString().slice(0,16).replace('T',' ')+')',mutate:dir=>{
  const shelf=readShelf(dir);
  for(const id of removed){shelf.items=shelf.items.filter(x=>x.id!==id);fs.rmSync(path.join(dir,'books',id),{recursive:true,force:true})}
  for(const it of [...local.items].reverse()){
   const src=path.join(siteDir,'books',it.id);if(!fs.existsSync(src))continue;
   mirrorDir(src,path.join(dir,'books',it.id));shelf.items=shelf.items.filter(x=>x.id!==it.id);shelf.items.unshift(it);
   fs.rmSync(path.join(dir,'inbox',it.id+'.json'),{force:true});
  }
  stamp=writeShelf(dir,shelf).updated;
 }});
 fs.rmSync(removedFile(siteDir),{force:true});
 // GitHub Pages: 워크플로(site.yml)가 배포한다(처음 한 번 켜거나, 예전 '브랜치에서 바로' 방식이면 바꾼다)
 if(!repo.pages){report('GitHub Pages 켜는 중');await run('gh',['api','-X','POST','repos/'+full+'/pages','--input','-'],{input:JSON.stringify({build_type:'workflow'}),allowFail:true})}
 else if(repo.buildType!=='workflow'){report('GitHub Pages를 워크플로 배포로 바꾸는 중');await run('gh',['api','-X','PUT','repos/'+full+'/pages','--input','-'],{input:JSON.stringify({build_type:'workflow'}),allowFail:true});await run('gh',['workflow','run','site.yml','--repo',full],{allowFail:true})}
 const url=siteUrl(target),shelfNow=readShelf(gitDir);
 if(!waitForSite)return {url,bytes:r.bytes,items:shelfNow.items.length};
 report('사이트에 반영되기를 기다리는 중(보통 1~3분)');
 const deadline=Date.now()+15*60*1000;
 while(Date.now()<deadline){
  await new Promise(res=>setTimeout(res,10000));
  try{const res=await fetch(url+'index.json?t='+Date.now(),{cache:'no-store'});if(res.ok){const j=await res.json();if(j?.updated>=stamp)return {url,bytes:r.bytes,items:shelfNow.items.length,live:true}}}catch(e){}
 }
 return {url,bytes:r.bytes,items:shelfNow.items.length,live:false};
}
