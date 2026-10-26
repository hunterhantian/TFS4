import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import {randomUUID} from 'node:crypto';
const root='/var/backups/ruanshizi/daily';fs.mkdirSync(root,{recursive:true,mode:0o700});
const db=new Database(process.env.DB_FILE,{readonly:true,fileMustExist:true});
const stamp=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const target=path.join(root,`daily-${stamp}.sqlite`),temporary=path.join(root,`daily-${stamp}-${randomUUID()}.tmp`);
try{await db.backup(temporary);}finally{db.close();}
const copy=new Database(temporary,{readonly:true,fileMustExist:true});
try{if(copy.pragma('integrity_check',{simple:true})!=='ok')throw Error('Backup integrity check failed');}finally{copy.close();}
fs.renameSync(temporary,target);
// Keep at least the latest 14 successful daily snapshots; never prune baseline or pre-release backups.
const files=fs.readdirSync(root).filter(name=>/^daily-\d{4}-\d{2}-\d{2}\.sqlite$/.test(name)).sort().reverse();
for(const name of files.slice(14))fs.unlinkSync(path.join(root,name));
console.log('Verified daily backup:',target);
