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

  /* ---- 회복권 (T323). **달에 둘. 미리 선언해야 쓴다** --------------------- */
  const rest = await page.evaluate(() => {
    const out = {};
    /* 앞으로 오는 세션일 n개 */
    function fwd(n) {
      const list = [];
      let k = 1;
      while (list.length < n && k < 60) {
        const d = addDays(today(), k);
        if (parseISO(d).getDay() !== 0) list.push(d);
        k++;
      }
      return list;
    }
    const f = fwd(4);
    out.fwd = f;
    S.rest = {}; S.days = {}; saveNow();
    /* 걸 수 있는가 */
    out.today = restCan(today());
    out.past = restCan(addDays(today(), -1));
    out.sun = (function () {
      let k = 1;
      while (parseISO(addDays(today(), k)).getDay() !== 0) k++;
      return restCan(addDays(today(), k));
    })();
    out.ok = restCan(f[0]);
    /* 달에 둘 */
    restSet(f[0], true); restSet(f[1], true);
    out.left2 = restLeft(f[0]);
    out.third = restCan(f[2]);
    /* 두 번 건 날은 다시 못 건다 */
    out.again = restCan(f[0]);
    /* 걸어 놓고 결국 한 날은 안 쓴 것이다 */
    S.days[f[0]] = { status: "normal", h: 2, speak: 0, cards: 0,
                     lre: 0, unres: [], coll: [] };
    out.leftDone = restLeft(f[0]);
    /* 연속일이 안 끊긴다. **건 날을 건너뛴다** */
    S.days = {}; S.rest = {};
    restSet(f[1], true);
    S.days[f[0]] = { status: "normal", h: 2, speak: 0, cards: 0,
                     lre: 0, unres: [], coll: [] };
    S.days[f[2]] = { status: "normal", h: 2, speak: 0, cards: 0,
                     lre: 0, unres: [], coll: [] };
    out.span = streak(f[2]);
    /* 안 걸었으면 끊긴다. **같은 자리에서 견준다** */
    S.rest = {};
    out.spanNo = streak(f[2]);
    S.rest = {}; S.days = {}; saveNow();
    return out;
  });

  if (!rest.today) no("오늘을 걸 수 있다. 미리 선언이 아니게 된다");
  if (!rest.past) no("지난 날을 걸 수 있다. 못 한 날을 그 자리에서 메우게 된다");
  if (!rest.sun) no("일요일을 걸 수 있다. 원래 쉬는 날이다");
  if (rest.ok) no("앞날을 못 건다: " + rest.ok);
  if (rest.left2 !== 0) no("둘을 걸었는데 " + rest.left2 + "장 남았다고 한다");
  if (!rest.third) no("달에 셋째를 걸 수 있다. 달에 둘이어야 한다");
  if (!rest.again) no("이미 건 날을 다시 걸 수 있다");
  if (rest.leftDone !== 1)
    no("걸어 놓고 그날 세션을 했는데 " + rest.leftDone + "장 남았다고 한다. " +
       "안 쓴 것으로 쳐야 한다");
  if (rest.span !== 2)
    no("건 날을 사이에 두고 이었는데 연속일이 " + rest.span + " 이다");
  /* **안 걸었을 때와 견준다.** 안 그러면 이 판정이 회복권을 안 잰 것일 수도 있다 */
  if (rest.spanNo !== 1)
    no("안 걸었는데도 연속일이 " + rest.spanNo + " 이다. " +
       "이 판정이 회복권을 안 재고 있다");

  /* 화면 */
  await page.evaluate(() => { go("ledger"); });
  await page.waitForTimeout(200);
  const rTxt = await page.$eval("#t-ledger", (e) => e.innerText);
  if (!/오늘보다 뒤에만 건다/.test(rTxt))
    no("회복권 칸이 미리 걸어야 한다는 말을 안 적는다");
  if (!/끊긴 것은 벌이 아니다/.test(rTxt))
    no("갑자기 못 한 날이 벌이 아니라는 말이 없다");
  if (!/2장 남았다/.test(rTxt)) no("남은 장수가 화면에 없다");

  await page.evaluate(() => {
    let k = 1;
    while (parseISO(addDays(today(), k)).getDay() === 0) k++;
    document.getElementById("restDay").value = addDays(today(), k);
  });
  await page.click("#restGo");
  await page.waitForTimeout(200);
  const rTxt2 = await page.$eval("#restList", (e) => e.innerText);
  if (!/앞날/.test(rTxt2)) no("건 날이 목록에 앞날로 안 뜬다");
  if (!/무른다/.test(rTxt2)) no("앞날 것을 무를 자리가 없다");

  /* **첫 화면에도 남은 장수가 뜨는가.** 거는 것은 대장이고 아는 것은 첫 화면이다 */
  await page.evaluate(() => { go("today"); });
  await page.waitForTimeout(200);
  const slotTxt = await page.$eval("#todaySlots", (e) => e.innerText);
  if (!/회복권 1장 남았다/.test(slotTxt))
    no("첫 화면에 남은 회복권이 안 뜬다: " + slotTxt.slice(0, 60));

  /* **지난 것이 걸린 목록도 본다.** 처음에는 앞날 것만 넣고 재서
     "지난 것도 무를 수 있게 한다" 는 깸이 안 잡혔다. 그 자리를 한 번도 안 지났다.
     깸이 안 잡히면 그 깸이 정말 깬 것인지를 먼저 본다 (T317). 여기는 정말 깼는데
     **검사가 그 길을 안 갔다.** 길을 만들어 준다. */
  const gone = await page.evaluate(() => {
    let k = 1;
    while (parseISO(addDays(today(), -k)).getDay() === 0) k++;
    const d = addDays(today(), -k);
    S.rest[d] = 1; saveNow(); renderRest();
    return d;
  });
  await page.waitForTimeout(150);
  const rTxt3 = await page.$eval("#restList", (e) => e.innerHTML);
  if (rTxt3.indexOf('data-rest="' + gone + '"') >= 0)
    no("지난 날 것에 무르는 단추가 있다. 지난 것을 오늘 바꾸는 일이 된다");
  if (!/지난 것은 못 무른다/.test(rTxt3))
    no("지난 것을 왜 못 무르는지를 화면이 안 적는다");
  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 끊긴 날 두 사람이 무엇을 느끼는가**");
  console.log("연속일 36판 (셈 9 + 화면 11 + 회복권 16: 걸기 7, 셈 3, 화면 6) / 실패 %d",
              fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
