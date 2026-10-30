// Explicit allowlist export: no credentials, request/config files, databases or user data.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const [sourceRoot,reviewRoot,annotationRoot,firstPlan,output]=process.argv.slice(2);
if(!output||fs.existsSync(output))throw Error('Usage: stage2-export-web-handoff.mjs MD_BATCH REVIEW_ROOT ANNOTATION_ROOT FIRST_PLAN NEW_OUTPUT');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,'')),sha=b=>createHash('sha256').update(b).digest('hex');
const files=[];
function put(relative,bytes){const file=path.join(output,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);files.push({path:relative.replaceAll('\\','/'),bytes:Buffer.byteLength(bytes),sha256:sha(bytes)});}
const json=(relative,data)=>put(relative,JSON.stringify(data,null,2)+'\n');
const original=read(path.join(sourceRoot,'sources.json')),items=[];
for(const item of original.items){
 assert(/^[a-zA-Z0-9-]+$/.test(item.id));
 const dir=path.join(sourceRoot,'output',item.id),state=read(path.join(dir,'state.json')),result=read(path.join(dir,'result.json'));
 assert.equal(state.status,'completed');assert.equal(path.basename(state.output),state.output);
 const md=fs.readFileSync(path.join(dir,state.output));assert.equal(sha(md),state.outputSha256);
 const pages=result.markdown.pages.map((p,i)=>({page_number:p.page_number??i+1,markdown:p.markdown}));
 assert(pages.every(p=>typeof p.markdown==='string'));
 items.push({id:item.id,sitting:item.sitting,role:item.role,expectedPages:item.expectedPages});
 put('md-batch/output/'+item.id+'/'+state.output,md);
 json('md-batch/output/'+item.id+'/result.json',{markdown:{pages}});
 json('md-batch/output/'+item.id+'/state.json',{status:'completed',output:state.output,inputSha256:state.inputSha256,outputSha256:state.outputSha256,pages:pages.length});
}
assert.equal(items.length,42);
json('md-batch/sources.json',{note:'Portable allowlist projection; MD bytes unchanged; result.json retains only original markdown page numbers/text. No API configuration or job credentials.',items});
put('reviewed-pilots/manifest.json',fs.readFileSync(path.join(reviewRoot,'manifest.json')));
for(const year of ['2012','2013','2023'])for(const name of ['content-v4.json','review-ledger.json','validation.json'])put('reviewed-pilots/'+year+'/'+name,fs.readFileSync(path.join(reviewRoot,year,name)));
put('annotations/annotation-plan-v1.json',fs.readFileSync(firstPlan));
put('annotations/annotation-plan.json',fs.readFileSync(path.join(annotationRoot,'annotation-plan.json')));
const plan=read(path.join(annotationRoot,'annotation-plan.json'));
assert.equal(plan.review.sourcePlanSha256,sha(fs.readFileSync(firstPlan)));
json('handoff-manifest.json',{createdDate:'2026-10-30',format:1,documents:items.length,pages:items.reduce((n,i)=>n+read(path.join(sourceRoot,'output',i.id,'result.json')).markdown.pages.length,0),sittings:[...new Set(items.map(i=>i.sitting))],objectiveRecords:plan.records.length,available:277,pending:83,containsDatabase:false,containsCredentials:false,files:[...files]});
console.log(JSON.stringify({files:files.length,bytes:files.reduce((n,f)=>n+f.bytes,0),output}));
