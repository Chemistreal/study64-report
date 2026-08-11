/* 소리 자리의 화면 글을 훑는다 (T376).

   T375 가 소리를 다루는 **코드 자리**를 세었다. 이것은 그 자리의 **화면 글**을 본다.

   ## 같은 말이 다섯 자리에 다섯 문장으로 흩어져 있었다

   판정 안 한다는 말을 턴마다 그 자리에 적었다. 그런데 다 다른 문장이다.

       클립 탭        앱은 잘했는지 안 말한다
       되풀이 자리    그 마디가 틀렸다는 말이 아니다
       나란히 듣기    좋아졌는지는 앱이 안 말한다
       분기 탭 칸     판정은 상대가 한다
       분기 나란히    앱은 좋아졌는지를 안 말한다

   **문장을 하나로 합치지 않는다.** 자리마다 말할 것이 다르다.
   되풀이 자리는 짚는 것이 판정이 아니라는 말이고 통과 칸은 누가 판정하는지다.
   합치면 그 자리에 맞는 말을 잃는다 (T181 이 그 반대편이다. 다 붙이면 안 읽힌다).

   대신 **표로 세운다.** 자리가 하나 늘면 표에 줄이 없어 실패한다.
   `docs/sound.md` 10장이 같은 표다.

   ## 판정하는 말이 화면에 없는가

   `check_app.py` 가 코드 글자를 본다. 이것은 화면에 실제로 뜬 글을 본다.
   조건이 붙은 자리는 조건을 만들어야 뜨므로 코드만 읽어서는 못 잡는다.

   **부정 꼴은 걷어내고 본다.** "좋아졌는지는 안 말한다" 는 안 판정하는 말이다.
   넓게 잡으면 판정 금지 문장 자체가 걸린다. T337 에 한 번 걸렸다.

   돌리는 법:

       NODE_PATH=... CHROMIUM_PATH=... node scripts/check_sound_screen.js
*/
const fs = require("fs");
const path = require("path");

const HERE = path.resolve(__dirname, "..");
const PAGE = "file://" + path.join(HERE, "..", "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

if (!fs.existsSync(CHROME)) {
  console.log("소리 화면 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { console.log("소리 화면 검사를 안 돌렸다. 통과가 아니다."); process.exit(0); }

/* 판정 안 한다는 말이 뜨는 자리 다섯. **자리마다 말할 것이 다르다** */
const SAYS = [
  { sel: "#t-clip", say: "앱은 잘했는지 안 말한다",
    what: "클립 탭", cond: "none" },
  { sel: "#cPick", say: "틀렸다는 말이 아니다",
    what: "되풀이 자리", cond: "two" },
  { sel: "#cSide", say: "좋아졌는지는 앱이 안 말한다",
    what: "클립 탭 나란히 듣기", cond: "side" },
  { sel: "#qPass", say: "판정은 상대가 한다",
    what: "분기 탭 강세 박자 칸", cond: "quarter" },
  { sel: "#voiceCmp", say: "좋아졌는지를 안 말한다",
    what: "분기 탭 나란히 듣기", cond: "quarter" },
];

/* 소리가 나는 탭 넷. **글을 통째로 훑는다** */
const TABS = [
  { tab: "clip", what: "클립 탭" },
  { tab: "quarter", what: "분기 탭" },
  { tab: "media", what: "자료실" },
  { tab: "sound", what: "소리 탭" },
];

/* 소리를 두고 사람을 판정하는 말. **부정 꼴은 걷어내고 본다** */
const BAD = ["좋아졌다", "나아졌다", "늘었다", "잘한다", "잘했다",
             "정확하다", "정확도", "발음이 맞", "틀린 발음", "발음 점수"];
const NOT = /안 |못 |않|아니|없/;

const fails = [];
const no = (m) => fails.push(m);

/* 부정 꼴이 같이 든 줄은 뺀다. **판정 금지 문장 자체가 걸리기 때문이다** */
function judge(txt, where) {
  txt.split("\n").forEach((ln) => {
    if (NOT.test(ln)) return;
    BAD.forEach((w) => {
      if (ln.indexOf(w) >= 0)
        no(where + " 가 소리를 두고 판정한다: " + ln.trim().slice(0, 60));
    });
  });
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(PAGE);
  await page.evaluate(() => {
    S.onboarded = true; S.names.a = "가람"; S.names.b = "나래";
    /* 나란히 듣기가 뜨려면 적어 둔 것이 둘이어야 한다 (growth.md 6.3) */
    S.voice = {};
    saveNow();
  });
  await page.reload();
  await page.waitForTimeout(700);

  /* 분기 탭을 먼저 연다. 늦게 읽는 조각이 여기서 들어온다 */
  await page.evaluate(() => go("quarter"));
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    (DATA.voice.weeks || []).slice(0, 2).forEach((w, i) => {
      S.voice[voiceKey(w.week)] = { file: "eng2p_voice_" + voiceKey(w.week) +
        "_2026-0" + (i + 1) + "-05.webm", at: "2026-0" + (i + 1) + "-05" };
    });
    saveNow(); renderVoice(); renderVoiceCmp();
  });
  await page.waitForTimeout(400);

  /* 클립 탭의 조건을 만든다. **지어 넣은 파형이다. 음성 파일을 저장소에 안 넣는다** */
  await page.evaluate(async () => {
    go("clip");
    await new Promise((ok) => setTimeout(ok, 900));
    const mk = (lens) => {
      const p = [];
      lens.forEach((n) => {
        for (let j = 0; j < n; j++) p.push(0.6);
        for (let j = 0; j < 12; j++) p.push(0.01);
      });
      while (p.length < 320) p.push(0.01);
      return p.slice(0, 320);
    };
    const set = (name, lens) => {
      CLIP.file = { name: name }; CLIP.el = { duration: 6, currentTime: 0 };
      CLIP.peaks = mk(lens); CLIP.beat = null; CLIP.waveState = "ready";
      /* **파일을 열어야 뜨는 자리다.** 안 열면 그 안내가 화면에 없는 것이 맞다 */
      document.getElementById("clipCtl").hidden = false;
    };
    const files = voiceCmpList().map((x) => x.file);
    REF = null;
    set(files[0], [20, 20, 20]);
    paintRef(); waveInfo();
    document.getElementById("cRef").click();
    /* 가운데 마디만 늘어졌다. 그래야 되풀이 자리가 뜬다 */
    set(files[1], [20, 40, 20]);
    CLIP.a = null; CLIP.b = null;
    VOICE.side = 1;
    waveInfo();
  });
  await page.waitForTimeout(400);

  /* ---- 1. 말이 그 자리에 정말 떠 있는가 --------------------------------- */
  const got = await page.evaluate((T) => T.map((s) => {
    const e = document.querySelector(s.sel);
    if (!e) return null;
    return { hid: e.hidden, txt: e.innerText || "" };
  }), SAYS);
  SAYS.forEach((s, i) => {
    if (!got[i]) { no(s.what + ": 자리(" + s.sel + ")가 화면에 없다"); return; }
    if (got[i].hid) { no(s.what + ": 조건을 만들었는데 안 뜬다"); return; }
    if (got[i].txt.indexOf(s.say) < 0)
      no(s.what + ' 에 "' + s.say + '" 가 없다: ' +
         got[i].txt.replace(/\s+/g, " ").slice(0, 70));
  });

  /* ---- 2. 소리가 나는 탭에 판정하는 말이 없는가 ------------------------- */
  for (const t of TABS) {
    const txt = await page.evaluate(async (x) => {
      go(x);
      await new Promise((ok) => setTimeout(ok, 900));
      const e = document.getElementById("t-" + x);
      return e ? (e.innerText || "") : null;
    }, t.tab);
    if (txt === null) { no(t.what + " 탭이 없다"); continue; }
    judge(txt, t.what);
  }

  /* ---- 3. 소리를 쓰는 판 둘 --------------------------------------------- */
  for (const p of [["ladder", "renderLadderPlay"], ["relay", "renderRelay"]]) {
    const txt = await page.evaluate(async (id) => {
      go("play");
      await new Promise((ok) => setTimeout(ok, 600));
      PLAY.at = id; renderPlayTab();
      await new Promise((ok) => setTimeout(ok, 900));
      const e = document.getElementById("t-play");
      return e ? (e.innerText || "") : null;
    }, p[0]);
    if (txt === null) { no("판 " + p[0] + " 자리가 없다"); continue; }
    judge(txt, "판 " + p[0]);
  }

  /* ---- 4. 문서가 같은 표를 드는가 --------------------------------------- */
  const doc = fs.readFileSync(path.join(HERE, "docs", "sound.md"), "utf8");
  SAYS.forEach((s) => {
    if (doc.indexOf(s.say) < 0)
      no("sound.md 10장에 " + s.what + ' 의 말("' + s.say + '")이 없다');
  });

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 다섯 문장을 읽고 같은 말인 줄 알았는가**");
  console.log("소리 화면 %d판 (말 %d자리 x 2, 탭 %d, 판 2, 문서 %d, 오류 1) / 실패 %d",
              SAYS.length * 2 + TABS.length + 2 + SAYS.length + 1,
              SAYS.length, TABS.length, SAYS.length, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
