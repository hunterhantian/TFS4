import {createApp} from './app.mjs';
const app=await createApp({logger:true});
const port=Number(process.env.PORT||4174);await app.listen({host:'127.0.0.1',port});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await app.close();process.exit(0);});
