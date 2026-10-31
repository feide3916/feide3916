import type {PlanItem,PlanSet} from './plan-templates';
export function groupSetCount(items:PlanItem[],group:string,configured?:Record<string,number>){
 const explicit=configured?.[group];if(typeof explicit==='number'&&Number.isInteger(explicit)&&explicit>=1&&explicit<=30)return explicit;
 const counts=[...new Set(items.filter(i=>i.group===group).map(i=>i.sets.length))];
 return counts.length===1&&counts[0]>=1?counts[0]:counts.length?0:2;
}
export function resizeGroupSets(items:PlanItem[],group:string,count:number,emptySet:()=>PlanSet){
 if(!Number.isInteger(count)||count<1||count>30)return items;
 return items.map(i=>i.group!==group?i:{...i,sets:Array.from({length:count},(_,n)=>i.sets[n]||{...(i.sets.at(-1)||emptySet()),actualReps:'',actualLoad:'',actualSpeed:'',actualPower:'',actualNote:''})});
}
export function removedSetHasData(items:PlanItem[],group:string,count:number){
 return items.some(i=>i.group===group&&i.sets.slice(count).some(row=>Object.entries(row).some(([key,value])=>key==='reps'?!!String(value||'').trim()&&String(value).trim()!=='5':!!String(value||'').trim())));
}
