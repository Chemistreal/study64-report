/* F단계가 만든 자리에 첫 화면에서 닿는가. T342
 *
 * F단계 스물다섯 턴이 되풀이해서 같은 것을 잡았다.
 *
 *     T332  2주짜리 처방이 1년에 네 번 여는 탭에 있었다
 *     T335  열두 달치 예고가 한 번도 안 여는 탭에 있었다
 *     T336  적는 자리는 있었는데 여는 자리가 없었다
 *
 * 셋 다 **만들어 놓은 것에 닿는 길이 없는 것**이다.
 * 만든 것과 닿는 것은 다르다. 안 닿으면 없는 것이다.
 *
 * 이 검사가 F단계 마감이다. 만든 자리 여덟에 **첫 화면에서 몇 번 눌러 닿는지**
 * 세고 그 자리가 정말 그려지는지 본다.
 *
 * ## 몇 번이 윗선인가
 *
 * 두 번이다. 탭 단추 하나에 그 탭 안에서 하나다.
 * 세 번이면 두 사람이 그 자리를 안 연다. 마찰 문서 7장이 정한 결이다.
 *
 * 사용법:
 *     node scripts/check_reach.js
 *
 * 규격: docs/engine.md
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("닿는 길 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

/* 누르는 윗선. **탭 하나에 그 탭 안에서 하나다** */
const MAX_TAP = 2;

/* F단계가 만든 자리 여덟. `docs/engine.md` 2장 표가 원본이다.
 *   id   무엇
 *   tab  어느 탭인가. 빈 것이면 첫 화면이다
 *   sel  그 자리를 가리키는 자리표
 *   want 그 자리에 있어야 하는 말
 */
const SPOTS = [
  { id: "streak", what: "공동 연속일", tab: "", sel: "#todaySlots",
    want: "같이 하고 있다" },
  { id: "quest", what: "이 주 퀘스트", tab: "", sel: "#todaySlots",
    want: "둘이 같이 채운다" },
  { id: "rx", what: "이 주 처방", tab: "", sel: "#todaySlots",
    want: "이 주 처방" },
  { id: "ahead", what: "기준서 12장 구간", tab: "", sel: "#todaySlots",
    want: "구간" },
  { id: "badge", what: "공동 배지", tab: "quarter", sel: "#badgeList",
    want: "아직" },
  { id: "voice", what: "되돌아보기 녹음", tab: "quarter", sel: "#voiceList",
    want: "아직" },
  { id: "rel", what: "분기 관계 점검", tab: "quarter", sel: "#t-quarter",
    want: "따로 적고" },
  { id: "ask", what: "개정 요청 봉투", tab: "ledger", sel: "#askEnv",
    want: "매뉴얼 1항" },
];

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(PAGE);

  const fails = [];
  const no = (m) => fails.push(m);

  /* 자리가 다 뜨는 상태를 세운다. **없는 것을 안 닿는 것으로 세지 않는다.**
     신호도 구간도 봉투도 조건이 맞아야 뜬다. 그 조건을 만들어 놓고 잰다. */
  await page.evaluate(() => {
    S.onboarded = true; S.names.a = "가람"; S.names.b = "나래";
    /* 20주로 간다. 구간 줄이 뜨는 주고 처방도 그 자리다 */
    S.days = {}; let k = 0, c = 0;
    while (c < 19 * 6) {
      const d = addDays(today(), -k);
      if (parseISO(d).getDay() !== 0) {
        S.days[d] = { status: "normal", speak: 70, cards: 70, lre: 9,
                      unres: [], coll: ["a", "b", "c"], one: true };
        c++;
      }
      k++;
    }
    S.start = addDays(today(), -k);
    S.q = { Q1: { pass: {}, relOpen: 1, rxAt: today(), rel: {
      a: { share: "7대 3 넘음", lead: "비슷", fix: "A에서 B로만", ask: "비슷" },
      b: { share: "비슷", lead: "비슷", fix: "A에서 B로만", ask: "비슷" } } } };
    S.wchk = { 25: { cause: "", lre: "", coll: "", first: "", block: "",
                     odd: "", ask: "트랙 비중을 바꾸고 싶다", done: false } };
    S.voice = {};
    saveNow();
  });
  await page.reload();
  await page.waitForTimeout(700);

  /* 탭 단추가 있는가. **탭이 없으면 그 탭 안은 다 안 닿는다.**
     운영 탭 넷은 `운영` 을 펴야 보인다. 그것도 한 번 누르는 것이다.
     처음에 `data-go` 로 찾다가 여섯이 걸렸다. 자리표는 `data-t` 다.
     **앱이 맞았고 검사가 틀렸다.** 열네 번째다. */
  const tabs = await page.evaluate(() =>
    [...document.querySelectorAll("nav button")].map((e) => e.dataset.t));
  ["quarter", "ledger"].forEach((t) => {
    if (tabs.indexOf(t) < 0)
      no("탭 단추 " + t + " 가 없다. 그 탭 안은 다 안 닿는다");
  });
  /* 운영 탭을 펴는 자리가 첫 화면에 있는가 */
  if (!(await page.evaluate(() => !!document.getElementById("navMore"))))
    no("운영 탭을 펴는 자리가 없다");

  for (const s of SPOTS) {
    /* 첫 화면으로 되돌아간다. **재는 자리마다 처음부터 센다** */
    await page.evaluate(() => { go("today"); renderToday(); });
    await page.waitForTimeout(200);
    let taps = 0;
    if (s.tab) {
      const kind = await page.evaluate(
        (t) => (TABS.filter((x) => x[0] === t)[0] || [])[2], s.tab);
      if (!kind) { no(s.what + ": 탭 " + s.tab + " 이 차림표에 없다"); continue; }
      /* 운영 탭은 접혀 있다. **펴는 것도 한 번 누르는 것이다** */
      if (kind === "manage") {
        await page.click("#navMore > summary"); taps++;
        await page.waitForTimeout(150);
      }
      const btn = "nav button[data-t=\"" + s.tab + "\"]";
      const has = await page.evaluate((q) => !!document.querySelector(q), btn);
      if (!has) { no(s.what + ": 탭 단추를 못 찾았다"); continue; }
      await page.click(btn); taps++;
      await page.waitForTimeout(900);
    }
    const got = await page.evaluate((q) => {
      const e = document.querySelector(q);
      if (!e) return null;
      return { hid: e.hidden || e.offsetParent === null, txt: e.innerText };
    }, s.sel);
    if (!got) { no(s.what + ": 자리(" + s.sel + ")가 화면에 없다"); continue; }
    if (got.hid) { no(s.what + ": 자리가 있는데 안 보인다"); continue; }
    if (got.txt.indexOf(s.want) < 0)
      no(s.what + ": 그 자리에 '" + s.want + "' 가 없다: " +
         got.txt.replace(/\s+/g, " ").slice(0, 60));
    if (taps > MAX_TAP)
      no(s.what + ": " + taps + "번 눌러야 닿는다. " + MAX_TAP + "번이 윗선이다");
  }

  /* 나란히 듣기는 적어 둔 것이 둘 이상일 때만 뜬다. **조건을 만들고 잰다** */
  const cmp = await page.evaluate(async () => {
    go("quarter");
    await new Promise((ok) => setTimeout(ok, 900));
    window.prompt = (q, def) => def;
    S.voice = { w01: { file: "eng2p_voice_w01_2026-01-01.webm", at: "2026-01-01" },
                w12: { file: "eng2p_voice_w12_2026-04-01.webm", at: "2026-04-01" } };
    saveNow(); renderVoice();
    const e = document.getElementById("voiceCmp");
    return { hid: e.hidden, txt: e.innerText };
  });
  if (cmp.hid) no("나란히 듣기: 둘을 적었는데 안 뜬다");
  else if (cmp.txt.indexOf("지금 여는 것") < 0)
    no("나란히 듣기: 지금 여는 것이 없다: " + cmp.txt.slice(0, 50));

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 닿는 길이 있어도 두 사람이 가는가**");
  console.log("닿는 길 %d판 (자리 %d곳 x 3, 탭 2, 나란히 듣기 2) / 실패 %d",
              SPOTS.length * 3 + 4, SPOTS.length, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
