import test from 'node:test';
import assert from 'node:assert/strict';
import {visibleTree} from '../web/modules/synthesis-tree.mjs';
test('knowledge search preserves ancestors and expands matching higher-level branches',()=>{
 const nodes=[{id:'a',parentId:null},{id:'b',parentId:'a'},{id:'c',parentId:'b'},{id:'d',parentId:'b'},{id:'x',parentId:null}];
 assert.deepEqual(visibleTree(nodes,[],false),nodes);
 assert.deepEqual(visibleTree(nodes,[{id:'c'}],true).map(n=>n.id),['a','b','c']);
 assert.deepEqual(visibleTree(nodes,[{id:'b'}],true).map(n=>n.id),['a','b','c','d']);
 assert.deepEqual(visibleTree(nodes,[],true),[]);
});
