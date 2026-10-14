// Keep the deadline active through response-body parsing, not only response headers.
export async function requestJSON<T>(url:string,options:RequestInit={},timeoutMs=30000,messages:{timeout?:string;invalid?:string}={}):Promise<{response:Response;value:T}>{
 const controller=new AbortController();
 let timer:ReturnType<typeof setTimeout>;
 const timeout=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error(messages.timeout||'云端请求超时，尚未确认保存；当前草稿仍保留。请先同步云端，再重试保存。'));},timeoutMs);});
 try{return await Promise.race([timeout,(async()=>{const response=await fetch(url,{...options,credentials:'same-origin',signal:controller.signal});let value:T;try{value=await response.json();}catch{throw new Error(messages.invalid||'云端没有返回有效数据，当前草稿仍保留，请稍后重试。');}return {response,value};})()]);}
 finally{clearTimeout(timer!);}
}
