/* 늦게 읽는 조각 여덟이 정말 그려지는가. T361
 *
 * T361 에 자료 탭과 규칙 탭을 늦게 읽는 쪽으로 옮기면서 알았다.
 * **자료 탭이 그려지는지를 아무도 안 재고 있었다.**
 * 탭을 열어 보는 검사는 있었지만 그 안이 채워졌는지는 안 봤다.
 *
 * 늦게 읽는 조각은 다른 조각과 다르게 틀린다.
 *
 *     탭 여는 자리에 `lateDo` 를 안 붙이면 탭이 빈 채로 열린다
 *     맨 위에서 그 함수를 부르면 아직 없는 함수를 부른다
 *     조각을 옮기고 부르는 자리를 안 옮기면 둘 다 일어난다
 *
 * **셋 다 파일은 멀쩡하고 화면만 빈다.** 그래서 코드를 읽는 검사로는 안 걸리고
 * 탭을 열어 봐야 걸린다. T347 에 적은 그대로다.
 *
 * ## 재는 것 여섯
 *
 *     표가 조각을 다 덮는가    late/ 조각 하나라도 표에 없으면 실패
 *     그 조각에 있는가         적어 둔 함수가 그 파일에 정말 있는가
 *     부르는 자리가 있는가     열자마자 읽는 코드가 `lateDo` 로 부르는가
 *     바로 안 부르는가         **맨 위에서 아무것도 하면 안 된다** (T313 뒤)
 *     열기 전엔 비었는가       늦게 읽는 것이 맞는가
 *     열면 채워지는가          **이것이 이 검사의 까닭이다**
 *
 * 사용법:
 *     node scripts/check_late.js
 *
 * 규격: docs/friction.md 8장, CLAUDE.md `app/late/`
 */
const path = require("path");
const fs = require("fs");

const HERE = path.resolve(__dirname, "..");
const ROOT = path.resolve(HERE, "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("늦게 읽는 조각 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

/* 늦게 읽는 자리마다 한 줄. **조각 하나에 두 자리일 수 있다** (자료 탭과 규칙 탭).
 *   piece 어느 조각인가
 *   tab   어느 탭을 열면 그려지는가
 *   fn    무엇이 그리는가
 *   sel   그 자리
 *   how   무엇으로 채워졌다고 보는가. kids = 자식 칸, value = 칸의 값
 */
const SPOT = [
  { piece: "12_verify.js", tab: "verify", fn: "renderVerify",
    sel: "#vLre", how: "kids", what: "판정 탭의 LRE 목록" },
  { piece: "13_quarter.js", tab: "quarter", fn: "renderQuarter",
    sel: "#qTabs", how: "kids", what: "분기 탭의 분기 단추" },
  { piece: "14_check.js", tab: "check", fn: "checkBind",
    sel: "#kKind", how: "value", what: "검사 탭의 종류 판정" },
  { piece: "15_rot.js", tab: "rot", fn: "renderRot",
    sel: "#rD", how: "kids", what: "회전 탭의 주제 목록" },
  /* **그리는 조각이 아니라 셈하는 조각도 있다** (T367).
     파형과 마디는 파일을 열어야 그려진다. 탭만 열어서는 그릴 것이 없다.
     그래서 이 갈래는 칸이 아니라 **함수가 오는지**를 잰다.
     늦게 읽는 것이 맞는지와 닿는지는 똑같이 재진다. */
  { piece: "18_clip.js", tab: "clip", fn: "beatSegs",
    sel: null, how: "fn", what: "클립 탭의 마디 뽑기" },
  { piece: "26_beatview.js", tab: "clip", fn: "renderMatch",
    sel: null, how: "fn", what: "클립 탭의 마디를 적는 자리" },
  { piece: "24_script.js", tab: "clip", fn: "renderScript",
    sel: "#scList", how: "kids", what: "클립 탭의 대본 자리" },
  { piece: "25_clips.js", tab: "clip", fn: "renderClip",
    sel: "#clipList", how: "kids", what: "클립 탭의 저장한 구간" },
  { piece: "21_weekcheck.js", tab: "ledger", fn: "renderWeekCheck",
    sel: "#weekCheck", how: "kids", what: "대장 탭의 주간 점검" },
  { piece: "22_track.js", tab: "ledger", fn: "renderTrack",
    sel: "#trackBox", how: "kids", what: "대장 탭의 트랙 진도" },
  { piece: "23_docs.js", tab: "src", fn: "renderSrc",
    sel: "#srcList", how: "kids", what: "자료 탭의 출처 목록" },
  { piece: "23_docs.js", tab: "rules", fn: "renderRules",
    sel: "#wall", how: "kids", what: "규칙 탭의 규칙 카드" },
];

const fails = [];
const no = (m) => fails.push(m);

/* ---- 글자로 읽는 검사 ---------------------------------------------------- */

/* `app/order.txt` 가 조각의 원본이다. **표가 아니라 그 파일이 정한다** */
const order = fs.readFileSync(path.join(HERE, "app", "order.txt"), "utf8");
const pieces = order.split("\n")
  .map((l) => (l.trim().split(/\s+/)[0] || ""))
  .filter((n) => n.indexOf("late/") === 0)
  .map((n) => n.slice(5));

pieces.forEach((p) => {
  if (!SPOT.some((s) => s.piece === p))
    no("조각 late/" + p + " 를 이 검사가 안 본다. 표에 줄을 넣어야 한다");
});
SPOT.forEach((s) => {
  if (pieces.indexOf(s.piece) < 0)
    no("표에 있는 late/" + s.piece + " 가 order.txt 에 없다");
});

/* 열자마자 읽는 코드. `app/late/` 와 `app/play/` 는 뺀다 */
const eager = [];
["js", "body"].forEach((d) => {
  const dir = path.join(HERE, "app", d);
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach((f) =>
    eager.push([d + "/" + f, fs.readFileSync(path.join(dir, f), "utf8")]));
});

SPOT.forEach((s) => {
  const file = path.join(HERE, "app", "late", s.piece);
  const src = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  if (src.indexOf("function " + s.fn + "(") < 0)
    no(s.what + ": " + s.fn + " 이 late/" + s.piece + " 에 없다");

  /* 부르는 자리가 있는가. **없으면 만들어 놓고 안 닿는 것이다** (T342).
     셈하는 조각은 스스로 안 불린다. **같은 탭의 그리는 조각이 묶음을 읽어 온다.**
     그 조각이 하나도 없으면 이 조각은 영영 안 읽힌다. */
  if (s.how === "fn") {
    if (!SPOT.some((x) => x.tab === s.tab && x.how !== "fn"))
      no(s.what + ": " + s.tab + " 탭에 묶음을 읽어 오는 조각이 없다");
  } else if (!eager.some(([, t]) => t.indexOf('lateDo("' + s.fn + '")') >= 0))
    no(s.what + ": 열자마자 읽는 코드에 lateDo(\"" + s.fn + "\") 가 없다");

  /* 바로 부르는 자리가 있으면 안 된다. **늦게 읽는 조각은 맨 위에서
     아무것도 하면 안 된다** (T313 뒤). 아직 없는 함수를 부르게 된다 */
  const call = new RegExp("(^|[^\\w.\"])" + s.fn + "\\s*\\(");
  eager.forEach(([n, t]) => {
    if (call.test(t)) no(s.what + ": " + n + " 이 " + s.fn + " 을 바로 부른다");
  });
});

/* ---- 화면으로 읽는 검사 -------------------------------------------------- */

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
  await page.waitForTimeout(700);

  /* 열자마자 늦게 읽는 묶음을 안 읽었는가. **읽었으면 늦게 읽는 것이 아니다** */
  const tags = await page.evaluate(() =>
    document.querySelectorAll('script[src*="late.js"]').length);
  if (tags) no("열자마자 late.js 를 " + tags + "개 읽었다");

  /* **탭을 하나도 열기 전에 다 잰다.** 하나를 열면 묶음이 읽히므로
     그 뒤에 재면 무엇이 언제 그려졌는지 못 가른다 */
  const before = await page.evaluate((T) => T.map((s) => {
    if (s.how === "fn") return typeof window[s.fn] === "function" ? 1 : 0;
    const e = document.querySelector(s.sel);
    if (!e) return null;
    return s.how === "value" ? (e.value || "").trim() : e.children.length;
  }), SPOT);
  SPOT.forEach((s, i) => {
    if (before[i] === null) { no(s.what + ": 자리(" + s.sel + ")가 화면에 없다"); return; }
    if (before[i]) no(s.what + (s.how === "fn"
      ? ": 탭을 열기 전에 이미 " + s.fn + " 이 있다. 늦게 읽는 것이 아니다"
      : ": 탭을 열기 전에 이미 그려져 있다. 늦게 읽는 것이 아니다"));
  });

  for (const s of SPOT) {
    const got = await page.evaluate(async (x) => {
      go(x.tab);
      await new Promise((ok) => setTimeout(ok, 900));
      if (x.how === "fn")
        return { n: typeof window[x.fn] === "function" ? 1 : 0, txt: x.fn };
      const e = document.querySelector(x.sel);
      if (!e) return null;
      return { n: x.how === "value" ? ((e.value || "").trim() ? 1 : 0)
                                    : e.children.length,
               txt: (e.innerText || "").replace(/\s+/g, " ").slice(0, 40) };
    }, s);
    if (!got) { no(s.what + ": 탭을 여니 자리가 없어졌다"); continue; }
    if (!got.n)
      no(s.what + ": " + s.tab + " 탭을 열었는데 " +
         (s.how === "fn" ? s.fn + " 이 안 왔다" : s.sel + " 이 비어 있다"));
  }

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 늦게 읽어서 두 사람이 기다린다고 느끼는가**");
  console.log("늦게 읽는 조각 %d판 (조각 %d개, 자리 %d곳 x 5, 묶음 1, 오류 1) / 실패 %d",
              pieces.length + SPOT.length * 5 + 2, pieces.length, SPOT.length,
              fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
