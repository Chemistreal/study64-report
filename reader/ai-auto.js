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
let downloadReport=null;
async function openModelCache(){try{return typeof caches!=='undefined'?await caches.open(MODEL_CACHE):null}catch(e){return null}}
async function readWithProgress(response,name){
 const total=Number(response.headers.get('content-length'))||0;
 if(!response.body?.getReader||!total)return new Uint8Array(await response.arrayBuffer());
 let bytes=new Uint8Array(total),got=0,last=0;const reader=response.body.getReader();
 for(;;){const {done,value}=await reader.read();if(done)break;
   if(got+value.length>bytes.length){const grown=new Uint8Array(Math.max(bytes.length*2,got+value.length));grown.set(bytes.subarray(0,got));bytes=grown}
   bytes.set(value,got);got+=value.length;
   const now=Date.now();if(now-last>350){last=now;downloadReport?.(name,got,total)}}
 downloadReport?.(name,got,total);
 return got===bytes.length?bytes:bytes.slice(0,got);
}
function bytesResponse(bytes){return {ok:true,status:200,arrayBuffer:async()=>bytes.buffer.byteLength===bytes.byteLength?bytes.buffer:bytes.slice().buffer,json:async()=>JSON.parse(new TextDecoder().decode(bytes))}}
async function cachedModelFetch(url){
 const cache=await openModelCache();
 if(cache){try{const hit=await cache.match(url,{ignoreVary:true});if(hit)return hit}catch(e){}}
 const response=await fetch(url,{credentials:'omit'});
 if(!response.ok||!cache)return response;
 const bytes=/\.onnx$/.test(url)?await readWithProgress(response,url.split('/').pop()):new Uint8Array(await response.arrayBuffer());
 try{await cache.put(url,new Response(new Blob([bytes]),{headers:{'content-type':response.headers.get('content-type')||'application/octet-stream','content-length':String(bytes.byteLength)}}))}
 catch(e){console.warn('AI 모델을 기기에 저장하지 못했습니다. 다음에 다시 받습니다.',e)}
 return bytesResponse(bytes);
}
configureModelFetch(cachedModelFetch);
export async function aiModelStatus(){
 const cache=await openModelCache();if(!cache)return {supported:false,cachedFiles:0,totalFiles:MODEL_FILES.length,bytes:0};
 let cachedFiles=0,bytes=0;
 for(const url of MODEL_FILES){try{const hit=await cache.match(url,{ignoreVary:true});if(hit){cachedFiles++;bytes+=Number(hit.headers.get('content-length'))||0}}catch(e){}}
 return {supported:true,cachedFiles,totalFiles:MODEL_FILES.length,bytes};
}
export async function clearAiModel(){modelPromise=null;voiceStyles.clear();try{return typeof caches!=='undefined'&&await caches.delete(MODEL_CACHE)}catch(e){return false}}
function mb(n){return Math.round(n/1048576)}
let modelPromise=null;
const voiceStyles=new Map();
const VOICES=Object.freeze([{id:'F1',label:'미나 · 여성'},{id:'F2',label:'소라 · 여성'},{id:'F3',label:'유나 · 여성'},{id:'M1',label:'에이든 · 남성'},{id:'M2',label:'히로 · 남성'},{id:'M3',label:'레오 · 남성'}]);
export const aiVoices=VOICES;
function checkAbort(signal){if(signal?.aborted)throw new DOMException('음성 만들기가 취소되었습니다.','AbortError')}
export async function loadLocalAI(report=()=>{}){
 if(modelPromise)return modelPromise;
 if(!window.ort)throw Error('음성 추론 도구를 불러오지 못했습니다.');
 if(!window.lamejs?.Mp3Encoder)throw Error('MP3 인코딩 도구를 불러오지 못했습니다.');
 configureOrt(window.ort);
 window.ort.env.wasm.numThreads=1;
 window.ort.env.wasm.wasmPaths='https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.3/dist/';
 modelPromise=(async()=>{
   const status=await aiModelStatus().catch(()=>({cachedFiles:0,totalFiles:4}));
   const stored=status.cachedFiles===status.totalFiles;
   report(stored?'기기에 저장된 AI 모델을 불러옵니다.':'AI 음성 엔진을 받습니다. 처음 한 번만 약 380MB를 받고 기기에 저장합니다.');
   if(!stored)try{await navigator.storage?.persist?.()}catch(e){}
   downloadReport=(name,got,total)=>report('AI 모델 받는 중: '+name.replace('.onnx','')+' '+mb(got)+'/'+mb(total)+'MB');
   const output=await loadTextToSpeech(BASE+'/onnx',{executionProviders:['wasm'],graphOptimizationLevel:'all'},(name,index,total)=>report('AI 모델 준비 중: '+name+' ('+index+'/'+total+')'));
   downloadReport=null;
   return output.textToSpeech;
 })().catch(e=>{modelPromise=null;throw e});
 return modelPromise;
}
async function voiceFor(id){const safe=VOICES.some(v=>v.id===id)?id:'F1';if(!voiceStyles.has(safe)){const style=loadVoiceStyle([BASE+'/voice_styles/'+safe+'.json']);voiceStyles.set(safe,style)}try{return await voiceStyles.get(safe)}catch(e){voiceStyles.delete(safe);throw e}}
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
export async function generateAIBackgroundAudio(book,{voiceId='F1',onProgress=()=>{},signal,maxCharacters=150000}={}){
 if(!book?.blocks?.length)throw Error('읽을 문서가 없습니다.');
 const totalCharacters=book.blocks.reduce((n,b)=>n+String(b.text||'').length,0);
 if(totalCharacters>maxCharacters)throw Error('이 책은 '+totalCharacters.toLocaleString()+'자로, 현재 기기 내 AI 자동 변환 한도('+maxCharacters.toLocaleString()+'자)를 초과합니다. 문서를 나누어 변환해 주세요.');
 const segments=partsForBook(book);if(!segments.length)throw Error('낭독할 글이 없습니다.');
 checkAbort(signal);
 const engine=await loadLocalAI(message=>onProgress({stage:'loading',message,done:0,total:segments.length}));
 checkAbort(signal);
 const style=await voiceFor(voiceId);checkAbort(signal);
 const sampleRate=engine.sampleRate;
 const encoder=new window.lamejs.Mp3Encoder(1,sampleRate,96);
 const output=[],marks=[];let samples=0;const silence=new Int16Array(Math.floor(sampleRate*.22));
 const feed=pcm=>{for(let start=0;start<pcm.length;start+=11520){const encoded=encoder.encodeBuffer(pcm.subarray(start,start+11520));if(encoded.length)output.push(new Uint8Array(encoded))}};
 for(let i=0;i<segments.length;i++){
   checkAbort(signal);
   onProgress({stage:'synthesizing',message:'문장별로 AI 낭독 오디오 생성 중',done:i,total:segments.length});
   // 문단이 바뀌는 지점의 시각을 적어 둔다(재생 중 문단 따라가기·문단을 눌러 그 위치로 이동).
   if(!marks.length||marks[marks.length-1][0]!==segments[i].block)marks.push([segments[i].block,Math.round(samples/sampleRate*1000)/1000]);
   const result=await engine.call(segments[i].text,'ko',style,8,1.0,.2);
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
// Live narration: synthesize one short passage and hand back a playable WAV right away,
// so reading can start without preparing the whole book first.
export async function synthesizeSpeech(text,{voiceId='F1',signal,onProgress=()=>{}}={}){
 const clean=String(text||'').replace(/\s+/g,' ').trim();if(!clean)return null;
 checkAbort(signal);
 const engine=await loadLocalAI(message=>onProgress({stage:'loading',message}));
 checkAbort(signal);
 const style=await voiceFor(voiceId);checkAbort(signal);
 const result=await engine.call(clean,'ko',style,8,1.0,.2);
 checkAbort(signal);
 const blob=new Blob([writeWavFile(result.wav,engine.sampleRate)],{type:'audio/wav'});
 return {blob,duration:result.wav.length/engine.sampleRate};
}
