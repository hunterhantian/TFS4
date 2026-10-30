import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root='data/stage2-gold-r02',read=f=>JSON.parse(fs.readFileSync(`${root}/${f}`));
const revision=read('revision-plan.json');
const files=['reading-audit.json','nonreading-audit.json','root-reading-adjudication.json'];
const changes=[];
for(const file of files){const data=read(file);for(const a of data.records??data.items??data.results){
 const r=revision.records.find(r=>r.questionId===a.questionId);assert(r);
 const before={primaryId:r.primaryId,status:r.status};
 r.status=a.status==='pending'||!a.proposedPrimaryId?'pending':'checked';
 if(a.proposedPrimaryId){assert(revision.catalog.some(n=>n.id===a.proposedPrimaryId&&n.leaf));r.primaryId=a.proposedPrimaryId;r.primaryName=revision.catalog.find(n=>n.id===r.primaryId).name;}
 r.basis=a.reason;r.keyEvidence=[{source:'semantic-audit',quote:a.quote}];r.pendingReason=r.status==='pending'?a.reason:'';r.basisVersion=file;
 changes.push({questionId:r.questionId,before,after:{primaryId:r.primaryId,status:r.status},source:file});
}}
revision.scope='consolidated offline revision candidate; no database release, no answer adoption, no full gold certification';
revision.inputAudits=files.map(file=>({file,sha256:createHash('sha256').update(fs.readFileSync(`${root}/${file}`)).digest('hex')}));
const summary={questions:revision.records.length,checked:revision.records.filter(r=>r.status==='checked').length,pending:revision.records.filter(r=>r.status==='pending').length,catalogNodes:revision.catalog.length};
const out=`${root}/reviewed-plan.json`;assert(!fs.existsSync(out));fs.writeFileSync(out,JSON.stringify({...revision,summary,changes},null,2)+'\n');console.log(summary);
