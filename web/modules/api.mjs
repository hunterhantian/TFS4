let csrf='';
export const setCsrf=value=>{csrf=value||'';};
export async function api(method,url,body){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
 const encoded=body!==undefined?JSON.stringify(body):undefined;
 // Browsers cap keepalive payloads at 64 KiB. Large candidate imports use a normal request.
 let response;try{response=await fetch('/api'+url,{method,credentials:'same-origin',headers:{...(body!==undefined?{'Content-Type':'application/json'}:{}),...(csrf?{'X-CSRF-Token':csrf}:{})},...(encoded!==undefined?{body:encoded}:{}),signal:controller.signal,keepalive:method!=='GET'&&(!encoded||new TextEncoder().encode(encoded).length<60000)});}catch{const e=new Error('网络不可用，请检查连接后重试；考试中尚未同步的修改仍保留在本机');e.code='NETWORK_ERROR';throw e;}finally{clearTimeout(timer);}
 const data=await response.json();if(!response.ok){const e=new Error(data.error?.message||'请求失败');e.code=data.error?.code;e.status=response.status;throw e;}return data;
}
