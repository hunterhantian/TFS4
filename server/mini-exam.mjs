import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {projectRoot} from './db.mjs';
import {fail} from './security.mjs';
import {choiceAnswer,choiceAnswerVersion} from './stage3-choice-answer-key.mjs';
import {verbReference,verbReferenceVersion} from './stage3-verb-answer-reference.mjs';
export function miniCatalog(file=path.join(projectRoot,'.local/synthesis/snapshot.json')){
 if(!fs.existsSync(file))fail(503,'SYNTHESIS_NOT_IMPORTED','历年真题尚未导入，请联系管理员。');
 const raw=fs.readFileSync(file),data=JSON.parse(raw),revision=createHash('sha256').update(raw).digest('hex'),all=new Map();
 for(const item of data.items){const m=item.mapping,match=/^(\d{4}(?:-\d{2})?)-[QV]\d+$/.exec(m.itemId);if(!match||!['lexical','grammar','cloze','reading','verb_blank','verb_prompt_missing_blank'].includes(m.type))continue;const rows=all.get(match[1])||[];rows.push(item);all.set(match[1],rows);}
 return [...all].sort(([a],[b])=>b.localeCompare(a)).map(([sitting,items])=>{
  const get=t=>items.filter(x=>t.includes(x.mapping.type)).sort((a,b)=>a.mapping.itemId.localeCompare(b.mapping.itemId));const lex=get(['lexical']),gram=get(['grammar']),cloze=get(['cloze']),reading=get(['reading']),verbs=get(['verb_blank','verb_prompt_missing_blank']);
  const groups=new Map();for(const i of reading){const m=i.mapping.material,key=m?.text?JSON.stringify([m.source,m.line_start,m.line_end,m.text]):i.mapping.itemId;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(i);}const readGroups=[...groups.values()].sort((a,b)=>a[0].mapping.itemId.localeCompare(b[0].mapping.itemId));
  const label=sitting.replace(/^(\d{4})-(\d{2})$/,'$1年$2月').replace(/年0([56])月/,'年$1月');
  const globalIssues=[];if(lex.length!==10||gram.length!==40||cloze.length!==10||reading.length!==20||verbs.length!==20)globalIssues.push('该场次题量不完整');if(new Set(items.map(i=>i.mapping.itemId)).size!==100)globalIssues.push('题目缺失或重复');
  if(new Set(cloze.map(i=>i.mapping.material?.text)).size!==1||!cloze[0]?.mapping.material?.text)globalIssues.push('完形文章不完整');if(readGroups.length!==4||readGroups.some(g=>g.length!==5||!g[0].mapping.material?.text))globalIssues.push('阅读文章或题组不完整');
  const sheets=Array.from({length:5},(_,i)=>{
   const rows=[...lex.slice(i*2,i*2+2),...gram.slice(i*8,i*8+8),...(i===0?cloze:[...(readGroups[i-1]||[]),...verbs.slice((i-1)*5,i*5)])];const issues=[...globalIssues];const materials=[],materialKeys=new Map();
   const questions=rows.map(({mapping:m,answer:a})=>{const text=String(m.stem||m.source_record?.sol_high_decision?.stem||'').replace(/^\s*\d+[.、)]\s*/,'')||(m.type==='cloze'?`第 ${Number(m.itemId.match(/Q(\d+)$/)?.[1])} 空`:'');const isVerb=m.type.startsWith('verb_');const opts=m.options?.length?m.options:m.source_record?.sol_high_decision?.options||[];const options=Object.fromEntries(opts.map(o=>[o.label,o.text]));const mat=m.material;let materialId=null;if(mat?.text){const key=JSON.stringify([mat.source,mat.line_start,mat.line_end,mat.text]);if(!materialKeys.has(key)){const id=`m${materialKeys.size+1}`;materialKeys.set(key,id);materials.push({id,version:1,text:mat.text});}materialId=materialKeys.get(key);}if(isVerb&&m.type==='verb_prompt_missing_blank')issues.push(`${m.itemId} 原文空位缺失`);if(!text||(!isVerb&&(opts.length<2||opts.some(o=>!o.label||!o.text))))issues.push(`${m.itemId} 题面或选项缺失`);if(['cloze','reading','verb_blank'].includes(m.type)&&!materialId)issues.push(`${m.itemId} 原文缺失`);
    return {id:m.itemId,version:1,originalNo:Number(m.itemId.match(/[QV](\d+)$/)?.[1]),text,options,materialId,component:isVerb?'verb_blank':m.type,formalPart:isVerb?'V':m.type==='reading'?'VI':m.type==='grammar'?'IV':'III',responseType:isVerb?'text':'choice',pageKey:isVerb?'verbs':m.type==='reading'?'reading':m.type==='cloze'?'cloze':m.type,answer:{version:1,value:isVerb?verbReference(m.itemId).value:choiceAnswer(m.itemId,options),accepted:[],conditional:[],status:isVerb?verbReference(m.itemId).status:'user-reference',...(isVerb?{referenceVersion:verbReferenceVersion,referenceSource:verbReference(m.itemId)}:{})}};
   });if(questions.length!==20)issues.push('本卷题量不完整');return {number:i+1,available:!issues.length,issues:[...new Set(issues)],snapshot:{id:`mini-${sitting}-${i+1}`,title:`${label}${sitting.includes('-')?'':'年'}真题 · Mini ${i+1}`,sourceRevision:revision,answerKeyVersion:choiceAnswerVersion,mini:{sitting,number:i+1},questions,materials}};
  });return {sitting,revision,sheets};
 });
}
