/* 글쇠가 적어 둔 대로 먹는가 (T396).
 *
 * 단축키는 T244 부터 있었다. 규칙 탭에 목록도 있었다.
 * **그 둘이 어긋나 있었다.** 목록에 없는 글쇠가 셋이었다.
 * `P` 와 왼쪽과 오른쪽이다. 손으로 두 벌 적어 두었기 때문이다.
 *
 * 그리고 더 나쁜 것이 하나 있었다.
 *
 *     `Space` 가 늘 `#tStart` 를 눌렀다.
 *
 * 오늘 화면을 내리려고 빈칸을 치면 **두 시간짜리 세션이 시작된다.**
 * 그 손짓은 내리려던 것이지 시작하려던 것이 아니다.
 * 이 검사를 만들다가 내가 직접 그것을 눌러 겪었다.
 *
 * 재는 것.
 *
 *   1. 표가 하나인가. 규칙 탭과 `?` 목록이 같은 표를 읽는가
 *   2. **소스의 글쇠와 표의 글쇠가 같은가.** 어긋난 자리가 여기서 났다
 *   3. 적어 둔 글쇠가 정말 먹는가. 눌러 본다
 *   4. 세션 밖에서 세션 글쇠가 안 먹는가
 *   5. 적는 칸에 손이 있으면 아무것도 안 먹는가
 *   6. **되돌릴 수 없는 것에 글쇠가 없는가.** 처음으로는 한 시간 사십 분을 지운다
 *
 * **기계가 안 보는 것: 그 글쇠가 손에 익는가.**
 *
 * 사용법:
 *     node scripts/check_keys.js
 *
 * 규격: docs/roadmap.md 12.10
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("글쇠 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

const fails = [];
let n = 0;

const SEED = `
  S.onboarded = true; S.names.a = "가람"; S.names.b = "나래"; S.device = "a";
  saveNow(); renderToday();
`;

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });

  /* 1. **소스의 글쇠와 표의 글쇠가 같은가.** 화면이 아니라 소스를 읽는다.
     목록을 손으로 적어 두면 글쇠를 늘릴 때 한쪽만 는다. */
  {
    n += 2;
    const src = fs.readFileSync(path.join(__dirname, "..", "app", "js", "10_run.js"), "utf8");
    const from = src.indexOf('document.addEventListener("keydown"');
    if (from < 0) { fails.push("keydown 자리를 못 찾았다"); }
    else {
      const body = src.slice(from);
      /* handler 가 견주는 글쇠. `k==="x"` 꼴만 센다 */
      const inCode = new Set();
      (body.match(/k===("[^"]+")/g) || []).forEach((m) => {
        inCode.add(m.slice(5).replace(/"/g, ""));
      });
      /* 표에 적힌 글쇠 */
      const tbl = src.slice(src.indexOf("var KEYS=["), src.indexOf("/* 세션 안인가"));
      const inTable = new Set();
      (tbl.match(/k:\[([^\]]*)\]/g) || []).forEach((m) => {
        (m.match(/"[^"]*"/g) || []).forEach((x) => inTable.add(x.replace(/"/g, "")));
      });
      /* 숫자 글쇠는 handler 가 `parseInt` 로 받는다. 표에는 1~9 로 적혀 있다 */
      "123456789".split("").forEach((d) => inCode.add(d));
      const onlyCode = [...inCode].filter((k) => !inTable.has(k));
      const onlyTable = [...inTable].filter((k) => !inCode.has(k));
      if (onlyCode.length)
        fails.push("표에 없는 글쇠가 코드에 있다: " + onlyCode.join(" "));
      if (onlyTable.length)
        fails.push("코드에 없는 글쇠가 표에 있다: " + onlyTable.join(" "));
    }
  }

  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(PAGE);
  await page.waitForTimeout(700);
  await page.evaluate(new Function(SEED));
  await page.waitForTimeout(300);

  /* 2. 표를 그리는 자리가 둘인데 **한 표에서 나오는가** */
  {
    n += 3;
    await page.keyboard.press("?");
    await page.waitForTimeout(400);
    const help = await page.evaluate(() => {
      const e = document.getElementById("keyHelp");
      return { hidden: e.hidden, rows: e.querySelectorAll("tbody tr").length,
               txt: (e.innerText || "").replace(/\s+/g, " ") };
    });
    if (help.hidden) fails.push("? 를 눌렀는데 목록이 안 뜬다");
    await page.keyboard.press("?");
    await page.waitForTimeout(250);
    if (!(await page.evaluate(() => document.getElementById("keyHelp").hidden)))
      fails.push("? 를 다시 눌렀는데 목록이 안 닫힌다");
    await page.evaluate(() => go("rules"));
    await page.waitForTimeout(1400);
    const wall = await page.evaluate(() => {
      const e = document.getElementById("keyList");
      return e ? { rows: e.querySelectorAll("tbody tr").length,
                   txt: (e.innerText || "").replace(/\s+/g, " ") } : null;
    });
    if (!wall) fails.push("규칙 탭에 단축키 표가 없다");
    else if (wall.rows !== help.rows)
      fails.push("규칙 탭은 " + wall.rows + "줄, ? 목록은 " + help.rows + "줄이다. 표가 둘이다");
    await page.evaluate(() => go("today"));
    await page.waitForTimeout(400);
  }

  /* 3. **세션 밖에서 세션 글쇠가 안 먹는가.** 빈칸은 화면을 내리는 손짓이다 */
  {
    n += 3;
    const before = await page.evaluate(() => ({
      cls: document.body.className, sess: !!S.session }));
    for (const k of [" ", "ArrowRight", "ArrowLeft"]) {
      await page.keyboard.press(k);
      await page.waitForTimeout(300);
      const after = await page.evaluate(() => ({
        cls: document.body.className, sess: !!S.session }));
      if (after.sess !== before.sess || /session-focus/.test(after.cls))
        fails.push("세션 밖에서 " + (k === " " ? "빈칸" : k) + " 이 세션을 건드렸다: " + after.cls);
    }
  }

  /* 4. 세션 중에는 정말 먹는가. **눌러서 값이 바뀌는지 본다** */
  {
    n += 4;
    await page.click("#tOne");
    await page.waitForTimeout(900);
    const s0 = await page.evaluate(() => ({ run: T.run, idx: T.idx }));
    if (!s0.run) fails.push("세션을 시작했는데 시계가 안 돈다");
    await page.keyboard.press(" ");
    await page.waitForTimeout(400);
    const s1 = await page.evaluate(() => ({ run: T.run, idx: T.idx }));
    if (s1.run !== false) fails.push("세션 중 빈칸으로 안 멈춘다");
    /* **멈춰 있어도 세션 안이다.** 빈칸으로 다시 켜져야 한다 */
    await page.keyboard.press(" ");
    await page.waitForTimeout(400);
    if ((await page.evaluate(() => T.run)) !== true)
      fails.push("멈춘 뒤 빈칸으로 다시 안 켜진다. 멈추면 세션 밖으로 친 것이다");
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(600);
    const s2 = await page.evaluate(() => T.idx);
    if (s2 !== s0.idx + 1) fails.push("세션 중 오른쪽으로 블록이 안 넘어갔다: " + s2);
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(600);
    if ((await page.evaluate(() => T.idx)) !== s0.idx)
      fails.push("왼쪽으로 안 돌아왔다");
  }

  /* 5. **적는 칸에 손이 있으면 아무것도 안 먹는다.** 블록 1과 4는 적는 블록이다 */
  {
    n += 2;
    await page.evaluate(() => { if (!T.run) $("#tStart").click(); });
    await page.waitForTimeout(400);
    const put = await page.evaluate(() => {
      const t = document.querySelector("#t-today textarea") ||
                document.querySelector("#t-today input:not([type=hidden]):not([type=range])");
      if (!t) return null;
      t.focus();
      return t.id || t.tagName;
    });
    if (!put) fails.push("적는 칸을 못 찾아서 이 판을 못 쟀다");
    else {
      const b0 = await page.evaluate(() => ({ run: T.run, idx: T.idx }));
      await page.keyboard.press(" ");
      await page.waitForTimeout(350);
      const b1 = await page.evaluate(() => ({ run: T.run, idx: T.idx }));
      if (b1.run !== b0.run) fails.push("적는 칸(" + put + ")에서 빈칸이 시계를 건드렸다");
      await page.keyboard.press("l");
      await page.waitForTimeout(300);
      if ((await page.evaluate(() => T.idx)) !== b0.idx)
        fails.push("적는 칸에서 글쇠가 블록을 옮겼다");
    }
  }

  /* 6. **되돌릴 수 없는 것에 글쇠가 없는가.**
     세션을 처음으로 되돌리면 한 시간 사십 분이 사라진다. 손가락으로 짚어야 한다. */
  {
    n += 1;
    const src = fs.readFileSync(path.join(__dirname, "..", "app", "js", "10_run.js"), "utf8");
    const body = src.slice(src.indexOf('document.addEventListener("keydown"'));
    const banned = ["#tReset", "#wipe", "#imBtn"];
    const hit = banned.filter((b) => body.indexOf(b) >= 0);
    if (hit.length)
      fails.push("되돌릴 수 없는 자리에 글쇠가 붙었다: " + hit.join(" "));
  }

  await ctx.close();
  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 그 글쇠가 손에 익는가**");
  console.log("글쇠 %d판 (표 하나 2, 목록 3, 세션 밖 3, 세션 중 4, 적는 중 2, 못 되돌림 1) / 실패 %d",
              n, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("[실패] 검사가 도중에 멈췄다: " + e.message);
  process.exit(1);
});
