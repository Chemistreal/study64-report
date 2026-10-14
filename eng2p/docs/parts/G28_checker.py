#!/usr/bin/env python3
"""Read-only additional card-content checks. No source files or existing gates are changed."""
import argparse,collections,csv,json,re,sys
from pathlib import Path
sys.dont_write_bytecode=True
TOKEN=re.compile(r"[A-Za-z]+(?:['’][A-Za-z]+)*")
def tokens(s):return [x.lower().replace('’',"'") for x in TOKEN.findall(s)]
def flat(x):
 if isinstance(x,str):yield x
 elif isinstance(x,list):
  for v in x:yield from flat(v)
 elif isinstance(x,dict):
  for v in x.values():yield from flat(v)
def write(p,rows,cols):
 with p.open('w',encoding='utf-8',newline='') as f:
  w=csv.DictWriter(f,fieldnames=cols,lineterminator='\n');w.writeheader();w.writerows(rows)
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--study',type=Path,required=True);ap.add_argument('--cards',type=Path);ap.add_argument('--out',type=Path,required=True);a=ap.parse_args();root=a.study;a.out.mkdir(parents=True,exist_ok=True)
 obj=json.loads((a.cards or root/'out/data/cards.json').read_text());cards=obj['items'];issues=[];checks=[];wordrows=[];dups=[];near=[]
 def issue(cid,face,field,kind,message):issues.append({'card':cid,'face':face,'field':field,'kind':kind,'problem':message,'A/B':'B'})
 expected={f'Q{q}-{n:03d}' for q in range(1,5) for n in range(1,151)};ids=[c['id'] for c in cards]
 for cid in sorted(expected-set(ids)):issue(cid,'both','id','coverage','필수 카드 id가 없다.')
 for cid,n in collections.Counter(ids).items():
  if n!=1 or cid not in expected:issue(cid,'both','id','coverage','카드 id가 중복되거나 허용 범위 밖이다.')
 ss=json.loads((root/'out/game/sessions.json').read_text());first={};mediafirst={}
 for s in ss['sessions']:
  mediafirst.setdefault(s['media'],s['s'])
  for cid in s['cards']:first.setdefault(cid,s['s'])
 tr=json.loads((root/'out/data/transcripts.json').read_text())['items'];wordfirst={}
 for mid,lines in tr.items():
  for line in lines:
   spoken=line.split(':',1)[1] if ':' in line else line
   for word in tokens(spoken):wordfirst[word]=min(wordfirst.get(word,9999),mediafirst.get(mid,9999))
 approved=set()
 for block in re.findall(r'```\n(.*?)```',(root/'docs/wordlist.md').read_text(),re.S):approved.update(tokens(block))
 # wordlist gives an approved list, not a complete CEFR mapping. Record every form, never fabricate grades.
 materials=collections.defaultdict(list)
 for c in cards:
  cid=c['id'];start=len(issues);aa=c.get('a',{});bb=c.get('b',{});m=aa.get('material',[])
  for face in ['a','b']:
   x=c.get(face,{})
   if not isinstance(x,dict):issue(cid,face,'face','structure','면이 객체가 아니다.');continue
   if not re.search('[가-힣]',x.get('instruction','')):issue(cid,face,'instruction','instruction','한국어 수행 지시가 없다.')
   if not x.get('pass'):issue(cid,face,'pass','pass','성공 기준이 없다.')
   for field,text in x.items():
    if not isinstance(text,str):continue
    for hit in re.finditer(r'(\d+)\s*(?:개|쌍|번|문항|판)?\s*중\s*(\d+)\s*(?:개|쌍|번|문항|판)',text):
     total,need=map(int,hit.groups())
     if need>total:issue(cid,face,field,'unreachable',f'통과 수 {need}가 시행 수 {total}보다 크다.')
  if not isinstance(c.get('minutes'),(int,float)) or c['minutes']<=0:issue(cid,'both','minutes','minutes','카드 예상 분이 양수가 아니다.')
  # Small exact, context-independent rule domains only: original word counts and explicit l position.
  answer=aa.get('answer','');method='manual/context/audio'
  if re.match(r'(줄어들기 전 )?낱말 수는',answer) and m and all(isinstance(x,str) and '/' not in x for x in m):
   vals=[int(v) for v in re.findall(r'\d+\)\s*(\d+)',answer)]
   got=[len(re.findall(r"[A-Za-z]+(?:\.[A-Za-z]+)+\.?|[A-Za-z]+(?:['’][A-Za-z]+)*",x)) for x in m]
   if len(vals)==len(m):
    method='exact original word count'
    if vals!=got:issue(cid,'a','answer','answer-key',f'원형 낱말 수 정답 {vals}와 재료의 계산 {got}이 다르다.')
  if '살아남는 낱말' in aa.get('pass','') and re.match(r'1\)',answer) and m:
   portions=re.split(r'\d+\)',answer)[1:]
   if len(portions)==len(m):
    method='answer words present in material; stress needs target audio'
    for i,(part,line) in enumerate(zip(portions,m)):
     if not set(tokens(part)).issubset(set(tokens(line))):issue(cid,'a','answer','answer-key',f'{i+1}번의 정답 낱말이 재료 문장에 없다.')
  if '모두 l 이 낱말 끝' in answer and m:
   method='explicit final l spelling (audio unverified)'
   if any(not tokens(x) or not tokens(x)[0].endswith('l') for x in m):issue(cid,'a','answer','answer-key','모두 마지막 l 이라는 정답과 재료 철자가 다르다.')
  # Five repeated monologue trials create a lower bound, not a block-3 deadline.
  rules=' '.join([aa.get('instruction',''),aa.get('pass',''),bb.get('pass','')])
  dur=re.search(r'(\d+)초를?\s*채우',rules)
  if re.search(r'다섯\s*번\s*중',rules) and dur:
   minimum=5*int(dur.group(1))/60
   if minimum>c['minutes']:issue(cid,'both','minutes','time-estimate',f'다섯 시행의 발화만 최소 {minimum:.3f}분으로 예상 {c["minutes"]}분보다 길다. 현재 3블록 상한은 없다.')
  for i,line in enumerate(m if isinstance(m,list) else []):
   if re.search('[A-Za-z]',line):materials[(c['quarter'],' '.join(tokens(line)))].append((cid,i+1,line))
  allenglish=set(t for s in flat({k:v for k,v in c.items() if k in ['a','b']}) for t in tokens(s))
  for w in sorted(allenglish):wordrows.append({'card':cid,'quarter':c['quarter'],'word form':w,'approved wordlist':str(w in approved),'core first heard session':wordfirst.get(w,''),'card first session':first.get(cid,''),'core heard before card':str(wordfirst.get(w,9999)<=first.get(cid,-1)),'official CEFR':'not computable: no full CEFR mapping','A/B':'B'})
  checks.append({'card':cid,'type':c['type'],'quarter':c['quarter'],'a checked':'yes','b checked':'yes','answer method':method,'English forms':len(allenglish),'mechanical problems':len(issues)-start})
 for (q,norm),rows in materials.items():
  distinct=sorted(set(r[0] for r in rows))
  if len(distinct)>1:dups.append({'quarter':q,'cards':';'.join(distinct),'material':rows[0][2],'kind':'exact lexical material','judgment':'B 의도적 반복/다른 목표 여부를 함께 검토한다.'})
 # One substituted lexical form, same length, same quarter. Group by masked signature.
 masked=collections.defaultdict(list)
 for (q,norm),rows in materials.items():
  words=norm.split()
  if 2<=len(words)<=30:
   for i in range(len(words)):masked[(q,tuple(words[:i]+['*']+words[i+1:]))].append((norm,rows))
 seen=set()
 for (q,sig),groups in masked.items():
  if len(groups)<2:continue
  for i,(left,lr) in enumerate(groups):
   for right,rr in groups[i+1:]:
    key=(q,min(left,right),max(left,right))
    if key in seen or left==right:continue
    lc=sorted(set(x[0] for x in lr));rc=sorted(set(x[0] for x in rr))
    if set(lc)==set(rc):continue
    seen.add(key);near.append({'quarter':q,'left cards':';'.join(lc),'right cards':';'.join(rc),'left material':lr[0][2],'right material':rr[0][2],'kind':'one lexical substitution','judgment':'B 목표 대조나 의도적 반복일 수 있다.'})
 # Current sessions supersede legacy playblocks' 30-minute explanatory table.
 legacy=next(b for b in json.loads((root/'out/data/playblocks.json').read_text())['blocks'] if b['no']==3);current=next(b for b in ss['blocks'] if b['no']==3)
 if current['minutes'] is not None or current['clock'] is not False:issue('ALL','both','block3','clock','현재 3블록에 상한/타이머가 있다.')
 C={c['id']:c for c in cards}
 for s in ss['sessions']:
  allids=s['cards']+s['review']
  if all(cid in C for cid in allids) and sum(C[cid]['minutes'] for cid in allids)!=s['block3']['minutes']:issue(str(s['s']),'both','block3','minutes','세션의 예상 분 합과 카드 분 합이 다르다.')
 write(a.out/'G28_mechanical.csv',issues,['card','face','field','kind','problem','A/B']);write(a.out/'G28_checks.csv',checks,list(checks[0]));write(a.out/'G28_words.csv',wordrows,list(wordrows[0]));write(a.out/'G28_duplicates.csv',dups,['quarter','cards','material','kind','judgment']);write(a.out/'G28_near_duplicates.csv',near,['quarter','left cards','right cards','left material','right material','kind','judgment'])
 manualpath=Path(__file__).with_name('G28_proposals.csv');manual=list(csv.DictReader(manualpath.open(encoding='utf-8'))) if manualpath.exists() else []
 summary={'cards':len(cards),'faces':len(cards)*2,'mechanical problems':len(issues),'manual B proposal rows':len(manual),'exact material groups':len(dups),'near material pairs':len(near),'word rows':len(wordrows),'official CEFR':'not computable','legacy block3 minutes':legacy['minutes'],'current block3 minutes':current['minutes'],'audio':'not run','problems':issues}
 (a.out/'G28_summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(f'G28_checker: {len(cards)} cards, {len(issues)+len(manual)} problems');return 1 if issues or manual else 0
if __name__=='__main__':sys.exit(main())
