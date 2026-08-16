/* 안 나오는 자료 (T413~T415).
 *
 * `check_supply.js` (T403) 는 **겹침**을 잰다. 자루에 여유가 있는데 어제 낸 것을
 * 오늘 또 내는가다. 그 검사에 "다 쓰는가" 판이 하나 붙어 있는데
 * **마지막 날 자루가 스물이 넘는 판만** 보고, 게다가 1년치를 통째로 합쳐 센다.
 * 과마다 자루가 갈리는 판은 합치면 수백이 되므로 그 판을 늘 통과한다.
 *
 * 여기서 재는 것은 다르다. **1년을 다 돌고도 한 번도 안 뜬 것이 있는가.**
 * 만들어 놓고 두 사람 앞에 한 번도 안 오는 자료는 없는 것과 같다.
 * `play_data.md` 가 "스무 판이 다 자기 자료를 든다" 로 끝났는데
 * **든 것과 낸 것은 다르다.** 그 사이를 아무도 안 쟀다.
 *
 * ## 안 나오는 것에 갈래가 있다
 *
 *   진도      그 카드가 288일 중 며칠 안 남기고 자루에 들어온다. **정상이다**
 *   자루넘침  그 과가 도는 날수에 한 판에 내는 수를 곱한 것보다 자루가 크다. **정상이다**
 *   앞쪽만    뽑는 법이 자루 앞에서만 뗀다. **결함이다**
 *   날마다새로 날마다 새 씨앗으로 하나를 집는다. 어제 집은 것이 오늘 또 걸린다. **결함이다**
 *   자루갈림  자루가 과마다 통째로 갈리는데 걸음이 달력 날에 매여 있다. **결함이다**
 *   기록      자료가 아니라 기기 기록에서 낸다. 기록이 없으면 안 연다
 *
 * **이 갈래가 이 검사의 값이다.** 안 나온 수만 세면 정상과 결함이 한 수에 섞인다.
 * 그래서 자루마다 **나올 기회**를 같이 센다. 그날 자루에 들어 있던 날마다
 * `그날 낸 수 / 그날 자루 크기` 를 더한 것이 그 자료의 기회다.
 * 기회가 1을 넘는데도 1년 내내 한 번도 안 나왔으면 **낼 수 있었는데 안 낸 것**이다.
 *
 * ## 기준선은 개수가 아니라 값이다
 *
 * T405 가 여백에서 겪었다. **개수만 세면 `60px` 을 `64px` 로 바꿔도 일곱은 일곱이다.**
 * 그래서 자루 크기와 나온 수와 놓친 수를 값으로 적고,
 * 그 위에 **안 나온 목록 전체의 지문**을 하나 더 적는다.
 * 하나가 빠지고 다른 하나가 들어오면 수는 그대로인데 지문이 달라진다.
 *
 * 기준선은 `docs/play_unused.md` 3장 표에서 읽는다. **여기 안 적는다.**
 * 두 자리에 적으면 한쪽만 고치는 날이 온다 (T396).
 *
 * ## 시간에 선을 안 건다
 *
 * 여기서 재는 것은 시간이 아니라 셈의 결과다. `roundPick` 과 `roundSeed` 가
 * 시작일과 오늘과 자루 크기에서만 셈하므로 어느 기계에서 돌려도 같다.
 *
 * **기계가 안 보는 것: 안 나온 그 줄이 나올 값어치가 있는 줄인가.**
 *
 * 사용법:
 *     node scripts/check_unused.js
 *
 * 규격: docs/play_unused.md / docs/play_data.md 6장
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const DOC = path.join(ROOT, "eng2p", "docs", "play_unused.md");

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("안 나오는 자료 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

/* 앱이 읽는 자료 전부. 판이 열리기 전에 다 들려 놓는다. */
const DATA_KEYS = ["chunks", "halves", "listen", "pairs", "reask", "relay",
                   "situ", "swaps", "transcripts", "wall", "whose", "flip",
                   "apart", "clash", "cutin", "ladder", "wave", "onepick",
                   "cards", "lectures"];
/* 48주 x 6일. **일요일은 쉰다.** `plan()` 이 288세션에서 멈춘다. */
const DAYS = 288;

/* 안 나온 목록의 지문. 개수가 같아도 목록이 바뀌면 달라진다.
   FNV-1a 다. 짧고 어느 기계에서나 같은 값이 나온다. */
function fingerprint(list) {
  const s = list.slice().sort().join(",");
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return ("0000000" + h.toString(16)).slice(-8);
}

/* 기준선을 `docs/play_unused.md` 3장 표에서 읽는다.
   | `이름` | 자루 | 나온 것 | 놓친 것 | 지문 | 갈래 | 무엇 | */
function baseline() {
  if (!fs.existsSync(DOC)) return {};
  const src = fs.readFileSync(DOC, "utf8");
  const out = {};
  const re = /^\| `(\w+)` \| (\d+) \| (\d+) \| (\d+) \| `([0-9a-f]{8})` \| ([^|]+) \| ([^|]+) \|/gm;
  let m;
  while ((m = re.exec(src)))
    out[m[1]] = { n: +m[2], shown: +m[3], lost: +m[4], key: m[5],
                  kind: m[6].trim(), what: m[7].trim() };
  return out;
}

const fails = [];
let n = 0;

(async () => {
  const BASE = baseline();

  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  let perr = null;
  page.on("pageerror", (e) => { if (!perr) perr = e.message; });
  await page.goto(PAGE);
  await page.waitForTimeout(700);
  await page.fill("#obA", "가람");
  await page.fill("#obB", "나래");
  await page.click("#obGo");
  await page.waitForTimeout(400);

  const got = await page.evaluate(async (args) => {
    const [KEYS, DAYS] = args;
    await new Promise((r) => loadScript("plays", "eng2p/out/app/plays.js", r));
    await new Promise((r) => needAllWeeks(r));
    for (const k of KEYS)
      await new Promise((r) => loadData(k, "ENG2P_" + k.toUpperCase(), () => r()));

    S.start = "2026-08-10"; S.device = "a"; S.days = {}; S.situ = {}; S.cardDue = {};
    /* **저장은 안 한다.** 여기서 재는 것은 셈이지 저장이 아니다.
       카드 기록을 288일치 심으면 저장이 십팔만 번이고 그것은 다 브라우저 일이다. */
    const realSave = window.save, realNow = window.saveNow;
    window.save = function () {}; window.saveNow = function () {};

    /* 자루 키. **과가 다르면 같은 자리라도 다른 자료다.** */
    function mapAll(d) {
      const out = [];
      if (!d || !d.items) return out;
      for (const m in d.items) (d.items[m] || []).forEach((_, i) => out.push(m + "#" + i));
      return out;
    }
    function mapDay(mid, d) {
      return ((d && d.items ? d.items[mid] : null) || []).map((_, i) => mid + "#" + i);
    }
    function at(mid, rows, picked) {
      return (picked || []).map((x) => mid + "#" + rows.indexOf(x));
    }
    /* 대본 줄. **화자 표시를 떼고 낱말 넷 이상만** 남긴다. 판 둘이 같은 자리를 쓴다.
       뗀 뒤의 줄과 원래 줄 번호를 같이 들고 다녀야 어느 줄인지를 말할 수 있다. */
    function txPairs(mid) {
      const t = DATA.transcripts;
      if (!t || !t.items || !mid) return [];
      return (t.items[mid] || [])
        .map((x, i) => [i, String(x).replace(/^[A-Z][A-Za-z .'-]{0,20}:\s*/, "")])
        .filter((p) => p[1].split(/\s+/).length >= 4);
    }
    function txAll() {
      const t = DATA.transcripts, out = [];
      if (!t || !t.items) return out;
      for (const m in t.items) txPairs(m).forEach((p) => out.push(m + "#" + p[0]));
      return out;
    }

    /* 판마다 셋. [자루 전부, 그날 자루, 그날 뜨는 것]
       **그날 자루가 있어야 기회를 셀 수 있다.** 없으면 정상과 결함이 한 수에 섞인다. */
    const U = {}, P = {}, D = {};
    function media() { const pl = plan(); return pl && pl.media ? pl.media : null; }

    U.chain = () => mapAll(DATA.chunks);
    P.chain = () => mapDay(chnToday(), DATA.chunks);
    D.chain = () => { const m = chnToday(); return at(m, (DATA.chunks.items || {})[m] || [], chnPool()); };

    U.rebound = U.chain;
    P.rebound = () => mapDay(rbdToday(), DATA.chunks);
    D.rebound = () => { const m = rbdToday(); return at(m, (DATA.chunks.items || {})[m] || [], rbdPool()); };

    U.overlap = U.chain;
    P.overlap = () => mapDay(media(), DATA.chunks);
    D.overlap = () => {
      const m = media(), r = (DATA.chunks.items || {})[m] || [];
      return r.length ? [m + "#" + (roundSeed("overlap", 0) % r.length)] : [];
    };

    U.hearme = () => mapAll(DATA.listen);
    P.hearme = () => mapDay(hrmToday(), DATA.listen);
    D.hearme = () => { const m = hrmToday(); return at(m, (DATA.listen.items || {})[m] || [], hrmItems()); };

    U.relay = () => mapAll(DATA.relay);
    P.relay = () => mapDay(rlyToday(), DATA.relay);
    D.relay = () => { const m = rlyToday(); return at(m, (DATA.relay.items || {})[m] || [], rlyItems()); };

    U.ladder = U.relay;
    P.ladder = () => mapDay(ladToday(), DATA.relay);
    D.ladder = () => { const m = ladToday(); return at(m, (DATA.relay.items || {})[m] || [], [ladPiece()].filter(Boolean)); };

    U.wave = U.relay;
    P.wave = () => mapDay(wavToday(), DATA.relay);
    D.wave = () => { const m = wavToday(); return at(m, (DATA.relay.items || {})[m] || [], [wavPiece()].filter(Boolean)); };

    U.swapline = () => mapAll(DATA.swaps);
    P.swapline = () => mapDay(swpToday(), DATA.swaps);
    D.swapline = () => { const m = swpToday(); return at(m, (DATA.swaps.items || {})[m] || [], swpItems()); };

    U.twohalf = () => mapAll(DATA.halves);
    P.twohalf = () => mapDay(twhToday(), DATA.halves);
    D.twohalf = () => { const m = twhToday(); return at(m, (DATA.halves.items || {})[m] || [], twhItems()); };

    U.clash = () => mapAll(DATA.clash);
    P.clash = () => mapDay(clsToday(), DATA.clash);
    D.clash = () => { const m = clsToday(), r = (DATA.clash.items || {})[m] || []; return (clsRows() || []).map((x) => m + "#" + r.indexOf(x)); };

    U.reask = txAll;
    P.reask = () => txPairs(rskToday()).map((p) => rskToday() + "#" + p[0]);
    /* **판이 쓰는 함수를 그대로 부른다.** 여기서 `roundPick` 을 흉내 내면
       뽑는 법이 바뀌는 날 흉내만 옛 셈으로 남는다. 돌아온 글을 줄 번호로 되돌린다.
       한 과 안에 같은 글이 두 번 나오는 자리가 없어서 되돌리는 것이 하나로 정해진다. */
    D.reask = () => {
      const m = rskToday(), ps = txPairs(m);
      if (!ps.length) return [];
      const by = {};
      ps.forEach((p) => { if (by[p[1]] == null) by[p[1]] = p[0]; });
      return (rskLines() || []).map((x) => m + "#" + (by[x] == null ? "?" : by[x]));
    };

    U.cutin = txAll;
    P.cutin = () => txPairs(cutToday()).map((p) => cutToday() + "#" + p[0]);
    D.cutin = () => {
      const m = cutToday(), ps = txPairs(m);
      if (!ps.length || !cutDeck()) return [];
      /* 화면이 `lines.slice(0,6)` 으로 그린다. **뽑는 것이 아니라 앞에서 뗀다.** */
      return ps.slice(0, 6).map((p) => m + "#" + p[0]);
    };

    U.mirror = () => (mirPool() || []).map((p) => p.g + "|" + p.a + "/" + p.b);
    P.mirror = U.mirror;
    D.mirror = () => (mirItems(MIR.n) || []).map((p) => p.g + "|" + p.a + "/" + p.b);

    U.flip = () => (DATA.flip.cards || []).map((c) => c.id);
    P.flip = () => (flpPool() || []).map((c) => c.id);
    D.flip = () => (flpDeck() || []).map((c) => c.id);

    U.whose = () => (DATA.whose.sets || []).map((c) => c.id);
    P.whose = () => (whoPool() || []).map((c) => c.id);
    D.whose = () => (whoDeck() || []).map((c) => c.id);

    U.wall = () => (DATA.wall.cards || []).map((c) => c.id);
    P.wall = () => (walPool() || []).map((c) => c.id);
    D.wall = () => (walDeck() || []).map((c) => c.id);

    U.onesee = () => (DATA.situ.cards || []).map((c) => c.id);
    P.onesee = () => (onePool() || []).map((c) => c.id);
    D.onesee = () => (oneDeck() || []).map((c) => c.id);

    U.apart = () => (DATA.apart.items || []).map((x) => "L" + x.no);
    P.apart = () => { const it = aptItem(); return it ? ["L" + it.no] : []; };
    D.apart = P.apart;

    U.oneday = () => (DATA.onepick.days || []).map((r) => r.w + "-" + r.d);
    P.oneday = () => { const g = odyRow(); return g ? [g.row.w + "-" + g.row.d] : []; };
    D.oneday = P.oneday;

    U.onedayPick = () => (DATA.onepick.plays || []).slice();
    P.onedayPick = U.onedayPick;
    D.onedayPick = () => { const g = odyRow(); return g ? [g.row.pick] : []; };

    /* 자루가 줄이 아니라 **눈금**인 판 넷. 자료 안의 칸을 다 쓰는지를 본다. */
    U.cutinDeck = () => (DATA.cutin.decks || []).map((_, i) => "deck" + i);
    P.cutinDeck = U.cutinDeck;
    D.cutinDeck = () => {
      const d = DATA.cutin;
      return (d && d.decks && d.decks.length) ? ["deck" + (roundSeed("cutin", 0) % d.decks.length)] : [];
    };
    U.waveStep = () => (DATA.wave.steps || []).map((x) => "n" + x.n);
    P.waveStep = U.waveStep;
    D.waveStep = () => {
      const o = [];
      for (let i = 0; i < DATA.wave.points; i++) { const a = wavAim(i); if (a) o.push("n" + a.n); }
      return o;
    };
    U.reaskStep = () => (DATA.reask.steps || []).map((x) => "n" + x.n);
    P.reaskStep = U.reaskStep;
    D.reaskStep = () => {
      const o = [];
      for (let i = 0; i < RSK.n; i++) { const a = rskStep(i); if (a) o.push("n" + a.n); }
      return o;
    };
    U.ladderStep = () => (DATA.ladder.steps || []).map((x) => x.label);
    P.ladderStep = U.ladderStep;
    D.ladderStep = U.ladderStep;

    /* 어제 그거는 자료가 아니라 **기기 기록**에서 낸다. 그래서 기록을 심고 잰다. */
    U.recall = () => (DATA.cards.items || []).map((c) => c.id);
    P.recall = () => {
      const days = rclDays();
      if (!days || days.some((g) => !g.ids.length)) return [];
      const s = {};
      days.forEach((g) => g.ids.forEach((id) => { s[id] = 1; }));
      return Object.keys(s);
    };
    D.recall = () => {
      if (!P.recall().length) return [];
      return rclDeck({ end: 10 }).map((x) => x.id);
    };

    const res = {};
    for (const id in U) res[id] = { all: [], hit: {}, chance: {}, days: 0, err: null };
    for (const id in U) { try { res[id].all = U[id]() || []; } catch (e) { res[id].err = String(e).slice(0, 90); } }

    /* 결함의 **꼴**을 짚는 자리. 수가 아니라 뽑는 법 자체를 견준다.
       수만 보면 뽑는 법을 반만 고쳐도 수가 그대로일 수 있다. */
    const shape = { cutinHead: 0, cutinDays: 0, seedPick: 0, seedDays: 0 };

    /* 오늘의 한 판은 **세션을 마친 뒤**에 열린다. 그래서 그 하나만 늦게 잰다. */
    const LATE = { oneday: 1, onedayPick: 1 };
    function run(id) {
      try {
        const pool = P[id]() || [], v = D[id]() || [];
        if (!v.length) return;
        res[id].days += 1;
        v.forEach((k) => { res[id].hit[k] = (res[id].hit[k] || 0) + 1; });
        if (pool.length) {
          const w = v.length / pool.length;
          pool.forEach((k) => { res[id].chance[k] = (res[id].chance[k] || 0) + w; });
        }
      } catch (e) { if (!res[id].err) res[id].err = String(e).slice(0, 90); }
    }

    const real = window.today;
    let d = "2026-08-10";
    for (let i = 0; i < DAYS; i++) {
      window.today = () => d;
      S.rhit = {};
      const pl = plan();
      for (const id in D) if (!LATE[id]) run(id);

      /* 끼어들기가 정말 **앞에서부터 여섯**인가. 수가 아니라 자리를 본다. */
      {
        const m = cutToday(), ps = txPairs(m);
        if (ps.length && cutDeck()) {
          shape.cutinDays += 1;
          const want = ps.slice(0, 6).map((p) => m + "#" + p[0]).join(",");
          const cur = (D.cutin() || []).join(",");
          if (want === cur) shape.cutinHead += 1;
        }
      }
      /* 셋이 `roundSeed % 자루` 로 하나를 집는가. **`roundPick` 을 안 쓴다.**
         T403 이 고친 자리가 이 셋에는 안 왔다. 그 꼴을 여기서 못 박는다. */
      ["overlap", "ladder", "wave"].forEach((id) => {
        const src = (id === "overlap") ? DATA.chunks : DATA.relay;
        const m = media(), r = ((src && src.items) ? src.items[m] : null) || [];
        if (!r.length) return;
        shape.seedDays += 1;
        const want = m + "#" + (roundSeed(id, 0) % r.length);
        if ((D[id]() || [])[0] === want) shape.seedPick += 1;
      });

      /* 카드를 그날 돈 것으로 적는다. 그날 배정된 새 카드와 차례가 된 카드다. */
      if (pl && pl.cards && pl.quarter && DATA.cards) {
        (DATA.cards.items || []).forEach((c) => {
          if (c.quarter === pl.quarter && c.no >= pl.cards.from && c.no <= pl.cards.to)
            markCardRun(c.id, pl.lectureNo);
        });
        dueCards().forEach((id) => markCardRun(id, pl.lectureNo));
      }
      S.days[d] = { status: "normal", speak: 40, cards: 7, lre: 2, unres: [], coll: [] };
      for (const id in LATE) run(id);
      d = addDays(d, 1);
      if (parseISO(d).getDay() === 0) d = addDays(d, 1);
    }
    window.today = real;
    window.save = realSave; window.saveNow = realNow;

    const out = { shape: shape, rows: {} };
    for (const id in U) {
      const v = res[id];
      const miss = v.all.filter((k) => !v.hit[k]);
      out.rows[id] = { n: v.all.length, shown: v.all.length - miss.length, days: v.days,
                       err: v.err, miss: miss,
                       /* **낼 수 있었는데 안 낸 것.** 기회가 1을 넘는데 한 번도 안 나왔다 */
                       lost: miss.filter((k) => (v.chance[k] || 0) >= 1).length,
                       extra: Object.keys(v.hit).filter((k) => v.all.indexOf(k) < 0).length };
    }
    return out;
  }, [DATA_KEYS, DAYS]);

  await ctx.close();
  await browser.close();

  n += 1;
  if (perr) fails.push("화면이 오류를 냈다: " + perr);

  const rows = got.rows;
  const ids = Object.keys(rows).sort();

  /* **표와 코드가 같은 자루를 보는가** (T402 가 `check_scale.js` 에서 겪었다).
     표에서 줄이 빠지면 그 줄만 안 읽히고 나머지가 다 통과한다.
     재려던 것이 사라진 것을 아무도 못 본다. */
  n += 2;
  if (!Object.keys(BASE).length) {
    fails.push("docs/play_unused.md 3장에서 기준선 표를 못 읽었다. 아래 잰 값을 그 표에 적는다");
  } else {
    const miss = ids.filter((k) => !(k in BASE));
    const extra = Object.keys(BASE).filter((k) => ids.indexOf(k) < 0);
    if (miss.length) fails.push("기준선 표에 " + miss.join(" ") + " 줄이 없다. docs/play_unused.md 3장을 본다");
    if (extra.length) fails.push("코드가 안 재는 기준선이 표에 있다: " + extra.join(" "));
  }

  console.log("");
  console.log("  " + "이름".padEnd(12) + "  자루   나온 것  놓친 것  지문      열린 날");
  ids.forEach((id) => {
    const v = rows[id], key = fingerprint(v.miss), b = BASE[id];
    n += 4;
    let mark = " OK ";
    if (v.err) { fails.push(id + " 가 안 돌았다: " + v.err); mark = "실패"; }
    else if (!v.days) { fails.push(id + " 가 288일 중 한 날도 안 열렸다"); mark = "실패"; }
    else if (v.extra) { fails.push(id + " 가 자루 밖의 것을 " + v.extra + "개 냈다"); mark = "실패"; }
    else if (!b) mark = "새것";
    else {
      /* 수 뒤에 조사를 안 붙인다. **받침이 수마다 갈린다.**
         312는 이로 끝나고 636은 육으로 끝난다. 화살표가 그 자리를 대신한다. */
      const bad = [];
      if (v.n !== b.n) bad.push("자루 " + b.n + " -> " + v.n);
      if (v.shown !== b.shown)
        bad.push("나온 것 " + b.shown + " -> " + v.shown +
                 (v.shown < b.shown ? ". **안 나오는 것이 늘었다**" : ". 나아졌다. 표를 고친다"));
      if (v.lost !== b.lost)
        bad.push("낼 수 있었는데 안 낸 것 " + b.lost + " -> " + v.lost);
      /* **수가 같아도 목록이 바뀔 수 있다** (T405). 지문이 그것을 잡는다. */
      if (key !== b.key)
        bad.push("안 나온 목록이 바뀌었다. 지문 " + b.key + " -> " + key +
                 (v.n === b.n && v.shown === b.shown
                   ? ". **수는 그대로다.** 하나가 빠지고 다른 하나가 들어왔다" : ""));
      if (bad.length) { fails.push(id + ": " + bad.join(" / ")); mark = "실패"; }
    }
    console.log("  " + mark + " " + id.padEnd(12) +
                String(v.n).padStart(5) + String(v.shown).padStart(8) +
                String(v.lost).padStart(8) + "  " + key + "  " + String(v.days).padStart(4) +
                (b ? "" : "   <- 표에 없다"));
  });

  /* 결함의 꼴. **수가 아니라 뽑는 법을 못 박는다.**
     반만 고쳐 수가 그대로인 날에도 여기서 갈린다. */
  n += 2;
  const S = got.shape;
  if (S.cutinDays && S.cutinHead === S.cutinDays)
    console.log("\n  꼴  끼어들기가 " + S.cutinDays + "날 다 **과의 앞 여섯 줄**을 냈다. " +
                "뽑는 것이 아니라 앞에서 뗀다 (`app/play/cutin.js` 의 `lines.slice(0,6)`)");
  else
    fails.push("끼어들기의 뽑는 법이 바뀌었다. " + S.cutinDays + "날 중 " + S.cutinHead +
               "날만 앞 여섯이다. docs/play_unused.md 4장을 고친다");
  if (S.seedDays && S.seedPick === S.seedDays)
    console.log("  꼴  겹치면 지운다와 배속 사다리와 파장이 " + S.seedDays +
                "번 다 `roundSeed % 자루` 로 집었다. **T403 의 `roundPick` 이 이 셋에 안 왔다**");
  else
    fails.push("셋 중 하나의 뽑는 법이 바뀌었다. " + S.seedDays + "번 중 " + S.seedPick +
               "번만 씨앗으로 집었다. docs/play_unused.md 4장을 고친다");

  fails.forEach((m) => console.log("[실패] " + m));

  const worst = ids.filter((k) => rows[k].lost > 0)
                   .sort((a, b) => rows[b].lost - rows[a].lost);
  if (worst.length) {
    console.log("");
    console.log("**낼 수 있었는데 안 낸 것이 있는 판 " + worst.length + "개.** " +
                "자루에 들어 있던 날이 넉넉했는데 1년 내내 한 번도 안 떴다.");
    worst.forEach((k) => {
      console.log("  " + k.padEnd(12) + String(rows[k].lost).padStart(5) + "개  " +
                  ((BASE[k] && BASE[k].kind) || "갈래를 표에 안 적었다"));
    });
  }
  console.log("");
  console.log("**기계가 안 보는 것: 안 나온 그 줄이 나올 값어치가 있는 줄인가**");
  console.log("안 나오는 자료 " + n + "판 (자루 " + ids.length +
              "개 x 4, 표 대조 2, 뽑는 꼴 2, 오류 1) / 실패 " + fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("[실패] 검사가 도중에 멈췄다: " + e.message);
  process.exit(1);
});
