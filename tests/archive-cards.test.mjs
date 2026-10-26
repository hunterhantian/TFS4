import test from 'node:test';
import assert from 'node:assert/strict';
import {archiveDateParts,renderArchiveCards} from '../web/modules/archive-cards.mjs';
test('archive date and time split consistently at the Shanghai midnight boundary',()=>{
 assert.deepEqual(archiveDateParts('2026-10-25T16:02:03.000Z'),{day:'2026-10-26',time:'00:02:03'});assert.deepEqual(archiveDateParts(null),{day:'未记录',time:'未记录'});
});
test('archive completion uses answered count, separate from correctness and retained custom titles',()=>{
 const html=renderArchiveCards([{id:'fixture',title:'完整存档名称',theme:'2025 法语专四',customTitle:'<自定义>',mode:'full',submittedAt:null,createdAt:'2026-10-26T00:00:00Z',origin:'ordinary',stats:{answered:37,total:100,correct:11}}]);
 assert.ok(html.includes('已答 37/100 · 37%'));assert.ok(html.includes('答对 11/100'));assert.ok(html.includes('&lt;自定义&gt;'));assert.ok(!html.includes('2026-10-26'));assert.ok(html.includes('完整真题'));
});
