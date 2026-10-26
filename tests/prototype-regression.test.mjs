import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import os from 'node:os';
import path from 'node:path';
import {createPreview} from '../scripts/preview.mjs';
const s={window:{}};vm.runInNewContext(fs.readFileSync('dist/exam-data.js','utf8'),s);const d=s.window.EXAM_DATA;
test('all 100 question boundaries and material references stay intact',()=>{
 assert.equal(d.questions.length,100);assert.equal(new Set(d.questions.map(q=>q.no)).size,100);
 for(const q of d.questions){assert.deepEqual(Object.keys(q.options),q.no<=20?['A','B','C']:['A','B','C','D']);for(const text of Object.values(q.options))assert.doesNotMatch(text,/#{2,}|<!--|Complétez le texte|En juin 2018|De nos jours, le permis|Fin juin 2023|De l'école primaire/);assert.ok(q.options[q.answer]);}
 assert.equal(d.questions[19].options.C,'De sortir de leur zone de confort.');
 const expected={30:'est oublié',85:"Le somnambule a un vague souvenir de ce qui s’est passé la nuit.",90:'Les différences de tarifs entre les régions sont très faibles.',95:'Elle est consacrée aux artistes du fauvisme entre les années 1920 et 1940.'};
 for(const [n,text] of Object.entries(expected))assert.equal(d.questions[n-1].options.D.replaceAll("'",'’'),text.replaceAll("'",'’'));
 assert.equal(Object.keys(d.contexts).length,5);for(const text of Object.values(d.contexts))assert.ok(text.length>300);
});
test('audio supports metadata, range, suffix and rejects invalid range',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tfs-audio-fixture-'));const file=path.join(dir,'fixture.mp3');const bytes=Buffer.alloc(4096,7);fs.writeFileSync(file,bytes);
 const server=createPreview({audioFile:file});await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/media/2025-listening.mp3`;
 try{const h=await fetch(url,{method:'HEAD'});assert.equal(h.status,200);const size=Number(h.headers.get('content-length'));assert.equal(size,4096);for(const [range,length] of [['bytes=0-1023',1024],['bytes=1000-1999',1000],['bytes=-256',256]]){const r=await fetch(url,{headers:{Range:range}});assert.equal(r.status,206);assert.equal((await r.arrayBuffer()).byteLength,length);}assert.equal((await fetch(url,{headers:{Range:`bytes=${size}-`}})).status,416);}finally{await new Promise(r=>server.close(r));fs.rmSync(dir,{recursive:true});}
});
