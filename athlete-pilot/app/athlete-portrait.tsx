'use client';
import {useState} from 'react';
import {Activity,ArrowDownRight,ArrowUpRight,Minus,Plus,Upload,ChartNoAxesCombined} from 'lucide-react';
import {ResponsiveContainer,LineChart,Line,CartesianGrid,XAxis,YAxis,Tooltip} from 'recharts';
import {metricSeries,metricChange,formatMetric,signedMetric,type Measurement} from './athlete-metrics';

type Props={tests:Measurement[];completed:number;demo?:boolean;onRecord:()=>void;onImport:()=>void};
export default function AthletePortrait({tests,completed,demo,onRecord,onImport}:Props){
  const [selected,setSelected]=useState(''),[range,setRange]=useState('all');
  const series=metricSeries(tests),active=series.find(s=>s.key===selected)||series.reduce((best,s)=>s.records.length>best.records.length?s:best,series[0]);
  const latestDate=series.flatMap(s=>s.records).map(r=>r.date).sort().at(-1);
  const now=new Date(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())+'T00:00:00Z').getTime();
  const cutoff=range==='all'?-Infinity:now-Number(range)*86400000;
  const visible=active?.records.filter(r=>Date.parse(r.date+'T00:00:00Z')>=cutoff)||[];
  const last=active?.records.at(-1),first=active?.records[0],previous=active?.records.at(-2);
  const chartData=visible.map(r=>({...r,time:Date.parse(r.date+'T00:00:00Z')}));
  const delta=last&&first?metricChange(last.value,first.value):null;
  const unit=active?.unit||'';
  return <section className="portrait" aria-label="运动员数据画像">
    <header className="portrait-heading"><div><span className="portrait-eyebrow">ATHLETE PROFILE</span><h2>身体与表现</h2><p>把每次测量连起来，看到运动员的变化。{demo&&<span className="portrait-demo">示例运动员</span>}</p></div><div className="actions"><button onClick={onImport}><Upload size={16}/>导入 CSV</button><button className="primary" onClick={onRecord}><Plus size={16}/>录入指标</button></div></header>
    <div className="portrait-stats"><div><Activity size={18}/><span>追踪指标</span><strong>{series.length}<small>项</small></strong></div><div><ChartNoAxesCombined size={18}/><span>测量记录</span><strong>{series.reduce((n,s)=>n+s.records.length,0)}<small>条</small></strong></div><div><span>已完成训练</span><strong>{completed}<small>节</small></strong></div><div><span>最近一次测量</span><strong className="portrait-date">{latestDate||'等待录入'}</strong></div></div>
    {!series.length?<div className="portrait-empty"><div className="portrait-empty-icon"><ChartNoAxesCombined size={32}/></div><h3>从第一次测量开始建立画像</h3><p>身高、体重、跳跃、力量、速度……<br/>录入或导入后，最新数值和变化趋势会显示在这里。</p><button onClick={onRecord}>录入第一条指标</button></div>:<>
      <div className="metric-cards" aria-label="最新指标">{series.map(s=>{const latest=s.records.at(-1)!,baseline=s.records[0],change=metricChange(latest.value,baseline.value),Icon=change.absolute>0?ArrowUpRight:change.absolute<0?ArrowDownRight:Minus;return <button key={s.key} className={`metric-card ${active?.key===s.key?'selected':''}`} aria-pressed={active?.key===s.key} onClick={()=>setSelected(s.key)}><div className="metric-card-top"><span>{s.metric}</span><Icon size={18}/></div><strong>{formatMetric(latest.value)}<small>{s.unit}</small></strong><div className="metric-card-change">{s.records.length>1?<><b>{signedMetric(change.absolute)} {s.unit}</b><span>较首次</span></>:<span>首次测量 · 等待下一次记录</span>}</div><footer><span>{s.source}</span><time>{latest.date}</time></footer></button>;})}</div>
      <section className="metric-trend card"><div className="sectiontools"><div><h2>指标变化</h2><p className="muted">相同指标、单位和来源单独追踪，保留每一次测量。</p></div><div className="trend-controls"><label>选择指标<select aria-label="趋势指标" value={active.key} onChange={e=>setSelected(e.target.value)}>{series.map(s=><option key={s.key} value={s.key}>{s.metric}{s.unit?`（${s.unit}）`:''} · {s.source}</option>)}</select></label><div className="trend-range" role="group" aria-label="趋势时间范围">{[['90','近 90 天'],['365','近一年'],['all','全部']].map(([value,label])=><button key={value} aria-pressed={range===value} className={range===value?'active':''} onClick={()=>setRange(value)}>{label}</button>)}</div></div></div>
        <div className="trend-summary"><div><span>最新测量</span><strong>{formatMetric(last!.value)}<small>{unit}</small></strong><time>{last!.date}</time></div><div><span>较上次</span><strong>{previous?signedMetric(last!.value-previous.value):'—'}<small>{previous?unit:''}</small></strong><time>{previous?previous.date:'尚无上次记录'}</time></div><div><span>较首次</span><strong>{active.records.length>1?`${delta!.percent===null?'—':signedMetric(delta!.percent)+'%'}`:'—'}</strong><time>{active.records.length>1?`${signedMetric(delta!.absolute)} ${unit} · ${first!.date}`:'尚无变化记录'}</time></div></div>
        {visible.length>1?<div className="trend-chart" role="img" aria-label={`${active.metric}趋势：${visible.map(r=>`${r.date} ${r.value}${unit}`).join('，')}`}><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{top:12,right:22,left:0,bottom:12}}><CartesianGrid stroke="#e5eaf5" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="time" type="number" domain={['dataMin','dataMax']} tickFormatter={t=>new Date(t).toISOString().slice(5,10)} tick={{fontSize:12,fill:'#6c7892'}} axisLine={false} tickLine={false} minTickGap={34}/><YAxis domain={['auto','auto']} tickFormatter={formatMetric} tick={{fontSize:12,fill:'#6c7892'}} axisLine={false} tickLine={false} width={60}/><Tooltip labelFormatter={t=>new Date(Number(t)).toISOString().slice(0,10)} formatter={value=>[`${formatMetric(Number(value))} ${unit}`,active.metric]} contentStyle={{borderRadius:9,border:'1px solid #dfe5f2',fontSize:14}}/><Line type="linear" dataKey="value" stroke="#5260e8" strokeWidth={3} dot={{r:4,fill:'#fff',strokeWidth:2}} activeDot={{r:6}} isAnimationActive={false}/></LineChart></ResponsiveContainer></div>:<div className="trend-placeholder"><Activity size={25}/><p>{visible.length?'只有一次测量，再录入一次就能看到趋势。':'这段时间没有测量记录。可以切换到“全部”。'}</p></div>}
        <p className="trend-note">数值上升或下降仅表示变化方向，具体意义结合测试项目和教练分析判断。</p>
        <details className="metric-records"><summary>查看测量明细 · {visible.length} 条</summary><div className="tablewrap"><table><thead><tr><th>日期</th><th>数值{unit?`（${unit}）`:''}</th><th>来源</th></tr></thead><tbody>{[...visible].reverse().map(r=><tr key={r.id}><td>{r.date}</td><td>{formatMetric(r.value)}</td><td>{r.source||'未填写来源'}</td></tr>)}</tbody></table></div></details>
      </section>
    </>}
  </section>;
}
