import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {openDatabase} from '../server/db.mjs';
import {createUser} from '../server/security.mjs';
import {validateBankImport} from '../server/bank-import.mjs';
import {validateProduction,importProduction,fileSha256} from '../server/bank-production.mjs';
import {reviewContent,contentDetail,reviewBatch,publishBatch} from '../server/bank.mjs';
import {approvedDetail,listApproved} from '../server/approved-bank.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL(`../data/${name}`,import.meta.url)));
for(const year of [2023,2024])test(`${year} proofread batch has full source coverage, no fabricated key, independent content approval`,async()=>{
 const data=read(`${year}-stage2-candidate.json`),proof=read(`${year}-stage2-proofread.json`);assert.equal(validateBankImport(data).valid,true);assert.equal(validateProduction(data,proof),true);assert.equal(fileSha256(new URL(`../data/${year}-stage2-candidate.json`,import.meta.url)),proof.candidateSha256);assert.deepEqual(data.questions.map(q=>q.originalNo),Array.from({length:100},(_,i)=>i+1));assert.equal(data.materials.filter(m=>m.kind==='reading').length,4);assert.ok(data.questions.every(q=>q.answer.status==='missing_reference'&&q.answer.value===null&&q.explanation===null));
 const bad=structuredClone(data);bad.questions[0].answer.value='A';assert.equal(validateBankImport(bad).valid,false);
 const db=openDatabase(':memory:');try{const actor=await createUser(db,'production-test','production-test-password','admin');const imported=importProduction(db,data,proof,actor.id);assert.equal(importProduction(db,data,proof,actor.id).duplicate,true);assert.equal(contentDetail(db,imported.id).production.pageCount,year===2023?20:25);reviewContent(db,imported.id,{expectedRevision:0,questionIds:data.questions.map(q=>q.id),decision:'approved'},actor.id);assert.equal(listApproved(db,{year:String(year)}).total,100);assert.equal(approvedDetail(db,imported.id,'q1').question.answer.value,null);assert.throws(()=>reviewBatch(db,imported.id,{expectedRevision:0,questionIds:['q1'],decision:'approved',reason:'test'},actor.id),{code:'UNVERIFIED_EVIDENCE'});assert.throws(()=>publishBatch(db,imported.id,{expectedRevision:0},actor.id),{code:'NOTHING_APPROVED'});assert.equal(db.prepare('SELECT count(*) n FROM sources').get().n,0);}finally{db.close();}
});
test('production evidence rejects incomplete review, wrong text, excluded documents and fake OCR quality',()=>{
 const data=read('2024-stage2-candidate.json'),proof=read('2024-stage2-proofread.json');
 for(const mutate of [p=>p.reviewedPages.pop(),p=>p.ocr.mode='Fast',p=>p.questionEvidence.pop(),p=>p.questionEvidence[0].normalizedText='wrong',p=>p.missingReferenceAnswers=0,p=>p.materials=[]]){const p=structuredClone(proof);mutate(p);assert.throws(()=>validateProduction(data,p));}
 const d=structuredClone(data);d.documents.push({...d.documents[0],id:'out-of-scope',kind:'transcript'});assert.throws(()=>validateProduction(d,proof));
});
