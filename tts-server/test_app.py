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
