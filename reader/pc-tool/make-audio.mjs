#!/usr/bin/env node
// 여백 PC 오디오 만들기(명령줄): 글(.md/.txt) 파일·폴더·ZIP → 책마다 '원문+AI 오디오 ZIP'.
// 만든 ZIP은 여백에서 + 버튼으로 가져오면 글·오디오·문단 위치가 함께 붙는다. 화면으로 쓰려면 studio.mjs(작업실)를 쓴다.
//
//   node make-audio.mjs <글 파일·폴더·ZIP> [--speed 1.5] [--size small] [--jobs 4] [--out 폴더]
//
// 목소리: Microsoft Edge 신경망 음성 '현수'(인터넷 필요, API 키 없음). 파일 하나 = 책 한 권.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import * as E from './engine.mjs';

const require=createRequire(import.meta.url);
function usage(msg){
 if(msg)console.error('\n  '+msg+'\n');
 console.error('사용법: node make-audio.mjs <글 파일·폴더·ZIP> [--speed 0.8~2.0] [--size '+Object.keys(E.PROFILES).join('|')+'] [--jobs 1~10] [--out 폴더]');
 process.exit(msg?1:0);
}
function parseArgs(argv){
 const o={speed:E.DEFAULTS.speed,size:E.DEFAULTS.profile,jobs:E.DEFAULTS.concurrency,out:null,input:null};
 for(let i=0;i<argv.length;i++){const a=argv[i];
  if(a==='--speed')o.speed=Number(argv[++i]);else if(a==='--size')o.size=String(argv[++i]||'');
  else if(a==='--jobs')o.jobs=Number(argv[++i]);else if(a==='--out')o.out=argv[++i];else if(a==='-h'||a==='--help')usage();else if(!o.input)o.input=a;else usage('알 수 없는 인자: '+a)}
 if(!o.input)usage('글 파일·폴더·ZIP을 지정해 주세요.');
 if(!E.PROFILES[o.size])usage('용량은 '+Object.keys(E.PROFILES).join(', ')+' 중 하나입니다.');
 if(!(o.speed>=.8&&o.speed<=2))usage('속도는 0.8~2.0 사이입니다.');
 o.jobs=Math.max(1,Math.min(10,Math.round(o.jobs)||4));
 return o;
}
async function collectBooks(input){
 const files=[];const stat=fs.statSync(input);
 if(stat.isDirectory()){const walk=d=>{for(const n of fs.readdirSync(d).sort((a,b)=>a.localeCompare(b,'ko',{numeric:true}))){if(n.startsWith('.'))continue;const p=path.join(d,n);if(fs.statSync(p).isDirectory())walk(p);else if(E.TEXT_EXTS.has(n.split('.').pop().toLowerCase()))files.push([n,fs.readFileSync(p)])}};walk(input)}
 else if(/\.zip$/i.test(input)){const JSZip=require(path.join(E.SITE,'vendor','jszip.min.js'));const zip=await JSZip.loadAsync(fs.readFileSync(input));
  for(const [n,entry] of Object.entries(zip.files).sort(([a],[b])=>a.localeCompare(b,'ko',{numeric:true}))){if(entry.dir||n.split('/').some(p=>p.startsWith('.')||p==='__MACOSX'))continue;if(E.TEXT_EXTS.has(n.split('.').pop().toLowerCase()))files.push([n.split('/').pop(),Buffer.from(await entry.async('uint8array'))])}}
 else files.push([path.basename(input),fs.readFileSync(input)]);
 return files.map(([n,b])=>E.bookFromFile(n,b));
}
async function main(){
 const o=parseArgs(process.argv.slice(2));
 const setup=await E.checkSetup();if(!setup.ok)usage(setup.message);
 const books=await collectBooks(path.resolve(o.input));if(!books.length)usage('글(.md, .txt)을 찾지 못했습니다.');
 const out=path.resolve(o.out||path.join(E.STUDIO_ROOT,'out'));
 console.log('여백 PC 오디오 만들기 · '+books.length+'권 · '+E.VOICE.label+' · '+o.speed+'배속 · '+E.PROFILES[o.size].label+' · 동시 '+o.jobs);
 for(let i=0;i<books.length;i++){
  const b=books[i],work=path.join(E.STUDIO_ROOT,'cli-work',b.hash.slice(0,16)),est=E.estimate(b.chars,o.speed,o.size);
  console.log('['+(i+1)+'/'+books.length+'] '+b.title+' · '+b.chars.toLocaleString()+'자 · 예상 '+(est.seconds/3600).toFixed(1)+'시간 · 약 '+Math.round(est.bytes/1048576)+'MB');
  let last=0;
  const r=E.finishedResult(b,work,{speed:o.speed,profile:o.size})||await E.synthesizeBook(b,{speed:o.speed,profile:o.size,concurrency:o.jobs,workDir:work,onProgress:p=>{
   const now=Date.now();if(now-last<2000&&p.stage==='synth')return;last=now;
   process.stdout.write('\r   '+(p.stage==='joining'?'MP3로 잇는 중 ':'받는 중 ')+p.done+'/'+p.total+(p.etaSec?' · 약 '+Math.ceil(p.etaSec/60)+'분 남음':'')+(p.retries?' · 다시 받음 '+p.retries:'')+'        ')}});
  const zip=path.join(out,b.title.replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').slice(0,120)+'.zip');await E.writeBookZip(b,r,zip);
  console.log('\r   완료 · '+(r.duration/3600).toFixed(2)+'시간 · MP3 '+(r.bytes/1048576).toFixed(1)+'MB → '+zip+'          ');
 }
 console.log('이 ZIP을 아이폰으로 보내고(에어드롭·카카오톡 나에게·iCloud) 여백에서 + 버튼으로 가져오세요.');
}
main().catch(e=>{console.error('\n오류: '+(e?.message||e));process.exit(1)});
