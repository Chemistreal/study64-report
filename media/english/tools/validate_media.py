#!/usr/bin/env python3
"""Validate the checked-in English media catalogs and cached audio."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
MEDIA_ROOT = ROOT / "media" / "english"
ARCHIVE_ROOT = MEDIA_ROOT / "archive"


def load(name: str) -> dict[str, Any]:
    return json.loads((ARCHIVE_ROOT / name).read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def validate_voa(catalog: dict[str, Any], expected: int, level: int, errors: list[str]) -> None:
    items = catalog.get("items") or []
    require(catalog.get("count") == expected, f"L{level}: count field is not {expected}", errors)
    require(len(items) == expected, f"L{level}: expected {expected} items, got {len(items)}", errors)
    require([item.get("lesson") for item in items] == list(range(1, expected + 1)), f"L{level}: lesson sequence is incomplete", errors)
    ids = set()
    for item in items:
        item_id = item.get("id")
        require(bool(item_id), f"L{level}: item without id", errors)
        require(item_id not in ids, f"L{level}: duplicate id {item_id}", errors)
        ids.add(item_id)
        require(item.get("license") == "voa-public-domain", f"{item_id}: wrong license", errors)
        require(bool(item.get("mainVideo", {}).get("selected", {}).get("url")), f"{item_id}: no selected main video", errors)
        if level == 1:
            require(bool(item.get("conversationAudio", {}).get("url")), f"{item_id}: no conversation audio", errors)
        else:
            has_audio = bool((item.get("conversationAudio") or {}).get("url"))
            require(has_audio or item.get("audioFallback") == "main-video", f"{item_id}: no usable audio source", errors)
        require(bool(item.get("transcript")), f"{item_id}: no transcript", errors)
        for embed in item.get("youtubeEmbeds") or []:
            require(embed.get("storage") == "embed-only", f"{item_id}: YouTube reference is not embed-only", errors)
            require("youtube.com/embed/" in (embed.get("embedUrl") or ""), f"{item_id}: malformed YouTube embed", errors)
        blob = json.dumps(item, ensure_ascii=False)
        require("youtube.com/watch" not in blob and "youtu.be/" not in blob, f"{item_id}: downloadable YouTube-style URL found", errors)

        if level == 1:
            require(len(item.get("speakingPracticeVideos") or []) == 1, f"{item_id}: speaking video missing", errors)
            require(len(item.get("pronunciationPracticeVideos") or []) == 1, f"{item_id}: pronunciation video missing", errors)
            cached = item.get("cachedConversationAudio") or {}
            path = ROOT / (cached.get("path") or "missing")
            require(path.is_file(), f"{item_id}: cached MP3 is missing", errors)
            if path.is_file():
                require(path.stat().st_size == cached.get("bytes"), f"{item_id}: cached MP3 byte count changed", errors)
                require(sha256(path) == cached.get("sha256"), f"{item_id}: cached MP3 checksum changed", errors)


def validate_sbc(catalog: dict[str, Any], errors: list[str]) -> None:
    items = catalog.get("items") or []
    require(catalog.get("count") == 60 and len(items) == 60, "SBCSAE: expected 60 items", errors)
    expected_ids = [f"sbc{number:03d}" for number in range(1, 61)]
    require([item.get("id") for item in items] == expected_ids, "SBCSAE: sequence is incomplete", errors)
    for item in items:
        item_id = item.get("id")
        require(item.get("license") == "cc-by-nd-3.0-us", f"{item_id}: wrong license", errors)
        require(item.get("allowedTreatment") == "redistribute-unchanged-with-attribution", f"{item_id}: ND treatment missing", errors)
        require(str(item.get("transcriptTrn", "")).endswith(".trn"), f"{item_id}: TRN URL missing", errors)
        require(str(item.get("transcriptChat", "")).endswith(".cha"), f"{item_id}: CHAT URL missing", errors)
        require("box.com/s/" in str(item.get("audioOriginal", "")), f"{item_id}: original audio link missing", errors)


def validate_legacy_catalog(errors: list[str]) -> None:
    json_catalog = json.loads((MEDIA_ROOT / "catalog.json").read_text(encoding="utf-8"))
    js = (MEDIA_ROOT / "catalog.js").read_text(encoding="utf-8").strip()
    prefix = "window.ENG_MEDIA_CATALOG="
    require(js.startswith(prefix) and js.endswith(";"), "legacy catalog.js wrapper is malformed", errors)
    if js.startswith(prefix) and js.endswith(";"):
        js_catalog = json.loads(js[len(prefix) : -1])
        require(js_catalog == json_catalog, "catalog.js and catalog.json differ", errors)
    require(json_catalog.get("count") == 52, "legacy catalog does not contain 52 items", errors)


def probe_mp3s(errors: list[str]) -> None:
    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        return
    for path in sorted((MEDIA_ROOT / "audio").glob("*.mp3")):
        result = subprocess.run(
            [ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)],
            capture_output=True,
            text=True,
            check=False,
        )
        require(result.returncode == 0 and result.stdout.strip(), f"invalid MP3: {path.name}", errors)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--probe-audio", action="store_true")
    args = parser.parse_args()

    errors: list[str] = []
    validate_legacy_catalog(errors)
    validate_voa(load("voa-lle1-full.json"), 52, 1, errors)
    validate_voa(load("voa-lle2-full.json"), 30, 2, errors)
    validate_sbc(load("sbcsae.json"), errors)

    registry = load("registry.json")
    require(registry.get("storagePolicy", {}).get("youtube") == "embed-only", "registry: YouTube policy missing", errors)
    require(len(registry.get("courseResources") or []) >= 4, "registry: course resources missing", errors)

    if args.probe_audio:
        probe_mp3s(errors)

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print("media catalogs valid: 52 Level 1 + 30 Level 2 + 60 SBCSAE; 52 cached MP3 files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
