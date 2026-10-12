import {randomBytes,scrypt as scryptCallback,timingSafeEqual,createHash} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(scryptCallback);
export function validPassword(s:unknown):s is string{return typeof s==='string'&&s.length>=12&&s.length<=128;}
export async function hashPassword(password:string){const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64) as Buffer;return salt+':'+key.toString('hex');}
export async function verifyPassword(password:string,stored:string){const [salt,hex]=stored.split(':');if(!salt||!hex)return false;const key=await scrypt(password,salt,64) as Buffer;const expected=Buffer.from(hex,'hex');return expected.length===key.length&&timingSafeEqual(key,expected);}
export const tokenHash=(s:string)=>createHash('sha256').update(s).digest('hex');
export const newToken=()=>randomBytes(32).toString('hex');
