import fs from 'node:fs';
import assert from 'node:assert/strict';
const root='data/stage2-gold-r02';
const plan=JSON.parse(fs.readFileSync('data/stage2-handoff/annotations/annotation-plan.json'));
const revision=JSON.parse(fs.readFileSync(`${root}/revision-plan.json`));
const ids=['obj-possessive','obj-degree-pour','obj-unless','obj-gerund'];
const records=plan.records.filter(r=>ids.includes(r.primaryId)).map(r=>{
 const p=JSON.parse(fs.readFileSync(`data/stage2-handoff/reviewed-pilots/${r.year}/content-v4.json`));
 const q=p.questions.find(q=>q.id===r.questionId),references=p.references.filter(x=>q.answer.candidates.some(c=>c.referenceId===x.id));
 const next=revision.records.find(x=>x.questionId===r.questionId);
 return {questionId:q.id,previous:r.primaryId,proposed:next.primaryId,status:'md_boundary_checked_not_full_gold',questionEvidence:q.evidence,references,reason:r.primaryId==='obj-possessive'?'四题共享主有代词替代与性数，人称依所有者；只有2012/45还要求de支配缩合，其他题不强制声称介词能力。':r.primaryId==='obj-degree-pour'?'2012/76为pour que从句，2013/62为pour不定式，均是程度妨碍结果，不拆重复节点。':r.primaryId==='obj-gerund'?'2012/75选项en nageant，2013/14与2023/17参考分别en attendant/en courant，均为副动词；跨题型保持同节点。':q.id==='tfs4-2023-q077'?'参考A及ne…pas支持必要条件，应移至新增叶。':'参考à moins que及没有pas的ne结构支持例外条件，不能与2023/77混同。'};
});
assert.equal(records.length,12);
const negatives=[
 {a:'tfs4-2012-q080',b:'tfs4-2023-q077',samePrimary:false,reason:'à moins que例外条件/赘词ne，与à condition que实际否定必要条件不同。'},
 {a:'tfs4-2013-q067',b:'tfs4-2023-q077',samePrimary:false,reason:'共同虚拟式或condition父类不足以合并必要条件与例外条件。'},
 {a:'tfs4-2012-q076',b:'tfs4-2013-q062',samePrimary:true,reason:'从句与不定式表面不同，同为trop…pour程度结果。'},
 {a:'tfs4-2012-q075',b:'tfs4-2013-verb-14',samePrimary:true,reason:'选择与动词空题型不同，明确en+现在分词副动词相同。'},
 {a:'tfs4-2012-q096',b:'tfs4-2012-q098',samePrimary:false,reason:'同篇且可含否定题干，e-book术语同义与多项信息排除是不同主操作。'}
];
const out=`${root}/boundary-impact.json`;assert(!fs.existsSync(out));fs.writeFileSync(out,JSON.stringify({version:'r02',scope:'12 direct/adjacent members manually checked via MD question and mapped reference; sample edges are boundary checks not full pair labels',records,representativeChecks:negatives,publication:false},null,2)+'\n');console.log({directAndAdjacent:records.length,sampleChecks:negatives.length});
