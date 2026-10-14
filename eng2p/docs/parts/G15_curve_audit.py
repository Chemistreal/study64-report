#!/usr/bin/env python3
"""Independent read-only input audit. Writes only explicitly selected G15 output files."""
from pathlib import Path
import argparse,collections,csv,datetime,json,re,statistics,time
WORD=re.compile(r"[A-Za-z]+(?:'[A-Za-z]+)?")
def toks(s):return WORD.findall(s.replace('’',"'").lower())
def curve_toks(s):return WORD.findall(s.lower())
def stem(w):
 if w in ['cannot',"can't"]:return 'can'
 if w=="won't":return 'will'
 w=re.sub(r"n't$",'',w);w=re.sub(r"'(s|d|ll|re|ve|m)$",'',w)
 for suf,rep in [('ies','y'),('sses','ss'),('ches','ch'),('shes','sh'),('xes','x')]:
  if w.endswith(suf) and len(w)>len(suf)+1:return w[:-len(suf)]+rep
 if w.endswith('ing') and len(w)>5:
  w=w[:-3];return w[:-1] if len(w)>2 and w[-1]==w[-2] and w[-1] not in 'ls' else w
 if w.endswith('ed') and len(w)>4:
  w=w[:-2];return w[:-1] if len(w)>2 and w[-1]==w[-2] and w[-1] not in 'ls' else w
 return w[:-1] if w.endswith('s') and not w.endswith('ss') and len(w)>3 else w
def ranges(nums):
 out=[]
 for n in sorted(set(nums)):
  if out and n==out[-1][1]+1:out[-1][1]=n
  else:out.append([n,n])
 return out
def main():
 start=time.perf_counter();p=argparse.ArgumentParser();p.add_argument('--study',type=Path,required=True);p.add_argument('--out',type=Path,default=Path(__file__).resolve().parent);p.add_argument('--later-parts',type=Path);a=p.parse_args();r=a.study;g=r/'out/game';d=r/'out/data';used=[]
 def read(base,name):used.append(str(base/name));return json.loads((base/name).read_text())
 sess=read(g,'sessions.json');S=sess['sessions'];C={x['id']:x for x in read(d,'cards.json')['items']};T=read(g,'transcripts.json');O=read(g,'outings.json');AU=read(g,'authored.json');acts=read(g,'acts.json');lectures=read(d,'lectures.json')['items'];sets=read(d,'sets.json')['items'];index=read(d,'index.json');plays=read(d,'playblocks.json');track=read(d,'track.json');halves=read(d,'halves.json');manifest=read(d,'manifest.json')
 splitcounts={}
 for q in range(1,5):
  f=d/f'index_q{q}.js';used.append(str(f));text=f.read_text().strip();obj=json.loads(text[text.index('=')+1:].rstrip(';'));splitcounts['Q'+str(q)]=len(obj)
 grades={}
 for f in [r/'docs/authored_words.md']+sorted((r/'docs/parts').glob('G[235]_authored_words.md')):
  used.append(str(f))
  for m in re.finditer(r'```(A1|A2|B1|B2)\n(.*?)```',f.read_text(),re.S):
   for w in re.findall(r"[A-Za-z']+",m[2]):grades.setdefault(stem(w.lower()),m[1])
 mediafirst={};cardfirst={};wordfirst={};wordexposure=collections.defaultdict(set);cardexposure=collections.defaultdict(list);cardreview=collections.defaultdict(list);mediawords={};cardwords={};cardlines={}
 for key,lines in T.items():
  if key.startswith('lle'):mediawords[key]=set(w for line in lines for w in curve_toks(line.split(':',1)[1] if ':' in line else line))
 for key,c in C.items():
  strings=[]
  for x in c['a'].get('material') or []:
   if isinstance(x,str):strings.append(x)
   elif isinstance(x,dict):strings.extend(v for v in x.values() if isinstance(v,str))
  cardwords[key]=set(w for text in strings for w in curve_toks(text));cardlines[key]=strings
 unlock={m['id']:m['unlock']['session'] for m in O['missions']};missionwords=collections.defaultdict(set);missionlines=collections.defaultdict(list)
 for l in AU['lines']:missionwords[unlock[l['outing']]].update(curve_toks(l['say']));missionlines[unlock[l['outing']]].append(l['say'])
 freshmedia=collections.defaultdict(set);freshcard=collections.defaultdict(set);firstsrc=collections.defaultdict(dict);newlines={};rows=[];bad=[];state={};gapdelays=[];schedule_mismatches=[]
 for x in S:
  n=x['s'];date=datetime.date.fromisoformat(x['date']);newcard=[];fresh=[];seenwords=set();seenwords.update(mediawords[x['media']])
  if x['media'] not in mediafirst:
   mediafirst[x['media']]=n;freshmedia[n].update(mediawords[x['media']]);fresh.extend(t.split(':',1)[1] if ':' in t else t for t in T[x['media']])
  for c in x['cards']:
   if c not in cardfirst:cardfirst[c]=n;newcard.append(c);freshcard[n].update(cardwords[c]);fresh.extend(cardlines[c])
  fresh+=missionlines[n];newlines[n]=fresh
  for label,words in [('media',freshmedia[n]),('card',freshcard[n]),('mission',missionwords[n])]:
   for w in words:
    if w not in wordfirst:wordfirst[w]=n;firstsrc[n][w]=label
  for c in x['cards']+x['review']:
   cardexposure[c].append(n);seenwords.update(cardwords[c])
  for c in x['review']:cardreview[c].append(n)
  seenwords.update(missionwords[n])
  for w in seenwords:wordexposure[w].add(n)
  today=set(x['cards']);expected={k for k,(box,due) in state.items() if due is not None and due<=date}-today
  if expected!=set(x['review']):schedule_mismatches.append({'s':n,'missing':sorted(expected-set(x['review'])),'extra':sorted(set(x['review'])-expected)})
  for c in today|set(x['review']):
   box,due=state.get(c,(0,None))
   if box>0 and due is not None and due>date:continue
   if due is not None and due<=date:gapdelays.append((n,c,(date-due).days))
   if box>=len(sess['spacing']['ladder']):state[c]=(box,None)
   else:state[c]=(box+1,date+datetime.timedelta(days=sess['spacing']['ladder'][box]))
  tm=sum(C[c]['minutes'] for c in x['cards']);rv=sum(C[c]['minutes'] for c in x['review']);b3=tm+rv;clock=sum(b['minutes'] for b in x['blocks'] if b.get('clock',True) and isinstance(b.get('minutes'),(int,float))) if 'blocks' in x else sess['day']['clockMinutes'];level=next(b['cefr'] for b in acts['levels'] if b['fromSession']<=n<=b['toSession']);nw=list(firstsrc[n]);graded=collections.Counter(grades.get(stem(w),'ungraded') for w in nw);lengths=[len(curve_toks(s)) for s in fresh if curve_toks(s)]
  if x['block3']['minutes']!=b3:bad.append('block3 stored mismatch '+str(n))
  if x['consolidate'] and newcard:bad.append('new cards in consolidation '+str(n))
  role=sum(C[c]['type'] in ['역할','압박'] for c in newcard)
  rows.append({'session':n,'quarter':x['quarter'],'level':level,'consolidate':int(x['consolidate']),'new_words':len(nw),'new_A1':graded['A1'],'new_A2':graded['A2'],'new_B1':graded['B1'],'new_B2':graded['B2'],'new_ungraded':graded['ungraded'],'new_media':int(mediafirst[x['media']]==n),'new_card_count':len(newcard),'new_cards':';'.join(newcard),'new_role_pressure_share':round(role/len(newcard),4) if newcard else '', 'new_material_avg_words':round(statistics.mean(lengths),2) if lengths else '', 'new_material_max_words':max(lengths) if lengths else '', 'today_cards':len(x['cards']),'due_review_cards':len(x['review']),'today_minutes':tm,'review_minutes':rv,'block3_minutes':b3,'day_expected_minutes':clock+b3,'capacity_minutes':'unlimited','current_overflow':0,'legacy_over30':int(b3>30),'first_exposure_words':';'.join(sorted(nw))})
 if len(S)!=288 or len(C)!=600:bad.append('source count mismatch')
 if schedule_mismatches:bad.append('nominal due schedule differs in '+str(len(schedule_mismatches))+' sessions')
 # Planned later chapters, separate from released data and document curve comparisons.
 sources=[r/'docs/parts'/f'G{n}_authored_lines.md' for n in [2,3,5]]
 if a.later_parts:sources=[a.later_parts/t/'files/study/eng2p/docs/parts'/f'{t}_authored_lines_v2.md' for t in ['G17','G18','G19']]
 lessonfirst={}
 for m,at in mediafirst.items():
  for w in mediawords[m]:lessonfirst[stem(w)]=min(lessonfirst.get(stem(w),9999),at)
 early=[];per_session=collections.Counter()
 for f in sources:
  used.append(str(f));text=f.read_text()
  for part in re.split(r'(?=^## 나들이: )',text,flags=re.M)[1:]:
   mid=re.match(r'## 나들이: (\S+)',part)[1];n=int(re.search(r'^세션: (\d+)',part,re.M)[1])
   if n<49:continue
   for line in part.split('### 연습할 말')[0].splitlines():
    if not line.startswith('| '):continue
    c=[v.strip() for v in line.strip('|').split('|')]
    if len(c)!=10 or c[0]=='id':continue
    for w in sorted(set(toks(re.sub(r'\{[^}]+\}','',c[4])))):
     at=lessonfirst.get(stem(w));
     if at is None or at>=n:
      early.append([mid,n,c[0],w,at if at is not None else 'never in core media','same-session' if at==n else 'later' if at is not None else 'not in core','B']);per_session[n]+=1
 for row in rows:row['planned_mission_before_taught_tokens']=per_session[row['session']]
 wordgaps1=collections.Counter();wordlater=collections.Counter();never=[];many=[]
 for w,ex in wordexposure.items():
  ss=sorted(ex)
  if len(ss)==1:never.append([w,ss[0]])
  else:wordgaps1[ss[1]-ss[0]]+=1;wordlater.update(b-a for a,b in zip(ss[1:],ss[2:]))
  if len(ss)>=100:many.append([w,len(ss)])
 cardfirstgap=collections.Counter();cardlatergap=collections.Counter();calendarfirst=collections.Counter();calendarlater=collections.Counter();dates={x['s']:datetime.date.fromisoformat(x['date']) for x in S}
 for k,ss in cardexposure.items():
  if len(ss)>1:
   cardfirstgap[ss[1]-ss[0]]+=1;calendarfirst[(dates[ss[1]]-dates[ss[0]]).days]+=1
   cardlatergap.update(b-a for a,b in zip(ss[1:],ss[2:]));calendarlater.update((dates[b]-dates[a]).days for a,b in zip(ss[1:],ss[2:]))
 for row in rows:
  n=row['session'];newwords=list(firstsrc[n]);nc=[k for k,f in cardfirst.items() if f==n];wg=[];cg=[];firstdue=[]
  for word in newwords:
   ex=sorted(wordexposure[word])
   if len(ex)>1:wg.append(ex[1]-ex[0])
  for card in nc:
   ex=cardexposure[card]
   if len(ex)>1:cg.append(ex[1]-ex[0])
   if cardreview[card]:firstdue.append(cardreview[card][0]-n)
  row['newword_first_gap_median']=statistics.median(wg) if wg else ''
  row['newword_never_again']=sum(len(wordexposure[w])==1 for w in newwords)
  row['newword_exposure_ge100']=sum(len(wordexposure[w])>=100 for w in newwords)
  row['newcard_first_gap_median']=statistics.median(cg) if cg else ''
  row['newcard_first_due_review_gap_median']=statistics.median(firstdue) if firstdue else ''
  row['newcard_min_visits']=min((len(cardexposure[k]) for k in nc),default='')
 problems=[]
 def add(kind,nums,label,severity,metric):
  for lo,hi in ranges(nums):problems.append({'from':lo,'to':hi,'kind':kind,'issue':label,'severity':severity,'metric':metric,'A/B':'B'})
 add('a',[x['session'] for x in rows if x['session']>=49 and x['day_expected_minutes']>=180],'하루 예상 소요 180분 이상','높음','90 + 오늘 카드 분 + 복습 분 >= 180')
 jumps=[];cliffs=[];zeros=[]
 for i,row in enumerate(rows):
  n=row['session']
  if n<49:continue
  median=statistics.median(x['new_words'] for x in rows[max(0,i-6):i]);row['previous6_median']=median
  if row['new_words']>1.5*median:jumps.append(n)
  if median>0 and row['new_words']<median/2:cliffs.append(n)
  if row['new_words']==0:zeros.append(n)
 add('d',jumps,'직전 6세션 중앙값의 1.5배 초과','검토','new_words > 1.5 * previous6_median; 중앙 0인 재개도 포함')
 add('d',cliffs,'직전 6세션 중앙값 절반 미만','검토','previous6_median > 0 and new_words < median / 2')
 for lo,hi in ranges(zeros):
  if hi-lo+1>=12:problems.append({'from':lo,'to':hi,'kind':'d','issue':'새 낱말 종류가 없는 12세션 이상 연속','severity':'검토','metric':'new_words == 0','A/B':'B'})
 add('e',list(per_session),'이후 미션에 아직 핵심 녹음에서 안 들은 토큰','검토','입력 줄·미션 세션·최초 녹음 세션을 early 표에 전부 기록')
 add('b',[at for word,at in never if at>=49],'처음 나온 뒤 다시 노출되지 않은 낱말꼴','검토','같은 철자 기준 단회 노출; 어간과 이름 및 마지막 해 노출은 별도 판단 필요')
 con_new=[x['session'] for x in rows if x['consolidate'] and x['new_words']>0]
 add('d',con_new,'다지기 주의 최초 새 낱말 종류','높음','new_words > 0 in consolidate')
 summary={'input_files':used,'sessions':288,'audited_rows':240,'cards':600,'fresh_media':len(mediafirst),'all_new_words':len(wordfirst),'quarter_split_weeks':splitcounts,'card_visits':sum(map(len,cardexposure.values())),'today_visits':sum(len(x['cards']) for x in S),'review_visits':sum(len(x['review']) for x in S),'block3_sum':sum(x['block3_minutes'] for x in rows),'block3_mean':statistics.mean(x['block3_minutes'] for x in rows),'day_mean':statistics.mean(x['day_expected_minutes'] for x in rows),'max_day':max((x['day_expected_minutes'],x['session']) for x in rows),'days_ge180':sum(x['day_expected_minutes']>=180 for x in rows),'days_ge240':sum(x['day_expected_minutes']>=240 for x in rows),'year_hours':sum(x['day_expected_minutes'] for x in rows)/60,'legacy_over30':sum(x['legacy_over30'] for x in rows),'legacy_runs':ranges([x['session'] for x in rows if x['legacy_over30']]),'current_overflow':0,'nominal_schedule_mismatches':schedule_mismatches,'due_late_days_distribution':dict(collections.Counter(z[2] for z in gapdelays)),'all_card_visits_min':min(map(len,cardexposure.values())),'carry':sess['carry'],'cards_below5':[k for k,v in cardexposure.items() if len(v)<5],'word_first_gap':dict(wordgaps1),'word_later_gaps':dict(wordlater),'word_never_again':never,'word_exposure_ge100':many,'card_first_gap_sessions':dict(cardfirstgap),'card_later_gap_sessions':dict(cardlatergap),'card_first_gap_days':dict(calendarfirst),'card_later_gap_days':dict(calendarlater),'consolidation_new_words':con_new,'planned_early_token_rows':len(early),'lecture_spacing_exceptions':[[x['no'],x['spacing']['days'] if x['spacing'] else []] for x in lectures if x['spacing'] is None or x['spacing']['days']!=[1,3,7]],'bands':{},'problems':problems,'seconds':time.perf_counter()-start,'failures':bad}
 for b in acts['levels']:
  rr=[x for x in rows if b['fromSession']<=x['session']<=b['toSession']];newc=[k for k,n in cardfirst.items() if b['fromSession']<=n<=b['toSession']];summary['bands'][b['cefr']]={'sessions':len(rr),'new_words_mean':statistics.mean(x['new_words'] for x in rr),'block3_mean':statistics.mean(x['block3_minutes'] for x in rr),'new_card_count':len(newc),'new_card_minutes_mean':statistics.mean(C[k]['minutes'] for k in newc),'new_role_share':sum(C[k]['type']=='역할' for k in newc)/len(newc)*100}
 a.out.mkdir(parents=True,exist_ok=True)
 def writecsv(name,cols,data):
  with (a.out/name).open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=cols,lineterminator='\n');w.writeheader();w.writerows(data)
 subset=[x for x in rows if x['session']>=49];cols=list(subset[0]);writecsv('G15_tables.csv',cols,subset)
 writecsv('G15_problem_ranges.csv',list(problems[0]),problems)
 with (a.out/'G15_early_words.csv').open('w',newline='') as f:w=csv.writer(f,lineterminator='\n');w.writerow(['mission','unlock','line ID','token','first media session','relation','A/B']);w.writerows(early)
 (a.out/'G15_summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
 for e in bad:print('[FAIL]',e)
 print('G15 sessions: 240 audit rows, 288 total sessions, 600 cards')
 print('G15 input: '+str(len(used))+' files; no report_curve imports')
 print('G15 new word forms: '+str(len(wordfirst)))
 print('G15 card visits: '+str(summary['card_visits']))
 print('G15 block3: sum '+str(summary['block3_sum'])+', mean '+str(round(summary['block3_mean'],3)))
 print('G15 legacy >30: '+str(summary['legacy_over30'])+'; current unlimited overflow: 0')
 print('G15 day: mean '+str(round(summary['day_mean'],3))+', max '+str(summary['max_day']))
 print('G15 spacing: '+str(len(schedule_mismatches))+' nominal mismatches; words seen once '+str(len(never)))
 print('G15 planned early tokens: '+str(len(early))+'; actual teaching depth not computable')
 print('G15_curve_audit: 240 rows, '+str(len(bad))+' failures; '+str(round(summary['seconds'],3))+' seconds')
 return bool(bad)
if __name__=='__main__':raise SystemExit(main())
