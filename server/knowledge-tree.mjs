import {exact,fail} from './security.mjs';
import {importAnalysis,catalogRevision,questionDetail} from './stage2.mjs';
const SUBJECT='fr-objective';
const read=JSON.parse;
const objective=q=>['choice','verb_form'].includes(q.responseType);
export function importObjectiveAnnotation(db,body){
 exact(body,['id','questionVersionId','primaryId','basis','keyEvidence','runId','review','expectedCatalogRevision']);
 if(body.expectedCatalogRevision!==catalogRevision(db))fail(409,'REVISION_CONFLICT');
 const q=questionDetail(db,body.questionVersionId);if(!objective(q))fail(422,'OBJECTIVE_ONLY');
 const point=db.prepare('SELECT * FROM qb_knowledge_points WHERE id=? AND subject=?').get(body.primaryId,SUBJECT);if(!point)fail(422,'UNKNOWN_OBJECTIVE_POINT');
 if(db.prepare('SELECT 1 FROM qb_knowledge_closure WHERE ancestor_id=? AND distance>0').get(point.id))fail(422,'PRIMARY_MUST_BE_LEAF');
 return importAnalysis(db,{id:body.id,questionVersionId:body.questionVersionId,answerSetId:q.answer?.id??null,catalogRevision:body.expectedCatalogRevision,producer:'Codex objective annotation',runId:body.runId,conclusion:'主知识点：'+point.name,primaryId:point.id,auxiliaryIds:[],methodId:null,basis:body.basis,keyEvidence:body.keyEvidence,boundary:point.definition,distractors:[],issues:body.review.decision==='agree'?[]:[body.review.reason],review:body.review});
}
function checkYear(query){exact(query,['year'],[]);if(query.year!==undefined&&!/^\d{4}$/.test(query.year))fail(400,'INVALID_YEAR');}
function records(db,year){
 const clauses=year?' AND p.year=?':'',args=year?[year]:[];
 const base=` JOIN qb_question_versions v ON v.id=c.question_version_id JOIN qb_questions q ON q.id=v.question_id JOIN qb_papers p ON p.id=q.paper_id JOIN qb_question_knowledge l ON l.classification_id=c.id AND l.role='primary' JOIN qb_knowledge_points k ON k.id=l.knowledge_id JOIN qb_question_types t ON t.id=v.type_id WHERE k.subject='${SUBJECT}' AND v.response_type IN ('choice','verb_form')`;
 const rows=db.prepare(`SELECT c.id,c.analysis_id,c.catalog_revision,v.id AS versionId,v.version,v.question_id,v.type_id AS typeId,v.original_label AS label,v.text,p.year,k.id AS primaryId,k.name AS primaryName,t.label AS typeLabel FROM qb_classification_sets c ${base}${clauses} ORDER BY v.version DESC,c.rowid DESC`).all(...args);
 const latest=new Map();for(const row of rows)if(!latest.has(row.question_id))latest.set(row.question_id,row);
 const result=[],active=new Set();
 // Published combinations remain visible even if a newer unreviewed analysis exists.
 const effective=db.prepare(`SELECT c.id,c.analysis_id,c.catalog_revision,v.id AS versionId,v.version,v.question_id,v.type_id AS typeId,v.original_label AS label,v.text,p.year,k.id AS primaryId,k.name AS primaryName,t.label AS typeLabel FROM qb_effective_items e JOIN qb_classification_sets c ON c.id=e.classification_id ${base}${clauses}`).all(...args);
 for(const row of effective){const q=questionDetail(db,row.versionId);if(q.samePointSearchable){result.push({...row,status:'available',reason:'内容与当前主知识点分类均已核验发布'});active.add(row.id);}}
 for(const row of latest.values())if(!active.has(row.id)){
  const a=read(db.prepare('SELECT payload FROM qb_analysis_versions WHERE id=?').get(row.analysis_id).payload);
  const q=questionDetail(db,row.versionId);
  const reason=row.catalog_revision!==catalogRevision(db)?'目录已修订，分类待重新复核':a.review.decision!=='agree'?a.review.reason:q.issues.length?'来源内容仍有阻断问题':'分类尚未审核发布';
  result.push({...row,status:'pending',reason});
 }
 return result;
}
export function objectiveKnowledgeTree(db,query={}){
 checkYear(query);const items=records(db,query.year),nodes=db.prepare("SELECT id,parent_id AS parentId,name,definition,status FROM qb_knowledge_points WHERE subject=? AND status!='merged' ORDER BY rowid").all(SUBJECT),index=new Map(nodes.map(n=>[n.id,n]));
 for(const n of nodes){n.available=new Set();n.pending=new Set();n.directAvailable=0;n.directPending=0;}
 for(const r of items){const own=index.get(r.primaryId);if(!own)continue;if(r.status==='available')own.directAvailable++;else own.directPending++;
  let id=r.primaryId;const seen=new Set();while(id){if(seen.has(id))fail(500,'KNOWLEDGE_CYCLE');seen.add(id);const n=index.get(id);if(!n)break;n[r.status==='available'?'available':'pending'].add(r.question_id);id=n.parentId;}
 }
 const available=new Set(items.filter(x=>x.status==='available').map(x=>x.question_id)),pending=new Set(items.filter(x=>x.status==='pending').map(x=>x.question_id));
 return {catalogRevision:catalogRevision(db),subject:SUBJECT,totalQuestions:new Set(items.map(x=>x.question_id)).size,available:available.size,pending:pending.size,years:[...new Set(items.map(x=>x.year))].sort(),nodes:nodes.map(n=>({...n,leaf:!nodes.some(c=>c.parentId===n.id),available:n.available.size,pending:n.pending.size})),defaultNode:nodes.find(n=>n.id==='obj-possessive'&&n.available.size)?.id??nodes.find(n=>n.directAvailable)?.id??nodes.find(n=>n.directPending)?.id??null};
}
export function objectiveNodeQuestions(db,nodeId,query={}){
 exact(query,['status','page','typeId','year'],[]);if(!db.prepare('SELECT 1 FROM qb_knowledge_points WHERE id=? AND subject=?').get(nodeId,SUBJECT))fail(404,'NODE_NOT_FOUND');
 const status=query.status??'available';if(!['available','pending'].includes(status))fail(400,'INVALID_STATUS');
 if(query.page!==undefined&&!/^[1-9]\d{0,5}$/.test(query.page))fail(400,'INVALID_PAGE');if(query.year!==undefined&&!/^\d{4}$/.test(query.year))fail(400,'INVALID_YEAR');
 const descendants=new Set(db.prepare('SELECT descendant_id FROM qb_knowledge_closure WHERE ancestor_id=?').all(nodeId).map(x=>x.descendant_id));
 const all=records(db,query.year).filter(x=>x.status===status&&descendants.has(x.primaryId));
 const groups=[...new Set(all.map(x=>x.typeId))].map(typeId=>({typeId,label:all.find(x=>x.typeId===typeId).typeLabel,total:new Set(all.filter(x=>x.typeId===typeId).map(x=>x.question_id)).size}));
 const unique=new Map();for(const r of all.filter(x=>!query.typeId||x.typeId===query.typeId))unique.set(r.question_id,r);
 const filtered=[...unique.values()].sort((a,b)=>a.typeId.localeCompare(b.typeId)||b.year-a.year||Number(a.label)-Number(b.label)||a.label.localeCompare(b.label));
 const page=Number(query.page??1),pageSize=20;
 const items=filtered.slice((page-1)*pageSize,page*pageSize).map(r=>{const a=read(db.prepare('SELECT payload FROM qb_analysis_versions WHERE id=?').get(r.analysis_id).payload);return {...r,basis:a.basis,keyEvidence:a.keyEvidence,review:a.review};});
 return {nodeId,status,page,pageSize,total:filtered.length,groups,items};
}
export function registerKnowledgeTree(app,{db,admin}){
 const root='/api/admin/stage2';
 app.post(root+'/objective-annotations',async req=>{admin(req);return importObjectiveAnnotation(db,req.body);});
 app.get(root+'/knowledge-tree',async req=>{admin(req);return objectiveKnowledgeTree(db,req.query);});
 app.get(root+'/knowledge-tree/:id/questions',async req=>{admin(req);return objectiveNodeQuestions(db,req.params.id,req.query);});
}
