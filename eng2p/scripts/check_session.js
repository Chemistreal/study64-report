/* 세션 검사기. **블록 넷을 실제로 돌려 본다.**
 *
 * `check_ui.js` 는 자리마다 하나씩 본다. 오늘 것 한 날을 열고 그 칸을 읽는다.
 * 그러면 **그날 자료로 안 걸리는 것**이 안 보인다.
 * 세트에 4단계가 없는 주, 압박형이 하나도 없는 날, 과가 두 강에 걸린 주가 있다.
 *
 * 여기서는 48주를 훑는다. 주마다 하루를 골라 블록 넷을 다 돌고
 * **칸이 비었는지, 여는 중에서 안 넘어가는지, 빈 값이 찍혔는지**를 본다.
 *
 * 무엇을 보는가.
 *
 *     블록 1   오늘 과, 이 주에 찾을 것, 적는 칸 둘이 둘에게 다 뜸 (함께 듣기. 말해도 된다)
 *     블록 2   네 단계, 1단계 요소가 둘에게 다 뜸, 2단계는 A 먼저, 3단계는 B 먼저, 적는 칸
 *     블록 3   구간, 카드, 돈 카드 수와 발화 분 칸
 *     블록 4 맞춰 보는 법, 두 칸, 회차 단추
 *
 * 사용법:
 *     node scripts/check_session.js
 *
 * 규격: docs/blocks.md, docs/roadmap.md 12.12
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");

const H = require("./lib/browser_harness");
const { chromium, CHROME } = H.need("세션");

/* 어느 주 몇 일째로 갈지를 정해 시작일을 거꾸로 잡는다.
   **일요일은 건너뛴다.** 그래서 한 주가 엿새고 날 수를 그렇게 센다. */
const SEED = `(function(week, day){
  function iso(d){var z=new Date(d.getTime()-d.getTimezoneOffset()*60000);
    return z.toISOString().slice(0,10);}
  var need=(week-1)*6+(day-1);          // 오늘까지 지나온 수행일 수
  var now=new Date(), st=new Date(now.getTime()), cnt=0;
  while(cnt<need){ st=new Date(st.getTime()-86400000); if(st.getDay()!==0) cnt++; }
  while(st.getDay()===0) st=new Date(st.getTime()-86400000);
  var days={}, d=new Date(st.getTime());
  while(iso(d)<iso(now)){
    if(d.getDay()!==0) days[iso(d)]={status:"normal",h:2,speak:12,cards:30,lre:2,
                                     unres:[],coll:[]};
    d=new Date(d.getTime()+86400000);
  }
  localStorage.setItem("eng2p.v1",JSON.stringify(
    {v:1,names:{a:"남편",b:"아내"},start:iso(st),days:days,
     media:{done:{},fav:{},last:null,pass:{}},wk:0,onboarded:true,session:null,
     device:null,recOpen:false,emgOpen:false,card:null,cardDue:{},
     cardMode:"today",cues:{},rate:1,fs:0,wchk:{}}));
})`;

/* 칸에 있으면 안 되는 말. **"여는 중" 은 자료를 아직 못 읽었다는 뜻이다.**
   한 번 그리고 끝나는 자리가 아니라 읽고 다시 그리는 자리라 기다렸다 본다.
 *
 * **말을 짧게 잡으면 자료가 걸린다.** 처음에 "못 찾았다" 로 잡았더니
 * 13주 세트의 지시문("못 찾으면 못 찾았다고 적는다")이 걸렸다.
 * 앱이 내는 말 그대로를 잡는다. 자료가 쓰는 말과 앱이 쓰는 말이 겹치기 때문이다.
 */
const BAD = ["undefined", "여는 중이다", "NaN", "[object",
             "카탈로그에서 그 과를 못 찾았다", "자료를 못 읽었다",
             "차림표를 여는 중", "진행표를 여는 중"];

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
                                         reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const fails = [];
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));

  /* 48주를 다 도는 것이 제일 좋지만 매 세션 돌기에는 길다.
     **주마다 하루씩 여덟 주를 고른다.** 분기마다 둘이고 첫 주와 끝 주가 들어간다.

     전수는 따로 돈다. `ENG2P_ALL_WEEKS=1` 을 붙이면 48주를 다 본다.
     T229 에 한 번 돌려 그날 자료로만 걸리는 것을 찾는다. 그 뒤로는 필요할 때만. */
  const ALL = process.env.ENG2P_ALL_WEEKS === "1";
  const WEEKS = ALL ? Array.from({ length: 48 }, (_, i) => i + 1)
                    : [1, 7, 13, 19, 25, 31, 37, 48];
  let panes = 0;

  for (const wk of WEEKS) {
    const day = (wk % 6) + 1;                    // 주마다 다른 요일을 본다
    await page.goto(PAGE);
    await page.evaluate(`(${SEED})(${wk}, ${day})`);
    await page.goto(PAGE);
    await page.waitForTimeout(500);

    const got = await page.evaluate(() => ({ w: plan().week, d: plan().day,
                                             lec: plan().lectureNo }));
    if (got.w !== wk) { fails.push(wk + "주로 못 갔다. " + got.w + "주가 됐다"); continue; }

    /* B 쪽이 되는 사람을 골라 넣는다. 화면 쪽은 세션마다 뒤집힌다 (T216). */
    await page.evaluate(() => { S.device = roleOf(today()) === "a" ? "b" : "a"; save(); });
    /* **회차를 주마다 돌린다.** 안 그러면 늘 1회차만 본다.
       블록 4는 회차마다 다른 것을 묻는다 (T214). 1회차는 지점, 2회차는 덩어리,
       3회차는 요약이고 3회차에는 셈 칸이 없다.
       48주를 다 돌고도 실패가 0으로 나와서 **왜 안 걸렸나**를 물었다.
       그때 이 자리가 늘 같은 값이라는 것이 보였다. T229 */
    const rnd = wk % 3;                            // 0, 1, 2 를 돌린다
    await page.evaluate((r) => { lecRound()[plan().lectureNo] = r; save(); }, rnd);

    for (let i = 0; i < 4; i++) {
      await page.evaluate((n) => { T.run = true; gotoBlock(n); }, i);
      /* 자료를 읽고 다시 그리는 자리라 기다린다. 카드와 세트가 제일 크다. */
      let txt = "";
      for (let k = 0; k < 14; k++) {
        await page.waitForTimeout(300);
        txt = await page.evaluate(() =>
          (document.querySelector("#blockPane") || {}).innerText || "");
        if (txt && BAD.every((b) => txt.indexOf(b) < 0)) break;
      }
      panes++;
      if (!txt || txt.length < 40) {
        fails.push(wk + "주 블록 " + (i + 1) + " 칸이 비었다");
        continue;
      }
      BAD.forEach((b) => {
        if (txt.indexOf(b) >= 0)
          fails.push(wk + "주 블록 " + (i + 1) + " 에 '" + b + "' 가 남아 있다");
      });
      /* 블록마다 그 자리에만 있는 것을 하나씩 본다. **다 있는 것을 보면 안 걸린다.**
         블록 1은 **두 칸이 다** 뜬다 (개정문 20 22). 전에는 자기 쪽 칸만 떴다.
         기기 쪽은 세션마다 뒤집히므로 어느 쪽 칸이든 B 쪽이 되는 사람에게도 둘 다 떠야 한다 (T216). */
      const need = [
        ["이 주에 찾을 것", "aimA"],
        ["1단계", "setLre"],
        ["이 블록이 남기는 것", "drCards"],
        ["맞춰 보는 법", "aimA"],
      ][i];
      /* 블록 4는 회차마다 묻는 것이 다르다. 그 주 회차에 맞는 말이 있는지 본다. */
      if (i === 3) {
        const want = { 1: "표시한 지점", 2: "끊어 들은 덩어리", 3: "요약" }[rnd + 1];
        if (txt.indexOf(want) < 0)
          fails.push(wk + "주 블록 4 (" + (rnd + 1) + "회차) 에 '" + want + "' 이 없다");
        const cnt = await page.evaluate(() => !!document.getElementById("aimSame"));
        if (rnd + 1 === 3 && cnt) fails.push(wk + "주 블록 4 가 3회차인데 셈 칸이 있다");
        if (rnd + 1 !== 3 && !cnt) fails.push(wk + "주 블록 4 가 " + (rnd + 1) + "회차인데 셈 칸이 없다");
      }
      if (txt.indexOf(need[0]) < 0)
        fails.push(wk + "주 블록 " + (i + 1) + " 에 '" + need[0] + "' 이 없다");
      const has = await page.evaluate((id) => !!document.getElementById(id), need[1]);
      if (!has)
        fails.push(wk + "주 블록 " + (i + 1) + " 에 적는 칸(" + need[1] + ")이 없다");
      /* 블록 1 은 B 쪽이 되는 사람 화면에도 두 칸이 다 있다. 가린 정보를 두지 않는다. */
      if (i === 0) {
        const both = await page.evaluate(() =>
          !!document.getElementById("aimA") && !!document.getElementById("aimB"));
        if (!both) fails.push(wk + "주 블록 1 이 B 쪽 화면에 두 칸을 다 안 낸다");
        if (/상대 칸은 이 기기에 안 뜬다|각자 헤드폰|말을 걸지 않는다/.test(txt))
          fails.push(wk + "주 블록 1 에 옛 침묵 문장이 남았다");
      }
      /* 블록 2 는 B 쪽이 되는 사람 화면에도 1단계 요소가 다 뜬다. 그 주 세트로 확인한다.
         전에는 여기서 B 화면이 목록을 가리는지를 봤다. 개정문 22 가 그것을 없앴다. */
      if (i === 1) {
        const miss = await page.evaluate(() => {
          const st = (DATA.sets.items || []).filter((x) => x.id === plan().set)[0];
          const items = ((st && st.steps || [])[0] || {}).items || [];
          const t = document.querySelector("#blockPane").innerText;
          return { n: items.length, miss: items.filter((x) => t.indexOf(x) < 0).length };
        });
        if (!miss.n) fails.push(wk + "주 블록 2 세트에 1단계 요소가 없다");
        else if (miss.miss) fails.push(wk + "주 블록 2 에서 1단계 요소 " + miss.miss + "개가 B 쪽 화면에 안 뜬다");
        if (/안 띄운다|가려 뒀던/.test(txt))
          fails.push(wk + "주 블록 2 에 옛 가림 문장이 남았다");
      }
      /* **2단계와 3단계 첫마디가 누구인지를 적는가** (T350, 개정문 23).
         세트 48개가 "2단계는 A가 먼저 말하고 B가 잇는다. 3단계는 B가 먼저 말한다" 고
         적어 놨는데 그 말이 종이에만 있었다. 세션 중에 세트 파일을 펴는 사람은 없다.
         1단계 설명은 NPC 가 한다. 그래서 전의 "설명한 사람이 먼저 말하지 않는다" 는 없어졌다. */
      if (i === 1) {
        const say = await page.evaluate(() => {
          const p = document.querySelector("#blockPane");
          /* **머리를 본다.** 처음에 `3단계` 를 아무 데서나 찾았더니
             1단계 칸이 걸렸다. 거기 "빠진 것은 3단계에서 갈린다" 가 있다.
             같은 글자가 딴 칸의 설명에도 있다. 첫 줄로 가른다. */
          const st = [...p.querySelectorAll(".setstep")]
            .filter((e) => /^3단계 ·/.test(e.innerText.trim()))[0];
          return st ? st.innerText : "";
        });
        if (!say) fails.push(wk + "주 블록 2 에 3단계 칸이 없다");
        else {
          /* 조사가 받침을 따라 바뀐다. 이 와 가 를 둘 다 본다 */
          if (!/(이|가) 먼저 말한다/.test(say))
            fails.push(wk + "주 블록 2 3단계가 누가 먼저 말하는지를 안 적는다");
          if (/설명한 사람이 먼저 말하지 않는다/.test(say))
            fails.push(wk + "주 블록 2 3단계에 옛 이유(설명한 사람)가 남았다. 설명은 NPC 가 한다");
          if (!/먼저 말했으니 이번에는 바꾼다/.test(say))
            fails.push(wk + "주 블록 2 3단계가 왜 바꾸는지를 안 적는다");
          /* **2단계 첫마디였던 쪽이 아니어야 한다.** 그날 A가 2단계를 연다 */
          const who = await page.evaluate(() => ({
            b: jo(roleOf(today()) === "a" ? S.names.b : S.names.a, "이", "가"),
            a: jo(roleOf(today()) === "a" ? S.names.a : S.names.b, "이", "가") }));
          if (say.indexOf(who.b + " 먼저 말한다") < 0)
            fails.push(wk + "주 블록 2 3단계 첫마디가 B 쪽이 아니다");
          if (say.indexOf(who.a + " 먼저 말했으니") < 0)
            fails.push(wk + "주 블록 2 3단계가 2단계를 연 쪽을 A 로 안 적는다");
        }
        /* 2단계 칸이 A 가 먼저 말하고 B 가 잇는다고 적는가 */
        const say2 = await page.evaluate(() => {
          const p = document.querySelector("#blockPane");
          const st = [...p.querySelectorAll(".setstep")]
            .filter((e) => /^2단계 ·/.test(e.innerText.trim()))[0];
          return st ? st.innerText : "";
        });
        const who2 = await page.evaluate(() => ({
          a: jo(roleOf(today()) === "a" ? S.names.a : S.names.b, "이", "가"),
          b: jo(roleOf(today()) === "a" ? S.names.b : S.names.a, "이", "가") }));
        if (say2.indexOf("2단계는 " + who2.a + " 먼저 말하고 " + who2.b + " 잇는다") < 0)
          fails.push(wk + "주 블록 2 2단계가 A 먼저 B 이어서를 안 적는다");
      }
    }
    await page.evaluate(() => { T.run = false; clearInterval(T.tick); });
  }

  /* ---- 두 시간을 되짚는가 (T378) ---------------------------------------
     **끝난 자리가 곧바로 다음 일을 시키고 있었다.** 12.5.2 가 그것을 막는다.
     블록 넷은 고정값이라 저장소를 안 늘린다. 그것도 잰다. */
  const recap = await page.evaluate(() => {
    go("today");
    finishSession();
    const box = document.getElementById("doneRecap");
    const done = document.getElementById("sessionDone");
    return { hid: done.hidden, txt: box ? box.innerText : null,
             all: done.innerText,
             names: BLOCKS.map((b) => b.n), mins: BLOCKS.map((b) => b.m),
             total: TOTAL_MIN,
             store: JSON.stringify(S) };
  });
  if (recap.txt === null) fails.push("세션 끝 화면에 되짚는 자리가 없다");
  else {
    if (recap.hid) fails.push("세션을 끝냈는데 끝 화면이 안 뜬다");
    /* **블록 넷을 다 되짚는다.** 못 한 것을 세는 것이 아니라 한 것을 적는다 */
    recap.names.forEach((n, i) => {
      if (recap.txt.indexOf(n) < 0) fails.push("되짚기에 블록 " + (i + 1) + " (" + n + ") 이 없다");
      if (recap.txt.indexOf(recap.mins[i] + "분") < 0)
        fails.push("되짚기에 블록 " + (i + 1) + " 의 " + recap.mins[i] + "분이 없다");
    });
    if (recap.txt.indexOf(recap.total / 60 + "시간을 채웠다") < 0)
      fails.push("되짚기가 두 시간을 채웠다고 안 적는다: " + recap.txt.replace(/\s+/g, " ").slice(0, 60));
    if (!/\d+번째다/.test(recap.txt))
      fails.push("되짚기가 몇 번째인지를 안 적는다");
    /* **다그치지 않는다** (12.5.2). 못 한 것을 세거나 다음을 시키지 않는다 */
    if (/못 한|빠뜨|밀렸|서둘|해야 한다/.test(recap.txt))
      fails.push("되짚기가 다그친다: " + recap.txt.replace(/\s+/g, " ").slice(0, 60));
    /* **사람을 안 가른다** (quest.md 원칙) */
    if (/가람|나래|A가|B가/.test(recap.txt))
      fails.push("되짚기가 두 사람을 갈라 적는다");
    /* 기록 남기라는 말은 빼지 않고 뒤로 민다 */
    if (recap.all.indexOf("30초 안에") < 0)
      fails.push("끝 화면에서 기록 남기라는 말이 사라졌다");
    if (recap.all.indexOf("30초 안에") < recap.all.indexOf("시간을 채웠다"))
      fails.push("되짚기보다 시키는 말이 먼저 온다");
    /* **저장소를 안 늘린다.** 고정값을 되짚는 일이라 남길 것이 없다 */
    if (/recap|doneAt|blockLog/.test(recap.store))
      fails.push("되짚기가 저장소에 값을 남긴다");
  }
  /* 뜨는가 1, 블록 넷 x 2, 두 시간 1, 몇 번째 1, 다그침 1,
     사람 가름 1, 기록 말 1, 차례 1, 저장소 1 */
  panes += 16;

  await browser.close();
  errs.slice(0, 5).forEach((m) => fails.push("화면 오류: " + m));
  fails.slice(0, 20).forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("주 " + WEEKS.length + "개 x 블록 4 + 되짚기 16 = " + panes +
              "판 (회차 셋을 돌려 본다) / 실패 " + fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
