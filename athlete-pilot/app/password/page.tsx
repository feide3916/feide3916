import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{error?:string;basic?:string}>}){const q=await searchParams;const p=new URLSearchParams();if(q.error)p.set('error',q.error);if(q.basic==='1')p.set('basic','1');redirect('/account'+(p.size?'?'+p:''));}
