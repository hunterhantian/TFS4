import {api} from './api.mjs';
import {escape as esc} from './ui.mjs';
import {mountWeekTimeline} from './learning-timeline.mjs';
export async function mountMastery(root,{run}){
 root.innerHTML='<section data-timeline></section><section class="learning-summary"><h2>知识点正确率</h2><p class="muted">按知识树第二层汇总作答次数；未作答及待核对不计入。原题重练也计入次数，知识点关联可能待核验。</p><div data-total></div><div data-results></div></section>';
 const results=root.querySelector('[data-results]'),total=root.querySelector('[data-total]');let selection,items=[],seq=0;
 const metric=x=>{const n=x.correct+x.wrong;return n?`${Math.round(x.correct*100/n)}%（${x.correct} 对 / ${n} 次）`:'暂无已判定作答';};
 function render(){const visible=items.filter(i=>(i.period.correct+i.period.wrong)>0),sum=visible.reduce((a,i)=>({correct:a.correct+i.period.correct,wrong:a.wrong+i.period.wrong}),{correct:0,wrong:0});total.innerHTML=`<p>所选时间整体正确率：<strong>${metric(sum)}</strong> · ${visible.length} 个规则族</p>`;results.innerHTML=visible.map(i=>`<article class="synthesis-card"><h3>${esc(i.name)}</h3><p class="muted">${esc(i.path.join(' › '))}${i.candidate?' · 知识点关联待核验':''}</p><p>所选时间：<strong>${metric(i.period)}</strong></p><p>最近 14 天：<strong>${metric(i.recent)}</strong></p></article>`).join('')||'<p>所选时间内没有可统计的知识点。</p>';}
 async function load(){const n=++seq,p=new URLSearchParams(selection);total.textContent='正在读取统计…';results.innerHTML='';const data=await api('GET','/learning/mastery?'+p);if(n!==seq)return;items=data.items;render();}
 selection=mountWeekTimeline(root.querySelector('[data-timeline]'),{title:'选择统计时间段',quick:true,all:true,initial:'last30',onChange:value=>{selection=value;run(load);}});await load();
}
