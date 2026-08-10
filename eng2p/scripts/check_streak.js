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
  /* ---- 공동 퀘스트가 세는 값 (T324). **주는 세션 주다** ------------------- */
  const q = await page.evaluate(() => {
    const out = {};
    /* 세션일 열넷을 오늘에서 거꾸로 뽑아 **오래된 것부터** 채운다.
       열넷이면 첫 주 여섯과 둘째 주 여섯과 셋째 주 둘이다. */
    const list = [];
    let k = 0;
    while (list.length < 14 && k < 400) {
      const d = addDays(today(), -k);
      if (parseISO(d).getDay() !== 0) list.push(d);
      k++;
    }
    list.reverse();
    S.days = {}; S.rest = {};
    list.forEach((d, i) => {
      /* **채집은 날마다 장수를 다르게 둔다.** 처음에는 날마다 한 장씩 뒀는데
         그러면 장수와 날 수가 같아서 "장수가 아니라 날로 센다" 는 깸이 안 잡혔다.
         자료가 두 답을 못 가르면 판정도 못 가른다 (T317). */
      const coll = i === 0 ? [{ t: "x" }, { t: "y" }, { t: "z" }]
                 : i === 1 ? [{ t: "x" }] : [];
      S.days[d] = { status: "normal", h: 2, speak: i + 1, cards: 10,
                    lre: 1, unres: [], coll: coll };
    });
    saveNow();
    out.w1 = weekDays(1).length;
    out.w2 = weekDays(2).length;
    out.w3 = weekDays(3).length;
    out.sess1 = questNow("session", 1);
    out.speak1 = questNow("speak", 1);
    out.cards1 = questNow("cards", 1);
    out.lre1 = questNow("lre", 1);
    out.coll1 = questNow("coll", 1);
    out.speak2 = questNow("speak", 2);
    /* **안 마친 날은 그 주에 안 든다.** 밀리면 다음 주로 간다 */
    const mid = list[2];
    S.days[mid].status = "absent";
    saveNow();
    out.afterMiss1 = weekDays(1).length;
    out.afterMiss3 = weekDays(3).length;
    /* **판 셈은 퀘스트가 안 센다** (`quest.md` 2.1). 종류에 없어야 한다 */
    S.rhit = {}; S.rhit["mirror|" + today()] = { hit: 5 };
    out.rhit = questNow("rhit", 1);
    S.days = {}; S.rhit = {}; saveNow();
    return out;
  });

  if (q.w1 !== 6 || q.w2 !== 6 || q.w3 !== 2)
    no("세션 주가 엿새씩 안 갈린다: " + q.w1 + " " + q.w2 + " " + q.w3);
  if (q.sess1 !== 6) no("첫 주 세션이 " + q.sess1 + " 이다");
  if (q.speak1 !== 21) no("첫 주 발화 분 합이 " + q.speak1 + " 이다. 1+2+..+6 이라 21이다");
  if (q.speak2 !== 57) no("둘째 주 발화 분 합이 " + q.speak2 + " 이다. 7+8+..+12 라 57이다");
  if (q.cards1 !== 60) no("첫 주 카드가 " + q.cards1 + " 이다");
  if (q.lre1 !== 6) no("첫 주 LRE 가 " + q.lre1 + " 이다");
  if (q.coll1 !== 4)
    no("첫 주 채집이 " + q.coll1 + " 이다. 세 장과 한 장이라 넉 장이다");
  /* **밀림은 주를 줄이지 않고 뒤를 당긴다.**

     처음에는 첫 주가 다섯이 되는 줄 알고 그렇게 적었다. 아니었다.
     한 날을 안 하면 그 뒤의 날이 앞으로 당겨져 첫 주는 그대로 엿새고
     **맨 뒤가 하나 줄어든다.** `plan()` 이 처음부터 그렇게 센다.

         빠진 것은 지워지는 것이 아니라 미뤄지는 것이다.

     이 검사가 처음 낸 실패였고 **검사가 틀렸다.** 열 번째다. */
  if (q.afterMiss1 !== 6)
    no("한 날을 안 했는데 첫 주가 " + q.afterMiss1 + "일이다. 뒤가 당겨져 엿새여야 한다");
  if (q.afterMiss3 !== 1)
    no("밀린 만큼 맨 뒤가 안 줄었다: 셋째 주가 " + q.afterMiss3 + "일");
  /* **판 셈은 안 센다.** 안 건너가는 값이라 공동 목표가 못 된다 */
  if (q.rhit !== 0)
    no("판 셈을 퀘스트가 센다: " + q.rhit + ". 짝 코드로 안 건너가는 값이다");

  /* ---- 퀘스트 화면 (T325). **개인 기여도를 안 보여 준다** ----------------- */
  const fill = (n) => new Function(`S.days={}; let k=0,c=0;
    while(c<${n}){ const d=addDays(today(),-k);
      if(parseISO(d).getDay()!==0){ S.days[d]={status:"normal",h:2,speak:12,
        cards:60,lre:1,unres:[],coll:[],one:(c%2)}; c++; } k++; }
    saveNow(); renderToday();`);

  await page.evaluate(() => {
    S.onboarded = true; S.names.a = "가람"; S.names.b = "나래"; saveNow();
  });
  await page.reload();
  await page.waitForTimeout(500);

  /* **표를 읽어서 잰다.** 처음에는 "이 주 여섯 날을 다 채운다" 를 붙박이로 적었다.
     T326~T328 이 표를 마흔여덟 주로 채우자 그 줄이 통째로 틀렸다.
     **자료가 바뀌면 같이 바뀌어야 하는 판정을 손으로 적으면 안 된다** (T279 의 결). */
  const look = async (n) => {
    await page.evaluate(fill(n));
    await page.waitForTimeout(400);
    const txt = await page.$eval("#todaySlots", (e) => e.innerText);
    const got = await page.evaluate(() => {
      const w = plan().week;
      let q = null;
      DATA.quest.weeks.forEach((x) => { if (x.week === w) q = x; });
      return { w: w, q: q, now: q ? questNow(q.kind, w) : null };
    });
    return { txt: txt, w: got.w, q: got.q, now: got.now };
  };

  const a1 = await look(3);
  if (!a1.q) no(a1.w + "주가 퀘스트 표에 없다");
  else {
    if (a1.txt.indexOf(a1.q.name) < 0)
      no(a1.w + "주 퀘스트 이름이 화면에 없다: " + a1.q.name);
    if (a1.txt.indexOf(a1.now + " / " + a1.q.goal) < 0)
      no(a1.w + "주 퀘스트가 " + a1.now + " / " + a1.q.goal + " 로 안 뜬다: " +
         a1.txt.slice(-60));
  }
  /* **안 찼을 때 채웠다고 안 적는가.** 채운 뒤만 보면 이 가지를 안 지난다 (T323).
     세 날을 마친 자리라 어느 주 어느 갈래든 아직 안 찼다. 거기서 잰다. */
  if (a1.q && a1.now < a1.q.goal && /채웠다/.test(a1.txt))
    no("아직 " + a1.now + " / " + a1.q.goal + " 인데 채웠다고 적는다");
  if (a1.q && a1.now >= a1.q.goal)
    no("세 날을 마쳤는데 벌써 채워졌다. 이 판정이 안 찬 자리를 못 잰다");
  if (!/둘이 같이 채운다/.test(a1.txt)) no("둘이 같이 채운다는 말이 없다");
  if (!/누가 얼마인지는 안 센다/.test(a1.txt)) no("개인 기여도를 안 센다는 말이 없다");
  /* **이름이 뜨면 그것이 곧 순위다** */
  if (a1.txt.indexOf("가람") >= 0 || a1.txt.indexOf("나래") >= 0)
    no("퀘스트 줄에 사람 이름이 있다");
  /* **남은 것을 안 적는다.** 남은 것을 적으면 빚이 되고 빚은 벌이다 */
  if (/남았|더 해야|서둘/.test(a1.txt.split("이 주")[1] || ""))
    no("퀘스트 줄이 남은 것을 재촉한다: " + a1.txt.slice(-70));

  const a2 = await look(9);
  if (a2.w === a1.w) no("세션을 아홉 마쳤는데 주가 안 넘어갔다");
  else if (a2.q && a2.txt.indexOf(a2.q.name) < 0)
    no("주가 넘어갔는데 퀘스트가 안 바뀐다: " + a2.txt.slice(-70));

  /* **채웠으면 채웠다고 적는다.**

     그 주 퀘스트를 실제로 채워 놓고 본다. 갈래마다 채우는 길이 다르므로
     표에서 갈래를 읽어 그 갈래를 채운다. **어느 주에 무엇이 오는지를 안 박는다.** */
  const done = await page.evaluate(() => {
    const w = plan().week;
    let q = null;
    DATA.quest.weeks.forEach((x) => { if (x.week === w) q = x; });
    if (!q) return null;
    const ds = weekDays(w);
    if (!ds.length) return null;
    const each = Math.ceil(q.goal / ds.length);
    ds.forEach((d) => {
      const r = S.days[d];
      if (q.kind === "speak") r.speak = each;
      else if (q.kind === "cards") r.cards = each;
      else if (q.kind === "lre") r.lre = each;
      else if (q.kind === "one") r.one = 1;
      else if (q.kind === "coll") {
        r.coll = [];
        for (let i = 0; i < each; i++) r.coll.push({ t: "x" + i });
      }
    });
    saveNow(); renderToday();
    return { kind: q.kind, goal: q.goal, now: questNow(q.kind, w) };
  });
  await page.waitForTimeout(300);
  if (!done) no("채우기를 못 했다. 그 주가 표에 없다");
  else {
    const q3 = await page.$eval("#todaySlots", (e) => e.innerText);
    if (done.now < done.goal) {
      /* 세션 갈래처럼 날 수로 막히는 것은 다 못 채운다. 그때는 그것을 적는다 */
      if (/채웠다/.test(q3))
        no("아직 안 찼는데 채웠다고 적는다: " + done.now + " / " + done.goal);
    } else if (!/채웠다/.test(q3)) {
      no("채웠는데 채웠다고 안 적는다: " + done.now + " / " + done.goal +
         " · " + q3.slice(-60));
    }
  }
  /* **윗선이 다섯인가.** 채운 것을 못 보여 주는 목표를 막는다 */
  const cap = await page.evaluate(() => DATA.quest.kinds);
  if (cap.session !== 5 || cap.one !== 5)
    no("세션 갈래 윗선이 " + cap.session + " 이다. 다섯이어야 한다. " +
       "여섯이면 채운 것을 그 주 화면에서 못 본다");

  /* 표에 없는 주. **없다고 보여 준다** */
  const far = await page.evaluate(() => {
    const d = DATA.quest;
    return { count: d.count, kinds: Object.keys(d.kinds).sort() };
  });
  if (far.count < 5) no("퀘스트 표가 " + far.count + "주다");
  if (far.kinds.indexOf("one") < 0)
    no("갈래에 오늘의 한 판이 없다. 판을 세는 길이 필요하다");

  /* **오늘의 한 판을 열면 날 기록에 적히는가** (T325). `rhit` 가 아니다 */
  const one = await page.evaluate(() => {
    S.days = {}; S.rhit = {}; saveNow();
    const r = day(today());
    const before = r.one || 0;
    r.one = 1; saveNow();
    return { before: before, after: (day(today()).one || 0),
             inMax: (typeof MG_MAXDAY !== "undefined") &&
                    MG_MAXDAY.indexOf("one") >= 0 };
  });
  if (one.before !== 0 || one.after !== 1) no("날 기록에 오늘의 한 판 자리가 없다");
  if (!one.inMax)
    no("합칠 때 오늘의 한 판이 안 건너간다. 한쪽만 눌러도 연 날이어야 한다");

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 끊긴 날 두 사람이 무엇을 느끼는가**");
  console.log("연속일과 퀘스트 61판 (연속일 20, 회복권 16, 퀘스트 셈 11, 화면 14) / 실패 %d",
              fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
