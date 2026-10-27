import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
import {openDatabase,seedBaseline} from '../server/db.mjs';
import {createUser} from '../server/security.mjs';
import {createApp} from '../server/app.mjs';
import {importProduction} from '../server/bank-production.mjs';
const {chromium}=createRequire(process.env.PLAYWRIGHT_PACKAGE_ROOT+'/package.json')('playwright');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rsz-proofread-')),db=openDatabase(path.join(dir,'app.sqlite'));
const password='Isolated-batch-browser-test-2026!';const actor=await createUser(db,'proof-admin',password,'admin');await createUser(db,'proof-user',password);seedBaseline(db);
const ids={};for(const year of [2023,2024])ids[year]=importProduction(db,JSON.parse(fs.readFileSync(`data/${year}-stage2-candidate.json`)),JSON.parse(fs.readFileSync(`data/${year}-stage2-proofread.json`)),actor.id).id;
const app=await createApp({db,backupDir:path.join(dir,'backups'),publicOrigin:'http://127.0.0.1:4179'});await app.listen({host:'127.0.0.1',port:4179});
const checks=[],errors=[];const check=(ok,name)=>{if(!ok)throw Error(name);checks.push(name);};let browser;
try{browser=await chromium.launch({headless:true,channel:'chrome'});const page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4179');await page.locator('#login-form [name=username]').fill('proof-admin');await page.locator('#login-form [name=password]').fill(password);await page.locator('#login-form button').click();await page.locator('#home-view').waitFor({state:'visible'});await page.locator('#open-content-bank').click();
 for(const year of [2023,2024]){await page.locator('#content-batches').selectOption(ids[year]);await page.locator('#content-detail h2').filter({hasText:String(year)}).waitFor();check(await page.locator('[data-content-id]').count()===100,`${year}: 100 questions visible`);check((await page.locator('.bank-production').textContent()).includes('Best OCR'),`${year}: proofread evidence shown`);await page.locator('[data-content-id=q1] > details').evaluate(e=>e.open=true);check((await page.locator('[data-content-id=q1] .bank-answer').textContent()).includes('待补参考答案'),`${year}: no fabricated answer displayed`);await page.locator('[data-content-id=q81] > details').evaluate(e=>e.open=true);const material=page.locator('[data-content-id=q81] > details > details').first();await material.evaluate(e=>e.open=true);check((await material.textContent()).length>500,`${year}: complete reading material retained`);
  await page.locator('#content-select-all').check();await page.locator('#content-approve').click();await page.locator('#content-feedback').filter({hasText:'已审核通过100题'}).waitFor();check(db.prepare("SELECT count(*) n FROM bank_content_reviews WHERE import_id=? AND status='approved'").get(ids[year]).n===100,`${year}: bulk content approval works without answers/association`);
 }
 check(db.prepare('SELECT count(*) n FROM bank_reviews').get().n===0,'content review never creates association approval');check(db.prepare('SELECT count(*) n FROM bank_publications').get().n===0,'content review never publishes associations');
 await page.locator('#content-home').click();await page.locator('#open-approved-bank').click();await page.locator('#approved-year').selectOption('2024');await page.locator('#approved-summary').filter({hasText:'当前筛选100题'}).waitFor();await page.locator('[data-approved-index]').first().click();await page.locator('.approved-detail:visible .bank-answer').waitFor();check((await page.locator('.approved-detail:visible').textContent()).includes('待补参考答案'),'approved library safely displays missing answer');await page.setViewportSize({width:390,height:844});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile has no horizontal overflow');
 await page.screenshot({path:'tmp/proofread-batches-mobile.png',fullPage:false});check(errors.length===0,'no browser runtime errors');console.log(JSON.stringify({passed:checks.length,checks,errors},null,2));fs.writeFileSync('docs/testing/2026-10-27-proofread-batches-browser.json',JSON.stringify({passed:checks.length,checks,errors},null,2)+'\n');
}finally{await browser?.close();await app.close();db.close();}
