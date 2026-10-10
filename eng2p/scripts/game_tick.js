#!/usr/bin/env node
/* 하루 끝 틱. 결과 JSONL 을 읽어 다음 날 할 일을 `Brain/next.json` 으로 낸다 (`docs/game_results.md`).
 *
 * **게임은 사실만 적고 앱이 해석한다.** 오늘이 몇 세션인지, 누가 먼저 말을 여는지,
 * 간격 복습 덱과 어제 그거 덱이 무엇인지는 앱의 셈이다. 그것을 C++ 로 다시 짜면 두 벌이 된다 (T396).
 * 그래서 이 파일은 앱의 조각(app/js/*.js 와 out/app/plays.js)을 Node 의 vm 에 읽고
 * **앱의 함수를 그대로 부른다.** 브라우저가 필요 없다. 새 셈은 하나도 없다.
 * (derive_game.js 는 브라우저로 같은 걸음을 걷는다. 이쪽이 빠르고 크로미움이 없어도 된다.
 *  둘이 같은 답을 내는지는 --selftest 의 "명목 1년" 판이 288세션으로 본다.)
 *
 * ## 읽는 것
 *
 *   --results 경로      JSONL 파일이나 폴더 (폴더는 안의 *.jsonl 을 다 읽는다). 여러 번 줄 수 있다.
 *                      방을 연 노트북(host)의 저장소와 들어온 노트북(guest)이 보낸 파일을 한꺼번에 줘도 된다.
 *   --state 파일        선택. 프로필 {"v":1,"start":"YYYY-MM-DD","nextSession":N}.
 *                      start 는 앱의 시작일(어제 그거 덱의 씨앗), nextSession 은 세션 번호의 바닥이다.
 *   --sessions 파일     기본 out/game/sessions.json. 오늘 카드와 판을 여기서 읽는다.
 *   --today 날짜        오늘. 없으면 마지막 세션 날 + 1일. **시계를 안 읽는다.**
 *   --mode 값           normal busy short 중 하나. 기본 normal. 틱은 그대로 적어 줄 뿐이다.
 *
 * ## 내는 것
 *
 *   --out 폴더          폴더/next.json 을 쓴다 (임시 파일에 쓰고 이름을 바꾼다). 없으면 표준 출력.
 *   --merge-out 파일    합친 줄을 정해진 차례로 적은 JSONL (정리용). 합친 것은 어느 입력보다 작아지지 않는다.
 *   --strict            못 읽은 줄이 하나라도 있으면 실패 (1). 기본은 알리고 넘어간다.
 *   --no-app-hash       sessions.json 의 appHash 를 지금 앱과 안 견준다 (시험용 작은 세션 파일에만).
 *
 * ## 합치기 (docs/game_results.md 6장)
 *
 *   열쇠는 (s, e). 같은 열쇠에 같은 내용이면 하나로, 다른 내용이면 충돌이다. 충돌은 정렬한 글자(canon)가
 *   더 큰 쪽이 이기고 건수를 센다. **입력 순서가 결과를 안 바꾼다.** 두 번 넣어도 같다.
 *   앱의 기록(S)을 덮지 않는다. 틱은 메모리에서 처음부터 다시 접고 next.json 만 쓴다.
 *
 * ## 종료 코드
 *   0 됐다 / 1 쓰임새나 줄이 틀렸다 / 2 환경이 안 맞다 (앱이 낡았다, 세션 파일이 없다)
 *
 * 사용법:
 *     node scripts/game_tick.js --results Results --state Brain/state.json --today 2026-11-03 --out Brain
 *     node scripts/game_tick.js --selftest
 *     node scripts/game_tick.js --regen-fixture   # 고정본 두 개를 지금 구현으로 다시 쓴다
 *
 * 고정본(tools/game/results_fixture/)을 다시 쓴 뒤에는 git diff 를 눈으로 보고
 * python3 scripts/check_game.py 의 독립 계산(파이썬이 8.4 문장으로 다시 센 값)과 같은지 본다.
 * 고정본을 자기 구현으로 다시 쓰는 것은 자기 확인이다. 그래서 다른 구현이 한 번 더 본다.
 */
"use strict";
process.env.TZ = "UTC";       // 날짜 셈이 노트북 시간대에 안 흔들리게. 첫 Date 보다 앞에 둔다

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const crypto = require("crypto");

const HERE = path.resolve(__dirname, "..");
const ROOT = path.resolve(HERE, "..");
const SESSIONS = path.join(HERE, "out", "game", "sessions.json");
const SCHEMA = path.join(HERE, "out", "game", "results_schema.json");
const FIXTURE = path.join(HERE, "tools", "game", "results_fixture");
const NEXT_VERSION = 1;

class Exit extends Error { constructor(code, msg) { super(msg); this.code = code; } }

/* ---------------------------------------------------------------- 글자 비교와 정렬 글자 */

/* 글자를 UTF-8 바이트로 견준다. C++ 와 파이썬이 같은 차례를 낸다 */
function cmp(a, b) {
  if (a === b) return 0;
  return Buffer.compare(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}
/* 정렬한 글자. 열쇠를 바이트 차례로 놓고 공백이 없다. 줄에는 정수와 글자와 참거짓뿐이라 소수가 없다 */
function canon(v) {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  return "{" + Object.keys(v).sort(cmp).map((k) => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
}
function sha256(buf) { return crypto.createHash("sha256").update(buf).digest("hex"); }
function lineHash(entries) {
  const sorted = entries.slice().sort((a, b) => cmp(a.name, b.name));
  return sha256(Buffer.from(sorted.map((e) => e.name + ":" + e.sha256 + "\n").join(""), "utf8"));
}
/* derive_game.js 의 appHash 와 같은 꼴이다. 앱 파일이 바뀌면 sessions.json 이 낡은 것이다.
   줄바꿈 CRLF 는 LF 로 바꿔서 센다 (윈도우 체크아웃이 줄바꿈을 바꿔도 같은 지문) */
function appHash() {
  const files = [["english.html", path.join(ROOT, "english.html")],
                 ["eng2p/out/app/plays.js", path.join(HERE, "out", "app", "plays.js")]];
  return lineHash(files.map(([name, f]) => ({
    name: name, sha256: sha256(Buffer.from(fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n"), "utf8")) })));
}
function writeAtomic(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}

/* ---------------------------------------------------------------- 줄 검사 (results_schema.json) */

function loadSchema(file) {
  let s;
  try { s = JSON.parse(fs.readFileSync(file || SCHEMA, "utf8")); }
  catch (e) { throw new Exit(2, "결과 모양 파일을 못 읽었다: " + (file || SCHEMA) + " (" + e.message + "). node scripts/derive_game.js 를 돌린다"); }
  return s;
}
function checkValue(v, sch, name, errs) {
  if (sch.const !== undefined && v !== sch.const) { errs.push(name + " 은 " + JSON.stringify(sch.const) + " 이어야 한다"); return; }
  if (sch.type === "integer" && !Number.isInteger(v)) { errs.push(name + " 은 정수가 아니다"); return; }
  if (sch.type === "string" && typeof v !== "string") { errs.push(name + " 은 글자가 아니다"); return; }
  if (sch.type === "boolean" && typeof v !== "boolean") { errs.push(name + " 은 참거짓이 아니다"); return; }
  if (sch.enum && !sch.enum.includes(v)) { errs.push(name + " 값 " + JSON.stringify(v) + " 이 목록 밖이다"); return; }
  if (typeof v === "number") {
    if (sch.minimum !== undefined && v < sch.minimum) errs.push(name + " 이 " + sch.minimum + " 보다 작다");
    if (sch.maximum !== undefined && v > sch.maximum) errs.push(name + " 이 " + sch.maximum + " 보다 크다");
  }
  if (typeof v === "string") {
    if (sch.pattern && !new RegExp(sch.pattern).test(v)) errs.push(name + " 꼴이 틀렸다");
    if (sch.minLength !== undefined && v.length < sch.minLength) errs.push(name + " 이 너무 짧다");
    if (sch.maxLength !== undefined && v.length > sch.maxLength) errs.push(name + " 이 너무 길다");
  }
}
function realDate(d) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return false;
  const t = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return t.getUTCFullYear() === +m[1] && t.getUTCMonth() === +m[2] - 1 && t.getUTCDate() === +m[3];
}
/* 줄 하나를 검사한다. 맞으면 null, 틀리면 이유 글자 */
function validateEvent(o, schema) {
  if (o === null || typeof o !== "object" || Array.isArray(o)) return "JSON 객체가 아니다";
  const bad = (schema["x-forbiddenKeys"] || []).filter((k) => Object.prototype.hasOwnProperty.call(o, k));
  if (bad.length) return "금지 칸 " + bad.join(" ");
  const own = (x, k) => Object.prototype.hasOwnProperty.call(x, k);
  if (typeof o.t !== "string" || !own(schema.$defs || {}, o.t)) return "모르는 줄 종류 " + JSON.stringify(o.t);
  const def = schema.$defs[o.t];
  const errs = [];
  def.required.forEach((k) => { if (!own(o, k)) errs.push(k + " 이 없다"); });
  Object.keys(o).forEach((k) => { if (!own(def.properties, k)) errs.push("모르는 칸 " + k); });
  Object.keys(def.properties).forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(o, k)) checkValue(o[k], def.properties[k], k, errs);
  });
  if (!errs.length) {
    if (o.t1 < o.t0) errs.push("t1 이 t0 보다 앞이다");
    if ((o.e[0] === "h") !== (o.device === "host")) errs.push("e 의 기기 글자와 device 가 다르다");
    if (!realDate(o.date)) errs.push("date 가 달력에 없다");
    if (o.outcome !== undefined && ((o.outcome === "skipped") !== (o.attempts === 0)))
      errs.push("skipped 이면 attempts 는 0, 아니면 1 이상이다");
  }
  return errs.length ? errs.join(" / ") : null;
}

/* ---------------------------------------------------------------- 읽기와 합치기 */

function listJsonl(p) {
  if (!fs.existsSync(p)) throw new Exit(1, "결과 경로가 없다: " + p);
  if (fs.statSync(p).isFile()) return [p];
  const out = [];
  (function walk(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach((ent) => {
      const f = path.join(d, ent.name);
      if (ent.isDirectory()) walk(f);
      else if (ent.isFile() && ent.name.endsWith(".jsonl")) out.push(f);
    });
  })(p);
  return out.sort();
}
/* 줄 글자 모음 -> 합친 결과. 입력 순서에 안 기댄다 */
function mergeLines(texts, schema) {
  const byKey = new Map();
  const st = { lines: 0, rejected: 0, rejects: [], duplicates: 0, conflicts: 0 };
  texts.forEach((t) => {
    t.text.split("\n").forEach((raw, i) => {
      const line = raw.trim();
      if (!line) return;
      st.lines++;
      let o, why;
      try { o = JSON.parse(line); why = validateEvent(o, schema); } catch (e) { why = "JSON 이 아니다"; }
      if (why) { st.rejected++; st.rejects.push(t.name + ":" + (i + 1) + " " + why); return; }
      const key = o.s + "\u0000" + o.e;
      const c = canon(o);
      let g = byKey.get(key);
      if (!g) { g = { obj: o, c: c, n: 0, forms: new Set() }; byKey.set(key, g); }
      g.n++; g.forms.add(c);
      if (cmp(c, g.c) > 0) { g.obj = o; g.c = c; }       // 충돌: 정렬한 글자가 큰 쪽이 이긴다
    });
  });
  const events = [];
  byKey.forEach((g) => {
    st.duplicates += g.n - g.forms.size;
    st.conflicts += g.forms.size - 1;
    events.push(g.obj);
  });
  events.sort((a, b) => cmp(a.t0, b.t0) || cmp(a.t1, b.t1) || (a.s - b.s) || cmp(a.e, b.e));
  return { events: events, stats: st };
}
/* 합친 줄을 적는 글. 칸 차례는 모양 파일의 properties 차례다 */
function emitJsonl(events, schema) {
  return events.map((o) => {
    const order = Object.keys(schema.$defs[o.t].properties);
    const r = {};
    order.forEach((k) => { r[k] = o[k]; });
    return JSON.stringify(r) + "\n";
  }).join("");
}
function readTexts(paths) {
  const files = [];
  paths.forEach((p) => listJsonl(p).forEach((f) => files.push(f)));
  /* 맨 앞의 BOM 은 떼고 읽는다. 윈도우 편집기가 붙인다 */
  return files.map((f) => ({ name: path.relative(process.cwd(), f) || f, text: fs.readFileSync(f, "utf8").replace(/^\uFEFF/, "") }));
}

/* ---------------------------------------------------------------- 앱의 머리 (vm) */

const NEED = ["markCardRun", "markCardStuck", "dueCards", "cardOne", "cardSet", "cardRanDays", "addDays",
              "roleOf", "rclDeck", "rclDays", "ranOn", "roundOrder", "roundSeed", "playRec"];
function makeBrain() {
  const E = HERE;
  const order = fs.readFileSync(path.join(E, "app", "order.txt"), "utf8").split("\n")
    .map((l) => l.trim().split(/\s+/)[0])
    .filter((f) => f && !f.startsWith("#") && f.startsWith("js/") && f !== "js/20_docs.js");
  /* 화면이 없다. 붙잡는 자리는 다 빈 껍데기로 받는다. 그리는 함수는 한 번도 안 부른다 */
  const el = () => new Proxy(function () {}, {
    get: (t, k) => (k === Symbol.toPrimitive ? () => "" : el()), set: () => true, apply: () => el() });
  const store = {};
  const ctx = {
    console: console, Math: Math, Date: Date, JSON: JSON, setTimeout: () => 0, clearTimeout() {},
    setInterval: () => 0, clearInterval() {},
    localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); },
                    removeItem: (k) => { delete store[k]; } },
    navigator: { userAgent: "node" }, location: { href: "file:///x", protocol: "file:", search: "", hash: "" },
    addEventListener() {}, removeEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame: () => 0, alert() {}, confirm: () => true,
  };
  ctx.window = ctx; ctx.self = ctx;
  ctx.document = { getElementById: () => el(), querySelector: () => el(), querySelectorAll: () => [],
    createElement: () => el(), head: { appendChild() {} }, body: el(), documentElement: el(),
    addEventListener() {}, visibilityState: "visible", fonts: { ready: Promise.resolve() } };
  vm.createContext(ctx);
  const errs = [];
  const run = (rel, f) => {
    try { vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: rel }); }
    catch (e) { errs.push(rel + ": " + e.message); }
  };
  order.forEach((f) => run(f, path.join(E, "app", f)));
  run("out/app/plays.js", path.join(E, "out", "app", "plays.js"));
  run("out/data/cards.js", path.join(E, "out", "data", "cards.js"));
  if (errs.length) throw new Exit(2, "앱 조각을 읽다가 멈췄다: " + errs.slice(0, 3).join(" / "));
  const lack = NEED.filter((n) => typeof ctx[n] !== "function");
  if (lack.length || !ctx.window.ENG2P_CARDS) throw new Exit(2, "앱에서 못 찾은 것: " + lack.concat(ctx.window.ENG2P_CARDS ? [] : ["ENG2P_CARDS"]).join(" "));
  ctx.DATA.cards = ctx.window.ENG2P_CARDS;
  return new Brain(ctx);
}

const SYN0 = "2000-01-01";   // 어제 그거를 세션 수로 세려고 쓰는 가짜 달력의 0일
class Brain {
  constructor(ctx) {
    this.ctx = ctx;
    this.origRanOn = ctx.ranOn;
    this.byOutcome = { pass: "up", near: "hold", miss: "down", skipped: "none" };
    this.dayCache = [];
  }
  /* 앱 기록을 비운다. 틱은 매번 처음부터 접는다 */
  reset(start) {
    const S = this.ctx.S;
    S.start = start; S.cardDue = {}; S.rhit = {}; S.days = {}; S.device = null;
  }
  setToday(d) { this.ctx.today = () => d; }
  /* 카드 줄 하나. 사다리를 앱의 함수로 움직인다.
     up 은 markCardRun, down 은 markCardStuck 그대로다. hold 만 앱에 없어서 앱의 조각 함수로 조립한다 */
  applyCard(e) {
    const act = this.byOutcome[e.outcome];
    if (act === undefined) throw new Exit(1, "outcome " + e.outcome + " 이 spacing.byOutcome 에 없다");
    if (act === "none") return;
    const C = this.ctx;
    this.setToday(e.date);
    const sides = e.seat === "team" ? ["a", "b"] : [e.seat];
    sides.forEach((side) => {
      C.S.device = side;
      if (act === "up") C.markCardRun(e.id, 0);
      else if (act === "down") C.markCardStuck(e.id);
      else if (act === "hold") this.holdRung(e.id);
      else throw new Exit(1, "모르는 사다리 동작 " + act);
    });
    C.S.device = null;
  }
  /* 돈 날만 적고 칸을 그대로 둔다. markCardRun 과 같은 가지를 따라간다 */
  holdRung(id) {
    const C = this.ctx, td = C.today(), L = C.SPACING;
    const cur = C.cardOne(id), hist = C.cardRanDays(cur, td);
    const box = cur && cur.box ? cur.box : 0;
    if (box > 0 && cur.due && cur.due > td) C.cardSet(id, { box: box, due: cur.due, ran: td, hist: hist });
    else if (box >= L.length) C.cardSet(id, { box: box, due: null, ran: td, hist: hist });
    else { const b = Math.max(1, box); C.cardSet(id, { box: b, due: C.addDays(td, L[b - 1]), ran: td, hist: hist }); }
  }
  /* 오늘 다시 낼 카드. 두 사람 것의 합집합이다. 오늘 카드는 뺀다 (derive_game.js 와 같은 걸음) */
  review(today, own) {
    const C = this.ctx, set = new Set(own || []), out = new Set();
    this.setToday(today);
    ["a", "b"].forEach((side) => {
      C.S.device = side;
      C.dueCards().forEach((id) => { if (!set.has(id)) out.add(id); });
    });
    C.S.device = null;
    return [...out].sort();
  }
  /* 한 번이라도 돈 카드 */
  known() {
    const m = this.ctx.S.cardDue, out = new Set();
    Object.keys(m).forEach((id) => { const c = m[id]; if (c && (c.a || c.b)) out.add(id); });
    return out;
  }
  /* 사람별 칸을 그대로 내보낸다 (시험용) */
  ledger() {
    const m = this.ctx.S.cardDue, out = {};
    Object.keys(m).sort().forEach((id) => {
      const c = m[id], one = (r) => (r ? { box: r.box, due: r.due, ran: r.ran, stuck: r.stuck | 0 } : null);
      out[id] = { a: one(c.a), b: one(c.b) };
    });
    return out;
  }
  /* 세션 번호 s 에서 먼저 말을 여는 사람. 앱의 roleOf 를 부른다.
     roleOf 는 날짜를 받아 앞선 정상 날을 센다. 정상 날을 s-1 개 깔아 놓고 그 뒤 날을 묻는다 */
  seatA(s) {
    const C = this.ctx;
    while (this.dayCache.length < s) this.dayCache.push(C.addDays(SYN0, this.dayCache.length));
    const keep = C.S.days, days = {};
    for (let i = 0; i < s - 1; i++) days[this.dayCache[i]] = { status: "normal" };
    C.S.days = days;
    const r = C.roleOf("2999-12-31");
    C.S.days = keep;
    return r;
  }
  /* 어제 그거. 앱의 rclDeck 을 그대로 부른다.
     앱은 돈 카드를 달력 날로 센다. 게임은 못 한 카드를 세션 수로 센다.
     그래서 달력 대신 가짜 달력(세션 하나가 하루)을 놓고 ranOn 만 결과 기록으로 바꿔 끼운다.
     rclDeck 이 섞는 차례는 앱의 roundOrder 와 roundSeed 가 정한다 */
  recall(s, missBy, dateOf, rule) {
    const C = this.ctx;
    const syn = (k) => C.addDays(SYN0, k);
    /* 같은 카드를 여러 세션에서 못 했으면 가장 가까운 세션 몫으로 한 번만 든다. 앱의 rclDeck 은 날마다 따로 뽑아서
       그대로 두면 열 장 덱에 같은 카드가 두 번 나온다 (맨 아래 칸에서 되풀이해 못 한 카드가 흔하다) */
    const pool = {}, taken = new Set();
    rule.back.slice().sort((a, b) => a - b).forEach((n) => {
      const k = s - n;
      if (k >= 1) {
        const ids = [...(missBy.get(k) || [])].sort().filter((id) => !taken.has(id));
        ids.forEach((id) => taken.add(id));
        pool[syn(k)] = ids;
      }
    });
    C.ranOn = (d) => (pool[d] || []).slice();
    this.setToday(syn(s));
    C.S.rhit = {}; C.S.device = null;
    let deck;
    try { deck = C.rclDeck({ end: rule.max }); }
    finally { C.ranOn = this.origRanOn; }
    return deck.map((x) => ({ id: x.id, n: x.n, s: s - x.n, d: dateOf.get(s - x.n) || null }));
  }
}

/* ---------------------------------------------------------------- 접기 */

function addDay(d, n) {
  const t = new Date(Date.parse(d + "T00:00:00Z") + n * 86400000);
  return t.toISOString().slice(0, 10);
}
/* 합친 줄 -> 세션 장부 */
function ledgerOf(events) {
  const done = new Set(), dates = new Map(), lastDate = new Map(), missBy = new Map();
  let maxDate = null;
  events.forEach((e) => {
    if (maxDate === null || e.date > maxDate) maxDate = e.date;
    if (!lastDate.has(e.s) || e.date > lastDate.get(e.s)) lastDate.set(e.s, e.date);
    /* 방을 연 노트북이 기준이다. 들어온 노트북의 session_end 는 세션을 끝낸 것으로 안 센다 */
    if (e.t === "session_end" && e.device === "host" && e.ended === "done" && e.mode === "normal") {
      done.add(e.s); dates.set(e.s, e.date);
    }
  });
  return { done: done, dateOf: new Map([...lastDate, ...dates]), maxDate: maxDate, missBy: missBy };
}

function computeNext(events, sessionsFile, state, opts) {
  const brain = opts.brain || makeBrain();
  const rule = (sessionsFile.runtime || {}).recallRule;
  if (!rule || !Array.isArray(rule.back) || !rule.max) throw new Exit(2, "sessions.json 에 runtime.recallRule 이 없다. node scripts/derive_game.js 를 돌린다");
  const by = (sessionsFile.spacing || {}).byOutcome;
  if (!by) throw new Exit(2, "sessions.json 에 spacing.byOutcome 이 없다. node scripts/derive_game.js 를 돌린다");
  brain.byOutcome = by;
  const S = sessionsFile.sessions || [];
  const L = ledgerOf(events);
  const start = (state && state.start) || sessionsFile.start;

  /* 카드 줄을 정해진 차례로 접는다: 시각, 줄 번호 차례. 입력 순서와 상관없다 */
  brain.reset(start);
  const cards = events.filter((e) => e.t === "card_run");
  cards.forEach((e) => {
    brain.applyCard(e);
    if (rule.outcomes.includes(e.outcome)) {
      if (!L.missBy.has(e.s)) L.missBy.set(e.s, new Set());
      L.missBy.get(e.s).add(e.id);
    }
  });

  const through = L.done.size ? Math.max(...L.done) : 0;
  const floor = (state && state.nextSession) || 1;
  const s = Math.max(floor, through + 1);
  const gaps = [];
  for (let k = 1; k <= through; k++) if (!L.done.has(k)) gaps.push(k);
  let today = opts.today;
  if (!today) {
    if (!L.maxDate) throw new Exit(1, "결과가 비어 있어서 오늘을 알 수 없다. --today 를 준다");
    today = addDay(L.maxDate, 1);
  }
  if (!realDate(today)) throw new Exit(1, "--today 가 날짜가 아니다: " + today);
  const row = S[s - 1] || null;
  const own = row ? row.cards : [];
  const review = brain.review(today, own);
  const seen = brain.known(), ownSet = new Set(own), unseen = new Set();
  for (let k = 1; k <= Math.min(through, S.length); k++)
    (S[k - 1].cards || []).forEach((id) => { if (!seen.has(id) && !ownSet.has(id)) unseen.add(id); });
  const pick = row ? row.pick : null;
  const recall = pick === "recall" ? brain.recall(s, L.missBy, L.dateOf, rule) : [];

  return {
    v: NEXT_VERSION,
    today: today,
    s: s,
    through: through,
    gaps: gaps,
    finished: s > S.length,
    seatA: brain.seatA(s),
    mode: opts.mode || "normal",
    pick: pick,
    recall: recall,
    review: review,
    unseen: [...unseen].sort(),
    appHash: sessionsFile.appHash || null,
    merge: opts.merge || null,
  };
}

/* ---------------------------------------------------------------- 명령줄 */

function parseArgs(argv) {
  const a = { results: [], state: null, sessions: SESSIONS, today: null, mode: "normal", out: null,
              mergeOut: null, strict: false, noAppHash: false, selftest: false, regen: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], nx = () => { if (i + 1 >= argv.length) throw new Exit(1, k + " 뒤에 값이 없다"); return argv[++i]; };
    if (k === "--results") a.results.push(nx());
    else if (k === "--state") a.state = nx();
    else if (k === "--sessions") a.sessions = nx();
    else if (k === "--today") a.today = nx();
    else if (k === "--mode") a.mode = nx();
    else if (k === "--out") a.out = nx();
    else if (k === "--merge-out") a.mergeOut = nx();
    else if (k === "--strict") a.strict = true;
    else if (k === "--no-app-hash") a.noAppHash = true;
    else if (k === "--selftest") a.selftest = true;
    else if (k === "--regen-fixture") a.regen = true;
    else if (k === "--help" || k === "-h") a.help = true;
    else throw new Exit(1, "모르는 인자 " + k);
  }
  if (!["normal", "busy", "short"].includes(a.mode)) throw new Exit(1, "--mode 는 normal busy short 중 하나다");
  return a;
}
function readJson(f, what) {
  try { return JSON.parse(fs.readFileSync(f, "utf8")); }
  catch (e) { throw new Exit(f === SESSIONS ? 2 : 1, what + " 을 못 읽었다: " + f + " (" + e.message + ")"); }
}
function loadSessions(file, noAppHash) {
  const sf = readJson(file, "세션 파일");
  const schema = loadSchema();
  if (sf.schemaVersion !== schema.version)
    throw new Exit(2, "세션 파일 schemaVersion " + sf.schemaVersion + " 과 결과 모양 version " + schema.version + " 이 다르다");
  if (!noAppHash) {
    const now = appHash();
    if (sf.appHash !== now)
      throw new Exit(2, "세션 파일이 낡았다. 만든 앱 " + String(sf.appHash).slice(0, 12) + " / 지금 앱 " + now.slice(0, 12) +
                        ". node scripts/derive_game.js 를 돌린다");
  }
  return { sf: sf, schema: schema };
}
function runCli(a) {
  if (!a.results.length) throw new Exit(1, "--results 를 준다");
  const { sf, schema } = loadSessions(a.sessions, a.noAppHash);
  const state = a.state ? readJson(a.state, "프로필") : null;
  if (state && state.v !== 1) throw new Exit(1, "프로필 v 가 1 이 아니다");
  const merged = mergeLines(readTexts(a.results), schema);
  const st = merged.stats;
  st.rejects.slice(0, 5).forEach((r) => console.error("[못 읽은 줄] " + r));
  if (st.rejected > 5) console.error("[못 읽은 줄] 외 " + (st.rejected - 5) + "줄");
  if (a.strict && st.rejected) throw new Exit(1, "못 읽은 줄이 " + st.rejected + "줄 있다");
  const next = computeNext(merged.events, sf, state, {
    today: a.today, mode: a.mode,
    merge: { lines: st.lines, events: merged.events.length, duplicates: st.duplicates, conflicts: st.conflicts, rejected: st.rejected },
  });
  const text = JSON.stringify(next, null, 1) + "\n";
  if (a.mergeOut) writeAtomic(a.mergeOut, emitJsonl(merged.events, schema));
  if (a.out) { writeAtomic(path.join(a.out, "next.json"), text); console.error("next.json: 세션 " + next.s + " 자리A " + next.seatA + " 복습 " + next.review.length + " 어제그거 " + next.recall.length); }
  else process.stdout.write(text);
}

/* ---------------------------------------------------------------- 시험 (--selftest) */

/* 작은 세션표는 카드와 판만 든다. 규칙(회상 규칙, 사다리 규칙)은 진짜 세션 파일 것을 그대로 쓴다 */
function composeMini(sf) {
  const m = JSON.parse(fs.readFileSync(path.join(FIXTURE, "sessions.mini.json"), "utf8"));
  return Object.assign(m, { schemaVersion: sf.schemaVersion, runtime: sf.runtime, spacing: sf.spacing, appHash: sf.appHash });
}
const FIXTURE_TODAY = "2026-11-16";
function regenFixture() {
  const { sf, schema } = loadSessions(SESSIONS, false);
  const texts = ["host.jsonl", "guest.jsonl"].map((f) => ({ name: f, text: fs.readFileSync(path.join(FIXTURE, f), "utf8") }));
  const m = mergeLines(texts, schema);
  if (m.stats.rejected) throw new Exit(1, "고정본에 못 읽는 줄이 있다: " + m.stats.rejects.slice(0, 3).join(" / "));
  const state = JSON.parse(fs.readFileSync(path.join(FIXTURE, "state.json"), "utf8"));
  const next = computeNext(m.events, composeMini(sf), state, { today: FIXTURE_TODAY, merge: {
    lines: m.stats.lines, events: m.events.length, duplicates: m.stats.duplicates, conflicts: m.stats.conflicts, rejected: m.stats.rejected } });
  fs.writeFileSync(path.join(FIXTURE, "expected_merged.jsonl"), emitJsonl(m.events, schema));
  fs.writeFileSync(path.join(FIXTURE, "expected_next.json"), JSON.stringify(next, null, 1) + "\n");
  console.log("고정본을 다시 썼다: expected_merged.jsonl " + m.events.length + "줄 / expected_next.json 세션 " + next.s);
  return 0;
}

function selftest() {
  let n = 0;
  const fail = [];
  const ok = (name, cond, why) => { n++; if (cond) console.log("[통과] " + name); else { fail.push(name); console.log("[실패] " + name + (why ? ": " + why : "")); } };
  const eq = (a, b) => canon(a) === canon(b);

  const { sf, schema } = loadSessions(SESSIONS, false);
  const brain = makeBrain();
  const fx = (f) => fs.readFileSync(path.join(FIXTURE, f), "utf8");
  const host = fx("host.jsonl"), guest = fx("guest.jsonl");
  const state = JSON.parse(fx("state.json"));
  const mini = composeMini(sf);
  const T = (t) => mergeLines(t.map((x, i) => ({ name: "t" + i, text: x })), schema);
  const base0 = () => T([host, guest]);
  const nextOf = (texts, today) => {
    const m = T(texts);
    return computeNext(m.events, mini, state, { today: today, brain: brain,
      merge: { lines: m.stats.lines, events: m.events.length, duplicates: m.stats.duplicates, conflicts: m.stats.conflicts, rejected: m.stats.rejected } });
  };

  /* 1. 줄 검사. 맞는 줄은 통과하고 틀린 줄 열여덟은 이유와 함께 걸린다 */
  const good = JSON.parse(host.split("\n").find((l) => l.includes('"t":"card_run"')));
  ok("맞는 줄은 통과한다", validateEvent(good, schema) === null, validateEvent(good, schema));
  const mut = (name, f) => { const o = JSON.parse(JSON.stringify(good)); f(o); const why = validateEvent(o, schema); ok("틀린 줄을 거른다: " + name, why !== null); };
  mut("받아쓴 글 칸 text", (o) => { o.text = "hello"; });
  mut("받아쓴 글 칸 transcript", (o) => { o.transcript = "hello"; });
  mut("누가 말했나 칸 who", (o) => { o.who = "a"; });
  mut("사람별 점수 칸 score", (o) => { o.score = 3; });
  mut("소리 경로 칸 audio", (o) => { o.audio = "rec/x.wav"; });
  mut("outcome 이 목록 밖", (o) => { o.outcome = "ok"; });
  mut("옛 outcome retry_pass", (o) => { o.outcome = "retry_pass"; });
  mut("via 가 목록 밖", (o) => { o.via = "mic"; });
  mut("device 가 목록 밖", (o) => { o.device = "laptop"; });
  mut("seat 가 목록 밖", (o) => { o.seat = "c"; });
  mut("e 꼴이 틀림", (o) => { o.e = "x1"; });
  mut("칸이 빠짐 attempts", (o) => { delete o.attempts; });
  mut("t1 이 t0 보다 앞", (o) => { o.t1 = "2000-01-01T00:00:00Z"; });
  mut("e 기기 글자와 device 가 다름", (o) => { o.device = o.device === "host" ? "guest" : "host"; });
  mut("없는 날짜", (o) => { o.date = "2026-02-30"; });
  mut("skipped 인데 attempts 1", (o) => { o.outcome = "skipped"; o.attempts = 1; });
  mut("카드 id 꼴", (o) => { o.id = "Q9-001"; });
  mut("v 가 2", (o) => { o.v = 2; });
  mut("s 가 글자", (o) => { o.s = "1"; });
  mut("모르는 줄 종류", (o) => { o.t = "voice"; });
  const life = JSON.parse(host.split("\n").find((l) => l.includes('"t":"session_start"')));
  { const o = JSON.parse(JSON.stringify(life)); o.seat = "a"; ok("틀린 줄을 거른다: 세션 시작 줄에 사람 자리", validateEvent(o, schema) !== null); }

  /* 1b. 나들이 줄 (결과 모양 개정 2, docs/game_results.md 4.15). 맞는 줄은 통과하고 틀린 줄은 걸리며 합쳐도 안 사라진다 */
  { const outText = fx("outing.jsonl");
    const outObjs = outText.split("\n").filter(Boolean).map((l) => JSON.parse(l));
    ok("나들이 고정 줄이 다 통과한다 (outing_turn 과 activity kind outing)", outObjs.length >= 5 && outObjs.every((o) => validateEvent(o, schema) === null),
       outObjs.map((o) => validateEvent(o, schema)).filter(Boolean).join(" / "));
    const turn = outObjs.find((o) => o.t === "outing_turn"), mis = outObjs.find((o) => o.t === "activity");
    const mutO = (name, base, f) => { const o = JSON.parse(JSON.stringify(base)); f(o); ok("틀린 나들이 줄을 거른다: " + name, validateEvent(o, schema) !== null); };
    mutO("미션 id 대문자", turn, (o) => { o.mission = "Eggs"; });
    mutO("차례 0", turn, (o) => { o.turn = 0; });
    mutO("차례 100", turn, (o) => { o.turn = 100; });
    mutO("outing_turn 에 block 칸", turn, (o) => { o.block = 0; });
    mutO("outing_turn 에 미션 id 빠짐", turn, (o) => { delete o.mission; });
    mutO("outing_turn 에 말한 글 칸 say", turn, (o) => { o.say = "Two, please."; });
    mutO("skipped 인데 attempts 1", turn, (o) => { o.outcome = "skipped"; o.attempts = 1; });
    mutO("activity block 5", mis, (o) => { o.block = 5; });
    mutO("activity kind 가 목록 밖", mis, (o) => { o.kind = "outings"; });
    mutO("activity ref 41자", mis, (o) => { o.ref = "a".repeat(41); });
    const rest = T([host, guest, outText]);
    ok("나들이 줄을 합쳐도 안 사라지고 버려지지 않는다", rest.stats.rejected === 0 && rest.events.length === base0().events.length + outObjs.length);
    ok("나들이 줄이 있어도 next.json 이 같다 (틱은 읽지 않는다)", (() => { const a = Object.assign({}, nextOf([host, guest, outText], FIXTURE_TODAY)), b = nextOf([host, guest], FIXTURE_TODAY); delete a.merge; const c = Object.assign({}, b); delete c.merge; return canon(a) === canon(c); })());
    ok("합친 글에서 나들이 줄 칸 차례가 모양 파일의 차례다", emitJsonl(rest.events, schema).split("\n").filter((l) => l.includes('"outing_turn"')).every((l) => /^\{"v":1,"t":"outing_turn","s":\d+,"e":"[^"]+","device":"[a-z]+","seat":"[a-z]+","date":"[^"]+","t0":"[^"]+","t1":"[^"]+","mission":"[a-z0-9_]+","turn":\d+,"outcome":"[a-z]+","via":"[a-z]+","attempts":\d+,"repairs":\d+\}$/.test(l))); }

  /* 2. 합치기 법칙 */
  const base = T([host, guest]);
  const hl = host.split("\n").filter(Boolean), gl = guest.split("\n").filter(Boolean);
  const shuffled = (arr, seed) => { const a = arr.slice(); let x = seed; for (let i = a.length - 1; i > 0; i--) { x = (x * 1103515245 + 12345) % 2147483647; const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const outOf = (m) => emitJsonl(m.events, schema);
  const golden = fx("expected_merged.jsonl");
  ok("합친 결과가 고정본과 같다 (expected_merged.jsonl)", outOf(base) === golden);
  ok("두 번 넣어도 같다 (멱등)", outOf(T([host, guest, host, guest])) === golden);
  ok("자기 자신을 합쳐도 같다", outOf(T([outOf(base)])) === golden);
  ok("host 와 guest 를 바꿔도 같다 (교환)", outOf(T([guest, host])) === golden);
  ok("줄 순서를 섞어도 같다", outOf(T([shuffled(hl.concat(gl), 7).join("\n")])) === golden && outOf(T([shuffled(gl.concat(hl), 99).join("\n")])) === golden);
  ok("나눠 합쳐도 같다 (결합)", outOf(T([outOf(T([host])), guest])) === golden && outOf(T([host, outOf(T([guest]))])) === golden);
  { const hk = T([host]).events.length, gk = T([guest]).events.length;
    ok("합친 것이 어느 입력보다 작지 않다 (덮지 않는다)", base.events.length >= Math.max(hk, gk) && base.events.length === hk + gk,
       "host " + hk + " guest " + gk + " 합 " + base.events.length); }
  { const bad = hl.slice(); const k = bad.findIndex((l) => l.includes('"t":"card_run"'));
    const o = JSON.parse(bad[k]); o.outcome = o.outcome === "pass" ? "miss" : "pass"; o.attempts = o.attempts || 1;
    const twin = JSON.stringify(o);
    const a = T([hl.join("\n"), twin]), b = T([twin, hl.join("\n")]);
    ok("같은 열쇠에 다른 내용이면 충돌 1건을 세고 순서와 상관없이 같은 쪽이 이긴다",
       a.stats.conflicts === 1 && b.stats.conflicts === 1 && outOf(a) === outOf(b)); }
  { const m = T([host + '{"v":1,"t":"card_run"}\nnot json\n', guest]);
    ok("못 읽은 줄은 세고 나머지는 그대로 합친다", m.stats.rejected === 2 && outOf(m) === golden); }

  /* 3. 틱: 고정본과 같고, 입력을 어떻게 줘도 같다 */
  const TODAY = FIXTURE_TODAY;
  const nx = nextOf([host, guest], TODAY);
  const goldenNext = fx("expected_next.json");
  ok("next.json 이 고정본과 같다 (expected_next.json)", JSON.stringify(nx, null, 1) + "\n" === goldenNext);
  const core = (x) => { const y = Object.assign({}, x); delete y.merge; return canon(y); };
  ok("두 번 넣어도 next.json 이 같다 (merge 건수만 다르다)", core(nextOf([host, guest, host, guest], TODAY)) === core(nx));
  ok("파일 순서를 바꿔도 next.json 이 같다", core(nextOf([guest, host], TODAY)) === core(nx));
  ok("줄을 섞어도 next.json 이 같다", core(nextOf([shuffled(hl.concat(gl), 5).join("\n")], TODAY)) === core(nx));
  ok("합친 파일로 다시 틱을 돌려도 같다 (내보내고 다시 읽기)", core(nextOf([golden], TODAY)) === core(nx));
  ok("guest 가 늦게 와도 합쳐지고 나서는 같다", core(nextOf([host, guest], TODAY)) === core(nextOf([guest, host, guest], TODAY)));
  ok("guest 가 안 온 날은 host 몫만으로 낸다 (다른 답이 나와야 한다)", core(nextOf([host], TODAY)) !== core(nx));
  ok("결과를 안 주고 틱을 돌려도 안 죽는다 (1일차)", (() => { const x = computeNext([], mini, state, { today: "2026-11-02", brain: brain }); return x.s === 1 && x.seatA === "a" && x.review.length === 0 && x.recall.length === 0; })());

  /* 3b. 명령줄로 돌린다. 입력 폴더를 안 건드리고 next.json 하나만 쓴다. guest 가 늦게 와도 합쳐진다 */
  { const os = require("os");
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tick-"));
    const res = path.join(tmp, "Results"), outDir = path.join(tmp, "Brain"), gdir = path.join(res, "guest");
    const hf = path.join(res, "20261102100000_s001_host.jsonl"), gf = path.join(gdir, "20261102100000_s001_guest.jsonl");
    const sess = path.join(tmp, "sessions.json"), st = path.join(tmp, "state.json");
    fs.mkdirSync(gdir, { recursive: true });
    fs.writeFileSync(hf, host); fs.writeFileSync(sess, JSON.stringify(mini)); fs.writeFileSync(st, fx("state.json"));
    const quiet = (f) => { const e = console.error; console.error = () => {}; try { return f(); } finally { console.error = e; } };
    const cli = (extra) => quiet(() => runCli(parseArgs(["--results", res, "--state", st, "--sessions", sess, "--no-app-hash",
                                                         "--today", TODAY, "--out", outDir].concat(extra || []))));
    cli();                                                          // guest 가 아직 안 보낸 날
    const hostOnly = fs.readFileSync(path.join(outDir, "next.json"), "utf8");
    fs.writeFileSync(gf, guest);                                    // guest 가 늦게 보냈다
    const hb = fs.readFileSync(hf), gb = fs.readFileSync(gf);
    cli(["--merge-out", path.join(tmp, "merged.jsonl")]);
    ok("guest 가 늦게 보내면 다음 틱에 합쳐진다 (그 전에는 host 몫만)", hostOnly !== goldenNext && fs.readFileSync(path.join(outDir, "next.json"), "utf8") === goldenNext);
    ok("입력 파일을 안 건드린다 (덮지 않는다)", Buffer.compare(fs.readFileSync(hf), hb) === 0 && Buffer.compare(fs.readFileSync(gf), gb) === 0);
    ok("쓴 것은 next.json 하나뿐이다 (임시 파일이 안 남는다)", eq(fs.readdirSync(outDir), ["next.json"]));
    ok("--merge-out 이 고정된 합친 글과 같다", fs.readFileSync(path.join(tmp, "merged.jsonl"), "utf8") === golden);
    fs.writeFileSync(path.join(gdir, "again.jsonl"), guest);        // 같은 파일을 한 번 더 보냈다
    cli();
    ok("같은 파일을 또 받아도 next.json 이 같다 (파일 이름은 열쇠가 아니다)", fs.readFileSync(path.join(outDir, "next.json"), "utf8").replace(/"lines": \d+/, "").replace(/"duplicates": \d+/, "") ===
       goldenNext.replace(/"lines": \d+/, "").replace(/"duplicates": \d+/, ""));
    fs.writeFileSync(path.join(gdir, "bad.jsonl"), '{"v":1,"t":"card_run","s":1}\n');
    let code = 0; try { cli(["--strict"]); } catch (e) { code = e.code; }
    ok("--strict 는 못 읽은 줄이 있으면 1 로 선다", code === 1);
    const stale = path.join(tmp, "stale.json");
    fs.writeFileSync(stale, JSON.stringify(Object.assign({}, mini, { appHash: "0".repeat(64) })));
    let code2 = 0; try { quiet(() => runCli(parseArgs(["--results", res, "--sessions", stale, "--today", TODAY, "--out", outDir]))); } catch (e) { code2 = e.code; }
    ok("앱 지문이 다른(낡은) 세션 파일로는 틱이 2 로 선다", code2 === 2);
    fs.rmSync(tmp, { recursive: true, force: true }); }

  /* 4. 사다리. 손으로 센 값과 견준다 (카드 하나, 사람 a). 날짜는 2026-11-02 부터 */
  const ev = (d, outcome, seat) => ({ t: "card_run", s: 1, e: "h", id: "Q1-001", outcome: outcome, seat: seat || "a", date: d });
  const walk = (list) => { brain.reset("2026-08-10"); list.forEach((x) => brain.applyCard(x)); const c = brain.ledger()["Q1-001"] || {}; return c.a ? [c.a.box, c.a.due, c.a.ran, c.a.stuck] : null; };
  ok("새 카드를 통과하면 1칸, 다음 날", eq(walk([ev("2026-11-02", "pass")]), [1, "2026-11-03", "2026-11-02", 0]));
  ok("제 날에 통과하면 2칸, 3일 뒤", eq(walk([ev("2026-11-02", "pass"), ev("2026-11-03", "pass")]), [2, "2026-11-06", "2026-11-03", 0]));
  ok("제 날 전에 통과하면 칸을 안 올린다", eq(walk([ev("2026-11-02", "pass"), ev("2026-11-03", "pass"), ev("2026-11-04", "pass")]), [2, "2026-11-06", "2026-11-04", 0]));
  ok("못 하면 한 칸 내리고 그 칸의 날수 뒤", eq(walk([ev("2026-11-02", "pass"), ev("2026-11-03", "pass"), ev("2026-11-06", "miss")]), [1, "2026-11-07", "2026-11-03", 1]));
  ok("새 카드를 못 하면 1칸, 다음 날 (맨 아래 칸은 1일)", eq(walk([ev("2026-11-02", "miss")]), [1, "2026-11-03", null, 1]));
  ok("near 는 칸을 그대로 두고 그 칸의 날수 뒤", eq(walk([ev("2026-11-02", "pass"), ev("2026-11-03", "pass"), ev("2026-11-06", "near")]), [2, "2026-11-09", "2026-11-06", 0]));
  ok("새 카드가 near 면 1칸", eq(walk([ev("2026-11-02", "near")]), [1, "2026-11-03", "2026-11-02", 0]));
  ok("제 날 전의 near 는 날짜를 안 건드린다", eq(walk([ev("2026-11-02", "pass"), ev("2026-11-03", "pass"), ev("2026-11-04", "near")]), [2, "2026-11-06", "2026-11-04", 0]));
  ok("skipped 는 아무것도 안 바꾼다", walk([ev("2026-11-02", "skipped")]) === null && eq(walk([ev("2026-11-02", "pass"), ev("2026-11-03", "skipped")]), [1, "2026-11-03", "2026-11-02", 0]));
  ok("맨 위 칸을 돌면 끝난다 (120일 칸)", (() => {
    let d = "2026-11-02"; const list = [ev(d, "pass")];
    [1, 3, 7, 21, 60].forEach((n) => { d = addDay(d, n); list.push(ev(d, "pass")); });
    d = addDay(d, 120); list.push(ev(d, "pass"));
    const r = walk(list); return r && r[0] === 6 && r[1] === null; })());
  ok("team 줄은 두 사람 모두에게 움직이고 a 줄은 a 에게만 움직인다", (() => {
    brain.reset("2026-08-10"); brain.applyCard(ev("2026-11-02", "pass", "team")); brain.applyCard(ev("2026-11-03", "pass", "a"));
    const c = brain.ledger()["Q1-001"]; return c.a.box === 2 && c.b.box === 1; })());

  /* 5. 명목 1년. 다 통과한 기록을 틱으로 접으면 derive_game.js 가 브라우저로 뽑은 review 와 288세션 모두 같다 */
  { brain.reset(sf.start);
    let bad = [];
    sf.sessions.forEach((x) => {
      const got = brain.review(x.date, x.cards);
      if (!eq(got, x.review)) bad.push(x.s);
      x.cards.concat(x.review).forEach((id) => brain.applyCard({ t: "card_run", id: id, outcome: "pass", seat: "team", date: x.date }));
    });
    ok("명목 1년: 다 통과한 기록의 review 가 sessions.json 288세션과 같다", bad.length === 0, "다른 세션 " + bad.slice(0, 6).join(" ")); }

  /* 5b. 어제 그거는 같은 카드를 두 번 안 담는다. 1세션 전과 3세션 전과 7세션 전에 다 못 한 카드는 가장 가까운 쪽 한 번이다 */
  { const rule = sf.runtime.recallRule;
    const miss = new Map([[26, new Set(["Q1-001", "Q1-002", "Q1-003"])], [24, new Set(["Q1-001", "Q1-004"])], [20, new Set(["Q1-001", "Q1-002", "Q1-005"])]]);
    const dates = new Map([[26, "2026-12-02"], [24, "2026-11-30"], [20, "2026-11-25"]]);
    brain.reset(sf.start);
    const deck = brain.recall(27, miss, dates, rule), ids = deck.map((x) => x.id);
    const by = {}; deck.forEach((x) => { by[x.id] = x.n; });
    ok("어제 그거: 같은 카드를 두 번 못 해도 덱에는 한 번, 가장 가까운 세션 몫으로 든다",
       deck.length === 5 && new Set(ids).size === 5 && by["Q1-001"] === 1 && by["Q1-002"] === 1 && by["Q1-003"] === 1 && by["Q1-004"] === 3 && by["Q1-005"] === 7,
       JSON.stringify(deck)); }

  /* 6. 먼저 말을 여는 사람. 앱의 roleOf 로 낸 288개와 규칙이 같고 틱의 답도 같다 */
  { const rv = sf.roleVectors || [], rr = sf.roleRule || {};
    const viaRule = (s) => (s % 2 === 1 ? rr.odd : rr.even);
    ok("roleVectors 288개가 규칙(session_parity)과 같다", rv.length === 288 && rr.kind === "session_parity" && rv.every((v, i) => v.s === i + 1 && v.A === viaRule(v.s)));
    let bad = 0; for (let s = 1; s <= 288; s++) if (brain.seatA(s) !== rv[s - 1].A) bad++;
    ok("틱이 앱의 roleOf 로 센 자리가 288세션 모두 같다", bad === 0, bad + "개 다르다"); }

  console.log("\n틱 시험 " + n + "판 / 실패 " + fail.length);
  return fail.length ? 1 : 0;
}

/* ---------------------------------------------------------------- 들어가는 곳 */

function main() {
  const a = parseArgs(process.argv.slice(2));
  if (a.help) { console.log("사용법은 이 파일 머리말에 있다: scripts/game_tick.js"); return 0; }
  if (a.selftest) return selftest();
  if (a.regen) return regenFixture();
  runCli(a);
  return 0;
}
if (require.main === module) {
  try { process.exitCode = main(); }
  catch (e) {
    if (e instanceof Exit) { console.error("[실패] " + e.message); process.exitCode = e.code; }
    else { console.error("[실패] 틱이 멈췄다: " + (e && e.stack || e)); process.exitCode = 2; }
  }
}
module.exports = { canon, cmp, validateEvent, mergeLines, emitJsonl, computeNext, makeBrain, lineHash, appHash, loadSchema };
