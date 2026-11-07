# 여백 임시 HLS 음성 스트리밍 서버 (실험용)

이 서비스는 글을 서버에서 음성으로 변환하고, Safari가 직접 재생할 수 있는 HLS(m3u8 + TS) 오디오 세그먼트를 제공합니다. **오디오를 사용자가 MP3로 저장할 필요는 없습니다.**

## 동작

- 브라우저가 책을 직접 저장하고, 사용자가 **서버로 전송**에 동의했을 때만 원문 텍스트를 `POST /v1/jobs`로 보냅니다.
- 서버는 무작위 224비트 ID로 임시 세션을 만들고, Edge 온라인 음성 서비스를 통해 음성 스트림을 받습니다.
- FFmpeg가 MP3 스트림을 AAC/HLS로 인코딩하며 6초짜리 오디오 세그먼트와 갱신되는 재생 목록을 생성합니다.
- 준비된 첫 세그먼트부터 Safari의 기본 `<audio>` 플레이어에서 재생할 수 있습니다. 서버는 이후 구간을 계속 생성합니다.
- 파일은 서버의 임시 저장소에만 있으며 약 1시간 뒤 자동 정리됩니다. 서버가 재시작되거나 무료 서비스가 유휴 종료되면 세션은 사라질 수 있습니다.
- 서재와 마지막 재생 위치는 기존 여백 IndexedDB에 저장합니다. **원본 문서를 공개 GitHub 저장소에 커밋하지 않습니다.**

## 반드시 알아야 할 것

이 코드는 실험용 백엔드입니다. `edge-tts`는 Microsoft Edge의 온라인 음성 서비스를 이용하는 **비공식 라이브러리**입니다. 접근 방식이나 제약이 바뀌면 작동하지 않을 수 있으며, 실제 사용 시 해당 서비스의 이용조건과 데이터 처리 정책을 검토해야 합니다. 음성 변환을 위해 입력 원문은 **이 서버와 음성 제공업체로 전송**됩니다. 민감한 내용을 무단으로 전송하지 마세요.

Safari의 기본 HLS 재생은 백그라운드 오디오 사용 가능성을 높이지만 **모든 아이폰에서 자동 시작/끊김 없는 재생을 보장하지는 않습니다.** 처음 오디오가 준비될 때 자동 재생이 차단되면 재생 버튼을 한 번 더 눌러야 합니다.

## 서버 실행

```sh
cd tts-server
export YEOBACK_TTS_ACCESS_TOKEN="길고 예측 불가능한 나만의 비밀"
export ALLOWED_ORIGINS="https://chemistreal.github.io"
docker build -t yeobaek-hls .
docker run --rm -p 8000:8000 -e YEOBACK_TTS_ACCESS_TOKEN -e ALLOWED_ORIGINS yeobaek-hls
```

`GET /health`가 `{"status":"ok"}`를 응답해야 합니다.

`POST /v1/jobs`: 헤더 `X-Yeobaek-Key: <토큰>`, JSON `{"text":"읽을 글","voice":"ko-KR-SunHiNeural","rate_percent":0}`.

응답에는 `job_id`, `status_url`, `hls_url`이 포함됩니다. `GET status_url`을 폴링해 `ready_to_play=true`가 되면 오디오 요소의 `src`를 HLS URL로 설정합니다. iOS Safari의 미디어 파이프라인이 실제 오디오 스트림을 재생합니다.

## 보안 및 제한

- **비밀 토큰을 GitHub Pages의 HTML/JS 소스에 넣지 마세요.** 개인 브라우저 세션에만 입력하고 `X-Yeobaek-Key` 헤더로 POST/상태 확인 요청에 사용합니다.
- HLS URL 자체가 짧은 기간 유효한 접근권한 역할을 하므로 로그/공유 링크에 노출하지 마세요.
- 서버는 고정 허용 Origin에만 CORS를 엽니다. Origin 검사는 인증을 대신하지 않습니다.
- 글당 최대 250,000자(음성은 최대 2,400자 단위로 순서대로 생성), 시간당 12개, 대기 포함 3개 작업 제한(동시에 실제 변환하는 작업은 1개)이 있습니다. 외부 공개 용도로 사용하려면 별도 인증·남용 방지·모니터링이 필요합니다.
- 서버 재시작·무료 플랜 유휴 종료 시 임시 오디오가 지워집니다. **영구 보관을 원할 때만 별도 저장소를 연결**하세요.
- Render 무료 웹서비스는 유휴 시 정지하고 로컬 파일 보존이 되지 않습니다. 실제 장문 서비스 안정성은 유료 서버 또는 계속 켜져 있는 개인 서버에서 더 높습니다.
- GitHub Pages 자체에는 서버 실행 기능이 없습니다. Render 등 외부 호스팅에 별도로 배포해야 합니다.

## 음성 제공업체 교체

`synthesize()`의 `edge_tts.Communicate().stream()` 부분을 정식 Google Cloud / Azure / 기타 자체 TTS 제공업체의 MP3 스트림으로 교체할 수 있습니다. 개인정보·요금·실패 시 재시도·상용 이용권을 먼저 확인하세요.

## 긴 문서와 음성 제공업체

- `MAX_TEXT=250000` 기본 정책으로, 글은 최대 2,400자 단위로 문장/줄바꿈 경계에서 순서대로 나누어 생성합니다. 원본 텍스트는 여백 브라우저의 별도 원본 저장 영역에서 유지됩니다.
- 상태 API는 `chunks_total`, `chunks_done`, `segments_ready`를 반환하므로 대기열 진행 상황을 표시할 수 있습니다.
- 대형 문서의 음성화는 제공업체에 의해 속도 제한·요금·최대 길이·실패가 발생할 수 있습니다. 무료 Render는 실행 중 재시작될 수 있어 **영구 생성·재생의 안정성을 보장하지 않습니다**.
- 기본 `TTS_PROVIDER=edge`는 공식 공급 API가 아닌 실험적 경로입니다.

### 정식 Azure Speech를 사용하도록 전환 (선택)

정식 REST Text-to-Speech API를 통해 음성을 만들고 싶다면 호스팅 서버의 **비밀 환경변수**로만 설정합니다.

```sh
TTS_PROVIDER=azure
AZURE_SPEECH_KEY=<Azure Speech 리소스 키>
AZURE_SPEECH_REGION=koreacentral
```

- 여백 웹앱의 HTML/JavaScript, GitHub 커밋, `render.yaml`에 구독키를 절대로 입력하지 마세요.
- 서버는 SSML로 음성을 요청하며 24kHz mono MP3 스트림을 받아 FFmpeg에 전달합니다.
- Azure 계정/요금제에 따라 합성 요금이 발생할 수 있으므로, 구독 자격·가격·쿼터를 사전에 확인하고 명시적으로 선택할 때만 사용해야 합니다. 이 저장소 기본값에서는 Azure API가 실행되지 않습니다.
- 다른 TTS 사업자를 추가할 경우 `stream_tts_mp3`에 공급업체 어댑터를 추가하고, 콘텐츠 전송에 대한 사용자의 사전 동의와 가격 한도를 구현해야 합니다.

공식 참고: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech
