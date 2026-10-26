import {escape} from './ui.mjs';
export function archiveDateParts(value){
 if(!value||!Number.isFinite(new Date(value).getTime()))return {day:'未记录',time:'未记录'};
 const parts=Object.fromEntries(new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(value)).map(p=>[p.type,p.value]));
 return {day:`${parts.year}-${parts.month}-${parts.day}`,time:`${parts.hour}:${parts.minute}:${parts.second}`};
}
export function renderArchiveCards(reports){
 if(!reports.length)return '<p>当前筛选条件下暂无存档。</p>';
 return reports.map(r=>{
  const stamp=archiveDateParts(r.submittedAt);const total=r.stats?.total,answered=r.stats?.answered;
  const completion=Number.isInteger(total)&&total>0&&Number.isInteger(answered)?`已答 ${answered}/${total} · ${Math.round(answered/total*100)}%`:'未记录';
  const type=r.mode==='full'?'完整真题':'未记录';
  return `<article class="report-card archive-card" aria-label="${escape(r.title)}"><header class="archive-card-header"><h2 class="archive-theme" title="${escape(r.title)}">${escape(r.theme||r.title)}</h2>${r.ownerUsername?`<span class="archive-owner">考生：${escape(r.ownerUsername)}</span>`:''}</header>${r.customTitle?`<p class="archive-custom-name">${escape(r.customTitle)}</p>`:''}<dl class="archive-fields"><div class="archive-field archive-date"><dt>日期</dt><dd>${escape(stamp.day)}</dd></div><div class="archive-field archive-time"><dt>时间</dt><dd>${escape(stamp.time)}</dd></div><div class="archive-field archive-completion"><dt>完成度</dt><dd>${escape(completion)}</dd></div><div class="archive-field archive-type"><dt>考试类型</dt><dd>${type}</dd></div></dl><footer class="archive-card-footer"><span class="archive-score">答对 ${r.stats.correct}/${r.stats.total}${r.origin==='legacy'?' · 导入记录':''}</span><button class="secondary" data-report="${r.id}">查看报告</button></footer></article>`;
 }).join('');
}
