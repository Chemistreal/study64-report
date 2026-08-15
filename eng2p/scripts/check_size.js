/* 글자를 키우고 화면을 바꿔도 안 무너지는가 (T394).
 *
 * 검사 스무 개가 다 **390px 한 폭에서만** 돈다. 세 개가 880 과 900 을 쓰는데
 * 그것도 한 자리씩이다. 그리고 앱이 내주는 **글자 크기 세 단을 아무도 안 쓴다.**
 *
 * `01_tokens.css` 가 그 세 단을 이렇게 적어 두었다.
 *
 *     마주 앉아 흘끗 보는 거리에서 읽혀야 한다.
 *     그 거리는 사람마다 다르고 나이가 들면 더 다르다. 1년을 쓰는 물건이다.
 *
 * 1년을 쓸 사람이 첫날 "더 크게" 를 누른다. 그러면 글자가 20% 커진다.
 * **그 상태를 아무도 안 본 적이 없다.** 넘치면 오른쪽이 잘리고 겹치면 못 읽는다.
 * 안 재는 자리에 값이 숨어 있다는 것을 이 세션에 여러 번 겪었다.
 *
 * 재는 것 셋.
 *
 *   1. 가로로 안 넘치는가. 넘치면 손가락으로 밀어야 읽는다
 *   2. 누를 자리가 서로 안 겹치는가. 겹치면 옆 것이 눌린다
 *   3. 누를 자리가 44px 아래로 안 줄었는가
 *
 * **기계가 안 보는 것: 그 크기가 그 거리에서 정말 읽히는가.**
 * 여기서 재는 것은 무너지지 않는가지 읽기 좋은가가 아니다.
 *
 * 사용법:
 *     node scripts/check_size.js
 *
 * 규격: docs/roadmap.md 12.10
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

/* 두 사람이 쓸 만한 자리들. **제일 좁은 것이 제일 잘 깨진다** */
const SIZES = [
  { w: 320, h: 568, what: "제일 좁은 손전화" },
  { w: 390, h: 844, what: "보통 손전화" },
  { w: 430, h: 932, what: "큰 손전화" },
  { w: 844, h: 390, what: "손전화 가로" },
  { w: 768, h: 1024, what: "판형 기기" },
  { w: 1280, h: 800, what: "노트북" },
];
/* 0 은 보통, 2 는 더 크게. **가운데는 양 끝이 되면 따라온다** */
const FS = [0, 2];
/* 날마다 여는 자리부터 본다. 열셋을 다 돌면 여섯 폭 x 두 크기 x 열셋이라 너무 길다 */
const TABS = ["today", "review", "ledger", "play", "sound", "clip"];

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("크기 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

const fails = [];
let n = 0;

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });

  for (const sz of SIZES) {
    for (const fsv of FS) {
      const ctx = await browser.newContext({ viewport: { width: sz.w, height: sz.h } });
      const page = await ctx.newPage();
      await page.goto(PAGE);
      await page.waitForTimeout(500);
      await page.evaluate((v) => {
        S.onboarded = true; S.names.a = "가람"; S.names.b = "나래"; S.device = "a";
        S.fs = v;
        const td = today();
        for (let i = 1; i <= 20; i++) {
          S.days[addDays(td, -i)] =
            { status: "normal", speak: 40 + i, cards: 7, lre: 2, unres: [] };
        }
        saveNow(); applyFs(); renderToday();
      }, fsv);
      await page.waitForTimeout(400);
      const where = sz.w + "x" + sz.h + " (" + sz.what + ") 글자" + (fsv ? "더 크게" : "보통");

      for (const t of TABS) {
        n += 3;
        await page.evaluate((name) => go(name), t);
        await page.waitForTimeout(t === "play" ? 800 : 400);
        const m = await page.evaluate((name) => {
          const cw = document.documentElement.clientWidth;
          const sec = document.getElementById("t-" + name);
          const over = [];
          /* **넘친 칸을 짚는다.** 안에서 스스로 미끄러지는 자리는 뺀다.
             `.scroll` 은 옆으로 미는 표라서 넘치는 것이 그 칸의 일이다. */
          sec.querySelectorAll("*").forEach((e) => {
            if (over.length >= 4) return;
            if (e.closest(".scroll")) return;
            const r = e.getBoundingClientRect();
            if (r.width > 0 && r.right > cw + 1)
              over.push((e.id ? "#" + e.id : e.tagName.toLowerCase()) +
                        "." + (e.className || "").toString().split(" ")[0] +
                        " 오른쪽 " + Math.round(r.right));
          });

          /* 누를 자리. **겹치면 옆 것이 눌린다** */
          const taps = [...sec.querySelectorAll("button,summary,a[href]")]
            .filter((e) => {
              if (e.offsetParent === null) return false;
              const d = e.closest("details");
              if (d && !d.open && e.tagName !== "SUMMARY") return false;
              const r = e.getBoundingClientRect();
              return r.width > 0 && r.height > 0;
            });
          const small = taps.filter((e) => e.getBoundingClientRect().height < 43.5)
            .map((e) => (e.id ? "#" + e.id : e.tagName.toLowerCase()) + "." +
                        (e.className || "").toString().split(" ")[0]);
          const hit = [];
          for (let i = 0; i < taps.length && hit.length < 3; i++) {
            const a = taps[i].getBoundingClientRect();
            for (let j = i + 1; j < taps.length; j++) {
              if (taps[i].contains(taps[j]) || taps[j].contains(taps[i])) continue;
              const b = taps[j].getBoundingClientRect();
              const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
              const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
              if (ox > 2 && oy > 2) {
                hit.push((taps[i].id || taps[i].textContent.trim().slice(0, 8)) + " ↔ " +
                         (taps[j].id || taps[j].textContent.trim().slice(0, 8)));
                break;
              }
            }
          }
          return { cw: cw, wide: document.documentElement.scrollWidth,
                   over: over, small: [...new Set(small)].slice(0, 4),
                   hit: hit, taps: taps.length };
        }, t);

        if (m.wide > m.cw + 1)
          fails.push(where + " " + t + ": 폭 " + m.cw + "px 인데 " + m.wide + "px 로 넘친다" +
                     (m.over.length ? " (" + m.over.join(" / ") + ")" : ""));
        else if (m.over.length)
          fails.push(where + " " + t + ": 넘친 칸 " + m.over.join(" / "));
        if (m.hit.length)
          fails.push(where + " " + t + ": 누를 자리가 겹친다 " + m.hit.join(" / "));
        if (m.small.length)
          fails.push(where + " " + t + ": 44px 아래로 줄어든 자리 " + m.small.join(" "));
      }
      await ctx.close();
    }
  }

  /* 글자 크기가 정말 붙는가. **`px` 로 적힌 자리는 이 설정을 안 따라온다.**
     `01_tokens.css` 가 그 말을 적어 두었다. 적어 둔 것과 그런 것은 다르다.

     한 판에서 `S.fs` 를 바꿔 가며 재면 안 된다. 그렇게 쟀더니 어떤 자리는
     옛 값이 남아서 **멀쩡한 자리가 안 큰 것으로 나왔다.**
     사람이 하는 대로 판을 새로 열고 한 번씩 잰다. */
  {
    const WATCH = ["#t-today h2", "h3", ".todaysheet .lec", ".lede",
                   "nav button", ".tag", "body"];
    n += WATCH.length + 1;
    const seen = {};
    for (const v of [0, 2]) {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await ctx.newPage();
      await page.goto(PAGE);
      await page.waitForTimeout(500);
      await page.evaluate((x) => {
        S.onboarded = true; S.device = "a"; S.fs = x; saveNow(); applyFs(); renderToday();
      }, v);
      await page.waitForTimeout(300);
      seen[v] = await page.evaluate((sel) => {
        const out = { root: parseFloat(getComputedStyle(document.documentElement).fontSize) };
        sel.forEach((q) => {
          const e = document.querySelector(q);
          out[q] = e ? parseFloat(getComputedStyle(e).fontSize) : null;
        });
        return out;
      }, WATCH);
      await ctx.close();
    }
    if (!(seen[2].root > seen[0].root))
      fails.push("더 크게로 바꿨는데 뿌리가 " + seen[0].root + "px 그대로다");
    const want = seen[2].root / seen[0].root;
    WATCH.forEach((q) => {
      const a = seen[0][q], b = seen[2][q];
      if (a == null || b == null) { fails.push(q + " 가 화면에 없다. 이 자리가 안 재졌다"); return; }
      /* **다 같이 커져야 한다.** 하나만 안 크면 그 자리가 `px` 로 박혀 있다 */
      if (b / a < want - 0.02)
        fails.push(q + " 가 " + a + "px 에서 " + b + "px 로 " + (b / a).toFixed(2) +
                   "배만 컸다. 다른 글은 " + want.toFixed(2) + "배다. px 로 박혀 있다");
    });
  }

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 그 크기가 그 거리에서 정말 읽히는가**");
  console.log("크기 %d판 (폭 %d개 x 글자 %d단 x 탭 %d개 x 3, 글자 붙음 8) / 실패 %d",
              n, SIZES.length, FS.length, TABS.length, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("[실패] 검사가 도중에 멈췄다: " + e.message);
  process.exit(1);
});
