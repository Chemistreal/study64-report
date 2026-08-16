/* 둥근 모서리 단 (T406).
 *
 * `check_space.js` 가 여백에 한 것을 모서리에 한다. 열다섯 가지였다.
 * `2 3 5 7 8 9 10 11 12 13 14 16 18 99 999` 이다.
 *
 * **모서리에서 1px 은 나란히 놓지 않으면 안 보인다.** 여백과 같은 자리다.
 * 9px 칸과 10px 칸을 위아래로 놓고 봐도 어느 쪽이 더 둥근지 못 고른다.
 * 그런데 그 둘이 각각 열 곳 스무 곳에 있었다.
 *
 * ## 세는 것이 아니라 막는다
 *
 * T389 가 활자 단을 세어 두기만 했더니 스물아홉이 서른넷이 됐다 (T404).
 * 그래서 이 판도 센 값을 안 적고 **단 밖의 값을 실패로 낸다.**
 *
 * ## 같은 말을 두 가지로 하면 하나는 습관이다
 *
 * `99px` 과 `999px` 은 둘 다 "완전히 둥글게" 다. 그런데 열넷과 하나로 갈려 있었다.
 * 두 값이 다르게 보이는 자리는 지금 없다. CSS 가 반지름이 변보다 크면 변에 맞춰
 * 줄이기 때문이다. **보이지 않는 차이를 두 이름으로 들고 있으면 고를 때 헷갈린다.**
 * `--rfull` 하나로 합쳤고 여기서 다시 갈리는 것을 막는다.
 *
 * ## `--rfull` 은 단이 아니다
 *
 * 그래서 이름이 `--r10` 이 아니다. `--r9` 다음이 `--r10` 이면 18px 과 999px
 * 사이에 단이 있는 것처럼 보인다. 없다. **알약은 사다리 맨 윗칸이 아니라 사다리 밖이다.**
 * 이 판은 사다리와 사다리 밖을 따로 잰다.
 *
 * ## `50%` 는 남긴다
 *
 * 원 세 자리다. 다 정사각이라 `var(--rfull)` 과 똑같이 그려지지만
 * `50%` 는 **정사각이 아니게 되면 타원이 된다.** 알약은 그때 알약으로 남는다.
 * 그 자리들이 원이라고 적혀 있는 편이 낫다. 값으로 적어 두고 개수를 잰다.
 *
 * **기계가 안 보는 것: 그 둥글기가 이 칸을 누를 것으로 보이게 하는가.**
 *
 * 사용법:
 *     node scripts/check_radius.js
 *
 * 규격: docs/roadmap.md 12.18
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const STYLE = path.join(ROOT, "app", "style");
const TOKENS = path.join(STYLE, "01_tokens.css");

/* 모서리를 안 둥글게 하는 자리와 원. **개수가 아니라 값을 적는다.**
   `check_space.js` 가 T405 에 개수만 세다가 `60px` 을 `64px` 로 바꾸는 깸을
   놓쳤다. 가짓수는 그대로 일곱이었기 때문이다. 여기서는 값을 적는다.

     0      네 귀 중 안 둥글게 두는 귀. `.note` 의 왼쪽과 바닥 링크의 위쪽
     50%    원. 세 자리고 다 정사각이다 (`.aurora i` `.doneorb` `.donering`)

   `0` 은 어느 칸에 몇 개가 오는지가 자리마다 다르므로 개수를 안 박는다.
   `50%` 는 셋으로 박는다. **넷이 되면 그것이 정말 원인지 사람이 본다.** */
const OK_RAW = { "0": null, "50%": 3 };

/* 모서리 속성 전부. `border-radius` 한 줄로 적는 것이 지금의 전부지만
   `border-top-left-radius` 로 적으면 위 정규식이 조용히 못 본다. 같이 잡는다. */
const PROP = /\bborder-(?:(?:top|bottom)-(?:left|right)-|(?:start|end)-(?:start|end)-)?radius\s*:\s*([^;}\n]+)/g;

const fails = [];
let n = 0;

function tokens() {
  const src = fs.readFileSync(TOKENS, "utf8");
  const step = {};
  let full = null;
  let m;
  const re = /--(r\d+):\s*(\d+)px\s*;/g;
  while ((m = re.exec(src))) step[m[1]] = +m[2];
  const fm = /--rfull:\s*(\d+)px\s*;/.exec(src);
  if (fm) full = +fm[1];
  return { step: step, full: full };
}

const T = tokens();
n += 4;
if (Object.keys(T.step).length < 5) {
  console.log("[실패] 01_tokens.css 에서 --rN 단을 못 읽었다");
  process.exit(1);
}
/* **완전히 둥근 자리에 이름이 있어야 한다.** 없으면 그 자리가 다시 낱값이 된다 */
if (T.full === null) {
  console.log("[실패] 01_tokens.css 에 --rfull 이 없다. 알약 꼴이 갈 자리가 없다");
  process.exit(1);
}
/* **99px 은 높이가 198px 을 넘는 칸에서 알약이 아니라 둥근 네모가 된다.**
   지금 그런 칸이 없어서 안 보일 뿐이다. 그 칸이 생기면 조용히 어긋난다. */
if (T.full < 999)
  fails.push("--rfull 이 " + T.full + "px 다. 999px 아래면 큰 칸에서 알약이 안 된다");
/* **단이 다시 늘어나는 것을 막는다.** 아홉이 스물이 되면 접은 뜻이 없다 */
if (Object.keys(T.step).length > 10)
  fails.push("모서리 단이 " + Object.keys(T.step).length + "개다. 아홉으로 접어 뒀다");
/* **같은 둥글기를 두 이름으로 두지 않는다.** 두면 고를 때 또 헷갈린다 */
{
  const seen = {};
  Object.keys(T.step).forEach((k) => {
    if (seen[T.step[k]])
      fails.push("--" + k + " 와 --" + seen[T.step[k]] + " 가 같은 " + T.step[k] + "px 다");
    seen[T.step[k]] = k;
  });
  n += 1;
  if (Object.keys(T.step).some((k) => T.step[k] === T.full))
    fails.push("--rfull 과 같은 값을 가진 단이 있다. 알약이 두 이름이 된다");
}
/* **1px 간격이 다시 생기는 것을 막는다.** 그것이 이 판을 만든 까닭이다 */
const ladder = Object.keys(T.step).map((k) => ({ k: k, v: T.step[k] })).sort((a, b) => a.v - b.v);
for (let i = 1; i < ladder.length; i++) {
  n += 1;
  const d = ladder[i].v - ladder[i - 1].v;
  if (d < 2)
    fails.push("--" + ladder[i - 1].k + "(" + ladder[i - 1].v + "px) 와 --" + ladder[i].k +
               "(" + ladder[i].v + "px) 가 " + d + "px 차이다. 나란히 놓지 않으면 안 보인다");
}
/* **사다리는 이름 순서와 값 순서가 같아야 한다.** `--r7` 이 `--r5` 보다 작으면
   가장 가까운 단을 고르는 일이 이름으로 안 된다. 그러면 다시 값을 적게 된다. */
{
  n += 1;
  const byName = Object.keys(T.step).sort((a, b) => +a.slice(1) - +b.slice(1));
  const byVal = ladder.map((x) => x.k);
  if (byName.join(" ") !== byVal.join(" "))
    fails.push("단 이름 차례와 값 차례가 다르다: " + byName.join(" ") + " / " + byVal.join(" "));
}

/* 조각마다 훑는다. **파생물이 아니라 조각을 본다** (T404 와 같다).
   `english.html` 만 보면 조각에만 있는 자리를 못 본다. */
const files = fs.readdirSync(STYLE).filter((f) => f.endsWith(".css")).sort();
n += 1;
if (files.length < 3) fails.push("app/style 에서 조각을 " + files.length + "개만 찾았다");

const raw = {};
const used = {};
files.forEach((f) => {
  const src = fs.readFileSync(path.join(STYLE, f), "utf8");
  PROP.lastIndex = 0;
  let m;
  while ((m = PROP.exec(src))) {
    const line = src.slice(0, m.index).split("\n").length;
    const where = f + ":" + line;
    /* 한 줄에 값이 넷까지 온다 (`0 var(--r5) var(--r5) 0`). 낱낱이 본다.
       `/` 는 가로세로를 따로 주는 자리라 같이 가른다. */
    m[1].trim().split(/[\s/]+/).filter(Boolean).forEach((v) => {
      n += 1;
      const vm = /^var\(--(r\d+|rfull)\)$/.exec(v);
      if (vm) {
        /* 있는 단을 가리키는가. **없는 토큰은 조용히 비어서 모서리가 각지게 된다** (T223) */
        if (vm[1] === "rfull") { used.rfull = (used.rfull || 0) + 1; return; }
        if (!(vm[1] in T.step)) { fails.push(where + " 이 없는 단 --" + vm[1] + " 을 쓴다"); return; }
        used[vm[1]] = (used[vm[1]] || 0) + 1;
        return;
      }
      if (v in OK_RAW) { (used[v] = (used[v] || 0) + 1); return; }
      (raw[v] = raw[v] || []).push(where);
    });
  }
});

Object.keys(raw).forEach((v) => {
  fails.push("단 밖의 모서리 `" + v + "` 이 " + raw[v].length + "곳에 있다 (" +
             raw[v].slice(0, 3).join(" ") + "). 01_tokens.css 의 --rN 에서 고른다");
});

/* **적어 둔 값의 개수도 본다.** 값만 적고 개수를 안 박으면 `50%` 가 하나 더
   생겨도 목록은 그대로 맞다. 그 하나가 정사각이 아닐 수 있다. */
n += 1;
Object.keys(OK_RAW).forEach((v) => {
  if (OK_RAW[v] === null) return;
  const c = used[v] || 0;
  if (c !== OK_RAW[v])
    fails.push("`" + v + "` 이 " + c + "곳이다. " + OK_RAW[v] + "곳으로 적어 뒀다. " +
               "늘었으면 그것이 정말 원인지 보고 check_radius.js 의 OK_RAW 에 고쳐 적는다");
});

/* **안 쓰는 단이 남으면 그 사다리가 거짓이 된다.** `check_space.js` 의
   `gone` 과 같은 자리다. 다음 사람이 안 쓰는 칸을 세고 아홉이라고 믿는다. */
n += 1;
{
  const dead = Object.keys(T.step).filter((k) => !used[k]);
  if (dead.length)
    fails.push("안 쓰는 단이 있다: " + dead.map((k) => "--" + k).join(" ") +
               ". 01_tokens.css 에서 뺀다");
  if (!used.rfull) fails.push("--rfull 을 쓰는 자리가 없다. 01_tokens.css 에서 뺀다");
}

console.log("  단 " + ladder.map((x) => "--" + x.k + "(" + x.v + "px:" + (used[x.k] || 0) + ")").join(" "));
console.log("  --rfull(" + T.full + "px:" + (used.rfull || 0) + ")  " +
            Object.keys(OK_RAW).map((v) => "`" + v + "`(" + (used[v] || 0) + ")").join(" "));

fails.forEach((m) => console.log("[실패] " + m));
console.log("");
console.log("**기계가 안 보는 것: 그 둥글기가 이 칸을 누를 것으로 보이게 하는가**");
console.log("모서리 " + n + "판 (단 " + Object.keys(T.step).length + "개, 조각 " +
            files.length + "개) / 실패 " + fails.length);
process.exit(fails.length ? 1 : 0);
