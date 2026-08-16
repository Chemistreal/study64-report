/* 갈린 채로 1년을 도는가. G단계 적응 검사기. T360
 *
 * G단계가 만든 것은 **둘이 다를 수 있게 하는 것**이다.
 *
 *     트랙 진도    같이 지난 것이라 안 갈린다 (T343)
 *     카드 간격    답한 사람 것이라 갈린다 (T358)
 *     막힌 카드    사람별로 쌓이고 간격을 안 바꾼다 (T359)
 *
 * 자리마다는 이미 잰다. **갈린 채로 오래 도는 것을 안 재 봤다.**
 * `check_year.js` 가 1년을 도는 검사고 이것은 그 1년을 **둘로 갈라서** 돈다.
 *
 * ## 재는 것 넷
 *
 *     갈린 채로 가는가        한쪽만 돌면 한쪽만 는다
 *     안 섞이는가             합쳐도 갈래가 안 섞인다
 *     간격이 안 바뀌는가      막힌 것이 쌓여도 다음 날짜가 그대로다
 *     나란히 안 놓는가        화면 어디에도 두 사람 수가 같이 안 뜬다
 *
 * 사용법:
 *     node scripts/check_adapt.js
 *
 * 규격: docs/cards_person.md, docs/gap.md, docs/track.md
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("적응 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(PAGE);
  await page.evaluate(() => {
    S.onboarded = true; S.names.a = "가람이"; S.names.b = "나래는";
    S.device = "a"; saveNow();
  });
  await page.reload();
  await page.waitForTimeout(500);

  const fails = [];
  const no = (m) => fails.push(m);

  /* ---- 1. 갈린 채로 간다. **한쪽만 돌면 한쪽만 는다** -------------------- */
  const split = await page.evaluate(() => {
    S.cardDue = {}; S.device = "a"; saveNow();
    /* 카드 백 장을 이쪽 사람만 돈다. 저쪽 갈래는 그대로여야 한다 */
    for (let i = 1; i <= 100; i++) {
      const id = "Q1-" + String(i).padStart(3, "0");
      cardSet(id, { box: 1, due: addDays(today(), 3), ran: today(),
                    hist: [today()] });
    }
    saveNow();
    const m = cardDue();
    let mine = 0, yours = 0;
    for (const k in m) {
      if (m[k].a && m[k].a.ran) mine++;
      if (m[k].b && m[k].b.ran) yours++;
    }
    return { mine: mine, yours: yours, keys: Object.keys(m).length };
  });
  if (split.keys !== 100) no("카드가 " + split.keys + "장이다. 백 장이어야 한다");
  if (split.mine !== 100) no("이쪽 사람 것이 " + split.mine + "장이다");
  /* **저쪽은 안 는다.** 갈리는 것이 이 장치의 뼈대다 */
  if (split.yours !== 0)
    no("이쪽만 돌았는데 저쪽 갈래도 " + split.yours + "장 늘었다");

  /* ---- 2. 합쳐도 갈래가 안 섞인다 ---------------------------------------- */
  /* 합치기는 늦게 읽는다 (T396). 부르기 전에 묶음을 읽어 둔다. 두 번은 안 읽는다 */
  await page.evaluate(() => window.mergePlan ? null :
    new Promise((ok) => loadScript("late", "eng2p/out/app/late.js", ok)));

  const merged = await page.evaluate(() => {
    const mine = JSON.parse(JSON.stringify(S));
    const theirs = JSON.parse(JSON.stringify(S));
    /* 저쪽 기기는 저쪽 사람이 돌았다. 갈래가 반대다 */
    theirs.cardDue = {};
    for (const k in mine.cardDue) {
      theirs.cardDue[k] = { a: null,
        b: { box: 2, due: addDays(today(), 7), ran: today(), hist: [today()] } };
    }
    const r = mergePlan(mine, theirs);
    const one = r.out.cardDue["Q1-001"];
    return { ask: r.ask.length, a: one.a, b: one.b };
  });
  /* **날짜라 이을 수 있다.** 묻는 것이 안 는다 (T340) */
  if (merged.ask) no("카드 갈래를 합치는데 " + merged.ask + "개를 묻는다");
  if (!merged.a || merged.a.box !== 1)
    no("합쳤더니 이쪽 갈래가 바뀐다: " + JSON.stringify(merged.a));
  if (!merged.b || merged.b.box !== 2)
    no("합쳤더니 저쪽 갈래가 안 왔다: " + JSON.stringify(merged.b));

  /* ---- 3. 막힌 것이 쌓여도 간격이 안 바뀐다 ------------------------------ */
  const stuck = await page.evaluate(() => {
    const before = JSON.parse(JSON.stringify(cardOne("Q1-001")));
    /* 1년 동안 한 카드가 스무 번 막혔다고 친다 */
    for (let i = 0; i < 20; i++) markCardStuck("Q1-001");
    const after = cardOne("Q1-001");
    return { before: before, after: after,
             list: stuckCards().length, first: stuckCards()[0] };
  });
  if (stuck.after.box !== stuck.before.box || stuck.after.due !== stuck.before.due)
    no("스무 번 막혔더니 간격이 바뀐다: " +
       JSON.stringify(stuck.before) + " -> " + JSON.stringify(stuck.after));
  if (stuck.after.stuck !== 20) no("막힌 수가 " + stuck.after.stuck + "이다");
  if (stuck.first !== "Q1-001")
    no("제일 많이 막힌 것이 앞에 안 온다: " + stuck.first);

  /* ---- 4. 트랙 진도는 안 갈린다 ------------------------------------------ */
  const trk = await page.evaluate(async () => {
    if (!DATA.track) await new Promise((ok) => loadData("track", "ENG2P_TRACK", ok));
    return { per: DATA.track.perPerson, left: DATA.track.showsLeft };
  });
  if (trk.per !== false) no("트랙 진도가 사람별이라고 적혀 있다");
  if (trk.left !== false) no("트랙 진도가 남은 것을 보인다고 적혀 있다");

  /* ---- 5. 화면 어디에도 두 사람 수가 나란히 안 뜬다 ---------------------- */
  const tabs = ["today", "review", "ledger", "quarter", "play"];
  for (const t of tabs) {
    const txt = await page.evaluate(async (x) => {
      go(x);
      await new Promise((ok) => setTimeout(ok, 500));
      return document.body.innerText;
    }, t);
    txt.split("\n").forEach((line) => {
      const s = line.trim();
      if (s.indexOf("가람이") < 0 || s.indexOf("나래는") < 0) return;
      if (!/\d/.test(s)) return;
      /* 역할 표시는 값이 아니다. `A 가람이 B 나래는` 꼴이다 */
      if (/A .*B /.test(s) || /짝수 날|홀수 날/.test(s)) return;
      no(t + " 탭: 두 사람 이름과 숫자가 한 줄에 있다: " + s.slice(0, 50));
    });
  }

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 갈린 것을 두 사람이 어떻게 느끼는가**");
  console.log("적응 %d판 (갈림 3, 합치기 3, 막힘 3, 트랙 2, 나란히 %d) / 실패 %d",
              11 + tabs.length, tabs.length, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
