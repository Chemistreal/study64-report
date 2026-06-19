// ============================================================
// PRISM 자동 회귀 스위트  (prism_regression.js)
// 실행:  node prism_regression.js  [경로]
// 기본 경로: /mnt/user-data/outputs/index.html
// 종료코드: 0 = 전부 통과, 1 = 하나라도 실패
// ============================================================
const fs = require('fs');
const path = require('path');

let JSDOM;
try { ({ JSDOM } = require('jsdom')); }
catch (e) { console.error('jsdom 미설치. `npm install jsdom` 후 재실행.'); process.exit(2); }

const FILE = process.argv[2] || '/mnt/user-data/outputs/index.html';
if (!fs.existsSync(FILE)) { console.error('파일 없음:', FILE); process.exit(2); }
const HTML = fs.readFileSync(FILE, 'utf8');

// ---- 결과 집계 ----
let pass = 0, fail = 0;
const fails = [];
function ok(name)   { pass++; console.log('  \x1b[32mPASS\x1b[0m ' + name); }
function no(name, d){ fail++; fails.push(name + (d ? ' :: ' + d : '')); console.log('  \x1b[31mFAIL\x1b[0m ' + name + (d ? '  (' + d + ')' : '')); }
function check(name, cond, detail) { cond ? ok(name) : no(name, detail); }
function section(t) { console.log('\n\x1b[36m■ ' + t + '\x1b[0m'); }

// ---- 1. 정적 소스 검사 (jsdom 없이) ----
section('정적 소스');
check('파일 크기 > 200KB', Buffer.byteLength(HTML) > 200000, Math.round(Buffer.byteLength(HTML)/1024)+'KB');
const emdash = (HTML.match(/\u2014/g) || []).length;
check('em-dash 0개', emdash === 0, emdash + '개 발견');
check('questions 배열 존재', HTML.includes('const questions = ['), null);
// 96문항 파싱
const qm = HTML.match(/const questions = \[([\s\S]*?)\];/);
let QPOLE = [];
if (qm) {
  const ids = [...qm[1].matchAll(/\{id:(\d+),text:'[^']+',axis:'(\w+)',pole:'(\w+)'/g)];
  QPOLE = ids.map(m => [ +m[1], m[3] ]);
  check('문항 정확히 96개', ids.length === 96, ids.length + '개');
  check('문항 id 1~96 연속', ids[0] && +ids[0][1] === 1 && ids[95] && +ids[95][1] === 96, null);
  // 극별 8개씩
  const byPole = {};
  ids.forEach(m => { byPole[m[3]] = (byPole[m[3]] || 0) + 1; });
  const poles12 = ['deep','practice','plan','situational','self','structured','ask','solve','complete','trial','future','feedback'];
  check('12극 각 8문항', poles12.every(p => byPole[p] === 8), JSON.stringify(byPole));
} else no('questions 파싱', '정규식 불일치');

// 스크립트 블록 구문 검사 대용: 괄호/따옴표 균형은 jsdom 로드 성공으로 갈음

// ---- 2. jsdom 로드 + 런타임 ----
section('런타임 로드');
let W, D;
try {
  const dom = new JSDOM(HTML, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x.com/' });
  W = dom.window; D = W.document;
  ok('jsdom 로드 성공 (스크립트 실행)');
} catch (e) {
  no('jsdom 로드', e.message.slice(0, 80));
  finish();
}

// 비동기 초기화 대기 후 본 검사
setTimeout(runRuntimeChecks, 900);

function runRuntimeChecks() {
  // ---- 3. 전역 함수 인벤토리 ----
  section('전역 함수 존재');
  const A_FUNCS = ['prismQC_analyze','prismQCDetailOpen','prismStoreAdd','prismStoreList','prismStoreGet','prismStoreDelete','prismRecordsOpen','prismRecordsBackup','prismRecordsRestoreFile','prismCompareOpen','prismHasRetest','prismLabelOpen','prismLabelGet','prismLabelHas','prismLabelExport'];
  const B_FUNCS = ['prismTrendOpen','prismHasTrend','prismTrendExport','prismCohortOpen','prismRankOpen','prismHasCohort'];
  const OPS_FUNCS = ['prismAuditOpen','prismIntegrityCheck','prismAdminSaveNext','prismRunMigrations','prismSchemaVersion','prismRepairRecords','prismStorageUsage','prismStorageOpen','prismLabelExportCSV','prismCorrOpen'];
  const CORE = ['renderReport'];
  [...CORE, ...A_FUNCS, ...B_FUNCS, ...OPS_FUNCS].forEach(fn => {
    check('fn ' + fn, typeof W[fn] === 'function', typeof W[fn]);
  });

  // ---- 4. 리포트 렌더 ----
  section('리포트 렌더');
  const AX = ['understanding','execution','autonomy','help','errorStyle','motivation'];
  function build(p){const r={};for(const a of AX){const[L,Rr]=p[a];r[a]={left:L,right:Rr,side:L>=Rr?'left':'right',diff:Math.abs(L-Rr),chosen:'',code:''};}return r;}
  const SEOJUN = {understanding:[93,46],execution:[62,74],autonomy:[90,34],help:[38,66],errorStyle:[96,55],motivation:[41,86]};
  try {
    W.renderReport(build(SEOJUN), 'I','I','분','심','상');
    const my = D.getElementById('myCleanReport');
    check('myCleanReport 생성', !!my, null);
    check('리포트 본문 > 12000자', my && my.textContent.length > 12000, my ? my.textContent.length+'자' : '0');
    check('12극 카드 12개', D.querySelectorAll('#myCleanReport .s64pole').length === 12, D.querySelectorAll('#myCleanReport .s64pole').length+'개');
    check('트랙 적합도 행 4개', D.querySelectorAll('#s64TrackInner .s64cmpRow').length === 4, D.querySelectorAll('#s64TrackInner .s64cmpRow').length+'개');
  } catch (e) { no('renderReport 실행', e.message.slice(0,80)); }

  // ---- 5. QC 분석기 행동 ----
  section('QC 분석기 행동');
  if (typeof W.prismQC_analyze === 'function') {
    const mk = fn => { const a={}; for(let q=1;q<=96;q++) a[q]=fn(q); return a; };
    // 사람다운 정상 (극 목표 ±0, 안전하게 다양)
    const tgt = {deep:90,practice:48,plan:62,situational:74,self:88,structured:36,ask:40,solve:66,complete:92,trial:55,future:42,feedback:84};
    const human = {}; QPOLE.forEach(([id,p]) => { human[id] = Math.max(1, Math.min(5, Math.round((tgt[p]||60)/20))); });
    const rHuman = W.prismQC_analyze(human);
    check('정상응답 high', rHuman.level === 'high', rHuman.level + '/' + rHuman.reliability);
    // 직진
    const rStraight = W.prismQC_analyze(mk(_ => 4));
    check('직진응답 low', rStraight.level === 'low' && rStraight.straightRun === 96, rStraight.level + '/run' + rStraight.straightRun);
    // 극단
    const rExtreme = W.prismQC_analyze(mk(q => q % 2 ? 1 : 5));
    check('극단응답 low', rExtreme.level === 'low', rExtreme.level + '/' + rExtreme.reliability);
    // 미응답 (50)
    const partial = {}; for (let q=1;q<=50;q++) partial[q]=1+((q*3)%5);
    const rPartial = W.prismQC_analyze(partial);
    check('미응답 플래그', rPartial.flags.some(f => f.includes('미응답')), rPartial.flags.join('/'));
    // 모순쌍 12개 정의
    check('대립쌍 12개', Array.isArray(W.PRISM_QC_PAIRS) && W.PRISM_QC_PAIRS.length === 12, (W.PRISM_QC_PAIRS||[]).length+'개');
    // 모순 주입 → 강모순 12
    if (W.PRISM_QC_PAIRS) {
      const inj = Object.assign({}, human); W.PRISM_QC_PAIRS.forEach(p => { inj[p.a]=5; inj[p.b]=5; });
      const rInj = W.prismQC_analyze(inj);
      check('모순주입 contraCount 증가', rInj.contraCount >= 6, 'contra' + rInj.contraCount);
    }
  }

  // ---- 6. 저장소 라운드트립 ----
  section('저장소 (메모리 내)');
  if (typeof W.prismStoreAdd === 'function') {
    try {
      // localStorage가 jsdom에 있으면 초기화
      try { W.localStorage.removeItem('prism_records_v1'); } catch(e){}
      const a1 = {}; for(let q=1;q<=96;q++) a1[q]=1+((q*7)%5);
      const qc1 = W.prismQC_analyze(a1);
      const id1 = W.prismStoreAdd('회귀테스트A', a1, qc1);
      const id2 = W.prismStoreAdd('회귀테스트B', a1, qc1);
      const list = W.prismStoreList();
      check('저장 2건', list.length >= 2, list.length + '건');
      const got = W.prismStoreGet(id1);
      check('조회: 12극 점수 계산됨', got && got.poles && Object.keys(got.poles).length === 12, got ? Object.keys(got.poles||{}).length : 0);
      check('조회: 답안 96개 보존', got && Object.keys(got.answers).length === 96, got ? Object.keys(got.answers).length : 0);
      check('조회: qc 저장됨', got && got.qc && got.qc.reliability != null, null);
      W.prismStoreDelete(id1); W.prismStoreDelete(id2);
      check('삭제 동작', W.prismStoreList().length === 0, W.prismStoreList().length + '건 남음');
    } catch (e) { no('저장소 라운드트립', e.message.slice(0,80)); }
  }

  // ---- 7. 집계/추세/순위 함수 무결성 (빈/소수 데이터에서 죽지 않기) ----
  section('집계 함수 방어성');
  try {
    try { W.localStorage.removeItem('prism_records_v1'); } catch(e){}
    // 0건에서 hasTrend/hasCohort false
    check('0건 hasCohort false', W.prismHasCohort() === false, null);
    // 1건 추가 후
    const a = {}; for(let q=1;q<=96;q++) a[q]=2+((q*5)%3);
    W.prismStoreAdd('단일', a, W.prismQC_analyze(a));
    check('1건 hasCohort false', W.prismHasCohort() === false, '1명은 집단 아님');
    check('1건 hasRetest false', W.prismHasRetest('단일') === false, null);
    check('1건 hasTrend false', W.prismHasTrend('단일') === false, null);
    // 2건째(다른 이름) → cohort true
    W.prismStoreAdd('둘째', a, W.prismQC_analyze(a));
    check('2명 hasCohort true', W.prismHasCohort() === true, null);
    // 같은 이름 2건 → retest true, trend false
    W.prismStoreAdd('단일', a, W.prismQC_analyze(a));
    check('동일이름 2회 hasRetest true', W.prismHasRetest('단일') === true, null);
    check('동일이름 2회 hasTrend false', W.prismHasTrend('단일') === false, '3회 필요');
    W.prismStoreAdd('단일', a, W.prismQC_analyze(a));
    check('동일이름 3회 hasTrend true', W.prismHasTrend('단일') === true, null);
    try { W.localStorage.removeItem('prism_records_v1'); } catch(e){}
  } catch (e) { no('집계 방어성', e.message.slice(0,80)); }

  // ---- 8. 입력 무결성 ----
  section('입력 무결성');
  if (typeof W.prismIntegrityCheck === 'function') {
    try {
      try { W.localStorage.removeItem('prism_records_v1'); } catch(e){}
      const full = {}; for(let q=1;q<=96;q++) full[q]=3;
      check('정상 입력 경고 0', W.prismIntegrityCheck('신규학생', full).length === 0, JSON.stringify(W.prismIntegrityCheck('신규학생', full)));
      const miss = {}; for(let q=1;q<=90;q++) miss[q]=3;
      check('미입력 6개 감지', W.prismIntegrityCheck('아무개', miss).some(s=>s.includes('미입력')), null);
      W.prismStoreAdd('중복이', full, W.prismQC_analyze(full));
      check('중복 이름 감지', W.prismIntegrityCheck('중복이', full).some(s=>s.includes('이미')), null);
      check('빈 이름 경고', W.prismIntegrityCheck('', full).some(s=>s.includes('이름')), null);
      try { W.localStorage.removeItem('prism_records_v1'); } catch(e){}
    } catch (e) { no('무결성 행동', e.message.slice(0,80)); }
  }

  // ---- 9. 스키마 버저닝/복구 ----
  section('스키마 버저닝');
  if (typeof W.prismRunMigrations === 'function') {
    try {
      const ans={}; for(let q=1;q<=96;q++) ans[q]=3;
      // 깨진 레코드 주입
      W.localStorage.setItem('prism_records_v1', JSON.stringify([
        {id:'g', name:'정상', ts:Date.now(), answers:ans, poles:{deep:60,practice:60,plan:60,situational:60,self:60,structured:60,ask:60,solve:60,complete:60,trial:60,future:60,feedback:60}},
        {id:'np', name:'극없음', ts:Date.now(), answers:ans},
        {name:'아이디없음', ts:Date.now(), answers:ans, poles:{}}
      ]));
      W.localStorage.removeItem('prism_schema_version');
      const r = W.prismRunMigrations();
      const after = JSON.parse(W.localStorage.getItem('prism_records_v1'));
      check('복구 후 3건 유지', after.length === 3, after.length+'건');
      check('전부 id 보유', after.every(x=>!!x.id), null);
      check('전부 12극 보유', after.every(x=>x.poles && Object.keys(x.poles).length===12), null);
      check('극없음 재계산(3→60)', (after.find(x=>x.id==='np')||{poles:{}}).poles.deep === 60, null);
      check('버전 메타 기록', W.localStorage.getItem('prism_schema_version') === '1', W.localStorage.getItem('prism_schema_version'));
      // 객체형 손상 복구
      W.localStorage.setItem('prism_records_v1', JSON.stringify({k:{id:'o1',name:'객체',ts:Date.now(),answers:ans,poles:{}}}));
      W.prismRunMigrations();
      check('객체형 손상 배열복구', Array.isArray(JSON.parse(W.localStorage.getItem('prism_records_v1'))), null);
      W.localStorage.removeItem('prism_records_v1');
    } catch (e) { no('스키마 버저닝', e.message.slice(0,80)); }
  }

  // ---- 10. 저장 용량 측정 ----
  section('저장 용량');
  if (typeof W.prismStorageUsage === 'function') {
    try {
      try { W.localStorage.removeItem('prism_records_v1'); } catch(e){}
      const ans={}; for(let q=1;q<=96;q++) ans[q]=3;
      W.prismStoreAdd('용량A', ans, W.prismQC_analyze(ans));
      W.prismStoreAdd('용량B', ans, W.prismQC_analyze(ans));
      const u = W.prismStorageUsage();
      check('사용량: 기록 2건 측정', u.nRecords === 2, u.nRecords+'건');
      check('사용량: 바이트 > 0', u.recordsB > 0, u.recordsB+'B');
      check('사용량: total >= records', u.total >= u.recordsB, null);
      try { W.localStorage.removeItem('prism_records_v1'); } catch(e){}
    } catch (e) { no('저장 용량 측정', e.message.slice(0,80)); }
  }

  finish();
}

function finish() {
  console.log('\n' + '='.repeat(48));
  if (fail === 0) {
    console.log('\x1b[32m✓ 전부 통과: ' + pass + '개 검사\x1b[0m');
    process.exit(0);
  } else {
    console.log('\x1b[31m✗ 실패 ' + fail + '개 / 통과 ' + pass + '개\x1b[0m');
    fails.forEach(f => console.log('  - ' + f));
    process.exit(1);
  }
}
