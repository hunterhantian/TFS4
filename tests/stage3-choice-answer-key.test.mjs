import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {fullExamCatalog} from '../server/full-exam.mjs';
import {listeningCatalog} from '../server/listening-exam.mjs';
import {miniCatalog} from '../server/mini-exam.mjs';
import {makeReport} from '../server/domain.mjs';

test('all published choice answers match the user document and every catalog option',()=>{
 const key=JSON.parse(fs.readFileSync('data/stage3-choice-answer-key-v1.json'));const raw=fs.readFileSync(key.source);const digest=b=>crypto.createHash('sha256').update(b).digest('hex');const lf=raw.toString('utf8').replace(/\r\n/g,'\n');assert.ok([digest(raw),digest(Buffer.from(lf.replace(/\n/g,'\r\n')))].includes(key.sourceSha256),'source hash differs beyond line endings');
 const sections=raw.toString().split(/^## (\d{4}(?:-\d{2})?)\s*$/m);assert.equal(sections.length,43);
 for(let i=1;i<sections.length;i+=2){const y=sections[i],body=sections[i+1];const entries=[...body.matchAll(/(?<!\d)(\d{2,3})=([A-D])\*?/g)];assert.equal(entries.length,100);for(const [,n,a] of entries)assert.equal(key.answers[`${y}-Q${n.padStart(3,'0')}`],a);}
 for(const p of fullExamCatalog())for(const q of p.snapshot.questions)assert.equal(q.answer.value,key.answers[q.id]);
 for(const p of listeningCatalog())for(const q of p.snapshot.questions)assert.equal(q.answer.value,key.answers[q.id]);
 for(const p of miniCatalog())for(const s of p.sheets)for(const q of s.snapshot.questions)if(q.responseType!=='text')assert.equal(q.answer.value,key.answers[q.id]);
});
test('new reports score choices only and preserve old ungraded snapshots',()=>{
 const q=(id,v,type='choice')=>({id,responseType:type,answer:{value:v},options:type==='text'?{}:{A:'a',B:'b'}});
 const attempt={mode:'mini',snapshot:{title:'t',id:'t',answerKeyVersion:'user-reference-v1',questions:[q('a','A'),q('b','B'),q('c','A'),q('d','texte','text')],materials:[]},progress:{answers:[{questionId:'a',choice:'A'},{questionId:'b',choice:'A'},{questionId:'d',choice:'texte'}],effectiveMs:0,materialTimes:{}}};
 const r=makeReport(attempt);assert.deepEqual(r.items.map(i=>i.result),['correct','wrong','unanswered','manual']);assert.equal(r.stats.correct,1);assert.equal(r.stats.gradable,3);assert.equal(r.stats.manual,1);
 attempt.snapshot.answerKeyVersion='unverified-candidate';const old=makeReport(attempt);assert.equal(old.referenceStatus,'unverified-candidate');assert.equal(old.stats.correct,undefined);assert.equal(old.items[0].result,undefined);
});
