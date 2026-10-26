export const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function duration(ms){if(ms==null)return '未记录';const sec=Math.floor(ms/1000);return [Math.floor(sec/3600),Math.floor(sec%3600/60),sec%60].map(v=>String(v).padStart(2,'0')).join(':');}
export const percent=value=>value==null?'暂无数据':`${Math.round(value*100)}%`;
export const date=value=>value?new Date(value).toLocaleString('zh-CN',{hour12:false}):'未记录';
export const confidence=value=>({certain:'🟢 肯定',hesitant:'🟡 犹豫',guess:'🔴 猜测'})[value]||'未记录';
export function download(name,value){const blob=new Blob([typeof value==='string'?value:JSON.stringify(value,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export const message=text=>{document.querySelector('#message').textContent=text||'';};
