/* 게임이 받을 1년치. 세션 288개 (`docs/game.md`).
 *
 * **게임은 그날 할 일을 스스로 정하지 않는다.** 이 파일을 받아서 그린다.
 *
 * 그날 강과 세트와 카드와 녹음과 판을 정하는 셈이 앱에 있다 (`plan()`,
 * `roundPick`, 판마다의 덱 함수). 그것을 언리얼 C++ 로 다시 짜면 두 벌이 되고
 * 언젠가 어긋난다. 두 벌을 들었다가 어긋난 일을 이 저장소가 여러 번 겪었다
 * (T396 글쇠 목록, T413~T415 검사기의 거울).
 *
 * 그래서 **앱을 브라우저로 띄워 288세션을 하루씩 걷고 앱의 함수를 그대로 부른다.**
 * 앱이 내는 값이 곧 게임이 받는 값이다.
 *
 * ## 덱을 미리 뽑는다
 *
 * 두 PC 가 같은 파일을 읽으니 망으로 맞추지 않아도 둘이 같은 덱을 본다.
 * 덱은 세션 번호로 정해진다 (T410~T412 의 되짚기). 시작일을 하나로 박아도
 * 같은 세션에는 같은 덱이 간다.
 *
 * **미리 못 뽑는 것이 하나 있다.** 어제 그거(`recall`)는 두 사람이 실제로
 * 막힌 카드에서 덱을 짠다. 기록이 있어야 정해진다. 그 판은 게임이 그날 짠다.
 *
 * 무대는 `docs/game.md` 4장 표에서 읽는다. **여기 안 적는다.**
 *
 * **기계가 안 보는 것: 그 장면에서 두 사람이 영어를 입 밖에 내는가.**
 *
 * 사용법:
 *     node scripts/derive_game.js
 *
 * 결과: out/game/sessions.json
 */
const path = require("path");
const fs = require("fs");

const HERE = path.resolve(__dirname, "..");
const ROOT = path.resolve(HERE, "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const DOC = path.join(HERE, "docs", "game.md");
const OUT = path.join(HERE, "out", "game");
const START = "2026-08-10";

let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) {
  console.log("[실패] playwright 를 못 찾았다. 게임 세션을 못 뽑았다");
  process.exit(1);
}

/* 무대 표. **문서가 원본이다.** 못 읽으면 실패로 낸다 */
function stages() {
  const src = fs.readFileSync(DOC, "utf8");
  const out = {};
  /* 블록마다 장소가 하나다. **두 사람이 늘 같이 있다** (2026-10-07) */
  const re = /^\| (Q\d) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|\s*$/gm;
  let m;
  while ((m = re.exec(src))) {
    out[m[1]] = { stage: m[2].trim(),
                  places: { "1": m[3].trim(), "2": m[4].trim(),
                            "3": m[5].trim(), "4": m[6].trim() } };
  }
  return out;
}

/* 판마다 그날 덱을 내는 함수. **앱의 함수를 그대로 부른다.**
   앱에 없는 셈을 여기 짓지 않는다. 그러면 검사기가 앱의 거울을 들었던
   그 자리가 이번에는 게임 쪽에서 난다. */
const DECKS = {
  mirror: "mirItems(MIR.n)", swapline: "swpItems()", hearme: "hrmItems()",
  relay: "rlyItems()", chain: "chnPool()", twohalf: "twhItems()",
  overlap: "[ovlTarget()]", ladder: "[ladPiece()]", wall: "walDeck()",
  rebound: "rbdPool()", onesee: "oneDeck()", wave: "[wavPiece()]",
  whose: "whoDeck()", reask: "rskLines()", cutin: "cutShow()",
  clash: "clsRows()", flip: "flpDeck()", apart: "[aptItem()]",
};
const KEYS = ["chunks", "halves", "listen", "pairs", "reask", "relay", "situ", "swaps",
              "transcripts", "wall", "whose", "flip", "cards", "cutin", "clash",
              "apart", "ladder", "wave", "onepick"];

(async () => {
  const ST = stages();
  const need = ["Q1", "Q2", "Q3", "Q4"].filter((q) => !ST[q]);
  if (need.length) {
    console.log("[실패] docs/game.md 4장 무대 표에서 " + need.join(" ") + " 줄을 못 읽었다");
    process.exit(1);
  }
  if (!fs.existsSync(CHROME)) {
    console.log("[실패] 크로미움을 못 찾았다: " + CHROME);
    process.exit(1);
  }

  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  let perr = null;
  page.on("pageerror", (e) => { if (!perr) perr = e.message; });
  await page.goto(PAGE);
  await page.waitForFunction(() => typeof plan === "function", null, { timeout: 15000 });
  await page.fill("#obA", "가람");
  await page.fill("#obB", "나래");
  await page.click("#obGo");
  await page.waitForTimeout(400);

  const got = await page.evaluate(async (args) => {
    const [DECKS, KEYS, START] = args;
    await new Promise((r) => loadScript("plays", "eng2p/out/app/plays.js", r));
    await new Promise((r) => needAllWeeks(r));
    for (const k of KEYS)
      await new Promise((r) => loadData(k, "ENG2P_" + k.toUpperCase(), () => r()));
    S.start = START; S.device = "a"; S.days = {};
    const cards = (DATA.cards && DATA.cards.items) || [];
    const picks = ((DATA.onepick && DATA.onepick.days) || []);
    /* 덱의 낱. **카드는 번호만 담는다.** 글은 `out/data` 에 있고 게임이 거기서 읽는다.
       같은 글을 두 곳에 실으면 한쪽만 고치는 날이 온다. */
    const item = (x) => (x && typeof x === "object" && x.id) ? x.id : x;
    const real = window.today;
    const out = [], miss = {};
    let d = START;
    for (let i = 0; i < 400 && out.length < 288; i++) {
      window.today = () => d;
      S.rhit = {};
      const pl = plan();
      const L = pl.lectureNo;
      const row = {
        s: pl.session, week: pl.week, day: pl.day, quarter: pl.quarter,
        track: pl.track || null, lecture: L, set: pl.set || null,
        media: pl.media || null, emergency: pl.emergency || null,
        cards: cards.filter((c) => pl.cards && c.quarter === pl.quarter &&
                              c.no >= pl.cards.from && c.no <= pl.cards.to).map((c) => c.id),
        pick: (picks[pl.session - 1] || {}).pick || null,
        decks: {},
      };
      for (const id in DECKS) {
        try {
          const v = eval(DECKS[id]);
          const list = (v || []).filter((x) => x != null).map(item);
          if (list.length) row.decks[id] = list;
        } catch (e) { if (!miss[id]) miss[id] = String(e).slice(0, 80); }
      }
      out.push(row);
      S.days[d] = { status: "normal", speak: 40, cards: 7, lre: 2, unres: [], coll: [] };
      d = addDays(d, 1);
      if (parseISO(d).getDay() === 0) d = addDays(d, 1);
    }
    window.today = real;
    const blocks = ((IDX && IDX.blocks) || []);
    return { sessions: out, miss: miss, blocks: blocks,
             roleRule: (IDX && IDX.roleRule) || null };
  }, [DECKS, KEYS, START]);
  await browser.close();

  if (perr) { console.log("[실패] 앱이 오류를 냈다: " + perr); process.exit(1); }
  const missed = Object.keys(got.miss);
  if (missed.length) {
    missed.forEach((k) => console.log("[실패] " + k + " 덱을 못 뽑았다: " + got.miss[k]));
    process.exit(1);
  }

  /* **블록 넷 다 같이 하고 같이 말한다** (2026-10-07, 개정문 20번).
     앱의 블록 표는 기준서 2.3 그대로라 블록 1 이 대화 금지다. 게임은 그것을 깼다.
     그 값을 여기서 덮는다. 앱 쪽 표는 기준서가 바뀌기 전에는 그대로 둔다. */
  got.blocks = (got.blocks || []).map((b) => Object.assign({}, b, { together: true, talk: true }));

  got.sessions.forEach((r) => {
    const st = ST[r.quarter];
    r.stage = st.stage;
    r.places = st.places;
  });

  const obj = {
    note: "게임이 받을 1년치 세션. 앱을 띄워 288세션을 걷고 앱의 셈을 그대로 불러 뽑는다. " +
          "손으로 안 고친다. scripts/derive_game.js 를 다시 돌린다.",
    grade: "B",
    gradeWhy: "덱이 담은 영어는 판 자료가 진 등급을 그대로 진다. 판 자료 중 B등급이 있다.",
    generator: "scripts/derive_game.js",
    source: "english.html 의 plan() 과 판마다의 덱 함수, out/data, docs/game.md 4장",
    start: START,
    roleRule: got.roleRule,
    runtime: { recall: "두 사람이 막힌 카드에서 짠다. 기록이 있어야 정해져서 미리 못 뽑는다" },
    blocks: got.blocks.length ? got.blocks : null,
    count: got.sessions.length,
    sessions: got.sessions,
  };
  fs.mkdirSync(OUT, { recursive: true });
  const txt = JSON.stringify(obj, null, 1) + "\n";
  fs.writeFileSync(path.join(OUT, "sessions.json"), txt);
  console.log("out/game/sessions.json / 세션 " + obj.count + "개 / " +
              Math.round(txt.length / 1024) + "KB / 판 덱 " + Object.keys(DECKS).length +
              "개를 미리 뽑았다 (어제 그거는 그날 짠다)");
})().catch((e) => {
  console.log("[실패] 게임 세션을 뽑다가 멈췄다: " + e.message);
  process.exit(1);
});
