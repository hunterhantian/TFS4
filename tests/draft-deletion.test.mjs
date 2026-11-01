import test from 'node:test';
import assert from 'node:assert/strict';
test('draft deletion targets the exact unchanged stored copy',async()=>{
 const oldSession=globalThis.sessionStorage,oldLocal=globalThis.localStorage;const data=new Map();
 globalThis.sessionStorage={getItem:()=>null,setItem:()=>{}};globalThis.localStorage={getItem:k=>data.get(k)??null,removeItem:k=>data.delete(k)};
 try{const {removeDraftIfUnchanged}=await import('../web/modules/sync.mjs');data.set('a','original');data.set('b','keep');assert.equal(removeDraftIfUnchanged({storageKey:'a',raw:'stale'}),false);assert.equal(data.get('a'),'original');assert.equal(removeDraftIfUnchanged({storageKey:'a',raw:'original'}),true);assert.equal(data.has('a'),false);assert.equal(data.get('b'),'keep');}finally{globalThis.sessionStorage=oldSession;globalThis.localStorage=oldLocal;}
});
