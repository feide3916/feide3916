'use client';
import {useEffect,useId,useMemo,useRef,useState} from 'react';
import {Search,ChevronDown} from 'lucide-react';
import {exerciseIndex,exerciseMatches,sortedExercises} from './exercise-search';
type Props={options:string[];label:string;value?:string;placeholder?:string;onSelect:(value:string)=>void;onCreate?:(value:string)=>Promise<boolean>;disabled?:boolean};
export default function ExercisePicker({options,label,value='',placeholder='输入名称 / 拼音首字母…',onSelect,onCreate,disabled=false}:Props){
 const [text,setText]=useState(value),[open,setOpen]=useState(false),[active,setActive]=useState(0),[composing,setComposing]=useState(false),[creating,setCreating]=useState(false);
 const root=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null),id=useId();
 useEffect(()=>{setText(value);},[value]);
 const indexed=useMemo(()=>sortedExercises(options).map(exerciseIndex),[options]);
 const results=indexed.filter(e=>exerciseMatches(e.name,text));
 const canCreate=!!onCreate&&!!text.trim()&&!options.some(name=>name.trim().toLocaleLowerCase()===text.trim().toLocaleLowerCase());
 async function create(){const name=text.trim();if(!name||!onCreate||creating)return;setCreating(true);try{if(await onCreate(name))choose(name);}finally{setCreating(false);}}
 function choose(name:string){onSelect(name);setText(value?name:'');setOpen(false);setActive(0);}
 useEffect(()=>{if(open)root.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({block:'nearest'});},[active,open]);
 return <div ref={root} className={`exercise-picker ${open?'picker-open':''}`} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget)){setOpen(false);setText(value);}}}>
  <Search size={15} className="picker-searchicon"/>
  <input ref={input} aria-label={label} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-list`} aria-activedescendant={open&&results[active]?`${id}-${active}`:undefined} disabled={disabled||creating} autoComplete="off" value={text} placeholder={placeholder} onFocus={()=>{setOpen(true);setActive(0);}} onChange={e=>{setText(e.target.value);setActive(0);setOpen(true);}} onCompositionStart={()=>setComposing(true)} onCompositionEnd={()=>setComposing(false)} onKeyDown={e=>{if(composing||e.nativeEvent.isComposing)return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!open){setOpen(true);setActive(0);}else setActive(n=>results.length?(n+(e.key==='ArrowDown'?1:-1)+results.length)%results.length:0);}else if(e.key==='Enter'&&open){e.preventDefault();if(results[active])choose(results[active].name);else if(canCreate)void create();}else if(e.key==='Escape'){e.preventDefault();setOpen(false);setText(value);}}}/>
  <button className="picker-toggle" aria-label={`打开${label}候选`} type="button" disabled={disabled||creating} onMouseDown={e=>e.preventDefault()} onClick={()=>{if(open)setOpen(false);else{setText('');setActive(0);setOpen(true);input.current?.focus();}}}><ChevronDown size={14}/></button>
  {open&&<div className="picker-popup"><div className="picker-hint">名称 / 拼音首字母 · 按 A–Z 排列</div><div id={`${id}-list`} role="listbox" aria-label={`${label}候选`} className="picker-options">{results.map((e,n)=><button key={e.name} id={`${id}-${n}`} role="option" aria-selected={n===active} tabIndex={-1} onMouseDown={event=>event.preventDefault()} onMouseEnter={()=>setActive(n)} onClick={()=>choose(e.name)}><span className="picker-letter">{e.key[0]?.toUpperCase()||'#'}</span><span>{e.name}</span><small>{e.initials}</small></button>)}{canCreate&&<button className="picker-create" role="option" aria-selected={!results.length} disabled={creating} onMouseDown={e=>e.preventDefault()} onClick={()=>void create()}><span className="picker-letter">＋</span><span>{creating?'正在新增…':`新增“${text.trim()}”并使用`}</span></button>}{!results.length&&!canCreate&&<div className="picker-empty" role="status">输入名称选择或新增动作</div>}</div><div className="picker-help">↑ ↓ 选择 · 回车确认</div></div>}
 </div>;
}
