/* 화면 검사. 브라우저로 실제로 띄워 본다.
 *
 * 마크다운과 데이터는 파이썬 검사기가 본다. **화면은 그것으로 안 보인다.**
 * D구간 여덟 턴에서 화면에서만 나오는 결함이 일곱 번 나왔다.
 * 검사기 열넷이 다 통과하는 상태에서 앱이 안 뜨거나 값이 접히거나 인쇄가 깨져 있었다.
 *
 * 다섯 가지를 본다.
 *
 * 1. 첫 화면이 뜨는가. 콘솔에 오류가 없는가
 * 2. 오늘 배정이 288세션 전 구간에서 나오는가
 * 3. 세트 뷰어 288개 × 기기 세 상태에서 B 화면에 1단계 목록이 안 새는가
 * 4. 블록 3 진행표가 96편 다 구간을 둘 이상 내는가
 * 5. 카드 뷰어 600장 × 기기 세 상태에서 판정형 정답이 B면에 안 새는가
 *
 * 셋째와 다섯째가 이 검사의 핵심이다.
 * **B 가 목록을 보면 세트의 장치가 깨지고 정답을 보면 판정이 성립하지 않는다.**
 * 한 세트를 눈으로 보고 넘어가면 나머지 287개는 안 본 것이다.
 *
 * 쓰는 법:
 *     node eng2p/scripts/check_ui.js
 *
 * playwright-core 와 크로미움이 있어야 돈다. 없으면 건너뛰고 종료 코드 0을 낸다.
 * 검사를 못 돌린 것과 통과한 것을 갈라 적는다.
 * 규격: docs/roadmap.md 11.8
 */
"use strict";
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("화면 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}

let chromium;
try {
  chromium = require("playwright-core").chromium;
} catch (e) {
  skip("playwright-core 가 없다");
}
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

(async () => {
  const fails = [];
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));

  await page.goto(PAGE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(500);
  await page.evaluate(() => { S.onboarded = true; S.device = "a"; save(); renderToday(); });
  await page.waitForTimeout(400);

  if (errs.length) fails.push("첫 화면에서 오류: " + errs.slice(0, 3).join(" / "));

  // 1. 오늘 한 장이 값을 들고 있는가
  const sheet = await page.textContent("#todaySheet");
  ["세트", "카드", "미디어"].forEach((k) => {
    if (sheet.indexOf(k) < 0) fails.push("오늘 한 장에 " + k + " 가 없다");
  });

  // 2. 288세션 전 구간에서 배정이 나오는가
  const span = await page.evaluate(() => {
    const bad = [];
    const idx = window.ENG2P_INDEX;
    for (let d = 0; d < 288; d++) {
      const i = Math.min(d, 287), w = Math.floor(i / 6) + 1, day = (i % 6) + 1;
      const wk = idx.weeks[w - 1];
      if (!wk) { bad.push(d + " 주차 없음"); continue; }
      const dd = (wk.days || [])[day - 1];
      if (!dd) { bad.push(d + " 날 없음"); continue; }
      const L = (wk.lectures || []).filter((x) => x.no === dd.lecture)[0];
      if (!L || !L.title || !L.cards || !L.media) bad.push(d + " 강 정보가 빈다");
    }
    return bad;
  });
  span.slice(0, 5).forEach((m) => fails.push("배정: " + m));

  // 3. 세트 뷰어 288개 × 기기 세 상태
  await page.evaluate(() => gotoBlock(1));
  await page.waitForTimeout(1200);
  const viewer = await page.evaluate(() => {
    const bad = [];
    const sets = (DATA.sets && DATA.sets.items) || [];
    if (!sets.length) return ["세트 자료를 못 읽었다"];
    for (const s of sets) {
      for (const side of ["a", "b", null]) {
        S.device = side;
        let h;
        try { h = renderSetPane({ set: s.id, lectureNo: s.lecture, quarter: s.quarter }); }
        catch (e) { bad.push(s.id + " " + side + " 예외 " + e.message); continue; }
        if (!h || h.length < 200) bad.push(s.id + " " + side + " 너무 짧다");
        ["1단계", "2단계", "3단계", "4단계"].forEach((k) => {
          if (h.indexOf(k) < 0) bad.push(s.id + " " + side + " " + k + " 없음");
        });
        if (h.indexOf("undefined") >= 0) bad.push(s.id + " " + side + " 빈 값이 찍혔다");
        const items = ((s.steps || [])[0] || {}).items || [];
        for (const it of items) {
          const has = h.indexOf(esc(it)) >= 0;
          if (side === "b" && has) bad.push(s.id + " B 화면에 1단계 목록이 새어 나왔다");
          if (side === "a" && !has) bad.push(s.id + " A 화면에 1단계 목록이 빠졌다");
        }
      }
    }
    return bad;
  });
  viewer.slice(0, 8).forEach((m) => fails.push("세트 뷰어: " + m));

  // 4. 블록 3 진행표. 96편 다 구간이 둘 이상 나오는가
  await page.evaluate(() => gotoBlock(2));
  await page.waitForTimeout(1200);
  const drill = await page.evaluate(() => {
    const bad = [];
    const lec = (DATA.lectures && DATA.lectures.items) || [];
    if (!lec.length) return ["강의 자료를 못 읽었다"];
    for (const L of lec) {
      let h;
      try { h = renderDrillPane({ lectureNo: L.no, cards: L.cards }); }
      catch (e) { bad.push(L.no + "강 예외 " + e.message); continue; }
      if (h.indexOf("undefined") >= 0) bad.push(L.no + "강 빈 값이 찍혔다");
      const n = (h.match(/class="setstep/g) || []).length;
      if (n < 2) bad.push(L.no + "강 구간이 " + n + "개다");
    }
    return bad;
  });
  drill.slice(0, 8).forEach((m) => fails.push("진행표: " + m));

  // 5. 카드 뷰어 600장 × 기기 세 상태. **판정형 정답이 B면에 새면 안 된다.**
  const card = await page.evaluate(() => {
    const bad = [];
    const cards = (DATA.cards && DATA.cards.items) || [];
    if (!cards.length) return ["카드 자료를 못 읽었다"];
    for (const c of cards) {
      for (const side of ["a", "b", null]) {
        S.device = side; S.card = { k: cardKey(), i: 0 };
        const pl = { quarter: c.quarter, cards: { from: c.no, to: c.no }, lectureNo: 1 };
        let h;
        try { h = renderCardView(pl); }
        catch (e) { bad.push(c.id + " " + side + " 예외 " + e.message); continue; }
        if (!h) { bad.push(c.id + " " + side + " 빈 화면"); continue; }
        if (h.indexOf("undefined") >= 0) bad.push(c.id + " " + side + " 빈 값이 찍혔다");
        if (c.type === "판정" && side === "b" && h.indexOf("정답") >= 0)
          bad.push(c.id + " B면에 정답이 떴다");
      }
    }
    return bad;
  });
  card.slice(0, 8).forEach((m) => fails.push("카드 뷰어: " + m));

  const ncards = await page.evaluate(() => (DATA.cards && DATA.cards.items || []).length);
  const nsets = await page.evaluate(() => (DATA.sets && DATA.sets.items || []).length);
  await browser.close();

  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("첫 화면 1판 / 배정 288판 / 세트 뷰어 " + nsets + "개 x 3 = " + nsets * 3 +
              "판 / 진행표 96판 / 카드 뷰어 " + ncards + "개 x 3 = " + ncards * 3 + "판");
  console.log("실패 " + fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
