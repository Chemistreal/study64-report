#!/usr/bin/env node
// 여백 PC 오디오 만들기
// 글(.md/.txt) 폴더나 ZIP을 여백과 같은 AI 목소리(Supertonic-3)로 오디오로 바꾸고,
// 여백에서 + 버튼으로 가져올 'AI 오디오 꾸러미' ZIP(글 · 오디오 · 문단 위치)을 만든다.
//
//   node make-audio.mjs <글 폴더 또는 .zip> [--voice F1] [--size normal] [--steps 8] [--out 폴더] [--cpu]
//
// 여백 사이트의 ai-auto.js(음성 엔진)와 index.html(문단 나누기 규칙)을 그대로 쓰므로,
// 여기서 만든 문단 위치가 여백의 문단과 정확히 맞는다. 모델(약 380MB)은 처음 한 번 받아 ~/.yeobaek-ai 에 둔다.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';

const require=createRequire(import.meta.url);
const HERE=path.dirname(fileURLToPath(import.meta.url));
const SITE=path.resolve(HERE,'..');            // 여백 reader 폴더(ai-auto.js · index.html · vendor/)
const MODEL_DIR=process.env.YEOBAEK_MODEL_DIR||path.join(os.homedir(),'.yeobaek-ai','supertonic-3');
const PACK_PART_BYTES=140*1024*1024;
const VOICES=['F1','F2','F3','M1','M2','M3'];

function usage(msg){if(msg)console.error('\n  '+msg+'\n');console.error('사용법: node make-audio.mjs <글 폴더 또는 .zip> [--voice F1|F2|F3|M1|M2|M3] [--size small|normal|high] [--steps 5~12] [--out 폴더] [--cpu]');process.exit(msg?1:0)}
function parseArgs(argv){
 const o={voice:'F1',size:'normal',steps:8,out:null,cpu:false,input:null};
 for(let i=0;i<argv.length;i++){const a=argv[i];
  if(a==='--voice')o.voice=String(argv[++i]||'').toUpperCase();else if(a==='--size')o.size=String(argv[++i]||'');else if(a==='--steps')o.steps=Number(argv[++i]);
  else if(a==='--out')o.out=argv[++i];else if(a==='--cpu')o.cpu=true;else if(a==='-h'||a==='--help')usage();else if(!o.input)o.input=a;else usage('알 수 없는 인자: '+a)}
 if(!o.input)usage('글 폴더나 ZIP 파일을 지정해 주세요.');
 if(!VOICES.includes(o.voice))usage('목소리는 '+VOICES.join(', ')+' 중 하나입니다.');
 if(!['small','normal','high'].includes(o.size))usage('용량은 small, normal, high 중 하나입니다.');
 if(!(o.steps>=3&&o.steps<=16))o.steps=8;
 return o;
}

// 여백 index.html에서 문단 나누기 함수를 그대로 꺼내 쓴다(같은 규칙 → 같은 문단 번호).
function readerParsers(){
 const html=fs.readFileSync(path.join(SITE,'index.html'),'utf8');
 const grab=name=>{const line=html.split('\n').find(l=>l.startsWith('function '+name+'('));if(!line)throw Error('index.html에서 '+name+'을 찾지 못했습니다.');return line};
 return new Function(grab('normalizeBlocks')+'\n'+grab('blocksFromText')+'\nreturn {blocksFromText,normalizeBlocks};')();
}
function decodeText(buf){let t=new TextDecoder('utf-8').decode(buf);const bad=(t.match(/�/g)||[]).length;if(bad>Math.max(3,t.length*.005)){try{const alt=new TextDecoder('euc-kr').decode(buf);if((alt.match(/�/g)||[]).length<bad)t=alt}catch(e){}}return t.replace(/^﻿/,'')}
function bookHash(blocks){return crypto.createHash('sha256').update(blocks.map(b=>String(b.text||'')).join('\n')).digest('hex')}

// 브라우저용 엔진을 Node에서 돌리기 위한 최소한의 준비: window.ort(onnxruntime-node), window.lamejs, 모델 파일 읽기.
function loadLame(){const ctx={console,Math,Int8Array,Int16Array,Int32Array,Uint8Array,Float32Array,Float64Array,Array,Object,ArrayBuffer};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(SITE,'vendor','lame.min.js'),'utf8'),ctx);return ctx.lamejs}
async function downloadTo(url,file){
 fs.mkdirSync(path.dirname(file),{recursive:true});
 const part=file+'.part';let have=fs.existsSync(part)?fs.statSync(part).size:0;
 const res=await fetch(url,{headers:have?{Range:'bytes='+have+'-'}:{}});
 if(res.status===200&&have){have=0;fs.rmSync(part,{force:true})}else if(!res.ok&&res.status!==206)throw Error('모델 파일을 받지 못했습니다 ('+res.status+'): '+url);
 const total=have+Number(res.headers.get('content-length')||0),out=fs.createWriteStream(part,{flags:have?'a':'w'});let got=have,last=0;
 for await(const chunk of res.body){out.write(chunk);got+=chunk.length;const now=Date.now();if(now-last>700){last=now;process.stdout.write('\r  모델 받는 중 '+path.basename(file)+' '+Math.round(got/1048576)+'/'+Math.round(total/1048576)+'MB   ')}}
 await new Promise((resolve,reject)=>out.end(err=>err?reject(err):resolve()));process.stdout.write('\n');
 fs.renameSync(part,file);
}
async function localModelFetch(url){
 const rel=url.split('/resolve/main/')[1];if(!rel)return fetch(url);
 const file=path.join(MODEL_DIR,...rel.split('/'));
 if(!fs.existsSync(file))await downloadTo(url,file);
 const bytes=fs.readFileSync(file);
 return {ok:true,status:200,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),json:async()=>JSON.parse(bytes.toString('utf8'))};
}

function collectInputs(input){
 const docs=[];const okExt=new Set(['md','markdown','txt']);
 const stat=fs.statSync(input);
 if(stat.isDirectory()){
  const walk=dir=>{for(const name of fs.readdirSync(dir).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))){if(name.startsWith('.'))continue;const p=path.join(dir,name);if(fs.statSync(p).isDirectory())walk(p);else{const ext=name.split('.').pop().toLowerCase();if(okExt.has(ext))docs.push({name,ext,bytes:fs.readFileSync(p)})}}};
  walk(input);
 }else if(/\.zip$/i.test(input)){
  const JSZip=require(path.join(SITE,'vendor','jszip.min.js'));
  return JSZip.loadAsync(fs.readFileSync(input)).then(async zip=>{const out=[];for(const [name,entry] of Object.entries(zip.files).sort(([a],[b])=>a.localeCompare(b,undefined,{numeric:true}))){if(entry.dir||name.split('/').some(p=>p.startsWith('.')||p==='__MACOSX'))continue;const ext=name.split('.').pop().toLowerCase();if(okExt.has(ext))out.push({name:name.split('/').pop(),ext,bytes:Buffer.from(await entry.async('uint8array'))})}return out});
 }else{const ext=input.split('.').pop().toLowerCase();if(!okExt.has(ext))usage('지원 형식: 글 폴더, .zip, .md, .txt');docs.push({name:path.basename(input),ext,bytes:fs.readFileSync(input)})}
 return docs;
}

async function main(){
 const opt=parseArgs(process.argv.slice(2));
 const outDir=path.resolve(opt.out||path.join(process.cwd(),'yeobaek-audio-out'));fs.mkdirSync(path.join(outDir,'mp3'),{recursive:true});
 const {blocksFromText}=readerParsers();
 const docs=await collectInputs(path.resolve(opt.input));
 if(!docs.length)usage('글(.md, .txt)을 찾지 못했습니다.');
 const books=docs.map(d=>({title:d.name.replace(/\.[^.]+$/,''),type:d.ext,blocks:blocksFromText(decodeText(d.bytes),d.ext!=='txt')})).filter(b=>b.blocks.length);
 console.log('여백 PC 오디오 만들기 · 글 '+books.length+'권 · 목소리 '+opt.voice+' · 용량 '+opt.size+' · 다듬기 '+opt.steps+'단계');

 globalThis.window=globalThis;
 globalThis.ort=require('onnxruntime-node');
 globalThis.lamejs=loadLame();
 const helper=await import(pathToFileURL(path.join(SITE,'supertonic-helper.js')).href);
 const ai=await import(pathToFileURL(path.join(SITE,'ai-auto.js')).href);
 helper.configureModelFetch(localModelFetch);

 // 장치: 윈도우는 그래픽카드(DirectML) → 안 되면 CPU. 맥·리눅스·--cpu 는 CPU(모든 코어).
 const tries=opt.cpu?[['cpu']]:process.platform==='win32'?[['dml','cpu'],['cpu']]:[['cpu']];
 let device='';
 for(const eps of tries){
  ai.setExecutionProviders(eps);
  try{const t=Date.now();await ai.loadLocalAI(m=>process.stdout.write('\r  '+m+'                    '));device=eps[0]==='dml'?'GPU(DirectML)':'CPU';console.log('\n  AI 엔진 준비 완료 · '+device+' · '+((Date.now()-t)/1000).toFixed(1)+'초');break}
  catch(e){console.log('\n  '+eps.join('+')+'로 불러오지 못했습니다: '+(e.message||e));}
 }
 if(!device)throw Error('AI 엔진을 불러오지 못했습니다.');

 const items=[];let audioSec=0,workSec=0;
 for(let i=0;i<books.length;i++){
  const book=books[i],safe=book.title.replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').slice(0,120),mp3=path.join(outDir,'mp3',safe+'.mp3'),meta=mp3+'.json';
  const chars=book.blocks.reduce((n,b)=>n+b.text.length,0);
  if(fs.existsSync(mp3)&&fs.existsSync(meta)){const m=JSON.parse(fs.readFileSync(meta,'utf8'));if(m.hash===bookHash(book.blocks)&&m.voice===opt.voice&&m.size===opt.size){items.push({book,mp3,...m});console.log('['+(i+1)+'/'+books.length+'] '+book.title+' · 이미 만들어 둠, 건너뜀');continue}}
  const started=Date.now();let lastLine=0;
  const r=await ai.generateAIBackgroundAudio(book,{voiceId:opt.voice,steps:opt.steps,audio:opt.size,maxCharacters:2000000,onProgress:p=>{if(p.stage!=='synthesizing'||!p.total)return;const now=Date.now();if(now-lastLine<1000)return;lastLine=now;const done=p.done/p.total,spent=(now-started)/1000,left=done>0?spent/done-spent:0;process.stdout.write('\r['+(i+1)+'/'+books.length+'] '+book.title.slice(0,30)+' · '+Math.round(done*100)+'% · 약 '+Math.ceil(left/60)+'분 남음      ')}});
  const bytes=Buffer.from(await r.blob.arrayBuffer());fs.writeFileSync(mp3,bytes);
  const m={hash:bookHash(book.blocks),voice:opt.voice,size:opt.size,marks:r.marks,duration:r.duration};fs.writeFileSync(meta,JSON.stringify(m));
  const spent=(Date.now()-started)/1000;audioSec+=r.duration;workSec+=spent;
  console.log('\r['+(i+1)+'/'+books.length+'] '+book.title+' · '+(r.duration/60).toFixed(1)+'분 분량을 '+(spent/60).toFixed(1)+'분에 만듦 ('+(r.duration/spent).toFixed(1)+'배속) · '+(bytes.length/1048576).toFixed(1)+'MB          ');
  items.push({book,mp3,...m});
 }

 // 여백 'AI 오디오 꾸러미' ZIP(약 140MB마다 나눔): 여백에서 + 버튼으로 가져오면 같은 글에 오디오와 문단 위치가 붙는다.
 const JSZip=require(path.join(SITE,'vendor','jszip.min.js'));
 const groups=[];let group=[],size=0;
 for(const it of items){const s=fs.statSync(it.mp3).size;if(group.length&&size+s>PACK_PART_BYTES){groups.push(group);group=[];size=0}group.push(it);size+=s}
 if(group.length)groups.push(group);
 const date=new Date().toISOString().slice(0,10),packs=[];
 for(let g=0;g<groups.length;g++){
  const zip=new JSZip(),list=[];
  groups[g].forEach((it,k)=>{const p='audio/'+k+'.mp3';zip.file(p,fs.readFileSync(it.mp3));list.push({title:it.book.title,type:it.book.type,hash:it.hash,blocks:it.book.blocks,aiVoice:it.voice,name:it.book.title+' · AI '+it.voice+'.mp3',timeline:it.marks,timelineDuration:it.duration,path:p})});
  zip.file('yeobaek-ai-audio.json',JSON.stringify({format:'yeobaek-ai-audio',version:1,created:Date.now(),tool:'pc-tool',items:list}));
  const file=path.join(outDir,'yeobaek-ai-audio-'+date+(groups.length>1?'-'+(g+1)+'of'+groups.length:'')+'.zip');
  fs.writeFileSync(file,await zip.generateAsync({type:'nodebuffer',compression:'STORE'}));packs.push(file);
 }
 console.log('\n완료 · '+items.length+'권'+(audioSec?' · 새로 만든 분량 '+(audioSec/60).toFixed(0)+'분 ('+(audioSec/Math.max(1,workSec)).toFixed(1)+'배속, '+device+')':''));
 for(const f of packs)console.log('  → '+f);
 console.log('이 ZIP을 아이폰으로 보내고(에어드롭·카카오톡 나에게·iCloud) 여백에서 + 버튼으로 가져오세요.');
}
main().catch(e=>{console.error('\n오류: '+(e?.stack||e));process.exit(1)});
