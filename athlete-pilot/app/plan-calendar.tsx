'use client';
import {useRef,useState} from 'react';
import {CalendarDays,ChevronLeft,ChevronRight} from 'lucide-react';
type Session={id:string;date:string;title:string;status:string};
export default function PlanCalendar({date,sessions,onSelect}:{date:string;sessions:Session[];onSelect:(date:string,id?:string)=>void}){
 const [month,setMonth]=useState(date.slice(0,7));const root=useRef<HTMLDetailsElement>(null);
 const count=sessions.filter(s=>s.date===date).length;
 const [year,m]=month.split('-').map(Number);const first=new Date(Date.UTC(year,m-1,1));const offset=(first.getUTCDay()+6)%7;const length=new Date(Date.UTC(year,m,0)).getUTCDate();
 const dates=new Map<string,Session[]>();for(const s of sessions)dates.set(s.date,[...(dates.get(s.date)||[]),s]);
 function move(n:number){const d=new Date(Date.UTC(year,m-1+n,1));setMonth(d.toISOString().slice(0,7));}
 function select(d:string,id?:string){onSelect(d,id);if(root.current)root.current.open=false;}
 return <details ref={root} className="plan-calendar" onToggle={e=>{if(e.currentTarget.open)setMonth(date.slice(0,7));}}><summary aria-label="查看有计划的日期"><CalendarDays size={16}/><b>{date.replaceAll('-','/')}</b><span>{count?` · ${count} 节计划`:' · 无计划'}</span></summary><section className="plan-calendar-popup" aria-label="训练计划日历"><header><button aria-label="上个月" onClick={()=>move(-1)}><ChevronLeft size={16}/></button><strong>{year} 年 {m} 月</strong><button aria-label="下个月" onClick={()=>move(1)}><ChevronRight size={16}/></button></header><div className="plan-calendar-grid">{['一','二','三','四','五','六','日'].map(d=><span key={d}>{d}</span>)}{Array.from({length:offset},(_,n)=><span key={`blank${n}`}/>)}{Array.from({length},(_,n)=>{const d=`${month}-${String(n+1).padStart(2,'0')}`,plans=dates.get(d)||[];return <button key={d} className={`${d===date?'calendar-selected':''} ${plans.length?'has-plans':''}`} aria-label={`${d}${plans.length?`，有${plans.length}节计划`:'，暂无计划'}`} aria-pressed={d===date} title={plans.map(s=>s.title).join('、')} onClick={()=>select(d,plans[0]?.id)}><b>{n+1}</b><small>{plans.length?'●':''}</small></button>;})}</div><p className="calendar-legend"><i/> 有计划 · 同一天多节课可在“当天课程”切换</p><div className="calendar-recent"><strong>最近保存的计划</strong>{sessions.length?sessions.slice(0,5).map(s=><button key={s.id} onClick={()=>select(s.date,s.id)}><span>{s.date}</span><b>{s.title}</b><small>{s.status}</small></button>):<p>这位运动员还没有已保存计划。</p>}</div></section></details>;
}
