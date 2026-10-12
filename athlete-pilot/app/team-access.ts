export type WorkspaceRole='owner'|'editor'|'viewer';
export function workspaceRole(userId:string,owner:string,membership?:string|null):WorkspaceRole|null{if(userId===owner)return 'owner';return membership==='editor'||membership==='viewer'?membership:null;}
export const canWriteWorkspace=(role:WorkspaceRole|null)=>role==='owner'||role==='editor';
