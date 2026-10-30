import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const base='data/stage2-handoff';
const out='data/stage2-gold-r01';
assert(!fs.existsSync(out),'Preserve existing review artifacts');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const planBytes=fs.readFileSync(`${base}/annotations/annotation-plan.json`);
const plan=JSON.parse(planBytes);
const papers=new Map([2012,2013,2023].map(year=>[year,JSON.parse(fs.readFileSync(`${base}/reviewed-pilots/${year}/content-v4.json`))]));
fs.mkdirSync(out,{recursive:true});
const items=plan.records.filter(r=>r.status==='checked').map(r=>{
 const p=papers.get(r.year),q=p.questions.find(q=>q.id===r.questionId);
 assert(q,r.questionId);
 return {questionId:q.id,questionVersionId:r.questionVersionId,year:r.year,typeId:q.typeId,responseType:q.responseType,text:q.text,options:q.options,material:q.materialId?p.materials.find(m=>m.id===q.materialId)?.text:null,evidence:q.evidence};
});
assert.equal(items.length,277);
const catalog=JSON.stringify({catalog:plan.catalog},null,2)+'\n';
fs.writeFileSync(`${out}/catalog.json`,catalog);
const files=[];
for(const year of [2012,2013,2023]){
 const bytes=JSON.stringify({schemaVersion:1,year,items:items.filter(q=>q.year===year)},null,2)+'\n';
 const file=`blind-${year}.json`;fs.writeFileSync(`${out}/${file}`,bytes);files.push({file,sha256:hash(bytes),count:items.filter(q=>q.year===year).length});
}
fs.writeFileSync(`${out}/manifest.json`,JSON.stringify({createdAt:new Date().toISOString(),baselinePlanSha256:hash(planBytes),catalogSha256:hash(catalog),count:items.length,files,status:'prepared_not_reviewed',excludedFields:['primaryId','primaryName','basis','keyEvidence','review','annotations','answer'],independence:'Must be reviewed by a fresh context without access to the original annotation plan; no gold conclusion exists yet.'},null,2)+'\n');
console.log('Prepared 277 label-free review inputs; not gold results.');
