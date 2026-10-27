import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {importCandidate,validateBankImport,fingerprint} from './bank-import.mjs';

export const fileSha256=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
// Trusted local production workflow only. Browser uploads cannot grant proofread status.
export function validateProduction(candidate,evidence){
 const invalid=message=>{throw Error(`Invalid production evidence: ${message}`);};
 if(!validateBankImport(candidate).valid)invalid('candidate');
 if(evidence.year!==candidate.source.year||evidence.questionCount!==candidate.questions.length)invalid('year/question coverage');
 if(evidence.ocr?.mode!=='Best'||evidence.ocr.dpi!==300||evidence.ocr.forceRasterized!==true||!['fra','chi_sim'].every(l=>evidence.ocr.languages.includes(l)))invalid('Best raster OCR required');
 if(!Number.isSafeInteger(evidence.pageCount)||evidence.pageCount<1||JSON.stringify(evidence.reviewedPages)!==JSON.stringify(Array.from({length:evidence.pageCount},(_,i)=>i+1)))invalid('full page review required');
 const hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
 if(!hash(evidence.ocr.outputSha256)||!hash(evidence.candidateSha256)||!['fra','chi_sim'].every(l=>evidence.ocr.models.some(m=>m.language===l&&hash(m.sha256))))invalid('hashes/models');
 if(candidate.documents.some(d=>!['paper','answers','explanations'].includes(d.kind))||!candidate.documents.some(d=>d.kind==='paper'&&d.sha256===evidence.ocr.inputSha256))invalid('scope/source');
 if(evidence.missingReferenceAnswers!==candidate.questions.filter(q=>q.answer.value===null).length||evidence.missingExplanations!==candidate.questions.filter(q=>q.explanation===null).length)invalid('missing reference counts');
 if(!Array.isArray(evidence.questionEvidence)||evidence.questionEvidence.length!==candidate.questions.length||new Set(evidence.questionEvidence.map(e=>e.questionId)).size!==candidate.questions.length)invalid('question evidence coverage');
 for(const q of candidate.questions){const e=evidence.questionEvidence.find(e=>e.questionId===q.id);if(!e||!e.pages.length||e.pages.some(p=>!Number.isSafeInteger(p)||p<1||p>evidence.pageCount)||e.normalizedText!==q.text||fingerprint(e.normalizedOptions)!==fingerprint(q.options))invalid(`question ${q.id}`);}
 for(const m of candidate.materials.filter(m=>m.kind!=='listening')){const e=evidence.materials.find(e=>e.id===m.id);if(!e?.pages.length||e.pages.some(p=>!Number.isSafeInteger(p)||p<1||p>evidence.pageCount))invalid(`material ${m.id}`);}
 return true;
}
export function importProduction(db,candidate,evidence,actor){
 validateProduction(candidate,evidence);
 return db.transaction(()=>{const imported=importCandidate(db,candidate,actor);if(imported.status!=='candidate')throw Error('Invalid candidate');const old=db.prepare('SELECT manifest_sha256 FROM bank_production_evidence WHERE import_id=?').get(imported.id),digest=fingerprint(evidence);if(old&&old.manifest_sha256!==digest)throw Error('Production evidence is immutable');if(!old)db.prepare('INSERT INTO bank_production_evidence VALUES (?,?,?,?,?)').run(imported.id,digest,JSON.stringify(evidence),actor,new Date().toISOString());return imported;})();
}
