// Timed first-pass annotation for the 2025 unseen sitting.
// It consumes the frozen content candidate and the reviewed explanation evidence layer.
// Conflicts are deliberately excluded; labels are candidates until independent review.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const [contentFile, explanationFile, outputDir, startedAt] = process.argv.slice(2);
if (!contentFile || !explanationFile || !outputDir || !startedAt) throw Error('Usage: ... CONTENT EXPLANATION OUTPUT START_ISO');
const content=JSON.parse(fs.readFileSync(contentFile,'utf8'));
const explanation=fs.readFileSync(explanationFile,'utf8');
const blocked=new Map([[52,'source_conflict'],[61,'explanation_error'],[66,'source_conflict'],[67,'source_conflict'],[68,'source_conflict'],[69,'source_conflict'],[70,'source_conflict']]);
const qBy=n=>content.questions.find(q=>q.responseType==='choice'&&q.originalLabel===String(n));
const quoteFor=n=>{const re=new RegExp(`(?:^|\\n)(?:#{1,6}\\s*)?(?:\\*\\*)?${n}[.、]`,'m');const m=re.exec(explanation);if(!m)return null;const tail=explanation.slice(m.index);return tail.slice(0,Math.min(900,tail.indexOf(`\\n${n+1}.`)>=0?tail.indexOf(`\\n${n+1}.`):900)).trim();};
const leafByName=(id,name,parentId,definition)=>({id,name,parentId,leaf:true,definition});
const catalog=[
 leafByName('obj-2025-lexical-context','2025词汇语境辨析','obj-units','根据解析在具体语境中判断近义、反义、固定表达；不把每个词项自动拆成独立知识点。'),
 leafByName('obj-2025-grammar-explanation','2025语法规则候选','obj-grammar','由解析说明形成的暂定语法主考点；待与现有叶逐题竞争后定稿。'),
 leafByName('obj-2025-cloze-explanation','2025完形篇章规则候选','obj-units','根据解析结合完形材料判断词汇、指代或篇章衔接；待细分到现有叶。')
];
const records=[];
for(const n of Array.from({length:80},(_,i)=>i+21)){
 const q=qBy(n);assert(q,`missing ${n}`);const code=blocked.get(n);if(code){records.push({questionId:q.id,year:2025,label:n,status:'pending',pendingReason:code,primaryId:null,primaryName:null});continue;}
 let primaryId='obj-2025-grammar-explanation',primaryName='2025语法规则候选';
 if(n<=30){primaryId='obj-2025-lexical-context';primaryName='2025词汇语境辨析';}
 else if(n<=40){primaryId='obj-2025-cloze-explanation';primaryName='2025完形篇章规则候选';}
 else if(n>=81){const exclusion=[85,90,95,100].includes(n);primaryId=exclusion?'obj-r-exclusion':'obj-r-detail';primaryName=exclusion?'否定问法与信息排除':'人物、事件与事实定位';}
 const quote=quoteFor(n);records.push({questionId:q.id,questionVersionId:`${q.id}:v${q.version}`,year:2025,label:n,typeId:q.typeId,responseType:q.responseType,primaryId,primaryName,status:'candidate',basis:'三源校对通过后，依据答案解析的考点说明形成初标；仍需与现有目录叶逐题竞争复核。',keyEvidence:[{source:'question',quote:q.text},{source:'explanation',quote:quote??'解析题号未能自动截取，待人工定位'}]});
}
const eligible=records.filter(r=>r.status==='candidate');
const output={version:'2025-explanation-first-pass-r01',createdAt:new Date().toISOString(),startedAt,finishedAt:new Date().toISOString(),elapsedSeconds:(Date.now()-Date.parse(startedAt))/1000,scope:'2025 three-source-consistent objective choice questions; provisional labels only',inputs:{contentSha256:createHash('sha256').update(fs.readFileSync(contentFile)).digest('hex'),explanationSha256:createHash('sha256').update(fs.readFileSync(explanationFile)).digest('hex')},catalog,records,summary:{choiceQuestions:80,candidateAnnotated:eligible.length,pending:records.length-eligible.length,hearingExcluded:20,verbExplanationMissing:20,answersAdopted:false,classificationApproved:false}};
fs.mkdirSync(outputDir,{recursive:true});fs.writeFileSync(path.join(outputDir,'annotation-plan.json'),JSON.stringify(output,null,2));
console.log(JSON.stringify({startedAt,finishedAt:output.finishedAt,elapsedSeconds:output.elapsedSeconds,candidateAnnotated:eligible.length,pending:records.length-eligible.length}));
