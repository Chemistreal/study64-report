/* 게임이 받을 1년치. 세션 288개 (`docs/game.md`).
 *
 * **게임은 그날 할 일을 스스로 정하지 않는다.** 이 파일을 받아서 그린다.
 *
 * 그날 강과 세트와 카드와 녹음과 판을 정하는 셈이 앱에 있다 (`plan()`,
 * `roundPick`, 판마다의 덱 함수). 그것을 언리얼 C++ 로 다시 짜면 두 벌이 되고
 * 언젠가 어긋난다. 두 벌을 들었다가 어긋난 일을 이 저장소가 여러 번 겪었다
 * (T396 글쇠 목록, T413~T415 검사기의 거울).
 *
 * 그래서 **앱을 브라우저로 띄워 288세션을 하루씩 걷고 앱의 함수를 그대로 부른다.**
 * 앱이 내는 값이 곧 게임이 받는 값이다.
 *
 * ## 덱을 미리 뽑는다
 *
 * 두 PC 가 같은 파일을 읽으니 망으로 맞추지 않아도 둘이 같은 덱을 본다.
 * 덱은 세션 번호로 정해진다 (T410~T412 의 되짚기). 시작일을 하나로 박아도
 * 같은 세션에는 같은 덱이 간다.
 *
 * **미리 못 뽑는 것이 하나 있다.** 어제 그거(`recall`)는 결과 기록에서 **실제로 못 한(miss)**
 * 카드로 짠다. 기록이 있어야 정해진다. `scripts/game_tick.js` 가 하루 끝에 결과 JSONL 을 읽어
 * `Brain/next.json` 의 `recall` 로 내고, 게임은 그것을 그대로 쓴다. 세션 JSON 에는 규칙만 있다
 * (`runtime.recallRule`). 앱의 `renderRecall` 은 **돈** 카드(`ranOn`)에서 짜고 달력 날로 센다.
 * 게임은 그것을 안 쓴다. 이유와 차이는 `docs/game_results.md` 8장.
 *
 * ## 자료 계약 (2026-10-08, `docs/game_results.md`)
 *
 * 맨 위에 `schemaVersion` 과 `appHash` 를 둔다. 칸 이름이 바뀌면 C++ 가 조용히 빈 값을 읽는데
 * 판 번호가 없으면 아무도 모른다. `appHash` 는 이 파일을 뽑은 앱(english.html + out/app/plays.js)의
 * 지문이다. `check_game.py` 가 지금 앱의 지문과 견줘 낡음을 잡는다.
 *
 * `roleRule` 은 기계가 읽는 꼴이다 (`session_parity`). 앱의 `roleOf` 를 288세션 걸으며 낸
 * `roleVectors` 와 이 규칙이 같은지 여기서 먼저 보고, `check_game.py` 가 다시 본다.
 *
 * `out/game/results_schema.json` 도 여기서 낸다. 결과 JSONL 한 줄의 모양이다.
 *
 * 무대는 `docs/game.md` 4장 표에서 읽는다. **여기 안 적는다.**
 *
 * ## 개정문 24 25 26 (2026-10-07)
 *
 * **간격 복습 덱** (`review`). 세션마다 그날 다시 낼 카드다. 앱의 `dueCards()` 와
 * `markCardRun()` 을 288세션 동안 그대로 불러 뽑는다. 다 맞혔다고 치고 뽑은 명목 일정이다.
 * 사다리는 앱의 `SPACING` 이고 기준서 8.4 와 같은지는 `check_game.py` 가 본다.
 *
 * **다지기 주** (`consolidate`). 기준서 2.5 가 정한 주에는 새 강이 없다.
 * 그 주의 강 두 편은 앞의 두 주로 당긴다. 그 두 주는 세 편이고 한 편이 두 세션이다.
 * **세트는 안 옮긴다.** 세트는 하루 하나라 그 날 그대로 두면 다지기 주가 앞 강 세트를 돈다.
 * 다지기 주의 날마다 그 분기 앞 강 둘을 다시 짠다 (`revisit`).
 * 이 옮김은 앱의 `plan()` 에 없다. 앱 화면은 옛 차례 그대로다. **게임만 이 차례를 받는다.**
 * 덱은 옮긴 차례로 뽑는다. 그 동안 `plan` 을 옮긴 값으로 바꿔 끼우고 앱 함수를 부른다.
 *
 * **다시 말하기** (`retell`). 블록 4 의 4/3/2. 초는 기준서 2.3 문장에서 읽는다.
 *
 * **기계가 안 보는 것: 그 장면에서 두 사람이 영어를 입 밖에 내는가.**
 *
 * 사용법:
 *     node scripts/derive_game.js
 *
 * 결과: out/game/sessions.json
 */
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const HERE = path.resolve(__dirname, "..");
const ROOT = path.resolve(HERE, "..");
const PAGE = "file://" + path.join(ROOT, "english.html");
const CHROME = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const DOC = path.join(HERE, "docs", "game.md");
const SPEC = path.join(HERE, "docs", "spec.md");
const OUT = path.join(HERE, "out", "game");
const START = "2026-08-10";
/* 자료 계약 판 번호. sessions.json 의 칸이나 결과 줄의 모양이 바뀌면 올린다.
   결과 줄의 `v` 와 results_schema.json 의 `version` 이 이것과 같다 (check_game.py 가 본다) */
const SCHEMA_VERSION = 1;
/* 모양 개정 번호. **판 번호(SCHEMA_VERSION)와 다르다.** 줄의 `v` 는 1 그대로고 이미 쓴 줄은 모두 그대로 맞다.
   개정 2 (2026-10-10): 나들이 미션 줄을 더했다. 더하기만 했다 (칸을 안 뺐고 범위를 안 좁혔다).
   docs/game_results.md 4.15. check_game.py 가 개정 1 고정본(tools/game/results_fixture/results_schema.rev1.json)을 놓고
   "넓히기만 했는가"를 본다 */
const SCHEMA_REVISION = 2;
const PLAYS_JS = path.join(HERE, "out", "app", "plays.js");
const RECALL_JS = path.join(HERE, "app", "play", "recall.js");

let chromium;
try { chromium = require(process.env.PLAYWRIGHT_MODULE || "playwright").chromium; }
catch (e) {
  console.log("[실패] playwright 를 못 찾았다. 게임 세션을 못 뽑았다");
  process.exit(1);
}

/* 무대 표. **문서가 원본이다.** 못 읽으면 실패로 낸다 */
function stages() {
  const src = fs.readFileSync(DOC, "utf8");
  const out = {};
  /* 블록마다 장소가 하나다. **두 사람이 늘 같이 있다** (2026-10-07) */
  const re = /^\| (Q\d) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|\s*$/gm;
  let m;
  while ((m = re.exec(src))) {
    out[m[1]] = { stage: m[2].trim(),
                  places: { "1": m[3].trim(), "2": m[4].trim(),
                            "3": m[5].trim(), "4": m[6].trim() } };
  }
  return out;
}

/* 기준서에서 읽는 값 둘. **여기 숫자를 안 적는다.** 기준서가 원본이다.
   다지기 주 (2.5) 와 블록 4 다시 말하기 초 (2.3). 못 읽으면 실패로 낸다 */
function specRules() {
  const src = fs.readFileSync(SPEC, "utf8");
  const cm = src.match(/다지기 주는 ([\d, ]+)주다/);
  const rm = src.match(/한 사람이 (\d+)분, (\d+)분, (\d+)분 세 번 말한다/);
  const qm = src.match(/Q1 은 (\d+)초, (\d+)초, (\d+)초다/);
  if (!cm || !rm || !qm) return null;
  return {
    consol: cm[1].split(",").map((x) => +x.trim()).filter((x) => x),
    retell: { Q1: [+qm[1], +qm[2], +qm[3]],
              rest: [+rm[1] * 60, +rm[2] * 60, +rm[3] * 60] },
  };
}

/* 지문. `docs/game_results.md` 10장이 정한 꼴 하나를 쓴다.
   줄은 `이름:소문자 sha256` 이고 이름 차례(ordinal)로 LF 로 잇고 끝에도 LF 하나다. */
function sha256(buf) { return crypto.createHash("sha256").update(buf).digest("hex"); }
function lineHash(entries) {
  /* 이름 차례다. 줄 전체를 견주면 "a" 와 "a.b" 의 차례가 ':' 때문에 뒤집힌다 */
  const sorted = entries.slice().sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return sha256(Buffer.from(sorted.map((e) => e.name + ":" + e.sha256 + "\n").join(""), "utf8"));
}
/* 이 파일을 뽑은 앱의 지문. 브라우저가 연 english.html 과 판 묶음 plays.js 다.
   조각이 아니라 이 둘인 까닭: 주석은 조각에만 남아서 주석만 고친 날 지문이 바뀌면 헛경보다.
   줄바꿈 CRLF 는 LF 로 바꿔서 센다. 윈도우 체크아웃(git autocrlf)이 줄바꿈을 바꿔도 같은 지문이어야
   PC 에서 틱이 날마다 낡았다고 서지 않는다 */
function appHash() {
  const files = [["english.html", path.join(ROOT, "english.html")],
                 ["eng2p/out/app/plays.js", PLAYS_JS]];
  return lineHash(files.map(([name, f]) => ({
    name: name, sha256: sha256(Buffer.from(fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n"), "utf8")) })));
}
/* 어제 그거의 한 판 장수. 앱의 renderRecall 이 `var d={end:N}` 로 박은 값을 조각에서 읽는다.
   게임이 따로 10 을 적으면 두 벌이다. 못 읽으면 실패로 낸다 */
function recallMax() {
  const m = fs.readFileSync(RECALL_JS, "utf8").match(/var d=\{end:(\d+)\}/);
  return m ? +m[1] : null;
}

/* 결과 줄의 모양 (JSON Schema, draft 2020-12 의 부분집합).
   **모양의 원본은 이 함수다.** docs/game_results.md 4장 표와 check_game.py 가 이것과 견준다.
   게임(C++)과 game_tick.js 와 check_game.py 가 같은 파일을 읽는다.
   쓰는 키워드: type const enum pattern minimum maximum minLength maxLength required
   properties additionalProperties (+ 맨 위 oneOf/$ref 로 줄 종류를 가른다). 그 밖은 안 쓴다 */
function buildResultsSchema() {
  const str = (pattern, d) => ({ type: "string", pattern: pattern, description: d });
  const int = (min, max, d) => ({ type: "integer", minimum: min, maximum: max, description: d });
  const en = (list, d) => ({ type: "string", enum: list, description: d });
  const OUTCOME = en(["pass", "near", "miss", "skipped"],
    "pass 첫 시도에 기준을 넘었다 / near 다시 하거나 고치고서야 넘었다 / miss 기준을 못 넘기고 넘어갔다 / skipped 안 했다 (시간이 끝났거나 건너뜀)");
  const VIA = en(["speech", "manual"], "speech 말 판정기가 들었다 / manual 사람이 '했다' 를 눌렀다");
  const ENV = (t, team) => ({
    v: { const: SCHEMA_VERSION, description: "계약 판 번호. sessions.json 의 schemaVersion 과 같다" },
    t: { const: t, description: "줄 종류" },
    s: int(1, 9999, "세션 번호. 비상판과 짧은 날도 그날 세션 번호를 쓴다 (번호는 안 오른다)"),
    e: str("^[hg][0-9]{14}-[0-9]{4,6}$",
      "줄 번호. 기기 글자(h 방을 연 쪽, g 들어온 쪽) + 그 세션을 연 UTC 시각 YYYYMMDDHHMMSS + - + 그 기기가 쓴 차례. 세션 번호와 함께 합치기 열쇠다"),
    device: en(["host", "guest"], "이 줄을 쓴 노트북. e 의 첫 글자와 맞아야 한다"),
    seat: team ? { const: "team", description: "이 줄은 한 사람의 값이 아니다" }
               : en(["a", "b", "team"], "앱의 사람 자리(사람1 a, 사람2 b) 또는 팀. 그날 A/B 역할(seatA)이 아니다. 캐릭터 이름이 아니다"),
    date: str("^[0-9]{4}-[0-9]{2}-[0-9]{2}$", "세션을 연 날(현지 달력). 자정을 넘겨도 그 날이다"),
    t0: str("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$", "시작 UTC 시각"),
    t1: str("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$", "끝 UTC 시각. t0 이상"),
  });
  const BLOCK = { type: "integer", enum: [0, 1, 2, 3, 4, 9],
    description: "블록 1~4, 9 는 바쁜 날 심부름, 0 은 블록 밖 (나들이 미션. 블록 시계에 안 든다. activity 의 kind outing 만 쓴다)" };
  const COUNT = (d) => int(0, 99, d);
  const def = (t, team, extra) => {
    const props = Object.assign(ENV(t, team), extra);
    return { type: "object", additionalProperties: false, required: Object.keys(props), properties: props };
  };
  const unit = {
    outcome: OUTCOME, via: VIA,
    attempts: COUNT("해 본 횟수. 첫 시도가 1"),
    repairs: COUNT("고친 횟수. NPC 가 다시 해 보자고 했거나 팀이 되물은 횟수 (repair 는 실패가 정상)"),
  };
  const defs = {
    session_start: def("session_start", true, {
      mode: en(["normal", "busy", "short"], "보통 날 120분 / 바쁜 날 15분 혼자 / 짧은 날 45분 둘이. busy 와 short 는 세션 번호를 안 올린다"),
      seatA: en(["a", "b"], "그날 먼저 말을 여는 사람의 자리 (역할 A)"),
      dataHash: str("^[0-9a-f]{64}$", "그때 읽은 Data/*.json 의 dataHash"),
      game: str("^[0-9A-Za-z._-]{1,16}$", "게임 판 이름"),
    }),
    session_end: def("session_end", true, {
      mode: en(["normal", "busy", "short"], "session_start 의 mode 와 같다"),
      ended: en(["done", "quit", "error"], "done 끝까지 / quit 사람이 닫음 / error 멈춤. 정상 세션 수는 host 의 done 만 센다"),
    }),
    block_start: def("block_start", true, {
      block: BLOCK, place: { type: "string", minLength: 1, maxLength: 40, description: "그 블록의 장소 이름 (sessions.json places)" },
    }),
    block_end: def("block_end", true, {
      block: BLOCK, ended: en(["done", "timer", "quit"], "done 다 함 / timer 블록 시간이 끝남 / quit 닫음"),
    }),
    media_play: def("media_play", true, {
      block: BLOCK, media: str("^[a-z0-9-]{3,24}$", "녹음 id (lle1-NN)"),
      from_ms: int(0, 86400000, "튼 구간 시작"), to_ms: int(0, 86400000, "튼 구간 끝"),
      rate_pct: int(25, 400, "배속. 100 이 1배"),
    }),
    line_wait: def("line_wait", false, Object.assign({
      block: BLOCK, line: int(1, 999, "장면 줄 번호 (1부터)"),
    }, unit)),
    card_run: def("card_run", false, Object.assign({
      block: BLOCK, id: str("^Q[1-4]-[0-9]{3}$", "카드 id"),
    }, unit, {
      k: int(0, 99, "기준 낱말 중 들린 수. 모르면 0"), n: int(0, 99, "기준 낱말 수. 모르면 0"),
    })),
    play_round: def("play_round", false, Object.assign({
      block: BLOCK, play: str("^[a-z]{3,12}$", "판 id (playblocks.json)"), round: int(1, 999, "회 번호"),
    }, unit, { hit: int(0, 999, "맞은 수"), miss: int(0, 999, "못 맞힌 수") })),
    activity: def("activity", false, Object.assign({
      block: BLOCK,
      kind: en(["radio", "notebook", "set", "mentor", "diary", "errand", "retell", "outing"],
        "손으로 하는 블록 활동 종류. outing 은 나들이 미션 한 번의 결과 (block 0, ref 는 미션 id)"),
      ref: str("^[A-Za-z0-9._-]{0,40}$", "자료 id (없으면 빈 글자). outing 이면 미션 id"),
    }, unit)),
    outing_turn: def("outing_turn", false, Object.assign({
      mission: str("^[a-z0-9_]{3,40}$", "나들이 미션 id (outings.json missions[].id)"),
      turn: int(1, 99, "그 미션 차례 표(game.turns)의 1부터 센 차례 번호. NPC 만 말하는 차례는 점수가 없어 줄이 없다"),
    }, unit)),
    note: def("note", true, { block: BLOCK, chars: int(0, 99999, "수첩에 쓴 글자 수. 글은 안 담는다") }),
    pause: def("pause", true, { on: { type: "boolean", description: "멈춤 켬 / 끔" } }),
  };
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "honolulu-results-event",
    title: "호놀룰루 결과 JSONL 한 줄",
    description: "사실만 적는다. 소리, 받아쓴 글, 이름, 사람별 점수는 안 담는다. 풀이는 docs/game_results.md",
    version: SCHEMA_VERSION,
    revision: SCHEMA_REVISION,
    generator: "scripts/derive_game.js",
    "x-forbiddenKeys": ["name", "nameA", "nameB", "who", "speaker", "player", "user", "mic", "text", "say",
                        "transcript", "heard", "audio", "path", "file", "rec", "score", "confidence", "wer"],
    "x-rules": ["t1 >= t0", "e 의 첫 글자 h/g 가 device host/guest 와 같다",
                "date 는 달력에 있는 날이다", "한 줄은 한 JSON 객체이고 줄바꿈이 없다"],
    "x-revisions": ["1 (2026-10-08) 줄 11가지",
                    "2 (2026-10-10) 나들이: block 에 0, activity.kind 에 outing, activity.ref 길이 40, 줄 종류 outing_turn. 더하기만 했다 (v 는 1 그대로)"],
    oneOf: Object.keys(defs).map((k) => ({ $ref: "#/$defs/" + k })),
    $defs: defs,
  };
}

/* 다지기 주 옮김. 288세션의 원래 plan() 을 받아 세션마다 어느 강의 값을 쓸지 낸다.
   **세트와 날짜와 덱 씨앗은 그 세션 것 그대로다.** 강과 카드와 녹음과 비상판만 옮긴다.

   다지기 주 w 의 앞 두 주(w-2, w-1)에 강 여섯(w-2, w-1, w 의 것)을 두 세션씩 놓는다.
   다지기 주의 날 k 는 그 분기 k*2-1 번째와 k*2 번째 강을 다시 짠다. 블록 1 녹음은 앞 강 것이다. */
function layout(base, consol) {
  const lay = base.map((b, i) => ({ src: i, consolidate: false, revisit: null }));
  const first = {};
  base.forEach((b, i) => { if (b.lectureNo != null && first[b.lectureNo] == null) first[b.lectureNo] = i; });
  const at = (wk, d) => (wk - 1) * 6 + (d - 1);
  const err = [];
  for (const w of consol) {
    if (w < 3 || w > 48) { err.push(w + "주는 다지기 주가 될 수 없다"); continue; }
    const q = base[at(w, 1)].quarter;
    let qs = w;
    while (qs > 1 && base[at(qs - 1, 1)].quarter === q) qs--;
    if (w - 2 < qs) { err.push(w + "주 앞에 같은 분기 주가 둘 없다"); continue; }
    const lecs = (from, to) => {
      const out = [];
      for (let wk = from; wk <= to; wk++)
        for (let d = 1; d <= 6; d++) {
          const L = base[at(wk, d)].lectureNo;
          if (L != null && out.indexOf(L) < 0) out.push(L);
        }
      return out;
    };
    const six = lecs(w - 2, w), mine = lecs(qs, w);
    if (six.length !== 6 || mine.length < 12) {
      err.push(w + "주 둘레 강이 " + six.length + "편, 분기 앞 강이 " + mine.length + "편이다");
      continue;
    }
    for (let j = 0; j < 12; j++)
      lay[at(w - 2, 1) + j] = { src: first[six[Math.floor(j / 2)]], consolidate: false, revisit: null };
    for (let d = 1; d <= 6; d++)
      lay[at(w, d)] = { src: first[mine[2 * d - 2]], consolidate: true,
                        revisit: [mine[2 * d - 2], mine[2 * d - 1]] };
  }
  return { lay: lay, err: err };
}

/* 판마다 그날 덱을 내는 함수. **앱의 함수를 그대로 부른다.**
   앱에 없는 셈을 여기 짓지 않는다. 그러면 검사기가 앱의 거울을 들었던
   그 자리가 이번에는 게임 쪽에서 난다. */
const DECKS = {
  mirror: "mirItems(MIR.n)", swapline: "swpItems()", hearme: "hrmItems()",
  relay: "rlyItems()", chain: "chnPool()", twohalf: "twhItems()",
  overlap: "[ovlTarget()]", ladder: "[ladPiece()]", wall: "walDeck()",
  rebound: "rbdPool()", onesee: "oneDeck()", wave: "[wavPiece()]",
  whose: "whoDeck()", reask: "rskLines()", cutin: "cutShow()",
  clash: "clsRows()", flip: "flpDeck()", apart: "[aptItem()]",
};
const KEYS = ["chunks", "halves", "listen", "pairs", "reask", "relay", "situ", "swaps",
              "transcripts", "wall", "whose", "flip", "cards", "cutin", "clash",
              "apart", "ladder", "wave", "onepick"];

(async () => {
  const ST = stages();
  const need = ["Q1", "Q2", "Q3", "Q4"].filter((q) => !ST[q]);
  if (need.length) {
    console.log("[실패] docs/game.md 4장 무대 표에서 " + need.join(" ") + " 줄을 못 읽었다");
    process.exit(1);
  }
  const SR = specRules();
  if (!SR) {
    console.log("[실패] docs/spec.md 에서 다지기 주(2.5)나 다시 말하기 초(2.3)를 못 읽었다");
    process.exit(1);
  }
  if (!fs.existsSync(CHROME)) {
    console.log("[실패] 크로미움을 못 찾았다: " + CHROME);
    process.exit(1);
  }
  const RMAX = recallMax();
  if (!RMAX) {
    console.log("[실패] app/play/recall.js 에서 어제 그거 한 판 장수(var d={end:N})를 못 읽었다");
    process.exit(1);
  }
  for (const f of [path.join(ROOT, "english.html"), PLAYS_JS]) {
    if (!fs.existsSync(f)) {
      console.log("[실패] 앱 파일이 없다: " + f + ". python3 scripts/derive_app.py 를 먼저 돌린다");
      process.exit(1);
    }
  }

  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  let perr = null;
  page.on("pageerror", (e) => { if (!perr) perr = e.message; });
  await page.goto(PAGE);
  await page.waitForFunction(() => typeof plan === "function", null, { timeout: 15000 });
  await page.fill("#obA", "가람");
  await page.fill("#obB", "나래");
  await page.click("#obGo");
  await page.waitForTimeout(400);

  /* 첫 걸음. **앱의 원래 차례**를 288세션 받는다. 옮김은 이것을 보고 정한다 */
  const first = await page.evaluate(async (args) => {
    const [KEYS, START] = args;
    await new Promise((r) => loadScript("plays", "eng2p/out/app/plays.js", r));
    await new Promise((r) => needAllWeeks(r));
    for (const k of KEYS)
      await new Promise((r) => loadData(k, "ENG2P_" + k.toUpperCase(), () => r()));
    S.start = START; S.device = "a"; S.days = {};
    const real = window.today;
    const base = [], dates = [];
    let d = START;
    for (let i = 0; i < 400 && base.length < 288; i++) {
      window.today = () => d;
      base.push(JSON.parse(JSON.stringify(plan())));
      dates.push(d);
      S.days[d] = { status: "normal", speak: 40, cards: 7, lre: 2, unres: [], coll: [] };
      d = addDays(d, 1);
      if (parseISO(d).getDay() === 0) d = addDays(d, 1);
    }
    window.today = real;
    return { base: base, dates: dates, ladder: (window.SPACING || []).slice() };
  }, [KEYS, START]);

  const LY = layout(first.base, SR.consol);
  if (LY.err.length) {
    LY.err.forEach((m) => console.log("[실패] 다지기 주를 못 놓았다: " + m));
    process.exit(1);
  }

  /* 둘째 걸음. 옮긴 차례로 다시 걷는다. `plan` 을 옮긴 값으로 바꿔 끼우고
     덱과 간격 복습을 **앱 함수로** 뽑는다. 카드는 다 돌았다고 친다 (명목 일정) */
  const got = await page.evaluate(async (args) => {
    const [DECKS, START, base, dates, lay] = args;
    const cards = (DATA.cards && DATA.cards.items) || [];
    const picks = ((DATA.onepick && DATA.onepick.days) || []);
    const item = (x) => (x && typeof x === "object" && x.id) ? x.id : x;
    const idsOf = (p) => cards.filter((c) => p && p.cards && c.quarter === p.quarter &&
                                      c.no >= p.cards.from && c.no <= p.cards.to).map((c) => c.id);
    const real = window.today, realPlan = window.plan;
    const realSave = window.save, realNow = window.saveNow;
    /* 600장 x 288일을 적는다. 저장은 안 한다. 걷는 동안만 막고 돌려놓는다 */
    window.save = () => {}; window.saveNow = () => {};
    S.start = START; S.device = "a"; S.days = {}; S.cardDue = {};
    const out = [], miss = {}, roles = [];
    for (let i = 0; i < 288; i++) {
      const d = dates[i];
      window.today = () => d;
      S.rhit = {};
      const own = realPlan();
      /* 그날 먼저 말을 여는 사람. **앱의 roleOf 를 그대로 부른다.** 세션 번호도 앱의 셈으로 같이 적는다 */
      roles.push({ s: own.session, A: roleOf(d), no: sessionNoOn(d) });
      const L = lay[i], src = base[L.src];
      const pl = Object.assign({}, own, {
        lectureNo: src.lectureNo, title: src.title, track: src.track,
        cards: src.cards, media: src.media, emergency: src.emergency });
      window.plan = () => pl;
      /* 오늘 카드. 다지기 주는 새 카드가 없고 다시 짜는 강 둘의 카드를 돈다 */
      let todays = idsOf(pl);
      if (L.consolidate) {
        todays = [];
        L.revisit.forEach((n) => {
          const b = base.find((x) => x.lectureNo === n);
          todays = todays.concat(idsOf(b));
        });
      }
      const set = {}; todays.forEach((k) => { set[k] = 1; });
      const review = dueCards().filter((k) => !set[k]).sort();
      const row = {
        s: own.session, date: d, week: own.week, day: own.day, quarter: own.quarter,
        consolidate: !!L.consolidate,
        track: L.consolidate ? null : (pl.track || null),
        lecture: L.consolidate ? null : pl.lectureNo,
        revisit: L.consolidate ? L.revisit : null,
        set: own.set || null,
        media: pl.media || null, emergency: pl.emergency || null,
        cards: todays, review: review,
        pick: (picks[own.session - 1] || {}).pick || null,
        decks: {},
      };
      for (const id in DECKS) {
        try {
          const v = eval(DECKS[id]);
          const list = (v || []).filter((x) => x != null).map(item);
          if (list.length) row.decks[id] = list;
        } catch (e) { if (!miss[id]) miss[id] = String(e).slice(0, 80); }
      }
      todays.concat(review).forEach((k) => markCardRun(k, pl.lectureNo));
      window.plan = realPlan;
      out.push(row);
      S.days[d] = { status: "normal", speak: 40, cards: 7, lre: 2, unres: [], coll: [] };
    }
    window.today = real; window.plan = realPlan;
    window.save = realSave; window.saveNow = realNow;
    const blocks = ((IDX && IDX.blocks) || []);
    return { sessions: out, miss: miss, blocks: blocks, roles: roles,
             rcl: (typeof RCL !== "undefined" && RCL.days) ? RCL.days.slice() : null,
             roleRule: (IDX && IDX.roleRule) || null };
  }, [DECKS, START, first.base, first.dates, LY.lay]);
  await browser.close();

  if (perr) { console.log("[실패] 앱이 오류를 냈다: " + perr); process.exit(1); }
  const missed = Object.keys(got.miss);
  if (missed.length) {
    missed.forEach((k) => console.log("[실패] " + k + " 덱을 못 뽑았다: " + got.miss[k]));
    process.exit(1);
  }
  if (first.ladder.length < 2) {
    console.log("[실패] 앱에서 간격 사다리(SPACING)를 못 읽었다");
    process.exit(1);
  }
  if (!got.rcl || got.rcl.join() !== "1,3,7") {
    console.log("[실패] 앱의 어제 그거 되돌아보기(RCL.days)가 1,3,7 이 아니다: " + JSON.stringify(got.rcl) +
                ". docs/game_results.md 8장과 같이 고친다");
    process.exit(1);
  }

  /* 그날 먼저 말을 여는 사람 (역할 A). **앱이 낸 288개를 규칙으로 접는다.**
     규칙이 앱의 답과 한 개라도 다르면 규칙을 안 내고 실패한다.
     규칙을 먼저 적고 벡터를 맞추는 것이 아니라 벡터에서 규칙을 읽는다 */
  const roles = got.roles || [];
  const roleErr = [];
  if (roles.length !== 288) roleErr.push("세션 " + roles.length + "개");
  roles.forEach((r, i) => {
    if (r.s !== i + 1 || r.no !== i + 1) roleErr.push((i + 1) + "번째가 세션 " + r.s + " / 앱 번호 " + r.no);
    if (r.A !== "a" && r.A !== "b") roleErr.push((i + 1) + "번째 A 가 " + r.A);
  });
  const oddA = new Set(roles.filter((r) => r.s % 2 === 1).map((r) => r.A));
  const evenA = new Set(roles.filter((r) => r.s % 2 === 0).map((r) => r.A));
  if (oddA.size !== 1 || evenA.size !== 1 || [...oddA][0] === [...evenA][0])
    roleErr.push("홀수 세션과 짝수 세션이 한 사람씩 갈리지 않는다 (홀 " + [...oddA] + " / 짝 " + [...evenA] + ")");
  if (roleErr.length) {
    console.log("[실패] 앱의 roleOf 가 세션 짝홀 규칙이 아니다: " + roleErr.slice(0, 4).join(" / ") +
                ". roleRule 의 kind 를 새로 정하고 docs/game_results.md 를 고친다");
    process.exit(1);
  }
  const roleRule = { kind: "session_parity", odd: [...oddA][0], even: [...evenA][0],
                     text: got.roleRule };
  const roleVectors = roles.map((r) => ({ s: r.s, A: r.A }));

  /* **블록 넷 다 같이 하고 같이 말한다** (2026-10-07, 개정문 20번).
     앱의 블록 표는 기준서 2.3 그대로라 블록 1 이 대화 금지다. 게임은 그것을 깼다.
     그 값을 여기서 덮는다. 앱 쪽 표는 기준서가 바뀌기 전에는 그대로 둔다.
     블록 4 는 다시 말하기로 연다 (개정문 25). */
  got.blocks = (got.blocks || []).map((b) => Object.assign({}, b, { together: true, talk: true },
                                                            b.no === 4 ? { retell: true } : {}));

  /* 다시 말하기. 그 주 이야기를 그날까지. 두 사람이 각자 세 번 */
  got.sessions.forEach((r) => {
    const st = ST[r.quarter];
    r.stage = st.stage;
    r.places = st.places;
    const secs = r.quarter === "Q1" ? SR.retell.Q1 : SR.retell.rest;
    r.retell = { story: r.week, secs: secs.slice(), each: true, together: true,
                 total: 2 * secs.reduce((a, b) => a + b, 0) };
  });

  /* 1년에 몇 번 나오나. **다섯 번이 안 되는 카드는 숨기지 않고 적는다** (기준서 8.4) */
  const seen = {};
  got.sessions.forEach((r) => r.cards.concat(r.review).forEach((k) => { seen[k] = (seen[k] || 0) + 1; }));
  const carry = Object.keys(seen).filter((k) => seen[k] < 5).sort();

  const obj = {
    schemaVersion: SCHEMA_VERSION,
    appHash: appHash(),
    note: "게임이 받을 1년치 세션. 앱을 띄워 288세션을 걷고 앱의 셈을 그대로 불러 뽑는다. " +
          "손으로 안 고친다. scripts/derive_game.js 를 다시 돌린다.",
    grade: "B",
    gradeWhy: "덱이 담은 영어는 판 자료가 진 등급을 그대로 진다. 판 자료 중 B등급이 있다.",
    generator: "scripts/derive_game.js",
    source: "english.html 의 plan() 과 dueCards() 와 markCardRun() 과 판마다의 덱 함수, " +
            "out/data, docs/game.md 4장, docs/spec.md 2.3 2.5 8.4",
    start: START,
    dateNote: "date 는 시작일에서 쉬는 날 없이 걸은 명목 날짜다. 간격 복습을 이 날짜로 뽑았다",
    roleRule: roleRule,
    roleVectors: roleVectors,
    runtime: {
      recall: "어제 그거는 미리 못 뽑는다. 결과 기록에서 실제로 못 한(miss) 카드로 scripts/game_tick.js 가 " +
              "그날 짜서 Brain/next.json 의 recall 로 낸다. 앱의 renderRecall 은 돈 카드를 달력 날로 세지만 " +
              "게임은 못 한 카드를 세션 수로 센다 (recallRule)",
      recallRule: {
        outcomes: ["miss"], unit: "session", back: got.rcl, max: RMAX,
        order: "앱의 rclDeck 이 roundOrder 와 roundSeed 로 정한다. 게임이 안 섞는다",
        empty: "없으면 비운다. 다른 판으로 안 바꾼다",
      },
      review: "review 는 다 맞혔다고 치고 뽑은 명목 일정이다. 실제 덱은 결과 기록으로 scripts/game_tick.js 가 " +
              "spacing 규칙대로 다시 짜서 Brain/next.json 의 review 로 낸다",
    },
    spacing: {
      ladder: first.ladder,
      up: "제 날이나 그 뒤에 돌면 한 칸 오른다. 다음 날짜는 그날에 새 칸의 날수를 더한 날이다",
      down: "못 하면 한 칸 내린다. 맨 아래 칸은 1일이다",
      early: "제 날 전에 돈 것은 칸을 안 올린다",
      byOutcome: { pass: "up", near: "hold", miss: "down", skipped: "none" },
      byOutcomeNote: "결과 줄의 outcome 이 사다리를 어떻게 움직이나. up 은 위 up 문장, hold 는 돈 날만 적고 칸을 그대로 두며 다음 날짜는 그 칸의 날수, " +
                     "down 은 위 down 문장, none 은 아무것도 안 바꾼다. 앱의 markCardRun 과 markCardStuck 을 그대로 부른다 (hold 만 앱에 없는 절차다)",
      top: "맨 위 칸(120일)을 돌면 끝난다",
      minAppear: 5,
    },
    carry: carry,
    carryNote: "1년 안에 다섯 번이 안 되는 카드. 마지막 주에 처음 나와 사다리가 1년 밖으로 나간다. 2년차 첫 주에 돈다",
    consolidation: {
      weeks: SR.consol,
      rule: "새 강이 없다. 그 주 강 두 편은 앞의 두 주로 당긴다. 날마다 그 분기 앞 강 둘(revisit)을 다시 짠다. 세트는 그 날 것 그대로다",
    },
    shortDay: {
      minutes: 45, together: true,
      parts: [{ what: "review", minutes: 25 }, { what: "retell", minutes: 20 }],
      session: false,
      note: "2시간을 못 내는 날. 수행일로 센다. 세션 번호는 안 오르고 576시간에 안 센다",
    },
    blocks: got.blocks.length ? got.blocks : null,
    count: got.sessions.length,
    sessions: got.sessions,
  };
  fs.mkdirSync(OUT, { recursive: true });
  const txt = JSON.stringify(obj, null, 1) + "\n";
  fs.writeFileSync(path.join(OUT, "sessions.json"), txt);
  const schemaTxt = JSON.stringify(buildResultsSchema(), null, 1) + "\n";
  fs.writeFileSync(path.join(OUT, "results_schema.json"), schemaTxt);
  console.log("out/game/sessions.json / 세션 " + obj.count + "개 / " +
              Math.round(txt.length / 1024) + "KB / 판 덱 " + Object.keys(DECKS).length +
              "개를 미리 뽑았다 (어제 그거는 그날 짠다) / 다지기 주 " + SR.consol.join(" ") +
              " / 간격 복습 " + got.sessions.reduce((a, r) => a + r.review.length, 0) +
              "장 / 다섯 번 못 채운 카드 " + carry.length + "장 / schemaVersion " + SCHEMA_VERSION +
              " appHash " + obj.appHash.slice(0, 12) + " / roleRule " + roleRule.kind + " 벡터 " + roleVectors.length +
              " / out/game/results_schema.json " + Math.round(schemaTxt.length / 1024) + "KB");
})().catch((e) => {
  console.log("[실패] 게임 세션을 뽑다가 멈췄다: " + e.message);
  process.exit(1);
});
