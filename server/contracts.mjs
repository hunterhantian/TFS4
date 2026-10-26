export const origins=Object.freeze(['ordinary','original_retry','related_training','delayed_mini']);
export function validateProgress(input,questionIds){
 if(!Number.isInteger(input.expectedRevision)||input.expectedRevision<0||typeof input.deviceId!=='string'||!input.deviceId.trim()||!Array.isArray(input.answers))throw Error('INVALID_PROGRESS');
 const seen=new Set();
 for(const a of input.answers){if(!questionIds.includes(a.questionId)||seen.has(a.questionId)||![null,'A','B','C','D'].includes(a.choice)||![null,'certain','hesitant','guess'].includes(a.confidence)||(a.effectiveMs!==null&&(!Number.isSafeInteger(a.effectiveMs)||a.effectiveMs<0)))throw Error('INVALID_RESPONSE');seen.add(a.questionId);}
 return true;
}
export function publicQuestion(q){return {id:q.id,version:q.version,originalNo:q.originalNo,text:q.text,options:q.options,materialId:q.materialId};}
export function assertPublishable(batch){if(batch.dataset!=='production'||batch.reviewStatus!=='approved')throw Error('UNREVIEWED_DATASET');}
