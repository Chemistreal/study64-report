#!/usr/bin/env python3
"""병렬 실행기. `all.py` 가 부른다. 직접 돌릴 일은 없다.

all.py 의 한 걸음은 자식 프로세스 하나다. 걸음 백서른하나 중 브라우저를 띄우는 마흔여섯이
시간의 91% 를 먹는데 CPU 는 놀고 있다 (고정 시간만큼 자는 것이 대부분이다).
이 실행기는 그 걸음들을 작업자 N 으로 나눠 돌린다.

## 선 (lane)

**걸음마다 선 하나에 속한다.** 같은 선의 걸음은 **적힌 차례대로 하나씩** 돈다.
다른 선은 나란히 돈다. 선은 `needs` 로 다른 선이 **다 끝난 뒤에** 시작한다고 적을 수 있다.
이 둘이 전부다. 의존을 걸음마다 적는 대신 선으로 묶는 까닭은 **차례가 뜻을 가지는 사슬**
(파생 → 파생물을 읽는 검사, 게임 사슬) 이 한 선 안에 그대로 남기 때문이다.

- 선 안: 앞 걸음이 실패해도 뒤 걸음은 돈다 (차례 실행과 같다. 실패를 다 모아 보여 준다)
- 선 사이: `needs` 에 적힌 선이 **통째로** 끝나야 시작한다. 그 선에 실패가 있어도 시작한다
- 긴 선을 먼저 시작한다 (남은 걸음의 예상 시간 합이 큰 선). 벽시계가 줄어든다

## 쪼갠 걸음

한 걸음이 `parts` 를 가지면 (`check_ui.js --part 1/3`) 부분마다 따로 선을 얻어 나란히 돈다.
결과는 부분이 다 끝나면 한 걸음의 결과로 합쳐진다 (all.py 가 합친다).

## 책임

- 실행기는 **출력을 모았다가 돌려준다.** 찍는 것은 all.py 다. 그래서 작업자 수와 상관없이
  최종 출력은 걸음의 원래 차례다 (진행 줄만 끝나는 차례로 stderr 에 나간다)
- 시간 초과가 있다. 걸음이 영영 안 끝나면 (브라우저가 멎는다) 프로세스 묶음째 죽이고 실패로 센다
"""
import collections
import dataclasses
import os
import signal
import subprocess
import sys
import threading
import time
from typing import Callable, Dict, List, Optional, Set


@dataclasses.dataclass
class Job:
    key: str                      # 고유한 이름. "check_ui.js#2/3"
    step: int                     # 원래 차례 (STEPS 안의 자리)
    cmd: List[str]
    lane: str
    weight: float = 1.0           # 예상 초. 긴 선을 먼저 시작하는 데만 쓴다
    label: str = ""


@dataclasses.dataclass
class Result:
    key: str
    rc: int
    out: str
    err: str
    secs: float
    timed_out: bool = False
    start: float = 0.0            # 시작과 끝의 시각 (time.time()). 시간표를 그리는 데만 쓴다
    end: float = 0.0


def _kill_tree(p: "subprocess.Popen") -> None:
    try:
        os.killpg(os.getpgid(p.pid), signal.SIGKILL)
    except (ProcessLookupError, PermissionError, OSError):
        try:
            p.kill()
        except OSError:
            pass


def run_one(job: Job, cwd: str, env: dict, timeout: float) -> Result:
    """걸음 하나. 새 세션으로 띄워 시간 초과 때 브라우저까지 묶음째 죽인다."""
    t0 = time.time()
    try:
        p = subprocess.Popen(job.cmd, cwd=cwd, env=env, stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE, text=True, encoding="utf-8",
                             errors="replace", start_new_session=True)
    except OSError as e:                       # node 나 파이썬을 못 찾았다. 실패로 센다
        return Result(job.key, 127, "[실패] 걸음을 못 띄웠다: %s" % e, "", time.time() - t0)
    try:
        out, err = p.communicate(timeout=timeout)
        return Result(job.key, p.returncode, out or "", err or "", time.time() - t0,
                      False, t0, time.time())
    except subprocess.TimeoutExpired:
        _kill_tree(p)
        try:
            out, err = p.communicate(timeout=20)
        except Exception:                       # noqa: BLE001
            out, err = "", ""
        return Result(job.key, 124, out or "", (err or "") +
                      "\n[시간 초과] %d초 안에 안 끝나서 죽였다" % timeout,
                      time.time() - t0, True, t0, time.time())


def run_serial(jobs: List[Job], cwd: str, env: dict, timeout: float,
               progress: Optional[Callable[[Job, Result], None]] = None) -> Dict[str, Result]:
    """원래 차례대로 하나씩. 선과 의존은 안 본다 (차례가 곧 의존이다)."""
    res: Dict[str, Result] = {}
    for j in sorted(jobs, key=lambda x: (x.step, x.key)):
        r = run_one(j, cwd, env, timeout)
        res[j.key] = r
        if progress:
            progress(j, r)
    return res


def run_parallel(jobs: List[Job], needs: Dict[str, Set[str]], workers: int, cwd: str,
                 env: dict, timeout: float,
                 progress: Optional[Callable[[Job, Result], None]] = None) -> Dict[str, Result]:
    """선으로 묶어 작업자 `workers` 로 돈다. 결과는 키로 돌려준다 (차례는 호출한 쪽이 안다)."""
    lanes: "collections.OrderedDict[str, collections.deque]" = collections.OrderedDict()
    for j in sorted(jobs, key=lambda x: (x.step, x.key)):
        lanes.setdefault(j.lane, collections.deque()).append(j)
    for ln, ns in needs.items():
        for n in ns:
            if n not in lanes:
                raise ValueError("선 %s 이 없는 선 %s 을 기다린다" % (ln, n))
    first = {ln: q[0].step for ln, q in lanes.items()}
    done_lanes: Set[str] = set()
    running: Set[str] = set()
    res: Dict[str, Result] = {}
    cond = threading.Condition()
    free = [workers]

    def remaining(ln: str) -> float:
        return sum(j.weight for j in lanes[ln])

    def worker(ln: str, job: Job) -> None:
        try:
            r = run_one(job, cwd, env, timeout)
        except Exception as e:                  # noqa: BLE001  죽은 작업자가 선을 영영 붙들면 안 된다
            r = Result(job.key, 1, "[실패] 실행기 오류: %r" % (e,), "", 0.0)
        with cond:
            res[job.key] = r
            running.discard(ln)
            if not lanes[ln]:
                done_lanes.add(ln)
            free[0] += 1
            if progress:
                progress(job, r)
            cond.notify_all()

    threads: List[threading.Thread] = []
    with cond:
        while len(done_lanes) < len(lanes):
            ready = [ln for ln in lanes
                     if ln not in done_lanes and ln not in running and lanes[ln]
                     and needs.get(ln, set()) <= done_lanes]
            # 남은 일이 많은 선부터, 같으면 원래 차례가 앞선 선부터. 결정적이다
            ready.sort(key=lambda ln: (-remaining(ln), first[ln], ln))
            while ready and free[0] > 0:
                ln = ready.pop(0)
                job = lanes[ln].popleft()
                running.add(ln)
                free[0] -= 1
                t = threading.Thread(target=worker, args=(ln, job), daemon=True)
                threads.append(t)
                t.start()
            if len(done_lanes) < len(lanes):
                if not running:
                    # 일할 수 있는 선이 없는데 끝나지도 않았다. 의존이 고리를 이룬다
                    stuck = sorted(ln for ln in lanes if ln not in done_lanes)
                    raise RuntimeError("의존이 막혔다: " + ", ".join(stuck))
                cond.wait()
    for t in threads:
        t.join()
    return res


def check_plan(jobs: List[Job], needs: Dict[str, Set[str]]) -> List[str]:
    """선 계획이 차례 실행과 같은 뜻인지 본다. 어긋나면 문장으로 돌려준다.

    1. 선이 기다리는 선의 걸음은 **전부 원래 차례에서 앞선다.** 그래야 병렬이 차례 실행의 뜻을 안 바꾼다
    2. 고리가 없다
    3. 같은 선의 걸음은 원래 차례를 지켜 담겼다 (선 안은 차례대로 돈다)
    """
    bad: List[str] = []
    by: Dict[str, List[Job]] = collections.defaultdict(list)
    for j in jobs:
        by[j.lane].append(j)
    for ln, ns in needs.items():
        if ln not in by:
            continue
        lo = min(j.step for j in by[ln])
        for n in ns:
            if n not in by:
                bad.append("선 %s 이 없는 선 %s 을 기다린다" % (ln, n))
                continue
            hi = max(j.step for j in by[n])
            if hi >= lo:
                late = max(by[n], key=lambda j: j.step)
                early = min(by[ln], key=lambda j: j.step)
                bad.append("선 %s 의 첫 걸음 %s (%d) 이 기다리는 선 %s 의 걸음 %s (%d) 보다 앞서 있다. "
                           "차례 실행과 뜻이 달라진다" % (ln, early.label or early.key, lo,
                                                          n, late.label or late.key, hi))
    # 고리
    seen: Set[str] = set()

    def visit(n: str, trail: List[str]) -> None:
        if n in trail:
            bad.append("의존에 고리가 있다: " + " -> ".join(trail + [n]))
            return
        if n in seen:
            return
        for m in needs.get(n, set()):
            visit(m, trail + [n])
        seen.add(n)

    for ln in list(needs):
        visit(ln, [])
    return bad


def selftest() -> int:
    """깸 시험. 실행기가 약속한 것을 일부러 깨 보고 잡는지 본다.

        python3 scripts/par_run.py --selftest
    """
    import tempfile
    bad: List[str] = []
    n = [0]

    def ok(cond: bool, msg: str) -> None:
        n[0] += 1
        if not cond:
            bad.append(msg)

    py = sys.executable
    tmp = tempfile.mkdtemp(prefix="par_run_")
    log = os.path.join(tmp, "log")

    def mark(name: str, sleep: float = 0.0, rc: int = 0) -> List[str]:
        code = ("import time,sys;time.sleep(%s);open(%r,'a').write(%r+'\\n');sys.exit(%d)"
                % (sleep, log, name, rc))
        return [py, "-c", code]

    def order() -> List[str]:
        return [x for x in open(log).read().split("\n") if x] if os.path.exists(log) else []

    # 1. 같은 선은 적힌 차례대로, 앞이 실패해도 뒤가 돈다. 선 사이는 기다림을 지킨다
    jobs = [Job("a1", 0, mark("a1", 0.3, rc=3), "A", label="a1"),
            Job("a2", 1, mark("a2"), "A", label="a2"),
            Job("b1", 2, mark("b1"), "B", label="b1"),
            Job("c1", 3, mark("c1"), "C", label="c1")]
    needs = {"A": set(), "B": {"A"}, "C": set()}
    ok(check_plan(jobs, needs) == [], "맞는 계획인데 어긋났다고 한다")
    res = run_parallel(jobs, needs, 3, tmp, dict(os.environ), 30)
    o = order()
    ok(o.index("a1") < o.index("a2"), "같은 선이 차례를 안 지켰다: %s" % o)
    ok(o.index("a2") < o.index("b1"), "기다리는 선이 먼저 돌았다: %s" % o)
    ok(res["a1"].rc == 3 and "a2" in res and res["a2"].rc == 0, "앞이 실패했는데 뒤가 안 돌았다")

    # 2. 시간 초과는 묶음째 죽이고 실패(124)로 센다
    t0 = time.time()
    r = run_one(Job("slow", 0, [py, "-c", "import time;time.sleep(60)"], "S"), tmp, dict(os.environ), 1.5)
    ok(r.timed_out and r.rc == 124 and time.time() - t0 < 20, "시간 초과가 안 죽었다")

    # 3. 못 띄운 걸음은 실패(127)다. 선을 붙들지 않는다
    r = run_one(Job("none", 0, ["/없는/명령"], "S"), tmp, dict(os.environ), 5)
    ok(r.rc == 127, "없는 명령이 실패로 안 셈해졌다")

    # 4. 계획이 차례 실행과 뜻이 다르면 잡는다 (기다리는 선의 걸음이 뒤에 있다)
    late = [Job("x1", 5, mark("x1"), "X", label="x1"), Job("y1", 2, mark("y1"), "Y", label="y1")]
    ok(len(check_plan(late, {"Y": {"X"}, "X": set()})) == 1, "앞서야 할 선이 뒤에 있는데 못 잡았다")
    cyc = [Job("p", 0, mark("p"), "P"), Job("q", 1, mark("q"), "Q")]
    ok(any("고리" in m for m in check_plan(cyc, {"P": {"Q"}, "Q": {"P"}})), "고리를 못 잡았다")
    try:
        run_parallel(cyc, {"P": {"Q"}, "Q": {"P"}}, 2, tmp, dict(os.environ), 5)
        ok(False, "고리인데 돌았다")
    except RuntimeError:
        pass

    # 5. 작업자 1이면 선이 있어도 한 번에 하나만 돈다
    if os.path.exists(log):
        os.remove(log)
    seq = [Job("s%d" % i, i, mark("s%d" % i, 0.2), "L%d" % i, label="s%d" % i) for i in range(3)]
    t0 = time.time()
    run_parallel(seq, {}, 1, tmp, dict(os.environ), 30)
    ok(time.time() - t0 >= 0.55, "작업자 1인데 나란히 돌았다")

    for m in bad:
        print("[실패] " + m)
    print("실행기 깸 시험 %d판 / 실패 %d" % (n[0], len(bad)))
    return 1 if bad else 0


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        sys.exit(selftest())
    print(__doc__)
    sys.exit(0)
