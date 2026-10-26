import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
export function createPreview(){return http.createServer((req,res)=>{
  let name; try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
  if(!file.startsWith(root)||!['GET','HEAD'].includes(req.method)){res.writeHead(403).end();return;}
  fs.stat(file,(error,stat)=>{if(error||!stat.isFile()){res.writeHead(404).end();return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':stat.size});
    if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
  });
});}
if(process.argv[1]===fileURLToPath(import.meta.url))createPreview().listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('Prototype: http://127.0.0.1:4173'));
