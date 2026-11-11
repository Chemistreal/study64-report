/*
 * Optional, on-device Korean AI audio generation for 여백.
 * Uses the MIT-licensed Supertonic browser helper (see supertonic-helper.js),
 * the independently licensed Supertone Supertonic-3 weights and lamejs (LGPL-3.0).
 * No credentials or cloud TTS endpoint are required; models are downloaded to the browser.
 * Large model (~380 MB): mobile performance varies. Audio generation must finish in foreground.
 */
import {configureOrt,configureModelFetch,loadTextToSpeech,loadVoiceStyle,writeWavFile} from './supertonic-helper.js';
const BASE='https://huggingface.co/Supertone/supertonic-3/resolve/main';
// Model files are kept in Cache Storage so the ~400MB download happens only once per device.
export const MODEL_CACHE='yeobaek-ai-model-v1';
const MODEL_FILES=['duration_predictor','text_encoder','vector_estimator','vocoder'].map(n=>BASE+'/onnx/'+n+'.onnx');
let downloadReport=null,loadingHook=null;
// 계산 장치: PC(또는 WebGPU를 지원하는 기기)에서는 GPU로 수십 배 빨리 만든다. GPU가 안 되면 CPU(WASM)로 바꾼다.
let devicePref='auto',activeDevice='cpu';
export function setDevicePreference(p){const next=['auto','gpu','cpu'].includes(p)?p:'auto';if(next!==devicePref){devicePref=next;if(activeDevice==='gpu'&&next==='cpu')modelPromise=null}}
export function aiDevice(){return activeDevice}
async function gpuUsable(){if(devicePref==='cpu')return false;try{if(!navigator.gpu||!window.ort?.env?.webgpu)return false;return !!(await navigator.gpu.requestAdapter())}catch(e){return false}}
export function setLoadingHook(fn){loadingHook=typeof fn==='function'?fn:null}
async function openModelCache(){try{return typeof caches!=='undefined'?await caches.open(MODEL_CACHE):null}catch(e){return null}}
function bytesResponse(bytes){return {ok:true,status:200,arrayBuffer:async()=>bytes.buffer.byteLength===bytes.byteLength?bytes.buffer:bytes.slice().buffer,json:async()=>JSON.parse(new TextDecoder().decode(bytes))}}
// 모델(.onnx)은 8MB 조각으로 받아 조각마다 기기에 저장한다 — 받다가 페이지를 나가거나 앱을 바꿔도 다음에 받은 데서 이어 받는다.
// 다 받으면 조각을 한 파일로 합친다(조각은 저장소의 Blob이라 메모리를 크게 쓰지 않는다).
const PART_BYTES=8*1048576,EXPECTED_TOTAL=398075273; // 모델 4개 합계(진행률 표시용)
const partKey=(url,i)=>url+'?yb-part='+i,metaKey=url=>url+'?yb-meta';
async function readMeta(cache,url){try{const hit=await cache.match(metaKey(url));return hit?await hit.json():null}catch(e){return null}}
async function clearPartial(cache,url){for(const req of await cache.keys()){if(req.url.startsWith(url+'?yb-'))await cache.delete(req)}}
async function storedPartBytes(cache,url){const meta=await readMeta(cache,url);if(!meta)return 0;let got=0;for(let i=0;got<meta.total;i++){const hit=await cache.match(partKey(url,i));if(!hit)break;got+=Number(hit.headers.get('content-length'))||0}return got}
let doneBytes=0;
async function downloadModelFile(cache,url){
 const name=url.split('/').pop().replace('.onnx','');
 for(let attempt=0;attempt<2;attempt++){
  let meta=await readMeta(cache,url),got=0,i=0,restart=false;
  if(meta){for(;got<meta.total;i++){const hit=await cache.match(partKey(url,i));if(!hit)break;got+=Number(hit.headers.get('content-length'))||0}}
  downloadReport?.(name,doneBytes+got);
  while(!meta||got<meta.total){
   const res=await fetch(url,{credentials:'omit',headers:{Range:'bytes='+got+'-'+(got+PART_BYTES-1)}});
   if(res.status===200){await clearPartial(cache,url);await cache.put(url,res);doneBytes+=Number(res.headers.get('content-length'))||0;return}
   if(res.status!==206)throw Error('AI 모델 파일을 받지 못했습니다 ('+res.status+'). 다시 재생하면 받은 데서 이어 받습니다.');
   const range=/bytes (\d+)-(\d+)\/(\d+)/.exec(res.headers.get('content-range')||'');
   const total=range?Number(range[3]):0,etag=res.headers.get('etag')||'';
   if(!range){ // 조각 정보를 읽을 수 없는 서버: 이어 받기 없이 통째로 저장소에 흘려 받는다.
    await clearPartial(cache,url);const full=await fetch(url,{credentials:'omit'});
    if(!full.ok)throw Error('AI 모델 파일을 받지 못했습니다 ('+full.status+').');
    await cache.put(url,full);const hit=await cache.match(url);doneBytes+=Number(hit?.headers.get('content-length'))||0;return}
   if(Number(range[1])!==got){await clearPartial(cache,url);restart=true;break}
   if(!meta){meta={total,etag};await cache.put(metaKey(url),new Response(JSON.stringify(meta),{headers:{'content-type':'application/json'}}))}
   else if(meta.total!==total||(meta.etag&&etag&&meta.etag!==etag)){await clearPartial(cache,url);restart=true;break}
   const buf=await res.arrayBuffer();
   await cache.put(partKey(url,i),new Response(buf,{headers:{'content-type':'application/octet-stream','content-length':String(buf.byteLength)}}));
   got+=buf.byteLength;i++;downloadReport?.(name,doneBytes+got);
  }
  if(restart)continue;
  const blobs=[];for(let k=0;k<i;k++){const hit=await cache.match(partKey(url,k));if(!hit){restart=true;break}blobs.push(await hit.blob())}
  const whole=restart?null:new Blob(blobs);
  if(!whole||whole.size!==meta.total){await clearPartial(cache,url);continue}
  await cache.put(url,new Response(whole,{headers:{'content-type':'application/octet-stream','content-length':String(whole.size)}}));
  await clearPartial(cache,url);doneBytes+=whole.size;return
 }
 throw Error('AI 모델 파일이 서버에서 바뀌어 처음부터 다시 받아야 합니다. 재생을 다시 눌러 주세요.');
}
let downloadPromise=null;
// 모델 파일 4개를 모두 기기에 받아 둔다(메모리에는 올리지 않음). 여러 곳에서 불러도 한 번만 받는다.
export function downloadModel(report=()=>{}){
 if(downloadPromise)return downloadPromise;
 downloadPromise=(async()=>{
  const cache=await openModelCache();if(!cache)return false;
  try{await navigator.storage?.persist?.()}catch(e){}
  doneBytes=0;
  for(const url of MODEL_FILES){
   const hit=await cache.match(url,{ignoreVary:true});
   if(hit){doneBytes+=Number(hit.headers.get('content-length'))||0;continue}
   downloadReport=(name,got)=>report('AI 모델 받는 중 '+mb(got)+'/약 '+mb(EXPECTED_TOTAL)+'MB · 나갔다 와도 받은 데서 이어 받습니다');
   await downloadModelFile(cache,url)
  }
  downloadReport=null;return true
 })().finally(()=>{downloadPromise=null});
 return downloadPromise
}
async function cachedModelFetch(url){
 const cache=await openModelCache();
 if(cache){try{const hit=await cache.match(url,{ignoreVary:true});if(hit)return hit}catch(e){}}
 if(cache&&MODEL_FILES.includes(url)){await downloadModel();const hit=await cache.match(url,{ignoreVary:true});if(hit)return hit}
 const response=await fetch(url,{credentials:'omit'});
 if(!response.ok||!cache)return response;
 const bytes=new Uint8Array(await response.arrayBuffer());
 try{await cache.put(url,new Response(bytes.slice(),{headers:{'content-type':response.headers.get('content-type')||'application/octet-stream','content-length':String(bytes.byteLength)}}))}
 catch(e){console.warn('AI 모델을 기기에 저장하지 못했습니다. 다음에 다시 받습니다.',e)}
 return bytesResponse(bytes);
}
configureModelFetch(cachedModelFetch);
export async function aiModelStatus(){
 const cache=await openModelCache();if(!cache)return {supported:false,cachedFiles:0,totalFiles:MODEL_FILES.length,bytes:0};
 let cachedFiles=0,bytes=0;
 let partialBytes=0;
 for(const url of MODEL_FILES){try{const hit=await cache.match(url,{ignoreVary:true});if(hit){cachedFiles++;bytes+=Number(hit.headers.get('content-length'))||0}else partialBytes+=await storedPartBytes(cache,url)}catch(e){}}
 return {supported:true,cachedFiles,totalFiles:MODEL_FILES.length,bytes,partialBytes};
}
export async function clearAiModel(){modelPromise=null;voiceStyles.clear();try{return typeof caches!=='undefined'&&await caches.delete(MODEL_CACHE)}catch(e){return false}}
function mb(n){return Math.round(n/1048576)}
let modelPromise=null;
const voiceStyles=new Map();
const VOICES=Object.freeze([{id:'F1',label:'미나 · 여성'},{id:'F2',label:'소라 · 여성'},{id:'F3',label:'유나 · 여성'},{id:'M1',label:'에이든 · 남성'},{id:'M2',label:'히로 · 남성'},{id:'M3',label:'레오 · 남성'}]);
export const aiVoices=VOICES;
// 소리를 다듬는 단계 수: 적을수록 빨리 만들고, 많을수록 곱다(기본 8).
function cleanSteps(steps){const n=Math.round(Number(steps));return Number.isFinite(n)?Math.min(16,Math.max(3,n)):8}
function checkAbort(signal){if(signal?.aborted)throw new DOMException('음성 만들기가 취소되었습니다.','AbortError')}
export async function loadLocalAI(report=()=>{}){
 if(modelPromise)return modelPromise;
 if(!window.ort)throw Error('음성 추론 도구를 불러오지 못했습니다.');
 if(!window.lamejs?.Mp3Encoder)throw Error('MP3 인코딩 도구를 불러오지 못했습니다.');
 configureOrt(window.ort);
 window.ort.env.wasm.numThreads=1;
 window.ort.env.wasm.wasmPaths='https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.3/dist/';
 modelPromise=(async()=>{
   const status=await aiModelStatus().catch(()=>({cachedFiles:0,totalFiles:4,partialBytes:0}));
   const stored=status.cachedFiles===status.totalFiles;
   report(stored?'기기에 저장된 AI 모델을 불러옵니다.':status.partialBytes||status.cachedFiles?'받다 만 AI 모델을 이어서 받습니다.':'AI 음성 엔진을 받습니다. 처음 한 번만 약 380MB를 받고 기기에 저장합니다.');
   if(!stored)await downloadModel(report);
   // 여기부터 모델을 메모리에 올린다 — 이 사이에 페이지가 죽으면 다음에 알 수 있게 표시한다.
   const gpu=await gpuUsable();
   const load=device=>loadTextToSpeech(BASE+'/onnx',{executionProviders:device==='gpu'?['webgpu','wasm']:['wasm'],graphOptimizationLevel:'all'},(name,index,total)=>report('AI 모델 준비 중'+(device==='gpu'?' (GPU)':'')+': '+name+' ('+index+'/'+total+')'));
   await loadingHook?.(true,gpu?'gpu':'cpu');
   try{
    if(gpu){try{const output=await load('gpu');activeDevice='gpu';return output.textToSpeech}catch(e){console.warn('GPU로 AI 모델을 불러오지 못해 CPU로 바꿉니다.',e)}}
    const output=await load('cpu');activeDevice='cpu';return output.textToSpeech;
   }finally{await loadingHook?.(false)}
 })().catch(e=>{modelPromise=null;throw e});
 return modelPromise;
}
async function voiceFor(id){const safe=VOICES.some(v=>v.id===id)?id:'F1';if(!voiceStyles.has(safe)){const style=loadVoiceStyle([BASE+'/voice_styles/'+safe+'.json']);voiceStyles.set(safe,style)}try{return await voiceStyles.get(safe)}catch(e){voiceStyles.delete(safe);throw e}}
// GPU에서 계산하다 오류가 나면 CPU로 엔진을 다시 불러 같은 문장을 다시 만든다.
async function callEngine(text,style,steps,report){
 let engine=await loadLocalAI(report);
 try{return await engine.call(text,'ko',style,cleanSteps(steps),1.0,.2)}
 catch(e){if(activeDevice!=='gpu'||e?.name==='AbortError')throw e;console.warn('GPU 계산 실패, CPU로 다시 만듭니다.',e);devicePref='cpu';modelPromise=null;engine=await loadLocalAI(report);return await engine.call(text,'ko',style,cleanSteps(steps),1.0,.2)}
}
function partsForBook(book){
 const parts=[];book.blocks.forEach((block,blockIndex)=>{let text=String(block.text||'').replace(/\s+/g,' ').trim();if(!text)return;const owner=Number.isInteger(block.source)?block.source:blockIndex;
   // Preserve punctuation and ordering, with conservative chunks for Korean VITS inference.
   const sentences=text.match(/[^.!?。！？]+[.!?。！？]*|[.!?。！？]+/g)||[text];let current='';
   const add=x=>{if(x.trim())parts.push({text:x.trim(),block:owner})};
   for(let sentence of sentences){sentence=sentence.trim();while(sentence.length>105){if(current){add(current);current=''}let split=sentence.lastIndexOf(' ',105);if(split<38)split=100;add(sentence.slice(0,split));sentence=sentence.slice(split).trim()}
      if(!sentence)continue;if(current.length+sentence.length+1>105){add(current);current=''}current+=(current?' ':'')+sentence}
   if(current)add(current)
 });
 return parts;
}
export async function generateAIBackgroundAudio(book,{voiceId='F1',onProgress=()=>{},signal,maxCharacters=150000,steps=8}={}){
 if(!book?.blocks?.length)throw Error('읽을 문서가 없습니다.');
 const totalCharacters=book.blocks.reduce((n,b)=>n+String(b.text||'').length,0);
 if(totalCharacters>maxCharacters)throw Error('이 책은 '+totalCharacters.toLocaleString()+'자로, 현재 기기 내 AI 자동 변환 한도('+maxCharacters.toLocaleString()+'자)를 초과합니다. 문서를 나누어 변환해 주세요.');
 const segments=partsForBook(book);if(!segments.length)throw Error('낭독할 글이 없습니다.');
 checkAbort(signal);
 const engine=await loadLocalAI(message=>onProgress({stage:'loading',message,done:0,total:segments.length}));
 checkAbort(signal);
 const style=await voiceFor(voiceId);checkAbort(signal);
 const sampleRate=engine.sampleRate;
 // 말소리는 48kbps 모노로도 충분하다 — 강의 1시간이 약 21MB(96kbps면 두 배)라 여러 권을 기기에 담을 수 있다.
 const encoder=new window.lamejs.Mp3Encoder(1,sampleRate,48);
 const output=[],marks=[];let samples=0;const silence=new Int16Array(Math.floor(sampleRate*.22));
 const feed=pcm=>{for(let start=0;start<pcm.length;start+=11520){const encoded=encoder.encodeBuffer(pcm.subarray(start,start+11520));if(encoded.length)output.push(new Uint8Array(encoded))}};
 for(let i=0;i<segments.length;i++){
   checkAbort(signal);
   onProgress({stage:'synthesizing',message:'문장별로 AI 낭독 오디오 생성 중',done:i,total:segments.length});
   // 문단이 바뀌는 지점의 시각을 적어 둔다(재생 중 문단 따라가기·문단을 눌러 그 위치로 이동).
   if(!marks.length||marks[marks.length-1][0]!==segments[i].block)marks.push([segments[i].block,Math.round(samples/sampleRate*1000)/1000]);
   const result=await callEngine(segments[i].text,style,steps,message=>onProgress({stage:'loading',message,done:i,total:segments.length}));
   checkAbort(signal);
   const pcm=new Int16Array(result.wav.length);
   for(let j=0;j<pcm.length;j++){pcm[j]=Math.max(-32768,Math.min(32767,Math.round(result.wav[j]*32767)))}
   feed(pcm);samples+=pcm.length;if(i<segments.length-1){feed(silence);samples+=silence.length}
   await new Promise(resolve=>setTimeout(resolve,0));
 }
 const rest=encoder.flush();if(rest.length)output.push(new Uint8Array(rest));
 checkAbort(signal);
 const blob=new Blob(output,{type:'audio/mpeg'});
 if(blob.size<500)throw Error('변환 결과가 비어 있습니다.');
 onProgress({stage:'done',message:'AI 오디오 생성 완료',done:segments.length,total:segments.length});
 return {blob,voiceId,characters:totalCharacters,segmentCount:segments.length,marks,duration:samples/sampleRate};
}
// Load the model and the chosen voice ahead of time so the first live sentence starts sooner.
export async function warmUp(voiceId='F1',onProgress=()=>{}){await loadLocalAI(message=>onProgress({stage:'loading',message}));await voiceFor(voiceId);return true}
// Live narration: synthesize one short passage and hand back a playable WAV right away,
// so reading can start without preparing the whole book first.
export async function synthesizeSpeech(text,{voiceId='F1',signal,onProgress=()=>{},steps=8}={}){
 const clean=String(text||'').replace(/\s+/g,' ').trim();if(!clean)return null;
 checkAbort(signal);
 const engine=await loadLocalAI(message=>onProgress({stage:'loading',message}));
 checkAbort(signal);
 const style=await voiceFor(voiceId);checkAbort(signal);
 const result=await callEngine(clean,style,steps,message=>onProgress({stage:'loading',message}));
 checkAbort(signal);
 const blob=new Blob([writeWavFile(result.wav,engine.sampleRate)],{type:'audio/wav'});
 return {blob,duration:result.wav.length/engine.sampleRate};
}
