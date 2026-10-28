// Import an authored review into the existing isolated Stage2 database, preserving all prior rows.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {openDatabase} from '../server/db.mjs';
import {importContent,reviewItem,validateContent} from '../server/stage2.mjs';
const [database,root]=process.argv.slice(2);
if(!database||!root||process.env.NODE_ENV==='production')throw Error('Local use: stage2-import-pilot-review.mjs DB REVIEW_DIR');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const digest=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const manifest=read(path.join(root,'manifest.json'));
assert.deepEqual(manifest.summary.map(x=>x.year),[2012,2013,2023]);
const db=openDatabase(database),report={createdAt:new Date().toISOString(),published:false,answerAdoption:false,results:[]};
try{
 const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name!='schema_migrations' ORDER BY name").all().map(x=>x.name);
 const tableId=t=>'"'+t.replaceAll('"','""')+'"';
 const before=Object.fromEntries(tables.map(t=>{const rows=db.prepare('SELECT rowid AS audit_rowid__,* FROM '+tableId(t)+' ORDER BY rowid').all();return [t,{max:rows.at(-1)?.audit_rowid__??0,count:rows.length,sha256:digest(rows)}];}));
 const backup=path.join(path.dirname(database),'backups','before-pilot-review-'+Date.now()+'.sqlite');fs.mkdirSync(path.dirname(backup),{recursive:true});await db.backup(backup);report.backup=backup;
 const load=manifest.summary.map(item=>{
  const file=path.join(root,String(item.year),'content-v4.json'),raw=fs.readFileSync(file,'utf8'),data=JSON.parse(raw),ledger=read(path.join(root,String(item.year),'review-ledger.json'));
  assert.equal(digest(raw),item.outputSha256);assert.equal(ledger.outputSha256,item.outputSha256);assert.equal(ledger.allItemsReviewed,true);assert.equal(ledger.pdfVisualReview,false);
  assert.equal(ledger.decisions.length,122);assert.equal(ledger.verbMappings.length,20);assert(validateContent(data).valid);
  for(const m of ledger.verbMappings){const material=data.materials.find(x=>x.id===m.materialId);assert.equal(Array.from(material.text).slice(m.target.start,m.target.end).join(''),m.target.quote);const q=data.questions.find(x=>x.id===m.questionId);assert.equal(q.blankIndex,m.blankIndex);assert(q.answer.candidates.some(c=>c.referenceId===m.referenceId&&c.value===m.rawAnswer));}
  return {item,data,ledger};
 });
 db.transaction(()=>{
  for(const {item,data,ledger} of load){
   const imported=importContent(db,data,'codex-md-review');assert.equal(imported.status,'candidate');assert(imported.valid);
   const runId='md-review-'+data.paper.id+'-'+item.outputSha256.slice(0,16);const prior=db.prepare('SELECT id FROM qb_processing_runs WHERE id=?').get(runId);
   let passed=0,blocked=0;
   for(const q of data.questions){const id=q.id+':v'+q.version,blocking=data.issues.some(i=>i.questionId===q.id&&i.status==='open'&&i.severity==='blocking');if(blocking){blocked++;continue;}passed++;
    if(!prior){const revision=db.prepare('SELECT count(*) n FROM qb_review_events WHERE question_version_id=?').get(id).n;reviewItem(db,{questionVersionId:id,expectedRevision:revision,kind:'content',decision:'passed',reason:'全三卷MD内部校对；逐题台账及未解决来源问题见生产记录'+runId},'codex-md-review','ai');}
   }
   if(!prior)db.prepare('INSERT INTO qb_processing_runs VALUES (?,?,?,?,?,?)').run(runId,data.paper.id,'authored_md_internal_review','Codex',JSON.stringify({...ledger,scope:'R01/R02',batchId:imported.id}),report.createdAt);
   report.results.push({year:item.year,batchId:imported.id,paperVersion:data.paperVersion,duplicate:imported.duplicate,reviewed:122,contentReviewPassed:passed,blocked,verbMappings:20,corrections:data.corrections.length,runId});
  }
  for(const t of tables){const original=db.prepare('SELECT rowid AS audit_rowid__,* FROM '+tableId(t)+' WHERE rowid<=? ORDER BY rowid').all(before[t].max);assert.equal(digest(original),before[t].sha256,'Existing rows changed in '+t);}
 })();
 report.preexistingTables=tables.length;report.preexistingRowsPreserved=true;report.integrity=db.pragma('integrity_check');report.foreignKeys=db.pragma('foreign_key_check');assert.equal(report.integrity[0].integrity_check,'ok');assert.equal(report.foreignKeys.length,0);
 const restored=path.join(root,'after-review-restore-check-'+Date.now()+'.sqlite');await db.backup(restored);report.restoreCheck=restored;
 const restoredDb=openDatabase(restored);try{for(const t of tables){const a=db.prepare('SELECT * FROM '+tableId(t)+' ORDER BY rowid').all(),b=restoredDb.prepare('SELECT * FROM '+tableId(t)+' ORDER BY rowid').all();assert.equal(digest(a),digest(b));}}finally{restoredDb.close();}
 report.independentRestoreVerified=true;
 fs.writeFileSync(path.join(root,'import-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{db.close();}
