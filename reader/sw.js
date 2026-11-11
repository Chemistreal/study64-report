/* 여백 오프라인 앱 셸. 사용자 책/메모/비밀키/API 응답을 저장하지 않습니다. */
const CACHE='yeobaek-reader-shell-v1';
const SHELL=['./','./index.html','./vendor/jszip.min.js','./ai-auto.js','./supertonic-helper.js','./icon.svg','./manifest.webmanifest'];
const publicUrls=new Set(SHELL.map(path=>new URL(path,self.registration.scope).href));
self.addEventListener('install',event=>{event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  for(const path of SHELL){try{await cache.add(new Request(new URL(path,self.registration.scope),{cache:'reload'}))}catch(e){console.warn('오프라인 셸 캐시 누락:',path)}}
  await self.skipWaiting();
})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('yeobaek-reader-shell-')&&key!==CACHE).map(key=>caches.delete(key)));
 await self.clients.claim();
})())});
// 기기 내 AI 음성 엔진(버전 고정 CDN 파일)도 한 번 받으면 보관해, 모델이 저장돼 있으면 오프라인에서도 AI 목소리가 나온다.
const AI_RUNTIME_CACHE='yeobaek-ai-runtime-v1';
const AI_RUNTIME_PREFIXES=['https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.3/dist/','https://cdn.jsdelivr.net/npm/lamejs@1.2.1/'];
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method==='GET'&&AI_RUNTIME_PREFIXES.some(prefix=>request.url.startsWith(prefix))){
  event.respondWith((async()=>{
   const cache=await caches.open(AI_RUNTIME_CACHE);
   const existing=await cache.match(request,{ignoreVary:true});
   // 스크립트(no-cors)로 받은 불투명 응답은 fetch(cors) 요청에 줄 수 없다.
   if(existing&&(existing.type!=='opaque'||request.mode==='no-cors'))return existing;
   const response=await fetch(request);
   if(response.ok||response.type==='opaque'){try{await cache.put(request,response.clone())}catch(e){}}
   return response;
  })());
  return;
 }
 if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
 const pathnameUrl=new URL(request.url);pathnameUrl.search='';pathnameUrl.hash='';
 if(!publicUrls.has(pathnameUrl.href))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  if(request.mode==='navigate'){
   try{const result=await fetch(request);if(result.ok)await cache.put(new URL('./index.html',self.registration.scope),result.clone());return result}
   catch(e){return (await cache.match(new URL('./index.html',self.registration.scope)))||Response.error()}
  }
  const existing=await cache.match(pathnameUrl.href);
  if(existing)return existing;
  const response=await fetch(request);
  if(response.ok)await cache.put(pathnameUrl.href,response.clone());
  return response;
 })());
});
