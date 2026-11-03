import {escape as esc} from './ui.mjs';
const DAY=86400000;
const iso=ms=>new Date(ms).toISOString().slice(0,10);
const ms=value=>Date.parse(value+'T00:00:00Z');
export const shanghaiToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function weekFor(day){const time=ms(day),weekday=new Date(time).getUTCDay(),start=time-((weekday+6)%7)*DAY;return {from:iso(start),to:iso(start+6*DAY)};}
export function monthPeriod(month){const [year,number]=month.split('-').map(Number);return {from:month+'-01',to:iso(Date.UTC(year,number,0))};}
export function weeksInMonth(month){const [year,number]=month.split('-').map(Number),start=weekFor(month+'-01').from,end=iso(Date.UTC(year,number,0));const weeks=[];for(let time=ms(start);iso(time)<=end;time+=7*DAY)weeks.push({from:iso(time),to:iso(time+6*DAY)});return weeks;}
export function mountWeekTimeline(root,{title='选择时间段',quick=false,all=false,initial='week',onChange}){
 const today=shanghaiToday();let selection=initial==='week'?{...weekFor(today),range:'custom'}:{range:initial};
 root.className='learning-timeline date-range-picker';root.setAttribute('aria-label',title);
 root.innerHTML=`<div class="learning-timeline-heading"><h2>${esc(title)}</h2>${all?'<button type="button" class="secondary" data-all>全部时间</button>':''}</div>${quick?'<div class="learning-quick" aria-label="快捷时间筛选"><button type="button" data-quick="last7">最近 7 天</button><button type="button" data-quick="last14">最近 14 天</button><button type="button" data-quick="last30">最近 30 天</button></div>':''}<p class="learning-period" data-period aria-live="polite"></p><form class="date-range-form"><label>开始日期<input name="from" type="date" required></label><label>结束日期<input name="to" type="date" required></label><button type="submit" class="primary">查看这段时间</button><p class="date-range-error" role="alert"></p></form><p class="muted">包含开始和结束当天。</p>`;
 const period=root.querySelector('[data-period]'),form=root.querySelector('form'),from=form.elements.from,to=form.elements.to,error=form.querySelector('[role=alert]');from.value=selection.from||today;to.value=selection.to||today;
 function render(){const descriptions={all:'全部时间',last7:'最近 7 天',last14:'最近 14 天',last30:'最近 30 天'};period.textContent='当前范围：'+(selection.range==='custom'?`${selection.from} 至 ${selection.to}`:descriptions[selection.range]);root.querySelectorAll('[data-quick]').forEach(b=>b.setAttribute('aria-pressed',String(selection.range===b.dataset.quick)));const button=root.querySelector('[data-all]');if(button)button.setAttribute('aria-pressed',String(selection.range==='all'));}
 form.onsubmit=e=>{e.preventDefault();if(!from.value||!to.value||from.value>to.value){error.textContent='开始日期不能晚于结束日期。';return;}error.textContent='';selection={range:'custom',from:from.value,to:to.value};render();onChange({...selection});};
 root.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{error.textContent='';selection={range:b.dataset.quick};render();onChange({...selection});});if(all)root.querySelector('[data-all]').onclick=()=>{error.textContent='';selection={range:'all'};render();onChange({...selection});};render();return {...selection};
}
