import {fail,exact,integer,string} from './security.mjs';
export const nowIso=()=>new Date().toISOString();
export function decodeAttempt(row){return {...row,snapshot:JSON.parse(row.snapshot),progress:JSON.parse(row.progress)};}
export function ownedAttempt(db,id,owner){const r=db.prepare('SELECT * FROM attempts WHERE id=? AND owner_id=?').get(id,owner);if(!r)fail(404,'NOT_FOUND');return decodeAttempt(r);}
export function visibleAttempt(a){return {id:a.id,mode:a.mode,status:a.status,revision:a.revision,createdAt:a.created_at,startedAt:a.started_at,leaseDeviceId:a.lease_device,leaseExpiresAt:a.lease_until,progress:a.progress,questions:a.snapshot.questions.map(q=>({id:q.id,version:q.version,originalNo:q.originalNo,text:q.text,options:q.options,materialId:q.materialId,component:q.component,formalPart:q.formalPart})),materials:a.snapshot.materials.map(m=>({id:m.id,version:m.version,text:m.text,...(m.audioUrl?{audioUrl:m.audioUrl}:{})}))};}
export function checkLease(a,body,now){integer(body.expectedRevision);string(body.deviceId,1,128);if(a.status==='submitted')fail(409,'ALREADY_SUBMITTED');if(body.expectedRevision!==a.revision)fail(409,'REVISION_CONFLICT','进度已更新，请保留本地待同步内容并重新读取');if(a.status!=='active'||a.lease_device!==body.deviceId||a.lease_until<=now)fail(409,'LEASE_CONFLICT','本考试需要恢复或明确接管');}
export function checkedProgress(a,body){
 integer(body.effectiveMs);if(body.effectiveMs<a.progress.effectiveMs)fail(400,'TIME_REGRESSION');
 integer(body.position,0,a.snapshot.questions.length-1);
 if(!Array.isArray(body.answers)||body.answers.length>100)fail(400,'INVALID_ANSWERS');
 const seen=new Set();const old=new Map(a.progress.answers.map(r=>[r.questionId,r]));
 const answers=body.answers.map(r=>{
  exact(r,['questionId','choice','confidence','effectiveMs']);const q=a.snapshot.questions.find(q=>q.id===r.questionId);
  if(!q||seen.has(r.questionId)||(r.choice!==null&&(typeof r.choice!=='string'||!Object.hasOwn(q.options,r.choice)))||![null,'certain','hesitant','guess'].includes(r.confidence))fail(400,'INVALID_ANSWERS');seen.add(r.questionId);
  if(r.effectiveMs!==null)integer(r.effectiveMs);if(q.materialId&&r.effectiveMs!==null&&!['automatic-answer-interval-v1','mixed-explicit-and-automatic-v1'].includes(body.timingMode))fail(400,'MATERIAL_TIME_REQUIRED');
  if(old.get(r.questionId)?.effectiveMs!=null&&(r.effectiveMs===null||r.effectiveMs<old.get(r.questionId).effectiveMs))fail(400,'TIME_REGRESSION');return {...r};
 });
 if([...old.keys()].some(id=>!seen.has(id)))fail(400,'MISSING_PREVIOUS_RESPONSE');
 exact(body.materialTimes,Object.keys(body.materialTimes||{}),[]);if(Object.keys(body.materialTimes).some(id=>!a.snapshot.materials.some(m=>m.id===id)))fail(400,'INVALID_MATERIAL');
 for(const [id,value] of Object.entries(body.materialTimes)){integer(value);if(value<(a.progress.materialTimes[id]||0))fail(400,'TIME_REGRESSION');}
 if(Object.keys(a.progress.materialTimes).some(id=>!(id in body.materialTimes)))fail(400,'MISSING_PREVIOUS_TIME');
 let pendingTiming=null;
 if(body.pendingTiming!=null){if(!['automatic-answer-interval-v1','mixed-explicit-and-automatic-v1'].includes(body.timingMode))fail(400,'INVALID_PENDING_TIME');exact(body.pendingTiming,['questionId','ms']);const q=a.snapshot.questions.find(q=>q.id===body.pendingTiming.questionId);if(!q)fail(400,'INVALID_PENDING_TIME');integer(body.pendingTiming.ms);if(body.pendingTiming.ms>body.effectiveMs)fail(400,'INVALID_PENDING_TIME');pendingTiming={...body.pendingTiming};}
 const timingMode=body.timingMode||a.progress.timingMode||'explicit_focus_v1';if(!['explicit_focus_v1','automatic-answer-interval-v1','mixed-explicit-and-automatic-v1'].includes(timingMode))fail(400,'INVALID_TIMING_MODE');
 return {answers,position:body.position,effectiveMs:body.effectiveMs,materialTimes:{...body.materialTimes},pendingTiming,timingMode};
}
export function settlePending(progress){
 const pending=progress.pendingTiming;if(pending?.ms>0){let r=progress.answers.find(r=>r.questionId===pending.questionId);if(!r){r={questionId:pending.questionId,choice:null,confidence:null,effectiveMs:0};progress.answers.push(r);}r.effectiveMs=(r.effectiveMs||0)+pending.ms;}progress.pendingTiming=null;return progress;
}
export function archiveTitle(theme,submittedAt){
 const time=submittedAt?new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(submittedAt)):'提交时间未记录';return `${theme} · ${time}`;
}
export function makeReport(a){
 const responses=new Map(a.progress.answers.map(r=>[r.questionId,r]));const items=a.snapshot.questions.map(q=>{const r=responses.get(q.id);return {question:q,choice:r?.choice??null,confidence:r?.confidence??null,effectiveMs:r?.effectiveMs??null,result:!r?.choice?'unanswered':r.choice===q.answer.value?'correct':'wrong'};});
 const stats=rows=>{const total=rows.length,answered=rows.filter(x=>x.choice).length,correct=rows.filter(x=>x.result==='correct').length;return {total,answered,correct,unanswered:total-answered,totalAccuracy:total?correct/total:null,answeredAccuracy:answered?correct/answered:null};};
 return {version:1,mode:a.mode||'full',sourceTitle:a.snapshot.title,timingMode:a.progress.timingMode||'explicit_focus_v1',attemptId:a.id,origin:a.origin,createdAt:a.created_at,startedAt:a.started_at,submittedAt:a.submitted_at,sourceId:a.snapshot.id,sourceRevision:a.snapshot.sourceRevision,answerKeyVersion:a.snapshot.answerKeyVersion,effectiveMs:a.progress.effectiveMs,materialTimes:a.progress.materialTimes,materials:a.snapshot.materials,items,stats:stats(items),parts:[...new Set(items.map(i=>i.question.formalPart))].map(part=>({part,...stats(items.filter(i=>i.question.formalPart===part))}))};
}
