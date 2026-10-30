// Rebuild a fresh disposable review environment from the tracked handoff; never restore real users.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {openDatabase,projectRoot} from '../server/db.mjs';
const root=path.join(projectRoot,'data/stage2-handoff'),manifest=JSON.parse(fs.readFileSync(path.join(root,'handoff-manifest.json')));
for(const f of manifest.files){
 const file=path.resolve(root,f.path);assert(file.startsWith(root+path.sep),'Path outside handoff');
 const b=fs.readFileSync(file);assert.equal(b.length,f.bytes,f.path);assert.equal(createHash('sha256').update(b).digest('hex'),f.sha256,f.path);
}
if(process.argv.includes('--verify-only')){console.log(`Verified ${manifest.files.length} handoff files, ${manifest.documents} documents, ${manifest.pages} pages.`);process.exit(0);}
if(process.env.NODE_ENV==='production')throw Error('Disposable local/web review only');
const work=path.join(projectRoot,'.local/stage2-web'),dest=path.join(projectRoot,'.local/stage2-knowledge-tree/app.sqlite');
if(fs.existsSync(work)||fs.existsSync(dest))throw Error('Existing work preserved. Use a fresh checkout/workspace for bootstrap; do not delete existing review data.');
fs.mkdirSync(work,{recursive:true});
const review=path.join(work,'reviewed-pilots'),annotations=path.join(work,'annotations');
fs.cpSync(path.join(root,'reviewed-pilots'),review,{recursive:true});fs.cpSync(path.join(root,'annotations'),annotations,{recursive:true});
const base=path.join(work,'content.sqlite');openDatabase(base).close();
const run=(script,args)=>execFileSync(process.execPath,[path.join(projectRoot,'scripts',script),...args],{cwd:projectRoot,stdio:'inherit'});
run('stage2-import-pilot-review.mjs',[base,review]);
run('stage2-apply-objective-annotations.mjs',[path.join(annotations,'annotation-plan.json'),base,dest]);
run('stage2-verify-objective-tree.mjs',[path.join(annotations,'annotation-plan.json'),dest,path.join(annotations,'annotation-import-report.json'),path.join(work,'tree-verification.json')]);
console.log('Ready: node scripts/stage2-knowledge-tree-review.mjs. New disposable account will be generated locally; no production accounts or history imported.');
