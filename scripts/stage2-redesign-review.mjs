import path from 'node:path';
import {openDatabase,projectRoot} from '../server/db.mjs';
import {createApp} from '../server/app.mjs';
const db=openDatabase(path.join(projectRoot,'.local/stage2-redesign/app.sqlite'));
const port=4176,origin=`http://127.0.0.1:${port}`;
const app=await createApp({db,publicOrigin:origin,backupDir:path.join(projectRoot,'.local/stage2-redesign/backups')});
try{await app.listen({host:'127.0.0.1',port});console.log(origin+' 使用原Stage2验收账号；独立副本，不同步线上。');}catch(e){db.close();throw e;}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await app.close();db.close();process.exit(0);});
