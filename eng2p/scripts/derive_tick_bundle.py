#!/usr/bin/env python3
"""하루 끝 틱이 PC 에서 돌려면 필요한 파일 묶음의 표 `out/tick/manifest.json` 을 적는다.

`scripts/game_tick.js` 는 혼자 안 돈다. 앱의 조각(app/js 와 out/app/plays.js 와 out/data/cards.js)을 Node 의
vm 에 읽어 **앱의 함수를 그대로 부르고** (docs/game_results.md 8장), 앱 지문을 english.html 에서 센다.
게임 저장소(PC)에는 이 파일들이 없다. 그래서 PC 의 `Tools\\sync_tick.ps1` 이 이 표를 받아 파일을 내려받고
크기와 SHA-256 을 맞춘 뒤 `Tools\\brain\\` 에 **저장소와 같은 자리 배치로** 놓는다. 그러면 game_tick.js 를 고치지 않고 돈다.

표에 들어가는 것:

    english.html                      앱 지문(appHash)을 세는 두 파일 중 하나
    eng2p/scripts/game_tick.js        틱
    eng2p/app/order.txt               앱 조각 차례. 틱이 이 목록을 읽는다
    eng2p/app/js/*.js                 order.txt 의 js/ 줄 (js/20_docs.js 는 틱이 안 읽는다)
    eng2p/out/app/plays.js            판 묶음 (appHash 의 나머지 하나)
    eng2p/out/data/cards.js           카드
    eng2p/out/game/results_schema.json  줄 검사의 모양 파일 (게임 Data 의 사본과 바이트가 같아야 한다)

`sessions.json` 은 안 넣는다. 게임 Data 폴더의 것(`Tools\\sync_data.ps1` 이 받는다)을 틱에 `--sessions` 로 준다.

**낡음을 두 겹으로 막는다.**
1. 이 표의 `appHash` 가 지금 `out/game/sessions.json` 의 `appHash` 와 다르면 표를 안 쓴다 (실패).
   앱이 바뀌었는데 sessions.json 을 안 뽑은 것이다 (derive_game.js 가 먼저 돈다).
2. PC 에서는 틱 자신이 sessions.json 의 appHash 를 묶음의 앱과 견주고 다르면 종료 코드 2 로 선다.

`tickHash` 는 파일 이름과 해시를 dataHash/1 과 같은 꼴(이름 ordinal 차례, 줄마다 LF)로 이어 센 지문이다.
PC 의 `Tools\\run_tick.ps1` 이 놓인 묶음을 이 지문으로 다시 확인한다.

사용법:
    python3 scripts/derive_tick_bundle.py          # 쓴다
    python3 scripts/derive_tick_bundle.py --check  # 쓰지 않고 지금 파일과 표가 같은지만 본다

결과: out/tick/manifest.json
규격: docs/game_results.md 12장
"""
import hashlib
import json
import pathlib
import re
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent.parent          # eng2p/
REPO = HERE.parent                                              # 저장소 뿌리
OUT = HERE / "out" / "tick" / "manifest.json"
SESSIONS = HERE / "out" / "game" / "sessions.json"
SKIP_JS = {"js/20_docs.js"}                                     # game_tick.js 의 makeBrain 과 같다
MIN_NODE = 22


def sha(data):
    return hashlib.sha256(data).hexdigest()


def line_hash(entries):
    """dataHash/1 과 같은 꼴. entries 는 {이름: sha256}."""
    text = "".join("%s:%s\n" % (n, entries[n]) for n in sorted(entries))
    return sha(text.encode("utf-8"))


def app_hash():
    """game_tick.js 의 appHash() 와 같다. 줄바꿈 CRLF 는 LF 로 바꿔서 센다."""
    ent = {}
    for name, p in (("english.html", REPO / "english.html"), ("eng2p/out/app/plays.js", HERE / "out" / "app" / "plays.js")):
        ent[name] = sha(p.read_text(encoding="utf-8").replace("\r\n", "\n").encode("utf-8"))
    return line_hash(ent)


def tick_js_list():
    """틱이 order.txt 에서 읽는 앱 조각. makeBrain 의 걸러내는 규칙과 똑같이 센다."""
    out = []
    for raw in (HERE / "app" / "order.txt").read_text(encoding="utf-8").split("\n"):
        parts = raw.strip().split()
        f = parts[0] if parts else ""
        if f and not f.startswith("#") and f.startswith("js/") and f not in SKIP_JS:
            out.append(f)
    return out


def files():
    """[(번들 안 이름, 실제 경로)]. 번들 안 이름은 저장소 뿌리 기준 경로다."""
    rows = [("english.html", REPO / "english.html"),
            ("eng2p/scripts/game_tick.js", HERE / "scripts" / "game_tick.js"),
            ("eng2p/app/order.txt", HERE / "app" / "order.txt")]
    for f in tick_js_list():
        rows.append(("eng2p/app/" + f, HERE / "app" / f))
    rows += [("eng2p/out/app/plays.js", HERE / "out" / "app" / "plays.js"),
             ("eng2p/out/data/cards.js", HERE / "out" / "data" / "cards.js"),
             ("eng2p/out/game/results_schema.json", HERE / "out" / "game" / "results_schema.json")]
    return rows


def build():
    err = []
    rows = files()
    for name, p in rows:
        if not p.exists():
            err.append("틱 묶음 파일이 없다: " + name)
    if err:
        return None, err
    try:
        sf = json.loads(SESSIONS.read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001
        return None, ["out/game/sessions.json 을 못 읽었다 (%s). node scripts/derive_game.js 를 먼저 돈다" % e]
    now = app_hash()
    if sf.get("appHash") != now:
        return None, ["sessions.json 의 appHash %s 가 지금 앱 %s 와 다르다. node scripts/derive_game.js 를 돌린다"
                      % (str(sf.get("appHash"))[:12], now[:12])]
    ent = []
    for name, p in rows:
        b = p.read_bytes()
        ent.append({"file": name, "bytes": len(b), "sha256": sha(b)})
    chk = subprocess.run(["node", "--check", str(HERE / "scripts" / "game_tick.js")], capture_output=True, text=True)
    if chk.returncode != 0:
        return None, ["game_tick.js 가 문법 검사를 못 넘었다: " + chk.stderr.strip()[:200]]
    schema_sha = next(e["sha256"] for e in ent if e["file"].endswith("results_schema.json"))
    body = {
        "note": "하루 끝 틱(scripts/game_tick.js)이 PC 에서 돌려면 필요한 파일의 크기와 해시다. 손으로 고치지 않는다. "
                "scripts/derive_tick_bundle.py 를 다시 돌린다. PC 의 Tools\\sync_tick.ps1 이 받는다.",
        "generator": "scripts/derive_tick_bundle.py",
        "tickHash": line_hash({e["file"]: e["sha256"] for e in ent}),
        "appHash": now,
        "schemaSha256": schema_sha,
        "nodeMin": MIN_NODE,
        "entry": "eng2p/scripts/game_tick.js",
        "algorithm": {
            "name": "tickHash/1",
            "line": "번들 안 이름 + ':' + 파일 바이트의 sha256 소문자 16진수",
            "order": "이름 ordinal (글자 코드 순서)",
            "hash": "줄마다 LF 를 붙여 이은 글(끝에도 LF 하나)의 UTF-8 바이트 sha256 소문자 16진수",
        },
        "count": len(ent),
        "files": ent,
    }
    return json.dumps(body, ensure_ascii=False, indent=1) + "\n", []


def main():
    check = "--check" in sys.argv[1:]
    text, err = build()
    if err:
        for e in err:
            print("[실패] " + e)
        return 1
    have = OUT.read_text(encoding="utf-8") if OUT.exists() else None
    if check:
        if have != text:
            print("[실패] out/tick/manifest.json 이 지금 파일과 다르다. python3 scripts/derive_tick_bundle.py 를 돌린다")
            return 1
        print("틱 묶음 표가 지금 파일과 같다")
        return 0
    if have == text:
        print("틱 묶음 표: 그대로 (%d개)" % json.loads(text)["count"])
        return 0
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(text, encoding="utf-8", newline="\n")
    print("틱 묶음 표를 썼다: %d개 tickHash %s" % (json.loads(text)["count"], json.loads(text)["tickHash"][:12]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
