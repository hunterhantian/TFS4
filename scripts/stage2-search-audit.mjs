import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {performance} from 'node:perf_hooks';
import Database from 'better-sqlite3';
import {openDatabase} from '../server/db.mjs';
import {createApp} from '../server/app.mjs';
import {createUser} from '../server/security.mjs';
const [sourceFile,outputFile]=process.argv.slice(2);if(!sourceFile||!outputFile)throw Error('Usage: stage2-search-audit.mjs DB REPORT');
const source=new Database(sourceFile,{readonly:true}),dir=fs.mkdtempSync(path.join(os.tmpdir(),'stage2-search-audit-')),copy=path.join(dir,'copy.sqlite');await source.backup(copy);source.close();const db=openDatabase(copy);await createUser(db,'search-audit','search-audit-test-password','admin');const app=await createApp({db,backupDir:path.join(dir,'backups')});
// Authored gold groups: lexical similarity alone must not determine membership.
const groups=[['tfs4-2012-q041','tfs4-2013-q045'],['tfs4-2012-q045','tfs4-2013-q051','tfs4-2013-q061'],['tfs4-2012-q059','tfs4-2013-q056'],['tfs4-2012-q062','tfs4-2013-q060']];
const negatives=[['tfs4-2012-q043','tfs4-2013-q053'],['tfs4-2012-q047','tfs4-2012-q052']];
try{
 const login=await app.inject({method:'POST',url:'/api/auth/login',headers:{origin:'http://127.0.0.1:4174'},payload:{username:'search-audit',password:'search-audit-test-password'}});const headers={cookie:login.headers['set-cookie'].split(';')[0]};const get=async id=>{const r=await app.inject({url:'/api/admin/stage2/questions/'+encodeURIComponent(id+':v1')+'/related',headers});if(r.statusCode!==200)throw Error(JSON.stringify(r.json()));return r.json().items.map(x=>x.question.id);};
 const cases=[];for(const group of groups)for(const id of group){const gold=group.filter(x=>x!==id),found=await get(id),tp=found.filter(x=>gold.includes(x)).length;cases.push({id,gold,found,precision:found.length?tp/found.length:0,recall:tp/gold.length});}
 const negativeCases=[];for(const [a,b] of negatives){const found=await get(a);negativeCases.push({a,b,passed:!found.includes(b)});}
 const anchors=db.prepare("SELECT question_version_id FROM qb_effective_items WHERE content_status='passed' AND classification_id IS NOT NULL").all().map(x=>x.question_version_id.replace(/:v\d+$/,''));for(let i=0;i<20;i++)await get(anchors[i%anchors.length]);const timings=[];for(let i=0;i<100;i++){const start=performance.now();await get(anchors[i%anchors.length]);timings.push(performance.now()-start);}timings.sort((a,b)=>a-b);
 const report={createdAt:new Date().toISOString(),method:'Fastify.inject authenticated API; independent temporary copy; 20 warmups/100 queries',hardware:{cpu:os.cpus()[0].model,logicalCpus:os.cpus().length,ramGiB:Math.round(os.totalmem()/1024**3),node:process.version},effectiveQuestions:anchors.length,totalQuestionVersions:db.prepare('SELECT count(*) n FROM qb_question_versions').get().n,p95ms:timings[94],medianMs:timings[49],goldCases:cases,negativeCases,precisionAt5:null,precisionAt5Reason:'No authored gold group has five other relevant questions; insufficient evidence for planned Precision@5 acceptance',pilotAvailableResultPrecision:cases.reduce((n,c)=>n+c.precision,0)/cases.length,pilotGoldRecall:cases.reduce((n,c)=>n+c.recall,0)/cases.length,stage2Acceptance:'not_complete'};
 fs.mkdirSync(path.dirname(outputFile),{recursive:true});fs.writeFileSync(outputFile,JSON.stringify(report,null,2));console.log(JSON.stringify({effectiveQuestions:report.effectiveQuestions,totalQuestionVersions:report.totalQuestionVersions,p95ms:report.p95ms,availableResultPrecision:report.pilotAvailableResultPrecision,goldRecall:report.pilotGoldRecall,precisionAt5:null,stage2Acceptance:report.stage2Acceptance}));if(cases.some(c=>c.precision<1||c.recall<1)||negativeCases.some(c=>!c.passed))process.exitCode=1;
}finally{await app.close();db.close();}
