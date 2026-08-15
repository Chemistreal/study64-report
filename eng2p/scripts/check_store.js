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
 * T390 에 하나가 더 붙었다. 깨진 글자를 옮겨 두는 것만으로는 안 되살아난다.
 * 옮겨 둔 것은 **못 읽는 글자**다. 그래서 그날 처음 저장할 때 덮이기 전의 판을
 * 사본으로 남기고 이레를 둔다. 사본이 있어야 되살릴 수 있다.
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

/* **한 자리에서 던지면 그때까지 모은 실패가 다 사라졌다** (T391).
   실패 목록이 async 안에 있어서 아래 catch 가 오류 한 줄만 찍고 끝냈다.
   무엇이 이미 틀렸는지를 못 보면 고칠 자리를 못 찾는다. 밖으로 뺀다. */
const fails = [];
(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
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

  /* 12. 막힌 카드를 모으되 **간격을 안 바꾼다** (T359) */
  {
    n++;
    const { ctx, page } = await fresh();
    const st = await page.evaluate(() => {
      const td = today();
      S.cardDue = {};
      cardSet("Q1-001", { box: 2, due: addDays(td, 5), ran: td, hist: [td] });
      cardSet("Q1-002", { box: 1, due: addDays(td, 2), ran: td, hist: [td] });
      saveNow();
      const before = JSON.parse(JSON.stringify(cardOne("Q1-001")));
      markCardStuck("Q1-001");
      markCardStuck("Q1-001");
      markCardStuck("Q1-002");
      const after = cardOne("Q1-001");
      return { before: before, after: after, list: stuckCards(),
               otherSide: (cardDue()["Q1-001"][cardSide() === "a" ? "b" : "a"] || {}).stuck };
    });
    /* **간격을 안 바꾼다.** 상자도 다음 날짜도 그대로다 */
    if (st.after.box !== st.before.box || st.after.due !== st.before.due)
      fails.push("막혔다를 눌렀더니 간격이 바뀐다: " +
                 JSON.stringify(st.before) + " -> " + JSON.stringify(st.after));
    if (st.after.stuck !== 2) fails.push("막힌 수가 " + st.after.stuck + "이다");
    /* **많이 막힌 것이 앞에 온다.** 무작위를 안 쓴다 */
    if (st.list.join() !== "Q1-001,Q1-002")
      fails.push("막힌 카드 차례가 " + st.list.join(" ") + " 다");
    /* **사람별이다.** 저쪽 갈래는 안 는다 */
    if (st.otherSide) fails.push("이쪽에서 막혔는데 저쪽 갈래도 늘었다");

    /* 지우면 목록에서 빠진다 */
    const gone = await page.evaluate(() => {
      clearCardStuck("Q1-001");
      return stuckCards();
    });
    if (gone.join() !== "Q1-002")
      fails.push("지웠는데 목록에 남는다: " + gone.join(" "));
    await ctx.close();
  }

  /* ---- 어디서 열었나 (T382) ---------------------------------------------
     **저장소는 주소별로 갈린다.** 내보내기 칸이 기기만 말하고 여는 곳을
     안 말해서 기록이 사라진 것처럼 보이는 자리가 있었다. */
  {
    const { ctx, page } = await fresh();
    await page.evaluate(() => {
      S.onboarded = true; S.names.a = "가람"; S.names.b = "나래"; saveNow();
    });
    await page.reload();
    await page.waitForTimeout(500);
    const w = await page.evaluate(async () => {
      go("ledger");
      await new Promise((ok) => setTimeout(ok, 1200));
      const e = document.getElementById("openWhere");
      /* 세 자리를 다 그려 본다. **파일로 열면 홈에 못 붙인다** */
      const kinds = {};
      const real = openKind;
      ["file", "pages", "web"].forEach((k) => {
        window.openKind = () => k;
        renderOpen();
        kinds[k] = e.innerText.replace(/\s+/g, " ");
      });
      window.openKind = real; renderOpen();
      return { now: e ? e.innerText.replace(/\s+/g, " ") : null,
               kinds: kinds, proto: location.protocol,
               names: Object.keys(OPEN_NAME).length };
    });
    n += 12;
    if (w.now === null) { fails.push("대장 탭에 어디서 열었나 자리가 없다"); }
    else {
      if (w.proto !== "file:") fails.push("이 검사가 file:// 로 안 열렸다: " + w.proto);
      if (w.names !== 4) fails.push("여는 곳 이름이 " + w.names + "개다. 넷이어야 한다");
      /* **여는 곳이 바뀌면 따로 산다는 말이 늘 있다** */
      ["file", "pages", "web"].forEach((k) => {
        if (w.kinds[k].indexOf("여는 곳이 바뀌면 기록이 따로 산다") < 0)
          fails.push(k + " 로 열었을 때 기록이 따로 산다는 말이 없다");
      });
      /* **잃었다고 안 적는다.** 옮기는 길이 이미 둘 있다 */
      if (/사라졌|날아갔|잃었|지워졌/.test(w.now))
        fails.push("잃었다고 적는다: " + w.now.slice(0, 60));
      if (w.now.indexOf("JSON") < 0) fails.push("옮기는 길을 안 적는다");
      /* **파일로 열면 홈에 못 붙인다.** 주소로 열 때만 붙이는 법을 적는다 */
      if (w.kinds.file.indexOf("홈 화면에는 못 붙인다") < 0)
        fails.push("파일로 열었는데 홈에 못 붙인다는 말이 없다");
      if (w.kinds.pages.indexOf("홈 화면에 붙이기") < 0)
        fails.push("주소로 열었는데 홈 화면 붙이는 법이 없다");
      /* **메뉴 이름을 못 박지 않는다.** 지어낸 이름을 적으면 없는 것을 찾는다 */
      if (w.kinds.pages.indexOf("기기와 판마다 다르다") < 0)
        fails.push("메뉴 이름이 기기마다 다르다는 말이 없다");
      if (w.kinds.pages.indexOf("인터넷이 있어야 한다") < 0)
        fails.push("홈에 붙인 것이 인터넷을 쓴다는 말이 없다");
      /* **사본이 있다는 것을 말한다** (T390). 있는 줄 모르면 없는 것과 같다 */
      if (w.now.indexOf("이 기기의 사본") < 0) fails.push("사본이 몇 벌인지 안 적는다");
      /* **사본도 이 기기 안에 있다.** 그것으로 기기 바뀜을 못 막는다 */
      if (w.now.indexOf("기기가 바뀌면 같이 사라진다") < 0)
        fails.push("사본이 기기를 벗어나지 못한다는 말이 없다");
      /* **다그치지 않는다** (docs/tone.md). 언제였는지만 적는다 */
      if (/오래됐|해야 한다|늦었다|서둘러/.test(w.now))
        fails.push("사본 자리에서 다그친다: " + w.now.slice(0, 80));
    }
    await ctx.close();
  }

  /* ---- 사본 (T390) ------------------------------------------------------
     깨진 기록을 옮겨 두는 것만으로는 되살아나지 않는다. 옮겨 둔 글자는
     못 읽는 글자다. **되살릴 수 있는 판이 따로 있어야 한다.**
     그날 처음 저장할 때 덮이기 전의 판을 남기고 이레를 둔다. */
  let bak = 0;

  /* 6-1. 그날 처음 저장할 때 **덮이기 전의 판**이 남는가. 하루 한 벌인가 */
  {
    bak += 3;
    const { ctx, page } = await fresh();
    const st = await page.evaluate((k) => {
      const B = k + ".bak.";
      const keys = () => {
        const o = [];
        for (let i = 0; i < localStorage.length; i++) {
          const x = localStorage.key(i);
          if (x.indexOf(B) === 0) o.push(x);
        }
        return o.sort();
      };
      /* 앱이 뜨면서 이미 한 번 저장했다. 여기부터 세려고 지운다 */
      keys().forEach((x) => localStorage.removeItem(x));
      S.names.a = "첫판"; saveNow();
      keys().forEach((x) => localStorage.removeItem(x));
      /* 남길 것이 없을 때는 **빈 사본을 안 만든다** */
      localStorage.removeItem(k);
      S.names.a = "본기록없음"; saveNow();
      const afterFirst = keys();
      localStorage.setItem(k, JSON.stringify({ names: { a: "첫판" } }));
      S.names.a = "둘째판"; saveNow();
      const afterSecond = keys();
      const kept = afterSecond.length
        ? JSON.parse(localStorage.getItem(afterSecond[0])).names.a : null;
      S.names.a = "셋째판"; saveNow();
      const afterThird = keys();
      const stillKept = afterThird.length
        ? JSON.parse(localStorage.getItem(afterThird[0])).names.a : null;
      return { one: afterFirst.length, two: afterSecond.length,
               three: afterThird.length, kept: kept, stillKept: stillKept,
               name: afterSecond[0] || null, td: today() };
    }, KEY);
    /* 아무것도 없을 때는 남길 것이 없다. **빈 사본을 만들지 않는다** */
    if (st.one !== 0) fails.push("본 기록이 없는데 사본이 " + st.one + "벌 생겼다");
    if (st.two !== 1) fails.push("둘째 저장 뒤 사본이 " + st.two + "벌이다");
    if (st.kept !== "첫판")
      fails.push("사본에 덮은 뒤의 판이 들어 있다: " + st.kept);
    /* **하루에 한 벌이다.** 저장할 때마다 늘면 이레가 하루가 된다 */
    if (st.three !== 1) fails.push("같은 날 세 번 저장했더니 사본이 " + st.three + "벌이다");
    if (st.stillKept !== "첫판")
      fails.push("그날 첫 판이 나중 저장에 덮였다: " + st.stillKept);
    if (st.name !== KEY + ".bak." + st.td)
      fails.push("사본 이름이 날짜가 아니다: " + st.name);
    await ctx.close();
  }

  /* 6-2. 이레를 넘으면 **오래된 것부터** 지우는가 */
  {
    bak += 3;
    const { ctx, page } = await fresh();
    const st = await page.evaluate((k) => {
      const B = k + ".bak.";
      /* 옛 사본 열 벌을 심는다. 날짜가 다 다르다 */
      for (let i = 1; i <= 10; i++) {
        const d = "2025-01-" + (i < 10 ? "0" + i : i);
        localStorage.setItem(B + d, JSON.stringify({ names: { a: "옛" + i } }));
      }
      S.names.a = "지금"; saveNow();   /* 여기서 오늘 사본이 는다. 열하나가 된다 */
      S.names.a = "다음"; saveNow();   /* 같은 날이라 더 안 는다 */
      const o = [];
      for (let i = 0; i < localStorage.length; i++) {
        const x = localStorage.key(i);
        if (x.indexOf(B) === 0) o.push(x.slice(B.length));
      }
      return { list: o.sort(), td: today() };
    }, KEY);
    if (st.list.length !== 7)
      fails.push("사본이 " + st.list.length + "벌 남았다. 이레여야 한다: " + st.list.join(" "));
    /* **오늘 것이 남는다.** 새것을 지우고 옛것을 두면 되살릴 수 없다 */
    if (st.list.indexOf(st.td) < 0)
      fails.push("오늘 사본이 잘려 나갔다: " + st.list.join(" "));
    /* **제일 옛것부터 빠진다** */
    if (st.list.indexOf("2025-01-01") >= 0 || st.list.indexOf("2025-01-04") >= 0)
      fails.push("옛 사본이 안 빠졌다: " + st.list.join(" "));
    if (st.list.indexOf("2025-01-10") < 0)
      fails.push("가까운 사본이 빠졌다: " + st.list.join(" "));
    await ctx.close();
  }

  /* 6-3. 본 기록이 깨졌을 때 **사본으로 되살아나는가.** 이 검사의 고갱이다 */
  {
    bak += 5;
    const { ctx, page } = await fresh();
    await page.evaluate((k) => {
      localStorage.setItem(k + ".bak.2025-03-04", JSON.stringify(
        { onboarded: true, names: { a: "가람", b: "나래" },
          days: { "2025-03-01": { speak: 77 } } }));
      localStorage.setItem(k, "{이건 JSON 이 아니다");
    }, KEY);
    await page.reload();
    await page.waitForTimeout(500);
    const st = await page.evaluate((k) => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
      return { err: typeof LOAD_ERR !== "undefined" ? LOAD_ERR : null,
               a: S.names.a, speak: ((S.days || {})["2025-03-01"] || {}).speak,
               /* blank() 에만 있는 칸도 채워졌는가. 옛 사본에는 없던 칸이다 */
               hasCards: S.cardDue !== undefined && S.exportAt !== undefined,
               /* 되살린 뒤에 저장이 한 번 돈다. 그때 사본으로 남는 것이
                  **깨진 글자면 오늘 한 자리를 쓰레기가 차지한다** */
               fresh: (function () {
                 const t = localStorage.getItem(k + ".bak." + today());
                 if (t == null) return "없음";
                 try { return typeof JSON.parse(t) === "object" ? "성함" : "이상"; }
                 catch (e) { return "깨짐"; }
               })(),
               broken: keys.some((x) => x.indexOf(k + ".broken") === 0) };
    }, KEY);
    if (st.fresh === "깨짐" || st.fresh === "이상")
      fails.push("못 읽는 글자를 오늘 사본으로 남겼다: " + st.fresh);
    if (st.a !== "가람" || st.speak !== 77)
      fails.push("사본이 있는데 안 되살렸다: " + st.a + " / " + st.speak);
    /* **되살린 사실과 그 날짜를 말한다.** 조용히 되살리면 그 뒤에 적은 것을
       잃은 줄 모른다 */
    if (!st.err || st.err.indexOf("2025-03-04") < 0)
      fails.push("어느 날 사본으로 되살렸는지 안 말한다: " + st.err);
    if (!st.hasCards) fails.push("옛 사본에 없던 칸이 안 채워졌다");
    /* 되살려도 **못 읽은 글자는 그대로 둔다** */
    if (!st.broken) fails.push("되살리면서 못 읽은 글자를 버렸다");
    await ctx.close();
  }

  /* 6-4. 사본이 깨져 있으면 **그 앞 사본**을 보는가 */
  {
    bak += 1;
    const { ctx, page } = await fresh();
    await page.evaluate((k) => {
      localStorage.setItem(k + ".bak.2025-03-01", JSON.stringify({ names: { a: "앞것" } }));
      localStorage.setItem(k + ".bak.2025-03-05", "{이 사본도 깨졌다");
      localStorage.setItem(k, "{본 기록도 깨졌다");
    }, KEY);
    await page.reload();
    await page.waitForTimeout(500);
    const a = await page.evaluate(() => S.names.a);
    if (a !== "앞것") fails.push("사본 하나가 깨지니 나머지도 안 봤다: " + a);
    await ctx.close();
  }

  /* 6-5. **사본이 저장을 막지 않는가.** 본 기록이 먼저다 */
  {
    bak += 2;
    const { ctx, page } = await fresh();
    const st = await page.evaluate((k) => {
      const real = localStorage.setItem.bind(localStorage);
      localStorage.setItem = function (key, val) {
        if (key.indexOf(k + ".bak.") === 0) throw new Error("사본 자리가 꽉 찼다");
        return real(key, val);
      };
      S.names.a = "먼저"; saveNow();
      S.names.a = "나중";
      const ok = saveNow();
      localStorage.setItem = real;
      return { ok: ok, saved: JSON.parse(localStorage.getItem(k)).names.a };
    }, KEY);
    if (st.ok !== true) fails.push("사본을 못 남겼다고 저장이 실패로 돌아왔다");
    if (st.saved !== "나중") fails.push("사본이 막히니 본 기록도 안 써졌다: " + st.saved);
    await ctx.close();
  }
  /* ---- 사람이 고르는 되살리기 (T391) ------------------------------------
     깨진 것은 앱이 알아본다. **멀쩡한 채로 틀린 것은 못 알아본다.**
     엉뚱한 JSON 을 덮었거나 전체 삭제를 눌렀을 때가 그렇다. */
  let pick = 0;
  {
    pick += 8;
    const { ctx, page } = await fresh();
    await page.evaluate(() => {
      S.onboarded = true; S.names.a = "가람"; S.names.b = "나래";
      day(today()).speak = 5; saveNow();
    });
    /* 사본 두 벌을 심는다. 하나는 알차고 하나는 못 읽는다.
       앱이 뜨면서 남긴 오늘 벌은 치운다. 그래야 세는 것이 흔들리지 않는다 */
    await page.evaluate((k) => {
      localStorage.removeItem(k + ".bak." + today());
      localStorage.setItem(k + ".bak.2025-05-02", JSON.stringify(
        { onboarded: true, names: { a: "옛가람", b: "옛나래" },
          days: { "2025-04-30": { speak: 1 }, "2025-05-01": { speak: 2 } } }));
      localStorage.setItem(k + ".bak.2025-05-03", "{이 벌은 못 읽는다");
    }, KEY);
    const st = await page.evaluate(async () => {
      go("ledger");
      await new Promise((ok) => setTimeout(ok, 1200));
      const e = document.getElementById("bakPick");
      return { txt: e ? e.innerText.replace(/\s+/g, " ") : null,
               btns: e ? e.querySelectorAll("[data-bak]").length : 0 };
    });
    if (st.txt === null) { fails.push("대장 탭에 사본 고르는 자리가 없다"); }
    else {
      /* **무엇이 들었는지 보고 고른다.** 날짜만으로는 못 고른다 */
      if (st.txt.indexOf("2일") < 0) fails.push("벌마다 적힌 날 수를 안 적는다: " + st.txt.slice(0, 90));
      if (st.txt.indexOf("2025-05-01") < 0) fails.push("마지막 적은 날을 안 적는다");
      /* 지금과 견준다. 지금은 하루, 사본은 이틀이라 +1 이다 */
      if (st.txt.indexOf("+1") < 0) fails.push("지금 것과 견준 값이 없다: " + st.txt.slice(0, 90));
      /* **못 읽는 벌은 되살리기를 안 내민다** */
      if (st.btns !== 1) fails.push("되살리기 단추가 " + st.btns + "개다. 읽히는 벌만이어야 한다");
      if (st.txt.indexOf("이 벌은 못 읽는다") < 0) fails.push("못 읽는 벌을 안 밝힌다");
      /* **다그치지 않는다.** 적다고 나쁘다고 안 적는다 */
      if (/오래됐|낡았|위험|해야 한다/.test(st.txt))
        fails.push("사본을 고르는 자리에서 다그친다: " + st.txt.slice(0, 80));
      if (st.txt.indexOf("기기가 바뀌면 같이 사라진다") < 0)
        fails.push("사본이 기기를 벗어나지 못한다는 말이 없다");
    }

    /* 되살리면 그 판이 오고 **되돌리기가 뜬다** */
    page.on("dialog", (d) => d.accept());
    const after = await page.evaluate(async () => {
      document.querySelector("[data-bak]").click();
      await new Promise((ok) => setTimeout(ok, 400));
      return { a: S.names.a, speak: (S.days["2025-05-01"] || {}).speak,
               undo: !!document.querySelector(".undo") };
    });
    pick += 3;
    if (after.a !== "옛가람" || after.speak !== 2)
      fails.push("사본을 골랐는데 안 되살아났다: " + after.a + " / " + after.speak);
    if (!after.undo) fails.push("사본으로 되돌렸는데 되돌릴 자리가 없다");
    /* **되살리기도 되돌릴 수 있어야 한다.** 어제로 갔더니 오늘 것이 사라지면
       그것도 잃은 것이다 */
    const back = await page.evaluate(async () => {
      document.querySelector(".undo button").click();
      await new Promise((ok) => setTimeout(ok, 400));
      return { a: S.names.a, speak: day(today()).speak };
    });
    if (back.a !== "가람" || back.speak !== 5)
      fails.push("사본 되살리기를 되돌렸는데 안 돌아왔다: " + back.a + " / " + back.speak);

    /* 덮기 직전 판이 **오늘 사본으로 남았는가.** 되돌리기는 새로고침에 없어진다 */
    pick += 1;
    const kept = await page.evaluate((k) => {
      const t = localStorage.getItem(k + ".bak." + today());
      if (!t) return null;
      try { return JSON.parse(t).names.a; } catch (e) { return "깨짐"; }
    }, KEY);
    if (kept !== "가람")
      fails.push("덮기 직전 판이 오늘 사본에 안 남았다: " + kept);
    await ctx.close();
  }
  n += bak + pick;

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("저장소 %d판 (되돌리기 5자리, 어디서 열었나 12, 사본 %d, 골라 되살리기 %d) / 실패 %d",
              n, bak, pick, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("[실패] 검사가 도중에 멈췄다: " + e.message);
  process.exit(1);
});
