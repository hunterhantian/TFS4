import {createRequire} from 'node:module';
import fs from 'node:fs';
import {createPreview} from './preview.mjs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE_ROOT+'/package.json');const {chromium}=require('playwright');
const server=createPreview();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;const results=[];
const check=(value,name)=>{if(!value)throw Error(name);results.push(name);};
try{
 browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'chrome'});const context=await browser.newContext();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}`);await page.locator('#start').click();
 await page.waitForFunction(()=>document.querySelector('audio').readyState>=1);
 check(await page.locator('audio').evaluate(a=>Math.abs(a.duration-2740.741125)<1),'audio metadata and duration');
 await page.locator('audio').evaluate(async a=>{await a.play();});await page.waitForTimeout(350);check(await page.locator('audio').evaluate(a=>!a.paused&&a.currentTime>0),'audio actually plays');
 await page.locator('audio').evaluate(a=>a.currentTime=120);await page.waitForFunction(()=>Math.abs(document.querySelector('audio').currentTime-120)<3);results.push('audio seek');
 await page.locator('[data-no="1"] [data-choice="B"]').click();await page.locator('[data-no="1"] [data-confidence="肯定"]').click();await page.waitForTimeout(1200);
 for(let n=0;n<10;n++){await page.locator(`[data-page="${n}"]`).click();check(await page.locator('.question').count()===([10,10,10,10,20,20,5,5,5,5][n]),`group ${n+1} count`);check((await page.locator('.reading').count())===([3,6,7,8,9].includes(n)?1:0),`group ${n+1} material`);}
 check(await page.locator('audio').evaluate(a=>a.paused),'audio paused outside listening');
 await page.locator('#pause-exam').click();const before=await page.locator('#clock').textContent();await page.waitForTimeout(1200);check((await page.locator('#clock').textContent())===before,'pause freezes time');
 await page.reload();await page.locator('#start').click();check((await page.locator('#page-title').textContent()).includes('96–100'),'page restored');
 await page.locator('[data-page="0"]').click();check(await page.locator('[data-no="1"] [data-choice="B"]').evaluate(e=>e.classList.contains('selected')),'answer restored');check(await page.locator('[data-no="1"] [data-confidence="肯定"]').evaluate(e=>e.classList.contains('selected')),'confidence restored');
 // Every question answered using the unchanged working key, synthetic context only.
 for(let n=0;n<10;n++){await page.locator(`[data-page="${n}"]`).click();const answers=await page.evaluate(n=>window.EXAM_DATA.questions.filter(q=>q.no>=window.EXAM_DATA.labels[n][0]&&q.no<=window.EXAM_DATA.labels[n][1]).map(q=>[q.no,q.answer]),n);for(const [id,a] of answers)await page.locator(`[data-no="${id}"] [data-choice="${a}"]`).click();}
 check((await page.locator('#answered-count').textContent())==='100','all 100 answers recorded');
 await page.setViewportSize({width:390,height:844});for(const n of [2,6,7,8]){await page.locator(`[data-page="${n}"]`).click();check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`mobile no horizontal overflow group ${n+1}`);}
 fs.mkdirSync('tmp',{recursive:true});await page.screenshot({path:'tmp/fixed-options-mobile.png',fullPage:true});
 page.once('dialog',d=>d.accept());await page.locator('#submit').click();check((await page.locator('#result-content .score').textContent()).startsWith('100'),'100-answer score');await page.locator('#result-close').click();await page.locator('#open-history').click();check(await page.locator('.history-card').count()===1,'one archive');await page.locator('.history-card').click();check(await page.locator('.result-row').count()===100,'report 100 rows');check(await page.locator('.result-row.correct').count()===100,'report correctness');check(await page.locator('.report-confidence').first().textContent()==='🟢 肯定','report confidence');
 check(errors.length===0,'no browser script errors');await context.close();
 const partialContext=await browser.newContext();const partial=await partialContext.newPage();await partial.goto(`http://127.0.0.1:${server.address().port}`);await partial.locator('#start').click();
 await partial.locator('[data-no="1"] [data-choice="A"]').click();
 partial.once('dialog',d=>d.dismiss());await partial.locator('#submit').click();check(await partial.evaluate(()=>!localStorage.getItem('tfs4-2025-prototype-archive')),'cancel submit creates no archive');
 await partial.waitForTimeout(1100);await partial.locator('#pause-exam').click();const saved=await partial.evaluate(()=>JSON.parse(localStorage.getItem('tfs4-2025-prototype-session')).activeSeconds);await partial.waitForTimeout(1100);await partial.reload();await partial.locator('#start').click();check(await partial.evaluate(()=>JSON.parse(localStorage.getItem('tfs4-2025-prototype-session')).activeSeconds)===saved,'refresh excludes paused wall time');
 partial.once('dialog',d=>d.accept());await partial.locator('#submit').click();await partial.locator('#result-close').click();await partial.locator('#open-history').click();await partial.locator('.history-card').click();check(await partial.locator('.result-row.wrong').count()===1,'partial report wrong answer');check(await partial.locator('.result-row.empty').count()===99,'partial report unanswered');check(await partial.locator('.result-row').filter({hasText:'待复核'}).count()===0,'reference answers have no pending grading flags');
 await partial.evaluate(()=>{const k='tfs4-2025-prototype-archive';const r=JSON.parse(localStorage.getItem(k));delete r[0].confidence;delete r[0].questionTimes;localStorage.setItem(k,JSON.stringify(r));});await partial.locator('#archive-back').click();await partial.locator('.history-card').click();check(await partial.locator('.result-row .time').first().textContent()==='—','legacy missing time stays unknown');await partial.evaluate(()=>{localStorage.setItem('tfs4-2025-prototype-archive',JSON.stringify([{submittedAt:Date.now(),score:1,answered:1,duration:1,answers:{61:{choice:'D'}},confidence:{}}]));});await partial.locator('#archive-back').click();await partial.locator('.history-card').click();check(await partial.locator('.result-row.correct').count()===1,'legacy 61 D stays correct under old key');await partialContext.close();
 console.log(JSON.stringify({passed:results.length,checks:results},null,2));fs.writeFileSync('tmp/browser-regression-results.json',JSON.stringify({passed:results.length,checks:results},null,2));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
