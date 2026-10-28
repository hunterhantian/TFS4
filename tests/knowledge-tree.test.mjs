import test from 'node:test';
import assert from 'node:assert/strict';
import {openDatabase} from '../server/db.mjs';
import {createApp} from '../server/app.mjs';
import {importContent,saveKnowledge,catalogRevision,reviewItem,releaseItems} from '../server/stage2.mjs';
import {importObjectiveAnnotation,objectiveKnowledgeTree,objectiveNodeQuestions} from '../server/knowledge-tree.mjs';
function point(db,id,parentId=null){saveKnowledge(db,{expectedRevision:catalogRevision(db),point:{id,subject:'fr-objective',parentId,name:id,nameFr:'',definition:'Test rule '+id,inclusions:['test inclusion'],exclusions:['test exclusion'],status:'active',aliases:[]}});}
function fixture(n,type='grammar-choice'){
 const paper='tree-test-'+n,qid=paper+'-q',doc=paper+'-doc',text='Test sentence '+n;
 return {schemaVersion:4,kind:'content',paper:{id:paper,year:2010+n,session:null,title:paper,examCode:'TFS4'},paperVersion:1,revisionNote:'Synthetic fixture only',documents:[{id:doc,role:'paper',name:'test.md',mimeType:'text/markdown',sha256:'a'.repeat(64),storageKey:'test.md',provenance:'unconfirmed',pages:[{page:1,markdown:text}]}],sections:[{id:'I',parentId:null,label:'I',order:1,instruction:'test'}],types:[{id:type,label:type,component:type==='writing'?'writing':'grammar',responseType:type==='verb-form'?'verb_form':type==='writing'?'writing':'choice'}],materials:[],questions:[{id:qid,nodeKey:'I-1',version:1,sectionId:'I',typeId:type,originalLabel:'1',order:1,text,responseType:type==='verb-form'?'verb_form':type==='writing'?'writing':'choice',options:type==='grammar-choice'?[{key:'A',label:'A',text:'first'},{key:'B',label:'B',text:'second'}]:[],annotations:[],materialId:null,evidence:[{documentId:doc,page:1,start:0,end:text.length,quote:text}],answer:{version:1,status:'missing',value:null,candidates:[],reason:''}}],references:[]};
}
function annotate(db,data,{decision='agree',primaryId='test-leaf',idSuffix=''}={}){
 const q=data.questions[0];return importObjectiveAnnotation(db,{id:q.id+'-annotation'+idSuffix,questionVersionId:q.id+':v1',primaryId,basis:'Test evidence for '+q.text,keyEvidence:[{source:'question',quote:q.text}],runId:'first-pass',expectedCatalogRevision:catalogRevision(db),review:{runId:'second-pass',producer:'Synthetic reviewer',independentPrimaryId:primaryId,decision,reason:decision==='agree'?'Reviewed fixture':'Needs source verification'}});
}
function insert(db,n,type='grammar-choice',decision='agree'){
 const d=fixture(n,type);importContent(db,d,'fixture');const a=annotate(db,d,{decision});
 if(decision==='agree'){const qv=d.questions[0].id+':v1';reviewItem(db,{questionVersionId:qv,expectedRevision:0,kind:'content',decision:'passed',reason:'test'},'fixture');reviewItem(db,{questionVersionId:qv,expectedRevision:1,kind:'classification',classificationId:a.classificationId,decision:'passed',reason:'test'},'fixture');releaseItems(db,{items:[{questionVersionId:qv,expectedRevision:2,classificationId:a.classificationId}]},'fixture');}return d;
}
function setup(){const db=openDatabase(':memory:');point(db,'test-root');point(db,'test-group','test-root');point(db,'test-family','test-group');point(db,'test-leaf','test-family');point(db,'test-other','test-group');return db;}
test('knowledge-first tree aggregates deduplicated descendants and groups the same primary by type, with pending separate',()=>{
 const db=setup();try{
  const first=insert(db,2);insert(db,3,'verb-form');insert(db,13,'grammar-choice','uncertain');
  const before=db.prepare('SELECT count(*) n FROM qb_review_events').get().n;
  const tree=objectiveKnowledgeTree(db);assert.equal(tree.totalQuestions,3);assert.equal(tree.available,2);assert.equal(tree.pending,1);
  assert.equal(tree.nodes.find(n=>n.id==='test-root').available,2);assert.equal(tree.nodes.find(n=>n.id==='test-leaf').directAvailable,2);
  const all=objectiveNodeQuestions(db,'test-root');assert.equal(all.total,2);assert.equal(all.groups.length,2);assert.equal(objectiveNodeQuestions(db,'test-leaf',{typeId:'verb-form'}).total,1);
  assert.equal(objectiveNodeQuestions(db,'test-leaf',{status:'pending'}).total,1);assert.equal(objectiveKnowledgeTree(db,{year:'2012'}).available,1);
  annotate(db,first,{decision:'uncertain',primaryId:'test-other',idSuffix:'-new'});
  assert.equal(objectiveNodeQuestions(db,'test-leaf').total,2,'pending analysis cannot hide the published combination');assert.equal(objectiveKnowledgeTree(db).totalQuestions,3,'same question remains one unique identity');
  assert.equal(objectiveNodeQuestions(db,'test-other',{status:'pending'}).total,1);assert.equal(db.prepare('SELECT count(*) n FROM qb_review_events').get().n,before,'reads and candidate import must not create reviews');
 }finally{db.close();}
});
test('minimal annotation blocks subjective tasks, non-leaf primary and stale revisions; duplicate import stays idempotent',()=>{
 const db=setup();try{
  const d=insert(db,2);const before=db.prepare('SELECT count(*) n FROM qb_analysis_versions').get().n;assert.equal(annotate(db,d).duplicate,true);assert.equal(db.prepare('SELECT count(*) n FROM qb_analysis_versions').get().n,before);
  assert.throws(()=>annotate(db,d,{primaryId:'test-root',idSuffix:'-invalid'}),{code:'PRIMARY_MUST_BE_LEAF'});
  const writing=fixture(3,'writing');importContent(db,writing,'fixture');assert.throws(()=>annotate(db,writing),{code:'OBJECTIVE_ONLY'});
  point(db,'test-added','test-group');assert.equal(objectiveKnowledgeTree(db).available,0);assert.equal(objectiveKnowledgeTree(db).pending,1);assert.equal(objectiveKnowledgeTree(db).defaultNode,'test-leaf','a pending-only tree remains navigable');
  assert.throws(()=>objectiveNodeQuestions(db,'test-leaf',{page:'0'}),{code:'INVALID_PAGE'});assert.throws(()=>objectiveNodeQuestions(db,'test-leaf',{status:'all'}),{code:'INVALID_STATUS'});assert.throws(()=>objectiveKnowledgeTree(db,{year:'bad'}),{code:'INVALID_YEAR'});
 }finally{db.close();}
});
test('knowledge node pagination returns each eligible question once and rejects unauthenticated tree APIs',async()=>{
 const db=setup(),app=await createApp({db});try{
  for(let i=1;i<=23;i++)insert(db,i);const first=objectiveNodeQuestions(db,'test-leaf'),second=objectiveNodeQuestions(db,'test-leaf',{page:'2'});
  assert.equal(first.total,23);assert.equal(first.items.length,20);assert.equal(second.items.length,3);assert.equal(new Set([...first.items,...second.items].map(x=>x.question_id)).size,23);
  assert.equal((await app.inject('/api/admin/stage2/knowledge-tree')).statusCode,401);assert.equal((await app.inject('/api/admin/stage2/knowledge-tree/test-leaf/questions')).statusCode,401);assert.equal((await app.inject({method:'POST',url:'/api/admin/stage2/objective-annotations',payload:{}})).statusCode,403); // Missing Origin/CSRF is rejected before authentication.
 }finally{await app.close();db.close();}
});
