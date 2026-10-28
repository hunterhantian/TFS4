// Deterministic, evidence-preserving draft extraction. Never grants proofreading.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const [batchRoot,outRoot,...sittings]=process.argv.slice(2);
if(!batchRoot||!outRoot||!sittings.length)throw Error('Usage: stage2-extract-md.mjs LLAMAPARSE_BATCH NEW_OUTPUT SITTING...');
if(fs.existsSync(outRoot))throw Error('Output exists; preserve it and choose a new revision directory');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,'')),sha=b=>createHash('sha256').update(b).digest('hex');
const manifest=read(path.join(batchRoot,'sources.json'));
fs.mkdirSync(outRoot,{recursive:true});const outputs=[];
for(const sitting of sittings){
 const paperId='tfs4-'+sitting,documents=[],nodes=[],issues=[];
 for(const item of manifest.items.filter(s=>s.sitting===sitting)){
  const dir=path.join(batchRoot,'output',item.id),state=read(path.join(dir,'state.json')),result=read(path.join(dir,'result.json')),raw=fs.readFileSync(path.join(dir,state.output));
  if(state.status!=='completed'||sha(raw)!==state.outputSha256)throw Error('Invalid MD '+item.id);
  const docId=paperId+'-'+item.role+'-'+state.outputSha256.slice(0,12),pages=result.markdown.pages.map((p,i)=>({page:p.page_number??i+1,markdown:p.markdown}));
  documents.push({id:docId,role:item.role,name:state.output,mimeType:'text/markdown',sha256:state.outputSha256,storageKey:'md-sources/'+state.outputSha256+'.md',provenance:'unconfirmed',parentSha256:state.inputSha256,pages});
  let section=null;
  for(const page of pages){
   const lines=page.markdown.split('\n');let offset=0;
   for(const line of lines){const start=offset;offset+=Array.from(line).length+1;if(!line.trim())continue;const part=line.match(/(?:PARTIE|Partie)\s+(VII|VI|IV|V|III|II|I)\b/);if(part)section=part[1];const number=line.match(/^\s*(?:\*\*)?(\d{1,3})[.、]\s*/);let kind=/^#{1,6}\s/.test(line)?'heading':number?'numbered_line':item.role==='answers'&&/\b\d+\s*[-–]\s*\d+\s+[A-D]+/.test(line)?'answer_group':'text';
    const evidence={documentId:docId,page:page.page,start,end:start+Array.from(line).length,quote:line};nodes.push({id:docId+'-n'+String(nodes.length+1).padStart(5,'0'),kind,section,number:number?Number(number[1]):null,text:line,evidence});
    if(kind==='answer_group')for(const match of line.matchAll(/\b(\d+)\s*[-–]\s*(\d+)\s+([A-D]+)/g))if(Number(match[2])-Number(match[1])+1!==match[3].length)issues.push({code:'ANSWER_COUNT_MISMATCH',evidence,range:match[1]+'-'+match[2],letters:match[3],severity:'blocking'});
   }
  }
 }
 const dir=path.join(outRoot,sitting);fs.mkdirSync(dir);fs.writeFileSync(path.join(dir,'raw-structure.json'),JSON.stringify({schemaVersion:1,kind:'md_raw_structure',paperId,documents,nodes,issues,proofread:false,gradingEligible:false},null,2));outputs.push({sitting,documents:documents.length,pages:documents.reduce((n,d)=>n+d.pages.length,0),nodes:nodes.length,issues:issues.length});
}
fs.writeFileSync(path.join(outRoot,'manifest.json'),JSON.stringify({createdAt:new Date().toISOString(),method:'md_internal_extraction',proofread:false,outputs},null,2));console.log(JSON.stringify(outputs,null,2));
