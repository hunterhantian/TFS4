// Authored calibration decisions for 50 real questions; never extrapolate to all exams.
import fs from 'node:fs';
import path from 'node:path';
import {openDatabase} from '../server/db.mjs';
import {saveKnowledge,catalogRevision,importContent,importAnalysis,reviewItem,releaseItems,questionDetail,relatedQuestions} from '../server/stage2.mjs';
const [dbFile,pilotRoot,output]=process.argv.slice(2);if(!dbFile||!pilotRoot||!output||fs.existsSync(output))throw Error('Usage: stage2-calibrate.mjs DB PILOT_CONTENT NEW_OUTPUT');
const concepts={
 interrogative:['疑问代词lequel的选择','按被替代名词的性数选择lequel系列','不能把疑问限定词quel放在缺少中心名词的位置'],
 pronominalAgreement:['代词式动词过去分词配合','判断se的句法功能及直接宾语位置','身体部位直接宾语后置时，se作间接宾语，不随主语配合'],
 servirDe:['servir de的名词补语','servir de加身份或用途名词','区别se servir de表示使用'],
 quoiQue:['quoi que引导的让步结构','无论什么，对应quoi que加虚拟式','区别表示尽管的quoique和性数配合的quel que'],
 possessive:['主有代词的性数与介词','按被替代名词性数选择主有代词，并保留支配介词','主有代词的性数取决于物，不取决于所有者性别'],
 preferer:['préférer的比较补语','préférer A à B并处理介词冠词缩合','不采用英语式que比较结构'],
 passeAnterieur:['过去先完成时的先时关系','叙述以简单过去时为参照，dès que从句表达先完成','不能一见过去时间就选愈过去时'],
 vieux:['vieux的元音前阳性变体','阳性单数元音或哑音h前用vieil','阴性仍用vieille；有声h不套此条件'],
 toutPronom:['tout的不定代词用法','tout独立作主语表示一切','区别限定词及tout副词用法'],
 durationPour:['pour表示预计持续时间','en avoir pour加预计所需时长','区别pendant实际持续、dans距现在多久、en完成耗时'],
 causePuisque:['puisque表示已知原因','用已知或作为前提的原因引出结论','区别信息性回答原因的parce que及转折词'],
 futurAnterieur:['先将来时的先时关系','未来参照下，dès que从句动作先完成','不因汉语将来从句习惯误用现在完成时'],
 tenirA:['tenir à的动词补语','tenir à加不定式表达坚持或重视','区别tenir de、tenir pour的其他义项'],
 presentatif:['voilà前的宾语代词','根据被呈现对象性数选择le/la/les','不要把en当作一般复数直接宾语替代'],
 cliticOrder:['直接间接宾语代词顺序','先识别各宾语指代，再排列la/le与lui/leur','阳性女性及人与物的指代不能只按位置套用'],
 enService:['en service固定介词结构','mise或mettre en service表示投入使用','其他介词的组合不能任意互换'],
 finirPar:['finir par表示最终结果','finir par加不定式表示经过过程终于发生','finir de指结束某活动，语义不同'],
 coi:['间接宾语人称代词','téléphoner à等结构的人称间接宾语用lui/leur','直接宾语le/la与重读人称代词不能替代'],
 soi:['泛指主语对应soi','on/chacun等泛指主语的重读反身代词用soi','特指人称与泛指反身需区分'],
 distinguer:['distinguer A de B','distinguer两项对象的介词配价','不能照搬比较或相互关系的其他介词'],
 commeSi:['comme si的时态','假设与现在事实相反或类比时用未完成过去时','不直接使用条件式或普通现在时'],
 unitPrice:['单位价格表达','按计价句式选择le kilo或à l’heure','句式不同，不能将le与à机械替换'],
 adverbInvariant:['形容词转副词的不变形式','coûter cher中cher修饰动词不作配合','不能因主语复数或阴性而改变副词形式'],
 compoundPlural:['复合名词的复数','chef-d’œuvre等复合名词按构词关系配合','不能简单把各组成词都变复数'],
 colour:['复合颜色形容词不配合','bleu ciel等颜色复合结构保持不变','区别单一普通颜色形容词的配合'],
 relatifCOD:['关系代词que作直接宾语','在从句中确定空位是直接宾语','不能根据先行词含义直接选择dont或où'],
 obeir:['obéir à的间接补语','obéir支配à引入服从对象','不要把常见其他动词的介词迁移到此'],
 causePour:['pour加过去不定式表原因','pour avoir fait表达因已发生行为受罚','区别目的用法与à cause de名词结构'],
 concession:['en dépit de引导让步','与预期相反的名词性背景用让步介词','原因介词不能表达虽然的关系'],
 combien:['combien引导程度感叹','combien表达多么或程度','不是普通数量短语beaucoup的句法位置'],
 parTemps:['par tous les temps','表示不论何种天气的固定结构','时间介词不是任意可互换'],
 suiteDe:['à la suite de表事件后果','结果事件跟随前一事件发生','区别尽管、目的和施事'],
 rien:['rien与ne的否定主语','rien作主语并与ne构成否定','名词性补语可用de引入，不能直接换成tout'],
 colere:['se mettre en colère contre','表达对某人生气时使用contre','不要照搬其他情感名词的介词'],
 indefini:['不定代词与限定词区分','plusieurs独立作代词，不要求后接名词','quelques作限定词时需要名词中心语'],
 relatifDont:['dont替代de补语','识别se servir de等结构中的de补语','有介词不意味着任意复合关系代词都可用'],
 enAvoirPour:['en avoir pour表示花费','用en avoir pour une somme表达花费总额','区别地点代词y及直接宾语代词'],
 negationDe:['否定句中部分冠词变de','pas后的不定或部分数量名词通常用de','系动词、对比等例外需另行判断']
};
const labels2012=['interrogative','pronominalAgreement','servirDe','quoiQue','possessive','preferer','passeAnterieur','vieux','toutPronom','durationPour','causePuisque','futurAnterieur','tenirA','presentatif','cliticOrder','enService','finirPar','coi','soi','distinguer','commeSi','unitPrice','adverbInvariant','compoundPlural','colour'];
const labels2013=['relatifCOD','obeir','causePour','concession','interrogative','combien','parTemps','suiteDe','rien','colere','possessive','indefini','relatifDont','enAvoirPour','negationDe','soi','colere','enAvoirPour','indefini','unitPrice','possessive','durationPour','indefini','concession','concession'];
// Review exceptions are recorded rather than forced into the production search set.
const withheld=new Map([['2012-44','disc疑似dise；保留待核验'],['2012-48','B/C选项重复，未核实缺失变体'],['2012-51','MD存在重复下划线文本，须修订题面'],['2013-46','题干缺少明确空位'],['2013-55','题干缺少明确空位'],['2013-57','respect envers不是colère contre，需独立规范考点'],['2013-58','选项nc疑似ne，须来源修订'],['2013-59','需要quelques-uns系列的独立考点'],['2013-62','trop…pour不是预计时长，应独立标注'],['2013-63','un peu/peu是量词语义区别，应独立标注'],['2013-64','en revanche是转折连接词，应独立标注'],['2013-65','non seulement…mais aussi是递进并列，应独立标注']]);
fs.mkdirSync(output,{recursive:true});const db=openDatabase(dbFile),records=[],released=[];
try{
 for(const [id,name] of [['vocabulary','词汇'],['grammar','语法'],['reading','阅读'],['listening','听力'],['writing','写作'],['dictation','听写']])if(!db.prepare('SELECT 1 FROM qb_knowledge_points WHERE id=?').get('fr-'+id))saveKnowledge(db,{expectedRevision:catalogRevision(db),point:{id:'fr-'+id,subject:'fr',parentId:null,name,nameFr:'',definition:name+'能力维度',inclusions:['属于本能力分项的规范规则与任务'],exclusions:['不能因文章主题或表面词汇相似而归类'],status:'active',aliases:[]}});
 for(const [key,[name,definition,boundary]] of Object.entries(concepts))saveKnowledge(db,{expectedRevision:catalogRevision(db),point:{id:'fr-grammar-'+key,subject:'fr',parentId:'fr-grammar',name,nameFr:'',definition,inclusions:[definition],exclusions:[boundary],status:'active',aliases:[]}});
 for(const [year,labels] of [[2012,labels2012],[2013,labels2013]]){
  const data=JSON.parse(fs.readFileSync(path.join(pilotRoot,String(year),'content-v4.json'),'utf8'));data.paperVersion=2;data.revisionNote='50题真实语法校准；其余任务保持未校对';
  for(const [i,key] of labels.entries()){
   const n=i+41,q=data.questions.find(q=>q.originalLabel===String(n));const reason=withheld.get(year+'-'+n);
   if(!reason){const issue=data.issues.find(x=>x.questionId===q.id&&x.code==='MD_REVIEW_REQUIRED');issue.status='resolved';issue.message='本轮逐题核对MD原文及选项；参考答案仅映射，未生成官方解析';}
   records.push({questionId:q.id,versionId:q.id+':v1',year,number:n,primaryId:'fr-grammar-'+key,status:reason?'withheld':'checked',reason:reason??'题面与选项已核对，按决定性语法功能归类',text:q.text,options:q.options,sourceEvidence:q.evidence});
  }
  const imported=importContent(db,data,'codex-calibration');if(imported.valid===false)throw Error(JSON.stringify(imported.errors));fs.writeFileSync(path.join(output,year+'-content-v4.json'),JSON.stringify(data,null,2));
 }
 for(const record of records.filter(r=>r.status==='checked')){
  const detail=questionDetail(db,record.versionId),key=record.primaryId.replace('fr-grammar-',''),[name,definition,boundary]=concepts[key];
  const body={id:record.questionId+'-calibration-analysis-1',questionVersionId:record.versionId,answerSetId:detail.answer.id,catalogRevision:catalogRevision(db),producer:'Codex calibration first pass',runId:'calibration-primary-20261028',conclusion:'本题考查'+name+'；参考答案状态保持'+detail.answer.status,primaryId:record.primaryId,auxiliaryIds:[],methodId:null,basis:definition,keyEvidence:[{source:'question',quote:record.text}],boundary,distractors:record.options.map(o=>({key:o.key,text:o.text})),issues:[],review:{runId:'calibration-review-20261028',producer:'Codex separate review pass',independentPrimaryId:record.primaryId,decision:'agree',reason:'复核题干句法功能与候选项；排除仅按表面词汇或同一介词归类。未将参考答案映射等同于官方正确性认证。'}};
  const result=importAnalysis(db,body);let revision=detail.revision;reviewItem(db,{questionVersionId:record.versionId,expectedRevision:revision++,kind:'content',decision:'passed',reason:'已逐题核对MD中的题干、选项和证据'},'codex-calibration','ai');reviewItem(db,{questionVersionId:record.versionId,expectedRevision:revision++,kind:'classification',classificationId:result.classificationId,decision:'passed',reason:body.review.reason},'codex-calibration','ai');releaseItems(db,{items:[{questionVersionId:record.versionId,expectedRevision:revision,classificationId:result.classificationId}]},'codex-calibration');released.push(record.questionId);fs.writeFileSync(path.join(output,record.questionId+'-analysis-v1.json'),JSON.stringify(body,null,2));
 }
 const queries=records.filter(r=>r.status==='checked').map(r=>{const result=relatedQuestions(db,r.versionId,{id:'calibration-no-user'});return {id:r.questionId,related:result.items.map(x=>x.question.id),reason:result.reason};});
 const report={createdAt:new Date().toISOString(),seedCount:records.length,contentPassed:released.length,withheld:records.filter(r=>r.status==='withheld').length,fullPilotPassed:false,precisionAt5:null,recall:null,acceptance:'pending independent relevance labels and cross-type coverage; not approved for mass production',records,queries};fs.writeFileSync(path.join(output,'calibration-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({seedCount:records.length,released:released.length,withheld:report.withheld,fullPilotPassed:false}));
}finally{db.close();}
