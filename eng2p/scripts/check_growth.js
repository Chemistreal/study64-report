/* 되돌아보기 녹음. **앱이 소리를 안 들고 있는다.** T333~T334
 *
 * `docs/growth.md` 가 규격이다. 재는 것이 셋이다.
 *
 *     앱이 소리를 안 든다        저장소에도 브라우저에도 1년치를 안 맡긴다
 *     못 하는 것을 말한다        `file://` 에서 마이크가 막힌다
 *     제 것을 제 것과 견준다     서로 견주면 그것이 순위다
 *
 * **이 검사는 `file://` 로 연다.** 두 사람이 내려받아 여는 것이 정상이고
 * 그때 녹음이 막히는 자리를 재는 것이 이 검사의 첫 일이다.
 *
 * 사용법:
 *     node scripts/check_growth.js
 *
 * 규격: docs/growth.md
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("되돌아보기 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(PAGE);
  await page.evaluate(() => {
    S.onboarded = true; S.names.a = "가람"; S.names.b = "나래";
    S.voice = {}; saveNow();
  });
  await page.reload();
  await page.waitForTimeout(400);
  await page.evaluate(() => go("quarter"));
  await page.waitForTimeout(1000);

  const fails = [];
  const no = (m) => fails.push(m);

  /* ---- 1. 읽을 줄이 대본 그대로인가 ------------------------------------- */
  const spec = await page.evaluate(async () => {
    const d = DATA.voice;
    if (!DATA.transcripts) {
      await new Promise((ok) => loadData("transcripts", "ENG2P_TRANSCRIPTS", ok));
    }
    const strip = (x) => String(x).replace(/^[A-Z][A-Za-z .'-]{0,20}:\s*/, "").trim();
    const ls = (DATA.transcripts.items[d.at.mid] || []).map(strip);
    return { line: d.at.line, inScript: ls.indexOf(d.at.line) >= 0,
             words: d.at.words, lo: d.minWords, hi: d.maxWords,
             weeks: d.weeks.map((w) => w.week), keeps: d.keepsAudio,
             grade: d.grade };
  });
  if (!spec.inScript)
    no("읽을 줄이 대본에 없다. A등급은 대본 그대로라는 뜻이다: " + spec.line);
  if (spec.words < spec.lo || spec.words > spec.hi)
    no("읽을 줄이 " + spec.words + "낱말이다. " + spec.lo + "~" + spec.hi + " 여야 한다");
  if (spec.grade !== "A") no("읽을 줄 등급이 " + spec.grade + " 다");
  if (spec.weeks.join() !== "1,12,24,36,48")
    no("읽는 때가 " + spec.weeks.join(" ") + " 다. 1과 분기 끝 넷이어야 한다");
  /* **앱이 소리를 안 든다.** 자료가 그렇게 적혀 있어야 한다 */
  if (spec.keeps !== false) no("앱이 소리를 든다고 적혀 있다");

  /* ---- 2. 저장소에 소리가 안 들어가는가 --------------------------------- */
  /* **적는 단추를 눌러서 적는다.** 처음에는 `S.voice` 를 검사가 직접 채웠다.
     그러면 적는 길을 한 번도 안 지나서 "소리를 저장소에 넣는다" 는 깸이 안 잡혔다.
     T323 과 T324 에서 겪은 그 자리다. **검사가 그 길을 지나야 그 길을 잰다.**
     묻는 창은 브라우저가 띄우므로 그것만 가로챈다. */
  await page.evaluate(() => {
    window.prompt = function (q, def) { return def; };
    S.voice = {}; saveNow(); renderVoice();
  });
  await page.click("[data-vadd]");
  await page.waitForTimeout(300);
  const store = await page.evaluate(() => {
    const k = Object.keys(S.voice)[0];
    const raw = localStorage.getItem("eng2p.v1") || "";
    return { keys: k ? Object.keys(S.voice[k]).sort() : [],
             /* 소리를 넣었으면 base64 나 blob 이 남는다 */
             blob: /data:audio|base64,|blob:/.test(raw) };
  });
  if (!store.keys.length) no("적는 단추를 눌렀는데 안 적혔다");
  if (store.keys.join() !== "at,file")
    no("녹음 기록에 파일 이름과 날 말고 다른 것이 있다: " + store.keys.join(" "));
  if (store.blob) no("저장소에 소리가 들어갔다");

  /* ---- 3. 못 하는 것을 말하는가. **이 검사는 file:// 로 열었다** --------- */
  const how = await page.evaluate(() => ({
    can: voiceCan(), proto: location.protocol,
    txt: document.getElementById("voiceHow").innerText,
    btn: !!document.getElementById("voiceGo"),
  }));
  if (how.proto !== "file:") no("이 검사가 file:// 로 안 열렸다: " + how.proto);
  if (how.can) no("file:// 인데 녹음이 된다고 한다");
  if (how.btn) no("녹음이 안 되는데 녹음 단추가 있다");
  if (!/여기서는 녹음이 안 된다/.test(how.txt))
    no("안 된다는 말이 없다: " + how.txt.slice(0, 50));
  if (!/파일에서 열었기 때문/.test(how.txt)) no("왜 안 되는지가 없다");
  if (!/앱이 고장 난 것이 아니다/.test(how.txt))
    no("앱이 고장 난 것이 아니라는 말이 없다. 단추가 없으면 고장으로 읽는다");
  if (!/대신 기기 녹음기로 녹음한다/.test(how.txt))
    no("대신 무엇을 하라는 말이 없다");
  if (!/eng2p_voice_w\d\d_/.test(how.txt))
    no("파일 이름을 앱이 안 정해 준다. 두 사람이 지으면 1년 뒤에 못 찾는다");

  /* ---- 4. 대장. 다섯 자리와 적기와 지우기 -------------------------------- */
  const list = await page.evaluate(() => ({
    cnt: document.getElementById("voiceCount").textContent,
    txt: document.getElementById("voiceList").innerText,
    add: document.querySelectorAll("[data-vadd]").length,
    del: document.querySelectorAll("[data-vdel]").length,
  }));
  if (!/^1 \/ 5/.test(list.cnt)) no("하나 적었는데 " + list.cnt + " 다");
  if (list.add !== 4 || list.del !== 1)
    no("적는 자리가 " + list.add + "개 지우는 자리가" + list.del + "개다");
  if (!/아직/.test(list.txt)) no("안 읽은 자리를 아직이라고 안 적는다");
  /* **못한 것을 세어 보이지 않는다** */
  if (/안 읽은 것이|빠뜨|밀렸/.test(list.txt))
    no("안 읽은 것을 세어 보인다: " + list.txt.slice(0, 60));

  /* ---- 5. 서로 견주지 않는다. **제 것을 제 것과** ------------------------ */
  const pane = await page.evaluate(() =>
    document.getElementById("t-quarter").innerText);
  if (!/제 것을 제 것과/.test(pane))
    no("제 것을 제 것과 견준다는 말이 없다");
  if (/가람.{0,12}나래|나래.{0,12}가람/.test(pane.split("되돌아보기")[1] || ""))
    no("되돌아보기 칸이 두 사람을 나란히 놓는다");
  /* **좋아졌다고 말하지 않는다** */
  if (/좋아졌|나아졌|잘한다/.test(pane.split("되돌아보기")[1] || ""))
    no("앱이 좋아졌다고 말한다. 들려주는 것이 전부다");

  /* ---- 6. 지운 것을 되돌릴 수 있는가 ------------------------------------- */
  await page.click("[data-vdel]");
  await page.waitForTimeout(250);
  if (!(await page.isVisible(".undo"))) no("지운 뒤 되돌릴 자리가 없다");
  await page.click(".undo button");
  await page.waitForTimeout(250);
  const back = await page.evaluate(() => Object.keys(S.voice || {}).length);
  if (back !== 1) no("되돌렸는데 적어 둔 것이 안 돌아왔다");

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 다섯 녹음을 나란히 들었을 때 무엇이 들리는가**");
  console.log("되돌아보기 20판 (읽을 줄 5, 저장소 2, 안 되는 자리 6, 대장 4, 견줌 3) / 실패 %d",
              fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
