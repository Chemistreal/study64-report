/* 그림이 나르는 값이 눈으로 갈리는가 (T398).
 *
 * `check_contrast.js` 는 **글자만** 잰다. 3792곳을 훑는데 다 글자다.
 * 그런데 이 앱에서 두 사람이 제일 먼저 보는 것은 글자가 아니다.
 *
 *     고리 셋이 1년과 이번 주와 오늘을 말한다
 *     48주 띠가 어디까지 왔는지 말한다
 *     시계 링이 얼마나 남았는지 말한다
 *     블록 띠 넷이 지금 어디인지 말한다
 *
 * **이 넷이 나르는 값을 아무도 안 쟀다.** 찬 쪽과 빈 쪽이 안 갈리면
 * 그 그림은 자리만 먹는다. 글자와 달리 대비가 낮아도 "안 보인다" 가 아니라
 * "다 찼다" 나 "하나도 안 찼다" 로 잘못 읽힌다. **틀린 값으로 읽힌다.**
 *
 * 3:1 을 잣대로 둔다 (WCAG 1.4.11 이 글자 아닌 것에 그 값을 쓴다).
 * 색으로만 갈리지 않고 **모양으로도 갈리는 자리**는 그 모양이 있는지만 본다.
 * 48주 띠의 오늘이 그렇다. 색이 옆칸과 비슷해도 테두리가 둘러 있다.
 *
 * **기계가 안 보는 것: 그 그림이 흘끗 봐서 읽히는가.**
 * 여기서 재는 것은 갈리는가지 뜻이 곧바로 오는가가 아니다.
 *
 * 사용법:
 *     node scripts/check_graphic.js
 *
 * 규격: docs/roadmap.md 12.10
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const MIN = 3;

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("그림 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

/* 재는 짝. **이 표가 규격이다.** 여기 없는 그림은 안 재진다.
     a, b   견줄 두 자리. `stroke` 면 선 색이고 아니면 바탕색이다
     shape  색 말고 모양으로도 갈리는가. 그러면 그 모양이 있는지만 본다 */
const PAIR = [
  { what: "고리 찬 쪽과 빈 쪽",
    a: { sel: "#todayRings circle.rv", how: "stroke" },
    b: { sel: "#todayRings circle:not(.rv)", how: "stroke" } },
  { what: "48주 띠 한 주와 안 한 주",
    a: { sel: ".weekband i.done" }, b: { sel: ".weekband i:not(.done):not(.now)" } },
  { what: "48주 띠 이번 주와 한 주",
    a: { sel: ".weekband i.now" }, b: { sel: ".weekband i.done" },
    shape: "box-shadow" },
  { what: "블록 띠 지난 칸과 안 간 칸",
    a: { sel: ".steps div.done" }, b: { sel: ".steps div:not(.done):not(.now)" },
    need: "session" },
  { what: "블록 띠 지금 칸과 지난 칸",
    a: { sel: ".steps div.now" }, b: { sel: ".steps div.done" },
    need: "session", shape: "box-shadow" },
  { what: "시계 링 찬 쪽과 빈 쪽",
    a: { sel: "#tRing", how: "stroke", grad: "#ringg" },
    b: { sel: ".ringwrap circle:not(#tRing)", how: "stroke" },
    need: "session" },
];

const fails = [];
let n = 0;

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(PAGE);
  await page.waitForTimeout(700);
  await page.fill("#obA", "가람");
  await page.fill("#obB", "나래");
  await page.click("#obGo");
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const td = today();
    S.start = addDays(td, -40);
    for (let i = 1; i <= 40; i++) {
      if (i % 7 === 0) continue;
      S.days[addDays(td, -i)] = { status: "normal", speak: 40, cards: 7, lre: 2,
                                  unres: [], coll: [] };
    }
    S.device = "a"; saveNow(); renderToday();
  });
  await page.waitForTimeout(600);

  /* 브라우저 안에서 색을 뽑는다. **투명한 색은 뒤를 겹쳐 봐야 한다.**
     `--edge` 가 `rgba(20,20,40,.07)` 이고 카드가 `rgba(255,255,255,.72)` 다.
     겹치기 전 값으로 재면 없는 색을 재게 된다. */
  /* 브라우저 안에서 색을 뽑는다. 걸린 것이 둘이다.

     **투명한 색은 뒤를 겹쳐 봐야 한다.** `--edge` 가 `rgba(20,20,40,.07)` 이고
     카드가 `rgba(255,255,255,.72)` 다. 겹치기 전 값으로 재면 없는 색을 잰다.

     **그러데이션은 `backgroundColor` 에 없다.** 블록 띠의 지난 칸이
     `linear-gradient` 라 바탕색이 투명이었다. 처음에는 그것을 모르고
     카드 바탕끼리 견줘서 대비 1.06 이 나왔다. 앱이 아니라 검사가 틀렸다.
     색을 **여럿** 돌려주고 그중 제일 안 갈리는 짝으로 판정한다.
     띠는 왼쪽 끝부터 오른쪽 끝까지 다 갈려야 한다. */
  const READ = `(function(sel, how, grad){
    const e = document.querySelector(sel);
    if (!e) return null;
    const num = (c) => {
      const m = /rgba?\\(([^)]+)\\)/.exec(c);
      if (!m) return null;
      const p = m[1].split(",").map((x) => parseFloat(x));
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const over = (fg, bg) => ({
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
    const behind = (node) => {
      let cur = node.parentElement, stack = [];
      while (cur) {
        const c = num(getComputedStyle(cur).backgroundColor);
        if (c && c.a > 0) { stack.push(c); if (c.a === 1) break; }
        cur = cur.parentElement;
      }
      let base = { r: 255, g: 255, b: 255, a: 1 };
      for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
      return base;
    };
    const hex = (raw) => {
      if (!/^#/.test(raw)) return raw;
      const h = raw.length === 4
        ? "#" + raw[1] + raw[1] + raw[2] + raw[2] + raw[3] + raw[3] : raw;
      return "rgb(" + parseInt(h.slice(1, 3), 16) + "," + parseInt(h.slice(3, 5), 16) +
             "," + parseInt(h.slice(5, 7), 16) + ")";
    };
    const bg = behind(e), out = [];
    if (how === "stroke") {
      let raw = e.getAttribute("stroke") || getComputedStyle(e).stroke;
      if (grad && /url\\(/.test(raw)) {
        const g = document.querySelector(grad);
        [...(g ? g.querySelectorAll("stop") : [])].forEach((st) => {
          const c = num(hex(getComputedStyle(st).stopColor));
          if (c) out.push(over(c, bg));
        });
      } else {
        if (/var\\(/.test(raw)) {
          const nm = raw.replace(/^var\\(|\\)$/g, "").trim();
          raw = getComputedStyle(document.documentElement).getPropertyValue(nm).trim();
        }
        const c = num(hex(raw));
        if (c) out.push(over(c, bg));
      }
    } else {
      const c = num(getComputedStyle(e).backgroundColor);
      if (c && c.a > 0) out.push(over(c, bg));
      /* 바탕색이 투명이면 그림에서 찾는다. 그러데이션 색을 다 뽑는다 */
      const img = getComputedStyle(e).backgroundImage || "";
      (img.match(/rgba?\\([^)]+\\)/g) || []).forEach((x) => {
        const c2 = num(x); if (c2) out.push(over(c2, bg));
      });
      if (!out.length && c) out.push(over(c, bg));
    }
    if (!out.length) return null;
    return { cs: out, shadow: getComputedStyle(e).boxShadow };
  })`;

  function lum(c) {
    const f = (x) => { x = x / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function rgb(c) {
    return "rgb(" + [c.r, c.g, c.b].map((x) => Math.round(x)).join(",") + ")";
  }
  function ratio(a, b) {
    const la = lum(a), lb = lum(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  async function measure(panel) {
    for (const p of PAIR) {
      if (p.need === "session" && panel !== "짙은 판") continue;
      if (p.need !== "session" && panel === "짙은 판") continue;
      n += 1;
      const A = await page.evaluate(
        ([src, s, h, g]) => (new Function("return " + src))()(s, h, g),
        [READ, p.a.sel, p.a.how || "", p.a.grad || ""]);
      const B = await page.evaluate(
        ([src, s, h, g]) => (new Function("return " + src))()(s, h, g),
        [READ, p.b.sel, p.b.how || "", p.b.grad || ""]);
      /* **안 뜨는 자리는 안 재진다.** 없으면 없다고 말한다 (T389) */
      if (!A || !B) {
        fails.push(panel + " " + p.what + ": 그 그림이 화면에 없다 (" +
                   (!A ? p.a.sel : p.b.sel) + ")");
        continue;
      }
      /* **제일 안 갈리는 짝으로 판정한다.** 띠는 끝에서 끝까지 다 갈려야 한다 */
      let r = Infinity, at = "";
      A.cs.forEach((x) => B.cs.forEach((y) => {
        const v = ratio(x, y);
        if (v < r) { r = v; at = rgb(x) + " 과 " + rgb(y); }
      }));
      if (r >= MIN) continue;
      /* 색으로 안 갈려도 모양으로 갈리면 된다. 그 모양이 정말 있는지 본다 */
      if (p.shape === "box-shadow" && A.shadow && A.shadow !== "none") continue;
      fails.push(panel + " " + p.what + ": 대비 " + r.toFixed(2) +
                 " (3 아래다) " + at + (p.shape ? ". 모양으로도 안 갈린다" : ""));
    }
  }

  await measure("밝은 판");

  /* 세션 중 짙은 판. **판이 바뀌면 색이 다 바뀐다** (T223).
     블록 2로 옮긴다. 블록 1에서는 지난 칸이 없어서 그 짝이 안 생긴다.
     **안 생긴 자리는 안 재진다.** 지난 칸과 지금 칸이 둘 다 있어야 한다. */
  await page.click("#tOne");
  await page.waitForTimeout(900);
  await page.evaluate(() => gotoBlock(1));
  await page.waitForTimeout(700);
  await measure("짙은 판");

  await ctx.close();
  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 그 그림이 흘끗 봐서 읽히는가**");
  console.log("그림 %d판 (짝 %d개, 3:1 잣대, 모양으로 갈리는 자리는 그 모양을 본다) / 실패 %d",
              n, PAIR.length, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("[실패] 검사가 도중에 멈췄다: " + e.message);
  process.exit(1);
});
