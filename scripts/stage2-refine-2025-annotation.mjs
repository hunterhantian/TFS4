import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const [inputFile,planFile,outputDir,startedAt]=process.argv.slice(2);
if(!inputFile||!planFile||!outputDir||!startedAt)throw Error('Usage: ... CONTENT PLAN OUTPUT START_ISO');
const content=JSON.parse(fs.readFileSync(inputFile,'utf8')), plan=JSON.parse(fs.readFileSync(planFile,'utf8'));
const newLeaves={
 21:['obj-2025-lex-prudent','prudent / réfléchi 近义辨析','谨慎与深思熟虑在决策语境中的近义边界。'],
 22:['obj-2025-lex-acier','nerfs d’acier / solides 固定表达','钢铁般神经与坚强抗压能力的近义表达。'],
 23:['obj-2025-lex-hors-de-lui','hors de lui 情绪习语','hors de lui 与 furieux 的愤怒失控语义。'],
 24:['obj-2025-lex-a-tout-prix','à tout prix 决心表达','à tout prix 与 absolument 的不惜一切/务必语义。'],
 25:['obj-2025-lex-ombre','à l’ombre / à l’abri 遮蔽表达','树荫、庇护和躲避环境影响的固定表达边界。'],
 26:['obj-2025-lex-relations','améliorer / dégrader 变化方向','关系改善与恶化的反义语义。'],
 27:['obj-2025-lex-precipitation','avec précipitation 行为方式','仓促、匆忙与相反行为方式的语境辨析。'],
 28:['obj-2025-lex-bons-termes','en bons termes 关系表达','保持良好关系的固定表达及其反义边界。'],
 29:['obj-2025-lex-alourdir','alourdir 重量变化','使负重增加与减轻的语境词义。'],
 30:['obj-2025-lex-ride','ne pas prendre une ride 年龄习语','保持不过时与已经老化的反义习语。']
};
const map={
 31:'obj-cloze-reference',32:'obj-negative-rien',33:'obj-degree-result',34:'obj-lex-plan',35:'obj-cloze-reference',36:'obj-cloze-reference',37:'obj-cloze-reference',38:'obj-cloze-reference',39:'obj-cloze-reference',40:'obj-cloze-reference',
 41:'obj-au-cas-ou',42:'obj-cause-puisque',43:'obj-en-reference',44:'obj-relative-preposition',45:'obj-concession-quel',46:'obj-tout-adverb',47:'obj-tout-pronoun',48:'obj-2025-grammar-explanation',49:'obj-subj-improbable',50:'obj-relative-preposition',51:'obj-tenir-a',53:'obj-possessive',54:'obj-purpose-que',55:'obj-indefinite',56:'obj-negative-rien',57:'obj-relative-cod',58:'obj-peu-unpeu',59:'obj-degree-result',60:'obj-unless',
 62:'obj-futur-anterieur',63:'obj-comme-si',64:'obj-pronominal-agreement',65:'obj-past-regret',71:'obj-relative-de',72:'obj-y',73:'obj-clitic-order',74:'obj-if-counterfactual',75:'obj-since-duration',76:'obj-degree-result',77:'obj-reported-time',78:'obj-subject-agreement',79:'obj-before-que',80:'obj-soi'
};
const existing=new Set(JSON.parse(fs.readFileSync('data/stage2-gold-r03/reviewed-plan.json','utf8')).catalog.filter(n=>n.leaf).map(n=>n.id));
const records=plan.records.map(r=>{if(r.status==='pending')return r;const id=newLeaves[r.label]?.[0]??map[r.label]??r.primaryId;if(!existing.has(id)&&!id.startsWith('obj-2025-'))throw Error(`missing leaf ${r.label}: ${id}`);return {...r,primaryId:id,primaryName:newLeaves[r.label]?.[1]??(id.startsWith('obj-2025-')?r.primaryName:id.replace(/^obj-/,'') ),status:'candidate-refined',basis:r.basis+' 独立复核：结合题干、答案和解析逐题选择现有叶；若旧目录无法准确承接则按批次规则建立独立新叶，仍待第二审阅轮确认。'};});
const candidateLeaves=[...Object.entries(newLeaves).map(([,v])=>({id:v[0],name:v[1],parentId:'obj-units',leaf:true,definition:v[2]+' 该叶为2025批次候选，不代表目录已冻结。'})),...plan.catalog.filter(n=>!n.id.startsWith('obj-2025-lex-'))];
const output={...plan,version:'2025-explanation-refined-r02',createdAt:new Date().toISOString(),startedAt,finishedAt:new Date().toISOString(),elapsedSeconds:(Date.now()-Date.parse(startedAt))/1000,scope:'2025 three-source-consistent questions; refined candidate leaf assignments and explicit new leaves, not release',catalog:candidateLeaves,records,summary:{...plan.summary,refined:records.filter(r=>r.status==='candidate-refined').length,pending:records.filter(r=>r.status==='pending').length,newLeafCandidates:Object.keys(newLeaves).length,classificationApproved:false}};
fs.mkdirSync(outputDir,{recursive:true});fs.writeFileSync(path.join(outputDir,'annotation-plan.json'),JSON.stringify(output,null,2));
console.log(JSON.stringify({startedAt,finishedAt:output.finishedAt,elapsedSeconds:output.elapsedSeconds,refined:output.summary.refined,pending:output.summary.pending}));
