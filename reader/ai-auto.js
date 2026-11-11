/*
 * Optional, on-device Korean AI audio generation for 여백.
 * Uses the MIT-licensed Supertonic browser helper (see supertonic-helper.js),
 * the independently licensed Supertone Supertonic-3 weights and lamejs (LGPL-3.0).
 * No credentials or cloud TTS endpoint are required; models are downloaded to the browser.
 * Large model (~380 MB): mobile performance varies. Audio generation must finish in foreground.
 */
import {configureOrt,loadTextToSpeech,loadVoiceStyle,writeWavFile} from './supertonic-helper.js';
const BASE='https://huggingface.co/Supertone/supertonic-3/resolve/main';
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
   report('AI 음성 엔진을 불러옵니다. 처음에는 모델 약 380MB 다운로드가 필요합니다.');
   const output=await loadTextToSpeech(BASE+'/onnx',{executionProviders:['wasm'],graphOptimizationLevel:'all'},(name,index,total)=>report('AI 모델 준비 중: '+name+' ('+index+'/'+total+')'));
   return output.textToSpeech;
 })().catch(e=>{modelPromise=null;throw e});
 return modelPromise;
}
async function voiceFor(id){const safe=VOICES.some(v=>v.id===id)?id:'F1';if(!voiceStyles.has(safe)){const style=loadVoiceStyle([BASE+'/voice_styles/'+safe+'.json']);voiceStyles.set(safe,style)}try{return await voiceStyles.get(safe)}catch(e){voiceStyles.delete(safe);throw e}}
function partsForBook(book){
 const parts=[];for(const block of book.blocks){let text=String(block.text||'').replace(/\s+/g,' ').trim();if(!text)continue;
   // Preserve punctuation and ordering, with conservative chunks for Korean VITS inference.
   const sentences=text.match(/[^.!?。！？]+[.!?。！？]*|[.!?。！？]+/g)||[text];let current='';
   const add=x=>{if(x.trim())parts.push(x.trim())};
   for(let sentence of sentences){sentence=sentence.trim();while(sentence.length>105){if(current){add(current);current=''}let split=sentence.lastIndexOf(' ',105);if(split<38)split=100;add(sentence.slice(0,split));sentence=sentence.slice(split).trim()}
      if(!sentence)continue;if(current.length+sentence.length+1>105){add(current);current=''}current+=(current?' ':'')+sentence}
   if(current)add(current)
 }
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
 const output=[];const silence=new Int16Array(Math.floor(sampleRate*.22));
 const feed=pcm=>{for(let start=0;start<pcm.length;start+=11520){const encoded=encoder.encodeBuffer(pcm.subarray(start,start+11520));if(encoded.length)output.push(new Uint8Array(encoded))}};
 for(let i=0;i<segments.length;i++){
   checkAbort(signal);
   onProgress({stage:'synthesizing',message:'문장별로 AI 낭독 오디오 생성 중',done:i,total:segments.length});
   const result=await engine.call(segments[i],'ko',style,8,1.0,.2);
   checkAbort(signal);
   const pcm=new Int16Array(result.wav.length);
   for(let j=0;j<pcm.length;j++){pcm[j]=Math.max(-32768,Math.min(32767,Math.round(result.wav[j]*32767)))}
   feed(pcm);if(i<segments.length-1)feed(silence);
   await new Promise(resolve=>setTimeout(resolve,0));
 }
 const rest=encoder.flush();if(rest.length)output.push(new Uint8Array(rest));
 checkAbort(signal);
 const blob=new Blob(output,{type:'audio/mpeg'});
 if(blob.size<500)throw Error('변환 결과가 비어 있습니다.');
 onProgress({stage:'done',message:'AI 오디오 생성 완료',done:segments.length,total:segments.length});
 return {blob,voiceId,characters:totalCharacters,segmentCount:segments.length};
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
