#!/usr/bin/env python3
"""Read-only review coverage and replacement gate. Semantic judgments remain human-reviewable."""
from pathlib import Path
import argparse,csv,json,re,sys,copy
sys.dont_write_bytecode=True
TASK='G23'
def table(path,n):
 rows=[]
 for line in path.read_text().splitlines():
  if line.startswith('| ') and not line.startswith('| id '):
   c=[v.strip() for v in line.strip('|').split('|')]
   if len(c)==n:rows.append(c)
 return rows
def main():
 p=argparse.ArgumentParser();p.add_argument('--root',type=Path,default=Path(__file__).resolve().parent);p.add_argument('--study',type=Path,required=True);a=p.parse_args();sys.path.insert(0,str(a.study/'scripts'));import authored_lib as L
 spec=json.loads((a.root/f'{TASK}_spec.json').read_text());expected={x['id']:x for x in spec['rows']};bad=[]
 review=table(a.root/f'{TASK}_review.md',7);prop=table(a.root/f'{TASK}_proposals.md',5);gloss=table(a.root/f'{TASK}_gloss_review.md',6)
 def index(rows,label):
  d={}
  for r in rows:
   if r[0] in d:bad.append(label+' duplicate '+r[0])
   d[r[0]]=r
  return d
 rev=index(review,'review');pr=index(prop,'proposal');ko=index(gloss,'gloss')
 if set(rev)!=set(expected):bad.append('review coverage mismatch')
 if set(ko)!=set(expected):bad.append('gloss coverage mismatch')
 changes={r[0] for r in review if r[2]=='change'}
 if changes!=set(pr):bad.append('change/proposal mismatch')
 for ident,r in rev.items():
  orig=expected.get(ident)
  if not orig:bad.append('unknown ID '+ident);continue
  if r[1]!=orig['english']:bad.append('source English mismatch '+ident)
  if r[2] not in ['ok','change','unsure'] or r[5] not in ['A','B'] or r[6] in ['','-']:bad.append('invalid judgment '+ident)
  if r[2]=='change':
   x=pr.get(ident)
   if not x or x[1]!=r[4] or r[4] in ['','-'] or x[2]!='-' or x[3]!=r[5] or x[4] in ['','-']:bad.append('invalid proposal '+ident)
 for ident,r in ko.items():
  if ident not in expected:continue
  if r[1]!=spec['gloss'][ident] or r[2] not in ['ok','change'] or r[4] not in ['A','B'] or not re.search('[가-힣]',r[3]) or r[5] in ['','-']:bad.append('invalid gloss '+ident)
  if re.findall(r'\{[^}]+\}',r[3])!=re.findall(r'\{[^}]+\}',expected[ident]['english']):bad.append('gloss name slots '+ident)
  if r[2]=='ok' and r[1]!=r[3] or r[2]=='change' and r[1]==r[3]:bad.append('gloss verdict '+ident)
  # Names are retained only where the original gloss already contained them.
  oldletters=re.findall('[A-Za-z]+',re.sub(r'\{[^}]+\}','',r[1]));newletters=re.findall('[A-Za-z]+',re.sub(r'\{[^}]+\}','',r[3]))
  if any(w not in oldletters for w in newletters):bad.append('new Latin in Korean '+ident)
 cov=list(csv.DictReader((a.root/f'{TASK}_coverage.csv').open()));wanted={o['id']:len(o['lines'])+len(o['practice']) for o in spec['chapters']}
 if len(cov)!=len(wanted) or {c['unit'] for c in cov}!=set(wanted):bad.append('coverage units')
 for c in cov:
  rr=[r for ident,r in rev.items() if expected.get(ident,{}).get('mission')==c['unit']]
  if int(c['count'])!=wanted.get(c['unit']) or int(c['checked'])!=len(rr) or int(c['checked'])!=int(c['count']):bad.append('coverage counts '+c['unit'])
  if int(c['problems'])!=sum(r[2]!='ok' for r in rr) or int(c['proposed'])!=sum(r[2]=='change' for r in rr):bad.append('coverage verdict counts '+c['unit'])
 words,dup=L.load_words();bad+=dup
 for f in (a.study/'docs/parts').glob('*authored_words*.md'):
  for m in re.finditer(r'```(A1|A2|B1|B2)\n(.*?)```',f.read_text(),re.S):
   for w in re.findall(r"[A-Za-z']+",m[2]):words.setdefault(L.stem(w.lower()),m[1])
 sessions=json.loads((a.study/'out/game/sessions.json').read_text())['sessions']
 for o in copy.deepcopy(spec['chapters']):
  for line in o['lines']:
   if line['id'] in pr:line['say']=pr[line['id']][1];line['check']=pr[line['id']][3];line['why']=pr[line['id']][4]
  for item in o['practice']:
   if item['id'] in pr:item['say']=pr[item['id']][1]
  bad+=L.line_problems(o,words,sessions)[0]+L.flow_problems(o)+L.structure_problems(o)[0]
  by={l['id']:l for l in o['lines']}
  for item in o['practice']:
   if item['say']!=by[item['line']]['say']:bad.append('practice source mismatch '+item['id'])
 if TASK in ['G22','G23']:
  facts=list(csv.DictReader((a.root/f'{TASK}_facts_check_KO.csv').open()));source=spec['facts'];key=lambda r:(r['mission'],r['item_id'],r['claim English'])
  if {key(r) for r in source}!={key(r) for r in facts if r['source']=='parent'}:bad.append('facts coverage mismatch')
  for r in facts:
   if r['A/B'] not in ['A','B'] or not r['reason'] or r['A/B']=='A' and r['support']=='unverified':bad.append('unsupported fact '+r['item_id'])
 for e in bad:print('[FAIL]',e)
 print(f'{TASK}_check: {len(review)} rows, {len(bad)} failures');return bool(bad)
if __name__=='__main__':sys.exit(main())
