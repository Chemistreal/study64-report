"""Offline integration checks for the authenticated ephemeral HLS API.

These tests intentionally do not contact any speech provider. They check the
server contract, access control, serving of temporary media, and request caps.
"""
import os
import tempfile
from pathlib import Path

os.environ["YEOBACK_TTS_ACCESS_TOKEN"] = "unit-tests-only"
os.environ["ALLOWED_ORIGINS"] = "https://chemistreal.github.io"

from fastapi.testclient import TestClient
import app as service

client = TestClient(service.app)
HEADERS = {"X-Yeobaek-Key": "unit-tests-only"}


def test_health_and_voices():
    assert client.get("/health").status_code == 200
    result = client.get("/v1/voices")
    assert result.status_code == 200
    assert len(result.json()["voices"]) == 3


def test_auth_and_input_rejection():
    assert client.post("/v1/jobs", json={"text": "테스트"}).status_code == 401
    assert client.post("/v1/jobs", headers=HEADERS, json={"text": ""}).status_code == 422
    assert client.post(
        "/v1/jobs", headers=HEADERS, json={"text": "가" * 60001}
    ).status_code == 422
    assert client.post(
        "/v1/jobs",
        headers=HEADERS,
        json={"text": "짧은 글", "voice": "untrusted-voice"},
    ).status_code == 422


def test_ephemeral_hls_access_and_media_headers():
    with tempfile.TemporaryDirectory() as temp:
        job_id = "test-fixture-audio"
        p = Path(temp)
        (p / "index.m3u8").write_text(
            "#EXTM3U\n#EXT-X-TARGETDURATION:6\n#EXTINF:6.0,\nsegment_00000.ts\n",
            encoding="utf-8",
        )
        (p / "segment_00000.ts").write_bytes(b"fixturebytes")
        service.jobs[job_id] = service.Job(job_id, p, status="ready")
        try:
            st = client.get("/v1/jobs/" + job_id, headers=HEADERS)
            assert st.status_code == 200
            assert st.json()["ready_to_play"] is True
            assert st.json()["segments_ready"] == 1
            assert client.get("/v1/jobs/" + job_id).status_code == 401
            manifest = client.get("/v1/jobs/" + job_id + "/index.m3u8")
            assert manifest.status_code == 200
            assert manifest.headers["cache-control"] == "no-cache, private"
            assert "#EXTM3U" in manifest.text
            assert client.head("/v1/jobs/" + job_id + "/index.m3u8").status_code == 200
            media = client.get("/v1/jobs/" + job_id + "/segment_00000.ts")
            assert media.status_code == 200
            assert media.content == b"fixturebytes"
            assert client.get(
                "/v1/jobs/" + job_id + "/segment_00000.ts",
                headers={"Range": "bytes=0-2"},
            ).status_code in (200, 206)
            assert client.get("/v1/jobs/" + job_id + "/../../.env").status_code == 404
        finally:
            service.jobs.pop(job_id, None)


def test_unknown_session():
    assert client.get("/v1/jobs/no-such-job", headers=HEADERS).status_code == 404
    assert client.get("/v1/jobs/no-such-job/index.m3u8").status_code == 404

def test_full_ffmpeg_pipeline_with_stub_speech_provider(monkeypatch):
    """Real FFmpeg HLS output from deterministic, locally produced MP3 input."""
    import asyncio
    import shutil
    import subprocess

    if not shutil.which("ffmpeg"):
        raise AssertionError("CI must install ffmpeg before running tests")
    result = subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-loglevel", "error",
            "-f", "lavfi", "-i", "sine=frequency=440:duration=9",
            "-ar", "24000", "-ac", "1", "-c:a", "libmp3lame",
            "-b:a", "48k", "-f", "mp3", "pipe:1",
        ],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True,
    )
    speech_bytes = result.stdout
    assert speech_bytes

    class FakeCommunicate:
        def __init__(self, text, voice, rate):
            assert text == "음성 서버 통합 테스트"
            assert voice in service.VOICES
            assert rate == "+0%"

        async def stream(self):
            for start in range(0, len(speech_bytes), 4096):
                yield {"type": "audio", "data": speech_bytes[start:start + 4096]}

    monkeypatch.setattr(service.edge_tts, "Communicate", FakeCommunicate)
    with tempfile.TemporaryDirectory() as directory:
        job = service.Job("test-render", Path(directory))
        asyncio.run(
            service.synthesize(job, "음성 서버 통합 테스트",
                               "ko-KR-SunHiNeural", 0)
        )
        assert job.status == "ready", job.error
        assert job.ready()
        assert job.segment_count() >= 1
        playlist = (Path(directory) / "index.m3u8").read_text()
        assert "#EXTINF:" in playlist
        assert "#EXT-X-ENDLIST" in playlist
