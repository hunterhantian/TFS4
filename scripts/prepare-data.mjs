import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const raw=fs.readFileSync(new URL('../dist/exam-data.js',import.meta.url),'utf8');
const sandbox={window:{}}; vm.runInNewContext(raw,sandbox,{timeout:1000});
const original=sandbox.window.EXAM_DATA;
const hash=crypto.createHash('sha256').update(raw).digest('hex');
const groups=[[1,10,'II','listening','dialogue',null],[11,20,'II','listening','interview',null],[21,30,'III','vocabulary','lexical',null],[31,40,'III','vocabulary','cloze','cloze-31'],[41,60,'IV','grammar','multiple-choice-1',null],[61,80,'IV','grammar','multiple-choice-2',null],[81,85,'VI','reading','reading','reading-81'],[86,90,'VI','reading','reading','reading-86'],[91,95,'VI','reading','reading','reading-91'],[96,100,'VI','reading','reading','reading-96']];
const data={schemaVersion:1,dataset:'candidate',sourceId:'tfs4-2025-working',sourceSha256:hash,officialProvenance:'user_confirmed_reference_answers; explanations_unconfirmed',materials:Object.entries(original.contexts).map(([n,text])=>({id:n==='31'?'cloze-31':`reading-${n}`,text})),questions:original.questions.map(q=>{const g=groups.find(([a,b])=>q.no>=a&&q.no<=b);return {id:`tfs4-2025-q${q.no}`,version:1,originalNo:q.no,formalPart:g[2],component:g[3],type:g[4],materialId:g[5],text:q.text,options:q.options,answer:{value:q.answer,version:[61,62].includes(q.no)?2:1,status:'reference_confirmed',source:'2025-reference-v1'},knowledgeLinks:[]};})};
export function validateCandidate(value){
 if(value.dataset!=='candidate'||value.questions.length!==100)throw Error('Expected 100 candidate questions');
 const ids=new Set();const materials=new Set(value.materials.map(m=>m.id));
 for(const q of value.questions){if(ids.has(q.id)||!['listening','vocabulary','grammar','reading'].includes(q.component)||!(q.originalNo<=20?['A','B','C']:['A','B','C','D']).every(k=>q.options[k])||!q.options[q.answer.value]||(q.materialId&&!materials.has(q.materialId)))throw Error(`Invalid question ${q.id}`);ids.add(q.id);}
 return true;
}
validateCandidate(data);
fs.writeFileSync(new URL('../data/2025-candidate.json',import.meta.url),JSON.stringify(data,null,2)+'\n');
console.log(`Validated ${data.questions.length} candidate questions; no production import performed.`);


