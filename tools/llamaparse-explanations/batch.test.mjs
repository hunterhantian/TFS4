// Offline network stubs only. Never reads the user's API key or calls LlamaCloud.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
const script=fileURLToPath(new URL('./batch.mjs',import.meta.url));
function fixture(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'llamaparse-offline-')),pdf=path.join(dir,'fixture.pdf'),bytes=Buffer.from('%PDF-1.7\nSynthetic offline fixture');fs.writeFileSync(pdf,bytes);
 const manifest=path.join(dir,'sources.json'),out=path.join(dir,'out'),calls=path.join(dir,'calls.txt'),stub=path.join(dir,'stub.mjs');
 fs.writeFileSync(manifest,JSON.stringify({keyFile:path.join(dir,'missing-key'),config:{tier:'cost_effective',version:'latest'},items:[{id:'fixture',input:pdf,inputSha256:createHash('sha256').update(bytes).digest('hex'),expectedPages:1}]}));
 fs.writeFileSync(stub,`import fs from 'node:fs';globalThis.fetch=async(url,options)=>{fs.appendFileSync(process.env.STUB_CALLS,options.method==='POST'?'POST\\n':'GET\\n');if(process.env.STUB_MODE==='ambiguous'&&options.method==='POST')throw Error('simulated connection lost');return new Response(JSON.stringify(options.method==='POST'?{id:'offline-job'}:{job:{status:'COMPLETED',usage:{credits:1}},markdown:{pages:[{page_number:1,markdown:'Synthetic MD'}]}}),{status:200});};`);
 const run=(extra=[],mode='success')=>spawnSync(process.execPath,['--import',pathToFileURL(stub).href,script,'--manifest',manifest,'--output',out,...extra],{encoding:'utf8',env:{...process.env,LLAMA_CLOUD_API_KEY:'synthetic-test-key',STUB_CALLS:calls,STUB_MODE:mode}});
 return {dir,out,calls,run};
}
test('offline preflight validates source bytes without key file or fetch',()=>{
 const f=fixture(),r=f.run(['--check']);assert.equal(r.status,0,r.stderr);assert(!fs.existsSync(f.calls));assert(!fs.existsSync(f.out));
});
test('completed job preserves per-page evidence and rerun does not submit or poll',()=>{
 const f=fixture(),r=f.run();assert.equal(r.status,0,r.stderr);assert.equal(fs.readFileSync(path.join(f.out,'fixture/pages/0001.md'),'utf8'),'Synthetic MD');
 assert.equal(f.run().status,0);assert.equal(fs.readFileSync(f.calls,'utf8'),'POST\nGET\n');assert.equal(JSON.parse(fs.readFileSync(path.join(f.out,'fixture/state.json'))).status,'completed');
});
test('ambiguous submission blocks repeat billing; recovered job ID resumes polling',()=>{
 const f=fixture();assert.equal(f.run([],'ambiguous').status,1);assert.equal(f.run().status,1);assert.equal(fs.readFileSync(f.calls,'utf8'),'POST\n');
 const file=path.join(f.out,'fixture/state.json'),s=JSON.parse(fs.readFileSync(file));assert.equal(s.submissionPending,true);s.jobId='recovered-offline-job';fs.writeFileSync(file,JSON.stringify(s));
 const resumed=f.run();assert.equal(resumed.status,0,resumed.stderr);assert.equal(fs.readFileSync(f.calls,'utf8'),'POST\nGET\n');
});
