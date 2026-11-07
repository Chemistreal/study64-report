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
self.addEventListener('fetch',event=>{
 const request=event.request;
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
