import test from 'node:test';
import assert from 'node:assert/strict';
import {archiveTitle} from '../server/domain.mjs';
async function timingFixture(fn){
 const saved={performance:globalThis.performance,sessionStorage:globalThis.sessionStorage,localStorage:globalThis.localStorage,fetch:globalThis.fetch};let clock=0,request;
 Object.defineProperty(globalThis,'performance',{value:{now:()=>clock},configurable:true});globalThis.sessionStorage={getItem:()=>null,setItem:()=>{}};globalThis.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};globalThis.fetch=async(url,options)=>{request=JSON.parse(options.body);return new Response(JSON.stringify({revision:request.expectedRevision+1,status:'active'}),{status:200});};
 try{const {ExamSync}=await import('../web/modules/sync.mjs');const attempt={id:'auto-timing-fixture',revision:0,status:'active',questions:[21,22,23,81,82].map(n=>({id:`q${n}`,originalNo:n,materialId:n>=81?'reading-81':null})),progress:{answers:[],position:0,effectiveMs:0,materialTimes:{}}};const callbacks={onStatus:()=>{},onConflict:()=>{},onSubmitted:()=>{},onStorageError:()=>assert.fail('Storage failed')};const create=progress=>new ExamSync('fixture-owner',{...attempt,progress:structuredClone(progress||attempt.progress)},callbacks);await fn({create,setTime:n=>clock=n,request:()=>request});
 }finally{Object.defineProperty(globalThis,'performance',{value:saved.performance,configurable:true});globalThis.sessionStorage=saved.sessionStorage;globalThis.localStorage=saved.localStorage;globalThis.fetch=saved.fetch;}
}
test('automatic timing assigns answer-to-answer intervals, includes confidence, excludes pauses',async()=>timingFixture(async({create,setTime})=>{
 const sync=create();sync.start();setTime(3000);sync.select('q21','choice','A');assert.equal(sync.progress.answers.find(r=>r.questionId==='q21').effectiveMs,3000);assert.equal(sync.activeId,'q22');setTime(5000);sync.select('q21','confidence','certain');assert.equal(sync.activeId,'q22');setTime(9000);sync.select('q22','choice','B');assert.equal(sync.progress.answers.find(r=>r.questionId==='q22').effectiveMs,6000);setTime(10000);await sync.flush();assert.equal(sync.progress.pendingTiming.ms,1000);setTime(12000);sync.select('q23','choice','C');assert.equal(sync.progress.answers.find(r=>r.questionId==='q23').effectiveMs,3000);setTime(14000);sync.stop();setTime(20000);sync.start();setTime(25000);sync.select('q23','choice','A');assert.equal(sync.progress.answers.find(r=>r.questionId==='q23').effectiveMs,10000);assert.equal(sync.progress.effectiveMs,19000);
}));
test('skip answers allocate the open interval to the chosen question; pending time survives reload',async()=>timingFixture(async({create,setTime,request})=>{
 const sync=create();sync.start();setTime(4000);await sync.flush();assert.equal(request().pendingTiming.ms,4000);const {answers,position,effectiveMs,materialTimes,pendingTiming,timingMode}=request();const restored=create({answers,position,effectiveMs,materialTimes,pendingTiming,timingMode});restored.start();setTime(7000);restored.select('q23','choice','C');assert.equal(restored.progress.answers.find(r=>r.questionId==='q23').effectiveMs,7000);assert.equal(restored.progress.answers.some(r=>r.questionId==='q21'),false);assert.equal(restored.activeId,'q21');
}));
test('material questions retain measured answer intervals alongside independent group totals',async()=>timingFixture(async({create,setTime})=>{
 const sync=create();sync.start();sync.focus('q81');setTime(5000);sync.select('q81','choice','B');setTime(8000);sync.select('q82','choice','D');setTime(10000);sync.stop();assert.equal(sync.progress.materialTimes['reading-81'],10000);assert.equal(sync.progress.answers.find(r=>r.questionId==='q81').effectiveMs,5000);assert.equal(sync.progress.answers.find(r=>r.questionId==='q82').effectiveMs,5000);assert.equal(sync.progress.pendingTiming,null);
}));
test('automatic archive names use the submission instant in Asia/Shanghai',()=>{
 assert.equal(archiveTitle('2025 法语专四','2026-10-26T07:30:12.000Z'),'2025 法语专四 · 2026-10-26 15:30:12');assert.equal(archiveTitle('旧考试',null),'旧考试 · 提交时间未记录');
});
