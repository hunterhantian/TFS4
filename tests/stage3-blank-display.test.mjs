import test from 'node:test';
import assert from 'node:assert/strict';
import {numberedBlankMaterial} from '../server/synthesis.mjs';
test('numbered display preserves source and marks only reliably mapped blanks',()=>{
 const text=Array.from({length:20},()=>'(faire) ______').join(' ');const peers=Array.from({length:20},(_,i)=>({id:`2015-V${String(i+1).padStart(2,'0')}`,mapping:{type:'verb_blank',material:{text}}}));
 const rendered=numberedBlankMaterial(peers[0],peers);assert.match(rendered,/__\(1\)__/);assert.match(rendered,/__\(20\)__/);assert.equal(peers[0].mapping.material.text,text);assert.equal(numberedBlankMaterial(peers[0],peers.slice(0,19)),text);
});
