import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openDatabase} from '../server/db.mjs';
import {createApp} from '../server/app.mjs';

test('production rate-limit client address trusts only the local reverse proxy',async()=>{
 const db=openDatabase(':memory:');const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rsz-proxy-'));
 const app=await createApp({db,backupDir:dir,production:true,publicOrigin:'https://example.test'});let seen;
 app.addHook('onRequest',async req=>{seen=req.ip;});
 try{
  await app.inject({url:'/api/health',remoteAddress:'127.0.0.1',headers:{'x-forwarded-for':'203.0.113.20'}});assert.equal(seen,'203.0.113.20');
  await app.inject({url:'/api/health',remoteAddress:'203.0.113.30',headers:{'x-forwarded-for':'198.51.100.10'}});assert.equal(seen,'203.0.113.30');
  await app.inject({url:'/api/health',remoteAddress:'127.0.0.1',headers:{'x-forwarded-for':'198.51.100.10, 203.0.113.30'}});assert.equal(seen,'203.0.113.30');
 }finally{await app.close();db.close();fs.rmSync(dir,{recursive:true,force:true});}
});
