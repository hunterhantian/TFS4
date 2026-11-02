import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {projectRoot} from './db.mjs';
import {fail} from './security.mjs';

const audioFor=sitting=>`https://193.112.151.236/media/stage3/${sitting}.mp3`;
export function listeningCatalog(file=path.join(projectRoot,'.local/synthesis/snapshot.json')){
 if(!fs.existsSync(file))fail(503,'SYNTHESIS_NOT_IMPORTED','历年真题尚未导入，请联系管理员。');
 const raw=fs.readFileSync(file);const data=JSON.parse(raw);const revision=createHash('sha256').update(raw).digest('hex');const bySitting=new Map();
 for(const item of data.items){const m=item.mapping,match=/^(\d{4}(?:-\d{2})?)-Q(\d{3})$/.exec(m.itemId);if(!match||m.type!=='listening')continue;const sitting=match[1];if(!/^(?:200[5-9]|201\d|202[2-5]|2021-0[56])$/.test(sitting))continue;const list=bySitting.get(sitting)||[];list.push(item);bySitting.set(sitting,list);}
 return [...bySitting].sort(([a],[b])=>b.localeCompare(a)).map(([sitting,items])=>{
  items.sort((a,b)=>a.mapping.itemId.localeCompare(b.mapping.itemId));const materialId=`listening-${sitting}`;
  const questions=items.map(({mapping:m,answer:a})=>{const rawOptions=m.options?.length?m.options:m.source_record?.sol_high_decision?.options||[];const options=Object.fromEntries(rawOptions.map(o=>[o.label,o.text]));const candidate=typeof a?.answer_view==='string'&&Object.hasOwn(options,a.answer_view)?a.answer_view:null;return {id:m.itemId,version:1,originalNo:Number(m.itemId.slice(-3)),text:String(m.stem||m.source_record?.sol_high_decision?.stem||'').replace(/^\s*\d+[.、)]\s*/,''),options,materialId,component:'listening',formalPart:'II',answer:{version:1,value:candidate}};});
  const available=questions.length===20&&questions.every((q,i)=>q.originalNo===i+1&&q.text&&Object.keys(q.options).length>=2&&Object.values(q.options).every(Boolean));
  return {sitting,title:`${sitting.replace('-', '年')}年听力测试`.replace('年05年','年5月').replace('年06年','年6月'),available,format:'mp3',snapshot:{id:`listening-${sitting}`,title:`${sitting.replace('-', '年')}年听力测试`.replace('年05年','年5月').replace('年06年','年6月'),sourceRevision:revision,answerKeyVersion:'unverified-candidate',questions,materials:[{id:materialId,version:1,text:'听力完整录音',audioUrl:audioFor(sitting)}]}};
 });
}
