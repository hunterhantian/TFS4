import test from 'node:test';import assert from 'node:assert/strict';import {attentionCounts} from '../web/modules/learning-tree.mjs';
test('attention counts distinct flagged knowledge points at all three levels',()=>{
 const nodes=[{id:'root',parentId:null},{id:'family',parentId:'root'},{id:'a',parentId:'family',leaf:true,statistics:{state:'重点加强'}},{id:'b',parentId:'family',leaf:true,statistics:{state:'重点加强'}},{id:'c',parentId:'family',leaf:true,statistics:{state:'证据不足'}},{id:'untested',parentId:'family',leaf:true}];const counts=attentionCounts(nodes);assert.equal(counts.get('root'),2);assert.equal(counts.get('family'),2);assert.equal(counts.get('a'),1);assert.equal(counts.get('c'),undefined);assert.equal(counts.get('untested'),undefined);
});
