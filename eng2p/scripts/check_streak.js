/* 공동 연속일. **날을 세지 사람을 안 센다.** T321
 *
 * `docs/streak.md` 가 규격이다. 세 갈래와 일요일 규칙을 여기서 잰다.
 *
 *     마쳤다     +1 이어진다
 *     비상판     안 끊긴다. 안 는다
 *     안 했다    끊긴다
 *     일요일     안 본다
 *
 * **날짜를 손으로 안 만든다.** 오늘에서 거꾸로 가며 일요일을 건너뛴다.
 * 검사를 돌리는 날이 무슨 요일이든 같은 답이 나와야 한다.
 * 요일에 따라 답이 달라지면 그것은 규칙이 아니라 우연이다.
 *
 * 사용법:
 *     node scripts/check_streak.js
 *
 * 규격: docs/streak.md
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("연속일 검사를 안 돌렸다. 통과가 아니다.");
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
  await page.waitForTimeout(300);

  const fails = [];
  const no = (m) => fails.push(m);

  const got = await page.evaluate(() => {
    const out = {};
    /* 세션일 n개를 오늘에서 거꾸로 뽑는다. **일요일은 세션일이 아니다.** */
    function days(n) {
      const list = [];
      let k = 0;
      while (list.length < n && k < 400) {
        const d = addDays(today(), -k);
        if (parseISO(d).getDay() !== 0) list.push(d);
        k++;
      }
      return list;
    }
    function set(pairs) {
      S.days = {};
      pairs.forEach((p) => {
        S.days[p[0]] = { status: p[1], h: 2, speak: 0, cards: 0,
                         lre: 0, unres: [], coll: [] };
      });
    }
    const d = days(8);
    out.days = d;
    /* 오늘 것까지 넷 */
    set(d.slice(0, 4).map((x) => [x, "normal"]));
    out.four = streak();
    /* 오늘을 아직 안 했다. 어제부터 셋 */
    set(d.slice(1, 4).map((x) => [x, "normal"]));
    out.yesterday = streak();
    /* 가운데가 비었다 */
    set([[d[0], "normal"], [d[2], "normal"], [d[3], "normal"]]);
    out.gap = streak();
    /* 가운데가 비상판. **안 끊기고 안 는다** */
    set([[d[0], "normal"], [d[1], "emg"], [d[2], "normal"], [d[3], "normal"]]);
    out.emg = streak();
    /* 비상판만 */
    set([[d[0], "emg"]]);
    out.emgOnly = streak();
    /* 안 한 날 표시 */
    set([[d[0], "normal"], [d[1], "absent"], [d[2], "normal"]]);
    out.absent = streak();
    /* 빈 기록 */
    set([]);
    out.empty = streak();
    /* 일요일이 사이에 있어도 안 끊긴다. **달력 날이 아니라 세션일이다** */
    set(d.slice(0, 8).map((x) => [x, "normal"]));
    out.eight = streak();
    out.sunSpan = (function () {
      /* 여드레를 뽑는 사이에 일요일이 있었는가 */
      const a = parseISO(d[7]), b = parseISO(d[0]);
      return Math.round((b - a) / 86400000) + 1;
    })();
    /* 사람 칸이 안 생겼는가. **날 안에 누가 했는지가 없어야 한다** */
    set([[d[0], "normal"]]);
    out.keys = Object.keys(S.days[d[0]]);
    return out;
  });

  if (got.four !== 4) no("잇달아 넷인데 " + got.four + " 이 나온다");
  if (got.yesterday !== 3)
    no("오늘을 안 했고 어제부터 셋인데 " + got.yesterday + " 이 나온다");
  if (got.gap !== 1) no("가운데가 비었는데 " + got.gap + " 이 나온다. 끊겨야 한다");
  if (got.emg !== 3)
    no("가운데가 비상판인데 " + got.emg + " 이 나온다. 안 끊기고 안 늘어 셋이어야 한다");
  if (got.emgOnly !== 0)
    no("비상판만 있는데 " + got.emgOnly + " 이 나온다. 비상판은 세션이 아니다");
  if (got.absent !== 1)
    no("안 한 날이 끼었는데 " + got.absent + " 이 나온다. 끊겨야 한다");
  if (got.empty !== 0) no("빈 기록인데 " + got.empty + " 이 나온다");
  if (got.eight !== 8) no("세션일 여드레인데 " + got.eight + " 이 나온다");
  /* **일요일이 사이에 있었는가를 같이 잰다.** 없었으면 위 판정이 아무것도 안 잰 것이다 */
  if (got.sunSpan <= 8)
    no("세션일 여드레가 달력 " + got.sunSpan + "일이다. 일요일이 안 끼었다. " +
       "이 검사가 일요일을 안 재고 있다");
  if (got.keys.indexOf("who") >= 0 || got.keys.indexOf("by") >= 0)
    no("그날 기록에 누가 했는지가 있다: " + got.keys.join(" "));

  /* ---- 화면 (T322). **첫 화면 빈 자리에 들어간다** ------------------------ */
  await page.evaluate(() => {
    S.onboarded = true; S.names.a = "가람"; S.names.b = "나래"; saveNow();
  });
  await page.reload();
  await page.waitForTimeout(400);

  const slot = async (setup) => {
    await page.evaluate(setup);
    await page.waitForTimeout(120);
    return page.$eval("#todaySlots", (e) => ({ txt: e.innerText, hid: e.hidden }));
  };
  const days = (n) => `S.days={}; let k=0,c=0;
    while(c<${n}){ const d=addDays(today(),-k);
      if(parseISO(d).getDay()!==0){ S.days[d]={status:"normal",h:2,speak:0,
        cards:0,lre:0,unres:[],coll:[]}; c++; } k++; }
    saveNow(); renderToday();`;

  const five = await slot(new Function(days(5)));
  if (five.hid) no("연속일 칸이 안 보인다");
  if (!/\b5\b/.test(five.txt)) no("연속일 다섯인데 화면에 5가 없다: " + five.txt.slice(0, 40));
  if (!/같이 하고 있다/.test(five.txt)) no("화면이 둘이 같이 한 것이라고 안 적는다");
  if (!/이 기기가 아는 날로 셌다/.test(five.txt))
    no("이 기기가 아는 날이라는 말이 없다. 두 기기 수가 다르면 앱이 틀린 줄 안다");
  if (!/짝 코드로 합쳐/.test(five.txt))
    no("합치면 같아진다는 말이 없다");
  /* **개인 값이 화면에 없다.** 이름이 뜨면 그것이 곧 순위다 */
  if (five.txt.indexOf("가람") >= 0 || five.txt.indexOf("나래") >= 0)
    no("연속일 칸에 사람 이름이 있다: " + five.txt.slice(0, 60));
  /* **제일 길었던 것을 안 보여 준다.** 지난 것을 오늘과 견주게 만든다 */
  if (/제일 길|최고|기록 갱신|최장/.test(five.txt))
    no("제일 길었던 연속일이 화면에 있다");

  const zero = await slot(new Function(`S.days={}; saveNow(); renderToday();`));
  if (!/오늘부터 시작한다/.test(zero.txt))
    no("0일인데 오늘부터 시작한다는 말이 없다: " + zero.txt.slice(0, 40));
  /* **끊긴 것을 벌로 안 만든다** */
  if (/잃|날아|아깝|끊겼습니다|실패/.test(zero.txt))
    no("0일 화면이 잃었다고 적는다: " + zero.txt.slice(0, 60));

  const emg = await slot(new Function(`S.days={};
    S.days[today()]={status:"emg",h:0,speak:0,cards:0,lre:0,unres:[],coll:[]};
    saveNow(); renderToday();`));
  if (!/비상판은 세션이 아니라 안 센다/.test(emg.txt))
    no("비상판을 쓴 날 화면이 왜 0인지를 안 적는다: " + emg.txt.slice(0, 60));
  if (!/안 끊는다/.test(emg.txt))
    no("비상판이 안 끊는다는 말이 없다");

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 끊긴 날 두 사람이 무엇을 느끼는가**");
  console.log("연속일 20판 (셈 9 + 화면 11: 다섯 7, 0일 2, 비상판 2) / 실패 %d",
              fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
