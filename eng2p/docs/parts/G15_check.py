#!/usr/bin/env python3
"""Read-only output coverage and arithmetic consistency checks."""
from pathlib import Path
import argparse,csv,json,re
def main():
 a=argparse.ArgumentParser();a.add_argument('--root',type=Path,default=Path(__file__).resolve().parent);p=a.parse_args().root;r=list(csv.DictReader((p/'G15_tables.csv').open()));s=json.loads((p/'G15_summary.json').read_text());bad=[]
 if len(r)!=240 or [int(x['session']) for x in r]!=list(range(49,289)):bad.append('session coverage')
 for x in r:
  n=x['session']
  if int(x['new_words'])!=sum(int(x[k]) for k in ['new_A1','new_A2','new_B1','new_B2','new_ungraded']):bad.append('grade sum '+n)
  if int(x['block3_minutes'])!=int(x['today_minutes'])+int(x['review_minutes']):bad.append('minutes sum '+n)
  if int(x['day_expected_minutes'])!=90+int(x['block3_minutes']):bad.append('day sum '+n)
  if x['capacity_minutes']!='unlimited' or x['current_overflow']!='0':bad.append('obsolete time cap '+n)
  if x['consolidate']=='1' and (int(x['new_card_count']) or int(x['new_words'])):bad.append('consolidation '+n)
 cov=list(csv.DictReader((p/'G15_coverage.csv').open()))
 if len(cov)!=240 or {x['unit'] for x in cov}!={x['session'] for x in r} or any(x['count']!=x['checked'] or x['count']!='1' for x in cov):bad.append('coverage list')
 if s['legacy_over30']!=209 or s['current_overflow']!=0 or s['block3_sum']!=20460 or s['nominal_schedule_mismatches']:bad.append('summary math')
 if s['seconds']>=120:bad.append('audit runtime')
 for fn in ['G15_curve_audit.md','G15_fixes.md']:
  txt=(p/fn).read_text();rows=[l for l in txt.splitlines() if re.match(r'\| [0-9]+\.[a-e] ',l)]
  if len(rows)!=len(s['problems']):bad.append('range coverage '+fn)
 for e in bad:print('[FAIL]',e)
 print('G15_check: '+str(len(r))+' rows, '+str(len(bad))+' failures');return bool(bad)
if __name__=='__main__':raise SystemExit(main())
