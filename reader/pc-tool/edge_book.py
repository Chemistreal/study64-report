#!/usr/bin/env python3
"""여백 PC 작업실 · Edge 신경망 음성으로 책 한 권을 MP3로 만든다.

  python edge_book.py --segments segments.json --workdir 작업폴더 --out audio.mp3
                      [--voice ko-KR-HyunsuMultilingualNeural] [--rate +50%] [--sample-rate 16000] [--kbps 16] [--concurrency 4]

segments.json = [{"block": 문단번호, "text": "문단 글"}, ...]  (여백 리더와 같은 문단 번호)

- 문단마다 Edge 음성을 받아 workdir/seg/00001.mp3 로 둔다. 이미 받은 문단은 건너뛴다(끊겨도 이어서 만든다).
- 받은 소리가 글 끝까지 들어 있는지(문장 경계 정보로) 확인하고, 중간에 끊겼으면 다시 받는다.
- 다 받으면 ffmpeg로 이어 붙여 정한 표본율·비트레이트의 MP3 하나로 만들고, 문단마다 시작 시각(초)을 적는다.
- 진행 상황은 표준 출력에 JSON 한 줄씩 낸다: {"type":"progress",...} / {"type":"done",...} / {"type":"error",...}
"""
import argparse, asyncio, json, os, re, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

import edge_tts
from pronounce import speakable   # 발음 사전(pronounce.txt)·숫자 범위·조사 맞추기

def say(**kw):
    sys.stdout.write(json.dumps(kw, ensure_ascii=False) + '\n'); sys.stdout.flush()

def ffmpeg_exe():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return 'ffmpeg'

# 화면용 표시(마크다운 기호 등)를 소리 내 읽지 않게 지운다.
CLEAN = [(re.compile(r'https?://\S+'), ' '), (re.compile(r'[*_`#>|~\[\]{}<>]'), ' '), (re.compile(r'\s+'), ' ')]
def clean(text):
    for rx, rep in CLEAN: text = rx.sub(rep, text)
    return text.strip()

LETTERS = re.compile(r'[\w가-힣]')
def letters(s): return len(LETTERS.findall(s or ''))

async def synth_one(text, voice, rate):
    audio, spoken = bytearray(), []
    comm = edge_tts.Communicate(text, voice, rate=rate, boundary='SentenceBoundary', connect_timeout=20, receive_timeout=90)
    async for chunk in comm.stream():
        if chunk['type'] == 'audio': audio += chunk['data']
        elif chunk['type'] in ('SentenceBoundary', 'WordBoundary'): spoken.append(chunk.get('text', ''))
    return bytes(audio), ''.join(spoken)

async def fetch_all(segs, args, seg_dir):
    todo = [i for i in range(len(segs)) if not os.path.exists(os.path.join(seg_dir, f'{i:05d}.mp3'))]
    done = len(segs) - len(todo)
    total_chars = sum(len(s['clean']) for s in segs) or 1
    todo_set = set(todo)
    done_chars = sum(len(segs[i]['clean']) for i in range(len(segs)) if i not in todo_set)
    sem = asyncio.Semaphore(args.concurrency)
    started, fails = time.time(), 0
    last = 0.0

    async def work(i):
        nonlocal done, done_chars, fails, last
        text = segs[i]['clean']
        path = os.path.join(seg_dir, f'{i:05d}.mp3')
        async with sem:
            for attempt in range(8):
                try:
                    audio, spoken = await synth_one(text, args.voice, args.rate)
                    want, got = letters(text), letters(spoken)
                    # 글자의 85% 이상이 소리로 나왔는지(문장 경계 정보). 정보가 없으면 소리 길이로만 본다.
                    if len(audio) < 1500 or (want >= 8 and got and got < want * 0.85):
                        raise RuntimeError(f'소리가 중간에 끊겼습니다({got}/{want}자)')
                    with open(path + '.part', 'wb') as f: f.write(audio)
                    os.replace(path + '.part', path)
                    break
                except Exception as e:
                    fails += 1
                    await asyncio.sleep(min(60, 2 ** attempt))
                    if attempt == 7: raise RuntimeError(f'{i + 1}번째 문단을 받지 못했습니다: {e}')
        done += 1; done_chars += len(text)
        now = time.time()
        if now - last > 1 or done == len(segs):
            last = now
            spent = now - started
            say(type='progress', stage='synth', done=done, total=len(segs), chars=done_chars, totalChars=total_chars, seconds=round(spent, 1), retries=fails)

    say(type='progress', stage='synth', done=done, total=len(segs), chars=done_chars, totalChars=total_chars, seconds=0, retries=0)
    tasks = [asyncio.create_task(work(i)) for i in todo]
    try:
        await asyncio.gather(*tasks)
    except Exception:
        for t in tasks: t.cancel()
        raise

def decode(ff, path, rate):
    r = subprocess.run([ff, '-hide_banner', '-loglevel', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', str(rate), '-'], capture_output=True)
    if r.returncode != 0: raise RuntimeError('소리 파일을 읽지 못했습니다: ' + os.path.basename(path) + ' ' + r.stderr.decode('utf-8', 'replace')[-200:])
    return r.stdout

def assemble(segs, args, seg_dir):
    ff = ffmpeg_exe(); rate = args.sample_rate
    part = args.out + '.part'
    enc = subprocess.Popen([ff, '-hide_banner', '-loglevel', 'error', '-y', '-f', 's16le', '-ar', str(rate), '-ac', '1', '-i', 'pipe:0',
                            '-c:a', 'libmp3lame', '-b:a', f'{args.kbps}k', '-ar', str(rate), '-ac', '1', '-write_xing', '0', '-id3v2_version', '0', '-f', 'mp3', part],
                           stdin=subprocess.PIPE)
    gap = b'\0\0' * int(rate * args.gap)
    samples, marks = 0, []
    paths = [os.path.join(seg_dir, f'{i:05d}.mp3') for i in range(len(segs))]
    with ThreadPoolExecutor(max_workers=max(2, (os.cpu_count() or 4) // 2)) as pool:
        for i, pcm in enumerate(pool.map(lambda p: decode(ff, p, rate), paths)):
            block = segs[i]['block']
            if not marks or marks[-1][0] != block: marks.append([block, round(samples / rate, 3)])
            enc.stdin.write(pcm); samples += len(pcm) // 2
            if i < len(segs) - 1: enc.stdin.write(gap); samples += len(gap) // 2
            if i % 50 == 0 or i == len(segs) - 1: say(type='progress', stage='joining', done=i + 1, total=len(segs))
    enc.stdin.close()
    if enc.wait() != 0: raise RuntimeError('MP3로 묶지 못했습니다(ffmpeg).')
    os.replace(part, args.out)
    return marks, samples / rate

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--segments', required=True); ap.add_argument('--workdir', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--voice', default='ko-KR-HyunsuMultilingualNeural'); ap.add_argument('--rate', default='+50%')
    ap.add_argument('--sample-rate', type=int, default=16000); ap.add_argument('--kbps', type=int, default=16)
    ap.add_argument('--concurrency', type=int, default=4); ap.add_argument('--gap', type=float, default=0.12)
    args = ap.parse_args()
    segs = json.load(open(args.segments, encoding='utf-8'))
    for s in segs: s['clean'] = clean(speakable(s['text']))
    segs = [s for s in segs if letters(s['clean'])]
    if not segs: raise SystemExit(say(type='error', message='읽을 글이 없습니다.'))
    seg_dir = os.path.join(args.workdir, 'seg'); os.makedirs(seg_dir, exist_ok=True)
    try:
        asyncio.run(fetch_all(segs, args, seg_dir))
        marks, duration = assemble(segs, args, seg_dir)
        say(type='done', mp3=args.out, marks=marks, duration=round(duration, 3), bytes=os.path.getsize(args.out), segments=len(segs))
    except Exception as e:
        say(type='error', message=str(e)); sys.exit(1)

if __name__ == '__main__':
    main()
