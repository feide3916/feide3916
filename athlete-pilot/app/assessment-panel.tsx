'use client';
import {useState} from 'react';
import {Upload,X} from 'lucide-react';
import {readAssessmentFile} from './assessment-import';
import {shownMeasures,type Assessment,type ImportedAssessment} from './assessment-model';
import {formatMetric} from './athlete-metrics';
import type {SyncAthlete} from './assessment-sync';

type Props={athletes:SyncAthlete[];records:Assessment[];busy:boolean;canImport:()=>boolean;onCommit:(records:ImportedAssessment[],targets:Record<string,string>,replace:boolean)=>Promise<boolean>};
export default function AssessmentPanel({athletes,records,busy,canImport,onCommit}:Props){
  const [pending,setPending]=useState<ImportedAssessment[]>([]),[targets,setTargets]=useState<Record<string,string>>({}),[error,setError]=useState(''),[reading,setReading]=useState(false),[replace,setReplace]=useState(false),[selected,setSelected]=useState('');
  const ordered=[...records].sort((a,b)=>b.date.localeCompare(a.date));
  const active=ordered.find(r=>r.id===selected)||ordered[0];
  async function read(file:File){
    setReading(true);setError('');
    try{const imported=await readAssessmentFile(file);const mapping:Record<string,string>={};
      for(const record of imported){const matches=athletes.filter(a=>a.name.trim()===record.name&&!a.demo);mapping[record.id]=matches.length===1?matches[0].id:matches.length===0?'new':'';}
      setPending(imported);setTargets(mapping);setReplace(false);
    }catch(e){setError(e instanceof Error?e.message:'读取失败，请检查文件。');}finally{setReading(false);}
  }
  return <section className="card assessment-panel" aria-label="Excel 测评档案">
    <div className="sectiontools"><div><h2>测评档案</h2><p className="muted">导入体测 Excel，每次评估按日期保留在运动员档案中。</p></div>
      <label className={`upload ${busy||reading?'disabled':''}`}><Upload size={16}/>{reading?'读取中…':'导入体测 Excel'}<input aria-label="导入体测 Excel" type="file" accept=".xlsx" disabled={busy||reading} onClick={e=>{if(!canImport())e.preventDefault();}} onChange={e=>{const f=e.target.files?.[0];e.target.value='';if(f)void read(f);}}/></label>
    </div>
    {error&&<p role="alert" className="assessment-error">{error}</p>}
    {active?<>
      <label className="assessment-date">评估日期<select aria-label="查看评估日期" value={active.id} onChange={e=>setSelected(e.target.value)}>{ordered.map(r=><option key={r.id} value={r.id}>{r.date} · {r.measurements.length} 项</option>)}</select></label>
      <div className="assessment-meta"><span>运动项目：{active.sport||'未填写'}</span><span>本次目标：{active.goal||'未填写'}</span><span>{active.sourceFile}</span></div>
      <div className="assessment-values">{shownMeasures(active).map(m=><div key={m.key}><span>{m.name}</span><strong>{formatMetric(m.value)}<small>{m.unit}</small></strong></div>)}</div>
      {!!Object.keys(active.ratings).length&&<div className="assessment-ratings">{Object.entries(active.ratings).map(([key,value])=><span key={key} data-rating={value}>{({cmj:'CMJ 跳跃',sj:'SJ 跳跃',coordination:'全身协调',elastic:'下肢弹性与衔接',strength:'基础力量',direction:'5-10-5 变向',composition:'体成分',ankle:'脚踝活动度',knee:'膝屈曲活动度',pattern:'动作模式'} as Record<string,string>)[key]||key}：{value}</span>)}</div>}
      {active.observations&&<p className="assessment-note"><strong>现场观察：</strong>{active.observations}</p>}
      {active.training&&<p className="assessment-note"><strong>本次训练建议：</strong>{active.training}</p>}
    </>:<p className="muted">尚无导入的测评。导入后可查看身体数据、测试结果、现场观察与训练建议；下方保留手工指标和趋势。</p>}
    <p className="muted">Excel 修改后重新导入即可更新；不会自动监测电脑上的文件变化。</p>
    {pending.length>0&&<div className="overlay"><section className="modal assessment-import-modal" role="dialog" aria-modal="true" aria-label="确认体测导入">
      <div className="sectiontools"><h2>确认体测导入</h2><button disabled={busy} aria-label="取消体测导入" onClick={()=>setPending([])}><X size={18}/></button></div>
      <p className="muted">核对每条记录归属。缺测项目留空，不自动评分；同名学员请手动确认。</p>
      {pending.map(r=><article className="assessment-import-entry" key={r.id}>
        <strong>{r.name} · {r.date}</strong><label>保存到哪个运动员<select aria-label={`${r.name} ${r.date}对应运动员`} value={targets[r.id]||''} onChange={e=>setTargets({...targets,[r.id]:e.target.value})}><option value="">请选择运动员</option><option value="new">新建档案：{r.name}</option>{athletes.filter(a=>!a.demo).map(a=><option key={a.id} value={a.id}>{a.name} · {a.sport||'未填项目'} · {a.id.slice(0,8)}</option>)}</select></label>
        <div className="assessment-preview">{r.measurements.map(m=><span key={m.key}>{m.name}：{formatMetric(m.value)} {m.unit}</span>)}</div>
        {r.observations&&<p>现场观察：{r.observations}</p>}
      </article>)}
      <label className="assessment-replace"><input type="checkbox" checked={replace} onChange={e=>setReplace(e.target.checked)}/>替换所选学员同日的已导入评估（手工指标和训练计划不变）</label>
      <p className="muted">重复文件会跳过；未勾选替换时，同日已有导入记录也会跳过。</p>
      <button className="primary" disabled={busy||pending.some(r=>!targets[r.id])} onClick={async()=>{try{if(await onCommit(pending,targets,replace))setPending([]);}catch(e){setError(e instanceof Error?e.message:'保存失败');}}}>{busy?'保存中…':`确认并保存 ${pending.length} 条评估`}</button>
    </section></div>}
  </section>;
}
