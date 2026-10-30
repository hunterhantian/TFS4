import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const out=path.join(root,'docs/Stage2-总体进度看板.md');
const batches=[
 ['2005–2009','data/stage2-production-r05/tri-source'],
 ['2010–2014','data/stage2-production-r06-2010-2014'],
 ['2015–2019','data/stage2-production-r07'],
 ['2021-05、2021-06、2022、2024、2025','data/stage2-production-r08']
];
function files(dir){try{return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name)}catch{return[]}}
function findReports(dir){let hits=[]; for(const y of files(dir)){const base=path.join(root,dir,y); for(const n of ['tri-source-review.json','review.json','summary.json']){const p=path.join(base,n);if(fs.existsSync(p))hits.push(p)}} return hits}
const now=new Date().toISOString(); let md=`# Stage 2 总体进度看板\n\n更新时间：${now}\n\n执行规则：先用真题、答案、解析三源校对；再仅用真题与对应解析初标。答案 MD 只用于答案匹配，不作为知识点判定依据。\n\n| 批次 | 报告文件数 | 状态 | 备注 |\n|---|---:|---|---|\n`;
for(const [label,dir] of batches){const rs=findReports(dir);let note=rs.length?rs.map(p=>path.relative(root,p)).join('<br>'):'等待或路径待确认';md+=`| ${label} | ${rs.length} | ${rs.length?'第一轮候选已生成':'未发现报告'} | ${note} |\n`;}
md+=`\n## 已知待处理项\n\n- 旧年份解析文档存在题号格式差异，需要逐年核对。\n- 部分答案 MD 内嵌 HTML 表格，需要从 Markdown 中解析表格单元格。\n- 分组答案需要展开后再计算真实匹配率。\n- 第一轮候选结果不等于最终校对完成。\n\n## 2023 基线\n\n2023 已完成三源匹配与解析驱动初标，耗时 519 秒。\n`;
fs.mkdirSync(path.dirname(out),{recursive:true}); fs.writeFileSync(out,md);
console.log(out);
