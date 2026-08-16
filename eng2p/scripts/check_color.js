/* 색 낱값 (T407).
 *
 * `check_type.js` 가 활자에, `check_space.js` 가 여백에, `check_radius.js` 가
 * 모서리에 한 것을 색에 한다. `#rrggbb` 낱값이 서른다섯 가지였다.
 *
 * 색은 앞의 셋과 다르다. **토큰이 이미 있었다.** `--a1 --a2 --b1 --sub` 가
 * T223 과 T389 에 이미 정리됐다. 그런데도 그 밖에서 직접 적는 자리가
 * 스물세 곳 남아 있었다. 단이 없어서가 아니라 **단을 안 거치고 적어서**다.
 *
 * ## 세는 것이 아니라 막는다
 *
 * T389 가 활자 단을 세어 두기만 했더니 스물아홉이 서른넷이 됐다 (T404).
 * 색도 같다. `--b1` 을 만들 때 B 의 색이 다섯 가지였다. 세어 두면 는다.
 *
 * ## 종이는 화면 토큰을 안 따른다
 *
 * `@media print` 안의 `#000` 과 `#fff` 는 **그대로 두는 것이 맞다.**
 * 인쇄 규칙이 하는 일이 바로 화면 색 토큰을 순백과 순흑으로 되돌리는 것이다.
 * 거기서 토큰을 쓰면 그 토큰이 다시 화면 색을 가리켜 아무 일도 안 일어난다.
 * 그래서 이 판은 인쇄 안과 밖을 갈라 잰다. **밖은 하나도 허용 안 한다.**
 *
 * ## 허용 목록은 개수가 아니라 값이다
 *
 * `check_space.js` 가 T405 에 큰 여백을 가짓수로만 셌다. 그랬더니 `60px` 을
 * `64px` 로 바꾸는 깸이 안 잡혔다. 가짓수는 그대로 일곱이었기 때문이다.
 * 여기서는 **값과 자리 수를 같이 적는다.** 인쇄 규칙을 손보면 여기서 걸리고
 * 걸리면 그 색이 종이에서 정말 그래야 하는지 사람이 한 번 본다.
 *
 * ## 같은 값을 두 이름으로 두는 것이 색에서는 옳다
 *
 * 그래서 활자와 여백 판에 있는 "같은 값 두 이름" 검사가 여기엔 없다.
 * `--warn` 과 `--warnbg1` 은 둘 다 `#c2185b` 다. 값이 같지만 뜻이 다르다.
 * `--warn` 은 짙은 판에서 `#f472b6` 으로 밝아지고 `--warnbg1` 은 안 밝아진다.
 * **흰 글자를 얹는 바탕이기 때문이다.** 값이 같다고 합치면 짙은 판을
 * 손볼 때 조용히 따라 바뀌고 그 위의 글자가 안 읽힌다 (T338 이 그 자리다).
 *
 * 15px 과 15px 은 같은 크기지만 `#c2185b` 와 `#c2185b` 는 같은 색이 아니다.
 *
 * ## 이 판이 아직 안 보는 것
 *
 * `rgba()` 낱값은 안 본다. 그림자와 반투명 테두리와 오로라가 거기 있는데
 * 그것은 색이라기보다 겹침이고, 겹치는 값은 밑에 무엇이 있느냐로 정해진다.
 * 이름을 주려면 무엇 위에 얹는지를 먼저 갈라야 한다. 그 판은 아직 없다.
 *
 * **기계가 안 보는 것: 그 색이 누구를 가리키는가.**
 *
 * 사용법:
 *     node scripts/check_color.js
 *
 * 규격: docs/roadmap.md 12.18
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const APP = path.join(ROOT, "app");
const STYLE = path.join(APP, "style");

/* 인쇄 규칙 안에서 허용하는 낱값. **값과 자리 수를 같이 적는다.**
   여기 있는 것은 다 `@media print` 안에 있어야 한다. 밖으로 나가면 실패다.

     #fff  11  종이 바탕. `--bg --bg2 --card --card2 --sub` 를 순백으로 되돌린다
     #000  19  종이 글자. `--fg` 와 강조색 일곱을 순흑으로. 근거 인용과 주 띠도
     #444   1  흐린 글자 (`--mut`). 순흑보다 옅게 찍어 본문과 가른다
     #999   4  선과 테두리 (`--edge`). 잉크를 덜 먹는다
     #bbb   1  더 옅은 선 (`--line`)
     #ddd   1  주 띠의 안 지난 칸. 지난 칸이 `#000` 이라 갈려 보여야 한다
     #333   1  판 목록의 흐린 글자. 종이에서 단추는 누를 것이 아니라 읽을 것이다

   자리 수가 바뀌면 걸린다. **그것이 걸리라고 적은 숫자다.**
   인쇄 규칙을 손봤으면 여기도 손본다. 손보면서 그 색이 종이에서
   정말 그래야 하는지 한 번 본다. 그 한 번이 이 표의 값이다. */
const PRINT_OK = { "#fff": 11, "#000": 19, "#444": 1, "#999": 4, "#bbb": 1, "#ddd": 1, "#333": 1 };

/* 인쇄 밖에서 허용하는 낱값. **비어 있다.**
   화면의 색은 다 토큰을 거친다. 여기에 뭔가 적히려 하면 그 색에
   먼저 이름이 있어야 하는 것 아닌지 본다. */
const SCREEN_OK = {};

/* `var(--w,1)` 처럼 기본값을 달고 JS 가 채우는 자리. 이 판이 정의를 못 찾아도 맞다 */
const HEX = /#[0-9a-fA-F]{3,8}\b/g;

const fails = [];
let n = 0;

/* `@media print{...}` 의 범위. 중괄호를 세어 닫는 자리를 찾는다.
   **주석이 목록 가운데 끼면 CSS 는 이어 붙인다** (T393). 그 판이 인쇄에서 났다. */
function printRanges(src) {
  const out = [];
  const re = /@media\s+print\s*\{/g;
  let m;
  while ((m = re.exec(src))) {
    let i = m.index + m[0].length, d = 1;
    while (i < src.length && d > 0) {
      if (src[i] === "{") d++;
      else if (src[i] === "}") d--;
      i++;
    }
    out.push([m.index, i]);
  }
  return out;
}

function walk(dir, cb) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, cb);
    else cb(p);
  });
}

/* ---------- 1. 조각의 낱값을 인쇄 안과 밖으로 가른다 ---------- */
const files = fs.readdirSync(STYLE).filter((f) => f.endsWith(".css")).sort();
n += 1;
if (files.length < 3) fails.push("app/style 에서 조각을 " + files.length + "개만 찾았다");

const inPrint = {};
const onScreen = {};
let printBlocks = 0;

files.forEach((f) => {
  const src = fs.readFileSync(path.join(STYLE, f), "utf8");
  const pr = printRanges(src);
  printBlocks += pr.length;
  HEX.lastIndex = 0;
  let m;
  while ((m = HEX.exec(src))) {
    const idx = m.index;
    const line = src.slice(0, idx).split("\n").length;
    const where = f + ":" + line;
    /* 주석 안의 색은 값이 아니라 글이다. 왜 이 색인지를 적어 둔 자리다 */
    const cs = src.lastIndexOf("/*", idx), ce = src.lastIndexOf("*/", idx);
    if (cs > ce) continue;
    n += 1;
    /* 토큰을 정의하는 자리인가. `--이름:` 이 바로 앞에 있으면 그것이 이름 짓는 자리다 */
    const seg = src.slice(Math.max(src.lastIndexOf(";", idx), src.lastIndexOf("{", idx),
                                   src.lastIndexOf("\n", idx)) + 1, idx);
    const isDef = /--[\w-]+\s*:/.test(seg);
    const v = m[0].toLowerCase();
    if (pr.some((r) => idx >= r[0] && idx < r[1])) { (inPrint[v] = inPrint[v] || []).push(where); continue; }
    if (isDef) continue;
    (onScreen[v] = onScreen[v] || []).push(where);
  }
});

/* **인쇄 규칙이 사라지면 이 판이 조용히 헐거워진다.** 그러면 `#000` 열아홉이
   화면 낱값이 되고 아래에서 다 걸린다. 그래도 까닭을 따로 적어 준다. */
n += 1;
if (printBlocks < 1) fails.push("app/style 에 @media print 가 하나도 없다. 인쇄 예외를 잴 수 없다");

/* ---------- 2. 화면 낱값은 하나도 허용 안 한다 ---------- */
n += 1;
Object.keys(onScreen).sort().forEach((v) => {
  if (v in SCREEN_OK && SCREEN_OK[v] === onScreen[v].length) return;
  fails.push("토큰 밖 색 `" + v + "` 이 " + onScreen[v].length + "곳에 있다 (" +
             onScreen[v].slice(0, 3).join(" ") + "). 01_tokens.css 에서 이름을 주고 var 로 쓴다");
});

/* ---------- 3. 인쇄 낱값은 값과 자리 수로 잰다 ---------- */
n += 2;
{
  const now = Object.keys(inPrint).sort();
  const listed = Object.keys(PRINT_OK).sort();
  now.forEach((v) => {
    if (!(v in PRINT_OK)) {
      fails.push("인쇄 규칙에 적어 두지 않은 색 `" + v + "` 이 " + inPrint[v].length +
                 "곳에 생겼다 (" + inPrint[v].slice(0, 3).join(" ") +
                 "). 종이에서 그 색이 맞는지 보고 check_color.js 의 PRINT_OK 에 뜻과 함께 적는다");
      return;
    }
    n += 1;
    if (inPrint[v].length !== PRINT_OK[v])
      fails.push("인쇄 규칙의 `" + v + "` 이 " + inPrint[v].length + "곳이다. " +
                 PRINT_OK[v] + "곳으로 적어 뒀다. 인쇄를 손봤으면 PRINT_OK 도 손본다");
  });
  /* **없어진 것도 잡는다.** 안 쓰는 값이 목록에 남으면 그 목록이 거짓이 된다 */
  listed.filter((v) => now.indexOf(v) < 0).forEach((v) => {
    fails.push("적어 둔 인쇄 색 `" + v + "` 이 안 쓰인다. PRINT_OK 에서 뺀다");
  });
}

/* ---------- 4. 이름을 지어 놓고 안 쓰거나, 없는 이름을 쓰거나 ---------- */
/* **없는 토큰은 조용히 비어서 그 자리가 안 그려진다** (T223). `--sub` 가 다섯
   자리에서 그랬다. 반대로 지어 놓고 아무도 안 쓰는 이름은 목록을 거짓으로 만든다.
   쓰는 자리는 조각 밖에도 있다. `--ring1` 은 `app/body/02_today.html` 의
   SVG 그러데이션에서만 쓴다. **그래서 app 전체를 훑는다.** */
const def = {};
const use = {};
walk(APP, (p) => {
  if (!/\.(css|html|js)$/.test(p)) return;
  const src = fs.readFileSync(p, "utf8");
  const rel = path.relative(APP, p);
  let m;
  if (p.endsWith(".css")) {
    const d = /(^|[;{\s])(--[\w-]+)\s*:/g;
    while ((m = d.exec(src))) def[m[2]] = true;
  }
  const u = /var\(\s*(--[\w-]+)\s*([,)])/g;
  while ((m = u.exec(src))) {
    const line = src.slice(0, m.index).split("\n").length;
    (use[m[1]] = use[m[1]] || []).push({ w: rel + ":" + line, fb: m[2] === "," });
  }
});
n += 2;
Object.keys(use).forEach((k) => {
  if (k in def) return;
  /* 기본값을 달고 JS 가 채우는 자리는 맞다. `.steps div` 의 `--w` 가 그것이다 */
  const bare = use[k].filter((x) => !x.fb);
  if (bare.length)
    fails.push("없는 토큰 `" + k + "` 을 쓴다 (" + bare.slice(0, 3).map((x) => x.w).join(" ") +
               "). 조용히 비어서 그 자리가 안 그려진다");
});
Object.keys(def).forEach((k) => {
  n += 1;
  if (!use[k]) fails.push("지어 놓고 아무 데서도 안 쓰는 토큰 `" + k + "` 이 있다. 01_tokens.css 에서 뺀다");
});

console.log("  인쇄 안 " + Object.keys(inPrint).length + "가지: " +
            Object.keys(inPrint).sort().map((v) => v + "(" + inPrint[v].length + ")").join(" "));
console.log("  인쇄 밖 " + Object.keys(onScreen).length + "가지" +
            (Object.keys(onScreen).length ? ": " + Object.keys(onScreen).sort().join(" ") : " (토큰을 다 거친다)"));
console.log("  토큰 " + Object.keys(def).length + "개, 쓰는 이름 " + Object.keys(use).length + "개");

fails.forEach((m) => console.log("[실패] " + m));
console.log("");
console.log("**기계가 안 보는 것: 그 색이 누구를 가리키는가**");
console.log("색 " + n + "판 (조각 " + files.length + "개, 인쇄 블록 " + printBlocks +
            "개) / 실패 " + fails.length);
process.exit(fails.length ? 1 : 0);
