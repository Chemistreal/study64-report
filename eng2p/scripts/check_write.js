/* 적는 칸 (T408).
 *
 * 이 앱에서 두 사람이 1년 동안 하는 일의 절반은 **적는 일**이다.
 * 미해결 LRE, 채집 표현, 맞춰 보기, 주간 점검 일곱 칸, 분기 통과 값이 다 그렇다.
 *
 * 그런데 적는 칸을 재는 검사가 이렇게 갈려 있었다.
 *
 *     check_store.js   **저장소의 기계**를 잰다. 깨진 글자, 미뤄 둔 저장, 사본 이레
 *     check_input.js   **긴 값이 화면을 무너뜨리는가**를 잰다 (T401)
 *     check_ui.js      칸 넷에 값을 넣어 본다 (aimSame aimDiff setUn wcFirst)
 *
 * 셋 다 **그 칸이 저장소에 이어져 있는가**는 안 잰다.
 * 기계가 멀쩡해도 칸 하나가 그 기계에 안 이어져 있으면 그 칸만 조용히 샌다.
 * 앱의 적는 자리는 예순아홉이고 그중 넷만 값을 넣어 본 것이다.
 *
 * ## 안 이어진 칸은 아무 소리도 안 낸다
 *
 * 화면은 멀쩡하다. 글자도 그대로 보인다. 탭을 옮겼다 오면 없다.
 * 두 사람은 그것을 그때 못 알아챈다. 다음 주 점검에서 찾으러 왔다가 없는 것을 본다.
 * **적어 두고 다시 못 보면 안 적은 것과 같다** (T395).
 *
 * ## 세는 것이 아니라 막는다
 *
 * T404 가 활자에서 배운 것과 같다. 세어 두기만 하면 는다.
 * 그래서 자리를 표로 세우고 **표 밖의 칸이 하나라도 생기면 실패**로 낸다.
 * 칸을 하나 더 만드는 사람은 그때 그 칸의 갈래를 적게 된다.
 *
 * ## 갈래 넷
 *
 *     남는다      적으면 그대로 남는다. 새로 고쳐도 그 값이 있다
 *     눌러서      단추를 눌러야 남는다. 칸 자체는 비워진다
 *     안 남는다   남기지 않기로 한 칸이다. **까닭을 적는다**
 *     읽기만      앱이 셈해서 넣는다. 사람이 못 고친다
 *
 * 셋째에 까닭이 없으면 **이어 붙이는 것을 잊은 칸**과 **안 붙이기로 한 칸**을
 * 못 가른다. 둘은 화면에서 똑같이 보인다. 가르는 것은 글뿐이다.
 *
 * ## 재는 것 여섯
 *
 *     표가 조각을 덮는가    조각의 자리 수와 이름이 표와 같다. 표 밖은 실패
 *     갈래가 있는가         이름마다 갈래가 넷 중 하나로 적혀 있다
 *     남는가                적고 새로 고쳐도 그 값이 그 칸에 있다
 *     눌러서 남는가         누르면 칸이 비고 그 값이 새로 고침 뒤에도 있다
 *     안 남는가             안 남는다고 적은 칸이 정말 안 남는다
 *     적는 중에 안 갈리나   다시 그리는 동안 손이 올라가 있는 칸 (T211)
 *
 * 마지막이 T211 이 만든 규칙이다. 블록 칸은 세션이 도는 동안 자주 다시 그려진다.
 * 자료가 늦게 오거나 카드가 넘어가거나 되돌리기를 누를 때다.
 * 그때 값을 다시 넣으면 글자는 같아도 **커서가 끝으로 튄다.** 가운데를 고치던 손이
 * 끝으로 밀린다. 그 규칙을 `fillField` 가 지키는데 그것을 아무도 안 재고 있었다.
 *
 * **처음에는 시계만 돌려 놓고 기다렸다.** 그러면 아무 일도 안 일어난다.
 * 매초 도는 것은 시계뿐이고 칸은 `renderBlockPane` 이 불릴 때 다시 채워진다.
 * 깸 시험에서 `fillField` 의 손 가드를 떼 봤는데 안 잡혔다.
 * **아무것도 안 흔드는 검사는 늘 통과한다.** 그래서 여기서 직접 다시 그린다.
 *
 * 그러고도 안 잡혔다. 같은 글자를 도로 넣는 것은 커서를 안 옮기기 때문이다.
 * **위험한 자리는 저장이 아직 안 따라온 사이다.** 저장은 120밀리초를 미룬다.
 * 그 사이에 다시 그리면 앱이 든 값은 한 글자 앞이고 그것을 덮으면
 * 치던 글자가 사라진다. 그래서 이 판은 그 사이를 만들어 놓고 흔든다.
 *
 * **기계가 안 보는 것: 적은 것이 쓸 만한가.**
 * 그리고 두 사람이 그 칸을 실제로 쓰는가. 빈 칸으로 1년을 가는 자리가 있을 수 있다.
 *
 * 사용법:
 *     node scripts/check_write.js
 *
 * 규격: docs/roadmap.md 12.18, docs/blocks.md 11장, docs/friction.md
 */
const path = require("path");
const fs = require("fs");

const HERE = path.resolve(__dirname, "..");
const ROOT = path.resolve(HERE, "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH ||
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

/* 조각마다 적는 자리가 몇이고 이름이 무엇인가. **이 표가 문이다.**
   n 은 이름 없는 자리까지 센 수고 ids 는 글자로 적힌 이름이다.
   why 는 이름이 없거나 표에 안 적는 자리의 까닭이다. */
const SITES = {
  "body/02_today.html": { n: 17, ids: ["obA", "obB", "obD", "tSound", "tBuzz",
    "fSpeak", "fCards", "fLre", "uT", "uI", "uK", "uH", "uW",
    "cE", "cS", "cQ", "cK"] },
  "body/04_sound.html": { n: 5, ids: ["vVoice", "vRate", "vRep", "vMode", "vText"] },
  "body/05_clip.html": { n: 7, ids: ["clipFile", "cRate", "cA", "cB", "cLabel",
    "cFocus", "scText"] },
  "body/06_media.html": { n: 4, ids: ["libRate", "libSearch", "libQ", "libFilter"] },
  "body/08_ledger.html": { n: 6, ids: ["restDay", "sStart", "sNameA", "sNameB",
    "mgFile", "imFile"] },
  "body/11_check.html": { n: 3, ids: ["kName", "kKind", "kText"] },
  "body/12_rot.html": { n: 5, ids: ["rId", "rQ", "rD", "rR", "rF"] },
  "body/12c_find.html": { n: 1, ids: ["fdQ"] },
  "js/03_plan.js": { n: 2, ids: [],
    why: "기준 점수 칸은 기준마다 하나씩 그려져 이름 대신 aria-label 을 단다 (PR #11). " +
         "나머지 하나는 복사할 때 잠깐 만드는 칸이라 화면에 안 뜬다" },
  "js/05_session.js": { n: 3, ids: ["setLre", "setUn"],
    why: "xchA 와 xchB 는 한 자리에서 쪽을 붙여 그린다" },
  "js/06_cards.js": { n: 2, ids: ["drCards", "drSpeak"] },
  "js/07_block14.js": { n: 3, ids: ["aimSame", "aimDiff"],
    why: "aimA 와 aimB 는 한 자리에서 쪽을 붙여 그린다" },
  "js/22_paircode.js": { n: 1, ids: ["pairIn"] },
  "js/24b_side.js": { n: 1, ids: ["whereIn"] },
  "late/12_verify.js": { n: 1, ids: [],
    why: "판정 완료 체크는 항목마다 하나씩 그려진다. 이름이 아니라 그 항목이 자리다" },
  "late/13_quarter.js": { n: 2, ids: [],
    why: "통과 조건 값 칸과 관계 점검 고르개는 조건마다 하나씩 그려진다" },
  "late/21_weekcheck.js": { n: 1, ids: [],
    why: "주간 점검 일곱 칸을 한 자리에서 목록으로 그린다" },
  "late/25_clips.js": { n: 1, ids: [],
    why: "구간 메모는 저장한 구간마다 하나씩 그려진다" },
  "play/apart.js": { n: 1, ids: ["aptIn"] },
  "play/overlap.js": { n: 2, ids: ["ovlIn", "ovlHeard"] },
  "play/relay.js": { n: 1, ids: ["rlyIn"] },
};

/* 이름마다 갈래와 어디서 재는가. at 이 빈 것은 안 몬다는 뜻이고 그때는 까닭이 있어야 한다. */
const K = { keep: "남는다", press: "눌러서", drop: "안 남는다", read: "읽기만" };
const WAYS = {
  obA: { way: K.press, at: "", why: "첫 열림에만 뜬다. 대장 탭 사람 1 칸이 같은 값을 든다" },
  obB: { way: K.press, at: "", why: "첫 열림에만 뜬다. 대장 탭 사람 2 칸이 같은 값을 든다" },
  obD: { way: K.press, at: "", why: "첫 열림에만 뜬다. 대장 탭 시작일 칸이 같은 값을 든다" },
  tSound: { way: K.keep, at: "today" },
  tBuzz: { way: K.keep, at: "today" },
  fSpeak: { way: K.keep, at: "rec" },
  fCards: { way: K.keep, at: "rec" },
  fLre: { way: K.keep, at: "rec" },
  uT: { way: K.press, at: "today" },
  uI: { way: K.press, at: "today" },
  uK: { way: K.press, at: "today" },
  uH: { way: K.press, at: "today" },
  uW: { way: K.press, at: "today" },
  cE: { way: K.press, at: "today" },
  cS: { way: K.press, at: "today" },
  cQ: { way: K.press, at: "today" },
  cK: { way: K.press, at: "today" },
  vVoice: { way: K.drop, at: "",
    why: "기기가 내주는 음성 목록이다. 검사 기계에는 영어 음성이 하나도 없다" },
  vRate: { way: K.drop, at: "sound",
    why: "그 자리에서 읽어 주는 값이다. 남는 배속은 미디어 쪽 하나뿐이다 (T135)" },
  vRep: { way: K.drop, at: "sound", why: "같은 자리에서 몇 번 읽을지다. 그 자리의 값이다" },
  vMode: { way: K.drop, at: "sound", why: "같은 자리에서 어떻게 읽을지다. 그 자리의 값이다" },
  vText: { way: K.drop, at: "sound",
    why: "붙여 넣고 그 자리에서 읽는다. 목록 만들기는 화면에만 만든다" },
  clipFile: { way: K.drop, at: "", why: "파일 칸이다. **소리는 저장소에 안 넣는다**" },
  cRate: { way: K.drop, at: "clip", why: "그 자리에서 듣는 배속이다" },
  cA: { way: K.read, at: "", why: "readonly 다. 단추와 파형으로만 움직인다" },
  cB: { way: K.read, at: "", why: "readonly 다. 단추와 파형으로만 움직인다" },
  cLabel: { way: K.drop, at: "clip", why: "구간을 저장할 때 그 구간에 붙는다. 칸은 비워진다" },
  cFocus: { way: K.drop, at: "clip", why: "구간을 저장할 때 그 구간에 붙는다. 칸은 비워진다" },
  scText: { way: K.press, at: "",
    why: "줄 나누기를 누르면 파일 이름에 붙어 남는다. 파일을 열어야 눌러진다" },
  libRate: { way: K.keep, at: "media" },
  libSearch: { way: K.drop, at: "media",
    why: "찾는 말이다. 다음에 열 때 지난 말이 남아 있으면 목록이 잘려 보인다" },
  libQ: { way: K.drop, at: "media", why: "고르개다. 다음에 열 때는 전체가 보여야 한다" },
  libFilter: { way: K.drop, at: "media", why: "고르개다. 다음에 열 때는 전체가 보여야 한다" },
  restDay: { way: K.press, at: "ledger" },
  sStart: { way: K.keep, at: "ledger" },
  sNameA: { way: K.keep, at: "ledger" },
  sNameB: { way: K.keep, at: "ledger" },
  mgFile: { way: K.drop, at: "", why: "파일 칸이다. 고른 파일을 저장소에 안 넣는다" },
  imFile: { way: K.drop, at: "", why: "파일 칸이다. 고른 파일을 저장소에 안 넣는다" },
  kName: { way: K.drop, at: "check", why: "붙여 넣고 그 자리에서 검사한다. 결과는 화면에만 있다" },
  kKind: { way: K.read, at: "",
    why: "readonly 다. 파일명을 보고 앱이 종류를 정한다. 사람이 못 고친다" },
  kText: { way: K.drop, at: "check", why: "붙여 넣고 그 자리에서 검사한다. 결과는 화면에만 있다" },
  rId: { way: K.drop, at: "rot", why: "고르개다. 누르면 회전 대장에 줄로 남는다" },
  rQ: { way: K.drop, at: "rot", why: "고르개다. 누르면 회전 대장에 줄로 남는다" },
  rD: { way: K.drop, at: "rot", why: "고르개다. 누르면 회전 대장에 줄로 남는다" },
  rR: { way: K.drop, at: "rot", why: "고르개다. 누르면 회전 대장에 줄로 남는다" },
  rF: { way: K.drop, at: "rot", why: "고르개다. 누르면 회전 대장에 줄로 남는다" },
  fdQ: { way: K.drop, at: "find", why: "찾는 말이다. 다음에 열 때 지난 말이 남으면 안 된다" },
  setLre: { way: K.keep, at: "b2" },
  setUn: { way: K.press, at: "b2" },
  xchA: { way: K.keep, at: "b2" },
  xchB: { way: K.keep, at: "b2" },
  drCards: { way: K.read, at: "",
    why: "readonly 다. **앱이 이미 아는 수라 사람이 다시 안 적는다** (T216)" },
  drSpeak: { way: K.keep, at: "b3" },
  aimA: { way: K.keep, at: "b1" },
  aimB: { way: K.keep, at: "b4" },
  aimSame: { way: K.keep, at: "b4" },
  aimDiff: { way: K.keep, at: "b4" },
  wcCause: { way: K.keep, at: "ledger" },
  wcLre: { way: K.keep, at: "ledger" },
  wcColl: { way: K.keep, at: "ledger" },
  wcFirst: { way: K.keep, at: "ledger" },
  wcBlock: { way: K.keep, at: "ledger" },
  wcOdd: { way: K.keep, at: "ledger" },
  wcAsk: { way: K.keep, at: "ledger" },
  pairIn: { way: K.press, at: "",
    why: "상대가 읽어 준 코드를 친다. 맞으면 셈이 건너오고 코드 자체는 안 남는다" },
  whereIn: { way: K.press, at: "",
    why: "세션이 어긋났을 때만 뜬다. 맞추면 이 기기 시계가 옮겨 가고 친 글자는 안 남는다" },
  aptIn: { way: K.drop, at: "play:apart",
    why: "판은 그날 셈만 남긴다. 적은 글은 소리 내어 읽고 넘긴다 (round.md 2장)" },
  ovlIn: { way: K.drop, at: "play:overlap",
    why: "판은 그날 셈만 남긴다. 적은 글은 소리 내어 읽고 넘긴다 (round.md 2장)" },
  ovlHeard: { way: K.drop, at: "",
    why: "상대가 말한 것을 적는 칸이다. 한 회가 돌아야 뜬다" },
  rlyIn: { way: K.drop, at: "",
    why: "소리를 한 번 듣고 나서 뜬다. 검사 기계가 그 소리를 못 낸다" },
};

/* 자리마다 가는 법. 한 자리에 한 창을 쓴다. */
const GO = {
  today: 'go("today")',
  rec: 'go("today"); var r=document.getElementById("recOpen"); if(r) r.click();',
  ledger: 'go("ledger")',
  media: 'go("media")',
  sound: 'go("sound")',
  clip: 'go("clip")',
  rot: 'go("rot")',
  check: 'go("check")',
  find: 'go("find")',
  b1: "T.run=true; gotoBlock(0);",
  b2: "T.run=true; gotoBlock(1);",
  b3: "T.run=true; gotoBlock(2);",
  b4: "T.run=true; gotoBlock(3);",
  "play:apart": 'go("play"); PLAY.at="apart"; renderPlayTab();',
  "play:overlap": 'go("play"); PLAY.at="overlap"; renderPlayTab();',
};

/* 눌러서 남기는 묶음. clears 는 누르면 칸이 비는가다. */
const ADDS = [
  { at: "today", btn: "uAdd", fields: ["uT", "uI", "uK", "uH", "uW"], must: "uT",
    clears: true, what: "미해결 LRE" },
  { at: "today", btn: "cAdd", fields: ["cE", "cS", "cQ", "cK"], must: "cE",
    clears: true, what: "채집 표현" },
  { at: "b2", btn: "setUnAdd", fields: ["setUn"], must: "setUn",
    clears: true, what: "블록 2 갈린 문장" },
  { at: "ledger", btn: "restGo", fields: ["restDay"], must: "restDay",
    clears: false, what: "쉴 날" },
];

/* 적는 도중에 안 갈리는 칸 (T211). 세션이 도는 자리만 본다. */
const TYPING = [["b1", "aimA"], ["b2", "xchA"], ["b2", "setUn"], ["b4", "aimB"]];

/* 다시 그려도 안 지워지는 칸. 판 화면은 시계가 끝날 때 통째로 다시 그린다. */
const REDRAW = [["play:apart", "aptIn"], ["play:overlap", "ovlIn"]];

const fails = [];
const no = (m) => fails.push(m);
let n = 0;

/* ---- 1. 표가 조각을 덮는가 (조각을 읽는다) ------------------------------
   **파생물이 아니라 조각을 본다.** english.html 만 보면 조각에만 있는 자리를
   못 보고, 조각을 고친 사람이 표를 안 고쳐도 지나간다. */
function blankOut(m) { return m.replace(/[^\n]/g, ""); }

function scanDir(dir, ext, cmt) {
  const out = {};
  const full = path.join(HERE, "app", dir);
  fs.readdirSync(full).filter((f) => f.endsWith(ext)).sort().forEach((f) => {
    const src = fs.readFileSync(path.join(full, f), "utf8").replace(cmt, blankOut);
    let cnt = 0;
    const ids = [];
    let m;
    const tag = /<(input|textarea|select)\b([^>]*)/g;
    while ((m = tag.exec(src))) {
      cnt += 1;
      const im = /id="([^"]+)"/.exec(m[2]);
      if (im && /^\w+$/.test(im[1])) ids.push(im[1]);
    }
    const made = /(?:el|document\.createElement)\(\s*"(input|textarea|select)"/g;
    while (made.exec(src)) cnt += 1;
    if (cnt) out[dir + "/" + f] = { n: cnt, ids: ids };
  });
  return out;
}

const found = Object.assign({},
  scanDir("body", ".html", /<!--[\s\S]*?-->/g),
  scanDir("js", ".js", /\/\*[\s\S]*?\*\//g),
  scanDir("late", ".js", /\/\*[\s\S]*?\*\//g),
  scanDir("play", ".js", /\/\*[\s\S]*?\*\//g));

let sites = 0;
Object.keys(found).forEach((f) => {
  sites += found[f].n;
  n += 2;
  const want = SITES[f];
  if (!want) {
    no("조각 " + f + " 에 적는 칸이 " + found[f].n + "개 있는데 표에 없다. " +
       "scripts/check_write.js 의 SITES 에 줄을 넣고 갈래를 적는다");
    return;
  }
  if (want.n !== found[f].n)
    no(f + " 의 적는 자리가 " + found[f].n + "개다. 표는 " + want.n + "개라고 적었다");
  const more = found[f].ids.filter((x) => want.ids.indexOf(x) < 0);
  const less = want.ids.filter((x) => found[f].ids.indexOf(x) < 0);
  if (more.length) no(f + " 에 표에 없는 칸이 있다: " + more.join(" "));
  if (less.length) no(f + " 에서 표의 칸을 못 찾았다: " + less.join(" "));
});
Object.keys(SITES).forEach((f) => {
  n += 1;
  if (!found[f]) no("표의 조각 " + f + " 을 못 찾았다. 이름이 바뀌었는가");
  /* **이름 없는 자리에는 까닭이 있어야 한다.** 없으면 이름을 빠뜨린 것과
     못 붙이는 것을 못 가른다. */
  const anon = SITES[f].n - SITES[f].ids.length;
  if (anon > 0 && !SITES[f].why)
    no(f + " 에 이름 없는 자리가 " + anon + "개인데 왜 그런지가 표에 없다");
});

/* ---- 2. 이름마다 갈래가 있는가 ----------------------------------------- */
const named = [];
Object.keys(SITES).forEach((f) => SITES[f].ids.forEach((x) => named.push(x)));
/* 한 자리에서 쪽을 붙여 그리는 이름은 조각에서 못 읽는다. 표가 든다. */
["xchA", "xchB", "aimA", "aimB", "wcCause", "wcLre", "wcColl", "wcFirst",
 "wcBlock", "wcOdd", "wcAsk"].forEach((x) => named.push(x));
named.forEach((id) => {
  n += 1;
  const w = WAYS[id];
  if (!w) { no("칸 " + id + " 의 갈래가 표에 없다"); return; }
  if ([K.keep, K.press, K.drop, K.read].indexOf(w.way) < 0)
    no("칸 " + id + " 의 갈래가 '" + w.way + "' 다. 넷 중 하나여야 한다");
  /* **안 남는 칸과 안 모는 칸에는 까닭이 있어야 한다** */
  if ((w.way === K.drop || w.way === K.read || !w.at) && !w.why)
    no("칸 " + id + " 이 안 남거나 안 도는 칸인데 까닭이 표에 없다");
  if (w.at && !GO[w.at]) no("칸 " + id + " 의 자리 '" + w.at + "' 로 가는 법이 없다");
  if (w.way === K.press && w.at &&
      !ADDS.some((a) => a.fields.indexOf(id) >= 0))
    no("칸 " + id + " 이 눌러서 남기는 칸인데 어느 단추인지가 표에 없다");
});
Object.keys(WAYS).forEach((id) => {
  n += 1;
  if (named.indexOf(id) < 0) no("표에만 있는 칸 " + id + " 을 조각에서 못 찾았다");
});

const censusFails = fails.length;

/* ---- 화면 판 ----------------------------------------------------------- */
function report(browserRan) {
  fails.forEach((m) => console.log("[실패] " + m));
  console.log("");
  console.log("**기계가 안 보는 것: 적은 것이 쓸 만한가**");
  console.log("적는 칸 " + n + "판 (자리 " + sites + "곳, 이름 " + named.length +
              "개" + (browserRan ? "" : ", 화면 판은 못 돌았다") + ") / 실패 " + fails.length);
  process.exit(fails.length ? 1 : 0);
}

let chromium = null;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) { chromium = null; }
if (!chromium || !fs.existsSync(CHROME)) {
  /* 앞의 판이 이미 실패했으면 건너뜀이라고 적지 않는다.
     **건너뛴 것과 실패한 것을 한 줄에 섞으면 실패가 통과처럼 보인다.** */
  if (!censusFails) console.log("[건너뜀] 브라우저가 없다: " + CHROME);
  report(false);
}

const SEED = 'localStorage.clear(); S.onboarded=true; S.names.a="가람"; ' +
             'S.names.b="나래"; S.device="a"; saveNow();';

/* 칸에 값을 넣는다. 갈래마다 넣을 것이 다르다.
   **글이 아니라 함수로 넘긴다.** 글로 넘기면 인자가 안 건너가고
   그러면 넣은 값과 읽은 값이 둘 다 undefined 가 되어 견줌이 늘 맞는다.
   그 꼴로 한 번 돌렸더니 남는 칸이 통째로 통과했다. */
const PUT = ([id, tag]) => {
  const e = document.getElementById(id);
  if (!e) return null;
  if (e.readOnly || e.disabled) return "(못 넣는 칸)";
  if (e.type === "checkbox") { e.checked = !e.checked; }
  else if (e.tagName === "SELECT") {
    const o = [].slice.call(e.options).filter((x) => x.value !== e.value)[0];
    if (!o) return "(고를 것이 하나뿐)";
    e.value = o.value;
  } else if (e.type === "number" || e.type === "range") {
    const lo = +e.min || 0, hi = e.max ? +e.max : lo + 9, st = +e.step || 1;
    e.value = String(Math.min(hi, lo + st));
  } else if (e.type === "date") {
    /* **일요일을 피한다.** 쉴 날은 앞날에만 걸리고 일요일에는 안 걸린다
       (원래 쉬는 날이다). 이레 뒤를 고르면 오늘이 일요일인 주에 늘 막힌다. */
    const d = new Date(); d.setDate(d.getDate() + 3);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    e.value = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
              "-" + String(d.getDate()).padStart(2, "0");
  } else { e.value = tag; }
  e.dispatchEvent(new Event("input", { bubbles: true }));
  e.dispatchEvent(new Event("change", { bubbles: true }));
  e.dispatchEvent(new Event("blur", { bubbles: true }));
  return e.type === "checkbox" ? (e.checked ? "켜짐" : "꺼짐") : e.value;
};
const GET = (id) => {
  const e = document.getElementById(id);
  if (!e) return "(칸이 없다)";
  return e.type === "checkbox" ? (e.checked ? "켜짐" : "꺼짐") : e.value;
};

/* **여러 줄을 한 번에 돌린다.** 문장 여럿은 식이 아니라 그대로 못 넘긴다. */
const run = (page, code) => page.evaluate("(() => { " + code + " })()");

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  const errs = [];

  async function open(at) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
                                           reducedMotion: "reduce" });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errs.push(at + ": " + e.message));
    await page.goto(PAGE);
    await run(page, SEED);
    await page.reload();
    await page.waitForTimeout(700);
    await run(page, GO[at]);
    await page.waitForTimeout(1300);
    return { ctx, page };
  }
  async function again(page, at) {
    await page.reload();
    await page.waitForTimeout(800);
    await run(page, GO[at]);
    await page.waitForTimeout(1400);
  }
  function stop(page) {
    return run(page, "T.run=false; if (T.tick) clearInterval(T.tick);");
  }

  /* ---- 3. 남는가 / 5. 안 남는가 --------------------------------------- */
  const spots = {};
  Object.keys(WAYS).forEach((id) => {
    const w = WAYS[id];
    if (!w.at) return;
    if (w.way !== K.keep && w.way !== K.drop) return;
    (spots[w.at] = spots[w.at] || []).push(id);
  });
  for (const at of Object.keys(spots)) {
    const { ctx, page } = await open(at);
    const wrote = {};
    for (const id of spots[at]) {
      const v = await page.evaluate(PUT, [id, "적은것" + id]);
      if (v === null) { no(at + " 자리에 칸 " + id + " 이 없다"); continue; }
      if (typeof v === "string" && v.startsWith("(")) {
        no("칸 " + id + " 에 값을 못 넣었다: " + v); continue;
      }
      wrote[id] = v;
    }
    await page.waitForTimeout(500);
    await run(page, "if (typeof flushSave === 'function') flushSave();");
    await page.waitForTimeout(300);
    await again(page, at);
    for (const id of Object.keys(wrote)) {
      n += 1;
      const got = await page.evaluate(GET, id);
      const keep = WAYS[id].way === K.keep;
      if (keep && got !== wrote[id])
        no("칸 " + id + " (" + at + ") 에 적은 것이 새로 고침 뒤에 없다. " +
           "적은 것은 '" + wrote[id] + "' 인데 '" + got + "' 다");
      if (!keep && got === wrote[id])
        no("칸 " + id + " (" + at + ") 은 안 남는 칸인데 '" + got + "' 이 남았다. " +
           "표의 까닭과 화면이 다르다");
    }
    await stop(page);
    await ctx.close();
  }

  /* ---- 4. 눌러서 남는가 ------------------------------------------------ */
  for (const a of ADDS) {
    const { ctx, page } = await open(a.at);
    const wrote = {};
    for (const id of a.fields) {
      const v = await page.evaluate(PUT, [id, "적은것" + id]);
      if (v === null) { no(a.what + ": 칸 " + id + " 이 없다"); continue; }
      wrote[id] = v;
    }
    n += 2;
    const hit = await page.evaluate((b) => {
      const e = document.getElementById(b);
      if (!e) return false;
      e.click();
      return true;
    }, a.btn);
    if (!hit) { no(a.what + ": 남기는 단추 " + a.btn + " 이 없다"); await ctx.close(); continue; }
    await page.waitForTimeout(500);
    /* **누르면 칸이 빈다.** 안 비면 두 사람이 같은 것을 두 번 남긴다 */
    if (a.clears) {
      for (const id of a.fields) {
        const now = await page.evaluate(GET, id);
        if (now === wrote[id])
          no(a.what + ": 남기는 단추를 눌렀는데 칸 " + id + " 이 그대로다");
      }
    }
    await run(page, "if (typeof flushSave === 'function') flushSave();");
    await page.waitForTimeout(300);
    await again(page, a.at);
    /* **innerText 가 아니라 textContent 다.** 남긴 것이 접힌 칸 안에 그려지는
       자리가 있고 (채집 표현은 `<details>` 안이다) innerText 는 접힌 것을 안 읽는다.
       그러면 남았는데도 없다고 잡는다. */
    const said = await page.evaluate(() => document.body.textContent || "");
    if (said.indexOf(wrote[a.must]) < 0)
      no(a.what + ": 남긴 것(" + wrote[a.must] + ")이 새로 고침 뒤 화면 어디에도 없다");
    await stop(page);
    await ctx.close();
  }

  /* ---- 6. 적는 도중에 칸이 안 갈리는가 (T211) --------------------------
     블록 칸은 세션이 도는 동안 자주 다시 그려진다. 그때 값을 다시 넣으면
     글자는 같아도 **커서가 끝으로 튄다.** 가운데를 고치던 손이 끝으로 밀린다.
     **기다리기만 하면 아무 일도 안 일어난다.** 여기서 직접 다시 그린다. */
  for (const [at, id] of TYPING) {
    const { ctx, page } = await open(at);
    n += 3;
    /* 먼저 한 번 적고 저장까지 시킨다. 그다음 **저장이 아직 안 따라온 사이**를
       만든다. 손으로 치는 동안이 늘 그 사이다. 저장은 120밀리초를 미룬다.
       그때 다시 그리면서 앱이 옛 값을 덮으면 치던 글이 사라진다. */
    const put = await page.evaluate((f) => {
      const e = document.getElementById(f);
      if (!e) return null;
      e.focus(); e.value = "가나다";
      e.dispatchEvent(new Event("input", { bubbles: true }));
      return e.tagName === "TEXTAREA" || e.type === "text";
    }, id);
    if (put === null) {
      no("적는 중 판: " + at + " 에 칸 " + id + " 이 없다"); await ctx.close(); continue;
    }
    await page.waitForTimeout(400);
    await page.evaluate(([f, caret]) => {
      const e = document.getElementById(f);
      e.focus(); e.value = "가나다라마바";     /* 이어서 치는 중. 아직 안 알렸다 */
      if (caret) e.setSelectionRange(3, 3);
    }, [id, put]);
    await run(page, "for (var i = 0; i < 3; i++) renderBlockPane();");
    await page.waitForTimeout(600);       // 그린 뒤에 값을 넣는 자리가 돌 틈
    const got = await page.evaluate((f) => {
      const e = document.getElementById(f);
      if (!e) return null;
      return { v: e.value, sel: e.selectionStart, on: document.activeElement === e };
    }, id);
    if (!got) no("적는 중 판: 칸 " + id + " 이 다시 그리면서 사라졌다");
    else {
      if (got.v !== "가나다라마바")
        no("칸 " + id + " 이 적는 도중에 갈렸다. 치던 '가나다라마바' 가 '" + got.v +
           "' 가 됐다. 다시 그리면서 앱이 옛 값을 덮었다 (T211)");
      if (put && got.sel !== 3)
        no("칸 " + id + " 의 커서가 " + got.sel + "번째로 튀었다. 3번째에 있었다 (T211)");
      if (!got.on) no("칸 " + id + " 에서 손이 떨어졌다. 다시 그리면서 초점을 잃었다");
    }
    await stop(page);
    await ctx.close();
  }

  /* ---- 7. 다시 그려도 안 지워지는가 ------------------------------------
     판 화면은 시계가 다 되면 통째로 다시 그린다. 적은 글을 판이 안 들고 있으면
     **5분을 적은 것이 그 순간 사라진다.** 저장소에 안 남기는 것과는 다른 일이다. */
  for (const [at, id] of REDRAW) {
    const { ctx, page } = await open(at);
    n += 1;
    const put = await page.evaluate((f) => {
      const e = document.getElementById(f);
      if (!e) return false;
      e.value = "적은답";
      e.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    }, id);
    if (!put) { no("다시 그리기 판: " + at + " 에 칸 " + id + " 이 없다"); await ctx.close(); continue; }
    await page.waitForTimeout(400);
    await run(page, "renderPlayTab();");
    await page.waitForTimeout(700);
    const got = await page.evaluate(GET, id);
    if (got !== "적은답")
      no("판 " + at + " 의 칸 " + id + " 이 다시 그리면서 지워졌다: '" + got + "'");
    await ctx.close();
  }

  n += 1;
  if (errs.length) no("적는 동안 화면이 " + errs.length + "번 멎었다: " + errs[0]);

  await browser.close();
  report(true);
})().catch((e) => { console.log("[실패] " + e.message); process.exit(1); });
