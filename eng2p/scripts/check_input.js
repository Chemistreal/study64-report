/* 두 사람이 넣은 값이 화면을 무너뜨리는가 (T401).
 *
 * T394 가 **화면 크기**를 쟀다. 폭 여섯에 글자 두 단이다.
 * 그때 넣은 이름은 늘 "가람" 과 "나래" 였다. 두 글자다.
 *
 * **내용의 길이는 아무도 안 쟀다.** 그런데 이름은 두 사람이 직접 넣고
 * 화면 서른여덟 자리에 그려진다. `maxlength` 가 하나도 없다.
 *
 * 재 보니 27자 이름에서 390px 화면이 397px 이 됐다. 역할 배지가
 * `white-space:nowrap` 이라 밖으로 나갔다. 가로로 밀어야 읽힌다.
 *
 * **자르지 않는다.** 이름을 자르면 누구인지 모른다.
 * 넘치는 대신 배지 안에서 줄을 바꾼다.
 *
 * 그리고 하나를 더 본다. **넣은 것이 글자로 남는가.**
 * 이름 칸에 태그를 넣으면 그것이 그려지면 안 된다. `esc()` 가 그 일을 한다.
 * 이 앱은 서버가 없어서 남의 값이 안 들어오지만, 두 사람이 넣은 값이
 * 화면을 망가뜨리는 것은 그것과 별개로 막아야 한다.
 *
 * **기계가 안 보는 것: 그 이름으로 두 사람이 서로를 알아보는가.**
 *
 * 사용법:
 *     node scripts/check_input.js
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
  console.log("넣은 값 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

const LONG = "가나다라마바사아자차카타파하".repeat(2);          /* 28자 */
const TAG = '<img src=x onerror="window.__hit=1">가람';
const CASES = [
  { what: "보통", a: "가람", b: "나래" },
  { what: "아주 긴 이름", a: LONG, b: "나래" },
  { what: "둘 다 긴 이름", a: LONG, b: LONG },
  { what: "한 글자", a: "가", b: "나" },
  { what: "빈칸이 든 이름", a: "가 람", b: "나 래" },
  { what: "태그가 든 이름", a: TAG, b: "<b>나래</b>" },
];
/* 글자 크기 두 단에서 다 본다. 큰 글자에서 먼저 넘친다 */
const FS = [0, 2];

const fails = [];
let n = 0;

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });

  for (const c of CASES) {
    for (const fsv of FS) {
      n += 4;
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await ctx.newPage();
      let err = null;
      page.on("pageerror", (e) => { err = e.message; });
      page.on("dialog", (d) => { err = "대화상자가 떴다"; d.dismiss(); });
      await page.goto(PAGE);
      await page.waitForTimeout(700);
      await page.fill("#obA", c.a);
      await page.fill("#obB", c.b);
      await page.click("#obGo");
      await page.waitForTimeout(500);
      await page.evaluate((v) => {
        const td = today();
        S.start = addDays(td, -20); S.device = "a"; S.fs = v;
        for (let i = 1; i <= 20; i++) {
          if (i % 7 === 0) continue;
          S.days[addDays(td, -i)] = { status: "normal", speak: 40, cards: 7, lre: 2,
                                      unres: [], coll: [] };
        }
        saveNow(); applyFs(); renderToday();
      }, fsv);
      await page.waitForTimeout(500);
      const where = c.what + " 글자" + (fsv ? "더 크게" : "보통");

      const m = await page.evaluate(() => {
        const cw = document.documentElement.clientWidth;
        const over = [];
        document.querySelectorAll("#t-today *").forEach((e) => {
          if (over.length >= 3) return;
          if (e.closest(".scroll")) return;
          const r = e.getBoundingClientRect();
          if (r.width > 0 && r.right > cw + 1)
            over.push((e.id ? "#" + e.id : e.tagName.toLowerCase()) + "." +
                      (e.className || "").toString().split(" ")[0] +
                      " 오른쪽 " + Math.round(r.right));
        });
        return { cw: cw, sw: document.documentElement.scrollWidth, over: over,
                 role: (document.getElementById("todayRole") || {}).innerText || "",
                 hit: !!window.__hit,
                 imgs: document.querySelectorAll("#todayRole img, #t-today img").length };
      });

      /* **가로로 안 넘친다.** 넘치면 손가락으로 밀어야 읽는다 */
      if (m.sw > m.cw + 1)
        fails.push(where + ": 폭 " + m.cw + "px 인데 " + m.sw + "px 로 넘친다" +
                   (m.over.length ? " (" + m.over.join(" / ") + ")" : ""));
      else if (m.over.length)
        fails.push(where + ": 넘친 칸 " + m.over.join(" / "));
      /* **넣은 것이 글자로 남는다.** 태그가 그려지면 안 된다 */
      if (m.hit || m.imgs)
        fails.push(where + ": 넣은 값이 그림으로 그려졌다 (img " + m.imgs + "개)");
      if (err) fails.push(where + ": " + err);
      /* **이름이 안 잘린다.** 자르면 누구인지 모른다.
         앞 여덟 자만 보다가 "여덟 자로 자름" 깸을 놓쳤다. 통째로 본다.
         줄이 바뀌면 `innerText` 에 개행이 들어가므로 빈칸을 지우고 견준다. */
      const norm = (x) => String(x).replace(/\s+/g, "");
      if (c.a !== TAG && norm(m.role).indexOf(norm(c.a)) < 0)
        fails.push(where + ": 역할 줄에서 이름이 잘렸다: " + m.role.slice(0, 46));
      await ctx.close();
    }
  }

  /* 넣은 값이 다른 자리에서도 안 무너지는가. 대장과 찾기를 본다 */
  {
    const TABS = ["ledger", "find", "review"];
    n += TABS.length;
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(PAGE);
    await page.waitForTimeout(700);
    await page.fill("#obA", LONG);
    await page.fill("#obB", LONG);
    await page.click("#obGo");
    await page.waitForTimeout(500);
    await page.evaluate((lng) => {
      const td = today();
      S.start = addDays(td, -20); S.device = "a";
      for (let i = 1; i <= 20; i++) {
        if (i % 7 === 0) continue;
        S.days[addDays(td, -i)] = { status: "normal", speak: 40, cards: 7, lre: 2,
                                    unres: [], coll: [] };
      }
      /* 적은 것도 길게. **한 줄이 아주 길 수 있다** */
      S.days[addDays(td, -1)].unres = [{ t: lng + " " + lng, i: lng, k: "",
                                         h: lng, w: lng, done: false }];
      saveNow(); renderToday();
    }, LONG);
    await page.waitForTimeout(400);
    for (const t of TABS) {
      await page.evaluate((x) => go(x), t);
      await page.waitForTimeout(t === "find" ? 1200 : 700);
      const m = await page.evaluate((x) => {
        const cw = document.documentElement.clientWidth;
        const sec = document.getElementById("t-" + x);
        const over = [];
        sec.querySelectorAll("*").forEach((e) => {
          if (over.length >= 3) return;
          if (e.closest(".scroll")) return;
          const r = e.getBoundingClientRect();
          if (r.width > 0 && r.right > cw + 1)
            over.push((e.id ? "#" + e.id : e.tagName.toLowerCase()) + "." +
                      (e.className || "").toString().split(" ")[0]);
        });
        return { cw: cw, sw: document.documentElement.scrollWidth, over: over };
      }, t);
      if (m.sw > m.cw + 1 || m.over.length)
        fails.push("긴 이름으로 " + t + " 탭이 넘친다 (" + m.sw + "px, " +
                   m.over.join(" / ") + ")");
    }
    /* 찾기에서 그 긴 값을 찾을 수 있는가. **적은 것은 다시 보여야 한다** */
    n += 1;
    await page.evaluate((x) => go("find"), null);
    await page.waitForTimeout(900);
    await page.fill("#fdQ", "가나다라마바");
    await page.waitForTimeout(2200);
    const found = await page.evaluate(() =>
      (document.getElementById("fdOut").innerText || "").indexOf("미해결 LRE") >= 0);
    if (!found) fails.push("아주 긴 값을 적었는데 찾기에서 안 나온다");
    await ctx.close();
  }

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 그 이름으로 두 사람이 서로를 알아보는가**");
  console.log("넣은 값 %d판 (갈래 %d개 x 글자 %d단 x 4, 다른 탭 3, 찾기 1) / 실패 %d",
              n, CASES.length, FS.length, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("[실패] 검사가 도중에 멈췄다: " + e.message);
  process.exit(1);
});
