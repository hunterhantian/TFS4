import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import {openDatabase,projectRoot} from '../server/db.mjs';
const [source,target]=process.argv.slice(2);if(!source||!target)throw Error('Usage: node scripts/restore.mjs <backup.sqlite> <new-target.sqlite>');
const resolved=path.resolve(target);for(const folder of ['web','dist']){const root=path.join(projectRoot,folder);if(resolved.toLowerCase()===root.toLowerCase()||resolved.toLowerCase().startsWith(root.toLowerCase()+path.sep))throw Error('Restore target must be outside public directories');}if(fs.existsSync(resolved))throw Error('Restore target already exists; refusing to overwrite');
const backup=new Database(source,{readonly:true,fileMustExist:true});try{if(backup.pragma('integrity_check',{simple:true})!=='ok')throw Error('Backup integrity check failed');fs.mkdirSync(path.dirname(resolved),{recursive:true,mode:0o700});await backup.backup(resolved);}finally{backup.close();}
const restored=openDatabase(resolved);try{console.log(JSON.stringify({integrity:restored.pragma('integrity_check',{simple:true}),users:restored.prepare('SELECT COUNT(*) n FROM users').get().n,attempts:restored.prepare('SELECT COUNT(*) n FROM attempts').get().n,reports:restored.prepare('SELECT COUNT(*) n FROM reports').get().n}));}finally{restored.close();}
