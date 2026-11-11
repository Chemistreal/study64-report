'use strict';
// 여백 PC 오디오 만들기(reader/pc-tool/make-audio.mjs)는 여백 index.html에서 문단 나누기 함수를 한 줄째 꺼내 쓴다.
// index.html이 바뀌어도 그 두 함수가 한 줄로 남아 있고, 꺼낸 함수가 화면과 같은 문단을 만드는지 확인한다.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'reader/index.html'),'utf8');
const grab=name=>html.split('\n').find(l=>l.startsWith('function '+name+'('));
for(const name of ['normalizeBlocks','blocksFromText'])assert.ok(grab(name),name+' must stay a single top-level line in reader/index.html (pc-tool reads it)');
const {blocksFromText}=new Function(grab('normalizeBlocks')+'\n'+grab('blocksFromText')+'\nreturn {blocksFromText};')();
const blocks=blocksFromText('# 제목\n\n첫 문단입니다.\n\n- 목록 하나\n\n'+'긴 문장입니다. '.repeat(120),true);
assert.deepEqual(blocks.slice(0,3).map(b=>b.kind),['heading','paragraph','list']);
assert.ok(blocks.length>=4&&blocks.every(b=>b.text.length<=900),'long paragraphs are split the same way as the reader');
for(const f of ['ai-auto.js','supertonic-helper.js','vendor/lame.min.js','vendor/jszip.min.js'])assert.ok(fs.existsSync(path.join(root,'reader',f)),'pc-tool needs reader/'+f);
const help=execFileSync(process.execPath,[path.join(root,'reader/pc-tool/make-audio.mjs'),'--help'],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
assert.equal(help,'');
console.log('여백 PC 오디오 만들기: 문단 규칙 공유 · 필요한 파일 · 도움말 PASS');
