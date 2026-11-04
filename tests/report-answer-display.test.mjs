import test from 'node:test';
import assert from 'node:assert/strict';
import {renderCandidateReport} from '../web/modules/candidate-report.mjs';
const item=(no,result,choice,reference='B')=>({question:{originalNo:no,component:'grammar',text:'Question',options:{A:'a',B:'b'},answer:{value:reference}},result,choice});
function html(items,referenceStatus='user-reference-v1') {const root={innerHTML:'',querySelectorAll:()=>[]};renderCandidateReport(root,{mode:'full_candidate',referenceStatus,items,materials:[],stats:{answered:3,total:4,correct:1,gradable:4,unanswered:1},effectiveMs:0});return root.innerHTML;}
test('report highlights only actually wrong answers and preserves unresolved status',()=>{const h=html([item(1,'wrong','A'),item(2,'correct','B'),item(3,'manual','A'),item(4,'unanswered',null)]);assert.doesNotMatch(h,/<th scope="col">结果<\/th>/);assert.match(h,/candidate-answer answer-wrong[^>]*>A<\/td>/);assert.match(h,/candidate-answer[^>]*>A <small class="answer-pending">待核对/);assert.match(h,/colspan="5"/);assert.equal((h.match(/answer-wrong/g)||[]).length,1);});
test('ungraded historical reports do not mark differences as incorrect',()=>{const h=html([item(1,'wrong','A')],'candidate');assert.doesNotMatch(h,/answer-wrong/);assert.match(h,/候选答案/);});
