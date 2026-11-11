// 여백 PC 음성 엔진: 글 → AI 낭독 MP3(+문단 위치) → 원문+오디오 ZIP / 사이트용 꾸러미. 명령줄(make-audio.mjs)과 작업실(studio.mjs)이 함께 쓴다.
// - 문단 나누기는 여백 index.html의 함수를 그대로 쓴다(사이트와 같은 문단 번호 → 재생 중 문단 따라가기가 맞는다).
// - 목소리는 Microsoft Edge 신경망 음성 '현수'(한국어 남성). edge_book.py(파이썬 edge-tts)가 문단마다 받아 ffmpeg로 잇는다.
//   API 키는 필요 없지만 인터넷이 필요하다. 받은 문단은 파일로 남아 끊겨도 이어서 만든다.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
export const HERE=path.dirname(fileURLToPath(import.meta.url));
export const SITE=path.resolve(HERE,'..');                 // 여백 reader 폴더(index.html · vendor/)
// 설치·작업 폴더: 파이썬 음성 환경(tts-env), 작업 파일을 모두 한곳에 둔다.
// 윈도우에서 D 드라이브가 있으면 D:/yeobaek-studio, 없으면 사용자 폴더. YEOBAEK_STUDIO_DIR로 바꿀 수 있다.
export const STUDIO_ROOT=process.env.YEOBAEK_STUDIO_DIR||(process.platform==='win32'&&fs.existsSync('D:/')?'D:/yeobaek-studio':path.join(os.homedir(),'yeobaek-studio'));
export const PYTHON=process.env.YEOBAEK_PYTHON||path.join(STUDIO_ROOT,'tts-env',process.platform==='win32'?'Scripts/python.exe':'bin/python');
// 목소리는 현수(남성) 하나만 쓴다.
export const VOICE={id:'ko-KR-HyunsuMultilingualNeural',short:'Hyunsu',label:'현수 · 남성'};
// 오디오 용량 단계(말소리 기준). 32kHz는 쓰지 않는다 — 여백 리더가 예전 무음 버그 파일(MPEG-1 32kHz)로 보고 지운다.
export const PROFILES={
 tiny:{rate:8000,kbps:8,label:'최소 · 전화 음질',perHourMB:3.4},
 small:{rate:16000,kbps:16,label:'작게 · 또렷한 말소리',perHourMB:6.9},
 normal:{rate:16000,kbps:24,label:'보통',perHourMB:10.3},
 high:{rate:24000,kbps:48,label:'좋게 · 원음에 가까움',perHourMB:20.6}
};
export const DEFAULTS={speed:1.5,profile:'small',concurrency:4};
// 실측(1.3배속 7.3~8.2자/초) → 1배속 약 6자/초. 분량·용량 어림에 쓴다.
const CHARS_PER_SEC_1X=6;
export function estimate(chars,speed=DEFAULTS.speed,profile=DEFAULTS.profile){const sec=chars/(CHARS_PER_SEC_1X*speed);return {seconds:sec,bytes:sec*(PROFILES[profile]||PROFILES.small).kbps*125}}
const rateText=speed=>{const p=Math.round((speed-1)*100);return (p>=0?'+':'')+p+'%'};

// ── 글 읽기 ─────────────────────────────────────────────
let parsers=null;
export function readerParsers(){
 if(parsers)return parsers;
 const html=fs.readFileSync(path.join(SITE,'index.html'),'utf8');
 const grab=name=>{const line=html.split('\n').find(l=>l.startsWith('function '+name+'('));if(!line)throw Error('index.html에서 '+name+'을 찾지 못했습니다.');return line};
 return parsers=new Function(grab('normalizeBlocks')+'\n'+grab('blocksFromText')+'\nreturn {blocksFromText,normalizeBlocks};')();
}
export function decodeText(buf){let t=new TextDecoder('utf-8').decode(buf);const bad=(t.match(/\uFFFD/g)||[]).length;if(bad>Math.max(3,t.length*.005)){try{const alt=new TextDecoder('euc-kr').decode(buf);if((alt.match(/\uFFFD/g)||[]).length<bad)t=alt}catch(e){}}return t.replace(/^\uFEFF/,'')}
export function bookHash(blocks){return crypto.createHash('sha256').update(blocks.map(b=>String(b.text||'')).join('\n')).digest('hex')}
export const TEXT_EXTS=new Set(['md','markdown','txt']);
// 글 파일 하나 = 책 한 권(여백 서재와 같은 규칙).
export function bookFromFile(name,bytes){
 const ext=name.split('.').pop().toLowerCase();if(!TEXT_EXTS.has(ext))throw Error('지원하는 글 형식은 .md, .txt 입니다: '+name);
 const text=decodeText(bytes),blocks=readerParsers().blocksFromText(text,ext!=='txt');
 if(!blocks.length)throw Error('읽을 글이 없습니다: '+name);
 const title=path.basename(name).replace(/\.[^.]+$/,'').normalize('NFC');
 return {title,type:ext==='markdown'?'md':ext,blocks,source:{name:path.basename(name),bytes:Buffer.from(bytes)},chars:blocks.reduce((n,b)=>n+b.text.length,0),hash:bookHash(blocks)};
}

// ── 준비 상태 ───────────────────────────────────────────
export function checkSetup(){
 return new Promise(resolve=>{
  if(!fs.existsSync(PYTHON))return resolve({ok:false,message:'음성 프로그램(파이썬 환경)이 없습니다: '+PYTHON+' — setup.ps1을 실행해 주세요.'});
  const p=spawn(PYTHON,['-c','import edge_tts,imageio_ffmpeg;print(edge_tts.__version__)'],{windowsHide:true});let out='';
  p.stdout.on('data',d=>out+=d);p.on('error',()=>resolve({ok:false,message:'파이썬을 실행하지 못했습니다.'}));
  p.on('close',code=>resolve(code===0?{ok:true,message:'Edge 음성 '+out.trim()}:{ok:false,message:'edge-tts가 설치되지 않았습니다 — setup.ps1을 실행해 주세요.'}));
 });
}

// ── 책 한 권 만들기 ────────────────────────────────────
const keyOf=(book,o)=>[book.hash,VOICE.id,o.speed,o.profile,'edge1'].join('|');
const aborted=()=>Object.assign(Error('멈췄습니다. 다시 시작하면 받은 데서 이어서 만듭니다.'),{name:'AbortError'});
export async function synthesizeBook(book,{speed=DEFAULTS.speed,profile=DEFAULTS.profile,concurrency=DEFAULTS.concurrency,workDir,onProgress=()=>{},signal}={}){
 const prof=PROFILES[profile]||PROFILES.small,key=keyOf(book,{speed,profile});
 fs.mkdirSync(workDir,{recursive:true});
 // 속도가 바뀌면 받아 둔 문단을 버린다(용량 단계만 바뀌면 받은 문단은 그대로 쓰고 잇기만 다시 한다).
 const segKey=[book.hash,VOICE.id,speed].join('|'),segKeyFile=path.join(workDir,'seg-key.txt');
 let old='';try{old=fs.readFileSync(segKeyFile,'utf8')}catch(e){}
 if(old!==segKey){fs.rmSync(path.join(workDir,'seg'),{recursive:true,force:true});fs.writeFileSync(segKeyFile,segKey)}
 const segments=book.blocks.map((b,i)=>({block:i,text:b.text})).filter(s=>s.text.trim());
 fs.writeFileSync(path.join(workDir,'segments.json'),JSON.stringify(segments));
 const mp3=path.join(workDir,'audio.mp3');
 const started=Date.now();
 onProgress({stage:'start',done:0,total:segments.length});
 const result=await new Promise((resolve,reject)=>{
  if(signal?.aborted)return reject(aborted());
  const p=spawn(PYTHON,['-X','utf8',path.join(HERE,'edge_book.py'),'--segments',path.join(workDir,'segments.json'),'--workdir',workDir,'--out',mp3,'--voice',VOICE.id,'--rate',rateText(speed),'--sample-rate',String(prof.rate),'--kbps',String(prof.kbps),'--concurrency',String(concurrency)],
   {windowsHide:true,env:{...process.env,PYTHONUTF8:'1',TMP:path.join(STUDIO_ROOT,'cache','tmp'),TEMP:path.join(STUDIO_ROOT,'cache','tmp')}});
  const onAbort=()=>{p.kill();};signal?.addEventListener('abort',onAbort,{once:true});
  let buf='',done=null,error=null,errText='';
  p.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){const line=buf.slice(0,i).trim();buf=buf.slice(i+1);if(!line)continue;let m;try{m=JSON.parse(line)}catch(e){continue}
   if(m.type==='progress'){const sec=(Date.now()-started)/1000,frac=m.totalChars?m.chars/m.totalChars:m.done/m.total;
    onProgress({stage:m.stage,done:m.done,total:m.total,retries:m.retries||0,etaSec:m.stage==='synth'&&frac>0.02&&m.seconds>5?m.seconds/frac*(1-frac):null,elapsed:sec})}
   else if(m.type==='done')done=m;else if(m.type==='error')error=m.message}});
  p.stderr.on('data',d=>{errText=(errText+d).slice(-2000)});
  p.on('error',e=>reject(Error('음성 프로그램을 실행하지 못했습니다: '+e.message)));
  p.on('close',code=>{signal?.removeEventListener('abort',onAbort);
   if(signal?.aborted)return reject(aborted());
   if(done)return resolve(done);
   reject(Error(error||('음성 만들기가 중간에 멈췄습니다. '+errText.trim().split('\n').slice(-2).join(' '))))});
 });
 const r={mp3,marks:result.marks,duration:result.duration,bytes:result.bytes,profile,speed,segments:result.segments};
 fs.writeFileSync(path.join(workDir,'result.json'),JSON.stringify({...r,key}));
 onProgress({stage:'done',done:segments.length,total:segments.length});
 return r;
}
// 이미 다 만든 결과가 있으면 다시 쓴다(같은 글·속도·용량일 때만).
export function finishedResult(book,workDir,o={}){
 const opt={speed:o.speed||DEFAULTS.speed,profile:o.profile||DEFAULTS.profile};
 try{const r=JSON.parse(fs.readFileSync(path.join(workDir,'result.json'),'utf8'));if(r.key===keyOf(book,opt)&&fs.existsSync(r.mp3)&&fs.statSync(r.mp3).size===r.bytes)return r}catch(e){}
 return null;
}

// ── 결과물 ─────────────────────────────────────────────
export function manifestItem(book,r,audioPath){
 return {title:book.title,type:book.type,hash:book.hash,blocks:book.blocks,aiVoice:VOICE.short,name:book.title+' · 현수.mp3',timeline:r.marks,timelineDuration:r.duration,speed:r.speed,profile:r.profile,path:audioPath};
}
// 원문+AI 오디오 ZIP(여백 '+' 버튼으로 바로 가져오는 형식). 원문 파일도 '원문/'에 함께 넣는다.
export async function writeBookZip(book,r,file){
 const JSZip=require(path.join(SITE,'vendor','jszip.min.js'));
 const zip=new JSZip();
 zip.file('yeobaek-ai-audio.json',JSON.stringify({format:'yeobaek-ai-audio',version:1,created:Date.now(),tool:'pc-studio',items:[manifestItem(book,r,'audio/0.mp3')]}));
 zip.file('audio/0.mp3',fs.readFileSync(r.mp3));
 zip.file('원문/'+book.source.name,book.source.bytes);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,await zip.generateAsync({type:'nodebuffer',compression:'STORE'}));
 return file;
}
// 사이트(오디오 저장소)용: book.json + 오디오를 19MB 조각(audio.001.mp3 …)으로. 리더가 조각을 받아 하나로 잇는다.
export const SITE_PART_BYTES=19*1024*1024;
export function writeSiteBundle(book,r,dir,{partBytes=SITE_PART_BYTES}={}){
 fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
 const audio=fs.readFileSync(r.mp3),parts=[];
 for(let i=0,k=1;i<audio.length;i+=partBytes,k++){const name='audio.'+String(k).padStart(3,'0')+'.mp3';fs.writeFileSync(path.join(dir,name),audio.subarray(i,i+partBytes));parts.push(name)}
 const item={...manifestItem(book,r,null),audio:{parts,bytes:audio.length,type:'audio/mpeg'}};delete item.path;
 fs.writeFileSync(path.join(dir,'book.json'),JSON.stringify({format:'yeobaek-ai-audio',version:1,created:Date.now(),items:[item]}));
 fs.writeFileSync(path.join(dir,'원문.'+(book.type==='txt'?'txt':'md')),book.source.bytes);
 return {dir,parts,bytes:audio.length};
}
