import fs from 'node:fs';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import {questionDetail} from '../server/stage2.mjs';
import {objectiveKnowledgeTree,objectiveNodeQuestions} from '../server/knowledge-tree.mjs';
const [planFile,database,importFile,outputFile]=process.argv.slice(2);
if(!outputFile||fs.existsSync(outputFile))throw Error('Usage: stage2-verify-objective-tree.mjs PLAN DB IMPORT_REPORT NEW_SUMMARY');
const plan=JSON.parse(fs.readFileSync(planFile,'utf8')),imported=JSON.parse(fs.readFileSync(importFile,'utf8')),db=new Database(database,{readonly:true,fileMustExist:true});
try{
 assert.equal(plan.reviewCompleted,true);assert.equal(imported.sourceUnchanged,true);assert.equal(imported.independentRestoreVerified,true);
 const tree=objectiveKnowledgeTree(db),expected=new Map(),nodes=new Map(tree.nodes.map(n=>[n.id,n]));
 let maxDepth=0;for(const n of tree.nodes){let depth=1,parent=n.parentId;const seen=new Set([n.id]);while(parent){assert(!seen.has(parent));seen.add(parent);depth++;parent=nodes.get(parent).parentId;}maxDepth=Math.max(maxDepth,depth);}assert(maxDepth<=4);
 for(const r of plan.records){
  const q=questionDetail(db,r.questionVersionId);assert(['choice','verb_form'].includes(q.responseType));assert.equal(q.gradingEligible,false,'No new adopted grading answers');
  assert.equal(q.samePointSearchable,r.status==='checked',r.questionId);if(r.status==='checked')assert.equal(q.matchingBasis.primary.id,r.primaryId);
  const a=JSON.parse(db.prepare('SELECT payload FROM qb_analysis_versions WHERE id=?').get(r.id).payload);assert.equal(a.primaryId,r.primaryId);assert.equal(a.auxiliaryIds.length,0);assert.equal(a.methodId,null);assert.equal(a.distractors.length,0);assert.notEqual(a.runId,a.review.runId);assert.equal(a.review.decision,r.status==='checked'?'agree':'uncertain');
  for(const e of a.keyEvidence){const text=e.source==='question'?q.text:q.materials.find(m=>m.id===e.materialVersionId)?.text;assert(text?.includes(e.quote),r.questionId+' evidence');}
  if(!expected.has(r.primaryId))expected.set(r.primaryId,{available:0,pending:0});expected.get(r.primaryId)[r.status==='checked'?'available':'pending']++;
 }
 for(const [id,count] of expected){assert.equal(nodes.get(id).directAvailable,count.available);assert.equal(nodes.get(id).directPending,count.pending);}
 const possessive=objectiveNodeQuestions(db,'obj-possessive');assert.equal(possessive.total,4);const gerund=objectiveNodeQuestions(db,'obj-gerund');assert.equal(gerund.total,3);assert.equal(gerund.groups.length,2);
 const listening=tree.nodes.find(n=>n.id==='obj-listening');assert.equal(listening.available,0);assert.equal(listening.pending,60);
 const summary={createdAt:new Date().toISOString(),method:'independent per-record structural/evidence/state audit after authored two-pass annotation; not an independent model accuracy study',objectiveOnly:true,pdfVisualReview:false,pairLabelsGenerated:0,reviewPasses:2,crossModelReview:false,questions:tree.totalQuestions,available:tree.available,pending:tree.pending,classificationNodes:tree.nodes.length,leafNodes:tree.nodes.filter(n=>n.leaf).length,maxDepth,years:imported.summary.years,multiTypeLeaves:imported.summary.multiTypeLeaves,examples:{possessive:{questions:4,typeGroups:possessive.groups},gerund:{questions:3,typeGroups:gerund.groups}},sourceDatabaseUnchanged:imported.sourceUnchanged,preexistingProtectedRowsPreserved:imported.preexistingProtectedRowsPreserved,protectedTables:imported.protectedTables,independentRestoreVerified:true,listening:{available:0,pending:60,scope:'question-task candidates only; audio and standalone transcripts were not read'},automaticGradingAdopted:false,fullStage2Acceptance:false};
 fs.writeFileSync(outputFile,JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));
}finally{db.close();}
