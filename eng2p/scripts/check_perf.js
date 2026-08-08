/* 여는 데 걸리는 것. **두 사람이 하루에 한 번은 이 화면을 연다.**
 *
 * 잣대를 둘로 나눈다.
 *
 *   처음에 읽는 바이트   기계와 상관없다. **여기에 선을 건다**
 *   여는 데 걸리는 시간   기계마다 다르다. 적어 두기만 한다
 *
 * 시간에 선을 걸면 그 선은 이 기계의 선이다. 다른 기계에서 돌리면 틀린 값이 된다.
 * 바이트는 안 그렇다. 그래서 게이트는 바이트가 맡는다.
 *
 * **필요할 때 읽기로 한 것이 정말 나중에 읽히는지도 본다.**
 * `out/data` 가 4.8MB 다. 그중 처음에 읽는 것은 차림표 하나여야 한다.
 * 강의 본문 786KB 나 카드 565KB 가 첫 그림에 끼면 그 자체로 실패다.
 *
 * 사용법:
 *     node scripts/check_perf.js
 *
 * 규격: docs/roadmap.md 12.10, docs/friction.md 8장
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const DOC = path.join(__dirname, "..", "docs", "friction.md");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("성능 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require("playwright-core").chromium; }
catch (e) { skip("playwright-core 가 없다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

/* 기준선을 문서에서 읽는다. friction.md 와 같은 규칙이다.
   **문서와 검사가 같은 값을 봐야 한다.** */
function baseline() {
  const txt = fs.readFileSync(DOC, "utf8");
  const body = txt.split("## 8.")[1];
  if (!body) { console.log("[실패] friction.md 에 8장이 없다"); process.exit(1); }
  const out = {};
  body.split("\n").forEach((line) => {
    const m = line.match(/^\|\s*`([a-z0-9_]+)`\s*\|([^|]*)\|/);
    if (!m) return;
    const n = parseInt(m[2].replace(/[^0-9]/g, ""), 10);
    if (!isNaN(n)) out[m[1]] = n;
  });
  return out;
}

const SEED = `(function(){
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
     cardMode:"today",cues:{},rate:1,fs:0}));})();`;

/* 처음에 읽는 것. `english.html` 이 문서 머리에 적어 둔 script 만 센다.
   나머지는 `loadData()` 가 눌렀을 때 붙인다. */
function eagerBytes() {
  const html = fs.readFileSync(path.join(ROOT, "english.html"), "utf8");
  const rows = [{ n: "english.html", b: Buffer.byteLength(html) }];
  const re = /<script src="([^"]+)"><\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    const f = path.join(ROOT, m[1]);
    if (!fs.existsSync(f)) { console.log("[실패] 처음에 읽는 것이 없다: " + m[1]); process.exit(1); }
    rows.push({ n: m[1], b: fs.statSync(f).size });
  }
  return rows;
}

(async () => {
  const B = baseline();
  const need = ["eager_kb", "eager_files"];
  const miss = need.filter((k) => B[k] === undefined);
  if (miss.length) {
    console.log("[실패] friction.md 8장에 기준선이 없다: " + miss.join(" "));
    process.exit(1);
  }

  const fails = [];
  const rows = eagerBytes();
  const kb = Math.round(rows.reduce((a, r) => a + r.b, 0) / 1024);
  if (rows.length > B.eager_files)
    fails.push("처음에 읽는 파일이 " + rows.length + "개다. 기준선 " + B.eager_files);
  if (kb > B.eager_kb)
    fails.push("처음에 읽는 것이 " + kb + "KB 다. 기준선 " + B.eager_kb + "KB");

  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
                                         reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await page.goto(PAGE);
  await page.evaluate(SEED);

  /* **필요할 때 읽는 것이 첫 그림에 끼면 안 된다.**
     붙는 script 를 세어 둔다. 열자마자 붙는 것이 있으면 그것은 늦게 읽는 것이 아니다. */
  await page.addInitScript(() => {
    window.__late = [];
    const add = Element.prototype.appendChild;
    Element.prototype.appendChild = function (n) {
      if (n && n.tagName === "SCRIPT" && n.src) window.__late.push(n.src.split("/").pop());
      return add.call(this, n);
    };
  });

  /* 느린 기기 흉내. 넷 배로 낮춘다. 시간은 적어 두기만 한다. */
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const got = [];
  for (let i = 0; i < 4; i++) {
    await page.goto(PAGE, { waitUntil: "load" });
    await page.waitForTimeout(160);
    got.push(await page.evaluate(() => {
      const t = performance.getEntriesByType("navigation")[0];
      return { load: Math.round(t.loadEventEnd), late: (window.__late || []).slice() };
    }));
  }
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  const runs = got.slice(1);
  const mid = runs.map((x) => x.load).sort((a, b) => a - b)[1];
  const late = runs[runs.length - 1].late;
  const heavy = ["lecturetext.js", "cards.js", "sets.js", "lectures.js", "handouts.js"];
  heavy.forEach((h) => {
    if (late.indexOf(h) >= 0)
      fails.push(h + " 가 첫 그림에 붙었다. 눌렀을 때 읽어야 한다");
  });

  await browser.close();

  /* node 의 console.log 는 자리 폭을 안 맞춰 준다. 손으로 맞춘다. */
  rows.forEach((r) => console.log("  처음에 " + r.n.padEnd(34) +
    String(Math.round(r.b / 1024)).padStart(5) + "KB"));
  console.log("  넷 배 느린 기기에서 여는 데 " + mid +
    "ms (선을 안 건다. 기계마다 다르다)");
  if (late.length) console.log("  열자마자 더 붙은 것: " + late.join(" "));
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("처음에 읽는 것 %d개 %dKB (기준선 %d개 %dKB) / 실패 %d",
    rows.length, kb, B.eager_files, B.eager_kb, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
