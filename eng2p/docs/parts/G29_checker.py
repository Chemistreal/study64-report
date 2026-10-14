#!/usr/bin/env python3
"""Read-only source audit; optional output directory must be outside the study tree.
B/C-real are provenance grades, not CEFR. Missing CEFR evidence is reported as unknown.
No network, media playback, source or gate edits.
"""
import argparse,collections,csv,datetime,hashlib,importlib.util,json,pathlib,re,sys
sys.dont_write_bytecode=True
KINDS=('radio','notices','readers','smalltalk','calendar')
def safe(value):
 return ''.join(c if ord(c)<128 or '\uac00'<=c<='\ud7a3' or '\u3131'<=c<='\u318e' or c in '‘’“”…·→°' else '\\u%04x'%ord(c) for c in str(value))
def level(n):return 'A1' if n<=50 else 'A2' if n<=100 else 'B1' if n<=200 else 'B2'
def run(study,data=None,sessions=None):
 root=pathlib.Path(study).resolve();dr=pathlib.Path(data).resolve() if data else root/'out/data'
 ds={k:json.loads((dr/f'ext_{k}.json').read_text()) for k in KINDS};S=json.loads(pathlib.Path(sessions or root/'out/game/sessions.json').read_text());start=datetime.date.fromisoformat(S['start']);ss=S['sessions'];problems=[];dates=[];words=[];mapping=[];duplicates=[];events=[]
 def issue(k,i,f,p):problems.append({'kind':k,'id':str(i),'field':f,'problem':p,'A/B':'B'})
 Cspec=importlib.util.spec_from_file_location('g29_original_common',root/'scripts/derive_ext_common.py');C=importlib.util.module_from_spec(Cspec);Cspec.loader.exec_module(C)
 expected={'radio':89,'notices':24,'readers':10,'smalltalk':2580,'calendar':48}
 for k,d in ds.items():
  if not d.get('source') or not d.get('grade'):issue(k,'header','source/grade','missing source or provenance grade')
  if len(d['items'])!=expected[k] or d.get('count')!=len(d['items']):issue(k,'header','coverage','count differs from source coverage')
  ids=[str(x.get('id',x.get('week'))) for x in d['items']]
  if len(set(ids))!=len(ids):issue(k,'header','id','duplicate item id')
  for x in d['items']:
   i=x.get('id',x.get('week'));w=x.get('week');g=x.get('grade',d['grade'])
   if not isinstance(w,int) or not 1<=w<=48:issue(k,i,'week','invalid appearance week');continue
   if x.get('quarter')!='Q'+str((w-1)//12+1):issue(k,i,'quarter','quarter disagrees with appearance week')
   if g!=('C-real' if k=='radio' else 'B'):issue(k,i,'grade','provenance grade mismatch')
   if k not in ('calendar',) and not (x.get('src') or x.get('url') or (k=='notices' and x.get('facts') and all(v.get('src') for v in x['facts']))):issue(k,i,'source','missing item source')
   if k in ('notices','readers') and '학습용 인공물' not in x.get('label',''):issue(k,i,'label','required artificial-material label missing')
   if k=='smalltalk' and '학습용 인공물' not in x.get('layer',''):issue(k,i,'label','required artificial-material layer label missing')
   if k=='radio':
    if not x.get('credit') or not x.get('license'):issue(k,i,'credit','source credit or rights label missing')
    if not x.get('audio'):issue(k,i,'audio','no media address; text-only material requires explicit display')
    if w<25 and any(t.get('bot') for t in x['lines']):issue(k,i,'week','grammar commentary before week 25')
    mapping.append({'id':i,'week':w,'slot':x['slot'],'source':x['url'],'media':x.get('audio'),'cues':'ext mapping not supplied; LLE1 cues separate','alignment':'unheard; not certified','CEFR':'unknown','session range':f'{6*w-5}-{6*w}','session levels':','.join(sorted({level(n) for n in range(6*w-5,6*w+1)})),'A/B':'B'})
   text=x.get('text','') or ' '.join(t['text'] for t in x.get('lines',[]))
   if k in ('notices','readers','smalltalk'):
    base,ext,names=C.gate_words(w);lex=set(C.tokens(text));unheard=lex-base-ext-names
    if unheard:issue(k,i,'words','outside heard/supplemental gate: '+','.join(sorted(unheard)))
    for token in sorted(lex):words.append({'kind':k,'id':i,'week':w,'word':token,'heard/supplemental':'base' if token in base else 'extension' if token in ext else 'name' if token in names else 'outside','CEFR':'not available','A/B':'B'})
   stated=x.get('cefr') or x.get('level')
   if stated in ['A1','A2','B1','B2'] and ['A1','A2','B1','B2'].index(stated)>['A1','A2','B1','B2'].index(level(w*6-5)):issue(k,i,'level','explicit CEFR above first appearance session')
   if k in ('radio','notices','readers') and any(t.get('grade')!=g for t in x['lines']):issue(k,i,'lines.grade','line provenance grade differs')
 # Calendar source-derived placement, empty reason and inherited grade.
 for x in ds['calendar']['items']:
  w=x['week']
  if not isinstance(w,int) or not 1<=w<=48:continue
  for k in ['radio','notices','readers','smalltalk','npc']:
   cell=x[k];items=[t for t in ds.get(k,{}).get('items',[]) if t['week']==w];n=cell.get('count',len(cell.get('items',[])))
   if n!=len(items):issue('calendar',w,k,'cell count differs from source week')
   if k not in ['smalltalk','npc'] and {t['id'] for t in cell['items']}!={t['id'] for t in items}:issue('calendar',w,k,'calendar ids differ from source items')
   if k=='smalltalk' and cell['places']!=sorted({t['place'] for t in items}):issue('calendar',w,k,'places differ from source items')
   if bool(cell.get('empty'))!=(n==0):issue('calendar',w,k,'empty reason missing or stale')
   if cell.get('grade')!=(('C-real' if k=='radio' else 'B') if n else None):issue('calendar',w,k,'cell provenance grade mismatch')
   for it in cell.get('items',[]):
    raw=next((v for v in items if v['id']==it['id']),None)
    if raw and it.get('title')!=raw.get('title'):issue('calendar',w,k,'title differs from raw item')
  for field in ['date','startDate']:
   if field in x:
    try:dt=datetime.date.fromisoformat(x[field]);correct=start+datetime.timedelta(days=(w-1)*7)
    except (ValueError,TypeError):issue('calendar',w,field,'invalid date');continue
    if dt!=correct:issue('calendar',w,field,'week start date mismatch')
  if 'weekday' in x and x['weekday'] not in ['Monday','월요일',0]:issue('calendar',w,'weekday','week start weekday mismatch')
 if len(ss)!=288:issue('sessions','header','coverage','expected 288 sessions')
 for n,s in enumerate(ss,1):
  expected_date=start+datetime.timedelta(days=((n-1)//6)*7+(n-1)%6)
  try:dt=datetime.date.fromisoformat(s['date'])
  except (ValueError,TypeError):issue('sessions',n,'date','invalid date');continue
  if dt!=expected_date or s['s']!=n or s['week']!=(n-1)//6+1 or s['day']!=(n-1)%6+1:issue('sessions',n,'date/week/day','session date or index mismatch')
  if dt.weekday()==6:issue('sessions',n,'weekday','session on Sunday rest day')
  dates.append({'date':s['date'],'weekday':dt.strftime('%A'),'week':s['week'],'session':n,'rest':False,'consolidation':s['consolidate'],'event':'','A/B':'B'})
 for w in range(1,49):
  d=start+datetime.timedelta(days=(w-1)*7+6);dates.append({'date':d.isoformat(),'weekday':'Sunday','week':w,'session':'','rest':True,'consolidation':w in [6,18,30,42],'event':'','A/B':'B'})
 # Fixed-date claims transcribed from culture.md; external holiday status remains unverified.
 fixed=[('광복절','2026-08-15','2~3'),('Statehood Day','2026-08-21','3'),('Laa Kuookoa','2026-11-28','17'),('새해','2027-01-01','22~23'),('Korean American Day','2027-01-13','24'),('전복 역사 기념','2027-01-17','24'),('삼일절','2027-03-01','29'),('Prince Kuhio Day','2027-03-26','32~33'),('Lei Day','2027-05-01','37'),('King Kamehameha I Day','2027-06-11','43'),('Independence Day','2027-07-04','47')]
 for title,date,approx in fixed:
  dt=datetime.date.fromisoformat(date);w=(dt-start).days//7+1;rest=dt.weekday()==6
  events.append({'event':title,'date':date,'weekday':dt.strftime('%A'),'week actual':w,'week document approximate':approx,'rest':rest,'consolidation':w in [6,18,30,42],'source':'docs/culture.md 2.5','support':'repository date claim only; external validity unverified','A/B':'B'})
  for row in dates:
   if row['date']==date:row['event']=title
 # Compare text/audio identity rather than titles alone.
 seen={}
 for x in ds['radio']['items']:
  t=' '.join(' '.join(v['text'].split()) for v in x['lines']).strip();key=hashlib.sha256(t.encode()).hexdigest()
  if key in seen:
   y=seen[key];duplicates.append({'id':x['id'],'same text as':y['id'],'same audio':x.get('audio')==y.get('audio'),'hash':key,'A/B':'B'});issue('radio',x['id'],'duplicate','identical transcript to '+y['id'])
  else:seen[key]=x
 # Original core cues are estimates; check shape, not actual alignment.
 T=json.loads((root/'out/data/transcripts.json').read_text())['items'];cu=json.loads((root/'out/data/cues.json').read_text())
 for i,t in T.items():
  c=cu['items'].get(i,[])
  if len(c)!=len(t) or any(not isinstance(v,(int,float)) for v in c) or any(b<a for a,b in zip(c,c[1:])):issue('cues',i,'shape','line count or monotonic estimate mismatch')
 summary={'items':sum(len(x['items']) for x in ds.values()),'counts':{k:len(v['items']) for k,v in ds.items()},'mechanical problems':len(problems),'problems':problems,'CEFR check':'unknown: no full CEFR lexicon; heard/supplemental checks are not CEFR','dates':len(dates),'event claims':len(events),'radio duplicates':len(duplicates),'radio cue alignment':'not supplied; playback not performed','core cues estimate':cu.get('estimate'),'year consistency':'48 weeks, six study days, Sunday rest; actual dates recomputed'}
 return summary,{'dates':dates,'events':events,'words':words,'radio_mapping':mapping,'duplicates':duplicates}
def main():
 p=argparse.ArgumentParser();p.add_argument('--study',required=True);p.add_argument('--data');p.add_argument('--sessions');p.add_argument('--out');a=p.parse_args();summary,tables=run(a.study,a.data,a.sessions)
 if a.out:
  out=pathlib.Path(a.out).resolve();root=pathlib.Path(a.study).resolve()
  if out==root or root in out.parents:raise ValueError('output must be outside original study tree')
  out.mkdir(parents=True,exist_ok=True);(out/'G29_summary.json').write_text(safe(json.dumps(summary,ensure_ascii=False,indent=2))+'\n')
  for name,rows in tables.items():
   if not rows:continue
   # Bound word CSV files below kit limit.
   groups=[rows[i:i+2500] for i in range(0,len(rows),2500)] if name=='words' else [rows]
   for n,group in enumerate(groups,1):
    path=out/('G29_'+name+(f'_{n:02}' if name=='words' else '')+'.csv')
    with path.open('w',newline='',encoding='utf-8') as f:
     w=csv.DictWriter(f,list(group[0]),lineterminator='\n');w.writeheader();w.writerows({k:safe(v) for k,v in row.items()} for row in group)
 for v in summary['problems']:print(safe(f"[{v['kind']} {v['id']}] {v['field']}: {v['problem']}"))
 print(f"G29_checker: {summary['items']} items, {summary['mechanical problems']} problems");return 1 if summary['mechanical problems'] else 0
if __name__=='__main__':sys.exit(main())
