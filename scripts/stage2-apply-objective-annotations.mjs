import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import Database from 'better-sqlite3';
import {openDatabase} from '../server/db.mjs';
import {saveKnowledge,catalogRevision,reviewItem,releaseItems,questionDetail} from '../server/stage2.mjs';
import {importObjectiveAnnotation,objectiveKnowledgeTree,objectiveNodeQuestions} from '../server/knowledge-tree.mjs';
const [planFile,sourceFile,destination]=process.argv.slice(2);
if(!planFile||!sourceFile||!destination||fs.existsSync(destination)||process.env.NODE_ENV==='production')throw Error('Usage: stage2-apply-objective-annotations.mjs REVIEWED_PLAN SOURCE_DB NEW_ISOLATED_DB');
const plan=JSON.parse(fs.readFileSync(planFile,'utf8'));assert.equal(plan.reviewCompleted,true);assert.equal(plan.records.length,360);
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const source=new Database(sourceFile,{readonly:true,fileMustExist:true}),tables=source.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(x=>x.name),table=t=>'"'+t.replaceAll('"','""')+'"';
const snapshot=db=>Object.fromEntries(tables.map(t=>[t,hash(db.prepare('SELECT * FROM '+table(t)+' ORDER BY rowid').all())]));
const sourceBefore=snapshot(source);fs.mkdirSync(path.dirname(destination),{recursive:true});await source.backup(destination);
const db=openDatabase(destination),protectedTables=tables.filter(t=>!['qb_catalog_state','qb_knowledge_closure','qb_effective_items','schema_migrations'].includes(t));
const before=Object.fromEntries(protectedTables.map(t=>{const rows=db.prepare('SELECT rowid AS audit_rowid__,* FROM '+table(t)+' ORDER BY rowid').all();return [t,{max:rows.at(-1)?.audit_rowid__??0,sha256:hash(rows)}];}));
const report={createdAt:new Date().toISOString(),scope:'isolated objective annotation pilot',sourceUnchanged:false,sourceDocumentsChanged:false,pairLabelsGenerated:0,cloudChanged:false,records:[],catalogRevision:null};
try{
 db.transaction(()=>{
  for(const n of plan.catalog)saveKnowledge(db,{expectedRevision:catalogRevision(db),point:{id:n.id,subject:plan.subject,parentId:n.parentId,name:n.name+'〔客观题〕',nameFr:'',definition:n.definition,inclusions:[n.definition],exclusions:['共同父节点、文章主题或表面词语相同不等于同一主知识点。'],status:'active',aliases:[]}});
  const revision=catalogRevision(db);report.catalogRevision=revision;
  for(const record of plan.records){
   const body={id:record.id,questionVersionId:record.questionVersionId,primaryId:record.primaryId,basis:record.basis,keyEvidence:record.keyEvidence,runId:'objective-primary-20261028-r1',expectedCatalogRevision:revision,review:{runId:plan.review.runId,producer:plan.review.producer,independentPrimaryId:record.primaryId,decision:record.status==='checked'?'agree':'uncertain',reason:record.status==='checked'?'独立轮次对照三卷题面/全部选项及所需材料，按决定本题的主规则复核；不生成题间配对。':record.pendingReason}};
   const result=importObjectiveAnnotation(db,body),detail=questionDetail(db,record.questionVersionId);
   if(record.status==='checked'){
    assert.equal(detail.issues.length,0,record.questionId+' content blocked');
    const reviewed=reviewItem(db,{questionVersionId:record.questionVersionId,expectedRevision:detail.revision,kind:'classification',decision:'passed',classificationId:result.classificationId,reason:body.review.reason},'codex-objective-review','ai');
    releaseItems(db,{items:[{questionVersionId:record.questionVersionId,expectedRevision:reviewed.revision,classificationId:result.classificationId}]},'codex-objective-review');
   }
   report.records.push({questionId:record.questionId,year:record.year,typeId:record.typeId,primaryId:record.primaryId,classificationId:result.classificationId,status:record.status,reason:record.pendingReason});
  }
  for(const t of protectedTables)assert.equal(hash(db.prepare('SELECT rowid AS audit_rowid__,* FROM '+table(t)+' WHERE rowid<=? ORDER BY rowid').all(before[t].max)),before[t].sha256,'Preexisting immutable/history rows changed: '+t);
 })();
 assert.deepEqual(snapshot(source),sourceBefore);report.sourceUnchanged=true;report.protectedTables=protectedTables.length;report.preexistingProtectedRowsPreserved=true;
 const tree=objectiveKnowledgeTree(db);assert.equal(tree.totalQuestions,360);assert.equal(tree.available,plan.records.filter(r=>r.status==='checked').length);assert.equal(tree.pending,plan.records.filter(r=>r.status==='pending').length);
 assert.equal(tree.nodes.find(n=>n.id==='obj-possessive').available,4);const gerund=objectiveNodeQuestions(db,'obj-gerund');assert.equal(gerund.groups.length,2);assert.equal(gerund.total,3);
 const restored=destination+'.restore-check.sqlite';await db.backup(restored);const reopened=new Database(restored,{readonly:true});try{assert.deepEqual(snapshot(reopened),snapshot(db));assert.equal(reopened.pragma('integrity_check')[0].integrity_check,'ok');}finally{reopened.close();}
 report.independentRestoreVerified=true;report.integrity=db.pragma('integrity_check')[0].integrity_check;report.foreignKeys=db.pragma('foreign_key_check');assert.equal(report.foreignKeys.length,0);
 report.summary={questions:tree.totalQuestions,available:tree.available,pending:tree.pending,nodes:tree.nodes.length,leaves:tree.nodes.filter(n=>n.leaf).length,years:[2012,2013,2023].map(year=>({year,available:report.records.filter(r=>r.year===year&&r.status==='checked').length,pending:report.records.filter(r=>r.year===year&&r.status==='pending').length})),multiTypeLeaves:tree.nodes.filter(n=>n.directAvailable&&objectiveNodeQuestions(db,n.id).groups.length>1).map(n=>({id:n.id,name:n.name,questions:n.directAvailable}))};
 fs.writeFileSync(path.join(path.dirname(planFile),'annotation-import-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report.summary,null,2));
}finally{db.close();source.close();}
