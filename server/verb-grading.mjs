// Preserve accents and grammatical punctuation; accept typographic apostrophes and spacing.
export function normalizeVerbAnswer(value){return String(value??'').normalize('NFC').replace(/[’‘ʼ]/g,"'").replace(/\s+/gu,' ').trim().toLocaleLowerCase('fr');}
export function gradeVerbAnswer(value,answer,{deferUnreviewed=false}={}){const input=normalizeVerbAnswer(value);if(!input)return 'unanswered';const accepted=[answer?.value,...(Array.isArray(answer?.accepted)?answer.accepted:[])].filter(v=>typeof v==='string'&&v.trim());if(!accepted.length)return 'manual';if(accepted.some(v=>normalizeVerbAnswer(v)===input))return 'correct';return deferUnreviewed&&answer?.inputReviewStatus!=='verified'?'manual':'wrong';}

// The user-reviewed fill-in grading model, frozen as v1.0.
export const fillGradingVersion='fill-grading-v1.0';
export function gradeFillV1(value,answer,{blankCount=1}={}){
 const input=normalizeVerbAnswer(value);if(!input)return 'unanswered';
 if(blankCount!==1)return 'manual';
 const forms=[answer?.value,...(Array.isArray(answer?.accepted)?answer.accepted:[])].filter(v=>typeof v==='string'&&v.trim());
 if(!forms.length)return 'manual';
 if(forms.some(v=>normalizeVerbAnswer(v)===input))return 'correct';
 const status=answer?.inputResolutionStatus??answer?.referenceSource?.inputResolutionStatus;
 return status==='previously-organized'?'wrong':'manual';
}
