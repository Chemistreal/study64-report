/* 분기 관계 점검. **따로 적고 같이 편다.** T330~T331
 *
 * 매뉴얼 7.2 가 종이로 시키는 것이 이것이다.
 *
 *     각자 다른 방에서 아래 4항목을 혼자 적는다. 5분.
 *     상의하지 않는다. **상의하면 힘센 쪽 답으로 수렴한다.**
 *     동시에 종이를 뒤집어 공개한다.
 *     두 사람 답이 어긋난 항목에만 표시한다.
 *
 * 앱은 그동안 **두 사람 칸을 나란히 보여 주고 있었다.**
 * 종이가 막으려던 바로 그것을 앱이 하고 있었다.
 *
 * 이 검사가 재는 것은 하나다. **펴기 전에 상대 답이 안 보이는가.**
 *
 * 사용법:
 *     node scripts/check_relation.js
 *
 * 규격: out/manual/eng2p_manual.md 7장, docs/roadmap.md 12.15
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("관계 점검 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(PAGE);
  await page.evaluate(() => {
    S.onboarded = true; S.names.a = "가람"; S.names.b = "나래"; S.q = {}; saveNow();
  });
  await page.reload();
  await page.waitForTimeout(400);
  await page.evaluate(() => go("quarter"));
  await page.waitForTimeout(900);

  const fails = [];
  const no = (m) => fails.push(m);
  const rel = () => page.$eval("#qRel", (e) => e.innerText);
  const raw = () => page.$eval("#qRel", (e) => e.innerHTML);

  /* ---- 1. 펴기 전에는 한쪽만 보인다 ------------------------------------- */
  const t0 = await rel();
  if (!/누구 것을 적나/.test(t0)) no("누구 것을 적는지 고르는 자리가 없다");
  if (!/상의하지 않는다/.test(t0))
    no("상의하지 말라는 말이 없다. 상의하면 힘센 쪽 답으로 수렴한다");
  if (!/아직이다/.test(t0)) no("저쪽 칸이 가려져 있지 않다");
  /* **고르개가 한쪽 것만 있어야 한다.** 넷씩 여덟이면 둘 다 보이는 것이다 */
  const n0 = await page.$$eval("#qRel select", (a) => a.length);
  if (n0 !== 4) no("펴기 전에 고르개가 " + n0 + "개다. 한쪽 넷이어야 한다");

  /* ---- 2. 한쪽만 다 적으면 문이 안 열린다 -------------------------------- */
  await page.evaluate(() => {
    const st = qs(1);
    st.rel.a = { share: "비슷", lead: "비슷", fix: "양방향", ask: "비슷" };
    save(); renderQuarter();
  });
  await page.waitForTimeout(200);
  const t1 = await raw();
  if (/data-reveal/.test(t1))
    no("한쪽만 적었는데 펴는 단추가 켜졌다. 둘 다 적어야 열린다");
  /* **가려진 쪽이 다 적은 자리로 간다.** 처음에는 이 판정을 여기서 그냥 냈는데
     보이는 쪽이 다 적은 것이라 그 가지를 안 지났다. 이 검사의 첫 실패였고
     **검사가 틀렸다.** 열한 번째다 (T323 과 같은 종류).
     적는 쪽을 저쪽으로 옮기면 다 적은 쪽이 가려진다. */
  await page.evaluate(() => { qs(1).relSide = "b"; save(); renderQuarter(); });
  await page.waitForTimeout(200);
  if (!/다 적었다. 펴면 보인다/.test(await rel()))
    no("다 적은 쪽을 가린 칸이 그렇게 말하지 않는다");
  await page.evaluate(() => { qs(1).relSide = "a"; save(); renderQuarter(); });
  await page.waitForTimeout(200);

  /* ---- 3. 둘 다 적으면 열린다. **그래도 앱이 저절로 안 편다** ------------- */
  await page.evaluate(() => {
    const st = qs(1);
    st.rel.b = { share: "비슷", lead: "A쪽", fix: "양방향", ask: "비슷" };
    save(); renderQuarter();
  });
  await page.waitForTimeout(200);
  const t2 = await raw();
  if (!/data-reveal/.test(t2)) no("둘 다 적었는데 펴는 단추가 안 켜졌다");
  const t2t = await rel();
  if (/A쪽/.test(t2t.split("나래가 적은 것")[1] || ""))
    no("누르기 전에 저쪽 답이 보인다");
  if (!/둘이 같이 누른다/.test(t2t)) no("둘이 같이 누르라는 말이 없다");
  /* **펴기 전에는 어긋남 표시도 없어야 한다.**

     처음에는 편 뒤에만 재고 말았다. 그랬더니 "펴기 전에도 어긋난 자리를
     알려 준다" 는 깸이 안 잡혔다. 표시가 곧 상대 답을 알려 주는 것이다.
     주도권이 어긋났다고 하면 내 답이 아닌 쪽을 골랐다는 뜻이 된다. */
  if (/어긋났다/.test(t2t))
    no("펴기 전에 어긋난 자리를 알려 준다. 그것이 곧 상대 답을 알려 주는 것이다");

  /* ---- 4. 편 뒤 (T331). 어긋난 자리에만 표시가 붙는다 --------------------- */
  await page.click("#qRel [data-reveal]");
  await page.waitForTimeout(250);
  const t3 = await rel();
  const n3 = await page.$$eval("#qRel select", (a) => a.length);
  if (n3 !== 8) no("편 뒤에 고르개가 " + n3 + "개다. 여덟이어야 한다");
  const gaps = (t3.match(/어긋났다/g) || []).length;
  /* 주도권만 어긋나게 심었다. 두 사람 칸에 하나씩이라 둘이다 */
  if (gaps !== 2)
    no("어긋난 자리 표시가 " + gaps + "개다. 주도권 하나가 어긋나 둘이어야 한다");
  if (/발화 지분 · 어긋났다/.test(t3))
    no("안 어긋난 자리에 표시가 붙었다");
  /* **어느 쪽이 맞는지는 안 적는다** */
  if (/맞다|틀렸|옳/.test(t3)) no("어긋난 자리에 누가 맞는지를 적는다");
  const sig = await page.$eval("#qSignal", (e) => e.innerText);
  if (!/인식 불일치/.test(sig)) no("어긋났는데 인식 불일치 신호가 안 뜬다");

  /* ---- 5. 새로 열어도 펴진 채다 ----------------------------------------- */
  await page.reload();
  await page.waitForTimeout(500);
  await page.evaluate(() => go("quarter"));
  await page.waitForTimeout(900);
  const n5 = await page.$$eval("#qRel select", (a) => a.length);
  if (n5 !== 8)
    no("새로 열었더니 고르개가 " + n5 + "개다. 편 것은 그대로여야 한다");

  /* ---- 6. 다시 적기. **무르는 것이 아니라 다시 재는 것이다** -------------- */
  const t6 = await rel();
  if (!/다시 적는다/.test(t6)) no("다시 적는 자리가 없다");
  if (!/지난 분기 값은 안 지운다/.test(t6))
    no("지난 분기 값을 안 지운다는 말이 없다");
  await page.evaluate(() => {
    S.q.Q2 = { pass: {}, rel: { a: { lead: "A쪽" }, b: {} }, relOpen: 0 };
    saveNow();
  });
  const before = await page.evaluate(() => JSON.stringify(S.q.Q2.rel));
  await page.click("#qRel button.g");
  await page.waitForTimeout(250);
  const after = await page.evaluate(() => ({
    q1: JSON.stringify(S.q.Q1.rel), q2: JSON.stringify(S.q.Q2.rel),
    open: !!S.q.Q1.relOpen,
  }));
  if (after.q1 !== '{"a":{},"b":{}}') no("다시 적기가 이 분기 값을 안 지운다");
  if (after.open) no("다시 적기를 눌렀는데 아직 펴진 채다");
  if (after.q2 !== before) no("다시 적기가 다른 분기 값을 지운다: " + after.q2);
  if (!(await page.isVisible(".undo"))) no("다시 적기 뒤에 되돌릴 자리가 없다");

  /* ---- 7. 지배 수동 신호 알림 (T332). **분기 탭 밖에서도 보인다** -------- */
  const rx = await page.evaluate(() => {
    const out = {};
    S.q = {};
    /* 지분 편중과 수정 일방향. 로드맵 12.15 가 이름 붙인 둘이다 */
    S.q.Q1 = { pass: {}, relOpen: 1, rxAt: today(), rel: {
      a: { share: "7대 3 넘음", lead: "비슷", fix: "A에서 B로만", ask: "비슷" },
      b: { share: "비슷", lead: "비슷", fix: "A에서 B로만", ask: "비슷" } } };
    saveNow();
    out.hits = rxHits(1);
    out.now = rxNow();
    /* **셈이 한 자리에 있는가.** 분기 탭이 제 셈을 따로 하면 언젠가 갈린다 */
    out.tabOwn = /A.share===|hits.push\("share"\)/.test(String(renderQuarter));
    S.q = {}; saveNow();
    out.none = rxNow();
    return out;
  });
  if (rx.hits.indexOf("share") < 0) no("지분 7대 3 을 넘었는데 신호가 안 걸린다");
  if (rx.hits.indexOf("fix") < 0) no("수정이 한 방향인데 신호가 안 걸린다");
  if (!rx.now || rx.now.day !== 1) no("처방 첫날인데 " + JSON.stringify(rx.now));
  if (rx.now && rx.now.over) no("첫날인데 2주가 지났다고 한다");
  if (rx.none) no("신호가 없는데 처방이 뜬다");
  if (rx.tabOwn)
    no("분기 탭이 신호를 따로 센다. 셈이 두 자리에 있으면 언젠가 갈린다");

  const line = async (setup) => {
    await page.evaluate(setup);
    await page.evaluate(() => { go("today"); renderToday(); });
    await page.waitForTimeout(200);
    return page.$eval("#todaySlots", (e) => e.innerText);
  };
  const l1 = await line(() => {
    S.q = {}; S.q.Q1 = { pass: {}, relOpen: 1, rxAt: today(), rel: {
      a: { share: "7대 3 넘음", lead: "비슷", fix: "A에서 B로만", ask: "비슷" },
      b: { share: "비슷", lead: "비슷", fix: "A에서 B로만", ask: "비슷" } } };
    saveNow();
  });
  if (!/이 주 처방/.test(l1)) no("첫 화면에 처방 줄이 없다: " + l1.slice(-70));
  if (!/1 \/ 14일째/.test(l1)) no("처방 며칟날인지가 안 뜬다: " + l1.slice(-60));
  if (!/분기 탭에 있다/.test(l1)) no("자세한 것이 어디 있는지를 안 적는다");
  /* **누가 우세한지를 안 적는다.** 첫 화면에 이름이 뜨면 그것이 곧 지목이다 */
  if (l1.indexOf("가람") >= 0 || l1.indexOf("나래") >= 0)
    no("처방 줄에 사람 이름이 있다");
  if (/7대 3|한 방향|우세/.test(l1.split("이 주 처방")[1] || ""))
    no("처방 줄이 누가 어떻다를 적는다: " + l1.slice(-70));

  const l2 = await line(() => { S.q.Q1.rxAt = addDays(today(), -15); saveNow(); });
  if (!/처방 2주가 지났다/.test(l2)) no("2주가 지났는데 그 말이 없다: " + l2.slice(-70));
  if (/일째/.test(l2.split("처방 2주")[1] || ""))
    no("2주가 지났는데 아직 며칟날을 센다");
  if (!/다시 적는다/.test(l2)) no("재점검하라는 말이 없다");

  const l3 = await line(() => { S.q = {}; saveNow(); });
  if (/처방/.test(l3)) no("신호가 없는데 첫 화면에 처방이 뜬다: " + l3.slice(-60));

  /* **펴기 전에는 처방이 안 뜬다.** 신호는 두 답을 견줘서 나온다 */
  const l4 = await line(() => {
    S.q = {}; S.q.Q1 = { pass: {}, relOpen: 0, rxAt: today(), rel: {
      a: { share: "7대 3 넘음", lead: "비슷", fix: "A에서 B로만", ask: "비슷" },
      b: { share: "비슷", lead: "비슷", fix: "A에서 B로만", ask: "비슷" } } };
    saveNow();
  });
  if (/이 주 처방/.test(l4))
    no("아직 안 폈는데 처방이 뜬다. 신호는 두 답을 같이 봐야 나온다");

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 두 사람이 정말 따로 앉아 적는가**");
  console.log("관계 점검과 신호 33판 (가림 5, 문 4, 어긋남 5, 다시 적기 5, 신호 14) / 실패 %d",
              fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
