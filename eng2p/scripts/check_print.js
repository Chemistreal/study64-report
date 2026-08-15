/* 종이에 제대로 찍히는가 (T393).
 *
 * `04_parts.css` 의 `@media print` 첫 줄이 이렇게 적어 두었다.
 *
 *     종이와 같이 쓰는 물건이다. 인쇄가 되는 것이 부속 기능이 아니다.
 *
 * 그 말대로 규칙이 쉰 줄 가까이 있다. 색을 순백과 순흑으로 되돌리고
 * 이동줄과 단추를 빼고 시계를 빼고 블록 칸은 남긴다.
 *
 * **그런데 그 쉰 줄을 아무도 안 재고 있었다.** 화면 검사 열 몇 개가 다
 * `screen` 으로만 그린다. 인쇄 규칙이 깨져도 화면은 멀쩡하다.
 * 종이는 두 사람이 인쇄를 누른 그 순간에만 드러난다.
 *
 * 세우자마자 나온 것이 있다. 선택자 목록 가운데에 주석이 들어가서
 * 여섯 자리가 `display:inline` 을 받고 있었다. **쉼표 뒤에서 줄이 끊긴
 * 것처럼 보이지만 CSS 에게 주석은 빈칸이다.** 세션 중에 인쇄하면
 * 카드도 표도 테두리를 잃고 한 줄로 흘렀다.
 *
 * **기계가 안 보는 것: 진짜 프린터에서 그 종이가 쓸 만한가.**
 * 잉크가 얼마나 드는지와 몇 장이 나오는지는 여기서 안 잰다.
 *
 * 사용법:
 *     node scripts/check_print.js
 *
 * 규격: docs/roadmap.md 12.10
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
/* A4 폭을 96dpi 로 잰 값에서 여백을 뺀 값. 종이는 좁다 */
const PAPER = 794;
const TABS = ["today", "review", "sound", "clip", "media", "play",
              "find", "src", "ledger", "verify", "quarter", "check", "rot", "rules"];

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("인쇄 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

const fails = [];
let n = 0;

/* 종이에서 잉크를 아끼려면 바탕이 희어야 한다. 흰 것에 가까운지만 본다 */
function light(rgb) {
  const m = /(\d+),\s*(\d+),\s*(\d+)/.exec(rgb || "");
  if (!m) return null;
  return (+m[1] + +m[2] + +m[3]) / 3;
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: PAPER, height: 1100 } });
  const page = await ctx.newPage();
  await page.goto(PAGE);
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    S.onboarded = true; S.names.a = "가람"; S.names.b = "나래"; S.device = "a";
    const td = today();
    for (let i = 1; i <= 20; i++) {
      const d = addDays(td, -i);
      S.days[d] = { status: "normal", speak: 40 + i, cards: 7, lre: 2, unres: [] };
    }
    saveNow(); renderToday();
  });
  await page.waitForTimeout(400);
  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(200);

  /* 1. 탭마다 **빈 종이가 아닌가.** 그리고 잉크를 안 먹는가 */
  for (const t of TABS) {
    n += 4;
    await page.evaluate((name) => go(name), t);
    await page.waitForTimeout(t === "check" || t === "quarter" ? 900 : 400);
    const m = await page.evaluate((name) => {
      const sec = document.getElementById("t-" + name);
      const body = getComputedStyle(document.body);
      const cards = [...document.querySelectorAll("#t-" + name + " .card")];
      const dark = cards.filter((c) => {
        const b = getComputedStyle(c).backgroundColor;
        const mm = /(\d+),\s*(\d+),\s*(\d+)/.exec(b);
        /* 투명한 것은 부모 색을 쓴다. 종이에서는 흰 바탕이다 */
        if (!mm || /rgba\([^)]*,\s*0\)/.test(b)) return false;
        return (+mm[1] + +mm[2] + +mm[3]) / 3 < 235;
      }).length;
      return {
        txt: sec ? (sec.innerText || "").replace(/\s+/g, " ").trim().length : -1,
        bg: body.backgroundColor, fg: body.color,
        wide: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
        darkCards: dark, cards: cards.length,
      };
    }, t);
    if (m.txt < 0) { fails.push(t + ": 구역이 없다"); continue; }
    /* **빈 종이를 안 낸다.** T148 에 세션 중 인쇄가 날짜만 찍은 적이 있다 */
    if (m.txt < 60) fails.push(t + ": 종이에 찍힐 글이 " + m.txt + "자다. 빈 종이가 나온다");
    if (light(m.bg) < 250) fails.push(t + ": 종이 바탕이 " + m.bg + " 다. 잉크를 먹는다");
    if (light(m.fg) > 90) fails.push(t + ": 종이 글자가 " + m.fg + " 다. 흐리게 찍힌다");
    /* **종이는 넓어지지 않는다.** 넘치면 오른쪽이 잘려 나간다 */
    if (m.wide > m.client + 1)
      fails.push(t + ": 종이 폭 " + m.client + "px 인데 " + m.wide + "px 로 넘친다");
    if (m.darkCards)
      fails.push(t + ": 짙은 카드가 " + m.darkCards + "개다 (" + m.cards + "개 중)");
  }

  /* 2. **누를 수 없는 것을 종이에 안 찍는다.** 자리만 먹는다 */
  {
    n += 3;
    await page.evaluate(() => go("today"));
    await page.waitForTimeout(400);
    const m = await page.evaluate(() => {
      const seen = (s) => [...document.querySelectorAll(s)]
        .filter((e) => e.offsetParent !== null || getComputedStyle(e).display !== "none").length;
      return { btn: seen("#t-today button"), nav: seen("nav"), head: seen("header"),
               /* 손으로 적는 칸은 남는다 */
               ins: seen("#t-today input:not([type=hidden])") };
    });
    if (m.btn) fails.push("종이에 단추가 " + m.btn + "개 찍힌다");
    if (m.nav || m.head) fails.push("종이에 이동줄이나 머리띠가 찍힌다");
    /* **적는 칸까지 지우면 종이가 읽기만 하는 종이가 된다** */
    if (!m.ins) fails.push("종이에 손으로 적을 칸이 하나도 안 남았다");
  }

  /* 3. **세션 중에 눌러도 빈 종이가 아닌가.** T148 이 여기서 났다.
     그때는 시계를 통째로 숨겨서 블록 칸까지 사라졌다. */
  {
    n += 4;
    const m = await page.evaluate(async () => {
      document.body.classList.add("session-focus");
      await new Promise((ok) => setTimeout(ok, 300));
      const sec = document.getElementById("t-today");
      const kids = [...sec.children].filter((e) => getComputedStyle(e).display !== "none");
      /* **한 줄로 흐르지 않는가.** 주석이 선택자 목록에 끼면 그렇게 된다 */
      const inline = kids.filter((e) => getComputedStyle(e).display === "inline");
      const sheet = document.querySelector(".todaysheet");
      return { txt: (sec.innerText || "").replace(/\s+/g, " ").trim().length,
               kids: kids.length, inline: inline.length,
               dock: getComputedStyle(document.getElementById("focusDock")).display,
               ring: getComputedStyle(document.querySelector(".ringwrap") ||
                                      document.body).display,
               sheetBorder: sheet ? getComputedStyle(sheet).borderTopWidth : null };
    });
    if (m.txt < 200)
      fails.push("세션 중 종이에 찍힐 글이 " + m.txt + "자다. 빈 종이가 나온다");
    if (m.inline)
      fails.push("세션 중 종이에서 " + m.inline + "칸이 한 줄로 흐른다 (" + m.kids + "칸 중)");
    if (m.dock !== "none") fails.push("세션 조작줄이 종이에 찍힌다");
    /* 오늘 한 장은 종이에서 테두리로 갈린다. 그것까지 지우면 어디까지가 오늘인지 모른다 */
    if (m.sheetBorder && parseFloat(m.sheetBorder) < 1)
      fails.push("오늘 한 장의 테두리가 종이에서 사라졌다: " + m.sheetBorder);
    await page.evaluate(() => document.body.classList.remove("session-focus"));
  }

  /* 3b. **접어 둔 칸이 종이에서 펴지는가** (T393).
     화면에서 접은 이유는 화면이 좁아서였다. 종이에는 그 이유가 없다.
     접힌 채로 찍으면 그 안은 영영 안 나온다. */
  {
    n += 4;
    await page.evaluate(() => go("today"));
    await page.waitForTimeout(400);
    const m = await page.evaluate(() => {
      const seen = () => [...document.querySelectorAll("details")]
        .filter((d) => d.offsetParent !== null)
        .map((d) => ({ id: d.id, open: d.open,
                       h: Math.round(d.getBoundingClientRect().height) }));
      const before = seen();
      if (typeof printOpen !== "function") return { none: true };
      printOpen();
      const during = seen();
      printClose();
      const after = seen();
      return { before: before, during: during, after: after };
    });
    if (m.none) { fails.push("인쇄 직전에 접힌 칸을 여는 길이 없다"); }
    else {
      /* **접힌 것이 종이에서 펴진다.** 높이로 잰다. `open` 만 봐서는
         정말 안이 나왔는지 모른다 */
      const shut = m.during.filter((d) => !d.open && d.id !== "navMore");
      if (shut.length)
        fails.push("종이에서 접힌 채로 남은 칸이 " + shut.length + "개다: " +
                   shut.map((d) => d.id).join(" "));
      const grew = m.before.filter((b, i) => m.during[i] && m.during[i].h > b.h + 4).length;
      const wasShut = m.before.filter((b) => !b.open && b.id !== "navMore").length;
      if (wasShut && !grew)
        fails.push("접힌 칸 " + wasShut + "개를 열었는데 높이가 그대로다. 안이 안 나왔다");
      /* **되돌리는 것까지가 이 일이다.** 인쇄 한 번에 화면이 바뀌면 안 된다 */
      const stuck = m.after.filter((d, i) => d.open !== m.before[i].open).length;
      if (stuck) fails.push("인쇄 뒤에 " + stuck + "칸이 열린 채로 남았다");
    }
  }

  /* 3c. **판 목록이 종이에 글로 나오는가** (T393).
     단추를 다 지우면 이 탭이 "판" 한 글자짜리 종이가 된다. */
  {
    n += 2;
    await page.evaluate(() => go("play"));
    await page.waitForTimeout(900);
    const m = await page.evaluate(() => {
      const list = document.getElementById("playList");
      const btn = [...(list ? list.querySelectorAll("button") : [])];
      return { names: btn.filter((b) => getComputedStyle(b).display !== "none").length,
               all: btn.length,
               txt: (document.getElementById("t-play").innerText || "").replace(/\s+/g, " ").length };
    });
    if (!m.all) fails.push("판 목록이 비었다. 이 판이 아무것도 안 쟀다");
    else if (m.names !== m.all)
      fails.push("판 " + (m.all - m.names) + "개가 종이에 안 나온다 (" + m.all + "개 중)");
    if (m.txt < 200) fails.push("판 탭 종이에 " + m.txt + "자만 찍힌다");
  }

  /* 4. **선택자를 적는 자리에 주석을 안 두었는가.** 소스를 본다.
     화면으로는 안 드러난다. **CSS 에게 주석은 빈칸이다.**

     두 꼴이 있고 둘 다 이 저장소에서 실제로 났다.

       쉼표로 끝난 줄 다음에 주석이 오면 목록이 이어진다 (T393).
       종이에서 여섯 자리가 한 줄로 흘렀다.

       쉼표 없이 끝난 줄 다음에 주석이 오면 자손 선택자가 된다 (T394).
       `.emgline` 이 `.sessionhead .emgline` 이 되어 여태 아무 데도 안 걸렸다.

     **괄호 밖에서만 잰다.** 값 안에도 쉼표로 끝나는 줄이 있다. */
  {
    n += 1;
    const dir = path.join(__dirname, "..", "app", "style");
    fs.readdirSync(dir).forEach((f) => {
      const lines = fs.readFileSync(path.join(dir, f), "utf8").split("\n");
      let depth = 0, inC = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        /* 이 줄을 읽기 전의 깊이가 선택자 자리인가를 정한다 */
        const wasSel = (depth === 0 && !inC);
        /* 이 줄이 선택자 조각으로 끝나는가. `{` `}` `;` 로 안 끝나고 비지 않았다 */
        const bare = wasSel && /\S/.test(line) &&
                     !/^\s*\/\*/.test(line) && !/^\s*@/.test(line) &&
                     line.indexOf("{") < 0 && line.indexOf("}") < 0 &&
                     line.indexOf(";") < 0 && !/\*\/\s*$/.test(line);
        /* 깊이를 이 줄만큼 옮긴다. 주석 안의 괄호는 안 센다 */
        let k = 0;
        while (k < line.length) {
          if (inC) { const e = line.indexOf("*/", k); if (e < 0) { k = line.length; }
                     else { inC = false; k = e + 2; } continue; }
          const c = line.indexOf("/*", k);
          const seg = c < 0 ? line.slice(k) : line.slice(k, c);
          for (const ch of seg) { if (ch === "{") depth++; else if (ch === "}") depth--; }
          if (c < 0) break;
          inC = true; k = c + 2;
        }
        if (!bare) continue;
        let j2 = i + 1;
        while (j2 < lines.length && /^\s*$/.test(lines[j2])) j2++;
        if (j2 < lines.length && /^\s*\/\*/.test(lines[j2]))
          fails.push(f + " " + (j2 + 1) + "째 줄: 선택자 가운데에 주석이 온다 (" +
                     lines[i].trim().slice(0, 40) + "). CSS 에게 주석은 빈칸이라 " +
                     "위아래 선택자가 하나로 붙는다");
      }
    });
  }

  /* 5. **인쇄에서 색 토큰이 정말 되돌아왔는가.** 세션 중 짙은 판도 같이 본다 */
  {
    n += 2;
    for (const focus of [false, true]) {
      const got = await page.evaluate((f) => {
        document.body.classList.toggle("session-focus", f);
        const c = getComputedStyle(document.documentElement);
        const out = {};
        ["--bg", "--fg", "--card", "--acc", "--a1t", "--a3t"].forEach((k) => {
          out[k] = c.getPropertyValue(k).trim();
        });
        return out;
      }, focus);
      const where = focus ? "세션 중" : "보통";
      Object.keys(got).forEach((k) => {
        const v = got[k];
        const want = (k === "--bg" || k === "--card") ? "밝" : "짙";
        /* `#fff` 처럼 세 자리로 적은 것도 있다. 여섯 자리만 보다가
           멀쩡한 값 열둘을 실패로 냈다 */
        const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)
          ? (v.length === 4 ? "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3] : v)
          : null;
        const lum = hex
          ? (parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) +
             parseInt(hex.slice(5, 7), 16)) / 3
          : null;
        if (lum === null) { fails.push(where + " 인쇄에서 " + k + " 가 " + v + " 다"); return; }
        if (want === "밝" && lum < 250) fails.push(where + " 인쇄에서 " + k + " 가 " + v + " 다. 흰 종이가 아니다");
        if (want === "짙" && lum > 90) fails.push(where + " 인쇄에서 " + k + " 가 " + v + " 다. 흐리게 찍힌다");
      });
    }
    await page.evaluate(() => document.body.classList.remove("session-focus"));
  }

  /* 6. **종이용으로 넣은 것이 화면에 새어 나오지 않는가.**
     이 검사는 내내 `print` 로만 그렸다. 그러면 화면 쪽은 아무도 안 본다.
     종이 전용 줄이 화면에 뜨면 두 사람은 인쇄를 안 하는데 그 말을 매일 읽는다. */
  {
    n += 3;
    await page.emulateMedia({ media: "screen" });
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const only = [...document.querySelectorAll(".printonly")];
      return { all: only.length,
               shown: only.filter((e) => e.offsetParent !== null).length,
               /* 화면에서는 판 목록이 눌리는 단추여야 한다 */
               btn: [...document.querySelectorAll("#playList button")]
                 .filter((b) => getComputedStyle(b).display === "inline").length,
               nav: document.querySelector("nav") &&
                    getComputedStyle(document.querySelector("nav")).display !== "none" };
    });
    if (!m.all) fails.push("종이 전용 줄이 하나도 없다. 이 판이 아무것도 안 쟀다");
    if (m.shown) fails.push("종이 전용 줄 " + m.shown + "개가 화면에도 뜬다");
    if (m.btn) fails.push("화면에서 판 단추 " + m.btn + "개가 글로 눕는다");
    if (!m.nav) fails.push("화면에서 이동줄이 사라졌다");
  }

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 진짜 프린터에서 그 종이가 쓸 만한가**");
  console.log("인쇄 %d판 (탭 %d개 x 4, 안 찍히는 것 3, 세션 중 4, 접힌 칸 4, 판 목록 2, " +
            "주석 자리 1, 색 토큰 2, 화면에 안 샘 3) / 실패 %d",
              n, TABS.length, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("[실패] 검사가 도중에 멈췄다: " + e.message);
  process.exit(1);
});
