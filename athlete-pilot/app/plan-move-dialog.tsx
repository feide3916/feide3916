'use client';
import {useState} from 'react';
import {X} from 'lucide-react';
import type {PlanItem} from './plan-templates';
import {compareGroups} from './training-groups';
import {planDropAtPosition,type DropPosition} from './plan-order';
export default function PlanMoveDialog({item,items,groups,busy,onClose,onMove}:{item:PlanItem;items:PlanItem[];groups:string[];busy:boolean;onClose:()=>void;onMove:(target:DropPosition)=>void}){
 const [group,setGroup]=useState(item.group),[position,setPosition]=useState(items.filter(i=>i.group===item.group).findIndex(i=>i.id===item.id)+1);const others=items.filter(i=>i.id!==item.id&&i.group===group);const index=Math.min(position,others.length+1);return <div className="overlay"><section className="modal" role="dialog" aria-modal="true" aria-label="移动动作"><div className="sectiontools"><h2>移动动作</h2><button aria-label="关闭移动动作" onClick={onClose}><X size={18}/></button></div><p>{item.exercise}</p><div className="move-position-fields"><label>目标分组<select aria-label="目标分组" value={group} onChange={e=>{setGroup(e.target.value);setPosition(1);}}>{[...new Set([...groups,'A','B','C','D','E','F',...items.map(i=>i.group)])].sort(compareGroups).map(g=><option key={g} value={g}>{g} 项</option>)}</select></label><label>目标位置<select aria-label="目标位置" value={index} onChange={e=>setPosition(Number(e.target.value))}>{Array.from({length:others.length+1},(_,n)=><option key={n} value={n+1}>{group}{n+1}{others[n]?` · 放在 ${others[n].exercise} 前面`:' · 放在组末尾'}</option>)}</select></label></div><p className="muted">移动为 {group}{index}，后面的动作自动顺延。组数、重量和备注会一起保留。</p><button className="primary" disabled={busy} onClick={()=>onMove(planDropAtPosition(items,item.id,group,index))}>移到 {group}{index}</button></section></div>;
}
