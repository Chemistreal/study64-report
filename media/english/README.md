# 영어 미디어 자산 라이브러리

`english.html`과 이후 영어 학습 도구가 공통으로 쓰는 VOA Learning English Level 1 자료 묶음이다. 레슨 ID는 `lle1-01`부터 `lle1-52`까지 고정한다.

## 저장된 자료

| 경로 | 수량 | 용도 |
|---|---:|---|
| `audio/*.mp3` | 52 | 대화 음원 직접 재생·다운로드 |
| `images/*.webp` | 52 | 레슨 카드·검색 결과·OG/썸네일 |
| `transcripts/*.md` | 52 | 사람이 읽는 대화 대본, 검색·청크 분석 입력 |
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

## 동기화와 검사

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

20MB를 넘는 비정상적으로 큰 PDF는 Ghostscript가 설치된 환경에서 `/ebook` 품질로 웹 최적화한다. 텍스트와 페이지 수를 유지하며 원본 다운로드 주소는 `lessons/*.json`과 `manifest.json`에 남는다.

## 영상 저장 정책

전체 영상 파일은 저장소에 복제하지 않는다. 한 레슨의 240p 영상도 약 10MB이고, 주 영상 52개와 발음·말하기 보조 영상을 모두 넣으면 GitHub Pages의 1GB 게시 한도에 가까워지거나 넘는다. 대신 공식 영상 URL과 해상도별 URL을 `catalog.json`과 `lessons/*.json`에 보존한다. 영상 자체 보관이 필요해지면 GitHub Pages가 아닌 별도 객체 저장소/CDN을 사용한다.

## 출처

VOA Learning English가 자체 제작한 텍스트, MP3, 사진, 영상은 퍼블릭 도메인이며 교육·상업 목적으로 재사용할 수 있다. 출처는 `learningenglish.voanews.com`으로 표시한다. AP·Reuters·AFP 등 외부 통신사 표기가 붙은 자료는 이 묶음에 넣지 않는다. 자세한 출처와 조건은 `NOTICE.md` 및 각 파일의 `manifest.json` 항목을 따른다.
