let csrf='';
export const setCsrf=value=>{csrf=value||'';};
export async function api(method,url,body){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
 let response;try{response=await fetch('/api'+url,{method,credentials:'same-origin',headers:{...(body!==undefined?{'Content-Type':'application/json'}:{}),...(csrf?{'X-CSRF-Token':csrf}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{}),signal:controller.signal,keepalive:method!=='GET'});}catch{const e=new Error('网络不可用，修改已保留在本机，尚未同步');e.code='NETWORK_ERROR';throw e;}finally{clearTimeout(timer);}
 const data=await response.json();if(!response.ok){const e=new Error(data.error?.message||'请求失败');e.code=data.error?.code;e.status=response.status;throw e;}return data;
}
