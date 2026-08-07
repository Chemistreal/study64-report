# English media rights ledger

확인일: 2026-08-07

이 문서는 법률 자문이 아니라 저장소에 무엇을 파일로 둘지 정하는 운영 기록이다. 무료 열람과 재배포 허용은 서로 다른 것으로 취급한다.

## VOA Learning English

- 상태: 저장·재배포 가능
- 범위: VOA가 직접 제작한 Learning English 텍스트, MP3, 사진, 영상
- 조건: `learningenglish.voanews.com` 출처 표기
- 공식 근거: https://learningenglish.voanews.com/p/6861.html
- 제외: AP, Reuters, AFP 등 뉴스 통신사와 제3자 저작물이 섞인 항목
- 구현: VOA Level 1·2의 강좌 페이지에서 직접 확인되는 원본 주소만 수집한다. YouTube 사본은 받지 않는다.

VOA 공식 안내는 Learning English의 텍스트, MP3, 사진, 영상이 퍼블릭 도메인이며 교육·상업 목적으로 재사용할 수 있다고 밝힌다. 동시에 통신사 자료는 재배포할 수 없다고 구분한다. 그래서 자동 수집기는 강좌 전용 페이지와 미리 지정한 교재 PDF만 대상으로 삼는다.

## Santa Barbara Corpus of Spoken American English

- 상태: 원본 그대로 재배포 가능, 파생본 배포 금지
- 라이선스: CC BY-ND 3.0 US
- 공식 목록·권리 표기: https://www.linguistics.ucsb.edu/research/santa-barbara-corpus-spoken-american-english
- 라이선스 전문: https://creativecommons.org/licenses/by-nd/3.0/us/
- 구현: TRN·CHAT 파일은 원본 그대로 ZIP에 넣는다. WAV는 공식 Box 링크만 보존한다.
- 금지: 구간 자르기, 노이즈 제거, 음량 보정, 포맷 변환, 대본 교정본을 원본처럼 재배포하기

페이지에는 자연 대화 60건의 음성, 전사, 타임스탬프가 제공되며, 저작자와 인용 형식도 함께 제시돼 있다. `archive/sbcsae.json`은 60건 모두의 설명과 WAV·TRN·CHAT 원본 주소를 기록한다.

## LibriVox

- 상태: 미국에서 녹음은 퍼블릭 도메인
- 공식 근거: https://librivox.org/pages/public-domain/
- 주의: 국가마다 원작·번역의 보호기간이 다를 수 있다.
- 구현: 현재는 탐색 출처로만 등록한다. 개별 작품을 한국에서 배포하기 전 원작자·번역자 사망연도와 판본을 다시 확인한다.

## YouTube

- 상태: 공식 임베드만 사용
- 공식 약관: https://www.youtube.com/static?template=terms
- 구현: `youtubeEmbeds`에는 영상 ID와 `youtube.com/embed/...`만 둔다.
- 금지: 자동 스크래핑, `yt-dlp`류 다운로드, 오디오 추출, 저장소·릴리스 재업로드

YouTube 약관은 서비스가 제공하는 방식이나 별도 허가가 없는 다운로드·복제·배포와 자동 접근을 제한한다. 영상 저작권자가 별도 재사용을 허락했더라도 YouTube 서비스에서 자동으로 긁어오는 문제는 따로 남는다. 그래서 VOA처럼 다른 공식 원본 다운로드 주소가 있는 자료는 그 원본을 사용한다.

## 파일별 표기

각 JSON 항목의 `license` 값은 `archive/registry.json`의 `licenses` 키를 참조한다. 릴리스 ZIP에는 `ATTRIBUTION.txt`가 들어가며, `SHA256SUMS`로 ZIP 무결성을 확인한다.
