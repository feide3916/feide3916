import Studio from './studio';
import {getCoachUser} from './coach-access';
import {requireChatGPTUser} from './chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Home(){await requireChatGPTUser('/');if(!await getCoachUser())return <main className="intake-public"><section className="card"><h1>需要教练授权</h1><p>此账号尚未获准进入教练工作台。请联系工作台主人。填写问卷请打开教练发送的专用链接。</p></section></main>;return <Studio/>;}
