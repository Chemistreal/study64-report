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
 * ## 판정이 자리를 바꿨다 (T266)
 *
 * 내 소리는 네가를 붙였다. **판정 단추가 듣는 쪽에 있다.** 앞의 둘은 읽는 쪽이었다.
 * 그래서 이 판에서는 **누를 것이 없는 쪽**이 어디인지를 따로 잰다.
 * 규칙서가 판마다 판정하는 사람을 정해 뒀고 (원칙 3) 화면이 그것을 어기면
 * 자기 발음을 자기가 판정하게 된다. 그것이 이 판이 막으려던 바로 그 일이다.
 *
 * ## 기계가 판정하는 판이 하나 있다 (T269)
 *
 * 전달 놀이다. 재는 것이 소리가 아니라 **적은 글과 원문이 몇 군데 다른가** 라서
 * 기계가 셀 수 있다. 그러면 **그 셈이 맞는지를 검사가 봐야 한다.**
 * 앞의 셋은 사람이 판정해서 검사가 볼 것이 화면뿐이었다. 여기는 셈도 본다.
 * 아는 답을 넣고 아는 수가 나오는지 본다.
 *
 * ## 가릴 것이 없는 판도 잰다 (T272)
 *
 * 이어달리기다. 앞의 넷은 "한쪽에만 있는 것이 정말 한쪽에만 있는가" 를 쟀다.
 * 이 판은 **가릴 것이 없는 것이 맞다.** 그러면 무엇을 재나.
 *
 *     감춘 자리가 **없는가**. `.vhid` 가 뜨면 안 가릴 것을 가린 것이다
 *     두 기기가 **같은 것**을 보이는가. 청크 목록과 마디 수
 *     두 기기가 **다른 차례**를 말하는가. 자리는 갈린다
 *     셈이 **절반이 아닌가**. 이 판은 두 기기에 같은 수가 남는다
 *
 * 넷째가 중요하다. 앞의 넷을 베껴 `playHalf` 를 붙이면 두 사람이
 * 온 수를 절반으로 읽고 두 배로 더한다.
 *
 * ## 등급이 A인 자료가 처음 왔다 (T275)
 *
 * 둘이 한 문장이다. 여기서 잴 것이 하나 는다.
 * **A등급 자료에 "통과 판정에 안 쓴다" 가 붙으면 안 된다.**
 * 그것은 없는 금지고 두 사람이 쓸 수 있는 것을 못 쓰는 것으로 읽는다.
 * B등급 판에서는 그 말이 있어야 하고 A등급 판에서는 없어야 한다. 둘 다 잰다.
 *
 * ## 역할이 없는 판을 잰다 (T277)
 *
 * 겹치면 지운다다. **역할이 없는 유일한 판**이라 잴 것이 또 다르다.
 *
 *     두 기기가 **같은 맞힐 것**을 본다. 씨앗에서 나온다
 *     자리 표시가 **없다.** 대신 역할이 없다고 적혀 있다
 *     겹침 판정이 **글자만 본다.** 대소문자와 문장부호는 안 본다
 *     펴기 전에 **내 단서가 화면에 없다.** 먼저 본 사람이 바꾸면 안 재게 된다
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

  /* =====================================================================
     내 소리는 네가 (T266). **판정이 듣는 쪽에 있다.**
     ===================================================================== */
  const HRRESET = () => {
    S.rstep = {}; S.rseat = {}; S.rhit = {}; S.solo = false; S.soloHand = false;
    save();
    if (typeof turnForget === "function") turnForget("hearme");
    HRMCLK.left = 0; HRMCLK.over = false;
    renderHearme();
  };
  for (const p of [A, B]) {
    await p.evaluate(() => { S.device = null; save(); });
    await openPlay(p, "hearme", "renderHearme");
  }
  /* ---- 17. 기기 쪽을 안 골라도 **안 막는다** -------------------------
     앞의 둘과 반대다. 시작 조건이 "기기 수는 상관없다" 이다.
     같은 조건에 같은 답을 주면 그 둘 중 하나가 틀린 것이다.            */
  const offHr = await text(A);
  if (offHr.includes("이대로 안 돈다"))
    no("내 소리는 네가: 기기 쪽을 안 골랐다고 판을 막는다. 이 판은 종이로도 돈다");
  if (!offHr.includes("기기가 하나여도 돈다"))
    no("내 소리는 네가: 기기가 하나여도 돈다는 말이 화면에 없다");

  await A.evaluate(() => { S.device = "a"; save(); });
  await B.evaluate(() => { S.device = "b"; save(); });
  await A.evaluate(HRRESET); await B.evaluate(HRRESET);

  /* ---- 18. 지시가 말하는 쪽 화면에 없다 ------------------------------- */
  const withKind = async (p, k) => {
    await p.evaluate((k) => {
      if (!window.__hi) window.__hi = hrmItems;
      window.hrmItems = function () {
        var xs = window.__hi(); if (!xs) return xs;
        return xs.map(function (x) {
          var y = {}; for (var n in x) y[n] = x[n]; y.kind = k; return y;
        });
      };
      renderHearme();
    }, k);
    const h = await pane(p);
    await p.evaluate(() => { window.hrmItems = window.__hi; renderHearme(); });
    return h;
  };
  const isListener = (p) => p.evaluate(() => !!document.querySelector(".hrmsay"));
  let lis = (await isListener(A)) ? A : B, spk = (await isListener(A)) ? B : A;
  if ((await isListener(A)) === (await isListener(B)))
    no("내 소리는 네가: 두 기기가 같은 자리다");
  let hrLeak = 0, hrBlind = 0, judgeWrong = 0, star = 0;
  const hrSeats = [];
  for (let ln = 0; ln < 6; ln++) {
    const s0 = await withKind(spk, "cluster"), s1 = await withKind(spk, "darkl");
    if (s0 !== s1) hrLeak++;
    const l0 = await withKind(lis, "cluster"), l1 = await withKind(lis, "darkl");
    if (l0 === l1) hrBlind++;
    /* **판정 단추가 듣는 쪽에만 있다.** 이 판의 뼈대다. */
    if ((await spk.$$("#hrmNone")).length || (await spk.$$("#hrmSome")).length)
      judgeWrong++;
    if (!(await lis.$$("#hrmNone")).length) judgeWrong++;
    /* 자료에 마크다운이 남았으면 화면에 별표가 그대로 뜬다 (T265) */
    if ((await text(lis)).includes("**")) star++;
    hrSeats.push((await isListener(A)) ? "듣는 쪽" : "말하는 쪽");
    for (const p of [A, B])
      await p.evaluate(() => { roundStepSet("hearme", roundStep("hearme") + 1);
                               renderHearme(); });
    if (ln === 2) { const t = lis; lis = spk; spk = t; }
  }
  if (hrLeak) no("말하는 쪽 화면이 듣는 쪽 지시에 따라 달라진다: " + hrLeak + "줄");
  if (hrBlind) no("듣는 쪽 화면이 지시에 따라 안 달라진다: " + hrBlind + "줄");
  if (judgeWrong) no("판정 단추가 있어야 할 쪽에 없거나 없어야 할 쪽에 있다: " +
                     judgeWrong + "곳. 이 판은 듣는 사람이 판정한다");
  if (star) no("듣는 쪽 화면에 별표 두 개가 그대로 떴다: " + star +
               "줄. 자료에 마크다운이 남았다");

  /* ---- 19. 자리가 세 줄마다 바뀐다 ------------------------------------- */
  const hrFlips = [];
  for (let i = 1; i < hrSeats.length; i++)
    if (hrSeats[i] !== hrSeats[i - 1]) hrFlips.push(i);
  if (hrFlips.length !== 1 || hrFlips[0] !== 3)
    no("내 소리는 네가: 자리가 바뀐 줄이 [" + hrFlips.join(",") +
       "] 이다. [3] 이어야 한다 (세 줄마다)");

  /* ---- 20. 세는 것이 깨끗한 줄이다 ------------------------------------- */
  await A.evaluate(HRRESET); await B.evaluate(HRRESET);
  let ls = (await isListener(A)) ? A : B;
  const hrRec = () => ls.evaluate(() => S.rhit["hearme|" + today()] || {});
  await tap(ls, "#hrmNone", "짚을 것이 없었다");
  let hr = await hrRec();
  if (hr.none !== 1 || hr.judged !== 1)
    no("짚을 것이 없었다를 눌렀는데 셈이 없음 " + hr.none + " 판정 " + hr.judged + " 이다");
  ls = (await isListener(A)) ? A : B;
  await tap(ls, "#hrmSome", "짚어 줬다");
  hr = await ls.evaluate(() => S.rhit["hearme|" + today()] || {});
  if (hr.none !== 1)
    no("짚어 줬다를 눌렀는데 없음 셈이 " + hr.none + " 로 바뀌었다. 안 늘어야 한다");

  /* ---- 21. 마감 화면이 무엇을 센 숫자인지 적는다 ----------------------- */
  await A.evaluate(HRRESET); await B.evaluate(HRRESET);
  await A.evaluate(() => { roundStepSet("hearme", 99); renderHearme(); });
  const hrDone = await text(A);
  if (!hrDone.includes("짚을 것이 없었던 줄") || !hrDone.includes("틀린 줄이 아니다"))
    no("마감 화면이 무엇을 센 숫자인지 안 적는다. 두 사람이 거꾸로 읽는다");
  if (!hrDone.includes("B등급") || !hrDone.includes("통과 판정에는 안 쓴다"))
    no("내 소리는 네가: 자료 등급이 화면에 없다");

  /* ---- 22. 기기가 하나면 건네지 않는다 --------------------------------- */
  await A.evaluate(() => { S.rstep = {}; S.rhit = {}; S.solo = true; save();
                           renderHearme(); });
  const hrSolo = await text(A);
  if (!hrSolo.includes("건네지 않는다"))
    no("기기가 하나인데 건네라고 하거나 아무 말도 안 한다. 이 판은 돌려 보기가 안 된다");
  if (!(await A.$$("#hrmNone")).length)
    no("기기가 하나인데 이 화면이 듣는 쪽이 아니다. 대본은 종이에 있다");
  await A.evaluate(() => { S.solo = false; save(); renderHearme(); });

  /* ---- 23. 5분 시계 ---------------------------------------------------- */
  await A.evaluate(HRRESET);
  await tap(A, "#hrmGo", "5분 시계");
  await A.evaluate(() => { HRMCLK.left = 1; });
  await A.waitForTimeout(1500);
  if (!(await text(A)).includes("5분이 됐다"))
    no("내 소리는 네가: 5분 시계가 다 됐는데 끝났다는 말을 안 한다");

  /* =====================================================================
     전달 놀이 (T269). **소리와 되짚기.**
     ===================================================================== */
  const RLRESET = () => {
    S.rstep = {}; S.rseat = {}; S.rhit = {}; S.solo = false; S.soloHand = false;
    save();
    if (typeof turnForget === "function") turnForget("relay");
    RLY.said = null; RLY.ready = false;
    REVEAL.open = {};
    RLYCLK.left = 0; RLYCLK.over = false;
    renderRelay();
  };
  for (const p of [A, B]) {
    await p.evaluate(() => { S.device = null; save(); });
    await openPlay(p, "relay", "renderRelay");
  }
  /* ---- 24. 기기 쪽을 안 골랐으면 안 돈다 ------------------------------
     한 기기만 소리를 내야 하는 판이라 앞의 격차 판들과 같다.           */
  if (!(await text(A)).includes("이대로 안 돈다"))
    no("전달 놀이: 기기 쪽을 안 골랐는데 판이 그대로 돈다. 한 기기만 소리를 내야 한다");

  await A.evaluate(() => { S.device = "a"; save(); });
  await B.evaluate(() => { S.device = "b"; save(); });
  await A.evaluate(RLRESET); await B.evaluate(RLRESET);

  /* ---- 25. 되짚기 셈. **아는 답을 넣고 아는 수를 본다** ---------------- */
  const diffs = await A.evaluate(() => {
    function n(a, b) { return rlyDiff(a, b).off; }
    return {
      same: n("one two three four", "one two three four"),
      one: n("one two three four", "one X three four"),
      two: n("one two three four five six", "one X three four Y six"),
      run: n("one two three four five", "one X Y Z five"),
      empty: n("one two three four", ""),
      caps: n("One, two! THREE four.", "one two three four"),
    };
  });
  if (diffs.same !== 0) no("같은 글인데 틀어진 자리가 " + diffs.same + "군데다");
  if (diffs.one !== 1) no("한 낱말만 다른데 " + diffs.one + "군데로 센다");
  if (diffs.two !== 2) no("떨어진 두 자리가 다른데 " + diffs.two + "군데로 센다");
  if (diffs.run !== 1)
    no("이어 붙은 세 낱말이 " + diffs.run + "군데로 센다. 이어 붙은 것은 한 군데다");
  if (diffs.empty !== 1) no("빈 칸인데 " + diffs.empty + "군데다");
  if (diffs.caps !== 0)
    no("대소문자와 문장부호만 다른데 " + diffs.caps + "군데다. 그것은 안 본다");

  /* ---- 26. 원문이 펴기 전에 두 화면 어디에도 없다 ---------------------- */
  const withLine = async (p, v) => {
    await p.evaluate((v) => {
      if (!window.__rl) window.__rl = rlyLine;
      window.rlyLine = function () { return v; };
      renderRelay();
    }, v);
    const h = await pane(p);
    await p.evaluate(() => { window.rlyLine = window.__rl; renderRelay(); });
    return h;
  };
  let rlyLeak = 0;
  for (const p of [A, B]) {
    const a0 = await withLine(p, "aaaa bbbb cccc dddd eeee ffff");
    const a1 = await withLine(p, "gggg hhhh iiii jjjj kkkk llll");
    if (a0 !== a1) rlyLeak++;
  }
  if (rlyLeak) no("펴기 전인데 원문이 화면에 있다: " + rlyLeak + "곳");

  /* ---- 27. 소리를 내는 기기가 하나다 ----------------------------------- */
  const wr = (await A.$$("#rlyIn")).length ? A : B;
  const snd = wr === A ? B : A;
  if (!(await snd.$$("#rlySound")).length)
    no("처음 듣는 쪽에 소리 단추가 없다");
  if ((await wr.$$("#rlySound")).length)
    no("옮기는 쪽에 소리 단추가 있다. 소리는 한 기기에서만 난다");
  if (!(await text(snd)).includes("이어폰"))
    no("소리를 내는 기기가 이어폰을 안 묻는다 (round.md 13장)");
  if (!(await text(wr)).includes("상대 기기에 끼운다"))
    no("소리를 안 내는 기기가 왜 조용한지를 안 적는다");

  /* ---- 28. 펴기가 빈 칸에서 잠기고 적으면 켜진다 (T268 에 안 켜졌다) --- */
  if ((await wr.$$("[data-reveal]")).length)
    no("빈 칸인데 펴는 단추가 켜져 있다");
  await wr.click("#rlyIn");
  await wr.type("#rlyIn", "one X three four", { delay: 4 });
  await wr.waitForTimeout(250);
  if (!(await wr.$$("[data-reveal]")).length)
    no("다 적었는데 펴는 단추가 안 켜졌다. 두 사람이 펴지를 못한다");

  /* ---- 29. 펴면 되짚기가 뜨고 셈이 남는다 ------------------------------ */
  await wr.evaluate(() => {
    window.__rl2 = rlyLine;
    window.rlyLine = function () { return "one two three four"; };
    renderRelay();
  });
  await tap(wr, "[data-reveal]", "펴기");
  const shown = await text(wr);
  if (!/틀어진 자리 1군데/.test(shown))
    no("편 뒤에 틀어진 자리 수가 안 뜨거나 하나가 아니다");
  if (!shown.includes("다음에 들을 자리"))
    no("틀어진 것이 벌이 아니라는 말이 화면에 없다");
  await tap(wr, "#rlyNext", "다음 바퀴");
  const rr = await wr.evaluate(() => S.rhit["relay|" + today()] || {});
  await wr.evaluate(() => { window.rlyLine = window.__rl2; });
  if (rr.off !== 1 || rr.done !== 1)
    no("한 바퀴를 돌았는데 셈이 틀어짐 " + rr.off + " 바퀴 " + rr.done + " 이다");

  /* ---- 30. 자리가 한 바퀴마다 바뀐다 ----------------------------------- */
  await A.evaluate(RLRESET); await B.evaluate(RLRESET);
  const rlySeats = [];
  for (let ln = 0; ln < 3; ln++) {
    rlySeats.push((await A.$$("#rlyIn")).length ? "옮기는 쪽" : "처음 듣는 쪽");
    for (const p of [A, B])
      await p.evaluate(() => { roundStepSet("relay", roundStep("relay") + 1);
                               renderRelay(); });
  }
  const rlyFlips = [];
  for (let i = 1; i < rlySeats.length; i++)
    if (rlySeats[i] !== rlySeats[i - 1]) rlyFlips.push(i);
  if (rlyFlips.length !== rlySeats.length - 1)
    no("전달 놀이: 자리가 바뀐 바퀴가 [" + rlyFlips.join(",") +
       "] 이다. 한 바퀴마다 바뀌어야 한다");

  /* ---- 31. 마감 화면과 등급과 시계 ------------------------------------- */
  await A.evaluate(RLRESET);
  await A.evaluate(() => { roundStepSet("relay", 99); renderRelay(); });
  const rlyDone = await text(A);
  if (!rlyDone.includes("안 들리는 자리"))
    no("마감 화면이 틀어진 자리가 무엇인지 안 적는다");
  if (!rlyDone.includes("B등급") || !rlyDone.includes("통과 판정에는 안 쓴다"))
    no("전달 놀이: 자료 등급이 화면에 없다");
  await A.evaluate(RLRESET);
  await tap(A, "#rlyGo", "5분 시계");
  await A.evaluate(() => { RLYCLK.left = 1; });
  await A.waitForTimeout(1500);
  if (!(await text(A)).includes("5분이 됐다"))
    no("전달 놀이: 5분 시계가 다 됐는데 끝났다는 말을 안 한다");

  /* =====================================================================
     이어달리기 (T272). **가릴 것이 없는 판.**
     ===================================================================== */
  const CHRESET = () => {
    S.rstep = {}; S.rseat = {}; S.rhit = {}; S.solo = false; save();
    if (typeof turnForget === "function") turnForget("chain");
    CHN.n = 0; CHNCLK.left = 0; CHNCLK.over = false;
    renderChain();
  };
  for (const p of [A, B]) {
    await p.evaluate(() => { S.device = null; save(); });
    await openPlay(p, "chain", "renderChain");
  }
  /* ---- 32. 기기 쪽을 안 골라도 돈다. 차례만 못 말한다 ------------------ */
  const offCh = await text(A);
  if (offCh.includes("이대로 안 돈다"))
    no("이어달리기: 기기 쪽을 안 골랐다고 판을 막는다. 이 판은 가릴 것이 없다");
  if (!offCh.includes("누구 차례인지는 못 말한다"))
    no("이어달리기: 차례를 못 말한다는 것을 화면이 안 적는다");
  if (!(await A.$$("#chnAdd")).length)
    no("이어달리기: 기기 쪽을 안 골랐다고 마디 단추가 없어졌다");

  await A.evaluate(() => { S.device = "a"; save(); });
  await B.evaluate(() => { S.device = "b"; save(); });
  await A.evaluate(CHRESET); await B.evaluate(CHRESET);

  /* ---- 33. 감춘 자리가 없다 -------------------------------------------- */
  for (const [p, who] of [[A, "A"], [B, "B"]])
    if ((await p.$$("#playPane .vhid")).length)
      no("이어달리기(" + who + "): 가린 자리가 있다. 이 판은 가릴 것이 없다");

  /* ---- 34. 두 기기가 같은 것을 보이고 다른 차례를 말한다 ---------------- */
  const chunksOf = (p) => p.$$eval("#playPane .chnk", (n) => n.map((x) => x.textContent));
  const ca = await chunksOf(A), cb = await chunksOf(B);
  if (!ca.length) no("이어달리기: 청크가 화면에 없다");
  if (JSON.stringify(ca) !== JSON.stringify(cb))
    no("두 기기의 청크 목록이 다르다. 이 판은 둘이 같은 것을 본다");
  const turnOf = (p) => p.evaluate(() => {
    var m = /지금 (던지는 쪽|붙이는 쪽)/.exec(document.querySelector("#playPane").innerText);
    return m ? m[1] : null;
  });
  if ((await turnOf(A)) === (await turnOf(B)))
    no("두 기기가 같은 차례를 말한다. 자리는 갈려야 한다");

  /* ---- 35. 마디 세기. **제일 긴 것은 줄지 않는다** --------------------- */
  const chRec = () => A.evaluate(() => S.rhit["chain|" + today()] || {});
  const marks = () => A.evaluate(() => CHN.n);
  for (let i = 0; i < 3; i++) { await tap(A, "#chnAdd", "이었다"); }
  let ch = await chRec();
  if ((await marks()) !== 3 || ch.best !== 3)
    no("세 마디를 이었는데 마디 " + (await marks()) + " 제일 긴 것 " + ch.best + " 이다");
  await tap(A, "#chnFold", "접는다");
  ch = await chRec();
  if ((await marks()) !== 0) no("접었는데 마디가 0으로 안 돌아갔다");
  if (ch.best !== 3 || ch.folds !== 1)
    no("접은 뒤 제일 긴 것 " + ch.best + " 접은 횟수 " + ch.folds + " 이다");
  /* 더 짧은 사슬을 하나 돌린다. **제일 긴 것이 줄면 안 된다.** */
  await tap(A, "#chnAdd", "이었다");
  await tap(A, "#chnFold", "접는다");
  ch = await chRec();
  if (ch.best !== 3)
    no("짧은 사슬 뒤에 제일 긴 것이 " + ch.best + " 로 줄었다. 줄면 안 된다");

  /* ---- 36. 접으면 자리가 바뀐다 ----------------------------------------- */
  await A.evaluate(CHRESET); await B.evaluate(CHRESET);
  const t0 = await turnOf(A);
  await tap(A, "#chnFold", "접는다");
  if ((await turnOf(A)) === t0)
    no("접었는데 자리가 안 바뀌었다. 한 번 접힐 때마다 바뀐다 (R34)");

  /* ---- 37. 누가 끊었는지 묻는 칸이 없다 (R32) --------------------------- */
  const asks = await A.evaluate(() => {
    var names = [S.names.a, S.names.b];
    return Array.prototype.slice.call(
      document.querySelectorAll("#playPane button, #playPane select, #playPane input"))
      .filter(function (b) {
        var s = (b.textContent || "") + " " + (b.value || "");
        return names.some(function (n) { return n && s.indexOf(n) >= 0; });
      }).length;
  });
  if (asks) no("접은 뒤에 누가 끊었는지 고르는 자리가 " + asks +
               "개 있다. 물으면 그것이 곧 셈이 된다 (R32)");

  /* ---- 38. 마감 화면. **절반이라고 하면 안 된다** ----------------------- */
  await A.evaluate(CHRESET);
  await tap(A, "#chnAdd", "이었다");
  await tap(A, "#chnAdd", "이었다");
  await tap(A, "#chnGo", "5분 시계");
  await A.evaluate(() => { CHNCLK.left = 1; });
  await A.waitForTimeout(1500);
  const chDone = await text(A);
  if (!chDone.includes("5분이 됐다"))
    no("이어달리기: 5분 시계가 다 됐는데 끝났다는 말을 안 한다");
  if (!/제일 길게 간 것이 2마디/.test(chDone))
    no("마감 화면이 제일 길게 간 마디 수를 안 적거나 둘이 아니다");
  if (chDone.includes("절반"))
    no("마감 화면이 이 수를 절반이라고 적는다. 이 판은 두 기기에 같은 수가 남는다");
  if (!chDone.includes("같은 수"))
    no("두 기기에 같은 수가 있어야 한다는 말이 마감 화면에 없다");
  if (!chDone.includes("누가 끊었는지는 안 센다"))
    no("마감 화면이 누가 끊었는지 안 센다는 말을 안 한다 (R32)");
  if (!chDone.includes("B등급")) no("이어달리기: 자료 등급이 화면에 없다");

  /* =====================================================================
     둘이 한 문장 (T275). **가리는데 셈은 절반이 아니다.**
     ===================================================================== */
  const TWRESET = () => {
    S.rstep = {}; S.rseat = {}; S.rhit = {}; S.solo = false; save();
    if (typeof turnForget === "function") turnForget("twohalf");
    TWH.open = null; TWHCLK.left = 0; TWHCLK.over = false;
    renderTwohalf();
  };
  for (const p of [A, B]) {
    await p.evaluate(() => { S.device = null; save(); });
    await openPlay(p, "twohalf", "renderTwohalf");
  }
  /* ---- 39. 기기 쪽을 안 골랐으면 안 돈다 (격차 판이다) ----------------- */
  if (!(await text(A)).includes("이대로 안 돈다"))
    no("둘이 한 문장: 기기 쪽을 안 골랐는데 판이 그대로 돈다. 각자 절반씩 봐야 한다");

  await A.evaluate(() => { S.device = "a"; save(); });
  await B.evaluate(() => { S.device = "b"; save(); });
  await A.evaluate(TWRESET); await B.evaluate(TWRESET);

  /* ---- 40. 각자 자기 토막만 본다 ---------------------------------------
     앞 토막을 흔들면 앞을 받는 쪽만 바뀌고 뒤를 받는 쪽은 안 바뀐다.     */
  const withHalf = async (p, side, v) => {
    await p.evaluate((arg) => {
      if (!window.__ti) window.__ti = twhItems;
      window.twhItems = function () {
        var xs = window.__ti(); if (!xs) return xs;
        return xs.map(function (x) {
          var y = {}; for (var k in x) y[k] = x[k]; y[arg.side] = arg.v; return y;
        });
      };
      renderTwohalf();
    }, { side: side, v: v });
    const h = await pane(p);
    await p.evaluate(() => { window.twhItems = window.__ti; renderTwohalf(); });
    return h;
  };
  const isFront = (p) => p.evaluate(() =>
    /앞을 받는 쪽<\/b>/.test(document.querySelector("#playPane").innerHTML));
  let fr = (await isFront(A)) ? A : B, bk = (await isFront(A)) ? B : A;
  if ((await isFront(A)) === (await isFront(B)))
    no("둘이 한 문장: 두 기기가 같은 토막을 받았다");
  let twLeak = 0, twBlind = 0;
  const twSeats = [];
  for (let ln = 0; ln < 6; ln++) {
    /* 뒤 토막을 흔든다. **앞을 받는 쪽은 한 글자도 안 달라야 한다.** */
    const f0 = await withHalf(fr, "b", "zzzz aaaa");
    const f1 = await withHalf(fr, "b", "qqqq bbbb");
    if (f0 !== f1) twLeak++;
    /* 앞 토막을 흔든다. **앞을 받는 쪽은 달라야 한다.** */
    const g0 = await withHalf(fr, "a", "zzzz aaaa");
    const g1 = await withHalf(fr, "a", "qqqq bbbb");
    if (g0 === g1) twBlind++;
    twSeats.push((await isFront(A)) ? "앞" : "뒤");
    for (const p of [A, B])
      await p.evaluate(() => { roundStepSet("twohalf", roundStep("twohalf") + 1);
                               renderTwohalf(); });
    const t = fr; fr = bk; bk = t;          // 문장마다 바뀐다
  }
  if (twLeak) no("앞을 받는 쪽 화면이 뒤 토막에 따라 달라진다: " + twLeak + "문장");
  if (twBlind) no("앞을 받는 쪽 화면이 앞 토막에 따라 안 달라진다: " + twBlind + "문장");

  /* ---- 41. 자리가 문장마다 바뀐다 --------------------------------------- */
  const twFlips = [];
  for (let i = 1; i < twSeats.length; i++)
    if (twSeats[i] !== twSeats[i - 1]) twFlips.push(i);
  if (twFlips.length !== twSeats.length - 1)
    no("둘이 한 문장: 자리가 바뀐 문장이 [" + twFlips.join(",") +
       "] 이다. 문장마다 바뀌어야 한다");

  /* ---- 42. 붙었다와 못 붙었다. **펴 보는 것이 벌이 아니다** ------------- */
  await A.evaluate(TWRESET); await B.evaluate(TWRESET);
  const twRec = () => A.evaluate(() => S.rhit["twohalf|" + today()] || {});
  await tap(A, "#twhYes", "붙었다");
  let tw = await twRec();
  if (tw.joined !== 1 || tw.done !== 1)
    no("붙었다를 눌렀는데 셈이 붙음 " + tw.joined + " 돈 것 " + tw.done + " 이다");
  await tap(A, "#twhNo", "안 붙는다. 펴 본다");
  tw = await twRec();
  if (tw.joined !== 1) no("펴 봤는데 붙은 셈이 " + tw.joined + " 로 늘었다");
  if (tw.done !== 2) no("펴 봤는데 돈 셈이 " + tw.done + " 이다");
  const opened = await text(A);
  if (!opened.includes("펴 보는 것이 벌이 아니다"))
    no("펴 본 자리에 벌이 아니라는 말이 없다 (원칙 4)");
  /* 편 화면에는 두 토막이 붙어 있어야 한다. */
  const whole = await A.evaluate(() => {
    var xs = twhItems(); var x = xs[roundStep("twohalf")];
    return document.querySelector("#playPane").innerText.indexOf(x.a + " " + x.b) >= 0;
  });
  if (!whole) no("편 화면에 원래 문장이 통째로 없다");

  /* ---- 43. 마감 화면. **절반이 아니다** --------------------------------- */
  await A.evaluate(TWRESET);
  await A.evaluate(() => { roundStepSet("twohalf", 99); renderTwohalf(); });
  const twDone = await text(A);
  if (twDone.includes("이 기기 숫자는 그 절반이다"))
    no("마감 화면이 이 수를 절반이라고 적는다. 둘이 같이 판정하는 판이다");
  if (!twDone.includes("절반이 아니다"))
    no("절반이 아니라는 말이 마감 화면에 없다");

  /* ---- 44. A등급에는 없는 금지를 안 붙인다 ------------------------------ */
  if (!twDone.includes("A등급"))
    no("둘이 한 문장: 자료가 A등급이라고 화면이 말하지 않는다");
  if (twDone.includes("통과 판정에는 안 쓴다"))
    no("A등급 자료에 통과 판정 금지가 붙었다. 없는 금지다");

  /* ---- 45. 4분 시계 ----------------------------------------------------- */
  await A.evaluate(TWRESET);
  await tap(A, "#twhGo", "4분 시계");
  await A.evaluate(() => { TWHCLK.left = 1; });
  await A.waitForTimeout(1500);
  if (!(await text(A)).includes("4분이 됐다"))
    no("둘이 한 문장: 4분 시계가 다 됐는데 끝났다는 말을 안 한다");

  /* =====================================================================
     겹치면 지운다 (T277). **역할이 없는 판.**
     ===================================================================== */
  const OVRESET = () => {
    S.rstep = {}; S.rseat = {}; S.rhit = {}; S.solo = false; save();
    OVL.said = ""; OVL.heard = ""; OVL.ready = false; OVL.keep = []; OVL.hit = null;
    REVEAL.open = {};
    OVLCLK.left = 0; OVLCLK.over = false;
    renderOverlap();
  };
  for (const p of [A, B]) await openPlay(p, "overlap", "renderOverlap");
  await A.evaluate(OVRESET); await B.evaluate(OVRESET);

  /* ---- 46. 겹침 판정. **아는 답을 넣고 아는 답을 본다** ----------------
     기계가 판정하는 자리라 셈을 잰다. 전달 놀이와 같은 갈래다 (T269).  */
  const ovSame = await A.evaluate(() => ({
    plain: ovlSame("water", "water"),
    caps: ovlSame("Water", "water"),
    punct: ovlSame("water!", " water "),
    apos: ovlSame("don\u2019t", "don't"),
    diff: ovlSame("water", "river"),
    empty: ovlSame("", ""),
    oneEmpty: ovlSame("water", ""),
  }));
  if (!ovSame.plain) no("같은 낱말을 다르다고 한다");
  if (!ovSame.caps) no("대소문자만 다른데 다르다고 한다");
  if (!ovSame.punct) no("문장부호와 빈칸만 다른데 다르다고 한다");
  if (!ovSame.apos) no("굽은 홑따옴표와 곧은 것을 다르다고 한다");
  if (ovSame.diff) no("다른 낱말을 같다고 한다");
  if (ovSame.empty) no("둘 다 빈 칸인데 같다고 한다. 빈 것은 겹친 것이 아니다");
  if (ovSame.oneEmpty) no("한쪽이 빈 칸인데 같다고 한다");

  /* ---- 47. 두 기기가 같은 맞힐 것을 본다 -------------------------------- */
  const tgtOf = (p) => p.evaluate(() => ovlTarget());
  if ((await tgtOf(A)) !== (await tgtOf(B)))
    no("두 기기가 다른 맞힐 것을 본다. 둘 다 그것을 알아야 한다");
  const shownTgt = await A.evaluate(() =>
    document.querySelector("#playPane .ovltgt") &&
    document.querySelector("#playPane .ovltgt").textContent);
  if (!shownTgt || shownTgt !== (await tgtOf(A)))
    no("맞힐 것이 화면에 안 뜨거나 다른 것이 뜬다");

  /* ---- 48. 역할이 없다고 화면이 적는다 ---------------------------------- */
  const ovText = await text(A);
  if (!ovText.includes("역할이 없다"))
    no("역할이 없다는 것을 화면이 안 적는다. 비우면 빠뜨린 것으로 읽힌다");
  if (/이 기기 자리/.test(ovText))
    no("역할이 없는 판에 자리 표시가 있다");

  /* ---- 49. 펴기 전에 상대 칸과 판정이 없다 ------------------------------
     **처음에는 "내 단서가 화면에 없어야 한다" 를 쟀다. 그것은 없는 요구였다.**
     이 판은 자기 단서를 자기가 본다. 감춰야 하는 것은 상대 단서인데
     이 기기에는 상대 단서가 애초에 없다. 사람이 나중에 친다.
     기기가 격차를 만드는 판이 아니라 **입으로 만드는 판**이다.

     깨 보고 알았다. 화면에 내 단서를 크게 그려 놓아도 검사가 조용했다.
     검사가 약한 것이 아니라 **안 깨지는 자리를 깬 것**이었다 (T252 의 셋째).
     진짜로 재야 하는 것은 **펴기 전에 판정이 안 뜨는가** 다.
     먼저 판정을 보면 자기 것을 바꾸게 되고 그러면 동시 공개가 아니다. */
  if ((await A.$$("#playPane [data-reveal]")).length)
    no("빈 칸인데 펴는 단추가 켜져 있다");
  await A.click("#ovlIn");
  await A.type("#ovlIn", "water", { delay: 4 });
  await A.waitForTimeout(250);
  if (!(await A.$$("#playPane [data-reveal]")).length)
    no("다 적었는데 펴는 단추가 안 켜졌다");
  if ((await A.$$("#ovlHeard")).length)
    no("펴기 전인데 상대 낱말 칸이 있다. 그것은 편 뒤에 나온다");
  if ((await A.$$("#ovlNext")).length || (await A.$$("#ovlHit")).length)
    no("펴기 전인데 판정이 떠 있다. 먼저 보면 자기 것을 바꾸게 된다");

  /* ---- 50. 겹치면 지우고 안 겹치면 남는다 ------------------------------- */
  await tap(A, "#playPane [data-reveal]", "펴기");
  await A.click("#ovlHeard");
  await A.type("#ovlHeard", "Water!", { delay: 4 });
  await A.waitForTimeout(250);
  const hit1 = await text(A);
  if (!hit1.includes("겹쳤다. 둘 다 지운다"))
    no("글자만 다른 같은 낱말인데 겹쳤다고 안 한다. 판정이 글자를 안 따라간다");
  if (!hit1.includes("손해가 아니다"))
    no("지워진 것이 손해가 아니라는 말이 화면에 없다");
  await tap(A, "#ovlNext", "다음 바퀴");
  let ov = await A.evaluate(() => S.rhit["overlap|" + today()] || {});
  if (ov.wiped !== 2) no("겹쳤는데 지워진 단서가 " + ov.wiped + "개다. 둘이어야 한다");
  const keptAfterWipe = await A.evaluate(() => OVL.keep.length);
  if (keptAfterWipe !== 0) no("겹쳤는데 단서가 남았다: " + keptAfterWipe + "개");

  await A.click("#ovlIn");
  await A.type("#ovlIn", "river", { delay: 4 });
  await A.waitForTimeout(250);
  await tap(A, "#playPane [data-reveal]", "펴기");
  await A.click("#ovlHeard");
  await A.type("#ovlHeard", "boat", { delay: 4 });
  await A.waitForTimeout(250);
  if (!(await text(A)).includes("안 겹쳤다. 둘 다 남는다"))
    no("다른 낱말인데 안 겹쳤다고 안 한다");
  await tap(A, "#ovlNext", "다음 바퀴");
  const kept = await A.evaluate(() => OVL.keep.slice());
  if (kept.length !== 2 || kept.indexOf("river") < 0 || kept.indexOf("boat") < 0)
    no("안 겹친 단서 둘이 안 남았다: " + JSON.stringify(kept));

  /* ---- 51. 닿으면 몇 바퀴인지 적는다 ------------------------------------ */
  await A.click("#ovlIn");
  await A.type("#ovlIn", "flow", { delay: 4 });
  await A.waitForTimeout(250);
  await tap(A, "#playPane [data-reveal]", "펴기");
  await A.click("#ovlHeard");
  await A.type("#ovlHeard", "stream", { delay: 4 });
  await A.waitForTimeout(250);
  await tap(A, "#ovlHit", "남은 단서로 닿았다");
  const ovDone = await text(A);
  if (!/닿았다\. 3바퀴 만이다/.test(ovDone))
    no("닿은 바퀴 수가 안 뜨거나 셋이 아니다");
  if (!ovDone.includes("역할이 없어서"))
    no("마감 화면이 역할이 없다는 것을 안 적는다");
  if (ovDone.includes("이 기기 숫자는 그 절반이다"))
    no("마감 화면이 이 수를 절반이라고 적는다. 둘이 같은 일을 하는 판이다");
  if (!ovDone.includes("B등급") || !ovDone.includes("통과 판정에는 안 쓴다"))
    no("겹치면 지운다: 자료 등급이 화면에 없다");

  /* ---- 52. 4분 시계 ----------------------------------------------------- */
  await A.evaluate(OVRESET);
  await tap(A, "#ovlGo", "4분 시계");
  await A.evaluate(() => { OVLCLK.left = 1; });
  await A.waitForTimeout(1500);
  if (!(await text(A)).includes("4분이 됐다"))
    no("겹치면 지운다: 4분 시계가 다 됐는데 끝났다는 말을 안 한다");

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 3).join(" / "));
  await browser.close();

  /* **판정 줄이 맨 뒤에 온다.** `all.py` 가 마지막 뜻있는 줄을 그 검사의 판정으로 읽는다.
     기계가 안 보는 것을 뒤에 두면 표에 그 줄이 뜨고 실패 수가 안 보인다. */
  console.log("**기계가 안 보는 것: 상 건너로 보이는 화면, 소리가 정말 갈렸는지**");
  console.log("판 7개 / 거울 10 / 한 줄 바꾸기 6 / 내 소리는 네가 7 / 전달 놀이 8 / " +
              "이어달리기 15 / 둘이 한 문장 17 / 겹치면 지운다: 겹침 셈 7판, " +
              "같은 맞힐 것 2판, 역할 없음 2판, 펴기 전 3판, 지우고 남기기 6판, " +
              "마감 4판, 시계 1판 / 실패 " + fails.length);
  process.exit(fails.length ? 1 : 0);
})();
