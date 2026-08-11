/* 안 될 수 있는 자리 여덟 (T385). `docs/cando.md` 가 원본이다.

   이 앱은 망 없이 돌고 내려받아 여는 것이 정상 사용이다.
   그래서 브라우저가 안 주는 것이 여럿이다.

   T381 에 진동을 만들고 T384 에 화면 켜 두기 안내를 만들면서 알았다.

       안 되는 자리마다 안 된다고 적는 일을 턴마다 따로 했다.
       그런데 그 자리를 세어 본 적이 없다.

   자리마다 셋을 잰다. **안 된다 / 왜 / 그럼 무엇을.**
   셋째가 없으면 겁주기다 (`ahead.md`).

   돌리는 법:

       NODE_PATH=... CHROMIUM_PATH=... node scripts/check_cando.js
*/
const fs = require("fs");
const path = require("path");

const HERE = path.resolve(__dirname, "..");
const PAGE = "file://" + path.join(HERE, "..", "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

if (!fs.existsSync(CHROME)) {
  console.log("안 되는 자리 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { console.log("안 되는 자리 검사를 안 돌렸다. 통과가 아니다."); process.exit(0); }

/* 자리 여덟. `docs/cando.md` 3장이 같은 표다.
   why  왜 안 되는지가 그 글에 있는가 (낱말로 잡는다)
   then 그럼 무엇을 하는지가 있는가. 없으면 고장이 아니라는 말이라도 */
const SPOTS = [
  { id: "tts", what: "음성 합성", kind: "브라우저",
    why: ["브라우저"], then: ["크롬"] },
  { id: "voices", what: "영어 음성", kind: "기기 설정",
    why: ["기기 설정"], then: ["받아야 한다"] },
  { id: "rec", what: "녹음", kind: "여는 곳",
    why: ["파일에서 열었기 때문"], then: ["대신 기기 녹음기로"] },
  { id: "buzz", what: "진동", kind: "기기",
    why: ["이 기기"], then: ["앱이 고장 난 것이 아니다"] },
  { id: "wake", what: "화면 켜 두기", kind: "여는 곳",
    why: ["파일로 열면"], then: ["화면이 꺼지는 시간을 길게"] },
  { id: "plays", what: "판 화면", kind: "내려받기",
    why: ["plays.js"], then: ["규칙 카드와 종이로"] },
  { id: "late", what: "늦게 읽는 탭", kind: "내려받기",
    why: ["late.js"], then: ["나머지는 그대로 돈다"] },
  { id: "media", what: "미디어 소리", kind: "내려받기",
    why: ["자리를 확인한다"], then: ["통째로 내려받았는지"] },
];

const fails = [];
const no = (m) => fails.push(m);

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(PAGE);
  await page.evaluate(() => {
    localStorage.clear();
    S.onboarded = true; S.names.a = "가람"; S.names.b = "나래"; S.device = "a";
    saveNow();
  });
  await page.reload();
  await page.waitForTimeout(700);

  /* 자리마다 안 되는 꼴을 만들고 그때 나오는 글을 받아 적는다.
     **지어낸 글이 아니라 화면에 뜬 글이다.** */
  const got = {};

  /* 1. 음성 합성이 없다 / 2. 영어 음성이 하나도 없다 */
  Object.assign(got, await page.evaluate(async () => {
    const w = document.getElementById("ttsWarn");
    const was = TTS.ok, wasV = TTS.voices;
    TTS.ok = false; renderSound();
    const tts = w.innerText.replace(/\s+/g, " ");
    TTS.ok = true; TTS.voices = []; renderSound();
    const voices = w.innerText.replace(/\s+/g, " ");
    TTS.ok = was; TTS.voices = wasV; renderSound();
    return { tts: tts, voices: voices };
  }));

  /* 3. 녹음. **이 검사는 file:// 로 열려 있어 진짜로 안 되는 자리다** */
  got.rec = await page.evaluate(async () => {
    go("quarter");
    await new Promise((ok) => setTimeout(ok, 1200));
    const e = document.getElementById("voiceHow");
    return e ? e.innerText.replace(/\s+/g, " ") : "";
  });

  /* 4. 진동이 없다 */
  got.buzz = await page.evaluate(async () => {
    go("today");
    await new Promise((ok) => setTimeout(ok, 500));
    const real = navigator.vibrate;
    try { delete navigator.vibrate; } catch (e) {}
    try { delete Navigator.prototype.vibrate; } catch (e) {}
    paintBuzz();
    const t = (document.getElementById("tBuzzWhy") || {}).innerText || "";
    if (real) navigator.vibrate = real;
    return t.replace(/\s+/g, " ");
  });

  /* 5. 화면 켜 두기가 없다. **걸어 봐야 안다** */
  got.wake = await page.evaluate(async () => {
    document.getElementById("tOne").click();
    await new Promise((ok) => setTimeout(ok, 300));
    try { delete navigator.wakeLock; } catch (e) {}
    try { delete Navigator.prototype.wakeLock; } catch (e) {}
    reqWake();
    await new Promise((ok) => setTimeout(ok, 300));
    const t = document.getElementById("wakeWhy").innerText.replace(/\s+/g, " ");
    finishSession();
    return t;
  });

  /* 6. 판 묶음을 못 읽었다 / 7. 늦게 읽는 묶음을 못 읽었다.
     **글자를 읽어 잰다.** 묶음을 실제로 없애면 그다음 검사가 다 무너진다 */
  const src = (f) => fs.readFileSync(path.join(HERE, "app", "js", f), "utf8");
  /* **그 자리만 잘라서 본다.** 파일 전체를 훑으면 엉뚱한 자리의 같은 낱말이
     이 판을 통과시킨다. "규칙 카드와 종이로" 가 판 목록 안내에도 있었다. */
  const cut = (f, from) => {
    const t = src(f).replace(/\s+/g, " ");
    const i = t.indexOf(from);
    return i < 0 ? "" : t.slice(i, i + 400);
  };
  got.plays = cut("25_play.js", "판 화면을 못 읽었다");
  got.late = cut("04_today.js", "이 탭을 못 읽었다");
  got.media = cut("19_library.js", "소리를 못 불러왔다");

  /* ---- 자리마다 셋을 잰다 ------------------------------------------------ */
  SPOTS.forEach((s) => {
    const t = got[s.id];
    if (t === undefined || t === null) { no(s.what + ": 잴 글을 못 받았다"); return; }
    /* **안 된다고 말하는가.** 빈 글이면 아무 말도 안 한 것이다 */
    if (!String(t).trim()) { no(s.what + ": 안 되는데 아무 말도 안 한다"); return; }
    /* **왜 안 되는가** */
    if (!s.why.some((w) => t.indexOf(w) >= 0))
      no(s.what + ": 왜 안 되는지가 없다 (" + s.why.join(" / ") + "): " +
         String(t).slice(0, 60));
    /* **그럼 무엇을 하는가.** 없으면 겁주기다 */
    if (!s.then.some((w) => t.indexOf(w) >= 0))
      no(s.what + ": 대신 무엇을 하는지가 없다 (" + s.then.join(" / ") + "): " +
         String(t).slice(0, 60));
  });

  /* ---- 문서가 같은 표를 드는가 ------------------------------------------- */
  const doc = fs.readFileSync(path.join(HERE, "docs", "cando.md"), "utf8");
  /* **3장 표만 본다.** 4장에도 같은 이름의 표가 있어 거기가 통과시켰다 */
  const t3 = doc.split("### 3.1")[0];
  SPOTS.forEach((s) => {
    if (t3.indexOf("| " + s.what + " |") < 0)
      no("cando.md 3장에 " + s.what + " 줄이 없다");
    if (doc.indexOf(s.kind) < 0)
      no("cando.md 에 갈래 " + s.kind + " 가 없다");
  });
  /* **안 쓰기로 한 것과 못 하는 것은 다르다** */
  ["카메라", "fetch"].forEach((w) => {
    if (doc.indexOf(w) < 0) no("cando.md 3.2 에 뺀 자리 " + w + " 가 없다");
  });

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 진짜 기기에서 정말 그런가**");
  console.log("안 되는 자리 %d판 (자리 %d곳 x 3, 문서 %d, 뺀 자리 2, 오류 1) / 실패 %d",
              SPOTS.length * 3 + SPOTS.length * 2 + 3,
              SPOTS.length, SPOTS.length * 2, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
