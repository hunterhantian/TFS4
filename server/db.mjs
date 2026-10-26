import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
export const projectRoot=fileURLToPath(new URL('../',import.meta.url));
export function openDatabase(file){
 if(file!==':memory:'){
  if(!file)throw Error('Database path is required');
  file=path.resolve(file);
  for(const folder of ['web','dist']){const root=path.join(projectRoot,folder).toLowerCase();if(file.toLowerCase()===root||file.toLowerCase().startsWith(root+path.sep))throw Error('Database must be outside public directories');}
  fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});
 }
 const db=new Database(file);db.pragma('foreign_keys=ON');db.pragma('busy_timeout=5000');if(file!==':memory:')db.pragma('journal_mode=WAL');
 try {
 db.exec('CREATE TABLE IF NOT EXISTS schema_migrations(version TEXT PRIMARY KEY,sha256 TEXT NOT NULL,applied_at TEXT NOT NULL)');
 for(const name of fs.readdirSync(new URL('./migrations/',import.meta.url)).filter(n=>n.endsWith('.sql')).sort()){
  const rawSql=fs.readFileSync(new URL(`./migrations/${name}`,import.meta.url),'utf8');const sql=rawSql.replace(/\r\n/g,'\n');const checksum=value=>createHash('sha256').update(value).digest('hex');const hash=checksum(sql);const compatibleHashes=[hash,checksum(rawSql),checksum(sql.replace(/\n/g,'\r\n')),checksum(sql.replace(/\n$/,'\r\n'))];const applied=db.prepare('SELECT * FROM schema_migrations WHERE version=?').get(name);
  if(applied){if(!compatibleHashes.includes(applied.sha256))throw Error(`Applied migration changed: ${name}`);if(applied.sha256!==hash)db.prepare('UPDATE schema_migrations SET sha256=? WHERE version=?').run(hash,name);continue;}
  db.transaction(()=>{db.exec(sql);db.prepare('INSERT INTO schema_migrations VALUES (?,?,?)').run(name,hash,new Date().toISOString());})();
 }
 return db;
 } catch(error) { db.close(); throw error; }
}
export function seedBaseline(db){
 const data=JSON.parse(fs.readFileSync(new URL('../data/2025-candidate.json',import.meta.url)));
 const reference=JSON.parse(fs.readFileSync(new URL('../data/2025-reference-answers.json',import.meta.url)));
 if(data.questions.length!==100||data.questions.some(q=>q.answer.value!==reference.answers[q.originalNo]))throw Error('Baseline reference mismatch');
 const materials=data.materials.map(m=>({...m,version:1}));materials.push({id:'listening-2025',version:1,text:'2025年听力原声（完整录音，含听写与考试指令）',audioUrl:'/media/2025-listening.mp3'});
 const questions=data.questions.map(q=>({...q,materialId:q.component==='listening'?'listening-2025':q.materialId,knowledgeLinks:undefined}));
 const payload={id:'tfs4-2025',year:2025,title:'2025 法语专四 · 完整客观题',answerKeyVersion:reference.version,questions,materials,contentStatus:'stage0-original-baseline-no-reviewed-knowledge'};
 const encoded=JSON.stringify(payload);const revision=createHash('sha256').update(encoded).digest('hex');
 const existing=db.prepare('SELECT revision FROM sources WHERE id=?').get(payload.id);
 if(existing&&existing.revision!==revision)throw Error('Existing source differs; use an explicit versioned content migration');
 db.prepare('INSERT OR IGNORE INTO sources VALUES (?,?,?,?)').run(payload.id,revision,encoded,new Date().toISOString());return payload.id;
}
