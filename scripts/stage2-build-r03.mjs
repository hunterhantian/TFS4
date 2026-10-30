import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root='data/stage2-gold-r03';fs.mkdirSync(root,{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(p));
const plan=read('data/stage2-gold-r02/reviewed-plan.json');
const original=read('data/stage2-handoff/annotations/annotation-plan.json');
const audits=['data/stage2-gold-r02/reading-audit.json','data/stage2-gold-r02/nonreading-audit.json'].flatMap(p=>read(p).records);
const oldPending=plan.records.filter(r=>r.status==='pending'&&original.records.find(o=>o.questionId===r.questionId).status==='checked');assert.equal(oldPending.length,13);
const boundaries=oldPending.map(r=>({questionId:r.questionId,decision:r.questionId==='tfs4-2012-verb-6'?'resolved':'pending',primaryId:r.primaryId,reason:r.questionId==='tfs4-2012-verb-6'?'采用人物属性/居住状态优先于场景背景的目录边界，habitaient描述祖父母住所；天气/环境和同时动作归背景。参考habitaient明确时态，不改原文。':r.pendingReason,referenceAdopted:false}));
const state=plan.catalog.find(n=>n.id==='obj-imparfait-state');state.definition+=' 与背景叶竞争时，人物年龄、身份、居住等属性优先归本叶；天气、环境及事件中的同时动作归背景叶。';
const background=plan.catalog.find(n=>n.id==='obj-imparfait-background');background.definition+=' 人物年龄、身份与居住属性优先归状态叶，不能仅因事件背景功能而重复归类。';
for(const b of boundaries)if(b.decision==='resolved'){const r=plan.records.find(r=>r.questionId===b.questionId);r.status='checked';r.pendingReason='';r.basis=b.reason;r.basisVersion='r03-boundary-adjudication';}
const omissions=read(`${root}/omission-audit.json`);const items=omissions.records??omissions.items;
const expected=original.records.filter(r=>r.status==='checked'&&!audits.some(a=>a.questionId===r.questionId));assert.equal(expected.length,131);assert.equal(items.length,131);assert.equal(new Set(items.map(r=>r.questionId)).size,131);
for(const a of items){assert(expected.some(e=>e.questionId===a.questionId));const r=plan.records.find(r=>r.questionId===a.questionId);if(a.proposedPrimaryId){assert(plan.catalog.some(n=>n.id===a.proposedPrimaryId&&n.leaf));r.primaryId=a.proposedPrimaryId;r.primaryName=plan.catalog.find(n=>n.id===r.primaryId).name;}r.status=a.status==='pending'||!a.proposedPrimaryId?'pending':'checked';r.pendingReason=r.status==='pending'?a.reason:'';r.basis=a.reason;r.keyEvidence=[{source:'semantic-audit',quote:a.quote}];r.basisVersion='r03-omission-audit';}
// Explicit root adjudications of newly found catalogue gaps; keep audit originals.
const ce=plan.catalog.find(n=>n.id==='obj-ce-que');ce.definition='按从句内部功能选择ce qui作主语、ce que作宾语或être/devenir等系词的表语；不按外句主语判断。';
const cq=plan.records.find(r=>r.questionId==='tfs4-2023-q059');cq.status='checked';cq.pendingReason='';cq.basis='mon oncle是倒装主语，ce que充当est devenu的表语；补齐目录定义而非改为宾语规则。';cq.basisVersion='r03-root-catalog-adjudication';
for(const r of plan.records.filter(r=>r.primaryId==='obj-lex-beyond')){r.primaryId='obj-col-beyond';r.primaryName=plan.catalog.find(n=>n.id===r.primaryId).name;}
plan.catalog=plan.catalog.filter(n=>n.id!=='obj-lex-beyond');
plan.catalog.find(n=>n.id==='obj-col-beyond').definition='au-delà de表示超出数量、预期或抽象范围；同一表达跨词汇选择和完形题共享身份，区别题型不另建叶。';
plan.catalogIdentityChanges=[{from:'obj-lex-beyond',to:'obj-col-beyond',reason:'同一固定表达超出范围的重复叶合并；原目录版本保留'}];
plan.version='r03';plan.createdAt=new Date().toISOString();plan.scope='MD-only offline revised candidate for disposable database testing, not full gold or production';plan.inputOmissionSha256=createHash('sha256').update(fs.readFileSync(`${root}/omission-audit.json`)).digest('hex');
const out=`${root}/reviewed-plan.json`;assert(!fs.existsSync(out));fs.writeFileSync(out,JSON.stringify(plan,null,2)+'\n');fs.writeFileSync(`${root}/boundary-adjudication.json`,JSON.stringify({version:'r03',records:boundaries,definitionChanges:[state,background],note:'All r02 checked tense neighbours were already audited; this refines precedence without rewriting content or adopting answers.'},null,2)+'\n');console.log({checked:plan.records.filter(r=>r.status==='checked').length,pending:plan.records.filter(r=>r.status==='pending').length});
