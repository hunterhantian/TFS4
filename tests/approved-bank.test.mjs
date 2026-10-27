import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {openDatabase} from '../server/db.mjs';
import {createUser} from '../server/security.mjs';
import {importCandidate} from '../server/bank-import.mjs';
import {contentDetail,reviewContent} from '../server/bank.mjs';
import {listApproved,approvedDetail} from '../server/approved-bank.mjs';
import {createApp} from '../server/app.mjs';
const real=JSON.parse(fs.readFileSync(new URL('../data/2025-stage2-candidate.json',import.meta.url)));
test('approved catalogue filters year/type, pages all items and includes content with no AI classification',async()=>{
 const db=openDatabase(':memory:');try{const admin=await createUser(db,'approved_admin','test-password-123','admin'),id=importCandidate(db,real,admin.id).id;assert.equal(listApproved(db).total,0);reviewContent(db,id,{expectedRevision:0,questionIds:real.questions.map(q=>q.id),decision:'approved'},admin.id);const all=listApproved(db);assert.equal(all.total,100);assert.equal(all.items.length,25);assert.equal(all.pages,4);assert.deepEqual(all.years,[2025]);assert.equal(all.types.length,7);assert.equal(listApproved(db,{year:'2024'}).total,0);assert.equal(listApproved(db,{year:'2025',typeId:'grammar-choice'}).total,40);assert.equal(listApproved(db,{typeId:'grammar-choice',page:'2'}).items.length,15);assert.equal(listApproved(db,{page:'99999'}).page,4);assert.equal(new Set([1,2,3,4].flatMap(page=>listApproved(db,{page:String(page)}).items.map(i=>i.id))).size,100);const listening=approvedDetail(db,id,'tfs4-2025-q1');assert.equal(listening.question.explanation,null);assert.equal(listening.material.questionIds.length,20);assert.equal('classification' in listening.question,false);const reading=approvedDetail(db,id,'tfs4-2025-q81');assert.equal(reading.material.questionIds.length,5);assert.ok(reading.material.text.length>100);assert.equal(db.prepare('SELECT count(*) n FROM bank_publications').get().n,0);for(const query of [{page:'0'},{year:'invalid'},{typeId:'bad/id'},{unexpected:'x'},{year:['2025']}])assert.throws(()=>listApproved(db,query));
 }finally{db.close();}
});
test('catalogue deduplicates reviewed revisions; new pending content preserves old approval and return withdraws it',async()=>{
 const db=openDatabase(':memory:');try{const admin=await createUser(db,'catalogue_admin','test-password-123','admin'),old=importCandidate(db,real,admin.id).id;const qid=real.questions[40].id;reviewContent(db,old,{expectedRevision:0,questionIds:[qid],decision:'approved'},admin.id);const v2=structuredClone(real);v2.source.version=2;const next=importCandidate(db,v2,admin.id).id;assert.equal(listApproved(db).items[0].importId,old);reviewContent(db,next,{expectedRevision:0,questionIds:[qid],decision:'approved'},admin.id);assert.equal(listApproved(db).total,1);assert.equal(listApproved(db).items[0].importId,next);assert.throws(()=>approvedDetail(db,old,qid),{code:'NOT_FOUND'});reviewContent(db,next,{expectedRevision:1,questionIds:[qid],decision:'returned'},admin.id);assert.equal(listApproved(db).total,0);assert.throws(()=>approvedDetail(db,next,qid),{code:'NOT_FOUND'});assert.equal(contentDetail(db,old).reviews[0].status,'approved');
 }finally{db.close();}
});
test('approved catalogue API remains admin-only and rejects unauthenticated requests',async()=>{
 const db=openDatabase(':memory:'),app=await createApp({db});try{await createUser(db,'catalogue_user','test-password-123');await createUser(db,'catalogue_admin','test-password-123','admin');assert.equal((await app.inject('/api/admin/bank/approved')).statusCode,401);for(const [username,status] of [['catalogue_user',403],['catalogue_admin',200]]){const login=await app.inject({method:'POST',url:'/api/auth/login',headers:{origin:'http://127.0.0.1:4174'},payload:{username,password:'test-password-123'}});const headers={cookie:login.headers['set-cookie'].split(';')[0]};assert.equal((await app.inject({url:'/api/admin/bank/approved',headers})).statusCode,status);if(status===403)assert.equal((await app.inject({url:'/api/admin/bank/approved/unknown/questions/q1',headers})).statusCode,403);}
 }finally{await app.close();db.close();}
});
