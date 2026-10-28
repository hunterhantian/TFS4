// Materialize the authored per-question decisions; this script does not infer labels for unseen papers.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {nodes,assignments,verbAssignments,holds,specificNotes,subject} from './stage2-objective-labels.mjs';
const [inputRoot,outputRoot,reviewedPlan]=process.argv.slice(2);
if(!inputRoot||!outputRoot||fs.existsSync(outputRoot))throw Error('Usage: stage2-build-objective-annotations.mjs REVIEWED_PILOTS NEW_OUTPUT');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8')),hash=x=>createHash('sha256').update(x).digest('hex'),records=[],inputs=[];
const byId=new Map(nodes.map(n=>[n.id,n]));assert.equal(byId.size,nodes.length);
for(const year of [2012,2013,2023]){
 const file=path.join(inputRoot,String(year),'content-v4.json'),bytes=fs.readFileSync(file),data=JSON.parse(bytes),ledger=read(path.join(inputRoot,String(year),'review-ledger.json'));
 assert.equal(hash(bytes),ledger.outputSha256);inputs.push({year,sha256:hash(bytes),paperVersion:data.paperVersion});
 for(const q of data.questions.filter(q=>['choice','verb_form'].includes(q.responseType))){
  const item=q.responseType==='verb_form'?'v'+q.blankIndex:q.originalLabel,key=year+':'+item;
  const primaryKey=q.responseType==='verb_form'?verbAssignments[year][q.blankIndex-1]:assignments[key]?.key;
  const point=byId.get('obj-'+primaryKey);assert(point?.leaf,`Unknown point ${key}: ${primaryKey}`);
  let keyEvidence=[{source:'question',quote:q.text}],context=q.text;
  if(q.materialId){const m=data.materials.find(m=>m.id===q.materialId);assert(m);
   let offset=0;if(q.responseType==='verb_form')offset=ledger.verbMappings.find(v=>v.questionId===q.id).target.start;else if(q.typeId==='cloze')offset=Array.from(m.text.slice(0,m.text.indexOf('__'+q.originalLabel+'__'))).length;
   if(['cloze','verb-form'].includes(q.typeId)){context=Array.from(m.text).slice(Math.max(0,offset-130),offset+180).join('');keyEvidence=[{source:'material',materialVersionId:m.id+':v'+m.version,quote:context}];}
  }
  const pending=[];
  if(Number(q.originalLabel)<=20&&q.responseType==='choice')pending.push('只根据题干识别听力任务；本轮未核音频或独立听力原文，实际主知识点待复核');
  if(holds[key])pending.push(holds[key]);
  for(const issue of data.issues.filter(i=>i.questionId===q.id&&i.status==='open'&&i.severity==='blocking'))if(!pending.includes(issue.message))pending.push(issue.message);
  if(q.answer.status==='unusable')pending.push(q.answer.reason);
  const basis=specificNotes[key]??(q.responseType==='verb_form'?`Part V第${q.blankIndex}空${q.text}，结合完整篇章及已映射来源参考判断。`:
   q.typeId==='cloze'?`检查材料第${q.originalLabel}空及该题选项。`:
   q.typeId==='reading'?'按问题要求及对应完整阅读材料判断所需阅读操作；该分组属于阅读能力任务，不表示各题文本结论相同。':
   Number(q.originalLabel)<=20?'仅按题干问法记录任务候选，不反推音频内容。':'对照题干与全部选项，确定决定本题的主要语言规则。')+' '+point.definition;
  records.push({id:`objective-${q.id}-v${q.version}-r1`,questionId:q.id,questionVersionId:q.id+':v'+q.version,year,label:q.originalLabel,typeId:q.typeId,responseType:q.responseType,primaryId:point.id,primaryName:point.name,basis,keyEvidence,preview:context.replace(/\s+/g,' '),status:pending.length?'pending':'checked',pendingReason:pending.join('；')});
 }
}
assert.equal(records.length,360);assert.equal(new Set(records.map(r=>r.questionId)).size,360);
const used=new Set(records.map(r=>r.primaryId));for(const id of [...used]){let n=byId.get(id);while(n?.parentId){used.add(n.parentId);n=byId.get(n.parentId);}}
const catalog=nodes.filter(n=>used.has(n.id));
for(const n of catalog){let depth=1,parent=n.parentId;const seen=new Set([n.id]);while(parent){assert(!seen.has(parent));seen.add(parent);depth++;parent=byId.get(parent).parentId;}assert(depth<=4);}
fs.mkdirSync(outputRoot,{recursive:true});
// reviewedPlan is supplied only after the agent has actually read the full first-pass cards.
const plan={createdAt:new Date().toISOString(),scope:'three reviewed objective papers only',subject,inputs,catalog,records,pdfVisualReview:false,pairLabelsGenerated:0,reviewCompleted:!!reviewedPlan,review:reviewedPlan?{producer:'Codex separate MD/context review pass',sourcePlanSha256:hash(fs.readFileSync(reviewedPlan)),runId:'objective-review-20261028-r2',notes:'逐卷重读360项卡片；修正肯定问法误归排除类、heureuse哑音h边界；人物国籍与转述时态歧义增列待复核。不是跨模型审计。'}:null};
fs.writeFileSync(path.join(outputRoot,'annotation-plan.json'),JSON.stringify(plan,null,2));
fs.writeFileSync(path.join(outputRoot,'review-cards.txt'),records.map(r=>`${r.year} ${r.label} | ${r.primaryName} | ${r.status} | ${r.preview}\n${r.pendingReason}`).join('\n'));
console.log(JSON.stringify({records:records.length,checked:records.filter(r=>r.status==='checked').length,pending:records.filter(r=>r.status==='pending').length,nodes:catalog.length,leaves:catalog.filter(n=>n.leaf).length,outputRoot}));
