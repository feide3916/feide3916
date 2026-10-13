import AuthForm from '../auth-form';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{error?:string;token?:string}>}){const query=await searchParams;return <AuthForm mode="setup" initialNotice={typeof query.error==='string'?query.error.slice(0,300):''} setupToken={typeof query.token==='string'?query.token:''}/>;}
