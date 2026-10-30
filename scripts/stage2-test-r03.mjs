import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import Database from 'better-sqlite3';
import {openDatabase} from '../server/db.mjs';
import {saveKnowledge,catalogRevision,questionDetail,importAnalysis,reviewItem,releaseItems} from '../server/stage2.mjs';
import {objectiveKnowledgeTree,objectiveNodeQuestions} from '../server/knowledge-tree.mjs';
const [planFile,sourceFile,dest,reportFile]=process.argv.slice(2);
assert(reportFile&&!fs.existsSync(dest)&&!fs.existsSync(reportFile)&&process.env.NODE_ENV!=='production','Fresh disposable paths required');
const plan=JSON.parse(fs.readFileSync(planFile)),hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const source=new Database(sourceFile,{readonly:true,fileMustExist:true});
assert.equal(source.prepare('SELECT count(*) n FROM qb_analysis_versions').get().n,0,'Use the content-only disposable source, not a previously published tree');
const tables=source.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(x=>x.name);
const snapshot=db=>Object.fromEntries(tables.map(t=>[t,hash(db.prepare('SELECT * FROM "'+t+'" ORDER BY rowid').all())]));
const original=snapshot(source);await source.backup(dest);const db=openDatabase(dest);
try{
 db.transaction(()=>{
  for(const n of plan.catalog)saveKnowledge(db,{expectedRevision:catalogRevision(db),point:{id:n.id,subject:'fr-objective',parentId:n.parentId,name:n.name+'〔客观题〕',definition:n.definition,nameFr:'',inclusions:[n.definition],exclusions:['共同父节点不等于相同主知识点'],status:'active',aliases:[]}});
  const revision=catalogRevision(db);
  for(const r of plan.records){
   const q=questionDetail(db,r.questionVersionId);q.id=q.versionId;const e=r.keyEvidence[0];
   let quote=e.quote,sourceKind='question',materialVersionId;
   if(!q.text.includes(quote)){
    let m=q.materials.find(m=>m.text.includes(quote));
    // Old preview evidence may be stale; fall back only to the literal original evidence,
    // never manufacture a decisive quote. This is structural import, not semantic certification.
    if(!m){const old=JSON.parse(fs.readFileSync('data/stage2-handoff/annotations/annotation-plan.json')).records.find(x=>x.questionId===r.questionId).keyEvidence[0];quote=old.quote;m=q.materials.find(m=>m.text.includes(quote));}
    if(!q.text.includes(quote)){assert(m,'Missing literal evidence '+r.questionId);sourceKind='material';materialVersionId=m.id;}
   }
   const id=`r03-${r.questionId}`,checked=r.status==='checked';
   const result=importAnalysis(db,{id,questionVersionId:q.id,answerSetId:q.answer?.id??null,catalogRevision:revision,producer:'Codex offline r03 consolidation',runId:'r03-consolidated-plan',conclusion:'主知识点候选：'+r.primaryName,primaryId:r.primaryId,auxiliaryIds:[],methodId:null,basis:r.basis,keyEvidence:[{source:sourceKind,quote,...(materialVersionId?{materialVersionId}:{})}],boundary:plan.catalog.find(n=>n.id===r.primaryId).definition,distractors:[],issues:checked?[]:[r.pendingReason],review:{runId:'r03-unblinded-adjudication',producer:'Codex unblinded adjudication; schema compatibility, NOT independent gold',independentPrimaryId:checked?r.primaryId:null,decision:checked?'agree':'uncertain',reason:checked?'隔离库工程测试：采用已存解盲裁决，不声称独立金标。':r.pendingReason}});
   if(checked){const d=questionDetail(db,q.id);assert.equal(d.issues.length,0);const reviewed=reviewItem(db,{questionVersionId:q.id,expectedRevision:d.revision,kind:'classification',decision:'passed',classificationId:result.classificationId,reason:'Disposable r03 engineering release, not production or independent gold'},'codex-r03-test','ai');releaseItems(db,{items:[{questionVersionId:q.id,expectedRevision:reviewed.revision,classificationId:result.classificationId}]},'codex-r03-test');}
  }
 })();
 const tree=objectiveKnowledgeTree(db),checked=plan.records.filter(r=>r.status==='checked'),pending=plan.records.filter(r=>r.status==='pending');
 assert.equal(tree.available,checked.length);assert.equal(tree.pending,pending.length);
 for(const r of plan.records){const q=questionDetail(db,r.questionVersionId);assert.equal(q.samePointSearchable,r.status==='checked',r.questionId);assert.equal(q.gradingEligible,false);}
 let checkedMembers=0;
 for(const n of plan.catalog.filter(n=>n.leaf)){
  for(const status of ['available','pending']){
   const expected=plan.records.filter(r=>r.primaryId===n.id&&r.status===(status==='available'?'checked':'pending')).map(r=>r.questionId).sort();
   const actual=[];for(let page=1;;page++){const x=objectiveNodeQuestions(db,n.id,{status,page:String(page)});actual.push(...x.items.map(r=>r.question_id));if(actual.length>=x.total)break;}
   assert.deepEqual(actual.sort(),expected,n.id+' '+status);checkedMembers+=actual.length;
  }
 }
 assert.equal(checkedMembers,360);assert.equal(tree.nodes.find(n=>n.id==='obj-listening').available,0);
 const pendingExample=plan.records.find(r=>r.status==='pending');
 const pendingDetail=questionDetail(db,pendingExample.questionVersionId);
 const pendingClassification=db.prepare('SELECT id FROM qb_classification_sets WHERE analysis_id=?').get(`r03-${pendingExample.questionId}`);
 assert(pendingClassification);
 assert.throws(()=>releaseItems(db,{items:[{questionVersionId:pendingDetail.versionId,expectedRevision:pendingDetail.revision,classificationId:pendingClassification.id}]},'codex-r03-negative-check'));
 const beforeRestore=snapshot(db),restored=dest+'.restore.sqlite';await db.backup(restored);const copy=new Database(restored,{readonly:true});assert.deepEqual(snapshot(copy),beforeRestore);copy.close();
 assert.deepEqual(snapshot(source),original);
 const report={createdAt:new Date().toISOString(),environment:'Linux Node '+process.version,planSha256:createHash('sha256').update(fs.readFileSync(planFile)).digest('hex'),sourceUnchanged:true,independentRestoreVerified:true,all360QuestionStatesChecked:true,allLeafAvailableAndPendingQueriesCompared:true,gradingAnswersAdopted:false,productionChanged:false,semanticGoldCertified:false,reviewFieldNote:'Legacy independentPrimaryId schema field holds unblinded adjudication; producer explicitly records this. Not independent review evidence.',summary:{questions:tree.totalQuestions,available:tree.available,pending:tree.pending,nodes:tree.nodes.length},integrity:db.pragma('integrity_check'),foreignKeys:db.pragma('foreign_key_check')};assert.equal(report.integrity[0].integrity_check,'ok');assert.equal(report.foreignKeys.length,0);fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');console.log(report.summary);
}finally{db.close();source.close();}
