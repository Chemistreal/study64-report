/* 말투 전수 (T386). `docs/tone.md` 가 원본이다.

   로드맵 12.5.2 가 Headspace 에서 하나만 가져왔다. **다그치지 않는다.**
   그런데 그 원칙이 코드 주석에만 쌓였다.

       /* 같은 사실을 두 가지로 적을 수 있으면 안 다그치는 쪽을 고른다 * /
       ... '<span class="warn">달력보다 3주 밀렸다</span>'

   **원칙을 주석에 적고 글은 안 고쳤다.** 바로 밑줄이었다.

   ## 코드가 아니라 화면을 훑는다

   주석에 그 말이 있는 것은 상관없다. 오히려 있어야 한다.
   없앤 말을 설명하려면 그 말을 적어야 한다.
   `check_app.py` 가 코드에서 재고 이것은 화면에서 잰다.

   ## 예외를 넓히지 않는다

   금지가 넓으면 필요한 말까지 막는다. `tone.md` 4장이 세 자리를 적었고
   그 밖은 없다. 늘리려면 문서에 줄을 넣어야 한다.

   돌리는 법:

       NODE_PATH=... CHROMIUM_PATH=... node scripts/check_tone.js
*/
const fs = require("fs");
const path = require("path");

const HERE = path.resolve(__dirname, "..");
const PAGE = "file://" + path.join(HERE, "..", "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

if (!fs.existsSync(CHROME)) {
  console.log("말투 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { console.log("말투 검사를 안 돌렸다. 통과가 아니다."); process.exit(0); }

/* 다그치는 말 갈래 다섯. `tone.md` 2장이 같은 표다.
   **칭찬도 한 갈래다.** 칭찬이 있으면 없을 때가 못한 것이 된다 */
const KINDS = [
  /* **시키는 꼴만 잡는다.** "서두르면 거꾸로다" 는 다그치지 말라는 말이다.
     넓게 잡으면 금지를 적은 문장 자체가 걸린다 (T376 과 같은 자리) */
  { k: "서두름", ws: ["서둘러", "서두르자", "빨리 해라", "늦었다"] },
  { k: "죄책감", ws: ["아깝다", "잃었다", "아쉽다", "후회"] },
  { k: "못한 것 세기", ws: ["밀렸다", "빠뜨렸", "못 한 것이", "안 한 것이"] },
  { k: "명령", ws: ["하세요", "합시다", "해야 합니다", "하십시오"] },
  { k: "들뜸", ws: ["대단하다", "훌륭하다", "최고다", "완벽하다"] },
];

/* 부정 꼴이 같이 든 줄은 뺀다. **금지를 적은 문장 자체가 걸린다** (T376 과 같다) */
const NOT = /안 |못 |않|아니|없/;

/* 탭 열셋. `#t-<이름>` 이 그 자리다 */
const TABS = ["today", "review", "sound", "clip", "media", "find", "src", "ledger",
              "verify", "quarter", "check", "rot", "play", "rules"];

const fails = [];
const no = (m) => fails.push(m);
let seen = 0;

function scan(lines, where) {
  (lines || []).forEach((ln) => {
    const s = String(ln).trim();
    if (!s) return;
    seen++;
    if (NOT.test(s)) return;
    KINDS.forEach((g) => {
      g.ws.forEach((w) => {
        if (s.indexOf(w) >= 0)
          no(where + " 가 다그친다 (" + g.k + "): " + s.slice(0, 60));
      });
    });
    /* **느낌표를 안 쓴다.** 이 프로젝트 문체에 없다 (CLAUDE.md 절대 규칙).
       영어 줄은 뺀다. **VOA 대본 제목은 내가 쓴 글이 아니다.**
       원문을 고치면 그것은 자료를 바꾸는 일이다 (`Lesson 25: Watch Out!`). */
    /* **느낌표 바로 앞 글자를 본다.** 한 줄에 한글이 있는지만 보면
       영어 대본 줄에 붙은 줄 번호 때문에 원문이 다 걸린다 */
    if (/[가-힣][)"'\s]*!/.test(s))
      no(where + " 에 느낌표가 있다: " + s.slice(0, 60));
  });
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(PAGE);
  await page.evaluate(() => {
    localStorage.clear();
    S.onboarded = true; S.names.a = "가람"; S.names.b = "나래"; S.device = "a";
    saveNow();
  });
  await page.reload();
  await page.waitForTimeout(700);

  /* **innerText 는 한 덩어리로 나온다.** 덮개 전체가 한 줄이라
     그 안에 든 부정어 하나가 줄 전체를 걸러 냈다. 진짜 다그침을 놓쳤다.
     요소마다 따로 뽑는다. 짧은 것만 센다. 큰 덩어리는 어차피 조각으로 다시 온다. */
  await page.addInitScript(() => {
    window.__lines = (sel) => {
      const root = document.querySelector(sel);
      if (!root || root.hidden) return null;
      const out = [];
      root.querySelectorAll("*").forEach((e) => {
        const t = (e.textContent || "").replace(/\s+/g, " ").trim();
        if (t && t.length <= 120) out.push(t);
      });
      return out;
    };
  });
  await page.reload();
  await page.waitForTimeout(700);

  /* **밀린 자리를 만들어 놓고 본다.** 밀림이 0이면 그 글이 아예 안 뜬다.
     안 뜨는 채로 훑으면 다그치는 글이 있어도 못 잡는다 (`split.md` 와 같다). */
  await page.evaluate(() => {
    const iso = (d) => d.toISOString().slice(0, 10);
    const back = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };
    S.start = back(200);
    S.days = {};
    for (let i = 200; i > 100; i--) {
      const d = back(i);
      if (new Date(d).getDay() !== 0)
        S.days[d] = { status: "normal", speak: 0, cards: 0, lre: 0, unres: [], coll: [] };
    }
    saveNow();
  });
  await page.reload();
  await page.waitForTimeout(900);

  for (const t of TABS) {
    const txt = await page.evaluate(async (x) => {
      go(x);
      await new Promise((ok) => setTimeout(ok, 900));
      return window.__lines("#t-" + x);
    }, t);
    if (txt === null) { no("탭 " + t + " 이 없다"); continue; }
    scan(txt, "탭 " + t);
  }

  /* 눌러야 열리는 덮개 셋. **탭만 열면 안 뜬다** (`split.md` 와 같은 자리).
     길 지도가 그 자리였다. 밀림 글이 거기 있는데 훑기가 못 닿았다. */
  const PEEKS = [
    ["길 지도", () => { PEEKMAP = true; renderBlockPane(); }],
    ["강의 미리 보기", () => { PEEKMAP = false; PEEKLEC = 1; renderBlockPane(); }],
    ["블록 미리 보기", () => { PEEKLEC = null; PEEK = 0; renderBlockPane(); }],
  ];
  for (let i = 0; i < PEEKS.length; i++) {
    const txt = await page.evaluate(async (n) => {
      go("today");
      await new Promise((ok) => setTimeout(ok, 400));
      if (n === 0) { PEEKMAP = true; PEEKLEC = null; PEEK = null; }
      if (n === 1) { PEEKMAP = false; PEEKLEC = 1; PEEK = null; }
      if (n === 2) { PEEKMAP = false; PEEKLEC = null; PEEK = 0; }
      renderBlockPane();
      await new Promise((ok) => setTimeout(ok, 600));
      return window.__lines("#blockPane");
    }, i);
    if (txt === null) { no("덮개 " + PEEKS[i][0] + " 가 안 열린다"); continue; }
    scan(txt, "덮개 " + PEEKS[i][0]);
  }

  /* 판 스물도 연다. **판 화면에도 같은 말투가 걸린다** */
  const plays = await page.evaluate(() => PLAYS.map((p) => p.id));
  for (const id of plays) {
    const txt = await page.evaluate(async (x) => {
      go("play");
      await new Promise((ok) => setTimeout(ok, 400));
      PLAY.at = x; renderPlayTab();
      await new Promise((ok) => setTimeout(ok, 700));
      return window.__lines("#t-play");
    }, id);
    if (txt === null) { no("판 " + id + " 자리가 없다"); continue; }
    scan(txt, "판 " + id);
  }

  /* **밀림이 정말 만들어졌는가.** 안 만들어졌으면 위 훑기가 반쪽이다 */
  const behind = await page.evaluate(() => plan().behind);
  if (!(behind > 0)) no("밀린 자리를 못 만들었다. behind 가 " + behind + " 다");

  /* ---- 문서가 같은 표를 드는가 ------------------------------------------- */
  const doc = fs.readFileSync(path.join(HERE, "docs", "tone.md"), "utf8");
  KINDS.forEach((g) => {
    if (doc.indexOf("| " + g.k + " |") < 0) no("tone.md 2장에 갈래 " + g.k + " 가 없다");
  });
  /* **예외를 넓히지 않는다.** 세 자리뿐이다 */
  const ex = (doc.split("## 4.")[1] || "").split("## 5.")[0];
  const rows = (ex.match(/^\| .+ \| .+ \|$/gm) || []).length;
  if (rows !== 4) no("tone.md 4장 예외가 " + (rows - 1) + "개다. 셋이어야 한다");
  if (doc.indexOf("같은 사실을 두 가지로 적을 수 있으면") < 0)
    no("tone.md 3장에 무엇을 대신 적는지의 규칙이 없다");

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 다그치지 않는데 차갑게 읽히는가**");
  console.log("말투 %d판 (탭 %d, 덮개 3, 판 %d, 줄 %d개를 훑었다, 밀림 1, 문서 %d) / 실패 %d",
              TABS.length + 3 + plays.length + 1 + KINDS.length + 2,
              TABS.length, plays.length, seen, KINDS.length + 2, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
