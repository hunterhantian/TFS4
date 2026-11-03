import fs from 'node:fs';
import path from 'node:path';
import {projectRoot} from './db.mjs';
const key=JSON.parse(fs.readFileSync(path.join(projectRoot,'data/stage3-verb-answer-reference-v1.json'),'utf8'));
if(key.version!=='user-pdf-verb-reference-v1'||Object.keys(key.answers).length!==420||Object.values(key.answers).some(v=>typeof v.value!=='string'||!v.value.trim()))throw Error('Invalid Stage 3 verb reference');
export const verbReferenceVersion=key.version;
export function verbReference(id){const v=key.answers[id];if(!v)throw Error(`Stage 3 verb reference missing: ${id}`);return v;}
