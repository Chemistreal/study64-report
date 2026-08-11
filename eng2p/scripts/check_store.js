/* 기록이 살아남는가. **이 앱에서 잃으면 제일 아픈 것이 기록이다.**
 *
 * 1년치 수행 기록이 브라우저 한 곳에만 있다. 서버가 없다.
 * 그것이 이 설계의 값이고 동시에 이 설계의 유일한 큰 위험이다.
 *
 * 전에는 이런 구멍이 있었다.
 *
 *   1. JSON 이 깨지면 **조용히 빈 상태로 시작했다.** 기록은 아직 거기 있는데
 *      화면에는 0회로 나온다. 두 사람은 사라졌다고 여기고 다시 시작하고
 *      그 다음 저장이 옛 기록 위를 덮는다. 그때 진짜로 사라진다
 *   2. `saveNow()` 가 오류를 조용히 삼켰다. 잃으면 안 되는 값을 쓰는 길인데 그랬다
 *   3. `save()` 는 120밀리초를 미룬다. 그 사이에 창이 닫히면 마지막 한 번을 잃는다
 *
 * 셋 다 **눈으로는 안 보인다.** 화면은 멀쩡하다. 그래서 검사로 만든다.
 *
 * 사용법:
 *     node scripts/check_store.js
 *
 * 규격: docs/roadmap.md 12.10
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const KEY = "eng2p.v1";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("저장소 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require("playwright-core").chromium; }
catch (e) { skip("playwright-core 가 없다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const fails = [];
  let n = 0;

  async function fresh() {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(PAGE);
    await page.waitForTimeout(300);
    return { ctx, page };
  }

  /* 1. 적은 것이 새로고침 뒤에도 있는가 */
  {
    n++;
    const { ctx, page } = await fresh();
    await page.evaluate(() => {
      S.onboarded = true; S.names.a = "가람"; S.names.b = "나래";
      day(today()).speak = 42; saveNow();
    });
    await page.reload();
    await page.waitForTimeout(400);
    const got = await page.evaluate(() => ({ a: S.names.a, s: day(today()).speak }));
    if (got.a !== "가람" || got.s !== 42)
      fails.push("적은 것이 새로고침 뒤에 안 남았다: " + JSON.stringify(got));
    await ctx.close();
  }

  /* 2. **미뤄 둔 저장이 화면이 숨을 때 흘러가는가.**
     save() 는 120밀리초를 미룬다. 그 안에 숨으면 잃는다. 그것을 막았는지 본다. */
  {
    n++;
    const { ctx, page } = await fresh();
    await page.evaluate(() => { S.onboarded = true; saveNow(); });
    await page.evaluate(() => { S.names.a = "미뤄둔값"; save(); });
    // 미뤄 둔 사이에 숨긴다. 120밀리초를 안 기다린다.
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    const raw = await page.evaluate((k) => localStorage.getItem(k), KEY);
    if (!raw || JSON.parse(raw).names.a !== "미뤄둔값")
      fails.push("미뤄 둔 저장이 화면을 숨길 때 안 흘러갔다");
    await ctx.close();
  }

  /* 3. **깨진 기록을 조용히 버리지 않는가.** 제일 중요한 줄이다. */
  {
    n++;
    const { ctx, page } = await fresh();
    await page.evaluate((k) => localStorage.setItem(k, "{이건 JSON 이 아니다"), KEY);
    await page.reload();
    await page.waitForTimeout(500);
    const st = await page.evaluate((k) => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
      return { err: typeof LOAD_ERR !== "undefined" ? LOAD_ERR : null, keys: keys };
    }, KEY);
    if (!st.err) fails.push("깨진 기록을 읽고도 아무 말이 없다");
    if (!st.keys.some((x) => x.indexOf(KEY + ".broken") === 0))
      fails.push("깨진 기록을 따로 안 옮겨 뒀다: " + st.keys.join(" "));
    await ctx.close();
  }

  /* 4. 깨진 기록을 옮겨 둔 뒤에 새로 적은 것이 그 위를 안 덮는가 */
  {
    n++;
    const { ctx, page } = await fresh();
    await page.evaluate((k) => localStorage.setItem(k, "{깨진 것"), KEY);
    await page.reload();
    await page.waitForTimeout(400);
    await page.evaluate(() => { S.names.a = "새로"; saveNow(); });
    const kept = await page.evaluate((k) => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.indexOf(k + ".broken") === 0) return localStorage.getItem(key);
      }
      return null;
    }, KEY);
    if (kept !== "{깨진 것") fails.push("옮겨 둔 깨진 기록이 사라졌다: " + kept);
    await ctx.close();
  }

  /* 5. **저장소를 직접 만지는 자리가 조각에 남아 있는가.**
     화면이 아니라 소스를 본다. 흩어지면 어느 길로 쓴 값이 안 남았는지 모르게 된다. */
  {
    n++;
    const app = path.join(__dirname, "..", "app", "js");
    const allow = new Set(["02_store.js"]);
    fs.readdirSync(app).forEach((f) => {
      if (allow.has(f)) return;
      const body = fs.readFileSync(path.join(app, f), "utf8");
      const hits = (body.match(/localStorage\.(setItem|removeItem|clear)/g) || []);
      if (hits.length)
        fails.push(f + " 가 저장소를 직접 만진다: " + hits.join(" ") +
                   " (02_store.js 의 save saveNow wipeStore 를 쓴다)");
    });
  }

  /* 6. 전체 지우기가 정말 지우는가. 그리고 옛 값이 안 남는가 */
  {
    n++;
    const { ctx, page } = await fresh();
    await page.evaluate(() => { S.onboarded = true; S.names.a = "지울값"; saveNow(); });
    await page.evaluate(() => wipeStore());
    await page.reload();
    await page.waitForTimeout(400);
    const a = await page.evaluate(() => S.names.a);
    if (a === "지울값") fails.push("전체 지우기 뒤에도 옛 이름이 남았다");
    await ctx.close();
  }

  /* 7. **되돌릴 수 있는가.** 잘못 누른 것을 못 되돌리면 그 값은 영영 틀린 값이다.
     이 앱에는 지우는 자리가 없다. 대신 **덮어쓰는 자리**가 있고 그것이 더 위험하다.
     지운 것은 없어진 줄 알지만 덮은 것은 맞는 줄 안다. */
  {
    n++;
    const { ctx, page } = await fresh();
    await page.evaluate(() => {
      S.onboarded = true; S.device = "a"; S.recOpen = true; save(); renderToday();
    });
    await page.waitForTimeout(300);

    // 수행 기록. 이 값이 진도를 정한다
    await page.click('[data-st="normal"]');
    await page.waitForTimeout(180);
    await page.click('[data-st="absent"]');
    await page.waitForTimeout(220);
    if (!(await page.isVisible(".undo"))) fails.push("수행 기록을 바꿨는데 되돌릴 자리가 없다");
    else {
      await page.click(".undo button");
      await page.waitForTimeout(220);
      const st = await page.evaluate(() => day(today()).status);
      if (st !== "normal") fails.push("수행 기록을 되돌렸는데 " + st + " 다");
    }

    // 세션 처음으로. 블록 3에서 누르면 한 시간 사십 분이 사라진다
    await page.click("#tOne");
    await page.waitForTimeout(260);
    await page.evaluate(() => gotoBlock(2));
    await page.waitForTimeout(220);
    await page.click("#tReset");
    await page.waitForTimeout(260);
    if (!(await page.isVisible(".undo"))) fails.push("세션을 처음으로 되돌렸는데 되돌릴 자리가 없다");
    else {
      await page.click(".undo button");
      await page.waitForTimeout(260);
      const i = await page.evaluate(() => T.idx);
      if (i !== 2) fails.push("세션 자리를 되돌렸는데 블록 " + (i + 1) + " 이다");
    }

    // 복습 판정. 틀림을 잘못 누르면 60일 뒤 낼 것이 내일이 된다
    await page.evaluate(() => {
      window.__it = { id: "t1", q: "단서", a: "답", box: 5, due: today() };
      revGrade(window.__it, false);
    });
    await page.waitForTimeout(220);
    if (!(await page.isVisible(".undo"))) fails.push("복습 판정에 되돌릴 자리가 없다");
    else {
      await page.click(".undo button");
      await page.waitForTimeout(220);
      const box = await page.evaluate(() => window.__it.box);
      if (box !== 5) fails.push("복습 판정을 되돌렸는데 상자가 " + box + " 다");
    }
    await ctx.close();
  }

  /* 8. **밀기 하나로 되돌릴 수 없는 일이 일어나면 안 된다.**
     T170 에 손가락으로 밀어 블록을 옮기게 했다. 블록 4에서 왼쪽으로 밀면
     세션이 끝나고 그날이 정상으로 적히고 진도가 하나 는다.
     96강 배정이 통째로 하루 당겨진다. 그것이 되돌아오는지 본다. */
  {
    n++;
    const { ctx, page } = await fresh();
    await page.evaluate(() => {
      S.onboarded = true; S.device = "a"; save(); renderToday();
    });
    await page.click("#tOne");
    await page.waitForTimeout(260);
    await page.evaluate(() => gotoBlock(3));
    await page.waitForTimeout(220);
    const b0 = await page.evaluate(() => ({ done: doneSessions(), st: day(today()).status }));
    await page.evaluate(() => $("#tSkip").click());
    await page.waitForTimeout(320);
    const b1 = await page.evaluate(() => ({ done: doneSessions(), st: day(today()).status }));
    if (b1.done !== b0.done + 1) fails.push("세션을 끝냈는데 진도가 안 늘었다");
    if (!(await page.isVisible(".undo"))) fails.push("세션을 끝냈는데 되돌릴 자리가 없다");
    else {
      await page.click(".undo button");
      await page.waitForTimeout(360);
      const b2 = await page.evaluate(() => ({
        done: doneSessions(), st: day(today()).status,
        panel: !document.querySelector("#sessionDone").hidden,
      }));
      if (b2.done !== b0.done) fails.push("세션 끝냄을 되돌렸는데 진도가 " + b2.done + " 이다");
      if (b2.st !== b0.st) fails.push("세션 끝냄을 되돌렸는데 수행 기록이 " + b2.st + " 다");
      if (b2.panel) fails.push("되돌렸는데 끝난 판이 그대로 떠 있다");
    }
    await ctx.close();
  }

  /* 9. **덮어쓰기는 물음 하나로 안 된다.** 엉뚱한 파일을 골랐어도 물음은
     똑같이 뜨고 똑같이 예를 누른다. 무엇이 덮였는지는 덮은 뒤에야 보인다. */
  {
    n++;
    const { ctx, page } = await fresh();
    await page.evaluate(() => {
      S.onboarded = true; S.names.a = "원래이름"; day(today()).speak = 77; saveNow();
    });
    const src = await fs.promises.readFile(
      path.join(__dirname, "..", "app", "js", "11_ledger.js"), "utf8");
    if (src.indexOf("offerUndo(\"기록을 가져왔다\"") < 0)
      fails.push("들여오기에 되돌릴 자리가 없다");
    // 들여오기와 같은 길을 실제로 밟아 본다
    await page.evaluate(() => {
      var o = { v: 1, names: { a: "딴것", b: "딴것" }, start: today(), days: {},
                media: { done: {}, fav: {}, last: null, pass: {} } };
      var before = JSON.stringify(S);
      S = o; var bb = blank(); for (var k in bb) if (!(k in S)) S[k] = bb[k];
      saveNow(); renderToday(); renderLedger();
      offerUndo("기록을 가져왔다", function () {
        S = JSON.parse(before); saveNow(); renderToday(); renderLedger();
      });
    });
    await page.waitForTimeout(280);
    if (!(await page.isVisible(".undo"))) fails.push("들여온 뒤 되돌릴 자리가 안 뜬다");
    else {
      await page.click(".undo button");
      await page.waitForTimeout(280);
      await page.reload();
      await page.waitForTimeout(400);
      const g = await page.evaluate(() => ({ a: S.names.a, speak: day(today()).speak }));
      if (g.a !== "원래이름" || g.speak !== 77)
        fails.push("들여오기를 되돌렸는데 옛 기록이 안 돌아왔다: " + JSON.stringify(g));
    }
    await ctx.close();
  }

  /* 10. 카드가 돈 날이 **여러 개** 남는가 (T312)
     `ran` 은 마지막 한 번이다. 1일 간격 카드는 어제 돌면 오늘 다시 돌고
     그러면 `ran` 이 오늘로 덮인다. 어제 그거 판이 어제 것을 못 찾는다. */
  {
    n++;
    const { ctx, page } = await fresh();
    const h = await page.evaluate(() => {
      /* 카드 기록이 사람별로 갈렸다 (T358). **이 기기 사람 것을 쓴다.**
         `cardOne` 과 `cardSet` 이 갈래를 고르고 옛 꼴이면 갈라 준다. */
      S.cardDue = {};
      const td = today(), y = addDays(td, -1), old = addDays(td, -9);
      cardSet("Q1-001", { box: 1, due: td, ran: y, hist: [old, y] });
      const got = cardRanDays(cardOne("Q1-001"), td);
      cardSet("Q1-001", { box: 1, due: td, ran: td, hist: got });
      saveNow();
      return { got: got, y: y, td: td, old: old,
               yList: ranOn(y), tList: ranOn(td), oList: ranOn(old) };
    });
    if (h.got.indexOf(h.y) < 0)
      fails.push("오늘 다시 돌았더니 어제 돈 것이 사라졌다: " + JSON.stringify(h.got));
    if (h.got.indexOf(h.td) < 0)
      fails.push("오늘 돈 것이 안 적혔다: " + JSON.stringify(h.got));
    if (h.got.indexOf(h.old) >= 0)
      fails.push("이레보다 오래된 날이 안 버려졌다. 600장에 날짜가 쌓인다");
    if (h.yList.join() !== "Q1-001")
      fails.push("어제 돈 카드를 못 찾는다: " + h.yList.join(" "));
    if (h.tList.join() !== "Q1-001")
      fails.push("오늘 돈 카드를 못 찾는다: " + h.tList.join(" "));
    if (h.oList.length)
      fails.push("버린 날로도 카드가 나온다: " + h.oList.join(" "));
    /* **새로고침 뒤에도 남는가.** 기록이 살아남는지가 이 검사의 일이다 */
    await page.reload();
    await page.waitForTimeout(300);
    const back = await page.evaluate(() => (cardOne("Q1-001") || {}).hist || []);
    if (back.length !== h.got.length)
      fails.push("돈 날이 새로고침 뒤에 안 남는다: " + JSON.stringify(back));
    await ctx.close();
  }

  /* 11. 두 기기의 카드 기록이 합쳐지는가 (T312)
     **전에는 안 합쳐졌다.** `String(객체) > String(객체)` 로 견줘서
     둘 다 "[object Object]" 였고 그 비교가 늘 거짓이었다.
     한쪽에만 있는 카드만 건너갔다. 늦은 날짜를 남긴다고 적어 놓고 안 남겼다. */
  {
    n++;
    const { ctx, page } = await fresh();
    const m = await page.evaluate(() => {
      const td = today(), d1 = addDays(td, -1), d3 = addDays(td, -3);
      const mine = { box: 1, due: addDays(td, 1), ran: d3, hist: [d3] };
      const theirs = { box: 2, due: addDays(td, 3), ran: d1, hist: [d1] };
      /* 갈래 하나를 합치는 것은 `mgCardOne` 이다 (T358).
         `mgCard` 는 갈래 둘을 묶어 합친다. **여기서 재는 것은 한 갈래의 규칙이다.** */
      const late = mgCardOne(mine, theirs);
      const rev = mgCardOne(theirs, mine);
      return { late: late, rev: rev, d1: d1, d3: d3,
               only: mgCardOne(null, theirs) };
    });
    if (m.late.ran !== m.d1 || m.late.box !== 2)
      fails.push("합칠 때 늦게 돈 쪽이 안 남는다: " + JSON.stringify(m.late));
    if (JSON.stringify(m.late) !== JSON.stringify(m.rev))
      fails.push("어느 쪽을 먼저 넣느냐로 결과가 달라진다: " +
                 JSON.stringify(m.late) + " vs " + JSON.stringify(m.rev));
    if (m.late.hist.indexOf(m.d1) < 0 || m.late.hist.indexOf(m.d3) < 0)
      fails.push("돈 날이 합쳐지지 않는다: " + JSON.stringify(m.late.hist));
    if (JSON.stringify(m.only) !== JSON.stringify({ box: 2, due: m.only.due,
                                                    ran: m.d1, hist: [m.d1] }))
      fails.push("한쪽에만 있는 카드가 그대로 안 온다: " + JSON.stringify(m.only));
    /* **합치기를 통째로 돌려서도 본다.** 위는 조각 하나만 본 것이다 */
    const whole = await page.evaluate(() => {
      const td = today(), d1 = addDays(td, -1), d3 = addDays(td, -3);
      /* **진짜 꼴로 적는다** (T312, T358). 갈래 둘이 있는 꼴이다 */
      const two = (r) => ({ a: JSON.parse(JSON.stringify(r)),
                            b: JSON.parse(JSON.stringify(r)) });
      S.cardDue = { "Q1-001": two({ box: 1, due: td, ran: d3, hist: [d3] }) };
      saveNow();
      const theirs = JSON.parse(JSON.stringify(S));
      theirs.cardDue = {
        "Q1-001": two({ box: 2, due: addDays(td, 3), ran: d1, hist: [d1] }),
        "Q1-002": two({ box: 1, due: td, ran: d1, hist: [d1] }),
      };
      const r = mergePlan(S, theirs);
      const side = cardSide();
      return { a: r.out.cardDue["Q1-001"][side],
               b: r.out.cardDue["Q1-002"][side],
               d1: d1, d3: d3 };
    }).catch(() => null);
    if (!whole) fails.push("합치기를 통째로 못 돌렸다. 이름이 바뀌었나 본다");
    else {
      if (!whole.b) fails.push("합쳐도 저쪽에만 있던 카드가 안 왔다");
      if (whole.a && whole.a.ran !== whole.d1)
        fails.push("합쳐도 늦게 돈 쪽이 안 남는다: " + JSON.stringify(whole.a));
      if (whole.a && (whole.a.hist || []).indexOf(whole.d3) < 0)
        fails.push("합쳐도 이쪽이 돈 날이 사라진다: " + JSON.stringify(whole.a));
    }
    await ctx.close();
  }

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("저장소 %d판 (되돌리기 5자리 포함) / 실패 %d", n, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
