import {createRequire} from 'node:module';
import fs from 'node:fs';
import {createPreview} from './preview.mjs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE_ROOT+'/package.json');
const {chromium}=require('playwright');
const server=createPreview(); await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try{
 browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'chrome'});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.locator('#start').click();
 const count=await page.locator('[data-no]').count();if(!count)throw Error('No questions rendered');
 await page.locator('#next').click();
 await page.setViewportSize({width:390,height:844});
 fs.mkdirSync('tmp',{recursive:true});await page.screenshot({path:'tmp/prototype-mobile.png',fullPage:true});
 if(errors.length)throw Error(errors.join('\n'));console.log(`Browser smoke passed: ${count} question nodes on first page; next page and mobile render; no page errors. Fresh isolated context, no personal records.`);
}finally{await browser?.close();await new Promise(r=>server.close(r));}

