import type {PlanItem} from './plan-templates';
export type DropPosition={group:string;id?:string;after?:boolean};
export function reorderPlanItems(items:PlanItem[],id:string,target:DropPosition){
 const moving=items.find(i=>i.id===id);if(!moving||target.id===id)return items;
 const rest=items.filter(i=>i.id!==id);let index=target.id?rest.findIndex(i=>i.id===target.id):-1;
 if(target.id&&index<0)return items;
 if(index>=0){if(target.after)index++;}else{const last=rest.findLastIndex(i=>i.group===target.group);index=last<0?rest.length:last+1;}
 rest.splice(index,0,{...moving,group:target.group});return rest;
}
export function planDropAtPosition(items:PlanItem[],id:string,group:string,position:number):DropPosition{const others=items.filter(i=>i.id!==id&&i.group===group),index=Math.max(0,Math.min(others.length,position-1));return {group,id:others[index]?.id,after:false};}
