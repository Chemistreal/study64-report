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
    polyhaven   공식 API. CC0
    ambientcg   공식 API. CC0
    oga         OpenGameArt 쪽에서 파일 주소를 읽는다. 쪽마다 CC0 를 확인한다
    geo         지형, 해저, 라이다, 길, 해안선, 땅 덮개. 퍼블릭 도메인, CC0, CC BY
    texts       하와이 문헌. 구텐베르크 등. 미국과 한국 둘 다 퍼블릭 도메인
    gov         미국 정부 생활 안내 PDF. 퍼블릭 도메인
    tatoeba     Tatoeba 영어 문장. CC BY. 영어 쪽만

사용법:
    python3 tools/game/fetch_assets.py kenney
    python3 tools/game/fetch_assets.py all
"""
import hashlib
import json
import os
import re
import sys
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


def load():
    if os.path.exists(LIST):
        return json.load(open(LIST, encoding="utf-8"))
    return {"note": "게임 자료 목록. 파일은 저장소 밖에 있다. tools/game/fetch_assets.py 가 쓴다.",
            "store": "GitHub 릴리스, 나중에 PC D 드라이브", "items": []}


def save(L):
    L["items"].sort(key=lambda x: (x["source"], x["file"]))
    L["count"] = len(L["items"])
    L["bytes"] = sum(x["bytes"] for x in L["items"])
    with open(LIST, "w", encoding="utf-8") as f:
        json.dump(L, f, ensure_ascii=False, indent=1)
        f.write("\n")


def keep(L, source, name, url, license, page, sub=""):
    """한 파일을 받는다. 이미 같은 주소로 받았으면 건너뛴다.
    지형 타일은 한 장이 수백 MB 라 메모리에 안 올리고 흘려 받으며 해시를 센다."""
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
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=300) as r, \
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
    L["items"].append({
        "source": source, "file": os.path.join(source, sub, name).replace("\\", "/"),
        "url": url, "page": page, "license": license, "bytes": n,
        "sha256": h.hexdigest(),
    })
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
    ("uscis_100q_civics_2008.pdf", "https://www.uscis.gov/sites/default/files/document/questions-and-answers/100q.pdf",
     "PD-USGov", "https://www.uscis.gov/citizenship"),
    ("uscis_reading_vocab.pdf", "https://www.uscis.gov/sites/default/files/document/guides/reading_vocab.pdf",
     "PD-USGov", "https://www.uscis.gov/citizenship"),
    ("uscis_writing_vocab.pdf", "https://www.uscis.gov/sites/default/files/document/guides/writing_vocab.pdf",
     "PD-USGov", "https://www.uscis.gov/citizenship"),
    ("ready_hurricanes.pdf", "https://www.ready.gov/sites/default/files/2025-03/ready_hurricanes-info-sheet.pdf",
     "PD-USGov (사진 로고 제외)", "https://www.ready.gov/hurricanes"),
    ("ready_tsunamis.pdf", "https://www.ready.gov/sites/default/files/2025-03/ready_tsunamis-info-sheet.pdf",
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
TATOEBA = [
    ("eng_sentences_detailed.tsv.bz2", "https://downloads.tatoeba.org/exports/per_language/eng/eng_sentences_detailed.tsv.bz2"),
]


def tatoeba(L):
    for name, url in TATOEBA:
        try:
            keep(L, "tatoeba", name, url, "CC-BY-2.0-FR (문장마다 저자 표기)", "https://tatoeba.org/en/downloads")
        except Exception as e:
            print("  [실패] tatoeba " + name + ": " + str(e)[:80])
        save(L)


def main():
    what = sys.argv[1:] or ["all"]
    L = load()
    for name, fn in (("kenney", kenney), ("polyhaven", polyhaven), ("ambientcg", ambientcg), ("oga", oga),
                     ("geo", geo), ("texts", texts), ("gov", gov), ("tatoeba", tatoeba)):
        if "all" in what or name in what:
            print("== " + name)
            try:
                fn(L)
            except Exception as e:
                print("  [실패] " + name + ": " + str(e)[:120])
            save(L)
    print("자료 %d개 / %.1f MB / 저장 %s" % (L["count"], L["bytes"] / 1e6, STORE))


if __name__ == "__main__":
    main()
