import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {verbReference,verbReferenceVersion} from '../server/stage3-verb-answer-reference.mjs';
import {loadSynthesis,numberedBlankMaterial} from '../server/synthesis.mjs';
import {miniCatalog} from '../server/mini-exam.mjs';
test('fill forms preserve pronouns, alternative tenses and immutable original references',()=>{
 const original=JSON.parse(fs.readFileSync('data/stage3-verb-answer-reference-v1.json'));
 assert.equal(verbReferenceVersion,'user-pdf-verb-reference-v2');
 assert.equal(verbReference('2007-V14').value,'est');assert.equal(verbReference('2007-V14').originalValue,original.answers['2007-V14'].value);
 assert.equal(verbReference('2008-V18').value,'m’a fait asseoir');
 assert.equal(verbReference('2018-V05').value,'en avait');
 assert.equal(verbReference('2019-V09').value,'ai taillés');assert.equal(verbReference('2014-V13').value,'avait été');
 assert.deepEqual(verbReference('2008-V12').accepted,['fasse']);assert.deepEqual(verbReference('2021-06-V17').accepted,['mettre']);
 const forms=miniCatalog().flatMap(c=>c.sheets.flatMap(s=>s.snapshot.questions));
 const q=forms.find(q=>q.id==='2017-V04');assert.equal(q.answer.value,'satisfît');assert.deepEqual(q.answer.accepted,['satisfasse']);
});
test('all seven missing blanks are restored in derived material with source untouched',()=>{
 const before=fs.readFileSync('.local/synthesis/snapshot.json');const bank=loadSynthesis();
 for(const id of ['2010-V13','2012-V01','2012-V15','2012-V16','2012-V17','2013-V02','2014-V13']){
  const item=bank.items.find(i=>i.id===id);assert.equal(item.mapping.type,'verb_blank',id);assert.equal(item.mapping.originalType,'verb_prompt_missing_blank');
  assert.ok(numberedBlankMaterial(item,bank.items).includes(`__(${Number(id.slice(-2))})__`),id);
 }
 assert.deepEqual(fs.readFileSync('.local/synthesis/snapshot.json'),before);
});
