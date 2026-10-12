'use client';
import {useRef,useState} from 'react';
import {GripVertical} from 'lucide-react';
import type {DropPosition} from './plan-order';
type Props={id:string;name:string;disabled:boolean;onHover:(target:DropPosition|null)=>void;onDrop:(target:DropPosition)=>void;onStep:(delta:number)=>void};
export default function PlanDragHandle({id,name,disabled,onHover,onDrop,onStep}:Props){
 const start=useRef<{x:number;y:number;moved:boolean}|null>(null),position=useRef<DropPosition|null>(null);const [dragging,setDragging]=useState(false);
 function hit(x:number,y:number){const element=document.elementFromPoint(x,y)?.closest<HTMLElement>('[data-plan-drop]');if(!element)return null;const targetId=element.dataset.planId;if(targetId===id)return null;const box=element.getBoundingClientRect();return {group:element.dataset.planDrop!,id:targetId,after:!!targetId&&y>box.top+box.height/2};}
 function clear(){start.current=null;position.current=null;setDragging(false);onHover(null);}
 return <button type="button" className={`plan-drag-handle ${dragging?'dragging':''}`} aria-label={`拖动${name}调整顺序`} title="按住拖动；也可用上下方向键排序" disabled={disabled} onClick={e=>{e.preventDefault();e.stopPropagation();}} onKeyDown={e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();e.stopPropagation();onStep(e.key==='ArrowUp'?-1:1);}}} onPointerDown={e=>{if(disabled||e.button!==0)return;e.preventDefault();e.stopPropagation();start.current={x:e.clientX,y:e.clientY,moved:false};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{const state=start.current;if(!state)return;if(!state.moved&&Math.hypot(e.clientX-state.x,e.clientY-state.y)<5)return;state.moved=true;setDragging(true);const target=hit(e.clientX,e.clientY);position.current=target;onHover(target);if(e.clientY<70)window.scrollBy(0,-14);else if(e.clientY>window.innerHeight-70)window.scrollBy(0,14);}} onPointerUp={e=>{if(!start.current)return;const moved=start.current.moved,target=position.current;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);clear();if(moved&&target)onDrop(target);}} onPointerCancel={clear}><GripVertical size={17}/></button>;
}
