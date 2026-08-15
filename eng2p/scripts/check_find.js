/* 찾기가 정말 찾는가 (T395).
 *
 * 찾는 칸이 미디어 탭 안에 하나 있었고 그것은 52과 제목만 본다.
 * 강의 96편도 카드 600장도 세트 288개도 대본 52편도 못 찾았다.
 * 제일 나쁜 것은 **두 사람이 적은 것**이었다. 그날 칸에만 그려져서
 * 어제 적은 것은 오늘 화면에 안 뜬다. 쉰 주째면 수백 건이다.
 *
 * **적어 두고 다시 못 보면 안 적은 것과 같다.**
 *
 * 재는 것.
 *
 *   1. 우리가 적은 것을 **아무것도 안 읽고** 곧바로 찾는가.
 *      자료를 기다리는 동안에도 그것은 이미 떠 있어야 한다
 *   2. 갈래 넷이 저마다 제 자료에서 찾는가
 *   3. 못 읽은 자료를 밝히는가. 조용히 0건이라고 하면 없는 줄 안다
 *   4. **답을 안 담는가.** 판정형 정답은 A면에만 있다
 *   5. 결과에서 그 자리로 가는가
 *   6. 다그치지 않는가. 건수는 적되 많다 적다를 안 적는다
 *
 * **기계가 안 보는 것: 두 사람이 찾으려는 말로 정말 찾아지는가.**
 * 여기서 재는 것은 있는 말이 걸리는가지 없는 말을 짐작해 주는가가 아니다.
 *
 * 사용법:
 *     node scripts/check_find.js
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
  console.log("찾기 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

const fails = [];
let n = 0;

/* 두 사람이 적어 둔 것. 며칠 전 것이라 오늘 화면에는 안 뜬다 */
const SEED = `
  S.onboarded = true; S.names.a = "가람"; S.names.b = "나래"; S.device = "a";
  var td = today();
  S.days[addDays(td, -3)] = { status: "normal", speak: 40, cards: 7, lre: 2,
    unres: [{ t: "Could you say that again?", i: "again 이 안 들렸다",
              k: "", h: "천천히 다시", w: "되물었다" }], coll: [] };
  S.days[addDays(td, -40)] = { status: "normal", speak: 40, cards: 7, lre: 1,
    unres: [], coll: [{ e: "I am going to be late.", s: "lle1-19", q: "02:11", k: "" }] };
  saveNow();
`;

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });

  async function open(seed) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(PAGE);
    await page.waitForTimeout(600);
    if (seed !== false) await page.evaluate(new Function(SEED));
    await page.evaluate(() => go("find"));
    await page.waitForTimeout(900);
    return { ctx, page };
  }
  async function look(page, q, wait) {
    await page.fill("#fdQ", q);
    await page.waitForTimeout(wait || 2200);
    return page.evaluate(() => {
      const o = document.getElementById("fdOut");
      return { txt: (o.innerText || "").replace(/\s+/g, " "),
               rows: o.querySelectorAll(".fdrow").length,
               go: o.querySelectorAll("button.fdrow[data-go]").length,
               heads: [...o.querySelectorAll("h3")].map((h) => h.innerText.replace(/\s+/g, " ")) };
    });
  }

  /* 1. **우리가 적은 것을 아무것도 안 읽고 곧바로 찾는가.**
     자료 넷이 1MB 다. 그것을 기다리는 동안에도 이것은 떠 있어야 한다. */
  {
    n += 5;
    const { ctx, page } = await open();
    /* **자료가 안 오게 붙든다.** 실패가 아니라 읽는 중이다.
       그동안에도 우리가 적은 것은 이미 떠 있어야 한다. */
    await page.evaluate(() => {
      window.loadScript = function () { /* 안 돌아온다 */ };
      DATA.lectures = null; DATA.cards = null; DATA.sets = null; DATA.transcripts = null;
      FIND_ASKED = {};
    });
    const got = await look(page, "again", 1200);
    if (got.txt.indexOf("Could you say that again?") < 0)
      fails.push("자료를 기다리는 중인데 우리가 적은 것도 안 나온다: " + got.txt.slice(0, 100));
    if (got.txt.indexOf("여는 중이다") < 0)
      fails.push("자료를 기다린다는 말이 없다: " + got.txt.slice(0, 100));
    if (got.txt.indexOf("걸린 것: again 이 안 들렸다") < 0)
      fails.push("적어 둔 곁가지(걸린 것)를 안 보여 준다");
    /* **며칠 전 것이 나와야 한다.** 오늘 화면은 오늘 것만 그린다 */
    if (got.txt.indexOf("미해결 LRE") < 0) fails.push("무엇으로 적은 것인지 갈래를 안 적는다");
    if (!/\d{4}-\d{2}-\d{2}/.test(got.txt)) fails.push("언제 적은 것인지 날을 안 적는다");
    await ctx.close();
  }

  /* 2. 못 읽은 자료를 밝히는가. **조용히 0건이면 없는 줄 안다** */
  {
    n += 4;
    const { ctx, page } = await open();
    await page.evaluate(() => {
      window.loadScript = function (key, src, cb) { failed[key] = true; cb(false); };
      DATA.lectures = null; DATA.cards = null; DATA.sets = null; DATA.transcripts = null;
      FIND_ASKED = {};
    });
    const got = await look(page, "again", 1500);
    if (got.txt.indexOf("못 읽었다") < 0)
      fails.push("자료를 못 읽었는데 그 말이 없다: " + got.txt.slice(0, 140));
    /* **어느 파일이 있어야 하는지 적는다.** 없다고만 하면 할 일이 없다 */
    if (got.txt.indexOf("out/data/") < 0) fails.push("어느 자리가 있어야 하는지 안 적는다");
    /* **두 번째로 칠 때도 말해야 한다** (T395 깸 시험).
       처음 칠 때는 읽으러 가는 길을 지나가면서 그 자리에서 못 읽었다고 적힌다.
       그 다음부터는 읽으러 가지 않고 곧바로 답하는 갈래를 탄다.
       그 갈래가 조용히 0건이면 **두 번째 찾기부터 없는 줄 안다.**
       한 번만 치고 끝내는 검사는 그 갈래를 아예 안 밟는다. */
    const again = await look(page, "Pete", 900);
    if (again.txt.indexOf("못 읽었다") < 0)
      fails.push("다시 쳤더니 못 읽었다는 말이 사라졌다: " + again.txt.slice(0, 140));
    if (/강의 96 0건|카드 600 0건/.test(again.txt))
      fails.push("못 읽은 갈래를 0건이라고 적는다: " + again.txt.slice(0, 120));
    await ctx.close();
  }

  /* 3. 갈래 넷이 저마다 제 자료에서 찾는가 */
  {
    const cases = [
      { q: "again", head: "대본 52", want: "lle1-" },
      { q: "again", head: "카드 600", want: "Q1-" },
      { q: "강세", head: "강의 96", want: "강" },
      { q: "Q1-001", head: "세트 288", want: "세트" },
    ];
    n += cases.length * 2;
    const { ctx, page } = await open();
    for (const c of cases) {
      const got = await look(page, c.q);
      const hd = got.heads.filter((h) => h.indexOf(c.head) === 0)[0];
      if (!hd) { fails.push(c.head + " 갈래가 아예 없다"); continue; }
      /* **건수를 제목에 적는다.** 접혀 있어도 어디 있는지는 알아야 한다 */
      if (!/\d+건/.test(hd)) fails.push(c.head + " 제목에 건수가 없다: " + hd);
      if (/0건/.test(hd))
        fails.push(c.head + " 에서 \"" + c.q + "\" 을 못 찾았다");
      if (got.txt.indexOf(c.want) < 0)
        fails.push(c.head + " 결과에 " + c.want + " 가 없다: " + got.txt.slice(0, 120));
    }
    await ctx.close();
  }

  /* 4. **답을 안 담는가.** 판정형 정답은 A면에만 있다 (기준서 8.1) */
  {
    n += 3;
    const { ctx, page } = await open();
    const got = await look(page, "Pete");
    if (got.rows < 1) fails.push("Pete 로 찾았는데 한 줄도 없다");
    /* **답에만 있고 재료에는 없는 말로 찾는다.**
       처음에는 정답 글이 화면에 그대로 떴는지를 봤다. 그런데 결과 줄은
       120자에서 잘리고 여섯 줄만 보인다. 답을 담아도 잘려 나가서 안 보였다.
       **깸을 심었는데 안 잡혔다.** 담았는지를 재려면 담긴 것만 걸리는 말로
       찾아야 한다. 그 말로 카드가 걸리면 그것은 답에서 걸린 것이다. */
    const probe = await page.evaluate(() => {
      const D = DATA.cards; if (!D) return null;
      const mat = new Set();
      D.items.forEach((x) => {
        ((x.a && x.a.material) || []).forEach((m) => {
          String(m).toLowerCase().split(/[^a-z0-9']+/).forEach((w) => { if (w) mat.add(w); });
        });
        [(x.a && x.a.instruction) || "", (x.b && x.b.instruction) || "",
         (x.a && x.a.note) || "", (x.a && x.a.pass) || ""].forEach((t) => {
          String(t).toLowerCase().split(/[^a-z0-9']+/).forEach((w) => { if (w) mat.add(w); });
        });
      });
      /* 답에만 있는 낱말. 네 글자가 넘는 것으로 고른다 */
      for (let i = 0; i < D.items.length; i++) {
        const a = String((D.items[i].a && D.items[i].a.answer) || "").toLowerCase();
        const ws = a.split(/[^a-z0-9']+/).filter((w) => w.length > 4 && !mat.has(w));
        if (ws.length) return { word: ws[0], id: D.items[i].id };
      }
      return null;
    });
    if (probe === null) fails.push("카드 자료를 못 읽어서 이 판을 못 쟀다");
    else if (!probe.word) fails.push("답에만 있는 낱말을 못 골랐다. 이 판이 아무것도 안 쟀다");
    else {
      const leak = await look(page, probe.word);
      const head = leak.heads.filter((h) => h.indexOf("카드 600") === 0)[0] || "";
      if (!/0건/.test(head))
        fails.push("답에만 있는 \"" + probe.word + "\" 로 카드가 걸린다 (" + probe.id +
                   "). 답이 결과에 샜다: " + head);
    }
    await ctx.close();
  }

  /* 5. 결과에서 그 자리로 가는가. **갈 데가 있는 줄은 단추다** */
  {
    n += 3;
    const { ctx, page } = await open();
    const got = await look(page, "again");
    if (!got.go) fails.push("갈 데가 있는 줄이 하나도 단추가 아니다");
    const moved = await page.evaluate(async () => {
      const b = document.querySelector('button.fdrow[data-go^="l:"]');
      if (!b) return "강의로 가는 줄이 없다";
      b.click();
      await new Promise((ok) => setTimeout(ok, 700));
      const peek = document.querySelector(".peekwrap,#peek,.peek");
      return peek ? "열렸다" : (document.body.className.indexOf("peek") >= 0 ? "열렸다" : "안 열렸다");
    });
    if (moved !== "열렸다") fails.push("강의로 가는 줄을 눌렀는데 " + moved);
    /* 카드도 그 강으로 간다. **번호로 짚는다.** 강의 자료가 있을 때만이다 */
    const card = await page.evaluate(() => {
      const t = document.getElementById("fdOut").innerText;
      return /Q\d-\d+ \S+형 · \d+강/.test(t);
    });
    if (!card) fails.push("카드가 몇 강 것인지 안 적는다");
    await ctx.close();
  }

  /* 6. 다그치지 않는가. 그리고 **0건을 없다고 단정하지 않는가** */
  {
    n += 3;
    const { ctx, page } = await open();
    const short = await page.evaluate(() => {
      const o = document.getElementById("fdOut");
      return (o.innerText || "").replace(/\s+/g, " ");
    });
    /* 안 친 상태에서 0건이라고 적으면 없는 줄 안다 */
    if (/0건|없다\./.test(short) && short.indexOf("두 글자부터") < 0)
      fails.push("아직 안 쳤는데 없다고 적는다: " + short.slice(0, 80));
    const got = await look(page, "zzzqqq");
    if (got.txt.indexOf("여기에는 없다") < 0)
      fails.push("정말 없을 때 없다고 안 적는다: " + got.txt.slice(0, 80));
    /* **다그치지 않는다** (`tone.md`) */
    if (/많다|적다|더 적어|해야 한다|부족/.test(got.txt))
      fails.push("찾기 자리에서 다그친다: " + got.txt.slice(0, 90));
    await ctx.close();
  }

  /* 7. **한 갈래가 화면을 다 먹지 않는가.** 갈래 다섯이 다 펼쳐지면 못 읽는다 */
  {
    n += 3;
    const { ctx, page } = await open();
    await look(page, "the");
    const m = await page.evaluate(async () => {
      const o = document.getElementById("fdOut");
      const first = o.querySelectorAll(".fdrow").length;
      const more = o.querySelector("[data-fm]");
      if (!more) return { first: first, more: false };
      const label = more.innerText;
      more.click();
      await new Promise((ok) => setTimeout(ok, 300));
      return { first: first, more: true, label: label,
               after: document.getElementById("fdOut").querySelectorAll(".fdrow").length };
    });
    if (!m.more) fails.push("결과가 많은데 더 보기가 없다 (" + m.first + "줄)");
    else {
      if (!/\d+건 더 보기/.test(m.label)) fails.push("더 보기에 남은 수가 없다: " + m.label);
      if (!(m.after > m.first)) fails.push("더 보기를 눌렀는데 " + m.first + "줄 그대로다");
    }
    if (m.first > 40) fails.push("처음부터 " + m.first + "줄이 다 펼쳐진다");
    await ctx.close();
  }

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 두 사람이 찾으려는 말로 정말 찾아지는가**");
  console.log("찾기 %d판 (우리가 적은 것 5, 못 읽음 4, 갈래 8, 답 안 샘 3, " +
              "가는 길 3, 말투 3, 자리 3) / 실패 %d", n, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("[실패] 검사가 도중에 멈췄다: " + e.message);
  process.exit(1);
});
