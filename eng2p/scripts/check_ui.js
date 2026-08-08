/* 화면 검사. 브라우저로 실제로 띄워 본다.
 *
 * 마크다운과 데이터는 파이썬 검사기가 본다. **화면은 그것으로 안 보인다.**
 * D구간 여덟 턴에서 화면에서만 나오는 결함이 일곱 번 나왔다.
 * 검사기 열넷이 다 통과하는 상태에서 앱이 안 뜨거나 값이 접히거나 인쇄가 깨져 있었다.
 *
 * 스물아홉 가지를 본다.
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
 * 14b. **세션 칸에서도** 망 없이 소리가 나고 영상이 죽으면 소리로 내려가는가
 * 15. 시간이 흘러 블록이 저절로 넘어가고 그 자리가 저장되는가
 * 16. 블록 1과 4의 소리가 그 칸 안에서 나고 넘기면 꺼지는가
 * 17. 대본 줄을 누르면 그 자리로 가고 들으면 그 줄이 밝아지는가. **어림이라고 적는가**
 * 18. 어림을 찍어 바로잡을 수 있고 **못이 없으면 표가 어림 그대로인가**
 * 19. 대본 화면 52과가 다 그려지고 못을 박아도 차례가 지켜지는가
 * 20. 한 줄 되풀이가 구간 안에서 안 멎고 도는가
 * 21. 여러 줄 구간이 늘고 줄고, video 요소로도 같은 코드가 도는가
 * 22. 회차가 대본 가림을 정하고 블록을 옮기면 그 기본값으로 돌아가는가
 * 23. 배속이 0.75~1.25 안에서만 움직이고 피치를 잡고 바로 저장되는가
 * 24. 소리 52개가 다 열리고 **내 프레임 세기가 브라우저 값과 맞는가**
 * 25. 마지막 줄 되풀이가 도는가. 끝을 길게 알면 한 바퀴도 안 돈다
 * 26. 카드에 근거 줄이 뜨고 눌러서 그 과 그 줄로 가는가
 * 27. 세션 중에 인쇄해도 종이에 오늘 것과 블록 칸이 찍히는가
 * 28. 서른 날을 몰아도 진도와 배정이 안 어긋나는가
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
  /* **차림표를 늦게 읽는다 (T213).** 첫 그림에는 안 붙는다.
     검사가 그것을 모르고 바로 읽으면 96편이 다 없다고 나온다.
     읽히고 나서 본다. 보는 것은 그대로다. */
  const media = await page.evaluate(async () => {
    await new Promise((r) => needMedia(r));
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
    // 둘째 자리는 회차가 아니라 **자리**다. T154 에 바뀌었다. 단추는 같이 듣는 자리에만 난다.
    const q1 = renderMediaPane({ media: it.id, quarter: "Q1", track: "소리" }, "together");
    const q2 = renderMediaPane({ media: it.id, quarter: "Q2", track: "청크" }, "together");
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
  await off.evaluate(async () => {
    await new Promise((r) => needMedia(r));      // 차림표를 늦게 읽는다 (T213)
    const i = MEDIA.findIndex((x) => x.id === "lle1-01");
    openMedia(i, "video", false);
  });
  await off.waitForTimeout(1800);
  const note = await off.evaluate(() => {
    const e = document.getElementById("libMediaNote"); return e ? e.textContent : "";
  });
  if (note.indexOf("영상을 못 불러왔다") < 0)
    fails.push("오프라인: 영상이 안 떴는데 아무 말이 없다");
  if (note.indexOf("저장된 소리로") < 0)
    fails.push("오프라인: 저장된 소리로 가는 길이 없다");
  // 12.5b 오프라인에서 세션 칸. 위는 미디어 탭을 본 것이다.
  //       **블록 1은 40분을 그 칸에서 듣는 블록이다.** 거기서 같은 길이 나야 한다.
  //       망이 끊긴 채로 두 시간을 여는 것이 이 물건의 정상 사용이다.
  //       종이와 같이 쓰는 물건이라 내려받아 열고, 그때 밖으로 나가는 것은 영상뿐이다.
  const offSess = await off.evaluate(async () => {
    const bad = [];
    S.onboarded = true; S.device = "a"; save();
    T.run = true; syncSessionFocus(); gotoBlock(0);
    await new Promise((r) => setTimeout(r, 2500));
    const el = document.querySelector("#sessPlayHost audio");
    if (!el) { bad.push("망 없이 세션 칸에 재생기가 없다"); return bad; }
    try { await el.play(); } catch (e) { bad.push("망 없이 소리가 안 난다: " + e.message); return bad; }
    await new Promise((r) => setTimeout(r, 1500));
    if (el.paused || el.currentTime < 0.5) bad.push("망 없이 소리가 안 흘렀다");
    if (!document.querySelectorAll("#sessScript .scline").length)
      bad.push("망 없이 대본이 안 떴다");
    if (!(DATA.cues && DATA.cues.items)) bad.push("망 없이 구간표가 안 열렸다");
    // 영상으로 바꾸면 왜 안 되는지 적고 소리로 가는 길을 낸다
    [...document.querySelectorAll("#blockPane [data-media]")]
      .find((x) => x.dataset.media === "video").click();
    for (let i = 0; i < 24; i++) {
      await new Promise((r) => setTimeout(r, 500));
      if (document.getElementById("sessMediaNote")) break;
    }
    const note = document.getElementById("sessMediaNote");
    if (!note) { bad.push("망 없이 영상이 안 뜨는데 세션 칸이 아무 말이 없다"); return bad; }
    if (note.textContent.indexOf("영상을 못 불러왔다") < 0) bad.push("세션 칸 안내가 이상하다");
    if (note.textContent.indexOf("저장된 소리로") < 0) bad.push("세션 칸에 소리로 가는 길이 없다");
    const b2 = note.querySelector("button");
    if (!b2) { bad.push("세션 칸에 저장된 소리로 가는 단추가 없다"); return bad; }
    b2.click();
    await new Promise((r) => setTimeout(r, 1800));
    if (!document.querySelector("#sessPlayHost audio")) bad.push("저장된 소리로 안 돌아왔다");
    if (SESS.mode !== "audio") bad.push("소리로 갔는데 방식이 " + SESS.mode + " 다");
    if (document.getElementById("sessMediaNote")) bad.push("소리로 갔는데 안내가 안 사라졌다");
    // 저장소를 덜 받은 경우. 소리 파일이 없으면 그 말을 해야 한다.
    const host = document.getElementById("sessPlayHost");
    const m2 = mountPlayer(host, { title: "x", audio: "media/english/audio/__none__.mp3" },
                           "audio", { play: false, noteId: "sessMediaNote" });
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 300));
      if (document.getElementById("sessMediaNote")) break;
    }
    const n2 = document.getElementById("sessMediaNote");
    if (!n2 || n2.textContent.indexOf("소리를 못 불러왔다") < 0)
      bad.push("소리 파일이 없는데 그 말을 안 한다");
    T.run = false; clearInterval(T.tick); leaveSessPlay();
    return bad;
  });
  offSess.slice(0, 6).forEach((m) => fails.push("망 없이 세션: " + m));

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
    /* **블록 4는 블록 1과 같은 회차다.** T154 에 그렇게 바꿨다.
       전에는 이 검사가 "블록 4는 2회차" 를 굳혀 놨다. 그것이 T153 에 나온 결함이었다.
       검사가 틀린 값을 지키고 있으면 고치는 쪽이 실패로 나온다. */
    const seatTxt = document.getElementById("blockPane").textContent || "";
    if (seatTxt.indexOf("1회차 초점은 소리다") < 0)
      bad.push("블록 4가 블록 1과 같은 회차를 안 적는다");
    if (seatTxt.indexOf("같이 듣는다") < 0)
      bad.push("블록 4가 같이 듣는 자리라고 안 적는다");
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

  // 17. 어림 바로잡기. 두 사람이 그 줄이 나는 순간을 찍으면 그 자리가 못이 된다.
  //     **못을 하나도 안 박았으면 표가 어림 그대로여야 한다.**
  //     T129 에서 끝을 딴 값으로 어림해 못 없이도 표가 당겨진 적이 있다.
  //     27.03초짜리 줄이 23.13초로 나왔다. 그것이 이 검사의 첫 항목이다.
  await page.evaluate(() => { T.run = true; syncSessionFocus(); gotoBlock(0); });
  await page.waitForTimeout(2200);
  const fix = await page.evaluate(async () => {
    const bad = [];
    const id = plan().media;
    const cue = ((DATA.cues || {}).items || {})[id] || [];
    const dur = ((DATA.audiolen || {}).items || {})[id];
    S.cues = {}; save();
    const eff0 = effCues(id, cue, dur);
    for (let i = 0; i < cue.length; i++)
      if (Math.abs(eff0[i] - cue[i]) > 0.01) {
        bad.push("못이 없는데 " + (i + 1) + "번째가 " + eff0[i] + "다. 어림은 " + cue[i] + "다");
        break;
      }
    if (!SESS.el) { bad.push("재생기가 없다"); return bad; }
    // 세 번째 줄을 지금 자리에 잡는다
    const at = Math.min(cue[2] + 2, dur - 1);
    SESS.el.currentTime = at;
    await new Promise((r) => setTimeout(r, 400));
    const rows = () => [...document.querySelectorAll("#sessScript .scline")];
    const t4before = rows()[4].querySelector(".sct").textContent;
    rows()[2].querySelector(".sca").click();
    await new Promise((r) => setTimeout(r, 800));
    const r2 = rows()[2];
    if (!r2.classList.contains("fixed")) bad.push("잡았는데 잡힌 표시가 없다");
    if (r2.querySelector(".sct").textContent.indexOf("~") >= 0)
      bad.push("잡은 줄에 아직 물결표가 있다");
    if (S.cues[id] === undefined || typeof S.cues[id][2] !== "number")
      bad.push("잡은 값이 저장이 안 됐다");
    if (rows()[4].querySelector(".sct").textContent === t4before)
      bad.push("잡았는데 뒤쪽 어림이 안 따라 움직였다");
    // 거꾸로 잡기를 거절한다
    SESS.el.currentTime = 0.2;
    await new Promise((r) => setTimeout(r, 300));
    rows()[5].querySelector(".sca").click();
    await new Promise((r) => setTimeout(r, 600));
    if (cueCount(id) !== 1)
      bad.push("앞선 못보다 이른 자리를 받아들였다");
    // 지우면 어림으로 돌아온다
    rows()[2].querySelector(".sca").click();
    await new Promise((r) => setTimeout(r, 700));
    if (cueCount(id) !== 0) bad.push("지웠는데 값이 남았다");
    // 대본 줄 수가 바뀌면 잡아 둔 자리는 딴 줄을 가리킨다. 그때는 버려야 한다.
    // **밀린 채로 남으면 화면에서는 잘 도는 것처럼 보인다.** T130
    S.cues = {}; S.cues[id] = { _n: cue.length, 2: 1.5 }; save();
    if (cueFixed(id, 2) !== 1.5) bad.push("줄 수가 같은데 잡아 둔 자리를 못 읽는다");
    cueRec(id, cue.length + 1);
    if (cueCount(id) !== 0) bad.push("대본 줄 수가 바뀌었는데 잡아 둔 자리가 남았다");
    S.cues = {}; save();
    const eff1 = effCues(id, cue, dur);
    for (let i = 0; i < cue.length; i++)
      if (Math.abs(eff1[i] - cue[i]) > 0.01) { bad.push("지웠는데 어림으로 안 돌아왔다"); break; }
    T.run = false; clearInterval(T.tick); stopSessPlay();
    return bad;
  });
  fix.slice(0, 6).forEach((m) => fails.push("어림 바로잡기: " + m));

  // 18. 대본 화면 52과 전수. 앞의 둘은 lle1-01 하나를 본 것이다.
  //     **한 과를 보고 넘어가면 나머지 쉰한 과는 안 본 것이다.**
  //     세트 뷰어와 카드 뷰어에서 같은 규칙을 썼다. 여기도 같게 한다.
  //     못을 하나 박은 상태도 같이 본다. 다시 편 표가 차례를 안 지키면
  //     줄을 눌렀을 때 뒤로 가는 일이 생긴다.
  const all52 = await page.evaluate(() => {
    const bad = [];
    const tr = ((DATA.transcripts || {}).items) || {};
    const cu = ((DATA.cues || {}).items) || {};
    const al = ((DATA.audiolen || {}).items) || {};
    const ids = Object.keys(tr);
    if (ids.length !== 52) bad.push("대본이 " + ids.length + "과다. 52과여야 한다");
    for (const id of ids) {
      const it = MEDIA[MEDIA.findIndex((x) => x.id === id)];
      if (!it) { bad.push(id + " 가 카탈로그에 없다"); continue; }
      S.cues = {};
      let h;
      try { h = renderSyncScript(it); }
      catch (e) { bad.push(id + " 그리다 죽었다: " + e.message); continue; }
      const n = (h.match(/class="scline/g) || []).length;
      if (n !== tr[id].length) bad.push(id + " 가 " + n + "줄인데 대본은 " + tr[id].length + "줄이다");
      if (h.indexOf("undefined") >= 0) bad.push(id + " 에 빈 값이 찍혔다");
      const anchors = (h.match(/data-anchor=/g) || []).length;
      if (anchors !== n) bad.push(id + " 의 자리 잡기 단추가 " + anchors + "개다. " + n + "개여야 한다");
      const tildes = (h.match(/~\d+:\d\d/g) || []).length;
      if (tildes !== n) bad.push(id + " 에 어림 표시가 " + tildes + "개다. " + n + "개여야 한다");
      // 못 없이 어림 그대로인가
      const eff0 = effCues(id, cu[id], al[id]);
      for (let i = 0; i < cu[id].length; i++)
        if (Math.abs(eff0[i] - cu[id][i]) > 0.01) { bad.push(id + " 가 못 없이 어림과 다르다"); break; }
      // 한가운데 줄에 못을 하나 박고 차례가 지켜지는지
      const mid = Math.floor(cu[id].length / 2);
      S.cues = {}; S.cues[id] = {};
      S.cues[id][mid] = Math.round(((cu[id][mid] + cu[id][mid + 1 < cu[id].length
        ? mid + 1 : mid]) / 2 + 0.5) * 100) / 100;
      const eff1 = effCues(id, cu[id], al[id]);
      for (let i = 1; i < eff1.length; i++)
        if (!(eff1[i] > eff1[i - 1])) {
          bad.push(id + " 못을 박으니 " + (i + 1) + "번째가 앞줄보다 안 늦다");
          break;
        }
      if (eff1[eff1.length - 1] >= al[id])
        bad.push(id + " 못을 박으니 마지막 줄이 소리 밖으로 나갔다");
    }
    S.cues = {}; save();
    return bad;
  });
  all52.slice(0, 8).forEach((m) => fails.push("대본 화면 전수: " + m));

  // 19. 되풀이. **A-B 를 손으로 안 찍는다.** 줄의 시작과 끝이 이미 A 와 B 다.
  //     한 바퀴 돌 때마다 숫자가 바뀌는데 그 숫자가 칸의 글자에 들어가면
  //     칸이 다시 그려지고 재생기가 다시 걸린다. 실제로 그렇게 만들었더니
  //     첫 바퀴에서 소리가 멎었다. **되풀이가 안 도는 되풀이였다.** T131
  await page.evaluate(() => { T.run = true; syncSessionFocus(); gotoBlock(0); });
  await page.waitForTimeout(2200);
  const loop = await page.evaluate(async () => {
    const bad = [];
    const rows = () => [...document.querySelectorAll("#sessScript .scline")];
    const btn = (k) => [...document.querySelectorAll("#blockPane [data-media]")]
      .find((x) => x.dataset.media === k);
    if (!rows().length) { bad.push("대본 목록이 없다"); return bad; }
    rows()[1].click();
    await new Promise((r) => setTimeout(r, 600));
    btn("loop").click();
    await new Promise((r) => setTimeout(r, 500));
    if (SESS.loop !== 1) bad.push("되풀이를 켰는데 " + SESS.loop + "번째 줄이다");
    const a = SESS.cue[SESS.loop], e = lineEnd(SESS.loop);
    const seen = [], paused = [];
    for (let i = 0; i < 14; i++) {
      await new Promise((r) => setTimeout(r, 500));
      seen.push(SESS.el.currentTime); paused.push(SESS.el.paused);
    }
    if (seen.some((t) => t > e + 0.4)) bad.push("구간 밖으로 나갔다: " + seen.map((x) => x.toFixed(1)).join(","));
    if (seen.some((t) => t < a - 0.4)) bad.push("구간 앞으로 나갔다");
    if (paused.some((x) => x)) bad.push("되풀이 도중에 소리가 멎었다");
    if (!SESS.laps) bad.push("한 바퀴도 안 돌았다");
    if (rows().findIndex((x) => x.classList.contains("loop")) !== 1)
      bad.push("되풀이하는 줄에 표시가 없다");
    // 딴 줄을 누르면 되풀이가 옮겨 간다. 안 옮기면 눌러도 곧바로 되돌아온다.
    rows()[5].click();
    await new Promise((r) => setTimeout(r, 900));
    if (SESS.loop !== 5) bad.push("딴 줄을 눌렀는데 되풀이가 안 옮겨 갔다");
    const a2 = SESS.cue[5], e2 = lineEnd(5), seen2 = [];
    for (let i = 0; i < 6; i++) { await new Promise((r) => setTimeout(r, 400)); seen2.push(SESS.el.currentTime); }
    if (seen2.some((t) => t > e2 + 0.4 || t < a2 - 0.4)) bad.push("옮긴 구간을 벗어났다");
    // 끄면 그냥 흘러간다
    btn("loop").click();
    await new Promise((r) => setTimeout(r, 700));
    if (SESS.loop !== null) bad.push("껐는데 되풀이가 남았다");
    const t0 = SESS.el.currentTime;
    await new Promise((r) => setTimeout(r, 2000));
    if (SESS.el.currentTime <= t0) bad.push("껐는데 소리가 안 흘러간다");
    T.run = false; clearInterval(T.tick); stopSessPlay();
    return bad;
  });
  loop.slice(0, 6).forEach((m) => fails.push("되풀이: " + m));

  // 20. 여러 줄 구간과 video 요소. 3회차 초점은 의미다. 한 줄만 돌면 앞뒤가 없다.
  //     **원격 영상은 이 상자에서 안 뜬다.** ERR_CONNECTION_RESET 이다.
  //     curl 로는 받아진다. 상자의 제약이고 앱의 결함이 아니다. T131 에 적었다.
  //     그래서 영상 주소는 못 본다. 대신 **video 요소 자체**를 걸고 같은 코드를 돌린다.
  //     video 요소는 소리만 든 파일도 문다. 되풀이 코드는 SESS.el 하나만 보므로
  //     여기서 도는 것과 영상에서 도는 것이 같은 길이다. 주소만 못 본 것이다.
  await page.evaluate(() => { T.run = true; syncSessionFocus(); gotoBlock(0); });
  await page.waitForTimeout(2200);
  const multi = await page.evaluate(async () => {
    const bad = [];
    const rows = () => [...document.querySelectorAll("#sessScript .scline")];
    const btn = (k) => [...document.querySelectorAll("#blockPane [data-media]")]
      .find((x) => x.dataset.media === k);
    rows()[1].click();
    await new Promise((r) => setTimeout(r, 600));
    btn("loop").click();
    await new Promise((r) => setTimeout(r, 500));
    if (SESS.loopN !== 1) bad.push("켜자마자 " + SESS.loopN + "줄이다. 한 줄이어야 한다");
    const e1 = loopEnd();
    btn("more").click(); await new Promise((r) => setTimeout(r, 350));
    btn("more").click(); await new Promise((r) => setTimeout(r, 500));
    if (SESS.loopN !== 3) bad.push("두 번 늘렸는데 " + SESS.loopN + "줄이다");
    const e3 = loopEnd();
    if (!(e3 > e1)) bad.push("구간을 늘렸는데 끝이 안 밀렸다");
    if (rows().filter((x) => x.classList.contains("loop")).length !== 3)
      bad.push("세 줄인데 표시된 줄이 " + rows().filter((x) => x.classList.contains("loop")).length + "개다");
    const a = SESS.cue[SESS.loop], seen = [], paused = [];
    for (let i = 0; i < 14; i++) {
      await new Promise((r) => setTimeout(r, 500));
      seen.push(SESS.el.currentTime); paused.push(SESS.el.paused);
    }
    if (seen.some((t) => t > e3 + 0.4 || t < a - 0.4)) bad.push("여러 줄 구간을 벗어났다");
    if (paused.some((x) => x)) bad.push("여러 줄 되풀이 도중에 소리가 멎었다");
    if (!SESS.laps) bad.push("여러 줄로 한 바퀴도 안 돌았다");
    // 끝을 넘겨 늘리려 하면 마지막 줄에서 멈춘다
    for (let i = 0; i < 20; i++) { btn("more").click(); await new Promise((r) => setTimeout(r, 60)); }
    if (SESS.loop + SESS.loopN > SESS.cue.length)
      bad.push("구간이 대본 끝을 넘었다: " + SESS.loop + "+" + SESS.loopN);
    /* 소리의 끝은 **재생기가 아는 값**이다. audiolen.js 는 프레임을 세서 낸 값이라
       0.1초쯤 길다. T136 에서 52과를 재 보고 알았다. 그 값으로 견주면 안 된다. */
    if (Math.abs(loopEnd() - SESS.el.duration) > 0.05)
      bad.push("끝까지 늘렸는데 구간 끝이 소리 끝이 아니다: " + loopEnd() +
               " / 소리 " + SESS.el.duration.toFixed(2));
    // 한 줄 밑으로는 안 내려간다
    for (let i = 0; i < 30; i++) { btn("less").click(); await new Promise((r) => setTimeout(r, 40)); }
    if (SESS.loopN !== 1) bad.push("끝까지 줄였는데 " + SESS.loopN + "줄이다");
    T.run = false; clearInterval(T.tick); stopSessPlay();

    // video 요소로도 같은 코드가 도는가
    const host = document.getElementById("sessPlayHost") ||
      document.getElementById("blockPane").appendChild(
        Object.assign(document.createElement("div"), { id: "sessPlayHost" }));
    const it = MEDIA[MEDIA.findIndex((x) => x.id === plan().media)];
    const v = mountPlayer(host, { title: it.title, video: it.audio }, "video",
                          { play: true, noteId: "sessMediaNote" });
    if (v.tagName !== "VIDEO") bad.push("video 요소가 아니다: " + v.tagName);
    SESS.el = v; SESS.id = it.id; SESS.loop = 1; SESS.loopN = 2; SESS.laps = 0; SESS.line = -1;
    v.ontimeupdate = syncCur;
    await new Promise((r) => setTimeout(r, 500));
    v.currentTime = SESS.cue[1];
    const ve = loopEnd(), vseen = [];
    for (let i = 0; i < 12; i++) { await new Promise((r) => setTimeout(r, 500)); vseen.push(v.currentTime); }
    if (v.error) bad.push("video 요소가 소리를 못 물었다: " + v.error.code);
    else {
      if (vseen.some((t) => t > ve + 0.4)) bad.push("video 요소에서 구간을 벗어났다");
      if (!SESS.laps) bad.push("video 요소에서 한 바퀴도 안 돌았다");
    }
    stopSessPlay();
    return bad;
  });
  multi.slice(0, 6).forEach((m) => fails.push("여러 줄 되풀이: " + m));

  // 21. 대본 가리기. **1회차에 글을 보면 소리를 안 듣는다.**
  //     기준서 10.3의 회차 초점이 소리 / 청크 / 의미다. 글이 다 보이면 세 회차가 다 의미가 된다.
  //     블록 1은 1회차라 가림이고 블록 4는 2회차라 덩어리만이다. 회차가 기본값을 정한다.
  await page.evaluate(() => { T.run = true; syncSessionFocus(); gotoBlock(0); });
  await page.waitForTimeout(2200);
  const veil = await page.evaluate(async () => {
    const bad = [];
    const box = () => document.getElementById("sessScript");
    const btn = () => [...document.querySelectorAll("#blockPane [data-media]")]
      .find((x) => x.dataset.media === "veil");
    const shown = () => {
      const e = box().querySelector(".scl");
      return getComputedStyle(e).fontSize !== "0px";
    };
    if (!box()) { bad.push("대본 목록이 없다"); return bad; }
    if (!box().classList.contains("veil2")) bad.push("블록 1이 가림이 아니다: " + box().className);
    if (shown()) bad.push("블록 1인데 글자가 보인다");
    // 다 보임까지 돌려 보고 다시 가림으로 돌아오는가
    const seq = [];
    for (let i = 0; i < 3; i++) {
      btn().click();
      await new Promise((r) => setTimeout(r, 700));
      seq.push([...box().classList].find((c) => c.indexOf("veil") === 0));
    }
    if (seq.join(",") !== "veil1,veil0,veil2")
      bad.push("가림 차례가 " + seq.join(",") + " 다. veil1,veil0,veil2 여야 한다");
    // 다 보임에서는 진짜 글자가 보여야 한다
    btn().click(); await new Promise((r) => setTimeout(r, 700));   // veil1
    btn().click(); await new Promise((r) => setTimeout(r, 700));   // veil0
    if (!shown()) bad.push("다 보임인데 글자가 안 보인다");
    const first = box().querySelector(".scl");
    if (!first.dataset.mask || first.dataset.mask.indexOf("낱말") < 0)
      bad.push("가릴 때 보여 줄 것이 없다: " + first.dataset.mask);
    // 블록을 옮기면 회차 기본값으로 돌아간다.
    // **회차가 정한다. 블록이 아니다.** 아직 한 회차도 안 끝냈으면 1회차라 가림이다. T154
    gotoBlock(3);
    await new Promise((r) => setTimeout(r, 2000));
    if (!box().classList.contains("veil2"))
      bad.push("블록 4가 1회차 가림이 아니다: " + box().className);
    if (SESS.veil !== null) bad.push("블록을 옮겼는데 손으로 고른 가림이 남았다");
    gotoBlock(0);
    await new Promise((r) => setTimeout(r, 1600));
    if (!box().classList.contains("veil2")) bad.push("블록 1로 돌아왔는데 가림이 아니다");
    T.run = false; clearInterval(T.tick); leaveSessPlay();
    return bad;
  });
  veil.slice(0, 6).forEach((m) => fails.push("대본 가리기: " + m));

  // 22. 배속. **0.75에서 1.25까지다.** 피치는 유지한다.
  //     피치를 안 잡으면 늦출 때 목소리가 낮아지고 그 낮아진 소리를 따라 하게 된다.
  //     그것은 다른 소리를 익히는 것이다. 소리 트랙이 통째로 헛돈다.
  //     고른 속도는 남는다. 두 사람이 정한 것을 다음 날 다시 정하게 하지 않는다.
  await page.evaluate(() => { T.run = true; syncSessionFocus(); gotoBlock(0); });
  await page.waitForTimeout(2200);
  const rate = await page.evaluate(async () => {
    const bad = [];
    const btn = (k) => [...document.querySelectorAll("#blockPane [data-media]")]
      .find((x) => x.dataset.media === k);
    const el = () => document.querySelector("#sessPlayHost audio");
    if (!el()) { bad.push("재생기가 없다"); return bad; }
    if (!el().preservesPitch) bad.push("피치를 안 잡는다");
    const first = el();
    setRate(1);
    btn("slow").click(); await new Promise((r) => setTimeout(r, 250));
    btn("slow").click(); await new Promise((r) => setTimeout(r, 250));
    if (Math.abs(el().playbackRate - 0.9) > 0.001)
      bad.push("두 번 늦췄는데 " + el().playbackRate + " 배다. 0.9 여야 한다");
    if (el() !== first) bad.push("속도를 바꾸니 재생기가 다시 걸렸다");
    if (!el().preservesPitch) bad.push("속도를 바꾸니 피치를 놓쳤다");
    if ((document.getElementById("sessRate") || {}).textContent.indexOf("0.90") < 0)
      bad.push("화면에 지금 속도가 안 적힌다");
    // 선을 넘지 않는다
    for (let i = 0; i < 12; i++) { btn("slow").click(); await new Promise((r) => setTimeout(r, 50)); }
    if (Math.abs(S.rate - 0.75) > 0.001) bad.push("바닥이 " + S.rate + " 다. 0.75 여야 한다");
    for (let i = 0; i < 20; i++) { btn("fast").click(); await new Promise((r) => setTimeout(r, 50)); }
    if (Math.abs(S.rate - 1.25) > 0.001) bad.push("천장이 " + S.rate + " 다. 1.25 여야 한다");
    // 라이브러리 손잡이와 같은 선을 쓰는가. 두 자리가 다르게 자르면 안 된다.
    const sl = document.getElementById("libRate");
    if (+sl.min !== 0.75 || +sl.max !== 1.25)
      bad.push("라이브러리 손잡이가 " + sl.min + "~" + sl.max + " 다. 세션과 다르다");
    if (Math.abs(+sl.value - S.rate) > 0.001) bad.push("라이브러리 손잡이가 안 따라왔다");
    // 미루지 않고 바로 쓰는가. 연달아 누르고 바로 닫으면 마지막 값이 안 남는다.
    const raw = JSON.parse(localStorage.getItem("eng2p") || localStorage.getItem(KEY) || "{}");
    if (Math.abs((raw.rate || 0) - 1.25) > 0.001)
      bad.push("저장된 속도가 " + raw.rate + " 다. 미뤄 쓰고 있다");
    setRate(1);
    T.run = false; clearInterval(T.tick); leaveSessPlay();
    return bad;
  });
  rate.slice(0, 6).forEach((m) => fails.push("배속: " + m));

  // 25. 근거 줄. **카드 문장이 실제 녹음의 어디에 있는지가 카드에 보여야 한다.**
  //     A는 영어 제로다. 자기 소리가 맞는지 스스로 못 고친다.
  //     원본 소리가 있는 자리를 아는 것이 유일한 길이고, 눌러서 그 자리로 간다.
  await page.evaluate(() => { T.run = true; syncSessionFocus(); gotoBlock(2); });
  await page.waitForTimeout(2600);
  const gnd = await page.evaluate(async () => {
    const bad = [];
    if (!DATA.ground) { bad.push("근거 자료가 안 열렸다"); return bad; }
    const g = DATA.ground.items || {};
    // 카드 자료와 열쇠가 맞는가. 안 맞으면 한 장도 안 뜬다
    const cards = (DATA.cards && DATA.cards.items) || [];
    const hit = cards.filter((c) => g[c.id]).length;
    if (hit < 100) bad.push("근거가 붙은 카드가 " + hit + "장이다. 열쇠가 어긋났다");
    const rows = [...document.querySelectorAll(".ground .grow")];
    if (!rows.length) { bad.push("카드 화면에 근거 줄이 없다"); return bad; }
    const btn = document.querySelector(".ground .gat");
    if (!btn) { bad.push("근거 자리로 가는 단추가 없다"); return bad; }
    const at = btn.dataset.at;
    if (!/^lle1-\d+(:\d+| 제목)$/.test(at)) bad.push("근거 표시가 이상하다: " + at);
    // 눌러서 그 과 그 줄로 가는가
    btn.click();
    await new Promise((r) => setTimeout(r, 2500));
    const id = at.split(":")[0], line = +at.split(":")[1];
    if (!MEDIA[LIB.active] || MEDIA[LIB.active].id !== id)
      bad.push("눌렀는데 그 과가 안 열렸다");
    const cue = ((DATA.cues || {}).items || {})[id] || [];
    if (cue[line - 1] != null && LIB.el && LIB.el.currentTime < cue[line - 1] - 0.5)
      bad.push("그 줄 앞에서 열렸다: " + LIB.el.currentTime.toFixed(1) + " / " + cue[line - 1]);
    T.run = false; clearInterval(T.tick); leaveSessPlay();
    if (LIB.el) { try { LIB.el.pause(); } catch (e) {} }
    return bad;
  });
  gnd.slice(0, 6).forEach((m) => fails.push("근거 줄: " + m));

  // 26. 종이. **세션 중에 인쇄하면 빈 종이가 나오고 있었다.**
  //     `.timer` 를 통째로 숨겼는데 그 안에 블록 칸이 들어 있다.
  //     블록 칸이 오늘 쓰는 카드와 진행표가 있는 자리다. 그것이 안 찍히면 종이가 소용없다.
  //     이 물건은 종이와 같이 쓰는 물건이다. 매뉴얼이 그렇게 적어 뒀다. T148
  // **오늘 탭으로 돌아온 다음에 잰다.** 앞 검사가 미디어 탭으로 갔다.
  // 다른 탭이 열려 있으면 오늘 탭은 통째로 숨어 있고 높이가 다 0으로 나온다.
  // 그러면 종이가 멀쩡한데 검사가 실패를 낸다. T113 에서 겪은 것과 같은 자리다.
  await page.evaluate(() => { go("today"); T.run = true; syncSessionFocus(); gotoBlock(2); });
  await page.waitForTimeout(2400);
  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(400);
  const paper = await page.evaluate(() => {
    const bad = [];
    // **display 만 보면 안 된다.** 부모가 숨어도 자식의 computed display 는 그대로다.
    // `.timer` 를 숨기고 `#blockPane` 의 display 를 읽으면 여전히 block 이라고 나온다.
    // 실제로 자리를 차지하는지를 봐야 한다. 높이가 0이면 종이에 안 찍힌다. T148
    const h = (s) => { const e = document.querySelector(s);
                       return e ? e.getBoundingClientRect().height : -1; };
    if (h("#blockPane") <= 0) bad.push("블록 칸이 종이에서 안 나온다");
    if (h(".todaysheet") <= 0) bad.push("오늘 한 장이 종이에서 안 나온다");
    if (h(".focusdock") > 0) bad.push("조작줄이 종이에 찍힌다");
    if (h(".ringwrap") > 0) bad.push("시계 링이 종이에 찍힌다");
    const cs = getComputedStyle(document.body);
    if (cs.backgroundColor !== "rgb(255, 255, 255)") bad.push("바탕이 흰색이 아니다: " + cs.backgroundColor);
    // 글자가 얼마나 찍히는가. 빈 종이가 나오면 여기서 걸린다.
    const n = (document.body.innerText || "").replace(/\s+/g, "").length;
    if (n < 400) bad.push("종이에 글자가 " + n + "자다. 빈 종이가 나온다");
    return bad;
  });
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => { T.run = false; clearInterval(T.tick); leaveSessPlay(); });
  paper.slice(0, 6).forEach((m) => fails.push("종이: " + m));

  // 23. 52과 전수 재생. **소리 파일을 하나씩 브라우저에 물려 본다.**
  //     여기서 두 가지가 한꺼번에 걸린다.
  //     하나는 파일이 실제로 열리는가다. 53MB 를 받다가 하나가 빠질 수 있다.
  //     또 하나는 **내가 만든 mp3 프레임 세기가 맞는가**다.
  //     audiolen.js 는 파이썬으로 프레임을 세서 냈다. 그 위에 구간표가 얹혀 있다.
  //     프레임 세기가 틀리면 52과의 모든 시각이 틀린다. 브라우저 값과 견준다.
  const play52 = await page.evaluate(async () => {
    const bad = [];
    const al = (DATA.audiolen && DATA.audiolen.items) || {};
    const cu = (DATA.cues && DATA.cues.items) || {};
    let worst = 0;
    for (const it of MEDIA) {
      const a = document.createElement("audio");
      a.preload = "metadata"; a.src = it.audio;
      const got = await new Promise((res) => {
        let done = false;
        a.onloadedmetadata = () => { if (!done) { done = true; res({ d: a.duration }); } };
        a.onerror = () => { if (!done) { done = true; res({ err: (a.error || {}).code }); } };
        setTimeout(() => { if (!done) { done = true; res({ to: true }); } }, 8000);
      });
      a.src = "";
      if (got.err != null) { bad.push(it.id + " 소리가 안 열린다 (오류 " + got.err + ")"); continue; }
      if (got.to) { bad.push(it.id + " 소리가 8초 안에 안 열렸다"); continue; }
      if (al[it.id] == null) { bad.push(it.id + " 길이가 audiolen 에 없다"); continue; }
      const gap = Math.abs(got.d - al[it.id]);
      if (gap > worst) worst = gap;
      // 인코더가 앞뒤에 붙인 빈 자리 때문에 0.1초쯤은 늘 벌어진다. 그 이상은 세기가 틀린 것이다.
      if (gap > 0.2)
        bad.push(it.id + " 잰 값 " + al[it.id] + " 와 브라우저 값 " +
                 got.d.toFixed(2) + " 가 " + gap.toFixed(2) + "초 다르다");
      const c = cu[it.id] || [];
      if (c.length && c[c.length - 1] >= got.d)
        bad.push(it.id + " 마지막 구간이 " + c[c.length - 1] + " 인데 소리는 " + got.d.toFixed(2) + " 다");
    }
    if (worst > 0.2) bad.push("제일 큰 차이가 " + worst.toFixed(3) + "초다");
    return bad;
  });
  play52.slice(0, 8).forEach((m) => fails.push("52과 전수 재생: " + m));

  // 24. 마지막 줄 되풀이. **끝을 0.1초 길게 알고 있으면 한 바퀴도 안 돈다.**
  //     끝에 못 닿으니 소리가 그냥 끝나 버린다. T136 에서 재 보고 알았다.
  await page.evaluate(() => { T.run = true; syncSessionFocus(); gotoBlock(0); });
  await page.waitForTimeout(2200);
  const lastLoop = await page.evaluate(async () => {
    const bad = [];
    const rows = [...document.querySelectorAll("#sessScript .scline")];
    if (!rows.length) { bad.push("대본 목록이 없다"); return bad; }
    rows[rows.length - 1].click();
    await new Promise((r) => setTimeout(r, 600));
    [...document.querySelectorAll("#blockPane [data-media]")]
      .find((x) => x.dataset.media === "loop").click();
    await new Promise((r) => setTimeout(r, 600));
    if (SESS.loop !== rows.length - 1) bad.push("마지막 줄이 안 잡혔다");
    if (loopEnd() > SESS.el.duration + 0.001)
      bad.push("구간 끝 " + loopEnd() + " 이 소리 끝 " + SESS.el.duration.toFixed(2) + " 보다 뒤다");
    for (let i = 0; i < 10; i++) await new Promise((r) => setTimeout(r, 500));
    if (!SESS.laps) bad.push("마지막 줄이 한 바퀴도 안 돌았다");
    if (SESS.el.paused || SESS.el.ended) bad.push("마지막 줄에서 소리가 끝나 버렸다");
    T.run = false; clearInterval(T.tick); leaveSessPlay();
    return bad;
  });
  lastLoop.slice(0, 6).forEach((m) => fails.push("마지막 줄 되풀이: " + m));

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

  // 15. 회차. **블록이 아니라 진행이 정한다.** T153 리허설에서 이것이 어긋나 있었다.
  //     기준서 10.3: 같은 자료를 최소 3회, 회차마다 초점 변경, 1회 소리 2회 청크 3회 의미.
  //     한 과를 사흘 도니 하루가 한 회차다. 하루에 자리가 둘(블록 1과 4)이고 둘은 같은 회차다.
  //
  //     **처음 판은 이 검사가 틀렸다.** 한 evaluate 안에서 눌렀더니 아무것도 안 적혔다.
  //     단추에 onclick 을 다는 것이 setTimeout 안이라 그 틱이 오기 전에 누른 것이다.
  //     리허설은 700밀리초씩 쉬어서 통과했다. 검사만 급했다. 그래서 걸음마다 쉰다.
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    S.onboarded = true; S.device = "a"; S.start = "2026-09-07"; save();
    window.today = () => "2026-09-07";
  });
  const WANT = ["소리", "청크", "의미"];
  const rounds = [];
  for (let r = 1; r <= 3; r++) {
    for (const seat of [[0, "각자"], [3, "같이"]]) {
      await page.evaluate((b) => { T.run = true; syncSessionFocus(); gotoBlock(b); }, seat[0]);
      await page.waitForTimeout(700);
      const got = await page.evaluate((s) => {
        const txt = document.querySelector("#blockPane").innerText;
        const btn = document.querySelector('#blockPane [data-media="pass"]');
        return { r: roundNow(plan().lectureNo), txt: txt, btn: btn ? btn.textContent.trim() : null, seat: s };
      }, seat[0]);
      const m = got.txt.match(/([0-9])회차 초점은 ([가-힣]+)다/);
      if (got.r !== r) rounds.push(r + "회차여야 하는데 roundNow 가 " + got.r + " 다");
      if (!m) { rounds.push(r + "회차 " + seat[1] + " 자리에 초점 문장이 없다"); continue; }
      if (m[1] !== String(r)) rounds.push(r + "회차인데 " + seat[1] + " 자리가 " + m[1] + "회차라 한다");
      if (m[2] !== WANT[r - 1])
        rounds.push(r + "회차 초점이 " + m[2] + " 다. " + WANT[r - 1] + " 여야 한다");
      if (seat[0] === 0 && got.btn) rounds.push(r + "회차: 각자 듣는 자리에 끝냈다 단추가 있다");
      if (seat[0] === 3 && !got.btn) rounds.push(r + "회차: 같이 듣는 자리에 끝냈다 단추가 없다");
      if (got.btn && got.btn.indexOf(r + "회차") < 0)
        rounds.push(r + "회차인데 단추가 " + got.btn + " 라 한다");
    }
    // 하루를 끝낸다. 회차가 딱 하나 올라야 한다. 지금 자리는 "같이" 다.
    const step = await page.evaluate(() => {
      const no = plan().lectureNo, before = lecPass(no);
      const b = document.querySelector('#blockPane [data-media="pass"]');
      if (b) b.click();
      return { before: before, after: lecPass(no) };
    });
    await page.waitForTimeout(400);
    if (step.after !== step.before + 1)
      rounds.push(r + "회차를 적었는데 셈이 " + step.before + " 에서 " + step.after + " 다");
  }
  // 다 채우면 단추가 사라지고 오늘 무엇을 할지를 말해야 한다
  await page.evaluate(() => { T.run = true; syncSessionFocus(); gotoBlock(3); });
  await page.waitForTimeout(700);
  const filled = await page.evaluate(() => ({
    txt: document.querySelector("#blockPane").innerText,
    btn: !!document.querySelector('#blockPane [data-media="pass"]'),
    veil: (SESS.veil = null, [veilOf(1), veilOf(2), veilOf(3)]),
  }));
  if (filled.btn) rounds.push("세 회차를 다 채웠는데 끝냈다 단추가 남았다");
  if (filled.txt.indexOf("다시 듣기") < 0)
    rounds.push("세 회차를 다 채운 뒤 오늘 무엇을 하라는 말이 없다");
  // 가림은 회차를 따른다. 1회차 가림, 2회차 덩어리만, 3회차 다 보임.
  [2, 1, 0].forEach((want, i) => {
    if (filled.veil[i] !== want)
      rounds.push((i + 1) + "회차 가림이 " + filled.veil[i] + " 다. " + want + " 이어야 한다");
  });
  /* **회차는 강마다 센다.** 96강이 52과를 나눠 쓰고 44과는 두 강이 같이 쓴다.
     과로 세면 뒤에 오는 강이 시작부터 다 찬 채로 뜬다. T156 에 나왔다.

     **화면을 본다. 도우미 함수를 안 부른다.** 처음에는 roundNow 를 직접 불러서
     되돌린 판으로 돌려도 안 걸렸다. 고친 자리가 칸을 그리는 쪽이었기 때문이다.
     검사가 볼 자리는 두 사람이 읽는 자리다. */
  const shared = await page.evaluate(() => {
    const idx = window.ENG2P_INDEX, use = {};
    let at = 0, want = null;
    idx.weeks.forEach((w) => (w.lectures || []).forEach((L) => {
      (use[L.media] = use[L.media] || []).push(L.no);
    }));
    const pair = Object.keys(use).filter((m) => use[m].length > 1)[0];
    if (!pair) return { bad: ["한 과를 두 강이 쓰는 자리가 없다. 검사 전제가 틀렸다"] };
    want = use[pair][1];
    // 뒤 강의 첫날이 몇 번째 세션인가
    let n = 0, found = -1;
    idx.weeks.forEach((w) => (w.days || []).forEach((d) => {
      if (found < 0 && d.lecture === want) found = n;
      n++;
    }));
    if (found < 0) return { bad: [want + "강이 배정에 없다"] };
    // 그 앞까지 정상으로 채운다. 진도는 정상 세션 수다.
    S.days = {};
    let day = S.start;
    for (let k = 0; k < found; k++) { S.days[day] = { status: "normal" }; day = addDays(day, 1); }
    window.today = () => day;
    // 앞 강이 그 과를 세 회차 다 돈 상태로 만든다
    const c = passRec()[pair] || (passRec()[pair] = {});
    c[1] = c[2] = c[3] = true; syncMediaDone(pair); save();
    at = plan().lectureNo;
    T.run = true; syncSessionFocus(); gotoBlock(3);
    return { pair: pair, want: want, at: at, found: found };
  });
  if (shared.bad) shared.bad.forEach((m) => rounds.push(m));
  else {
    await page.waitForTimeout(900);
    const seen = await page.evaluate(() => ({
      txt: document.querySelector("#blockPane").innerText,
      btn: (document.querySelector('#blockPane [data-media="pass"]') || {}).textContent,
      count: mediaPassCount(plan().media),
    }));
    if (shared.at !== shared.want)
      rounds.push("배정을 " + shared.want + "강에 못 맞췄다. 지금 " + shared.at + "강이다");
    else if (seen.txt.indexOf("1회차 초점은 소리다") < 0)
      rounds.push(shared.pair + " 를 앞 강이 다 돌았더니 " + shared.want
        + "강 화면이 1회차로 시작하지 않는다: " + seen.txt.slice(0, 90).replace(/\n/g, " "));
    else if (!seen.btn || seen.btn.indexOf("1회차") < 0)
      rounds.push(shared.want + "강 단추가 " + seen.btn + " 다. 1회차여야 한다");
    if (seen.count !== 3)
      rounds.push("미디어 탭의 과 회차가 " + seen.count + " 다. 3이어야 한다");
  }
  rounds.slice(0, 8).forEach((m) => fails.push("회차: " + m));

  // 16. 강의록에 박힌 역할 이름을 두 사람의 이름으로 갈아 끼우는가
  const named = await page.evaluate(() => {
    const bad = [];
    if (withNames("짝수 날은 남편이 A, 홀수 날은 아내가 A다.").indexOf("남편") < 0)
      bad.push("기본값인데 글이 바뀌었다");
    S.names = { a: "가람", b: "나래" };
    const s = withNames("짝수 날은 남편이 A, 홀수 날은 아내가 A다.");
    if (s.indexOf("가람") < 0 || s.indexOf("나래") < 0) bad.push("이름을 갈아 끼우지 않았다: " + s);
    if (s.indexOf("남편") >= 0 || s.indexOf("아내") >= 0) bad.push("옛 이름이 남았다: " + s);
    return bad;
  });
  named.forEach((m) => fails.push("이름: " + m));

  /* 29. **미리 보기가 세션 상태를 안 건드리는가.**
     오늘 칸을 눌러 재료를 열었을 뿐인데 "블록 2에서 멈췄다"가 되면 안 된다.
     보는 것과 하는 것은 다르다. T168 에서 그 갈래를 만들었으니 여기서 지킨다. */
  const peek = await (async () => {
    const p2 = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const bad = [];
    await p2.goto(PAGE);
    await p2.evaluate(() => { localStorage.clear(); });
    await p2.reload();
    await p2.waitForTimeout(400);
    await p2.evaluate(() => { S.onboarded = true; S.device = "a"; save(); renderToday(); });
    await p2.waitForTimeout(300);

    const before = await p2.evaluate(() => ({ idx: T.idx, left: T.left, sess: S.session }));
    // 세트 칸을 누른다. 블록 2가 펴져야 한다
    const set = await p2.$('[data-go="b:1"]');
    if (!set) bad.push("오늘 칸에 세트로 가는 자리가 없다");
    else {
      await set.click();
      await p2.waitForTimeout(400);
      const st = await p2.evaluate(() => ({
        idx: T.idx, left: T.left, sess: S.session, peek: PEEK,
        bar: !!document.querySelector(".peekbar"),
        body: (document.querySelector("#blockPane") || {}).innerText || "",
        resume: !!document.querySelector("#resumeGo"),
      }));
      if (st.peek !== 1) bad.push("세트를 눌렀는데 미리 보기가 블록 2가 아니다: " + st.peek);
      if (!st.bar) bad.push("미리 보기 띠가 없다");
      if (st.idx !== before.idx || st.left !== before.left)
        bad.push("미리 보기가 시계를 건드렸다: " + st.idx + " / " + st.left);
      if (st.sess) bad.push("미리 보기가 세션을 저장했다");
      if (st.resume) bad.push("미리 보기 뒤에 이어서 하기가 떴다");
      await p2.click("#peekClose");
      await p2.waitForTimeout(300);
      const af = await p2.evaluate(() => ({
        peek: PEEK, bar: !!document.querySelector(".peekbar"),
        timer: (document.querySelector("#sessionCard .timer") || {}).getBoundingClientRect
          ? document.querySelector("#sessionCard .timer").getBoundingClientRect().height : -1,
      }));
      if (af.peek !== null || af.bar) bad.push("닫았는데 미리 보기가 남았다");
      if (af.timer > 0) bad.push("닫았는데 시계가 펴진 채다");
    }

    // 강의 본문. 30만자라 누를 때 읽는다. 읽고 여섯 블록이 다 나오는지 본다
    const lec = await p2.$('[data-go^="l:"]');
    if (!lec) bad.push("오늘 칸에 강의 본문으로 가는 자리가 없다");
    else {
      await lec.click();
      await p2.waitForTimeout(900);
      const st = await p2.evaluate(() => ({
        heads: [...document.querySelectorAll(".lecbody h4")].map((x) => x.textContent),
        chars: (document.querySelector(".lecbody") || { innerText: "" }).innerText.length,
        idx: T.idx, sess: S.session,
      }));
      if (st.heads.length !== 6) bad.push("강의 본문 블록이 " + st.heads.length + "개다");
      if (st.chars < 1500) bad.push("강의 본문이 " + st.chars + "자다. 너무 짧다");
      if (st.idx !== before.idx || st.sess) bad.push("강의 본문이 세션을 건드렸다");
    }
    await p2.close();
    return bad;
  })();
  peek.forEach((m) => fails.push("미리 보기: " + m));

  /* 30. **손가락 하나로 블록을 옮기는가. 그리고 잘못 민 것이 안 넘어가는가.**
     넘김이 쉬워지면 잘못 넘김도 쉬워진다. 40분짜리 블록이다.
     그래서 넘어가는 것만 보지 않고 **안 넘어가야 할 것이 안 넘어가는지**도 본다. */
  const swipe = await (async () => {
    const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 },
                                            hasTouch: true });
    const p3 = await ctx2.newPage();
    const bad = [];
    await p3.goto(PAGE);
    await p3.evaluate(() => localStorage.clear());
    await p3.reload();
    await p3.waitForTimeout(400);
    await p3.evaluate(() => { S.onboarded = true; S.device = "a"; save(); renderToday(); });
    await p3.click("#tOne");
    await p3.waitForTimeout(450);

    async function slide(dx, dy) {
      await p3.evaluate(([dx, dy]) => {
        const host = document.querySelector("#blockPane");
        const r = host.getBoundingClientRect();
        const x = r.x + r.width / 2, y = r.y + Math.min(60, r.height / 2);
        const mk = (t, cx, cy) => new TouchEvent(t, {
          bubbles: true, cancelable: true,
          touches: t === "touchend" ? [] :
            [new Touch({ identifier: 1, target: host, clientX: cx, clientY: cy })],
          changedTouches: [new Touch({ identifier: 1, target: host, clientX: cx, clientY: cy })],
        });
        host.dispatchEvent(mk("touchstart", x, y));
        host.dispatchEvent(mk("touchend", x + dx, y + dy));
      }, [dx, dy]);
      await p3.waitForTimeout(320);
      return p3.evaluate(() => T.idx);
    }

    if (await p3.evaluate(() => T.idx) !== 0) bad.push("세션이 블록 1에서 안 시작했다");
    if (await slide(-140, 5) !== 1) bad.push("왼쪽으로 밀었는데 다음 블록으로 안 갔다");
    if (await slide(140, 5) !== 0) bad.push("오른쪽으로 밀었는데 이전 블록으로 안 갔다");
    if (await slide(-30, 5) !== 0) bad.push("조금 민 것이 넘어갔다. 잘못 밀기가 넘어간다");
    if (await slide(-140, 90) !== 0) bad.push("비스듬히 민 것이 넘어갔다. 위아래 넘기기와 헷갈린다");

    if (!(await p3.isVisible("#focusPrev"))) bad.push("조작줄에 이전 블록이 없다");
    await p3.click("#focusNext"); await p3.waitForTimeout(280);
    if (await p3.evaluate(() => T.idx) !== 1) bad.push("조작줄 다음이 안 먹는다");
    await p3.click("#focusPrev"); await p3.waitForTimeout(280);
    if (await p3.evaluate(() => T.idx) !== 0) bad.push("조작줄 이전이 안 먹는다");
    await ctx2.close();
    return bad;
  })();
  swipe.forEach((m) => fails.push("손가락: " + m));

  /* 31. **소리 여섯이 제 자리에서 나는가.**
     두 사람이 화면을 안 보고 있을 때가 많다. 마주 앉아 말하는 중이거나
     헤드폰을 끼고 듣는 중이다. 그때 화면만 바뀌면 아무도 모른다.
     소리는 귀로 듣는 것이라 눈으로 확인이 안 된다. 그래서 부른 자리를 적어 두고 본다. */
  const tones = await (async () => {
    const p4 = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const bad = [];
    await p4.goto(PAGE);
    await p4.evaluate(() => localStorage.clear());
    await p4.reload();
    await p4.waitForTimeout(400);
    await p4.evaluate(() => {
      window.__t = [];
      const o = window.tone;
      window.tone = function (k) { window.__t.push(k); return o(k); };
      S.onboarded = true; S.device = "a"; save(); renderToday();
    });
    const names = await p4.evaluate(() => Object.keys(TONE));
    ["start", "next", "loop", "swap", "blockend", "done"].forEach((k) => {
      if (names.indexOf(k) < 0) bad.push(k + " 소리가 없다");
    });

    await p4.click("#tOne");
    await p4.waitForTimeout(280);
    if ((await p4.evaluate(() => window.__t)).indexOf("start") < 0)
      bad.push("세션을 시작했는데 시작 소리가 안 났다");

    await p4.evaluate(() => $("#tSkip").click());
    await p4.waitForTimeout(280);
    if ((await p4.evaluate(() => window.__t)).indexOf("next") < 0)
      bad.push("블록을 넘겼는데 넘김 소리가 안 났다");

    // 블록 2 안에서 단계를 넘긴다. 그때 말하는 사람이 바뀐다
    await p4.evaluate(() => { T.left = BLOCKS[1].m * 60 - 9 * 60; paintTimer(); });
    await p4.waitForTimeout(380);
    if ((await p4.evaluate(() => window.__t)).indexOf("swap") < 0)
      bad.push("단계가 바뀌었는데 교대 소리가 안 났다");

    await p4.evaluate(() => finishSession());
    await p4.waitForTimeout(280);
    if ((await p4.evaluate(() => window.__t)).indexOf("done") < 0)
      bad.push("세션이 끝났는데 끝 소리가 안 났다");

    /* **끄면 안 나야 한다.** 소리는 끌 수 있어야 하고 끄면 정말 꺼져야 한다.
       밤에 아이가 자는 집도 있다. */
    await p4.evaluate(() => {
      window.__q = [];
      const A = window.AudioContext || window.webkitAudioContext;
      // 소리 상자를 안 건드리고 껐을 때 tone 이 일찍 돌아오는지만 본다
      $("#tSound").checked = false;
      window.__before = (window.AC && window.AC.state) || null;
    });
    const off = await p4.evaluate(() => {
      let made = 0;
      const a = window.AC;
      if (!a) return "상자 없음";
      const orig = a.createOscillator.bind(a);
      a.createOscillator = function () { made++; return orig(); };
      tone("done");
      a.createOscillator = orig;
      return made;
    });
    if (off !== 0 && off !== "상자 없음")
      bad.push("종료음을 껐는데 소리가 " + off + "개 났다");
    await p4.close();
    return bad;
  })();
  tones.forEach((m) => fails.push("소리: " + m));

  /* 32. **화면이 미는 방향이 진행 방향과 같은가.**
     다음 블록으로 가는데 화면이 왼쪽에서 들어오면 앞으로 가는 것인지
     되돌아가는 것인지 몸이 모른다. 손가락으로 미는 방향과도 어긋난다.
     그리고 **움직임을 줄이라고 한 사람에게는 안 움직여야 한다.** */
  const motion = await (async () => {
    const bad = [];
    for (const reduce of [false, true]) {
      const ctx3 = await browser.newContext({ viewport: { width: 390, height: 844 },
        reducedMotion: reduce ? "reduce" : "no-preference" });
      const p5 = await ctx3.newPage();
      await p5.goto(PAGE);
      await p5.evaluate(() => localStorage.clear());
      await p5.reload();
      await p5.waitForTimeout(380);
      await p5.evaluate(() => { S.onboarded = true; S.device = "a"; save(); renderToday(); });
      await p5.click("#tOne");
      await p5.waitForTimeout(280);

      await p5.evaluate(() => $("#tSkip").click());
      await p5.waitForTimeout(60);
      const n = await p5.evaluate(() => {
        const e = document.querySelector("#blockPane");
        return { cls: e.className, anim: getComputedStyle(e).animationName };
      });
      await p5.waitForTimeout(280);
      await p5.evaluate(() => $("#tPrev").click());
      await p5.waitForTimeout(60);
      const b2 = await p5.evaluate(() => {
        const e = document.querySelector("#blockPane");
        return { cls: e.className, anim: getComputedStyle(e).animationName };
      });

      if (n.cls.indexOf("slide-next") < 0) bad.push("다음 블록인데 앞으로 미는 표시가 없다");
      if (b2.cls.indexOf("slide-prev") < 0) bad.push("이전 블록인데 뒤로 미는 표시가 없다");
      if (reduce) {
        if (n.anim !== "none" || b2.anim !== "none")
          bad.push("움직임을 줄이라고 했는데 움직인다: " + n.anim + " / " + b2.anim);
      } else {
        if (n.anim !== "slideNext") bad.push("다음 블록 움직임이 " + n.anim + " 이다");
        if (b2.anim !== "slidePrev") bad.push("이전 블록 움직임이 " + b2.anim + " 이다");
      }
      await ctx3.close();
    }
    return bad;
  })();
  motion.forEach((m) => fails.push("움직임: " + m));

  /* 33. **길 지도.** 48주가 어디까지 왔고 어느 주에 무엇이 있는지를 한 장에 편다.
     띠는 어디까지 왔는지만 말했다. 어느 주에 무엇이 있는지는 안 말했다.
     그것을 알려면 자료 탭에서 96편 중에 찾아야 했다.
     **여기서도 시계를 안 건드린다.** 보는 자리다. */
  const wmap = await (async () => {
    const ctx4 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p6 = await ctx4.newPage();
    const bad = [];
    await p6.goto(PAGE);
    await p6.evaluate(() => {
      function iso(d){var z=new Date(d.getTime()-d.getTimezoneOffset()*60000);
        return z.toISOString().slice(0,10);}
      var now=new Date(), st=new Date(now.getTime()-138*86400000), days={};
      for(var i=0;i<138;i++){var x=new Date(st.getTime()+i*86400000);
        if(x.getDay()===0) continue;
        days[iso(x)]={status:"normal",h:2,speak:12,cards:30,lre:6};}
      localStorage.setItem("eng2p.v1",JSON.stringify(
        {v:1,names:{a:"남편",b:"아내"},start:iso(st),days:days,
         media:{done:{},fav:{},last:null,pass:{}},wk:0,onboarded:true,session:null,
         device:null,recOpen:false,emgOpen:false,card:null,cardDue:{},
         cardMode:"today",cues:{},rate:1,fs:0}));
    });
    await p6.goto(PAGE);
    await p6.waitForTimeout(520);

    const open = await p6.$('[data-go="map"]');
    if (!open) { bad.push("48주 띠를 누를 수가 없다"); await ctx4.close(); return bad; }
    await open.click();
    await p6.waitForTimeout(420);

    const m = await p6.evaluate(() => ({
      cells: document.querySelectorAll(".wcell").length,
      done: document.querySelectorAll(".wcell.done").length,
      now: document.querySelectorAll(".wcell.now").length,
      q: document.querySelectorAll(".wcell.qstart").length,
      lit: document.querySelectorAll(".wcell .wdots i.on").length,
      idx: T.idx, sess: S.session,
    }));
    if (m.cells !== 48) bad.push("주 칸이 " + m.cells + "개다. 48이어야 한다");
    if (m.now !== 1) bad.push("이번 주 표시가 " + m.now + "개다");
    if (m.done !== 19) bad.push("지나온 주가 " + m.done + "개다. 19여야 한다");
    if (m.q !== 3) bad.push("분기 금이 " + m.q + "개다. 셋이어야 한다");
    if (m.lit !== 120) bad.push("채운 날이 " + m.lit + "개다. 120이어야 한다");
    if (m.idx !== 0 || m.sess) bad.push("길 지도가 세션을 건드렸다");

    await p6.click('[data-w="20"]');
    await p6.waitForTimeout(360);
    const d = await p6.evaluate(() => {
      const e = document.querySelector(".wdetail");
      return { has: !!e, lec: document.querySelectorAll(".wlec").length,
               txt: e ? e.innerText : "" };
    });
    if (!d.has) bad.push("주를 눌렀는데 안 펴진다");
    if (d.lec !== 2) bad.push("그 주 강의가 " + d.lec + "편이다. 둘이어야 한다");
    /* **그 주에 필요한 다섯이 다 나와야 한다.** 강의 세트 카드 소리 비상판이다.
       하나만 빠져도 그것 하나 때문에 자료 탭으로 가게 된다. */
    [["Q2-120", "세트"], ["092 ~ 097", "카드"], ["lle1-29", "소리"],
     ["비상판 36", "비상판"], ["250자", "과제"]].forEach(function (p) {
      if (d.txt.indexOf(p[0]) < 0) bad.push("그 주 " + p[1] + " 이 안 적혀 있다");
    });
    const med = await p6.$$(".wmed");
    if (med.length !== 2) bad.push("소리로 가는 자리가 " + med.length + "개다. 둘이어야 한다");
    else {
      await med[1].click();
      await p6.waitForTimeout(620);
      const g = await p6.evaluate(() => ({
        tab: !document.querySelector("#t-media").hidden,
        el: !!document.querySelector("#libMediaHost audio,#libMediaHost video"),
        idx: T.idx, sess: S.session,
      }));
      if (!g.tab) bad.push("소리를 눌렀는데 미디어 탭이 안 열린다");
      if (!g.el) bad.push("소리를 눌렀는데 재생기가 안 붙는다");
      if (g.idx !== 0 || g.sess) bad.push("지도에서 소리를 여니 세션이 바뀌었다");
      /* 지도로 돌아온다. **편 주는 그대로 남아 있다.**
         남아 있는데 또 누르면 접힌다. 접혔을 때만 누른다. */
      await p6.evaluate(() => go("today"));
      await p6.waitForTimeout(300);
      await p6.click('[data-go="map"]');
      await p6.waitForTimeout(340);
      if (!(await p6.$(".wdetail"))) {
        await p6.click('[data-w="20"]');
        await p6.waitForTimeout(320);
      }
    }

    await p6.click(".wlec");
    await p6.waitForTimeout(820);
    const n = await p6.evaluate(() => document.querySelectorAll(".lecbody h4").length);
    if (n !== 6) bad.push("지도에서 연 강의 본문이 " + n + "블록이다");
    await ctx4.close();
    return bad;
  })();
  wmap.forEach((m) => fails.push("길 지도: " + m));

  /* 34. **지도가 무슨 일이 있었는지도 말하는가.**
     칸이 채워지는 것은 세션 수로만 정해진다. 비상판으로 때운 날도 결석한 날도
     칸에 안 나온다. 그것만 보면 순조로워 보인다.
     진도는 세션 수로, 달력은 날짜로 센다. **둘의 차이가 이 지도의 값이다.** */
  const tally = await (async () => {
    const ctx5 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p7 = await ctx5.newPage();
    const bad = [];
    await p7.goto(PAGE);
    // 정상 100, 비상판 9, 결석 12. 달력은 훨씬 앞서 있다
    await p7.evaluate(() => {
      function iso(d){var z=new Date(d.getTime()-d.getTimezoneOffset()*60000);
        return z.toISOString().slice(0,10);}
      var now=new Date(), st=new Date(now.getTime()-160*86400000), days={};
      var n=0,e=0,a=0;
      for(var i=0;i<160;i++){var x=new Date(st.getTime()+i*86400000);
        if(x.getDay()===0) continue;
        var k=iso(x);
        if(n<100){days[k]={status:"normal",h:2,speak:12,cards:30,lre:6};n++;}
        else if(e<9){days[k]={status:"emg"};e++;}
        else if(a<12){days[k]={status:"absent"};a++;}}
      localStorage.setItem("eng2p.v1",JSON.stringify(
        {v:1,names:{a:"남편",b:"아내"},start:iso(st),days:days,
         media:{done:{},fav:{},last:null,pass:{}},wk:0,onboarded:true,session:null,
         device:null,recOpen:false,emgOpen:false,card:null,cardDue:{},
         cardMode:"today",cues:{},rate:1,fs:0}));
    });
    await p7.goto(PAGE);
    await p7.waitForTimeout(520);
    const pl = await p7.evaluate(() => plan());
    if (pl.week !== 17) bad.push("정상 100회인데 진도가 " + pl.week + "주다. 17이어야 한다");
    if (pl.behind <= 0) bad.push("비상판과 결석이 스물하나인데 밀림이 " + pl.behind + " 이다");

    await p7.click('[data-go="map"]');
    await p7.waitForTimeout(420);
    const m = await p7.evaluate(() => ({
      txt: (document.querySelector(".wtally") || { innerText: "" }).innerText,
      note: !!document.querySelector(".wnote"),
      cal: document.querySelectorAll(".wcell.cal").length,
      now: document.querySelectorAll(".wcell.now").length,
    }));
    ["100", "9", "12"].forEach(function (v, i) {
      const what = ["정상", "비상판", "결석"][i];
      if (m.txt.indexOf(v) < 0) bad.push(what + " 날 수가 지도에 없다: " + m.txt);
    });
    if (m.txt.indexOf("밀렸다") < 0) bad.push("밀린 주 수가 지도에 없다");
    if (!m.note) bad.push("비상판과 결석이 칸을 안 채운다는 설명이 없다");
    if (m.cal !== 1) bad.push("달력상 이번 주 표시가 " + m.cal + "개다");
    if (m.now !== 1) bad.push("진도상 이번 주 표시가 " + m.now + "개다");
    await ctx5.close();
    return bad;
  })();
  tally.forEach((m) => fails.push("지도 진행: " + m));

  /* 35. **세션 중에 딴 탭에 갔을 때 돌아올 길이 있는가.**
     블록 1은 미디어 탭에서 듣는 블록이다. 그때 머리띠가 숨고 좁은 화면에서는 탭도 숨는다.
     조작줄에는 블록을 옮기는 것만 있었다. **블록 칸으로 돌아올 길이 없었다.**
     세션 중에 제일 많이 보는 자리가 그것이다. */
  const back = await (async () => {
    const bad = [];
    for (const w of [390, 900]) {
      const ctx6 = await browser.newContext({ viewport: { width: w, height: 844 } });
      const p8 = await ctx6.newPage();
      await p8.goto(PAGE);
      await p8.evaluate(() => localStorage.clear());
      await p8.reload();
      await p8.waitForTimeout(380);
      await p8.evaluate(() => { S.onboarded = true; S.device = "a"; save(); renderToday(); });
      await p8.click("#tOne");
      await p8.waitForTimeout(280);

      if (await p8.isVisible("#focusHome"))
        bad.push(w + "px 오늘 탭인데 돌아갈 단추가 떠 있다");

      await p8.evaluate(() => go("media"));
      await p8.waitForTimeout(360);
      const seen = await p8.evaluate(() => {
        const nav = document.querySelector("nav");
        const r = nav.getBoundingClientRect();
        return { nav: getComputedStyle(nav).display !== "none" && r.height > 0 &&
                      r.top < innerHeight && r.bottom > 0 &&
                      +getComputedStyle(document.querySelector("header")).opacity > 0,
                 dock: !document.querySelector("#focusHome").hidden };
      });
      if (!seen.nav && !seen.dock)
        bad.push(w + "px 세션 중 미디어 탭에서 오늘로 돌아갈 길이 아예 없다");
      if (!seen.dock) bad.push(w + "px 조작줄에 돌아갈 단추가 없다");
      else {
        await p8.click("#focusHome");
        await p8.waitForTimeout(420);
        const g = await p8.evaluate(() => {
          const e = document.querySelector("#blockPane"), r = e.getBoundingClientRect();
          return { today: !document.querySelector("#t-today").hidden,
                   pane: r.top < innerHeight && r.bottom > 0, run: T.run };
        });
        if (!g.today) bad.push(w + "px 돌아갈 단추를 눌렀는데 오늘 탭이 안 열린다");
        if (!g.pane) bad.push(w + "px 돌아왔는데 블록 칸이 화면 밖이다");
        if (!g.run) bad.push(w + "px 돌아오면서 세션이 멎었다");
      }
      /* 조작줄 단추가 다섯이 됐다. 좁은 화면에서 안 넘치는지 본다. */
      await p8.evaluate(() => go("media"));
      await p8.waitForTimeout(300);
      const fit = await p8.evaluate(() => {
        const d = document.querySelector(".focusdock");
        return { sw: d.scrollWidth, cw: d.clientWidth };
      });
      if (fit.sw > fit.cw + 1)
        bad.push(w + "px 조작줄이 넘친다 " + fit.sw + "/" + fit.cw);
      await ctx6.close();
    }
    return bad;
  })();
  back.forEach((m) => fails.push("돌아올 길: " + m));

  /* **적는 칸에서 손이 안 끊기는가.**
     블록 칸은 세션이 도는 동안 매초 다시 그려진다. 값이 그리는 글 안에 있으면
     한 글자 칠 때마다 글이 달라지고 칸이 통째로 갈린다. 그러면 치던 글이 사라진다.
     화면을 열어 보는 것으로는 안 보인다. **1초를 기다려 봐야 보인다.** T211 */
  const write = await (async () => {
    const bad = [];
    const ctxw = await browser.newContext({ viewport: { width: 390, height: 844 },
                                            reducedMotion: "reduce" });
    const pw = await ctxw.newPage();
    await pw.goto(PAGE);
    await pw.evaluate(() => {
      function iso(d){var z=new Date(d.getTime()-d.getTimezoneOffset()*60000);
        return z.toISOString().slice(0,10);}
      var now=new Date(), st=new Date(now.getTime()-138*86400000), days={};
      for(var i=0;i<138;i++){var x=new Date(st.getTime()+i*86400000);
        if(x.getDay()===0) continue;
        days[iso(x)]={status:"normal",h:2,speak:12,cards:30,lre:6};}
      localStorage.setItem("eng2p.v1",JSON.stringify(
        {v:1,names:{a:"남편",b:"아내"},start:iso(st),days:days,
         media:{done:{},fav:{},last:null,pass:{}},wk:0,onboarded:true,session:null,
         device:null,recOpen:false,emgOpen:false,card:null,cardDue:{},
         cardMode:"today",cues:{},rate:1,fs:0}));
    });
    await pw.goto(PAGE);
    await pw.waitForTimeout(500);
    await pw.click("#tOne");            // 블록 1 로 들어가고 시계가 돈다
    await pw.waitForTimeout(700);
    if (!(await pw.evaluate(() => T.run))) bad.push("세션이 안 돈다");
    const has = await pw.evaluate(() => !!document.getElementById("aimA"));
    if (!has) { bad.push("블록 1 에 적는 칸이 없다"); await ctxw.close(); return bad; }
    await pw.click("#aimA");
    await pw.type("#aimA", "앞", { delay: 60 });
    await pw.waitForTimeout(1500);      // 매초 다시 그리는 자리를 한 바퀴 넘긴다
    await pw.type("#aimA", "뒤", { delay: 60 });
    await pw.waitForTimeout(900);
    const got = await pw.evaluate(() => ({
      val: document.getElementById("aimA").value,
      on: document.activeElement.id,
      saved: (function () {
        const S = JSON.parse(localStorage.getItem("eng2p.v1"));
        const k = Object.keys(S.days).sort().pop();
        return (S.days[k].aim || {}).a || "";
      })() }));
    if (got.val !== "앞뒤") bad.push("치던 글이 끊겼다: " + JSON.stringify(got.val));
    if (got.on !== "aimA") bad.push("손이 칸에서 밀려났다: " + got.on);
    if (got.saved !== "앞뒤") bad.push("적은 것이 안 남았다: " + JSON.stringify(got.saved));
    /* 블록 4 는 둘 것을 펴고 겹친 수를 센다 */
    await pw.evaluate(() => { gotoBlock(3); });
    await pw.waitForTimeout(700);
    const four = await pw.evaluate(() => ({
      a: !!document.getElementById("aimA"), b: !!document.getElementById("aimB"),
      same: !!document.getElementById("aimSame"), diff: !!document.getElementById("aimDiff"),
      shown: (document.getElementById("aimA") || {}).value }));
    if (!four.a || !four.b) bad.push("블록 4 에 두 칸이 다 안 뜬다");
    if (!four.same || !four.diff) bad.push("블록 4 에 겹친 수 세는 칸이 없다");
    if (four.shown !== "앞뒤") bad.push("블록 1 에 적은 것이 블록 4 에 안 뜬다: " + four.shown);
    /* **블록 2 3단계가 1단계에서 가린 목록을 펴는가.**
       1단계 코드가 "빠진 것은 3단계에서 갈린다" 고 적어 놓고 안 폈다.
       B 는 그 목록을 세션 내내 한 번도 못 봤다. T212 */
    await pw.evaluate(() => { S.device = "b"; save(); gotoBlock(1); });
    await pw.waitForTimeout(800);
    /* **1단계 동안에는 아직 안 보여야 한다.** 네 단계가 한 칸에 다 그려지므로
       그려 두기만 하면 아래로 밀어 볼 수 있다. 시간이 닿아야 편다. */
    const early = await pw.evaluate(() =>
      document.querySelector("#blockPane").innerText.indexOf("1단계에 들어갔어야 하는 것") >= 0);
    if (early) bad.push("블록 2 1단계인데 3단계 목록이 벌써 그려져 있다");
    const two = await pw.evaluate(() => {
      const txt = document.querySelector("#blockPane").innerText;
      return { hid: txt.indexOf("필수 포함 요소는 B 화면에 안 띄운다") >= 0,
               wa: !!document.getElementById("xchA"),
               wb: !!document.getElementById("xchB") };
    });
    if (!two.hid) bad.push("블록 2 1단계가 B 화면에서 목록을 안 가린다");
    if (!two.wa || !two.wb) bad.push("블록 2 3단계에 각자 적는 칸이 없다");
    /* 시간을 3단계로 밀어 놓고 다시 본다. 8 + 8 분이 지나야 3단계다. */
    await pw.evaluate(() => { T.left = 30 * 60 - 17 * 60; paintTimer(); });
    await pw.waitForTimeout(600);
    const late = await pw.evaluate(() =>
      document.querySelector("#blockPane").innerText.indexOf("1단계에 들어갔어야 하는 것") >= 0);
    if (!late) bad.push("블록 2 3단계에 닿았는데 가린 목록을 안 편다");
    /* **블록 4 는 회차마다 대조하는 것이 다르다.** 조준표 6장이 그렇게 정한다.
       세 회차를 다 돌아 본다. 이름이 바뀌는지와 3회차에 셈 칸이 없어지는지다. T214 */
    for (const r of [1, 2, 3]) {
      await pw.evaluate((rr) => { const pl = plan();
        lecRound()[pl.lectureNo] = rr - 1; save(); gotoBlock(3); }, r);
      await pw.waitForTimeout(900);
      const g = await pw.evaluate(() => ({
        txt: document.querySelector("#blockPane").innerText,
        cnt: !!document.getElementById("aimSame") }));
      const want = { 1: "표시한 지점", 2: "끊어 들은 덩어리", 3: "요약" }[r];
      if (g.txt.indexOf(want) < 0)
        bad.push(r + "회차 블록 4 에 '" + want + "' 가 없다");
      if (r === 3 && g.cnt) bad.push("3회차인데 셈 칸이 있다");
      if (r !== 3 && !g.cnt) bad.push(r + "회차인데 셈 칸이 없다");
    }
    /* 숫자를 넣으면 무엇을 할지 화면이 말한다. 사람이 세어 판정하지 않는다. */
    await pw.evaluate(() => { const pl = plan();
      lecRound()[pl.lectureNo] = 0; save(); gotoBlock(3); });
    await pw.waitForTimeout(800);
    await pw.fill("#aimSame", "2"); await pw.fill("#aimDiff", "5");
    await pw.waitForTimeout(300);
    if ((await pw.textContent("#aimSay")).indexOf("한 번 더 듣는다") < 0)
      bad.push("안 겹친 것이 더 많은데 한 번 더 들으라고 안 한다");
    await pw.fill("#aimDiff", "1");
    await pw.waitForTimeout(300);
    if ((await pw.textContent("#aimSay")).indexOf("다음으로 넘어간다") < 0)
      bad.push("겹친 것이 더 많은데 넘어가라고 안 한다");
    await ctxw.close();
    return bad;
  })();
  write.forEach((m) => fails.push("적는 칸: " + m));

  await browser.close();

  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("첫 화면 1판 / 배정 288판 / 세트 뷰어 " + nsets + "개 x 3 = " + nsets * 3 +
              "판 / 진행표 96판 / 카드 뷰어 " + ncards + "개 x 3 = " + ncards * 3 +
              "판 / 대본 52판 / 세션 리허설 1판 / 세션 안 재생 1판 / 대본 동기 1판 / " +
              "어림 바로잡기 1판 / 대본 화면 52과 x 2 = 104판 / 되풀이 1판 / " +
              "여러 줄 되풀이 1판 / 대본 가리기 1판 / 망 없이 세션 1판 / " +
              "배속 1판 / 근거 줄 1판 / 종이 1판 / 52과 전수 재생 52판 / " +
              "마지막 줄 되풀이 1판 / 연속 30일 1판 / 회차 3회 x 2자리 = 6판 / 한 과 두 강 1판 / 이름 1판 / "+
              "미리 보기 1판 / 강의 본문 1판 / 손가락 밀기 4판 / 조작줄 이전 1판 / " +
              "소리 여섯 6판 / 소리 끄기 1판 / 미는 방향 4판 / 길 지도 18판 / 지도 진행 9판 / " +
              "돌아올 길 2폭 x 6판 = 12판 / 적는 칸 10판 / 회차별 대조 3회차 x 2 + 판정 2 = 8판");
  console.log("실패 " + fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
