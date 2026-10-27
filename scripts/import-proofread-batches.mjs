import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import {openDatabase,projectRoot} from '../server/db.mjs';
import {fileSha256,importProduction,validateProduction} from '../server/bank-production.mjs';
import {fingerprint} from '../server/bank-import.mjs';
if(process.env.NODE_ENV==='production')throw Error('Local Stage2 only');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const root=path.join(projectRoot,'.local/stage2/production/2023-2024-v2');
const manifest=read(path.join(root,'raster-manifest.json')),ocr=read(path.join(root,'ocr.run.json'));
const inputs=[2023,2024].map(year=>{
 const file=path.join(projectRoot,`data/${year}-stage2-candidate.json`),candidate=read(file),evidence=read(path.join(projectRoot,`data/${year}-stage2-proofread.json`));validateProduction(candidate,evidence);
 if(fileSha256(file)!==evidence.candidateSha256)throw Error('Candidate file hash mismatch');
 const source=manifest.sources.find(s=>s.year===year),run=ocr.find(o=>o.id===source.id);
 if(source.kind!=='paper'||source.sha256!==evidence.ocr.inputSha256||fileSha256(source.path)!==source.sha256||run.mode!=='Best'||run.outputSha256!==evidence.ocr.outputSha256||fileSha256(run.output)!==run.outputSha256||run.pages!==evidence.pageCount)throw Error('OCR evidence mismatch');
 if(source.pageImages.length!==evidence.pageCount||source.pageImages.some(p=>fileSha256(p.path)!==p.sha256))throw Error('Page image hash mismatch');
 return {candidate,evidence};
});
const dbFile=path.join(projectRoot,'.local/stage2/app.sqlite');if(!fs.existsSync(dbFile))throw Error('Existing local acceptance database required');
const backups=path.join(projectRoot,'.local/stage2/backups');fs.mkdirSync(backups,{recursive:true});const backup=path.join(backups,`before-2023-2024-${Date.now()}.sqlite`);const ro=new Database(dbFile,{readonly:true});await ro.backup(backup);
const existing=ro.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name!='schema_migrations'").all().map(({name})=>{if(!/^[a-z_]+$/.test(name))throw Error('Unexpected table name');const max=ro.prepare(`SELECT max(rowid) n FROM ${name}`).get().n;return {name,max,digest:fingerprint(ro.prepare(`SELECT * FROM ${name} WHERE rowid<=? ORDER BY rowid`).all(max??0))};});ro.close();
const db=openDatabase(dbFile);
try{const actor=db.prepare("SELECT id FROM users WHERE username='stage2-review' AND role='admin'").get()?.id;if(!actor)throw Error('Local review admin missing');const results=db.transaction(()=>{const added=inputs.map(({candidate,evidence})=>({year:candidate.source.year,...importProduction(db,candidate,evidence,actor)}));for(const old of existing)if(fingerprint(db.prepare(`SELECT * FROM ${old.name} WHERE rowid<=? ORDER BY rowid`).all(old.max??0))!==old.digest)throw Error(`Existing rows changed: ${old.name}`);return added;})();console.log(JSON.stringify({preservedExistingTables:existing.length,imports:results.map(r=>({year:r.year,id:r.id,status:r.status,duplicate:r.duplicate}))},null,2));}finally{db.close();}
