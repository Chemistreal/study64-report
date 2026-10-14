#!/usr/bin/env python3
"""Read-only mission coverage, short wording and long-form preservation checks."""
from pathlib import Path
import argparse,json,csv,re
def main():
 p=argparse.ArgumentParser();p.add_argument('--study',type=Path,required=True);p.add_argument('--root',type=Path,default=Path(__file__).resolve().parent);a=p.parse_args();r=a.root;s=json.loads((r/'G33_spec.json').read_text());bad=[];rows=[]
 for l in (r/'G33_situations.md').read_text().splitlines():
  if l.startswith('| '):
   c=[x.strip() for x in l.strip('|').split('|')]
   if len(c)==11 and c[1].isdigit():rows.append(c)
 catalog=[]
 for l in (a.study/'docs/outings.md').read_text().splitlines():
  c=[x.strip() for x in l.strip('|').split('|')]
  if len(c)==10 and c[1] in ['life','trip','event']:catalog.append(c)
 ids=[x[0] for x in rows];expected={x[0].strip('`'):x for x in catalog};by={x['id']:x for x in s['rows']}
 if len(rows)!=55 or set(ids)!=set(expected) or len(ids)!=len(set(ids)):bad.append('mission ID coverage')
 if len({x[6] for x in rows})!=len(rows):bad.append('duplicate situation')
 for x in rows:
  if x[0] not in by:bad.append('unknown mission '+x[0]);continue
  sentence=x[6];ref=by[x[0]]
  if len(sentence)>s['limit'] or int(x[8])!=len(sentence):bad.append('length '+x[0])
  if '\n' in sentence or not re.search(r'(요|죠|까요)[.!?]?$',sentence):bad.append('ending '+x[0])
  if re.search('[A-Za-z0-9]',sentence):bad.append('unexpected English or numeric fact '+x[0])
  if sentence!=ref['short']:bad.append('unreviewed situation '+x[0])
  if int(x[1])!=ref['session'] or x[2]!=ref['level'] or x[3]!=ref['place'] or not x[4] or not x[5] or x[-1] not in ['A','B']:bad.append('mission metadata '+x[0])
  if '두 그릇' in sentence and x[0]!='marukame_udon':bad.append('new count '+x[0])
  if '일 년' in sentence and x[0]!='diamond_head_sunrise':bad.append('new time '+x[0])
 long=(r/'G33_long_forms.md').read_text();parts=re.split(r'^## ',long,flags=re.M)[1:];ld={x.splitlines()[0]:x for x in parts}
 if set(ld)!=set(expected):bad.append('long form coverage')
 for mid,ref in by.items():
  if ref['long'] not in ld.get(mid,''):bad.append('long form changed '+mid)
  if ref['long_proposed'] and not 3<=len([x for x in re.split(r'(?<=[.!?])\s+',ref['long']) if x])<=5:bad.append('new long sentence count '+mid)
 for mid,old in s['old_situations'].items():
  if by[mid]['long']!=old:bad.append('old nine lost '+mid)
 cov=list(csv.DictReader((r/'G33_coverage.csv').open()))
 if len(cov)!=55 or {c['unit'] for c in cov}!=set(expected) or any(c['count']!='1' or c['checked']!='1' for c in cov):bad.append('coverage list')
 for e in bad:print('[FAIL]',e)
 print('G33_long: 46 original metas preserved, 9 proposed; UI wraps and has no numeric character cap')
 print('G33_check: '+str(len(rows))+' rows, '+str(len(bad))+' failures');return bool(bad)
if __name__=='__main__':raise SystemExit(main())
