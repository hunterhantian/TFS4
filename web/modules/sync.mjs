import {api} from './api.mjs';
export const deviceId=sessionStorage.getItem('rsz-device')||crypto.randomUUID();sessionStorage.setItem('rsz-device',deviceId);
const key=(owner,id)=>`rsz-draft-v1:${owner}:${id}:${deviceId}`;
export function readDraft(owner,id){try{return JSON.parse(localStorage.getItem(key(owner,id))||'null');}catch{return null;}}
export function listDrafts(owner){const result=[];for(let i=0;i<localStorage.length;i++){const storageKey=localStorage.key(i);if(!storageKey?.startsWith(`rsz-draft-v1:${owner}:`))continue;try{const raw=localStorage.getItem(storageKey),draft=JSON.parse(raw);if(draft?.dirty&&draft.progress&&Number.isInteger(draft.baseRevision))result.push({...draft,attemptId:storageKey.split(':')[2],storageKey,raw});}catch{}}return result;}
export function discardDraft(owner,id){localStorage.removeItem(key(owner,id));}
export class ExamSync{
 constructor(owner,attempt,{onStatus,onConflict,onSubmitted,onStorageError}){this.owner=owner;this.attempt=attempt;this.progress=structuredClone(attempt.progress);this.running=false;this.dirty=false;this.sequence=0;this.activeId=attempt.questions[this.progress.position]?.id;this.onStatus=onStatus;this.onConflict=onConflict;this.onSubmitted=onSubmitted;this.onStorageError=onStorageError;this.pendingAction=null;this.chain=Promise.resolve();this.frozen=false;this.submitRequestId=crypto.randomUUID();}
 persist(){try{localStorage.setItem(key(this.owner,this.attempt.id),JSON.stringify({baseRevision:this.attempt.revision,progress:this.progress,dirty:this.dirty,deviceId,pendingAction:this.pendingAction,submitRequestId:this.submitRequestId}));return true;}catch{this.running=false;this.frozen=true;this.onStorageError('本机缓存不可写，请导出待同步内容并处理存储空间；当前已停止计时');return false;}}
 change(){this.dirty=true;this.sequence++;this.persist();this.onStatus('尚未同步','pending');}
 advance(){const clock=performance.now();if(this.running){const ms=Math.max(0,Math.floor(clock-this.lastTick));this.lastTick+=ms;if(ms){this.progress.effectiveMs+=ms;const q=this.attempt.questions.find(q=>q.id===this.activeId);if(q?.materialId)this.progress.materialTimes[q.materialId]=(this.progress.materialTimes[q.materialId]||0)+ms;else if(q){let r=this.progress.answers.find(r=>r.questionId===q.id);if(!r){r={questionId:q.id,choice:null,confidence:null,effectiveMs:0};this.progress.answers.push(r);}r.effectiveMs=(r.effectiveMs||0)+ms;}this.change();}}else this.lastTick=clock;}
 start(){if(this.frozen)return;this.lastTick=performance.now();this.running=true;}
 stop(){this.advance();this.running=false;}
 select(questionId,field,value){if(this.frozen)return;this.advance();this.activeId=questionId;let r=this.progress.answers.find(r=>r.questionId===questionId);if(!r){r={questionId,choice:null,confidence:null,effectiveMs:null};this.progress.answers.push(r);}r[field]=value;this.change();clearTimeout(this.debounce);this.debounce=setTimeout(()=>this.flush().catch(()=>{}),400);}
 focus(id){if(this.frozen)return;this.advance();this.activeId=id;this.progress.position=this.attempt.questions.findIndex(q=>q.id===id);this.change();}
 body(){return {expectedRevision:this.attempt.revision,deviceId,...structuredClone(this.progress)};}
 flush(action='progress'){
  if(action==='pause'||action==='submit'){this.stop();this.pendingAction=action;this.change();}
  const perform=async()=>{
   if(this.frozen)throw Error('当前修改已保护，请先解决同步冲突');
   if(this.attempt.status==='submitted')return;
   this.advance();const desired=this.pendingAction||action;if(!this.dirty&&desired==='progress')return;if(desired!=='progress')this.stop();
   const sequence=this.sequence;const payload=this.body();if(desired==='submit'){payload.requestId=this.submitRequestId;payload.confirmIncomplete=true;}
   this.persist();this.onStatus('正在同步…','saving');
   try{
    const result=await api(desired==='progress'?'PATCH':'POST',`/attempts/${this.attempt.id}/${desired}`,payload);
    if(desired==='submit'){if(this.sourceCache&&localStorage.getItem(this.sourceCache.key)===this.sourceCache.raw)localStorage.removeItem(this.sourceCache.key);this.sourceCache=null;this.attempt.status='submitted';this.dirty=false;discardDraft(this.owner,this.attempt.id);this.onSubmitted(result.reportId);return result;}
    this.attempt.revision=result.revision;this.attempt.status=result.status;this.attempt.leaseExpiresAt=result.leaseExpiresAt;this.pendingAction=null;this.dirty=this.sequence!==sequence;
    if(this.sourceCache&&localStorage.getItem(this.sourceCache.key)===this.sourceCache.raw){localStorage.removeItem(this.sourceCache.key);this.sourceCache=null;}
    if(!this.dirty){discardDraft(this.owner,this.attempt.id);this.onStatus(desired==='pause'?'已暂停，已保存到服务器':'已同步','synced');}else{this.persist();this.onStatus('尚有修改等待同步','pending');}return result;
   }catch(e){this.persist();this.onStatus(e.message,'error');if(e.status===409||e.status===401){this.stop();this.frozen=true;}this.onConflict(e);throw e;}
  };
  this.chain=this.chain.catch(()=>{}).then(perform);return this.chain;
 }
 restore(draft,{rebase=false}={}){if(!rebase)this.attempt.revision=draft.baseRevision;if(draft.storageKey)this.sourceCache={key:draft.storageKey,raw:draft.raw};this.progress=structuredClone(draft.progress);this.dirty=true;this.pendingAction=draft.pendingAction;this.submitRequestId=draft.submitRequestId||this.submitRequestId;this.sequence++;this.persist();}
 destroy(){this.stop();clearTimeout(this.debounce);this.frozen=true;}
}
