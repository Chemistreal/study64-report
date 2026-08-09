/* 두 기기 리허설. **검사가 아니라 나란히 받아 적는 것이다.**
 *
 * `check_pair.js` 는 두 기기가 어긋나는지를 값으로 본다. 값은 다 맞을 수 있다.
 * **값이 맞는 것과 두 사람이 읽고 알아듣는 것은 다른 일이다.**
 *
 * 여기서는 창을 둘 띄우고 자리마다 **두 화면을 나란히 적는다.**
 * 왼쪽이 한 기기고 오른쪽이 다른 기기다. 그 둘을 같은 줄에서 읽으면
 * 한쪽에만 있는 말과 둘 다에 있는 말과 서로 어긋나는 말이 보인다.
 *
 * 결과는 out/manual/eng2p_rehearsal_pair.md 다.
 * **그 파일을 사람이 읽는 것이 이 도구의 값이다.**
 * 실패로 내는 것은 돌다가 막힌 것뿐이다. 읽어서 아는 것은 실패로 안 낸다.
 *
 * 쓰는 법:
 *     node scripts/rehearse_pair.js
 *
 * 규격: docs/pair.md, docs/round.md, docs/roadmap.md 12.13
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const OUT = path.join(__dirname, "..", "out", "manual", "eng2p_rehearsal_pair.md");

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("두 기기 리허설을 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require("playwright-core").chromium; }
catch (e) { skip("playwright-core 가 없다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

const SEED = (who) => {
  function iso(d) { var z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return z.toISOString().slice(0, 10); }
  var now = new Date(), st = new Date(now.getTime() - 138 * 86400000), days = {};
  for (var i = 0; i < 138; i++) { var x = new Date(st.getTime() + i * 86400000);
    if (x.getDay() === 0) continue;
    days[iso(x)] = { status: "normal", h: 2, speak: 12, cards: 30, lre: 2,
                     unres: [], coll: [] }; }
  localStorage.setItem("eng2p.v1", JSON.stringify(
    { v: 1, names: { a: "남편", b: "아내" }, start: iso(st), days: days,
      media: { done: {}, fav: {}, last: null, pass: {} }, wk: 0, onboarded: true,
      session: null, device: who, recOpen: false, emgOpen: false, card: null,
      cardDue: {}, cardMode: "today", cues: {}, rate: 1, fs: 0, wchk: {},
      q: {}, rot: [], clips: [], scripts: {}, rstep: {}, rseat: {} }));
};

function tidy(s) {
  return String(s || "").split("\n").map((x) => x.trim())
    .filter((x) => x.length).join("\n");
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const errs = [];
  const dev = {};
  for (const who of ["a", "b"]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
                                           reducedMotion: "reduce" });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errs.push(who + ": " + e.message));
    await page.goto(PAGE);
    await page.evaluate(SEED, who);
    await page.goto(PAGE);
    await page.waitForTimeout(600);
    dev[who] = { ctx, page };
  }
  const A = dev.a.page, B = dev.b.page;

  const L = [];
  const head = await A.evaluate(() => {
    const p = plan();
    return { week: p.week, day: p.day, lec: p.lectureNo, title: p.title || "",
             a: S.names.a, b: S.names.b, side: deviceSide() };
  });
  L.push("신뢰도: A 생성 (리허설 기록)");
  L.push("상위 규격: docs/pair.md / docs/round.md / docs/roadmap.md 12.13");
  L.push("");
  L.push("검증로그: " + new Date().toISOString().slice(0, 10) +
         " / 창을 둘 띄우고 자리마다 두 화면을 나란히 받아 적었다 / 통과 / " +
         "값이 맞는 것과 두 사람이 읽고 알아듣는 것은 다른 일이다");
  L.push("");
  L.push("# 두 기기 리허설");
  L.push("");
  L.push("**검사가 아니라 리허설이다.** 두 화면에 뜨는 글을 그대로 나란히 적은 것이다.");
  L.push("왼쪽이 " + head.a + " 기기고 오른쪽이 " + head.b + " 기기다.");
  L.push("");
  L.push("| | |");
  L.push("|---|---|");
  L.push("| 주차 | " + head.week + "주 " + head.day + "일째 |");
  L.push("| 강의 | " + head.lec + "강 " + head.title + " |");
  L.push("| " + head.a + " 기기 쪽 | " + String(head.side).toUpperCase() + " |");
  L.push("");

  /* 나란히 적는다. 같은 줄에 두 화면이 있어야 어긋난 것이 보인다. */
  function pair(title, note, ta, tb) {
    L.push("---");
    L.push("");
    L.push("## " + title);
    L.push("");
    if (note) { L.push(note); L.push(""); }
    L.push("| " + head.a + " 기기 | " + head.b + " 기기 |");
    L.push("|---|---|");
    const la = tidy(ta).split("\n"), lb = tidy(tb).split("\n");
    const n = Math.max(la.length, lb.length);
    for (let i = 0; i < n; i++)
      L.push("| " + (la[i] || "").replace(/\|/g, "/") + " | " +
                    (lb[i] || "").replace(/\|/g, "/") + " |");
    L.push("");
  }

  let shots = 0;

  /* 1. 쪽 표시. 흘끗 봐서 갈리는가 (T242) */
  const side = async (p) => p.evaluate(() => ({
    tag: document.getElementById("sideTag").textContent,
    cls: (/side-(a|b|none)/.exec(document.body.className) || [])[1] }));
  const [sa, sb] = [await side(A), await side(B)];
  pair("쪽 표시", "화면 위 띠와 오른쪽 위 글자다. **둘이 달라야 한다.**",
       "띠 " + sa.cls + "\n글자 " + sa.tag, "띠 " + sb.cls + "\n글자 " + sb.tag);
  shots++;

  /* 2. 두 기기 확인 자리 (T240). 같아야 하는 것과 달라야 하는 것 */
  for (const p of [A, B]) { await p.evaluate(() => go("rules")); }
  await A.waitForTimeout(350);
  const rules = async (p) => p.evaluate(() =>
    (document.getElementById("splitCheck") || {}).innerText || "");
  pair("두 기기 확인 (규칙 탭)",
       "**판 표시와 회는 같아야 하고 쪽과 자리와 몫은 달라야 한다.**",
       await rules(A), await rules(B));
  shots++;

  /* 3. 회를 둘 다 두 번 넘긴다. 자리가 바뀌고 알림이 뜬다 (T243) */
  for (const p of [A, B]) {
    await p.click("#splitNext"); await p.waitForTimeout(120);
    await p.click("#splitNext"); await p.waitForTimeout(200);
  }
  const turn = async (p) => p.evaluate(() => ({
    note: (document.getElementById("splitTurn") || {}).innerText || "(알림 없음)",
    mine: [...document.querySelectorAll("#splitCheck .vmine>div")]
      .map((x) => x.textContent).join(" / ") }));
  const [ta2, tb2] = [await turn(A), await turn(B)];
  pair("두 회 넘긴 뒤", "자리가 바뀌는 회다. **알림이 서로 다른 자리를 말해야 한다.**",
       ta2.note + "\n몫 " + ta2.mine, tb2.note + "\n몫 " + tb2.mine);
  shots++;

  /* 4. 하루를 적고 세션 끝에 짝 코드를 견준다 (T234~T236) */
  await A.evaluate(() => {
    const r = day(today());
    r.status = "normal"; r.speak = 18; r.cards = 34; r.lre = 5;
    r.unres = [{ t: "못 알아들었다" }]; r.coll = [{ e: "got it" }];
    save();
  });
  for (const p of [A, B]) { await p.evaluate(() => go("ledger")); }
  await A.waitForTimeout(350);
  const codeBox = async (p) => p.evaluate(() =>
    (document.getElementById("pairBox") || {}).innerText || "");
  pair("세션 끝. 짝 맞추기",
       "한쪽만 적은 상태다. **코드가 달라야 하고 시작일은 같아야 한다.**",
       await codeBox(A), await codeBox(B));
  shots++;

  /* 5. 상대 코드를 쳐서 견준다 */
  const ca = await A.evaluate(() => pairCode());
  await B.fill("#pairIn", ca);
  await B.waitForTimeout(300);
  const out = await B.evaluate(() =>
    (document.getElementById("pairOut") || {}).innerText || "");
  L.push("---");
  L.push("");
  L.push("## " + head.b + " 기기가 상대 코드를 친 결과");
  L.push("");
  /* **처음에 "활동량만 다르다고 나와야 한다" 고 적었다. 틀렸다.**
     오늘을 정상으로 적으면 끝낸 세션이 하나 늘고 그것이 진도다.
     한쪽만 적었으면 진도가 갈린 것이 맞다. 앱이 맞고 내 설명이 틀렸다. T255 */
  L.push("한쪽만 적었으므로 **진도가 갈렸다고 나와야 한다.** 오늘을 적으면");
  L.push("끝낸 세션이 하나 늘고 그것이 진도다. 활동량은 그 아래에 따로 나온다.");
  L.push("");
  L.push("```");
  L.push(tidy(out));
  L.push("```");
  L.push("");
  shots++;

  /* 6. 합친다 */
  const raw = await A.evaluate(() => JSON.stringify(S));
  const after = await B.evaluate(async (r) => {
    const pl = mergePlan(S, JSON.parse(r));
    MG.plan = pl; MG.pick = {}; MG.name = "상대.json";
    renderMerge();
    const before = (document.getElementById("mgBox") || {}).innerText || "";
    pl.ask.forEach((q) => { MG.pick[q.path] = "theirs"; });
    renderMerge();
    document.getElementById("mgGo").click();
    await new Promise((x) => setTimeout(x, 300));
    return { before: before, code: pairCode(),
             ledger: (document.getElementById("pairBox") || {}).innerText || "" };
  }, raw);
  L.push("---");
  L.push("");
  L.push("## 합치기 칸 (누르기 전)");
  L.push("");
  L.push("**바꾸기 전에 무엇이 바뀌는지를 보인다.** 그것이 가져오기와 다른 점이다.");
  L.push("");
  L.push("```");
  L.push(tidy(after.before));
  L.push("```");
  L.push("");
  L.push("합친 뒤 " + head.b + " 기기 짝 코드: `" + after.code + "`");
  L.push("");
  L.push(after.code === ca ? "**" + head.a + " 기기와 같다.** 합쳐졌다."
                           : "**" + head.a + " 기기와 다르다.** `" + ca + "` 였다.");
  L.push("");
  shots++;

  /* 7. 즉시 가리기 (T244). **상대가 다가올 때 화면에 무엇이 남는가.** */
  await A.evaluate(() => { go("rules"); veilToggle(); });
  await A.waitForTimeout(250);
  const veiled = await A.evaluate(() => document.body.innerText);
  await A.evaluate(() => veilToggle());
  await A.waitForTimeout(200);
  L.push("---");
  L.push("");
  L.push("## " + head.a + " 기기가 가렸을 때 화면에 남는 글");
  L.push("");
  L.push("**여기 판의 글이 한 글자도 없어야 한다.** 상대 눈이 보는 것이 이것이다.");
  L.push("");
  L.push("```");
  L.push(tidy(veiled));
  L.push("```");
  L.push("");
  shots++;

  /* 8. 돌려 보기 (T241). 기기가 하나인 날. 건네는 사이에 무엇이 뜨는가 */
  const solo = await B.evaluate(async () => {
    S.device = null; S.solo = true; S.soloSeat = 0; save();
    go("rules");
    await new Promise((r) => setTimeout(r, 250));
    const before = (document.getElementById("splitCheck") || {}).innerText || "";
    soloHandOff(renderSplit);
    await new Promise((r) => setTimeout(r, 200));
    const cover = (document.getElementById("splitCheck") || {}).innerText || "";
    soloTake(renderSplit);
    await new Promise((r) => setTimeout(r, 200));
    const after = (document.getElementById("splitCheck") || {}).innerText || "";
    S.solo = false; S.soloHand = false; S.device = "b"; save();
    return { before, cover, after };
  });
  L.push("---");
  L.push("");
  L.push("## 기기가 하나인 날. 돌려 보기");
  L.push("");
  L.push("**건네는 사이에 앞 사람 몫이 한 글자도 없어야 한다.**");
  L.push("");
  L.push("| 첫째가 볼 때 | 건네는 중 | 둘째가 받은 뒤 |");
  L.push("|---|---|---|");
  const c1 = tidy(solo.before).split("\n"), c2 = tidy(solo.cover).split("\n"),
        c3 = tidy(solo.after).split("\n");
  const cn = Math.max(c1.length, c2.length, c3.length);
  for (let i = 0; i < cn; i++)
    L.push("| " + (c1[i] || "").replace(/\|/g, "/") + " | " +
                  (c2[i] || "").replace(/\|/g, "/") + " | " +
                  (c3[i] || "").replace(/\|/g, "/") + " |");
  L.push("");
  shots++;

  /* 9. 자리 맞추기 (T246). 세션 중에 어긋난 것을 사람이 견주는 자리 */
  const where = await A.evaluate(async () => {
    /* **시계를 고치면 다시 그려야 한다.** 안 그리면 조작줄 표시가 낡은 값을
       들고 있고 기록이 거짓이 된다. 실제로 3-30 으로 적혔다. T256 */
    T.run = true; gotoBlock(2); T.left = 900; paintTimer();
    await new Promise((r) => setTimeout(r, 250));
    const tag = document.getElementById("focusWhere").textContent;
    document.getElementById("focusWhere").click();
    await new Promise((r) => setTimeout(r, 200));
    const dock = (document.getElementById("whereDock") || {}).innerText || "";
    T.run = false; clearInterval(T.tick);
    return { tag, dock };
  });
  const whereB = await B.evaluate(async () => {
    T.run = true; gotoBlock(2); T.left = 780; paintTimer();
    await new Promise((r) => setTimeout(r, 250));
    const tag = document.getElementById("focusWhere").textContent;
    T.run = false; clearInterval(T.tick);
    return { tag };
  });
  L.push("---");
  L.push("");
  L.push("## 세션 중 자리 표시");
  L.push("");
  L.push("**둘이 소리 내어 읽어 견준다.** 갈렸으면 상대 것을 쳐서 맞춘다.");
  L.push("");
  L.push("| " + head.a + " 기기 | " + head.b + " 기기 |");
  L.push("|---|---|");
  L.push("| " + where.tag + " | " + whereB.tag + " |");
  L.push("");
  L.push("맞추는 칸에 뜨는 글이다.");
  L.push("");
  L.push("```");
  L.push(tidy(where.dock));
  L.push("```");
  L.push("");
  shots++;

  for (const who of ["a", "b"]) await dev[who].ctx.close();
  await browser.close();

  L.push("---");
  L.push("");
  L.push("## 읽고 나서");
  L.push("");
  L.push("이 자리는 사람이 채운다. **두 화면을 같은 줄에서 읽었을 때 걸리는 곳**을 적는다.");
  L.push("검사가 잡는 것은 값이 어긋난 것이고 여기서 잡는 것은 말이 안 맞물리는 것이다.");
  L.push("");

  fs.writeFileSync(OUT, L.join("\n") + "\n", "utf8");
  errs.slice(0, 5).forEach((m) => console.log("[실패] 화면 오류: " + m));
  console.log("out/manual/eng2p_rehearsal_pair.md / 기기 2개 / 자리 " + shots +
              "곳 / 화면 오류 " + errs.length + "개");
  process.exit(errs.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
