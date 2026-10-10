#!/usr/bin/env python3
"""파생과 검사를 정해진 순서로 다 돈다. 세션 종료 절차다.

걸음이 백서른 개를 넘었다 (정확한 수는 맨 끝 줄이 찍는다). 순서도 있다.
그것을 기억으로 돌리면 언젠가 하나를 뺀다.
**뺀 검사는 안 돌린 것이 아니라 통과한 것처럼 보인다.** 그래서 한 자리에 모은다.

순서에는 이유가 있다.

1. 파생을 먼저 한다. 원본이 바뀌었으면 파생물이 옛 값이다. 옛 값을 검사해 봐야 소용없다
2. 파생물 어긋남을 본다. 1에서 뭔가 바뀌었으면 커밋 전에 알아야 한다
3. 규격 검사를 돈다. 파일 하나씩 보는 것들이다
4. 대조 검사를 돈다. 파일끼리 견주는 것들이다
5. 상태 파일을 갱신한다. 검사가 다 끝난 뒤의 값이어야 맞다

사용법:
    python3 scripts/all.py                 # 다 돈다 (병렬. 작업자 수는 --jobs. 아래 "병렬" 참고)
    python3 scripts/all.py --serial        # 한 걸음씩 차례대로. 예전 방식 그대로
    python3 scripts/all.py --jobs N        # 작업자 N 개 (기본 min(6, 코어 수). 1 이면 --serial)
    python3 scripts/all.py --quick         # 파생과 대조만. 손볼 때 쓴다. 늘 차례대로 돈다
    python3 scripts/all.py --allow-skip    # 건너뛴 검사를 실패로 안 센다 (도구가 없는 기계에서만)
    python3 scripts/all.py --plan          # 선 계획만 찍고 끝낸다 (돌리지 않는다)
    python3 scripts/all.py --only A,B      # 이름이 A 나 B 인 걸음만 (고치는 중에 한두 개 볼 때. 요약에 "일부만" 이 붙는다)
    python3 scripts/all.py --times FILE    # 걸음마다 걸린 시간을 JSON 으로 남긴다

## 건너뛴 검사는 실패다

브라우저나 PDF 도구가 없으면 검사는 스스로 `[건너뜀]` 을 찍고 나간다. 전에는 이것이 종료 코드 0 이라
브라우저 검사 마흔여섯이 다 건너뛰어도 all.py 가 초록불이었다. 이제는 **건너뜀이 하나라도 있으면
종료 코드 1** 이다. 일부러 건너뛰려면 `--allow-skip` 이다 (그때만 0, 건너뜀 수는 요약에 남는다).

- 건너뜀의 표지는 둘이다. 종료 코드 77 (scripts/lib/browser_harness.js 의 `skip()`) 과
  출력의 `[건너뜀]` 같은 글. 종료 코드 0 인데 글만 있는 옛 검사도 잡으려고 둘 다 본다
- 자식에게 `REQUIRE_BROWSER=1` `REQUIRE_PDF=1` 을 건넨다. 뿌리 `tests/` 와 `tools/` 의 검사가
  건너뛰지 않고 스스로 빨간불을 낸다. `--allow-skip` 이면 이 둘을 지우고 `ENG2P_ALLOW_SKIP=1` 을 켠다
- `--quick` 은 브라우저를 안 띄우는 걸음 예순하나만 돈다. 그래서 브라우저 건너뜀이 안 난다.
  그 안에서 난 건너뜀 (저장소 밖 원본이 없는 ext 파생 하나) 은 똑같이 실패다
- 걸음이 시간 초과 (기본 900초) 로 죽어도 실패다

## 병렬

걸음 백서른한 개 중 브라우저를 띄우는 마흔여섯이 시간의 91% 를 먹고 CPU 는 놀고 있다.
그래서 화면 검사를 나란히 돌린다. **차례가 뜻을 가지는 사슬은 한 선에 그대로 둔다.**

- **파생 선**: 파생 마흔일곱 + 어긋남 하나. 적힌 차례대로 하나씩. 제일 먼저. 이게 끝나야 나머지가 시작한다
- **게임 선**: derive_game.js → check_game.py → derive_scenes.py → derive_judge/replies/voicelist/deck_names → derive_acts
  → derive_game_optional → derive_transcripts_ko → check_gamedata → derive_town → check_culture → derive_game_manifest --strict
  → check_game --manifest → check_acts → check_transcripts_ko.
  차례대로 하나씩. 서로 out/game 을 쓰고 읽는다
- **점검 선**: 규격과 대조 파이썬 검사. 차례대로 하나씩 (check_ext 가 out/data 에 임시 파일을 만든다)
- **화면 선**: 브라우저 검사마다 선 하나. 서로 읽기만 한다. check_ui.js 는 셋으로 쪼개 돈다
- **리허설 선**: rehearse*.js 는 out/manual 에 글을 쓴다. 점검 선 (check.py 가 그 글을 읽는다) 이 끝난 뒤에 돈다
- **상태 선**: 마지막. 다른 선이 다 끝난 뒤 차례대로 (파일 수를 센다)

선 사이에는 "다 끝난 뒤에" 만 있다. 차례 실행에서 앞서 있던 걸음만 기다리게 한다 (`--plan` 이 검사한다).
출력은 작업자 수와 상관없이 **걸음의 원래 차례**로 찍는다. 진행 줄만 끝나는 차례로 stderr 에 나간다.
자세한 것은 docs/pipeline.md.

하나라도 실패하면 종료 코드 1이다. 통과한 것도 다 보여 준다.
규격: CLAUDE.md 세션 종료 절차, docs/pipeline.md
"""
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile
import time

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import par_run  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
S = ROOT / "scripts"

# (묶음, 스크립트, 인자, 빠른 판에도 도는가)
STEPS = [
    # **앱도 파생물이다.** app/ 조각을 합쳐 english.html 을 만든다.
    # 제일 먼저 돈다. 뒤의 검사가 다 그 파일을 본다.
    ("파생", "derive_app.py", [], True),
    ("파생", "derive_handout.py", [], True),
    ("파생", "derive_index.py", [], True),
    ("파생", "derive_bundle.py", [], True),
    # **종이가 필요하다고 적어 두고 그 종이를 안 만들었다.** 기기가 없는 날에
    # 두 사람 앞에 있는 것은 강의록 한 장뿐이었다. T399
    ("파생", "derive_play_paper.py", [], True),
    ("파생", "derive_data.py", [], True),
    ("파생", "derive_transcripts.py", [], True),
    ("파생", "derive_audiolen.py", [], True),
    ("파생", "derive_cues.py", [], True),
    ("파생", "ground.py", ["--quiet"], True),
    ("파생", "derive_ground_data.py", [], True),
    # 강의 본문 96편. **앱에 없던 것이다.** 30만자라 처음부터 안 읽고 누를 때 읽는다.
    ("파생", "derive_lecture_text.py", [], True),
    # **맨 뒤다.** 앞의 파생물을 다 세어 표를 만든다. 순서가 틀리면 스스로 실패한다.
    # **조준표만 파생이 없었다.** 강의도 세트도 카드도 다 있는데 이것만.
    # 블록 1이 40분인데 화면이 종이를 가리키기만 했다. T209
    ("파생", "derive_input.py", [], True),
    # 거울 판의 최소대립쌍. **대본에 있는 낱말끼리만 짝짓는다.** T258
    ("파생", "derive_pairs.py", [], True),
    # 한 줄 바꾸기 판의 바꿀 낱말. **대본 낱말끼리만 바꾼다.** T261
    ("파생", "derive_swaps.py", [], True),
    # 내 소리는 네가 판의 듣는 쪽 지시. **알맹이는 블록 2 근거표에서 온다.** T264
    ("파생", "derive_listen.py", [], True),
    # 전달 놀이가 쓸 줄. **소리 자리는 어림이다.** 되감기를 화면이 준다. T267
    ("파생", "derive_relay.py", [], True),
    # 이어달리기 판이 쓸 청크. **대본에서 세었다.** 청크 목록은 B등급이다. T270
    ("파생", "derive_chunks.py", [], True),
    # 둘이 한 문장이 쓸 앞뒤 토막. **붙이면 원문이다.** 지어낸 영어가 없다. T273
    ("파생", "derive_halves.py", [], True),
    # 배속 사다리 규격. **문서가 원본이다.** 못 찾으면 실패로 낸다. T279
    ("파생", "derive_ladder.py", [], True),
    # 3초 벽이 띄울 단서. **124장 중 서른은 띄울 것이 없었다.** T282
    ("파생", "derive_wall.py", [], True),
    # 한 사람만 본다가 쓸 상황 카드. **B면을 안 담는다.** 안 실으면 안 샌다. T288
    ("파생", "derive_situ.py", [], True),
    # 파장의 격식 눈금. **늘리는 것이지 짓는 것이 아니다.** 사이 칸은 이웃을 붙인다. T291
    ("파생", "derive_wave.py", [], True),
    # 누구 말이야가 쓸 자리. **register 를 안 담는다.** 이 판에는 정답이 없다. T294
    ("파생", "derive_whose.py", [], True),
    # 되묻기 강도 세 단. **보기는 대본 그대로다.** 없는 단은 없다고 적는다. T297
    ("파생", "derive_reask.py", [], True),
    # 끼어들기 신호 시각. **무작위를 안 쓴다.** 두 기기가 같은 벌을 본다. T300
    ("파생", "derive_cutin.py", [], True),
    # 말 겹치기가 쓸 두 줄. **한 회가 두 줄이다.** 합창이 아니라 겹침이다. T303
    ("파생", "derive_clash.py", [], True),
    # 거꾸로 판정이 쓸 카드. **정답과 해설을 안 담는다.** 담으면 이 판이 안 선다. T306
    ("파생", "derive_flip.py", [], True),
    # 따로 쓰고 같이 펴기가 쓸 물음. **강의에 물음이 없어서 소재만 뽑는다.** T309
    ("파생", "derive_apart.py", [], True),
    # 오늘의 한 판이 그날 열 판. **그날 열리는 판 중에서만 고른다.** 무작위 없음. T315
    # **판 파생기 맨 뒤다.** 앞의 자료를 다 세어 그날 열리는 판을 가린다
    ("파생", "derive_onepick.py", [], True),
    # 스무 판이 블록 넷 중 어디에 붙는가. **블록 1은 비어 있고 그것이 맞다.** T318
    ("파생", "derive_blocks.py", [], True),
    # 판마다 셈을 합치는 법. **규칙서와 화면이 같은 말을 하는지 대 본다.** T320
    ("파생", "derive_tally.py", [], True),
    # 주마다의 공동 퀘스트. **docs/quest.md 5장 표가 원본이다.** T325
    ("파생", "derive_quest.py", [], True),
    # 공동 배지. **새 이름을 안 짓는다.** PASS 에서 그대로 옮긴다. T329
    ("파생", "derive_badge.py", [], True),
    # 되돌아보기 녹음이 읽을 줄. **대본 그대로다.** 앱이 소리를 안 든다. T333
    ("파생", "derive_voice.py", [], True),
    ("파생", "derive_ahead.py", [], True),
    ("파생", "derive_track.py", [], True),
    ("파생", "derive_hold.py", [], True),
    ("파생", "derive_more.py", [], True),
    # **확장층** (docs/expansion.md). 라디오, 잡담, 안내문, 읽을거리, 48주 달력. 하루 120분을 밀어내지 않는다
    ("파생", "derive_ext_radio.py", [], True),
    ("파생", "derive_ext_smalltalk.py", [], False),
    ("파생", "derive_ext_notices.py", [], True),
    ("파생", "derive_ext_readers.py", [], True),
    ("파생", "derive_ext_calendar.py", [], True),
    ("파생", "derive_manifest.py", [], True),
    # 미디어 표. 받은 미디어가 온전한지 보는 자리다. T152 에 대 보니 264 중 56이 틀렸다.
    ("파생", "derive_media_manifest.py", [], True),
    ("어긋남", "check_derived.py", [], True),
    # **전수다.** 저장소의 마크다운 442편을 다 본다. T151 에 넓히고 T152 에 미디어까지 넣었다.
    # T149 에는 내 문서 여섯만 골라 넣었다. 고른다는 것은 안 고른 것이 있다는 뜻이다.
    # 실제로 본과 지침과 프롬프트 열여섯 편이 그때까지 한 번도 안 걸렸다.
    # docs/spec.md 한 편만 빠진다. 사용자 파일이라 내가 못 고친다.
    # 빼는 것이 아니라 check_spec.py 가 따로 맡는다. 바로 아랫줄이다.
    ("규격", "check.py", ["out/", "docs/", "state/", "templates/", "tasks/",
                          "CLAUDE.md", "README.md", "../media/english/"], False),
    ("규격", "check_spec.py", [], False),
    # **앱의 글도 본다.** T152 까지 english.html 은 규격 검사 밖이었다.
    # check_ui.js 는 동작을 보지 글자를 안 본다. 둘은 다른 검사다.
    ("규격", "check_app.py", [], False),
    ("규격", "check_blocks.py", [], False),
    ("규격", "check_page.py", [], False),
    ("규격", "check_media.py", [], False),
    # **소리를 다루는 자리를 다 세었는가.** 판정 안 한다는 말을 턴마다 그 자리에
    # 적었는데 적은 자리를 센 적이 없었다. 하나 더 늘면 아무도 안 본다. T375
    ("규격", "check_sound.py", [], False),
    ("규격", "check_cards_plan.py", ["q4"], False),
    ("대조", "check_audio.py", [], True),
    ("대조", "check_ground.py", [], True),
    # 판 자료의 영어에 근거가 있나. **G구간 게이트를 판에도 건다.** T319
    ("대조", "check_play_ground.py", [], True),
    # **등급은 파일에 붙는데 재료는 줄에 있다.** 그 사이가 비어 있었다.
    # A등급 파일 백열 편이 B등급 재료 144자리를 담고 있고 그중 서른둘은
    # 어디로도 안 닿는다. 강의록 97편은 원본 표기가 있어 등급을 따라갈 수 있는데
    # 비상판과 세트는 같은 일을 하면서 그 줄만 비어 있다. T420~T424
    ("대조", "check_grade.py", [], True),
    ("대조", "check_play_score.py", [], True),
    ("대조", "check_person.py", [], True),
    ("대조", "check_layers.py", [], True),
    ("대조", "check_ground_cite.py", [], True),
    ("대조", "check_refs.py", [], True),
    ("대조", "check_data.py", [], True),
    # 확장층 열일곱 판. 판마다 일부러 깬 것을 잡는지도 본다 (--break)
    ("대조", "check_ext.py", ["--break"], True),
    # **권리 검사** (docs/rights_audit.md). 저장소에는 퍼블릭 도메인, CC0, CC BY 만 두고 예외는 Santa Barbara 말뭉치 하나다 (사용자 결정 2026-10-09).
    # 판마다 일부러 깬 것을 잡는지도 본다 (--break)
    ("대조", "check_rights.py", ["--break"], True),
    # **옛 A/B 역할 말씨가 강의, 강의 밖의 글, 카드 600장에 남아 있지 않다** (기준서 8.2, 개정문 22 23).
    # 규칙이 바뀌어도 글이 옛 말을 하면 두 사람은 옛 규칙으로 논다. 말씨를 든 검사라 --break 로 한계도 본다
    ("대조", "check_lecture_info_gap.py", ["--break"], True),
    ("대조", "check_role_wording.py", ["--break"], True),
    ("대조", "check_card_info_gap.py", ["--break"], True),
    # 매뉴얼이 앱의 값을 말한다. **설명하는 글은 설명 대상보다 늦게 낡는다.**
    ("대조", "check_manual.py", [], True),
    # 회전 대장은 손으로 쓰는 파일이다. 손으로 올리는 숫자는 언젠가 안 올라간다.
    ("대조", "check_rotation.py", [], True),
    # **판정은 사람이 하고 규칙은 기계가 본다.** 규칙서와 로드맵 12.9 가 같은 말을 하는지,
    # 못 했을 때 칸에 벌이 있는지, 기록할 값에 사람이 남는지를 스무 판 전수로 본다.
    ("대조", "check_play.py", [], True),
    ("대조", "check_play_paper.py", [], True),
    ("화면", "check_ui.js", [], False),
    # **마찰은 고쳐 놓으면 다시 나빠진다.** 화면에 뭘 더할 때마다 한 번씩 는다.
    # 그리고 나빠지는 것이 안 보인다. 누름이 하나 늘어도 화면은 멀쩡해 보인다.
    # 기준선은 docs/friction.md 7장에 있고 이 검사가 거기서 읽는다.
    ("화면", "check_friction.js", [], False),
    # 저장소 뿌리의 화면 검수. **CI 와 같은 자다.** PR #9 가 심었다.
    # english.html 은 파생물이라 파생이 그 고침을 지울 수 있다.
    # 지우면 여기서는 조용하고 밀고 나서 CI 가 빨간불이 된다. T260
    ("화면", "check_pages.py", [], False),
    # **색이 한 벌이 되고 나서야 할 수 있게 된 검사다.** 두 벌이면 두 번 재야 하고
    # 두 번 재는 것은 결국 안 재게 된다. 다크모드를 없앤 이유 셋째가 이것이었다.
    ("화면", "check_contrast.js", [], False),
    # **T389 가 활자 단을 세고 남겨 뒀더니 스물아홉이 서른넷이 됐다.**
    # 세어 두기만 하면 는다. 그중 스물둘이 0.5px 간격이라 가르는 눈이 없었다.
    # 이 판은 세는 것이 아니라 막는다. 단 밖의 값이 하나라도 있으면 실패다. T404
    ("화면", "check_type.js", [], False),
    # **같은 것을 여백에 한다.** 서른한 가지였고 8 9 10 11 12 가 다섯 단이다.
    # 여백에서 1px 은 나란히 놓지 않으면 안 보인다. 열둘로 접었다. T405
    ("화면", "check_space.js", [], False),
    # **둥근 모서리도 같은 자리다.** 열다섯 가지였고 99px 과 999px 이 같은 뜻이었다.
    # 알약은 사다리의 칸이 아니라 사다리 밖이라 이름을 달리 준다. T406
    ("화면", "check_radius.js", [], False),
    # **색은 크기와 다르다.** 값이 같아도 같은 색이 아니다.
    # `--warn` 은 짙은 판에서 밝아지고 `--warnbg1` 은 안 밝아진다.
    # 그래서 이 판에는 "같은 값 두 이름" 검사를 안 넣었다. T407
    ("화면", "check_color.js", [], False),
    # **적는 칸이 그 기계에 이어져 있는가.** 예순아홉 곳인데 넷만 값을 넣어 봤다.
    # 안 이어진 칸은 소리를 안 낸다. 화면은 멀쩡하고 적은 것만 없다. T408
    ("화면", "check_write.js", [], False),
    # **만들어 놓고 아무도 못 보는 자료는 없는 것과 같다.** 자료 6659개 중
    # 2633개가 1년 내내 한 번도 안 떴다. 끼어들기는 대본 앞 여섯 줄만 쓰고
    # 있었고 그것은 뽑는 것이 아니라 자르는 것이다. T413~T415
    ("화면", "check_unused.js", [], False),
    # **게임이 모든 공부를 대체한다** (2026-10-07). 게임은 그날 할 일을 스스로 안 정하고
    # 앱의 셈이 뽑은 288세션을 받는다. 앱을 띄워야 뽑히므로 화면 묶음에서 돈다.
    # 그리고 바로 센다. 게임 세션에 안 들어간 자료는 1년 동안 한 번도 못 보는 자료다.
    ("화면", "derive_game.js", [], False),
    ("화면", "check_game.py", [], False),
    # **장면의 대사는 들은 녹음의 줄 그대로다** (docs/scenes.md). 지은 영어, 아직 안 들은 과,
    # 그 자리에 없는 사람이 하나라도 있으면 장면을 안 낸다. 세션 JSON 다음에 돈다
    ("화면", "derive_scenes.py", [], False),
    # **게임이 쥐는 자료** (docs/game_data.md). 판정 열쇠, 역할 카드의 NPC 대답, NPC 목소리 줄 목록,
    # 덱의 라디오 인물 이름. 대답은 목소리 줄 목록보다 앞이다 (목소리 줄 목록이 대답을 읽는다)
    ("화면", "derive_judge.py", [], False),
    ("화면", "derive_replies.py", [], False),
    ("화면", "derive_voicelist.py", [], False),
    ("화면", "derive_deck_names.py", [], False),
    # **세션 번호 기준 구간표** (docs/game_data.md 11장). 막이 아니라 세션 단위다. 구간은 계획 숫자와 기준선 표에서 파생하고
    # 손으로 경계를 안 쓴다. 공개 한계(release.throughSession)와 듣기 뒤 자막 정책도 여기서 낸다
    ("화면", "derive_acts.py", [], False),
    # **게임이 있으면 읽는 선택 자료 여덟** (docs/game_data.md 10장). 앱 파일은 게임 로더가 그대로 못 읽어서 읽는 꼴로 다시 낸다.
    # 매니페스트(derive_game_manifest --strict)가 이 여덟을 적으므로 그 앞이다
    ("화면", "derive_game_optional.py", [], False),
    # **입문 세션 대본의 한국어 풀이** (docs/game_data.md 12장, 기준서 13.1 예외 = 개정문 29번). 원본은 docs/transcripts_ko.md,
    # 영어 칸이 transcripts.json 과 어긋나면 안 낸다. 매니페스트(derive_game_manifest --strict)가 적으므로 그 앞이고,
    # 영어 대본(derive_game_optional)이 먼저 나와야 해서 바로 뒤다
    ("화면", "derive_transcripts_ko.py", [], False),
    ("대조", "check_gameopt.py", ["--break"], False),
    ("대조", "check_gamedata.py", ["--break"], False),
    # **동네는 문서가 원본이다** (docs/town.md). 장소 열넷이 무대 표와 같고 사람이 인물 표에
    # 있고 건물이 안 겹치고 실제 상표가 없어야 JSON 을 낸다. 언리얼이 이것을 읽어 동네를 짓는다
    ("규격", "derive_town.py", [], False),
    # **문화 지침** (docs/culture.md). 표를 읽어 금지어, 하와이어 철자, 노래 쓰임을 본다.
    # 장면과 동네 JSON 이 나온 다음에 돈다. 옛 값을 안 보게
    ("규격", "check_culture.py", [], False),
    # **두 노트북이 같은 자료를 쥐는가** (docs/game_results.md 10). out/game 의 파일이 다 나온 다음에
    # 크기와 해시와 dataHash 를 적는다. 하나라도 안 나왔으면 실패다 (--strict)
    ("파생", "derive_game_manifest.py", ["--strict"], False),
    ("화면", "check_game.py", ["--manifest"], False),
    # 구간표가 계획 숫자에서 다시 센 것과 같고 매니페스트가 그 파일의 크기와 해시를 맞게 적었는가. 매니페스트 뒤에 돈다
    ("대조", "check_acts.py", ["--break"], False),
    # 한국어 풀이의 열쇠가 다 대본의 실제 줄이고 빈 줄이 없고 범위가 acts.json 과 같고 매니페스트가 맞는가. 매니페스트 뒤에 돈다
    ("대조", "check_transcripts_ko.py", ["--break"], False),
    # **하루 끝 틱이 PC 에서 돌 파일 묶음의 표** (out/tick/manifest.json, docs/game_results.md 8장)와 49일을 이어 가는 끝에서 끝 시험
    ("화면", "derive_tick_bundle.py", [], False),
    ("화면", "check_tick_e2e.py", ["--break"], False),
    # **잃으면 제일 아픈 것이 기록이다.** 1년치가 브라우저 한 곳에만 있다.
    # 깨진 기록을 조용히 버리는지, 미뤄 둔 저장이 창 닫힐 때 흘러가는지를 본다.
    # 공동 연속일. **날을 세지 사람을 안 센다.** T321
    ("화면", "check_streak.js", [], False),
    # 공동 배지. **새 이름을 안 짓고 잠그지 않는다.** T329
    ("화면", "check_badge.js", [], False),
    # 분기 관계 점검. **따로 적고 같이 편다.** T330~T331
    ("화면", "check_relation.js", [], False),
    ("화면", "check_growth.js", [], False),
    ("화면", "check_ahead.js", [], False),
    ("화면", "check_year.js", [], False),
    ("화면", "check_track.js", [], False),
    ("화면", "check_adapt.js", [], False),
    ("화면", "check_role.js", [], False),
    ("화면", "check_versus.js", [], False),
    ("화면", "check_reach.js", [], False),
    # **늦게 읽는 조각은 파일이 멀쩡해도 화면만 빈다.** 부르는 자리를 안 붙이면
    # 탭이 빈 채로 열리고 그것을 코드를 읽는 검사로는 못 잡는다. T361
    ("화면", "check_late.js", [], False),
    # **조건이 붙은 자리는 안 뜨는 것이 정상처럼 보인다.** 그래서 안 뜨는 것을
    # 아무도 못 알아챈다. 조건을 하나씩 만들어 놓고 그때 뜨는지 본다. T362
    ("화면", "check_split.js", [], False),
    # **파형에서 마디를 뽑는다. 음소는 안 잰다.** 저장소에 음성 파일을 안 넣으므로
    # 마디를 몇 개 만들지 아는 채로 파형을 지어 넣고 그만큼 나오는지 본다. T363
    ("화면", "check_beat.js", [], False),
    # **코드가 아니라 화면 글을 훑는다.** 조건이 붙은 자리는 조건을 만들어야 뜨므로
    # 코드만 읽어서는 그 자리에 말이 있는지 못 잡는다. T376
    ("화면", "check_sound_screen.js", [], False),
    # **안 되는 자리마다 안 된다고 적는 일을 턴마다 따로 했다.** 그런데 그 자리를
    # 세어 본 적이 없다. 자리마다 안 된다 / 왜 / 그럼 무엇을 셋을 잰다. T385
    ("화면", "check_cando.js", [], False),
    # **원칙을 주석에 적고 글은 안 고쳤다.** 다그치지 않는다는 말이 코드 주석에
    # 쌓였는데 바로 밑줄이 "3주 밀렸다" 였다. 화면 글을 통째로 훑는다. T386
    ("화면", "check_tone.js", [], False),
    # **화면이 영영 여는 중에 머물렀다.** 못 읽으면 다시 그리고 다시 그리면
    # 또 읽으러 갔다. 3초에 1432번이다. 자료를 하나씩 막아 놓고 본다. T387~T388
    ("화면", "check_wait.js", [], False),
    ("화면", "check_store.js", [], False),
    # **손가락이 아닌 길로 오는 사람을 아무도 안 재고 있었다.** 키보드와 낭독기다.
    # 화면 열셋이 탭 패널인데 그것을 가리키는 탭이 어디에도 없었다. T392
    ("화면", "check_a11y.js", [], False),
    # **인쇄 규칙 쉰 줄을 아무도 안 재고 있었다.** 화면 검사는 다 screen 으로 그린다.
    # 선택자 목록 가운데에 주석이 끼어 여섯 자리가 한 줄로 흐르고 있었다. T393
    ("화면", "check_print.js", [], False),
    # **검사 스무 개가 다 390px 한 폭에서만 돌았다.** 글자 크기 세 단도 아무도 안 썼다.
    # "더 크게" 를 눌러도 화면 제목만 24px 그대로였다. T394
    ("화면", "check_size.js", [], False),
    # **1년치를 뒤질 길이 없었다.** 찾는 칸이 미디어 탭 안에 하나뿐이었다.
    # 두 사람이 적은 것은 그날 칸에만 그려져서 어제 것도 못 봤다. T395
    ("화면", "check_find.js", [], False),
    # **빈칸이 늘 세션을 시작했다.** 화면을 내리려던 손짓에 두 시간이 시작된다.
    # 그리고 규칙 탭에 적어 둔 목록에 없는 글쇠가 셋이었다. T396
    ("화면", "check_keys.js", [], False),
    # **check_contrast.js 는 글자만 잰다.** 고리와 띠와 시계 링이 나르는 값을
    # 아무도 안 쟀다. 짙은 판에서 시계 링이 2.90 이었다. T398
    ("화면", "check_graphic.js", [], False),
    # **두 시간짜리 세션이 자정을 넘긴다.** 22시에 시작하면 블록 4가 자정 뒤다.
    # 한 세션이 두 날로 갈렸고 어느 날도 마쳤다고 안 적혔다. T400
    ("화면", "check_midnight.js", [], False),
    # **T394 는 화면 크기를 쟀고 이름은 늘 두 글자였다.** 내용의 길이는 안 쟀다.
    # 27자 이름에서 390px 화면이 397px 이 됐다. T401
    ("화면", "check_input.js", [], False),
    # **check_perf 는 첫날 값이고 check_year 는 셈의 옳음이다.** 쌓인 뒤에
    # 무거워지는가는 아무도 안 쟀다. 40주째에 느려지면 그때는 늦다. T402
    ("화면", "check_scale.js", [], False),
    # **셋 다 화면 이야기다. 자료가 어떻게 도는가는 아무도 안 쟀다.**
    # 자루가 넉넉해도 뽑는 법이 나쁘면 어제 낸 것이 오늘 또 나온다.
    # play_data.md 6장이 그것을 자료 부족으로 읽었다. 자료는 있었다. T403
    ("화면", "check_supply.js", [], False),
    # **열자마자 읽는 바이트에 선을 건다.** 시간은 기계마다 달라 선을 못 건다.
    # T185 에 접힌 칸이 안에서 136KB 를 읽고 있던 것이 여기서 나왔다.
    ("화면", "check_perf.js", [], False),
    # **검사가 아니라 리허설이다.** 엿새를 실제로 돌고 화면 글을 그대로 옮겨 적는다.
    # 그 글을 사람이 읽는 것이 이 걸음의 값이다. T153 에 회차 어긋남 여덟이 여기서 나왔다.
    # **블록 넷을 실제로 돌려 본다.** 자리마다 하나씩 보는 것과 다르다.
    # 그날 자료로 안 걸리는 것이 있다. 여덟 주를 골라 서른두 판을 돈다.
    ("화면", "check_session.js", [], False),
    # 두 기기를 나란히 몬다. **조각이 다 맞아도 이어 붙이면 어긋난다.** T252
    ("화면", "check_pair.js", [], False),
    # **한쪽에만 있어야 하는 것이 정말 한쪽에만 있는가.** T260
    # 코드를 읽고 "안 그렸다" 고 말하는 것은 검사가 아니다.
    ("화면", "check_play_screen.js", [], False),
    ("화면", "rehearse.js", [], False),
    # **블록 안에서 시간이 가며 바뀌는 것**은 하루 한 장면으로는 안 보인다.
    # 두 시간을 시계를 밀어 가며 돌고 바뀌는 자리마다 화면 글을 받아 적는다.
    ("화면", "rehearse_session.js", [], False),
    # 두 화면을 나란히 받아 적는다. **값이 맞는 것과 읽히는 것은 다른 일이다.** T254
    ("화면", "rehearse_pair.js", [], False),
    ("상태", "derive_verify_list.py", [], False),
    ("상태", "collect_b.py", [], False),
    ("상태", "update_status.py", [], False),
]

# ---------------------------------------------------------------- 병렬 규칙
#
# STEPS 의 모양은 그대로다 (네 칸). 병렬에 필요한 것은 여기서 따로 적는다.
# 걸음은 선 하나에 속하고 (lane_of), 선은 "다른 선이 다 끝난 뒤에" 만 적는다 (lane_needs).
# 차례 실행과 뜻이 같은지는 par_run.check_plan 이 본다 (--plan, 그리고 병렬로 돌기 전에 늘).

# 게임 사슬. 서로 out/game 을 쓰고 읽는다. STEPS 에 적힌 차례대로 한 선에서 돈다.
# derive_game.js -> check_game.py -> derive_scenes.py -> derive_judge/replies/voicelist/deck_names -> derive_acts
# -> derive_game_optional -> derive_transcripts_ko
# -> check_gamedata -> derive_town -> check_culture -> derive_game_manifest --strict -> check_game --manifest -> check_acts
# -> check_transcripts_ko
# (derive_game_optional 이 out/game/transcripts.json 을 내고 derive_transcripts_ko 가 그것을 읽으므로 같은 선에 둔다)
GAME_CHAIN = ("derive_game.js", "check_game.py", "derive_scenes.py", "derive_judge.py",
              "derive_replies.py", "derive_voicelist.py", "derive_deck_names.py", "derive_acts.py",
              "derive_game_optional.py", "derive_transcripts_ko.py",
              "check_gamedata.py", "derive_town.py", "check_culture.py", "derive_game_manifest.py",
              "check_acts.py", "check_transcripts_ko.py")

# 병렬일 때 쪼개 도는 걸음 -> 부분 수 (`--part k/n` 을 받는다). 차례 실행은 안 쪼갠다
SPLIT = {"check_ui.js": 3}

# 예상 초. 긴 선을 먼저 시작하는 데만 쓴다. 틀려도 결과는 같고 벽시계만 는다 (감사에서 잰 값)
EST = {"check_ui.js#1/3": 130, "check_ui.js#2/3": 30, "check_ui.js#3/3": 90,
       "check_write.js": 130, "check_play_screen.js": 100, "check_pages.py": 95,
       "derive_ext_smalltalk.py": 66, "check_size.js": 60, "check_find.js": 45,
       "check_input.js": 45, "check_tone.js": 45, "check_wait.js": 35, "check_store.js": 30,
       "rehearse.js": 26, "check_session.js": 25, "check_friction.js": 25, "check_contrast.js": 22,
       "check_midnight.js": 20, "check_split.js": 20, "check_pair.js": 19,
       "rehearse_session.js": 19, "check_late.js": 18, "derive_game.js": 19}

SKIP_RC = 77          # scripts/lib/browser_harness.js 의 skip() 이 쓰는 종료 코드
# 종료 코드가 0 이어도 글로 건너뜀을 말하는 옛 검사 (check_pages.py 의 뿌리 검사, 일부 파생기)
SKIP_RE = re.compile(r"\[건너뜀\]|건너뜀[:：]|건너뛰었다\. 통과가 아니다|건너뛴다\. 통과가 아니다"
                     r"|안 돌렸다\. 통과가 아니다")
DEFAULT_TIMEOUT = 900


def lane_of(group, script):
    """걸음이 속한 선. 같은 선은 적힌 차례대로 하나씩 돈다."""
    if script in GAME_CHAIN:
        return "게임"
    if group in ("파생", "어긋남"):
        return "파생"
    if group in ("규격", "대조"):
        return "점검"
    if group == "상태":
        return "상태"
    if script.startswith("rehearse"):
        return "리허설:" + script          # out/manual 에 글을 쓴다. 점검 선 뒤에 돈다
    return "화면:" + script                 # 읽기만 한다. 걸음마다 선 하나


def lane_needs(lanes):
    """선마다 "이 선들이 통째로 끝난 뒤에" 시작한다. 쪼갠 부분의 선 (`화면:check_ui.js#2/3`) 은
    `#` 앞의 이름으로 규칙을 찾는다."""
    have = set(lanes)
    need = {}
    for ln in lanes:
        base = ln.split("#")[0]
        if base == "파생":
            need[ln] = set()
        elif base == "상태":
            need[ln] = have - {ln}
        elif base.startswith("리허설:"):
            need[ln] = {"파생", "점검"} & have
        else:
            need[ln] = {"파생"} & have
    return need


def cmd_of(script, args):
    base = ["node", str(S / script)] if script.endswith(".js") else [sys.executable, str(S / script)]
    return base + list(args)


def build_jobs(split):
    """STEPS 전체를 작업으로. split 이면 SPLIT 의 걸음을 부분으로 나눈다."""
    jobs = []
    for i, (group, script, args, in_quick) in enumerate(STEPS):
        lane = lane_of(group, script)
        n = SPLIT.get(script) if split and not args else None
        if n:
            for k in range(1, n + 1):
                tag = "%d/%d" % (k, n)
                jobs.append(par_run.Job(
                    key="%03d:%s#%s" % (i, script, tag), step=i,
                    cmd=cmd_of(script, ["--part", tag]),
                    lane="%s#%s" % (lane, tag), weight=EST.get("%s#%s" % (script, tag), 5),
                    label="%s#%s" % (script, tag)))
        else:
            jobs.append(par_run.Job(
                key="%03d:%s" % (i, script), step=i, cmd=cmd_of(script, args), lane=lane,
                weight=EST.get(script, 12 if script.endswith(".js") else 1), label=script))
    return jobs


def plan_for(jobs):
    return lane_needs(sorted({j.lane for j in jobs}))


def show_plan(jobs, workers):
    needs = plan_for(jobs)
    by = {}
    for j in jobs:
        by.setdefault(j.lane, []).append(j)
    print("선 계획 (작업자 %d). 선 안은 적힌 차례대로, 선 사이는 '다 끝난 뒤에' 만 있다" % workers)
    order = sorted(by, key=lambda ln: (min(j.step for j in by[ln]), ln))
    for ln in order:
        js = by[ln]
        w = sum(j.weight for j in js)
        nd = ", ".join(sorted(needs[ln])) or "-"
        if len(needs[ln]) > 6:
            nd = "나머지 선 전부 (%d개)" % len(needs[ln])
        print("  %-26s 걸음 %3d / 예상 %5.0f초 / 기다림 %s" % (ln, len(js), w, nd))
    bad = par_run.check_plan(jobs, needs)
    for b in bad:
        print("[실패] " + b)
    print("선 %d개 / 걸음 %d개 / %s" % (len(by), len(jobs), "차례 실행과 뜻이 같다" if not bad else "계획이 어긋난다"))
    return 0 if not bad else 1


# ---------------------------------------------------------------- 결과 읽기

def lines_of(text):
    return [x for x in text.strip().split("\n") if x.strip()]


def kind_of(r):
    """ok / fail / skip. 건너뜀은 종료 코드 77 이거나 출력에 건너뜀 글이 있는 것."""
    if r.timed_out:
        return "fail"
    if r.rc not in (0, SKIP_RC):
        return "fail"
    if r.rc == SKIP_RC or SKIP_RE.search(r.out):
        return "skip"
    return "ok"


def merge(parts):
    """쪼갠 걸음의 부분 결과를 걸음 하나로 합친다. 부분의 합이 걸음이다."""
    if len(parts) == 1:
        return parts[0]
    rc = 0
    if any(p.timed_out for p in parts):
        rc = 124
    else:
        bad = [p.rc for p in parts if p.rc not in (0, SKIP_RC)]
        rc = bad[0] if bad else (SKIP_RC if any(p.rc == SKIP_RC for p in parts) else 0)
    return par_run.Result(
        key=parts[0].key, rc=rc, out="\n".join(p.out for p in parts),
        err="\n".join(p.err for p in parts), secs=sum(p.secs for p in parts),
        timed_out=any(p.timed_out for p in parts))


def detail_of(parts, kind):
    """실패한 걸음의 실패 줄만. 경고가 일흔아홉이라 그대로 쏟으면 실패가 묻힌다."""
    if kind == "skip":
        hit = [x for p in parts for x in lines_of(p.out) if SKIP_RE.search(x)]
        return ("건너뛰었다. 통과가 아니다 (일부러면 --allow-skip)\n" +
                "\n".join((hit or lines_of(parts[0].out))[:6]))
    out = []
    for p in parts:
        if kind == "fail" and p.rc in (0, SKIP_RC) and not p.timed_out:
            continue
        crashed = re.search(r"Page crashed|Target crashed|ERR_FAILED", p.out + p.err)
        lines = lines_of(p.out)
        bad = [x for x in lines if "[실패]" in x or "실패" in x and "0개" not in x]
        txt = "\n".join(bad[:40]) or p.out.strip()[-800:]
        if p.timed_out:
            txt = (txt + "\n" + lines_of(p.err)[-1]).strip()
        elif not txt.strip() and p.err.strip():
            txt = p.err.strip()[-800:]
        if crashed:
            # 코드 탓이 아닐 때가 많다. 디스크가 차면 크로미움이 이렇게 죽는다 (2026-10-09 에 겪었다)
            txt += "\n[힌트] 브라우저가 죽었다. 디스크 빈 곳 (df -h) 과 메모리를 먼저 본다"
        out.append(txt)
    return "\n".join(out)


def tools_probe(env):
    """브라우저 검사가 돌 수 있는 기계인가. 한 줄로 말해 준다."""
    try:
        r = subprocess.run(["node", str(S / "lib" / "browser_harness.js"), "--probe"],
                           capture_output=True, text=True, timeout=30, env=env, cwd=str(ROOT))
        txt = (r.stdout.strip().splitlines() or ["(출력 없음)"])[-1]
        return r.returncode == 0, txt
    except (OSError, subprocess.TimeoutExpired) as e:
        return False, "node 를 못 돌렸다: %s" % e


# ---------------------------------------------------------------- 돌기

def main(argv=None):
    import argparse
    ap = argparse.ArgumentParser(prog="all.py", add_help=True,
                                 description="파생과 검사를 정해진 순서로 다 돈다 (세션 종료 절차)")
    ap.add_argument("--quick", action="store_true", help="파생과 대조만. 늘 차례대로 돈다")
    ap.add_argument("--allow-skip", action="store_true", help="건너뛴 검사를 실패로 안 센다")
    ap.add_argument("--serial", action="store_true", help="한 걸음씩 차례대로 (--jobs 1 과 같다)")
    ap.add_argument("--jobs", type=int, default=None,
                    help="작업자 수 (기본 min(6, 코어 수))")
    ap.add_argument("--plan", action="store_true", help="선 계획만 찍고 끝낸다")
    ap.add_argument("--only", metavar="A,B", help="이름이 맞는 걸음만 (세션 종료 절차가 아니다)")
    ap.add_argument("--times", metavar="FILE", help="걸음마다 걸린 시간을 JSON 으로 남긴다")
    ap.add_argument("--timeout", type=float, default=DEFAULT_TIMEOUT,
                    help="걸음 하나의 시간 초과 초 (기본 %d)" % DEFAULT_TIMEOUT)
    a = ap.parse_args(sys.argv[1:] if argv is None else argv)

    cpu = os.cpu_count() or 2
    workers = a.jobs if a.jobs is not None else min(6, cpu)
    if workers < 1:
        ap.error("--jobs 는 1 이상이다")
    serial = a.serial or workers == 1 or a.quick
    quick = a.quick

    env = dict(os.environ)
    if a.allow_skip:
        # 일부러 건너뛰는 날. 자식도 건너뛴 채 0 으로 나가게 하고 "필수" 표지는 치운다
        env["ENG2P_ALLOW_SKIP"] = "1"
        env.pop("REQUIRE_BROWSER", None)
        env.pop("REQUIRE_PDF", None)
    else:
        env.pop("ENG2P_ALLOW_SKIP", None)
        env["REQUIRE_BROWSER"] = "1"      # 뿌리 tests/ 가 건너뛰지 않고 스스로 빨간불
        env["REQUIRE_PDF"] = "1"          # tools/worksheet_leak.py 도 같다

    jobs = build_jobs(split=not serial)
    if a.plan:
        return show_plan(build_jobs(split=True), workers if workers > 1 else min(6, cpu))
    if not serial:
        bad = par_run.check_plan(jobs, plan_for(jobs))
        if bad:
            print("[실패] 병렬 계획이 차례 실행과 뜻이 다르다. all.py 의 lane_of 를 고친다")
            for b in bad:
                print("  " + b)
            return 1

    if not quick:
        try:
            free = shutil.disk_usage(tempfile.gettempdir()).free // (1024 * 1024)
            if free < 300:
                sys.stderr.write("[경고] 임시 폴더의 빈 곳이 %dMB 뿐이다. 크로미움이 'Page crashed' 로 "
                                 "죽을 수 있다 (죽으면 실패로 센다)\n" % free)
        except OSError:
            pass
        ok, line = tools_probe(env)
        sys.stderr.write("[도구] %s\n" % line)
        if not ok and not a.allow_skip:
            n = sum(1 for g, s, ar, q in STEPS if s.endswith(".js") and not q)
            sys.stderr.write("[경고] 브라우저 도구가 없다. 화면 검사는 건너뛰고 건너뜀은 실패다 "
                             "(--allow-skip 이면 안 센다)\n")

    sel = [i for i, (g, s, ar, q) in enumerate(STEPS) if not quick or q]
    if a.only:
        want = {x.strip() for x in a.only.split(",") if x.strip()}
        unknown = want - {s for g, s, ar, q in STEPS}
        if unknown:
            ap.error("STEPS 에 없는 이름: " + ", ".join(sorted(unknown)))
        sel = [i for i in sel if STEPS[i][1] in want]
        if not sel:
            ap.error("--only 에 맞는 걸음이 없다 (--quick 이 빼지 않았는가)")
    sel_set = set(sel)
    jobs = [j for j in jobs if j.step in sel_set]
    total = len(jobs)
    done = [0]

    def progress(job, r):
        done[0] += 1
        mark = {"ok": "OK  ", "fail": "실패", "skip": "건너뜀"}[kind_of(r)]
        sys.stderr.write("  [%3d/%d] %s %6.1f초 %s\n" % (done[0], total, mark, r.secs, job.label))
        sys.stderr.flush()

    t0 = time.time()
    if serial:
        res = par_run.run_serial(jobs, str(ROOT), env, a.timeout, None if quick else progress)
    else:
        res = par_run.run_parallel(jobs, plan_for(jobs), workers, str(ROOT), env,
                                   a.timeout, progress)
    wall = time.time() - t0

    # 걸음마다 부분을 모은다. 원래 차례대로.
    by_step = {}
    for j in jobs:
        by_step.setdefault(j.step, []).append(res[j.key])
    rows, failed, nskip = [], [], 0
    for i in sel:
        group, script, args, in_quick = STEPS[i]
        parts = by_step[i]
        r = merge(parts)
        kind = kind_of(r)
        # 마지막 뜻있는 줄이 그 검사의 판정이다. 쪼갠 걸음은 실패한 부분의 줄을 앞세운다
        pick = next((p for p in parts if kind_of(p) != "ok"), parts[-1])
        ls = lines_of(pick.out)
        last = ls[-1] if ls else "(출력 없음)"
        if len(parts) > 1:
            last = "[%d부분] %s" % (len(parts), last)
        rows.append((group, script, kind, last))
        if kind == "skip":
            nskip += 1
            if not a.allow_skip:
                failed.append((script, detail_of(parts, "skip")))
        elif kind == "fail":
            failed.append((script, detail_of(parts, "fail")))

    w = max(len(s) for _, s, _, _ in rows)
    cur = None
    for group, script, kind, last in rows:
        if group != cur:
            print("\n[%s]" % group)
            cur = group
        if kind == "skip":
            mark = "건너뜀" if a.allow_skip else "실패"
        else:
            mark = "OK  " if kind == "ok" else "실패"
        print("  %s %-*s  %s" % (mark, w, script, last))

    if failed:
        print("\n" + "=" * 60)
        for script, out in failed:
            print("\n### %s 가 실패했다\n%s" % (script, out))

    sk = ""
    if nskip:
        sk = " (건너뜀 %d개 포함)" % nskip if not a.allow_skip else " / 건너뜀 %d개 (--allow-skip)" % nskip
    mode = " (빠른 판)" if quick else ("" if serial else " / 병렬 %d" % workers)
    if a.only:
        mode += " / 일부만 (--only). 세션 종료 절차가 아니다"
    print("\n%.1f초 / %d개 중 실패 %d개%s%s" % (wall, len(rows), len(failed), sk, mode))

    if not quick:
        tot = sum(r.secs for r in res.values())
        slow = sorted(((r.secs, k) for k, r in res.items()), reverse=True)[:5]
        sys.stderr.write("[시간] 벽시계 %.0f초 / 걸음 합 %.0f초 / 배율 %.1f / 느린 다섯: %s\n" % (
            wall, tot, tot / wall if wall else 0,
            ", ".join("%s %.0f" % (k.split(":", 1)[1], s) for s, k in slow)))
    if a.times:
        pathlib.Path(a.times).write_text(json.dumps(
            {"wall": round(wall, 1), "workers": 1 if serial else workers, "quick": quick,
             "steps": [[j.step, j.label, round(res[j.key].secs, 1), res[j.key].rc,
                        round(res[j.key].start - t0, 1), round(res[j.key].end - t0, 1)]
                       for j in jobs]},
            ensure_ascii=False, indent=1), encoding="utf-8")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
