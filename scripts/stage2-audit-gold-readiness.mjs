// Read-only readiness audit. Agreement with the authored plan is not label accuracy.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import {objectiveKnowledgeTree,objectiveNodeQuestions} from '../server/knowledge-tree.mjs';
const [planFile,database,outputFile]=process.argv.slice(2);
if(!outputFile||fs.existsSync(outputFile))throw Error('Usage: stage2-audit-gold-readiness.mjs PLAN DB NEW_REPORT');
const bytes=fs.readFileSync(planFile),plan=JSON.parse(bytes),db=new Database(database,{readonly:true,fileMustExist:true});
try{
 const tree=objectiveKnowledgeTree(db),leaves=plan.catalog.filter(n=>n.leaf),groups=leaves.map(n=>({id:n.id,records:plan.records.filter(r=>r.primaryId===n.id&&r.status==='checked')}));
 assert.equal(plan.records.length,360);assert.equal(tree.totalQuestions,360);
 for(const r of plan.records){
  const row=db.prepare('SELECT payload FROM qb_analysis_versions WHERE id=?').get(r.id);assert(row,r.id);
  const a=JSON.parse(row.payload);assert.equal(a.primaryId,r.primaryId);assert.equal(a.review.decision,r.status==='checked'?'agree':'uncertain');
 }
 const count=rows=>({total:rows.length,available:rows.filter(r=>r.status==='checked').length,pending:rows.filter(r=>r.status!=='checked').length});
 const usable=groups.filter(g=>g.records.length),multi=usable.filter(g=>g.records.length>=2),crossYear=usable.filter(g=>new Set(g.records.map(r=>r.year)).size>1),crossType=usable.filter(g=>new Set(g.records.map(r=>r.typeId)).size>1);
 const root=id=>{let n=plan.catalog.find(n=>n.id===id);while(n.parentId)n=plan.catalog.find(x=>x.id===n.parentId);return n.id;};
 const report={auditDate:'2026-10-30',scope:'read-only three-paper objective pilot; no independent semantic relabelling',planSha256:createHash('sha256').update(bytes).digest('hex'),
  counts:count(plan.records),byYear:[2012,2013,2023].map(year=>({year,...count(plan.records.filter(r=>r.year===year))})),
  byType:[...new Set(plan.records.map(r=>r.typeId))].map(typeId=>({typeId,...count(plan.records.filter(r=>r.typeId===typeId))})),
  byDomain:plan.catalog.filter(n=>!n.parentId).map(n=>({id:n.id,...count(plan.records.filter(r=>root(r.primaryId)===n.id))})),
  leafCoverage:{total:leaves.length,withAvailable:usable.length,pendingOnly:groups.filter(g=>!g.records.length).length,singleAvailable:usable.filter(g=>g.records.length===1).length,multipleAvailable:multi.length,availableQuestionsInMultipleLeaves:multi.reduce((n,g)=>n+g.records.length,0),crossYearLeaves:crossYear.length,availableQuestionsInCrossYearLeaves:crossYear.reduce((n,g)=>n+g.records.length,0),crossTypeLeaves:crossType.length,availableQuestionsInCrossTypeLeaves:crossType.reduce((n,g)=>n+g.records.length,0)},
  crossTypeNodes:crossType.map(g=>({id:g.id,questions:g.records.length,types:[...new Set(g.records.map(r=>r.typeId))]})),
  evidence:{recordsWithSingleEvidence:plan.records.filter(r=>r.keyEvidence.length===1).length,questionEvidence:plan.records.filter(r=>r.keyEvidence.some(e=>e.source==='question')).length,materialEvidence:plan.records.filter(r=>r.keyEvidence.some(e=>e.source==='material')).length,genericBasisPrefix:plan.records.filter(r=>/^(对照题干与全部选项|检查材料第|按问题要求及对应完整阅读材料|Part V第|仅按题干问法)/.test(r.basis)).length,note:'Quote presence is traceability, not proof that the assigned rule uniquely determines the answer.'},
  checks:{planDatabaseLabelsAndStatesAgree:true,databaseIntegrity:db.pragma('integrity_check')[0].integrity_check,foreignKeyErrors:db.pragma('foreign_key_check').length,possessiveAvailable:objectiveNodeQuestions(db,'obj-possessive').total,gerundAvailable:objectiveNodeQuestions(db,'obj-gerund').total},
  accuracy:{independentGoldLabelsAvailable:false,blindReviewArtifactsAvailable:false,heldOutYearEvaluated:false,semanticAccuracy:null,retrievalPrecision:null,reviewerAgreement:null,annotationTimeAndCostMeasured:false},
  verdict:{engineeringPilotReusable:true,goldDatasetEstablished:false,full21PaperRolloutReady:false,controlledNextPaperAfterQualityGate:true}};
 assert.equal(report.checks.databaseIntegrity,'ok');assert.equal(report.checks.foreignKeyErrors,0);
 fs.writeFileSync(outputFile,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{db.close();}
