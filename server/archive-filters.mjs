import {exact,fail,string} from './security.mjs';
const DAY=86400000,OFFSET=8*3600000;
const dayString=ms=>new Date(ms+OFFSET).toISOString().slice(0,10);
function midnight(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))fail(400,'INVALID_DATE','请选择有效日期');
 const ms=Date.parse(`${value}T00:00:00+08:00`);if(!Number.isFinite(ms)||dayString(ms)!==value)fail(400,'INVALID_DATE','日期无效');return ms;
}
export function archiveFilters(query,now,administrator=false){
 exact(query,['range','from','to','ownerId'],[]);
 if(!administrator&&query.ownerId!==undefined)fail(403,'ADMIN_REQUIRED');
 const range=query.range||'all';if(!['last7','last_week','last30','all','custom'].includes(range))fail(400,'INVALID_RANGE');
 let start=null,end=null;const today=Math.floor((now+OFFSET)/DAY)*DAY-OFFSET;
 if(range==='custom'){start=midnight(query.from);const last=midnight(query.to);if(start>last)fail(400,'INVALID_RANGE','开始日期不能晚于结束日期');end=last+DAY;}
 else {if(query.from!==undefined||query.to!==undefined)fail(400,'INVALID_RANGE');if(range==='last7'){start=today-6*DAY;end=today+DAY;}if(range==='last30'){start=today-29*DAY;end=today+DAY;}if(range==='last_week'){const weekday=new Date(today+OFFSET).getUTCDay();end=today-((weekday+6)%7)*DAY;start=end-7*DAY;}}
 let ownerId=null;if(administrator&&query.ownerId){string(query.ownerId,1,128);ownerId=query.ownerId;}
 return {range,ownerId,start:start===null?null:new Date(start).toISOString(),end:end===null?null:new Date(end).toISOString(),fromDate:start===null?null:dayString(start),toDate:end===null?null:dayString(end-DAY),timezone:'Asia/Shanghai'};
}
export function queryArchives(db,filters,ownerId=null){
 const conditions=[],values=[];if(ownerId){conditions.push('r.owner_id=?');values.push(ownerId);}
 if(filters.start){conditions.push("json_extract(r.payload,'$.submittedAt')>=?");values.push(filters.start);conditions.push("json_extract(r.payload,'$.submittedAt')<?");values.push(filters.end);}
 const where=conditions.length?' WHERE '+conditions.join(' AND '):'';
 return db.prepare(`SELECT r.*,u.username AS ownerUsername FROM reports r JOIN users u ON u.id=r.owner_id${where} ORDER BY json_extract(r.payload,'$.submittedAt') DESC,r.created_at DESC,r.rowid DESC`).all(...values);
}
