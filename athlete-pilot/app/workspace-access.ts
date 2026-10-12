import {env} from './runtime';
import {getCoachUser} from './coach-access';
import {workspaceRole} from './team-access';
export async function resolveWorkspace(req:Request){const user=await getCoachUser();if(!user)return null;const owner=new URL(req.url).searchParams.get('workspace')||user.userId;const member=owner===user.userId?null:await env.DB!.prepare('SELECT role FROM coach_members WHERE owner = ? AND email = ?').bind(owner,user.email.trim().toLowerCase()).first<{role:string}>();const role=workspaceRole(user.userId,owner,member?.role);return role?{user,owner,role}:null;}
