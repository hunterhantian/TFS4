// Authored MD review of 2012/2013/2023 only. No PDF access, answer adoption or publication.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import Database from 'better-sqlite3';
import {validateContent} from '../server/stage2.mjs';

const [sourceRoot, dbFile, outputRoot] = process.argv.slice(2);
if (!sourceRoot || !dbFile || !outputRoot || fs.existsSync(outputRoot)) throw Error('Usage: stage2-proofread-pilots.mjs PILOT_CONTENT DB NEW_OUTPUT');
const read = f => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, ''));
const hash = v => createHash('sha256').update(v).digest('hex');
const db = new Database(dbFile, {readonly:true, fileMustExist:true});
const cp = s => Array.from(s).length;
const plain = s => s.replace(/\\_/g, '_').replace(/<[^>]*>/g, '').replace(/\*|~~/g, '')
  .replace(/^\s*(?:CS 扫描全能王|3\s*亿人都在用的扫描App|-\d+-)\s*$/gm, '')
  .replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, '\n\n').trim();
const checks = ['stem','all_options','underline_offsets','original_label','section','order','material_membership','source_spans'];
const verbValues = {
  2012:['raconte','me souviendrai','a eu',"(j')avais",'Ayant réussi','habitaient','me suis aventuré','avait plu','était','pouvait','murmurer','est apparue',"(m') a répondu",'était sorti','parvenu','portant','lisait','tamisée','caressait',"n'aurais pas dû"],
  2013:["l'ont amenée",'était','se souvient','disaient','devons','sera','pourra','voyait','serait','pleuvait','faisait','sont allés','pensaient','en attendant','trouver','a été','fallait','était','se demandait','existait'],
  2023:["J'ai éteint",'me suis mis à','est revenue','a allumé',"n'était pas","t'avoir dit",'suis','vas',"n'est pas",'donne','a pris','rendrait','aurais fini',"J'ai essayé",'ne sert presque jamais','fais','en courant',"j'ai demandé",'rende','sois']
};
const summary=[];
fs.mkdirSync(outputRoot,{recursive:true});
try {
for (const year of [2012,2013,2023]) {
 const inputFile=path.join(sourceRoot,String(year),'content-v4.json'), data=read(inputFile);
 const paper=data.documents.find(d=>d.role==='paper'), answers=data.documents.find(d=>d.role==='answers');
 const original=structuredClone(data), decisions=[], materialReviews=[], mappings=[], sectionReviews=[];
 data.paperVersion=db.prepare('SELECT coalesce(max(version),0)+1 n FROM qb_paper_versions WHERE paper_id=?').get(data.paper.id).n;
 data.revisionNote='全三卷MD内部逐题核对；保留来源缺项，不含PDF视觉核验、分类通过或正式答案采纳';
 const all=d=>d.pages.map(p=>p.markdown).join('\n\n---\n\n');
 const exactEvidence=(doc,quote,occurrence=0)=>{
  let found=0;for(const page of doc.pages){let start=page.markdown.indexOf(quote);while(start>=0){if(found++===occurrence)return {documentId:doc.id,page:page.page,start:cp(page.markdown.slice(0,start)),end:cp(page.markdown.slice(0,start+quote.length)),quote};start=page.markdown.indexOf(quote,start+quote.length);}}
  throw Error(`${year}: missing evidence ${quote.slice(0,90)}`);
 };
 const sliceEvidence=(doc,start,end)=>{
  let offset=0;const spans=[];for(const page of doc.pages){const a=Math.max(start,offset),b=Math.min(end,offset+page.markdown.length);if(b>a){const quote=page.markdown.slice(a-offset,b-offset);spans.push({documentId:doc.id,page:page.page,start:cp(page.markdown.slice(0,a-offset)),end:cp(page.markdown.slice(0,b-offset)),quote});}offset+=page.markdown.length+7;}return spans;
 };
 const issue=(q,code,message,severity='blocking')=>data.issues.push({id:'md-review-'+data.issues.length,questionId:q.id,code,severity,status:'open',message});
 const get=n=>data.questions.find(q=>q.responseType==='choice'&&q.originalLabel===String(n));
 const note=(q,message)=>{const entry=decisions.find(x=>x.questionId===q.id);entry.notes.push(message);};
 for(const old of data.issues){old.status='resolved';old.message+='；本轮已逐项核对，具体未解决问题另列，不表示全部内容通过';}
 for(const q of data.questions){
  const old=original.questions.find(x=>x.id===q.id);
  const identity=db.prepare('SELECT paper_id,node_key FROM qb_questions WHERE id=?').get(q.id);
  if(identity){assert.equal(identity.paper_id,data.paper.id);q.nodeKey=identity.node_key;}
  q.version=db.prepare('SELECT coalesce(max(version),0)+1 n FROM qb_question_versions WHERE question_id=?').get(q.id).n;
  q.answer.version=1;
  const underlined=q.annotations.map(a=>plain(Array.from(q.text).slice(a.start,a.end).join('')));
  q.text=plain(q.text);q.options=q.options.map(o=>({...o,text:plain(o.text)}));q.annotations=[];
  for(const text of underlined){const index=q.text.indexOf(text);assert(index>=0);q.annotations.push({kind:'underline',start:cp(q.text.slice(0,index)),end:cp(q.text.slice(0,index))+cp(text)});}
  decisions.push({questionId:q.id,version:q.version,originalLabel:q.originalLabel,responseType:q.responseType,checks:[...checks],notes:[],sourceEvidence:q.evidence,originalVersion:old.version});
 }
 // Preserve Part instructions rather than silently leaving candidate instruction fields empty.
 const paperFull=all(paper), headings=[...paperFull.matchAll(/^(?:#{1,6}\s*)?(?:\*\*)?(?:PARTIE|Partie)\s+(VII|VI|IV|V|III|II|I)\b[^\n]*/gm)];
 for(const section of data.sections){
  const heading=headings.find(h=>h[1]===section.id);assert(heading);
  const end=headings.find(h=>h.index>heading.index)?.index??paperFull.length,body=paperFull.slice(heading.index+heading[0].length,end);
  const stop={II:/^\s*(?:\*\*)?1\./m,III:/^\s*(?:\*\*)?21\./m,IV:/^\s*(?:\*\*)?41\./m,V:/^## /m,VI:/^#{1,6}\s+(?:\*\*)?[1-4]\./m,VII:/^(?:<table>|Image A)/m}[section.id];
  const cut=stop?body.search(stop):-1,finish=cut>=0?heading.index+heading[0].length+cut:end;
  section.label=plain(heading[0]).replace(/^#+\s*/, '');section.instruction=plain(paperFull.slice(heading.index+heading[0].length,finish));
  sectionReviews.push({id:section.id,label:section.label,instruction:section.instruction,evidence:sliceEvidence(paper,heading.index,finish)});
 }
 // Deliberate editorial decisions after reading both MD documents in full.
 if(year===2012){
  const q=get(51);q.text=q.text.replace(/\n\s*vous désirez$/,'');q.annotations=[];
  const at=q.text.indexOf('vous désirez');q.annotations.push({kind:'underline',start:at,end:at+'vous désirez'.length});
  note(q,'删除第二行重复的vous désirez；将其下划线移至同一句中已有短语，原始行证据保留');
  issue(get(44),'SOURCE_CHARACTER_UNCERTAIN','MD为disc，疑似dise；无第二来源，不改字');
  issue(get(48),'SOURCE_DUPLICATE_OPTION_TEXT','MD中B/C均为vieille，保留原文；不能猜补变体');
  issue(get(68),'SOURCE_BLANK_MISSING','MD题干为Elle parle lentement les étudiants...；未给出明确填空位，不从答案反造');
 }
 if(year===2013){
  for(const n of [46,55,75])issue(get(n),'SOURCE_BLANK_MISSING','原始MD题干没有明确填空位；逐题核对已完成，但内容仍阻断');
  issue(get(58),'SOURCE_CHARACTER_UNCERTAIN','选项A原文nc，疑似ne；保留来源，不推断改写');
  issue(get(31),'SOURCE_SPELLING_UNCERTAIN','选项B原文au tour du，疑似autour du；不以语法推断替代来源修订','warning');
  const m=data.materials.find(m=>m.kind==='cloze'),raw=all(paper);
  const a=raw.indexOf('Le Vendée Globe est une course'),b=raw.indexOf('CS 扫描全能王',a);
  const tail=raw.indexOf('il <u>__39__</u> la côte brésilienne'),end=raw.indexOf('\n\n31. A.',tail);
  assert(a>=0&&b>a&&tail>b&&end>tail);
  const prefix=raw.slice(a,b).trimEnd();assert(prefix.endsWith('il'));
  m.text=plain(prefix.slice(0,-2)+raw.slice(tail,end));
  m.evidence=[...sliceEvidence(paper,a,b),...sliceEvidence(paper,tail,end)];
  materialReviews.push({materialId:m.id,decision:'reconstructed_from_overlapping_MD',reason:'以首份含31/32的段落加后份39/40续文拼合，重复交叠只保留一次，不根据题目选项补字',evidence:m.evidence});
  for(const q of data.questions.filter(q=>q.materialId===m.id))note(q,'完形材料按两段重叠MD重建；补回来源中确有的31、32空并保留39、40续文');
  for(const n of [81,82,83,84,85])issue(get(n),'SOURCE_MATERIAL_ELLIPSIS','Modes d’emploi材料含独立...行，无法仅据MD确认是否省略正文；保留整组阻断');
 }
 if(year===2023){
  const q=get(75);assert.deepEqual(q.options.map(o=>o.key),['A','B','B','D']);q.options[2].key='C';q.options[2].label='C';
  note(q,'原标签A/B/B/D按四个实际位置规范为A/B/C/D，第三项文字保持Oui, dis-la-leur.；保留原文证据');
  note(get(14),'去除跨选项的~~展示标记，保留A/B/C三项全部文字，不把删除线当作删除选项指令');
  note(get(48),'仅移除fait周围删除线标记，保留完整句子和空位');
  issue(get(43),'POSSIBLE_MULTIPLE_VALID_OPTIONS','rose与bleu ciel均可作复数名词的不变颜色修饰语；保留原题及参考映射，需独立答案审查','warning');
 }
 // Materials retain full source wording, with page furniture and display markup removed.
 for(const m of data.materials){
  m.text=plain(m.text);m.version=db.prepare('SELECT coalesce(max(version),0)+1 n FROM qb_material_versions WHERE material_id=?').get(m.id).n;
  if(!materialReviews.some(x=>x.materialId===m.id))materialReviews.push({materialId:m.id,decision:'MD_checked',evidence:m.evidence});
  if(m.kind==='cloze')for(let n=31;n<=40;n++)assert(m.text.includes('__'+n+'__'),`missing cloze ${year}/${n}`);
  const expected=m.kind==='cloze'?Array.from({length:10},(_,i)=>get(31+i).id):m.kind==='reading'?Array.from({length:5},(_,i)=>get(81+(Number(m.id.at(-1))-1)*5+i).id):m.questionIds;
  assert.deepEqual(m.questionIds,expected);
 }
 // Verbs: explicit authored answer mapping; table layout is not reading order.
 const vm=data.materials.find(m=>m.kind==='verb_form'), verbs=data.questions.filter(q=>q.responseType==='verb_form').sort((a,b)=>a.blankIndex-b.blankIndex);
 assert.equal(verbs.length,20);const markers=[...vm.text.matchAll(/\(([^()]{1,80})\)/g)].filter(m=>/^[a-zàâçéèêëîïôùûüœ][a-zàâçéèêëîïôùûüœ '\-]*$/.test(m[1])&&!/^(?:[jlmtcs]|qu)'$/.test(m[1]));assert.equal(markers.length,20);
 const occurrenceMap=new Map();
 for(const [i,q] of verbs.entries()){
  const marker=markers[i],lemma=marker[1],value=verbValues[year][i];assert.equal(q.text,marker[0]);assert.equal(q.blankIndex,i+1);
  let entry;
  if(year===2023){const raw=all(answers),re=new RegExp('(?:^|\\n)'+(i+1)+'\\. ([^\\n]+)');const match=raw.match(re);assert(match&&match[1]===value);entry=exactEvidence(answers,(i+1)+'. '+value);}
  else{
   // Match source lemma/answer pair literally, allowing the final bold pair in 2013.
   const escaped=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
   const re=new RegExp('(?:\\*\\*'+escaped(lemma)+'\\*\\*|\\*'+escaped(lemma)+'\\*|<u>'+escaped(lemma)+'</u>)\\s+(?:<u>'+escaped(value)+'</u>|\\*\\*'+escaped(value)+'\\*\\*)','g');
   const matches=[...all(answers).matchAll(re)];assert(matches.length,`missing verb reference ${year}/${i+1}: ${lemma} ${value}`);
   const key=lemma+'|'+value,index=occurrenceMap.get(key)??0;assert(matches[index]);entry=exactEvidence(answers,matches[index][0],index);occurrenceMap.set(key,index+1);
  }
  const rid=`tfs4-${year}-mdreview-verb-ref-${i+1}`;
  data.references.push({id:rid,kind:'answer',originalLabel:'Part V · '+(i+1),text:entry.quote,evidence:[entry]});
  q.answer={version:1,status:'mapped',value:null,candidates:[{referenceId:rid,value}],reason:'逐空对照MD篇章和答案；原始参考保留，未采纳为正式判分答案'};
  if((year===2013&&i===0)||(year===2023&&i===1)){
   q.answer.status='unusable';q.answer.reason=year===2013?'来源答案含l’ont amenée，而题面已有la，直接替换会重复宾语；保留参考，待确认填写边界':'来源答案me suis mis à，而题面后接au travail，直接替换会成为à au；保留参考，待确认填写边界';
   issue(q,'REFERENCE_INSERTION_BOUNDARY',q.answer.reason,'warning');
  }
  const start=cp(vm.text.slice(0,marker.index)),following=vm.text.slice(marker.index+marker[0].length),blank=following.match(/^\s*(_+(?:\(\d+\)_+)?)/);
  mappings.push({questionId:q.id,blankIndex:i+1,lemma,materialId:vm.id,materialVersion:vm.version,target:{start,end:start+cp(marker[0]),quote:marker[0]},printedBlank:blank?.[1]??null,locationBasis:blank?'parenthesized_verb_and_printed_blank':'explicit_parenthesized_verb_under_Part_V_instruction',context:vm.text.slice(Math.max(0,marker.index-65),marker.index+marker[0].length+80),referenceId:rid,rawAnswer:value,referenceEvidence:entry,status:q.answer.status,answerReason:q.answer.reason});
  note(q,'已逐空核对括号动词、完整篇章定位及来源答案；不人为添加原文没有的下划线');
 }
 // Listening task reference lives in the supplied answer sheet, not standalone audio/transcripts.
 const dict=data.questions.find(q=>q.responseType==='dictation'),writing=data.questions.find(q=>q.responseType==='writing');
 const answerText=all(answers);let transcriptStart,transcriptEnd;
 if(year===2012){transcriptStart=answerText.indexOf('## **Les villes françaises**');transcriptEnd=answerText.indexOf('## **PARTIE V',transcriptStart);}
 if(year===2013){transcriptStart=answerText.indexOf('**La Chine va-t-elle gagner');transcriptEnd=answerText.indexOf('## **PARTIE V',transcriptStart);}
 if(year===2023){transcriptStart=answerText.indexOf('## Vingt-quatre');transcriptEnd=answerText.indexOf('**听力**',transcriptStart);}
 assert(transcriptStart>=0&&transcriptEnd>transcriptStart);const transcript=answerText.slice(transcriptStart,transcriptEnd).trim();
 const drid=`tfs4-${year}-mdreview-dictation-ref`;data.references.push({id:drid,kind:'answer',originalLabel:'Part I',text:plain(transcript),evidence:sliceEvidence(answers,transcriptStart,transcriptEnd)});
 dict.answer={version:1,status:'mapped',value:null,candidates:[{referenceId:drid,value:plain(transcript)}],reason:'只映射配套答案MD中的听写参考；不读取独立听力原文或音频，不自动判分'};
 note(dict,'核对试卷说明、词汇与数字书写要求，并将答案页听写参考独立映射');
 if(year===2023)issue(dict,'SOURCE_INSTRUCTION_CHARACTER','听写说明原文vous n’avez du à l’écouter疑似qu’à；不从其他年份复制修订','warning');
 // Both rewritten picture task and historical word-list task remain visible; no silent choice.
 const fullPaper=all(paper),taskStart=fullPaper.search(/(?:\*\*)?(?:PARTIE|Partie) VII\s*:/),taskEnd=fullPaper.indexOf('\n-54-',taskStart);
 assert(taskStart>=0);
 let taskRaw=fullPaper.slice(taskStart,taskEnd>=0?taskEnd:undefined).split(/\n-38-\n/)[0];
 writing.text=plain(taskRaw).replace(/\n\[Ta[\s\S]*$/,'').trim();writing.evidence=sliceEvidence(paper,taskStart,taskStart+taskRaw.length);
 writing.assetDescriptions=[{required:true,description:'MD仅有图像占位/模型文字描述，未提供可核验原图；不得作为实际图片使用'}];
 issue(writing,'MISSING_SOURCE_IMAGES','写作主任务依赖图片，MD只有描述或Image占位；保留任务，内容不可发布');
 let essayId=null;
 if(year!==2023){
  const start=year===2012?answerText.indexOf("## **L'argent ne fait pas le bonheur, mais...**"):answerText.indexOf("# **Évitez d'être un mauvais convive**");
  const end=answerText.indexOf('\n\n---',start);assert(start>=0&&end>start);
  essayId=`tfs4-${year}-mdreview-model-essay`;data.references.push({id:essayId,kind:'model_essay',originalLabel:'Part VII · picture-version',text:plain(answerText.slice(start,end)),evidence:sliceEvidence(answers,start,end)});
  issue(writing,'WRITING_VERSION_CONFLICT','试卷主文为看图作文，脚注另列当年原题的十词命题；范文对应图片版本，不冒充脚注词表版本范文');
  note(writing,'主文与脚注两个任务版本并存；原脚注十词要求完整保留；范文只关联picture-version，不默认为唯一原题');
 }
 writing.answer.reason=year===2023?'所给答案MD没有作文范文；缺图另行阻断，不生成范文':'范文存为独立model_essay参考，非唯一标准答案；图片版和脚注原题版本存在冲突';
 const taskReview={dictation:{questionId:dict.id,referenceId:drid,automaticGrading:false},writing:{questionId:writing.id,pictureVersion:'blocked_missing_images',historicalWordListVersion:year===2023?null:'preserved_in_task_text',modelEssayReferenceId:essayId,modelEssayAppliesTo:essayId?'picture-version':null,automaticGrading:false}};
 for(const q of data.questions){
  const old=original.questions.find(x=>x.id===q.id);
  const shape=x=>({text:x.text,options:x.options,annotations:x.annotations,materialId:x.materialId,blankIndex:x.blankIndex,answer:x.answer});
  if(JSON.stringify(shape(old))!==JSON.stringify(shape(q)))data.corrections.push({id:'md-review-correction-'+data.corrections.length,questionId:q.id,before:JSON.stringify(shape(old)),after:JSON.stringify(shape(q)),reason:decisions.find(x=>x.questionId===q.id).notes.join('；')||'对照MD规范展示标记，补参考映射；原文和答案候选不覆盖',evidence:q.evidence});
  const n=Number(q.originalLabel);if(q.responseType==='choice'){
   assert.equal(q.options.length,n<=20?3:4);assert.equal(q.sectionId,n<=20?'II':n<=40?'III':n<=80?'IV':'VI');
   assert.equal(q.order,n<=80?n+1:n+21);
   if(n>=21&&n<=30)assert.equal(q.annotations.length,1,`${year}/${n} underline`);
  }
  const d=decisions.find(x=>x.questionId===q.id);d.openIssues=data.issues.filter(x=>x.questionId===q.id&&x.status==='open');d.status=d.openIssues.some(x=>x.severity==='blocking')?'reviewed_source_blocked':'MD_reviewed';
 }
 assert.equal(data.questions.length,122);assert.equal(new Set(data.questions.map(q=>q.order)).size,122);
 const validation=validateContent(data);assert(validation.valid,JSON.stringify(validation));assert.equal(validation.warnings.length,0,JSON.stringify(validation.warnings));
 const dir=path.join(outputRoot,String(year));fs.mkdirSync(dir);
 const payload=JSON.stringify(data,null,2);fs.writeFileSync(path.join(dir,'content-v4.json'),payload);fs.writeFileSync(path.join(dir,'validation.json'),JSON.stringify(validation,null,2));
 const ledger={year,method:'authored_MD_internal_review',reviewer:'Codex',pdfVisualReview:false,sourceCandidateSha256:hash(fs.readFileSync(inputFile)),outputSha256:hash(payload),paperVersion:data.paperVersion,sourceDocuments:data.documents.map(d=>({id:d.id,sha256:d.sha256,pages:d.pages.length})),allItemsReviewed:true,allItemsUsable:false,decisions,sectionReviews,materialReviews,verbMappings:mappings,tasks:taskReview,openIssues:data.issues.filter(x=>x.status==='open')};
 fs.writeFileSync(path.join(dir,'review-ledger.json'),JSON.stringify(ledger,null,2));
 summary.push({year,paperVersion:data.paperVersion,itemsReviewed:decisions.length,materialsReviewed:materialReviews.length,verbMappings:mappings.length,blockedItems:decisions.filter(d=>d.status==='reviewed_source_blocked').length,openIssues:ledger.openIssues.map(x=>({questionId:x.questionId,code:x.code,severity:x.severity})),outputSha256:ledger.outputSha256});
}
fs.writeFileSync(path.join(outputRoot,'manifest.json'),JSON.stringify({createdAt:new Date().toISOString(),scope:'S2-R01/R02 review pass with explicit source exceptions',pdfVisualReview:false,autoGradingAdopted:false,summary},null,2));
console.log(JSON.stringify(summary,null,2));
} finally {db.close();}
