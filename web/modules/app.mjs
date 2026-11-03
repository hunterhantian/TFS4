import {mountMastery} from './learning-mastery.mjs';
import {mountPractice} from './learning-practice.mjs';
import {mountMistakes} from './learning-mistakes.mjs';
import {mountLearningTree} from './learning-tree.mjs';
import {initStage2} from './stage2.mjs';
import {mountRelated} from './bank.mjs';
import {newClientId} from './client-id.mjs';
import {renderArchiveCards} from './archive-cards.mjs';
import {api,setCsrf} from './api.mjs';
import {ExamSync,deviceId,readDraft,discardDraft,listDrafts,removeDraftIfUnchanged} from './sync.mjs';
import {renderExam,updateExam,renderReport,closeReportQuestion} from './views.mjs';
import {escape,duration,date,percent,download,message} from './ui.mjs';
const $=s=>document.querySelector(s);const reportFilters={mine:{range:'all',from:'',to:'',ownerId:''},all:{range:'all',from:'',to:'',ownerId:''}};let reportRequest=0;
let user=null,sync=null,reportScope='mine',createRequest=null;
const stage2=initStage2({show,run,getUser:()=>user});
function show(id){if(id!=='report-view')closeReportQuestion();for(const s of document.querySelectorAll('main>section'))s.hidden=s.id!==id;}
function status(text,state){$('#sync-status').textContent=text;$('#sync-status').dataset.state=state;}
function conflict(error){if(!sync)return;$('#listening-audio').pause();$('#conflict').hidden=false;$('#conflict-message').textContent=error.status===401?'登录已过期。本地修改已保留，请重新登录后继续。':error.message;$('#takeover').hidden=error.status!==409;$('#reauth').hidden=error.status!==401;updateExam(sync);}
async function run(fn){try{return await fn();}catch(e){message(e.message);if(e.status===401&&!sync){show('login-view');}return null;}}
function destroy(){if(sync){sync.destroy();sync=null;}$('#listening-audio').pause();}
function clearAccountViews(){
 stage2.reset();destroy();closeReportQuestion();reportRequest++;reportScope='mine';for(const scope of ['mine','all'])Object.assign(reportFilters[scope],{range:'all',from:'',to:'',ownerId:''});
 for(const id of ['report-content','report-list','user-list','attempt-list','draft-list','questions','learning-content','learning-sub-content'])$('#'+id).replaceChildren();$('#report-content').onclick=null;
 $('#archive-owner').innerHTML='<option value="">全部考生</option>';$('#report-owner').textContent='';$('#report-owner').hidden=true;$('#report-title').textContent='';$('#report-user-filter').hidden=true;
}
const trashIcon='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 10v7M14 10v7"/></svg>';
async function home(){if(sync?.running){await pause();return;}destroy();show('home-view');message('');const attempts=await api('GET','/attempts');$('#attempt-list').innerHTML=attempts.attempts.map((a,i)=>`<div class="attempt-card home-attempt"><p><strong>${escape(a.title||'考试内容未记录')}</strong><br>${date(a.createdAt)} · ${a.status==='paused'?'已暂停':'未完成'}</p><div class="home-attempt-actions"><button data-attempt="${escape(a.id)}" class="secondary">继续考试</button><button type="button" class="home-delete" data-delete-attempt="${i}" aria-label="删除 ${escape(date(a.createdAt))} 的未完成考试" title="删除未完成考试">${trashIcon}</button></div></div>`).join('')||'<p>暂无未完成考试。</p>';
 $('#attempt-list').querySelectorAll('[data-attempt]').forEach(b=>b.onclick=()=>run(()=>openAttempt(b.dataset.attempt)));
 const drafts=listDrafts(user.id);const titles=new Map(attempts.attempts.map(a=>[a.id,a.title]));await Promise.all(drafts.filter(d=>!d.title&&!titles.has(d.attemptId)).map(async d=>{try{const a=await api('GET','/attempts/'+encodeURIComponent(d.attemptId));if(a.title)titles.set(d.attemptId,a.title);}catch{}}));$('#draft-list').innerHTML=drafts.map((d,i)=>`<div class="attempt-card home-attempt"><p><strong>${escape(titles.get(d.attemptId)||d.title||'考试内容未记录')}</strong><br>本机尚未同步 · 已选${d.progress.answers.filter(a=>a.choice).length}题</p><div class="home-attempt-actions"><button data-draft="${i}" class="secondary">恢复本机未同步草稿</button><button type="button" class="home-delete" data-delete-draft="${i}" aria-label="删除本机待同步草稿，已选${d.progress.answers.filter(a=>a.choice).length}题" title="删除本机待同步草稿">${trashIcon}</button></div></div>`).join('')||'<p>暂无待同步草稿。</p>';$('#draft-list').querySelectorAll('[data-draft]').forEach(b=>b.onclick=()=>run(async()=>{const d=drafts[Number(b.dataset.draft)];await openAttempt(d.attemptId,false,d);}));
 $('#draft-list').querySelectorAll('[data-delete-draft]').forEach(b=>b.onclick=()=>run(async()=>{const d=drafts[Number(b.dataset.deleteDraft)];if(!confirm('确认删除这份本机待同步草稿？尚未同步的作答将无法恢复，服务器上的考试不会删除。'))return;if(!removeDraftIfUnchanged(d))throw Error('草稿已发生变化，请刷新后重新确认。');await home();message('本机待同步草稿已删除。');}));
 $('#attempt-list').querySelectorAll('[data-delete-attempt]').forEach(b=>b.onclick=()=>run(async()=>{const a=attempts.attempts[Number(b.dataset.deleteAttempt)],related=listDrafts(user.id).filter(d=>d.attemptId===a.id);const warning=related.length?`同时删除本机关联的 ${related.length} 份待同步草稿，其中未同步的作答将丢失。\n`:'';if(!confirm(`确认删除 ${date(a.createdAt)} 的未完成考试？\n${warning}删除后无法恢复；已提交的考试记录不受影响。`))return;b.disabled=true;try{for(const d of related)if(localStorage.getItem(d.storageKey)!==d.raw)throw Error('关联草稿已发生变化，请刷新后重新确认。');await api('DELETE','/attempts/'+encodeURIComponent(a.id),{expectedRevision:a.revision,deviceId});let retained=0;for(const d of related){if(!removeDraftIfUnchanged(d))retained++;}await home();message(retained?'未完成考试已删除；有变化的本机草稿已保留，请自行处理。':'未完成考试已删除。');}finally{if(b.isConnected)b.disabled=false;}}));
}
async function openAttempt(id,alreadyOwned=false,selectedDraft=null){
 destroy();message('');let a=await api('GET',`/attempts/${id}`);if(a.status==='submitted'){const r=await api('GET','/reports');const report=r.reports.find(r=>r.attemptId===id);if(report){if(selectedDraft?.dirty)download(`软柿子-未同步内容-${id}.json`,selectedDraft);await showReport(report.id);if(selectedDraft?.dirty)message('服务器已经交卷。本机草稿已保留并导出，不会改写已提交报告。');return;}throw Error('此考试已提交，请在考试记录中查看。');}
 const draft=selectedDraft||readDraft(user.id,id);sync=new ExamSync(user.id,a,{onStatus:status,onConflict:conflict,onStorageError:text=>conflict({message:text}),onSubmitted:id=>run(()=>showReport(id))});show('exam-view');$('#conflict').hidden=true;$('#reauth').hidden=true;renderExam(sync);
 if(draft?.dirty&&draft.baseRevision!==a.revision&&JSON.stringify(draft.progress)!==JSON.stringify(a.progress)){sync.restore(draft);sync.frozen=true;conflict({message:'云端版本与本机待同步版本不同。本地修改已保留，请导出后读取云端，避免覆盖。',status:409});return;}
 if(draft?.dirty&&JSON.stringify(draft.progress)===JSON.stringify(a.progress)){discardDraft(user.id,id);if(draft.storageKey&&localStorage.getItem(draft.storageKey)===draft.raw)localStorage.removeItem(draft.storageKey);}
 try{
  if(!alreadyOwned||a.leaseDeviceId!==deviceId)a=await api('POST',`/attempts/${id}/resume`,{expectedRevision:a.revision,deviceId});
  sync.attempt=a;sync.progress=structuredClone(a.progress);sync.ensureTiming();if(draft?.dirty&&draft.baseRevision===sync.attempt.revision-(alreadyOwned?0:1))sync.restore(draft,{rebase:true});
  if(!sync.pendingAction)sync.start();renderExam(sync);status('已连接服务器','synced');if(sync.dirty){await sync.flush();if(sync?.attempt.status==='paused')await home();}
 }catch(e){sync.frozen=true;if(draft?.dirty)sync.restore(draft);conflict(e);}
}
async function pause(){if(!sync)return;$('#listening-audio').pause();sync.stop();updateExam(sync);try{await sync.flush('pause');await home();}catch(e){$('#conflict').hidden=false;$('#conflict-message').textContent=e.message;$('#takeover').hidden=e.status!==409;message('本机内容已保留，暂停尚未获服务器确认。请重试同步。');}}
async function loadReportList(scope=reportScope){
 const state=reportFilters[scope],request=++reportRequest;
 if(state.range==='custom'&&(!state.from||!state.to)){$('#report-list').replaceChildren();$('#archive-range-hint').textContent='请选择起止日期';message('请选择开始日期和结束日期后应用。');return;}
 const params=new URLSearchParams({range:state.range});if(state.range==='custom'){params.set('from',state.from);params.set('to',state.to);}if(scope==='all'&&state.ownerId)params.set('ownerId',state.ownerId);
 $('#report-list').innerHTML='<p class="muted">正在筛选…</p>';let data;try{data=await api('GET',(scope==='all'?'/admin/reports':'/reports')+'?'+params);}catch(e){if(request!==reportRequest)return;$('#report-list').replaceChildren();$('#archive-range-hint').textContent='筛选未完成';throw e;}
 if(request!==reportRequest||scope!==reportScope||$('#reports-view').hidden)return;
 message('');$('#archive-range-hint').textContent=data.filters.fromDate?`${data.filters.fromDate} — ${data.filters.toDate} · 按提交时间（北京时间）`:'全部提交时间（含时间未记录的旧存档）';
 $('#report-list').innerHTML=renderArchiveCards(data.reports);
 $('#report-list').querySelectorAll('button').forEach(b=>b.onclick=()=>run(()=>showReport(b.dataset.report,scope)));
}
async function showReports(scope='mine'){
 destroy();reportScope=scope;show('reports-view');$('#report-list-title').textContent=scope==='all'?'所有考生存档':'我的考试记录';
 const state=reportFilters[scope];$('#archive-range').value=state.range;$('#archive-from').value=state.from;$('#archive-to').value=state.to;$('#custom-report-range').hidden=state.range!=='custom';$('#report-user-filter').hidden=scope!=='all';
 if(scope==='all'){const data=await api('GET','/admin/users');if(reportScope!==scope||$('#reports-view').hidden)return;$('#archive-owner').innerHTML='<option value="">全部考生</option>'+data.users.map(u=>`<option value="${u.id}">${escape(u.username)}</option>`).join('');$('#archive-owner').value=state.ownerId;}
 await loadReportList(scope);
}
$('#archive-range').onchange=()=>run(async()=>{reportFilters[reportScope].range=$('#archive-range').value;$('#custom-report-range').hidden=$('#archive-range').value!=='custom';await loadReportList();});
$('#archive-owner').onchange=()=>run(async()=>{reportFilters.all.ownerId=$('#archive-owner').value;await loadReportList();});
$('#archive-from').onchange=()=>{reportFilters[reportScope].from=$('#archive-from').value;};$('#archive-to').onchange=()=>{reportFilters[reportScope].to=$('#archive-to').value;};
$('#report-filters').onsubmit=e=>{e.preventDefault();run(loadReportList);};
async function showReport(id,scope='mine'){
 destroy();const r=await api('GET',scope==='all'?`/admin/reports/${id}`:`/reports/${id}`);reportScope=scope;show('report-view');message('');renderReport(r,{mountRelatedQuestions:mountRelated});if(scope==='mine'&&r.mode==='mini'&&r.mini){const p=await api('GET','/mini-sittings/'+encodeURIComponent(r.mini.sitting));const el=$('#mini-report-progress');if(el)el.textContent=`${r.mini.sitting} · 已交卷 ${p.sheets.filter(s=>s.status==='submitted').length} / 5 份；其中全部作答 ${p.sheets.filter(s=>s.status==='submitted'&&s.answered===20).length} 份`; }$('#report-owner').hidden=!r.ownerUsername;$('#report-owner').textContent=r.ownerUsername?`考生：${r.ownerUsername}`:'';
}
$('#login-form').onsubmit=e=>{e.preventDefault();run(async()=>{const form=e.currentTarget;const data=new FormData(form);const result=await api('POST','/auth/login',{username:data.get('username'),password:data.get('password')});clearAccountViews();form.reset();setCsrf(result.csrf);user=result.user;stage2.setUser(user);$('#account-name').textContent=user.username;$('#logout').hidden=false;$('#open-admin').hidden=user.role!=='admin';$('#open-all-reports').hidden=user.role!=='admin';await home();});};
$('#logout').onclick=()=>run(async()=>{if(sync){sync.stop();sync.persist();}if(sync&&!sync.frozen){try{await sync.flush('pause');}catch{message('进度尚未同步，已保留本机备份。');}}await api('POST','/auth/logout',{});clearAccountViews();setCsrf('');user=null;$('#account-name').textContent='';$('#logout').hidden=true;show('login-view');message('已退出；未同步内容仍保存在原账号的本机缓存中。');});
$('#brand-home').onclick=()=>run(()=>user?home():Promise.resolve(show('login-view')));document.querySelectorAll('[data-home]').forEach(b=>b.onclick=()=>run(home));
const selectTestMode=mode=>{for(const name of ['mini','listening','full-exam']){$('#'+name+'-setup').hidden=name!==mode;$('#choose-'+name).setAttribute('aria-pressed',String(name===mode));}};
let learningRequest=0;
async function startMistakeRetry(selection){createRequest||=newClientId();const a=await api('POST','/learning/mistakes/retry',{...selection,deviceId,requestId:createRequest});createRequest=null;await openAttempt(a.id,true);}
async function startLearningTraining(nodeId,kind='targeted'){
 createRequest||=newClientId();const a=await api('POST','/learning/training',{nodeId,kind,deviceId,requestId:createRequest});createRequest=null;await openAttempt(a.id,true);
}
async function startLearningMixed(planId){
 createRequest||=newClientId();const a=await api('POST','/learning/training',{nodeId:'plan',kind:'mixed',planId,deviceId,requestId:createRequest});createRequest=null;await openAttempt(a.id,true);
}
async function showLearning(){
 destroy();++learningRequest;show('learning-view');message('');const root=$('#learning-content');
 root.innerHTML=`<nav class="learning-sections" aria-label="软柿子变硬功能"><button type="button" data-learning-page="tree"><b>知识树诊断</b><small>逐级查看知识点和学习依据</small><span aria-hidden="true">↗</span></button><button type="button" data-learning-page="mistakes"><b>我的错题</b><small>按时间回看和重做错题</small><span aria-hidden="true">↗</span></button><button type="button" data-learning-page="practice"><b>知识点掌握程度</b><small>按时间查看知识点正确率</small><span aria-hidden="true">↗</span></button><button type="button" data-learning-page="recent"><b>最近作答</b><small>按时间回看最近的题目</small><span aria-hidden="true">↗</span></button></nav><p class="muted learning-note">根据已保存的作答记录展示；知识点关联状态会影响判断。</p>`;
 root.querySelectorAll('[data-learning-page]').forEach(b=>b.onclick=()=>run(()=>showLearningPage(b.dataset.learningPage)));
}
async function showLearningPage(page){
 const titles={tree:'知识树诊断',mistakes:'我的错题',practice:'知识点掌握程度',recent:'最近作答'};if(!titles[page])throw Error('页面不存在');const request=++learningRequest;show('learning-subview');message('');$('#learning-subtitle').textContent=titles[page];const host=$('#learning-sub-content'),root=document.createElement('div');host.replaceChildren(root);root.textContent='正在读取…';
 if(page==='tree'){await mountLearningTree(root,{run,onTrain:startLearningTraining});}
 else if(page==='mistakes'){root.replaceChildren();await mountMistakes(root,{run,onRetry:startMistakeRetry});}
 else if(page==='practice'){root.replaceChildren();await mountMastery(root,{run});}
 else{const data=await api('GET','/learning/overview');if(request!==learningRequest)return;root.innerHTML=data.recent.length?data.recent.map(e=>`<article class="synthesis-card"><strong>${escape(e.questionId)}</strong><p>${e.result==='wrong'?'答错':'答对'} · ${escape(e.time.slice(0,10))}</p></article>`).join(''):'<p class="learning-empty">暂无已判定的作答记录。</p>';}
}
$('#open-learning').onclick=()=>run(showLearning);$('#learning-back').onclick=()=>run(showLearning);
$('#open-tests').onclick=()=>run(async()=>{show('test-setup-view');selectTestMode('');message('');});
$('#choose-listening').onclick=()=>run(async()=>{selectTestMode('listening');const data=await api('GET','/listening-sittings');const select=$('#listening-sitting');select.innerHTML=data.sittings.map(s=>`<option value="${escape(s.sitting)}" ${s.available?'':'disabled'} data-format="${escape(s.format)}">${escape(s.title)}${s.available?'':'（题面不完整）'}</option>`).join('');$('#start-listening').disabled=!data.sittings.some(s=>s.available);select.onchange=()=>{$('#listening-format-hint').textContent=select.selectedOptions[0]?.dataset.format==='wma'?'该场次录音为 WMA 格式，部分浏览器可能无法播放。':'';};select.onchange();});
async function loadMiniSheets(){const sitting=$('#mini-sitting').value;const target=$('#mini-sheets');if(!sitting){target.replaceChildren();return;}const data=await api('GET','/mini-sittings/'+encodeURIComponent(sitting));if($('#mini-sitting').value!==sitting)return;target.innerHTML=data.sheets.map(s=>`<article class="attempt-card"><h3>Mini ${s.number} / 5</h3><p>${s.number===1?'语法 8 · 词汇 2 · 完形 1 篇 10 题':'语法 8 · 词汇 2 · 阅读 1 篇 5 题 · 动词填空 5 空'}</p><p>${s.status==='submitted'?`已交卷 · 已答 ${s.answered}/20`:s.status==='active'||s.status==='paused'?`未完成 · 已答 ${s.answered}/20`:'未开始'}${!s.available?' · '+escape(s.issues.join('；')):''}</p><button type="button" class="primary" data-mini="${s.number}" data-attempt="${escape(s.attemptId||'')}" ${!s.available&&!s.attemptId?'disabled':''}>${s.status==='submitted'?'查看结果':s.attemptId?'继续考试':'开始这一份'}</button></article>`).join('');target.querySelectorAll('[data-mini]').forEach(b=>b.onclick=()=>run(async()=>{b.disabled=true;try{if(b.dataset.attempt)await openAttempt(b.dataset.attempt);else{createRequest||=newClientId();const a=await api('POST','/attempts',{sourceId:sitting+':'+b.dataset.mini,mode:'mini',deviceId,requestId:createRequest});createRequest=null;await openAttempt(a.id,true);}}finally{if(b.isConnected)b.disabled=false;}}));}
$('#choose-mini').onclick=()=>run(async()=>{selectTestMode('mini');const data=await api('GET','/mini-sittings');$('#mini-sitting').innerHTML='<option value="">请选择年份</option>'+data.sittings.map(s=>`<option value="${escape(s)}">${escape(s.replace(/^(\d{4})-(\d{2})$/,'$1年$2月'))}${s.includes('-')?'':'年'}</option>`).join('');await loadMiniSheets();});
$('#mini-sitting').onchange=()=>run(loadMiniSheets);
$('#choose-full-exam').onclick=()=>run(async()=>{selectTestMode('full-exam');const data=await api('GET','/full-exam-sittings'),select=$('#full-exam-sitting');select.innerHTML='<option value="">请选择年份</option>'+data.sittings.map(s=>`<option value="${escape(s.sitting)}">${escape(s.title)}${s.available?'':'（暂不可开始）'}</option>`).join('');select.onchange=()=>{const current=data.sittings.find(s=>s.sitting===select.value);$('#start-full-exam').disabled=!current?.available;$('#full-exam-hint').textContent=current?(!current.available?'暂不可开始：'+current.issues.join('；'):current.warnings.length?'提示：'+current.warnings.join('；'):''):'';};select.onchange();});
$('#start-full-exam').onclick=()=>run(async()=>{const b=$('#start-full-exam');b.disabled=true;createRequest||=newClientId();try{const a=await api('POST','/attempts',{sourceId:$('#full-exam-sitting').value,mode:'full_candidate',deviceId,requestId:createRequest});createRequest=null;await openAttempt(a.id,true);}finally{if(b.isConnected)b.disabled=false;}});
$('#start-listening').onclick=()=>run(async()=>{const b=$('#start-listening');b.disabled=true;createRequest||=newClientId();try{const a=await api('POST','/attempts',{sourceId:$('#listening-sitting').value,mode:'listening',deviceId,requestId:createRequest});createRequest=null;await openAttempt(a.id,true);}finally{b.disabled=false;}});
$('#return-learning').onclick=()=>run(async()=>{if(!sync||sync.attempt.mode!=='training')return;if(sync.frozen){message('请先处理同步冲突，当前内容已保存在本机。');return;}const button=$('#return-learning');button.disabled=true;$('#listening-audio').pause();sync.stop();updateExam(sync);try{await sync.flush('pause');await showLearning();}catch(e){$('#conflict').hidden=false;$('#conflict-message').textContent=e.message;$('#takeover').hidden=e.status!==409;message('暂停尚未同步，作答已保留在本机，请重试。');}finally{button.disabled=false;}});
$('#pause-exam').onclick=()=>run(pause);$('#open-reports').onclick=()=>run(showReports);$('#report-back').onclick=()=>run(()=>showReports(reportScope));$('#open-all-reports').onclick=()=>run(()=>showReports('all'));
$('#submit').onclick=()=>run(async()=>{if(!sync||sync.frozen)return;sync.advance();const answered=sync.progress.answers.filter(a=>a.choice).length;if(!confirm(`已答${answered}/${sync.attempt.questions.length}题。${answered<sync.attempt.questions.length?'含未作答题，仍然提交？':'确认交卷？'}`))return;$('#listening-audio').pause();sync.stop();updateExam(sync);$('#submit').disabled=true;try{await sync.flush('submit');}finally{$('#submit').disabled=false;}});
$('#retry-sync').onclick=()=>run(async()=>{if(!sync)return;if(sync.frozen){await openAttempt(sync.attempt.id);return;}const paused=sync.pendingAction==='pause';await sync.flush();if(paused)await home();});
$('#takeover').onclick=()=>run(async()=>{
 if(!sync)return;const id=sync.attempt.id;const cloud=await api('GET',`/attempts/${id}`);const draft=readDraft(user.id,id);
 if(draft?.dirty&&draft.baseRevision!==cloud.revision&&JSON.stringify(draft.progress)!==JSON.stringify(cloud.progress)){message('云端已有不同修改。请先“导出本地待同步内容并读取云端”，再接管。');return;}
 if(!confirm('确认由这台设备接管？原设备将停止同步，未同步内容不会自动合并。'))return;
 const claimed=await api('POST',`/attempts/${id}/takeover`,{expectedRevision:cloud.revision,deviceId,confirmed:true});sync.frozen=false;sync.attempt=claimed;if(draft?.dirty)sync.restore(draft,{rebase:true});else{sync.progress=structuredClone(claimed.progress);sync.ensureTiming();}sync.pendingAction=null;sync.start();$('#conflict').hidden=true;renderExam(sync);await sync.flush();
});
$('#use-cloud').onclick=()=>run(async()=>{if(!sync)return;const id=sync.attempt.id;download(`软柿子-待同步备份-${id}.json`,{attemptId:id,...readDraft(user.id,id),baseRevision:sync.attempt.revision,progress:structuredClone(sync.progress)});discardDraft(user.id,id);await openAttempt(id);});
$('#reauth').onclick=()=>{destroy();show('login-view');};
$('#listening-audio').addEventListener('error',()=>$('#audio-status').textContent='音频暂不可用，请联系管理员检查音频文件。');
setInterval(()=>{if(sync?.running){sync.advance();updateExam(sync);}},1000);setInterval(()=>{if(sync?.autoSaveDue())sync.flush().catch(()=>{});},1000);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&sync?.running){pause().catch(()=>{});}});
window.addEventListener('pagehide',()=>{if(sync?.running){$('#listening-audio').pause();sync.flush('pause').catch(()=>{});}});
window.addEventListener('online',()=>{if(sync&&!sync.frozen){const paused=sync.pendingAction==='pause';sync.flush().then(()=>paused?home():null).catch(()=>{});}});
async function adminView(){show('admin-view');const data=await api('GET','/admin/users');$('#user-list').innerHTML=data.users.map(u=>`<form class="user-card" data-user-id="${u.id}"><b>${escape(u.username)} · ${escape(u.role)}</b><label>新密码<input name="password" type="password" minlength="10" maxlength="256" autocomplete="new-password" required></label><button class="secondary">重置密码并注销旧会话</button></form>`).join('');$('#user-list').querySelectorAll('form').forEach(f=>f.onsubmit=e=>{e.preventDefault();run(async()=>{if(!confirm('重置后该账号所有旧登录状态失效，确认？'))return;await api('POST',`/admin/users/${f.dataset.userId}/reset-password`,{password:new FormData(f).get('password')});f.reset();message('密码已重置，旧会话已注销。');});});}
$('#open-admin').onclick=()=>run(adminView);$('#create-user-form').onsubmit=e=>{e.preventDefault();const form=e.currentTarget;run(async()=>{const data=new FormData(form);await api('POST','/admin/users',{username:data.get('username'),password:data.get('password'),role:'user'});form.reset();await adminView();message('普通用户已创建。');});};
await run(async()=>{try{const result=await api('GET','/auth/me');setCsrf(result.csrf);user=result.user;stage2.setUser(user);$('#account-name').textContent=user.username;$('#logout').hidden=false;$('#open-admin').hidden=user.role!=='admin';$('#open-all-reports').hidden=user.role!=='admin';await home();}catch(e){show('login-view');if(e.code==='NETWORK_ERROR')message('当前无法连接服务器。原有待同步缓存仍保留，联网后重新登录继续。');}});
