#!/usr/bin/env python3
"""`media/english/manifest.json` 의 크기와 해시를 다시 잰다.

이 표는 받은 미디어가 온전한지 보라고 있는 것이다. 264줄이고 160MB 를 가리킨다.
**T152 에 처음 대 봤다. 264 중 56이 틀렸고 11개는 아예 없었다.**

```
맞음 208   다름 56   표에 없는 파일 11
```

대본 52편은 하나같이 25바이트씩 커져 있었다. 어느 턴에 머리 한 줄을 더한 것이다.
카탈로그 둘은 작아져 있었다. **없는 파일 열하나에 `RIGHTS.md` 와 `archive/` 가 다 있었다.**

그 둘이 무엇인가 하면 권리 대장과 말뭉치 등록부다.
**받아 쓸 때 제일 먼저 확인해야 하는 것이 표 밖에 있었다.**
Santa Barbara 말뭉치를 어디까지 만져도 되는지가 `archive/sbcsae.json` 에 적혀 있다.

T150 에 `out/data` 에서 겪은 것과 같은 모양이다.
**온전한지 보라고 만든 표가 스스로 낡아 있었다.** 그것이 없는 표보다 나쁘다.

원래 이 표는 `media/english/tools/collect_media.py` 가 만든다.
그것은 망을 타고 160MB 를 다시 받는다. 여기서는 안 돌린다.
**그래서 이 파생기는 받아 오는 값과 재는 값을 갈라 다룬다.**

- 받아 오는 값(출처 주소, 라이선스, 역할, 종류)은 있던 것을 그대로 옮긴다
- 재는 값(크기, 해시)은 파일에서 다시 잰다
- 표에 없던 파일은 아래 `ADD` 에 적어 둔 역할로 넣는다. 적어 두지 않은 것이 나오면 실패다

쓰는 법:
    python3 scripts/derive_media_manifest.py

규격: docs/roadmap.md 11.11
"""
import hashlib
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent
MEDIA = ROOT / "media" / "english"
MF = MEDIA / "manifest.json"

SELF = "Repository operations file, not VOA material."

# 표에 없던 파일. **하나마다 역할과 권리를 적어 둔다.**
# 여기 적지 않은 파일이 새로 생기면 실패한다. 조용히 표에 끼는 자리를 안 만든다.
ADD = {
    "RIGHTS.md": ("rights-ledger", "text/markdown", SELF),
    "archive/README.md": ("documentation", "text/markdown", SELF),
    "archive/RELEASE.md": ("documentation", "text/markdown", SELF),
    "archive/BUILD_RELEASE": ("release-build-definition", "text/plain", SELF),
    "archive/registry.json": ("archive-registry", "application/json", SELF),
    "archive/voa-lle1-full.json": ("archive-registry", "application/json", SELF),
    "archive/voa-lle2-full.json": ("archive-registry", "application/json", SELF),
    # **본문이 없는 등록부다.** 제목과 설명과 원본 주소와 허용 범위만 있다.
    # 그 말뭉치는 파생본 배포를 막는다. 그래서 대본도 소리도 저장소에 없다.
    "archive/sbcsae.json": ("archive-registry",
                            "application/json",
                            "Registry only. No corpus transcript text or audio. "
                            "Santa Barbara Corpus is CC BY-ND; derivatives are not redistributed."),
    "tools/collect_media.py": ("collector", "text/x-python", SELF),
    "tools/validate_media.py": ("validator", "text/x-python", SELF),
    "tools/requirements.txt": ("collector-dependencies", "text/plain", SELF),
}

# 표는 자기 자신을 못 담는다. 담는 순간 해시가 바뀐다.
SKIP = {"manifest.json"}


def main():
    if not MF.exists():
        print("[실패] %s 가 없다" % MF)
        return 1
    m = json.loads(MF.read_text(encoding="utf-8"))
    keep = {f["path"]: f for f in m["files"]}

    here = sorted(p for p in MEDIA.rglob("*") if p.is_file())
    rows, added, remeasured, unknown = [], [], [], []
    for p in here:
        rel = p.relative_to(MEDIA).as_posix()
        if rel in SKIP:
            continue
        path = p.relative_to(ROOT).as_posix()
        b = p.read_bytes()
        digest = hashlib.sha256(b).hexdigest()
        old = keep.pop(path, None)
        if old is None:
            if rel not in ADD:
                unknown.append(path)
                continue
            role, mime, lic = ADD[rel]
            added.append(path)
        else:
            role, mime, lic = old["role"], old["mime"], old["license"]
            if old["bytes"] != len(b) or old["sha256"] != digest:
                remeasured.append(path)
        row = {"path": path, "role": role, "bytes": len(b), "mime": mime,
               "sha256": digest, "license": lic}
        if old and old.get("sourceUrl"):
            row["sourceUrl"] = old["sourceUrl"]
        rows.append(row)

    if unknown:
        print("[실패] 표에도 없고 ADD 에도 없는 파일이 있다:")
        for u in unknown[:20]:
            print("   ", u)
        print("새로 넣은 것이면 derive_media_manifest.py 의 ADD 에 역할과 권리를 적는다.")
        return 1
    if keep:
        print("[실패] 표에는 있는데 파일이 없다:")
        for k in sorted(keep)[:20]:
            print("   ", k)
        return 1

    rows.sort(key=lambda r: r["path"])
    m["files"] = rows
    m["summary"] = {"lessons": m["summary"]["lessons"],
                    "files": len(rows),
                    "bytes": sum(r["bytes"] for r in rows)}
    MF.write_text(json.dumps(m, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("media/english/manifest.json / 파일 %d개 %.1fMB / 다시 잰 것 %d개 / 새로 넣은 것 %d개"
          % (len(rows), m["summary"]["bytes"] / 1048576, len(remeasured), len(added)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
