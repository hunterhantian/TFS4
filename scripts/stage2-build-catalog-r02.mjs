import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root='data/stage2-gold-r02';fs.mkdirSync(root,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p));
const plan=read('data/stage2-handoff/annotations/annotation-plan.json');
const adjudication=read('data/stage2-gold-r01/adjudication-v1.json');
const catalog=structuredClone(plan.catalog);
const update=(id,patch)=>Object.assign(catalog.find(n=>n.id===id),patch);
update('obj-degree-pour',{definition:'trop+形容词+pour+不定式或pour que+虚拟式表达程度妨碍结果；不是单纯目的，不是预计持续时间。'});
update('obj-possessive',{name:'主有代词的替代与性数选择',definition:'主有代词按被替代事物性数选择，所有者决定人称；所在句法位置若要求介词则保留支配和缩合，不要求每题都考介词。'});
catalog.push({id:'obj-condition-que',parentId:'obj-clauses',name:'à condition que的必要条件',definition:'à condition que加虚拟式引入主句成立的条件；ne…pas为实际否定，区别à moins que例外条件及赘词ne。',leaf:true});
const records=plan.records.map(r=>{
 const a=adjudication.records.find(a=>a.questionId===r.questionId);
 const x={...r,previousPrimaryId:r.primaryId,reviewVersion:'catalog-r02',basisVersion:'handoff-inherited-not-new-gold'};
 if(a){x.status=a.status==='resolved'?'checked':'pending';x.primaryId=a.primaryId??r.primaryId;x.basis=a.rationale;x.pendingReason=a.status==='pending'?a.rationale:'';x.basisVersion='adjudication-v1';}
 if(r.questionId==='tfs4-2023-q077'){x.primaryId='obj-condition-que';x.status='checked';x.pendingReason='';x.basis='显式ne…pas及参考A支持à condition que必要条件，不是à moins que例外条件；目录r02新增准确叶。';x.basisVersion='catalog-r02-md-reference-adjudication';}
 x.primaryName=catalog.find(n=>n.id===x.primaryId)?.name;assert(x.primaryName);
 return x;
});
const report={version:'catalog-r02',createdAt:new Date().toISOString(),baselineSha256:hash(fs.readFileSync('data/stage2-handoff/annotations/annotation-plan.json')),scope:'offline revision candidate; not database publication or gold certification',changedNodes:['obj-degree-pour','obj-possessive','obj-condition-que'],catalog,records};
const dest=`${root}/revision-plan.json`;assert(!fs.existsSync(dest),'Preserve revision versions');fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
console.log({nodes:catalog.length,checked:records.filter(r=>r.status==='checked').length,pending:records.filter(r=>r.status==='pending').length});
