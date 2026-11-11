'use strict';
// 오디오 저장소 올리기(publish.mjs syncPush): '원격 최신 상태 위에 바꿀 것만 얹기'.
// PC 작업실 · 아이폰 요청(inbox) · GitHub Actions 완성이 섞여도 서로의 책을 지우지 않는다. 로컬 git 저장소를 원격 삼아 확인한다.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const git=(cwd,...a)=>execFileSync('git',a,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
(async()=>{
 const P=await import(pathToFileURL(path.join(root,'reader/pc-tool/publish.mjs')).href);
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'yb-sync-'));
 try{
  const remote=path.join(tmp,'remote.git');fs.mkdirSync(remote);git(remote,'init','-q','--bare','-b','main');
  const who=['-c','user.name=test','-c','user.email=test@example.com'];
  const book=(dir,id,title)=>{const d=path.join(dir,'books',id);fs.mkdirSync(d,{recursive:true});fs.writeFileSync(path.join(d,'book.json'),JSON.stringify({title}));fs.writeFileSync(path.join(d,'audio.001.mp3'),Buffer.alloc(3000,id.length));return {id,title,manifest:'books/'+id+'/book.json',bytes:3000,duration:9}};
  const pcSite=path.join(tmp,'pc-site'),pcGit=path.join(tmp,'pc-git');
  // 1) PC: 책 A를 올린다(한 장짜리 기록 + 워크플로 파일)
  P.upsertShelf(pcSite,book(pcSite,'b-aaaaaaaaaaaa','책 A'));
  const pub=()=>P.syncPush({gitDir:pcGit,remoteUrl:remote,auth:[],who,squash:true,message:'pc',mutate:dir=>{const local=P.readShelf(pcSite),removed=P.readRemoved(pcSite),shelf=P.readShelf(dir);for(const id of removed){shelf.items=shelf.items.filter(x=>x.id!==id);fs.rmSync(path.join(dir,'books',id),{recursive:true,force:true})}for(const it of local.items){P.mirrorDir(path.join(pcSite,'books',it.id),path.join(dir,'books',it.id));shelf.items=shelf.items.filter(x=>x.id!==it.id);shelf.items.unshift(it);fs.rmSync(path.join(dir,'inbox',it.id+'.json'),{force:true})}P.writeShelf(dir,shelf)}});
  let r=await pub();assert.equal(r.changed,true);
  const view=()=>{const c=path.join(tmp,'view-'+Math.random().toString(36).slice(2));git(tmp,'clone','-q','--depth=1',remote,c);return c};
  let v=view();assert.deepEqual(P.readShelf(v).items.map(x=>x.id),['b-aaaaaaaaaaaa']);assert.ok(fs.existsSync(path.join(v,'.github/workflows/site.yml')),'workflow file is published');
  assert.equal(git(v,'rev-list','--count','HEAD'),'1');
  // 2) 아이폰: 요청(inbox)을 보통 기록으로 보낸다
  const phone=view();fs.mkdirSync(path.join(phone,'inbox'));fs.writeFileSync(path.join(phone,'inbox','b-bbbbbbbbbbbb.json'),JSON.stringify({format:'yeobaek-audio-request',title:'책 B'}));
  git(phone,'add','-A');git(phone,...who,'commit','-q','-m','request');git(phone,'push','-q','origin','HEAD:main');
  // 3) GitHub Actions: 책 B를 완성해 얹는다(기록을 이어 붙이고, 워크플로 파일은 건드리지 않는다)
  const actions=view();const stage=path.join(tmp,'stage');const entryB=book(stage,'b-bbbbbbbbbbbb','책 B');
  r=await P.syncPush({gitDir:actions,remoteUrl:null,auth:[],who,squash:false,workflow:false,message:'actions',mutate:dir=>{P.mirrorDir(path.join(stage,'books','b-bbbbbbbbbbbb'),path.join(dir,'books','b-bbbbbbbbbbbb'));P.upsertShelf(dir,entryB);fs.rmSync(path.join(dir,'inbox','b-bbbbbbbbbbbb.json'),{force:true})}});
  assert.equal(r.changed,true);
  v=view();assert.deepEqual(P.readShelf(v).items.map(x=>x.id).sort(),['b-aaaaaaaaaaaa','b-bbbbbbbbbbbb']);assert.ok(!fs.existsSync(path.join(v,'inbox','b-bbbbbbbbbbbb.json')),'finished request leaves the inbox');
  assert.ok(Number(git(v,'rev-list','--count','HEAD'))>=2,'actions appends to history instead of rewriting it');
  // 4) PC: 낡은 사본으로 책 C를 올리고 책 A를 내린다 → 책 B(아이폰 것)는 그대로, A는 지워지고, 기록은 다시 한 장
  P.upsertShelf(pcSite,book(pcSite,'b-cccccccccccc','책 C'));P.removeFromShelf(pcSite,'b-aaaaaaaaaaaa');
  assert.deepEqual(P.readRemoved(pcSite),['b-aaaaaaaaaaaa']);
  r=await pub();assert.equal(r.changed,true);
  v=view();const final=P.readShelf(v).items.map(x=>x.id);
  assert.deepEqual(final.sort(),['b-bbbbbbbbbbbb','b-cccccccccccc'],'PC keeps books made elsewhere and removes only what it removed: '+final);
  assert.ok(!fs.existsSync(path.join(v,'books','b-aaaaaaaaaaaa')));assert.ok(fs.existsSync(path.join(v,'books','b-bbbbbbbbbbbb','audio.001.mp3')));
  assert.equal(git(v,'rev-list','--count','HEAD'),'1','PC squashes history so removed audio does not pile up');
  // 5) 바뀐 것이 없으면 올리지 않는다
  r=await pub();assert.equal(r.changed,false);
  console.log('오디오 저장소 올리기: PC 한 장 기록 · 아이폰 요청 · Actions 완성 이어 붙이기 · PC가 남의 책을 지우지 않음 · 내린 책만 지움 · 바뀐 것 없으면 그대로 PASS');
 }finally{fs.rmSync(tmp,{recursive:true,force:true})}
})().catch(e=>{console.error(e);process.exit(1)});
