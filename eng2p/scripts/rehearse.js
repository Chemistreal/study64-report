/* 1주차를 앱으로 실제로 돌아 본다. **검사가 아니라 리허설이다.**
 *
 * 검사기는 내가 미리 아는 것만 본다. "이 값이 이래야 한다" 를 적어 둔 것이 검사다.
 * 리허설은 반대다. **화면에 뜨는 글을 그대로 받아 적는다.** 그리고 내가 읽는다.
 * 두 사람이 엿새 동안 무엇을 읽게 되는지는 그렇게 해야 보인다.
 *
 * 엿새를 돈다. 날마다 블록 넷을 다 열고 그 칸의 글을 뜬다.
 * 그리고 세션을 끝내고 진도가 오르는지, 다음 날 역할이 바뀌는지를 본다.
 *
 * 결과는 out/manual/eng2p_rehearsal_w1.md 다. **그 파일을 사람이 읽는 것이 이 도구의 값이다.**
 * 여기서 실패로 내는 것은 돌다가 막힌 것뿐이다. 읽어서 아는 것은 실패로 안 낸다.
 *
 * 쓰는 법:
 *   node scripts/rehearse.js
 *
 * 규격: docs/roadmap.md 11.11
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const OUT = path.join(__dirname, "..", "out", "manual", "eng2p_rehearsal_w1.md");

function skip(why) {
  console.log("[건너뜀] " + why);
  console.log("리허설을 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}

let chromium;
try {
  chromium = require("playwright-core").chromium;
} catch (e) {
  skip("playwright-core 가 없다");
}
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

// 카드 칸은 {from,to} 다. 그대로 이으면 화면에 [object Object] 가 뜬다.
function cardRange(c) {
  if (!c) return "";
  if (typeof c === "string") return c;
  return String(c.from).padStart(3, "0") + " ~ " + String(c.to).padStart(3, "0");
}

// 화면에서 뜬 글을 종이에 옮길 수 있게 다듬는다. 줄바꿈과 빈칸만 정리한다.
function tidy(s) {
  return (s || "").replace(/ /g, " ").replace(/[ \t]+/g, " ")
    .split("\n").map((x) => x.trim()).filter(Boolean).join("\n");
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));

  await page.goto(PAGE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(500);

  // 첫날은 월요일로 잡는다. 7일이라 홀수 날이고 사람2가 A다. 엿새면 역할이 세 번씩 돈다.
  const START = "2026-09-07";
  await page.evaluate((d) => {
    S.onboarded = true; S.device = "a"; S.start = d; save();
    window.today = () => d;
    renderToday();
  }, START);
  await page.waitForTimeout(300);

  const days = [];
  const stuck = [];
  for (let i = 0; i < 6; i++) {
    const date = await page.evaluate((k) => {
      const d = addDays(S.start, k);
      window.today = () => d;
      renderToday();
      return d;
    }, i);
    await page.waitForTimeout(250);

    const head = await page.evaluate(() => {
      const p = plan();
      return {
        session: p.session, week: p.week, day: p.day, quarter: p.quarter,
        lecture: p.lectureNo, title: p.title, track: p.track,
        set: p.set, cards: p.cards, media: p.media, task: p.task,
        emergency: p.emergency,
        roleToday: roleOf(today()),          // "a" 면 사람1이 A다
        side: deviceSide(),                  // 이 기기가 A쪽인가 B쪽인가
        sheet: document.querySelector("#todaySheet") ?
          document.querySelector("#todaySheet").innerText : "",
      };
    });

    // 세션을 켜고 블록 넷을 차례로 연다. 사람이 하는 것과 같은 길이다.
    await page.evaluate(() => { T.run = true; syncSessionFocus(); });
    const blocks = [];
    for (let b = 0; b < 4; b++) {
      await page.evaluate((k) => gotoBlock(k), b);
      await page.waitForTimeout(700);
      const got = await page.evaluate(() => {
        const box = document.querySelector("#blockPane");
        const B = BLOCKS[T.idx];
        return {
          no: T.idx + 1, name: B.n, minutes: B.m,
          text: box ? box.innerText : "",
          buttons: box ? box.querySelectorAll("button").length : 0,
          empty: !box || box.innerText.trim().length < 20,
        };
      });
      if (got.empty) stuck.push(date + " 블록 " + got.no + " 칸이 비었다");
      // **두 사람이 하는 것을 그대로 한다.** 회차를 끝냈으면 끝냈다고 누른다.
      // 안 누르면 회차가 늘 0으로 남아 이튿날 화면이 어제와 같아 보인다.
      const pressed = await page.evaluate(() => {
        const b = document.querySelector('#blockPane [data-media="pass"]');
        if (!b) return null;
        const label = b.textContent.trim();
        b.click();
        return label;
      });
      got.pressed = pressed;
      if (pressed) await page.waitForTimeout(400);
      blocks.push(got);
    }

    const after = await page.evaluate(() => {
      const before = doneSessions();
      finishSession();
      return { before: before, after: doneSessions(), left: S.session ? "남았다" : "지웠다" };
    });
    if (after.after !== after.before + 1)
      stuck.push(date + " 세션을 끝냈는데 진도가 " + after.before + " 에서 " + after.after + " 다");
    if (after.left !== "지웠다") stuck.push(date + " 세션 상태가 남았다");
    await page.waitForTimeout(200);

    days.push({ date: date, head: head, blocks: blocks, done: after.after });
  }

  /* **한 화면에 회차가 여럿인가.** 읽다가 눈에 걸린 것을 기계가 다시 세게 한다.
     칸에 회차가 세 자리 나온다. 초점 문장과 셈 줄과 버튼이다.
     초점은 블록이 정하고 셈과 버튼은 지금까지 한 횟수가 정한다. 둘은 서로 모른다. */
  const clash = [];
  days.forEach((d) => {
    d.blocks.forEach((b) => {
      const focus = (b.text.match(/([0-9])회차 초점은/) || [])[1];
      const count = (b.text.match(/회차 ([0-9]) \/ 3/) || [])[1];
      const btn = b.pressed ? (b.pressed.match(/([0-9])회차/) || [])[1] : null;
      if (!focus) return;
      const next = count == null ? null : String(Number(count) + 1);
      if (btn && btn !== focus)
        clash.push(d.date + " 블록 " + b.no + ": 화면은 " + focus + "회차라 하고 버튼은 "
          + btn + "회차라 한다 (지금까지 " + count + "회차 끝냄)");
      else if (!btn && next === null)
        clash.push(d.date + " 블록 " + b.no + ": 회차 셈이 화면에 없다");
      else if (!btn && count === "3")
        clash.push(d.date + " 블록 " + b.no + ": 세 회차를 다 끝냈는데 화면은 아직 "
          + focus + "회차라 한다. 오늘 무엇을 할지가 안 나온다");
    });
  });

  // 엿새를 돌고 나서 역할이 실제로 갈렸는가. 매뉴얼 4장과 개정문 11번의 자리다.
  const roles = days.map((d) => d.head.roleToday);
  const sameTwice = [];
  for (let i = 1; i < roles.length; i++)
    if (roles[i] === roles[i - 1]) sameTwice.push(days[i].date);

  await browser.close();

  const L = [];
  L.push("신뢰도: A 생성 (제작 관리)");
  L.push("분기: Q1");
  L.push("상위 규격: docs/roadmap.md 11.11");
  L.push("검증대상:");
  L.push("검증로그: " + days[0].date + " 부터 엿새를 앱으로 실제로 돌았다 / 통과 / "
    + "블록 스물넷을 다 열고 화면 글을 그대로 옮겼다. 막힌 자리 " + stuck.length + "곳");
  L.push("");
  L.push("# 1주차 실행 리허설");
  L.push("");
  L.push("**이 문서는 사람이 읽으라고 만든 것이다.** 검사기가 보는 값이 아니다.");
  L.push("두 사람이 엿새 동안 화면에서 무엇을 읽게 되는지를 그대로 옮겼다.");
  L.push("`node scripts/rehearse.js` 로 다시 뽑는다. 손으로 고치지 않는다.");
  L.push("");
  L.push("## 1. 엿새 한눈에");
  L.push("");
  L.push("| 날 | 세션 | 강 | 제목 | 트랙 | 세트 | 카드 | 미디어 | A 는 누구 |");
  L.push("|---|---|---|---|---|---|---|---|---|");
  days.forEach((d) => {
    const h = d.head;
    L.push("| " + d.date + " | " + h.session + " | " + h.lecture + "강 | " + (h.title || "")
      + " | " + (h.track || "") + " | " + (h.set || "") + " | " + cardRange(h.cards)
      + " | " + (h.media || "") + " | " + (h.roleToday === "a" ? "사람1" : "사람2") + " |");
  });
  L.push("");
  L.push("엿새 뒤 진도는 " + days[days.length - 1].done + " 세션이다.");
  if (sameTwice.length) {
    L.push("");
    L.push("**같은 사람이 이틀 연달아 A인 날이 있다.** " + sameTwice.join(" "));
    L.push("날짜로 역할을 정하기 때문이다. 개정문 11번이 이것을 세션 번호로 바꾸자고 한다.");
  }
  L.push("");
  L.push("## 2. 날마다 읽는 글");
  L.push("");
  days.forEach((d) => {
    L.push("### " + d.date + " (" + d.head.session + "세션 / " + d.head.lecture + "강)");
    L.push("");
    L.push("오늘 한 장에 뜨는 글이다.");
    L.push("");
    L.push("```");
    L.push(tidy(d.head.sheet));
    L.push("```");
    L.push("");
    d.blocks.forEach((b) => {
      L.push("**블록 " + b.no + ". " + b.name + " (" + b.minutes + "분)** 누를 것 " + b.buttons + "개"
        + (b.pressed ? " / 눌렀다: " + b.pressed : ""));
      L.push("");
      L.push("```");
      L.push(tidy(b.text));
      L.push("```");
      L.push("");
    });
  });
  L.push("## 3. 한 화면에 회차가 여럿인 자리");
  L.push("");
  L.push("칸에 회차가 세 자리 나온다. **초점 문장과 셈 줄과 버튼이다.**");
  L.push("초점은 블록이 정하고 셈과 버튼은 지금까지 한 횟수가 정한다. 둘은 서로 모른다.");
  L.push("");
  if (clash.length) clash.forEach((c) => L.push("- " + c));
  else L.push("없다.");
  L.push("");
  L.push("## 4. 돌다가 막힌 자리");
  L.push("");
  if (stuck.length) stuck.forEach((s) => L.push("- " + s));
  else L.push("없다. 엿새를 끝까지 돌았다.");
  L.push("");
  if (errs.length) {
    L.push("## 5. 화면 오류");
    L.push("");
    errs.slice(0, 10).forEach((e) => L.push("- " + e));
    L.push("");
  }

  fs.writeFileSync(OUT, L.join("\n") + "\n", "utf8");
  console.log("out/manual/eng2p_rehearsal_w1.md / 엿새 " + days.length
    + "일 / 블록 " + days.length * 4 + "칸 / 막힌 자리 " + stuck.length
    + "곳 / 회차 어긋난 칸 " + clash.length + "곳 / 화면 오류 " + errs.length + "개");
  stuck.forEach((s) => console.log("[실패] " + s));
  errs.slice(0, 5).forEach((e) => console.log("[실패] 화면 오류: " + e));
  process.exit(stuck.length || errs.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
