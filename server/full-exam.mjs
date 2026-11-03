import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {projectRoot} from './db.mjs';
import {fail} from './security.mjs';
import {choiceAnswer,choiceAnswerVersion} from './stage3-choice-answer-key.mjs';

export function fullExamCatalog(file=path.join(projectRoot,'.local/synthesis/snapshot.json')){
 if(!fs.existsSync(file))fail(503,'SYNTHESIS_NOT_IMPORTED','历年真题尚未导入，请联系管理员。');
 const raw=fs.readFileSync(file),data=JSON.parse(raw),revision=createHash('sha256').update(raw).digest('hex'),all=new Map();
 for(const item of data.items){const m=item.mapping,match=/^(\d{4}(?:-0[56])?)-Q(\d{3})$/.exec(m.itemId);if(!match)continue;const rows=all.get(match[1])||[];rows.push(item);all.set(match[1],rows);}
 return [...all].sort(([a],[b])=>b.localeCompare(a)).map(([sitting,items])=>{
  items.sort((a,b)=>a.mapping.itemId.localeCompare(b.mapping.itemId));const label=sitting.replace(/^(\d{4})-0([56])$/,'$1年$2月')+(sitting.includes('-')?'':'年');const issues=[],warnings=[],materials=[],ids=new Map();
  const audioId=`listening-${sitting}`;materials.push({id:audioId,version:1,text:`${label}听力完整录音（可能包含听写及考试指令）`,audioUrl:`https://193.112.151.236/media/stage3/${sitting}.mp3`});
  const questions=items.map(({mapping:m,answer:a},idx)=>{const no=Number(m.itemId.match(/Q(\d+)$/)?.[1]);const type=m.type;const expected=no<=20?'listening':no<=30?'lexical':no<=40?'cloze':no<=80?'grammar':'reading';if(type!==expected)issues.push(`第 ${no} 题题型不符合试卷结构`);
   const source=m.source_record?.sol_high_decision;let optionsArr=m.options?.length?m.options:source?.options||[];if(m.itemId==='2023-Q075'&&optionsArr.length===4&&optionsArr.map(o=>o.label).join('')==='ABBD'&&optionsArr[2].text==='Oui, dis-la-leur.'){optionsArr=optionsArr.map((o,i)=>i===2?{...o,label:'C'}:o);warnings.push('第 75 题原卷标号重复，已按既有校对记录将第三项标为 C');}const options=Object.fromEntries(optionsArr.map(o=>[o.label,o.text]));const stem=String(m.stem||source?.stem||'').replace(/^\s*\d+[.、)]\s*/,'')||(type==='cloze'?`第 ${no} 空`:'');let materialId=type==='listening'?audioId:null;
   if(['reading','cloze'].includes(type)){const mat=m.material;if(!mat?.text)issues.push(`第 ${no} 题原文缺失`);else{const key=JSON.stringify([mat.source,mat.line_start,mat.line_end,mat.text]);if(!ids.has(key)){const id=`m${ids.size+1}`;ids.set(key,id);materials.push({id,version:1,text:mat.text});}materialId=ids.get(key);}}
   if(!stem||optionsArr.length<2||optionsArr.some(o=>!o.label||!o.text)||Object.keys(options).length!==optionsArr.length)issues.push(`第 ${no} 题题面或选项不完整`);
   if(m.material_status==='source_missing'){if(!source?.stem||!(source?.options?.length))issues.push(`第 ${no} 题原始题面缺失`);else warnings.push(`第 ${no} 题使用后续恢复的题面，来源待核验`);}
   const candidate=choiceAnswer(m.itemId,options);if(typeof candidate!=='string'||!Object.hasOwn(options,candidate))warnings.push(`第 ${no} 题候选答案缺失或不确定`);
   const part=type==='listening'?'II':type==='grammar'?'IV':type==='reading'?'VI':'III';const pageKey=type==='reading'?`reading-${materialId}`:`${type}-${Math.floor((no-1)/10)}`;
   return {id:m.itemId,version:1,originalNo:no,text:stem,options,component:type,formalPart:part,materialId,responseType:'choice',pageKey,answer:{version:1,value:candidate,status:'user-approved',accepted:[],conditional:[]}};
  });
  if(questions.length!==100||questions.some((q,i)=>q.originalNo!==i+1))issues.push('客观题未完整覆盖第 1—100 题');
  const cloze=questions.filter(q=>q.component==='cloze'),reading=questions.filter(q=>q.component==='reading');if(new Set(cloze.map(q=>q.materialId)).size!==1||!cloze[0]?.materialId)issues.push('完形填空文章不完整');const groups=new Map();for(const q of reading)groups.set(q.materialId,(groups.get(q.materialId)||0)+1);if(groups.size!==4||[...groups.values()].some(n=>n!==5)||groups.has(null))issues.push('阅读文章或题组不完整');
  return {sitting,title:`${label}完整客观题模拟考试`,available:issues.length===0,issues:[...new Set(issues)],warnings:[...new Set(warnings)],snapshot:{id:`full-objective-${sitting}`,title:`${label}完整客观题模拟考试`,sourceRevision:revision,answerKeyVersion:choiceAnswerVersion,contentNotes:[...new Set(warnings)],questions,materials}};
 });
}
