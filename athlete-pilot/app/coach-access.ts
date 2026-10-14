import {env} from './runtime';
import {getChatGPTUser} from './chatgpt-auth';
export async function getCoachUser(){const user=await getChatGPTUser();if(!user)return null;const email=user.email.trim().toLowerCase();const owner=(env as any).COACH_OWNER_EMAIL?.trim().toLowerCase();if(!owner)return null;if(email===owner)return user;const registered=await env.DB!.prepare('SELECT email FROM coach_registry WHERE email=?').bind(email).first();return registered?user:null;}
