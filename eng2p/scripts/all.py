#!/usr/bin/env python3
"""파생과 검사를 정해진 순서로 다 돌린다. 세션 종료 절차다.

걸음이 마흔다섯이 됐다. 순서도 있다. 그것을 기억으로 돌리면 언젠가 하나를 뺀다.
**뺀 검사는 안 돌린 것이 아니라 통과한 것처럼 보인다.** 그래서 한 자리에 모은다.

순서에는 이유가 있다.

1. 파생을 먼저 한다. 원본이 바뀌었으면 파생물이 옛 값이다. 옛 값을 검사해 봐야 소용없다
2. 파생물 어긋남을 본다. 1에서 뭔가 바뀌었으면 커밋 전에 알아야 한다
3. 규격 검사를 돈다. 파일 하나씩 보는 것들이다
4. 대조 검사를 돈다. 파일끼리 견주는 것들이다
5. 상태 파일을 갱신한다. 검사가 다 끝난 뒤의 값이어야 맞다

사용법:
    python3 scripts/all.py           # 다 돌린다
    python3 scripts/all.py --quick   # 파생과 대조만. 손볼 때 쓴다

하나라도 실패하면 종료 코드 1이다. 통과한 것도 다 보여 준다.
규격: CLAUDE.md 세션 종료 절차
"""
import pathlib
import subprocess
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent
S = ROOT / "scripts"

# (묶음, 스크립트, 인자, 빠른 판에도 도는가)
STEPS = [
    # **앱도 파생물이다.** app/ 조각 서른셋을 합쳐 english.html 을 만든다.
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
    ("대조", "check_play_score.py", [], True),
    ("대조", "check_person.py", [], True),
    ("대조", "check_layers.py", [], True),
    ("대조", "check_ground_cite.py", [], True),
    ("대조", "check_refs.py", [], True),
    ("대조", "check_data.py", [], True),
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


def main():
    quick = "--quick" in sys.argv
    rows, failed = [], []
    t0 = time.time()
    for group, script, args, in_quick in STEPS:
        if quick and not in_quick:
            continue
        # 화면 검사만 node 로 돈다. 브라우저가 없으면 스스로 건너뛰고 0을 낸다.
        cmd = (["node", str(S / script)] if script.endswith(".js")
               else [sys.executable, str(S / script)]) + args
        r = subprocess.run(cmd, capture_output=True, text=True, cwd=str(ROOT))
        # 마지막 뜻있는 줄이 그 검사의 판정이다.
        lines = [x for x in r.stdout.strip().split("\n") if x.strip()]
        last = lines[-1] if lines else "(출력 없음)"
        # 건너뛴 것과 통과한 것을 가른다. 둘 다 종료 코드가 0이라 그것만으로는 안 갈린다.
        skipped = "[건너뜀]" in r.stdout
        rows.append((group, script, r.returncode, last, skipped))
        if r.returncode != 0:
            # 실패 줄만 보여 준다. 경고가 일흔아홉이라 그대로 쏟으면 실패가 묻힌다.
            bad = [x for x in lines if "[실패]" in x or "실패" in x and "0개" not in x]
            failed.append((script, "\n".join(bad[:40]) or r.stdout.strip()[-800:]))

    w = max(len(s) for _, s, _, _, _ in rows)
    cur = None
    for group, script, code, last, skipped in rows:
        if group != cur:
            print("\n[%s]" % group)
            cur = group
        mark = "건너뜀" if skipped else ("OK  " if code == 0 else "실패")
        print("  %s %-*s  %s" % (mark, w, script, last))

    if failed:
        print("\n" + "=" * 60)
        for script, out in failed:
            print("\n### %s 가 실패했다\n%s" % (script, out))

    nskip = sum(1 for r in rows if r[4])
    print("\n%.1f초 / %d개 중 실패 %d개%s%s"
          % (time.time() - t0, len(rows), len(failed),
             " / 건너뜀 %d개" % nskip if nskip else "",
             " (빠른 판)" if quick else ""))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
