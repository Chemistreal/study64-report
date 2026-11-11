/* 여백 오프라인 앱 셸. 사용자 책/메모/비밀키/API 응답을 저장하지 않습니다. */
const CACHE='yeobaek-reader-shell-v2';
const SHELL=['./','./index.html','./vendor/jszip.min.js','./vendor/lame.min.js','./ai-auto.js','./supertonic-helper.js','./icon.svg','./manifest.webmanifest'];
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
// 교차 출처 격리: GitHub Pages는 헤더를 못 바꾸므로 서비스 워커가 화면 응답에 COOP/COEP를 붙인다.
// 그러면 SharedArrayBuffer가 열려 AI 계산이 CPU 여러 코어를 쓴다. 바깥 자원(글꼴·CDN·모델)은 모두 CORS/CORP를 보낸다.
function isolate(response){
 if(!response||response.type==='opaque'||response.status===0)return response;
 const headers=new Headers(response.headers);
 headers.set('Cross-Origin-Opener-Policy','same-origin');
 headers.set('Cross-Origin-Embedder-Policy','require-corp');
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
}
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
   try{const result=await fetch(request);if(result.ok)await cache.put(new URL('./index.html',self.registration.scope),result.clone());return isolate(result)}
   catch(e){const cached=await cache.match(new URL('./index.html',self.registration.scope));return cached?isolate(cached):Response.error()}
  }
  const existing=await cache.match(pathnameUrl.href);
  if(existing)return existing;
  const response=await fetch(request);
  if(response.ok)await cache.put(pathnameUrl.href,response.clone());
  return response;
 })());
});
