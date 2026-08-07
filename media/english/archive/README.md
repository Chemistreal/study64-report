# Archive catalogs

이 폴더는 대용량 파일 자체가 아니라 정확한 원본 위치, 대본, 라이선스, 저장 상태, 릴리스 위치를 담는 얇은 데이터 계층이다.

| 파일 | 용도 |
|---|---|
| `registry.json` | 컬렉션·권리·릴리스의 최상위 인덱스 |
| `voa-lle1-full.json` | 52개 레슨의 전체 영상·말하기·발음·음성·대본·저장 MP3 해시 |
| `voa-lle2-full.json` | 30개 레슨의 전체 영상·음성·대본 |
| `sbcsae.json` | 자연 대화 60건의 설명·WAV·TRN·CHAT 원본 주소 |

`generatedAt`은 공식 페이지를 다시 읽은 시각이다. 수집기는 제목만 검색해서 추측하지 않고 각 레슨 페이지의 실제 `<video>`, `<audio>`, 대화문을 읽는다.

## Release layout

GitHub Release `english-media-v1`은 다음 파일을 만든다.

- `voa-lle1-q1.zip` ~ `voa-lle1-q4.zip`
- `voa-lle2-q1.zip` ~ `voa-lle2-q3.zip`
- `sbcsae-transcripts.zip`
- `voa-course-guides.zip`
- `registry.json`
- `SHA256SUMS`

VOA ZIP에는 선택한 공식 최저 해상도 영상, 대화 MP3가 있는 경우 그 MP3, 대본, 출처 표기가 들어간다. Santa Barbara ZIP은 원본 TRN·CHAT만 묶는다.
