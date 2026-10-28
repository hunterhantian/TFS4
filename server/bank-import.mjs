import {createHash,randomUUID} from 'node:crypto';
import {fail,exact} from './security.mjs';

const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const text=v=>typeof v==='string'&&v.trim().length>0;
const id=v=>typeof v==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,127}$/.test(v);
const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const positive=v=>Number.isSafeInteger(v)&&v>0;
const canonical=v=>Array.isArray(v)?v.map(canonical):object(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
export const fingerprint=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');

// Returns all useful errors without trusting externally supplied review flags.
export function validateBankImport(value){
 const errors=[],warnings=[];
 const error=(path,code,message)=>errors.push({path,code,message});
 const fields=(v,path,allowed,required=allowed)=>{
  if(!object(v)){error(path,'OBJECT_REQUIRED','需要对象');return false;}
  for(const k of Object.keys(v))if(!allowed.includes(k))error(`${path}.${k}`,'UNKNOWN_FIELD','未知字段（导入不能授予审核或发布状态）');
  for(const k of required)if(!(k in v))error(`${path}.${k}`,'REQUIRED','缺少字段');
  return true;
 };
 if(!fields(value,'$',['schemaVersion','dataset','source','documents','parts','types','materials','knowledgePoints','questions']))return {valid:false,errors,warnings};
 if(![2,3].includes(value.schemaVersion))error('$.schemaVersion','SCHEMA_VERSION','需要统一格式版本2或3');
 const v3=value.schemaVersion===3;
 if(value.dataset!=='candidate')error('$.dataset','CANDIDATE_ONLY','只接收候选数据，拒绝fixture或自行声明正式数据');
 const s=value.source;
 if(fields(s,'$.source',['id','version','year','title','revisionNote'])){
  if(!id(s.id)||!positive(s.version)||!Number.isSafeInteger(s.year)||s.year<1900||s.year>2200||!text(s.title)||!text(s.revisionNote))error('$.source','INVALID_SOURCE','来源标识、正整数版本、年份、标题及修订说明必填');
 }
 const collections={};
 for(const key of ['documents','parts','types','materials','knowledgePoints','questions']){
  const rows=value[key];collections[key]=new Map();
  if(!Array.isArray(rows)||rows.length>2000){error(`$.${key}`,'ARRAY_REQUIRED','需要不超过2000项的数组');continue;}
  rows.forEach((r,i)=>{if(!object(r)||!id(r.id)){error(`$.${key}[${i}].id`,'INVALID_ID','无效标识');return;}if(collections[key].has(r.id))error(`$.${key}[${i}].id`,'DUPLICATE_ID','标识重复');collections[key].set(r.id,r);});
 }
 if(!collections.questions.size)error('$.questions','EMPTY_QUESTIONS','至少需要一道题');
 const each=(key,fn)=>(Array.isArray(value[key])?value[key]:[]).forEach((v,i)=>{if(object(v))fn(v,`$.${key}[${i}]`);});
 each('documents',(d,p)=>{if(fields(d,p,['id','name','sha256','kind','provenance'])){
  if(!text(d.name)||!hash(d.sha256)||!['paper','answers','explanations','audio','transcript'].includes(d.kind)||!['user_confirmed_reference','unconfirmed'].includes(d.provenance))error(p,'INVALID_DOCUMENT','资料需要名称、SHA256、种类与明确来源状态');
 }});
 const components=v3?['listening','vocabulary','grammar','reading','dictation','writing']:['listening','vocabulary','grammar','reading'];
 each('parts',(r,p)=>{if(fields(r,p,['id','label','component','order'])&&(!text(r.label)||!components.includes(r.component)||!positive(r.order)))error(p,'INVALID_PART','分项名称、能力分项或顺序无效');});
 each('types',(r,p)=>{if(fields(r,p,['id','label'])&&!text(r.label))error(p,'INVALID_TYPE','需要题型名称');});
 each('materials',(r,p)=>{if(fields(r,p,['id','kind','text','audioUrl','questionIds'],['id','kind','questionIds'])){
  if(!(v3?['reading','cloze','listening','verb_form']:['reading','cloze','listening']).includes(r.kind)||(!text(r.text)&&!text(r.audioUrl))||!Array.isArray(r.questionIds)||!r.questionIds.length||new Set(r.questionIds).size!==r.questionIds.length)error(p,'INVALID_MATERIAL','材料需要内容及不重复的完整有序题号');
  if(r.audioUrl!==undefined&&!/^\/media\/[a-zA-Z0-9_.-]+$/.test(r.audioUrl))error(p+'.audioUrl','INVALID_AUDIO_URL','音频必须使用受控的/media/地址');
 }});
 const names=new Map();
 each('knowledgePoints',(r,p)=>{if(fields(r,p,['id','name','aliases'])){
  if(!text(r.name)||!Array.isArray(r.aliases)||r.aliases.some(a=>!text(a)))error(p,'INVALID_KNOWLEDGE','考点需规范名及同义名数组');
  for(const name of [r.name,...(Array.isArray(r.aliases)?r.aliases:[])])if(text(name)){const normalized=name.normalize('NFKC').trim().toLocaleLowerCase('fr');if(names.has(normalized))error(p,'DUPLICATE_ALIAS','规范名或同义名冲突');names.set(normalized,r.id);}
 }});
 const evidence=(e,p,kind)=>{
  if(!fields(e,p,['documentId','location','quote']))return;
  const d=collections.documents.get(e.documentId);
  if(!d||d.kind!==kind||!text(e.location)||!text(e.quote))error(p,'INVALID_EVIDENCE','依据需匹配资料种类并保留位置及原文');
 };
 const numbers=new Set();
 const baseQuestionFields=['id','version','originalNo','partId','typeId','materialId','text','options','answer','explanation','classification'];
 each('questions',(q,p)=>{if(!fields(q,p,v3?[...baseQuestionFields,'originalLabel','responseType','gradingMode','annotations','illustrations']:baseQuestionFields,v3?[...baseQuestionFields,'originalLabel','responseType','gradingMode','annotations']:baseQuestionFields))return;
  const choice=!v3||q.responseType==='choice';
  if(v3){
   if(!text(q.originalLabel)||!['choice','dictation','verb_form','writing','free_text'].includes(q.responseType)||q.gradingMode!==(choice?'choice':'manual'))error(p,'INVALID_RESPONSE_TYPE','保留卷面题号，选择题按选项判分；非选择题仅人工评阅');
   if(!Array.isArray(q.annotations))error(p+'.annotations','INVALID_ANNOTATIONS','原卷下划线标记须为数组');
   else for(const [i,a] of q.annotations.entries())if(fields(a,`${p}.annotations[${i}]`,['kind','start','end'])&&(a.kind!=='underline'||!Number.isSafeInteger(a.start)||!Number.isSafeInteger(a.end)||a.start<0||a.end<=a.start||a.end>Array.from(q.text||'').length))error(p+'.annotations','INVALID_ANNOTATIONS','下划线使用题干Unicode码点的左闭右开区间');
   if(q.illustrations!==undefined){
    if(!Array.isArray(q.illustrations)||q.illustrations.length>4)error(p+'.illustrations','INVALID_ILLUSTRATIONS','插图最多4张');
    else for(const [i,a] of q.illustrations.entries())if(fields(a,`${p}.illustrations[${i}]`,['documentId','page','caption','imageDataUrl'])){
     const match=typeof a.imageDataUrl==='string'&&a.imageDataUrl.match(/^data:image\/(jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/),bytes=match?Buffer.from(match[2],'base64'):null;
     const signature=bytes&&(match[1]==='jpeg'?bytes[0]===255&&bytes[1]===216:bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
     if(!collections.documents.has(a.documentId)||!positive(a.page)||!text(a.caption)||!signature||bytes.length>600000)error(p+'.illustrations','INVALID_ILLUSTRATIONS','插图须引用资料原页并嵌入600KB以内PNG/JPEG，禁止外部URL或SVG');
    }
   }
  }
  if(!positive(q.version)||!positive(q.originalNo)||numbers.has(q.originalNo)||!text(q.text))error(p,'INVALID_QUESTION','题目版本、唯一原题号和题干必填');numbers.add(q.originalNo);
  const part=collections.parts.get(q.partId);
  if(!part||!collections.types.has(q.typeId))error(p,'UNKNOWN_TAXONOMY','Part或题型不存在');
  if(choice){if(!object(q.options)||Object.keys(q.options).length<2||Object.keys(q.options).length>4||Object.entries(q.options).some(([k,v])=>!['A','B','C','D'].includes(k)||!text(v)))error(p+'.options','INVALID_OPTIONS','需要2至4个非空选项');}
  else if(!object(q.options)||Object.keys(q.options).length)error(p+'.options','INVALID_OPTIONS','非选择题options须为空对象，不能补造选项');
  if(fields(q.answer,p+'.answer',v3?['value','evidence','status','alternatives']:['value','evidence','status'],['value','evidence'])){
   if(v3&&q.answer.status==='unusable_reference'){
    if(q.answer.value!==null||q.answer.alternatives!==undefined)error(p+'.answer','INVALID_UNUSABLE_REFERENCE','无法对应卷面的参考值须保留原文证据，判分值为空');
    evidence(q.answer.evidence,p+'.answer.evidence','answers');
    warnings.push({path:p+'.answer',code:'UNUSABLE_REFERENCE',message:'参考资料无法对应本卷选项：可保存，暂不判分'});
   }else if(v3&&q.answer.status==='conflicting_reference'){
    if(q.answer.value!==null||q.answer.evidence!==null||!Array.isArray(q.answer.alternatives)||q.answer.alternatives.length<2)error(p+'.answer','INVALID_CONFLICT','冲突答案须为空，至少保留两份来源值及证据');
    else{const values=new Set();for(const [i,a] of q.answer.alternatives.entries())if(fields(a,`${p}.answer.alternatives[${i}]`,['value','evidence'])){values.add(a.value);if(choice?(!object(q.options)||!Object.hasOwn(q.options,a.value)):!text(a.value))error(p+'.answer','INVALID_CONFLICT','冲突候选值无效');evidence(a.evidence,`${p}.answer.alternatives[${i}].evidence`,'answers');}if(values.size<2)error(p+'.answer','INVALID_CONFLICT','冲突必须包含不同的参考值');}
    warnings.push({path:p+'.answer',code:'CONFLICTING_REFERENCE',message:'参考答案冲突：可审核保存，不用于正式判分或关联发布'});
   }else{
   if(q.answer.alternatives!==undefined)error(p+'.answer.alternatives','INVALID_CONFLICT','仅冲突状态可携带备选依据');
   if(q.answer.status==='missing_reference'){
    if(q.answer.value!==null||q.answer.evidence!==null)error(p+'.answer','INVALID_MISSING_ANSWER','缺参考答案时值与依据须明确为空');
    warnings.push({path:p+'.answer',code:'MISSING_REFERENCE_ANSWER',message:'缺参考答案：可审核题面，不用于正式判分或关联发布'});
   }else{if(q.answer.status!==undefined)error(p+'.answer.status','INVALID_ANSWER_STATUS','未知答案状态');if(choice?(!object(q.options)||!Object.hasOwn(q.options,q.answer.value)):!text(q.answer.value))error(p+'.answer','INVALID_ANSWER',choice?'答案不对应选项':'非选择题参考内容须为非空文本，判分方式仍为人工评阅');evidence(q.answer.evidence,p+'.answer.evidence','answers');}
   }
  }
  if(q.explanation!==null)evidence(q.explanation,p+'.explanation','explanations');
  else warnings.push({path:p+'.explanation',code:'MISSING_EXPLANATION',message:'缺少解析，不能发布知识点关联'});
  if(q.materialId!==null&&!collections.materials.has(q.materialId))error(p+'.materialId','UNKNOWN_MATERIAL','材料不存在');
  if(choice&&['reading','listening'].includes(part?.component)&&q.materialId===null)error(p+'.materialId','MATERIAL_REQUIRED','阅读、听力选择题须保留材料');
  const material=collections.materials.get(q.materialId);
  if(material&&((part?.component==='reading'&&material.kind!=='reading')||(part?.component==='listening'&&material.kind!=='listening')))error(p+'.materialId','MATERIAL_KIND_MISMATCH','阅读、听力的材料种类须匹配分项');
  if(q.classification!==null&&fields(q.classification,p+'.classification',['primaryId','auxiliaryIds','basis','producer'])){
   const c=q.classification;
   if(!collections.knowledgePoints.has(c.primaryId)||!Array.isArray(c.auxiliaryIds)||new Set(c.auxiliaryIds).size!==c.auxiliaryIds.length||c.auxiliaryIds.some(x=>x===c.primaryId||!collections.knowledgePoints.has(x))||!text(c.basis)||!text(c.producer))error(p+'.classification','INVALID_CLASSIFICATION','主辅考点、分类理由及外部生成来源无效');
   if(q.explanation===null)error(p+'.classification','MISSING_BASIS','分类必须附带解析原文依据');
  }
 });
 each('materials',(m,p)=>{if(!Array.isArray(m.questionIds))return;for(const qid of m.questionIds){const q=collections.questions.get(qid);if(!q||q.materialId!==m.id)error(p+'.questionIds','MATERIAL_MEMBERSHIP','材料题组对应关系不一致');}});
 each('questions',(q,p)=>{if(q.materialId){const members=collections.materials.get(q.materialId)?.questionIds;if(!Array.isArray(members)||!members.includes(q.id))error(p+'.materialId','MATERIAL_MEMBERSHIP','题目未列入材料完整题组');}});
 return {valid:errors.length===0,errors,warnings};
}

export function importCandidate(db,payload,actor){
 const diagnostics=validateBankImport(payload),digest=fingerprint(payload);
 return db.transaction(()=>{
  const duplicate=db.prepare('SELECT id,status,diagnostics FROM bank_imports WHERE fingerprint=?').get(digest);
  if(duplicate)return {id:duplicate.id,status:duplicate.status,duplicate:true,...JSON.parse(duplicate.diagnostics)};
  const s=payload?.source;
  if(diagnostics.valid){const papers=payload.documents.filter(d=>d.kind==='paper').map(d=>d.sha256);for(const row of db.prepare("SELECT source_id,payload FROM bank_imports WHERE status='candidate' AND source_id!=?").all(s.id)){const other=JSON.parse(row.payload);if(other.documents.some(d=>d.kind==='paper'&&papers.includes(d.sha256)))fail(409,'SOURCE_DOCUMENT_EXISTS','相同卷面资料已属于其他来源，请沿用原来源ID并增加版本');}}
  if(diagnostics.valid&&db.prepare('SELECT id FROM bank_imports WHERE source_id=? AND source_version=?').get(s.id,s.version))fail(409,'SOURCE_VERSION_EXISTS','相同来源版本内容不同；请明确增加版本并记录修订');
  const batchId=randomUUID(),status=diagnostics.valid?'candidate':'invalid';
  db.prepare('INSERT INTO bank_imports VALUES (?,?,?,?,?,?,?,?,?)').run(batchId,diagnostics.valid?s.id:null,diagnostics.valid?s.version:null,digest,status,JSON.stringify(payload),JSON.stringify(diagnostics),actor,new Date().toISOString());
  return {id:batchId,status,duplicate:false,...diagnostics};
 })();
}

export function registerBankImports(app,{db,admin}){
 app.post('/api/admin/bank/validate',async req=>{admin(req);exact(req.body,['payload']);return validateBankImport(req.body.payload);});
 app.post('/api/admin/bank/imports',async req=>{admin(req);exact(req.body,['payload']);return importCandidate(db,req.body.payload,req.account.id);});
 app.get('/api/admin/bank/imports',async req=>{admin(req);return {imports:db.prepare('SELECT id,source_id AS sourceId,source_version AS sourceVersion,status,diagnostics,created_at AS createdAt FROM bank_imports ORDER BY created_at DESC').all().map(r=>({...r,diagnostics:JSON.parse(r.diagnostics)}))};});
 app.get('/api/admin/bank/imports/:id',async req=>{admin(req);const row=db.prepare('SELECT * FROM bank_imports WHERE id=?').get(req.params.id);if(!row)fail(404,'NOT_FOUND');return {id:row.id,status:row.status,payload:JSON.parse(row.payload),diagnostics:JSON.parse(row.diagnostics)};});
}
