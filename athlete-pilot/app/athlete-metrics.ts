export type Measurement = {id:string;athlete:string;date:string;metric:string;value:number;unit:string;source:string};
export type MetricSeries = {key:string;metric:string;unit:string;source:string;records:Measurement[]};

export function metricSeries(records:Measurement[]):MetricSeries[]{
  const groups=new Map<string,MetricSeries>();
  for(const record of records){
    if(!Number.isFinite(record.value)||!record.metric.trim()||!validMeasurementDate(record.date))continue;
    const metric=record.metric.trim(),unit=record.unit.trim(),source=record.source.trim()||'未填写来源';
    const key=JSON.stringify([metric,unit,source]);
    if(!groups.has(key))groups.set(key,{key,metric,unit,source,records:[]});
    groups.get(key)!.records.push(record);
  }
  return [...groups.values()].map(s=>({...s,records:s.records.sort((a,b)=>a.date.localeCompare(b.date))})).sort((a,b)=>a.metric.localeCompare(b.metric,'zh-CN')||a.unit.localeCompare(b.unit)||a.source.localeCompare(b.source));
}

export function validMeasurementDate(date:string){
  return /^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(date+'T00:00:00Z'))&&new Date(date+'T00:00:00Z').toISOString().slice(0,10)===date;
}
export function metricChange(current:number,baseline:number){
  const absolute=current-baseline;
  return {absolute,percent:baseline===0?null:absolute/Math.abs(baseline)*100};
}
export function formatMetric(value:number){return new Intl.NumberFormat('zh-CN',{maximumFractionDigits:3}).format(value);}
export function signedMetric(value:number){return `${value>0?'+':''}${formatMetric(value)}`;}
