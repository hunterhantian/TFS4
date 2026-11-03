import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {miniCatalog} from '../server/mini-exam.mjs';
import {loadSynthesis} from '../server/synthesis.mjs';
import {verbReference,verbReferenceVersion} from '../server/stage3-verb-answer-reference.mjs';

test('all 420 verb references are reflected in the bank and Mini snapshots',()=>{
 const before=fs.readFileSync('.local/synthesis/snapshot.json');const bank=loadSynthesis();const verbs=bank.items.filter(x=>/-V\d{2}$/.test(x.id));assert.equal(verbs.length,420);
 for(const item of verbs){assert.equal(item.answer.answer_view,verbReference(item.id).value);assert.equal(item.answer.reference_version,verbReferenceVersion);assert.equal(item.answer.answer_status,"user-approved");assert.ok(item.answer.reference_source.sourceStatus);}
 const qs=miniCatalog().flatMap(x=>x.sheets.flatMap(s=>s.snapshot.questions)).filter(q=>q.responseType==='text');assert.equal(qs.length,420);
 for(const q of qs){assert.equal(q.answer.value,verbReference(q.id).value);assert.equal(q.answer.referenceVersion,verbReferenceVersion);}
 assert.deepEqual(fs.readFileSync('.local/synthesis/snapshot.json'),before);
});
