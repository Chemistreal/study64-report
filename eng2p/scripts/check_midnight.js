/* 자정을 넘기는 세션 (T400).
 *
 * 두 시간짜리 세션이다. 성인 둘이 저녁에 앉으면 22시에 시작하는 날이 온다.
 * 그러면 블록 4는 자정 뒤다.
 *
 * 재 보니 이랬다.
 *
 *     블록 1에 적은 것은 어제 칸에 들어간다
 *     블록 4에 적은 것은 오늘 칸에 들어간다
 *     **어느 날도 마쳤다고 안 적힌다.** 둘 다 미완으로 남는다
 *     연속일이 0이 된다
 *
 * 두 사람은 두 시간을 다 돌았는데 어느 날도 한 날로 안 남는다.
 * 그리고 자정 뒤에 새로고침하면 **날이 다르다고 세션을 버렸다.**
 * 22시에 시작한 세션이 0시 1분에 새로고침 한 번으로 없어진다.
 *
 * 여태 자정 넘김을 잰 자리가 둘 있었다 (T216, T276). 둘 다 **쪽이 뒤집히는가**만
 * 봤다. 기록이 어느 날로 가는가는 아무도 안 쟀다.
 *
 * 시계를 세워 놓고 손으로 민다. 이 검사에서만 `Date` 를 감싼다.
 *
 * **기계가 안 보는 것: 자정을 넘긴 날 두 사람이 무엇을 느끼는가.**
 *
 * 사용법:
 *     node scripts/check_midnight.js
 *
 * 규격: docs/roadmap.md 12.10
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("자정 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

const fails = [];
let n = 0;

/* 시계를 세운다. `__adv(밀리초)` 로 민다. **이 검사 안에서만 감싼다.**
 *
 * 민 만큼을 저장소에 남긴다. **안 남기면 새로고침에 시계가 되돌아간다.**
 * 처음에는 안 남겼다. 그래서 자정을 넘기고 새로고침하는 판이
 * 사실은 **자정을 안 넘긴 채로 돌고 있었다.** 깸을 심었는데 안 잡혀서 알았다.
 * `addInitScript` 는 페이지가 뜰 때마다 다시 도는데 그때 오프셋이 0이 된다.
 * 새로고침을 쓰는 검사에서 시계를 감쌀 때는 그 값이 살아남아야 한다. */
function clockAt(h, m) {
  return `(() => {
    const base = new Date(2026, 7, 20, ${h}, ${m}, 0).getTime();
    const K = "__clock_off";
    let off = 0;
    try { off = Number(localStorage.getItem(K) || 0) || 0; } catch (e) {}
    window.__adv = (ms) => {
      off += ms;
      try { localStorage.setItem(K, String(off)); } catch (e) {}
    };
    const R = Date;
    function F(...a) { if (a.length) return new R(...a); return new R(base + off); }
    F.now = () => base + off; F.parse = R.parse; F.UTC = R.UTC; F.prototype = R.prototype;
    window.Date = F;
  })()`;
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });

  async function open(h, m) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(clockAt(h, m));
    const page = await ctx.newPage();
    await page.goto(PAGE);
    await page.waitForTimeout(700);
    await page.fill("#obA", "가람");
    await page.fill("#obB", "나래");
    await page.click("#obGo");
    await page.waitForTimeout(500);
    return { ctx, page };
  }

  /* 1. **한 세션이 한 날에 모이는가.** 이 검사의 고갱이다 */
  {
    n += 5;
    const { ctx, page } = await open(23, 40);
    const start = await page.evaluate(() => today());
    await page.click("#tOne");
    await page.waitForTimeout(700);
    await page.evaluate(() => {
      day(today()).speak = 11;
      day(today()).unres.push({ t: "블록1", i: "", k: "", h: "", w: "", done: false });
      saveNow();
    });
    /* 자정을 넘긴다 */
    await page.evaluate(() => window.__adv(30 * 60 * 1000));
    await page.waitForTimeout(300);
    const real = await page.evaluate(() => realToday());
    if (real === start) { fails.push("시계를 밀었는데 진짜 오늘이 안 바뀌었다"); }
    const now = await page.evaluate(() => today());
    if (now !== start)
      fails.push("자정을 넘겼더니 오늘이 " + now + " 로 바뀌었다 (세션은 " + start + " 에 시작했다)");
    await page.evaluate(() => gotoBlock(3));
    await page.waitForTimeout(600);
    await page.evaluate(() => {
      day(today()).cards = 7;
      day(today()).unres.push({ t: "블록4", i: "", k: "", h: "", w: "", done: false });
      saveNow();
    });
    const got = await page.evaluate((s) => ({
      one: S.days[s] || {}, two: S.days[realToday()] || {}, real: realToday() }), start);
    const u = (got.one.unres || []).map((x) => x.t);
    if (u.length !== 2)
      fails.push("한 세션에 적은 둘이 시작한 날에 " + u.length + "건만 있다: " + u.join(" "));
    if ((got.one.speak || 0) !== 11 || (got.one.cards || 0) !== 7)
      fails.push("블록 1과 블록 4의 값이 한 날에 안 모였다: speak " +
                 got.one.speak + " cards " + got.one.cards);
    /* **자정 뒤 날에는 아무것도 안 생겨야 한다** */
    if ((got.two.unres || []).length || got.two.speak || got.two.cards)
      fails.push("자정 뒤 날에도 기록이 생겼다: " + JSON.stringify(got.two).slice(0, 90));
    await ctx.close();
  }

  /* 2. **세션이 끝나면 시작한 날이 마쳐진다.** 그리고 오늘이 시계를 따른다 */
  {
    n += 3;
    const { ctx, page } = await open(23, 40);
    const start = await page.evaluate(() => today());
    await page.click("#tOne");
    await page.waitForTimeout(600);
    await page.evaluate(() => window.__adv(40 * 60 * 1000));
    await page.waitForTimeout(300);
    const st = await page.evaluate(() => {
      /* 블록 넷을 다 돌고 끝낸다 */
      gotoBlock(3); T.left = 0; finishSession();
      return { day: S.days[today()] ? today() : null,
               after: today(), real: realToday(), sess: S.session,
               statusAt: (function () {
                 const o = {}; Object.keys(S.days).forEach((d) => { o[d] = S.days[d].status; });
                 return o; })() };
    });
    if (st.statusAt[start] !== "normal")
      fails.push("세션을 마쳤는데 시작한 날(" + start + ")이 정상이 아니다: " +
                 JSON.stringify(st.statusAt));
    /* **끝난 뒤에는 시계를 따른다.** 안 그러면 다음 날 내내 어제로 보인다 */
    if (st.after !== st.real)
      fails.push("세션이 끝났는데 오늘이 " + st.after + " 다 (시계는 " + st.real + ")");
    if (st.sess) fails.push("세션을 마쳤는데 이어 갈 자리가 남았다");
    await ctx.close();
  }

  /* 3. **자정을 넘긴 뒤 새로고침해도 이어 가는가.** 두 시간이 사라지면 안 된다 */
  {
    n += 4;
    const { ctx, page } = await open(23, 40);
    const start = await page.evaluate(() => today());
    await page.click("#tOne");
    await page.waitForTimeout(600);
    await page.evaluate(() => { gotoBlock(2); });
    await page.waitForTimeout(400);
    await page.evaluate(() => window.__adv(30 * 60 * 1000));
    await page.waitForTimeout(200);
    await page.reload();
    await page.waitForTimeout(800);
    const got = await page.evaluate(() => ({
      sess: !!S.session, idx: typeof T !== "undefined" ? T.idx : null,
      today: today(), real: realToday() }));
    /* **이 판이 정말 자정을 넘겼는지부터 본다.** 안 넘겼으면 아무것도 안 쟀다 */
    if (got.real === start)
      fails.push("새로고침 뒤에 시계가 되돌아갔다. 이 판이 자정을 안 넘겼다");
    if (!got.sess || got.idx === null)
      fails.push("자정을 넘긴 뒤 새로고침했더니 세션이 사라졌다");
    if (got.idx !== 2)
      fails.push("이어 갔는데 블록이 " + (got.idx === null ? "없다" : got.idx + 1) + " 다");
    if (got.today !== start)
      fails.push("이어 갔는데 오늘이 " + got.today + " 다 (세션은 " + start + ")");
    await ctx.close();
  }

  /* 4. **어제 것은 안 이어 간다.** 여섯 시간을 넘으면 그것은 어제 세션이다 */
  {
    n += 3;
    const { ctx, page } = await open(23, 40);
    await page.click("#tOne");
    await page.waitForTimeout(600);
    /* 열 시간을 민다. 아침에 앱을 여는 자리다 */
    await page.evaluate(() => window.__adv(10 * 60 * 60 * 1000));
    await page.reload();
    await page.waitForTimeout(800);
    const got = await page.evaluate(() => ({
      today: today(), real: realToday(),
      going: typeof T !== "undefined" && T.run === true }));
    if (got.real === "2026-08-20")
      fails.push("새로고침 뒤에 시계가 되돌아갔다. 이 판이 하루를 안 넘겼다");
    if (got.today !== got.real)
      fails.push("열 시간 뒤에 열었는데 오늘이 " + got.today + " 다 (시계는 " + got.real + ")");
    if (got.going) fails.push("열 시간 뒤에 열었는데 시계가 돌고 있다");
    await ctx.close();
  }

  /* 5. **안 끝난 세션이 오늘을 영영 어제로 만들지 않는가.**
     이틀 넘게 벌어지면 그 값을 버리고 시계를 따른다 */
  {
    n += 1;
    const { ctx, page } = await open(23, 40);
    const got = await page.evaluate(() => {
      SESSION_DAY = addDays(realToday(), -3);
      return { today: today(), real: realToday() };
    });
    if (got.today !== got.real)
      fails.push("사흘 전에 걸린 세션 날이 오늘을 " + got.today + " 로 만든다");
    await ctx.close();
  }

  /* 6. **사본 이름은 시계를 따른다.** 세션 중에도 그렇다.
     사본은 날마다 한 벌인데 그 날이 세션 날이면 이레가 흔들린다 */
  {
    n += 2;
    const { ctx, page } = await open(23, 40);
    await page.click("#tOne");
    await page.waitForTimeout(600);
    const got = await page.evaluate((k) => {
      window.__adv(30 * 60 * 1000);
      S.names.a = "바뀐값"; saveNow();
      S.names.a = "또바뀜"; saveNow();
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const x = localStorage.key(i);
        if (x.indexOf(k + ".bak.") === 0) keys.push(x.slice((k + ".bak.").length));
      }
      return { keys: keys.sort(), today: today(), real: realToday() };
    }, "eng2p.v1");
    if (got.keys.indexOf(got.real) < 0)
      fails.push("자정을 넘겼는데 사본이 시계 날(" + got.real + ")로 안 생겼다: " +
                 got.keys.join(" "));
    if (got.today === got.real)
      fails.push("이 판이 자정을 안 넘겼다. 아무것도 안 쟀다");
    await ctx.close();
  }

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 자정을 넘긴 날 두 사람이 무엇을 느끼는가**");
  console.log("자정 %d판 (한 날에 모임 5, 마침 3, 이어 감 4, 어제 것 3, 오래 걸린 것 1, 사본 2) / 실패 %d",
              n, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("[실패] 검사가 도중에 멈췄다: " + e.message);
  process.exit(1);
});
