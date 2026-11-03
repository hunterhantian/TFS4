import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {miniCatalog} from '../server/mini-exam.mjs';
import {openDatabase} from '../server/db.mjs';
import {createUser} from '../server/security.mjs';
import {createApp} from '../server/app.mjs';

test('each mini plan covers one sitting exactly once and keeps passages together',()=>{
 const catalog=miniCatalog();assert.equal(catalog.length,21);
 for(const c of catalog){const sheets=c.sheets;assert.equal(sheets.length,5);const qs=sheets.flatMap(s=>s.snapshot.questions);assert.equal(qs.length,100);assert.equal(new Set(qs.map(q=>q.id)).size,100);for(const s of sheets){const q=s.snapshot.questions;assert.equal(q.filter(x=>x.component==='grammar').length,8);assert.equal(q.filter(x=>x.component==='lexical').length,2);assert.equal(q.filter(x=>x.component==='cloze').length,s.number===1?10:0);assert.equal(q.filter(x=>x.component==='reading').length,s.number===1?0:5);assert.equal(q.filter(x=>x.component==='verb_blank').length,s.number===1?0:5);const grouped=q.filter(x=>['cloze','reading'].includes(x.component));assert.equal(new Set(grouped.map(x=>x.materialId)).size,1);} }
 for(const y of ['2010','2012','2013','2014'])assert.ok(miniCatalog().find(c=>c.sitting===y).sheets.every(s=>s.available),y);
});
test('mini persists assignments, text responses, resumes and hides answers during tests',async()=>{
 const db=openDatabase(':memory:'),app=await createApp({db});try{await createUser(db,'mini-test','testing-password','user');const origin='http://127.0.0.1:4174';const login=await app.inject({method:'POST',url:'/api/auth/login',headers:{origin},payload:{username:'mini-test',password:'testing-password'}});const headers={origin,cookie:login.headers['set-cookie'].split(';')[0],'x-csrf-token':login.json().csrf};const create=(n,requestId)=>app.inject({method:'POST',url:'/api/attempts',headers,payload:{sourceId:'2023:'+n,mode:'mini',deviceId:'dev',requestId}});const result=await create(2,'first');assert.equal(result.statusCode,200,result.body);const a=result.json();assert.equal(a.questions.length,20);assert.ok(a.questions.every(q=>!('answer' in q)));assert.equal((await create(2,'duplicate')).json().id,a.id);const q=a.questions.find(q=>q.responseType==='text');assert.ok(q);const payload={expectedRevision:a.revision,deviceId:'dev',answers:[{questionId:q.id,choice:'je suis',confidence:null,effectiveMs:100}],position:a.questions.indexOf(q),effectiveMs:100,materialTimes:{[q.materialId]:100},timingMode:'automatic-answer-interval-v1',pendingTiming:null};const paused=await app.inject({method:'POST',url:`/api/attempts/${a.id}/pause`,headers,payload});assert.equal(paused.statusCode,200,paused.body);assert.equal(paused.json().progress.answers[0].choice,'je suis');const plan=await app.inject({url:'/api/mini-sittings/2023',headers});assert.equal(plan.statusCode,200);assert.equal(plan.json().sheets[1].status,'paused');assert.equal(plan.json().sheets[1].answered,1);assert.equal(db.prepare('select count(*) n from mini_assignments').get().n,1);const legacyPlan=JSON.parse(db.prepare('select payload from mini_assignments').get().payload);legacyPlan.revision='old-version';legacyPlan.sheets[0].available=false;legacyPlan.sheets[0].issues=['旧版空位缺失'];db.prepare('update mini_assignments set payload=?,revision=?').run(JSON.stringify(legacyPlan),'old-version');const refreshed=await app.inject({url:'/api/mini-sittings/2023',headers});assert.equal(refreshed.json().sheets[0].available,true);assert.equal((await create(2,'reuse-frozen')).json().id,a.id);const resumed=await app.inject({method:'POST',url:`/api/attempts/${a.id}/resume`,headers,payload:{expectedRevision:paused.json().revision,deviceId:'dev'}});assert.equal(resumed.statusCode,200);const submitted=await app.inject({method:'POST',url:`/api/attempts/${a.id}/submit`,headers,payload:{...payload,expectedRevision:resumed.json().revision,requestId:'submit',confirmIncomplete:true}});assert.equal(submitted.statusCode,200,submitted.body);const report=await app.inject({url:'/api/reports/'+submitted.json().reportId,headers});assert.equal(report.json().mode,'mini');assert.equal(report.json().referenceStatus,'user-reference-v1');assert.equal(report.json().stats.answered,1);assert.equal(report.json().stats.unanswered,19);assert.equal(db.prepare('select count(*) n from response_events').get().n,20);assert.equal(db.prepare("select count(*) n from response_events where result='unanswered'").get().n,19);assert.equal(db.prepare('select count(*) n from error_events').get().n,report.json().items.filter(i=>i.result==='wrong').length);assert.equal(report.json().stats.verb.total,5);const after=await app.inject({url:'/api/mini-sittings/2023',headers});assert.equal(after.json().sheets[1].status,'submitted');
 }finally{await app.close();db.close();}
});
test('all Mini verb inputs have a uniquely numbered blank in their passage',()=>{
 const catalog=miniCatalog();let count=0;
 for(const c of catalog)for(const sheet of c.sheets){
  for(const q of sheet.snapshot.questions.filter(q=>q.responseType==='text')){
   const material=sheet.snapshot.materials.find(m=>m.id===q.materialId);assert.ok(material, q.id);
   const raw=material.text.replace(/<\/?u>/gi,'').replace(/\\_/g,'_');
   const markers=[...raw.matchAll(/(?:_{2,}\s*\(?(\d+)\)?\s*_{2,}|\((\d+)\))/g)].map(m=>Number(m[1]||m[2]));
   assert.equal(markers.filter(n=>n===q.originalNo).length,1,q.id);assert.equal(sheet.available,true,q.id);count++;
  }
 }
 assert.equal(count,420);
 const sheet=catalog.find(c=>c.sitting==='2012').sheets[1];const q=sheet.snapshot.questions.find(q=>q.id==='2012-V01');const passage=sheet.snapshot.materials.find(m=>m.id===q.materialId).text;assert.match(passage,/\(raconter\)\s*__\(1\)__\s*<u>-moi<\/u>/);
});
test('Mini blocks verb sheets when passage numbering cannot be mapped safely',()=>{
 const source=JSON.parse(fs.readFileSync('.local/synthesis/snapshot.json','utf8'));
 for(const item of source.items.filter(i=>/^2007-V\d+$/.test(i.mapping.itemId)))item.mapping.material.text=item.mapping.material.text.replace(/(?:\\_){3,}/,'');
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'mini-unsafe-'));try{const file=path.join(tmp,'snapshot.json');fs.writeFileSync(file,JSON.stringify(source));const paper=miniCatalog(file).find(c=>c.sitting==='2007');assert.equal(paper.sheets[0].available,true);for(const sheet of paper.sheets.slice(1)){assert.equal(sheet.available,false);assert.ok(sheet.issues.some(i=>i.includes('编号无法可靠匹配')));}}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('Mini verb grading records correct and wrong responses and is idempotent',async()=>{
 const db=openDatabase(':memory:'),app=await createApp({db});try{
  await createUser(db,'verb-grade-test','testing-password','user');const origin='http://127.0.0.1:4174';const login=await app.inject({method:'POST',url:'/api/auth/login',headers:{origin},payload:{username:'verb-grade-test',password:'testing-password'}});const headers={origin,cookie:login.headers['set-cookie'].split(';')[0],'x-csrf-token':login.json().csrf};
  const create=await app.inject({method:'POST',url:'/api/attempts',headers,payload:{sourceId:'2017:2',mode:'mini',deviceId:'dev',requestId:'verb-create'}});assert.equal(create.statusCode,200,create.body);const a=create.json();const target=a.questions.find(q=>q.id==='2017-V04'),other=a.questions.find(q=>q.id==='2017-V05');assert.ok(target&&other);
  const payload={expectedRevision:a.revision,deviceId:'dev',answers:[{questionId:target.id,choice:'satisfasse',confidence:null,effectiveMs:0},{questionId:other.id,choice:'incorrect',confidence:null,effectiveMs:0}],position:0,effectiveMs:0,materialTimes:{[target.materialId]:0},timingMode:'automatic-answer-interval-v1',requestId:'submit',confirmIncomplete:true};
  const submitted=await app.inject({method:'POST',url:`/api/attempts/${a.id}/submit`,headers,payload});assert.equal(submitted.statusCode,200,submitted.body);const report=(await app.inject({url:'/api/reports/'+submitted.json().reportId,headers})).json();assert.equal(report.items.find(i=>i.question.id===target.id).result,'correct');assert.equal(report.items.find(i=>i.question.id===other.id).result,'wrong');assert.equal(report.stats.verb.correct,1);assert.equal(report.stats.verb.wrong,1);assert.equal(report.stats.verb.unanswered,3);assert.equal(db.prepare('select count(*) n from error_events').get().n,1);
  assert.equal((await app.inject({method:'POST',url:`/api/attempts/${a.id}/submit`,headers,payload})).statusCode,200);assert.equal(db.prepare('select count(*) n from error_events').get().n,1);
 }finally{await app.close();db.close();}
});
test('v1.0 sends unresolved nonmatching fill answers to manual review without creating wrong events',async()=>{
 const db=openDatabase(':memory:'),app=await createApp({db});try{
  await createUser(db,'verb-v1-review','testing-password','user');const origin='http://127.0.0.1:4174';const login=await app.inject({method:'POST',url:'/api/auth/login',headers:{origin},payload:{username:'verb-v1-review',password:'testing-password'}});const headers={origin,cookie:login.headers['set-cookie'].split(';')[0],'x-csrf-token':login.json().csrf};
  const result=await app.inject({method:'POST',url:'/api/attempts',headers,payload:{sourceId:'2023:2',mode:'mini',deviceId:'dev',requestId:'v1-create'}});assert.equal(result.statusCode,200,result.body);const a=result.json(),q=a.questions.find(q=>q.id==='2023-V03');assert.ok(q);
  const payload={expectedRevision:a.revision,deviceId:'dev',answers:[{questionId:q.id,choice:'another answer',confidence:null,effectiveMs:0}],position:0,effectiveMs:0,materialTimes:{[q.materialId]:0},timingMode:'automatic-answer-interval-v1',requestId:'submit',confirmIncomplete:true};
  const submit=await app.inject({method:'POST',url:`/api/attempts/${a.id}/submit`,headers,payload});assert.equal(submit.statusCode,200,submit.body);const report=(await app.inject({url:'/api/reports/'+submit.json().reportId,headers})).json();assert.equal(report.items.find(i=>i.question.id===q.id).result,'manual');assert.equal(report.stats.verb.manual,1);assert.equal(db.prepare('select count(*) n from error_events').get().n,0);
 }finally{await app.close();db.close();}
});
