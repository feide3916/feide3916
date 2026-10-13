import AuthForm from '../auth-form';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{error?:string;token?:string;basic?:string}>}){const query=await searchParams;return <AuthForm mode="password" basic={query.basic==='1'} initialNotice={typeof query.error==='string'?query.error.slice(0,300):''}/>;}
