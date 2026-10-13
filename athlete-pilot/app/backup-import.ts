import {createHash} from 'node:crypto';
import {collections,equal,validState} from './state-merge';
export const archiveColumns={
  coach_plan_history:['id','owner','athlete','plan','revision','saved_at'],
  coach_handoffs:['id','owner','athlete','author','body','created_at'],
  coach_intake_links:['id','owner','athlete','kind','token_hash','expires_at','revoked','used_at','created_at'],
  coach_intake_responses:['id','owner','athlete','kind','answers','source','created_at'],
  coach_reports:['id','owner','athlete','snapshot','created_at'],
} as const;
const digest=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
export function prepareImport(current:any,backup:any,owner:string){
  const incoming=backup.format==='athlete-backup-v1'?backup.data:backup;
  if(!validState(incoming))throw Error('这不是有效的训练工作台备份');
  if(current&&!validState(current))throw Error('当前工作台数据异常，请先导出备份');
  const merged=current?structuredClone(current):{athletes:[],sessions:[],tests:[],templates:[],assessments:[],exercises:[]};
  const maps:Record<string,Map<string,string>>={};let added=0,copies=0;
  for(const key of collections){
    maps[key]=new Map();merged[key]??=[];
    for(const original of incoming[key]||[]){
      const value=structuredClone(original);
      if(key!=='athletes'&&typeof value.athlete==='string')value.athlete=maps.athletes.get(value.athlete)||value.athlete;
      const same=merged[key].find((r:any)=>r.id===value.id);
      if(same&&equal(same,value)){maps[key].set(original.id,value.id);continue;}
      if(same){value.id='import-'+digest([key,original.id,value]);copies++;if(key==='athletes'&&value.name)value.name+=' · 迁入副本';if(key==='sessions'&&value.title)value.title+=' · 迁入副本';}
      maps[key].set(original.id,value.id);
      if(!merged[key].some((r:any)=>r.id===value.id)){merged[key].push(value);added++;}
    }
  }
  merged.exercises=[...new Set([...merged.exercises,...incoming.exercises])];
  if(JSON.stringify(merged).length>2000000)throw Error('合并后数据超过保存容量，请分批迁入');
  const archives:{table:keyof typeof archiveColumns;originalId:string;values:any[]}[]=[];
  if(backup.records){
    if(typeof backup.records!=='object'||Array.isArray(backup.records))throw Error('历史归档格式有误');
    for(const [table,rows] of Object.entries(backup.records)){
      if(!Object.hasOwn(archiveColumns,table)||!Array.isArray(rows))throw Error('备份含不支持的归档类型');
      const columns=archiveColumns[table as keyof typeof archiveColumns];
      for(const raw of rows){
        if(!raw||typeof raw!=='object'||!columns.every(c=>Object.hasOwn(raw,c)))throw Error('历史归档记录不完整');
        const row:Record<string,any>={...raw,id:'import-'+digest([owner,table,raw]),owner,athlete:maps.athletes.get(raw.athlete)||raw.athlete};
        for(const c of columns){if(c==='revision'||c==='revoked'){if(!Number.isSafeInteger(row[c])||row[c]<0)throw Error('历史归档数值格式有误');}else if(c==='used_at'&&row[c]===null){}else if(typeof row[c]!=='string')throw Error('历史归档字段格式有误');}
        if(table==='coach_plan_history'){const plan=JSON.parse(row.plan);if(!plan||typeof plan.id!=='string')throw Error('历史计划格式有误');plan.id=maps.sessions.get(plan.id)||plan.id;plan.athlete=row.athlete;row.plan=JSON.stringify(plan);}
        if(table==='coach_reports'){const snapshot=JSON.parse(row.snapshot);if(snapshot.assessment){snapshot.assessment.id=maps.assessments.get(snapshot.assessment.id)||snapshot.assessment.id;snapshot.assessment.athlete=row.athlete;}row.snapshot=JSON.stringify(snapshot);}
        if(table==='coach_intake_responses')JSON.parse(row.answers);
        // Restoring an archive must never reactivate a previously distributed form link.
        if(table==='coach_intake_links')row.revoked=1;
        archives.push({table:table as keyof typeof archiveColumns,originalId:raw.id,values:columns.map(c=>row[c])});
      }
    }
  }
  return {data:merged,archives,added,copies};
}
