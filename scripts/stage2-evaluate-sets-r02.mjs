import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root='data/stage2-gold-r02',read=p=>JSON.parse(fs.readFileSync(p));
const plan=read('data/stage2-handoff/annotations/annotation-plan.json');
const revision=read(`${root}/revision-plan.json`);
const audits=['reading-audit.json','nonreading-audit.json'].map(f=>({file:f,data:read(`${root}/${f}`)}));
const map=new Map();
for(const {file,data} of audits){for(const r of data.records??data.items??data.results){assert(!map.has(r.questionId),'Duplicate audit');map.set(r.questionId,{...r,auditFile:file});}}
for(const r of read(`${root}/root-reading-adjudication.json`).records){assert(map.has(r.questionId));map.set(r.questionId,{...map.get(r.questionId),...r,rootAdjudicated:true});}
const nodes=plan.catalog.filter(n=>n.leaf&&plan.records.filter(r=>r.status==='checked'&&r.primaryId===n.id).length>1);
const reviewed=nodes.flatMap(n=>plan.records.filter(r=>r.status==='checked'&&r.primaryId===n.id));
for(const r of reviewed)assert(map.has(r.questionId),'Missing member audit '+r.questionId);
const rows=nodes.map(n=>{
 const predicted=plan.records.filter(r=>r.status==='checked'&&r.primaryId===n.id).map(r=>r.questionId);
 const eligible=[...map.values()].filter(r=>r.status!=='pending'&&r.proposedPrimaryId);
 const expected=eligible.filter(r=>r.proposedPrimaryId===n.id).map(r=>r.questionId);
 const tp=predicted.filter(id=>expected.includes(id));
 const unresolved=predicted.filter(id=>{const r=map.get(id);return r.status==='pending'||!r.proposedPrimaryId;});
 const wrong=predicted.filter(id=>!tp.includes(id)&&!unresolved.includes(id));
 const missing=expected.filter(id=>!predicted.includes(id));
 return {nodeId:n.id,name:n.name,predicted,expectedWithinAuditScope:expected,truePositive:tp.length,wrong,unresolved,missing,precisionAmongResolved:tp.length/(predicted.length-unresolved.length),conservativeSupportedFraction:tp.length/predicted.length,recallWithinAuditScope:expected.length?tp.length/expected.length:null};
});
const sum=k=>rows.reduce((s,r)=>s+(Array.isArray(r[k])?r[k].length:r[k]),0);
const tp=sum('truePositive'),wrong=sum('wrong'),pending=sum('unresolved'),missing=sum('missing');
const aggregate=rs=>{const t=rs.reduce((s,r)=>s+r.truePositive,0),w=rs.reduce((s,r)=>s+r.wrong.length,0),u=rs.reduce((s,r)=>s+r.unresolved.length,0),m=rs.reduce((s,r)=>s+r.missing.length,0);return {nodes:rs.length,truePositive:t,wrong:w,unresolved:u,precisionAmongResolved:t+w?t/(t+w):null,recallWithinAuditScope:t+m?t/(t+m):null};};
const strata={reading:aggregate(rows.filter(r=>r.nodeId.startsWith('obj-r-'))),vocabulary:aggregate(rows.filter(r=>r.nodeId.startsWith('obj-lex-'))),grammar:aggregate(rows.filter(r=>!r.nodeId.startsWith('obj-r-')&&!r.nodeId.startsWith('obj-lex-'))),crossType:aggregate(rows.filter(r=>new Set(plan.records.filter(p=>r.predicted.includes(p.questionId)).map(p=>p.typeId)).size>1))};
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const result={createdAt:new Date().toISOString(),method:'Unblinded semantic audit against original tree sets; provisional, not independent gold validation. Recall is limited to reviewed candidates, not the entire bank.',inputHashes:audits.map(a=>({file:a.file,sha256:hash(`${root}/${a.file}`)})),catalogRevisionSha256:hash(`${root}/revision-plan.json`),summary:{multiLeaves:rows.length,originalMemberships:reviewed.length,auditedQuestions:map.size,truePositive:tp,wrong,pending,missingWithinAuditScope:missing,microPrecisionAmongResolved:tp/(tp+wrong),conservativeSupportedFraction:tp/(tp+wrong+pending),macroPrecisionAmongResolved:rows.reduce((s,r)=>s+r.precisionAmongResolved,0)/rows.length,recallWithinAuditScope:tp/(tp+missing),fullGoldGatePassed:false},rows};
result.strata=strata;
result.inputHashes.push({file:'root-reading-adjudication.json',sha256:hash(`${root}/root-reading-adjudication.json`)});
result.summary.unreviewedOutsideScope=plan.records.filter(r=>r.status==='checked'&&!map.has(r.questionId)).length;
assert.equal(rows.length,38);assert.equal(reviewed.length,143);
const out=`${root}/set-evaluation.json`;assert(!fs.existsSync(out));fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(result.summary);
