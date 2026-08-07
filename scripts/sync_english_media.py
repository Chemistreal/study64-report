#!/usr/bin/env python3
"""Mirror the reusable VOA Level 1 lesson assets used by english.html.

The script intentionally keeps full-length video on VOA's CDN.  GitHub Pages has
a 1 GB published-site limit, while the 52 low-resolution lesson videos alone are
hundreds of megabytes.  It mirrors compact, reusable assets instead: conversation
audio, lesson PDFs, hero images, transcripts, and normalized source metadata.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import html as html_lib
import json
import mimetypes
import re
import shutil
import subprocess
import sys
import time
import unicodedata
from dataclasses import dataclass
from datetime import date
from io import BytesIO
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen

from lxml import html
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / "media" / "english"
CATALOG_PATH = MEDIA / "catalog.json"
USER_AGENT = "study64-report-media-sync/1.0 (+https://chemistreal.github.io/study64-report/)"
LICENSE = "VOA Learning English public-domain material; credit learningenglish.voanews.com"


@dataclass
class FetchResult:
    url: str
    data: bytes
    content_type: str


def fetch(url: str, *, attempts: int = 4, timeout: int = 45) -> FetchResult:
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            req = Request(
                url,
                headers={
                    "User-Agent": USER_AGENT,
                    "Accept": "*/*",
                    "Accept-Encoding": "identity",
                },
            )
            with urlopen(req, timeout=timeout) as response:
                return FetchResult(
                    url=response.geturl(),
                    data=response.read(),
                    content_type=response.headers.get_content_type(),
                )
        except (HTTPError, URLError, TimeoutError, ConnectionError) as exc:
            last_error = exc
            if attempt + 1 < attempts:
                time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"download failed after {attempts} attempts: {url}: {last_error}")


def write_bytes(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".part")
    temp.write_bytes(data)
    temp.replace(path)


def clean_text(value: str) -> str:
    value = html_lib.unescape(value).replace("\xa0", " ")
    value = "".join(char for char in value if unicodedata.category(char) != "Cf")
    return re.sub(r"\s+", " ", value).strip()


def class_tokens(node: Any) -> set[str]:
    return set((node.get("class") or "").split())


def absolute(base: str, value: str | None) -> str | None:
    if not value:
        return None
    return urljoin(base, html_lib.unescape(value))


def first_text(tree: Any, expression: str) -> str | None:
    found = tree.xpath(expression)
    if not found:
        return None
    value = found[0]
    if hasattr(value, "text_content"):
        value = value.text_content()
    return clean_text(str(value)) or None


def parse_sources(raw: str | None) -> list[dict[str, Any]]:
    if not raw:
        return []
    try:
        value = json.loads(html_lib.unescape(raw))
        if isinstance(value, list):
            return value
    except json.JSONDecodeError:
        pass
    return []


def visible_sections(article: Any) -> dict[str, list[str]]:
    """Return compact visible text grouped by direct article headings."""
    if article is None:
        return {}
    wsw_nodes = article.xpath(".//div[contains(concat(' ', normalize-space(@class), ' '), ' wsw ')]")
    wsw = wsw_nodes[0] if wsw_nodes else article
    sections: dict[str, list[str]] = {}
    current = "Introduction"
    sections[current] = []

    for node in wsw:
        tag = str(node.tag).lower() if isinstance(node.tag, str) else ""
        if tag in {"h2", "h3"}:
            heading = clean_text(node.text_content())
            if heading:
                current = heading
                sections.setdefault(current, [])
            continue

        classes = class_tokens(node)
        if any(
            token.startswith(("wsw__embed", "media-", "c-mmp", "externalMedia"))
            for token in classes
        ):
            continue
        if node.xpath(".//*[contains(@class, 'c-mmp') or contains(@class, 'media-pholder')]"):
            continue

        text = clean_text(node.text_content())
        if not text or len(text) > 2200:
            continue
        if text not in sections[current]:
            sections[current].append(text)

    return {key: value for key, value in sections.items() if value}


def conversation_lines(sections: dict[str, list[str]]) -> list[str]:
    lines: list[str] = []
    for heading, blocks in sections.items():
        if "conversation" not in heading.lower():
            continue
        for block in blocks:
            # The source normally uses one <div> per speaker turn.  If a page
            # collapses several turns into one node, split before Speaker:.
            parts = re.split(r"(?=(?:Anna|Pete|Marsha|Ashley|Jonathan|Amelia|Kaveh|Penelope|Susan|Caty|Jill|John|Ms\.|Mr\.)[^:]{0,30}:)", block)
            for part in parts:
                part = clean_text(part)
                if part and part not in lines:
                    lines.append(part)
    return lines


def media_records(tree: Any, base_url: str, tag: str) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    seen: set[str] = set()
    for node in tree.xpath(f"//{tag}[@src]"):
        src = absolute(base_url, node.get("src"))
        if not src or src in seen:
            continue
        seen.add(src)
        parent = node
        title = node.get("title")
        for _ in range(7):
            parent = parent.getparent()
            if parent is None:
                break
            title = title or parent.get("data-title")
        record: dict[str, Any] = {
            "title": clean_text(title or ""),
            "url": src,
        }
        fallback = absolute(base_url, node.get("data-fallbacksrc"))
        if fallback:
            record["fallbackUrl"] = fallback
        variants = []
        for source in parse_sources(node.get("data-sources")):
            source_url = source.get("Src") or source.get("AmpSrc")
            if source_url:
                variants.append(
                    {
                        "label": source.get("DataInfo"),
                        "url": absolute(base_url, source_url),
                    }
                )
        if variants:
            record["variants"] = variants
        records.append(record)
    return records


def download_variants(tree: Any, base_url: str, suffix: str) -> list[dict[str, str]]:
    records: list[dict[str, str]] = []
    seen: set[str] = set()
    for node in tree.xpath(f"//a[contains(@href, '.{suffix}')]"):
        url = absolute(base_url, node.get("href"))
        if not url or url in seen:
            continue
        seen.add(url)
        records.append(
            {
                "label": clean_text(node.get("title") or node.text_content()),
                "url": url,
            }
        )
    return records


def parse_lesson_page(page_url: str, payload: bytes) -> dict[str, Any]:
    tree = html.fromstring(payload, base_url=page_url)
    article_nodes = tree.xpath("//*[@id='article-content']")
    article = article_nodes[0] if article_nodes else None
    sections = visible_sections(article)
    image_url = first_text(tree, "//meta[@property='og:image']/@content")
    published = first_text(tree, "//time[@datetime][1]/@datetime")

    download_page = None
    if article is not None:
        # VOA used several URL schemes over the life of the course.  Anchor the
        # lookup to the visible "Download Lesson N" heading instead of assuming
        # one slug pattern (some pages use `lle1-lesson-N-lesson-plan`).
        download_headings = article.xpath(
            ".//h2[contains(translate(normalize-space(.), "
            "'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), "
            "'download lesson')]"
        )
        if download_headings:
            for sibling in download_headings[0].itersiblings():
                if isinstance(sibling.tag, str) and sibling.tag.lower() == "h2":
                    break
                candidates = sibling.xpath(".//a[@href]/@href")
                if candidates:
                    download_page = absolute(page_url, candidates[0])
                    break

    youtube_ids = []
    for script in tree.xpath("//script[contains(text(), 'youtube.com/embed/')]/text()"):
        youtube_ids.extend(re.findall(r"youtube\.com/embed/([A-Za-z0-9_-]+)", script))

    images = []
    seen_images: set[str] = set()
    if article is not None:
        for raw in article.xpath(".//img/@src"):
            url = absolute(page_url, raw)
            if url and "gdb.voanews.com" in url and url not in seen_images:
                seen_images.add(url)
                images.append(url)

    return {
        "title": first_text(tree, "//h1[contains(@class, 'title')][1]") or "",
        "published": published,
        "heroImageOriginal": image_url,
        "downloadPage": download_page,
        "conversation": conversation_lines(sections),
        "sections": sections,
        "audioSources": media_records(tree, page_url, "audio"),
        "videoSources": media_records(tree, page_url, "video"),
        "videoDownloads": download_variants(tree, page_url, "mp4"),
        "youtubeIds": list(dict.fromkeys(youtube_ids)),
        "articleImages": images,
    }


def parse_download_page(page_url: str, payload: bytes) -> list[str]:
    tree = html.fromstring(payload, base_url=page_url)
    urls = []
    for raw in tree.xpath("//a[contains(@href, '.pdf')]/@href"):
        url = absolute(page_url, raw)
        if url and url not in urls:
            urls.append(url)
    return urls


def save_webp(source: bytes, path: Path) -> None:
    with Image.open(BytesIO(source)) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        if image.width > 1200:
            height = round(image.height * (1200 / image.width))
            image = image.resize((1200, height), Image.Resampling.LANCZOS)
        path.parent.mkdir(parents=True, exist_ok=True)
        temp = path.with_suffix(".part.webp")
        image.save(temp, "WEBP", quality=84, method=6)
        temp.replace(path)


def optimize_large_pdf(path: Path, threshold: int = 20 * 1024 * 1024) -> None:
    """Web-optimize unusually large lesson PDFs when Ghostscript is available."""
    ghostscript = shutil.which("gs")
    if not ghostscript or not path.is_file() or path.stat().st_size <= threshold:
        return
    temp = path.with_suffix(".optimized.pdf")
    command = [
        ghostscript,
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        "-dPDFSETTINGS=/ebook",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        "-dDetectDuplicateImages=true",
        "-dCompressFonts=true",
        f"-sOutputFile={temp}",
        str(path),
    ]
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode:
        temp.unlink(missing_ok=True)
        raise RuntimeError(f"Ghostscript failed for {path.name}: {result.stderr.strip()}")
    if not temp.read_bytes().startswith(b"%PDF-"):
        temp.unlink(missing_ok=True)
        raise RuntimeError(f"optimized output is not a PDF: {path.name}")
    if temp.stat().st_size < path.stat().st_size:
        temp.replace(path)
    else:
        temp.unlink()


def transcript_markdown(item: dict[str, Any], source: dict[str, Any]) -> str:
    header = [
        f"# {item['title']}",
        f"Source: {item['page']}",
        "License: VOA Learning English public-domain material. Credit learningenglish.voanews.com.",
        "## Conversation",
    ]
    conversation = source.get("conversation") or []
    body = conversation or ["(No standalone conversation transcript was found on the source page.)"]
    return "\n\n".join(header + body).rstrip() + "\n"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def mime_for(path: Path) -> str:
    return mimetypes.guess_type(path.name)[0] or "application/octet-stream"


def manifest_entry(path: Path, source_url: str | None, role: str) -> dict[str, Any]:
    return {
        "path": path.relative_to(ROOT).as_posix(),
        "role": role,
        "bytes": path.stat().st_size,
        "mime": mime_for(path),
        "sha256": sha256(path),
        "sourceUrl": source_url,
        "license": LICENSE,
    }


def sync_one(item: dict[str, Any], refresh: bool) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    lesson_id = item["id"]
    main_result = fetch(item["page"])
    parsed = parse_lesson_page(main_result.url, main_result.data)

    pdf_urls: list[str] = []
    if parsed.get("downloadPage"):
        result = fetch(parsed["downloadPage"])
        pdf_urls = parse_download_page(result.url, result.data)
    parsed["pdfOriginals"] = pdf_urls

    transcript_path = MEDIA / "transcripts" / f"{lesson_id}.md"
    lesson_path = MEDIA / "lessons" / f"{lesson_id}.json"
    image_path = MEDIA / "images" / f"{lesson_id}.webp"
    pdf_path = MEDIA / "worksheets" / f"{lesson_id}.pdf"

    item = dict(item)
    item.update(
        {
            "image": image_path.relative_to(ROOT).as_posix(),
            "transcript": transcript_path.relative_to(ROOT).as_posix(),
            "lessonData": lesson_path.relative_to(ROOT).as_posix(),
        }
    )

    transcript_path.parent.mkdir(parents=True, exist_ok=True)
    transcript_path.write_text(transcript_markdown(item, parsed), encoding="utf-8")

    if parsed.get("heroImageOriginal") and (refresh or not image_path.exists()):
        save_webp(fetch(parsed["heroImageOriginal"]).data, image_path)

    if pdf_urls:
        item["worksheet"] = pdf_path.relative_to(ROOT).as_posix()
        if refresh or not pdf_path.exists():
            result = fetch(pdf_urls[0])
            if not result.data.startswith(b"%PDF-"):
                raise RuntimeError(f"not a PDF: {result.url}")
            write_bytes(pdf_path, result.data)
        optimize_large_pdf(pdf_path)

    parsed.update(
        {
            "id": lesson_id,
            "lesson": item["lesson"],
            "quarter": item["quarter"],
            "page": item["page"],
            "fetched": date.today().isoformat(),
            "local": {
                "audio": item["audio"],
                "image": item["image"],
                "transcript": item["transcript"],
                "worksheet": item.get("worksheet"),
            },
            "license": LICENSE,
        }
    )
    lesson_path.parent.mkdir(parents=True, exist_ok=True)
    lesson_path.write_text(json.dumps(parsed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    entries = [
        manifest_entry(ROOT / item["audio"], item.get("originalAudio"), "conversation-audio"),
        manifest_entry(image_path, parsed.get("heroImageOriginal"), "hero-image"),
        manifest_entry(transcript_path, item["page"], "conversation-transcript"),
        manifest_entry(lesson_path, item["page"], "normalized-lesson-data"),
    ]
    if item.get("worksheet"):
        entries.append(manifest_entry(pdf_path, pdf_urls[0], "lesson-pdf"))
    return item, entries


def write_catalog(catalog: dict[str, Any]) -> None:
    catalog["count"] = len(catalog["items"])
    catalog["checked"] = date.today().isoformat()
    catalog["localAssets"] = {
        "audio": len(catalog["items"]),
        "images": sum(bool(item.get("image")) for item in catalog["items"]),
        "transcripts": sum(bool(item.get("transcript")) for item in catalog["items"]),
        "worksheets": sum(bool(item.get("worksheet")) for item in catalog["items"]),
        "lessonData": sum(bool(item.get("lessonData")) for item in catalog["items"]),
    }
    encoded = json.dumps(catalog, ensure_ascii=False, indent=2) + "\n"
    CATALOG_PATH.write_text(encoded, encoding="utf-8")
    (MEDIA / "catalog.js").write_text(
        "window.ENG_MEDIA_CATALOG=" + encoded.rstrip() + ";\n", encoding="utf-8"
    )


def build_manifest_entries(catalog: dict[str, Any]) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    for item in catalog["items"]:
        lesson_path = ROOT / item["lessonData"]
        lesson = json.loads(lesson_path.read_text(encoding="utf-8")) if lesson_path.exists() else {}
        mappings = [
            (item.get("audio"), item.get("originalAudio"), "conversation-audio"),
            (item.get("image"), lesson.get("heroImageOriginal"), "hero-image"),
            (item.get("transcript"), item.get("page"), "conversation-transcript"),
            (item.get("lessonData"), item.get("page"), "normalized-lesson-data"),
            (
                item.get("worksheet"),
                (lesson.get("pdfOriginals") or [None])[0],
                "lesson-pdf",
            ),
        ]
        for relative, source_url, role in mappings:
            if relative and (ROOT / relative).is_file():
                entries.append(manifest_entry(ROOT / relative, source_url, role))
    for path, role in (
        (CATALOG_PATH, "catalog"),
        (MEDIA / "catalog.js", "browser-catalog"),
        (MEDIA / "README.md", "documentation"),
        (MEDIA / "NOTICE.md", "license-notice"),
    ):
        if path.is_file():
            source_url = catalog.get("termsUrl") if role == "license-notice" else catalog.get("sourceUrl")
            entries.append(manifest_entry(path, source_url, role))
    entries.sort(key=lambda entry: entry["path"])
    return entries


def write_manifest(catalog: dict[str, Any]) -> dict[str, Any]:
    entries = build_manifest_entries(catalog)
    manifest = {
        "schemaVersion": 1,
        "generated": date.today().isoformat(),
        "source": catalog.get("source"),
        "sourceUrl": catalog.get("sourceUrl"),
        "termsUrl": catalog.get("termsUrl"),
        "license": LICENSE,
        "summary": {
            "lessons": len(catalog["items"]),
            "files": len(entries),
            "bytes": sum(entry["bytes"] for entry in entries),
        },
        "files": entries,
    }
    (MEDIA / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return manifest


def verify(catalog: dict[str, Any], manifest: dict[str, Any] | None = None) -> list[str]:
    errors: list[str] = []
    items = catalog.get("items") or []
    if len(items) != 52:
        errors.append(f"catalog has {len(items)} items, expected 52")
    ids = [item.get("id") for item in items]
    if len(ids) != len(set(ids)):
        errors.append("catalog IDs are not unique")

    required = ("audio", "image", "transcript", "lessonData", "worksheet")
    for item in items:
        for field in required:
            value = item.get(field)
            if not value:
                errors.append(f"{item.get('id')}: missing {field}")
                continue
            path = ROOT / value
            if not path.is_file() or path.stat().st_size == 0:
                errors.append(f"{item.get('id')}: missing or empty file {value}")

    if manifest:
        for entry in manifest.get("files", []):
            path = ROOT / entry["path"]
            if not path.is_file():
                errors.append(f"manifest file missing: {entry['path']}")
            elif path.stat().st_size != entry["bytes"]:
                errors.append(f"manifest size mismatch: {entry['path']}")
            elif sha256(path) != entry["sha256"]:
                errors.append(f"manifest hash mismatch: {entry['path']}")
    return errors


def command_sync(args: argparse.Namespace) -> int:
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    items = catalog["items"]
    wanted = set(args.lessons or [])
    selected = [item for item in items if not wanted or item["id"] in wanted]
    unknown = wanted - {item["id"] for item in items}
    if unknown:
        raise RuntimeError("unknown lesson IDs: " + ", ".join(sorted(unknown)))
    results: dict[str, dict[str, Any]] = {item["id"]: item for item in items}

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        future_map = {pool.submit(sync_one, item, args.refresh): item for item in selected}
        complete = 0
        for future in concurrent.futures.as_completed(future_map):
            original = future_map[future]
            try:
                item, item_entries = future.result()
            except Exception as exc:  # keep the exact lesson in the error
                raise RuntimeError(f"{original['id']} failed: {exc}") from exc
            results[item["id"]] = item
            complete += 1
            print(f"[{complete:02d}/{len(selected):02d}] {item['id']} mirrored", flush=True)

    catalog["items"] = [results[item["id"]] for item in items]
    write_catalog(catalog)
    manifest = write_manifest(catalog)
    entries = manifest["files"]

    errors = verify(catalog, manifest)
    if errors:
        print("\n".join(f"ERROR: {error}" for error in errors), file=sys.stderr)
        return 1
    print(
        f"Verified 52 lessons, {len(entries)} indexed files, "
        f"{sum(entry['bytes'] for entry in entries) / (1024 * 1024):.1f} MiB.",
        flush=True,
    )
    return 0


def command_verify() -> int:
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    manifest_path = MEDIA / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else None
    errors = verify(catalog, manifest)
    if errors:
        print("\n".join(f"ERROR: {error}" for error in errors), file=sys.stderr)
        return 1
    print(f"Verified {len(catalog['items'])} lessons with no missing local assets.")
    return 0


def command_rebuild_index() -> int:
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    for item in catalog["items"]:
        lesson_path = ROOT / item["lessonData"]
        lesson = json.loads(lesson_path.read_text(encoding="utf-8"))
        (ROOT / item["transcript"]).write_text(
            transcript_markdown(item, lesson), encoding="utf-8"
        )
    write_catalog(catalog)
    manifest = write_manifest(catalog)
    errors = verify(catalog, manifest)
    if errors:
        print("\n".join(f"ERROR: {error}" for error in errors), file=sys.stderr)
        return 1
    print(
        f"Rebuilt transcripts, catalogs, and manifest for {len(catalog['items'])} lessons."
    )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--refresh", action="store_true", help="redownload images and PDFs")
    parser.add_argument("--workers", type=int, default=4, choices=range(1, 9))
    parser.add_argument(
        "--lessons",
        nargs="+",
        metavar="ID",
        help="sync selected IDs, for example lle1-03 lle1-12",
    )
    parser.add_argument("--verify-only", action="store_true")
    parser.add_argument(
        "--rebuild-index",
        action="store_true",
        help="rebuild transcripts, catalogs, and manifest without network access",
    )
    args = parser.parse_args()
    if args.verify_only and args.rebuild_index:
        parser.error("--verify-only and --rebuild-index cannot be combined")
    if args.verify_only:
        return command_verify()
    if args.rebuild_index:
        return command_rebuild_index()
    return command_sync(args)


if __name__ == "__main__":
    raise SystemExit(main())
