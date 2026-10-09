#!/usr/bin/env python3
"""권리 검사 (docs/rights_audit.md). 도구 쪽(앱, 강의 자료에 쓴 외부 자료)이 docs/sources.md 규칙을 지키는가.

규칙 (CLAUDE.md, docs/sources.md 1장, 사용자 지시): 저장소에는 퍼블릭 도메인, CC0, CC BY 만 둔다.
BY-SA, BY-NC, BY-ND, 권리 불명은 안 된다. **예외는 하나다: Santa Barbara 말뭉치(CC BY-ND 3.0 US)** (사용자가 쓰기로 정했다, 2026-10-09).
ND 가 막는 것은 고친 판을 남에게 주는 것이므로, 말뭉치는 쓰되 저장소에 소리나 고친 파일은 안 둔다 (판 7).

판 열: **판마다 깸 시험이 있다.** `--break` 는 판마다 실패를 하나 심어 그 판이 잡는지 본다. 안 잡는 판이 하나라도 있으면 실패다.

    1 assets_license   tools/game/assets.json 의 license 칸이 CC0, 퍼블릭 도메인, CC BY 중 하나. 칸이 비거나 허용 밖이면 실패.
                       **예외: source 가 sbcsae 이고 license 가 정확히 CC-BY-ND-3.0-US 인 대본(.trn, .cha) 항목.** 주소는 sbcsae.json 의
                       공식 UCSB 주소여야 하고(고친 사본 금지) 60쌍이 빠짐없이 있어야 한다. 다른 출처의 ND, NC, SA 는 계속 실패
    2 assets_ccby      CC BY 항목에 출처 주소(page 나 url)가 있다. 없으면 출처 표기를 못 한다. 말뭉치 ND 항목은 저작자 표기(credit)도 있어야 한다
    3 ext_license      out/data/ext_*.json 의 파일과 편 권리 칸이 허용 다섯 중 하나
    4 ext_ccby_credit  Tatoeba(CC BY 2.0 FR) 줄마다 저자(owner)와 원문 주소가 있고, 파일에 표기 문구와 저자 목록이 있다
    5 media_license    media/english/manifest.json 의 권리 칸이 알려진 셋 중 하나
    6 registry_license media/english/archive/registry.json 의 licenses 에 BY-ND(말뭉치 하나 말고), BY-NC, BY-SA 가 없다
    7 santa_barbara    Santa Barbara 말뭉치: 저장소에 소리, 자른 파일, 대본 원문(.trn, .cha)이 없다. 등록부 60건이 고치지 않은 채 배포한다는 꼴과 저작자 표기를 갖췄다
    8 no_external      english.html 과 eng2p/app 이 밖의 주소에서 글꼴, 스크립트, 이미지를 불러오지 않는다
    9 no_font_files    저장소에 글꼴 파일(ttf, otf, woff)이 없다 (글꼴은 PC 에만. sources.md 5장)

**알려진 위반은 없다** (2026-10-09 사용자가 말뭉치를 쓰기로 정해서 알려진 목록을 없앴다). `--strict` 는 예전 인자라 받기만 하고 하는 일은 같다.

사용법:
    python3 scripts/check_rights.py            # 검사
    python3 scripts/check_rights.py --strict   # 같다 (알려진 위반이 없어졌다)
    python3 scripts/check_rights.py --break    # 검사 + 깸 시험
    python3 scripts/check_rights.py --summary  # 갈래별 개수

종료 코드: 0 통과, 1 실패. 표준 라이브러리만 쓴다. all.py 에는 안 넣었다(보고서에 넣을 줄을 적었다).
"""
import copy
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)          # eng2p/
REPO = os.path.dirname(ROOT)          # 저장소 루트

# --------------------------------------------------------------- 분류

RE_CCBY = re.compile(r"^CC-BY-(\d\.\d)(-[A-Z]{2,3})?$")
RE_CC0 = re.compile(r"^CC0(-1\.0)?$")
NOT_ALLOWED = re.compile(r"\bBY[-\s]?(NC|SA|ND)\b|\bNonCommercial\b|\bNoDerivs?\b|\bShareAlike\b|all rights reserved", re.I)


def classify(lic):
    """권리 글 -> CC0 | PD | CCBY | BAD"""
    if not isinstance(lic, str) or not lic.strip():
        return "BAD"
    s = lic.strip()
    if NOT_ALLOWED.search(s):
        return "BAD"
    head = re.split(r"[\s(]", s, maxsplit=1)[0]
    if RE_CC0.match(head):
        return "CC0"
    if RE_CCBY.match(head):
        return "CCBY"
    low = s.lower()
    if head.startswith("PD") or low.startswith("public domain") or low.startswith("public-domain"):
        return "PD"
    return "BAD"


def classify_item(it):
    """assets.json 항목 -> CC0 | PD | CCBY | SBC-ND | BAD.
    SBC-ND 는 **source 가 sbcsae 이고 license 가 정확히 CC-BY-ND-3.0-US 인 항목만**이다. 다른 ND, NC, SA 는 classify 가 BAD 로 막는다."""
    if it.get("source") == SBC_ASSET_SOURCE and it.get("license") == SBC_ASSET_LICENSE:
        return "SBC-ND"
    return classify(it.get("license"))


# ext 파일이 쓰는 권리 이름 (derive_ext_common.LICENSES 와 같다. 이 검사는 그 파일을 안 불러 따로 둔다)
EXT_LICENSES = {"VOA-PD", "PD-USGov", "PD(US,KR)", "CC0-1.0", "CC-BY-2.0-FR"}
EXT_NAMES = ("radio", "smalltalk", "notices", "readers")

# media/english/manifest.json 에 지금 있는 권리 글의 앞부분 셋 (2026-10-09)
MEDIA_LICENSE_HEADS = (
    "VOA Learning English public-domain material",
    "Repository operations file",
    "Registry only. No corpus transcript text or audio.",
)

# BY-ND 가 허용되는 단 하나: Santa Barbara 말뭉치 (사용자 결정 2026-10-09)
SBC_LICENSE_KEY = "cc-by-nd-3.0-us"
SBC_TREATMENT = "redistribute-unchanged-with-attribution"
AUDIO_SUFFIX = {".wav", ".mp3", ".flac", ".m4a", ".ogg", ".opus", ".aac", ".aif", ".aiff"}
TRANSCRIPT_SUFFIX = {".trn", ".cha"}   # 말뭉치 대본 원문. 저장소에 안 둔다 (PC 에 받고, 고치지 않은 원본은 릴리스에만)

# assets.json 에 말뭉치 대본 항목이 허용되는 단 하나의 꼴 (사용자 결정 2026-10-09)
SBC_ASSET_SOURCE = "sbcsae"
SBC_ASSET_LICENSE = "CC-BY-ND-3.0-US"
SBC_CREDIT = "Du Bois, John W., et al., Santa Barbara Corpus of Spoken American English, Parts 1-4, University of California, Santa Barbara"
BAD_REGISTRY_KEY = re.compile(r"(^|[-_ ])(nd|nc|sa)([-_ ]|$)", re.I)
SB_PATTERN = re.compile(r"santa.?barbara|sbcsae", re.I)
# 말뭉치를 말하는 파일은 이제 얼마든지 있어도 된다. 개수만 센다
SB_EXEMPT = {"eng2p/docs/rights_audit.md", "eng2p/scripts/check_rights.py"}

TEXT_SUFFIX = {".md", ".json", ".js", ".html", ".py", ".yml", ".yaml", ".txt", ".ps1", ".css", ".csv", ".tsv"}
FONT_SUFFIX = {".ttf", ".otf", ".woff", ".woff2", ".eot"}
LOAD_RE = re.compile(
    r"""(<(?:script|img|iframe|audio|video|source|embed)\b[^>]*\bsrc\s*=\s*["']https?://"""
    r"""|<link\b[^>]*\bhref\s*=\s*["']https?://"""
    r"""|@import\s+(?:url\()?\s*["']?https?://"""
    r"""|\burl\(\s*["']?https?://"""
    r"""|\bfetch\(\s*["']https?://"""
    r"""|\bnew\s+Audio\(\s*["']https?://)""", re.I)


# --------------------------------------------------------------- 자료 읽기

def read_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def tracked_files():
    try:
        out = subprocess.run(["git", "-C", REPO, "ls-files", "-z"], capture_output=True, check=True).stdout
        return [p for p in out.decode("utf-8").split("\0") if p]
    except (OSError, subprocess.CalledProcessError):
        res = []
        for dp, dn, fn in os.walk(REPO):
            dn[:] = [d for d in dn if d != ".git"]
            for f in fn:
                res.append(os.path.relpath(os.path.join(dp, f), REPO).replace(os.sep, "/"))
        return res


def load():
    files = tracked_files()
    ctx = {"files": files}
    ctx["assets"] = read_json(os.path.join(ROOT, "tools", "game", "assets.json"))
    ctx["ext"] = {n: read_json(os.path.join(ROOT, "out", "data", "ext_%s.json" % n)) for n in EXT_NAMES}
    ctx["manifest"] = read_json(os.path.join(REPO, "media", "english", "manifest.json"))
    ctx["registry"] = read_json(os.path.join(REPO, "media", "english", "archive", "registry.json"))
    sb, loads, scanned = [], [], 0
    scan_loads = [p for p in files if p == "english.html" or (p.startswith("eng2p/app/") and os.path.splitext(p)[1] in (".html", ".js", ".css"))]
    for p in files:
        if os.path.splitext(p)[1].lower() not in TEXT_SUFFIX or p in SB_EXEMPT:
            continue
        full = os.path.join(REPO, p)
        try:
            if os.path.getsize(full) > 8_000_000:
                continue
            with open(full, encoding="utf-8", errors="replace") as f:
                t = f.read()
        except OSError:
            continue
        if SB_PATTERN.search(t):
            sb.append(p)
        if p in scan_loads:
            scanned += 1
            for m in LOAD_RE.finditer(t):
                loads.append((p, t[m.start():m.start() + 80].replace("\n", " ")))
    ctx["sb_files"] = sorted(sb)
    ctx["sbc_catalog"] = read_json(os.path.join(REPO, "media", "english", "archive", "sbcsae.json"))
    ctx["loads"] = loads
    ctx["scanned"] = scanned
    ctx["font_files"] = [p for p in files if os.path.splitext(p)[1].lower() in FONT_SUFFIX]
    return ctx


# --------------------------------------------------------------- 판. (실패들, 알려진 것들) 을 돌려준다

def sbc_asset_problems(ctx):
    """말뭉치 대본 항목이 ND 의 조건을 지키는가. -> [실패 글].
    고치지 않은 원본이어야 하니 주소는 sbcsae.json 의 공식 UCSB 주소여야 하고(고친 사본을 가리키면 안 된다), 60쌍이 빠짐없이 한 번씩 있어야 한다.
    파일 갈래는 대본(.trn, .cha)뿐이다. 소리는 이 목록에 안 든다(PC 에서만 받고 자른다)."""
    f = []
    want = {}
    for it in ctx["sbc_catalog"].get("items") or []:
        want[it.get("transcriptTrn")] = (it.get("sourceId"), ".trn")
        want[it.get("transcriptChat")] = (it.get("sourceId"), ".cha")
    seen = {}
    for it in ctx["assets"].get("items", []):
        if it.get("source") != SBC_ASSET_SOURCE:
            continue
        fl = str(it.get("file"))
        ext = os.path.splitext(fl.lower())[1]
        if ext not in TRANSCRIPT_SUFFIX:
            f.append("%s: sbcsae 항목은 대본(.trn, .cha)뿐이다. 소리나 다른 파일은 목록에 안 든다" % fl)
        if it.get("url") not in want:
            f.append("%s: 주소가 sbcsae.json 의 공식 UCSB 주소가 아니다. 고치지 않은 원본만 받는다" % fl)
        else:
            sid, wext = want[it["url"]]
            if ext != wext or not fl.upper().endswith(sid + wext.upper()):
                f.append("%s: 파일 이름이 주소(%s%s)와 다르다" % (fl, sid, wext))
            seen[it["url"]] = seen.get(it["url"], 0) + 1
    miss = [u for u in want if seen.get(u, 0) != 1]
    if miss:
        f.append("sbcsae: 60쌍(대본 120개)이 한 번씩 다 있어야 한다. 모자라거나 겹친 주소 %d개 (예: %s)" % (len(miss), str(miss[0])[-30:]))
    return f


def c_assets_license(ctx):
    items = ctx["assets"].get("items", [])
    f = []
    if not items:
        f.append("assets.json 에 items 가 없다")
    for i, it in enumerate(items):
        if classify_item(it) == "BAD":
            f.append("#%d %s: 권리 칸이 허용 밖이거나 비었다: %r" % (i, it.get("file"), it.get("license")))
    f += sbc_asset_problems(ctx)
    return f, []


def c_assets_ccby(ctx):
    f = []
    for it in ctx["assets"].get("items", []):
        k = classify_item(it)
        if k in ("CCBY", "SBC-ND") and not (it.get("page") or it.get("url")):
            f.append("%s: 표기 의무가 있는 항목(%s)인데 출처 주소가 없다" % (it.get("file"), k))
        if k == "SBC-ND" and it.get("credit") != SBC_CREDIT:
            f.append("%s: 말뭉치 대본인데 저작자 표기(credit)가 정해진 줄과 다르거나 없다" % it.get("file"))
    return f, []


def c_ext_license(ctx):
    f = []
    for n in EXT_NAMES:
        d = ctx["ext"][n]
        if d.get("license") not in EXT_LICENSES:
            f.append("ext_%s: 파일 권리 칸이 %r" % (n, d.get("license")))
        for x in d.get("items", []):
            if x.get("license") not in EXT_LICENSES:
                f.append("ext_%s %s: 편 권리 칸이 %r" % (n, x.get("id"), x.get("license")))
    return f, []


def c_ext_ccby_credit(ctx):
    f = []
    d = ctx["ext"]["smalltalk"]
    owners = set(d.get("owners") or [])
    credit = d.get("credit") or ""
    if "Tatoeba" not in credit or "CC BY" not in credit:
        f.append("ext_smalltalk: 표기 문구(credit)에 Tatoeba 와 CC BY 가 없다")
    if not d.get("licenseUrl"):
        f.append("ext_smalltalk: licenseUrl 이 없다")
    missing = set()
    for x in d.get("items", []):
        if x.get("license") != "CC-BY-2.0-FR":
            continue
        if not x.get("owner"):
            f.append("ext_smalltalk %s: 저자(owner)가 없다" % x.get("id"))
        elif x["owner"] not in owners:
            missing.add(x["owner"])
        if not str(x.get("src", "")).startswith("https://tatoeba.org/"):
            f.append("ext_smalltalk %s: 원문 주소(src)가 Tatoeba 가 아니다" % x.get("id"))
    if missing:
        f.append("ext_smalltalk: owners 목록에 없는 저자 %d명 (예: %s)" % (len(missing), ", ".join(sorted(missing)[:3])))
    return f[:20], []


def c_media_license(ctx):
    f = []
    for e in ctx["manifest"].get("files", []):
        lic = e.get("license") or ""
        if not any(lic.startswith(h) for h in MEDIA_LICENSE_HEADS):
            f.append("%s: 알려지지 않은 권리 글 %r" % (e.get("path"), lic[:60]))
    return f[:20], []


def c_registry_license(ctx):
    fatal = []
    for k, v in (ctx["registry"].get("licenses") or {}).items():
        bad = BAD_REGISTRY_KEY.search(k) or NOT_ALLOWED.search(str(v.get("name", "")))
        if bad and k != SBC_LICENSE_KEY:
            fatal.append("archive/registry.json licenses[%r]: BY-ND, BY-NC, BY-SA 계열이 있다 (BY-ND 는 Santa Barbara 말뭉치 하나만 허용)" % k)
    return fatal, []


def c_santa_barbara(ctx):
    """말뭉치는 써도 된다. 단 ND 의 조건을 지킨다: 저장소에 소리와 자른 파일을 안 둔다, 60건이 고치지 않은 채 배포한다는 꼴을 갖춘다"""
    fatal = []
    for p in ctx["files"]:
        low = p.lower()
        if os.path.splitext(low)[1] in AUDIO_SUFFIX and (SB_PATTERN.search(low) or re.search(r"(^|[/_.-])sbc\d*", low)):
            fatal.append("%s: 말뭉치 소리나 자른 소리가 저장소에 있다. 소리는 PC 에만 둔다" % p)
        if os.path.splitext(low)[1] in TRANSCRIPT_SUFFIX and (SB_PATTERN.search(low) or re.search(r"(^|[/_.-])sbc\d*", low)):
            fatal.append("%s: 말뭉치 대본 원문이 저장소에 있다. PC 에 받고(assets.json), 고치지 않은 원본은 릴리스에만 둔다" % p)
    cat = ctx["sbc_catalog"]
    items = cat.get("items") or []
    if len(items) != 60:
        fatal.append("sbcsae.json: 60건이어야 한다 (%d건)" % len(items))
    if cat.get("license") != SBC_LICENSE_KEY or not cat.get("licenseUrl") or not cat.get("source"):
        fatal.append("sbcsae.json: license, licenseUrl, source(저작 기관) 중 빈 것이 있다")
    for it in items:
        if it.get("license") != SBC_LICENSE_KEY or it.get("allowedTreatment") != SBC_TREATMENT:
            fatal.append("sbcsae.json %s: 권리 키나 allowedTreatment 가 고치지 않은 채 배포하는 꼴이 아니다" % it.get("id"))
    return fatal[:20], []


def c_no_external(ctx):
    return ["%s: 밖의 주소를 불러온다: %s" % (p, s) for p, s in ctx["loads"]][:20], []


def c_no_font_files(ctx):
    return ["글꼴 파일이 저장소에 있다: %s" % p for p in ctx["font_files"]], []


CHECKS = [
    ("assets_license", c_assets_license), ("assets_ccby", c_assets_ccby), ("ext_license", c_ext_license),
    ("ext_ccby_credit", c_ext_ccby_credit), ("media_license", c_media_license), ("registry_license", c_registry_license),
    ("santa_barbara", c_santa_barbara), ("no_external", c_no_external), ("no_font_files", c_no_font_files),
]


def run(ctx):
    return {name: fn(ctx) for name, fn in CHECKS}


# --------------------------------------------------------------- 깸 시험

def breaks(ctx):
    """판마다 실패를 하나 심는다. 그 판이 실패 쪽(fatal)에 담지 못하면 놓친 것이다. -> 못 잡은 판 이름들"""
    def mut_assets_license(c):
        c["assets"]["items"].append({"file": "x", "page": "p", "license": "CC-BY-NC-4.0"})

    def mut_assets_license_empty(c):
        c["assets"]["items"][0]["license"] = ""

    def mut_assets_ccby(c):
        c["assets"]["items"].append({"file": "x", "license": "CC-BY-4.0 (Someone)"})

    def sbc_items(c):
        return [x for x in c["assets"]["items"] if x.get("source") == SBC_ASSET_SOURCE]

    def mut_assets_nd_other_source(c):
        # 말뭉치 말고는 ND 를 못 쓴다: 같은 license 글이어도 source 가 다르면 막아야 한다
        c["assets"]["items"].append({"source": "polyhaven", "file": "x", "page": "p", "license": "CC-BY-ND-3.0-US"})

    def mut_assets_sbc_nd_other_version(c):
        sbc_items(c)[0]["license"] = "CC-BY-ND-4.0"

    def mut_assets_sbc_nc(c):
        sbc_items(c)[0]["license"] = "CC-BY-NC-3.0-US"

    def mut_assets_sbc_wrong_url(c):
        sbc_items(c)[0]["url"] = "https://example.invalid/mirror/SBC001.trn"

    def mut_assets_sbc_missing(c):
        c["assets"]["items"].remove(sbc_items(c)[-1])

    def mut_assets_sbc_dup(c):
        c["assets"]["items"].append(dict(sbc_items(c)[0]))

    def mut_assets_sbc_audio(c):
        x = dict(sbc_items(c)[0])
        x["file"] = "sbcsae/audio/SBC001.wav"
        c["assets"]["items"].append(x)

    def mut_assets_sbc_credit_empty(c):
        sbc_items(c)[0]["credit"] = ""

    def mut_assets_sbc_credit_changed(c):
        sbc_items(c)[0]["credit"] = "Santa Barbara Corpus"

    def mut_assets_sbc_no_page(c):
        x = sbc_items(c)[0]
        x["page"] = ""
        x["url"] = ""

    def mut_ext_license(c):
        c["ext"]["notices"]["items"][0]["license"] = "All rights reserved"

    def mut_ext_license_file(c):
        c["ext"]["smalltalk"]["license"] = "CC-BY-SA-4.0"

    def mut_ext_credit_owner(c):
        for x in c["ext"]["smalltalk"]["items"]:
            if x.get("license") == "CC-BY-2.0-FR":
                x["owner"] = ""
                break

    def mut_ext_credit_text(c):
        c["ext"]["smalltalk"]["credit"] = ""

    def mut_ext_credit_owners(c):
        c["ext"]["smalltalk"]["owners"] = []

    def mut_media(c):
        c["manifest"]["files"].append({"path": "x.mp3", "license": "Personal use only"})

    def mut_registry(c):
        c["registry"].setdefault("licenses", {})["cc-by-nc-4.0"] = {"name": "Creative Commons Attribution-NonCommercial 4.0"}

    def mut_sb(c):
        c["files"] = c["files"] + ["media/english/audio/sbc001_cut.wav"]

    def mut_sb_transcript(c):
        c["files"] = c["files"] + ["media/english/SBC001.trn"]

    def mut_sb_treatment(c):
        c["sbc_catalog"]["items"][0]["allowedTreatment"] = "edit-and-share"

    def mut_sb_count(c):
        c["sbc_catalog"]["items"] = c["sbc_catalog"]["items"][:-1]

    def mut_registry_nd(c):
        c["registry"].setdefault("licenses", {})["cc-by-nd-4.0"] = {"name": "Creative Commons Attribution-NoDerivatives 4.0"}

    def mut_external(c):
        c["loads"] = c["loads"] + [("english.html", '<link href="https://fonts.googleapis.com/css2?family=X"')]

    def mut_font(c):
        c["font_files"] = c["font_files"] + ["media/x.woff2"]

    plan = {
        "assets_license": [mut_assets_license, mut_assets_license_empty, mut_assets_nd_other_source, mut_assets_sbc_nd_other_version,
                           mut_assets_sbc_nc, mut_assets_sbc_wrong_url, mut_assets_sbc_missing, mut_assets_sbc_dup, mut_assets_sbc_audio],
        "assets_ccby": [mut_assets_ccby, mut_assets_sbc_credit_empty, mut_assets_sbc_credit_changed, mut_assets_sbc_no_page],
        "ext_license": [mut_ext_license, mut_ext_license_file],
        "ext_ccby_credit": [mut_ext_credit_owner, mut_ext_credit_text, mut_ext_credit_owners],
        "media_license": [mut_media],
        "registry_license": [mut_registry, mut_registry_nd],
        "santa_barbara": [mut_sb, mut_sb_transcript, mut_sb_treatment, mut_sb_count],
        "no_external": [mut_external],
        "no_font_files": [mut_font],
    }
    fns = dict(CHECKS)
    missed = []
    for name, muts in plan.items():
        for m in muts:
            c = copy.deepcopy(ctx)
            m(c)
            fatal, _ = fns[name](c)
            ok = bool(fatal)
            print("  [%s] %s / %s" % ("잡음" if ok else "놓침", name, m.__name__))
            if not ok:
                missed.append("%s/%s" % (name, m.__name__))
    # 거꾸로: 깨끗한 자료는 통과해야 한다 (너무 빡빡해서 늘 실패하는 검사는 쓸모없다)
    base = run(ctx)
    clean_fail = [n for n, (f, _) in base.items() if f]
    print("  [%s] 현재 자료는 실패 0 이어야 한다 (실패 판: %s)" % ("통과" if not clean_fail else "놓침", ", ".join(clean_fail) or "없음"))
    if clean_fail:
        missed.append("clean/" + ",".join(clean_fail))
    return missed


def main():
    ctx = load()
    res = run(ctx)
    strict = "--strict" in sys.argv
    n_fail = 0
    for name, (fatal, known) in res.items():
        for x in fatal[:20]:
            print("[실패] %s: %s" % (name, x))
        if len(fatal) > 20:
            print("[실패] %s: ... %d개 더" % (name, len(fatal) - 20))
        n_fail += len(fatal)
        for x in known:
            print("[%s] %s: %s" % ("실패" if strict else "알려진", name, x))
        if strict:
            n_fail += len(known)
    items = ctx["assets"].get("items", [])
    kinds = {}
    for it in items:
        k = classify_item(it)
        kinds[k] = kinds.get(k, 0) + 1
    n_known = sum(len(k) for _, k in res.values())
    print("판 %d / 실패 %d / 알려진 위반 %d / assets %d (%s) / ext 편 %d / Santa Barbara 파일 %d / 밖의 주소 검사 %d파일" % (
        len(CHECKS), n_fail, n_known, len(items), ", ".join("%s %d" % kv for kv in sorted(kinds.items())),
        sum(len(ctx["ext"][n].get("items", [])) for n in EXT_NAMES), len(ctx["sb_files"]), ctx["scanned"]))
    if "--summary" in sys.argv:
        lic = {}
        for n in EXT_NAMES:
            for x in ctx["ext"][n].get("items", []):
                lic[x.get("license")] = lic.get(x.get("license"), 0) + 1
        print("ext 편 권리: " + ", ".join("%s %d" % kv for kv in sorted(lic.items(), key=lambda kv: str(kv[0]))))
    if "--break" in sys.argv:
        print("깸 시험:")
        missed = breaks(ctx)
        total = len(CHECKS)
        print("깸 시험 %d판 중 %d판이 모든 심은 실패를 잡았다" % (total, total - len({m.split("/")[0] for m in missed if not m.startswith("clean")})))
        if missed:
            print("[실패] 깸을 못 잡은 것: " + " ".join(missed))
            n_fail += len(missed)
    return 1 if n_fail else 0


if __name__ == "__main__":
    sys.exit(main())
