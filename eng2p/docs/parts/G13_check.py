#!/usr/bin/env python3
"""Read-only free-talk checks; does not add free chapters to the mission-only parser."""
import argparse,csv,json,re,sys
from pathlib import Path
sys.dont_write_bytecode=True
COLS=['id','scene','kind','person','en','level','function','check','reason','ko']
def table_rows(root):
 rows=[]
 for f in sorted(root.glob('G13_free_lines_*.md')):
  for line in f.read_text(encoding='utf-8').splitlines():
   if line.startswith('| ft-'):
    cells=[x.strip() for x in line.strip('|').split('|')]
    if len(cells)!=10:raise ValueError('bad cells: '+str(f))
    r=dict(zip(COLS,cells));r['file']=str(f);rows.append(r)
 return rows

def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--study',type=Path,required=True,help='eng2p root, with its original transcripts available');ap.add_argument('--root',type=Path,default=Path(__file__).resolve().parent);a=ap.parse_args();sys.path.insert(0,str(a.study/'scripts'));import authored_lib as L
 spec=json.loads((a.root/'G13_spec.json').read_text());people={p['name']:p for p in spec['people']};rows=table_rows(a.root);bad=[]
 def fail(s):bad.append(s)
 grades,dups=L.load_words()
 # These are existing supplement grades, never overwritten to make a new line pass.
 for f in [a.study/'docs/parts'/('G'+n+'_authored_words.md') for n in ['2','3','5']]+[a.root/'G13_free_words.md']:
  for m in re.finditer(r'```(A1|A2|B1|B2)\n(.*?)```',f.read_text(encoding='utf-8'),re.S):
   for w in re.findall(r"[A-Za-z']+",m[2]):
    st=L.stem(w.lower())
    if st in grades and grades[st]!=m[1]:fail('conflicting grade '+w)
    grades.setdefault(st,m[1])
 for s in dups:fail('original grade duplicate '+s)
 ids=[r['id'] for r in rows]
 if len(ids)!=len(set(ids)):fail('duplicate new ids')
 original_files=[a.study/'docs/authored_lines.md']+list((a.study/'docs/parts').glob('*'))
 original='\n'.join(f.read_text(encoding='utf-8') for f in original_files if f.is_file() and f.suffix in ['.md','.csv','.py','.json'])
 enpeople={};quarter_counts={};max_new=0
 for r in rows:
  n=r['person'];p=people.get(n)
  if p is None:fail(r['id']+' unknown speaker');continue
  if not re.fullmatch('ft-'+p['prefix']+'-[0-9]{3}',r['id']):fail(r['id']+' id format')
  if re.search(r'(?<![A-Za-z0-9-])'+re.escape(r['id'])+r'(?![A-Za-z0-9-])',original):fail(r['id']+' already used in repository')
  m=re.fullmatch(r'(greet|meet|place-[a-z_]+)\.Q([1-4])',r['scene'])
  if not m:fail(r['id']+' scene format');continue
  kind='place' if m[1].startswith('place-') else m[1];q=int(m[2]);quarter_counts.setdefault(n,{}).setdefault(q,{}).setdefault(kind,0);quarter_counts[n][q][kind]+=1
  if q not in p['quarters']:fail(r['id']+' absent quarter')
  if kind=='place' and m[1][6:] not in spec['allowed_places']:fail(r['id']+' place alias')
  if r['level'] not in L.LV or L.LV[r['level']]>q-1:fail(r['id']+' line grade');continue
  if r['kind'] not in ['npc','option'] or r['check'] not in ['A','B']:fail(r['id']+' kind/check')
  if r['check']=='B' and not r['reason'].strip('- '):fail(r['id']+' B without reason')
  if q==1 and (not re.search('[가-힣]',r['ko']) or re.search('[A-Za-z]',r['ko'])):fail(r['id']+' missing Korean or Latin in Korean')
  if q!=1 and r['ko']!='-':fail(r['id']+' later Korean must be dash')
  if q==1 and len(r['ko'])>70:fail(r['id']+' Korean too long')
  toks=L.tokens(r['en']);lv=r['level'];cap=L.CAP[lv];session=max(1+(q-1)*72,p['earliest_session']);heard=L.heard_vocab(session)
  new=list(dict.fromkeys(w for w in toks if L.stem(w) not in heard));max_new=max(max_new,len(new))
  if len(new)>L.NEW_PER_LINE[lv]:fail(r['id']+' new '+str(len(new))+' '+','.join(new))
  if len(toks)>cap['words']:fail(r['id']+' word count '+str(len(toks)))
  if len([x for x in re.split(r'(?<=[.!?])\s+',r['en']) if x])>cap['sents']:fail(r['id']+' sentence count')
  if r['en'].count(',')>cap['commas'] or sum(t in L.CONJ for t in toks)>cap['conj']:fail(r['id']+' complexity')
  stretch=[]
  for w in toks:
   g=grades.get(L.stem(w))
   if g is None:fail(r['id']+' ungraded '+w);continue
   if q==1 and L.LV[g]>0:fail(r['id']+' Q1 above A1 '+w+':'+g)
   elif q!=1 and L.stem(w) not in heard:
    if L.LV[g]>L.LV[lv]+1:fail(r['id']+' grade too high '+w)
    elif L.LV[g]==L.LV[lv]+1:stretch.append(w)
  if len(stretch)>1:fail(r['id']+' multiple stretch words')
  if set(toks)&L.INVENTED:fail(r['id']+' invented spelling/slang')
  if q<3 and re.search(r'\b(?:jobs?|coworkers?|at work|work day)\b',r['en'],re.I):fail(r['id']+' early work')
  if q<4 and re.search(r'\b(?:rent|landlord|new house|roommates?|apartments?)\b',r['en'],re.I):fail(r['id']+' early house')
  enpeople.setdefault(r['en'],set()).add(n)
 for en,names in enpeople.items():
  if len(names)>1 and en not in spec['deliberate_shared_greetings']:fail('duplicate across people: '+en)
 for n,p in people.items():
  rr=[r for r in rows if r['person']==n];count=len(rr)
  if not 40<=count<=60:fail(n+' count '+str(count))
  if sum(r['kind']=='option' for r in rr)>count*.2:fail(n+' too many options')
  if sum(bool(re.search(r'\{[AB]\}',r['en'])) for r in rr)>count*.1:fail(n+' too many name slots')
  for q in p['quarters']:
   if set(quarter_counts.get(n,{}).get(q,{}))!={'greet','meet','place'}:fail(n+' missing kind in Q'+str(q))
  print('G13_person: '+n+' '+str(count)+' '+json.dumps(quarter_counts.get(n,{}),ensure_ascii=False,sort_keys=True))
 for s in bad:print('[FAIL] '+s)
 print('G13_limits: %d people, %d lines, maximum new tokens %d'%(len(people),len(rows),max_new))
 print('G13_check: %d rows, %d failures'%(len(rows),len(bad)));return bool(bad)
if __name__=='__main__':sys.exit(main())
