import {escape as esc} from './ui.mjs';
const root='/admin/stage2';
// Teaching notes for the known real pilot examples; separate from saved classification evidence.
const teaching={
 'tfs4-2012-q045':{quote:'tes affaires',reason:'affaires是阴性复数。后面的主有代词也要替代阴性复数事物；m’occuper承接de，所以来源候选是des miennes。'},
 'tfs4-2013-q051':{quote:'des clés',reason:'clés是阴性复数。perdu后面的主有代词作直接宾语，不需要de；来源候选是les siennes。与affaires那题共享性数和主有代词规则，介词条件不同。'},
 'tfs4-2013-q061':{quote:'Mon appareil photo',reason:'appareil photo是阳性单数，被替代事物决定用阳性单数主有代词；来源候选是le tien。匹配的是代词如何随被替代事物配合，而不是两句出现了同一个名词。'},
 'tfs4-2012-q041':{quote:'de ces deux robes',reason:'问的是两条裙子中的哪一条：被选择的一条robe是阴性单数。这里需要能独立替代名词的疑问代词，来源候选是Laquelle。'},
 'tfs4-2013-q045':{quote:'de ces deux cravates',reason:'问的是两条领带中的哪一条：被选择的一条cravate是阴性单数。与robes那题使用同一疑问代词规则，来源候选也是Laquelle。'},
 'tfs4-2012-q059':{quote:"On n'est jamais",reason:'On在这里泛指人，不特指某个他或某个我们；重读反身指代采用soi，来源候选是soi-même。'},
 'tfs4-2013-q056':{quote:'chacun',reason:'chacun是泛指主语，chez后需要与它对应的重读反身代词，来源候选是soi；与on那题共享泛指反身指代规则。'},
 'tfs4-2012-q062':{quote:'7 euros',reason:'按每公斤报价的名词计价表达是7 euros le kilo。它与à l’heure的工资表达共享单位计价知识点，但不能把两种句式的介词或冠词机械互换。'},
 'tfs4-2013-q060':{quote:'elle est payée',reason:'工资按小时计算使用être payée à l’heure。它与le kilo的价格表达共享单位计价知识点，具体形式由本句结构决定。'}
};
function teachingFor(q){const t=teaching[q.id];return t&&q.text.includes(t.quote)?t:null;}
function stem(q){const t=teachingFor(q);if(!t)return esc(q.text);const i=q.text.indexOf(t.quote);return esc(q.text.slice(0,i))+'<mark>'+esc(t.quote)+'</mark>'+esc(q.text.slice(i+t.quote.length));}
export async function renderMatchingDemo({body,api,run,isCurrent=()=>true}){
 let epoch=0;
 const demo=await api('GET',root+'/matching-demo');
 if(!isCurrent())return;
 const label=x=>`${x.year} · 第${x.label}题 · ${x.primaryName}（${x.relatedCount}道同类题）`;
 const options=demo.items.map(x=>`<option value="${esc(x.versionId)}">${esc(label(x))}</option>`).join('');
 body.innerHTML=`<div class="match-demo"><p class="match-eyebrow">相同题型 · 同知识点</p><h2>两道题，为什么能匹配？</h2><p>${esc(demo.principle)}</p><ol class="match-flow"><li>读题并分析实际考点</li><li>保存依据，独立轮次复核</li><li>核验题型与主知识点</li><li>返回其他题和完整材料</li></ol><p class="bank-warning">当前${demo.count}题可检索。这是本机小样本体验，正式匹配质量尚未验收。先前351项内容审核通过，不等于已经完成知识点分类。</p><p>本页仅查看和比较；试选答案不记入考试、成绩或个人作答历史。</p>${demo.count?`<div class="match-presets"><button data-positive ${!demo.examples.positive?'disabled':''}>先看一组能匹配的题</button><button data-negative ${!demo.examples.negative?'disabled':''}>再看一组不匹配的题</button></div><form data-compare class="match-controls"><label>从这道题出发<select name="left">${options}</select></label><label>与这道题比较<select name="right">${options}</select></label><button>比较两题</button></form><div data-match-status role="status" aria-live="polite"></div><div data-pair></div><div data-all-related></div>`:'<p>当前没有核验有效的可检索题，请先完成分类及发布。</p>'}</div>`;
 if(!demo.count)return;
 const form=body.querySelector('[data-compare]'),pair=body.querySelector('[data-pair]');
 const optionHtml=q=>q.options.map(o=>`<button type="button" class="match-option secondary" data-answer="${esc(o.key)}" aria-pressed="false">${esc(o.label)}. ${esc(o.text)}</button>`).join('');
 const card=(q,side)=>{
  const b=q.matchingBasis,primary=b.primary,item=demo.items.find(x=>x.versionId===q.versionId);
  return `<article class="match-card" data-side="${side}"><p class="match-eyebrow">${side==='left'?'出发题':'比较题'} · ${esc(item?.year??q.paperId)} · 第${esc(q.originalLabel)}题</p><h3>${esc(q.typeLabel)}</h3><p class="bank-quote match-stem">${stem(q)}</p><div class="match-options">${optionHtml(q)}</div><p data-choice role="status">可先试选一项，再展开下方参考。</p>${q.materials.map(m=>`<details><summary>查看完整材料</summary><div class="bank-quote">${esc(m.text)}</div></details>`).join('')}<details><summary>查看来源参考（不计分）</summary><p>状态：${esc(q.answer?.status??'缺失')}。${q.gradingEligible?'当前版本具备自动判分条件；此页仍不记录成绩。':'尚未采纳为正式判分答案；这里只展示来源候选。'}</p>${(q.answer?.candidates??[]).map(c=>`<p>来源候选：${esc(c.value)}</p>`).join('')||'<p>没有来源候选。</p>'}</details><div class="match-basis"><p class="match-label">实际主知识点</p><h3>${esc(primary.name)}</h3><p>${esc(primary.definition)}</p><p><strong>归类依据：</strong>${esc(b.basis)}</p>${teachingFor(q)?`<div class="match-teaching"><strong>圈出的线索怎么看？（AI教学解释）</strong><p>${esc(teachingFor(q).reason)}</p><small>用于帮助理解规则，不是新增的官方解析或答案采纳。</small></div>`:''}<p><strong>容易混淆的边界：</strong>${esc(b.boundary)}</p><details><summary>查看分析实际引用的题目证据</summary>${b.keyEvidence.map(e=>`<blockquote class="bank-quote">${esc(e.quote)}</blockquote><p>${e.source==='question'?'题干原句':'材料原句'}</p>`).join('')}<p>展示保存的实际引用范围；如果引用了整句，不能把它说成已经逐词定位了决定性证据。</p></details><details><summary>查看分类和复核记录</summary><p>这是AI分析，不是来源官方解析。${q.explanations.length?'另有来源解析可核对。':'该题没有关联的来源解析。'}</p><p>结论：${esc(b.conclusion)}</p><p>复核：${esc(b.review.reason)}</p><p>结果：${esc(b.review.decision)}；主考点一致：${b.review.independentPrimaryId===primary.id?'是':'否'}</p><p>不同轮次不等于不同模型，不代表跨模型审计。</p><small>内容 ${esc(q.versionId)}<br>分类 ${esc(b.classificationId)}<br>目录修订 ${b.catalogRevision}<br>分析轮次 ${esc(b.runId)}<br>复核轮次 ${esc(b.review.runId)}</small></details><details><summary>查看MD来源页与原文</summary>${q.evidence.map(e=>`<p>第${e.page}页 · ${esc(e.documentId)}</p><blockquote class="bank-quote">${esc(e.quote)}</blockquote>`).join('')}</details></div></article>`;
 };
 async function compare(left,right){
  const token=++epoch;form.elements.left.value=left;form.elements.right.value=right;
  const status=body.querySelector('[data-match-status]');status.textContent='正在核对当前有效分类…';
  const r=await api('GET',root+'/matching-demo/compare?'+new URLSearchParams({left,right}));if(token!==epoch||!body.isConnected||!isCurrent())return;
  status.textContent=r.matched?'匹配：相同题型、相同主知识点':'不匹配：没有通过全部条件';status.className='match-verdict '+(r.matched?'is-match':'is-different');
  pair.innerHTML=`<p>${esc(r.reason)}</p><div class="match-checks">${r.checks.map(c=>`<div class="match-check ${c.passed?'is-pass':'is-fail'}"><strong>${c.passed?'✓':'×'} ${esc(c.label)}</strong><span>${esc(c.detail)}</span></div>`).join('')}</div><div class="match-pair">${card(r.left,'left')}${card(r.right,'right')}</div>${r.ordering?`<p>此比较题排在第${r.ordering.position}/${r.ordering.total}位。${esc(r.ordering.explanation)}</p>`:''}<p class="match-principle">原理：AI先给每道题提出带依据的主考点，经复核和发布后，程序才检查“题型相同 + 规范主知识点相同”。分类如果标错，查询再准确也可能推荐错，所以需要你看到的这些依据和后续独立检索验收。</p>`;
  pair.querySelectorAll('[data-answer]').forEach(button=>button.onclick=()=>{const box=button.closest('[data-side]');box.querySelectorAll('[data-answer]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));box.querySelector('[data-choice]').textContent='本页试选：'+button.dataset.answer+'。未提交考试，不判分、不保存历史。';});
  const related=await api('GET',root+'/questions/'+encodeURIComponent(left)+'/related?mode=strict');if(token!==epoch||!body.isConnected||!isCurrent())return;
  const out=body.querySelector('[data-all-related]');out.innerHTML=`<h3>这道出发题还能匹配哪些题？</h3>${related.items.length?related.items.map(x=>`<button class="secondary" data-compare-q="${esc(x.question.versionId)}">${esc(x.source.year)} · 第${esc(x.question.originalLabel)}题 · ${esc(x.knowledge.name)}</button>`).join(''):`<p>${esc(related.reason)}</p>`}<p>同属“语法”或有相同词语，并不自动成为匹配题。这里只列当前核验有效的严格匹配结果。</p>`;
  out.querySelectorAll('[data-compare-q]').forEach(b=>b.onclick=()=>run(()=>compare(left,b.dataset.compareQ)));
 }
 form.onsubmit=e=>{e.preventDefault();run(()=>compare(form.elements.left.value,form.elements.right.value));};
 body.querySelector('[data-positive]').onclick=()=>run(()=>compare(demo.examples.anchor,demo.examples.positive));
 body.querySelector('[data-negative]').onclick=()=>run(()=>compare(demo.examples.anchor,demo.examples.negative));
 await compare(demo.examples.anchor,demo.examples.positive??demo.examples.anchor);
}
