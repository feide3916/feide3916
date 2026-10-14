import WorkspaceHome from '../workspace-home';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<{workspace?:string}>}){return WorkspaceHome({searchParams,coachEntry:true});}
