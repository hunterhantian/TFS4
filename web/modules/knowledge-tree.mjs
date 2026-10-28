import {escape as esc} from './ui.mjs';
const root='/admin/stage2';
const name=s=>String(s).replace(/〔客观题〕$/,'');
function stem(q){const chars=Array.from(q.text),spans=[...(q.annotations??[])].sort((a,b)=>a.start-b.start);let at=0,out='';for(const a of spans){if(a.start<at||a.end>chars.length)continue;out+=esc(chars.slice(at,a.start).join(''))+'<u>'+esc(chars.slice(a.start,a.end).join(''))+'</u>';at=a.end;}return out+esc(chars.slice(at).join(''));}
export async function renderKnowledgeTree({body,api,run,isCurrent=()=>true}){
 let tree,selected=null,mode='available',typeId='',page=1,epoch=0,treeEpoch=0;
 body.innerHTML=`<div class="kt-page"><p class="kt-eyebrow">知识点为核心 · 题型作分组</p><h2>三卷客观题知识树</h2><p>展开具体知识点，直接查看多道题；已复核与待复核分开计数。点击题目查看完整题面、材料和归类依据。</p><div data-overview></div><div class="kt-filters"><label>试卷年份<select data-year><option value="">全部年份</option><option>2012</option><option>2013</option><option>2023</option></select></label><label>查找知识点<input data-search type="search" placeholder="例如：主有代词、副动词、时态"></label></div><div class="kt-layout"><nav class="kt-nav" aria-label="客观题知识树"><div data-tree></div></nav><section class="kt-content" aria-label="知识点题目"><div data-node></div><div data-list></div></section></div><p class="kt-footer">AI归类与复核不等于官方解析；参考答案尚未采纳的题不用于正式自动判分。听力目前仅有题干任务候选，未核音频，不计入可用题。阅读节点是阅读能力任务分组。</p></div>`;
 const year=()=>body.querySelector('[data-year]').value;
 const current=token=>isCurrent()&&token===epoch&&body.isConnected;
 const pathFor=id=>{const result=[],seen=new Set();while(id){if(seen.has(id))break;seen.add(id);const n=tree.nodes.find(n=>n.id===id);if(!n)break;result.unshift(n);id=n.parentId;}return result;};
 function drawTree(){
  const text=body.querySelector('[data-search]').value.trim().toLowerCase(),visible=new Set();
  for(const n of tree.nodes)if(!text||(name(n.name)+' '+n.definition).toLowerCase().includes(text))for(const p of pathFor(n.id))visible.add(p.id);
  const selectedPath=new Set(pathFor(selected).map(x=>x.id));
  const render=parent=>tree.nodes.filter(n=>n.parentId===parent&&visible.has(n.id)).map(n=>{
   const counts=`<span class="kt-count">${n.available}题${n.pending?` · 待复核${n.pending}`:''}</span>`;
   if(n.leaf)return `<button class="kt-leaf secondary ${selected===n.id?'is-selected':''}" data-node-id="${esc(n.id)}" aria-pressed="${selected===n.id}"><span>${esc(name(n.name))}</span>${counts}</button>`;
   return `<details class="kt-branch" ${selectedPath.has(n.id)||text?'open':''}><summary><span>${esc(name(n.name))}</span>${counts}</summary><button class="kt-aggregate secondary" data-node-id="${esc(n.id)}">查看本分支全部题目</button><div class="kt-children">${render(n.id)}</div></details>`;
  }).join('');
  const nav=body.querySelector('[data-tree]');nav.innerHTML=render(null)||'<p>没有对应的知识点。</p>';
  nav.querySelectorAll('[data-node-id]').forEach(b=>b.onclick=()=>run(async()=>{selected=b.dataset.nodeId;typeId='';page=1;const n=tree.nodes.find(n=>n.id===selected);if(!n.available&&n.pending)mode='pending';drawTree();await loadNode();}));
 }
 async function reload(){
  const token=++treeEpoch;++epoch;
  const data=await api('GET',root+'/knowledge-tree'+(year()?'?'+new URLSearchParams({year:year()}):''));if(!isCurrent()||token!==treeEpoch)return;
  tree=data;if(!selected||!tree.nodes.some(n=>n.id===selected))selected=tree.defaultNode;
  const selectedNode=tree.nodes.find(n=>n.id===selected);if(selectedNode&&!selectedNode.available&&selectedNode.pending)mode='pending';
  body.querySelector('[data-overview]').innerHTML=`<div class="kt-stats"><div><strong>${tree.totalQuestions}</strong><span>已标注客观题</span></div><div><strong>${tree.available}</strong><span>已复核可检索</span></div><div><strong>${tree.pending}</strong><span>待复核候选</span></div></div>`;
  drawTree();if(selected)await loadNode();else body.querySelector('[data-list]').innerHTML='<p>当前没有客观题标注。</p>';
 }
 async function loadNode(){
  const token=++epoch,n=tree.nodes.find(n=>n.id===selected);if(!n)return;
  const header=body.querySelector('[data-node]');
  header.innerHTML=`<p class="kt-breadcrumb">${pathFor(n.id).map(x=>esc(name(x.name))).join(' › ')}</p><h3>${esc(name(n.name))}</h3><p>${esc(n.definition)}</p>${n.leaf?'':'<p class="bank-warning">本分支是多个具体知识点的汇总，下面的题目不一定彼此属于同一主知识点。</p>'}<div class="kt-modes"><button data-mode="available" class="secondary" aria-pressed="${mode==='available'}">已复核 ${n.available}题</button><button data-mode="pending" class="secondary" aria-pressed="${mode==='pending'}">待复核 ${n.pending}题</button></div><div data-types></div>`;
  header.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>run(async()=>{mode=b.dataset.mode;typeId='';page=1;await loadNode();}));
  const out=body.querySelector('[data-list]');out.innerHTML='<p role="status">正在读取题型分组…</p>';
  const params=new URLSearchParams({status:mode,page:String(page)});if(year())params.set('year',year());if(typeId)params.set('typeId',typeId);
  const result=await api('GET',root+'/knowledge-tree/'+encodeURIComponent(selected)+'/questions?'+params);if(!current(token))return;
  header.querySelector('[data-types]').innerHTML=`<div class="kt-types"><button class="secondary" data-type="" aria-pressed="${!typeId}">全部题型</button>${result.groups.map(g=>`<button class="secondary" data-type="${esc(g.typeId)}" aria-pressed="${g.typeId===typeId}">${esc(g.label)} ${g.total}题</button>`).join('')}</div>`;
  header.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>run(async()=>{typeId=b.dataset.type;page=1;await loadNode();}));
  out.innerHTML=(mode==='pending'?'<p class="kt-pending-notice">以下只是待复核候选，不计入已复核匹配题。每道题会显示保留原因。</p>':'')+`<p data-total>本次筛选共${result.total}题 · 第${result.page}页</p>`+
   result.groups.map(g=>{const items=result.items.filter(x=>x.typeId===g.typeId);if(!items.length)return '';return `<section class="kt-type-group"><h4>${esc(g.label)} <span>共${g.total}题 · 本页${items.length}题</span></h4>${items.map(r=>`<details class="kt-question" data-question="${esc(r.versionId)}"><summary><span class="kt-question-meta">${r.year} · ${r.typeId==='verb-form'?esc(r.label):'第'+esc(r.label)+'题'} · ${mode==='available'?'已复核':'待复核'}</span><span>${esc(r.text)}</span><span class="kt-question-point">${esc(name(r.primaryName))}</span></summary><div data-question-body></div></details>`).join('')}</section>`;}).join('')+
   (!result.items.length?'<p>当前知识点在此状态和题型下没有题目。</p>':'')+`<div class="kt-pagination"><button class="secondary" data-prev ${page===1?'disabled':''}>上一页</button><button class="secondary" data-next ${page*result.pageSize>=result.total?'disabled':''}>下一页</button></div>`;
  out.querySelector('[data-prev]').onclick=()=>run(async()=>{page--;await loadNode();});out.querySelector('[data-next]').onclick=()=>run(async()=>{page++;await loadNode();});
  out.querySelectorAll('[data-question]').forEach(el=>el.addEventListener('toggle',()=>{if(el.open&&!el.dataset.loaded){el.dataset.loaded='loading';run(async()=>{
   const row=result.items.find(r=>r.versionId===el.dataset.question),slot=el.querySelector('[data-question-body]');slot.innerHTML='<p>正在展开题目…</p>';
   const q=await api('GET',root+'/questions/'+encodeURIComponent(row.versionId));if(!current(token)||!el.isConnected)return;
   slot.innerHTML=`<p class="bank-quote kt-full-stem">${stem(q)}</p>${q.options.map(o=>`<p>${esc(o.label)}. ${esc(o.text)}</p>`).join('')}${q.materials.map(m=>`<details ${['verb_form','cloze'].includes(m.kind)?'open':''}><summary>完整${m.kind==='verb_form'?'动词篇章':'材料'}</summary><div class="bank-quote">${esc(m.text)}</div></details>`).join('')}<div class="kt-basis"><strong>本题归类依据</strong><p>${esc(row.basis)}</p>${mode==='pending'?`<p class="bank-warning">待复核原因：${esc(row.reason)}</p>`:''}<details><summary>查看所引用的题句或材料</summary>${row.keyEvidence.map(e=>`<blockquote class="bank-quote">${esc(e.quote)}</blockquote>`).join('')}</details><details><summary>查看复核状态与MD来源</summary><p>${esc(row.review.decision==='agree'?'独立轮次复核同意':'待复核')}：${esc(row.review.reason)}</p><p>不同轮次不等于不同模型；未进行跨模型审计。</p><small>${esc(q.versionId)} · ${esc(row.id)}</small>${q.evidence.map(e=>`<p>MD第${e.page}页</p><blockquote class="bank-quote">${esc(e.quote)}</blockquote>`).join('')}</details></div><details><summary>查看参考候选（非正式判分）</summary><p>状态：${esc(q.answer?.status??'缺失')}；本页不计分、不记录作答。</p>${(q.answer?.candidates??[]).map(a=>`<p>${esc(a.value)}</p>`).join('')||'<p>暂无参考候选。</p>'}</details>`;el.dataset.loaded='yes';
  });}}));
 }
 body.querySelector('[data-year]').onchange=()=>run(async()=>{typeId='';page=1;await reload();});
 body.querySelector('[data-search]').oninput=()=>{if(tree)drawTree();};
 await reload();
}
