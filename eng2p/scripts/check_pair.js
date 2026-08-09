/* 짝 동기 검사기. **두 기기를 하루 통째로 돌린다.**
 *
 * `check_ui.js` 가 D단계 조각을 하나씩 쟀다. 씨앗, 자리, 몫, 코드, 합치기다.
 * 조각이 다 맞아도 **이어 붙이면 어긋나는 자리**가 있다.
 * 한 판이 아니라 스무 회를 돌 때, 한 번이 아니라 하루를 돌 때 갈린다.
 *
 * 여기서는 창을 둘 띄운다. 저장소가 따로다. 진짜 기기 둘이다.
 * 그 둘을 같이 몰면서 어긋나는지만 본다.
 *
 * 무엇을 보는가.
 *
 *     같은 판     스무 회 내내 판 표시가 같다
 *     반대 자리   스무 회 내내 자리가 서로 반대다
 *     서로 채움   보이는 몫이 겹치지도 비지도 않는다
 *     진도        세션 끝에 짝 코드로 견주면 갈린 자리가 없다
 *     갈림 잡기   한쪽만 적으면 갈렸다고 나온다
 *     합치기      합치면 갈림이 없어진다
 *
 * 마지막 셋이 이 검사가 있는 이유다. **조각으로는 그 셋을 못 잰다.**
 * 짝 코드는 기록에서 나오고 기록은 하루를 돌아야 생긴다.
 *
 * 쓰는 법:
 *     node scripts/check_pair.js
 *
 * 규격: docs/pair.md, docs/merge.md, docs/round.md
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("짝 동기 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require("playwright-core").chromium; }
catch (e) { skip("playwright-core 가 없다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

/* 두 기기가 같은 시작일과 같은 날들을 들고 있어야 한다. 거기서부터 갈리면
   갈리는 것이 당연해서 아무것도 안 재게 된다. **같은 데서 출발시킨다.**

   주와 요일을 받는다. **한 날만 재면 그 날에만 맞는 것을 못 본다.**
   자리는 `roleOf(오늘)` 로 날마다 뒤집히고 씨앗에 오늘 날짜가 들어간다.
   그래서 주마다 요일을 다르게 골라 훑는다. T253 */
const SEED = (arg) => {
  const who = arg.who, week = arg.week, day = arg.day;
  function iso(d) { var z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return z.toISOString().slice(0, 10); }
  var need = (week - 1) * 6 + (day - 1);
  var now = new Date(), st = new Date(now.getTime()), cnt = 0;
  while (cnt < need) { st = new Date(st.getTime() - 86400000);
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
      q: {}, rot: [], clips: [], scripts: {}, rstep: {}, rseat: {} }));
};

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const fails = [];
  const errs = [];
  const dev = {};
  for (const who of ["a", "b"]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
                                           reducedMotion: "reduce" });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errs.push(who + ": " + e.message));
    await page.goto(PAGE);
    await page.evaluate(SEED, who);
    await page.goto(PAGE);
    await page.waitForTimeout(500);
    dev[who] = { ctx, page };
  }
  const A = dev.a.page, B = dev.b.page;

  /* 48주를 다 도는 것이 좋지만 매 세션 돌기에는 길다. **여덟 주를 고른다.**
     분기마다 둘이고 첫 주와 끝 주가 들어간다. `check_session.js` 와 같은 꼴이다.
     전수는 `ENG2P_ALL_WEEKS=1` 로 돈다. T253 에 한 번 돌려 확인했다. */
  const ALL = process.env.ENG2P_ALL_WEEKS === "1";
  const WEEKS = ALL ? Array.from({ length: 48 }, (_, i) => i + 1)
                    : [1, 7, 13, 19, 25, 31, 37, 48];
  let spans = 0;
  for (const wk of WEEKS) {
    const dayNo = (wk % 6) + 1;            // 주마다 다른 요일을 본다
    for (const who of ["a", "b"]) {
      const p = dev[who].page;
      await p.goto(PAGE);
      await p.evaluate(SEED, { who: who, week: wk, day: dayNo });
      await p.goto(PAGE);
      await p.waitForTimeout(350);
    }
    const got = await A.evaluate(() => plan().week);
    if (got !== wk) { fails.push(wk + "주로 못 갔다. " + got + "주가 됐다"); continue; }
    /* 주마다 여섯 회만 본다. 스무 회는 마지막 주에서 한 번 더 돈다. */
    for (let s = 0; s < 6; s++) {
      const read = (p) => p.evaluate((n) => ({
        tag: roundTag("sync", n), first: roundFirst(n, 2),
        part: roundPart(n, 2, ["앞", "뒤"]),
        order: roundOrder(8, roundSeed("sync", n)).join("") }), s);
      const [ra, rb] = [await read(A), await read(B)];
      spans++;
      if (ra.tag !== rb.tag)
        fails.push(wk + "주 " + s + "회 판 표시가 갈린다: " + ra.tag + " / " + rb.tag);
      if (ra.order !== rb.order) fails.push(wk + "주 " + s + "회 차례가 갈린다");
      if (ra.first === rb.first)
        fails.push(wk + "주 " + s + "회에 두 기기가 같은 자리다: " + ra.first);
      const mine = ra.part.mine.concat(rb.part.mine).sort().join("");
      if (mine !== "뒤앞") fails.push(wk + "주 " + s + "회 몫이 서로 안 채운다: " + mine);
    }
  }

  /* 1. 스무 회를 나란히 돈다. 회마다 셋을 본다. */
  let steps = 0;
  for (let s = 0; s < 20; s++) {
    const read = (p) => p.evaluate((n) => ({
      tag: roundTag("sync", n),
      first: roundFirst(n, 2),
      part: roundPart(n, 2, ["앞", "뒤"]),
      order: roundOrder(8, roundSeed("sync", n)).join("") }), s);
    const [ra, rb] = [await read(A), await read(B)];
    steps++;
    if (ra.tag !== rb.tag)
      fails.push(s + "회 판 표시가 갈린다: " + ra.tag + " / " + rb.tag);
    if (ra.order !== rb.order) fails.push(s + "회 차례가 갈린다");
    if (ra.first === rb.first)
      fails.push(s + "회에 두 기기가 같은 자리다: " + ra.first);
    const mine = ra.part.mine.concat(rb.part.mine).sort().join("");
    if (mine !== "뒤앞") fails.push(s + "회 몫이 서로 안 채운다: " + mine);
  }

  /* 2. 하루를 적는다. **한쪽만 적는다.** 매뉴얼 10.10 이 그렇게 시킨다. */
  await A.evaluate(() => {
    const r = day(today());
    r.status = "normal"; r.speak = 18; r.cards = 34; r.lre = 5;
    r.unres = [{ t: "못 알아들었다" }]; r.coll = [{ e: "got it" }];
    r.aim = { a: "내가 본 지점", b: "" };
    save();
  });

  /* 3. 세션 끝에 짝 코드로 견준다. 갈린 것이 잡혀야 한다. */
  const code = (p) => p.evaluate(() => pairCode());
  const [ca, cb] = [await code(A), await code(B)];
  if (ca === cb) fails.push("한쪽만 적었는데 짝 코드가 같다");
  const cross = await B.evaluate((c) => {
    const got = pairRead(c);
    if (!got.ok) return { err: got.err };
    const mine = pairRead(pairCode()).v;
    const d = pairDiff(mine, got.v);
    return { heavy: d.heavy, light: d.light, v: got.v };
  }, ca);
  if (cross.err) fails.push("상대 코드를 못 읽는다: " + cross.err);
  else {
    if (!cross.light) fails.push("한쪽만 적었는데 활동량이 같다고 나온다");
    /* **다르다는 것만 보면 모자란다.** 코드가 셈을 안 담아도 다르기는 하다.
       미해결 건수만 갈려도 다르게 나온다. 일부러 발화 분과 드릴 장수를 0으로
       만들어 보니 그대로 통과했다. **무엇이 담겼는지를 값으로 본다.** T252 */
    const want = { speak: 18, cards: 34, lre: 5, unres: 1, coll: 1 };
    Object.keys(want).forEach((k) => {
      if (cross.v[k] !== want[k])
        fails.push("짝 코드가 " + k + " 를 " + cross.v[k] + " 로 담았다. " +
                   want[k] + " 여야 한다");
    });
  }

  /* 4. 합친다. 합치고 나면 갈린 자리가 없어야 한다. */
  const exported = await A.evaluate(() => JSON.stringify(S));
  const merged = await B.evaluate((raw) => {
    const other = JSON.parse(raw);
    const pl = mergePlan(S, other);
    const pick = {};
    pl.ask.forEach((q) => { pick[q.path] = "theirs"; });
    const r = mergeApply(pl, pick);
    if (!r.ok) return { err: r.err };
    S = r.out; saveNow();
    return { asks: pl.ask.length, code: pairCode(),
             speak: day(today()).speak, unres: day(today()).unres.length,
             device: S.device };
  }, exported);
  if (merged.err) fails.push("합치기가 안 끝난다: " + merged.err);
  else {
    if (merged.code !== ca)
      fails.push("합쳤는데 짝 코드가 다르다: " + merged.code + " / " + ca);
    if (merged.speak !== 18) fails.push("합쳤는데 발화 분이 " + merged.speak + " 다");
    if (!merged.unres) fails.push("합쳤는데 미해결이 안 넘어왔다");
    /* **기기 쪽은 안 건너간다.** 합쳐도 이 기기는 b 다 (`docs/pair.md` 3장). */
    if (merged.device !== "b")
      fails.push("합쳤더니 기기 쪽이 " + merged.device + " 가 됐다");
  }

  /* 5b. **시작일이 갈린 기기.** 여기가 이 검사가 진짜로 재야 하는 자리다. T253

     앞의 주 훑기는 판 수가 큰데 흔든 것이 적다. 자리는 `deviceSide()` 로 갈리고
     그것은 `devicePerson` 과 `roleOf(오늘)` 의 곱이다. `roleOf` 는 오늘 날짜의
     홀짝이고 **한 번 도는 동안 오늘은 안 바뀐다.** 주를 마흔여덟 개 돌아도
     그 값은 그대로다. 그래서 그 훑기는 "주마다 안 깨진다" 만 말한다.

     정말 갈리는 자리는 **두 기기의 시작일이 다를 때**다. 그러면 씨앗이 갈리고
     판이 갈리고 진도가 갈린다. `docs/pair.md` 가 막으려던 그 일이다.
     그것이 잡히는지를 본다. */
  await B.evaluate(() => { S.start = addDays(S.start, -1); saveNow(); });
  const split = await B.evaluate(() => {
    const t0 = roundTag("sync", 0);
    const mine = pairRead(pairCode()).v;
    return { tag: t0, done: mine.done };
  });
  const aTag = await A.evaluate(() => roundTag("sync", 0));
  if (split.tag === aTag)
    fails.push("시작일이 갈렸는데 판 표시가 같다: " + split.tag);
  /* **짝 코드는 시작일을 안 담는다. 그것이 맞다.** 진도는 `doneSessions()` 로 세고
     시작일은 거기에 안 들어간다. 시작일이 하루 밀려도 몇 주 며칠은 그대로다.

     처음에 "진도가 갈렸다고 해야 한다" 고 재다가 실패가 났다. **검사가 틀렸다.**
     앱은 맞게 돌고 있었다 (T228 이 적은 그 자리다).

     그래도 구멍이 하나 남는다. **코드는 같은데 판 씨앗은 갈려 있다.**
     세션 끝에 코드만 견주면 "다 같다" 고 나오고 다음 판에서 둘이 다른 것을 본다.
     그래서 화면이 코드 옆에 시작일을 적고 그것도 견주라고 말한다. T253 */
  const codeSame = await A.evaluate(async (c) => {
    const got = pairRead(c);
    if (!got.ok) return { err: got.err };
    const d = pairDiff(pairRead(pairCode()).v, got.v);
    go("ledger");
    await new Promise((r) => setTimeout(r, 300));
    return { heavy: d.heavy.length, light: d.light,
             shown: (document.getElementById("pairBox") || {}).innerText || "",
             start: S.start };
  }, await B.evaluate(() => pairCode()));
  if (codeSame.err) fails.push("갈린 기기 코드를 못 읽는다: " + codeSame.err);
  else {
    if (codeSame.heavy) fails.push("시작일만 갈렸는데 진도가 갈렸다고 한다");
    /* 코드가 못 잡는 것을 화면이 말해야 한다. */
    if (codeSame.shown.indexOf(codeSame.start) < 0)
      fails.push("짝 맞추기 화면에 시작일이 없다. 코드는 시작일을 안 담는다");
    if (!/시작일/.test(codeSame.shown))
      fails.push("시작일을 견주라는 말이 없다");
  }
  const asked = await A.evaluate((raw) => {
    const pl = mergePlan(S, JSON.parse(raw));
    return pl.ask.map((q) => q.path);
  }, await B.evaluate(() => JSON.stringify(S)));
  if (asked.indexOf("start") < 0)
    fails.push("시작일이 갈렸는데 합치기가 안 묻는다: " + asked.join(","));
  await B.evaluate(() => { S.start = addDays(S.start, 1); saveNow(); });

  /* 5. 합친 뒤에도 자리는 여전히 반대여야 한다.
     **기기 쪽이 안 건너갔으므로 그래야 맞다.** 여기서 같아지면 3장이 깨진 것이다. */
  const after = [await A.evaluate(() => roundFirst(0, 2)),
                 await B.evaluate(() => roundFirst(0, 2))];
  if (after[0] === after[1]) fails.push("합친 뒤에 두 기기가 같은 자리가 됐다");

  for (const who of ["a", "b"]) await dev[who].ctx.close();
  await browser.close();

  errs.slice(0, 5).forEach((m) => fails.push("화면 오류: " + m));
  fails.slice(0, 20).forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("기기 2개를 나란히 / 주 " + WEEKS.length + "개 x 6회 x 4 = " +
              spans * 4 + "판 / 회 " + steps + "판 x 4 = " + steps * 4 +
              " / 짝 코드 7판 / 합치기 5판 / 갈린 기기 4판 / 실패 " + fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
