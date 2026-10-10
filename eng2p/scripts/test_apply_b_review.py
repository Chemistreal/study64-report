#!/usr/bin/env python3
"""apply_b_review.py 의 시험. python3 -m unittest scripts/test_apply_b_review.py (eng2p/ 에서) 또는 python3 scripts/test_apply_b_review.py"""
import json
import os
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import apply_b_review as R  # noqa: E402
import authored_lib as L  # noqa: E402


def ln(i, kind, who, scene, say, check="A"):
    return {"id": i, "scene": scene, "kind": kind, "who": who, "say": say, "cefr": "A1", "fn": "x", "check": check,
            "why": "-" if check == "A" else "이유가 있다 확신 없음", "ko": "풀이"}


def fake():
    o = {"id": "m1", "meta": {"할 일": "cd-1 / I can pay. / 계산할 수 있다."},
         "lines": [ln("a-01", "npc", "Clerk", "pay", "How much?"),
                   ln("a-02", "option", "두 사람", "pay", "Card, please."),
                   ln("a-03", "option", "두 사람", "pay", "Cash, please."),
                   ln("a-04", "npc", "Clerk", "pay", "It is ten dollars.", "B"),
                   ln("a-05", "option", "두 사람", "pay", "Here is ten dollars.", "B"),
                   ln("a-06", "npc", "Clerk", "bye", "Bye.", "B")], "practice": []}
    m = {"id": "m1", "game": {"turns": [
        {"id": "t1", "scene": "pay", "npc": ["a-01"], "pick": ["a-02", "a-03"], "branch": {"a-02": "a-04"}},
        {"id": "t2", "scene": "pay", "npc": [], "pick": ["a-05"], "branch": {}},
        {"id": "t3", "scene": "bye", "npc": ["a-06"], "pick": [], "branch": {}}]}}
    return [o], [m]


class T(unittest.TestCase):
    def test_normalize(self):
        st, err = R.normalize({"a-04": "O", "a-05": "rejected"}, ["a-04", "a-05", "a-06"])
        self.assertEqual(st, {"a-04": "approved", "a-05": "rejected", "a-06": None})
        self.assertEqual(err, [])
        _, err = R.normalize({"zzz": "O", "a-04": "maybe"}, ["a-04"])
        self.assertEqual(len(err), 2)

    def test_approved_list_and_files(self):
        with tempfile.TemporaryDirectory() as d:
            st = {"b-2": "approved", "a-1": "approved", "c-3": "rejected", "d-4": None}
            p = os.path.join(d, "x", "HnlAuthoredApproved.json")
            self.assertEqual(R.write_approved(st, p), ["a-1", "b-2"])
            self.assertEqual(json.load(open(p))["approved"], ["a-1", "b-2"])
            R.write_approved(st, p, plain=True)
            self.assertEqual(json.load(open(p)), ["a-1", "b-2"])

    def test_check_flags_rejected_in_use(self):
        outs, ms = fake()
        # 빈자리: 점원 말 하나뿐인 차례, 갈래 도착, 고를 말 하나뿐인 차례
        fail, _ = R.check({"a-06": "rejected", "a-04": "approved", "a-05": "approved"}, outs, ms)
        self.assertTrue(any("m1" in f and "상대(점원 등)가 할 말이 없어진다" in f for f in fail))
        fail, _ = R.check({"a-04": "rejected", "a-05": "approved", "a-06": "approved"}, outs, ms)
        self.assertTrue(any("대답 a-04 가 사라진다" in f for f in fail))
        fail, _ = R.check({"a-05": "rejected", "a-04": "approved", "a-06": "approved"}, outs, ms)
        self.assertTrue(any("고를 말이 없어진다" in f for f in fail))
        # 선택지 둘 다 지울 일 없는 줄만 거부해도 아직 쓰이므로 실패 (줄을 빼야 한다). 그러나 빈자리는 아니다
        outs[0]["lines"][1]["check"] = "B"
        fail, note = R.check({"a-02": "rejected"}, outs, ms)
        self.assertTrue(any("아직 쓰인다" in f for f in fail))
        self.assertFalse(any("다른 줄이 더 필요" in f for f in fail))
        self.assertTrue(any("줄만 빼면" in n for n in note))

    def test_check_passes_when_nothing_rejected(self):
        outs, ms = fake()
        fail, note = R.check({"a-04": "approved", "a-05": None, "a-06": "approved"}, outs, ms)
        self.assertEqual(fail, [])
        self.assertTrue(any("아직 정하지 않은" in n for n in note))
        fail, _ = R.check({"a-05": None}, outs, ms, strict=True)
        self.assertTrue(fail)

    def test_option_scene_needs_two(self):
        outs, ms = fake()
        fail, _ = R.check({"a-02": "rejected", "a-03": "rejected"}, outs, ms)
        self.assertTrue(any("선택이 안 된다" in f for f in fail))

    def test_real_data(self):
        outs, missions = R.load_sources()
        ids = [x["id"] for _, x, _ in R.b_lines(outs)]
        self.assertEqual(len(ids), 19)
        self.assertEqual(set(ids), set(R.NOTE), "NOTE 가 B 줄과 같아야 한다")
        # 양식은 B 줄과 같은 id, 값은 허용된 것만
        tpl = json.load(open(R.REVIEW, encoding="utf-8"))
        self.assertEqual(set(tpl), set(ids))
        self.assertTrue(all(v in (None, "approved", "rejected") for v in tpl.values()))
        # state/authored_b.md 의 B 목록과 같다
        txt = open(L.BLIST, encoding="utf-8").read()
        self.assertTrue(all("| %s |" % i in txt for i in ids))
        # 시트에 19줄이 다 있다
        with tempfile.TemporaryDirectory() as d:
            sheet = R.sheet_html(outs, missions, {})
            self.assertTrue(all(i in sheet for i in ids))
            # 다 승인하면 실패 0, 다 거부하면 빈자리 미션이 찍힌다
            allok = {i: "approved" for i in ids}
            self.assertEqual(R.check(allok, outs, missions)[0], [])
            fail, _ = R.check({i: "rejected" for i in ids}, outs, missions)
            joined = "\n".join(fail)
            for need in ("bus_fare_question", "hotel_front_desk", "ala_moana_basic_shopping", "leonards_malasadas"):
                self.assertIn("미션 %s 은 다른 줄이 더 필요하다" % need, joined)
            # 파일 쓰기: 전부 O -> 19개
            p = os.path.join(d, "out.json")
            self.assertEqual(len(R.write_approved(allok, p)), 19)
            # 시트가 양식의 기존 답을 지우지 않는다
            rv = os.path.join(d, "rv.json")
            json.dump({"hf-07": "O"}, open(rv, "w"))
            tpl2 = R.write_sheet(outs, missions, rv, os.path.join(d, "s.html"))
            self.assertEqual(tpl2["hf-07"], "approved")
            self.assertEqual(len(tpl2), 19)
            self.assertIsNone(tpl2["bs-10"])


if __name__ == "__main__":
    unittest.main()
