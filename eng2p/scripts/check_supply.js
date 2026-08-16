/* 자루가 도는 속도 (T403).
 *
 * `check_perf.js` 는 열자마자 읽는 바이트를 잰다.
 * `check_scale.js` 는 1년이 쌓인 뒤의 크기를 잰다.
 * 둘 다 화면 이야기다. **자료가 어떻게 도는가는 아무도 안 쟀다.**
 *
 * 판 스물은 자루에서 그날 낼 것을 뽑는다. 자루가 넉넉해도 뽑는 법이 나쁘면
 * **어제 낸 것이 오늘 또 나온다.** 두 사람에게는 자료가 모자란 것과 똑같이 보인다.
 * `play_data.md` 6장이 실제로 그렇게 읽었다. 자료를 늘리라고 적었는데
 * 자료는 있었고 뽑는 법이 그 자료를 안 썼다.
 *
 * ## 자루가 작아서 겹치는 것은 안 센다
 *
 * 이 판의 잣대가 여기 있다. 쌍이 열다섯인데 여덟을 내면 겹치는 것이 당연하다.
 * **그것은 뽑는 법으로 못 고친다.** 그래서 그날 자루가
 * 어제 낸 것과 오늘 낼 것을 합친 것보다 컸을 때만 센다.
 *
 * 처음에 그 조건 없이 쟀다가 이어달리기가 93.7% 로 나왔다.
 * 그 판은 **그 과 청크를 다 낸다.** 겹친 것은 같은 과를 이틀 한 날이고
 * 그것은 커리큘럼이지 뽑기가 아니다. **잣대가 틀렸던 것이다.**
 *
 * ## 시간에 선을 안 건다
 *
 * 여기서 재는 것은 시간이 아니라 셈의 결과다. 어느 기계에서 돌려도 같다.
 * `roundPick` 이 시작일과 오늘과 자루 크기에서만 셈하기 때문이다.
 * 그래서 이 값은 기계와 상관없이 같고 선을 걸 수 있다.
 *
 * **기계가 안 보는 것: 두 사람이 "어제 이거 했잖아" 라고 말하는가.**
 *
 * 사용법:
 *     node scripts/check_supply.js
 *
 * 규격: docs/friction.md 9장 / docs/play_data.md 6장
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const FRICTION = path.join(ROOT, "eng2p", "docs", "friction.md");

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("자루 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

/* 판마다 [그날 덱을 내는 식, 그날 자루 크기를 내는 식].
   **자루 식이 있어야 한다.** 없으면 자루가 작아서 겹친 것을 못 가른다. */
const PLAYS = {
  chain: ["chnPool()",
          "(DATA.chunks&&chnToday()&&(DATA.chunks.items[chnToday()]||[]).length)||0"],
  rebound: ["rbdPool()",
            "(DATA.chunks&&rbdToday()&&(DATA.chunks.items[rbdToday()]||[]).length)||0"],
  hearme: ["hrmItems()",
           "(DATA.listen&&hrmToday()&&(DATA.listen.items[hrmToday()]||[]).length)||0"],
  relay: ["rlyItems()",
          "(DATA.relay&&rlyToday()&&(DATA.relay.items[rlyToday()]||[]).length)||0"],
  swapline: ["swpItems()", "((swpRows()||[]).length)"],
  twohalf: ["twhItems()",
            "(DATA.halves&&twhToday()&&(DATA.halves.items[twhToday()]||[]).length)||0"],
  reask: ["rskLines()",
          "((DATA.transcripts&&rskToday()&&(DATA.transcripts.items[rskToday()]||[]))||[])" +
          ".map(function(x){return String(x).replace(/^[A-Z][A-Za-z .'-]{0,20}:\\s*/,'');})" +
          ".filter(function(x){return x.split(/\\s+/).length>=4;}).length"],
  mirror: ["mirItems(MIR.n)", "((mirPool()||[]).length)"],
  flip: ["flpDeck()", "((flpPool()||[]).length)"],
  whose: ["whoDeck()", "((whoPool()||[]).length)"],
  wall: ["walDeck()", "((walPool()||[]).length)"],
  onesee: ["oneDeck()", "((oneDeck()||[]).length)"],
};
const DATA_KEYS = ["chunks", "halves", "listen", "pairs", "reask", "relay",
                   "situ", "swaps", "transcripts", "wall", "whose", "flip"];
const DAYS = 300;

/* 기준선은 `docs/friction.md` 9장 표에서 읽는다. **여기 안 적는다.**
   두 자리에 적으면 한쪽만 고치는 날이 온다 (T396). */
function baseline() {
  const src = fs.readFileSync(FRICTION, "utf8");
  const out = {};
  const re = /^\| `(supply_\w+)` \| (\d+) \| ([^|]+) \| ([^|]+) \|/gm;
  let m;
  while ((m = re.exec(src))) out[m[1]] = { v: +m[2], how: m[3].trim(), what: m[4].trim() };
  return out;
}

const fails = [];
let n = 0;

(async () => {
  const BASE = baseline();
  if (!Object.keys(BASE).length) {
    console.log("[실패] docs/friction.md 9장에서 supply_ 기준선을 못 읽었다");
    process.exit(1);
  }

  /* **표와 코드가 같은 판을 보는가** (T402 가 `check_scale.js` 에서 겪었다).
     기준선 줄이 표에서 빠지면 그 줄만 안 읽히고 나머지가 다 통과한다.
     재려던 것이 사라진 것을 아무도 못 본다. */
  n += 2;
  {
    const want = Object.keys(PLAYS).map((k) => "supply_" + k);
    const miss = want.filter((k) => !(k in BASE));
    const extra = Object.keys(BASE).filter((k) => want.indexOf(k) < 0);
    if (miss.length)
      fails.push("기준선 표에 " + miss.join(" ") + " 줄이 없다. docs/friction.md 9장을 본다");
    if (extra.length)
      fails.push("코드가 안 재는 기준선이 표에 있다: " + extra.join(" "));
  }

  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  let perr = null;
  page.on("pageerror", (e) => { if (!perr) perr = e.message; });
  await page.goto(PAGE);
  await page.waitForTimeout(700);
  await page.fill("#obA", "가람");
  await page.fill("#obB", "나래");
  await page.click("#obGo");
  await page.waitForTimeout(400);

  const got = await page.evaluate(async (args) => {
    const [PLAYS, KEYS, DAYS] = args;
    await new Promise((r) => loadScript("plays", "eng2p/out/app/plays.js", r));
    await new Promise((r) => needAllWeeks(r));
    for (const k of KEYS)
      await new Promise((r) => loadData(k, "ENG2P_" + k.toUpperCase(), () => r()));
    S.start = "2026-08-10"; S.device = "a"; S.days = {};
    /* **1년을 하루씩 걸어간다.** 판을 실제로 열지 않고 덱만 셈한다.
       그리는 데는 시간이 들고 여기서 재는 것은 그림이 아니다. */
    const real = window.today;
    const res = {};
    for (const id in PLAYS) res[id] = { days: [], err: null };
    let d = "2026-08-10";
    for (let i = 0; i < DAYS; i++) {
      window.today = () => d;
      S.rhit = {};                       /* 그날 처음 여는 것으로 친다 */
      for (const id in PLAYS) {
        try {
          const v = eval(PLAYS[id][0]);
          if (v && v.length) {
            let pool = 0;
            try { pool = eval(PLAYS[id][1]) | 0; } catch (e) {}
            res[id].days.push({ pool: pool,
              ids: v.map((x) => x && (x.id || x.no || x.a || x.e || x.t ||
                                      JSON.stringify(x).slice(0, 40))) });
          }
        } catch (e) { if (!res[id].err) res[id].err = String(e).slice(0, 90); }
      }
      S.days[d] = { status: "normal", speak: 40, cards: 7, lre: 2, unres: [], coll: [] };
      d = addDays(d, 1);
      if (parseISO(d).getDay() === 0) d = addDays(d, 1);   /* 일요일은 쉰다 */
    }
    window.today = real;
    return res;
  }, [PLAYS, DATA_KEYS, DAYS]);

  await ctx.close();
  await browser.close();
  n += 1;
  if (perr) fails.push("화면이 오류를 냈다: " + perr);

  /* **여유가 있던 날이 없으면 이 판은 안 잰 것이다.**
     자루가 늘 빠듯한 판은 셀 날이 하나도 없고 그러면 0% 로 통과한다.
     0% 는 좋다는 뜻인데 여기서는 **안 쟀다는 뜻**이다. 둘이 같아 보이면 안 된다.
     `all.py` 가 "뺀 검사는 안 돌린 것이 아니라 통과한 것처럼 보인다" 고 적었다.
     그래서 실패로는 안 내고 **안 쟀다고 적는다.** 자루를 늘릴 자리가 거기다. */
  const THIN = 30;
  const notmeasured = [];

  console.log("");
  Object.keys(BASE).sort().forEach((k) => {
    n += 2;
    const id = k.replace(/^supply_/, "");
    const v = got[id];
    if (!v) { fails.push(k + " 를 재는 자리가 없다"); return; }
    if (v.err) { fails.push(id + " 가 안 돌았다: " + v.err); return; }
    const ds = v.days;
    /* **한 날도 안 돌면 통과가 아니다.** 안 돈 판은 겹칠 일도 없다 */
    if (ds.length < 30) {
      fails.push(id + " 가 " + ds.length + "날만 돌았다. 288일 중 서른도 안 된다");
      return;
    }
    let tot = 0, bad = 0, take = 0, whole = 0;
    for (let i = 1; i < ds.length; i++) {
      const now = ds[i], pre = ds[i - 1];
      take = Math.max(take, now.ids.length);
      /* **자루를 통째로 내는 날인가.** 그런 판은 고를 일이 없다.
         자루가 빠듯한 것과 다르다. 앞엣것은 설계고 뒤엣것은 일감이다 */
      if (now.ids.length >= now.pool) whole += 1;
      /* **자루가 작아서 겹치는 것은 안 센다.** 뽑는 법으로 못 고친다 */
      if (now.pool < now.ids.length + pre.ids.length) continue;
      tot += 1;
      const one = {};
      pre.ids.forEach((x) => { one[x] = 1; });
      if (now.ids.some((x) => one[x])) bad += 1;
    }
    const pct = tot ? Math.round((100 * bad) / tot) : 0;
    const b = BASE[k];
    const over = pct > b.v;
    const thin = tot < THIN;
    if (thin)
      notmeasured.push({ id: id, days: tot,
        why: whole > (ds.length - 1) / 2 ? "자루를 통째로 낸다. 고를 일이 없다"
                                         : "자루가 늘 빠듯하다. 늘릴 자리다" });
    console.log("  " + (over ? "실패" : (thin ? "안 잼" : " OK ")) + " " + k.padEnd(18) +
                " 잰 값 " + String(pct + "%").padStart(5) +
                " / 기준선 " + String(b.v + "%").padStart(5) +
                "  (" + ds.length + "날 한 판 " + take + "장, 여유 있던 날 " + tot + ")");
    if (over)
      fails.push(k + ": 기준선 " + b.v + "% 인데 " + pct + "% 다. " + b.what +
                 " 자루에 여유가 있는데 어제 낸 것을 또 낸다");
  });

  /* **뽑는 법이 자루를 쓰는가.** 위 셈은 겹침만 본다.
     자루를 반도 안 쓰고 도는 판은 겹치지 않아도 자료를 버리는 것이다. */
  n += 1;
  {
    const thin = [];
    Object.keys(PLAYS).forEach((id) => {
      const v = got[id];
      if (!v || !v.days.length) return;
      const seen = {};
      let last = 0;
      v.days.forEach((x) => { x.ids.forEach((c) => { seen[c] = 1; }); last = x.pool; });
      const used = Object.keys(seen).length;
      if (last >= 20 && used < last * 0.9)
        thin.push(id + " 는 자루 " + last + " 중 " + used + "만 냈다");
    });
    if (thin.length) fails.push("1년을 돌고도 안 나온 것이 있다: " + thin.join(" / "));
  }

  fails.forEach((m) => console.log("[실패] " + m));
  if (notmeasured.length) {
    const grow = notmeasured.filter((x) => x.why.indexOf("늘릴") >= 0);
    console.log("");
    console.log("**안 잰 판 " + notmeasured.length + "개.** 자루에 여유가 있던 날이 " +
                THIN + "일도 안 된다. 0% 는 좋다는 뜻이 아니라 잴 날이 없었다는 뜻이다.");
    notmeasured.forEach((x) => {
      console.log("  " + x.id.padEnd(10) + x.days + "날  " + x.why);
    });
    if (grow.length)
      console.log("  늘릴 자루 " + grow.length + "개: " +
                  grow.map((x) => x.id).join(" ") +
                  " (docs/roadmap.md 12.19 T414~T416)");
  }
  console.log("");
  console.log("**기계가 안 보는 것: 두 사람이 \"어제 이거 했잖아\" 라고 말하는가**");
  console.log("자루 " + n + "판 (판 " + Object.keys(PLAYS).length +
              "개 x 2, 표 대조 2, 다 쓰는가 1, 오류 1) / 안 잰 판 " +
              notmeasured.length + " / 실패 " + fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("[실패] 검사가 도중에 멈췄다: " + e.message);
  process.exit(1);
});
