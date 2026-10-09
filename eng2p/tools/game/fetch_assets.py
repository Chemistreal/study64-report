#!/usr/bin/env python3
"""게임 자료를 받아 둔다 (`docs/auto.md` 3장 2번).

**저장소에는 안 넣는다.** 받은 파일은 `GAME_STORE` (기본 /home/user/game_store) 에 둔다.
릴리스는 이 세션에서 못 만든다 (403). 그래서 **목록이 보관이다.** PC 는 `fetch_assets.ps1` 로
같은 주소에서 D 드라이브에 받고 해시로 맞춘다 (사용자 2026-10-07).

저장소에 남는 것은 목록 하나다. `tools/game/assets.json`.
무엇을 어디서 받았고 권리가 무엇이고 해시가 무엇인지. **권리가 CC0, 퍼블릭 도메인, CC BY 가
아닌 것은 받지 않는다.** CC BY 는 출처를 적는다.

출처마다 받는 법이 다르다.
    kenney      자산 쪽에서 zip 주소를 읽는다. CC0
    polyhaven   공식 API. CC0 (HDRI, 질감)
    polyhaven_models  Poly Haven 사진 스캔 **모델**(glTF 1K 한 벌). CC0. **파일을 안 받는다.** 파일 목록 API 가 주는 md5 와 크기를 항목에 적는다
                (사진처럼 보이는 모델이 필요하다 2026-10-09). 고른 목록은 게임 저장소 Tools/realistic_picks.json 이다
    ambientcg   공식 API. CC0
    oga         OpenGameArt 쪽에서 파일 주소를 읽는다. 쪽마다 CC0 를 확인한다
    geo         지형, 해저, 라이다, 길, 해안선, 땅 덮개. 퍼블릭 도메인, CC0, CC BY
    texts       하와이 문헌. 구텐베르크 등. 미국과 한국 둘 다 퍼블릭 도메인
    gov         미국 정부 생활 안내 PDF. 퍼블릭 도메인
    tatoeba     Tatoeba 영어 문장. CC BY. 영어 쪽만
    sbcsae      Santa Barbara 말뭉치 대본(TRN, CHAT) 120개. CC BY-ND 3.0 US. **고치지 않은 원본만.** 소리는 여기서 안 받는다

**해시는 두 가지다.** 받아서 잰 항목은 `sha256`, 받지 않고 API 값을 옮긴 항목(Poly Haven 모델)은 `md5`. 둘 다 `bytes` 가 있다.
md5 만 있는 항목은 PC 가 받은 뒤 md5 로 맞추고, **처음 잰 sha256 을 PC 의 `SHA256_FIRST.json` 에 적는다** (그 뒤로는 그 값이 기준이다).

사용법:
    python3 tools/game/fetch_assets.py kenney
    python3 tools/game/fetch_assets.py all                      # 모델은 안 돈다 (고른 목록이 필요하다)
    python3 tools/game/fetch_assets.py polyhaven_models --picks ../game/Tools/realistic_picks.json --catalog ../game/Tools/realistic_models.json
    python3 tools/game/fetch_assets.py verify --store D:/HonoluluGame/assets [--prefix polyhaven/models/]   # 받은 파일을 목록과 맞춘다 (sha256, 없으면 md5)
    python3 tools/game/fetch_assets.py sample --ids Shelf_01,wooden_table_02 [--keep]   # 작은 모델 몇 개만 받아 md5 와 glTF 가 가리키는 파일을 맞추고 지운다
    python3 tools/game/fetch_assets.py selftest                 # 네트워크 없이: md5 맞춤, 나쁜 파일 줄 거르기, glTF 삼각형 세기, LOD 가르기
"""
import datetime
import hashlib
import json
import os
import re
import shutil
import sys
import tempfile
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
LIST = os.path.join(HERE, "assets.json")
STORE = os.environ.get("GAME_STORE", "/home/user/game_store")
UA = {"User-Agent": "study64-game-fetch/1.0 (CC0 asset mirror for a private co-op game)"}

# 장소 열셋과 사람과 소리를 덮는 Kenney 꾸러미. 에셋 조사(2026-10-07)가 고른 것에 더해
# 동네를 실제보다 화려하게 지으려고 넓게 받는다. 다 CC0 다.
KENNEY = [
    "city-kit-suburban", "city-kit-commercial", "city-kit-roads", "city-kit-industrial",
    "building-kit", "modular-buildings", "furniture-kit", "food-kit", "mini-market",
    "nature-kit", "watercraft-kit", "car-kit", "train-kit", "holiday-kit",
    "mini-characters", "animated-characters-1", "animated-characters-2",
    "animated-characters-3", "animated-characters-protagonists", "animated-characters-survivors",
    "survival-kit", "kitchen-kit", "restaurant-kit", "coaster-kit", "fantasy-town-kit",
    "pirate-kit", "space-kit", "tower-defense-kit", "minigolf-kit", "platformer-kit",
    "rpg-audio", "interface-sounds", "music-jingles", "impact-sounds", "digital-audio",
    "casino-audio", "voiceover-pack", "ui-pack", "game-icons", "emotes-pack",
    "input-prompts", "particle-pack", "prototype-textures",
]

# HDRI 는 4k 한 장이 25MB 다. 갈래마다 다 받으면 수십 GB 가 된다.
# 바닷가와 해 뜨고 지는 하늘과 맑은 하늘만, 갈래마다 위에서부터 몇 장
POLYHAVEN_HDRI = ["beach", "sunrise-sunset", "skies", "urban"]
POLYHAVEN_PER = {"hdris": 12, "textures": 6}
POLYHAVEN_TEX = ["sand", "asphalt", "concrete", "plaster", "wood", "tiles", "rock", "terrain",
                 "floor", "brick", "fabric", "metal", "roofing", "grass"]


def get(url, binary=False, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
                b = r.read()
                return b if binary else b.decode("utf-8", "replace")
        except Exception as e:
            if i == tries - 1:
                raise
            time.sleep(2 ** (i + 1))


# 받는 동안에는 저장소 밖에 쓴다. 끝날 때만 저장소 목록을 바꾼다.
# 받는 내내 저장소 파일이 바뀌면 커밋할 때마다 반쯤 받은 목록이 들어간다
WORK = os.path.join(STORE, "assets.json")


def load():
    for p in (WORK, LIST):
        if os.path.exists(p):
            return json.load(open(p, encoding="utf-8"))
    return {"note": "게임 자료 목록. 파일은 저장소 밖에 있다. tools/game/fetch_assets.py 가 쓴다.",
            "store": "GitHub 릴리스, 나중에 PC D 드라이브", "items": []}


def save(L):
    L["items"].sort(key=lambda x: (x["source"], x["file"]))
    L["count"] = len(L["items"])
    L["bytes"] = sum(x["bytes"] for x in L["items"])
    os.makedirs(STORE, exist_ok=True)
    with open(WORK, "w", encoding="utf-8") as f:
        json.dump(L, f, ensure_ascii=False, indent=1)
        f.write("\n")


def publish(L):
    """다 받은 뒤 저장소 목록을 바꾼다."""
    save(L)
    with open(LIST, "w", encoding="utf-8") as f:
        json.dump(L, f, ensure_ascii=False, indent=1)
        f.write("\n")


def keep(L, source, name, url, license, page, sub="", ua=None, extra=None):
    """한 파일을 받는다. 이미 같은 주소로 받았으면 건너뛴다.
    지형 타일은 한 장이 수백 MB 라 메모리에 안 올리고 흘려 받으며 해시를 센다.
    ua: 이 출처에만 쓸 User-Agent 머리. extra: 항목에 더 적을 칸(예: 저작자 표기 credit)."""
    have = {x["url"] for x in L["items"]}
    if url in have:
        return
    d = os.path.join(STORE, source, sub)
    os.makedirs(d, exist_ok=True)
    fn = os.path.join(d, name)
    h = hashlib.sha256()
    n = 0
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=ua or UA), timeout=300) as r, \
                    open(fn, "wb") as f:
                h, n = hashlib.sha256(), 0
                while True:
                    b = r.read(1 << 20)
                    if not b:
                        break
                    f.write(b)
                    h.update(b)
                    n += len(b)
            break
        except Exception:
            if i == 3:
                raise
            time.sleep(2 ** (i + 1))
    item = {
        "source": source, "file": os.path.join(source, sub, name).replace("\\", "/"),
        "url": url, "page": page, "license": license, "bytes": n,
        "sha256": h.hexdigest(),
    }
    if extra:
        item.update(extra)
    L["items"].append(item)
    print("  %-10s %8d KB  %s" % (source, n // 1024, name))


def kenney_slugs():
    """3D 와 소리 갈래의 Kenney 꾸러미를 다 찾는다. **동네를 실제보다 화려하게** 지으려면
    고른 목록으로는 모자란다. 손으로 고른 것은 앞에 두고 찾은 것을 뒤에 붙인다."""
    found = []
    for cat in ("3D", "Audio"):
        for page in range(1, 9):
            url = "https://kenney.nl/assets/category:%s" % cat + ("/page:%d" % page if page > 1 else "")
            try:
                html = get(url)
            except Exception:
                break
            got = re.findall(r'https://kenney\.nl/assets/([a-z0-9-]+)["\']', html)
            got = [g for g in got if g not in ("category", "tag", "series", "page")]
            new = [g for g in dict.fromkeys(got) if g not in found]
            if not new:
                break
            found += new
    return KENNEY + [s for s in found if s not in KENNEY]


def kenney(L):
    for slug in kenney_slugs():
        page = "https://kenney.nl/assets/" + slug
        try:
            html = get(page)
        except Exception as e:
            print("  [없음] kenney " + slug + ": " + str(e)[:60])
            continue
        m = re.search(r'https://kenney\.nl/media/pages/assets/[^"\']+\.zip', html)
        if not m:
            print("  [없음] kenney " + slug + ": zip 주소가 없다")
            continue
        keep(L, "kenney", os.path.basename(m.group(0)), m.group(0), "CC0-1.0", page)
        save(L)


def polyhaven(L):
    api = "https://api.polyhaven.com"
    for kind, cats, res, fmt in (("hdris", POLYHAVEN_HDRI, "4k", "hdr"),
                                 ("textures", POLYHAVEN_TEX, "2k", None)):
        seen = set()
        for cat in cats:
            got = json.loads(get("%s/assets?t=%s&c=%s" % (api, kind, cat)))
            # 내려받은 수가 많은 것부터. 많이 쓰인 것이 대개 쓸 만하다
            ids = sorted(got, key=lambda a: -got[a].get("download_count", 0))
            ids = [a for a in ids if a not in seen][:POLYHAVEN_PER[kind]]
            for aid in ids:
                seen.add(aid)
                files = json.loads(get("%s/files/%s" % (api, aid)))
                page = "https://polyhaven.com/a/" + aid
                if kind == "hdris":
                    f = files.get("hdri", {}).get(res, {}).get(fmt)
                    if f:
                        keep(L, "polyhaven", aid + "_" + res + ".hdr", f["url"], "CC0-1.0", page, "hdri")
                else:
                    # 텍스처는 맵마다 따로다. 색, 노멀(GL), 거칠기, 변위, AO 만
                    for mp in ("Diffuse", "nor_gl", "Rough", "Displacement", "AO", "arm"):
                        f = files.get(mp, {}).get(res, {})
                        f = f.get("jpg") or f.get("png")
                        if f:
                            keep(L, "polyhaven", os.path.basename(f["url"]), f["url"], "CC0-1.0",
                                 page, "tex/" + aid)
            save(L)


def ambientcg(L):
    api = "https://ambientcg.com/api/v2/full_json?type=Material&sort=Popular&limit=250&include=downloadData&q="
    for q in ("Ground", "Sand", "Asphalt", "Concrete", "Plaster", "Wood", "Tiles", "Bricks",
              "Fabric", "Leaves", "Bark", "Rock", "Roofing", "Paint"):
        got = json.loads(get(api + q))
        for a in got.get("foundAssets", [])[:12]:
            for cat in a.get("downloadFolders", {}).get("default", {}).get("downloadFiletypeCategories", {}).values():
                for dl in cat.get("downloads", []):
                    if dl.get("attribute") == "2K-JPG":
                        keep(L, "ambientcg", dl["fileName"], dl["downloadLink"], "CC0-1.0",
                             "https://ambientcg.com/view?id=" + a["assetId"])
        save(L)


# 에셋 조사가 쪽마다 CC0 를 확인한 곡. 이중 라이선스 곡은 CC0 쪽으로 쓴다
OGA = ["vintage-hawaii", "ukulele-forest-beginning-loop-and-end", "bossa-town",
       "feel-good-island-loop", "mad-bossa", "tropical-loop", "blue-moon-beach"]


def oga(L):
    for slug in OGA:
        page = "https://opengameart.org/content/" + slug
        html = get(page)
        if "CC0" not in html:
            print("  [건너뜀] oga " + slug + ": 쪽에 CC0 가 없다")
            continue
        for u in sorted(set(re.findall(r'https://opengameart\.org/sites/default/files/[^"\']+\.(?:ogg|mp3|wav|flac|zip)', html))):
            keep(L, "oga", urllib.request.unquote(os.path.basename(u)), u, "CC0-1.0", page, slug)
        save(L)


# 지리 (`docs/sources.md` 6장). 지리 조사(2026-10-07)가 고른 핵심 묶음. 다 퍼블릭 도메인, CC0, CC BY.
# 동네는 지은 것이고 이것은 **배경 지형과 해안과 건물 높이의 결**을 깎는 데 쓴다 (`docs/town.md`).
# OpenStreetMap, Microsoft 건물, Overture 는 ODbL 이라 안 받는다. 호놀룰루 시 건물 자료는 권리가 불명이라 안 받는다.
TNM = "https://prd-tnm.s3.amazonaws.com/StagedProducts/Elevation"
GEO = [
    # USGS 3DEP 1m 지형. 와이키키, 알라모아나, 시내, 마노아
    *[("dem_1m", "%s/1m/Projects/HI_NOAAMauiOahu_2020_B20/TIFF/USGS_1M_4_%s_HI_NOAAMauiOahu_2020_B20.tif" % (TNM, t),
       "PD-USGov", "https://apps.nationalmap.gov/downloader/") for t in ("x61y236", "x62y236", "x61y237", "x62y237")],
    # 10m 지형. 다이아몬드 헤드와 산맥 원경, 섬 실루엣
    *[("dem_10m", "%s/13/TIFF/current/%s/USGS_13_%s.tif" % (TNM, t, t),
       "PD-USGov", "https://apps.nationalmap.gov/downloader/") for t in ("n22w158", "n22w159")],
    # 땅과 바다 밑을 한 장으로. 산호초와 해변
    ("topobathy", "https://chs.coast.noaa.gov/htdata/raster2/elevation/NCEI_ninth_Topobathy_Hawaii_9428/tiles/ncei19_n21x50_w158x00_2021v1.tif",
     "CC0-1.0", "https://www.ncei.noaa.gov/products/coastal-relief-model"),
    # 길과 물과 땅표. 인구조사국
    *[("tiger", "https://www2.census.gov/geo/tiger/TIGER2025/" + u, "PD-USGov", "https://www.census.gov/geographies/mapping-files.html")
      for u in ("ROADS/tl_2025_15003_roads.zip", "EDGES/tl_2025_15003_edges.zip", "AREAWATER/tl_2025_15003_areawater.zip",
                "AREALM/tl_2025_15_arealm.zip", "POINTLM/tl_2025_15_pointlm.zip")],
    # 하와이 주 GIS. 해안선, 공원, 도서관. 주가 퍼블릭 도메인이라 적었다
    *[("state_gis", "https://files.hawaii.gov/dbedt/op/gis/data/%s.shp.zip" % f, "PD-StateOfHawaii",
       "https://planning.hawaii.gov/gis/download-gis-data/") for f in ("coastline", "parks_county", "state_libraries")],
    # 땅 덮개. 풀, 나무, 시가지, 모래 마스크
    ("landcover", "https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_N21W159_Map.tif",
     "CC-BY-4.0 (ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data 2021)", "https://esa-worldcover.org/"),
    # 오아후 항공 모자이크 2000. 색의 참고
    ("imagery", "https://cdn.coastalscience.noaa.gov/datasets/e97/2003/mosaics/HI_oahu_flight_mosaics.zip",
     "CC0-1.0", "https://catalog.data.gov/dataset/oahu-photomosaic-2000-213-214e-0516-orthorectification-and-mosaicing-of-color-aerial-photo"),
]
# 라이다 점군. 건물 높이를 직접 뽑는 원천 (ODbL 없이). 와이키키에서 카피올라니까지 핵심 구역만
LAZ_LIST = "https://noaa-nos-coastal-lidar-pds.s3.amazonaws.com/laz/geoid12b/10331/urllist_hi2022_kah_lanai_maui_molo_oahu_m10331.txt"
LAZ_BOX = (190, 235, 510, 550)  # USNG 4QFJ 100m 단위 동 시작 끝, 북 시작 끝
# 0.5m 지형. 와이키키에서 마노아까지 전역 (약 0.7GB)
DEM05_LIST = "https://noaa-nos-coastal-lidar-pds.s3.amazonaws.com/dem/HI_Kahoo_Lanai_Maui_Molo_Oahu_DEM_2022_10335/urllist10335.txt"
DEM05_BOX = (120, 265, 500, 595)


def geo(L):
    for sub, url, lic, page in GEO:
        try:
            keep(L, "geo", os.path.basename(url), url, lic, page, sub)
        except Exception as e:
            print("  [실패] geo " + os.path.basename(url) + ": " + str(e)[:80])
        save(L)
    try:
        for u in get(DEM05_LIST).split():
            m = re.search(r"4QFJ(\d{3})(\d{3})\.tif$", u)
            if m and DEM05_BOX[0] <= int(m.group(1)) <= DEM05_BOX[1] and DEM05_BOX[2] <= int(m.group(2)) <= DEM05_BOX[3]:
                try:
                    keep(L, "geo", os.path.basename(u), u, "PD-USGov",
                         "https://coast.noaa.gov/dataviewer/#/lidar/search/where:ID=10335", "dem_05m")
                except Exception as e:
                    print("  [실패] dem05 " + os.path.basename(u) + ": " + str(e)[:80])
                save(L)
    except Exception as e:
        print("  [실패] 0.5m 지형 목록: " + str(e)[:80])
    try:
        lst = get(LAZ_LIST).split()
    except Exception as e:
        print("  [실패] 라이다 목록: " + str(e)[:80])
        return
    e0, e1, n0, n1 = LAZ_BOX
    for u in lst:
        m = re.search(r"4QFJ(\d{3})(\d{3})\.(?:copc\.)?laz$", u)
        if m and e0 <= int(m.group(1)) <= e1 and n0 <= int(m.group(2)) <= n1:
            try:
                keep(L, "geo", os.path.basename(u), u, "PD-USGov",
                     "https://coast.noaa.gov/dataviewer/#/lidar/search/where:ID=10331", "laz")
            except Exception as e:
                print("  [실패] laz " + os.path.basename(u) + ": " + str(e)[:80])
            save(L)


# 하와이 문헌 (`docs/sources.md` 3장). 미국과 한국 둘 다 퍼블릭 도메인. 도서관 책과 배경과
# 쉬운 영어로 다시 쓸 이야기의 원천이다. 신성한 것과 식민 시선이 짙은 책은 안 받는다 (3.1 안 된다 줄)
GUTENBERG = {
    329: "Stevenson, Island Nights' Entertainments (The Bottle Imp)",
    66547: "Westervelt, Legends of Old Honolulu",
    66357: "Westervelt, Hawaiian Historical Legends",
    32601: "Westervelt, Legends of Ma-ui",
    18450: "Thrum, Hawaiian Folk Tales",
    56597: "Kalakaua, The Legends and Myths of Hawaii",
    13603: "Haleole, Hawaiian Romance of Laieikawai",
    60735: "Blascoer, Industrial Condition of Women and Girls in Honolulu",
    73699: "Charmian London, Our Hawaii",
    6750: "Bird, The Hawaiian Archipelago",
    3177: "Twain, Roughing It",
    2416: "London, The House of Pride",
    2152: "London, On the Makaloa Mat",
    2512: "London, The Cruise of the Snark",
    43581: "Wilder, Fruits of the Hawaiian Islands",
}
TEXTS_OTHER = [
    ("liliuokalani_hawaiis_story.html", "https://digital.library.upenn.edu/women/liliuokalani/hawaii/hawaii.html",
     "PD (1898)", "Liliuokalani, Hawaii's Story by Hawaii's Queen"),
    ("labor_conditions_in_hawaii_1916.txt", "https://archive.org/stream/cu31924092400245/cu31924092400245_djvu.txt",
     "PD-USGov (1916)", "US Dept of Labor, Labor Conditions in Hawaii"),
]


def texts(L):
    for no, title in GUTENBERG.items():
        url = "https://www.gutenberg.org/cache/epub/%d/pg%d.txt" % (no, no)
        try:
            keep(L, "texts", "pg%d.txt" % no, url, "PD (US, KR)", "https://www.gutenberg.org/ebooks/%d  %s" % (no, title), "gutenberg")
        except Exception as e:
            print("  [실패] texts pg%d: %s" % (no, str(e)[:80]))
        save(L)
    for name, url, lic, title in TEXTS_OTHER:
        try:
            keep(L, "texts", name, url, lic, title, "other")
        except Exception as e:
            print("  [실패] texts " + name + ": " + str(e)[:80])
        save(L)


# 미국 정부 생활 안내 (`docs/sources.md` 2장). 사실만 가져와 쉬운 영어로 새로 쓴다. 원문은 고치지 않고 둔다
GOV = [
    ("uscis_M-618_welcome_guide.pdf", "https://www.uscis.gov/sites/default/files/document/guides/M-618.pdf",
     "PD-USGov (그림 제외)", "https://www.uscis.gov/citizenship/learn-about-citizenship/new-immigrants"),
    # 2008년판 100문항 대신 2025년판 128문항 (2025-10-20 부터 신청자가 본다. docs/expansion.md 11장)
    ("uscis_2025_civics_128q.pdf",
     "https://www.uscis.gov/sites/default/files/document/questions-and-answers/2025-Civics-Test-128-Questions-and-Answers.pdf",
     "PD-USGov", "https://www.uscis.gov/citizenship/find-study-materials-and-resources/study-for-the-test"),
    ("uscis_reading_vocab.pdf", "https://www.uscis.gov/sites/default/files/document/guides/reading_vocab.pdf",
     "PD-USGov", "https://www.uscis.gov/citizenship"),
    ("uscis_writing_vocab.pdf", "https://www.uscis.gov/sites/default/files/document/guides/writing_vocab.pdf",
     "PD-USGov", "https://www.uscis.gov/citizenship"),
    # 주소를 고쳤다. 2025-03 경로는 ready.gov 쪽이 거는 주소가 아니었다. /hurricanes 와 /tsunamis 쪽이 실제로 거는 것
    # (game_store/gov/README.md 에 받은 날 확인한 해시가 있다. 허리케인 8c1ce13c..., 쓰나미 54aaedeb...)
    ("ready_hurricanes.pdf", "https://www.ready.gov/sites/default/files/2024-07/ready.gov_hurricane_info-sheet.pdf",
     "PD-USGov (사진 로고 제외)", "https://www.ready.gov/hurricanes"),
    ("ready_tsunamis.pdf", "https://www.ready.gov/sites/default/files/2020-03/tsunami-information-sheet.pdf",
     "PD-USGov (사진 로고 제외)", "https://www.ready.gov/tsunamis"),
]


def gov(L):
    for name, url, lic, page in GOV:
        try:
            keep(L, "gov", name, url, lic, page)
        except Exception as e:
            print("  [실패] gov " + name + ": " + str(e)[:80])
        save(L)


# Tatoeba 영어 문장 (CC BY 2.0 FR). **영어 쪽만** 쓴다. 한국어 짝은 번역 경유라 안 받는다.
# 문장마다 저자가 붙은 자세한 판을 받는다. 출처를 적어야 한다
# 확장층 잡담 (`docs/expansion.md` 4장) 이 거르는 데 셋을 더 쓴다. 영어 모어 저자, 꼬리표, CC0 문장.
# **links 파일과 다른 언어 파일은 안 받는다.** 한국어 짝을 만들 길을 처음부터 막는다
TATOEBA = [
    ("eng_sentences_detailed.tsv.bz2", "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences_detailed.tsv.bz2"),
    ("eng_tags.tsv.bz2", "https://downloads.tatoeba.org/exports/per_language/eng/eng_tags.tsv.bz2"),
    ("user_languages.tar.bz2", "https://downloads.tatoeba.org/exports/user_languages.tar.bz2"),
    ("eng_sentences_CC0.tsv.bz2", "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences_CC0.tsv.bz2"),
]


def tatoeba(L):
    for name, url in TATOEBA:
        lic = "CC0-1.0" if "CC0" in name else "CC-BY-2.0-FR (문장마다 저자 표기)"
        try:
            keep(L, "tatoeba", name, url, lic, "https://tatoeba.org/en/downloads")
        except Exception as e:
            print("  [실패] tatoeba " + name + ": " + str(e)[:80])
        save(L)


# Santa Barbara 말뭉치 대본 (CC BY-ND 3.0 US). 사용자가 쓰기로 정했다 (2026-10-09, docs/sources.md 1장 예외, 4장 말뭉치 줄).
# **ND 의 조건: 고친 판을 남에게 주지 않는다, 저작자를 적는다.** 그래서
#   - 대본은 고치지 않은 채 받아 해시만 목록에 적는다. 파일은 저장소에 안 넣는다 (PC 에 받는다)
#   - 항목마다 credit 칸에 저작자 표기를 적는다. check_rights.py 판 1 이 이 칸을 본다
#   - 소리(WAV)는 여기서 안 받는다. 공식 Box 쪽지에서 PC 로 받는다 (게임 저장소 Tools/fetch_sbc_audio.ps1)
# 목록은 media/english/archive/sbcsae.json 의 transcriptTrn, transcriptChat 60쌍이다.
SBC_CATALOG = os.path.join(HERE, "..", "..", "..", "media", "english", "archive", "sbcsae.json")
SBC_LICENSE = "CC-BY-ND-3.0-US"
SBC_PAGE = "https://www.linguistics.ucsb.edu/research/santa-barbara-corpus-spoken-american-english"
SBC_CREDIT = "Du Bois, John W., et al., Santa Barbara Corpus of Spoken American English, Parts 1-4, University of California, Santa Barbara"
# 저장소 주소만 적는다 (사용자 이메일 같은 개인 정보는 어디에도 안 보낸다)
UA_SBC = {"User-Agent": "study64-game-fetch/1.0 (https://github.com/Chemistreal/study64-report)"}


def sbcsae(L):
    cat = json.load(open(SBC_CATALOG, encoding="utf-8"))
    for it in cat["items"]:
        sid = it["sourceId"]
        for key, sub, ext in (("transcriptTrn", "trn", "trn"), ("transcriptChat", "cha", "cha")):
            try:
                keep(L, "sbcsae", "%s.%s" % (sid, ext), it[key], SBC_LICENSE, SBC_PAGE, sub, ua=UA_SBC, extra={"credit": SBC_CREDIT})
            except Exception as e:
                print("  [실패] sbcsae %s.%s: %s" % (sid, ext, str(e)[:80]))
            time.sleep(0.3)
        save(L)


# ---------------------------------------------------------------------------------------------------------------
# 사진 스캔 모델 (Poly Haven 모델, CC0). 2026-10-09 사용자 결정: 그래픽은 사진처럼 (게임 저장소 Docs/art_direction_KO.md 0장).
#
# **권리 원문을 열어 확인했다 (2026-10-09).** https://polyhaven.com/license : "All assets (HDRIs, textures and 3D models) ... are licensed as CC0".
# API 약관(https://github.com/Poly-Haven/Public-API/blob/master/ToS.md 2.4, 2.5): 호출마다 **앱 이름이 맞는 고유 User-Agent** 를 단다.
# 크레딧("Powered by Poly Haven")은 **살아 있는 API 를 앱 안에서 부를 때만** 의무다. 우리는 목록을 한 번 만들 뿐 게임이 API 를 안 부른다. 그래도 출처 화면에 한 줄은 넣는다.
# 사이트 약관 3.2 는 허락 없는 긁어오기를 막는다. 우리는 **공식 API 만** 쓰고(쪽을 긁지 않는다) 한 번에 한 건씩, 쉬며 부른다.
#
# 파일은 안 받는다. API 가 파일마다 url, md5, size 를 준다. 그 값을 항목에 옮긴다 (sha256 이 아니라 md5 칸).
# **해상도는 1K 만이다.** (2K 이상은 4GB 카드 예산 밖이다. Docs/perf_KO.md 5장.) 모델 하나 = glTF 본체 + .bin + 질감 jpg 몇 장.
MODEL_RES = "1k"
MODEL_DIR = "polyhaven/models"
API = "https://api.polyhaven.com"
# 앱 이름이 맞는 고유 User-Agent. 저장소 주소만 적는다 (사용자 이메일 같은 개인 정보는 어디에도 안 보낸다)
UA_API = {"User-Agent": "Chemistreal-honolulu-assetlist/1.0 (https://github.com/Chemistreal/game)"}
MODEL_HOST = "dl.polyhaven.org"
# 메시 하나의 삼각형이 이만큼 넘으면 줄여서 쓴다. 이만큼 넘으면 기본으로 안 받고 안 가져온다 (optional). 게임 저장소 Docs/perf_KO.md 5장: 모델 하나 약 5만 이하
LOD_REDUCE = 50000
LOD_HEAVY = 300000
LOD_NONE = 1000         # perf_KO.md 5장: 삼각형 1000 넘는 메시는 LOD 2~3단. 이하는 LOD 가 필요 없다


def hash_kind(it):
    """항목이 쓰는 해시 갈래. sha256 칸이 있으면 sha256, 없고 md5 가 있으면 md5, 둘 다 없으면 None"""
    if it.get("sha256"):
        return "sha256"
    if it.get("md5"):
        return "md5"
    return None


def file_digest(path, algo):
    h = hashlib.new(algo)
    with open(path, "rb") as f:
        while True:
            b = f.read(1 << 20)
            if not b:
                break
            h.update(b)
    return h.hexdigest()


def check_file(path, it):
    """디스크 파일이 목록 항목과 맞는가. -> (ok, 갈래, 글).
    크기(bytes)를 먼저 본다. 해시는 sha256 칸이 있으면 sha256, 없고 md5 가 있으면 md5 로 맞춘다. 둘 다 없으면 못 맞춘다(실패)."""
    if not os.path.isfile(path):
        return False, None, "파일이 없다"
    n = os.path.getsize(path)
    if it.get("bytes") is not None and n != it["bytes"]:
        return False, None, "크기 %d != 목록 %s" % (n, it["bytes"])
    kind = hash_kind(it)
    if kind is None:
        return False, None, "목록에 sha256 도 md5 도 없다"
    got = file_digest(path, kind)
    if got != str(it[kind]).lower():
        return False, kind, "%s 가 다르다 (받은 %s, 목록 %s)" % (kind, got[:12], str(it[kind])[:12])
    return True, kind, got


def model_files(aid, files):
    """API 파일 목록에서 1K glTF 한 벌 -> [(항목 안 상대 경로, url, md5, 크기)]. 첫째가 .gltf 본체. 1K glTF 가 없으면 None.
    상대 경로는 glTF 가 읽는 그대로다 (예: textures/x_diff_1k.jpg, x.bin). 어긋난 경로와 밖의 주소는 거른다."""
    g = ((files.get("gltf") or {}).get(MODEL_RES) or {}).get("gltf")
    if not g or "include" not in g or not g.get("url"):
        return None
    out = [(os.path.basename(g["url"]), g["url"], g["md5"], g["size"])]
    for rel, f in sorted(g["include"].items()):
        out.append((rel, f["url"], f["md5"], f["size"]))
    for rel, url, md5, size in out:
        bad = (rel.startswith("/") or ".." in rel.split("/") or "\\" in rel or not url.startswith("https://%s/" % MODEL_HOST)
               or not re.fullmatch(r"[0-9a-f]{32}", str(md5)) or not isinstance(size, int) or size <= 0)
        if bad:
            raise ValueError("%s: 믿을 수 없는 파일 줄 %r" % (aid, rel))
        if re.search(r"_(2|4|8|16)k\b", rel):
            raise ValueError("%s: 1K 가 아닌 파일이 끼었다: %s" % (aid, rel))
    return out


def gltf_stats(doc):
    """glTF 본체(JSON)를 읽어 삼각형을 센다. **API 의 polycount 는 원본(블렌더) 수라 glTF 와 다르다** (예: grass_bermuda_01 API 22만, glTF 941).
    UE 로 들어오는 것은 glTF 안의 삼각형이다. -> {"tris": 장면 전체, "trisMaxMesh": 메시 하나 가장 큰 것, "meshes": 메시 수, ...}"""
    acc = doc.get("accessors", [])

    def tris(mesh):
        n = 0
        for p in mesh.get("primitives", []):
            if p.get("mode", 4) != 4:
                continue
            idx = p.get("indices", p.get("attributes", {}).get("POSITION"))
            n += acc[idx]["count"] // 3
        return n

    per = [tris(m) for m in doc.get("meshes", [])]
    used = [n["mesh"] for n in doc.get("nodes", []) if "mesh" in n]
    mats = doc.get("materials", [])
    return {"tris": sum(per[i] for i in used), "trisMaxMesh": max(per) if per else 0, "meshes": len(per),
            "materials": len(mats), "alpha": sorted({m.get("alphaMode", "OPAQUE") for m in mats}),
            "extensions": sorted(doc.get("extensionsUsed", []))}


def lod_class(tris_max_mesh):
    """메시 하나의 삼각형에서 줄일 필요를 가른다. none(1000 이하) / auto(5만 이하, LOD 자동 2단) / reduce(30만 이하, LOD0 을 5만으로 줄인다) / heavy(넘으면 기본으로 안 받는다)"""
    if tris_max_mesh > LOD_HEAVY:
        return "heavy"
    if tris_max_mesh > LOD_REDUCE:
        return "reduce"
    if tris_max_mesh > LOD_NONE:
        return "auto"
    return "none"


def model_items(aid, files, optional):
    """한 모델의 항목들. md5 와 크기는 API 값이다 (받지 않았다)."""
    mf = model_files(aid, files)
    if mf is None:
        return None
    items = []
    for rel, url, md5, size in mf:
        it = {"source": "polyhaven", "file": "%s/%s/%s" % (MODEL_DIR, aid, rel), "url": url,
              "page": "https://polyhaven.com/a/" + aid, "license": "CC0-1.0", "bytes": size, "md5": md5, "model": aid}
        if optional:
            it["optional"] = True
        items.append(it)
    return items


def get_ua(url, binary=False, tries=3):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA_API), timeout=120) as r:
                b = r.read()
                return b if binary else b.decode("utf-8", "replace")
        except Exception:
            if i == tries - 1:
                raise
            time.sleep(2 ** (i + 1))


def opt(name, default=None):
    """--name 값 꼴 인자"""
    a = sys.argv
    for i, x in enumerate(a):
        if x == name and i + 1 < len(a):
            return a[i + 1]
        if x.startswith(name + "="):
            return x.split("=", 1)[1]
    return default


def polyhaven_models(L, picks_path=None, catalog_path=None):
    """고른 모델(게임 저장소 Tools/realistic_picks.json)의 1K glTF 한 벌을 목록에 적는다. 파일은 안 받는다.
    이미 있는 주소는 값만 맞춘다. 목록에서 항목을 지우지는 않는다. catalog_path 가 있으면 게임 쪽 표(Tools/realistic_models.json)도 쓴다."""
    if not picks_path:
        print("  [건너뜀] polyhaven_models: --picks (게임 저장소 Tools/realistic_picks.json) 가 필요하다")
        return
    picks = json.load(open(picks_path, encoding="utf-8"))
    meta = json.loads(get_ua(API + "/assets?t=models"))
    by_url = {x["url"]: x for x in L["items"]}
    models, miss, added, changed = [], [], 0, 0
    for slot in picks["slots"]:
        for pm in slot["models"]:
            aid = pm["id"]
            if aid not in meta:
                miss.append("%s: Poly Haven 모델 목록에 없다" % aid)
                continue
            time.sleep(0.2)
            files = json.loads(get_ua("%s/files/%s" % (API, aid)))
            items = model_items(aid, files, bool(pm.get("optional")))
            if items is None:
                miss.append("%s: 1K glTF 가 없다" % aid)
                continue
            # .gltf 본체만 읽는다 (JSON, 수십 KB 이하). md5 를 API 값과 맞추고 삼각형을 센다. .bin 과 질감은 안 받는다
            body = get_ua(items[0]["url"], binary=True)
            if hashlib.md5(body).hexdigest() != items[0]["md5"] or len(body) != items[0]["bytes"]:
                miss.append("%s: .gltf 의 md5 나 크기가 API 값과 다르다" % aid)
                continue
            st = gltf_stats(json.loads(body))
            for it in items:
                old = by_url.get(it["url"])
                if old is None:
                    L["items"].append(it)
                    by_url[it["url"]] = it
                    added += 1
                elif any(old.get(k) != it.get(k) for k in ("bytes", "md5", "file", "license", "model", "optional")):
                    old.update(it)
                    if not it.get("optional"):
                        old.pop("optional", None)
                    changed += 1
            m = meta[aid]
            bin_bytes = sum(x["bytes"] for x in items if x["file"].endswith(".bin"))
            total = sum(x["bytes"] for x in items)
            lod = lod_class(st["trisMaxMesh"])
            models.append({
                "id": aid, "slot": slot["id"], "folder": slot["folder"], "name": m["name"], "category": m.get("category", ""),
                "use": pm["use"], **({"note": pm["note"]} if pm.get("note") else {}),
                "polycount": m["polycount"], "tris": st["tris"], "trisMaxMesh": st["trisMaxMesh"], "meshes": st["meshes"], "lod": lod,
                "materials": st["materials"], "alpha": st["alpha"], "gltfExtensions": st["extensions"],
                "optional": bool(pm.get("optional")), "brand_check": bool(pm.get("brand_check")),
                "bytes": total, "bin_bytes": bin_bytes, "files": len(items), "textures": sum(1 for x in items if "/textures/" in x["file"]),
                "dims_m": [round(d / 1000.0, 2) for d in (m.get("dimensions") or [0, 0, 0])],
                "authors": sorted(m.get("authors", {}).keys()), "native_res": max(m.get("max_resolution") or [0]),
                "gltf": "%s/%s_%s.gltf" % (aid, aid, MODEL_RES), "page": "https://polyhaven.com/a/" + aid,
            })
            print("  %-28s %-10s API %8d glTF %8d (메시 최대 %7d x %2d) %6.2f MB %s" % (
                aid, slot["id"], m["polycount"], st["tris"], st["trisMaxMesh"], st["meshes"], total / 1e6, lod))
    for x in miss:
        print("  [못 씀] " + x)
    print("  모델 %d개 / 파일 %d개 새로 / %d개 값 바뀜" % (len(models), added, changed))
    if catalog_path and models and not miss:
        core = sum(m["bytes"] for m in models if not m["optional"])
        cat = {
            "note": "Poly Haven 사진 스캔 모델 표. fetch_assets.py polyhaven_models 가 만든다 (API 값). 손으로 안 고친다. 고를 목록은 Tools/realistic_picks.json",
            "source": "Poly Haven (CC0), 공식 API", "api": API, "resolution": MODEL_RES, "generated": datetime.date.today().isoformat(),
            "lodRule": {"noneUnder": LOD_NONE, "reduceOver": LOD_REDUCE, "heavyOver": LOD_HEAVY,
                        "text": "glTF 안의 삼각형(메시 하나 가장 큰 것, trisMaxMesh) 1000 이하 none(LOD 필요 없음), 5만 이하 auto(LOD 자동 2단), 30만 이하 reduce(LOD0 을 5만으로 줄인다), 넘으면 heavy(기본으로 안 받고 안 가져온다). polycount 는 API 의 원본 수라 glTF 와 다르다"},
            "count": len(models), "bytes": sum(m["bytes"] for m in models), "bytesCore": core,
            "bytesOptional": sum(m["bytes"] for m in models if m["optional"]),
            "lodCounts": {k: sum(1 for m in models if m["lod"] == k) for k in ("none", "auto", "reduce", "heavy")},
            "slotLabels": {s["id"]: s["label"] for s in picks["slots"]},
            "models": models,
            "missing": picks.get("missing", []),
        }
        with open(catalog_path, "w", encoding="utf-8") as f:
            json.dump(cat, f, ensure_ascii=False, indent=1)
            f.write("\n")
        print("  표 %s 에 썼다 (모델 %d / 기본 %.1f MB / optional %.1f MB)" % (catalog_path, len(models), core / 1e6, cat["bytesOptional"] / 1e6))
    elif miss:
        print("  [실패] 못 쓴 모델이 있어 표는 안 썼다")


def selftest():
    """네트워크 없이 새 길을 시험한다: md5 로 맞추기(깨진 것 잡기), 믿을 수 없는 파일 줄 거르기, glTF 삼각형 세기, LOD 가르기. -> 실패 수"""
    bad = 0

    def check(cond, msg):
        nonlocal bad
        print(("ok   " if cond else "FAIL ") + msg)
        bad += 0 if cond else 1

    d = tempfile.mkdtemp(prefix="hnl_selftest_")
    try:
        p = os.path.join(d, "a.bin")
        with open(p, "wb") as f:
            f.write(b"hello")
        md5 = hashlib.md5(b"hello").hexdigest()
        sha = hashlib.sha256(b"hello").hexdigest()
        check(check_file(p, {"bytes": 5, "md5": md5})[:2] == (True, "md5"), "md5 만 있는 항목이 md5 로 맞는다")
        check(check_file(p, {"bytes": 5, "sha256": sha})[:2] == (True, "sha256"), "sha256 항목은 sha256 으로 맞는다")
        check(check_file(p, {"bytes": 5, "sha256": sha, "md5": "0" * 32})[:2] == (True, "sha256"), "둘 다 있으면 sha256 이 먼저다")
        check(not check_file(p, {"bytes": 5, "md5": "0" * 32})[0], "틀린 md5 를 잡는다")
        check(not check_file(p, {"bytes": 6, "md5": md5})[0], "틀린 크기를 잡는다")
        check(not check_file(p, {"bytes": 5})[0], "해시가 없으면 못 맞춘다 (실패)")
        check(not check_file(os.path.join(d, "none"), {"bytes": 5, "md5": md5})[0], "없는 파일은 실패")
        check(hash_kind({"sha256": "x", "md5": "y"}) == "sha256" and hash_kind({"md5": "y"}) == "md5" and hash_kind({}) is None, "hash_kind")
    finally:
        shutil.rmtree(d, ignore_errors=True)
    good = {"gltf": {"1k": {"gltf": {"url": "https://dl.polyhaven.org/file/m/Models/gltf/1k/x/x_1k.gltf", "md5": "a" * 32, "size": 100,
                                     "include": {"x.bin": {"url": "https://dl.polyhaven.org/file/m/Models/gltf/8k/x/x.bin", "md5": "b" * 32, "size": 200},
                                                 "textures/x_diff_1k.jpg": {"url": "https://dl.polyhaven.org/file/m/Models/jpg/1k/x/x_diff_1k.jpg", "md5": "c" * 32, "size": 300}}}}}}
    mf = model_files("x", good)
    check(mf is not None and [r[0] for r in mf] == ["x_1k.gltf", "textures/x_diff_1k.jpg", "x.bin"], "1K glTF 한 벌: 본체가 첫째, 나머지는 경로 순서")
    check(model_files("x", {"gltf": {"2k": {}}}) is None and model_files("x", {}) is None, "1K glTF 가 없으면 None")

    def mutate(fn):
        c = json.loads(json.dumps(good))
        fn(c["gltf"]["1k"]["gltf"])
        try:
            model_files("x", c)
        except ValueError:
            return True
        return False

    check(mutate(lambda g: g["include"].update({"../evil.bin": dict(g["include"]["x.bin"])})), "밖으로 나가는 경로(..)를 거른다")
    check(mutate(lambda g: g["include"].update({"/abs.bin": dict(g["include"]["x.bin"])})), "절대 경로를 거른다")
    check(mutate(lambda g: g["include"]["x.bin"].update(url="https://example.invalid/x.bin")), "다른 주소를 거른다")
    check(mutate(lambda g: g["include"]["x.bin"].update(md5="zz")), "이상한 md5 를 거른다")
    check(mutate(lambda g: g["include"].update({"textures/x_diff_2k.jpg": dict(g["include"]["x.bin"])})), "2K 이름을 거른다")
    check(mutate(lambda g: g["include"]["x.bin"].update(size=0)), "크기 0 을 거른다")
    items = model_items("x", good, True)
    check(len(items) == 3 and all(i["optional"] and i["md5"] and "sha256" not in i and i["license"] == "CC0-1.0" for i in items),
          "항목: md5 꼴, optional, CC0, sha256 칸 없음")
    check(items[0]["file"] == "polyhaven/models/x/x_1k.gltf" and items[1]["file"] == "polyhaven/models/x/textures/x_diff_1k.jpg", "항목 경로는 glTF 가 읽는 그대로")
    doc = {"accessors": [{"count": 30}, {"count": 12}, {"count": 60}],
           "meshes": [{"primitives": [{"attributes": {"POSITION": 1}, "indices": 0}]}, {"primitives": [{"attributes": {"POSITION": 1}, "indices": 2}]}],
           "nodes": [{"mesh": 0}, {"mesh": 1}, {"mesh": 1}], "materials": [{"alphaMode": "MASK"}, {}], "extensionsUsed": ["KHR_materials_ior"]}
    st = gltf_stats(doc)
    check(st["tris"] == 10 + 20 + 20 and st["trisMaxMesh"] == 20 and st["meshes"] == 2 and st["alpha"] == ["MASK", "OPAQUE"],
          "glTF 삼각형: 노드마다 센다 (같은 메시를 두 번 쓰면 두 번)")
    check([lod_class(n) for n in (500, 1000, 1001, 50000, 50001, 300000, 300001)] == ["none", "none", "auto", "auto", "reduce", "reduce", "heavy"],
          "LOD 가르기 경계")
    print("selftest:", "ok" if not bad else "실패 %d" % bad)
    return bad


def verify(L, store, prefix=""):
    """받아 둔 파일을 목록과 맞춘다 (sha256, 없으면 md5). 없는 파일은 '없음' 으로 센다 (실패 아님). -> 어긋난 수"""
    ok = miss = bad = 0
    kinds = {"sha256": 0, "md5": 0}
    for it in L["items"]:
        if not it["file"].startswith(prefix):
            continue
        p = os.path.join(store, *it["file"].split("/"))
        if not os.path.exists(p):
            miss += 1
            continue
        good, kind, msg = check_file(p, it)
        if good:
            ok += 1
            kinds[kind] += 1
        else:
            bad += 1
            print("  [어긋남] %s: %s" % (it["file"], msg))
    print("verify: 맞음 %d (sha256 %d, md5 %d) / 없음 %d / 어긋남 %d / 접두사 %r" % (ok, kinds["sha256"], kinds["md5"], miss, bad, prefix))
    return bad


def sample(L, ids, keep=False):
    """작은 모델 몇 개만 받아 (1) md5 와 크기를 API 값과 맞추고 (2) glTF 가 가리키는 파일(.bin, 질감)이 항목에 다 있는지 본다.
    (3) PC 가 적을 SHA256_FIRST 꼴(처음 잰 sha256)을 보여 준다. 다 보고 지운다 (--keep 이면 둔다). -> 어긋난 수"""
    work = tempfile.mkdtemp(prefix="hnl_sample_", dir=os.environ.get("SAMPLE_DIR") or None)
    bad = 0
    try:
        for aid in ids:
            its = [x for x in L["items"] if x.get("model") == aid]
            if not its:
                print("  [없음] %s: 목록에 항목이 없다" % aid)
                bad += 1
                continue
            for it in its:
                p = os.path.join(work, *it["file"].split("/"))
                os.makedirs(os.path.dirname(p), exist_ok=True)
                with open(p, "wb") as f:
                    f.write(get_ua(it["url"], binary=True))
                good, kind, msg = check_file(p, it)
                if not good:
                    bad += 1
                    print("  [어긋남] %s: %s" % (it["file"], msg))
            gl = [x for x in its if x["file"].endswith(".gltf")]
            if len(gl) != 1:
                bad += 1
                print("  [어긋남] %s: .gltf 본체가 %d개다" % (aid, len(gl)))
                continue
            gpath = os.path.join(work, *gl[0]["file"].split("/"))
            doc = json.load(open(gpath, encoding="utf-8"))
            refs = [b.get("uri") for b in doc.get("buffers", [])] + [im.get("uri") for im in doc.get("images", [])]
            have = {x["file"].split("/", 3)[3] for x in its}        # polyhaven/models/<id>/<rel>
            lost = [r for r in refs if r and not r.startswith("data:") and r not in have]
            if lost:
                bad += 1
                print("  [어긋남] %s: glTF 가 가리키는 파일이 항목에 없다: %s" % (aid, lost[:3]))
            first = {x["file"]: {"sha256": file_digest(os.path.join(work, *x["file"].split("/")), "sha256"), "md5": x["md5"], "bytes": x["bytes"]}
                     for x in its if os.path.exists(os.path.join(work, *x["file"].split("/")))}
            print("  %-26s 파일 %d개 %7.2f MB / glTF 가 가리키는 파일 %d개 모두 항목에 있다=%s / 처음 잰 sha256 예: %s" % (
                aid, len(its), sum(x["bytes"] for x in its) / 1e6, len(refs), not lost,
                next(iter(first.values()))["sha256"][:16] if first else "-"))
    finally:
        if keep:
            print("  받은 파일을 둔다: " + work)
        else:
            shutil.rmtree(work, ignore_errors=True)
    print("sample: 어긋남 %d" % bad)
    return bad


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flagvals = {opt(f) for f in ("--picks", "--catalog", "--store", "--prefix", "--ids") if opt(f)}
    what = [a for a in args if a not in flagvals] or ["all"]
    known = {"all", "verify", "sample", "selftest", "kenney", "polyhaven", "ambientcg", "oga", "geo", "texts", "gov", "tatoeba", "sbcsae", "polyhaven_models"}
    if what[0] == "selftest":
        sys.exit(1 if selftest() else 0)
    unknown = [a for a in what if a not in known]
    if unknown:
        # 모르는 이름이면 아무것도 안 한다 (예전에는 목록을 그대로 다시 써 버렸다)
        print("[멈춤] 모르는 이름: %s (있는 이름: %s)" % (", ".join(unknown), ", ".join(sorted(known))))
        sys.exit(2)
    L = load()
    if what[0] == "verify":
        sys.exit(1 if verify(L, opt("--store") or STORE, opt("--prefix") or "") else 0)
    if what[0] == "sample":
        ids = [x for x in (opt("--ids") or "").split(",") if x]
        if not ids:
            print("[멈춤] --ids 가 필요하다 (예: --ids Shelf_01,wooden_table_02)")
            sys.exit(2)
        sys.exit(1 if sample(L, ids, "--keep" in sys.argv) else 0)
    for name, fn in (("kenney", kenney), ("polyhaven", polyhaven), ("ambientcg", ambientcg), ("oga", oga),
                     ("geo", geo), ("texts", texts), ("gov", gov), ("tatoeba", tatoeba), ("sbcsae", sbcsae),
                     ("polyhaven_models", lambda L: polyhaven_models(L, opt("--picks"), opt("--catalog")))):
        # all 은 모델을 안 돈다 (고른 목록이 필요하다). 이름으로 불러야 돈다
        if name in what or ("all" in what and name != "polyhaven_models"):
            print("== " + name)
            try:
                fn(L)
            except Exception as e:
                print("  [실패] " + name + ": " + str(e)[:120])
            save(L)
    publish(L)
    print("자료 %d개 / %.1f MB / 저장 %s" % (L["count"], L["bytes"] / 1e6, STORE))


if __name__ == "__main__":
    main()
