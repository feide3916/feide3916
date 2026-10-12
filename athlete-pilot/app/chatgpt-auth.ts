import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {db} from './runtime';
import {tokenHash} from './auth-core';
export type ChatGPTUser={userId:string;email:string;displayName:string;fullName:string|null;mustChange:boolean};
export async function getChatGPTUser():Promise<ChatGPTUser|null>{const token=(await cookies()).get('athlete_session')?.value;if(!token)return null;const u=await db.prepare('SELECT u.id,u.email,u.name,u.must_change FROM auth_sessions s JOIN auth_users u ON u.id=s.user_id WHERE s.token=? AND s.expires_at>? AND u.disabled=0').bind(tokenHash(token),Date.now()).first<any>();return u?{userId:u.id,email:u.email,displayName:u.name,fullName:u.name,mustChange:!!u.must_change}:null;}
export async function requireChatGPTUser(_returnTo:string){const u=await getChatGPTUser();if(!u)redirect('/login');if(u.mustChange)redirect('/password');return u;}
export const chatGPTSignInPath=()=>'/login';
export const chatGPTSignOutPath=()=>'/login';
