import fs from 'node:fs';
import path from 'node:path';
import {projectRoot} from './db.mjs';
const key=JSON.parse(fs.readFileSync(path.join(projectRoot,'data/stage3-verb-answer-reference-v1.json'),'utf8'));
if(key.version!=='user-pdf-verb-reference-v1'||Object.keys(key.answers).length!==420||Object.values(key.answers).some(v=>typeof v.value!=='string'||!v.value.trim()))throw Error('Invalid Stage 3 verb reference');
const corrections=JSON.parse(fs.readFileSync(path.join(projectRoot,'data/stage4-verb-fill-corrections-v1.json'),'utf8'));
const context=JSON.parse(fs.readFileSync(path.join(projectRoot,'data/stage4-verb-context-forms-v1.json'),'utf8'));
export const verbReferenceVersion='user-pdf-verb-reference-v2';
export const verbContextVersion=context.version;
export function verbReference(id){const v=key.answers[id];if(!v)throw Error(`Stage 3 verb reference missing: ${id}`);const correction=corrections.answers[id],contextItem=context.items[id];return {...v,...(correction?{value:correction.value,accepted:correction.accepted,originalValue:v.value,correctionVersion:corrections.version,correctionBasis:correction.basis}:{}),accepted:[...new Set([...(correction?.accepted||[]),...(contextItem?.accepted||[])])],inputReviewStatus:'user-approved',inputResolutionStatus:correction||contextItem?'previously-organized':'not-individually-checked',inputApprovalBasis:'用户确认全部420空使用当前形式进行判分',contextVersion:context.version,contextEvidence:contextItem?.evidence||null,reviewStatus:"user-approved",reviewBasis:"用户指定该版本作为评分标准",sourceStatus:v.status};}
