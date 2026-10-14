#!/usr/bin/env python3
"""Read-only Korean explanation audit. Candidates are B, not teacher certification.
No paragraph character ceiling exists in tone/spec; use the actual four-sentence rule.
A supplied --character-limit is a diagnostic threshold, not a discovered course rule.
"""
import argparse,ast,collections,csv,hashlib,json,pathlib,re,sys
sys.dont_write_bytecode=True
TERMS=['품사','주어','목적어','보어','서술어','명사','동사','형용사','부사','의문사','관사','전치사','접속사','대명사','조동사','부정어','수식어','수식','시제','과거형','현재형','미래형','과거분사','현재분사','분사','부정사','현재완료','과거완료','완료형','진행형','과거진행형','단순 과거','수동태','능동태','조건절','가정법','명사절','관계절','부사절','종속절','독립절','주절','인용','간접화법','직접화법','간접 의문문','어순','단수','복수','3인칭','음소','음운','음절','모음','자음','자음군','종성','초성','중성','유음','유성음','무성음','구개음화','연음','동화','축약','약형','약모음','강세','문장 강세','낱말 강세','강세 박자','음절 박자','억양','문말 억양','최소대립쌍','내용어','기능어','표기 유도 오류','모음 삽입','전이','화석화','청크','repair','LRE','레지스터','화용','담화','대조','인출','자동화','dark l','clear l','정보차','재귀대명사','소유','공손성','정형','관계대명사','부정','문법','반례','접미사','어미','인칭','평서문','의문문','동사 원형','원형','기본형','비음','파열','불파','탈락','음성','입술','혀끝','잇몸','입천장','어조','초점','문장','낱말','정형 표현','선언 지식','절차 지식','최소 대립','강세 간격','자음 흡수','내용','기능']
# Audit terms are pedagogical names, not phonetic transliterations. Last generic names are excluded.
TERMS=TERMS[:-2]
OWN_TRANSLIT=['캔유','쿠쥬','우쥬','고잉투','원투','해프투','해브투','로터브','카인더브','댓츠','씨유','나이스투미츄','웨어아유','아이캔']
# These anticipated spellings derive from actual English expressions, not source violations.
COURSE_LATIN={'A','B','C','Q1','Q2','Q3','Q4','NPC','VOA','LRE','D','C','F','R','R1','R2','R3','R4','R5','R6','F01','F02','F03','F04','F05','F06','F07','F08','F09','F10','CEFR','ESL','dark','clear','repair','chunk','l','r','s','t','d','p','k','f','v','z','sh','zh','ch','j','th','ing','ed','MD','JSON','AI','TTS','C-real','C-gen'}
def safe(s):return ''.join(c if ord(c)<128 or '\uac00'<=c<='\ud7a3' or '\u3131'<=c<='\u318e' or c in '‘’“”…·→°' else '\\u%04x'%ord(c) for c in str(s))
def term_re(term):
 if re.search('[가-힣]',term):return re.compile(r'(?<![가-힣])'+re.escape(term)+r'(?=$|[^가-힣]|은|는|이|가|을|를|에|의|로|와|과|도|만|다|형|인|부터|까지|처럼|라|라고)')
 return re.compile(r'(?<![A-Za-z])'+re.escape(term)+r'(?![A-Za-z])')
def paragraphs(text):
 offset=0
 for block in re.split(r'\n\s*\n',text):
  pos=text.find(block,offset);offset=pos+len(block);yield text[:pos].count('\n')+1,block

def run(root,lecture_dir=None,handout_dir=None,character_limit=None):
 root=pathlib.Path(root).resolve();ld=pathlib.Path(lecture_dir or root/'out/lectures');hd=pathlib.Path(handout_dir or root/'out/handouts');findings=[];paragraph_rows=[];terms=[];english=[];repeat=collections.defaultdict(list);texts={};seen_terms=collections.defaultdict(list);def_candidates=collections.defaultdict(list)
 def add(n,file,line,kind,current,why):findings.append({'lecture':n,'file':file,'line':line,'kind':kind,'current':current,'why':why,'A/B':'B'})
 # Read original checker literal, without editing/import side effects.
 tree=ast.parse((root/'scripts/check.py').read_text());base=[]
 for node in tree.body:
  if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='TRANSLITERATION' for t in node.targets):base=ast.literal_eval(node.value)
 translit=re.compile(r'(?<![가-힣])(?:'+ '|'.join(map(re.escape,base+OWN_TRANSLIT))+r')(?![가-힣])')
 # Approved supplemental lexicon + actually supplied core English transcripts, not CEFR.
 approved=set()
 for t in json.loads((root/'out/data/transcripts.json').read_text())['items'].values():approved.update(re.findall(r'[a-z]+',' '.join(t).lower()))
 for block in re.findall(r'```\n(.*?)```',(root/'docs/wordlist.md').read_text(),re.S):approved.update(re.findall('[a-z]+',block.lower()))
 S=json.loads((root/'out/game/sessions.json').read_text())['sessions'];appearance=collections.defaultdict(list)
 for s in S:
  if s.get('lecture'):appearance[s['lecture']].append(s['s'])
 for n in range(1,97):
  q=(n-1)//24+1;fp=ld/f'eng2p_q{q}_l{n:03}.md';hp=hd/f'eng2p_handout_l{n:03}.md'
  if not fp.exists():add(n,str(fp),0,'coverage','','missing lecture');continue
  text=fp.read_text();texts[n]=text
  if not hp.exists():add(n,str(hp),0,'coverage','','missing handout')
  body_start=text.find('\n## 1.');body=text[body_start:] if body_start>=0 else text;line_shift=text[:body_start].count('\n') if body_start>=0 else 0
  formal=[];plain=[];section=''
  for idx,line in enumerate(body.splitlines(),line_shift+1):
   if line.startswith('## '):section=line
   for m in translit.finditer(line):add(n,fp.name,idx,'transliteration',m.group(),'Hangul phonetic spelling candidate')
   korean=bool(re.search('[가-힣]',line));is_quote=bool(re.match(r'\s*(>|[A-Z][A-Za-z ]*:|["“])',line));rule=(line.startswith('#') or line.startswith('|') or line.startswith('```'))
   if korean and not is_quote and not rule:
    if re.search(r'(습니다|합니다|세요|해요|이에요|예요)[.!?]?(?:\*\*)?$',line.strip()):formal.append(idx)
    if re.search(r'(한다|이다|된다|없다|있다|본다|쓴다|준다|한다|해|봐)[.!?]?(?:\*\*)?$',line.strip()):plain.append(idx)
   if korean:
    for token in re.findall(r'(?<![A-Za-z0-9])[A-Za-z][A-Za-z0-9-]*(?![A-Za-z0-9])',line):
     if token in COURSE_LATIN or re.fullmatch(r'(?:lle\d|eng2p|Q\d|F|R)[-_]?\d*',token) or token.lower() in approved:continue
     english.append({'lecture':n,'line':idx,'token':token,'status':'outside supplied core/supplement; not CEFR violation','A/B':'B'});add(n,fp.name,idx,'latin-outside-evidence',token,'Latin token lacks supplied core/supplement evidence; verify context')
   for term in TERMS:
    if term_re(term).search(line):
     location={'lecture':n,'line':idx,'context':line,'section':section};seen_terms[term].append(location)
     context=' '.join(body.splitlines()[max(0,idx-line_shift-3):idx-line_shift+2])
     if re.search(re.escape(term)+r'.{0,45}(라고 부른다|라 부른다|란|는 .*자리|는 .*뜻|란 .*뜻|이 .*소리|은 .*소리|를 .*부른다)',context) or re.search(r'(부른다|뜻|라는 것|라고 한다).{0,25}'+re.escape(term),context):def_candidates[term].append(location)
  if formal and plain:add(n,fp.name,formal[0],'register-mix','formal lines '+str(formal),'Formal/plain endings mixed; quoted role speech excluded where identifiable')
  for line,block in paragraphs(body):
   absolute=line_shift+line;flat=' '.join(block.split());cnt=len(flat);korean=bool(re.search('[가-힣]',block));skip=not korean or block.lstrip().startswith(('#','|','```'))
   # D.C. abbreviation and decimals are one item; sentence boundaries remain a candidate.
   clean=re.sub(r'\b(?:[A-Z]\.){2,}','ABBR',flat);clean=re.sub(r'(?<=\d)\.(?=\d)','',clean);sentences=len(re.findall(r'[.!?]+(?=\s|$|[”"*])',clean))
   paragraph_rows.append({'lecture':n,'line':absolute,'characters':cnt,'sentences estimate':sentences,'diagnostic character limit':character_limit if character_limit else 'none in tone/spec','course rule':'4 sentences max','A/B':'B'})
   if not skip and sentences>4:add(n,fp.name,absolute,'paragraph-sentences',flat,'paragraph exceeds four-sentence rule candidate: '+str(sentences))
   if not skip and character_limit and cnt>character_limit:add(n,fp.name,absolute,'diagnostic-character-length',flat,'supplied diagnostic ceiling, not repository rule')
   if not skip and len(flat)>=30 and re.search(r'## [12]\.',body[:body.find(block)]):
    # Only blocks 1/2 are explanation repetition; procedural boilerplate is separate.
    prefix=body[:body.find(block)];current_section=re.findall(r'## (\d)\.',prefix)
    if current_section and current_section[-1] in ['1','2']:
     repeat[re.sub(r'\b\d+강\b','N강',flat)].append({'lecture':n,'line':absolute,'text':flat})
     for sent in re.split(r'(?<=[.!?])\s+',flat):
      if len(sent)>=20 and re.search('[가-힣]',sent):repeat['sentence: '+sent].append({'lecture':n,'line':absolute,'text':sent})
 # Manually checked explanations distinguish naming and examples from definitions.
 known={'LRE':61,'clear l':4,'dark l':4,'강세':1,'강세 박자':1,'구개음화':5,'기능어':1,'내용어':1,'레지스터':20,'모음 삽입':2,'표기 유도 오류':2,'연음':11,'축약':7,'음절 박자':1,'유성음':8,'무성음':8,'청크':16,'자음군':2,'불파':45,'탈락':45,'자음 흡수':11,'선언 지식':25,'절차 지식':25,'자동화':25,'인출':16,'억양':15,'문말 억양':15,'문장 강세':14,'약모음':12,'화석화':7}
 naming_only={'명사','동사','형용사','부사','의문사','관사','전치사','접속사','대명사','조동사','주어','목적어','서술어','과거분사','음운','인칭','3인칭','초성','중성','종성','최소대립쌍','관계대명사','수식','repair','화용','정형','시제','모음','자음','음절','원형','단순 과거','공손성'}
 for term,occ in sorted(seen_terms.items()):
  first=occ[0];body_occ=[x for x in occ if '예고' not in x['section']];first_body=body_occ[0] if body_occ else first;defs=def_candidates.get(term,[]);defined=next((x for x in defs if '예고' not in x['section']),None)
  if term in known:
   nn=known[term];defined=next((x for x in occ if x['lecture']==nn and '예고' not in x['section']),None)
  elif term in naming_only:defined=None
  terms.append({'term':term,'first use lecture':first['lecture'],'first use line':first['line'],'first substantive lecture':first_body['lecture'],'explanation lecture candidate':defined['lecture'] if defined else 'not found','explanation line candidate':defined['line'] if defined else '', 'first context':first['context'],'explanation context':defined['context'] if defined else '명시 풀이 후보 없음. 이름만 나열한 목록은 뜻 풀이로 인증하지 않음.','status':'candidate; explanation quality requires manual review','A/B':'B'})
  if not defined or defined['lecture']>first_body['lecture']:add(first_body['lecture'],f'eng2p_q{(first_body["lecture"]-1)//24+1}_l{first_body["lecture"]:03}.md',first_body['line'],'term-before-explanation',term,'No same/earlier explicit explanation candidate; preview excluded')
 repeats=[]
 for t,occ in repeat.items():
  lectures=sorted({v['lecture'] for v in occ})
  if len(lectures)>1:repeats.append({'lectures':','.join(map(str,lectures)),'paragraph':t,'occurrences':len(occ),'status':'repetition candidate, intentional recurrence possible','A/B':'B'});add(lectures[0],'multiple',occ[0]['line'],'repeated-explanation',t,'same explanation across '+str(lectures))
 summary={'lectures':len(texts),'by quarter':{f'Q{i}':sum((n-1)//24+1==i for n in texts) for i in range(1,5)},'findings':len(findings),'by kind':dict(collections.Counter(x['kind'] for x in findings)),'paragraph character limit':None,'actual quoted rule':'spec.md 14: 한 문단 4문장 이내.','terms':len(terms),'repeated explanation groups':len(repeats),'Latin check scope':'supplied English evidence; no complete CEFR table','handouts':sum((hd/f'eng2p_handout_l{n:03}.md').exists() for n in range(1,97)),'findings rows':findings}
 return summary,{'terms_KO':terms,'paragraphs_KO':paragraph_rows,'latin_candidates':english,'repeats_KO':repeats}
def main():
 p=argparse.ArgumentParser();p.add_argument('--study',required=True);p.add_argument('--lectures');p.add_argument('--handouts');p.add_argument('--character-limit',type=int);p.add_argument('--out');a=p.parse_args();summary,tables=run(a.study,a.lectures,a.handouts,a.character_limit)
 if a.out:
  out=pathlib.Path(a.out).resolve();root=pathlib.Path(a.study).resolve()
  if root==out or root in out.parents:raise ValueError('outputs must be outside original study tree')
  out.mkdir(parents=True,exist_ok=True);(out/'G36_summary.json').write_text(safe(json.dumps(summary,ensure_ascii=False,indent=2))+'\n')
  for name,rows in tables.items():
   if not rows:continue
   with (out/f'G36_{name}.csv').open('w',newline='') as f:w=csv.DictWriter(f,list(rows[0]),lineterminator='\n');w.writeheader();w.writerows({k:safe(v) for k,v in row.items()} for row in rows)
 print(f"G36_checker: {summary['lectures']} lectures, {summary['findings']} findings");return 1 if summary['findings'] else 0
if __name__=='__main__':sys.exit(main())
