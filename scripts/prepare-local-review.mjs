import fs from 'node:fs';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {openDatabase,seedBaseline,projectRoot} from '../server/db.mjs';
import {createUser} from '../server/security.mjs';
if(process.env.NODE_ENV==='production')throw Error('Local review bootstrap is not a production installer');
const dir=path.join(projectRoot,'.local/stage1');fs.mkdirSync(dir,{recursive:true,mode:0o700});const db=openDatabase(path.join(dir,'app.sqlite'));
try{seedBaseline(db);const username='review-admin';const existing=db.prepare('SELECT id FROM users WHERE username=?').get(username);const access=path.join(dir,'体验账号说明.txt');if(!existing){const password=randomBytes(18).toString('base64url');await createUser(db,username,password,'admin');fs.writeFileSync(access,`软柿子阶段1本机体验\n入口：http://127.0.0.1:4174/\n用户名：${username}\n密码：${password}\n\n仅用于本机阶段验收。此文件、数据库和个人记录已被Git忽略。请勿将此账号文件上传到Git或用于线上。\n可在“账号管理”中创建普通用户用于最终验收。\n`,{flag:'wx',mode:0o600});}else if(!fs.existsSync(access))throw Error('Review account exists but credentials file is missing; use explicit reset-password command.');console.log('Local review ready. Credentials saved in .local/stage1/体验账号说明.txt; no credentials printed.');}finally{db.close();}
