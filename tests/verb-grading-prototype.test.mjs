import test from 'node:test';
import assert from 'node:assert/strict';
import {previewVerbGrade} from '../scripts/verb-grading-prototype.mjs';
test('prototype handles context, alternatives, accents and ambiguous blanks',()=>{
 assert.equal(previewVerbGrade({id:'2023-V01',response:'ai éteint'}).result,'correct');
 assert.equal(previewVerbGrade({id:'2023-V02',response:'me suis mis'}).result,'correct');
 assert.equal(previewVerbGrade({id:'2017-V04',response:'satisfasse'}).result,'correct');
 assert.equal(previewVerbGrade({id:'2017-V04',response:'satisfit'}).result,'wrong');
 assert.equal(previewVerbGrade({id:'2005-V01',response:'appelle'}).result,'manual');
 assert.equal(previewVerbGrade({id:'2005-V01',response:'  '}).result,'unanswered');
 assert.throws(()=>previewVerbGrade({id:'2020-V01',response:'x'}),/未找到/);
});
test('v1.0 Mini reports and prototype return the same result for all 420 blanks',async()=>{
 const {loadSynthesis}=await import('../server/synthesis.mjs');const {miniCatalog}=await import('../server/mini-exam.mjs');const {makeReport}=await import('../server/domain.mjs');const bank=loadSynthesis();let count=0;
 for(const paper of miniCatalog())for(const sheet of paper.sheets)for(const q of sheet.snapshot.questions.filter(q=>q.responseType==='text')){
  for(const value of [q.answer.value,'not-a-valid-answer','']){
   const preview=previewVerbGrade({id:q.id,response:value},bank);
   const a={mode:'mini',snapshot:{...sheet.snapshot,questions:[q]},progress:{answers:[{questionId:q.id,choice:value}],effectiveMs:0,materialTimes:{}}};
   assert.equal(makeReport(a).items[0].result,preview.result,`${q.id}: ${value}`);
  }count++;
 }assert.equal(count,420);
});
