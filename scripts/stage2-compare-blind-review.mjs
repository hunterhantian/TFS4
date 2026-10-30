import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const root='data/stage2-gold-r01';
const plan=JSON.parse(fs.readFileSync('data/stage2-handoff/annotations/annotation-plan.json'));
const manifest=JSON.parse(fs.readFileSync(`${root}/manifest.json`));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
assert.equal(sha(fs.readFileSync('data/stage2-handoff/annotations/annotation-plan.json')),manifest.baselinePlanSha256);
const summaries=[];
for(const year of [2012,2013,2023]){
 const bytes=fs.readFileSync(`${root}/blind-${year}.json`);
 assert.equal(sha(bytes),manifest.files.find(f=>f.file===`blind-${year}.json`).sha256);
 const input=JSON.parse(bytes),review=JSON.parse(fs.readFileSync(`${root}/review-${year}.json`));
 const records=review.records||review.items||review.reviews||review.results;
 assert(Array.isArray(records),'Review records required');assert.equal(records.length,input.items.length);
 assert.equal(new Set(records.map(r=>r.questionId)).size,records.length);
 const disagreements=[];let agree=0,uncertain=0;
 for(const q of input.items){
  const r=records.find(r=>r.questionId===q.questionId),old=plan.records.find(r=>r.questionId===q.questionId);
  assert(r,q.questionId);assert(r.quote&&r.rationale,'Evidence required: '+q.questionId);
  if(r.primaryId)assert(plan.catalog.some(n=>n.id===r.primaryId&&n.leaf),'Unknown leaf: '+r.primaryId);
  if(r.status==='uncertain'||!r.primaryId){uncertain++;disagreements.push({questionId:q.questionId,previous:old.primaryId,independent:r.primaryId,status:r.status,quote:r.quote,rationale:r.rationale});}
  else if(r.primaryId===old.primaryId)agree++;
  else disagreements.push({questionId:q.questionId,previous:old.primaryId,independent:r.primaryId,status:r.status,quote:r.quote,rationale:r.rationale});
 }
 summaries.push({year,count:records.length,agreement:agree,uncertain,disagreements,reviewSha256:sha(fs.readFileSync(`${root}/review-${year}.json`))});
}
const report={createdAt:new Date().toISOString(),status:'unblinded_pending_adjudication',notAccuracy:true,note:'Agreement is not independent semantic accuracy. No publication, answer adoption or gold approval.',summaries};
fs.writeFileSync(`${root}/comparison.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(summaries.map(({disagreements,...s})=>({...s,needsAdjudication:disagreements.length})),null,2));
