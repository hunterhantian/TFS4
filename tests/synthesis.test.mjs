import test from 'node:test';
import assert from 'node:assert/strict';
import {openDatabase} from '../server/db.mjs';
import {createUser} from '../server/security.mjs';
import {createApp} from '../server/app.mjs';
import {loadSynthesis} from '../server/synthesis.mjs';
test('candidate snapshot supports scoped search without changing review or grading records',async()=>{
 const db=openDatabase(':memory:'),app=await createApp({db});try{
 await createUser(db,'admin-test','testing-password','admin');await createUser(db,'user-test','testing-password','user');
 async function login(username){const r=await app.inject({method:'POST',url:'/api/auth/login',headers:{origin:'http://127.0.0.1:4174'},payload:{username,password:'testing-password'}});assert.equal(r.statusCode,200);return r.headers['set-cookie'].split(';')[0];}
 const admin=await login('admin-test'),user=await login('user-test');const get=async(url,cookie=admin)=>app.inject({url:'/api/admin/synthesis'+url,headers:{cookie}});
 assert.equal((await app.inject('/api/admin/synthesis/meta')).statusCode,401);assert.equal((await get('/meta',user)).statusCode,403);
 const meta=(await get('/meta')).json();assert.equal(meta.items,2520);assert.equal(meta.nodes,902);assert.ok(!meta.years.includes('2020'));
 const all=(await get('/questions')).json();assert.equal(all.total,2520);
 assert.equal((await get('/questions?years=2021,2023')).json().total,360);assert.equal((await get('/questions?years=2021')).json().total,240);
 const may=(await get('/questions/2021-05-Q001')).json(),june=(await get('/questions/2021-06-Q001')).json();assert.notEqual(may.id,june.id);assert.equal(may.sitting,'2021-05');assert.equal(june.sitting,'2021-06');
 assert.equal((await get('/questions?q=zzzzzzzzzzzz')).json().total,0);
 const explanation=(await get('/questions?q='+encodeURIComponent('avoir besoin de l’argent accepte'))).json();assert.ok(explanation.items.some(x=>x.id==='2005-Q041'));
 const recovered=(await get('/questions/2018-Q011')).json();assert.equal(recovered.mapping.material_status,'source_missing');assert.ok(recovered.mapping.source_record.sol_high_decision.stem);assert.equal(recovered.answer.answer_status,'user-approved');assert.equal(recovered.answer.reference_version,'user-reference-v1');assert.equal(recovered.mapping.answer_status,'source_letter_only_not_audio_verified');
 const data=loadSynthesis();const item=data.items.find(i=>i.mapping.source_record?.terra_content?.explanation?.includes('未取得允许的音频'));assert.ok(item);assert.ok((await get('/questions?q='+encodeURIComponent('未取得允许的音频'))).json().total>0);
 const byDefinition=(await get('/questions?q='+encodeURIComponent('被替代事物的性数'))).json();assert.ok(byDefinition.items.some(x=>x.id==='2006-Q065'));
 const node=data.data.nodes.find(n=>n.id==='obj-possessive');assert.ok((await get('/nodes?q='+encodeURIComponent(node.name))).json().nodes.some(n=>n.id===node.id));assert.ok((await get('/nodes?q='+encodeURIComponent('被替代事物的性数'))).json().nodes.some(n=>n.id===node.id));
 assert.equal((await get('/questions?q='+encodeURIComponent('ile de la cite'))).json().total,(await get('/questions?q='+encodeURIComponent('Île de la Cité'))).json().total);
 const nodes=(await get('/nodes?years=2021,2023')).json().nodes;assert.ok(nodes.every(n=>n.count>0));const n=nodes.find(n=>n.id==='obj-possessive');assert.equal((await get('/questions?years=2021,2023&node='+n.id)).json().total,n.count);
 assert.equal(db.prepare('SELECT count(*) n FROM qb_review_events').get().n,0);assert.equal(db.prepare('SELECT count(*) n FROM reports').get().n,0);
 }finally{await app.close();db.close();}
});
test('grouped question bank preserves passages, multi-type filters and subquestion search',async()=>{
 const db=openDatabase(':memory:'),app=await createApp({db});try{
 await createUser(db,'admin-group','testing-password','admin');const login=await app.inject({method:'POST',url:'/api/auth/login',headers:{origin:'http://127.0.0.1:4174'},payload:{username:'admin-group',password:'testing-password'}});const cookie=login.headers['set-cookie'].split(';')[0];const get=async url=>(await app.inject({url:'/api/admin/synthesis'+url,headers:{cookie}})).json();
 const all=await get('/groups?years=2005&types=cloze,reading');assert.equal(all.total,5);assert.deepEqual(all.items.map(x=>x.items.length),[10,5,5,5,5]);assert.ok(all.items.every(x=>x.material));
 const verb=await get('/groups?years=2012&types=verb_blank');assert.equal(verb.total,1);assert.equal(verb.items[0].items.length,20);assert.equal(verb.items[0].items.filter(x=>x.missingBlank).length,0);
 const filtered=await get('/groups?years=2021,2023&types=cloze,reading');assert.equal(filtered.total,15);
 const hit=await get('/groups?q=2005-Q083');assert.equal(hit.total,1);assert.equal(hit.items[0].items.length,5);assert.ok(hit.items[0].matches.some(x=>x.id==='2005-Q083'));assert.ok(!JSON.stringify(hit).includes('answer_view'));
 const detail=await get('/groups/'+hit.items[0].id);assert.equal(detail.items.length,5);assert.ok(detail.items.every(i=>i.answer));
 assert.equal((await get('/groups?years=2005&types=reading')).total,4);assert.equal((await get('/groups?q=not-a-real-query-xyz')).total,0);
 const bad=await app.inject({url:'/api/admin/synthesis/groups?types=invalid',headers:{cookie}});assert.equal(bad.statusCode,400);
 }finally{await app.close();db.close();}
});
test('bank shows individual items and retains each passage behind detail',async()=>{
 const db=openDatabase(':memory:'),app=await createApp({db});try{
 await createUser(db,'admin-items','testing-password','admin');const login=await app.inject({method:'POST',url:'/api/auth/login',headers:{origin:'http://127.0.0.1:4174'},payload:{username:'admin-items',password:'testing-password'}});const cookie=login.headers['set-cookie'].split(';')[0];const get=async url=>(await app.inject({url:'/api/admin/synthesis'+url,headers:{cookie}})).json();
 const result=await get('/bank-items?years=2005&types=reading,cloze');assert.equal(result.total,30);assert.equal(result.items.length,20);assert.equal(result.items[0].id,'2005-Q031');assert.equal(result.items[0].options.length,4);assert.ok(result.items[0].hasMaterial);assert.ok(result.items[0].stem.includes('31'));assert.ok(!('material' in result.items[0]));assert.ok(!('answer' in result.items[0]));
 const reading=await get('/bank-items?q=2005-Q083');assert.equal(reading.total,1);assert.equal(reading.items[0].id,'2005-Q083');const detail=await get('/questions/2005-Q083');assert.ok(detail.mapping.material.text.includes('gastronomie'));assert.ok(detail.answer);
 const verbs=await get('/bank-items?years=2005&types=verb_blank');assert.equal(verbs.total,20);assert.ok(verbs.items[0].stem.includes('__1__'));assert.ok(verbs.items[0].stem.length<300);assert.ok(!verbs.items[0].stem.includes('__20__'));
 assert.equal((await get('/bank-items?years=2021,2023&types=reading,cloze')).total,90);assert.equal((await get('/bank-items?q=no-such-text-xyz')).total,0);
 }finally{await app.close();db.close();}
});
test('signed-in ordinary users can browse the read-only bank and tree while admin routes stay protected',async()=>{
 const db=openDatabase(':memory:'),app=await createApp({db});try{
 await createUser(db,'reader-test','testing-password','user');const login=await app.inject({method:'POST',url:'/api/auth/login',headers:{origin:'http://127.0.0.1:4174'},payload:{username:'reader-test',password:'testing-password'}});assert.equal(login.statusCode,200);const cookie=login.headers['set-cookie'].split(';')[0];
 const get=(url,authenticated=true)=>app.inject({url,headers:authenticated?{cookie}:{}});
 for(const url of ['/api/synthesis/meta','/api/synthesis/bank-items?years=2023&types=grammar','/api/synthesis/nodes?years=2023&q='+encodeURIComponent('主有代词'),'/api/synthesis/questions/2023-Q047']){assert.equal((await get(url)).statusCode,200,url);assert.equal((await get(url,false)).statusCode,401,url);}
 const list=(await get('/api/synthesis/bank-items?years=2023&types=grammar')).json();assert.ok(list.items.length&&list.items.every(i=>i.sitting==='2023'&&i.type==='grammar'));
 const nodes=(await get('/api/synthesis/nodes?years=2023&q='+encodeURIComponent('主有代词'))).json();assert.ok(nodes.nodes.some(n=>n.id==='obj-possessive'));
 assert.equal((await get('/api/synthesis/bank-items?years=2023&node=obj-possessive')).json().total,1);
 for(const url of ['/api/admin/synthesis/meta','/api/admin/synthesis/questions/2023-Q047','/api/admin/users','/api/admin/reports'])assert.equal((await get(url)).statusCode,403,url);
 assert.equal((await get('/api/synthesis/groups')).statusCode,404);assert.equal((await get('/api/synthesis/bank-items?types=invalid')).statusCode,400);
 }finally{await app.close();db.close();}
});
