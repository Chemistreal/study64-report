/* 화면 어디에도 두 사람을 견주는 자리가 없는가. T347
 *
 * `docs/gap.md` 1장이 정한 것을 화면에서 잰다.
 *
 *     기준서 2.4 는 진도 격차를 위험으로 보지 않는다.
 *     사람별 표를 만들면 그 표가 곧 격차를 재는 자다.
 *
 * `check_person.py` 는 **코드**를 읽는다. 이것은 **화면**을 읽는다.
 * 코드에 사람별 칸이 없어도 화면에서 이름 옆에 숫자를 붙이면 그것이 견줌이다.
 *
 * ## 어떻게 잰다
 *
 * 화면 열여섯을 다 그리고 **줄마다** 본다.
 *
 *     이름과 숫자가 한 줄에 있으면 그것이 개인 값이다
 *     두 이름이 한 줄에 있고 숫자가 있으면 그것이 견줌이다
 *
 * 사람이 적은 글에는 숫자가 있을 수 있다. 그래서 **아무것도 안 적은 상태**로 잰다.
 * 화면에 뜨는 숫자는 다 앱이 낸 것이다.
 *
 * 사용법:
 *     node scripts/check_versus.js
 *
 * 규격: docs/gap.md
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("견줌 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

const TABS = ["today", "review", "sound", "clip", "media", "play", "src",
              "ledger", "verify", "quarter", "check", "rot", "rules"];

/* 이름을 못 알아보게 짧게 안 짓는다. 두 글자면 딴 낱말에 섞인다. */
const A = "가람이", B = "나래는";

/* 이름 옆에 숫자가 있어도 되는 자리. **하나하나 왜인지를 적는다.**
   까닭을 안 적으면 이 목록이 곧 구멍이다 (T345 에서 배웠다). */
const OK = [
  { re: /A .*B /, why: "오늘의 역할 표시다. A와 B는 자리 이름이지 값이 아니다" },
  { re: /짝수 날|홀수 날/, why: "역할 규칙 설명이다. 날짜지 사람 값이 아니다" },
  { re: /1블록|2블록|3블록|4블록|블록 \d/, why: "블록 번호다" },
  { re: /단계/, why: "세션 단계 번호다" },
];

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
                                         reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(PAGE);
  /* **아무것도 안 적은 상태로 잰다.** 날은 채우되 사람이 적는 칸은 다 비운다.
     그러면 화면에 뜨는 숫자가 다 앱이 낸 것이다. */
  await page.evaluate((n) => {
    S.onboarded = true; S.names.a = n.a; S.names.b = n.b;
    S.days = {}; let k = 0, c = 0;
    while (c < 19 * 6) {
      const d = addDays(today(), -k);
      if (parseISO(d).getDay() !== 0) {
        S.days[d] = { status: "normal", speak: 70, cards: 70, lre: 9,
                      unres: [], coll: ["a", "b", "c"], one: true };
        c++;
      }
      k++;
    }
    S.start = addDays(today(), -k);
    S.q = { Q1: { pass: {}, relOpen: 1, rxAt: today(), rel: {
      a: { share: "7대 3 넘음", lead: "비슷", fix: "A에서 B로만", ask: "비슷" },
      b: { share: "비슷", lead: "비슷", fix: "A에서 B로만", ask: "비슷" } } } };
    S.voice = { w01: { file: "eng2p_voice_w01_2026-01-01.webm", at: "2026-01-01" },
                w12: { file: "eng2p_voice_w12_2026-04-01.webm", at: "2026-04-01" } };
    S.wchk = { 25: { cause: "", lre: "", coll: "", first: "", block: "",
                     odd: "", ask: "다시 짜고 싶다", done: false } };
    saveNow();
  }, { a: A, b: B });
  await page.reload();
  await page.waitForTimeout(700);

  const fails = [];
  const no = (m) => fails.push(m);

  const NUM = /\d/;
  const grab = async (where) => {
    const txt = await page.evaluate(() => document.body.innerText);
    txt.split("\n").forEach((line) => {
      const s = line.trim();
      if (!s) return;
      const hasA = s.indexOf(A) >= 0, hasB = s.indexOf(B) >= 0;
      if (!hasA && !hasB) return;
      if (!NUM.test(s)) return;
      const ok = OK.filter((x) => x.re.test(s))[0];
      if (ok) return;
      if (hasA && hasB)
        no(where + ": 두 사람 이름과 숫자가 한 줄에 있다. 그것이 견줌이다: " +
           s.slice(0, 60));
      else
        no(where + ": 사람 이름 옆에 숫자가 있다. 그것이 개인 값이다: " +
           s.slice(0, 60));
    });
  };

  let seen = 0;
  for (const t of TABS) {
    await page.evaluate((x) => go(x), t);
    await page.waitForTimeout(600);
    await grab(t + " 탭");
    seen++;
  }
  /* 세션 중 화면 넷도 본다. 두 사람이 제일 오래 보는 자리다 */
  await page.evaluate(() => go("today"));
  await page.click("#tOne");
  await page.waitForTimeout(500);
  await grab("세션중");
  seen++;
  for (let i = 1; i < 4; i++) {
    await page.evaluate((k) => gotoBlock(k), i);
    await page.waitForTimeout(500);
    await grab("블록" + (i + 1));
    seen++;
  }

  /* **빼는 목록이 살아 있는가.** 한 줄도 안 걸리는 규칙은 낡은 것이다 */
  const dead = [];
  const body = await page.evaluate(() => document.body.innerText);
  OK.forEach((x) => { if (!x.re.test(body)) dead.push(String(x.re)); });
  if (dead.length > 2)
    no("빼는 규칙 " + dead.length + "개가 한 줄도 안 맞는다: " + dead.join(" "));

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 두 사람이 머릿속으로 견주는가**");
  console.log("견줌 %d판 (화면 %d개 x 1, 빼는 목록 1) / 실패 %d",
              seen + 1, seen, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
