// Build an isolated, reproducible read-only candidate snapshot; never touches the database.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const source=path.resolve(process.argv[2]||'../TFS4-knowledge-tree-sol-low/r2');
const target=path.resolve(process.argv[3]||'.local/synthesis/snapshot.json');
const files=['knowledge-tree.json','tree-item-mappings.json','answer-reference-view.json'];
const hashes=Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(source,f))).digest('hex')]));
const manifest=JSON.parse(fs.readFileSync('data/stage2-work-results-20261031-update/file-manifest.json','utf8'));
for(const f of files){const entry=manifest.files.find(x=>x.path==='TFS4-knowledge-tree-sol-low/r2/'+f);if(!entry||entry.sha256!==hashes[f])throw Error('Source checksum mismatch: '+f);}
const read=f=>JSON.parse(fs.readFileSync(path.join(source,f),'utf8'));
const tree=read(files[0]), mappings=read(files[1]), answers=read(files[2]);
if(tree.version!=='sol-low-r2'||mappings.items.length!==2520||answers.items.length!==2520)throw Error('Unexpected source version or item count');
const a=new Map(answers.items.map(x=>[x.itemId,x]));
if(a.size!==2520||new Set(mappings.items.map(x=>x.itemId)).size!==2520||mappings.items.some(x=>!a.has(x.itemId)))throw Error('Missing or duplicate item IDs');
const snapshot={version:'sol-low-r2',hashes,nodes:tree.nodes,items:mappings.items.map(x=>({mapping:x,answer:a.get(x.itemId)}))};
fs.mkdirSync(path.dirname(target),{recursive:true});const tmp=target+'.tmp';fs.writeFileSync(tmp,JSON.stringify(snapshot));fs.renameSync(tmp,target);
console.log(JSON.stringify({target,hashes,nodes:tree.nodes.length,items:snapshot.items.length}));
