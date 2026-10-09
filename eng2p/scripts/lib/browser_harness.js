/* 브라우저 검사의 공용 하네스.
 *
 * 검사 마흔여섯 개가 크로미움 경로를 제각각 박았고 (마흔세 벌), 첫 화면에 이름을 넣는
 * 줄이 아홉 벌, 띄우고 열고 기다리는 줄이 마흔여섯 벌 복사돼 있었다. 그리고 고치는 손이
 * 한 번에 한 파일씩이라 건너뜀 처리가 파일마다 갈렸다 (`[건너뜀]` 을 찍는 것이 서른 개 남짓,
 * 말만 하고 표지가 없는 것이 넷). 이 파일이 그 자리를 한곳에 모은다.
 *
 * ## 하는 일 다섯
 *
 * 1. **도구 찾기.** `CHROMIUM_PATH` `PLAYWRIGHT_MODULE` `NODE_PATH` 를 여기서만 읽는다.
 *    못 찾으면 `skip()` 이다.
 * 2. **건너뜀을 통과로 세지 않는다.** 건너뛰면 `[건너뜀] 까닭` 을 찍고 **종료 코드 77** 로 나간다.
 *    0 이 아니다. `all.py` 가 이것을 실패로 센다. 일부러 건너뛰려면
 *    `ENG2P_ALLOW_SKIP=1` (all.py 의 `--allow-skip` 이 켠다). 그때만 0 이다.
 * 3. **시계를 쥔다.** 컨텍스트마다 시계를 고정한 날로 놓는다. 흐르기는 흐른다 (멈추지 않는다).
 *    진짜 날짜를 읽는 검사가 요일마다, 자정마다 붉어지던 길을 닫는다 (T276, T396-7, J단계).
 *    방식은 둘이다. `clock: "pw"` (기본) 는 Playwright `context.clock.install` 이고
 *    `clock: "date"` 는 `Date` 만 옮긴다 (타이머와 `performance` 를 안 건드린다. 재는 검사용).
 *    `clock: false` 는 진짜 시계다 (자정 검사가 제 시계를 따로 쥔다).
 * 4. **고정 잠을 준비 신호로 바꾼다.** `page.waitForTimeout(ms)` 가 **ms 를 자고 나서** 앱이 읽고
 *    있는 자료 (`pending`) 가 다 올 때까지 더 기다린다. 부하가 걸려 늦게 그려지는 화면을
 *    "그려졌으리라 믿고" 지나가던 자리가 여기서 닫힌다. 하한은 그대로 ms 라 전보다 덜 기다리지는 않는다.
 *    `idle` `waitText` `waitFn` 은 직접 쓰는 길이다.
 * 5. **첫 화면.** `onboard()` 가 비우고 이름을 넣고 기기를 정하고 다시 연다.
 *
 * ## 쓰는 법
 *
 *     const H = require("./lib/browser_harness");
 *     const { chromium, CHROME, PAGE } = H.need("말투");      // 못 찾으면 여기서 끝난다
 *     const browser = await chromium.launch({ executablePath: CHROME });
 *     const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
 *     const page = await ctx.newPage();                       // 시계와 기다림이 이미 걸려 있다
 *     await H.onboard(page);
 *
 * 규격: docs/pipeline.md
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ENG = path.resolve(__dirname, "..", "..");          // eng2p
const ROOT = path.resolve(ENG, "..");                     // 저장소 뿌리 (english.html 이 있다)
const PAGE = "file://" + path.join(ROOT, "english.html");
const SKIP_CODE = 77;                                     // automake 의 "건너뜀"
const DEFAULT_CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

/* 시계를 놓는 날. **수요일 낮 열두 시 (기계의 지역 시각).** 일요일은 쉬는 날이라 피하고
   월말과 분기 경계에서 멀다. 낮 열두 시라 지역이 UTC 에서 열한 시간 안쪽으로 달라도 날짜가 같다.
   `ENG2P_PIN=2026-10-12T12:00` 으로 바꿔 요일마다 돌려 볼 수 있다 (요일 스윕). */
const PIN_DEFAULT = "2026-10-14T12:00:00";
function pinMs() {
  const raw = process.env.ENG2P_PIN || PIN_DEFAULT;
  const t = new Date(raw).getTime();          // 시간대 표시가 없으면 기계의 지역 시각이다
  if (!isFinite(t)) throw new Error("ENG2P_PIN 을 읽을 수 없다: " + raw);
  return t;
}

/* ------------------------------------------------------------------ 도구 찾기 */

function findChromium() {
  const want = process.env.CHROMIUM_PATH || DEFAULT_CHROME;
  return fs.existsSync(want) ? want : null;
}

function loadPlaywright() {
  /* **명시한 이름은 그것만 쓴다.** `PLAYWRIGHT_MODULE=nope` 인데 슬쩍 다른 것을 찾아 돌면
     "도구가 없는 기계" 를 시험할 길이 없다. 안 적었을 때만 흔한 이름 둘을 찾는다.
     (노드는 이 파일의 조상 폴더의 node_modules 도 뒤진다. NODE_PATH 가 없어도 찾는 까닭이다) */
  const names = process.env.PLAYWRIGHT_MODULE
    ? [process.env.PLAYWRIGHT_MODULE] : ["playwright-core", "playwright"];
  for (const n of names) {
    try { return { chromium: require(n).chromium, name: n }; } catch (e) { /* 다음 */ }
  }
  return null;
}

/* 건너뛴다. **통과가 아니다.** 종료 코드 77. `ENG2P_ALLOW_SKIP=1` 일 때만 0. */
function skip(label, why) {
  console.log("[건너뜀] " + why);
  console.log(label + " 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(process.env.ENG2P_ALLOW_SKIP === "1" ? 0 : SKIP_CODE);
}

/* ------------------------------------------------------------------ 시계 */

/* `Date` 만 옮긴다. 타이머와 `performance` 는 진짜다. */
function dateOffsetScript(offset) {
  return `(() => {
    const N = Date, off = ${offset | 0};
    if (N.__eng2pPinned) return;
    const now = () => N.now() + off;
    function D(...a) {
      if (!new.target) return new N(now()).toString();
      return a.length ? new N(...a) : new N(now());
    }
    D.prototype = N.prototype;
    Object.setPrototypeOf(D, N);
    D.now = now; D.__eng2pPinned = true;
    window.Date = D;
  })();`;
}

async function pinContext(ctx, mode) {
  if (mode === false || mode === "off") return;
  const target = pinMs();
  if (mode === "date") {
    // 컨텍스트를 만든 순간에 고정한 날이 되고 거기서부터 흐른다. 다시 열어도 이어서 흐른다
    const off = target - Date.now();
    await ctx.addInitScript(dateOffsetScript(off));
    return;
  }
  await ctx.clock.install({ time: target });
}

/* ------------------------------------------------------------------ 준비 신호 */

/* 앱이 읽고 있는 자료가 없고, 문서가 다 열렸고, 끝나가는 움직임이 없는가.
   `pending` 은 03a_data.js 의 `loadScript` 가 쥔 표다. 읽는 동안은 콜백 배열이고 끝나면 null.
   앱을 안 고치고 쓸 수 있는 신호가 이것이다. 앱에 신호가 생기면 여기만 바꾼다.

   **움직임도 본다.** 블록을 넘기면 칸이 0.22초 동안 26px 밀려 들어온다 (`slideNext`).
   그 사이에는 칸 안쪽이 가로로 넘쳐 보여서 앱이 밀기를 "가로 스크롤 위에서 시작한 것" 으로 알고 무시한다.
   고정 320ms 를 자고 두 번째 밀기를 보냈더니 부하가 걸린 날 움직임이 아직 끝나기 전이라 안 먹었다.
   끝이 있는 움직임 (CSS 애니메이션과 전환) 만 센다. 끝없이 도는 것 (맥박, 떠다니는 바탕) 은 안 센다. */
function idleFn() {
  try {
    if (document.readyState !== "complete") return false;
    if (typeof pending === "object" && pending) {
      for (const k in pending) if (pending[k]) return false;
    }
    if (document.getAnimations) {
      const going = document.getAnimations().some((a) => {
        if (a.playState !== "running") return false;
        const t = a.effect && a.effect.getComputedTiming && a.effect.getComputedTiming();
        return !!t && isFinite(t.endTime);
      });
      if (going) return false;
    }
    return true;
  } catch (e) { return true; }
}

/* 자료가 다 올 때까지. **상한이 있다.** 영영 안 오는 자료 (일부러 막은 것) 는 기다리다 터지지 않고
   그냥 지나간다. 그 자리는 검사가 제 단언으로 잡는다. */
async function idle(page, opts) {
  const cap = (opts && opts.cap) || 6000;
  try {
    await page.waitForFunction(idleFn, null, { timeout: cap, polling: 50 });
  } catch (e) { /* 상한이다. 넘어간다 */ }
}

/* 그 칸에 그 글이 뜰 때까지. 안 뜨면 던진다. 호출한 쪽이 제 단언으로 잡는다. */
async function waitText(page, sel, want, timeout) {
  const isRe = want instanceof RegExp;
  await page.waitForFunction(
    ([s, w, re, flags]) => {
      const e = document.querySelector(s);
      if (!e) return false;
      const t = e.innerText || "";
      return re ? new RegExp(w, flags).test(t) : t.indexOf(w) >= 0;
    },
    [sel, isRe ? want.source : String(want), isRe, isRe ? want.flags : ""],
    { timeout: timeout || 8000, polling: 50 });
}

/* 그 자리가 **있는지** 잠깐 기다려서 본다. 있어야 하는 것을 `page.$` 로 바로 보면
   부하가 걸린 날 아직 안 그려진 것이 "없다" 가 된다. **없어야 하는 것은 이것으로 안 본다.**
   (없어야 하는 것을 기다리면 기다린 만큼 느려질 뿐 아니라, 늦게 생기는 결함을 놓칠 수 있다.) */
async function has(page, sel, timeout) {
  try { await page.waitForSelector(sel, { state: "attached", timeout: timeout || 3000 }); return true; }
  catch (e) { return false; }
}

/* 식이 참이 될 때까지. 안 되면 던진다. */
function waitFn(page, fn, arg, timeout) {
  return page.waitForFunction(fn, arg === undefined ? null : arg,
    { timeout: timeout || 8000, polling: 50 });
}

/* 페이지 안에서 부르는 같은 신호. 검사가 `page.evaluate` 안에서 자는 자리 (`setTimeout` 으로
   기다리고 읽는 꼴) 가 많다. 거기서는 `await window.__idle({ sel })` 을 부른다.
   자료가 다 오고 (`pending`) **그 칸의 글 길이가 두 번 잇달아 같을 때** 풀린다.
   상한을 넘으면 false 로 풀린다. 던지지 않는다. */
const IDLE_IN_PAGE = `(() => {
  if (window.__idle) return;
  window.__idle = function (opts) {
    const cap = (opts && opts.cap) || 6000, sel = opts && opts.sel;
    return new Promise((done) => {
      let waited = 0, stable = 0, last = -1;
      (function tick() {
        let busy = false;
        try { if (typeof pending === "object" && pending) for (const k in pending) if (pending[k]) busy = true; }
        catch (e) { busy = false; }
        try {   // 끝이 있는 움직임 (idleFn 의 같은 대목)
          if (!busy && document.getAnimations) busy = document.getAnimations().some((a) => {
            if (a.playState !== "running") return false;
            const t = a.effect && a.effect.getComputedTiming && a.effect.getComputedTiming();
            return !!t && isFinite(t.endTime);
          });
        } catch (e) { /* 못 보면 안 기다린다 */ }
        let len = 0;
        try {
          const el = sel ? document.querySelector(sel) : document.body;
          len = el ? (el.innerText || "").length : 0;
        } catch (e) { len = 0; }
        stable = len === last ? stable + 1 : 0;
        last = len;
        if (!busy && stable >= 2) return done(true);
        waited += 50;
        if (waited >= cap) return done(false);
        setTimeout(tick, 50);
      })();
    });
  };
})();`;

/* 노드 쪽에서 같은 일을 한다. sel 을 주면 그 칸의 글이 가라앉을 때까지도 본다. */
async function settle(page, sel, cap) {
  try {
    await page.evaluate(([s, c]) => window.__idle({ sel: s || undefined, cap: c || undefined }),
                        [sel || null, cap || null]);
  } catch (e) { /* 이동 중이다. 넘어간다 */ }
}

/* ------------------------------------------------------------------ 첫 화면 */

/* 비우고 첫 화면을 넘긴 상태로 다시 연다. 아홉 검사가 같은 줄을 복사해 쓰고 있었다. */
async function onboard(page, o) {
  o = o || {};
  const names = o.names || { a: "가람", b: "나래" };
  const device = o.device === undefined ? "a" : o.device;
  await page.goto(o.url || PAGE);
  await page.evaluate(({ n, d }) => {
    localStorage.clear();
    S.onboarded = true; S.names.a = n.a; S.names.b = n.b; S.device = d;
    saveNow();
  }, { n: names, d: device });
  await page.reload();
  await waitFn(page, () => typeof S !== "undefined" && typeof save === "function");
  await idle(page);
}

/* ------------------------------------------------------------------ 띄우기 */

function instrumentPage(page) {
  if (page.__eng2p) return page;
  page.__eng2p = true;
  const raw = page.waitForTimeout.bind(page);
  page.__rawWait = raw;
  page.waitForTimeout = async (ms) => {
    await raw(ms);
    /* 이미 가라앉았으면 (흔한 경우) 왕복 한 번으로 끝낸다. 시간에 민감한 읽기 (시계가 한 칸 도는 사이에
       읽는 검사) 가 있어서 덧붙이는 시간을 최소로 둔다. 안 가라앉았을 때만 기다린다 */
    if (ms >= 100) {
      try { if (await page.evaluate(idleFn)) return; } catch (e) { return; }
      await idle(page);
    }
  };
  return page;
}

async function instrumentContext(ctx, mode) {
  const np = ctx.newPage.bind(ctx);
  ctx.newPage = async (...a) => instrumentPage(await np(...a));
  ctx.on("page", (p) => instrumentPage(p));      // 팝업으로 열린 것
  await ctx.addInitScript(IDLE_IN_PAGE);
  await pinContext(ctx, mode);
  return ctx;
}

function instrumentBrowser(browser, mode) {
  const nc = browser.newContext.bind(browser);
  browser.newContext = async (o) => instrumentContext(await nc(o || {}), mode);
  // 단축형은 창이 닫히면 컨텍스트도 닫힌다. 그 뜻을 그대로 둔다
  browser.newPage = async (o) => {
    const ctx = await browser.newContext(o || {});
    const page = await ctx.newPage();
    const close = page.close.bind(page);
    page.close = async (...a) => { await close(...a); await ctx.close().catch(() => {}); };
    return page;
  };
  return browser;
}

function wrapChromium(chromium, chrome, mode) {
  return {
    launch: async (o) => instrumentBrowser(
      await chromium.launch(Object.assign({ executablePath: chrome }, o || {})), mode),
    executablePath: () => chrome,
  };
}

/* 이 검사가 브라우저를 필요로 한다. 없으면 여기서 건너뛰고 끝낸다.
   opts.clock  "pw" (기본) | "date" | false */
function need(label, opts) {
  opts = opts || {};
  const pw = loadPlaywright();
  if (!pw) skip(label, "playwright 를 못 찾았다 (PLAYWRIGHT_MODULE=" +
                       (process.env.PLAYWRIGHT_MODULE || "없음") + ", NODE_PATH=" +
                       (process.env.NODE_PATH || "없음") + ")");
  const chrome = findChromium();
  if (!chrome) skip(label, "크로미움을 못 찾았다: " + (process.env.CHROMIUM_PATH || DEFAULT_CHROME));
  const mode = opts.clock === undefined ? "pw" : opts.clock;
  return { chromium: wrapChromium(pw.chromium, chrome, mode), CHROME: chrome, PAGE, ROOT, ENG, H: module.exports };
}

/* ------------------------------------------------------------------ 쪼개 돌리기 */

/* `--part k/n` (또는 `--part=k/n`). 없으면 null = 다 돈다. */
function partArg(argv) {
  argv = argv || process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    let v = null;
    if (argv[i] === "--part") v = argv[i + 1];
    else if (argv[i].indexOf("--part=") === 0) v = argv[i].slice(7);
    if (v === null) continue;
    const m = /^(\d+)\/(\d+)$/.exec(v || "");
    if (!m || +m[1] < 1 || +m[1] > +m[2]) throw new Error("--part 는 k/n 꼴이다: " + v);
    return { k: +m[1], n: +m[2] };
  }
  return null;
}

module.exports = {
  ENG, ROOT, PAGE, SKIP_CODE, pinMs,
  findChromium, loadPlaywright, skip, need,
  idle, idleFn, settle, has, waitText, waitFn, onboard, partArg,
  instrumentPage,
};

/* 직접 돌리면 도구를 점검한다. `all.py` 가 처음에 부른다.
     node scripts/lib/browser_harness.js --probe      찾았으면 0, 못 찾았으면 77 */
if (require.main === module) {
  if (process.argv.includes("--probe")) {
    const pw = loadPlaywright(), chrome = findChromium();
    console.log("playwright: " + (pw ? pw.name : "없음") + " / 크로미움: " + (chrome || "없음") +
                " / 시계: " + new Date(pinMs()).toISOString());
    process.exit(pw && chrome ? 0 : SKIP_CODE);
  }
  console.log("쓰는 법: require('./lib/browser_harness') 하거나 --probe");
}
