/* 파형에서 마디를 뽑는가. T363
 *
 * `docs/beat.md` 가 규격이다. **판정이 아니라 눈금이다.**
 *
 * 실제 녹음으로는 못 잰다. 저장소에 음성 파일을 안 넣기 때문이다.
 * **대신 파형을 지어서 넣는다.** 마디를 몇 개 만들지 아는 채로 넣고
 * 뽑힌 수가 그것과 같은지 본다.
 *
 * ## 재는 것 넷
 *
 *     문서와 코드의 값이 같은가   `beat.md` 4장 표 넷
 *     지은 마디를 그대로 뽑는가   셋을 넣으면 셋이 나온다
 *     길이를 모르면 안 뽑는가     **어림해서 안 뽑는다** (3장)
 *     크기가 달라도 같은가        큰 녹음과 작은 녹음 (4.1)
 *
 * 넷째가 이 검사의 요점이다. 두 사람이 기기 녹음기로 녹음하고
 * **기기마다 크기가 다르다.** 고정 문턱이면 한쪽이 통째로 쉼이 된다.
 *
 * 사용법:
 *     node scripts/check_beat.js
 *
 * 규격: docs/beat.md
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
  console.log("마디 검사를 안 돌렸다. 통과가 아니다.");
  process.exit(0);
}
let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { skip("playwright 를 못 찾았다"); }
if (!fs.existsSync(CHROME)) skip("크로미움을 못 찾았다: " + CHROME);

const fails = [];
const no = (m) => fails.push(m);

/* ---- 문서와 코드가 같은 말을 하는가 -------------------------------------
   **적어 놓은 것과 도는 것이 다르다** 를 F단계가 네 번 잡았다. 여기서 막는다 */
const doc = fs.readFileSync(path.join(HERE, "docs", "beat.md"), "utf8");
const src = fs.readFileSync(path.join(HERE, "app", "late", "18_clip.js"), "utf8");
const VALS = [
  ["PAUSE_S", "0.18", "BEAT_PAUSE_S"],
  ["MIN_SEG_S", "0.12", "BEAT_MIN_SEG_S"],
  ["FLOOR", "0.06", "BEAT_FLOOR"],
  ["REL", "0.22", "BEAT_REL"],
];
VALS.forEach(([name, want, code]) => {
  const row = doc.split("\n").filter((l) => l.indexOf("`" + name + "`") >= 0 &&
                                            l.indexOf("|") === 0)[0];
  if (!row) { no("beat.md 4장 표에 " + name + " 줄이 없다"); return; }
  if (row.indexOf(want) < 0)
    no("beat.md 의 " + name + " 이 " + want + " 가 아니다: " + row.trim());
  const m = src.match(new RegExp("var " + code + "\\s*=\\s*([0-9.]+)"));
  if (!m) { no("18_clip.js 에 " + code + " 가 없다"); return; }
  if (m[1] !== want)
    no("문서는 " + name + " 이 " + want + " 인데 코드는 " + m[1] + " 이다");
});

/* **B등급이라고 적어 뒀는가.** 출처 없는 값을 A등급으로 두면 안 된다 */
if (doc.indexOf("B등급") < 0)
  no("beat.md 가 문턱값 넷을 B등급으로 안 적었다");

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
  await page.waitForTimeout(500);
  /* 마디 뽑기는 늦게 읽는 조각에 있다 (T361). 클립 탭을 열어야 온다 */
  await page.evaluate(() => go("clip"));
  await page.waitForTimeout(900);
  if (!(await page.evaluate(() => typeof beatSegs === "function"))) {
    await browser.close();
    no("클립 탭을 열었는데 beatSegs 가 없다");
    fails.forEach((m) => console.log("[실패] " + m));
    process.exit(1);
  }

  /* 파형을 짓는다. `want` 개 마디를 넣고 그만큼 나오는지 본다.
   *   loud  소리 칸의 크기. 기기마다 다른 것을 흉내 낸다
   *   quiet 쉼 칸의 크기. **잡음 바닥이다.** 크게 녹음하면 이것도 커진다
   *   segN  마디 하나가 몇 칸인가
   *   gapN  쉼이 몇 칸인가
   *
   * 넷째 줄이 문턱을 그 파일에서 내는 까닭이다 (`beat.md` 4.1).
   * **처음에 잡음 바닥을 늘 0.01 로 두고 재다가 깸이 안 잡혔다.**
   * 고정 문턱으로 바꿔 놓아도 다 통과했다. 잡음이 낮으면 어느 쪽이든 되니까.
   * 크게 녹음하면 잡음 바닥도 같이 오른다. 거기서만 갈린다.
   */
  const CASES = [
    { name: "마디 셋 · 보통 크기", want: 3, loud: 0.8, quiet: 0.01,
      segN: 20, gapN: 20, dur: 10 },
    { name: "마디 셋 · 작게 녹음", want: 3, loud: 0.14, quiet: 0.003,
      segN: 20, gapN: 20, dur: 10 },
    { name: "마디 셋 · 크게 녹음. 잡음 바닥도 높다", want: 3, loud: 1.0, quiet: 0.1,
      segN: 20, gapN: 20, dur: 10 },
    { name: "마디 일곱", want: 7, loud: 0.6, quiet: 0.01,
      segN: 14, gapN: 14, dur: 10 },
    { name: "마디 하나", want: 1, loud: 0.6, quiet: 0.01,
      segN: 200, gapN: 20, dur: 10 },
  ];

  for (const c of CASES) {
    const got = await page.evaluate((c) => {
      const p = [];
      for (let i = 0; i < c.want; i++) {
        for (let j = 0; j < c.segN; j++) p.push(c.loud);
        for (let j = 0; j < c.gapN; j++) p.push(c.quiet);
      }
      while (p.length < 320) p.push(c.quiet);
      const r = beatSegs(p.slice(0, 320), c.dur);
      return r ? { n: r.segs.length, thr: r.thr,
                   gaps: beatGaps(r).length, spread: beatSpread(r) } : null;
    }, c);
    if (!got) { no(c.name + ": 마디를 못 뽑았다"); continue; }
    if (got.n !== c.want)
      no(c.name + ": 마디 " + c.want + "개를 넣었는데 " + got.n + "개가 나왔다");
    /* 쉼은 마디 사이에만 있다. **마디 하나면 쉼이 0이다** */
    if (got.gaps !== Math.max(0, got.n - 1))
      no(c.name + ": 마디 " + got.n + "개에 쉼이 " + got.gaps + "개다");
    /* 지은 파형은 마디 길이가 다 같다. **퍼진 정도가 0이어야 한다** */
    if (got.n >= 2 && got.spread > 0.01)
      no(c.name + ": 길이가 다 같은데 퍼진 정도가 " + got.spread + " 다");
  }

  /* ---- 길이를 모르면 안 뽑는다. **어림해서 안 뽑는다** (3장) ------------- */
  const bad = await page.evaluate(() => {
    const p = new Array(320).fill(0.5);
    return { noDur: beatSegs(p, 0), negDur: beatSegs(p, -3),
             noPeak: beatSegs([], 10), nullPeak: beatSegs(null, 10),
             one: beatSpread(beatSegs(p, 10)) };
  });
  ["noDur", "negDur", "noPeak", "nullPeak"].forEach((k) => {
    if (bad[k] !== null) no("길이나 파형이 없는데 " + k + " 가 값을 냈다");
  });
  /* 마디가 하나면 퍼진 정도가 없다. **없는 것을 0으로 안 적는다** */
  if (bad.one !== null) no("마디 하나인데 퍼진 정도를 " + bad.one + " 로 적는다");

  /* ---- 크기가 달라도 같은 마디가 나오는가 (4.1) ------------------------- */
  const same = await page.evaluate(() => {
    /* **크기만 통째로 다르다.** 잡음 바닥도 같은 배로 커진다.
       기기 둘이 같은 말을 다른 볼륨으로 담은 자리다 */
    const make = (loud) => {
      const p = [];
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 20; j++) p.push(loud);
        for (let j = 0; j < 20; j++) p.push(loud * 0.12);
      }
      while (p.length < 320) p.push(loud * 0.12);
      return beatSegs(p.slice(0, 320), 10);
    };
    return [0.12, 0.4, 1].map((x) => make(x).segs.length);
  });
  if (new Set(same).size !== 1)
    no("크기만 다른 같은 파형에서 마디가 " + same.join(" / ") + " 로 갈린다");

  /* ---- 한 칸 조용한 것으로 마디를 안 끊는다 ----------------------------- */
  const dip = await page.evaluate(() => {
    const p = new Array(320).fill(0.01);
    for (let i = 20; i < 120; i++) p[i] = 0.7;
    p[70] = 0.01;  /* 낱말 안의 한 칸. 10초에 320칸이면 0.03초다 */
    return beatSegs(p, 10).segs.length;
  });
  if (dip !== 1) no("한 칸 조용한 자리에서 마디가 " + dip + "개로 끊긴다");

  /* ---- 화면이 마디를 말하는가 (T364) -----------------------------------
     **파형을 지어 넣고 그린다.** 음성 파일 없이 화면까지 갈 수 있는 자리다.
     `CLIP.el` 을 길이만 가진 것으로 두면 `dur()` 이 그것을 읽는다. */
  const shown = await page.evaluate(() => {
    const p = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 20; j++) p.push(0.7);
      for (let j = 0; j < 20; j++) p.push(0.01);
    }
    while (p.length < 320) p.push(0.01);
    $("#clipCtl").hidden = false;
    CLIP.el = { duration: 10, currentTime: 0 };
    CLIP.peaks = p; CLIP.beat = null; CLIP.waveState = "ready";
    paintWave(); waveInfo();
    const withDur = $("#clipWaveInfo").textContent;
    /* 길이를 모르는 자리. **모르면 안 적는다** */
    CLIP.el = { duration: 0, currentTime: 0 }; CLIP.beat = null;
    waveInfo();
    return { withDur: withDur, noDur: $("#clipWaveInfo").textContent };
  });
  if (shown.withDur.indexOf("마디 4개") < 0)
    no("화면이 마디 수를 안 적는다: " + shown.withDur);
  if (shown.withDur.indexOf("쉼 3군데") < 0)
    no("화면이 쉼 수를 안 적는다: " + shown.withDur);
  if (shown.noDur.indexOf("마디") >= 0)
    no("길이를 모르는데 마디를 적는다: " + shown.noDur);

  /* **판정 낱말을 안 쓴다** (`beat.md` 5장). 잘했다고도 못했다고도 안 한다 */
  ["잘", "틀렸", "맞았", "좋", "나쁘", "고르다", "들쭉"].forEach((w) => {
    if (shown.withDur.indexOf(w) >= 0)
      no("마디 줄이 판정하는 말을 쓴다: " + w);
  });

  /* 띠를 정말 그렸는가. **글자는 맞는데 안 그려질 수 있다.**
     캔버스는 글로 안 읽힌다. 바닥 몇 줄의 칠해진 점을 센다. */
  const drawn = await page.evaluate(() => {
    const cv = document.getElementById("clipWave");
    const r = cv.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    function ink() {
      const h = Math.round(6 * dpr);
      const d = cv.getContext("2d")
        .getImageData(0, cv.height - h, cv.width, h).data;
      let n = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++;
      return n;
    }
    const p = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 20; j++) p.push(0.7);
      for (let j = 0; j < 20; j++) p.push(0.01);
    }
    while (p.length < 320) p.push(0.01);
    CLIP.el = { duration: 10, currentTime: 0 };
    CLIP.peaks = p; CLIP.beat = null; CLIP.waveState = "ready";
    paintWave();
    const withSeg = ink();
    /* 길이를 모르면 띠가 없다. **파형은 그대로 그린다** */
    CLIP.el = { duration: 0, currentTime: 0 }; CLIP.beat = null;
    paintWave();
    return { w: r.width, withSeg: withSeg, noSeg: ink() };
  });
  if (!drawn.w) no("클립 파형 칸이 화면에 안 펴져 있다");
  else if (drawn.withSeg <= drawn.noSeg)
    no("마디 띠가 안 그려진다: 있을 때 " + drawn.withSeg +
       "점, 없을 때 " + drawn.noSeg + "점");

  /* ---- 기준을 잡아 두고 겹쳐 보는가 (T365) -----------------------------
     **잡아 둔 것이 저장소에 안 들어가야 한다** (`beat.md` 6장). */
  const ref = await page.evaluate(async () => {
    const cv = document.getElementById("clipWave");
    /* **점을 세면 안 된다.** 조용한 칸도 최소 굵기로 그려져서 가운데 띠가
       늘 꽉 찬다. 처음에 세다가 혼자와 겹쳐가 똑같이 나왔다.
       그림 자체를 견준다. 겹쳐 그리면 그림이 달라진다. */
    function ink() { return cv.toDataURL(); }
    const make = (n) => {
      const p = [];
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < 10; j++) p.push(0.7);
        for (let j = 0; j < 10; j++) p.push(0.01);
      }
      while (p.length < 320) p.push(0.01);
      return p.slice(0, 320);
    };
    REF = null;
    CLIP.el = { duration: 10, currentTime: 0 };
    CLIP.file = { name: "원본.mp3" };
    CLIP.peaks = make(4); CLIP.beat = null; CLIP.waveState = "ready";
    paintRef(); paintWave();
    const alone = ink();
    document.getElementById("cRef").click();
    const label = document.getElementById("cRef").textContent;
    const held = !!(REF && REF.peaks);
    /* 다른 파일을 연 자리. **같은 이름이면 안 겹친다** */
    CLIP.file = { name: "내녹음.webm" };
    CLIP.peaks = make(3); CLIP.beat = null;
    paintWave(); waveInfo();
    const over = ink(), said = document.getElementById("clipWaveInfo").textContent;
    /* 같은 파형을 기준 없이 그린 그림. **이것과 달라야 겹친 것이다** */
    const keep = REF; REF = null; paintWave();
    const overNoRef = ink(); REF = keep;
    /* 같은 파일로 돌아오면 자기를 자기 위에 안 겹친다 */
    CLIP.file = { name: "원본.mp3" }; CLIP.peaks = make(4); CLIP.beat = null;
    paintWave();
    const self = ink();
    saveNow();
    const inStore = (localStorage.getItem("eng2p.v1") || "").indexOf("원본.mp3") >= 0;
    document.getElementById("cRef").click();
    return { alone: alone, over: over, overNoRef: overNoRef, self: self,
             held: held, label: label,
             said: said, cleared: REF === null,
             label2: document.getElementById("cRef").textContent,
             inStore: inStore };
  });
  if (!ref.held) no("기준으로 잡기를 눌렀는데 안 잡힌다");
  if (ref.label !== "기준 지우기")
    no("잡아 둔 뒤에도 단추가 '" + ref.label + "' 다");
  if (ref.said.indexOf("기준 원본.mp3") < 0)
    no("무엇을 기준으로 보는지 안 적는다: " + ref.said);
  if (ref.over === ref.overNoRef)
    no("기준을 잡아도 그림이 그대로다. 안 겹쳐 그린다");
  if (ref.self !== ref.alone)
    no("같은 이름인데 자기를 자기 위에 겹친다");
  /* **소리에서 나온 값을 저장소에 안 남긴다** */
  if (ref.inStore) no("기준으로 잡은 파일 이름이 저장소에 들어갔다");
  if (!ref.cleared) no("기준 지우기를 눌렀는데 안 지워진다");
  if (ref.label2 !== "기준으로 잡기")
    no("지운 뒤에도 단추가 '" + ref.label2 + "' 다");

  /* ---- 그림으로 안 보이는 것을 글로 적는가 (T366) ----------------------
     겹친 그림은 가로를 칸 번호로 맞춰서 **길이 차이가 안 보인다.** */
  const diff = await page.evaluate(() => {
    const make = (n) => {
      const p = [];
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < 10; j++) p.push(0.7);
        for (let j = 0; j < 10; j++) p.push(0.01);
      }
      while (p.length < 320) p.push(0.01);
      return p.slice(0, 320);
    };
    const box = document.getElementById("clipDiff");
    REF = null;
    CLIP.el = { duration: 6, currentTime: 0 };
    CLIP.file = { name: "원본.mp3" };
    CLIP.peaks = make(4); CLIP.beat = null; CLIP.waveState = "ready";
    paintRef(); waveInfo();
    const noRef = { hid: box.hidden, txt: box.textContent };
    document.getElementById("cRef").click();
    /* 기준만 잡고 파일은 그대로. **자기와 자기를 견주지 않는다** */
    waveInfo();
    const self = { hid: box.hidden, txt: box.textContent };
    /* 1.25배 길고 마디가 하나 적은 파일 */
    CLIP.el = { duration: 7.5, currentTime: 0 };
    CLIP.file = { name: "내녹음.webm" };
    CLIP.peaks = make(3); CLIP.beat = null;
    waveInfo();
    const other = { hid: box.hidden, txt: box.textContent };
    /* 마디 수가 같은 자리. **같으면 같다고 적는다** */
    CLIP.peaks = make(4); CLIP.beat = null;
    waveInfo();
    const same = box.textContent;
    document.getElementById("cRef").click();
    waveInfo();
    return { noRef: noRef, self: self, other: other, same: same,
             gone: box.hidden };
  });
  if (!diff.noRef.hid) no("기준이 없는데 차이 칸이 떠 있다: " + diff.noRef.txt);
  if (!diff.self.hid) no("같은 파일인데 자기와 자기를 견준다: " + diff.self.txt);
  if (diff.other.hid) no("기준과 다른 파일인데 차이 칸이 안 뜬다");
  else {
    ["기준 6.0초", "이 파일 7.5초", "1.25배", "마디 3개 대 기준 4개"]
      .forEach((w) => {
        if (diff.other.txt.indexOf(w) < 0)
          no("차이 칸에 '" + w + "' 가 없다: " + diff.other.txt);
      });
  }
  if (diff.same.indexOf("마디 수는 같다 (4개)") < 0)
    no("마디 수가 같은데 같다고 안 적는다: " + diff.same);
  /* **판정 낱말을 안 쓴다.** 느린 것이 나쁜 것이 아니다 */
  ["느리", "빠르", "잘", "틀렸", "맞았", "부족"].forEach((w) => {
    if (diff.other.txt.indexOf(w) >= 0) no("차이 칸이 판정하는 말을 쓴다: " + w);
  });
  if (!diff.gone) no("기준을 지웠는데 차이 칸이 남아 있다");

  /* ---- 어디가 길고 어디가 센가 (T367) ----------------------------------
     **마디 단위로만 잰다.** 마디 안 어디에 강세가 있는지는 안 잰다. */
  const pick = await page.evaluate(() => {
    const cv = document.getElementById("clipWave");
    /* 위쪽 3px. **봉우리 점만 닿는 자리다.** 파형은 가운데서 자란다 */
    const ink = () => {
      const h = Math.max(1, Math.round(cv.height * 0.06));
      const d = cv.getContext("2d").getImageData(0, 0, cv.width, h).data;
      let n = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++;
      return n;
    };
    /* 마디 넷. **둘째가 제일 길고 셋째가 제일 세다** */
    const p = [];
    const seg = (len, loud) => {
      for (let j = 0; j < len; j++) p.push(loud);
      for (let j = 0; j < 12; j++) p.push(0.01);
    };
    seg(12, 0.5); seg(40, 0.5); seg(12, 0.95); seg(12, 0.5);
    while (p.length < 320) p.push(0.01);
    REF = null;
    CLIP.el = { duration: 10, currentTime: 0 };
    CLIP.file = { name: "말.mp3" };
    CLIP.peaks = p.slice(0, 320); CLIP.beat = null; CLIP.waveState = "ready";
    paintWave(); waveInfo();
    const r = beatNow(), pk = beatPick(r);
    const box = document.getElementById("clipStress");
    const four = { txt: box.textContent, hid: box.hidden, dots: ink(),
                   pick: pick0(pk), tops: r.segs.map((g) => g.top >= g.t0 &&
                                                            g.top <= g.t1) };
    /* 제일 길고 제일 센 것이 같은 마디인 자리 */
    const q = [];
    const seg2 = (len, loud) => {
      for (let j = 0; j < len; j++) q.push(loud);
      for (let j = 0; j < 12; j++) q.push(0.01);
    };
    seg2(12, 0.5); seg2(40, 0.95); seg2(12, 0.5);
    while (q.length < 320) q.push(0.01);
    CLIP.peaks = q.slice(0, 320); CLIP.beat = null;
    waveInfo();
    const same = box.textContent;
    /* 마디 하나. **하나뿐인 것을 제일이라고 안 한다** */
    const one = new Array(320).fill(0.01);
    for (let i = 20; i < 200; i++) one[i] = 0.6;
    CLIP.peaks = one; CLIP.beat = null;
    waveInfo();
    return { four: four, same: same, oneHid: box.hidden,
             onePick: beatPick(beatNow()) };
    function pick0(x) { return x ? { lo: x.longest, hi: x.loudest } : null; }
  });
  if (!pick.four.pick) no("마디 넷인데 제일 긴 것을 못 짚는다");
  else {
    if (pick.four.pick.lo !== 1)
      no("제일 긴 마디가 2번째인데 " + (pick.four.pick.lo + 1) + "번째로 짚는다");
    if (pick.four.pick.hi !== 2)
      no("제일 센 마디가 3번째인데 " + (pick.four.pick.hi + 1) + "번째로 짚는다");
  }
  if (pick.four.tops.some((x) => !x)) no("봉우리가 그 마디 밖에 있다");
  /* **마디 안에 있다는 것으로는 모자란다.** 첫 칸도 마디 안이다.
     처음에 그것만 재다가 봉우리를 첫 칸으로 바꾼 깸이 안 잡혔다.
     한 자리만 크게 만든 마디를 넣고 **거기를 짚는지** 본다. */
  const top = await page.evaluate(() => {
    const p = new Array(320).fill(0.01);
    for (let i = 20; i < 120; i++) p[i] = 0.4;
    p[70] = 0.95;  /* 여기가 봉우리다. 10초에 320칸이면 2.19초 */
    CLIP.el = { duration: 10, currentTime: 0 };
    CLIP.peaks = p; CLIP.beat = null; CLIP.waveState = "ready";
    const r = beatNow();
    return { top: r.segs[0].top, t0: r.segs[0].t0, want: 70 * (10 / 320) };
  });
  if (Math.abs(top.top - top.want) > 0.05)
    no("봉우리를 " + top.top.toFixed(2) + "초로 짚는다. " +
       top.want.toFixed(2) + "초여야 한다 (마디 시작은 " + top.t0.toFixed(2) + ")");
  if (pick.four.hid) no("마디 넷인데 강세 줄이 안 뜬다");
  if (pick.four.txt.indexOf("제일 긴 마디 2번째") < 0)
    no("강세 줄이 제일 긴 마디를 안 적는다: " + pick.four.txt);
  if (pick.four.txt.indexOf("제일 센 마디 3번째") < 0)
    no("강세 줄이 제일 센 마디를 안 적는다: " + pick.four.txt);
  /* **못 재는 것을 못 잰다고 적는다** */
  if (pick.four.txt.indexOf("마디 안 어디인지는 안 잰다") < 0)
    no("마디 안을 안 잰다는 말이 없다: " + pick.four.txt);
  if (!pick.four.dots) no("봉우리 점이 안 그려진다");
  if (pick.same.indexOf("제일 길고 제일 센 마디가 2번째다") < 0)
    no("길고 센 것이 같은 마디인데 따로 적는다: " + pick.same);
  /* 마디 하나면 짚을 것이 없다 */
  if (pick.onePick !== null) no("마디 하나인데 제일 긴 것을 짚는다");
  if (!pick.oneHid) no("마디 하나인데 강세 줄이 떠 있다");

  /* ---- 박자를 대 본다 (T368) -------------------------------------------
     **전체가 느린 것과 한 마디만 늘어진 것은 다르다.** */
  const match = await page.evaluate(() => {
    const box = document.getElementById("clipMatch");
    /* `lens` 만큼의 마디를 짓는다. 쉼은 늘 12칸 */
    const make = (lens) => {
      const p = [];
      lens.forEach((n) => {
        for (let j = 0; j < n; j++) p.push(0.6);
        for (let j = 0; j < 12; j++) p.push(0.01);
      });
      while (p.length < 320) p.push(0.01);
      return p.slice(0, 320);
    };
    const set = (name, peaks, d) => {
      CLIP.file = { name: name }; CLIP.el = { duration: d, currentTime: 0 };
      CLIP.peaks = peaks; CLIP.beat = null; CLIP.waveState = "ready";
    };
    REF = null;
    set("원본.mp3", make([20, 20, 20]), 6);
    paintRef(); waveInfo();
    document.getElementById("cRef").click();

    /* 1. 통째로 1.5배 느리게. **마디 비율은 그대로다** */
    set("느리게.webm", make([20, 20, 20]), 9);
    waveInfo();
    const slow = { txt: box.textContent, m: beatMatch() };

    /* 2. 가운데 마디만 늘어졌다 */
    set("가운데.webm", make([20, 40, 20]), 6);
    waveInfo();
    const mid = { txt: box.textContent, m: beatMatch() };

    /* 3. 마디 수가 다르다. **짝을 못 짓는다** */
    set("넷.webm", make([20, 20, 20, 20]), 6);
    waveInfo();
    const four = { txt: box.textContent, m: beatMatch() };

    document.getElementById("cRef").click();
    waveInfo();
    return { slow: slow, mid: mid, four: four, gone: box.hidden };
  });
  /* 통째로 느린 것은 어긋남이 아니다. **1.00 에 붙어 있어야 한다** */
  if (!match.slow.m || !match.slow.m.paired) no("통째로 느린 파일을 짝 못 짓는다");
  else if (Math.abs(match.slow.m.worst.rel - 1) > 0.05)
    no("통째로 1.5배 느린데 어긋남이 " + match.slow.m.worst.rel.toFixed(2) +
       "배로 나온다. 전체 배수를 안 빼고 있다");
  /* 가운데만 늘어진 것은 그 마디가 짚혀야 한다 */
  if (!match.mid.m || !match.mid.m.paired) no("가운데가 늘어진 파일을 짝 못 짓는다");
  else {
    if (match.mid.m.worst.i !== 1)
      no("가운데 마디가 늘어졌는데 " + (match.mid.m.worst.i + 1) + "번째를 짚는다");
    if (match.mid.m.worst.rel <= 1.2)
      no("가운데가 두 배로 늘어졌는데 " + match.mid.m.worst.rel.toFixed(2) + "배로 낸다");
  }
  if (match.mid.txt.indexOf("2번째 마디가 제일 다르다") < 0)
    no("화면이 어긋난 마디를 안 짚는다: " + match.mid.txt);
  if (match.mid.txt.indexOf("전체 배수를 빼고") < 0)
    no("전체 배수를 뺀 값이라고 안 적는다: " + match.mid.txt);
  /* 마디 수가 다르면 **못 한다고 낸다** */
  if (!match.four.m || match.four.m.paired)
    no("마디 수가 다른데 짝을 지어 버린다");
  if (match.four.txt.indexOf("마디 수가 달라서") < 0)
    no("마디 수가 다를 때 못 댄다고 안 적는다: " + match.four.txt);
  if (!match.gone) no("기준을 지웠는데 박자 줄이 남아 있다");

  /* 앱이 판정 안 한다는 말이 그 자리에 있는가. **만든 것과 닿는 것은 다르다** */
  const said = await page.evaluate(() => document.getElementById("t-clip").innerText);
  if (said.indexOf("앱은 잘했는지 안 말한다") < 0)
    no("클립 탭이 앱은 판정 안 한다는 말을 안 적는다");

  if (errs.length) no("화면 오류 " + errs.length + "개: " + errs.slice(0, 2).join(" / "));

  await browser.close();
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 마디가 같아도 발음이 다를 수 있다**");
  console.log("마디 %d판 (문서 대조 %d, 등급 1, 지은 파형 %d x 3, 안 뽑는 자리 5, 크기 1, 한 칸 1, 화면 11, 띠 2, 기준 8, 차이 12, 강세 12, 박자 10) / 실패 %d",
              VALS.length * 2 + 1 + CASES.length * 3 + 62, VALS.length * 2,
              CASES.length, fails.length);
  process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
