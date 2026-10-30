// Authored MD-only adjudications; never alters handoff, original reviews or live classifications.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const dir='data/stage2-gold-r01',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const comparison=JSON.parse(fs.readFileSync(`${dir}/comparison.json`));
const decisions=[
 ['tfs4-2012-q076','resolved','obj-degree-pour','保留程度结果归类。trop petit与pour que共同表达程度妨碍结果；不是目的从句。现定义未明确从句形式，需边界澄清，不因省略que字样另造重复节点。'],
 ['tfs4-2012-q090','resolved','obj-r-time','改为时间关系定位：1981年的重逢比去世早两年，得1983；专门时间叶优先于一般跨句推理。'],
 ['tfs4-2012-q093','resolved','obj-r-number','改为数量范围定位：80岁阈值限定日本和法国，不能把后句70岁国家混入。'],
 ['tfs4-2012-q096','resolved','obj-r-context','保留语境词义。虽有否定问法，决定条件是e-book、numérique、électronique、virtuel的同义身份与papier的区别；不能仅因否定题干压过词义操作。'],
 ['tfs4-2012-verb-9','resolved','obj-imparfait-background','改为背景描写：空气清新与溪水声音为森林事件提供环境；était参考与该时态一致。'],
 ['tfs4-2013-q091','resolved','obj-r-number','改为数量比较：36500与12500提供性别人数比较；年龄段比例不可代替人数。'],
 ['tfs4-2013-q092','resolved','obj-r-number','改为数量比较：15000高于12000和8000，疾病名称定位本身不足以选择最高项。'],
 ['tfs4-2013-q094','pending',null,'参考D指丹麦男女各1%，但百分比的分母不同，不能推出死亡人数相等。可候选数量比例节点，暂不纳入无争议金标；不改题干或参考。'],
 ['tfs4-2013-verb-9','pending',null,'MD参考serait支持过去将来，题面与était riche并列也容许状态读法。参考映射不足以唯一裁决时态语义，保留过去将来候选，不采纳独立était作为新答案。'],
 ['tfs4-2013-verb-14','resolved','obj-gerund','参考明确en attendant，整段是penser rester…en attendant de trouver；题面无en因为参考填写覆盖整个副动词短语，不需要猜补或修改题面。'],
 ['tfs4-2013-verb-16','pending',null,'参考a été可概括一次找房经历；était可描述其困难状态。当前MD无排他解析，不用参考存在证明时态唯一，暂留两种分析。'],
 ['tfs4-2013-verb-17','resolved','obj-imparfait-habit','改为过去习惯：toujours aller en banlieue指找房中反复需要去郊区，参考fallait支持。'],
 ['tfs4-2023-q077','pending',null,'确认旧obj-unless错误：参考A及显式ne…pas构成à condition que，不是赘词ne的à moins que。目录缺适用叶，提出新节点，待目录修订与影响复核后纳入。'],
 ['tfs4-2023-q081','resolved','obj-r-cause','改为活动目的定位，题问campagne的but而非作者写作目的；首段contre les stéréotypes及préjugés直接支持。'],
 ['tfs4-2023-q095','pending',null,'参考D存在，但fin de la chasse不能严格推出法律上的interdite。其他项不符不补足该蕴含缺口；暂不在事实定位与推断间强制取一。'],
 ['tfs4-2023-q098','resolved','obj-r-context','改为语境术语释义：题目询问canard在十八世纪的含义，材料有明确历史定义。'],
 ['tfs4-2023-verb-3','resolved','obj-passe-compose','改为完成事件时态：Maman est sortie及Et puis…revenir推进过去叙事，参考est revenue支持；être性数配合是次要形态，不作为本题主考点。']
];
const papers=new Map([2012,2013,2023].map(y=>[y,JSON.parse(fs.readFileSync(`data/stage2-handoff/reviewed-pilots/${y}/content-v4.json`))]));
const disputed=comparison.summaries.flatMap(s=>s.disagreements);
assert.equal(decisions.length,disputed.length);
const records=decisions.map(([questionId,status,primaryId,rationale])=>{
 const d=disputed.find(d=>d.questionId===questionId);assert(d);
 const p=papers.get(Number(questionId.split('-')[1])),q=p.questions.find(q=>q.id===questionId),m=p.materials.find(m=>m.id===q.materialId);
 const referenceIds=q.answer.candidates.map(c=>c.referenceId);
 const references=p.references.filter(r=>referenceIds.includes(r.id));
 assert(references.length);
 return {questionId,questionVersionId:`${q.id}:v${q.version}`,previous:d.previous,independent:d.independent,status,primaryId,rationale,evidence:{question:q.evidence,material:m?.evidence??[],references},answerAdopted:false,classificationPublished:false};
});
const report={version:1,createdAt:new Date().toISOString(),executor:'Codex root; unblinded MD adjudication after independent reviews',comparisonSha256:sha(fs.readFileSync(`${dir}/comparison.json`)),reviewHashes:comparison.summaries.map(s=>({year:s.year,sha256:s.reviewSha256})),contentInputs:[...papers.keys()].map(year=>({year,sha256:sha(fs.readFileSync(`data/stage2-handoff/reviewed-pilots/${year}/content-v4.json`))})),summary:{disputes:17,resolved:records.filter(r=>r.status==='resolved').length,pending:records.filter(r=>r.status==='pending').length},records,catalogProposals:[{id:'obj-degree-pour',action:'clarify',definition:'trop+形容词+pour+不定式或pour que+虚拟式表达程度妨碍结果；从句形式不是单纯目的。',status:'proposal_not_applied'},{id:'obj-condition-que',parentId:'obj-clauses',action:'add',definition:'à condition que+虚拟式引入主句成立的必要条件，区别à moins que的例外条件和赘词ne。',status:'proposal_not_applied'}],goldStatus:'partial_adjudication_not_full_gold',productionChanged:false};
const output=`${dir}/adjudication-v1.json`;assert(!fs.existsSync(output),'Preserve adjudication versions');fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(report.summary);
