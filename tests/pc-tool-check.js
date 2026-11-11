'use strict';
// 여백 작업실(reader/pc-tool): PC에서 글 → Edge '현수' 목소리 MP3 → 원문+오디오 ZIP / 오디오 저장소 꾸러미.
// 인터넷·파이썬 없이 확인할 수 있는 것만 본다: 문단 규칙 공유, 사이트용 조각 나누기·잇기, ZIP 구성, 추천 글 목록, 도움말, 설치 스크립트.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),tool=path.join(root,'reader/pc-tool');
(async()=>{
 // 1) 문단 나누기: 작업실은 index.html의 두 함수를 한 줄째 꺼내 쓴다 → 리더와 같은 문단 번호(재생 중 문단 따라가기).
 const html=fs.readFileSync(path.join(root,'reader/index.html'),'utf8');
 const grab=name=>html.split('\n').find(l=>l.startsWith('function '+name+'('));
 for(const name of ['normalizeBlocks','blocksFromText'])assert.ok(grab(name),name+' must stay a single top-level line in reader/index.html (pc-tool reads it)');
 const E=await import(pathToFileURL(path.join(tool,'engine.mjs')).href);
 const P=await import(pathToFileURL(path.join(tool,'publish.mjs')).href);
 const text='# 시험 책\n\n첫 문단입니다.\n\n- 목록 하나\n\n'+'긴 문장입니다. '.repeat(120);
 const book=E.bookFromFile('시험 책.md',Buffer.from(text));
 assert.deepEqual(book.blocks.slice(0,3).map(b=>b.kind),['heading','paragraph','list']);
 assert.ok(book.blocks.length>=4&&book.blocks.every(b=>b.text.length<=900),'long paragraphs are split the same way as the reader');
 assert.equal(book.hash,require('node:crypto').createHash('sha256').update(book.blocks.map(b=>b.text).join('\n')).digest('hex'),'hash = reader bookHash');
 assert.equal(E.VOICE.id,'ko-KR-HyunsuMultilingualNeural');assert.equal(E.DEFAULTS.speed,1.5);
 for(const p of Object.values(E.PROFILES))assert.notEqual(p.rate,32000,'32kHz MP3 is treated as the old silent-audio bug by the reader');
 // 2) 사이트용 꾸러미: MP3를 조각으로 나눠도 이으면 원본과 같다 · book.json에 글·시간표·조각 목록
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'yb-tool-'));
 try{
  const mp3=path.join(tmp,'audio.mp3'),bytes=Buffer.from(Array.from({length:2500},(_,i)=>i*7%251));fs.writeFileSync(mp3,bytes);
  const r={mp3,marks:book.blocks.map((b,i)=>[i,i*1.5]),duration:book.blocks.length*1.5,bytes:bytes.length,speed:1.5,profile:'small'};
  const site=path.join(tmp,'site'),id=P.bookId(book.hash),dir=path.join(site,'books',id);
  const bundle=E.writeSiteBundle(book,r,dir,{partBytes:1000});
  assert.deepEqual(bundle.parts,['audio.001.mp3','audio.002.mp3','audio.003.mp3']);
  assert.ok(Buffer.concat(bundle.parts.map(p=>fs.readFileSync(path.join(dir,p)))).equals(bytes),'parts join back to the same MP3');
  const manifest=JSON.parse(fs.readFileSync(path.join(dir,'book.json'),'utf8'));
  assert.equal(manifest.format,'yeobaek-ai-audio');const item=manifest.items[0];
  assert.equal(item.hash,book.hash);assert.equal(item.blocks.length,book.blocks.length);assert.equal(item.aiVoice,'Hyunsu');
  assert.deepEqual(item.audio,{parts:bundle.parts,bytes:bytes.length,type:'audio/mpeg'});assert.equal(item.timeline.length,book.blocks.length);
  assert.ok(fs.existsSync(path.join(dir,'원문.md')));
  // 3) 추천 글 목록(index.json): 넣기·같은 책 다시 넣으면 바꾸기·내리기
  P.addToShelf(site,{id,title:book.title,manifest:'books/'+id+'/book.json',bytes:bytes.length,duration:r.duration});
  P.addToShelf(site,{id,title:book.title+' 새판',manifest:'books/'+id+'/book.json',bytes:bytes.length,duration:r.duration});
  let shelf=P.readShelf(site);assert.equal(shelf.format,'yeobaek-audio-shelf');assert.equal(shelf.items.length,1);assert.equal(shelf.items[0].title,book.title+' 새판');
  assert.ok(P.dirBytes(site)>=bytes.length);
  P.removeFromShelf(site,id);shelf=P.readShelf(site);assert.equal(shelf.items.length,0);assert.ok(!fs.existsSync(dir));
  // 4) 원문+오디오 ZIP: 여백 + 버튼 형식(yeobaek-ai-audio.json · audio/0.mp3 · 원문/)
  const zipFile=path.join(tmp,'out','시험 책.zip');await E.writeBookZip(book,r,zipFile);
  const JSZip=require(path.join(root,'reader/vendor/jszip.min.js'));const zip=await JSZip.loadAsync(fs.readFileSync(zipFile));
  assert.ok(zip.file('yeobaek-ai-audio.json')&&zip.file('audio/0.mp3')&&zip.file('원문/시험 책.md'));
  const zm=JSON.parse(await zip.file('yeobaek-ai-audio.json').async('string'));assert.equal(zm.items[0].path,'audio/0.mp3');
  assert.ok(Buffer.from(await zip.file('audio/0.mp3').async('uint8array')).equals(bytes));
 }finally{fs.rmSync(tmp,{recursive:true,force:true})}
 // 5) 명령줄 도움말(표준 출력은 비어 있고 안내는 표준 오류로) · 문법 · 설치 스크립트는 영문만(웹에서 irm | iex 로 받을 때 한글이 깨지지 않게)
 const help=execFileSync(process.execPath,[path.join(tool,'make-audio.mjs'),'--help'],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
 assert.equal(help,'');
 for(const f of ['studio.mjs','publish.mjs','make-audio.mjs'])execFileSync(process.execPath,['--check',path.join(tool,f)]);
 const ps=fs.readFileSync(path.join(tool,'setup.ps1'),'utf8');assert.ok(!/[^\x00-\x7f]/.test(ps),'setup.ps1 must be ASCII only');
 for(const f of ['engine.mjs','publish.mjs','studio.mjs','studio.html','make-audio.mjs','edge_book.py','studio.cmd'])assert.ok(ps.includes('pc-tool/'+f),'setup.ps1 downloads pc-tool/'+f);
 try{execFileSync(process.platform==='win32'?'py':'python3',[...(process.platform==='win32'?['-3']:[]),'-c','import ast,sys;ast.parse(open(sys.argv[1],encoding="utf-8").read())',path.join(tool,'edge_book.py')],{stdio:'ignore'})}catch(e){if(e.code!=='ENOENT')throw Error('edge_book.py has a Python syntax error')}
 console.log('여백 작업실: 문단 규칙 공유 · 조각 나누기/잇기 · ZIP · 추천 글 목록 · 도움말 · 설치 스크립트 PASS');
})().catch(e=>{console.error(e);process.exit(1)});
