import fs from 'node:fs';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {openDatabase,projectRoot} from '../server/db.mjs';
import {createUser} from '../server/security.mjs';
import {createApp} from '../server/app.mjs';
import {objectiveKnowledgeTree} from '../server/knowledge-tree.mjs';
const folder=path.join(projectRoot,'.local/stage2-knowledge-tree'),file=path.join(folder,'app.sqlite'),accountFile=path.join(folder,'知识树体验账号.txt');
if(!fs.existsSync(file))throw Error('Apply the reviewed objective annotation plan to a new isolated copy first.');
const db=openDatabase(file);if(!objectiveKnowledgeTree(db).totalQuestions)throw Error('No objective annotation catalogue found.');
if(!fs.existsSync(accountFile)){
 if(db.prepare('SELECT 1 FROM users WHERE username=?').get('knowledge-tree'))throw Error('Preserve existing account and recover its instructions; do not reset automatically.');
 const password=randomBytes(18).toString('base64url');await createUser(db,'knowledge-tree',password,'admin');
 fs.writeFileSync(accountFile,`知识树本机体验，独立副本，不同步源库或线上\n入口：http://127.0.0.1:4181/\n账号：knowledge-tree\n密码：${password}\n登录后点击“知识树（客观题）”，展开节点查看按题型分组的题目。\n默认为已复核题；待复核候选单独查看，不计入可用匹配数量。\n`,{flag:'wx',mode:0o600});
}
const app=await createApp({db,publicOrigin:'http://127.0.0.1:4181',backupDir:path.join(folder,'backups')});
await app.listen({host:'127.0.0.1',port:4181});console.log('http://127.0.0.1:4181/ · 知识树独立体验；账号文件.local/stage2-knowledge-tree/知识树体验账号.txt');
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await app.close();db.close();process.exit(0);});
