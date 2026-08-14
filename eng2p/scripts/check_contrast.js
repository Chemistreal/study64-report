/* 대비 검사. 화면의 글자가 바탕과 충분히 갈리는가.
 *
 * **색이 한 벌이 되고 나서야 이것을 할 수 있게 됐다.** T158 까지는 색 토큰이
 * 두 벌이었다. 밝은 판과 어두운 판을 따로 재야 했고 그래서 안 쟀다.
 * 한 벌이면 한 번에 끝난다. 다크모드를 없앤 이유 셋째가 이것이었다.
 *
 * 기준은 널리 쓰이는 접근성 기준을 따른다.
 *
 *   보통 글자   4.5 대 1
 *   큰 글자     3 대 1   (24px 이상, 또는 굵고 18.66px 이상)
 *
 * **처음 돌렸을 때 111곳이 걸렸다. 그리고 그것은 앱이 아니라 이 검사가 틀린 것이었다.**
 * 비율이 1.00 으로 나온 자리가 여럿이었는데 그것은 글자가 안 보인다는 뜻이다.
 * 그럴 리가 없다. 원인은 그라디언트였다.
 *
 *   .brand      글자 자체가 그라디언트다. color 는 transparent 다
 *   button.b    바탕이 그라디언트다. backgroundColor 는 투명이다
 *
 * `backgroundColor` 만 보면 둘 다 안 보인다. 그래서 그라디언트의 색 마디를
 * 다 뽑아 **제일 나쁜 짝**으로 잰다. 어느 마디에서도 선을 넘어야 통과다.
 *
 * 사용법:
 *     node scripts/check_contrast.js
 *
 * 규격: docs/roadmap.md 12.10, docs/friction.md
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("대비 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require("playwright-core").chromium; }
catch (e) { skip("playwright-core 가 없다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

/* **판 탭이 빠져 있었다** (T389). 판은 `out/app/plays.js` 로 늦게 읽으므로
   탭을 안 열면 DOM 에 아예 없다. 판 화면 스무 개의 색을 한 번도 안 쟀다.
   게다가 판은 블록 안에서 도니 **판 화면은 늘 짙은 판이다.** */
const TABS = ["today", "review", "sound", "clip", "media", "src",
              "ledger", "verify", "quarter", "check", "rot", "rules", "play"];

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
     cardMode:"today",cues:{},rate:1}));})();`;

/* 화면 안에서 도는 재기. 색 계산이 다 여기 있다. */
const MEASURE = function () {
  function nums(s) { return (s.match(/[-\d.]+/g) || []).map(Number); }
  function rgb(s) {
    const m = nums(s);
    return { r: m[0] || 0, g: m[1] || 0, b: m[2] || 0, a: m[3] === undefined ? 1 : m[3] };
  }
  /* 그라디언트 안의 색 마디를 다 뽑는다. 마디마다 따로 잰다. */
  function stops(bgImage) {
    if (!bgImage || bgImage === "none") return [];
    const out = [];
    const re = /rgba?\(([^)]+)\)/g;
    let m;
    while ((m = re.exec(bgImage))) {
      const v = m[1].split(/[,/]/).map((x) => parseFloat(x));
      out.push({ r: v[0], g: v[1], b: v[2], a: v[3] === undefined ? 1 : v[3] });
    }
    return out;
  }
  function over(fg, bg) {
    const a = fg.a;
    return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a),
             b: fg.b * a + bg.b * (1 - a), a: 1 };
  }
  function lin(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
  function lum(c) { return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b); }
  function ratio(a, b) {
    const L1 = lum(a), L2 = lum(b);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  }

  /* 이 자리의 바탕이 될 수 있는 색을 다 모은다. 그라디언트면 마디마다 하나씩. */
  function backgrounds(el) {
    let e = el;
    let acc = [];
    while (e) {
      const st = getComputedStyle(e);
      /* **글자로 오려 낸 바탕은 바탕이 아니다.** 그 그라디언트는 글자로 그려진다.
         이것을 안 가르면 글자 색과 바탕 색이 같아져 비율이 1.00 으로 나온다.
         111곳이 걸렸던 첫 판이 그것 때문이었다. */
      const clipsToText = (st.backgroundClip === "text" ||
                           st.webkitBackgroundClip === "text");
      const c = clipsToText ? { r: 0, g: 0, b: 0, a: 0 } : rgb(st.backgroundColor);
      const g = clipsToText ? [] : stops(st.backgroundImage);
      const here = g.length ? g : (c.a > 0 ? [c] : []);
      if (here.length) {
        if (!acc.length) acc = here.slice();
        else {
          const next = [];
          acc.forEach((a) => here.forEach((h) => next.push(a.a >= 0.999 ? a : over(a, h))));
          acc = next;
        }
        if (acc.every((x) => x.a >= 0.999)) return acc;
      }
      e = e.parentElement;
    }
    const white = { r: 255, g: 255, b: 255, a: 1 };
    return acc.length ? acc.map((x) => over(x, white)) : [white];
  }

  const out = [];
  document.querySelectorAll("*").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (el.offsetParent === null || r.width < 1 || r.height < 1) return;
    const txt = [...el.childNodes].filter((n) => n.nodeType === 3)
      .map((n) => n.nodeValue.trim()).join("").trim();
    if (txt.length < 2) return;

    const st = getComputedStyle(el);
    const px = parseFloat(st.fontSize);
    const bold = parseInt(st.fontWeight, 10) >= 700;
    const big = px >= 24 || (px >= 18.66 && bold);
    const bgs = backgrounds(el);

    /* 글자 색. 투명이면 글자 자체가 그라디언트다. 그때는 그 마디들이 글자 색이다. */
    let fgs;
    const fill = st.webkitTextFillColor || st.color;
    const fc = rgb(fill);
    if (fc.a === 0) {
      const g = stops(st.backgroundImage);
      fgs = g.length ? g : [rgb(st.color)];
    } else {
      fgs = [fc];
    }

    let worst = 99, wb = null;
    fgs.forEach((f) => bgs.forEach((b) => {
      const v = ratio(f.a >= 0.999 ? f : over(f, b), b);
      if (v < worst) { worst = v; wb = b; }
    }));

    out.push({
      t: txt.slice(0, 30), r: Math.round(worst * 100) / 100,
      px: Math.round(px * 10) / 10, need: big ? 3 : 4.5,
      cls: (el.className || "").toString().slice(0, 30), tag: el.tagName,
    });
  });
  return out;
};

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  /* **움직임을 끄고 잰다.** 안 끄면 전이 중간값을 잰다.
     탭을 옮긴 직후에는 글자 색이 흰색에서 회색으로 넘어가는 중이다.
     그 중간을 재면 흰 글자가 흰 바탕에 있는 것으로 나온다. 비율 1.00 이다.
     앱에 이미 움직임 줄이기 규칙이 있으니 그것을 켠다. 앱을 안 고치고 재는 조건만 바꾼다. */
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
                                         reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(PAGE);
  await page.evaluate(SEED);
  await page.goto(PAGE);
  await page.waitForTimeout(500);

  const all = [];
  for (const t of TABS) {
    await page.evaluate((x) => go(x), t);
    await page.waitForTimeout(t === "play" ? 900 : 320);
    const rows = await page.evaluate(MEASURE);
    rows.forEach((x) => { x.tab = t; all.push(x); });
  }
  /* 판 스물을 짙은 판에서 하나씩 연다. **거기가 색이 제일 안 보이던 자리다** */
  const plays = await page.evaluate(() => (window.PLAYS || []).map((p) => p.id));
  await page.evaluate(() => document.body.classList.add("session-focus"));
  for (const id of plays) {
    const ok = await page.evaluate(async (x) => {
      go("play");
      await new Promise((r) => setTimeout(r, 120));
      PLAY.at = x; renderPlayTab();
      await new Promise((r) => setTimeout(r, 500));
      return !!document.querySelector("#t-play");
    }, id);
    if (!ok) continue;
    const rows = await page.evaluate(MEASURE);
    rows.forEach((x) => { x.tab = "판:" + id; all.push(x); });
  }
  await page.evaluate(() => document.body.classList.remove("session-focus"));
  /* **세션이 돌 때의 화면은 따로 재야 한다.** 탭만 돌면 그 화면이 안 나온다.
     세션 중에 두 사람이 제일 오래 보는 자리인데 검사 밖에 있으면 안 된다. */
  await page.evaluate(() => go("today"));
  await page.click("#tOne");
  await page.waitForTimeout(400);
  const sess = await page.evaluate(MEASURE);
  sess.forEach((x) => { x.tab = "세션중"; all.push(x); });

  /* 블록마다 칸이 다르다. 넷을 다 본다. */
  for (let i = 1; i < 4; i++) {
    await page.evaluate((k) => gotoBlock(k), i);
    await page.waitForTimeout(350);
    const rows = await page.evaluate(MEASURE);
    rows.forEach((x) => { x.tab = "블록" + (i + 1); all.push(x); });
  }

  await browser.close();

  const bad = all.filter((x) => x.r < x.need);
  /* 같은 자리가 탭마다 나온다. 무엇을 고칠지가 중요하니 모양으로 묶는다. */
  const seen = new Map();
  bad.forEach((x) => {
    const k = x.tag + "." + x.cls + " " + x.r;
    if (!seen.has(k)) seen.set(k, x);
  });
  const uniq = [...seen.values()].sort((a, b) => a.r - b.r);

  uniq.forEach((x) => {
    console.log("[실패] %s / %s%s / %spx 기준 %s 인데 %s : %s",
      x.tab, x.tag, x.cls ? "." + x.cls : "", x.px, x.need, x.r, x.t);
  });
  console.log("");
  console.log("화면 %d개 (탭 %d, 세션 4) / 글자 자리 %d곳 / 선 아래 %d곳 (모양으로 묶어 %d가지)",
    TABS.length + 4, TABS.length, all.length, bad.length, uniq.length);
  process.exit(uniq.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
