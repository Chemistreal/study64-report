/* 키보드와 낭독기로 닿는가 (T392).
 *
 * 이 앱은 두 사람이 마주 앉아 두 시간을 쓴다. 손가락으로 누르는 것을 재는
 * 검사는 여럿 있었다 (`check_friction.js`, `check_reach.js`).
 * **손가락이 아닌 길로 오는 사람은 아무도 안 재고 있었다.**
 *
 * 잰 것 다섯.
 *
 *   1. 화면 열셋이 `role="tabpanel"` 이었는데 **그것을 가리키는 `role="tab"` 이
 *      어디에도 없었다.** 이동줄은 `<nav>` 에 `aria-current="page"` 를 쓰는
 *      길잡이다. 낭독기는 "탭 패널" 이라고 읽고 사용자는 좌우 화살표로
 *      옮기려 하는데 아무 일도 안 일어난다. 있는 대로 이름을 붙인다
 *   2. 화면을 바꿔도 **초점이 누른 단추에 남는다.** 눈으로 보는 사람은 바뀐
 *      것을 보지만 듣는 사람에게는 아무 일도 안 일어난 것과 같다
 *   3. 이동줄을 지나야 본문에 닿는다. 건너뛰는 길이 없었다
 *   4. 이름 없는 단추. 기호만 있는 단추는 낭독기가 읽을 것이 없다
 *   5. `aria-hidden` 안에 초점 받는 것이 있으면 **보이지도 않는데 초점만 간다**
 *
 * **기계가 안 보는 것: 진짜 낭독기가 그렇게 읽는가.**
 * 여기서 재는 것은 표시가 붙어 있는가지 읽히는 말이 자연스러운가가 아니다.
 *
 * 사용법:
 *     node scripts/check_a11y.js
 *
 * 규격: docs/roadmap.md 12.10
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const TABS = ["today", "review", "sound", "clip", "media", "play",
              "src", "ledger", "verify", "quarter", "check", "rot", "rules"];

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("접근성 검사를 안 돌렸다. 통과가 아니다.");
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
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(PAGE);
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    S.onboarded = true; S.names.a = "가람"; S.names.b = "나래"; S.device = "a";
    saveNow(); renderToday();
  });
  await page.waitForTimeout(300);

  /* 1. 구역마다 이름이 있는가. 그리고 **탭 목록 없는 탭 패널이 안 남았는가** */
  {
    const st = await page.evaluate((tabs) => {
      const out = { panels: 0, named: [], dangling: [], tab: 0, tablist: 0 };
      out.tab = document.querySelectorAll('[role="tab"]').length;
      out.tablist = document.querySelectorAll('[role="tablist"]').length;
      out.panels = document.querySelectorAll('[role="tabpanel"]').length;
      tabs.forEach((t) => {
        const s = document.getElementById("t-" + t);
        if (!s) { out.dangling.push(t + ": 구역이 없다"); return; }
        const by = s.getAttribute("aria-labelledby");
        if (!by) { out.dangling.push(t + ": 이름표가 없다"); return; }
        const h = document.getElementById(by);
        if (!h) { out.dangling.push(t + ": 이름표가 " + by + " 를 가리키는데 그 칸이 없다"); return; }
        const txt = (h.textContent || "").trim();
        if (!txt) { out.dangling.push(t + ": 이름표가 빈 칸이다"); return; }
        out.named.push(t + "=" + txt);
      });
      return out;
    }, TABS);
    n += TABS.length + 2;
    st.dangling.forEach((m) => fails.push("구역 이름: " + m));
    /* **탭 목록이 없으면 탭 패널도 없어야 한다.** 둘 중 하나만 있으면 거짓말이다 */
    if (st.panels && !st.tablist)
      fails.push("탭 목록 없이 탭 패널이 " + st.panels + "개 있다. 낭독기가 없는 탭을 찾는다");
    if (st.tab && !st.tablist)
      fails.push("탭 목록 없이 탭이 " + st.tab + "개 있다");
    if (st.named.length !== TABS.length)
      fails.push("이름이 붙은 구역이 " + st.named.length + "개다. " + TABS.length + "개여야 한다");
  }

  /* 2. **본문으로 건너뛰는 길이 첫 초점인가.** 그리고 그것이 정말 본문에 닿는가 */
  {
    n += 4;
    const st = await page.evaluate(() => {
      const a = document.querySelector("a.skip");
      if (!a) return { has: false };
      a.focus();
      const r = a.getBoundingClientRect();
      const href = a.getAttribute("href") || "";
      const target = href.indexOf("#") === 0 ? document.getElementById(href.slice(1)) : null;
      return { has: true, txt: (a.textContent || "").trim(),
               /* 초점을 받으면 화면 안으로 들어와야 한다 */
               top: Math.round(r.top), first: document.activeElement === a,
               target: !!target,
               /* 초점을 받을 수 있어야 그리로 보낸 뜻이 산다 */
               tabbable: target ? target.getAttribute("tabindex") : null };
    });
    if (!st.has) { fails.push("본문으로 건너뛰는 길이 없다"); }
    else {
      if (!st.first) fails.push("건너뛰기가 초점을 못 받는다");
      if (st.top < 0) fails.push("건너뛰기가 초점을 받았는데 화면 밖이다 (top " + st.top + ")");
      if (!st.target) fails.push("건너뛰기가 없는 자리를 가리킨다");
      if (st.tabbable === null)
        fails.push("건너뛴 자리가 초점을 못 받는다. 눌러도 초점이 안 옮겨진다");
    }
  }

  /* 3. **화면을 바꾸면 초점이 그 구역으로 가는가.** 안 가면 낭독기가 조용하다 */
  {
    const spots = ["review", "ledger", "play", "today"];
    n += spots.length;
    for (const t of spots) {
      const got = await page.evaluate(async (name) => {
        const b = document.querySelector('nav button[data-t="' + name + '"]');
        if (!b) return "이동줄에 단추가 없다";
        b.click();
        await new Promise((ok) => setTimeout(ok, 400));
        const a = document.activeElement;
        return a ? (a.id || a.tagName) : "없다";
      }, t);
      if (got !== "t-" + t)
        fails.push(t + " 로 옮겼는데 초점이 " + got + " 에 있다");
    }
  }

  /* 4. **이름 없는 단추가 없는가.** 기호만 있으면 낭독기가 읽을 것이 없다.
     탭을 다 열어 본다. 안 연 탭의 단추는 안 재진다. */
  {
    for (const t of TABS) {
      await page.evaluate((name) => go(name), t);
      await page.waitForTimeout(t === "check" || t === "quarter" ? 900 : 350);
    }
    await page.waitForTimeout(600);
    n += 1;
    const bad = await page.evaluate(() => {
      const out = [];
      const all = document.querySelectorAll("button,a[href],summary,[role=button]");
      for (let i = 0; i < all.length; i++) {
        const e = all[i];
        if (e.offsetParent === null && e.tagName !== "SUMMARY") continue;
        const name = ((e.textContent || "") + " " +
                      (e.getAttribute("aria-label") || "") + " " +
                      (e.getAttribute("title") || "")).replace(/\s+/g, " ").trim();
        if (!name) out.push(e.tagName.toLowerCase() + "#" + (e.id || "") +
                            "." + (e.className || "").split(" ")[0]);
      }
      return out;
    });
    if (bad.length) fails.push("이름 없는 단추 " + bad.length + "개: " + bad.slice(0, 6).join(" "));
  }

  /* 5. **안 보이는 자리에 초점이 가지 않는가.** `aria-hidden` 안이나
     `hidden` 인 구역 안에 초점 받는 것이 있으면 초점만 그리로 간다. */
  {
    n += 1;
    const st = await page.evaluate(() => {
      const foc = "a[href],button,input,select,textarea,summary,[tabindex]";
      let inAria = 0; const who = [];
      const all = document.querySelectorAll(foc);
      for (let i = 0; i < all.length; i++) {
        const e = all[i];
        if (e.getAttribute("tabindex") === "-1") continue;   /* 부러 뺀 것 */
        if (e.closest("[aria-hidden=true]")) {
          inAria++;
          if (who.length < 6) who.push(e.tagName.toLowerCase() + "#" + (e.id || ""));
        }
      }
      return { inAria: inAria, who: who };
    });
    /* `hidden` 인 구역 안은 **브라우저가 알아서 초점 차례에서 뺀다.**
       그래서 수를 세는 것으로는 아무것도 안 재진다. 열셋 중 열둘이 늘 hidden 이라
       677개가 나오는데 그 수는 잘못이 아니다. `aria-hidden` 만 잰다.
       이쪽은 브라우저가 안 빼 준다. **보이는데 낭독기에는 없는 자리**가 된다. */
    if (st.inAria)
      fails.push("aria-hidden 안에 초점 받는 것이 " + st.inAria + "개 있다: " + st.who.join(" "));
  }

  /* 6. **초점 테두리를 지운 자리가 없는가.** 키보드로 쓰는 사람은 그것만 본다.

     `element.focus()` 로 재면 안 된다. `:focus-visible` 은 **어떤 길로 초점이
     왔는가**를 본다. 코드로 옮긴 초점은 브라우저가 손가락으로 온 것으로 치기도
     해서 테두리가 안 그려지고, 그러면 멀쩡한 자리가 붉어진다.
     Tab 을 진짜로 눌러서 돈다. 그것이 이 검사가 재려는 길이다.

     그리고 **누른 그 순간에 잰다.** 기다렸다 재면 서서히 자라는 테두리도
     통과한다. 이 앱에서 실제로 그랬다. `transition:.18s` 가 값 하나라
     `all` 이었고 테두리 굵기가 0에서 3px 로 자랐다. 옮기는 사람은 그 사이
     자기가 어디 있는지 모른다. 그것은 테두리가 없는 것과 크게 다르지 않다. */
  {
    n += 1;
    await page.evaluate(() => go("today"));
    await page.waitForTimeout(300);
    await page.evaluate(() => document.body.focus());
    const gone = [];
    for (let i = 0; i < 24; i++) {
      await page.keyboard.press("Tab");
      const r = await page.evaluate(() => {
        const e = document.activeElement;
        if (!e || e === document.body) return null;
        const t = e.tagName.toLowerCase();
        if (["a", "button", "summary"].indexOf(t) < 0) return null;
        const c = getComputedStyle(e);
        const w = parseFloat(c.outlineWidth) || 0;
        const ring = (c.boxShadow && c.boxShadow !== "none");
        const seen = (c.outlineStyle !== "none" && w >= 1) || ring;
        return seen ? null : t + "#" + (e.id || "") + "." + (e.className || "").split(" ")[0];
      });
      if (r && gone.indexOf(r) < 0) gone.push(r);
    }
    if (gone.length)
      fails.push("Tab 으로 갔는데 테두리가 없는 자리 " + gone.length + "곳: " + gone.join(" "));
  }

  /* 7. **이동줄의 화면 열셋에 키보드로 다 닿는가.**
     운영 일곱은 접힌 메뉴 안에 있다. `<details>` 는 열어야 닿는다. */
  {
    n += TABS.length;
    const st = await page.evaluate((tabs) => {
      const more = document.getElementById("navMore");
      if (more) more.open = true;
      const out = [];
      tabs.forEach((t) => {
        const b = document.querySelector('nav button[data-t="' + t + '"]');
        if (!b) { out.push(t + ": 단추가 없다"); return; }
        if (b.disabled) { out.push(t + ": 눌리지 않는다"); return; }
        if (b.getAttribute("tabindex") === "-1") { out.push(t + ": 초점에서 빠졌다"); return; }
        if (b.offsetParent === null) out.push(t + ": 메뉴를 열어도 안 뜬다");
      });
      if (more) more.open = false;
      return out;
    }, TABS);
    st.forEach((m) => fails.push("이동줄: " + m));
  }

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 진짜 낭독기가 그렇게 읽는가**");
  console.log("접근성 %d판 (구역 이름 %d, 건너뛰기 4, 초점 옮김 4, 이름 없는 단추 1, " +
              "안 보이는 자리 1, 테두리 1, 이동줄 %d) / 실패 %d",
              n, TABS.length + 2, TABS.length, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => {
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("[실패] 검사가 도중에 멈췄다: " + e.message);
  process.exit(1);
});
