'use strict';
// 오디오 저장소 Actions가 '몇 % 만들었는지'를 build-status 가지에 적는다(build-status.mjs). 가짜 GitHub API로 본다:
// 가지가 없으면 빈 가지를 만들고(main과 무관, 부모 없음), 2분마다 한 번만 적고(단계가 바뀌면 바로), sha가 어긋나면 다시 읽어 적고, 실패해도 멈추지 않는다.
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const S=await import(pathToFileURL(path.join(__dirname,'..','reader/pc-tool/build-status.mjs')).href);
 let clock=1000000,branch=false,file=null,fileSha=0,conflictOnce=false;const calls=[];
 const res=(status,body)=>({status,ok:status>=200&&status<300,json:async()=>body});
 const fakeFetch=async(url,opt={})=>{
  const u=new URL(url),p=u.pathname.replace('/repos/o/r',''),m=opt.method||'GET';calls.push(m+' '+p);
  assert.equal(opt.headers.Authorization,'Bearer tok');
  if(m==='GET'&&p==='/contents/status.json'){assert.equal(u.searchParams.get('ref'),'build-status');return file?res(200,{sha:'s'+fileSha}):res(404,{})}
  if(m==='GET'&&p==='/git/ref/heads/build-status')return branch?res(200,{}):res(404,{});
  if(m==='POST'&&p==='/git/trees')return res(201,{sha:'tree1'});
  if(m==='POST'&&p==='/git/commits'){assert.deepEqual(JSON.parse(opt.body).parents,[],'the status branch starts empty');return res(201,{sha:'c1'})}
  if(m==='POST'&&p==='/git/refs'){assert.equal(JSON.parse(opt.body).ref,'refs/heads/build-status');branch=true;return res(201,{})}
  if(m==='PUT'&&p==='/contents/status.json'){const b=JSON.parse(opt.body);assert.equal(b.branch,'build-status');
   if(conflictOnce){conflictOnce=false;return res(409,{})}
   if(file&&b.sha!=='s'+fileSha)return res(409,{});
   file=JSON.parse(Buffer.from(b.content,'base64').toString('utf8'));fileSha++;return res(200,{content:{sha:'s'+fileSha}})}
  return res(404,{});
 };
 const w=S.makeStatusWriter({repo:'o/r',token:'tok',fetchImpl:fakeFetch,now:()=>clock});
 const cur={id:'b-aaaaaaaaaaaa',title:'긴 책 (1/3)',chars:800000,stage:'start',done:0,total:5000,retries:0,etaSec:null,started:clock};
 await w.update({current:cur,queue:[{id:'b-bbbbbbbbbbbb',title:'긴 책 (2/3)',chars:800000,wait:'space'}]},{force:true});
 assert.equal(branch,true,'creates the status branch');
 assert.equal(file.format,'yeobaek-build-status');assert.equal(file.current.id,'b-aaaaaaaaaaaa');assert.equal(file.queue[0].wait,'space');assert.equal(file.updated,clock);
 // 진행: 2분 안에는 적지 않는다
 Object.assign(cur,{stage:'synth',done:100});await w.update({current:cur});
 Object.assign(cur,{done:200});clock+=60000;await w.update({current:cur});
 assert.equal(file.current.done,0,'no write within two minutes');
 Object.assign(cur,{done:1850,etaSec:7800});clock+=61000;await w.update({current:cur});
 assert.equal(file.current.done,1850);assert.equal(file.current.etaSec,7800);
 // sha가 어긋나면(다른 실행이 적음) 다시 읽고 적는다
 conflictOnce=true;clock+=130000;Object.assign(cur,{done:2000});await w.update({current:cur});
 assert.equal(file.current.done,2000,'retries after a conflict');
 // 쓰기가 실패해도 오디오 만들기는 멈추지 않는다
 const broken=S.makeStatusWriter({repo:'o/r',token:'tok',fetchImpl:async()=>{throw Error('network down')},log:()=>{}});
 await broken.update({current:null},{force:true});await broken.flush();
 // 키가 없으면(PC에서 돌릴 때) 아무것도 하지 않는다
 const n=calls.length;await S.makeStatusWriter({repo:'o/r',token:'',fetchImpl:fakeFetch}).update({current:null},{force:true});assert.equal(calls.length,n);
 // 책을 올리면 곧바로 사이트 배포(pages.yml)를 부른다: main 기준 workflow_dispatch. 키가 없거나 실패해도 멈추지 않는다.
 const B=await import(pathToFileURL(path.join(__dirname,'..','reader/pc-tool/inbox-build.mjs')).href);
 const got=[];let answer=204;
 const srv=require('node:http').createServer((req,res)=>{let body='';req.on('data',c=>body+=c);req.on('end',()=>{got.push({m:req.method,u:req.url,auth:req.headers.authorization,body:JSON.parse(body||'{}')});res.writeHead(answer);res.end()})});
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));const api='http://127.0.0.1:'+srv.address().port;
 try{
  assert.equal(await B.deployNow('b-1',{repo:'o/r',token:'tok',api}),true);
  assert.deepEqual(got,[{m:'POST',u:'/repos/o/r/actions/workflows/pages.yml/dispatches',auth:'Bearer tok',body:{ref:'main'}}],'dispatches the Pages workflow on main');
  answer=403;assert.equal(await B.deployNow('b-2',{repo:'o/r',token:'tok',api}),false,'a refused dispatch does not throw');
  assert.equal(await B.deployNow('b-3',{repo:'o/r',token:'',api}),false);assert.equal(got.length,2,'no token (PC) → no call');
 }finally{srv.close()}
 console.log('오디오 서버 진행 기록: 빈 build-status 가지 만들기 · 2분마다 · 단계 바뀌면 바로 · 어긋나면 다시 · 실패해도 계속 · 키 없으면 쉼 · 책 올리면 곧바로 배포 부름 PASS');
})().catch(e=>{console.error(e);process.exit(1)});
