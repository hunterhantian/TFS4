import Fastify from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {openDatabase,projectRoot} from './db.mjs';
import {token,hashToken,hashPassword,verifyPassword,createUser,fail,exact,string,integer} from './security.mjs';
import {ownedAttempt,visibleAttempt,checkLease,checkedProgress,makeReport,nowIso,settlePending,archiveTitle} from './domain.mjs';
import {serveAudio} from '../scripts/audio-route.mjs';
import {archiveFilters,queryArchives} from './archive-filters.mjs';
import {registerLegacy} from './legacy.mjs';
import {registerBankImports} from './bank-import.mjs';
import {registerBank} from './bank.mjs';
import {registerApprovedBank} from './approved-bank.mjs';
import {registerStage2} from './stage2.mjs';
export async function createApp(options={}){
 const production=options.production??process.env.NODE_ENV==='production';
 const publicOrigin=options.publicOrigin||process.env.PUBLIC_ORIGIN||'http://127.0.0.1:4174';
 if(production&&!publicOrigin.startsWith('https://'))throw Error('Production requires an HTTPS PUBLIC_ORIGIN');
 const lanOrigin=!production?(options.lanOrigin||process.env.LAN_ORIGIN||null):null;
 const db=options.db||openDatabase(options.dbFile||process.env.DB_FILE||path.join(projectRoot,'.local/stage1/app.sqlite'));
 const backupDir=path.resolve(options.backupDir||process.env.BACKUP_DIR||path.join(projectRoot,'.local/stage1/backups'));
 for(const publicDir of ['web','dist'])if(backupDir.toLowerCase()===path.join(projectRoot,publicDir).toLowerCase()||backupDir.toLowerCase().startsWith(path.join(projectRoot,publicDir).toLowerCase()+path.sep))throw Error('Backups must be outside public directories');
 fs.mkdirSync(backupDir,{recursive:true,mode:0o700});
 const now=options.now||Date.now;const leaseMs=options.leaseMs||600000;const sessionMs=options.sessionMs||12*3600000;
 const app=Fastify({logger:options.logger||false,trustProxy:production?'127.0.0.1':false,bodyLimit:1024*1024,requestTimeout:15000,genReqId:()=>randomUUID()});
 const cookieName=production?'__Host-rsz_session':'rsz_session';
 const cookie=(value,maxAge)=>`${cookieName}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${production?'; Secure':''}`;
 const dummyHash=await hashPassword(token());const failures=new Map();
 app.decorate('db',db);app.decorateRequest('account',null);app.decorateRequest('sessionHash',null);app.decorateRequest('csrf',null);
 app.setErrorHandler((e,req,reply)=>{const status=e.statusCode>=400&&e.statusCode<500?e.statusCode:500;const code=status===500?'INTERNAL_ERROR':e.code||'INVALID_INPUT';if(status===500)req.log.error({code,requestId:req.id},'Request failed');reply.code(status).send({error:{code,message:status===500?'服务暂不可用，请保留待同步内容':e.message},requestId:req.id});});
 app.addHook('onRequest',async(req,reply)=>{
  reply.header('X-Content-Type-Options','nosniff').header('Referrer-Policy','same-origin').header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; media-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  if(req.url.startsWith('/api/'))reply.header('Cache-Control','no-store');
  if(req.url.startsWith('/api/')&&!['GET','HEAD'].includes(req.method)&&req.headers.origin!==publicOrigin&&req.headers.origin!==lanOrigin)fail(403,'ORIGIN_REJECTED','请求来源不受信任');
 });
 app.addHook('preHandler',async(req)=>{
  if(!req.url.startsWith('/api/')||['/api/health','/api/auth/login'].includes(req.url.split('?')[0]))return;
  const raw=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);
  if(!raw||!/^[a-f0-9]{64}$/.test(raw))fail(401,'UNAUTHENTICATED');
  const hash=hashToken(raw);const session=db.prepare('SELECT s.*,u.username,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE token_hash=? AND expires_at>?').get(hash,now());
  if(!session)fail(401,'UNAUTHENTICATED');
  req.account={id:session.user_id,username:session.username,role:session.role};req.sessionHash=hash;req.csrf=session.csrf;
  if(!['GET','HEAD'].includes(req.method)&&req.headers['x-csrf-token']!==session.csrf)fail(403,'CSRF_REJECTED');
 });
 const admin=req=>{if(req.account.role!=='admin')fail(403,'ADMIN_REQUIRED');};
 registerBankImports(app,{db,admin});
 registerBank(app,{db,admin});
 registerApprovedBank(app,{db,admin});
 registerStage2(app,{db,admin});
 const reportTitle=r=>{const p=JSON.parse(r.payload);return ['2025 法语专四考试','导入的本机考试存档'].includes(r.title)?archiveTitle(p.sourceTitle||'2025 法语专四考试',p.submittedAt):r.title;};
 const report=(id,owner)=>{const r=db.prepare('SELECT * FROM reports WHERE id=? AND owner_id=?').get(id,owner);if(!r)fail(404,'NOT_FOUND');return {id:r.id,title:reportTitle(r),...JSON.parse(r.payload)};};
 app.get('/api/health',async()=>({ok:db.prepare('SELECT 1 AS ok').get().ok===1}));
 app.post('/api/auth/login',async(req,reply)=>{
  exact(req.body,['username','password']);string(req.body.username,1,64);string(req.body.password,1,256);
  const key=`account:${req.ip}:${req.body.username}`,ipKey=`ip:${req.ip}`;const clock=now();for(const [k,v] of failures)if(v.until<=clock)failures.delete(k);
  const attempts=failures.get(key)||{count:0,until:clock+15*60000};const ipAttempts=failures.get(ipKey)||{count:0,until:clock+15*60000};if(attempts.count>=10||ipAttempts.count>=60)fail(429,'LOGIN_RATE_LIMIT','登录尝试过多，请稍后再试');attempts.count++;ipAttempts.count++;failures.set(key,attempts);failures.set(ipKey,ipAttempts);
  const user=db.prepare('SELECT * FROM users WHERE username=?').get(req.body.username);
  const valid=await verifyPassword(req.body.password,user?.password_hash||dummyHash);if(!user||!valid)fail(401,'INVALID_CREDENTIALS','用户名或密码错误');
  const t=token(),csrf=token();db.transaction(()=>{db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(clock);db.prepare('INSERT INTO sessions VALUES (?,?,?,?)').run(hashToken(t),user.id,csrf,clock+sessionMs);})();
  failures.delete(key);reply.header('Set-Cookie',cookie(t,Math.floor(sessionMs/1000)));return {user:{id:user.id,username:user.username,role:user.role},csrf};
 });
 app.get('/api/auth/me',async req=>({user:req.account,csrf:req.csrf}));
 app.post('/api/auth/logout',async(req,reply)=>{exact(req.body||{},[],[]);db.prepare('DELETE FROM sessions WHERE token_hash=?').run(req.sessionHash);reply.header('Set-Cookie',cookie('',0));return {ok:true};});
 app.get('/api/admin/users',async req=>{admin(req);return {users:db.prepare('SELECT id,username,role,created_at AS createdAt FROM users ORDER BY created_at').all()};});
 app.post('/api/admin/users',async req=>{admin(req);exact(req.body,['username','password','role'],['username','password']);return {user:await createUser(db,req.body.username,req.body.password,req.body.role||'user')};});
 app.post('/api/admin/users/:id/reset-password',async req=>{
  admin(req);exact(req.body,['password']);string(req.body.password,10,256);const hash=await hashPassword(req.body.password);
  db.transaction(()=>{if(!db.prepare('SELECT id FROM users WHERE id=?').get(req.params.id))fail(404,'NOT_FOUND');db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hash,req.params.id);db.prepare('DELETE FROM sessions WHERE user_id=?').run(req.params.id);})();return {ok:true};
 });
 app.get('/api/sources',async()=>({sources:db.prepare('SELECT id,payload FROM sources').all().map(r=>{const p=JSON.parse(r.payload);return {id:r.id,year:p.year,title:p.title,total:p.questions.length};})}));
 app.get('/api/attempts',async req=>({attempts:db.prepare("SELECT id,status,mode,revision,created_at AS createdAt FROM attempts WHERE owner_id=? AND status!='submitted' ORDER BY created_at DESC").all(req.account.id)}));
 app.post('/api/attempts',async req=>{
  exact(req.body,['sourceId','mode','deviceId','requestId']);string(req.body.sourceId,1,128);string(req.body.deviceId,1,128);string(req.body.requestId,1,128);if(req.body.mode!=='full')fail(422,'MODE_NOT_AVAILABLE');
  return db.transaction(()=>{
   const existing=db.prepare('SELECT id FROM attempts WHERE owner_id=? AND request_id=?').get(req.account.id,req.body.requestId);if(existing)return visibleAttempt(ownedAttempt(db,existing.id,req.account.id));
   const source=db.prepare('SELECT * FROM sources WHERE id=?').get(req.body.sourceId);if(!source)fail(422,'SOURCE_UNAVAILABLE');
   const snapshot={...JSON.parse(source.payload),sourceRevision:source.revision};const id=token(),date=nowIso();const progress={answers:[],position:0,effectiveMs:0,materialTimes:{}};
   db.prepare('INSERT INTO attempts(id,owner_id,request_id,mode,origin,status,created_at,started_at,revision,lease_device,lease_until,snapshot,progress) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,req.account.id,req.body.requestId,'full','ordinary','active',date,date,0,req.body.deviceId,now()+leaseMs,JSON.stringify(snapshot),JSON.stringify(progress));return visibleAttempt(ownedAttempt(db,id,req.account.id));
  })();
 });
 app.get('/api/attempts/:id',async req=>visibleAttempt(ownedAttempt(db,req.params.id,req.account.id)));
 const save=(req,action)=>db.transaction(()=>{
  const allowed=['expectedRevision','deviceId','answers','position','effectiveMs','materialTimes',...(action==='submit'?['requestId','confirmIncomplete']:[])];allowed.push('pendingTiming','timingMode');exact(req.body,allowed,allowed.filter(k=>!['confirmIncomplete','pendingTiming','timingMode'].includes(k)));
  if(action==='submit')string(req.body.requestId,1,128);
  const a=ownedAttempt(db,req.params.id,req.account.id);
  if(action==='submit'&&a.status==='submitted'){const r=db.prepare('SELECT id FROM reports WHERE attempt_id=?').get(a.id);return {reportId:r.id};}
  checkLease(a,req.body,now());const progress=checkedProgress(a,req.body);if(action==='pause'||action==='submit')settlePending(progress);const date=nowIso();
  if(action==='submit'&&progress.answers.filter(r=>r.choice).length<a.snapshot.questions.length&&req.body.confirmIncomplete!==true)fail(400,'CONFIRM_INCOMPLETE','请确认提交不完整试卷');
  const submitted=action==='submit',paused=action==='pause';
  db.prepare('UPDATE attempts SET progress=?,revision=revision+1,status=?,submitted_at=?,lease_device=?,lease_until=? WHERE id=?').run(JSON.stringify(progress),submitted?'submitted':paused?'paused':'active',submitted?date:null,submitted||paused?null:req.body.deviceId,submitted||paused?null:now()+leaseMs,a.id);
  if(!submitted)return visibleAttempt(ownedAttempt(db,a.id,req.account.id));
  const final=ownedAttempt(db,a.id,req.account.id);const payload=makeReport(final);const reportId=token();
  db.prepare('INSERT INTO reports(id,attempt_id,owner_id,title,payload,created_at) VALUES (?,?,?,?,?,?)').run(reportId,a.id,req.account.id,archiveTitle(a.snapshot.title,date),JSON.stringify(payload),date);
  for(const item of payload.items){
   const prior=db.prepare('SELECT id FROM response_events WHERE owner_id=? AND question_id=? AND choice IS NOT NULL ORDER BY rowid DESC LIMIT 1').get(req.account.id,item.question.id);const count=db.prepare('SELECT COUNT(*) AS n FROM response_events WHERE owner_id=? AND question_id=? AND choice IS NOT NULL').get(req.account.id,item.question.id).n;const eventId=token();
   db.prepare('INSERT INTO response_events VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(eventId,req.account.id,a.id,item.question.id,item.question.version,item.question.answer.version,item.question.formalPart,item.question.component,item.choice,item.confidence,item.effectiveMs,item.result,date,a.origin,count,prior?.id||null);
   if(item.result==='wrong')db.prepare('INSERT INTO error_events VALUES (?,?,?)').run(token(),eventId,date);
  }
  return {reportId};
 })();
 app.patch('/api/attempts/:id/progress',async req=>save(req,'progress'));
 app.post('/api/attempts/:id/pause',async req=>save(req,'pause'));
 app.post('/api/attempts/:id/submit',async req=>save(req,'submit'));
 for(const action of ['resume','takeover'])app.post(`/api/attempts/:id/${action}`,async req=>{
  exact(req.body,['expectedRevision','deviceId',...(action==='takeover'?['confirmed']:[])]);integer(req.body.expectedRevision);string(req.body.deviceId,1,128);if(action==='takeover'&&req.body.confirmed!==true)fail(400,'CONFIRM_TAKEOVER');
  return db.transaction(()=>{const a=ownedAttempt(db,req.params.id,req.account.id);if(a.status==='submitted')fail(409,'ALREADY_SUBMITTED');if(a.revision!==req.body.expectedRevision)fail(409,'REVISION_CONFLICT');if(action!=='takeover'&&a.lease_device&&a.lease_device!==req.body.deviceId&&a.lease_until>now())fail(409,'LEASE_CONFLICT','另一台设备正在作答，需要明确接管');db.prepare("UPDATE attempts SET status='active',revision=revision+1,lease_device=?,lease_until=? WHERE id=?").run(req.body.deviceId,now()+leaseMs,a.id);return visibleAttempt(ownedAttempt(db,a.id,req.account.id));})();
 });
 const reportSummary=r=>{const p=JSON.parse(r.payload),theme=p.sourceTitle||(p.sourceId==='tfs4-2025'?'2025 法语专四考试':null);const customTitle=theme&&!['2025 法语专四考试','导入的本机考试存档'].includes(r.title)&&r.title!==archiveTitle(theme,p.submittedAt)?r.title:null;return {id:r.id,title:reportTitle(r),theme:theme||r.title,customTitle,mode:p.mode||(p.sourceId==='tfs4-2025'?'full':null),createdAt:r.created_at,submittedAt:p.submittedAt,attemptId:p.attemptId,stats:p.stats,origin:p.origin};};
 app.get('/api/reports',async req=>{const filters=archiveFilters(req.query,now());return {filters,reports:queryArchives(db,filters,req.account.id).map(reportSummary)};});
 app.get('/api/reports/:id',async req=>report(req.params.id,req.account.id));
 app.patch('/api/reports/:id',async req=>{exact(req.body,['title']);string(req.body.title,1,100);report(req.params.id,req.account.id);db.prepare('UPDATE reports SET title=? WHERE id=? AND owner_id=?').run(req.body.title,req.params.id,req.account.id);return report(req.params.id,req.account.id);});
 app.get('/api/admin/reports',async req=>{admin(req);const filters=archiveFilters(req.query,now(),true);return {filters,reports:queryArchives(db,filters,filters.ownerId).map(r=>({...reportSummary(r),ownerId:r.owner_id,ownerUsername:r.ownerUsername}))};});
 app.get('/api/admin/reports/:id',async req=>{admin(req);const r=db.prepare('SELECT r.*,u.username AS ownerUsername FROM reports r JOIN users u ON u.id=r.owner_id WHERE r.id=?').get(req.params.id);if(!r)fail(404,'NOT_FOUND');return {id:r.id,title:reportTitle(r),ownerUsername:r.ownerUsername,...JSON.parse(r.payload)};});
 registerLegacy(app,{db,backupDir,now});
 app.get('/media/2025-listening.mp3',async(req,reply)=>{reply.hijack();serveAudio(req.raw,reply.raw,options.audioFile||process.env.AUDIO_FILE||path.join(projectRoot,'.local/media/2025-listening.mp3'));});
 const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
 app.get('/*',async(req,reply)=>{
  const name=req.params['*']||'index.html';const root=path.join(projectRoot,'web');const file=path.resolve(root,name);if(!file.startsWith(root+path.sep)||!mime[path.extname(file)]||!fs.existsSync(file)||!fs.statSync(file).isFile())fail(404,'NOT_FOUND');
  reply.header('Cache-Control','no-cache').type(mime[path.extname(file)]);return fs.createReadStream(file);
 });
 app.addHook('onClose',async()=>{if(!options.db)db.close();});return app;
}
