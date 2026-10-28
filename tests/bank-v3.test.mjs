import test from 'node:test';
import assert from 'node:assert/strict';
import {validateBankImport,importCandidate} from '../server/bank-import.mjs';
import {openDatabase} from '../server/db.mjs';
import {createUser} from '../server/security.mjs';
import {reviewContent,reviewBatch,contentDetail} from '../server/bank.mjs';
import {approvedDetail} from '../server/approved-bank.mjs';
import {questionText,questionLabel,answerLabel} from '../web/modules/bank-format.mjs';
function sample(){return {schemaVersion:3,dataset:'candidate',source:{id:'synthetic-v3',version:1,year:2005,title:'Synthetic',revisionNote:'test only'},documents:[{id:'answers',name:'Synthetic key',kind:'answers',sha256:'a'.repeat(64),provenance:'user_confirmed_reference'}],parts:[{id:'V',label:'Verb forms',component:'grammar',order:1},{id:'VII',label:'Writing',component:'writing',order:2}],types:[{id:'verb',label:'Verb form'},{id:'writing',label:'Writing'}],materials:[],knowledgePoints:[],questions:[{id:'v1',version:1,originalNo:101,originalLabel:'Part V · 1',responseType:'verb_form',gradingMode:'manual',annotations:[],partId:'V',typeId:'verb',materialId:null,text:'Nous (aller) ___ demain.',options:{},answer:{value:'irons',evidence:{documentId:'answers',location:'p1 q1',quote:'1. irons'}},explanation:null,classification:null},{id:'writing',version:1,originalNo:102,originalLabel:'Part VII',responseType:'writing',gradingMode:'manual',annotations:[],partId:'VII',typeId:'writing',materialId:null,text:'Write an essay.',options:{},answer:{value:null,evidence:null,status:'missing_reference'},explanation:null,classification:null}]};}
test('v3 non-choice content imports and reviews without entering automatic grading or association publication',async()=>{
 const data=sample();assert.equal(validateBankImport(data).valid,true);
 const db=openDatabase(':memory:');try{const actor=await createUser(db,'v3-admin','synthetic-password-123','admin');const r=importCandidate(db,data,actor.id);assert.equal(r.status,'candidate');assert.deepEqual(contentDetail(db,r.id).payload.questions,data.questions);reviewContent(db,r.id,{expectedRevision:0,questionIds:['v1','writing'],decision:'approved'},actor.id);assert.equal(approvedDetail(db,r.id,'v1').question.gradingMode,'manual');assert.equal(approvedDetail(db,r.id,'v1').question.answer.value,'irons');assert.throws(()=>reviewBatch(db,r.id,{expectedRevision:0,questionIds:['v1'],decision:'approved',reason:'test',acknowledgeIssues:true},actor.id),{code:'UNVERIFIED_EVIDENCE'});assert.equal(db.prepare('SELECT count(*) n FROM sources').get().n,0);}finally{db.close();}
});
test('v3 rejects invented options, automatic grading of prose and missing answer evidence',()=>{
 for(const mutate of [v=>v.questions[0].options={A:'irons',B:'allons'},v=>v.questions[0].gradingMode='choice',v=>v.questions[0].answer.evidence=null,v=>v.questions[0].answer.value='',v=>v.questions[0].originalLabel='',v=>v.questions[0].annotations=[{kind:'underline',start:0,end:999}],v=>v.schemaVersion=2]){const d=sample();mutate(d);assert.equal(validateBankImport(d).valid,false);}
});
test('bank display preserves Unicode underline offsets and escapes text',()=>{
 const q={text:'😀 <chat>',originalLabel:'V · 1',gradingMode:'manual',annotations:[{kind:'underline',start:2,end:8}]};assert.equal(questionText(q),'😀 <u>&lt;chat&gt;</u>');assert.equal(questionLabel(q),'V · 1');assert.match(answerLabel(q),/人工评阅/);
});
test('conflicting references are importable but must retain distinct evidence and a null grading answer',()=>{
 const d=sample();d.questions[0].answer={value:null,evidence:null,status:'conflicting_reference',alternatives:[{value:'irons',evidence:{documentId:'answers',location:'p1',quote:'1 irons'}},{value:'allons',evidence:{documentId:'answers',location:'p2',quote:'1 allons'}}]};assert.equal(validateBankImport(d).valid,true);
 for(const change of [a=>a.value='irons',a=>a.alternatives.pop(),a=>a.alternatives[1].value='irons',a=>a.alternatives[0].evidence=null]){const bad=structuredClone(d);change(bad.questions[0].answer);assert.equal(validateBankImport(bad).valid,false);}
});
