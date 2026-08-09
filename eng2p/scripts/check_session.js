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
 *     블록 1   오늘 과, 이 주에 찾을 것, 적는 칸
 *     블록 2   네 단계, 1단계 목록이 B 화면에서 가려짐, 적는 칸
 *     블록 3   구간, 카드, 돈 카드 수와 발화 분 칸
 *     블록 4   맞춰 보는 법, 두 칸, 회차 단추
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
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("세션 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require("playwright-core").chromium; }
catch (e) { skip("playwright-core 가 없다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

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

    /* B 쪽이 되는 사람을 골라 넣는다. 화면 쪽은 날마다 뒤집힌다 (T216). */
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
         블록 1은 **자기 쪽 칸만** 뜬다. 그것이 그 자리의 장치다.
         기기 쪽은 날마다 뒤집히므로 어느 칸인지도 그때 정해진다 (T216). */
      const mySide = await page.evaluate(() => (deviceSide() || "a").toUpperCase());
      const need = [
        ["이 주에 찾을 것", "aim" + mySide],
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
      /* 블록 2는 B 화면에서 1단계 목록을 가려야 한다. 그 주 세트로 확인한다. */
      if (i === 1 && txt.indexOf("B 화면에 안 띄운다") < 0)
        fails.push(wk + "주 블록 2 가 B 화면에서 목록을 안 가린다");
    }
    await page.evaluate(() => { T.run = false; clearInterval(T.tick); });
  }

  await browser.close();
  errs.slice(0, 5).forEach((m) => fails.push("화면 오류: " + m));
  fails.slice(0, 20).forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("주 " + WEEKS.length + "개 x 블록 4 = " + panes + "판 (회차 셋을 돌려 본다) / 실패 " + fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
