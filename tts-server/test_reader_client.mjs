import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../reader/index.html', import.meta.url),'utf8');
const inline=source.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(inline,'Inline reader script should exist');
new Function(inline[1]);

const titleSource=inline[1].match(/function autoTitleFromText\(raw\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(titleSource,'Auto-title extractor should exist');
const autoTitle=new Function(titleSource+';return autoTitleFromText;')();
assert.equal(autoTitle('# 인공지능 낭독\n\n본문입니다.'),'인공지능 낭독');
assert.equal(autoTitle('제목: 독서의 기술\n내용'),'독서의 기술');
assert.equal(autoTitle('Title: Korean Reading\nBody'),'Korean Reading');
assert.equal(autoTitle('  \n'),'');

const names=['savedStreamJob','rememberStreamJob','forgetStreamJob'];
const sessionFunctions=names.map(name=>{
  const line=inline[1].split('\n').find(row=>row.startsWith('function '+name+'('));
  assert.ok(line,'Missing '+name);
  return line;
}).join('\n');
const memory=new Map();
const storage={
  getItem:k=>memory.get(k)??null,
  setItem:(k,v)=>memory.set(k,String(v)),
  removeItem:k=>memory.delete(k)
};
const sessionTools=new Function('sessionStorage','Date',
  'const STREAM_SESSION_KEY="yeobaek-active-stream-v1";'+sessionFunctions+
  ';return {savedStreamJob,rememberStreamJob,forgetStreamJob};'
)(storage,Date);
const job={bookId:'book-1',base:'https://tts.example.com',jobId:'A'.repeat(38)};
sessionTools.rememberStreamJob(job);
assert.equal(sessionTools.savedStreamJob(job.bookId,job.base)?.jobId,job.jobId);
assert.equal(sessionTools.savedStreamJob(job.bookId,'https://other.example.com'),null);
assert.equal(sessionTools.savedStreamJob('book-2',job.base),null);
sessionTools.forgetStreamJob('other-id');
assert.ok(sessionTools.savedStreamJob(job.bookId,job.base),'Another session must not be removed');
sessionTools.forgetStreamJob(job.jobId);
assert.equal(sessionTools.savedStreamJob(job.bookId,job.base),null);
sessionTools.rememberStreamJob(job);
const key='yeobaek-active-stream-v1';
const expired=JSON.parse(storage.getItem(key));
expired.created=Date.now()-56*60*1000;
storage.setItem(key,JSON.stringify(expired));
assert.equal(sessionTools.savedStreamJob(job.bookId,job.base),null);
assert.match(inline[1],/async function restoreComposerDraft\(\)/);
assert.match(inline[1],/async function saveComposerDraft\(\)/);
assert.match(inline[1],/async function playWithoutStream\(\)/);
console.log('Reader JavaScript, title inference, stream resume and autosave contract: PASS');
