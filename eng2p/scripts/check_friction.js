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
    /* **접은 것이 다시 펴지는가.** 시작 전에는 시계를 접는다(T166).
       접기만 하고 안 펴지면 세션을 못 돈다. 접는 쪽보다 펴는 쪽이 더 중요하다. */
    const shown = await p.evaluate(() => {
      const el = document.querySelector("#sessionCard .timer");
      return !!el && el.getBoundingClientRect().height > 100;
    });
    if (!shown) fails.push("세션을 시작했는데 시계가 안 펴진다");
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
    const shown2 = await p.evaluate(() => {
      const el = document.querySelector("#sessionCard .timer");
      return !!el && el.getBoundingClientRect().height > 100;
    });
    if (!shown2) fails.push("끊긴 데서 이어: 시계가 안 펴진다");
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

  /* 4b. **한 손으로 닿는가.** 손전화에서 제일 자주 누르는 것이 화면 위쪽에 있으면
     두 손으로 들어야 한다. 두 사람이 마주 앉아 한 손으로 들고 쓰는 물건이다.
     엄지가 닿는 자리를 아래 3분의 2로 잡는다. */
  {
    const { c, p } = await ctx(true);
    const m = await p.evaluate(() => {
      const vh = innerHeight, reach = vh / 3;
      const vis = (e) => {
        const r = e.getBoundingClientRect();
        return e.offsetParent !== null && r.width > 0 && r.height > 0 && r.top < vh && r.bottom > 0;
      };
      const tabs = [...document.querySelectorAll("nav > button, nav summary")].filter(vis);
      const high = tabs.filter((e) => {
        const r = e.getBoundingClientRect();
        return r.top + r.height / 2 < reach;
      });
      const small = [...document.querySelectorAll("button,summary,a[href]")].filter(vis)
        .filter((e) => { const r = e.getBoundingClientRect();
                         return r.height < 44 || r.width < 30; })
        .map((e) => (e.textContent || e.id || "").trim().slice(0, 14) +
                    " " + Math.round(e.getBoundingClientRect().width) +
                    "x" + Math.round(e.getBoundingClientRect().height));
      return { tabs: tabs.length, high: high.length, small: small };
    });
    if (m.tabs === 0) fails.push("한 손: 탭을 못 찾았다");
    if (m.high > 0) fails.push("한 손: 탭 " + m.high + "개가 엄지 밖에 있다");
    if (m.small.length) fails.push("한 손: 누를 자리가 작다 - " + m.small.slice(0, 4).join(", "));
    await c.close();
  }

  /* 4c. **아래 띠가 마지막 줄을 덮지 않는가.** 띄워 놓고 자리를 안 비우면
     제일 아래 단추가 띠 밑에 깔린다. 그 단추를 영영 못 누른다. */
  {
    const { c, p } = await ctx(true);
    const bad = await p.evaluate(() => {
      const nav = document.querySelector("nav");
      const st = getComputedStyle(nav);
      if (st.position !== "fixed") return null;   // 넓은 화면은 이 검사 대상이 아니다
      window.scrollTo(0, document.documentElement.scrollHeight);
      const nb = nav.getBoundingClientRect();
      const hit = [...document.querySelectorAll("button,a[href],input")]
        .filter((e) => e.offsetParent !== null && !nav.contains(e))
        .filter((e) => { const r = e.getBoundingClientRect();
                         return r.height > 0 && r.bottom > nb.top && r.top < innerHeight; })
        .map((e) => (e.textContent || e.id || "").trim().slice(0, 14));
      return hit;
    });
    if (bad && bad.length) fails.push("한 손: 아래 띠가 덮은 자리 - " + bad.slice(0, 4).join(", "));
    await c.close();
  }

  /* 4d. **주 단추 규격.** 한 화면에서 다음에 할 일을 가리키는 단추다.
     책상에 놓고 흘끗 보고 누른다. 그 거리에서 보이고 눌려야 한다.
     높이 48, 글자 14, 굵기 650. 탭 열둘을 다 본다.

     그리고 오늘 화면에서 **제일 큰 단추는 세션 시작이어야 한다.**
     눈이 큰 것을 먼저 본다. 다른 것이 더 크면 앉자마자 그것을 누른다. */
  {
    const { c, p } = await ctx(true);
    const TABS = ["today", "review", "sound", "clip", "media", "src",
                  "ledger", "verify", "quarter", "check", "rot", "rules"];
    const bad = [];
    for (const tab of TABS) {
      await p.evaluate((x) => go(x), tab);
      await p.waitForTimeout(260);
      const r = await p.evaluate(() => {
        const vis = (e) => { const r = e.getBoundingClientRect();
          return e.offsetParent !== null && r.width > 0 && r.height > 0; };
        const sec = document.querySelector("section:not([hidden])");
        if (!sec) return { small: [], top: null };
        const all = [...sec.querySelectorAll("button")].filter(vis);
        const prim = all.filter((e) => /(^|\s)(b|bigtap)(\s|$)/.test(e.className + ""));
        /* **재는 값과 견주는 값을 같은 자리에서 자른다.**
           화소는 소수로 나온다. 47.9999 를 48 이라고 적어 놓고 48 미만이라고
           실패로 내면 사람은 왜 실패인지 알 수가 없다. */
        const small = prim.filter((e) => {
          const s = getComputedStyle(e), r = e.getBoundingClientRect();
          return Math.round(r.height) < 48 || Math.round(parseFloat(s.fontSize)) < 13 ||
                 parseInt(s.fontWeight, 10) < 650;
        }).map((e) => { const s = getComputedStyle(e), r = e.getBoundingClientRect();
          return (e.textContent || "").trim().slice(0, 12) + " " +
                 Math.round(r.height) + "px " + s.fontSize + " " + s.fontWeight; });
        const top = all.slice().sort((a, b) => {
          const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
          return rb.width * rb.height - ra.width * ra.height; })[0];
        return { small: small, top: top ? (top.className + "") : null };
      });
      r.small.forEach((m) => bad.push(tab + " 주 단추가 규격 밖이다: " + m));
      if (tab === "today" && r.top !== null && r.top.indexOf("sessionstart") < 0)
        bad.push("오늘 화면에서 제일 큰 단추가 세션 시작이 아니다: " + r.top);
    }
    bad.forEach((m) => fails.push("주 단추: " + m));
    await c.close();
  }

  /* 4e. **글자 크기 세 단.** 마주 앉아 흘끗 보는 거리에서 읽혀야 한다.
     그 거리는 사람마다 다르고 나이가 들면 더 다르다. 1년을 쓰는 물건이다.

     보는 것은 셋이다. 크기가 정말 바뀌는가, 새로고침 뒤에도 남는가,
     그리고 **제일 큰 단에서 화면이 가로로 안 밀리는가.**
     마지막 것이 이 기능의 값을 정한다. 키웠는데 글이 잘리면 안 키운 것만 못하다.

     칸 안에서 삐져나오는 것은 안 센다. 미끄럼대 손잡이가 그렇다.
     **문서가 밀리는 것만 센다.** 그것이 사람이 겪는 일이다. */
  {
    const { c, p } = await ctx(true);
    const TABS2 = ["today", "review", "sound", "clip", "media", "src",
                   "ledger", "verify", "quarter", "check", "rot", "rules"];
    const bad = [];
    const seen = [];
    for (const v of [0, 1, 2]) {
      await p.evaluate((x) => { S.fs = x; saveNow(); applyFs(); }, v);
      await p.waitForTimeout(220);
      const root = await p.evaluate(() =>
        parseFloat(getComputedStyle(document.documentElement).fontSize));
      seen.push(root);
      for (const tab of TABS2) {
        await p.evaluate((x) => go(x), tab);
        await p.waitForTimeout(200);
        const o = await p.evaluate(() => ({
          doc: document.documentElement.scrollWidth, win: innerWidth,
        }));
        if (o.doc > o.win + 1)
          bad.push("단 " + v + " 에서 " + tab + " 이 가로로 밀린다 " + o.doc + "/" + o.win);
      }
    }
    if (!(seen[0] < seen[1] && seen[1] < seen[2]))
      bad.push("세 단이 다 다른 크기가 아니다: " + seen.join(" "));
    await p.reload();
    await p.waitForTimeout(420);
    const kept = await p.evaluate(() =>
      parseFloat(getComputedStyle(document.documentElement).fontSize));
    if (Math.abs(kept - seen[2]) > 0.1)
      bad.push("새로고침 뒤에 글자 크기가 안 남았다: " + kept);
    bad.forEach((m) => fails.push("글자 크기: " + m));
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
    // **여유 안에서 늘어난 것을 눈에 띄게 적는다.** 통과인데 안 같은 자리다.
    // T260 에 그 자리가 실제로 났다. `div` 를 `h1` 으로 바꾸면서 브라우저가 주는
    // 여백이 딸려 들어와 오늘 화면이 20px 자랐다. 백에 셋 안이라 "OK" 로 지나갔다.
    // `docs/friction.md` 가 T167 에 그 여유를 그렇게 쓰지 말라고 적어 뒀는데
    // **적어 둔 것을 지키는 것은 사람이 하고 사람은 OK 를 안 읽는다.**
    // 자를 못 조인다. 글꼴 흔들림에 걸려 헛실패가 난다. 대신 눈에 띄게 한다.
    const drift = !b.up && slack && v !== b.v && !bad;
    rows.push({ k: k, v: v, b: b.v, up: b.up, bad: bad, drift: drift });
    if (bad) {
      fails.push(k + ": 기준선 " + b.v + " 인데 " + v + " 다" +
                 (b.up ? " (줄면 실패다)" : " (늘면 실패다)"));
    }
  });

  rows.forEach((r) => {
    console.log("  " + (r.bad ? "실패" : "OK  ") + " " + r.k.padEnd(13) +
                " 잰 값 " + String(r.v).padStart(6) +
                " / 기준선 " + String(r.b).padStart(6) +
                (r.up ? "  (올라가야 한다)" : "") +
                (r.drift ? "  **여유 안에서 " + (r.v - r.b) +
                           " 늘었다. 여유는 늘어난 것을 숨기라고 둔 것이 아니다**" : ""));
  });
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("마찰 " + need.length + "줄 / 실패 " + fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
