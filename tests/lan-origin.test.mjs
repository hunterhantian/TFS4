import test from 'node:test';
import assert from 'node:assert/strict';
import {openDatabase} from '../server/db.mjs';
import {createApp} from '../server/app.mjs';
import {createUser} from '../server/security.mjs';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
test('LAN origin is explicitly allowed in development and ignored in production',async()=>{
 const db=openDatabase(':memory:'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'rsz-lan-'));const password='LAN-fixture-password-2026';await createUser(db,'lan-test',password);let app;
 try{app=await createApp({db,backupDir:dir,publicOrigin:'http://127.0.0.1:4174',lanOrigin:'http://192.168.31.31:4174'});const login=origin=>app.inject({method:'POST',url:'/api/auth/login',headers:{origin},payload:{username:'lan-test',password}});assert.equal((await login('http://192.168.31.31:4174')).statusCode,200);assert.equal((await login('http://192.168.31.99:4174')).statusCode,403);await app.close();app=await createApp({db,backupDir:dir,production:true,publicOrigin:'https://example.test',lanOrigin:'http://192.168.31.31:4174'});assert.equal((await login('http://192.168.31.31:4174')).statusCode,403);}finally{await app?.close();db.close();fs.rmSync(dir,{recursive:true,force:true});}
});
