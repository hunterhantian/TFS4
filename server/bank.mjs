import {fail,exact,integer,string} from './security.mjs';
import {importCandidate,validateBankImport,fingerprint} from './bank-import.mjs';
const normalized=s=>s.normalize('NFKC').trim().toLocaleLowerCase('fr');
const stamp=()=>new Date().toISOString();
export function questionIssues(q){const claims=[...(q.explanation?.quote||'').matchAll(/(?:正确答案[是为：:\s]*|答案选\s*)([A-D])(?:[.．、\s（(]|$)/g)].map(m=>m[1]);return [...new Set(claims)].filter(c=>c!==q.answer.value).map(c=>`解析中出现答案${c}，与指定参考答案${q.answer.value}不同；须核对并保留指定判分答案`);}
function batch(db,id){const row=db.prepare('SELECT * FROM bank_imports WHERE id=?').get(id);if(!row)fail(404,'NOT_FOUND');if(row.status!=='candidate')fail(422,'INVALID_BATCH','错误批次须修正后重新导入');return JSON.parse(row.payload);}
function state(db,id){return db.prepare('SELECT revision FROM bank_review_state WHERE import_id=?').get(id)?.revision||0;}
function lock(db,id,revision){integer(revision);if(state(db,id)!==revision)fail(409,'REVIEW_CONFLICT','审核已被其他操作更新，请重新读取');if(db.prepare('SELECT id FROM bank_publications WHERE import_id=?').get(id))fail(409,'PUBLISHED_IMMUTABLE','此版本已发布；修改须导入新来源版本');}
function audit(db,id,action,payload,actor){db.prepare('INSERT INTO bank_audit(import_id,action,payload,actor,created_at) VALUES (?,?,?,?,?)').run(id,action,JSON.stringify(payload),actor,stamp());db.prepare('INSERT INTO bank_review_state VALUES (?,1) ON CONFLICT(import_id) DO UPDATE SET revision=revision+1').run(id);return state(db,id);}
export function bankDetail(db,id){const data=batch(db,id);return {id,payload:data,issues:Object.fromEntries(data.questions.map(q=>[q.id,questionIssues(q)]).filter(([,v])=>v.length)),revision:state(db,id),reviews:db.prepare('SELECT question_id AS questionId,status,reason,actor,reviewed_at AS reviewedAt FROM bank_reviews WHERE import_id=?').all(id),confirmations:db.prepare('SELECT document_id AS documentId,reason,actor,confirmed_at AS confirmedAt FROM bank_document_confirmations WHERE import_id=?').all(id),publication:db.prepare('SELECT id,published_at AS publishedAt FROM bank_publications WHERE import_id=?').get(id)||null,audit:db.prepare('SELECT action,payload,actor,created_at AS createdAt FROM bank_audit WHERE import_id=? ORDER BY id').all(id).map(r=>({...r,payload:JSON.parse(r.payload)}))};}
function confirmed(db,id,data,documentId){return data.documents.find(d=>d.id===documentId)?.provenance==='user_confirmed_reference'||!!db.prepare('SELECT 1 FROM bank_document_confirmations WHERE import_id=? AND document_id=?').get(id,documentId);}
export function contentDetail(db,id){const data=batch(db,id);return {id,payload:data,revision:db.prepare('SELECT revision FROM bank_content_state WHERE import_id=?').get(id)?.revision||0,reviews:db.prepare('SELECT question_id AS questionId,status,reason,reviewed_at AS reviewedAt FROM bank_content_reviews WHERE import_id=?').all(id),issues:Object.fromEntries(data.questions.map(q=>[q.id,questionIssues(q)]).filter(([,v])=>v.length))};}
export function reviewContent(db,id,body,actor){
 exact(body,['expectedRevision','questionIds','decision','reason'],['expectedRevision','questionIds','decision']);integer(body.expectedRevision);
 if(!['approved','returned'].includes(body.decision)||!Array.isArray(body.questionIds)||!body.questionIds.length||body.questionIds.length>2000||new Set(body.questionIds).size!==body.questionIds.length)fail(400,'INVALID_REVIEW');
 if(body.reason!==undefined)string(body.reason,0,2000);
 return db.transaction(()=>{const data=batch(db,id),current=db.prepare('SELECT revision FROM bank_content_state WHERE import_id=?').get(id)?.revision||0;if(current!==body.expectedRevision)fail(409,'REVIEW_CONFLICT','内容审核已更新，请刷新后重试');
  for(const qid of body.questionIds)if(!data.questions.some(q=>q.id===qid))fail(400,'UNKNOWN_QUESTION');
  const reason=body.reason?.trim()||(body.decision==='approved'?'内容审核通过':'内容退回修改');
  for(const qid of body.questionIds)db.prepare('INSERT INTO bank_content_reviews VALUES (?,?,?,?,?,?) ON CONFLICT(import_id,question_id) DO UPDATE SET status=excluded.status,reason=excluded.reason,actor=excluded.actor,reviewed_at=excluded.reviewed_at').run(id,qid,body.decision,reason,actor,stamp());
  db.prepare('INSERT INTO bank_content_state VALUES (?,1) ON CONFLICT(import_id) DO UPDATE SET revision=revision+1').run(id);db.prepare('INSERT INTO bank_content_audit(import_id,payload,actor,created_at) VALUES (?,?,?,?)').run(id,JSON.stringify({...body,reason}),actor,stamp());return {revision:current+1,reviewed:body.questionIds.length,decision:body.decision};
 })();
}
const contentApproved=(db,id,qid)=>db.prepare("SELECT 1 FROM bank_content_reviews WHERE import_id=? AND question_id=? AND status='approved'").get(id,qid);
function eligible(db,id,data,q){return q.classification&&q.explanation&&confirmed(db,id,data,q.explanation.documentId)&&confirmed(db,id,data,q.answer.evidence.documentId);}
export function reviewBatch(db,id,body,actor){
 exact(body,['expectedRevision','questionIds','decision','reason','acknowledgeIssues'],['expectedRevision','questionIds','decision','reason']);integer(body.expectedRevision);string(body.reason,1,2000);if(!body.reason.trim())fail(400,'INVALID_REVIEW');if(body.acknowledgeIssues!==undefined&&typeof body.acknowledgeIssues!=='boolean')fail(400,'INVALID_REVIEW');
 if(!['approved','returned'].includes(body.decision)||!Array.isArray(body.questionIds)||!body.questionIds.length||body.questionIds.length>2000||new Set(body.questionIds).size!==body.questionIds.length)fail(400,'INVALID_REVIEW');
 return db.transaction(()=>{const data=batch(db,id);lock(db,id,body.expectedRevision);for(const qid of body.questionIds){const q=data.questions.find(q=>q.id===qid);if(!q)fail(400,'UNKNOWN_QUESTION');if(body.decision==='approved'&&!eligible(db,id,data,q))fail(422,'UNVERIFIED_EVIDENCE','缺少分类/解析，或答案/解析来源尚未人工确认，不能通过');}
  if(body.decision==='approved'&&!body.acknowledgeIssues&&data.questions.some(q=>body.questionIds.includes(q.id)&&questionIssues(q).length))fail(422,'ANSWER_EXPLANATION_CONFLICT','解析与指定答案有冲突；须显式确认已核对并记录处置说明');
  for(const qid of body.questionIds)db.prepare('INSERT INTO bank_reviews VALUES (?,?,?,?,?,?) ON CONFLICT(import_id,question_id) DO UPDATE SET status=excluded.status,reason=excluded.reason,actor=excluded.actor,reviewed_at=excluded.reviewed_at').run(id,qid,body.decision,body.reason,actor,stamp());
  return {revision:audit(db,id,'review',body,actor)};
 })();
}
export function confirmDocuments(db,id,body,actor){
 exact(body,['expectedRevision','documentIds','reason']);string(body.reason,1,2000);if(!body.reason.trim())fail(400,'INVALID_REASON');
 if(!Array.isArray(body.documentIds)||!body.documentIds.length||new Set(body.documentIds).size!==body.documentIds.length)fail(400,'INVALID_DOCUMENTS');
 return db.transaction(()=>{const data=batch(db,id);lock(db,id,body.expectedRevision);for(const documentId of body.documentIds){if(!data.documents.some(d=>d.id===documentId))fail(400,'UNKNOWN_DOCUMENT');db.prepare('INSERT OR REPLACE INTO bank_document_confirmations VALUES (?,?,?,?,?)').run(id,documentId,body.reason,actor,stamp());}return {revision:audit(db,id,'confirm-documents',body,actor)};})();
}

export function publishBatch(db,id,body,actor){
 exact(body,['expectedRevision']);
 return db.transaction(()=>{
  const prior=db.prepare('SELECT id FROM bank_publications WHERE import_id=?').get(id);if(prior)return {publicationId:prior.id,duplicate:true};
  const data=batch(db,id);lock(db,id,body.expectedRevision);
  if(!validateBankImport(data).valid)fail(422,'INVALID_BATCH');
  const approved=new Set(db.prepare("SELECT question_id FROM bank_reviews WHERE import_id=? AND status='approved'").all(id).map(r=>r.question_id));
  if(!approved.size)fail(422,'NOTHING_APPROVED','尚无审核通过的关联');
  for(const qid of approved)if(!contentApproved(db,id,qid))fail(422,'CONTENT_NOT_APPROVED','题目内容尚未审核通过；内容审核与AI关联审核相互独立');
  for(const q of data.questions)if(approved.has(q.id)&&!eligible(db,id,data,q))fail(422,'UNVERIFIED_EVIDENCE');
  const latest=db.prepare('SELECT source_version FROM bank_publications WHERE source_id=? ORDER BY source_version DESC LIMIT 1').get(data.source.id);
  if(latest&&latest.source_version>=data.source.version)fail(409,'STALE_SOURCE_VERSION','已有更新的正式版本，不能回退发布');
  for(const type of data.types){const existing=db.prepare('SELECT label FROM bank_types WHERE id=? LIMIT 1').get(type.id);if(existing&&normalized(existing.label)!==normalized(type.label))fail(409,'TYPE_ID_CONFLICT','题型ID已用于其他名称，请先统一题型标识');}
  // A question version identifies its immutable content, including answer/material.
  for(const q of data.questions){const rows=db.prepare('SELECT q.payload,p.payload AS source FROM bank_questions q JOIN bank_publications p ON p.id=q.publication_id WHERE p.source_id=? AND q.id=? AND q.version=?').all(data.source.id,q.id,q.version);for(const r of rows){const old=JSON.parse(r.payload),oldData=JSON.parse(r.source);const content=(question,source)=>({text:question.text,options:question.options,answer:question.answer,partId:question.partId,typeId:question.typeId,material:source.materials.find(m=>m.id===question.materialId)||null});if(fingerprint(content(old,oldData))!==fingerprint(content(q,data)))fail(409,'QUESTION_VERSION_REUSED','题面、材料、答案或题型变化须增加题目版本');}}
  const usedPoints=new Set(data.questions.filter(q=>approved.has(q.id)).flatMap(q=>[q.classification.primaryId,...q.classification.auxiliaryIds]));
  for(const k of data.knowledgePoints.filter(k=>usedPoints.has(k.id))){const old=db.prepare('SELECT name FROM bank_knowledge WHERE id=?').get(k.id);if(old&&normalized(old.name)!==normalized(k.name))fail(409,'KNOWLEDGE_ID_CONFLICT','考点ID已有其他规范名');db.prepare('INSERT OR IGNORE INTO bank_knowledge VALUES (?,?)').run(k.id,k.name);for(const name of [k.name,...k.aliases]){const n=normalized(name),existing=db.prepare('SELECT knowledge_id FROM bank_knowledge_names WHERE normalized=?').get(n);if(existing&&existing.knowledge_id!==k.id)fail(409,'KNOWLEDGE_ALIAS_CONFLICT','同义名已属于其他考点，请统一后修订');db.prepare('INSERT OR IGNORE INTO bank_knowledge_names VALUES (?,?,?)').run(n,k.id,name);}}
  const publicationId=Number(db.prepare('INSERT INTO bank_publications(import_id,source_id,source_version,payload,actor,published_at) VALUES (?,?,?,?,?,?)').run(id,data.source.id,data.source.version,JSON.stringify(data),actor,stamp()).lastInsertRowid);
  for(const p of data.parts)db.prepare('INSERT INTO bank_parts VALUES (?,?,?,?,?)').run(publicationId,p.id,p.label,p.component,p.order);
  for(const t of data.types)db.prepare('INSERT INTO bank_types VALUES (?,?,?)').run(publicationId,t.id,t.label);
  for(const m of data.materials)db.prepare('INSERT INTO bank_materials VALUES (?,?,?)').run(publicationId,m.id,JSON.stringify(m));
  for(const q of data.questions)db.prepare('INSERT INTO bank_questions VALUES (?,?,?,?,?,?,?,?,?)').run(publicationId,q.id,q.version,q.typeId,q.partId,q.materialId,approved.has(q.id)?q.classification.primaryId:null,JSON.stringify(approved.has(q.id)?q.classification.auxiliaryIds:[]),JSON.stringify(q));
  audit(db,id,'publish',{publicationId,approved:[...approved]},actor);return {publicationId,approved:approved.size,duplicate:false};
 })();
}

export function importClassifications(db,id,body,actor){
 exact(body,['sourceVersion','revisionNote','knowledgePoints','classifications','producer']);integer(body.sourceVersion,1);string(body.producer,1,200);string(body.revisionNote,1,2000);
 const data=batch(db,id);if(body.sourceVersion<=data.source.version)fail(400,'NEW_VERSION_REQUIRED');
 if(!Array.isArray(body.classifications)||!body.classifications.length)fail(400,'INVALID_CLASSIFICATIONS');
 const seen=new Set();for(const c of body.classifications){exact(c,['questionId','primaryId','auxiliaryIds','basis']);if(seen.has(c.questionId)||!data.questions.some(q=>q.id===c.questionId))fail(400,'UNKNOWN_OR_DUPLICATE_QUESTION');seen.add(c.questionId);}
 data.source.version=body.sourceVersion;data.source.revisionNote=body.revisionNote;data.knowledgePoints=body.knowledgePoints;
 // This is a replacement batch, no approvals or unmentioned classifications carry over.
 for(const q of data.questions){const c=body.classifications.find(c=>c.questionId===q.id);q.classification=c?{primaryId:c.primaryId,auxiliaryIds:c.auxiliaryIds,basis:c.basis,producer:body.producer}:null;}
 const checked=validateBankImport(data);if(!checked.valid)return {status:'invalid',...checked};
 return db.transaction(()=>{const result=importCandidate(db,data,actor);if(!result.duplicate){db.prepare('INSERT INTO bank_content_reviews SELECT ?,question_id,status,reason,actor,reviewed_at FROM bank_content_reviews WHERE import_id=?').run(result.id,id);db.prepare('INSERT INTO bank_content_audit(import_id,payload,actor,created_at) VALUES (?,?,?,?)').run(result.id,JSON.stringify({action:'inherit-unchanged-content',fromImportId:id}),actor,stamp());}return result;})();
}

export function relatedForReport(db,reportId,questionId,account){
 const report=db.prepare('SELECT * FROM reports WHERE id=?').get(reportId);if(!report||(report.owner_id!==account.id&&account.role!=='admin'))fail(404,'NOT_FOUND');
 const frozen=JSON.parse(report.payload),item=frozen.items.find(i=>i.question.id===questionId);if(!item)fail(404,'NOT_FOUND');
 const publications=db.prepare('SELECT * FROM bank_publications p WHERE source_version=(SELECT max(source_version) FROM bank_publications WHERE source_id=p.source_id)').all();
 const source=publications.find(p=>p.source_id===frozen.sourceId);if(!source)return {items:[],reason:'此来源尚无已发布的审核关联'};
 if(!contentApproved(db,source.import_id,questionId))return {items:[],reason:'此题内容尚未审核通过，暂不使用关联'};
 const anchor=db.prepare('SELECT * FROM bank_questions WHERE publication_id=? AND id=? AND version=?').get(source.id,questionId,item.question.version);
 if(!anchor?.primary_id)return {items:[],reason:'此题版本尚无已审核发布的主考点关联'};
 const anchorQuestion=JSON.parse(anchor.payload);
 if(fingerprint({text:anchorQuestion.text,options:anchorQuestion.options,answer:anchorQuestion.answer.value})!==fingerprint({text:item.question.text,options:item.question.options,answer:item.question.answer.value}))return {items:[],reason:'此报告的冻结题目内容与当前题库版本不一致，未套用新关联'};
 const anchorPart=JSON.parse(source.payload).parts.find(p=>p.id===anchor.part_id);const items=[];
 for(const pub of publications){const data=JSON.parse(pub.payload);const rows=db.prepare('SELECT * FROM bank_questions WHERE publication_id=? AND type_id=? AND primary_id=? ORDER BY rowid').all(pub.id,anchor.type_id,anchor.primary_id);
  for(const row of rows){if(pub.source_id===source.source_id&&row.id===questionId)continue;if(!contentApproved(db,pub.import_id,row.id))continue;const q=JSON.parse(row.payload);if(data.parts.find(p=>p.id===q.partId)?.component!==anchorPart.component)continue;
   const material=data.materials.find(m=>m.id===q.materialId)||null;
   const history=db.prepare("SELECT e.result,e.choice,e.occurred_at AS occurredAt FROM response_events e JOIN attempts a ON a.id=e.attempt_id WHERE e.owner_id=? AND e.question_id=? AND json_extract(a.snapshot,'$.id')=? ORDER BY e.occurred_at DESC,e.id DESC").all(account.id,q.id,pub.source_id);
   const group=material?material.questionIds.map(id=>data.questions.find(q=>q.id===id)).map(q=>({id:q.id,originalNo:q.originalNo,text:q.text,options:q.options})):[];
   items.push({question:q,source:data.source,material,group,knowledge:db.prepare('SELECT id,name FROM bank_knowledge WHERE id=?').get(row.primary_id),history:{attempted:history.length>0,attempts:history.length,wrongCount:history.filter(h=>h.result==='wrong').length,latest:history[0]||null}});
  }
 }
 items.sort((a,b)=>Number(a.history.attempted)-Number(b.history.attempted)||b.source.year-a.source.year||a.question.originalNo-b.question.originalNo);
 return {items,reason:items.length?null:'暂无其他已审核的同题型、同主考点题目'};
}

export function registerBank(app,{db,admin}){
 app.get('/api/admin/bank/batches/:id/content',async req=>{admin(req);return contentDetail(db,req.params.id);});
 app.post('/api/admin/bank/batches/:id/content-review',async req=>{admin(req);return reviewContent(db,req.params.id,req.body,req.account.id);});
 app.get('/api/admin/bank/batches/:id',async req=>{admin(req);return bankDetail(db,req.params.id);});
 app.post('/api/admin/bank/batches/:id/review',async req=>{admin(req);return reviewBatch(db,req.params.id,req.body,req.account.id);});
 app.post('/api/admin/bank/batches/:id/confirm-documents',async req=>{admin(req);return confirmDocuments(db,req.params.id,req.body,req.account.id);});
 app.post('/api/admin/bank/batches/:id/publish',async req=>{admin(req);return publishBatch(db,req.params.id,req.body,req.account.id);});
 app.post('/api/admin/bank/batches/:id/classifications',async req=>{admin(req);return importClassifications(db,req.params.id,req.body,req.account.id);});
 app.get('/api/reports/:id/questions/:questionId/related',async req=>relatedForReport(db,req.params.id,req.params.questionId,req.account));
}
