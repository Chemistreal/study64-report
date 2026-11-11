'use strict';
// 여백 서비스 워커: 기기 내 AI 엔진 파일(버전 고정 CDN)은 한 번 받으면 보관해서 오프라인에서도 쓴다.
// 그 밖의 바깥 요청은 건드리지 않는다.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.resolve(__dirname,'../reader/sw.js'),'utf8');
const stores=new Map();
const caches={open:async name=>{if(!stores.has(name))stores.set(name,new Map());const m=stores.get(name);return {match:async req=>m.get(typeof req==='string'?req:req.url),put:async(req,res)=>{m.set(typeof req==='string'?req:req.url,res)},add:async()=>{}}},keys:async()=>[...stores.keys()],delete:async n=>stores.delete(n)};
let online=true,fetched=[];
const fakeFetch=async req=>{fetched.push(req.url);if(!online)throw new TypeError('offline');return {ok:true,type:'cors',url:req.url,clone(){return this}}};
const listeners={};
const self={registration:{scope:'https://example.test/reader/'},location:{origin:'https://example.test'},addEventListener:(t,f)=>{listeners[t]=f},skipWaiting:async()=>{},clients:{claim:async()=>{}}};
vm.runInNewContext(source,{self,caches,fetch:fakeFetch,URL,Request:class{constructor(u){this.url=String(u)}},console});
const fire=async (url,mode='cors')=>{let result=null;listeners.fetch({request:{url,method:'GET',mode},respondWith:p=>{result=p}});return result?await result:undefined};
(async()=>{
 const wasm='https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.3/dist/ort-wasm-simd.wasm';
 const first=await fire(wasm);assert.equal(first.url,wasm);assert.equal(fetched.length,1);
 online=false;
 const again=await fire(wasm);assert.equal(again.url,wasm,'served from the device when offline');assert.equal(fetched.length,1,'no second network request');
 assert.equal(await fire('https://cdn.jsdelivr.net/npm/other@1.0.0/x.js'),undefined,'other outside requests are left alone');
 assert.ok(stores.has('yeobaek-ai-runtime-v1'));
 console.log('여백 서비스 워커: AI 엔진 파일 오프라인 보관 PASS');
})().catch(e=>{console.error(e);process.exit(1)});
