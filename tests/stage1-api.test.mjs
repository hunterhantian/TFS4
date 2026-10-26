import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openDatabase,seedBaseline} from '../server/db.mjs';
import {createUser} from '../server/security.mjs';
import {createApp} from '../server/app.mjs';
const origin='http://127.0.0.1:4174';const password='Test-only-strong-password-42';
async function fixture(fn,extra={}){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rsz-stage1-'));const db=openDatabase(extra.disk?path.join(dir,'app.sqlite'):':memory:');seedBaseline(db);const app=await createApp({db,backupDir:dir,...extra});try{await createUser(db,'admin',password,'admin');await createUser(db,'alice',password);await createUser(db,'bob',password);const login=async username=>{const r=await app.inject({method:'POST',url:'/api/auth/login',headers:{origin},payload:{username,password}});assert.equal(r.statusCode,200,r.body);return {cookie:r.headers['set-cookie'].split(';')[0],csrf:r.json().csrf};};const alice=await login('alice'),bob=await login('bob'),admin=await login('admin');const call=(who,method,url,payload)=>app.inject({method,url,headers:{origin,cookie:who.cookie,'x-csrf-token':who.csrf},...(payload?{payload}:{})});await fn({app,db,dir,alice,bob,admin,call,login});}finally{await app.close();db.close();fs.rmSync(dir,{recursive:true,force:true});}}
const create=(call,user,requestId='create-1',deviceId='device-a')=>call(user,'POST','/api/attempts',{sourceId:'tfs4-2025',mode:'full',deviceId,requestId});
const progress=(a,answers=[],extra={})=>({expectedRevision:a.revision,deviceId:'device-a',answers,position:0,effectiveMs:1000,materialTimes:{},...extra});
const response=(no,choice,confidence=null)=>({questionId:`tfs4-2025-q${no}`,choice,confidence,effectiveMs:null});
test('sessions, CSRF, admin permissions, reset revocation and private static paths',async()=>fixture(async({app,db,alice,bob,admin,call})=>{
 assert.equal((await app.inject('/api/attempts')).statusCode,401);
 assert.equal((await app.inject({method:'POST',url:'/api/auth/login',payload:{username:'alice',password}})).statusCode,403);
 assert.equal((await app.inject({method:'POST',url:'/api/auth/logout',headers:{origin,cookie:alice.cookie},payload:{}})).statusCode,403);
 assert.equal((await call(alice,'POST','/api/admin/users',{username:'intruder',password})).statusCode,403);
 assert.equal((await call(admin,'POST','/api/admin/users',{username:'new-user',password,role:'user'})).statusCode,200);
 const bobId=db.prepare('SELECT id FROM users WHERE username=?').get('bob').id;
 assert.equal((await call(admin,'POST',`/api/admin/users/${bobId}/reset-password`,{password:'Reset-only-password-43'})).statusCode,200);
 assert.equal((await call(bob,'GET','/api/auth/me')).statusCode,401);
 assert.ok(!db.prepare('SELECT password_hash FROM users WHERE username=?').get('alice').password_hash.includes(password));
 for(const url of ['/exam-data.js','/dist/exam-data.js','/data/2025-candidate.json','/.local/stage1/app.sqlite','/server/app.mjs'])assert.equal((await app.inject(url)).statusCode,404,url);
 assert.equal((await call(alice,'POST','/api/auth/logout',{})).statusCode,200);assert.equal((await call(alice,'GET','/api/auth/me')).statusCode,401);
}));
test('frozen attempt, answer secrecy, account isolation, revisions, leases and takeover',async()=>fixture(async({db,alice,bob,call})=>{
 const first=await create(call,alice);assert.equal(first.statusCode,200,first.body);let a=first.json();assert.equal(a.questions.length,100);assert.ok(a.questions.every(q=>!('answer'in q)&&!('knowledgeLinks'in q)));
 assert.equal((await create(call,alice)).json().id,a.id);assert.equal((await call(bob,'GET',`/api/attempts/${a.id}`)).statusCode,404);
 assert.equal((await call(alice,'POST',`/api/attempts/${a.id}/resume`,{expectedRevision:a.revision,deviceId:'device-b'})).statusCode,409);
 const saved=await call(alice,'PATCH',`/api/attempts/${a.id}/progress`,progress(a,[response(1,'B','certain')]));assert.equal(saved.statusCode,200,saved.body);const old=a;a=saved.json();
 assert.equal((await call(alice,'PATCH',`/api/attempts/${a.id}/progress`,progress(old,[]))).statusCode,409);
 const takeover=await call(alice,'POST',`/api/attempts/${a.id}/takeover`,{expectedRevision:a.revision,deviceId:'device-b',confirmed:true});assert.equal(takeover.statusCode,200);const b=takeover.json();
 assert.equal((await call(alice,'PATCH',`/api/attempts/${a.id}/progress`,progress(a,[response(1,'A')]))).statusCode,409);
 assert.equal((await call(alice,'PATCH',`/api/attempts/${a.id}/progress`,progress(b,[response(1,'A')]))).statusCode,409);
 assert.equal((await call(alice,'GET',`/api/attempts/${a.id}`)).json().progress.answers[0].choice,'B');
 const frozen=JSON.parse(db.prepare('SELECT snapshot FROM attempts WHERE id=?').get(a.id).snapshot);assert.equal(frozen.questions[60].answer.value,'A');
 const payload=JSON.parse(db.prepare('SELECT payload FROM sources').get().payload);payload.questions[60].answer.value='D';db.prepare('UPDATE sources SET payload=?').run(JSON.stringify(payload));assert.equal(JSON.parse(db.prepare('SELECT snapshot FROM attempts WHERE id=?').get(a.id).snapshot).questions[60].answer.value,'A');
}));
test('atomic partial submit, report formulas, idempotence, repeat events and formal Parts',async()=>fixture(async({db,alice,bob,call})=>{
 let a=(await create(call,alice)).json();const body=progress(a,[response(1,'A','certain'),response(61,'A')],{requestId:'submit-1',confirmIncomplete:true});
 const denied=await call(alice,'POST',`/api/attempts/${a.id}/submit`,{...body,confirmIncomplete:false});assert.equal(denied.statusCode,400);assert.equal(db.prepare('SELECT COUNT(*) n FROM reports').get().n,0);
 const r=await call(alice,'POST',`/api/attempts/${a.id}/submit`,body);assert.equal(r.statusCode,200,r.body);assert.equal((await call(alice,'POST',`/api/attempts/${a.id}/submit`,body)).json().reportId,r.json().reportId);
 const report=(await call(alice,'GET',`/api/reports/${r.json().reportId}`)).json();assert.deepEqual(report.stats,{total:100,answered:2,correct:1,unanswered:98,totalAccuracy:0.01,answeredAccuracy:0.5});assert.equal(report.parts.find(p=>p.part==='IV').total,40);
 assert.equal(report.items[60].question.answer.value,'A');assert.equal((await call(bob,'GET',`/api/reports/${r.json().reportId}`)).statusCode,404);
 assert.equal(db.prepare('SELECT COUNT(*) n FROM error_events').get().n,1);assert.equal(db.prepare('SELECT COUNT(*) n FROM response_events').get().n,100);
 assert.equal((await call(alice,'PATCH',`/api/attempts/${a.id}/progress`,progress(a))).statusCode,409);
 assert.equal((await call(alice,'PATCH',`/api/reports/${r.json().reportId}`,{title:'我的考试'})).json().title,'我的考试');
 a=(await create(call,alice,'create-2')).json();await call(alice,'POST',`/api/attempts/${a.id}/submit`,progress(a,[response(1,'B')],{requestId:'submit-2',confirmIncomplete:true}));
 assert.equal(db.prepare("SELECT prior_count FROM response_events WHERE question_id='tfs4-2025-q1' ORDER BY rowid DESC LIMIT 1").get().prior_count,1);assert.equal(db.prepare('SELECT COUNT(*) n FROM error_events').get().n,1);
}));
test('progress validation, pause recovery and expired lease protect saved state',async()=>{
 let clock=Date.now();await fixture(async({alice,call})=>{
 let a=(await create(call,alice)).json();assert.equal((await call(alice,'PATCH',`/api/attempts/${a.id}/progress`,progress(a,[response(1,'D')]))).statusCode,400);
 assert.equal((await call(alice,'PATCH',`/api/attempts/${a.id}/progress`,{...progress(a),injected:true})).statusCode,400);
 a=(await call(alice,'POST',`/api/attempts/${a.id}/pause`,progress(a,[response(61,'A')],{materialTimes:{'listening-2025':1000}}))).json();assert.equal(a.status,'paused');
 a=(await call(alice,'POST',`/api/attempts/${a.id}/resume`,{expectedRevision:a.revision,deviceId:'device-a'})).json();
 assert.equal((await call(alice,'PATCH',`/api/attempts/${a.id}/progress`,progress(a,[],{materialTimes:{'listening-2025':1000}}))).statusCode,400);
 clock+=600001;assert.equal((await call(alice,'PATCH',`/api/attempts/${a.id}/progress`,progress(a,[response(61,'B')],{materialTimes:{'listening-2025':1000}}))).statusCode,409);
 a=(await call(alice,'POST',`/api/attempts/${a.id}/resume`,{expectedRevision:a.revision,deviceId:'device-a'})).json();assert.equal(a.progress.answers[0].choice,'A');
 },{now:()=>clock});
});
test('legacy raw backup, preview warnings, ownership and deduplicated confirmation',async()=>fixture(async({db,dir,alice,bob,call})=>{
 const raw=JSON.stringify([{submittedAt:1700000000000,score:1,answers:{61:{choice:'D'}}}]);const preview=await call(alice,'POST','/api/legacy-import/preview',{raw});assert.equal(preview.statusCode,200,preview.body);const p=preview.json();assert.equal(p.records[0].effectiveMs,null);assert.equal(p.records[0].calculatedScore,1);assert.equal(fs.readFileSync(path.join(dir,fs.readdirSync(dir)[0]),'utf8'),raw);
 const body={previewId:p.previewId,indexes:[0],acknowledgeWarnings:true};assert.equal((await call(bob,'POST','/api/legacy-import/confirm',body)).statusCode,404);
 assert.equal((await call(alice,'POST','/api/legacy-import/confirm',{...body,acknowledgeWarnings:false})).statusCode,400);
 const first=(await call(alice,'POST','/api/legacy-import/confirm',body)).json();assert.equal(first.imported,1);assert.equal((await call(alice,'POST','/api/legacy-import/confirm',body)).json().skipped,1);
 const report=(await call(alice,'GET',`/api/reports/${first.reportIds[0]}`)).json();assert.equal(report.origin,'legacy');assert.equal(report.effectiveMs,null);assert.equal(report.items[60].result,'correct');assert.equal(report.items[60].effectiveMs,null);assert.equal(db.prepare('SELECT COUNT(*) n FROM reports').get().n,1);
 assert.equal((await call(alice,'POST','/api/legacy-import/preview',{raw:'[{"answers":{"101":{"choice":"A"}}}]'})).statusCode,400);
}));
test('persistent database restart, migration checksum and consistent backup restore',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rsz-restore-'));const file=path.join(dir,'app.sqlite'),backup=path.join(dir,'backup.sqlite');let db;
 try{db=openDatabase(file);seedBaseline(db);await createUser(db,'restart-user',password);await db.backup(backup);db.close();db=openDatabase(file);assert.equal(db.prepare('SELECT username FROM users').get().username,'restart-user');db.close();db=openDatabase(backup);assert.equal(db.prepare('SELECT COUNT(*) n FROM sources').get().n,1);assert.equal(db.pragma('integrity_check',{simple:true}),'ok');db.prepare('UPDATE schema_migrations SET sha256=?').run('bad-hash');db.close();db=null;assert.throws(()=>openDatabase(backup),/Applied migration changed/);}finally{if(db?.open)db.close();fs.rmSync(dir,{recursive:true,force:true});}
});
test('20 independent accounts can save and submit without lost records',async()=>fixture(async({app,db,call})=>{
 const users=await Promise.all(Array.from({length:20},(_,i)=>createUser(db,`load-${i}`,password)));
 const actors=await Promise.all(users.map(async(u,i)=>{const login=await app.inject({method:'POST',url:'/api/auth/login',headers:{origin},payload:{username:u.username,password},remoteAddress:`127.0.0.${i+2}`});assert.equal(login.statusCode,200,login.body);return {cookie:login.headers['set-cookie'].split(';')[0],csrf:login.json().csrf};}));
 const created=await Promise.all(actors.map((who,i)=>create(call,who,`load-create-${i}`)));const attempts=created.map(r=>{assert.equal(r.statusCode,200,r.body);return r.json();});
 const saved=await Promise.all(actors.map((who,i)=>call(who,'PATCH',`/api/attempts/${attempts[i].id}/progress`,progress(attempts[i],[response(61,'A')]))));const versions=saved.map(r=>{assert.equal(r.statusCode,200,r.body);return r.json();});
 const submitted=await Promise.all(actors.map((who,i)=>call(who,'POST',`/api/attempts/${versions[i].id}/submit`,progress(versions[i],[response(61,'A')],{requestId:`load-submit-${i}`,confirmIncomplete:true}))));for(const r of submitted)assert.equal(r.statusCode,200,r.body);
 assert.equal(db.prepare('SELECT COUNT(*) n FROM reports').get().n,20);assert.equal(db.prepare('SELECT COUNT(*) n FROM response_events').get().n,2000);assert.equal(db.pragma('journal_mode',{simple:true}),'wal');
},{disk:true}));
test('consistent backup retains submitted report, events and saved answers after reopening',async()=>fixture(async({db,dir,alice,call})=>{
 const a=(await create(call,alice)).json();const submitted=await call(alice,'POST',`/api/attempts/${a.id}/submit`,progress(a,[response(61,'A','certain')],{requestId:'backup-submit',confirmIncomplete:true}));assert.equal(submitted.statusCode,200);
 const backup=path.join(dir,'recovery.sqlite');await db.backup(backup);const restored=openDatabase(backup);
 try{const report=JSON.parse(restored.prepare('SELECT payload FROM reports WHERE id=?').get(submitted.json().reportId).payload);assert.equal(report.stats.correct,1);assert.equal(report.items[60].choice,'A');assert.equal(restored.prepare('SELECT COUNT(*) n FROM response_events').get().n,100);assert.equal(JSON.parse(restored.prepare('SELECT progress FROM attempts WHERE id=?').get(a.id).progress).answers[0].confidence,'certain');assert.equal(restored.pragma('integrity_check',{simple:true}),'ok');const recoveredApp=await createApp({db:restored,backupDir:dir,publicOrigin:origin});try{const recovered=await recoveredApp.inject({url:'/api/reports',headers:{cookie:alice.cookie}});assert.equal(recovered.statusCode,200);assert.equal(recovered.json().reports[0].stats.correct,1);}finally{await recoveredApp.close();}}finally{restored.close();}
}));
test('login throttling, session expiry and invalid response shapes are rejected',async()=>{
 let clock=Date.now();await fixture(async({app,alice,call})=>{
 const a=(await create(call,alice)).json();assert.equal((await call(alice,'PATCH',`/api/attempts/${a.id}/progress`,progress(a,[response(1,['B'])]))).statusCode,400);
 for(let i=0;i<10;i++){const r=await app.inject({method:'POST',url:'/api/auth/login',headers:{origin},payload:{username:'missing',password:'wrong-pass'},remoteAddress:'10.0.0.55'});assert.equal(r.statusCode,401);}
 assert.equal((await app.inject({method:'POST',url:'/api/auth/login',headers:{origin},payload:{username:'missing',password:'wrong-pass'},remoteAddress:'10.0.0.55'})).statusCode,429);
 clock+=12*3600000+1;assert.equal((await call(alice,'GET','/api/auth/me')).statusCode,401);
 },{now:()=>clock});
});
test('production requires HTTPS and issues Secure HttpOnly host-only session cookie',async()=>{
 await assert.rejects(()=>createApp({production:true,publicOrigin:'http://example.test'}),/HTTPS/);
 const db=openDatabase(':memory:');const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rsz-prod-cookie-'));const app=await createApp({db,backupDir:dir,production:true,publicOrigin:'https://example.test'});
 try{await createUser(db,'secure-user',password);const r=await app.inject({method:'POST',url:'/api/auth/login',headers:{origin:'https://example.test'},payload:{username:'secure-user',password}});assert.equal(r.statusCode,200);assert.match(r.headers['set-cookie'],/^__Host-rsz_session=/);assert.match(r.headers['set-cookie'],/HttpOnly/);assert.match(r.headers['set-cookie'],/SameSite=Strict/);assert.match(r.headers['set-cookie'],/; Secure/);assert.ok(!r.headers['set-cookie'].includes('Domain='));}finally{await app.close();db.close();fs.rmSync(dir,{recursive:true,force:true});}
});
