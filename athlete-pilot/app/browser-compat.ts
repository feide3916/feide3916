// Stored training state contains JSON values only. Keep older browsers able to
// initialize without weakening authentication or generating IDs with Math.random.
export function ensureBrowserCompat(){
 if(typeof globalThis.structuredClone!=='function')globalThis.structuredClone=<T>(value:T):T=>JSON.parse(JSON.stringify(value));
 if(typeof globalThis.crypto.randomUUID!=='function')Object.defineProperty(globalThis.crypto,'randomUUID',{value:()=>{const bytes=new Uint8Array(16);globalThis.crypto.getRandomValues(bytes);bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;},configurable:true});
 if(typeof Object.hasOwn!=='function')Object.defineProperty(Object,'hasOwn',{value:(object:object,key:PropertyKey)=>Object.prototype.hasOwnProperty.call(object,key),configurable:true});
 if(typeof Array.prototype.at!=='function')Object.defineProperty(Array.prototype,'at',{value:function(index:number){const n=Number(index)||0;const i=n<0?Math.ceil(n):Math.floor(n);return this[i<0?this.length+i:i];},configurable:true,writable:true});
}
