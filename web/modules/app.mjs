import {initContentBank} from './content-bank.mjs';
import {initBank,mountRelated} from './bank.mjs';
import {newClientId} from './client-id.mjs';
import {renderArchiveCards} from './archive-cards.mjs';
import {api,setCsrf} from './api.mjs';
import {ExamSync,deviceId,readDraft,discardDraft,listDrafts} from './sync.mjs';
import {renderExam,updateExam,renderReport,closeReportQuestion} from './views.mjs';
import {escape,duration,date,percent,download,message} from './ui.mjs';
const $=s=>document.querySelector(s);const reportFilters={mine:{range:'all',from:'',to:'',ownerId:''},all:{range:'all',from:'',to:'',ownerId:''}};let reportRequest=0;
let user=null,sync=null,reportScope='mine',preview=null,createRequest=null;
const bank=initBank({show,run,getUser:()=>user});
const contentBank=initContentBank({show,run,getUser:()=>user});
function show(id){if(id!=='report-view')closeReportQuestion();for(const s of document.querySelectorAll('main>section'))s.hidden=s.id!==id;}
function status(text,state){$('#sync-status').textContent=text;$('#sync-status').dataset.state=state;}
function conflict(error){if(!sync)return;$('#listening-audio').pause();$('#conflict').hidden=false;$('#conflict-message').textContent=error.status===401?'登录已过期。本地修改已保留，请重新登录后继续。':error.message;$('#takeover').hidden=error.status!==409;$('#reauth').hidden=error.status!==401;updateExam(sync);}
async function run(fn){try{return await fn();}catch(e){message(e.message);if(e.status===401&&!sync){show('login-view');}return null;}}
function destroy(){if(sync){sync.destroy();sync=null;}$('#listening-audio').pause();}
function clearAccountViews(){
 bank.reset();contentBank.reset();destroy();closeReportQuestion();reportRequest++;reportScope='mine';for(const scope of ['mine','all'])Object.assign(reportFilters[scope],{range:'all',from:'',to:'',ownerId:''});
 for(const id of ['report-content','report-list','user-list','attempt-list','draft-list','questions'])$('#'+id).replaceChildren();$('#report-content').onclick=null;
 $('#archive-owner').innerHTML='<option value="">全部考生</option>';$('#report-owner').textContent='';$('#report-owner').hidden=true;$('#report-title').textContent='';$('#report-user-filter').hidden=true;
}
async function home(){if(sync?.running){await pause();return;}destroy();show('home-view');message('');const [sources,attempts]=await Promise.all([api('GET','/sources'),api('GET','/attempts')]);$('#source-list').innerHTML=sources.sources.map(s=>`<div class="attempt-card"><b>${escape(s.title)}</b><p>${s.total}题</p><button data-source="${s.id}" class="primary">开始完整考试</button></div>`).join('')||'<p>题库尚未初始化，请联系管理员。</p>';$('#attempt-list').innerHTML=attempts.attempts.map(a=>`<div class="attempt-card"><p>${date(a.createdAt)} · ${a.status==='paused'?'已暂停':'未完成'}</p><button data-attempt="${a.id}" class="secondary">继续考试</button></div>`).join('')||'<p>暂无未完成考试。</p>';
 $('#source-list').querySelectorAll('[data-source]').forEach(b=>b.onclick=()=>run(async()=>{b.disabled=true;createRequest||=newClientId();try{const a=await api('POST','/attempts',{sourceId:b.dataset.source,mode:'full',deviceId,requestId:createRequest});createRequest=null;await openAttempt(a.id,true);}finally{b.disabled=false;}}));
 $('#attempt-list').querySelectorAll('[data-attempt]').forEach(b=>b.onclick=()=>run(()=>openAttempt(b.dataset.attempt)));
 const drafts=listDrafts(user.id);$('#draft-list').innerHTML=drafts.map((d,i)=>`<div class="attempt-card"><p>本机尚未同步 · 已选${d.progress.answers.filter(a=>a.choice).length}题</p><button data-draft="${i}" class="secondary">恢复本机未同步草稿</button></div>`).join('')||'<p>暂无待同步草稿。</p>';$('#draft-list').querySelectorAll('[data-draft]').forEach(b=>b.onclick=()=>run(async()=>{const d=drafts[Number(b.dataset.draft)];await openAttempt(d.attemptId,false,d);}));
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
 destroy();const r=await api('GET',scope==='all'?`/admin/reports/${id}`:`/reports/${id}`);reportScope=scope;show('report-view');message('');renderReport(r,{mountRelatedQuestions:mountRelated});$('#report-owner').hidden=!r.ownerUsername;$('#report-owner').textContent=r.ownerUsername?`考生：${r.ownerUsername}`:'';
}
$('#login-form').onsubmit=e=>{e.preventDefault();run(async()=>{const form=e.currentTarget;const data=new FormData(form);const result=await api('POST','/auth/login',{username:data.get('username'),password:data.get('password')});clearAccountViews();form.reset();setCsrf(result.csrf);user=result.user;bank.setUser(user);contentBank.setUser(user);$('#account-name').textContent=user.username;$('#logout').hidden=false;$('#open-admin').hidden=user.role!=='admin';$('#open-all-reports').hidden=user.role!=='admin';await home();});};
$('#logout').onclick=()=>run(async()=>{if(sync){sync.stop();sync.persist();}if(sync&&!sync.frozen){try{await sync.flush('pause');}catch{message('进度尚未同步，已保留本机备份。');}}await api('POST','/auth/logout',{});clearAccountViews();setCsrf('');user=null;$('#account-name').textContent='';$('#logout').hidden=true;show('login-view');message('已退出；未同步内容仍保存在原账号的本机缓存中。');});
$('#brand-home').onclick=()=>run(()=>user?home():Promise.resolve(show('login-view')));document.querySelectorAll('[data-home]').forEach(b=>b.onclick=()=>run(home));
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
$('#open-import').onclick=()=>{show('import-view');message('');};
$('#legacy-file').onchange=()=>run(async()=>{const file=$('#legacy-file').files[0];if(!file)return;if(file.size>700000)throw Error('文件超过700KB，请分批导入。');preview=await api('POST','/legacy-import/preview',{raw:await file.text()});$('#import-preview').innerHTML=`<p>原始JSON已在服务器私有目录备份，发现${preview.records.length}份记录。</p>`+preview.records.map(r=>`<label class="import-row"><span><input type="checkbox" data-import-index="${r.index}" ${r.duplicate?'disabled':'checked'}> ${r.duplicate?'已存在/重复':'可导入'} · ${date(r.submittedAt)} · 已答${r.answered}题 · 原分数${r.originalScore??'未记录'}/复算${r.calculatedScore}</span><span>用时 ${duration(r.effectiveMs)}。${r.warnings.map(escape).join('；')}</span></label>`).join('');$('#import-ack').checked=false;$('#import-ack-label').hidden=false;$('#confirm-import').hidden=false;});
$('#confirm-import').onclick=()=>run(async()=>{const indexes=[...document.querySelectorAll('[data-import-index]:checked:not(:disabled)')].map(e=>Number(e.dataset.importIndex));if(!indexes.length)throw Error('没有可导入的选中记录。');const r=await api('POST','/legacy-import/confirm',{previewId:preview.previewId,indexes,acknowledgeWarnings:$('#import-ack').checked});message(`已导入${r.imported}份，跳过${r.skipped}份重复记录。`);$('#confirm-import').hidden=true;await showReports();});
async function adminView(){show('admin-view');const data=await api('GET','/admin/users');$('#user-list').innerHTML=data.users.map(u=>`<form class="user-card" data-user-id="${u.id}"><b>${escape(u.username)} · ${escape(u.role)}</b><label>新密码<input name="password" type="password" minlength="10" maxlength="256" autocomplete="new-password" required></label><button class="secondary">重置密码并注销旧会话</button></form>`).join('');$('#user-list').querySelectorAll('form').forEach(f=>f.onsubmit=e=>{e.preventDefault();run(async()=>{if(!confirm('重置后该账号所有旧登录状态失效，确认？'))return;await api('POST',`/admin/users/${f.dataset.userId}/reset-password`,{password:new FormData(f).get('password')});f.reset();message('密码已重置，旧会话已注销。');});});}
$('#open-admin').onclick=()=>run(adminView);$('#create-user-form').onsubmit=e=>{e.preventDefault();const form=e.currentTarget;run(async()=>{const data=new FormData(form);await api('POST','/admin/users',{username:data.get('username'),password:data.get('password'),role:'user'});form.reset();await adminView();message('普通用户已创建。');});};
await run(async()=>{try{const result=await api('GET','/auth/me');setCsrf(result.csrf);user=result.user;bank.setUser(user);contentBank.setUser(user);$('#account-name').textContent=user.username;$('#logout').hidden=false;$('#open-admin').hidden=user.role!=='admin';$('#open-all-reports').hidden=user.role!=='admin';await home();}catch(e){show('login-view');if(e.code==='NETWORK_ERROR')message('当前无法连接服务器。原有待同步缓存仍保留，联网后重新登录继续。');}});
