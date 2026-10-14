#!/usr/bin/env python3
"""Read-only per-chapter gates, finite path walk, ID/function preservation and gloss completeness."""
import argparse,csv,json,re,sys
from pathlib import Path
sys.dont_write_bytecode=True
ORDER='diamond_head_lookout diamond_head_hike surf_lesson hanauma_bay_snorkel iolani_palace_tour kamehameha_statue_walk pearl_harbor_visit north_shore_shrimp_truck sunset_beach_day aloha_festival_parade hula_show'.split()

def walk(o,L):
 turns=o['turns'];by={l['id']:l for l in o['lines']};branch=L.branch_map(o['meta']);resume,_=L.parse_resume(o['meta']);skips,_=L.parse_skip(o['meta']);res={(t,tr):ans for t,tr,ans in resume};idx={t['id']:i for i,t in enumerate(turns)};reached=set();dead=[];paths=0
 def dfs(i,answers):
  nonlocal paths
  if i==len(turns):paths+=1;return
  t=turns[i]
  if any(idx.get(fr,-1)<=i<=idx.get(to,-1) and all(answers.get(ct)==cp for ct,cp in conds) for fr,to,conds in skips):dfs(i+1,answers);return
  for n in t['npc'].split('+'):
   if n!='-':
    if n not in by:dead.append(t['id']+' missing NPC '+n);return
    reached.add(n)
  picks=t['pick'].split('/') if t['pick']!='-' else ['-']
  for pick in picks:
   if pick!='-' and (pick not in by or by[pick]['kind']=='npc'):dead.append(t['id']+' bad pick '+pick);continue
   if pick!='-':reached.add(pick)
   if pick in branch:
    if branch[pick] not in by or by[branch[pick]]['kind']!='npc':dead.append('bad branch '+pick);continue
    reached.add(branch[pick])
   finals=res.get((t['id'],pick),[pick])
   for final in finals:
    if final!=pick:
     if final not in by:dead.append('missing resume answer '+final);continue
     reached.add(final)
     if final in branch:reached.add(branch[final])
    dfs(i+1,{**answers,t['id']:final})
 dfs(0,{})
 for missing in set(by)-reached:dead.append('unreachable '+missing)
 if paths==0:dead.append('no complete path')
 return paths,len(reached),dead

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--study',type=Path,required=True);p.add_argument('--root',type=Path,default=Path(__file__).resolve().parent);a=p.parse_args();sys.path.insert(0,str(a.study/'scripts'));import authored_lib as L
 now,bad=L.parse_lines(str(a.root/'G18_authored_lines_v2.md'));before,_=L.parse_lines(str(a.study/'docs/parts/G3_authored_lines.md'));bad=list(bad);old={o['id']:o for o in before};table,dup=L.load_words();bad+=dup
 for f in [a.study/'docs/parts/G2_authored_words.md',a.study/'docs/parts/G5_authored_words.md',a.root/'G18_authored_words_v2.md']:
  for m in re.finditer(r'```(A1|A2|B1|B2)\n(.*?)```',f.read_text(),re.S):
   for w in re.findall(r"[A-Za-z']+",m[2]):
    st=L.stem(w.lower())
    if st in table and table[st]!=m[1]:bad.append('conflicting word grade '+w)
    table.setdefault(st,m[1])
 S=json.loads((a.study/'out/game/sessions.json').read_text())['sessions'];ids=[];rows=0;paths=0;newcount=0
 if [o['id'] for o in now]!=ORDER:bad.append('chapter order differs')
 gloss={}
 for line in (a.root/'G18_gloss_proposals_KO.md').read_text().splitlines():
  if line.startswith('| ') and not line.startswith(('| id ','|---')):
   c=[v.strip() for v in line.strip('|').split('|')]
   if len(c)==4:
    if c[0] in gloss:bad.append('duplicate gloss '+c[0])
    gloss[c[0]]=c
 wanted=set()
 original='\n'.join(f.read_text() for f in [a.study/'docs/authored_lines.md']+list((a.study/'docs/parts').glob('*.md')))
 for o in now:
  ref=old.get(o['id'])
  if ref is None:bad.append('not an owned chapter '+o['id']);continue
  orig={l['id']:l for l in ref['lines']};curr={l['id']:l for l in o['lines']};removed=set(orig)-set(curr)
  if removed:bad.append('removed '+str(sorted(removed)))
  for i in set(orig)&set(curr):
   if orig[i]['fn']!=curr[i]['fn']:bad.append('changed function '+i)
   if orig[i]['say']!=curr[i]['say']:bad.append('unexpected English change '+i)
  for i in set(curr)-set(orig):
   newcount+=1
   if re.search(r'(?<![a-z0-9-])'+re.escape(i)+r'(?![a-z0-9-])',original):bad.append('new ID collision '+i)
  if o['meta'].get('세션')!=ref['meta'].get('세션') or o['meta'].get('목표 등급')!=ref['meta'].get('목표 등급'):bad.append('changed unlock/target '+o['id'])
  if not o['meta'].get('상황'):bad.append('missing situation '+o['id'])
  bad+=L.line_problems(o,table,S)[0]+L.flow_problems(o)+L.structure_problems(o)[0]
  n,reach,f=walk(o,L);paths+=n;bad+=f
  for l in o['lines']:
   ids.append(l['id']);wanted.add(l['id']);rows+=1
   if int(o['meta']['세션'])>50 and l['ko']!='-':bad.append('later active gloss '+l['id'])
   if int(o['meta']['세션'])<=50 and (l['ko']=='-' or not re.search('[가-힣]',l['ko']) or re.search('[A-Za-z]',re.sub(r'\{[^}]+\}','',l['ko']))):bad.append('missing/Latin early gloss '+l['id'])
   c=gloss.get(l['id'])
   if not c or c[1]!=l['say'] or not re.search('[가-힣]',c[2]) or c[3] not in ['A','B']:bad.append('missing/mismatched gloss '+l['id'])
   elif re.findall(r'\{[^}]+\}',c[1])!=re.findall(r'\{[^}]+\}',c[2]):bad.append('gloss name slot changed '+l['id'])
  for pr in o['practice']:
   wanted.add(pr['id']);ids.append(pr['id']);c=gloss.get(pr['id']);ln=curr.get(pr['line'])
   if not ln or pr['say']!=ln['say'] or (int(o['meta']['세션'])>50 and pr['ko']!='-') or (int(o['meta']['세션'])<=50 and pr['ko']!=ln['ko']):bad.append('practice relation '+pr['id'])
   if not c or c[1]!=pr['say'] or not re.search('[가-힣]',c[2]):bad.append('practice gloss '+pr['id'])
  print('G18_mission: '+o['id']+' lines='+str(len(o['lines']))+' seats='+str(L.seat_counts(o))+' paths='+str(n)+' reachable='+str(reach))
 facts=list(csv.DictReader((a.root/'G18_facts_KO.csv').open(encoding='utf-8',newline='')))
 by={(o['id'],l['id']):l for o in now for l in o['lines']}
 for o in now:
  for i,text in enumerate(re.split(r'(?<=[.!?])\s+',o['meta']['상황']),1):by[(o['id'],'meta-situation-'+str(i))]={'say':text.strip(),'kind':'meta','check':'B'}
 seenfacts=set()
 for row in facts:
  key=(row['chapter'],row['line id']);line=by.get(key)
  if key in seenfacts:bad.append('duplicate fact row '+str(key))
  seenfacts.add(key)
  if not line or line['say'] not in row['claim']:bad.append('fact source differs '+str(key))
  if row['confidence A/B']!='B' or not row['general knowledge you rely on']:bad.append('unsupported fact confidence '+str(key))
  if line and line['kind']=='npc' and '?' not in line['say'] and line['check']!='B':bad.append('unsupported NPC fact should be B '+str(key))
 print('G18_facts: %d candidate statements/questions, all B'%(len(facts)))
 if len(ids)!=len(set(ids)):bad.append('duplicate line/practice id')
 if set(gloss)!=wanted:bad.append('gloss coverage mismatch')
 for x in bad:print('[FAIL] '+x)
 print('G18_walk: %d finite paths, %d new lines, %d glosses'%(paths,newcount,len(gloss)))
 print('G18_check: %d rows, %d failures'%(rows,len(bad)));return bool(bad)
if __name__=='__main__':sys.exit(main())
