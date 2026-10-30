// Manual-only offline preflight / LlamaParse v2 batch. No third-party dependencies.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)),args=process.argv.slice(2);
let check=false,retry=false,only=null,manifestFile=path.join(root,'sources.json'),out=path.join(root,'output');
for(let i=0;i<args.length;i++){
 const a=args[i];if(a==='--check')check=true;else if(a==='--retry-failed')retry=true;
 else if(['--only','--manifest','--output'].includes(a)){const value=args[++i];if(!value||value.startsWith('--'))throw Error('Missing value: '+a);if(a==='--only')only=value;else if(a==='--manifest')manifestFile=path.resolve(value);else out=path.resolve(value);}
 else throw Error('Unknown argument: '+a);
}
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),read=async f=>JSON.parse((await fs.readFile(f,'utf8')).replace(/^\uFEFF/,''));
const optional=async f=>{try{return await read(f);}catch(e){if(e.code==='ENOENT')return null;throw e;}};
async function save(file,data){await fs.writeFile(file+'.tmp',JSON.stringify(data,null,2)+'\n');await fs.rename(file+'.tmp',file);}
const manifest=await read(manifestFile),config=manifest.config,fingerprint=sha(JSON.stringify(config));
if(!config||!Array.isArray(manifest.items)||!manifest.items.length)throw Error('Invalid manifest');
if(new Set(manifest.items.map(x=>x.id)).size!==manifest.items.length)throw Error('Duplicate IDs');
const sources=manifest.items.filter(x=>!only||x.id===only);if(!sources.length)throw Error('Unknown --only ID');
let pagesTotal=0;
for(const s of sources){
 if(!/^[a-zA-Z0-9-]+$/.test(s.id)||!path.isAbsolute(s.input)||!Number.isInteger(s.expectedPages)||s.expectedPages<1)throw Error('Invalid source '+s.id);
 const bytes=await fs.readFile(s.input);if(bytes.subarray(0,5).toString()!=='%PDF-')throw Error('Not a PDF: '+s.input);
 if(sha(bytes)!==s.inputSha256)throw Error('Source hash changed: '+s.id);
 pagesTotal+=s.expectedPages;console.log(`${s.id} | ${s.expectedPages} pages | ${(bytes.length/1048576).toFixed(2)} MiB | ${s.input}`);
}
console.log(`Selected ${sources.length} PDFs / ${pagesTotal} pages | ${JSON.stringify(config)}`);
if(check){console.log('Local checks passed. No key read; no API requests.');process.exit(0);}
const key=(process.env.LLAMA_CLOUD_API_KEY??await fs.readFile(process.env.LLAMA_KEY_FILE??manifest.keyFile,'utf8')).replace(/^\uFEFF/,'').trim();
if(!key||/\s/.test(key))throw Error('API key must be one bare token');
await fs.mkdir(out,{recursive:true});const lock=path.join(out,'run.lock');
try{await fs.writeFile(lock,JSON.stringify({pid:process.pid,startedAt:new Date().toISOString()}),{flag:'wx'});}catch(e){if(e.code==='EEXIST')throw Error('run.lock exists; confirm old process stopped before manually removing it.');throw e;}
const clean=x=>String(x).split(key).join('[REDACTED]');
async function log(x){const line=`[${new Date().toISOString()}] ${clean(x)}`;console.log(line);await fs.appendFile(path.join(out,'run.log'),line+'\n');}
async function api(route,options={}){
 const get=!options.method||options.method==='GET';
 for(let attempt=0;;attempt++){
  try{
   const response=await fetch('https://api.cloud.llamaindex.ai'+route,{...options,headers:{Authorization:'Bearer '+key,Accept:'application/json',...options.headers},signal:AbortSignal.timeout(180000),redirect:'error'});
   if(get&&(response.status===429||response.status>=500)&&attempt<3){await new Promise(r=>setTimeout(r,3000*(attempt+1)));continue;}
   const body=await response.text();let json;try{json=JSON.parse(body);}catch{const e=Error('Non-JSON API response: HTTP '+response.status);e.httpStatus=response.status;throw e;}
   if(!response.ok){const e=Error('HTTP '+response.status+': '+clean(JSON.stringify(json)).slice(0,800));e.httpStatus=response.status;throw e;}return json;
  }catch(e){if(get&&!e.httpStatus&&attempt<3){await new Promise(r=>setTimeout(r,3000*(attempt+1)));continue;}throw e;}
 }
}
const results=[];
try{
 for(const s of sources){
  const dir=path.join(out,s.id);await fs.mkdir(dir,{recursive:true});const stateFile=path.join(dir,'state.json');let state=await optional(stateFile);
  try{
   await log('Processing '+s.id);
   if(state&&(state.inputSha256!==s.inputSha256||state.configFingerprint!==fingerprint))throw Error('Input/config changed; preserve old output and choose a new --output directory.');
   state??={id:s.id,inputSha256:s.inputSha256,configFingerprint:fingerprint,config,startedAt:new Date().toISOString()};
   if(state.status==='completed'){
    const existing=await fs.readFile(path.join(dir,state.output));if(sha(existing)!==state.outputSha256)throw Error('Completed MD changed; preserve edits and recover from result.json separately.');
    await log('Verified completed output; skipped without API call.');results.push({id:s.id,status:'skipped',pages:state.pages});continue;
   }
   if(state.status==='failed'){
    if(!retry)throw Error('Remote job failed. --retry-failed explicitly permits a new billed submission.');
    state.previousJobs??=[];state.previousJobs.push(state.jobId);delete state.jobId;delete state.submissionPending;state.status='retry';
   }
   if(state.submissionPending&&!state.jobId)throw Error('Submission outcome unknown. Find job in LlamaCloud and set jobId before resuming; do not blindly resubmit.');
   if(!state.jobId){
    const form=new FormData();form.append('file',new Blob([await fs.readFile(s.input)],{type:'application/pdf'}),path.basename(s.input));form.append('configuration',JSON.stringify(config));
    await save(path.join(dir,'request.json'),{endpoint:'/api/v2/parse/upload',config,inputSha256:s.inputSha256});
    state.submissionPending=true;await save(stateFile,state);
    let job;try{job=await api('/api/v2/parse/upload',{method:'POST',body:form});}catch(e){
     // Clear only explicit validation/auth rejection; timeout/5xx/unknown outcomes stay blocked.
     if([400,401,403,413,415,422].includes(e.httpStatus)){delete state.submissionPending;await save(stateFile,state);}throw e;
    }
    await save(path.join(dir,'submitted.json'),job);state.jobId=job.id;if(!state.jobId)throw Error('No job ID in upload response; inspect submitted.json before retry.');
    delete state.submissionPending;state.status='pending';await save(stateFile,state);
   }
   // Persist manually recovered IDs and retry state before polling.
   delete state.submissionPending;await save(stateFile,state);await log('Job '+state.jobId);
   const deadline=Date.now()+60*60*1000;let result;
   for(;;){
    result=await api('/api/v2/parse/'+encodeURIComponent(state.jobId)+'?expand=markdown,usage');await save(path.join(dir,'result.json'),result);
    const status=String(result.job?.status??result.status??'UNKNOWN').toUpperCase();
    if(['COMPLETED','SUCCESS','SUCCEEDED'].includes(status))break;
    if(['FAILED','ERROR','CANCELLED','CANCELED'].includes(status)){state.status='failed';await save(stateFile,state);throw Error('Remote job '+status);}
    if(!['PENDING','RUNNING','QUEUED','PROCESSING'].includes(status))throw Error('Unknown response status '+status+'; inspect result.json');
    if(Date.now()>deadline)throw Error('Polling timeout; rerun to resume same job.');await log(status);await new Promise(r=>setTimeout(r,10000));
   }
   const pages=result.markdown?.pages;if(!Array.isArray(pages)||!pages.length||pages.some(p=>typeof p.markdown!=='string'))throw Error('Invalid markdown pages');
   if(pages.length!==s.expectedPages)throw Error(`Page count ${pages.length} != expected ${s.expectedPages}; no complete flag. Inspect result.json.`);
   const md=pages.map(p=>p.markdown).join('\n\n---\n\n');if(!md.trim())throw Error('Empty Markdown');
   await fs.mkdir(path.join(dir,'pages'),{recursive:true});
   for(let i=0;i<pages.length;i++)await fs.writeFile(path.join(dir,'pages',String(i+1).padStart(4,'0')+'.md'),pages[i].markdown);
   const name=path.basename(s.input,'.pdf')+'.md';await fs.writeFile(path.join(dir,name),md);
   const pageMap=pages.map((p,i)=>({index:i+1,sourcePdfPage:p.page_number??i+1,empty:!p.markdown.trim(),sha256:sha(p.markdown)}));await save(path.join(dir,'pages.json'),pageMap);
   Object.assign(state,{status:'completed',completedAt:new Date().toISOString(),pages:pages.length,output:name,outputSha256:sha(md),emptyPages:pageMap.filter(p=>p.empty).map(p=>p.index),credits:result.job?.usage?.credits??null});await save(stateFile,state);
   await log(`Completed ${s.id}: ${pages.length} pages; empty pages ${state.emptyPages.length}; credits ${state.credits??'not returned'}`);
   results.push({id:s.id,status:'completed',pages:pages.length,emptyPages:state.emptyPages,credits:state.credits});
  }catch(e){await log('Needs attention: '+e.message);results.push({id:s.id,status:'error',message:clean(e.message)});if([401,403].includes(e.httpStatus))break;}
  await save(path.join(out,'summary.json'),{updatedAt:new Date().toISOString(),config,results});
 }
 await save(path.join(out,'summary.json'),{updatedAt:new Date().toISOString(),config,results});
 if(results.some(r=>r.status==='error'))process.exitCode=1;
 await log('Finished. See summary.json. MD output is not proofread or approved.');
}finally{await fs.unlink(lock);}
