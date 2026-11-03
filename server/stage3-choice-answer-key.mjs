import fs from 'node:fs';
import path from 'node:path';
import {projectRoot} from './db.mjs';
const key=JSON.parse(fs.readFileSync(path.join(projectRoot,'data/stage3-choice-answer-key-v1.json'),'utf8'));
if(key.version!=='user-reference-v1'||Object.keys(key.answers).length!==2100||Object.values(key.answers).some(v=>!/^[A-D]$/.test(v)))throw Error('Invalid Stage 3 choice answer key');
export const choiceAnswerVersion=key.version;
export function choiceAnswer(id,options){const value=key.answers[id];if(!value||!Object.hasOwn(options,value))throw Error(`Stage 3 answer missing or unavailable option: ${id}`);return value;}
