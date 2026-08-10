/* 공동 배지. **새 이름을 안 짓고 잠그지 않는다.** T329
 *
 * 배지는 통과 조건에 붙는 이름표다. 새 목표가 아니다.
 * 그래서 이 검사가 제일 먼저 보는 것이 **배지가 딴 이름을 안 지었는가** 다.
 *
 * 사용법:
 *     node scripts/check_badge.js
 *
 * 규격: docs/roadmap.md 12.15, app/js/01_const.js 의 PASS
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("배지 검사를 안 돌렸다. 통과가 아니다.");
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
    S.onboarded = true; S.names.a = "가람"; S.names.b = "나래"; S.q = {}; saveNow();
  });
  await page.reload();
  await page.waitForTimeout(400);
  await page.evaluate(() => go("quarter"));
  await page.waitForTimeout(900);

  const fails = [];
  const no = (m) => fails.push(m);

  /* ---- 1. 새 이름을 안 짓는다 ------------------------------------------- */
  const spec = await page.evaluate(() => {
    const d = DATA.badge;
    const out = { count: d.count, locks: d.locks, per: d.perPerson,
                  made: [], missing: [], all: [] };
    [1, 2, 3, 4].forEach((q) => {
      const names = (PASS[q] || []).map((c) => c.l);
      const mine = d.badges.filter((b) => b.quarter === q && b.kind === "one");
      mine.forEach((b) => {
        if (names.indexOf(b.name) < 0) out.made.push(b.id + ": " + b.name);
        const c = (PASS[q] || []).filter((x) => x.k === b.key)[0];
        if (!c) out.missing.push(b.id);
        else if (c.need !== b.need)
          out.made.push(b.id + " 의 숫자가 " + b.need + " 인데 조건은 " + c.need);
      });
      if (mine.length !== names.length)
        out.missing.push("Q" + q + " 조건 " + names.length + " 배지 " + mine.length);
      out.all.push(d.badges.filter((b) => b.quarter === q && b.kind === "all").length);
    });
    return out;
  });
  if (spec.count !== 20) no("배지가 " + spec.count + "개다. 스물이어야 한다");
  if (spec.made.length)
    no("배지가 통과 조건에 없는 이름이나 숫자를 지었다: " + spec.made.slice(0, 3).join(" / "));
  if (spec.missing.length)
    no("통과 조건에 배지가 안 붙었다: " + spec.missing.slice(0, 3).join(" / "));
  if (spec.all.join() !== "1,1,1,1")
    no("분기 배지가 분기마다 하나가 아니다: " + spec.all.join(" "));
  /* **공동이고 안 잠근다** */
  if (spec.locks !== false) no("배지가 잠근다고 적혀 있다");
  if (spec.per !== false) no("배지가 사람별이라고 적혀 있다");

  /* ---- 2. 아무것도 안 쟀을 때 ------------------------------------------- */
  const t0 = await page.evaluate(() => ({
    cnt: document.getElementById("badgeCount").textContent,
    txt: document.getElementById("badgeList").innerText,
  }));
  if (!/^0 \/ 20/.test(t0.cnt)) no("안 쟀는데 지난 배지가 있다: " + t0.cnt);
  if (!/미측정/.test(t0.txt)) no("안 잰 조건을 미측정이라고 안 적는다");
  /* **안 지난 것도 보여 준다.** 지난 것만 보이면 남은 것이 몇인지 모른다 */
  if (!/아직/.test(t0.txt)) no("안 지난 배지가 화면에 없다");
  /* **얼마가 모자란지를 안 적는다.** 남은 것을 적으면 빚이 되고 빚은 벌이다 */
  if (/남았|모자|더 해야/.test(t0.txt))
    no("배지 칸이 모자란 것을 적는다: " + t0.txt.slice(0, 60));
  /* **사람 이름이 없다** */
  if (t0.txt.indexOf("가람") >= 0 || t0.txt.indexOf("나래") >= 0)
    no("배지 칸에 사람 이름이 있다");

  /* ---- 3. 넷을 다 지나면 분기 배지가 붙는다 ------------------------------ */
  /* **누적 시간은 앱이 센다** (T338). 손으로 치던 값이라 여기서도 치고 있었다.
     그 칸이 없어졌으므로 검사도 날을 넣어서 시간을 만든다.
     검사가 그 길을 지나야 그 길을 잰다 (T334). */
  /* 정규 세션 하루가 2시간이다 (`hoursOf`). Q1 이 144h 라 일흔두 날이 그 선이다.
     날 수로 만든다. **손으로 시간을 못 친다.** */
  const t1 = await page.evaluate(() => {
    S.days = {}; let k = 0, c = 0;
    while (c < 80) {                       // 80일 x 2h = 160h. 144 를 넘는다
      const d = addDays(today(), -k);
      if (parseISO(d).getDay() !== 0) {
        S.days[d] = { status: "normal", speak: 0, cards: 0,
                      lre: 0, unres: [], coll: [] };
        c++;
      }
      k++;
    }
    S.q = { Q1: { pass: { red: 19, str: 9, ask: 3 }, rel: { a: {}, b: {} } } };
    saveNow(); renderBadge();
    return { cnt: document.getElementById("badgeCount").textContent,
             txt: document.getElementById("badgeList").innerText };
  });
  if (!/^5 \/ 20/.test(t1.cnt))
    no("Q1 넷을 다 지났는데 " + t1.cnt + " 다. 조건 넷과 분기 하나라 다섯이어야 한다");
  if (t1.txt.indexOf("Q1 통과 조건 넷을 다 지났다") < 0)
    no("분기 배지 이름이 화면에 없다");

  /* **셋만 지나면 분기 배지가 안 붙는다** */
  const t2 = await page.evaluate(() => {
    S.days = {}; let k = 0, c = 0;
    while (c < 60) {                       // 60일 x 2h = 120h. 144 에 못 미친다
      const d = addDays(today(), -k);
      if (parseISO(d).getDay() !== 0) {
        S.days[d] = { status: "normal", speak: 0, cards: 0,
                      lre: 0, unres: [], coll: [] };
        c++;
      }
      k++;
    }
    S.q = { Q1: { pass: { red: 19, str: 9, ask: 3 }, rel: { a: {}, b: {} } } };
    saveNow(); renderBadge();
    return document.getElementById("badgeCount").textContent;
  });
  if (!/^3 \/ 20/.test(t2))
    no("Q1 셋만 지났는데 " + t2 + " 다. 분기 배지가 붙으면 안 된다");

  /* ---- 4. 잠그지 않는다. **분기 이동이 배지를 안 본다** ------------------ */
  const lock = await page.evaluate(() => {
    const s = (typeof plan === "function") ? String(plan) : "";
    const q = (typeof renderQuarter === "function") ? String(renderQuarter) : "";
    return { plan: /badge|BADGE/i.test(s), quarter: /DATA\.badge/.test(q) };
  });
  if (lock.plan) no("배정이 배지를 본다. 배지가 여는 열쇠가 되면 안 된다");
  if (lock.quarter) no("분기 통과 판정이 배지를 본다. 배지는 붙는 것이지 정하는 것이 아니다");

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 배지가 붙었을 때 두 사람이 무엇을 느끼는가**");
  console.log("배지 16판 (이름 6, 안 잰 자리 5, 지난 자리 3, 잠금 2) / 실패 %d",
              fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
