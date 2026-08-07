# 영어 미디어 자산 라이브러리

`english.html`과 이후 영어 학습 도구가 공통으로 쓰는 영어 자료 묶음이다. 기존 VOA Learning English Level 1 레슨 ID는 `lle1-01`부터 `lle1-52`까지 고정한다. `archive/`는 Level 2와 자연 발화 자료까지 확장하는 코드용 카탈로그와 GitHub Release 빌드 정의를 제공한다.

## 저장된 Level 1 자료

| 경로 | 수량 | 용도 |
|---|---:|---|
| `audio/*.mp3` | 52 | 대화 음원 직접 재생·다운로드 |
| `images/*.webp` | 52 | 레슨 카드·검색 결과·OG/썸네일 |
| `transcripts/*.md` | 52 | C-real 반입 규격 대화 대본, 검색·청크 분석 입력 |
| `worksheets/*.pdf` | 52 | VOA 공식 레슨 플랜·학습 자료 |
| `lessons/*.json` | 52 | 코드용 정규화 데이터와 모든 원본 URL |
| `catalog.json` | 1 | 앱·빌드 도구용 전체 카탈로그 |
| `catalog.js` | 1 | 빌드 없는 정적 HTML에서 쓰는 카탈로그 |
| `manifest.json` | 1 | 파일 크기·SHA-256·출처·라이선스 감사 목록 |

`catalog.json`의 각 레슨에는 기존 `audio`, `originalAudio`, `video`, `page`와 함께 아래 로컬 경로가 들어 있다.

- `image`: 대표 이미지
- `transcript`: Markdown 대본
- `worksheet`: 수업 PDF
- `lessonData`: 세부 JSON

`lessons/*.json`에는 대화문뿐 아니라 페이지의 섹션, 보조 음원·영상, 해상도별 영상 URL, YouTube ID, 원본 이미지 URL이 보존된다. 새 기능은 원본 페이지를 다시 크롤링하기 전에 이 데이터를 먼저 사용한다.

각 대본에는 신뢰도, 실제 녹음 여부, 음성 파일, 화자 수, 속도, 길이, 트랙, 분기, 제작자, 인공물 여부가 기록된다. `python3 eng2p/scripts/check.py media/english/transcripts`로 외부 음성 반입 규격을 전수 검사할 수 있다.

`intakeWarnings`는 해당 분기의 화자 수 조건을 넘는 레슨을 표시한다. 현재 17개가 다화자 경고 대상이다. 파일이나 대본의 오류가 아니라 2인 세션에 그대로 넣기에는 화자가 많다는 뜻이므로, 이후 자동 편성에서는 경고가 없는 자료를 우선하거나 1~2인 구간을 별도로 고른다.

## 확장 아카이브

| 묶음 | 항목 | Release 저장 대상 | 카탈로그 |
|---|---:|---:|---:|
| VOA Level 1 | 52개 레슨 | 분기별 전체·말하기·발음 영상, 대화 MP3 | 전체 영상 52, 말하기 52, 발음 52, 대본 52 |
| VOA Level 2 | 30개 레슨 | 분기별 전체 영상과 대화 MP3 | 전체 영상 30, 대화 MP3 29, 영상 음성 대체 1, 대본 30 |
| Santa Barbara Corpus | 자연 발화 60건 | 변경하지 않은 원본 TRN·CHAT | WAV 원본 링크 60, TRN 60, CHAT 60 |
| VOA 교재 | 4개 PDF | 통합 ZIP | Level 1 사용법·수업안, Level 2 통합 교재, Word Book |

확장 카탈로그는 총 142개 학습 항목을 다룬다. VOA 쪽에는 82개 전체 영상, 81개 독립 대화 음성, 82개 대본, Level 1 말하기·발음 영상 104개가 기록돼 있다. 기존 MP3 52개에는 바이트 수와 SHA-256이 붙어 있다.

코드는 `archive/registry.json`에서 시작해 각 묶음의 `catalog` 값을 따라가면 된다.

- `archive/voa-lle1-full.json`: Level 1 전체 미디어·대본·로컬 해시
- `archive/voa-lle2-full.json`: Level 2 전체 미디어·대본
- `archive/sbcsae.json`: 자연 대화 60건의 설명·원본 음성·두 종류 대본 링크

## 동기화와 검사

기존 Level 1 로컬 자산을 동기화하려면 다음 명령을 쓴다.

```bash
python3 -m pip install -r scripts/requirements-english-media.txt
python3 scripts/sync_english_media.py
python3 scripts/sync_english_media.py --verify-only
```

일부 레슨만 다시 받으려면 다음처럼 실행한다.

```bash
python3 scripts/sync_english_media.py --lessons lle1-03 lle1-12
```

이미지와 PDF까지 원본에서 다시 받으려면 `--refresh`를 붙인다. 동기화가 끝나면 `catalog.json`, `catalog.js`, `manifest.json`을 함께 재생성하고 52개 레슨의 필수 파일을 검사한다.

확장 카탈로그와 Release 묶음을 갱신하려면 다음 명령을 쓴다.

```bash
python -m pip install -r media/english/tools/requirements.txt
python media/english/tools/collect_media.py catalog
python media/english/tools/validate_media.py
python media/english/tools/collect_media.py archive --destination dist/english-media --dry-run
```

## 저장·권리 규칙

1. VOA 자료는 VOA가 직접 제작한 항목만 저장한다. AP·Reuters·AFP 등 제3자 자료는 제외한다.
2. YouTube 자료는 영상 ID와 공식 임베드 주소만 기록한다. 자동 스크래핑·다운로드·재배포는 하지 않는다.
3. 같은 VOA 영상이 YouTube에도 있어도 아카이브는 VOA 공식 원본 주소에서 만든다.
4. Santa Barbara Corpus는 CC BY-ND이므로 TRN·CHAT 원본을 바꾸지 않고 묶기만 한다. 음성 자르기·노멀라이즈·포맷 변환본은 배포하지 않는다.
5. LibriVox는 미국 기준 퍼블릭 도메인이지만 한국에서 출판·배포할 때는 원작과 번역의 국내 보호기간을 따로 확인한다.

자세한 출처와 조건은 `NOTICE.md`, `RIGHTS.md`, 각 `manifest.json` 항목을 따른다.

## 대용량 영상 저장 정책

전체 MP4는 저장소 본문이나 GitHub Pages 배포물에 넣지 않는다. `.github/workflows/archive-english-media.yml`이 공식 원본에서 분기별 ZIP을 만들어 GitHub Release `english-media-v1`에 저장한다. 덕분에 다음 코딩에서 고정된 Release URL을 쓰면서도 저장소 clone과 Pages 배포 크기는 키우지 않는다.
