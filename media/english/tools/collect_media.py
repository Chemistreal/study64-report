#!/usr/bin/env python3
"""Build reproducible English-media catalogs and optional release archives.

The collector deliberately downloads VOA-produced media from VOA origin servers,
not from YouTube. YouTube references are recorded as embed IDs only. Santa Barbara
Corpus audio is referenced at its official unchanged source because the corpus is
CC BY-ND; its TRN and CHAT transcripts can be archived without modification.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import html as html_stdlib
import json
import re
import shutil
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from dataclasses import dataclass
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Iterable

from lxml import html


ROOT = Path(__file__).resolve().parents[3]
MEDIA_ROOT = ROOT / "media" / "english"
DEFAULT_OUTPUT = MEDIA_ROOT / "archive"
USER_AGENT = "study64-report-media-collector/1.0 (+https://github.com/Chemistreal/study64-report)"
TIMEOUT = 60
RETRIES = 3

VOA_TERMS_URL = "https://learningenglish.voanews.com/p/6861.html"
VOA_L1_INDEX = "https://learningenglish.voanews.com/p/5644.html"
VOA_L2_INDEX = "https://learningenglish.voanews.com/p/6765.html"
SBC_INDEX = "https://www.linguistics.ucsb.edu/research/santa-barbara-corpus-spoken-american-english"
SBC_LICENSE_URL = "https://creativecommons.org/licenses/by-nd/3.0/us/"

COURSE_RESOURCES = [
    {
        "id": "voa-l1-how-to",
        "title": "Let's Learn English Level 1 How-to Guide",
        "url": "https://docs.voanews.eu/en-us-learn/2019/11/26/f44e8369-33f7-4924-9769-dd7a74c31165.pdf",
        "filename": "voa-lle1-how-to-guide.pdf",
        "license": "voa-public-domain",
    },
    {
        "id": "voa-l1-lesson-plans",
        "title": "Let's Learn English Level 1 Lesson Plans",
        "url": "https://docs.voanews.eu/en-us-learn/2021/09/09/fccd8340-337b-4d24-a750-f90c6d2d5843.pdf",
        "filename": "voa-lle1-lesson-plans.pdf",
        "license": "voa-public-domain",
    },
    {
        "id": "voa-l2-complete-book",
        "title": "Let's Learn English Level 2 Complete Book",
        "url": "https://docs.voanews.eu/en-us-learn/2021/05/21/9ac62777-32fb-4f7d-baff-71a07b37dc7d.pdf",
        "filename": "voa-lle2-complete-book.pdf",
        "license": "voa-public-domain",
    },
    {
        "id": "voa-word-book",
        "title": "VOA Learning English Word Book",
        "url": "https://docs.voanews.eu/en-US-LEARN/2022/06/07/c4dbd6af-5f63-4f28-bc42-0bd175f4e4b4.pdf",
        "filename": "voa-learning-english-word-book.pdf",
        "license": "voa-public-domain",
    },
]


@dataclass(frozen=True)
class LessonSeed:
    lesson: int
    title: str
    page: str
    item_id: str
    quarter: int
    focus: str | None = None
    duration: str | None = None
    cached_audio: str | None = None


def request(url: str, *, method: str = "GET") -> urllib.request.Request:
    return urllib.request.Request(
        url,
        method=method,
        headers={"User-Agent": USER_AGENT, "Accept": "*/*"},
    )


def fetch_bytes(url: str, *, retries: int = RETRIES) -> bytes:
    last_error: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(request(url), timeout=TIMEOUT) as response:
                return response.read()
        except (urllib.error.URLError, TimeoutError, ConnectionError) as exc:
            last_error = exc
            if attempt < retries:
                time.sleep(attempt * 1.5)
    raise RuntimeError(f"failed to fetch after {retries} attempts: {url}: {last_error}")


def fetch_tree(url: str) -> html.HtmlElement:
    return html.fromstring(fetch_bytes(url), base_url=url)


def clean_text(value: str) -> str:
    return " ".join(value.split())


def sha256_path(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def json_dump(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def video_variants(node: html.HtmlElement) -> list[dict[str, Any]]:
    variants: list[dict[str, Any]] = []
    raw = html_stdlib.unescape(node.get("data-sources") or "[]")
    try:
        sources = json.loads(raw)
    except json.JSONDecodeError:
        sources = []
    for source in sources:
        url = source.get("Src") or source.get("AmpSrc")
        if not url:
            continue
        variants.append(
            {
                "label": source.get("DataInfo") or "unknown",
                "url": url,
                "mime": source.get("Type") or "video/mp4",
            }
        )
    if not variants:
        fallback = node.get("data-fallbacksrc") or node.get("src")
        if fallback:
            variants.append({"label": "default", "url": fallback, "mime": "video/mp4"})
    return variants


def numeric_resolution(label: str) -> int:
    match = re.search(r"(\d{3,4})p", label or "")
    return int(match.group(1)) if match else 10_000


def selected_variant(variants: list[dict[str, Any]]) -> dict[str, Any] | None:
    return min(variants, key=lambda value: numeric_resolution(value["label"])) if variants else None


def section_map(article: html.HtmlElement) -> dict[str, list[html.HtmlElement]]:
    wrappers = article.xpath(
        './*[contains(concat(" ", normalize-space(@class), " "), " wsw ")]'
    )
    if not wrappers:
        return {}
    sections: dict[str, list[html.HtmlElement]] = {"preamble": []}
    current = "preamble"
    for child in wrappers[0]:
        heading = clean_text(child.text_content())
        is_short_section_label = child.tag == "p" and heading.lower() in {
            "speaking",
            "speaking practice",
            "pronunciation",
            "conversation",
        }
        if child.tag in {"h1", "h2", "h3", "h4"} or is_short_section_label:
            if heading:
                current = heading.lower()
                sections.setdefault(current, [])
                continue
        sections.setdefault(current, []).append(child)
    return sections


def nodes_for_heading(sections: dict[str, list[html.HtmlElement]], needle: str) -> list[html.HtmlElement]:
    needle = needle.lower()
    for heading, nodes in sections.items():
        if needle in heading:
            return nodes
    return []


def videos_in(nodes: Iterable[html.HtmlElement]) -> list[dict[str, Any]]:
    videos: list[dict[str, Any]] = []
    for node in nodes:
        for video in node.xpath(".//video"):
            variants = video_variants(video)
            videos.append(
                {
                    "title": video.get("title") or "",
                    "variants": variants,
                    "selected": selected_variant(variants),
                }
            )
    return videos


def audio_in(nodes: Iterable[html.HtmlElement]) -> dict[str, Any] | None:
    for node in nodes:
        for audio in node.xpath(".//audio[@src]"):
            return {
                "title": audio.get("title") or "",
                "url": audio.get("src"),
                "mime": audio.get("data-type") or "audio/mpeg",
            }
    return None


def transcript_in(nodes: Iterable[html.HtmlElement]) -> list[dict[str, str | None]]:
    lines: list[dict[str, str | None]] = []
    pattern = re.compile(r"^([A-Z][A-Za-z .'-]{0,50}):\s*(.+)$")
    for node in nodes:
        if node.xpath(".//audio|.//video"):
            continue
        text = clean_text(node.text_content())
        match = pattern.match(text)
        if match:
            lines.append({"speaker": match.group(1), "text": match.group(2)})
        elif text:
            lines.append({"speaker": None, "text": text})
    return lines


def first_main_video(root: html.HtmlElement) -> dict[str, Any] | None:
    article = root.xpath('//*[@id="article-content"]')
    for video in root.xpath("//video"):
        if article and article[0] in video.iterancestors():
            continue
        variants = video_variants(video)
        if variants:
            return {
                "title": video.get("title") or "",
                "variants": variants,
                "selected": selected_variant(variants),
            }
    return None


def youtube_embeds(root: html.HtmlElement) -> list[dict[str, str]]:
    blob = html.tostring(root, encoding="unicode")
    ids = sorted(set(re.findall(r"youtube\.com/embed/([A-Za-z0-9_-]{6,})", blob)))
    return [
        {
            "videoId": video_id,
            "embedUrl": f"https://www.youtube.com/embed/{video_id}",
            "storage": "embed-only",
        }
        for video_id in ids
    ]


def crawl_voa_lesson(seed: LessonSeed, level: int) -> dict[str, Any]:
    root = fetch_tree(seed.page)
    article_nodes = root.xpath('//*[@id="article-content"]')
    if not article_nodes:
        raise RuntimeError(f"article-content not found: {seed.page}")
    sections = section_map(article_nodes[0])
    conversation_nodes = nodes_for_heading(sections, "conversation")
    speaking_nodes = nodes_for_heading(sections, "speaking")
    pronunciation_nodes = nodes_for_heading(sections, "pronunciation")
    conversation_audio = audio_in(conversation_nodes)
    transcript = transcript_in(conversation_nodes)
    if level == 1 and not conversation_audio:
        raise RuntimeError(f"conversation audio not found: {seed.page}")
    if not transcript:
        raise RuntimeError(f"conversation transcript not found: {seed.page}")

    cached: dict[str, Any] | None = None
    if seed.cached_audio:
        local = ROOT / seed.cached_audio
        if local.exists():
            cached = {
                "path": seed.cached_audio,
                "bytes": local.stat().st_size,
                "sha256": sha256_path(local),
            }

    result = {
        "id": seed.item_id,
        "level": level,
        "lesson": seed.lesson,
        "quarter": seed.quarter,
        "title": seed.title,
        "duration": seed.duration,
        "focus": seed.focus,
        "page": seed.page,
        "license": "voa-public-domain",
        "mainVideo": first_main_video(root),
        "conversationAudio": conversation_audio,
        "audioFallback": "main-video" if conversation_audio is None else None,
        "cachedConversationAudio": cached,
        "speakingPracticeVideos": videos_in(speaking_nodes),
        "pronunciationPracticeVideos": videos_in(pronunciation_nodes),
        "transcript": transcript,
        "youtubeEmbeds": youtube_embeds(root),
    }
    return result


def load_l1_seeds() -> list[LessonSeed]:
    source = json.loads((MEDIA_ROOT / "catalog.json").read_text(encoding="utf-8"))
    seeds: list[LessonSeed] = []
    for item in source["items"]:
        seeds.append(
            LessonSeed(
                lesson=int(item["lesson"]),
                title=item["title"],
                page=item["page"],
                item_id=item["id"],
                quarter=int(item["quarter"]),
                focus=item.get("focus"),
                duration=item.get("duration"),
                cached_audio=item.get("audio"),
            )
        )
    return seeds


def load_l2_seeds() -> list[LessonSeed]:
    root = fetch_tree(VOA_L2_INDEX)
    found: dict[int, LessonSeed] = {}
    pattern = re.compile(r"^Lesson\s+(\d+)\s*:\s*(.+)$", re.IGNORECASE)
    for anchor in root.xpath("//a[@href]"):
        text = clean_text(anchor.text_content())
        match = pattern.match(text)
        if not match:
            continue
        lesson = int(match.group(1))
        url = urllib.parse.urljoin(VOA_L2_INDEX, anchor.get("href"))
        if "/a/" not in url or lesson in found:
            continue
        found[lesson] = LessonSeed(
            lesson=lesson,
            title=text,
            page=url,
            item_id=f"lle2-{lesson:02d}",
            quarter=min(3, ((lesson - 1) // 10) + 1),
        )
    if sorted(found) != list(range(1, 31)):
        raise RuntimeError(f"expected Level 2 lessons 1-30, found: {sorted(found)}")
    return [found[number] for number in sorted(found)]


def crawl_parallel(seeds: list[LessonSeed], level: int, workers: int) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        jobs = {executor.submit(crawl_voa_lesson, seed, level): seed for seed in seeds}
        for future in concurrent.futures.as_completed(jobs):
            seed = jobs[future]
            try:
                results.append(future.result())
                print(f"cataloged {seed.item_id}", file=sys.stderr)
            except Exception as exc:
                raise RuntimeError(f"failed while cataloging {seed.item_id}: {exc}") from exc
    return sorted(results, key=lambda item: item["lesson"])


def crawl_sbc() -> list[dict[str, Any]]:
    root = fetch_tree(SBC_INDEX)
    items: list[dict[str, Any]] = []
    pattern = re.compile(r"^(SBC\d{3})\s+(.+)$")
    for heading in root.xpath("//h4"):
        match = pattern.match(clean_text(heading.text_content()))
        if not match:
            continue
        descriptions: list[str] = []
        links: dict[str, str] = {}
        node = heading.getnext()
        while node is not None and node.tag not in {"h3", "h4"}:
            text = clean_text(node.text_content())
            if text and not text.lower().startswith("audio:"):
                descriptions.append(text)
            for anchor in node.xpath(".//a[@href]"):
                label = clean_text(anchor.text_content()).lower()
                if label in {"wav", "mp3", "trn", "chat"}:
                    links[label] = urllib.parse.urljoin(SBC_INDEX, anchor.get("href"))
            node = node.getnext()
        required = {"wav", "trn", "chat"}
        if not required.issubset(links):
            raise RuntimeError(f"missing SBC links for {match.group(1)}: {links}")
        items.append(
            {
                "id": match.group(1).lower(),
                "sourceId": match.group(1),
                "title": match.group(2),
                "description": " ".join(descriptions),
                "audioOriginal": links["wav"],
                "transcriptTrn": links["trn"],
                "transcriptChat": links["chat"],
                "license": "cc-by-nd-3.0-us",
                "allowedTreatment": "redistribute-unchanged-with-attribution",
            }
        )
    if len(items) != 60:
        raise RuntimeError(f"expected 60 SBC items, found {len(items)}")
    return items


def catalog_payload(name: str, level: int, items: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "name": name,
        "source": "VOA Learning English",
        "sourceUrl": VOA_L1_INDEX if level == 1 else VOA_L2_INDEX,
        "license": "voa-public-domain",
        "licenseUrl": VOA_TERMS_URL,
        "level": level,
        "count": len(items),
        "items": items,
    }


def write_catalogs(output: Path, workers: int) -> None:
    l1_items = crawl_parallel(load_l1_seeds(), 1, workers)
    l2_items = crawl_parallel(load_l2_seeds(), 2, workers)
    sbc_items = crawl_sbc()

    l1 = catalog_payload("VOA Let's Learn English Level 1 - full media catalog", 1, l1_items)
    l2 = catalog_payload("VOA Let's Learn English Level 2 - full media catalog", 2, l2_items)
    sbc = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "name": "Santa Barbara Corpus of Spoken American English",
        "source": "University of California, Santa Barbara",
        "sourceUrl": SBC_INDEX,
        "license": "cc-by-nd-3.0-us",
        "licenseUrl": SBC_LICENSE_URL,
        "count": len(sbc_items),
        "items": sbc_items,
    }

    json_dump(output / "voa-lle1-full.json", l1)
    json_dump(output / "voa-lle2-full.json", l2)
    json_dump(output / "sbcsae.json", sbc)

    local_audio_bytes = sum(
        (item.get("cachedConversationAudio") or {}).get("bytes", 0) for item in l1_items
    )
    registry = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "releaseTag": "english-media-v1",
        "releaseBaseUrl": "https://github.com/Chemistreal/study64-report/releases/download/english-media-v1/",
        "storagePolicy": {
            "youtube": "embed-only",
            "voa": "archive-from-official-origin",
            "sbcsae": "unchanged-transcripts-only; audio kept at official source",
        },
        "licenses": {
            "voa-public-domain": {
                "name": "VOA-produced public-domain material",
                "url": VOA_TERMS_URL,
                "credit": "VOA Learning English, learningenglish.voanews.com",
                "warning": "Exclude third-party AP, Reuters, AFP, and other agency material.",
            },
            "cc-by-nd-3.0-us": {
                "name": "Creative Commons Attribution-NoDerivs 3.0 United States",
                "url": SBC_LICENSE_URL,
                "credit": "Du Bois et al., Santa Barbara Corpus of Spoken American English, Parts 1-4.",
                "warning": "Redistribute unchanged. Do not cut, remix, normalize, or transcode for redistribution.",
            },
            "librivox-public-domain-us": {
                "name": "LibriVox recordings public domain in the United States",
                "url": "https://librivox.org/pages/public-domain/",
                "warning": "Check the underlying text and translation status in the target country before publication.",
            },
            "youtube-standard": {
                "name": "YouTube Terms of Service",
                "url": "https://www.youtube.com/static?template=terms",
                "warning": "Do not automate scraping or download. Use the official embeddable player only.",
            },
        },
        "collections": [
            {
                "id": "voa-lle1",
                "catalog": "voa-lle1-full.json",
                "items": len(l1_items),
                "storedConversationAudio": sum(bool(item.get("cachedConversationAudio")) for item in l1_items),
                "storedBytes": local_audio_bytes,
                "mainVideos": sum(bool(item.get("mainVideo")) for item in l1_items),
                "practiceVideos": sum(len(item["speakingPracticeVideos"]) + len(item["pronunciationPracticeVideos"]) for item in l1_items),
                "transcripts": sum(bool(item["transcript"]) for item in l1_items),
            },
            {
                "id": "voa-lle2",
                "catalog": "voa-lle2-full.json",
                "items": len(l2_items),
                "mainVideos": sum(bool(item.get("mainVideo")) for item in l2_items),
                "conversationAudio": sum(bool(item.get("conversationAudio")) for item in l2_items),
                "transcripts": sum(bool(item["transcript"]) for item in l2_items),
            },
            {
                "id": "sbcsae",
                "catalog": "sbcsae.json",
                "items": len(sbc_items),
                "audioOriginalLinks": len(sbc_items),
                "transcriptPairs": len(sbc_items),
            },
        ],
        "courseResources": COURSE_RESOURCES,
    }
    json_dump(output / "registry.json", registry)


def chosen_video(media: dict[str, Any] | None) -> str | None:
    if not media:
        return None
    selected = media.get("selected")
    return selected.get("url") if selected else None


def write_url_to_zip(archive: zipfile.ZipFile, url: str, arcname: str) -> None:
    suffix = Path(urllib.parse.urlparse(url).path).suffix
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as handle:
        temp = Path(handle.name)
    try:
        last_error: Exception | None = None
        for attempt in range(1, RETRIES + 1):
            try:
                with urllib.request.urlopen(request(url), timeout=TIMEOUT) as response, temp.open("wb") as out:
                    shutil.copyfileobj(response, out, length=1024 * 1024)
                if temp.stat().st_size == 0:
                    raise RuntimeError("empty response")
                break
            except Exception as exc:
                last_error = exc
                temp.unlink(missing_ok=True)
                temp.touch()
                if attempt < RETRIES:
                    time.sleep(attempt * 2)
        else:
            raise RuntimeError(f"failed to download {url}: {last_error}")
        archive.write(temp, arcname, compress_type=zipfile.ZIP_STORED)
    finally:
        temp.unlink(missing_ok=True)


def transcript_text(item: dict[str, Any]) -> str:
    return "\n".join(
        f"{line['speaker']}: {line['text']}" if line.get("speaker") else line["text"]
        for line in item["transcript"]
    ) + "\n"


def attribution_text(collection: str) -> str:
    if collection.startswith("voa"):
        return (
            "Source: VOA Learning English, https://learningenglish.voanews.com\n"
            "Rights: VOA-produced Learning English text, MP3, photos, and videos are public domain.\n"
            f"Rights statement: {VOA_TERMS_URL}\n"
            "This archive intentionally excludes third-party agency material.\n"
        )
    return (
        "Source: Santa Barbara Corpus of Spoken American English, Parts 1-4.\n"
        "Creators: John W. Du Bois, Wallace L. Chafe, Charles Meyer, Sandra A. Thompson, "
        "Robert Englebretson, and Nii Martey.\n"
        f"Catalog and attribution: {SBC_INDEX}\n"
        f"License: CC BY-ND 3.0 US, {SBC_LICENSE_URL}\n"
        "Files in this archive are unmodified originals. Do not redistribute derivatives.\n"
    )


def build_voa_archive(catalog: dict[str, Any], group: int, destination: Path) -> None:
    level = catalog["level"]
    items = [item for item in catalog["items"] if int(item["quarter"]) == group]
    filename = f"voa-lle{level}-q{group}.zip"
    out = destination / filename
    with zipfile.ZipFile(out, "w", allowZip64=True) as archive:
        archive.writestr("ATTRIBUTION.txt", attribution_text(f"voa-lle{level}"))
        for item in items:
            base = item["id"]
            archive.writestr(f"{base}/transcript.txt", transcript_text(item))
            main = chosen_video(item.get("mainVideo"))
            if main:
                print(f"download {base} main video", file=sys.stderr)
                write_url_to_zip(archive, main, f"{base}/video/main.mp4")
            audio = (item.get("conversationAudio") or {}).get("url")
            if audio:
                print(f"download {base} conversation audio", file=sys.stderr)
                write_url_to_zip(archive, audio, f"{base}/audio/conversation.mp3")
            if level == 1:
                for kind, key in (
                    ("speaking", "speakingPracticeVideos"),
                    ("pronunciation", "pronunciationPracticeVideos"),
                ):
                    videos = item.get(key) or []
                    if videos:
                        url = chosen_video(videos[0])
                        if url:
                            print(f"download {base} {kind} video", file=sys.stderr)
                            write_url_to_zip(archive, url, f"{base}/video/{kind}.mp4")


def build_sbc_archive(catalog: dict[str, Any], destination: Path) -> None:
    out = destination / "sbcsae-transcripts.zip"
    with zipfile.ZipFile(out, "w", allowZip64=True) as archive:
        archive.writestr("ATTRIBUTION.txt", attribution_text("sbcsae"))
        for item in catalog["items"]:
            source_id = item["sourceId"]
            print(f"download {source_id} transcripts", file=sys.stderr)
            write_url_to_zip(archive, item["transcriptTrn"], f"transcripts/{source_id}.trn")
            write_url_to_zip(archive, item["transcriptChat"], f"transcripts/{source_id}.cha")


def build_guide_archive(destination: Path) -> None:
    out = destination / "voa-course-guides.zip"
    with zipfile.ZipFile(out, "w", allowZip64=True) as archive:
        archive.writestr("ATTRIBUTION.txt", attribution_text("voa-guides"))
        for resource in COURSE_RESOURCES:
            print(f"download {resource['id']}", file=sys.stderr)
            write_url_to_zip(archive, resource["url"], resource["filename"])


def build_archives(catalog_dir: Path, destination: Path, *, dry_run: bool) -> None:
    l1 = json.loads((catalog_dir / "voa-lle1-full.json").read_text(encoding="utf-8"))
    l2 = json.loads((catalog_dir / "voa-lle2-full.json").read_text(encoding="utf-8"))
    sbc = json.loads((catalog_dir / "sbcsae.json").read_text(encoding="utf-8"))
    destination.mkdir(parents=True, exist_ok=True)

    expected = []
    for catalog, groups in ((l1, range(1, 5)), (l2, range(1, 4))):
        for group in groups:
            expected.append(f"voa-lle{catalog['level']}-q{group}.zip")
    expected.extend(["sbcsae-transcripts.zip", "voa-course-guides.zip"])
    if dry_run:
        print("\n".join(expected))
        return

    for group in range(1, 5):
        build_voa_archive(l1, group, destination)
    for group in range(1, 4):
        build_voa_archive(l2, group, destination)
    build_sbc_archive(sbc, destination)
    build_guide_archive(destination)

    sums = []
    for path in sorted(destination.glob("*.zip")):
        sums.append(f"{sha256_path(path)}  {path.name}")
    (destination / "SHA256SUMS").write_text("\n".join(sums) + "\n", encoding="utf-8")
    shutil.copy2(catalog_dir / "registry.json", destination / "registry.json")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    catalog = subparsers.add_parser("catalog", help="crawl official pages and write JSON catalogs")
    catalog.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    catalog.add_argument("--workers", type=int, default=6)

    archive = subparsers.add_parser("archive", help="build release ZIPs from generated catalogs")
    archive.add_argument("--catalog-dir", type=Path, default=DEFAULT_OUTPUT)
    archive.add_argument("--destination", type=Path, required=True)
    archive.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.command == "catalog":
        write_catalogs(args.output, max(1, args.workers))
    elif args.command == "archive":
        build_archives(args.catalog_dir, args.destination, dry_run=args.dry_run)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
