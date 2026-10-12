#!/usr/bin/env python3
"""Read-only audit of authored mission tables. Python 3, standard library only.

Usage: python3 G10_audit.py --study-root /path/to/study/eng2p --output /tmp/audit.json
       python3 G10_audit.py --selftest
Findings do not cause exit 1 unless --strict is passed. This script does not
certify meanings, prices, scene actions, native usage or real-player balance.
The runtime advances to the next turn after one optional branch NPC response;
line IDs reused in later turns therefore are not graph cycles.
"""
import argparse,copy,json,re,hashlib
from pathlib import Path
from collections import Counter,defaultdict

def rows(text,n):
 out=[]
 for s in text.splitlines():
  if not s.startswith('|'):continue
  c=[x.strip() for x in re.split(r'(?<!\\)\|',s)[1:-1]]
  if len(c)==n and c and c[0]!='id' and re.fullmatch(r'[a-z][a-z0-9-]*',c[0]):out.append(c)
 return out

def parse(text,source):
 out=[]
 for m in re.finditer(r'^## 나들이: (\S+)\n(.*?)(?=^## 나들이: |\Z)',text,re.M|re.S):
  body=m[2];head=body.split('\n|',1)[0]
  a,*rest=body.split('### 연습할 말',1);pr=rest[0] if rest else ''
  pr,*rest=pr.split('### 미니게임 차례',1);tu=rest[0] if rest else ''
  out.append({'id':m[1],'source':source,'meta':dict(re.findall(r'^(작성자|장소|세션|목표 등급|할 일|허용 이름|갈래): (.*)$',head,re.M)),
   'lines':[dict(zip(('id','scene','kind','who','say','cefr','fn','check','why','ko'),c)) for c in rows(a,10)],
   'practice':[dict(zip(('id','say','fn','line','ko'),c)) for c in rows(pr,5)],
   'turns':[dict(zip(('id','scene','npc','pick','seat'),c)) for c in rows(tu,5)]})
 return out

def tokens(text):
 text=re.sub(r'\{[^}]*\}',' ',text.replace('’',"'"))
 return [w.lower() for w in re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)*",text)]

def stem(w):
 if w in ("can't",'cannot'):w='can'
 elif w=="won't":w='will'
 else:w=re.sub(r"'(s|d|ll|re|ve|m)$",'',re.sub(r"n't$",'',w))
 for suf,rep in [('ies','y'),('sses','ss'),('ches','ch'),('shes','sh'),('xes','x')]:
  if w.endswith(suf) and len(w)>len(suf)+1:return w[:-len(suf)]+rep
 if w.endswith('ing') and len(w)>5:
  w=w[:-3]
  if len(w)>2 and w[-1]==w[-2] and w[-1] not in 'ls':w=w[:-1]
  return w
 if w.endswith('ed') and len(w)>4:
  w=w[:-2]
  if len(w)>2 and w[-1]==w[-2] and w[-1] not in 'ls':w=w[:-1]
  return w
 if w.endswith('s') and not w.endswith('ss') and len(w)>3:return w[:-1]
 return w

def exposure(root):
 sessions=json.loads((root/'out/game/sessions.json').read_text(encoding='utf-8'))['sessions']
 texts=json.loads((root/'out/data/transcripts.json').read_text(encoding='utf-8'))['items']
 first={};per=[];missing=[]
 for s in sessions:first.setdefault(s['media'],s['s'])
 for mid,at in first.items():
  if mid not in texts:missing.append(mid);continue
  per.append((at,{stem(w) for w in tokens('\n\n'.join(texts[mid]))}))
 return per,missing

def refs(s,sep):return [] if s in ('','-') else [x.strip() for x in s.split(sep)]

def audit(o,per):
 findings=[];candidates=[]
 def add(check,ids,detail,turns=()):findings.append({'check':check,'ids':list(ids),'turns':list(turns),'detail':detail})
 counts=Counter(l['id'] for l in o['lines']);lines={l['id']:l for l in o['lines']};turns=o['turns']
 for i,n in counts.items():
  if n>1:add('reference',[i],f'duplicate line id x{n}')
 for i,n in Counter(t['id'] for t in turns).items():
  if n>1:add('reference',[],f'duplicate turn id {i} x{n}',[i])
 branches={};bpairs=[]
 raw=o['meta'].get('갈래','-')
 if raw not in ('','-'):
  for pair in raw.split(','):
   a=re.fullmatch(r'\s*([a-z0-9-]+)\s*>\s*([a-z0-9-]+)\s*',pair)
   if not a:add('reference',[],f'malformed branch: {pair}');continue
   src,dst=a.groups();bpairs.append((src,dst))
   if src in branches:add('reference',[src,dst],'duplicate branch source')
   branches[src]=dst
   if src not in lines or dst not in lines:add('reference',[src,dst],'missing branch source or target')
   elif lines[src]['kind']=='npc' or lines[dst]['kind']!='npc':add('reference',[src,dst],'branch must lead player pick to NPC')
 # Graph uses unique occurrences, not globally collapsed line IDs.
 graph=defaultdict(set);start=('entry',0);end=('end',len(turns));graph[end]=set();seenlines=set();npcuses=defaultdict(list);pickset=set()
 for k,t in enumerate(turns):
  entry=('entry',k);nxt=('entry',k+1) if k+1<len(turns) else end;prev=entry
  ns=refs(t['npc'],'+');ps=refs(t['pick'],'/');pickset.update(ps)
  if not ns and not ps:add('dead_end',[],'empty turn', [t['id']])
  if ps and t['seat'] not in ('A','B','둘 중 누구든'):add('reference',ps,'invalid scored seat',[t['id']])
  if not ps and t['seat']!='-':add('reference',ns,'unscored turn must use - seat',[t['id']])
  for pos,i in enumerate(ns):
   if i not in lines:add('reference',[i],'missing NPC reference',[t['id']])
   elif lines[i]['kind']!='npc':add('reference',[i],'turn NPC reference is not NPC',[t['id']])
   node=('npc',k,pos,i);graph[prev].add(node);prev=node;npcuses[i].append(t['id'])
  if not ps:graph[prev].add(nxt)
  for pos,i in enumerate(ps):
   if i not in lines:add('reference',[i],'missing pick reference',[t['id']])
   elif lines[i]['kind']=='npc':add('reference',[i],'player pick references NPC',[t['id']])
   node=('pick',k,pos,i);graph[prev].add(node);target=branches.get(i)
   if target:
    branch=('branch',k,pos,target);graph[node].add(branch);graph[branch].add(nxt)
   else:graph[node].add(nxt)
  # A miss skips the optional branch and advances; this does not guarantee
  # that the transaction is meaningful. Semantics are reviewed separately.
  if ps:graph[prev].add(nxt)
 if not turns:add('dead_end',[],'no turns')
 for src,dst in bpairs:
  if src not in pickset:add('reference',[src,dst],'branch source is never a scored pick')
 for p in o['practice']:
  if p['line'] not in lines:add('reference',[p['id'],p['line']],'missing practice reference')
 reached=set();todo=[start]
 while todo:
  node=todo.pop()
  if node in reached:continue
  reached.add(node)
  if node[0] in ('npc','pick','branch') and node[-1] in lines:seenlines.add(node[-1])
  todo.extend(graph[node]-reached)
 for i in sorted(set(lines)-seenlines):add('unreachable',[i],'no reachable turn occurrence or branch target')
 for node in reached:
  if node!=end and not graph[node]:add('dead_end',[node[-1]] if isinstance(node[-1],str) else [],f'nonterminal occurrence has no outgoing edge: {node}')
 # Kahn sort checks all reachable occurrence nodes.
 indegree={n:0 for n in reached}
 for n in reached:
  for v in graph[n]:
   if v in indegree:indegree[v]+=1
 q=[n for n,d in indegree.items() if d==0];processed=0
 while q:
  n=q.pop();processed+=1
  for v in graph[n]:
   if v in indegree:
    indegree[v]-=1
    if indegree[v]==0:q.append(v)
 if processed!=len(reached):add('cycle',[],'cycle in reachable occurrence graph')
 for i,ts in npcuses.items():
  if len(ts)>1 and i in lines and ('?' in lines[i]['say'] or re.search(r'\b(would|want|need|like|how|what|can)\b',lines[i]['say'],re.I)):
   candidates.append({'id':i,'turns':ts,'say':lines[i]['say'],'status':'human review required; different recipients may be valid'})
 n=sum(t['pick']!='-' for t in turns);a=sum(t['pick']!='-' and t['seat']=='A' for t in turns);b=sum(t['pick']!='-' and t['seat']=='B' for t in turns);e=n-a-b
 for seat,fixed in [('A',a),('B',b)]:
  if n and (fixed+e)*100<35*n:add('seat_forced',[i for t in turns if t['seat']==seat for i in refs(t['pick'],'/')],f'{seat} maximum share {(fixed+e)/n:.3%} <35%; fixed {fixed}/{n}, Either {e}')
  elif n and fixed*100<35*n:add('seat_conditional',[],f'{seat} guaranteed share {fixed/n:.3%}<35%; achievable {(fixed+e)/n:.3%}; needs controlled Either allocation')
 if not 25<=len(o['lines'])<=40:add('line_count',[l['id'] for l in o['lines']],f'{len(o["lines"])} lines outside 25..40')
 if not 8<=n<=14:add('turn_count',[i for t in turns for i in refs(t['pick'],'/')],f'{n} scored turns outside 8..14',[t['id'] for t in turns if t['pick']!='-'])
 heard=set();session=int(o['meta']['세션'])
 for at,vocab in per:
  if at<=session:heard|=vocab
 allowed={w.lower() for w in re.findall(r"[A-Za-z']+",o['meta'].get('허용 이름','-'))};newmap={}
 for l in o['lines']:
  new=sorted({w for w in tokens(l['say']) if w not in allowed and stem(w) not in heard});newmap[l['id']]=new
  if len(new)>4:add('new_words',[l['id']],f'{len(new)} unseen word tokens: {", ".join(new)}')
 return {'mission':o['id'],'source':o['source'],'lines':len(o['lines']),'scored':n,'A_fixed':a,'B_fixed':b,'Either':e,'reachable_lines':len(seenlines),'graph_nodes':len(reached),'graph_acyclic':processed==len(reached),'findings':findings,'repeat_candidates':candidates,'new_words':newmap}

def selftest():
 # Mutation fixtures exercise the checks, not snapshots of the script's output.
 o={'id':'fixture','source':'fixture','meta':{'세션':'1','허용 이름':'-','갈래':'p-1 > n-2'},'lines':[{'id':'n-1','kind':'npc','say':'What do you want?'},{'id':'p-1','kind':'option','say':'Tea.'},{'id':'n-2','kind':'npc','say':'Okay.'}],'practice':[],'turns':[{'id':'t1','npc':'n-1','pick':'p-1','seat':'둘 중 누구든'},{'id':'t2','npc':'n-1','pick':'p-1','seat':'둘 중 누구든'}]}
 passed=[]
 def run(name,x,check,present=True):
  r=audit(x,[(1,{'what','do','you','want','tea','okay'})]);found=any(f['check']==check for f in r['findings']);assert found==present,(name,r);passed.append(name)
 run('reused ID is not a cycle',o,'cycle',False)
 run('branch-only NPC is reachable',o,'unreachable',False)
 x=copy.deepcopy(o);x['meta']['갈래']='p-1 > missing';run('missing branch target',x,'reference')
 x=copy.deepcopy(o);x['turns'][0]['pick']='missing';run('missing turn pick',x,'reference')
 x=copy.deepcopy(o);x['lines'].append({'id':'unused','kind':'npc','say':'Unused.'});run('orphan line',x,'unreachable')
 x=copy.deepcopy(o);x['turns'].insert(1,{'id':'empty','npc':'-','pick':'-','seat':'-'});run('empty turn',x,'dead_end')
 x=copy.deepcopy(o);x['lines'].append(copy.deepcopy(x['lines'][0]));run('duplicate line ID',x,'reference')
 x=copy.deepcopy(o);x['meta']['갈래']='p-1 > n-2, p-1 > n-1';run('duplicate branch source',x,'reference')
 x=copy.deepcopy(o);x['turns'][0]['pick']='n-1';run('NPC cannot be player pick',x,'reference')
 x=copy.deepcopy(o);x['turns']=[{'id':f't{k}','npc':'n-1','pick':'p-1','seat':'A' if k<8 else 'B'} for k in range(10)];run('forced seat imbalance',x,'seat_forced')
 run('Either uncertainty is reported',o,'seat_conditional')
 run('line count range',o,'line_count');run('scored turn count range',o,'turn_count')
 x=copy.deepcopy(o);x['lines'][1]['say']='alpha bravo charlie delta echo';run('five new words',x,'new_words')
 x=copy.deepcopy(o);x['lines'][1]['say']='alpha bravo charlie delta';run('four new words accepted',x,'new_words',False)
 assert len(audit(o,[])['repeat_candidates'])==1;passed.append('repeated NPC candidate only')
 return {'selftest':'passed','checks':len(passed),'tests':passed}

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--study-root',type=Path,default=Path(__file__).resolve().parents[2]);p.add_argument('--output',type=Path);p.add_argument('--strict',action='store_true');p.add_argument('--selftest',action='store_true');a=p.parse_args()
 if a.selftest:r=selftest()
 else:
  root=a.study_root
  if (root/'eng2p').is_dir():root=root/'eng2p'
  missions={};conflicts=[];hashes={};deduplicated=[]
  for rel in ['docs/authored_lines.md','docs/parts/G2_authored_lines.md','docs/parts/G3_authored_lines.md','docs/parts/G5_authored_lines.md']:
   path=root/rel;raw=path.read_bytes();hashes[rel]=hashlib.sha256(raw).hexdigest()
   for o in parse(raw.decode('utf-8'),rel):
    if o['id'] in missions:
     prev=missions[o['id']]
     if {k:v for k,v in prev.items() if k!='source'}!={k:v for k,v in o.items() if k!='source'}:conflicts.append({'mission':o['id'],'sources':[prev['source'],rel]})
     else:deduplicated.append(o['id'])
    else:missions[o['id']]=o
  per,missing=exposure(root);rs=[audit(o,per) for o in missions.values()]
  globalids=defaultdict(list)
  for o in missions.values():
   for l in o['lines']:globalids[l['id']].append(o['id'])
  duplicates={k:v for k,v in globalids.items() if len(v)>1}
  for row in rs:
   for i,ms in duplicates.items():
    if row['mission'] in ms:row['findings'].append({'check':'reference','ids':[i],'turns':[],'detail':'global duplicate ID in '+', '.join(ms)})
  r={'mode':'original source; read only','source_sha256':hashes,'missions':len(rs),'lines':sum(x['lines'] for x in rs),'source_conflicts':conflicts,'identical_merged_chapters_deduplicated':deduplicated,'missing_exposure_media':missing,'global_duplicate_ids':duplicates,'counts':dict(Counter(f['check'] for x in rs for f in x['findings'])),'results':rs}
 text=json.dumps(r,ensure_ascii=False,indent=2)+'\n'
 if a.output:a.output.write_text(text,encoding='utf-8',newline='\n')
 else:print(text,end='')
 if a.strict and not a.selftest and (r['counts'] or r['source_conflicts'] or r['missing_exposure_media']):return 1
 return 0

if __name__=='__main__':raise SystemExit(main())
