// Dedicated local acceptance database. Never opens the Stage1 copy or production database.
import fs from 'node:fs';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {openDatabase,seedBaseline,projectRoot} from '../server/db.mjs';
import {createUser} from '../server/security.mjs';
import {createApp} from '../server/app.mjs';
import {importCandidate} from '../server/bank-import.mjs';
if(process.env.NODE_ENV==='production')throw Error('This launcher is local acceptance only');
const dir=path.join(projectRoot,'.local/stage2');fs.mkdirSync(dir,{recursive:true,mode:0o700});const file=path.join(dir,'app.sqlite'),access=path.join(dir,'验收账号说明.txt');
const db=openDatabase(file);let app;
try{
 seedBaseline(db);const username='stage2-review';let user=db.prepare('SELECT id FROM users WHERE username=?').get(username);
 if(!user){if(fs.existsSync(access))throw Error('Credentials exist without matching database; preserve files and investigate');const password=randomBytes(18).toString('base64url');user=await createUser(db,username,password,'admin');fs.writeFileSync(access,`软柿子阶段2独立本机验收\n入口：http://127.0.0.1:4175/\n用户名：${username}\n密码：${password}\n\n首页点击“题库与知识点审核”，选择tfs4-2025 v1批次。\n100题已导入候选；80题有解析与AI候选；20题听力缺解析。\n第52题解析与指定答案有冲突，需单独复核；61=A、62=B不变。\n此库没有生产账号、历史存档或合成审核结果。\n知识点关联由助手在后期题库成型后整理核对；你只负责最终体验验收。\n可在账号管理创建独立考生测试保存与报告。\n数据库、账号文件、日志不进入Git，不向云端同步。\n`,{flag:'wx',mode:0o600});}else if(!fs.existsSync(access))throw Error('Credentials file missing; do not silently reset a review account');
 const candidate=JSON.parse(fs.readFileSync(path.join(projectRoot,'data/2025-stage2-candidate.json'),'utf8'));importCandidate(db,candidate,user.id);
 app=await createApp({db,publicOrigin:'http://127.0.0.1:4175',backupDir:path.join(dir,'backups')});await app.listen({host:'127.0.0.1',port:4175});console.log('Stage2 local acceptance ready at http://127.0.0.1:4175/. Credentials are in .local/stage2/验收账号说明.txt; no credentials printed.');
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await app.close();db.close();process.exit(0);});
}catch(e){await app?.close();db.close();throw e;}
