"""Ephemeral HLS TTS service for 여백 (experimental).

HLS allows Safari's native media stack to play server-produced audio instead of
running Web Speech or a neural model inside a backgrounded browser tab.
Text is temporarily held in memory while rendered and forwarded to the
selected speech provider. NO permanent book/audio database is created.
"""
from __future__ import annotations

import asyncio
import html
from contextlib import asynccontextmanager
import os
import re
import secrets
import shutil
import tempfile
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

import edge_tts
import httpx
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from pydantic import BaseModel, Field

ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "ALLOWED_ORIGINS", "https://chemistreal.github.io"
    ).split(",")
    if origin.strip()
]
ACCESS_TOKEN = os.environ.get("YEOBACK_TTS_ACCESS_TOKEN", "")
MAX_ACTIVE = 1
MAX_PENDING = 3
synth_lock = asyncio.Semaphore(MAX_ACTIVE)
MAX_TEXT = 250000
CHUNK_CHARACTERS = 2400
MAX_JOB_SECONDS = 2400
TTS_PROVIDER = os.environ.get('TTS_PROVIDER', 'edge').strip().lower()
AZURE_SPEECH_KEY = os.environ.get('AZURE_SPEECH_KEY', '')
AZURE_SPEECH_REGION = os.environ.get('AZURE_SPEECH_REGION', '').strip().lower()

TTL_SECONDS = 3600
FAILED_JOB_TTL_SECONDS = 120
REAPER_INTERVAL_SECONDS = 60
VOICES = {
    "ko-KR-SunHiNeural": "선희 · 여성",
    "ko-KR-InJoonNeural": "인준 · 남성",
    "ko-KR-HyunsuMultilingualNeural": "현수 · 남성",
}
ROOT = Path(tempfile.mkdtemp(prefix="yeobaek-tts-"))
jobs: dict[str, "Job"] = {}
creation_times: list[float] = []

@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Keep stale media from accumulating even if no new request arrives.
    janitor = asyncio.create_task(periodic_cleanup(), name="yeobaek-hls-reaper")
    try:
        yield
    finally:
        janitor.cancel()
        await asyncio.gather(janitor, return_exceptions=True)
        active = [job.task for job in jobs.values() if job.task and not job.task.done()]
        for task in active:
            task.cancel()
        if active:
            await asyncio.gather(*active, return_exceptions=True)
        await asyncio.to_thread(shutil.rmtree, ROOT, True)


app = FastAPI(title="여백 임시 스트리밍 TTS", docs_url=None, redoc_url=None, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_methods=["GET", "POST", "HEAD", "OPTIONS"],
    allow_headers=["Content-Type", "X-Yeobaek-Key"],
    expose_headers=["Retry-After"],
)


@dataclass
class Job:
    id: str
    directory: Path
    created: float = field(default_factory=time.time)
    last_access: float = field(default_factory=time.time)
    status: str = "queued"
    chunks_total: int = 0
    chunks_done: int = 0
    error: str | None = None
    task: asyncio.Task | None = None

    def segment_count(self) -> int:
        return len(list(self.directory.glob("segment_*.ts")))

    def ready(self) -> bool:
        p = self.directory / "index.m3u8"
        if not p.is_file():
            return False
        try:
            return "#EXTINF:" in p.read_text(encoding="utf-8")
        except OSError:
            return False


class StartJob(BaseModel):
    text: str = Field(min_length=1, max_length=MAX_TEXT)
    voice: Literal[
        "ko-KR-SunHiNeural",
        "ko-KR-InJoonNeural",
        "ko-KR-HyunsuMultilingualNeural",
    ] = "ko-KR-SunHiNeural"
    rate_percent: int = Field(default=0, ge=-45, le=80)


def authorize(provided: str | None) -> None:
    if not ACCESS_TOKEN:
        raise HTTPException(status_code=503, detail="서버 인증 설정이 완료되지 않았습니다.")
    if not provided or not secrets.compare_digest(ACCESS_TOKEN, provided):
        raise HTTPException(status_code=401, detail="인증 정보가 올바르지 않습니다.")


async def cleanup() -> None:
    now = time.time()
    stale = []
    for key, job in tuple(jobs.items()):
        if job.status not in ("ready", "failed", "cancelled"):
            continue
        ttl = TTL_SECONDS if job.status == "ready" else FAILED_JOB_TTL_SECONDS
        if now - job.last_access <= ttl:
            continue
        if jobs.get(key) is job:
            stale.append((key, job))
    for key, job in stale:
        if job.task and not job.task.done():
            job.task.cancel()
            await asyncio.gather(job.task, return_exceptions=True)
        if jobs.get(key) is job:
            jobs.pop(key, None)
            await asyncio.to_thread(shutil.rmtree, job.directory, True)


async def periodic_cleanup() -> None:
    while True:
        await asyncio.sleep(REAPER_INTERVAL_SECONDS)
        try:
            await cleanup()
        except asyncio.CancelledError:
            raise
        except Exception:
            # A cleanup error must not silently kill the janitor task.
            import logging
            logging.getLogger(__name__).exception("Temporary HLS cleanup failed")


async def schedule_synthesis(job: Job, text: str, voice: str, rate: int) -> None:
    """Do not process more than one large audio job simultaneously."""
    async with synth_lock:
        if job.status == "cancelled":
            return
        await synthesize(job, text, voice, rate)



def split_tts_text(text: str, max_chars: int = CHUNK_CHARACTERS) -> list[str]:
    """Split large books at natural boundaries, not every 60k characters."""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    result: list[str] = []
    while text.strip():
        if len(text) <= max_chars:
            result.append(text.strip())
            break
        section = text[:max_chars]
        # Use the last meaningful break in the upper half of a chunk.
        candidates = [
            section.rfind("\n\n"),
            section.rfind("\n"),
            section.rfind(". "),
            section.rfind("! "),
            section.rfind("? "),
            section.rfind("。"),
            section.rfind("！"),
            section.rfind("？"),
            section.rfind(" "),
        ]
        at = max(candidates)
        if at < max_chars // 2:
            at = max_chars
        else:
            at += 1
        fragment = text[:at].strip()
        if fragment:
            result.append(fragment)
        text = text[at:]
    return result


async def stream_tts_mp3(fragment: str, voice: str, rate: int):
    """Keep the audio provider replaceable; do not expose credentials to the PWA."""
    if TTS_PROVIDER == "azure":
        if not AZURE_SPEECH_KEY or not AZURE_SPEECH_REGION:
            raise RuntimeError("Azure Speech is not configured")
        if not re.fullmatch(r"[a-z][a-z0-9]{1,35}", AZURE_SPEECH_REGION):
            raise RuntimeError("Invalid Azure Speech region")
        ssml = (
            '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"'
            ' xml:lang="ko-KR"><voice name="' + html.escape(voice, quote=True)
            + '"><prosody rate="' + f"{rate:+d}%" + '">'
            + html.escape(fragment) + '</prosody></voice></speak>'
        )
        address = f"https://{AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1"
        headers = {
            "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
            "User-Agent": "YeobaekReader/1.0",
        }
        async with httpx.AsyncClient(timeout=httpx.Timeout(150.0, connect=15.0)) as client:
            async with client.stream("POST", address, headers=headers, content=ssml.encode("utf-8")) as response:
                response.raise_for_status()
                async for data in response.aiter_bytes(8192):
                    if data:
                        yield data
    else:
        communicate = edge_tts.Communicate(
            text=fragment, voice=voice, rate=f"{rate:+d}%"
        )
        async for part in communicate.stream():
            if part.get("type") == "audio" and part.get("data"):
                yield part["data"]


async def synthesize(job: Job, text: str, voice: str, rate: int) -> None:
    """Pipe the speech provider's MP3 bytes into FFmpeg's HLS segmenter."""
    process = None
    try:
        job.status = "generating"
        playlist = job.directory / "index.m3u8"
        segments = job.directory / "segment_%05d.ts"
        process = await asyncio.create_subprocess_exec(
            "ffmpeg", "-hide_banner", "-nostdin", "-loglevel", "error",
            "-f", "mp3", "-i", "pipe:0",
            "-vn", "-c:a", "aac", "-ac", "1", "-ar", "24000", "-b:a", "64k",
            "-f", "hls", "-hls_time", "6", "-hls_list_size", "0",
            "-hls_playlist_type", "event",
            "-hls_flags", "temp_file",
            "-hls_segment_filename", str(segments),
            str(playlist),
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.PIPE,
        )
        fragments = split_tts_text(text)
        job.chunks_total = len(fragments)
        job.chunks_done = 0
        data_seen = False

        async def write_stream():
            nonlocal data_seen
            for index, fragment in enumerate(fragments):
                if job.status == "cancelled":
                    raise asyncio.CancelledError()
                async for data in stream_tts_mp3(fragment, voice, rate):
                    data_seen = True
                    process.stdin.write(data)
                    await process.stdin.drain()
                job.chunks_done = index + 1

        await asyncio.wait_for(write_stream(), timeout=MAX_JOB_SECONDS)
        process.stdin.close()
        if hasattr(process.stdin, "wait_closed"):
            try:
                await process.stdin.wait_closed()
            except BrokenPipeError:
                pass
        stderr = await asyncio.wait_for(process.stderr.read(), timeout=120)
        rc = await asyncio.wait_for(process.wait(), timeout=120)
        if rc != 0 or not data_seen or not job.ready():
            raise RuntimeError(
                "오디오 변환에 실패했습니다. "
                + stderr.decode("utf-8", "replace")[:300]
            )
        job.status = "ready"
    except asyncio.CancelledError:
        job.status = "cancelled"
        raise
    except Exception as exc:
        job.status = "failed"
        # Avoid writing the user's document into logs or error responses.
        job.error = f"음성 변환 중 오류가 발생했습니다 ({type(exc).__name__})."
    finally:
        if process is not None and process.returncode is None:
            process.kill()
            await process.wait()


@app.get("/health")
async def health():
    return {
        "status": "ok" if ACCESS_TOKEN and shutil.which("ffmpeg") and (TTS_PROVIDER == "edge" or TTS_PROVIDER == "azure" and AZURE_SPEECH_KEY and AZURE_SPEECH_REGION) else "unconfigured",
        "provider": TTS_PROVIDER,
        "limits": {"max_characters": MAX_TEXT, "chunk_characters": CHUNK_CHARACTERS},
        "ephemeral": True,
        "max_characters": MAX_TEXT,
    }


@app.get("/v1/voices")
async def voices():
    return {"voices": [{"id": key, "label": name} for key, name in VOICES.items()]}


@app.post("/v1/jobs", status_code=202)
async def start(
    payload: StartJob, x_yeobaek_key: str | None = Header(default=None),
):
    authorize(x_yeobaek_key)
    await cleanup()
    global creation_times
    now = time.time()
    creation_times = [t for t in creation_times if now - t < 3600]
    if len(creation_times) >= 12:
        raise HTTPException(429, "시간당 음성 변환 요청 한도에 도달했습니다.")
    if sum(j.status in ("queued", "generating") for j in jobs.values()) >= MAX_PENDING:
        raise HTTPException(429, "다른 음성 변환이 진행 중입니다.")
    if not payload.text.strip():
        raise HTTPException(422, "입력한 글이 비어 있습니다.")
    job_id = secrets.token_urlsafe(28)
    directory = ROOT / job_id
    directory.mkdir(mode=0o700)
    job = Job(job_id, directory)
    jobs[job_id] = job
    creation_times.append(now)
    job.task = asyncio.create_task(
        schedule_synthesis(job, payload.text, payload.voice, payload.rate_percent)
    )
    return {
        "job_id": job_id,
        "status_url": f"/v1/jobs/{job_id}",
        "hls_url": f"/v1/jobs/{job_id}/index.m3u8",
        "expires_in_seconds": TTL_SECONDS,
    }


@app.get("/v1/jobs/{job_id}")
async def status(
    job_id: str, x_yeobaek_key: str | None = Header(default=None),
):
    authorize(x_yeobaek_key)
    await cleanup()
    job = jobs.get(job_id)
    if job is None:
        raise HTTPException(404, "이 세션은 만료되었거나 존재하지 않습니다.")
    job.last_access = time.time()
    return {
        "status": job.status,
        "ready_to_play": job.ready(),
        "segments_ready": job.segment_count(),
        "chunks_total": job.chunks_total,
        "chunks_done": job.chunks_done,
        "error": job.error,
        "hls_url": f"/v1/jobs/{job_id}/index.m3u8",
    }


@app.post("/v1/jobs/{job_id}/cancel")
async def cancel(
    job_id: str, x_yeobaek_key: str | None = Header(default=None),
):
    authorize(x_yeobaek_key)
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(404, "해당 세션이 없습니다.")
    if job.task and not job.task.done():
        job.task.cancel()
        job.status = "cancelled"
    return {"status": job.status}


@app.api_route("/v1/jobs/{job_id}/{name}", methods=["GET", "HEAD"])
async def media(job_id: str, name: str, request: Request):
    # The 224-bit random job ID is a time-limited capability URL for Safari HLS.
    job = jobs.get(job_id)
    if job is None:
        raise HTTPException(404, "오디오 세션이 만료되었습니다.")
    job.last_access = time.time()
    if name != "index.m3u8" and not re.fullmatch(r"segment_\d{5}\.ts", name):
        raise HTTPException(404, "파일을 찾을 수 없습니다.")
    file = job.directory / name
    if not file.is_file():
        raise HTTPException(404, "오디오 준비 중입니다.", headers={"Retry-After": "1"})
    mime = "application/vnd.apple.mpegurl" if name.endswith(".m3u8") else "video/mp2t"
    headers = {
        "Cache-Control": "no-cache, private",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
    }
    return FileResponse(file, media_type=mime, headers=headers)


