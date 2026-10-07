/* 역할 교대가 1년 내내 도는가. T346, 2026-10-07 에 세션 번호로
 *
 * 기준서 2.4 대응 1이 역할 교대다. 개정문 11번이 붙어 이렇게 정한다.
 *
 *     A와 B는 세션마다 교대한다. 홀수 세션 남편 = A, 짝수 세션 아내 = A.
 *     세션 번호는 진행 대장의 정상 수행 횟수다.
 *
 * ## 전에는 날짜였다
 *
 * 짝수 날 남편 = A 였다. 세션은 일요일을 건너뛰어 토요일 다음이 월요일이고
 * 날짜가 둘 뛰면 짝홀이 그대로다. 1년 288세션에서 **잇달아 같은 자리가 마흔여덟**이었다.
 * 이 검사가 그 값을 박아 두고 "개정문 11번이 붙으면 0이 된다" 고 적어 뒀다.
 *
 * **이제 그 0을 잰다.** 0보다 크면 실패다. 박아 두던 값이 아니라 규칙이다.
 * 쉬는 날만이 아니라 결석과 비상판을 섞은 1년도 돈다. 날짜 규칙이 무너진 곳이 거기다.
 * 결석과 비상판은 세션 번호를 안 올리므로 역할도 안 바뀐다. 그것도 잰다.
 *
 * 사용법:
 *     node scripts/check_role.js
 *
 * 규격: docs/spec.md 2.4, docs/gap.md 5장, docs/spec_amendments.md 11번
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("역할 교대 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

/* 시작일. **날짜가 역할을 안 정하므로 어느 날에서 시작해도 값이 같아야 한다.**
   그래서 둘을 돈다. 앞엣것이 옛 검사가 마흔여덟을 잰 날이다. */
const STARTS = ["2026-01-01", "2026-08-31"];
const SAME_MAX = 0;     // 잇달아 같은 자리. **세션 번호면 0이다**
const GAP_MAX = 0;      // 288세션이 짝수라 144 대 144 다

const ROOTDIR = path.resolve(__dirname, "..");
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
  await page.waitForTimeout(400);

  const fails = [];
  const no = (m) => fails.push(m);

  /* ---- 1. 규칙대로인가. **앱의 함수를 부른다** ------------------------- */
  const rule = await page.evaluate(() => {
    const keep = S.days; S.days = {};
    const r = {};
    r.first = roleOf("2026-03-02");                 // 기록이 없으면 1번 세션이다
    day("2026-03-02").status = "normal";
    r.sameDay = roleOf("2026-03-02");               // 그날 끝나도 그날 자리는 그대로다
    r.second = roleOf("2026-03-03");                // 2번 세션
    day("2026-03-03").status = "absent";
    r.afterAbsent = roleOf("2026-03-04");           // 결석은 안 센다
    day("2026-03-04").status = "emg";
    r.afterEmg = roleOf("2026-03-05");              // 비상판도 안 센다
    day("2026-03-05").status = "normal";
    r.third = roleOf("2026-03-07");                 // 이틀 쉬어도 3번 세션이다
    r.no3 = sessionNoOn("2026-03-07");
    /* 기기 쪽도 같이 돈다. **사람은 그대로고 자리가 세션마다 바뀐다** */
    const dev = S.device; S.device = "a";
    S.days = {}; r.side1 = deviceSide();
    day(addDays(today(), -1)).status = "normal"; r.side2 = deviceSide();
    S.device = dev;
    /* 이틀이 다 짝수 날이다. **날짜 규칙이면 같은 사람이다** */
    S.days = {}; day("2026-03-02").status = "normal";
    r.evenEven = [roleOf("2026-03-02"), roleOf("2026-03-04")];
    S.days = keep;
    r.src = String(roleOf) + String(sessionNoOn);
    return r;
  });
  if (rule.first !== "a") no("1번 세션 A가 " + rule.first + " 다. a(남편) 여야 한다");
  if (rule.sameDay !== "a") no("세션을 끝낸 그날 자리가 " + rule.sameDay + " 로 뒤집혔다");
  if (rule.second !== "b") no("2번 세션 A가 " + rule.second + " 다. b(아내) 여야 한다");
  if (rule.afterAbsent !== "b") no("결석 다음 날 자리가 바뀌었다. 결석은 세션 번호를 안 올린다");
  if (rule.afterEmg !== "b") no("비상판 다음 날 자리가 바뀌었다. 비상판은 세션 번호를 안 올린다");
  if (rule.third !== "a" || rule.no3 !== 3)
    no("이틀 쉰 뒤가 3번 세션 a 가 아니다: " + rule.no3 + " " + rule.third);
  if (rule.side1 !== "a" || rule.side2 !== "b")
    no("사람1 기기의 자리가 1번 세션 " + rule.side1 + ", 2번 세션 " + rule.side2 +
       " 다. a 다음 b 여야 한다");
  if (rule.evenEven[0] === rule.evenEven[1])
    no("짝수 날 둘이 같은 자리다. 세션이 하나 지났는데 안 바뀌었다. 날짜 규칙이 남았다");
  /* **협의로 안 바꾼다.** 수행 기록만 읽는다. 고른 값이나 날짜 홀짝을 보면 안 된다 */
  if (/localStorage|getDate\(\)|S\.(?!days\b)[a-z]/.test(rule.src))
    no("역할이 수행 기록 말고 다른 것을 본다. 협의하면 편중된다: " + rule.src.slice(0, 80));

  /* ---- 2. 1년을 돈다. **일요일을 건너뛰고 결석과 비상판을 섞는다** -------- */
  const years = [];
  for (const st of STARTS) for (const holes of [false, true]) {
    years.push(await page.evaluate(([st, holes]) => {
      const keep = S.days; S.days = {};
      let d = st, n = 0, k = 0, a = 0, same = 0, prev = null, skipped = 0;
      while (n < 288) {
        if (parseISO(d).getDay() !== 0) {
          k++;
          /* 구멍. 일곱째 날마다 결석, 열하나째 날마다 비상판. **무작위를 안 쓴다** */
          if (holes && k % 7 === 0) { day(d).status = "absent"; skipped++; }
          else if (holes && k % 11 === 0) { day(d).status = "emg"; skipped++; }
          else {
            n++;
            const r = roleOf(d);
            if (r === "a") a++;
            if (r === prev) same++;
            if (sessionNoOn(d) !== n) same += 1000;   // 번호가 정상 수행 횟수와 갈렸다
            prev = r;
            day(d).status = "normal";
          }
        }
        d = addDays(d, 1);
      }
      S.days = keep;
      return { st: st, holes: holes, a: a, b: 288 - a, same: same, skipped: skipped };
    }, [st, holes]));
  }
  for (const y of years) {
    const tag = y.st + (y.holes ? " 구멍 " + y.skipped + "날" : " 개근");
    if (y.a + y.b !== 288) no(tag + ": 288세션이 아니라 " + (y.a + y.b) + " 이다");
    if (Math.abs(y.a - y.b) > GAP_MAX)
      no(tag + ": A 자리가 " + y.a + " 대 " + y.b + " 로 갈렸다");
    if (y.same >= 1000) no(tag + ": 세션 번호가 정상 수행 횟수와 다르다");
    else if (y.same > SAME_MAX)
      no(tag + ": 잇달아 같은 자리가 " + y.same + "번이다. 세션 번호면 0이다");
  }
  if (years.filter((y) => y.holes && y.skipped > 30).length < STARTS.length)
    no("구멍 낸 1년에 쉰 날이 너무 적다. 결석이 잦을 때를 안 잰 것이다");
  const year = years[0];

  /* ---- 3. 화면이 오늘의 A를 적는가 -------------------------------------- */
  const scr = await page.evaluate(() => {
    S.days = {}; go("today"); renderToday();
    return { role: document.getElementById("todayRole").innerText,
             pane: document.getElementById("t-today").innerText };
  });
  if (!/A/.test(scr.role) || !/B/.test(scr.role))
    no("첫 화면에 오늘의 A와 B가 없다: " + scr.role);
  if (scr.role.indexOf("가람") < 0 || scr.role.indexOf("나래") < 0)
    no("역할 칸에 두 사람 이름이 다 없다: " + scr.role);
  /* **협의하면 편중된다.** 화면이 그 말을 적는다.
     낱말이 아니라 뜻을 잰다 (T386 과 같은 자리). 전에는
     "날짜만 보고 역할을 정한다" 한 문장을 그대로 찾아서, 그 말을
     역할 칸 옆으로 옮겨 적자 거짓으로 실패했다. */
  if (!/세션마다/.test(scr.pane) || !/협의하면 편중된다/.test(scr.pane))
    no("역할을 세션마다 바꾼다는 말이 첫 화면에 없다");
  if (/날짜로 자동 교대/.test(scr.pane)) no("첫 화면이 옛 날짜 규칙을 말한다");
  if (!/협의하면 편중된다/.test(scr.pane)) no("왜 협의를 안 하는지가 없다");
  /* **고르는 단추가 없다** */
  const pick = await page.evaluate(() =>
    document.querySelectorAll("#t-today [data-role],#t-today [data-swap]").length);
  if (pick) no("역할을 고르는 자리가 " + pick + "개 있다. 세션 번호가 정한다");

  /* ---- 4. 글이 같은 규칙을 말하는가. **앱만 고치고 강의와 세트를 두고 오면 안 된다** */
  const OLD = /짝수 날|홀수 날|날짜로 정해/;
  const texts = [];
  for (const dir of ["out/lectures", "out/sets"])
    for (const f of fs.readdirSync(path.join(ROOTDIR, dir)))
      if (f.endsWith(".md")) texts.push(path.join(dir, f));
  ["out/manual/eng2p_manual.md", "out/manual/eng2p_ledger.md"].forEach((f) => texts.push(f));
  const stale = texts.filter((f) => OLD.test(fs.readFileSync(path.join(ROOTDIR, f), "utf8")));
  if (stale.length)
    no("옛 날짜 규칙을 든 글이 " + stale.length + "편이다: " + stale.slice(0, 3).join(", "));
  const said = texts.filter((f) => /^(역할은|A와 B는) 세션 번호로 정해(진다|져 있다)\. 홀수 세션은 남편/m.test(fs.readFileSync(path.join(ROOTDIR, f), "utf8")));
  if (said.length < 96 + 48)
    no("세션 번호 규칙을 적은 강의와 세트가 " + said.length + "편이다. 144편이어야 한다");
  const ruleIdx = await page.evaluate(() => (window.ENG2P_INDEX && ENG2P_INDEX.roleRule) || "");
  if (!/홀수 세션/.test(ruleIdx)) no("차림표의 역할 규칙이 세션 번호가 아니다: " + ruleIdx);

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("A 자리 %d 대 %d / 잇달아 같은 자리 %s번 / 1년 %d벌 (구멍 %s날) " +
              "/ **세션 번호라 0이다**",
              year.a, year.b, years.map((y) => y.same).join(" "), years.length,
              years.filter((y) => y.holes).map((y) => y.skipped).join(" "));
  console.log("**기계가 안 보는 것: 두 기기의 정상 수행 횟수가 갈렸을 때 두 사람이 맞추는가**");
  console.log("역할 교대 35판 (규칙 9, 1년 17, 화면 6, 글 3) / 실패 %d", fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
