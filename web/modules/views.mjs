import {escape,duration,confidence,percent,date} from './ui.mjs';
const $=s=>document.querySelector(s);
export const moduleLabels={listening:'听力 · Compréhension orale',vocabulary:'词汇 · Compétence lexicale',grammar:'语法 · Compétence grammaticale',reading:'阅读 · Compréhension écrite'};
const partLabels={II:moduleLabels.listening,III:moduleLabels.vocabulary,IV:moduleLabels.grammar,VI:moduleLabels.reading};
const ranges=[[1,10],[11,20],[21,30],[31,40],[41,50],[51,60],[61,70],[71,80],[81,85],[86,90],[91,95],[96,100]];
export const groupsFor=questions=>ranges.map(([from,to])=>questions.filter(q=>q.originalNo>=from&&q.originalNo<=to)).filter(q=>q.length);
export function renderExam(sync){
 const groups=groupsFor(sync.attempt.questions);const current=sync.attempt.questions[sync.progress.position];let page=groups.findIndex(group=>group.some(q=>q.id===current?.id));if(page<0)page=0;const group=groups[page];
 $('#page-title').textContent=`第 ${group[0].originalNo}–${group.at(-1).originalNo} 题`;$('#group-name').textContent=moduleLabels[group[0].component];
 $('#total-count').textContent=sync.attempt.questions.length;
 $('#page-dots').innerHTML=groups.map((rows,i)=>`<button data-page="${i}" aria-current="${page===i?'page':'false'}" aria-label="${escape(moduleLabels[rows[0].component])}，第${rows[0].originalNo}到${rows.at(-1).originalNo}题" class="${page===i?'active':''}">${i+1}</button>`).join('');
 const material=sync.attempt.materials.find(m=>m.id===group[0].materialId);const listening=group[0].component==='listening';$('#listening-player').hidden=!listening;if(!listening)$('#listening-audio').pause();
 const passage=material&&!material.audioUrl?`<article class="reading"><div class="reading-copy">${material.text.split(/\n{2,}/).map((p,i)=>i?`<p>${escape(p)}</p>`:`<h3>${escape(p)}</h3>`).join('')}</div></article>`:'';
 $('#questions').innerHTML=passage+group.map(q=>`<article class="question" data-no="${q.originalNo}" data-question-id="${q.id}"><div class="q-top"><span class="q-no">${q.originalNo}</span><button class="focus-question" data-focus="${q.id}">设为当前题</button></div><h3>${escape(q.text)}</h3><div class="option-list">${Object.entries(q.options).map(([letter,text])=>`<button class="option" data-choice="${letter}"><b>${letter}</b><span>${escape(text)}</span></button>`).join('')}</div><div class="confidence"><span>这题把握：</span>${[['certain','🟢 肯定'],['hesitant','🟡 犹豫'],['guess','🔴 猜测']].map(([id,label])=>`<button data-confidence="${id}">${label}</button>`).join('')}</div></article>`).join('');
 const navigate=i=>{sync.focus(groups[i][0].id);renderExam(sync);window.scrollTo(0,0);};
 $('#page-dots').querySelectorAll('button').forEach(b=>b.onclick=()=>navigate(Number(b.dataset.page)));
 $('#prev').disabled=page===0;$('#next').disabled=page===groups.length-1;$('#prev').onclick=()=>navigate(page-1);$('#next').onclick=()=>navigate(page+1);
 $('#questions').querySelectorAll('[data-focus]').forEach(b=>b.onclick=()=>{sync.focus(b.dataset.focus);updateExam(sync);});
 $('#questions').querySelectorAll('[data-choice],[data-confidence]').forEach(b=>b.onclick=()=>{const id=b.closest('[data-question-id]').dataset.questionId;sync.select(id,b.dataset.choice?'choice':'confidence',b.dataset.choice||b.dataset.confidence);updateExam(sync);});
 updateExam(sync);
}
export function updateExam(sync){
 $('#clock').textContent=duration(sync.progress.effectiveMs);$('#answered-count').textContent=sync.progress.answers.filter(a=>a.choice).length;
 $('#questions').querySelectorAll('[data-question-id]').forEach(card=>{const id=card.dataset.questionId;const response=sync.progress.answers.find(a=>a.questionId===id);card.classList.toggle('current-question',id===sync.activeId);card.querySelector('[data-focus]').textContent=id===sync.activeId?'正在作答':'设为当前题';for(const b of card.querySelectorAll('[data-choice]')){b.classList.toggle('selected',response?.choice===b.dataset.choice);b.setAttribute('aria-pressed',String(response?.choice===b.dataset.choice));b.disabled=sync.frozen||!sync.running;}for(const b of card.querySelectorAll('[data-confidence]')){b.classList.toggle('selected',response?.confidence===b.dataset.confidence);b.setAttribute('aria-pressed',String(response?.confidence===b.dataset.confidence));b.disabled=sync.frozen||!sync.running;}});
}
export function renderReport(r){
 $('#report-title').value=r.title;
 const summary=s=>`答对 ${s.correct}/${s.total} · 全卷正确率 ${percent(s.totalAccuracy)} · 已答 ${s.answered} 题，正确率 ${percent(s.answeredAccuracy)} · 未答 ${s.unanswered} 题`;
 const question=i=>`<details class="report-question ${i.result}" data-report-no="${i.question.originalNo}"><summary>第${i.question.originalNo}题 · ${{correct:'✓ 正确',wrong:'× 错误',unanswered:'未作答'}[i.result]} · 你的答案 ${escape(i.choice||'未答')} · 正确答案 ${escape(i.question.answer.value)} · ${confidence(i.confidence)} · ${duration(i.effectiveMs)}</summary><h3>${escape(i.question.text)}</h3>${Object.entries(i.question.options).map(([k,t])=>`<p class="answer-option">${k}. ${escape(t)}</p>`).join('')}${i.question.materialId?`<p>材料用时 ${duration(r.materialTimes[i.question.materialId]??null)}，未分摊到单题。</p>`:''}<p class="muted">题目版本 ${i.question.version} / 答案版本 ${i.question.answer.version}；官方解析尚未整理。</p></details>`;
 const sections=r.parts.map(p=>{
  const items=r.items.filter(i=>i.question.formalPart===p.part);
  return `<details class="report-part" data-part="${escape(p.part)}" open><summary class="report-part-header"><div><span class="part-number">Part ${escape(p.part)}</span><h2>${escape(partLabels[p.part]||p.part)}</h2><p>第 ${items[0]?.question.originalNo}–${items.at(-1)?.question.originalNo} 题 · ${p.total}题</p></div><strong>${p.correct}/${p.total}<small>答对</small></strong></summary><div class="report-part-body"><p class="part-summary">${summary(p)}</p>${items.map(question).join('')}</div></details>`;
 }).join('');
 $('#report-content').innerHTML=`<div class="report-overview"><p class="report-stat">${summary(r.stats)}</p><p>有效用时 ${duration(r.effectiveMs)} · 开始 ${date(r.startedAt)} · 交卷 ${date(r.submittedAt)}</p><p class="muted">答案口径：${escape(r.answerKeyVersion)} · ${r.origin==='legacy'?'旧存档导入':'普通测试'}</p>${r.legacy?`<p>原始记录总分：${r.legacy.originalScore??'未记录'}；按旧记录口径复算：${r.legacy.calculatedScore}。${r.legacy.warnings.map(escape).join('；')}</p>`:''}<details><summary>材料题组用时</summary>${r.materials.map(m=>`<p>${escape(m.id)}：${duration(r.materialTimes[m.id]??null)}</p>`).join('')}</details></div>${sections}`;
}
