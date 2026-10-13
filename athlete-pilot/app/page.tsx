import Studio from './studio';
import {getCoachUser} from './coach-access';
import {requireChatGPTUser} from './chatgpt-auth';
import {db} from './runtime';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Home({searchParams}:{searchParams:Promise<{workspace?:string}>}){await requireChatGPTUser('/');const user=await getCoachUser();if(!user)return <main className="intake-public"><section className="card"><h1>需要教练授权</h1><p>此账号尚未获准进入教练工作台。请联系工作台主人。填写问卷请打开教练发送的专用链接。</p></section></main>;if(!(await searchParams).workspace&&user.email!==process.env.COACH_OWNER_EMAIL?.toLowerCase()){const shared=await db.prepare("SELECT owner FROM coach_members WHERE email=? AND role IN ('viewer','editor') ORDER BY owner").bind(user.email).all<{owner:string}>();if(shared.results.length===1)redirect('/?workspace='+encodeURIComponent(shared.results[0].owner));}return <Studio/>;}
