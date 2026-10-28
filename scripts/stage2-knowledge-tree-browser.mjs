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
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'knowledge-tree-browser-')),file=path.join(folder,'copy.sqlite');
const source=new Database(path.join(projectRoot,'.local/stage2-knowledge-tree/app.sqlite'),{readonly:true,fileMustExist:true});await source.backup(file);source.close();
const db=openDatabase(file);await createUser(db,'tree-browser','Synthetic-test-only-2026!','admin');await createUser(db,'tree-student','Synthetic-test-only-2026!');
const app=await createApp({db,publicOrigin:'http://127.0.0.1:4189',backupDir:path.join(folder,'backups')});await app.listen({host:'127.0.0.1',port:4189});
const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:1080}}),checks=[],errors=[],writes=[];
page.setDefaultTimeout(30000);page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()!=='GET'&&r.url().includes('/api/admin/stage2/'))writes.push(r.url());});
const counts=()=>['qb_review_events','qb_releases','response_events','attempts'].map(t=>db.prepare('SELECT count(*) n FROM '+t).get().n),baseline=counts(),screenshots=path.join(projectRoot,'tmp/knowledge-tree');fs.mkdirSync(screenshots,{recursive:true});
async function login(user){await page.goto('http://127.0.0.1:4189');await page.locator('#login-form [name=username]').fill(user);await page.locator('#login-form [name=password]').fill('Synthetic-test-only-2026!');await page.locator('#login-form button').click();await page.locator('#home-view').waitFor({state:'visible'});}
async function selectNode(id,text){await page.locator('[data-search]').fill(text);await page.locator('[data-node-id="'+id+'"]').click();await page.locator('[data-node] h3').waitFor();await page.waitForFunction(()=>!document.querySelector('[data-list]').textContent.includes('正在读取'));}
try{
 await login('tree-browser');await page.locator('#open-stage2-tree').click();await page.locator('.kt-question').first().waitFor();
 assert.deepEqual(await page.locator('.kt-stats strong').allTextContents(),['360','277','83']);checks.push('360 objective annotations: 277 available and 83 pending displayed separately');
 assert.match(await page.locator('[data-node] h3').textContent(),/主有代词/);assert.equal(await page.locator('.kt-question').count(),4);checks.push('four related possessive questions appear directly below the selected leaf');
 await page.locator('.kt-question summary').first().click();await page.locator('.kt-full-stem').first().waitFor();assert.match(await page.locator('[data-list]').textContent(),/本题归类依据/);assert.equal(await page.locator('.kt-question').count(),4);checks.push('question expands with actual stem options and annotation basis without pair labelling');
 await page.screenshot({path:path.join(screenshots,'desktop-possessive.png'),fullPage:true});
 await selectNode('obj-gerund','副动词');assert.equal(await page.locator('.kt-type-group').count(),2);assert.equal(await page.locator('.kt-question').count(),3);checks.push('one gerund knowledge node groups three questions across two types');
 await page.locator('[data-type="verb-form"]').click();await page.locator('[data-total]').filter({hasText:'共2题'}).waitFor();assert.equal(await page.locator('.kt-question').count(),2);checks.push('type grouping filters without requiring new pair annotations');
 await page.locator('.kt-question summary').first().click();await page.locator('.kt-full-stem').waitFor();assert.match(await page.locator('[data-list]').textContent(),/完整动词篇章/);checks.push('verb-form question retains its complete source passage');
 await page.screenshot({path:path.join(screenshots,'desktop-gerund.png'),fullPage:true});
 await page.locator('[data-year]').selectOption('2013');await page.locator('.kt-stats strong').first().filter({hasText:'120'}).waitFor();await page.locator('[data-total]').filter({hasText:'共1题'}).waitFor();assert.deepEqual(await page.locator('.kt-stats strong').allTextContents(),['120','88','32']);checks.push('year filter recalculates unique tree counts and question groups');
 await page.locator('[data-year]').selectOption('');await page.locator('.kt-stats strong').first().filter({hasText:'360'}).waitFor();
 await selectNode('obj-listening','听力');assert.equal(await page.locator('.kt-pending-notice').count(),1);assert.match(await page.locator('[data-total]').textContent(),/共60题/);checks.push('listening candidates automatically open pending tab and never count as available');
 assert.equal(await page.locator('.kt-question').count(),20);await page.locator('[data-next]').click();await page.locator('[data-total]').filter({hasText:'第2页'}).waitFor();checks.push('large candidate group paginates at 20 items');
 await page.setViewportSize({width:390,height:844});await selectNode('obj-possessive','主有代词');await page.locator('[data-mode=available]').click();await page.locator('.kt-question').first().waitFor();assert.equal(await page.locator('.kt-question').count(),4);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);checks.push('390px tree navigation and multi-question list have no horizontal overflow');
 await page.screenshot({path:path.join(screenshots,'mobile-tree.png'),fullPage:true});
 assert.deepEqual(writes,[]);assert.deepEqual(counts(),baseline);checks.push('browsing sends no stage2 writes and changes no exam/review/release records');
 await page.locator('#logout').click();await login('tree-student');assert.equal(await page.locator('#open-stage2-tree').isVisible(),false);const statuses=await page.evaluate(async()=>[(await fetch('/api/admin/stage2/knowledge-tree')).status,(await fetch('/api/admin/stage2/knowledge-tree/obj-possessive/questions')).status]);assert.deepEqual(statuses,[403,403]);checks.push('student access remains isolated; admin tree APIs deny ordinary accounts');
 assert.deepEqual(errors,[]);checks.push('no browser runtime errors');
 fs.writeFileSync(path.join(projectRoot,'docs/testing/2026-10-28-objective-knowledge-tree-browser.json'),JSON.stringify({createdAt:new Date().toISOString(),scope:'temporary copy of real three-paper annotated database',checks,errors,writeRequests:writes,screenshots:['tmp/knowledge-tree/desktop-possessive.png','tmp/knowledge-tree/desktop-gerund.png','tmp/knowledge-tree/mobile-tree.png']},null,2));console.log(JSON.stringify({checks,errors},null,2));
}finally{await browser.close();await app.close();db.close();}
