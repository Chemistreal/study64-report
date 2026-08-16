/* 1년을 통째로 돈다. **길게 도는 것을 안 재 봤다.** T338
 *
 * 지금까지 검사는 다 붙박이 상태를 세워 놓고 **한 자리**를 쟀다.
 * 그러면 자리마다는 맞는데 마흔여덟 주를 잇달아 갈 때 어긋나는 것은 안 잡힌다.
 *
 * 이 검사는 주 1부터 48까지 세션을 채워 가며 그때마다 다시 잰다.
 *
 *     주가 빠짐없이 지나가는가       마흔여덟 주가 하나씩 온다
 *     퀘스트를 채울 수 있는가        이상적인 해에도 못 채우는 주가 있으면 그것은 못 채울 목표다
 *     연속일이 안 끊기는가           일요일과 비상판 규칙이 1년 내내 맞는가
 *     구간 줄이 스물한 주만 뜨는가   `docs/ahead.md` 가 적은 값과 견준다
 *     1년을 넘기면 무엇을 말하는가   **끝난 뒤를 아무도 안 봤다**
 *
 * ## 이 검사가 잡은 것
 *
 * 분기 통과 조건 넷 중 누적 시간이 **손으로 치는 칸**이었다.
 * 앱이 `S.days` 를 합해서 이미 아는 값이다. T226 이 주간 점검에서 고친
 * 그 자리와 같은 종류고, 1년을 통째로 돌려 보고서야 보였다.
 *
 * 사용법:
 *     node scripts/check_year.js
 *
 * 규격: docs/year.md
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("1년 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

/* 구간 줄이 뜨는 주 수. `docs/ahead.md` 6장이 정한 규칙에서 나온다.
   **여기 숫자를 적어 두고 앱이 센 것과 견준다.** 어림하면 틀린다 (T335 에서 틀렸다). */
const AHEAD_ON = 21;

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(PAGE);
  await page.evaluate(() => {
    S.onboarded = true; S.names.a = "가람"; S.names.b = "나래"; saveNow();
  });
  await page.reload();
  await page.waitForTimeout(500);
  await page.evaluate(() => new Promise((ok) => loadData("quest", "ENG2P_QUEST", ok)));
  await page.evaluate(() => new Promise((ok) => loadData("ahead", "ENG2P_AHEAD", ok)));

  const fails = [];
  const no = (m) => fails.push(m);

  /* ---- 1. 이상적인 해를 하루씩 채워 간다 --------------------------------
     **끝낸 수로 세는 값은 끝나는 순간 다음을 가리킨다** (T316, T325).
     주 w 의 첫날에 서려면 마친 세션이 (w-1)*6 이다. 처음에 w*6 으로 재서
     마흔일곱 주가 통째로 어긋난 것으로 나왔다. **검사가 틀렸다.** */
  const run = await page.evaluate(() => {
    const out = { rows: [], bad: [], ahead: { soon: 0, now: 0, past: 0, none: 0 } };
    const fill = (n) => {
      S.days = {}; let k = 0, c = 0;
      while (c < n) {
        const d = addDays(today(), -k);
        if (parseISO(d).getDay() !== 0) {
          /* 하루도 안 빠진 해다. 값은 넉넉히 넣어 **채울 수 있는가**만 본다 */
          S.days[d] = { status: "normal", speak: 70, cards: 70, lre: 9,
                        unres: [], coll: ["a", "b", "c"], one: true };
          c++;
        }
        k++;
      }
      S.start = addDays(today(), -k);
      saveNow();
    };
    for (let w = 1; w <= 48; w++) {
      fill((w - 1) * 6);
      const pl = plan();
      if (pl.week !== w) out.bad.push(w + "주여야 하는데 " + pl.week + "주라고 한다");
      if (pl.day !== 1) out.bad.push(w + "주 첫날이어야 하는데 " + pl.day + "일째다");
      if (pl.behind !== 0) out.bad.push(w + "주에 밀림이 " + pl.behind + "이다");
      /* 그 주를 다 채운 자리에서 퀘스트를 본다 */
      fill(w * 6);
      const q = (DATA.quest.weeks || []).filter((x) => x.week === w)[0];
      if (!q) { out.bad.push(w + "주 퀘스트가 없다"); continue; }
      const got = questNow(q.kind, w);
      if (got < q.goal)
        out.bad.push(w + "주 " + q.kind + " 를 이상적인 해에도 못 채운다: " +
                     got + " / " + q.goal);
      const days = weekDays(w).length;
      if (days !== 6) out.bad.push(w + "주에 든 날이 " + days + "개다");
      const st = streak();
      if (st !== w * 6) out.bad.push(w + "주에 연속일이 " + st + "이다");
      const a = aheadAt(w);
      out.ahead[a ? a.state : "none"]++;
      out.rows.push({ w: w, kind: q.kind, goal: q.goal, got: got, streak: st });
    }
    return out;
  });
  run.bad.slice(0, 8).forEach(no);
  if (run.bad.length > 8) no("어긋난 자리가 " + run.bad.length + "곳이다");

  const on = run.ahead.soon + run.ahead.now + run.ahead.past;
  if (on !== AHEAD_ON)
    no("구간 줄이 " + on + "주에 뜬다. ahead.md 는 " + AHEAD_ON + "주라고 적었다");
  if (run.ahead.now !== 13 || run.ahead.soon !== 5 || run.ahead.past !== 3)
    no("구간 줄 갈래가 곧 " + run.ahead.soon + " 지금 " + run.ahead.now +
       " 지남 " + run.ahead.past + " 이다. 5/13/3 이어야 한다");

  /* 퀘스트가 다섯 갈래를 다 쓰는가. **한 갈래도 안 쓰는 값이 있으면 죽은 값이다** */
  const kinds = {};
  run.rows.forEach((r) => { kinds[r.kind] = (kinds[r.kind] || 0) + 1; });
  const want = ["session", "speak", "cards", "lre", "coll", "one"];
  const dead = want.filter((k) => !kinds[k]);
  if (dead.length)
    no("48주 동안 한 번도 안 쓰는 퀘스트 갈래가 있다: " + dead.join(" "));

  /* ---- 2. 1년을 넘기면 무엇을 말하는가. **끝난 뒤를 아무도 안 봤다** ----- */
  const end = await page.evaluate(() => {
    S.days = {}; let k = 0, c = 0;
    while (c < 300) {
      const d = addDays(today(), -k);
      if (parseISO(d).getDay() !== 0) {
        S.days[d] = { status: "normal", speak: 70, cards: 70, lre: 9,
                      unres: [], coll: ["a", "b", "c"], one: true };
        c++;
      }
      k++;
    }
    S.start = addDays(today(), -k);
    saveNow(); go("today"); renderToday();
    const pl = plan();
    return { week: pl.week, session: pl.session, fin: pl.finished,
             txt: document.getElementById("t-today").innerText };
  });
  if (end.week !== 48) no("288세션을 넘겼는데 " + end.week + "주라고 한다");
  if (end.session !== 288) no("회차가 " + end.session + "이다. 288 에서 멈춰야 한다");
  if (!end.fin) no("288세션을 넘겼는데 끝났다고 안 한다");
  if (!/288세션을 다 했다/.test(end.txt)) no("다 했다는 말이 첫 화면에 없다");
  /* **끝났다고 그만두라고 하지 않는다.** 카드는 계속 돈다 */
  if (!/카드는 계속 돈다/.test(end.txt))
    no("끝난 뒤에 무엇을 하는지가 없다. 끝이 곧 그만두는 자리가 되면 안 된다");
  /* **넘긴 만큼을 세어 보이지 않는다.** 300세션째라고 적으면 그것은 눈금이 아니다 */
  if (/300세션|12세션 더|초과/.test(end.txt))
    no("288을 넘긴 수를 세어 보인다: " + end.txt.slice(0, 60));

  /* ---- 3. 밀린 해 (T339). **느리게 가는 해를 안 재 봤다** ---------------
     주 엿새 중 정규 넷 비상판 둘로 돈다. 결석이 없으니 연속일이 안 끊긴다.
     그런데 288세션에 오백 날이 넘게 걸린다. */
  const slow = await page.evaluate(() => {
    S.days = {}; S.rest = {};
    let norm = 0, cal = 0, seat = 0, d = today();
    while (norm < 288 && cal < 900) {
      if (parseISO(d).getDay() !== 0) {
        if (seat % 6 < 4) {
          S.days[d] = { status: "normal", speak: 70, cards: 70, lre: 9,
                        unres: [], coll: ["a", "b", "c"], one: true };
          norm++;
        } else {
          S.days[d] = { status: "emg", speak: 0, cards: 0, lre: 0,
                        unres: [], coll: [] };
        }
        seat++;
      }
      d = addDays(d, 1 * -1); cal++;
    }
    S.start = addDays(today(), -cal);
    saveNow(); go("today"); renderToday();
    return { cal: cal, streak: streak(), week: plan().week,
             done: plan().done, behind: plan().behind,
             txt: document.getElementById("todaySlots").innerText };
  });
  if (slow.cal < 400)
    no("느린 해가 " + slow.cal + "일이다. 400일을 넘겨야 그 벽을 잰다");
  if (slow.done !== 288) no("정규가 " + slow.done + "이다. 288 이어야 한다");
  /* **막은 자리가 셈을 바꾸면 안 된다.** 되돌아 걷기를 400일로 막아 뒀었고
     그때 하루도 안 빠졌는데 연속일이 229로 나왔다 (T339 에서 잡았다). */
  if (slow.streak !== 288)
    no("결석 없이 288세션을 했는데 연속일이 " + slow.streak + "이다. " +
       "되돌아 걷기를 막아 둔 자리가 셈을 바꾸고 있다");
  /* **비상판이 안 끊고 안 는다** (streak.md). 정규만 센다 */
  if (slow.streak > slow.done) no("연속일이 정규 세션 수보다 크다");
  /* **밀린 양을 세어 보이지 않는다** (원칙 4). 다그치지 않는다 */
  if (/밀렸|빚|못 한 날|늦었/.test(slow.txt))
    no("느린 해에 첫 화면이 밀린 것을 적는다: " + slow.txt.slice(0, 60));



  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  /* 결석이 섞이면 끊긴다. **비상판과 결석이 다르다** */
  const gap = await page.evaluate(() => {
    const ks = Object.keys(S.days).sort();
    const mid = ks[Math.floor(ks.length / 2)];
    S.days[mid].status = "absent";
    saveNow();
    return { st: streak(), when: mid };
  });
  if (gap.st >= 288) no("가운데 하루가 결석인데 연속일이 안 끊긴다: " + gap.st);
  if (gap.st < 1) no("결석 뒤로 이어 온 날이 하나도 없다고 한다");

  /* 그 자리에 회복권을 걸면 안 끊긴다. **미리 걸어야 하고 달에 둘이다** */
  const saved = await page.evaluate((d) => {
    REST()[d] = 1; saveNow();
    return { st: streak(), left: restLeft(d) };
  }, gap.when);
  if (saved.st !== 288)
    no("회복권을 건 날인데 연속일이 " + saved.st + "이다. 안 끊고 안 는다");
  if (saved.left !== 1)
    no("그 달 회복권이 " + saved.left + "장 남았다고 한다. 둘 중 하나를 썼다");

  /* **밀린 양은 한 자리에서만 적는다** (T356). 전에는 네 자리에 있었다.
     첫 화면 줄, 고리 이름표, 지도 아래, 내보내기다.
     같은 값을 여러 자리에서 보이면 그것이 곧 다그침이 된다 (원칙 4).

     ## 그려서 안 재고 코드를 글자로 읽는다

     화면마다 뜨는 조건이 다르다. 지도는 접혀 있고 진행 줄은 머리띠에 있다.
     그려서 세면 **그날 상태에 따라 수가 달라지고** 깸을 넣어도 안 잡힌다.
     실제로 두 번 그렇게 겪었다.

     적는 자리가 몇 곳인가는 코드에 있다. 거기를 센다. T329 T332 T341 T345 와 같은 손이다.

     ## 낱말이 아니라 자리를 센다 (T386)

     전에는 `주 밀렸다` 를 셌다. 그 말이 다그침이라 "달력은 N주째" 로 바꿨더니
     이 판이 0곳이라며 실패했다. **재려던 것은 자리 수지 그 낱말이 아니다.**

     말을 바꿔도 자리 수는 그대로여야 한다. 지금 말로 다시 센다.
     말이 또 바뀌면 여기도 같이 바꾼다. 그때 자리 수를 한 번 더 세게 된다. */
  const src = fs.readFileSync(path.join(ROOT, "english.html"), "utf-8");
  const sites = (src.match(/달력은 /g) || []).length;
  if (sites !== 2)
    no("달력 주를 적는 자리가 " + sites + "곳이다. 고리 이름표와 지도 아래 둘뿐이다");
  /* **다그치는 말로 되돌아가지 않는다** (`tone.md`) */
  if (/주 밀렸다/.test(src)) no("밀렸다고 적는 자리가 다시 생겼다");


  /* ---- 4. 앱이 아는 것을 사람이 다시 안 적는가 (T338) -------------------- */
  const auto = await page.evaluate(() => {
    go("quarter");
    return new Promise((ok) => setTimeout(() => {
      const box = document.getElementById("qPass");
      const rows = [...box.querySelectorAll(".card")];
      const hrs = rows.filter((r) => /누적 시간/.test(r.innerText))[0];
      ok({
        hrsInput: hrs ? !!hrs.querySelector("input") : null,
        hrsTxt: hrs ? hrs.innerText : "",
        inputs: box.querySelectorAll("input").length,
        conds: rows.length,
        total: totalHours(),
      });
    }, 900));
  });
  if (auto.hrsInput === null) no("분기 판정에 누적 시간 줄이 없다");
  if (auto.hrsInput) no("누적 시간을 사람이 손으로 친다. 앱이 이미 아는 값이다");
  if (!/앱이 셌다/.test(auto.hrsTxt)) no("앱이 센 값이라는 말이 없다: " + auto.hrsTxt);
  if (auto.hrsTxt.indexOf(String(auto.total)) < 0)
    no("화면 값이 대장이 센 " + auto.total + "h 와 다르다: " + auto.hrsTxt);
  /* **나머지는 사람이 잰다.** 그것까지 자동으로 채우면 지어내는 것이다 */
  if (auto.inputs !== auto.conds - 1)
    no("적는 칸이 " + auto.inputs + "개다. 조건 " + auto.conds +
       " 중 누적 시간 하나만 앱이 센다");

  /* ---- 5. 두 기기가 1년을 따로 돌고 합칠 때 (T340) ----------------------
     짝 맞추기는 날마다 하는 것이 규격이다 (매뉴얼 0장). 그런데 안 할 수 있다.
     **1년을 따로 돌고 나서 합치는 판을 아무도 안 봤다.** */
  /* 합치기는 늦게 읽는다 (T396). 부르기 전에 묶음을 읽어 둔다. 두 번은 안 읽는다 */
  await page.evaluate(() => window.mergePlan ? null :
    new Promise((ok) => loadScript("late", "eng2p/out/app/late.js", ok)));

  const two = await page.evaluate(() => {
    const mk = (n, tag) => {
      const days = {}; let k = 0, c = 0;
      while (c < n) {
        const d = addDays(today(), -k);
        if (parseISO(d).getDay() !== 0) {
          days[d] = { status: "normal", speak: 60 + tag, cards: 60, lre: 8,
                      unres: [], coll: ["a"],
                      aim: { a: "이쪽 " + c, b: "" } };
          c++;
        }
        k++;
      }
      return days;
    };
    S.days = {}; saveNow();
    const mine = JSON.parse(JSON.stringify(S));
    mine.days = mk(288, 0);
    const theirs = JSON.parse(JSON.stringify(S));
    theirs.days = mk(288, 1);
    Object.keys(theirs.days).forEach((d, i) => {
      theirs.days[d].aim = { a: "저쪽 " + i, b: "" };
    });
    const p1 = mergePlan(mine, theirs);
    /* **두 번 합쳐도 같아야 한다.** 이은 글이 자꾸 늘면 1년 뒤에 못 읽는다 */
    const p2 = mergePlan(p1.out, theirs);
    const one = Object.keys(p1.out.days).sort()[0];
    /* 그날 상태가 다르면 그것은 골라야 한다. 글과 다르다 */
    const t3 = JSON.parse(JSON.stringify(theirs));
    Object.keys(t3.days).forEach((d) => { t3.days[d].status = "emg"; });
    const p3 = mergePlan(mine, t3);
    return {
      ask1: p1.ask.length, ask3: p3.ask.length,
      joined: p1.out.days[one].aim.a,
      again: p2.out.days[one].aim.a,
      chg2: p2.chg.length,
      speak: p1.out.days[one].speak,
    };
  });
  /* **글은 안 묻고 둘 다 남긴다.** 288개를 하나씩 고르게 하면 아무도 못 한다 */
  if (two.ask1) no("글이 다르다고 " + two.ask1 + "개를 묻는다. 둘 다 남겨야 한다");
  if (two.joined.indexOf("이쪽") < 0 || two.joined.indexOf("저쪽") < 0)
    no("합친 글에 한쪽이 없다: " + two.joined);
  /* **두 번 합쳐도 같다** */
  if (two.again !== two.joined)
    no("두 번 합치니 글이 또 늘었다: " + two.again);
  if (two.chg2) no("바뀔 것이 없는데 두 번째 합치기가 " + two.chg2 + "개를 바꾼다");
  /* 큰 것을 든다 (MG_MAXDAY) */
  if (two.speak !== 61) no("발화 분이 " + two.speak + "이다. 큰 쪽을 들어야 한다");
  /* **골라야 하는 것은 그대로 묻는다.** 그날 상태는 이을 수 없다 */
  if (two.ask3 < 200)
    no("그날 상태가 288개 다른데 물음이 " + two.ask3 + "개다. 상태는 골라야 한다");

  /* 많이 물을 때 통째로 고르는 자리가 있는가 */
  /* 합치기는 늦게 읽는다 (T396). 부르기 전에 묶음을 읽어 둔다. 두 번은 안 읽는다 */
  await page.evaluate(() => window.mergePlan ? null :
    new Promise((ok) => loadScript("late", "eng2p/out/app/late.js", ok)));

  const many = await page.evaluate(() => {
    go("ledger");
    MG.name = "저쪽 기기"; MG.pick = {};
    const mk = (tag) => {
      const days = {}; let k = 0, c = 0;
      while (c < 288) {
        const d = addDays(today(), -k);
        if (parseISO(d).getDay() !== 0) {
          days[d] = { status: tag ? "emg" : "normal", speak: 60, cards: 60,
                      lre: 8, unres: [], coll: [] };
          c++;
        }
        k++;
      }
      return days;
    };
    S.days = mk(0); saveNow();
    const theirs = JSON.parse(JSON.stringify(S));
    theirs.days = mk(1);
    MG.plan = mergePlan(JSON.parse(JSON.stringify(S)), theirs);
    renderMerge();
    const box = document.getElementById("mgBox");
    return { asks: MG.plan.ask.length, txt: box.innerText,
             rows: box.querySelectorAll(".mgtab tr").length,
             allM: !!document.getElementById("mgAllM"),
             allT: !!document.getElementById("mgAllT"),
             clr: !!document.getElementById("mgClr") };
  });
  if (many.asks < 200) no("붙박이가 안 섰다. 물음이 " + many.asks + "개다");
  if (!many.allM || !many.allT) no("통째로 고르는 자리가 없다");
  if (!many.clr) no("고른 것을 지우는 자리가 없다. 잘못 누르면 못 되돌린다");
  /* **표를 다 안 그린다.** 수백 줄을 그리면 아무도 안 읽는다 */
  if (many.rows > 22) no("표가 " + many.rows + "줄이다. 스물까지만 그린다");
  if (!/오래 떨어져 있었다/.test(many.txt))
    no("왜 통째로 고르라는지가 없다: " + many.txt.slice(0, 80));
  if (!/개 더/.test(many.txt)) no("안 그린 것이 몇 개인지를 안 적는다");

  /* 통째로 고르면 다 정해진다 */
  /* 합치기는 늦게 읽는다 (T396). 부르기 전에 묶음을 읽어 둔다. 두 번은 안 읽는다 */
  await page.evaluate(() => window.mergePlan ? null :
    new Promise((ok) => loadScript("late", "eng2p/out/app/late.js", ok)));

  const all = await page.evaluate(() => {
    document.getElementById("mgAllT").click();
    return { picked: Object.keys(MG.pick).length, asks: MG.plan.ask.length };
  });
  if (all.picked !== all.asks)
    no("통째로 골랐는데 " + all.picked + " / " + all.asks + " 만 정해졌다");


  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 마흔여덟 주를 진짜로 견디는가**");
  console.log("1년 %d판 (주마다 6판 x 48 = %d, 구간 줄 3, 갈래 1, 끝 6, 밀린 해 9, " +
              "앱이 셈 5, 두 기기 12) / 실패 %d",
              48 * 6 + 36, 48 * 6, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
