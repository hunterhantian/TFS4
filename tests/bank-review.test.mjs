import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import {createHash} from 'node:crypto';
import {openDatabase} from '../server/db.mjs';
import {createUser} from '../server/security.mjs';
import {importCandidate,validateBankImport} from '../server/bank-import.mjs';
import {bankDetail,reviewBatch,reviewContent,contentDetail,confirmDocuments,publishBatch,relatedForReport,importClassifications} from '../server/bank.mjs';
const real=JSON.parse(fs.readFileSync(new URL('../data/2025-stage2-candidate.json',import.meta.url)));
function sample(source='synthetic',year=2024){const d=structuredClone(real);d.source={id:source,version:1,year,title:'Synthetic tests only',revisionNote:'fixture in isolated database only'};d.materials=[];d.documents.forEach(doc=>{doc.sha256=createHash('sha256').update(source+doc.id).digest('hex');});d.questions=d.questions.filter(q=>[41,44,50].includes(q.originalNo)).map(q=>({...q,typeId:'grammar-choice'}));for(const q of d.questions){q.classification={primaryId:'relative',auxiliaryIds:[],basis:'Synthetic evidence for behavior test',producer:'test'};q.explanation={documentId:'explanations',location:'synthetic page',quote:'Synthetic explanation'};}return d;}
async function setup(){const db=openDatabase(':memory:');const admin=await createUser(db,'review_admin','test-password-123','admin'),user=await createUser(db,'review_user','test-password-123');return {db,admin,user};}
function confirm(db,id,actor){return confirmDocuments(db,id,{expectedRevision:bankDetail(db,id).revision,documentIds:['explanations'],reason:'Synthetic confirmed evidence'},actor);}
function approve(db,id,actor,ids){const questionIds=ids||bankDetail(db,id).payload.questions.map(q=>q.id);reviewContent(db,id,{expectedRevision:contentDetail(db,id).revision,questionIds,decision:'approved'},actor);return reviewBatch(db,id,{expectedRevision:bankDetail(db,id).revision,questionIds,decision:'approved',reason:'Synthetic manual review'},actor);}
function publish(db,id,actor){return publishBatch(db,id,{expectedRevision:bankDetail(db,id).revision},actor);}
function report(db,owner,data,id='test-report'){const payload={sourceId:data.source.id,items:data.questions.map(question=>({question,choice:'A',result:'wrong'}))};db.prepare('INSERT INTO reports(id,owner_id,title,payload,created_at) VALUES (?,?,?,?,?)').run(id,owner,'synthetic',JSON.stringify(payload),'2026-10-27');return id;}

test('content approval needs only a selection and is independent from missing classification, evidence and answer warnings',async()=>{
 const {db,admin}=await setup();try{const id=importCandidate(db,real,admin.id).id;const qids=real.questions.map(q=>q.id);const r=reviewContent(db,id,{expectedRevision:0,questionIds:qids,decision:'approved'},admin.id);assert.equal(r.reviewed,100);assert.equal(contentDetail(db,id).reviews.length,100);assert.equal(bankDetail(db,id).reviews.length,0);assert.equal(bankDetail(db,id).confirmations.length,0);assert.equal(bankDetail(db,id).publication,null);assert.equal(bankDetail(db,id).revision,0);assert.throws(()=>publish(db,id,admin.id),{code:'NOTHING_APPROVED'});assert.throws(()=>reviewContent(db,id,{expectedRevision:0,questionIds:qids,decision:'returned'},admin.id),{code:'REVIEW_CONFLICT'});reviewContent(db,id,{expectedRevision:1,questionIds:[qids[0]],decision:'returned'},admin.id);assert.equal(contentDetail(db,id).reviews.find(r=>r.questionId===qids[0]).status,'returned');
 }finally{db.close();}
});
test('association publication requires content approval and content return immediately removes related recommendations',async()=>{
 const {db,admin,user}=await setup();try{const d=sample(),id=importCandidate(db,d,admin.id).id;confirm(db,id,admin.id);reviewBatch(db,id,{expectedRevision:1,questionIds:d.questions.map(q=>q.id),decision:'approved',reason:'Synthetic association review'},admin.id);assert.throws(()=>publish(db,id,admin.id),{code:'CONTENT_NOT_APPROVED'});reviewContent(db,id,{expectedRevision:0,questionIds:d.questions.map(q=>q.id),decision:'approved'},admin.id);publish(db,id,admin.id);report(db,user.id,d);assert.equal(relatedForReport(db,'test-report',d.questions[0].id,user).items.length,2);reviewContent(db,id,{expectedRevision:1,questionIds:[d.questions[1].id],decision:'returned'},admin.id);assert.equal(relatedForReport(db,'test-report',d.questions[0].id,user).items.length,1);
 }finally{db.close();}
});
test('2025 complete candidate keeps original 100 answers, 80 explanation locations, 20 gaps and 52 conflict',()=>{
 const r=validateBankImport(real);assert.equal(r.valid,true);assert.equal(r.warnings.length,20);const ref=JSON.parse(fs.readFileSync(new URL('../data/2025-reference-answers.json',import.meta.url)));for(const q of real.questions)assert.equal(q.answer.value,ref.answers[q.originalNo]);assert.equal(real.questions.filter(q=>q.classification).length,80);assert.ok(real.questions.slice(20).every(q=>q.explanation.location.includes('PDF第')&&q.explanation.quote.startsWith(String(q.originalNo))));assert.ok(!real.questions[79].explanation.quote.includes('时态填空'));assert.deepEqual(real.materials.map(m=>m.questionIds.length),[20,10,5,5,5,5]);
});
test('review is atomic, checks evidence, concurrent revisions, returns reasons and immutable publications',async()=>{
 const {db,admin}=await setup();try{const d=sample(),id=importCandidate(db,d,admin.id).id;
  assert.throws(()=>approve(db,id,admin.id),{code:'UNVERIFIED_EVIDENCE'});assert.equal(bankDetail(db,id).reviews.length,0);
  confirm(db,id,admin.id);assert.throws(()=>reviewBatch(db,id,{expectedRevision:0,questionIds:[d.questions[0].id],decision:'approved',reason:'stale'},admin.id),{code:'REVIEW_CONFLICT'});
  assert.throws(()=>approve(db,id,admin.id,[d.questions[0].id,'foreign']),{code:'UNKNOWN_QUESTION'});assert.equal(bankDetail(db,id).reviews.length,0);
  approve(db,id,admin.id);reviewBatch(db,id,{expectedRevision:2,questionIds:[d.questions[1].id],decision:'returned',reason:'Change primary concept'},admin.id);
  assert.equal(bankDetail(db,id).reviews.find(r=>r.questionId===d.questions[1].id).reason,'Change primary concept');
  assert.equal(publish(db,id,admin.id).approved,2);assert.equal(publish(db,id,admin.id).duplicate,true);
  assert.throws(()=>approve(db,id,admin.id),{code:'PUBLISHED_IMMUTABLE'});
  assert.equal(db.prepare('SELECT count(*) n FROM bank_questions WHERE primary_id IS NOT NULL').get().n,2);assert.equal(db.prepare('SELECT count(*) n FROM sources').get().n,0);
 }finally{db.close();}
});
test('source and alias conflicts rollback publication; explicit new question version needed for content revisions',async()=>{
 const {db,admin}=await setup();try{const d=sample(),id=importCandidate(db,d,admin.id).id;confirm(db,id,admin.id);approve(db,id,admin.id);publish(db,id,admin.id);
  const other=sample('synthetic2');other.knowledgePoints.find(k=>k.id==='relative').id='conflicting-id';other.questions.forEach(q=>q.classification.primaryId='conflicting-id');const second=importCandidate(db,other,admin.id).id;confirm(db,second,admin.id);approve(db,second,admin.id);assert.throws(()=>publish(db,second,admin.id),{code:'KNOWLEDGE_ALIAS_CONFLICT'});assert.equal(db.prepare('SELECT count(*) n FROM bank_publications').get().n,1);assert.equal(db.prepare("SELECT count(*) n FROM bank_knowledge WHERE id='conflicting-id'").get().n,0);
  const changed=structuredClone(d);changed.source.version=2;changed.questions[0].text='changed';const next=importCandidate(db,changed,admin.id).id;confirm(db,next,admin.id);approve(db,next,admin.id);assert.throws(()=>publish(db,next,admin.id),{code:'QUESTION_VERSION_REUSED'});
  const renamed=structuredClone(d);renamed.source.id='renamed';assert.throws(()=>importCandidate(db,renamed,admin.id),{code:'SOURCE_DOCUMENT_EXISTS'});
 }finally{db.close();}
});
test('external AI overlay changes only classification in a new version and never inherits approvals',async()=>{
 const {db,admin}=await setup();try{const d=sample(),id=importCandidate(db,d,admin.id).id;confirm(db,id,admin.id);approve(db,id,admin.id);
  const next=importClassifications(db,id,{sourceVersion:2,revisionNote:'AI revised',knowledgePoints:d.knowledgePoints,producer:'external tool',classifications:[{questionId:d.questions[0].id,...d.questions[0].classification,producer:undefined}].map(({producer,...r})=>r)},admin.id);
  assert.equal(next.status,'candidate');const detail=bankDetail(db,next.id);assert.equal(detail.reviews.length,0);assert.equal(detail.confirmations.length,0);assert.equal(detail.payload.questions[1].classification,null);assert.deepEqual(detail.payload.questions.map(q=>q.answer),d.questions.map(q=>q.answer));
 }finally{db.close();}
});
test('answer/explanation anomalies require explicit reviewer acknowledgement and keep reference answer',async()=>{
 const {db,admin}=await setup();try{const id=importCandidate(db,real,admin.id).id;confirm(db,id,admin.id);assert.ok(bankDetail(db,id).issues['tfs4-2025-q52']);assert.throws(()=>approve(db,id,admin.id,['tfs4-2025-q52']),{code:'ANSWER_EXPLANATION_CONFLICT'});reviewBatch(db,id,{expectedRevision:1,questionIds:['tfs4-2025-q52'],decision:'approved',reason:'Synthetic only test: keep reference A and mark explanatory discrepancy',acknowledgeIssues:true},admin.id);assert.equal(bankDetail(db,id).payload.questions[51].answer.value,'A');assert.throws(()=>approve(db,id,admin.id,['tfs4-2025-q1']),{code:'UNVERIFIED_EVIDENCE'});
 }finally{db.close();}
});
test('related queries use published type/primary only, respect owner, exclude self, preserve materials and freeze reports',async()=>{
 const {db,admin,user}=await setup();try{const d=sample(),id=importCandidate(db,d,admin.id).id;const reportId=report(db,user.id,d);const before=db.prepare('SELECT payload FROM reports WHERE id=?').get(reportId).payload;
  assert.equal(relatedForReport(db,reportId,d.questions[0].id,user).items.length,0);confirm(db,id,admin.id);approve(db,id,admin.id);assert.equal(relatedForReport(db,reportId,d.questions[0].id,user).items.length,0);publish(db,id,admin.id);
  assert.equal(relatedForReport(db,reportId,d.questions[0].id,user).items.length,2);assert.throws(()=>relatedForReport(db,reportId,d.questions[0].id,{id:'foreign',role:'user'}),{code:'NOT_FOUND'});
  const other=sample('synthetic-second-year',2023);other.questions.forEach(q=>q.id='second-'+q.id);other.materials=[{id:'group',kind:'cloze',text:'Complete passage',questionIds:other.questions.map(q=>q.id)}];other.questions.forEach(q=>q.materialId='group');const iid=importCandidate(db,other,admin.id).id;confirm(db,iid,admin.id);approve(db,iid,admin.id,[other.questions[0].id]);publish(db,iid,admin.id);
  const results=relatedForReport(db,reportId,d.questions[0].id,user);assert.equal(results.items.length,3);const materialResult=results.items.find(r=>r.source.id===other.source.id);assert.equal(materialResult.group.length,3);assert.equal(materialResult.material.text,'Complete passage');assert.equal(materialResult.history.attempted,false);
  assert.equal(db.prepare('SELECT payload FROM reports WHERE id=?').get(reportId).payload,before);
  const next=structuredClone(d);next.source.version=2;const nid=importCandidate(db,next,admin.id).id;confirm(db,nid,admin.id);approve(db,nid,admin.id,[d.questions[1].id]);publish(db,nid,admin.id);assert.equal(relatedForReport(db,reportId,d.questions[0].id,user).items.length,0);
 }finally{db.close();}
});
test('related history belongs to the current account, auxiliary matches do not qualify, and mismatched snapshots stay unlinked',async()=>{
 const {db,admin,user}=await setup();try{
  const d=sample();d.questions[2].classification={primaryId:'subjunctive',auxiliaryIds:['relative'],basis:'Test auxiliary only',producer:'test'};const id=importCandidate(db,d,admin.id).id;confirm(db,id,admin.id);approve(db,id,admin.id);publish(db,id,admin.id);report(db,user.id,d);
  for(const [n,result] of [[1,'wrong'],[2,'correct']]){
   db.prepare('INSERT INTO attempts(id,owner_id,request_id,mode,origin,status,created_at,started_at,snapshot,progress) VALUES (?,?,?,?,?,?,?,?,?,?)').run('history-attempt'+n,user.id,'history-request'+n,'full','synthetic','submitted','2026-10-26','2026-10-26',JSON.stringify({id:d.source.id}),'{}');
   db.prepare('INSERT INTO response_events(id,owner_id,attempt_id,question_id,question_version,answer_version,formal_part,component,result,occurred_at,origin,prior_count) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').run('history-event'+n,user.id,'history-attempt'+n,d.questions[1].id,1,1,'IV','grammar',result,'2026-10-2'+(5+n),'synthetic',n-1);
  }
  const related=relatedForReport(db,'test-report',d.questions[0].id,user);assert.equal(related.items.length,1);assert.equal(related.items[0].history.attempts,2);assert.equal(related.items[0].history.wrongCount,1);assert.equal(related.items[0].history.latest.result,'correct');
  assert.equal(relatedForReport(db,'test-report',d.questions[0].id,admin).items[0].history.attempted,false);
  const row=db.prepare("SELECT payload FROM reports WHERE id='test-report'").get();const frozen=JSON.parse(row.payload);frozen.items[0].question.text='different frozen question';db.prepare("UPDATE reports SET payload=? WHERE id='test-report'").run(JSON.stringify(frozen));assert.equal(relatedForReport(db,'test-report',d.questions[0].id,user).items.length,0);
 }finally{db.close();}
});

test('additive Stage2 migrations preserve Stage1 tables and report bytes; independent backup reopens',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rsz-stage2-migration-'));const file=path.join(dir,'test.sqlite');let db=new Database(file);
 try{db.exec('CREATE TABLE schema_migrations(version TEXT PRIMARY KEY,sha256 TEXT NOT NULL,applied_at TEXT NOT NULL)');for(const name of ['001-foundation.sql','002-archive-date-index.sql']){const sql=fs.readFileSync(new URL('../server/migrations/'+name,import.meta.url),'utf8').replace(/\r\n/g,'\n');db.exec(sql);db.prepare('INSERT INTO schema_migrations VALUES (?,?,?)').run(name,createHash('sha256').update(sql).digest('hex'),'test');}const owner=await createUser(db,'migration_test','test-password-123');report(db,owner.id,sample());const names=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name!='schema_migrations'").all().map(r=>r.name);const snapshot=()=>Object.fromEntries(names.map(n=>[n,db.prepare(`SELECT * FROM ${n} ORDER BY rowid`).all()]));const before=snapshot();db.close();db=openDatabase(file);assert.deepEqual(snapshot(),before);await db.backup(path.join(dir,'backup.sqlite'));const restored=openDatabase(path.join(dir,'backup.sqlite'));assert.equal(restored.pragma('integrity_check',{simple:true}),'ok');assert.equal(restored.prepare('SELECT payload FROM reports').get().payload,before.reports[0].payload);restored.close();
 }finally{db.close();fs.rmSync(dir,{recursive:true,force:true});}
});
