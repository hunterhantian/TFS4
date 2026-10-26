import {randomBytes,scrypt,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
const derive=promisify(scrypt);
export const token=()=>randomBytes(32).toString('hex');
export const hashToken=t=>createHash('sha256').update(t).digest('hex');
export async function hashPassword(password){const salt=randomBytes(16).toString('hex');const hash=await derive(password,salt,64,{N:16384,r:8,p:1});return `scrypt$${salt}$${hash.toString('hex')}`;}
export async function verifyPassword(password,stored){try{const [method,salt,hex]=stored.split('$');if(method!=='scrypt')return false;const actual=await derive(password,salt,64,{N:16384,r:8,p:1});const expected=Buffer.from(hex,'hex');return expected.length===actual.length&&timingSafeEqual(expected,actual);}catch{return false;}}
export function fail(status,code,message=code){const e=new Error(message);e.statusCode=status;e.code=code;throw e;}
export function exact(value,allowed,required=allowed){if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!allowed.includes(k))||required.some(k=>!(k in value)))fail(400,'INVALID_INPUT','请求字段不完整或包含未知字段');return value;}
export function string(value,min=1,max=200){if(typeof value!=='string'||value.length<min||value.length>max)fail(400,'INVALID_INPUT');return value;}
export function integer(value,min=0,max=2592000000){if(!Number.isSafeInteger(value)||value<min||value>max)fail(400,'INVALID_INPUT');return value;}
export async function createUser(db,username,password,role='user'){
 string(username,3,64);if(!/^[a-zA-Z0-9_.-]+$/.test(username))fail(400,'INVALID_USERNAME');string(password,10,256);if(!['admin','user'].includes(role))fail(400,'INVALID_ROLE');
 const id=token();const encoded=await hashPassword(password);try{db.prepare('INSERT INTO users VALUES (?,?,?,?,?)').run(id,username,encoded,role,new Date().toISOString());}catch(e){if(e.code?.includes('CONSTRAINT'))fail(409,'USERNAME_EXISTS');throw e;}return {id,username,role};
}
