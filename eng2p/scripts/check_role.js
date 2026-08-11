/* 역할 교대가 1년 내내 도는가. T346
 *
 * 기준서 2.4 대응 1이 역할 교대다. 4장이 규칙을 정한다.
 *
 *     A와 B는 매일 교대한다. 짝수 날 남편 = A, 홀수 날 아내 = A.
 *
 * **두 문장이 서로 안 맞는다.** T124 에 그것을 찾아 개정문 11번으로 적어 뒀다.
 * 그때 센 값이 "365일 중 이레" 였다. 31일로 끝나는 달의 다음 1일이다.
 *
 * ## 그 값이 작았다
 *
 * T124 는 **달력 날을 이어 세었다.** 세션은 일요일을 건너뛴다.
 * 토요일 다음 세션은 월요일이고 날짜가 둘 뛴다. **둘 뛰면 짝홀이 그대로다.**
 *
 * 그래서 달이 안 바뀌는 주는 토요일과 월요일의 A가 같은 사람이다.
 * 48주 중 마흔다섯 주가 그렇다. 이레가 아니라 마흔여덟이다.
 *
 * 이 검사가 그 값을 박아 둔다. **고치지 않는다.** 기준서가 날짜 규칙을 명시했고
 * 기준서는 사용자만 고친다. 개정문 11번이 붙으면 그때 이 값이 0이 된다.
 *
 * 사용법:
 *     node scripts/check_role.js
 *
 * 규격: docs/gap.md 5장, docs/spec_amendments.md 11번
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

/* 잰 값과 그 윗선. **날마다 달라지는 값이 아니라 붙박이 시작일에서 잰 값이다.**
   시작일을 1년치로 바꿔 가며 최악을 따로 셌고 그 값이 아래 윗선이다. */
const START = "2026-01-01";
const SAME_MAX = 55;    // 잇달아 같은 자리. 최악이 51 이고 여유를 뒀다
const GAP_MAX = 14;     // 한 사람에게 몰리는 정도. 최악이 10 이다

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
  const rule = await page.evaluate(() => ({
    even: roleOf("2026-01-02"), odd: roleOf("2026-01-03"),
    src: String(roleOf),
  }));
  if (rule.even !== "a") no("짝수 날 A가 " + rule.even + " 다. a 여야 한다");
  if (rule.odd !== "b") no("홀수 날 A가 " + rule.odd + " 다. b 여야 한다");
  /* **협의로 안 바꾼다.** 저장소를 보면 그 자리가 사람 손을 탄 것이다 */
  if (/S\.|localStorage/.test(rule.src))
    no("역할이 저장소를 본다. 날짜만 봐야 한다. 협의하면 편중된다");

  /* ---- 2. 1년을 돌며 센다. **일요일을 건너뛴다** ------------------------ */
  const year = await page.evaluate((st) => {
    let d = st, n = 0, a = 0, same = 0, prev = null;
    const why = {};
    let prevD = null;
    const DAY = ["일", "월", "화", "수", "목", "금", "토"];
    while (n < 288) {
      if (parseISO(d).getDay() !== 0) {
        n++;
        const r = roleOf(d);
        if (r === "a") a++;
        if (r === prev) {
          same++;
          const k = DAY[parseISO(prevD).getDay()] + DAY[parseISO(d).getDay()];
          why[k] = (why[k] || 0) + 1;
        }
        prev = r; prevD = d;
      }
      d = addDays(d, 1);
    }
    return { a: a, b: 288 - a, same: same, why: why, last: d };
  }, START);

  if (year.a + year.b !== 288) no("288세션이 아니라 " + (year.a + year.b) + " 이다");
  const gap = Math.abs(year.a - year.b);
  if (gap > GAP_MAX)
    no("A 자리가 " + year.a + " 대 " + year.b + " 로 갈렸다. " +
       GAP_MAX + " 를 넘으면 안 된다");
  /* **잇달아 같은 자리인 횟수.** 고치는 것이 아니라 재서 박아 두는 값이다 */
  if (year.same > SAME_MAX)
    no("이틀 잇달아 같은 자리인 날이 " + year.same + "번이다. 잰 값보다 늘었다");
  if (year.same < 30)
    no("이틀 잇달아 같은 자리가 " + year.same + "번이다. 마흔여덟쯤이어야 한다. " +
       "줄었으면 규칙이 바뀐 것이고 그러면 개정문 11번과 이 검사를 같이 고친다");
  /* **까닭이 토요일에서 월요일이다.** 날짜가 둘 뛰면 짝홀이 그대로다 */
  const satMon = year.why["토월"] || 0;
  if (satMon < year.same * 0.7)
    no("잇단 자리의 까닭이 토월이 아니다: " + JSON.stringify(year.why));

  /* ---- 3. 화면이 오늘의 A를 적는가 -------------------------------------- */
  const scr = await page.evaluate(() => {
    go("today"); renderToday();
    return { role: document.getElementById("todayRole").innerText,
             pane: document.getElementById("t-today").innerText };
  });
  if (!/A/.test(scr.role) || !/B/.test(scr.role))
    no("첫 화면에 오늘의 A와 B가 없다: " + scr.role);
  if (scr.role.indexOf("가람") < 0 || scr.role.indexOf("나래") < 0)
    no("역할 칸에 두 사람 이름이 다 없다: " + scr.role);
  /* **협의하면 편중된다.** 화면이 그 말을 적는다 */
  if (!/날짜만 보고 역할을 정한다/.test(scr.pane))
    no("날짜로 정한다는 말이 첫 화면에 없다");
  if (!/협의하면 편중된다/.test(scr.pane)) no("왜 협의를 안 하는지가 없다");
  /* **고르는 단추가 없다** */
  const pick = await page.evaluate(() =>
    document.querySelectorAll("#t-today [data-role],#t-today [data-swap]").length);
  if (pick) no("역할을 고르는 자리가 " + pick + "개 있다. 날짜가 정한다");

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("A 자리 %d 대 %d / 이틀 잇달아 같은 자리 %d번 (토월 %d번) " +
              "/ **고치는 것이 아니라 재서 박아 두는 값이다**",
              year.a, year.b, year.same, satMon);
  console.log("**기계가 안 보는 것: 잇달아 같은 자리일 때 두 사람이 바꾸는가**");
  console.log("역할 교대 13판 (규칙 3, 1년 4, 화면 6) / 실패 %d", fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
