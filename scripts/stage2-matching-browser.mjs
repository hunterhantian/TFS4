import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import Database from 'better-sqlite3';
import {openDatabase,projectRoot} from '../server/db.mjs';
import {createUser} from '../server/security.mjs';
import {createApp} from '../server/app.mjs';
const require=createRequire(path.join(process.env.PLAYWRIGHT_PACKAGE_ROOT,'package.json')),{chromium}=require('playwright');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'matching-browser-')),file=path.join(dir,'copy.sqlite');
const original=new Database(path.join(projectRoot,'.local/stage2-redesign/app.sqlite'),{readonly:true,fileMustExist:true});await original.backup(file);original.close();
const db=openDatabase(file);await createUser(db,'matching-browser','Synthetic-browser-only-2026!','admin');await createUser(db,'matching-student','Synthetic-browser-only-2026!');
const app=await createApp({db,publicOrigin:'http://127.0.0.1:4188',backupDir:path.join(dir,'backups')});await app.listen({host:'127.0.0.1',port:4188});
const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:1080}}),checks=[],errors=[],writes=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()!=='GET'&&r.url().includes('/api/admin/stage2/'))writes.push(r.url());});
const baseline={reviews:db.prepare('SELECT count(*) n FROM qb_review_events').get().n,events:db.prepare('SELECT count(*) n FROM response_events').get().n,attempts:db.prepare('SELECT count(*) n FROM attempts').get().n};
const screenshots=path.join(projectRoot,'tmp/matching-demo');fs.mkdirSync(screenshots,{recursive:true});
async function login(name){await page.goto('http://127.0.0.1:4188/');await page.locator('#login-form [name=username]').fill(name);await page.locator('#login-form [name=password]').fill('Synthetic-browser-only-2026!');await page.locator('#login-form button').click();await page.locator('#home-view').waitFor({state:'visible'});}
try{
 await login('matching-browser');await page.locator('#open-stage2-search').click();await page.locator('[data-match-status]').filter({hasText:'匹配：相同题型'}).waitFor();checks.push('real published positive pair loads automatically');
 assert.equal(await page.locator('.match-card').count(),2);checks.push('source and target cards visible together');
 assert.equal(await page.locator('.match-stem mark').count(),2);assert.equal(await page.locator('.match-teaching').count(),2);assert.match(await page.locator('.match-teaching').first().textContent(),/阴性复数/);checks.push('real source clues highlighted and teaching notes explicitly labelled AI');
 assert.equal(await page.locator('.match-check.is-pass').count(),4);checks.push('four real eligibility checks pass');
 await page.locator('.match-option').first().click();assert.equal(await page.locator('.match-option[aria-pressed=true]').count(),1);assert.match(await page.locator('[data-choice]').first().textContent(),/不判分/);checks.push('answer trial is local and ungraded');
 await page.getByText('查看分析实际引用的题目证据',{exact:true}).first().click();await page.getByText('查看分类和复核记录',{exact:true}).first().click();assert.match(await page.locator('[data-pair]').textContent(),/不同轮次不等于不同模型/);checks.push('active analysis quote and review provenance shown');
 await page.screenshot({path:path.join(screenshots,'desktop-positive.png'),fullPage:true});
 await page.locator('[data-negative]').click();await page.locator('[data-match-status]').filter({hasText:'不匹配：'}).waitFor();assert.equal(await page.locator('.match-check.is-fail').count(),1);assert.match(await page.locator('[data-pair]').textContent(),/实际主知识点不同/);checks.push('same type different primary shown as negative');
 await page.screenshot({path:path.join(screenshots,'desktop-negative.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.locator('[data-positive]').click();await page.locator('[data-match-status]').filter({hasText:'匹配：相同题型'}).waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);checks.push('390px no horizontal overflow');
 await page.screenshot({path:path.join(screenshots,'mobile-positive.png'),fullPage:true});
 const form=page.locator('[data-compare]');const left=await form.locator('[name=left]').inputValue();await form.locator('[name=right]').selectOption(left);await form.locator('button').click();await page.locator('[data-match-status]').filter({hasText:'不匹配：'}).waitFor();assert.match(await page.locator('[data-pair]').textContent(),/同一道题或重复原题/);checks.push('self comparison excluded');
 assert.equal(writes.length,0);assert.deepEqual({reviews:db.prepare('SELECT count(*) n FROM qb_review_events').get().n,events:db.prepare('SELECT count(*) n FROM response_events').get().n,attempts:db.prepare('SELECT count(*) n FROM attempts').get().n},baseline);checks.push('no stage2 write requests or exam/history/review changes');
 await page.locator('#logout').click();await login('matching-student');assert.equal(await page.locator('#open-stage2-search').isVisible(),false);const denied=await page.evaluate(async()=>({demo:(await fetch('/api/admin/stage2/matching-demo')).status,compare:(await fetch('/api/admin/stage2/matching-demo/compare?left=x&right=y')).status}));assert.deepEqual(denied,{demo:403,compare:403});checks.push('ordinary student cannot open demonstration or its API');
 assert.deepEqual(errors,[]);checks.push('no browser runtime errors');
 fs.writeFileSync(path.join(projectRoot,'docs/testing/2026-10-28-matching-explanation-browser.json'),JSON.stringify({createdAt:new Date().toISOString(),database:'independent temporary copy of real published pilot data',checks,errors,writeRequests:writes,screenshots:['tmp/matching-demo/desktop-positive.png','tmp/matching-demo/desktop-negative.png','tmp/matching-demo/mobile-positive.png']},null,2));console.log(JSON.stringify({checks,errors},null,2));
}finally{await browser.close();await app.close();db.close();}
