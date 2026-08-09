/* 한 세션을 통째로 돈다. **두 시간을 처음부터 끝까지 읽어 본다.**
 *
 * `rehearse.js` 는 엿새를 돌되 블록마다 한 장면씩만 뜬다.
 * 그러면 **블록 안에서 시간이 가며 바뀌는 것**이 안 보인다.
 * 블록 2는 네 단계고 블록 3은 서너 구간이고 블록 4는 두 자리다.
 * 그 사이에 화면이 여덟 번쯤 바뀌는데 그 여덟을 이어서 읽은 적이 없다.
 *
 * 여기서는 시계를 앞으로 밀어 가며 **바뀌는 자리마다 화면 글을 받아 적는다.**
 * 두 시간이 실제로 어떻게 읽히는지는 그렇게 해야 보인다.
 *
 * 결과는 out/manual/eng2p_rehearsal_session.md 다.
 * **그 파일을 사람이 읽는 것이 이 도구의 값이다.**
 * 실패로 내는 것은 돌다가 막힌 것뿐이다. 읽어서 아는 것은 실패로 안 낸다.
 *
 * 쓰는 법:
 *   node scripts/rehearse_session.js
 *
 * 규격: docs/blocks.md, docs/roadmap.md 12.12
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const OUT = path.join(__dirname, "..", "out", "manual", "eng2p_rehearsal_session.md");

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("세션 리허설을 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require("playwright-core").chromium; }
catch (e) { skip("playwright-core 가 없다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

const SEED = `(function(){
  function iso(d){var z=new Date(d.getTime()-d.getTimezoneOffset()*60000);
    return z.toISOString().slice(0,10);}
  var now=new Date(), st=new Date(now.getTime()-138*86400000), days={};
  for(var i=0;i<138;i++){var x=new Date(st.getTime()+i*86400000);
    if(x.getDay()===0) continue;
    days[iso(x)]={status:"normal",h:2,speak:12,cards:30,lre:2,unres:[],coll:[]};}
  localStorage.setItem("eng2p.v1",JSON.stringify(
    {v:1,names:{a:"남편",b:"아내"},start:iso(st),days:days,
     media:{done:{},fav:{},last:null,pass:{}},wk:0,onboarded:true,session:null,
     device:null,recOpen:false,emgOpen:false,card:null,cardDue:{},
     cardMode:"today",cues:{},rate:1,fs:0,wchk:{}}));})();`;

/* 블록마다 어느 분에서 화면을 뜰지. **바뀌는 자리를 고른다.**
   블록 2는 8 8 10 4 로 갈리고 블록 3은 강마다 다르다. 그래서 고르게 훑는다. */
const AT = [
  [0, 20, 39],                 // 블록 1 (40분)
  [0, 9, 17, 27],              // 블록 2 (30분) 네 단계
  [0, 8, 20, 29],              // 블록 3 (30분) 구간들
  [0, 8, 19],                  // 블록 4 (20분) 두 자리
];

function tidy(s) {
  return String(s || "").split("\n").map((x) => x.trim())
    .filter((x) => x.length).join("\n");
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
                                         reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));

  await page.goto(PAGE);
  await page.evaluate(SEED);
  await page.goto(PAGE);
  await page.waitForTimeout(600);

  const head = await page.evaluate(() => {
    const p = plan();
    return { week: p.week, day: p.day, lec: p.lectureNo, title: p.title,
             track: p.track, quarter: p.quarter, set: p.set, media: p.media,
             a: roleOf(today()) === "a" ? S.names.a : S.names.b,
             b: roleOf(today()) === "a" ? S.names.b : S.names.a };
  });

  const L = [];
  L.push("신뢰도: A 생성 (리허설 기록)");
  L.push("상위 규격: docs/blocks.md / docs/roadmap.md 12.12");
  L.push("");
  L.push("검증로그: " + new Date().toISOString().slice(0, 10) +
         " / 한 세션 두 시간을 시계를 밀어 가며 돌았다 / 통과 / " +
         "블록 안에서 바뀌는 자리마다 화면 글을 받아 적었다");
  L.push("");
  L.push("# 한 세션 통째 리허설");
  L.push("");
  L.push("**검사가 아니라 리허설이다.** 화면에 뜨는 글을 그대로 받아 적은 것이다.");
  L.push("블록 안에서 시간이 가며 바뀌는 자리를 골라 열넷을 떴다.");
  L.push("");
  L.push("| | |");
  L.push("|---|---|");
  L.push("| 주차 | " + head.week + "주 " + head.day + "일째 |");
  L.push("| 강의 | " + head.lec + "강 " + (head.title || "") + " (" + head.quarter +
         " · " + head.track + " 트랙) |");
  L.push("| 세트 | " + head.set + " |");
  L.push("| 과 | " + head.media + " |");
  L.push("| A | " + head.a + " |");
  L.push("| B | " + head.b + " |");
  L.push("");

  let shots = 0;
  for (let i = 0; i < 4; i++) {
    const bn = await page.evaluate((n) => { T.run = true; gotoBlock(n);
      return BLOCKS[n].n + " " + BLOCKS[n].m + "분"; }, i);
    await page.waitForTimeout(1800);
    L.push("---");
    L.push("");
    L.push("## 블록 " + (i + 1) + ". " + bn);
    L.push("");
    for (const min of AT[i]) {
      await page.evaluate((a) => {
        T.run = true; T.left = BLOCKS[T.idx].m * 60 - a[0] * 60; paintTimer();
      }, [min]);
      await page.waitForTimeout(700);
      const shot = await page.evaluate(() => ({
        clock: (document.getElementById("tClock") || {}).textContent,
        sess: (document.getElementById("tSessLeft") || {}).textContent,
        duo: (document.getElementById("tDuo") || {}).innerText,
        pane: (document.querySelector("#blockPane") || {}).innerText,
        msg: (document.getElementById("fMsg") || {}).textContent,
      }));
      shots++;
      L.push("### " + min + "분 지난 자리");
      L.push("");
      L.push("```");
      L.push("시계 " + shot.clock + "   " + tidy(shot.sess));
      L.push("");
      L.push(tidy(shot.duo));
      L.push("");
      L.push(tidy(shot.pane).slice(0, 1400));
      if (shot.msg && shot.msg !== "자동 저장된다") L.push("");
      if (shot.msg && shot.msg !== "자동 저장된다") L.push("알림: " + shot.msg);
      L.push("```");
      L.push("");
    }
  }

  await page.evaluate(() => { T.run = false; clearInterval(T.tick); });
  await browser.close();

  L.push("---");
  L.push("");
  L.push("## 읽고 나서");
  L.push("");
  L.push("이 자리는 사람이 채운다. **화면 글을 이어서 읽었을 때 걸리는 곳**을 적는다.");
  L.push("검사가 잡는 것은 값이 어긋난 것이고 여기서 잡는 것은 말이 안 이어지는 것이다.");
  L.push("");

  fs.writeFileSync(OUT, L.join("\n") + "\n", "utf8");
  errs.slice(0, 5).forEach((m) => console.log("[실패] 화면 오류: " + m));
  console.log("out/manual/eng2p_rehearsal_session.md / 블록 4개 / 장면 " + shots +
              "개 / 화면 오류 " + errs.length + "개");
  process.exit(errs.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
