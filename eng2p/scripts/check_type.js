/* 활자 단 (T404).
 *
 * T389 가 활자 단을 세고 스물아홉이라고 적고 남겨 뒀다.
 * T404 에 다시 세니 **서른넷이었다.** 세어 두기만 하면 는다.
 *
 * 그중 스물둘이 0.5px 간격이다. `0.71875rem` 은 11.5px 이고
 * `0.75rem` 은 12px 이다. **그 둘을 가르는 눈이 없다.**
 *
 * 가르지도 못하는 것을 서른네 벌 들고 있으면 새 칸을 만들 때
 * 가장 가까운 것을 고르는 대신 새 값을 적게 된다. 서른넷이 그렇게 늘었다.
 *
 * ## 세는 것이 아니라 막는 것이다
 *
 * 이 판이 T389 와 다른 자리가 여기다. T389 는 세었고 이 판은 **막는다.**
 * `01_tokens.css` 의 `--fsN` 밖에 있는 값이 하나라도 있으면 실패다.
 * 그러면 다음 사람이 새 값을 적을 수 없고 가장 가까운 단을 고르게 된다.
 *
 * ## px 로 적으면 글자 크기를 키워도 그 자리만 안 커진다
 *
 * `html{font-size}` 세 단이 `rem` 을 통째로 끌고 간다.
 * `px` 로 적힌 자리는 그 줄을 바꿔도 안 바뀌고, 두 사람이 글자를 키우면
 * **그 자리만 작은 채로 남는다.** 그것도 여기서 잡는다.
 *
 * **기계가 안 보는 것: 그 크기 차이가 뜻을 나르는가.**
 *
 * 사용법:
 *     node scripts/check_type.js
 *
 * 규격: docs/roadmap.md 12.18
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const STYLE = path.join(ROOT, "app", "style");
const TOKENS = path.join(STYLE, "01_tokens.css");

const fails = [];
let n = 0;

/* `html{font-size}` 세 단은 기준이라 `px` 여야 한다. `rem` 으로 적으면
   저를 저로 재게 된다. `font-size:0` 은 크기가 아니라 글자를 지우는 자리다
   (선으로 그린 화살표 단추). `clamp()` 는 화면 폭을 따라가는 자리다. */
const OK_RAW = ["16px", "17.6px", "19.2px", "0"];

function tokens() {
  const src = fs.readFileSync(TOKENS, "utf8");
  const out = {};
  const re = /--(fs\d+):\s*([\d.]+rem)\s*;/g;
  let m;
  while ((m = re.exec(src))) out[m[1]] = m[2];
  return out;
}

const T = tokens();
n += 3;
if (Object.keys(T).length < 5) {
  console.log("[실패] 01_tokens.css 에서 --fsN 단을 못 읽었다");
  process.exit(1);
}
/* **단이 다시 늘어나는 것을 막는다.** 열셋이 스물이 되면 접은 뜻이 없다 */
if (Object.keys(T).length > 14)
  fails.push("활자 단이 " + Object.keys(T).length + "개다. 열셋으로 접어 뒀다");
/* **같은 크기를 두 이름으로 두지 않는다.** 두면 고를 때 또 헷갈린다 */
{
  const seen = {};
  Object.keys(T).forEach((k) => {
    if (seen[T[k]]) fails.push("--" + k + " 와 --" + seen[T[k]] + " 가 같은 " + T[k] + " 다");
    seen[T[k]] = k;
  });
}
/* **0.5px 간격이 다시 생기는 것을 막는다.** 그것이 이 판을 만든 까닭이다.
   16px 을 곱해 px 로 본다. 두 단이 1px 보다 가까우면 가르는 눈이 없다. */
{
  const px = Object.keys(T).map((k) => ({ k: k, v: parseFloat(T[k]) * 16 }));
  px.sort((a, b) => a.v - b.v);
  for (let i = 1; i < px.length; i++) {
    n += 1;
    const d = px[i].v - px[i - 1].v;
    if (d < 1)
      fails.push("--" + px[i - 1].k + "(" + px[i - 1].v + "px) 와 --" + px[i].k +
                 "(" + px[i].v + "px) 가 " + d + "px 차이다. 그 둘을 가르는 눈이 없다");
  }
}

/* 조각마다 훑는다. **파생물이 아니라 조각을 본다** (T399 와 같다).
   `english.html` 만 보면 조각에만 있는 자리를 못 본다. */
const files = fs.readdirSync(STYLE).filter((f) => f.endsWith(".css")).sort();
n += 1;
if (files.length < 3) fails.push("app/style 에서 조각을 " + files.length + "개만 찾았다");

const raw = {};
files.forEach((f) => {
  const src = fs.readFileSync(path.join(STYLE, f), "utf8");
  const re = /font-size:\s*([^;}\n]+)/g;
  let m;
  while ((m = re.exec(src))) {
    n += 1;
    const v = m.group === undefined ? m[1].trim() : m[1].trim();
    if (/^var\(--fs\d+\)$/.test(v)) {
      /* 있는 토큰을 가리키는가. **없는 토큰은 조용히 비어서 안 그려진다** (T223) */
      const name = v.replace(/^var\(--/, "").replace(/\)$/, "");
      if (!(name in T)) fails.push(f + " 가 없는 단 --" + name + " 을 쓴다");
      continue;
    }
    if (v.startsWith("clamp(")) continue;
    if (OK_RAW.indexOf(v) >= 0) continue;
    const line = src.slice(0, m.index).split("\n").length;
    (raw[v] = raw[v] || []).push(f + ":" + line);
  }
});
Object.keys(raw).forEach((v) => {
  fails.push("단 밖의 값 `" + v + "` 이 " + raw[v].length + "곳에 있다 (" +
             raw[v].slice(0, 3).join(" ") + "). 01_tokens.css 의 --fsN 에서 고른다");
});

/* **`px` 로 적힌 자리가 있으면 글자를 키워도 그 자리만 안 커진다.**
   위에서 이미 걸리지만 까닭이 다르므로 따로 적는다. */
n += 1;
{
  const bad = Object.keys(raw).filter((v) => /^\d+(\.\d+)?px$/.test(v));
  if (bad.length)
    fails.push("px 로 적힌 크기가 있다: " + bad.join(" ") +
               ". 두 사람이 글자를 키워도 그 자리만 안 커진다");
}

/* **화면 글자 크기의 기준은 `px` 여야 한다.** `rem` 으로 적으면 저를 저로 잰다 */
n += 1;
{
  const src = fs.readFileSync(TOKENS, "utf8");
  const m = /html\{font-size:([^;}]+)\}/.exec(src);
  if (!m) fails.push("01_tokens.css 에 html{font-size} 기준이 없다");
  else if (!/px$/.test(m[1].trim()))
    fails.push("html{font-size} 가 " + m[1] + " 다. 기준은 px 여야 한다");
}

fails.forEach((m) => console.log("[실패] " + m));
console.log("");
console.log("**기계가 안 보는 것: 그 크기 차이가 뜻을 나르는가**");
console.log("활자 " + n + "판 (단 " + Object.keys(T).length + "개, 조각 " +
            files.length + "개) / 실패 " + fails.length);
process.exit(fails.length ? 1 : 0);
