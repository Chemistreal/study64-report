#!/usr/bin/env python3
"""Read-only source cross-reference, schedule and lexical evidence audit; writes task CSVs only."""
import argparse,collections,csv,datetime,json,re,sys
from pathlib import Path
sys.dont_write_bytecode=True
TASK='G25';LO,HI=49,144
TOKEN=re.compile(r"[A-Za-z]+(?:'[A-Za-z]+)*")
def tokens(s):return TOKEN.findall(s.replace('’',"'").lower())
def flatten(x):
 if isinstance(x,str):yield x
 elif isinstance(x,list):
  for y in x:yield from flatten(y)
 elif isinstance(x,dict):
  for y in x.values():yield from flatten(y)
def main():
 p=argparse.ArgumentParser();p.add_argument('--study',type=Path,required=True);p.add_argument('--data',type=Path);p.add_argument('--sessions',type=Path);p.add_argument('--out',type=Path,default=Path(__file__).resolve().parent);a=p.parse_args();root=a.study;data=a.data or root/'out/data';S=json.loads((a.sessions or root/'out/game/sessions.json').read_text());ss=S['sessions'];C={c['id']:c for c in json.loads((data/'cards.json').read_text())['items']};lectures={l['no']:l for l in json.loads((data/'lectures.json').read_text())['items']};E={x['no']:x for x in json.loads((data/'emergency.json').read_text())['items']};sets={x['id']:x for x in json.loads((data/'sets.json').read_text())['items']};index=json.loads((data/'index.json').read_text());T=json.loads((data/'transcripts.json').read_text())['items'];plans={(w['week'],d['day']):d['lecture'] for w in index['weeks'] for d in w['days']};issues=[];lex=[];rows=[];firstmedia={};cardfirst={};seenwords=set();fresh={};firstword={};heard={};allowed=set()
 for m in re.finditer(r'```\n(.*?)```',(root/'docs/wordlist.md').read_text(),re.S):allowed.update(tokens(m[1]))
 # The current consolidation layout moves six lectures into its preceding two weeks.
 # The base index and sets remain at their original dates, by derive_game's documented rule.
 currentplans=dict(plans)
 for cw in [6,18,30,42]:
  six=[]
  for ww in range(cw-2,cw+1):
   for day in range(1,7):
    value=plans[(ww,day)]
    if value not in six:six.append(value)
  if len(six)!=6:continue
  for offset in range(12):currentplans[(cw-2+offset//6,offset%6+1)]=six[offset//2]
  for day in range(1,7):currentplans[(cw,day)]=None
 for x in ss:
  n=x['s'];media=x['media'];firstmedia.setdefault(media,n);nw=set()
  if media in T:nw.update(t for line in T[media] for t in tokens(line.split(':',1)[1] if ':' in line else line))
  heard[n]=set().union(*(set(t for line in lines for t in tokens(line.split(':',1)[1] if ':' in line else line)) for m,lines in T.items() if firstmedia.get(m,9999)<=n))
  for cid in x['cards']:
   if cid not in cardfirst:
    cardfirst[cid]=n
    if cid in C:nw.update(t for text in flatten(C[cid]['a'].get('material',[])) for t in tokens(text))
  fresh[n]=nw-seenwords
  for w in fresh[n]:firstword[w]=n
  seenwords.update(nw)
 files_checked=set()
 def issue(n,obj,kind,message):issues.append({'session':n,'id':obj,'kind':kind,'problem':message,'A/B':'B'})
 for x in ss:
  n=x['s']
  if not LO<=n<=HI:continue
  start=len(issues);week=x['week'];day=x['day'];
  if x['emergency'] is not None and x['emergency'] not in E:issue(n,str(x['emergency']),'emergency','비상판 id가 없어요.')
  for cid in x.get('decks',{}).get('wall',[]):
   if cid not in C:issue(n,cid,'deck-card','벽 판의 카드 id가 없어요.')
  for cid in x['review']:
   if cardfirst.get(cid,9999)>n:issue(n,cid,'review-order','첫 카드보다 복습이 먼저 놓였어요.')
  lns=x['revisit'] if x['consolidate'] else [x['lecture']];st=sets.get(x['set'])
  if x['media'] not in T:issue(n,x['media'],'media','대본 id가 없어요.')
  if st is None:issue(n,x['set'],'set','세트 id가 없어요.')
  else:
   if sum(y['minutes'] for y in st['steps'])!=30:issue(n,x['set'],'minutes','블록 2 단계 분 합이 30과 달라요.')
   if st['week']!=week:issue(n,x['set'],'week','세트 주와 세션 주가 달라요.')
   if not x['consolidate'] and st['lecture']!=x['lecture']:issue(n,x['set'],'lecture','세트와 세션 강 연결이 달라요.')
  if not x['consolidate'] and currentplans.get((week,day))!=x['lecture']:issue(n,str(x['lecture']),'plan','현재 다지기 배치를 독립 적용한 그날 강과 달라요.')
  for no in lns or []:
   if no not in lectures:issue(n,str(no),'lecture','강 id가 없어요.');continue
   l=lectures[no]
   for path in [l['source'],l['handout']]:
    f=root/path
    if not f.exists():issue(n,path,'file','강 또는 강의록 파일이 없어요.');continue
    files_checked.add(path);text=f.read_text()
    badchars={ch for ch in text if not(ord(ch)<128 or '\uac00'<=ch<='\ud7a3' or '\u3131'<=ch<='\u318e' or ch in '‘’“”…·→°\u02bb\u0101\u0113\u012b\u014d\u016b')}
    if badchars:issue(n,path,'characters','허용 밖 문자 '+','.join('U+'+f'{ord(ch):04X}' for ch in sorted(badchars)))
    if re.search(r'(?<![가-힣])(디스|왓|하우|웨어|쓰리|파이브|굿모닝|땡큐|쏘리|플리즈|아이엠)(?![가-힣])',text):issue(n,path,'spelling','한글 음차 후보가 있어요. 원문을 직접 구별해야 해요.')
  for cid in x['cards']+x['review']:
   if cid not in C:issue(n,cid,'card','카드 id가 없어요.');continue
   if C[cid]['minutes']<=0:issue(n,cid,'minutes','카드 분이 양수가 아니에요.')
  if all(cid in C for cid in x['cards']+x['review']):
   today=sum(C[c]['minutes'] for c in x['cards']);review=sum(C[c]['minutes'] for c in x['review'])
   if today+review!=x['block3']['minutes']:issue(n,'block3','minutes','카드 분 합과 저장된 예상분이 달라요.')
   if len(x['cards'])!=x['block3']['cards'] or len(x['review'])!=x['block3']['review']:issue(n,'block3','count','저장된 카드 장수와 달라요.')
  else:today=review=0
  if x['consolidate'] and any(cardfirst[cid]==n for cid in x['cards']):issue(n,'consolidate','new','다지기에서 처음 나온 카드가 있어요.')
  if x['consolidate'] and firstmedia[x['media']]==n:issue(n,'consolidate','new','다지기에서 처음 쓰인 과가 있어요.')
  if week in [6,18,30,42] and not x['consolidate'] or x['consolidate'] and week not in [6,18,30,42]:issue(n,'consolidate','week','다지기 주의 표지가 규격과 달라요.')
  for cid in x['cards']:
   if cid not in C:continue
   words=set(t for v in flatten(C[cid]['a'].get('material',[])) for t in tokens(v));unheard=words-heard[n];notapproved=unheard-allowed
   if unheard:lex.append({'session':n,'card':cid,'unheard word forms':';'.join(sorted(unheard)),'not in wordlist':';'.join(sorted(notapproved)),'A/B':'B','meaning':'핵심 녹음에서 아직 안 들은 철자 후보이며 공식 CEFR나 미학습 확정이 아니에요.'})
  rows.append({'session':n,'week':week,'quarter':x['quarter'],'lecture':';'.join(map(str,lns or [])),'set':x['set'],'card ids':';'.join(x['cards']),'review ids':';'.join(x['review']),'minutes':90+today+review,'block3 minutes':today+review,'new word forms':len(fresh[n]),'checks run':'refs;index-plan;set-minutes;media;cards;block3;consolidation;source-characters;lexical-evidence','problems found':len(issues)-start,'severity':'검토' if len(issues)>start else '-','CEFR grading':'not computable for whole core vocabulary'})
 for b in S['blocks']:
  if b['no']==3:
   if b['minutes'] is not None or b['clock'] is not False:issue(LO,'blocks3','clock','현재 블록 3에 시간 상한이 생겼어요.')
  elif b['minutes']!={1:40,2:30,4:20}[b['no']]:issue(LO,'blocks'+str(b['no']),'clock','고정 블록 분이 달라요.')
 if len(rows)!=HI-LO+1:issue(LO,'sessions','count','범위의 세션 수가 달라요.')
 a.out.mkdir(parents=True,exist_ok=True)
 manualpath=a.out/(TASK+'_findings.csv');manual=list(csv.DictReader(manualpath.open())) if manualpath.exists() else []
 for row in rows:
  n=row['session'];m=sum(str(n) in f['session'].split(';') and f['kind']!='schedule' for f in manual)
  row['mechanical problems']=row['problems found'];row['manual finding rows']=m
  row['problems found']=row['problems found']+m
  row['severity']='B 검토' if row['problems found'] else '-'
  row['actual mission band']='A1' if n<=50 else 'A2' if n<=100 else 'B1' if n<=200 else 'B2'
 def write(name,rr,cols):
  with (a.out/name).open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=cols,lineterminator='\n');w.writeheader();w.writerows(rr)
 write(TASK+'_session_table.csv',rows,list(rows[0]));write(TASK+'_mechanical_findings.csv',issues,['session','id','kind','problem','A/B']);write(TASK+'_lexical_candidates.csv',lex,['session','card','unheard word forms','not in wordlist','A/B','meaning']);(a.out/(TASK+'_mechanical_summary.json')).write_text(json.dumps({'range':[LO,HI],'sessions':len(rows),'source_files_checked':sorted(files_checked),'problems':issues,'lexical_candidate_rows':len(lex),'all_new_word_forms':len(firstword)},ensure_ascii=False,indent=2)+'\n')
 for issue in issues:print('[FINDING]',issue['session'],issue['id'],issue['kind'],issue['problem'])
 print(TASK+'_lexical: '+str(len(lex))+' card-session candidates; wordlist has no CEFR grades, actual teaching depth not computable')
 print(TASK+'_checker: '+str(len(rows))+' sessions, '+str(len(issues))+' problems');return bool(issues)
if __name__=='__main__':raise SystemExit(main())
