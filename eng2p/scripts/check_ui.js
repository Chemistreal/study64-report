/* 화면 검사. 브라우저로 실제로 띄워 본다.
 *
 * 마크다운과 데이터는 파이썬 검사기가 본다. **화면은 그것으로 안 보인다.**
 * D구간 여덟 턴에서 화면에서만 나오는 결함이 일곱 번 나왔다.
 * 검사기 열넷이 다 통과하는 상태에서 앱이 안 뜨거나 값이 접히거나 인쇄가 깨져 있었다.
 *
 * 열여덟 가지를 본다.
 *
 * 1. 첫 화면이 뜨는가. 콘솔에 오류가 없는가
 * 2. 오늘 배정이 288세션 전 구간에서 나오는가
 * 3. 세트 뷰어 288개 × 기기 세 상태에서 B 화면에 1단계 목록이 안 새는가
 * 4. 블록 3 진행표가 96편 다 구간을 둘 이상 내는가
 * 5. 카드 뷰어 600장 × 기기 세 상태에서 판정형 정답이 B면에 안 새는가
 * 6. 다시 낼 카드 600장이 다 어느 강에 붙는지 찾아지는가
 * 7. 96편의 미디어가 카탈로그에 있고 다른 탭에서도 세션 조작줄이 떠 있는가
 * 8. 대본이 file:// 에서 뜨는가. 52편이 다 있는가
 * 9. C-gen 음성으로 Q1 소리 트랙 통과 판정을 못 하게 막는가
 * 10. 세션 한 벌이 시작부터 끝까지 어긋남 없이 도는가
 * 11. 기기 둘이 각각 제 쪽을 보는가
 * 12. 통과 기준 458개가 다 그려지고 선이 있는 것은 값으로 갈리는가
 * 13. 세션이 시작되면 오늘 한 장이 숨고 블록 칸이 주인공이 되는가
 * 14. 망을 끊어도 자료가 뜨고 영상이 못 뜰 때 그 말을 하는가
 * 15. 시간이 흘러 블록이 저절로 넘어가고 그 자리가 저장되는가
 * 16. 블록 1과 4의 소리가 그 칸 안에서 나고 넘기면 꺼지는가
 * 17. 대본 줄을 누르면 그 자리로 가고 들으면 그 줄이 밝아지는가. **어림이라고 적는가**
 * 18. 서른 날을 몰아도 진도와 배정이 안 어긋나는가
 *
 * 셋째와 다섯째와 아홉째가 이 검사의 핵심이다. 셋 다 기준서가 정한 것이다.
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

  // 6. 다시 낼 카드 화면. 600장을 다 밀린 상태로 두고 그려 본다.
  //    다시 낼 카드는 오늘 강의 것이 아니므로 그 카드가 붙은 강을 찾아야 간격이 맞다.
  const dueMode = await page.evaluate(() => {
    const bad = [];
    const cards = (DATA.cards && DATA.cards.items) || [];
    S.cardDue = {};
    cards.forEach((c) => { S.cardDue[c.id] = { box: 1, due: "2020-01-01" }; });
    S.cardMode = "due"; S.card = null; S.device = "a";
    let h;
    try { h = renderCardView(plan()); }
    catch (e) { return ["다시 낼 카드 화면 예외 " + e.message]; }
    if (!h || h.indexOf("1 / " + cards.length) < 0) bad.push("600장이 다 안 들어왔다");
    for (const c of cards) {
      const n = cardLecture(c.id);
      if (!n) bad.push(c.id + " 가 어느 강에 붙는지 못 찾았다");
    }
    S.cardDue = {}; S.cardMode = "today"; S.card = null;
    return bad;
  });
  dueMode.slice(0, 6).forEach((m) => fails.push("다시 낼 카드: " + m));

  // 7. 미디어. 96편의 과가 다 카탈로그에 있는가.
  //    그리고 미디어 탭으로 가도 세션 조작줄이 떠 있는가.
  //    블록 1은 40분을 다른 탭에서 듣는 블록이다. 거기서 타이머가 사라지면 안 된다.
  const media = await page.evaluate(() => {
    const bad = [];
    const idx = window.ENG2P_INDEX;
    for (const w of idx.weeks) for (const L of w.lectures) {
      if (typeof MEDIA === "undefined") { bad.push("카탈로그가 없다"); break; }
      if (MEDIA.findIndex((x) => x.id === L.media) < 0)
        bad.push(L.no + "강 미디어 " + L.media + " 가 카탈로그에 없다");
    }
    return bad;
  });
  media.slice(0, 5).forEach((m) => fails.push("미디어: " + m));

  await page.evaluate(() => { gotoBlock(0); T.run = true; syncSessionFocus(); });
  await page.waitForTimeout(200);
  // 소리와 영상은 블록 칸 안에서 튼다. 미디어 탭으로 가는 것은 lib 단추다. T125
  const b1 = await page.$("[data-media=\"lib\"]");
  if (!b1) fails.push("블록 1에 미디어 탭으로 가는 단추가 없다");
  else {
    await b1.click();
    await page.waitForTimeout(500);
    if (!(await page.isVisible("#focusDock")))
      fails.push("미디어 탭에서 세션 조작줄이 사라졌다");
  }
  await page.evaluate(() => { T.run = false; syncSessionFocus(); go("today"); gotoBlock(2); });
  await page.waitForTimeout(400);

  // 8. 대본. file:// 에서 뜨는가. 52편이 다 있는가.
  //    fetch 로 가져오면 로컬에서 막힌다. 블록 4는 대본을 보는 블록이다.
  await page.evaluate(() => { go("today"); gotoBlock(3); });
  await page.waitForTimeout(300);
  const mb = await page.$("[data-media=\"lib\"]");
  if (mb) {
    await mb.click();
    await page.waitForTimeout(1500);
    const scriptText = await page.textContent("#libScript");
    if (scriptText.indexOf("못 연다") >= 0 || scriptText.indexOf("불러오는 중") >= 0)
      fails.push("대본: file:// 에서 대본이 안 떴다");
    const tr = await page.evaluate(() => {
      const t = (window.ENG2P_TRANSCRIPTS && window.ENG2P_TRANSCRIPTS.items) || null;
      if (!t) return ["대본 묶음을 못 읽었다"];
      const miss = [];
      for (const m of MEDIA) if (!t[m.id] || !t[m.id].length) miss.push(m.id);
      return miss;
    });
    tr.slice(0, 5).forEach((m) => fails.push("대본: " + m + " 이 없다"));
  }
  await page.evaluate(() => { go("today"); gotoBlock(2); });
  await page.waitForTimeout(300);

  // 9. C-gen 잠금. **C-gen 음성으로 Q1 소리 트랙 통과 판정을 하지 않는다.**
  //    오늘 52과는 다 C-real 이라 자료로는 안 걸린다. 규칙을 지키는지는 흉내 내서 본다.
  const lock = await page.evaluate(() => {
    const bad = [];
    const it = MEDIA[0];
    const old = it.grade;
    it.grade = "C-gen";
    const q1 = renderMediaPane({ media: it.id, quarter: "Q1", track: "소리" }, 1);
    const q2 = renderMediaPane({ media: it.id, quarter: "Q2", track: "청크" }, 1);
    it.grade = old;
    if (q1.indexOf("C-real 로만") < 0) bad.push("C-gen 인데 Q1 소리에서 안 막았다");
    if (q1.indexOf("끝냈다로 적기") >= 0) bad.push("C-gen 인데 Q1 소리에 판정 단추가 있다");
    if (q2.indexOf("끝냈다로 적기") < 0) bad.push("Q1 소리가 아닌데 판정 단추가 없다");
    // 자료 쪽도 본다. 지금 C-real 이 아닌 과가 있으면 그것부터 알아야 한다
    MEDIA.filter((x) => x.grade !== "C-real").forEach((x) => {
      bad.push(x.id + " 가 " + x.grade + " 다. Q1 소리 트랙에 쓰이는지 확인이 필요하다");
    });
    return bad;
  });
  lock.slice(0, 5).forEach((m) => fails.push("C-gen 잠금: " + m));

  // 10. 세션 한 벌 리허설. **두 시간을 처음부터 끝까지 돌려 본다.**
  //     앞의 아홉은 자리마다 본다. 이것은 자리 사이를 본다.
  //     블록을 넘기고 탭을 옮기고 적고 끝내는 동안 값이 어긋나지 않는지가 여기서 나온다.
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  await page.waitForTimeout(500);
  await page.evaluate(() => { S.onboarded = true; S.device = "a"; save(); renderToday(); });
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => ({ n: doneSessions(), lec: plan().lectureNo, set: plan().set }));
  await page.click("#tOne");
  await page.waitForTimeout(300);
  if (await page.evaluate(() => doneSessions()) !== before.n)
    fails.push("리허설: 시작만 눌렀는데 진도가 올랐다");
  // 블록 1 -> 4 를 차례로 지난다
  for (let bi = 0; bi < 4; bi++) {
    await page.evaluate((k) => gotoBlock(k), bi);
    await page.waitForTimeout(bi === 1 || bi === 2 ? 1400 : 400);
    const pane = await page.textContent("#blockPane");
    if (!pane || pane.length < 30) fails.push("리허설: 블록 " + (bi + 1) + " 칸이 비었다");
  }
  await page.evaluate(() => finishSession());
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => ({
    n: doneSessions(), lec: plan().lectureNo, set: plan().set,
    sess: S.session, rec: !document.getElementById("recCard").hidden,
  }));
  if (after.n !== before.n + 1) fails.push("리허설: 끝냈는데 진도가 안 올랐다");
  if (after.set === before.set) fails.push("리허설: 끝냈는데 다음 세트로 안 넘어갔다");
  if (after.sess) fails.push("리허설: 끝냈는데 세션 상태가 남아 있다");
  if (!after.rec) fails.push("리허설: 끝냈는데 기록 칸이 안 펴졌다");
  // 마무리 칸이 다음 날을 알리는가
  const nd = await page.textContent("#nextDay");
  if (!nd || nd.indexOf("다음은") < 0) fails.push("리허설: 끝냈는데 다음 날 배정이 안 떴다");
  if (nd && nd.indexOf(String(after.lec) + "강") < 0)
    fails.push("리허설: 마무리 칸의 강이 다음 배정과 다르다");
  if (errs.length) fails.push("리허설 중 오류: " + errs.slice(0, 3).join(" / "));

  // 11. 두 기기. 한쪽은 A, 한쪽은 B 를 본다.
  //     같은 페이지에서 기기 값만 바꿔 본다. 브라우저 맥락을 둘 띄우는 것과 결과가 같다.
  const two = await page.evaluate(() => {
    const bad = [];
    const pl = plan();
    const sid = pl.set, lec = pl.lectureNo;
    S.device = "a"; const sa = renderSetPane({ set: sid, lectureNo: lec, quarter: pl.quarter });
    S.device = "b"; const sb = renderSetPane({ set: sid, lectureNo: lec, quarter: pl.quarter });
    if (sa.indexOf("B 화면에 안 띄운다") >= 0) bad.push("A 기기에 B용 안내가 떴다");
    if (sb.indexOf("B 화면에 안 띄운다") < 0) bad.push("B 기기에 가림 안내가 없다");
    S.device = "a"; const ca = renderCardView(pl);
    S.device = "b"; const cb = renderCardView(pl);
    if (ca.indexOf(">A면") < 0 && ca.indexOf("A면 ·") < 0) bad.push("A 기기가 A면을 안 본다");
    if (cb.indexOf("B면 ·") < 0) bad.push("B 기기가 B면을 안 본다");
    S.device = "a";
    // 기기 고르면 기록을 한 기기에만 남기라는 말이 뜨는가
    paintTimer();
    const pick = document.getElementById("tSide");
    if (!pick || pick.textContent.indexOf("한 기기에만") < 0)
      bad.push("기기를 골랐는데 기록을 한 기기에만 남기라는 말이 없다");
    return bad;
  });
  two.slice(0, 5).forEach((m) => fails.push("두 기기: " + m));

  // 12. 블록 6 기록. 통과 기준이 96편 다 그려지고 선이 있으면 갈리는가.
  const crit = await page.evaluate(() => {
    const bad = [];
    const lec = (DATA.lectures && DATA.lectures.items) || [];
    let tot = 0, th = 0;
    for (const L of lec) {
      if (!L.criteria || !L.criteria.length) { bad.push(L.no + "강 통과 기준이 없다"); continue; }
      tot += L.criteria.length;
      th += L.criteria.filter((c) => c.threshold).length;
      for (const c of L.criteria) {
        if (!c.threshold) continue;
        const t2 = c.threshold;
        if (["min", "max", "eq"].indexOf(t2.op) < 0) bad.push(L.no + "강 선 부호가 이상하다");
        if (typeof t2.value !== "number") bad.push(L.no + "강 선 값이 수가 아니다");
        // 선 위아래를 넣어 보고 갈리는지.
        // eq 는 선 그 자체가 통과 값이다. 6강 "0건이어야 한다" 가 그것이다.
        // min 은 선보다 크면 통과, max 는 선보다 작으면 통과다.
        const hi = t2.op === "min" ? t2.value + 1 : t2.value;
        const lo = t2.op === "max" || t2.op === "eq" ? t2.value + 1 : t2.value - 1;
        if (critJudge(t2, hi) !== true) bad.push(L.no + "강 통과 값이 통과로 안 갈린다");
        if (critJudge(t2, lo) !== false) bad.push(L.no + "강 미달 값이 미달로 안 갈린다");
      }
    }
    if (tot < 400) bad.push("통과 기준이 " + tot + "개다. 458개여야 한다");
    if (th < 350) bad.push("선이 있는 항목이 " + th + "개다. 너무 적다");
    return bad;
  });
  crit.slice(0, 6).forEach((m) => fails.push("통과 기준: " + m));

  // 개수는 여기서 잡는다. 아래 검사가 페이지를 다시 열면 DATA 가 비고
  // 요약이 0판으로 나온다. **0판인데 통과로 보이면 안 돌린 것이 통과가 된다.**
  const ncards = await page.evaluate(() => (DATA.cards && DATA.cards.items || []).length);
  const nsets = await page.evaluate(() => (DATA.sets && DATA.sets.items || []).length);
  if (!ncards) fails.push("카드 자료가 안 열렸다");
  if (!nsets) fails.push("세트 자료가 안 열렸다");

  // 12.4 세션 중 화면. 오늘 한 장과 비상판 줄은 세션이 시작되면 숨는다.
  //      세션 전에는 오늘 한 장이 주인공이고 세션 중에는 블록 칸이 주인공이다.
  //      안 숨기면 블록 칸이 화면 밖으로 밀린다. 세션 중에 제일 많이 보는 칸이다.
  await page.evaluate(() => { go("today"); T.run = true; syncSessionFocus(); gotoBlock(2); });
  await page.waitForTimeout(1500);
  const focus = await page.evaluate(() => ({
    sheet: !!document.querySelector(".todaysheet") &&
           getComputedStyle(document.querySelector(".todaysheet")).display !== "none",
    emg: !!document.getElementById("emgLine") &&
         getComputedStyle(document.getElementById("emgLine")).display !== "none",
    pane: !!document.getElementById("blockPane") &&
          getComputedStyle(document.getElementById("blockPane")).display !== "none",
    h: document.getElementById("sessionCard").scrollHeight,
    pane_h: document.getElementById("blockPane").scrollHeight,
  }));
  if (focus.sheet) fails.push("세션 중 화면: 오늘 한 장이 안 숨었다");
  if (focus.emg) fails.push("세션 중 화면: 비상판 줄이 안 숨었다");
  if (!focus.pane) fails.push("세션 중 화면: 블록 칸이 안 보인다");
  // 카드 전체 높이를 재면 블록 칸이 길어질 때마다 걸린다. 블록 칸은 본문이고
  // 길어야 할 자리다. 내가 얹는 것은 그 위아래의 껍데기다. **껍데기만 잰다.**
  // T122 는 900px 에서 카드 1713px 을 재고 선을 2000 에 뒀다. 그 선은
  // 휴대폰 너비를 안 본 선이었다. T123 에서 390px 로 재니 2019px 이었다.
  if (focus.h - focus.pane_h > 950)
    fails.push("세션 중 화면: 블록 칸 뺀 껍데기가 " + (focus.h - focus.pane_h) + "px 다. 너무 길다");
  await page.evaluate(() => { T.run = false; syncSessionFocus(); });

  // 12.4b 휴대폰 너비. 두 사람이 각자 기기를 보는 자리라 한쪽은 휴대폰일 것이다.
  //       같은 화면이 390px 에서는 다르게 접힌다. 900px 에서 한 줄인 것이
  //       390px 에서 두 줄이 되고 그 두 줄이 껍데기로 쌓인다.
  //       **넓은 창에서만 재면 좁은 창의 결함이 통과로 나온다.**
  const mob = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
    isMobile: true, hasTouch: true,
  });
  const mp = await mob.newPage();
  await mp.goto(PAGE);
  await mp.evaluate(() => localStorage.clear());
  await mp.reload();
  await mp.waitForTimeout(600);
  await mp.evaluate(() => { S.onboarded = true; S.device = "a"; save(); renderToday();
                            go("today"); T.run = true; syncSessionFocus(); gotoBlock(2); });
  await mp.waitForTimeout(1600);
  const m = await mp.evaluate(() => ({
    h: document.getElementById("sessionCard").scrollHeight,
    pane_h: document.getElementById("blockPane").scrollHeight,
    dock: !!document.getElementById("focusDock") &&
          getComputedStyle(document.getElementById("focusDock")).display !== "none",
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  if (!m.pane_h) fails.push("휴대폰 너비: 블록 칸이 안 열렸다");
  if (m.h - m.pane_h > 950)
    fails.push("휴대폰 너비: 블록 칸 뺀 껍데기가 " + (m.h - m.pane_h) + "px 다. 너무 길다");
  if (!m.dock) fails.push("휴대폰 너비: 세션 조작줄이 안 보인다");
  // 가로로 넘치면 두 손가락으로 밀어야 글이 다 보인다. 세션 중에 그럴 짬이 없다.
  if (m.sw > m.cw) fails.push("휴대폰 너비: 가로로 " + (m.sw - m.cw) + "px 넘친다");
  await mob.close();

  // 12.5 오프라인. 바깥 요청을 다 막고 자료가 뜨는지 본다.
  //      소리와 대본과 이미지는 저장소 안에 있고 영상만 원격이다.
  //      영상이 못 뜨면 왜 못 뜨는지 적고 저장된 소리로 가는 길을 낸다.
  const offCtx = await browser.newContext({ viewport: { width: 880, height: 800 } });
  await offCtx.route((u) => /^https?:/.test(u.href), (r) => r.abort());
  const off = await offCtx.newPage();
  await off.goto(PAGE);
  await off.evaluate(() => localStorage.clear());
  await off.reload();
  await off.waitForTimeout(600);
  await off.evaluate(() => { S.onboarded = true; S.device = "a"; save(); renderToday(); });
  await off.waitForTimeout(500);
  const sheetOff = await off.textContent("#todaySheet");
  if (!sheetOff || sheetOff.indexOf("세트") < 0) fails.push("오프라인: 첫 화면이 안 떴다");
  await off.evaluate(() => gotoBlock(2));
  await off.waitForTimeout(1600);
  if (!(await off.evaluate(() => !!document.querySelector(".cardview"))))
    fails.push("오프라인: 카드가 안 떴다");
  await off.evaluate(() => { const i = MEDIA.findIndex((x) => x.id === "lle1-01");
                             openMedia(i, "video", false); });
  await off.waitForTimeout(1800);
  const note = await off.evaluate(() => {
    const e = document.getElementById("libMediaNote"); return e ? e.textContent : "";
  });
  if (note.indexOf("영상을 못 불러왔다") < 0)
    fails.push("오프라인: 영상이 안 떴는데 아무 말이 없다");
  if (note.indexOf("저장된 소리로") < 0)
    fails.push("오프라인: 저장된 소리로 가는 길이 없다");
  await offCtx.close();

  // 13. 저절로 넘어가는 길. 지금까지 검사는 블록을 손으로 넘겼다.
  //     시간이 흘러 넘어가는 길은 다른 코드다. tick 이 gotoBlock 을 부른다.
  //     한 번만 본다. 네 번 다 보면 검사가 15초 느려진다.
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  await page.waitForTimeout(400);
  await page.evaluate(() => { S.onboarded = true; S.device = "a"; save(); renderToday(); });
  await page.click("#tOne");
  await page.waitForTimeout(200);
  await page.evaluate(() => { const c = document.getElementById("tSound"); if (c) c.checked = false;
                              T.left = 2; });
  await page.waitForTimeout(2800);
  const auto = await page.evaluate(() => ({
    idx: T.idx, run: T.run,
    pane: (document.getElementById("blockPane") || {}).textContent || "",
    saved: S.session ? S.session.idx : null,
  }));
  if (auto.idx !== 1) fails.push("자동 넘김: 블록이 안 넘어갔다 (" + auto.idx + ")");
  if (!auto.run) fails.push("자동 넘김: 넘어간 뒤 타이머가 멈췄다");
  if (auto.pane.replace(/\s+/g, "").length < 60) fails.push("자동 넘김: 넘어간 블록 칸이 비었다");
  if (auto.saved !== 1) fails.push("자동 넘김: 넘어간 자리가 저장이 안 됐다");
  await page.evaluate(() => { T.run = false; clearInterval(T.tick); });

  // 15. 세션 안 재생. 블록 1과 4의 소리가 **그 칸 안에서** 난다.
  //     paintTimer 가 매초 돌고 그 안에서 블록 칸을 다시 그렸다. 심은 것이 1초를 못 살았다.
  //     그래서 재생기를 미디어 탭에 두고 40분을 그 탭에서 보냈다.
  //     이제 칸이 안 바뀌면 안 그린다. 그것이 유지되는지를 여기서 본다.
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(400);
  await page.evaluate(() => { S.onboarded = true; S.device = "a"; save(); renderToday(); });
  await page.click("#tOne");
  await page.waitForTimeout(900);
  const sp = await page.evaluate(async () => {
    const bad = [];
    const want = plan().media;                       // 강의가 지목한 과
    const a = document.querySelector("#sessPlayHost audio");
    if (!a) { bad.push("블록 1에 재생기가 없다"); return bad; }
    if (a.src.indexOf(want) < 0) bad.push("걸린 소리가 " + want + " 가 아니다: " + a.src);
    // 매초 다시 그려지면 여기서 죽는다
    try { await a.play(); } catch (e) { bad.push("재생이 안 된다: " + e.message); return bad; }
    await new Promise((r) => setTimeout(r, 2600));
    const a2 = document.querySelector("#sessPlayHost audio");
    if (a2 !== a) bad.push("2초 만에 재생기가 다른 것으로 바뀌었다");
    if (!a2 || a2.paused) bad.push("2초 만에 재생이 멈췄다");
    if (a2 && a2.currentTime < 1) bad.push("2초를 틀었는데 " + a2.currentTime + "초다");
    // 블록을 넘기면 꺼진다. 블록 2는 두 사람이 말하는 블록이다.
    gotoBlock(1);
    await new Promise((r) => setTimeout(r, 500));
    if (SESS.el) bad.push("블록을 넘겼는데 재생기가 남아 있다");
    if (a2 && !a2.paused) bad.push("블록을 넘겼는데 소리가 계속 난다");
    // 블록 4로 가면 다시 걸린다
    gotoBlock(3);
    await new Promise((r) => setTimeout(r, 900));
    if (!document.querySelector("#sessPlayHost audio, #sessPlayHost video"))
      bad.push("블록 4에 재생기가 없다");
    if ((document.getElementById("blockPane").textContent || "").indexOf("2회차") < 0)
      bad.push("블록 4가 2회차라고 안 적는다");
    gotoBlock(0);
    await new Promise((r) => setTimeout(r, 400));
    T.run = false; clearInterval(T.tick); stopSessPlay();
    return bad;
  });
  sp.slice(0, 6).forEach((m) => fails.push("세션 안 재생: " + m));

  // 16. 대본 동기. 줄을 누르면 그 자리로 가고 들으면 그 줄이 밝아진다.
  //     **시각은 어림이다.** 화면이 그 말을 하는지가 이 검사의 첫 항목이다.
  //     어림을 실측처럼 보여 주면 두 사람이 사실로 읽는다. 영어 제로라 못 가린다.
  await page.evaluate(() => { T.run = true; syncSessionFocus(); gotoBlock(0); });
  await page.waitForTimeout(2200);
  const sync = await page.evaluate(async () => {
    const bad = [];
    const it = MEDIA[MEDIA.findIndex((x) => x.id === plan().media)];
    const box = document.getElementById("sessScript");
    if (!box) { bad.push("대본 목록이 없다"); return bad; }
    const rows = [...box.querySelectorAll(".scline")];
    const want = ((DATA.transcripts || {}).items || {})[it.id] || [];
    if (rows.length !== want.length)
      bad.push("목록이 " + rows.length + "줄인데 대본은 " + want.length + "줄이다");
    // 어림 표시. 물결표와 머리말 둘 다 있어야 한다
    const times = rows.map((r) => r.querySelector(".sct").textContent);
    if (times.some((t) => t.indexOf("~") < 0))
      bad.push("어림 표시(물결표)가 없는 줄이 있다");
    const note = (document.querySelector(".syncnote") || {}).textContent || "";
    if (note.indexOf("어림") < 0) bad.push("머리말이 어림이라고 안 적는다");
    // 줄을 누르면 그 자리로 간다
    const cue = ((DATA.cues || {}).items || {})[it.id] || [];
    const k = Math.min(4, rows.length - 1);
    rows[k].click();
    await new Promise((r) => setTimeout(r, 700));
    if (Math.abs(SESS.el.currentTime - cue[k]) > 1)
      bad.push("줄을 눌렀는데 " + SESS.el.currentTime.toFixed(1) + "초다. " + cue[k] + "초여야 한다");
    if (!box.querySelector(".scline.cur")) bad.push("누른 줄이 안 밝아졌다");
    // 흘려 보내면 밝은 줄이 따라 바뀐다
    const el0 = SESS.el;
    SESS.el.currentTime = 0;
    await SESS.el.play();
    const seen = [];
    for (let i = 0; i < 4; i++) {
      await new Promise((r) => setTimeout(r, 800));
      seen.push([...box.querySelectorAll(".scline")].findIndex((x) => x.classList.contains("cur")));
    }
    if (seen[seen.length - 1] <= seen[0])
      bad.push("소리가 흐르는데 밝은 줄이 안 따라간다: " + seen.join(","));
    if (SESS.el !== el0) bad.push("대본을 쓰는 동안 재생기가 바뀌었다");
    T.run = false; clearInterval(T.tick); stopSessPlay();
    return bad;
  });
  sync.slice(0, 6).forEach((m) => fails.push("대본 동기: " + m));

  // 14. 연속 30일 몰기. 리허설(10)은 세션 **한 벌**을 본다. 이것은 세션 **사이**를 본다.
  //     한 벌은 늘 맞는다. 어긋나는 것은 스무 번째 세션이다.
  //     빠진 날과 비상판 날이 섞여야 진도와 배정이 갈리는 자리가 나온다.
  //     기준서와 매뉴얼 2.2: 비상판은 수행일이지만 진도가 아니다. 결석은 둘 다 아니다.
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(400);
  const many = await page.evaluate(() => {
    S.onboarded = true; S.device = "a"; S.start = "2026-08-10"; save();
    const bad = [];
    let d = "2026-08-10", normals = 0;
    for (let i = 0; i < 30; i++) {
      // 이레마다 비상판 하루와 결석 하루를 넣는다. 실제로 그렇게 산다.
      const st = i % 7 === 2 ? "emg" : i % 7 === 5 ? "absent" : "normal";
      window.today = () => d;                     // 날짜만 갈아 끼운다
      const pre = plan();
      if (st === "normal") { T.run = true; syncSessionFocus(); finishSession(); normals++; }
      else { const r = day(d); r.status = st; save(); renderToday(); }
      const post = plan();
      if (doneSessions() !== normals)
        bad.push(d + " " + st + ": 진도가 " + doneSessions() + " 다. " + normals + " 여야 한다");
      if (post.session !== normals + 1)
        bad.push(d + " " + st + ": 다음 배정이 " + post.session + "세션이다. " + (normals + 1) + " 여야 한다");
      if (st === "normal" && pre.set === post.set)
        bad.push(d + ": 정상 세션을 끝냈는데 세트가 " + pre.set + " 에 머물렀다");
      if (st !== "normal" && pre.set !== post.set)
        bad.push(d + " " + st + ": 진도가 아닌 날인데 세트가 넘어갔다");
      if (S.session) bad.push(d + ": 세션 상태가 남았다");
      d = addDays(d, 1);
    }
    // 대장의 수행일 셈이 상태별로 갈리는가. 빈 기록이 섞여도 안 흔들려야 한다.
    let n = 0, e = 0, a = 0;
    for (const k in S.days) {
      const s = S.days[k].status;
      if (s === "normal") n++; else if (s === "emg") e++; else if (s === "absent") a++;
    }
    // 30일에 i%7===2 가 넷(2,9,16,23), i%7===5 가 넷(5,12,19,26)이다. 나머지 스물둘이 정상이다.
    if (n !== 22 || e !== 4 || a !== 4)
      bad.push("30일 중 정상 " + n + " 비상판 " + e + " 결석 " + a + " 다. 22/4/4 여야 한다");
    return bad;
  });
  many.slice(0, 6).forEach((m) => fails.push("연속 30일: " + m));

  await browser.close();

  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("첫 화면 1판 / 배정 288판 / 세트 뷰어 " + nsets + "개 x 3 = " + nsets * 3 +
              "판 / 진행표 96판 / 카드 뷰어 " + ncards + "개 x 3 = " + ncards * 3 +
              "판 / 대본 52판 / 세션 리허설 1판 / 세션 안 재생 1판 / 대본 동기 1판 / 연속 30일 1판");
  console.log("실패 " + fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
