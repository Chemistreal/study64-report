#!/usr/bin/env python3
"""게임이 읽는 자료 묶음의 크기와 해시, 그리고 두 노트북이 맞춰 보는 `dataHash` 를 적는다.

두 노트북은 같은 자료를 읽어야 같은 하루를 본다 (docs/game.md 5.1). 자료가 한 글자라도 다르면
덱이 다르고 장면이 다르다. 그래서 들어올 때 **Data 폴더의 지문이 같은지** 본다.
그 지문이 `dataHash` 고 이 파일이 만드는 것이 그 기준값이다.
`out/data/manifest.json` (앱 자료 표)과 다른 파일이다. 이쪽은 게임 쪽만 안다.

## dataHash 를 이렇게 센다 (게임도 똑같이 센다. docs/game_results.md 10장)

    대상   Data/*.json 중에서 manifest.json 과 *.local.json 을 뺀 것. 폴더 안쪽은 안 본다
    차례   파일 이름 차례 (ordinal: 글자 코드 순서. 대소문자를 가리고 정렬하지 않는다)
    줄     이름 + ":" + 그 파일 바이트의 sha256 (소문자 16진수 64자)
    지문   줄들을 LF 로 이어 끝에도 LF 하나를 붙인 글을 UTF-8 로 보고 sha256 (소문자 16진수)

Data 폴더는 이 저장소의 `out/game/*.json` 전부와 `out/data/cards.json` 을 **바이트 그대로 복사한 것**이다.
그래서 저장소 쪽은 같은 파일 묶음으로 센다. 이름이 겹치면 실패다.
줄바꿈을 바꾸는 복사(git autocrlf, Get-Content/Set-Content)는 해시를 바꾼다. 바이트로 복사한다.

## 아직 안 내려온 파일

다른 갈래가 아직 내리는 파일(LATER)이 없으면 **없다고 적고 알린다.** 지문은 있는 파일로만 센다.
`--strict` 이면 실패한다. 다 내려온 뒤 all.py 가 --strict 로 부른다.
`check_game.py --manifest` 는 manifest 의 pending 이 실제로 없는 파일과 같은지 본다 (거짓말을 못 한다).

사용법:
    python3 scripts/derive_game_manifest.py            # 쓴다
    python3 scripts/derive_game_manifest.py --strict   # 아직 안 내려온 파일이 있으면 실패
    python3 scripts/derive_game_manifest.py --check    # 쓰지 않고 지금 파일과 manifest 가 같은지만 본다

결과: out/game/manifest.json
규격: docs/game_results.md 10장
"""
import hashlib
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
GAME = ROOT / "out" / "game"
CARDS = ROOT / "out" / "data" / "cards.json"
MANIFEST = GAME / "manifest.json"

# 이 이름들은 꼭 있어야 한다. 하나라도 없으면 실패다 (적어 둔 것을 찾는다. 훑으면 빠진 것이 안 보인다)
REQUIRED = ["sessions.json", "scenes.json", "town.json", "results_schema.json", "cards.json"]
# 다른 갈래가 내리고 있는 것. 게임 Data 폴더에 들어갈 이름이다.
LATER = ["spelling_rule.json", "judge.json", "replies.json", "voicelist.json", "deck_names.json"]

ALGORITHM = {
    "name": "dataHash/1",
    "files": "Data/*.json 중 manifest.json 과 *.local.json 을 뺀 것",
    "order": "파일 이름 ordinal (글자 코드 순서, 대소문자 구분)",
    "line": "이름 + ':' + 파일 바이트의 sha256 소문자 16진수",
    "hash": "줄마다 LF 를 붙여 이은 글(끝에도 LF 하나)의 UTF-8 바이트 sha256 소문자 16진수",
}


def sha256_hex(data):
    return hashlib.sha256(data).hexdigest()


def counted(name):
    """dataHash 에 들어가는 이름인가. 게임이 Data 폴더를 훑을 때 쓰는 것과 같은 규칙이다."""
    return name.endswith(".json") and name != "manifest.json" and not name.endswith(".local.json")


def data_hash(files):
    """기준 구현. files 는 {이름: 바이트}. 이름은 ASCII 여야 한다.

    게임(C++)은 이것과 같은 값을 내야 한다. 시험값은 TEST_VECTOR 와 docs/game_results.md 10장에 있다."""
    names = sorted(n for n in files if counted(n))
    for n in names:
        if not n.isascii():
            raise ValueError("ASCII 가 아닌 이름: " + n)
    text = "".join("%s:%s\n" % (n, sha256_hex(files[n])) for n in names)
    return sha256_hex(text.encode("utf-8"))


# 시험값. 대문자 이름이 소문자 앞에 온다 (ordinal). manifest.json, *.local.json, .txt 는 빠진다.
TEST_VECTOR = {
    "files": {
        "a.json": '{"a":1}\n',
        "B.json": "[]",
        "manifest.json": '{"dataHash":"ignored"}\n',
        "x.local.json": "{}\n",
        "c.txt": "not json\n",
    },
    "lines": [
        "B.json:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
        "a.json:e346432021b04179518d9614f3560ccd71354a4ee101ddcb893d6959a9d6301c",
    ],
    "dataHash": "bc65574e3451669e9be07235ba8ae7bac0f2abcbfce1f9232565f544133bf515",
}


def selftest():
    """기준 구현이 시험값을 내는지. 틀리면 manifest 를 안 쓴다."""
    files = {n: t.encode("utf-8") for n, t in TEST_VECTOR["files"].items()}
    names = sorted(n for n in files if counted(n))
    lines = ["%s:%s" % (n, sha256_hex(files[n])) for n in names]
    if lines != TEST_VECTOR["lines"]:
        return "시험값 줄이 다르다: %s" % lines
    got = data_hash(files)
    if got != TEST_VECTOR["dataHash"]:
        return "시험값 dataHash 가 다르다: %s" % got
    # 빈 목록의 지문과 이름 차례가 대소문자를 가리는지도 본다
    ci = sorted(names, key=str.lower)
    if ci == names:
        return "시험값이 대소문자 정렬과 ordinal 정렬을 못 가른다"
    return None


def collect():
    """{이름: 바이트}, {이름: 출처}. 출처는 저장소 안 상대 경로."""
    files, src = {}, {}
    for p in sorted(GAME.glob("*.json")):
        if not counted(p.name):
            continue
        files[p.name] = p.read_bytes()
        src[p.name] = "out/game/" + p.name
    if CARDS.exists():
        if CARDS.name in files:
            raise ValueError("out/game 과 out/data 에 같은 이름이 있다: " + CARDS.name)
        files[CARDS.name] = CARDS.read_bytes()
        src[CARDS.name] = "out/data/" + CARDS.name
    return files, src


def build(strict=False):
    err = selftest()
    if err:
        return None, [err]
    files, src = collect()
    missing = [n for n in REQUIRED if n not in files]
    if missing:
        return None, ["꼭 있어야 하는 파일이 없다: %s. 파생 순서를 본다 (derive_game.js, derive_scenes.py, derive_town.py)"
                      % " ".join(missing)]
    pending = [n for n in LATER if n not in files]
    if pending and strict:
        return None, ["아직 안 내려온 파일이 있다: %s" % " ".join(pending)]
    known = set(REQUIRED) | set(LATER)
    extra = sorted(n for n in files if n not in known)
    rows = [{"file": n, "bytes": len(files[n]), "sha256": sha256_hex(files[n]), "from": src[n]}
            for n in sorted(files)]
    body = {
        "note": "게임 Data 폴더에 들어가는 *.json 의 크기와 해시, 그리고 두 노트북이 맞춰 보는 dataHash 다. "
                "손으로 고치지 않는다. scripts/derive_game_manifest.py 를 다시 돌린다.",
        "generator": "scripts/derive_game_manifest.py",
        "dataHash": data_hash(files),
        "algorithm": ALGORITHM,
        "count": len(rows),
        "files": rows,
        "pending": pending,
        "unlisted": extra,
        "testVector": TEST_VECTOR,
    }
    return body, []


def main(argv):
    strict = "--strict" in argv
    check = "--check" in argv
    body, errs = build(strict)
    if errs:
        for e in errs:
            print("[실패] " + e)
        return 1
    text = json.dumps(body, ensure_ascii=False, indent=1) + "\n"
    if check:
        have = MANIFEST.read_text(encoding="utf-8") if MANIFEST.exists() else None
        if have != text:
            print("[실패] out/game/manifest.json 이 지금 파일과 다르다. python3 scripts/derive_game_manifest.py 를 돌린다")
            return 1
        print("out/game/manifest.json 이 지금 파일과 같다 / dataHash %s" % body["dataHash"])
        return 0
    MANIFEST.write_text(text, encoding="utf-8")
    print("out/game/manifest.json / 파일 %d개 %.1fKB / dataHash %s%s"
          % (body["count"], sum(r["bytes"] for r in body["files"]) / 1024, body["dataHash"],
             " / 아직 안 내려온 파일 %s" % " ".join(body["pending"]) if body["pending"] else ""))
    if body["pending"]:
        print("[알림] 지문은 지금 있는 파일로만 센 값이다. 다 내려오면 다시 돌린다 (all.py 는 --strict)")
    if body["unlisted"]:
        print("[알림] 적어 두지 않은 파일이 지문에 들어갔다: %s. 게임 Data 에 가는 것이 맞으면 REQUIRED 나 LATER 에 넣는다"
              % " ".join(body["unlisted"]))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
