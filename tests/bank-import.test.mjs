import test from 'node:test';
import assert from 'node:assert/strict';
import {openDatabase} from '../server/db.mjs';
import {createUser} from '../server/security.mjs';
import {createApp} from '../server/app.mjs';
import {validateBankImport,importCandidate} from '../server/bank-import.mjs';

function sample(){return {schemaVersion:2,dataset:'candidate',source:{id:'test-source',version:1,year:2025,title:'Synthetic test only',revisionNote:'test'},documents:[{id:'answers',name:'test answers',sha256:'a'.repeat(64),kind:'answers',provenance:'user_confirmed_reference'},{id:'explanations',name:'test explanations',sha256:'b'.repeat(64),kind:'explanations',provenance:'unconfirmed'}],parts:[{id:'IV',label:'Grammar',component:'grammar',order:1}],types:[{id:'mcq',label:'Choice'}],materials:[],knowledgePoints:[{id:'tense',name:'时态',aliases:['temps']}],questions:[{id:'q1',version:1,originalNo:1,partId:'IV',typeId:'mcq',materialId:null,text:'Test?',options:{A:'a',B:'b'},answer:{value:'A',evidence:{documentId:'answers',location:'p1',quote:'1 A'}},explanation:{documentId:'explanations',location:'p2',quote:'test explanation'},classification:{primaryId:'tense',auxiliaryIds:[],basis:'test explanation',producer:'external-test'}}]};}

test('unified import validates evidence, references, aliases, materials and rejects review flags',()=>{
 assert.equal(validateBankImport(sample()).valid,true);
 const changes=[v=>v.dataset='fixture',v=>v.questions[0].approved=true,v=>v.questions[0].answer.value='D',v=>v.questions[0].explanation.documentId='answers',v=>v.knowledgePoints.push({id:'other',name:' TEMPS ',aliases:[]}),v=>v.questions[0].classification.auxiliaryIds=['tense'],v=>v.questions[0].explanation=null,v=>v.parts[0].component='reading',v=>v.questions.push(structuredClone(v.questions[0])),v=>v.materials.push({id:'m',kind:'reading',text:'passage',questionIds:['missing']})];
 for(const change of changes){const v=sample();change(v);assert.equal(validateBankImport(v).valid,false);}
 for(const v of [null,[],{}, {schemaVersion:2,dataset:'candidate',source:null,documents:[null],questions:[null]}])assert.equal(validateBankImport(v).valid,false);
});

test('candidate import is idempotent, versioned, atomic and never writes Stage1 sources',async()=>{
 const db=openDatabase(':memory:');try{
  const user=await createUser(db,'test_admin','test-password-123','admin');
  const v=sample(),first=importCandidate(db,v,user.id);assert.equal(first.status,'candidate');
  assert.equal(importCandidate(db,Object.fromEntries(Object.entries(v).reverse()),user.id).id,first.id);
  const revised=structuredClone(v);revised.questions[0].text='Revision';assert.throws(()=>importCandidate(db,revised,user.id),{code:'SOURCE_VERSION_EXISTS'});
  revised.source.version=2;assert.equal(importCandidate(db,revised,user.id).status,'candidate');
  const bad=structuredClone(v);bad.questions[0].answer.value='D';assert.equal(importCandidate(db,bad,user.id).status,'invalid');
  assert.equal(db.prepare('SELECT count(*) n FROM bank_imports').get().n,3);
  assert.equal(db.prepare('SELECT count(*) n FROM sources').get().n,0);
 }finally{db.close();}
});

test('bank API requires admin, session, Origin and CSRF; candidate answers stay private',async()=>{
 const db=openDatabase(':memory:');const app=await createApp({db});
 try{
  await createUser(db,'bank_admin','test-password-123','admin');await createUser(db,'bank_user','test-password-123');
  const login=async username=>{const r=await app.inject({method:'POST',url:'/api/auth/login',headers:{origin:'http://127.0.0.1:4174'},payload:{username,password:'test-password-123'}});return {cookie:r.headers['set-cookie'].split(';')[0],origin:'http://127.0.0.1:4174','x-csrf-token':r.json().csrf};};
  const admin=await login('bank_admin'),user=await login('bank_user');
  assert.equal((await app.inject('/api/admin/bank/imports')).statusCode,401);
  assert.equal((await app.inject({url:'/api/admin/bank/imports',headers:user})).statusCode,403);
  assert.equal((await app.inject({method:'POST',url:'/api/admin/bank/imports',headers:{...admin,'x-csrf-token':'bad'},payload:{payload:sample()}})).statusCode,403);
  const imported=await app.inject({method:'POST',url:'/api/admin/bank/imports',headers:admin,payload:{payload:sample()}});assert.equal(imported.statusCode,200);
  const batchId=imported.json().id;assert.equal((await app.inject({url:`/api/admin/bank/imports/${batchId}`,headers:user})).statusCode,403);
  assert.equal((await app.inject({url:`/api/admin/bank/imports/${batchId}`,headers:admin})).json().payload.questions.length,1);
  assert.deepEqual((await app.inject({url:'/api/sources',headers:user})).json(),{sources:[]});
 }finally{await app.close();}
});
