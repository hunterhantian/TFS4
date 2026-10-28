import {escape} from './ui.mjs';
export const questionLabel=q=>q.originalLabel||`第${q.originalNo}题`;
export const answerLabel=q=>q.gradingMode==='manual'?'已有参考内容（人工评阅）':'指定参考答案';
export const answerValue=q=>q.answer.status==='unusable_reference'?'参考资料无法对应本卷选项，暂不判分':q.answer.status==='conflicting_reference'?'参考来源冲突，暂不判分':q.answer.value??'待补参考答案（不用于正式判分）';
export const answerAlternatives=q=>(q.answer.alternatives||[]).map(a=>`<p class="bank-warning">参考来源 ${escape(a.evidence.documentId)}：${escape(a.value)} · ${escape(a.evidence.location)}</p>`).join('');
export function questionText(q){
 const chars=Array.from(q.text),ranges=[...(q.annotations||[])].sort((a,b)=>a.start-b.start);let pos=0,html='';
 for(const r of ranges){if(r.kind!=='underline'||r.start<pos||r.end>chars.length)continue;html+=escape(chars.slice(pos,r.start).join(''))+'<u>'+escape(chars.slice(r.start,r.end).join(''))+'</u>';pos=r.end;}
 return html+escape(chars.slice(pos).join(''))+(q.illustrations||[]).map(a=>`<img class="bank-task-illustration" style="display:block;max-width:100%;height:auto" src="${escape(a.imageDataUrl)}" alt="${escape(a.caption)}">`).join('');
}
