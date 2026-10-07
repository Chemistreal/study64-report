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
 * ## 개정문 24 25 26 (2026-10-07)
 *
 * **간격 복습 덱** (`review`). 세션마다 그날 다시 낼 카드다. 앱의 `dueCards()` 와
 * `markCardRun()` 을 288세션 동안 그대로 불러 뽑는다. 다 맞혔다고 치고 뽑은 명목 일정이다.
 * 사다리는 앱의 `SPACING` 이고 기준서 8.4 와 같은지는 `check_game.py` 가 본다.
 *
 * **다지기 주** (`consolidate`). 기준서 2.5 가 정한 주에는 새 강이 없다.
 * 그 주의 강 두 편은 앞의 두 주로 당긴다. 그 두 주는 세 편이고 한 편이 두 세션이다.
 * **세트는 안 옮긴다.** 세트는 하루 하나라 그 날 그대로 두면 다지기 주가 앞 강 세트를 돈다.
 * 다지기 주의 날마다 그 분기 앞 강 둘을 다시 짠다 (`revisit`).
 * 이 옮김은 앱의 `plan()` 에 없다. 앱 화면은 옛 차례 그대로다. **게임만 이 차례를 받는다.**
 * 덱은 옮긴 차례로 뽑는다. 그 동안 `plan` 을 옮긴 값으로 바꿔 끼우고 앱 함수를 부른다.
 *
 * **다시 말하기** (`retell`). 블록 4 의 4/3/2. 초는 기준서 2.3 문장에서 읽는다.
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
const SPEC = path.join(HERE, "docs", "spec.md");
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

/* 기준서에서 읽는 값 둘. **여기 숫자를 안 적는다.** 기준서가 원본이다.
   다지기 주 (2.5) 와 블록 4 다시 말하기 초 (2.3). 못 읽으면 실패로 낸다 */
function specRules() {
  const src = fs.readFileSync(SPEC, "utf8");
  const cm = src.match(/다지기 주는 ([\d, ]+)주다/);
  const rm = src.match(/한 사람이 (\d+)분, (\d+)분, (\d+)분 세 번 말한다/);
  const qm = src.match(/Q1 은 (\d+)초, (\d+)초, (\d+)초다/);
  if (!cm || !rm || !qm) return null;
  return {
    consol: cm[1].split(",").map((x) => +x.trim()).filter((x) => x),
    retell: { Q1: [+qm[1], +qm[2], +qm[3]],
              rest: [+rm[1] * 60, +rm[2] * 60, +rm[3] * 60] },
  };
}

/* 다지기 주 옮김. 288세션의 원래 plan() 을 받아 세션마다 어느 강의 값을 쓸지 낸다.
   **세트와 날짜와 덱 씨앗은 그 세션 것 그대로다.** 강과 카드와 녹음과 비상판만 옮긴다.

   다지기 주 w 의 앞 두 주(w-2, w-1)에 강 여섯(w-2, w-1, w 의 것)을 두 세션씩 놓는다.
   다지기 주의 날 k 는 그 분기 k*2-1 번째와 k*2 번째 강을 다시 짠다. 블록 1 녹음은 앞 강 것이다. */
function layout(base, consol) {
  const lay = base.map((b, i) => ({ src: i, consolidate: false, revisit: null }));
  const first = {};
  base.forEach((b, i) => { if (b.lectureNo != null && first[b.lectureNo] == null) first[b.lectureNo] = i; });
  const at = (wk, d) => (wk - 1) * 6 + (d - 1);
  const err = [];
  for (const w of consol) {
    if (w < 3 || w > 48) { err.push(w + "주는 다지기 주가 될 수 없다"); continue; }
    const q = base[at(w, 1)].quarter;
    let qs = w;
    while (qs > 1 && base[at(qs - 1, 1)].quarter === q) qs--;
    if (w - 2 < qs) { err.push(w + "주 앞에 같은 분기 주가 둘 없다"); continue; }
    const lecs = (from, to) => {
      const out = [];
      for (let wk = from; wk <= to; wk++)
        for (let d = 1; d <= 6; d++) {
          const L = base[at(wk, d)].lectureNo;
          if (L != null && out.indexOf(L) < 0) out.push(L);
        }
      return out;
    };
    const six = lecs(w - 2, w), mine = lecs(qs, w);
    if (six.length !== 6 || mine.length < 12) {
      err.push(w + "주 둘레 강이 " + six.length + "편, 분기 앞 강이 " + mine.length + "편이다");
      continue;
    }
    for (let j = 0; j < 12; j++)
      lay[at(w - 2, 1) + j] = { src: first[six[Math.floor(j / 2)]], consolidate: false, revisit: null };
    for (let d = 1; d <= 6; d++)
      lay[at(w, d)] = { src: first[mine[2 * d - 2]], consolidate: true,
                        revisit: [mine[2 * d - 2], mine[2 * d - 1]] };
  }
  return { lay: lay, err: err };
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
  const SR = specRules();
  if (!SR) {
    console.log("[실패] docs/spec.md 에서 다지기 주(2.5)나 다시 말하기 초(2.3)를 못 읽었다");
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

  /* 첫 걸음. **앱의 원래 차례**를 288세션 받는다. 옮김은 이것을 보고 정한다 */
  const first = await page.evaluate(async (args) => {
    const [KEYS, START] = args;
    await new Promise((r) => loadScript("plays", "eng2p/out/app/plays.js", r));
    await new Promise((r) => needAllWeeks(r));
    for (const k of KEYS)
      await new Promise((r) => loadData(k, "ENG2P_" + k.toUpperCase(), () => r()));
    S.start = START; S.device = "a"; S.days = {};
    const real = window.today;
    const base = [], dates = [];
    let d = START;
    for (let i = 0; i < 400 && base.length < 288; i++) {
      window.today = () => d;
      base.push(JSON.parse(JSON.stringify(plan())));
      dates.push(d);
      S.days[d] = { status: "normal", speak: 40, cards: 7, lre: 2, unres: [], coll: [] };
      d = addDays(d, 1);
      if (parseISO(d).getDay() === 0) d = addDays(d, 1);
    }
    window.today = real;
    return { base: base, dates: dates, ladder: (window.SPACING || []).slice() };
  }, [KEYS, START]);

  const LY = layout(first.base, SR.consol);
  if (LY.err.length) {
    LY.err.forEach((m) => console.log("[실패] 다지기 주를 못 놓았다: " + m));
    process.exit(1);
  }

  /* 둘째 걸음. 옮긴 차례로 다시 걷는다. `plan` 을 옮긴 값으로 바꿔 끼우고
     덱과 간격 복습을 **앱 함수로** 뽑는다. 카드는 다 돌았다고 친다 (명목 일정) */
  const got = await page.evaluate(async (args) => {
    const [DECKS, START, base, dates, lay] = args;
    const cards = (DATA.cards && DATA.cards.items) || [];
    const picks = ((DATA.onepick && DATA.onepick.days) || []);
    const item = (x) => (x && typeof x === "object" && x.id) ? x.id : x;
    const idsOf = (p) => cards.filter((c) => p && p.cards && c.quarter === p.quarter &&
                                      c.no >= p.cards.from && c.no <= p.cards.to).map((c) => c.id);
    const real = window.today, realPlan = window.plan;
    const realSave = window.save, realNow = window.saveNow;
    /* 600장 x 288일을 적는다. 저장은 안 한다. 걷는 동안만 막고 돌려놓는다 */
    window.save = () => {}; window.saveNow = () => {};
    S.start = START; S.device = "a"; S.days = {}; S.cardDue = {};
    const out = [], miss = {};
    for (let i = 0; i < 288; i++) {
      const d = dates[i];
      window.today = () => d;
      S.rhit = {};
      const own = realPlan();
      const L = lay[i], src = base[L.src];
      const pl = Object.assign({}, own, {
        lectureNo: src.lectureNo, title: src.title, track: src.track,
        cards: src.cards, media: src.media, emergency: src.emergency });
      window.plan = () => pl;
      /* 오늘 카드. 다지기 주는 새 카드가 없고 다시 짜는 강 둘의 카드를 돈다 */
      let todays = idsOf(pl);
      if (L.consolidate) {
        todays = [];
        L.revisit.forEach((n) => {
          const b = base.find((x) => x.lectureNo === n);
          todays = todays.concat(idsOf(b));
        });
      }
      const set = {}; todays.forEach((k) => { set[k] = 1; });
      const review = dueCards().filter((k) => !set[k]).sort();
      const row = {
        s: own.session, date: d, week: own.week, day: own.day, quarter: own.quarter,
        consolidate: !!L.consolidate,
        track: L.consolidate ? null : (pl.track || null),
        lecture: L.consolidate ? null : pl.lectureNo,
        revisit: L.consolidate ? L.revisit : null,
        set: own.set || null,
        media: pl.media || null, emergency: pl.emergency || null,
        cards: todays, review: review,
        pick: (picks[own.session - 1] || {}).pick || null,
        decks: {},
      };
      for (const id in DECKS) {
        try {
          const v = eval(DECKS[id]);
          const list = (v || []).filter((x) => x != null).map(item);
          if (list.length) row.decks[id] = list;
        } catch (e) { if (!miss[id]) miss[id] = String(e).slice(0, 80); }
      }
      todays.concat(review).forEach((k) => markCardRun(k, pl.lectureNo));
      window.plan = realPlan;
      out.push(row);
      S.days[d] = { status: "normal", speak: 40, cards: 7, lre: 2, unres: [], coll: [] };
    }
    window.today = real; window.plan = realPlan;
    window.save = realSave; window.saveNow = realNow;
    const blocks = ((IDX && IDX.blocks) || []);
    return { sessions: out, miss: miss, blocks: blocks,
             roleRule: (IDX && IDX.roleRule) || null };
  }, [DECKS, START, first.base, first.dates, LY.lay]);
  await browser.close();

  if (perr) { console.log("[실패] 앱이 오류를 냈다: " + perr); process.exit(1); }
  const missed = Object.keys(got.miss);
  if (missed.length) {
    missed.forEach((k) => console.log("[실패] " + k + " 덱을 못 뽑았다: " + got.miss[k]));
    process.exit(1);
  }
  if (first.ladder.length < 2) {
    console.log("[실패] 앱에서 간격 사다리(SPACING)를 못 읽었다");
    process.exit(1);
  }

  /* **블록 넷 다 같이 하고 같이 말한다** (2026-10-07, 개정문 20번).
     앱의 블록 표는 기준서 2.3 그대로라 블록 1 이 대화 금지다. 게임은 그것을 깼다.
     그 값을 여기서 덮는다. 앱 쪽 표는 기준서가 바뀌기 전에는 그대로 둔다.
     블록 4 는 다시 말하기로 연다 (개정문 25). */
  got.blocks = (got.blocks || []).map((b) => Object.assign({}, b, { together: true, talk: true },
                                                            b.no === 4 ? { retell: true } : {}));

  /* 다시 말하기. 그 주 이야기를 그날까지. 두 사람이 각자 세 번 */
  got.sessions.forEach((r) => {
    const st = ST[r.quarter];
    r.stage = st.stage;
    r.places = st.places;
    const secs = r.quarter === "Q1" ? SR.retell.Q1 : SR.retell.rest;
    r.retell = { story: r.week, secs: secs.slice(), each: true, together: true,
                 total: 2 * secs.reduce((a, b) => a + b, 0) };
  });

  /* 1년에 몇 번 나오나. **다섯 번이 안 되는 카드는 숨기지 않고 적는다** (기준서 8.4) */
  const seen = {};
  got.sessions.forEach((r) => r.cards.concat(r.review).forEach((k) => { seen[k] = (seen[k] || 0) + 1; }));
  const carry = Object.keys(seen).filter((k) => seen[k] < 5).sort();

  const obj = {
    note: "게임이 받을 1년치 세션. 앱을 띄워 288세션을 걷고 앱의 셈을 그대로 불러 뽑는다. " +
          "손으로 안 고친다. scripts/derive_game.js 를 다시 돌린다.",
    grade: "B",
    gradeWhy: "덱이 담은 영어는 판 자료가 진 등급을 그대로 진다. 판 자료 중 B등급이 있다.",
    generator: "scripts/derive_game.js",
    source: "english.html 의 plan() 과 dueCards() 와 markCardRun() 과 판마다의 덱 함수, " +
            "out/data, docs/game.md 4장, docs/spec.md 2.3 2.5 8.4",
    start: START,
    dateNote: "date 는 시작일에서 쉬는 날 없이 걸은 명목 날짜다. 간격 복습을 이 날짜로 뽑았다",
    roleRule: got.roleRule,
    runtime: {
      recall: "두 사람이 막힌 카드에서 짠다. 기록이 있어야 정해져서 미리 못 뽑는다",
      review: "review 는 다 맞혔다고 치고 뽑은 명목 일정이다. 못 한 카드는 spacing 규칙으로 날짜를 다시 잡는다",
    },
    spacing: {
      ladder: first.ladder,
      up: "제 날이나 그 뒤에 돌면 한 칸 오른다. 다음 날짜는 그날에 새 칸의 날수를 더한 날이다",
      down: "못 하면 한 칸 내린다. 맨 아래 칸은 1일이다",
      early: "제 날 전에 돈 것은 칸을 안 올린다",
      top: "맨 위 칸(120일)을 돌면 끝난다",
      minAppear: 5,
    },
    carry: carry,
    carryNote: "1년 안에 다섯 번이 안 되는 카드. 마지막 주에 처음 나와 사다리가 1년 밖으로 나간다. 2년차 첫 주에 돈다",
    consolidation: {
      weeks: SR.consol,
      rule: "새 강이 없다. 그 주 강 두 편은 앞의 두 주로 당긴다. 날마다 그 분기 앞 강 둘(revisit)을 다시 짠다. 세트는 그 날 것 그대로다",
    },
    shortDay: {
      minutes: 45, together: true,
      parts: [{ what: "review", minutes: 25 }, { what: "retell", minutes: 20 }],
      session: false,
      note: "2시간을 못 내는 날. 수행일로 센다. 세션 번호는 안 오르고 576시간에 안 센다",
    },
    blocks: got.blocks.length ? got.blocks : null,
    count: got.sessions.length,
    sessions: got.sessions,
  };
  fs.mkdirSync(OUT, { recursive: true });
  const txt = JSON.stringify(obj, null, 1) + "\n";
  fs.writeFileSync(path.join(OUT, "sessions.json"), txt);
  console.log("out/game/sessions.json / 세션 " + obj.count + "개 / " +
              Math.round(txt.length / 1024) + "KB / 판 덱 " + Object.keys(DECKS).length +
              "개를 미리 뽑았다 (어제 그거는 그날 짠다) / 다지기 주 " + SR.consol.join(" ") +
              " / 간격 복습 " + got.sessions.reduce((a, r) => a + r.review.length, 0) +
              "장 / 다섯 번 못 채운 카드 " + carry.length + "장");
})().catch((e) => {
  console.log("[실패] 게임 세션을 뽑다가 멈췄다: " + e.message);
  process.exit(1);
});
