/* 트랙별 진도 화면. **고르지 않은 것이 정상이라고 말하는가.** T344
 *
 * `docs/track.md` 가 규격이다. 재는 것이 넷이다.
 *
 *     진도가 맞는가        마친 세션 셋이 한 강이다
 *     0을 어떻게 적는가    `0 / 0` 을 안 적고 `이 분기에는 없다` 라고 적는다
 *     남은 것을 안 적는가  남은 것은 빚이고 빚은 벌이다. 다음 하나만 적는다
 *     사람을 안 가르는가   진도표가 순위표가 되면 안 된다
 *
 * 사용법:
 *     node scripts/check_track.js
 *
 * 규격: docs/track.md
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("트랙 진도 검사를 안 돌렸다. 통과가 아니다.");
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
    S.onboarded = true; S.names.a = "가람"; S.names.b = "나래"; saveNow();
  });
  await page.reload();
  await page.waitForTimeout(400);

  const fails = [];
  const no = (m) => fails.push(m);

  /* 마친 세션을 넣고 대장 탭을 연다. **주를 손으로 안 세운다** (T314) */
  const at = async (sessions) => {
    await page.evaluate((n) => {
      S.days = {}; let k = 0, c = 0;
      while (c < n) {
        const d = addDays(today(), -k);
        if (parseISO(d).getDay() !== 0) {
          S.days[d] = { status: "normal", speak: 0, cards: 0, lre: 0,
                        unres: [], coll: [] };
          c++;
        }
        k++;
      }
      S.start = addDays(today(), -k);
      saveNow(); go("ledger");
    }, sessions);
    /* **시간이 아니라 조건으로 기다린다.** 묶음이 커지면 700ms 로는 모자라고
       그때 덜 그려진 표를 읽어 엉뚱한 값이 나온다. T380 에 그 자리가 걸렸다.
       단독으로는 통과하고 전체를 돌릴 때만 틀렸다. */
    await page.waitForFunction(() => {
      const b = document.getElementById("trackBox");
      return b && b.querySelectorAll(".mgtab tr").length >= 7;
    }, null, { timeout: 15000 });
    return page.evaluate(() => ({
      txt: document.getElementById("trackBox").innerText,
      rows: [...document.querySelectorAll("#trackBox .mgtab tr")]
        .slice(1).map((r) => [...r.children].map((c) => c.innerText.trim())),
      done: trackDone(),
      q: plan().quarter,
    }));
  };

  /* ---- 1. Q1 을 마친 자리. **문법과 자동화가 0인 것이 맞다** ------------
     "이 분기" 는 **다음에 할 분기**다. 72세션을 마치면 13주 = Q2 에 들어선다.
     그래서 Q1 배정을 재려면 Q1 안(11주)에 서야 한다.

     전에는 72세션에서도 Q1 배정이 나왔다. **그것이 결함이었다.**
     Q2 차림표를 안 읽어 `plan().quarter` 가 비었고 진도표가 `||"Q1"` 로 받았다.
     T379 가 주간 점검에 needWeek 을 걸면서 드러났다. T380 */
  const mid = await at(11 * 6);         // 11주 x 6 = 66세션. Q1 한가운데다
  const midBy = {};
  mid.rows.forEach((r) => { midBy[r[0]] = r; });
  if (mid.q !== "Q1") no("66세션인데 이 분기가 " + mid.q + " 다. Q1 이어야 한다");
  ["문법", "자동화"].forEach((t) => {
    if (!midBy[t]) { no("Q1 안에서 " + t + " 줄이 없다"); return; }
    if (midBy[t][2].indexOf("이 분기에는 없다") < 0)
      no("Q1 안에서 " + t + " 의 이 분기 칸이 '" + midBy[t][2] + "' 다. 없다고 적어야 한다");
  });
  if (!midBy["소리"] || midBy["소리"][2].indexOf("15") < 0)
    no("Q1 안에서 소리의 이 분기 칸이 '" + (midBy["소리"] || [])[2] + "' 다. 15강이어야 한다");

  const q1 = await at(12 * 6);          // 12주 x 6 = 72세션 = 24강
  /* **72세션은 Q1 을 마치고 Q2 에 들어선 자리다.** 이 분기는 Q2 다 */
  if (q1.q !== "Q2") no("72세션인데 이 분기가 " + q1.q + " 다. Q2 여야 한다");
  if (q1.done !== 24) no("72세션을 마쳤는데 " + q1.done + "강이라고 한다. 스물넷이다");
  if (q1.rows.length !== 6) no("트랙이 " + q1.rows.length + "줄이다. 여섯이어야 한다");
  const by = {};
  q1.rows.forEach((r) => { by[r[0]] = r; });
  /* Q1 배정은 소리 15 청크 4 화용 2 repair 3 이다 (docs/track.md 2장) */
  if (!by["소리"] || by["소리"][1] !== "15 / 19")
    no("소리가 " + (by["소리"] || [])[1] + " 다. 15 / 19 여야 한다");
  if (!by["문법"] || by["문법"][1] !== "0 / 9")
    no("문법이 " + (by["문법"] || [])[1] + " 다. 0 / 9 여야 한다");
  /* **0 / 0 을 안 적는다.** 배정이 0인 트랙은 숫자를 안 보인다.
     0을 보이면 못 한 것으로 읽힌다. 어느 분기에 서든 이것은 같다 */
  Object.keys(by).forEach((t) => {
    if (/^0/.test(by[t][2]))
      no(t + " 의 이 분기 칸이 0으로 시작한다. 0을 보이면 못 한 것으로 읽힌다");
  });

  /* **다음 하나가 언제인지는 적는다.** 남은 양이 아니라 차림표다 */
  if (!by["문법"] || !/\d+주/.test(by["문법"][3]))
    no("문법의 다음 칸이 '" + (by["문법"] || [])[3] + "' 다. 몇 주인지를 적어야 한다");

  /* **진도표가 스스로 차림표를 읽는가** (T380).
     지금은 주간 점검이 먼저 읽어 주고 있어 진도표가 안 읽어도 값이 맞다.
     그것이 빠지면 다시 Q1 인 척한다. **혼자 세워 놓고 본다.** */
  const alone = await page.evaluate(async () => {
    IDX.weeks = [];
    renderTrack();
    const first = document.getElementById("trackBox").innerText;
    await new Promise((ok) => setTimeout(ok, 1200));
    return { first: first,
             after: document.getElementById("trackBox").innerText };
  });
  if (alone.first.indexOf("여는 중") < 0)
    no("차림표를 못 읽었는데 진도표가 곧바로 값을 보인다: " +
       alone.first.replace(/\s+/g, " ").slice(0, 60));
  if (alone.after.indexOf("이 분기") < 0)
    no("진도표가 스스로 차림표를 안 읽어 온다");

  /* ---- 2. 남은 것을 세어 보이지 않는가 ---------------------------------- */
  if (/남았|모자|더 해야|밀렸|못 한/.test(q1.txt))
    no("트랙 칸이 남은 것을 적는다: " + q1.txt.replace(/\s+/g, " ").slice(0, 70));
  /* **고르지 않은 것이 정상이라고 말하는가** */
  if (!/정상이다/.test(q1.txt))
    no("트랙마다 속도가 다른 것이 정상이라는 말이 없다");
  if (!/기준서 3.1/.test(q1.txt)) no("왜 다른지의 근거가 없다");
  /* **사람을 안 가른다** */
  if (q1.txt.indexOf("가람") >= 0 || q1.txt.indexOf("나래") >= 0)
    no("트랙 칸에 사람 이름이 있다");
  if (!/둘이 같이 지난 것이다/.test(q1.txt))
    no("둘이 같이 지난 것이라는 말이 없다. 없으면 사람별로 읽는다");

  /* ---- 3. 처음과 끝 ------------------------------------------------------ */
  const zero = await at(0);
  if (zero.done !== 0) no("한 세션도 안 했는데 " + zero.done + "강이라고 한다");
  const z = {};
  zero.rows.forEach((r) => { z[r[0]] = r; });
  if (!z["소리"] || z["소리"][1] !== "0 / 19")
    no("처음인데 소리가 " + (z["소리"] || [])[1] + " 다");
  if (!z["소리"] || z["소리"][3] !== "1주")
    no("처음인데 소리의 다음이 '" + (z["소리"] || [])[3] + "' 다. 1주여야 한다");

  const end = await at(288);
  if (end.done !== 96) no("288세션을 마쳤는데 " + end.done + "강이라고 한다");
  const e = {};
  end.rows.forEach((r) => { e[r[0]] = r; });
  Object.keys(e).forEach((t) => {
    if (e[t][3] !== "다 지났다")
      no(t + " 이 다 끝났는데 다음 칸이 '" + e[t][3] + "' 다");
  });
  if (!e["문법"] || e["문법"][1] !== "9 / 9")
    no("끝냈는데 문법이 " + (e["문법"] || [])[1] + " 다");

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 지난 것과 몸에 붙은 것이 같은가**");
  console.log("트랙 진도 29판 (Q1 안 4, Q1 마친 자리 12, 홀로 읽기 2, 남은 것 5, 처음과 끝 6) / 실패 %d",
              fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
