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
  /* **차림표가 이제 게으르다.** 48주 내용이 분기 조각 넷에 있고 열자마자 읽는 것은
     오늘 그 한 주뿐이다 (T245). 288세션을 다 보려면 넷을 다 읽어야 한다.
     안 읽고 재면 "주차 없음" 이 쏟아지는데 그것은 차림표가 아니라 검사 잘못이다. */
  await page.evaluate(() => new Promise((r) => needAllWeeks(r)));
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
    /* **`S.device` 는 사람이고 화면 쪽은 날마다 뒤집힌다.** T216
       사람을 박아 두면 하루걸러 A 화면 판과 B 화면 판이 서로 바뀐다. */
    const asB = roleOf(today()) === "a" ? "b" : "a";
    const asA = asB === "a" ? "b" : "a";
    for (const s of sets) {
      for (const side of [asA, asB, null]) {
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
          if (side === asB && has) bad.push(s.id + " B 화면에 1단계 목록이 새어 나왔다");
          if (side === asA && !has) bad.push(s.id + " A 화면에 1단계 목록이 빠졌다");
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
    /* **`S.device` 는 사람이고 화면 쪽은 날마다 뒤집힌다.** T216
       사람을 박아 두면 하루걸러 B면 판이 A면을 보게 된다. 쪽으로 골라 넣는다. */
    const asB = roleOf(today()) === "a" ? "b" : "a";
    const asA = asB === "a" ? "b" : "a";
    for (const c of cards) {
      for (const side of [asA, asB, null]) {
        S.device = side; S.card = { k: cardKey(), i: 0 };
        const pl = { quarter: c.quarter, cards: { from: c.no, to: c.no }, lectureNo: 1 };
        let h;
        try { h = renderCardView(pl); }
        catch (e) { bad.push(c.id + " " + side + " 예외 " + e.message); continue; }
        if (!h) { bad.push(c.id + " " + side + " 빈 화면"); continue; }
        if (h.indexOf("undefined") >= 0) bad.push(c.id + " " + side + " 빈 값이 찍혔다");
        if (c.type === "판정" && side === asB && h.indexOf("정답") >= 0)
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
    /* **`S.device` 는 사람이고 화면 쪽은 날마다 뒤집힌다.**
       `deviceSide()` 가 `roleOf(today())` 를 곱해서 정한다.
       사람을 박아 두면 하루걸러 이 판이 뒤집힌다. 쪽으로 골라 넣는다. T216 */
    const asA = roleOf(today()) === "a" ? "a" : "b";
    const asB = roleOf(today()) === "a" ? "b" : "a";
    S.device = asA; const sa = renderSetPane({ set: sid, lectureNo: lec, quarter: pl.quarter });
    S.device = asB; const sb = renderSetPane({ set: sid, lectureNo: lec, quarter: pl.quarter });
    if (sa.indexOf("B 화면에 안 띄운다") >= 0) bad.push("A 기기에 B용 안내가 떴다");
    if (sb.indexOf("B 화면에 안 띄운다") < 0) bad.push("B 기기에 가림 안내가 없다");
    S.device = asA; const ca = renderCardView(pl);
    S.device = asB; const cb = renderCardView(pl);
    if (ca.indexOf(">A면") < 0 && ca.indexOf("A면 ·") < 0) bad.push("A 기기가 A면을 안 본다");
    if (cb.indexOf("B면 ·") < 0) bad.push("B 기기가 B면을 안 본다");
    S.device = asA;
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
    /* **`S.device` 는 사람이고 화면 쪽은 날마다 뒤집힌다.** `deviceSide()` 가
       `roleOf(today())` 를 곱해서 정한다. 사람을 박아 두면 하루걸러 검사가 뒤집힌다.
       실제로 날이 바뀌면서 세 판이 실패했다. **B 쪽이 되는 사람을 골라 넣는다.** T216 */
    await pw.evaluate(() => {
      S.device = roleOf(today()) === "a" ? "b" : "a"; save(); gotoBlock(1);
    });
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
    /* **블록 3 제한시간을 사람이 세면 그 사람이 심판이 된다.**
       초가 붙은 카드를 띄우고 시계가 도는지, 응답자 화면에 시작 단추가 없는지 본다. T215 */
    await pw.evaluate(() => {
      S.cardDue = { "Q1-005": { box: 1, due: "2020-01-01", ran: null } };
      S.cardMode = "due"; S.card = null; S.device = null; save(); gotoBlock(2);
    });
    await pw.waitForTimeout(1600);
    const ck = await pw.evaluate(() => ({
      go: !!document.getElementById("ckGo"),
      left: (document.getElementById("ckLeft") || {}).textContent }));
    if (!ck.go) bad.push("초가 붙은 카드인데 재기 단추가 없다");
    else {
      await pw.click("#ckGo");
      await pw.waitForTimeout(1300);
      const after = await pw.textContent("#ckLeft");
      if (after === ck.left) bad.push("재기를 눌렀는데 시계가 안 돈다: " + after);
      await pw.evaluate(() => {
        S.device = roleOf(today()) === "a" ? "b" : "a"; save(); renderBlockPane();
      });
      await pw.waitForTimeout(700);
      const bside = await pw.evaluate(() => ({
        go: !!document.getElementById("ckGo"),
        row: (document.querySelector(".ckrow") || {}).innerText || "" }));
      if (bside.go) bad.push("응답자 화면에 재기 단추가 있다");
      if (bside.row.indexOf("쪽이 시작한다") < 0)
        bad.push("응답자 화면이 누가 시작하는지 말 안 한다");
    }
    /* **오늘 돈 카드 수를 앱이 세고 오늘 탭이 그것을 받는가.** T216
       안 받으면 옆 칸을 고칠 때 `pullForm` 이 옛 값(0)을 다시 써 넣는다. */
    await pw.evaluate(() => {
      S.cardDue = {}; S.cardMode = "today"; S.card = null; S.device = null;
      day(today()).cards = 0; save(); gotoBlock(2);
    });
    await pw.waitForTimeout(1500);
    for (let k = 0; k < 3; k++) {
      await pw.evaluate(() => document.querySelector('[data-card="run"]').click());
      await pw.waitForTimeout(400);
    }
    const cnt = await pw.evaluate(() => ({
      mem: day(today()).cards,
      box: (document.getElementById("drCards") || {}).value }));
    if (cnt.box !== "3") bad.push("블록 3 이 오늘 돈 카드를 안 센다: " + cnt.box);
    if (cnt.mem !== 3) bad.push("센 것이 대장에 안 들어갔다: " + cnt.mem);
    await pw.evaluate(() => go("today"));
    await pw.waitForTimeout(500);
    const back = await pw.evaluate(() => (document.getElementById("fCards") || {}).value);
    if (back !== "3") bad.push("오늘 탭으로 돌아왔는데 센 값이 안 보인다: " + back);
    /* **블록 3 구간이 바뀌면 알리는가.** 두 사람은 카드를 주고받느라 화면을 안 본다.
       그중 하나가 역할을 바꾸는 자리다. 기준서 2.4 의 교대가 실제로 일어나는 자리다. T217 */
    await pw.evaluate(() => { gotoBlock(2); T.run = true; });
    await pw.waitForTimeout(1200);
    const segs = await pw.evaluate(() => {
      const L = (DATA.lectures.items || []).filter((x) => x.no === plan().lectureNo)[0];
      return planPieces(L.plan && L.plan.split).map((x) => x.label);
    });
    if (segs.length < 2) bad.push("블록 3 구간이 " + segs.length + "개다");
    let sawSwap = false, sawStep = false;
    let mins = 0;
    for (let i = 0; i < segs.length; i++) {
      const at = mins + 1;
      await pw.evaluate((m) => { T.run = true; T.left = 30 * 60 - m * 60; paintTimer(); }, at);
      await pw.waitForTimeout(350);
      const msg = await pw.textContent("#fMsg");
      if (/역할.*(바꿔|바꾸|교대)/.test(segs[i])) {
        if (msg.indexOf("역할을 바꾼다") >= 0) sawSwap = true;
      } else if (i > 0 && msg.indexOf("구간") >= 0) sawStep = true;
      const m2 = /(\d+)\s*분/.exec(segs[i]);
      mins += m2 ? +m2[1] : 5;
    }
    if (!sawStep) bad.push("블록 3 구간이 바뀌는데 아무 말이 없다");
    if (segs.some((s) => /역할.*(바꿔|바꾸|교대)/.test(s)) && !sawSwap)
      bad.push("역할을 바꾸는 구간인데 그 말을 안 한다");
    /* **블록 4의 20분이 통째로 있으면 듣다가 시간이 다 간다.**
       숫자를 선언하지 않고 자료 길이에서 파생시킨다. 두 자리로 갈리는지 본다. T218 */
    await pw.evaluate(() => { gotoBlock(3); T.run = true; T.left = 20 * 60; paintTimer(); });
    await pw.waitForTimeout(1200);
    const ph1 = await pw.evaluate(() => {
      const e = document.querySelector(".phase"); return e ? e.innerText : ""; });
    if (ph1.indexOf("같이 듣는 자리") < 0) bad.push("블록 4 가 듣는 자리라고 말 안 한다: " + ph1);
    if (!/두 번 듣는 데 \d+분/.test(ph1)) bad.push("블록 4 가 자료 길이에서 안 파생했다");
    await pw.evaluate(() => { T.run = true; T.left = 20 * 60 - 15 * 60; paintTimer(); });
    await pw.waitForTimeout(500);
    const ph2 = await pw.evaluate(() => {
      const e = document.querySelector(".phase"); return e ? e.innerText : ""; });
    if (ph2.indexOf("맞춰 보는 자리") < 0) bad.push("블록 4 가 맞춰 보는 자리로 안 넘어간다: " + ph2);
    if ((await pw.textContent("#fMsg")).indexOf("따로 적은 것을 편다") < 0)
      bad.push("블록 4 자리가 바뀌는데 아무 말이 없다");
    /* **회차는 사흘에 하나씩 오르는 값이다.** 잘못 누르면 그날 것이 사라지고
       그것이 눈에 안 띈다. 올리는 자리인데도 되돌릴 수 있어야 한다. T219 */
    await pw.evaluate(() => { lecRound()[plan().lectureNo] = 0; save(); gotoBlock(3); });
    await pw.waitForTimeout(900);
    const was = await pw.evaluate(() => lecPass(plan().lectureNo));
    await pw.evaluate(() => {
      const b = [...document.querySelectorAll("#blockPane [data-media]")]
        .find((x) => x.dataset.media === "pass");
      if (b) b.click();
    });
    await pw.waitForTimeout(700);
    const up = await pw.evaluate(() => ({
      n: lecPass(plan().lectureNo),
      undo: !!document.querySelector(".undo button") }));
    if (up.n !== was + 1) bad.push("회차 끝냈다를 눌렀는데 안 올랐다: " + up.n);
    if (!up.undo) bad.push("회차를 올렸는데 되돌릴 자리가 없다");
    else {
      await pw.evaluate(() => document.querySelector(".undo button").click());
      await pw.waitForTimeout(600);
      const back2 = await pw.evaluate(() => lecPass(plan().lectureNo));
      if (back2 !== was) bad.push("회차를 되돌렸는데 안 돌아왔다: " + back2);
    }
    /* 세 회차를 다 돌면 그 뒤에 무엇을 하는지 말하는가 */
    await pw.evaluate(() => { lecRound()[plan().lectureNo] = 3; save(); renderBlockPane(); });
    await pw.waitForTimeout(800);
    if ((await pw.evaluate(() => document.querySelector("#blockPane").innerText))
        .indexOf("세 회차를 다 돌았다") < 0)
      bad.push("세 회차를 다 돌았는데 그 뒤를 말 안 한다");
    await pw.evaluate(() => { lecRound()[plan().lectureNo] = 0; save(); });
    /* **조준표 8장이 안 하기로 한 것을 앱이 한 번도 안 말했다.**
       대본 가림 단추와 느리게 단추가 바로 그 자리다. 막지 않고 그 자리에서 말한다.
       그리고 늘 말하지 않는다. 그 자리에 갔을 때만 말한다. T220 */
    await pw.evaluate(() => { SESS.veil = null; setRate(1); gotoBlock(0); });
    await pw.waitForTimeout(1400);
    const warn0 = await pw.evaluate(() =>
      [...document.querySelectorAll("#blockPane .cardwarn")].map((x) => x.innerText).join(" | "));
    if (warn0.indexOf("조준표가 안 하기로 한 것이다") >= 0)
      bad.push("아무것도 안 어겼는데 조준표 말이 떠 있다: " + warn0);
    for (let k = 0; k < 2; k++) {
      await pw.evaluate(() => {
        const b = [...document.querySelectorAll("#blockPane [data-media]")]
          .find((x) => x.dataset.media === "veil");
        if (b) b.click();
      });
      await pw.waitForTimeout(450);
    }
    const warn1 = await pw.evaluate(() =>
      [...document.querySelectorAll("#blockPane .cardwarn")].map((x) => x.innerText).join(" | "));
    if (warn1.indexOf("대본") < 0)
      bad.push("대본을 회차 기본보다 열었는데 조준표 말이 없다: " + warn1);
    if (warn1.indexOf("자막") >= 0)
      bad.push("이 앱에 없는 자막 규칙을 집었다: " + warn1);
    await pw.evaluate(() => { SESS.veil = null; setRate(1); renderBlockPane(); });
    await pw.waitForTimeout(500);
    /* **블록이 바뀌는 순간에 읽기 시작하면 그 순간이 빈다.**
       지금 블록에 시간이 있다. 그 안에 다음 것을 읽으면 넘어갈 때 이미 있다.
       읽는 양은 같고 읽는 때만 옮긴다. 열자마자 읽는 것은 안 는다. T221 */
    const pre = await pw.evaluate(async () => {
      DATA.sets = null; DATA.cards = null; PRE.at = null;
      T.run = true; gotoBlock(0);
      const at0 = { sets: !!DATA.sets, cards: !!DATA.cards };
      await new Promise((r) => setTimeout(r, 3000));
      return { at0, later: { sets: !!DATA.sets, cards: !!DATA.cards } };
    });
    if (pre.at0.sets) bad.push("블록 1 에 들어가자마자 세트를 읽는다");
    if (!pre.later.sets) bad.push("블록 1 에 있는 동안 다음 블록 세트를 안 읽는다");
    if (pre.later.cards) bad.push("블록 1 인데 두 블록 뒤 카드까지 읽는다");
    /* **시계가 다섯이 됐다. 지금 세는 것 하나만 크다.** T222
       3초를 재는 중에 30분 남은 것은 안 중요하다. 재는 동안 크기가 뒤집히는지 본다. */
    await pw.evaluate(() => {
      S.cardDue = { "Q1-005": { box: 1, due: "2020-01-01", ran: null } };
      S.cardMode = "due"; S.card = null; S.device = null; save(); gotoBlock(2);
    });
    await pw.waitForTimeout(1500);
    const size = () => pw.evaluate(() => ({
      big: parseFloat(getComputedStyle(document.querySelector(".tbig")).fontSize),
      ck: (() => { const e = document.getElementById("ckLeft");
        return e ? parseFloat(getComputedStyle(e).fontSize) : null; })() }));
    const s0 = await size();
    if (s0.ck === null) { bad.push("초가 붙은 카드가 안 떴다"); }
    else {
      if (!(s0.big > s0.ck)) bad.push("재기 전에 블록 시계가 안 크다 " + JSON.stringify(s0));
      await pw.click("#ckGo");
      await pw.waitForTimeout(600);
      const s1 = await size();
      if (!(s1.ck > s1.big)) bad.push("재는 중에 카드 시계가 안 크다 " + JSON.stringify(s1));
      await pw.waitForTimeout(9500);
      const s2 = await size();
      if (!(s2.big > s2.ck)) bad.push("다 세고 나서 블록 시계로 안 돌아왔다 " + JSON.stringify(s2));
    }
    await pw.evaluate(() => { S.cardDue = {}; S.cardMode = "today"; S.card = null; save(); });
    /* **세션 중에만 짙다.** 테마가 아니라 그 화면의 색이다. 12.4 가 없앤 것은 테마 두 벌이다.
       두 기기가 서로 다른 판을 들면 같은 화면을 못 가리키는데,
       세션 중에는 둘 다 세션 중이라 한쪽만 짙어지는 일이 없다. T223 */
    const lumOf = (s) => {
      const m = (s.match(/[\d.]+/g) || []).map(Number);
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]);
    };
    const inSess = await pw.evaluate(() => ({
      cls: document.body.className,
      bg: getComputedStyle(document.body).backgroundColor }));
    if (inSess.cls.indexOf("session-focus") < 0) bad.push("세션 중인데 집중 화면이 아니다");
    await pw.evaluate(() => { T.run = false; clearInterval(T.tick); T.idx = 0;
      T.left = BLOCKS[0].m * 60; S.session = null; save(); syncSessionFocus(); paintTimer(); });
    await pw.waitForTimeout(500);
    const outSess = await pw.evaluate(() => ({
      cls: document.body.className,
      bg: getComputedStyle(document.body).backgroundColor }));
    if (outSess.cls.indexOf("session-focus") >= 0) bad.push("세션이 끝났는데 집중 화면이 남았다");
    if (!(lumOf(inSess.bg) < lumOf(outSess.bg)))
      bad.push("세션 중이 더 안 짙다 " + inSess.bg + " / " + outSess.bg);
    if (lumOf(outSess.bg) < 0.5) bad.push("세션 밖이 짙다. 테마가 두 벌이 됐다 " + outSess.bg);
    /* **아래 칸에 적으라고 시키는데 아래는 오늘 탭이었다.**
       4분짜리 기록 단계에서 탭을 옮겨 가서 적고 돌아와야 했다. 그 자리에서 남긴다. T224 */
    await pw.evaluate(() => { T.run = true; gotoBlock(1); });
    await pw.waitForTimeout(1400);
    const un0 = await pw.evaluate(() => ({
      n: day(today()).unres.length, box: !!document.getElementById("setUn") }));
    if (!un0.box) { bad.push("블록 2 에 미해결 LRE 를 남길 칸이 없다"); }
    else {
      await pw.fill("#setUn", "갈린 문장 하나");
      await pw.click("#setUnAdd");
      await pw.waitForTimeout(500);
      const un1 = await pw.evaluate(() => ({
        n: day(today()).unres.length,
        last: (day(today()).unres.slice(-1)[0] || {}).t,
        undo: !!document.querySelector(".undo button") }));
      if (un1.n !== un0.n + 1) bad.push("세션 중에 남긴 미해결 LRE 가 안 쌓였다");
      if (un1.last !== "갈린 문장 하나") bad.push("남긴 문장이 다르다: " + un1.last);
      if (!un1.undo) bad.push("세션 중에 남긴 것을 되돌릴 자리가 없다");
      else {
        await pw.evaluate(() => document.querySelector(".undo button").click());
        await pw.waitForTimeout(400);
        if ((await pw.evaluate(() => day(today()).unres.length)) !== un0.n)
          bad.push("되돌렸는데 안 돌아왔다");
      }
    }
    /* **끊긴 세션이 조용히 사라지고 있었다.** 어제 것은 안 이어 가는 것이 맞지만
       아무 말도 없이 사라지면 앱이 잃어버린 것인지 원래 그런 것인지 모른다.
       그리고 오래 쉬고 온 자리는 이어 가는 것이 아니라 다시 하는 자리다. T225 */
    const resumeCase = async (sess) => {
      await pw.evaluate((s) => {
        S.session = s; save();
        T.idx = s.idx; T.left = s.left; T.run = false;
        clearInterval(T.tick); syncSessionFocus(); renderToday();
      }, sess);
      await pw.waitForTimeout(400);
      return (await pw.textContent("#resumeBox")).replace(/\s+/g, " ");
    };
    const td = await pw.evaluate(() => today());
    const old2 = await resumeCase({ date: "2020-01-01", idx: 2, left: 600, at: Date.now() - 86400000 });
    if (old2.indexOf("이어 가지 않는다") < 0)
      bad.push("어제 세션이 조용히 사라진다: " + old2.slice(0, 60));
    const near = await resumeCase({ date: td, idx: 1, left: 600, at: Date.now() - 5 * 60000 });
    if (near.indexOf("멈춘 지 5분") < 0) bad.push("멈춘 지 얼마인지 안 말한다: " + near.slice(0, 60));
    if (near.indexOf("처음부터") >= 0) bad.push("5분 쉬었는데 처음부터를 권한다");
    const far = await resumeCase({ date: td, idx: 1, left: 600, at: Date.now() - 120 * 60000 });
    if (far.indexOf("이 블록 처음부터") < 0)
      bad.push("두 시간 쉬었는데 처음부터가 없다: " + far.slice(0, 80));
    await pw.evaluate(() => { S.session = null; save(); T.idx = 0;
      T.left = BLOCKS[0].m * 60; renderToday(); });
    /* **주간 점검 30분이 종이에만 있었다.** 그 표의 첫 세 단계는 앱이 이미 아는 숫자다.
       사람이 다시 세어 적고 있었다. 앱이 세고 사람은 왜 그랬는지를 적는다. T226 */
    await pw.evaluate(() => go("ledger"));
    await pw.waitForTimeout(900);
    const wc = await pw.evaluate(() => {
      const e = document.getElementById("weekCheck");
      return { txt: e ? e.innerText.replace(/\s+/g, " ") : "",
               fields: ["wcCause", "wcLre", "wcColl", "wcFirst", "wcBlock", "wcOdd", "wcAsk"]
                 .filter((k) => document.getElementById(k)).length };
    });
    if (wc.txt.indexOf("주간 점검 30분") < 0) bad.push("대장 탭에 주간 점검이 없다");
    if (!/수행 \d+ \/ 6/.test(wc.txt)) bad.push("주간 점검이 수행일을 안 센다: " + wc.txt.slice(0, 80));
    if (wc.fields !== 7) bad.push("주간 점검 칸이 " + wc.fields + "개다. 일곱이어야 한다");
    await pw.fill("#wcFirst", "월요일 저녁 8시에 헤드폰부터");
    await pw.waitForTimeout(400);
    const kept = await pw.evaluate(() => {
      const S2 = JSON.parse(localStorage.getItem("eng2p.v1"));
      const k = Object.keys(S2.wchk || {})[0];
      return k ? S2.wchk[k].first : ""; });
    if (kept !== "월요일 저녁 8시에 헤드폰부터") bad.push("주간 점검에 적은 것이 안 남는다: " + kept);
    await pw.evaluate(() => go("today"));
    await pw.waitForTimeout(300);
    /* **비상판 15분이 두 토막인데 재는 것이 없었다.** 인출 10분과 청크 5분이
       글자로만 있었다. 이 자리에는 넘겨 줄 상대가 없다. T227 */
    await pw.evaluate(() => { S.emgOpen = true; day(today()).status = null; save(); renderToday(); });
    await pw.waitForTimeout(1200);
    const eg = await pw.evaluate(() => ({
      has: !!document.getElementById("emgLeft"),
      left: (document.getElementById("emgLeft") || {}).textContent,
      what: (document.getElementById("emgWhat") || {}).textContent }));
    if (!eg.has) bad.push("비상판에 시계가 없다");
    else {
      if (eg.left !== "10:00") bad.push("비상판 시계가 인출 10분으로 안 뜬다: " + eg.left);
      await pw.click("#emgGo");
      await pw.waitForTimeout(1300);
      const run = await pw.evaluate(() => ({
        left: document.getElementById("emgLeft").textContent,
        go: document.getElementById("emgGo").textContent }));
      if (run.left === "10:00") bad.push("비상판 시계가 안 돈다");
      if (run.go.indexOf("일시정지") < 0) bad.push("도는 중인데 단추가 시작 그대로다: " + run.go);
      await pw.evaluate(() => { EMGCLK.left = 1; });
      await pw.waitForTimeout(1500);
      const nx = await pw.evaluate(() => ({
        what: document.getElementById("emgWhat").textContent,
        left: document.getElementById("emgLeft").textContent }));
      if (nx.what.indexOf("청크") < 0) bad.push("인출이 끝났는데 청크로 안 넘어간다: " + nx.what);
      if (nx.left !== "05:00") bad.push("청크가 5분으로 안 뜬다: " + nx.left);
      await pw.evaluate(() => { stopEmgClock(); EMGCLK.at = null; S.emgOpen = false; save(); });
    }
    /* **짝 코드는 사람이 손으로 친다.** 잘못 치는 것이 정상이다.
       담은 값이 그대로 나오는지, 한 글자 틀린 것과 두 글자 바뀐 것을 잡는지 본다.
       그리고 헷갈리는 글자를 친 것은 잘못이 아니라 손이 아는 대로 친 것이라 받아 준다. T234 */
    /* **그날 기록으로 재면 자리가 다 작다.** 여덟 비트 자리에 한 자리 수가 들어간다.
       그래서 자리마다 그 폭의 끝값을 넣어 지어낸 값으로도 잰다.

       다만 이것으로 **폭이 규격과 같은지는 못 본다.** 기댓값을 코드 자신에게서
       뽑기 때문이다. 폭을 8에서 4로 바꿔 보니 그대로 통과했다.
       **코드가 자기를 채점하면 늘 백 점이다.** 폭은 `check_manual.py` 가
       `docs/pair.md` 7.1 과 견준다. 여기서 보는 것은 코덱이 스스로 어긋나는가다. T235 */
    const pc = await pw.evaluate(() => {
      const wide = PC_FIELDS.map((f) => Math.pow(2, f[1]) - 1);   // 자리마다 최대
      const mid = PC_FIELDS.map((f, i) => (i * 7 + 3) % Math.pow(2, f[1]));
      function trip(vals) {
        const b = pcEncode(vals), c = b + pcSum(b), r = pairRead(c);
        return { code: c, ok: r.ok === true,
                 got: r.ok ? PC_FIELDS.map((f) => r.v[f[0]]) : null };
      }
      const real = pairCode(), back = pairRead(real);
      let i = -1;
      for (let k = 0; k + 1 < real.length - 1; k++)
        if (real[k] !== real[k + 1]) { i = k; break; }
      const swap = i < 0 ? real : real.slice(0, i) + real[i + 1] + real[i] + real.slice(i + 2);
      const one = real.slice(0, 2) + (real[2] === "0" ? "1" : "0") + real.slice(3);
      return { real, realOk: back.ok === true, PC_LEN,
               names: PC_FIELDS.map((f) => f[0]), w: PC_FIELDS.map((f) => f[1]),
               wideWant: wide, midWant: mid,
               vals: pairValues(), got: back.ok ? back.v : {},
               wide: trip(wide), mid: trip(mid),
               swap: pairRead(swap).err || "", bad: pairRead(one).err || "",
               short: pairRead(real.slice(0, -1)).err || "",
               long: pairRead(real + "7").err || "",
               lower: pairRead(real.toLowerCase()).ok === true,
               spaced: pairRead(real.slice(0, 5) + " " + real.slice(5)).ok === true };
    });
    if (!pc.realOk) bad.push("짝 코드를 다시 못 읽는다");
    else pc.names.forEach((k, i) => {
      if (pc.got[k] !== pc.vals[i])
        bad.push("짝 코드에서 " + k + " 가 " + pc.vals[i] + " → " + pc.got[k]);
    });
    [["자리 끝값", pc.wide, pc.wideWant], ["섞은 값", pc.mid, pc.midWant]].forEach((x) => {
      if (!x[1].ok) { bad.push("짝 코드 " + x[0] + "을 다시 못 읽는다"); return; }
      x[2].forEach((want, i) => {
        if (x[1].got[i] !== want)
          bad.push("짝 코드 " + x[0] + " 에서 " + pc.names[i] + " 가 " +
                   want + " → " + x[1].got[i] + " (폭 " + pc.w[i] + ")");
      });
    });
    if (pc.real.length !== pc.PC_LEN)
      bad.push("짝 코드가 " + pc.real.length + "글자다. " + pc.PC_LEN + "글자여야 한다");
    if (pc.real.length > 20) bad.push("짝 코드가 손으로 치기에 길다");
    if (!pc.bad) bad.push("한 글자 잘못 친 것을 안 잡는다");
    if (!pc.swap) bad.push("두 글자 바꿔 친 것을 안 잡는다");
    /* 길이가 틀린 것은 **길이로** 말해야 한다. 빠뜨린 자리를 다시 찾을 수 있게. */
    if (pc.short.indexOf("글자다") < 0) bad.push("한 글자 뺀 것을 길이로 안 말한다: " + pc.short);
    if (pc.long.indexOf("글자다") < 0) bad.push("한 글자 더 친 것을 길이로 안 말한다: " + pc.long);
    if (!pc.lower) bad.push("소문자로 친 것을 안 받는다");
    if (!pc.spaced) bad.push("띄어 친 것을 안 받는다");
    /* **화면이 그 코덱을 실제로 쓰는지**는 따로 본다. 코덱만 맞고 화면이 안 부르면
       사람에게는 아무것도 없는 것이다. 대장 탭을 열어 눈에 보이는 것을 읽는다. T235 */
    const ps = await pw.evaluate(async () => {
      go("ledger");
      await new Promise((r) => setTimeout(r, 400));
      const mineEl = document.getElementById("pairMine");
      const inEl = document.getElementById("pairIn");
      if (!mineEl || !inEl) return { miss: true };
      const shown = mineEl.textContent.replace(/\s+/g, "");
      function type(v) {
        inEl.value = v; inEl.dispatchEvent(new Event("input"));
        return document.getElementById("pairOut").innerText;
      }
      const same = type(pairCode());
      const v = pairValues();
      const hv = v.slice(); hv[0] = hv[0] + 1;               // done 이 다르다
      const lt = v.slice(); lt[2] = (lt[2] + 9) % 256;       // 발화 분만 다르다
      const mk = (a) => { const b = pcEncode(a); return b + pcSum(b); };
      return { shown, code: pairCode(), same,
               heavy: type(mk(hv)), light: type(mk(lt)),
               half: type(pairCode().slice(0, -1)), empty: type("") };
    });
    if (ps.miss) bad.push("대장 탭에 짝 코드 자리가 없다");
    else {
      if (ps.shown !== ps.code) bad.push("화면에 뜬 코드가 다르다: " + ps.shown);
      if (ps.same.indexOf("다 같다") < 0) bad.push("같은 코드를 같다고 안 한다");
      if (ps.heavy.indexOf("진도가 갈렸다") < 0) bad.push("진도가 갈린 것을 안 짚는다");
      if (ps.heavy.indexOf("끝낸 세션") < 0) bad.push("갈린 자리를 이름으로 안 적는다");
      if (ps.light.indexOf("진도는 같다") < 0) bad.push("활동량만 다른 것을 진도 문제로 본다");
      if (ps.half.indexOf("/ " + pc.PC_LEN) < 0) bad.push("덜 친 동안 글자 수를 안 센다");
      if (ps.half.indexOf("잘못") >= 0) bad.push("치는 중에 틀렸다고 한다");
      if (ps.empty.trim()) bad.push("빈 칸에 무엇인가 뜬다: " + ps.empty);
      /* **읽기만 한다.** 상대 코드를 읽었다고 이 기기 기록이 바뀌면 안 된다. */
      const after = await pw.evaluate(() => pairCode());
      if (after !== ps.code) bad.push("상대 코드를 읽었더니 이 기기 기록이 바뀌었다");
    }
    /* **합치기는 덮는 것이 아니다.** `docs/merge.md` 4장이 지킬 것 넷을 정했다.
       지우지 않는다, 못 정하는 것을 자동으로 안 정한다, 바꾸기 전에 보인다,
       되돌릴 수 있다. 넷을 다 재 본다.

       **부딪치는 판을 일부러 만든다.** 안 부딪치는 판으로 재면 물음이 0으로 나오고
       물음이 0이면 이 파일이 있는 이유가 안 걸린다. T237 */
    const mg = await pw.evaluate(() => {
      const A = { names: { a: "남편", b: "아내" }, start: "2026-01-05",
        days: { "2026-01-05": { status: "normal", h: 2, speak: 12, cards: 30, lre: 2,
                  unres: [{ t: "내 것" }], coll: [],
                  aim: { a: "내가 본 지점", b: "" }, xchk: { a: "", b: "" } } },
        media: { done: {}, fav: {}, pass: { "lle1-01": 2 }, lec: { 1: 2 } },
        cardDue: { "Q1-001": "2026-02-01" }, rot: [{ d: "2026-01-05", x: 1 }],
        clips: [], scripts: {}, wchk: {}, q: {}, cues: {},
        device: "a", fs: 2, wk: 3, rate: 1.5, card: "Q1-007", cardMode: "today" };
      const B = { names: { a: "남편", b: "안사람" }, start: "2026-01-05",
        days: { "2026-01-05": { status: "emg", h: 2, speak: 0, cards: 34, lre: 2,
                  unres: [{ t: "상대 것" }], coll: [{ e: "nice" }],
                  aim: { a: "상대가 본 지점", b: "상대 B" }, xchk: { a: "", b: "" } },
                "2026-01-06": { status: "normal", h: 2, speak: 9, cards: 0, lre: 0,
                  unres: [], coll: [] } },
        media: { done: {}, fav: {}, pass: { "lle1-01": 1, "lle1-02": 3 }, lec: { 1: 1 } },
        cardDue: { "Q1-001": "2026-01-20", "Q1-002": "2026-03-01" },
        rot: [{ d: "2026-01-05", x: 1 }, { d: "2026-01-06", x: 2 }],
        clips: [], scripts: {}, wchk: {}, q: {}, cues: {},
        device: "b", fs: 0, wk: 0, rate: 1, card: null, cardMode: "due" };
      const pl = mergePlan(A, B);
      const d5 = pl.out.days["2026-01-05"];
      /* 두 번 합쳐도 같아야 한다. `docs/merge.md` 5장이다. */
      const twice = mergePlan(mergePlan(A, B).out, B).out.days["2026-01-05"];
      const all = {}; pl.ask.forEach((q) => { all[q.path] = "theirs"; });
      const some = {}; if (pl.ask[0]) some[pl.ask[0].path] = "mine";
      const done = mergeApply(pl, all);
      return { asks: pl.ask.map((q) => q.path), what: pl.ask.map((q) => q.what),
               add: pl.add,
               local: [pl.out.device, pl.out.fs, pl.out.wk, pl.out.rate,
                       pl.out.card, pl.out.cardMode],
               speak: d5.speak, cards: d5.cards, unres: d5.unres.length,
               coll: d5.coll.length, has6: !!pl.out.days["2026-01-06"],
               pass: pl.out.media.pass["lle1-01"], pass2: pl.out.media.pass["lle1-02"],
               lec: pl.out.media.lec[1], due: pl.out.cardDue["Q1-001"],
               rot: pl.out.rot.length, twiceUnres: twice.unres.length,
               planStatus: d5.status, planAim: d5.aim.a, planName: pl.out.names.b,
               halfErr: mergeApply(pl, some).err || "",
               applied: done.ok ? { status: done.out.days["2026-01-05"].status,
                                    aim: done.out.days["2026-01-05"].aim.a,
                                    name: done.out.names.b } : null };
    });
    /* 하나. 지우지 않는다 */
    if (mg.speak !== 12) bad.push("합치기가 큰 발화 분을 안 남긴다: " + mg.speak);
    if (mg.cards !== 34) bad.push("합치기가 큰 드릴 장수를 안 남긴다: " + mg.cards);
    if (mg.unres !== 2) bad.push("합치기가 미해결을 안 모은다: " + mg.unres);
    if (mg.coll !== 1) bad.push("합치기가 채집을 안 모은다: " + mg.coll);
    if (!mg.has6) bad.push("합치기가 상대에게만 있는 날을 안 가져온다");
    if (mg.rot !== 2) bad.push("합치기가 회전 등록을 안 모은다: " + mg.rot);
    if (mg.pass !== 2 || mg.pass2 !== 3) bad.push("합치기가 회차를 뒤로 돌린다");
    if (mg.lec !== 2) bad.push("합치기가 강의 회차를 뒤로 돌린다: " + mg.lec);
    /* 카드 간격은 **늦은 날짜**를 남긴다. 돌린 일을 무르지 않는다. */
    if (mg.due !== "2026-02-01") bad.push("합치기가 이미 돌린 카드를 되돌린다: " + mg.due);
    if (mg.twiceUnres !== 2) bad.push("두 번 합쳤더니 미해결이 " + mg.twiceUnres + "개다");
    /* 둘. 못 정하는 것을 자동으로 안 정한다 */
    const wantAsk = ["names.b", "days.2026-01-05.status", "days.2026-01-05.aim.a"];
    wantAsk.forEach((k) => {
      if (mg.asks.indexOf(k) < 0) bad.push("합치기가 " + k + " 를 안 묻는다");
    });
    if (mg.planStatus !== "normal" || mg.planAim !== "내가 본 지점" || mg.planName !== "아내")
      bad.push("고르기 전에 이미 상대 값으로 바뀌었다");
    if (!mg.halfErr) bad.push("덜 고르고도 합쳐진다");
    /* 남은 수를 판에서 뽑는다. 숫자를 적어 두면 판이 바뀔 때 그 숫자가 먼저 낡는다. */
    if (mg.halfErr.indexOf((mg.asks.length - 1) + "개") < 0)
      bad.push("몇 개가 남았는지를 안 말한다: " + mg.halfErr);
    if (!mg.applied) bad.push("다 골랐는데도 안 합쳐진다");
    else {
      if (mg.applied.status !== "emg")
        bad.push("고른 값이 저장소 말로 안 돌아간다: " + mg.applied.status);
      if (mg.applied.aim !== "상대가 본 지점") bad.push("고른 글이 안 들어간다");
      if (mg.applied.name !== "안사람") bad.push("고른 이름이 안 들어간다");
    }
    /* 사람에게 보이는 이름표가 키 이름이면 안 된다. 두 사람은 aim 이 무엇인지 모른다. */
    mg.what.forEach((w) => {
      if (/\b(aim|xchk|status|names)\b/.test(w))
        bad.push("합치기 물음이 키 이름을 그대로 보인다: " + w);
    });
    /* 넷. 가장자리. **아무것도 안 바뀌는 판과 숫자가 뛰는 판이 같은 말을 하면 안 된다.**
       전에는 둘 다 "셈만 맞춰진다" 였다. 늘어나는 것만 세고 바뀌는 것을 안 셌기 때문이다.
       그리고 낡은 파일과 빈 파일과 세 번 합치기에서 안 깨지는지도 본다. T238 */
    const edge = await pw.evaluate(() => {
      const me = { names: { a: "남편", b: "아내" }, start: "2026-01-05",
        days: { "2026-01-05": { status: "normal", h: 2, speak: 12, cards: 30, lre: 2,
                  unres: [{ t: "내 것" }], coll: [], aim: { a: "내 것", b: "" } } },
        media: { done: {}, fav: {}, pass: { "lle1-01": 2 }, lec: { 1: 2 } },
        cardDue: { "Q1-001": "2026-02-01" }, rot: [], clips: [], scripts: {},
        wchk: {}, q: {}, cues: {}, device: "a", fs: 2, wk: 3, rate: 1.5,
        card: null, cardMode: "today" };
      const copy = () => JSON.parse(JSON.stringify(me));
      const self = mergePlan(me, copy());
      const stale = mergePlan(me, { names: me.names, start: me.start,
        days: { "2026-01-05": { status: "normal", h: 2, speak: 3, cards: 5, lre: 0,
                  unres: [], coll: [] } },
        media: { done: {}, fav: {}, pass: { "lle1-01": 1 }, lec: { 1: 1 } },
        cardDue: { "Q1-001": "2026-01-01" }, rot: [], clips: [], scripts: {},
        wchk: {}, q: {}, cues: {} });
      let old = null, empty = null;
      try { old = mergePlan(me, { days: { "2026-01-04": { status: "normal", speak: 5 } } }); }
      catch (e) { old = { err: e.message }; }
      try { empty = mergePlan(me, { days: {} }); } catch (e) { empty = { err: e.message }; }
      const jump = mergePlan(me, { names: me.names, start: me.start,
        days: { "2026-01-05": { status: "normal", h: 2, speak: 99, cards: 30, lre: 2,
                  unres: [{ t: "내 것" }], coll: [] } },
        media: { done: {}, fav: {}, pass: {}, lec: {} }, cardDue: {},
        rot: [], clips: [], scripts: {}, wchk: {}, q: {}, cues: {} });
      /* 회차 켜짐표. A 는 1회차, B 는 2회차를 켰다. 합치면 둘 다 켜져 있어야 한다. */
      const rounds = mergePlan(
        { names: me.names, start: me.start, days: {},
          media: { done: {}, fav: {}, pass: { "lle1-01": { 1: true } }, lec: {} },
          cardDue: {}, rot: [], clips: [], scripts: {}, wchk: {}, q: {}, cues: {} },
        { names: me.names, start: me.start, days: {},
          media: { done: {}, fav: {}, pass: { "lle1-01": { 2: true } }, lec: {} },
          cardDue: {}, rot: [], clips: [], scripts: {}, wchk: {}, q: {}, cues: {} });
      let cur = me;
      for (let i = 0; i < 3; i++) cur = mergePlan(cur, { names: me.names, start: me.start,
        days: { "2026-01-05": { status: "normal", h: 2, speak: 0, cards: 0, lre: 0,
                  unres: [{ t: "상대 것" }], coll: [] } },
        media: { done: {}, fav: {}, pass: {}, lec: {} }, cardDue: {},
        rot: [], clips: [], scripts: {}, wchk: {}, q: {}, cues: {} }).out;
      return { selfChg: self.chg.length, selfAsk: self.ask.length,
               selfSame: JSON.stringify(self.out) === JSON.stringify(me),
               staleChg: stale.chg.length, staleSpeak: stale.out.days["2026-01-05"].speak,
               staleDue: stale.out.cardDue["Q1-001"],
               oldErr: old.err || "", oldHas: old.out ? !!old.out.days["2026-01-04"] : false,
               oldStart: old.out ? old.out.start : null,
               emptyErr: empty.err || "",
               emptySame: empty.out ? JSON.stringify(empty.out) === JSON.stringify(me) : false,
               jump: jump.chg.map((c) => c.what + ":" + c.from + ">" + c.to),
               thrice: cur.days["2026-01-05"].unres.length,
               rounds: rounds.out.media.pass["lle1-01"],
               roundChg: rounds.chg.length };
    });
    if (edge.selfChg || edge.selfAsk || !edge.selfSame)
      bad.push("자기 파일을 다시 합쳤는데 무엇인가 바뀐다");
    if (edge.staleChg) bad.push("낡은 파일이 내 값을 바꾼다: " + edge.staleChg + "곳");
    if (edge.staleSpeak !== 12 || edge.staleDue !== "2026-02-01")
      bad.push("낡은 파일이 이겼다");
    if (edge.oldErr) bad.push("키가 거의 없는 낡은 판에서 깨진다: " + edge.oldErr);
    if (!edge.oldHas) bad.push("낡은 판의 날을 안 가져온다");
    if (edge.oldStart !== "2026-01-05") bad.push("시작일 없는 파일이 시작일을 지운다");
    if (edge.emptyErr) bad.push("빈 파일에서 깨진다: " + edge.emptyErr);
    if (!edge.emptySame) bad.push("빈 파일을 합쳤는데 무엇인가 바뀐다");
    if (edge.thrice !== 2) bad.push("세 번 합쳤더니 미해결이 " + edge.thrice + "개다");
    /* 회차 켜짐표는 셈이 아니다. 한쪽에서 켠 것이 합친 뒤에도 켜져 있어야 한다. */
    if (!edge.rounds || !edge.rounds["1"] || !edge.rounds["2"])
      bad.push("합치기가 회차 켜짐을 안 모은다: " + JSON.stringify(edge.rounds));
    if (!edge.roundChg) bad.push("회차가 켜졌는데 바뀐다고 안 적는다");
    /* 숫자가 뛰는 것은 늘어나는 것이 아니다. **바뀌는 것으로 세야 보인다.** */
    if (!edge.jump.some((x) => x.indexOf("발화 분:12>99") >= 0))
      bad.push("셈이 뛰는 것을 안 보인다: " + edge.jump.join(" / "));
    /* **빈 자리가 채워지는 것도 바뀌는 것이다.** 안 묻는 것과 안 보이는 것은 다르다.
       그날 상태는 진도를 정하는 값인데 기록 없음에서 정상으로 조용히 바뀌고 있었다.
       두 화면을 나란히 읽다가 보였다. 합치기 칸이 "부딪치는 자리가 없다" 라고만
       적고 넘어갔다. T255 */
    const fill = await pw.evaluate(() => {
      const base = { names: { a: "남편", b: "아내" }, start: "2026-01-05",
        media: { done: {}, fav: {}, pass: {} }, cardDue: {}, rot: [], clips: [],
        scripts: {}, wchk: {}, q: {}, cues: {} };
      const me = Object.assign({}, base, { days: { "2026-01-05":
        { status: null, h: 0, speak: 0, cards: 0, lre: 0, unres: [], coll: [],
          aim: { a: "", b: "" } } } });
      const them = Object.assign({}, base, { days: { "2026-01-05":
        { status: "normal", h: 2, speak: 9, cards: 8, lre: 1, unres: [], coll: [],
          aim: { a: "상대가 적은 것", b: "" } } } });
      const pl = mergePlan(me, them);
      return { chg: pl.chg.map((c) => c.what + ": " + c.from + " > " + c.to),
               ask: pl.ask.length };
    });
    if (fill.ask) bad.push("빈 자리를 채우는데 묻는다: " + fill.ask + "개");
    if (!fill.chg.some((x) => /그날 상태/.test(x)))
      bad.push("그날 상태가 조용히 바뀐다: " + fill.chg.join(" / "));
    if (!fill.chg.some((x) => /적은 것|블록 1과 4/.test(x)))
      bad.push("빈 칸이 글로 채워지는 것을 안 보인다: " + fill.chg.join(" / "));
    /* 화면. 안 바뀌는 판과 세션 중을 가려 말하는가 */
    const mgs = await pw.evaluate(async () => {
      go("ledger");
      await new Promise((r) => setTimeout(r, 300));
      const box = document.getElementById("mgBox");
      const show = (o) => { MG.plan = mergePlan(S, o); MG.pick = {}; MG.name = "x.json";
                            renderMerge(); return box.innerText; };
      const selfPlan = mergePlan(S, JSON.parse(JSON.stringify(S)));
      const same = show(JSON.parse(JSON.stringify(S)));
      const other = JSON.parse(JSON.stringify(S));
      other.days[today()] = { status: "normal", h: 2, speak: 99, cards: 99, lre: 9,
                              unres: [], coll: [] };
      const diff = show(other);
      const wasRun = T.run;
      T.run = true;
      const busy = show(other);
      const wentThrough = (function () { const g = document.getElementById("mgGo");
        return !!g; })();
      T.run = wasRun;
      MG.plan = null; MG.pick = {}; renderMerge();
      return { same, diff, busy, wentThrough, closed: box.hidden,
               selfWhy: JSON.stringify({ ask: selfPlan.ask.map((q) => q.path),
                                         chg: selfPlan.chg.slice(0, 4),
                                         add: selfPlan.add }) };
    });
    /* **무엇이 떴는지를 같이 적는다.** "안 한다" 만 적으면 왜 그런지를 또 재야 한다. */
    if (mgs.same.indexOf("바뀌는 것이 없다") < 0)
      bad.push("같은 파일을 합칠 때 바뀔 것이 없다고 안 한다: " + mgs.selfWhy);
    if (mgs.diff.indexOf("바뀌는 것이 없다") >= 0)
      bad.push("셈이 뛰는데 바뀔 것이 없다고 한다");
    if (mgs.diff.indexOf("99") < 0) bad.push("바뀌는 셈을 화면에 안 적는다");
    if (mgs.busy.indexOf("세션 중에는 안 합친다") < 0)
      bad.push("세션 중에 합치기가 열린다");
    if (mgs.wentThrough) bad.push("세션 중인데 합친다 단추가 있다");
    if (!mgs.closed) bad.push("그만둔 뒤에 합치기 칸이 안 닫힌다");

    /* **같은 판.** `docs/round.md` 가 정했다. 망이 없어서 두 기기가 한 마디도
       못 주고받는다. 둘 다 아는 넷에서 똑같이 셈해 낸다.

       **두 기기를 다 돌려 본다.** 한 기기만 재면 서로 반대 자리인지가 안 걸린다.
       그것이 이 물건이 하는 일 전부다. T239 */
    const rd = await pw.evaluate(() => {
      const was = S.device;
      const seat = (dev, fn) => { S.device = dev; const v = fn(); S.device = was; return v; };
      /* 같은 씨앗이면 같은 차례. 다른 회나 다른 판이면 다른 차례 */
      const o1 = roundOrder(8, roundSeed("mirror", 0)).join("");
      const o2 = roundOrder(8, roundSeed("mirror", 0)).join("");
      const o3 = roundOrder(8, roundSeed("mirror", 1)).join("");
      const o4 = roundOrder(8, roundSeed("swap", 0)).join("");
      const whole = roundOrder(8, roundSeed("mirror", 0)).slice().sort((a, b) => a - b).join("");
      /* 두 기기가 스무 회 내내 서로 반대인가 */
      /* **주기의 배수만큼 돈다.** 넉 회마다 도는 판을 스무 회 보면 여덟 대 열둘이다.
         스물이 여덟(넉 회 두 자리)의 배수가 아니라서다. 반반이 될 수가 없다.
         처음에 스물로 재고 열을 바랐다가 걸렸다. **검사가 틀렸다.** T239 */
      let opp = true, mine = 0, yours = 0;
      for (let s = 0; s < 16; s++) {
        const a = seat("a", () => roundFirst(s, 4));
        const b = seat("b", () => roundFirst(s, 4));
        if (a === b || a === null || b === null) opp = false;
        if (a) mine++;
        if (b) yours++;
      }
      /* 도는 주기 */
      const e1 = [], e3 = [];
      for (let s = 0; s < 6; s++) e1.push(seat("a", () => roundFirst(s, 1)) ? 1 : 0);
      for (let s = 0; s < 9; s++) e3.push(seat("a", () => roundFirst(s, 3)) ? 1 : 0);
      /* 몫이 서로 채우는가 */
      const pa = seat("a", () => roundPart(0, 4, ["앞", "뒤"]));
      const pb = seat("b", () => roundPart(0, 4, ["앞", "뒤"]));
      /* 기기 쪽을 안 골랐으면 둘 다 보인다 */
      const none = seat(null, () => ({ first: roundFirst(0, 4),
                                       part: roundPart(0, 4, ["앞", "뒤"]) }));
      /* 표시. 옆 회끼리 나란하면 안 된다 */
      const tags = [];
      for (let s = 0; s < 12; s++) tags.push(roundTag("mirror", s));
      const abc = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
      let nearby = 0;
      for (let i = 0; i + 1 < tags.length; i++)
        if (Math.abs(abc.indexOf(tags[i][1]) - abc.indexOf(tags[i + 1][1])) <= 1 &&
            tags[i][0] === tags[i + 1][0]) nearby++;
      return { o1, o2, o3, o4, whole, opp, mine, yours, e1, e3,
               pa: pa.mine.concat(pa.hidden).join(""), pb: pb.mine.concat(pb.hidden).join(""),
               paMine: pa.mine[0], pbMine: pb.mine[0],
               noneFirst: none.first, noneBoth: none.part.both,
               noneMine: none.part.mine.length, tags, nearby,
               next: [roundNextTurn(0, 4), roundNextTurn(3, 4), roundNextTurn(4, 4)],
               seed: roundSeed("mirror", 0) };
    });
    if (rd.o1 !== rd.o2) bad.push("같은 씨앗인데 차례가 다르다: " + rd.o1 + " / " + rd.o2);
    if (rd.o1 === rd.o3) bad.push("회가 다른데 차례가 같다");
    if (rd.o1 === rd.o4) bad.push("판이 다른데 차례가 같다");
    if (rd.whole !== "01234567") bad.push("섞은 차례에 빠지거나 겹친 것이 있다: " + rd.whole);
    if (!rd.opp) bad.push("두 기기가 같은 자리가 되는 회가 있다");
    if (rd.mine !== rd.yours || rd.mine + rd.yours !== 16)
      bad.push("열여섯 회에서 자리가 " + rd.mine + " 대 " + rd.yours + " 다. 반반이어야 한다");
    if (rd.e1.join("") !== "010101") bad.push("한 회마다 안 돈다: " + rd.e1.join(""));
    if (rd.e3.join("") !== "000111000") bad.push("세 회마다 안 돈다: " + rd.e3.join(""));
    if (rd.next.join(",") !== "4,4,8") bad.push("다음 바뀌는 회를 틀리게 센다: " + rd.next.join(","));
    if (rd.paMine === rd.pbMine) bad.push("두 기기가 같은 몫을 본다: " + rd.paMine);
    if (rd.pa !== "뒤앞" || rd.pb !== "앞뒤") bad.push("몫이 서로 안 채운다: " + rd.pa + " " + rd.pb);
    if (rd.noneFirst !== null) bad.push("기기 쪽을 안 골랐는데 자리를 정한다");
    if (!rd.noneBoth || rd.noneMine !== 2)
      bad.push("기기 쪽을 안 골랐는데 한쪽을 가린다. 볼 사람이 하나뿐인 날이다");
    /* **씨앗을 안 섞으면 표시가 나란해진다.** 회 하나 차이가 글자 하나 차이로 나온다.
       나란한 표시는 두 사람이 흘끗 보고 같다고 여긴다. T239 */
    if (rd.nearby > 2) bad.push("판 표시가 나란하다. 씨앗이 안 섞였다: " + rd.tags.join(" "));
    if (new Set(rd.tags).size < rd.tags.length - 1)
      bad.push("판 표시가 겹친다: " + rd.tags.join(" "));
    /* 시계를 안 쓴다. 시간이 흘러도 같은 씨앗이어야 한다. */
    await new Promise((r) => setTimeout(r, 1100));
    const rd2 = await pw.evaluate(() => roundSeed("mirror", 0));
    if (rd2 !== rd.seed) bad.push("시간이 지나니 씨앗이 바뀐다. 시계를 쓰고 있다");

    /* **두 기기를 진짜로 띄워 본다.** 앞의 판들은 한 화면에서 `S.device` 를 바꿔 가며
       쟀다. 그것은 셈이 맞는지를 본 것이고 **화면이 실제로 갈리는지는 다른 일**이다.
       저장소를 따로 쓰는 창을 둘 띄워 나란히 읽는다. T240 */
    const pair2 = await (async () => {
      const out = [];
      for (const who of ["a", "b"]) {
        const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
        const q = await c.newPage();
        q.on("pageerror", (e) => bad.push("판 화면 오류: " + e.message));
        await q.goto(PAGE);
        await q.evaluate((w) => { localStorage.setItem("eng2p.v1", JSON.stringify(
          { v: 1, names: { a: "남편", b: "아내" }, start: "2026-01-05", days: {},
            media: { done: {}, fav: {}, pass: {} }, wk: 0, onboarded: true, device: w,
            cardDue: {}, cues: {}, rate: 1, fs: 0, wchk: {}, q: {}, rot: [],
            clips: [], scripts: {} })); }, who);
        await q.goto(PAGE);
        await q.waitForTimeout(400);
        await q.evaluate(() => go("rules"));
        await q.waitForTimeout(250);
        const read = () => q.evaluate(() => ({
          mine: [...document.querySelectorAll("#splitCheck .vmine>div")].map((x) => x.textContent),
          hid: [...document.querySelectorAll("#splitCheck .vhid")].map((x) => x.textContent),
          tag: roundTag("check", SPLIT.step), step: SPLIT.step }));
        const at0 = await read();
        await q.click("#splitNext"); await q.click("#splitNext");
        const at2 = await read();
        /* 동시 공개. 빈 칸이면 안 펴지고 적으면 펴진다. */
        const gate = await q.evaluate(() => {
          const box = document.getElementById("splitCheck");
          box.innerHTML = '<input id="tstF"><div id="tstG"></div>';
          const draw = () => { document.getElementById("tstG").innerHTML =
            revealGate("t", "tstF", "같이 본다");
            revealBind(document.getElementById("tstG"), draw); };
          draw();
          const shut = document.querySelector("#tstG button").disabled;
          const before = document.getElementById("tstG").innerText;
          document.getElementById("tstF").value = "적었다";
          draw();
          const open = document.querySelector("#tstG button").disabled;
          const asks = document.getElementById("tstG").innerText;
          document.querySelector("#tstG button").click();
          const after = document.getElementById("tstG").innerText;
          revealReset("t");
          return { shut, before, open, asks, after };
        });
        out.push({ who, at0, at2, gate });
        await c.close();
      }
      return out;
    })();
    const [dA, dB] = pair2;
    if (dA.at0.tag !== dB.at0.tag)
      bad.push("두 기기의 판 표시가 다르다: " + dA.at0.tag + " / " + dB.at0.tag);
    if (dA.at2.tag !== dB.at2.tag) bad.push("회를 넘겼더니 판 표시가 갈린다");
    if (!dA.at0.mine.length || !dB.at0.mine.length) bad.push("판 화면에 몫이 안 뜬다");
    if (dA.at0.mine.join("") === dB.at0.mine.join(""))
      bad.push("두 기기가 같은 몫을 본다: " + dA.at0.mine.join(""));
    /* **가린 자리를 없는 자리로 만들지 않는다.** 빈 자리면 고장 난 줄 안다. */
    [dA, dB].forEach((d) => {
      if (!d.at0.hid.length) bad.push(d.who + " 기기가 가린 자리를 안 남긴다");
      else if (!/화면에만/.test(d.at0.hid[0]))
        bad.push(d.who + " 기기가 왜 안 보이는지를 안 적는다: " + d.at0.hid[0]);
    });
    if (dA.at0.mine.join("") === dA.at2.mine.join(""))
      bad.push("두 회를 넘겼는데 자리가 안 바뀐다");
    if (dA.at2.mine.join("") === dB.at2.mine.join(""))
      bad.push("자리가 바뀐 뒤에도 두 기기가 같은 몫을 본다");
    [dA, dB].forEach((d) => {
      if (!d.gate.shut) bad.push(d.who + " 기기가 안 적었는데 펴진다");
      if (d.gate.open) bad.push(d.who + " 기기가 다 적었는데 단추가 잠겨 있다");
      /* 기기가 못 하는 것을 사람이 한다. **시키지 않으면 사람도 안 한다.** */
      if (d.gate.asks.indexOf("상대도") < 0)
        bad.push(d.who + " 기기가 상대에게 물어보라고 안 시킨다: " + d.gate.asks);
      if (d.gate.after.indexOf("폈다") < 0) bad.push(d.who + " 기기가 눌러도 안 펴진다");
    });

    /* **기기가 하나인 날.** 돌려 본다. `docs/round.md` 9장이다.
       건네는 1초에 화면이 켜져 있다. **덮지 않으면 그 1초에 다 보인다.**
       덮개 안에 앞 사람 몫이 한 글자도 없어야 한다. T241 */
    const solo = await (async () => {
      const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const q = await c.newPage();
      q.on("pageerror", (e) => bad.push("돌려 보기 화면 오류: " + e.message));
      await q.goto(PAGE);
      await q.evaluate(() => { localStorage.setItem("eng2p.v1", JSON.stringify(
        { v: 1, names: { a: "남편", b: "아내" }, start: "2026-01-05", days: {},
          media: { done: {}, fav: {}, pass: {} }, wk: 0, onboarded: true, device: null,
          cardDue: {}, cues: {}, rate: 1, fs: 0, wchk: {}, q: {}, rot: [],
          clips: [], scripts: {} })); });
      await q.goto(PAGE);
      await q.waitForTimeout(400);
      await q.evaluate(() => go("rules"));
      await q.waitForTimeout(250);
      const read = () => q.evaluate(() => ({
        mine: [...document.querySelectorAll("#splitCheck .vmine>div")].map((x) => x.textContent),
        hid: [...document.querySelectorAll("#splitCheck .vhid")].map((x) => x.textContent),
        cover: !!document.querySelector("#splitCheck .socover"),
        html: document.getElementById("splitCheck").innerHTML }));
      const off = await read();
      await q.click("#soloTog"); await q.waitForTimeout(200);
      const on = await read();
      await q.click("#soHand"); await q.waitForTimeout(200);
      const hand = await read();
      /* 건네는 중에 기기가 잠들거나 다시 열릴 수 있다. **그때도 덮여 있어야 한다.** */
      await q.reload(); await q.waitForTimeout(400);
      await q.evaluate(() => go("rules")); await q.waitForTimeout(250);
      const again = await read();
      /* **없는 단추를 누르러 가지 않는다.** 덮개가 없으면 이 단추도 없고
         기다리다 서른 초 뒤에 "Timeout" 만 남는다. 그 글로는 무엇이 없는지 모른다.
         일부러 덮개를 없애 보고 알았다. 검사가 무엇이 없는지를 말해야 한다. T241 */
      let took = null;
      if (again.cover) {
        await q.click("#soTake"); await q.waitForTimeout(200);
        took = await read();
      }
      await c.close();
      return { off, on, hand, again, took };
    })();
    if (solo.off.mine.length !== 2)
      bad.push("기기 쪽을 안 골랐는데 둘 다 안 보인다: " + solo.off.mine.join(","));
    if (solo.on.mine.length !== 1)
      bad.push("돌려 보기인데 몫이 " + solo.on.mine.length + "개 보인다");
    /* 화면이 하나뿐인 날에 "상대 화면" 이라고 하면 안 된다. */
    if (solo.on.hid.length && /상대 화면/.test(solo.on.hid[0]))
      bad.push("한 기기인데 상대 화면이라고 한다: " + solo.on.hid[0]);
    if (!solo.hand.cover) bad.push("건넨다를 눌렀는데 안 덮인다");
    if (solo.hand.html.indexOf(solo.on.mine[0]) >= 0)
      bad.push("덮개 밑에 앞 사람 몫이 남아 있다: " + solo.on.mine[0]);
    if (!solo.again.cover) bad.push("건네는 중에 다시 열었더니 덮개가 없어진다");
    if (!solo.took) bad.push("덮개가 없어서 받았다를 못 눌렀다");
    else {
      if (!solo.took.mine.length) bad.push("받았다를 눌렀는데 몫이 안 뜬다");
      if (solo.took.mine[0] === solo.on.mine[0])
        bad.push("건넸는데 앞 사람 몫이 그대로다: " + solo.took.mine[0]);
    }
    /* 돌려 보기 값 셋은 안 건너간다. 기기가 둘인 쪽 파일을 받아도 이 기기 것이다. */
    const soloLocal = await pw.evaluate(() => {
      const me = { names: { a: "남편", b: "아내" }, start: "2026-01-05", days: {},
        media: { done: {}, fav: {}, pass: {} }, cardDue: {}, rot: [], clips: [],
        scripts: {}, wchk: {}, q: {}, cues: {}, solo: true, soloSeat: 1, soloHand: false };
      const them = JSON.parse(JSON.stringify(me));
      them.solo = false; them.soloSeat = 0; them.soloHand = true;
      const o = mergePlan(me, them).out;
      return [o.solo, o.soloSeat, o.soloHand];
    });
    if (soloLocal.join(",") !== "true,1,false")
      bad.push("합치기가 돌려 보기 값을 건드린다: " + soloLocal.join(","));

    /* **이 기기가 어느 쪽인가를 화면 전체로.** 글자 한 줄이면 흘끗 봐서 안 보인다.
       기기 쪽은 날마다 뒤집히고 (T216) 판 안에서 자리가 또 돈다 (T239). T242 */
    const band = await (async () => {
      const got = {};
      for (const who of ["a", "b", null]) {
        const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
        const q = await c.newPage();
        q.on("pageerror", (e) => bad.push("쪽 표시 화면 오류: " + e.message));
        await q.goto(PAGE);
        await q.evaluate((w) => { localStorage.setItem("eng2p.v1", JSON.stringify(
          { v: 1, names: { a: "남편", b: "아내" }, start: "2026-01-05", days: {},
            media: { done: {}, fav: {}, pass: {} }, wk: 0, onboarded: true, device: w,
            cardDue: {}, cues: {}, rate: 1, fs: 0, wchk: {}, q: {}, rot: [],
            clips: [], scripts: {} })); }, who);
        await q.goto(PAGE);
        await q.waitForTimeout(400);
        got[String(who)] = await q.evaluate(() => ({
          cls: /side-(a|b|none)/.exec(document.body.className),
          tag: document.getElementById("sideTag").textContent,
          bandOn: !!document.querySelector(".sideband"),
          bg: getComputedStyle(document.querySelector(".sideband")).backgroundImage,
          side: deviceSide() }));
        if (who === "a") {
          /* **날이 바뀌면 뒤집힌다.** 세션 중에 자정을 넘길 수 있다. */
          got.flip = await q.evaluate(() => {
            const real = today;
            const was = document.getElementById("sideTag").textContent;
            window.today = function () { return addDays(real(), 1); };
            tick();
            const now = { cls: document.body.className,
                          tag: document.getElementById("sideTag").textContent };
            window.today = real; tick();
            return { was, now, back: document.getElementById("sideTag").textContent };
          });
          /* 다른 자리가 class 를 통째로 써 버려도 다음 초에 돌아와야 한다. */
          got.wipe = await q.evaluate(() => {
            document.body.className = "";
            tick();
            return document.body.className;
          });
          got.solo = await q.evaluate(() => {
            S.device = null; S.solo = true; S.soloSeat = 0; save(); paintSide();
            const one = document.getElementById("sideTag").textContent;
            S.soloSeat = 1; save(); paintSide();
            return [one, document.getElementById("sideTag").textContent];
          });
        }
        await c.close();
      }
      return got;
    })();
    ["a", "b", "null"].forEach((k) => {
      const g = band[k];
      if (!g.bandOn) bad.push(k + " 기기에 쪽 띠가 없다");
      if (!g.cls) bad.push(k + " 기기 몸통에 쪽 표시가 없다: " + JSON.stringify(g.cls));
      if (!g.tag) bad.push(k + " 기기에 쪽 글자가 없다");
    });
    /* **색만으로 가르지 않는다.** 색을 못 보는 눈에도 갈려야 한다. */
    if (!/\bA\b/.test(band.a.tag) && !/\bB\b/.test(band.a.tag))
      bad.push("쪽 표시에 A 나 B 라는 글자가 없다: " + band.a.tag);
    if (band.a.cls[1] === band.b.cls[1])
      bad.push("두 기기가 같은 쪽으로 뜬다: " + band.a.cls[1]);
    if (band.a.bg === band.b.bg) bad.push("두 기기의 띠 색이 같다");
    if (band["null"].cls[1] !== "none")
      bad.push("쪽을 안 골랐는데 한쪽으로 뜬다: " + band["null"].cls[1]);
    if (band.flip.was === band.flip.now.tag)
      bad.push("날이 바뀌었는데 쪽 표시가 그대로다: " + band.flip.was);
    if (band.flip.back !== band.flip.was) bad.push("날을 되돌렸는데 쪽 표시가 안 돌아온다");
    if (!/side-(a|b|none)/.test(band.wipe))
      bad.push("몸통 class 가 지워졌더니 쪽 띠가 안 돌아온다: " + band.wipe);
    if (band.solo[0] === band.solo[1]) bad.push("돌려 보기에서 자리가 바뀌어도 표시가 같다");
    if (!/돌려/.test(band.solo[0])) bad.push("돌려 보기라는 것을 표시가 안 말한다: " + band.solo[0]);

    /* **자리가 바뀐 그 순간에 알린다.** `roundNextTurn` 이 언제 바뀌는지를 세 주기는
       했는데 바뀌는 그 순간에 아무 일도 안 났다. 그러면 두 사람이 세면서 돈다.
       소리만으로 안 알린다. 소리를 끌 수 있고 끈 사람에게는 아무 일도 안 난다. T243 */
    const turn = await (async () => {
      const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const q = await c.newPage();
      q.on("pageerror", (e) => bad.push("교대 알림 화면 오류: " + e.message));
      await q.goto(PAGE);
      await q.evaluate(() => { localStorage.setItem("eng2p.v1", JSON.stringify(
        { v: 1, names: { a: "남편", b: "아내" }, start: "2026-01-05", days: {},
          media: { done: {}, fav: {}, pass: {} }, wk: 0, onboarded: true, device: "a",
          cardDue: {}, cues: {}, rate: 1, fs: 0, wchk: {}, q: {}, rot: [],
          clips: [], scripts: {} })); });
      await q.goto(PAGE);
      await q.waitForTimeout(400);
      await q.evaluate(() => go("rules"));
      await q.waitForTimeout(250);
      const read = () => q.evaluate(() => ({
        note: (document.getElementById("splitTurn") || {}).innerText || "",
        flash: document.body.classList.contains("turn-flash"),
        mine: [...document.querySelectorAll("#splitCheck .vmine>div")].map((x) => x.textContent) }));
      const steps = [await read()];
      for (let i = 0; i < 4; i++) {
        await q.click("#splitNext"); await q.waitForTimeout(150);
        steps.push(await read());
      }
      /* 띠는 잠깐만 굵다. 남아 있으면 다음 알림이 안 보인다. */
      await q.waitForTimeout(1700);
      const cooled = (await read()).flash;
      /* 소리를 꺼도 글과 띠는 남는가. **자리가 정말 바뀌는 두 회로 잰다.** */
      const mute = await q.evaluate(() => {
        S.soundOff = true; save();
        document.getElementById("splitTurn").innerHTML = "";
        document.body.classList.remove("turn-flash");
        TURN.at = {};
        turnCheck("mute", 0, 2);
        const got = turnCheck("mute", 2, 2);
        if (got) turnAlert(2, 2, ["읽는 쪽", "짚는 쪽"], "splitTurn");
        return { fired: !!got, note: document.getElementById("splitTurn").innerText,
                 flash: document.body.classList.contains("turn-flash") };
      });
      /* 처음 여는 판은 안 알린다. 아직 아무것도 안 바뀌었다. */
      const fresh = await q.evaluate(() => {
        turnForget("np");
        return [turnCheck("np", 0, 2), turnCheck("np", 1, 2), turnCheck("np", 2, 2)]
          .map((x) => !!x);
      });
      await c.close();
      return { steps, cooled, mute, fresh };
    })();
    if (turn.steps[0].note) bad.push("판을 처음 열었는데 자리가 바뀌었다고 한다");
    const fired = turn.steps.map((s) => (s.note ? 1 : 0)).join("");
    if (fired !== "00101") bad.push("자리가 바뀌는 회에 안 알린다: " + fired);
    /* **바뀌었다고만 하면 모른다.** 이제 무엇을 하는지가 있어야 한다. */
    const said = turn.steps.filter((s) => s.note).map((s) => s.note);
    said.forEach((s) => {
      if (!/읽는 쪽|짚는 쪽/.test(s)) bad.push("알림이 무슨 자리인지를 안 말한다: " + s);
    });
    if (said.length === 2 && said[0] === said[1])
      bad.push("두 번 바뀌었는데 같은 자리라고 한다: " + said[0]);
    /* 몫이 실제로 바뀐 회에서만 알려야 한다. */
    turn.steps.forEach((s, i) => {
      if (!i) return;
      const moved = s.mine.join("") !== turn.steps[i - 1].mine.join("");
      if (moved !== !!s.note)
        bad.push(i + "회에서 몫은 " + (moved ? "바뀌었는데" : "그대로인데") +
                 " 알림은 " + (s.note ? "떴다" : "안 떴다"));
    });
    if (turn.cooled) bad.push("띠가 계속 굵다. 다음 알림이 안 보인다");
    if (!turn.mute.fired) bad.push("소리를 껐더니 알림 자체가 안 난다");
    if (!turn.mute.note) bad.push("소리를 껐더니 글이 안 뜬다");
    if (!turn.mute.flash) bad.push("소리를 껐더니 띠도 안 움직인다");
    if (turn.fresh.join(",") !== "false,false,true")
      bad.push("새 판에서 알리는 자리가 틀렸다: " + turn.fresh.join(","));

    /* **즉시 가리기.** 상대가 이 화면 쪽으로 올 때 그 자리에서 덮는다 (T244).

       **화면에 남은 글자를 센다.** `visibility` 가 hidden 인지를 보지 않는다.
       처음에 그렇게 쟀는데 `.wrap` 이 hidden 인데 그 안 `.card` 가 visible 로 나왔다.
       그리고 그 재는 법으로는 **푼 뒤에 덮개가 안 걷히는 것**을 못 봤다.
       사람이 읽을 수 있는 글자가 몇 자인가. 그것이 상대 눈이 보는 것이다. */
    const veil = await (async () => {
      const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const q = await c.newPage();
      q.on("pageerror", (e) => bad.push("가리기 화면 오류: " + e.message));
      await q.goto(PAGE);
      await q.evaluate(() => { localStorage.setItem("eng2p.v1", JSON.stringify(
        { v: 1, names: { a: "남편", b: "아내" }, start: "2026-01-05", days: {},
          media: { done: {}, fav: {}, pass: {} }, wk: 0, onboarded: true, device: "a",
          cardDue: {}, cues: {}, rate: 1, fs: 0, wchk: {}, q: {}, rot: [],
          clips: [], scripts: {} })); });
      await q.goto(PAGE);
      await q.waitForTimeout(400);
      await q.evaluate(() => go("rules"));
      await q.waitForTimeout(250);
      const txt = () => q.evaluate(() => document.body.innerText);
      const before = await txt();
      await q.keyboard.press("h"); await q.waitForTimeout(200);
      const on = await txt();
      const stored = await q.evaluate(() => !!S.veiled);
      /* 덮인 채로 다른 키가 들으면 안 된다. 더듬다가 탭이 바뀐다. */
      const keyed = await q.evaluate(() => {
        const was = location.hash;
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "2", bubbles: true }));
        return was === location.hash;
      });
      /* 가린 채로 기기가 잠기거나 다시 열릴 수 있다. 그때도 덮여 있어야 한다. */
      await q.reload(); await q.waitForTimeout(400);
      const kept = await q.evaluate(() => !!S.veiled &&
        document.body.innerText.indexOf("가렸다") >= 0);
      await q.evaluate(() => veilToggle()); await q.waitForTimeout(200);
      await q.evaluate(() => go("rules")); await q.waitForTimeout(250);
      const off = await txt();
      /* 푼 뒤에 진짜 눌리는가. 덮개가 남아 있으면 손가락이 안 닿는다. */
      let clickable = true;
      try { await q.click("#splitNext", { timeout: 3000 }); }
      catch (e) { clickable = false; }
      /* 조작줄 단추. 세션 중에 늘 떠 있는 유일한 자리다. */
      const dock = await q.evaluate(() => {
        const b2 = document.getElementById("focusVeil");
        if (!b2) return null;
        b2.click();
        const n = document.body.innerText.length;
        veilToggle();
        return n;
      });
      await c.close();
      return { before: before.length, on: on.length, off: off.length,
               cover: on, stored, keyed, kept, clickable, dock };
    })();
    if (veil.on >= 40) bad.push("가렸는데 화면에 글자가 " + veil.on + "자 남아 있다");
    if (!/가렸다/.test(veil.cover)) bad.push("가림 화면이 왜 덮였는지를 안 적는다");
    if (/몫|회|판 표시/.test(veil.cover)) bad.push("가림 화면에 판의 글이 남아 있다");
    if (!veil.stored) bad.push("가린 것이 저장소에 안 남는다");
    if (!veil.keyed) bad.push("덮인 채로 다른 키가 듣는다");
    if (!veil.kept) bad.push("가린 채로 다시 열었더니 덮개가 없어진다");
    /* **푼 뒤가 가리기 전과 같아야 한다.** 처음에 서른아홉 자가 더 있었다.
       덮개의 `display:flex` 가 `[hidden]` 을 이겨서 안 걷힌 것이었다. */
    if (veil.off !== veil.before)
      bad.push("푼 뒤 글자 수가 " + veil.off + "다. 가리기 전은 " + veil.before + "였다");
    if (!veil.clickable) bad.push("푼 뒤에 단추가 안 눌린다. 덮개가 남아 있다");
    if (veil.dock === null) bad.push("조작줄에 가림 단추가 없다");
    else if (veil.dock >= 40) bad.push("조작줄 단추로는 안 덮인다: " + veil.dock + "자");

    /* **소리는 화면처럼 못 가른다.** 화면은 두 기기가 각자 그리면 갈리는데
       소리는 한 상에서 울리면 둘 다 듣는다. 기기가 둘이어도 상은 하나다.
       앱이 할 수 있는 것은 **어느 기기가 낼지**를 정하는 것까지고
       상대 귀에 안 닿게 하는 것은 이어폰이다. 못 하는 것을 하는 척하지 않는다. T245 */
    const snd = await (async () => {
      const out = {};
      for (const who of ["a", "b", null]) {
        const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
        const q = await c.newPage();
        q.on("pageerror", (e) => bad.push("소리 나누기 화면 오류: " + e.message));
        await q.goto(PAGE);
        await q.evaluate((w) => { localStorage.setItem("eng2p.v1", JSON.stringify(
          { v: 1, names: { a: "남편", b: "아내" }, start: "2026-01-05", days: {},
            media: { done: {}, fav: {}, pass: {} }, wk: 0, onboarded: true, device: w,
            cardDue: {}, cues: {}, rate: 1, fs: 0, wchk: {}, q: {}, rot: [],
            clips: [], scripts: {} })); }, who);
        await q.goto(PAGE);
        await q.waitForTimeout(400);
        await q.evaluate(() => go("rules"));
        await q.waitForTimeout(250);
        const before = await q.evaluate(() => ({
          ear: document.getElementById("splitEar").innerText,
          mine: soundMine(SPLIT.step, 2),
          note: soundNote(SPLIT.step, 2, ["읽는 쪽", "짚는 쪽"]),
          asked: !!document.querySelector("[data-ear]") }));
        /* **묻는 쪽이 정해져 있다.** 소리를 내는 기기에만 묻는다 (T254).
           없는 단추를 누르러 가면 서른 초를 기다린다 (T241, T247 에 겪었다). */
        let after = null;
        if (before.asked) {
          await q.click("[data-ear]", { timeout: 3000 }); await q.waitForTimeout(150);
          after = await q.evaluate(() => ({
            ear: document.getElementById("splitEar").innerText,
            asked: !!document.querySelector("[data-ear]"),
            /* **판마다 따로 묻는다.** 한 번 묻고 그날 내내 안 물으면
               다음 판에서 이어폰을 뺀 채로 돈다. */
            other: earOk("another") }));
        }
        out[String(who)] = { before, after };
        await c.close();
      }
      return out;
    })();
    ["a", "b", "null"].forEach((k) => {
      const g = snd[k];
      if (!/이어폰/.test(g.before.ear)) bad.push(k + " 기기 칸에 이어폰 말이 없다");
      if (g.before.mine) {
        /* 소리를 내는 기기. 묻고 답을 받는다. */
        if (!g.before.asked) bad.push(k + " 기기가 소리를 내는데 이어폰을 안 묻는다");
        else {
          if (g.after.asked) bad.push(k + " 기기가 답을 받고도 또 묻는다");
          if (!/끼웠다/.test(g.after.ear)) bad.push(k + " 기기가 답을 받은 것을 안 보인다");
          if (g.after.other) bad.push(k + " 기기가 한 판의 답을 다른 판에도 쓴다");
        }
      } else {
        /* 소리를 안 내는 기기. **묻지 않는다.** 엉뚱한 사람이 끼우면
           정작 소리가 나는 기기는 안 끼운 채로 돈다. T254 */
        if (g.before.asked) bad.push(k + " 기기는 소리를 안 내는데 이어폰을 묻는다");
        if (!/상대 기기에 끼운다/.test(g.before.ear))
          bad.push(k + " 기기가 이어폰을 어느 쪽에 끼우는지 안 말한다: " + g.before.ear);
      }
    });
    if (snd.a.before.mine === snd.b.before.mine)
      bad.push("두 기기가 같이 소리를 낸다: " + snd.a.before.mine);
    if (snd["null"].before.mine !== true)
      bad.push("기기가 하나인데 소리를 안 낸다");
    /* 소리를 안 내는 기기가 왜 조용한지를 말한다. 이어폰 칸이 그 말을 한다.
       **같은 말을 두 자리에 두지 않는다.** 두 화면을 나란히 읽다가 겹친 것이 보였다. */
    const quiet = snd.a.before.mine ? snd.b : snd.a;
    if (!/소리를 안 낸다/.test(quiet.before.ear))
      bad.push("소리를 안 내는 기기가 왜 조용한지를 안 적는다");
    /* **자리 이름 뒤에 조사를 안 붙인다.** 이름은 판이 주고 받침이 섞인다. */
    if (/쪽[가이]\s/.test(quiet.before.note))
      bad.push("자리 이름 뒤에 조사를 붙였다: " + quiet.before.note);

    /* **상대가 지금 어디인지는 이 기기가 모른다.** 망이 없다.
       대신 둘이 흘끗 견줄 짧은 표시를 늘 띄우고 갈렸으면 맞춘다.
       어긋난 줄을 모르고 두 시간을 가는 것이 제일 나쁘다. T246 */
    const where = await (async () => {
      const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const q = await c.newPage();
      q.on("pageerror", (e) => bad.push("자리 맞추기 화면 오류: " + e.message));
      await q.goto(PAGE);
      await q.evaluate(() => {
        function iso(d){var z=new Date(d.getTime()-d.getTimezoneOffset()*60000);
          return z.toISOString().slice(0,10);}
        var now=new Date(), st=new Date(now.getTime()-138*86400000), days={};
        for(var i=0;i<138;i++){var x=new Date(st.getTime()+i*86400000);
          if(x.getDay()===0) continue;
          days[iso(x)]={status:"normal",h:2,speak:12,cards:30,lre:2,unres:[],coll:[]};}
        localStorage.setItem("eng2p.v1",JSON.stringify(
          {v:1,names:{a:"남편",b:"아내"},start:iso(st),days:days,
           media:{done:{},fav:{},last:null,pass:{}},wk:0,onboarded:true,session:null,
           device:"a",recOpen:false,emgOpen:false,card:null,cardDue:{},
           cardMode:"today",cues:{},rate:1,fs:0,wchk:{},q:{},rot:[],clips:[],scripts:{}}));
      });
      await q.goto(PAGE);
      await q.waitForTimeout(500);
      await q.evaluate(() => { T.run = true; gotoBlock(2); });
      await q.waitForTimeout(900);
      const read = () => q.evaluate(() => ({
        tag: document.getElementById("focusWhere").textContent,
        idx: T.idx, left: T.left,
        shut: document.getElementById("whereDock").hidden,
        msg: (document.getElementById("whereMsg") || {}).textContent || "" }));
      const at3 = await read();
      await q.click("#focusWhere"); await q.waitForTimeout(200);
      const open = await read();
      const typed = async (v) => {
        await q.fill("#whereIn", v); await q.click("#whereGo");
        await q.waitForTimeout(200); return read();
      };
      const back = await typed("2-8");
      const junk = await typed("응?");
      const nope = await typed("9-8");
      const loose = await typed("1 : 12");
      await q.evaluate(() => { T.run = false; clearInterval(T.tick); });
      await c.close();
      return { at3, open, back, junk, nope, loose };
    })();
    if (where.at3.tag !== "3-30")
      bad.push("블록 3을 열었는데 자리 표시가 " + where.at3.tag + " 다");
    if (!where.at3.shut) bad.push("안 눌렀는데 맞추기 칸이 열려 있다");
    if (where.open.shut) bad.push("표시를 눌렀는데 맞추기 칸이 안 열린다");
    /* **뒤로도 간다.** 둘이 다른 블록에 있으면 같이 있는 것이 아니다. */
    if (where.back.idx !== 1 || where.back.left !== 480)
      bad.push("뒤 블록으로 못 맞춘다: " + where.back.tag);
    if (!/맞췄다/.test(where.back.msg))
      bad.push("맞췄는데 화면이 아무 말도 안 한다: " + JSON.stringify(where.back.msg));
    if (!/블록-분/.test(where.junk.msg)) bad.push("아무 글이나 쳤는데 안 짚는다");
    if (where.junk.idx !== 1) bad.push("아무 글이나 쳤는데 자리가 움직였다");
    if (!/블록-분/.test(where.nope.msg)) bad.push("없는 블록을 쳤는데 안 짚는다");
    if (where.nope.idx !== 1) bad.push("없는 블록을 쳤는데 자리가 움직였다");
    /* 사람이 읽어 주는 것을 받아 적는다. 사이에 무엇이 있어도 받는다. */
    if (where.loose.idx !== 0 || where.loose.left !== 720)
      bad.push("띄어 친 것을 안 받는다: " + where.loose.tag);

    /* **끊겼을 때 이어 붙이기.** 기기가 꺼지거나 새로 열린다. T247

       셋을 본다. 판의 회가 살아 있는가, 이어서 칸이 보이는가, 짝과 맞출 수 있는가.
       가운데가 이 턴의 값이다. 블록 1은 미디어 탭에서 듣는데 **이어서 칸은 오늘
       탭에 있다.** 주소가 `#media` 로 복원되면 끊긴 것을 아무도 못 본다. */
    const cut = await (async () => {
      const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const q = await c.newPage();
      q.on("pageerror", (e) => bad.push("이어 붙이기 화면 오류: " + e.message));
      await q.goto(PAGE);
      await q.evaluate(() => {
        function iso(d){var z=new Date(d.getTime()-d.getTimezoneOffset()*60000);
          return z.toISOString().slice(0,10);}
        var now=new Date(), st=new Date(now.getTime()-138*86400000), days={};
        for(var i=0;i<138;i++){var x=new Date(st.getTime()+i*86400000);
          if(x.getDay()===0) continue;
          days[iso(x)]={status:"normal",h:2,speak:12,cards:30,lre:2,unres:[],coll:[]};}
        localStorage.setItem("eng2p.v1",JSON.stringify(
          {v:1,names:{a:"남편",b:"아내"},start:iso(st),days:days,
           media:{done:{},fav:{},last:null,pass:{}},wk:0,onboarded:true,session:null,
           device:"a",recOpen:false,emgOpen:false,card:null,cardDue:{},
           cardMode:"today",cues:{},rate:1,fs:0,wchk:{},q:{},rot:[],clips:[],scripts:{}}));
      });
      await q.goto(PAGE);
      await q.waitForTimeout(500);
      /* 판을 세 회 돌리고 끊는다 */
      await q.evaluate(() => go("rules"));
      await q.waitForTimeout(250);
      for (let i = 0; i < 3; i++) { await q.click("#splitNext"); await q.waitForTimeout(100); }
      const ran = await q.evaluate(() => ({ step: SPLIT.step, saved: (S.rstep || {}).check,
                                            seat: (S.rseat || {}).check }));
      await q.reload(); await q.waitForTimeout(500);
      await q.evaluate(() => go("rules")); await q.waitForTimeout(250);
      const kept = await q.evaluate(() => ({ step: SPLIT.step,
        note: document.getElementById("splitTurn").innerText }));
      /* 미디어 탭에서 듣다 끊긴다 */
      await q.evaluate(() => { go("media"); T.run = true; gotoBlock(0);
                               T.left = 1200; saveSession(); });
      await q.waitForTimeout(300);
      await q.reload(); await q.waitForTimeout(700);
      const woke = await q.evaluate(() => ({ hash: location.hash,
        today: !document.getElementById("t-today").hidden,
        resume: document.getElementById("resumeBox").innerText,
        /* **있는지가 아니라 보이는지를 본다.** T241 에 같은 덫을 고쳤는데
           그때는 "단추가 없다" 였고 여기서는 "단추가 있는데 안 보인다" 다.
           있는 것만 보고 누르러 가면 서른 초를 기다리고 "Timeout" 만 남는다. */
        has: (function(){ var e=document.getElementById("resumeWith");
          return !!(e && e.getClientRects().length); })() }));
      let met = null;
      if (woke.has) {
        await q.click("#resumeWith", { timeout: 3000 }); await q.waitForTimeout(200);
        await q.fill("#whereIn", "2-6"); await q.click("#whereGo");
        await q.waitForTimeout(200);
        met = await q.evaluate(() => ({ idx: T.idx, left: T.left }));
      }
      /* 끊긴 것이 없으면 보던 자리를 지킨다 */
      await q.evaluate(() => { clearSession(); T.idx = 0; T.left = BLOCKS[0].m * 60;
                               go("rot"); });
      await q.waitForTimeout(200);
      await q.reload(); await q.waitForTimeout(600);
      const free = await q.evaluate(() => location.hash);
      await c.close();
      return { ran, kept, woke, met, free };
    })();
    if (cut.ran.saved !== cut.ran.step)
      bad.push("판의 회를 저장소에 안 남긴다: " + JSON.stringify(cut.ran));
    if (cut.kept.step !== cut.ran.step)
      bad.push("다시 열었더니 판의 회가 " + cut.kept.step + "로 돌아갔다");
    if (cut.kept.note) bad.push("다시 열었을 뿐인데 자리가 바뀌었다고 한다: " + cut.kept.note);
    if (cut.woke.hash !== "#today" || !cut.woke.today)
      bad.push("끊긴 세션이 있는데 오늘 탭으로 안 온다: " + cut.woke.hash);
    if (!/멈췄다/.test(cut.woke.resume)) bad.push("이어서 칸이 안 뜬다");
    if (!/낡았다/.test(cut.woke.resume))
      bad.push("이 기기 자리가 낡았다는 말이 없다: " + cut.woke.resume.slice(0, 60));
    if (!cut.woke.has) bad.push("짝과 맞추는 자리가 없다");
    else if (!cut.met || cut.met.idx !== 1 || cut.met.left !== 360)
      bad.push("이어서 칸에서 짝과 못 맞춘다: " + JSON.stringify(cut.met));
    /* **끊긴 것이 없으면 데려오지 않는다.** 늘 오늘로 끌면 보던 자리를 잃는다. */
    if (cut.free !== "#rot") bad.push("끊긴 것이 없는데 보던 자리를 잃는다: " + cut.free);

    /* **둘이 같은 것을 가리키려면 이름이 있어야 한다.** 번호를 붙인다.
       번호는 **원본 차례**에서 나온다. 이 기기에 보이는 것만 세면
       첫째가 안 보이는 기기는 둘째부터 세고 "둘째 것" 이 서로 다른 것을 가리킨다.
       고치기 전에는 두 기기가 다 1번을 보이고 있었다. T248 */
    const nums = await (async () => {
      const seen = {};
      for (const who of ["a", "b"]) {
        const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
        const q = await c.newPage();
        q.on("pageerror", (e) => bad.push("줄 번호 화면 오류: " + e.message));
        await q.goto(PAGE);
        await q.evaluate((w) => { localStorage.setItem("eng2p.v1", JSON.stringify(
          { v: 1, names: { a: "남편", b: "아내" }, start: "2026-01-05", days: {},
            media: { done: {}, fav: {}, pass: {} }, wk: 0, onboarded: true, device: w,
            cardDue: {}, cues: {}, rate: 1, fs: 0, wchk: {}, q: {}, rot: [],
            clips: [], scripts: {}, rstep: {}, rseat: {} })); }, who);
        await q.goto(PAGE);
        await q.waitForTimeout(400);
        await q.evaluate(() => go("rules"));
        await q.waitForTimeout(250);
        seen[who] = await q.evaluate(() => [...document.querySelectorAll("#splitCheck .vmine>div")]
          .map((x) => ({ n: (x.querySelector(".lno") || {}).textContent,
                         t: (x.querySelector(".lno") || {}).nextSibling ?
                            x.textContent.replace((x.querySelector(".lno") || {}).textContent, "") : x.textContent })));
        await c.close();
      }
      return seen;
    })();
    ["a", "b"].forEach((k) => {
      if (!nums[k].length) bad.push(k + " 기기에 몫이 안 뜬다");
      else if (!nums[k][0].n) bad.push(k + " 기기 몫에 번호가 없다");
    });
    if (nums.a.length && nums.b.length) {
      if (nums.a[0].n === nums.b[0].n)
        bad.push("두 기기가 서로 다른 것을 보는데 번호가 같다: " + nums.a[0].n);
      if (nums.a[0].t === nums.b[0].t)
        bad.push("두 기기가 같은 몫을 본다: " + nums.a[0].t);
    }
    /* 대본 줄에도 번호가 있어야 한다. 그것도 원본 차례에서 나온다. */
    const scn = await (async () => {
      const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const q = await c.newPage();
      q.on("pageerror", (e) => bad.push("대본 번호 화면 오류: " + e.message));
      await q.goto(PAGE);
      await q.evaluate(() => {
        function iso(d){var z=new Date(d.getTime()-d.getTimezoneOffset()*60000);
          return z.toISOString().slice(0,10);}
        var now=new Date(), st=new Date(now.getTime()-138*86400000), days={};
        for(var i=0;i<138;i++){var x=new Date(st.getTime()+i*86400000);
          if(x.getDay()===0) continue;
          days[iso(x)]={status:"normal",h:2,speak:12,cards:30,lre:2,unres:[],coll:[]};}
        localStorage.setItem("eng2p.v1",JSON.stringify(
          {v:1,names:{a:"남편",b:"아내"},start:iso(st),days:days,
           media:{done:{},fav:{},last:null,pass:{}},wk:0,onboarded:true,session:null,
           device:"a",recOpen:false,emgOpen:false,card:null,cardDue:{},
           cardMode:"today",cues:{},rate:1,fs:0,wchk:{},q:{},rot:[],clips:[],scripts:{}}));
      });
      await q.goto(PAGE);
      await q.waitForTimeout(500);
      await q.evaluate(() => { T.run = true; gotoBlock(0); });
      for (let k = 0; k < 12; k++) {
        await q.waitForTimeout(300);
        const n = await q.evaluate(() => document.querySelectorAll(".scline").length);
        if (n) break;
      }
      const got = await q.evaluate(() => {
        const rows = [...document.querySelectorAll(".scline")];
        return { n: rows.length,
                 nos: rows.slice(0, 4).map((r) => (r.querySelector(".lno") || {}).textContent),
                 cue: rows.slice(0, 4).map((r) => r.dataset.cue) };
      });
      await q.evaluate(() => { T.run = false; clearInterval(T.tick); });
      await c.close();
      return got;
    })();
    if (!scn.n) bad.push("대본 줄이 안 뜬다");
    else {
      if (scn.nos.some((x) => !x)) bad.push("대본 줄에 번호가 없다: " + scn.nos.join(","));
      /* **번호가 원본 차례와 같아야 한다.** `data-cue` 가 원본 자리다. */
      scn.nos.forEach((x, i) => {
        if (String(+scn.cue[i] + 1) !== x)
          bad.push("대본 번호가 원본 차례와 다르다: " + x + " vs " + scn.cue[i]);
      });
    }

    /* 셋. 안 건너가는 것은 안 건너간다 */
    const wantLocal = ["a", 2, 3, 1.5, "Q1-007", "today"];
    mg.local.forEach((v, i) => {
      if (v !== wantLocal[i])
        bad.push("합치기가 안 건너가는 값을 건드렸다: " + v + " (" + wantLocal[i] + " 여야 한다)");
    });
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
              "돌아올 길 2폭 x 6판 = 12판 / 적는 칸 10판 / 회차별 대조 3회차 x 2 + 판정 2 = 8판 / " +
              "짝 코드 코덱 10판 / 짝 코드 화면 9판 / 합치기 22판 / 합치기 가장자리 16판");
  console.log("실패 " + fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
