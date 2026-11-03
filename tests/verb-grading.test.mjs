import test from 'node:test';
import assert from 'node:assert/strict';
import {gradeVerbAnswer} from '../server/verb-grading.mjs';
import {makeReport} from '../server/domain.mjs';
import {miniCatalog} from '../server/mini-exam.mjs';
test('verb grading accepts listed forms and typography, preserving accents and distinctions',()=>{
 const answer={value:'satisfît',accepted:['satisfasse']};
 assert.equal(gradeVerbAnswer(' SATISFÎT ',answer),'correct');assert.equal(gradeVerbAnswer('satisfasse',answer),'correct');assert.equal(gradeVerbAnswer('satisfit',answer),'wrong');assert.equal(gradeVerbAnswer(' ',answer),'unanswered');assert.equal(gradeVerbAnswer('texte',{}),'manual');assert.equal(gradeVerbAnswer("m'a  fait asseoir",{value:'m’a fait asseoir'}),'correct');
});
test('all new Mini snapshots grade their own frozen verb references',()=>{
 let count=0;for(const paper of miniCatalog())for(const sheet of paper.sheets)for(const q of sheet.snapshot.questions.filter(q=>q.responseType==='text')){assert.equal(sheet.snapshot.verbGradingVersion,'fill-grading-v1.0');assert.equal(gradeVerbAnswer(q.answer.value,q.answer),'correct',q.id);for(const v of q.answer.accepted)assert.equal(gradeVerbAnswer(v,q.answer),'correct',q.id);count++;}assert.equal(count,420);
});
test('historical Mini remains manual while new Mini counts blanks and verb answers separately',()=>{
 const q=(id,value,accepted=[])=>({id,responseType:'text',answer:{value,accepted}});const a={mode:'mini',snapshot:{id:'x',answerKeyVersion:'user-reference-v1',questions:[q('a','fussent',['soient']),q('b','été'),q('c','est')],materials:[]},progress:{answers:[{questionId:'a',choice:'soient'},{questionId:'b',choice:'ete'}],effectiveMs:0,materialTimes:{}}};
 assert.deepEqual(makeReport(a).items.map(x=>x.result),['manual','manual','manual']);a.snapshot.verbGradingVersion='verb-exact-v1';const r=makeReport(a);assert.deepEqual(r.items.map(x=>x.result),['correct','wrong','unanswered']);assert.deepEqual(r.stats.verb,{total:3,correct:1,wrong:1,unanswered:1,manual:0});assert.equal(r.stats.gradable,0);
});

test('context variants keep standards frozen and defer unresolved mismatches',()=>{
 const sheet=miniCatalog().find(x=>x.sitting==='2023').sheets[1];const get=id=>sheet.snapshot.questions.find(q=>q.id===id).answer;
 assert.equal(get('2023-V01').value,"J'ai éteint");assert.equal(gradeVerbAnswer('ai éteint',get('2023-V01'),{deferUnreviewed:true}),'correct');
 assert.equal(gradeVerbAnswer('me suis mis',get('2023-V02'),{deferUnreviewed:true}),'correct');assert.equal(gradeVerbAnswer('me suis mise',get('2023-V02')),'wrong');
 assert.equal(gradeVerbAnswer('possible autre forme',get('2023-V03')),'wrong');assert.equal(gradeVerbAnswer(' ',get('2023-V03'),{deferUnreviewed:true}),'unanswered');
});
test('2009 context accepts only the confirmed blank forms while retaining the standard',()=>{
 const papers=miniCatalog().find(p=>p.sitting==='2009').sheets.flatMap(s=>s.snapshot.questions);const answer=id=>papers.find(q=>q.id===id).answer;
 assert.equal(gradeVerbAnswer('a demandé',answer('2009-V01'),{deferUnreviewed:true}),'correct');
 assert.equal(gradeVerbAnswer('ai dit',answer('2009-V03'),{deferUnreviewed:true}),'correct');
 assert.equal(gradeVerbAnswer('était',answer('2009-V04'),{deferUnreviewed:true}),'correct');
 assert.equal(gradeVerbAnswer('ai répondu',answer('2009-V08'),{deferUnreviewed:true}),'correct');
 assert.equal(gradeVerbAnswer('avais déjà fait',answer('2009-V09'),{deferUnreviewed:true}),'correct');
 assert.equal(gradeVerbAnswer('avais deja fait',answer('2009-V09')),'wrong');
});
test('user-approved rule grades all 420 references and wrong entries without claiming independent review',()=>{
 let count=0;for(const p of miniCatalog())for(const sheet of p.sheets)for(const q of sheet.snapshot.questions.filter(q=>q.responseType==='text')){
  assert.equal(q.answer.inputReviewStatus,'user-approved',q.id);assert.equal(gradeVerbAnswer(q.answer.value,q.answer),'correct',q.id);assert.equal(gradeVerbAnswer('不匹配的作答',q.answer),'wrong',q.id);count++;
 }assert.equal(count,420);
});
