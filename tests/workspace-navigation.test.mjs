import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('home exposes only the five requested workspace destinations',()=>{
 const html=fs.readFileSync(new URL('../web/index.html',import.meta.url),'utf8');const nav=html.match(/<nav class="home-nav"[\s\S]*?<\/nav>/)?.[0];assert.ok(nav);
 const ids=[...nav.matchAll(/<button id="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(ids,['open-reports','open-all-reports','open-admin','open-stage2-synthesis','open-stage2-synthesis-tree']);
 assert.doesNotMatch(html,/id="(?:import-view|open-import)"/);
 const stage=fs.readFileSync(new URL('../web/modules/stage2.mjs',import.meta.url),'utf8');assert.doesNotMatch(stage,/知识树（客观题）|生产批次|考点与关联维护|同题型同知识点匹配体验/);
});
