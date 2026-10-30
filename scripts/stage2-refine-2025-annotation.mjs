import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const [inputFile,planFile,outputDir,startedAt]=process.argv.slice(2);
if(!inputFile||!planFile||!outputDir||!startedAt)throw Error('Usage: ... CONTENT PLAN OUTPUT START_ISO');
const content=JSON.parse(fs.readFileSync(inputFile,'utf8')), plan=JSON.parse(fs.readFileSync(planFile,'utf8'));
const map={
 31:'obj-cloze-reference',32:'obj-negative-rien',33:'obj-degree-result',34:'obj-lex-plan',35:'obj-cloze-reference',36:'obj-cloze-reference',37:'obj-cloze-reference',38:'obj-cloze-reference',39:'obj-cloze-reference',40:'obj-cloze-reference',
 41:'obj-au-cas-ou',42:'obj-cause-puisque',43:'obj-en-reference',44:'obj-relative-preposition',45:'obj-concession-quel',46:'obj-tout-adverb',47:'obj-tout-pronoun',48:'obj-2025-grammar-explanation',49:'obj-subj-improbable',50:'obj-relative-preposition',51:'obj-tenir-a',53:'obj-possessive',54:'obj-purpose-que',55:'obj-indefinite',56:'obj-negative-rien',57:'obj-relative-cod',58:'obj-peu-unpeu',59:'obj-degree-result',60:'obj-unless',
 62:'obj-futur-anterieur',63:'obj-comme-si',64:'obj-pronominal-agreement',65:'obj-past-regret',71:'obj-relative-de',72:'obj-y',73:'obj-clitic-order',74:'obj-if-counterfactual',75:'obj-since-duration',76:'obj-degree-result',77:'obj-reported-time',78:'obj-subject-agreement',79:'obj-before-que',80:'obj-soi'
};
const existing=new Set(JSON.parse(fs.readFileSync('data/stage2-gold-r03/reviewed-plan.json','utf8')).catalog.filter(n=>n.leaf).map(n=>n.id));
const records=plan.records.map(r=>{if(r.status==='pending')return r;const id=map[r.label]??r.primaryId;if(!existing.has(id)&&!id.startsWith('obj-2025-'))throw Error(`missing leaf ${r.label}: ${id}`);return {...r,primaryId:id,primaryName:id.startsWith('obj-2025-')?r.primaryName:id.replace(/^obj-/,'') ,status:'candidate-refined',basis:r.basis+' 独立复核：结合题干、答案和解析逐题选择现有叶；仍待第二审阅轮确认。'};});
const output={...plan,version:'2025-explanation-refined-r01',createdAt:new Date().toISOString(),startedAt,finishedAt:new Date().toISOString(),elapsedSeconds:(Date.now()-Date.parse(startedAt))/1000,scope:'2025 three-source-consistent questions; refined candidate leaf assignments, not release',records,summary:{...plan.summary,refined:records.filter(r=>r.status==='candidate-refined').length,pending:records.filter(r=>r.status==='pending').length,classificationApproved:false}};
fs.mkdirSync(outputDir,{recursive:true});fs.writeFileSync(path.join(outputDir,'annotation-plan.json'),JSON.stringify(output,null,2));
console.log(JSON.stringify({startedAt,finishedAt:output.finishedAt,elapsedSeconds:output.elapsedSeconds,refined:output.summary.refined,pending:output.summary.pending}));
