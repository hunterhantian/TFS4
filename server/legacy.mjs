import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {token,fail,exact,string,integer} from './security.mjs';
import {makeReport,archiveTitle} from './domain.mjs';
const digest=x=>createHash('sha256').update(x).digest('hex');
const confidenceMap={'肯定':'certain','犹豫':'hesitant','猜测':'guess',certain:'certain',hesitant:'hesitant',guess:'guess'};
function normalize(record,snapshot){
 if(!record||typeof record!=='object'||Array.isArray(record))fail(400,'INVALID_LEGACY_RECORD');
 const choices=record.answers;if(!choices||typeof choices!=='object'||Array.isArray(choices))fail(400,'INVALID_LEGACY_ANSWERS');
 const answers=[];const warnings=[];if(record.duration==null)warnings.push('缺失总用时，保留未记录');
 for(const [key,r] of Object.entries(choices)){
  if(!/^([1-9]\d?|100)$/.test(key)||!r||typeof r!=='object')fail(400,'INVALID_LEGACY_ANSWERS');const q=snapshot.questions[Number(key)-1];
  const choice=r.choice??null;if(choice!==null&&!Object.hasOwn(q.options,choice))fail(400,'INVALID_LEGACY_CHOICE');
  const confidence=r.confidence==null?null:confidenceMap[r.confidence];if(confidence===undefined)fail(400,'INVALID_LEGACY_CONFIDENCE');
  let ms=null;if(record.questionTimes?.[key]!=null){integer(record.questionTimes[key],0,2592000);ms=record.questionTimes[key]*1000;}
  answers.push({questionId:q.id,choice,confidence,effectiveMs:ms});
 }
 answers.sort((a,b)=>a.questionId.localeCompare(b.questionId));
 let submittedAt=null;if(record.submittedAt!=null){const d=new Date(record.submittedAt);if(!Number.isFinite(d.getTime()))fail(400,'INVALID_LEGACY_DATE');submittedAt=d.toISOString();}else warnings.push('缺失交卷时间，保留未记录');
 let effectiveMs=null;if(record.duration!=null){integer(record.duration,0,2592000);effectiveMs=record.duration*1000;}
 let originalScore=null;if(record.score!=null){integer(record.score,0,100);originalScore=record.score;}
 const key={};if(record.answerKey){exact(record.answerKey,snapshot.questions.map(q=>String(q.originalNo)));for(const [no,value] of Object.entries(record.answerKey)){if(!['A','B','C','D'].includes(value))fail(400,'INVALID_LEGACY_KEY');key[no]=value;}}
 else for(const q of snapshot.questions)key[q.originalNo]=record.answerKeyVersion===snapshot.answerKeyVersion?q.answer.value:({61:'D',62:'D'}[q.originalNo]||q.answer.value);
 if(record.answerKeyVersion&&record.answerKeyVersion!==snapshot.answerKeyVersion&&!record.answerKey)fail(400,'UNKNOWN_LEGACY_KEY');
 const calculatedScore=answers.filter(r=>r.choice===key[snapshot.questions.find(q=>q.id===r.questionId).originalNo]).length;
 if(originalScore!==null&&originalScore!==calculatedScore)warnings.push('原始总分与可复算成绩不一致，分别保留');
 if(!record.answerKey&&!record.answerKeyVersion)warnings.push('按已知旧原型工作答案（61/62=D）还原，不按新参考答案重评分');
 return {submittedAt,effectiveMs,answers,answerKey:key,answerKeyVersion:record.answerKeyVersion||(record.answerKey?'legacy-snapshot-key':'legacy-working-key-v1'),originalScore,calculatedScore,warnings};
}
export function registerLegacy(app,{db,backupDir,now}){
 app.post('/api/legacy-import/preview',async req=>{
  exact(req.body,['raw']);string(req.body.raw,1,700000);let parsed;try{parsed=JSON.parse(req.body.raw);}catch{fail(400,'INVALID_JSON');}
  const records=Array.isArray(parsed)?parsed:parsed?.records;if(!Array.isArray(records)||records.length<1||records.length>200)fail(400,'INVALID_LEGACY_FILE','应为1–200份旧原型存档的JSON数组');
  const source=db.prepare('SELECT payload,revision FROM sources WHERE id=?').get('tfs4-2025');if(!source)fail(422,'SOURCE_UNAVAILABLE');const snapshot={...JSON.parse(source.payload),sourceRevision:source.revision};
  const normalized=records.map(r=>normalize(r,snapshot));const fileHash=digest(req.body.raw);const backup=path.join(backupDir,`legacy-${req.account.id}-${fileHash}.json`);
  try{fs.writeFileSync(backup,req.body.raw,{flag:'wx',mode:0o600});}catch(e){if(e.code!=='EEXIST')throw e;if(digest(fs.readFileSync(backup))!==fileHash)throw Error('Legacy backup integrity failure');}
  const seen=new Set();const rows=normalized.map((r,index)=>{const hash=digest(JSON.stringify(r));const duplicate=seen.has(hash)||!!db.prepare('SELECT id FROM reports WHERE owner_id=? AND legacy_hash=?').get(req.account.id,hash);seen.add(hash);return {index,hash,record:r,duplicate};});
  const previewId=token();db.prepare('DELETE FROM legacy_previews WHERE created_at<?').run(now()-3600000);
  db.prepare('INSERT INTO legacy_previews VALUES (?,?,?,?,?,?)').run(previewId,req.account.id,fileHash,backup,JSON.stringify({snapshot,rows}),now());
  return {previewId,fileHash,backupSaved:true,records:rows.map(r=>({index:r.index,duplicate:r.duplicate,submittedAt:r.record.submittedAt,answered:r.record.answers.filter(a=>a.choice).length,originalScore:r.record.originalScore,calculatedScore:r.record.calculatedScore,effectiveMs:r.record.effectiveMs,warnings:r.record.warnings}))};
 });
 app.post('/api/legacy-import/confirm',async req=>{
  exact(req.body,['previewId','indexes','acknowledgeWarnings']);string(req.body.previewId);if(!Array.isArray(req.body.indexes)||req.body.indexes.length<1||req.body.indexes.length>200||new Set(req.body.indexes).size!==req.body.indexes.length)fail(400,'INVALID_SELECTION');
  return db.transaction(()=>{
   const preview=db.prepare('SELECT * FROM legacy_previews WHERE id=? AND owner_id=? AND created_at>?').get(req.body.previewId,req.account.id,now()-3600000);if(!preview)fail(404,'PREVIEW_EXPIRED');
   if(!fs.existsSync(preview.backup_path)||digest(fs.readFileSync(preview.backup_path))!==preview.file_hash)fail(409,'BACKUP_MISSING');
   const {snapshot,rows}=JSON.parse(preview.payload);const selected=req.body.indexes.map(index=>{integer(index,0,rows.length-1);return rows[index];});
   if(selected.some(r=>r.record.warnings.length)&&req.body.acknowledgeWarnings!==true)fail(400,'ACKNOWLEDGE_WARNINGS');
   const reports=[];let skipped=0;
   for(const row of selected){
    const previous=db.prepare('SELECT id FROM reports WHERE owner_id=? AND legacy_hash=?').get(req.account.id,row.hash);if(previous){reports.push(previous.id);skipped++;continue;}
    const r=row.record,id=token(),attemptId=token(),date=new Date(now()).toISOString();const frozen={...snapshot,answerKeyVersion:r.answerKeyVersion,questions:snapshot.questions.map(q=>({...q,answer:{...q.answer,value:r.answerKey[q.originalNo],version:r.answerKey[q.originalNo]===q.answer.value?q.answer.version:1,status:'legacy_record',source:'legacy-record-key'}}))};
    const progress={answers:r.answers,position:0,effectiveMs:r.effectiveMs,materialTimes:{}};
    db.prepare('INSERT INTO attempts(id,owner_id,request_id,mode,origin,status,created_at,started_at,submitted_at,snapshot,progress) VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(attemptId,req.account.id,`legacy-${row.hash}`,'full','legacy','submitted',date,date,r.submittedAt,JSON.stringify(frozen),JSON.stringify(progress));
    const report=makeReport({id:attemptId,snapshot:frozen,progress,origin:'legacy',created_at:null,started_at:null,submitted_at:r.submittedAt});report.legacy={fileHash:preview.file_hash,recordHash:row.hash,originalScore:r.originalScore,calculatedScore:r.calculatedScore,warnings:r.warnings,importedAt:date,questionSnapshotOrigin:'current_text_with_legacy_answer_key',timingOrigin:'legacy_approximate_or_missing',analysisEligibility:'requires_D39_review'};
    db.prepare('INSERT INTO reports VALUES (?,?,?,?,?,?,?)').run(id,attemptId,req.account.id,archiveTitle(snapshot.title,r.submittedAt),JSON.stringify(report),date,row.hash);reports.push(id);
   }
   return {reportIds:reports,imported:reports.length-skipped,skipped};
  })();
 });
}
