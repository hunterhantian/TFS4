// Dedicated local demonstration copy; never serves or modifies the original Stage2 database.
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import {randomBytes} from 'node:crypto';
import {openDatabase,projectRoot} from '../server/db.mjs';
import {createUser} from '../server/security.mjs';
import {createApp} from '../server/app.mjs';
const folder=path.join(projectRoot,'.local/stage2-matching-demo'),file=path.join(folder,'app.sqlite'),instructions=path.join(folder,'匹配体验账号.txt');
fs.mkdirSync(folder,{recursive:true});
if(!fs.existsSync(file)){
 const source=new Database(path.join(projectRoot,'.local/stage2-redesign/app.sqlite'),{readonly:true,fileMustExist:true});
 try{await source.backup(file);}finally{source.close();}
 const db=openDatabase(file),password=randomBytes(18).toString('base64url');
 try{await createUser(db,'matching-demo',password,'admin');fs.writeFileSync(instructions,`本机匹配原理体验（独立副本，不同步线上）\n入口：http://127.0.0.1:4180/\n账号：matching-demo\n密码：${password}\n登录后点击“同题型同知识点匹配体验”。\n此页试选不保存考试历史；不用于正式判分。\n`,{flag:'wx',mode:0o600});}finally{db.close();}
}
if(!fs.existsSync(instructions))throw Error('Demo credentials missing; preserve this database and recover the instructions before use.');
const db=openDatabase(file),app=await createApp({db,publicOrigin:'http://127.0.0.1:4180',backupDir:path.join(folder,'backups')});
await app.listen({host:'127.0.0.1',port:4180});console.log('http://127.0.0.1:4180/ · 本机独立匹配体验；账号说明在.local/stage2-matching-demo/匹配体验账号.txt');
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await app.close();db.close();process.exit(0);});
