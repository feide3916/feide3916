import {redirect} from 'next/navigation';
import AuthForm from '../auth-form';
import {getCoachUser} from '../coach-access';
import {db} from '../runtime';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{error?:string;updated?:string;basic?:string}>}){
 const user=await getCoachUser();if(!user)redirect('/login');const q=await searchParams;
 const isAdmin=user.email===process.env.COACH_OWNER_EMAIL?.toLowerCase();
 const shared=await db.prepare("SELECT a.id,a.name,m.role FROM coach_members m JOIN coach_accounts a ON a.id=m.owner WHERE m.email=? AND m.role IN ('viewer','editor') ORDER BY a.name").bind(user.email).all<{id:string;name:string;role:string}>();
 return <AuthForm mode="password" basic={q.basic==='1'} initialNotice={q.updated==='1'?'密码已修改成功。':typeof q.error==='string'?q.error.slice(0,300):''} account={{name:user.displayName,email:user.email,isAdmin,personal:user.userId,shared:shared.results}}/>;
}
