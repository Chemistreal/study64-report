/* 여백 단 (T405).
 *
 * `check_type.js` 가 활자에서 한 것을 여백에 한다. 서른한 가지였다.
 * `8 9 10 11 12` 가 다섯 단이고 서로 1px 차이다.
 * **여백에서 1px 은 나란히 놓지 않으면 안 보인다.**
 *
 * 활자에서 0.5px 을 없앤 것과 같은 자리다. 가르지도 못하는 것을 서른한 벌
 * 들고 있으면 새 칸을 만들 때 가장 가까운 것을 고르는 대신 새 값을 적게 된다.
 *
 * ## 세는 것이 아니라 막는다
 *
 * T389 가 활자 단을 세어 두기만 했더니 스물아홉이 서른넷이 됐다 (T404).
 * 그래서 이 판도 센 값을 안 적고 **단 밖의 값을 실패로 낸다.**
 *
 * ## 큰 값은 여백이 아니라 자리다
 *
 * `110px` 은 아래 탭바가 앉을 자리고 `112px` 은 머리띠 높이다.
 * 그것을 여백 단에 넣으면 단이 스물이 되고 단이 스물이면 단이 아니다.
 * **32px 을 선으로 삼는다.** 그 위는 자리로 세고 개수에 선을 건다.
 * 새 자리가 생기면 여기서 걸리고, 걸리면 그것이 정말 자리인지 사람이 본다.
 *
 * ## 크기를 지키는 값은 여백에 안 맡긴다
 *
 * 이 판을 만들면서 48주 띠가 43px 이 됐다. 그 단추는 높이를 안 적고
 * 안쪽 여백이 정하게 뒀는데 여백이 1px 줄자 44px 선에 걸렸다.
 * `min-height` 로 못 박았다. **여백으로 터치 크기를 맞추면 다음에 또 깨진다.**
 *
 * **기계가 안 보는 것: 그 틈이 두 칸을 갈라 보이게 하는가.**
 *
 * 사용법:
 *     node scripts/check_space.js
 *
 * 규격: docs/roadmap.md 12.18
 */
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const STYLE = path.join(ROOT, "app", "style");
const TOKENS = path.join(STYLE, "01_tokens.css");

/* 여백 단과 자리를 가르는 선. 이 아래는 단이고 이 위는 자리다 */
const BIG = 32;
/* 자리가 무엇무엇인가. **개수가 아니라 값을 적는다.**

   처음에는 가짓수만 셌다. 그랬더니 `60px` 을 `64px` 로 바꾸는 깸이 안 잡혔다.
   가짓수는 그대로 일곱이기 때문이다. **개수만 세면 값이 바뀌는 것을 못 잡는다.**
   `check_scale.js` 가 T402 에 같은 자리에서 걸렸다.

   일곱이고 다 뜻이 있다.

     112px  머리띠 높이. 앵커로 뛸 때 그만큼 비운다 (`scroll-padding-top`)
     110px  아래 탭바가 앉을 자리. 본문이 그 밑으로 안 간다
     100px  같은 자리의 좁은 화면 판
      82px  같은 자리의 인쇄 판
      60px  바닥글 위 틈
      40px  h2 위 틈. 장이 갈리는 자리다
      34px  파일 받는 칸. 손가락으로 끌어 놓는 자리라 넓다

   처음에 여섯으로 셌다가 `scroll-padding-top` 을 빼먹은 것을 여기서 알았다.
   **세다 빠뜨린 것을 검사가 잡았다.** 그것이 이 선을 두는 값이다. */
const BIG_OK = [34, 40, 60, 82, 100, 110, 112];

const PROP = /\b(padding|margin|gap|row-gap|column-gap)(-(?:top|bottom|left|right|inline|block|inline-start|inline-end|block-start|block-end))?\s*:\s*([^;}\n]+)/g;

const fails = [];
let n = 0;

function tokens() {
  const src = fs.readFileSync(TOKENS, "utf8");
  const out = {};
  const re = /--(sp\d+):\s*(\d+)px\s*;/g;
  let m;
  while ((m = re.exec(src))) out[m[1]] = +m[2];
  return out;
}

const T = tokens();
n += 3;
if (Object.keys(T).length < 5) {
  console.log("[실패] 01_tokens.css 에서 --spN 단을 못 읽었다");
  process.exit(1);
}
/* **단이 다시 늘어나는 것을 막는다.** 열둘이 스물이 되면 접은 뜻이 없다 */
if (Object.keys(T).length > 13)
  fails.push("여백 단이 " + Object.keys(T).length + "개다. 열둘로 접어 뒀다");
/* **같은 크기를 두 이름으로 두지 않는다.** 두면 고를 때 또 헷갈린다 */
{
  const seen = {};
  Object.keys(T).forEach((k) => {
    if (seen[T[k]]) fails.push("--" + k + " 와 --" + seen[T[k]] + " 가 같은 " + T[k] + "px 다");
    seen[T[k]] = k;
  });
}
/* **1px 간격이 다시 생기는 것을 막는다.** 그것이 이 판을 만든 까닭이다 */
{
  const v = Object.keys(T).map((k) => ({ k: k, v: T[k] })).sort((a, b) => a.v - b.v);
  for (let i = 1; i < v.length; i++) {
    n += 1;
    const d = v[i].v - v[i - 1].v;
    if (d < 2)
      fails.push("--" + v[i - 1].k + "(" + v[i - 1].v + "px) 와 --" + v[i].k +
                 "(" + v[i].v + "px) 가 " + d + "px 차이다. 나란히 놓지 않으면 안 보인다");
  }
  /* **단이 선을 넘으면 그것은 자리다** */
  n += 1;
  const over = v.filter((x) => x.v >= BIG);
  if (over.length)
    fails.push("여백 단에 " + BIG + "px 이 넘는 값이 있다: " +
               over.map((x) => "--" + x.k).join(" ") + ". 그것은 단이 아니라 자리다");
}

const files = fs.readdirSync(STYLE).filter((f) => f.endsWith(".css")).sort();
n += 1;
if (files.length < 3) fails.push("app/style 에서 조각을 " + files.length + "개만 찾았다");

const raw = {};
const big = {};
files.forEach((f) => {
  const src = fs.readFileSync(path.join(STYLE, f), "utf8");
  PROP.lastIndex = 0;
  let m;
  while ((m = PROP.exec(src))) {
    const val = m[3];
    const line = src.slice(0, m.index).split("\n").length;
    let mm;
    const re = /\b(\d+)px\b/g;
    while ((mm = re.exec(val))) {
      n += 1;
      const v = +mm[1];
      const where = f + ":" + line;
      if (v >= BIG) { (big[v] = big[v] || []).push(where); continue; }
      (raw[v] = raw[v] || []).push(where);
    }
    /* 있는 단을 가리키는가. **없는 토큰은 조용히 비어서 여백이 사라진다** (T223) */
    const rv = /var\(--(sp\d+)\)/g;
    let vm;
    while ((vm = rv.exec(val))) {
      n += 1;
      if (!(vm[1] in T)) fails.push(f + ":" + line + " 이 없는 단 --" + vm[1] + " 을 쓴다");
    }
  }
});

Object.keys(raw).sort((a, b) => a - b).forEach((v) => {
  fails.push("단 밖의 여백 `" + v + "px` 이 " + raw[v].length + "곳에 있다 (" +
             raw[v].slice(0, 3).join(" ") + "). 01_tokens.css 의 --spN 에서 고른다");
});

/* **자리가 늘어나는 것도 본다.** 큰 값은 단이 아니지만 아무나 만들면 안 된다.
   여기서 걸리면 그것이 정말 자리인지 사람이 본다. */
n += 2;
{
  const kinds = Object.keys(big).map(Number).sort((a, b) => a - b);
  const extra = kinds.filter((v) => BIG_OK.indexOf(v) < 0);
  const gone = BIG_OK.filter((v) => kinds.indexOf(v) < 0);
  if (extra.length)
    fails.push("적어 두지 않은 자리가 생겼다: " + extra.map((v) => v + "px").join(" ") +
               ". 그것이 정말 자리인지 보고 check_space.js 의 BIG_OK 에 뜻과 함께 적는다");
  /* **없어진 것도 잡는다.** 안 쓰는 값이 목록에 남으면 그 목록이 거짓이 된다 */
  if (gone.length)
    fails.push("적어 둔 자리가 안 쓰인다: " + gone.map((v) => v + "px").join(" ") +
               ". BIG_OK 에서 뺀다");
  console.log("  " + BIG + "px 이 넘는 자리 " + kinds.length + "가지: " +
              kinds.map((v) => v + "px(" + big[v].length + ")").join(" "));
}

fails.forEach((m) => console.log("[실패] " + m));
console.log("");
console.log("**기계가 안 보는 것: 그 틈이 두 칸을 갈라 보이게 하는가**");
console.log("여백 " + n + "판 (단 " + Object.keys(T).length + "개, 조각 " +
            files.length + "개) / 실패 " + fails.length);
process.exit(fails.length ? 1 : 0);
