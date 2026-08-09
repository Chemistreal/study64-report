/* 판 화면 판정 검사. **한쪽에만 있어야 하는 것이 정말 한쪽에만 있는가.**
 *
 * T259 가 거울 판을 붙였다. 그 판의 뼈대는 하나다.
 * **짚는 쪽이 어느 쪽을 읽는지 모른다.** 그것이 무너지면 이 판은 아무것도 안 잰다.
 *
 * 그런데 T259 를 끝낼 때 내가 한 것은 코드를 읽고 "안 그렸다" 고 말한 것뿐이다.
 * **그것은 검사가 아니다.** 안 그렸다고 믿는 것과 안 그려졌다고 재는 것은 다르다.
 *
 * ## 무엇으로 재는가
 *
 * 낱말이 화면에 있나 없나로는 못 잰다. 쌍의 두 낱말은 **둘 다** 짚는 쪽 화면에 있다.
 * 있는 것이 맞다. 새는 것은 낱말이 아니라 **어느 쪽인가** 다.
 *
 * 그래서 이렇게 잰다.
 *
 *     `mirTarget` 을 늘 0으로 만들고 그린다   -> 화면을 받아 적는다
 *     `mirTarget` 을 늘 1로 만들고 그린다     -> 화면을 받아 적는다
 *     짚는 쪽에서 **둘이 한 글자도 안 달라야 한다**
 *     읽는 쪽에서 **둘이 달라야 한다**
 *
 * 글자만 안 본다. `innerHTML` 을 통째로 견준다. 눈에 안 보이는 자리로도 샌다.
 * class 하나, `aria-label` 하나, `data-` 하나면 충분하다.
 * **내가 생각 못 한 자리로 새는 것을 잡으려면 내가 자리를 안 골라야 한다.**
 *
 * 뒤엣줄이 앞엣줄만큼 중요하다. 읽는 쪽에서도 안 달라지면 그것은
 * 안 새는 것이 아니라 **아무것도 안 그리는 것**이다. 그러면 이 검사가 늘 통과한다.
 *
 * ## 나머지
 *
 *     반대 자리   여덟 줄 내내 둘이 서로 다른 자리다
 *     같은 판     여덟 줄 내내 판 표시가 같다
 *     섞인 대립   여덟이 한 대립에서 안 나온다 (T258)
 *     넉 줄       자리가 넷째 줄에서 바뀌고 그 전에는 안 바뀐다
 *     한 번 더    못 짚으면 같은 줄에 머물고 두 번째는 넘어간다
 *     절반        판정한 기기의 셈이 넷이고 화면이 절반이라고 적는다
 *     안 고른 날  기기 쪽이 없으면 판을 안 돌리고 큰 낱말이 안 뜬다
 *     건네는 중   덮개에 쌍의 낱말이 한 글자도 없다
 *     4분         시계가 다 되면 끝났다고 적는다
 *     등급        B등급이라고 화면이 말한다
 *
 * ## 판이 늘면 이 파일도 는다 (T263)
 *
 * 한 줄 바꾸기를 붙였다. 뼈대는 같고 **다른 자리만 따로 잰다.**
 *
 *     자리가 **한 줄마다** 바뀐다 (거울은 넉 줄)
 *     찾는 쪽이 **원문을 본다.** 없는 것은 바꿀 낱말 하나다
 *     못 찾으면 **알려 주고 다시 읽는다.** 다시 판정하지 않는다
 *     다섯을 못 채우는 과가 있다. 있는 만큼 돌고 몇 줄인지 적는다
 *
 * 쓰는 법:
 *     node scripts/check_play_screen.js
 *
 * 규격: docs/play_app.md, docs/play_rules.md 3.1, docs/round.md
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("판 화면 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require("playwright-core").chromium; }
catch (e) { skip("playwright-core 가 없다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

/* 두 기기가 같은 데서 출발한다. 거기서부터 갈리면 갈리는 것이 당연해서
   아무것도 안 재게 된다. `check_pair.js` 와 같은 씨앗이다. */
const SEED = (who) => {
  function iso(d) { var z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return z.toISOString().slice(0, 10); }
  var now = new Date(), st = new Date(now.getTime()), cnt = 0;
  while (cnt < 138) { st = new Date(st.getTime() - 86400000);
    if (st.getDay() !== 0) cnt++; }
  while (st.getDay() === 0) st = new Date(st.getTime() - 86400000);
  var days = {}, d = new Date(st.getTime());
  while (iso(d) < iso(now)) {
    if (d.getDay() !== 0) days[iso(d)] = { status: "normal", h: 2, speak: 12,
                                           cards: 30, lre: 2, unres: [], coll: [] };
    d = new Date(d.getTime() + 86400000);
  }
  localStorage.setItem("eng2p.v1", JSON.stringify(
    { v: 1, names: { a: "남편", b: "아내" }, start: iso(st), days: days,
      media: { done: {}, fav: {}, last: null, pass: {} }, wk: 0, onboarded: true,
      session: null, device: who, recOpen: false, emgOpen: false, card: null,
      cardDue: {}, cardMode: "today", cues: {}, rate: 1, fs: 0, wchk: {},
      q: {}, rot: [], clips: [], scripts: {}, rstep: {}, rseat: {}, rhit: {} }));
};

const fails = [];
const errs = [];
/* **찾는 그 자리에서 적는다.** 모아 뒀다가 끝에 적으면 중간에 터질 때 다 잃는다.
   실제로 잃었다. `every` 를 넷에서 둘로 바꿔 깨 봤더니 자리 검사가 이미 잡아
   놓은 것이 있었는데, 그 뒤의 누르기가 30초 기다리다 터지면서 **한 줄도 안 나왔다.**
   깨진 것을 못 잡은 줄 알았다. 잡아 놓고 안 보여 준 것이었다. T260 */
function no(msg) { fails.push(msg); console.log("[실패] " + msg); }

/* 누른다. **있는지와 보이는지를 먼저 보고 짧게 기다린다.**
   없는 것을 누르면 기본 30초를 기다리다 터진다. 터지면 그 뒤가 다 안 돈다.
   깨진 앱에서 검사가 오래 걸리는 것이 아니라 **아무 말도 안 하게 된다.** */
async function tap(page, sel, why) {
  const el = await page.$(sel);
  if (!el || !(await el.isVisible())) { no(why + ": " + sel + " 가 화면에 없다"); return false; }
  try { await el.click({ timeout: 3000 }); return true; }
  catch (e) { no(why + ": " + sel + " 를 못 눌렀다"); return false; }
}

/* 판을 처음부터 다시. **회와 셈을 같이 지운다.** 회만 지우면 앞선 판정이 남는다. */
const RESET = () => {
  S.rstep = {}; S.rseat = {}; S.rhit = {}; S.solo = false; S.soloHand = false;
  S.soloSeat = 0; save();
  if (typeof turnForget === "function") turnForget("mirror");
  MIRCLK.left = 0; MIRCLK.over = false;
  renderMirror();
};

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const dev = {};
  for (const who of ["a", "b"]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errs.push(who + ": " + e.message));
    await page.goto(PAGE);
    await page.evaluate(SEED, who);
    await page.goto(PAGE);
    await page.click('nav button[data-t="play"]');
    await page.click('[data-play="mirror"]');
    /* **판 화면이 붙기를 기다린다.** 칸이 그려진 것만 보면 너무 일찍 풀린다.
       판 화면은 따로 읽는 파일이고 (T259) 읽는 동안 "여는 중이다" 칸이 먼저 뜬다.
       그 칸을 보고 나아가면 `mirTarget` 이 아직 없다. 실제로 그렇게 났다. */
    await page.waitForFunction(() => typeof window.mirTarget === "function",
                               null, { timeout: 8000 });
    dev[who] = page;
  }
  const A = dev.a, B = dev.b;

  /* 어느 쪽이 읽는 쪽인가는 날마다 뒤집힌다 (`roleOf`). **재서 정한다.** */
  const isReader = (p) => p.evaluate(() => !!document.querySelector(".mirword"));
  let reader = (await isReader(A)) ? A : B;
  let pointer = reader === A ? B : A;
  if ((await isReader(A)) === (await isReader(B)))
    no("두 기기가 같은 자리다. 한쪽이 읽는 쪽이고 한쪽이 짚는 쪽이어야 한다");

  const pane = (p) => p.$eval("#playPane", (n) => n.innerHTML);
  const text = (p) => p.innerText("#playPane");

  /* ---- 1. 답이 짚는 쪽 화면에 없다 --------------------------------------
     `mirTarget` 을 0으로 고정하고 그린 화면과 1로 고정하고 그린 화면을 견준다.
     **짚는 쪽은 한 글자도 안 달라야 하고 읽는 쪽은 달라야 한다.**              */
  const withTarget = async (p, v) => {
    await p.evaluate((v) => { window.__mt = mirTarget; window.mirTarget = () => v;
                              renderMirror(); }, v);
    const h = await pane(p);
    await p.evaluate(() => { window.mirTarget = window.__mt; renderMirror(); });
    return h;
  };
  let leaked = 0, blind = 0;
  for (let ln = 0; ln < 8; ln++) {
    const p0 = await withTarget(pointer, 0), p1 = await withTarget(pointer, 1);
    if (p0 !== p1) leaked++;
    const r0 = await withTarget(reader, 0), r1 = await withTarget(reader, 1);
    if (r0 === r1) blind++;
    /* 다음 줄로. 두 기기가 각자 센다. */
    for (const p of [reader, pointer])
      await p.evaluate(() => { roundStepSet("mirror", roundStep("mirror") + 1);
                               renderMirror(); });
    if (ln === 3) { const t = reader; reader = pointer; pointer = t; }
  }
  if (leaked) no("짚는 쪽 화면이 어느 쪽을 읽는지에 따라 달라진다: " + leaked + "줄");
  if (blind) no("읽는 쪽 화면이 어느 쪽을 읽는지에 따라 안 달라진다: " + blind +
                "줄. 답을 안 그리는 것이 아니라 아무것도 안 그리는 것이다");

  /* ---- 2. 반대 자리와 같은 판 표시 --------------------------------------- */
  await A.evaluate(RESET); await B.evaluate(RESET);
  const seatOf = (p) => p.evaluate(() =>
    (document.querySelector(".mirword") ? "읽는 쪽" : "짚는 쪽"));
  const tagOf = (p) => p.evaluate(() => roundTag("mirror", roundStep("mirror")));
  const tagOf2 = (p) => p.evaluate(() => roundTag("swapline", roundStep("swapline")));
  let same = 0, difftag = 0;
  const seats = [];
  for (let ln = 0; ln < 8; ln++) {
    const sa = await seatOf(A), sb = await seatOf(B);
    if (sa === sb) same++;
    seats.push(sa);
    if ((await tagOf(A)) !== (await tagOf(B))) difftag++;
    for (const p of [A, B])
      await p.evaluate(() => { roundStepSet("mirror", roundStep("mirror") + 1);
                               renderMirror(); });
  }
  if (same) no("두 기기가 같은 자리인 줄이 " + same + "개다. 여덟 줄 다 달라야 한다");
  if (difftag) no("판 표시가 다른 줄이 " + difftag + "개다. 여덟 줄 다 같아야 한다");

  /* ---- 3. 넉 줄마다 바뀐다 -----------------------------------------------
     규칙서 3.1 이 넉 줄이라고 적었다. **넷째에서 바뀌고 그 전에는 안 바뀐다.**  */
  const flips = [];
  for (let i = 1; i < seats.length; i++) if (seats[i] !== seats[i - 1]) flips.push(i);
  if (flips.length !== 1 || flips[0] !== 4)
    no("자리가 바뀐 줄이 [" + flips.join(",") + "] 이다. [4] 여야 한다 (넉 줄마다)");

  /* ---- 4. 여덟이 대립을 섞어 나온다 (T258) ------------------------------- */
  const kinds = await A.evaluate(() => {
    var it = mirItems(8) || [], k = {};
    it.forEach(function (x) { k[x.g] = 1; });
    return { n: it.length, kinds: Object.keys(k) };
  });
  if (kinds.n !== 8) no("한 판이 " + kinds.n + "쌍이다. 규칙서는 여덟이라고 적었다");
  if (kinds.kinds.length < 2)
    no("여덟이 대립 한 갈래에서만 나왔다. 대본이 한 대립으로 여덟을 못 댄다 (T258)");

  /* ---- 5. 못 짚었을 때. 한 번 더 읽고 두 번째는 넘어간다 ----------------- */
  await A.evaluate(RESET); await B.evaluate(RESET);
  let rd = (await isReader(A)) ? A : B;
  const step = () => rd.evaluate(() => roundStep("mirror"));
  const rec = () => rd.evaluate(() => S.rhit["mirror|" + today()] || {});
  await tap(rd, "#mirNo", "못 짚었다 첫 번째");
  if ((await step()) !== 0)
    no("못 짚었다를 한 번 눌렀는데 줄이 넘어갔다. 한 번 더 읽어야 한다");
  if (!(await text(rd)).includes("한 번 더 읽는다"))
    no("못 짚었을 때 한 번 더 읽으라는 말이 화면에 없다");
  await tap(rd, "#mirNo", "못 짚었다 두 번째");
  if ((await step()) !== 1)
    no("못 짚었다를 두 번 눌렀는데 줄이 안 넘어갔다. 두 번째는 넘어간다");
  let r = await rec();
  if (r.judged !== 1 || r.hit !== 0)
    no("두 번 못 짚은 줄의 셈이 판정 " + r.judged + " 건너감 " + r.hit +
       " 이다. 판정 1 건너감 0 이어야 한다");

  /* ---- 6. 판정 셈은 넷이고 화면이 절반이라고 적는다 ---------------------- */
  await A.evaluate(RESET); await B.evaluate(RESET);
  rd = (await isReader(A)) ? A : B;
  for (let i = 0; i < 4; i++) {
    if (!(await tap(rd, "#mirYes", "짚었다 " + (i + 1) + "번째"))) break;
    await rd.waitForTimeout(80);
  }
  r = await rec();
  if (r.hit !== 4 || r.judged !== 4)
    no("넉 줄을 짚었다고 했는데 셈이 판정 " + r.judged + " 건너감 " + r.hit + " 이다");
  /* 자리가 바뀌었으니 이 기기는 이제 짚는 쪽이다. 남은 넷은 상대가 판정한다.
     여기서 끝까지 밀어 마감 화면을 본다. */
  await rd.evaluate(() => { roundStepSet("mirror", 8); renderMirror(); });
  const done = await text(rd);
  if (!done.includes("절반"))
    no("마감 화면이 이 숫자가 절반이라고 안 적는다. 두 사람이 넷을 여덟으로 읽는다");
  if (!/판정한 것은 4줄/.test(done))
    no("마감 화면이 판정한 줄 수를 안 적거나 넷이 아니다");

  /* ---- 7. B등급을 화면이 말한다 ------------------------------------------ */
  if (!done.includes("B등급") || !done.includes("통과 판정에는 안 쓴다"))
    no("자료가 B등급이라는 것과 통과 판정에 안 쓴다는 것이 화면에 없다");

  /* ---- 8. 기기 쪽을 안 골랐으면 판을 안 돌린다 --------------------------- */
  await rd.evaluate(() => { S.device = null; save();
                            roundStepSet("mirror", 0); renderMirror(); });
  const off = await text(rd);
  if (!off.includes("이대로 안 돈다"))
    no("기기 쪽을 안 골랐는데 판이 그대로 돈다. 짚는 쪽이 답을 본다");
  if ((await rd.$$(".mirword")).length || (await rd.$$("[data-mp]")).length)
    no("기기 쪽을 안 골랐는데 낱말이 화면에 떴다");

  /* ---- 9. 건네는 중에 덮개에 쌍의 낱말이 없다 ---------------------------- */
  const words = await A.evaluate(() => {
    var it = mirItems(8) || [], w = [];
    it.forEach(function (x) { w.push(x.a); w.push(x.b); });
    return w;
  });
  await rd.evaluate(() => { S.device = "a"; S.solo = true; S.soloHand = true; save();
                            renderMirror(); });
  const cover = await text(rd);
  const seen = words.filter((w) => new RegExp("\\b" + w + "\\b").test(cover));
  if (seen.length) no("건네는 중인 덮개에 쌍의 낱말이 보인다: " + seen.join(" "));

  /* ---- 10. 4분이 되면 끝났다고 적는다 ------------------------------------ */
  await rd.evaluate(() => { S.solo = false; S.soloHand = false; save();
                            MIRCLK.left = 0; MIRCLK.over = false;
                            roundStepSet("mirror", 0); renderMirror(); });
  await tap(rd, "#mirGo", "4분 시계");
  await rd.evaluate(() => { MIRCLK.left = 1; });
  await rd.waitForTimeout(1500);
  const over = await text(rd);
  if (!over.includes("4분이 됐다"))
    no("4분 시계가 다 됐는데 화면이 끝났다는 말을 안 한다");

  /* =====================================================================
     한 줄 바꾸기 (T263). 두 창을 그대로 옮겨 이 판으로 몬다.
     ===================================================================== */
  const openPlay = async (p, id, fn) => {
    await p.evaluate((id) => { PLAY.at = id; renderPlayTab(); }, id);
    await p.waitForFunction((f) => typeof window[f] === "function", fn,
                            { timeout: 8000 });
    await p.waitForTimeout(400);
  };
  const SWRESET = () => {
    S.rstep = {}; S.rseat = {}; S.rhit = {}; S.solo = false; S.soloHand = false;
    S.device = S.device || "a"; save();
    if (typeof turnForget === "function") turnForget("swapline");
    SWPCLK.left = 0; SWPCLK.over = false;
    renderSwapline();
  };
  for (const p of [A, B]) {
    await p.evaluate(() => { S.device = null; save(); });
    await openPlay(p, "swapline", "renderSwapline");
  }
  /* ---- 11. 기기 쪽을 안 골랐으면 이 판도 안 돈다 ----------------------- */
  const offSw = await text(A);
  if (!offSw.includes("이대로 안 돈다"))
    no("한 줄 바꾸기: 기기 쪽을 안 골랐는데 판이 그대로 돈다");

  await A.evaluate(() => { S.device = "a"; save(); });
  await B.evaluate(() => { S.device = "b"; save(); });
  await A.evaluate(SWRESET); await B.evaluate(SWRESET);

  /* ---- 12. 바꿀 낱말이 찾는 쪽 화면에 없다 -----------------------------
     `swpItems` 가 내는 `to` 를 바꿔 끼우고 두 번 그린다.
     **찾는 쪽은 한 글자도 안 달라야 하고 읽는 쪽은 달라야 한다.**       */
  const withTo = async (p, v) => {
    await p.evaluate((v) => {
      if (!window.__si) window.__si = swpItems;
      window.swpItems = function () {
        var xs = window.__si(); if (!xs) return xs;
        return xs.map(function (x) {
          var y = {}; for (var k in x) y[k] = x[k]; y.to = v; return y;
        });
      };
      renderSwapline();
    }, v);
    const h = await pane(p);
    await p.evaluate(() => { window.swpItems = window.__si; renderSwapline(); });
    return h;
  };
  const swReader = (p) => p.evaluate(() => !!document.querySelector(".swpswap"));
  let rdr = (await swReader(A)) ? A : B, fnd = (await swReader(A)) ? B : A;
  if ((await swReader(A)) === (await swReader(B)))
    no("한 줄 바꾸기: 두 기기가 같은 자리다");
  let swLeak = 0, swBlind = 0;
  const swSeats = [];
  for (let ln = 0; ln < 5; ln++) {
    const f0 = await withTo(fnd, "zzzaaa"), f1 = await withTo(fnd, "qqqbbb");
    if (f0 !== f1) swLeak++;
    const r0 = await withTo(rdr, "zzzaaa"), r1 = await withTo(rdr, "qqqbbb");
    if (r0 === r1) swBlind++;
    if ((await tagOf2(A)) !== (await tagOf2(B))) no("한 줄 바꾸기: 판 표시가 다르다");
    swSeats.push((await swReader(A)) ? "읽는 쪽" : "찾는 쪽");
    for (const p of [A, B])
      await p.evaluate(() => { roundStepSet("swapline", roundStep("swapline") + 1);
                               renderSwapline(); });
    const t = rdr; rdr = fnd; fnd = t;          // 한 줄마다 바뀐다
  }
  if (swLeak) no("찾는 쪽 화면이 바꿀 낱말에 따라 달라진다: " + swLeak + "줄");
  if (swBlind) no("읽는 쪽 화면이 바꿀 낱말에 따라 안 달라진다: " + swBlind +
                  "줄. 안 그리는 것이 아니라 아무것도 안 그리는 것이다");

  /* ---- 13. 자리가 한 줄마다 바뀐다 ------------------------------------- */
  const swFlips = [];
  for (let i = 1; i < swSeats.length; i++)
    if (swSeats[i] !== swSeats[i - 1]) swFlips.push(i);
  if (swFlips.length !== swSeats.length - 1)
    no("한 줄 바꾸기: 자리가 바뀐 줄이 [" + swFlips.join(",") +
       "] 이다. 한 줄마다 바뀌어야 한다");

  /* ---- 14. 못 찾았을 때. 알려 주고 다시 읽는다 -------------------------
     **거울과 다르다.** 알려 준 뒤에는 다시 판정하지 않는다.            */
  await A.evaluate(SWRESET); await B.evaluate(SWRESET);
  let sr = (await swReader(A)) ? A : B;
  const swStep = () => sr.evaluate(() => roundStep("swapline"));
  const swRec = () => sr.evaluate(() => S.rhit["swapline|" + today()] || {});
  await tap(sr, "#swpNo", "못 찾았다");
  if ((await swStep()) !== 0)
    no("한 줄 바꾸기: 못 찾았다를 눌렀는데 바로 넘어갔다. 알려 주고 다시 읽는다");
  if (!(await text(sr)).includes("알려 주고 다시 읽는다"))
    no("한 줄 바꾸기: 어디였는지 알려 주라는 말이 화면에 없다");
  if ((await sr.$$("#swpYes")).length)
    no("한 줄 바꾸기: 알려 준 뒤에도 찾았다 단추가 남아 있다. 다시 판정하면 안 된다");
  await tap(sr, "#swpNext", "다음 줄");
  if ((await swStep()) !== 1) no("한 줄 바꾸기: 다음 줄을 눌렀는데 안 넘어갔다");
  let swr = await swRec();
  if (swr.judged !== 1 || swr.hit !== 0)
    no("한 줄 바꾸기: 못 찾은 줄의 셈이 판정 " + swr.judged + " 찾음 " + swr.hit +
       " 이다. 판정 1 찾음 0 이어야 한다");

  /* ---- 15. 다섯을 못 채우는 과. 있는 만큼 돌고 몇 줄인지 적는다 -------- */
  await sr.evaluate(() => {
    window.__st = swpToday; window.swpToday = function () { return "lle1-01"; };
    S.rstep = {}; S.rhit = {}; save(); renderSwapline();
  });
  const thin = await text(sr);
  const nrow = await sr.evaluate(() => (swpItems() || []).length);
  if (nrow >= 5) no("1과가 다섯 줄 이상이다. 이 자리는 셋이어야 한다 (T261)");
  else if (!thin.includes(nrow + "줄") || !thin.includes("있는 만큼 돈다"))
    no("다섯을 못 채우는 과인데 화면이 몇 줄인지를 안 적는다");
  await sr.evaluate(() => { window.swpToday = window.__st; });

  /* ---- 16. 절반과 등급과 5분 ------------------------------------------- */
  await A.evaluate(SWRESET); await B.evaluate(SWRESET);
  sr = (await swReader(A)) ? A : B;
  await sr.evaluate(() => { roundStepSet("swapline", 99); renderSwapline(); });
  const swDone = await text(sr);
  if (!swDone.includes("절반"))
    no("한 줄 바꾸기: 마감 화면이 이 숫자가 절반이라고 안 적는다");
  if (!swDone.includes("B등급") || !swDone.includes("통과 판정에는 안 쓴다"))
    no("한 줄 바꾸기: 자료 등급과 통과 판정에 안 쓴다는 것이 화면에 없다");
  await A.evaluate(SWRESET);
  await tap(A, "#swpGo", "5분 시계");
  await A.evaluate(() => { SWPCLK.left = 1; });
  await A.waitForTimeout(1500);
  if (!(await text(A)).includes("5분이 됐다"))
    no("한 줄 바꾸기: 5분 시계가 다 됐는데 끝났다는 말을 안 한다");

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 3).join(" / "));
  await browser.close();

  /* **판정 줄이 맨 뒤에 온다.** `all.py` 가 마지막 뜻있는 줄을 그 검사의 판정으로 읽는다.
     기계가 안 보는 것을 뒤에 두면 표에 그 줄이 뜨고 실패 수가 안 보인다. */
  console.log("**기계가 안 보는 것: 상 건너로 보이는 화면, 소리가 정말 갈렸는지**");
  console.log("판 2개 / 거울: 답 새기 8줄 x 2자리, 자리와 판 표시 8줄, 못 짚기 2판, " +
              "셈 1판, 안 고른 날 1판, 건네기 1판, 시계 1판 / " +
              "한 줄 바꾸기: 낱말 새기 5줄 x 2자리, 한 줄마다 바뀜 5줄, 알려 주기 4판, " +
              "모자란 과 1판, 절반과 등급과 시계 3판 / 실패 " + fails.length);
  process.exit(fails.length ? 1 : 0);
})();
