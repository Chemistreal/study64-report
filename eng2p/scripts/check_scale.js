/* 1년치가 쌓인 뒤 (T402).
 *
 * `check_perf.js` 는 **열자마자 읽는 바이트**를 잰다. 그것은 첫날 값이다.
 * `check_year.js` 는 48주를 도는 셈이 맞는지를 잰다. 그것은 값의 옳음이다.
 *
 * **쌓인 뒤에 무거워지는가는 아무도 안 쟀다.**
 * 이 앱은 1년을 쓰는 물건이다. 40주째에 느려지면 그때는 고치기 어렵다.
 * 두 사람은 이미 그 앱으로 마흔 주를 살았다.
 *
 * 재 보니 48주 끝에서도 저장 1밀리초, 오늘 그리기 3.7밀리초, 찾기 3밀리초였다.
 * **문제가 없다.** 그래서 지금 값을 박아 둔다. 나빠지면 그때 잡힌다.
 *
 * ## 시간에 선을 안 건다
 *
 * `check_perf.js` 가 그 이유를 적어 뒀다. 시간은 기계마다 다르다.
 * 여기서 선을 거는 것은 **셈의 규모**다. 기록이 몇 바이트인가,
 * 화면에 칸을 몇 개 만드는가, 찾기가 몇 개를 훑는가.
 * 그 값이 늘면 어느 기계에서든 늘어난다.
 *
 * 시간은 찍기만 하고 선을 안 건다. 무엇이 느린지 볼 때 쓴다.
 *
 * **기계가 안 보는 것: 마흔 주째에 두 사람이 느리다고 느끼는가.**
 *
 * 사용법:
 *     node scripts/check_scale.js
 *
 * 규격: docs/roadmap.md 12.10 / docs/friction.md
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const FRICTION = path.join(ROOT, "eng2p", "docs", "friction.md");

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("쌓인 뒤 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

/* 기준선은 `docs/friction.md` 7장 표에서 읽는다. **여기 안 적는다.**
   두 자리에 적으면 한쪽만 고치는 날이 온다 (T396). */
function baseline() {
  const src = fs.readFileSync(FRICTION, "utf8");
  const out = {};
  const re = /^\| `(year_\w+)` \| (\d+) \| ([^|]+) \|/gm;
  let m;
  while ((m = re.exec(src))) out[m[1]] = { v: +m[2], how: m[3].trim() };
  return out;
}

const fails = [];
let n = 0;

(async () => {
  const BASE = baseline();
  if (!Object.keys(BASE).length) {
    console.log("[실패] docs/friction.md 에서 year_ 기준선을 못 읽었다");
    process.exit(1);
  }

  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(PAGE);
  await page.waitForTimeout(700);
  await page.fill("#obA", "가람");
  await page.fill("#obB", "나래");
  await page.click("#obGo");
  await page.waitForTimeout(500);

  /* 48주를 다 돈 상태를 만든다. **날마다 적은 것도 같이 쌓는다.**
     기록만 쌓고 적은 것을 안 쌓으면 진짜 크기가 안 나온다. */
  const got = await page.evaluate(() => {
    const td = today();
    S.start = addDays(td, -336);
    S.device = "a";
    let k = 0;
    for (let i = 1; k < 288 && i < 600; i++) {
      const d = addDays(td, -i);
      if (parseISO(d).getDay() === 0) continue;
      S.days[d] = { status: "normal", speak: 40, cards: 7, lre: 2,
        unres: [{ t: "Could you say that again?", i: "again 이 안 들렸다",
                  k: "", h: "천천히", w: "되물었다", done: false }],
        coll: [{ e: "I am going to be late.", s: "lle1-19", q: "02:11",
                 k: "", done: false }] };
      k++;
    }
    const t0 = performance.now(); saveNow(); const tSave = performance.now() - t0;
    const t1 = performance.now(); renderToday(); const tToday = performance.now() - t1;
    const raw = localStorage.getItem("eng2p.v1") || "";
    return { days: Object.keys(S.days).length,
             kb: Math.round(raw.length / 1024),
             /* 사본 일곱 벌까지 든 저장소 크기. **이레가 그만큼 든다** */
             withBak: Math.round(raw.length * 8 / 1024),
             nodes: document.getElementById("t-today").querySelectorAll("*").length,
             ms: { save: +tSave.toFixed(1), today: +tToday.toFixed(1) } };
  });

  const led = await page.evaluate(async () => {
    const a = performance.now();
    go("ledger");
    await new Promise((r) => setTimeout(r, 1500));
    return { ms: +(performance.now() - a - 1500).toFixed(1),
             nodes: document.getElementById("t-ledger").querySelectorAll("*").length,
             rows: document.querySelectorAll("#t-ledger tr").length };
  });

  const fnd = await page.evaluate(async () => {
    go("find");
    await new Promise((r) => setTimeout(r, 1500));
    document.getElementById("fdQ").value = "again";
    const a = performance.now();
    renderFind();
    const ms = performance.now() - a;
    /* 우리가 적은 것이 몇 건 걸렸는가. **288일치를 다 훑는다** */
    const head = [...document.querySelectorAll("#fdOut h3")]
      .map((h) => h.innerText.replace(/\s+/g, " "))[0] || "";
    const mm = /(\d+)건/.exec(head);
    return { ms: +ms.toFixed(1), mine: mm ? +mm[1] : -1, head: head,
             nodes: document.getElementById("fdOut").querySelectorAll("*").length };
  });

  /* **기준선 줄이 사라지면 조용히 통과한다** (T402 깸 시험).
     `year_kb` 를 `yr_kb` 로 바꿔 봤더니 그 줄만 안 읽히고 나머지가 다 통과했다.
     읽은 줄만 재기 때문이다. **재려던 것이 표에서 빠진 것을 못 봤다.**
     여기서 재는 이름을 코드에 적어 두고 표와 견준다. */
  const WANT = ["year_days", "year_kb", "year_store_kb",
                "year_today_nodes", "year_ledger_nodes", "year_find_nodes"];
  n += 1;
  {
    const miss = WANT.filter((k) => !(k in BASE));
    const extra = Object.keys(BASE).filter((k) => WANT.indexOf(k) < 0);
    if (miss.length)
      fails.push("기준선 표에 " + miss.join(" ") + " 줄이 없다. docs/friction.md 7장을 본다");
    if (extra.length)
      fails.push("코드가 안 재는 기준선이 표에 있다: " + extra.join(" "));
  }

  const NOW = {
    year_days: got.days,
    year_kb: got.kb,
    year_store_kb: got.withBak,
    year_today_nodes: got.nodes,
    year_ledger_nodes: led.nodes,
    year_find_nodes: fnd.nodes,
  };
  console.log("");
  Object.keys(BASE).forEach((k) => {
    n += 1;
    const b = BASE[k], v = NOW[k];
    if (v === undefined) { fails.push(k + " 를 재는 자리가 없다"); return; }
    const up = b.how.indexOf("늘면") >= 0;
    const bad = up ? v > b.v : v < b.v;
    /* **Node 는 `%-18s` 같은 폭 지정자를 안 쓴다.** 그대로 찍혔다.
       `padEnd` 와 `padStart` 로 맞춘다 */
    console.log("  " + (bad ? "실패" : " OK ") + " " + k.padEnd(18) +
                " 잰 값 " + String(v).padStart(6) +
                " / 기준선 " + String(b.v).padStart(6) +
                (up ? "" : "  (올라가야 한다)"));
    if (bad)
      fails.push(k + ": 기준선 " + b.v + " 인데 " + v + " 다 (" + b.how + ")");
  });
  /* 시간은 선을 안 건다. **기계마다 다르다.** 무엇이 느린지 볼 때만 쓴다 */
  console.log("");
  console.log("  시간 (선을 안 건다): 저장 " + got.ms.save + "ms / 오늘 " +
              got.ms.today + "ms / 대장 " + led.ms + "ms / 찾기 " + fnd.ms + "ms");

  /* **찾기가 천장에 닿으면 그렇게 말하는가** (T402).
     처음에는 "1년치를 다 훑는가" 로 쟀다. 288건이 나오기를 바랐다.
     그런데 찾기는 한 갈래에서 예순까지만 세고 그 위는 "60건 넘음" 이라고 적는다.
     그것이 맞는 설계다. 288건을 다 세어 봐야 화면에는 여섯 줄만 보인다.
     **잘못된 것은 앱이 아니라 그것을 다 훑기로 읽은 내 잣대였다.**
     재야 할 것은 천장에 닿았을 때 조용히 예순 건이라고 안 적는가다. */
  n += 2;
  if (!/넘음/.test(fnd.head))
    fails.push("1년치가 쌓였는데 찾기가 \"" + fnd.head + "\" 라고만 적는다. " +
               "천장에 닿았으면 넘었다고 적어야 한다");
  if (fnd.mine < 60)
    fails.push("우리가 적은 것이 " + fnd.mine + "건이다. 288일이 쌓여 있다");

  /* **저장소 천장에 여유가 있는가.** 흔한 상한이 5MB 다 */
  n += 1;
  if (got.withBak > 2048)
    fails.push("사본까지 " + got.withBak + "KB 다. 흔한 상한 5MB 의 절반을 넘는다");

  await ctx.close();
  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 마흔 주째에 두 사람이 느리다고 느끼는가**");
  console.log("쌓인 뒤 " + n + "판 (기준선 " + Object.keys(BASE).length +
              "줄, 찾기 천장 2, 저장소 여유 1) / 실패 " + fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("[실패] 검사가 도중에 멈췄다: " + e.message);
  process.exit(1);
});
