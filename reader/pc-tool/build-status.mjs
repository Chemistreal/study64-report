// 오디오 저장소 GitHub Actions(inbox-build.mjs)가 '지금 몇 % 만들었는지'를 build-status 가지의 status.json 에 적는다.
// 아이폰 리더가 이 파일을 읽어 카드에 '서버에서 만드는 중 37% · 약 2시간 남음'을 보여 준다.
// - main이 아닌 따로 만든 빈 가지라 사이트 배포·워크플로를 부르지 않는다(워크플로는 main push에만 돈다).
// - 적기에 실패해도 오디오 만들기는 그대로 간다(기록만 남김).
// status.json = {format:'yeobaek-build-status', version:1, updated, run, current:{id,title,chars,stage,done,total,retries,etaSec,started}|null, queue:[{id,title,chars,wait:'queue'|'space'}]}
export const STATUS_BRANCH='build-status',STATUS_PATH='status.json';

export function makeStatusWriter({repo=process.env.GITHUB_REPOSITORY,token=process.env.GITHUB_TOKEN,fetchImpl=globalThis.fetch,minGapMs=120000,log=()=>{},now=()=>Date.now()}={}){
 const api='https://api.github.com/repos/'+repo;
 const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json','User-Agent':'yeobaek-audio-build'};
 const gh=async(p,opt={})=>{const r=await fetchImpl(api+p,{...opt,headers});const body=r.status===204?null:await r.json().catch(()=>null);return {status:r.status,ok:r.ok,body}};
 let sha=null,ready=false,lastAt=0,writing=Promise.resolve();
 const state={format:'yeobaek-build-status',version:1,updated:0,run:process.env.GITHUB_RUN_ID||'',current:null,queue:[]};
 async function ensureBranch(){
  if(ready)return;
  const f=await gh('/contents/'+STATUS_PATH+'?ref='+STATUS_BRANCH);
  if(f.ok){sha=f.body?.sha||null;ready=true;return}
  const ref=await gh('/git/ref/heads/'+STATUS_BRANCH);
  if(ref.status===404){
   const t=await gh('/git/trees',{method:'POST',body:JSON.stringify({tree:[{path:'README.md',mode:'100644',type:'blob',content:'현수 오디오 만들기 진행 상황(리더가 읽음). 사이트와 무관한 빈 가지입니다.\n'}]})});
   const c=await gh('/git/commits',{method:'POST',body:JSON.stringify({message:'build-status 가지 만들기',tree:t.body.sha,parents:[]})});
   await gh('/git/refs',{method:'POST',body:JSON.stringify({ref:'refs/heads/'+STATUS_BRANCH,sha:c.body.sha})});
  }
  ready=true;
 }
 async function put(){
  state.updated=now();
  const body={message:'진행 '+(state.current?state.current.id+' '+(state.current.total?Math.floor(100*state.current.done/state.current.total):0)+'%':'쉼'),content:Buffer.from(JSON.stringify(state)).toString('base64'),branch:STATUS_BRANCH,...(sha?{sha}:{})};
  let r=await gh('/contents/'+STATUS_PATH,{method:'PUT',body:JSON.stringify(body)});
  if(r.status===409||r.status===422){const f=await gh('/contents/'+STATUS_PATH+'?ref='+STATUS_BRANCH);sha=f.ok?f.body?.sha:null;r=await gh('/contents/'+STATUS_PATH,{method:'PUT',body:JSON.stringify({...body,...(sha?{sha}:{})})})}
  if(r.ok)sha=r.body?.content?.sha||sha;else log('진행 기록을 적지 못함 '+r.status);
 }
 // force=true: 단계가 바뀔 때(시작·끝·실패) 바로 적는다. 아니면 minGapMs마다 한 번.
 function update(patch,{force=false}={}){
  Object.assign(state,patch);
  if(!repo||!token)return writing;
  if(!force&&now()-lastAt<minGapMs)return writing;
  lastAt=now();
  writing=writing.then(async()=>{try{await ensureBranch();await put()}catch(e){log('진행 기록을 적지 못함 '+(e?.message||e))}});
  return writing;
 }
 return {update,state,flush:()=>writing};
}
