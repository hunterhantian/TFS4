import {pathToFileURL} from 'node:url';
import {loadSynthesis,numberedBlankMaterial} from '../server/synthesis.mjs';
import {verbReference,verbReferenceVersion} from '../server/stage3-verb-answer-reference.mjs';
import {normalizeVerbAnswer,gradeFillV1,fillGradingVersion} from '../server/verb-grading.mjs';

// Preview only: preserve the user's reference and expose how each result was reached.
export function previewVerbGrade({id,response},bank=loadSynthesis()){
 if(!bank)throw new Error('题库快照不可用');
 const item=bank.items.find(i=>i.id===id&&/-V\d\d$/.test(i.id));if(!item)throw new Error('未找到动词填空题');
 const reference=verbReference(id),number=Number(id.slice(-2)),passage=numberedBlankMaterial(item,bank.items)||'';
 const clean=passage.replace(/<\/?u>/gi,'').replace(/\\_/g,'_');
 const matches=[...clean.matchAll(/(?:_{2,}\s*\(?(\d+)\)?\s*_{2,}|\((\d+)\))/g)].filter(m=>Number(m[1]||m[2])===number);
 const current=reference.value,accepted=[...new Set([current,...(reference.accepted||[])])],normalized=normalizeVerbAnswer(response);
 const match=accepted.find(value=>normalizeVerbAnswer(value)===normalized);
 const organized=reference.inputResolutionStatus==='previously-organized';
 const result=gradeFillV1(response,reference,{blankCount:matches.length});
 const labels={unanswered:'未作答',correct:'正确',wrong:'不匹配',manual:'待核对'};
 return {id,modelVersion:fillGradingVersion,result,label:labels[result],response:String(response??''),standardAnswer:current,sourceAnswer:reference.originalValue??current,standardVersion:verbReferenceVersion,blankAnswer:current,accepted,contextEvidence:reference.contextEvidence||reference.correctionBasis||null,mappingStatus:organized?'已有整理':'待逐空核验',blankCount:matches.length,context:matches.length===1?clean.slice(Math.max(0,matches[0].index-100),matches[0].index+matches[0][0].length+100):null,reason:matches.length!==1?'文章空位无法唯一定位':!normalized?'没有填写答案':match?'符合已列出的参考形式':organized?'不符合已整理的参考形式':'空内形式尚未逐题核验，暂不判错'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [id,...parts]=process.argv.slice(2);if(!id){console.error('用法：node scripts/verb-grading-prototype.mjs 2023-V01 "ai éteint"');process.exitCode=2;}else try{console.log(JSON.stringify(previewVerbGrade({id,response:parts.join(' ')}),null,2));}catch(e){console.error(e.message);process.exitCode=1;}
}
