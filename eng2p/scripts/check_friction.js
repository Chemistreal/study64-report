/* 마찰 검사. 앱을 열고 무엇을 하기까지 몇 번 누르고 얼마나 긴지 잰다.
 *
 * **편의성은 고쳐 놓으면 다시 나빠진다.** 화면에 뭘 더할 때마다 한 번씩 나빠진다.
 * 그리고 나빠지는 것은 안 보인다. 누름이 하나 늘어도 화면은 멀쩡해 보인다.
 * T159 에 재 보고 알았다. 계획서에 "여러 번 누른다"고 적어 둔 자리가 이미 한 번이었고,
 * 매일 걸리는 자리는 계획에 아예 없었다. **재지 않으면 엉뚱한 데를 고친다.**
 *
 * 기준선은 이 파일에 안 적는다. `docs/friction.md` 7장 표에서 읽는다.
 * **문서와 검사가 같은 값을 봐야 한다.** 두 자리에 적으면 언젠가 갈라지고
 * 그때 어느 쪽이 맞는지 알 수 없게 된다.
 *
 * 재는 상태는 실제 날짜에 안 매인다. 오늘에서 138일을 거슬러 시작일을 잡고
 * 일요일 빼고 다 수행한 것으로 채운다. **그래야 내일 돌려도 같은 값이 나온다.**
 *
 * 사용법:
 *     node scripts/check_friction.js
 *
 * 종료 코드 0이면 마찰이 기준선 안이다.
 * 규격: docs/roadmap.md 12.10, docs/friction.md
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const DOC = path.join(__dirname, "..", "docs", "friction.md");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("마찰 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}

let chromium;
try { chromium = require("playwright-core").chromium; }
catch (e) { skip("playwright-core 가 없다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);
if (!fs.existsSync(DOC)) { console.log("[실패] " + DOC + " 가 없다"); process.exit(1); }

/* 기준선을 문서에서 읽는다. 표의 칸은 이름과 값과 방향이다. */
function baselines() {
  const out = {};
  const txt = fs.readFileSync(DOC, "utf8");
  const body = txt.split("## 7.")[1];
  if (!body) { console.log("[실패] friction.md 에 7장이 없다"); process.exit(1); }
  body.split("\n").forEach((line) => {
    const m = line.match(/^\|\s*`([a-z0-9_]+)`\s*\|([^|]*)\|([^|]*)\|/);
    if (!m) return;
    const n = parseInt(m[2].replace(/[^0-9]/g, ""), 10);
    if (isNaN(n)) return;
    out[m[1]] = { v: n, up: m[3].indexOf("줄면") >= 0 };
  });
  return out;
}

/* 오늘에서 거슬러 채운 이력. 실제 날짜와 무관하게 같은 진도가 나온다. */
const SEED_DAYS = 138;
function seedScript() {
  return `(function(){
    function iso(d){var z=new Date(d.getTime()-d.getTimezoneOffset()*60000);
      return z.toISOString().slice(0,10);}
    var now=new Date(); var st=new Date(now.getTime()-${SEED_DAYS}*86400000);
    var days={};
    for(var i=0;i<${SEED_DAYS};i++){
      var x=new Date(st.getTime()+i*86400000);
      if(x.getDay()===0) continue;
      days[iso(x)]={status:"normal",h:2,speak:12,cards:30,lre:6};
    }
    localStorage.setItem("eng2p.v1",JSON.stringify(
      {v:1,names:{a:"남편",b:"아내"},start:iso(st),days:days,
       media:{done:{},fav:{},last:null,pass:{}},wk:0,onboarded:true,session:null,
       device:null,recOpen:false,emgOpen:false,card:null,cardDue:{},
       cardMode:"today",cues:{},rate:1}));
  })();`;
}

(async () => {
  const B = baselines();
  const need = ["tap_day2", "tap_resume", "tap_first", "today_px",
                "today_taps", "tabs_open", "today_reach"];
  const miss = need.filter((k) => !B[k]);
  if (miss.length) {
    console.log("[실패] friction.md 7장에 기준선이 없다: " + miss.join(" "));
    process.exit(1);
  }

  const browser = await chromium.launch({ executablePath: CHROME });
  const got = {};
  const fails = [];

  async function ctx(seeded) {
    const c = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = await c.newPage();
    await p.goto(PAGE);
    if (seeded) await p.evaluate(seedScript());
    else await p.evaluate(() => localStorage.clear());
    await p.goto(PAGE);
    await p.waitForTimeout(450);
    return { c, p };
  }

  /* 1. 이튿날. 저장된 것이 있고 오늘 세션은 아직 */
  {
    const { c, p } = await ctx(true);
    let taps = 0;
    await p.click("#tOne"); taps++;
    await p.waitForTimeout(250);
    const run = await p.evaluate(() => !!(window.T && T.run));
    if (!run) fails.push("이튿날: 한 번 눌러도 세션이 안 돈다");
    got.tap_day2 = taps;
    await c.close();
  }

  /* 2. 끊긴 데서 이어. 블록 2 중간에서 멈춘 상태 */
  {
    const c0 = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = await c0.newPage();
    await p.goto(PAGE);
    await p.evaluate(seedScript());
    await p.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("eng2p.v1"));
      const d = new Date(), z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      s.session = { date: z.toISOString().slice(0, 10), idx: 1, left: 900, run: false };
      localStorage.setItem("eng2p.v1", JSON.stringify(s));
    });
    await p.goto(PAGE);
    await p.waitForTimeout(450);
    let taps = 0;
    const go = await p.$("#resumeGo");
    if (!go) fails.push("끊긴 데서 이어: 이어서 하기 단추가 없다");
    else { await go.click(); taps++; }
    await p.waitForTimeout(250);
    const st = await p.evaluate(() => ({ run: !!(window.T && T.run), idx: window.T ? T.idx : -1 }));
    if (!st.run) fails.push("끊긴 데서 이어: 세션이 안 돈다");
    if (st.idx !== 1) fails.push("끊긴 데서 이어: 멈춘 블록이 아니라 " + (st.idx + 1) + "번으로 갔다");
    got.tap_resume = taps;
    await c0.close();
  }

  /* 3. 처음 여는 사람. 저장된 것이 없다. 입력칸은 안 세고 누름만 센다 */
  {
    const { c, p } = await ctx(false);
    let taps = 0;
    const ob = await p.isVisible("#onboard");
    if (!ob) fails.push("처음 여는 사람: 설정 칸이 안 뜬다");
    await p.fill("#obA", "남편");
    await p.fill("#obB", "아내");
    await p.click("#obGo"); taps++;
    await p.waitForTimeout(200);
    await p.click("#tOne"); taps++;
    await p.waitForTimeout(250);
    const run = await p.evaluate(() => !!(window.T && T.run));
    if (!run) fails.push("처음 여는 사람: 세션이 안 돈다");
    got.tap_first = taps;
    await c.close();
  }

  /* 4. 오늘 화면의 부피와 누를 것 */
  {
    const { c, p } = await ctx(true);
    const m = await p.evaluate(() => {
      const vis = (e) => e.offsetParent !== null;
      return {
        px: document.documentElement.scrollHeight,
        taps: [...document.querySelectorAll("button,summary,input,select,textarea,a")]
          .filter(vis).length,
        tabs: [...document.querySelectorAll("nav > button")].filter(vis).length,
      };
    });
    got.today_px = m.px;
    got.today_taps = m.taps;
    got.tabs_open = m.tabs;
    await c.close();
  }

  /* 5. 오늘 것 여섯 중 눌러서 닿는 것이 몇 개인가.
     **이 값만 방향이 반대다. 줄면 실패다.**
     오늘 칸 안에 그 항목으로 가는 누를 것이 있는지를 센다. */
  {
    const { c, p } = await ctx(true);
    const n = await p.evaluate(() => {
      const pl = plan();
      const sheet = document.querySelector("#todaySheet");
      const emg = document.querySelector("#emgLine, #emgBox");
      const hit = (host, re) => {
        if (!host) return false;
        return [...host.querySelectorAll("a,button,[role=button],[data-go]")]
          .some((e) => re.test((e.textContent || "") + " " + (e.getAttribute("data-go") || "")));
      };
      let k = 0;
      if (hit(sheet, new RegExp(pl.lectureNo + "강"))) k++;            // 강의
      if (hit(sheet, new RegExp(pl.set))) k++;                          // 세트
      if (pl.cards && hit(sheet, /카드|[0-9]{3}/)) k++;                 // 카드
      if (pl.media && hit(sheet, new RegExp(pl.media))) k++;            // 미디어
      if (hit(sheet, /과제/)) k++;                                      // 과제
      if (emg && emg.querySelector("button,summary,a")) k++;            // 비상판
      return k;
    });
    got.today_reach = n;
    await c.close();
  }

  await browser.close();

  const rows = [];
  need.forEach((k) => {
    const b = B[k], v = got[k];
    let bad = false, slack = 0;
    // 화소로 재는 것은 글꼴 그리기에 따라 조금 흔들린다. 백에 셋을 봐준다.
    if (k === "today_px") slack = Math.round(b.v * 0.03);
    if (b.up) bad = v < b.v;                 // 올라가야 하는 값
    else bad = v > b.v + slack;              // 늘면 안 되는 값
    rows.push({ k: k, v: v, b: b.v, up: b.up, bad: bad });
    if (bad) {
      fails.push(k + ": 기준선 " + b.v + " 인데 " + v + " 다" +
                 (b.up ? " (줄면 실패다)" : " (늘면 실패다)"));
    }
  });

  rows.forEach((r) => {
    console.log("  " + (r.bad ? "실패" : "OK  ") + " " + r.k.padEnd(13) +
                " 잰 값 " + String(r.v).padStart(6) +
                " / 기준선 " + String(r.b).padStart(6) +
                (r.up ? "  (올라가야 한다)" : ""));
  });
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("마찰 " + need.length + "줄 / 실패 " + fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
