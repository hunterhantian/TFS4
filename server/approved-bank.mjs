import {fail,exact} from './security.mjs';

// An unreviewed new version leaves the last reviewed content visible. A returned
// new version withdraws it; older approvals must not resurface or duplicate it.
export function approvedContent(db){
 const rows=db.prepare("SELECT b.id,b.source_id,b.source_version,b.payload FROM bank_imports b WHERE b.status='candidate' AND EXISTS(SELECT 1 FROM bank_content_reviews r WHERE r.import_id=b.id) ORDER BY b.source_version DESC").all();
 const reviews=new Map();for(const r of db.prepare('SELECT * FROM bank_content_reviews').all()){if(!reviews.has(r.import_id))reviews.set(r.import_id,[]);reviews.get(r.import_id).push(r);}
 const seen=new Set(),items=[];
 for(const row of rows){const data=JSON.parse(row.payload),questions=new Map(data.questions.map(q=>[q.id,q]));for(const r of reviews.get(row.id)||[]){const key=JSON.stringify([row.source_id,r.question_id]);if(seen.has(key))continue;seen.add(key);if(r.status!=='approved')continue;const q=questions.get(r.question_id);if(q)items.push({importId:row.id,data,question:q,reviewedAt:r.reviewed_at});}}
 return items.sort((a,b)=>b.data.source.year-a.data.source.year||a.data.source.id.localeCompare(b.data.source.id)||a.question.originalNo-b.question.originalNo);
}
export function listApproved(db,query={}){
 exact(query,['year','typeId','page'],[]);
 if(query.year!==undefined&&(typeof query.year!=='string'||!/^\d{4}$/.test(query.year)))fail(400,'INVALID_YEAR');
 if(query.typeId!==undefined&&(typeof query.typeId!=='string'||!/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,127}$/.test(query.typeId)))fail(400,'INVALID_TYPE');
 if(query.page!==undefined&&(typeof query.page!=='string'||!/^\d{1,8}$/.test(query.page)||Number(query.page)<1))fail(400,'INVALID_PAGE');
 const all=approvedContent(db),years=[...new Set(all.map(i=>i.data.source.year))].sort((a,b)=>b-a),types=new Map();
 for(const i of all){const type=i.data.types.find(t=>t.id===i.question.typeId);types.set(type.id,type.label);}
 const filtered=all.filter(i=>(query.year===undefined||i.data.source.year===Number(query.year))&&(query.typeId===undefined||i.question.typeId===query.typeId));const pageSize=25,pages=Math.max(1,Math.ceil(filtered.length/pageSize)),page=Math.min(Number(query.page||1),pages);
 return {total:filtered.length,totalApproved:all.length,page,pageSize,pages,years,types:[...types].map(([id,label])=>({id,label})),items:filtered.slice((page-1)*pageSize,page*pageSize).map(i=>({importId:i.importId,id:i.question.id,version:i.question.version,originalNo:i.question.originalNo,text:i.question.text,year:i.data.source.year,sourceId:i.data.source.id,sourceTitle:i.data.source.title,sourceVersion:i.data.source.version,typeId:i.question.typeId,typeLabel:i.data.types.find(t=>t.id===i.question.typeId).label,partLabel:i.data.parts.find(p=>p.id===i.question.partId).label,reviewedAt:i.reviewedAt}))};
}
export function approvedDetail(db,importId,questionId){const row=approvedContent(db).find(i=>i.importId===importId&&i.question.id===questionId);if(!row)fail(404,'NOT_FOUND','此题当前不在已审核题库中，请刷新列表');const q=row.question;return {question:{id:q.id,version:q.version,originalNo:q.originalNo,text:q.text,options:q.options,answer:q.answer,explanation:q.explanation},source:row.data.source,documents:row.data.documents,material:row.data.materials.find(m=>m.id===q.materialId)||null,reviewedAt:row.reviewedAt};}
export function registerApprovedBank(app,{db,admin}){
 app.get('/api/admin/bank/approved',async req=>{admin(req);return listApproved(db,req.query);});
 app.get('/api/admin/bank/approved/:importId/questions/:questionId',async req=>{admin(req);return approvedDetail(db,req.params.importId,req.params.questionId);});
}
