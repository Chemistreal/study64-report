/* 미리 아는 것. **표는 있었는데 그때 안 떴다.** T335
 *
 * `docs/ahead.md` 가 규격이다. 재는 것이 넷이다.
 *
 *     때가 맞는가        곧 온다 / 지금이다 / 지나갔다 / 안 뜬다
 *     겹치면 무엇이 이기나  지금 > 지나갔다 > 곧 온다. 첫 화면은 한 줄이다
 *     묻지 않는가        지루하냐고 묻지 않는다. 물으면 없던 것도 생긴다
 *     겁주지 않는가      문제만 적고 대응을 안 적으면 겁주기다
 *
 * **주를 손으로 안 세운다.** `plan()` 이 마친 세션 수로 주를 세므로
 * 세션을 그만큼 채워서 그 주로 간다. T314 에서 배운 자리다.
 *
 * 사용법:
 *     node scripts/check_ahead.js
 *
 * 규격: docs/ahead.md
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("미리 아는 것 검사를 안 돌렸다. 통과가 아니다.");
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
    S.onboarded = true; S.names.a = "가람"; S.names.b = "나래"; saveNow();
  });
  await page.reload();
  await page.waitForTimeout(400);
  /* 자료를 미리 읽혀 둔다. 늦게 읽는 자료라 첫 판이 빈 줄로 나온다 */
  await page.evaluate(() => new Promise((ok) => loadData("ahead", "ENG2P_AHEAD", ok)));

  const fails = [];
  const no = (m) => fails.push(m);

  /* ---- 1. 자료가 규격대로인가 ------------------------------------------- */
  const d = await page.evaluate(() => ({
    n: DATA.ahead.items.length,
    rng: DATA.ahead.items.map((x) => x.label + ":" + x.from + "-" + x.to).join(" "),
    lead: DATA.ahead.lead, after: DATA.ahead.after,
    asks: DATA.ahead.asks,
    acts: DATA.ahead.items.map((x) => x.act),
    checked: DATA.ahead.checked && DATA.ahead.checked.need,
  }));
  if (d.n !== 3) no("예고한 자리가 " + d.n + "곳이다. 기준서 12장은 셋이다");
  if (d.rng !== "10~14주:10-14 20주 전후:19-21 24~28주:24-28")
    no("주 범위가 " + d.rng + " 다. ahead.md 7장이 읽는 법을 적었다");
  if (d.lead !== 2 || d.after !== 1)
    no("미리 " + d.lead + "주 지나고 " + d.after + "주다. 2와 1이어야 한다");
  /* **묻지 않는다** */
  if (d.asks !== false) no("자료가 묻는다고 적혀 있다");
  /* **대응이 정말 거기 있는지를 다시 셌는가** */
  if (!d.checked || d.checked["화용"] !== 2 || d.checked["repair"] !== 3)
    no("기준서가 적은 화용 2편 repair 3편을 다시 안 셌다: " + JSON.stringify(d.checked));
  /* **가리킬 데가 없는 것도 한 갈래다.** 그것을 빈칸으로 안 둔다 */
  if (d.acts.some((a) => !a || a.length < 5)) no("무엇을 하는지가 빈 자리가 있다");

  /* ---- 2. 때가 맞는가. **주를 세션으로 채워서 간다** --------------------- */
  const at = async (w) => {
    await page.evaluate((n) => {
      S.days = {}; let k = 0, c = 0;
      while (c < n) {
        const dd = addDays(today(), -k);
        if (parseISO(dd).getDay() !== 0) {
          S.days[dd] = { status: "normal", h: 2, speak: 0, cards: 0,
                         lre: 0, unres: [], coll: [] };
          c++;
        }
        k++;
      }
      saveNow(); renderToday();
    }, (w - 1) * 6);
    await page.waitForTimeout(120);
    return page.evaluate(() => ({
      w: plan().week,
      txt: document.getElementById("todaySlots").innerText,
    }));
  };

  /* 주마다 무엇이 떠야 하나. **문서 6장 표가 원본이다.**
     줄 첫머리로 가른다. "지금 적는다" 가 대응 글자에도 있어서
     낱말만 찾으면 딴 상태가 통과한다. **머리를 본다.** */
  const HEAD = { soon: /구간이 곧 온다\./, now: /^지금 .*구간이다\./,
                 past: /구간을 지났다\./ };
  const WANT = [
    [7, ""],                    // 아직 멀다
    [8, "soon"],                // 10~14 두 주 앞
    [9, "soon"],
    [10, "now"],                // 들어섰다
    [14, "now"],                // 마지막 주까지
    [15, "past"],               // 한 주만
    [16, ""],                   // 그 뒤로는 안 뜬다
    [17, "soon"],               // 19~21 두 주 앞
    [19, "now"],
    [21, "now"],
    [22, "past"],               // **겹치는 자리.** 끝난 것이 이긴다
    [23, "soon"],               // 24~28 은 여기 한 주만 뜬다
    [24, "now"],
    [28, "now"],
    [29, "past"],
    [30, ""],
  ];
  let seen = {};
  for (const [w, want] of WANT) {
    const r = await at(w);
    if (r.w !== w) { no(w + "주로 갔는데 앱은 " + r.w + "주라고 한다"); continue; }
    const line = (r.txt.split("\n").filter((x) => /구간/.test(x))[0] || "").trim();
    if (!want) {
      if (line) no(w + "주에는 아무것도 안 떠야 하는데 떴다: " + line);
      continue;
    }
    if (!line) { no(w + "주에 구간 줄이 없다"); continue; }
    if (!HEAD[want].test(line))
      no(w + "주는 '" + want + "' 여야 하는데 이렇게 떴다: " + line);
    seen[w] = line;
  }

  /* ---- 3. 무엇을 적고 무엇을 안 적나 ------------------------------------ */
  const soon = seen[8] || "", now = seen[10] || "", past = seen[15] || "";
  if (soon && soon.indexOf("10~14주") < 0) no("곧 오는 줄에 언제인지가 없다: " + soon);
  /* **문제만 적고 대응을 안 적으면 겁주기다** */
  if (soon && soon.indexOf("그래서") < 0)
    no("곧 오는 줄이 무엇을 해 뒀는지를 안 적는다. 그러면 겁주기다: " + soon);
  if (soon && !/화용 2편과 repair 3편/.test(soon))
    no("대응을 기준서 글자 그대로 안 적는다: " + soon);
  if (now && now.indexOf("그래서") < 0) no("지금 줄이 대응을 안 적는다: " + now);
  /* **왜 그런지는 예고할 때 한 번만 적는다.** 구간이 다섯 주고 그동안 날마다
     같은 설명을 띄우면 그것을 안 읽는다 (T322). 예고가 설명하는 자리다. */
  if (now && /전이|성장 체감|충동/.test(now))
    no("구간 안에서 날마다 원인 설명을 띄운다. 예고할 때 한 번이면 된다: " + now);
  if (soon && !/성장 체감/.test(soon))
    no("예고 줄이 왜 그런지를 안 적는다. 그러면 설명하는 자리가 없어진다: " + soon);
  /* **묻지 않는다** */
  const asked = [soon, now, past].filter((x) => /지루하|힘드|괜찮/.test(x));
  if (asked.length) no("화면이 증상을 묻거나 적는다: " + asked[0]);
  /* **다그치지 않는다** (bench_habit.md 5장) */
  const push = [soon, now, past].filter((x) => /그만두|포기|이탈|많이들|버티/.test(x));
  if (push.length) no("화면이 겁을 준다: " + push[0]);
  /* 지난 줄은 끝났다고만 말한다. 거기서 또 대응을 적으면 안 끝난 것이다 */
  if (past && past.indexOf("그래서") >= 0)
    no("지나간 줄이 아직 무엇을 하라고 한다: " + past);
  /* **사람 이름이 없다.** 첫 화면에 이름이 뜨면 그것이 곧 지목이다 */
  if ([soon, now, past].some((x) => x.indexOf("가람") >= 0 || x.indexOf("나래") >= 0))
    no("구간 줄에 사람 이름이 있다");

  /* ---- 4. 저장소에 아무것도 안 남기는가 --------------------------------- */
  const st = await page.evaluate(() => {
    const raw = localStorage.getItem("eng2p.v1") || "";
    return { hit: /ahead|seenAhead|failpt/i.test(raw) };
  });
  if (st.hit) no("저장소에 미리 알림 자국이 남는다. 주 수만 보고 정해야 한다");

  /* ---- 5. 규칙 탭 표와 같은 말을 하는가 --------------------------------- */
  const tab = await page.evaluate(() => {
    go("rules");
    return document.getElementById("t-rules").innerText;
  });
  ["10~14주", "20주 전후", "24~28주"].forEach((k) => {
    if (tab.indexOf(k) < 0) no("규칙 탭 표에서 " + k + " 가 없어졌다");
  });

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 미리 알린 것이 정말 이탈을 막는가**");
  console.log("미리 아는 것 %d판 (자료 6, 때 %d, 글 11, 저장소 1, 규칙 탭 3) / 실패 %d",
              21 + WANT.length, WANT.length, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
