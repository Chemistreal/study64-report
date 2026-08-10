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
 * ## 숫자가 문서에서 오는 판을 잰다 (T281)
 *
 * 배속 사다리다. 이 판은 세 칸도 3연속도 2연속도 화면에 안 적혀 있다.
 * 다 `ladder.js` 에서 오고 그것은 `docs/bench_music.md` 6장에서 파생된다.
 *
 * 그래서 **검사도 숫자를 안 적는다.** 자료에서 읽어 그 수만큼 눌러 본다.
 * 검사에 3을 적으면 문서를 4로 고쳤을 때 검사가 빨간불이 되고,
 * 그것은 앱이 깨진 것이 아니라 **검사가 안 따라온 것**이다.
 * 문서 하나를 고쳐 앱과 검사가 같이 따라오는지가 이 판에서 잴 것이다.
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
  /* **쥔 손으로 안 누르고 이름으로 누른다.** 판 화면은 누를 때마다 `innerHTML` 을
     통째로 갈아 끼운다. 위에서 잡아 둔 손잡이가 그 사이에 떨어져 나가면
     "Element is not attached to the DOM" 이 난다.

     T280 에 다섯 자리를 이 꼴로 고쳤는데 **`tap` 자신이 그대로였다.**
     그래서 T290 뒤에 되받아치기에서 한 번 흔들렸다. 다시 돌리면 초록불이 되는
     빨간불이 제일 나쁘다. 진짜 빨간불을 흔들리는 것으로 읽게 만든다. */
  /* **3초에서 8초로 늘렸다.** 3초는 T260 에 정한 값이고 그때 막으려던 것은
     없는 것을 누르며 기본 30초를 기다리는 일이었다. 그것은 위의 있는지 보는 줄이
     이미 막는다. 남은 3초는 **기계가 바쁠 때 눌리는 것을 못 누른 것으로 만든다.**
     T293 에 그렇게 한 번 흔들렸다. 없는 것은 여전히 바로 실패로 난다. */
  try { await page.click(sel, { timeout: 8000 }); return true; }
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
       그 칸을 보고 나아가면 `mirTarget` 이 아직 없다. 실제로 그렇게 났다.

       **묶음은 하나다.** 열한 판 중 아무 판에 오타가 나도 여기서 터진다.
       그때 "Timeout" 만 나오면 거울 판이 깨진 줄 안다. T290 */
    try {
      await page.waitForFunction(() => typeof window.mirTarget === "function",
                                 null, { timeout: 8000 });
    } catch (e) {
      const n = await page.evaluate(() =>
        (typeof PLAYREND === "object" && PLAYREND) ? Object.keys(PLAYREND).length : -1);
      console.log("[실패] 판 묶음이 안 붙었다. 붙은 판이 " + n + "개다. " +
        "**0이면 어느 판의 오타든 여기서 터진다.** 거울 판만의 일이 아니다. " +
        "node --check eng2p/out/app/plays.js 를 본다");
      console.log("판 화면 검사가 못 돌았다. 통과가 아니다.");
      await browser.close();
      process.exit(1);
    }
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
  /* **판 묶음은 하나다** (T259). 한 판에 오타가 나면 열한 판이 다 안 읽히고
     여기서 8초를 기다리다 터진다. 그때 나오는 말이 "Timeout" 뿐이면
     이 판이 깨진 줄 안다. 실제로는 아무 판이나 깨졌을 수 있다. T290 */
  const openPlay = async (p, id, fn) => {
    await p.evaluate((id) => { PLAY.at = id; renderPlayTab(); }, id);
    try {
      await p.waitForFunction((f) => typeof window[f] === "function", fn,
                              { timeout: 8000 });
    } catch (e) {
      const loaded = await p.evaluate(() => Object.keys(PLAYREND).length);
      no("판 " + id + " 를 열었는데 " + fn + " 가 안 생겼다. " +
         "붙은 판이 " + loaded + "개다. **0이면 판 묶음이 통째로 안 읽힌 것이고 " +
         "그러면 어느 판의 오타든 여기서 터진다.** node --check out/app/plays.js 를 본다");
      throw e;
    }
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

  /* =====================================================================
     배속 사다리 (T281). **숫자가 문서에서 오는 판.**
     ===================================================================== */
  const LDRESET = () => {
    S.rstep = {}; S.rseat = {}; S.rhit = {}; S.solo = false; save();
    if (typeof turnForget === "function") turnForget("ladder");
    LAD.ok = 0; LAD.no = 0; LADCLK.left = 0; LADCLK.over = false;
    renderLadder();
  };
  for (const p of [A, B]) await openPlay(p, "ladder", "renderLadder");
  await A.evaluate(LDRESET); await B.evaluate(LDRESET);

  /* ---- 53. 규격이 자료에서 온다. **검사도 숫자를 안 적는다** ------------ */
  const spec = await A.evaluate(() => ({
    up: DATA.ladder.up, down: DATA.ladder.down,
    n: DATA.ladder.steps.length,
    labels: DATA.ladder.steps.map((s) => s.label || String(s.rate)),
    judges: DATA.ladder.steps.map((s) => s.judge),
    say: DATA.ladder.downSay,
    grade: DATA.ladder.grade,
  }));
  if (!(spec.up >= 2) || !(spec.down >= 1))
    no("사다리 규격의 오르내리는 수가 이상하다: 오름 " + spec.up + " 내림 " + spec.down);
  if (spec.n < 3) no("사다리 칸이 " + spec.n + "개다. 셋 아래로는 아직이라는 자리가 없다");
  if (new Set(spec.judges).size !== spec.judges.length)
    no("칸마다 볼 것이 같다. 같은 것을 여러 번 재는 것이 아니다");
  if (spec.judges.some((x) => !x)) no("판정 기준이 빈 칸이 있다");

  /* ---- 54. 지금 칸의 볼 것이 화면에 있다 -------------------------------- */
  const ladText0 = await text(A);
  if (ladText0.indexOf(spec.judges[0]) < 0)
    no("지금 칸에서 볼 것이 화면에 없다. 없으면 세 칸이 다 '잘했나' 가 된다");
  if (ladText0.indexOf(spec.labels[0] + " 배속") < 0)
    no("배속이 문서가 적은 글자로 안 뜬다: " + spec.labels[0]);

  /* ---- 55. 오르는 수만큼 누르면 한 칸 오른다 ---------------------------- */
  const ladStepNow = () => A.evaluate(() => roundStep("ladder"));
  for (let i = 0; i < spec.up - 1; i++) {
    await tap(A, "#ladYes", "됐다 " + (i + 1));
    if ((await ladStepNow()) !== 0)
      no("오르는 수를 채우기 전에 칸이 올랐다: " + (i + 1) + "번째");
  }
  await tap(A, "#ladYes", "됐다 " + spec.up);
  if ((await ladStepNow()) !== 1)
    no(spec.up + "번 됐는데 칸이 안 올랐다");
  const ladText1 = await text(A);
  if (ladText1.indexOf(spec.judges[1]) < 0)
    no("칸이 올랐는데 볼 것이 안 바뀌었다");

  /* ---- 56. 내리는 수만큼 누르면 한 칸 내린다. **말은 문서에서 온다** ---- */
  for (let i = 0; i < spec.down - 1; i++) {
    await tap(A, "#ladNo", "한 번 더 " + (i + 1));
    if ((await ladStepNow()) !== 1)
      no("내리는 수를 채우기 전에 칸이 내렸다: " + (i + 1) + "번째");
  }
  await tap(A, "#ladNo", "한 번 더 " + spec.down);
  if ((await ladStepNow()) !== 0)
    no(spec.down + "번 안 됐는데 칸이 안 내렸다");
  const ladText2 = await text(A);
  if (ladText2.indexOf(spec.say) < 0)
    no("내릴 때 문서가 정한 말이 안 뜬다: " + spec.say);
  /* **내리는 그 자리만 본다.** 처음에는 화면 전체에서 "실패" 를 찾았는데
     등급 설명문의 "못 찾으면 실패로 낸다" 를 물었다. 그것은 파생기가 하는 일을
     적은 말이지 학습자에게 하는 말이 아니다.
     **넓게 보면 엉뚱한 자리를 문다.** T249 와 같은 갈래다. */
  const ladSaid = await A.evaluate(() => {
    var e = document.getElementById("ladTurn");
    return e ? e.innerText : "";
  });
  if (/실패|못했|틀렸/.test(ladSaid))
    no("내리는 자리에 실패라고 적는다. 사람이 아니라 다음에 할 일을 말한다 (T175): " +
       ladSaid.slice(0, 40));

  /* ---- 57. 연달아 센 것이 칸을 옮기면 0으로 돌아간다 -------------------- */
  const okNow = () => A.evaluate(() => LAD.ok);
  if ((await okNow()) !== 0) no("칸을 옮겼는데 연달아 센 것이 안 지워졌다");

  /* ---- 58. 제일 높은 칸은 내려가도 안 준다 ------------------------------ */
  let ld = await A.evaluate(() => S.rhit["ladder|" + today()] || {});
  if (ld.best !== 1)
    no("올랐다 내렸는데 제일 높은 칸이 " + ld.best + " 다. 1이어야 한다");

  /* ---- 59. 맨 아래에서 더 내려가지 않는다 ------------------------------- */
  for (let i = 0; i < spec.down + 1; i++) await tap(A, "#ladNo", "바닥에서 한 번 더");
  if ((await ladStepNow()) !== 0) no("맨 아래인데 더 내려갔다");

  /* ---- 60. 두 기기가 같은 토막과 같은 칸을 본다 ------------------------- */
  await A.evaluate(LDRESET); await B.evaluate(LDRESET);
  const pieceOf = (p) => p.evaluate(() => JSON.stringify(ladPiece()));
  if ((await pieceOf(A)) !== (await pieceOf(B)))
    no("두 기기가 다른 토막을 본다");
  const turnLd = (p) => p.evaluate(() => {
    var m = /이 기기 자리 (말하는 쪽|세는 쪽)/.exec(
      document.querySelector("#playPane").innerText);
    return m ? m[1] : null;
  });
  if ((await turnLd(A)) === (await turnLd(B)))
    no("두 기기가 같은 자리다. 한 칸 오를 때마다 바뀐다");

  /* ---- 61. 등급과 시계 -------------------------------------------------- */
  if (spec.grade === "A" && (await text(A)).includes("통과 판정에는 안 쓴다"))
    no("A등급 자료에 통과 판정 금지가 붙었다");
  await tap(A, "#ladGo", "시계");
  await A.evaluate(() => { LADCLK.left = 1; });
  await A.waitForTimeout(1500);
  const ldOver = await text(A);
  if (!/분이 됐다/.test(ldOver))
    no("배속 사다리: 시계가 다 됐는데 끝났다는 말을 안 한다");
  if (!ldOver.includes("닿은 제일 높은 칸"))
    no("마감 화면이 무엇을 센 숫자인지 안 적는다");

  /* =====================================================================
     3초 벽 (T284). **한 시계가 한 장에 두 번 서는 판.**

     이 판이 앞의 여덟과 다른 자리가 넷이다.

       단서가 한쪽에만   받는 쪽 화면에 재료도 정답도 한 글자도 없어야 한다
       시계가 한쪽에만   두 기기가 각자 재면 받는 쪽이 스스로 판정하게 된다
       대신 받기         못 받으면 같은 초를 다시 주고 **그것도 받은 것으로 센다**
       미룬 장           둘 다 못 받으면 다음 판으로 간다. **두 덱이 갈리면 안 된다**

     **검사도 숫자를 안 적는다.** 열 장도 다섯 장도 제한시간도 `DATA.wall` 에서
     읽는다. T281 에 정한 그대로다. 규칙서 6.2 를 고치면 앱과 검사가 같이 따라온다.
     ===================================================================== */
  const WLRESET = () => {
    S.rstep = {}; S.rseat = {}; S.rhit = {}; S.solo = false; S.soloHand = false;
    S.device = S.device || "a"; save();
    if (typeof turnForget === "function") turnForget("wall");
    WAL.stage = "ask"; walClockReset();
    renderWall();
  };
  for (const p of [A, B]) await openPlay(p, "wall", "renderWall");
  await A.evaluate(WLRESET); await B.evaluate(WLRESET);

  /* ---- 62. 규격이 자료에서 온다 ----------------------------------------- */
  const wspec = await A.evaluate(() => ({
    end: DATA.wall.end, swap: DATA.wall.swap, cap: DATA.wall.cap,
    grade: DATA.wall.grade, pool: walPool().length,
    deck: walDeck().map((c) => c.id),
    secs: walDeck().map((c) => c.sec),
  }));
  if (!(wspec.end >= 2)) no("3초 벽: 도는 장수가 " + wspec.end + " 다");
  if (!(wspec.swap >= 1) || wspec.swap >= wspec.end)
    no("3초 벽: 자리가 바뀌는 장수가 " + wspec.swap + " 다. 끝 조건보다 작아야 한다");
  if (wspec.deck.length !== wspec.end)
    no("3초 벽: 한 판이 " + wspec.deck.length + "장이다. 자료는 " + wspec.end + " 라고 적었다");
  if (new Set(wspec.deck).size !== wspec.deck.length)
    no("3초 벽: 한 판에 같은 장이 두 번 나온다. 두 번째는 압박이 아니다");
  if (wspec.secs.some((s) => !(s > 0 && s <= wspec.cap)))
    no("3초 벽: 윗선을 넘는 초가 섞였다: " + wspec.secs.join(" "));

  /* ---- 63. 두 기기가 같은 덱을 만든다 ----------------------------------- */
  const wdeckOf = (p) => p.evaluate(() => walDeck().map((c) => c.id).join(","));
  if ((await wdeckOf(A)) !== (await wdeckOf(B)))
    no("3초 벽: 두 기기가 다른 덱을 낸다. 같은 장을 봐야 한다");

  /* ---- 64. 단서가 받는 쪽 화면에 한 글자도 없다 -------------------------
     **글자만 안 본다.** `innerHTML` 을 본다. class 하나 `data-` 하나로도 샌다. */
  let shower = (await A.evaluate(() => !!document.querySelector("#walHit"))) ? A : B;
  let taker = shower === A ? B : A;
  if ((await A.evaluate(() => !!document.querySelector("#walHit"))) ===
      (await B.evaluate(() => !!document.querySelector("#walHit"))))
    no("3초 벽: 두 기기가 같은 자리다. 한쪽이 띄우고 한쪽이 받아야 한다");
  const wmat = await shower.evaluate(() => walDeck()[roundStep("wall")].mat);
  const takerHtml = await pane(taker);
  const leakMat = wmat.filter((m) => takerHtml.indexOf(m) >= 0);
  if (leakMat.length)
    no("3초 벽: 단서가 받는 쪽 화면에 있다: " + leakMat.join(" / ") +
       ". 미리 보면 재는 것이 압박이 아니라 읽기가 된다");

  /* ---- 65. 정답이 붙은 장도 받는 쪽에 안 샌다 ---------------------------
     94장 중 열아홉이 정답을 달고 있고 그중 열여섯이 Q1 이다 (T282).
     **덱에 그런 장이 안 들면 이 자리는 아무것도 안 잰다.** 그래서 찾아 넣는다. */
  const withAns = await shower.evaluate(() => {
    var i = walDeck().findIndex(function (c) { return !!c.ans; });
    if (i < 0) {
      /* 오늘 덱에 없으면 자료 전체에서 하나 끌어와 앞에 놓는다.
         **없는 것을 안 잰 것으로 넘기지 않는다.** */
      var c = DATA.wall.cards.filter(function (x) { return !!x.ans; })[0];
      if (!c) return null;
      var rec = walRec();
      rec.deck = [c.id].concat(walDeck().map(function (x) { return x.id; }).slice(1));
      save(); i = 0;
    }
    roundStepSet("wall", i); renderWall();
    return walDeck()[i].ans;
  });
  if (!withAns) {
    no("3초 벽: 정답이 붙은 장을 하나도 못 찾았다. 자료가 비었거나 파생기가 안 실었다");
  } else {
    await taker.evaluate((i) => { roundStepSet("wall", i); renderWall(); },
                         await shower.evaluate(() => roundStep("wall")));
    const th = await pane(taker);
    if (th.indexOf(withAns) >= 0)
      no("3초 벽: 정답이 받는 쪽 화면에 있다: " + withAns);
    if (!(await text(shower)).includes(withAns))
      no("3초 벽: 정답이 띄우는 쪽 화면에도 없다. 안 그리는 것은 안 새는 것이 아니다");
  }

  /* ---- 66. 판정 단추가 받는 쪽에 없다. 넘기는 단추는 있다 ---------------
     규칙서 6.2 의 판정 칸이 **띄운 사람**이다. 받는 쪽에 두면
     자기가 받았는지를 자기가 정하게 된다. 그것이 이 판이 막으려던 일이다.
     그렇다고 아무 단추도 안 두면 그 기기만 첫 장에 남는다 (round.md 6장). */
  await A.evaluate(WLRESET); await B.evaluate(WLRESET);
  shower = (await A.evaluate(() => !!document.querySelector("#walHit"))) ? A : B;
  taker = shower === A ? B : A;
  for (const sel of ["#walHit", "#walGo"])
    if (await taker.$(sel)) no("3초 벽: 받는 쪽에 " + sel + " 가 있다");
  for (const sel of ["#walNext", "#walDefer"])
    if (!(await taker.$(sel))) no("3초 벽: 받는 쪽에 " + sel + " 가 없다");
  if (!(await shower.$("#walGo"))) no("3초 벽: 띄우는 쪽에 시계 단추가 없다");

  /* ---- 67. 자리가 자료가 적은 장수마다 바뀐다 ---------------------------
     **날짜에 안 매인다.** 어느 쪽이 먼저인지는 날마다 뒤집히고 (roleOf)
     바뀌는 자리만 잰다. check_ui.js 가 T276 에 고친 것과 같은 꼴이다. */
  const seatSeq = [];
  for (let i = 0; i < wspec.swap * 2; i++) {
    seatSeq.push(await shower.evaluate(() => !!document.querySelector("#walHit")));
    await shower.evaluate(() => { roundStepSet("wall", roundStep("wall") + 1);
                                  renderWall(); });
  }
  const flipsW = [];
  for (let i = 1; i < seatSeq.length; i++)
    if (seatSeq[i] !== seatSeq[i - 1]) flipsW.push(i);
  if (flipsW.length !== 1 || flipsW[0] !== wspec.swap)
    no("3초 벽: 자리가 바뀐 자리가 [" + flipsW.join(",") + "] 다. [" +
       wspec.swap + "] 여야 한다");

  /* ---- 68. 시계가 다 되면 대신 받기로 넘어가고 같은 초를 준다 ----------- */
  await A.evaluate(WLRESET); await B.evaluate(WLRESET);
  shower = (await A.evaluate(() => !!document.querySelector("#walHit"))) ? A : B;
  const wsec = await shower.evaluate(() => walDeck()[roundStep("wall")].sec);
  await tap(shower, "#walGo", "제한시간 재기");
  await shower.evaluate(() => { WCLK.left = 1; });
  await shower.waitForTimeout(1400);
  const relayTxt = await text(shower);
  if (!relayTxt.includes("대신 받는다"))
    no("3초 벽: 시간이 다 됐는데 대신 받는다는 말이 없다");
  if (relayTxt.indexOf(String(wsec) + "초") < 0)
    no("3초 벽: 대신 받는 자리에 제한시간이 안 적혔다. 덜 주면 그것이 벌이 된다");
  if (!(await shower.$("#walMiss")))
    no("3초 벽: 대신 받는 자리에 둘 다 못 받았다가 없다");
  if ((await shower.evaluate(() => roundStep("wall"))) !== 0)
    no("3초 벽: 시간이 다 됐다고 장이 넘어갔다. 대신 받을 차례가 남았다");

  /* ---- 69. 대신 받은 것도 받은 것으로 센다 ------------------------------ */
  const wrec = (p) => p.evaluate(() => S.rhit["wall|" + today()] || {});
  await tap(shower, "#walHit", "대신 받았다");
  let wrc = await wrec(shower);
  if (wrc.hit !== 1)
    no("3초 벽: 대신 받았다를 눌렀는데 셈이 " + wrc.hit + " 다. 누가 받았는지는 안 센다");

  /* ---- 70. 둘 다 못 받으면 미루고 덱은 안 섞인다 ------------------------ */
  const deckBefore = await shower.evaluate(() => walDeck().map((c) => c.id).join(","));
  await shower.evaluate(() => { WCLK.left = 1; WCLK.over = true;
                                WAL.stage = "relay"; renderWall(); });
  const missId = await shower.evaluate(() => walDeck()[roundStep("wall")].id);
  await tap(shower, "#walMiss", "둘 다 못 받았다");
  wrc = await wrec(shower);
  if ((wrc.defer || []).indexOf(missId) < 0)
    no("3초 벽: 둘 다 못 받은 장이 미룬 목록에 없다: " + missId);
  if (wrc.hit !== 1) no("3초 벽: 둘 다 못 받았는데 셈이 늘었다");
  if ((await shower.evaluate(() => walDeck().map((c) => c.id).join(","))) !== deckBefore)
    no("3초 벽: 미루자 판 도중에 덱이 섞였다. 이미 돈 장이 뒤로 밀린다");

  /* ---- 71. 다음 판이 미룬 것부터 낸다 ----------------------------------- */
  await shower.evaluate((n) => { roundStepSet("wall", n); renderWall(); }, wspec.end);
  const wdone = await text(shower);
  if (!/다 돌았다/.test(wdone)) no("3초 벽: 다 돌았는데 마감 화면이 안 뜬다");
  if (!wdone.includes("누가 받았는지는 안 센다"))
    no("3초 벽: 마감 화면이 무엇을 안 세는지 말 안 한다");
  if (!wdone.includes("절반"))
    no("3초 벽: 마감 화면이 이 숫자가 절반이라는 말을 안 한다");
  if (!wdone.includes("미뤘다"))
    no("3초 벽: 미룬 장이 있는데 마감 화면이 그 말을 안 한다");
  await tap(shower, "#walAgain", "처음부터");
  const firstNext = await shower.evaluate(() => walDeck()[0].id);
  if (firstNext !== missId)
    no("3초 벽: 다음 판 첫 장이 " + firstNext + " 다. 미룬 " + missId + " 여야 한다");
  if (((await wrec(shower)).defer || []).indexOf(missId) < 0)
    no("3초 벽: 처음부터를 눌렀더니 미룬 목록이 지워졌다");

  /* ---- 72. 받는 쪽이 미룬 것을 적어야 두 덱이 안 갈린다 ----------------- */
  await A.evaluate(WLRESET); await B.evaluate(WLRESET);
  shower = (await A.evaluate(() => !!document.querySelector("#walHit"))) ? A : B;
  taker = shower === A ? B : A;
  const bothId = await shower.evaluate(() => walDeck()[0].id);
  await shower.evaluate(() => { WAL.stage = "relay"; renderWall(); });
  await tap(shower, "#walMiss", "띄운 쪽이 미룬다");
  await tap(taker, "#walDefer", "받는 쪽도 적는다");
  const dA = await shower.evaluate(() => (walRec().defer || []).join(","));
  const dB = await taker.evaluate(() => (walRec().defer || []).join(","));
  if (dA !== dB || dA.indexOf(bothId) < 0)
    no("3초 벽: 두 기기의 미룬 목록이 갈린다: " + dA + " / " + dB);

  /* ---- 73. 자료가 모자란 날은 판을 안 열고 단서를 안 띄운다 -------------
     첫 다섯 강이 그렇다 (T282). **있는 만큼 돌리지 않는다.**
     모자란 것을 채우려면 같은 장을 두 번 내야 하고 두 번째는 압박이 아니다. */
  await shower.evaluate((n) => {
    window.__wp = walPool;
    walPool = function () { return DATA.wall.cards.slice(0, Math.max(0, n - 1)); };
    S.rhit = {}; save(); roundStepSet("wall", 0); renderWall();
  }, wspec.end);
  const shortTxt = await text(shower);
  const shortHtml = await pane(shower);
  if (!shortTxt.includes("안 연다"))
    no("3초 벽: 단서가 끝 조건보다 적은데 판이 그대로 돈다");
  /* **한 장만 보면 운에 기댄다.** 덱은 섞여 나오므로 첫 장이 화면에 안 뜰 수도
     있고 그러면 안 뜬 것이 아니라 다른 장이 뜬 것이다. 판이 낼 수 있는 것을 다 본다. */
  const shortMat = await shower.evaluate((n) =>
    DATA.wall.cards.slice(0, Math.max(0, n - 1))
      .reduce((a, c) => a.concat(c.mat), []), wspec.end);
  const shortSeen = shortMat.filter((m) => shortHtml.indexOf(m) >= 0);
  if (shortSeen.length)
    no("3초 벽: 안 여는 날인데 단서가 화면에 떴다: " + shortSeen.slice(0, 3).join(" / "));
  if (await shower.$("#walHit"))
    no("3초 벽: 안 여는 날인데 판정 단추가 있다");
  await shower.evaluate(() => { walPool = window.__wp; S.rhit = {}; save(); });

  /* ---- 74. 등급을 화면이 말한다 ----------------------------------------- */
  await A.evaluate(WLRESET);
  const wgTxt = await text(A);
  if (!wgTxt.includes(wspec.grade + "등급"))
    no("3초 벽: 자료 등급이 화면에 없다");
  if (wspec.grade !== "A" && !wgTxt.includes("통과 판정에는 안 쓴다"))
    no("3초 벽: B등급인데 통과 판정에 안 쓴다는 말이 없다");
  if (wspec.grade === "A" && wgTxt.includes("통과 판정에는 안 쓴다"))
    no("3초 벽: A등급 자료에 통과 판정 금지가 붙었다");

  /* =====================================================================
     되받아치기 (T286). **자료가 이어달리기와 같고 재는 것이 다른 판.**

     그래서 이 판에서 잴 것은 자료가 아니라 **다른 자리**다.

       단추가 한쪽에만   판정이 던진 사람이다. 이어달리기는 둘 다 누른다
       쉼마다 자리       회가 아니라 쉼 횟수로 돈다
       셈이 큰 것이다    더하지도 않고 같지도 않다. **셋째 법이 여기서 처음 나온다**
       청크가 안 걸러진다 이을 수 있는 것만 보이면 재는 것이 쉼이 아니라 눈이 된다
     ===================================================================== */
  const RBRESET = () => {
    S.rstep = {}; S.rseat = {}; S.rhit = {}; S.solo = false; save();
    if (typeof turnForget === "function") turnForget("rebound");
    RBDCLK.left = 0; RBDCLK.over = false;
    renderRebound();
  };
  for (const p of [A, B]) await openPlay(p, "rebound", "renderRebound");
  await A.evaluate(RBRESET); await B.evaluate(RBRESET);

  /* ---- 75. 판정 단추가 던진 쪽에만 있다 --------------------------------- */
  let thrower = (await A.evaluate(() => !!document.querySelector("#rbdOn"))) ? A : B;
  let catcher = thrower === A ? B : A;
  if ((await A.evaluate(() => !!document.querySelector("#rbdOn"))) ===
      (await B.evaluate(() => !!document.querySelector("#rbdOn"))))
    no("되받아치기: 두 기기가 같은 자리다. 한쪽이 던지고 한쪽이 받아야 한다");
  for (const sel of ["#rbdOn", "#rbdStop"])
    if (await catcher.$(sel))
      no("되받아치기: 받는 쪽에 " + sel + " 가 있다. 쉼은 던진 쪽이 듣는다");
  if (!(await catcher.$("#rbdSaid")))
    no("되받아치기: 받는 쪽에 자리를 미는 단추가 없다. 안 밀면 판 표시가 갈린다");

  /* ---- 76. 받는 쪽에 큰 수가 없다. **안 세는 것과 0인 것은 다르다** ----- */
  if ((await catcher.$$(".chnbig")).length)
    no("되받아치기: 받는 쪽에 큰 수가 떴다. 그 기기가 안 세는 것이지 0인 것이 아니다");
  if (!(await thrower.$$(".chnbig")).length)
    no("되받아치기: 던진 쪽에 큰 수가 없다");

  /* ---- 77. 청크가 안 걸러진다 -------------------------------------------
     오늘 과의 목록 그대로여야 한다. 말끝으로 이을 수 있는 것만 보이면
     두 사람이 그것을 찾아 읽고 **재는 것이 쉼이 아니라 눈이 된다** (T285). */
  const rbPool = await thrower.evaluate(() => ({
    all: (DATA.chunks.items[rbdToday()] || []).map((c) => c.c),
    shown: Array.prototype.map.call(
      document.querySelectorAll("#playPane .chnk"), (n) => n.textContent),
  }));
  const missing = rbPool.all.filter((c) => rbPool.shown.indexOf(c) < 0);
  if (missing.length)
    no("되받아치기: 오늘 과의 청크가 화면에서 빠졌다: " + missing.join(" / ") +
       ". 걸러 보이면 재는 것이 쉼이 아니라 눈이 된다");
  if ((await catcher.evaluate(() => Array.prototype.map.call(
        document.querySelectorAll("#playPane .chnk"), (n) => n.textContent).join("|")))
      !== rbPool.shown.join("|"))
    no("되받아치기: 두 기기가 다른 청크를 본다");

  /* ---- 78. 주고받은 수가 늘고 제일 긴 것이 따라 오른다 ------------------ */
  const rbRec = (p) => p.evaluate(() => S.rhit["rebound|" + today()] || {});
  for (let i = 0; i < 3; i++) {
    await tap(thrower, "#rbdOn", "주고받았다 " + (i + 1));
    const r = await rbRec(thrower);
    if (r.run !== i + 1)
      no("되받아치기: " + (i + 1) + "번 눌렀는데 이어진 수가 " + r.run + " 다");
    if (r.best !== i + 1)
      no("되받아치기: 제일 긴 것이 " + r.best + " 다. 지금 것보다 작을 수 없다");
  }

  /* ---- 79. 쉼이 나면 이어진 수만 0이 되고 제일 긴 것은 남는다 ----------- */
  await tap(thrower, "#rbdStop", "쉼이 생겼다");
  let rb = await rbRec(thrower);
  if (rb.run !== 0) no("되받아치기: 쉼이 났는데 이어진 수가 " + rb.run + " 다");
  if (rb.best !== 3) no("되받아치기: 쉼이 났다고 제일 긴 것이 " + rb.best + " 로 줄었다");
  if (rb.stops !== 1) no("되받아치기: 쉼 횟수가 " + rb.stops + " 다");
  if (await thrower.$("#rbdOn"))
    no("되받아치기: 쉼이 났는데 자리가 안 바뀌었다. 쉼마다 바뀐다");

  /* ---- 80. 받는 쪽 단추는 셈을 안 건드리고 자리만 민다 ------------------ */
  const before = await rbRec(catcher);
  await tap(catcher, "#rbdSaid", "쉼이 났다고 한다");
  const after = await rbRec(catcher);
  if (after.best !== (before.best || 0) || after.stops !== (before.stops || 0))
    no("되받아치기: 받는 쪽 단추가 셈을 건드렸다. 그 자리는 판정이 아니다");
  if (!(await catcher.$("#rbdOn")))
    no("되받아치기: 받는 쪽이 눌렀는데 자리가 안 바뀌었다");
  if ((await thrower.evaluate(() => roundStep("rebound"))) !==
      (await catcher.evaluate(() => roundStep("rebound"))))
    no("되받아치기: 두 기기의 회가 갈렸다");

  /* ---- 81. 자리가 쉼마다 바뀐다. **회마다가 아니다** --------------------
     쉼을 안 눌렀는데 자리가 도는지를 본다. 주고받기만 여러 번 한다. */
  await A.evaluate(RBRESET); await B.evaluate(RBRESET);
  thrower = (await A.evaluate(() => !!document.querySelector("#rbdOn"))) ? A : B;
  for (let i = 0; i < 4; i++) {
    await tap(thrower, "#rbdOn", "쉼 없이 " + (i + 1));
    if (!(await thrower.$("#rbdOn")))
      no("되받아치기: 쉼이 안 났는데 자리가 바뀌었다: " + (i + 1) + "번째");
  }

  /* ---- 82. 마감이 더하라고 말하지 않는다 --------------------------------
     앞의 다섯 판이 "두 기기 숫자를 더한다" 를 적는다. 여기서 그것을 적으면
     두 사람이 주고받은 것을 다 더한 수를 남기고 **그것은 이 판의 값이 아니다.** */
  await thrower.evaluate(() => { RBDCLK.over = true; renderRebound(); });
  const rbDone = await text(thrower);
  if (!/분이 됐다/.test(rbDone))
    no("되받아치기: 시계가 다 됐는데 끝났다는 말을 안 한다");
  if (!rbDone.includes("더하지 않는다"))
    no("되받아치기: 마감 화면이 더하지 말라는 말을 안 한다");
  if (/소리 내어 더한다|그 절반이다/.test(rbDone))
    no("되받아치기: 마감 화면이 더하라고 적는다. 이 판의 값은 큰 것 하나다");
  if (!rbDone.includes("큰 것"))
    no("되받아치기: 마감 화면이 두 기기 중 무엇을 남기는지 안 적는다");
  if (!rbDone.includes("한 번에 제일 많이"))
    no("되받아치기: 마감 화면이 무엇을 센 숫자인지 안 적는다");

  /* ---- 83. 등급 --------------------------------------------------------- */
  await A.evaluate(RBRESET);
  const rbGrade = await A.evaluate(() => DATA.chunks.grade);
  const rbTxt = await text(A);
  if (!rbTxt.includes(rbGrade + "등급"))
    no("되받아치기: 자료 등급이 화면에 없다");
  if (rbGrade !== "A" && !rbTxt.includes("통과 판정에는 안 쓴다"))
    no("되받아치기: B등급인데 통과 판정에 안 쓴다는 말이 없다");

  /* =====================================================================
     한 사람만 본다 (T290). **한 덩어리를 반만 가리는 첫 판.**

       이름은 두 화면에   요소 이름은 둘 다 보고 값은 쥔 쪽만 본다
       낸 요소가 날을 넘음 `S.situ` 다. 두 기기가 같이 빼야 내일 안 갈린다
       2 + 2 + 1        다섯 요소가 세 판에 나뉜다. 셋째 판은 하나만 낸다
       두 가지 못 여는 날 아직 안 나온 것과 다 접은 것은 다른 말이다
     ===================================================================== */
  const ONRESET = () => {
    S.rstep = {}; S.rseat = {}; S.rhit = {}; S.situ = {};
    S.solo = false; S.soloHand = false; S.device = S.device || "a"; save();
    if (typeof turnForget === "function") turnForget("onesee");
    ONECLK.left = 0; ONECLK.over = false;
    renderOnesee();
  };
  for (const p of [A, B]) await openPlay(p, "onesee", "renderOnesee");
  await A.evaluate(ONRESET); await B.evaluate(ONRESET);

  /* ---- 84. 규격이 자료에서 온다. **검사도 숫자를 안 적는다** ------------ */
  const ospec = await A.evaluate(() => ({
    need: DATA.situ.need, most: DATA.situ.most,
    parts: DATA.situ.parts.map((p) => p.name),
    keys: DATA.situ.parts.map((p) => p.key),
    grade: DATA.situ.grade,
    pool: onePool().length,
    deck: oneDeck().map((c) => c.id),
  }));
  if (!(ospec.need >= 1) || ospec.need >= ospec.parts.length)
    no("한 사람만 본다: 알아낼 수가 " + ospec.need + " 다. 요소 수보다 작아야 한다");
  if (ospec.parts.length !== 5)
    no("한 사람만 본다: 요소가 " + ospec.parts.length + "개다. 기준서 8.1 은 다섯이다");
  /* 다섯을 둘씩 내면 2 + 2 + 1 이라 세 판이다. **그 셋이 D1 의 셋과 같아야 한다.** */
  const rounds = Math.ceil(ospec.parts.length / ospec.need);
  if (rounds !== ospec.most)
    no("한 사람만 본다: 요소 " + ospec.parts.length + "개를 " + ospec.need +
       "개씩 내면 " + rounds + "판인데 D1 은 " + ospec.most + "판까지라고 적었다");
  if (!ospec.deck.length) no("한 사람만 본다: 낼 카드가 없다");

  /* ---- 85. 값이 알아내는 쪽 화면에 한 글자도 없다 ----------------------- */
  let holder = (await A.evaluate(() => !!document.querySelector("#oneHit"))) ? A : B;
  let finder = holder === A ? B : A;
  if ((await A.evaluate(() => !!document.querySelector("#oneHit"))) ===
      (await B.evaluate(() => !!document.querySelector("#oneHit"))))
    no("한 사람만 본다: 두 기기가 같은 자리다");
  const oVals = await holder.evaluate(() =>
    Object.keys(oneDeck()[roundStep("onesee")].parts)
      .map((k) => oneDeck()[roundStep("onesee")].parts[k]).filter(Boolean));
  const fHtml = await pane(finder);
  const oLeak = oVals.filter((v) => fHtml.indexOf(v) >= 0);
  if (oLeak.length)
    no("한 사람만 본다: 요소 값이 알아내는 쪽 화면에 있다: " + oLeak.join(" / ") +
       ". 값이 뜨면 알아낼 것이 없다");
  /* **안 그리는 것과 안 새는 것은 다르다** (T260). 쥔 쪽에는 있어야 한다. */
  const hText = await text(holder);
  const oMiss = oVals.filter((v) => hText.indexOf(v) < 0);
  if (oMiss.length)
    no("한 사람만 본다: 요소 값이 쥔 쪽 화면에도 없다: " + oMiss.join(" / "));

  /* ---- 86. 이름은 두 화면에 다 있다 -------------------------------------
     이름까지 없으면 무엇을 물을지 모른다. 판이 아니라 스무고개가 된다. */
  const askNames = await holder.evaluate(() =>
    oneAsk(oneDeck()[roundStep("onesee")]).map((x) => x.name));
  const fText = await text(finder);
  const nameGone = askNames.filter((n) => fText.indexOf(n) < 0);
  if (nameGone.length)
    no("한 사람만 본다: 알아낼 요소 이름이 알아내는 쪽 화면에 없다: " +
       nameGone.join(" / "));
  if (askNames.length !== ospec.need)
    no("한 사람만 본다: 첫 판이 " + askNames.length + "개를 낸다. " +
       ospec.need + "개여야 한다");

  /* ---- 87. 판정 단추가 쥔 쪽에만 있다 ----------------------------------- */
  for (const sel of ["#oneHit", "#oneGive", "#oneAsked"])
    if (await finder.$(sel))
      no("한 사람만 본다: 알아내는 쪽에 " + sel + " 가 있다. 답은 쥔 쪽만 안다");
  if (!(await finder.$("#oneNext")))
    no("한 사람만 본다: 알아내는 쪽에 자리를 미는 단추가 없다");

  /* ---- 88. 자리가 한 장마다 바뀐다 -------------------------------------- */
  const oSeats = [];
  for (let i = 0; i < 4; i++) {
    oSeats.push(await holder.evaluate(() => !!document.querySelector("#oneHit")));
    await holder.evaluate(() => { roundStepSet("onesee", roundStep("onesee") + 1);
                                  renderOnesee(); });
  }
  const oFlips = [];
  for (let i = 1; i < oSeats.length; i++)
    if (oSeats[i] !== oSeats[i - 1]) oFlips.push(i);
  if (oFlips.length !== oSeats.length - 1)
    no("한 사람만 본다: 자리가 바뀐 자리가 [" + oFlips.join(",") +
       "] 다. 한 장마다 바뀌어야 한다");

  /* ---- 89. 낸 요소가 날을 넘고 세 판에 나뉜다 ---------------------------
     같은 카드를 `most` 번 돌린다. **판마다 낸 것이 겹치면 안 된다.** */
  await A.evaluate(ONRESET); await B.evaluate(ONRESET);
  const firstId = await A.evaluate(() => oneDeck()[0].id);
  const sizes = [];
  for (let i = 0; i < ospec.most; i++) {
    for (const p of [A, B])
      await p.evaluate(() => { S.rhit = {}; roundStepSet("onesee", 0);
                               renderOnesee(); });
    sizes.push(await A.evaluate(() =>
      oneAsk(oneDeck()[0]).map((x) => x.key).join(",")));
    for (const p of [A, B]) {
      const btn = (await p.$("#oneHit")) ? "#oneHit" : "#oneNext";
      await tap(p, btn, "같은 카드 " + (i + 1) + "판");
      await p.waitForTimeout(60);
    }
  }
  const flat = sizes.join(",").split(",").filter(Boolean);
  if (new Set(flat).size !== flat.length)
    no("한 사람만 본다: 같은 요소를 두 번 냈다: " + sizes.join(" | "));
  if (flat.length !== ospec.parts.length)
    no("한 사람만 본다: " + ospec.most + "판에 낸 요소가 " + flat.length +
       "개다. " + ospec.parts.length + "개여야 한다");
  const want = [];
  for (let i = 0; i < ospec.parts.length; i += ospec.need)
    want.push(Math.min(ospec.need, ospec.parts.length - i));
  const got = sizes.map((x) => x.split(",").filter(Boolean).length);
  if (got.join("+") !== want.join("+"))
    no("한 사람만 본다: 판마다 낸 수가 " + got.join("+") + " 다. " +
       want.join("+") + " 여야 한다");

  /* ---- 90. 두 기기가 같은 요소를 뺐다 -----------------------------------
     한쪽만 빼면 **내일 두 화면이 다른 요소를 알아내라고 적는다** (T283 과 같은 자리). */
  const seenA = await A.evaluate((id) => (S.situ[id] || []).join(","), firstId);
  const seenB = await B.evaluate((id) => (S.situ[id] || []).join(","), firstId);
  if (seenA !== seenB || !seenA)
    no("한 사람만 본다: 두 기기의 낸 요소가 갈린다: [" + seenA + "] / [" + seenB + "]");

  /* ---- 91. 다 낸 카드는 접힌다 ------------------------------------------ */
  await A.evaluate(() => { S.rhit = {}; roundStepSet("onesee", 0); renderOnesee(); });
  if (!(await A.evaluate((id) => oneDeck().every((c) => c.id !== id), firstId)))
    no("한 사람만 본다: 다섯 요소를 다 낸 카드가 아직 덱에 있다");

  /* ---- 92. 덱이 판 도중에 안 섞인다 --------------------------------------
     **한 장을 그냥 넘겨서는 안 잡힌다.** 그 카드는 아직 요소가 남아 덱에 그대로 있다.
     덱이 흔들리는 것은 **카드가 덱에서 빠질 때**다.
     그래서 첫 카드를 한 판이면 바닥나게 만들어 놓고 넘긴다.
     처음에 이 자리를 약하게 짰다가 깨 보고 알았다 (T290). */
  await A.evaluate(ONRESET);
  await A.evaluate(() => {
    var id = oneDeck()[0].id;
    /* 마지막 하나만 남긴다. 한 판이면 그 카드가 빠진다. */
    S.situ[id] = DATA.situ.parts.slice(0, DATA.situ.parts.length - 1)
                   .map(function (p) { return p.key; });
    save(); renderOnesee();
  });
  const oDeck0 = await A.evaluate(() => oneDeck().map((c) => c.id).join(","));
  const oBtn = (await A.$("#oneHit")) ? "#oneHit" : "#oneNext";
  await tap(A, oBtn, "바닥나는 장을 넘긴다");
  if ((await A.evaluate(() => oneDeck().map((c) => c.id).join(","))) !== oDeck0)
    no("한 사람만 본다: 카드가 바닥나자 판 도중에 덱이 섞였다. 이미 돈 장이 다시 나온다");

  /* ---- 93. 못 여는 날 둘을 다르게 적는다 --------------------------------
     아직 안 나온 것은 기다리면 오고 다 접은 것은 안 온다.
     같은 말로 적으면 두 사람이 오지 않을 것을 기다린다. */
  await A.evaluate(() => { window.__op = onePool; onePool = () => [];
                           S.rhit = {}; save(); renderOnesee(); });
  const notYet = await text(A);
  if (!notYet.includes("안 나와서"))
    no("한 사람만 본다: 카드가 아직 안 나온 날에 그 이유를 안 적는다");
  await A.evaluate(() => { onePool = window.__op; S.rhit = {};
                           DATA.situ.cards.forEach(function (c) {
                             S.situ[c.id] = DATA.situ.parts.map(function (p) {
                               return p.key; });
                           });
                           save(); renderOnesee(); });
  const allFold = await text(A);
  if (!allFold.includes("다 접었다"))
    no("한 사람만 본다: 카드를 다 접은 날에 그 말을 안 한다");
  if (allFold.includes("안 나와서"))
    no("한 사람만 본다: 다 접은 날에 아직 안 나왔다고 적는다. 두 사람이 기다린다");

  /* ---- 94. 마감이 틀에 안 맞는 말을 안 쓴다 -----------------------------
     `playHalf` 의 말은 "N장 중 몇" 꼴이고 이 판의 값은 장마다 물은 수라
     셀 수 있는 하나가 아니다. 넣으면 "장마다 물은 수 중 몇" 이 된다 (T289). */
  await A.evaluate(ONRESET);
  await A.evaluate(() => { ONECLK.over = true; renderOnesee(); });
  const oDone1 = await text(A);
  await A.evaluate(() => { ONECLK.over = false;
                           roundStepSet("onesee", oneDeck().length);
                           renderOnesee(); });
  const oDone2 = await text(A);
  for (const [why, txt] of [["시계", oDone1], ["덱 끝", oDone2]]) {
    if (/중 몇이다/.test(txt))
      no("한 사람만 본다 (" + why + "): 마감이 'N장 중 몇' 틀을 쓴다. " +
         "이 판의 값은 장마다 물은 수다");
    if (!txt.includes("몇 번 물어서 닿았는가"))
      no("한 사람만 본다 (" + why + "): 마감이 무엇을 센 값인지 안 적는다");
    if (!txt.includes("적은 쪽이 잘한 것이 아니다"))
      no("한 사람만 본다 (" + why + "): 물은 수가 잘잘못이 아니라는 말이 없다");
    if (/없다 다|번 다\./.test(txt))
      no("한 사람만 본다 (" + why + "): 마감 글이 조사에서 어긋난다");
  }

  /* ---- 95. 등급 --------------------------------------------------------- */
  await A.evaluate(ONRESET);
  const oTxt = await text(A);
  if (!oTxt.includes(ospec.grade + "등급"))
    no("한 사람만 본다: 자료 등급이 화면에 없다");
  if (ospec.grade !== "A" && !oTxt.includes("통과 판정에는 안 쓴다"))
    no("한 사람만 본다: B등급인데 통과 판정에 안 쓴다는 말이 없다");

  /* =====================================================================
     파장 (T293). **감추는 것이 말할 거리가 아니라 말하는 세기인 첫 판.**

       세기가 한쪽에만  맞히는 쪽 화면이 **세기에 안 흔들려야 한다**
       줄은 둘 다        감추는 것이 줄이 아니다. 줄이 한쪽에만 있으면 틀렸다
       한 칸 안          `near` 안이면 닿은 것이다. 정확히 맞히는 판이 아니다
       두 칸 넘게        `far` 를 넘으면 **점이 안 넘어간다**
       넣은 자리         2와 4가 화면에서 갈린다 (T291)
     ===================================================================== */
  const WVRESET = () => {
    S.rstep = {}; S.rseat = {}; S.rhit = {}; S.solo = false; save();
    if (typeof turnForget === "function") turnForget("wave");
    WAVCLK.left = 0; WAVCLK.over = false;
    renderWave();
  };
  for (const p of [A, B]) await openPlay(p, "wave", "renderWave");
  await A.evaluate(WVRESET); await B.evaluate(WVRESET);

  /* ---- 96. 규격이 자료에서 온다 ----------------------------------------- */
  const vspec = await A.evaluate(() => ({
    size: DATA.wave.size, points: DATA.wave.points,
    near: DATA.wave.near, far: DATA.wave.far,
    grade: DATA.wave.grade,
    anchors: DATA.wave.steps.filter((x) => x.anchor).map((x) => x.n),
    mids: DATA.wave.steps.filter((x) => !x.anchor).map((x) => x.n),
    names: DATA.wave.steps.map((x) => x.name),
  }));
  if (vspec.size !== vspec.anchors.length + vspec.mids.length)
    no("파장: 눈금 칸수가 안 맞는다");
  if (!(vspec.near >= 1) || !(vspec.far > vspec.near))
    no("파장: 닿는 폭 " + vspec.near + " 와 다시 하는 폭 " + vspec.far +
       " 가 이상하다. 닿는 폭이 더 좁아야 한다");
  if (!vspec.mids.length)
    no("파장: 넣은 자리가 없다. 세 값만으로는 한 칸 안 판정이 뜻이 없다");
  if (new Set(vspec.names).size !== vspec.names.length)
    no("파장: 눈금에 같은 이름이 두 번 있다");

  /* ---- 97. 맞히는 쪽 화면이 세기에 안 흔들린다 --------------------------
     **거울 판에서 쓴 자를 그대로 든다** (T260). 세기를 고정하고 두 번 그려
     `innerHTML` 을 통째로 견준다. 글자만 보면 class 하나로 샌다.
     뒤엣줄이 앞엣줄만큼 중요하다. 쥔 쪽에서도 안 달라지면 그것은
     안 새는 것이 아니라 **아무것도 안 그리는 것**이다. */
  let vHold = (await A.evaluate(() => !!document.querySelector("[data-wav]"))) ? A : B;
  let vGuess = vHold === A ? B : A;
  if ((await A.evaluate(() => !!document.querySelector("[data-wav]"))) ===
      (await B.evaluate(() => !!document.querySelector("[data-wav]"))))
    no("파장: 두 기기가 같은 자리다");
  const withAim = async (p, n) => {
    const html = await p.evaluate((n) => {
      window.__wa = window.__wa || wavAim;
      wavAim = function () { return DATA.wave.steps[n]; };
      renderWave();
      return document.querySelector("#playPane").innerHTML;
    }, n);
    return html;
  };
  let vLeak = 0, vBlind = 0;
  for (let i = 1; i < vspec.size; i++) {
    if ((await withAim(vGuess, 0)) !== (await withAim(vGuess, i))) vLeak++;
    if ((await withAim(vHold, 0)) === (await withAim(vHold, i))) vBlind++;
  }
  for (const p of [A, B])
    await p.evaluate(() => { if (window.__wa) wavAim = window.__wa; renderWave(); });
  if (vLeak)
    no("파장: 맞히는 쪽 화면이 세기에 따라 달라진다: " + vLeak + "칸");
  if (vBlind)
    no("파장: 쥔 쪽 화면이 세기에 따라 안 달라진다: " + vBlind +
       "칸. 안 그리는 것이 아니라 아무것도 안 그리는 것이다");

  /* ---- 98. 줄은 둘 다 본다. **감추는 것이 줄이 아니다** ----------------- */
  const vLine = await vHold.evaluate(() => wavLine(wavPiece().li));
  if (!vLine) no("파장: 오늘 줄을 못 찾았다");
  else {
    for (const [who, p] of [["쥔 쪽", vHold], ["맞히는 쪽", vGuess]])
      if ((await text(p)).indexOf(vLine) < 0)
        no("파장: " + who + " 화면에 말할 줄이 없다. 감추는 것은 줄이 아니라 세기다");
  }

  /* ---- 99. 눈금이 두 화면에 다 있다. 짚을 자리가 안 보이면 못 짚는다 ---- */
  for (const [who, p] of [["쥔 쪽", vHold], ["맞히는 쪽", vGuess]]) {
    const rows = await p.$$eval(".wavrow", (ns) => ns.length);
    if (rows !== vspec.size)
      no("파장: " + who + " 화면의 눈금이 " + rows + "칸이다. " + vspec.size + "칸이어야 한다");
  }
  /* 넣은 자리가 있는 것과 갈리는가. **등급 한 줄로만 적으면 다 같은 무게로 읽는다** */
  const vMid = await vGuess.$$eval(".wavrow.mid", (ns) => ns.length);
  if (vMid !== vspec.mids.length)
    no("파장: 넣은 자리가 " + vMid + "칸만 갈렸다. " + vspec.mids.length + "칸이어야 한다");

  /* ---- 100. 판정 단추가 쥔 쪽에만 있다 ---------------------------------- */
  if ((await vGuess.$$("[data-wav]")).length)
    no("파장: 맞히는 쪽에 자리를 대는 단추가 있다. 판정은 쥔 사람이 한다");
  if (!(await vGuess.$("#wavNext")))
    no("파장: 맞히는 쪽에 자리를 미는 단추가 없다");
  if ((await vHold.$$("[data-wav]")).length !== vspec.size)
    no("파장: 쥔 쪽의 단추가 눈금 칸수와 다르다");

  /* ---- 101. `near` 안이면 닿은 것으로 센다 ------------------------------ */
  const vRec = (p) => p.evaluate(() => S.rhit["wave|" + today()] || {});
  const aimNow = (p) => p.evaluate(() => wavAim(roundStep("wave")).n);
  const stepNow = (p) => p.evaluate(() => roundStep("wave"));
  await A.evaluate(WVRESET); await B.evaluate(WVRESET);
  vHold = (await A.evaluate(() => !!document.querySelector("[data-wav]"))) ? A : B;
  let aim = await aimNow(vHold);
  let pick = aim + vspec.near <= vspec.size ? aim + vspec.near : aim - vspec.near;
  await tap(vHold, '[data-wav="' + pick + '"]', "닿는 폭 안");
  let vr = await vRec(vHold);
  if (vr.near !== 1)
    no("파장: " + vspec.near + "칸 벌어졌는데 닿은 것으로 안 셌다");
  if ((await stepNow(vHold)) !== 1) no("파장: 닿았는데 점이 안 넘어갔다");

  /* ---- 102. `near` 를 넘고 `far` 이하면 못 닿았지만 넘어간다 ------------ */
  await A.evaluate(WVRESET); await B.evaluate(WVRESET);
  vHold = (await A.evaluate(() => !!document.querySelector("[data-wav]"))) ? A : B;
  aim = await aimNow(vHold);
  pick = aim + vspec.far <= vspec.size ? aim + vspec.far : aim - vspec.far;
  if (Math.abs(pick - aim) === vspec.far) {
    await tap(vHold, '[data-wav="' + pick + '"]', "다시 안 하는 폭");
    vr = await vRec(vHold);
    if (vr.near !== 0) no("파장: " + vspec.far + "칸 벌어졌는데 닿은 것으로 셌다");
    if ((await stepNow(vHold)) !== 1)
      no("파장: " + vspec.far + "칸은 다시 하는 폭이 아닌데 점이 안 넘어갔다");
    if ((vr.again || 0) !== 0) no("파장: 다시 말한 것으로 셌다");
  }

  /* ---- 103. `far` 를 넘으면 점이 안 넘어가고 어디였는지 보여 준다 -------- */
  await A.evaluate(WVRESET); await B.evaluate(WVRESET);
  vHold = (await A.evaluate(() => !!document.querySelector("[data-wav]"))) ? A : B;
  aim = await aimNow(vHold);
  pick = aim + vspec.far + 1 <= vspec.size ? aim + vspec.far + 1 : aim - vspec.far - 1;
  if (pick >= 1 && pick <= vspec.size) {
    await tap(vHold, '[data-wav="' + pick + '"]', "다시 하는 폭");
    if ((await stepNow(vHold)) !== 0)
      no("파장: " + (vspec.far + 1) + "칸 벌어졌는데 점이 넘어갔다. 다시 말해야 한다");
    const said = await vHold.evaluate(() => {
      const e = document.getElementById("wavTurn");
      return e ? e.innerText : "";
    });
    if (!said.includes("다시 말한다"))
      no("파장: 다시 말하라는 말이 안 뜬다");
    const aimName = await vHold.evaluate(() => wavAim(roundStep("wave")).name);
    if (said.indexOf(aimName) < 0)
      no("파장: 어디였는지를 안 보여 준다");
    if (((await vRec(vHold)).again || 0) !== 1)
      no("파장: 다시 말한 것을 안 셌다");
  }

  /* ---- 104. 한 점마다 자리가 바뀐다 ------------------------------------- */
  await A.evaluate(WVRESET);
  const vSeats = [];
  for (let i = 0; i < 4; i++) {
    vSeats.push(await A.evaluate(() => !!document.querySelector("[data-wav]")));
    await A.evaluate(() => { roundStepSet("wave", roundStep("wave") + 1);
                             renderWave(); });
  }
  const vFlips = [];
  for (let i = 1; i < vSeats.length; i++)
    if (vSeats[i] !== vSeats[i - 1]) vFlips.push(i);
  if (vFlips.length !== vSeats.length - 1)
    no("파장: 자리가 바뀐 자리가 [" + vFlips.join(",") + "] 다. 한 점마다 바뀌어야 한다");

  /* ---- 105. 마감 -------------------------------------------------------- */
  await A.evaluate(WVRESET);
  await A.evaluate(() => { WAVCLK.over = true; renderWave(); });
  const vDone1 = await text(A);
  await A.evaluate(() => { WAVCLK.over = false;
                           roundStepSet("wave", DATA.wave.points); renderWave(); });
  const vDone2 = await text(A);
  for (const [why, txt] of [["시계", vDone1], ["점 끝", vDone2]]) {
    if (/중 몇 중 몇/.test(txt))
      no("파장 (" + why + "): 마감이 '중 몇' 을 두 번 적는다");
    if (!txt.includes("절반"))
      no("파장 (" + why + "): 마감이 이 숫자가 절반이라는 말을 안 한다");
    if (!txt.includes("점이 아니라 폭"))
      no("파장 (" + why + "): 정확히 맞히는 판이 아니라는 말이 없다");
  }

  /* ---- 106. 등급 -------------------------------------------------------- */
  await A.evaluate(WVRESET);
  const vTxt = await text(A);
  if (!vTxt.includes(vspec.grade + "등급"))
    no("파장: 자료 등급이 화면에 없다");
  if (vspec.grade !== "A" && !vTxt.includes("통과 판정에는 안 쓴다"))
    no("파장: B등급인데 통과 판정에 안 쓴다는 말이 없다");
  /* **자료 자체가 화면으로 온다.** 마크다운이 섞이면 별 둘이 그대로 보인다 (T292). */
  if (/\*\*/.test(vTxt))
    no("파장: 화면에 마크다운 표시가 보인다");

  /* =====================================================================
     누구 말이야 (T296). **앱이 아무것도 안 견주는 판.**

       정답이 없다      자료 어디에도 register 가 없어야 한다 (T294)
       감출 것이 없다   쓸 자리도 세 단추도 두 화면에 다 있다
       같은 수다        절반이 아니다. `playHalf` 를 쓰면 실패다
       판 밖으로 나간다 갈린 자리가 **주 점검 화면**에 뜬다

     마지막이 이 파일에서 처음이다. **판 탭을 떠나서 재는 판정**이다.
     ===================================================================== */
  const WHRESET = () => {
    S.rstep = {}; S.rseat = {}; S.rhit = {}; S.wsplit = {};
    S.solo = false; save();
    if (typeof turnForget === "function") turnForget("whose");
    WHOCLK.left = 0; WHOCLK.over = false;
    renderWhose();
  };
  for (const p of [A, B]) await openPlay(p, "whose", "renderWhose");
  await A.evaluate(WHRESET); await B.evaluate(WHRESET);

  /* ---- 107. 규격이 자료에서 온다 ---------------------------------------- */
  const hspec = await A.evaluate(() => ({
    rounds: DATA.whose.rounds, regs: DATA.whose.regs,
    grade: DATA.whose.grade, pool: whoPool().length,
    deck: whoDeck().map((c) => c.id),
  }));
  if (hspec.regs.length !== 3)
    no("누구 말이야: 고를 것이 " + hspec.regs.length + "가지다. 셋이어야 한다");
  if (hspec.deck.length !== hspec.rounds)
    no("누구 말이야: 한 판이 " + hspec.deck.length + "벌이다. 자료는 " +
       hspec.rounds + " 라고 적었다");
  if (new Set(hspec.deck).size !== hspec.deck.length)
    no("누구 말이야: 한 판에 같은 자리가 두 번 나온다");

  /* ---- 108. 정답이 자료에 없다 ------------------------------------------
     **담고 안 그리는 것과 안 담는 것이 다르다** (T294).
     화면만 보면 둘이 같아 보인다. 자료를 본다. */
  const hasAns = await A.evaluate(() => {
    const blob = JSON.stringify(DATA.whose.sets);
    return DATA.whose.regs.filter((r) => blob.indexOf(r) >= 0);
  });
  if (hasAns.length)
    no("누구 말이야: 쓸 자리 글에 격식 값이 들어 있다: " + hasAns.join(" / ") +
       ". 앱은 정답을 안 준다");
  /* 화면이 맞았다 틀렸다를 적으면 그것도 정답을 준 것이다.
     **고르기 전과 고른 뒤를 다 본다.** 판정 단추는 고른 뒤에만 뜨고
     처음에 앞엣것만 봤더니 단추 글을 "맞았다" 로 바꿔 놔도 안 잡혔다 (T296). */
  for (const p of [A, B]) {
    for (const when of ["고르기 전", "고른 뒤"]) {
      if (when === "고른 뒤")
        await p.evaluate(() => { whoRec().pick = DATA.whose.regs[0]; save();
                                 renderWhose(); });
      const txt = await text(p);
      if (/맞았|틀렸|정답은/.test(txt))
        no("누구 말이야 (" + when + "): 화면이 맞고 틀림을 적는다. " +
           "격식은 답이 하나가 아니다");
      if (!txt.includes("앱은 정답을 안 준다"))
        no("누구 말이야 (" + when + "): 앱이 정답을 안 준다는 말이 화면에 없다");
    }
    await p.evaluate(() => { whoRec().pick = null; save(); renderWhose(); });
  }

  /* ---- 109. 쓸 자리와 세 단추가 두 화면에 다 있다 ------------------------
     **감출 것이 없는 판이다.** 한쪽에만 있으면 그것이 정보 격차가 된다. */
  const hSet = await A.evaluate(() => whoDeck()[roundStep("whose")]);
  for (const [who, p] of [["A", A], ["B", B]]) {
    const txt = await text(p);
    if (txt.indexOf(hSet.where) < 0)
      no("누구 말이야: " + who + " 화면에 쓸 자리가 없다. 감출 것이 없는 판이다");
    if (txt.indexOf(hSet.who) < 0)
      no("누구 말이야: " + who + " 화면에 상대가 누구인지가 없다");
    if ((await p.$$("[data-who]")).length !== hspec.regs.length)
      no("누구 말이야: " + who + " 화면의 고를 단추가 셋이 아니다");
  }

  /* ---- 110. 고르기 전에는 판정 단추가 안 뜬다 ---------------------------- */
  for (const sel of ["#whoSame", "#whoSplit"])
    if (await A.$(sel))
      no("누구 말이야: 고르기 전에 " + sel + " 가 떴다. 안 고르고 판정할 수 없다");
  await tap(A, '[data-who="' + hspec.regs[0] + '"]', "하나 고른다");
  for (const sel of ["#whoSame", "#whoSplit"])
    if (!(await A.$(sel)))
      no("누구 말이야: 고르고 나서도 " + sel + " 가 안 뜬다");

  /* ---- 111. 같았다와 갈렸다가 다르게 센다 -------------------------------- */
  const hRec = (p) => p.evaluate(() => S.rhit["whose|" + today()] || {});
  await tap(A, "#whoSame", "둘이 같았다");
  let hwr = await hRec(A);
  if (hwr.same !== 1 || hwr.split !== 0)
    no("누구 말이야: 같았다를 눌렀는데 셈이 같음 " + hwr.same + " 갈림 " + hwr.split + " 이다");
  if ((await A.evaluate(() => roundStep("whose"))) !== 1)
    no("누구 말이야: 같았다를 눌렀는데 벌이 안 넘어갔다");
  if ((await hRec(A)).pick)
    no("누구 말이야: 다음 벌로 갔는데 앞 벌에서 고른 것이 남아 있다");

  /* ---- 112. 갈린 자리가 **그 주**에 남는다 ------------------------------- */
  const splitId = await A.evaluate(() => whoDeck()[roundStep("whose")].id);
  await tap(A, '[data-who="' + hspec.regs[1] + '"]', "둘째 벌을 고른다");
  await tap(A, "#whoSplit", "갈렸다");
  hwr = await hRec(A);
  if (hwr.split !== 1) no("누구 말이야: 갈렸다를 눌렀는데 안 셌다");
  const wsp = await A.evaluate(() => S.wsplit || {});
  const wkeys = Object.keys(wsp);
  if (wkeys.length !== 1 || !(wsp[wkeys[0]] || []).length)
    no("누구 말이야: 갈린 자리가 그 주에 안 남았다");
  else if (!wsp[wkeys[0]].filter((x) => x.id === splitId).length)
    no("누구 말이야: 갈린 자리에 그 벌이 아닌 것이 남았다");
  /* **그날이 아니라 그 주다.** 이레째 점검이 읽어야 하기 때문이다 */
  const wkNow = await A.evaluate(() => (plan() || {}).week || 1);
  if (String(wkeys[0]) !== String(wkNow))
    no("누구 말이야: 갈린 자리가 " + wkeys[0] + "주에 남았다. " + wkNow + "주여야 한다");

  /* ---- 113. 두 기기가 각자 적어야 목록이 같다 ---------------------------
     한쪽만 적으면 **이레 뒤에 두 사람이 서로 다른 목록을 본다** (T295). */
  const sameId = await B.evaluate(() => whoDeck()[0].id);
  await tap(B, '[data-who="' + hspec.regs[0] + '"]', "B 첫 벌");
  await tap(B, "#whoSame", "B 같았다");
  const bSplitId = await B.evaluate(() => whoDeck()[roundStep("whose")].id);
  await tap(B, '[data-who="' + hspec.regs[1] + '"]', "B 둘째 벌");
  await tap(B, "#whoSplit", "B 갈렸다");
  const listA = await A.evaluate(() => JSON.stringify(
    ((S.wsplit || {})[(plan() || {}).week || 1] || []).map((x) => x.id)));
  const listB = await B.evaluate(() => JSON.stringify(
    ((S.wsplit || {})[(plan() || {}).week || 1] || []).map((x) => x.id)));
  if (listA !== listB)
    no("누구 말이야: 두 기기의 갈린 목록이 다르다: " + listA + " / " + listB);
  if (bSplitId !== splitId)
    no("누구 말이야: 두 기기가 다른 벌을 돌고 있다");

  /* ---- 114. 두 기기가 같은 덱을 만든다 ----------------------------------
     **얼리는지는 안 잰다.** 이 판은 덱에서 빠지는 것이 없어서 얼릴 것이 없다.
     T296 에 그 판정을 넣어 뒀다가 뺐다. 얼리기를 지워도 안 깨졌기 때문이다.
     깨지지 않는 것을 재는 줄은 **재는 것처럼 보이기만 한다** (T290 과 같은 갈래). */
  const hDeckOf = (p) => p.evaluate(() => whoDeck().map((c) => c.id).join(","));
  if ((await hDeckOf(A)) !== (await hDeckOf(B)))
    no("누구 말이야: 두 기기가 다른 덱을 낸다");
  /* 덱이 오늘 강에 매여 있는가. **안 배운 자리를 앞당겨 쓰지 않는다** */
  const hAhead = await A.evaluate(() => {
    const pl = plan();
    return whoDeck().filter((c) =>
      !(c.q < pl.quarter || (c.q === pl.quarter && c.no <= pl.cards.to)))
      .map((c) => c.id);
  });
  if (hAhead.length)
    no("누구 말이야: 아직 안 나온 자리가 덱에 있다: " + hAhead.join(" "));

  /* ---- 115. 한 벌마다 자리가 바뀐다 ------------------------------------- */
  await A.evaluate(WHRESET);
  const hSeats = [];
  for (let i = 0; i < 4; i++) {
    hSeats.push(await A.evaluate(() =>
      /이 기기 자리 자리를 고르는 쪽/.test(
        document.querySelector("#playPane").innerText)));
    await A.evaluate(() => { roundStepSet("whose", roundStep("whose") + 1);
                             renderWhose(); });
  }
  const hFlips = [];
  for (let i = 1; i < hSeats.length; i++)
    if (hSeats[i] !== hSeats[i - 1]) hFlips.push(i);
  if (hFlips.length !== hSeats.length - 1)
    no("누구 말이야: 자리가 바뀐 자리가 [" + hFlips.join(",") + "] 다. 한 벌마다 바뀐다");

  /* ---- 116. 마감이 절반이라고 안 적는다 ---------------------------------
     기록할 값이 "둘의 생각이 같았던 벌" 이라 **한 사람의 값이 아니다.**
     `playHalf` 의 말을 쓰면 두 사람이 두 수를 더한다. */
  await A.evaluate(WHRESET);
  await A.evaluate(() => { WHOCLK.over = true; renderWhose(); });
  const hDone1 = await text(A);
  await A.evaluate(() => { WHOCLK.over = false;
                           roundStepSet("whose", whoDeck().length); renderWhose(); });
  const hDone2 = await text(A);
  for (const [why, txt] of [["시계", hDone1], ["벌 끝", hDone2]]) {
    if (/소리 내어 더한다|그 절반이다/.test(txt))
      no("누구 말이야 (" + why + "): 마감이 더하라고 적는다. 이 판은 절반이 아니다");
    if (!txt.includes("같은 수"))
      no("누구 말이야 (" + why + "): 두 기기에 같은 수가 있어야 한다는 말이 없다");
    if (!txt.includes("주 이레째 점검"))
      no("누구 말이야 (" + why + "): 갈린 자리가 어디로 가는지 안 적는다");
    if (!/갈린 것은 틀린 것이 아니다/.test(txt))
      no("누구 말이야 (" + why + "): 갈린 것이 틀린 것이 아니라는 말이 없다");
  }

  /* ---- 117. 갈린 자리가 주 점검 화면에 뜬다 -----------------------------
     **판 탭을 떠나서 재는 첫 판정이다.** 판이 판 밖으로 값을 내보냈다 (T295).
     여기서 안 뜨면 그 값은 어디에도 안 간 것이고 규칙서 7.3 의
     "그 자리가 주 7일째 점검에 간다" 가 글로만 남는다. */
  await A.evaluate(WHRESET);
  const wcOff = await A.evaluate(() => { go("ledger"); renderWeekCheck();
    return document.querySelector("#weekCheck").innerText; });
  if (/갈린 자리/.test(wcOff))
    no("누구 말이야: 갈린 것이 없는데 주 점검이 갈린 자리를 적는다");
  const put = await A.evaluate(() => {
    const w = (plan() || {}).week || 1;
    S.wsplit = {}; S.wsplit[w] = [{ id: "TEST-1", where: "검사가 넣은 자리",
                                    who: "검사가 넣은 상대", day: today() }];
    save(); go("ledger"); renderWeekCheck();
    return document.querySelector("#weekCheck").innerText;
  });
  if (!put.includes("검사가 넣은 자리"))
    no("주 점검: 누구 말이야에서 갈린 자리가 안 뜬다. " +
       "규칙서 7.3 이 그 자리가 이레째 점검에 간다고 적었다");
  if (!put.includes("갈린 것은 틀린 것이 아니다"))
    no("주 점검: 갈린 것이 틀린 것이 아니라는 말이 없다");
  await A.evaluate(() => { S.wsplit = {}; save(); go("play"); });

  /* ---- 118. 등급과 마크다운 --------------------------------------------- */
  await A.evaluate(() => { PLAY.at = "whose"; renderPlayTab(); });
  await A.waitForTimeout(300);
  await A.evaluate(WHRESET);
  const hTxt = await text(A);
  if (!hTxt.includes(hspec.grade + "등급"))
    no("누구 말이야: 자료 등급이 화면에 없다");
  if (hspec.grade !== "A" && !hTxt.includes("통과 판정에는 안 쓴다"))
    no("누구 말이야: B등급인데 통과 판정에 안 쓴다는 말이 없다");
  if (/\*\*/.test(hTxt))
    no("누구 말이야: 화면에 마크다운 표시가 보인다");

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 3).join(" / "));
  await browser.close();

  /* **판정 줄이 맨 뒤에 온다.** `all.py` 가 마지막 뜻있는 줄을 그 검사의 판정으로 읽는다.
     기계가 안 보는 것을 뒤에 두면 표에 그 줄이 뜨고 실패 수가 안 보인다. */
  console.log("**기계가 안 보는 것: 상 건너로 보이는 화면, 소리가 정말 갈렸는지**");
  console.log("판 13개 / 거울 10 / 한 줄 바꾸기 6 / 내 소리는 네가 7 / 전달 놀이 8 / " +
              "이어달리기 15 / 둘이 한 문장 17 / 겹치면 지운다 25 / 배속 사다리 21 / " +
              "3초 벽 35 / 되받아치기 35 / 한 사람만 본다 36 / " +
              "파장 34 / " +
              "누구 말이야: 규격 3판, 정답 없음 5판, 감출 것 없음 6판, 고르기 전 4판, " +
              "셈 4판, 그 주 3판, 두 기기 2판, 덱 2판, 한 벌마다 1판, 마감 8판, " +
              "**주 점검까지 4판**, 등급 3판 **판 밖으로 나간 값을 잰다** / " +
              "실패 " + fails.length);
  process.exit(fails.length ? 1 : 0);
})();
