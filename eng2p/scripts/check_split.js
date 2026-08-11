/* G단계가 만든 자리에 닿는가. G단계 마감. T362
 *
 * F단계 마감이 `check_reach.js` 였다. 만든 자리 여덟에 **첫 화면에서 눌러 봤다.**
 * G단계가 만든 자리는 그것과 한 가지가 다르다.
 *
 *     F단계 자리는 늘 떠 있다. G단계 자리는 **조건이 맞아야 뜬다.**
 *
 * 어제 못 했을 때만, 기기가 하나일 때만, 열두 주째에만, 카드가 막혔을 때만 뜬다.
 * **조건이 붙은 자리는 안 뜨는 것이 정상처럼 보인다.** 그래서 안 뜨는 것을
 * 아무도 못 알아챈다. T355 가 그 자리였다. 경보가 있었는데 이레째에 떴다.
 *
 * 이 검사는 **조건을 하나씩 만들어 놓고** 그 자리가 뜨는지 본다.
 *
 * ## 재는 것 셋
 *
 *     조건을 만들면 뜨는가    안 뜨면 만들어 놓고 안 닿는 것이다
 *     조건이 없으면 안 뜨는가 0인데 뜨면 그것이 잔소리다 (T181)
 *     몇 번 눌러 닿는가       두 번이 윗선이다 (마찰 7장)
 *
 * 둘째 줄이 이 검사가 `check_reach.js` 와 다른 자리다. 늘 떠 있는 자리는
 * 뜨는 것만 보면 되지만 **조건이 붙은 자리는 안 뜨는 쪽도 봐야 한다.**
 *
 * 사용법:
 *     node scripts/check_split.js
 *
 * 규격: docs/split.md 2장
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("갈린 자리 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

/* 누르는 윗선. `check_reach.js` 와 같은 값이다 */
const MAX_TAP = 2;

/* G단계가 만든 자리 여섯. `docs/split.md` 2장 표가 원본이다.
 *   on   그 자리를 뜨게 하는 조건. 화면 안에서 도는 이름이다
 *   off  그 자리를 안 뜨게 하는 조건. **이쪽도 잰다**
 *   tab  어느 탭인가. 빈 것이면 첫 화면이다
 *   sel  그 자리
 *   want 그 자리에 있어야 하는 말
 */
const SPOTS = [
  { id: "track", what: "트랙 진도", turn: "T343~T344",
    on: "plain", off: null, tab: "ledger", sel: "#trackBox", want: "트랙" },
  { id: "more", what: "못 넘은 조건마다 더 돌 판", turn: "T353",
    on: "plain", off: "passed", tab: "quarter", sel: "#qPass",
    want: "더 돌 자리" },
  { id: "qweek", what: "분기 점검 주", turn: "T351",
    on: "week12", off: "week11", tab: "", sel: "#todaySlots",
    want: "분기 점검 주다" },
  { id: "solo", what: "기기가 하나인 날", turn: "T354",
    on: "plain", off: null, tab: "", sel: "#soloLine",
    want: "오늘 기기가 하나다" },
  { id: "miss", what: "어제 못 했다", turn: "T355",
    on: "missed", off: "didYesterday", tab: "", sel: "#missLine",
    want: "어제 못 했다" },
  /* **비상판은 접혀 있다.** 첫 화면에서 한 번 눌러 편다. 그것도 누르는 것이다.
     처음에 안 펴고 재다가 빈 칸이 나왔다. **앱이 맞았고 검사가 틀렸다.**
     열일곱 번째다. */
  { id: "stuck", what: "막힌 카드가 도는 자리", turn: "T359",
    on: "stuck", off: "plain", tab: "", press: "#emgOpen", sel: "#emgBox",
    want: "막힌 카드" },
];

/* 화면 안에서 도는 조건. **하나씩 세우고 하나씩 잰다** */
async function setup(page, how) {
  await page.evaluate((how) => {
    localStorage.clear();
    load();
    S.onboarded = true; S.names.a = "가람"; S.names.b = "나래";
    S.device = "a"; S.solo = false; S.days = {}; S.cardDue = {};
    /* **접힌 자리는 접힌 채로 시작한다.** 앞 자리에서 편 것이 그대로 남으면
       펴는 데 몇 번 누르는지를 못 잰다 */
    S.emgOpen = false; S.q = {};
    /* 지난 날을 채운다. `n` 세션을 마친 자리로 간다 */
    const fill = (n) => {
      let k = 1, c = 0;
      while (c < n) {
        const d = addDays(today(), -k);
        if (parseISO(d).getDay() !== 0) {
          S.days[d] = { status: "normal", speak: 70, cards: 70, lre: 9,
                        unres: [], coll: [], one: true };
          c++;
        }
        k++;
      }
      S.start = addDays(today(), -k);
    };
    if (how === "week12") fill(11 * 6);
    else if (how === "week11") fill(10 * 6);
    else if (how === "didYesterday") fill(6);
    else if (how === "passed") {
      /* Q1 통과 조건 넷을 다 넘긴 자리. 넘겼으면 더 돌 판이 안 떠야 한다.
         **`hrs` 는 앱이 센다** (T338). 손으로 못 적으니 날로 채운다.
         144시간이면 72 세션이다. */
      fill(80);
      S.q = { Q1: { pass: { red: 99, str: 99, ask: 99 } } };
    } else if (how === "stuck") {
      fill(6);
      S.cardDue = { "Q1-001": { a: { box: 1, due: today(), ran: today(),
                                     hist: [], stuck: 3 }, b: null } };
    } else if (how === "missed") {
      /* 아무 날도 안 채운다. 어제가 빈 날이 된다 */
      S.start = addDays(today(), -30);
    } else fill(6);
    saveNow();
  }, how);
  await page.reload();
  await page.waitForTimeout(800);
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(PAGE);

  const fails = [];
  const no = (m) => fails.push(m);

  /* 그 자리를 읽는다. 탭을 여는 것도 누르는 것으로 센다 */
  async function read(s) {
    let taps = 0;
    /* **재는 자리마다 첫 화면에서 시작한다.** 앞 자리에서 연 탭이 주소에 남고
       그대로 다시 열린다. 그러면 첫 화면 자리를 안 보이는 채로 재게 된다 */
    await page.evaluate(() => { go("today"); renderToday(); });
    await page.waitForTimeout(300);
    if (s.tab) {
      const kind = await page.evaluate(
        (t) => (TABS.filter((x) => x[0] === t)[0] || [])[2], s.tab);
      if (!kind) return { taps: 99, txt: null, why: "탭이 차림표에 없다" };
      if (kind === "manage") {
        await page.click("#navMore > summary"); taps++;
        await page.waitForTimeout(150);
      }
      const btn = "nav button[data-t=\"" + s.tab + "\"]";
      if (!(await page.evaluate((q) => !!document.querySelector(q), btn)))
        return { taps: 99, txt: null, why: "탭 단추를 못 찾았다" };
      await page.click(btn); taps++;
      await page.waitForTimeout(1200);
    }
    /* 접혀 있는 자리는 펴야 보인다. **펴는 것도 한 번 누르는 것이다** */
    if (s.press) {
      if (!(await page.evaluate((q) => !!document.querySelector(q), s.press)))
        return { taps: 99, txt: null, why: "펴는 자리(" + s.press + ")가 없다" };
      await page.click(s.press); taps++;
      await page.waitForTimeout(900);
    }
    const got = await page.evaluate((q) => {
      const e = document.querySelector(q);
      return e ? e.innerText : null;
    }, s.sel);
    return { taps: taps, txt: got, why: got === null ? "자리가 화면에 없다" : "" };
  }

  for (const s of SPOTS) {
    /* ---- 조건을 만들면 뜨는가 ------------------------------------------- */
    await setup(page, s.on);
    const on = await read(s);
    if (on.txt === null) { no(s.what + ": " + on.why); continue; }
    if (on.txt.indexOf(s.want) < 0)
      no(s.what + "(" + s.turn + "): 조건을 만들었는데 '" + s.want +
         "' 가 없다: " + on.txt.replace(/\s+/g, " ").slice(0, 60));
    if (on.taps > MAX_TAP)
      no(s.what + ": " + on.taps + "번 눌러야 닿는다. " + MAX_TAP + "번이 윗선이다");

    /* ---- 조건이 없으면 안 뜨는가 ----------------------------------------
       **0인데 뜨면 그것이 잔소리다** (T181). 뜨는 쪽만 재면 이것을 못 잡는다 */
    if (!s.off) continue;
    await setup(page, s.off);
    const off = await read(s);
    if (off.txt === null) { no(s.what + ": 조건이 없을 때 " + off.why); continue; }
    if (off.txt.indexOf(s.want) >= 0)
      no(s.what + ": 조건이 없는데 '" + s.want + "' 가 뜬다");
  }

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  const offs = SPOTS.filter((s) => s.off).length;
  console.log("");
  console.log("**기계가 안 보는 것: 조건이 맞은 날에 두 사람이 그 줄을 읽는가**");
  console.log("갈린 자리 %d판 (자리 %d곳 x 2, 안 뜨는 쪽 %d, 오류 1) / 실패 %d",
              SPOTS.length * 2 + offs + 1, SPOTS.length, offs, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
