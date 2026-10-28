// Independent artifact audit: evidence slices, coverage, target positions, references and import preservation.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateContent} from '../server/stage2.mjs';
const [root,reportFile]=process.argv.slice(2);
if(!root||!reportFile)throw Error('Usage: stage2-verify-pilot-review.mjs REVIEW_DIR NEW_REPORT_JSON');
if(fs.existsSync(reportFile))throw Error('Keep prior audit report; choose new file');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8')),hash=s=>createHash('sha256').update(s).digest('hex');
const imported=read(path.join(root,'import-report.json'));
assert.equal(imported.preexistingRowsPreserved,true);assert.equal(imported.independentRestoreVerified,true);assert.equal(imported.published,false);
const report={createdAt:new Date().toISOString(),method:'independent structural/evidence audit after authored MD review; not a second semantic or PDF review',pdfVisualReview:false,fullStage2Acceptance:false,preexistingTablesPreserved:imported.preexistingTables,independentRestoreVerified:true,years:[]};
for(const year of [2012,2013,2023]){
 const raw=fs.readFileSync(path.join(root,String(year),'content-v4.json'),'utf8'),data=JSON.parse(raw),ledger=read(path.join(root,String(year),'review-ledger.json'));
 assert.equal(hash(raw),ledger.outputSha256);assert.equal(validateContent(data).valid,true);
 assert.equal(data.questions.length,122);assert.equal(ledger.decisions.length,122);assert.equal(new Set(ledger.decisions.map(d=>d.questionId)).size,122);
 assert.deepEqual(data.questions.filter(q=>q.responseType==='choice').map(q=>Number(q.originalLabel)).sort((a,b)=>a-b),Array.from({length:100},(_,i)=>i+1));
 assert.equal(new Set(data.questions.map(q=>q.order)).size,122);
 const evidence=s=>{const d=data.documents.find(x=>x.id===s.documentId),p=d?.pages.find(x=>x.page===s.page);assert(p);assert.equal(Array.from(p.markdown).slice(s.start,s.end).join(''),s.quote);};
 for(const q of data.questions){q.evidence.forEach(evidence);for(const a of q.annotations)assert(Array.from(q.text).slice(a.start,a.end).join('').trim());assert.equal(q.answer.value,null);for(const c of q.answer.candidates)assert(data.references.some(r=>r.id===c.referenceId));assert.equal(q.options.length,q.responseType==='choice'?(Number(q.originalLabel)<=20?3:4):0);}
 for(const r of data.references)r.evidence.forEach(evidence);
 for(const m of data.materials){m.evidence.forEach(evidence);for(const qid of m.questionIds)assert.equal(data.questions.find(q=>q.id===qid)?.materialId,m.id);}
 for(const c of data.corrections)c.evidence.forEach(evidence);
 for(const s of ledger.sectionReviews)s.evidence.forEach(evidence);
 assert.equal(ledger.verbMappings.length,20);assert.deepEqual(ledger.verbMappings.map(m=>m.blankIndex),Array.from({length:20},(_,i)=>i+1));
 for(const m of ledger.verbMappings){const material=data.materials.find(x=>x.id===m.materialId);assert.equal(Array.from(material.text).slice(m.target.start,m.target.end).join(''),m.target.quote);evidence(m.referenceEvidence);assert(m.referenceEvidence.quote.includes(m.rawAnswer));}
 const open=data.issues.filter(i=>i.status==='open'),blocked=new Set(open.filter(i=>i.severity==='blocking').map(i=>i.questionId));
 const i=imported.results.find(x=>x.year===year);assert.equal(i.blocked,blocked.size);assert.equal(i.contentReviewPassed,122-blocked.size);
 report.years.push({year,paperVersion:data.paperVersion,outputSha256:hash(raw),reviewed:122,materialsReviewed:data.materials.length,corrections:data.corrections.length,contentReviewPassed:i.contentReviewPassed,sourceBlocked:blocked.size,answerStatuses:Object.fromEntries([...new Set(data.questions.map(q=>q.answer.status))].map(s=>[s,data.questions.filter(q=>q.answer.status===s).length])),published:false,openIssues:open,items:ledger.decisions.map(d=>({questionId:d.questionId,version:d.version,status:d.status,checks:d.checks,sourcePages:d.sourceEvidence.map(e=>({documentId:e.documentId,page:e.page})),notes:d.notes})),verbMappings:ledger.verbMappings,tasks:ledger.tasks});
}
report.totalReviewed=report.years.reduce((s,y)=>s+y.reviewed,0);report.totalContentReviewPassed=report.years.reduce((s,y)=>s+y.contentReviewPassed,0);report.totalSourceBlocked=report.years.reduce((s,y)=>s+y.sourceBlocked,0);report.totalVerbMappings=report.years.reduce((s,y)=>s+y.verbMappings.length,0);
fs.mkdirSync(path.dirname(reportFile),{recursive:true});fs.writeFileSync(reportFile,JSON.stringify(report,null,2));
console.log(JSON.stringify({reviewed:report.totalReviewed,contentReviewPassed:report.totalContentReviewPassed,sourceBlocked:report.totalSourceBlocked,verbMappings:report.totalVerbMappings,preexistingTablesPreserved:report.preexistingTablesPreserved,independentRestoreVerified:true}));
