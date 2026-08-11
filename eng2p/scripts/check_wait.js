/* 기다림과 못 읽음 (T387~T388).

   ## 화면이 영영 여는 중에 머물렀다

   자료를 못 읽으면 부르는 쪽이 다시 그리고 다시 그리면 또 읽으러 갔다.
   **3초에 1432번 읽으러 갔다.** 화면은 그동안 "여는 중이다" 였다.

   두 사람은 기다린다. 기다려도 안 온다. 앱이 멎은 것으로 보인다.
   실제로는 그 파일이 없는 것이고 그것은 기다릴 일이 아니다.

   이 검사가 자료를 하나씩 막아 놓고 셋을 잰다.

       읽으러 몇 번 갔나   한 번이어야 한다
       화면이 무엇을 말하나 못 읽었다고 말해야 한다
       어디를 받으라 하나  그 파일 자리를 옳게 적어야 한다

   셋째가 T382 와 같은 결이다. **틀린 이름을 적으면 없는 것을 찾는다.**

   돌리는 법:

       NODE_PATH=... CHROMIUM_PATH=... node scripts/check_wait.js
*/
const fs = require("fs");
const path = require("path");

const HERE = path.resolve(__dirname, "..");
const ROOT = path.resolve(HERE, "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

if (!fs.existsSync(CHROME)) {
  console.log("기다림 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { console.log("기다림 검사를 안 돌렸다. 통과가 아니다."); process.exit(0); }

/* 자료를 막아 놓고 그 칸이 무엇을 말하는지 본다.
   go   그 칸을 여는 법
   box  그 칸의 자리 */
const CASES = [
  { file: "track.js", at: "eng2p/out/data/track.js", box: "#trackBox",
    what: "트랙 표", go: () => { go("ledger"); } },
  { file: "quest.js", at: "eng2p/out/data/quest.js", box: "#todaySlots",
    what: "퀘스트", go: () => { go("today"); } },
  { file: "badge.js", at: "eng2p/out/data/badge.js", box: "#badgeList",
    what: "배지", go: () => { go("quarter"); } },
  { file: "voice.js", at: "eng2p/out/data/voice.js", box: "#voiceList",
    what: "읽을 줄", go: () => { go("quarter"); } },
  { file: "pairs.js", at: "eng2p/out/data/pairs.js", box: "#t-play",
    what: "쌍 표", go: () => { go("play"); PLAY.at = "mirror"; renderPlayTab(); } },
  { file: "apart.js", at: "eng2p/out/data/apart.js", box: "#t-play",
    what: "물음", go: () => { go("play"); PLAY.at = "apart"; renderPlayTab(); } },
  /* **`loadScript` 를 바로 부르는 길이 따로 있다.** 자료가 아니라 묶음이다.
     `loadData` 쪽 방어만 있으면 이 길은 그대로 열려 있다.
     여러 번 그려 봐야 그 자리가 재진다. 한 번만 그리면 방어가 없어도 한 번이다. */
  { file: "plays.js", at: "eng2p/out/app/plays.js", box: "#t-play",
    what: "판 묶음", many: true,
    go: () => { go("play"); PLAY.at = "mirror";
                for (let i = 0; i < 6; i++) renderPlayTab(); } },
  { file: "catalog.js", at: "media/english/catalog.js", box: "#t-play",
    what: "소리 차림표", many: true,
    go: () => { go("play"); PLAY.at = "ladder";
                for (let i = 0; i < 6; i++) renderPlayTab(); } },
];

const fails = [];
const no = (m) => fails.push(m);

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  let n = 0;

  for (const c of CASES) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    let tries = 0;
    /* **그 자료만 막는다.** 나머지는 그대로 읽혀야 한다 */
    await ctx.route("**/" + c.file, (r) => { tries++; r.abort(); });
    const page = await ctx.newPage();
    await page.goto(PAGE);
    await page.evaluate(() => {
      localStorage.clear();
      S.onboarded = true; S.names.a = "가람"; S.names.b = "나래"; S.device = "a";
      saveNow();
    });
    await page.reload();
    await page.waitForTimeout(600);
    const txt = await page.evaluate(async (x) => {
      /* eslint-disable no-eval */
      eval("(" + x.go + ")()");
      await new Promise((ok) => setTimeout(ok, 2500));
      const e = document.querySelector(x.box);
      return e ? (e.innerText || "").replace(/\s+/g, " ") : null;
    }, { go: c.go.toString(), box: c.box });
    await ctx.close();

    n += 3;
    if (txt === null) { no(c.what + ": 자리(" + c.box + ")가 화면에 없다"); continue; }
    /* **한 번만 읽으러 간다.** 안 기억하면 다시 그릴 때마다 또 간다 */
    if (tries > (c.many ? 1 : 3))
      no(c.what + ": 못 읽는 자료를 " + tries + "번 읽으러 갔다. 한 번이면 된다");
    /* **못 읽었다고 말한다.** 여는 중이라고만 하면 두 사람은 기다린다 */
    if (txt.indexOf("못 읽었다") < 0)
      no(c.what + ": 못 읽었는데 그 말이 없다: " + txt.slice(0, 60));
    /* **그 파일 자리를 옳게 적는다** (T382 와 같은 결) */
    if (txt.indexOf(c.at) < 0)
      no(c.what + ": 받을 자리가 " + c.at + " 인데 화면에 없다: " + txt.slice(0, 80));
  }

  /* ---- 자리 밖에 있는 자료 셋도 옳게 적는가 ------------------------------ */
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(PAGE);
    await page.waitForTimeout(500);
    const said = await page.evaluate(() => ({
      catalog: dataPath("catalog"), plays: dataPath("plays"),
      late: dataPath("late"), idx: dataPath("idxQ2"), plain: dataPath("cards"),
    }));
    await ctx.close();
    n += 5;
    const want = {
      catalog: "media/english/catalog.js",
      plays: "eng2p/out/app/plays.js",
      late: "eng2p/out/app/late.js",
      idx: "eng2p/out/data/index_q2.js",
      plain: "eng2p/out/data/cards.js",
    };
    Object.keys(want).forEach((k) => {
      if (said[k] !== want[k])
        no("자료 " + k + " 자리를 " + said[k] + " 라고 한다. " + want[k] + " 다");
    });
  }

  /* ---- 기다림 말을 한 자리에서 짓는가 ------------------------------------ */
  const app = HERE + "/app";
  const spread = [];
  ["js", "late", "play"].forEach((d) => {
    fs.readdirSync(path.join(app, d)).forEach((f) => {
      const src = fs.readFileSync(path.join(app, d, f), "utf8");
      /* 주석은 뺀다. 없앤 말을 설명하려면 그 말을 적어야 한다 */
      const code = src.replace(/\/\*[\s\S]*?\*\//g, "");
      if (/여는 중이다/.test(code)) spread.push(d + "/" + f);
    });
  });
  n += 1;
  /* **한 자리에서 짓는다.** 마흔 곳이 저마다 적으면 갈라진다 (T383 과 같은 손) */
  if (spread.length > 1)
    no("기다림 말을 " + spread.length + "곳이 저마다 적는다: " + spread.slice(0, 3).join(" "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 두 사람이 얼마나 기다리다 덮는가**");
  console.log("기다림 %d판 (자료 %d개 x 3, 자리 5, 한 자리 1) / 실패 %d",
              n, CASES.length, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
